export const ROLE_CONFIG = Object.freeze({
  shipper: { label: "صاحب کالا", icon: "package", description: "درخواست حمل و پیگیری محموله", field: { name: "activity", label: "حوزهٔ فعالیت", placeholder: "مثلاً تولید یا بازرگانی", required: false } },
  carrier: { label: "شرکت حمل", icon: "truck", description: "مدیریت پیشنهادها و ظرفیت حمل", field: { name: "companyName", label: "نام شرکت حمل", placeholder: "نام مجموعهٔ آزمایشی", required: true } },
  broker: { label: "ترخیص‌کار", icon: "file-text", description: "درخواست‌های خدمات و پرونده‌های کالا", field: { name: "tradeName", label: "نام دفتر یا عنوان فعالیت", placeholder: "عنوان فعالیت آزمایشی", required: true } },
  driver: { label: "راننده", icon: "navigation", description: "فرصت‌های حمل و وضعیت ناوگان", field: { name: "vehicleType", label: "نوع خودرو", placeholder: "مثلاً تریلی کفی", required: true } },
});
const requestedLimit = Number(import.meta.env?.VITE_GUEST_AI_LIMIT ?? 3);
export const AI_CONFIG = Object.freeze({ guestLimit: Number.isInteger(requestedLimit) && requestedLimit >= 0 && requestedLimit <= 30 ? requestedLimit : 3, mode: "sample" });
// These defaults do not establish financial or ranking rules.
export const COMMISSION_POLICY = Object.freeze({ version: "pending-approval", model: "unset", value: null, currency: "IRR" });
export const LEAGUE_POLICY = Object.freeze({ version: "pending-approval", levels: [
  { id: "bronze", label: "برنزی", threshold: null }, { id: "silver", label: "نقره‌ای", threshold: null }, { id: "gold", label: "طلایی", threshold: null },
], weights: null });
export const DISPUTE_POLICY = Object.freeze({ responseHours: 48, basis: "verified_notice_or_view", requiresLegalApproval: true });
// The existing customs/tools section is the closest match to the requested tariff section.
export const HOME_SECTION_ORDER = Object.freeze(["customs", "ai"]);
