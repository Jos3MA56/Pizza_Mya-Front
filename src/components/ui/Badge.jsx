const variants = {
  success: {
    background: "#ddffe8",
    color: "#0a7a34",
    border: "1px solid #bbf7d0",
  },
  warning: {
    background: "#fff7ed",
    color: "#9a3412",
    border: "1px solid #fed7aa",
  },
  danger: {
    background: "#ffe5e5",
    color: "#b00020",
    border: "1px solid #fecaca",
  },
  info: {
    background: "#dbeafe",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
  },
  neutral: {
    background: "#f1f5f9",
    color: "#334155",
    border: "1px solid #e2e8f0",
  },
};

export default function Badge({
  children,
  variant = "neutral",
  icon = null,
  onClick,
}) {
  const styles = variants[variant] || variants.neutral;
  const clickable = typeof onClick === "function";

  return (
    <span
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (clickable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderRadius: 999,
        fontWeight: 900,
        fontSize: 13,
        cursor: clickable ? "pointer" : "default",
        userSelect: "none",
        transition: "all .2s ease",
        ...styles,
      }}
    >
      {icon ? (
        <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>
      ) : null}
      {children}
    </span>
  );
}
