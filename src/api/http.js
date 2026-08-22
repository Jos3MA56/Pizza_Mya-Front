import { reportApiFailure } from "../utils/monitoring.js";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const AUTH_STORAGE_KEYS = {
  token: "pmya_token",
  user: "pmya_user",
};

export class HttpError extends Error {
  constructor(status, message, body = null) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.body = body;
  }
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function getStoredToken() {
  return localStorage.getItem(AUTH_STORAGE_KEYS.token);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.user);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearStoredSession() {
  localStorage.removeItem(AUTH_STORAGE_KEYS.token);
  localStorage.removeItem(AUTH_STORAGE_KEYS.user);
}

export function buildApiUrl(path = "") {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

function isPublicAuthRoute(url = "") {
  const normalized = String(url).toLowerCase();

  return [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/api/auth/phone/send-code",
    "/api/auth/phone/verify-code",
  ].some((path) => normalized.includes(path));
}

function parseJsonSafe(text) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

function getDefaultErrorMessage(status) {
  if (status === 400) return "Solicitud inválida";
  if (status === 401) return "Sesión expirada o no autorizada";
  if (status === 403) return "Acceso denegado";
  if (status === 404) return "Recurso no encontrado";
  if (status === 409) return "Conflicto con la información enviada";
  if (status === 413) return "El archivo o contenido es demasiado grande";
  if (status === 415) return "Tipo de archivo no permitido";
  if (status === 422) return "No se pudo validar la información";
  if (status === 429) return "Demasiados intentos. Intenta más tarde.";
  if (status >= 500) return "Error interno del servidor";
  return "No se pudo procesar la solicitud";
}

function handleUnauthorized() {
  clearStoredSession();
  window.dispatchEvent(new Event("pmya_auth_changed"));

  const next = encodeURIComponent(
    window.location.pathname + window.location.search,
  );

  window.location.href = `/login?next=${next}`;
}

export async function httpJson(url, options = {}) {
  const skipUnauthorizedRedirect = options.skipUnauthorizedRedirect === true;
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  let response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch {
    await reportApiFailure({
      apiUrl: url,
      status: 0,
      message: "Error de conexión con el servidor",
    });

    throw new HttpError(0, "Error de conexión con el servidor", null);
  }

  const text = await response.text();
  const json = parseJsonSafe(text);

  if (!response.ok) {
    if (response.status >= 500 || response.status === 0) {
      await reportApiFailure({
        apiUrl: url,
        status: response.status,
        message:
          json?.message ||
          json?.error ||
          json?.detail ||
          getDefaultErrorMessage(response.status),
        responseBody: json,
      });
    }

    if (response.status === 401 && !isPublicAuthRoute(url)) {
      if (!skipUnauthorizedRedirect) {
        handleUnauthorized();
      }
      throw new HttpError(
        401,
        "Sesión expirada. Inicia sesión nuevamente.",
        json,
      );
    }

    const message =
      json?.message ||
      json?.error ||
      json?.detail ||
      getDefaultErrorMessage(response.status);

    throw new HttpError(response.status, message, json);
  }

  if (json && typeof json === "object" && "ok" in json && "data" in json) {
    return json.data;
  }

  return json;
}
