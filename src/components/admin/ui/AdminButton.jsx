import { adminTheme } from "./adminTheme.js";

export default function AdminButton({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  loadingText = "Cargando...",
  disabled = false,
  fullWidth = false,
  leftIcon = null,
  rightIcon = null,
  onClick,
  className = "",
}) {
  const isDisabled = disabled || loading;

  const variantStyles = {
    primary: {
      background: adminTheme.accent,
      color: "#fff",
      border: `1px solid ${adminTheme.accent}`,
      boxShadow: "0 10px 22px rgba(143,58,43,.16)",
    },
    secondary: {
      background: adminTheme.card,
      color: adminTheme.text,
      border: `1px solid ${adminTheme.border}`,
      boxShadow: adminTheme.shadowSoft,
    },
    danger: {
      background: adminTheme.danger,
      color: "#fff",
      border: `1px solid ${adminTheme.danger}`,
      boxShadow: "0 10px 22px rgba(160,67,67,.14)",
    },
    success: {
      background: adminTheme.success,
      color: "#fff",
      border: `1px solid ${adminTheme.success}`,
      boxShadow: "0 10px 22px rgba(47,106,79,.14)",
    },
    ghost: {
      background: "transparent",
      color: adminTheme.text,
      border: `1px solid ${adminTheme.border}`,
      boxShadow: "none",
    },
  };

  const sizeStyles = {
    sm: { minHeight: 38, padding: "10px 14px", fontSize: 13, borderRadius: 12 },
    md: { minHeight: 44, padding: "12px 18px", fontSize: 14, borderRadius: 14 },
    lg: { minHeight: 50, padding: "14px 22px", fontSize: 15, borderRadius: 16 },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        width: fullWidth ? "100%" : "auto",
        fontWeight: 800,
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.65 : 1,
        transition:
          "transform .18s ease, filter .18s ease, box-shadow .18s ease, opacity .18s ease, background .18s ease",
        fontFamily: "inherit",
        outline: "none",
        textDecoration: "none",
        ...variantStyles[variant],
        ...sizeStyles[size],
      }}
      aria-busy={loading}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.filter = "brightness(0.98)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.filter = "none";
      }}
    >
      {loading ? <span aria-hidden="true">⏳</span> : leftIcon}
      <span>{loading ? loadingText : children}</span>
      {!loading ? rightIcon : null}
    </button>
  );
}
