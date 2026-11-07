import { createConnection, transitionConnection } from "./trade.js";
import { makeId, normalizeDecimal } from "../utils/format.js";
import { ROLE_CONFIG } from "../config/platform.js";

export const emptyWorkspace = () => ({ version: 2, kind: "preview", requests: [], offers: [], connections: [], cases: [], notifications: [], profileDrafts: {} });
const roleLabel = (role) => ROLE_CONFIG[role]?.label || "طرف همکاری";
const find = (items, id, message) => { const item = items.find((entry) => entry.id === id); if (!item) throw new Error(message); return item; };
const notification = (recipientRole, title, tab, resourceId, at) => ({ id: makeId("notice"), kind: "preview", recipientRole, title, tab, resourceId, createdAt: at, read: false });
function notify(state, recipientRoles, title, tab, resourceId, at) { return { ...state, notifications: [...recipientRoles.map((role) => notification(role, title, tab, resourceId, at)), ...state.notifications].slice(0, 100) }; }
function replace(items, item) { return items.map((entry) => entry.id === item.id ? item : entry); }
export function reduceWorkspace(state, action) {
  const at = action.at || new Date().toISOString();
  if (!Number.isFinite(Date.parse(at))) throw new Error("زمان رویداد معتبر نیست.");
  const role = action.role;
  if (action.type === "request/save") {
    if (!Object.hasOwn(ROLE_CONFIG, role || "")) throw new Error("نقش معتبر را انتخاب کنید.");
    const data = action.data;
    if (!String(data?.goods || "").trim() || !data.origin || !data.destination) throw new Error("مسیر و شرح کالا را کامل کنید.");
    const existing = state.requests.find((item) => item.id === data.id);
    if (existing && existing.ownerRole !== role) throw new Error("ویرایش پیش‌نویس در نمای سازندهٔ آن انجام می‌شود.");
    if (existing && existing.status !== "draft") throw new Error("فقط پیش‌نویس قابل ویرایش است؛ درخواست جدیدی بسازید.");
    const allowedFields = ["origin", "destination", "originCountry", "originCity", "destinationCountry", "destinationCity", "mode", "scope", "vehicle", "cargoType", "goods", "goodsLabel", "weight", "routeName", "pickup", "dropoff", "ready", "packaging", "note", "referralSource", "referralId", "referralConversationId", "cargoSelectionSource", "cargoSuggestionId"];
    const safeData = Object.fromEntries(allowedFields.map((key) => [key, String(data[key] ?? "").slice(0, key === "note" ? 500 : 120)]));
    const request = { ...safeData, id: data.id || makeId("request"), kind: "preview", ownerRole: existing?.ownerRole || role, status: "draft", createdAt: existing?.createdAt || at, updatedAt: at };
    return { ...state, requests: existing ? replace(state.requests, request) : [request, ...state.requests].slice(0, 100) };
  }
  if (action.type === "request/publish") {
    const request = find(state.requests, action.id, "پیش‌نویس پیدا نشد.");
    if (request.ownerRole !== role) throw new Error("این اقدام در نمای صاحب درخواست انجام می‌شود.");
    if (request.status === "published") return state;
    if (request.status !== "draft") throw new Error("این درخواست قابل انتشار آزمایشی نیست.");
    return notify({ ...state, requests: replace(state.requests, { ...request, status: "published", updatedAt: at }) }, ["carrier", "driver"].filter((item) => item !== role), "یک درخواست حمل نمونه برای بررسی پیشنهاد آماده شد.", "offers", request.id, at);
  }
  if (action.type === "offer/create") {
    const request = find(state.requests, action.requestId, "درخواست پیدا نشد.");
    if (!["carrier", "driver"].includes(role) || request.ownerRole === role || request.status !== "published") throw new Error("در این نما امکان پیشنهاد برای این درخواست نیست.");
    if (state.offers.some((item) => item.requestId === request.id && item.senderRole === role && item.status === "pending")) throw new Error("برای این نقش یک پیشنهاد باز وجود دارد؛ ابتدا آن را پس بگیرید.");
    const amount = normalizeDecimal(action.amount);
    if (!amount || !Number.isSafeInteger(Number(amount)) || Number(amount) <= 0) throw new Error("مبلغ فرضی را به ریال و به‌صورت عدد صحیح مثبت وارد کنید.");
    const offer = { id: makeId("offer"), kind: "preview", requestId: request.id, senderRole: role, amount: Number(amount), currency: "IRR", message: String(action.message || "").trim().slice(0, 500), status: "pending", createdAt: at };
    return notify({ ...state, offers: [offer, ...state.offers] }, [request.ownerRole], `${roleLabel(role)} یک پیشنهاد نمونه ثبت کرد.`, "offers", request.id, at);
  }
  if (action.type === "offer/withdraw") {
    const offer = find(state.offers, action.id, "پیشنهاد پیدا نشد.");
    if (offer.senderRole !== role || offer.status !== "pending") throw new Error("این پیشنهاد قابل پس‌گرفتن نیست.");
    return { ...state, offers: replace(state.offers, { ...offer, status: "withdrawn" }) };
  }
  if (action.type === "offer/accept") {
    const offer = find(state.offers, action.id, "پیشنهاد پیدا نشد.");
    const request = find(state.requests, offer.requestId, "درخواست پیدا نشد.");
    if (request.ownerRole !== role || request.status !== "published" || offer.status !== "pending") throw new Error("پذیرش این پیشنهاد در این مرحله مجاز نیست.");
    let connection = createConnection({ requestId: request.id, referral: request.referralSource === "ai" ? { source: "ai", id: request.referralId, conversationId: request.referralConversationId } : null, at });
    connection = transitionConnection(transitionConnection(connection, "offer", { at }), "accept", { at });
    connection = { ...connection, kind: "preview", ownerRole: role, partnerRole: offer.senderRole, offerId: offer.id, amount: offer.amount, completionConfirmations: [], settlementConfirmations: [] };
    return notify({ ...state, requests: replace(state.requests, { ...request, status: "accepted" }), offers: state.offers.map((item) => item.requestId === request.id && item.status === "pending" ? { ...item, status: item.id === offer.id ? "accepted" : "declined" } : item), connections: [connection, ...state.connections] }, [role, offer.senderRole], "پیشنهاد در سناریوی نمونه پذیرفته شد.", "connections", connection.id, at);
  }
  if (action.type === "connection/confirm") {
    const connection = find(state.connections, action.id, "همکاری پیدا نشد.");
    if (![connection.ownerRole, connection.partnerRole].includes(role)) throw new Error("این نقش طرف این همکاری نیست.");
    const kind = action.kind;
    if (!["complete", "settle"].includes(kind) || connection.state !== (kind === "complete" ? "accepted" : "completed")) throw new Error("این تأیید در این مرحله در دسترس نیست.");
    const key = kind === "complete" ? "completionConfirmations" : "settlementConfirmations";
    if (connection[key].includes(role)) return state;
    const confirmations = [...connection[key], role];
    let updated = { ...connection, [key]: confirmations, events: [...connection.events, { type: `${kind}_ack`, at, source: "preview", actorRole: role }] };
    if (confirmations.length === 2) updated = transitionConnection(updated, kind, { at, source: "preview", evidence: null });
    return notify({ ...state, connections: replace(state.connections, updated) }, [connection.ownerRole, connection.partnerRole], confirmations.length === 2 ? `مرحلهٔ ${kind === "complete" ? "تکمیل" : "تسویه"} در سناریوی نمونه انجام شد.` : `تأیید نمونهٔ ${roleLabel(role)} دریافت شد؛ منتظر طرف دیگر.`, "connections", connection.id, at);
  }
  if (action.type === "connection/cancel") {
    const connection = find(state.connections, action.id, "همکاری پیدا نشد.");
    if (![connection.ownerRole, connection.partnerRole].includes(role)) throw new Error("این نقش طرف همکاری نیست.");
    const updated = transitionConnection(connection, "cancel", { at, source: "preview" });
    return notify({ ...state, connections: replace(state.connections, updated), requests: state.requests.map((item) => item.id === connection.requestId ? { ...item, status: "cancelled" } : item) }, [connection.ownerRole, connection.partnerRole], "همکاری نمونه لغو شد.", "connections", connection.id, at);
  }
  if (action.type === "case/save") {
    const draft = action.data;
    const description = String(draft?.description || "").trim();
    if (description.length < 20) throw new Error("شرح اختلاف باید دست‌کم ۲۰ نویسه داشته باشد.");
    const respondentRole = draft.respondentRole || (role === "driver" ? "shipper" : "driver");
    if (!Object.hasOwn(ROLE_CONFIG, role || "") || !Object.hasOwn(ROLE_CONFIG, respondentRole) || role === respondentRole) throw new Error("دو نقش معتبر و متفاوت برای پرونده انتخاب کنید.");
    if (draft.connectionId) {
      const connection = find(state.connections, draft.connectionId, "همکاری مرتبط با پرونده پیدا نشد.");
      if (![connection.ownerRole, connection.partnerRole].includes(role) || ![connection.ownerRole, connection.partnerRole].includes(respondentRole)) throw new Error("طرف‌های پرونده باید همان دو نقش همکاری مرتبط باشند.");
      if (!["offered", "accepted", "completed", "settled", "disputed"].includes(connection.state)) throw new Error("برای این وضعیت همکاری، پروندهٔ مرتبط ایجاد نمی‌شود.");
    }
    const attachments = Array.isArray(draft.attachmentMetadata) ? draft.attachmentMetadata : [];
    if (attachments.length > 3 || attachments.some((file) => !["application/pdf", "image/png", "image/jpeg"].includes(file.type) || !Number.isFinite(file.size) || file.size < 0 || file.size > 5 * 1024 * 1024)) throw new Error("مدارک نمونه معتبر نیستند.");
    const item = { id: draft.id || makeId("case"), description: description.slice(0, 2000), connectionId: String(draft.connectionId || "").slice(0, 120), attachmentMetadata: attachments.map((file) => ({ name: String(file.name).slice(0, 255), size: file.size, type: file.type })), kind: "preview", initiatorRole: role, respondentRole, stage: "draft", createdAt: at, previewNoticeAt: null, previewDeadline: null, notice: null, responseDeadline: null, replies: [], events: [{ type: "draft", at, actorRole: role }] };
    const existing = state.cases.find((entry) => entry.id === item.id);
    if (existing && existing.initiatorRole !== role) throw new Error("این پیش‌نویس متعلق به نمای طرح‌کنندهٔ دیگری است.");
    if (existing && existing.stage !== "draft") throw new Error("پروندهٔ ارسال‌شده را نمی‌توان با پیش‌نویس جایگزین کرد.");
    return { ...state, cases: existing ? replace(state.cases, { ...item, createdAt: existing.createdAt }) : [item, ...state.cases].slice(0, 100) };
  }
  if (action.type === "case/submit") {
    const item = find(state.cases, action.id, "پیش‌نویس اختلاف پیدا نشد.");
    if (item.initiatorRole !== role || item.stage !== "draft") throw new Error("این پرونده قابل ارسال آزمایشی نیست.");
    const updated = { ...item, stage: "awaiting_notice", events: [...item.events, { type: "submitted_preview", at, actorRole: role }] };
    const connection = state.connections.find((entry) => entry.id === item.connectionId);
    const connections = connection && connection.state !== "disputed" ? replace(state.connections, transitionConnection(connection, "dispute", { at, source: "preview" })) : state.connections;
    return notify({ ...state, connections, cases: replace(state.cases, updated) }, [item.initiatorRole, item.respondentRole], "یک پروندهٔ اختلاف نمونه برای مرور آماده شد؛ ابلاغ رسمی نیست.", "disputes", item.id, at);
  }
  if (action.type === "case/acknowledge") {
    const item = find(state.cases, action.id, "پرونده پیدا نشد.");
    if (item.respondentRole !== role || item.stage !== "awaiting_notice") throw new Error("مشاهدهٔ نمونه در نمای طرف پاسخ‌دهنده انجام می‌شود.");
    const updated = { ...item, stage: "awaiting_response", previewNoticeAt: at, previewDeadline: new Date(Date.parse(at) + 48 * 3600000).toISOString(), events: [...item.events, { type: "preview_notice_viewed", at, actorRole: role }] };
    return notify({ ...state, cases: replace(state.cases, updated) }, [item.initiatorRole, item.respondentRole], "مشاهدهٔ ابلاغ در سناریوی آزمایشی ثبت شد؛ مهلت نمایشی ۴۸ ساعت است.", "disputes", item.id, at);
  }
  if (action.type === "case/reply") {
    const item = find(state.cases, action.id, "پرونده پیدا نشد.");
    if (item.respondentRole !== role || item.stage !== "awaiting_response" || !item.previewDeadline || Date.parse(at) >= Date.parse(item.previewDeadline)) throw new Error("مهلت پاسخ در این سناریو فعال نیست؛ پرونده به بررسی ارجاع‌پذیر است.");
    const text = String(action.text || "").trim();
    if (text.length < 10) throw new Error("پاسخ را با دست‌کم ۱۰ نویسه وارد کنید.");
    const updated = { ...item, stage: "awaiting_review", replies: [...item.replies, { text: text.slice(0, 2000), at, role }], events: [...item.events, { type: "response_preview", at, actorRole: role }] };
    return notify({ ...state, cases: replace(state.cases, updated) }, [item.initiatorRole, item.respondentRole], "پاسخ نمونه ثبت شد؛ پرونده برای نمایش مرحلهٔ بررسی آماده است.", "disputes", item.id, at);
  }
  if (action.type === "notification/read") return { ...state, notifications: state.notifications.map((item) => item.recipientRole === role && (action.id === "all" || item.id === action.id) ? { ...item, read: true } : item) };
  if (action.type === "profile/save") return { ...state, profileDrafts: { ...state.profileDrafts, [role]: action.data } };
  throw new Error("اقدام شناخته‌شده نیست.");
}
export function previewCaseStage(item, now = Date.now()) { return item.stage === "awaiting_response" && item.previewDeadline && now >= Date.parse(item.previewDeadline) ? "awaiting_review" : item.stage; }

// Sensitive case descriptions/evidence and profile fields stay in memory, not storage.
export function serializeWorkspace(state) { return { ...state, cases: [], profileDrafts: {}, notifications: state.notifications.filter((item) => item.tab !== "disputes") }; }
export function restoreWorkspace(value) {
  if (!value || value.version !== 2 || value.kind !== "preview") return emptyWorkspace();
  const restored = emptyWorkspace();
  for (const key of ["requests", "offers", "connections", "notifications"]) if (Array.isArray(value[key])) restored[key] = value[key].filter((item) => item && typeof item.id === "string" && item.kind === "preview").slice(0, 100);
  return restored;
}
