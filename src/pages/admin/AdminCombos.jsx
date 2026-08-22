import {
  Gift,
  Ticket,
  PauseCircle,
  CircleDollarSign,
  Image as ImageIcon,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../components/ui/ToastProvider.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Loader from "../../components/ui/Loader.jsx";
import ConfirmModal from "../../components/ui/ConfirmModal.jsx";
import { useAdminCombos } from "../../hooks/admin/useAdminCombos.js";
import { formatCurrency } from "../../utils/adminCombos.utils.js";
import AdminPageHeader from "../../components/admin/ui/AdminPageHeader.jsx";
import AdminStatCard from "../../components/admin/ui/AdminStatCard.jsx";
import AdminSectionCard from "../../components/admin/ui/AdminSectionCard.jsx";
import { adminTheme } from "../../components/admin/ui/adminTheme.js";
import CombosToolbar from "../../components/admin/combos/CombosToolbar.jsx";
import ComboCard from "../../components/admin/combos/ComboCard.jsx";
import ComboFormModal from "../../components/admin/combos/ComboFormModal.jsx";
import ComboDetailsModal from "../../components/admin/combos/ComboDetailsModal.jsx";

function DayCoverage({ combos = [] }) {
  const labels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const totals = labels.map((label, index) => ({
    label,
    total: combos.filter(
      (combo) => Array.isArray(combo.dias) && combo.dias.includes(index + 1),
    ).length,
  }));
  const max = Math.max(...totals.map((item) => item.total), 1);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {totals.map((item) => (
        <div key={item.label} style={{ display: "grid", gap: 7 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <span style={{ fontWeight: 800, color: adminTheme.text }}>
              {item.label}
            </span>
            <span style={{ fontWeight: 700, color: adminTheme.muted }}>
              {item.total} combo(s)
            </span>
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
                width: `${Math.max(10, (item.total / max) * 100)}%`,
                borderRadius: 999,
                background: adminTheme.accent,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminCombos() {
  const { token } = useAuth();
  const toast = useToast();
  const combos = useAdminCombos({ token, toast });

  const withImage = combos.combos.filter((item) =>
    Boolean(item.imagen_url),
  ).length;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <AdminPageHeader
        title="Combos"
        subtitle="Aquí conviene ver primero qué promociones están activas, cuánto cuestan y qué días cubren. La vista baja ruido y deja el catálogo promocional más presentable."
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
          title="Total combos"
          value={combos.stats.total}
          icon={<Gift size={26} />}
          variant="accent"
          helperText="Promociones registradas"
        />
        <AdminStatCard
          title="Activos"
          value={combos.stats.active}
          icon={<Ticket size={26} />}
          variant="olive"
          helperText="En circulación"
        />
        <AdminStatCard
          title="Inactivos"
          value={combos.stats.inactive}
          icon={<PauseCircle size={26} />}
          variant="rose"
          helperText="Fuera de venta"
        />
        <AdminStatCard
          title="Precio promedio"
          value={formatCurrency(combos.stats.avgPrice)}
          icon={<CircleDollarSign size={26} />}
          variant="amber"
          helperText="Referencia comercial"
        />
      </section>

      <section
        style={{
          display: "grid",
          //gridTemplateColumns: "minmax(0, 1.25fr) minmax(280px, .75fr)",
          gap: 18,
        }}
      >
        <AdminSectionCard
          title="Operación del catálogo promocional"
          subtitle="Busca, filtra y crea combos."
        >
          <CombosToolbar
            filters={combos.filters}
            onChangeFilters={combos.setFilters}
            onCreate={combos.openCreate}
          />
        </AdminSectionCard>
      </section>

      {combos.loading ? <Loader text="Cargando combos..." /> : null}

      {!combos.loading && combos.error ? (
        <EmptyState
          icon="⚠️"
          title="No se pudo cargar la información"
          description={combos.error}
          actionLabel="Reintentar"
          onAction={() => combos.reload()}
        />
      ) : null}

      {!combos.loading && !combos.error && combos.combos.length === 0 ? (
        <EmptyState
          icon="🎁"
          title="Aún no hay combos"
          description="Crea tu primer combo para que la parte promocional del panel se vea viva y útil."
          actionLabel="Crear combo"
          onAction={combos.openCreate}
        />
      ) : null}

      {!combos.loading && !combos.error && combos.combos.length > 0 ? (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "var(--adm-combo-card-grid)",
            gap: 18,
          }}
        >
          {combos.combos.map((combo) => (
            <ComboCard
              key={combo.id}
              combo={combo}
              onView={() => combos.openDetail(combo)}
              onEdit={() => combos.openEdit(combo)}
              onDisable={() => combos.setConfirmDisable(combo)}
              onActivate={() => combos.activateCombo(combo)}
            />
          ))}
        </section>
      ) : null}

      <ComboFormModal
        open={combos.formOpen}
        mode={combos.formMode}
        value={combos.formValue}
        setValue={combos.setFormValue}
        products={combos.products}
        saving={combos.saving}
        token={token}
        onClose={() => combos.setFormOpen(false)}
        onSubmit={combos.saveCombo}
      />

      <ComboDetailsModal
        open={combos.detailOpen}
        combo={combos.selected}
        onClose={() => combos.setDetailOpen(false)}
      />

      <ConfirmModal
        open={Boolean(combos.confirmDisable)}
        title="Desactivar combo"
        message={`¿Seguro que deseas desactivar ${combos.confirmDisable?.nombre || "este combo"}?`}
        onClose={() => combos.setConfirmDisable(null)}
        onConfirm={combos.disableCombo}
        confirmText="Desactivar"
        confirmVariant="danger"
        loading={combos.saving}
      />
    </div>
  );
}
