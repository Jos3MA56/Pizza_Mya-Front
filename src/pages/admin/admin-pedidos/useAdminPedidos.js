import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../../context/AuthContext.jsx";
import { adminPedidosApi } from "../../../api/adminPedidos.api.js";
import { adminMlApi } from "../../../api/adminMl.api.js";
import {
  buildCalendarDays,
  downloadCsv,
  matchesQuery,
  parseToDate,
  sortPedidos,
  toDateOnlyValue,
} from "./adminPedidos.utils.js";

const TABS = [
  "TODOS",
  "PENDIENTE",
  "PREPARANDO",
  "EN_ENTREGA",
  "COMPLETADO",
  "CANCELADO",
];

function getRawEstado(pedido = {}) {
  return String(
    pedido.estatus ||
      pedido.estado ||
      pedido.status ||
      pedido.pedido_estatus ||
      "PENDIENTE",
  )
    .trim()
    .toUpperCase();
}

function normalizeEstadoPedido(pedido = {}) {
  const raw = getRawEstado(pedido);

  if (raw === "PENDIENTE") return "PENDIENTE";

  if (
    [
      "CONFIRMADO",
      "EN_PREPARACION",
      "EN_PREPARACIÓN",
      "EN_PROCESO",
      "PREPARANDO",
      "LISTO",
    ].includes(raw)
  ) {
    return "PREPARANDO";
  }

  if (["EN_CAMINO", "EN_ENTREGA", "EN_REPARTO"].includes(raw)) {
    return "EN_ENTREGA";
  }

  if (["ENTREGADO", "COMPLETADO"].includes(raw)) {
    return "COMPLETADO";
  }

  if (["CANCELADO", "CANCELADA"].includes(raw)) {
    return "CANCELADO";
  }

  return raw || "PENDIENTE";
}

function isMlEligibleOrder(pedido = {}) {
  const estado = normalizeEstadoPedido(pedido);

  if (["COMPLETADO", "CANCELADO"].includes(estado)) {
    return false;
  }

  const tipo = String(
    pedido.tipo_pedido ||
      pedido.tipo_entrega ||
      pedido.metodo_entrega ||
      "",
  )
    .trim()
    .toLowerCase();

  const hasDeliveryAddress = Boolean(
    String(pedido.direccion_entrega || pedido.direccion || "").trim(),
  );

  return tipo.includes("domic") || hasDeliveryAddress;
}
function getFechaPedido(pedido = {}) {
  return (
    pedido.created_at ||
    pedido.createdAt ||
    pedido.created ||
    pedido.fecha ||
    pedido.updated_at ||
    null
  );
}

function normalizePedidoRow(pedido = {}) {
  const estadoUi = normalizeEstadoPedido(pedido);
  const fecha = getFechaPedido(pedido);

  return {
    ...pedido,
    estado: estadoUi,
    estatus: pedido.estatus || pedido.estado || estadoUi,
    created: fecha,
    created_at: fecha,
  };
}

function buildStats(rows = []) {
  return {
    pendientes: rows.filter(
      (item) => normalizeEstadoPedido(item) === "PENDIENTE",
    ).length,
    preparando: rows.filter(
      (item) => normalizeEstadoPedido(item) === "PREPARANDO",
    ).length,
    enEntrega: rows.filter(
      (item) => normalizeEstadoPedido(item) === "EN_ENTREGA",
    ).length,
    completados: rows.filter(
      (item) => normalizeEstadoPedido(item) === "COMPLETADO",
    ).length,
    cancelados: rows.filter(
      (item) => normalizeEstadoPedido(item) === "CANCELADO",
    ).length,
  };
}

