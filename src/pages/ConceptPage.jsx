import { ChatConversation } from "../features/ai/ChatConversation.jsx";
import { readPreview } from "../features/concepts/previewStorage.js";
import {
  ConceptFooter,
  ConceptHeader,
  CustomsConcept,
  QuoteConcept,
} from "../sections/ConceptMarkup.jsx";

function readSummary(view) {
  const details = readPreview(view);
  const get = (key, fallback = "") =>
    (details.get(key) || fallback).slice(0, 120);
  const operation = get("operation", "import");
  const mode = get("mode", "road");
  const goods = get("goods");
  const vehicle = get("vehicle");
  const cargoLabels = {
    general: "کالای عمومی",
    industrial: "قطعات صنعتی",
    food: "مواد غذایی",
    other: "سایر",
    flatbed: "تریلی کفی",
    curtain: "تریلی چادری",
    refrigerated: "یخچال‌دار",
    fcl: "کانتینر کامل (FCL)",
    lcl: "خرده‌بار (LCL)",
    aircargo: "بار هوایی",
  };
  const modeLabels = { road: "زمینی", sea: "دریایی", air: "هوایی" };
  const parsedWeight = Number(get("weight"));
  return {
    origin: get("origin", "تهران"),
    destination: get("destination", "استانبول"),
    goods: cargoLabels[goods] || goods || "قطعات صنعتی",
    weight:
      Number.isFinite(parsedWeight) && parsedWeight > 0
        ? new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 2 }).format(
            parsedWeight,
          )
        : "",
    vehicle: cargoLabels[vehicle] || "",
    mode: modeLabels[mode] ? mode : "road",
    modeLabel: modeLabels[mode] || modeLabels.road,
    modeIcon: { road: "truck", sea: "ship", air: "plane" }[mode] || "truck",
    pickup: get("pickup"),
    dropoff: get("dropoff"),
    ready: get("ready"),
    hs: get("hs"),
    office: get("office", "انتخاب نشده"),
    operation,
    operationLabel: operation === "export" ? "صادرات" : "واردات",
    note: get("note"),
  };
}

export function ConceptPage({ view }) {
  const params = new URLSearchParams(window.location.search);
  const summary = readSummary(view);

  return (
    <>
      <a className="skip-link" href="#main">
        رفتن به محتوای اصلی
      </a>
      <ConceptHeader />
      <main id="main" className="concept-main">
        {view === "chat" && (
          <ChatConversation initialQuestion={params.get("question") || ""} />
        )}
        {view === "quote" && <QuoteConcept summary={summary} />}
        {view === "customs" && <CustomsConcept summary={summary} />}
        <ConceptFooter />
      </main>
    </>
  );
}
