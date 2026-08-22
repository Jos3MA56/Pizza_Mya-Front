import { useMemo, useState } from "react";
import { Mail, Lock, Smartphone } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { authApi } from "../../api/auth.api.js";
import PasswordField from "../../components/ui/PasswordField.jsx";

function normalizeRole(raw) {
  return String(raw || "")
    .trim()
    .toLowerCase();
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/";
  const { login, getRedirectPath } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const errs = useMemo(() => {
    const currentErrors = {};

    if (!form.email.trim()) {
      currentErrors.email = "Correo obligatorio";
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/.test(form.email)
    ) {
      currentErrors.email = "Correo inválido";
    }

    if (!form.password.trim()) {
      currentErrors.contrasena = "Contraseña obligatoria";
    } else if (form.password.length < 8) {
      currentErrors.contrasena = "Mínimo 8 caracteres";
    }

    return currentErrors;
  }, [form]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const resolveRedirectAfterLogin = (user) => {
    const role = normalizeRole(user?.rol || user?.role || user?.tipo);
    if (role === "admin" || role === "cajero") return getRedirectPath();
    return next || "/";
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setTouched({ email: true, password: true });

    if (Object.keys(errs).length > 0) {
      setError("Completa los campos correctamente para continuar.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = await authApi.login({
        email: form.email.trim(),
        password: form.password,
      });

      const token = data?.token || data?.accessToken || data?.jwt;
      const user =
        data?.user || data?.usuario || data?.data?.user || data?.data?.usuario;

      if (!token || !user) {
        throw new Error("Respuesta inválida del servidor");
      }

      login({ token, user });
      navigate(resolveRedirectAfterLogin(user), { replace: true });
    } catch (err) {
      setError(
        err?.message ||
          "Correo o contraseña incorrectos. Verifica tus datos e inténtalo otra vez.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .pmya-authPage{ min-height: calc(100vh - 86px - 26px - 22px - 280px); background:#f5f5f5; padding:22px 0 40px; }
        .pmya-authWrap{ width:min(1050px,96vw); margin:0 auto; background:#fff; box-shadow:0 18px 45px rgba(0,0,0,.18); display:grid; grid-template-columns:1.05fr 1fr; overflow:hidden; }
        @media (max-width:860px){ .pmya-authWrap{ grid-template-columns:1fr; } .pmya-left{ display:none; } }
        .pmya-left{ background:#111; }
        .pmya-leftImg{ width:100%; height:100%; object-fit:cover; display:block; }
        .pmya-right{ display:flex; flex-direction:column; background:#fff; }
        .pmya-topbar{ height:86px; background:#FF6A00; display:flex; align-items:center; justify-content:center; }
        .pmya-topTitle{ margin:0; color:#fff; font-weight:900; letter-spacing:.6px; font-size:22px; text-transform:uppercase; }
        .pmya-body{ padding:22px 26px 18px; }
        .pmya-field{ margin-top:14px; }
        .pmya-label{ display:block; font-size:13px; font-weight:700; color:#111; margin-bottom:8px; }
        .pmya-inputWrap{ display:flex; align-items:center; gap:10px; border:2px solid #eee; border-radius:14px; padding:12px 14px; background:#fff; transition:border-color .2s, box-shadow .2s; }
        .pmya-inputWrap:focus-within{ border-color:rgba(255,106,0,.55); box-shadow:0 0 0 4px rgba(255,106,0,.14); }
        .pmya-icon{ color:#bbb; }
        .pmya-input{ border:none; outline:none; width:100%; font-size:14px; color:#111; background:transparent; }
        .pmya-input::placeholder{ color:#b7b7b7; }
        .pmya-err{ margin-top:8px; font-size:12px; color:#b00020; font-weight:800; }
        .pmya-link{ font-size:13px; font-weight:700; color:#FF6A00; text-decoration:none; }
        .pmya-link:hover{ text-decoration:underline; }
        .pmya-btnPrimary{ width:100%; height:56px; margin-top:18px; border:none; border-radius:14px; background:#B80E0E; color:#fff; font-weight:900; font-size:15px; cursor:pointer; transition:filter .2s, opacity .2s; }
        .pmya-btnPrimary:hover{ filter:brightness(.96); }
        .pmya-btnPrimary:disabled{ opacity:.65; cursor:not-allowed; }
        .pmya-btnGhost{ width:100%; margin-top:14px; border:none; background:transparent; color:#FF6A00; font-weight:800; font-size:13px; cursor:pointer; padding:12px; }
        .pmya-btnSecondary{ width:100%; height:48px; margin-top:12px; border:2px solid #25D366; border-radius:14px; background:transparent; color:#25D366; font-weight:800; font-size:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:background .2s; }
        .pmya-btnSecondary:hover{ background:rgba(37,211,102,.08); }
        .pmya-divider{ margin:20px 0; text-align:center; position:relative; }
        .pmya-divider::before{ content:""; position:absolute; top:50%; left:0; right:0; height:1px; background:#e0e0e0; }
        .pmya-divider span{ position:relative; background:#fff; padding:0 12px; color:#999; font-size:12px; font-weight:700; }
        .pmya-footLinks{ margin-top:12px; text-align:center; font-size:13px; color:#666; font-weight:600; padding:12px 0; }
        .pmya-footTiny{ margin-top:14px; text-align:center; font-size:12px; color:#777; line-height:1.45; }
        .pmya-footTiny a{ color:#FF6A00; font-weight:800; text-decoration:none; }
        .pmya-footTiny a:hover{ text-decoration:underline; }
        .pmya-forgotLink{ display:block; text-align:right; margin-top:8px; font-size:12px; color:#FF6A00; text-decoration:none; font-weight:700; }
        .pmya-forgotLink:hover{ text-decoration:underline; }
      `}</style>

      <div className="pmya-authPage">
        <div className="pmya-authWrap">
          <div className="pmya-left">
            <img
              className="pmya-leftImg"
              src="/img/regislogin.png"
              alt="Pizza Mya"
            />
          </div>

          <div className="pmya-right">
            <div className="pmya-topbar">
              <h2 className="pmya-topTitle">INICIA SESIÓN</h2>
            </div>

            <div className="pmya-body">
              <form onSubmit={onSubmit} noValidate>
                <div className="pmya-field" style={{ marginTop: 0 }}>
                  <label className="pmya-label" htmlFor="login-email">
                    Correo electrónico
                  </label>
                  <div className="pmya-inputWrap">
                    <Mail className="pmya-icon" size={18} />
                    <input
                      id="login-email"
                      className="pmya-input"
                      type="email"
                      placeholder="tu@email.com"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, email: true }))
                      }
                      autoComplete="email"
                      aria-invalid={Boolean(touched.email && errs.email)}
                      aria-describedby={
                        touched.email && errs.email
                          ? "login-email-error"
                          : undefined
                      }
                    />
                  </div>
                  {touched.email && errs.email ? (
                    <div id="login-email-error" className="pmya-err">
                      {errs.email}
                    </div>
                  ) : null}
                </div>

                <div className="pmya-field">
                  <label className="pmya-label" htmlFor="login-password">
                    Contraseña
                  </label>
                  <PasswordField
                    id="login-password"
                    leftIcon={<Lock className="pmya-icon" size={18} />}
                    wrapperClassName="pmya-inputWrap pmya-passwordField"
                    inputClassName="pmya-input"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, password: true }))
                    }
                    autoComplete="current-password"
                    aria-invalid={Boolean(touched.password && errs.password)}
                    aria-describedby={
                      touched.password && errs.password
                        ? "login-password-error"
                        : undefined
                    }
                  />
                  {touched.password && errs.password ? (
                    <div id="login-password-error" className="pmya-err">
                      {errs.password}
                    </div>
                  ) : null}
                  <Link to="/recuperar-cuenta" className="pmya-forgotLink">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                {error ? (
                  <div
                    className="pmya-err"
                    role="alert"
                    style={{
                      marginTop: 12,
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: "#ffe5e5",
                      border: "1px solid #fecaca",
                    }}
                  >
                    {error}
                  </div>
                ) : null}

                <button
                  className="pmya-btnPrimary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Iniciando sesión..." : "Continuar"}
                </button>

                <div className="pmya-divider">
                  <span>Opciones alternativas</span>
                </div>

                <button
                  className="pmya-btnSecondary"
                  type="button"
                  onClick={() =>
                    navigate(`/login-telefono?next=${encodeURIComponent(next)}`)
                  }
                >
                  <Smartphone size={16} /> Ingresar con teléfono
                </button>

                <button
                  className="pmya-btnGhost"
                  type="button"
                  onClick={() => navigate(next)}
                >
                  Continuar como invitado
                </button>

                <div className="pmya-footLinks">
                  ¿Aún no tienes cuenta?{" "}
                  <Link className="pmya-link" to="/registro">
                    Regístrate aquí
                  </Link>
                </div>

                <div className="pmya-footTiny">
                  Al continuar, aceptas nuestros{" "}
                  <Link to="/terminos">Términos y Condiciones</Link>.
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
