import { httpJson, buildApiUrl } from "./http.js";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function mapClientPayload(cliente = {}) {
  const fullName = [cliente.nombres, cliente.paterno, cliente.materno]
    .filter(Boolean)
    .join(" ");

  return {
    id: cliente.id,
    nombres: cliente.nombres || "",
    paterno: cliente.paterno || "",
    materno: cliente.materno || "",
    nombreCompleto: fullName || cliente.email || "Cliente",
    email: cliente.email || "",
    telefono: cliente.telefono || "",
    rol: String(cliente.rol || "cliente").toLowerCase(),
    activo: cliente.activo ?? true,
    nacimiento: cliente.nacimiento || null,
    created_at: cliente.created_at || null,
    updated_at: cliente.updated_at || null,
    total_pedidos: Number(cliente.total_pedidos || 0),
    total_gastado: Number(cliente.total_gastado || 0),
    ticket_promedio: Number(cliente.ticket_promedio || 0),
    ultimo_pedido: cliente.ultimo_pedido || null,
    direccion_completa: cliente.direccion_completa || "",
  };
}

export const adminUsuariosApi = {
  list: async ({ token, search = "", onlyActive = false } = {}) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (onlyActive) params.set("onlyActive", "true");
    const query = params.toString();

    const data = await httpJson(
      buildApiUrl(`/api/admin/usuarios${query ? `?${query}` : ""}`),
      {
        method: "GET",
        headers: authHeaders(token),
      },
    );

    return Array.isArray(data) ? data.map(mapClientPayload) : [];
  },

  getById: async ({ token, id } = {}) => {
    const data = await httpJson(buildApiUrl(`/api/admin/usuarios/${id}`), {
      method: "GET",
      headers: authHeaders(token),
    });

    return {
      cliente: mapClientPayload(data?.cliente || {}),
      pedidos: Array.isArray(data?.pedidos)
        ? data.pedidos.map((pedido) => ({
            ...pedido,
            total: Number(pedido.total || 0),
            items_count: Number(pedido.items_count || 0),
          }))
        : [],
    };
  },

  getPedidos: ({ token, id } = {}) =>
    httpJson(buildApiUrl(`/api/admin/usuarios/${id}/pedidos`), {
      method: "GET",
      headers: authHeaders(token),
    }),

  create: ({ token, userData } = {}) =>
    httpJson(buildApiUrl("/api/admin/usuarios"), {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(userData || {}),
    }),

  update: ({ token, id, userData } = {}) =>
    httpJson(buildApiUrl(`/api/admin/usuarios/${id}`), {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(userData || {}),
    }),

  remove: ({ token, id } = {}) =>
    httpJson(buildApiUrl(`/api/admin/usuarios/${id}`), {
      method: "DELETE",
      headers: authHeaders(token),
    }),

  setEstado: ({ token, id, activo } = {}) =>
    httpJson(
      buildApiUrl(`/api/admin/usuarios/${id}/${activo ? "enable" : "disable"}`),
      {
        method: "PATCH",
        headers: authHeaders(token),
      },
    ),
};
