import { useCallback, useEffect, useMemo, useState } from "react";
import { cajeroApi } from "../../api/cajero.api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import POSView from "../../components/cajero/pos/POSView.jsx";

function getOrderStatus(raw = {}) {
  return (
    raw.estatus || raw.status || raw.estado || raw.order_status || "PENDIENTE"
  );
}

function getPaymentStatus(raw = {}) {
  if (raw.pagado === true) return "PAGADO";
  return (
    raw.pago_estatus || raw.estatus_pago || raw.payment_status || "PENDIENTE"
  );
}

function getCustomerName(raw = {}) {
  if (raw.cliente && typeof raw.cliente === "object") {
    return (
      raw.cliente.nombre ||
      raw.cliente.name ||
      raw.cliente.full_name ||
      "Mostrador"
    );
  }

  return (
    raw.cliente_nombre ||
    raw.nombre_cliente ||
    raw.customer_name ||
    raw.cliente ||
    "Mostrador"
  );
}

function getOrderType(raw = {}) {
  return (
    raw.tipo || raw.tipo_entrega || raw.delivery_type || raw.modalidad || "-"
  );
}

function getOrderTotal(raw = {}) {
  return (
    Number(raw.total) ||
    Number(raw.total_pedido) ||
    Number(raw.importe_total) ||
    Number(raw.monto_total) ||
    0
  );
}

function normalizeOrder(raw = {}) {
  return {
    id: raw.id ?? raw.pedido_id ?? raw.order_id ?? null,
    folio: raw.folio || raw.numero || raw.id || "-",
    createdAt: raw.created_at || raw.fecha || raw.fecha_creacion || null,
    cliente: getCustomerName(raw),
    tipo: getOrderType(raw),
    total: getOrderTotal(raw),
    estatus: String(getOrderStatus(raw)).toUpperCase(),
    pagoEstatus: String(getPaymentStatus(raw)).toUpperCase(),
    metodoPagoId:
      raw.metodo_pago_id || raw.payment_method_id || raw.metodoPagoId || "",
    raw,
  };
}

function normalizeItems(raw = {}) {
  const items =
    raw.items ||
    raw.detalle ||
    raw.productos ||
    raw.order_items ||
    raw.pedido_items ||
    [];

  if (!Array.isArray(items)) return [];

  return items.map((item, index) => {
    const extras = Array.isArray(item.extras) ? item.extras : [];

    return {
      id: item.id ?? `${index}`,
      nombre:
        item.nombre ||
        item.nombre_snapshot ||
        item.producto_nombre ||
        item.descripcion ||
        "Producto",
      cantidad: Number(item.cantidad || 1),
      precio:
        Number(item.precio_unitario) ||
        Number(item.precio) ||
        Number(item.costo) ||
        0,
      total:
        Number(item.total_item) ||
        Number(item.total) ||
        Number(item.importe) ||
        0,
      extras,
      tamanio:
        item.tamanio ||
        item.size ||
        item.nombre_tamanio ||
        item.producto_tamanio ||
        "",
    };
  });
}

const COMMON_STATUS = [
  "PENDIENTE",
  "EN_PREPARACION",
  "LISTO",
  "ENTREGADO",
  "CANCELADO",
];

