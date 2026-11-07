export const COUNTRIES = [
  { value: "iran", label: "ایران", searchText: "Iran IR" }, { value: "turkey", label: "ترکیه", searchText: "Turkey Türkiye TR" },
  { value: "uae", label: "امارات", searchText: "UAE United Arab Emirates AE" }, { value: "iraq", label: "عراق", searchText: "Iraq IQ" }, { value: "china", label: "چین", searchText: "China CN" },
];
const city = (value, label, searchText = "") => ({ value, label, searchText });
export const CITIES = {
  iran: [city("tehran", "تهران", "Tehran"), city("isfahan", "اصفهان", "Isfahan"), city("bandarabbas", "بندرعباس", "Bandar Abbas بندر عباس"), city("tabriz", "تبریز", "Tabriz"), city("mashhad", "مشهد", "Mashhad")],
  turkey: [city("istanbul", "استانبول", "Istanbul"), city("ankara", "آنکارا", "Ankara"), city("mersin", "مرسین", "Mersin")],
  uae: [city("dubai", "دبی", "Dubai"), city("abudhabi", "ابوظبی", "Abu Dhabi ابو ظبی")], iraq: [city("baghdad", "بغداد", "Baghdad"), city("basra", "بصره", "Basra")],
  china: [city("shanghai", "شانگهای", "Shanghai"), city("guangzhou", "گوانگژو", "Guangzhou")],
};
export const TRANSPORT_MODES = [{ value: "road", label: "زمینی", icon: "truck" }, { value: "sea", label: "دریایی", icon: "ship" }, { value: "air", label: "هوایی", icon: "plane" }, { value: "rail", label: "ریلی", icon: "train" }];
export const TRANSPORT_SCOPES = [{ value: "export", label: "صادرات" }, { value: "import", label: "واردات" }, { value: "transit", label: "ترانزیت" }];
export const VEHICLE_OPTIONS = {
  road: [city("flatbed", "تریلی کفی"), city("curtain", "تریلی چادری"), city("refrigerated", "یخچال‌دار")],
  sea: [city("fcl", "کانتینر کامل (FCL)"), city("lcl", "خرده‌بار (LCL)")], air: [city("aircargo", "بار هوایی")],
  rail: [city("rail-container", "واگن کانتینری"), city("rail-covered", "واگن مسقف"), city("rail-bulk", "واگن فله‌بر")],
};
export const CARGO_TYPES = [city("general", "کالای عمومی", "عمومی general"), city("industrial", "قطعات صنعتی", "ماشین آلات تجهیزات industrial machinery"), city("food", "مواد غذایی", "غذا غلات کشاورزی food"), city("other", "سایر کالاها", "other")];
