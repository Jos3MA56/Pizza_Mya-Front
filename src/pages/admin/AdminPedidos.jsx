import ConfirmModal from "../../components/ui/ConfirmModal.jsx";
import Loader from "../../components/ui/Loader.jsx";
import AdminPedidoDetalleModal from "./admin-pedidos/AdminPedidoDetalleModal.jsx";
import AdminPedidosTable from "./admin-pedidos/AdminPedidosTable.jsx";
import AdminPedidosToolbar from "./admin-pedidos/AdminPedidosToolbar.jsx";
import { useAdminPedidos } from "./admin-pedidos/useAdminPedidos.js";
import AdminMetricCard from "../../components/admin/ui/AdminMetricCard.jsx";
import AdminPageHeader from "../../components/admin/ui/AdminPageHeader.jsx";
import AdminPanel from "../../components/admin/ui/AdminPanel.jsx";
import {
  DonutChart,
  VerticalBarChart,
} from "../../components/admin/charts/AdminCharts.jsx";
import { adminTheme } from "../../components/admin/ui/adminTheme.js";

function buildDailySeries(rows = []) {
  const map = new Map();

  rows.forEach((item) => {
    const value = item?.created_at || item?.created || item?.fecha;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return;
    }

    const key = date.toISOString().slice(0, 10);

    const current = map.get(key) || {
      label: date.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "short",
      }),
      total: 0,
    };

    current.total += 1;
    map.set(key, current);
  });

  return Array.from(map.values()).slice(-7);
}

