import { useEffect, useMemo, useState, useCallback } from "react";
import { adminTransaccionesApi } from "../../api/adminTransacciones.api.js";
import { useToast } from "../../components/ui/ToastProvider.jsx";

const STATUS_OPTIONS = [
  { value: "", label: "Todas" },
  { value: "PENDIENTE", label: "Pendientes" },
  { value: "EN_REVISION", label: "En revisión" },
  { value: "PROCESANDO", label: "Procesando" },
  { value: "APROBADA", label: "Aprobadas" },
  { value: "RECHAZADA", label: "Rechazadas" },
  { value: "REEMBOLSADA", label: "Reembolsadas" },
  { value: "CONTRACARGO", label: "Contracargos" },
];

const METHOD_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "TARJETA", label: "Tarjeta crédito/débito" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
];

function money(value) {
  return Number(value || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

function formatDate(value) {
  if (!value) return "—";

  try {
    return new Intl.DateTimeFormat("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getCliente(tx) {
  return (
    [tx?.cliente_nombres, tx?.cliente_paterno, tx?.cliente_materno]
      .filter(Boolean)
      .join(" ") ||
    tx?.cliente_nombre ||
    tx?.cliente_email ||
    "Cliente"
  );
}

function getFolio(tx) {
  return tx?.folio || tx?.pedido_folio || tx?.pedido?.folio || "—";
}

function statusClass(status) {
  const s = String(status || "").toUpperCase();

  if (s === "APROBADA") return "ok";
  if (["RECHAZADA", "CONTRACARGO"].includes(s)) return "bad";
  if (["EN_REVISION", "PROCESANDO"].includes(s)) return "warn";
  if (s === "REEMBOLSADA") return "warn";

  return "pending";
}

function normalizeStatusLabel(status) {
  const s = String(status || "").toUpperCase();

  if (s === "APROBADA") return "APROBADA";
  if (s === "RECHAZADA") return "RECHAZADA";
  if (s === "EN_REVISION") return "EN REVISIÓN";
  if (s === "PROCESANDO") return "PROCESANDO";
  if (s === "REEMBOLSADA") return "REEMBOLSADA";
  if (s === "CONTRACARGO") return "CONTRACARGO";

  return s || "PENDIENTE";
}

function normalizeMetodoLabel(row) {
  const metodo =
    row?.metodo_nombre ||
    row?.metodo_pago_nombre ||
    row?.metodo_pago ||
    row?.metodo_codigo ||
    row?.codigo ||
    "—";

  const codigo = String(row?.metodo_codigo || row?.codigo || "").toUpperCase();

  if (codigo === "EFECTIVO") return "Efectivo";
  if (codigo === "TARJETA") return "Tarjeta crédito/débito";
  if (codigo === "TRANSFERENCIA") return "Transferencia";

  return metodo;
}

export default function AdminTransacciones() {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [rows, setRows] = useState([]);

  const [filters, setFilters] = useState({
    estatus: "",
    metodo: "",
    from: "",
    to: "",
    q: "",
  });

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    type: null,
    transaction: null,
    motivo: "",
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const data = await adminTransaccionesApi.list(filters);

      setRows(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error?.message || "No se pudieron cargar las transacciones");
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const summary = useMemo(() => {
    const total = rows.reduce((sum, row) => sum + Number(row.monto || 0), 0);

    const aprobadas = rows.filter(
      (row) => String(row.estatus || "").toUpperCase() === "APROBADA",
    );

    const aprobadasTotal = aprobadas.reduce(
      (sum, row) => sum + Number(row.monto || 0),
      0,
    );

    const pendientes = rows.filter((row) =>
      ["PENDIENTE", "EN_REVISION"].includes(
        String(row.estatus || "").toUpperCase(),
      ),
    ).length;

    return {
      total,
      aprobadasTotal,
      pendientes,
      count: rows.length,
    };
  }, [rows]);

  function updateFilter(key, value) {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function openApproveModal(transaction) {
    setConfirmModal({
      open: true,
      type: "approve",
      transaction,
      motivo: "",
    });
  }

  function openRejectModal(transaction) {
    setConfirmModal({
      open: true,
      type: "reject",
      transaction,
      motivo: "",
    });
  }

  function closeConfirmModal() {
    setConfirmModal({
      open: false,
      type: null,
      transaction: null,
      motivo: "",
    });
  }

  async function handleConfirmPaymentAction() {
    const tx = confirmModal.transaction;

    if (!tx?.id) return;

    try {
      setSavingId(tx.id);

      if (confirmModal.type === "approve") {
        await adminTransaccionesApi.approve(
          tx.id,
          "Pago validado por administrador",
        );

        toast.success(
          `Pago del pedido #${getFolio(tx)} aprobado correctamente.`,
        );
      }

      if (confirmModal.type === "reject") {
        const motivo = confirmModal.motivo.trim();

        if (!motivo) {
          toast.warning("Agrega el motivo del rechazo.");
          return;
        }

        await adminTransaccionesApi.reject(tx.id, motivo);

        toast.success(`Pago del pedido #${getFolio(tx)} rechazado.`);
      }

      closeConfirmModal();
      await load();
    } catch (error) {
      toast.error(error?.message || "No se pudo actualizar la transacción.");
    } finally {
      setSavingId("");
    }
  }

  function clearFilters() {
    setFilters({
      estatus: "",
      metodo: "",
      from: "",
      to: "",
      q: "",
    });
  }

  return (
    <>
      <style>{`
        .tx-wrap {
          padding: 26px;
          max-width: 1300px;
          margin: 0 auto;
        }

        .tx-title {
          margin: 0;
          color: #111;
          font-size: 32px;
          font-weight: 1000;
          letter-spacing: -0.04em;
        }

        .tx-sub {
          margin: 6px 0 22px;
          color: #666;
          font-weight: 700;
        }

        .tx-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }

        .tx-card {
          background: #fff;
          border: 1px solid #eee;
          border-radius: 18px;
          padding: 16px;
          box-shadow: 0 10px 22px rgba(0, 0, 0, 0.05);
        }

        .tx-card span {
          display: block;
          color: #777;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .tx-card b {
          display: block;
          margin-top: 7px;
          font-size: 24px;
          color: #111;
        }

        .tx-filters {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr 1.3fr auto auto;
          gap: 10px;
          background: #fff;
          border: 1px solid #eee;
          border-radius: 18px;
          padding: 14px;
          margin-bottom: 16px;
        }

        .tx-input,
        .tx-select {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 10px 12px;
          background: #fafafa;
          box-sizing: border-box;
          outline: none;
        }

        .tx-input:focus,
        .tx-select:focus {
          background: #fff;
          border-color: #991b1b;
          box-shadow: 0 0 0 3px rgba(153, 27, 27, 0.1);
        }

        .tx-btn {
          border: 0;
          border-radius: 12px;
          padding: 10px 14px;
          font-weight: 1000;
          cursor: pointer;
          white-space: nowrap;
        }

        .tx-btn.primary {
          background: #991b1b;
          color: #fff;
        }

        .tx-btn.soft {
          background: #f3f4f6;
          color: #111;
          border: 1px solid #e5e7eb;
        }

        .tx-btn.ok {
          background: #15803d;
          color: #fff;
        }

        .tx-btn.bad {
          background: #991b1b;
          color: #fff;
        }

        .tx-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .tx-tableCard {
          background: #fff;
          border: 1px solid #eee;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 10px 22px rgba(0, 0, 0, 0.05);
        }

        .tx-table {
          width: 100%;
          border-collapse: collapse;
        }

        .tx-table th {
          background: #fafafa;
          color: #555;
          text-align: left;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 13px;
          border-bottom: 1px solid #eee;
        }

        .tx-table td {
          padding: 13px;
          border-bottom: 1px solid #f0f0f0;
          vertical-align: top;
          color: #222;
          font-size: 14px;
        }

        .tx-table tr:last-child td {
          border-bottom: 0;
        }

        .tx-pill {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 1000;
        }

        .tx-pill.ok {
          background: #dcfce7;
          color: #166534;
        }

        .tx-pill.bad {
          background: #fee2e2;
          color: #991b1b;
        }

        .tx-pill.warn {
          background: #fef3c7;
          color: #92400e;
        }

        .tx-pill.pending {
          background: #e0f2fe;
          color: #075985;
        }

        .tx-actions {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
        }

        .tx-muted {
          color: #777;
          font-size: 12px;
          line-height: 1.45;
        }

        .tx-empty {
          padding: 28px;
          text-align: center;
          color: #666;
          font-weight: 900;
        }

        .tx-reference {
          max-width: 210px;
          overflow-wrap: anywhere;
        }

        .txModalOverlay {
          position: fixed;
          inset: 0;
          z-index: 300;
          background: rgba(15, 23, 42, 0.48);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
        }

        .txModal {
          width: min(520px, 100%);
          background: #fff;
          border-radius: 22px;
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.24);
          overflow: hidden;
        }

        .txModalHeader {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
          padding: 20px 22px 14px;
          border-bottom: 1px solid #f1f5f9;
        }

        .txModalHeader span {
          display: block;
          color: #991b1b;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .txModalHeader h3 {
          margin: 4px 0 0;
          font-size: 22px;
          color: #111827;
        }

        .txModalHeader button {
          width: 36px;
          height: 36px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #fff;
          font-size: 22px;
          font-weight: 900;
          cursor: pointer;
        }

        .txModalBody {
          padding: 18px 22px;
        }

        .txModalBody p {
          margin: 0;
          color: #374151;
          line-height: 1.6;
        }

        .txModalInfo {
          margin-top: 14px;
          padding: 12px 14px;
          border-radius: 14px;
          background: #ecfdf5;
          color: #166534;
          font-weight: 800;
          font-size: 14px;
        }

        .txModalWarning {
          margin-top: 14px;
          padding: 12px 14px;
          border-radius: 14px;
          background: #fff7ed;
          color: #9a3412;
          font-weight: 800;
          font-size: 14px;
        }

        .txModalLabel {
          display: block;
          margin-top: 14px;
          margin-bottom: 6px;
          color: #111827;
          font-size: 13px;
          font-weight: 900;
        }

        .txModalTextarea {
          width: 100%;
          resize: vertical;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 12px;
          outline: none;
          font-family: inherit;
          box-sizing: border-box;
        }

        .txModalTextarea:focus {
          border-color: #991b1b;
          box-shadow: 0 0 0 3px rgba(153, 27, 27, 0.12);
        }

        .txModalActions {
          display: flex;
          gap: 12px;
          padding: 16px 22px 22px;
        }

        .txModalActions button {
          flex: 1;
          border: 0;
          border-radius: 14px;
          padding: 12px 14px;
          font-weight: 900;
          cursor: pointer;
        }

        .txModalCancel {
          background: #fff;
          color: #111827;
          border: 1px solid #e5e7eb !important;
        }

        .txModalApprove {
          background: #15803d;
          color: #fff;
        }

        .txModalReject {
          background: #991b1b;
          color: #fff;
        }

        .txModalActions button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        @media (max-width: 980px) {
          .tx-filters {
            grid-template-columns: 1fr 1fr;
          }

          .tx-table {
            display: block;
            overflow-x: auto;
          }
        }

        @media (max-width: 900px) {
          .tx-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 560px) {
          .tx-grid {
            grid-template-columns: 1fr;
          }

          .tx-wrap {
            padding: 16px;
          }

          .tx-filters {
            grid-template-columns: 1fr;
          }

          .txModalActions {
            flex-direction: column;
          }
        }
      `}</style>

      <main className="tx-wrap">
        <h1 className="tx-title">Transacciones</h1>

        <p className="tx-sub">
          Revisa pagos en efectivo, tarjeta y transferencia. Aprueba el pago
          cuando el dinero se haya recibido o validado.
        </p>

        <section className="tx-grid">
          <article className="tx-card">
            <span>Transacciones</span>
            <b>{summary.count}</b>
          </article>

          <article className="tx-card">
            <span>Total mostrado</span>
            <b>{money(summary.total)}</b>
          </article>

          <article className="tx-card">
            <span>Pagos aprobados</span>
            <b>{money(summary.aprobadasTotal)}</b>
          </article>

          <article className="tx-card">
            <span>Pendientes</span>
            <b>{summary.pendientes}</b>
          </article>
        </section>

        <section className="tx-filters">
          <select
            className="tx-select"
            value={filters.estatus}
            onChange={(event) => updateFilter("estatus", event.target.value)}
          >
            {STATUS_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            className="tx-select"
            value={filters.metodo}
            onChange={(event) => updateFilter("metodo", event.target.value)}
          >
            {METHOD_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <input
            className="tx-input"
            type="date"
            value={filters.from}
            onChange={(event) => updateFilter("from", event.target.value)}
          />

          <input
            className="tx-input"
            type="date"
            value={filters.to}
            onChange={(event) => updateFilter("to", event.target.value)}
          />

          <input
            className="tx-input"
            placeholder="Buscar folio, cliente o referencia"
            value={filters.q}
            onChange={(event) => updateFilter("q", event.target.value)}
          />

          <button className="tx-btn primary" type="button" onClick={load}>
            Buscar
          </button>

          <button className="tx-btn soft" type="button" onClick={clearFilters}>
            Limpiar
          </button>
        </section>

        <section className="tx-tableCard">
          {loading ? (
            <div className="tx-empty">Cargando transacciones...</div>
          ) : rows.length === 0 ? (
            <div className="tx-empty">
              No hay transacciones con los filtros seleccionados.
            </div>
          ) : (
            <table className="tx-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Método</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Referencia</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => {
                  const status = String(row.estatus || "").toUpperCase();
                  const metodoCodigo = String(
                    row.metodo_codigo || row.codigo || "",
                  ).toUpperCase();

                  const proveedor = String(row.proveedor || "")
                    .trim()
                    .toUpperCase();

                  const canAct =
                    ["PENDIENTE", "EN_REVISION"].includes(status) &&
                    metodoCodigo !== "TARJETA" &&
                    !proveedor;
                  const isSaving = savingId === row.id;

                  return (
                    <tr key={row.id}>
                      <td>
                        <strong>#{getFolio(row)}</strong>

                        <div className="tx-muted">
                          {row.pedido_estatus
                            ? `Pedido: ${row.pedido_estatus}`
                            : row.estatus_pedido
                              ? `Pedido: ${row.estatus_pedido}`
                              : ""}
                        </div>
                      </td>

                      <td>
                        <strong>{getCliente(row)}</strong>

                        <div className="tx-muted">
                          {row.cliente_telefono ||
                            row.cliente_email ||
                            row.usuario_id ||
                            "—"}
                        </div>
                      </td>

                      <td>
                        <strong>{normalizeMetodoLabel(row)}</strong>

                        <div className="tx-muted">
                          {row.metodo_codigo || row.codigo || "—"}
                        </div>
                      </td>

                      <td>
                        <strong>{money(row.monto)}</strong>
                      </td>

                      <td>
                        <span className={`tx-pill ${statusClass(row.estatus)}`}>
                          {normalizeStatusLabel(row.estatus)}
                        </span>

                        {row.motivo_rechazo ? (
                          <div className="tx-muted">
                            Motivo: {row.motivo_rechazo}
                          </div>
                        ) : null}
                      </td>

                      <td className="tx-reference">
                        {row.referencia || row.referencia_pago || "—"}

                        {row.comprobante_url ? (
                          <div className="tx-muted">
                            <a
                              href={row.comprobante_url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Ver comprobante
                            </a>
                          </div>
                        ) : null}
                      </td>

                      <td>{formatDate(row.created_at)}</td>

                      <td>
                        {canAct ? (
                          <div className="tx-actions">
                            <button
                              className="tx-btn ok"
                              type="button"
                              disabled={isSaving}
                              onClick={() => openApproveModal(row)}
                            >
                              {isSaving ? "..." : "Aprobar"}
                            </button>

                            <button
                              className="tx-btn bad"
                              type="button"
                              disabled={isSaving}
                              onClick={() => openRejectModal(row)}
                            >
                              {isSaving ? "..." : "Rechazar"}
                            </button>
                          </div>
                        ) : (
                          <span className="tx-muted">Sin acciones</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      </main>

      {confirmModal.open ? (
        <div className="txModalOverlay">
          <div className="txModal">
            <div className="txModalHeader">
              <div>
                <span>
                  {confirmModal.type === "approve"
                    ? "Confirmar aprobación"
                    : "Confirmar rechazo"}
                </span>

                <h3>
                  {confirmModal.type === "approve"
                    ? "Aprobar pago"
                    : "Rechazar pago"}
                </h3>
              </div>

              <button type="button" onClick={closeConfirmModal}>
                ×
              </button>
            </div>

            <div className="txModalBody">
              {confirmModal.type === "approve" ? (
                <>
                  <p>
                    ¿Deseas aprobar el pago del pedido{" "}
                    <b>#{getFolio(confirmModal.transaction)}</b>?
                  </p>

                  <div className="txModalInfo">
                    Al aprobarlo, la transacción quedará validada y el pedido se
                    marcará como pagado.
                  </div>
                </>
              ) : (
                <>
                  <p>
                    ¿Deseas rechazar el pago del pedido{" "}
                    <b>#{getFolio(confirmModal.transaction)}</b>?
                  </p>

                  <div className="txModalWarning">
                    Escribe el motivo para que quede registrado en la
                    transacción.
                  </div>

                  <label className="txModalLabel">Motivo del rechazo</label>

                  <textarea
                    className="txModalTextarea"
                    value={confirmModal.motivo}
                    onChange={(event) =>
                      setConfirmModal((prev) => ({
                        ...prev,
                        motivo: event.target.value,
                      }))
                    }
                    placeholder="Ejemplo: No se recibió la transferencia o la referencia no coincide."
                    rows={4}
                  />
                </>
              )}
            </div>

            <div className="txModalActions">
              <button
                type="button"
                className="txModalCancel"
                onClick={closeConfirmModal}
              >
                Cancelar
              </button>

              <button
                type="button"
                className={
                  confirmModal.type === "approve"
                    ? "txModalApprove"
                    : "txModalReject"
                }
                onClick={handleConfirmPaymentAction}
                disabled={Boolean(savingId)}
              >
                {savingId
                  ? "Procesando..."
                  : confirmModal.type === "approve"
                    ? "Sí, aprobar pago"
                    : "Sí, rechazar pago"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
