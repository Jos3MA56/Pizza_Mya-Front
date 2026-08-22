import { httpJson, buildApiUrl } from "./http.js";

async function authFetch(path, { method = "GET", token, body } = {}) {
  return httpJson(buildApiUrl(path), {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

export const adminConfigApi = {
  get: ({ token }) => authFetch("/api/admin/config", { token }),

  update: ({ token, data }) =>
    authFetch("/api/admin/config", {
      method: "PUT",
      token,
      body: data,
    }),

  changePassword: ({ token, userId, newPassword }) =>
    authFetch(`/api/admin/usuarios/${userId}`, {
      method: "PATCH",
      token,
      body: { password: newPassword },
    }),
};
