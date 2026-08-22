import { apiFetch } from "./cliente.js";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function normalizeComboPayload(payload = {}) {
  return {
    nombre: String(payload.nombre || "").trim(),
    descripcion: String(payload.descripcion || "").trim() || null,
    precio_combo: Number(payload.precio_combo || 0),
    imagen_url: String(payload.imagen_url || "").trim() || null,
    orden: Number(payload.orden || 0),
    activo: Boolean(payload.activo ?? true),
  };
}

function normalizeDias(dias = []) {
  return [
    ...new Set(
      (Array.isArray(dias) ? dias : [])
        .map((d) => Number(d))
        .filter((d) => Number.isInteger(d) && d >= 1 && d <= 7),
    ),
  ].sort((a, b) => a - b);
}

function normalizeItems(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item) => ({
      producto_id: String(item.producto_id || ""),
      producto_tamanio_id: item.producto_tamanio_id
        ? String(item.producto_tamanio_id)
        : null,
      cantidad: parseInt(item.cantidad || 1, 10),
    }))
    .filter((item) => item.producto_id && item.cantidad > 0);
}

export const adminCombosApi = {
  async list(token) {
    const data = await apiFetch("/api/admin/combos", {
      auth: false,
      headers: authHeaders(token),
    });

    return Array.isArray(data) ? data : [];
  },

  async detail(token, id) {
    return apiFetch(`/api/admin/combos/${id}`, {
      auth: false,
      headers: authHeaders(token),
    });
  },

  async createBase(token, payload) {
    return apiFetch("/api/admin/combos", {
      method: "POST",
      auth: false,
      headers: authHeaders(token),
      body: normalizeComboPayload(payload),
    });
  },

  async updateBase(token, id, payload) {
    return apiFetch(`/api/admin/combos/${id}`, {
      method: "PATCH",
      auth: false,
      headers: authHeaders(token),
      body: normalizeComboPayload(payload),
    });
  },

  async disable(token, id) {
    return apiFetch(`/api/admin/combos/${id}/disable`, {
      method: "PATCH",
      auth: false,
      headers: authHeaders(token),
    });
  },

  async enable(token, id) {
    return apiFetch(`/api/admin/combos/${id}/enable`, {
      method: "PATCH",
      auth: false,
      headers: authHeaders(token),
    });
  },

  async setDays(token, comboId, dias) {
    return apiFetch(`/api/admin/combos/${comboId}/dias`, {
      method: "PUT",
      auth: false,
      headers: authHeaders(token),
      body: { dias: normalizeDias(dias) },
    });
  },

  async addItem(token, comboId, item) {
    return apiFetch(`/api/admin/combos/${comboId}/items`, {
      method: "POST",
      auth: false,
      headers: authHeaders(token),
      body: {
        producto_id: String(item.producto_id),
        producto_tamanio_id: item.producto_tamanio_id
          ? String(item.producto_tamanio_id)
          : null,
        cantidad: parseInt(item.cantidad || 1, 10),
      },
    });
  },

  async removeItem(token, comboId, comboItemId) {
    return apiFetch(`/api/admin/combos/${comboId}/items/${comboItemId}`, {
      method: "DELETE",
      auth: false,
      headers: authHeaders(token),
    });
  },

  async createFull(token, payload) {
    return apiFetch("/api/admin/combos", {
      method: "POST",
      auth: false,
      headers: authHeaders(token),
      body: {
        ...normalizeComboPayload(payload),
        dias: normalizeDias(payload?.dias || [1, 2, 3, 4, 5, 6, 7]),
        items: normalizeItems(payload?.items || []),
      },
    });
  },

  async updateFull(token, comboId, payload) {
    return apiFetch(`/api/admin/combos/${comboId}`, {
      method: "PATCH",
      auth: false,
      headers: authHeaders(token),
      body: {
        ...normalizeComboPayload(payload),
        dias: normalizeDias(payload?.dias || [1, 2, 3, 4, 5, 6, 7]),
        items: normalizeItems(payload?.items || []),
      },
    });
  },
};
