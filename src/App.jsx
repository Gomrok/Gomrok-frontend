import { lazy, Suspense, useEffect, useState } from "react";
import { WorkspaceProvider } from "./contexts/WorkspaceContext.jsx";
import { ChatHistoryProvider } from "./contexts/ChatHistoryContext.jsx";
import { AppErrorBoundary } from "./components/AppErrorBoundary.jsx";
import { DialogProvider, useDialog } from "./components/DialogContext.jsx";
import { MobileMenuProvider, useMobileMenu } from "./components/MobileMenu.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { ConceptPage } from "./pages/ConceptPage.jsx";
const AccountPage = lazy(() => import("./pages/AccountPage.jsx"));

const infoCopy = {
  login: [
    "ورود به حساب",
    "این نما، پیش‌نمایش مسیر ورود است. ورود واقعی و دریافت اطلاعات حساب در این نمونهٔ طراحی فعال نیست.",
  ],
  signup: [
    "شروع همراهی با گمرک‌دات‌کام",
    "در مسیر ثبت‌نام، نقش فعالیت شما انتخاب می‌شود: صاحب کالا، شرکت حمل، ترخیص‌کار یا راننده. این پیش‌نمایش اطلاعات شخصی دریافت نمی‌کند.",
  ],
  archive: [
    "مقالات و راهنماها",
    "سه پیش‌نمایش این صفحه، ساختار مجلهٔ گمرک‌دات‌کام را نشان می‌دهند. متن نهایی مقالات پس از بررسی تخصصی منتشر می‌شود.",
  ],
  contact: [
    "ارتباط با گمرک‌دات‌کام",
    "اطلاعات تماس تأییدشده در نسخهٔ منتشرشده درج خواهد شد. این پیش‌نمایش شماره تلفن، ایمیل یا کانال ارتباطی ساختگی نمایش نمی‌دهد.",
  ],
  how: [
    "از یک مسیر شروع کنید",
    "مبدأ و مقصد بار را انتخاب کنید، مشخصات کالا را اضافه کنید و به مرحلهٔ مرور درخواست بروید. مسیرهای ترخیص، ناوگان و دستیار هوشمند نیز از همین صفحه در دسترس‌اند.",
  ],
  faq: [
    "پرسش‌های متداول",
    "در این طرح نرخ واقعی نمایش داده نمی‌شود. آمار بازار و ناوگان همگی با برچسب دادهٔ نمایشی مشخص شده‌اند.",
  ],
  privacy: [
    "حریم خصوصی",
    "در این پیش‌نمایش، مشخصات فرم فقط برای نمایش مراحل داخل مرورگر استفاده می‌شود و به سرویس خارجی یا پایگاه‌داده ارسال نمی‌شود. متن سیاست حریم خصوصی باید پیش از انتشار نهایی تأیید شود.",
  ],
  terms: [
    "شرایط استفاده",
    "این نما ساختار دسترسی به شرایط استفاده را نشان می‌دهد و هیچ قرارداد یا شرایط الزام‌آوری ایجاد نمی‌کند. متن نهایی محصول باید پیش از انتشار بررسی شود.",
  ],
  "design-guide": [
    "راهنمای طراحی",
    "توکن‌های رنگ، تایپوگرافی و حالت‌های رابط در ساختار CSS و اجزای همین پروژه پیاده‌سازی شده‌اند.",
  ],
};

const articleCopy = {
  clearance: [
    "راهنمای کامل مراحل ترخیص کالا",
    "شناخت مراحل پرونده",
    "ثبت مشخصات، بررسی مدارک و پیگیری وضعیت، سه بخش قابل‌تفکیک در مسیر مطالعهٔ این راهنما هستند.",
  ],
  freight: [
    "چگونه هزینه حمل بار را برآورد کنیم؟",
    "مشخصات بار، پیش از استعلام",
    "نوع کالا، وزن تقریبی، مبدأ و مقصد را کنار هم قرار دهید. این پیش‌نمایش نمونهٔ ساختار مقاله است و نرخ واقعی ارائه نمی‌کند.",
  ],
  imports: [
    "مدارک موردنیاز برای واردات کالا",
    "یک پروندهٔ مرتب برای بررسی تخصصی",
    "در مقالهٔ نهایی، اطلاعات عمومی از الزامات وابسته به کالا و عملیات جدا می‌شود. محتوای تخصصی پیش از انتشار باید بررسی شود.",
  ],
};

