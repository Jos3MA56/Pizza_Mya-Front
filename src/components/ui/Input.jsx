import { useId, useState } from "react";

export default function Input({
  label,
  error = "",
  hint = "",
  icon = null,
  type = "text",
  value,
  onChange,
  placeholder = "",
  name,
  id,
  disabled = false,
  autoComplete,
  onBlur,
  required = false,
  ...rest
}) {
  const generatedId = useId();
  const inputId = id || name || `input-${generatedId}`;
  const [focused, setFocused] = useState(false);
  const descriptionId = error
    ? `${inputId}-error`
    : hint
      ? `${inputId}-hint`
      : undefined;

  const borderColor = error ? "#b42318" : focused ? "#8f2d1f" : "#d8c9bb";
  const boxShadow = error
    ? "0 0 0 4px rgba(180,35,24,.10)"
    : focused
      ? "0 0 0 4px rgba(143,45,31,.12), 0 10px 25px rgba(36,27,23,.08)"
      : "0 8px 18px rgba(36,27,23,.04)";

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
            color: "#241b17",
          }}
        >
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
        </label>
      ) : null}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          border: `1px solid ${borderColor}`,
          borderRadius: 14,
          padding: "12px 14px",
          background: disabled ? "#f7f2ec" : "#fffaf6",
          transition:
            "border-color .18s ease, box-shadow .18s ease, transform .18s ease",
          boxShadow,
        }}
      >
        {icon ? (
          <span
            style={{
              color: focused ? "#8f2d1f" : "#9b8d82",
              display: "flex",
              alignItems: "center",
            }}
          >
            {icon}
          </span>
        ) : null}

        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          onFocus={() => setFocused(true)}
          aria-invalid={Boolean(error)}
          aria-describedby={descriptionId}
          required={required}
          style={{
            border: "none",
            outline: "none",
            width: "100%",
            fontSize: 14,
            background: "transparent",
            color: "#241b17",
            fontFamily: "inherit",
          }}
          {...rest}
        />
      </div>

      {error ? (
        <div
          id={`${inputId}-error`}
          style={{
            marginTop: 6,
            fontSize: 12,
            color: "#b42318",
            fontWeight: 700,
          }}
        >
          {error}
        </div>
      ) : hint ? (
        <div
          id={`${inputId}-hint`}
          style={{ marginTop: 6, fontSize: 12, color: "#6f6258" }}
        >
          {hint}
        </div>
      ) : null}
    </div>
  );
}
