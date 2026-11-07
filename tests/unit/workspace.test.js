import test from "node:test";
import assert from "node:assert/strict";
import { emptyWorkspace, reduceWorkspace, serializeWorkspace, restoreWorkspace, previewCaseStage } from "../../src/domain/workspace.js";
import { evaluateCommission } from "../../src/domain/trade.js";
import { createCargoService } from "../../src/services/cargo.js";
import { quotePreviewParams } from "../../src/domain/quote.js";

const request = { id: "test-request", origin: "تهران", destination: "استانبول", goods: "کالای آزمایشی", originCountry: "iran", originCity: "tehran", destinationCountry: "turkey", destinationCity: "istanbul", scope: "export", mode: "road", password: "never-persist-this" };
function published() { let state = reduceWorkspace(emptyWorkspace(), { type: "request/save", role: "shipper", data: request }); return reduceWorkspace(state, { type: "request/publish", role: "shipper", id: request.id }); }
function accepted() { let state = reduceWorkspace(published(), { type: "offer/create", role: "driver", requestId: request.id, amount: "۲۵۰۰۰۰", message: "پیشنهاد آزمایشی" }); return reduceWorkspace(state, { type: "offer/accept", role: "shipper", id: state.offers[0].id }); }
test("workspace requests whitelist fields and publishing is idempotent", () => {
  const state = published(); assert.equal(state.requests[0].password, undefined);
  assert.equal(state.requests[0].status, "published"); assert.equal(state.notifications.length, 2);
  assert.equal(reduceWorkspace(state, { type: "request/publish", role: "shipper", id: request.id }), state);
  assert.throws(() => reduceWorkspace(state, { type: "request/publish", role: "driver", id: request.id }));
});
test("offers validate amount, prevent duplicates and preserve provenance", () => {
  let state = published();
  assert.throws(() => reduceWorkspace(state, { type: "offer/create", role: "driver", requestId: request.id, amount: "-1" }));
  state = reduceWorkspace(state, { type: "offer/create", role: "driver", requestId: request.id, amount: "۲۵۰۰۰۰" });
  assert.equal(state.offers[0].amount, 250000);
  assert.throws(() => reduceWorkspace(state, { type: "offer/create", role: "driver", requestId: request.id, amount: "12" }));
  const withdrawn = reduceWorkspace(state, { type: "offer/withdraw", role: "driver", id: state.offers[0].id });
  assert.equal(withdrawn.offers[0].status, "withdrawn");
});
test("accepting an offer creates a linked preview and blocks double acceptance", () => {
  const state = accepted(); assert.equal(state.connections[0].state, "accepted"); assert.equal(state.requests[0].status, "accepted");
  assert.equal(state.connections[0].requestId, request.id);
  assert.throws(() => reduceWorkspace(state, { type: "offer/accept", role: "shipper", id: state.offers[0].id }));
});
test("completion and settlement require each simulated party and never manufacture backend proof", () => {
  let state = accepted(); const id = state.connections[0].id;
  state = reduceWorkspace(state, { type: "connection/confirm", role: "shipper", id, kind: "complete" });
  assert.equal(state.connections[0].state, "accepted");
  assert.equal(reduceWorkspace(state, { type: "connection/confirm", role: "shipper", id, kind: "complete" }), state);
  assert.throws(() => reduceWorkspace(state, { type: "connection/confirm", role: "broker", id, kind: "complete" }));
  state = reduceWorkspace(state, { type: "connection/confirm", role: "driver", id, kind: "complete" });
  assert.equal(state.connections[0].state, "completed");
  for (const role of ["shipper", "driver"]) state = reduceWorkspace(state, { type: "connection/confirm", role, id, kind: "settle" });
  assert.equal(state.connections[0].state, "settled");
  assert.equal(evaluateCommission(state.connections[0], 100000, { model: "percentage", value: 2 }).status, "awaiting_verification");
});
function caseState() { return reduceWorkspace(emptyWorkspace(), { type: "case/save", role: "shipper", at: "2026-11-06T10:00:00Z", data: { id: "case-test", description: "شرح اختلاف آزمایشی درباره زمان آماده‌سازی محموله", respondentRole: "driver", attachmentMetadata: [{ name: "sample.pdf", size: 10, type: "application/pdf" }] } }); }
test("case notice can be simulated only from the responding view and has a distinct preview deadline", () => {
  let state = reduceWorkspace(caseState(), { type: "case/submit", role: "shipper", id: "case-test" });
  assert.throws(() => reduceWorkspace(state, { type: "case/acknowledge", role: "shipper", id: "case-test" }));
  state = reduceWorkspace(state, { type: "case/acknowledge", role: "driver", id: "case-test", at: "2026-11-06T10:00:00Z" });
  assert.equal(state.cases[0].previewDeadline, "2026-11-08T10:00:00.000Z");
  assert.equal(state.cases[0].responseDeadline, null); assert.equal(state.cases[0].notice, null);
  assert.equal(previewCaseStage(state.cases[0], Date.parse("2026-11-08T10:00:00Z")), "awaiting_review");
});
test("expired preview case routes to review without accepting a late reply or imposing a penalty", () => {
  let state = reduceWorkspace(caseState(), { type: "case/submit", role: "shipper", id: "case-test" });
  state = reduceWorkspace(state, { type: "case/acknowledge", role: "driver", id: "case-test", at: "2026-11-06T10:00:00Z" });
  assert.throws(() => reduceWorkspace(state, { type: "case/reply", role: "driver", id: "case-test", text: "پاسخ آزمایشی پس از پایان مهلت", at: "2026-11-08T11:00:00Z" }));
  assert.equal(state.cases[0].penalty, undefined);
  state = reduceWorkspace(state, { type: "case/reply", role: "driver", id: "case-test", text: "پاسخ آزمایشی در مهلت پاسخ", at: "2026-11-07T10:00:00Z" });
  assert.equal(state.cases[0].stage, "awaiting_review");
});
test("workspace serialization omits profile PII, case text and evidence metadata", () => {
  let state = caseState(); state = reduceWorkspace(state, { type: "profile/save", role: "shipper", data: { phone: "09121234567" } });
  const serialized = serializeWorkspace(state); const text = JSON.stringify(serialized);
  assert.equal(serialized.cases.length, 0); assert.deepEqual(serialized.profileDrafts, {});
  assert.ok(!text.includes("sample.pdf")); assert.ok(!text.includes("09121234567"));
  assert.deepEqual(restoreWorkspace({ version: 99 }), emptyWorkspace());
});
test("preview notifications are scoped to a role and marking all read leaves other roles intact", () => {
  const state = published(); const updated = reduceWorkspace(state, { type: "notification/read", role: "driver", id: "all" });
  assert.ok(updated.notifications.find((item) => item.recipientRole === "driver").read);
  assert.ok(!updated.notifications.find((item) => item.recipientRole === "carrier").read);
});
test("linked cases use the connection parties and pause the preview connection on submission", () => {
  let state = accepted(); const connectionId = state.connections[0].id;
  const data = { description: "شرح آزمایشی اختلاف مرتبط با همکاری", connectionId, respondentRole: "broker" };
  assert.throws(() => reduceWorkspace(state, { type: "case/save", role: "shipper", data }));
  state = reduceWorkspace(state, { type: "case/save", role: "shipper", data: { ...data, respondentRole: "driver" } });
  state = reduceWorkspace(state, { type: "case/submit", role: "shipper", id: state.cases[0].id });
  assert.equal(state.connections[0].state, "disputed");
  assert.throws(() => reduceWorkspace(state, { type: "connection/confirm", role: "shipper", id: connectionId, kind: "complete" }));
  assert.equal(state.connections[0].events.at(-1).source, "preview");
});
test("local cargo guidance returns sample candidates and an explicit empty result", async () => {
  const service = createCargoService(); const result = await service.suggest("قطعات ماشین آلات");
  assert.equal(result.kind, "local-sample"); assert.equal(result.candidates[0].value, "industrial");
  assert.equal((await service.suggest("شرح نامشخص محموله")).candidates.length, 0);
  await assert.rejects(service.suggest("آ"));
});
test("cargo suggestion provenance is preserved only after explicit sample selection", () => {
  const values = { ...request, cargoType: "industrial", cargoSelectionSource: "local-sample", cargoSuggestionId: "suggestion-test" };
  assert.equal(quotePreviewParams(values).get("cargoSelectionSource"), "local-sample");
  assert.equal(quotePreviewParams({ ...values, cargoSelectionSource: "manual" }).get("cargoSuggestionId"), "");
});
