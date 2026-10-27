import { Icon } from "../components/Icon.jsx";
import { MobileMenuToggle } from "../components/MobileMenu.jsx";
import { QuoteForm } from "../features/quote/QuoteForm.jsx";
import { CustomsForm } from "../features/customs/CustomsForm.jsx";
import {
  MarketFilters,
  MarketLead,
} from "../features/market/MarketControls.jsx";
import {
  DriverList,
  IranMap,
  ProvinceSelect,
  VehicleSelect,
  driverDemoData,
  faNumber,
} from "../features/drivers/DriversWidgets.jsx";

export function HeaderSection() {
  return (
    <header className="site-header" data-figma="Header/Top">
      <div className="container header-inner">
        <a
          href="./"
          className="brand-logo"
          aria-label="گمرک‌دات‌کام، صفحه اصلی"
        >
          <img
            src="./assets/brand/gomrok-original.jpg"
            alt="Gomrok"
            width="1536"
            height="640"
          />
        </a>
        <nav className="desktop-nav" aria-label="ناوبری اصلی">
          <a className="active" href="#main">
            صفحه اصلی
          </a>
          <a href="#quote">استعلام حمل</a>
          <a href="#customs">ترخیص کالا</a>
          <a href="#ai">هوش مصنوعی</a>
          <a href="#drivers">رانندگان</a>
          <a href="#articles">مقالات</a>
        </nav>
        <div className="header-actions">
          <button className="text-button login-link" data-info="login">
            ورود
          </button>
          <button
            className="button button-small button-outline"
            data-info="signup"
          >
            ثبت‌نام <Icon name="arrow-up-left" />
          </button>
          <MobileMenuToggle
            className="icon-button menu-toggle"
            aria-label="باز کردن منو"
            aria-controls="mobile-menu"
          />
        </div>
      </div>
    </header>
  );
}

export function HeroSection() {
  return (
    <section className="hero" data-figma="Hero/FreightQuote">
      <div className="container">
        <div className="hero-intro">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="eyebrow-line"></span>برای مسیرهای مهم تجارت شما
            </p>
            <h1>
              از مبدأ تا مقصد،
              <br />
              <span className="hero-title-accent">مسیر حمل روشن است.</span>
            </h1>
            <p className="hero-description">
              برای حمل بار خود استعلام بگیرید، گزینه‌ها را بررسی کنید
              <br className="desktop-break" />و با آگاهی تصمیم بگیرید.
            </p>
          </div>
          <div
            className="route-art"
            data-figma="Artwork/RouteNetwork"
            aria-label="نمودار مسیر نمونه از تهران به استانبول"
          >
            <svg
              viewBox="0 0 450 240"
              aria-hidden="true"
              className="route-network"
            >
              <defs>
                <pattern
                  id="route-grid"
                  width="24"
                  height="24"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="1" cy="1" r="1" fill="#C9D5E1"></circle>
                </pattern>
              </defs>
              <rect
                x="6"
                y="4"
                width="438"
                height="218"
                fill="url(#route-grid)"
              ></rect>
              <path
                d="M66 76H158Q186 76 186 104V148Q186 176 218 176H366"
                fill="none"
                stroke="#D8E2ED"
                strokeWidth="2"
              ></path>
              <path
                d="M366 176H284Q252 176 252 144V108Q252 76 220 76H66"
                fill="none"
                stroke="#1D4ED8"
                strokeWidth="2.5"
              ></path>
              <path
                d="M66 76Q100 194 194 194Q284 194 366 176"
                fill="none"
                stroke="#9AAEC3"
                strokeWidth="1.5"
                strokeDasharray="4 5"
              ></path>
              <circle cx="66" cy="76" r="16" fill="#EFF6FF"></circle>
              <circle cx="66" cy="76" r="6" fill="#1D4ED8"></circle>
              <circle cx="366" cy="176" r="18" fill="#EFF6FF"></circle>
              <circle cx="366" cy="176" r="7" fill="#1D4ED8"></circle>
              <circle
                cx="252"
                cy="126"
                r="6"
                fill="#FFFFFF"
                stroke="#0F766E"
                strokeWidth="2"
              ></circle>
              <path
                d="m94 71-7 5 7 5"
                fill="none"
                stroke="#1D4ED8"
                strokeWidth="2"
                strokeLinecap="round"
              ></path>
              <path
                d="M425 32h-14m7-7v14M27 196H13m7-7v14"
                stroke="#A4B5C7"
                strokeWidth="1"
              ></path>
            </svg>
            <div className="route-node route-node-origin">
              <span className="route-node-caption">مبدأ</span>
              <strong>تهران</strong>
              <span className="micro-latin">TEHRAN</span>
            </div>
            <div className="route-node route-node-destination">
              <span className="route-node-caption">مقصد</span>
              <strong>استانبول</strong>
              <span className="micro-latin">ISTANBUL</span>
            </div>
            <span className="route-sample">
              مسیر نمونه <Icon name="route" />
            </span>
          </div>
        </div>
        <QuoteForm />
        <div className="hero-bottom">
          <span>
            <Icon name="route" />
            مسیر روشن
          </span>
          <i></i>
          <span>
            <Icon name="sliders-horizontal" />
            انتخاب آگاهانه
          </span>
          <i></i>
          <span>
            <Icon name="file-text" />
            اطلاعات منظم
          </span>
          <a href="#ai">
            بیشتر با گمرک‌دات‌کام آشنا شوید
            <Icon name="arrow-left" />
          </a>
        </div>
      </div>
    </section>
  );
}

