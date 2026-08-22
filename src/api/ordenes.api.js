import { apiFetch } from "./cliente.js";
import { assertIdempotencyKey } from "../utils/idempotency.js";

export function confirmarPedido(payload, idempotencyKey) {
  const key = assertIdempotencyKey(
    idempotencyKey,
    "No se pudo generar la clave segura del pedido",
  );

  return apiFetch("/api/orders", {
    method: "POST",
    auth: true,
    headers: {
      "Idempotency-Key": key,
    },
    body: {
      ...(payload || {}),
      // Respaldo para proxies que eliminen encabezados personalizados.
      idempotency_key: key,
    },
  });
}

export function recuperarPedidoPorIdempotencia(idempotencyKey) {
  const key = assertIdempotencyKey(
    idempotencyKey,
    "La clave de recuperación del pedido no es válida",
  );

  return apiFetch(`/api/orders/idempotency/${encodeURIComponent(key)}`, {
    auth: true,
  });
}

export function fetchMisPedidos() {
  return apiFetch("/api/orders/my", { auth: true });
}

export function fetchPedidoById(id) {
  return apiFetch(`/api/orders/${id}`, { auth: true });
}

export function cancelarPedido(id, motivo = "") {
  return apiFetch(`/api/orders/${id}/cancel`, {
    method: "PATCH",
    body: { motivo },
    auth: true,
  });
}
