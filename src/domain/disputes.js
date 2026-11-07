import { DISPUTE_POLICY } from "../config/platform.js";
import { makeId } from "../utils/format.js";
export function createDisputeDraft({ description, connectionId = "", attachments = [], at = new Date().toISOString() }) {
  if (String(description).trim().length < 20) throw new Error("شرح اختلاف باید دست‌کم ۲۰ نویسه داشته باشد.");
  return { id: makeId("draft"), status: "draft", description: String(description).trim().slice(0, 2000), connectionId, attachmentMetadata: attachments.map(({ name, size, type }) => ({ name, size, type })), notice: null, responseDeadline: null, events: [{ type: "local_draft_created", at }] };
}
export function responseDeadline(notice, policy = DISPUTE_POLICY) {
  if (!notice?.verified || notice.source !== "backend" || !notice.id || !Number.isFinite(Date.parse(notice.servedAt)) || !Number.isFinite(policy.responseHours) || policy.responseHours <= 0) return null;
  return new Date(Date.parse(notice.servedAt) + policy.responseHours * 60 * 60 * 1000).toISOString();
}
export function disputeStage(dispute, now = Date.now()) {
  if (!dispute.notice) return dispute.status === "draft" ? "draft" : "awaiting_valid_notice";
  const deadline = responseDeadline(dispute.notice);
  if (!deadline) return "awaiting_valid_notice";
  if (dispute.responseReceivedAt) return "awaiting_review";
  return now >= Date.parse(deadline) ? "awaiting_review" : "awaiting_response";
}
