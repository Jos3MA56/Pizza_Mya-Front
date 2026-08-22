import { buildApiUrl, httpJson } from "./http.js";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const adminLegalApi = {
  list: ({ token }) =>
    httpJson(buildApiUrl("/api/admin/legal"), {
      headers: authHeaders(token),
    }),

  get: ({ token, slug }) =>
    httpJson(buildApiUrl(`/api/admin/legal/${slug}`), {
      headers: authHeaders(token),
    }),

  update: ({ token, slug, data }) =>
    httpJson(buildApiUrl(`/api/admin/legal/${slug}`), {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    }),
};
