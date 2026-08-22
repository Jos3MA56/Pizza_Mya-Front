import { adminTheme } from "./adminTheme.js";

export default function AdminSectionCard({
  title,
  subtitle = "",
  children,
  actions = null,
  tone = "default",
  style = {},
}) {
  const backgrounds = {
    default:
      "linear-gradient(135deg, rgba(255,255,255,1), rgba(250,246,241,1))",
    soft: "linear-gradient(135deg, rgba(247,241,235,1), rgba(255,250,245,1))",
    dark: "linear-gradient(135deg, #3f2d24 0%, #241a15 100%)",
  };

  const dark = tone === "dark";

  return (
    <section
      style={{
        background: backgrounds[tone] || backgrounds.default,
        border: `1px solid ${dark ? "rgba(255,255,255,.08)" : adminTheme.border}`,
        borderRadius: 24,
        padding: "var(--adm-card-padding, 22px)",
        boxShadow: dark
          ? "0 16px 34px rgba(36,26,21,.24)"
          : adminTheme.shadowSoft,
        minHeight: 0,
        color: dark ? "#fffaf5" : adminTheme.text,
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 14,
          flexWrap: "wrap",
          marginBottom: 18,
        }}
      >
        <div style={{ minWidth: 0, flex: "1 1 240px" }}>
          <h3
            style={{
              margin: 0,
              fontSize: 21,
              fontWeight: 900,
              color: dark ? "#fffaf5" : adminTheme.text,
            }}
          >
            {title}
          </h3>
          {subtitle ? (
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 13,
                color: dark ? "rgba(255,250,245,.72)" : adminTheme.muted,
                fontWeight: 600,
                lineHeight: 1.55,
                maxWidth: 620,
              }}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
