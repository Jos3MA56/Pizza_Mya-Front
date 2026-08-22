import { useCallback, useEffect, useMemo, useState } from "react";
import { cajeroApi } from "../../api/cajero.api.js";
import { useAuth } from "../../context/AuthContext.jsx";

const thStyle = {
  textAlign: "left",
  padding: "12px",
  borderBottom: "1px solid #e5e7eb",
  color: "#374151",
  fontWeight: 900,
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #f1f5f9",
  color: "#111827",
  verticalAlign: "top",
};

function getFormatLabel(item) {
  const formato = String(item?.formato || "").toUpperCase();
  return formato || "-";
}

function safeJsonArray(value) {
  return Array.isArray(value) ? value : [];
}

function prettyDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("es-MX");
  } catch {
    return String(value);
  }
}

function normalizeUploadResult(payload) {
  const raw =
    payload?.data && typeof payload.data === "object" ? payload.data : payload;

  const importId =
    raw?.importId ??
    raw?.import_id ??
    raw?.uploadId ??
    raw?.upload_id ??
    raw?.id ??
    raw?.historyId ??
    null;

  const fileName =
    raw?.fileName ??
    raw?.filename ??
    raw?.originalName ??
    raw?.nombre_archivo ??
    raw?.storedFileName ??
    raw?.tempFileName ??
    null;

  const totalRows =
    raw?.totalRows ??
    raw?.total_rows ??
    raw?.rowCount ??
    raw?.rows ??
    raw?.total_registros ??
    0;

  const headers = Array.isArray(raw?.headers)
    ? raw.headers
    : Array.isArray(raw?.columns)
      ? raw.columns
      : [];

  const preview = Array.isArray(raw?.preview)
    ? raw.preview
    : Array.isArray(raw?.sample)
      ? raw.sample
      : Array.isArray(raw?.rowsPreview)
        ? raw.rowsPreview
        : [];

  return {
    ...raw,
    importId,
    fileName,
    totalRows: Number(totalRows || 0),
    headers,
    preview,
  };
}

function normalizeValidationResult(payload) {
  const raw =
    payload?.data && typeof payload.data === "object" ? payload.data : payload;

  return {
    ...raw,
    totalRows: Number(
      raw?.totalRows ?? raw?.total_rows ?? raw?.total_registros ?? 0,
    ),
    validRows: Number(
      raw?.validRows ?? raw?.valid_rows ?? raw?.registros_validos ?? 0,
    ),
    invalidRows: Number(
      raw?.invalidRows ?? raw?.invalid_rows ?? raw?.registros_invalidos ?? 0,
    ),
    duplicatesCount: Number(
      raw?.duplicatesCount ?? raw?.duplicates_count ?? raw?.duplicados ?? 0,
    ),
    existingMatches: Number(
      raw?.existingMatches ?? raw?.existing_matches ?? raw?.coincidencias ?? 0,
    ),
    canCommit:
      raw?.canCommit ?? raw?.can_commit ?? raw?.listo_para_cargar ?? false,
    duplicates: safeJsonArray(raw?.duplicates ?? raw?.duplicados),
    nulls: raw?.nulls ?? raw?.nulos ?? {},
    categorias_inexistentes: raw?.categorias_inexistentes ?? 0,
    precios_invalidos: raw?.precios_invalidos ?? 0,
  };
}

function normalizeCommitResult(payload) {
  const raw =
    payload?.data && typeof payload.data === "object" ? payload.data : payload;

  return {
    ...raw,
    inserted: Number(raw?.inserted ?? raw?.insertados ?? 0),
    updated: Number(raw?.updated ?? raw?.actualizados ?? 0),
    rejected: Number(raw?.rejected ?? raw?.rechazados ?? 0),
    status: raw?.status ?? raw?.estado ?? "-",
  };
}

