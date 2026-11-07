const counts = { tehran: 18, isfahan: 14, fars: 12, "razavi-khorasan": 16, "east-azerbaijan": 11, khuzestan: 13 };
const types = ["flatbed", "curtain", "refrigerated", "van"];
export function driverDemoData(id) {
  const seed = [...String(id)].reduce((sum, letter) => sum + letter.charCodeAt(0), 0);
  const count = counts[id] || 7 + seed % 12;
  const drivers = Array.from({ length: count }, (_, index) => ({ id: index + 1, type: types[(seed + index) % types.length], capacity: [24, 22, 18, 2][(seed + index) % types.length], status: (seed + index) % 3 ? "ready" : "busy" }));
  return { kind: "sample", count: drivers.length, drivers };
}
export function filterSampleDrivers(id, vehicle = "all", status = "all") { return driverDemoData(id).drivers.filter((driver) => (vehicle === "all" || driver.type === vehicle) && (status === "all" || driver.status === status)); }
