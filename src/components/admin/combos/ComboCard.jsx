import Badge from "../../ui/Badge.jsx";
import { diasLabel, formatCurrency } from "../../../utils/adminCombos.utils.js";
import AdminButton from "../ui/AdminButton.jsx";
import { adminTheme } from "../ui/adminTheme.js";

function PreviewImage({ src, alt }) {
  if (!src) {
    return (
      <div
        style={{
          width: "100%",
          height: 190,
          borderRadius: 22,
          background: "linear-gradient(135deg, #f4ebe2 0%, #eadccc 100%)",
          display: "grid",
          placeItems: "center",
          fontSize: 56,
          color: adminTheme.subtle,
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
        height: 190,
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

export default function ComboCard({
  combo,
  onView,
  onEdit,
  onDisable,
  onActivate,
}) {
  return (
    <article
      style={{
        border: `1px solid ${adminTheme.border}`,
        borderRadius: 24,
        background: adminTheme.card,
        boxShadow: adminTheme.shadowSoft,
        padding: 18,
        display: "grid",
        gap: 16,
      }}
    >
      <PreviewImage src={combo.imagen_url} alt={combo.nombre} />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <Badge variant={combo.activo ? "success" : "danger"}>
          {combo.activo ? "Activo" : "Inactivo"}
        </Badge>
        <Badge variant="neutral">
          {(combo.items || []).length} producto(s)
        </Badge>
      </div>

      <div>
        <h3
          style={{
            margin: 0,
            fontSize: 21,
            fontWeight: 900,
            color: adminTheme.text,
          }}
        >
          {combo.nombre}
        </h3>
        <p
          style={{
            margin: "8px 0 0",
            color: adminTheme.muted,
            minHeight: 44,
            lineHeight: 1.6,
          }}
        >
          {combo.descripcion || "Sin descripción"}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "var(--adm-grid-two-even)",
          gap: 12,
        }}
      >
        <div
          style={{
            padding: 14,
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
            PRECIO
          </div>
          <div
            style={{ fontSize: 24, fontWeight: 950, color: adminTheme.text }}
          >
            {formatCurrency(combo.precio_combo)}
          </div>
        </div>

        <div
          style={{
            padding: 14,
            borderRadius: 18,
            background: adminTheme.surface,
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
          <div
            style={{ fontWeight: 800, color: adminTheme.text, lineHeight: 1.5 }}
          >
            {diasLabel(combo.dias || [])}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <AdminButton variant="secondary" onClick={onView}>
          Ver detalle
        </AdminButton>
        <AdminButton variant="ghost" onClick={onEdit}>
          Editar
        </AdminButton>
        {combo.activo ? (
          <AdminButton variant="danger" onClick={onDisable}>
            Desactivar
          </AdminButton>
        ) : (
          <AdminButton variant="success" onClick={onActivate}>
            Activar
          </AdminButton>
        )}
      </div>
    </article>
  );
}
