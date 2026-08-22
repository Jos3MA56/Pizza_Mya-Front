import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { combosApi } from "../../api/combos.api.js";
import Loader from "../../components/ui/Loader.jsx";

function formatPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export default function CombosPage() {
  const navigate = useNavigate();
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadCombos() {
      try {
        setLoading(true);
        setErr("");

        const data = await combosApi.today();

        if (!alive) return;
        setCombos(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!alive) return;
        setErr(
          e?.message ||
            "No se pudieron cargar los combos disponibles por el momento.",
        );
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadCombos();

    return () => {
      alive = false;
    };
  }, []);

  const hasCombos = useMemo(() => combos.length > 0, [combos]);

  return (
    <>
      <style>{`
        .cb-page{
          max-width: 1200px;
          margin: 0 auto;
          padding: 36px 24px 56px;
        }
        .cb-title{
          font-size: clamp(36px, 5vw, 52px);
          font-weight: 900;
          line-height: 1;
          color: #111827;
          margin: 0 0 10px;
          letter-spacing: -0.5px;
        }
        .cb-subtitle{
          margin: 0 0 28px;
          color: #6b7280;
          font-size: 15px;
          font-weight: 600;
        }
        .cb-grid{
          display:grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 22px;
        }
        .cb-card{
          background:#fff;
          border:1px solid #ececec;
          border-radius:20px;
          overflow:hidden;
          box-shadow: 0 10px 24px rgba(0,0,0,.08);
          transition: transform .18s ease, box-shadow .18s ease;
        }
        .cb-card:hover{
          transform: translateY(-4px);
          box-shadow: 0 14px 30px rgba(0,0,0,.12);
        }
        .cb-image{
          width:100%;
          height:220px;
          object-fit:cover;
          display:block;
          background:#f3f4f6;
        }
        .cb-imageFallback{
          width:100%;
          height:220px;
          background:linear-gradient(135deg,#ff8a00,#ff3d00);
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:72px;
        }
        .cb-body{
          padding:20px;
        }
        .cb-name{
          margin:0 0 8px;
          font-size:28px;
          font-weight:900;
          color:#111827;
        }
        .cb-desc{
          margin:0 0 14px;
          color:#6b7280;
          font-size:14px;
          line-height:1.5;
          min-height:42px;
        }
        .cb-itemsTitle{
          font-size:13px;
          font-weight:900;
          color:#111827;
          margin-bottom:8px;
          text-transform:uppercase;
          letter-spacing:.04em;
        }
        .cb-items{
          display:grid;
          gap:6px;
          margin-bottom:16px;
        }
        .cb-item{
          font-size:14px;
          color:#374151;
          font-weight:700;
        }
        .cb-footer{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:14px;
          margin-top:8px;
          flex-wrap:wrap;
        }
        .cb-price{
          font-size:32px;
          font-weight:1000;
          color:#e50914;
          margin:0;
        }
        .cb-btn{
          border:none;
          border-radius:14px;
          background:#ff6a00;
          color:#fff;
          font-weight:900;
          font-size:14px;
          padding:14px 18px;
          cursor:pointer;
          transition: background .18s ease, transform .18s ease;
        }
        .cb-btn:hover{
          background:#e85f00;
          transform: translateY(-1px);
        }
        .cb-empty,
        .cb-error,
        .cb-loading{
          background:#fff;
          border:1px solid #ececec;
          border-radius:20px;
          padding:34px 24px;
          text-align:center;
          box-shadow: 0 10px 24px rgba(0,0,0,.06);
        }
        .cb-empty h3,
        .cb-error h3,
        .cb-loading h3{
          margin:0 0 8px;
          font-size:28px;
          color:#111827;
        }
        .cb-empty p,
        .cb-error p,
        .cb-loading p{
          margin:0;
          color:#6b7280;
          font-weight:700;
        }

        @media (max-width: 640px){
          .cb-page{
            padding: 24px 16px 40px;
          }
          .cb-name{
            font-size:24px;
          }
          .cb-price{
            font-size:28px;
          }
          .cb-btn{
            width:100%;
          }
          .cb-footer{
            align-items:stretch;
          }
        }
      `}</style>

      <div className="cb-page">
        <h1 className="cb-title">Combos</h1>
        <p className="cb-subtitle">
          Aquí se muestran los combos disponibles para hoy.
        </p>

        {loading ? (
          <div className="cb-loading">
            <Loader text="Cargando los combos de hoy..." />
          </div>
        ) : err ? (
          <div className="cb-error">
            <h3>Error al cargar combos</h3>
            <p>{err}</p>
          </div>
        ) : !hasCombos ? (
          <div className="cb-empty">
            <h3>No hay combos disponibles hoy</h3>
            <p>
              Revisa más tarde o activa el combo para el día actual en el panel
              de administración.
            </p>
          </div>
        ) : (
          <div className="cb-grid">
            {combos.map((combo) => {
              const items = Array.isArray(combo.items) ? combo.items : [];

              return (
                <article key={combo.id} className="cb-card">
                  {combo.imagen_url ? (
                    <img
                      className="cb-image"
                      src={combo.imagen_url}
                      alt={combo.nombre || "Combo"}
                    />
                  ) : (
                    <div className="cb-imageFallback">🎁</div>
                  )}

                  <div className="cb-body">
                    <h2 className="cb-name">{combo.nombre}</h2>
                    <p className="cb-desc">
                      {combo.descripcion || "Combo disponible hoy"}
                    </p>

                    <div className="cb-itemsTitle">Incluye:</div>

                    <div className="cb-items">
                      {items.length > 0 ? (
                        items.map((item) => (
                          <div
                            key={`${combo.id}-${item.id ?? item.producto_nombre}`}
                            className="cb-item"
                          >
                            {item.cantidad} x {item.producto_nombre}
                            {item.producto_tamanio
                              ? ` (${item.producto_tamanio})`
                              : ""}
                          </div>
                        ))
                      ) : (
                        <div className="cb-item">
                          Este combo no tiene productos configurados.
                        </div>
                      )}
                    </div>

                    <div className="cb-footer">
                      <p className="cb-price">
                        {formatPrice(combo.precio_combo)}
                      </p>
                      <button
                        className="cb-btn"
                        type="button"
                        onClick={() => navigate(`/combos/${combo.id}`)}
                      >
                        Ver combo
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
