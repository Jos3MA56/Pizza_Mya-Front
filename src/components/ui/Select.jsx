import { useId, useState } from "react";

export default function Select({
  label,
  error = "",
  hint = "",
  value,
  onChange,
  options = [],
  placeholder = "Selecciona una opción",
  name,
  id,
  disabled = false,
  required = false,
  children,
  ...rest
}) {
  const generatedId = useId();
  const inputId = id || name || `select-${generatedId}`;
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

      <select
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={descriptionId}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          padding: "12px 14px",
          border: `1px solid ${borderColor}`,
          borderRadius: 14,
          fontSize: 15,
          background: disabled ? "#f7f2ec" : "#fffaf6",
          color: value === "" ? "#6f6258" : "#241b17",
          fontFamily: "inherit",
          outline: "none",
          boxSizing: "border-box",
          minHeight: 50,
          boxShadow,
          transition: "border-color .18s ease, box-shadow .18s ease",
          appearance: "none",
          backgroundImage:
            "linear-gradient(45deg, transparent 50%, #8f2d1f 50%), linear-gradient(135deg, #8f2d1f 50%, transparent 50%)",
          backgroundPosition:
            "calc(100% - 20px) calc(50% - 3px), calc(100% - 14px) calc(50% - 3px)",
          backgroundSize: "6px 6px, 6px 6px",
          backgroundRepeat: "no-repeat",
        }}
        {...rest}
      >
        {children ? (
          children
        ) : (
          <>
            <option value="">{placeholder}</option>
            {options.map((option) => {
              const optionValue =
                typeof option === "object" ? option.value : option;
              const optionLabel =
                typeof option === "object" ? option.label : option;

              return (
                <option key={optionValue} value={optionValue}>
                  {optionLabel}
                </option>
              );
            })}
          </>
        )}
      </select>

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
