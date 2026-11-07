import { useState } from "react";
import { useWorkspace } from "../../contexts/WorkspaceContext.jsx";
import { faNumber } from "../../utils/format.js";

export function NotificationsPanel({ role, go }) {
  const { state, transact } = useWorkspace();
  const [filter, setFilter] = useState("all");
  const all = state.notifications.filter((item) => item.recipientRole === role);
  const items = all.filter((item) => filter !== "unread" || !item.read);
  return <section className="panel-card"><span className="demo-badge">اعلان‌های داخلی سناریو</span><div className="workspace-section-heading"><h2>اعلان‌ها</h2><button className="text-link" disabled={!all.some((item) => !item.read)} onClick={() => transact({ type: "notification/read", role, id: "all" })}>همه خوانده شدند</button></div><p>این پیام‌ها فقط در فرانت‌اند همین تب ساخته می‌شوند؛ پیامک، ایمیل یا ابلاغ رسمی ارسال نشده است.</p><div className="segmented" role="group" aria-label="فیلتر اعلان‌ها"><button aria-pressed={filter === "all"} className={filter === "all" ? "selected" : ""} onClick={() => setFilter("all")}>همه ({faNumber.format(all.length)})</button><button aria-pressed={filter === "unread"} className={filter === "unread" ? "selected" : ""} onClick={() => setFilter("unread")}>خوانده‌نشده</button></div>{items.length ? <ul className="notification-list">{items.map((item) => <li key={item.id} data-unread={!item.read}><div><strong>{item.title}</strong><time dateTime={item.createdAt}>{new Intl.DateTimeFormat("fa-IR", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Tehran" }).format(new Date(item.createdAt))}</time></div><button className="text-link" onClick={() => { transact({ type: "notification/read", role, id: item.id }); go(item.tab, item.resourceId); }}>مشاهدهٔ مورد مرتبط</button></li>)}</ul> : <div className="empty-panel"><h3>اعلانی برای این فیلتر نیست</h3><p>با انتشار درخواست یا تغییر مراحل همکاری، اعلان نمونه ساخته می‌شود.</p></div>}</section>;
}
