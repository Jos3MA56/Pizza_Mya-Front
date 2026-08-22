import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createClientId } from "../../utils/id.js";
import { cajeroApi } from "../../api/cajero.api.js";
import { useAuth } from "../../context/AuthContext.jsx";

// ─────────────────────────────────────────────
// Sub-componentes (sin cambios funcionales)
// ─────────────────────────────────────────────

function timeAgo(value) {
  const date = new Date(value || 0);
  if (Number.isNaN(date.getTime())) return "—";
  const diff = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Hace unos segundos";
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `Hace ${hours} h ${minutes % 60} min`;
}

function ToastNotifications({ toasts, onRemove }) {
  useEffect(() => {
    const timers = toasts.map((toast) =>
      setTimeout(() => onRemove(toast.id), 8000),
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, onRemove]);

  return (
    <div className="cj-toast-wrap">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`cj-toast cj-toast-${toast.tipo || "info"}`}
        >
          <div className="cj-toast-title">{toast.titulo}</div>
          <div className="cj-toast-msg">{toast.mensaje}</div>
        </div>
      ))}
    </div>
  );
}

function NotificationBell({ notifications, onOpen }) {
  const unread = notifications.filter((n) => !n.leida).length;
  return (
    <button
      className="cj-bell"
      onClick={onOpen}
      type="button"
      aria-label="Abrir notificaciones"
    >
      <span className="cj-bell-icon">🔔</span>
      {unread > 0 ? <span className="cj-bell-badge">{unread}</span> : null}
      <span className="cj-bell-text">
        {unread > 0 ? `${unread} nueva${unread > 1 ? "s" : ""}` : "Sin nuevas"}
      </span>
    </button>
  );
}

