import { test, expect, routeForm, combo } from "./fixtures.js";
test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
test("touch mobile can submit a rail quote with searchable locations", async ({ page }) => {
  await page.goto("/"); await routeForm(page);
  await page.getByRole("button", { name: "ریلی", exact: true }).tap();
  await page.locator("#vehicle-type").selectOption("rail-container");
  await combo(page, "cargo-type", "غذایی", "مواد غذایی");
  await page.locator("#cargo-weight").fill("۱۲۰۰۰");
  await page.getByRole("button", { name: "استعلام نرخ حمل", exact: true }).tap();
  await expect(page.locator(".request-summary")).toContainText("ریلی · واگن کانتینری");
  await page.getByRole("button", { name: "مرور مشخصات درخواست" }).tap();
  await expect(page.locator(".review-request")).toContainText("مواد غذایی");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test("touch province selection follows the real SVG shape", async ({ page }) => {
  await page.goto("/#drivers");
  const path = page.locator('path[data-province="fars"]');
  await expect(path).toBeVisible(); await path.scrollIntoViewIfNeeded();
  const point = await path.evaluate((node) => {
    const box = node.getBBox();
    for (let y = .3; y < .8; y += .1) for (let x = .3; x < .8; x += .1) {
      const p = new DOMPoint(box.x + box.width * x, box.y + box.height * y);
      if (node.isPointInFill(p)) { const screen = p.matrixTransform(node.getScreenCTM()); return { x: screen.x, y: screen.y }; }
    }
  });
  expect(point).toBeTruthy();
  await page.touchscreen.tap(point.x, point.y);
  await expect(path).toHaveAttribute("aria-pressed", "true");
  expect(await path.evaluate((node) => getComputedStyle(node).outlineStyle)).toBe("none");
  await expect(page.locator("#province-select")).toHaveValue("fars");
});
