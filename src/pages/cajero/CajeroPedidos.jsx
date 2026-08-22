import Loader from "../../components/ui/Loader.jsx";
import CajeroPedidoDetalleModal from "./cajero-pedidos/CajeroPedidoDetalleModal.jsx";
import CajeroPedidosCalendar from "./cajero-pedidos/CajeroPedidosCalendar.jsx";
import CajeroPedidosHeader from "./cajero-pedidos/CajeroPedidosHeader.jsx";
import CajeroPedidosList from "./cajero-pedidos/CajeroPedidosList.jsx";
import { useCajeroPedidos } from "./cajero-pedidos/useCajeroPedidos.js";

export default function CajeroPedidos() {
  const pedidos = useCajeroPedidos();

  return (
    <div style={styles.page}>
      <CajeroPedidosHeader
        estadoOptions={pedidos.estadoOptions}
        filtro={pedidos.filtro}
        setFiltro={pedidos.setFiltro}
        search={pedidos.search}
        setSearch={pedidos.setSearch}
        resumen={{
          activos: pedidos.pedidos.filter(
            (item) =>
              !["ENTREGADO", "CANCELADO"].includes(
                item.estadoNormalizado || item.estatus || item.estado,
              ),
          ).length,
          pendientes: pedidos.pedidos.filter(
            (item) =>
              (item.estadoNormalizado || item.estatus || item.estado) ===
              "PENDIENTE",
          ).length,
          entregados: pedidos.pedidos.filter(
            (item) =>
              (item.estadoNormalizado || item.estatus || item.estado) ===
              "ENTREGADO",
          ).length,
          total: pedidos.pedidosFiltrados.length,
        }}
        orden={pedidos.orden}
        setOrden={pedidos.setOrden}
        pageSize={pedidos.pageSize}
        setPageSize={pedidos.setPageSize}
        onRefresh={pedidos.loadPedidos}
        loading={pedidos.loading && pedidos.pedidos.length > 0}
      />

      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <CajeroPedidosCalendar
            calendarMonth={pedidos.calendarMonth}
            setCalendarMonth={pedidos.setCalendarMonth}
            calendarDays={pedidos.calendarDays}
            fechaFiltro={pedidos.fechaFiltro}
            setFechaFiltro={pedidos.setFechaFiltro}
          />
        </aside>

        <section style={styles.content}>
          {pedidos.error ? (
            <div style={styles.error}>{pedidos.error}</div>
          ) : null}
          {pedidos.success ? (
            <div style={styles.success}>{pedidos.success}</div>
          ) : null}

          {pedidos.loading && pedidos.pedidos.length === 0 ? (
            <Loader text="Cargando pedidos..." />
          ) : (
            <CajeroPedidosList
              items={pedidos.pedidosPagina}
              filtro={pedidos.filtro}
              search={pedidos.search}
              onOpen={pedidos.verDetalle}
              page={pedidos.pageSafe}
              totalPages={pedidos.totalPages}
              setPage={pedidos.setPage}
              start={pedidos.start}
              end={pedidos.end}
              total={pedidos.pedidosFiltrados.length}
            />
          )}
        </section>
      </div>

      <CajeroPedidoDetalleModal
        open={pedidos.mostrarDetalle}
        pedido={pedidos.pedidoSeleccionado}
        onClose={pedidos.cerrarModal}
        onPagar={pedidos.procesarPago}
        loading={pedidos.procesandoPago}
      />
    </div>
  );
}

const styles = {
  page: { display: "flex", flexDirection: "column", gap: 20, minHeight: 0 },
  layout: {
    display: "grid",
    gridTemplateColumns: "340px minmax(0, 1fr)",
    gap: 20,
    alignItems: "start",
  },
  sidebar: { minWidth: 0 },
  content: { minWidth: 0, display: "flex", flexDirection: "column", gap: 16 },
  error: {
    padding: 14,
    borderRadius: 14,
    background: "#ffe5e5",
    color: "#b00020",
    fontWeight: 700,
  },
  success: {
    padding: 14,
    borderRadius: 14,
    background: "#ddffe8",
    color: "#0a7a34",
    fontWeight: 700,
  },
};
