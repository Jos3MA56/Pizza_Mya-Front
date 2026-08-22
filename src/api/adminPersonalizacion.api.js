import { apiFetch } from "./cliente.js";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const adminPersonalizacionApi = {
  listPizzas(token) {
    return apiFetch("/api/admin/personalizacion/pizzas", {
      auth: false,
      headers: authHeaders(token),
    });
  },

  getProducto(token, productoId) {
    return apiFetch(`/api/admin/productos/${productoId}/personalizacion`, {
      auth: false,
      headers: authHeaders(token),
    });
  },

  saveProducto(token, productoId, payload) {
    return apiFetch(`/api/admin/productos/${productoId}/personalizacion`, {
      method: "PUT",
      auth: false,
      headers: authHeaders(token),
      body: payload,
    });
  },
};
