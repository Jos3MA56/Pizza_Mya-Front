import { apiFetch } from "./cliente.js";
import { assertIdempotencyKey } from "../utils/idempotency.js";

export const ordersApi = {
  create(body, idempotencyKey) {
    const key = assertIdempotencyKey(
      idempotencyKey,
      "No se pudo generar la clave segura del pedido",
    );

    return apiFetch("/api/orders", {
      method: "POST",
      auth: true,
      headers: { "Idempotency-Key": key },
      body: { ...(body || {}), idempotency_key: key },
    });
  },

  my() {
    return apiFetch("/api/orders/my", { auth: true });
  },

  detail(id) {
    return apiFetch(`/api/orders/${id}`, { auth: true });
  },

  cancel(id, motivo = "") {
    return apiFetch(`/api/orders/${id}/cancel`, {
      method: "PATCH",
      body: { motivo },
      auth: true,
    });
  },
};
