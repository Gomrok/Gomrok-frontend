import AxeBuilder from "@axe-core/playwright";
import { test, expect, combo, routeForm } from "./fixtures.js";

const visibleView = (page) => page.locator(".workspace-view:not([hidden])");
async function createDraft(page, routeName = "مسیر سناریوی کامل") {
  await page.goto("/"); await routeForm(page);
  await page.locator("#route-name").fill(routeName);
  await combo(page, "cargo-type", "صنعتی", "قطعات صنعتی");
  await page.getByRole("button", { name: "استعلام نرخ حمل", exact: true }).click();
  await page.getByRole("button", { name: "مرور مشخصات درخواست", exact: true }).click();
  await page.getByRole("button", { name: "ذخیرهٔ پیش‌نویس و دیدن پنل نمونه" }).click();
  await expect(page.locator(".request-draft-card")).toHaveCount(1);
}
async function role(page, value) { await page.locator("#panel-role-preview").selectOption(value); await expect(page).toHaveURL(new RegExp("role=" + value)); }
async function tab(page, label) { await page.getByRole("navigation", { name: "بخش‌های پنل نمونه" }).getByRole("button", { name: label, exact: true }).click(); }

test("a request, offer, two-party completion and settlement form one connected frontend journey", async ({ page }, testInfo) => {
  await createDraft(page);
  await page.getByRole("button", { name: "انتشار در سناریوی نمونه" }).click();
  await tab(page, "پیشنهادهای حمل"); await role(page, "driver");
  await page.getByRole("button", { name: "نوشتن پیشنهاد نمونه" }).click();
  const offer = page.locator(".workspace-offer-form");
  await offer.locator('[name="amount"]').fill("0"); await offer.getByRole("button", { name: "ثبت پیشنهاد نمونه", exact: true }).click();
  await expect(visibleView(page).getByRole("alert")).toContainText("صحیح مثبت");
  await offer.locator('[name="amount"]').fill("۲۵۰۰۰۰"); await offer.locator('[name="message"]').fill("شرایط آزمایشی حمل");
  await offer.getByRole("button", { name: "ثبت پیشنهاد نمونه", exact: true }).click();
  await expect(visibleView(page).locator(".offer-list")).toContainText("۲۵۰٬۰۰۰");
  await role(page, "shipper"); await page.getByRole("button", { name: "پذیرش پیشنهاد نمونه", exact: true }).click();
  await page.getByRole("button", { name: "مشاهدهٔ همکاری", exact: true }).click();
  const connection = page.locator(".workspace-connection");
  await expect(connection).toHaveCount(1); await expect(connection.locator(".workspace-card-top")).toContainText("پذیرفته شده");
  await connection.getByRole("button", { name: "تأیید تکمیل نمونه از این نقش" }).click();
  await expect(connection.getByRole("button", { name: "تأیید این نقش ثبت شده است" })).toBeDisabled();
  await connection.getByRole("link", { name: "نمای طرف مقابل", exact: true }).click();
  await connection.getByRole("button", { name: "تأیید تکمیل نمونه از این نقش" }).click();
  await expect(connection.locator(".workspace-card-top")).toContainText("انجام موفق");
  await connection.getByRole("button", { name: "تأیید تسویهٔ نمونه از این نقش" }).click();
  await connection.getByRole("link", { name: "نمای طرف مقابل", exact: true }).click();
  await connection.getByRole("button", { name: "تأیید تسویهٔ نمونه از این نقش" }).click();
  await expect(connection.locator(".workspace-card-top")).toContainText("تسویه شده");
  const commission = connection.locator(".commission-scenario");
  await commission.getByLabel("مدل فرضی").selectOption("percentage");
  await commission.locator('[name="commission"]').fill("۲"); await commission.locator('[name="amount"]').fill("۱۰۰۰۰۰");
  await commission.locator('[name="assumeVerified"]').check();
  await commission.getByRole("button", { name: "محاسبهٔ سناریوی فرضی" }).click();
  await expect(commission.getByRole("status")).toContainText("۲٬۰۰۰ ریال");
  await commission.locator('[name="commission"]').fill("3"); await expect(commission.getByRole("status")).toHaveCount(0);
  await page.reload(); await expect(connection.locator(".workspace-card-top")).toContainText("تسویه شده");
  const data = await page.evaluate(() => JSON.parse(sessionStorage.getItem("gomrok:workspace-v2")));
  expect(data.connections[0].events.filter((entry) => entry.type.endsWith("_ack"))).toHaveLength(4);
  expect(data.connections[0].events.every((entry) => entry.source !== "backend")).toBe(true);
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo({ top: 0, behavior: "instant" }); });
  await page.screenshot({ path: testInfo.outputPath("connected-panel-desktop.png"), fullPage: true });
  await connection.getByRole("button", { name: "درخواست داوری برای این همکاری" }).click();
  await expect(page.locator('.dispute-form [name="connectionId"]')).not.toHaveValue("");
  await page.locator('.dispute-form [name="description"]').fill("شرح نمونه برای آزمون اختلاف مرتبط با همین همکاری تسویه‌شده");
  await page.getByRole("button", { name: "مرور درخواست داوری" }).click();
  await page.getByRole("button", { name: "ثبت در گردش تمرینی" }).click();
  await tab(page, "همکاری و کارمزد"); await expect(connection.locator(".workspace-card-top")).toContainText("در اختلاف");
  await expect(connection.getByRole("button", { name: "محاسبهٔ سناریوی فرضی" })).toBeDisabled();
  expect(await page.evaluate(() => { const ids = [...document.querySelectorAll("[id]")].map((node) => node.id); return ids.length === new Set(ids).size; })).toBe(true);
  await tab(page, "اعلان‌ها"); await page.getByRole("button", { name: "همه خوانده شدند", exact: true }).click();
  await page.getByRole("button", { name: "خوانده‌نشده", exact: true }).click();
  await expect(visibleView(page)).toContainText("اعلانی برای این فیلتر نیست");
});

