// components/admin/predictions/AdminPrediccionInsumos.jsx
import { useMemo } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useAdminPrediccionInsumos } from "../../hooks/admin/useAdminPrediccionInsumos.js";
import AdminButton from "../../components/admin/ui/AdminButton.jsx";
import AdminMetricCard from "../../components/admin/ui/AdminMetricCard.jsx";
import AdminPanel from "../../components/admin/ui/AdminPanel.jsx";
import {
  DonutChart,
  LineAreaChart,
  VerticalBarChart,
} from "../../components/admin/charts/AdminCharts.jsx";
import {
  adminTheme,
  selectStyle,
  subtleBadgeStyle,
  softPanelStyle,
  inputStyle,
} from "../../components/admin/ui/adminTheme.js";

import AdminDailyForecastPanel from "../../components/admin/ml/AdminDailyForecastPanel.jsx";

const ESCALAS_DISPONIBLES = [
  { value: "dia", label: "Por día" },
  { value: "semana", label: "Por semana" },
  { value: "mes", label: "Por mes" },
];

const PROYECCIONES_POR_ESCALA = {
  dia: "7 días",
  semana: "4 semanas",
  mes: "3 meses",
};

const LABELS_POR_ESCALA = {
  dia: { singular: "día", plural: "días" },
  semana: { singular: "semana", plural: "semanas" },
  mes: { singular: "mes", plural: "meses" },
};

