import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { combosApi } from "../../api/combos.api.js";
import { useCart } from "../../context/CarritoContext.jsx";
import { useToast } from "../../components/ui/ToastProvider.jsx";

function formatPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export default function ComboDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const toast = useToast();

  const [combo, setCombo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadCombo() {
      try {
        setLoading(true);
        setErr("");

        const data = await combosApi.detail(id);

        if (!mounted) return;
        setCombo(data || null);
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || "No se pudo cargar el combo");
        setCombo(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (id) {
      loadCombo();
    }

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleAddComboToCart = () => {
    if (!combo || !Array.isArray(combo.items) || combo.items.length === 0) {
      toast.warning("Este combo no tiene productos configurados todavía.");
      return;
    }

    setAdding(true);

    try {
      addItem({
        tipo: "combo",
        combo_id: combo.id,
        nombre: combo.nombre,
        precioUnitario: Number(combo.precio_combo || 0),
        imagen_url: combo.imagen_url || null,
        cantidad: 1,
        combo_items: combo.items.map((item) => ({
          id: item.id,
          producto_id: item.producto_id,
          cantidad: Number(item.cantidad || 1),
          producto_nombre: item.producto_nombre,
          producto_tamanio: item.producto_tamanio || null,
          producto_precio_base: Number(item.producto_precio_base || 0),
          producto_imagen_url: item.producto_imagen_url || null,
          producto_tamanio_id: item.producto_tamanio_id || null,
        })),
      });

      toast.success("Combo agregado al carrito.");
      navigate("/carrito");
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      <style>{`
        .cmd-page{
          max-width: 1100px;
          margin: 0 auto;
          padding: 36px 24px 56px;
        }
        .cmd-back{
          border:none;
          background:#fff;
          border-radius:12px;
          padding:12px 18px;
          font-weight:900;
          cursor:pointer;
          box-shadow:0 6px 14px rgba(0,0,0,.08);
          margin-bottom:22px;
        }
        .cmd-card{
          background:#fff;
          border-radius:24px;
          overflow:hidden;
          border:1px solid #ececec;
          box-shadow:0 14px 28px rgba(0,0,0,.08);
          display:grid;
          grid-template-columns: 1fr 1fr;
        }
        .cmd-media{
          min-height:420px;
          background:#f4f4f4;
        }
        .cmd-image{
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
        }
        .cmd-fallback{
          width:100%;
          height:100%;
          display:flex;
          align-items:center;
          justify-content:center;
          background:linear-gradient(135deg,#ff8a00,#ff3d00);
          font-size:100px;
        }
        .cmd-body{
          padding:32px;
        }
        .cmd-title{
          margin:0 0 10px;
          font-size:40px;
          line-height:1;
          font-weight:1000;
          color:#111;
        }
        .cmd-desc{
          margin:0 0 18px;
          font-size:15px;
          color:#666;
          line-height:1.6;
        }
        .cmd-price{
          margin:0 0 24px;
          color:#e50914;
          font-size:38px;
          font-weight:1000;
        }
        .cmd-note{
          margin:-10px 0 22px;
          color:#9a3412;
          font-size:13px;
          font-weight:700;
          line-height:1.5;
          background:#fff7ed;
          border:1px solid #fed7aa;
          padding:10px 12px;
          border-radius:12px;
        }
        .cmd-sub{
          margin:0 0 12px;
          font-size:18px;
          font-weight:900;
          color:#111;
        }
        .cmd-list{
          display:grid;
          gap:10px;
          margin-bottom:28px;
        }
        .cmd-item{
          background:#fafafa;
          border:1px solid #eee;
          border-radius:14px;
          padding:14px 16px;
          font-weight:700;
          color:#374151;
        }
        .cmd-actions{
          display:flex;
          gap:12px;
          flex-wrap:wrap;
        }
        .cmd-btn{
          border:none;
          border-radius:14px;
          padding:14px 20px;
          font-weight:900;
          cursor:pointer;
        }
        .cmd-btn.primary{
          background:#ff6a00;
          color:#fff;
        }
        .cmd-btn.secondary{
          background:#f3f4f6;
          color:#111;
        }
        .cmd-btn:disabled{
          opacity:.7;
          cursor:not-allowed;
        }
        .cmd-state{
          background:#fff;
          border:1px solid #ececec;
          border-radius:20px;
          padding:34px 24px;
          text-align:center;
          box-shadow:0 10px 24px rgba(0,0,0,.06);
        }
        .cmd-state h3{
          margin:0 0 8px;
          font-size:28px;
          color:#111;
        }
        .cmd-state p{
          margin:0;
          color:#666;
          font-weight:700;
        }
        @media (max-width: 900px){
          .cmd-card{
            grid-template-columns: 1fr;
          }
          .cmd-media{
            min-height:280px;
          }
        }
      `}</style>

      <div className="cmd-page">
        <button className="cmd-back" onClick={() => navigate("/combos")}>
          ← Volver a combos
        </button>

        {loading ? (
          <div className="cmd-state">
            <h3>Cargando combo...</h3>
            <p>Espera un momento.</p>
          </div>
        ) : err ? (
          <div className="cmd-state">
            <h3>Error</h3>
            <p>{err}</p>
          </div>
        ) : !combo ? (
          <div className="cmd-state">
            <h3>Combo no encontrado</h3>
            <p>No existe o no está disponible.</p>
          </div>
        ) : (
          <div className="cmd-card">
            <div className="cmd-media">
              {combo.imagen_url ? (
                <img
                  className="cmd-image"
                  src={combo.imagen_url}
                  alt={combo.nombre || "Combo"}
                />
              ) : (
                <div className="cmd-fallback">🎁</div>
              )}
            </div>

            <div className="cmd-body">
              <h1 className="cmd-title">{combo.nombre}</h1>
              <p className="cmd-desc">
                {combo.descripcion || "Combo disponible por tiempo limitado."}
              </p>

              <p className="cmd-price">{formatPrice(combo.precio_combo)}</p>

              <h3 className="cmd-sub">Incluye:</h3>

              <div className="cmd-list">
                {Array.isArray(combo.items) && combo.items.length > 0 ? (
                  combo.items.map((item) => (
                    <div key={item.id} className="cmd-item">
                      {item.cantidad} x {item.producto_nombre}
                      {item.producto_tamanio
                        ? ` (${item.producto_tamanio})`
                        : ""}
                    </div>
                  ))
                ) : (
                  <div className="cmd-item">
                    Este combo no tiene productos configurados.
                  </div>
                )}
              </div>

              <div className="cmd-actions">
                <button
                  className="cmd-btn primary"
                  type="button"
                  onClick={handleAddComboToCart}
                  disabled={adding}
                >
                  {adding ? "Agregando..." : "Agregar al carrito"}
                </button>

                <button
                  className="cmd-btn secondary"
                  type="button"
                  onClick={() => navigate("/combos")}
                >
                  Seguir viendo combos
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
