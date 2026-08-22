import PageHeader from "../../components/common/PageHeader.jsx";
import StatCard from "../../components/common/StatCard.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Loader from "../../components/ui/Loader.jsx";
import Button from "../../components/ui/Button.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../components/ui/ToastProvider.jsx";
import { useAdminReportes } from "../../hooks/admin/useAdminReportes.js";
import {
  downloadCsv,
  formatCurrency,
  formatPercent,
  getSummaryCards,
  safeArray,
  toCsvRowsClientes,
  toCsvRowsProductos,
  toCsvRowsVentas,
  toNumber,
} from "../../utils/adminReportes.utils.js";

const cardStyle = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 22,
  padding: 18,
  boxShadow: "0 14px 30px rgba(15,23,42,.06)",
  minWidth: 0,
  maxWidth: "100%",
  overflow: "hidden",
};

const inputStyle = {
  width: "100%",
  border: "1px solid #d1d5db",
  borderRadius: 14,
  padding: "10px 12px",
  fontWeight: 800,
  outline: "none",
  background: "#fff",
  minWidth: 0,
};

function getValue(row, keys = []) {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return 0;
}

function renderCellValue(col, row, index) {
  return col.render ? col.render(row, index) : row[col.key];
}

function HorizontalBars({
  rows = [],
  labelKeys = [],
  valueKeys = [],
  format = (v) => v,
}) {
  const normalized = safeArray(rows).map((row, index) => ({
    key: row.id || row.producto_id || `${index}`,
    label: getValue(row, labelKeys) || `Fila ${index + 1}`,
    value: toNumber(getValue(row, valueKeys)),
    row,
  }));

  const max = Math.max(...normalized.map((row) => row.value), 1);

  if (!normalized.length) {
    return (
      <EmptyState
        icon="📊"
        title="Sin datos"
        description="No hay información suficiente para este periodo."
      />
    );
  }

  return (
    <div
      className="reports-bars"
      style={{ display: "grid", gap: 13, minWidth: 0 }}
    >
      {normalized.map((item) => {
        const width = `${Math.min(100, Math.max(7, (item.value / max) * 100))}%`;

        return (
          <div
            key={item.key}
            className="reports-bar-item"
            style={{ display: "grid", gap: 6, minWidth: 0 }}
          >
            <div
              className="reports-bar-head"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                minWidth: 0,
              }}
            >
              <strong
                className="reports-bar-label"
                style={{
                  color: "#111827",
                  minWidth: 0,
                  overflowWrap: "anywhere",
                }}
              >
                {item.label}
              </strong>
              <span
                className="reports-bar-value"
                style={{
                  color: "#64748b",
                  fontWeight: 900,
                  whiteSpace: "nowrap",
                }}
              >
                {format(item.value)}
              </span>
            </div>
            <div
              style={{
                height: 11,
                borderRadius: 999,
                background: "#f1f5f9",
                overflow: "hidden",
                width: "100%",
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width,
                  height: "100%",
                  borderRadius: 999,
                  background: "linear-gradient(90deg, #e50914, #f97316)",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MiniLineChart({ rows = [] }) {
  const normalized = safeArray(rows).map((row, index) => ({
    index,
    label: row.periodo || row.label || row.fecha || `Día ${index + 1}`,
    value: toNumber(row.ventas || row.total || row.monto),
    pedidos: toNumber(row.pedidos),
  }));

  const max = Math.max(...normalized.map((row) => row.value), 1);

  if (!normalized.length) {
    return (
      <EmptyState
        icon="📆"
        title="Sin ventas"
        description="No hay ventas registradas para el rango seleccionado."
      />
    );
  }

  return (
    <div
      className="reports-chart-wrap"
      style={{
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        paddingBottom: 4,
      }}
    >
      <div
        className="reports-chart-inner"
        style={{
          width: "100%",
          minWidth: 0,
          display: "grid",
          gridTemplateColumns: `repeat(${normalized.length}, minmax(0, 1fr))`,
          alignItems: "end",
          gap: 10,
          height: 250,
          padding: "12px 0 0",
        }}
      >
        {normalized.map((row) => {
          const height = `${Math.max(8, (row.value / max) * 190)}px`;
          return (
            <div
              key={`${row.label}-${row.index}`}
              title={`${row.label}: ${formatCurrency(row.value)} · ${row.pedidos} pedidos`}
              style={{
                minWidth: 0,
                display: "grid",
                alignItems: "end",
                gap: 8,
              }}
            >
              <div
                style={{
                  height,
                  minWidth: 0,
                  borderRadius: "16px 16px 8px 8px",
                  background: "linear-gradient(180deg, #ef4444, #991b1b)",
                  boxShadow: "0 10px 20px rgba(229,9,20,.18)",
                }}
              />
              <small
                style={{
                  color: "#64748b",
                  fontWeight: 800,
                  textAlign: "center",
                  fontSize: 11,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {String(row.label).slice(5)}
              </small>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DataTable({ rows = [], columns = [], emptyTitle = "Sin datos" }) {
  const list = safeArray(rows);

  if (!list.length) {
    return (
      <EmptyState
        icon="📋"
        title={emptyTitle}
        description="No hay registros para mostrar con los filtros actuales."
      />
    );
  }

  return (
    <div className="reports-data" style={{ minWidth: 0, maxWidth: "100%" }}>
      <div
        className="reports-table-wrap reports-desktop-table"
        style={{ overflowX: "auto", maxWidth: "100%" }}
      >
        <table
          style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}
        >
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    textAlign: col.align || "left",
                    padding: "12px 10px",
                    fontSize: 12,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: ".04em",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((row, index) => (
              <tr key={row.id || row.producto_id || index}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      textAlign: col.align || "left",
                      padding: "12px 10px",
                      borderBottom: "1px solid #f1f5f9",
                      fontWeight: col.bold ? 900 : 700,
                      color: col.color || "#111827",
                    }}
                  >
                    {renderCellValue(col, row, index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="reports-mobile-cards" style={{ display: "none" }}>
        {list.map((row, index) => {
          const firstColumn = columns[0];
          const restColumns = columns.slice(1);

          return (
            <article
              key={row.id || row.producto_id || index}
              className="reports-mobile-row"
            >
              <div className="reports-mobile-row-title">
                {firstColumn
                  ? renderCellValue(firstColumn, row, index)
                  : `Registro ${index + 1}`}
              </div>

              {restColumns.map((col) => (
                <div key={col.key} className="reports-mobile-row-line">
                  <span>{col.label}</span>
                  <strong>{renderCellValue(col, row, index)}</strong>
                </div>
              ))}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Filters({ filters, setFilters, reload }) {
  const update = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return (
    <section className="reports-filter-card reports-card" style={cardStyle}>
      <div
        className="reports-filter"
        style={{
          display: "grid",
          gridTemplateColumns:
            "var(--adm-report-filter-grid, repeat(4, minmax(0, 1fr)) auto)",
          gap: 12,
          alignItems: "end",
          minWidth: 0,
        }}
      >
        <label style={{ display: "grid", gap: 6, minWidth: 0 }}>
          <span style={{ fontWeight: 900, color: "#374151" }}>Desde</span>
          <input
            type="date"
            value={filters.from || ""}
            onChange={(event) => update("from", event.target.value)}
            style={inputStyle}
          />
        </label>

        <label style={{ display: "grid", gap: 6, minWidth: 0 }}>
          <span style={{ fontWeight: 900, color: "#374151" }}>Hasta</span>
          <input
            type="date"
            value={filters.to || ""}
            onChange={(event) => update("to", event.target.value)}
            style={inputStyle}
          />
        </label>

        <label style={{ display: "grid", gap: 6, minWidth: 0 }}>
          <span style={{ fontWeight: 900, color: "#374151" }}>
            Agrupar ventas
          </span>
          <select
            value={filters.groupBy || "day"}
            onChange={(event) => update("groupBy", event.target.value)}
            style={inputStyle}
          >
            <option value="day">Por día</option>
            <option value="week">Por semana</option>
            <option value="month">Por mes</option>
          </select>
        </label>

        <div
          className="reports-range-chip"
          style={{
            padding: "12px 14px",
            borderRadius: 16,
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            fontWeight: 900,
            color: "#9a3412",
            minWidth: 0,
          }}
        >
          Rango activo: {filters.from || "-"} / {filters.to || "-"}
        </div>

        <Button className="reports-filter-btn" onClick={reload}>
          Actualizar
        </Button>
      </div>
    </section>
  );
}

export default function AdminReportes() {
  const { token } = useAuth();
  const toast = useToast();
  const vm = useAdminReportes(token);

  const exportSales = () => {
    const ok = downloadCsv(
      "reporte_ventas.csv",
      toCsvRowsVentas(vm.data?.dias),
    );
    ok
      ? toast.success("Reporte de ventas exportado")
      : toast.error("No hay ventas para exportar");
  };

  const exportProducts = () => {
    const ok = downloadCsv(
      "reporte_productos.csv",
      toCsvRowsProductos(vm.data?.productos),
    );
    ok
      ? toast.success("Reporte de productos exportado")
      : toast.error("No hay productos para exportar");
  };

  const exportClients = () => {
    const ok = downloadCsv(
      "reporte_clientes.csv",
      toCsvRowsClientes(vm.data?.clientes),
    );
    ok
      ? toast.success("Reporte de clientes exportado")
      : toast.error("No hay clientes para exportar");
  };

  const summaryCards = getSummaryCards(vm.totals);

  return (
    <div
      className="admin-reportes-page"
      style={{
        display: "grid",
        gap: 20,
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <style>{`
        .admin-reportes-page,
        .admin-reportes-page * {
          box-sizing: border-box;
        }

        .admin-reportes-page {
          contain: layout paint;
        }

        .reports-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: flex-end;
          align-items: center;
          width: 100%;
          min-width: 0;
        }

        .reports-card,
        .reports-grid-2,
        .reports-grid-2 > *,
        .reports-stats,
        .reports-filter,
        .reports-table-wrap,
        .reports-chart-wrap,
        .reports-chart-inner {
          min-width: 0;
          max-width: 100%;
        }

        .reports-table-wrap {
          -webkit-overflow-scrolling: touch;
        }

        .reports-range-chip,
        .reports-mobile-row,
        .reports-mobile-row-title,
        .reports-mobile-row-line,
        .reports-mobile-row-line strong {
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .reports-mobile-row-title > div,
        .reports-mobile-row-title small {
          max-width: 100%;
          overflow-wrap: anywhere;
        }

        @media (max-width: 1100px) {
          .reports-grid-2 {
            grid-template-columns: 1fr !important;
          }

          .reports-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 760px) {
          .admin-reportes-page {
            gap: 16px !important;
            overflow: hidden;
          }

          .reports-card {
            padding: 16px !important;
            border-radius: 20px !important;
          }

          .reports-stats,
          .reports-filter {
            grid-template-columns: 1fr !important;
          }

          .reports-actions {
            display: grid !important;
            grid-template-columns: 1fr;
            justify-content: stretch;
          }

          .reports-action-btn,
          .reports-filter-btn,
          .reports-actions button,
          .reports-filter button {
            width: 100% !important;
            max-width: 100% !important;
          }

          .reports-chart-inner {
            height: 220px !important;
            gap: 8px !important;
          }

          .reports-desktop-table {
            display: none !important;
          }

          .reports-mobile-cards {
            display: grid !important;
            gap: 10px;
          }

          .reports-mobile-row {
            display: grid;
            gap: 10px;
            padding: 12px;
            border: 1px solid #f1f5f9;
            border-radius: 16px;
            background: #fff;
          }

          .reports-mobile-row-title {
            color: #111827;
            font-weight: 950;
            min-width: 0;
          }

          .reports-mobile-row-title small {
            display: block;
            color: #64748b;
            margin-top: 3px;
          }

          .reports-mobile-row-line {
            display: grid;
            grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr);
            gap: 10px;
            align-items: start;
            padding-top: 8px;
            border-top: 1px dashed #e5e7eb;
            min-width: 0;
          }

          .reports-mobile-row-line span {
            color: #64748b;
            font-size: 12px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: .035em;
          }

          .reports-mobile-row-line strong {
            color: #111827;
            font-size: 13px;
            text-align: right;
            min-width: 0;
          }
        }

        @media (max-width: 520px) {
          .reports-bar-head {
            display: grid !important;
            grid-template-columns: 1fr auto;
            align-items: start !important;
            gap: 8px !important;
          }

          .reports-bar-label {
            font-size: 14px;
            line-height: 1.25;
          }

          .reports-bar-value {
            font-size: 13px;
          }

          .reports-section-title-row {
            display: grid !important;
            grid-template-columns: 1fr;
            align-items: start !important;
          }
        }

        @media (max-width: 430px) {
          .reports-card,
          .reports-filter-card {
            padding: 14px !important;
          }

          .reports-chart-inner {
            height: 205px !important;
            gap: 7px !important;
          }

          .reports-mobile-row-line {
            grid-template-columns: 1fr;
          }

          .reports-mobile-row-line strong {
            text-align: left;
          }
        }
      `}</style>

      <PageHeader
        title="Reportes"
        subtitle="Consulta ventas, productos más vendidos, clientes, métodos de pago, horarios con más pedidos y exportaciones CSV."
        actions={
          <div className="reports-actions">
            <Button
              className="reports-action-btn"
              variant="secondary"
              onClick={exportSales}
            >
              Exportar ventas
            </Button>
            <Button
              className="reports-action-btn"
              variant="secondary"
              onClick={exportProducts}
            >
              Exportar productos
            </Button>
            <Button className="reports-action-btn" onClick={exportClients}>
              Exportar clientes
            </Button>
          </div>
        }
      />

      <Filters
        filters={vm.filters}
        setFilters={vm.setFilters}
        reload={vm.reload}
      />

      {vm.loading ? <Loader text="Cargando reportes..." /> : null}

      {!vm.loading && vm.error ? (
        <EmptyState
          icon="📉"
          title="No se pudieron cargar los reportes"
          description={vm.error}
          actionLabel="Reintentar"
          onAction={vm.reload}
        />
      ) : null}

      {!vm.loading && !vm.error && vm.data ? (
        <>
          <section
            className="reports-stats"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 210px), 1fr))",
              gap: 16,
              minWidth: 0,
            }}
          >
            {summaryCards.map((card) => (
              <StatCard
                key={card.key}
                title={card.label}
                value={card.value}
                icon={card.icon}
                variant={card.variant}
              />
            ))}
          </section>

          <section
            className="reports-grid-2"
            style={{
              display: "grid",
              gridTemplateColumns: "var(--adm-grid-two)",
              gap: 18,
              minWidth: 0,
            }}
          >
            <div className="reports-card" style={cardStyle}>
              <div
                className="reports-section-title-row"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 16,
                  minWidth: 0,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: 22, fontWeight: 950 }}>
                    Ventas por periodo
                  </h3>
                  <p
                    style={{
                      margin: "4px 0 0",
                      color: "#64748b",
                      fontWeight: 700,
                    }}
                  >
                    Total del rango: {formatCurrency(vm.totals.ventasTotal)}
                  </p>
                </div>
                <strong style={{ color: "#16a34a", whiteSpace: "nowrap" }}>
                  {formatPercent(vm.totals.crecimiento)}
                </strong>
              </div>
              <MiniLineChart rows={vm.data.dias} />
            </div>

            <div style={{ display: "grid", gap: 18, minWidth: 0 }}>
              <div className="reports-card" style={cardStyle}>
                <h3
                  style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 950 }}
                >
                  Métodos de pago
                </h3>
                <HorizontalBars
                  rows={vm.data.metodos}
                  labelKeys={["nombre", "metodo", "label"]}
                  valueKeys={["total", "ventas", "monto"]}
                  format={formatCurrency}
                />
              </div>

              <div className="reports-card" style={cardStyle}>
                <h3
                  style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 950 }}
                >
                  Horas pico
                </h3>
                <HorizontalBars
                  rows={vm.data.horas}
                  labelKeys={["label", "hora"]}
                  valueKeys={["pedidos", "cantidad", "total"]}
                  format={(value) => `${value} pedidos`}
                />
              </div>
            </div>
          </section>

          <section
            className="reports-grid-2"
            style={{
              display: "grid",
              gridTemplateColumns: "var(--adm-grid-two-even)",
              gap: 18,
              minWidth: 0,
            }}
          >
            <div className="reports-card" style={cardStyle}>
              <h3 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 950 }}>
                Top productos
              </h3>
              <DataTable
                rows={safeArray(vm.data.productos)}
                emptyTitle="Sin productos vendidos"
                columns={[
                  {
                    key: "nombre",
                    label: "Producto",
                    bold: true,
                    render: (row) => (
                      <div>
                        <div>{row.nombre || row.label || "Producto"}</div>
                        {row.tamanio ? (
                          <small style={{ color: "#64748b" }}>
                            {row.tamanio}
                          </small>
                        ) : null}
                      </div>
                    ),
                  },
                  {
                    key: "cantidad",
                    label: "Vendidos",
                    align: "right",
                    render: (row) => toNumber(row.cantidad || row.total),
                  },
                  {
                    key: "ingresos",
                    label: "Ingresos",
                    align: "right",
                    render: (row) =>
                      formatCurrency(
                        row.ingresos || row.totalVendido || row.total_vendido,
                      ),
                  },
                ]}
              />
            </div>

            <div className="reports-card" style={cardStyle}>
              <h3 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 950 }}>
                Top clientes
              </h3>
              <DataTable
                rows={safeArray(vm.data.clientes)}
                emptyTitle="Sin clientes"
                columns={[
                  {
                    key: "nombre",
                    label: "Cliente",
                    bold: true,
                    render: (row) => (
                      <div>
                        <div>{row.nombre || "Cliente"}</div>
                        <small style={{ color: "#64748b" }}>
                          {row.email || row.telefono || ""}
                        </small>
                      </div>
                    ),
                  },
                  {
                    key: "pedidos",
                    label: "Pedidos",
                    align: "right",
                    render: (row) =>
                      toNumber(row.totalPedidos || row.total_pedidos),
                  },
                  {
                    key: "total",
                    label: "Gastado",
                    align: "right",
                    render: (row) =>
                      formatCurrency(row.totalGastado || row.total_gastado),
                  },
                ]}
              />
            </div>
          </section>

          <section
            className="reports-grid-2"
            style={{
              display: "grid",
              gridTemplateColumns: "var(--adm-grid-two-even)",
              gap: 18,
              minWidth: 0,
            }}
          >
            <div className="reports-card" style={cardStyle}>
              <h3 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 950 }}>
                Pedidos por estado
              </h3>
              <HorizontalBars
                rows={vm.data.estatus}
                labelKeys={["estatus", "label"]}
                valueKeys={["pedidos", "cantidad"]}
                format={(value) => `${value} pedidos`}
              />
            </div>

            <div className="reports-card" style={cardStyle}>
              <h3 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 950 }}>
                Tipo de pedido
              </h3>
              <HorizontalBars
                rows={vm.data.tiposPedido}
                labelKeys={["tipo_pedido", "nombre", "label"]}
                valueKeys={["pedidos", "cantidad"]}
                format={(value) => `${value} pedidos`}
              />
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
