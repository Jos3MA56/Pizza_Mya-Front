import { useCallback, useEffect, useMemo, useState } from "react";
import { adminUsuariosApi } from "../../api/adminClientes.api.js";

const DEBOUNCE_MS = 350;

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function useAdminClientes(token) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);

  const [filters, setFilters] = useState({ search: "", limit: 50, offset: 0 });

  // Solo disparar el fetch cuando el search deje de cambiar
  const debouncedSearch = useDebounce(filters.search, DEBOUNCE_MS);

  const loadClientes = useCallback(async () => {
    if (!token) {
      setClientes([]);
      setError("No autenticado");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const rows = await adminUsuariosApi.list({
        token,
        search: debouncedSearch,
      });

      setClientes(Array.isArray(rows) ? rows : []);
      setUpdatedAt(new Date().toISOString());
    } catch (err) {
      setError(err?.message || "No se pudieron cargar los clientes");
      setClientes([]);
    } finally {
      setLoading(false);
    }
  }, [token, debouncedSearch]);

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  const onSearchChange = useCallback((value) => {
    setFilters((prev) => ({ ...prev, search: value, offset: 0 }));
  }, []);

  const refresh = useCallback(() => loadClientes(), [loadClientes]);

  const stats = useMemo(() => {
    const totalClientes = clientes.length;
    const totalPedidos = clientes.reduce(
      (acc, item) => acc + Number(item?.total_pedidos || 0),
      0,
    );
    const totalGastado = clientes.reduce(
      (acc, item) => acc + Number(item?.total_gastado || 0),
      0,
    );
    const clientesActivos = clientes.filter(
      (item) => Number(item?.total_pedidos || 0) > 0,
    ).length;
    return { totalClientes, totalPedidos, totalGastado, clientesActivos };
  }, [clientes]);

  return {
    clientes,
    loading,
    submitting,
    error,
    filters,
    setFilters,
    onSearchChange,
    refresh,
    stats,
    updatedAt,
    setSubmitting,
  };
}
