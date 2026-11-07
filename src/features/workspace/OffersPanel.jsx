import { useState } from "react";
import { useWorkspace } from "../../contexts/WorkspaceContext.jsx";
import { ROLE_CONFIG } from "../../config/platform.js";
import { faNumber } from "../../utils/format.js";

export function OffersPanel({ role, go }) {
  const { state, transact } = useWorkspace();
  const [selected, setSelected] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const canOffer = ["driver", "carrier"].includes(role);
  const requests = state.requests.filter((request) => request.ownerRole === role || (canOffer && request.status === "published") || state.offers.some((offer) => offer.requestId === request.id && offer.senderRole === role));
  function act(action) { try { const next = transact({ ...action, role }); setError(""); setMessage(action.type === "offer/accept" ? "همکاری در سناریوی نمونه ساخته شد؛ هیچ معامله یا پرداخت واقعی ایجاد نشده است." : "تغییر در سناریوی همین تب ثبت شد."); return next; } catch (error) { setError(error.message); return null; } }
  function submit(event) { event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); if (act({ type: "offer/create", requestId: selected, amount: data.get("amount"), message: data.get("message") })) { setSelected(""); form.reset(); } }
  return <section className="panel-card"><span className="demo-badge">پیشنهادهای تمرینی؛ بدون ارسال واقعی</span><h2>{canOffer ? "فرصت‌های حمل و پیشنهادها" : "پیشنهادهای درخواست‌های شما"}</h2><p>برای بررسی هر دو سمت جریان، از انتخاب نقش بالای پنل استفاده کنید. نقش‌ها در این محیط فقط نمای آزمایشی هستند.</p>{error && <p role="alert" className="field-error">{error}</p>}{message && <p className="integration-notice" role="status">{message}</p>}
    {!requests.length ? <div className="empty-panel"><h3>درخواست تمرینی آماده‌ای وجود ندارد</h3><p>در نمای صاحب کالا، پیش‌نویس را بسازید و در سناریو منتشر کنید.</p><a className="button button-outline" href="?view=panel&role=shipper&tab=requests">نمای صاحب کالا</a></div> : <div className="workspace-card-list">{requests.map((request) => {
      const offers = state.offers.filter((offer) => offer.requestId === request.id && (request.ownerRole === role || offer.senderRole === role));
      return <article className="workspace-request" id={`resource-offers-${request.id}`} key={request.id}><div className="workspace-card-top"><h3>{request.routeName || "درخواست حمل نمونه"}</h3><span className="demo-badge">دادهٔ همین سناریو</span></div><p>{request.origin} ← {request.destination}</p><p>{request.goods}</p>{canOffer && request.ownerRole !== role && request.status === "published" && <button className="button button-outline" onClick={() => { setSelected(request.id); setError(""); setMessage(""); }}>نوشتن پیشنهاد نمونه</button>}
        {offers.length ? <ul className="offer-list">{offers.map((offer) => <li key={offer.id}><div><strong>{ROLE_CONFIG[offer.senderRole].label} · نمونه</strong><p>{faNumber.format(offer.amount)} ریال فرضی</p>{offer.message && <p>{offer.message}</p>}<span className="field-hint">{({ pending: "منتظر بررسی", accepted: "پذیرفته‌شده", declined: "انتخاب نشده", withdrawn: "پس‌گرفته‌شده" })[offer.status]}</span></div><div>{offer.status === "pending" && request.ownerRole === role && <button className="button button-primary" onClick={() => act({ type: "offer/accept", id: offer.id })}>پذیرش پیشنهاد نمونه</button>}{offer.status === "pending" && offer.senderRole === role && <button className="text-link" onClick={() => act({ type: "offer/withdraw", id: offer.id })}>پس‌گرفتن پیشنهاد</button>}{offer.status === "accepted" && <button className="text-link" onClick={() => go("connections")}>مشاهدهٔ همکاری</button>}</div></li>)}</ul> : <p className="field-hint">هنوز پیشنهادی برای این نما ثبت نشده است.</p>}
      </article>;
    })}</div>}
    {selected && <form className="workspace-offer-form" noValidate onSubmit={submit}><h3>پیشنهاد حمل نمونه</h3><label className="field">مبلغ پیشنهادی فرضی (ریال)<input name="amount" inputMode="numeric" maxLength={14} required placeholder="عدد صحیح مثبت" /></label><label className="field">توضیح پیشنهاد (اختیاری)<textarea name="message" maxLength={500} rows={3} placeholder="شرایط پیشنهادی در این سناریو" /></label><div className="panel-actions"><button type="submit" className="button button-primary">ثبت پیشنهاد نمونه</button><button type="button" className="button button-outline" onClick={() => setSelected("")}>انصراف</button></div></form>}
  </section>;
}
