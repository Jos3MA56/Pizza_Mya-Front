import Modal from "../../../components/ui/Modal.jsx";
import { fmtDateTime, money } from "./adminPedidos.utils.js";

function safePedido(pedido) {
  return pedido && typeof pedido === "object" ? pedido : {};
}

function getClienteNombre(pedido) {
  const p = safePedido(pedido);

  return (
    p.cliente?.nombre_completo ||
    [p.cliente_nombres, p.cliente_paterno, p.cliente_materno]
      .filter(Boolean)
      .join(" ") ||
    p.nombre_cliente ||
    p.cliente_nombre ||
    "Cliente no registrado"
  );
}

function getClienteTelefono(pedido) {
  const p = safePedido(pedido);

  return p.cliente?.telefono || p.cliente_telefono || p.telefono || "—";
}

function getClienteCorreo(pedido) {
  const p = safePedido(pedido);

  return (
    p.cliente?.email || p.cliente_email || p.cliente?.correo || p.email || "—"
  );
}

function getFechaPedido(pedido) {
  const p = safePedido(pedido);

  return (
    p.created_at || p.createdAt || p.created || p.fecha || p.updated_at || null
  );
}

function getEstadoPedido(pedido) {
  const p = safePedido(pedido);

  return p.estatus || p.estado || p.status || "—";
}

