import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Banknote,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  ExternalLink,
  Landmark,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "../../context/CarritoContext.jsx";
import ConfirmarPedidoModal from "../../components/modal/ConfirmarPedidoModal.jsx";
import { direccionesApi } from "../../api/direcciones.api.js";
import { getStoredToken } from "../../api/http.js";
import {
  confirmarPedido,
  recuperarPedidoPorIdempotencia,
} from "../../api/ordenes.api.js";
import { pagosApi } from "../../api/pagos.api.js";
import {
  getCachedConfig,
  getPublicConfig,
  setCachedConfig,
} from "../../api/configuracion.api.js";
import { useToast } from "../../components/ui/ToastProvider.jsx";
import { getStoreScheduleStatus } from "../../utils/storeHours.js";
import {
  clearIdempotencyKey,
  getOrCreateIdempotencyKey,
} from "../../utils/idempotency.js";

const FIELD_IDS = {
  calle: "entrega-calle",
  numero: "entrega-numero",
  colonia: "entrega-colonia",
  ciudad: "entrega-ciudad",
  estado: "entrega-estado",
  cp: "entrega-cp",
  referencias: "entrega-referencias",
  predeterminada: "entrega-predeterminada",
};

const PAYMENT_METHODS = [
  {
    code: "EFECTIVO",
    title: "Efectivo",
    text: "Paga cuando recibas el pedido o al recogerlo en tienda.",
    badge: "Pago al entregar",
    icon: Banknote,
  },
  {
    code: "TARJETA",
    title: "Tarjeta crédito/débito",
    text: "Completa el pago en el checkout protegido de Mercado Pago.",
    badge: "Pago en línea",
    icon: CreditCard,
    recommended: true,
  },
  {
    code: "TRANSFERENCIA",
    title: "Transferencia SPEI",
    text: "Envía la referencia para que el negocio valide el depósito.",
    badge: "Validación manual",
    icon: Landmark,
  },
];

const ORDER_KEY_STORAGE = "pmya_pending_order";
const paymentKeyStorage = (pedidoId) => `pmya_pending_payment_key:${pedidoId}`;

function Field({ label, required = false, id, children }) {
  return (
    <div>
      <label className={`label${required ? " req" : ""}`} htmlFor={id}>
        {label}
      </label>
      {children}
    </div>
  );
}

