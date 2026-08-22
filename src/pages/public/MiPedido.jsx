import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CarritoContext.jsx";
import ConfirmModal from "../../components/ui/ConfirmModal.jsx";

export default function MiPedido() {
  const nav = useNavigate();
  const { items, updateQty, removeItem, clearCart, deliveryMethod } = useCart();
  const [openClearModal, setOpenClearModal] = useState(false);

  const subtotal = useMemo(() => {
    return (items || []).reduce(
      (acc, it) =>
        acc + Number(it.precioUnitario || 0) * Number(it.cantidad || 1),
      0,
    );
  }, [items]);

  const total = subtotal;

  function handleOpenClearCart() {
    if (!items?.length) return;
    setOpenClearModal(true);
  }

  function handleConfirmClearCart() {
    clearCart();
    setOpenClearModal(false);
  }

  return (
    <>
      <style>{`
        .pmya-wrap{ max-width: 980px; margin: 0 auto; padding: 26px 22px 60px; }
        .pmya-title{ font-size: 22px; font-weight: 1000; margin: 0 0 16px; color:#111; }
        .pmya-card{ background:#fff; border-radius: 18px; box-shadow: 0 10px 22px rgba(0,0,0,.08); border: 1px solid #eee; overflow:hidden; padding: 16px; }
        .pmya-progress{ display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:18px; }
        .pmya-step{ background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:12px; font-size:12px; font-weight:800; color:#64748b; text-align:center; }
        .pmya-step.active{ background:#fff7ed; border-color:#fdba74; color:#c2410c; }
        .item{ border:1px solid #eee; border-radius: 14px; padding: 12px; display:flex; gap: 12px; align-items:flex-start; }
        .thumb{ width: 64px; height: 64px; border-radius: 12px; overflow:hidden; background:#f1f1f1; flex: 0 0 auto; }
        .thumb img{ width:100%; height:100%; object-fit:cover; display:block; }
        .info{ flex:1; min-width: 0; }
        .nameRow{ display:flex; justify-content:space-between; gap:12px; align-items:flex-start; }
        .name{ font-weight: 1000; font-size: 14px; color:#111; margin:0; }
        .subt{ font-weight: 900; color:#111; font-size: 12px; text-align:right; }
        .subt b{ font-size: 14px; }
        .desc{ font-size: 12px; color:#666; margin-top: 4px; line-height:1.4; }
        .price{ margin-top: 8px; font-weight: 1000; color:#FF6A00; }
        .controls{ margin-top: 10px; display:flex; justify-content: space-between; align-items:center; gap: 12px; flex-wrap:wrap; }
        .qty{ display:flex; align-items:center; gap:10px; border:1px solid #eee; border-radius: 12px; padding: 6px 8px; }
        .qty button{ width: 28px; height: 28px; border-radius: 10px; border:1px solid #eee; background:#fff; cursor:pointer; font-weight: 1000; }
        .qty span{ min-width: 18px; text-align:center; font-weight: 1000; }
        .remove{ border:none; background:transparent; color:#d11; font-weight: 900; cursor:pointer; display:flex; align-items:center; gap:6px; }
        .sum{ margin-top: 14px; border-top: 1px solid #eee; padding-top: 12px; display:grid; gap: 8px; }
        .row{ display:flex; justify-content: space-between; align-items:center; font-size: 13px; color:#333; }
        .row b{ font-weight: 1000; color:#111; }
        .row.total{ margin-top: 4px; font-size: 14px; }
        .row.total b{ color:#FF6A00; font-size: 16px; }
        .note{ margin-top: 10px; background:#fff3e8; border:1px solid #ffe0c7; color:#9a4a12; border-radius: 12px; padding: 10px 12px; font-size: 12px; }
        .btnRow{ margin-top: 14px; display:flex; gap: 12px; }
        @media (max-width:520px){ .btnRow{ flex-direction: column; } .pmya-progress{ grid-template-columns:1fr; } }
        .btnPrimary{ flex: 1; background:#FF6A00; color:#fff; border:none; border-radius: 12px; padding: 12px 14px; font-weight: 1000; cursor:pointer; }
        .btnSecondary{ flex: 1; background:#f2f2f2; color:#111; border:none; border-radius: 12px; padding: 12px 14px; font-weight: 1000; cursor:pointer; }
        .empty{ color:#666; font-size: 13px; }
      `}</style>

      <div className="pmya-wrap">
        <h1 className="pmya-title">Mi Pedido</h1>

        <div className="pmya-progress">
          <div className="pmya-step active">1. Revisa tu carrito</div>
          <div className="pmya-step">2. Elige entrega</div>
          <div className="pmya-step">3. Confirma tu pedido</div>
        </div>

        <div className="pmya-card">
          {(items?.length || 0) === 0 ? (
            <div className="empty">Tu pedido está vacío.</div>
          ) : (
            <>
              <div style={{ display: "grid", gap: 12 }}>
                {items.map((it) => {
                  const lineSubtotal =
                    Number(it.precioUnitario || 0) * Number(it.cantidad || 1);

                  return (
                    <div className="item" key={it.id}>
                      <div className="thumb">
                        {it.imagen_url ? (
                          <img src={it.imagen_url} alt={it.nombre} />
                        ) : null}
                      </div>

                      <div className="info">
                        <div className="nameRow">
                          <div>
                            <p className="name">{it.nombre}</p>
                            <div className="desc">
                              {it.ingredientes_txt ? (
                                <>
                                  Ingredientes: {it.ingredientes_txt}
                                  <br />
                                </>
                              ) : null}
                              {it.tamano ? (
                                <>
                                  Tamaño: {it.tamano}
                                  <br />
                                </>
                              ) : null}
                              {deliveryMethod ? (
                                <>
                                  Entrega:{" "}
                                  {deliveryMethod === "pickup"
                                    ? "Recoger en tienda"
                                    : "A domicilio"}
                                </>
                              ) : null}
                            </div>
                          </div>

                          <div className="subt">
                            Subtotal
                            <br />
                            <b>${lineSubtotal.toFixed(2)}</b>
                          </div>
                        </div>

                        <div className="price">
                          ${Number(it.precioUnitario || 0).toFixed(2)}
                        </div>

                        <div className="controls">
                          <div className="qty">
                            <button
                              type="button"
                              onClick={() => updateQty(it.id, it.cantidad - 1)}
                            >
                              -
                            </button>
                            <span>{it.cantidad}</span>
                            <button
                              type="button"
                              onClick={() => updateQty(it.id, it.cantidad + 1)}
                            >
                              +
                            </button>
                          </div>

                          <button
                            className="remove"
                            type="button"
                            onClick={() => removeItem(it.id)}
                          >
                            🗑️ Quitar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="sum">
                <div className="row">
                  <span>Subtotal:</span>
                  <b>${subtotal.toFixed(2)}</b>
                </div>
                <div className="row">
                  <span>Envío:</span>
                  <b>Gratis</b>
                </div>

                {deliveryMethod === "pickup" ? (
                  <div className="note">
                    ✅ Tu pedido está configurado para recoger en tienda.
                  </div>
                ) : null}

                <div className="row total">
                  <span>
                    <b>Total:</b>
                  </span>
                  <b>${total.toFixed(2)}</b>
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
                    className="btnSecondary"
                    type="button"
                    onClick={handleOpenClearCart}
                  >
                    Vaciar pedido
                  </button>

                  <button
                    className="btnPrimary"
                    type="button"
                    onClick={() => {
                      if (!items.length) return;
                      if (!deliveryMethod) return nav("/tipo-entrega");
                      nav("/carrito");
                    }}
                  >
                    Continuar con el pedido
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        open={openClearModal}
        title="Vaciar pedido"
        message="¿Seguro que deseas vaciar tu pedido actual?"
        confirmText="Sí, vaciar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleConfirmClearCart}
        onClose={() => setOpenClearModal(false)}
      />
    </>
  );
}
