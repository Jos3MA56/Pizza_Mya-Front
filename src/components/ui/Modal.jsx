import { useEffect, useId, useMemo, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export default function Modal({ open, title, onClose, children, size = "md" }) {
  const dialogRef = useRef(null);
  const previousActiveRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const headingId = useId();

  const widths = useMemo(
    () => ({
      sm: "420px",
      md: "600px",
      lg: "800px",
      xl: "1000px",
    }),
    [],
  );

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;

    previousActiveRef.current = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = Array.from(
      dialogRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) || [],
    );

    const firstField = focusables.find((el) =>
      ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName),
    );

    const firstFocusable = firstField || focusables[0] || dialogRef.current;
    firstFocusable?.focus?.();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current?.();
        return;
      }

      if (event.key !== "Tab") return;

      const items = Array.from(
        dialogRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) || [],
      );

      if (!items.length) {
        event.preventDefault();
        dialogRef.current?.focus?.();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previousActiveRef.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={() => onCloseRef.current?.()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 20,
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: widths[size] || widths.md,
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            padding: "22px 24px",
            borderBottom: "1px solid #eee",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <h2
            id={headingId}
            style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#111" }}
          >
            {title}
          </h2>

          <button
            onClick={() => onCloseRef.current?.()}
            type="button"
            aria-label="Cerrar modal"
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              border: "none",
              background: "#f1f5f9",
              cursor: "pointer",
              fontSize: 20,
              color: "#475569",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}
