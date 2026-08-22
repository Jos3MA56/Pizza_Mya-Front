import Button from "../../../components/ui/Button.jsx";

export default function CajeroPedidosHeader({
  estadoOptions,
  filtro,
  setFiltro,
  search,
  setSearch,
  orden,
  setOrden,
  pageSize,
  setPageSize,
  onRefresh,
  loading,
  resumen,
}) {
  return (
    <div style={styles.header}>
      <div>
        <h1 style={styles.title}>Pedidos de Cajero</h1>
        <p style={styles.subtitle}>
          Monitorea tiempos, filtra por estado y procesa pagos.
        </p>
      </div>

      <div style={styles.actions}>
        <input
          style={{ ...styles.select, minWidth: 230 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por folio, cliente o teléfono"
        />
        <select
          style={styles.select}
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        >
          {estadoOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <select
          style={styles.select}
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
        >
          <option value="recientes">Más recientes</option>
          <option value="antiguos">Más antiguos</option>
          <option value="tiempo">Mayor tiempo</option>
        </select>

        <select
          style={styles.select}
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
        >
          {[8, 12, 20, 30].map((size) => (
            <option key={size} value={size}>
              {size} por página
            </option>
          ))}
        </select>

        <Button
          variant="secondary"
          onClick={() => onRefresh(false)}
          loading={loading}
          loadingText="Actualizando..."
        >
          Actualizar
        </Button>
      </div>

      {resumen ? (
        <div style={styles.summaryRow}>
          <div style={styles.summaryChip}>Activos: {resumen.activos}</div>
          <div style={styles.summaryChip}>Pendientes: {resumen.pendientes}</div>
          <div style={styles.summaryChip}>Entregados: {resumen.entregados}</div>
          <div style={styles.summaryChip}>Total filtrado: {resumen.total}</div>
        </div>
      ) : null}
    </div>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  title: { margin: 0, fontSize: 30, fontWeight: 900, color: "#111827" },
  subtitle: { margin: "6px 0 0", color: "#64748b", fontSize: 14 },
  actions: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },
  summaryRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
  },
  summaryChip: {
    padding: "10px 12px",
    borderRadius: 999,
    background: "#fff",
    border: "1px solid #e2e8f0",
    fontWeight: 800,
    color: "#0f172a",
  },
  select: {
    height: 44,
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    padding: "0 14px",
    fontFamily: "inherit",
    background: "#fff",
  },
};