function getTipoEntrega(pedido) {
  const p = safePedido(pedido);

  return p.tipo_pedido || p.tipo_entrega || p.metodo_entrega || "—";
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

function getMetodoPago(pedido) {
  const p = safePedido(pedido);

  return (
    p.metodo_pago ||
    p.metodo_pago_nombre ||
    metodoPagoLabelFromCode(p.transaccion?.metodo_codigo) ||
    metodoPagoLabelFromCode(p.metodo_codigo) ||
    "—"
  );
}

function getEstadoPago(pedido) {
  const p = safePedido(pedido);
  const txStatus = String(p.transaccion?.estatus || "").toUpperCase();

  if (p.pagado === true) return "PAGADO";
  if (txStatus === "APROBADA") return "APROBADA";
  if (p.pago_estatus) return p.pago_estatus;
  if (p.transaccion?.estatus) return p.transaccion.estatus;

  return "PENDIENTE";
}

function getReferenciaPago(pedido) {
  const p = safePedido(pedido);

  return p.referencia_pago || p.transaccion?.referencia || p.referencia || "—";
}

function getComprobanteUrl(pedido) {
  const p = safePedido(pedido);

  return p.transaccion?.comprobante_url || p.comprobante_url || "";
}

function getItemName(item = {}) {
  return (
    item.nombre ||
    item.nombre_snapshot ||
    item.producto_nombre ||
    item.producto?.nombre ||
    "Producto"
  );
}

function getItemTotal(item = {}) {
  return (
    Number(item.total_item || 0) ||
    Number(item.total || 0) ||
    Number(item.precio_unitario || 0) * Number(item.cantidad || 1)
  );
}

function getItemValue(item = {}, ...keys) {
  for (const key of keys) {
    if (item[key]) return item[key];
  }

  return "";
}

function renderExtras(item) {
  const extras = Array.isArray(item?.extras) ? item.extras : [];

  if (!extras.length) return null;

  return (
    <div style={styles.extraBlock}>
      <strong>Extras:</strong>

      <div style={styles.chips}>
        {extras.map((extra, index) => (
          <span key={extra.id || extra.extra_id || index} style={styles.chip}>
            {extra.nombre || extra.nombre_snapshot || "Extra"}{" "}
            {extra.cantidad ? `x${extra.cantidad}` : ""}
            {Number(extra.costo || extra.costo_snapshot || 0) > 0
              ? ` · ${money(extra.costo || extra.costo_snapshot)}`
              : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

function renderSinIngredientes(item) {
  const sin = Array.isArray(item?.sin) ? item.sin : [];

  if (!sin.length) return null;

  return (
    <div style={styles.extraBlock}>
      <strong>Sin:</strong>

      <div style={styles.chips}>
        {sin.map((ing, index) => (
          <span
            key={ing.ingrediente_id || ing.id || index}
            style={styles.chipMuted}
          >
            {ing.nombre ||
              ing.nombre_snapshot ||
              ing.ingrediente ||
              "Ingrediente"}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AdminPedidoDetalleModal({ open, pedido, onClose }) {
  const safe = safePedido(pedido);
  const comprobanteUrl = getComprobanteUrl(safe);

  return (
    <Modal
      open={open}
      title={safe?.folio ? `Pedido #${safe.folio}` : "Detalle del pedido"}
      onClose={onClose}
      size="lg"
    >
      {!safe?.id ? (
        <div style={styles.empty}>No se pudo cargar el detalle del pedido.</div>
      ) : (
        <div style={styles.container}>
          <div style={styles.grid}>
            <div style={styles.panel}>
              <h3 style={styles.title}>Información general</h3>

              <div style={styles.row}>
                <strong>Cliente:</strong> {getClienteNombre(safe)}
              </div>

              <div style={styles.row}>
                <strong>Teléfono:</strong> {getClienteTelefono(safe)}
              </div>

              <div style={styles.row}>
                <strong>Correo:</strong> {getClienteCorreo(safe)}
              </div>

              <div style={styles.row}>
                <strong>Fecha:</strong> {fmtDateTime(getFechaPedido(safe))}
              </div>

              <div style={styles.row}>
                <strong>Estado:</strong> {getEstadoPedido(safe)}
              </div>

              <div style={styles.row}>
                <strong>Tipo de entrega:</strong> {getTipoEntrega(safe)}
              </div>

              <div style={styles.row}>
                <strong>Dirección:</strong>{" "}
                {safe.direccion_entrega || safe.direccion || "—"}
              </div>

              {safe.notas ? (
                <div style={styles.note}>
                  <strong>Notas:</strong> {safe.notas}
                </div>
              ) : null}
            </div>

            <div style={styles.panel}>
              <h3 style={styles.title}>Resumen de cobro</h3>

              <div style={styles.kpi}>
                <span>Subtotal</span>
                <strong>{money(safe.subtotal || 0)}</strong>
              </div>

              <div style={styles.kpi}>
                <span>Envío</span>
                <strong>{money(safe.costo_envio || 0)}</strong>
              </div>

              {Number(safe.descuento || 0) > 0 ? (
                <div style={styles.kpi}>
                  <span>Descuento</span>
                  <strong>-{money(safe.descuento)}</strong>
                </div>
              ) : null}

              <div style={{ ...styles.kpi, fontSize: 18 }}>
                <span>Total</span>
                <strong>{money(safe.total || 0)}</strong>
              </div>

              <div style={styles.payBox}>
                <div>
                  <strong>Método de pago:</strong> {getMetodoPago(safe)}
                </div>

                <div>
                  <strong>Estado de pago:</strong> {getEstadoPago(safe)}
                </div>

                <div>
                  <strong>Referencia:</strong> {getReferenciaPago(safe)}
                </div>

                {comprobanteUrl ? (
                  <div>
                    <strong>Comprobante:</strong>{" "}
                    <a href={comprobanteUrl} target="_blank" rel="noreferrer">
                      Ver comprobante
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div style={styles.panel}>
            <h3 style={styles.title}>Partidas del pedido</h3>

            {Array.isArray(safe.items) && safe.items.length > 0 ? (
              <div style={styles.items}>
                {safe.items.map((item, index) => {
                  const masa = getItemValue(item, "masa_nombre", "masa");
                  const salsa = getItemValue(item, "salsa_nombre", "salsa");
                  const orilla = getItemValue(item, "orilla_nombre", "orilla");
                  const tamanio = getItemValue(
                    item,
                    "tamanio",
                    "producto_tamanio",
                  );

                  return (
                    <div key={item.id || index} style={styles.item}>
                      <div style={styles.itemHead}>
                        <strong>{getItemName(item)}</strong>
                        <strong>{money(getItemTotal(item))}</strong>
                      </div>

                      <div style={styles.muted}>
                        Cantidad: {item.cantidad || 1}
                      </div>

                      <div style={styles.muted}>
                        Precio unitario: {money(item.precio_unitario || 0)}
                      </div>

                      {tamanio ? (
                        <div style={styles.muted}>Tamaño: {tamanio}</div>
                      ) : null}

                      {masa ? (
                        <div style={styles.muted}>
                          Masa: {masa}
                          {Number(item.masa_costo || 0) > 0
                            ? ` · ${money(item.masa_costo)}`
                            : ""}
                        </div>
                      ) : null}

                      {salsa ? (
                        <div style={styles.muted}>
                          Salsa: {salsa}
                          {Number(item.salsa_costo || 0) > 0
                            ? ` · ${money(item.salsa_costo)}`
                            : ""}
                        </div>
                      ) : null}

                      {orilla ? (
                        <div style={styles.muted}>
                          Orilla: {orilla}
                          {Number(item.orilla_costo || 0) > 0
                            ? ` · ${money(item.orilla_costo)}`
                            : ""}
                        </div>
                      ) : null}

                      {renderExtras(item)}
                      {renderSinIngredientes(item)}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={styles.muted}>No hay productos para mostrar.</div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  empty: {
    padding: 18,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    color: "#64748b",
    fontWeight: 800,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
    gap: 18,
  },
  panel: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    padding: 18,
  },
  title: {
    margin: "0 0 14px",
    fontSize: 18,
  },
  row: {
    fontSize: 14,
    color: "#334155",
    marginBottom: 10,
    lineHeight: 1.45,
  },
  note: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    background: "#fff7ed",
    color: "#9a3412",
  },
  kpi: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "12px 0",
    borderBottom: "1px solid #e2e8f0",
  },
  payBox: {
    display: "grid",
    gap: 8,
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    background: "#fff",
    border: "1px solid #e2e8f0",
    color: "#334155",
    fontSize: 14,
    lineHeight: 1.45,
  },
  items: {
    display: "grid",
    gap: 12,
  },
  item: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 14,
  },
  itemHead: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
  },
  muted: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 4,
  },
  extraBlock: {
    marginTop: 10,
    color: "#334155",
    fontSize: 13,
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  chip: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "5px 9px",
    background: "#fff7ed",
    color: "#9a3412",
    border: "1px solid #fed7aa",
    fontSize: 12,
    fontWeight: 800,
  },
  chipMuted: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "5px 9px",
    background: "#f1f5f9",
    color: "#475569",
    border: "1px solid #e2e8f0",
    fontSize: 12,
    fontWeight: 800,
  },
};
