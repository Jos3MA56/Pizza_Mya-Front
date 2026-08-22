import { apiFetch } from "./cliente.js";

function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      search.set(key, String(value).trim());
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const adminTransaccionesApi = {
  list(filters = {}) {
    return apiFetch(`/api/admin/transacciones${buildQuery(filters)}`, {
      auth: true,
    });
  },

  approve(id, nota = "") {
    return apiFetch(`/api/admin/transacciones/${id}/aprobar`, {
      method: "PATCH",
      auth: true,
      body: { nota },
    });
  },

  reject(id, motivo = "") {
    return apiFetch(`/api/admin/transacciones/${id}/rechazar`, {
      method: "PATCH",
      auth: true,
      body: { motivo },
    });
  },

  paymentMethods() {
    return apiFetch("/api/admin/payment-methods", { auth: true });
  },
};
