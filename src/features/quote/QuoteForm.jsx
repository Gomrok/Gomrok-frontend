import { useState } from "react";
import { Icon } from "../../components/Icon.jsx";
import { Combobox } from "../../components/Combobox.jsx";
import { CargoAssistant } from "./CargoAssistant.jsx";
import { CITIES, COUNTRIES, CARGO_TYPES, TRANSPORT_MODES, TRANSPORT_SCOPES, VEHICLE_OPTIONS } from "../../data/logistics.js";
import { changeRouteField, emptyRoute, quotePreviewParams, swapRoute as swap, validateQuote } from "../../domain/quote.js";
import { normalizeDecimal, toLatinDigits } from "../../utils/format.js";
import { readSession, removeSession } from "../../services/session.js";
import { readPreview, savePreview } from "../concepts/previewStorage.js";

export function QuoteForm() {
  const [draft] = useState(() => new URLSearchParams(window.location.search).get("edit") === "quote" ? readPreview("quote") : new URLSearchParams());
  const [route, setRoute] = useState(() => Object.fromEntries(Object.entries(emptyRoute()).map(([key]) => [key, draft.get(key) || ""])));
  const [mode, setMode] = useState(TRANSPORT_MODES.some((item) => item.value === draft.get("mode")) ? draft.get("mode") : "road");
  const [scope, setScope] = useState(draft.get("scope") || "");
  const [cargoType, setCargoType] = useState(draft.get("cargoType") || "");
  const [cargoSuggestion, setCargoSuggestion] = useState(() => draft.get("cargoSelectionSource") === "local-sample" ? draft.get("cargoSuggestionId") : "");
  const [vehicle, setVehicle] = useState(draft.get("vehicle") || "");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [referral] = useState(() => draft.get("referralSource") === "ai" ? { source: "ai", id: draft.get("referralId"), conversationId: draft.get("referralConversationId") } : readSession("ai-referral"));
  function updateRoute(key, value) {
    setRoute((current) => changeRouteField(current, key, value));
    setErrors((current) => ({ ...current, [key]: "", ...(key.endsWith("Country") ? { [key.replace("Country", "City")]: "" } : {}) }));
  }
  function submit(event) {
    event.preventDefault();
    if (submitting) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    const values = { ...route, mode, scope, cargoType, vehicle, cargoSelectionSource: cargoSuggestion ? "local-sample" : "manual", cargoSuggestionId: cargoSuggestion, weight: fields.get("weight") || "", routeName: fields.get("routeName") || "", pickup: fields.get("pickupPlace") || "", dropoff: fields.get("dropoffPlace") || "", ready: fields.get("ready") || "" };
    const nextErrors = validateQuote(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      const ids = { originCountry: "origin-country", originCity: "origin-city", destinationCountry: "destination-country", destinationCity: "destination-city", scope: "transport-scope", cargoType: "cargo-type", vehicle: "vehicle-type", weight: "cargo-weight", routeName: "route-name" };
      requestAnimationFrame(() => document.getElementById(ids[Object.keys(nextErrors)[0]])?.focus());
      return;
    }
    setSubmitting(true);
    const nextPreview = quotePreviewParams(values, referral);
    if (draft.get("id")) nextPreview.set("id", draft.get("id"));
    for (const key of ["packaging", "note"]) if (draft.has(key)) nextPreview.set(key, draft.get(key));
    if (!savePreview("quote", nextPreview)) {
      setErrors({ storage: "مرورگر نتوانست پیش‌نویس را نگه دارد. دسترسی حافظهٔ همین تب را بررسی و دوباره تلاش کنید." });
      setSubmitting(false);
      return;
    }
    removeSession("ai-referral");
    window.location.assign("?view=quote");
  }
  return (
    <form id="quote" className="quote-panel" data-figma="Form/FreightQuote" noValidate onSubmit={submit} aria-describedby="quote-data-note">
      <div className="quote-panel-heading">
        <div><span className="overline">اولین قدم، یک مسیر مشخص</span><h2>بار شما از کجا به کجا می‌رود؟</h2></div>
        <div className="transport-tabs" role="group" aria-label="شیوه حمل">
          {TRANSPORT_MODES.map((item) => <button key={item.value} type="button" className={"transport-tab " + (mode === item.value ? "selected" : "")} aria-pressed={mode === item.value} onClick={() => { setMode(item.value); setVehicle(""); }}>
            <Icon name={item.icon} />{item.label}
          </button>)}
        </div>
      </div>
      <div className="quote-scope-row">
        <div className="field">
          <label htmlFor="transport-scope">دامنهٔ حمل</label>
          <div className="select-wrap"><select id="transport-scope" name="scope" value={scope} required aria-invalid={Boolean(errors.scope)} aria-describedby={errors.scope ? "scope-error" : undefined} onChange={(event) => { setScope(event.target.value); setErrors((current) => ({ ...current, scope: "" })); }}>
            <option value="">دامنهٔ حمل را انتخاب کنید</option>
            {TRANSPORT_SCOPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select><Icon name="chevron-down" /></div>
          {errors.scope && <span className="field-error" id="scope-error">{errors.scope}</span>}
        </div>
        <div className="field">
          <label htmlFor="route-name">نام مسیر <span className="optional">اختیاری</span></label>
          <input id="route-name" name="routeName" defaultValue={draft.get("routeName") || ""} maxLength={80} placeholder="مثلاً محمولهٔ نمایشگاهی" />
        </div>
      </div>
      <div className="route-fields">
        <fieldset className="route-fieldset"><legend><span className="route-dot" />مبدأ بارگیری <span className="step-marker">۰۱</span></legend>
          <div className="field-pair">
            <Combobox id="origin-country" name="originCountry" label="کشور مبدأ" value={route.originCountry} options={COUNTRIES} required error={errors.originCountry} placeholder="جستجوی کشور مبدأ" onChange={(value) => updateRoute("originCountry", value)} />
            <Combobox id="origin-city" name="originCity" label="استان / شهر مبدأ" value={route.originCity} options={CITIES[route.originCountry] || []} required disabled={!route.originCountry} error={errors.originCity} placeholder={route.originCountry ? "جستجوی شهر مبدأ" : "ابتدا کشور را انتخاب کنید"} onChange={(value) => updateRoute("originCity", value)} />
          </div>
        </fieldset>
        <button type="button" className="swap-button" aria-label="جابه‌جایی مبدأ و مقصد" onClick={() => { setRoute((current) => swap(current)); setErrors({}); }}><Icon name="arrow-left-right" /></button>
        <fieldset className="route-fieldset"><legend><span className="route-dot destination-dot" />مقصد بارگیری <span className="step-marker">۰۲</span></legend>
          <div className="field-pair">
            <Combobox id="destination-country" name="destinationCountry" label="کشور مقصد" value={route.destinationCountry} options={COUNTRIES} required error={errors.destinationCountry} placeholder="جستجوی کشور مقصد" onChange={(value) => updateRoute("destinationCountry", value)} />
            <Combobox id="destination-city" name="destinationCity" label="استان / شهر مقصد" value={route.destinationCity} options={CITIES[route.destinationCountry] || []} required disabled={!route.destinationCountry} error={errors.destinationCity} placeholder={route.destinationCountry ? "جستجوی شهر مقصد" : "ابتدا کشور را انتخاب کنید"} onChange={(value) => updateRoute("destinationCity", value)} />
          </div>
        </fieldset>
      </div>
      <p id="quote-data-note" className="quote-data-note">فهرست محلی فعلی: ۵ کشور و ۱۴ شهر؛ پوشش جهانی کامل نیست. کشور و شهر را از پیشنهادها انتخاب کنید.</p>
      <div className="cargo-fields">
        <Combobox id="cargo-type" name="cargoType" label="نوع بار (اختیاری)" value={cargoType} options={CARGO_TYPES} error={errors.cargoType} placeholder="جستجوی نوع کالا" onChange={(value) => { setCargoType(value); setCargoSuggestion(""); }} hint="دسته‌بندی محلی؛ تحلیل هوشمند زنده فعال نیست." />
        <div className="field">
          <label htmlFor="vehicle-type">نوع حمل / وسیله نقلیه</label>
          <div className="select-wrap"><select id="vehicle-type" name="vehicleType" value={vehicle} onChange={(event) => setVehicle(event.target.value)}><option value="">پس از بررسی مشخصات انتخاب شود</option>{VEHICLE_OPTIONS[mode].map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><Icon name="chevron-down" /></div>
        </div>
        <div className="field weight-field">
          <label htmlFor="cargo-weight">وزن تقریبی <span className="optional">اختیاری</span></label>
          <div className="unit-input"><input id="cargo-weight" name="weight" defaultValue={draft.get("weight") || ""} inputMode="decimal" placeholder="مثلاً ۲۴۰۰۰" maxLength={14} aria-invalid={Boolean(errors.weight)} aria-describedby={errors.weight ? "cargo-weight-error" : undefined} /><span>کیلوگرم</span></div>
          {errors.weight && <span id="cargo-weight-error" className="field-error">{errors.weight}</span>}
        </div>
      </div>
      <CargoAssistant onAccept={(value, suggestionId) => { setCargoType(value); setCargoSuggestion(suggestionId); }} />
      <button type="button" className="details-toggle" aria-expanded={advancedOpen} aria-controls="quote-advanced" onClick={() => setAdvancedOpen((value) => !value)}><Icon name={advancedOpen ? "minus" : "plus"} /><span>{advancedOpen ? "بستن جزئیات بیشتر" : "جزئیات بیشتر"}</span><small>محل بارگیری، تخلیه و زمان آماده‌سازی</small></button>
      <div id="quote-advanced" className="advanced-fields" hidden={!advancedOpen}>
        <div className="field"><label htmlFor="pickup-place">محل بارگیری <span className="optional">اختیاری</span></label><input id="pickup-place" name="pickupPlace" defaultValue={draft.get("pickup") || ""} maxLength={120} placeholder="نام شهرک، انبار یا پایانه" /></div>
        <div className="field"><label htmlFor="dropoff-place">محل تخلیه <span className="optional">اختیاری</span></label><input id="dropoff-place" name="dropoffPlace" defaultValue={draft.get("dropoff") || ""} maxLength={120} placeholder="نام انبار یا نشانی کلی" /></div>
        <div className="field"><label htmlFor="cargo-ready">زمان آماده‌سازی</label><div className="select-wrap"><select id="cargo-ready" name="ready" defaultValue={draft.get("ready") || ""}><option value="">انتخاب کنید</option><option>آماده ارسال</option><option>این هفته</option><option>هفته آینده</option></select><Icon name="chevron-down" /></div></div>
      </div>
      {referral?.source === "ai" && <p className="quote-data-note"><Icon name="sparkles" /> این پیش‌نویس با ارجاع از گفت‌وگوی نمونه شروع شده است؛ هیچ معامله یا کارمزدی ایجاد نشده است.</p>}
      <div className="quote-footer">
        <p><Icon name="circle-question-mark" />مرحلهٔ بعد: تکمیل و مرور اطلاعات؛ بدون ثبت درخواست واقعی</p>
        <button type="submit" className="button button-primary quote-submit" disabled={submitting}><span>{submitting ? "در حال آماده‌سازی…" : "استعلام نرخ حمل"}</span><Icon name="arrow-left" /></button>
      </div>
      {errors.storage && <p className="field-error quote-data-note" role="alert">{errors.storage}</p>}
      <p className="sr-only" role="status">{Object.values(errors).filter(Boolean).join(" ")}</p>
    </form>
  );
}
const cities = Object.fromEntries(Object.entries(CITIES).map(([key, items]) => [key, items.map((item) => [item.value, item.label])]));
const countries = COUNTRIES.map((item) => [item.value, item.label]);
const vehicleOptions = Object.fromEntries(Object.entries(VEHICLE_OPTIONS).map(([key, items]) => [key, items.map((item) => [item.value, item.label])]));
export { cities, countries, toLatinDigits, normalizeDecimal, vehicleOptions };
