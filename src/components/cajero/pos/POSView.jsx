import Button from "../../ui/Button.jsx";
import Select from "../../ui/Select.jsx";
import {
  CircleDollarSign,
  CreditCard,
  Receipt,
  RefreshCw,
  ShoppingBag,
  User,
} from "lucide-react";

function money(value) {
  const number = Number(value || 0);
  return number.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

function formatDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("es-MX");
  } catch {
    return String(value);
  }
}

function normalizeText(value, fallback = "-") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function statusColor(status) {
  const value = String(status || "").toUpperCase();

  if (value === "ENTREGADO") {
    return { bg: "#dcfce7", color: "#166534" };
  }

  if (value === "CANCELADO") {
    return { bg: "#fee2e2", color: "#b91c1c" };
  }

  if (value === "LISTO") {
    return { bg: "#dbeafe", color: "#1d4ed8" };
  }

  if (value === "EN_PREPARACION" || value === "EN PREPARACION") {
    return { bg: "#fef3c7", color: "#92400e" };
  }

  return { bg: "#e5e7eb", color: "#334155" };
}

export const POS_STYLES = `
  .pos-shell{display:grid;gap:22px;min-height:0;}
  .pos-shell::before{content:"";display:block;height:1px;opacity:0;}
  .pos-head{
    display:flex;
    justify-content:space-between;
    align-items:flex-start;
    gap:18px;
    flex-wrap:wrap;
    padding:24px;
    border-radius:28px;
    border:1px solid #e5e7eb;
    background:linear-gradient(135deg,#ffffff 0%, #fff7ed 100%);
    box-shadow:0 18px 40px rgba(15,23,42,.06);
  }
  .pos-title{
    margin:0;
    font-size:42px;
    line-height:1;
    font-weight:900;
    color:#0f172a;
  }
  .pos-subtitle{
    margin:10px 0 0;
    color:#64748b;
    font-size:15px;
    font-weight:600;
  }
  .pos-actions{
    display:flex;
    gap:12px;
    flex-wrap:wrap;
    align-items:flex-end;
  }
  .pos-field{
    min-width:240px;
    display:grid;
    gap:6px;
  }
  .pos-field-small{
    min-width:180px;
    display:grid;
    gap:6px;
  }
  .pos-stats{
    display:grid;
    grid-template-columns:repeat(4,minmax(0,1fr));
    gap:16px;
  }
  .pos-stat{
    background:linear-gradient(180deg,#ffffff 0%, #f8fafc 100%);
    border:1px solid #e5e7eb;
    border-radius:24px;
    padding:18px 20px;
    box-shadow:0 12px 28px rgba(0,0,0,.05);
  }
  .pos-stat-label{
    color:#64748b;
    font-weight:800;
    font-size:13px;
    margin-bottom:8px;
  }
  .pos-stat-value{
    font-size:30px;
    font-weight:900;
    color:#0f172a;
    line-height:1.1;
  }
  .pos-grid{
    display:grid;
    grid-template-columns:minmax(340px,430px) minmax(0,1fr);
    gap:20px;
    height:min(76dvh, 900px);
    min-height:540px;
    align-items:start;
  }
  .pos-panel{
    background:#fff;
    border:1px solid #e5e7eb;
    border-radius:28px;
    padding:20px;
    box-shadow:0 14px 32px rgba(0,0,0,.05);
    display:flex;
    flex-direction:column;
    min-height:0;
    overflow:hidden;
  }
  .pos-panel-title{
    margin:0 0 14px;
    font-size:24px;
    font-weight:900;
    color:#0f172a;
    flex-shrink:0;
    letter-spacing:-.02em;
  }
  .pos-list{
    display:grid;
    gap:12px;
    overflow-y:auto;
    overflow-x:hidden;
    min-height:0;
    padding-right:6px;
    flex:1;
  }
  .pos-list::-webkit-scrollbar,
  .pos-detail-scroll::-webkit-scrollbar{
    width:10px;
  }
  .pos-list::-webkit-scrollbar-thumb,
  .pos-detail-scroll::-webkit-scrollbar-thumb{
    background:#cbd5e1;
    border-radius:999px;
  }
  .pos-order{
    border:1px solid #e5e7eb;
    background:linear-gradient(180deg,#ffffff 0%, #fbfdff 100%);
    border-radius:20px;
    padding:16px;
    cursor:pointer;
    transition:.18s ease;
  }
  .pos-order:hover{
    transform:translateY(-1px);
    box-shadow:0 8px 20px rgba(0,0,0,.05);
  }
  .pos-order-active{
    border-color:#f97316;
    box-shadow:0 14px 28px rgba(249,115,22,.18);
  }
  .pos-order-top{
    display:flex;
    justify-content:space-between;
    align-items:flex-start;
    gap:12px;
    margin-bottom:10px;
  }
  .pos-order-id{
    font-size:28px;
    font-weight:900;
    color:#0f172a;
    line-height:1;
  }
  .pos-badge{
    display:inline-flex;
    align-items:center;
    justify-content:center;
    padding:8px 12px;
    border-radius:999px;
    font-size:12px;
    font-weight:900;
    white-space:nowrap;
  }
  .pos-order-meta{
    display:grid;
    grid-template-columns:repeat(2,minmax(0,1fr));
    gap:10px 14px;
  }
  .pos-meta-label{
    color:#64748b;
    font-size:12px;
    font-weight:800;
    margin-bottom:4px;
  }
  .pos-meta-value{
    color:#0f172a;
    font-size:15px;
    font-weight:900;
    word-break:break-word;
  }
  .pos-detail-scroll{
    overflow-y:auto;
    overflow-x:hidden;
    min-height:0;
    padding-right:6px;
    display:grid;
    gap:16px;
    flex:1;
  }
  .pos-section{
    border:1px solid #e5e7eb;
    border-radius:22px;
    padding:18px;
    background:linear-gradient(180deg,#ffffff 0%, #fcfcfd 100%);
  }
  .pos-section-title{
    margin:0 0 12px;
    font-size:18px;
    font-weight:900;
    color:#111827;
  }
  .pos-detail-grid{
    display:grid;
    grid-template-columns:repeat(2,minmax(0,1fr));
    gap:12px 18px;
  }
  .pos-item{
    border:1px solid #e5e7eb;
    border-radius:18px;
    padding:14px;
    background:#fff;
  }
  .pos-item-name{
    font-size:16px;
    font-weight:900;
    color:#111827;
  }
  .pos-item-meta{
    color:#64748b;
    font-weight:700;
    font-size:13px;
    margin-top:4px;
  }
  .pos-item-total{
    margin-top:10px;
    font-size:16px;
    font-weight:900;
    color:#0f172a;
  }
  .pos-message{
    border-radius:18px;
    padding:14px 16px;
    font-weight:800;
  }
  .pos-message-error{
    background:#fef2f2;
    color:#b91c1c;
    border:1px solid #fecaca;
  }
  .pos-message-success{
    background:#ecfdf5;
    color:#166534;
    border:1px solid #bbf7d0;
  }
  .pos-empty{
    flex:1;
    display:flex;
    align-items:center;
    justify-content:center;
    text-align:center;
    color:#64748b;
    font-weight:800;
    padding:32px;
  }
  .pos-inline-actions{
    display:flex;
    gap:12px;
    flex-wrap:wrap;
    align-items:flex-end;
    padding-top:2px;
  }
  .pos-inline-field{
    min-width:240px;
    display:grid;
    gap:6px;
  }

    .pos-input,
  .pos-select{
    min-width:220px;
    height:50px;
    padding:0 14px;
    border:1px solid #d7dde5;
    border-radius:14px;
    background:#fff;
    color:#0f172a;
    font-size:15px;
    font-family:inherit;
    box-sizing:border-box;
    outline:none;
    transition:border-color .18s ease, box-shadow .18s ease;
  }
  .pos-input::placeholder{
    color:#94a3b8;
  }
  .pos-input:focus,
  .pos-select:focus{
    border-color:#f97316;
    box-shadow:0 0 0 4px rgba(249,115,22,.14);
  }
  .pos-btn{
    height:50px;
    padding:0 16px;
    border:1px solid #d7dde5;
    border-radius:14px;
    background:#fff;
    color:#0f172a;
    font-size:15px;
    font-weight:800;
    font-family:inherit;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    gap:8px;
    cursor:pointer;
    transition:.18s ease;
    box-sizing:border-box;
  }
  .pos-btn:hover{
    border-color:#f97316;
    box-shadow:0 10px 20px rgba(15,23,42,.06);
    transform:translateY(-1px);
  }
  .pos-btn:disabled{
    opacity:.7;
    cursor:not-allowed;
    transform:none;
    box-shadow:none;
  }

  @media (max-width: 1200px){
    .pos-stats{grid-template-columns:repeat(2,minmax(0,1fr));}
    .pos-grid{
      grid-template-columns:1fr;
      height:auto;
      min-height:0;
    }
    .pos-panel{
      min-height:420px;
      max-height:70dvh;
    }
  }

  @media (max-width: 700px){
    .pos-title{font-size:34px;}
    .pos-actions{width:100%;}
    .pos-field,
    .pos-field-small,
    .pos-inline-field{width:100%; min-width:0;}
    .pos-stats{grid-template-columns:1fr;}
    .pos-order-meta,
    .pos-detail-grid{grid-template-columns:1fr;}
  }
`;

