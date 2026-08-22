import { apiFetch } from "./cliente.js";

export const productosApi = {
  getProductos(params = {}) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(
        ([, value]) => value !== undefined && value !== null && value !== "",
      ),
    ).toString();

    return apiFetch(`/api/products${qs ? `?${qs}` : ""}`);
  },

  getProducto(id) {
    return apiFetch(`/api/products/${id}`);
  },

  getOrillas() {
    return apiFetch("/api/orillas");
  },

  getExtras() {
    return apiFetch("/api/extras");
  },

  getMasas() {
    return apiFetch("/api/masas");
  },

  getSalsas() {
    return apiFetch("/api/salsas");
  },

  getIngredientesProducto(id) {
    return apiFetch(`/api/productos/${id}/ingredientes`);
  },

  getSalsasProducto(id) {
    return apiFetch(`/api/productos/${id}/salsas`);
  },

  getExtrasProducto(id) {
    return apiFetch(`/api/productos/${id}/extras`);
  },

  getPersonalizacionProducto(id) {
    return apiFetch(`/api/productos/${id}/personalizacion`);
  },
};