test("editing and saving a draft updates the same request and preserves its metadata", async ({ page }) => {
  await createDraft(page, "نسخهٔ اول مسیر");
  await page.getByRole("link", { name: "مرور و اصلاح پیش‌نویس" }).click();
  await page.locator("#request-note").fill("یادداشت نسخهٔ دوم");
  await page.getByRole("link", { name: "اصلاح مسیر و شیوهٔ حمل" }).click();
  await expect(page.locator("#origin-city")).toHaveValue("تهران");
  await page.locator("#route-name").fill("نسخهٔ دوم مسیر");
  await page.getByRole("button", { name: "استعلام نرخ حمل", exact: true }).click();
  await page.locator("#request-note").fill("یادداشت نسخهٔ دوم");
  await page.getByRole("button", { name: "مرور مشخصات درخواست", exact: true }).click();
  await page.getByRole("button", { name: "ذخیرهٔ پیش‌نویس و دیدن پنل نمونه" }).click();
  await expect(page.locator(".request-draft-card")).toHaveCount(1);
  await expect(page.locator(".request-draft-card")).toContainText("نسخهٔ دوم مسیر");
  await page.reload(); await expect(page.locator(".request-draft-card")).toHaveCount(1);
});

test("dispute review, role handoff, response and 48-hour expiry stay in memory and impose no penalty", async ({ page }, testInfo) => {
  await page.goto("/?view=panel&role=shipper&tab=disputes");
  const form = page.locator(".dispute-form");
  const description = "شرح آزمایشی اختلاف دربارهٔ زمان آماده‌سازی کالای نمونه";
  await form.locator('[name="description"]').fill(description);
  await form.locator('[name="evidence"]').setInputFiles({ name: "private-test.pdf", mimeType: "application/pdf", buffer: Buffer.from("never read or uploaded") });
  await form.getByRole("button", { name: "مرور درخواست داوری" }).click();
  await form.locator('[name="description"]').fill(description + " و هماهنگی دو طرف");
  await form.getByRole("button", { name: "مرور درخواست داوری" }).click();
  await expect(page.locator(".workspace-case")).toHaveCount(1);
  await page.getByRole("button", { name: "ثبت در گردش تمرینی", exact: true }).click();
  await page.locator(".workspace-case").getByRole("link", { name: "نمای طرف مقابل پرونده" }).click();
  await expect(page.locator(".workspace-case")).toHaveCount(1);
  await page.getByRole("button", { name: "شبیه‌سازی مشاهدهٔ ابلاغ" }).click();
  await expect(page.locator(".workflow-deadline")).toContainText("۴۸ ساعت");
  await page.locator('.case-reply-form [name="reply"]').fill("پاسخ آزمایشی طرف مقابل برای بررسی اختلاف");
  await page.getByRole("button", { name: "ثبت پاسخ تمرینی", exact: true }).click();
  await expect(page.locator(".workspace-case .demo-badge")).toContainText("آمادهٔ بررسی");
  await form.locator('[name="description"]').fill("پروندهٔ دوم نمونه برای آزمون پایان مهلت پاسخ و مسیر بررسی");
  await form.getByRole("button", { name: "مرور درخواست داوری" }).click();
  const latest = page.locator(".workspace-case").first();
  await latest.getByRole("button", { name: "ثبت در گردش تمرینی" }).click();
  await latest.getByRole("link", { name: "نمای طرف مقابل پرونده" }).click();
  await latest.getByRole("button", { name: "شبیه‌سازی مشاهدهٔ ابلاغ" }).click();
  await page.getByLabel("ساعت سناریو").selectOption("49");
  await expect(latest.locator(".demo-badge")).toContainText("آمادهٔ بررسی");
  await expect(latest).toContainText("مجازات خودکار ندارد");
  await expect(page.locator(".case-reply-form")).toHaveCount(0);
  const storage = await page.evaluate(() => JSON.stringify({ ...sessionStorage }));
  expect(storage).not.toContain("private-test.pdf"); expect(storage).not.toContain(description);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo({ top: 0, behavior: "instant" }); });
  await page.screenshot({ path: testInfo.outputPath("dispute-panel-mobile.png"), fullPage: true });
  await page.reload(); await expect(page.locator(".workspace-case")).toHaveCount(0);
});

