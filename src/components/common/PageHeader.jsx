export default function PageHeader({ title, subtitle = "", actions = null }) {
  return (
    <div
      style={{
        marginBottom: 24,
        padding: "22px 24px",
        background:
          "linear-gradient(180deg, rgba(255,253,251,0.98) 0%, rgba(248,241,233,0.96) 100%)",
        border: "1px solid rgba(122, 98, 78, 0.14)",
        borderRadius: 28,
        boxShadow: "0 18px 36px rgba(39, 26, 16, 0.07)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 18,
        flexWrap: "wrap",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -44,
          right: -30,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(199,139,71,.18) 0%, rgba(199,139,71,0) 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ minWidth: 240, position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 12px",
            borderRadius: 999,
            background: "rgba(143, 45, 31, 0.08)",
            color: "#7a3f2f",
            fontWeight: 800,
            fontSize: 12,
            marginBottom: 12,
            letterSpacing: ".04em",
            textTransform: "uppercase",
          }}
        >
          Panel administrativo
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: 34,
            lineHeight: 1.05,
            fontWeight: 950,
            color: "#231814",
            letterSpacing: "-0.03em",
          }}
        >
          {title}
        </h1>

        {subtitle ? (
          <p
            style={{
              margin: "10px 0 0",
              color: "#74665c",
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
            position: "relative",
            zIndex: 1,
          }}
        >
          {actions}
        </div>
      ) : null}
    </div>
  );
}
