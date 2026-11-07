import test from "node:test";
import assert from "node:assert/strict";
import { toLatinDigits, normalizeDecimal, normalizeSearch, isValidPhone } from "../../src/utils/format.js";
import { emptyRoute, changeRouteField, swapRoute, validateQuote, quotePreviewParams } from "../../src/domain/quote.js";
import { destinationForIdentity, validateAccount } from "../../src/domain/accounts.js";
import { createConnection, transitionConnection, evaluateCommission, estimateCommission } from "../../src/domain/trade.js";
import { evaluateLeague, LEAGUE_METRICS } from "../../src/domain/leagues.js";
import { createDisputeDraft, disputeStage, responseDeadline } from "../../src/domain/disputes.js";
import { createGuestQuota } from "../../src/services/session.js";
import { createAuthService, IntegrationUnavailableError } from "../../src/services/integrations.js";
import { createCatalogService } from "../../src/services/catalog.js";
import { createMarketService } from "../../src/services/market.js";
import { driverDemoData, filterSampleDrivers } from "../../src/services/drivers.js";
import { createAiService } from "../../src/services/ai.js";
import { COMMISSION_POLICY, LEAGUE_POLICY } from "../../src/config/platform.js";

const route = { originCountry: "iran", originCity: "tehran", destinationCountry: "turkey", destinationCity: "istanbul" };
const validQuote = { ...route, mode: "rail", scope: "transit", vehicle: "rail-covered", cargoType: "industrial", weight: "۲۴٬۰۰۰", routeName: "مسیر آزمایشی" };
test("Persian/Arabic normalization supports search and decimal grouping", () => {
  assert.equal(toLatinDigits("۰۱۲٣٤٥"), "012345");
  assert.equal(normalizeSearch("  كالا يَک ۸۴۷۱ "), "کالا یک 8471");
  assert.equal(normalizeDecimal("۲۴٬۰۰۰٫۵"), "24000.5");
  for (const invalid of ["12,34", "1e3", "-2", "12.123", "abc"]) assert.equal(normalizeDecimal(invalid), null);
  assert.equal(normalizeDecimal(""), "");
});
test("no route defaults and country changes clear incompatible cities", () => {
  assert.deepEqual(Object.values(emptyRoute()), ["", "", "", ""]);
  assert.equal(changeRouteField(route, "originCountry", "china").originCity, "");
  assert.deepEqual(swapRoute(swapRoute(route)), route);
  assert.equal(swapRoute(route).originCity, "istanbul");
});
test("rail, scope and selected location validation reject stale or arbitrary values", () => {
  assert.deepEqual(validateQuote(validQuote), {});
  assert.ok(validateQuote({ ...validQuote, originCity: "istanbul" }).originCity);
  assert.ok(validateQuote({ ...validQuote, vehicle: "flatbed" }).vehicle);
  assert.ok(validateQuote({ ...validQuote, scope: "" }).scope);
  assert.ok(validateQuote({ ...validQuote, destinationCountry: "iran", destinationCity: "tehran" }).destinationCity);
  assert.ok(validateQuote({ ...validQuote, weight: "۰" }).weight);
  assert.ok(validateQuote({ ...validQuote, weight: "1000001" }).weight);
});
test("preview retains scope, rail, route name and AI referral", () => {
  const result = quotePreviewParams(validQuote, { source: "ai", id: "ref-test" });
  assert.equal(result.get("mode"), "rail"); assert.equal(result.get("scope"), "transit");
  assert.equal(result.get("origin"), "تهران"); assert.equal(result.get("weight"), "24000");
  assert.equal(result.get("routeName"), validQuote.routeName); assert.equal(result.get("referralId"), "ref-test");
});
test("phone and account validation do not invent authentication", async () => {
  assert.ok(isValidPhone("۰۹۱۲۱۲۳۴۵۶۷")); assert.ok(isValidPhone("+905551112233")); assert.ok(!isValidPhone("123"));
  assert.ok(validateAccount({ phone: "123", password: "" }).phone);
  assert.ok(validateAccount({ phone: "09121234567", displayName: "نمونه", consent: "yes" }, "__proto__", true).role);
  assert.equal(destinationForIdentity({ role: "shipper" }), "?view=login");
  assert.equal(destinationForIdentity({ authenticated: true, role: "__proto__" }), "?view=login");
  assert.equal(destinationForIdentity({ authenticated: true, role: "driver" }), "?view=panel&role=driver");
  await assert.rejects(createAuthService().login({ phone: "09121234567", password: "sample" }), IntegrationUnavailableError);
});
test("quota persists across new conversations and fails safely without storage", () => {
  const map = new Map(); const storage = { getItem: (key) => map.get(key) ?? null, setItem: (key, value) => map.set(key, value) };
  const quota = createGuestQuota(3, storage);
  assert.equal(quota.consume(), 1); assert.equal(quota.consume(), 2);
  const freshConversation = createGuestQuota(3, storage);
  assert.equal(freshConversation.read(), 2); assert.equal(freshConversation.consume(), 3); assert.equal(freshConversation.consume(), null);
  const unavailable = createGuestQuota(1, { getItem() { throw Error("blocked"); }, setItem() { throw Error("blocked"); } });
  assert.equal(unavailable.consume(), 1); assert.equal(unavailable.consume(), null);
});
test("trade transition order and terminal states are enforced", () => {
  const initial = createConnection({ requestId: "request-test", referral: { source: "ai", id: "ref-test" } });
  assert.equal(initial.referral.source, "ai");
  assert.throws(() => transitionConnection(initial, "settle")); assert.throws(() => transitionConnection(initial, "chat_opened"));
  const cancelled = transitionConnection(initial, "cancel"); assert.throws(() => transitionConnection(cancelled, "complete"));
  assert.equal(initial.events.length, 1); assert.equal(cancelled.events.length, 2);
});
function completedConnection() {
  let connection = createConnection({ requestId: "request-test" });
  for (const event of ["offer", "accept", "complete"]) connection = transitionConnection(connection, event);
  return connection;
}
test("commission never accrues on clicks, acceptance or unverified completion", () => {
  const policy = { model: "percentage", value: 2, version: "test" };
  assert.equal(evaluateCommission(createConnection({ requestId: "r" }), 100000, policy).status, "not_eligible");
  assert.equal(evaluateCommission(completedConnection(), 100000, policy).status, "awaiting_verification");
  assert.equal(evaluateCommission(transitionConnection(completedConnection(), "settle"), 100000, policy).amount, null);
});
test("commission requires confirmed completion, settlement and configured policy", () => {
  const evidence = { source: "backend", id: "proof-1", verified: true, verifiedAt: "2026-11-06T10:00:00Z" };
  let connection = { ...completedConnection(), completionEvidence: evidence };
  assert.equal(evaluateCommission(connection, 100000, COMMISSION_POLICY).status, "awaiting_settlement");
  connection = transitionConnection(connection, "settle", { source: "backend", evidence });
  assert.equal(evaluateCommission(connection, 100000, COMMISSION_POLICY).status, "unconfigured");
  assert.equal(evaluateCommission(connection, 100000, { model: "percentage", value: 2, version: "test" }).amount, 2000);
  assert.equal(estimateCommission(Infinity, { model: "fixed", value: 10 }).amount, null);
  assert.equal(estimateCommission(100, { model: "percentage", value: 101 }).status, "invalid");
  assert.equal(estimateCommission(9007199254740991, { model: "percentage", value: 99.99 }).amount, Number((9007199254740991n * 9999n + 5000n) / 10000n));
  assert.equal(estimateCommission(1000, { model: "percentage", value: 1.001 }).status, "invalid");
});
test("league default is unconfigured; a sample cannot award a valid rank", () => {
  assert.equal(evaluateLeague({}, LEAGUE_POLICY).level, null);
  const policy = { version: "demo", weights: { completion: 2, payments: 1 }, levels: [{ id: "bronze", threshold: 30 }, { id: "silver", threshold: 60 }] };
  const result = evaluateLeague({ completion: 80, payments: 50 }, policy);
  assert.equal(result.score, 70); assert.equal(result.status, "simulation"); assert.equal(result.level, null); assert.equal(result.sampleLevel.id, "silver");
  assert.equal(evaluateLeague({ completion: 101, payments: 50 }, policy).status, "invalid");
  assert.ok(LEAGUE_METRICS.carrier.includes("payments"));
});
test("48-hour deadline starts only on a verified backend notice", () => {
  const servedAt = "2026-11-06T10:00:00Z";
  assert.equal(responseDeadline({ servedAt, verified: false }), null);
  assert.equal(responseDeadline({ servedAt, verified: true, id: "notice", source: "preview" }), null);
  const notice = { servedAt, verified: true, id: "notice", source: "backend" };
  assert.equal(responseDeadline(notice), "2026-11-08T10:00:00.000Z");
  assert.equal(disputeStage({ status: "submitted", notice }, Date.parse("2026-11-08T09:59:59Z")), "awaiting_response");
  assert.equal(disputeStage({ status: "submitted", notice }, Date.parse("2026-11-08T10:00:00Z")), "awaiting_review");
  assert.equal(disputeStage({ status: "draft", notice: null }), "draft");
});
test("dispute drafts retain only attachment metadata", () => {
  const draft = createDisputeDraft({ description: "شرح آزمایشی یک اختلاف برای بررسی فرم و مسیر پاسخ", attachments: [{ name: "sample.pdf", size: 100, type: "application/pdf", content: "must-not-persist" }] });
  assert.equal(draft.status, "draft"); assert.equal(draft.responseDeadline, null);
  assert.deepEqual(Object.keys(draft.attachmentMetadata[0]), ["name", "size", "type"]);
  assert.throws(() => createDisputeDraft({ description: "کوتاه" }));
});
test("sample catalog searches Persian digits and has an honest empty result", async () => {
  assert.equal((await createCatalogService().search("۸۴۷۱"))[0].value, "computer");
  assert.deepEqual(await createCatalogService().search("کالای ناموجود"), []);
  await assert.rejects(createCatalogService({ search: async () => [{ label: "بدون شناسه" }] }).search("نمونه"));
});
test("market range filters and chart endpoint use the same sample snapshot", async () => {
  const market = createMarketService(); const today = await market.getSnapshot("today"); const week = await market.getSnapshot("week");
  assert.equal(today.kind, "sample"); assert.notEqual(today.counts.available, week.counts.available);
  assert.equal(today.series.at(-1).cargo, today.counts.available); assert.equal(today.series.at(-1).drivers, today.counts.ready);
  await assert.rejects(market.getSnapshot("unknown"));
  await assert.rejects(createMarketService({ getSnapshot: async () => ({ counts: { available: -1 }, series: [] }) }).getSnapshot("today"));
  assert.equal(await createMarketService({ getSnapshot: async () => null }).getSnapshot("today"), null);
});
test("driver counters and filtered list derive from one consistent source", () => {
  const data = driverDemoData("tehran");
  assert.equal(data.count, data.drivers.length);
  assert.equal(filterSampleDrivers("tehran", "all", "ready").length + filterSampleDrivers("tehran", "all", "busy").length, data.count);
  assert.ok(filterSampleDrivers("fars", "van", "ready").every((driver) => driver.type === "van" && driver.status === "ready"));
  assert.notEqual(data.count, driverDemoData("isfahan").count);
});
test("AI adapter returns labeled sample content and supports cancellation", async () => {
  const ai = createAiService(); const answer = await ai.reply({ text: "سؤال نمونه" });
  assert.equal(answer.kind, "sample"); assert.ok(answer.text.includes("پاسخ نمونه"));
  const controller = new AbortController(); controller.abort();
  await assert.rejects(ai.reply({ text: "نمونه", signal: controller.signal }), { name: "AbortError" });
});
