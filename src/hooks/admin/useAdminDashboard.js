import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../api/cliente.js";
import {
  buildRecentActivity,
  calcAlerts,
  calcStats,
  calcTopProductos,
  calcVentasPorPeriodo,
  downloadCsv,
  filterPedidosByRange,
  normalizeStatus,
} from "../../utils/adminDashboard.utils.js";

function buildTopClientes(pedidos = []) {
  const map = new Map();

  pedidos.forEach((pedido) => {
    const rawName =
      pedido?.cliente_nombre ||
      pedido?.nombre_cliente ||
      pedido?.cliente?.nombre_completo ||
      pedido?.cliente?.nombre ||
      pedido?.usuario?.nombre ||
      pedido?.usuario_nombre ||
      "Mostrador";

    const key = String(rawName || "Mostrador").trim() || "Mostrador";
    const current = map.get(key) || { nombre: key, pedidos: 0, total: 0 };
    current.pedidos += 1;
    current.total += Number(pedido?.total || 0);
    map.set(key, current);
  });

  return Array.from(map.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
}

function buildStatusBreakdown(pedidos = []) {
  const groups = [
    "pendiente",
    "preparando",
    "en_entrega",
    "completado",
    "cancelado",
  ];

  return groups.map((status) => ({
    label: status.replaceAll("_", " "),
    total: pedidos.filter(
      (pedido) =>
        normalizeStatus(pedido?.estatus || pedido?.estado || pedido?.status) ===
        status,
    ).length,
  }));
}

export function useAdminDashboard(token) {
  const [range, setRange] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const load = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        setError("");

        const [ordersRes, productsRes, usersRes] = await Promise.all([
          apiFetch("/api/admin/orders", {
            auth: false,
            headers: { Authorization: `Bearer ${token}` },
          }),
          apiFetch("/api/admin/products", {
            auth: false,
            headers: { Authorization: `Bearer ${token}` },
          }),
          apiFetch("/api/admin/usuarios", {
            auth: false,
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setPedidos(Array.isArray(ordersRes) ? ordersRes : []);
        setProductos(Array.isArray(productsRes) ? productsRes : []);
        setUsuarios(Array.isArray(usersRes) ? usersRes : []);
        setUpdatedAt(new Date());
      } catch (err) {
        setError(err?.message || "No se pudo cargar el dashboard.");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    if (token) load();
  }, [token, load]);

  const scopedPedidos = useMemo(
    () => filterPedidosByRange(pedidos, range),
    [pedidos, range],
  );

  const stats = useMemo(
    () => calcStats({ pedidos: scopedPedidos, productos, usuarios }),
    [scopedPedidos, productos, usuarios],
  );

  const ventasSerie = useMemo(
    () => calcVentasPorPeriodo(scopedPedidos, range),
    [scopedPedidos, range],
  );

  const topProductos = useMemo(
    () => calcTopProductos(scopedPedidos),
    [scopedPedidos],
  );

  const topClientes = useMemo(
    () => buildTopClientes(scopedPedidos),
    [scopedPedidos],
  );

  const statusBreakdown = useMemo(
    () => buildStatusBreakdown(scopedPedidos),
    [scopedPedidos],
  );

  const alerts = useMemo(
    () => calcAlerts({ pedidos: scopedPedidos, productos }),
    [scopedPedidos, productos],
  );

  const recentActivity = useMemo(() => buildRecentActivity(pedidos), [pedidos]);

  const exportPedidos = useCallback(() => {
    downloadCsv(
      `pedidos-${range}.csv`,
      scopedPedidos.map((item) => ({
        id: item.id,
        folio: item.folio || "",
        cliente:
          item.cliente_nombre ||
          item.nombre_cliente ||
          item.cliente?.nombre_completo ||
          "",
        estatus: item.estatus || item.estado || item.status || "",
        total: Number(item.total || 0).toFixed(2),
        fecha: item.created_at || item.createdAt || item.fecha || "",
      })),
    );
  }, [range, scopedPedidos]);

  return {
    range,
    setRange,
    loading,
    error,
    updatedAt,
    load,
    stats,
    ventasSerie,
    topProductos,
    topClientes,
    statusBreakdown,
    alerts,
    recentActivity,
    exportPedidos,
  };
}
