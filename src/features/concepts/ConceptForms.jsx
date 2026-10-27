import { useState } from "react";
import { useDialog } from "../../components/DialogContext.jsx";
import { Icon } from "../../components/Icon.jsx";
import { normalizeDecimal, toLatinDigits } from "../quote/QuoteForm.jsx";

export function QuoteDetailsForm({ summary }) {
  const [errors, setErrors] = useState({});
  const { openDialog } = useDialog();

  function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const goods = String(values.get("goods") || "").trim();
    const weight = normalizeDecimal(String(values.get("weight") || ""));
    const nextErrors = {};
    if (!goods) nextErrors.goods = "شرح کالا را وارد کنید.";
    if (
      weight === null ||
      (weight && (Number(weight) <= 0 || Number(weight) > 1_000_000))
    )
      nextErrors.weight =
        "وزن باید بیشتر از صفر و حداکثر ۱٬۰۰۰٬۰۰۰ کیلوگرم باشد.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      form.querySelector(`[name="${Object.keys(nextErrors)[0]}"]`)?.focus();
      return;
    }
    openDialog(
      "مشخصات برای مرور آماده است",
      "در نمونهٔ طراحی، این مرحله مسیر مرور اطلاعات و اصلاح پیش از ارسال را نشان می‌دهد. اطلاعات شما ارسال یا ذخیره نشده و درخواست واقعی ایجاد نشده است.",
    );
  }

  return (
    <form className="request-form" noValidate onSubmit={submit}>
      <h2 className="form-section-title">مشخصات محموله</h2>
      <div className="request-fields">
        <div className="field full-field">
          <label htmlFor="request-goods">شرح کالا</label>
          <input
            id="request-goods"
            name="goods"
            defaultValue={summary.goods}
            placeholder="نوع کالا و توضیح کوتاه"
            maxLength={120}
            required
            aria-invalid={errors.goods ? "true" : undefined}
            aria-describedby={errors.goods ? "request-goods-error" : undefined}
          />
          <span id="request-goods-error" className="field-error">
            {errors.goods || ""}
          </span>
        </div>
        <div className="field">
          <label htmlFor="request-weight">
            وزن تقریبی <span className="optional">کیلوگرم</span>
          </label>
          <input
            id="request-weight"
            name="weight"
            data-number-kind="weight"
            defaultValue={summary.weight}
            inputMode="decimal"
            placeholder="مثلاً ۲۴۰۰۰"
            maxLength={10}
            aria-invalid={errors.weight ? "true" : undefined}
            aria-describedby={
              errors.weight ? "request-weight-error" : undefined
            }
          />
          <span id="request-weight-error" className="field-error">
            {errors.weight || ""}
          </span>
        </div>
        <div className="field">
          <label htmlFor="request-package">نوع بسته‌بندی</label>
          <div className="select-wrap">
            <select id="request-package" name="packaging" defaultValue="">
              <option value="">انتخاب کنید</option>
              <option>پالت</option>
              <option>کارتن</option>
              <option>فله</option>
              <option>سایر</option>
            </select>
            <Icon name="chevron-down" />
          </div>
        </div>
        <div className="field full-field">
          <label htmlFor="request-note">
            توضیحات تکمیلی <span className="optional">اختیاری</span>
          </label>
          <textarea
            id="request-note"
            name="note"
            defaultValue={summary.note}
            placeholder="شرایط بارگیری، محدودیت‌ها یا نکات محموله"
            maxLength={500}
          />
        </div>
      </div>
      <button className="button button-primary" type="submit">
        مرور مشخصات درخواست <Icon name="arrow-left" />
      </button>
      <p className="dialog-note">
        این فرم فقط نمونهٔ مسیر کاربر است. درخواست واقعی ثبت نمی‌شود و هیچ مبلغ
        قطعی نمایش داده نخواهد شد.
      </p>
    </form>
  );
}

