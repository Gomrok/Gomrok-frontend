import { test, expect } from "./fixtures.js";
test("common login validates inputs, clears password and never fabricates authentication", async ({ page }) => {
  await page.goto("/?view=login");
  await page.getByRole("button", { name: "بررسی ورود", exact: true }).click();
  await expect(page.locator("#account-phone")).toHaveAttribute("aria-invalid", "true");
  await page.locator("#account-phone").fill("۰۹۱۲۱۲۳۴۵۶۷");
  await page.locator("#account-password").fill("fake-password-for-test");
  await page.getByRole("button", { name: "بررسی ورود", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("هنوز متصل نشده");
  await expect(page.locator("#account-password")).toHaveValue("");
  const values = await page.evaluate(() => [...Object.values(localStorage), ...Object.values(sessionStorage)].join(" "));
  expect(values).not.toContain("fake-password-for-test");
  await expect(page).toHaveURL(/view=login/);
});
for (const [role, label, field] of [["shipper", "صاحب کالا", "activity"], ["carrier", "شرکت حمل", "companyName"], ["broker", "ترخیص‌کار", "tradeName"], ["driver", "راننده", "vehicleType"]]) {
  test(`separate ${role} signup, guest panel and exit work`, async ({ page }) => {
    await page.goto(`/?view=signup&role=${role}`);
    await expect(page.getByRole("heading", { name: `ثبت‌نام ${label}`, exact: true })).toBeVisible();
    await page.locator("#account-displayName").fill("کاربر آزمایشی");
    await page.locator("#account-phone").fill("09121234567");
    await page.getByRole("button", { name: "مرحلهٔ بعد", exact: false }).click();
    await page.locator(`#account-${field}`).fill("اطلاعات نمونه");
    await page.getByRole("button", { name: "مرحلهٔ بعد", exact: false }).click();
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "بررسی فرم ثبت‌نام" }).click();
    await expect(page.getByRole("status")).toContainText("هنوز متصل نشده");
    await page.getByRole("link", { name: "مشاهدهٔ پنل نمونه" }).click();
    await expect(page.getByRole("heading", { name: `پنل نمونهٔ ${label}`, exact: true })).toBeVisible();
    await page.getByRole("button", { name: "لیگ و پیشرفت", exact: true }).click();
    await expect(page.getByText("سطح معتبر: تعیین نشده")).toBeVisible();
    await page.getByRole("button", { name: "بررسی سناریوی نمونه", exact: true }).click();
    await expect(page.locator(".league-sample")).toContainText("فاقد رتبه معتبر");
    await page.getByRole("link", { name: "خروج از پیش‌نمایش" }).click();
    await expect(page.locator(".hero")).toBeVisible();
  });
}
test("unknown role is handled without accepting prototype keys", async ({ page }) => {
  await page.goto("/?view=panel&role=__proto__");
  await expect(page.getByRole("alert")).toContainText("شناخته نشد");
  await expect(page.locator(".role-choice")).toHaveCount(4);
});
test("trade simulator gates commission, records transitions and leaves actual billing unavailable", async ({ page }) => {
  await page.goto("/?view=panel&role=carrier");
  await page.getByRole("button", { name: "همکاری و کارمزد", exact: true }).click();
  await page.getByRole("button", { name: "ایجاد درخواست نمونه" }).click();
  await expect(page.getByRole("button", { name: "محاسبهٔ سناریوی فرضی" })).toBeDisabled();
  for (const name of ["ثبت پیشنهاد نمونه", "پذیرش پیشنهاد نمونه", "تکمیل حمل نمونه"]) await page.getByRole("button", { name, exact: true }).click();
  await expect(page.locator(".event-list li")).toHaveCount(4);
  await page.getByLabel("مدل فرضی").selectOption("percentage");
  await page.locator('[name="commission"]').fill("۲"); await page.locator('[name="amount"]').fill("۱۰۰۰۰۰");
  await page.locator('[name="assumeVerified"]').check();
  await page.getByRole("button", { name: "محاسبهٔ سناریوی فرضی" }).click();
  await expect(page.locator(".commission-scenario")).toContainText("۲٬۰۰۰ ریال");
  await expect(page.locator(".commission-scenario")).toContainText("هیچ بدهی ثبت نشده");
  await page.getByRole("button", { name: "ثبت اختلاف نمونه", exact: true }).click();
  await expect(page.locator(".trade-current")).toContainText("در اختلاف");
  await expect(page.getByRole("button", { name: "محاسبهٔ سناریوی فرضی" })).toBeDisabled();
});
test("dispute draft validates evidence and does not start a false deadline or send notifications", async ({ page }) => {
  await page.goto("/?view=panel&role=driver");
  await page.getByRole("button", { name: "مرکز اختلاف", exact: true }).click();
  await page.getByRole("button", { name: "مرور درخواست داوری" }).click();
  await expect(page.getByRole("alert")).toContainText("۲۰ نویسه");
  await page.getByRole("textbox", { name: "شرح اختلاف", exact: true }).fill("شرح کاملاً آزمایشی دربارهٔ اختلاف در هماهنگی زمان بارگیری");
  await page.locator('[name="evidence"]').setInputFiles({ name: "sample.pdf", mimeType: "application/pdf", buffer: Buffer.from("sample metadata only") });
  await page.getByRole("button", { name: "مرور درخواست داوری" }).click();
  await expect(page.locator(".dispute-preview")).toContainText("مهلت پاسخ واقعی شروع نشده");
  await page.getByRole("button", { name: "بررسی امکان ارسال به مرکز اختلاف" }).click();
  await expect(page.getByText("سرویس مرکز اختلاف هنوز متصل نشده است.", { exact: false })).toBeVisible();
  const storage = await page.evaluate(() => JSON.stringify({ ...sessionStorage }));
  expect(storage).not.toContain("sample.pdf");
});
test("identity, activation and Adliyar code remain explicitly unconnected", async ({ page }) => {
  await page.goto("/?view=panel&role=carrier");
  await page.getByRole("button", { name: "هویت و فعال‌سازی", exact: true }).click();
  await page.getByRole("button", { name: "بررسی احراز هویت شرکت" }).click();
  await expect(page.getByRole("status")).toContainText("هنوز متصل نشده");
  await page.getByRole("button", { name: "بررسی شرایط فعال‌سازی" }).click();
  await expect(page.getByRole("status")).toContainText("هزینهٔ فعال‌سازی");
  await page.getByRole("button", { name: "بررسی کد نمونه" }).click();
  await expect(page.getByRole("status")).toContainText("یک کد آزمایشی");
  await page.locator('[name="code"]').fill("TEST-ONLY");
  await page.getByRole("button", { name: "بررسی کد نمونه" }).click();
  await expect(page.getByRole("status")).toContainText("عدلیار هنوز متصل نشده");
  await expect(page.locator('[name="code"]')).toHaveValue("");
});
test("guest AI quota survives new-chat and reload; response can refer to a freight request", async ({ page }) => {
  await page.goto("/?view=chat");
  for (let index = 0; index < 3; index++) {
    await page.locator("#chat-prompt").fill(`سؤال نمونه ${index + 1}`);
    await page.getByRole("button", { name: "ارسال سؤال نمونه" }).click();
    await expect(page.locator(".chat-thread .assistant-message").last()).toContainText("این پاسخ نمونه است");
  }
  await expect(page.getByRole("link", { name: "ثبت‌نام برای ادامه", exact: true })).toBeVisible();
  await expect(page.locator("#chat-prompt")).toBeDisabled();
  await page.getByRole("button", { name: "گفت‌وگوی تازه", exact: true }).click();
  await expect(page.locator("#chat-prompt")).toBeDisabled();
  await page.reload(); await expect(page.locator("#chat-prompt")).toBeDisabled();
});
test("AI referral is recorded only on explicit request handoff", async ({ page }) => {
  await page.goto("/?view=chat");
  await page.locator("#chat-prompt").fill("حمل بار نمونه");
  await page.getByRole("button", { name: "ارسال سؤال نمونه" }).click();
  await page.getByRole("button", { name: "شروع درخواست حمل از این گفتگو" }).click();
  await expect(page).toHaveURL(/#quote/);
  await expect(page.locator("#quote")).toContainText("ارجاع از گفت‌وگوی نمونه");
  const referral = await page.evaluate(() => JSON.parse(sessionStorage.getItem("gomrok:ai-referral")));
  expect(referral.source).toBe("ai"); expect(referral.id).toBeTruthy();
  expect(await page.evaluate(() => sessionStorage.getItem("gomrok:draft-request"))).toBeNull();
});
test("linked initial AI question is sent once under React lifecycle", async ({ page }) => {
  await page.goto("/?view=chat&question=" + encodeURIComponent("سؤال آغازین نمونه"));
  await expect(page.locator(".chat-thread .user-message")).toHaveCount(1);
  await expect(page.locator(".chat-thread .assistant-message")).toContainText("این پاسخ نمونه است");
  expect(await page.evaluate(() => sessionStorage.getItem("gomrok:ai:guest-usage"))).toBe("1");
});
