import Button from "./Button.jsx";

export default function EmptyState({
  icon = "📭",
  title = "Sin resultados",
  description = "No hay información para mostrar.",
  actionLabel = "",
  onAction,
  tone = "default",
}) {
  const tones = {
    default: {
      bg: "#ffffff",
      border: "#e5e7eb",
      iconBg: "#f8fafc",
      title: "#0f172a",
      text: "#64748b",
    },
    soft: {
      bg: "#f8fafc",
      border: "#dbe3ea",
      iconBg: "#ffffff",
      title: "#0f172a",
      text: "#64748b",
    },
    danger: {
      bg: "#fff7f7",
      border: "#fecaca",
      iconBg: "#ffffff",
      title: "#991b1b",
      text: "#b91c1c",
    },
  };

  const toneStyle = tones[tone] || tones.default;

  return (
    <div
      style={{
        textAlign: "center",
        padding: "52px 24px",
        background: toneStyle.bg,
        border: `1px dashed ${toneStyle.border}`,
        borderRadius: 24,
        boxShadow: "0 10px 24px rgba(15,23,42,.04)",
      }}
    >
      <div
        style={{
          width: 82,
          height: 82,
          borderRadius: 999,
          background: toneStyle.iconBg,
          display: "grid",
          placeItems: "center",
          fontSize: 36,
          margin: "0 auto 16px",
          boxShadow: "inset 0 0 0 1px rgba(148,163,184,.12)",
        }}
      >
        {icon}
      </div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 950,
          color: toneStyle.title,
          marginBottom: 10,
          lineHeight: 1.1,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 14,
          lineHeight: 1.7,
          maxWidth: 520,
          margin: "0 auto",
          color: toneStyle.text,
          fontWeight: 600,
        }}
      >
        {description}
      </div>

      {actionLabel && onAction ? (
        <div style={{ marginTop: 22 }}>
          <Button onClick={onAction} variant="primary" size="lg">
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
