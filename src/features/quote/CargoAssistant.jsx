import { useEffect, useRef, useState } from "react";
import { createCargoService } from "../../services/cargo.js";
import { Icon } from "../../components/Icon.jsx";
const service = createCargoService();
export function CargoAssistant({ onAccept }) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const controllerRef = useRef(null);
  useEffect(() => { if (open) inputRef.current?.focus({ preventScroll: true }); }, [open]);
  useEffect(() => () => controllerRef.current?.abort(), []);
  async function run() {
    controllerRef.current?.abort(); const controller = new AbortController(); controllerRef.current = controller;
    setStatus("loading"); setError(""); setResult(null);
    try { const suggestion = await service.suggest(description, { signal: controller.signal }); if (!controller.signal.aborted) { setResult(suggestion); setStatus("ready"); } }
    catch (error) { if (!controller.signal.aborted) { setStatus("error"); setError(error.message); } }
  }
  return <section className="cargo-assistant"><button type="button" className="text-link" aria-expanded={open} aria-controls="cargo-assistant-panel" onClick={() => setOpen((value) => !value)}><Icon name="sparkles" />راهنمای انتخاب نوع بار</button><div id="cargo-assistant-panel" hidden={!open}><span className="demo-badge">پیشنهاد محلی؛ بدون تحلیل AI زنده</span><label className="field">شرح کوتاه کالا<input ref={inputRef} value={description} maxLength={200} placeholder="مثلاً قطعات ماشین‌آلات" onChange={(event) => { controllerRef.current?.abort(); setDescription(event.target.value); setResult(null); setError(""); setStatus("idle"); }} onKeyDown={(event) => { if (event.key === "Enter" && !event.nativeEvent.isComposing) { event.preventDefault(); run(); } }} /></label><button type="button" className="button button-outline" disabled={status === "loading"} onClick={run}>{status === "loading" ? "در حال بررسی فهرست…" : "بررسی پیشنهاد محلی"}</button>{error && <p role="alert" className="field-error">{error}</p>}{result && <div aria-live="polite">{result.candidates.length ? result.candidates.map((candidate) => <article key={candidate.value}><div><strong>{candidate.label}</strong><p>{candidate.reason}</p></div><button type="button" className="button button-outline" onClick={() => { onAccept(candidate.value, result.id); setOpen(false); }}>استفاده از این پیشنهاد</button></article>) : <p>پیشنهادی از فهرست محلی مشخص نشد؛ نوع بار را دستی انتخاب کنید.</p>}</div>}<p className="field-hint">انتخاب نهایی با شماست. این راهنما تعرفه، ماهیت حقوقی کالا یا شرایط حمل را تعیین نمی‌کند.</p></div></section>;
}
