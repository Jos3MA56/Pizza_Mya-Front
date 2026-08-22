import { useId } from "react";

export default function SearchBar({
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
        flex: "1 1 420px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        border: "1px solid #d9d9d9",
        borderRadius: 12,
        background: "#fff",
        padding: "12px 12px",
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
      <span style={{ color: "#777", fontSize: 16 }} aria-hidden="true">
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
          color: "#111",
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
            color: "#999",
          }}
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