export function useAdminPedidos() {
  const { token } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [q, setQ] = useState("");
  const [tab, setTab] = useState("TODOS");
  const [orden, setOrden] = useState("recientes");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [showDetalle, setShowDetalle] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [confirmPedido, setConfirmPedido] = useState(null);
  const [updatingId, setUpdatingId] = useState("");

  const [riskByPedido, setRiskByPedido] = useState({});
  const [riskLoadingByPedido, setRiskLoadingByPedido] = useState({});
  const riskRequestedRef = useRef(new Set());

  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [selectedDate, setSelectedDate] = useState(null);

  const today = useMemo(() => new Date(), []);

  const clearSuccessLater = useCallback(() => {
    window.clearTimeout(clearSuccessLater._timer);
    clearSuccessLater._timer = window.setTimeout(() => {
      setSuccess("");
    }, 2500);
  }, []);

  const load = useCallback(async () => {
    if (!token) {
      setItems([]);
      setError("No autenticado");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const rows = await adminPedidosApi.list({ token });
      const safeRows = Array.isArray(rows) ? rows.map(normalizePedidoRow) : [];

      riskRequestedRef.current.clear();
      setRiskByPedido({});
      setRiskLoadingByPedido({});
      setItems(safeRows);
    } catch (err) {
      setItems([]);
      setError(err?.message || "No se pudieron cargar los pedidos");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [q, tab, orden, pageSize, selectedDate]);

  const filtered = useMemo(() => {
    const search = String(q || "")
      .trim()
      .toLowerCase();
    let rows = Array.isArray(items) ? [...items] : [];

    if (tab !== "TODOS") {
      rows = rows.filter((pedido) => normalizeEstadoPedido(pedido) === tab);
    }

    if (selectedDate) {
      const selectedValue = toDateOnlyValue(selectedDate);

      rows = rows.filter((pedido) => {
        const date = parseToDate(getFechaPedido(pedido));
        return date ? toDateOnlyValue(date) === selectedValue : false;
      });
    }

    if (search) {
      rows = rows.filter((pedido) => matchesQuery(pedido, search));
    }

    return sortPedidos(rows, orden);
  }, [items, orden, q, selectedDate, tab]);

  const stats = useMemo(() => buildStats(filtered), [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const start = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, filtered.length);

  const paginated = useMemo(() => {
    const from = (safePage - 1) * pageSize;
    return filtered.slice(from, from + pageSize);
  }, [filtered, pageSize, safePage]);


  useEffect(() => {
    if (!token || !Array.isArray(paginated) || paginated.length === 0) {
      return undefined;
    }

    const candidates = paginated.filter((pedido) => {
      const id = String(pedido?.id || "").trim();

      return (
        id &&
        isMlEligibleOrder(pedido) &&
        !riskRequestedRef.current.has(id)
      );
    });

    if (candidates.length === 0) {
      return undefined;
    }

    let cancelled = false;

    for (const pedido of candidates) {
      const id = String(pedido.id);
      riskRequestedRef.current.add(id);
    }

    setRiskLoadingByPedido((current) => {
      const next = { ...current };

      for (const pedido of candidates) {
        next[String(pedido.id)] = true;
      }

      return next;
    });

    async function loadVisibleRisks() {
      for (const pedido of candidates) {
        if (cancelled) break;

        const id = String(pedido.id);

        try {
          const response = await adminMlApi.classifyOrder({
            token,
            pedidoId: id,
          });

          if (!cancelled) {
            setRiskByPedido((current) => ({
              ...current,
              [id]: {
                ok: true,
                data: response,
              },
            }));
          }
        } catch (err) {
          riskRequestedRef.current.delete(id);

          if (!cancelled) {
            setRiskByPedido((current) => ({
              ...current,
              [id]: {
                ok: false,
                error:
                  err?.message ||
                  "No fue posible calcular el riesgo.",
              },
            }));
          }
        } finally {
          if (!cancelled) {
            setRiskLoadingByPedido((current) => ({
              ...current,
              [id]: false,
            }));
          }
        }
      }
    }

    loadVisibleRisks();

    return () => {
      cancelled = true;
    };
  }, [paginated, token]);
  const monthTitle = useMemo(
    () =>
      calendarMonth.toLocaleDateString("es-MX", {
        month: "long",
        year: "numeric",
      }),
    [calendarMonth],
  );

  const calendarDays = useMemo(
    () => buildCalendarDays(calendarMonth),
    [calendarMonth],
  );

  const pedidosEnFechaSeleccionada = useMemo(() => {
    if (!selectedDate) return items.length;

    const selectedValue = toDateOnlyValue(selectedDate);

    return items.filter((pedido) => {
      const date = parseToDate(getFechaPedido(pedido));
      return date ? toDateOnlyValue(date) === selectedValue : false;
    }).length;
  }, [items, selectedDate]);

  const openDetalle = useCallback(
    async (pedido) => {
      const id = typeof pedido === "string" ? pedido : pedido?.id;

      if (!id) return;

      try {
        setError("");

        const detail = await adminPedidosApi.getById({ token, id });

        setSelectedPedido(normalizePedidoRow(detail || pedido));
      } catch {
        setSelectedPedido(
          typeof pedido === "object" ? normalizePedidoRow(pedido) : null,
        );
      } finally {
        setShowDetalle(true);
      }
    },
    [token],
  );

  const closeDetalle = useCallback(() => {
    setShowDetalle(false);
    setSelectedPedido(null);
  }, []);

  const confirmEnviar = useCallback((pedido) => {
    setConfirmPedido(pedido);
  }, []);

  const cancelConfirm = useCallback(() => {
    setConfirmPedido(null);
  }, []);

  const marcarEnEntrega = useCallback(async () => {
    if (!confirmPedido?.id) return;

    try {
      setUpdatingId(String(confirmPedido.id));
      setError("");
      setSuccess("");

      await adminPedidosApi.setEstado({
        token,
        id: confirmPedido.id,
        estado: "EN_CAMINO",
      });

      setItems((prev) =>
        prev.map((pedido) =>
          String(pedido.id) === String(confirmPedido.id)
            ? {
                ...pedido,
                estatus: "EN_CAMINO",
                estado: "EN_ENTREGA",
              }
            : pedido,
        ),
      );

      if (
        selectedPedido &&
        String(selectedPedido.id) === String(confirmPedido.id)
      ) {
        setSelectedPedido((prev) =>
          prev
            ? {
                ...prev,
                estatus: "EN_CAMINO",
                estado: "EN_ENTREGA",
              }
            : prev,
        );
      }

      setSuccess(
        `Pedido ${confirmPedido.folio || confirmPedido.id} enviado a entrega`,
      );

      clearSuccessLater();
      setConfirmPedido(null);
    } catch (err) {
      setError(err?.message || "No se pudo actualizar el pedido");
    } finally {
      setUpdatingId("");
    }
  }, [clearSuccessLater, confirmPedido, selectedPedido, token]);

  const exportPedidos = useCallback(() => {
    const rows = filtered.map((pedido) => ({
      folio: pedido.folio || pedido.id,
      cliente:
        pedido.cliente?.nombre_completo ||
        pedido.cliente_nombre ||
        pedido.nombre_cliente ||
        [pedido.cliente_nombres, pedido.cliente_paterno, pedido.cliente_materno]
          .filter(Boolean)
          .join(" ") ||
        "",
      email: pedido.cliente?.email || pedido.cliente_email || "",
      telefono: pedido.cliente?.telefono || pedido.cliente_telefono || "",
      fecha: getFechaPedido(pedido) || "",
      estatus: pedido.estatus || pedido.estado || "",
      tipo_pedido: pedido.tipo_pedido || pedido.tipo_entrega || "",
      metodo_pago: pedido.metodo_pago || "",
      pago_estatus: pedido.pago_estatus || pedido.transaccion?.estatus || "",
      total: Number(pedido.total || 0).toFixed(2),
      direccion: pedido.direccion_entrega || "",
    }));

    downloadCsv("pedidos-admin.csv", rows);
  }, [filtered]);

  return {
    items,
    filtered,
    paginated,
    loading,
    error,
    success,
    stats,
    q,
    setQ,
    tab,
    setTab,
    orden,
    setOrden,
    page,
    setPage,
    pageSize,
    setPageSize,
    tabs: TABS,
    load,
    exportPedidos,
    start,
    end,
    totalPages,
    showDetalle,
    selectedPedido,
    openDetalle,
    closeDetalle,
    confirmPedido,
    confirmEnviar,
    cancelConfirm,
    marcarEnEntrega,
    updatingId,
    riskByPedido,
    riskLoadingByPedido,
    today,
    calendarMonth,
    setCalendarMonth,
    monthTitle,
    calendarDays,
    selectedDate,
    setSelectedDate,
    pedidosEnFechaSeleccionada,
  };
}
