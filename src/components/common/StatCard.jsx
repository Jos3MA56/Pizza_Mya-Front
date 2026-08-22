const VARIANTS = {
  red: {
    border: "rgba(143, 45, 31, 0.16)",
    background: "linear-gradient(180deg, #fffdfb 0%, #f8ede6 100%)",
    iconBg: "rgba(143, 45, 31, 0.10)",
    iconColor: "#8f2d1f",
    accent: "#8f2d1f",
    helper: "#7a5a4c",
  },
  yellow: {
    border: "rgba(199, 139, 71, 0.18)",
    background: "linear-gradient(180deg, #fffdf9 0%, #f9f1df 100%)",
    iconBg: "rgba(199, 139, 71, 0.14)",
    iconColor: "#a7671a",
    accent: "#c78b47",
    helper: "#7c6547",
  },
  dark: {
    border: "rgba(54, 48, 43, 0.14)",
    background: "linear-gradient(180deg, #fffdfb 0%, #efebe6 100%)",
    iconBg: "rgba(40, 32, 28, 0.08)",
    iconColor: "#3b342f",
    accent: "#3b342f",
    helper: "#645951",
  },
  green: {
    border: "rgba(47, 106, 79, 0.16)",
    background: "linear-gradient(180deg, #fffdfb 0%, #e9f3ed 100%)",
    iconBg: "rgba(47, 106, 79, 0.12)",
    iconColor: "#2f6a4f",
    accent: "#2f6a4f",
    helper: "#5a6b62",
  },
  blue: {
    border: "rgba(49, 94, 134, 0.16)",
    background: "linear-gradient(180deg, #fffdfb 0%, #edf3f9 100%)",
    iconBg: "rgba(49, 94, 134, 0.12)",
    iconColor: "#315e86",
    accent: "#315e86",
    helper: "#5b6c7d",
  },
};

export default function StatCard({
  title,
  value,
  icon = "📊",
  variant = "red",
  helperText = "",
}) {
  const styles = VARIANTS[variant] || VARIANTS.red;

  return (
    <article
      style={{
        borderRadius: 24,
        padding: 18,
        minHeight: 126,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 14,
        color: "#231814",
        background: styles.background,
        border: `1px solid ${styles.border}`,
        boxShadow: "0 12px 28px rgba(39, 26, 16, 0.05)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.22) 100%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 18,
          bottom: 18,
          width: 4,
          borderRadius: 999,
          background: styles.accent,
          opacity: 0.92,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, flex: 1, paddingLeft: 4 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 900,
            color: styles.helper,
            marginBottom: 10,
            letterSpacing: ".04em",
            textTransform: "uppercase",
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 30,
            fontWeight: 950,
            lineHeight: 1.05,
            wordBreak: "break-word",
            color: "#231814",
          }}
        >
          {value}
        </div>

        {helperText ? (
          <div
            style={{
              marginTop: 12,
              fontSize: 12,
              fontWeight: 700,
              color: styles.helper,
              lineHeight: 1.5,
            }}
          >
            {helperText}
          </div>
        ) : null}
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: 54,
          height: 54,
          borderRadius: 18,
          background: styles.iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          color: styles.iconColor,
          flexShrink: 0,
          border: `1px solid ${styles.border}`,
        }}
      >
        {icon}
      </div>
    </article>
  );
}
