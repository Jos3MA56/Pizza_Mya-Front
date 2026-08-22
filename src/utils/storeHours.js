export function parseStoreTimeToMinutes(value) {
  const raw = String(value ?? "").trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);

  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return hours * 60 + minutes;
}

export function formatStoreTime(value, fallback = "--:--") {
  const raw = String(value ?? "").trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);

  if (!match) return fallback;

  return `${String(match[1]).padStart(2, "0")}:${match[2]}`;
}

export function getStoreScheduleStatus(config) {
  const openMin = parseStoreTimeToMinutes(config?.hora_apertura);
  const closeMin = parseStoreTimeToMinutes(config?.hora_cierre);

  const schedule = `${formatStoreTime(
    config?.hora_apertura,
    "12:00",
  )} - ${formatStoreTime(config?.hora_cierre, "23:00")}`;

  if (openMin === null || closeMin === null) {
    return {
      isOpen: true,
      label: "Abierto",
      schedule,
      reason: "Horario no configurado correctamente",
    };
  }

  if (openMin === closeMin) {
    return {
      isOpen: true,
      label: "Abierto todo el día",
      schedule,
      reason: "Horario 24 horas",
    };
  }

  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();

  const isOpen =
    closeMin > openMin
      ? currentMin >= openMin && currentMin < closeMin
      : currentMin >= openMin || currentMin < closeMin;

  return {
    isOpen,
    label: isOpen ? "Abierto ahora" : "Fuera de horario",
    schedule,
    reason: isOpen
      ? "La tienda está dentro del horario de atención"
      : "La tienda está fuera del horario de atención",
  };
}
