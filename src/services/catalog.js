import { normalizeSearch } from "../utils/format.js";
export const SAMPLE_PRODUCTS = [
  { value: "wheat", label: "گندم", hsCode: "1001", cargoType: "food" },
  { value: "coffee", label: "قهوه", hsCode: "0901", cargoType: "food" },
  { value: "computer", label: "رایانه و تجهیزات پردازش", hsCode: "8471", cargoType: "industrial" },
  { value: "machinery", label: "ماشین‌آلات با کاربرد ویژه", hsCode: "8479", cargoType: "industrial" },
  { value: "truck", label: "خودرو حمل کالا", hsCode: "8704", cargoType: "industrial" },
  { value: "furniture", label: "مبلمان", hsCode: "9403", cargoType: "general" },
].map((item) => ({ ...item, description: `کد نمونه HS ${item.hsCode}`, searchText: `${item.label} ${item.hsCode}` }));
export const localCatalogAdapter = {
  async search(query, { signal } = {}) {
    signal?.throwIfAborted();
    const term = normalizeSearch(query);
    return SAMPLE_PRODUCTS.filter((item) => normalizeSearch(item.searchText).includes(term));
  },
};
export function createCatalogService(adapter = localCatalogAdapter) { return { async search(query, options) { const items = await adapter.search(query, options); if (!Array.isArray(items) || items.some((item) => typeof item.value !== "string" || typeof item.label !== "string")) throw new Error("ساختار کاتالوگ معتبر نیست."); return items; } }; }
