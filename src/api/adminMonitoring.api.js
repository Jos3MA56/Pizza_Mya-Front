import { httpJson, buildApiUrl } from "./http.js";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const adminMonitoringApi = {
  overview: ({ token } = {}) =>
    httpJson(buildApiUrl("/api/admin/monitoreo/overview"), {
      method: "GET",
      headers: authHeaders(token),
    }),
};
