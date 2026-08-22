import { useId, useState } from "react";

export default function Textarea({
  label,
  error = "",
  hint = "",
  value,
  onChange,
  placeholder = "",
  name,
  id,
  rows = 4,
  disabled = false,
  onBlur,
  required = false,
  ...rest
}) {
  const generatedId = useId();
  const inputId = id || name || `textarea-${generatedId}`;
  const [focused, setFocused] = useState(false);
  const descriptionId = error
    ? `${inputId}-error`
    : hint
      ? `${inputId}-hint`
      : undefined;

  const borderColor = error ? "#dc2626" : focused ? "#fb923c" : "#d7dde5";
  const boxShadow = error
    ? "0 0 0 4px rgba(220,38,38,.10)"
    : focused
      ? "0 0 0 4px rgba(251,146,60,.16), 0 10px 25px rgba(15,23,42,.08)"
      : "0 8px 18px rgba(15,23,42,.04)";

  return (
    <div style={{ marginBottom: 16 }}>
      {label ? (
        <label
          htmlFor={inputId}
          style={{
            display: "block",
            marginBottom: 8,
            fontSize: 13,
            fontWeight: 800,
            color: "#0f172a",
          }}
        >
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
        </label>
      ) : null}

      <textarea
        id={inputId}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        onFocus={() => setFocused(true)}
        aria-invalid={Boolean(error)}
        aria-describedby={descriptionId}
        required={required}
        style={{
          width: "100%",
          padding: "12px 14px",
          border: `1px solid ${borderColor}`,
          borderRadius: 14,
          fontSize: 14,
          background: disabled ? "#f8fafc" : "#fff",
          color: "#0f172a",
          fontFamily: "inherit",
          resize: "vertical",
          outline: "none",
          boxSizing: "border-box",
          boxShadow,
          transition: "border-color .18s ease, box-shadow .18s ease",
          minHeight: rows * 22,
        }}
        {...rest}
      />

      {error ? (
        <div
          id={`${inputId}-error`}
          style={{
            marginTop: 6,
            fontSize: 12,
            color: "#b91c1c",
            fontWeight: 700,
          }}
        >
          {error}
        </div>
      ) : hint ? (
        <div
          id={`${inputId}-hint`}
          style={{ marginTop: 6, fontSize: 12, color: "#64748b" }}
        >
          {hint}
        </div>
      ) : null}
    </div>
  );
}