export default function AdminPedidos() {
  const pedidos = useAdminPedidos();

  const cards = [
    {
      title: "Pedidos visibles",
      value: pedidos.filtered.length,
      helper: "Resultados bajo el filtro actual",
      icon: "≡",
      tone: "primary",
    },
    {
      title: "Pendientes",
      value: pedidos.stats.pendientes,
      helper: "Requieren atención inicial",
      icon: "!",
      tone: "accent",
    },
    {
      title: "Preparando",
      value: pedidos.stats.preparando,
      helper: "Actualmente en cocina",
      icon: "↺",
      tone: "info",
    },
    {
      title: "En entrega",
      value: pedidos.stats.enEntrega,
      helper: "Pedidos ya en ruta",
      icon: "→",
      tone: "success",
    },
  ];

  const statusChart = [
    {
      label: "Pendiente",
      total: pedidos.stats.pendientes,
    },
    {
      label: "Preparando",
      total: pedidos.stats.preparando,
    },
    {
      label: "En entrega",
      total: pedidos.stats.enEntrega,
    },
    {
      label: "Completado",
      total: pedidos.stats.completados,
    },
    {
      label: "Cancelado",
      total: pedidos.stats.cancelados,
    },
  ].filter((item) => item.total > 0);

  const dailySeries = buildDailySeries(pedidos.filtered);

  return (
    <>
      <style>{`
        .admin-pedidos-shell {
          display: grid;
          gap: 18px;
          width: 100%;
          min-width: 0;
        }

        .admin-pedidos-kpis {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .admin-pedidos-content {
          display: grid;
          gap: 0;
          min-width: 0;
          overflow: hidden;
          border: 1px solid
            rgba(148, 163, 184, 0.22);
          border-radius: 22px;
          background: #ffffff;
          box-shadow:
            0 12px 30px
            rgba(15, 23, 42, 0.05);
        }

        .admin-pedidos-toolbar-wrap {
          padding: 0;
          min-width: 0;
        }

        .admin-pedidos-toolbar-wrap > section {
          border: 0 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          border-bottom:
            1px solid rgba(148, 163, 184, 0.22)
            !important;
        }

        .admin-pedidos-messages {
          display: grid;
          gap: 10px;
          padding: 14px 18px 0;
        }

        .admin-pedidos-table-scroll {
          min-width: 0;
          max-height: 650px;
          overflow: auto;
          background: #ffffff;
        }

        .admin-pedidos-table-scroll > section {
          border: 0 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
        }

        .admin-pedidos-table-scroll::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        .admin-pedidos-table-scroll::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.7);
          border-radius: 999px;
        }

        .admin-pedidos-table-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .admin-pedidos-loader {
          min-height: 260px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px 18px;
        }

        .admin-pedidos-charts {
          display: grid;
          grid-template-columns:
            minmax(0, 0.9fr)
            minmax(0, 1.1fr);
          gap: 18px;
          align-items: start;
          min-width: 0;
        }

        @media (max-width: 1120px) {
          .admin-pedidos-kpis {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .admin-pedidos-charts {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 680px) {
          .admin-pedidos-shell {
            gap: 14px;
          }

          .admin-pedidos-kpis {
            grid-template-columns: 1fr;
          }

          .admin-pedidos-content {
            border-radius: 18px;
          }

          .admin-pedidos-table-scroll {
            max-height: 540px;
          }

          .admin-pedidos-messages {
            padding: 12px 12px 0;
          }
        }
      `}</style>

      <div className="admin-pedidos-shell">
        <AdminPageHeader
          eyebrow="Operación"
          title="Gestión de pedidos"
          subtitle="Consulta, filtra y administra los pedidos desde una sola sección."
        />

        <section className="admin-pedidos-kpis">
          {cards.map((card) => (
            <AdminMetricCard key={card.title} {...card} />
          ))}
        </section>

        <section className="admin-pedidos-content">
          <div className="admin-pedidos-toolbar-wrap">
            <AdminPedidosToolbar
              q={pedidos.q}
              setQ={pedidos.setQ}
              tab={pedidos.tab}
              setTab={pedidos.setTab}
              orden={pedidos.orden}
              setOrden={pedidos.setOrden}
              pageSize={pedidos.pageSize}
              setPageSize={pedidos.setPageSize}
              tabs={pedidos.tabs}
              selectedDate={pedidos.selectedDate}
setSelectedDate={pedidos.setSelectedDate}
              onRefresh={pedidos.load}
              onExport={pedidos.exportPedidos}
              loading={pedidos.loading && pedidos.items.length > 0}
            />
          </div>

          {pedidos.error || pedidos.success ? (
            <div className="admin-pedidos-messages">
              {pedidos.error ? (
                <div
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    background: "rgba(163, 60, 43, 0.12)",
                    color: adminTheme.colors.danger,
                    fontWeight: 700,
                  }}
                >
                  {pedidos.error}
                </div>
              ) : null}

              {pedidos.success ? (
                <div
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    background: "rgba(45, 108, 82, 0.12)",
                    color: adminTheme.colors.success,
                    fontWeight: 700,
                  }}
                >
                  {pedidos.success}
                </div>
              ) : null}
            </div>
          ) : null}

          {pedidos.loading && pedidos.items.length === 0 ? (
            <div className="admin-pedidos-loader">
              <Loader text="Cargando pedidos..." />
            </div>
          ) : (
            <div className="admin-pedidos-table-scroll">
              <AdminPedidosTable
                items={pedidos.paginated}
                page={pedidos.page}
                totalPages={pedidos.totalPages}
                setPage={pedidos.setPage}
                start={pedidos.start}
                end={pedidos.end}
                total={pedidos.filtered.length}
                onOpen={pedidos.openDetalle}
                onEnviar={pedidos.confirmEnviar}
                updatingId={pedidos.updatingId}
                riskByPedido={pedidos.riskByPedido}
                riskLoadingByPedido={pedidos.riskLoadingByPedido}
              />
            </div>
          )}
        </section>

        <section className="admin-pedidos-charts">
          <AdminPanel
            title="Estado de los pedidos"
            subtitle="Distribución actual según el filtro seleccionado."
          >
            <DonutChart
              data={statusChart}
              valueKeys={["total"]}
              labelKeys={["label"]}
              centerLabel="Filtrados"
              centerValue={pedidos.filtered.length}
              valueFormatter={(value) => `${value}`}
            />
          </AdminPanel>

          <AdminPanel
            title="Flujo de pedidos recientes"
            subtitle="Conteo de pedidos en los últimos días del conjunto filtrado."
          >
            <VerticalBarChart
              data={dailySeries}
              valueKeys={["total"]}
              labelKeys={["label"]}
              valueFormatter={(value) => `${value}`}
              color={adminTheme.colors.primary}
            />
          </AdminPanel>
        </section>

        <AdminPedidoDetalleModal
          open={pedidos.showDetalle}
          pedido={pedidos.selectedPedido}
          onClose={pedidos.closeDetalle}
        />

        <ConfirmModal
          open={Boolean(pedidos.confirmPedido)}
          onClose={pedidos.cancelConfirm}
          onConfirm={pedidos.marcarEnEntrega}
          title="Confirmar cambio de estado"
          message={`¿Deseas marcar el pedido ${
            pedidos.confirmPedido?.folio || ""
          } como EN ENTREGA?`}
          confirmText="Sí, enviar"
          confirmVariant="primary"
          loading={Boolean(pedidos.updatingId)}
          loadingText="Actualizando..."
        />
      </div>
    </>
  );
}
