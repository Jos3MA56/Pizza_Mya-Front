import { useEffect, useMemo, useState } from "react";
import Modal from "../../../components/ui/Modal.jsx";
import Button from "../../../components/ui/Button.jsx";
import { fmtDateTime, money, normalizeEstado } from "./cajeroPedidos.utils.js";

function ItemExtras({ extras }) {
  if (!Array.isArray(extras) || extras.length === 0) return null;
  return (
    <ul style={styles.extraList}>
      {extras.map((extra, index) => (
        <li key={`${extra.id || extra.nombre || index}`}>
          {extra.nombre || "Extra"} × {extra.cantidad || 1}
        </li>
      ))}
    </ul>
  );
}

function normalizeCode(value) {
  return String(value || "").trim().toUpperCase();
}

export default function CajeroPedidoDetalleModal({
  open,
  pedido,
  metodosPago = [],
  onClose,
  onPagar,
  loading,
}) {
  const estado = normalizeEstado(pedido?.estatus || pedido?.estado);
  const [metodoId, setMetodoId] = useState("");
  const [montoRecibido, setMontoRecibido] = useState("");
  const [referencia, setReferencia] = useState("");
  const [tipoTarjeta, setTipoTarjeta] = useState("DEBITO");
  const [codigoAutorizacion, setCodigoAutorizacion] = useState("");
  const [localError, setLocalError] = useState("");

  const metodoSeleccionado = useMemo(
    () => metodosPago.find((metodo) => String(metodo.id) === String(metodoId)),
    [metodoId, metodosPago],
  );
  const metodoCodigo = normalizeCode(
    metodoSeleccionado?.codigo || metodoSeleccionado?.nombre,
  );
  const total = Number(pedido?.total || 0);
  const recibido = Number(montoRecibido || 0);
  const cambio = metodoCodigo.includes("EFECTIVO") && recibido >= total
    ? Number((recibido - total).toFixed(2))
    : 0;

  useEffect(() => {
    if (!open) return;
    const preferido = metodosPago.find((metodo) => {
      const code = normalizeCode(metodo.codigo || metodo.nombre);
      return code.includes("EFECTIVO");
    }) || metodosPago[0];

    setMetodoId(preferido?.id ? String(preferido.id) : "");
    setMontoRecibido(pedido?.total ? String(pedido.total) : "");
    setReferencia("");
    setTipoTarjeta("DEBITO");
    setCodigoAutorizacion("");
    setLocalError("");
  }, [open, pedido?.id, pedido?.total, metodosPago]);

  const submitPayment = async () => {
    setLocalError("");
    if (!metodoSeleccionado) {
      setLocalError("Selecciona un método de pago válido.");
      return;
    }

    const payload = {
      metodo_pago_id: metodoSeleccionado.id,
    };

    if (metodoCodigo.includes("EFECTIVO")) {
      if (!Number.isFinite(recibido) || recibido < total) {
        setLocalError("El monto recibido debe ser igual o mayor al total.");
        return;
      }
      payload.monto_recibido = recibido;
    } else if (metodoCodigo.includes("TRANSFER")) {
      if (referencia.trim().length < 6) {
        setLocalError("Captura la referencia o clave de rastreo de la transferencia.");
        return;
      }
      payload.referencia = referencia.trim();
    } else if (metodoCodigo.includes("TARJETA")) {
      if (codigoAutorizacion.trim().length < 4) {
        setLocalError("Captura el código de autorización de la terminal.");
        return;
      }
      payload.tipo_tarjeta = tipoTarjeta;
      payload.codigo_autorizacion = codigoAutorizacion.trim();
    }

    try {
      await onPagar(payload);
    } catch {
      // El hook muestra el error del backend; el modal permanece abierto.
    }
  };

  return (
    <Modal
      open={open}
      title={pedido?.folio || "Detalle del pedido"}
      onClose={onClose}
      size="lg"
    >
      {!pedido ? null : (
        <div style={styles.container}>
          <div style={styles.topGrid}>
            <div style={styles.panel}>
              <h3 style={styles.sectionTitle}>Información general</h3>
              <div style={styles.row}>
                <strong>Cliente:</strong>{" "}
                {pedido.cliente?.nombre_completo || pedido.nombre_cliente || "—"}
              </div>
              <div style={styles.row}>
                <strong>Teléfono:</strong>{" "}
                {pedido.cliente?.telefono || pedido.telefono || "—"}
              </div>
              <div style={styles.row}>
                <strong>Fecha:</strong>{" "}
                {fmtDateTime(pedido.created_at || pedido.fecha || pedido.fecha_creacion)}
              </div>
              <div style={styles.row}><strong>Estado:</strong> {estado}</div>
              <div style={styles.row}>
                <strong>Entrega:</strong>{" "}
                {pedido.tipo_entrega || pedido.metodo_entrega || "—"}
              </div>
              <div style={styles.row}>
                <strong>Dirección:</strong>{" "}
                {pedido.direccion_entrega || pedido.direccion || "—"}
              </div>
              {pedido.notas ? (
                <div style={styles.note}><strong>Notas:</strong> {pedido.notas}</div>
              ) : null}
            </div>

            <div style={styles.panel}>
              <h3 style={styles.sectionTitle}>Cobro seguro en caja</h3>
              <div style={styles.kpi}><span>Subtotal</span><strong>{money(pedido.subtotal || pedido.total)}</strong></div>
              <div style={styles.kpi}><span>Envío</span><strong>{money(pedido.costo_envio || 0)}</strong></div>
              <div style={{ ...styles.kpi, fontSize: 18 }}><span>Total</span><strong>{money(pedido.total)}</strong></div>

              <label style={styles.label} htmlFor="cashier-payment-method">Método de pago</label>
              <select
                id="cashier-payment-method"
                style={styles.input}
                value={metodoId}
                onChange={(event) => {
                  setMetodoId(event.target.value);
                  setLocalError("");
                }}
                disabled={loading}
              >
                <option value="">Selecciona un método</option>
                {metodosPago.map((metodo) => (
                  <option key={metodo.id} value={metodo.id}>{metodo.nombre}</option>
                ))}
              </select>

              {metodoCodigo.includes("EFECTIVO") ? (
                <>
                  <label style={styles.label} htmlFor="cashier-received">Monto recibido</label>
                  <input
                    id="cashier-received"
                    style={styles.input}
                    type="number"
                    min={total}
                    step="0.01"
                    value={montoRecibido}
                    onChange={(event) => setMontoRecibido(event.target.value)}
                    disabled={loading}
                  />
                  <div style={styles.changeBox}>
                    <span>Cambio</span><strong>{money(cambio)}</strong>
                  </div>
                </>
              ) : null}

              {metodoCodigo.includes("TARJETA") ? (
                <>
                  <label style={styles.label} htmlFor="cashier-card-type">Tipo de tarjeta</label>
                  <select
                    id="cashier-card-type"
                    style={styles.input}
                    value={tipoTarjeta}
                    onChange={(event) => setTipoTarjeta(event.target.value)}
                    disabled={loading}
                  >
                    <option value="DEBITO">Débito</option>
                    <option value="CREDITO">Crédito</option>
                  </select>
                  <label style={styles.label} htmlFor="cashier-auth-code">Código de autorización</label>
                  <input
                    id="cashier-auth-code"
                    style={styles.input}
                    maxLength={100}
                    autoComplete="off"
                    value={codigoAutorizacion}
                    onChange={(event) => setCodigoAutorizacion(event.target.value)}
                    placeholder="Ej. 583920"
                    disabled={loading}
                  />
                  <p style={styles.help}>
                    Solo captura el código de la terminal. Nunca escribas número de tarjeta, CVV o fecha de vencimiento.
                  </p>
                </>
              ) : null}

              {metodoCodigo.includes("TRANSFER") ? (
                <>
                  <label style={styles.label} htmlFor="cashier-transfer-reference">Referencia o clave de rastreo</label>
                  <input
                    id="cashier-transfer-reference"
                    style={styles.input}
                    maxLength={180}
                    autoComplete="off"
                    value={referencia}
                    onChange={(event) => setReferencia(event.target.value)}
                    placeholder="Verificada en banca o comprobante"
                    disabled={loading}
                  />
                  <p style={styles.help}>
                    Confirma el abono antes de aprobar. La referencia queda protegida contra reutilización.
                  </p>
                </>
              ) : null}

              {localError ? <div style={styles.error}>{localError}</div> : null}

              <div style={styles.actionsWrap}>
                <Button
                  variant="success"
                  onClick={submitPayment}
                  loading={loading}
                  loadingText="Procesando..."
                  disabled={!metodoId || loading}
                >
                  Confirmar cobro
                </Button>
              </div>
            </div>
          </div>

          <div style={styles.panel}>
            <h3 style={styles.sectionTitle}>Productos</h3>
            {Array.isArray(pedido.items) && pedido.items.length > 0 ? (
              <div style={styles.itemsWrap}>
                {pedido.items.map((item, idx) => (
                  <div key={item.id || idx} style={styles.itemCard}>
                    <div style={styles.itemTop}>
                      <strong>{item.nombre || item.nombre_snapshot || "Producto"}</strong>
                      <strong>{money(item.total_item || (item.precio_unitario || 0) * (item.cantidad || 1))}</strong>
                    </div>
                    <div style={styles.itemMuted}>Cantidad: {item.cantidad || 1}</div>
                    <div style={styles.itemMuted}>Precio unitario: {money(item.precio_unitario)}</div>
                    {item.tamanio ? <div style={styles.itemMuted}>Tamaño: {item.tamanio}</div> : null}
                    {item.masa ? <div style={styles.itemMuted}>Masa: {item.masa}</div> : null}
                    {item.orilla ? <div style={styles.itemMuted}>Orilla: {item.orilla}</div> : null}
                    <ItemExtras extras={item.extras} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.empty}>No hay partidas en este pedido.</div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

const styles = {
  container: { display: "flex", flexDirection: "column", gap: 18 },
  topGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 },
  panel: { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 18, padding: 18 },
  sectionTitle: { margin: "0 0 14px", fontSize: 18 },
  row: { fontSize: 14, color: "#334155", marginBottom: 10, lineHeight: 1.45 },
  note: { marginTop: 12, padding: 12, borderRadius: 14, background: "#fff7ed", color: "#9a3412" },
  kpi: { display: "flex", justifyContent: "space-between", gap: 12, padding: "12px 0", borderBottom: "1px solid #e2e8f0" },
  label: { display: "block", marginTop: 14, marginBottom: 6, color: "#334155", fontSize: 13, fontWeight: 700 },
  input: { width: "100%", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: 12, padding: "11px 12px", background: "#fff", color: "#0f172a" },
  help: { margin: "8px 0 0", color: "#64748b", fontSize: 12, lineHeight: 1.45 },
  changeBox: { display: "flex", justifyContent: "space-between", marginTop: 10, padding: 12, borderRadius: 12, background: "#ecfdf5", color: "#166534" },
  error: { marginTop: 12, padding: 10, borderRadius: 12, background: "#fef2f2", color: "#b91c1c", fontSize: 13 },
  actionsWrap: { display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" },
  itemsWrap: { display: "grid", gap: 12 },
  itemCard: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 14 },
  itemTop: { display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 },
  itemMuted: { color: "#64748b", fontSize: 13, marginTop: 4 },
  extraList: { margin: "10px 0 0 18px", color: "#475569", fontSize: 13 },
  empty: { color: "#64748b", fontSize: 14 },
};
