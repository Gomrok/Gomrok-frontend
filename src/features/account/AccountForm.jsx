import { useEffect, useRef, useState } from "react";
import { ROLE_CONFIG } from "../../config/platform.js";
import { destinationForIdentity, validateAccount } from "../../domain/accounts.js";
import { normalizePhone } from "../../utils/format.js";
import { createAuthService } from "../../services/integrations.js";
import { Icon } from "../../components/Icon.jsx";

const auth = createAuthService();
const steps = ["اطلاعات اولیه", "اطلاعات نقش", "مرور و ادامه"];
export function AccountForm({ role, signup = false }) {
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [summary, setSummary] = useState(null);
  const formRef = useRef(null);
  const headingRef = useRef(null);
  const config = ROLE_CONFIG[role];
  useEffect(() => { if (step > 0) headingRef.current?.focus({ preventScroll: true }); }, [step]);
  function values() { return Object.fromEntries(new FormData(formRef.current)); }
  function advance() {
    const data = values();
    const validation = validateAccount(data, role, true);
    const relevant = step === 0 ? ["displayName", "phone"] : [config.field.name, "role"];
    const next = Object.fromEntries(Object.entries(validation).filter(([key]) => relevant.includes(key)));
    setErrors(next); setNotice("");
    if (Object.keys(next).length) { formRef.current.querySelector('[name="' + Object.keys(next)[0] + '"]')?.focus(); return; }
    const phone = normalizePhone(data.phone);
    setSummary({ displayName: data.displayName, phone: phone.slice(0, 4) + "•••" + phone.slice(-4), roleDetail: data[config.field.name], note: data.activityNote });
    setStep((value) => Math.min(2, value + 1));
  }
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    if (signup && step < 2) { advance(); return; }
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const nextErrors = validateAccount(data, role, signup);
    setErrors(nextErrors); setNotice("");
    if (Object.keys(nextErrors).length) {
      if (signup) {
        const key = Object.keys(nextErrors)[0];
        setStep(["displayName", "phone"].includes(key) ? 0 : key === "consent" ? 2 : 1);
        requestAnimationFrame(() => form.querySelector('[name="' + key + '"]')?.focus());
      } else form.querySelector('[name="' + Object.keys(nextErrors)[0] + '"]')?.focus();
      return;
    }
    setBusy(true);
    try {
      const result = signup ? await auth.register({ ...data, phone: normalizePhone(data.phone), role }) : await auth.login({ phone: normalizePhone(data.phone), password: data.password });
      if (!signup && result?.authenticated === true) window.location.assign(destinationForIdentity(result));
      else setNotice("فرم برای اتصال به گردش تأیید حساب آماده است؛ در این نسخه حساب واقعی ساخته نشد.");
    } catch (error) { setNotice(error.code === "NOT_CONFIGURED" ? error.message : "ارتباط با سرویس برقرار نشد. دوباره تلاش کنید."); }
    finally { const password = form.elements.namedItem("password"); if (password) password.value = ""; setBusy(false); }
  }
  function field(name, label, props = {}) {
    return <div className="field" key={name}><label htmlFor={"account-" + name}>{label}</label><input id={"account-" + name} name={name} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? "account-" + name + "-error" : undefined} maxLength={100} {...props} />{errors[name] && <span className="field-error" id={"account-" + name + "-error"}>{errors[name]}</span>}</div>;
  }
  return <form ref={formRef} className="account-form" noValidate onSubmit={submit} aria-busy={busy}>
    <span className="demo-badge">فرانت‌اند تعاملی؛ بدون ساخت حساب یا ورود واقعی</span>
    <h2>{signup ? "ثبت‌نام " + config.label : "ورود مشترک به حساب"}</h2>
    <p className="field-hint">از اطلاعات نمونه استفاده کنید. اطلاعات این فرم در storage ذخیره نمی‌شود.</p>
    {signup ? <>
      <ol className="signup-steps" aria-label="مراحل ثبت‌نام">{steps.map((label, index) => <li key={label} aria-current={step === index ? "step" : undefined}><span>{new Intl.NumberFormat("fa-IR").format(index + 1)}</span>{label}</li>)}</ol>
      <h3 ref={headingRef} tabIndex={-1} className="signup-step-heading">{steps[step]}</h3>
      <fieldset className="account-step" hidden={step !== 0}><legend className="sr-only">اطلاعات اولیه</legend>
        {field("displayName", "نام نمایشی", { required: true, autoComplete: "off", placeholder: "نام آزمایشی" })}
        {field("phone", "شمارهٔ همراه", { type: "tel", inputMode: "tel", dir: "ltr", required: true, autoComplete: "off", placeholder: "09121234567" })}
      </fieldset>
      <fieldset className="account-step" hidden={step !== 1}><legend className="sr-only">اطلاعات نقش</legend>
        <p className="field-hint">{config.description}</p>
        {field(config.field.name, config.field.label + (config.field.required ? "" : " (اختیاری)"), { required: config.field.required, autoComplete: "off", placeholder: config.field.placeholder })}
        <div className="field"><label htmlFor="account-activityNote">توضیح فعالیت (اختیاری)</label><textarea id="account-activityNote" name="activityNote" maxLength={200} rows={3} placeholder="توضیح کوتاه برای بررسی این جریان" /></div>
        <p className="field-hint">مدارک هویتی، اطلاعات بانکی و جزئیات حساس در این فرم درخواست نمی‌شوند.</p>
      </fieldset>
      <fieldset className="account-step" hidden={step !== 2}><legend className="sr-only">مرور و ادامه</legend>
        <dl className="signup-summary"><dt>نقش</dt><dd>{config.label}</dd><dt>نام نمایشی</dt><dd>{summary?.displayName}</dd><dt>همراه نمونه</dt><dd><bdi>{summary?.phone}</bdi></dd><dt>{config.field.label}</dt><dd>{summary?.roleDetail || "وارد نشده"}</dd>{summary?.note && <><dt>توضیح فعالیت</dt><dd>{summary.note}</dd></>}</dl>
        <label className="check-field"><input type="checkbox" name="consent" value="yes" aria-describedby={errors.consent ? "consent-error" : undefined} aria-invalid={Boolean(errors.consent)} />اطلاعات این فرم آزمایشی است و درخواست حساب واقعی محسوب نمی‌شود.</label>
        {errors.consent && <p id="consent-error" className="field-error">{errors.consent}</p>}
      </fieldset>
      <div className="panel-actions">{step > 0 && <button className="button button-outline" type="button" onClick={() => { setStep((value) => value - 1); setErrors({}); setNotice(""); }}>مرحلهٔ قبل</button>}{step < 2 ? <button className="button button-primary" type="button" onClick={advance}>مرحلهٔ بعد <Icon name="arrow-left" /></button> : <button className="button button-primary" disabled={busy}>{busy ? "در حال بررسی…" : "بررسی فرم ثبت‌نام"}</button>}</div>
      {step === 2 && <a className="button button-outline" href={"?view=panel&role=" + role}>ادامه در پنل نمونهٔ این نقش</a>}
    </> : <>
      {field("phone", "شمارهٔ همراه", { type: "tel", inputMode: "tel", dir: "ltr", required: true, autoComplete: "username", placeholder: "09121234567" })}
      {field("password", "رمز عبور", { type: "password", required: true, autoComplete: "current-password", maxLength: 128 })}
      <button type="submit" className="button button-primary" disabled={busy}>{busy ? "در حال بررسی…" : "بررسی ورود"}<Icon name="arrow-left" /></button>
      <p className="field-hint">رمز عبور ذخیره نمی‌شود. پس از احراز هویت معتبر، سرویس اصلی نقش کاربر را تعیین خواهد کرد. پنل‌های سمت دیگر این صفحه فقط پیش‌نمایش‌اند.</p>
    </>}
    {notice && <p className="integration-notice" role="status">{notice}</p>}
    <a className="text-link" href={signup ? "?view=login" : "?view=signup"}>{signup ? "فرم ورود مشترک" : "انتخاب نقش و ثبت‌نام"}<Icon name="arrow-left" /></a>
  </form>;
}
