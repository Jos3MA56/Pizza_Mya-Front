import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../../context/AuthContext.jsx";
import { cajeroApi } from "../../../api/cajero.api.js";
import {
  beep,
  buildCalendarDays,
  formatEstadoLabel,
  getElapsedInfo,
  normalizeEstado,
  toLocalDateString,
} from "./cajeroPedidos.utils.js";

export function useCajeroPedidos() {
  const { token } = useAuth();

  const [pedidos, setPedidos] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [filtro, setFiltro] = useState("TODOS");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [orden, setOrden] = useState("recientes");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [nowTick, setNowTick] = useState(Date.now());
  const [showEstadoMenu, setShowEstadoMenu] = useState(false);
  const [fechaFiltro, setFechaFiltro] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const initializedRef = useRef(false);
  const lastPendingCountRef = useRef(0);

  const estadoOptions = useMemo(
    () => [
      { value: "TODOS", label: "Todos" },
      { value: "PENDIENTE", label: "Pendientes" },
      { value: "EN_PREPARACION", label: "En preparación" },
      { value: "LISTO", label: "Listos" },
      { value: "EN_ENTREGA", label: "En entrega" },
      { value: "ENTREGADO", label: "Entregados" },
      { value: "CANCELADO", label: "Cancelados" },
    ],
    [],
  );

  const loadMetodosPago = useCallback(async () => {
    try {
      const data = await cajeroApi.listMetodosPago(token);
      setMetodosPago(Array.isArray(data) ? data : []);
    } catch (e) {
      setMetodosPago([]);
      setError(e?.message || "No se pudieron cargar los métodos de pago");
    }
  }, [token]);

  const loadPedidos = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        setError("");

        const data = await cajeroApi.getPedidos({ token });
        const lista = Array.isArray(data) ? data : [];

        const pendingCount = lista.filter(
          (pedido) =>
            normalizeEstado(pedido.estatus || pedido.estado) === "PENDIENTE",
        ).length;

        if (
          initializedRef.current &&
          pendingCount > lastPendingCountRef.current
        ) {
          beep();
          setSuccess("Llegó un nuevo pedido pendiente.");
        }

        initializedRef.current = true;
        lastPendingCountRef.current = pendingCount;
        setPedidos(lista);
      } catch (e) {
        setPedidos([]);
        setError(e?.message || "No se pudieron cargar los pedidos");
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    if (!token) return;
    loadPedidos();
    loadMetodosPago();
  }, [token, loadPedidos, loadMetodosPago]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowTick(Date.now());
      loadPedidos(true);
    }, 30000);
    return () => window.clearInterval(timer);
  }, [loadPedidos]);

  useEffect(() => {
    if (!success) return undefined;
    const timer = window.setTimeout(() => setSuccess(""), 3500);
    return () => window.clearTimeout(timer);
  }, [success]);

  const pedidosMapeados = useMemo(() => {
    return pedidos.map((pedido) => {
      const estadoNormalizado = normalizeEstado(
        pedido.estatus || pedido.estado,
      );
      const createdAt =
        pedido.created_at || pedido.fecha || pedido.fecha_creacion;
      const elapsed = getElapsedInfo(createdAt, estadoNormalizado, nowTick);
      return {
        ...pedido,
        estadoNormalizado,
        estadoLabel: formatEstadoLabel(estadoNormalizado),
        createdAt,
        dateOnly: toLocalDateString(createdAt),
        elapsed,
      };
    });
  }, [pedidos, nowTick]);

  const pedidosFiltrados = useMemo(() => {
    const term = String(search || "")
      .trim()
      .toLowerCase();

    const list = pedidosMapeados.filter((pedido) => {
      const estadoOk =
        filtro === "TODOS" || pedido.estadoNormalizado === filtro;
      const fechaOk = !fechaFiltro || pedido.dateOnly === fechaFiltro;
      const haystack = [
        pedido.folio,
        pedido.cliente?.nombre_completo,
        pedido.nombre_cliente,
        pedido.cliente?.telefono,
        pedido.metodo_pago,
        pedido.metodo_pago_nombre,
        pedido.tipo_entrega,
        pedido.metodo_entrega,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const searchOk = !term || haystack.includes(term);
      return estadoOk && fechaOk && searchOk;
    });

    list.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      if (orden === "antiguos") return dateA - dateB;
      if (orden === "tiempo") return b.elapsed.minutes - a.elapsed.minutes;
      return dateB - dateA;
    });

    return list;
  }, [pedidosMapeados, filtro, fechaFiltro, orden, search]);

  useEffect(() => {
    setPage(1);
  }, [filtro, orden, pageSize, fechaFiltro, search]);

  const totalPages = Math.max(1, Math.ceil(pedidosFiltrados.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const start = (pageSafe - 1) * pageSize;
  const end = Math.min(start + pageSize, pedidosFiltrados.length);
  const pedidosPagina = pedidosFiltrados.slice(start, end);

  const verDetalle = useCallback(
    async (pedidoId) => {
      try {
        setError("");
        const detalle = await cajeroApi.getPedidoDetalle({
          token,
          id: pedidoId,
        });
        setPedidoSeleccionado(detalle);
        setMostrarDetalle(true);
      } catch (e) {
        setError(e?.message || "No se pudo cargar el detalle del pedido");
      }
    },
    [token],
  );

  const cerrarModal = useCallback(() => {
    setMostrarDetalle(false);
    setPedidoSeleccionado(null);
  }, []);

  const procesarPago = useCallback(
    async (paymentData) => {
      if (!pedidoSeleccionado) return;

      try {
        setProcesandoPago(true);
        setError("");
        setSuccess("");

        const resultado = await cajeroApi.pagarPedido({
          token,
          id: pedidoSeleccionado.id,
          ...paymentData,
        });

        setSuccess(
          `Pedido ${pedidoSeleccionado.folio || ""} marcado como pagado.`,
        );
        cerrarModal();
        await loadPedidos(true);
        return resultado;
      } catch (e) {
        setError(e?.message || "No se pudo procesar el pago");
        throw e;
      } finally {
        setProcesandoPago(false);
      }
    },
    [cerrarModal, loadPedidos, pedidoSeleccionado, token],
  );

  return {
    token,
    pedidos,
    metodosPago,
    pedidosFiltrados,
    pedidosPagina,
    pedidoSeleccionado,
    mostrarDetalle,
    procesandoPago,
    error,
    success,
    loading,
    filtro,
    setFiltro,
    search,
    setSearch,
    orden,
    setOrden,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    pageSafe,
    start,
    end,
    fechaFiltro,
    setFechaFiltro,
    calendarMonth,
    setCalendarMonth,
    calendarDays: buildCalendarDays(calendarMonth),
    estadoOptions,
    showEstadoMenu,
    setShowEstadoMenu,
    loadPedidos,
    verDetalle,
    cerrarModal,
    procesarPago,
  };
}