export default function CajeroPOS() {
  const { token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [search, setSearch] = useState("");
  const [nextStatus, setNextStatus] = useState("PENDIENTE");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");

  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadBase = useCallback(
    async ({ silent = false } = {}) => {
      if (!token) return;

      if (!silent) setLoading(true);
      if (silent) setRefreshing(true);
      setError("");

      try {
        const [ordersData, methodsData] = await Promise.all([
          cajeroApi.listPedidos(token),
          cajeroApi.listMetodosPago(token),
        ]);

        const normalizedOrders = (Array.isArray(ordersData) ? ordersData : [])
          .map(normalizeOrder)
          .sort((a, b) => {
            const aTime = new Date(a.createdAt || 0).getTime();
            const bTime = new Date(b.createdAt || 0).getTime();
            return bTime - aTime;
          });

        setOrders(normalizedOrders);
        setPaymentMethods(Array.isArray(methodsData) ? methodsData : []);

        if (!selectedId && normalizedOrders.length > 0) {
          setSelectedId(normalizedOrders[0].id);
        }

        if (
          selectedId &&
          !normalizedOrders.some(
            (item) => String(item.id) === String(selectedId),
          )
        ) {
          setSelectedId(normalizedOrders[0]?.id || null);
        }
      } catch (err) {
        setError(
          err?.message || "No se pudo cargar la información del punto de venta",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, selectedId],
  );

  const loadDetail = useCallback(
    async (id) => {
      if (!token || !id) return;

      setDetailLoading(true);
      setError("");

      try {
        const detail = await cajeroApi.getPedidoDetalle({ token, id });
        const base = normalizeOrder(detail || {});
        const items = normalizeItems(detail || {});
        const merged = {
          ...base,
          items,
          raw: detail || {},
        };

        setSelectedDetail(merged);
        setNextStatus(merged.estatus || "PENDIENTE");
        setSelectedPaymentMethod(
          String(
            merged.metodoPagoId ||
              detail?.metodo_pago_id ||
              paymentMethods?.[0]?.id ||
              "",
          ),
        );
      } catch (err) {
        setError(err?.message || "No se pudo cargar el detalle del pedido");
        setSelectedDetail(null);
      } finally {
        setDetailLoading(false);
      }
    },
    [token, paymentMethods],
  );

  useEffect(() => {
    loadBase();
  }, [loadBase]);

  useEffect(() => {
    if (selectedId) {
      loadDetail(selectedId);
    } else {
      setSelectedDetail(null);
    }
  }, [selectedId, loadDetail]);

  const filteredOrders = useMemo(() => {
    const term = String(search || "")
      .trim()
      .toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "TODOS"
          ? true
          : String(order.estatus).toUpperCase() === statusFilter;

      const matchesSearch =
        !term ||
        String(order.id).includes(term) ||
        String(order.folio).toLowerCase().includes(term) ||
        String(order.cliente).toLowerCase().includes(term) ||
        String(order.tipo).toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  const statusOptions = useMemo(() => {
    const dynamic = orders.map((item) =>
      String(item.estatus || "").toUpperCase(),
    );
    return Array.from(new Set([...COMMON_STATUS, ...dynamic])).filter(Boolean);
  }, [orders]);

  const stats = useMemo(() => {
    const pending = orders.filter((o) => o.estatus === "PENDIENTE").length;
    const preparing = orders.filter(
      (o) => o.estatus === "EN_PREPARACION" || o.estatus === "EN PREPARACION",
    ).length;
    const delivered = orders.filter((o) => o.estatus === "ENTREGADO").length;
    const totalSales = orders.reduce((acc, item) => {
      return item.pagoEstatus === "PAGADO"
        ? acc + Number(item.total || 0)
        : acc;
    }, 0);

    return {
      total: orders.length,
      pending,
      preparing,
      delivered,
      totalSales,
    };
  }, [orders]);

  const selectedSummary = useMemo(() => {
    if (!selectedId) return null;
    return (
      orders.find((item) => String(item.id) === String(selectedId)) || null
    );
  }, [orders, selectedId]);

  const handleRefresh = async () => {
    await loadBase({ silent: true });
    if (selectedId) {
      await loadDetail(selectedId);
    }
  };

  const handleChangeStatus = async () => {
    if (!selectedDetail?.id) return;
    if (!nextStatus) {
      setError("Selecciona un estado");
      return;
    }

    try {
      setActionLoading("status");
      setError("");
      setSuccess("");

      await cajeroApi.changeStatus(token, selectedDetail.id, nextStatus);

      setSuccess("Estado actualizado correctamente");
      await loadBase({ silent: true });
      await loadDetail(selectedDetail.id);
    } catch (err) {
      setError(err?.message || "No se pudo actualizar el estado");
    } finally {
      setActionLoading("");
    }
  };

  const handleMarkPaid = async () => {
    if (!selectedDetail?.id) return;
    if (!selectedPaymentMethod) {
      setError("Selecciona un método de pago");
      return;
    }

    try {
      setActionLoading("pay");
      setError("");
      setSuccess("");

      await cajeroApi.markPaid(token, selectedDetail.id, selectedPaymentMethod);

      setSuccess("Pedido cobrado correctamente");
      await loadBase({ silent: true });
      await loadDetail(selectedDetail.id);
    } catch (err) {
      setError(err?.message || "No se pudo registrar el pago");
    } finally {
      setActionLoading("");
    }
  };

  return (
    <POSView
      search={search}
      setSearch={setSearch}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      statusOptions={statusOptions}
      handleRefresh={handleRefresh}
      refreshing={refreshing}
      error={error}
      success={success}
      stats={stats}
      loading={loading}
      filteredOrders={filteredOrders}
      selectedId={selectedId}
      setSelectedId={setSelectedId}
      detailLoading={detailLoading}
      selectedDetail={selectedDetail}
      nextStatus={nextStatus}
      setNextStatus={setNextStatus}
      handleChangeStatus={handleChangeStatus}
      actionLoading={actionLoading}
      paymentMethods={paymentMethods}
      selectedPaymentMethod={selectedPaymentMethod}
      setSelectedPaymentMethod={setSelectedPaymentMethod}
      handleMarkPaid={handleMarkPaid}
    />
  );
}
