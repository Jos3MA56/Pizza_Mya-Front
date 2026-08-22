import { httpJson, buildApiUrl } from "./http.js";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const adminPrediccionInsumosApi = {
  overview: ({
    token,
    escala = "semana",
    fechaInicio,
    fechaFin,
    vista = "semana",
    periodos,
  } = {}) => {
    const params = new URLSearchParams({ escala, vista });

    if (fechaInicio) params.append("fechaInicio", fechaInicio);
    if (fechaFin) params.append("fechaFin", fechaFin);
    if (periodos != null) params.append("periodos", String(periodos));

    const url = buildApiUrl(
      `/api/admin/prediccion-insumos/overview?${params.toString()}`,
    );

    return httpJson(url, {
      method: "GET",
      headers: authHeaders(token),
    });
  },
};
