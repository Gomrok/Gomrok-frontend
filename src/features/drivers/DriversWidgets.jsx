import { useDialog } from "../../components/DialogContext.jsx";
import { Icon } from "../../components/Icon.jsx";
import geography from "../../data/provinces-metadata.json";

export const faNumber = new Intl.NumberFormat("fa-IR");

const vehicleLabels = {
  flatbed: "تریلی کفی",
  curtain: "چادری",
  refrigerated: "یخچال‌دار",
  van: "وانت",
};

const vehicleOptions = [
  ["all", "همهٔ خودروها"],
  ["flatbed", "تریلی کفی"],
  ["curtain", "چادری"],
  ["refrigerated", "یخچال‌دار"],
  ["van", "وانت"],
];

const countOverrides = {
  tehran: 18,
  isfahan: 14,
  fars: 12,
  "razavi-khorasan": 16,
  "east-azerbaijan": 11,
  khuzestan: 13,
};

export function driverDemoData(id) {
  const index = geography.provinces.findIndex((province) => province.id === id);
  return {
    count: countOverrides[id] || 7 + ((Math.max(0, index) * 3) % 12),
    drivers: [
      { id: 1, type: "flatbed", capacity: 24 },
      { id: 2, type: "curtain", capacity: 22 },
      { id: 3, type: "refrigerated", capacity: 18 },
    ],
  };
}

export function ProvinceSelect({ province, provinces, onChange }) {
  const sortedProvinces = [...provinces].sort((a, b) =>
    a.fa.localeCompare(b.fa, "fa"),
  );
  return (
    <select
      id="province-select"
      value={province.id}
      aria-controls="province-panel"
      onChange={(event) => onChange(event.target.value)}
    >
      {sortedProvinces.map((item) => (
        <option key={item.id} value={item.id}>
          {item.fa}
        </option>
      ))}
    </select>
  );
}

export function VehicleSelect({ value, onChange }) {
  return (
    <select
      id="map-vehicle"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {vehicleOptions.map(([key, label]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </select>
  );
}

const provinceLabels = new Set([
  "fars",
  "isfahan",
  "razavi-khorasan",
  "east-azerbaijan",
  "kerman",
]);

export function IranMap({ province, provinces, paths, loading, onSelect }) {
  return (
    <svg
      className="iran-map-svg"
      viewBox="0 0 710 600"
      role="group"
      aria-label="نقشه استان‌های ایران؛ داده نمایشی"
      aria-busy={loading}
      fill="none"
    >
      {paths &&
        provinces.map((item) => (
          <path
            key={item.id}
            d={paths[item.id]}
            className={`province-path ${province.id === item.id ? "selected" : ""}`}
            data-province={item.id}
            fill="#F1F5F9"
            stroke="#7A8CA3"
            strokeWidth="0.9"
            fillRule="evenodd"
            role="button"
            tabIndex={0}
            aria-label={`انتخاب استان ${item.fa}؛ داده نمایشی`}
            aria-pressed={province.id === item.id}
            onClick={() => onSelect(item.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(item.id);
              }
            }}
          >
            <title>{item.fa}</title>
          </path>
        ))}
      {provinces
        .filter((item) => provinceLabels.has(item.id))
        .map((item) => (
          <text
            key={item.id}
            x={item.label[0]}
            y={item.label[1]}
            className="map-place-label"
            textAnchor="middle"
          >
            {item.fa}
          </text>
        ))}
      <text x="291" y="72" className="map-water-label" textAnchor="middle">
        دریای خزر
      </text>
      <text x="304" y="545" className="map-water-label" textAnchor="middle">
        خلیج فارس
      </text>
      <text
        x={province.label[0]}
        y={province.label[1] - 10}
        className="map-place-label map-selected-label"
        textAnchor="middle"
      >
        {province.fa}
      </text>
    </svg>
  );
}

export function DriverList({ province, vehicle, onVehicleChange }) {
  const { openDialog } = useDialog();
  const { drivers } = driverDemoData(province.id);
  const filtered = drivers.filter(
    (driver) => vehicle === "all" || driver.type === vehicle,
  );

  if (!filtered.length) {
    return (
      <div className="empty-drivers">
        <Icon name="truck" />
        <h4>خودروی نمونه‌ای برای این فیلتر نیست</h4>
        <p>نوع خودرو را تغییر دهید و دوباره بررسی کنید.</p>
        <button type="button" onClick={() => onVehicleChange("all")}>
          نمایش همهٔ خودروها
        </button>
      </div>
    );
  }

  return (
    <>
      {filtered.map((driver) => (
        <div className="driver-row" key={`${province.id}-${driver.id}`}>
          <span className="driver-icon">
            <Icon name="truck" />
          </span>
          <div>
            <div className="driver-name">
              ناوگان نمونه {faNumber.format(driver.id).padStart(2, "۰")}
            </div>
            <div className="driver-specs">
              <span>{vehicleLabels[driver.type]}</span>
              <i />
              <span>{faNumber.format(driver.capacity)} تن</span>
            </div>
          </div>
          <button
            type="button"
            className="driver-detail"
            aria-label={`مشاهده جزئیات ناوگان نمونه ${faNumber.format(driver.id)}`}
            onClick={() =>
              openDialog(
                `ناوگان نمونه ${faNumber.format(driver.id)}`,
                <>
                  <p className="dialog-copy">
                    {vehicleLabels[driver.type]} · ظرفیت نمونه{" "}
                    {faNumber.format(driver.capacity)} تن · استان {province.fa}
                  </p>
                  <p className="dialog-note">
                    این پروفایل، نام، ظرفیت و موقعیت نمونهٔ طراحی است. شخص واقعی
                    یا موجودی تأییدشده معرفی نمی‌شود.
                  </p>
                </>,
              )
            }
          >
            جزئیات <Icon name="chevron-left" />
          </button>
        </div>
      ))}
    </>
  );
}
