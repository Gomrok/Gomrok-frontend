import { useEffect, useRef, useState } from "react";
import { Icon } from "../../components/Icon.jsx";
import { savePreview } from "../concepts/previewStorage.js";

const cities = {
  iran: [
    ["tehran", "تهران"],
    ["isfahan", "اصفهان"],
    ["bandarabbas", "بندرعباس"],
    ["tabriz", "تبریز"],
    ["mashhad", "مشهد"],
  ],
  turkey: [
    ["istanbul", "استانبول"],
    ["ankara", "آنکارا"],
    ["mersin", "مرسین"],
  ],
  uae: [
    ["dubai", "دبی"],
    ["abudhabi", "ابوظبی"],
  ],
  iraq: [
    ["baghdad", "بغداد"],
    ["basra", "بصره"],
  ],
  china: [
    ["shanghai", "شانگهای"],
    ["guangzhou", "گوانگژو"],
  ],
};

const countries = [
  ["iran", "ایران"],
  ["turkey", "ترکیه"],
  ["uae", "امارات"],
  ["iraq", "عراق"],
  ["china", "چین"],
];

const vehicleOptions = {
  road: [
    ["flatbed", "تریلی کفی"],
    ["curtain", "تریلی چادری"],
    ["refrigerated", "یخچال‌دار"],
  ],
  sea: [
    ["fcl", "کانتینر کامل (FCL)"],
    ["lcl", "خرده‌بار (LCL)"],
  ],
  air: [["aircargo", "بار هوایی"]],
};

const toLatinDigits = (value) =>
  value.replace(/[۰-۹٠-٩]/g, (digit) =>
    String(
      digit.charCodeAt(0) >= 0x6f0
        ? digit.charCodeAt(0) - 0x6f0
        : digit.charCodeAt(0) - 0x660,
    ),
  );

function normalizeDecimal(value) {
  const normalized = toLatinDigits(value).trim().replace("٫", ".");
  if (!normalized) return "";
  if (
    /[٬,]/.test(normalized) &&
    !/^\d{1,3}(?:[٬,]\d{3})+(?:\.\d{1,2})?$/.test(normalized)
  )
    return null;
  const number = normalized.replaceAll("٬", "").replaceAll(",", "");
  return /^\d+(?:\.\d{1,2})?$/.test(number) ? number : null;
}

function SelectField({
  id,
  name,
  label,
  value,
  options,
  onChange,
  error,
  required = false,
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="select-wrap">
        <select
          id={id}
          name={name}
          value={value}
          required={required}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={onChange}
        >
          {options.map(([optionValue, optionLabel]) => (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          ))}
        </select>
        <Icon name="chevron-down" />
      </div>
      <span id={`${id}-error`} className="field-error">
        {error || ""}
      </span>
    </div>
  );
}