function NotificationPanel({ open, notifications, onClose }) {
  const unread = notifications.filter((n) => !n.leida).length;
  if (!open) return null;
  return (
    <div className="cj-notif-panel">
      <div className="cj-notif-head">
        <div>
          <strong>Notificaciones</strong>
          <div className="cj-notif-sub">
            {unread > 0
              ? `${unread} pendiente${unread > 1 ? "s" : ""} por revisar`
              : "Todo al día"}
          </div>
        </div>
        <button onClick={onClose} className="cj-notif-close" type="button">
          ✕
        </button>
      </div>
      {notifications.length === 0 ? (
        <p className="cj-empty">No hay notificaciones</p>
      ) : (
        <div className="cj-notif-list">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`cj-notif-item ${n.leida ? "" : "unread"}`}
            >
              <div className="cj-notif-title">{n.titulo}</div>
              <div className="cj-notif-msg">{n.mensaje}</div>
              <div className="cj-notif-time">
                {n.created_at
                  ? new Date(n.created_at).toLocaleString("es-MX")
                  : "—"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PedidoCard({ pedido, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cj-order-card ${active ? "active" : ""}`}
    >
      <div className="cj-order-top">
        <span className="cj-order-folio">#{pedido.folio}</span>
        <span
          className={`cj-status-badge st-${String(pedido.estatus || pedido.estado || "").toLowerCase()}`}
        >
          {pedido.estatus || pedido.estado || "PENDIENTE"}
        </span>
      </div>
      <div className="cj-order-client">
        {pedido.cliente?.nombre || pedido.cliente?.nombre_completo || "Cliente"}
      </div>
      <div className="cj-order-meta">
        <span>{pedido.pagado ? "Pagado" : "Pendiente pago"}</span>
        <span>
          {pedido.created_at
            ? new Date(pedido.created_at).toLocaleTimeString("es-MX", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "—"}
        </span>
      </div>
      <div className="cj-order-age">{timeAgo(pedido.created_at)}</div>
      <div className="cj-order-total">
        ${Number(pedido.total || 0).toFixed(2)}
      </div>
    </button>
  );
}

function PedidosSidebar({ pedidos, selectedId, onSelect }) {
  return (
    <aside className="cj-sidebar">
      <div className="cj-sidebar-head">
        <h3>Pedidos</h3>
        <span>{pedidos.length}</span>
      </div>
      <div className="cj-sidebar-list">
        {pedidos.length === 0 ? (
          <p className="cj-empty">No hay pedidos activos</p>
        ) : (
          pedidos.map((pedido) => (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              active={selectedId === pedido.id}
              onClick={() => onSelect(pedido.id)}
            />
          ))
        )}
      </div>
    </aside>
  );
}

function CajeroStats({ pedidos }) {
  const stats = useMemo(() => {
    const total = pedidos.length;
    const pendientes = pedidos.filter((p) =>
      ["PENDIENTE", "PENDING"].includes(
        String(p.estatus || p.estado || "").toUpperCase(),
      ),
    ).length;
    const enProceso = pedidos.filter((p) =>
      ["EN_PROCESO", "PREPARANDO", "EN_PREPARACION"].includes(
        String(p.estatus || p.estado || "").toUpperCase(),
      ),
    ).length;
    const retrasados = pedidos.filter((p) => {
      const created = new Date(p.created_at || 0);
      return (
        !Number.isNaN(created.getTime()) &&
        Date.now() - created.getTime() > 30 * 60 * 1000
      );
    }).length;
    const ventas = pedidos.reduce((acc, p) => {
      if (p.pagado && !p.reembolsado) return acc + Number(p.total || 0);
      return acc;
    }, 0);
    return { total, pendientes, enProceso, retrasados, ventas };
  }, [pedidos]);

  return (
    <div className="cj-kpis">
      <div className="cj-kpi red">
        <div className="cj-kpi-orb" />
        <span>Total pedidos activos</span>
        <strong>{stats.total}</strong>
      </div>
      <div className="cj-kpi yellow">
        <div className="cj-kpi-orb" />
        <span>Pendientes</span>
        <strong>{stats.pendientes}</strong>
      </div>
      <div className="cj-kpi dark">
        <div className="cj-kpi-orb" />
        <span>En proceso</span>
        <strong>{stats.enProceso}</strong>
      </div>
      <div className="cj-kpi green">
        <div className="cj-kpi-orb" />
        <span>Ventas cobradas</span>
        <strong>${stats.ventas.toFixed(2)}</strong>
      </div>
      <div className="cj-kpi red">
        <div className="cj-kpi-orb" />
        <span>Retrasados</span>
        <strong>{stats.retrasados}</strong>
      </div>
    </div>
  );
}

function PedidoDetailPanel({
  pedido,
  metodosPago,
  selectedMetodoPago,
  onSelectMetodoPago,
  onMarkPaid,
  onChangeStatus,
}) {
  if (!pedido) {
    return (
      <div className="cj-detail-card cj-empty-center">
        Selecciona un pedido para ver sus detalles
      </div>
    );
  }

  const estatusActual = String(
    pedido.estatus || pedido.estado || "",
  ).toUpperCase();
  const estaCancelado = estatusActual === "CANCELADO";
  const estaEntregado = estatusActual === "ENTREGADO";
  const estaReembolsado = Boolean(pedido.reembolsado);

  return (
    <div className="cj-detail-card">
      <div className="cj-detail-head">
        <div>
          <h2>Pedido #{pedido.folio}</h2>
          <p>
            {pedido.cliente?.nombre ||
              pedido.cliente?.nombre_completo ||
              "Cliente"}
          </p>
        </div>
        <div className="cj-detail-total">
          ${Number(pedido.total || 0).toFixed(2)}
        </div>
      </div>

      <div className="cj-detail-grid">
        <div className="cj-detail-box">
          <h4>Información general</h4>
          <p>
            <b>Estatus:</b> {pedido.estatus || pedido.estado || "—"}
          </p>
          <p>
            <b>Pagado:</b> {pedido.pagado ? "Sí" : "No"}
          </p>
          <p>
            <b>Reembolsado:</b> {pedido.reembolsado ? "Sí" : "No"}
          </p>
          <p>
            <b>Método pago:</b> {pedido.metodo_pago?.nombre || "N/D"}
          </p>
          <p>
            <b>Dirección:</b> {pedido.direccion_entrega || "No aplica"}
          </p>
          <p>
            <b>Notas:</b> {pedido.notas || "Sin notas"}
          </p>
        </div>
        <div className="cj-detail-box">
          <h4>Cliente</h4>
          <p>
            <b>Nombre:</b>{" "}
            {pedido.cliente?.nombre || pedido.cliente?.nombre_completo || "N/D"}
          </p>
          <p>
            <b>Teléfono:</b> {pedido.cliente?.telefono || "N/D"}
          </p>
          <p>
            <b>Email:</b> {pedido.cliente?.email || "N/D"}
          </p>
        </div>
      </div>

      <div className="cj-items-section">
        <h3>Productos del pedido</h3>
        <div className="cj-items-list">
          {pedido.items?.length ? (
            pedido.items.map((item, idx) => (
              <div key={item.id || idx} className="cj-item-card">
                <div>
                  <div className="cj-item-name">
                    {item.nombre || "Producto"}
                  </div>
                  <div className="cj-item-meta">
                    Cantidad: {item.cantidad} · Unitario: $
                    {Number(item.precio_unitario || 0).toFixed(2)}
                  </div>
                </div>
                <div className="cj-item-total">
                  ${Number(item.total_item || 0).toFixed(2)}
                </div>
              </div>
            ))
          ) : (
            <p className="cj-empty">Sin productos</p>
          )}
        </div>
      </div>

      <div className="cj-payment-row">
        <label>Método de pago:</label>
        <select
          value={selectedMetodoPago}
          onChange={(e) => onSelectMetodoPago(e.target.value)}
          disabled={estaCancelado || estaReembolsado}
        >
          <option value="">Selecciona un método</option>
          {metodosPago.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="cj-actions">
        {!estaCancelado && !estaEntregado ? (
          <button
            className="cj-action-btn blue"
            type="button"
            onClick={() => onChangeStatus(pedido.id, "EN_PROCESO")}
          >
            En proceso
          </button>
        ) : null}
        {!estaCancelado && !estaEntregado ? (
          <button
            className="cj-action-btn green"
            type="button"
            onClick={() => onChangeStatus(pedido.id, "LISTO")}
          >
            Listo
          </button>
        ) : null}
        {!estaCancelado && !estaEntregado ? (
          <button
            className="cj-action-btn red"
            type="button"
            onClick={() => onChangeStatus(pedido.id, "CANCELADO")}
          >
            Cancelar
          </button>
        ) : null}
        {!estaCancelado && !estaReembolsado ? (
          <button
            className="cj-action-btn dark"
            type="button"
            onClick={() => onMarkPaid(pedido.id)}
            disabled={!selectedMetodoPago || pedido.pagado}
          >
            {pedido.pagado ? "Ya pagado" : "Marcar pagado"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function normalizeDashboardEstado(raw) {
  const value = String(raw || "")
    .trim()
    .toUpperCase();
  if (["PENDIENTE", "PENDING"].includes(value)) return "PENDIENTE";
  if (["EN_PROCESO", "EN_PREPARACION", "PREPARANDO"].includes(value))
    return "EN_PROCESO";
  if (["LISTO"].includes(value)) return "LISTO";
  if (["ENTREGADO", "COMPLETADO"].includes(value)) return "ENTREGADO";
  if (["CANCELADO"].includes(value)) return "CANCELADO";
  return value || "PENDIENTE";
}

// ─────────────────────────────────────────────
// Componente principal — polling corregido
// ─────────────────────────────────────────────

export default function CajeroDashboardPage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [pedidos, setPedidos] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [pedidoDetalle, setPedidoDetalle] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [metodosPago, setMetodosPago] = useState([]);
  const [selectedMetodoPago, setSelectedMetodoPago] = useState("");

  // Refs para polling — evita que se creen múltiples intervalos al cambiar deps
  const prevNotificationIds = useRef(new Set());
  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;

  const pedidosActivos = useMemo(() => {
    return pedidos.filter((pedido) => {
      const estado = normalizeDashboardEstado(pedido.estatus || pedido.estado);
      return ["PENDIENTE", "EN_PROCESO"].includes(estado);
    });
  }, [pedidos]);

  const pushToast = useCallback((titulo, mensaje, tipo = "info") => {
    const id = createClientId("cajero-toast");
    setToasts((prev) => [...prev, { id, titulo, mensaje, tipo }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loadPedidos = useCallback(async () => {
    try {
      const data = await cajeroApi.listPedidos(token);
      const list = Array.isArray(data) ? data : [];
      setPedidos(list);

      const activos = list.filter((pedido) =>
        ["PENDIENTE", "EN_PROCESO"].includes(
          normalizeDashboardEstado(pedido.estatus || pedido.estado),
        ),
      );

      // Seleccionar el primero si no hay selección activa
      setSelectedId((prev) => {
        if (!prev && activos.length > 0) return activos[0].id;
        return prev;
      });
    } catch {
      pushToast("Error", "No se pudieron cargar los pedidos", "error");
    }
  }, [token, pushToast]);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await cajeroApi.listNotifications(token);
      const list = Array.isArray(data) ? data : [];

      for (const n of list) {
        if (!prevNotificationIds.current.has(n.id) && !n.leida) {
          pushToast(n.titulo, n.mensaje, n.tipo || "info");
        }
      }

      prevNotificationIds.current = new Set(list.map((n) => n.id));
      setNotifications(list);
    } catch {
      pushToast("Error", "No se pudieron cargar las notificaciones", "error");
    }
  }, [token, pushToast]);

  const loadMetodosPago = useCallback(async () => {
    try {
      const data = await cajeroApi.listMetodosPago(token);
      setMetodosPago(Array.isArray(data) ? data : []);
    } catch {
      pushToast("Error", "No se pudieron cargar los métodos de pago", "error");
    }
  }, [token, pushToast]);

  const loadPedidoDetalle = useCallback(
    async (id) => {
      if (!id) return;
      try {
        const data = await cajeroApi.getPedidoDetalle({ token, id });
        setPedidoDetalle(data);
        setSelectedMetodoPago(
          data?.metodo_pago?.id || data?.metodo_pago_id || "",
        );
      } catch {
        pushToast("Error", "No se pudo cargar el detalle del pedido", "error");
      }
    },
    [token, pushToast],
  );

  // Carga inicial
  useEffect(() => {
    if (!token) return;
    Promise.all([loadPedidos(), loadNotifications(), loadMetodosPago()]);
  }, [token, loadPedidos, loadNotifications, loadMetodosPago]);

  // Cargar detalle cuando cambia la selección
  useEffect(() => {
    if (selectedId) loadPedidoDetalle(selectedId);
  }, [selectedId, loadPedidoDetalle]);

  // Fix: un único intervalo con refs estables — no se recrea al cambiar selectedId
  useEffect(() => {
    if (!token) return;

    const tick = async () => {
      await loadPedidos();
      await loadNotifications();
      if (selectedIdRef.current) {
        await loadPedidoDetalle(selectedIdRef.current);
      }
    };

    const interval = setInterval(tick, 5000);
    return () => clearInterval(interval);
  }, [token, loadPedidos, loadNotifications, loadPedidoDetalle]);

  // Limpiar selección si el pedido activo desaparece
  useEffect(() => {
    if (!selectedId) return;
    const sigueActivo = pedidosActivos.some((p) => p.id === selectedId);
    if (!sigueActivo) {
      const next = pedidosActivos[0]?.id ?? null;
      setSelectedId(next);
      if (!next) setPedidoDetalle(null);
    }
  }, [selectedId, pedidosActivos]);

  const handleChangeStatus = async (pedidoId, estatus) => {
    try {
      await cajeroApi.changeStatus(token, pedidoId, estatus);
      pushToast("Pedido actualizado", `El pedido cambió a ${estatus}`, "info");
      await loadPedidos();
      await loadPedidoDetalle(pedidoId);
      await loadNotifications();
    } catch {
      pushToast("Error", "No se pudo actualizar el pedido", "error");
    }
  };

  const handleMarkPaid = async (pedidoId) => {
    if (!selectedMetodoPago) {
      pushToast(
        "Falta método de pago",
        "Selecciona un método de pago",
        "warning",
      );
      return;
    }
    try {
      await cajeroApi.markPaid(token, pedidoId, selectedMetodoPago);
      pushToast(
        "Pedido cobrado",
        "El pedido fue marcado como pagado",
        "success",
      );
      await loadPedidos();
      await loadPedidoDetalle(pedidoId);
      await loadNotifications();
    } catch {
      pushToast("Error", "No se pudo marcar el pedido como pagado", "error");
    }
  };

  const handleOpenNotifications = async () => {
    const nextOpen = !openNotifications;
    setOpenNotifications(nextOpen);
    if (nextOpen) {
      try {
        await cajeroApi.markAllNotificationsAsRead(token);
        setNotifications((prev) => prev.map((n) => ({ ...n, leida: true })));
      } catch {
        pushToast("Error", "No se pudieron marcar como leídas", "error");
      }
    }
  };

  return (
    <>
      <style>{`
        .cj-page{ height:100vh; background:#f6f7fb; display:flex; flex-direction:column; position:relative; overflow:hidden; }
        .cj-header{ background:#fff; border-bottom:1px solid #eee; padding:16px 20px; display:flex; justify-content:space-between; align-items:center; flex-shrink:0; }
        .cj-header h1{ margin:0; font-size:28px; font-weight:900; color:#111; }
        .cj-header p{ margin:4px 0 0; color:#666; font-weight:600; }
        .cj-header-right{ display:flex; gap:12px; align-items:center; position:relative; }
        .cj-cut-btn{ border:none; border-radius:12px; background:#111; color:#fff; padding:12px 18px; font-weight:900; cursor:pointer; }
        .cj-bell{ display:flex; align-items:center; gap:10px; position:relative; border:none; background:#fff; border-radius:12px; padding:10px 14px; cursor:pointer; font-weight:800; box-shadow:0 6px 16px rgba(0,0,0,.08); }
        .cj-bell-icon{ font-size:20px; }
        .cj-bell-text{ font-weight:800; color:#334155; font-size:13px; }
        .cj-bell-badge{ position:absolute; top:-6px; right:-6px; background:#e50914; color:#fff; border-radius:999px; min-width:22px; height:22px; font-size:12px; display:flex; align-items:center; justify-content:center; font-weight:900; }
        .cj-layout{ display:flex; flex:1; min-height:0; overflow:hidden; }
        .cj-sidebar{ width:320px; min-width:320px; background:#fff; border-right:1px solid #eee; padding:16px 10px 16px 16px; overflow-y:auto; overflow-x:hidden; min-height:0; scrollbar-gutter:stable; }
        .cj-sidebar-head{ display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; padding-right:8px; }
        .cj-sidebar-head h3{ margin:0; font-size:20px; font-weight:900; }
        .cj-sidebar-head span{ background:#e50914; color:#fff; border-radius:999px; padding:6px 10px; font-weight:900; font-size:12px; }
        .cj-sidebar-list{ display:flex; flex-direction:column; gap:10px; padding-right:8px; }
        .cj-order-age{ margin-top:6px; font-size:12px; color:#64748b; font-weight:700; }
        .cj-order-card{ text-align:left; border:1px solid #e5e7eb; background:#fff; border-radius:14px; padding:14px; cursor:pointer; transition:all .2s ease; width:100%; }
        .cj-order-card:hover{ transform:translateY(-2px); box-shadow:0 10px 18px rgba(0,0,0,.08); }
        .cj-order-card.active{ border:2px solid #e50914; background:#fff5f5; }
        .cj-order-top{ display:flex; justify-content:space-between; align-items:center; gap:10px; }
        .cj-order-folio{ font-weight:900; color:#111; }
        .cj-order-client{ margin-top:8px; font-size:14px; color:#333; font-weight:700; }
        .cj-order-meta{ margin-top:8px; display:flex; justify-content:space-between; font-size:12px; color:#666; }
        .cj-order-total{ margin-top:10px; color:#e50914; font-weight:1000; font-size:16px; }
        .cj-status-badge{ padding:6px 10px; border-radius:999px; font-size:11px; font-weight:900; white-space:nowrap; }
        .st-pendiente{ background:#fff3cd; color:#8a6d3b; }
        .st-en_proceso,.st-preparando,.st-en_preparacion{ background:#dbeafe; color:#1d4ed8; }
        .st-listo{ background:#dcfce7; color:#166534; }
        .st-cancelado{ background:#fee2e2; color:#991b1b; }
        .st-entregado{ background:#f3f4f6; color:#111827; }
        .cj-main{ flex:1; min-width:0; min-height:0; overflow-y:auto; overflow-x:hidden; padding:20px 28px 20px 20px; scrollbar-gutter:stable; }
        .cj-kpis{ display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:16px; margin-bottom:20px; }
        .cj-kpi{ position:relative; overflow:hidden; border-radius:20px; padding:18px 20px; display:flex; flex-direction:column; justify-content:space-between; min-height:108px; font-weight:800; box-shadow:0 16px 28px rgba(15,23,42,.08); }
        .cj-kpi span{ font-size:14px; font-weight:800; opacity:.95; position:relative; z-index:1; }
        .cj-kpi strong{ font-size:34px; line-height:1; font-weight:950; position:relative; z-index:1; }
        .cj-kpi-orb{ position:absolute; top:-24px; right:-20px; width:96px; height:96px; border-radius:50%; background:rgba(255,255,255,.12); z-index:0; }
        .cj-kpi.red{ background:linear-gradient(135deg,#e50914,#ff4d4f); color:#fff; box-shadow:0 18px 30px rgba(229,9,20,.18); }
        .cj-kpi.yellow{ background:linear-gradient(135deg,#ffd54a,#ffcc00); color:#111827; box-shadow:0 18px 30px rgba(245,158,11,.16); }
        .cj-kpi.dark{ background:linear-gradient(135deg,#172033,#0b1220); color:#fff; box-shadow:0 18px 30px rgba(15,23,42,.18); }
        .cj-kpi.green{ background:linear-gradient(135deg,#16a34a,#22c55e); color:#fff; box-shadow:0 18px 30px rgba(22,163,74,.18); }
        .cj-detail-card{ background:#fff; border-radius:16px; padding:24px; border:1px solid #eee; box-shadow:0 10px 18px rgba(0,0,0,.06); margin-right:8px; }
        .cj-empty-center{ display:flex; align-items:center; justify-content:center; min-height:320px; color:#64748b; font-weight:800; font-size:15px; }
        .cj-detail-head{ display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:20px; }
        .cj-detail-head h2{ margin:0; font-size:28px; font-weight:900; color:#111; }
        .cj-detail-head p{ margin:6px 0 0; color:#666; font-weight:600; }
        .cj-detail-total{ color:#e50914; font-size:26px; font-weight:1000; }
        .cj-detail-grid{ display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:22px; }
        .cj-detail-box{ background:#fafafa; border:1px solid #eee; border-radius:14px; padding:16px; }
        .cj-detail-box h4{ margin:0 0 10px; font-size:16px; font-weight:900; color:#111; }
        .cj-detail-box p{ margin:8px 0; color:#444; font-size:14px; }
        .cj-items-section h3{ margin:0 0 14px; font-size:18px; font-weight:900; color:#111; }
        .cj-items-list{ display:flex; flex-direction:column; gap:12px; }
        .cj-item-card{ border:1px solid #eee; border-radius:14px; padding:14px; display:flex; justify-content:space-between; align-items:center; gap:14px; background:#fff; }
        .cj-item-name{ font-weight:900; color:#111; }
        .cj-item-meta{ font-size:13px; color:#666; margin-top:4px; }
        .cj-item-total{ color:#e50914; font-weight:1000; white-space:nowrap; }
        .cj-payment-row{ margin-top:18px; display:flex; gap:12px; align-items:center; }
        .cj-payment-row label{ font-weight:800; color:#111; }
        .cj-payment-row select{ border:1px solid #ddd; border-radius:10px; padding:10px 12px; min-width:240px; }
        .cj-actions{ margin-top:20px; display:flex; flex-wrap:wrap; gap:12px; }
        .cj-action-btn{ border:none; border-radius:10px; padding:12px 16px; font-weight:900; cursor:pointer; color:#fff; }
        .cj-action-btn:disabled{ opacity:.5; cursor:not-allowed; }
        .cj-action-btn.blue{ background:#2563eb; }
        .cj-action-btn.green{ background:#16a34a; }
        .cj-action-btn.red{ background:#b91c1c; }
        .cj-action-btn.dark{ background:#111; }
        .cj-toast-wrap{ position:fixed; right:20px; bottom:20px; z-index:9999; display:flex; flex-direction:column; gap:10px; }
        .cj-toast{ min-width:280px; max-width:360px; padding:14px 16px; border-radius:12px; color:#fff; box-shadow:0 10px 24px rgba(0,0,0,.25); }
        .cj-toast-info{ background:#111; }
        .cj-toast-success{ background:#15803d; }
        .cj-toast-warning{ background:#d97706; }
        .cj-toast-error{ background:#b91c1c; }
        .cj-toast-title{ font-weight:900; }
        .cj-toast-msg{ font-size:14px; margin-top:4px; }
        .cj-notif-panel{ position:absolute; top:70px; right:0; width:360px; max-height:420px; overflow-y:auto; background:#fff; border-radius:14px; box-shadow:0 16px 40px rgba(0,0,0,.18); border:1px solid #eee; z-index:3000; padding:16px; }
        .cj-notif-head{ display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; gap:12px; }
        .cj-notif-sub{ font-size:12px; color:#64748b; margin-top:4px; font-weight:700; }
        .cj-notif-close{ border:none; background:transparent; cursor:pointer; font-size:16px; }
        .cj-notif-list{ display:flex; flex-direction:column; gap:0; }
        .cj-notif-item{ padding:10px 0; border-bottom:1px solid #f0f0f0; }
        .cj-notif-item.unread .cj-notif-title{ color:#e50914; }
        .cj-notif-title{ font-weight:900; color:#111; }
        .cj-notif-msg{ font-size:14px; color:#444; margin-top:4px; }
        .cj-notif-time{ font-size:12px; color:#888; margin-top:6px; }
        .cj-empty{ color:#666; font-weight:600; }
        @media (max-width:900px){
          .cj-layout{ flex-direction:column; }
          .cj-sidebar{ width:100%; min-width:100%; max-height:280px; border-right:none; border-bottom:1px solid #eee; }
          .cj-detail-grid{ grid-template-columns:1fr; }
          .cj-main{ padding:16px; }
          .cj-detail-card{ margin-right:0; }
        }
      `}</style>

      <div className="cj-page">
        <header className="cj-header">
          <div>
            <h1>Módulo Cajero</h1>
            <p>Gestión de pedidos y cobros</p>
          </div>
          <div className="cj-header-right">
            <button
              className="cj-cut-btn"
              type="button"
              onClick={() => navigate("/cajero/corte")}
            >
              Corte de caja
            </button>
            <button
              className="cj-cut-btn"
              type="button"
              onClick={() => navigate("/cajero/pedidos")}
            >
              Ver pedidos
            </button>
            <NotificationBell
              notifications={notifications}
              onOpen={handleOpenNotifications}
            />
            <NotificationPanel
              open={openNotifications}
              notifications={notifications}
              onClose={() => setOpenNotifications(false)}
            />
          </div>
        </header>

        <div className="cj-layout">
          <PedidosSidebar
            pedidos={pedidosActivos}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <main className="cj-main">
            <CajeroStats pedidos={pedidosActivos} />
            <PedidoDetailPanel
              pedido={pedidoDetalle}
              metodosPago={metodosPago}
              selectedMetodoPago={selectedMetodoPago}
              onSelectMetodoPago={setSelectedMetodoPago}
              onMarkPaid={handleMarkPaid}
              onChangeStatus={handleChangeStatus}
            />
          </main>
        </div>

        <ToastNotifications toasts={toasts} onRemove={removeToast} />
      </div>
    </>
  );
}
