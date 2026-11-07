import { Icon } from "../components/Icon.jsx";
import { MobileMenuToggle } from "../components/MobileMenu.jsx";
import { ChatComposer, ChatMessages } from "../features/ai/ChatWidgets.jsx";
import {
  QuoteDetailsForm,
  CustomsDetailsForm,
} from "../features/concepts/ConceptForms.jsx";

export function ConceptHeader() {
  return (
    <header className="site-header concept-header" data-figma="Header/Concept">
      <div className="container header-inner">
        <a href="./" className="brand-logo" aria-label="صفحه اصلی گمرک‌دات‌کام">
          <img
            src="./assets/brand/gomrok-original.jpg"
            alt="Gomrok"
            width="1536"
            height="640"
          />
        </a>
        <a className="concept-back" href="./">
          بازگشت به صفحه اصلی <Icon name="arrow-left" />
        </a>
      </div>
    </header>
  );
}

export function ChatSection({
  filter,
  onFilterChange,
  province,
  onProvinceChange,
  vehicle,
  onVehicleChange,
  summary,
  messages,
  onSend,
  busy,
  used,
  limit,
  blocked,
  error,
  onRetry,
  onReferral,
  histories = [],
  activeHistory,
  onSelectHistory,
  onRemoveHistory,
  rememberHistory,
  onRememberHistory,
  historyStorageError,
}) {
  return (
    <section data-concept="chat" data-figma="AI Chat/Entry">
      <div className="concept-banner">
        <div>
          <h1>دستیار هوشمند گمرک</h1>
          <p>درباره مسیر حمل، اصطلاحات و مراحل ترخیص سؤال کنید.</p>
        </div>
        <span className="demo-badge">نمونهٔ تعاملی؛ پاسخ‌ها نمایشی‌اند</span>
      </div>
      <div className="concept-surface chat-app">
        <aside className="chat-sidebar">
          <div className="ai-signature">
            <Icon name="sparkles" />
            <strong dir="ltr">Gomrok AI</strong>
          </div>
          <button className="button button-outline new-chat">
            <Icon name="plus" />
            گفت‌وگوی تازه
          </button>
          <span className="chat-sidebar-title">تاریخچهٔ گفتگوهای همین صفحه</span>
          <ul className="chat-history-list">{histories.map((item) => <li key={item.id}><button className="history-item" aria-current={activeHistory === item.id ? "true" : undefined} onClick={() => onSelectHistory(item.id)}>{item.title}</button><button className="chat-history-remove" aria-label={`حذف گفتگوی ${item.title}`} onClick={() => onRemoveHistory(item.id)}><Icon name="x" /></button></li>)}</ul>
          <label className="check-field chat-remember"><input type="checkbox" checked={Boolean(rememberHistory)} onChange={(event) => onRememberHistory(event.target.checked)} />نگه‌داری موقت تاریخچه در همین تب</label>
          <p className="field-hint">{rememberHistory ? "با انتخاب شما، متن گفتگو تا بستن همین تب نگه‌داری می‌شود. با برداشتن تیک، نسخهٔ ذخیره‌شده پاک می‌شود." : "متن گفتگو ذخیره نمی‌شود؛ با بازخوانی کامل صفحه از دست می‌رود."}</p>
          {historyStorageError && <p className="field-error" role="alert">ذخیرهٔ تاریخچه در این مرورگر ممکن نیست.</p>}
          <p className="chat-sidebar-note">
            پاسخ‌های این نمونه برای بررسی طراحی هستند و جایگزین بررسی تخصصی یا
            نظر مرجع رسمی نیستند.
          </p>
        </aside>
        <div className="chat-main">
          <div className="chat-main-header">
            <h2>یک سؤال، یک مسیر روشن‌تر</h2>
            <span className="demo-badge">نسخهٔ طراحی</span>
          </div>
          <ChatMessages messages={messages} busy={busy} onReferral={onReferral} />
          <div className="chat-quota" role="status">سهمیهٔ مهمان: {new Intl.NumberFormat("fa-IR").format(Math.max(0, limit - used))} تعامل نمونه از {new Intl.NumberFormat("fa-IR").format(limit)} باقی مانده است.</div>
          {error && <div className="chat-error" role="alert"><p>{error}</p><button className="button button-outline" onClick={onRetry} disabled={busy || blocked}>تلاش دوباره</button></div>}
          {blocked && <div className="chat-limit-notice"><strong>سهمیهٔ آزمایشی مهمان پایان یافته است.</strong><p>برای آشنایی با مسیر ادامه، ثبت‌نام را ببینید. استفادهٔ بیشتر پس از فعال‌شدن حساب و سرویس اصلی ممکن خواهد بود.</p><a className="button button-primary" href="?view=signup">ثبت‌نام برای ادامه</a></div>}
          <ChatComposer onSend={onSend} busy={busy} blocked={blocked} />
        </div>
      </div>
    </section>
  );
}

