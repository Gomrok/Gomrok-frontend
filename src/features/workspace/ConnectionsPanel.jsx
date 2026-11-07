import { useState } from "react";
import { useWorkspace } from "../../contexts/WorkspaceContext.jsx";
import { ROLE_CONFIG } from "../../config/platform.js";
import { TRADE_STATES } from "../../domain/trade.js";
import { faNumber } from "../../utils/format.js";
import { TradePanel, CommissionScenario } from "../panel/TradePanel.jsx";

export function ConnectionsPanel({ role, go }) {
  const { state, transact } = useWorkspace();
  const [error, setError] = useState("");
  const connections = state.connections.filter((item) => [item.ownerRole, item.partnerRole].includes(role));
  function act(action) { try { transact({ ...action, role }); setError(""); } catch (error) { setError(error.message); } }
  return <><section className="panel-card"><span className="demo-badge">همکاری‌های این سناریوی تمرینی</span><h2>همکاری و پیگیری مراحل</h2><p>تأییدهای زیر فقط برای آزمایش رابط هستند. تأیید حمل، تسویهٔ بانکی و کارمزد واقعی از این اقدامات ساخته نمی‌شود.</p>{error && <p role="alert" className="field-error">{error}</p>}{!connections.length ? <div className="empty-panel"><p>هنوز پیشنهادی در سناریوی مشترک پذیرفته نشده است.</p><button className="button button-outline" onClick={() => go("offers")}>رفتن به پیشنهادها</button></div> : connections.map((item) => {
    const request = state.requests.find((entry) => entry.id === item.requestId);
    const other = item.ownerRole === role ? item.partnerRole : item.ownerRole;
    const kind = item.state === "accepted" ? "complete" : item.state === "completed" ? "settle" : null;
    const confirmations = kind === "complete" ? item.completionConfirmations : item.settlementConfirmations;
    return <article className="workspace-connection" id={`resource-connections-${item.id}`} key={item.id}><div className="workspace-card-top"><h3>{request?.routeName || "همکاری نمونه"}</h3><span className="demo-badge">{TRADE_STATES[item.state]}</span></div><p>{request?.origin} ← {request?.destination}</p><p>پیشنهاد فرضی: {faNumber.format(item.amount)} ریال · طرف مقابل در سناریو: {ROLE_CONFIG[other].label}</p><p className="field-hint">منبع ارجاع: {item.referral.source === "ai" ? "گفت‌وگوی نمونه" : "مستقیم"}</p>
      {kind && <div className="workflow-confirmation"><p>{kind === "complete" ? "برای عبور آزمایشی به تکمیل، هر دو طرف باید تأیید کنند." : "این مرحله فقط اعلام تسویه در سناریو را نشان می‌دهد؛ درگاهی فراخوانی نمی‌شود."}</p><div className="panel-actions"><button className="button button-primary" disabled={confirmations.includes(role)} onClick={() => act({ type: "connection/confirm", id: item.id, kind })}>{confirmations.includes(role) ? "تأیید این نقش ثبت شده است" : kind === "complete" ? "تأیید تکمیل نمونه از این نقش" : "تأیید تسویهٔ نمونه از این نقش"}</button><a className="button button-outline" href={`?view=panel&role=${other}&tab=connections`}>نمای طرف مقابل</a></div></div>}
      <ol className="event-list">{item.events.map((event, index) => <li key={index}><span>{({ request_created: "ایجاد درخواست", offer: "پیشنهاد", accept: "پذیرش", complete_ack: "تأیید تکمیل یک طرف", complete: "تکمیل نمونه", settle_ack: "تأیید تسویهٔ یک طرف", settle: "تسویهٔ نمونه", cancel: "لغو", dispute: "ثبت اختلاف نمونه" })[event.type] || "رویداد نمونه"}</span><time dateTime={event.at}>{new Intl.DateTimeFormat("fa-IR", { timeStyle: "short", timeZone: "Asia/Tehran" }).format(new Date(event.at))}</time><small>نمایشی</small></li>)}</ol>
      <div className="panel-actions">{["requested", "offered", "accepted"].includes(item.state) && <button className="button button-outline" onClick={() => act({ type: "connection/cancel", id: item.id })}>لغو همکاری نمونه</button>}<button className="text-link" onClick={() => go("disputes", item.id)}>درخواست داوری برای این همکاری</button></div><CommissionScenario connection={item} />
    </article>;
  })}</section>{connections.length ? <details className="standalone-scenario"><summary>آزمایش مستقل چرخهٔ وضعیت‌ها</summary><TradePanel /></details> : <TradePanel />}</>;
}
