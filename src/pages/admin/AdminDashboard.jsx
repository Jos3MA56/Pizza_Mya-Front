import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Loader from "../../components/ui/Loader.jsx";
import Select from "../../components/ui/Select.jsx";
import { useAdminDashboard } from "../../hooks/admin/useAdminDashboard.js";
import {
  formatDate,
  formatMoney,
  getStatusConfig,
} from "../../utils/adminDashboard.utils.js";
import AdminButton from "../../components/admin/ui/AdminButton.jsx";
import AdminMetricCard from "../../components/admin/ui/AdminMetricCard.jsx";
import AdminPageHeader from "../../components/admin/ui/AdminPageHeader.jsx";
import AdminPanel from "../../components/admin/ui/AdminPanel.jsx";
import {
  DonutChart,
  LineAreaChart,
  RankedList,
} from "../../components/admin/charts/AdminCharts.jsx";
import {
  adminTheme,
  softPanelStyle,
  statusToneFromText,
  subtleBadgeStyle,
} from "../../components/admin/ui/adminTheme.js";

function QuickAccess({ items = [], onNavigate }) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {items.map((item) => (
        <button
          key={item.path}
          type="button"
          onClick={() => onNavigate(item.path)}
          style={{
            ...softPanelStyle({
              padding: 14,
              background: "#fff",
              textAlign: "left",
              cursor: "pointer",
            }),
          }}
        >
          <div style={{ color: adminTheme.colors.text, fontWeight: 900 }}>
            {item.label}
          </div>
          <div
            style={{
              marginTop: 6,
              color: adminTheme.colors.textSoft,
              fontSize: 13,
              lineHeight: 1.5,
              fontWeight: 600,
            }}
          >
            {item.hint}
          </div>
        </button>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const {
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
    recentActivity,
    alerts,
    exportPedidos,
  } = useAdminDashboard(token);

  const totals = useMemo(() => {
    const ventas = ventasSerie.reduce(
      (acc, item) => acc + Number(item?.total || 0),
      0,
    );
    const pedidos = ventasSerie.reduce(
      (acc, item) => acc + Number(item?.pedidos || 0),
      0,
    );
    return {
      ventas,
      pedidos,
      ticket: pedidos ? ventas / pedidos : 0,
      activas: (stats?.pendientes || 0) + Number(stats?.enEntrega || 0),
    };
  }, [stats, ventasSerie]);

  const summaryCards = [
    {
      title: range === "today" ? "Ventas de hoy" : "Ventas del periodo",
      value: formatMoney(totals.ventas),
      helper: `${totals.pedidos} pedido(s) dentro del rango`,
      icon: "$",
      tone: "primary",
    },
    {
      title: "Ticket promedio",
      value: formatMoney(totals.ticket),
      helper: "Promedio de compra del rango activo",
      icon: "◎",
      tone: "accent",
    },
    {
      title: "Pedidos activos",
      value: totals.activas,
      helper: `${stats?.pendientes || 0} pendientes y ${stats?.enEntrega || 0} en entrega`,
      icon: "↺",
      tone: "info",
    },
    {
      title: "Alertas operativas",
      value: alerts.length,
      helper: `${stats?.noDisponibles || 0} productos sin disponibilidad`,
      icon: "!",
      tone: alerts.some((item) =>
        /atras|alerta|cr[ií]tic/i.test(item?.title || ""),
      )
        ? "accent"
        : "success",
    },
  ];

  if (loading) {
    return <Loader text="Cargando dashboard administrativo..." />;
  }

  if (error) {
    return (
      <EmptyState
        icon="📉"
        title="No se pudo cargar el dashboard"
        description={error}
        actionLabel="Reintentar"
        onAction={() => load()}
        tone="danger"
      />
    );
  }

  return (
    <>
      <style>{`
        .admin-dashboard-grid { display: grid; gap: 18px; }
        .admin-dashboard-kpis {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }
        .admin-dashboard-2 {
          display: grid;
          grid-template-columns: 1.2fr .8fr;
          gap: 18px;
        }
        .admin-dashboard-3 {
          display: grid;
          grid-template-columns: 1fr 1fr .85fr;
          gap: 18px;
        }
        .admin-activity-list {
          display: grid;
          gap: 10px;
          max-height: 420px;
          overflow: auto;
          padding-right: 4px;
        }
        .admin-activity-list::-webkit-scrollbar { width: 8px; }
        .admin-activity-list::-webkit-scrollbar-thumb {
          background: ${adminTheme.colors.borderStrong};
          border-radius: 999px;
        }
        @media (max-width: 1120px) {
          .admin-dashboard-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .admin-dashboard-2,
          .admin-dashboard-3 { grid-template-columns: 1fr; }
        }
        @media (max-width: 680px) {
          .admin-dashboard-kpis { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="admin-dashboard-grid">
        <AdminPageHeader
          eyebrow="Resumen ejecutivo"
          title="Dashboard de administración"
          subtitle={`Última actualización: ${formatDate(updatedAt, { dateStyle: "medium", timeStyle: "short" })}.`}
          actions={
            <>
              <Select
                value={range}
                onChange={(event) => setRange(event.target.value)}
                options={[
                  { value: "today", label: "Hoy" },
                  { value: "7d", label: "Últimos 7 días" },
                  { value: "30d", label: "Últimos 30 días" },
                ]}
              />
              <AdminButton variant="secondary" onClick={exportPedidos}>
                Exportar CSV
              </AdminButton>
              <AdminButton onClick={() => load(true)}>Actualizar</AdminButton>
            </>
          }
        />

        <section className="admin-dashboard-kpis">
          {summaryCards.map((card) => (
            <AdminMetricCard key={card.title} {...card} />
          ))}
        </section>

        <section className="admin-dashboard-2">
          <AdminPanel
            title="Tendencia de ventas"
            subtitle="Aquí va la historia del periodo seleccionado para que el admin vea si la operación sube, baja o se mantiene estable."
          >
            <LineAreaChart
              data={ventasSerie}
              valueKeys={["total"]}
              labelKeys={["label"]}
              valueFormatter={(value) => formatMoney(value)}
            />
          </AdminPanel>

          <AdminPanel
            title="Carga operativa"
            subtitle="Distribución actual por estado. Esto ayuda más que llenar la pantalla con tarjetas de colores."
          >
            <DonutChart
              data={statusBreakdown.filter(
                (item) => Number(item?.total || 0) > 0,
              )}
              valueKeys={["total"]}
              labelKeys={["label"]}
              centerLabel="Pedidos"
              centerValue={totals.pedidos}
              valueFormatter={(value) => `${value}`}
            />
          </AdminPanel>
        </section>

        <section className="admin-dashboard-3">
          <AdminPanel
            title="Productos que más mueven venta"
            subtitle="Top productos del rango activo."
          >
            <RankedList
              items={topProductos.map((item) => ({
                label: item.nombre,
                total: item.cantidad,
              }))}
              titleKey="label"
              valueKey="total"
              formatter={(value) => `${value} vendidos`}
            />
          </AdminPanel>

          <AdminPanel
            title="Clientes con mayor compra"
            subtitle="Sirve para detectar clientes frecuentes o tickets fuertes."
          >
            <RankedList
              items={topClientes.map((item) => ({
                label: item.nombre,
                total: item.total,
                pedidos: item.pedidos,
              }))}
              titleKey="label"
              valueKey="total"
              formatter={(value, item) =>
                `${formatMoney(value)} · ${item?.pedidos || 0} pedidos`
              }
            />
          </AdminPanel>

          <AdminPanel
            title="Acciones rápidas"
            subtitle="Atajos limpios para moverse dentro del admin."
          >
            <QuickAccess
              onNavigate={navigate}
              items={[
                {
                  label: "Revisar pedidos",
                  path: "/admin/orders",
                  hint: "Pendientes, preparando y en entrega",
                },
                {
                  label: "Ir a reportes",
                  path: "/admin/reportes",
                  hint: "Comparativas y exportación",
                },
                {
                  label: "Abrir monitoreo",
                  path: "/admin/monitoreo",
                  hint: "Latencia, rutas y tablas",
                },
                {
                  label: "Administrar galería",
                  path: "/admin/galeria",
                  hint: "Imágenes públicas del negocio",
                },
              ]}
            />
          </AdminPanel>
        </section>

        <section className="admin-dashboard-2">
          <AdminPanel
            title="Alertas del negocio"
            subtitle="Menos ruido visual y solo lo que merece atención."
          >
            <div style={{ display: "grid", gap: 10 }}>
              {(alerts || []).map((alert, index) => (
                <article
                  key={`${alert?.title}-${index}`}
                  style={{
                    ...softPanelStyle({
                      padding: 14,
                      background: "#fff",
                    }),
                  }}
                >
                  <div
                    style={subtleBadgeStyle(
                      statusToneFromText(
                        alert?.title || alert?.description || "",
                      ),
                    )}
                  >
                    {alert?.title || "Alerta"}
                  </div>
                  <p
                    style={{
                      margin: "10px 0 0",
                      color: adminTheme.colors.textSoft,
                      lineHeight: 1.55,
                      fontWeight: 600,
                    }}
                  >
                    {alert?.description}
                  </p>
                </article>
              ))}
            </div>
          </AdminPanel>

          <AdminPanel
            title="Actividad reciente"
            subtitle="Últimos movimientos del sistema con scroll interno para que la vista no se haga eterna."
          >
            {recentActivity.length ? (
              <div className="admin-activity-list">
                {recentActivity.map((item) => {
                  const status = getStatusConfig(item.status);
                  return (
                    <article
                      key={item.id}
                      style={{
                        ...softPanelStyle({
                          padding: 14,
                          background: "#fff",
                        }),
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          flexWrap: "wrap",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              color: adminTheme.colors.text,
                              fontWeight: 900,
                            }}
                          >
                            {item.title}
                          </div>
                          <div
                            style={{
                              marginTop: 6,
                              color: adminTheme.colors.textSoft,
                              fontWeight: 600,
                            }}
                          >
                            {item.subtitle}
                          </div>
                          <div
                            style={{
                              marginTop: 8,
                              color: adminTheme.colors.textMuted,
                              fontSize: 12,
                            }}
                          >
                            {formatDate(item.at, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div
                            style={subtleBadgeStyle(
                              statusToneFromText(status.label),
                            )}
                          >
                            {status.label}
                          </div>
                          <div
                            style={{
                              marginTop: 10,
                              color: adminTheme.colors.text,
                              fontWeight: 900,
                            }}
                          >
                            {formatMoney(item.amount)}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon="🧾"
                title="Sin actividad reciente"
                description="Aún no hay movimientos para mostrar en el resumen del dashboard."
              />
            )}
          </AdminPanel>
        </section>
      </div>
    </>
  );
}
