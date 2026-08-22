export const STATUS_CFG = {
  pendiente: { label: "Pendiente", bg: "#fef3c7", color: "#92400e" },
  preparando: { label: "Preparando", bg: "#dbeafe", color: "#1d4ed8" },
  en_preparacion: { label: "Preparando", bg: "#dbeafe", color: "#1d4ed8" },
  en_entrega: { label: "En entrega", bg: "#ede9fe", color: "#6b21a8" },
  completado: { label: "Completado", bg: "#dcfce7", color: "#166534" },
  cancelado: { label: "Cancelado", bg: "#fee2e2", color: "#991b1b" },
};

export function normalizeStatus(raw) {
  return String(raw || "pendiente")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");
}

export function getStatusConfig(raw) {
  const key = normalizeStatus(raw);
  return (
    STATUS_CFG[key] || {
      label: raw || "Sin estado",
      bg: "#f3f4f6",
      color: "#374151",
    }
  );
}

export function formatMoney(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(value || 0));
}

export function formatDate(value, opts = {}) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-MX", opts);
}

export function sameDay(a, b) {
  const left = new Date(a);
  const right = new Date(b);
  if (Number.isNaN(left.getTime()) || Number.isNaN(right.getTime()))
    return false;
  return left.toDateString() === right.toDateString();
}

export function filterPedidosByRange(pedidos = [], range = "7d") {
  const now = new Date();
  if (range === "today") {
    return pedidos.filter((p) =>
      sameDay(p.created_at || p.createdAt || p.fecha, now),
    );
  }

  const min = new Date();
  min.setDate(min.getDate() - (range === "30d" ? 29 : 6));
  min.setHours(0, 0, 0, 0);

  return pedidos.filter((p) => {
    const d = new Date(p.created_at || p.createdAt || p.fecha);
    return !Number.isNaN(d.getTime()) && d >= min;
  });
}

export function calcTopProductos(pedidos = []) {
  const totals = new Map();

  pedidos.forEach((pedido) => {
    const items = pedido.items || pedido.detalle || pedido.productos || [];
    items.forEach((item) => {
      const nombre =
        item.nombre_snapshot ||
        item.nombre ||
        item.producto?.nombre ||
        item.name ||
        "Producto";
      totals.set(
        nombre,
        (totals.get(nombre) || 0) + Number(item.cantidad || 1),
      );
    });
  });

  return Array.from(totals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([nombre, cantidad]) => ({ nombre, cantidad }));
}

export function calcVentasPorPeriodo(pedidos = [], range = "7d") {
  const count = range === "30d" ? 30 : 7;
  const buckets = [];

  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    buckets.push({
      key: d.toDateString(),
      label:
        count === 30
          ? d.toLocaleDateString("es-MX", { day: "2-digit", month: "short" })
          : d.toLocaleDateString("es-MX", { weekday: "short" }),
      total: 0,
      pedidos: 0,
    });
  }

  pedidos.forEach((pedido) => {
    const d = new Date(pedido.created_at || pedido.createdAt || pedido.fecha);
    const bucket = buckets.find((item) => item.key === d.toDateString());
    if (bucket) {
      bucket.total += Number(pedido.total || 0);
      bucket.pedidos += 1;
    }
  });

  return buckets;
}

export function calcStats({ pedidos = [], productos = [], usuarios = [] }) {
  const today = new Date();
  const pedidosHoy = pedidos.filter((p) =>
    sameDay(p.created_at || p.createdAt || p.fecha, today),
  );
  const ventasHoy = pedidosHoy.reduce(
    (acc, item) => acc + Number(item.total || 0),
    0,
  );
  const cancelados = pedidos.filter(
    (p) => normalizeStatus(p.estatus || p.estado || p.status) === "cancelado",
  ).length;
  const retrasados = pedidos.filter((p) => {
    const status = normalizeStatus(p.estatus || p.estado || p.status);
    const created = new Date(p.created_at || p.createdAt || p.fecha || 0);
    return (
      !["entregado", "cancelado", "completado"].includes(status) &&
      !Number.isNaN(created.getTime()) &&
      Date.now() - created.getTime() > 45 * 60 * 1000
    );
  }).length;

  return {
    ventasHoy,
    pedidosHoy: pedidosHoy.length,
    pendientes: pedidos.filter(
      (p) => normalizeStatus(p.estatus || p.estado || p.status) === "pendiente",
    ).length,
    enEntrega: pedidos.filter(
      (p) =>
        normalizeStatus(p.estatus || p.estado || p.status) === "en_entrega",
    ).length,
    clientes: usuarios.filter((u) =>
      ["", "cliente"].includes(
        String(u.rol || u.role || u.tipo || "").toLowerCase(),
      ),
    ).length,
    activos: productos.filter((p) => p.activo !== false).length,
    noDisponibles: productos.filter((p) => p.disponible === false).length,
    ticketPromedio: pedidosHoy.length ? ventasHoy / pedidosHoy.length : 0,
    cancelados,
    retrasados,
  };
}

export function calcAlerts({ pedidos = [], productos = [] }) {
  const alerts = [];
  const retrasados = pedidos.filter((p) => {
    const status = normalizeStatus(p.estatus || p.estado || p.status);
    const created = new Date(p.created_at || p.createdAt || p.fecha || 0);
    return (
      !["entregado", "cancelado", "completado"].includes(status) &&
      !Number.isNaN(created.getTime()) &&
      Date.now() - created.getTime() > 45 * 60 * 1000
    );
  }).length;

  if (retrasados > 0) {
    alerts.push({
      title: "Pedidos atrasados",
      description: `${retrasados} pedido(s) llevan más de 45 minutos activos.`,
      tone: "#b91c1c",
    });
  }

  const noDisponibles = productos.filter((p) => p.disponible === false).length;
  if (noDisponibles > 0) {
    alerts.push({
      title: "Productos no disponibles",
      description: `${noDisponibles} producto(s) están marcados como no disponibles.`,
      tone: "#92400e",
    });
  }

  if (!alerts.length) {
    alerts.push({
      title: "Operación estable",
      description:
        "No se detectaron alertas críticas con la información cargada.",
      tone: "#166534",
    });
  }

  return alerts;
}

export function buildRecentActivity(pedidos = []) {
  return [...pedidos]
    .sort(
      (a, b) =>
        new Date(b.updated_at || b.created_at || 0) -
        new Date(a.updated_at || a.created_at || 0),
    )
    .slice(0, 8)
    .map((pedido) => ({
      id: pedido.id,
      title: `Pedido #${pedido.folio || pedido.id?.slice?.(0, 8) || "—"}`,
      subtitle:
        pedido.cliente_nombre ||
        pedido.usuario?.nombre ||
        pedido.nombre_cliente ||
        pedido.cliente?.nombre_completo ||
        "Cliente",
      status: pedido.estatus || pedido.estado || pedido.status || "pendiente",
      at: pedido.updated_at || pedido.created_at || pedido.fecha,
      amount: Number(pedido.total || 0),
    }));
}

export function downloadCsv(filename, rows = []) {
  if (!rows.length) return;
  const header = Object.keys(rows[0]);
  const csv = [header.join(",")]
    .concat(
      rows.map((row) =>
        header
          .map((key) => `"${String(row[key] ?? "").replace(/"/g, '""')}"`)
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
