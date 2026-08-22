import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "../ui/Button.jsx";
import { adminCloudinaryApi } from "../../api/adminCloudinary.api.js";

const FOLDER_OPTIONS = [
  { value: "pizza-mya/logo", label: "Logo" },
  { value: "pizza-mya/promociones", label: "Promociones" },
  { value: "pizza-mya/combos", label: "Combos" },
  { value: "pizza-mya/productos/pizzas", label: "Pizzas" },
  { value: "pizza-mya/productos/bebidas", label: "Bebidas" },
  { value: "pizza-mya/productos/complementos", label: "Complementos" },
  { value: "pizza-mya/galeria", label: "Galería" },
  { value: "", label: "Todas" },
];

export default function CloudinaryPickerModal({
  open,
  token,
  title = "Seleccionar imagen desde Cloudinary",
  initialFolder = "",
  onClose,
  onSelect,
}) {
  const [folder, setFolder] = useState(initialFolder || "");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  const folderOptions = useMemo(() => FOLDER_OPTIONS, []);

  const loadImages = useCallback(
    async (folderToLoad = "") => {
      try {
        setLoading(true);
        setError("");

        const response = await adminCloudinaryApi.list({
          token,
          folder: folderToLoad,
          maxResults: 24,
        });

        const payload = response?.data || response || {};
        setItems(
          Array.isArray(payload.items)
            ? payload.items
            : Array.isArray(payload.resources)
              ? payload.resources
              : [],
        );
      } catch (err) {
        setError(err?.message || "No se pudieron cargar las imágenes");
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  // Solo inicializa la carpeta al abrir el modal
  useEffect(() => {
    if (!open) return;

    const startFolder = initialFolder || "";
    setFolder(startFolder);
    setSelected(null);
  }, [open, initialFolder]);

  // Carga imágenes cada vez que cambie la carpeta seleccionada
  useEffect(() => {
    if (!open) return;
    loadImages(folder);
  }, [open, folder, loadImages]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 4000,
        background: "rgba(15,23,42,.58)",
        display: "grid",
        placeItems: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(980px, 100%)",
          maxHeight: "90vh",
          overflow: "auto",
          background: "#fff",
          borderRadius: 22,
          boxShadow: "0 24px 60px rgba(0,0,0,.25)",
          border: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <h3 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>{title}</h3>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              border: "none",
              background: "#f1f5f9",
              fontSize: 24,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: 24, display: "grid", gap: 18 }}>
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "end",
              flexWrap: "wrap",
            }}
          >
            <div style={{ minWidth: 0, flex: "1 1 260px" }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  marginBottom: 8,
                  color: "#334155",
                }}
              >
                Carpeta
              </div>

              <select
                value={folder}
                onChange={(e) => {
                  setFolder(e.target.value);
                  setSelected(null);
                }}
                style={{
                  width: "100%",
                  height: 46,
                  borderRadius: 14,
                  border: "1px solid #d1d5db",
                  padding: "0 14px",
                  fontSize: 15,
                }}
              >
                {folderOptions.map((option) => (
                  <option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setSelected(null);
                loadImages(folder);
              }}
            >
              Recargar
            </Button>
          </div>

          {error ? (
            <div
              style={{
                padding: 14,
                borderRadius: 14,
                background: "#fef2f2",
                color: "#b91c1c",
                fontWeight: 800,
              }}
            >
              {error}
            </div>
          ) : null}

          <div
            style={{
              minHeight: 320,
              borderRadius: 18,
              border: "1px solid #e5e7eb",
              background: "#f8fafc",
              padding: 16,
            }}
          >
            {loading ? (
              <div
                style={{
                  minHeight: 260,
                  display: "grid",
                  placeItems: "center",
                  color: "#64748b",
                  fontWeight: 800,
                }}
              >
                Cargando imágenes...
              </div>
            ) : items.length === 0 ? (
              <div
                style={{
                  minHeight: 260,
                  display: "grid",
                  placeItems: "center",
                  color: "#64748b",
                  fontWeight: 800,
                  textAlign: "center",
                }}
              >
                No se encontraron imágenes en esta carpeta.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(min(100%, 160px), 1fr))",
                  gap: 14,
                }}
              >
                {items.map((item) => {
                  const active = selected?.public_id === item.public_id;

                  return (
                    <button
                      key={item.public_id}
                      type="button"
                      onClick={() => setSelected(item)}
                      style={{
                        textAlign: "left",
                        borderRadius: 16,
                        overflow: "hidden",
                        border: active
                          ? "2px solid #e50914"
                          : "1px solid #e5e7eb",
                        background: "#fff",
                        cursor: "pointer",
                        padding: 10,
                        boxShadow: active
                          ? "0 12px 22px rgba(229,9,20,.12)"
                          : "none",
                      }}
                    >
                      <div
                        style={{
                          aspectRatio: "1 / 1",
                          borderRadius: 12,
                          overflow: "hidden",
                          background: "#f1f5f9",
                        }}
                      >
                        <img
                          src={item.secure_url}
                          alt={item.public_id}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      </div>

                      <div
                        style={{
                          marginTop: 10,
                          fontSize: 12,
                          lineHeight: 1.45,
                          color: "#334155",
                        }}
                      >
                        <div style={{ fontWeight: 900 }}>{item.public_id}</div>
                        <div style={{ color: "#64748b", marginTop: 4 }}>
                          {item.folder || "Sin carpeta"}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>

            <Button
              type="button"
              variant="primary"
              disabled={!selected}
              onClick={() => {
                if (!selected) return;
                onSelect?.(selected);
                onClose?.();
              }}
            >
              Usar esta imagen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
