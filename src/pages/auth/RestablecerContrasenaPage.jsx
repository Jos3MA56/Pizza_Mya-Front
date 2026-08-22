import { useState } from "react";
import { Lock, AlertCircle, CheckCircle } from "lucide-react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { authApi } from "../../api/auth.api.js";
import PasswordField from "../../components/ui/PasswordField.jsx";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const token = params.get("token");

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const errs = {
    password: !form.password
      ? "Contraseña obligatoria"
      : form.password.length < 8
        ? "Mínimo 8 caracteres"
        : "",
    confirmPassword: !form.confirmPassword
      ? "Confirma tu contraseña"
      : form.password !== form.confirmPassword
        ? "Las contraseñas no coinciden"
        : "",
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setTouched({ password: true, confirmPassword: true });

    if (errs.password || errs.confirmPassword) {
      setError("Completa los campos correctamente.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await authApi.resetPassword({ token, password: form.password });
      setSuccess(true);
    } catch (err) {
      setError(err?.message || "No se pudo restablecer la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
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
          <div
            style={{
              width: 72,
              height: 72,
              background: "#f44336",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              color: "#fff",
            }}
          >
            <AlertCircle size={36} />
          </div>
          <h2 style={{ marginTop: 0 }}>Enlace inválido o expirado</h2>
          <p style={{ color: "#555" }}>
            Solicita uno nuevo para continuar con la recuperación de tu cuenta.
          </p>
          <button
            onClick={() => nav("/recuperar-cuenta")}
            style={{
              height: 48,
              border: "none",
              borderRadius: 12,
              background: "#B80E0E",
              color: "#fff",
              padding: "0 18px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Solicitar nuevo enlace
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .pmya-authPage{ min-height: calc(100vh - 86px - 26px - 22px - 280px); background:#f5f5f5; padding:22px 0 40px; }
        .pmya-authWrap{ width:min(650px,96vw); margin:0 auto; background:#fff; box-shadow:0 18px 45px rgba(0,0,0,.18); overflow:hidden; }
        .pmya-topbar{ height:86px; background:#FF6A00; display:flex; align-items:center; justify-content:center; }
        .pmya-topTitle{ margin:0; color:#fff; font-weight:900; letter-spacing:.6px; font-size:22px; text-transform:uppercase; }
        .pmya-body{ padding:32px 36px 28px; }
        .pmya-desc{ color:#666; font-size:14px; line-height:1.5; margin-bottom:24px; }
        .pmya-field{ margin-top:14px; }
        .pmya-label{ display:block; font-size:13px; font-weight:700; color:#111; margin-bottom:8px; }
        .pmya-inputWrap{ display:flex; align-items:center; gap:10px; border:2px solid #eee; border-radius:14px; padding:12px 14px; background:#fff; }
        .pmya-inputWrap:focus-within{ border-color: rgba(255,106,0,.55); box-shadow: 0 0 0 4px rgba(255,106,0,.14); }
        .pmya-input{ border:none; outline:none; width:100%; font-size:14px; color:#111; background:transparent; }
        .pmya-err{ margin-top:8px; font-size:12px; color:#b00020; font-weight:800; }
        .pmya-btnPrimary{ width:100%; height:56px; margin-top:18px; border:none; border-radius:14px; background:#B80E0E; color:#fff; font-weight:900; font-size:15px; cursor:pointer; }
        .pmya-btnPrimary:disabled{ opacity:.65; cursor:not-allowed; }
        .pmya-requirements{ margin-top:12px; padding:12px; background:#f9f9f9; border-radius:8px; font-size:12px; color:#666; }
      `}</style>

      <div className="pmya-authPage">
        <div className="pmya-authWrap">
          <div className="pmya-topbar">
            <h2 className="pmya-topTitle">NUEVA CONTRASEÑA</h2>
          </div>

          <div className="pmya-body">
            {success ? (
              <div
                style={{
                  background: "#e8f5e9",
                  border: "2px solid #4caf50",
                  borderRadius: 14,
                  padding: 32,
                  textAlign: "center",
                }}
              >
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
                  Contraseña actualizada
                </h3>
                <p style={{ color: "#555", lineHeight: 1.6 }}>
                  Tu contraseña se restableció correctamente. Ya puedes iniciar
                  sesión con tu nueva clave.
                </p>
                <Link
                  to="/login"
                  style={{
                    color: "#FF6A00",
                    fontWeight: 800,
                    textDecoration: "none",
                  }}
                >
                  Ir al login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <p className="pmya-desc">
                  Ingresa una contraseña segura y diferente a las anteriores.
                </p>

                <div className="pmya-requirements">
                  <strong>Requisitos:</strong>
                  <ul style={{ margin: "8px 0 0 18px", padding: 0 }}>
                    <li>Mínimo 8 caracteres</li>
                    <li>Se recomienda combinar letras y números</li>
                  </ul>
                </div>

                <div className="pmya-field" style={{ marginTop: 20 }}>
                  <label className="pmya-label" htmlFor="reset-password">
                    Nueva contraseña
                  </label>
                  <PasswordField
                    id="reset-password"
                    leftIcon={<Lock size={18} color="#94a3b8" />}
                    wrapperClassName="pmya-inputWrap pmya-passwordField"
                    inputClassName="pmya-input"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, password: e.target.value }))
                    }
                    onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                    aria-invalid={Boolean(touched.password && errs.password)}
                  />
                  {touched.password && errs.password ? (
                    <div className="pmya-err">{errs.password}</div>
                  ) : null}
                </div>

                <div className="pmya-field">
                  <label
                    className="pmya-label"
                    htmlFor="reset-confirm-password"
                  >
                    Confirmar contraseña
                  </label>
                  <PasswordField
                    id="reset-confirm-password"
                    leftIcon={<Lock size={18} color="#94a3b8" />}
                    wrapperClassName="pmya-inputWrap pmya-passwordField"
                    inputClassName="pmya-input"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        confirmPassword: e.target.value,
                      }))
                    }
                    onBlur={() =>
                      setTouched((p) => ({ ...p, confirmPassword: true }))
                    }
                    aria-invalid={Boolean(
                      touched.confirmPassword && errs.confirmPassword,
                    )}
                  />
                  {touched.confirmPassword && errs.confirmPassword ? (
                    <div className="pmya-err">{errs.confirmPassword}</div>
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
                  {loading ? "Actualizando..." : "Restablecer contraseña"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
