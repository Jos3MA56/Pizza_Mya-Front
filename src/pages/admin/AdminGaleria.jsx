import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { adminGaleriaApi } from "../../api/adminGaleria.api.js";
import CloudinaryImageField from "../../components/admin/CloudinaryImageField.jsx";
import ConfirmModal from "../../components/ui/ConfirmModal.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Loader from "../../components/ui/Loader.jsx";
import CloudinaryImage from "../../components/cloudinary/CloudinaryImage.jsx";
import AdminButton from "../../components/admin/ui/AdminButton.jsx";
import AdminMetricCard from "../../components/admin/ui/AdminMetricCard.jsx";
import AdminPageHeader from "../../components/admin/ui/AdminPageHeader.jsx";
import AdminPanel from "../../components/admin/ui/AdminPanel.jsx";
import {
  adminTheme,
  inputStyle,
  softPanelStyle,
  subtleBadgeStyle,
} from "../../components/admin/ui/adminTheme.js";

const INITIAL_FORM = {
  titulo: "",
  descripcion: "",
  imagen_url: "",
  public_id: "",
  folder: "pizza-mya/galeria",
  visible: true,
  orden: 0,
};

const FILTERS = [
  { value: "", label: "Todas" },
  { value: "true", label: "Visibles" },
  { value: "false", label: "Ocultas" },
];

function MessageBanner({ message }) {
  if (!message) return null;

  const tone = message.type === "error" ? "danger" : "success";

  return (
    <div
      style={{
        ...softPanelStyle({ padding: 14, background: "#fff" }),
        ...subtleBadgeStyle(tone),
        display: "block",
      }}
    >
      <div style={{ fontWeight: 900 }}>{message.text}</div>
    </div>
  );
}

