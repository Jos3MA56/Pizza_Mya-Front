import {
  isSameDay,
  startOfMonth,
  toDateOnlyValue,
} from "./adminPedidos.utils.js";
import {
  adminTheme,
  softPanelStyle,
} from "../../../components/admin/ui/adminTheme.js";

export default function AdminPedidosCalendar({
  calendarMonth,
  setCalendarMonth,
  monthTitle,
  calendarDays,
  today,
  selectedDate,
  setSelectedDate,
  pedidosEnFechaSeleccionada,
}) {
  return (
    <section
      style={softPanelStyle({
        padding: 18,
        background: adminTheme.colors.panel,
      })}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <button
          type="button"
          style={navStyle}
          onClick={() =>
            setCalendarMonth(
              new Date(
                calendarMonth.getFullYear(),
                calendarMonth.getMonth() - 1,
                1,
              ),
            )
          }
        >
          ‹
        </button>
        <div
          style={{
            fontWeight: 900,
            textTransform: "capitalize",
            color: adminTheme.colors.text,
          }}
        >
          {monthTitle}
        </div>
        <button
          type="button"
          style={navStyle}
          onClick={() =>
            setCalendarMonth(
              new Date(
                calendarMonth.getFullYear(),
                calendarMonth.getMonth() + 1,
                1,
              ),
            )
          }
        >
          ›
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 8,
          marginBottom: 8,
        }}
      >
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
          <div
            key={day}
            style={{
              textAlign: "center",
              fontSize: 12,
              color: adminTheme.colors.textMuted,
              fontWeight: 700,
            }}
          >
            {day}
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 8,
        }}
      >
        {calendarDays.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} />;
          const selected = selectedDate && isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);

          return (
            <button
              key={toDateOnlyValue(date)}
              type="button"
              style={{
                minHeight: 42,
                borderRadius: 12,
                border: `1px solid ${selected ? adminTheme.colors.primary : isToday ? adminTheme.colors.accent : adminTheme.colors.border}`,
                background: selected ? adminTheme.colors.primary : "#fff",
                color: selected ? "#fff" : adminTheme.colors.text,
                cursor: "pointer",
                fontWeight: 800,
              }}
              onClick={() => setSelectedDate(date)}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <div
        style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}
      >
        <button
          type="button"
          style={secondaryButtonStyle}
          onClick={() => {
            const now = new Date();
            setSelectedDate(now);
            setCalendarMonth(startOfMonth(now));
          }}
        >
          Hoy
        </button>
        <button
          type="button"
          style={secondaryButtonStyle}
          onClick={() => setSelectedDate(null)}
        >
          Limpiar
        </button>
      </div>

      <div
        style={{
          marginTop: 14,
          color: adminTheme.colors.textSoft,
          fontSize: 13,
          lineHeight: 1.55,
        }}
      >
        {selectedDate ? (
          <>
            Mostrando pedidos del{" "}
            <b>
              {selectedDate.toLocaleDateString("es-MX", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </b>
            <br />
            Pedidos en esa fecha: <b>{pedidosEnFechaSeleccionada}</b>
          </>
        ) : (
          <>Mostrando todas las fechas</>
        )}
      </div>
    </section>
  );
}

const navStyle = {
  width: 40,
  height: 40,
  borderRadius: 12,
  border: `1px solid ${adminTheme.colors.border}`,
  background: "#fff",
  cursor: "pointer",
  color: adminTheme.colors.text,
  fontWeight: 900,
};

const secondaryButtonStyle = {
  minHeight: 38,
  padding: "0 14px",
  borderRadius: 12,
  border: `1px solid ${adminTheme.colors.borderStrong}`,
  background: "#fff",
  cursor: "pointer",
  color: adminTheme.colors.text,
  fontWeight: 800,
};
