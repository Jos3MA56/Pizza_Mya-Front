// src/pages/cajero/CajeroCorte.jsx
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { cajeroApi } from "../../api/cajero.api.js";

export default function CajeroCorte() {
  const { token } = useAuth();

  const [pedidos, setPedidos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [tablas, setTablas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [backing, setBacking] = useState(false);
  const [msg, setMsg] = useState(null);

  const showMsg = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 4000);
  };

  const fetchData = useCallback(async () => {
    try {
      const [peds, hist, tabs] = await Promise.all([
        cajeroApi.getPedidos({ token }),
        cajeroApi.listFilesHistory(token, 30),
        cajeroApi.listBackupTables(token),
      ]);
      setPedidos(Array.isArray(peds) ? peds : []);
      setHistorial(Array.isArray(hist) ? hist : []);
      setTablas(Array.isArray(tabs) ? tabs : []);
      setError(null);
    } catch (e) {
      setError(e?.message || "Error al cargar datos del corte");
    }
  }, [token]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    })();
  }, [fetchData]);

  // ─── Estadísticas del día (calculadas client-side a partir de pedidos) ──────
  const hoy = new Date().toDateString();
  const pedidosHoy = pedidos.filter(
    (p) => new Date(p.created_at).toDateString() === hoy,
  );
  const entregados = pedidosHoy.filter((p) => p.estatus === "ENTREGADO");
  const cancelados = pedidosHoy.filter((p) => p.estatus === "CANCELADO");
  const activos = pedidosHoy.filter(
    (p) => !["ENTREGADO", "CANCELADO"].includes(p.estatus),
  );

  const totalVentas = entregados.reduce(
    (acc, p) => acc + Number(p.total || 0),
    0,
  );
  const ticketPromedio =
    entregados.length > 0 ? totalVentas / entregados.length : 0;
  const totalPedidosHoy = pedidosHoy.length;

  // ─── Desglose por método de pago ──────────────────────────────────────────
  const porMetodo = {};
  for (const p of entregados) {
    const key = p.metodo_pago?.nombre ?? p.metodo_pago ?? "Sin registrar";
    porMetodo[key] = (porMetodo[key] || 0) + Number(p.total || 0);
  }

  const handleExportFull = async () => {
    setExporting(true);
    try {
      await cajeroApi.exportFull(token);
      await fetchData();
      showMsg("Exportación completa generada");
    } catch (e) {
      showMsg(e?.message || "Error al exportar", "error");
    } finally {
      setExporting(false);
    }
  };

  const handleBackupFull = async () => {
    setBacking(true);
    try {
      await cajeroApi.backupFull(token);
      await fetchData();
      showMsg("Respaldo completo generado");
    } catch (e) {
      showMsg(e?.message || "Error al generar respaldo", "error");
    } finally {
      setBacking(false);
    }
  };

  const handleDownload = async (item) => {
    try {
      const { ticket } = await cajeroApi.createFileDownloadTicket(
        token,
        item.id,
      );
      const url = cajeroApi.getFileDownloadUrl(item.id, ticket);
      const a = document.createElement("a");
      a.href = url;
      a.download = item.nombre_archivo || `archivo-${item.id}`;
      a.click();
    } catch (e) {
      showMsg(e?.message || "No se pudo descargar el archivo", "error");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          color: "#94a3b8",
          fontWeight: 700,
        }}
      >
        Cargando datos del corte…
      </div>
    );
  }

  return (
    <>
      <style>{`
                .corte-wrap { max-width: 1100px; margin: 0 auto; padding: 28px 24px 48px; }
                .corte-title { font-size: 26px; font-weight: 900; color: #111; margin: 0 0 6px; }
                .corte-sub { color: #64748b; margin: 0 0 24px; font-size: 14px; }
                .corte-msg { padding: 12px 16px; border-radius: 8px; font-weight: 700; margin-bottom: 16px; font-size: 14px; }
                .corte-msg.success { background: #d1fae5; color: #065f46; }
                .corte-msg.error   { background: #fee2e2; color: #b91c1c; }
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 28px; }
                .stat-card { background: #fff; border-radius: 14px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.07); border: 1px solid #e5e7eb; text-align: center; }
                .stat-value { font-size: 30px; font-weight: 900; color: #111; }
                .stat-label { font-size: 12px; color: #64748b; margin-top: 4px; font-weight: 600; }
                .section { background: #fff; border-radius: 14px; padding: 22px; box-shadow: 0 4px 12px rgba(0,0,0,0.07); margin-bottom: 22px; border: 1px solid #e5e7eb; }
                .section-title { font-size: 16px; font-weight: 900; color: #111; margin: 0 0 16px; }
                .acc-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
                .acc-row:last-child { border-bottom: none; }
                .acc-total { font-size: 20px; font-weight: 900; display: flex; justify-content: space-between; margin-top: 14px; padding-top: 14px; border-top: 2px solid #e5e7eb; }
                .actions-row { display: flex; gap: 12px; flex-wrap: wrap; }
                .btn-export { padding: 11px 22px; border: none; border-radius: 10px; font-weight: 900; font-size: 13px; cursor: pointer; }
                .btn-export.primary { background: #111; color: #fff; }
                .btn-export.secondary { background: #f1f5f9; color: #111; }
                .btn-export:disabled { opacity: 0.5; cursor: not-allowed; }
                .hist-table { width: 100%; border-collapse: collapse; font-size: 13px; }
                .hist-table th { text-align: left; padding: 8px 10px; background: #f8fafc; font-weight: 700; color: #64748b; font-size: 11px; text-transform: uppercase; }
                .hist-table td { padding: 10px; border-bottom: 1px solid #f1f5f9; color: #111; }
                .hist-table tr:last-child td { border-bottom: none; }
                .btn-dl { padding: 5px 12px; background: #dbeafe; color: #1e40af; border: none; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; }
                .btn-dl:hover { background: #bfdbfe; }
                .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; }
                .badge-export { background: #ede9fe; color: #5b21b6; }
                .badge-backup { background: #d1fae5; color: #065f46; }
            `}</style>

      <div className="corte-wrap">
        <h1 className="corte-title">Corte de Caja</h1>
        <p className="corte-sub">
          {new Date().toLocaleDateString("es-MX", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        {error && <div className="corte-msg error">{error}</div>}
        {msg && <div className={`corte-msg ${msg.type}`}>{msg.text}</div>}

        {/* Estadísticas del día */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value" style={{ color: "#10b981" }}>
              ${totalVentas.toFixed(2)}
            </div>
            <div className="stat-label">Total de ventas hoy</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalPedidosHoy}</div>
            <div className="stat-label">Pedidos del día</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: "#10b981" }}>
              {entregados.length}
            </div>
            <div className="stat-label">Entregados</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: "#f59e0b" }}>
              {activos.length}
            </div>
            <div className="stat-label">En proceso</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: "#ef4444" }}>
              {cancelados.length}
            </div>
            <div className="stat-label">Cancelados</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">${ticketPromedio.toFixed(2)}</div>
            <div className="stat-label">Ticket promedio</div>
          </div>
        </div>

        {/* Desglose por método de pago */}
        <div className="section">
          <h2 className="section-title">Desglose por método de pago</h2>
          {Object.keys(porMetodo).length === 0 ? (
            <p style={{ color: "#94a3b8", fontWeight: 700 }}>
              Sin ventas registradas hoy.
            </p>
          ) : (
            <>
              {Object.entries(porMetodo).map(([metodo, monto]) => (
                <div className="acc-row" key={metodo}>
                  <span>{metodo}</span>
                  <span style={{ fontWeight: 700 }}>
                    ${Number(monto).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="acc-total">
                <span>Total</span>
                <span>${totalVentas.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        {/* Acciones de exportación y respaldo */}
        <div className="section">
          <h2 className="section-title">Exportar y respaldar</h2>
          <div className="actions-row">
            <button
              className="btn-export primary"
              onClick={handleExportFull}
              disabled={exporting}
              type="button"
            >
              {exporting ? "Exportando…" : "📤 Exportar datos (CSV)"}
            </button>
            <button
              className="btn-export secondary"
              onClick={handleBackupFull}
              disabled={backing}
              type="button"
            >
              {backing ? "Respaldando…" : "💾 Respaldo completo (SQL)"}
            </button>
            <button
              className="btn-export secondary"
              onClick={fetchData}
              type="button"
            >
              🔄 Actualizar
            </button>
          </div>
          {tablas.length > 0 && (
            <p style={{ marginTop: 12, fontSize: 13, color: "#64748b" }}>
              {tablas.length} tabla(s) disponible(s) para respaldo selectivo.
            </p>
          )}
        </div>

        {/* Historial de archivos */}
        <div className="section">
          <h2 className="section-title">Historial de archivos</h2>
          {historial.length === 0 ? (
            <p style={{ color: "#94a3b8", fontWeight: 700 }}>
              Sin archivos generados aún.
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="hist-table">
                <thead>
                  <tr>
                    <th>Archivo</th>
                    <th>Tipo</th>
                    <th>Fecha</th>
                    <th>Tamaño</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((item) => (
                    <tr key={item.id}>
                      <td
                        style={{
                          maxWidth: 260,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.nombre_archivo ??
                          item.filename ??
                          `Archivo ${item.id}`}
                      </td>
                      <td>
                        <span
                          className={`badge ${item.tipo === "backup" ? "badge-backup" : "badge-export"}`}
                        >
                          {item.tipo ?? "export"}
                        </span>
                      </td>
                      <td>
                        {new Date(item.created_at).toLocaleString("es-MX", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                      <td>
                        {item.size_bytes
                          ? `${(item.size_bytes / 1024).toFixed(1)} KB`
                          : "—"}
                      </td>
                      <td>
                        <button
                          className="btn-dl"
                          onClick={() => handleDownload(item)}
                          type="button"
                        >
                          ⬇ Descargar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
