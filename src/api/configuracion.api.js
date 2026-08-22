import { buildApiUrl, httpJson } from "./http.js";

export async function getPublicConfig() {
  const data = await httpJson(buildApiUrl("/api/configuracion"), {
    skipUnauthorizedRedirect: true,
  });
  return data?.data ?? data ?? null;
}

export function getCachedConfig() {
  try {
    const raw = localStorage.getItem("pmya_config");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCachedConfig(config) {
  if (!config || typeof config !== "object") return;
  localStorage.setItem("pmya_config", JSON.stringify(config));
  window.dispatchEvent(new CustomEvent("configUpdated", { detail: config }));
}

export async function loadPublicConfig({ preferCache = true } = {}) {
  const cached = getCachedConfig();
  if (preferCache && cached) return cached;
  const remote = await getPublicConfig();
  if (remote) setCachedConfig(remote);
  return remote;
}
