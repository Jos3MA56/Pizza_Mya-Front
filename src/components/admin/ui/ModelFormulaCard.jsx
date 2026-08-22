import { adminTheme, softPanelStyle } from "../ui/adminTheme.js";

export default function ModelFormulaCard({ modelo, tamanios }) {
  return (
    <div style={softPanelStyle({ padding: 20 })}>
      <div
        style={{
          color: adminTheme.colors.textSoft,
          fontSize: 11,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 12,
        }}
      >
        📐 Modelo Matemático Aplicado
      </div>

      {/* Fórmula principal */}
      <div
        style={{
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          padding: "14px 18px",
          borderRadius: 12,
          border: `1px solid ${adminTheme.colors.border}`,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: adminTheme.colors.textSoft,
            fontWeight: 700,
            marginBottom: 6,
          }}
        >
          Ecuación de crecimiento/decrecimiento
        </div>
        <code
          style={{
            display: "block",
            fontSize: 16,
            fontWeight: 700,
            color: adminTheme.colors.text,
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
            background: "#fff",
            padding: "8px 12px",
            borderRadius: 6,
            border: `1px solid ${adminTheme.colors.border}`,
          }}
        >
          {modelo?.formula_general || "P(t) = P₀ · e^(k·t)"}
        </code>
      </div>

      {/* Fórmulas derivadas */}
      <div style={{ display: "grid", gap: 10 }}>
        <FormulaRow
          label="Producción total"
          formula={modelo?.formula_total || "Pₜ = I + M + G + J"}
        />
        <FormulaRow
          label="Bolsas de queso"
          formula={modelo?.formula_bolsas || "B = I/60 + M/33 + G/20 + J/15"}
        />
        <FormulaRow
          label="Kilogramos de queso"
          formula={modelo?.formula_kg || "KG = 5 · B"}
        />
      </div>

      {/* Constantes k por tamaño */}
      {tamanios && (
        <div
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: `1px dashed ${adminTheme.colors.border}`,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: adminTheme.colors.textSoft,
              fontWeight: 700,
              marginBottom: 10,
            }}
          >
            Constantes k calculadas
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "var(--adm-grid-two-even)",
              gap: 8,
            }}
          >
            {Object.values(tamanios).map((tam) => (
              <div
                key={tam.clave}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 12px",
                  background: "#fff",
                  borderRadius: 8,
                  border: `1px solid ${adminTheme.colors.border}`,
                  fontSize: 12,
                }}
              >
                <span
                  style={{ fontWeight: 600, color: adminTheme.colors.text }}
                >
                  {tam.nombre}
                </span>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontWeight: 700,
                    color:
                      tam.k > 0.02
                        ? "#16a34a"
                        : tam.k < -0.02
                          ? "#dc2626"
                          : "#64748b",
                  }}
                >
                  k = {tam.k?.toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FormulaRow({ label, formula }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: adminTheme.colors.textSoft,
          minWidth: 140,
        }}
      >
        {label}
      </span>
      <code
        style={{
          flex: 1,
          fontSize: 13,
          fontWeight: 600,
          color: adminTheme.colors.text,
          fontFamily: "ui-monospace, monospace",
          background: "#f8fafc",
          padding: "6px 10px",
          borderRadius: 6,
          border: `1px solid ${adminTheme.colors.border}`,
        }}
      >
        {formula}
      </code>
    </div>
  );
}
