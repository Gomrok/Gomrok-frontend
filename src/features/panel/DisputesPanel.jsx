import { useEffect, useRef, useState } from "react";
import { createDisputeDraft } from "../../domain/disputes.js";
import { previewCaseStage } from "../../domain/workspace.js";
import { disputeAdapter } from "../../services/integrations.js";
import { useWorkspace } from "../../contexts/WorkspaceContext.jsx";
import { ROLE_CONFIG } from "../../config/platform.js";
import { faNumber } from "../../utils/format.js";

const labels = { draft: "پیش‌نویس", awaiting_notice: "منتظر مشاهدهٔ ابلاغ نمونه", awaiting_response: "مهلت پاسخ نمونه", awaiting_review: "آمادهٔ بررسی" };
const dateLabel = (value) => new Intl.DateTimeFormat("fa-IR", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Tehran" }).format(new Date(value));
export function DisputesPanel({ role = "shipper" }) {
  const { state, transact } = useWorkspace();
  const [files, setFiles] = useState([]);
  const [draft, setDraft] = useState(null);
  const draftIdRef = useRef(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [connectionId, setConnectionId] = useState("");
  const [respondent, setRespondent] = useState(role === "driver" ? "shipper" : "driver");
  const [offsetHours, setOffsetHours] = useState(0);
  const [tick, setTick] = useState(Date.now());
  const resource = new URLSearchParams(window.location.search).get("resource");
  useEffect(() => { const connection = state.connections.find((item) => item.id === resource); if (connection && [connection.ownerRole, connection.partnerRole].includes(role)) { setConnectionId(connection.id); setRespondent(connection.ownerRole === role ? connection.partnerRole : connection.ownerRole); } }, [resource, role, state.connections]);
  useEffect(() => { const timer = setInterval(() => setTick(Date.now()), 60000); return () => clearInterval(timer); }, []);
  const now = tick + offsetHours * 3600000;
  const cases = state.cases.filter((item) => [item.initiatorRole, item.respondentRole].includes(role));
  function attachments(event) {
    const selected = [...event.target.files];
    if (selected.length > 3 || selected.some((file) => file.size > 5 * 1024 * 1024 || !["application/pdf", "image/jpeg", "image/png"].includes(file.type))) {
      setError("حداکثر ۳ فایل PDF، PNG یا JPG و هر فایل تا ۵ مگابایت انتخاب کنید."); event.target.value = ""; setFiles([]); setDraft(null); return;
    }
    setError(""); setDraft(null); setFiles(selected.map(({ name, size, type }) => ({ name, size, type })));
  }
  function review(event) {
    event.preventDefault(); setError(""); setMessage("");
    const values = new FormData(event.currentTarget);
    try {
      if (connectionId && !state.connections.some((item) => item.id === connectionId && [item.ownerRole, item.partnerRole].includes(role))) throw new Error("شناسهٔ همکاری در سناریوی این نقش پیدا نشد؛ آن را خالی بگذارید یا همکاری مرتبط را انتخاب کنید.");
      const data = createDisputeDraft({ description: values.get("description"), connectionId, attachments: files });
      const record = { ...data, id: draftIdRef.current || data.id, respondentRole: respondent };
      transact({ type: "case/save", role, data: record });
      draftIdRef.current = record.id;
      setDraft(record);
    } catch (error) { setError(error.message); event.currentTarget.elements.namedItem("description")?.focus(); }
  }
  function act(action) {
    try { transact({ ...action, role, at: new Date(Date.now() + offsetHours * 3600000).toISOString() }); setTick(Date.now()); setError(""); setMessage("مرحلهٔ سناریوی تمرینی به‌روز شد؛ اقدامی به سرویس واقعی ارسال نشده است."); return true; }
    catch (error) { setError(error.message); return false; }
  }
  async function submitReal() {
    setBusy(true); setMessage("");
    try { await disputeAdapter.submit(draft); } catch (error) { setMessage(error.code === "NOT_CONFIGURED" ? error.message : "ارسال انجام نشد؛ بعداً دوباره تلاش کنید."); } finally { setBusy(false); }
  }
  return <section className="panel-card">
    <span className="demo-badge">مرکز اختلاف؛ سناریوی فرانت‌اند</span><h2>درخواست داوری</h2>
    <p>فقط اطلاعات آزمایشی وارد کنید. مدرک واقعی و حساس انتخاب نکنید؛ محتوای فایل خوانده یا بارگذاری نمی‌شود. شرح و متادیتای مدارک در حافظهٔ همین صفحه می‌مانند.</p>
    <form className="dispute-form" noValidate onSubmit={review} onChange={() => setDraft(null)}>
      <label className="field">شناسهٔ همکاری (اختیاری)<input name="connectionId" maxLength={80} value={connectionId} onChange={(event) => setConnectionId(event.target.value)} placeholder="شناسهٔ همکاری همین سناریو" /></label>
      <label className="field">طرف پاسخ‌دهنده در سناریو<select value={respondent} onChange={(event) => setRespondent(event.target.value)}>{Object.entries(ROLE_CONFIG).filter(([id]) => id !== role).map(([id, config]) => <option key={id} value={id}>{config.label} · نمونه</option>)}</select></label>
      <label className="field">شرح اختلاف<textarea name="description" minLength={20} maxLength={2000} rows={5} required aria-describedby="dispute-description-hint" placeholder="شرح روشن و آزمایشی؛ دست‌کم ۲۰ نویسه" /></label>
      <p id="dispute-description-hint" className="field-hint">با بازخوانی کامل صفحه، شرح و نام مدارک پاک می‌شوند؛ تغییر نمای نقش در همین محیط آن‌ها را حفظ می‌کند.</p>
      <label className="field">مدارک نمونه<input name="evidence" type="file" multiple accept=".pdf,.png,.jpg,.jpeg" onChange={attachments} /></label>
      {files.length > 0 && <ul className="file-list">{files.map((file, index) => <li key={file.name + index}><span>{file.name} · {faNumber.format(Math.ceil(file.size / 1024))} کیلوبایت</span><button type="button" onClick={() => { setFiles((current) => current.filter((_, at) => at !== index)); setDraft(null); }} aria-label={"حذف " + file.name + " از پیش‌نویس"}>حذف از پیش‌نویس</button></li>)}</ul>}
      <button className="button button-primary" type="submit">مرور درخواست داوری</button>
    </form>
    {error && <p role="alert" className="field-error">{error}</p>}
    {draft && <div className="dispute-preview" role="status"><h3>پیش‌نویس درخواست داوری آماده است</h3><p>{draft.description}</p><p>{faNumber.format(draft.attachmentMetadata.length)} مدرک نمونه؛ فقط نام و اندازه در حافظهٔ صفحه</p><strong>ابلاغی انجام نشده و مهلت پاسخ واقعی شروع نشده است.</strong><button className="button button-outline" disabled={busy} onClick={submitReal}>{busy ? "در حال بررسی…" : "بررسی امکان ارسال به مرکز اختلاف"}</button></div>}
    {message && <p className="integration-notice" role="status">{message}</p>}
    <div className="workspace-section-heading case-list-heading"><h3>پرونده‌های تمرینی این نقش</h3><label className="workspace-filter">ساعت سناریو<select value={offsetHours} onChange={(event) => { setOffsetHours(Number(event.target.value)); setTick(Date.now()); }}><option value={0}>زمان فعلی</option><option value={49}>نمایش حالت پس از ۴۸ ساعت</option></select></label></div>
    <p className="field-hint">این ساعت فقط پیش‌نمایش مهلت را تغییر می‌دهد؛ ساعت دستگاه، ابلاغ معتبر و پروندهٔ واقعی تغییر نمی‌کنند.</p>
    {!cases.length ? <div className="empty-panel"><p>هنوز پروندهٔ تمرینی ندارید.</p></div> : <div className="workspace-card-list">{cases.map((item) => {
      const stage = previewCaseStage(item, now);
      return <article className="workspace-case" id={"resource-disputes-" + item.id} key={item.id}>
        <div className="workspace-card-top"><h3>پروندهٔ تمرینی <bdi>{item.id.slice(-6)}</bdi></h3><span className="demo-badge">{labels[stage]}</span></div>
        <p className="case-description">{item.description}</p><p className="field-hint">طرح‌کننده: {ROLE_CONFIG[item.initiatorRole].label} · پاسخ‌دهنده: {ROLE_CONFIG[item.respondentRole].label} · {faNumber.format(item.attachmentMetadata.length)} مدرک نمونه</p>
        {item.previewDeadline ? <div className="workflow-deadline"><strong>مهلت فرضی سناریو</strong><time dateTime={item.previewDeadline}>{dateLabel(item.previewDeadline)}</time><span>{stage === "awaiting_response" ? faNumber.format(Math.max(0, Math.ceil((Date.parse(item.previewDeadline) - now) / 3600000))) + " ساعت باقی‌ماندهٔ فرضی" : "پروندهٔ نمونه به مرحلهٔ بررسی ارجاع‌پذیر است؛ مجازات خودکار ندارد."}</span></div> : <p className="field-hint">هنوز حتی مهلت نمایشی آغاز نشده است.</p>}
        <div className="panel-actions">
          {item.stage === "draft" && item.initiatorRole === role && <button className="button button-primary" onClick={() => { if (act({ type: "case/submit", id: item.id })) { setDraft(null); if (draftIdRef.current === item.id) draftIdRef.current = null; } }}>ثبت در گردش تمرینی</button>}
          {item.stage === "awaiting_notice" && item.respondentRole === role && <button className="button button-primary" onClick={() => act({ type: "case/acknowledge", id: item.id })}>شبیه‌سازی مشاهدهٔ ابلاغ</button>}
          <a className="button button-outline" href={"?view=panel&role=" + (item.initiatorRole === role ? item.respondentRole : item.initiatorRole) + "&tab=disputes&resource=" + item.id}>نمای طرف مقابل پرونده</a>
        </div>
        {stage === "awaiting_response" && item.respondentRole === role && <form className="case-reply-form" onSubmit={(event) => { event.preventDefault(); const form = event.currentTarget; act({ type: "case/reply", id: item.id, text: new FormData(form).get("reply") }); }}><label className="field">پاسخ نمونه<textarea name="reply" required minLength={10} maxLength={2000} rows={3} /></label><button className="button button-primary">ثبت پاسخ تمرینی</button></form>}
        {item.replies.map((reply, index) => <blockquote className="case-reply" key={index}><strong>{ROLE_CONFIG[reply.role].label} · پاسخ نمونه</strong><p>{reply.text}</p><time>{dateLabel(reply.at)}</time></blockquote>)}
        <ol className="event-list">{item.events.map((event, index) => <li key={index}><span>{({ draft: "پیش‌نویس", submitted_preview: "گردش تمرینی", preview_notice_viewed: "مشاهدهٔ نمونه", response_preview: "پاسخ نمونه" })[event.type]}</span><time>{dateLabel(event.at)}</time><small>غیررسمی</small></li>)}</ol>
      </article>;
    })}</div>}
    <div className="dispute-policy"><h3>مسیر پاسخ و بررسی</h3><ol><li>ثبت در سرویس معتبر و ابلاغ/مشاهدهٔ قابل تأیید توسط طرفین</li><li>مهلت پاسخ ۴۸ ساعت پس از ابلاغ یا مشاهدهٔ معتبر</li><li>ارجاع به بررسی رسمی پس از انقضا؛ بدون مجازات خودکار یا رأی قطعی</li></ol><p className="field-hint">مبنای دقیق شروع مهلت و قواعد ابلاغ باید پیش از فعال‌سازی از نظر حقوقی و عملیاتی تأیید شوند. اعلان‌های این محیط فقط تمرینی‌اند.</p></div>
  </section>;
}
