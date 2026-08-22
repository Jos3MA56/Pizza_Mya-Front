import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { legalApi } from "../../api/legal.api.js";
import { getLegalFallback } from "./legalFallbacks.js";

function formatDate(value) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

function LegalContent({ text }) {
  const paragraphs = String(text || "")
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div className="legalPage-content">
      {paragraphs.map((paragraph, index) => {
        const isHeading = /^\d+\.|^[A-ZÁÉÍÓÚÑ][^.!?]{0,60}$/.test(paragraph);
        return isHeading ? (
          <h2 key={index}>{paragraph}</h2>
        ) : (
          <p key={index}>{paragraph}</p>
        );
      })}
    </div>
  );
}

export default function LegalPage({ slug }) {
  const fallback = useMemo(() => getLegalFallback(slug), [slug]);
  const [page, setPage] = useState(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setPage(fallback);

    legalApi
      .get(slug)
      .then((data) => {
        if (active && data) setPage(data);
      })
      .catch(() => {
        if (active) setPage(fallback);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug, fallback]);

  const updated = formatDate(page?.updated_at);

  return (
    <>
      <style>{`
        .legalPage {
          min-height: 70vh;
          background: #fffaf4;
          padding: 46px 18px 70px;
        }
        .legalPage-shell {
          width: min(980px, 100%);
          margin: 0 auto;
        }
        .legalPage-card {
          background: #fff;
          border: 1px solid #ead9c9;
          border-radius: 24px;
          padding: clamp(24px, 4vw, 44px);
          box-shadow: 0 20px 50px rgba(62, 32, 18, .08);
        }
        .legalPage-breadcrumb {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
          color: #8a7264;
          font-weight: 700;
          font-size: .92rem;
          margin-bottom: 18px;
        }
        .legalPage-breadcrumb a {
          color: #9b2118;
          text-decoration: none;
        }
        .legalPage h1 {
          margin: 0;
          font-size: clamp(2rem, 5vw, 3.2rem);
          letter-spacing: -.05em;
          line-height: 1.05;
          color: #261510;
        }
        .legalPage-resumen {
          color: #756861;
          font-size: 1.05rem;
          line-height: 1.7;
          margin: 14px 0 0;
          max-width: 760px;
        }
        .legalPage-meta {
          display: inline-flex;
          margin-top: 18px;
          padding: 8px 12px;
          border-radius: 999px;
          background: #fff4ec;
          color: #9b2118;
          font-size: .85rem;
          font-weight: 800;
        }
        .legalPage-content {
          margin-top: 28px;
          border-top: 1px solid #ead9c9;
          padding-top: 24px;
          color: #3b2a22;
        }
        .legalPage-content h2 {
          margin: 24px 0 8px;
          font-size: 1.2rem;
          color: #261510;
          letter-spacing: -.02em;
        }
        .legalPage-content p {
          margin: 0 0 14px;
          line-height: 1.85;
          color: #53443d;
          white-space: pre-wrap;
        }
        .legalPage-loading {
          opacity: .7;
        }
      `}</style>

      <main className="legalPage">
        <div className="legalPage-shell">
          <article className={`legalPage-card ${loading ? "legalPage-loading" : ""}`}>
            <div className="legalPage-breadcrumb">
              <Link to="/">Inicio</Link>
              <span>/</span>
              <span>Información legal</span>
            </div>

            <h1>{page?.titulo || fallback.titulo}</h1>
            {page?.resumen ? <p className="legalPage-resumen">{page.resumen}</p> : null}
            {updated ? <span className="legalPage-meta">Actualizado: {updated}</span> : null}

            <LegalContent text={page?.contenido || fallback.contenido} />
          </article>
        </div>
      </main>
    </>
  );
}
