# فهرست فایل‌های تغییرکرده

مقایسهٔ محتوای فایل‌ها با ZIP اصلی؛ dist تولیدشده و node_modules در شمارش سورس نیستند.

SHA-256 آرشیو مبنا: `F15874AB0A506946C53F9D7C4FA7CEC5F6D9C3B5606A10DA53F2E02CF341A706`

فایل‌های افزوده: 61؛ اصلاح‌شده: 19؛ حذف‌شده: 0.

| فایل | وضعیت | خلاصهٔ تغییر |
| --- | --- | --- |
| `.env.example` | افزوده | نمونهٔ سهمیهٔ مهمان قابل تنظیم، بدون کلید محرمانه |
| `.gitignore` | اصلاح‌شده | نادیده گرفتن وابستگی‌ها، Build، کش و پوشهٔ کاری پروژه |
| `DELIVERY_NOTES.md` | افزوده | امکانات تکمیل‌شده، نتایج تست و تصمیم‌های باقی‌ماندهٔ بک‌اند |
| `docs/CHANGED_FILES.md` | افزوده | فهرست خودکار مقایسهٔ فایل‌ها با ZIP اصلی |
| `docs/INTEGRATION_CONTRACTS.md` | افزوده | مدل‌ها، حریم خصوصی و قرارداد نقاط اتصال آینده |
| `docs/REQUIREMENTS.md` | افزوده | تطبیق تمام بندهای Markdown با کد و سناریوهای بررسی |
| `index.html` | اصلاح‌شده | حذف وابستگی فونت خارجی و حفظ سند فارسی RTL |
| `package-lock.json` | اصلاح‌شده | ابزارهای تست توسعه و اسکریپت‌های اجرا؛ وابستگی runtime تازه اضافه نشده |
| `package.json` | اصلاح‌شده | ابزارهای تست توسعه و اسکریپت‌های اجرا؛ وابستگی runtime تازه اضافه نشده |
| `playwright.config.js` | افزوده | تست با مرورگر نصب‌شده و خروجی/پروفایل/کش در پروژه |
| `public/assets/fonts/OFL.txt` | افزوده | مجوز OFL فونت همراه پروژه |
| `public/assets/sources/README.md` | اصلاح‌شده | انتساب و منبع/هش فونت و دارایی‌های حفظ‌شده |
| `public/assets/sources/vazirmatn-font.json` | افزوده | انتساب و منبع/هش فونت و دارایی‌های حفظ‌شده |
| `README.md` | اصلاح‌شده | راهنمای اجرا، مسیرها و شرح وضعیت فرانت‌اند |
| `run-local.ps1` | افزوده | اجرای محلی، Build و تست با ذخیره‌سازی محدود به پروژه |
| `scripts/serve-built.mjs` | افزوده | سرور loopback خروجی آماده بدون نیاز به node_modules |
| `src/App.jsx` | اصلاح‌شده | مسیریابی داخلی و ارائه‌دهندگان حالت مشترک پنل و تاریخچهٔ چت |
| `src/assets/fonts/vazirmatn-arabic-wght-normal.woff2` | افزوده | فونت محلی Vazirmatn و CSS زیرمجموعه‌ها |
| `src/assets/fonts/vazirmatn-latin-ext-wght-normal.woff2` | افزوده | فونت محلی Vazirmatn و CSS زیرمجموعه‌ها |
| `src/assets/fonts/vazirmatn-latin-wght-normal.woff2` | افزوده | فونت محلی Vazirmatn و CSS زیرمجموعه‌ها |
| `src/assets/fonts/vazirmatn.css` | افزوده | فونت محلی Vazirmatn و CSS زیرمجموعه‌ها |
| `src/assets/icons/bell.svg` | افزوده | آیکن SVG محلی موردنیاز رابط جدید |
| `src/assets/icons/train.svg` | افزوده | آیکن SVG محلی موردنیاز رابط جدید |
| `src/assets/icons/user.svg` | افزوده | آیکن SVG محلی موردنیاز رابط جدید |
| `src/components/AppErrorBoundary.jsx` | افزوده | بازیابی قابل فهم هنگام خطای رندر |
| `src/components/Combobox.jsx` | افزوده | پیشنهاد جستجودار با کیبورد، لمس و حالات خطا/بارگذاری |
| `src/components/MobileMenu.jsx` | اصلاح‌شده | منوی هماهنگ با ترتیب بخش‌ها و مدیریت فوکوس |
| `src/config/platform.js` | افزوده | پیکربندی نقش‌ها، ترتیب ترخیص/AI، سهمیه و سیاست‌های آینده |
| `src/contexts/ChatHistoryContext.jsx` | افزوده | تاریخچهٔ حافظه‌ای، انتخاب/حذف و نگه‌داری اختیاری در همان تب |
| `src/contexts/WorkspaceContext.jsx` | افزوده | حالت مشترک سناریوها و ذخیرهٔ بدون پرونده/پروفایل حساس |
| `src/data/logistics.js` | افزوده | دادهٔ محلی کشور/شهر، بار، وسایل، دامنه و شیوهٔ حمل |
| `src/domain/accounts.js` | افزوده | اعتبارسنجی حساب و هدایت پس از هویت معتبر |
| `src/domain/disputes.js` | افزوده | مدل پیش‌نویس و مهلت واقعی فقط پس از ابلاغ معتبر |
| `src/domain/leagues.js` | افزوده | معیارهای نقش‌محور، سطوح قابل تنظیم و اطلاعات ممیزی |
| `src/domain/quote.js` | افزوده | اعتبارسنجی مسیر، جابه‌جایی، ریلی، دامنه و منشأ انتخاب بار |
| `src/domain/trade.js` | افزوده | ترتیب رویدادها، شواهد معتبر و محاسبهٔ فرضی کارمزد با حساب صحیح |
| `src/domain/workspace.js` | افزوده | درخواست، پیشنهاد، همکاری دوطرفه، اعلان و گردش اختلاف تمرینی |
| `src/features/account/AccountForm.jsx` | افزوده | ورود مشترک و ثبت‌نام سه‌مرحله‌ای با اعتبارسنجی/مرور |
| `src/features/ai/ChatConversation.jsx` | اصلاح‌شده | سهمیه، تاریخچه، ارجاع درخواست و لغو پاسخ در حال اجرا |
| `src/features/ai/ChatWidgets.jsx` | اصلاح‌شده | نمایش پیام‌های نمونه و فرم ارسال دسترس‌پذیر چت |
| `src/features/catalog/ProductSearch.jsx` | افزوده | جستجوی نام/HS، جزئیات نمونه و انتقال به ترخیص |
| `src/features/concepts/ConceptForms.jsx` | اصلاح‌شده | مرور/ویرایش همان پیش‌نویس حمل و اعتبارسنجی ترخیص |
| `src/features/drivers/DriversSection.jsx` | اصلاح‌شده | نقشه، فوکوس شکل استان و هماهنگی شمارنده/فیلتر/فهرست |
| `src/features/drivers/DriversWidgets.jsx` | اصلاح‌شده | نقشه، فوکوس شکل استان و هماهنگی شمارنده/فیلتر/فهرست |
| `src/features/market/MarketDashboard.jsx` | افزوده | چهار وضعیت بازار، فیلتر، روند، جدول و حالات داده |
| `src/features/panel/DisputesPanel.jsx` | افزوده | مرور مدارک، دو نمای طرفین، پاسخ و ساعت تمرینی ۴۸ ساعت |
| `src/features/panel/LeagueCard.jsx` | افزوده | ویرایش امتیاز، وزن، سطح، آستانه و سابقهٔ محاسبه |
| `src/features/panel/RolePanel.jsx` | افزوده | چهار نمای نقش و تب‌های متصل پنل بدون احراز هویت ساختگی |
| `src/features/panel/TradePanel.jsx` | افزوده | شبیه‌ساز مستقل و فرم کارمزد صریحاً فرضی |
| `src/features/panel/VerificationPanel.jsx` | افزوده | رابط آیندهٔ احراز شرکت، فعال‌سازی و کد عدلیار |
| `src/features/quote/CargoAssistant.jsx` | افزوده | راهنمای محلی بار و پذیرش صریح پیشنهاد |
| `src/features/quote/QuoteForm.jsx` | اصلاح‌شده | فرم چهارشیوه، دامنه، مسیر خالی، combobox و جزئیات بار |
| `src/features/workspace/ConnectionsPanel.jsx` | افزوده | تأیید دوطرفهٔ تکمیل/تسویه، لغو و اختلاف مرتبط |
| `src/features/workspace/NotificationsPanel.jsx` | افزوده | اعلان‌های داخلی نقش، خوانده‌نشده و پیوند به مورد مرتبط |
| `src/features/workspace/OffersPanel.jsx` | افزوده | ثبت، پس‌گرفتن و پذیرش پیشنهاد مرتبط با درخواست |
| `src/features/workspace/ProfilePanel.jsx` | افزوده | اعتبارسنجی پروفایل حافظه‌ای، ترجیحات و پاک‌سازی سناریو |
| `src/features/workspace/RequestsPanel.jsx` | افزوده | فهرست/فیلتر پیش‌نویس، ویرایش و انتشار تمرینی |
| `src/main.jsx` | اصلاح‌شده | بارگذاری سبک‌های تکمیلی و فونت محلی |
| `src/pages/AccountPage.jsx` | افزوده | صفحه‌های ورود، چهار ثبت‌نام و پنل‌های نقش‌محور |
| `src/pages/ConceptPage.jsx` | اصلاح‌شده | خلاصهٔ بدون پیش‌فرض ساختگی و حفظ دامنه/ریلی/ارجاع |
| `src/pages/HomePage.jsx` | اصلاح‌شده | ترتیب مشترک بخش‌ها و پیمایش لنگری هماهنگ با فونت محلی |
| `src/platform.css` | افزوده | ظاهر و حالات کنترل‌ها، پنل، چت، بازار و نمایش موبایل |
| `src/sections/ConceptMarkup.jsx` | اصلاح‌شده | رابط چت با تاریخچه و مراحل حمل/ترخیص |
| `src/sections/HomeMarkup.jsx` | اصلاح‌شده | جستجوی هدر، منوهای مرتب و حفظ برند/بخش‌های اصلی |
| `src/services/ai.js` | افزوده | adapter پاسخ نمونهٔ زمینه‌مند، بدون فراخوانی مدل زنده |
| `src/services/cargo.js` | افزوده | سرویس پیشنهاد محلی قابل جایگزینی و قابل لغو |
| `src/services/catalog.js` | افزوده | کاتالوگ محلی شش کالای نمونه با جستجو و قرارداد adapter |
| `src/services/drivers.js` | افزوده | منبع یگانهٔ فهرست و شمارنده‌های رانندگان نمونه |
| `src/services/integrations.js` | افزوده | قرارداد سرویس‌های آینده با خطای روشن NOT_CONFIGURED |
| `src/services/market.js` | افزوده | دادهٔ نمونهٔ نسخه‌دار بازه‌ها و قرارداد بازار |
| `src/services/session.js` | افزوده | ذخیرهٔ موقت ایمن از خطا و شمارش سهمیهٔ مهمان |
| `src/utils/format.js` | افزوده | نرمال‌سازی فارسی/عربی، ارقام و شناسه‌ها |
| `tests/e2e/accounts.spec.js` | افزوده | آزمون تعاملات، خطاهای کنسول، کیبورد، لمس و دسترس‌پذیری |
| `tests/e2e/fixtures.js` | افزوده | آزمون تعاملات، خطاهای کنسول، کیبورد، لمس و دسترس‌پذیری |
| `tests/e2e/home.spec.js` | افزوده | آزمون تعاملات، خطاهای کنسول، کیبورد، لمس و دسترس‌پذیری |
| `tests/e2e/mobile.spec.js` | افزوده | آزمون تعاملات، خطاهای کنسول، کیبورد، لمس و دسترس‌پذیری |
| `tests/e2e/quality.spec.js` | افزوده | آزمون تعاملات، خطاهای کنسول، کیبورد، لمس و دسترس‌پذیری |
| `tests/e2e/workspace.spec.js` | افزوده | آزمون گردش‌های مشترک نقش‌ها، تاریخچه، اختلاف، لیگ و موبایل |
| `tests/unit/platform.test.js` | افزوده | آزمون قواعد مدل، سهمیه، حریم خصوصی و داده‌های نمونه |
| `tests/unit/workspace.test.js` | افزوده | آزمون قواعد مدل، سهمیه، حریم خصوصی و داده‌های نمونه |
