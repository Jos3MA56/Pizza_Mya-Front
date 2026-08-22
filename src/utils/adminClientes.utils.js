export function formatDate(value, withTime = false) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString(
    "es-MX",
    withTime
      ? { dateStyle: "medium", timeStyle: "short" }
      : { dateStyle: "medium" },
  );
}

export function formatCurrency(amount) {
  return `$${Number(amount || 0).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function buildClientesStats(clientes = []) {
  const activos = clientes.filter((c) => c.activo).length;
  const totalGastado = clientes.reduce(
    (acc, cliente) => acc + Number(cliente.total_gastado || 0),
    0,
  );
  const totalPedidos = clientes.reduce(
    (acc, cliente) => acc + Number(cliente.total_pedidos || 0),
    0,
  );

  return {
    total: clientes.length,
    activos,
    inactivos: clientes.length - activos,
    totalGastado,
    totalPedidos,
  };
}
export function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function getClientStatusStyles(active) {
  return active
    ? { background: "#dcfce7", color: "#166534", label: "Activo" }
    : { background: "#fee2e2", color: "#991b1b", label: "Inactivo" };
}
