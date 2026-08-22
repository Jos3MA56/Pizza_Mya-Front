export const CONFIG_STYLES = `
                .config-wrap { padding: 0; }
                .config-title { margin: 0; font-size: 28px; font-weight: 900; color: #111; }
                .config-sub { margin: 6px 0 24px; color: #777; font-weight: 600; }
                .config-actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 16px; margin-bottom: 24px; }
                .action-card { background: #fff; border-radius: 14px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 2px solid transparent; transition: all 0.3s; cursor: pointer; }
                .action-card:hover { border-color: #e50914; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(229,9,20,0.15); }
                .action-icon { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 12px; }
                .action-title { margin: 0 0 8px; font-size: 18px; font-weight: 900; color: #111; }
                .action-desc { margin: 0; font-size: 13px; color: #64748b; line-height: 1.5; }
                .config-summary { background: #fff; border-radius: 14px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); margin-bottom: 24px; }
                .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap: 16px; }
                .summary-item { padding: 12px; background: #f8fafc; border-radius: 8px; }
                .summary-label { font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 4px; }
                .summary-value { font-size: 14px; font-weight: 900; color: #111; }
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px; }
                .modal-content { background: #fff; border-radius: 16px; padding: clamp(18px, 4vw, 32px); max-width: 760px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
                .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #f0f0f0; }
                .modal-title { margin: 0; font-size: 22px; font-weight: 900; color: #111; }
                .modal-close { width: 36px; height: 36px; border-radius: 8px; border: none; background: #f1f5f9; color: #64748b; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
                .modal-close:hover { background: #e2e8f0; }
                .form-group { margin-bottom: 16px; }
                .form-group label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 700; color: #334155; }
                .form-group input, .form-group textarea { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; font-family: inherit; box-sizing: border-box; }
                .form-group input:focus, .form-group textarea:focus { outline: none; border-color: #e50914; box-shadow: 0 0 0 3px rgba(229,9,20,0.1); }
                .password-field-shell { display: flex; align-items: center; gap: 8px; width: 100%; padding: 0 12px; border: 1px solid #ddd; border-radius: 8px; background: #fff; }
                .password-field-shell:focus-within { border-color: #e50914; box-shadow: 0 0 0 3px rgba(229,9,20,0.1); }
                .password-field-shell input { width: 100%; padding: 10px 0; border: none; outline: none; box-shadow: none; }
                .password-field-shell .pmya-passwordToggle { color: #64748b; }
                .form-row { display: grid; grid-template-columns: var(--adm-grid-two-even); gap: 12px; }
                .btn { padding: 12px 24px; border: none; border-radius: 8px; font-weight: 900; font-size: 14px; cursor: pointer; }
                .btn-primary { background: #e50914; color: #fff; }
                .btn-primary:hover { background: #c90812; }
                .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
                .btn-secondary { background: #f1f5f9; color: #334155; }
                .btn-danger { background: #b91c1c; color: #fff; }
                .message { padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-weight: 700; }
                .message.success { background: #ddffe8; color: #0a7a34; }
                .message.error { background: #ffe5e5; color: #b00020; }
                .save-actions { display: flex; gap: 12px; justify-content: flex-end; flex-wrap: wrap; }
                .brand-preview { display:flex; align-items:center; justify-content:center; min-height:140px; background:#f8fafc; border:1px dashed #dbe3ea; border-radius:14px; margin-bottom:16px; overflow:hidden; }
                .brand-preview img { max-width:220px; max-height:110px; object-fit:contain; display:block; }
                .promo-card { border:1px solid #e5e7eb; border-radius:12px; padding:16px; background:#fafafa; margin-bottom:14px; }
                .promo-preview { width:100%; height:140px; border-radius:10px; background:#fff; border:1px dashed #dbe3ea; display:flex; align-items:center; justify-content:center; overflow:hidden; margin-bottom:12px; }
                .promo-preview img { width:100%; height:100%; object-fit:cover; display:block; }
                .section-divider { height:1px; background:#eef2f7; margin:22px 0; }
                @media (max-width: 560px) { .modal-overlay { padding: 10px; align-items: flex-start; } .modal-header { gap: 12px; } .save-actions > .btn, .save-actions > button { width: 100%; } }
            `;

export function ConfigMessage({ message }) {
  if (!message) return null;
  return (
    <div
      className={`message ${message.type}`}
      role={message.type === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      {message.text}
    </div>
  );
}

export function ConfigActionCard({ iconBg, icon, title, children, onClick }) {
  return (
    <div className="action-card" onClick={onClick}>
      <div className="action-icon" style={{ background: iconBg }}>
        {icon}
      </div>
      <h3 className="action-title">{title}</h3>
      <p className="action-desc">{children}</p>
    </div>
  );
}

export function ConfigSummary({ config }) {
  return (
    <div className="config-summary">
      <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "900" }}>
        Resumen de Configuración
      </h3>
      <div className="summary-grid">
        <div className="summary-item">
          <div className="summary-label">Costo de Envío</div>
          <div className="summary-value">${config?.costo_envio || "0"}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Pedido Mínimo</div>
          <div className="summary-value">${config?.pedido_minimo || "0"}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Tiempo Preparación</div>
          <div className="summary-value">
            {config?.tiempo_preparacion_min || 0} min
          </div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Estado</div>
          <div
            className="summary-value"
            style={{ color: config?.tienda_abierta ? "#0a7a34" : "#b00020" }}
          >
            {config?.tienda_abierta ? "Abierta" : "Cerrada"}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ConfigModalShell({ open, onClose, title, dialogId, children }) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogId}
      >
        <div className="modal-header">
          <h2 className="modal-title" id={dialogId}>
            {title}
          </h2>
          <button
            className="modal-close"
            onClick={onClose}
            type="button"
            aria-label="Cerrar ventana"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
