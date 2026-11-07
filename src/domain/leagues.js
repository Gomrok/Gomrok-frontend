export const LEAGUE_METRICS = { shipper: ["activity", "completion", "punctuality", "quality", "disputes"], driver: ["activity", "completion", "punctuality", "quality", "disputes"], carrier: ["payments", "financialReliability", "completion", "quality", "disputes"], broker: ["activity", "completion", "punctuality", "quality", "disputes"] };
export function evaluateLeague(metrics, policy, { verified = false, at = new Date().toISOString() } = {}) {
  const audit = { policyVersion: policy.version, evaluatedAt: at, source: verified ? "verified_input" : "sample_input" };
  if (!policy.weights || policy.levels.some((level) => !Number.isFinite(level.threshold))) return { status: "unconfigured", level: null, audit };
  if (!policy.levels.length || new Set(policy.levels.map((level) => level.id)).size !== policy.levels.length || new Set(policy.levels.map((level) => level.threshold)).size !== policy.levels.length || policy.levels.some((level) => level.threshold < 0 || level.threshold > 100)) return { status: "invalid", level: null, audit };
  const weights = Object.entries(policy.weights);
  const total = weights.reduce((sum, [, weight]) => sum + weight, 0);
  if (!weights.length || total <= 0 || weights.some(([key, weight]) => !Number.isFinite(weight) || weight < 0 || !Number.isFinite(metrics[key]) || metrics[key] < 0 || metrics[key] > 100)) return { status: "invalid", level: null, audit };
  const score = Math.round(weights.reduce((sum, [key, weight]) => sum + metrics[key] * weight, 0) / total);
  const level = [...policy.levels].sort((a, b) => b.threshold - a.threshold).find((item) => score >= item.threshold) || null;
  return { status: verified ? "evaluated" : "simulation", level: verified ? level : null, sampleLevel: verified ? null : level, score, audit };
}
