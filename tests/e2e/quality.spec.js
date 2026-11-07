import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures.js";
for (const width of [320, 390, 768, 900, 1024, 1440]) {
  test(`RTL homepage has no horizontal overflow at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/"); await expect(page.locator(".market-status-card")).toHaveCount(4);
    expect(await page.locator("html").getAttribute("dir")).toBe("rtl");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator("#header-product-search")).toBeVisible();
    await expect(page.getByRole("button", { name: "ریلی", exact: true })).toBeVisible();
    if (width < 800) {
      await page.getByRole("button", { name: "باز کردن منو" }).click();
      await expect(page.locator("#mobile-menu")).toBeVisible();
      await page.keyboard.press("Escape"); await expect(page.locator("#mobile-menu")).not.toBeVisible();
      await expect(page.getByRole("button", { name: "باز کردن منو" })).toBeFocused();
      await page.locator("#origin-country").fill("ایران");
      const popup = await page.locator("#origin-country-list").boundingBox();
      const input = await page.locator("#origin-country").boundingBox();
      expect(popup.y).toBeGreaterThan(input.y + input.height - 2);
      await page.locator("#origin-country").press("Escape");
    }
    await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); });
    for (const section of ["#customs", "#drivers", "#articles"]) await page.locator(section).scrollIntoViewIfNeeded();
    await expect(page.locator(".province-path")).toHaveCount(31);
    await page.locator("#drivers").scrollIntoViewIfNeeded();
    await page.locator("#drivers").screenshot({ path: testInfo.outputPath(`drivers-${width}.png`), style: ".site-header, .skip-link { visibility: hidden !important; }" });
    await page.locator("#market").screenshot({ path: testInfo.outputPath(`market-${width}.png`), style: ".site-header, .skip-link { visibility: hidden !important; }" });
    await page.evaluate(async () => {
      await Promise.all([...document.images].map((image) => { image.loading = "eager"; return image.decode().catch(() => {}); }));
      window.scrollTo({ top: 0, behavior: "instant" });
    });
    await page.screenshot({ path: testInfo.outputPath(`homepage-${width}.png`), fullPage: true });
    await page.screenshot({ path: testInfo.outputPath(`header-${width}.png`) });
  });
}
test("mobile account, panel, chat and request page fit the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const url of ["/?view=signup", "/?view=login", "/?view=signup&role=carrier", "/?view=panel&role=driver", "/?view=chat", "/?view=quote"]) {
    await page.goto(url); await expect(page.locator("main")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), url).toBe(true);
  }
});
test("home and opened combobox meet automated WCAG checks", async ({ page }) => {
  await page.goto("/"); await expect(page.locator(".market-status-card")).toHaveCount(4);
  await page.locator("#origin-country").fill("ایر");
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(results.violations.map((violation) => ({ id: violation.id, nodes: violation.nodes.map((node) => node.target) }))).toEqual([]);
});
test("signup and guest panel meet automated accessibility checks", async ({ page }) => {
  for (const url of ["/?view=signup&role=carrier", "/?view=panel&role=shipper"]) {
    await page.goto(url); await expect(page.locator("main")).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(results.violations.map((violation) => ({ id: violation.id, nodes: violation.nodes.map((node) => node.target) })), url).toEqual([]);
  }
});
