import { useMemo } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useAdminMonitoring } from "../../hooks/admin/useAdminMonitoreo.js";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Loader from "../../components/ui/Loader.jsx";
import AdminButton from "../../components/admin/ui/AdminButton.jsx";
import AdminMetricCard from "../../components/admin/ui/AdminMetricCard.jsx";
import AdminPageHeader from "../../components/admin/ui/AdminPageHeader.jsx";
import AdminPanel from "../../components/admin/ui/AdminPanel.jsx";
import {
  DonutChart,
  RankedList,
  VerticalBarChart,
} from "../../components/admin/charts/AdminCharts.jsx";
import {
  adminTheme,
  softPanelStyle,
  statusToneFromText,
  subtleBadgeStyle,
} from "../../components/admin/ui/adminTheme.js";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatNumber(value) {
  return new Intl.NumberFormat("es-MX").format(Number(value || 0));
}

function formatMs(value) {
  return `${Number(value || 0).toFixed(2)} ms`;
}

function formatSeconds(value) {
  const total = Number(value || 0);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return `${h}h ${m}m`;
}

function moduleScore(item = {}) {
  const text = `${item?.status || ""} ${item?.detail || ""}`.toLowerCase();
  if (/(critical|error|down|fail)/.test(text)) return 25;
  if (/(warning|slow|degrad)/.test(text)) return 60;
  return 100;
}

function getSqlCount(summary = {}, type) {
  const keyMap = {
    SELECT: "select_count",
    INSERT: "insert_count",
    UPDATE: "update_count",
    DELETE: "delete_count",
  };

  return Number(summary?.[keyMap[type]] || 0);
}

function getSqlAvg(summary = {}, type) {
  return Number(summary?.avg_duration_ms || 0);
}

