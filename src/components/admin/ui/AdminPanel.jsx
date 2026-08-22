import { adminTheme, panelStyle } from "./adminTheme.js";

export default function AdminPanel({
  title,
  subtitle = "",
  actions = null,
  children,
  style = {},
}) {
  return (
    <section
      style={panelStyle({ padding: "var(--adm-card-padding, 20px)", ...style })}
    >
      {title || actions || subtitle ? (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 14,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          <div style={{ minWidth: 0, flex: "1 1 240px" }}>
            {title ? (
              <h2
                style={{
                  margin: 0,
                  fontSize: 21,
                  lineHeight: 1.1,
                  color: adminTheme.colors.text,
                  fontWeight: 900,
                }}
              >
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p
                style={{
                  margin: "7px 0 0",
                  color: adminTheme.colors.textSoft,
                  fontWeight: 600,
                  fontSize: 13,
                  lineHeight: 1.6,
                  maxWidth: 700,
                }}
              >
                {subtitle}
              </p>
            ) : null}
          </div>
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}
