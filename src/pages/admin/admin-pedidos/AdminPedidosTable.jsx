import AdminButton from "../../../components/admin/ui/AdminButton.jsx";
import {
  adminTheme,
  subtleBadgeStyle,
  softPanelStyle,
} from "../../../components/admin/ui/adminTheme.js";
import {
  elapsedStyle,
  fmtDateTime,
  money,
  statusPillStyle,
} from "./adminPedidos.utils.js";
import { createClientId } from "../../../utils/id.js";

function getRawEstado(pedido = {}) {
  return String(
    pedido.estatus ||
      pedido.estado ||
      pedido.status ||
      pedido.pedido_estatus ||
      "PENDIENTE",
  )
    .trim()
    .toUpperCase();
}

function getEstadoUi(pedido = {}) {
  const raw = getRawEstado(pedido);

  if (raw === "PENDIENTE") return "PENDIENTE";

  if (
    [
      "CONFIRMADO",
      "EN_PREPARACION",
      "EN_PREPARACIÓN",
      "EN_PROCESO",
      "PREPARANDO",
      "LISTO",
    ].includes(raw)
  ) {
    return "PREPARANDO";
  }

  if (["EN_CAMINO", "EN_ENTREGA", "EN_REPARTO"].includes(raw)) {
    return "EN_ENTREGA";
  }

  if (["ENTREGADO", "COMPLETADO"].includes(raw)) return "COMPLETADO";

  if (["CANCELADO", "CANCELADA"].includes(raw)) return "CANCELADO";

  return raw || "PENDIENTE";
}

function getEstadoLabel(pedido = {}) {
  const estado = getEstadoUi(pedido);

  const labels = {
    PENDIENTE: "PENDIENTE",
    PREPARANDO: "PREPARANDO",
    EN_ENTREGA: "EN ENTREGA",
    COMPLETADO: "COMPLETADO",
    CANCELADO: "CANCELADO",
  };

  return labels[estado] || estado;
}

function getFechaPedido(pedido = {}) {
  return (
    pedido.created_at ||
    pedido.createdAt ||
    pedido.created ||
    pedido.fecha ||
    pedido.updated_at ||
    null
  );
}

function getClienteNombre(pedido = {}) {
  return (
    pedido.cliente?.nombre_completo ||
    [pedido.cliente_nombres, pedido.cliente_paterno, pedido.cliente_materno]
      .filter(Boolean)
      .join(" ") ||
    pedido.nombre_cliente ||
    pedido.cliente_nombre ||
    "Cliente no registrado"
  );
}

function getContactoCliente(pedido = {}) {
  return (
    pedido.cliente?.telefono ||
    pedido.cliente_telefono ||
    pedido.telefono ||
    pedido.cliente?.email ||
    pedido.cliente_email ||
    pedido.email ||
    "—"
  );
}

function getEntregaTexto(pedido = {}) {
  const tipo =
    pedido.tipo_pedido || pedido.tipo_entrega || pedido.metodo_entrega;
  const direccion = pedido.direccion_entrega || pedido.direccion;

  if (direccion) return direccion;
  if (tipo) return tipo;

  return "—";
}

function metodoPagoLabelFromCode(code) {
  const finalCode = String(code || "")
    .trim()
    .toUpperCase();

  if (finalCode === "EFECTIVO") return "Efectivo";
  if (finalCode === "TARJETA") return "Tarjeta crédito/débito";
  if (finalCode === "TRANSFERENCIA") return "Transferencia";

  return "";
}

function getPagoTexto(pedido = {}) {
  const transaccion = pedido.transaccion || {};

  const metodo =
    pedido.metodo_pago ||
    pedido.metodo_pago_nombre ||
    metodoPagoLabelFromCode(transaccion.metodo_codigo) ||
    metodoPagoLabelFromCode(pedido.metodo_codigo) ||
    "—";

  let estatus = "PENDIENTE";

  if (pedido.pagado === true) {
    estatus = "PAGADO";
  } else if (String(transaccion.estatus || "").toUpperCase() === "APROBADA") {
    estatus = "APROBADA";
  } else if (pedido.pago_estatus) {
    estatus = pedido.pago_estatus;
  } else if (transaccion.estatus) {
    estatus = transaccion.estatus;
  }

  return {
    metodo,
    estatus,
  };
}

