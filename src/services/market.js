const snapshots = {
  today: { available: 128, loading: 36, ready: 214, busy: 96 },
  week: { available: 94, loading: 28, ready: 168, busy: 80 },
  month: { available: 141, loading: 44, ready: 204, busy: 112 },
};
export const localMarketAdapter = {
  async getSnapshot(range, { signal } = {}) {
    signal?.throwIfAborted();
    const counts = snapshots[range];
    if (!counts) throw new Error("بازهٔ نامعتبر");
    const factors = [0.64, 0.72, 0.67, 0.8, 0.75, 0.85, 0.9, 0.87, 1];
    return { kind: "sample", counts, series: factors.map((factor, index) => ({ label: `نقطهٔ ${new Intl.NumberFormat("fa-IR").format(index + 1)}`, cargo: Math.round(counts.available * factor), drivers: Math.round(counts.ready * (factor + (index === 8 ? 0 : 0.08))) })) };
  },
};
export const createMarketService = (adapter = localMarketAdapter) => ({ async getSnapshot(range, options) {
  const snapshot = await adapter.getSnapshot(range, options);
  if (snapshot === null) return null;
  const count = (value) => Number.isFinite(value) && value >= 0;
  if (!snapshot || !Array.isArray(snapshot.series) || ["available", "loading", "ready", "busy"].some((key) => !count(snapshot.counts?.[key])) || snapshot.series.some((point) => !count(point.cargo) || !count(point.drivers))) throw new Error("ساختار دادهٔ بازار معتبر نیست.");
  return snapshot;
} });
