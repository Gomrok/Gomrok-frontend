import { useEffect, useRef, useState } from "react";
import { normalizeSearch } from "../utils/format.js";
import { Icon } from "./Icon.jsx";

export function Combobox({ id, name, label, value = "", options = [], onChange, onQueryChange, placeholder = "جستجو و انتخاب کنید", disabled = false, required = false, error = "", hint = "", loading = false, loadError = "", onRetry, filterLocally = true }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);
  const listRef = useRef(null);
  const selected = options.find((option) => option.value === value);
  const term = normalizeSearch(query);
  const filtered = loading || loadError ? [] : filterLocally ? options.filter((option) => normalizeSearch(`${option.label} ${option.searchText || ""}`).includes(term)) : options;
  const expanded = open && !disabled;
  const activeIndex = active < filtered.length ? active : -1;

  useEffect(() => { if (expanded && activeIndex >= 0) listRef.current?.children[activeIndex]?.scrollIntoView({ block: "nearest" }); }, [activeIndex, expanded]);
  function choose(option) { onChange(option.value); setQuery(option.label); setOpen(false); setActive(-1); }
  function keys(event) {
    if (event.nativeEvent.isComposing) return;
    if (["ArrowDown", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      if (!expanded) { setQuery(""); onQueryChange?.(""); setOpen(true); setActive(0); }
      else setActive((current) => filtered.length ? current < 0 ? event.key === "ArrowDown" ? 0 : filtered.length - 1 : (current + (event.key === "ArrowDown" ? 1 : -1) + filtered.length) % filtered.length : -1);
    } else if (event.key === "Enter" && expanded) {
      event.preventDefault();
      const option = filtered[activeIndex] || (filtered.length === 1 ? filtered[0] : null);
      if (option) choose(option);
    } else if (event.key === "Escape") { if (expanded) event.stopPropagation(); setOpen(false); setActive(-1); }
  }
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;
  return (
    <div className="field combobox-field">
      <label htmlFor={id}>{label}{required && <span className="sr-only"> (الزامی)</span>}</label>
      <div className="combobox-control">
        <input id={id} type="text" role="combobox" aria-autocomplete="list" aria-expanded={expanded} aria-controls={expanded ? `${id}-list` : undefined} aria-activedescendant={expanded && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined} aria-required={required || undefined} aria-invalid={Boolean(error)} aria-describedby={describedBy} autoComplete="off" value={expanded ? query : selected?.label || ""} placeholder={placeholder} disabled={disabled} maxLength={100}
          onFocus={() => { setQuery(selected?.label || ""); onQueryChange?.(selected?.label || ""); setOpen(true); setActive(-1); }}
          onChange={(event) => { setQuery(event.target.value); onQueryChange?.(event.target.value); setActive(-1); setOpen(true); if (value) onChange(""); }}
          onKeyDown={keys} onBlur={() => { setOpen(false); setActive(-1); }} />
        <Icon name="chevron-down" />
        {name && <input type="hidden" name={name} value={value} />}
        {expanded && <div className="combobox-popup">
            <ul id={`${id}-list`} role="listbox" aria-label={`پیشنهادهای ${label}`} ref={listRef}>
              {filtered.map((option, index) => <li key={option.value} id={`${id}-option-${index}`} role="option" aria-selected={value === option.value} data-active={activeIndex === index} onPointerDown={(event) => event.preventDefault()} onClick={() => choose(option)}>
                <span>{option.label}</span>{option.description && <small>{option.description}</small>}
              </li>)}
            </ul>
            {loading ? <p role="status">در حال جستجو…</p> : loadError ? <div className="combobox-feedback" role="alert"><p>{loadError}</p>{onRetry && <button type="button" onPointerDown={(event) => event.preventDefault()} onClick={onRetry}>تلاش دوباره</button>}</div> : !filtered.length && <p role="status">موردی در فهرست فعلی پیدا نشد.</p>}
        </div>}
      </div>
      {hint && <small className="field-hint" id={`${id}-hint`}>{hint}</small>}
      {error && <span id={`${id}-error`} className="field-error">{error}</span>}
    </div>
  );
}
