import { apiFetch } from "./cliente.js";
import { buildApiUrl, getStoredToken, httpJson } from "./http.js";
import { assertIdempotencyKey } from "../utils/idempotency.js";

export const pagosApi = {
  metodos() {
    return apiFetch("/api/payment-methods");
  },

  iniciarCheckoutTarjeta(pedidoId, idempotencyKey) {
    const key = assertIdempotencyKey(
      idempotencyKey,
      "No se pudo generar la clave segura del pago",
    );

    return apiFetch(`/api/payments/orders/${pedidoId}/checkout`, {
      method: "POST",
      auth: true,
      headers: {
        "Idempotency-Key": key,
      },
      body: {
        // Respaldo para proxies que eliminen encabezados personalizados.
        idempotency_key: key,
      },
    });
  },

  estado(pedidoId, providerPaymentId = null) {
    const query = providerPaymentId
      ? `?payment_id=${encodeURIComponent(providerPaymentId)}`
      : "";

    return apiFetch(`/api/payments/orders/${pedidoId}/status${query}`, {
      auth: true,
    });
  },

  subirComprobanteTransferencia(file) {
    const formData = new FormData();
    formData.append("comprobante", file);
    const token = getStoredToken();

    return httpJson(buildApiUrl("/api/payments/transfer-proof/upload"), {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
  },

  enviarComprobanteTransferencia(pedidoId, payload) {
    return apiFetch(`/api/payments/orders/${pedidoId}/transfer-proof`, {
      method: "POST",
      auth: true,
      body: payload,
    });
  },
};
