import { buildApiUrl, httpJson } from "./http.js";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const adminMlApi = {
  classifyOrder({ token, pedidoId } = {}) {
    const id = String(pedidoId || "").trim();

    if (!id) {
      throw new Error("Selecciona un pedido para evaluar.");
    }

    return httpJson(
      buildApiUrl(`/api/ml/clasificacion/${encodeURIComponent(id)}`),
      {
        method: "GET",
        headers: authHeaders(token),
      },
    );
  },

  predictDailyPizzas({ token, fecha } = {}) {
    const value = String(fecha || "").trim();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new Error("Selecciona una fecha vÃ¡lida.");
    }

    const params = new URLSearchParams({ fecha: value });

    return httpJson(
      buildApiUrl(`/api/ml/regresion?${params.toString()}`),
      {
        method: "GET",
        headers: authHeaders(token),
      },
    );
  },
};