test("league weights, extra levels, invalid inputs and audit history work for each role", async ({ page }, testInfo) => {
  await page.goto("/?view=panel&role=carrier&tab=league");
  await page.getByRole("button", { name: "بررسی سناریوی نمونه", exact: true }).click();
  await page.getByRole("button", { name: "محاسبهٔ امتیاز نمونه" }).click();
  await expect(page.locator(".league-result")).toContainText("نقره‌ای");
  const scores = page.locator(".league-metrics-grid").getByLabel("امتیاز فرضی", { exact: true });
  await scores.first().fill("101"); await page.getByRole("button", { name: "محاسبهٔ امتیاز نمونه" }).click();
  await expect(visibleView(page).getByRole("alert")).toContainText("بین صفر تا ۱۰۰");
  await scores.first().fill("90");
  await page.getByRole("button", { name: "افزودن سطح نمونه" }).click();
  const last = page.locator(".league-level-editor > div").last();
  await last.locator("input").first().fill("پلاتینی"); await last.getByLabel("آستانهٔ فرضی").fill("95");
  await page.getByRole("button", { name: "محاسبهٔ امتیاز نمونه" }).click();
  await expect(page.locator(".league-result")).toContainText("سطح معتبر اعطا نشده");
  await page.getByText("سابقهٔ محاسبه و ممیزی نمونه", { exact: true }).click();
  await expect(page.locator(".league-audit article")).toHaveCount(2);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo({ top: 0, behavior: "instant" }); });
  await page.screenshot({ path: testInfo.outputPath("league-editor-mobile.png"), fullPage: true });
  await role(page, "driver"); await page.getByRole("button", { name: "بررسی سناریوی نمونه", exact: true }).click();
  await expect(page.locator(".league-metrics-grid").getByLabel("امتیاز فرضی", { exact: true }).first()).toHaveValue("72");
  await expect(page.locator(".metric-criteria")).toContainText("خوش‌قولی");
});

