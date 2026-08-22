import React from "react";
import Button from "./ui/Button.jsx";
import { reportUiCrash } from "../utils/monitoring.js";

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(err, info) {
    console.error("UI Crash:", err);
    reportUiCrash(err, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.assign("/");
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px 16px",
            background:
              "radial-gradient(circle at top, rgba(229,9,20,.10), transparent 34%), linear-gradient(180deg, #fff 0%, #fff7f7 100%)",
          }}
        >
          <div
            style={{
              width: "min(560px, 100%)",
              background: "#fff",
              borderRadius: 28,
              border: "1px solid #fee2e2",
              boxShadow: "0 24px 60px rgba(15,23,42,.10)",
              padding: "32px 28px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 86,
                height: 86,
                borderRadius: 999,
                margin: "0 auto 18px",
                display: "grid",
                placeItems: "center",
                fontSize: 38,
                background: "rgba(229,9,20,.08)",
                border: "1px solid rgba(229,9,20,.14)",
              }}
            >
              ⚠️
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 30,
                lineHeight: 1.05,
                fontWeight: 950,
                color: "#0f172a",
              }}
            >
              Ocurrió un error inesperado
            </h1>

            <p
              style={{
                margin: "14px auto 0",
                maxWidth: 460,
                color: "#64748b",
                fontSize: 14,
                lineHeight: 1.7,
                fontWeight: 600,
              }}
            >
              La aplicación encontró un problema al renderizar esta vista.
              Puedes recargar la página para intentar recuperarla o volver al
              inicio.
            </p>

            {this.state.error?.message ? (
              <div
                style={{
                  marginTop: 18,
                  padding: "12px 14px",
                  borderRadius: 16,
                  background: "#fff7ed",
                  color: "#9a3412",
                  fontSize: 13,
                  lineHeight: 1.5,
                  fontWeight: 700,
                  wordBreak: "break-word",
                }}
              >
                {this.state.error.message}
              </div>
            ) : null}

            <div
              style={{
                marginTop: 24,
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button variant="secondary" size="lg" onClick={this.handleGoHome}>
                Ir al inicio
              </Button>
              <Button variant="primary" size="lg" onClick={this.handleReload}>
                Recargar página
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
