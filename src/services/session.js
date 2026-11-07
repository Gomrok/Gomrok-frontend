export function readSession(key, fallback = null) {
  try { const value = window.sessionStorage.getItem(`gomrok:${key}`); return value === null ? fallback : JSON.parse(value); } catch { return fallback; }
}
export function writeSession(key, value) {
  try { window.sessionStorage.setItem(`gomrok:${key}`, JSON.stringify(value)); return true; } catch { return false; }
}
export function removeSession(key) { try { window.sessionStorage.removeItem(`gomrok:${key}`); return true; } catch { return false; } }

// A usability quota, not a security boundary. A real limit belongs on the server.
export function createGuestQuota(limit, storage) {
  let memory = 0;
  const read = () => {
    try { const raw = storage.getItem("gomrok:ai:guest-usage"); const n = raw === null ? memory : Number(raw); memory = Number.isInteger(n) && n >= 0 ? Math.min(n, limit) : memory; } catch { /* In-memory quota survives new-chat resets. */ }
    return memory;
  };
  const write = (n) => { memory = Math.max(0, Math.min(limit, n)); try { storage.setItem("gomrok:ai:guest-usage", String(memory)); } catch { /* Storage can be disabled. */ } return memory; };
  return { read, consume: () => read() < limit ? write(read() + 1) : null, refund: () => write(read() - 1) };
}
