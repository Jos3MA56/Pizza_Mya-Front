import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { adminLegalApi } from "../../api/adminLegal.api.js";
import Loader from "../../components/ui/Loader.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import AdminButton from "../../components/admin/ui/AdminButton.jsx";
import AdminPageHeader from "../../components/admin/ui/AdminPageHeader.jsx";
import AdminPanel from "../../components/admin/ui/AdminPanel.jsx";
import {
  inputStyle,
  softPanelStyle,
} from "../../components/admin/ui/adminTheme.js";

const DEFAULT_SLUGS = [
  {
    slug: "terminos-y-condiciones",
    titulo: "Términos y condiciones",
    route: "/terminos",
  },
  {
    slug: "aviso-privacidad",
    titulo: "Aviso de privacidad",
    route: "/aviso-privacidad",
  },
  {
    slug: "politica-pedidos",
    titulo: "Política de pedidos",
    route: "/politica-pedidos",
  },
  {
    slug: "cancelaciones",
    titulo: "Cambios y cancelaciones",
    route: "/cancelaciones",
  },
  {
    slug: "cookies",
    titulo: "Uso de cookies",
    route: "/cookies",
  },
];

const EMPTY_FORM = {
  titulo: "",
  resumen: "",
  contenido: "",
  activo: true,
  orden: 0,
};

function normalizePages(items = []) {
  const map = new Map();

  for (const page of Array.isArray(items) ? items : []) {
    if (page?.slug) map.set(page.slug, page);
  }

  return DEFAULT_SLUGS.map((base, index) => ({
    ...base,
    ...(map.get(base.slug) || {}),
    orden: Number(map.get(base.slug)?.orden ?? index + 1),
  }));
}

function getPreview(text = "") {
  const clean = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return "Sin contenido capturado.";
  return clean.length > 140 ? `${clean.slice(0, 140)}...` : clean;
}

function Message({ message }) {
  if (!message) return null;

  const isError = message.type === "error";

  return (
    <div
      style={{
        ...softPanelStyle({
          padding: 14,
          background: isError ? "#fff1f2" : "#ecfdf5",
        }),
        color: isError ? "#991b1b" : "#065f46",
        fontWeight: 800,
        borderColor: isError ? "#fecdd3" : "#a7f3d0",
      }}
    >
      {message.text}
    </div>
  );
}

