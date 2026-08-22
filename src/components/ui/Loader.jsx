export default function Loader({
  text = "Cargando...",
  fullScreen = false,
  compact = false,
  skeleton = false,
  rows = 3,
}) {
  if (skeleton) {
    return (
      <div style={{ display: "grid", gap: 14, width: "100%" }}>
        {Array.from({ length: rows }).map((_, idx) => (
          <div
            key={idx}
            style={{
              height: compact ? 58 : 84,
              borderRadius: 18,
              background:
                "linear-gradient(90deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)",
              backgroundSize: "200% 100%",
              animation: "pmyaPulse 1.15s ease-in-out infinite",
              border: "1px solid #edf2f7",
            }}
          />
        ))}
        <style>{`
          @keyframes pmyaPulse {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: fullScreen ? "100vh" : compact ? "90px" : "240px",
        width: "100%",
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: compact ? "0" : "28px 22px",
          borderRadius: compact ? 0 : 22,
          background: compact ? "transparent" : "#fff",
          border: compact ? "none" : "1px solid #ececec",
          boxShadow: compact ? "none" : "0 14px 30px rgba(15,23,42,.05)",
          minWidth: compact ? "auto" : 220,
        }}
      >
        <div
          style={{
            width: compact ? 30 : 46,
            height: compact ? 30 : 46,
            border: "4px solid #f1f5f9",
            borderTop: "4px solid #e50914",
            borderRadius: "50%",
            margin: "0 auto 14px",
            animation: "pmyaSpin 0.85s linear infinite",
          }}
        />
        <p
          style={{
            margin: 0,
            color: "#64748b",
            fontWeight: 800,
            fontSize: compact ? 13 : 14,
            lineHeight: 1.5,
          }}
        >
          {text}
        </p>
      </div>

      <style>{`
        @keyframes pmyaSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
