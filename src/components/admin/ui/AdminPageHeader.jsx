import { adminTheme } from "./adminTheme.js";

export default function AdminPageHeader({
  title,
  subtitle = "",
  actions = null,
  eyebrow = "Panel administrativo",
}) {
  return (
    <div
      style={{
        padding: "var(--adm-card-padding, 24px)",
        background:
          "linear-gradient(135deg, rgba(255,250,245,1) 0%, rgba(247,241,235,1) 100%)",
        border: `1px solid ${adminTheme.border}`,
        borderRadius: adminTheme.radiusLg,
        boxShadow: adminTheme.shadow,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 18,
        flexWrap: "wrap",
      }}
    >
      <div style={{ minWidth: 0, flex: "1 1 280px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            borderRadius: 999,
            background: adminTheme.accentSoft,
            color: adminTheme.accent,
            fontWeight: 800,
            fontSize: 12,
            letterSpacing: ".04em",
            textTransform: "uppercase",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: adminTheme.accent,
            }}
          />
          {eyebrow}
        </div>

        <h1
          style={{
            margin: "14px 0 0",
            fontSize: "var(--adm-page-title-size, 34px)",
            lineHeight: 1.05,
            fontWeight: 950,
            color: adminTheme.text,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h1>

        {subtitle ? (
          <p
            style={{
              margin: "10px 0 0",
              color: adminTheme.muted,
              fontWeight: 600,
              fontSize: 14,
              lineHeight: 1.65,
              maxWidth: 760,
            }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "flex-end",
            flex: "1 1 260px",
          }}
        >
          {actions}
        </div>
      ) : null}
    </div>
  );
}
