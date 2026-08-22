const palette = {
  bg: "#f5efe9",
  surface: "#fffaf5",
  card: "#ffffff",
  cardSoft: "#f7f1eb",
  cardMuted: "#f3ede7",
  border: "#e6d9cc",
  borderStrong: "#d7c5b4",
  text: "#201813",
  muted: "#6f6359",
  subtle: "#8a7d72",
  accent: "#8f3a2b",
  accentHover: "#7b3022",
  accentSoft: "rgba(143,58,43,.10)",
  gold: "#b88846",
  goldSoft: "rgba(184,136,70,.12)",
  success: "#2f6a4f",
  successSoft: "rgba(47,106,79,.10)",
  warning: "#9b6b27",
  warningSoft: "rgba(155,107,39,.12)",
  danger: "#a04343",
  dangerSoft: "rgba(160,67,67,.10)",
  info: "#315e86",
  infoSoft: "rgba(49,94,134,.10)",
  shadow: "0 14px 32px rgba(43, 30, 22, 0.08)",
  shadowSoft: "0 8px 22px rgba(43, 30, 22, 0.05)",
  panelStrong: "#f1e7dc",
};

export const adminTheme = {
  ...palette,
  radiusLg: 24,
  radiusMd: 18,
  radiusSm: 14,
  radius: {
    xl: 28,
    lg: 22,
    md: 16,
    sm: 12,
    pill: 999,
  },
  colors: {
    bg: palette.bg,
    bgAlt: "#efe6dc",
    panel: palette.surface,
    panelSoft: palette.cardSoft,
    panelStrong: palette.panelStrong,
    border: palette.border,
    borderStrong: palette.borderStrong,
    text: palette.text,
    textSoft: palette.muted,
    textMuted: palette.subtle,
    primary: palette.accent,
    primaryHover: palette.accentHover,
    accent: palette.gold,
    accentSoft: palette.goldSoft,
    success: palette.success,
    successSoft: palette.successSoft,
    info: palette.info,
    infoSoft: palette.infoSoft,
    warning: palette.warning,
    warningSoft: palette.warningSoft,
    danger: palette.danger,
    dangerSoft: palette.dangerSoft,
    shadow: palette.shadow,
    shadowSoft: palette.shadowSoft,
  },
};

export const adminVariantMap = {
  accent: {
    bg: "linear-gradient(135deg, rgba(143,58,43,.12), rgba(184,136,70,.07))",
    iconBg: "rgba(143,58,43,.10)",
    iconColor: palette.accent,
  },
  olive: {
    bg: "linear-gradient(135deg, rgba(47,106,79,.12), rgba(86,138,103,.08))",
    iconBg: "rgba(47,106,79,.10)",
    iconColor: palette.success,
  },
  amber: {
    bg: "linear-gradient(135deg, rgba(184,136,70,.13), rgba(245,158,11,.06))",
    iconBg: "rgba(184,136,70,.12)",
    iconColor: palette.warning,
  },
  slate: {
    bg: "linear-gradient(135deg, rgba(67,56,202,.08), rgba(71,85,105,.08))",
    iconBg: "rgba(71,85,105,.10)",
    iconColor: "#475569",
  },
  rose: {
    bg: "linear-gradient(135deg, rgba(160,67,67,.10), rgba(143,58,43,.06))",
    iconBg: "rgba(160,67,67,.10)",
    iconColor: palette.danger,
  },
};

export function getAdminVariant(variant = "accent") {
  return adminVariantMap[variant] || adminVariantMap.accent;
}

export function panelStyle(overrides = {}) {
  return {
    background: adminTheme.colors.panel,
    border: `1px solid ${adminTheme.colors.border}`,
    borderRadius: adminTheme.radius.lg,
    boxShadow: adminTheme.colors.shadow,
    ...overrides,
  };
}

export function softPanelStyle(overrides = {}) {
  return panelStyle({
    background: adminTheme.colors.panelSoft,
    boxShadow: adminTheme.colors.shadowSoft,
    ...overrides,
  });
}

export function inputStyle(overrides = {}) {
  return {
    width: "100%",
    minHeight: 46,
    padding: "11px 14px",
    borderRadius: adminTheme.radius.sm,
    border: `1px solid ${adminTheme.colors.borderStrong}`,
    background: "#fff",
    color: adminTheme.colors.text,
    fontFamily: "inherit",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    ...overrides,
  };
}

export function selectStyle(width = "100%") {
  return {
    width,
    minHeight: 46,
    borderRadius: 14,
    border: `1px solid ${adminTheme.border}`,
    background: adminTheme.card,
    color: adminTheme.text,
    padding: "0 14px",
    fontWeight: 700,
    boxShadow: adminTheme.shadowSoft,
    outline: "none",
  };
}

export function subtleBadgeStyle(tone = "default") {
  const tones = {
    default: {
      background: adminTheme.colors.panelStrong,
      color: adminTheme.colors.textSoft,
      border: adminTheme.colors.border,
    },
    primary: {
      background: "rgba(139, 51, 38, 0.12)",
      color: adminTheme.colors.primary,
      border: "rgba(139, 51, 38, 0.18)",
    },
    accent: {
      background: adminTheme.colors.accentSoft,
      color: adminTheme.colors.warning,
      border: "rgba(199, 144, 82, 0.18)",
    },
    success: {
      background: adminTheme.colors.successSoft,
      color: adminTheme.colors.success,
      border: "rgba(45, 108, 82, 0.18)",
    },
    info: {
      background: adminTheme.colors.infoSoft,
      color: adminTheme.colors.info,
      border: "rgba(63, 110, 164, 0.18)",
    },
    danger: {
      background: adminTheme.colors.dangerSoft,
      color: adminTheme.colors.danger,
      border: "rgba(163, 60, 43, 0.18)",
    },
  };

  const config = tones[tone] || tones.default;
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 30,
    padding: "6px 10px",
    borderRadius: adminTheme.radius.pill,
    border: `1px solid ${config.border}`,
    background: config.background,
    color: config.color,
    fontSize: 12,
    fontWeight: 800,
  };
}

export function statusToneFromText(raw = "") {
  const value = String(raw || "").toLowerCase();
  if (/(complet|entregad|active|ok|estab|healthy|success)/.test(value))
    return "success";
  if (/(entrega|proceso|prep|progress|warn)/.test(value)) return "info";
  if (/(pend|hold|review)/.test(value)) return "accent";
  if (/(cancel|error|critical|down|fail)/.test(value)) return "danger";
  return "default";
}