export default function POSView({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  statusOptions,
  handleRefresh,
  refreshing,
  error,
  success,
  stats,
  loading,
  filteredOrders,
  selectedId,
  setSelectedId,
  detailLoading,
  selectedDetail,
  nextStatus,
  setNextStatus,
  handleChangeStatus,
  actionLoading,
  paymentMethods,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  handleMarkPaid,
}) {
  return (
    <>
      <style>{POS_STYLES}</style>

      <div className="pos-shell">
        <section className="pos-head">
          <div>
            <h1 className="pos-title">Punto de Venta</h1>
            <p className="pos-subtitle">
              Revisa pedidos, consulta detalle, cambia estados y registra pagos.
            </p>
            <div
              style={{
                marginTop: 14,
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 999,
                background: "#fff",
                border: "1px solid #e5e7eb",
                color: "#475569",
                fontSize: 13,
                fontWeight: 800,
                boxShadow: "0 8px 18px rgba(15,23,42,.04)",
              }}
            >
              Vista optimizada para presentar pedidos activos y cobro sin
              saturar la pantalla.
            </div>
          </div>

          <div className="pos-actions">
            <input
              className="pos-input"
              type="text"
              placeholder="Buscar por folio, id o cliente"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="pos-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="TODOS">Todos</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="pos-btn"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw size={18} />
              {refreshing ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </section>

        {error ? (
          <div className="pos-message pos-message-error">{error}</div>
        ) : null}
        {success ? (
          <div className="pos-message pos-message-success">{success}</div>
        ) : null}

        <section className="pos-stats">
          <div className="pos-stat">
            <div className="pos-stat-label">Total pedidos</div>
            <div className="pos-stat-value">{stats.total}</div>
          </div>

          <div className="pos-stat">
            <div className="pos-stat-label">Pendientes</div>
            <div className="pos-stat-value">{stats.pending}</div>
          </div>

          <div className="pos-stat">
            <div className="pos-stat-label">En preparación</div>
            <div className="pos-stat-value">{stats.preparing}</div>
          </div>

          <div className="pos-stat">
            <div className="pos-stat-label">Ventas cobradas</div>
            <div className="pos-stat-value">{money(stats.totalSales)}</div>
          </div>
        </section>

        <section className="pos-grid">
          <div className="pos-panel">
            <h2 className="pos-panel-title">Pedidos</h2>

            {loading ? (
              <div className="pos-empty">Cargando pedidos...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="pos-empty">
                No se encontraron pedidos para mostrar.
              </div>
            ) : (
              <div className="pos-list">
                {filteredOrders.map((order) => {
                  const badge = statusColor(order.estatus);

                  return (
                    <article
                      key={order.id}
                      className={`pos-order ${
                        String(selectedId) === String(order.id)
                          ? "pos-order-active"
                          : ""
                      }`}
                      onClick={() => setSelectedId(order.id)}
                    >
                      <div className="pos-order-top">
                        <div>
                          <div className="pos-order-id">#{order.folio}</div>
                          <div
                            style={{
                              marginTop: 8,
                              color: "#64748b",
                              fontWeight: 700,
                              fontSize: 14,
                            }}
                          >
                            {formatDate(order.createdAt)}
                          </div>
                        </div>

                        <span
                          className="pos-badge"
                          style={{
                            background: badge.bg,
                            color: badge.color,
                          }}
                        >
                          {order.estatus.replaceAll("_", " ")}
                        </span>
                      </div>

                      <div className="pos-order-meta">
                        <div>
                          <div className="pos-meta-label">Cliente</div>
                          <div className="pos-meta-value">{order.cliente}</div>
                        </div>

                        <div>
                          <div className="pos-meta-label">Total</div>
                          <div className="pos-meta-value">
                            {money(order.total)}
                          </div>
                        </div>

                        <div>
                          <div className="pos-meta-label">Tipo</div>
                          <div className="pos-meta-value">{order.tipo}</div>
                        </div>

                        <div>
                          <div className="pos-meta-label">Pago</div>
                          <div className="pos-meta-value">
                            {order.pagoEstatus}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pos-panel">
            <h2 className="pos-panel-title">Detalle del pedido</h2>

            {!selectedId ? (
              <div className="pos-empty">
                Selecciona un pedido para ver su detalle.
              </div>
            ) : detailLoading ? (
              <div className="pos-empty">Cargando detalle...</div>
            ) : !selectedDetail ? (
              <div className="pos-empty">
                No se pudo cargar el detalle del pedido.
              </div>
            ) : (
              <div className="pos-detail-scroll">
                <section className="pos-section">
                  <h3 className="pos-section-title">Resumen</h3>

                  <div className="pos-detail-grid">
                    <div>
                      <div className="pos-meta-label">Folio</div>
                      <div className="pos-meta-value">
                        #{selectedDetail.folio}
                      </div>
                    </div>

                    <div>
                      <div className="pos-meta-label">Fecha</div>
                      <div className="pos-meta-value">
                        {formatDate(selectedDetail.createdAt)}
                      </div>
                    </div>

                    <div>
                      <div className="pos-meta-label">Cliente</div>
                      <div className="pos-meta-value">
                        {selectedDetail.cliente}
                      </div>
                    </div>

                    <div>
                      <div className="pos-meta-label">Tipo</div>
                      <div className="pos-meta-value">
                        {selectedDetail.tipo}
                      </div>
                    </div>

                    <div>
                      <div className="pos-meta-label">Estado</div>
                      <div className="pos-meta-value">
                        {selectedDetail.estatus}
                      </div>
                    </div>

                    <div>
                      <div className="pos-meta-label">Pago</div>
                      <div className="pos-meta-value">
                        {selectedDetail.pagoEstatus}
                      </div>
                    </div>

                    <div>
                      <div className="pos-meta-label">Total</div>
                      <div className="pos-meta-value">
                        {money(selectedDetail.total)}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="pos-section">
                  <h3 className="pos-section-title">Productos</h3>

                  {!Array.isArray(selectedDetail.items) ||
                  selectedDetail.items.length === 0 ? (
                    <div style={{ color: "#64748b", fontWeight: 800 }}>
                      Este pedido no tiene productos visibles en el detalle.
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: 12 }}>
                      {selectedDetail.items.map((item) => (
                        <div key={item.id} className="pos-item">
                          <div className="pos-item-name">{item.nombre}</div>
                          <div className="pos-item-meta">
                            Cantidad: {item.cantidad} · Precio: {" "}
                            {money(item.precio)}
                            {item.tamanio ? ` · Tamaño: ${item.tamanio}` : ""}
                          </div>

                          {Array.isArray(item.extras) &&
                          item.extras.length > 0 ? (
                            <div
                              style={{
                                marginTop: 8,
                                color: "#64748b",
                                fontSize: 13,
                                fontWeight: 700,
                              }}
                            >
                              Extras: {" "}
                              {item.extras
                                .map(
                                  (extra) =>
                                    extra?.nombre || extra?.descripcion,
                                )
                                .filter(Boolean)
                                .join(", ")}
                            </div>
                          ) : null}

                          <div className="pos-item-total">
                            Total: {" "}
                            {money(item.total || item.precio * item.cantidad)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="pos-section">
                  <h3 className="pos-section-title">Actualizar estado</h3>

                  <div className="pos-inline-actions">
                    <div className="pos-inline-field">
                      <Select
                        value={nextStatus}
                        onChange={(e) => setNextStatus(e.target.value)}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status.replaceAll("_", " ")}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <Button
                      variant="secondary"
                      onClick={handleChangeStatus}
                      disabled={actionLoading === "status"}
                    >
                      <ShoppingBag size={18} />
                      {actionLoading === "status"
                        ? "Guardando..."
                        : "Actualizar estado"}
                    </Button>
                  </div>
                </section>

                <section className="pos-section">
                  <h3 className="pos-section-title">Cobro</h3>

                  <div className="pos-inline-actions">
                    <div className="pos-inline-field">
                      <Select
                        value={selectedPaymentMethod}
                        onChange={(e) =>
                          setSelectedPaymentMethod(e.target.value)
                        }
                      >
                        <option value="">Selecciona método de pago</option>
                        {paymentMethods.map((method) => (
                          <option key={method.id} value={method.id}>
                            {method.nombre ||
                              method.descripcion ||
                              `Método ${method.id}`}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <Button
                      variant="danger"
                      onClick={handleMarkPaid}
                      disabled={
                        actionLoading === "pay" ||
                        selectedDetail.pagoEstatus === "PAGADO"
                      }
                    >
                      <CircleDollarSign size={18} />
                      {selectedDetail.pagoEstatus === "PAGADO"
                        ? "Ya pagado"
                        : actionLoading === "pay"
                          ? "Registrando..."
                          : "Cobrar pedido"}
                    </Button>
                  </div>
                </section>

                <section className="pos-section">
                  <h3 className="pos-section-title">Acceso rápido</h3>

                  <div className="pos-detail-grid">
                    <div className="pos-item">
                      <div
                        className="pos-item-name"
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <User size={18} /> Cliente
                      </div>
                      <div className="pos-item-total">
                        {normalizeText(selectedDetail.cliente)}
                      </div>
                    </div>

                    <div className="pos-item">
                      <div
                        className="pos-item-name"
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <Receipt size={18} /> Folio
                      </div>
                      <div className="pos-item-total">
                        #{normalizeText(selectedDetail.folio)}
                      </div>
                    </div>

                    <div className="pos-item">
                      <div
                        className="pos-item-name"
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <CreditCard size={18} /> Estado de pago
                      </div>
                      <div className="pos-item-total">
                        {normalizeText(selectedDetail.pagoEstatus)}
                      </div>
                    </div>

                    <div className="pos-item">
                      <div
                        className="pos-item-name"
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <CircleDollarSign size={18} /> Total
                      </div>
                      <div className="pos-item-total">
                        {money(selectedDetail.total)}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
