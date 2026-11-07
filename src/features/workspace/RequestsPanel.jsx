import { useState } from "react";
import { useWorkspace } from "../../contexts/WorkspaceContext.jsx";
import { Icon } from "../../components/Icon.jsx";
import { faNumber } from "../../utils/format.js";
import { savePreview } from "../concepts/previewStorage.js";

const statusLabels = { draft: "پیش‌نویس", published: "آمادهٔ پیشنهاد نمونه", accepted: "همکاری پذیرفته شده", cancelled: "لغو شده" };
export function RequestsPanel({ role, go }) {
  const { state, transact } = useWorkspace();
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const all = state.requests.filter((item) => item.ownerRole === role);
  const items = all.filter((item) => filter === "all" || item.status === filter);
  function publish(item) { try { transact({ type: "request/publish", id: item.id, role }); setError(""); } catch (error) { setError(error.message); } }
  function edit(event, item) { if (!savePreview("quote", new URLSearchParams(Object.entries(item)))) { event.preventDefault(); setError("پیش‌نویس انتخاب‌شده در حافظهٔ تب قابل نگه‌داری نیست."); } }
  return <section className="panel-card"><div className="workspace-section-heading"><div><span className="overline">فقط در همین تب</span><h2>درخواست‌ها و پیش‌نویس‌ها</h2></div><a className="button button-primary" href="./#quote">درخواست حمل تازه <Icon name="plus" /></a></div><p>پیش‌نویس را مرور کنید و برای بررسی جریان پیشنهاد، آن را در سناریوی تمرینی منتشر کنید. اطلاعات به سرور ارسال نمی‌شود.</p><label className="workspace-filter">وضعیت درخواست<select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">همهٔ درخواست‌ها</option>{Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>{error && <p className="field-error" role="alert">{error}</p>}
    {!items.length ? <div className="empty-panel"><Icon name="file-text" /><h3>{all.length ? "درخواستی با این وضعیت نیست" : "هنوز پیش‌نویسی آماده نکرده‌اید"}</h3><p>با انتخاب مسیر، اطلاعات محموله را برای مرور آماده کنید.</p>{all.length ? <button className="button button-outline" onClick={() => setFilter("all")}>نمایش همهٔ درخواست‌ها</button> : <a className="button button-outline" href="./#quote">شروع درخواست حمل</a>}</div> : <div className="workspace-card-list">{items.map((item) => <article className="request-draft-card" id={`resource-requests-${item.id}`} key={item.id}><div className="workspace-card-top"><span className="demo-badge">{statusLabels[item.status]} · نمونه</span><span className="short-id"><bdi>{item.id.slice(-8)}</bdi></span></div><h3>{item.routeName || "درخواست حمل نمونه"}</h3><p>{item.origin} ← {item.destination}</p><p>{item.goods}{item.weight ? ` · ${faNumber.format(Number(item.weight))} کیلوگرم` : ""}</p><p className="field-hint">منبع ارجاع: {item.referralSource === "ai" ? "گفت‌وگوی نمونه" : "مستقیم"}</p><div className="panel-actions">{item.status === "draft" && <><a className="button button-outline" href="?view=quote" onClick={(event) => edit(event, item)}>مرور و اصلاح پیش‌نویس</a><button className="button button-primary" onClick={() => publish(item)}>انتشار در سناریوی نمونه</button></>}{item.status === "published" && <button className="button button-outline" onClick={() => go("offers", item.id)}>بررسی پیشنهادها</button>}{item.status === "accepted" && <button className="button button-outline" onClick={() => go("connections")}>مشاهدهٔ همکاری نمونه</button>}</div></article>)}</div>}
    <p className="field-hint">این فهرست، حساب واقعی یا دسترسی خصوصی ایجاد نمی‌کند. هر پیش‌نویس در نمای نقش سازنده دیده می‌شود.</p></section>;
}