export function CustomsDetailsForm({ summary }) {
  const [errors, setErrors] = useState({});
  const { openDialog } = useDialog();

  function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const goods = String(values.get("goods") || "").trim();
    const hs = toLatinDigits(String(values.get("hs") || "")).trim();
    const amount = normalizeDecimal(String(values.get("customsValue") || ""));
    const nextErrors = {};
    if (!goods) nextErrors.goods = "نوع کالا را وارد کنید.";
    if (hs && !/^\d{4}(\d{2})?(\d{2})?$/.test(hs))
      nextErrors.hs = "کد را با ۴، ۶ یا ۸ رقم وارد کنید.";
    if (amount === null || (amount && Number(amount) <= 0))
      nextErrors.value = "یک مبلغ مثبت با واحد پول مشخص وارد کنید.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      form.querySelector(`[name="${Object.keys(nextErrors)[0]}"]`)?.focus();
      return;
    }
    openDialog(
      "مشخصات پرونده آمادهٔ مرور است",
      "این نمونه مبلغ حقوق ورودی یا هزینهٔ ترخیص محاسبه نمی‌کند. اطلاعات ثبت یا ارسال نشده است.",
    );
  }

  return (
    <form className="request-form" noValidate onSubmit={submit}>
      <h2 className="form-section-title">اطلاعات تکمیلی کالا</h2>
      <div className="request-fields">
        <div className="field full-field">
          <label htmlFor="customs-goods">نوع کالا</label>
          <input
            id="customs-goods"
            name="goods"
            defaultValue={summary.goods}
            placeholder="مثلاً قطعات صنعتی"
            maxLength={120}
            required
            aria-invalid={errors.goods ? "true" : undefined}
            aria-describedby={errors.goods ? "customs-goods-error" : undefined}
          />
          <span id="customs-goods-error" className="field-error">
            {errors.goods || ""}
          </span>
        </div>
        <div className="field">
          <label htmlFor="customs-hs">
            کد تعرفه <bdi>(HS)</bdi>
          </label>
          <input
            id="customs-hs"
            name="hs"
            defaultValue={summary.hs}
            dir="ltr"
            inputMode="numeric"
            maxLength={8}
            placeholder="8479"
            aria-invalid={errors.hs ? "true" : undefined}
            aria-describedby={errors.hs ? "customs-hs-error" : undefined}
          />
          <span id="customs-hs-error" className="field-error">
            {errors.hs || ""}
          </span>
        </div>
        <div className="field">
          <label htmlFor="customs-origin">مبدأ کالا</label>
          <div className="select-wrap">
            <select id="customs-origin" name="origin" defaultValue="">
              <option value="">انتخاب کنید</option>
              <option>چین</option>
              <option>ترکیه</option>
              <option>امارات</option>
              <option>سایر</option>
            </select>
            <Icon name="chevron-down" />
          </div>
        </div>
        <div className="field">
          <label htmlFor="customs-value">
            ارزش گمرکی <span className="optional">اختیاری</span>
          </label>
          <input
            id="customs-value"
            name="customsValue"
            data-number-kind="currency"
            dir="ltr"
            inputMode="decimal"
            placeholder="0.00"
            maxLength={15}
            aria-invalid={errors.value ? "true" : undefined}
            aria-describedby={errors.value ? "customs-value-error" : undefined}
          />
          <span id="customs-value-error" className="field-error">
            {errors.value || ""}
          </span>
        </div>
        <div className="field">
          <label htmlFor="customs-currency">واحد پول</label>
          <div className="select-wrap">
            <select
              id="customs-currency"
              name="currency"
              defaultValue="دلار (USD)"
            >
              <option>دلار (USD)</option>
              <option>یورو (EUR)</option>
              <option>درهم (AED)</option>
              <option>ریال (IRR)</option>
            </select>
            <Icon name="chevron-down" />
          </div>
        </div>
      </div>
      <button className="button button-primary" type="submit">
        مرور اطلاعات پرونده <Icon name="arrow-left" />
      </button>
      <p className="dialog-note">
        این نمونه مبلغ حقوق ورودی یا هزینهٔ ترخیص تولید نمی‌کند؛ محاسبهٔ واقعی
        به قوانین معتبر، مشخصات کامل و بررسی تخصصی وابسته است.
      </p>
    </form>
  );
}
