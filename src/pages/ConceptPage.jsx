import { ChatConversation } from "../features/ai/ChatConversation.jsx";
import { readPreview } from "../features/concepts/previewStorage.js";
import { CITIES, CARGO_TYPES, TRANSPORT_MODES, TRANSPORT_SCOPES, VEHICLE_OPTIONS } from "../data/logistics.js";
import { faNumber, normalizeDecimal } from "../utils/format.js";
import { ConceptFooter, ConceptHeader, CustomsConcept, QuoteConcept } from "../sections/ConceptMarkup.jsx";

function readSummary(view) {
  const details = readPreview(view);
  const get = (key, fallback = "", limit = 120) => (details.get(key) || fallback).slice(0, limit);
  const origin = CITIES[get("originCountry")]?.find((item) => item.value === get("originCity"));
  const destination = CITIES[get("destinationCountry")]?.find((item) => item.value === get("destinationCity"));
  const mode = TRANSPORT_MODES.find((item) => item.value === get("mode"));
  const weight = normalizeDecimal(get("weight"));
  const operation = get("operation");
  return {
    origin: origin?.label || "", destination: destination?.label || "", hasRoute: Boolean(origin && destination),
    goods: get("goodsLabel") || CARGO_TYPES.find((item) => item.value === get("goods"))?.label || get("goods"),
    weight: weight && Number(weight) > 0 ? faNumber.format(Number(weight)) : "", weightRaw: weight || "",
    vehicle: VEHICLE_OPTIONS[mode?.value]?.find((item) => item.value === get("vehicle"))?.label || "",
    mode: mode?.value || "", modeLabel: mode?.label || "انتخاب نشده", modeIcon: mode?.icon || "truck",
    scope: get("scope"), scopeLabel: TRANSPORT_SCOPES.find((item) => item.value === get("scope"))?.label || "انتخاب نشده",
    routeName: get("routeName", "", 80), pickup: get("pickup"), dropoff: get("dropoff"), ready: get("ready"),
    hs: get("hs"), office: get("office", "انتخاب نشده"), operation,
    operationLabel: ({ import: "واردات", export: "صادرات", transit: "ترانزیت" })[operation] || "انتخاب نشده",
    note: get("note", "", 500), packaging: get("packaging"), referralSource: get("referralSource", "direct"),
  };
}
export function ConceptPage({ view }) {
  const params = new URLSearchParams(window.location.search);
  const summary = readSummary(view);
  return <><a className="skip-link" href="#main">رفتن به محتوای اصلی</a><ConceptHeader /><main id="main" className="concept-main">
    {view === "chat" && <ChatConversation initialQuestion={params.get("question") || ""} />}
    {view === "quote" && <QuoteConcept summary={summary} />}
    {view === "customs" && <CustomsConcept summary={summary} />}
    <ConceptFooter />
  </main></>;
}