export default function AdminPrediccionInsumos() {
  const { token } = useAuth();
  const {
    loading,
    error,
    data,
    escala,
    setEscala,
    periodos,
    setPeriodos,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    fechasCalculadas,
    load,
    lineChartData,
    sizeProjectionData,
    cheeseBySizeData,
    compositionDonutData,
    formatNumber,
    formatPeriod,
    getTrendTone,
  } = useAdminPrediccionInsumos(token);

  const kpis = data?.kpis || {};
  const historico = data?.historico || [];
  const proyeccion = data?.proyeccion || [];
  const resumen = data?.resumen || {};

  const summaryCards = useMemo(
    () => [
      {
        title: "Pizzas proyectadas",
        value: `${formatNumber(kpis?.total_pizzas_proyectadas, 0)} pizzas`,
        helper: `${escala === "dia" ? "Día" : escala === "semana" ? "Semana" : "Mes"} ${kpis?.periodo_objetivo || "—"} · Objetivo`,
        icon: "🍕",
        tone: "primary",
      },
      {
        title: "Bolsas de queso",
        value: `${formatNumber(kpis?.bolsas_queso_requeridas)} bolsas`,
        icon: "🧀",
        tone: "accent",
      },
      {
        title: "Queso requerido",
        value: `${formatNumber(kpis?.kilogramos_queso_requeridos)} kg`,
        helper: "Resultado para planeación de compras",
        icon: "⚖️",
        tone: "success",
      },
      {
        title: "Tendencia general",
        value: String(kpis?.tendencia_general || "estable").toUpperCase(),
        helper: `Stock: ${formatNumber(kpis?.stock_actual_bolsas, 0)} · Reorden: ${formatNumber(kpis?.punto_reorden_bolsas, 0)}`,
        icon: kpis?.tendencia_general?.includes("crec")
          ? "📈"
          : kpis?.tendencia_general?.includes("decre")
            ? "📉"
            : "➡️",
        tone: getTrendTone(kpis?.tendencia_general),
      },
    ],
    [kpis, escala, formatNumber, getTrendTone],
  );

  const tablaPeriodos = useMemo(
    () => [
      ...historico.map((item) => ({ ...item, __tipo: "Histórico" })),
      ...proyeccion.map((item) => ({ ...item, __tipo: "Proyección" })),
    ],
    [historico, proyeccion],
  );

  const donutCenterValue = useMemo(() => {
    if (escala === "dia") {
      return formatPeriod(String(kpis?.periodo_objetivo || ""), "dia");
    }
    return formatNumber(kpis?.periodo_objetivo, 0);
  }, [escala, kpis?.periodo_objetivo, formatNumber, formatPeriod]);

  const escalaTexto = {
    dia: "diario",
    semana: "semanal",
    mes: "mensual",
  };

  const escalaLabel = LABELS_POR_ESCALA[escala] || LABELS_POR_ESCALA.semana;

  return (
    <div
      className="admin-prediccion-page"
      style={{
        display: "grid",
        gap: 22,
        width: "100%",
        maxWidth: 1400,
        minWidth: 0,
        margin: "0 auto",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .admin-prediccion-page,
        .admin-prediccion-page * {
          box-sizing: border-box;
        }

        .admin-prediccion-page {
          min-width: 0;
          max-width: 100%;
        }

        .pred-header,
        .pred-range-panel,
        .pred-panel,
        .pred-panel > section,
        .pred-card-wrap,
        .pred-chart-wrap,
        .pred-table-wrap,
        .pred-info-card {
          min-width: 0;
          max-width: 100%;
        }

        .pred-header {
          padding: 24px 24px 22px;
          background: linear-gradient(135deg, rgba(255,250,245,1) 0%, rgba(247,241,235,1) 100%);
          border: 1px solid ${adminTheme.border};
          border-radius: ${adminTheme.radiusLg};
          box-shadow: ${adminTheme.shadow};
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: start;
          gap: 18px;
          overflow: hidden;
        }

        .pred-header-main {
          min-width: 0;
          max-width: 100%;
        }

        .pred-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 999px;
          background: ${adminTheme.accentSoft};
          color: ${adminTheme.accent};
          font-weight: 800;
          font-size: 12px;
          letter-spacing: .04em;
          text-transform: uppercase;
          max-width: 100%;
          white-space: normal;
        }

        .pred-eyebrow-dot {
          width: 8px;
          height: 8px;
          flex: 0 0 8px;
          border-radius: 50%;
          background: ${adminTheme.accent};
        }

        .pred-title {
          margin: 14px 0 0;
          font-size: clamp(24px, 4.8vw, 34px);
          line-height: 1.08;
          font-weight: 950;
          color: ${adminTheme.text};
          letter-spacing: -0.02em;
          max-width: 100%;
          overflow-wrap: anywhere;
          word-break: normal;
        }

        .pred-subtitle {
          margin: 10px 0 0;
          color: ${adminTheme.muted};
          font-weight: 600;
          font-size: 14px;
          line-height: 1.65;
          max-width: 760px;
          overflow-wrap: anywhere;
        }

        .pred-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 12px;
          width: 100%;
          min-width: 0;
        }

        .pred-field,
        .pred-control {
          min-width: 0;
          max-width: 100%;
        }

        .pred-grid-two,
        .pred-grid-two-even,
        .pred-kpi-grid,
        .pred-info-grid {
          min-width: 0;
          max-width: 100%;
        }

        .pred-panel > section {
          overflow: hidden;
        }

        .pred-chart-wrap {
          width: 100%;
          overflow: hidden;
        }

        .pred-table-wrap {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .pred-mobile-periods {
          display: none;
        }

        .pred-range-content span,
        .pred-info-card,
        .pred-info-card * {
          overflow-wrap: anywhere;
        }

        @media (max-width: 1180px) {
          .pred-grid-two,
          .pred-grid-two-even {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 760px) {
          .admin-prediccion-page {
            gap: 16px !important;
            overflow-x: hidden;
          }

          .pred-header {
            grid-template-columns: 1fr;
            padding: 18px 16px !important;
            border-radius: 18px !important;
          }

          .pred-title {
            font-size: 24px;
            line-height: 1.15;
          }

          .pred-actions {
            display: grid !important;
            grid-template-columns: 1fr;
            justify-content: stretch;
            align-items: stretch;
            width: 100%;
          }

          .pred-field,
          .pred-actions select,
          .pred-actions input,
          .pred-actions button {
            width: 100% !important;
            max-width: 100% !important;
          }

          .pred-kpi-grid,
          .pred-info-grid {
            grid-template-columns: 1fr !important;
          }

          .pred-card-wrap > div {
            width: 100%;
            min-width: 0;
          }

          .pred-range-panel {
            padding: 12px !important;
          }

          .pred-range-content {
            display: grid !important;
            grid-template-columns: 1fr;
            align-items: start !important;
            gap: 6px !important;
            font-size: 12px !important;
          }

          .pred-panel > section {
            padding: 16px !important;
            border-radius: 18px !important;
          }

          .pred-chart-wrap {
            overflow-x: auto;
            overflow-y: hidden;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 2px;
          }

          .pred-chart-inner {
            min-width: 430px;
            width: 430px;
          }

          .pred-chart-inner.pred-donut-inner {
            min-width: 300px;
            width: 100%;
          }

          .pred-desktop-table {
            display: none !important;
          }

          .pred-mobile-periods {
            display: grid;
            gap: 12px;
          }

          .pred-mobile-period-card {
            border: 1px solid ${adminTheme.colors.border};
            border-radius: 16px;
            padding: 14px;
            background: #fff;
            display: grid;
            gap: 12px;
          }

          .pred-mobile-period-card.proyeccion {
            background: rgba(245, 158, 11, 0.05);
          }

          .pred-mobile-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .pred-loader-box {
            width: 100% !important;
            padding: 26px 18px !important;
          }
        }

        @media (max-width: 430px) {
          .admin-prediccion-page {
            gap: 14px !important;
          }

          .pred-header {
            padding: 16px 14px !important;
          }

          .pred-title {
            font-size: 22px;
          }

          .pred-chart-inner {
            min-width: 390px;
            width: 390px;
          }

          .pred-mobile-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <PrediccionHeader
        escala={escala}
        setEscala={setEscala}
        periodos={periodos}
        setPeriodos={setPeriodos}
        fechaInicio={fechaInicio}
        setFechaInicio={setFechaInicio}
        fechaFin={fechaFin}
        setFechaFin={setFechaFin}
        load={load}
      />

      <AdminDailyForecastPanel />

      <div
        className="pred-range-panel"
        style={softPanelStyle({ padding: 14, background: "#eff6ff" })}
      >
        <div
          className="pred-range-content"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13,
            color: adminTheme.colors.text,
            flexWrap: "wrap",
            minWidth: 0,
          }}
        >
          <span style={{ fontWeight: 700 }}>📅 Rango seleccionado:</span>
          <span>{formatPeriod(fechasCalculadas.fechaInicio, escala)}</span>
          <span>→</span>
          <span>{formatPeriod(fechasCalculadas.fechaFin, escala)}</span>
          <span style={{ color: adminTheme.colors.textSoft }}>
            ({historico.length} {escalaLabel.plural} analizados)
          </span>
        </div>
      </div>

      {error ? (
        <div style={subtleBadgeStyle("accent", { textAlign: "center" })}>
          {error}
        </div>
      ) : null}

      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "360px",
            gridColumn: "1 / -1",
            padding: "32px 16px",
            minWidth: 0,
          }}
        >
          <div
            className="pred-loader-box"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              padding: "32px 48px",
              background: "#fff",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
              border: `1px solid ${adminTheme.colors.border}`,
              maxWidth: "100%",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #8b2323",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <p
              style={{
                margin: 0,
                color: adminTheme.colors.textSoft,
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Calculando predicción...
            </p>
          </div>
        </div>
      ) : null}

      {!loading && data ? (
        <>
          <div
            className="pred-kpi-grid"
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
              minWidth: 0,
            }}
          >
            {summaryCards.map((card) => (
              <div className="pred-card-wrap" key={card.title}>
                <AdminMetricCard
                  title={card.title}
                  value={card.value}
                  helper={card.helper}
                  icon={card.icon}
                  tone={card.tone}
                />
              </div>
            ))}
          </div>

          <div
            className="pred-grid-two"
            style={{
              display: "grid",
              gap: 20,
              gridTemplateColumns: "var(--adm-grid-two)",
              minWidth: 0,
            }}
          >
            <PanelWrap>
              <AdminPanel
                title="📊 Producción histórica"
                subtitle={`Comportamiento ${escalaTexto[escala]} observado`}
                style={{ minWidth: 0, overflow: "hidden" }}
              >
                <ChartScroll>
                  <LineAreaChart
                    data={(lineChartData?.historico || []).map((item) => ({
                      label: item.label,
                      total: item.total,
                      tooltip: item.tooltip,
                    }))}
                    valueFormatter={(value) =>
                      `${formatNumber(value, 0)} pizzas`
                    }
                    color={adminTheme.colors.primary}
                    height={260}
                  />
                </ChartScroll>
              </AdminPanel>
            </PanelWrap>

            <PanelWrap>
              <AdminPanel
                title="🔮 Proyección futura"
                subtitle={`Estimación para los próximos ${PROYECCIONES_POR_ESCALA[escala]}`}
                style={{ minWidth: 0, overflow: "hidden" }}
              >
                <ChartScroll>
                  <LineAreaChart
                    data={(lineChartData?.proyeccion || []).map((item) => ({
                      label: item.label,
                      total: item.total,
                      tooltip: item.tooltip,
                    }))}
                    color={adminTheme.colors.accent}
                    fill="rgba(245, 158, 11, 0.12)"
                    valueFormatter={(value) =>
                      `${formatNumber(value, 0)} pizzas`
                    }
                    height={260}
                  />
                </ChartScroll>
              </AdminPanel>
            </PanelWrap>
          </div>

          <div
            className="pred-grid-two-even"
            style={{
              display: "grid",
              gap: 20,
              gridTemplateColumns: "var(--adm-grid-two-even)",
              minWidth: 0,
            }}
          >
            <PanelWrap>
              <AdminPanel
                title="🍕 Producción proyectada por tamaño"
                subtitle={`Estimado para el siguiente ${escalaLabel.singular}`}
                style={{ minWidth: 0, overflow: "hidden" }}
              >
                <ChartScroll>
                  <VerticalBarChart
                    data={sizeProjectionData}
                    valueFormatter={(value) =>
                      `${formatNumber(value, 0)} pizzas`
                    }
                    height={250}
                  />
                </ChartScroll>
              </AdminPanel>
            </PanelWrap>

            <PanelWrap>
              <AdminPanel
                title="🧀 Queso requerido por tamaño"
                subtitle="Aporte de cada tamaño al total de bolsas"
                style={{ minWidth: 0, overflow: "hidden" }}
              >
                <ChartScroll>
                  <VerticalBarChart
                    data={cheeseBySizeData}
                    color={adminTheme.colors.success}
                    valueFormatter={(value) =>
                      `${formatNumber(value, 3)} bolsas`
                    }
                    height={250}
                  />
                </ChartScroll>
              </AdminPanel>
            </PanelWrap>
          </div>

          <PanelWrap>
            <AdminPanel
              title={`🥧 Composición del siguiente ${escalaLabel.singular}`}
              subtitle="Distribución porcentual por tamaño"
              style={{ minWidth: 0, overflow: "hidden" }}
            >
              <div className="pred-chart-wrap">
                <div className="pred-chart-inner pred-donut-inner">
                  <DonutChart
                    data={compositionDonutData}
                    centerLabel={
                      escalaLabel.singular.charAt(0).toUpperCase() +
                      escalaLabel.singular.slice(1)
                    }
                    centerValue={donutCenterValue}
                    valueFormatter={(value) =>
                      `${formatNumber(value, 0)} pizzas`
                    }
                    height={280}
                  />
                </div>
              </div>
            </AdminPanel>
          </PanelWrap>

          <PanelWrap>
            <AdminPanel
              title={`📋 Detalle ${escalaTexto[escala]}: producción y queso`}
              subtitle="Concentrado con cálculos derivados"
              style={{ minWidth: 0, overflow: "hidden" }}
            >
              <DetallePeriodos
                rows={tablaPeriodos}
                escala={escala}
                formatNumber={formatNumber}
                formatPeriod={formatPeriod}
              />
            </AdminPanel>
          </PanelWrap>

          <PanelWrap>
            <AdminPanel
              title="💡 Interpretación operativa"
              subtitle="Resumen para compras y control"
              style={{ minWidth: 0, overflow: "hidden" }}
            >
              <div
                className="pred-info-grid"
                style={{
                  display: "grid",
                  gap: 16,
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
                  minWidth: 0,
                }}
              >
                <InfoCard
                  title="📅 Parámetros del análisis"
                  items={[
                    {
                      label: "Escala",
                      value:
                        escalaLabel.singular.charAt(0).toUpperCase() +
                        escalaLabel.singular.slice(1),
                    },
                    {
                      label: "Rango analizado",
                      value: `${formatPeriod(fechasCalculadas.fechaInicio, escala)} - ${formatPeriod(fechasCalculadas.fechaFin, escala)}`,
                    },
                    {
                      label: "Períodos analizados",
                      value: `${resumen?.periodos_analizados || 0} ${escalaLabel.plural}`,
                    },
                    {
                      label: "Proyección",
                      value: PROYECCIONES_POR_ESCALA[escala],
                    },
                  ]}
                />
                <InfoCard
                  title="🛒 Recomendación de compra"
                  items={[
                    {
                      label: "Estado",
                      value: kpis?.alerta_stock_bajo
                        ? "⚠️ Stock bajo - Reordenar"
                        : "✓ Inventario suficiente",
                      highlight: true,
                    },
                    {
                      label: "Stock actual",
                      value: `${formatNumber(kpis?.stock_actual_bolsas, 0)} bolsas`,
                    },
                    {
                      label: "Punto de reorden",
                      value: `${formatNumber(kpis?.punto_reorden_bolsas, 0)} bolsas`,
                    },
                  ]}
                  action={resumen?.recomendacion_compra}
                />
                <InfoCard
                  title="📊 Lectura del resultado"
                  items={[
                    {
                      label: "Producción estimada",
                      value: `${formatNumber(kpis?.total_pizzas_proyectadas, 0)} pizzas`,
                    },
                    {
                      label: "Queso requerido",
                      value: `${formatNumber(kpis?.bolsas_queso_requeridas, 3)} bolsas · ${formatNumber(kpis?.kilogramos_queso_requeridos)} kg`,
                    },
                    {
                      label: "Tendencia",
                      value: kpis?.tendencia_general?.toUpperCase(),
                      tone: getTrendTone(kpis?.tendencia_general),
                    },
                  ]}
                />
              </div>
            </AdminPanel>
          </PanelWrap>
        </>
      ) : null}
    </div>
  );
}

