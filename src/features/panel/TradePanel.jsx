import { useEffect, useState } from "react";
import { COMMISSION_POLICY } from "../../config/platform.js";
import { createConnection, estimateCommission, evaluateCommission, TRADE_STATES, transitionConnection } from "../../domain/trade.js";
import { faNumber, normalizeDecimal } from "../../utils/format.js";
import { readSession } from "../../services/session.js";

const nextEvents = { requested: [["offer", "ثبت پیشنهاد نمونه"]], offered: [["accept", "پذیرش پیشنهاد نمونه"]], accepted: [["complete", "تکمیل حمل نمونه"]], completed: [["settle", "تسویه در سناریوی نمونه"]], settled: [], cancelled: [], disputed: [] };
export function TradePanel() {
  const [connection, setConnection] = useState(null);
  const [error, setError] = useState("");
  function start() { const draft = readSession("draft-request"); const referral = draft?.referralSource === "ai" ? { source: "ai", id: draft.referralId, conversationId: draft.referralConversationId } : null; setConnection(createConnection({ requestId: draft?.id || "sample-request", referral })); setError(""); }
  function event(type) { try { setConnection((current) => transitionConnection(current, type)); setError(""); } catch { setError("این تغییر وضعیت مجاز نیست."); } }
  return <section className="panel-card"><span className="demo-badge">شبیه‌ساز محلی معامله</span><h2>از درخواست تا پایان همکاری</h2><p>رویدادها فقط در حافظهٔ این صفحه ساخته می‌شوند؛ پیشنهاد، معامله یا تسویهٔ واقعی رخ نمی‌دهد.</p>{!connection ? <div className="empty-panel"><p>هیچ رویداد نمونه‌ای ایجاد نشده است.</p><button type="button" className="button button-primary" onClick={start}>ایجاد درخواست نمونه</button></div> : <>
    <div className="trade-current" role="status"><strong>{TRADE_STATES[connection.state]}</strong><span>سناریوی نمونه · ارجاع {connection.referral.source === "ai" ? "دستیار هوش مصنوعی" : "مستقیم"}</span></div>
    <div className="panel-actions">{nextEvents[connection.state].map(([type, label]) => <button key={type} className="button button-primary" onClick={() => event(type)}>{label}</button>)}{["requested", "offered", "accepted"].includes(connection.state) && <button className="button button-outline" onClick={() => event("cancel")}>لغو سناریو</button>}{["offered", "accepted", "completed", "settled"].includes(connection.state) && <button className="button button-outline" onClick={() => event("dispute")}>ثبت اختلاف نمونه</button>}<button className="text-link" onClick={start}>شروع سناریوی تازه</button></div>
    <ol className="event-list">{connection.events.map((entry, index) => <li key={index}><span>{({ request_created: "ایجاد درخواست", offer: "پیشنهاد", accept: "پذیرش", complete: "تکمیل", settle: "تسویه", cancel: "لغو", dispute: "اختلاف" })[entry.type]}</span><time dateTime={entry.at}>{new Intl.DateTimeFormat("fa-IR", { timeStyle: "short", timeZone: "Asia/Tehran" }).format(new Date(entry.at))}</time><small>رویداد نمایشی</small></li>)}</ol>
    <CommissionScenario key={connection.id} connection={connection} />
  </>}{error && <p className="field-error" role="alert">{error}</p>}</section>;
}
export function CommissionScenario({ connection }) {
  const [model, setModel] = useState("unset");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const allowed = ["completed", "settled"].includes(connection.state);
  const actual = evaluateCommission(connection, 0, COMMISSION_POLICY);
  useEffect(() => { setResult(null); setError(""); }, [connection.state]);
  function submit(event) {
    event.preventDefault(); setError(""); setResult(null);
    const values = new FormData(event.currentTarget);
    if (!allowed || !values.get("assumeVerified")) { setError("ابتدا سناریو را تکمیل کنید و فرض آزمایشی تأیید را مشخص کنید."); return; }
    const amount = normalizeDecimal(values.get("amount"));
    const value = normalizeDecimal(values.get("commission"));
    const estimate = estimateCommission(amount ? Number(amount) : NaN, { model, value: value ? Number(value) : NaN });
    if (estimate.status !== "simulation") { setError("مدل، مبلغ قرارداد و مقدار فرضی را معتبر وارد کنید؛ مبلغ ریالی باید عدد صحیح مثبت باشد."); return; }
    setResult(estimate.amount);
  }
  return <form className="commission-scenario" noValidate onSubmit={submit} onChange={() => setResult(null)}><h3>پیش‌نمایش قواعد کارمزد</h3><p>نرخ رسمی هنوز تعیین نشده است. باز کردن چت یا کلیک روی دکمه، کارمزد ایجاد نمی‌کند.</p><p className="integration-notice">وضعیت عملیاتی: {actual.status === "not_eligible" ? "شرایط تکمیل برقرار نیست" : "در انتظار تأیید معتبر تکمیل و تسویه از سرور"}. هیچ بدهی ثبت نشده است.</p><div className="panel-field-grid"><label className="field">مدل فرضی<select value={model} onChange={(event) => { setModel(event.target.value); setResult(null); }}><option value="unset">تعیین نشده</option><option value="percentage">درصدی (آزمایشی)</option><option value="fixed">مبلغ ثابت (آزمایشی)</option></select></label><label className="field">{model === "percentage" ? "درصد فرضی" : "کارمزد فرضی (ریال)"}<input name="commission" inputMode="decimal" placeholder="تعیین نشده" maxLength={12} /></label><label className="field">مبلغ قرارداد فرضی (ریال)<input name="amount" inputMode="numeric" placeholder="عدد صحیح" maxLength={14} /></label></div><label className="check-field"><input name="assumeVerified" type="checkbox" disabled={!allowed} />صرفاً در این سناریوی نمونه، تأیید تکمیل را فرض می‌کنم.</label><button className="button button-outline" disabled={!allowed}>محاسبهٔ سناریوی فرضی</button>{!allowed && <p className="field-hint">محاسبهٔ نمونه بعد از مرحلهٔ تکمیل در دسترس قرار می‌گیرد.</p>}{error && <p role="alert" className="field-error">{error}</p>}{result !== null && <p role="status" className="integration-notice">برآورد کاملاً فرضی: {faNumber.format(result)} ریال؛ هیچ پرداخت، طلب یا بدهی واقعی ایجاد نشده است.</p>}</form>;
}
