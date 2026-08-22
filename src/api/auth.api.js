import { apiFetch } from "./cliente.js";

export const authApi = {
  register(payload) {
    return apiFetch("/api/auth/register", {
      method: "POST",
      body: payload,
    });
  },

  login(payload) {
    return apiFetch("/api/auth/login", {
      method: "POST",
      body: payload,
    });
  },

  me(token) {
    return apiFetch("/api/auth/me", {
      auth: !token,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  forgotPassword({ email }) {
    return apiFetch("/api/auth/forgot-password", {
      method: "POST",
      body: { email },
    });
  },

  resetPassword({ token, password }) {
    return apiFetch("/api/auth/reset-password", {
      method: "POST",
      body: { token, password },
    });
  },

  sendPhoneCode({ phone, method = "whatsapp" }) {
    return apiFetch("/api/auth/phone/send-code", {
      method: "POST",
      body: { phone, method },
    });
  },

  verifyPhoneCode({ phone, code }) {
    return apiFetch("/api/auth/phone/verify-code", {
      method: "POST",
      body: { phone, code },
    });
  },
};
