import { test as base, expect } from "@playwright/test";
export const test = base.extend({
  page: async ({ page }, use) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    // No external font service is needed; keep external requests blocked if a link regresses.
    await page.route("https://fonts.googleapis.com/**", (route) => route.fulfill({ contentType: "text/css", body: "" }));
    await use(page);
    expect(errors, "No JavaScript or console errors").toEqual([]);
  },
});
export { expect };
export async function combo(page, id, query, label) {
  const input = page.locator(`#${id}`);
  await input.fill(query);
  await page.locator(`#${id}-list`).getByRole("option").filter({ hasText: label }).first().click();
  await expect(input).toHaveValue(label);
}
export async function routeForm(page) {
  await combo(page, "origin-country", "ایر", "ایران");
  await combo(page, "origin-city", "تهر", "تهران");
  await combo(page, "destination-country", "ترک", "ترکیه");
  await combo(page, "destination-city", "استان", "استانبول");
  await page.locator("#transport-scope").selectOption("transit");
}
