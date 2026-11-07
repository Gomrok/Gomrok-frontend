import { CITIES, COUNTRIES, CARGO_TYPES, TRANSPORT_MODES, TRANSPORT_SCOPES, VEHICLE_OPTIONS } from "../data/logistics.js";
import { normalizeDecimal } from "../utils/format.js";
export const emptyRoute = () => ({ originCountry: "", originCity: "", destinationCountry: "", destinationCity: "" });
export function changeRouteField(route, key, value) { return { ...route, [key]: value, ...(key.endsWith("Country") ? { [key.replace("Country", "City")]: "" } : {}) }; }
export function swapRoute(route) { return { originCountry: route.destinationCountry, originCity: route.destinationCity, destinationCountry: route.originCountry, destinationCity: route.originCity }; }
const has = (options, value) => options?.some((item) => item.value === value);
export function validateQuote(values) {
  const errors = {};
  for (const [prefix, label] of [["origin", "مبدأ"], ["destination", "مقصد"]]) {
    if (!has(COUNTRIES, values[`${prefix}Country`])) errors[`${prefix}Country`] = `کشور ${label} را از فهرست انتخاب کنید.`;
    if (!has(CITIES[values[`${prefix}Country`]], values[`${prefix}City`])) errors[`${prefix}City`] = `استان یا شهر ${label} را از فهرست انتخاب کنید.`;
  }
  if (values.originCountry && values.originCountry === values.destinationCountry && values.originCity && values.originCity === values.destinationCity) errors.destinationCity = "مبدأ و مقصد نباید یکسان باشند.";
  if (!has(TRANSPORT_SCOPES, values.scope)) errors.scope = "دامنهٔ حمل را انتخاب کنید.";
  if (!has(TRANSPORT_MODES, values.mode)) errors.mode = "شیوهٔ حمل معتبر نیست.";
  if (values.cargoType && !has(CARGO_TYPES, values.cargoType)) errors.cargoType = "نوع بار را از فهرست انتخاب کنید.";
  if (values.vehicle && !has(VEHICLE_OPTIONS[values.mode], values.vehicle)) errors.vehicle = "وسیله را متناسب با شیوهٔ حمل انتخاب کنید.";
  const weight = normalizeDecimal(values.weight);
  if (weight === null || (weight && (Number(weight) <= 0 || Number(weight) > 1_000_000))) errors.weight = "وزن باید بیشتر از صفر و حداکثر ۱٬۰۰۰٬۰۰۰ کیلوگرم باشد.";
  if (String(values.routeName || "").length > 80) errors.routeName = "نام مسیر حداکثر ۸۰ نویسه است.";
  return errors;
}
export function quotePreviewParams(values, referral = null) {
  const label = (options, value) => options?.find((item) => item.value === value)?.label || "";
  const cargoSource = values.cargoSelectionSource === "local-sample" && values.cargoSuggestionId ? "local-sample" : "manual";
  return new URLSearchParams({ ...Object.fromEntries(Object.entries(values).map(([key, value]) => [key, String(value ?? "").trim()])), origin: label(CITIES[values.originCountry], values.originCity), destination: label(CITIES[values.destinationCountry], values.destinationCity), goods: values.cargoType || "", goodsLabel: label(CARGO_TYPES, values.cargoType), weight: normalizeDecimal(values.weight) || "", cargoSelectionSource: cargoSource, cargoSuggestionId: cargoSource === "local-sample" ? String(values.cargoSuggestionId) : "", referralSource: referral?.source === "ai" ? "ai" : "direct", referralId: referral?.id || "", referralConversationId: referral?.conversationId || "" });
}
