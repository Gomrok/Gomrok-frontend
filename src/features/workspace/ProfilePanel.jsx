import { useState } from "react";
import { ROLE_CONFIG } from "../../config/platform.js";
import { isValidPhone } from "../../utils/format.js";
import { useWorkspace } from "../../contexts/WorkspaceContext.jsx";


export function ProfilePanel({ role }) {
  const { state, transact, reset } = useWorkspace();
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const [formVersion, setFormVersion] = useState(0);
  const config = ROLE_CONFIG[role];
  const profile = state.profileDrafts[role] || {};
  function submit(event) {
    event.preventDefault(); const form = event.currentTarget; const values = Object.fromEntries(new FormData(form)); values.inAppNotifications = values.inAppNotifications ? "yes" : "no"; const next = {};
    if (String(values.displayName || "").trim().length < 2) next.displayName = "نام نمایشی دست‌کم دو نویسه باشد.";
    if (values.phone && !isValidPhone(values.phone)) next.phone = "شمارهٔ همراه معتبر وارد کنید.";
    setErrors(next); setMessage("");
    if (Object.keys(next).length) { form.querySelector(`[name="${Object.keys(next)[0]}"]`)?.focus(); return; }
    transact({ type: "profile/save", role, data: values }); setMessage("پروفایل تمرینی در حافظهٔ همین صفحه نگه‌داری شد؛ هویت یا حساب تأییدشده‌ای ساخته نشد.");
  }
  return <><section className="panel-card"><h2>پروفایل و ترجیحات</h2><span className="unverified-label">حساب و هویت واقعی تأیید نشده</span><p>برای آزمون فرم از اطلاعات نمونه استفاده کنید. این اطلاعات در storage ذخیره نمی‌شوند و با بازخوانی صفحه پاک خواهند شد.</p><form key={formVersion} className="workspace-profile-form" noValidate onSubmit={submit}><label className="field">نام نمایشی<input name="displayName" defaultValue={profile.displayName || ""} maxLength={80} aria-invalid={Boolean(errors.displayName)} aria-describedby={errors.displayName ? "profile-name-error" : undefined} required /></label>{errors.displayName && <p className="field-error" id="profile-name-error">{errors.displayName}</p>}<label className="field">شمارهٔ همراه نمونه (اختیاری)<input name="phone" type="tel" dir="ltr" defaultValue={profile.phone || ""} maxLength={20} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "profile-phone-error" : undefined} /></label>{errors.phone && <p className="field-error" id="profile-phone-error">{errors.phone}</p>}<label className="field">{config.field.label}<input name={config.field.name} defaultValue={profile[config.field.name] || ""} maxLength={100} /></label><label className="check-field"><input name="inAppNotifications" type="checkbox" value="yes" defaultChecked={profile.inAppNotifications !== "no"} />نمایش شمارندهٔ اعلان‌های خوانده‌نشده</label><button className="button button-primary">ذخیرهٔ پروفایل تمرینی</button></form>{message && <p className="integration-notice" role="status">{message}</p>}<div className="workspace-reset"><button className="text-link" onClick={() => setConfirmReset(true)}>پاک‌کردن سناریوهای این تب</button>{confirmReset && <div className="integration-notice"><p>پیش‌نویس‌های پنل، پیشنهادها، همکاری‌ها و پرونده‌های تمرینی پاک می‌شوند. سهمیهٔ چت و فایل‌های دستگاه تغییر نمی‌کنند.</p><div className="panel-actions"><button className="button button-outline" onClick={() => { reset(); setFormVersion((value) => value + 1); setErrors({}); setConfirmReset(false); setMessage("سناریوهای تمرینی این تب پاک شدند."); }}>تأیید پاک‌سازی سناریوها</button><button className="text-link" onClick={() => setConfirmReset(false)}>انصراف</button></div></div>}</div></section></>;
}
