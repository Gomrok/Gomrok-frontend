import { useEffect, useId, useState } from "react";
import { MarketFilters } from "./MarketControls.jsx";
import { Icon } from "../../components/Icon.jsx";
import { faNumber } from "../../utils/format.js";
import { createMarketService } from "../../services/market.js";

const market = createMarketService();
const metrics = [
  { id: "available", category: "cargo", label: "بارهای موجود برای حمل", unit: "بار", icon: "boxes", color: "blue" },
  { id: "loading", category: "cargo", label: "بارهای در حال بارگیری", unit: "بار", icon: "package", color: "amber" },
  { id: "ready", category: "drivers", label: "رانندگان آمادهٔ دریافت بار", unit: "راننده", icon: "truck", color: "teal" },
  { id: "busy", category: "drivers", label: "رانندگان مشغول / دارای بار", unit: "راننده", icon: "route", color: "navy" },
];
export function MarketDashboard() {
  const [filter, setFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [range, setRange] = useState("today");
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [retry, setRetry] = useState(0);
  const gradientId = useId();
  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    market.getSnapshot(range, { signal: controller.signal }).then((snapshot) => { if (!controller.signal.aborted) { setData(snapshot); setStatus("ready"); } }).catch(() => { if (!controller.signal.aborted) setStatus("error"); });
    return () => controller.abort();
  }, [range, retry]);
  const visible = metrics.filter((item) => (filter === "all" || item.category === filter) && (statusFilter === "all" || item.id === statusFilter));
  const max = data ? Math.max(...data.series.flatMap((point) => [point.cargo, point.drivers]), 1) : 1;
  const points = (key) => data.series.map((point, index) => `${30 + index * 82},${180 - point[key] / max * 145}`).join(" ");
  return <section className="section market-section" id="market" data-figma="Section/MarketActivity">
    <div className="container">
      <div className="section-heading"><div><p className="eyebrow"><span className="section-number">۰۳</span>عرضه و تقاضا در یک نگاه</p><h2>نبض بازار حمل‌ونقل</h2><p>بارها و ظرفیت حمل را، با تفکیک وضعیت، کنار هم ببینید.</p></div><span className="demo-badge">داده نمونه</span></div>
      <div className="market-dashboard" aria-busy={status === "loading"}>
        <div className="market-tools">
          <MarketFilters filter={filter} onChange={(value) => { setFilter(value); setStatusFilter("all"); }} />
          <div className="market-selects"><label>بازهٔ نمایش<select id="market-range" value={range} onChange={(event) => setRange(event.target.value)}><option value="today">امروز</option><option value="week">۷ روز</option><option value="month">۳۰ روز</option></select></label><label>وضعیت<select id="market-status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">همهٔ وضعیت‌ها</option>{metrics.filter((item) => filter === "all" || item.category === filter).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label></div>
        </div>
        {status === "loading" ? <p className="resource-message" role="status">در حال آماده‌سازی نمای بازار…</p> : status === "error" ? <div className="resource-message" role="alert"><p>نمای بازار بارگیری نشد.</p><button className="button button-outline" onClick={() => setRetry((value) => value + 1)}>تلاش دوباره</button></div> : !data || !data.series.length ? <div className="resource-message" role="status"><p>برای این بازه داده‌ای موجود نیست.</p><button className="button button-outline" onClick={() => { setRange("today"); setRetry((value) => value + 1); }}>بازگشت و بارگیری دوباره</button></div> : <>
          <div className="market-status-grid" aria-live="polite">{visible.length ? visible.map((metric) => <article className={`market-status-card status-${metric.color}`} key={metric.id} data-metric={metric.id}><span className="metric-icon"><Icon name={metric.icon} /></span><span>{metric.label}</span><strong>{faNumber.format(data.counts[metric.id])}<small>{metric.unit}</small></strong><span className="sample-caption">وضعیت نمونه در بازهٔ انتخاب‌شده</span></article>) : <p>وضعیتی مطابق فیلتر نیست.</p>}</div>
          <div className="market-chart-layout">
            <div className="market-trend"><div className="chart-heading"><h3>روند نمونهٔ بار و ظرفیت آماده</h3><div className="chart-legend"><span><i className="blue-dot" />بار</span><span><i className="teal-dot" />رانندهٔ آماده</span></div></div>
              <svg viewBox="0 0 720 210" role="img" aria-label="روند نمونه؛ مقادیر عددی در جدول زیر نمودار موجود است" className="market-trend-svg"><defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#1d4ed8" stopOpacity=".12" /><stop offset="1" stopColor="#1d4ed8" stopOpacity="0" /></linearGradient></defs><g stroke="#dce5ee" strokeDasharray="4 5"><path d="M30 35H686M30 85H686M30 135H686M30 180H686" /></g><polygon points={`30,180 ${points("cargo")} 686,180`} fill={`url(#${gradientId})`} /><polyline points={points("cargo")} fill="none" stroke="#1d4ed8" strokeWidth="3" opacity={filter === "drivers" ? 0.2 : 1} /><polyline points={points("drivers")} fill="none" stroke="#0f766e" strokeWidth="3" strokeDasharray="6 4" opacity={filter === "cargo" ? 0.2 : 1} /></svg>
              <div className="chart-axis"><span>ابتدای بازهٔ نمونه</span><span>انتهای بازهٔ نمونه</span></div>
              <details className="chart-data"><summary>جدول داده‌های نمودار</summary><div className="table-scroll"><table><caption>مقادیر نمونه؛ فاقد دادهٔ لحظه‌ای</caption><thead><tr><th scope="col">نقطه</th><th scope="col">بار</th><th scope="col">رانندهٔ آماده</th></tr></thead><tbody>{data.series.map((point) => <tr key={point.label}><th scope="row">{point.label}</th><td>{faNumber.format(point.cargo)}</td><td>{faNumber.format(point.drivers)}</td></tr>)}</tbody></table></div></details>
            </div>
            <aside className="market-balance"><span className="overline">توازن نمونهٔ بازار</span><h3>ظرفیت در برابر تقاضا</h3><p><strong>{faNumber.format(data.counts.ready)}</strong> رانندهٔ آماده در برابر <strong>{faNumber.format(data.counts.available)}</strong> بار موجود</p><div className="supply-bar" aria-hidden="true"><span style={{ width: `${data.counts.ready / (data.counts.ready + data.counts.available) * 100}%` }} /></div><p className="sample-caption">این نسبت برای نمایش طراحی است؛ نرخ، ظرفیت قابل رزرو یا توصیهٔ عملیاتی نیست.</p><a className="text-link" href="#drivers">بررسی نمونهٔ استان‌ها <Icon name="arrow-left" /></a></aside>
          </div>
        </>}
      </div>
      <p className="module-note">تمام اعداد و روندها «داده نمونه» هستند؛ هیچ API بازار یا موجودی واقعی متصل نیست.</p>
    </div>
  </section>;
}