export function AISection() {
  return (
    <section
      className="section ai-section"
      id="ai"
      data-figma="Section/GomrokAI"
    >
      <div className="container ai-layout">
        <div className="section-copy">
          <p className="eyebrow">
            <span className="section-number">۰۱</span>یک همراه برای سؤال‌های شما
          </p>
          <h2>
            پیش از هر تصمیم،
            <br />
            مسیر را بهتر بشناسید.
          </h2>
          <p>
            دستیار هوشمند گمرک برای سؤال‌های شما درباره مراحل ترخیص، مدارک و
            فرآیندهای حمل‌ونقل طراحی شده است.
          </p>
          <a className="button button-primary" href="?view=chat">
            گفت‌وگو با هوش مصنوعی <Icon name="arrow-left" />
          </a>
          <p className="quiet-note">
            <Icon name="info" />
            راهنمایی اولیه؛ جایگزین بررسی تخصصی نیست.
          </p>
        </div>
        <div className="chat-preview" data-figma="AI/ConversationPreview">
          <div className="chat-topbar">
            <div className="ai-signature">
              <Icon name="sparkles" />
              <strong dir="ltr">Gomrok AI</strong>
            </div>
            <span className="demo-badge">نمونه گفت‌وگو</span>
          </div>
          <div className="chat-content">
            <div className="chat-message user-message">
              <span className="message-avatar">شما</span>
              <div>برای ترخیص کالا چه مدارکی لازم دارم؟</div>
            </div>
            <div className="chat-message assistant-message">
              <span className="message-avatar ai-avatar">
                <Icon name="sparkles" />
              </span>
              <div>
                <strong>از مشخصات کالای شما شروع کنیم.</strong>
                <p>
                  نوع کالا، کشور مبدأ و گمرک موردنظر را بگویید تا مسیر بررسی
                  مدارک روشن‌تر شود.
                </p>
                <div className="chat-source">
                  <Icon name="file-text" />
                  پاسخ نمونه برای نمایش طراحی
                </div>
              </div>
            </div>
            <div className="suggestion-label">می‌توانید از اینجا شروع کنید</div>
            <a
              className="question-chip"
              href="?view=chat&question=%DA%A9%D8%AF%20%D8%AA%D8%B9%D8%B1%D9%81%D9%87%20%DA%A9%D8%A7%D9%84%D8%A7%20%D8%B1%D8%A7%20%D8%A7%D8%B2%20%DA%A9%D8%AC%D8%A7%20%D9%BE%DB%8C%D8%AF%D8%A7%20%DA%A9%D9%86%D9%85%D8%9F"
            >
              کد تعرفه کالا را از کجا پیدا کنم؟
              <Icon name="arrow-up-left" />
            </a>
          </div>
          <a className="chat-input-preview" href="?view=chat">
            <span>سؤال خود را بنویسید…</span>
            <span className="send-square">
              <Icon name="arrow-up" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

export function CustomsSection() {
  return (
    <section
      className="section customs-section"
      id="customs"
      data-figma="Section/CustomsTools"
    >
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              <span className="section-number">۰۲</span>ابزارهای تخصصی تجارت
            </p>
            <h2>استعلام و خدمات ترخیص کالا</h2>
            <p>ابزارهای تخصصی برای برآورد هزینه‌ها و مدیریت فرآیند ترخیص.</p>
          </div>
          <span className="role-label">
            <Icon name="file-text" />
            ویژه ترخیص‌کاران
          </span>
        </div>
        <div className="customs-workspace">
          <div className="customs-services">
            <span className="overline">میز کار ترخیص</span>
            <button
              className="service-row selected"
              data-customs-service="estimate"
            >
              <Icon name="sliders-horizontal" />
              <span>برآورد هزینه ترخیص</span>
              <Icon name="chevron-left" />
            </button>
            <button className="service-row" data-customs-service="declaration">
              <Icon name="file-text" />
              <span>اظهارنامه گمرکی</span>
              <Icon name="chevron-left" />
            </button>
            <button className="service-row" data-customs-service="tracking">
              <Icon name="route" />
              <span>رهگیری وضعیت</span>
              <Icon name="chevron-left" />
            </button>
            <button className="service-row" data-customs-service="documents">
              <Icon name="boxes" />
              <span>مدارک موردنیاز</span>
              <Icon name="chevron-left" />
            </button>
            <button className="service-row" data-customs-service="broker">
              <Icon name="message-square-text" />
              <span>ارتباط با ترخیص‌کار</span>
              <Icon name="chevron-left" />
            </button>
            <div className="customs-services-note">
              <span className="small-rule"></span>
              <p>
                اطلاعات درست،
                <br />
                شروع یک برآورد روشن.
              </p>
            </div>
          </div>
          <CustomsForm />
          <div className="customs-photo">
            <img
              src="./assets/photos/operations.jpg"
              alt="بررسی اسناد و موجودی در محیط واقعی انبار"
              loading="lazy"
              width="1000"
              height="667"
            />
            <div className="photo-caption">
              <Icon name="package" />
              <strong>
                از جزئیات کالا،
                <br />
                تا تصویر روشن‌تر مسیر.
              </strong>
            </div>
            <span className="photo-corner" aria-hidden="true"></span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function MarketSection({
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
    <section
      className="section market-section"
      id="market"
      data-figma="Section/MarketActivity"
    >
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              <span className="section-number">۰۳</span>عرضه و تقاضا در یک نگاه
            </p>
            <h2>نبض بازار حمل‌ونقل</h2>
            <p>نمایی از عرضه و تقاضای بار و ناوگان در سامانه</p>
          </div>
          <div className="market-heading-controls">
            <span className="demo-badge">داده نمایشی</span>
            <MarketFilters filter={filter} onChange={onFilterChange} />
          </div>
        </div>
        <div className="market-panel" data-filter={filter}>
          <MarketLead filter={filter} />
          <div className="market-chart">
            <div className="chart-heading">
              <span>الگوی نمونهٔ فعالیت</span>
              <div className="chart-legend">
                <span>
                  <i className="blue-dot"></i>درخواست بار
                </span>
                <span>
                  <i className="teal-dot"></i>ناوگان
                </span>
              </div>
            </div>
            <svg
              viewBox="0 0 760 174"
              className="activity-chart"
              aria-label="نمودار نمایشی فعالیت بار و ناوگان"
              role="img"
            >
              <defs>
                <lineargradient id="chart-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop stopColor="#1D4ED8" stopOpacity=".1"></stop>
                  <stop offset="1" stopColor="#1D4ED8" stopOpacity="0"></stop>
                </lineargradient>
              </defs>
              <g stroke="#E2E8F0" strokeDasharray="3 5">
                <path d="M0 30H760M0 75H760M0 120H760M0 165H760"></path>
              </g>
              <path
                d="M0 130C30 130 40 96 75 104S122 151 166 117S211 49 254 64S298 105 340 84S395 33 433 52S492 98 535 68S575 47 621 34S698 60 760 15V174H0Z"
                fill="url(#chart-fill)"
              ></path>
              <path
                className="cargo-line"
                d="M0 130C30 130 40 96 75 104S122 151 166 117S211 49 254 64S298 105 340 84S395 33 433 52S492 98 535 68S575 47 621 34S698 60 760 15"
                fill="none"
                stroke="#1D4ED8"
                strokeWidth="2.5"
              ></path>
              <path
                className="drivers-line"
                d="M0 150C38 151 55 118 95 134S147 110 190 123S239 105 282 116S337 96 383 103S422 74 469 87S517 61 564 78S613 58 660 70S716 44 760 53"
                fill="none"
                stroke="#0F766E"
                strokeWidth="2"
                strokeDasharray="5 4"
              ></path>
            </svg>
            <div className="chart-axis">
              <span>ابتدای بازه</span>
              <span>میانهٔ بازه</span>
              <span>انتهای بازه</span>
            </div>
          </div>
          <div className="metric-strip">
            <div className="metric" data-category="cargo">
              <span className="metric-label">در حال بارگیری</span>
              <strong>
                ۳۶<span>بار</span>
              </strong>
              <span className="mini-bars" aria-hidden="true">
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
              </span>
            </div>
            <div className="metric" data-category="drivers">
              <span className="metric-label">رانندگان خالی</span>
              <strong>
                ۲۱۴<span>راننده</span>
              </strong>
              <span className="metric-line blue"></span>
            </div>
            <div className="metric" data-category="drivers">
              <span className="metric-label">رانندگان دارای بار</span>
              <strong>
                ۹۶<span>راننده</span>
              </strong>
              <span className="metric-line teal"></span>
            </div>
            <div className="metric" data-category="cargo">
              <span className="metric-label">درخواست‌های حمل</span>
              <strong>
                ۸۴<span>درخواست</span>
              </strong>
              <span className="metric-spark" aria-hidden="true">
                <svg viewBox="0 0 85 20">
                  <path
                    d="M1 17 14 12 24 14 36 5 50 9 61 4 73 6 84 1"
                    fill="none"
                    stroke="#1D4ED8"
                    strokeWidth="1.5"
                  ></path>
                </svg>
              </span>
            </div>
            <div className="metric" data-category="drivers">
              <span className="metric-label">رانندگان فعال</span>
              <strong>
                ۳۱۰<span>راننده</span>
              </strong>
              <span className="metric-ratio">
                <i></i>
              </span>
            </div>
          </div>
        </div>
        <p className="module-note">
          تمام اعداد و روندهای این بخش نمونه‌اند و موجودی واقعی یا دادهٔ لحظه‌ای
          را نشان نمی‌دهند.
        </p>
      </div>
    </section>
  );
}

export function DriversSection({
  province,
  onProvinceChange,
  vehicle,
  onVehicleChange,
  provinces,
  paths,
  mapState,
  sectionRef,
  onMapRetry,
}) {
  return (
    <section
      className="section drivers-section"
      id="drivers"
      data-figma="Section/IranDriversMap"
      ref={sectionRef}
    >
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              <span className="section-number">۰۴</span>یک نگاه نزدیک‌تر به
              ناوگان
            </p>
            <h2>رانندگان موجود در استان‌های ایران</h2>
            <p>
              استان موردنظر را انتخاب کنید و وضعیت نمونهٔ ناوگان آن منطقه را
              ببینید.
            </p>
          </div>
          <span className="demo-badge">داده نمایشی</span>
        </div>
        <div className="drivers-workspace">
          <div className="map-column">
            <div className="map-toolbar">
              <div className="field compact-field">
                <label htmlFor="province-select">انتخاب استان</label>
                <div className="select-wrap">
                  <ProvinceSelect
                    province={province}
                    provinces={provinces}
                    onChange={onProvinceChange}
                  />
                  <Icon name="chevron-down" />
                </div>
              </div>
              <div className="map-instruction">
                <Icon name="map-pin" />
                یا روی نقشه انتخاب کنید
              </div>
            </div>
            <div
              className="iran-map"
              id="iran-map"
              data-figma="Map/TehranSelected"
            >
              <IranMap
                province={province}
                provinces={provinces}
                paths={paths}
                loading={mapState === "idle" || mapState === "loading"}
                onSelect={onProvinceChange}
              />
              {!paths && (
                <div
                  className="map-state-message"
                  role={mapState === "error" ? "alert" : "status"}
                >
                  {mapState === "error" ? (
                    <>
                      <span>نقشه بارگیری نشد.</span>
                      <button type="button" onClick={onMapRetry}>
                        تلاش دوباره
                      </button>
                    </>
                  ) : mapState === "loading" ? (
                    "در حال آماده‌سازی نقشه…"
                  ) : (
                    "نقشه با نزدیک‌شدن به این بخش آماده می‌شود."
                  )}
                </div>
              )}
            </div>
            <div className="map-footnote">
              <span>
                <i className="map-key selected-key"></i>استان انتخاب‌شده
              </span>
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
                dir="ltr"
              >
                © OpenStreetMap · geoBoundaries
              </a>
            </div>
          </div>
          <aside
            className="province-panel"
            id="province-panel"
            aria-label="ناوگان استان انتخاب‌شده"
          >
            <div className="province-title">
              <span className="overline">ناوگان نمونهٔ استان</span>
              <div>
                {province.fa}
                <span className="province-symbol">
                  <Icon name="map-pin" />
                </span>
              </div>
              <p>
                <strong>
                  {faNumber.format(driverDemoData(province.id).count)}
                </strong>{" "}
                خودروی نمونه در این استان
              </p>
            </div>
            <div className="field vehicle-filter">
              <label htmlFor="map-vehicle">نوع خودرو</label>
              <div className="select-wrap">
                <VehicleSelect value={vehicle} onChange={onVehicleChange} />
                <Icon name="chevron-down" />
              </div>
            </div>
            <DriverList
              province={province}
              vehicle={vehicle}
              onVehicleChange={onVehicleChange}
            />
            <div className="province-panel-footer">
              <Icon name="info" />
              پروفایل‌ها و موقعیت‌ها صرفاً نمونه‌اند.
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export function ArticlesSection() {
  return (
    <section
      className="section articles-section"
      id="articles"
      data-figma="Section/Articles"
    >
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              <span className="section-number">۰۵</span>آگاهی، پیش از اقدام
            </p>
            <h2>آخرین مقالات و راهنماهای گمرکی</h2>
            <p>برای تصمیم‌های بهتر در مسیر حمل و تجارت.</p>
          </div>
          <button className="text-link" data-info="archive">
            مشاهده همه مقالات <Icon name="arrow-left" />
          </button>
        </div>
        <div className="article-grid">
          <article className="article-card">
            <button
              className="article-cover"
              data-article="clearance"
              aria-label="پیش‌نمایش راهنمای کامل مراحل ترخیص کالا"
            >
              <img
                src="./assets/photos/port.jpg"
                alt="نمای واقعی بندر و کانتینرهای بار"
                loading="lazy"
                width="1600"
                height="1068"
              />
              <span className="cover-link">
                <Icon name="arrow-up-left" />
              </span>
            </button>
            <div className="article-meta">
              <span>ترخیص کالا</span>
              <span>پیش‌نمایش راهنما</span>
            </div>
            <h3>
              <button data-article="clearance">
                راهنمای کامل مراحل ترخیص کالا
              </button>
            </h3>
            <p>
              نگاهی منظم به مسیر ترخیص و پرسش‌هایی که پیش از شروع باید پاسخ
              دهید.
            </p>
            <button className="article-read" data-article="clearance">
              مطالعه راهنما <Icon name="arrow-left" />
            </button>
          </article>
          <article className="article-card">
            <button
              className="article-cover"
              data-article="freight"
              aria-label="پیش‌نمایش راهنمای برآورد هزینه حمل"
            >
              <img
                src="./assets/photos/freight.jpg"
                alt="کامیون باربری در مسیر بین‌شهری هنگام غروب"
                loading="lazy"
                width="1280"
                height="1600"
              />
              <span className="cover-link">
                <Icon name="arrow-up-left" />
              </span>
            </button>
            <div className="article-meta">
              <span>حمل‌ونقل</span>
              <span>پیش‌نمایش راهنما</span>
            </div>
            <h3>
              <button data-article="freight">
                چگونه هزینه حمل بار را برآورد کنیم؟
              </button>
            </h3>
            <p>
              از مشخصات بار تا انتخاب مسیر؛ اطلاعاتی که برای درخواست استعلام
              لازم است.
            </p>
            <button className="article-read" data-article="freight">
              مطالعه راهنما <Icon name="arrow-left" />
            </button>
          </article>
          <article className="article-card">
            <button
              className="article-cover"
              data-article="imports"
              aria-label="پیش‌نمایش مدارک موردنیاز برای واردات"
            >
              <img
                src="./assets/photos/warehouse.jpg"
                alt="قفسه‌ها و بسته‌های کالا در انبار صنعتی واقعی"
                loading="lazy"
                width="1600"
                height="1067"
              />
              <span className="cover-link">
                <Icon name="arrow-up-left" />
              </span>
            </button>
            <div className="article-meta">
              <span>واردات</span>
              <span>پیش‌نمایش راهنما</span>
            </div>
            <h3>
              <button data-article="imports">
                مدارک موردنیاز برای واردات کالا
              </button>
            </h3>
            <p>
              پیش از اقدام، اطلاعات و مدارک پروندهٔ خود را با یک چک‌لیست روشن
              مرتب کنید.
            </p>
            <button className="article-read" data-article="imports">
              مطالعه راهنما <Icon name="arrow-left" />
            </button>
          </article>
        </div>
      </div>
    </section>
  );
}

export function FooterSection() {
  return (
    <footer className="site-footer" data-figma="Footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand">
            <div className="footer-logo-panel">
              <a href="#main" className="brand-logo" aria-label="گمرک‌دات‌کام">
                <img
                  src="./assets/brand/gomrok-original.jpg"
                  alt="Gomrok"
                  width="1536"
                  height="640"
                />
              </a>
            </div>
            <p>
              از اولین استعلام تا انتخاب مسیر،
              <br />
              همراه تصمیم‌های روشن در حمل و تجارت.
            </p>
            <span className="footer-domain" dir="ltr">
              GOMROK.COM <Icon name="move-up-right" />
            </span>
          </div>
          <div className="footer-links">
            <h3>خدمات گمرک‌دات‌کام</h3>
            <a href="#quote">استعلام نرخ حمل</a>
            <a href="#customs">خدمات ترخیص کالا</a>
            <a href="?view=chat">دستیار هوشمند</a>
            <a href="#drivers">جست‌وجوی ناوگان</a>
          </div>
          <div className="footer-links">
            <h3>آگاهی و راهنما</h3>
            <a href="#articles">مقالات و راهنماها</a>
            <button data-info="how">چگونه شروع کنم؟</button>
            <button data-info="faq">پرسش‌های متداول</button>
            <button className="" data-info="design-guide">
              راهنمای طراحی
            </button>
          </div>
          <div className="footer-contact">
            <h3>در مسیر تجارت، کنار شما</h3>
            <p>سؤال یا پیشنهادی درباره خدمات دارید؟</p>
            <button className="footer-contact-button" data-info="contact">
              ارتباط با گمرک‌دات‌کام <Icon name="arrow-left" />
            </button>
            <p className="footer-identity">
              یک پلتفرم تجاری مستقل در حوزهٔ حمل‌ونقل و خدمات گمرکی.
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© گمرک‌دات‌کام. تمامی حقوق محفوظ است.</span>
          <div>
            <button data-info="privacy">حریم خصوصی</button>
            <button data-info="terms">شرایط استفاده</button>
            <a href="#main" className="back-top">
              بازگشت به بالا <Icon name="arrow-up" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