export function QuoteForm() {
  const [route, setRoute] = useState({
    originCountry: "iran",
    originCity: "",
    destinationCountry: "turkey",
    destinationCity: "",
  });
  const [mode, setMode] = useState("road");
  const [vehicle, setVehicle] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const focusWeightAfterExpand = useRef(false);
  const weightRef = useRef(null);

  useEffect(() => {
    if (advancedOpen && focusWeightAfterExpand.current) {
      weightRef.current?.focus({ preventScroll: true });
      weightRef.current?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
      focusWeightAfterExpand.current = false;
    }
  }, [advancedOpen]);

  function updateRoute(key, value) {
    setRoute((current) => ({
      ...current,
      [key]: value,
      ...(key.endsWith("Country")
        ? { [key.replace("Country", "City")]: "" }
        : {}),
    }));
    if (key.endsWith("City"))
      setErrors((current) => ({ ...current, [key]: "" }));
  }

  function swapRoute() {
    setRoute((current) => ({
      originCountry: current.destinationCountry,
      originCity: cities[current.destinationCountry]?.some(
        ([value]) => value === current.destinationCity,
      )
        ? current.destinationCity
        : "",
      destinationCountry: current.originCountry,
      destinationCity: cities[current.originCountry]?.some(
        ([value]) => value === current.originCity,
      )
        ? current.originCity
        : "",
    }));
    setErrors({});
  }

  function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const weight = normalizeDecimal(String(values.get("weight") || ""));
    const nextErrors = {};
    if (!route.originCity)
      nextErrors.originCity = "استان یا شهر مبدأ را انتخاب کنید.";
    if (!route.destinationCity)
      nextErrors.destinationCity = "استان یا شهر مقصد را انتخاب کنید.";
    if (
      weight === null ||
      (weight && (Number(weight) <= 0 || Number(weight) > 1_000_000))
    ) {
      nextErrors.weight =
        "وزن باید بیشتر از صفر و حداکثر ۱٬۰۰۰٬۰۰۰ کیلوگرم باشد.";
      if (!advancedOpen) {
        focusWeightAfterExpand.current = true;
        setAdvancedOpen(true);
      } else weightRef.current?.focus();
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      if (nextErrors.originCity || nextErrors.destinationCity) {
        requestAnimationFrame(() =>
          document
            .getElementById(
              nextErrors.originCity ? "origin-city" : "destination-city",
            )
            ?.focus(),
        );
      }
      return;
    }

    const detail = new URLSearchParams({
      origin:
        cities[route.originCountry].find(
          ([value]) => value === route.originCity,
        )?.[1] || "",
      destination:
        cities[route.destinationCountry].find(
          ([value]) => value === route.destinationCity,
        )?.[1] || "",
      originCountry: route.originCountry,
      destinationCountry: route.destinationCountry,
      goods: String(values.get("cargoType") || ""),
      weight: weight || "",
      mode,
      vehicle: String(values.get("vehicleType") || ""),
      pickup: String(values.get("pickupPlace") || ""),
      dropoff: String(values.get("dropoffPlace") || ""),
      ready: String(values.get("ready") || ""),
    });
    if (!savePreview("quote", detail)) {
      setErrors({
        storage:
          "مرورگر نتوانست اطلاعات پیش‌نمایش را نگه دارد. دوباره تلاش کنید.",
      });
      return;
    }
    window.location.assign("?view=quote");
  }

  return (
    <form
      id="quote"
      className="quote-panel"
      data-figma="Form/FreightQuote"
      noValidate
      onSubmit={submit}
    >
      <div className="quote-panel-heading">
        <div>
          <span className="overline">اولین قدم، یک مسیر مشخص</span>
          <h2>بار شما از کجا به کجا می‌رود؟</h2>
        </div>
        <div className="transport-tabs" role="group" aria-label="شیوه حمل">
          {[
            ["road", "truck", "زمینی"],
            ["sea", "ship", "دریایی"],
            ["air", "plane", "هوایی"],
          ].map(([value, icon, label]) => (
            <button
              key={value}
              type="button"
              className={`transport-tab ${mode === value ? "selected" : ""}`}
              aria-pressed={mode === value}
              onClick={() => {
                setMode(value);
                setVehicle("");
              }}
            >
              <Icon name={icon} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="route-fields">
        <fieldset className="route-fieldset">
          <legend>
            <span className="route-dot" />
            مبدأ بارگیری <span className="step-marker">۰۱</span>
          </legend>
          <div className="field-pair">
            <SelectField
              id="origin-country"
              name="originCountry"
              label="کشور مبدأ"
              value={route.originCountry}
              required
              options={countries}
              onChange={(event) =>
                updateRoute("originCountry", event.target.value)
              }
            />
            <SelectField
              id="origin-city"
              name="originCity"
              label="استان / شهر مبدأ"
              value={route.originCity}
              required
              error={errors.originCity}
              options={[["", "انتخاب کنید"], ...cities[route.originCountry]]}
              onChange={(event) =>
                updateRoute("originCity", event.target.value)
              }
            />
          </div>
        </fieldset>
        <button
          type="button"
          className="swap-button"
          aria-label="جابه‌جایی مبدأ و مقصد"
          onClick={swapRoute}
        >
          <Icon name="arrow-left-right" />
        </button>
        <fieldset className="route-fieldset">
          <legend>
            <span className="route-dot destination-dot" />
            مقصد بارگیری <span className="step-marker">۰۲</span>
          </legend>
          <div className="field-pair">
            <SelectField
              id="destination-country"
              name="destinationCountry"
              label="کشور مقصد"
              value={route.destinationCountry}
              required
              options={countries}
              onChange={(event) =>
                updateRoute("destinationCountry", event.target.value)
              }
            />
            <SelectField
              id="destination-city"
              name="destinationCity"
              label="استان / شهر مقصد"
              value={route.destinationCity}
              required
              error={errors.destinationCity}
              options={[
                ["", "انتخاب کنید"],
                ...cities[route.destinationCountry],
              ]}
              onChange={(event) =>
                updateRoute("destinationCity", event.target.value)
              }
            />
          </div>
        </fieldset>
      </div>

      <div className="cargo-fields">
        <div className="field">
          <label htmlFor="cargo-type">
            نوع بار <span className="optional">اختیاری</span>
          </label>
          <div className="select-wrap">
            <select id="cargo-type" name="cargoType">
              <option value="">نوع کالا را انتخاب کنید</option>
              <option value="general">کالای عمومی</option>
              <option value="industrial">قطعات صنعتی</option>
              <option value="food">مواد غذایی</option>
              <option value="other">سایر</option>
            </select>
            <Icon name="chevron-down" />
          </div>
        </div>
        <div className="field">
          <label htmlFor="vehicle-type">نوع حمل / وسیله نقلیه</label>
          <div className="select-wrap">
            <select
              id="vehicle-type"
              name="vehicleType"
              value={vehicle}
              onChange={(event) => setVehicle(event.target.value)}
            >
              <option value="">پیشنهاد مناسب بار من</option>
              {vehicleOptions[mode].map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <Icon name="chevron-down" />
          </div>
        </div>
        <div className="field weight-field">
          <label htmlFor="cargo-weight">
            وزن تقریبی <span className="optional">اختیاری</span>
          </label>
          <div className="unit-input">
            <input
              id="cargo-weight"
              name="weight"
              ref={weightRef}
              inputMode="decimal"
              placeholder="مثلاً ۲۴۰۰۰"
              maxLength={10}
              aria-invalid={errors.weight ? "true" : undefined}
              aria-describedby={
                errors.weight ? "cargo-weight-error" : undefined
              }
            />
            <span>کیلوگرم</span>
          </div>
          <span id="cargo-weight-error" className="field-error">
            {errors.weight || ""}
          </span>
        </div>
      </div>

      <button
        type="button"
        className="details-toggle"
        aria-expanded={advancedOpen}
        aria-controls="quote-advanced"
        onClick={() => setAdvancedOpen((value) => !value)}
      >
        <Icon name={advancedOpen ? "minus" : "plus"} />
        <span>{advancedOpen ? "بستن جزئیات بیشتر" : "جزئیات بیشتر"}</span>
        <small>محل بارگیری، تخلیه و زمان آماده‌سازی</small>
      </button>
      <div
        id="quote-advanced"
        className="advanced-fields"
        hidden={!advancedOpen}
      >
        <div className="field">
          <label htmlFor="pickup-place">
            محل بارگیری <span className="optional">اختیاری</span>
          </label>
          <input
            id="pickup-place"
            name="pickupPlace"
            maxLength={120}
            placeholder="نام شهرک، انبار یا پایانه"
          />
        </div>
        <div className="field">
          <label htmlFor="dropoff-place">
            محل تخلیه <span className="optional">اختیاری</span>
          </label>
          <input
            id="dropoff-place"
            name="dropoffPlace"
            maxLength={120}
            placeholder="نام انبار یا نشانی کلی"
          />
        </div>
        <div className="field">
          <label htmlFor="cargo-ready">زمان آماده‌سازی</label>
          <div className="select-wrap">
            <select id="cargo-ready" name="ready">
              <option value="">انتخاب کنید</option>
              <option>آماده ارسال</option>
              <option>این هفته</option>
              <option>هفته آینده</option>
            </select>
            <Icon name="chevron-down" />
          </div>
        </div>
      </div>
      <div className="quote-footer">
        <p>
          <Icon name="circle-question-mark" />
          استعلام نرخ حمل و خدمات گمرکی، در یک مسیر ساده
        </p>
        <button type="submit" className="button button-primary quote-submit">
          <span>استعلام نرخ حمل</span>
          <Icon name="arrow-left" />
        </button>
      </div>
      {errors.storage && (
        <p className="field-error" role="alert">
          {errors.storage}
        </p>
      )}
      <p id="quote-status" className="sr-only" role="status" aria-live="polite">
        {Object.values(errors).filter(Boolean).join(" ")}
      </p>
    </form>
  );
}

export { cities, countries, toLatinDigits, normalizeDecimal, vehicleOptions };
