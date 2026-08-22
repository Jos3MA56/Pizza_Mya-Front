import { httpJson, buildApiUrl } from "./http.js";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function buildQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const value = query.toString();
  return value ? `?${value}` : "";
}

function get(token, path, params = {}) {
  return httpJson(
    buildApiUrl(`/api/admin/reportes${path}${buildQuery(params)}`),
    {
      method: "GET",
      headers: authHeaders(token),
    },
  );
}

export const adminReportesApi = {
  dashboard: ({ token, from, to } = {}) =>
    get(token, "/dashboard", { from, to }),

  ventas: ({ token, from, to, groupBy = "day" } = {}) =>
    get(token, "/ventas", { from, to, groupBy }),

  topProductos: ({ token, from, to, limit = 10 } = {}) =>
    get(token, "/top-productos", { from, to, limit }),

  topClientes: ({ token, from, to, limit = 10 } = {}) =>
    get(token, "/top-clientes", { from, to, limit }),

  metodosPago: ({ token, from, to } = {}) =>
    get(token, "/metodos-pago", { from, to }),

  horasPico: ({ token, from, to } = {}) =>
    get(token, "/horas-pico", { from, to }),

  estatus: ({ token, from, to } = {}) => get(token, "/estatus", { from, to }),

  tiposPedido: ({ token, from, to } = {}) =>
    get(token, "/tipos-pedido", { from, to }),
};
