// src/api/catalogo.api.js
// Unificación: este archivo reemplaza a catalogo.api.js y categorias.api.js
// CatalogoPage y cualquier otro consumidor importan desde aquí.

import { httpJson, buildApiUrl } from "./http.js";

export const catalogApi = {
  categorias() {
    return httpJson(buildApiUrl("/api/categories"));
  },

  productos(params = {}) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(
        ([, v]) => v !== undefined && v !== null && v !== "",
      ),
    ).toString();

    return httpJson(buildApiUrl(`/api/products${qs ? `?${qs}` : ""}`));
  },

  // Alias usados por categorias.api.js (compatibilidad)
  categories() {
    return this.categorias();
  },

  product(id) {
    return httpJson(buildApiUrl(`/api/products/${id}`));
  },
};