function PrediccionHeader({
  escala,
  setEscala,
  periodos,
  setPeriodos,
  fechaInicio,
  setFechaInicio,
  fechaFin,
  setFechaFin,
  load,
}) {
  return (
    <section className="pred-header">
      <div className="pred-header-main">
        <div className="pred-eyebrow">
          <span className="pred-eyebrow-dot" />
          Propuesta Matemática
        </div>
        <h1 className="pred-title">Predicción de producción y queso</h1>
        <p className="pred-subtitle">Escala: {escala.toUpperCase()}</p>
      </div>

      <div className="pred-actions">
        <select
          value={escala}
          onChange={(e) => setEscala(e.target.value)}
          className="pred-control"
          style={selectStyle(140)}
          title="Escala de visualización"
        >
          {ESCALAS_DISPONIBLES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {escala === "dia" ? (
          <>
            <label className="pred-field" style={{ display: "grid", gap: 4 }}>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="pred-control"
                style={inputStyle()}
                title="Fecha inicio"
              />
            </label>
            <label className="pred-field" style={{ display: "grid", gap: 4 }}>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="pred-control"
                style={inputStyle()}
                title="Fecha fin"
              />
            </label>
          </>
        ) : null}

        {escala === "semana" || escala === "mes" ? (
          <label className="pred-field" style={{ display: "grid", gap: 4 }}>
            <select
              value={periodos}
              onChange={(e) => setPeriodos(Number(e.target.value))}
              className="pred-control"
              style={selectStyle(170)}
              title={
                escala === "semana" ? "Número de semanas" : "Número de meses"
              }
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n}{" "}
                  {escala === "semana"
                    ? n === 1
                      ? "semana"
                      : "semanas"
                    : n === 1
                      ? "mes"
                      : "meses"}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <AdminButton
          onClick={() => load()}
          type="button"
          variant="secondary"
          className="pred-action-btn"
        >
          🔄 Actualizar
        </AdminButton>
      </div>
    </section>
  );
}

function PanelWrap({ children }) {
  return <div className="pred-panel">{children}</div>;
}

function ChartScroll({ children }) {
  return (
    <div className="pred-chart-wrap">
      <div className="pred-chart-inner">{children}</div>
    </div>
  );
}

function DetallePeriodos({ rows, escala, formatNumber, formatPeriod }) {
  const safeRows = Array.isArray(rows) ? rows : [];

  if (!safeRows.length) {
    return (
      <div
        style={{
          padding: 18,
          borderRadius: 16,
          border: `1px solid ${adminTheme.colors.border}`,
          color: adminTheme.colors.textSoft,
          fontWeight: 700,
          background: "#fff",
        }}
      >
        No hay periodos para mostrar.
      </div>
    );
  }

  return (
    <>
      <div
        className="pred-table-wrap pred-desktop-table"
        style={{
          overflow: "auto",
          borderRadius: 16,
          border: `1px solid ${adminTheme.colors.border}`,
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: 1100,
            background: "#fff",
            fontSize: 13,
          }}
        >
          <thead>
            <tr style={{ background: adminTheme.colors.panelSoft }}>
              {[
                "Tipo",
                "Periodo",
                "Individual",
                "Mediana",
                "Grande",
                "Jumbo",
                "Total",
                "Bolsas",
                "Kg",
                "Conf.",
              ].map((head) => (
                <th
                  key={head}
                  style={{
                    textAlign: "left",
                    padding: "12px 14px",
                    fontSize: 11,
                    fontWeight: 800,
                    color: adminTheme.colors.textSoft,
                    borderBottom: `1px solid ${adminTheme.colors.border}`,
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                  }}
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {safeRows.map((item, index) => (
              <tr
                key={`${item.periodo}-${item.__tipo}-${index}`}
                style={{
                  background:
                    item.__tipo === "Proyección"
                      ? "rgba(245, 158, 11, 0.04)"
                      : "transparent",
                }}
              >
                <td style={tableTd()}>
                  <span
                    style={subtleBadgeStyle(
                      item.__tipo === "Histórico" ? "success" : "accent",
                    )}
                  >
                    {item.__tipo}
                  </span>
                </td>
                <td
                  style={{
                    ...tableTd(),
                    fontWeight: 700,
                    color: adminTheme.colors.text,
                  }}
                >
                  {formatPeriod(item.periodo, escala)}
                </td>
                {["individual", "mediana", "grande", "jumbo"].map((key) => (
                  <td
                    key={key}
                    style={{
                      ...tableTd(),
                      color: adminTheme.colors.textSoft,
                      fontFamily: "monospace",
                    }}
                  >
                    {formatNumber(item[key], 0)}
                  </td>
                ))}
                <td
                  style={{
                    ...tableTd(),
                    fontWeight: 800,
                    color: adminTheme.colors.text,
                  }}
                >
                  {formatNumber(item.total_pizzas, 0)}
                </td>
                <td
                  style={{
                    ...tableTd(),
                    color: adminTheme.colors.textSoft,
                    fontFamily: "monospace",
                  }}
                >
                  {formatNumber(item.bolsas_queso, 3)}
                </td>
                <td
                  style={{
                    ...tableTd(),
                    color: adminTheme.colors.textSoft,
                    fontFamily: "monospace",
                  }}
                >
                  {formatNumber(item.kilogramos_queso, 2)}
                </td>
                <td style={tableTd()}>{renderConfidence(item.confianza)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pred-mobile-periods">
        {safeRows.map((item, index) => (
          <article
            key={`${item.periodo}-${item.__tipo}-${index}-mobile`}
            className={`pred-mobile-period-card ${item.__tipo === "Proyección" ? "proyeccion" : ""}`}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              <div>
                <strong style={{ color: adminTheme.colors.text }}>
                  {formatPeriod(item.periodo, escala)}
                </strong>
                <div style={{ marginTop: 6 }}>
                  <span
                    style={subtleBadgeStyle(
                      item.__tipo === "Histórico" ? "success" : "accent",
                    )}
                  >
                    {item.__tipo}
                  </span>
                </div>
              </div>
              {renderConfidence(item.confianza)}
            </div>

            <div className="pred-mobile-grid">
              <MiniValue
                label="Individual"
                value={formatNumber(item.individual, 0)}
              />
              <MiniValue
                label="Mediana"
                value={formatNumber(item.mediana, 0)}
              />
              <MiniValue label="Grande" value={formatNumber(item.grande, 0)} />
              <MiniValue label="Jumbo" value={formatNumber(item.jumbo, 0)} />
              <MiniValue
                label="Total"
                value={formatNumber(item.total_pizzas, 0)}
                strong
              />
              <MiniValue
                label="Bolsas"
                value={formatNumber(item.bolsas_queso, 3)}
              />
              <MiniValue
                label="Kg"
                value={formatNumber(item.kilogramos_queso, 2)}
              />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function tableTd() {
  return {
    padding: "12px 14px",
    borderBottom: `1px solid ${adminTheme.colors.border}`,
  };
}

function renderConfidence(confianza) {
  if (!confianza) return "—";

  return (
    <span
      style={{
        fontSize: 11,
        padding: "4px 8px",
        borderRadius: 20,
        background:
          confianza === "alta"
            ? "#dcfce7"
            : confianza === "media"
              ? "#fef3c7"
              : "#dbeafe",
        color:
          confianza === "alta"
            ? "#166534"
            : confianza === "media"
              ? "#92400e"
              : "#1e40af",
        fontWeight: 700,
        textTransform: "capitalize",
        display: "inline-flex",
        width: "fit-content",
      }}
    >
      {confianza}
    </span>
  );
}

function MiniValue({ label, value, strong = false }) {
  return (
    <div
      style={{
        padding: 10,
        borderRadius: 12,
        background: "#f8fafc",
        border: `1px solid ${adminTheme.colors.border}`,
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: adminTheme.colors.textSoft,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: ".03em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: strong ? 18 : 15,
          color: adminTheme.colors.text,
          fontWeight: strong ? 900 : 800,
          fontFamily: strong ? "inherit" : "monospace",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function InfoCard({ title, items, action }) {
  return (
    <div
      className="pred-info-card"
      style={{
        padding: 18,
        background: adminTheme.colors.panel,
        borderRadius: 14,
        border: `1px solid ${adminTheme.colors.border}`,
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 800,
          color: adminTheme.colors.text,
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 8,
          minWidth: 0,
        }}
      >
        {title}
      </div>
      <div style={{ display: "grid", gap: 10, minWidth: 0 }}>
        {items?.map((item, idx) => (
          <div key={idx} style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 11,
                color: adminTheme.colors.textSoft,
                fontWeight: 600,
                marginBottom: 2,
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: item.highlight ? 800 : 700,
                color: item.tone
                  ? item.tone === "accent"
                    ? "#b45309"
                    : item.tone === "success"
                      ? "#15803d"
                      : "#1e40af"
                  : adminTheme.colors.text,
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>
      {action ? (
        <div
          style={{
            marginTop: 14,
            paddingTop: 14,
            borderTop: `1px dashed ${adminTheme.colors.border}`,
            fontSize: 13,
            fontWeight: 600,
            color: adminTheme.colors.text,
            lineHeight: 1.6,
          }}
        >
          {action}
        </div>
      ) : null}
    </div>
  );
}

