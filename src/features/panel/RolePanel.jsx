import { useEffect, useState } from "react";
import { ROLE_CONFIG } from "../../config/platform.js";
import { useWorkspace } from "../../contexts/WorkspaceContext.jsx";
import { faNumber } from "../../utils/format.js";
import { Icon } from "../../components/Icon.jsx";
import { LeagueCard } from "./LeagueCard.jsx";
import { DisputesPanel } from "./DisputesPanel.jsx";
import { VerificationPanel } from "./VerificationPanel.jsx";
import { RequestsPanel } from "../workspace/RequestsPanel.jsx";
import { OffersPanel } from "../workspace/OffersPanel.jsx";
import { ConnectionsPanel } from "../workspace/ConnectionsPanel.jsx";
import { NotificationsPanel } from "../workspace/NotificationsPanel.jsx";
import { ProfilePanel } from "../workspace/ProfilePanel.jsx";

const navigation = [
  ["overview", "نمای کلی", "panel-right"], ["requests", "پیش‌نویس درخواست‌ها", "file-text"],
  ["offers", "پیشنهادهای حمل", "truck"], ["connections", "همکاری و کارمزد", "route"],
  ["league", "لیگ و پیشرفت", "sparkles"], ["disputes", "مرکز اختلاف", "message-square-text"],
  ["notifications", "اعلان‌ها", "bell"], ["profile", "پروفایل", "user"], ["verification", "هویت و فعال‌سازی", "check"],
];
const validTab = (value) => navigation.some(([id]) => id === value) ? value : "overview";
export function RolePanel({ role }) {
  const { state, storageError } = useWorkspace();
  const search = window.location.search;
  const [active, setActive] = useState(() => validTab(new URLSearchParams(search).get("tab")));
  const config = ROLE_CONFIG[role];
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setActive(validTab(params.get("tab")));
    const resource = params.get("resource");
    if (resource) requestAnimationFrame(() => document.getElementById("resource-" + validTab(params.get("tab")) + "-" + resource)?.scrollIntoView({ block: "center", behavior: "smooth" }));
  }, [role, search]);
  function go(tab, resourceId = "") {
    const params = new URLSearchParams({ view: "panel", role, tab: validTab(tab) });
    if (resourceId) params.set("resource", resourceId);
    window.history.replaceState({}, "", "?" + params);
    window.dispatchEvent(new PopStateEvent("popstate"));
    setActive(validTab(tab));
  }
  function changeRole(nextRole) {
    window.history.pushState({}, "", "?" + new URLSearchParams({ view: "panel", role: nextRole, tab: active }));
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
  const requests = state.requests.filter((item) => item.ownerRole === role);
  const connections = state.connections.filter((item) => [item.ownerRole, item.partnerRole].includes(role));
  const unread = state.notifications.filter((item) => item.recipientRole === role && !item.read).length;
  const showBadge = state.profileDrafts[role]?.inAppNotifications !== "no";
  return <div className="role-panel">
    <div className="panel-heading"><div><span className="overline">محیط تمرینی فرانت‌اند · بدون حساب واقعی</span><h1>پنل نمونهٔ {config.label}</h1><p>{config.description}</p></div><a className="button button-outline" href="./">خروج از پیش‌نمایش</a></div>
    <div className="workspace-role-toolbar"><label htmlFor="panel-role-preview">نمایش از دید نقش<select id="panel-role-preview" value={role} onChange={(event) => changeRole(event.target.value)}>{Object.entries(ROLE_CONFIG).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}</select></label><span className="demo-badge">همهٔ اقدامات این محیط نمایشی‌اند</span></div>
    <p className="panel-demo-notice"><Icon name="info" />این محیط برای بررسی کامل مسیرهای رابط است. نقش انتخاب‌شده احراز هویت نیست؛ معامله، پرداخت و ابلاغ رسمی ایجاد نمی‌شود.</p>
    {storageError && <p role="alert" className="integration-notice">حافظهٔ این تب در دسترس نیست؛ تغییرات فعلاً فقط تا بازخوانی صفحه در حافظه می‌مانند.</p>}
    <div className="panel-layout"><nav className="panel-nav" aria-label="بخش‌های پنل نمونه">{navigation.map(([id, label, icon]) => <button type="button" key={id} aria-current={active === id ? "page" : undefined} onClick={() => go(id)}><Icon name={icon} />{label}{id === "notifications" && unread > 0 && showBadge && <span className="notification-count" aria-hidden="true">{faNumber.format(unread)}</span>}</button>)}</nav>
      <div className="panel-content">
        <div className="workspace-view" hidden={active !== "overview"}>
          <section className="panel-card"><span className="overline">نمای سناریوهای همین تب</span><h2>از درخواست تا پایان همکاری</h2><p>یک پیش‌نویس بسازید، از نمای شرکت حمل یا راننده پیشنهاد بدهید و سپس پذیرش و تأیید دوطرفه را بررسی کنید.</p>
            <div className="workspace-kpis"><button onClick={() => go("requests")}><strong>{faNumber.format(requests.length)}</strong><span>درخواست تمرینی</span></button><button onClick={() => go("connections")}><strong>{faNumber.format(connections.length)}</strong><span>همکاری تمرینی</span></button><button onClick={() => go("notifications")}><strong>{faNumber.format(unread)}</strong><span>اعلان خوانده‌نشده</span></button></div>
            <div className="panel-actions"><button className="button button-primary" onClick={() => go("requests")}>مشاهدهٔ پیش‌نویس‌ها</button><button className="button button-outline" onClick={() => go("connections")}>بررسی مسیر همکاری</button></div>
            <ol className="workspace-steps"><li>انتخاب مسیر و مرور کالا</li><li>انتشار تمرینی و دریافت پیشنهاد</li><li>پذیرش و تأیید دو نقش</li><li>مرور کارمزد، لیگ و اختلاف</li></ol>
          </section><LeagueCard role={role} compact />
        </div>
        <div className="workspace-view" hidden={active !== "requests"}><RequestsPanel key={role} role={role} go={go} /></div>
        <div className="workspace-view" hidden={active !== "offers"}><OffersPanel key={role} role={role} go={go} /></div>
        <div className="workspace-view" hidden={active !== "connections"}><ConnectionsPanel key={role} role={role} go={go} /></div>
        <div className="workspace-view" hidden={active !== "league"}><LeagueCard key={role} role={role} /></div>
        <div className="workspace-view" hidden={active !== "disputes"}><DisputesPanel key={role} role={role} /></div>
        <div className="workspace-view" hidden={active !== "notifications"}><NotificationsPanel key={role} role={role} go={go} /></div>
        <div className="workspace-view" hidden={active !== "profile"}><ProfilePanel key={role} role={role} /></div>
        <div className="workspace-view" hidden={active !== "verification"}><VerificationPanel /></div>
      </div>
    </div>
  </div>;
}
