import { useMemo, useState } from "react";
import { Smartphone, ArrowLeft, MessageCircle } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../../api/auth.api.js";

function normalizePhone(value = "") {
  return String(value).replace(/\D/g, "").slice(0, 10);
}

export default function PhoneLoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [phone, setPhone] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const phoneError = useMemo(() => {
    if (!touched) return "";
    if (!phone) return "El número de teléfono es obligatorio";
    if (!/^\d{10}$/.test(phone))
      return "Ingresa un número válido de 10 dígitos";
    return "";
  }, [phone, touched]);

  const handleSendWhatsApp = async () => {
    setTouched(true);

    if (!/^\d{10}$/.test(phone)) {
      setError("Completa el número correctamente para continuar.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await authApi.sendPhoneCode({
        phone,
        method: "whatsapp",
      });

      navigate(
        `/verificar-telefono?phone=${encodeURIComponent(phone)}&method=whatsapp&next=${encodeURIComponent(next)}`,
      );
    } catch (err) {
      setError(err?.message || "No se pudo enviar el código por WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .pmya-authPage{ min-height: calc(100vh - 86px - 26px - 22px - 280px); background:#f5f5f5; padding:22px 0 40px; }
        .pmya-authWrap{ width:min(650px,96vw); margin:0 auto; background:#fff; box-shadow:0 18px 45px rgba(0,0,0,.18); overflow:hidden; }
        .pmya-topbar{ height:86px; background:#FF6A00; display:flex; align-items:center; justify-content:center; position:relative; }
        .pmya-backBtn{ position:absolute; left:20px; background:none; border:none; color:#fff; cursor:pointer; display:flex; align-items:center; gap:6px; font-weight:700; font-size:13px; text-decoration:none; }
        .pmya-topTitle{ margin:0; color:#fff; font-weight:900; letter-spacing:.6px; font-size:22px; text-transform:uppercase; }
        .pmya-body{ padding:32px 36px 28px; }
        .pmya-desc{ color:#666; font-size:14px; line-height:1.5; margin-bottom:24px; text-align:center; }
        .pmya-infoBox{ background:#e8f5e9; border:2px solid #4caf50; border-radius:12px; padding:16px; margin:20px 0; display:flex; align-items:flex-start; gap:12px; }
        .pmya-infoBox svg{ flex-shrink:0; color:#388e3c; }
        .pmya-infoBox div{ font-size:13px; color:#2e7d32; line-height:1.5; }
        .pmya-infoBox strong{ display:block; margin-bottom:4px; }
        .pmya-field{ margin-top: 14px; }
        .pmya-label{ display:block; font-size:13px; font-weight:700; color:#111; margin-bottom:8px; }
        .pmya-inputWrap{ display:flex; align-items:center; gap:10px; border:2px solid #eee; border-radius:14px; padding:12px 14px; background:#fff; }
        .pmya-inputWrap:focus-within{ border-color: rgba(37,211,102,.55); box-shadow: 0 0 0 4px rgba(37,211,102,.14); }
        .pmya-icon{ color:#bbb; }
        .pmya-input{ border:none; outline:none; width:100%; font-size:14px; color:#111; background:transparent; }
        .pmya-err{ margin-top:8px; font-size:12px; color:#b00020; font-weight:800; }
        .pmya-whatsappBtn{ width:100%; height:56px; margin-top:18px; border:none; border-radius:14px; background:#25D366; color:#fff; font-weight:900; font-size:15px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; }
        .pmya-whatsappBtn:hover{ background:#128C7E; }
        .pmya-whatsappBtn:disabled{ opacity:.65; cursor:not-allowed; }
        .pmya-footTiny{ margin-top:18px; text-align:center; font-size:12px; color:#777; line-height:1.45; }
        .pmya-footTiny a{ color:#FF6A00; font-weight:800; text-decoration:none; }
      `}</style>

      <div className="pmya-authPage">
        <div className="pmya-authWrap">
          <div className="pmya-topbar">
            <Link
              to={`/login?next=${encodeURIComponent(next)}`}
              className="pmya-backBtn"
            >
              <ArrowLeft size={18} />
              Volver
            </Link>
            <h2 className="pmya-topTitle">LOGIN CON WHATSAPP</h2>
          </div>

          <div className="pmya-body">
            <p className="pmya-desc">
              Ingresa tu número de WhatsApp y te enviaremos un código de
              verificación.
            </p>

            <div className="pmya-infoBox">
              <MessageCircle size={20} />
              <div>
                <strong>¿Cómo funciona?</strong>
                Recibirás un mensaje con un código de 6 dígitos. Usa el número
                registrado en tu cuenta.
              </div>
            </div>

            <div className="pmya-field">
              <label className="pmya-label" htmlFor="phone-login-input">
                Número de WhatsApp
              </label>
              <div className="pmya-inputWrap">
                <Smartphone className="pmya-icon" size={18} />
                <input
                  id="phone-login-input"
                  className="pmya-input"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="7711234567"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => {
                    setPhone(normalizePhone(e.target.value));
                    if (error) setError("");
                  }}
                  onBlur={() => setTouched(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !loading) {
                      e.preventDefault();
                      handleSendWhatsApp();
                    }
                  }}
                  aria-invalid={Boolean(phoneError)}
                  aria-describedby={
                    phoneError ? "phone-login-error" : undefined
                  }
                />
              </div>
              {phoneError ? (
                <div id="phone-login-error" className="pmya-err">
                  {phoneError}
                </div>
              ) : null}
            </div>

            {error ? (
              <div className="pmya-err" role="alert">
                {error}
              </div>
            ) : null}

            <button
              className="pmya-whatsappBtn"
              type="button"
              disabled={loading}
              onClick={handleSendWhatsApp}
            >
              <MessageCircle size={18} />
              {loading ? "Enviando código..." : "Enviar código por WhatsApp"}
            </button>

            <div className="pmya-footTiny">
              Al continuar, aceptas nuestros{" "}
              <Link to="/terminos">Términos y Condiciones</Link>.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
