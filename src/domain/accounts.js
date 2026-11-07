import { ROLE_CONFIG } from "../config/platform.js";
import { isValidPhone } from "../utils/format.js";
export function validateAccount(values, role, signup = false) {
  const errors = {};
  if (!isValidPhone(values.phone)) errors.phone = "شمارهٔ همراه معتبر وارد کنید؛ مانند ۰۹۱۲۱۲۳۴۵۶۷ یا شماره با +کد کشور.";
  if (!signup && !String(values.password || "").trim()) errors.password = "رمز عبور را وارد کنید.";
  if (signup) {
    if (!Object.hasOwn(ROLE_CONFIG, role || "")) errors.role = "نقش معتبر را انتخاب کنید.";
    if (String(values.displayName || "").trim().length < 2) errors.displayName = "نام نمایشی را با دست‌کم دو نویسه وارد کنید.";
    const field = ROLE_CONFIG[role]?.field;
    if (field?.required && !String(values[field.name] || "").trim()) errors[field.name] = `${field.label} را وارد کنید.`;
    if (!values.consent) errors.consent = "تأیید کنید که اطلاعات این مرحله صرفاً آزمایشی است.";
  }
  return errors;
}
// Navigation is not access control. The backend must authorize private requests.
export function destinationForIdentity(identity) {
  if (identity?.authenticated !== true || !Object.hasOwn(ROLE_CONFIG, identity.role || "")) return "?view=login";
  return `?view=panel&role=${identity.role}`;
}
