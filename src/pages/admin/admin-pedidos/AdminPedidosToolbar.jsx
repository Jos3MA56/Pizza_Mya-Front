import AdminButton from "../../../components/admin/ui/AdminButton.jsx";
import {
  adminTheme,
  inputStyle,
  softPanelStyle,
} from "../../../components/admin/ui/adminTheme.js";

function toDateInputValue(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function statusLabel(status) {
  if (status === "TODOS") {
    return "Todos los estados";
  }

  return status.replaceAll("_", " ");
}

export default function AdminPedidosToolbar({
  q,
  setQ,
  tab,
  setTab,
  orden,
  setOrden,
  pageSize,
  setPageSize,
  tabs,
  selectedDate,
  setSelectedDate,
  onRefresh,
  onExport,
  loading,
}) {
  const selectedDateValue = toDateInputValue(selectedDate);

  function handleDateChange(event) {
    const value = event.target.value;

    if (!value) {
      setSelectedDate(null);
      return;
    }

    setSelectedDate(new Date(`${value}T00:00:00`));
  }

  return (
    <section
      style={softPanelStyle({
        padding: 18,
        background: adminTheme.colors.panel,
      })}
    >
      <style>{`
        .admin-orders-toolbar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .admin-orders-toolbar-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .admin-orders-toolbar-filters {
          display: grid;
          grid-template-columns:
            minmax(260px, 1.7fr)
            repeat(4, minmax(145px, 0.75fr));
          gap: 12px;
          margin-top: 18px;
          align-items: center;
        }

        .admin-orders-toolbar-filters > * {
          min-width: 0;
          width: 100%;
        }

        @media (max-width: 1180px) {
          .admin-orders-toolbar-filters {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .admin-orders-search {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 640px) {
          .admin-orders-toolbar-header {
            align-items: stretch;
          }

          .admin-orders-toolbar-actions {
            display: grid;
            grid-template-columns: 1fr;
            width: 100%;
          }

          .admin-orders-toolbar-actions button {
            width: 100%;
          }

          .admin-orders-toolbar-filters {
            grid-template-columns: 1fr;
          }

          .admin-orders-search {
            grid-column: auto;
          }
        }
      `}</style>

      <div className="admin-orders-toolbar-header">
        <div>
          <h3
            style={{
              margin: 0,
              color: adminTheme.colors.text,
              fontWeight: 900,
            }}
          >
            Contenido de pedidos
          </h3>

          <div
            style={{
              marginTop: 6,
              color: adminTheme.colors.textSoft,
              fontSize: 14,
            }}
          >
            Busca y filtra los pedidos por estado, fecha y orden.
          </div>
        </div>

        <div className="admin-orders-toolbar-actions">
          <AdminButton
            variant="secondary"
            onClick={() => onRefresh(true)}
            loading={loading}
            loadingText="Actualizando..."
          >
            Actualizar
          </AdminButton>

          <AdminButton
            variant="secondary"
            onClick={onExport}
          >
            Exportar CSV
          </AdminButton>
        </div>
      </div>

      <div className="admin-orders-toolbar-filters">
        <input
          className="admin-orders-search"
          style={inputStyle()}
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Buscar por folio, cliente, dirección o producto..."
        />

        <select
          style={inputStyle()}
          value={tab}
          onChange={(event) => setTab(event.target.value)}
          title="Filtrar por estado"
        >
          {tabs.map((status) => (
            <option
              key={status}
              value={status}
            >
              {statusLabel(status)}
            </option>
          ))}
        </select>

        <select
          style={inputStyle()}
          value={orden}
          onChange={(event) => setOrden(event.target.value)}
          title="Ordenar pedidos"
        >
          <option value="recientes">Más recientes</option>
          <option value="antiguos">Más antiguos</option>
          <option value="tiempo">Mayor tiempo</option>
          <option value="monto">Mayor monto</option>
        </select>

        <input
          type="date"
          style={inputStyle()}
          value={selectedDateValue}
          onChange={handleDateChange}
          title="Filtrar por fecha"
        />

        <select
          style={inputStyle()}
          value={pageSize}
          onChange={(event) =>
            setPageSize(Number(event.target.value))
          }
          title="Resultados por página"
        >
          {[10, 20, 30, 50].map((size) => (
            <option
              key={size}
              value={size}
            >
              {size} por página
            </option>
          ))}
        </select>
      </div>

      {selectedDateValue ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 14,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              color: adminTheme.colors.textSoft,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Fecha seleccionada:
          </span>

          <span
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              background: "#fff7ed",
              color: "#9a3412",
              border: "1px solid #fed7aa",
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            {selectedDate.toLocaleDateString("es-MX")}
          </span>

          <button
            type="button"
            onClick={() => setSelectedDate(null)}
            style={{
              minHeight: 32,
              padding: "0 11px",
              borderRadius: 999,
              border: `1px solid ${adminTheme.colors.borderStrong}`,
              background: "#ffffff",
              color: adminTheme.colors.text,
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Limpiar fecha
          </button>
        </div>
      ) : null}
    </section>
  );
}
