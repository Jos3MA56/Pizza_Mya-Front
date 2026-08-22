import Button from "../../../components/ui/Button.jsx";
import {
  formatEstadoLabel,
  getEstadoColor,
  money,
  toneStyle,
} from "./cajeroPedidos.utils.js";

function emptyText(filtro, search) {
  if (search) return "No encontramos pedidos con ese término de búsqueda.";
  if (filtro !== "TODOS") return "No hay pedidos para el estado seleccionado.";
  return "Todavía no hay pedidos para mostrar.";
}

export default function CajeroPedidosList({
  items,
  filtro,
  onOpen,
  search,
  page,
  totalPages,
  setPage,
  start,
  end,
  total,
}) {
  if (!items.length) {
    return (
      <div style={styles.emptyWrap}>
        <div style={styles.emptyCard}>
          <h3 style={{ margin: 0 }}>Sin resultados</h3>
          <p style={{ margin: "8px 0 0", color: "#64748b" }}>
            {emptyText(filtro, search)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.grid}>
        {items.map((pedido) => {
          const estadoColor = getEstadoColor(pedido.estadoNormalizado);
          const timerTone = toneStyle(pedido.elapsed.tone);

          return (
            <div
              key={pedido.id}
              style={styles.card}
              onClick={() => onOpen(pedido.id)}
            >
              <div style={styles.cardHead}>
                <div>
                  <h3 style={styles.folio}>
                    {pedido.folio || `Pedido #${pedido.id}`}
                  </h3>
                  <div style={styles.metaMuted}>
                    {pedido.createdAt
                      ? new Date(pedido.createdAt).toLocaleString("es-MX")
                      : "Sin fecha"}
                  </div>
                </div>

                <div style={styles.badges}>
                  <span
                    style={{
                      ...styles.badge,
                      background: estadoColor.bg,
                      color: estadoColor.text,
                    }}
                  >
                    {formatEstadoLabel(pedido.estadoNormalizado)}
                  </span>
                  <span
                    style={{
                      ...styles.badge,
                      background: timerTone.bg,
                      color: timerTone.text,
                    }}
                  >
                    {pedido.elapsed.label}
                  </span>
                </div>
              </div>

              <div style={styles.infoGrid}>
                <div>
                  <div style={styles.label}>Cliente</div>
                  <div style={styles.value}>
                    {pedido.cliente?.nombre_completo ||
                      pedido.nombre_cliente ||
                      "Mostrador"}
                  </div>
                </div>
                <div>
                  <div style={styles.label}>Total</div>
                  <div style={styles.value}>{money(pedido.total)}</div>
                </div>
                <div>
                  <div style={styles.label}>Tipo</div>
                  <div style={styles.value}>
                    {pedido.tipo_entrega || pedido.metodo_entrega || "—"}
                  </div>
                </div>
                <div>
                  <div style={styles.label}>Pago</div>
                  <div style={styles.value}>
                    {pedido.metodo_pago ||
                      pedido.metodo_pago_nombre ||
                      "Pendiente"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={styles.pagination}>
        <div style={styles.pageInfo}>
          Mostrando {total ? start + 1 : 0}–{end} de {total}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Button
            variant="secondary"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1}
          >
            Anterior
          </Button>
          <div style={styles.pageChip}>
            Página {page} de {totalPages}
          </div>
          <Button
            variant="secondary"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: { display: "flex", flexDirection: "column", gap: 16, minHeight: 0 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 16,
  },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 20,
    padding: 18,
    cursor: "pointer",
    boxShadow: "0 8px 30px rgba(15,23,42,0.05)",
  },
  cardHead: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    alignItems: "flex-start",
    marginBottom: 16,
  },
  folio: { margin: 0, fontSize: 18, color: "#0f172a" },
  metaMuted: { marginTop: 6, color: "#64748b", fontSize: 12 },
  badges: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  badge: {
    padding: "8px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
  },
  label: { fontSize: 12, color: "#64748b", marginBottom: 4, fontWeight: 700 },
  value: { fontSize: 14, color: "#0f172a", fontWeight: 700 },
  emptyWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 220,
  },
  emptyCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 20,
    padding: 30,
    textAlign: "center",
    width: "100%",
  },
  pagination: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  pageInfo: { color: "#64748b", fontSize: 14 },
  pageChip: {
    height: 44,
    display: "grid",
    placeItems: "center",
    padding: "0 14px",
    borderRadius: 12,
    background: "#fff",
    border: "1px solid #e2e8f0",
    fontWeight: 800,
  },
};