const serviceCopy = {
  estimate: [
    "برآورد هزینه ترخیص",
    "این فرم فقط مسیر نمونهٔ معرفی کالا و مرور اطلاعات را نشان می‌دهد. برآورد واقعی یا مبلغ حقوق ورودی به قوانین و مشخصات پرونده وابسته است.",
  ],
  declaration: [
    "اظهارنامه گمرکی",
    "این نما محل شروع یک گردش کار نمونه را نشان می‌دهد؛ اظهارنامهٔ واقعی ثبت یا ارسال نمی‌شود.",
  ],
  tracking: [
    "رهگیری وضعیت",
    "اطلاعات رهگیری زنده به سرویس حمل متصل نیست. وضعیت‌های عملیاتی پس از اتصال سرویس معتبر نمایش داده می‌شوند.",
  ],
  documents: [
    "مدارک موردنیاز",
    "مدارک لازم به نوع کالا، مبدأ و مقررات زمان انجام عملیات وابسته‌اند و برای این نمونه تولید نشده‌اند.",
  ],
  broker: [
    "ارتباط با ترخیص‌کار",
    "این پیش‌نمایش مسیر تماس را نشان می‌دهد. پروفایل یا اطلاعات تماس ساختگی نمایش داده نمی‌شود.",
  ],
};

function AppContent() {
  const { openDialog, closeDialog } = useDialog();
  const { close: closeMenu } = useMobileMenu();
  const [location, setLocation] = useState(() => window.location.href);
  useEffect(() => { const sync = () => setLocation(window.location.href); window.addEventListener("popstate", sync); return () => window.removeEventListener("popstate", sync); }, []);
  const params = new URLSearchParams(new URL(location).search);
  const concept = ["chat", "quote", "customs"].includes(params.get("view"));
  const account = ["login", "signup", "panel"].includes(params.get("view"));

  useEffect(() => {
    document.body.classList.toggle("concept-body", concept || account);
    document.body.dataset.page = account ? "account" : concept ? "concept" : "home";
    document.title = account ? "گمرک‌دات‌کام | حساب و پنل نمونه" : concept
      ? "گمرک‌دات‌کام | مسیرهای نمونه"
      : "گمرک‌دات‌کام | از مبدأ تا مقصد";
    return () => {
      document.body.classList.remove("concept-body");
      delete document.body.dataset.page;
    };
  }, [concept, account]);

  function onClick(event) {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const link = target.closest("a[href]");
    if (link && !event.defaultPrevented && !event.ctrlKey && !event.metaKey && !event.shiftKey && !link.target && !link.hasAttribute("download")) {
      const destination = new URL(link.href, window.location.href);
      if (destination.origin === window.location.origin && destination.pathname === window.location.pathname && destination.search !== window.location.search) {
        event.preventDefault(); closeMenu(); window.history.pushState({}, "", destination.href); window.dispatchEvent(new PopStateEvent("popstate"));
        if (!destination.hash) window.scrollTo({ top: 0, behavior: "instant" });
      }
    }
    if (target.closest("[data-close-dialog]")) closeDialog();

    const info = target.closest("[data-info]");
    if (info && infoCopy[info.dataset.info]) {
      closeMenu();
      if (["login", "signup"].includes(info.dataset.info)) window.location.assign(`?view=${info.dataset.info}`);
      else openDialog(...infoCopy[info.dataset.info]);
    }

    const article = target.closest("[data-article]");
    if (article && articleCopy[article.dataset.article]) {
      event.preventDefault();
      const [title, subtitle, body] = articleCopy[article.dataset.article];
      openDialog(
        title,
        <>
          <p className="overline">پیش‌نمایش ساختار مجلهٔ گمرک‌دات‌کام</p>
          <h3>{subtitle}</h3>
          <p className="dialog-copy">{body}</p>
          <p className="dialog-note">
            این متن نمونهٔ طراحی است و مقالهٔ منتشرشده یا توصیهٔ رسمی گمرکی
            محسوب نمی‌شود.
          </p>
        </>,
        [{ label: "رفتن به استعلام حمل", href: "#quote", primary: true }],
      );
    }

    const service = target.closest("[data-customs-service]");
    if (service && serviceCopy[service.dataset.customsService])
      openDialog(...serviceCopy[service.dataset.customsService]);

    const question = target.closest("[data-chat-question]");
    if (question)
      window.dispatchEvent(
        new CustomEvent("gomrok:prompt", {
          detail: question.dataset.chatQuestion,
        }),
      );
    if (target.closest(".new-chat"))
      window.dispatchEvent(new Event("gomrok:new-chat"));
  }

  return (
    <div className="site-app" onClick={onClick}>
      <Suspense fallback={<p className="resource-message" role="status">در حال آماده‌سازی صفحه…</p>}>
        {account ? <AccountPage view={params.get("view")} role={params.get("role")} /> : concept ? <ConceptPage view={params.get("view")} /> : <HomePage />}
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <AppErrorBoundary><WorkspaceProvider><ChatHistoryProvider><DialogProvider>
      <MobileMenuProvider>
        <AppContent />
      </MobileMenuProvider>
    </DialogProvider></ChatHistoryProvider></WorkspaceProvider></AppErrorBoundary>
  );
}
