import { makeId } from "../utils/format.js";
export const sampleAiAdapter = {
  async reply({ text, requestContext, signal }) {
    await new Promise((resolve, reject) => {
      const abort = () => { clearTimeout(timer); reject(new DOMException("Aborted", "AbortError")); };
      const timer = setTimeout(() => { signal?.removeEventListener("abort", abort); resolve(); }, 350);
      if (signal?.aborted) abort(); else signal?.addEventListener("abort", abort, { once: true });
    });
    const topic = /ریل|واگن/.test(text) ? "برای بررسی مسیر ریلی در همین سایت، شیوهٔ «ریلی» را انتخاب کنید؛ سپس کشورها، شهرها و نوع واگن را مشخص و درخواست را مرور کنید." : /کد|تعرفه|HS/i.test(text) ? "برای آزمون معرفی کالا، نام یا کد HS را در جستجوی بالای صفحه بنویسید. کاتالوگ این نسخه نمونه است و مبنای تعیین تعرفه یا اظهار رسمی نیست." : /هزینه|نرخ|قیمت/.test(text) ? "این فرانت‌اند نرخ حمل یا حقوق ورودی واقعی تولید نمی‌کند. مسیر، شیوهٔ حمل، وزن و نوع کالا را برای مرور درخواست کامل کنید." : "برای ادامه، مشخصات کالا، مبدأ، مقصد و شیوهٔ حمل را در درخواست خود ثبت کنید. بررسی مقررات به منبع معتبر و بررسی تخصصی نیاز دارد.";
    return { id: makeId("answer"), kind: "sample", text: `این پاسخ نمونه است. ${topic} ${requestContext?.referralId ? "زمینهٔ درخواست قبلی برای اتصال آینده در دسترس است." : ""}`, context: { requestId: requestContext?.requestId || null, inputLength: text.length } };
  },
};
export function createAiService(adapter = sampleAiAdapter) { return { reply: (message) => adapter.reply(message) }; }
