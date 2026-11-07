import { ROLE_CONFIG } from "../config/platform.js";
import { ConceptHeader, ConceptFooter } from "../sections/ConceptMarkup.jsx";
import { AccountForm } from "../features/account/AccountForm.jsx";
import { RolePanel } from "../features/panel/RolePanel.jsx";
import { Icon } from "../components/Icon.jsx";

export function RoleChoices({ view = "signup" }) {
  return <div className="role-choices">{Object.entries(ROLE_CONFIG).map(([role, config]) => <a key={role} href={`?view=${view}&role=${role}`} className="role-choice"><span className="role-choice-icon"><Icon name={config.icon} /></span><strong>{config.label}</strong><span>{config.description}</span><Icon name="arrow-left" /></a>)}</div>;
}
export default function AccountPage({ view, role }) {
  const validRole = Object.hasOwn(ROLE_CONFIG, role || "");
  return <><a className="skip-link" href="#main">رفتن به محتوای اصلی</a><ConceptHeader /><main className="account-main" id="main">
    {view === "panel" && validRole ? <RolePanel role={role} /> : <>
      <div className="concept-banner"><div><h1>{view === "login" ? "یک ورودی، مسیر متناسب با نقش شما" : view === "panel" ? "پیش‌نمایش پنل‌ها" : "از نقش خود شروع کنید"}</h1><p>{view === "login" ? "ورود برای همهٔ نقش‌ها از همین فرم انجام می‌شود." : "مسیر مناسب فعالیت خود را انتخاب کنید."}</p></div><span className="demo-badge">حالت مهمان</span></div>
      {role && !validRole && <p className="integration-notice" role="alert">نقش انتخاب‌شده شناخته نشد. یکی از نقش‌های زیر را انتخاب کنید.</p>}
      {view === "login" ? <div className="account-layout"><AccountForm /><aside className="account-aside"><span className="overline">بدون ورود واقعی</span><h2>پنل‌ها را پیش از ثبت‌نام ببینید</h2><p>این پنل‌ها فقط نمونهٔ عمومی هستند و به اطلاعات حساب واقعی دسترسی ندارند.</p><RoleChoices view="panel" /></aside></div> : view === "signup" && validRole ? <div className="account-layout"><AccountForm key={role} signup role={role} /><aside className="account-aside"><h2>مسیر {ROLE_CONFIG[role].label}</h2><p>{ROLE_CONFIG[role].description}</p><p className="integration-notice">احراز هویت، مدارک تخصصی و شرایط فعال‌سازی در این فرم نمونه انجام نمی‌شوند.</p><a className="button button-outline" href={`?view=panel&role=${role}`}>مشاهدهٔ پنل نمونه</a><a className="text-link" href="?view=signup">انتخاب نقش دیگر</a></aside></div> : <RoleChoices view={view === "panel" ? "panel" : "signup"} />}
    </>}
    <ConceptFooter />
  </main></>;
}
