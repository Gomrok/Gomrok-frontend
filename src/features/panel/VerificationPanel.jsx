import { useState } from "react";
import { adliyarAdapter, identityAdapter } from "../../services/integrations.js";

export function VerificationPanel() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function run(action) { setBusy(true); setMessage(""); try { await action(); } catch (error) { setMessage(error.code === "NOT_CONFIGURED" ? error.message : "ارتباط برقرار نشد. دوباره تلاش کنید."); } finally { setBusy(false); } }
  function code(event) {
    event.preventDefault(); const form = event.currentTarget; const value = String(new FormData(form).get("code") || "").trim();
    if (!value) { setMessage("برای بررسی فرم، یک کد آزمایشی وارد کنید."); form.elements.namedItem("code").focus(); return; }
    run(() => adliyarAdapter.submitCode({ code: value, caseId: null })); form.elements.namedItem("code").value = "";
  }
  return <section className="panel-card"><h2>احراز هویت و ارتباطات آینده</h2><span className="unverified-label">هویت تأیید نشده</span><p>هیچ حساب یا شرکت تأییدشده‌ای در این پیش‌نمایش معرفی نمی‌شود.</p><div className="verification-actions"><button className="button button-outline" disabled={busy} onClick={() => run(() => identityAdapter.verifyCompany())}>بررسی احراز هویت شرکت</button><button className="button button-outline" disabled={busy} onClick={() => run(() => identityAdapter.activationQuote())}>بررسی شرایط فعال‌سازی</button></div><p className="field-hint">هزینه و روش فعال‌سازی مشخص نیست؛ پرداختی انجام نمی‌شود.</p><form className="adliyar-form" onSubmit={code} noValidate><h3>جایگاه ارتباط با عدلیار</h3><p>ماهیت کد، قرارداد سرویس و مجوزها هنوز مشخص نشده‌اند. از کد واقعی استفاده نکنید.</p><label className="field">کد آزمایشی<input name="code" maxLength={80} autoComplete="off" dir="ltr" placeholder="کد نمونه" /></label><button className="button button-outline" disabled={busy}>بررسی کد نمونه</button></form>{message && <p className="integration-notice" role="status">{message}</p>}</section>;
}