export default function AdminLegal() {
  const { token } = useAuth();
  const [pages, setPages] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState(DEFAULT_SLUGS[0].slug);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const selectedBase = useMemo(
    () =>
      DEFAULT_SLUGS.find((item) => item.slug === selectedSlug) ||
      DEFAULT_SLUGS[0],
    [selectedSlug],
  );

  const selectedPage = useMemo(
    () => pages.find((item) => item.slug === selectedSlug) || null,
    [pages, selectedSlug],
  );

  const loadPages = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setMessage(null);
      const data = await adminLegalApi.list({ token });
      const normalized = normalizePages(data);
      setPages(normalized);

      const current =
        normalized.find((item) => item.slug === selectedSlug) || normalized[0];
      setSelectedSlug(current.slug);
      setForm({
        titulo: current.titulo || "",
        resumen: current.resumen || "",
        contenido: current.contenido || "",
        activo: current.activo !== false,
        orden: Number(current.orden || 0),
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error?.message || "No se pudieron cargar los documentos legales",
      });
    } finally {
      setLoading(false);
    }
  }, [token, selectedSlug]);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  useEffect(() => {
    const current = pages.find((item) => item.slug === selectedSlug);
    if (!current) return;

    setForm({
      titulo: current.titulo || "",
      resumen: current.resumen || "",
      contenido: current.contenido || "",
      activo: current.activo !== false,
      orden: Number(current.orden || 0),
    });
  }, [selectedSlug, pages]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage(null);

      const updated = await adminLegalApi.update({
        token,
        slug: selectedSlug,
        data: form,
      });

      setPages((prev) =>
        normalizePages(
          prev.map((item) =>
            item.slug === selectedSlug ? { ...item, ...updated } : item,
          ),
        ),
      );

      setMessage({
        type: "success",
        text: "Documento legal actualizado correctamente",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error?.message || "No se pudo guardar el documento legal",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{`
        .legal-admin-grid {
          display: grid;
          grid-template-columns: var(--adm-grid-catalogos);
          gap: 18px;
          align-items: start;
        }
        .legal-admin-list {
          display: grid;
          gap: 10px;
        }
        .legal-admin-item {
          width: 100%;
          border: 1px solid #ead9c9;
          border-radius: 18px;
          background: #fff;
          padding: 14px;
          text-align: left;
          cursor: pointer;
          transition: border-color .15s ease, box-shadow .15s ease, transform .15s ease;
        }
        .legal-admin-item:hover {
          border-color: #d9b89d;
          transform: translateY(-1px);
          box-shadow: 0 12px 24px rgba(62, 32, 18, .07);
        }
        .legal-admin-item.is-active {
          border-color: #9b2118;
          box-shadow: 0 0 0 3px rgba(155,33,24,.08);
        }
        .legal-admin-item strong {
          display: block;
          color: #261510;
          margin-bottom: 6px;
        }
        .legal-admin-item span {
          display: block;
          color: #756861;
          font-size: .86rem;
          line-height: 1.45;
        }
        .legal-admin-status {
          display: inline-flex;
          margin-top: 10px;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: .75rem;
          font-weight: 900;
        }
        .legal-admin-status.on {
          color: #065f46;
          background: #d1fae5;
        }
        .legal-admin-status.off {
          color: #991b1b;
          background: #fee2e2;
        }
        .legal-admin-form {
          display: grid;
          gap: 14px;
        }
        .legal-admin-form label {
          display: grid;
          gap: 7px;
          color: #3b2a22;
          font-weight: 900;
        }
        .legal-admin-form small {
          color: #756861;
          font-weight: 700;
          line-height: 1.5;
        }
        .legal-admin-actions {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }
        .legal-admin-url {
          color: #9b2118;
          font-weight: 900;
          text-decoration: none;
        }
        @media (max-width: 980px) {
          .legal-admin-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 560px) {
          .legal-admin-actions { justify-content: stretch; }
          .legal-admin-actions > * { flex: 1 1 100%; }
        }
      `}</style>

      <div style={{ display: "grid", gap: 18 }}>
        <AdminPageHeader
          title="Información legal"
          subtitle="Edita los textos que aparecen en el footer: términos, aviso de privacidad, pedidos, cancelaciones y cookies."
        />

        <Message message={message} />

        {loading ? (
          <AdminPanel>
            <Loader text="Cargando documentos legales..." />
          </AdminPanel>
        ) : pages.length === 0 ? (
          <AdminPanel>
            <EmptyState
              title="Sin documentos"
              text="Ejecuta la migración SQL para crear los documentos legales."
            />
          </AdminPanel>
        ) : (
          <div className="legal-admin-grid">
            <AdminPanel title="Documentos">
              <div className="legal-admin-list">
                {pages.map((page) => (
                  <button
                    key={page.slug}
                    className={`legal-admin-item ${page.slug === selectedSlug ? "is-active" : ""}`}
                    type="button"
                    onClick={() => setSelectedSlug(page.slug)}
                  >
                    <strong>{page.titulo}</strong>
                    <span>{page.resumen || getPreview(page.contenido)}</span>
                    <em
                      className={`legal-admin-status ${page.activo !== false ? "on" : "off"}`}
                    >
                      {page.activo !== false ? "Visible" : "Oculto"}
                    </em>
                  </button>
                ))}
              </div>
            </AdminPanel>

            <AdminPanel title={selectedPage?.titulo || selectedBase.titulo}>
              <form className="legal-admin-form" onSubmit={handleSave}>
                <label>
                  Título
                  <input
                    style={inputStyle()}
                    value={form.titulo}
                    onChange={(event) =>
                      updateField("titulo", event.target.value)
                    }
                    placeholder="Título visible para clientes"
                    maxLength={180}
                    required
                  />
                </label>

                <label>
                  Resumen
                  <textarea
                    style={{
                      ...inputStyle(),
                      minHeight: 82,
                      resize: "vertical",
                    }}
                    value={form.resumen}
                    onChange={(event) =>
                      updateField("resumen", event.target.value)
                    }
                    placeholder="Resumen corto que aparecerá debajo del título"
                    maxLength={500}
                  />
                </label>

                <label>
                  Contenido
                  <textarea
                    style={{
                      ...inputStyle(),
                      minHeight: 360,
                      resize: "vertical",
                      lineHeight: 1.65,
                    }}
                    value={form.contenido}
                    onChange={(event) =>
                      updateField("contenido", event.target.value)
                    }
                    placeholder="Escribe el contenido legal. Usa saltos de línea para separar secciones."
                    required
                  />
                </label>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "var(--adm-grid-two)",
                    gap: 12,
                  }}
                >
                  <label>
                    Orden
                    <input
                      style={inputStyle()}
                      type="number"
                      value={form.orden}
                      onChange={(event) =>
                        updateField("orden", event.target.value)
                      }
                    />
                  </label>

                  <label style={{ alignSelf: "end" }}>
                    <span>Visibilidad</span>
                    <select
                      style={inputStyle()}
                      value={form.activo ? "true" : "false"}
                      onChange={(event) =>
                        updateField("activo", event.target.value === "true")
                      }
                    >
                      <option value="true">Visible para clientes</option>
                      <option value="false">Oculto</option>
                    </select>
                  </label>
                </div>

                <div className="legal-admin-actions">
                  <a
                    className="legal-admin-url"
                    href={selectedBase.route}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver página pública
                  </a>

                  <AdminButton type="submit" disabled={saving}>
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </AdminButton>
                </div>
              </form>
            </AdminPanel>
          </div>
        )}
      </div>
    </>
  );
}
