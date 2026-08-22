export function normalizeEstado(raw) {
  const value = String(raw || "").trim().toUpperCase();

  if (["PENDIENTE", "PENDING"].includes(value)) return "PENDIENTE";
  if (["EN_PREPARACION", "PREPARANDO", "EN_PROCESO"].includes(value)) return "EN_PREPARACION";
  if (["LISTO"].includes(value)) return "LISTO";
  if (["EN_ENTREGA", "EN ENTREGA", "DELIVERY", "OUT_FOR_DELIVERY"].includes(value)) return "EN_ENTREGA";
  if (["ENTREGADO", "COMPLETADO"].includes(value)) return "ENTREGADO";
  if (["CANCELADO"].includes(value)) return "CANCELADO";

  return value || "PENDIENTE";
}

export function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export function fmtDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return `${date.toLocaleDateString("es-MX")} · ${date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export function toLocalDateString(dateValue) {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function getElapsedInfo(createdAt, estado, nowTick) {
  const date = new Date(createdAt);
  if (!createdAt || Number.isNaN(date.getTime())) {
    return { label: "Sin hora", tone: "neutral", minutes: 0 };
  }

  const minutes = Math.max(0, Math.floor((nowTick - date.getTime()) / 60000));
  const active = !["ENTREGADO", "CANCELADO"].includes(estado);

  if (!active) return { label: `${minutes} min final`, tone: "neutral", minutes };
  if (minutes >= 21) return { label: `${minutes} min · Retrasado`, tone: "danger", minutes };
  if (minutes >= 11) return { label: `${minutes} min · Atención`, tone: "warning", minutes };
  return { label: `${minutes} min · A tiempo`, tone: "success", minutes };
}

export function toneStyle(tone) {
  if (tone === "danger") return { bg: "#ffe5e5", text: "#b00020" };
  if (tone === "warning") return { bg: "#fff7ed", text: "#9a3412" };
  if (tone === "success") return { bg: "#ddffe8", text: "#0a7a34" };
  return { bg: "#f1f5f9", text: "#334155" };
}

export function getEstadoColor(estado) {
  const colors = {
    PENDIENTE: { bg: "#fef3c7", text: "#92400e" },
    EN_PREPARACION: { bg: "#dbeafe", text: "#1e40af" },
    LISTO: { bg: "#e0e7ff", text: "#3730a3" },
    EN_ENTREGA: { bg: "#ecfeff", text: "#0e7490" },
    ENTREGADO: { bg: "#ddffe8", text: "#0a7a34" },
    CANCELADO: { bg: "#ffe5e5", text: "#b00020" },
  };
  return colors[estado] || { bg: "#f1f5f9", text: "#334155" };
}

export function formatEstadoLabel(estado) {
  if (estado === "EN_PREPARACION") return "EN PREPARACIÓN";
  if (estado === "EN_ENTREGA") return "EN ENTREGA";
  return estado;
}

export function buildCalendarDays(calendarMonth) {
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekDay = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const days = [];

  for (let i = 0; i < startWeekDay; i += 1) days.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    days.push({ day, value: toLocalDateString(date) });
  }
  return days;
}

export function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.28);
    oscillator.onended = () => ctx.close();
  } catch {}
}
