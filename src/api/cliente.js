import { httpJson, buildApiUrl, getStoredToken } from "./http.js";

export async function apiFetch(
  path,
  { method = "GET", body, auth = false, headers = {}, signal } = {},
) {
  const token = getStoredToken();
  const hasBody = body !== undefined && body !== null;
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  return httpJson(buildApiUrl(path), {
    method,
    signal,
    headers: {
      ...headers,
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: hasBody ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });
}
