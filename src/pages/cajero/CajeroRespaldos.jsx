import { useCallback, useEffect, useMemo, useState } from "react";
import { cajeroApi } from "../../api/cajero.api.js";
import { useAuth } from "../../context/AuthContext.jsx";

const thStyle = {
  textAlign: "left",
  padding: "12px",
  borderBottom: "1px solid #e5e7eb",
  color: "#374151",
  fontWeight: 900,
  fontSize: "13px",
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #f1f5f9",
  color: "#111827",
  verticalAlign: "top",
  fontSize: "14px",
};

function getFormatLabel(item) {
  const formato = String(item?.formato || "").toUpperCase();
  return formato || "-";
}

function formatDateTime(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("es-MX");
  } catch {
    return String(value);
  }
}

function formatBytes(value) {
  const bytes = Number(value || 0);
  if (!bytes || bytes <= 0) return "-";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let index = 0;

  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }

  return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function statusTone(value) {
  return String(value || "").toUpperCase() === "EXITOSO"
    ? { background: "#dcfce7", color: "#166534" }
    : { background: "#fee2e2", color: "#b91c1c" };
}

function getListRestorableApi() {
  if (typeof cajeroApi.listRestorableBackups === "function") {
    return (token, limit) => cajeroApi.listRestorableBackups(token, limit);
  }
  if (typeof cajeroApi.getRestorableBackups === "function") {
    return (token, limit) => cajeroApi.getRestorableBackups(token, limit);
  }
  return null;
}

function getBackupAutomationApi() {
  if (typeof cajeroApi.getBackupAutomation === "function") {
    return (token) => cajeroApi.getBackupAutomation(token);
  }
  if (typeof cajeroApi.getAutoBackupConfig === "function") {
    return (token) => cajeroApi.getAutoBackupConfig(token);
  }
  return null;
}

function getSaveBackupAutomationApi() {
  if (typeof cajeroApi.saveBackupAutomation === "function") {
    return (token, payload) => cajeroApi.saveBackupAutomation(token, payload);
  }
  if (typeof cajeroApi.saveAutoBackupConfig === "function") {
    return (token, payload) => cajeroApi.saveAutoBackupConfig(token, payload);
  }
  return null;
}

function getRestoreBackupApi() {
  if (typeof cajeroApi.restoreBackup === "function") {
    return (token, payload) => cajeroApi.restoreBackup(token, payload);
  }
  if (typeof cajeroApi.restoreBackupFromHistory === "function") {
    return (token, payload) =>
      cajeroApi.restoreBackupFromHistory(token, payload);
  }
  return null;
}

