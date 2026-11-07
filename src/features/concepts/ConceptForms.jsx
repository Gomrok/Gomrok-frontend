import { useState } from "react";
import { useDialog } from "../../components/DialogContext.jsx";
import { Icon } from "../../components/Icon.jsx";
import { normalizeDecimal, toLatinDigits, faNumber, makeId } from "../../utils/format.js";
import { readPreview, savePreview } from "./previewStorage.js";
import { writeSession } from "../../services/session.js";
import { useWorkspace } from "../../contexts/WorkspaceContext.jsx";

export function QuoteDetailsForm({ summary }) {
  const { state, transact } = useWorkspace();
  const [errors, setErrors] = useState({});
  const [review, setReview] = useState(null);
  function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const goods = String(values.get("goods") || "").trim();
    const weight = normalizeDecimal(values.get("weight"));
    const nextErrors = {};
    if (!goods) nextErrors.goods = "شرح کالا را وارد کنید.";
    if (weight === null || (weight && (Number(weight) <= 0 || Number(weight) > 1_000_000))) nextErrors.weight = "وزن باید بیشتر از صفر و حداکثر ۱٬۰۰۰٬۰۰۰ کیلوگرم باشد.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) { form.querySelector('[name="' + Object.keys(nextErrors)[0] + '"]')?.focus(); return; }
    const data = { goods, weight: weight || "", packaging: String(values.get("packaging") || ""), note: String(values.get("note") || "").trim() };
    const params = readPreview("quote");
    Object.entries({ ...data, goodsLabel: goods }).forEach(([key, value]) => params.set(key, value));
    if (!savePreview("quote", params)) { setErrors({ storage: "مرورگر اجازهٔ نگه‌داری موقت پیش‌نویس را نداد. دوباره تلاش کنید." }); return; }
    setReview(data);
    requestAnimationFrame(() => document.getElementById("review-request-heading")?.focus());
  }
  function saveDraft() {
    const params = Object.fromEntries(readPreview("quote"));
    const existing = state.requests.find((item) => item.id === params.id && item.ownerRole === "shipper" && item.status === "draft");
    const data = { ...params, ...review, id: existing?.id || makeId("request"), kind: "preview", status: "draft", savedAt: new Date().toISOString() };
    if (!writeSession("draft-request", data)) {
      setErrors({ storage: "ذخیرهٔ محلی انجام نشد. دوباره تلاش کنید." }); return;
    }
    try { transact({ type: "request/save", role: "shipper", data }); }
    catch (error) { setErrors({ storage: error.message }); return; }
    window.history.pushState({}, "", "?view=panel&role=shipper&tab=requests");
    window.dispatchEvent(new PopStateEvent("popstate")); window.scrollTo({ top: 0, behavior: "instant" });
  }
  return <div className="quote-details-controller">
    <form className="request-form" noValidate onSubmit={submit} onChange={() => setReview(null)}>
      <h2 className="form-section-title">مشخصات محموله</h2>
      <div className="request-fields">
        <div className="field full-field"><label htmlFor="request-goods">شرح کالا</label><input id="request-goods" name="goods" defaultValue={summary.goods} placeholder="نوع کالا و توضیح کوتاه" maxLength={120} required aria-invalid={Boolean(errors.goods)} aria-describedby={errors.goods ? "request-goods-error" : undefined} />{errors.goods && <span className="field-error" id="request-goods-error">{errors.goods}</span>}</div>
        <div className="field"><label htmlFor="request-weight">وزن تقریبی <span className="optional">کیلوگرم</span></label><input id="request-weight" name="weight" defaultValue={summary.weightRaw} inputMode="decimal" placeholder="مثلاً ۲۴۰۰۰" maxLength={14} aria-invalid={Boolean(errors.weight)} aria-describedby={errors.weight ? "request-weight-error" : undefined} />{errors.weight && <span className="field-error" id="request-weight-error">{errors.weight}</span>}</div>
        <div className="field"><label htmlFor="request-package">نوع بسته‌بندی</label><div className="select-wrap"><select id="request-package" name="packaging" defaultValue={summary.packaging || ""}><option value="">انتخاب کنید</option><option>پالت</option><option>کارتن</option><option>فله</option><option>سایر</option></select><Icon name="chevron-down" /></div></div>
        <div className="field full-field"><label htmlFor="request-note">توضیحات تکمیلی <span className="optional">اختیاری</span></label><textarea id="request-note" name="note" defaultValue={summary.note} placeholder="شرایط بارگیری، محدودیت‌ها یا نکات محموله" maxLength={500} /></div>
      </div>
      <button type="submit" className="button button-primary">مرور مشخصات درخواست <Icon name="arrow-left" /></button>
      <p className="dialog-note">اطلاعات برای مرور در همین تب نگه‌داری می‌شود؛ به سرور ارسال نمی‌شود و درخواست واقعی ایجاد نشده است.</p>
    </form>
    {review && <section className="review-request" aria-label="مرور مشخصات درخواست"><h3 id="review-request-heading" tabIndex={-1}>اطلاعات برای مرور آماده است</h3><dl><dt>مسیر</dt><dd>{summary.origin} ← {summary.destination}</dd><dt>نام مسیر</dt><dd>{summary.routeName || "بدون نام"}</dd><dt>دامنهٔ حمل</dt><dd>{summary.scopeLabel}</dd><dt>شیوه و وسیله</dt><dd>{summary.modeLabel}{summary.vehicle ? " · " + summary.vehicle : ""}</dd><dt>کالا</dt><dd>{review.goods}</dd><dt>وزن</dt><dd>{review.weight ? faNumber.format(Number(review.weight)) + " کیلوگرم" : "تعیین نشده"}</dd><dt>بسته‌بندی</dt><dd>{review.packaging || "تعیین نشده"}</dd><dt>توضیحات</dt><dd>{review.note || "ندارد"}</dd></dl><p className="field-hint">این پیش‌نویس هیچ رزرو، بدهی یا معامله‌ای ایجاد نمی‌کند.</p><div className="panel-actions"><button type="button" className="button button-primary" onClick={saveDraft}>ذخیرهٔ پیش‌نویس و دیدن پنل نمونه</button><a className="text-link" href="?edit=quote#quote">اصلاح مسیر</a></div></section>}
    {errors.storage && <p className="field-error resource-message" role="alert">{errors.storage}</p>}
  </div>;
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
      nextErrors.customsValue = "یک مبلغ مثبت با واحد پول مشخص وارد کنید.";
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
            aria-invalid={errors.customsValue ? "true" : undefined}
            aria-describedby={errors.customsValue ? "customs-value-error" : undefined}
          />
          <span id="customs-value-error" className="field-error">
            {errors.customsValue || ""}
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
