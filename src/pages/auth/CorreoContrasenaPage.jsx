import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { authApi } from "../../api/auth.api.js";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailError = touched
    ? !email.trim()
      ? "El correo es obligatorio"
      : !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/.test(email)
        ? "Ingresa un correo válido"
        : ""
    : "";

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setTouched(true);

    if (emailError) {
      setError("Completa el correo correctamente para continuar.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await authApi.forgotPassword({ email: email.trim() });
      setSuccess(true);
    } catch (err) {
      setError(err?.message || "Error al enviar el correo. Intenta de nuevo.");
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
        .pmya-backBtn{ position:absolute; left:20px; color:#fff; text-decoration:none; font-size:13px; font-weight:800; display:flex; align-items:center; gap:6px; }
        .pmya-topTitle{ margin:0; color:#fff; font-weight:900; letter-spacing:.6px; font-size:22px; text-transform:uppercase; }
        .pmya-body{ padding:32px 36px 28px; }
        .pmya-desc{ color:#666; font-size:14px; line-height:1.5; margin-bottom:24px; text-align:center; }
        .pmya-field{ margin-top:14px; }
        .pmya-label{ display:block; font-size:13px; font-weight:700; color:#111; margin-bottom:8px; }
        .pmya-inputWrap{ display:flex; align-items:center; gap:10px; border:2px solid #eee; border-radius:14px; padding:12px 14px; background:#fff; }
        .pmya-inputWrap:focus-within{ border-color: rgba(255,106,0,.55); box-shadow: 0 0 0 4px rgba(255,106,0,.14); }
        .pmya-input{ border:none; outline:none; width:100%; font-size:14px; color:#111; background:transparent; }
        .pmya-err{ margin-top:8px; font-size:12px; color:#b00020; font-weight:800; }
        .pmya-btnPrimary,.pmya-btnSecondary{ width:100%; height:56px; margin-top:18px; border:none; border-radius:14px; font-weight:900; font-size:15px; cursor:pointer; }
        .pmya-btnPrimary{ background:#B80E0E; color:#fff; }
        .pmya-btnSecondary{ background:transparent; color:#FF6A00; border:2px solid #FF6A00; }
        .pmya-success{ background:#e8f5e9; border:2px solid #4caf50; border-radius:14px; padding:32px; text-align:center; }
      `}</style>

      <div className="pmya-authPage">
        <div className="pmya-authWrap">
          <div className="pmya-topbar">
            <Link to="/login" className="pmya-backBtn">
              <ArrowLeft size={18} /> Volver
            </Link>
            <h2 className="pmya-topTitle">RECUPERAR CONTRASEÑA</h2>
          </div>

          <div className="pmya-body">
            {success ? (
              <div className="pmya-success">
                <div
                  style={{
                    width: 72,
                    height: 72,
                    background: "#4caf50",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    color: "#fff",
                  }}
                >
                  <CheckCircle size={36} />
                </div>
                <h3 style={{ marginTop: 0, color: "#166534" }}>
                  Revisa tu correo
                </h3>
                <p style={{ color: "#555", lineHeight: 1.6 }}>
                  Si la cuenta existe, te enviamos instrucciones para
                  restablecer tu contraseña.
                </p>
                <Link
                  to="/login"
                  style={{
                    color: "#FF6A00",
                    fontWeight: 800,
                    textDecoration: "none",
                  }}
                >
                  Volver a iniciar sesión
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <p className="pmya-desc">
                  Ingresa el correo con el que te registraste y te enviaremos un
                  enlace seguro para recuperar tu cuenta.
                </p>

                <div className="pmya-field">
                  <label className="pmya-label" htmlFor="forgot-email">
                    Correo electrónico
                  </label>
                  <div className="pmya-inputWrap">
                    <Mail size={18} color="#94a3b8" />
                    <input
                      id="forgot-email"
                      className="pmya-input"
                      type="email"
                      placeholder="tu@email.com"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      onBlur={() => setTouched(true)}
                      aria-invalid={Boolean(emailError)}
                      aria-describedby={
                        emailError ? "forgot-email-error" : undefined
                      }
                    />
                  </div>
                  {emailError ? (
                    <div id="forgot-email-error" className="pmya-err">
                      {emailError}
                    </div>
                  ) : null}
                </div>

                {error ? (
                  <div className="pmya-err" role="alert">
                    {error}
                  </div>
                ) : null}

                <button
                  className="pmya-btnPrimary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Enviando..." : "Enviar enlace"}
                </button>

                <Link
                  to="/login"
                  className="pmya-btnSecondary"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                  }}
                >
                  Volver al login
                </Link>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
