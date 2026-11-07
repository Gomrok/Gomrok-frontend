import { useEffect, useState } from "react";
import { Combobox } from "../../components/Combobox.jsx";
import { useDialog } from "../../components/DialogContext.jsx";
import { createCatalogService } from "../../services/catalog.js";
import { savePreview } from "../concepts/previewStorage.js";

const catalog = createCatalogService();
export function ProductSearch() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [retry, setRetry] = useState(0);
  const [error, setError] = useState("");
  const { openDialog } = useDialog();
  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    const timer = setTimeout(() => catalog.search(query, { signal: controller.signal }).then((items) => { if (!controller.signal.aborted) { setProducts(items); setStatus("ready"); } }).catch(() => { if (!controller.signal.aborted) setStatus("error"); }), 120);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, retry]);
  function select(value) {
    const product = products.find((item) => item.value === value);
    if (!product) return;
    const saved = savePreview("customs", new URLSearchParams({ goods: product.label, hs: product.hsCode }));
    if (!saved) { setError("مرورگر اجازهٔ نگه‌داری موقت نتیجه را نداد؛ می‌توانید کالا را در فرم معرفی کنید."); return; }
    setError("");
    openDialog(product.label, <><p>کد نمونهٔ رده‌بندی: <bdi>{product.hsCode}</bdi></p><p className="dialog-note">کاتالوگ محلی و آزمایشی است. این نتیجه منبع رسمی تعیین تعرفه، تخفیف یا اظهار کالا نیست.</p></>, [{ label: "مرور اطلاعات کالا", href: "?view=customs", primary: true }, { label: "استعلام حمل", href: "./#quote" }]);
  }
  return <div className="header-product-search" role="search" aria-label="جستجوی نمونهٔ کالا">
    <Combobox id="header-product-search" label="جستجوی کالا یا کد تعرفه (HS)" options={products} value="" onChange={select} onQueryChange={(value) => { if (value !== query) { setStatus("loading"); setQuery(value); } }} loading={status === "loading"} loadError={status === "error" ? "کاتالوگ بارگیری نشد." : ""} onRetry={() => setRetry((value) => value + 1)} filterLocally={false} placeholder="نام کالا یا HS Code را بنویسید…" error={error} />
    <span className="catalog-caption">جستجوی محلی · کاتالوگ نمونه</span>
  </div>;
}
