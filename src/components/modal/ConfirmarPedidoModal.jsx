import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ConfirmarPedidoModal({
  open,
  onClose,
  total = 0,
  direcciones = [], // [{id, calle, numero, colonia, ciudad, estado, cp}]
  defaultId = null,
  onConfirm, // (direccionId) => void | Promise<void>
}) {
  const nav = useNavigate();

  const initialId = useMemo(() => {
    if (defaultId) return defaultId;
    return direcciones?.[0]?.id ?? null;
  }, [defaultId, direcciones]);

  const [selectedId, setSelectedId] = useState(initialId);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSelectedId(initialId);
  }, [initialId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const selected = direcciones.find((d) => String(d.id) === String(selectedId));

  const formatDir = (d) => {
    if (!d) return "";
    const linea1 = `${d.calle || ""} ${d.numero || ""}`.trim();
    const linea2 = `${d.colonia || ""}, ${d.ciudad || ""}`.replace(/^,\s*/,"").trim();
    const linea3 = `${(d.estado || "").toUpperCase()} - CP ${d.cp || ""}`.replace(/^ - /,"").trim();
    return { linea1, linea2, linea3 };
  };

  const txt = formatDir(selected);

  return (
    <>
      <style>{`
        .pmya-overlay{
          position: fixed; inset: 0;
          background: rgba(0,0,0,.35);
          z-index: 9998;
          display:flex;
          align-items:center;
          justify-content:center;
          padding: 18px;
        }
        .pmya-modal{
          width: min(460px, 96vw);
          background:#fff;
          border-radius: 16px;
          border: 1px solid #eee;
          box-shadow: 0 18px 40px rgba(0,0,0,.18);
          overflow:hidden;
        }

        .pmya-head{
          padding: 14px 14px 10px;
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap: 10px;
        }
        .pmya-title{
          font-size: 18px;
          font-weight: 1000;
          margin: 0;
          color:#111;
        }
        .pmya-sub{
          margin: 6px 0 0;
          font-size: 12px;
          color:#666;
          font-weight: 700;
        }
        .pmya-close{
          width: 34px; height: 34px;
          border-radius: 12px;
          border: none;
          background: #f2f2f2;
          cursor:pointer;
          display:flex;
          align-items:center;
          justify-content:center;
        }

        .pmya-body{ padding: 0 14px 14px; }

        .pmya-box{
          border: 2px solid #FF6A00;
          border-radius: 12px;
          padding: 14px;
          color:#333;
          line-height: 1.35;
          font-size: 13px;
          margin-top: 8px;
          background: #fff;
        }

        .pmya-selectRow{
          margin-top: 10px;
          display:grid;
          gap: 10px;
        }
        .pmya-radio{
          display:flex;
          gap: 10px;
          align-items:flex-start;
          cursor:pointer;
        }
        .pmya-radio input{ margin-top: 3px; }

        .pmya-addBtn{
          width: 100%;
          border: 1px solid #ddd;
          background:#f5f5f5;
          border-radius: 12px;
          padding: 12px 14px;
          font-weight: 1000;
          cursor:pointer;
        }

        .pmya-divider{
          margin: 14px 0;
          height: 1px;
          background: #eee;
        }

        .pmya-payRow{
          display:flex;
          justify-content: space-between;
          align-items:center;
          font-size: 14px;
          font-weight: 900;
          color:#444;
        }
        .pmya-payRow b{
          color:#FF6A00;
          font-size: 16px;
        }

        .pmya-confirm{
          margin-top: 12px;
          width: 100%;
          border: none;
          border-radius: 12px;
          padding: 12px 14px;
          font-weight: 1000;
          background:#FF6A00;
          color:#fff;
          cursor:pointer;
        }
        .pmya-confirm:disabled{
          opacity:.6;
          cursor:not-allowed;
        }
      `}</style>

      <div
        className="pmya-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose?.();
        }}
      >
        <div className="pmya-modal" role="dialog" aria-modal="true">
          <div className="pmya-head">
            <div>
              <h2 className="pmya-title">Confirmar Pedido</h2>
              <div className="pmya-sub">Selecciona la dirección de entrega</div>
            </div>

            <button className="pmya-close" type="button" onClick={onClose} aria-label="Cerrar">
              <X size={18} />
            </button>
          </div>

          <div className="pmya-body">
            {/* Dirección seleccionada (como la tarjeta naranja del ejemplo) */}
            <div className="pmya-box">
              {selected ? (
                <>
                  <div>{txt.linea1}</div>
                  <div>{txt.linea2}</div>
                  <div>{txt.linea3}</div>
                </>
              ) : (
                <div style={{ color: "#666" }}>
                  No tienes direcciones guardadas. Agrega una nueva.
                </div>
              )}
            </div>

            {/* selector (opcional si tienes varias) */}
            {direcciones?.length > 1 && (
              <div className="pmya-selectRow">
                {direcciones.map((d) => {
                  const t = formatDir(d);
                  return (
                    <label className="pmya-radio" key={d.id}>
                      <input
                        type="radio"
                        name="dir"
                        checked={String(selectedId) === String(d.id)}
                        onChange={() => setSelectedId(d.id)}
                      />
                      <div style={{ fontSize: 12, color: "#444", fontWeight: 800 }}>
                        <div>{t.linea1}</div>
                        <div style={{ fontWeight: 700, color: "#666" }}>{t.linea2}</div>
                        <div style={{ fontWeight: 700, color: "#666" }}>{t.linea3}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            <div style={{ marginTop: 10 }}>
              <button
                className="pmya-addBtn"
                type="button"
                onClick={() => {
                  onClose?.();
                  nav("/entrega"); // ✅ cambia a tu ruta real
                }}
              >
                Agregar nueva dirección
              </button>
            </div>

            <div className="pmya-divider" />

            <div className="pmya-payRow">
              <span>Total a pagar:</span>
              <b>${Number(total || 0).toFixed(2)}</b>
            </div>

            <button
              className="pmya-confirm"
              type="button"
              disabled={!selectedId || busy}
              onClick={async () => {
                if (!selectedId) return;
                try {
                  setBusy(true);
                  await onConfirm?.(selectedId);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Confirmar Pedido
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