test("profile preferences change the badge; reset clears scenarios without resetting AI quota", async ({ page }) => {
  await page.goto("/?view=chat"); await page.locator("#chat-prompt").fill("سؤال نمونه برای سهمیه");
  await page.getByRole("button", { name: "ارسال سؤال نمونه" }).click();
  await expect(page.locator(".assistant-message")).toContainText("این پاسخ نمونه است");
  await createDraft(page); await page.getByRole("button", { name: "انتشار در سناریوی نمونه" }).click();
  await role(page, "driver"); await tab(page, "پروفایل");
  await expect(page.locator(".notification-count")).toHaveCount(1);
  const profile = page.locator(".workspace-profile-form");
  await profile.getByRole("button", { name: "ذخیرهٔ پروفایل تمرینی" }).click();
  await expect(profile.locator('[name="displayName"]')).toHaveAttribute("aria-invalid", "true");
  await profile.locator('[name="displayName"]').fill("نام نمایشی نمونه"); await profile.locator('[name="phone"]').fill("09121234567");
  await profile.locator('[name="inAppNotifications"]').uncheck();
  await profile.getByRole("button", { name: "ذخیرهٔ پروفایل تمرینی" }).click();
  await expect(page.locator(".notification-count")).toHaveCount(0);
  expect(await page.evaluate(() => JSON.stringify({ ...sessionStorage }))).not.toContain("09121234567");
  await page.getByRole("button", { name: "پاک‌کردن سناریوهای این تب" }).click();
  await page.getByRole("button", { name: "تأیید پاک‌سازی سناریوها" }).click();
  await expect(visibleView(page).getByRole("status")).toContainText("پاک شدند");
  await tab(page, "اعلان‌ها"); await expect(page.locator(".notification-list li")).toHaveCount(0);
  expect(await page.evaluate(() => sessionStorage.getItem("gomrok:ai:guest-usage"))).toBe("1");
  await role(page, "shipper"); await tab(page, "پیش‌نویس درخواست‌ها"); await expect(page.locator(".request-draft-card")).toHaveCount(0);
});

test("chat histories are selectable and removable, stored only by opt-in, and share one quota", async ({ page }) => {
  await page.goto("/?view=chat");
  await page.locator("#chat-prompt").fill("پرسش اول تاریخچه"); await page.getByRole("button", { name: "ارسال سؤال نمونه" }).click();
  await expect(page.locator(".assistant-message")).toContainText("این پاسخ نمونه است");
  expect(await page.evaluate(() => sessionStorage.getItem("gomrok:chat-history"))).toBeNull();
  await page.getByRole("button", { name: "گفت‌وگوی تازه", exact: true }).click();
  await page.locator("#chat-prompt").fill("پرسش دوم تاریخچه"); await page.getByRole("button", { name: "ارسال سؤال نمونه" }).click();
  await expect(page.locator(".assistant-message")).toContainText("این پاسخ نمونه است");
  await page.getByRole("button", { name: "پرسش اول تاریخچه", exact: true }).click();
  await expect(page.locator(".user-message")).toContainText("پرسش اول تاریخچه");
  await page.getByRole("checkbox", { name: "نگه‌داری موقت تاریخچه در همین تب" }).check();
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem("gomrok:chat-history"))).toContain("پرسش اول تاریخچه");
  await page.reload(); await expect(page.locator(".history-item")).toHaveCount(2);
  await page.getByRole("button", { name: "حذف گفتگوی پرسش اول تاریخچه", exact: true }).click();
  await expect(page.locator(".history-item")).toHaveCount(1);
  await page.getByRole("checkbox", { name: "نگه‌داری موقت تاریخچه در همین تب" }).uncheck();
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem("gomrok:chat-history"))).toBeNull();
  await page.reload(); await expect(page.locator(".user-message")).toHaveCount(0);
  expect(await page.evaluate(() => sessionStorage.getItem("gomrok:ai:guest-usage"))).toBe("2");
});

