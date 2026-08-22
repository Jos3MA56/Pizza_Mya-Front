import { apiFetch } from "./cliente.js";

export const adminPedidosApi = {
  async list({ token, status, from, to } = {}) {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    const query = params.toString() ? `?${params.toString()}` : "";

    const data = await apiFetch(`/api/admin/orders${query}`, {
      auth: false,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    return Array.isArray(data) ? data : [];
  },

  async getById({ token, id } = {}) {
    return apiFetch(`/api/admin/orders/${id}`, {
      auth: false,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  /**
   * Cambia el estado de un pedido.
   * Acepta tanto `estado` como `estatus` para compatibilidad
   * con los dos hooks que lo usan.
   */
  async setEstado({ token, id, estado, estatus } = {}) {
    const status = estado || estatus;
    return apiFetch(`/api/admin/orders/${id}/status`, {
      method: "PATCH",
      auth: false,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: { status },
    });
  },

  // Alias usado por useAdminPedidos en hooks/admin/
  async updateStatus({ token, id, estatus } = {}) {
    return this.setEstado({ token, id, estatus });
  },
};
