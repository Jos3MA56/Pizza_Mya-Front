import { NavLink } from "react-router-dom";

export default function ErrorScreen({
  code = 500,
  title = "Error de Conexión",
  message = "No se pudo contactar con el servidor. Verifica tu conexión o intenta más tarde.",
  icon = "🔥",
}) {
  return (
    <>
      <style>{`
        .pmya-errWrap{
          min-height: calc(100vh - 100px - 26px - 22px - 260px);
          display:flex;
          align-items:center;
          justify-content:center;
          padding: 40px 16px 190px;
          background: radial-gradient(ellipse at top, rgba(255,106,0,.12), transparent 55%),
                      linear-gradient(#ffffff, #fff8f2);
        }
        .pmya-errCard{
          width: min(920px, 92vw);
          border-radius: 18px;
          padding: 108px 22px 109px;
          text-align:center;
          background: rgba(255,255,255,.78);
          box-shadow: 0 18px 40px rgba(0,0,0,.10);
          border: 1px solid rgba(0,0,0,.06);
        }
        .pmya-errIcon{
          width: 74px; height: 74px;
          border-radius: 50%;
          margin: 0 auto 14px;
          display:flex; align-items:center; justify-content:center;
          font-size: 34px;
          color: #FF6A00;
          border: 4px solid rgba(255,106,0,.45);
          background: rgba(255,106,0,.08);
        }
        .pmya-errCode{
          font-size: 86px;
          font-weight: 900;
          line-height: 1;
          margin: 6px 0 6px;
          color: #FF6A00;
          letter-spacing: -2px;
        }
        .pmya-errTitle{
          font-size: 18px;
          font-weight: 800;
          margin: 6px 0 8px;
          color: #333;
        }
        .pmya-errMsg{
          max-width: 520px;
          margin: 0 auto 18px;
          font-size: 13px;
          line-height: 1.4;
          color: #6b6b6b;
        }
        .pmya-errBtn{
          display:inline-flex;
          align-items:center;
          justify-content:center;
          gap: 10px;
          padding: 12px 18px;
          border-radius: 999px;
          background: #B80E0E;
          color: #fff;
          font-weight: 800;
          font-size: 13px;
          border: none;
          cursor: pointer;
          text-decoration:none;
          box-shadow: 0 12px 24px rgba(184,14,14,.25);
        }
        .pmya-errBtn:hover{ filter: brightness(1.02); }
        .pmya-errBtn:active{ transform: scale(.99); }
      `}</style>

      <div className="pmya-errWrap">
        <div className="pmya-errCard">
          <div className="pmya-errIcon">{icon}</div>

          <div className="pmya-errCode">{code}</div>
          <div className="pmya-errTitle">{title}</div>
          <div className="pmya-errMsg">{message}</div>

          <NavLink className="pmya-errBtn" to="/">
            🏠 Volver al Inicio
          </NavLink>
        </div>
      </div>
    </>
  );
}
