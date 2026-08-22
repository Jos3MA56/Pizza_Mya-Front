import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createClientId } from "../../utils/id.js";

const ToastContext = createContext(null);

function iconForType(type) {
  return (
    {
      success: "✅",
      error: "⛔",
      warning: "⚠️",
      info: "ℹ️",
    }[type] || "ℹ️"
  );
}

function ToastItem({ toast, onRemove }) {
  const styles = {
    success: { border: "#16a34a", bg: "#f0fdf4", text: "#166534" },
    error: { border: "#dc2626", bg: "#fef2f2", text: "#991b1b" },
    warning: { border: "#d97706", bg: "#fffbeb", text: "#92400e" },
    info: { border: "#2563eb", bg: "#eff6ff", text: "#1d4ed8" },
  }[toast.type] || { border: "#2563eb", bg: "#eff6ff", text: "#1d4ed8" };

  const politeness =
    toast.type === "error" || toast.type === "warning" ? "assertive" : "polite";

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      aria-live={politeness}
      style={{
        minWidth: 320,
        maxWidth: 380,
        borderLeft: `5px solid ${styles.border}`,
        background: styles.bg,
        color: styles.text,
        borderRadius: 16,
        padding: 14,
        boxShadow: "0 12px 30px rgba(15,23,42,.12)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ fontSize: 20 }} aria-hidden="true">
          {iconForType(toast.type)}
        </div>
        <div style={{ flex: 1 }}>
          {toast.title ? (
            <div style={{ fontWeight: 900, marginBottom: 4 }}>
              {toast.title}
            </div>
          ) : null}
          <div style={{ fontSize: 14, lineHeight: 1.5 }}>{toast.message}</div>
        </div>
        <button
          type="button"
          onClick={() => onRemove(toast.id)}
          aria-label="Cerrar notificación"
          style={{
            border: "none",
            background: "transparent",
            color: styles.text,
            cursor: "pointer",
            fontSize: 18,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timeoutsRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    const timeoutId = timeoutsRef.current.get(id);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutsRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  useEffect(
    () => () => {
      for (const timeoutId of timeoutsRef.current.values()) {
        window.clearTimeout(timeoutId);
      }
      timeoutsRef.current.clear();
    },
    [],
  );

  const showToast = useCallback(
    ({ type = "info", title = "", message = "", duration = 3400 }) => {
      const id = createClientId("toast");
      setToasts((prev) => [...prev, { id, type, title, message }]);
      const timeoutId = window.setTimeout(() => removeToast(id), duration);
      timeoutsRef.current.set(id, timeoutId);
    },
    [removeToast],
  );

  const api = useMemo(
    () => ({
      show: showToast,
      success: (message, title = "Éxito") =>
        showToast({ type: "success", title, message }),
      error: (message, title = "Error") =>
        showToast({ type: "error", title, message, duration: 5000 }),
      warning: (message, title = "Aviso") =>
        showToast({ type: "warning", title, message, duration: 4500 }),
      info: (message, title = "Información") =>
        showToast({ type: "info", title, message }),
    }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-relevant="additions text"
        style={{
          position: "fixed",
          right: 20,
          bottom: 20,
          zIndex: 9999,
          display: "grid",
          gap: 10,
        }}
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}
