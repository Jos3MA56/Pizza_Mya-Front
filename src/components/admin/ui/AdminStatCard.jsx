import { adminTheme, getAdminVariant } from "./adminTheme.js";

export default function AdminStatCard({
  title,
  value,
  icon = "📊",
  variant = "accent",
  helperText = "",
}) {
  const styles = getAdminVariant(variant);

  return (
    <div
      style={{
        borderRadius: 22,
        padding: 20,
        minHeight: 120,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 14,
        color: adminTheme.text,
        background: styles.bg,
        border: `1px solid ${adminTheme.border}`,
        boxShadow: adminTheme.shadowSoft,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -26,
          right: -26,
          width: 94,
          height: 94,
          borderRadius: "50%",
          background: "rgba(255,255,255,.32)",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, flex: 1 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: adminTheme.muted,
            marginBottom: 10,
            letterSpacing: ".02em",
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 31,
            fontWeight: 950,
            lineHeight: 1.05,
            wordBreak: "break-word",
            color: adminTheme.text,
          }}
        >
          {value}
        </div>

        {helperText ? (
          <div
            style={{
              marginTop: 10,
              fontSize: 12,
              fontWeight: 700,
              color: adminTheme.muted,
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
          width: 56,
          height: 56,
          borderRadius: 18,
          background: styles.iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          color: styles.iconColor,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
    </div>
  );
}