test("leaving a pending chat cancels the placeholder when the conversation is revisited", async ({ page }) => {
  await page.clock.install();
  await page.goto("/?view=chat");
  await page.locator("#chat-prompt").fill("سؤال در حال پردازش نمونه");
  await page.getByRole("button", { name: "ارسال سؤال نمونه" }).click();
  await page.getByRole("link", { name: "بازگشت به صفحه اصلی", exact: true }).click();
  await page.locator('a[href="?view=chat"]').first().click();
  await expect(page.locator(".assistant-message")).toContainText("لغو شد");
  await expect(page.locator("#chat-prompt")).toBeEnabled();
});

test("customs precedes AI and the cargo helper requires explicit sample selection", async ({ page }) => {
  await page.goto("/");
  expect(await page.evaluate(() => Boolean(document.querySelector("#customs").compareDocumentPosition(document.querySelector("#ai")) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  await page.getByRole("button", { name: "راهنمای انتخاب نوع بار", exact: false }).click();
  await page.getByLabel("شرح کوتاه کالا", { exact: true }).fill("شرح نامشخص محموله");
  await page.getByRole("button", { name: "بررسی پیشنهاد محلی", exact: true }).click();
  await expect(page.locator("#cargo-assistant-panel")).toContainText("پیشنهادی از فهرست محلی مشخص نشد");
  await page.getByLabel("شرح کوتاه کالا", { exact: true }).fill("قطعات ماشین آلات");
  await page.getByRole("button", { name: "بررسی پیشنهاد محلی", exact: true }).click();
  await expect(page.locator("#cargo-type")).toHaveValue("");
  await page.getByRole("button", { name: "استفاده از این پیشنهاد", exact: true }).click();
  await expect(page.locator("#cargo-type")).toHaveValue("قطعات صنعتی");
  await routeForm(page); await page.getByRole("button", { name: "استعلام نرخ حمل", exact: true }).click();
  const source = await page.evaluate(() => Object.fromEntries(new URLSearchParams(sessionStorage.getItem("gomrok:preview:quote"))));
  expect(source.cargoSelectionSource).toBe("local-sample"); expect(source.cargoSuggestionId).toBeTruthy();
});

test("expanded panel tabs, league editor and signup review pass accessibility and mobile layout checks", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?view=panel&role=carrier&tab=league");
  await page.getByRole("button", { name: "بررسی سناریوی نمونه", exact: true }).click();
  for (const label of ["لیگ و پیشرفت", "مرکز اختلاف", "پروفایل", "هویت و فعال‌سازی", "اعلان‌ها"]) {
    await tab(page, label);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), label).toBe(true);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(results.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) })), label).toEqual([]);
  }
  await page.goto("/?view=signup&role=driver");
  await page.locator("#account-displayName").fill("کاربر نمونه"); await page.locator("#account-phone").fill("09121234567");
  await page.getByRole("button", { name: "مرحلهٔ بعد", exact: false }).click(); await page.locator("#account-vehicleType").fill("کامیون نمونه");
  await page.getByRole("button", { name: "مرحلهٔ بعد", exact: false }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze(); expect(results.violations.map(({ id }) => id)).toEqual([]);
});

test("panel editors and chat remain usable at narrow phone and tablet widths", async ({ page }, testInfo) => {
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/?view=panel&role=shipper&tab=league");
    await page.getByRole("button", { name: "بررسی سناریوی نمونه", exact: true }).click();
    for (const label of ["لیگ و پیشرفت", "پروفایل", "مرکز اختلاف"]) {
      await tab(page, label);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}: ${label}`).toBe(true);
    }
    await page.goto("/?view=chat");
    await page.locator("#chat-prompt").fill("نمونهٔ پرسش برای آزمون نمایش گفتگو در صفحهٔ کوچک");
    await page.getByRole("button", { name: "ارسال سؤال نمونه" }).click();
    await expect(page.locator(".assistant-message")).toContainText("این پاسخ نمونه است");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}: chat`).toBe(true);
    if (width === 320) {
      await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo({ top: 0, behavior: "instant" }); });
      await page.screenshot({ path: testInfo.outputPath("chat-mobile-320.png"), fullPage: true });
    }
  }
});
