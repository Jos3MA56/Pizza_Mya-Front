import { adminTheme, softPanelStyle } from "./adminTheme.js";

export default function AdminMetricCard({
  title,
  value,
  helper,
  icon,
  tone = "primary",
  trend,
}) {
  const toneStyles = {
    primary: {
      bg: "#f8fafc",
      border: "#e2e8f0",
      text: "#0f172a",
      accent: "#3b82f6",
    },
    accent: {
      bg: "#fffbeb",
      border: "#fcd34d",
      text: "#78350f",
      accent: "#f59e0b",
    },
    success: {
      bg: "#f0fdf4",
      border: "#86efac",
      text: "#14532d",
      accent: "#22c55e",
    },
    info: {
      bg: "#eff6ff",
      border: "#93c5fd",
      text: "#1e3a8a",
      accent: "#3b82f6",
    },
  };

  const style = toneStyles[tone] || toneStyles.primary;

  return (
    <div
      style={{
        ...softPanelStyle({ padding: 18 }),
        background: style.bg,
        borderLeft: `4px solid ${style.accent}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 8,
        }}
      >
        {icon && (
          <span
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: style.accent,
              width: 32,
              height: 32,
              display: "grid",
              placeItems: "center",
              background: "#fff",
              borderRadius: 8,
              border: `1px solid ${style.border}`,
            }}
          >
            {icon}
          </span>
        )}
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: adminTheme.colors.textSoft,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {title}
        </span>
      </div>

      <div
        style={{
          fontSize: 24,
          fontWeight: 900,
          color: style.text,
          marginBottom: 4,
        }}
      >
        {value}
        {trend && (
          <span
            style={{
              fontSize: 14,
              marginLeft: 8,
              color: trend > 0 ? "#16a34a" : trend < 0 ? "#dc2626" : "#64748b",
            }}
          >
            {trend > 0 ? "↑" : trend < 0 ? "↓" : "→"}
          </span>
        )}
      </div>

      {helper && (
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: adminTheme.colors.textSoft,
            fontWeight: 500,
            lineHeight: 1.5,
          }}
        >
          {helper}
        </p>
      )}
    </div>
  );
}
