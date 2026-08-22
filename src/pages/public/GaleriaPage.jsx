import { useEffect, useMemo, useState } from "react";
import { galeriaApi } from "../../api/galeria.api.js";
import CloudinaryImage from "../../components/cloudinary/CloudinaryImage.jsx";

function getTitle(item) {
  return item?.titulo || "Pizza Mya";
}

function getDescription(item) {
  return item?.descripcion || "Imagen del negocio";
}

export default function GaleriaPage() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const data = await galeriaApi.list();

        if (!cancelled) {
          setItems(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "No se pudo cargar la galería");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleItems = useMemo(
    () => items.filter((item) => item?.visible !== false),
    [items],
  );

  return (
    <>
      <style>{`
        .gal-wrap{
          max-width:1200px;
          margin:0 auto;
          padding:38px 20px 56px;
        }
        .gal-hero{
          border-radius:30px;
          padding:34px 28px;
          background:linear-gradient(135deg,#fff7ed,#ffffff 55%,#fff1f2);
          border:1px solid #fde7d3;
          box-shadow:0 20px 50px rgba(124,45,18,.08);
          margin-bottom:26px;
        }
        .gal-kicker{
          margin:0 0 8px;
          color:#c2410c;
          font-weight:1000;
          letter-spacing:.08em;
          text-transform:uppercase;
          font-size:13px;
        }
        .gal-title{
          margin:0;
          font-size:clamp(34px,5vw,54px);
          font-weight:1000;
          color:#111827;
          line-height:1.02;
        }
        .gal-sub{
          max-width:720px;
          margin:12px 0 0;
          color:#6b7280;
          font-size:17px;
          font-weight:700;
          line-height:1.65;
        }
        .gal-grid{
          display:grid;
          grid-template-columns:repeat(auto-fill,minmax(250px,1fr));
          gap:18px;
        }
        .gal-card{
          background:#fff;
          border-radius:22px;
          overflow:hidden;
          box-shadow:0 10px 24px rgba(0,0,0,.08);
          border:1px solid #ececec;
          cursor:pointer;
          transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease;
          text-align:left;
          padding:0;
          font-family:inherit;
        }
        .gal-card:hover{
          transform:translateY(-4px);
          box-shadow:0 16px 32px rgba(0,0,0,.12);
          border-color:#fed7aa;
        }
        .gal-img{
          width:100%;
          height:245px;
          object-fit:cover;
          display:block;
          background:#f3f4f6;
        }
        .gal-body{padding:16px;}
        .gal-name{
          margin:0 0 8px;
          font-size:20px;
          font-weight:1000;
          color:#111827;
        }
        .gal-desc{
          margin:0;
          color:#6b7280;
          line-height:1.6;
          font-weight:600;
        }
        .gal-state{
          background:#fff;
          border-radius:22px;
          padding:30px 24px;
          box-shadow:0 10px 24px rgba(0,0,0,.08);
          border:1px solid #eee;
          color:#6b7280;
          font-weight:800;
        }
        .gal-modal{
          position:fixed;
          inset:0;
          background:rgba(0,0,0,.72);
          display:flex;
          align-items:center;
          justify-content:center;
          padding:20px;
          z-index:9999;
        }
        .gal-modalCard{
          width:min(980px,100%);
          background:#fff;
          border-radius:24px;
          overflow:hidden;
          box-shadow:0 20px 60px rgba(0,0,0,.35);
        }
        .gal-modalImg{
          width:100%;
          max-height:70vh;
          object-fit:cover;
          display:block;
          background:#f3f4f6;
        }
        .gal-modalBody{padding:22px;}
        .gal-modalTitle{margin:0 0 10px;font-size:28px;font-weight:1000;color:#111827;}
        .gal-modalDesc{margin:0 0 16px;color:#6b7280;line-height:1.7;font-weight:650;}
        .gal-close{
          border:none;
          border-radius:14px;
          background:#111827;
          color:#fff;
          padding:11px 16px;
          font-weight:900;
          cursor:pointer;
          font-family:inherit;
        }
      `}</style>

      <section className="gal-wrap">
        <div className="gal-hero">
          <p className="gal-kicker">Pizza Mya</p>
          <h1 className="gal-title">Galería</h1>
          <p className="gal-sub">
            Conoce el local, el ambiente, los productos y algunos momentos de
            Pizza Mya.
          </p>
        </div>

        {loading ? (
          <div className="gal-state">Cargando galería...</div>
        ) : error ? (
          <div className="gal-state">{error}</div>
        ) : visibleItems.length === 0 ? (
          <div className="gal-state">
            Aún no hay imágenes disponibles en la galería.
          </div>
        ) : (
          <div className="gal-grid">
            {visibleItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className="gal-card"
                onClick={() => setSelected(item)}
                aria-label={`Ver imagen ${getTitle(item)}`}
              >
                <CloudinaryImage
                  className="gal-img"
                  src={item.imagen_url}
                  alt={getTitle(item)}
                  width={520}
                  height={420}
                />
                <div className="gal-body">
                  <h2 className="gal-name">{getTitle(item)}</h2>
                  <p className="gal-desc">{getDescription(item)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {selected ? (
        <div
          className="gal-modal"
          onClick={() => setSelected(null)}
          role="presentation"
        >
          <div
            className="gal-modalCard"
            onClick={(event) => event.stopPropagation()}
          >
            <CloudinaryImage
              className="gal-modalImg"
              src={selected.imagen_url}
              alt={getTitle(selected)}
              width={1100}
              height={760}
            />
            <div className="gal-modalBody">
              <h2 className="gal-modalTitle">{getTitle(selected)}</h2>
              <p className="gal-modalDesc">{getDescription(selected)}</p>
              <button
                type="button"
                className="gal-close"
                onClick={() => setSelected(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