function buildElapsed(pedido = {}) {
  if (pedido?.elapsed && typeof pedido.elapsed === "object") {
    return {
      tone: pedido.elapsed.tone || "neutral",
      label: pedido.elapsed.label || "Sin hora",
    };
  }

  const dateValue = getFechaPedido(pedido);
  const date = dateValue ? new Date(dateValue) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return { tone: "neutral", label: "Sin hora" };
  }

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));

  if (minutes < 1) return { tone: "success", label: "Ahora" };

  if (minutes < 60) {
    return {
      tone: minutes >= 45 ? "danger" : minutes >= 25 ? "accent" : "success",
      label: `${minutes} min`,
    };
  }

  const hours = Math.floor(minutes / 60);

  return {
    tone: hours >= 2 ? "danger" : "accent",
    label: `${hours} h ${minutes % 60} min`,
  };
}

function neutralizePill(base = {}, fallbackTone = "default") {
  const tones = {
    success: subtleBadgeStyle("success"),
    info: subtleBadgeStyle("info"),
    accent: subtleBadgeStyle("accent"),
    danger: subtleBadgeStyle("danger"),
    default: subtleBadgeStyle("default"),
  };

  const bg = String(base.background || "").toLowerCase();

  let tone = fallbackTone;

  if (bg.includes("dcfce7") || bg.includes("166534")) tone = "success";
  else if (bg.includes("dbeafe") || bg.includes("1d4ed8")) tone = "info";
  else if (bg.includes("fef3c7") || bg.includes("92400e")) tone = "accent";
  else if (bg.includes("fee2e2") || bg.includes("991b1b")) tone = "danger";

  return tones[tone];
}

function canSendToDelivery(pedido = {}) {
  const raw = getRawEstado(pedido);

  return [
    "CONFIRMADO",
    "EN_PREPARACION",
    "EN_PREPARACIÓN",
    "EN_PROCESO",
    "PREPARANDO",
    "LISTO",
  ].includes(raw);
}

function isMlEligibleOrder(pedido = {}) {
  const estado = getEstadoUi(pedido);

  if (["COMPLETADO", "CANCELADO"].includes(estado)) {
    return false;
  }

  const tipo = String(
    pedido.tipo_pedido ||
      pedido.tipo_entrega ||
      pedido.metodo_entrega ||
      "",
  )
    .trim()
    .toLowerCase();

  const hasDeliveryAddress = Boolean(
    String(pedido.direccion_entrega || pedido.direccion || "").trim(),
  );

  return tipo.includes("domic") || hasDeliveryAddress;
}

