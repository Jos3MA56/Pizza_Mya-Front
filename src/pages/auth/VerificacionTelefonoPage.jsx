import { useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, MessageCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { authApi } from "../../api/auth.api.js";

function maskPhone(phone = "") {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length < 4) return phone;
  return `${digits.slice(0, 3)}****${digits.slice(-3)}`;
}

export default function VerifyCodePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyPhoneLogin } = useAuth();

  const phone = searchParams.get("phone") || "";
  const method = searchParams.get("method") || "whatsapp";
  const next = searchParams.get("next") || "/";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const maskedPhone = useMemo(() => maskPhone(phone), [phone]);

  const handleVerify = async (e) => {
    e.preventDefault();
    const cleanCode = String(code).trim();

    if (!/^\d{6}$/.test(cleanCode)) {
      setError("El código debe tener 6 dígitos");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const result = await verifyPhoneLogin({ phone, code: cleanCode });
      setSuccess("Código verificado correctamente");

      const redirectPath =
        result?.redirectPath && result.redirectPath !== "/"
          ? result.redirectPath
          : next;
      navigate(redirectPath || "/", { replace: true });
    } catch (err) {
      setError(err?.message || "No se pudo verificar el código");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      setError("");
      setSuccess("");
      await authApi.sendPhoneCode({ phone, method });
      setSuccess("Te enviamos un nuevo código por WhatsApp");
    } catch (err) {
      setError(err?.message || "No se pudo reenviar el código");
    } finally {
      setResending(false);
    }
  };

  if (!phone) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 120px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: 24,
            borderRadius: 18,
            maxWidth: 460,
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,.12)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Información incompleta</h2>
          <p style={{ color: "#555" }}>
            No se encontró el número a verificar. Vuelve a solicitar tu código.
          </p>
          <Link
            to="/login-telefono"
            style={{
              fontWeight: 800,
              color: "#FF6A00",
              textDecoration: "none",
            }}
          >
            Regresar a login por teléfono
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .wa-page{ min-height: calc(100vh - 86px - 26px - 22px - 280px); background:#f5f5f5; padding:22px 0 40px; }
        .wa-wrap{ width:min(650px,96vw); margin:0 auto; background:#fff; box-shadow:0 18px 45px rgba(0,0,0,.18); overflow:hidden; }
        .wa-topbar{ height:86px; background:#FF6A00; display:flex; align-items:center; justify-content:center; position:relative; }
        .wa-back{ position:absolute; left:20px; color:#fff; text-decoration:none; font-size:13px; font-weight:800; display:flex; align-items:center; gap:6px; }
        .wa-title{ margin:0; color:#fff; font-weight:900; letter-spacing:.6px; font-size:22px; text-transform:uppercase; }
        .wa-body{ padding:32px 36px 28px; }
        .wa-box{ background:#f8fafc; border-radius:14px; padding:18px; margin-bottom:18px; display:flex; gap:12px; }
        .wa-box svg{ color:#25D366; flex-shrink:0; }
        .wa-label{ display:block; font-size:13px; font-weight:700; color:#111; margin-bottom:8px; }
        .wa-inputWrap{ display:flex; align-items:center; gap:10px; border:2px solid #eee; border-radius:14px; padding:12px 14px; background:#fff; }
        .wa-inputWrap:focus-within{ border-color: rgba(255,106,0,.55); box-shadow: 0 0 0 4px rgba(255,106,0,.14); }
        .wa-input{ border:none; outline:none; width:100%; font-size:20px; font-weight:800; letter-spacing:6px; text-align:center; }
        .wa-err{ margin-top:8px; font-size:12px; color:#b00020; font-weight:800; }
        .wa-ok{ margin-top:8px; font-size:12px; color:#166534; font-weight:800; }
        .wa-btnPrimary,.wa-btnGhost{ width:100%; height:54px; border:none; border-radius:14px; font-weight:900; font-size:15px; cursor:pointer; }
        .wa-btnPrimary{ margin-top:18px; background:#B80E0E; color:#fff; }
        .wa-btnGhost{ margin-top:12px; background:#fff3; color:#FF6A00; border:2px solid #FF6A00; }
        .wa-btnPrimary:disabled,.wa-btnGhost:disabled{ opacity:.65; cursor:not-allowed; }
      `}</style>

      <div className="wa-page">
        <div className="wa-wrap">
          <div className="wa-topbar">
            <Link
              className="wa-back"
              to={`/login-telefono?next=${encodeURIComponent(next)}`}
            >
              <ArrowLeft size={18} /> Volver
            </Link>
            <h2 className="wa-title">VERIFICA TU CÓDIGO</h2>
          </div>

          <div className="wa-body">
            <div className="wa-box">
              <ShieldCheck size={20} />
              <div>
                <strong>Te enviamos un código a {maskedPhone}</strong>
                <div style={{ color: "#555", marginTop: 4, fontSize: 14 }}>
                  Ingresa el código de 6 dígitos recibido por WhatsApp para
                  continuar.
                </div>
              </div>
            </div>

            <form onSubmit={handleVerify} noValidate>
              <label className="wa-label" htmlFor="phone-code-input">
                Código de verificación
              </label>
              <div className="wa-inputWrap">
                <MessageCircle size={18} color="#94a3b8" />
                <input
                  id="phone-code-input"
                  className="wa-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="123456"
                  value={code}
                  onChange={(e) => {
                    setCode(
                      String(e.target.value).replace(/\D/g, "").slice(0, 6),
                    );
                    if (error) setError("");
                  }}
                  aria-invalid={Boolean(error)}
                />
              </div>

              {error ? (
                <div className="wa-err" role="alert">
                  {error}
                </div>
              ) : null}
              {success ? (
                <div className="wa-ok" role="status">
                  {success}
                </div>
              ) : null}

              <button
                className="wa-btnPrimary"
                type="submit"
                disabled={loading}
              >
                {loading ? "Verificando..." : "Verificar y continuar"}
              </button>

              <button
                className="wa-btnGhost"
                type="button"
                disabled={resending}
                onClick={handleResend}
              >
                {resending ? "Reenviando..." : "Reenviar código"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
