export function toLower(v) {
  return String(v ?? "")
    .trim()
    .toLowerCase();
}

export function fmtDateTime(v) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return `${d.toLocaleDateString("es-MX")} · ${d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}`;
}

export function money(v) {
  const n = Number(v ?? 0);
  return `$${n.toFixed(2)}`;
}

export function normalizeEstado(raw) {
  const s = toLower(raw);
  if (["pendiente", "pending"].includes(s)) return "PENDIENTE";
  if (["preparando", "preparing", "en_preparacion"].includes(s))
    return "PREPARANDO";
  if (["en_entrega", "en entrega", "delivery", "out_for_delivery"].includes(s))
    return "EN_ENTREGA";
  if (["completado", "completada", "completed", "entregado"].includes(s))
    return "COMPLETADO";
  if (["cancelado", "cancelada", "canceled"].includes(s)) return "CANCELADO";
  return String(raw || "PENDIENTE").toUpperCase();
}

export function statusPillStyle(estado) {
  if (estado === "PREPARANDO")
    return {
      background: "#dbeafe",
      color: "#1d4ed8",
      border: "1px solid #bfdbfe",
    };
  if (estado === "PENDIENTE")
    return {
      background: "#fff7ed",
      color: "#9a3412",
      border: "1px solid #fed7aa",
    };
  if (estado === "EN_ENTREGA")
    return {
      background: "#ecfeff",
      color: "#0e7490",
      border: "1px solid #a5f3fc",
    };
  if (estado === "COMPLETADO")
    return {
      background: "#ddffe8",
      color: "#0a7a34",
      border: "1px solid #bbf7d0",
    };
  if (estado === "CANCELADO")
    return {
      background: "#ffe5e5",
      color: "#b00020",
      border: "1px solid #fecaca",
    };
  return {
    background: "#f1f5f9",
    color: "#334155",
    border: "1px solid #e2e8f0",
  };
}

export function getElapsedInfo(created, estado, nowTick) {
  if (!created)
    return { label: "Sin hora", tone: "neutral", minutes: 0, isActive: false };
  const active = !["COMPLETADO", "CANCELADO"].includes(estado);
  const date = new Date(created);
  if (Number.isNaN(date.getTime()))
    return { label: "Sin hora", tone: "neutral", minutes: 0, isActive: active };
  const minutes = Math.max(0, Math.floor((nowTick - date.getTime()) / 60000));
  if (!active)
    return {
      label: `${minutes} min final`,
      tone: "neutral",
      minutes,
      isActive: false,
    };
  if (minutes >= 21)
    return {
      label: `${minutes} min · Retrasado`,
      tone: "danger",
      minutes,
      isActive: true,
    };
  if (minutes >= 11)
    return {
      label: `${minutes} min · Atención`,
      tone: "warning",
      minutes,
      isActive: true,
    };
  return {
    label: `${minutes} min · A tiempo`,
    tone: "success",
    minutes,
    isActive: true,
  };
}

export function elapsedStyle(tone) {
  if (tone === "danger")
    return {
      background: "#ffe5e5",
      color: "#b00020",
      border: "1px solid #fecaca",
    };
  if (tone === "warning")
    return {
      background: "#fff7ed",
      color: "#9a3412",
      border: "1px solid #fed7aa",
    };
  if (tone === "success")
    return {
      background: "#ddffe8",
      color: "#0a7a34",
      border: "1px solid #bbf7d0",
    };
  return {
    background: "#f1f5f9",
    color: "#334155",
    border: "1px solid #e2e8f0",
  };
}

export function downloadCsv(filename, rows) {
  const header = Object.keys(rows[0] || {});
  const csv = [header.join(",")]
    .concat(
      rows.map((row) =>
        header
          .map((key) => {
            const value = row[key] ?? "";
            const normalized = String(value).replace(/"/g, '""');
            return `"${normalized}"`;
          })
          .join(","),
      ),
    )
    .join("\n");

  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function isSameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function toDateOnlyValue(date) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseToDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function buildCalendarDays(currentMonthDate) {
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekDay = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWeekDay; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1)
    cells.push(new Date(year, month, day));
  return cells;
}

function getPedidoDate(pedido) {
  return parseToDate(pedido?.created_at || pedido?.created || pedido?.fecha);
}

function getClienteNombre(pedido) {
  return (
    pedido?.cliente?.nombre_completo ||
    pedido?.cliente_nombre ||
    pedido?.nombre_cliente ||
    pedido?.cliente?.nombre ||
    ""
  );
}

function getClienteEmail(pedido) {
  return pedido?.cliente?.email || pedido?.email_cliente || "";
}

function getClienteTelefono(pedido) {
  return pedido?.cliente?.telefono || pedido?.telefono_cliente || "";
}

function getDireccion(pedido) {
  return (
    pedido?.direccion_entrega ||
    pedido?.direccion ||
    pedido?.cliente?.direccion ||
    ""
  );
}

function getProductosTexto(pedido) {
  const items = Array.isArray(pedido?.items) ? pedido.items : [];

  return items
    .map(
      (item) =>
        item?.nombre_snapshot ||
        item?.nombre ||
        item?.producto_nombre ||
        item?.producto?.nombre ||
        "",
    )
    .filter(Boolean)
    .join(" ");
}

export function matchesQuery(pedido, search) {
  const q = toLower(search);
  if (!q) return true;

  const estado = normalizeEstado(pedido?.estatus || pedido?.estado || "");
  const haystack = [
    pedido?.folio,
    pedido?.id,
    getClienteNombre(pedido),
    getClienteEmail(pedido),
    getClienteTelefono(pedido),
    getDireccion(pedido),
    getProductosTexto(pedido),
    estado,
  ]
    .map((value) => toLower(value))
    .join(" ");

  return haystack.includes(q);
}

export function sortPedidos(rows = [], orden = "recientes") {
  const list = Array.isArray(rows) ? [...rows] : [];

  return list.sort((a, b) => {
    const dateA = getPedidoDate(a)?.getTime?.() || 0;
    const dateB = getPedidoDate(b)?.getTime?.() || 0;
    const totalA = Number(a?.total || 0);
    const totalB = Number(b?.total || 0);

    if (orden === "antiguos") {
      return dateA - dateB;
    }

    if (orden === "tiempo") {
      return dateA - dateB;
    }

    if (orden === "monto") {
      return totalB - totalA;
    }

    return dateB - dateA;
  });
}