function getRiskDisplay(entry, loading, pedido = {}) {
  if (!isMlEligibleOrder(pedido)) {
    return {
      label: "No aplica",
      detail: "",
      background: "#f1f5f9",
      color: "#475569",
      border: "#e2e8f0",
    };
  }

  if (loading) {
    return {
      label: "Calculando...",
      detail: "",
      background: "#eff6ff",
      color: "#1d4ed8",
      border: "#bfdbfe",
    };
  }

  if (!entry) {
    return {
      label: "Pendiente",
      detail: "",
      background: "#f8fafc",
      color: "#64748b",
      border: "#e2e8f0",
    };
  }

  if (entry.ok === false) {
    return {
      label: "Sin conexion",
      detail: entry.error || "",
      background: "#fff1f2",
      color: "#be123c",
      border: "#fecdd3",
    };
  }

  const payload = entry.data || {};
  const prediction = payload.prediction || payload;
  const probability = Number(prediction.probabilidad_tarde);

  if (!Number.isFinite(probability)) {
    return {
      label: prediction.clase || "Sin resultado",
      detail: "",
      background: "#f8fafc",
      color: "#64748b",
      border: "#e2e8f0",
    };
  }

  const percent = `${(probability * 100).toFixed(0)}%`;

  if (probability >= 0.7) {
    return {
      label: `Alto ${percent}`,
      detail: prediction.accion_sugerida || "",
      background: "#fee2e2",
      color: "#991b1b",
      border: "#fecaca",
    };
  }

  if (probability >= 0.45) {
    return {
      label: `Medio ${percent}`,
      detail: prediction.accion_sugerida || "",
      background: "#fef3c7",
      color: "#92400e",
      border: "#fde68a",
    };
  }

  return {
    label: `Bajo ${percent}`,
    detail: prediction.accion_sugerida || "",
    background: "#dcfce7",
    color: "#166534",
    border: "#bbf7d0",
  };
}
export default function AdminPedidosTable({
  items = [],
  page,
  totalPages,
  setPage,
  start,
  end,
  total,
  onOpen,
  onEnviar,
  updatingId,
  riskByPedido = {},
  riskLoadingByPedido = {},
}) {
  if (!Array.isArray(items) || items.length === 0) {
    return (
      <section style={softPanelStyle({ padding: 20, background: "#fff" })}>
        <h3 style={{ margin: 0, color: adminTheme.colors.text }}>
          Sin pedidos
        </h3>
        <p style={{ margin: "8px 0 0", color: adminTheme.colors.textSoft }}>
          No hay resultados para los filtros actuales.
        </p>
      </section>
    );
  }

  return (
    <section style={softPanelStyle({ padding: 18, background: "#fff" })}>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{ width: "100%", borderCollapse: "collapse", minWidth: 1180 }}
        >
          <thead>
            <tr>
              {[
                "Folio",
                "Cliente",
                "Fecha",
                "Entrega",
                "Estado",
                "Pago",
                "Tiempo",
                "Riesgo ML",
                "Total",
                "Acciones",
              ].map((label) => (
                <th
                  key={label}
                  style={{
                    textAlign: "left",
                    padding: "14px 10px",
                    fontSize: 12,
                    color: adminTheme.colors.textMuted,
                    borderBottom: `1px solid ${adminTheme.colors.border}`,
                    textTransform: "uppercase",
                    letterSpacing: ".04em",
                  }}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {items.map((pedido) => {
              const elapsed = buildElapsed(pedido);
              const estado = getEstadoUi(pedido);
              const pago = getPagoTexto(pedido);
              const canSend = canSendToDelivery(pedido);
              const pedidoId = String(pedido?.id || "");
              const riskEntry = riskByPedido[pedidoId];
              const riskDisplay = getRiskDisplay(
                riskEntry,
                Boolean(riskLoadingByPedido[pedidoId]),
                pedido,
              );

              return (
                <tr
                  key={
                    pedido?.id || pedido?.folio || createClientId("pedido-row")
                  }
                >
                  <td style={tdStyle}>
                    <strong>#{pedido?.folio || pedido?.id || "—"}</strong>
                  </td>

                  <td style={tdStyle}>
                    <strong>{getClienteNombre(pedido)}</strong>
                    <div style={mutedStyle}>{getContactoCliente(pedido)}</div>
                  </td>

                  <td style={tdStyle}>{fmtDateTime(getFechaPedido(pedido))}</td>

                  <td style={tdStyle}>
                    <div style={ellipsisStyle}>{getEntregaTexto(pedido)}</div>
                  </td>

                  <td style={tdStyle}>
                    <span
                      style={neutralizePill(
                        statusPillStyle(estado),
                        estado === "CANCELADO"
                          ? "danger"
                          : estado === "COMPLETADO"
                            ? "success"
                            : estado === "EN_ENTREGA"
                              ? "info"
                              : "accent",
                      )}
                    >
                      {getEstadoLabel(pedido)}
                    </span>
                  </td>

                  <td style={tdStyle}>
                    <strong>{pago.metodo}</strong>
                    <div style={mutedStyle}>{pago.estatus}</div>
                  </td>

                  <td style={tdStyle}>
                    <span
                      style={neutralizePill(
                        elapsedStyle(elapsed.tone),
                        "default",
                      )}
                    >
                      {elapsed.label}
                    </span>
                  </td>

                  <td style={tdStyle}>
                    <span
                      title={riskDisplay.detail || riskDisplay.label}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: 28,
                        padding: "5px 9px",
                        borderRadius: 999,
                        background: riskDisplay.background,
                        color: riskDisplay.color,
                        border: `1px solid ${riskDisplay.border}`,
                        fontSize: 11,
                        fontWeight: 900,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {riskDisplay.label}
                    </span>
                  </td>
                  <td style={tdStyle}>{money(pedido?.total)}</td>

                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <AdminButton
                        variant="secondary"
                        size="sm"
                        onClick={() => onOpen?.(pedido?.id)}
                      >
                        Ver detalle
                      </AdminButton>

                      <AdminButton
                        size="sm"
                        onClick={() => onEnviar?.(pedido)}
                        disabled={!canSend}
                        loading={updatingId === pedido?.id}
                        loadingText="Enviando..."
                      >
                        En entrega
                      </AdminButton>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginTop: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ color: adminTheme.colors.textSoft, fontSize: 14 }}>
          Mostrando {total ? start : 0}–{end} de {total}
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <AdminButton
            variant="secondary"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1}
          >
            Anterior
          </AdminButton>

          <div style={subtleBadgeStyle("default")}>
            Página {page} de {totalPages}
          </div>

          <AdminButton
            variant="secondary"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages}
          >
            Siguiente
          </AdminButton>
        </div>
      </div>
    </section>
  );
}

const tdStyle = {
  padding: "14px 10px",
  borderBottom: `1px solid ${adminTheme.colors.border}`,
  verticalAlign: "top",
  fontSize: 14,
  color: adminTheme.colors.text,
};

const mutedStyle = {
  color: adminTheme.colors.textSoft,
  fontSize: 12,
  marginTop: 4,
};

const ellipsisStyle = {
  maxWidth: 260,
  color: adminTheme.colors.text,
  fontSize: 13,
  lineHeight: 1.35,
};
