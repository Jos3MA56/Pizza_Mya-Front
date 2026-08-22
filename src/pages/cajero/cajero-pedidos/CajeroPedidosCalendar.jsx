import Button from "../../../components/ui/Button.jsx";
import { toLocalDateString } from "./cajeroPedidos.utils.js";

export default function CajeroPedidosCalendar({
  calendarMonth,
  setCalendarMonth,
  calendarDays,
  fechaFiltro,
  setFechaFiltro,
}) {
  const monthLabel = calendarMonth.toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  });

  const fechaFiltroLabel = fechaFiltro
    ? new Date(`${fechaFiltro}T00:00:00`).toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Todas las fechas";

  return (
    <div style={styles.card}>
      <div style={styles.head}>
        <button type="button" style={styles.nav} onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}>
          ‹
        </button>
        <div style={styles.month}>{monthLabel}</div>
        <button type="button" style={styles.nav} onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}>
          ›
        </button>
      </div>

      <div style={styles.weekdays}>
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
          <div key={d} style={styles.weekday}>{d}</div>
        ))}
      </div>

      <div style={styles.grid}>
        {calendarDays.map((item, idx) => {
          const hoy = toLocalDateString(new Date());
          if (!item) return <div key={`empty-${idx}`} />;
          const active = fechaFiltro === item.value;
          const today = hoy === item.value;

          return (
            <button
              key={item.value}
              type="button"
              style={{
                ...styles.day,
                ...(today ? styles.today : null),
                ...(active ? styles.active : null),
              }}
              onClick={() => setFechaFiltro(item.value)}
            >
              {item.day}
            </button>
          );
        })}
      </div>

      <div style={styles.footer}>
        <Button
          variant="secondary"
          onClick={() => {
            const now = new Date();
            setFechaFiltro(toLocalDateString(now));
            setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1));
          }}
        >
          Hoy
        </Button>

        <Button variant="secondary" onClick={() => setFechaFiltro("")} disabled={!fechaFiltro}>
          Limpiar
        </Button>
      </div>

      <div style={styles.info}>
        {fechaFiltro ? `Fecha seleccionada: ${fechaFiltroLabel}` : "Mostrando todas las fechas"}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 20,
    padding: 18,
    boxShadow: "0 8px 30px rgba(15,23,42,0.06)",
  },
  head: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  month: { fontWeight: 800, textTransform: "capitalize", color: "#0f172a" },
  nav: { width: 40, height: 40, borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer" },
  weekdays: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginBottom: 8 },
  weekday: { textAlign: "center", fontSize: 12, color: "#64748b", fontWeight: 700 },
  grid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 },
  day: { minHeight: 42, borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: 800 },
  today: { border: "1px solid #fecaca" },
  active: { background: "#e50914", color: "#fff", border: "1px solid #e50914" },
  footer: { display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" },
  info: { marginTop: 14, fontSize: 13, color: "#64748b", lineHeight: 1.5 },
};
