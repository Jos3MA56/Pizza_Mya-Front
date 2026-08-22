import { apiFetch } from "./cliente.js";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const adminCatalogosApi = {
  categorias: {
    list: (token) => apiFetch("/api/admin/categories", { auth: false, headers: authHeaders(token) }),
    create: (token, body) => apiFetch("/api/admin/categories", { method: "POST", auth: false, headers: authHeaders(token), body }),
    update: (token, id, body) => apiFetch(`/api/admin/categories/${id}`, { method: "PATCH", auth: false, headers: authHeaders(token), body }),
    disable: (token, id) => apiFetch(`/api/admin/categories/${id}/disable`, { method: "PATCH", auth: false, headers: authHeaders(token) }),
    enable: (token, id) => apiFetch(`/api/admin/categories/${id}`, { method: "PATCH", auth: false, headers: authHeaders(token), body: { activo: true } }),
  },

  tamanios: {
    list: (token) => apiFetch("/api/admin/tamanios", { auth: false, headers: authHeaders(token) }),
    create: (token, body) => apiFetch("/api/admin/tamanios", { method: "POST", auth: false, headers: authHeaders(token), body }),
    update: (token, id, body) => apiFetch(`/api/admin/tamanios/${id}`, { method: "PATCH", auth: false, headers: authHeaders(token), body }),
    disable: (token, id) => apiFetch(`/api/admin/tamanios/${id}/disable`, { method: "PATCH", auth: false, headers: authHeaders(token) }),
    enable: (token, id) => apiFetch(`/api/admin/tamanios/${id}/enable`, { method: "PATCH", auth: false, headers: authHeaders(token) }),
  },

  personalizacion: {
    list: (token, kind) => apiFetch(`/api/admin/personalizacion/${kind}`, { auth: false, headers: authHeaders(token) }),
    create: (token, kind, body) => apiFetch(`/api/admin/personalizacion/${kind}`, { method: "POST", auth: false, headers: authHeaders(token), body }),
    update: (token, kind, id, body) => apiFetch(`/api/admin/personalizacion/${kind}/${id}`, { method: "PATCH", auth: false, headers: authHeaders(token), body }),
    disable: (token, kind, id) => apiFetch(`/api/admin/personalizacion/${kind}/${id}/disable`, { method: "PATCH", auth: false, headers: authHeaders(token) }),
    enable: (token, kind, id) => apiFetch(`/api/admin/personalizacion/${kind}/${id}/enable`, { method: "PATCH", auth: false, headers: authHeaders(token) }),
  },

  productoPersonalizacion: {
    get: (token, productoId) => apiFetch(`/api/admin/productos/${productoId}/personalizacion`, { auth: false, headers: authHeaders(token) }),
    save: (token, productoId, body) => apiFetch(`/api/admin/productos/${productoId}/personalizacion`, { method: "PUT", auth: false, headers: authHeaders(token), body }),
  },
};