export default function CajeroRespaldos() {
  const { token } = useAuth();

  const [tables, setTables] = useState([]);
  const [selectedBackupTable, setSelectedBackupTable] = useState("");
  const [loadingTables, setLoadingTables] = useState(true);
  const [loadingAction, setLoadingAction] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [history, setHistory] = useState([]);
  const [restorableBackups, setRestorableBackups] = useState([]);
  const [selectedRestoreId, setSelectedRestoreId] = useState("");
  const [restoreTargetDb, setRestoreTargetDb] = useState("pizza_mya_restore");
  const [restoreClean, setRestoreClean] = useState(false);
  const [automation, setAutomation] = useState({
    activo: false,
    frecuencia_horas: 8,
    retencion_dias: 7,
    proxima_ejecucion: null,
    ultima_ejecucion: null,
    ultimo_estado: "PENDIENTE",
    ultimo_detalle: null,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const listRestorableApi = useMemo(() => getListRestorableApi(), []);
  const getAutomationApi = useMemo(() => getBackupAutomationApi(), []);
  const saveAutomationApi = useMemo(() => getSaveBackupAutomationApi(), []);
  const restoreApi = useMemo(() => getRestoreBackupApi(), []);

  const loadTables = useCallback(async () => {
    if (!token) return;

    setLoadingTables(true);

    try {
      const data = await cajeroApi.listBackupTables(token);
      const safeData = Array.isArray(data) ? data : [];
      setTables(safeData);

      if (!selectedBackupTable && safeData.length > 0) {
        setSelectedBackupTable(safeData[0].label);
      }
    } catch (e) {
      setError(e?.message || "No se pudieron cargar las tablas");
    } finally {
      setLoadingTables(false);
    }
  }, [token, selectedBackupTable]);

  const loadHistory = useCallback(async () => {
    if (!token) return;

    setLoadingHistory(true);
    setError("");

    try {
      const historyData = await cajeroApi.listFilesHistory(token, 60);
      const safeHistory = Array.isArray(historyData) ? historyData : [];
      setHistory(safeHistory);

      let restorableData = [];
      if (listRestorableApi) {
        try {
          const result = await listRestorableApi(token, 60);
          restorableData = Array.isArray(result) ? result : [];
        } catch {
          restorableData = [];
        }
      }

      if (!restorableData.length) {
        restorableData = safeHistory.filter(
          (item) =>
            String(item?.tipo_proceso || "").toUpperCase() === "RESPALDO" &&
            String(item?.estado || "").toUpperCase() === "EXITOSO",
        );
      }

      setRestorableBackups(restorableData);

      if (getAutomationApi) {
        try {
          const automationData = await getAutomationApi(token);
          setAutomation((current) => ({
            ...current,
            ...(automationData || {}),
          }));
        } catch {
          // Ignorar si no está disponible o falla
        }
      }

      if (!selectedRestoreId && restorableData.length > 0) {
        setSelectedRestoreId(String(restorableData[0].id));
      }
    } catch (e) {
      console.error(e);
      setError(e?.message || "No se pudo cargar la información del módulo");
    } finally {
      setLoadingHistory(false);
    }
  }, [token, selectedRestoreId, listRestorableApi, getAutomationApi]);

  useEffect(() => {
    loadTables();
    loadHistory();
  }, [loadTables, loadHistory]);

  const backupHistory = useMemo(() => {
    return history.filter(
      (item) => String(item?.tipo_proceso || "").toUpperCase() === "RESPALDO",
    );
  }, [history]);

  const restoreHistory = useMemo(() => {
    return history.filter(
      (item) =>
        String(item?.tipo_proceso || "").toUpperCase() === "RESTAURACION",
    );
  }, [history]);

  const stats = useMemo(() => {
    const successfulBackups = backupHistory.filter(
      (item) => String(item?.estado || "").toUpperCase() === "EXITOSO",
    ).length;

    return {
      respaldos: backupHistory.length,
      respaldosExitosos: successfulBackups,
      restauraciones: restoreHistory.length,
      archivosDisponibles: restorableBackups.length,
    };
  }, [backupHistory, restoreHistory, restorableBackups]);

  const automationNotice = useMemo(() => {
    if (getAutomationApi && saveAutomationApi) return "";
    return "Tu cajero.api.js actual aún no incluye métodos de automatización. La tarjeta se muestra sin romper, pero guardar automatización seguirá deshabilitado hasta agregarlos.";
  }, [getAutomationApi, saveAutomationApi]);

  const restoreNotice = useMemo(() => {
    if (restoreApi) return "";
    return "Tu cajero.api.js actual aún no incluye método de restauración. La lista se muestra, pero el botón de restaurar seguirá deshabilitado hasta agregarlo.";
  }, [restoreApi]);

  const startDownloadFromHistory = async (historyId) => {
    await cajeroApi.downloadHistoryFile(token, historyId, "cajero");
  };

  const handleBackupFull = async () => {
    setLoadingAction("backup-full");
    setError("");
    setSuccess("");

    try {
      await cajeroApi.backupFull(token);
      setSuccess("Respaldo completo generado correctamente.");
      await loadHistory();
    } catch (e) {
      setError(e?.message || "No se pudo generar el respaldo completo");
    } finally {
      setLoadingAction("");
    }
  };

  const handleBackupTable = async () => {
    if (!selectedBackupTable) {
      setError("Debes seleccionar una tabla para respaldar");
      return;
    }

    const [schema, table] = selectedBackupTable.split(".");
    if (!schema || !table) {
      setError("La tabla seleccionada no es válida");
      return;
    }

    setLoadingAction("backup-table");
    setError("");
    setSuccess("");

    try {
      await cajeroApi.backupTable(token, schema, table);
      setSuccess(`Respaldo de "${schema}.${table}" generado correctamente.`);
      await loadHistory();
    } catch (e) {
      setError(e?.message || "No se pudo generar el respaldo por tabla");
    } finally {
      setLoadingAction("");
    }
  };

  const handleDownloadHistory = async (historyId) => {
    setDownloadingId(historyId);
    setError("");

    try {
      await startDownloadFromHistory(historyId);
    } catch (e) {
      setError(e?.message || "No se pudo iniciar la descarga");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleSaveAutomation = async () => {
    if (!saveAutomationApi) {
      setError(
        "Tu cajero.api.js actual no tiene saveBackupAutomation / saveAutoBackupConfig.",
      );
      return;
    }

    setLoadingAction("save-automation");
    setError("");
    setSuccess("");

    try {
      const data = await saveAutomationApi(token, {
        activo: Boolean(automation.activo),
        frecuencia_horas: Number(automation.frecuencia_horas || 8),
        retencion_dias: Number(automation.retencion_dias || 7),
      });

      setAutomation((current) => ({ ...current, ...(data || {}) }));
      setSuccess(
        "Configuración de respaldos automáticos guardada correctamente.",
      );
      await loadHistory();
    } catch (e) {
      setError(e?.message || "No se pudo guardar la automatización");
    } finally {
      setLoadingAction("");
    }
  };

  const handleRestore = async () => {
    if (!restoreApi) {
      setError(
        "Tu cajero.api.js actual no tiene restoreBackup / restoreBackupFromHistory.",
      );
      return;
    }

    if (!selectedRestoreId) {
      setError("Debes seleccionar un respaldo para restaurar");
      return;
    }

    if (!restoreTargetDb.trim()) {
      setError("Debes indicar la base destino para restaurar");
      return;
    }

    setLoadingAction("restore");
    setError("");
    setSuccess("");

    try {
      const result = await restoreApi(token, {
        history_id: Number(selectedRestoreId),
        target_database: restoreTargetDb.trim(),
        clean: restoreClean,
      });

      const conteos = result?.validation?.conteos || {};
      setSuccess(
        `Restauración completada en "${result?.targetDatabase || restoreTargetDb}". Conteos validados: usuarios ${conteos.usuarios ?? "-"}, productos ${conteos.productos ?? "-"}, pedidos ${conteos.pedidos ?? "-"}.`,
      );
      await loadHistory();
    } catch (e) {
      setError(e?.message || "No se pudo restaurar el respaldo");
    } finally {
      setLoadingAction("");
    }
  };

  return (
    <>
      <style>{`
        .db-shell{display:grid;gap:24px;}
        .db-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;}
        .db-grid-3{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;}
        .db-card,.db-history-card,.db-stat{
          background:#fff;border:1px solid #e5e7eb;border-radius:24px;padding:24px;
          box-shadow:0 8px 24px rgba(0,0,0,.06);
        }
        .db-stat{padding:20px;}
        .db-card h2,.db-history-card h3,.db-stat h4{
          margin:0 0 8px;font-weight:900;color:#111827;
        }
        .db-card h2,.db-history-card h3{font-size:22px;}
        .db-stat h4{font-size:14px;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;}
        .db-stat strong{display:block;font-size:30px;color:#111827;}
        .db-card p,.db-history-card p,.db-field-help{
          margin:0;color:#6b7280;line-height:1.5;font-weight:600;
        }
        .db-actions{margin-top:20px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;}
        .db-btn{
          border:none;border-radius:14px;padding:14px 18px;font-weight:900;cursor:pointer;
        }
        .db-btn:disabled{opacity:.65;cursor:not-allowed;}
        .db-btn-primary{background:#E50914;color:#fff;}
        .db-btn-dark{background:#111827;color:#fff;}
        .db-btn-light{background:#fff;color:#111827;border:1px solid #d1d5db;}
        .db-field,.db-select{
          width:100%;margin-top:18px;padding:14px 16px;border-radius:14px;border:1px solid #d1d5db;
          outline:none;font-size:14px;font-weight:700;color:#111827;background:#fff;box-sizing:border-box;
        }
        .db-field:focus,.db-select:focus{border-color:#111827;box-shadow:0 0 0 3px rgba(17,24,39,.08);}
        .db-message{border-radius:16px;padding:14px 16px;font-weight:800;}
        .db-message.error{background:#fef2f2;border:1px solid #fecaca;color:#b91c1c;}
        .db-message.success{background:#ecfdf5;border:1px solid #bbf7d0;color:#166534;}
        .db-badge{display:inline-flex;align-items:center;justify-content:center;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:900;}
        .db-badge.backup{background:#fee2e2;color:#b91c1c;}
        .db-badge.restore{background:#ede9fe;color:#5b21b6;}
        .db-switch{display:flex;align-items:center;gap:10px;margin-top:18px;font-weight:800;color:#111827;}
        .db-switch input{width:18px;height:18px;accent-color:#E50914;}
        .db-inline-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;}
        .db-small{font-size:12px;color:#6b7280;font-weight:700;margin-top:8px;}
        @media (max-width: 1200px){.db-grid-3{grid-template-columns:repeat(2,minmax(0,1fr));}}
        @media (max-width: 980px){.db-grid,.db-inline-grid,.db-grid-3{grid-template-columns:1fr;}}
      `}</style>

      <div className="db-shell">
        {error ? <div className="db-message error">{error}</div> : null}
        {success ? <div className="db-message success">{success}</div> : null}

        <div className="db-grid-3">
          <div className="db-stat">
            <h4>Respaldos</h4>
            <strong>{stats.respaldos}</strong>
            <span className="db-field-help">
              Registros de respaldo en historial.
            </span>
          </div>
          <div className="db-stat">
            <h4>Respaldos exitosos</h4>
            <strong>{stats.respaldosExitosos}</strong>
            <span className="db-field-help">
              Listos para descarga o restauración.
            </span>
          </div>
          <div className="db-stat">
            <h4>Restauraciones</h4>
            <strong>{stats.restauraciones}</strong>
            <span className="db-field-help">
              Intentos registrados desde el módulo.
            </span>
          </div>
          <div className="db-stat">
            <h4>Archivos disponibles</h4>
            <strong>{stats.archivosDisponibles}</strong>
            <span className="db-field-help">
              Respaldos detectados físicamente en servidor.
            </span>
          </div>
        </div>

        <div className="db-grid">
          <section className="db-card">
            <h2>Respaldo completo</h2>
            <p>
              Genera un archivo restaurable de toda la base de datos en formato
              .backup para Pizza Mya.
            </p>

            <div className="db-actions">
              <button
                type="button"
                className="db-btn db-btn-primary"
                onClick={handleBackupFull}
                disabled={Boolean(loadingAction)}
              >
                {loadingAction === "backup-full"
                  ? "Generando respaldo..."
                  : "Respaldar base completa"}
              </button>
            </div>
          </section>

          <section className="db-card">
            <h2>Respaldo por tabla</h2>
            <p>
              Genera un .backup de una tabla específica de los esquemas usados
              por la base actual.
            </p>

            <select
              className="db-select"
              value={selectedBackupTable}
              onChange={(e) => setSelectedBackupTable(e.target.value)}
              disabled={
                loadingTables || Boolean(loadingAction) || tables.length === 0
              }
            >
              {loadingTables ? (
                <option value="">Cargando tablas...</option>
              ) : tables.length === 0 ? (
                <option value="">No hay tablas disponibles</option>
              ) : (
                tables.map((item) => (
                  <option key={`backup-${item.label}`} value={item.label}>
                    {item.label}
                  </option>
                ))
              )}
            </select>

            <div className="db-actions">
              <button
                type="button"
                className="db-btn db-btn-dark"
                onClick={handleBackupTable}
                disabled={!selectedBackupTable || Boolean(loadingAction)}
              >
                {loadingAction === "backup-table"
                  ? "Generando respaldo..."
                  : "Respaldar tabla"}
              </button>
            </div>
          </section>
        </div>

        <div className="db-grid">
          <section className="db-card">
            <h2>Respaldos automáticos</h2>
            <p>
              Programa respaldos completos cada cierto número de horas y define
              la retención automática de archivos antiguos.
            </p>

            <label className="db-switch">
              <input
                type="checkbox"
                checked={Boolean(automation.activo)}
                onChange={(e) =>
                  setAutomation((current) => ({
                    ...current,
                    activo: e.target.checked,
                  }))
                }
                disabled={Boolean(loadingAction) || !saveAutomationApi}
              />
              Activar respaldo automático
            </label>

            <div className="db-inline-grid">
              <div>
                <input
                  className="db-field"
                  type="number"
                  min="1"
                  max="168"
                  value={automation.frecuencia_horas ?? 8}
                  onChange={(e) =>
                    setAutomation((current) => ({
                      ...current,
                      frecuencia_horas: e.target.value,
                    }))
                  }
                  disabled={Boolean(loadingAction) || !saveAutomationApi}
                />
                <div className="db-small">Frecuencia en horas</div>
              </div>

              <div>
                <input
                  className="db-field"
                  type="number"
                  min="1"
                  max="365"
                  value={automation.retencion_dias ?? 7}
                  onChange={(e) =>
                    setAutomation((current) => ({
                      ...current,
                      retencion_dias: e.target.value,
                    }))
                  }
                  disabled={Boolean(loadingAction) || !saveAutomationApi}
                />
                <div className="db-small">Retención en días</div>
              </div>
            </div>

            <div className="db-small">
              Próxima ejecución: {formatDateTime(automation.proxima_ejecucion)}
            </div>
            <div className="db-small">
              Última ejecución: {formatDateTime(automation.ultima_ejecucion)}
            </div>
            <div className="db-small">
              Último estado: {automation.ultimo_estado || "-"}
            </div>
            <div className="db-small">
              Detalle: {automation.ultimo_detalle || automation.warning || "-"}
            </div>
            {automationNotice ? (
              <div className="db-small" style={{ color: "#b45309" }}>
                {automationNotice}
              </div>
            ) : null}

            <div className="db-actions">
              <button
                type="button"
                className="db-btn db-btn-primary"
                onClick={handleSaveAutomation}
                disabled={Boolean(loadingAction) || !saveAutomationApi}
              >
                {loadingAction === "save-automation"
                  ? "Guardando..."
                  : "Guardar automatización"}
              </button>
              <button
                type="button"
                className="db-btn db-btn-light"
                onClick={handleBackupFull}
                disabled={Boolean(loadingAction)}
              >
                Ejecutar respaldo ahora
              </button>
            </div>
          </section>

          <section className="db-card">
            <h2>Restauración</h2>
            <p>
              Restaura uno de los respaldos existentes hacia una base destino en
              el mismo servidor PostgreSQL configurado para restauración.
            </p>

            <select
              className="db-select"
              value={selectedRestoreId}
              onChange={(e) => setSelectedRestoreId(e.target.value)}
              disabled={loadingHistory || Boolean(loadingAction)}
            >
              {restorableBackups.length === 0 ? (
                <option value="">No hay respaldos disponibles</option>
              ) : (
                restorableBackups.map((item) => (
                  <option key={`restore-${item.id}`} value={String(item.id)}>
                    {item.nombre_archivo} · {formatDateTime(item.created_at)}
                  </option>
                ))
              )}
            </select>

            <input
              className="db-field"
              value={restoreTargetDb}
              onChange={(e) => setRestoreTargetDb(e.target.value)}
              placeholder="Base destino, por ejemplo pizza_mya_restore"
              disabled={Boolean(loadingAction) || !restoreApi}
            />

            <label className="db-switch">
              <input
                type="checkbox"
                checked={restoreClean}
                onChange={(e) => setRestoreClean(e.target.checked)}
                disabled={Boolean(loadingAction) || !restoreApi}
              />
              Limpiar objetos existentes antes de restaurar
            </label>

            {restoreNotice ? (
              <div className="db-small" style={{ color: "#b45309" }}>
                {restoreNotice}
              </div>
            ) : null}

            <div className="db-actions">
              <button
                type="button"
                className="db-btn db-btn-dark"
                onClick={handleRestore}
                disabled={
                  !selectedRestoreId ||
                  !restoreTargetDb.trim() ||
                  Boolean(loadingAction) ||
                  !restoreApi
                }
              >
                {loadingAction === "restore"
                  ? "Restaurando..."
                  : "Restaurar respaldo"}
              </button>
            </div>
          </section>
        </div>

        <section className="db-history-card">
          <h3>Historial de respaldos</h3>
          <p>
            Registro de respaldos generados, tamaño, formato y estado de cada
            archivo.
          </p>

          {loadingHistory ? (
            <p style={{ marginTop: 20, fontWeight: 700 }}>
              Cargando historial...
            </p>
          ) : backupHistory.length === 0 ? (
            <p style={{ marginTop: 20, fontWeight: 700 }}>
              Aún no hay respaldos en el historial.
            </p>
          ) : (
            <div style={{ overflowX: "auto", marginTop: 18 }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "1280px",
                }}
              >
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    <th style={thStyle}>Fecha</th>
                    <th style={thStyle}>Proceso</th>
                    <th style={thStyle}>Alcance</th>
                    <th style={thStyle}>Esquema</th>
                    <th style={thStyle}>Tabla</th>
                    <th style={thStyle}>Formato</th>
                    <th style={thStyle}>Tamaño</th>
                    <th style={thStyle}>Archivo</th>
                    <th style={thStyle}>Estado</th>
                    <th style={thStyle}>Descargar</th>
                  </tr>
                </thead>
                <tbody>
                  {backupHistory.map((item) => {
                    const tone = statusTone(item.estado);
                    return (
                      <tr key={item.id}>
                        <td style={tdStyle}>
                          {formatDateTime(item.created_at)}
                        </td>
                        <td style={tdStyle}>
                          <span className="db-badge backup">
                            {item.tipo_proceso || "-"}
                          </span>
                        </td>
                        <td style={tdStyle}>{item.tipo_respaldo || "-"}</td>
                        <td style={tdStyle}>{item.esquema_nombre || "-"}</td>
                        <td style={tdStyle}>{item.tabla_nombre || "-"}</td>
                        <td style={tdStyle}>{getFormatLabel(item)}</td>
                        <td style={tdStyle}>
                          {formatBytes(item.tamanio_bytes)}
                        </td>
                        <td style={tdStyle}>{item.nombre_archivo || "-"}</td>
                        <td style={tdStyle}>
                          <span
                            style={{
                              display: "inline-flex",
                              padding: "6px 10px",
                              borderRadius: "999px",
                              fontWeight: 900,
                              fontSize: "12px",
                              ...tone,
                            }}
                          >
                            {item.estado}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          {item.estado === "EXITOSO" ? (
                            <button
                              type="button"
                              className="db-btn db-btn-dark"
                              style={{ padding: "10px 12px" }}
                              onClick={() => handleDownloadHistory(item.id)}
                              disabled={downloadingId === item.id}
                            >
                              {downloadingId === item.id
                                ? "Descargando..."
                                : "Descargar"}
                            </button>
                          ) : (
                            <span style={{ color: "#9ca3af", fontWeight: 800 }}>
                              No disponible
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="db-history-card">
          <h3>Historial de restauraciones</h3>
          <p>
            Resultado de las restauraciones ejecutadas desde pantalla, indicando
            la base destino y la validación posterior.
          </p>

          {loadingHistory ? (
            <p style={{ marginTop: 20, fontWeight: 700 }}>
              Cargando historial...
            </p>
          ) : restoreHistory.length === 0 ? (
            <p style={{ marginTop: 20, fontWeight: 700 }}>
              Aún no hay restauraciones registradas.
            </p>
          ) : (
            <div style={{ overflowX: "auto", marginTop: 18 }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "1180px",
                }}
              >
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    <th style={thStyle}>Fecha</th>
                    <th style={thStyle}>Proceso</th>
                    <th style={thStyle}>Respaldo origen</th>
                    <th style={thStyle}>Base destino</th>
                    <th style={thStyle}>Estado</th>
                    <th style={thStyle}>Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {restoreHistory.map((item) => {
                    const validation =
                      item?.metadata?.validation?.conteos || {};
                    const tone = statusTone(item.estado);
                    return (
                      <tr key={item.id}>
                        <td style={tdStyle}>
                          {formatDateTime(item.created_at)}
                        </td>
                        <td style={tdStyle}>
                          <span className="db-badge restore">
                            {item.tipo_proceso || "-"}
                          </span>
                        </td>
                        <td style={tdStyle}>{item.nombre_archivo || "-"}</td>
                        <td style={tdStyle}>
                          {item?.metadata?.target_database || "-"}
                        </td>

                        <td style={tdStyle}>
                          <span
                            style={{
                              display: "inline-flex",
                              padding: "6px 10px",
                              borderRadius: "999px",
                              fontWeight: 900,
                              fontSize: "12px",
                              ...tone,
                            }}
                          >
                            {item.estado}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          {item.mensaje || item.notas || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
