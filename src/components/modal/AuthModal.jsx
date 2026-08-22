import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, X } from "lucide-react";
import { authApi } from "../../api/auth.api.js";
import PasswordField from "../ui/PasswordField.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import RegisterModal from "./RegistroModal.jsx";

export default function AuthModal({ open, onClose }) {
  const navigate = useNavigate();
  const { login, getRedirectPath } = useAuth();
  const [view, setView] = useState("login");
  const [form, setForm] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageSrc, setImageSrc] = useState("/img/regislogin.png");

  const errs = useMemo(() => {
    const errors = {};
    if (!form.email.trim()) errors.email = "Correo obligatorio";
    else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/.test(form.email)
    )
      errors.email = "Correo inválido";
    if (!form.password.trim()) errors.contrasena = "Contraseña obligatoria";
    return errors;
  }, [form]);

  if (!open) return null;

  const closeAll = () => {
    setError("");
    setTouched({});
    setForm({ email: "", password: "" });
    setView("login");
    onClose?.();
  };

  if (view === "register") {
    return (
      <RegisterModal
        open={open}
        onClose={closeAll}
        onBack={() => setView("login")}
      />
    );
  }

  const onSubmit = async (event) => {
    event.preventDefault();
    setTouched({ email: true, password: true });

    if (Object.keys(errs).length) {
      setError("Completa los campos para continuar.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await authApi.login({
        email: form.email.trim(),
        password: form.password,
      });
      const token = data?.token || data?.accessToken || data?.jwt;
      const user =
        data?.user || data?.usuario || data?.data?.user || data?.data?.usuario;

      if (!token || !user) throw new Error("Respuesta inválida del servidor");

      login({ token, user });
      closeAll();
      navigate(getRedirectPath(), { replace: true });
    } catch (err) {
      setError(err?.message || "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .pmya-overlay{ position: fixed; inset: 0; background: rgba(0,0,0,.55); display:flex; align-items:center; justify-content:center; z-index: 9999; padding: 18px; }
        .pmya-modal{ width: min(1050px, 96vw); height: min(640px, 92vh); background:#fff; box-shadow: 0 18px 45px rgba(0,0,0,.35); display:grid; grid-template-columns: 1.05fr 1fr; overflow:hidden; }
        @media (max-width: 860px){ .pmya-modal{ grid-template-columns: 1fr; height: auto; } .pmya-left{ display:none; } }
        .pmya-left{ background: #111; overflow:hidden; }
        .pmya-leftImg{ width:100%; height:100%; object-fit: cover; display:block; }
        .pmya-right{ display:flex; flex-direction: column; background:#fff; }
        .pmya-topbar{ height: 86px; background:#FF6A00; display:flex; align-items:center; justify-content:center; position: relative; }
        .pmya-topTitle{ margin:0; color:#fff; font-weight: 900; letter-spacing: .6px; font-size: 22px; text-transform: uppercase; }
        .pmya-close{ position:absolute; right: 18px; top: 50%; transform: translateY(-50%); border:none; background: transparent; color:#fff; cursor:pointer; padding: 6px; opacity: .95; }
        .pmya-body{ padding: 22px 26px 18px; flex: 1; }
        .pmya-field{ margin-top: 14px; }
        .pmya-label{ display:block; font-size: 13px; font-weight: 700; color:#666; margin-bottom: 8px; }
        .pmya-inputWrap{ display:flex; align-items:center; gap: 10px; border: 2px solid #eee; border-radius: 14px; padding: 12px 14px; background:#fff; }
        .pmya-inputWrap:focus-within{ border-color: rgba(255,106,0,.55); box-shadow: 0 0 0 4px rgba(255,106,0,.14); }
        .pmya-icon{ color:#bbb; flex: 0 0 auto; }
        .pmya-input{ border: none; outline: none; width:100%; font-size: 14px; color:#111; }
        .pmya-input::placeholder{ color:#b7b7b7; }
        .pmya-err{ margin-top: 8px; font-size: 12px; color:#b00020; font-weight: 800; }
        .pmya-rightLinkRow{ display:flex; justify-content:flex-end; margin-top: 10px; }
        .pmya-link{ font-size: 13px; font-weight: 700; color:#FF6A00; cursor:pointer; text-decoration:none; }
        .pmya-link:hover{ text-decoration: underline; }
        .pmya-btnPrimary{ width: 100%; height: 56px; margin-top: 18px; border:none; border-radius: 14px; background:#B80E0E; color:#fff; font-weight: 900; font-size: 15px; cursor:pointer; }
        .pmya-btnPrimary:disabled{ opacity:.7; cursor:not-allowed; }
        .pmya-btnGhost{ width: 100%; margin-top: 14px; border:none; background: transparent; color:#FF6A00; font-weight: 800; font-size: 13px; cursor:pointer; }
        .pmya-footLinks{ margin-top: 12px; text-align:center; font-size: 13px; color:#666; font-weight: 600; }
        .pmya-footTiny{ margin-top: 18px; text-align:center; font-size: 12px; color:#777; line-height: 1.3; }
      `}</style>

      <div className="pmya-overlay" onMouseDown={closeAll}>
        <div
          className="pmya-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="pmya-left">
            <img
              className="pmya-leftImg"
              src={imageSrc}
              alt="Pizza"
              draggable="false"
              onError={() => setImageSrc("/img/logo.png")}
            />
          </div>

          <div className="pmya-right">
            <div className="pmya-topbar">
              <h2 id="auth-modal-title" className="pmya-topTitle">
                INICIA SESIÓN
              </h2>
              <button
                className="pmya-close"
                type="button"
                onClick={closeAll}
                aria-label="Cerrar modal"
              >
                <X size={22} />
              </button>
            </div>

            <div className="pmya-body">
              <form onSubmit={onSubmit} noValidate>
                <div className="pmya-field">
                  <label className="pmya-label" htmlFor="modal-login-email">
                    Correo electrónico
                  </label>
                  <div className="pmya-inputWrap">
                    <Mail className="pmya-icon" size={18} />
                    <input
                      id="modal-login-email"
                      className="pmya-input"
                      type="email"
                      placeholder="tu@email.com"
                      value={form.email}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, email: e.target.value }))
                      }
                      onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                      autoComplete="email"
                      aria-invalid={Boolean(touched.email && errs.email)}
                    />
                  </div>
                  {touched.email && errs.email ? (
                    <div className="pmya-err">{errs.email}</div>
                  ) : null}
                </div>

                <div className="pmya-field">
                  <label className="pmya-label" htmlFor="modal-login-password">
                    Contraseña
                  </label>
                  <PasswordField
                    id="modal-login-password"
                    leftIcon={<Lock className="pmya-icon" size={18} />}
                    wrapperClassName="pmya-inputWrap pmya-passwordField"
                    inputClassName="pmya-input"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, password: e.target.value }))
                    }
                    onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                    autoComplete="current-password"
                    aria-invalid={Boolean(touched.password && errs.password)}
                  />
                  {touched.password && errs.password ? (
                    <div className="pmya-err">{errs.password}</div>
                  ) : null}
                </div>

                <div className="pmya-rightLinkRow">
                  <Link
                    className="pmya-link"
                    to="/recuperar-cuenta"
                    onClick={closeAll}
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
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
                  {loading ? "Ingresando..." : "Continuar"}
                </button>

                <button
                  className="pmya-btnGhost"
                  type="button"
                  onClick={closeAll}
                >
                  Continuar como invitado
                </button>

                <div className="pmya-footLinks">
                  ¿Aún no tienes cuenta?{" "}
                  <button
                    type="button"
                    className="pmya-link"
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: 0,
                    }}
                    onClick={() => setView("register")}
                  >
                    Regístrate aquí
                  </button>
                </div>

                <div className="pmya-footTiny">
                  Al continuar, aceptas nuestros{" "}
                  <Link className="pmya-link" to="/terminos" onClick={closeAll}>
                    Términos y Condiciones
                  </Link>
                  .
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
