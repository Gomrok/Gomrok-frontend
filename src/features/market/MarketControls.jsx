import { Icon } from "../../components/Icon.jsx";

export function MarketFilters({ filter, onChange }) {
  return (
    <div
      className="segmented market-filter"
      role="group"
      aria-label="فیلتر آمار بازار"
    >
      {[
        ["all", "همه"],
        ["cargo", "بار"],
        ["drivers", "رانندگان"],
      ].map(([value, label]) => (
        <button
          key={value}
          type="button"
          className={filter === value ? "selected" : ""}
          aria-pressed={filter === value}
          onClick={() => onChange(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function MarketLead({ filter }) {
  const drivers = filter === "drivers";
  return (
    <div className="market-lead">
      <span className="overline">
        {drivers ? "رانندگان فعال" : "بارهای موجود"}
      </span>
      <div className="market-big-number">{drivers ? "۳۱۰" : "۱۲۸"}</div>
      <span className="market-unit">
        {drivers ? "راننده" : "بار"} در نمای نمونه سامانه
      </span>
      <div className="metric-indicator">
        <span />
        نمای کلی عرضه و تقاضا
      </div>
    </div>
  );
}
