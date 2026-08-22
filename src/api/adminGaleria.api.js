import { httpJson, buildApiUrl } from "./http.js";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function buildQuery(params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

export const adminGaleriaApi = {
  list: ({ token, q = "", visible, all = false } = {}) =>
    httpJson(
      buildApiUrl(`/api/admin/galeria${buildQuery({ q, visible, all })}`),
      {
        headers: authHeaders(token),
      },
    ),

  create: ({ token, data }) =>
    httpJson(buildApiUrl("/api/admin/galeria"), {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    }),

  update: ({ token, id, data }) =>
    httpJson(buildApiUrl(`/api/admin/galeria/${id}`), {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    }),

  setVisible: ({ token, id, visible }) =>
    httpJson(buildApiUrl(`/api/admin/galeria/${id}/visible`), {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify({ visible }),
    }),

  activate: ({ token, id }) =>
    httpJson(buildApiUrl(`/api/admin/galeria/${id}/activar`), {
      method: "PATCH",
      headers: authHeaders(token),
    }),

  deactivate: ({ token, id }) =>
    httpJson(buildApiUrl(`/api/admin/galeria/${id}/desactivar`), {
      method: "PATCH",
      headers: authHeaders(token),
    }),

  remove: ({ token, id }) =>
    httpJson(buildApiUrl(`/api/admin/galeria/${id}`), {
      method: "DELETE",
      headers: authHeaders(token),
    }),
};
