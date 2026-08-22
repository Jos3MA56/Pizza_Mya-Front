import Loader from "./Loader.jsx";

export default function RouteFallback({
  text = "Cargando módulo...",
  fullScreen = true,
}) {
  return (
    <div
      style={{
        minHeight: fullScreen ? "100vh" : 220,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: fullScreen ? "32px 16px" : "16px",
        background: fullScreen
          ? "radial-gradient(circle at top, rgba(255,106,0,.10), transparent 38%), #f8fafc"
          : "transparent",
      }}
    >
      <Loader text={text} compact={!fullScreen} />
    </div>
  );
}
