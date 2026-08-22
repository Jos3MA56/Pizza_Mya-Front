import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Calendar,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  RefreshCw,
  Store,
  Receipt,
  ChefHat,
  ShoppingBag,
} from "lucide-react";
import { httpJson, buildApiUrl } from "../../api/http.js";
import { useAuth } from "../../context/AuthContext.jsx";

const TIEMPOS_ESTIMADOS = {
  PENDIENTE: 5,
  CONFIRMADO: 5,
  EN_PREPARACION: 20,
  LISTO: 10,
  EN_CAMINO: 15,
};

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount) {
  return `$${parseFloat(amount || 0).toFixed(2)}`;
}

function getTipoPedidoLabel(tipo) {
  const value = String(tipo || "").toUpperCase();

  if (["DOMICILIO", "DELIVERY", "ENVIO"].includes(value)) {
    return "A domicilio";
  }

  if (["RECOGER", "RECOGER_EN_TIENDA", "PICKUP"].includes(value)) {
    return "Recoger en tienda";
  }

  if (["MOSTRADOR", "LOCAL"].includes(value)) {
    return "Mostrador";
  }

  return tipo || "Pedido";
}

function getStatusIcon(status) {
  switch (String(status || "").toUpperCase()) {
    case "PENDIENTE":
      return <Clock size={20} />;
    case "CONFIRMADO":
      return <Receipt size={20} />;
    case "EN_PREPARACION":
      return <ChefHat size={20} />;
    case "LISTO":
      return <CheckCircle size={20} />;
    case "EN_CAMINO":
      return <Truck size={20} />;
    case "ENTREGADO":
      return <CheckCircle size={20} color="#10B981" />;
    case "CANCELADO":
      return <XCircle size={20} color="#EF4444" />;
    default:
      return <Clock size={20} />;
  }
}

function getStatusStyle(status) {
  const map = {
    PENDIENTE: {
      bg: "#FEF3C7",
      text: "#92400E",
      border: "#F59E0B",
      label: "Pendiente",
    },
    CONFIRMADO: {
      bg: "#DBEAFE",
      text: "#1E40AF",
      border: "#3B82F6",
      label: "Confirmado",
    },
    EN_PREPARACION: {
      bg: "#DBEAFE",
      text: "#1D4ED8",
      border: "#2563EB",
      label: "En preparación",
    },
    LISTO: {
      bg: "#D1FAE5",
      text: "#065F46",
      border: "#10B981",
      label: "Listo",
    },
    EN_CAMINO: {
      bg: "#CFFAFE",
      text: "#0E7490",
      border: "#06B6D4",
      label: "En camino",
    },
    ENTREGADO: {
      bg: "#DCFCE7",
      text: "#166534",
      border: "#22C55E",
      label: "Entregado",
    },
    CANCELADO: {
      bg: "#FEE2E2",
      text: "#991B1B",
      border: "#EF4444",
      label: "Cancelado",
    },
  };

  return (
    map[String(status || "").toUpperCase()] || {
      bg: "#F3F4F6",
      text: "#374151",
      border: "#9CA3AF",
      label: status || "Sin estado",
    }
  );
}