function money(value) {
  return Number(value || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

function normalizeItemForPedido(item) {
  if (item.tipo === "combo" && item.combo_id) {
    return {
      tipo: "combo",
      combo_id: item.combo_id,
      cantidad: item.cantidad || 1,
    };
  }

  return {
    tipo: "producto",
    producto_id: item.productoId || item.producto_id || item.id,
    producto_tamanio_id:
      item.producto_tamanio_id || item.productoTamanioId || null,
    cantidad: item.cantidad || 1,
    masa_id: item.masa_id || item.masa?.id || null,
    salsa_id: item.salsa_id || item.salsa?.id || null,
    orilla_id: item.orilla_id || item.orilla?.id || null,
    extras:
      item.extras?.map?.((e) => ({
        id: e.id || e.extra_id,
        cantidad: e.cantidad || 1,
      })) || [],
    sin: item.sin || item.sin_ingredientes || [],
  };
}

function buildDireccionTexto(dir) {
  if (!dir) return null;
  if (dir.texto) return dir.texto;

  const partes = [
    dir.calle?.trim(),
    dir.numero?.trim(),
    dir.colonia?.trim(),
    dir.ciudad?.trim(),
    dir.estado?.trim(),
    dir.cp ? `CP ${dir.cp}` : null,
  ].filter(Boolean);

  let texto = partes.join(", ");

  if (dir.referencias?.trim()) {
    texto += ` - Ref: ${dir.referencias}`;
  }

  return texto;
}

function isDefaultAddress(dir) {
  return (
    dir?.predeterminada === true ||
    dir?.es_predeterminada === true ||
    dir?.principal === true
  );
}

function PaymentModal({
  open,
  total,
  metodoPago,
  setMetodoPago,
  pago,
  setPago,
  config,
  submitting,
  paymentIsValid,
  onClose,
  onConfirm,
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape" && !submitting) {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, submitting]);

  useEffect(() => {
    setCopied(false);
  }, [open, metodoPago]);

  if (!open) return null;

  const selectedMethod = PAYMENT_METHODS.find(
    (item) => item.code === metodoPago,
  );

  const transferAccount =
    config?.clabe_transferencia || config?.cuenta_transferencia || "";

  const copyTransferAccount = async () => {
    if (!transferAccount) return;

    try {
      await navigator.clipboard.writeText(String(transferAccount));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="payModalOverlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <section
        className="payModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
      >
        <div className="payModalHead">
          <div>
            <span>Paso final del pedido</span>
            <h3 id="payment-modal-title">Elige cómo deseas pagar</h3>
            <p>
              Revisa el método y el estado que tendrá tu pago antes de
              confirmar.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar selección de pago"
            disabled={submitting}
          >
            ×
          </button>
        </div>

        <div className="payModalSummary">
          <div className="payModalTotal">
            <span>Total a pagar</span>
            <b>{money(total)}</b>
          </div>

          <div className="paySecurityMini">
            <ShieldCheck size={20} aria-hidden="true" />
            <div>
              <strong>Proceso protegido</strong>
              <small>
                Tu pedido utiliza una clave contra cobros duplicados.
              </small>
            </div>
          </div>
        </div>

        <div
          className="payGrid"
          role="radiogroup"
          aria-label="Métodos de pago disponibles"
        >
          {PAYMENT_METHODS.map((method) => {
            const Icon = method.icon;
            const active = metodoPago === method.code;

            return (
              <button
                key={method.code}
                type="button"
                role="radio"
                aria-checked={active}
                className={`payOption ${active ? "active" : ""}`}
                onClick={() => setMetodoPago(method.code)}
                disabled={submitting}
              >
                <div className="payOptionTop">
                  <span className="payOptionIcon">
                    <Icon size={22} aria-hidden="true" />
                  </span>

                  {active ? (
                    <span className="paySelectedMark" aria-hidden="true">
                      <Check size={15} />
                    </span>
                  ) : null}
                </div>

                <div className="payOptionBadges">
                  <span>{method.badge}</span>
                  {method.recommended ? <em>Recomendado</em> : null}
                </div>

                <strong>{method.title}</strong>
                <p>{method.text}</p>
              </button>
            );
          })}
        </div>

        <div className="payDetails" aria-live="polite">
          {metodoPago === "EFECTIVO" ? (
            <div className="payDetailLayout">
              <span className="payDetailIcon cash">
                <Clock3 size={24} aria-hidden="true" />
              </span>

              <div>
                <h4>Pago pendiente hasta la entrega</h4>
                <p>
                  No se realizará ningún cobro en línea. El personal marcará el
                  pedido como pagado al recibir el efectivo.
                </p>
                <ul>
                  <li>Ten listo el monto indicado.</li>
                  <li>El cambio se registra al cobrar en caja o entrega.</li>
                </ul>
              </div>
            </div>
          ) : null}

          {metodoPago === "TARJETA" ? (
            <div className="payDetailLayout">
              <span className="payDetailIcon card">
                <LockKeyhole size={24} aria-hidden="true" />
              </span>

              <div>
                <div className="payDetailTitleRow">
                  <h4>Pago seguro con Mercado Pago</h4>
                  <span className="payOnlineBadge">Entorno de prueba</span>
                </div>
                <p>
                  Después de crear el pedido te enviaremos al checkout de
                  Mercado Pago. Pizza Mya no captura ni almacena número de
                  tarjeta, fecha de vencimiento o CVV.
                </p>

                <div className="payTrustGrid">
                  <span>
                    <ShieldCheck size={17} /> Datos fuera de Pizza Mya
                  </span>
                  <span>
                    <CheckCircle2 size={17} /> Confirmación automática
                  </span>
                  <span>
                    <ExternalLink size={17} /> Regreso al pedido
                  </span>
                </div>

                <p className="payNotice">
                  Si se interrumpe la conexión, revisa el mismo pedido antes de
                  iniciar otro pago. El sistema podrá recuperar la confirmación.
                </p>
              </div>
            </div>
          ) : null}

          {metodoPago === "TRANSFERENCIA" ? (
            <div className="payDetailLayout transfer">
              <span className="payDetailIcon transfer">
                <ReceiptText size={24} aria-hidden="true" />
              </span>

              <div className="payTransferContent">
                <h4>Transferencia sujeta a revisión</h4>
                <p>
                  El pedido quedará pendiente hasta que el negocio confirme el
                  depósito. El comprobante no sustituye la validación bancaria.
                </p>

                <div className="bankDataGrid">
                  <div>
                    <small>Banco</small>
                    <strong>
                      {config?.banco_transferencia || "Por configurar"}
                    </strong>
                  </div>
                  <div>
                    <small>Titular</small>
                    <strong>
                      {config?.titular_transferencia || "Pizza Mya"}
                    </strong>
                  </div>
                  <div className="bankAccountRow">
                    <span>
                      <small>CLABE o cuenta</small>
                      <strong>
                        {transferAccount || "Solicítala al negocio"}
                      </strong>
                    </span>

                    {transferAccount ? (
                      <button type="button" onClick={copyTransferAccount}>
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? "Copiada" : "Copiar"}
                      </button>
                    ) : null}
                  </div>
                </div>

                <Field
                  label="Referencia bancaria (opcional por ahora)"
                  id="pago-referencia"
                >
                  <input
                    id="pago-referencia"
                    className="inp"
                    value={pago.referencia}
                    onChange={(event) =>
                      setPago((prev) => ({
                        ...prev,
                        referencia: event.target.value,
                      }))
                    }
                    maxLength={120}
                    autoComplete="off"
                    placeholder="Ejemplo: clave de rastreo o folio SPEI"
                  />
                </Field>

                <p className="payNotice">
                  También puedes enviar la referencia y la imagen del
                  comprobante desde la confirmación del pedido.
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="payModalFooter">
          <div className="payFooterMethod">
            <span>Método seleccionado</span>
            <strong>{selectedMethod?.title || "Selecciona una opción"}</strong>
          </div>

          <div className="payModalActions">
            <button
              type="button"
              className="btnSecondary"
              onClick={onClose}
              disabled={submitting}
            >
              Volver
            </button>

            <button
              type="button"
              className="btnPrimary payConfirmButton"
              disabled={!paymentIsValid || submitting}
              onClick={onConfirm}
            >
              {submitting
                ? "Creando pedido..."
                : selectedMethod?.code === "TARJETA"
                  ? "Crear pedido e ir a Mercado Pago"
                  : "Confirmar pedido"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function EntregaPage() {
  const nav = useNavigate();
  const toast = useToast();

  const { items, totals, deliveryMethod, clearDeliveryMethod, clearCart } =
    useCart();

  const [config, setConfig] = useState(() => getCachedConfig());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [pendingDireccionId, setPendingDireccionId] = useState(null);
  const [direcciones, setDirecciones] = useState([]);
  const [selectedDireccionId, setSelectedDireccionId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [metodoPago, setMetodoPago] = useState("EFECTIVO");
  const [pago, setPago] = useState({
    referencia: "",
    tipo_tarjeta: "online_checkout",
  });

  const [form, setForm] = useState({
    calle: "",
    numero: "",
    colonia: "",
    ciudad: "",
    estado: "",
    cp: "",
    referencias: "",
    predeterminada: false,
  });

  const isDelivery = deliveryMethod === "delivery";
  const isPickup = deliveryMethod === "pickup";

  const subtotal = Number(totals?.subtotal || 0);
  const envio =
    isDelivery && items?.length ? Number(config?.costo_envio || 0) : 0;
  const pedidoMinimo = Number(config?.pedido_minimo || 0);
  const total = subtotal + envio;

  const storeStatus = useMemo(() => getStoreScheduleStatus(config), [config]);
  const open = storeStatus.isOpen;

  const direccionPredeterminada = useMemo(() => {
    return (
      direcciones.find((dir) => isDefaultAddress(dir)) || direcciones[0] || null
    );
  }, [direcciones]);

  const direccionSeleccionada = useMemo(() => {
    return (
      direcciones.find(
        (dir) => String(dir.id) === String(selectedDireccionId),
      ) || null
    );
  }, [direcciones, selectedDireccionId]);

  const direccionManualCompleta = useMemo(() => {
    return Boolean(
      form.calle.trim() &&
      form.numero.trim() &&
      form.colonia.trim() &&
      form.ciudad.trim() &&
      form.estado.trim() &&
      form.cp.trim(),
    );
  }, [form]);

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const paymentIsValid = useMemo(() => Boolean(metodoPago), [metodoPago]);

  const canConfirm = useMemo(() => {
    if (!items?.length) return false;
    if (!open) return false;
    if (pedidoMinimo > 0 && subtotal < pedidoMinimo) return false;
    if (isPickup) return true;

    if (isDelivery) {
      return Boolean(selectedDireccionId || direccionManualCompleta);
    }

    return false;
  }, [
    items,
    open,
    pedidoMinimo,
    subtotal,
    isPickup,
    isDelivery,
    selectedDireccionId,
    direccionManualCompleta,
  ]);

  useEffect(() => {
    let cancelled = false;

    getPublicConfig()
      .then((remote) => {
        if (!cancelled && remote) {
          setConfig(remote);
          setCachedConfig(remote);
        }
      })
      .catch(() => null);

    const onConfigUpdated = (event) => {
      if (event?.detail) {
        setConfig(event.detail);
        setCachedConfig(event.detail);
      }
    };

    window.addEventListener("configUpdated", onConfigUpdated);

    return () => {
      cancelled = true;
      window.removeEventListener("configUpdated", onConfigUpdated);
    };
  }, []);

  useEffect(() => {
    if (!isDelivery || !getStoredToken()) return;

    direccionesApi
      .list()
      .then((list) => {
        const safeList = Array.isArray(list) ? list : [];
        setDirecciones(safeList);

        const defaultAddress =
          safeList.find((dir) => isDefaultAddress(dir)) || safeList[0] || null;

        if (defaultAddress?.id) {
          setSelectedDireccionId(String(defaultAddress.id));
        }
      })
      .catch((error) => {
        if (error?.status === 401) {
          toast.warning("Tu sesión expiró. Inicia sesión para continuar.");
          nav("/login?next=/entrega");
        }
      });
  }, [isDelivery, nav, toast]);

  if (!deliveryMethod) {
    return (
      <div style={{ maxWidth: 980, margin: "0 auto", padding: 26 }}>
        <button
          type="button"
          onClick={() => {
            clearDeliveryMethod();
            nav(-1);
          }}
          style={{
            border: "none",
            background: "transparent",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          ← Volver
        </button>

        <div
          style={{
            marginTop: 16,
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: 16,
            padding: 16,
          }}
        >
          <b>Primero elige el tipo de entrega.</b>

          <div style={{ marginTop: 12 }}>
            <button
              type="button"
              onClick={() => nav("/tipo-entrega?next=/entrega")}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "none",
                background: "#FF6A00",
                color: "#fff",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Elegir opción
            </button>
          </div>
        </div>
      </div>
    );
  }

  const abrirPago = (direccionId = null) => {
    setPendingDireccionId(direccionId || null);
    setPaymentOpen(true);
  };

  const handleCrearPedido = async (direccionId) => {
    if (submitting) return null;

    if (!open) {
      toast.error("La tienda está fuera de horario.");
      return null;
    }

    if (pedidoMinimo > 0 && subtotal < pedidoMinimo) {
      toast.error(`El pedido mínimo es de ${money(pedidoMinimo)}`);
      return null;
    }

    if (!paymentIsValid) {
      toast.warning("Revisa el método de pago antes de confirmar.");
      return null;
    }

    try {
      setSubmitting(true);

      const token = getStoredToken();

      if (!token) {
        toast.warning("Debes iniciar sesión para continuar.");
        nav("/login?next=/entrega");
        return null;
      }

      let direccionEntrega = null;

      if (isDelivery) {
        const finalDireccionId = direccionId || selectedDireccionId || null;

        if (finalDireccionId) {
          const addr = direcciones.find(
            (d) => String(d.id) === String(finalDireccionId),
          );

          if (addr) {
            direccionEntrega = buildDireccionTexto(addr);
          }
        } else if (direccionManualCompleta) {
          direccionEntrega = buildDireccionTexto(form);
        }

        if (!direccionEntrega) {
          toast.warning("Selecciona una dirección o agrega una nueva.");
          return null;
        }
      }

      const pedidoData = {
        notas: "",
        tipo_pedido: isDelivery ? "domicilio" : "recoger",
        deliveryMethod,
        direccion_id: isDelivery
          ? direccionId || selectedDireccionId || null
          : null,
        direccion_entrega: direccionEntrega,
        costo_envio: envio,
        descuento: 0,
        metodo_pago: metodoPago,
        pago: {
          metodo: metodoPago,
          referencia: pago.referencia.trim(),
          tipo_tarjeta: pago.tipo_tarjeta,
        },
        items: items.map(normalizeItemForPedido),
      };

      const orderKey = getOrCreateIdempotencyKey({
        storageKey: ORDER_KEY_STORAGE,
        prefix: "order",
        fingerprint: JSON.stringify(pedidoData),
      });

      let data;
      try {
        data = await confirmarPedido(pedidoData, orderKey);
      } catch (error) {
        // Si el servidor alcanzó a crear el pedido pero se perdió la respuesta,
        // recuperamos exactamente el mismo pedido con la clave idempotente.
        if (error?.status === 0 || error?.status >= 500) {
          data = await recuperarPedidoPorIdempotencia(orderKey);
        } else {
          throw error;
        }
      }

      const pedidoId = data?.data?.id || data?.id;

      if (!pedidoId) {
        toast.warning(
          "Pedido creado, pero no se pudo obtener el número. Revisa tu historial.",
        );
        nav("/perfil?tab=orders");
        return null;
      }

      clearIdempotencyKey(ORDER_KEY_STORAGE);
      clearCart?.();
      return pedidoId;
    } catch (error) {
      toast.error(error?.message || "Error al crear el pedido");
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        .wrap{ max-width:1040px; margin:0 auto; padding:26px 22px 60px; }
        .top{ display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
        .back{ border:none; background:transparent; font-weight:900; cursor:pointer; }
        .card{ background:#fff; border:1px solid #eee; border-radius:18px; box-shadow:0 10px 22px rgba(0,0,0,.08); padding:16px; }
        .methodSingle{ width:100%; border:none; border-radius:14px; padding:14px 16px; font-weight:1000; cursor:default; background:#FF6A00; color:#fff; text-align:center; margin-bottom:14px; }
        .grid{ display:grid; grid-template-columns:1.25fr .75fr; gap:16px; }
        @media (max-width:900px){ .grid{ grid-template-columns:1fr; } }
        .formCard{ background:#fff; border:1px solid #eee; border-radius:16px; padding:16px; }
        .h{ font-weight:1000; margin:0 0 10px; font-size:14px; color:#333; }
        .row2{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        @media (max-width:640px){ .row2{ grid-template-columns:1fr; } }
        .label{ display:block; font-size:12px; font-weight:900; color:#333; margin-top:10px; }
        .req::after{ content:" *"; color:#FF6A00; font-weight:1000; }
        .inp{ width:100%; margin-top:6px; padding:10px 12px; border-radius:12px; border:1px solid #eee; outline:none; background:#fafafa; box-sizing:border-box; }
        .inp:focus{ background:#fff; border-color:#ffd2ae; box-shadow:0 0 0 3px rgba(255,106,0,.12); }
        .checkRow{ display:flex; align-items:center; gap:10px; margin-top:12px; color:#444; font-size:12px; font-weight:800; }
        .formBtns,.btnRow{ display:flex; gap:12px; margin-top:14px; }
        @media (max-width:520px){ .formBtns,.btnRow{ flex-direction:column; } }
        .btnCancel,.btnSecondary{ flex:1; background:#fff; border:1px solid #eee; border-radius:12px; padding:12px 14px; font-weight:1000; cursor:pointer; }
        .btnSave,.btnPrimary{ flex:1; background:#FF6A00; color:#fff; border:none; border-radius:12px; padding:12px 14px; font-weight:1000; cursor:pointer; }
        .btnSave:disabled,.btnPrimary:disabled{ opacity:.6; cursor:not-allowed; }
        .tipsCard{ margin-top:14px; background:#fff; border:1px solid #eee; border-radius:16px; padding:16px; }
        .tipsTitle{ font-weight:1000; margin:0 0 8px; color:#333; }
        .tips{ margin:0; padding-left:16px; color:#666; font-size:12px; line-height:1.6; }
        .sumTitle{ font-size:18px; font-weight:1000; margin:0 0 8px; color:#333; }
        .sumRow{ display:flex; justify-content:space-between; margin-top:8px; font-size:13px; color:#444; }
        .sumRow b{ font-weight:1000; }
        .sumTotal{ margin-top:12px; font-size:16px; }
        .sumTotal b{ color:#FF6A00; font-size:20px; }
        .warn{ padding:12px; border-radius:14px; background:#fef2f2; color:#991b1b; font-weight:900; margin-bottom:12px; }
        .info{ padding:12px; border-radius:14px; background:#f8fafc; color:#475569; font-weight:800; margin-bottom:12px; }

        .savedAddressBox{
          margin-bottom:14px;
          border:1px solid #fed7aa;
          background:#fff7ed;
          border-radius:16px;
          padding:14px;
        }

        .savedAddressHead{
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:10px;
          margin-bottom:10px;
        }

        .savedAddressHead strong{
          color:#222;
          font-size:14px;
        }

        .savedAddressHead span{
          background:#ffedd5;
          color:#9a3412;
          border-radius:999px;
          padding:4px 8px;
          font-size:11px;
          font-weight:900;
        }

        .addressOption{
          width:100%;
          border:1px solid #eee;
          background:#fff;
          border-radius:14px;
          padding:12px;
          text-align:left;
          cursor:pointer;
          display:grid;
          grid-template-columns:auto 1fr;
          gap:10px;
          align-items:start;
          box-sizing:border-box;
        }

        .addressOption.active{
          border-color:#FF6A00;
          box-shadow:0 0 0 3px rgba(255,106,0,.12);
        }

        .addressOption input{
          margin-top:4px;
        }

        .addressOption b{
          display:block;
          color:#222;
          margin-bottom:4px;
        }

        .addressOption small{
          display:block;
          color:#666;
          line-height:1.45;
        }

        .addressActions{
          display:flex;
          gap:10px;
          margin-top:10px;
          flex-wrap:wrap;
        }

        .addressActions button{
          border:1px solid #eee;
          background:#fff;
          border-radius:10px;
          padding:9px 12px;
          font-weight:900;
          cursor:pointer;
        }

        .addressActions button:hover{
          border-color:#FF6A00;
          color:#FF6A00;
        }

        .payModalOverlay{
          position:fixed;
          inset:0;
          z-index:150;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:20px;
          background:rgba(15,23,42,.58);
          backdrop-filter:blur(5px);
        }
        .payModal{
          width:min(920px,100%);
          max-height:min(94vh,900px);
          overflow:auto;
          background:#fff;
          border:1px solid rgba(255,255,255,.7);
          border-radius:24px;
          box-shadow:0 30px 90px rgba(15,23,42,.32);
          padding:22px;
          overscroll-behavior:contain;
        }
        .payModalHead{
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:18px;
          margin-bottom:16px;
        }
        .payModalHead span{
          display:block;
          color:#ea580c;
          font-size:11px;
          font-weight:1000;
          text-transform:uppercase;
          letter-spacing:.08em;
        }
        .payModalHead h3{
          margin:5px 0 5px;
          color:#172033;
          font-size:clamp(21px,3vw,28px);
          line-height:1.15;
        }
        .payModalHead p{
          margin:0;
          color:#64748b;
          font-size:13px;
          line-height:1.5;
        }
        .payModalHead > button{
          flex:0 0 auto;
          width:42px;
          height:42px;
          border:1px solid #e2e8f0;
          border-radius:14px;
          background:#fff;
          color:#334155;
          font-size:24px;
          line-height:1;
          font-weight:700;
          cursor:pointer;
        }
        .payModalHead > button:hover{background:#f8fafc;border-color:#cbd5e1;}
        .payModalHead > button:disabled{opacity:.5;cursor:not-allowed;}
        .payModalSummary{
          display:grid;
          grid-template-columns:minmax(0,1fr) minmax(260px,.75fr);
          gap:12px;
          margin-bottom:16px;
        }
        .payModalTotal{
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:16px;
          min-height:74px;
          border:1px solid #e2e8f0;
          background:linear-gradient(135deg,#fff7ed,#fff);
          border-radius:18px;
          padding:15px 18px;
        }
        .payModalTotal span{font-size:14px;font-weight:900;color:#475569;}
        .payModalTotal b{font-size:clamp(24px,4vw,31px);color:#f97316;}
        .paySecurityMini{
          display:flex;
          align-items:center;
          gap:10px;
          border:1px solid #bbf7d0;
          background:#f0fdf4;
          border-radius:18px;
          padding:13px 15px;
          color:#166534;
        }
        .paySecurityMini strong{display:block;font-size:13px;}
        .paySecurityMini small{display:block;margin-top:2px;color:#3f6f4e;line-height:1.35;}
        .payGrid{
          display:grid;
          grid-template-columns:repeat(3,minmax(0,1fr));
          gap:12px;
        }
        .payOption{
          min-height:178px;
          border:1px solid #e2e8f0;
          background:#fff;
          border-radius:18px;
          padding:15px;
          text-align:left;
          cursor:pointer;
          transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease,background .16s ease;
        }
        .payOption:hover:not(:disabled){transform:translateY(-2px);border-color:#fdba74;box-shadow:0 12px 24px rgba(249,115,22,.09);}
        .payOption.active{
          border-color:#f97316;
          background:linear-gradient(145deg,#fff7ed 0%,#fff 75%);
          box-shadow:0 0 0 3px rgba(249,115,22,.14),0 14px 28px rgba(249,115,22,.1);
        }
        .payOption:disabled{cursor:not-allowed;opacity:.7;}
        .payOptionTop{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:11px;}
        .payOptionIcon{
          display:grid;
          place-items:center;
          width:43px;
          height:43px;
          border-radius:14px;
          background:#fff7ed;
          color:#ea580c;
          border:1px solid #fed7aa;
        }
        .payOption.active .payOptionIcon{background:#f97316;color:#fff;border-color:#f97316;}
        .paySelectedMark{
          display:grid;
          place-items:center;
          width:25px;
          height:25px;
          border-radius:999px;
          background:#16a34a;
          color:#fff;
        }
        .payOptionBadges{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:8px;}
        .payOptionBadges span,.payOptionBadges em{
          display:inline-flex;
          border-radius:999px;
          padding:4px 8px;
          font-size:10px;
          line-height:1;
          font-weight:900;
          font-style:normal;
        }
        .payOptionBadges span{background:#f1f5f9;color:#475569;}
        .payOptionBadges em{background:#dcfce7;color:#166534;}
        .payOption strong{display:block;color:#172033;font-size:15px;margin-bottom:6px;}
        .payOption p{margin:0;color:#64748b;font-size:12px;line-height:1.5;}
        .payDetails{
          margin-top:14px;
          border:1px solid #e2e8f0;
          background:#f8fafc;
          border-radius:18px;
          padding:16px;
          color:#475569;
          font-size:13px;
          line-height:1.55;
        }
        .payDetailLayout{display:grid;grid-template-columns:auto minmax(0,1fr);gap:14px;align-items:start;}
        .payDetailIcon{
          display:grid;
          place-items:center;
          width:48px;
          height:48px;
          border-radius:15px;
          border:1px solid;
        }
        .payDetailIcon.cash{background:#fff7ed;color:#c2410c;border-color:#fed7aa;}
        .payDetailIcon.card{background:#eff6ff;color:#1d4ed8;border-color:#bfdbfe;}
        .payDetailIcon.transfer{background:#f5f3ff;color:#6d28d9;border-color:#ddd6fe;}
        .payDetails h4{margin:0 0 5px;color:#172033;font-size:15px;}
        .payDetails p{margin:0;color:#64748b;}
        .payDetails ul{margin:9px 0 0;padding-left:18px;color:#475569;}
        .payDetails li+li{margin-top:3px;}
        .payDetailTitleRow{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;}
        .payOnlineBadge{display:inline-flex;border-radius:999px;background:#dbeafe;color:#1d4ed8;padding:4px 8px;font-size:10px;font-weight:900;}
        .payTrustGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:12px;}
        .payTrustGrid span{display:flex;align-items:center;gap:6px;border:1px solid #dbeafe;background:#fff;color:#334155;border-radius:11px;padding:8px;font-size:11px;font-weight:800;}
        .payTrustGrid svg{color:#2563eb;flex:0 0 auto;}
        .payNotice{margin-top:11px!important;padding:9px 11px;border-radius:11px;background:#fff7ed;color:#9a3412!important;font-size:11px;}
        .payTransferContent{min-width:0;}
        .bankDataGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:12px 0;}
        .bankDataGrid > div{border:1px solid #e2e8f0;background:#fff;border-radius:12px;padding:10px;min-width:0;}
        .bankDataGrid small{display:block;color:#94a3b8;font-size:10px;text-transform:uppercase;letter-spacing:.04em;font-weight:900;}
        .bankDataGrid strong{display:block;margin-top:3px;color:#1e293b;font-size:12px;word-break:break-word;}
        .bankAccountRow{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:12px;}
        .bankAccountRow span{min-width:0;}
        .bankAccountRow button{display:inline-flex;align-items:center;gap:6px;border:1px solid #ddd6fe;background:#f5f3ff;color:#6d28d9;border-radius:10px;padding:8px 10px;font-weight:900;cursor:pointer;}
        .payModalFooter{display:grid;grid-template-columns:minmax(180px,.6fr) minmax(0,1fr);gap:14px;align-items:end;margin-top:16px;padding-top:15px;border-top:1px solid #e2e8f0;}
        .payFooterMethod span{display:block;color:#94a3b8;font-size:10px;text-transform:uppercase;font-weight:900;letter-spacing:.05em;}
        .payFooterMethod strong{display:block;margin-top:3px;color:#172033;font-size:13px;}
        .payModalActions{display:flex;gap:11px;}
        .payModalActions .btnSecondary{max-width:170px;}
        .payConfirmButton{min-height:48px;box-shadow:0 12px 24px rgba(249,115,22,.2);}
        @media (max-width:820px){
          .payModalSummary{grid-template-columns:1fr;}
          .payGrid{grid-template-columns:1fr;}
          .payOption{min-height:auto;}
          .payTrustGrid{grid-template-columns:1fr;}
        }
        @media (max-width:620px){
          .payModalOverlay{padding:0;align-items:flex-end;}
          .payModal{width:100%;max-height:96vh;border-radius:24px 24px 0 0;padding:16px;}
          .payModalFooter{grid-template-columns:1fr;}
          .payModalActions{flex-direction:column-reverse;}
          .payModalActions .btnSecondary{max-width:none;}
          .payDetailLayout{grid-template-columns:1fr;}
          .payDetailIcon{width:42px;height:42px;}
          .bankDataGrid{grid-template-columns:1fr;}
          .bankAccountRow{grid-column:auto;align-items:flex-start;}
        }
      `}</style>

      <div className="wrap">
        <div className="top">
          <button
            className="back"
            type="button"
            onClick={() => {
              clearDeliveryMethod();
              nav("/tipo-entrega?next=/entrega");
            }}
          >
            ← Volver
          </button>
        </div>

        <div className="card">
          <div className="methodSingle">
            {isDelivery ? "Enviar a domicilio" : "Recoger en tienda"}
          </div>

          {!open ? (
            <div className="warn">
              La tienda está fuera de horario. Horario: {storeStatus.schedule}
            </div>
          ) : null}

          {pedidoMinimo > 0 && subtotal < pedidoMinimo ? (
            <div className="info">
              Pedido mínimo: {money(pedidoMinimo)}. Te faltan{" "}
              {money(pedidoMinimo - subtotal)} para confirmar.
            </div>
          ) : null}

          <div className="grid">
            <div>
              {isDelivery ? (
                <>
                  <div className="formCard">
                    {direcciones.length > 0 ? (
                      <div className="savedAddressBox">
                        <div className="savedAddressHead">
                          <strong>Dirección de entrega</strong>

                          {direccionSeleccionada?.id ===
                          direccionPredeterminada?.id ? (
                            <span>Predeterminada</span>
                          ) : null}
                        </div>

                        <label
                          className={`addressOption ${
                            selectedDireccionId ? "active" : ""
                          }`}
                        >
                          <input
                            type="radio"
                            checked={Boolean(selectedDireccionId)}
                            onChange={() =>
                              setSelectedDireccionId(
                                String(
                                  direccionPredeterminada?.id ||
                                    direcciones[0]?.id ||
                                    "",
                                ),
                              )
                            }
                          />

                          <span>
                            <b>
                              {direccionSeleccionada?.calle ||
                                direccionPredeterminada?.calle}{" "}
                              {direccionSeleccionada?.numero ||
                                direccionPredeterminada?.numero}
                            </b>

                            <small>
                              {buildDireccionTexto(
                                direccionSeleccionada ||
                                  direccionPredeterminada,
                              )}
                            </small>
                          </span>
                        </label>

                        <div className="addressActions">
                          <button
                            type="button"
                            onClick={() => setConfirmOpen(true)}
                          >
                            Cambiar dirección
                          </button>
                        </div>
                      </div>
                    ) : null}

                    <div className="h">
                      {direcciones.length > 0
                        ? "Agregar otra dirección"
                        : "Agregar nueva dirección"}
                    </div>

                    <Field label="Calle" required id={FIELD_IDS.calle}>
                      <input
                        id={FIELD_IDS.calle}
                        className="inp"
                        value={form.calle}
                        onChange={(e) => {
                          setSelectedDireccionId("");
                          setField("calle", e.target.value);
                        }}
                      />
                    </Field>

                    <div className="row2">
                      <Field label="Número" required id={FIELD_IDS.numero}>
                        <input
                          id={FIELD_IDS.numero}
                          className="inp"
                          value={form.numero}
                          onChange={(e) => {
                            setSelectedDireccionId("");
                            setField("numero", e.target.value);
                          }}
                        />
                      </Field>

                      <Field label="Colonia" required id={FIELD_IDS.colonia}>
                        <input
                          id={FIELD_IDS.colonia}
                          className="inp"
                          value={form.colonia}
                          onChange={(e) => {
                            setSelectedDireccionId("");
                            setField("colonia", e.target.value);
                          }}
                        />
                      </Field>
                    </div>

                    <div className="row2">
                      <Field label="Ciudad" required id={FIELD_IDS.ciudad}>
                        <input
                          id={FIELD_IDS.ciudad}
                          className="inp"
                          value={form.ciudad}
                          onChange={(e) => {
                            setSelectedDireccionId("");
                            setField("ciudad", e.target.value);
                          }}
                        />
                      </Field>

                      <Field label="Estado" required id={FIELD_IDS.estado}>
                        <input
                          id={FIELD_IDS.estado}
                          className="inp"
                          value={form.estado}
                          onChange={(e) => {
                            setSelectedDireccionId("");
                            setField("estado", e.target.value);
                          }}
                        />
                      </Field>
                    </div>

                    <Field label="Código postal" required id={FIELD_IDS.cp}>
                      <input
                        id={FIELD_IDS.cp}
                        className="inp"
                        value={form.cp}
                        onChange={(e) => {
                          setSelectedDireccionId("");
                          setField("cp", e.target.value);
                        }}
                        inputMode="numeric"
                      />
                    </Field>

                    <Field label="Referencias" id={FIELD_IDS.referencias}>
                      <input
                        id={FIELD_IDS.referencias}
                        className="inp"
                        value={form.referencias}
                        onChange={(e) => {
                          setSelectedDireccionId("");
                          setField("referencias", e.target.value);
                        }}
                      />
                    </Field>

                    <div className="checkRow">
                      <input
                        id={FIELD_IDS.predeterminada}
                        type="checkbox"
                        checked={form.predeterminada}
                        onChange={(e) =>
                          setField("predeterminada", e.target.checked)
                        }
                      />

                      <label htmlFor={FIELD_IDS.predeterminada}>
                        Establecer como dirección predeterminada
                      </label>
                    </div>

                    <div className="formBtns">
                      <button
                        type="button"
                        className="btnCancel"
                        onClick={() => {
                          clearDeliveryMethod();
                          nav("/mi-pedido");
                        }}
                      >
                        Cancelar
                      </button>

                      <button
                        type="button"
                        className="btnSave"
                        disabled={!direccionManualCompleta || submitting}
                        onClick={async () => {
                          if (!getStoredToken()) {
                            toast.warning(
                              "Debes iniciar sesión para guardar direcciones.",
                            );
                            nav("/login?next=/entrega");
                            return;
                          }

                          try {
                            const response = await direccionesApi.create({
                              ...form,
                            });

                            const saved = response?.data || response;

                            if (saved?.id) {
                              setDirecciones((prev) => [saved, ...prev]);
                              setSelectedDireccionId(String(saved.id));
                            }

                            toast.success("Dirección guardada correctamente.");

                            setForm({
                              calle: "",
                              numero: "",
                              colonia: "",
                              ciudad: "",
                              estado: "",
                              cp: "",
                              referencias: "",
                              predeterminada: false,
                            });
                          } catch (error) {
                            toast.error(
                              error?.message ||
                                "No se pudo guardar la dirección",
                            );
                          }
                        }}
                      >
                        Guardar dirección
                      </button>
                    </div>
                  </div>

                  <div className="tipsCard">
                    <div className="tipsTitle">
                      Consejos para una entrega exitosa
                    </div>

                    <ul className="tips">
                      <li>Incluye referencias claras.</li>
                      <li>Verifica el código postal.</li>
                      <li>Indica puntos de referencia cercanos.</li>
                    </ul>
                  </div>
                </>
              ) : (
                <div className="formCard">
                  <div className="h">Recoger en tienda</div>

                  <div style={{ color: "#666", fontSize: 13, lineHeight: 1.6 }}>
                    No necesitas llenar dirección. Tiempo aproximado:{" "}
                    {config?.tiempo_preparacion_min || 40} min.
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="formCard">
                <h3 className="sumTitle">Resumen</h3>

                <div className="sumRow">
                  <span>Subtotal</span>
                  <b>{money(subtotal)}</b>
                </div>

                <div className="sumRow">
                  <span>Envío</span>
                  <b>{money(envio)}</b>
                </div>

                <div className="sumRow">
                  <span>Tiempo estimado</span>
                  <b>{config?.tiempo_preparacion_min || 40} min</b>
                </div>

                <div className="sumRow">
                  <span>Pago</span>
                  <b>Se confirma al final</b>
                </div>

                <div className="sumRow sumTotal">
                  <span>
                    <b>Total</b>
                  </span>
                  <b>{money(total)}</b>
                </div>

                <div className="btnRow">
                  <button
                    className="btnSecondary"
                    type="button"
                    onClick={() => nav("/catalogo")}
                  >
                    Seguir comprando
                  </button>

                  <button
                    className="btnPrimary"
                    type="button"
                    disabled={!canConfirm || submitting}
                    onClick={() => {
                      if (!getStoredToken()) {
                        toast.warning("Debes iniciar sesión para continuar.");
                        nav("/login?next=/entrega");
                        return;
                      }

                      if (isPickup) {
                        abrirPago(null);
                        return;
                      }

                      if (isDelivery && selectedDireccionId) {
                        abrirPago(selectedDireccionId);
                        return;
                      }

                      if (isDelivery && direccionManualCompleta) {
                        abrirPago(null);
                        return;
                      }

                      toast.warning(
                        "Selecciona una dirección o agrega una nueva.",
                      );
                    }}
                  >
                    {submitting ? "Procesando..." : "Continuar al pago"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmarPedidoModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        total={total}
        direcciones={isDelivery ? direcciones : []}
        defaultId={
          selectedDireccionId ||
          direccionPredeterminada?.id ||
          direcciones?.[0]?.id ||
          null
        }
        onConfirm={(direccionId) => {
          setConfirmOpen(false);
          setSelectedDireccionId(String(direccionId || ""));
          abrirPago(direccionId);
        }}
      />

      <PaymentModal
        open={paymentOpen}
        total={total}
        metodoPago={metodoPago}
        setMetodoPago={setMetodoPago}
        pago={pago}
        setPago={setPago}
        config={config}
        submitting={submitting}
        paymentIsValid={paymentIsValid}
        onClose={() => setPaymentOpen(false)}
        onConfirm={async () => {
          const pedidoId = await handleCrearPedido(pendingDireccionId);
          if (!pedidoId) return;

          if (metodoPago === "TARJETA") {
            try {
              const paymentStorageKey = paymentKeyStorage(pedidoId);
              const paymentKey = getOrCreateIdempotencyKey({
                storageKey: paymentStorageKey,
                prefix: `payment:${pedidoId}`,
                fingerprint: String(pedidoId),
              });
              const checkout = await pagosApi.iniciarCheckoutTarjeta(
                pedidoId,
                paymentKey,
              );
              if (!checkout?.checkout_url) {
                throw new Error("No se recibió la liga segura de pago");
              }
              clearIdempotencyKey(paymentStorageKey);
              window.location.assign(checkout.checkout_url);
              return;
            } catch (error) {
              toast.warning(
                error?.message ||
                  "El pedido se creó, pero el pago necesita verificación.",
              );
              nav(`/confirmacion?id=${pedidoId}&payment=verify`);
              return;
            }
          }

          nav(`/confirmacion?id=${pedidoId}`);
        }}
      />
    </>
  );
}
