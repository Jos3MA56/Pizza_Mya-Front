import { useEffect, useRef } from "react";
import { X, ShoppingCart, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CarritoContext.jsx";
import { useToast } from "../../components/ui/ToastProvider.jsx";
import CartRecommendations from "../../components/cart/CartRecommendations.jsx";

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function CarritoDrawer({ open, onClose }) {
  const nav = useNavigate();
  const toast = useToast();
  const dialogRef = useRef(null);
  const previousActiveRef = useRef(null);

  const { items, incQty, decQty, removeItem, totals, deliveryMethod } =
    useCart();

  const subtotal = Number(totals?.subtotal || 0);

  useEffect(() => {
    if (!open) return undefined;

    previousActiveRef.current = document.activeElement;

    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalWidth = document.body.style.width;

    document.body.style.overflow = "hidden";
    document.body.style.position = "relative";
    document.body.style.width = "100%";

    const focusables = dialogRef.current?.querySelectorAll(FOCUSABLE_SELECTOR);
    (focusables?.[0] || dialogRef.current)?.focus?.();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
        return;
      }

      if (event.key !== "Tab") return;

      const nodes = Array.from(
        dialogRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) || [],
      );

      if (!nodes.length) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);

      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.width = originalWidth;

      previousActiveRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleClose = () => {
    if (typeof onClose === "function") {
      onClose();
      return;
    }

    nav("/catalogo");
  };

  const handleContinueShopping = () => {
    handleClose();
    nav("/catalogo");
  };

  const handleProceedToCheckout = () => {
    if (!items?.length) {
      toast.warning(
        "Tu carrito está vacío. Agrega un producto antes de continuar.",
      );
      return;
    }

    if (!deliveryMethod) {
      handleClose();
      nav("/tipo-entrega?next=/entrega");
      return;
    }

    handleClose();
    nav("/entrega");
  };

  return (
    <>
      <style>{`
        .pmya-overlay,
        .pmya-overlay * ,
        .pmya-drawer,
        .pmya-drawer * {
          box-sizing: border-box;
        }

        .pmya-overlay {
          position: fixed;
          inset: 0;
          background: rgba(2, 6, 23, 0.64);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 9998;
        }

        .pmya-drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: min(410px, 94vw);
          height: 100vh;
          height: 100dvh;
          max-height: 100dvh;
          background: #fff;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          box-shadow: -22px 0 52px rgba(15, 23, 42, 0.22);
          border-top-left-radius: 24px;
          border-bottom-left-radius: 24px;
          overflow: hidden;
        }

        .pmya-head {
          flex: 0 0 auto;
          background: linear-gradient(135deg, #ff6a00, #ff8d3a);
          color: #fff;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .pmya-headLeft {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 1000;
          font-size: 18px;
          line-height: 1.2;
        }

        .pmya-close {
          width: 38px;
          height: 38px;
          flex: 0 0 auto;
          border-radius: 14px;
          border: none;
          background: rgba(255, 255, 255, 0.16);
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pmya-body {
          flex: 1 1 auto;
          min-height: 0;
          padding: 16px;
          overflow-y: auto;
          overflow-x: hidden;
          background: #fff;
          -webkit-overflow-scrolling: touch;
        }

        .pmya-empty {
          color: #64748b;
          font-size: 13px;
          border: 1px dashed #cbd5e1;
          border-radius: 18px;
          padding: 24px 18px;
          text-align: center;
          margin: 20px 0;
          background: #f8fafc;
        }

        .pmya-emptyIcon {
          font-size: 48px;
          margin-bottom: 12px;
          opacity: 0.7;
        }

        .pmya-item {
          display: flex;
          gap: 12px;
          padding: 14px;
          border-radius: 18px;
          border: 1px solid #e5e7eb;
          margin-bottom: 12px;
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04);
          min-width: 0;
        }

        .pmya-thumb {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: #f1f5f9;
          overflow: hidden;
          flex: 0 0 auto;
        }

        .pmya-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .pmya-mid {
          flex: 1;
          min-width: 0;
        }

        .pmya-name {
          font-weight: 1000;
          font-size: 15px;
          color: #111827;
          margin: 0;
          line-height: 1.35;
          overflow-wrap: anywhere;
        }

        .pmya-price {
          font-weight: 1000;
          color: #ff6a00;
          font-size: 16px;
          margin-top: 4px;
        }

        .pmya-controls {
          margin-top: 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .pmya-qty {
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 6px 8px;
          background: #fff;
        }

        .pmya-qty button {
          width: 32px;
          height: 32px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          background: #fff;
          cursor: pointer;
          font-weight: 1000;
          font-size: 16px;
        }

        .pmya-qty span {
          min-width: 20px;
          text-align: center;
          font-weight: 1000;
          font-size: 15px;
        }

        .pmya-remove {
          border: none;
          background: transparent;
          cursor: pointer;
          color: #94a3b8;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
        }

        .pmya-remove:hover {
          color: #dc2626;
        }

        .pmya-foot {
          flex: 0 0 auto;
          border-top: 1px solid #e5e7eb;
          padding: 14px 16px calc(16px + env(safe-area-inset-bottom));
          background: #fff;
          box-shadow: 0 -8px 24px rgba(15, 23, 42, 0.06);
        }

        .pmya-totalRow {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 1000;
          margin-bottom: 12px;
          color: #111827;
          gap: 12px;
        }

        .pmya-totalRow span {
          font-size: 17px;
        }

        .pmya-totalRow b {
          color: #ff6a00;
          font-size: 22px;
          white-space: nowrap;
        }

        .pmya-btnContinue,
        .pmya-pay {
          width: 100%;
          min-height: 48px;
          border-radius: 14px;
          padding: 12px 14px;
          font-weight: 900;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 15px;
        }

        .pmya-btnContinue {
          border: 1px solid #e5e7eb;
          background: #f8fafc;
          color: #111827;
          margin-bottom: 10px;
        }

        .pmya-pay {
          border: none;
          background: #111827;
          color: #fff;
        }

        .pmya-pay:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 640px) {
          .pmya-overlay {
            background: rgba(2, 6, 23, 0.72);
          }

          .pmya-drawer {
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            width: 100vw;
            max-width: 100vw;
            height: 100svh;
            height: 100dvh;
            max-height: 100dvh;
            border-radius: 0;
            box-shadow: none;
          }

          .pmya-head {
            padding: 18px 18px 16px;
          }

          .pmya-headLeft {
            font-size: 22px;
          }

          .pmya-close {
            width: 44px;
            height: 44px;
            border-radius: 16px;
          }

          .pmya-body {
            padding: 16px;
          }

          .pmya-item {
            gap: 12px;
            padding: 14px;
            border-radius: 20px;
          }

          .pmya-thumb {
            width: 68px;
            height: 68px;
          }

          .pmya-name {
            font-size: 16px;
          }

          .pmya-price {
            font-size: 18px;
          }

          .pmya-controls {
            align-items: center;
          }

          .pmya-foot {
            padding: 14px 16px calc(18px + env(safe-area-inset-bottom));
          }

          .pmya-btnContinue,
          .pmya-pay {
            min-height: 52px;
            font-size: 16px;
          }
        }

        @media (max-width: 380px) {
          .pmya-body {
            padding: 12px;
          }

          .pmya-item {
            padding: 12px;
            gap: 10px;
          }

          .pmya-thumb {
            width: 58px;
            height: 58px;
          }

          .pmya-name {
            font-size: 14px;
          }

          .pmya-price {
            font-size: 16px;
          }

          .pmya-qty {
            gap: 8px;
            padding: 5px 7px;
          }

          .pmya-qty button {
            width: 30px;
            height: 30px;
          }

          .pmya-foot {
            padding-left: 12px;
            padding-right: 12px;
          }
        }
      `}</style>

      <div className="pmya-overlay" onClick={handleContinueShopping} />

      <aside
        ref={dialogRef}
        className="pmya-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Tu pedido"
        tabIndex={-1}
      >
        <div className="pmya-head">
          <div className="pmya-headLeft">
            <ShoppingCart size={22} />
            <span>Tu pedido</span>
          </div>

          <button
            className="pmya-close"
            type="button"
            onClick={handleContinueShopping}
            aria-label="Cerrar carrito"
          >
            <X size={22} />
          </button>
        </div>

        <div className="pmya-body">
          {items?.length ? (
            items.map((it) => (
              <div className="pmya-item" key={it.id}>
                <div className="pmya-thumb">
                  {it.imagen_url ? (
                    <img src={it.imagen_url} alt={it.nombre} />
                  ) : null}
                </div>

                <div className="pmya-mid">
                  <p className="pmya-name">
                    {it.tipo === "combo" ? `🎁 ${it.nombre}` : it.nombre}
                  </p>

                  <div className="pmya-price">
                    ${Number(it.precioUnitario || 0).toFixed(2)}
                    {it.tipo === "combo" &&
                    Array.isArray(it.combo_items) &&
                    it.combo_items.length > 0 ? (
                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 12,
                          color: "#64748b",
                          fontWeight: 700,
                          lineHeight: 1.35,
                        }}
                      >
                        {it.combo_items
                          .map((x) => `${x.cantidad}x ${x.producto_nombre}`)
                          .join(" · ")}
                      </div>
                    ) : null}
                  </div>

                  <div className="pmya-controls">
                    <div
                      className="pmya-qty"
                      aria-label={`Cantidad de ${it.nombre}`}
                    >
                      <button
                        type="button"
                        onClick={() => decQty(it.id)}
                        aria-label={`Disminuir cantidad de ${it.nombre}`}
                      >
                        −
                      </button>

                      <span aria-live="polite">{it.cantidad}</span>

                      <button
                        type="button"
                        onClick={() => incQty(it.id)}
                        aria-label={`Aumentar cantidad de ${it.nombre}`}
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="pmya-remove"
                      type="button"
                      onClick={() => removeItem(it.id)}
                      aria-label={`Eliminar ${it.nombre}`}
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="pmya-empty">
              <div className="pmya-emptyIcon">🛒</div>

              <div
                style={{
                  fontWeight: 900,
                  marginBottom: "6px",
                  color: "#111827",
                }}
              >
                Tu pedido está vacío
              </div>

              <div
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  marginBottom: "16px",
                }}
              >
                Agrega productos desde el catálogo para continuar.
              </div>
            </div>
          )}

          <CartRecommendations items={items} />
        </div>

        <div className="pmya-foot">
          <div className="pmya-totalRow">
            <span>Total:</span>
            <b>${subtotal.toFixed(2)}</b>
          </div>

          <button
            className="pmya-btnContinue"
            type="button"
            onClick={handleContinueShopping}
          >
            <ArrowLeft size={18} />
            Seguir comprando
          </button>

          <button
            className="pmya-pay"
            type="button"
            disabled={!items?.length}
            onClick={handleProceedToCheckout}
          >
            Proceder al pago
          </button>
        </div>
      </aside>
    </>
  );
}

