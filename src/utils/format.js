export const faNumber = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 2 });
export function toLatinDigits(value) {
  return String(value ?? "").replace(/[۰-۹٠-٩]/g, (digit) => String(digit.charCodeAt(0) - (digit >= "۰" ? 0x6f0 : 0x660)));
}
export function normalizeSearch(value) {
  return toLatinDigits(value).normalize("NFKC").toLocaleLowerCase("fa")
    .replace(/ي|ى/g, "ی").replace(/ك/g, "ک").replace(/[\u064b-\u065f\u0670]/g, "")
    .replace(/[\u200c\u200d]/g, " ").replace(/\s+/g, " ").trim();
}
export function normalizeDecimal(value) {
  const normalized = toLatinDigits(value).trim().replace("٫", ".");
  if (!normalized) return "";
  if (/[٬,]/.test(normalized) && !/^\d{1,3}(?:[٬,]\d{3})+(?:\.\d{1,2})?$/.test(normalized)) return null;
  const number = normalized.replaceAll("٬", "").replaceAll(",", "");
  return /^\d+(?:\.\d{1,2})?$/.test(number) ? number : null;
}
export function normalizePhone(value) { return toLatinDigits(value).replace(/[\s()-]/g, ""); }
export function isValidPhone(value) { return /^(?:09\d{9}|\+[1-9]\d{7,14})$/.test(normalizePhone(value)); }
export function makeId(prefix = "demo") { return `${prefix}-${globalThis.crypto.randomUUID()}`; }
