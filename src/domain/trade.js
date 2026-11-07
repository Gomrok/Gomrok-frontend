import { makeId } from "../utils/format.js";
export const TRADE_STATES = Object.freeze({ requested: "درخواست ایجاد شده", offered: "پیشنهاد دریافت شده", accepted: "پذیرفته شده", completed: "انجام موفق", settled: "تسویه شده", cancelled: "لغو شده", disputed: "در اختلاف" });
const transitions = { requested: { offer: "offered", cancel: "cancelled" }, offered: { accept: "accepted", cancel: "cancelled", dispute: "disputed" }, accepted: { complete: "completed", cancel: "cancelled", dispute: "disputed" }, completed: { settle: "settled", dispute: "disputed" }, settled: { dispute: "disputed" }, cancelled: {}, disputed: {} };
export function createConnection({ requestId, referral = null, id = makeId("connection"), at = new Date().toISOString() } = {}) {
  if (!requestId) throw new Error("شناسهٔ درخواست لازم است.");
  return { id, requestId, state: "requested", referral: referral?.source === "ai" ? { source: "ai", id: referral.id, conversationId: referral.conversationId || null } : { source: "direct" }, completionEvidence: null, settlementEvidence: null, events: [{ type: "request_created", at, source: "preview" }] };
}
export function transitionConnection(connection, type, { at = new Date().toISOString(), source = "preview", evidence = null } = {}) {
  const state = transitions[connection.state]?.[type];
  if (!state) throw new Error("این تغییر وضعیت در این مرحله مجاز نیست.");
  return { ...connection, state, ...(type === "complete" ? { completionEvidence: evidence } : {}), ...(type === "settle" ? { settlementEvidence: evidence } : {}), events: [...connection.events, { type, at, source, evidenceId: evidence?.id || null }] };
}
export function estimateCommission(amount, policy) {
  if (!Number.isSafeInteger(amount) || amount <= 0) return { status: "invalid", amount: null };
  if (policy.model === "percentage" && Number.isFinite(policy.value) && policy.value > 0 && policy.value <= 100) {
    const basisPoints = Math.round(policy.value * 100);
    if (Math.abs(basisPoints - policy.value * 100) > 1e-8) return { status: "invalid", amount: null };
    const result = Number((BigInt(amount) * BigInt(basisPoints) + 5000n) / 10000n);
    return Number.isSafeInteger(result) ? { status: "simulation", amount: result } : { status: "invalid", amount: null };
  }
  if (policy.model === "fixed" && Number.isSafeInteger(policy.value) && policy.value > 0 && policy.value <= amount) return { status: "simulation", amount: policy.value };
  return { status: policy.model === "unset" ? "unconfigured" : "invalid", amount: null };
}
// Contract evaluator only: evidence authenticity must be checked on the backend.
export function evaluateCommission(connection, amount, policy) {
  if (!["completed", "settled"].includes(connection.state)) return { status: "not_eligible", amount: null };
  const valid = (evidence) => evidence?.source === "backend" && evidence.verified === true && Boolean(evidence.id) && Number.isFinite(Date.parse(evidence.verifiedAt));
  if (!valid(connection.completionEvidence)) return { status: "awaiting_verification", amount: null };
  if (connection.state !== "settled" || !valid(connection.settlementEvidence)) return { status: "awaiting_settlement", amount: null };
  const estimate = estimateCommission(amount, policy);
  return { ...estimate, status: estimate.status === "simulation" ? "eligible_by_contract" : estimate.status, policyVersion: policy.version };
}
