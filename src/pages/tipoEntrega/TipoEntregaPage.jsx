import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../../context/CarritoContext.jsx";
import { Bike, Store } from "lucide-react";

export default function TipoEntregaPage() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/entrega";
  const { setDeliveryMethod, items, totals } = useCart();
  const subtotal = Number(totals?.subtotal || 0);

  // Fix: la función go() ya navega a `next`, no llamar nav() otra vez después
  const go = (method) => {
    setDeliveryMethod(method);
    nav(next, { replace: true });
  };

  return (
    <>
      <style>{`
        .wrap{ max-width: 980px; margin:0 auto; padding: 40px 22px; }
        .row{ display:flex; gap: 28px; justify-content: space-between; }
        @media (max-width:720px){ .row{ flex-direction:column; } }
        .btn{
          flex:1;
          background:#6f6f6f;
          color:#fff;
          border:none;
          border-radius: 16px;
          padding: 22px 18px;
          font-weight: 900;
          font-size: 16px;
          cursor:pointer;
          box-shadow: 0 10px 20px rgba(0,0,0,.10);
          display:flex;
          justify-content:center;
          align-items:center;
          gap: 10px;
          transition: opacity .2s;
        }
        .btn:hover{ opacity: .88; }
        .summary{ max-width:720px; margin:0 auto 24px; background:#fff; border:1px solid #eee; border-radius:16px; padding:14px 16px; box-shadow:0 10px 20px rgba(0,0,0,.06); display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; }
        .summary strong{ color:#111; }
        .summary span{ color:#64748b; font-weight:700; }
      `}</style>

      <h1 style={{ textAlign: "center", color: "#111", marginBottom: 40 }}>
        ¿Elige el tipo de pedido?
      </h1>

      <div className="wrap">
        <div className="summary">
          <strong>{items?.length || 0} producto(s) en tu pedido</strong>
          <span>Subtotal actual: ${subtotal.toFixed(2)}</span>
        </div>
        <div className="row">
          <button className="btn" type="button" onClick={() => go("delivery")}>
            <Bike size={22} />
            Enviar a domicilio
          </button>

          <button className="btn" type="button" onClick={() => go("pickup")}>
            <Store size={22} />
            Recoger en tienda
          </button>
        </div>
      </div>
    </>
  );
}
