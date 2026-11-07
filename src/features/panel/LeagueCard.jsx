import { useId, useState } from "react";
import { LEAGUE_POLICY } from "../../config/platform.js";
import { evaluateLeague, LEAGUE_METRICS } from "../../domain/leagues.js";
import { faNumber, makeId, normalizeDecimal, normalizeSearch } from "../../utils/format.js";

const labels = { activity: "فعالیت", completion: "تکمیل موفق", punctuality: "خوش‌قولی", quality: "کیفیت عملکرد", disputes: "حل اختلاف", payments: "نظم پرداخت", financialReliability: "قابلیت اتکای مالی" };
export function LeagueCard({ role, compact = false }) {
  const keys = LEAGUE_METRICS[role] || LEAGUE_METRICS.shipper;
  const formId = useId();
  const [sample, setSample] = useState(false);
  const [levels, setLevels] = useState(() => LEAGUE_POLICY.levels.map((level, index) => ({ ...level, threshold: String([30, 60, 85][index]) })));
  const [metrics, setMetrics] = useState(() => Object.fromEntries(keys.map((key) => [key, { score: "72", weight: "1" }])));
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(1);
  function changed() { setResult(null); setError(""); setRevision((value) => value + 1); }
  const numeric = (value) => { const parsed = normalizeDecimal(value); return parsed === null || parsed === "" ? NaN : Number(parsed); };
  function calculate(event) {
    event.preventDefault(); setError("");
    const parsedLevels = levels.map((level) => ({ ...level, label: level.label.trim(), threshold: numeric(level.threshold) }));
    if (parsedLevels.some((level) => !level.label || !Number.isFinite(level.threshold)) || new Set(parsedLevels.map((level) => normalizeSearch(level.label))).size !== parsedLevels.length) { setError("عنوان‌های یکتا و آستانهٔ معتبر برای همهٔ سطوح وارد کنید."); return; }
    const scores = Object.fromEntries(keys.map((key) => [key, numeric(metrics[key]?.score)]));
    const weights = Object.fromEntries(keys.map((key) => [key, numeric(metrics[key]?.weight)]));
    const policy = { version: "preview-" + revision, levels: parsedLevels, weights };
    const value = evaluateLeague(scores, policy);
    if (value.status !== "simulation") { setError("امتیازها و آستانه‌ها بین صفر تا ۱۰۰، آستانه‌ها یکتا و مجموع وزن‌ها بیشتر از صفر باشند."); return; }
    const audit = { ...value, id: makeId("audit"), inputs: scores, weights, levels: parsedLevels };
    setResult(audit); setHistory((current) => [audit, ...current].slice(0, 10));
  }
  if (compact) return <section className="panel-card league-card"><span className="overline">مسیر پیشرفت</span><h2>لیگ و کیفیت همکاری</h2><p>رتبهٔ معتبر هنوز تعیین نشده است. معیارهای این نقش و پیش‌نمایش قابل تنظیم را بررسی کنید.</p><div className="league-levels">{LEAGUE_POLICY.levels.map((level) => <span key={level.id} className={"league-" + level.id}>{level.label}</span>)}</div><a className="button button-outline" href={"?view=panel&role=" + role + "&tab=league"}>رفتن به تنظیمات نمونهٔ لیگ</a></section>;
  return <section className="panel-card league-card"><span className="overline">مسیر پیشرفت</span><h2>لیگ و کیفیت همکاری</h2><span className="unverified-label">سطح معتبر: تعیین نشده</span><div className="league-levels">{LEAGUE_POLICY.levels.map((level) => <span key={level.id} className={"league-" + level.id}>{level.label}</span>)}</div><p>رتبه به دادهٔ معتبر و قواعد تأییدشده نیاز دارد. این ابزار فقط نتیجهٔ ورودی‌های فرضی را نشان می‌دهد و سطحی به حساب اعطا نمی‌کند.</p><ul className="metric-criteria">{keys.map((key) => <li key={key}>{labels[key]}</li>)}</ul><button type="button" className="button button-outline" onClick={() => setSample((value) => !value)}>{sample ? "بستن سناریوی رتبه‌بندی" : "بررسی سناریوی نمونه"}</button>
    {sample && <div className="league-sample"><span className="demo-badge">شبیه‌سازی؛ فاقد رتبه معتبر</span><form className="league-editor" noValidate onSubmit={calculate}><h3>معیارها و وزن‌های فرضی</h3><p className="field-hint">امتیاز هر معیار بین صفر تا ۱۰۰ است. وزن‌ها به‌صورت نسبی نرمال می‌شوند؛ این‌ها قواعد نهایی محصول نیستند.</p><div className="league-metrics-grid">{keys.map((key) => <fieldset key={key}><legend>{labels[key]}</legend><label htmlFor={formId + key + "score"}>امتیاز فرضی</label><input id={formId + key + "score"} value={metrics[key]?.score || ""} inputMode="decimal" maxLength={6} onChange={(event) => { setMetrics((current) => ({ ...current, [key]: { ...current[key], score: event.target.value } })); changed(); }} /><label htmlFor={formId + key + "weight"}>وزن فرضی</label><input id={formId + key + "weight"} value={metrics[key]?.weight || ""} inputMode="decimal" maxLength={6} onChange={(event) => { setMetrics((current) => ({ ...current, [key]: { ...current[key], weight: event.target.value } })); changed(); }} /></fieldset>)}</div>
      <h3>سطوح و آستانه‌ها</h3><div className="league-level-editor">{levels.map((level, index) => <div key={level.id}><label htmlFor={formId + level.id + "label"}>عنوان سطح {faNumber.format(index + 1)}</label><input id={formId + level.id + "label"} value={level.label} maxLength={30} onChange={(event) => { setLevels((current) => current.map((item) => item.id === level.id ? { ...item, label: event.target.value } : item)); changed(); }} /><label htmlFor={formId + level.id + "threshold"}>آستانهٔ فرضی</label><input id={formId + level.id + "threshold"} value={level.threshold} inputMode="decimal" maxLength={6} onChange={(event) => { setLevels((current) => current.map((item) => item.id === level.id ? { ...item, threshold: event.target.value } : item)); changed(); }} /><button type="button" className="text-link" disabled={levels.length < 2} aria-label={"حذف سطح " + level.label} onClick={() => { setLevels((current) => current.filter((item) => item.id !== level.id)); changed(); }}>حذف سطح</button></div>)}</div><div className="panel-actions"><button className="button button-outline" type="button" onClick={() => { setLevels((current) => [...current, { id: makeId("level"), label: "", threshold: "" }]); changed(); }}>افزودن سطح نمونه</button><button className="button button-primary">محاسبهٔ امتیاز نمونه</button></div>{error && <p className="field-error" role="alert">{error}</p>}</form>
      {result && <div className="league-result" role="status"><h3>نتیجهٔ فرضی: {result.sampleLevel?.label || "بدون سطح"}</h3><p>امتیاز {faNumber.format(result.score)} از ۱۰۰؛ سطح معتبر اعطا نشده است.</p><label>پیشرفت فرضی<progress value={result.score} max="100">{result.score}</progress></label><p className="field-hint">نسخهٔ قواعد: <bdi>{result.audit.policyVersion}</bdi></p></div>}
      {history.length > 0 && <details className="league-audit"><summary>سابقهٔ محاسبه و ممیزی نمونه</summary>{history.map((item) => <article key={item.id}><strong>{item.audit.policyVersion} · امتیاز {faNumber.format(item.score)}</strong><time>{new Intl.DateTimeFormat("fa-IR", { timeStyle: "short", timeZone: "Asia/Tehran" }).format(new Date(item.audit.evaluatedAt))}</time><ul>{Object.entries(item.inputs).map(([key, value]) => <li key={key}>{labels[key]}: {faNumber.format(value)} · وزن {faNumber.format(item.weights[key])}</li>)}</ul><p className="field-hint">آستانه‌ها: {item.levels.map((level) => level.label + " " + faNumber.format(level.threshold)).join("، ")} · منبع: ورودی فرضی</p></article>)}</details>}
    </div>}
  </section>;
}
