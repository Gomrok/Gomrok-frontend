import { normalizeSearch, makeId } from "../utils/format.js";
const rules = [
  { value: "food", label: "مواد غذایی", words: ["غذا", "گندم", "برنج", "قهوه", "میوه", "food"], reason: "تطبیق واژه در فهرست محلیِ گروه مواد غذایی" },
  { value: "industrial", label: "قطعات صنعتی", words: ["قطعه", "قطعات", "ماشین", "تجهیزات", "صنعت", "machine"], reason: "تطبیق واژه در فهرست محلیِ گروه تجهیزات و قطعات" },
  { value: "general", label: "کالای عمومی", words: ["مبلمان", "پوشاک", "لباس", "بسته", "کارتن", "furniture"], reason: "تطبیق واژه در فهرست محلیِ کالای عمومی" },
];
export const localCargoAdapter = { async suggest(description, { signal } = {}) { signal?.throwIfAborted(); const text = normalizeSearch(description); if (text.length < 3) throw new Error("شرح کالا را دست‌کم با سه نویسه وارد کنید."); return { id: makeId("cargo-suggestion"), kind: "local-sample", candidates: rules.filter((rule) => rule.words.some((word) => text.includes(word))).map(({ words, ...candidate }) => candidate) }; } };
export const createCargoService = (adapter = localCargoAdapter) => ({ suggest: (description, options) => adapter.suggest(description, options) });
