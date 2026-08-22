export default function Button({
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
      background: "#8f2d1f",
      color: "#fff",
      border: "1px solid #8f2d1f",
      boxShadow: "0 12px 22px rgba(143,45,31,.16)",
    },
    secondary: {
      background: "#fffaf6",
      color: "#241b17",
      border: "1px solid #e5d8cb",
      boxShadow: "0 8px 18px rgba(36,27,23,.05)",
    },
    danger: {
      background: "#7d1f1f",
      color: "#fff",
      border: "1px solid #7d1f1f",
      boxShadow: "0 12px 22px rgba(125,31,31,.16)",
    },
    success: {
      background: "#2f6a4f",
      color: "#fff",
      border: "1px solid #2f6a4f",
      boxShadow: "0 12px 22px rgba(47,106,79,.16)",
    },
    ghost: {
      background: "transparent",
      color: "#241b17",
      border: "1px solid #e5d8cb",
      boxShadow: "none",
    },
  };

  const sizeStyles = {
    sm: {
      minHeight: 38,
      padding: "10px 14px",
      fontSize: 13,
      borderRadius: 11,
    },
    md: {
      minHeight: 44,
      padding: "12px 18px",
      fontSize: 14,
      borderRadius: 13,
    },
    lg: {
      minHeight: 50,
      padding: "14px 22px",
      fontSize: 15,
      borderRadius: 15,
    },
  };

  const styles = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: fullWidth ? "100%" : "auto",
    fontWeight: 900,
    cursor: isDisabled ? "not-allowed" : "pointer",
    opacity: isDisabled ? 0.65 : 1,
    transition:
      "transform .18s ease, filter .18s ease, box-shadow .18s ease, opacity .18s ease",
    fontFamily: "inherit",
    outline: "none",
    textDecoration: "none",
    ...variantStyles[variant],
    ...sizeStyles[size],
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={className}
      style={styles}
      aria-busy={loading}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.filter = "brightness(0.96)";
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
