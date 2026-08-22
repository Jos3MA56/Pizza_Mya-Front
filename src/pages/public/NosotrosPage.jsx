import { useEffect, useState } from "react";
import { httpJson, buildApiUrl } from "../../api/http.js";

export default function NosotrosPage() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const data = await httpJson(buildApiUrl("/api/configuracion"));
        if (!cancelled) {
          setConfig(data || null);
        }
      } catch {
        if (!cancelled) {
          setConfig(null);
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

  const historia =
    config?.historia_negocio ||
    "Pizza Mya nació con la idea de ofrecer pizzas preparadas con sabor, rapidez y una atención cercana para cada cliente.";

  const mision =
    config?.mision ||
    "Brindar alimentos de calidad con excelente servicio, precios accesibles y una experiencia agradable para cada persona que nos visita.";

  const vision =
    config?.vision ||
    "Consolidarnos como una pizzería reconocida por su sabor, atención y confianza en la comunidad.";

  const valores =
    config?.valores ||
    "Calidad, higiene, responsabilidad, atención al cliente, rapidez y compromiso.";

  return (
    <>
      <style>{`
        .nos-wrap{max-width:1100px;margin:0 auto;padding:34px 20px 54px;}
        .nos-hero{background:linear-gradient(135deg,#ff7a00,#ff4500);color:#fff;border-radius:28px;padding:34px 28px;box-shadow:0 18px 36px rgba(0,0,0,.12);margin-bottom:24px;}
        .nos-title{margin:0 0 10px;font-size:42px;font-weight:1000;}
        .nos-sub{margin:0;line-height:1.7;font-weight:700;max-width:800px;}
        .nos-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px;}
        .nos-card{background:#fff;border-radius:22px;padding:22px;box-shadow:0 10px 24px rgba(0,0,0,.08);border:1px solid #ececec;}
        .nos-card h2{margin-top:0;margin-bottom:10px;color:#111827;font-size:24px;}
        .nos-card p{margin:0;color:#6b7280;line-height:1.75;white-space:pre-line;}
      `}</style>

      <section className="nos-wrap">
        <div className="nos-hero">
          <h1 className="nos-title">Acerca de nosotros</h1>
          <p className="nos-sub">
            {loading ? "Cargando información..." : historia}
          </p>
        </div>

        <div className="nos-grid">
          <article className="nos-card">
            <h2>Misión</h2>
            <p>{mision}</p>
          </article>

          <article className="nos-card">
            <h2>Visión</h2>
            <p>{vision}</p>
          </article>

          <article className="nos-card">
            <h2>Valores</h2>
            <p>{valores}</p>
          </article>
        </div>
      </section>
    </>
  );
}
