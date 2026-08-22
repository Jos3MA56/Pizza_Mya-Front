import { apiFetch } from "./cliente.js";

export const direccionesApi = {
    list() {
        return apiFetch("/api/direcciones", { auth: true });
    },
    create(payload) {
        return apiFetch("/api/direcciones", { method: "POST", body: payload, auth: true });
    }
};
