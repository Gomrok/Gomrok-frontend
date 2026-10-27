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
          <span className="chat-sidebar-title">گفت‌وگوی نمونه</span>
          <button
            className="history-item"
            data-chat-question="برای ترخیص کالا از کجا شروع کنم؟"
          >
            برای ترخیص کالا از کجا شروع کنم؟
          </button>
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
          <ChatMessages messages={messages} busy={busy} />
          <ChatComposer onSend={onSend} busy={busy} />
        </div>
      </div>
    </section>
  );
}

export function QuoteConcept({ summary }) {
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
      پیش‌نمایش طراحی گمرک‌دات‌کام · اطلاعات در حافظهٔ موقت همین صفحه می‌مانند.
    </p>
  );
}
