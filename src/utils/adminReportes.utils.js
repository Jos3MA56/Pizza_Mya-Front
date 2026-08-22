export function formatCurrency(value) {
  return `$${Number(value || 0).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatMoney(value) {
  return formatCurrency(value);
}

export function formatPercent(value) {
  return `${Number(value || 0).toLocaleString("es-MX", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  })}%`;
}

export function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function toNumber(value) {
  return Number(value || 0);
}

export function buildLast30DaysRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 29);

  const fmt = (date) => date.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to), groupBy: "day" };
}

export function normalizeDashboardPayload(payload = {}) {
  const ventas = payload.ventas || payload.sales || {};
  const pedidos = payload.pedidos || payload.orders || {};
  const metodos = safeArray(payload.metodos_pago || payload.payment_methods);
  const productos = safeArray(payload.top_productos || payload.top_products);
  const clientes = safeArray(payload.top_clientes || payload.top_clients);
  const dias = safeArray(payload.ventas_por_dia || payload.daily_sales);
  const horas = safeArray(payload.horas_pico || payload.peak_hours);
  const estatus = safeArray(payload.estatus || payload.statuses);
  const tiposPedido = safeArray(payload.tipos_pedido || payload.order_types);

  return {
    resumen: {
      ventasHoy: toNumber(ventas.hoy || payload.ventas_hoy),
      ventasMes: toNumber(ventas.mes || payload.ventas_mes),
      ventasTotal: toNumber(payload.ventas_total),
      pedidosHoy: toNumber(pedidos.hoy || payload.pedidos_hoy),
      pedidosMes: toNumber(payload.pedidos_mes),
      pedidosTotal: toNumber(payload.pedidos_total),
      ticketPromedio: toNumber(
        payload.ticket_promedio || ventas.ticket_promedio,
      ),
      crecimiento: toNumber(payload.crecimiento),
      pendientes: toNumber(payload.pedidos_pendientes),
      listos: toNumber(payload.pedidos_listos),
      enEntrega: toNumber(payload.pedidos_en_entrega),
      entregados: toNumber(payload.pedidos_entregados),
      clientesConCompra: toNumber(payload.clientes_con_compra),
      clientesActivos: toNumber(payload.clientes_registrados),
      productosActivos: toNumber(payload.productos_activos),
      combosActivos: toNumber(payload.combos_activos),
    },
    metodos,
    productos,
    clientes,
    dias,
    horas,
    estatus,
    tiposPedido,
  };
}

export function getSummaryCards(resumen = {}) {
  return [
    {
      key: "ventasHoy",
      label: "Ventas hoy",
      value: formatMoney(resumen.ventasHoy),
      icon: "💸",
      variant: "red",
    },
    {
      key: "ventasMes",
      label: "Ventas del mes",
      value: formatMoney(resumen.ventasMes),
      icon: "📅",
      variant: "dark",
    },
    {
      key: "pedidosHoy",
      label: "Pedidos hoy",
      value: toNumber(resumen.pedidosHoy),
      icon: "🧾",
      variant: "blue",
    },
    {
      key: "ticketPromedio",
      label: "Ticket promedio",
      value: formatMoney(resumen.ticketPromedio),
      icon: "🛒",
      variant: "green",
    },
    {
      key: "crecimiento",
      label: "Crecimiento",
      value: formatPercent(resumen.crecimiento),
      icon: "📈",
      variant: "yellow",
    },
    {
      key: "pendientes",
      label: "Pedidos pendientes",
      value: toNumber(resumen.pendientes),
      icon: "⏳",
      variant: "red",
    },
    {
      key: "clientesActivos",
      label: "Clientes activos",
      value: toNumber(resumen.clientesActivos),
      icon: "👥",
      variant: "blue",
    },
    {
      key: "productosActivos",
      label: "Productos activos",
      value: toNumber(resumen.productosActivos),
      icon: "🍕",
      variant: "green",
    },
  ];
}

export function downloadCsv(filename, rows = []) {
  if (!rows.length) return false;

  const headers = Object.keys(rows[0]);
  const csv = [headers.join(",")]
    .concat(
      rows.map((row) =>
        headers
          .map((key) => `"${String(row[key] ?? "").replace(/"/g, '""')}"`)
          .join(","),
      ),
    )
    .join("\n");

  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  return true;
}

export function toCsvRowsVentas(rows = []) {
  return safeArray(rows).map((row) => ({
    periodo: row.periodo || row.label || row.fecha || "",
    pedidos: toNumber(row.pedidos),
    subtotal: toNumber(row.subtotal),
    ventas: toNumber(row.ventas || row.total),
    ticket_promedio: toNumber(row.ticketPromedio || row.ticket_promedio),
  }));
}

export function toCsvRowsProductos(rows = []) {
  return safeArray(rows).map((row) => ({
    producto: row.nombre || row.label || "Producto",
    tamanio: row.tamanio || "",
    vendidos: toNumber(row.cantidad || row.total),
    ingresos: toNumber(row.ingresos || row.totalVendido || row.total_vendido),
  }));
}

export function toCsvRowsClientes(rows = []) {
  return safeArray(rows).map((row) => ({
    cliente: row.nombre || "Cliente",
    email: row.email || "",
    telefono: row.telefono || "",
    pedidos: toNumber(row.totalPedidos || row.total_pedidos),
    total_gastado: toNumber(row.totalGastado || row.total_gastado),
    ticket_promedio: toNumber(row.ticketPromedio || row.ticket_promedio),
    ultimo_pedido: row.ultimoPedido || row.ultimo_pedido || "",
  }));
}
