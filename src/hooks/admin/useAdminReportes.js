import { useCallback, useEffect, useMemo, useState } from "react";
import { adminReportesApi } from "../../api/adminReportes.api.js";
import {
  buildLast30DaysRange,
  normalizeDashboardPayload,
  safeArray,
  toNumber,
} from "../../utils/adminReportes.utils.js";

function unwrapArray(value, keys = []) {
  if (Array.isArray(value)) return value;

  for (const key of keys) {
    if (Array.isArray(value?.[key])) return value[key];
  }

  if (Array.isArray(value?.rows)) return value.rows;
  if (Array.isArray(value?.items)) return value.items;
  return [];
}

export function useAdminReportes(token) {
  const [filters, setFilters] = useState(buildLast30DaysRange());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) {
      setData(null);
      setError("No autenticado");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [
        dashboard,
        ventas,
        productos,
        clientes,
        metodos,
        horas,
        estatus,
        tiposPedido,
      ] = await Promise.all([
        adminReportesApi.dashboard({ token, ...filters }),
        adminReportesApi.ventas({ token, ...filters }),
        adminReportesApi.topProductos({ token, ...filters, limit: 10 }),
        adminReportesApi.topClientes({ token, ...filters, limit: 10 }),
        adminReportesApi.metodosPago({ token, ...filters }),
        adminReportesApi.horasPico({ token, ...filters }),
        adminReportesApi.estatus({ token, ...filters }),
        adminReportesApi.tiposPedido({ token, ...filters }),
      ]);

      const normalizedDashboard = normalizeDashboardPayload(dashboard || {});

      setData({
        dashboard: dashboard || {},
        resumen: normalizedDashboard.resumen,
        dias: unwrapArray(ventas, ["series", "rows"]).length
          ? unwrapArray(ventas, ["series", "rows"])
          : normalizedDashboard.dias,
        productos: unwrapArray(productos, ["productos", "items", "rows"]).length
          ? unwrapArray(productos, ["productos", "items", "rows"])
          : normalizedDashboard.productos,
        clientes: unwrapArray(clientes, ["clientes", "items", "rows"]).length
          ? unwrapArray(clientes, ["clientes", "items", "rows"])
          : normalizedDashboard.clientes,
        metodos: unwrapArray(metodos, ["metodos", "items", "rows"]).length
          ? unwrapArray(metodos, ["metodos", "items", "rows"])
          : normalizedDashboard.metodos,
        horas: unwrapArray(horas, ["horas", "items", "rows"]).length
          ? unwrapArray(horas, ["horas", "items", "rows"])
          : normalizedDashboard.horas,
        estatus: unwrapArray(estatus, ["estatus", "items", "rows"]).length
          ? unwrapArray(estatus, ["estatus", "items", "rows"])
          : normalizedDashboard.estatus,
        tiposPedido: unwrapArray(tiposPedido, ["tipos", "items", "rows"]).length
          ? unwrapArray(tiposPedido, ["tipos", "items", "rows"])
          : normalizedDashboard.tiposPedido,
      });
    } catch (err) {
      setData(null);
      setError(err?.message || "No se pudieron cargar los reportes");
    } finally {
      setLoading(false);
    }
  }, [token, filters]);

  useEffect(() => {
    load();
  }, [load]);

  const totals = useMemo(() => {
    const resumen = data?.resumen || {};
    const dashboard = data?.dashboard || {};

    return {
      ventasHoy: toNumber(resumen.ventasHoy ?? dashboard.ventas_hoy),
      ventasMes: toNumber(resumen.ventasMes ?? dashboard.ventas_mes),
      ventasTotal: toNumber(resumen.ventasTotal ?? dashboard.ventas_total),
      pedidosHoy: toNumber(resumen.pedidosHoy ?? dashboard.pedidos_hoy),
      pedidosMes: toNumber(resumen.pedidosMes ?? dashboard.pedidos_mes),
      pedidosTotal: toNumber(resumen.pedidosTotal ?? dashboard.pedidos_total),
      ticketPromedio: toNumber(
        resumen.ticketPromedio ?? dashboard.ticket_promedio,
      ),
      crecimiento: toNumber(resumen.crecimiento ?? dashboard.crecimiento),
      pendientes: toNumber(resumen.pendientes ?? dashboard.pedidos_pendientes),
      listos: toNumber(resumen.listos ?? dashboard.pedidos_listos),
      enEntrega: toNumber(resumen.enEntrega ?? dashboard.pedidos_en_entrega),
      entregados: toNumber(resumen.entregados ?? dashboard.pedidos_entregados),
      clientesActivos: toNumber(
        resumen.clientesActivos ?? dashboard.clientes_registrados,
      ),
      productosActivos: toNumber(
        resumen.productosActivos ?? dashboard.productos_activos,
      ),
      combosActivos: toNumber(
        resumen.combosActivos ?? dashboard.combos_activos,
      ),
    };
  }, [data]);

  const hasData = useMemo(() => {
    if (!data) return false;
    return (
      safeArray(data.dias).length > 0 ||
      safeArray(data.productos).length > 0 ||
      safeArray(data.clientes).length > 0 ||
      safeArray(data.metodos).length > 0
    );
  }, [data]);

  return {
    filters,
    data,
    loading,
    error,
    totals,
    hasData,
    setFilters,
    reload: load,
  };
}