export function QuoteConcept({ summary }) {
  if (!summary.hasRoute) return <section className="concept-surface resource-message"><h1>هنوز مسیری انتخاب نشده است</h1><p>کشور و شهرهای مبدأ و مقصد و دامنهٔ حمل را مشخص کنید.</p><a className="button button-primary" href="./#quote">انتخاب مسیر حمل</a></section>;
  return (
    <section data-concept="quote" data-figma="Quote/NextStep">
      <div className="concept-banner">
        <div>
          <h1>یک قدم تا درخواست روشن‌تر</h1>
          <p>مشخصات بار را کامل کنید و پیش از ارسال، اطلاعات را مرور کنید.</p>
        </div>
        <span className="demo-badge">مسیر نمونهٔ استعلام</span>
      </div>
      <div className="concept-breadcrumb">
        <span>انتخاب مسیر</span>
        <Icon name="chevron-left" />
        <span className="current">تکمیل مشخصات</span>
        <Icon name="chevron-left" />
        <span>مرور درخواست</span>
      </div>
      <div className="concept-surface request-layout">
        <QuoteDetailsForm summary={summary} />
        <aside className="request-summary">
          <h2>مسیر انتخابی شما</h2>
          <div className="summary-stop">
            <Icon name="circle-dot" />
            <div>
              <span>مبدأ بارگیری</span>
              <strong>{summary.origin}</strong>
            </div>
          </div>
          <div className="summary-stop">
            <Icon name="map-pin" />
            <div>
              <span>مقصد بارگیری</span>
              <strong>{summary.destination}</strong>
            </div>
          </div>
          <div className="summary-stop">
            <Icon name={summary.modeIcon} />
            <div>
              <span>شیوهٔ حمل و وسیله</span>
              <strong>
                {summary.modeLabel}
                {summary.vehicle ? ` · ${summary.vehicle}` : ""}
              </strong>
            </div>
          </div>
          <div className="summary-stop">
            <Icon name="boxes" />
            <div>
              <span>نوع بار و وزن</span>
              <strong>
                {summary.goods}
                {summary.weight ? ` · ${summary.weight} کیلوگرم` : ""}
              </strong>
            </div>
          </div>
          <p className="summary-footnote">
            هر نرخ پس از بررسی کامل مشخصات و شرایط درخواست معنا پیدا می‌کند.
          </p>
          <dl className="summary-metadata"><dt>دامنهٔ حمل</dt><dd>{summary.scopeLabel}</dd><dt>نام مسیر</dt><dd>{summary.routeName || "بدون نام"}</dd>{summary.pickup && <><dt>محل بارگیری</dt><dd>{summary.pickup}</dd></>}{summary.dropoff && <><dt>محل تخلیه</dt><dd>{summary.dropoff}</dd></>}{summary.ready && <><dt>آماده‌سازی</dt><dd>{summary.ready}</dd></>}<dt>منبع ارجاع</dt><dd>{summary.referralSource === "ai" ? "گفت‌وگوی نمونه" : "مستقیم"}</dd></dl>
          <a className="text-link" href="?edit=quote#quote">اصلاح مسیر و شیوهٔ حمل</a>
        </aside>
      </div>
    </section>
  );
}

export function CustomsConcept({ summary }) {
  return (
    <section data-concept="customs" data-figma="Customs/AdvancedStep">
      <div className="concept-banner">
        <div>
          <h1>مشخصات پروندهٔ ترخیص</h1>
          <p>
            اطلاعات کالا و عوامل هزینه را برای بررسی دقیق‌تر کنار هم قرار دهید.
          </p>
        </div>
        <span className="demo-badge">مسیر نمونه؛ بدون محاسبهٔ مبلغ</span>
      </div>
      <div className="concept-breadcrumb">
        <span>معرفی کالا</span>
        <Icon name="chevron-left" />
        <span className="current">جزئیات پرونده</span>
        <Icon name="chevron-left" />
        <span>مرور اطلاعات</span>
      </div>
      <div className="concept-surface request-layout">
        <CustomsDetailsForm summary={summary} />
        <aside className="request-summary">
          <h2>خلاصهٔ مرحلهٔ نخست</h2>
          <span id="operation-summary" className="demo-badge">
            {summary.operationLabel}
          </span>
          <div className="summary-stop">
            <Icon name="package" />
            <div>
              <span>نوع کالا</span>
              <strong>{summary.goods}</strong>
            </div>
          </div>
          <div className="summary-stop">
            <Icon name="file-text" />
            <div>
              <span>گمرک موردنظر</span>
              <strong>{summary.office}</strong>
            </div>
          </div>
          <p className="summary-footnote">
            مقادیر این نما برای ارزیابی طراحی و ترتیب اطلاعات استفاده می‌شوند.
          </p>
        </aside>
      </div>
    </section>
  );
}

export function ConceptFooter() {
  return (
    <p className="concept-footer">
      پیش‌نمایش گمرک‌دات‌کام · پیش‌نویس‌ها فقط در حافظهٔ موقت همین تب نگه‌داری می‌شوند.
    </p>
  );
}
