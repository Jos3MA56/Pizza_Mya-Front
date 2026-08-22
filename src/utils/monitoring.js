const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function buildMonitoringUrl(path = "") {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

function readSessionUser() {
  try {
    const raw = localStorage.getItem("pmya_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getSessionRole(user) {
  return user?.rol || user?.role || user?.tipo || user?.perfil || null;
}

export function shouldSkipMonitoringUrl(url = "") {
  return String(url).includes("/api/monitoreo/");
}

export async function sendMonitoringEvent(path, payload = {}) {
  const sessionUser = readSessionUser();

  try {
    const body = JSON.stringify({
      ...payload,
      pathname: window.location.pathname,
      search: window.location.search,
      userAgent: navigator.userAgent,
      time: new Date().toISOString(),
      sessionUserId: sessionUser?.id || null,
      sessionRole: getSessionRole(sessionUser),
    });

    await fetch(buildMonitoringUrl(path), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: body.length < 60000,
      body,
    });
  } catch {
    // El monitoreo nunca debe romper la experiencia del usuario.
  }
}

export function reportUiCrash(error, info) {
  return sendMonitoringEvent("/api/monitoreo/frontend-error", {
    message: error?.message || "UI Crash",
    stack: error?.stack || null,
    componentStack: info?.componentStack || null,
  });
}

export function reportUnhandledError(event) {
  const error = event?.error;

  return sendMonitoringEvent("/api/monitoreo/frontend-error", {
    message: error?.message || event?.message || "Unhandled error",
    stack: error?.stack || null,
  });
}

export function reportUnhandledRejection(event) {
  const reason = event?.reason;

  return sendMonitoringEvent("/api/monitoreo/frontend-error", {
    message:
      reason?.message ||
      (typeof reason === "string" ? reason : "Unhandled promise rejection"),
    stack: reason?.stack || null,
  });
}

export function reportApiFailure(payload = {}) {
  const apiUrl = String(payload.apiUrl || payload.url || "");

  if (!apiUrl || shouldSkipMonitoringUrl(apiUrl)) {
    return Promise.resolve();
  }

  return sendMonitoringEvent("/api/monitoreo/frontend-api-error", {
    apiUrl,
    status: payload.status ?? null,
    message: payload.message || "API request failed",
    responseBody: payload.responseBody || null,
  });
}
