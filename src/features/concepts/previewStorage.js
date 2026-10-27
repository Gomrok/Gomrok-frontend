const STORAGE_PREFIX = "gomrok:preview:";

export function savePreview(view, values) {
  try {
    window.sessionStorage.setItem(
      `${STORAGE_PREFIX}${view}`,
      values.toString(),
    );
    return true;
  } catch {
    return false;
  }
}

export function readPreview(view) {
  try {
    return new URLSearchParams(
      window.sessionStorage.getItem(`${STORAGE_PREFIX}${view}`) || "",
    );
  } catch {
    return new URLSearchParams();
  }
}