function ValidationChip({ label, value, tone = "gray" }) {
  const tones = {
    gray: { background: "#f3f4f6", color: "#374151" },
    green: { background: "#dcfce7", color: "#166534" },
    red: { background: "#fee2e2", color: "#b91c1c" },
    blue: { background: "#dbeafe", color: "#1d4ed8" },
    amber: { background: "#fef3c7", color: "#92400e" },
  };
  const currentTone = tones[tone] || tones.gray;

  return (
    <div
      style={{
        display: "grid",
        gap: 4,
        padding: "12px 14px",
        borderRadius: 16,
        background: currentTone.background,
        color: currentTone.color,
        minWidth: 140,
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 900 }}>{label}</span>
      <span style={{ fontSize: 18, fontWeight: 900 }}>{value}</span>
    </div>
  );
}

export default function CajeroExportaciones() {
  const { token } = useAuth();

  const [tables, setTables] = useState([]);
  const [importTables, setImportTables] = useState([]);
  const [selectedExportTable, setSelectedExportTable] = useState("");
  const [selectedImportTable, setSelectedImportTable] = useState("");
  const [importFile, setImportFile] = useState(null);
  const [loadingTables, setLoadingTables] = useState(true);
  const [loadingImportTables, setLoadingImportTables] = useState(true);
  const [loadingAction, setLoadingAction] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingImportHistory, setLoadingImportHistory] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [history, setHistory] = useState([]);
  const [importHistory, setImportHistory] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadResult, setUploadResult] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [commitResult, setCommitResult] = useState(null);

  const loadTables = useCallback(async () => {
    if (!token) return;
    setLoadingTables(true);

    try {
      const data = await cajeroApi.listBackupTables(token);
      const safe = Array.isArray(data) ? data : [];
      setTables(safe);
      if (!selectedExportTable && safe.length > 0) {
        setSelectedExportTable(safe[0].label);
      }
    } catch (e) {
      setError(e?.message || "No se pudieron cargar las tablas de exportación");
    } finally {
      setLoadingTables(false);
    }
  }, [token, selectedExportTable]);

  const loadImportTables = useCallback(async () => {
    if (!token) return;
    setLoadingImportTables(true);

    try {
      const data = await cajeroApi.listImportTables(token);
      const safe = Array.isArray(data) ? data : [];
      setImportTables(safe);
      if (!selectedImportTable && safe.length > 0) {
        setSelectedImportTable(safe[0].label);
      }
    } catch (e) {
      setError(e?.message || "No se pudieron cargar las tablas de importación");
    } finally {
      setLoadingImportTables(false);
    }
  }, [token, selectedImportTable]);

  const loadHistory = useCallback(async () => {
    if (!token) return;
    setLoadingHistory(true);

    try {
      const data = await cajeroApi.listFilesHistory(token, 30);
      setHistory(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "No se pudo cargar el historial de exportaciones");
    } finally {
      setLoadingHistory(false);
    }
  }, [token]);

  const loadImportHistory = useCallback(async () => {
    if (!token) return;
    setLoadingImportHistory(true);

    try {
      const data = await cajeroApi.listImportHistory(token, 30);
      setImportHistory(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "No se pudo cargar el historial de importaciones");
    } finally {
      setLoadingImportHistory(false);
    }
  }, [token]);

  useEffect(() => {
    loadTables();
    loadImportTables();
    loadHistory();
    loadImportHistory();
  }, [loadTables, loadImportTables, loadHistory, loadImportHistory]);

  const exportHistory = useMemo(() => {
    return safeJsonArray(history).filter(
      (item) =>
        String(item?.tipo_proceso || "").toUpperCase() === "EXPORTACION",
    );
  }, [history]);

  const selectedImportMeta = useMemo(() => {
    return (
      importTables.find((item) => item.label === selectedImportTable) || null
    );
  }, [importTables, selectedImportTable]);

  const normalizedUpload = useMemo(
    () => (uploadResult ? normalizeUploadResult(uploadResult) : null),
    [uploadResult],
  );

  const currentImportId = normalizedUpload?.importId || null;

  const startDownloadFromHistory = async (historyId) => {
    await cajeroApi.downloadHistoryFile(token, historyId, "cajero");
  };

  const handleExportFull = async () => {
    setLoadingAction("export-full");
    setError("");
    setSuccess("");

    try {
      const data = await cajeroApi.exportFull(token);
      if (!data?.historyId) {
        throw new Error("No se pudo identificar la exportación generada");
      }
      await startDownloadFromHistory(data.historyId);
      setSuccess("Exportación completa generada correctamente.");
      await loadHistory();
    } catch (e) {
      setError(e?.message || "No se pudo generar la exportación completa");
    } finally {
      setLoadingAction("");
    }
  };

  const handleExportTable = async () => {
    if (!selectedExportTable) {
      setError("Debes seleccionar una tabla para exportar");
      return;
    }

    const [schema, table] = selectedExportTable.split(".");
    setLoadingAction("export-table");
    setError("");
    setSuccess("");

    try {
      const data = await cajeroApi.exportTable(token, schema, table);
      if (!data?.historyId) {
        throw new Error("No se pudo identificar la exportación generada");
      }
      await startDownloadFromHistory(data.historyId);
      setSuccess(`Exportación de "${schema}.${table}" generada correctamente.`);
      await loadHistory();
    } catch (e) {
      setError(e?.message || "No se pudo generar la exportación por tabla");
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

  const resetImportFlow = () => {
    setUploadResult(null);
    setValidationResult(null);
    setCommitResult(null);
  };

  const handleUploadImport = async () => {
    if (!selectedImportTable) {
      setError("Debes seleccionar una tabla destino para importar");
      return;
    }
    if (!importFile) {
      setError("Debes seleccionar un archivo CSV");
      return;
    }

    const [schema, table] = selectedImportTable.split(".");
    setLoadingAction("upload-import");
    setError("");
    setSuccess("");
    resetImportFlow();

    try {
      const data = await cajeroApi.uploadImportCsv(token, {
        schema,
        table,
        file: importFile,
      });

      const normalized = normalizeUploadResult(data);
      setUploadResult(normalized);

      setSuccess(
        `Archivo CSV subido y analizado correctamente. Importación #${normalized.importId || "-"}.`,
      );
      await loadImportHistory();
    } catch (e) {
      setError(e?.message || "No se pudo procesar el archivo CSV");
    } finally {
      setLoadingAction("");
    }
  };

  const handleImportToStaging = async () => {
    if (!currentImportId) {
      setError("Primero debes subir y analizar un archivo CSV");
      return;
    }

    setLoadingAction("staging-import");
    setError("");
    setSuccess("");

    try {
      await cajeroApi.importToStaging(token, currentImportId);
      setSuccess("Archivo cargado correctamente al staging.");
      await loadImportHistory();
    } catch (e) {
      setError(e?.message || "No se pudo cargar la importación al staging");
    } finally {
      setLoadingAction("");
    }
  };

  const handleValidateImport = async () => {
    if (!currentImportId) {
      setError("Primero debes subir y analizar un archivo CSV");
      return;
    }

    setLoadingAction("validate-import");
    setError("");
    setSuccess("");

    try {
      const data = await cajeroApi.validateImport(token, currentImportId);
      const normalized = normalizeValidationResult(data);
      setValidationResult(normalized);

      setSuccess(
        normalized.canCommit
          ? "Validación completada. La importación está lista para cargarse."
          : "Validación completada con observaciones. Revisa duplicados o errores.",
      );
      await loadImportHistory();
    } catch (e) {
      setError(e?.message || "No se pudo validar la importación");
    } finally {
      setLoadingAction("");
    }
  };

  const handleCommitImport = async () => {
    if (!currentImportId) {
      setError("Primero debes subir y analizar un archivo CSV");
      return;
    }

    setLoadingAction("commit-import");
    setError("");
    setSuccess("");

    try {
      const data = await cajeroApi.commitImport(token, currentImportId);
      const normalized = normalizeCommitResult(data);
      setCommitResult(normalized);
      setSuccess("Importación aplicada correctamente a la tabla final.");
      await loadImportHistory();
    } catch (e) {
      setError(e?.message || "No se pudo aplicar la importación");
    } finally {
      setLoadingAction("");
    }
  };

  const handleClearStaging = async () => {
    if (!currentImportId) {
      setError("Primero debes subir y analizar un archivo CSV");
      return;
    }

    setLoadingAction("clear-staging");
    setError("");
    setSuccess("");

    try {
      await cajeroApi.clearImportStaging(token, currentImportId);
      setSuccess("Se limpió el staging de la importación actual.");
      setValidationResult(null);
      setCommitResult(null);
      await loadImportHistory();
    } catch (e) {
      setError(e?.message || "No se pudo limpiar el staging");
    } finally {
      setLoadingAction("");
    }
  };

  return (
    <>
      <style>{`
        .db-shell{display:grid;gap:24px;}
        .db-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;}
        .db-card,.db-history-card{
          background:#fff;border:1px solid #e5e7eb;border-radius:24px;padding:24px;
          box-shadow:0 8px 24px rgba(0,0,0,.06);
        }
        .db-card h2,.db-history-card h3{
          margin:0 0 8px;font-size:22px;font-weight:900;color:#111827;
        }
        .db-card p,.db-history-card p{
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
        .db-select,.db-input{
          width:100%;margin-top:18px;padding:14px 16px;border-radius:14px;border:1px solid #d1d5db;
          outline:none;font-size:14px;font-weight:700;color:#111827;background:#fff;
        }
        .db-message{border-radius:16px;padding:14px 16px;font-weight:800;}
        .db-message.error{background:#fef2f2;border:1px solid #fecaca;color:#b91c1c;}
        .db-message.success{background:#ecfdf5;border:1px solid #bbf7d0;color:#166534;}
        .db-badge{
          display:inline-flex;align-items:center;justify-content:center;
          padding:6px 10px;border-radius:999px;font-size:12px;font-weight:900;
        }
        .db-badge.export{background:#e0f2fe;color:#075985;}
        .db-badge.import{background:#ede9fe;color:#5b21b6;}
        .db-kpis{display:flex;flex-wrap:wrap;gap:12px;margin-top:18px;}
        .db-preview{
          margin-top:18px;border:1px solid #e5e7eb;border-radius:18px;padding:16px;background:#f9fafb;
        }
        .db-subtitle{margin:0 0 10px;color:#111827;font-size:15px;font-weight:900;}
        .db-mini{font-size:13px;color:#6b7280;font-weight:700;}
        .db-pill{display:inline-flex;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:900;background:#f3f4f6;color:#374151;}
        .db-file{margin-top:16px;padding:14px;border:1px dashed #d1d5db;border-radius:16px;background:#fafafa;}
        @media (max-width: 980px){
          .db-grid{grid-template-columns:1fr;}
        }
      `}</style>

      <div className="db-shell">
        {error ? <div className="db-message error">{error}</div> : null}
        {success ? <div className="db-message success">{success}</div> : null}

        <div className="db-grid">
          <section className="db-card">
            <h2>Exportación completa</h2>
            <p>
              Genera una exportación completa de la base de datos en el formato
              configurado.
            </p>
            <div className="db-actions">
              <button
                type="button"
                className="db-btn db-btn-primary"
                onClick={handleExportFull}
                disabled={Boolean(loadingAction)}
              >
                {loadingAction === "export-full"
                  ? "Generando exportación..."
                  : "Exportar base completa"}
              </button>
            </div>
          </section>

          <section className="db-card">
            <h2>Exportación por tabla</h2>
            <p>
              Genera una exportación de una tabla específica en formato CSV
              listo para descargar.
            </p>
            <select
              className="db-select"
              value={selectedExportTable}
              onChange={(e) => setSelectedExportTable(e.target.value)}
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
                  <option key={`export-${item.label}`} value={item.label}>
                    {item.label}
                  </option>
                ))
              )}
            </select>

            <div className="db-actions">
              <button
                type="button"
                className="db-btn db-btn-dark"
                onClick={handleExportTable}
                disabled={!selectedExportTable || Boolean(loadingAction)}
              >
                {loadingAction === "export-table"
                  ? "Generando exportación..."
                  : "Exportar tabla"}
              </button>
            </div>
          </section>
        </div>

        <section className="db-card">
          <h2>Importación controlada</h2>
          <p>
            Sube un CSV, cárgalo al esquema staging, valida los datos y después
            confirma la carga final.
          </p>

          <div className="db-grid" style={{ marginTop: 18 }}>
            <div>
              <div className="db-subtitle">Tabla destino</div>
              <select
                className="db-select"
                style={{ marginTop: 0 }}
                value={selectedImportTable}
                onChange={(e) => {
                  setSelectedImportTable(e.target.value);
                  setImportFile(null);
                  resetImportFlow();
                }}
                disabled={loadingImportTables || Boolean(loadingAction)}
              >
                {loadingImportTables ? (
                  <option value="">Cargando tablas...</option>
                ) : importTables.length === 0 ? (
                  <option value="">No hay tablas disponibles</option>
                ) : (
                  importTables.map((item) => (
                    <option key={`import-${item.label}`} value={item.label}>
                      {item.label}
                    </option>
                  ))
                )}
              </select>
              <p className="db-mini" style={{ marginTop: 10 }}>
                {selectedImportMeta?.description ||
                  "Selecciona una tabla habilitada para importación."}
              </p>
            </div>

            <div>
              <div className="db-subtitle">Archivo CSV</div>
              <input
                type="file"
                accept=".csv,text/csv"
                className="db-input"
                style={{ marginTop: 0 }}
                onChange={(e) => {
                  setImportFile(e.target.files?.[0] || null);
                  resetImportFlow();
                }}
              />
              <p className="db-mini" style={{ marginTop: 10 }}>
                Columnas obligatorias:{" "}
                {safeJsonArray(selectedImportMeta?.requiredHeaders).join(
                  ", ",
                ) || "-"}
              </p>
            </div>
          </div>

          <div className="db-file">
            <div className="db-subtitle">Archivo actual</div>
            <div className="db-mini">
              {importFile
                ? `${importFile.name} • ${(importFile.size / 1024).toFixed(1)} KB`
                : "Todavía no has seleccionado un archivo."}
            </div>
          </div>

          <div className="db-actions">
            <button
              type="button"
              className="db-btn db-btn-primary"
              onClick={handleUploadImport}
              disabled={
                Boolean(loadingAction) || !selectedImportTable || !importFile
              }
            >
              {loadingAction === "upload-import"
                ? "Subiendo CSV..."
                : "Subir y analizar archivo"}
            </button>
            <button
              type="button"
              className="db-btn db-btn-dark"
              onClick={handleImportToStaging}
              disabled={Boolean(loadingAction) || !currentImportId}
            >
              {loadingAction === "staging-import"
                ? "Cargando a staging..."
                : "Importar a staging"}
            </button>
            <button
              type="button"
              className="db-btn db-btn-light"
              onClick={handleValidateImport}
              disabled={Boolean(loadingAction) || !currentImportId}
            >
              {loadingAction === "validate-import"
                ? "Validando..."
                : "Ejecutar validaciones"}
            </button>
            <button
              type="button"
              className="db-btn db-btn-dark"
              onClick={handleCommitImport}
              disabled={Boolean(loadingAction) || !currentImportId}
            >
              {loadingAction === "commit-import"
                ? "Cargando a tabla final..."
                : "Cargar a tabla final"}
            </button>
            <button
              type="button"
              className="db-btn db-btn-light"
              onClick={handleClearStaging}
              disabled={Boolean(loadingAction) || !currentImportId}
            >
              {loadingAction === "clear-staging"
                ? "Limpiando staging..."
                : "Limpiar staging"}
            </button>
          </div>

          {normalizedUpload ? (
            <div className="db-preview">
              <div className="db-subtitle">Vista previa del CSV</div>
              <div className="db-mini" style={{ marginBottom: 12 }}>
                Importación #{normalizedUpload.importId || "-"} ·{" "}
                {normalizedUpload.fileName || importFile?.name || "-"} ·{" "}
                {normalizedUpload.totalRows || 0} filas detectadas.
              </div>
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: "680px",
                  }}
                >
                  <thead>
                    <tr style={{ background: "#fff" }}>
                      {safeJsonArray(normalizedUpload.headers).map((header) => (
                        <th key={header} style={thStyle}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {safeJsonArray(normalizedUpload.preview).length === 0 ? (
                      <tr>
                        <td
                          style={tdStyle}
                          colSpan={Math.max(
                            normalizedUpload.headers?.length || 1,
                            1,
                          )}
                        >
                          No hay filas para mostrar en la vista previa.
                        </td>
                      </tr>
                    ) : (
                      safeJsonArray(normalizedUpload.preview).map(
                        (row, index) => (
                          <tr key={`preview-${index}`}>
                            {safeJsonArray(normalizedUpload.headers).map(
                              (header) => (
                                <td key={`${index}-${header}`} style={tdStyle}>
                                  {String(row?.[header] ?? "-")}
                                </td>
                              ),
                            )}
                          </tr>
                        ),
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {validationResult ? (
            <div className="db-preview">
              <div className="db-subtitle">Resultado de validación</div>
              <div className="db-kpis">
                <ValidationChip
                  label="Total filas"
                  value={validationResult.totalRows || 0}
                  tone="blue"
                />
                <ValidationChip
                  label="Válidas"
                  value={validationResult.validRows || 0}
                  tone="green"
                />
                <ValidationChip
                  label="Inválidas"
                  value={validationResult.invalidRows || 0}
                  tone={validationResult.invalidRows ? "red" : "green"}
                />
                <ValidationChip
                  label="Duplicados"
                  value={validationResult.duplicatesCount || 0}
                  tone={validationResult.duplicatesCount ? "amber" : "green"}
                />
                <ValidationChip
                  label="Coinciden en final"
                  value={validationResult.existingMatches || 0}
                  tone="gray"
                />
              </div>

              {validationResult.nulls ? (
                <div style={{ marginTop: 16 }}>
                  <div className="db-subtitle" style={{ fontSize: 14 }}>
                    Nulos / faltantes
                  </div>
                  <div className="db-actions" style={{ marginTop: 8 }}>
                    {Object.entries(validationResult.nulls).map(
                      ([key, value]) => (
                        <span key={key} className="db-pill">
                          {key}: {value}
                        </span>
                      ),
                    )}
                    {validationResult.categorias_inexistentes ? (
                      <span className="db-pill">
                        categorías inexistentes:{" "}
                        {validationResult.categorias_inexistentes}
                      </span>
                    ) : null}
                    {validationResult.precios_invalidos ? (
                      <span className="db-pill">
                        precios inválidos: {validationResult.precios_invalidos}
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {safeJsonArray(validationResult.duplicates).length > 0 ? (
                <div style={{ overflowX: "auto", marginTop: 16 }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      minWidth: "420px",
                    }}
                  >
                    <thead>
                      <tr style={{ background: "#fff" }}>
                        <th style={thStyle}>Clave</th>
                        <th style={thStyle}>Total repetidos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validationResult.duplicates.map((item, index) => (
                        <tr key={`dup-${index}`}>
                          <td style={tdStyle}>
                            {item.nombre || item.id || "-"}
                          </td>
                          <td style={tdStyle}>{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          ) : null}

          {commitResult ? (
            <div className="db-preview">
              <div className="db-subtitle">Resultado de la carga final</div>
              <div className="db-kpis">
                <ValidationChip
                  label="Insertados"
                  value={commitResult.inserted || 0}
                  tone="green"
                />
                <ValidationChip
                  label="Actualizados"
                  value={commitResult.updated || 0}
                  tone="blue"
                />
                <ValidationChip
                  label="Rechazados"
                  value={commitResult.rejected || 0}
                  tone={commitResult.rejected ? "red" : "green"}
                />
                <ValidationChip
                  label="Estado"
                  value={commitResult.status || "-"}
                  tone="gray"
                />
              </div>
            </div>
          ) : null}
        </section>

        <section className="db-history-card">
          <h3>Historial de exportaciones</h3>
          <p>Registro de exportaciones generadas, su formato y su estado.</p>

          {loadingHistory ? (
            <p style={{ marginTop: 20, fontWeight: 700 }}>
              Cargando historial...
            </p>
          ) : exportHistory.length === 0 ? (
            <p style={{ marginTop: 20, fontWeight: 700 }}>
              Aún no hay exportaciones en el historial.
            </p>
          ) : (
            <div style={{ overflowX: "auto", marginTop: 18 }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "1200px",
                  fontSize: "14px",
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
                    <th style={thStyle}>Archivo</th>
                    <th style={thStyle}>Estado</th>
                    <th style={thStyle}>Descargar</th>
                  </tr>
                </thead>
                <tbody>
                  {exportHistory.map((item) => (
                    <tr key={item.id}>
                      <td style={tdStyle}>{prettyDate(item.created_at)}</td>
                      <td style={tdStyle}>
                        <span className="db-badge export">
                          {item.tipo_proceso || "-"}
                        </span>
                      </td>
                      <td style={tdStyle}>{item.tipo_respaldo || "-"}</td>
                      <td style={tdStyle}>{item.esquema_nombre || "-"}</td>
                      <td style={tdStyle}>{item.tabla_nombre || "-"}</td>
                      <td style={tdStyle}>{getFormatLabel(item)}</td>
                      <td style={tdStyle}>{item.nombre_archivo || "-"}</td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            display: "inline-flex",
                            padding: "6px 10px",
                            borderRadius: "999px",
                            fontWeight: 900,
                            fontSize: "12px",
                            background:
                              item.estado === "EXITOSO" ? "#dcfce7" : "#fee2e2",
                            color:
                              item.estado === "EXITOSO" ? "#166534" : "#b91c1c",
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="db-history-card">
          <h3>Historial de importaciones</h3>
          <p>
            Registro de archivos subidos, validaciones, carga a staging y carga
            final.
          </p>

          {loadingImportHistory ? (
            <p style={{ marginTop: 20, fontWeight: 700 }}>
              Cargando historial...
            </p>
          ) : importHistory.length === 0 ? (
            <p style={{ marginTop: 20, fontWeight: 700 }}>
              Aún no hay importaciones en el historial.
            </p>
          ) : (
            <div style={{ overflowX: "auto", marginTop: 18 }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "1280px",
                  fontSize: "14px",
                }}
              >
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    <th style={thStyle}>Fecha</th>
                    <th style={thStyle}>Destino</th>
                    <th style={thStyle}>Archivo</th>
                    <th style={thStyle}>Total</th>
                    <th style={thStyle}>Válidos</th>
                    <th style={thStyle}>Inválidos</th>
                    <th style={thStyle}>Insertados</th>
                    <th style={thStyle}>Actualizados</th>
                    <th style={thStyle}>Estado</th>
                    <th style={thStyle}>Mensaje</th>
                  </tr>
                </thead>
                <tbody>
                  {importHistory.map((item) => (
                    <tr key={`import-history-${item.id}`}>
                      <td style={tdStyle}>{prettyDate(item.created_at)}</td>
                      <td style={tdStyle}>
                        <span className="db-badge import">
                          {item.esquema_destino}.{item.tabla_destino}
                        </span>
                      </td>
                      <td style={tdStyle}>{item.nombre_archivo || "-"}</td>
                      <td style={tdStyle}>{item.total_registros ?? 0}</td>
                      <td style={tdStyle}>{item.registros_validos ?? 0}</td>
                      <td style={tdStyle}>{item.registros_invalidos ?? 0}</td>
                      <td style={tdStyle}>{item.insertados ?? 0}</td>
                      <td style={tdStyle}>{item.actualizados ?? 0}</td>
                      <td style={tdStyle}>{item.estado || "-"}</td>
                      <td style={tdStyle}>{item.mensaje || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
