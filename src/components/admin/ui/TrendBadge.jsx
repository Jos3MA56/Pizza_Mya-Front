import { subtleBadgeStyle } from "../ui/adminTheme.js";

export default function TrendBadge({ value, size = "sm" }) {
  const abs = Math.abs(Number(value) || 0);

  let label, tone;

  if (abs < 0.005) {
    label = "Estable";
    tone = "success";
  } else if (value > 0) {
    label = `Crecimiento`;
    tone = "accent";
  } else {
    label = `Decrecimiento`;
    tone = "info";
  }

  return (
    <span
      style={{
        ...subtleBadgeStyle(tone),
        fontSize: size === "sm" ? 10 : 11,
        padding: size === "sm" ? "3px 8px" : "4px 10px",
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      {value > 0.005 ? "↑" : value < -0.005 ? "↓" : "→"}
      {label}
    </span>
  );
}
