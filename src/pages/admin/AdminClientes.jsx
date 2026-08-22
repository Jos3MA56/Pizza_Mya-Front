import { useMemo } from "react";
import {
  RefreshCcw,
  Users,
  Wallet,
  ShoppingBag,
  UserRoundCheck,
  Mail,
  Phone,
  CalendarDays,
  ReceiptText,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Loader from "../../components/ui/Loader.jsx";
import { useAdminClientes } from "../../hooks/admin/useAdminClientes.js";
import AdminButton from "../../components/admin/ui/AdminButton.jsx";
import AdminPageHeader from "../../components/admin/ui/AdminPageHeader.jsx";
import AdminSectionCard from "../../components/admin/ui/AdminSectionCard.jsx";
import AdminSearchBar from "../../components/admin/ui/AdminSearchBar.jsx";
import AdminStatCard from "../../components/admin/ui/AdminStatCard.jsx";
import { adminTheme } from "../../components/admin/ui/adminTheme.js";

function formatMoney(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatDateTime(value) {
  if (!value) return "Sin actualización";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin actualización";
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function initialsFromName(name) {
  const safe = String(name || "CL").trim();
  const parts = safe.split(/\s+/).filter(Boolean).slice(0, 2);
  if (!parts.length) return "CL";
  return parts.map((part) => part[0]?.toUpperCase() || "").join("");
}

function MetricMini({ label, value, tone = "accent" }) {
  const toneMap = {
    accent: { bg: adminTheme.accentSoft, color: adminTheme.accent },
    olive: { bg: adminTheme.successSoft, color: adminTheme.success },
    amber: { bg: adminTheme.warningSoft, color: adminTheme.warning },
    slate: { bg: adminTheme.infoSoft, color: adminTheme.info },
  };
  const styles = toneMap[tone] || toneMap.accent;

  return (
    <div
      style={{
        padding: 14,
        borderRadius: 16,
        background: styles.bg,
        border: `1px solid ${adminTheme.border}`,
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: adminTheme.muted,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: ".04em",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 950, color: styles.color }}>
        {value}
      </div>
    </div>
  );
}

function RankBar({ label, value, max, helper = "" }) {
  const width = max > 0 ? Math.max(10, (value / max) * 100) : 10;
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontWeight: 800, color: adminTheme.text }}>{label}</div>
        <div style={{ color: adminTheme.muted, fontWeight: 700 }}>
          {formatMoney(value)}
          {helper ? ` · ${helper}` : ""}
        </div>
      </div>
      <div
        style={{
          height: 10,
          borderRadius: 999,
          background: adminTheme.cardMuted,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${width}%`,
            background: adminTheme.accent,
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  );
}

export default function AdminClientes() {
  const { token } = useAuth();
  const {
    clientes,
    loading,
    error,
    filters,
    onSearchChange,
    refresh,
    stats,
    updatedAt,
  } = useAdminClientes(token);

  const rows = useMemo(
    () => (Array.isArray(clientes) ? clientes : []),
    [clientes],
  );
  const totalSinCompra = Math.max(
    0,
    rows.length - Number(stats.clientesActivos || 0),
  );
  const ticketGeneral = Number(stats.totalPedidos || 0)
    ? Number(stats.totalGastado || 0) / Number(stats.totalPedidos || 1)
    : 0;

  const topClientes = useMemo(() => {
    return [...rows]
      .sort(
        (a, b) => Number(b.total_gastado || 0) - Number(a.total_gastado || 0),
      )
      .slice(0, 5);
  }, [rows]);

  const recentClients = useMemo(() => {
    return [...rows]
      .sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime(),
      )
      .slice(0, 4);
  }, [rows]);

  const maxTop = Math.max(
    ...topClientes.map((item) => Number(item.total_gastado || 0)),
    1,
  );

  if (loading) return <Loader text="Cargando clientes..." />;

  if (error) {
    return (
      <EmptyState
        icon="👥"
        title="No se pudieron cargar los clientes"
        description={error}
        actionLabel="Reintentar"
        onAction={refresh}
        tone="danger"
      />
    );
  }

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <AdminPageHeader
        title="Clientes"
        subtitle={`Última actualización: ${formatDateTime(updatedAt)}. Esta vista deja primero lo que le interesa al admin: gasto, frecuencia, clientes activos y concentración de compra.`}
        actions={
          <AdminButton
            variant="secondary"
            leftIcon={<RefreshCcw size={16} />}
            onClick={refresh}
          >
            Recargar
          </AdminButton>
        }
      />

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
          gap: 16,
        }}
      >
        <AdminStatCard
          title="Clientes registrados"
          value={stats.totalClientes}
          icon={<Users size={26} />}
          variant="accent"
          helperText="Base total actual"
        />
        <AdminStatCard
          title="Clientes con compra"
          value={stats.clientesActivos}
          icon={<UserRoundCheck size={26} />}
          variant="olive"
          helperText="Ya generaron pedidos"
        />
        <AdminStatCard
          title="Pedidos históricos"
          value={stats.totalPedidos}
          icon={<ShoppingBag size={26} />}
          variant="slate"
          helperText="Movimientos acumulados"
        />
        <AdminStatCard
          title="Gasto total"
          value={formatMoney(stats.totalGastado)}
          icon={<Wallet size={26} />}
          variant="amber"
          helperText="Ingresos asociados a clientes"
        />
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "var(--adm-grid-two)",
          gap: 18,
        }}
      >
        <AdminSectionCard
          title="Filtro de consulta"
          subtitle="Busca rápido por nombre, correo o teléfono."
        >
          <div style={{ display: "grid", gap: 14 }}>
            <AdminSearchBar
              value={filters?.search || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              onClear={() => onSearchChange("")}
              placeholder="Buscar por nombre, correo o teléfono..."
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "var(--adm-grid-three)",
                gap: 12,
              }}
            >
              <MetricMini
                label="Clientes sin compra"
                value={totalSinCompra}
                tone="accent"
              />
              <MetricMini
                label="Ticket general"
                value={formatMoney(ticketGeneral)}
                tone="olive"
              />
              <MetricMini
                label="Resultado actual"
                value={`${rows.length} filas`}
                tone="slate"
              />
            </div>
          </div>
        </AdminSectionCard>

        <AdminSectionCard
          title="Clientes más valiosos"
          subtitle="Te ayuda a explicar concentración de compra y retención."
          tone="soft"
        >
          <div style={{ display: "grid", gap: 14 }}>
            {topClientes.length ? (
              topClientes.map((cliente) => (
                <RankBar
                  key={cliente.id}
                  label={cliente.nombreCompleto || cliente.email || "Cliente"}
                  value={Number(cliente.total_gastado || 0)}
                  max={maxTop}
                  helper={`${Number(cliente.total_pedidos || 0)} pedidos`}
                />
              ))
            ) : (
              <div style={{ color: adminTheme.muted, fontWeight: 700 }}>
                No hay compras registradas todavía.
              </div>
            )}
          </div>
        </AdminSectionCard>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "var(--adm-grid-two)",
          gap: 18,
        }}
      >
        <AdminSectionCard
          title="Listado de clientes"
          subtitle="Más limpio que una tabla rígida: ves contacto, gasto, frecuencia y últimas fechas sin perder jerarquía visual."
        >
          {!rows.length ? (
            <EmptyState
              icon="🔎"
              title="No se encontraron clientes"
              description="No hay coincidencias con la búsqueda actual."
              tone="soft"
            />
          ) : (
            <div style={{ display: "grid", gap: 14 }}>
              {rows.map((cliente) => {
                const totalPedidos = Number(cliente.total_pedidos || 0);
                const totalGastado = Number(cliente.total_gastado || 0);
                const ticket =
                  totalPedidos > 0 ? totalGastado / totalPedidos : 0;

                return (
                  <article
                    key={cliente.id}
                    style={{
                      borderRadius: 22,
                      border: `1px solid ${adminTheme.border}`,
                      background: adminTheme.card,
                      boxShadow: adminTheme.shadowSoft,
                      padding: 18,
                      display: "grid",
                      gap: 16,
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "auto minmax(0, 1fr) minmax(140px, auto)",
                        gap: 14,
                        alignItems: "start",
                      }}
                    >
                      <div
                        style={{
                          width: 54,
                          height: 54,
                          borderRadius: 18,
                          background: adminTheme.accentSoft,
                          color: adminTheme.accent,
                          display: "grid",
                          placeItems: "center",
                          fontWeight: 950,
                          fontSize: 18,
                          border: `1px solid ${adminTheme.border}`,
                        }}
                      >
                        {initialsFromName(cliente.nombreCompleto)}
                      </div>

                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            flexWrap: "wrap",
                          }}
                        >
                          <h3
                            style={{
                              margin: 0,
                              fontSize: 18,
                              fontWeight: 900,
                              color: adminTheme.text,
                            }}
                          >
                            {cliente.nombreCompleto || "Cliente"}
                          </h3>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "6px 10px",
                              borderRadius: 999,
                              background:
                                totalPedidos > 0
                                  ? adminTheme.successSoft
                                  : adminTheme.warningSoft,
                              color:
                                totalPedidos > 0
                                  ? adminTheme.success
                                  : adminTheme.warning,
                              fontWeight: 800,
                              fontSize: 12,
                            }}
                          >
                            {totalPedidos > 0 ? "Con historial" : "Sin pedidos"}
                          </span>
                        </div>

                        <div
                          style={{
                            marginTop: 10,
                            display: "grid",
                            gridTemplateColumns: "var(--adm-grid-two-even)",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              color: adminTheme.muted,
                              fontWeight: 700,
                            }}
                          >
                            <Mail size={15} />
                            <span>{cliente.email || "Sin correo"}</span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              color: adminTheme.muted,
                              fontWeight: 700,
                            }}
                          >
                            <Phone size={15} />
                            <span>{cliente.telefono || "Sin teléfono"}</span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              color: adminTheme.muted,
                              fontWeight: 700,
                            }}
                          >
                            <CalendarDays size={15} />
                            <span>Alta: {formatDate(cliente.created_at)}</span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              color: adminTheme.muted,
                              fontWeight: 700,
                            }}
                          >
                            <ReceiptText size={15} />
                            <span>
                              Último pedido: {formatDate(cliente.ultimo_pedido)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: "right", minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 12,
                            color: adminTheme.muted,
                            fontWeight: 800,
                            textTransform: "uppercase",
                            letterSpacing: ".04em",
                          }}
                        >
                          Gasto total
                        </div>
                        <div
                          style={{
                            fontSize: 24,
                            fontWeight: 950,
                            color: adminTheme.text,
                          }}
                        >
                          {formatMoney(totalGastado)}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "var(--adm-grid-three)",
                        gap: 12,
                      }}
                    >
                      <MetricMini
                        label="Pedidos"
                        value={totalPedidos}
                        tone="accent"
                      />
                      <MetricMini
                        label="Ticket promedio"
                        value={formatMoney(ticket)}
                        tone="olive"
                      />
                      <MetricMini
                        label="Perfil"
                        value={cliente.activo !== false ? "Activo" : "Inactivo"}
                        tone="slate"
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </AdminSectionCard>

        <AdminSectionCard
          title="Altas recientes"
          subtitle="Sirve para mostrar crecimiento reciente de la base de clientes."
          tone="soft"
        >
          <div style={{ display: "grid", gap: 12 }}>
            {recentClients.length ? (
              recentClients.map((cliente) => (
                <div
                  key={cliente.id}
                  style={{
                    padding: 14,
                    borderRadius: 18,
                    background: adminTheme.card,
                    border: `1px solid ${adminTheme.border}`,
                  }}
                >
                  <div style={{ fontWeight: 900, color: adminTheme.text }}>
                    {cliente.nombreCompleto || cliente.email || "Cliente"}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      color: adminTheme.muted,
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    Registro: {formatDate(cliente.created_at)}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      color: adminTheme.muted,
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    {cliente.email || "Sin correo"}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: adminTheme.muted, fontWeight: 700 }}>
                Aún no hay registros recientes para mostrar.
              </div>
            )}
          </div>
        </AdminSectionCard>
      </section>
    </div>
  );
}
