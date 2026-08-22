import Modal from "../../ui/Modal.jsx";
import Badge from "../../ui/Badge.jsx";
import {
  diasLabel,
  formatCurrency,
  getCategoriaIcon,
} from "../../../utils/adminCombos.utils.js";
import { adminTheme } from "../ui/adminTheme.js";

function HeroImage({ src, alt }) {
  if (!src) {
    return (
      <div
        style={{
          minHeight: 240,
          borderRadius: 22,
          background: "linear-gradient(135deg, #2c201a, #46342a)",
          display: "grid",
          placeItems: "center",
          fontSize: 72,
          color: "#fff",
        }}
      >
        🎁
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || "Combo"}
      style={{
        width: "100%",
        minHeight: 240,
        objectFit: "cover",
        borderRadius: 22,
        display: "block",
        background: adminTheme.cardMuted,
      }}
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  );
}

export default function ComboDetailsModal({ open, combo, onClose }) {
  return (
    <Modal open={open} onClose={onClose} size="lg" title="Detalle del combo">
      {!combo ? null : (
        <div style={{ display: "grid", gap: 22 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "var(--adm-grid-catalogos)",
              gap: 20,
            }}
          >
            <HeroImage src={combo.imagen_url} alt={combo.nombre} />

            <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: 28,
                    fontWeight: 900,
                    color: adminTheme.text,
                  }}
                >
                  {combo.nombre}
                </h3>
                <Badge variant={combo.activo ? "success" : "danger"}>
                  {combo.activo ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <p
                style={{ margin: 0, color: adminTheme.muted, lineHeight: 1.7 }}
              >
                {combo.descripcion || "Sin descripción"}
              </p>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 950,
                  color: adminTheme.text,
                }}
              >
                {formatCurrency(combo.precio_combo)}
              </div>

              <div
                style={{
                  padding: 16,
                  borderRadius: 18,
                  background: adminTheme.cardMuted,
                  border: `1px solid ${adminTheme.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: adminTheme.muted,
                    fontWeight: 800,
                    marginBottom: 6,
                  }}
                >
                  DISPONIBILIDAD
                </div>
                <div style={{ fontWeight: 800, color: adminTheme.text }}>
                  {diasLabel(combo.dias || [])}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4
              style={{
                margin: "0 0 12px",
                fontSize: 18,
                fontWeight: 900,
                color: adminTheme.text,
              }}
            >
              Productos incluidos
            </h4>
            <div style={{ display: "grid", gap: 12 }}>
              {(combo.items || []).length === 0 ? (
                <div
                  style={{
                    padding: 16,
                    borderRadius: 14,
                    background: adminTheme.cardMuted,
                    color: adminTheme.muted,
                    fontWeight: 700,
                  }}
                >
                  Este combo todavía no tiene productos cargados.
                </div>
              ) : null}

              {(combo.items || []).map((item) => (
                <div
                  key={item.id || item.localId}
                  style={{
                    border: `1px solid ${adminTheme.border}`,
                    borderRadius: 18,
                    padding: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 12,
                    background: adminTheme.card,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 900, color: adminTheme.text }}>
                      {getCategoriaIcon(item.categoria)}{" "}
                      {item.nombre || "Producto"}
                    </div>
                    <div
                      style={{
                        color: adminTheme.muted,
                        fontSize: 13,
                        marginTop: 4,
                      }}
                    >
                      {item.categoria || "Sin categoría"}
                      {item.tamanio ? ` · ${item.tamanio}` : ""}
                    </div>
                  </div>
                  <Badge variant="neutral">x{item.cantidad || 1}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
