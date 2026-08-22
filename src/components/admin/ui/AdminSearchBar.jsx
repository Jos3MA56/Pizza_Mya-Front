import { useId } from "react";
import { adminTheme } from "./adminTheme.js";

export default function AdminSearchBar({
  value,
  onChange,
  placeholder = "Buscar...",
  onClear,
  ariaLabel = "Buscar",
}) {
  const inputId = useId();

  return (
    <div
      style={{
        flex: "1 1 min(100%, 420px)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        border: `1px solid ${adminTheme.border}`,
        borderRadius: 16,
        background: adminTheme.card,
        padding: "10px 12px",
        boxShadow: adminTheme.shadowSoft,
      }}
    >
      <label
        htmlFor={inputId}
        style={{
          position: "absolute",
          left: -9999,
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
      >
        {ariaLabel}
      </label>
      <span
        style={{ color: adminTheme.muted, fontSize: 16 }}
        aria-hidden="true"
      >
        🔎
      </span>

      <input
        id={inputId}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={ariaLabel}
        style={{
          border: "none",
          outline: "none",
          width: "100%",
          fontSize: 14,
          background: "transparent",
          color: adminTheme.text,
          fontFamily: "inherit",
        }}
      />

      {value ? (
        <button
          type="button"
          onClick={onClear}
          aria-label="Limpiar búsqueda"
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: 18,
            color: adminTheme.muted,
          }}
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
