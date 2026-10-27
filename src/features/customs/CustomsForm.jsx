import { useState } from "react";
import { useDialog } from "../../components/DialogContext.jsx";
import { Icon } from "../../components/Icon.jsx";
import { normalizeDecimal, toLatinDigits } from "../quote/QuoteForm.jsx";
import { savePreview } from "../concepts/previewStorage.js";

const operations = [
  ["import", "واردات"],
  ["export", "صادرات"],
];

export function CustomsForm() {
  const [operation, setOperation] = useState("import");
  const [errors, setErrors] = useState({});
  const { openDialog } = useDialog();

  function submit(event) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const goods = String(values.get("goods") || "").trim();
    const hs = toLatinDigits(String(values.get("hsCode") || "")).trim();
    const nextErrors = {};
    if (!goods) nextErrors.goods = "نوع کالا را وارد کنید.";
    if (hs && !/^\d{4}(\d{2})?(\d{2})?$/.test(hs))
      nextErrors.hsCode = "کد را با ۴، ۶ یا ۸ رقم وارد کنید.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      event.currentTarget
        .querySelector(`[name="${Object.keys(nextErrors)[0]}"]`)
        ?.focus();
      return;
    }

    const details = new URLSearchParams({
      operation,
      goods,
      hs,
      office: String(values.get("office") || "انتخاب نشده"),
    });
    if (!savePreview("customs", details)) {
      setErrors({
        storage:
          "مرورگر نتوانست اطلاعات پیش‌نمایش را نگه دارد. دوباره تلاش کنید.",
      });
      return;
    }
    window.location.assign("?view=customs");
  }

  return (
    <form
      className="customs-form"
      id="customs-form"
      noValidate
      onSubmit={submit}
    >
      <div className="customs-form-title">
        <span className="step-label">مرحله اول</span>
        <h3>کالای خود را معرفی کنید</h3>
      </div>
      <div
        className="segmented operation-switch"
        role="group"
        aria-label="نوع عملیات"
      >
        {operations.map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={operation === value ? "selected" : ""}
            aria-pressed={operation === value}
            onClick={() => setOperation(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="field">
        <label htmlFor="goods-name">نوع کالا</label>
        <input
          id="goods-name"
          name="goods"
          placeholder="مثلاً قطعات صنعتی"
          maxLength={100}
          required
          aria-invalid={errors.goods ? "true" : undefined}
          aria-describedby={errors.goods ? "goods-name-error" : undefined}
        />
        <span id="goods-name-error" className="field-error">
          {errors.goods || ""}
        </span>
      </div>
      <div className="field-pair">
        <div className="field">
          <label htmlFor="hs-code">
            کد تعرفه <bdi>(HS)</bdi> <span className="optional">اختیاری</span>
          </label>
          <input
            id="hs-code"
            name="hsCode"
            dir="ltr"
            inputMode="numeric"
            placeholder="مثلاً 8479"
            maxLength={8}
            aria-invalid={errors.hsCode ? "true" : undefined}
            aria-describedby={errors.hsCode ? "hs-code-error" : undefined}
          />
          <span id="hs-code-error" className="field-error">
            {errors.hsCode || ""}
          </span>
        </div>
        <div className="field">
          <label htmlFor="customs-office">گمرک موردنظر</label>
          <div className="select-wrap">
            <select id="customs-office" name="office" defaultValue="">
              <option value="">انتخاب کنید</option>
              <option>شهید رجایی</option>
              <option>تهران</option>
              <option>بازرگان</option>
              <option>فرودگاه امام خمینی</option>
            </select>
            <Icon name="chevron-down" />
          </div>
        </div>
      </div>
      <button type="submit" className="button button-outline customs-submit">
        شروع استعلام هزینه ترخیص <Icon name="arrow-left" />
      </button>
      {errors.storage && (
        <p className="field-error" role="alert">
          {errors.storage}
        </p>
      )}
      <p className="form-footnote">
        برآورد نهایی به مشخصات کامل کالا و شرایط پرونده وابسته است.
      </p>
    </form>
  );
}