function getProgressSteps(status) {
  const normalized = String(status || "PENDIENTE").toUpperCase();

  if (normalized === "CANCELADO") {
    return [
      { key: "PENDIENTE", label: "Recibido", done: true },
      { key: "CANCELADO", label: "Cancelado", done: true },
    ];
  }

  const order = [
    "PENDIENTE",
    "CONFIRMADO",
    "EN_PREPARACION",
    "LISTO",
    "EN_CAMINO",
    "ENTREGADO",
  ];
  const currentIndex = order.indexOf(normalized);

  return [
    { key: "PENDIENTE", label: "Recibido", done: currentIndex >= 0 },
    { key: "CONFIRMADO", label: "Confirmado", done: currentIndex >= 1 },
    {
      key: "EN_PREPARACION",
      label: "Preparando",
      done: currentIndex >= 2,
    },
    { key: "LISTO", label: "Listo", done: currentIndex >= 3 },
    { key: "EN_CAMINO", label: "En camino", done: currentIndex >= 4 },
    { key: "ENTREGADO", label: "Entregado", done: currentIndex >= 5 },
  ];
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [tiempoRestante, setTiempoRestante] = useState(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [canceling, setCanceling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const pollingRef = useRef(null);

  const calcularTiempoRestante = (orderData) => {
    if (!orderData?.created_at) {
      setTiempoRestante(null);
      return;
    }

    const created = new Date(orderData.created_at);
    const minutosTranscurridos = Math.floor((Date.now() - created) / 60000);
    const tiempoTotal = TIEMPOS_ESTIMADOS[orderData.estatus] || 0;

    if (!tiempoTotal) {
      setTiempoRestante(null);
      return;
    }

    setTiempoRestante(Math.max(0, tiempoTotal - minutosTranscurridos));
  };

  const loadOrderDetails = async () => {
    try {
      const data = await httpJson(buildApiUrl(`/api/orders/${id}`), {
        headers: { Authorization: `Bearer ${token}` },
      });

      const backendData = data?.data || data;

      const mappedOrder = {
        ...backendData,
        estatus: backendData.estatus || backendData.status || "PENDIENTE",
        tipo_pedido:
          backendData.tipo_pedido ||
          backendData.tipoEntrega ||
          backendData.tipo ||
          "",
        items: (backendData.items || []).map((item) => ({
          ...item,
          nombre: item.nombre_snapshot || item.nombre || item.producto_nombre,
          precio: item.precio_unitario || item.precio,
        })),
      };

      setOrder(mappedOrder);
      setLastUpdate(new Date());
      calcularTiempoRestante(mappedOrder);
      setError(null);
    } catch (err) {
      if (err?.status === 401) {
        navigate("/login");
        return;
      }
      setError(err?.message || "No se pudo cargar el pedido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id || !token) return;

    loadOrderDetails();
    pollingRef.current = setInterval(loadOrderDetails, 30000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  const statusStyle = useMemo(
    () => getStatusStyle(order?.estatus),
    [order?.estatus],
  );

  const progressSteps = useMemo(
    () => getProgressSteps(order?.estatus),
    [order?.estatus],
  );

  const canCancelOrder =
    String(order?.estatus || "").toUpperCase() === "PENDIENTE";

  async function handleCancelOrder() {
    if (!id || !token || canceling) return;

    try {
      setCanceling(true);
      setCancelError("");

      const data = await httpJson(buildApiUrl(`/api/orders/${id}/cancel`), {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ motivo: cancelReason }),
      });

      const backendData = data?.data || data;

      setOrder((prev) => ({
        ...(prev || {}),
        ...(backendData || {}),
        estatus: "CANCELADO",
      }));
      setCancelOpen(false);
      setCancelReason("");
      setLastUpdate(new Date());
      if (pollingRef.current) clearInterval(pollingRef.current);
    } catch (err) {
      setCancelError(
        err?.message ||
          "No se pudo cancelar el pedido. Intenta comunicarte con Pizza Mya.",
      );
    } finally {
      setCanceling(false);
    }
  }

  if (loading && !order) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 200px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "50px",
            height: "50px",
            border: "4px solid #f3f4f6",
            borderTop: "4px solid #FF6A00",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 200px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Package size={64} color="#9CA3AF" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 22, marginBottom: 8, color: "#111" }}>
            Pedido no encontrado
          </h2>
          <p style={{ color: "#6b7280", marginBottom: 24 }}>
            {error || "No pudimos encontrar el pedido que buscas."}
          </p>
          <button
            onClick={() => navigate("/perfil?tab=orders")}
            style={{
              padding: "12px 24px",
              background: "#FF6A00",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Ver mis pedidos
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .order-detail-page {
          background: linear-gradient(180deg, #f8fafc 0%, #fff7ed 100%);
          min-height: calc(100vh - 200px);
          padding: 34px 20px 60px;
        }
        .order-container {
          max-width: 980px;
          margin: 0 auto;
        }
        .order-header,
        .order-card {
          background: white;
          border-radius: 22px;
          padding: 24px 28px;
          margin-bottom: 20px;
          box-shadow: 0 10px 30px rgba(15,23,42,0.05);
          border: 1px solid #e5e7eb;
        }
        .order-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #6b7280;
          background: none;
          border: none;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          margin-bottom: 20px;
          padding: 0;
        }
        .order-back-btn:hover {
          color: #FF6A00;
        }
        .card-title {
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 20px;
          color: #111;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .order-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 18px;
        }
        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .info-icon {
          width: 42px;
          height: 42px;
          background: #f8fafc;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid #e5e7eb;
        }
        .info-content label {
          display: block;
          font-size: 12px;
          color: #94a3b8;
          margin-bottom: 4px;
          text-transform: uppercase;
          font-weight: 700;
        }
        .info-content p {
          font-size: 14px;
          color: #111;
          font-weight: 700;
          margin: 0;
          line-height: 1.5;
        }
        .order-items-list {
          border-top: 1px solid #f1f5f9;
        }
        .order-item {
          display: flex;
          gap: 16px;
          padding: 18px 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .order-item:last-child {
          border-bottom: none;
        }
        .item-image {
          width: 78px;
          height: 78px;
          background: #f8fafc;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }
        .item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .item-details {
          flex: 1;
        }
        .item-name {
          font-weight: 800;
          font-size: 16px;
          margin-bottom: 4px;
          color: #111;
        }
        .item-quantity {
          font-size: 14px;
          color: #6b7280;
        }
        .item-price {
          font-weight: 800;
          font-size: 16px;
          color: #FF6A00;
        }
        .order-summary {
          background: #f8fafc;
          border-radius: 16px;
          padding: 20px;
          margin-top: 20px;
          border: 1px solid #e5e7eb;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 14px;
          color: #374151;
        }
        .summary-row.total {
          font-size: 18px;
          font-weight: 800;
          color: #111;
          padding-top: 14px;
          border-top: 2px solid #e5e7eb;
          margin-top: 12px;
          margin-bottom: 0;
        }
        .summary-row.total span:last-child {
          color: #FF6A00;
          font-size: 24px;
        }
        .refresh-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 12px;
          cursor: pointer;
          color: #374151;
          font-weight: 700;
        }
        .refresh-btn:hover {
          background: #f1f5f9;
        }
        .time-estimate {
          background: #fff7ed;
          padding: 14px 18px;
          border-radius: 14px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid #fed7aa;
        }
        .status-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 999px;
          font-weight: 800;
          font-size: 14px;
        }
        .progress-card {
          background: #fff;
          border-radius: 22px;
          padding: 24px 28px;
          margin-bottom: 20px;
          box-shadow: 0 10px 30px rgba(15,23,42,0.05);
          border: 1px solid #e5e7eb;
        }
        .progress-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 10px;
        }
        .progress-step {
          text-align: center;
        }
        .progress-dot {
          width: 16px;
          height: 16px;
          border-radius: 999px;
          background: #fff;
          border: 2px solid #cbd5e1;
          margin: 0 auto 10px;
        }
        .progress-step.done .progress-dot {
          background: #10b981;
          border-color: #10b981;
        }
        .progress-label {
          font-size: 12px;
          color: #64748b;
          font-weight: 700;
          line-height: 1.4;
        }
        .progress-step.done .progress-label {
          color: #111827;
        }
        .header-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .quick-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 18px;
        }
        .quick-btn {
          padding: 12px 18px;
          border-radius: 12px;
          border: 1px solid #d1d5db;
          background: white;
          color: #111827;
          cursor: pointer;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .quick-btn.primary {
          background: #111827;
          color: white;
          border-color: #111827;
        }
        .quick-btn.accent {
          background: #FF6A00;
          color: white;
          border-color: #FF6A00;
        }
        .quick-btn.danger {
          background: #fff;
          color: #b91c1c;
          border-color: #fecaca;
        }
        .quick-btn.danger:hover {
          background: #fef2f2;
        }
        .cancel-note {
          margin-top: 14px;
          padding: 12px 14px;
          border-radius: 14px;
          background: #fff7ed;
          border: 1px solid #fed7aa;
          color: #9a3412;
          font-size: 13px;
          line-height: 1.5;
        }
        .cancel-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 999;
          background: rgba(15, 23, 42, .48);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .cancel-modal {
          width: min(520px, 100%);
          background: #fff;
          border-radius: 22px;
          box-shadow: 0 24px 80px rgba(15, 23, 42, .24);
          border: 1px solid #fee2e2;
          padding: 24px;
        }
        .cancel-modal h2 {
          margin: 0 0 8px;
          font-size: 22px;
          color: #111827;
        }
        .cancel-modal p {
          margin: 0 0 16px;
          color: #6b7280;
          line-height: 1.55;
        }
        .cancel-modal textarea {
          width: 100%;
          min-height: 96px;
          resize: vertical;
          border-radius: 14px;
          border: 1px solid #d1d5db;
          padding: 12px 14px;
          font: inherit;
          outline: none;
        }
        .cancel-modal textarea:focus {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, .12);
        }
        .cancel-modal-error {
          margin-top: 12px;
          color: #991b1b;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          padding: 10px 12px;
          font-size: 13px;
          font-weight: 700;
        }
        .cancel-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 18px;
          flex-wrap: wrap;
        }
        .cancel-modal-actions button {
          border: 0;
          border-radius: 12px;
          padding: 12px 16px;
          font-weight: 800;
          cursor: pointer;
        }
        .cancel-modal-secondary {
          background: #f3f4f6;
          color: #111827;
        }
        .cancel-modal-danger {
          background: #dc2626;
          color: #fff;
        }
        .cancel-modal-danger:disabled {
          opacity: .65;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .order-header,
          .order-card,
          .progress-card {
            padding: 20px;
          }
          .order-info-grid {
            grid-template-columns: 1fr;
          }
          .progress-grid {
            grid-template-columns: repeat(3, 1fr);
            row-gap: 16px;
          }
        }

        @media (max-width: 560px) {
          .progress-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .quick-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <div className="order-detail-page">
        <div className="order-container">
          <div className="order-header">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <button
                className="order-back-btn"
                onClick={() => navigate("/perfil?tab=orders")}
              >
                <ArrowLeft size={16} /> Volver a mis pedidos
              </button>

              <div className="header-actions">
                <button
                  className="refresh-btn"
                  onClick={loadOrderDetails}
                  title="Actualizar"
                >
                  <RefreshCw size={14} /> Actualizar
                </button>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 16,
                marginTop: 10,
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    marginBottom: 10,
                    color: "#111",
                  }}
                >
                  Pedido #{order.folio || order.id}
                </h1>

                <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
                  Realizado el {formatDate(order.created_at)}
                </p>

                {lastUpdate && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "#9ca3af",
                      marginTop: 6,
                      marginBottom: 0,
                    }}
                  >
                    Última actualización: {lastUpdate.toLocaleTimeString()}
                  </p>
                )}
              </div>

              <div
                className="status-chip"
                style={{
                  background: statusStyle.bg,
                  color: statusStyle.text,
                  border: `2px solid ${statusStyle.border}`,
                }}
              >
                {getStatusIcon(order.estatus)}
                {statusStyle.label}
              </div>
            </div>

            <div className="quick-actions">
              <button
                className="quick-btn primary"
                onClick={() => navigate("/perfil?tab=orders")}
              >
                <Receipt size={16} />
                Ver mis pedidos
              </button>

              <button
                className="quick-btn accent"
                onClick={() => navigate("/catalogo")}
              >
                <ShoppingBag size={16} />
                Seguir comprando
              </button>

              {canCancelOrder ? (
                <button
                  className="quick-btn danger"
                  onClick={() => {
                    setCancelError("");
                    setCancelOpen(true);
                  }}
                >
                  <XCircle size={16} />
                  Cancelar pedido
                </button>
              ) : null}
            </div>

            {!canCancelOrder &&
            !["CANCELADO", "ENTREGADO"].includes(
              String(order.estatus || "").toUpperCase(),
            ) ? (
              <div className="cancel-note">
                Si necesitas cancelar este pedido, comunícate directamente con
                Pizza Mya. Cuando el restaurante ya tomó el pedido, la
                cancelación debe confirmarse con el personal.
              </div>
            ) : null}
          </div>

          <div className="progress-card">
            <h2 className="card-title">
              <CheckCircle size={20} /> Seguimiento del pedido
            </h2>

            <div className="progress-grid">
              {progressSteps.map((step) => (
                <div
                  className={`progress-step ${step.done ? "done" : ""}`}
                  key={step.key}
                >
                  <div className="progress-dot" />
                  <div className="progress-label">{step.label}</div>
                </div>
              ))}
            </div>
          </div>

          {tiempoRestante !== null &&
            !["ENTREGADO", "CANCELADO"].includes(order.estatus) && (
              <div className="time-estimate">
                <Clock size={20} color="#C2410C" />
                <div>
                  <strong style={{ color: "#9A3412" }}>
                    Tiempo estimado restante:
                  </strong>{" "}
                  <span style={{ color: "#7C2D12", fontWeight: 700 }}>
                    {tiempoRestante} minutos
                  </span>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#9A3412",
                      marginTop: 2,
                    }}
                  >
                    El estado del pedido se actualiza automáticamente.
                  </div>
                </div>
              </div>
            )}

          <div className="order-card">
            <h2 className="card-title">
              <Package size={20} /> Información del pedido
            </h2>

            <div className="order-info-grid">
              <div className="info-item">
                <div className="info-icon">
                  <Calendar size={20} color="#FF6A00" />
                </div>
                <div className="info-content">
                  <label>Fecha del pedido</label>
                  <p>{formatDate(order.created_at)}</p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  {String(order.tipo_pedido || "")
                    .toUpperCase()
                    .includes("DOMICILIO") ? (
                    <Truck size={20} color="#FF6A00" />
                  ) : (
                    <Store size={20} color="#FF6A00" />
                  )}
                </div>
                <div className="info-content">
                  <label>Tipo de pedido</label>
                  <p>{getTipoPedidoLabel(order.tipo_pedido)}</p>
                </div>
              </div>

              {order.direccion_entrega ? (
                <div className="info-item">
                  <div className="info-icon">
                    <MapPin size={20} color="#FF6A00" />
                  </div>
                  <div className="info-content">
                    <label>Dirección de entrega</label>
                    <p>{order.direccion_entrega}</p>
                  </div>
                </div>
              ) : null}

              <div className="info-item">
                <div className="info-icon">
                  <CreditCard size={20} color="#FF6A00" />
                </div>
                <div className="info-content">
                  <label>Método de pago</label>
                  <p>{order.metodo_pago || "Efectivo"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="order-card">
            <h2 className="card-title">
              <Package size={20} /> Productos del pedido
            </h2>

            <div className="order-items-list">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-image">
                      {item.imagen_url ? (
                        <img src={item.imagen_url} alt={item.nombre} />
                      ) : (
                        <Package size={32} color="#9CA3AF" />
                      )}
                    </div>

                    <div className="item-details">
                      <div className="item-name">{item.nombre}</div>

                      <div className="item-quantity">
                        Cantidad: {item.cantidad || 1}
                      </div>

                      {item.notas ? (
                        <div
                          style={{
                            marginTop: 6,
                            fontSize: 13,
                            color: "#6b7280",
                          }}
                        >
                          Notas: {item.notas}
                        </div>
                      ) : null}
                    </div>

                    <div className="item-price">
                      {formatCurrency(
                        item.total_item ||
                          (item.precio || 0) * (item.cantidad || 1),
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p
                  style={{
                    color: "#6b7280",
                    textAlign: "center",
                    padding: "36px 0",
                  }}
                >
                  No hay productos en este pedido.
                </p>
              )}
            </div>

            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>

              {Number(order.envio || 0) > 0 ? (
                <div className="summary-row">
                  <span>Envío</span>
                  <span>{formatCurrency(order.envio)}</span>
                </div>
              ) : null}

              {Number(order.descuento || 0) > 0 ? (
                <div className="summary-row" style={{ color: "#10B981" }}>
                  <span>Descuento</span>
                  <span>-{formatCurrency(order.descuento)}</span>
                </div>
              ) : null}

              <div className="summary-row total">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {cancelOpen ? (
        <div className="cancel-modal-backdrop" role="dialog" aria-modal="true">
          <div className="cancel-modal">
            <h2>Cancelar pedido</h2>
            <p>
              Solo puedes cancelar desde la web mientras el pedido está
              pendiente. Si ya fue tomado por el restaurante, deberás
              comunicarte directamente con Pizza Mya.
            </p>

            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 800,
                color: "#374151",
                marginBottom: 8,
              }}
            >
              Motivo de cancelación opcional
            </label>
            <textarea
              value={cancelReason}
              maxLength={300}
              onChange={(event) => setCancelReason(event.target.value)}
              placeholder="Ejemplo: Me equivoqué en el pedido o ya no lo necesito."
            />

            {cancelError ? (
              <div className="cancel-modal-error">{cancelError}</div>
            ) : null}

            <div className="cancel-modal-actions">
              <button
                className="cancel-modal-secondary"
                type="button"
                onClick={() => {
                  if (canceling) return;
                  setCancelOpen(false);
                  setCancelError("");
                }}
              >
                No cancelar
              </button>
              <button
                className="cancel-modal-danger"
                type="button"
                disabled={canceling}
                onClick={handleCancelOrder}
              >
                {canceling ? "Cancelando..." : "Sí, cancelar pedido"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