export default function AdminMonitoreo() {
  const { token } = useAuth();
  const { loading, error, data, load } = useAdminMonitoring(token);

  const connectedSummary = useMemo(() => {
    const items = data?.connected_users || [];
    const admins = items.filter((x) =>
      String(x?.rol || "")
        .toLowerCase()
        .includes("admin"),
    ).length;
    const cajeros = items.filter((x) =>
      String(x?.rol || "")
        .toLowerCase()
        .includes("cajero"),
    ).length;
    const clientes = items.filter((x) =>
      String(x?.rol || "")
        .toLowerCase()
        .includes("cliente"),
    ).length;

    return {
      total: items.length,
      admins,
      cajeros,
      clientes,
    };
  }, [data]);

  const summaryCards = [
    {
      title: "Latencia promedio",
      value: formatMs(data?.latency?.avg_latency_ms),
      helper: "Promedio general de respuesta",
      icon: "↻",
      tone: "info",
    },
    {
      title: "Usuarios conectados",
      value: formatNumber(connectedSummary.total),
      helper: `${connectedSummary.admins} admin · ${connectedSummary.cajeros} cajero · ${connectedSummary.clientes} cliente`,
      icon: "◉",
      tone: "accent",
    },
    {
      title: "Uso de base de datos",
      value: `${Number(data?.database_usage?.usage_percent || 0).toFixed(1)}%`,
      helper: `${data?.database_usage?.current_mb || 0} MB usados`,
      icon: "%",
      tone: "primary",
    },
    {
      title: "Uptime",
      value: formatSeconds(data?.server?.uptime_seconds),
      helper: "Tiempo activo del proceso",
      icon: "⌚",
      tone: "success",
    },
  ];

  const slowRoutes = useMemo(
    () =>
      (data?.slow_routes || []).map((item) => ({
        label: `${item?.method || "GET"} ${item?.route || "/"}`,
        total: Number(item?.avg_latency_ms || 0),
      })),
    [data],
  );

  const tables = useMemo(
    () =>
      (data?.tables || []).map((item) => ({
        label: item?.table_name || item?.name || "tabla",
        total: Number(
          item?.size_mb ??
            item?.total_mb ??
            item?.mb ??
            Number(item?.size_bytes || 0) / 1024 / 1024,
        ),
      })),
    [data],
  );

  const modules = useMemo(
    () =>
      (data?.module_health || []).map((item) => ({
        label: item?.module_name || item?.module || "módulo",
        total: moduleScore(item),
        avgLatencyMs: Number(item?.avg_latency_ms || 0),
        totalRequests: Number(item?.total_requests || 0),
      })),
    [data],
  );

  const connectedDonut = useMemo(
    () =>
      [
        { label: "Admin", total: connectedSummary.admins },
        { label: "Cajero", total: connectedSummary.cajeros },
        { label: "Cliente", total: connectedSummary.clientes },
      ].filter((item) => item.total > 0),
    [connectedSummary],
  );

  const sqlSummary = data?.sql?.summary || null;

  const sqlByTable = useMemo(
    () =>
      (data?.sql?.by_table || []).map((item) => ({
        label: item?.table_name || "Sin tabla detectada",
        total: Number(item?.total || 0),
        avgMs: Number(item?.avg_duration_ms || 0),
      })),
    [data],
  );

  const sqlByModule = useMemo(
    () =>
      (data?.sql?.by_module || []).map((item) => ({
        label: item?.modulo || "sin_modulo",
        total: Number(item?.total || 0),
        avgMs: Number(item?.avg_duration_ms || 0),
        selects: Number(item?.select_count || 0),
        inserts: Number(item?.insert_count || 0),
        updates: Number(item?.update_count || 0),
        deletes: Number(item?.delete_count || 0),
      })),
    [data],
  );

  const sqlHeavy = data?.sql?.heaviest || [];

  const sqlCards = [
    {
      title: "SELECT",
      value: formatNumber(getSqlCount(sqlSummary, "SELECT")),
      helper: `Promedio ${formatMs(getSqlAvg(sqlSummary, "SELECT"))}`,
      icon: "S",
      tone: "info",
    },
    {
      title: "INSERT",
      value: formatNumber(getSqlCount(sqlSummary, "INSERT")),
      helper: `Promedio ${formatMs(getSqlAvg(sqlSummary, "INSERT"))}`,
      icon: "I",
      tone: "success",
    },
    {
      title: "UPDATE",
      value: formatNumber(getSqlCount(sqlSummary, "UPDATE")),
      helper: `Promedio ${formatMs(getSqlAvg(sqlSummary, "UPDATE"))}`,
      icon: "U",
      tone: "accent",
    },
    {
      title: "DELETE",
      value: formatNumber(getSqlCount(sqlSummary, "DELETE")),
      helper: `Promedio ${formatMs(getSqlAvg(sqlSummary, "DELETE"))}`,
      icon: "D",
      tone: "danger",
    },
  ];

  if (loading) {
    return <Loader text="Cargando centro de control..." />;
  }

  if (error) {
    return (
      <EmptyState
        icon="📉"
        title="No se pudo cargar el monitoreo"
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
        .admin-monitor-shell { display: grid; gap: 18px; }
        .admin-monitor-kpis {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }
        .admin-monitor-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }
        .admin-monitor-list {
          display: grid;
          gap: 10px;
          max-height: 420px;
          overflow: auto;
          padding-right: 4px;
        }
        @media (max-width: 1120px) {
          .admin-monitor-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .admin-monitor-2 { grid-template-columns: 1fr; }
        }
        @media (max-width: 680px) {
          .admin-monitor-kpis { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="admin-monitor-shell">
        <AdminPageHeader
          eyebrow="Estado técnico"
          title="Monitoreo operativo"
          subtitle={`Última actualización: ${formatDate(data?.generated_at)}. Aquí se muestra rendimiento, uso de recursos y también el conteo de operaciones SQL para detectar qué optimizar.`}
          actions={
            <AdminButton onClick={() => load(true)}>Actualizar</AdminButton>
          }
        />

        <section className="admin-monitor-kpis">
          {summaryCards.map((card) => (
            <AdminMetricCard key={card.title} {...card} />
          ))}
        </section>

        <section className="admin-monitor-kpis">
          {sqlCards.map((card) => (
            <AdminMetricCard key={card.title} {...card} />
          ))}
        </section>

        <section className="admin-monitor-2">
          <AdminPanel
            title="Modulos lentos"
            subtitle="Endpoints con mayor tiempo de respuesta promedio."
          >
            <VerticalBarChart
              data={slowRoutes.slice(0, 6)}
              valueKeys={["total"]}
              labelKeys={["label"]}
              valueFormatter={(value) => `${Math.round(value)}`}
            />
          </AdminPanel>

          <AdminPanel
            title="Peso de tablas"
            subtitle="Objetos que más espacio consumen en la base."
          >
            <VerticalBarChart
              data={tables.slice(0, 6)}
              valueKeys={["total"]}
              labelKeys={["label"]}
              valueFormatter={(value) => `${value.toFixed?.(1) || value} MB`}
              color={adminTheme.colors.info}
            />
          </AdminPanel>
        </section>

        <section className="admin-monitor-2">
          <AdminPanel
            title="Conexiones por rol"
            subtitle="Quién está usando el sistema en este momento."
          >
            <DonutChart
              data={connectedDonut}
              valueKeys={["total"]}
              labelKeys={["label"]}
              centerLabel="Conectados"
              centerValue={connectedSummary.total}
              valueFormatter={(value) => `${value}`}
            />
          </AdminPanel>

          <AdminPanel
            title="Salud por módulo"
            subtitle="Puntaje visual basado en estado y latencia del módulo."
          >
            <RankedList
              items={modules}
              titleKey="label"
              valueKey="total"
              formatter={(value, item) =>
                `${value}% · ${formatMs(item?.avgLatencyMs)}`
              }
            />
          </AdminPanel>
        </section>

        <section className="admin-monitor-2">
          <AdminPanel
            title="Operaciones SQL por tabla"
            subtitle="Aquí ves qué tablas se consultan o modifican más."
          >
            {(sqlByTable || []).length ? (
              <VerticalBarChart
                data={sqlByTable.slice(0, 8)}
                valueKeys={["total"]}
                labelKeys={["label"]}
                valueFormatter={(value) => `${value}`}
                color={adminTheme.colors.accent}
              />
            ) : (
              <EmptyState
                icon="🗃️"
                title="Sin métricas SQL"
                description="Todavía no hay registros en sistema.sql_metrics."
              />
            )}
          </AdminPanel>

          <AdminPanel
            title="Operaciones SQL por módulo"
            subtitle="Qué parte del sistema genera más carga en base de datos."
          >
            {(sqlByModule || []).length ? (
              <RankedList
                items={sqlByModule}
                titleKey="label"
                valueKey="total"
                formatter={(value, item) =>
                  `${value} ops · ${formatMs(item?.avgMs)}`
                }
              />
            ) : (
              <EmptyState
                icon="📦"
                title="Sin datos por módulo"
                description="Aún no se registran métricas SQL por módulo."
              />
            )}
          </AdminPanel>
        </section>

        <section className="admin-monitor-2">
          <AdminPanel
            title="Consultas y acciones"
            subtitle="Te ayuda a detectar qué operación conviene optimizar primero."
          >
            <div className="admin-monitor-list">
              {(sqlHeavy || []).length ? (
                sqlHeavy.map((item, index) => (
                  <article
                    key={`${item?.modulo}-${item?.accion}-${index}`}
                    style={softPanelStyle({ padding: 14, background: "#fff" })}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <strong style={{ color: adminTheme.colors.text }}>
                        {[item?.modulo, item?.accion, item?.tipo_sql]
                          .filter(Boolean)
                          .join(" · ")}
                      </strong>
                      <span
                        style={{
                          color: adminTheme.colors.textMuted,
                          fontSize: 12,
                        }}
                      >
                        {formatMs(item?.avg_ms)} prom. ·{" "}
                        {formatMs(item?.max_ms)} máx.
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                        color: adminTheme.colors.textSoft,
                        fontWeight: 600,
                        lineHeight: 1.5,
                        fontSize: 13,
                      }}
                    >
                      Tabla: {item?.esquema_nombre || "-"}.
                      {item?.tabla_nombre || "-"} · Total: {item?.total || 0}
                    </div>
                  </article>
                ))
              ) : (
                <EmptyState
                  icon="🐢"
                  title="Sin operaciones registradas"
                  description="Cuando el sistema empiece a guardar métricas SQL, aquí verás las más pesadas."
                />
              )}
            </div>
          </AdminPanel>

          <AdminPanel
            title="Alertas y verificaciones"
            subtitle="Lo que conviene revisar antes de que se vuelva un problema."
          >
            <div style={{ display: "grid", gap: 10 }}>
              {(data?.alerts || []).length ? (
                (data?.alerts || []).map((item, index) => (
                  <article
                    key={index}
                    style={softPanelStyle({ padding: 14, background: "#fff" })}
                  >
                    <div
                      style={subtleBadgeStyle(
                        statusToneFromText(
                          item?.status || item?.title || item?.detail || "",
                        ),
                      )}
                    >
                      {item?.title || item?.service || "Hallazgo"}
                    </div>
                    <p
                      style={{
                        margin: "10px 0 0",
                        color: adminTheme.colors.textSoft,
                        fontWeight: 600,
                        lineHeight: 1.55,
                      }}
                    >
                      {item?.detail ||
                        item?.description ||
                        "Sin detalle adicional."}
                    </p>
                  </article>
                ))
              ) : (
                <EmptyState
                  icon="✅"
                  title="Sin alertas activas"
                  description="No se detectan alertas relevantes con la información actual."
                />
              )}

              {(data?.service_checks || []).map((item, index) => (
                <article
                  key={`${item?.service}-${index}`}
                  style={softPanelStyle({
                    padding: 14,
                    background: adminTheme.colors.panelSoft,
                  })}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <strong style={{ color: adminTheme.colors.text }}>
                      {item?.service}
                    </strong>
                    <span
                      style={subtleBadgeStyle(
                        statusToneFromText(item?.status || ""),
                      )}
                    >
                      {item?.status || "ok"}
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      color: adminTheme.colors.textSoft,
                      fontSize: 13,
                    }}
                  >
                    {item?.detail || "Sin detalle"}
                  </div>
                </article>
              ))}
            </div>
          </AdminPanel>
        </section>

        <section className="admin-monitor-2">
          <AdminPanel
            title="Actividad y acciones pesadas"
            subtitle="Historial reciente y operaciones que más tardan."
          >
            <div className="admin-monitor-list">
              {(data?.recent_history || []).map((item, index) => (
                <article
                  key={`${item?.id || index}`}
                  style={softPanelStyle({ padding: 14, background: "#fff" })}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <strong style={{ color: adminTheme.colors.text }}>
                      {[item?.modulo, item?.accion]
                        .filter(Boolean)
                        .join(" · ") || "Movimiento"}
                    </strong>
                    <span
                      style={{
                        color: adminTheme.colors.textMuted,
                        fontSize: 12,
                      }}
                    >
                      {formatDate(
                        item?.created_at || item?.at || item?.timestamp,
                      )}
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: 10,
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      fontSize: 12,
                      color: adminTheme.colors.textMuted,
                      fontWeight: 600,
                    }}
                  >
                    {item?.usuario_nombre ? (
                      <span>Usuario: {item.usuario_nombre}</span>
                    ) : null}
                    {item?.rol_usuario ? (
                      <span>Rol: {item.rol_usuario}</span>
                    ) : null}
                    {item?.resultado ? (
                      <span>Resultado: {item.resultado}</span>
                    ) : null}
                    {item?.duracion_ms != null ? (
                      <span>Duración: {item.duracion_ms} ms</span>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </AdminPanel>

          <AdminPanel
            title="Resumen por módulo SQL"
            subtitle="SELECT, INSERT, UPDATE y DELETE agrupados por módulo."
          >
            <div className="admin-monitor-list">
              {(sqlByModule || []).length ? (
                sqlByModule.map((item, index) => (
                  <article
                    key={`${item?.label}-${index}`}
                    style={softPanelStyle({ padding: 14, background: "#fff" })}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <strong style={{ color: adminTheme.colors.text }}>
                        {item?.label}
                      </strong>
                      <span
                        style={{
                          color: adminTheme.colors.textMuted,
                          fontSize: 12,
                        }}
                      >
                        {item?.total} operaciones
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: 10,
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        fontSize: 12,
                        color: adminTheme.colors.textMuted,
                        fontWeight: 600,
                      }}
                    >
                      <span>SELECT: {item?.selects}</span>
                      <span>INSERT: {item?.inserts}</span>
                      <span>UPDATE: {item?.updates}</span>
                      <span>DELETE: {item?.deletes}</span>
                      <span>Promedio: {formatMs(item?.avgMs)}</span>
                    </div>
                  </article>
                ))
              ) : (
                <EmptyState
                  icon="📊"
                  title="Sin resumen SQL por módulo"
                  description="Todavía no hay datos suficientes para mostrar este bloque."
                />
              )}
            </div>
          </AdminPanel>
        </section>
      </div>
    </>
  );
}