function normalizeText(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function getImageTitle(item) {
  return item?.titulo || "Imagen de Pizza Mya";
}

export default function AdminGaleria() {
  const { token } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [message, setMessage] = useState(null);
  const [query, setQuery] = useState("");
  const [visibleFilter, setVisibleFilter] = useState("");

  const isEditing = Boolean(editingId);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setMessage(null);

      const data = await adminGaleriaApi.list({
        token,
        q: query,
        visible: visibleFilter,
      });

      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage({
        type: "error",
        text: error?.message || "No se pudo cargar la galería",
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [token, query, visibleFilter]);

  useEffect(() => {
    if (token) loadItems();
  }, [token, loadItems]);

  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [message]);

  const sortedItems = useMemo(() => {
    const q = normalizeText(query);

    return [...items]
      .filter((item) => {
        if (!q) return true;
        return [item?.titulo, item?.descripcion]
          .map(normalizeText)
          .some((text) => text.includes(q));
      })
      .sort((a, b) => {
        const orderA = Number(a?.orden || 0);
        const orderB = Number(b?.orden || 0);
        if (orderA !== orderB) return orderA - orderB;
        return new Date(b?.created_at || 0) - new Date(a?.created_at || 0);
      });
  }, [items, query]);

  const stats = useMemo(() => {
    const visibles = items.filter((item) => item?.visible !== false).length;
    const ocultas = items.length - visibles;

    return {
      total: items.length,
      visibles,
      ocultas,
      ultimoOrden: items.length
        ? Math.max(...items.map((item) => Number(item?.orden || 0)))
        : 0,
    };
  }, [items]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setPendingDeleteId(null);
    setForm({
      titulo: item.titulo || "",
      descripcion: item.descripcion || "",
      imagen_url: item.imagen_url || "",
      public_id: item.public_id || "",
      folder: item.folder || "pizza-mya/galeria",
      visible: item.visible !== false,
      orden: Number(item.orden || 0),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildPayload = () => ({
    titulo: form.titulo,
    descripcion: form.descripcion,
    imagen_url: form.imagen_url,
    public_id: form.public_id || null,
    folder: form.folder || "pizza-mya/galeria",
    visible: Boolean(form.visible),
    orden: Number(form.orden || 0),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!String(form.imagen_url || "").trim()) {
      setMessage({
        type: "error",
        text: "Debes seleccionar, subir o pegar una imagen",
      });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      const payload = buildPayload();

      if (isEditing) {
        await adminGaleriaApi.update({ token, id: editingId, data: payload });
        setMessage({ type: "success", text: "Imagen actualizada" });
      } else {
        await adminGaleriaApi.create({ token, data: payload });
        setMessage({ type: "success", text: "Imagen agregada" });
      }

      resetForm();
      await loadItems();
    } catch (error) {
      setMessage({
        type: "error",
        text: error?.message || "No se pudo guardar la imagen",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisible = async (item) => {
    try {
      await adminGaleriaApi.setVisible({
        token,
        id: item.id,
        visible: item.visible === false,
      });

      setMessage({
        type: "success",
        text: item.visible === false ? "Imagen visible" : "Imagen oculta",
      });

      await loadItems();
    } catch (error) {
      setMessage({
        type: "error",
        text: error?.message || "No se pudo cambiar la visibilidad",
      });
    }
  };

  const handleDelete = async () => {
    if (!pendingDeleteId) return;

    try {
      setDeleting(true);
      await adminGaleriaApi.remove({ token, id: pendingDeleteId });
      setMessage({ type: "success", text: "Imagen eliminada de la galería" });

      if (editingId === pendingDeleteId) resetForm();

      setPendingDeleteId(null);
      await loadItems();
    } catch (error) {
      setMessage({
        type: "error",
        text: error?.message || "No se pudo eliminar la imagen",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <style>{`
        .admin-galeria-shell { display: grid; gap: 18px; }
        .admin-galeria-kpis {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }
        .admin-galeria-main {
          display: grid;
          grid-template-columns: minmax(320px, 420px) minmax(0, 1fr);
          gap: 18px;
          align-items: start;
        }
        .admin-galeria-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
        }
        .admin-galeria-toolbar {
          display: grid;
          grid-template-columns: minmax(220px, 1fr) 170px auto;
          gap: 10px;
          align-items: end;
          margin-bottom: 16px;
        }
        .admin-galeria-card-img {
          width: 100%;
          height: 180px;
          object-fit: cover;
          display: block;
          background: #f3f4f6;
        }
        @media (max-width: 1120px) {
          .admin-galeria-kpis,
          .admin-galeria-main,
          .admin-galeria-toolbar {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="admin-galeria-shell">
        <AdminPageHeader
          eyebrow="Contenido visual"
          title="Galería del negocio"
          subtitle="Administra las fotografías que se muestran en la página pública de Pizza Mya. Puedes subir imágenes, ordenarlas, ocultarlas o eliminarlas."
        />

        <MessageBanner message={message} />

        <section className="admin-galeria-kpis">
          <AdminMetricCard
            title="Imágenes totales"
            value={stats.total}
            helper="Registros activos"
            icon="▣"
            tone="primary"
          />
          <AdminMetricCard
            title="Visibles"
            value={stats.visibles}
            helper="Se muestran al público"
            icon="◉"
            tone="success"
          />
          <AdminMetricCard
            title="Ocultas"
            value={stats.ocultas}
            helper="Guardadas sin publicar"
            icon="◌"
            tone="accent"
          />
          <AdminMetricCard
            title="Último orden"
            value={stats.ultimoOrden}
            helper="Mayor posición usada"
            icon="#"
            tone="info"
          />
        </section>

        <section className="admin-galeria-main">
          <AdminPanel
            title={isEditing ? "Editar imagen" : "Agregar imagen"}
            subtitle="Usa la carpeta pizza-mya/galeria para mantener ordenadas las fotos del negocio."
          >
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
              <label style={labelStyle}>
                <span>Título</span>
                <input
                  style={inputStyle()}
                  value={form.titulo}
                  onChange={(event) =>
                    handleChange("titulo", event.target.value)
                  }
                  placeholder="Ej. Fachada del local"
                />
              </label>

              <label style={labelStyle}>
                <span>Descripción</span>
                <textarea
                  style={inputStyle({ minHeight: 110, resize: "vertical" })}
                  value={form.descripcion}
                  onChange={(event) =>
                    handleChange("descripcion", event.target.value)
                  }
                  placeholder="Texto opcional para esta imagen"
                />
              </label>

              <CloudinaryImageField
                token={token}
                folder="pizza-mya/galeria"
                value={form.imagen_url}
                onChange={(url) => handleChange("imagen_url", url)}
                label="Imagen de la galería"
                placeholder="https://..."
                pickerTitle="Seleccionar imagen para galería"
                previewAlt={form.titulo || "Vista previa de galería"}
                previewHeight={220}
              />

              <small style={smallStyle}>
                Puedes subir una imagen, elegir una existente desde Cloudinary o
                pegar una URL manualmente.
              </small>

              <label style={labelStyle}>
                <span>Orden</span>
                <input
                  type="number"
                  style={inputStyle()}
                  value={form.orden}
                  onChange={(event) =>
                    handleChange("orden", event.target.value)
                  }
                  placeholder="0"
                />
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: adminTheme.colors?.text || adminTheme.text,
                  fontWeight: 800,
                }}
              >
                <input
                  type="checkbox"
                  checked={form.visible}
                  onChange={(event) =>
                    handleChange("visible", event.target.checked)
                  }
                />
                Visible en la página pública
              </label>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <AdminButton
                  type="submit"
                  loading={saving}
                  loadingText={isEditing ? "Actualizando..." : "Guardando..."}
                >
                  {isEditing ? "Actualizar imagen" : "Agregar imagen"}
                </AdminButton>

                <AdminButton
                  type="button"
                  variant="secondary"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Limpiar
                </AdminButton>
              </div>
            </form>
          </AdminPanel>

          <AdminPanel
            title="Imágenes registradas"
            subtitle={`${sortedItems.length} elemento${sortedItems.length === 1 ? "" : "s"} en la galería.`}
            actions={
              <AdminButton variant="secondary" onClick={loadItems}>
                Recargar
              </AdminButton>
            }
          >
            <div className="admin-galeria-toolbar">
              <label style={labelStyle}>
                <span>Buscar</span>
                <input
                  style={inputStyle()}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar por título o descripción"
                />
              </label>

              <label style={labelStyle}>
                <span>Estado</span>
                <select
                  style={inputStyle()}
                  value={visibleFilter}
                  onChange={(event) => setVisibleFilter(event.target.value)}
                >
                  {FILTERS.map((filter) => (
                    <option key={filter.value || "all"} value={filter.value}>
                      {filter.label}
                    </option>
                  ))}
                </select>
              </label>

              <AdminButton
                type="button"
                variant="secondary"
                onClick={loadItems}
              >
                Aplicar
              </AdminButton>
            </div>

            {loading ? (
              <Loader text="Cargando galería..." compact={false} />
            ) : sortedItems.length === 0 ? (
              <EmptyState
                icon="🖼️"
                title="Aún no hay imágenes"
                description="Agrega la primera imagen para mostrar la galería pública del negocio."
                actionLabel="Crear primera imagen"
                onAction={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              />
            ) : (
              <div className="admin-galeria-grid">
                {sortedItems.map((item) => (
                  <article
                    key={item.id}
                    style={softPanelStyle({
                      overflow: "hidden",
                      background: "#fff",
                      padding: 0,
                    })}
                  >
                    <CloudinaryImage
                      className="admin-galeria-card-img"
                      src={item.imagen_url}
                      alt={getImageTitle(item)}
                      width={520}
                      height={360}
                    />

                    <div style={{ padding: 14 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 10,
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                            fontSize: 16,
                            fontWeight: 900,
                            color: adminTheme.colors?.text || adminTheme.text,
                          }}
                        >
                          {item.titulo || "Sin título"}
                        </h3>

                        <span
                          style={subtleBadgeStyle(
                            item.visible !== false ? "success" : "danger",
                          )}
                        >
                          {item.visible !== false ? "Visible" : "Oculta"}
                        </span>
                      </div>

                      <p
                        style={{
                          margin: "0 0 10px",
                          color:
                            adminTheme.colors?.textSoft ||
                            adminTheme.textSoft ||
                            "#6b7280",
                          minHeight: 42,
                          lineHeight: 1.55,
                        }}
                      >
                        {item.descripcion || "Sin descripción"}
                      </p>

                      <p
                        style={{
                          margin: "0 0 12px",
                          color: adminTheme.colors?.text || adminTheme.text,
                          fontWeight: 700,
                        }}
                      >
                        Orden: {item.orden || 0}
                      </p>

                      <div
                        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                      >
                        <AdminButton
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          Editar
                        </AdminButton>

                        <AdminButton
                          type="button"
                          variant={item.visible !== false ? "ghost" : "success"}
                          size="sm"
                          onClick={() => handleToggleVisible(item)}
                        >
                          {item.visible !== false ? "Ocultar" : "Mostrar"}
                        </AdminButton>

                        <AdminButton
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => setPendingDeleteId(item.id)}
                        >
                          Eliminar
                        </AdminButton>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </AdminPanel>
        </section>

        <ConfirmModal
          open={Boolean(pendingDeleteId)}
          onClose={() => setPendingDeleteId(null)}
          onConfirm={handleDelete}
          title="Eliminar imagen"
          message="¿Seguro que deseas quitar esta imagen de la galería? La imagen no se borrará de Cloudinary, solo se eliminará del registro público."
          confirmText="Eliminar"
          confirmVariant="danger"
          loading={deleting}
          loadingText="Eliminando..."
        />
      </div>
    </>
  );
}

const labelStyle = {
  display: "grid",
  gap: 8,
  color: adminTheme.colors?.text || adminTheme.text,
  fontWeight: 800,
  fontSize: 13,
};

const smallStyle = {
  color: adminTheme.colors?.textMuted || adminTheme.textMuted || "#64748b",
  fontWeight: 600,
  fontSize: 12,
};
