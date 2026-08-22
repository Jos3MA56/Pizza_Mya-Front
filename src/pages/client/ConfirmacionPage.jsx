import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle,
  Package,
  Clock,
  MapPin,
  Store,
  Truck,
  Receipt,
  ArrowRight,
  ShoppingBag,
  RefreshCw,
  AlertCircle,
  CreditCard,
} from "lucide-react";
import { httpJson, buildApiUrl } from "../../api/http.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { pagosApi } from "../../api/pagos.api.js";
import {
  clearIdempotencyKey,
  getOrCreateIdempotencyKey,
} from "../../utils/idempotency.js";

function formatDate(dateString) {
  if (!dateString) return "No disponible";
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

function getProgressSteps(status) {
  const current = String(status || "PENDIENTE").toUpperCase();
  const all = ["PENDIENTE", "EN_PREPARACION", "EN_CAMINO", "ENTREGADO"];

  const currentIndex = all.indexOf(
    current === "CONFIRMADO" ? "PENDIENTE" : current,
  );

  return [
    { key: "PENDIENTE", label: "Recibido", done: currentIndex >= 0 },
    {
      key: "EN_PREPARACION",
      label: "Preparando",
      done: currentIndex >= 1,
    },
    {
      key: "EN_CAMINO",
      label: "En camino",
      done: currentIndex >= 2,
    },
    {
      key: "ENTREGADO",
      label: "Entregado",
      done: currentIndex >= 3,
    },
  ];
}

function getMensajeSiguientePaso(order) {
  const tipo = String(
    order?.tipo_pedido || order?.tipoEntrega || order?.tipo || "",
  ).toUpperCase();

  if (["DOMICILIO", "DELIVERY", "ENVIO"].includes(tipo)) {
    return {
      icon: <Truck size={18} />,
      title: "Tu pedido irá a domicilio",
      text: "Lo prepararemos y después lo enviaremos a la dirección que registraste. Puedes revisar el estado en tiempo real desde el detalle del pedido.",
    };
  }

  if (["RECOGER", "RECOGER_EN_TIENDA", "PICKUP"].includes(tipo)) {
    return {
      icon: <Store size={18} />,
      title: "Tu pedido será para recoger",
      text: "Lo prepararemos en la sucursal seleccionada. Cuando esté listo podrás pasar por él.",
    };
  }

  return {
    icon: <Package size={18} />,
    title: "Tu pedido fue registrado correctamente",
    text: "El personal lo revisará y continuará con el proceso. Puedes revisar su avance desde el detalle del pedido.",
  };
}

export default function ConfirmacionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token } = useAuth();

  const [pedidoId, setPedidoId] = useState(null);
  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [paymentState, setPaymentState] = useState(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [transferReference, setTransferReference] = useState("");
  const [transferProofFile, setTransferProofFile] = useState(null);
  const [submittingTransfer, setSubmittingTransfer] = useState(false);

  useEffect(() => {
    const id = searchParams.get("id");

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!id || id === "null" || id === "undefined" || !uuidRegex.test(id)) {
      setPedidoId(null);
      setTimeout(() => {
        navigate("/perfil?tab=orders", { replace: true });
      }, 2000);
      return;
    }

    setPedidoId(id);
  }, [searchParams, navigate]);

  useEffect(() => {
    if (!pedidoId || !token) return;

    let alive = true;

    async function loadOrder() {
      try {
        setLoadingOrder(true);

        const data = await httpJson(buildApiUrl(`/api/orders/${pedidoId}`), {
          headers: { Authorization: `Bearer ${token}` },
        });

        const backendData = data?.data || data;

        if (!alive) return;

        setOrder({
          ...backendData,
          items: Array.isArray(backendData?.items) ? backendData.items : [],
          estatus: backendData?.estatus || backendData?.status || "PENDIENTE",
          tipo_pedido:
            backendData?.tipo_pedido ||
            backendData?.tipoEntrega ||
            backendData?.tipo ||
            "",
        });
      } catch {
        if (alive) {
          setOrder(null);
        }
      } finally {
        if (alive) {
          setLoadingOrder(false);
        }
      }
    }

    loadOrder();

    return () => {
      alive = false;
    };
  }, [pedidoId, token]);

  useEffect(() => {
    if (!pedidoId || !token || !order) return;

    const method = String(
      order?.transaccion?.metodo_codigo || order?.metodo_pago || "",
    ).toUpperCase();
    const providerPaymentId =
      searchParams.get("payment_id") ||
      searchParams.get("collection_id") ||
      null;

    let active = true;
    let timer;

    async function checkPayment(includeProviderId = false) {
      try {
        setCheckingPayment(true);
        const data = await pagosApi.estado(
          pedidoId,
          includeProviderId ? providerPaymentId : null,
        );
        if (!active) return;
        setPaymentState(data);
        setOrder((prev) =>
          prev
            ? {
                ...prev,
                pagado: Boolean(data?.pagado),
                pago_estatus: data?.estado_pago || prev.pago_estatus,
              }
            : prev,
        );
      } catch {
        // Un error de red no significa que el pago haya sido rechazado.
      } finally {
        if (active) setCheckingPayment(false);
      }
    }

    if (method.includes("TARJETA")) {
      checkPayment(Boolean(providerPaymentId));
      timer = window.setInterval(() => checkPayment(false), 5000);
    } else {
      checkPayment(false);
    }

    return () => {
      active = false;
      if (timer) window.clearInterval(timer);
    };
  }, [
    pedidoId,
    token,
    order?.transaccion?.metodo_codigo,
    order?.metodo_pago,
    searchParams,
  ]);

  async function retryCardCheckout() {
    const storageKey = `pmya_pending_payment_key:${pedidoId}`;

    try {
      setCheckingPayment(true);

      const key = getOrCreateIdempotencyKey({
        storageKey,
        prefix: `payment:${pedidoId}`,
        fingerprint: String(pedidoId),
      });

      const data = await pagosApi.iniciarCheckoutTarjeta(pedidoId, key);

      if (!data?.checkout_url) {
        throw new Error("No se obtuvo la liga de pago");
      }

      clearIdempotencyKey(storageKey);
      window.location.assign(data.checkout_url);
    } catch (error) {
      window.alert(error?.message || "No fue posible abrir el pago seguro");
    } finally {
      setCheckingPayment(false);
    }
  }

  async function submitTransferProof(event) {
    event.preventDefault();
    try {
      setSubmittingTransfer(true);
      let proofUrl = "";
      if (transferProofFile) {
        const uploaded =
          await pagosApi.subirComprobanteTransferencia(transferProofFile);
        proofUrl = uploaded?.secure_url || uploaded?.url || "";
      }

      const data = await pagosApi.enviarComprobanteTransferencia(pedidoId, {
        referencia: transferReference,
        comprobante_url: proofUrl,
      });
      setPaymentState((prev) => ({
        ...(prev || {}),
        estado_pago: "EN_REVISION",
        referencia: data?.referencia || transferReference,
      }));
      setOrder((prev) =>
        prev ? { ...prev, pago_estatus: "EN_REVISION" } : prev,
      );
    } catch (error) {
      window.alert(error?.message || "No se pudo enviar el comprobante");
    } finally {
      setSubmittingTransfer(false);
    }
  }

  const paymentMethodCode = String(
    order?.transaccion?.metodo_codigo || order?.metodo_pago || "",
  ).toUpperCase();
  const paymentStatus = String(
    paymentState?.estado_pago || order?.pago_estatus || "PENDIENTE",
  ).toUpperCase();
  const paymentPaid = paymentState?.pagado === true || order?.pagado === true;
  const cardPending = paymentMethodCode.includes("TARJETA") && !paymentPaid;
  const transferPending =
    paymentMethodCode.includes("TRANSFERENCIA") && !paymentPaid;

  const progressSteps = useMemo(
    () => getProgressSteps(order?.estatus),
    [order?.estatus],
  );

  const nextStep = useMemo(() => getMensajeSiguientePaso(order), [order]);

  if (!pedidoId) {
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
          <h2 style={{ fontSize: 22, marginBottom: 8 }}>
            Cargando información del pedido...
          </h2>
          <p style={{ color: "#6b7280" }}>Redirigiendo a tus pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .pm-confirm-wrap {
          min-height: calc(100vh - 200px);
          background: linear-gradient(180deg, #fff7ed 0%, #f8fafc 100%);
          padding: 40px 20px 60px;
        }
        .pm-confirm-container {
          max-width: 980px;
          margin: 0 auto;
        }
        .pm-confirm-card {
          background: #fff;
          border-radius: 24px;
          padding: 36px;
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
          border: 1px solid #e5e7eb;
        }
        .pm-success-icon {
          width: 92px;
          height: 92px;
          border-radius: 999px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #10b981, #22c55e);
          box-shadow: 0 14px 30px rgba(16, 185, 129, 0.25);
        }
        .pm-title {
          font-size: 34px;
          font-weight: 900;
          color: #111827;
          margin: 0 0 10px;
          text-align: center;
        }
        .pm-subtitle {
          text-align: center;
          color: #6b7280;
          font-size: 16px;
          margin: 0 auto 28px;
          max-width: 700px;
          line-height: 1.6;
        }
        .pm-hero-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 20px;
          margin-top: 26px;
        }
        .pm-block {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          padding: 20px;
        }
        .pm-block-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 17px;
          font-weight: 800;
          color: #111827;
          margin-bottom: 16px;
        }
        .pm-summary-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }
        .pm-info-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: .5px;
          color: #94a3b8;
          margin-bottom: 4px;
          font-weight: 700;
        }
        .pm-info-value {
          font-size: 15px;
          color: #111827;
          font-weight: 700;
          word-break: break-word;
        }
        .pm-order-id {
          font-size: 22px;
          color: #FF6A00;
          font-weight: 900;
        }
        .pm-next-step {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          color: #065f46;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          border-radius: 16px;
          padding: 16px 18px;
        }
        .pm-progress-wrap {
          margin-top: 22px;
        }
        .pm-progress-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        .pm-step {
          position: relative;
          text-align: center;
        }
        .pm-step-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          margin: 0 auto 8px;
          border: 2px solid #cbd5e1;
          background: #fff;
        }
        .pm-step.done .pm-step-dot {
          background: #10b981;
          border-color: #10b981;
        }
        .pm-step-label {
          font-size: 13px;
          color: #64748b;
          font-weight: 700;
        }
        .pm-step.done .pm-step-label {
          color: #111827;
        }
        .pm-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 30px;
        }
        .pm-btn {
          min-width: 210px;
          padding: 14px 22px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          font-weight: 800;
          font-size: 15px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: .2s ease;
        }
        .pm-btn-primary {
          background: #111827;
          color: #fff;
        }
        .pm-btn-primary:hover {
          opacity: .92;
        }
        .pm-btn-secondary {
          background: #fff;
          color: #111827;
          border: 1px solid #d1d5db;
        }
        .pm-btn-secondary:hover {
          background: #f9fafb;
        }
        .pm-btn-accent {
          background: #FF6A00;
          color: #fff;
        }
        .pm-btn-accent:hover {
          opacity: .92;
        }
        .pm-items-preview {
          margin-top: 16px;
          border-top: 1px solid #e5e7eb;
          padding-top: 14px;
          display: grid;
          gap: 10px;
        }
        .pm-item-row {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          font-size: 14px;
          color: #374151;
        }
        .pm-note {
          text-align: center;
          color: #64748b;
          margin-top: 18px;
          font-size: 14px;
        }
        .pm-payment-box {
          margin: 22px 0 0;
          border: 1px solid #fed7aa;
          background: #fff7ed;
          color: #7c2d12;
          border-radius: 16px;
          padding: 16px;
        }
        .pm-payment-box.success {
          border-color: #a7f3d0;
          background: #ecfdf5;
          color: #065f46;
        }
        .pm-payment-title {
          display: flex;
          gap: 10px;
          align-items: center;
          font-weight: 900;
          margin-bottom: 8px;
        }
        .pm-payment-form {
          display: grid;
          gap: 10px;
          margin-top: 14px;
        }
        .pm-payment-form input {
          width: 100%;
          box-sizing: border-box;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #fdba74;
          background: #fff;
        }

        @media (max-width: 860px) {
          .pm-hero-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .pm-confirm-card {
            padding: 22px;
          }
          .pm-title {
            font-size: 28px;
          }
          .pm-summary-grid {
            grid-template-columns: 1fr;
          }
          .pm-progress-row {
            grid-template-columns: 1fr 1fr;
            row-gap: 16px;
          }
          .pm-btn {
            width: 100%;
            min-width: 0;
          }
        }
      `}</style>

      <div className="pm-confirm-wrap">
        <div className="pm-confirm-container">
          <div className="pm-confirm-card">
            <div className="pm-success-icon">
              <CheckCircle size={52} color="white" />
            </div>

            <h1 className="pm-title">
              {cardPending
                ? "Estamos verificando tu pago"
                : "¡Pedido confirmado!"}
            </h1>
            <p className="pm-subtitle">
              {cardPending
                ? "No vuelvas a pagar todavía. La confirmación se recuperará mediante Mercado Pago aunque se haya perdido la respuesta del navegador."
                : "Tu pedido fue recibido correctamente. Puedes revisar su avance y el estado del pago desde esta pantalla o desde mis pedidos."}
            </p>

            <div className={`pm-payment-box ${paymentPaid ? "success" : ""}`}>
              <div className="pm-payment-title">
                {paymentPaid ? (
                  <CheckCircle size={20} />
                ) : cardPending ? (
                  <RefreshCw size={20} />
                ) : (
                  <AlertCircle size={20} />
                )}
                Estado del pago: {paymentPaid ? "PAGADO" : paymentStatus}
              </div>

              {cardPending ? (
                <>
                  <div>
                    {checkingPayment
                      ? "Consultando el estado real del pago..."
                      : "El pago aún no está confirmado. Puedes volver a comprobarlo o abrir el mismo checkout sin crear otro pedido."}
                  </div>
                  <button
                    className="pm-btn pm-btn-accent"
                    style={{ marginTop: 12 }}
                    type="button"
                    disabled={checkingPayment}
                    onClick={retryCardCheckout}
                  >
                    <CreditCard size={17} /> Continuar o reintentar pago
                  </button>
                </>
              ) : null}

              {transferPending && paymentStatus !== "EN_REVISION" ? (
                <form
                  className="pm-payment-form"
                  onSubmit={submitTransferProof}
                >
                  <div>
                    Después de realizar la transferencia, envía la referencia
                    bancaria. El administrador deberá validarla antes de marcar
                    el pedido como pagado.
                  </div>
                  <input
                    value={transferReference}
                    onChange={(event) =>
                      setTransferReference(event.target.value)
                    }
                    placeholder="Referencia, clave de rastreo o folio SPEI"
                    minLength={6}
                    required
                  />
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) =>
                      setTransferProofFile(event.target.files?.[0] || null)
                    }
                  />
                  <button
                    className="pm-btn pm-btn-accent"
                    type="submit"
                    disabled={submittingTransfer}
                  >
                    {submittingTransfer ? "Enviando..." : "Enviar a revisión"}
                  </button>
                </form>
              ) : null}

              {transferPending && paymentStatus === "EN_REVISION" ? (
                <div>
                  Tu comprobante está en revisión. No vuelvas a transferir.
                </div>
              ) : null}
            </div>

            <div className="pm-hero-grid">
              <section className="pm-block">
                <div className="pm-block-title">
                  <Receipt size={18} color="#FF6A00" />
                  Resumen del pedido
                </div>

                <div className="pm-summary-grid">
                  <div>
                    <div className="pm-info-label">Folio / ID</div>
                    <div className="pm-info-value pm-order-id">
                      #{order?.folio || pedidoId}
                    </div>
                  </div>

                  <div>
                    <div className="pm-info-label">Estado actual</div>
                    <div className="pm-info-value">
                      {order?.estatus || "Pendiente"}
                    </div>
                  </div>

                  <div>
                    <div className="pm-info-label">Fecha</div>
                    <div className="pm-info-value">
                      {formatDate(order?.created_at)}
                    </div>
                  </div>

                  <div>
                    <div className="pm-info-label">Tipo de pedido</div>
                    <div className="pm-info-value">
                      {getTipoPedidoLabel(order?.tipo_pedido)}
                    </div>
                  </div>

                  <div>
                    <div className="pm-info-label">Total</div>
                    <div className="pm-info-value">
                      {formatCurrency(order?.total || 0)}
                    </div>
                  </div>

                  <div>
                    <div className="pm-info-label">Método de pago</div>
                    <div className="pm-info-value">
                      {order?.metodo_pago || "Efectivo"}
                    </div>
                  </div>

                  {order?.direccion_entrega ? (
                    <div style={{ gridColumn: "1 / -1" }}>
                      <div className="pm-info-label">Dirección de entrega</div>
                      <div className="pm-info-value">
                        {order.direccion_entrega}
                      </div>
                    </div>
                  ) : null}
                </div>

                {order?.items?.length > 0 ? (
                  <div className="pm-items-preview">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div className="pm-item-row" key={`${item.id || index}`}>
                        <span>
                          {item.cantidad || 1} ×{" "}
                          {item.nombre_snapshot ||
                            item.nombre ||
                            item.producto_nombre ||
                            "Producto"}
                        </span>
                        <strong>
                          {formatCurrency(
                            item.total_item ||
                              (item.precio_unitario || item.precio || 0) *
                                (item.cantidad || 1),
                          )}
                        </strong>
                      </div>
                    ))}

                    {order.items.length > 3 ? (
                      <div
                        style={{
                          color: "#64748b",
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        + {order.items.length - 3} producto(s) más
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </section>

              <section className="pm-block">
                <div className="pm-block-title">
                  <Clock size={18} color="#FF6A00" />
                  Qué sigue ahora
                </div>

                <div className="pm-next-step">
                  <div style={{ marginTop: 2 }}>{nextStep.icon}</div>
                  <div>
                    <div
                      style={{
                        fontWeight: 800,
                        color: "#065f46",
                        marginBottom: 4,
                      }}
                    >
                      {nextStep.title}
                    </div>
                    <div style={{ color: "#047857", lineHeight: 1.6 }}>
                      {nextStep.text}
                    </div>
                  </div>
                </div>

                <div className="pm-progress-wrap">
                  <div className="pm-block-title" style={{ marginTop: 18 }}>
                    <Package size={18} color="#FF6A00" />
                    Seguimiento del pedido
                  </div>

                  <div className="pm-progress-row">
                    {progressSteps.map((step) => (
                      <div
                        className={`pm-step ${step.done ? "done" : ""}`}
                        key={step.key}
                      >
                        <div className="pm-step-dot" />
                        <div className="pm-step-label">{step.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 20,
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    color: "#475569",
                    background: "#f8fafc",
                    borderRadius: 14,
                    padding: "14px 16px",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <Clock size={18} color="#FF6A00" />
                  <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                    Recibirás actualizaciones conforme avance tu pedido. Puedes
                    consultar los cambios desde la vista de detalle.
                  </div>
                </div>
              </section>
            </div>

            <div className="pm-actions">
              <button
                className="pm-btn pm-btn-primary"
                onClick={() => navigate(`/orders/${pedidoId}`)}
              >
                Ver seguimiento <ArrowRight size={16} />
              </button>

              <button
                className="pm-btn pm-btn-accent"
                onClick={() => navigate("/perfil?tab=orders")}
              >
                Ir a mis pedidos
              </button>

              <button
                className="pm-btn pm-btn-secondary"
                onClick={() => navigate("/catalogo")}
              >
                <ShoppingBag size={16} />
                Seguir comprando
              </button>
            </div>

            <p className="pm-note">
              {loadingOrder
                ? "Cargando información detallada del pedido..."
                : "Tu compra quedó registrada correctamente."}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
