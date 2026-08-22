import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Lock, Mail, Phone, User, X } from "lucide-react";
import { authApi } from "../../api/auth.api.js";
import PasswordField from "../ui/PasswordField.jsx";

const initialState = {
  nombres: "",
  paterno: "",
  materno: "",
  nacimiento: "",
  email: "",
  telefono: "",
  password: "",
  password2: "",
};

export default function RegistroModal({ open, onClose, onBack }) {
  const [form, setForm] = useState(initialState);
  const [touched, setTouched] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageSrc, setImageSrc] = useState("/img/regislogin.png");

  const errs = useMemo(() => {
    const currentErrors = {};
    if (!form.nombres.trim()) currentErrors.nombres = "Campo obligatorio";
    if (!form.paterno.trim()) currentErrors.paterno = "Campo obligatorio";
    if (!form.materno.trim()) currentErrors.materno = "Campo obligatorio";
    if (!form.nacimiento) currentErrors.nacimiento = "Campo obligatorio";
    if (!form.email.trim()) currentErrors.email = "Campo obligatorio";
    else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/.test(form.email)
    )
      currentErrors.email = "Correo inválido";
    if (!form.telefono.trim()) currentErrors.telefono = "Campo obligatorio";
    else if (String(form.telefono).replace(/\D/g, "").length < 10)
      currentErrors.telefono = "Ingresa un teléfono válido";
    if (!form.password) currentErrors.contrasena = "Campo obligatorio";
    else if (form.password.length < 8)
      currentErrors.contrasena = "Mínimo 8 caracteres";
    if (!form.password2) currentErrors.contrasena2 = "Campo obligatorio";
    else if (form.password2 !== form.password)
      currentErrors.contrasena2 = "Las contraseñas no coinciden";
    return currentErrors;
  }, [form]);

  if (!open) return null;

  const closeAll = () => {
    setForm(initialState);
    setTouched({});
    setError("");
    onClose?.();
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setTouched({
      nombres: true,
      paterno: true,
      materno: true,
      nacimiento: true,
      email: true,
      telefono: true,
      password: true,
      password2: true,
    });

    if (Object.keys(errs).length) {
      setError("Completa los campos correctamente para continuar.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await authApi.register({
        nombres: form.nombres.trim(),
        paterno: form.paterno.trim(),
        materno: form.materno.trim(),
        nacimiento: form.nacimiento,
        email: form.email.trim(),
        telefono: form.telefono.trim(),
        password: form.password,
      });

      setForm(initialState);
      setTouched({});
      onBack?.();
    } catch (err) {
      setError(err?.message || "No se pudo completar el registro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .pmya-overlay{ position: fixed; inset: 0; background: rgba(0,0,0,.55); display:flex; align-items:center; justify-content:center; z-index: 9999; padding: 18px; }
        .pmya-modal{ width: min(1050px, 96vw); height: min(720px, 94vh); background:#fff; box-shadow: 0 18px 45px rgba(0,0,0,.35); display:grid; grid-template-columns: 1.05fr 1fr; overflow:hidden; }
        @media (max-width: 860px){ .pmya-modal{ grid-template-columns: 1fr; height: auto; } .pmya-left{ display:none; } }
        .pmya-left{ background: #111; overflow:hidden; }
        .pmya-leftImg{ width:100%; height:100%; object-fit: cover; display:block; }
        .pmya-right{ display:flex; flex-direction: column; background:#fff; }
        .pmya-topbar{ height: 86px; background:#FF6A00; display:flex; align-items:center; justify-content:center; position: relative; }
        .pmya-topTitle{ margin:0; color:#fff; font-weight: 900; letter-spacing: .6px; font-size: 22px; text-transform: uppercase; }
        .pmya-close{ position:absolute; right: 18px; top: 50%; transform: translateY(-50%); border:none; background: transparent; color:#fff; cursor:pointer; padding: 6px; opacity: .95; }
        .pmya-body{ padding: 18px 26px 18px; overflow:auto; }
        .pmya-grid2{ display:grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width:640px){ .pmya-grid2{ grid-template-columns: 1fr; } }
        .pmya-field{ margin-top: 12px; }
        .pmya-label{ display:block; font-size: 13px; font-weight: 700; color:#666; margin-bottom: 8px; }
        .pmya-inputWrap{ display:flex; align-items:center; gap: 10px; border: 2px solid #eee; border-radius: 14px; padding: 12px 14px; background:#fff; }
        .pmya-inputWrap:focus-within{ border-color: rgba(255,106,0,.55); box-shadow: 0 0 0 4px rgba(255,106,0,.14); }
        .pmya-icon{ color:#bbb; }
        .pmya-input{ border:none; outline:none; width:100%; font-size:14px; color:#111; background:transparent; }
        .pmya-input::placeholder{ color:#b7b7b7; }
        .pmya-err{ margin-top: 8px; font-size: 12px; color:#b00020; font-weight: 800; }
        .pmya-btnPrimary{ width: 100%; height: 56px; margin-top: 18px; border:none; border-radius: 14px; background:#B80E0E; color:#fff; font-weight: 900; font-size: 15px; cursor:pointer; }
        .pmya-btnPrimary:disabled{ opacity:.65; cursor:not-allowed; }
        .pmya-back{ margin-top: 10px; text-align:center; color:#666; font-size: 13px; font-weight: 700; padding: 12px }
        .pmya-link{ color:#FF6A00; font-weight: 900; text-decoration:none; }
        .pmya-link:hover{ text-decoration: underline; }
        .pmya-footTiny{ margin-top: 14px; text-align:center; font-size: 12px; color:#777; line-height: 1.3; }
      `}</style>

      <div className="pmya-overlay" onMouseDown={closeAll}>
        <div
          className="pmya-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="register-modal-title"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="pmya-left">
            <img
              className="pmya-leftImg"
              src={imageSrc}
              alt="Pizza"
              onError={() => setImageSrc("/img/logo.png")}
            />
          </div>

          <div className="pmya-right">
            <div className="pmya-topbar">
              <h2 id="register-modal-title" className="pmya-topTitle">
                REGÍSTRATE
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
                <div className="pmya-field" style={{ marginTop: 0 }}>
                  <label
                    className="pmya-label"
                    htmlFor="modal-registro-nombres"
                  >
                    Nombres *
                  </label>
                  <div className="pmya-inputWrap">
                    <User className="pmya-icon" size={18} />
                    <input
                      id="modal-registro-nombres"
                      className="pmya-input"
                      placeholder="Juan Carlos"
                      value={form.nombres}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, nombres: e.target.value }))
                      }
                      onBlur={() =>
                        setTouched((p) => ({ ...p, nombres: true }))
                      }
                      autoComplete="given-name"
                    />
                  </div>
                  {touched.nombres && errs.nombres ? (
                    <div className="pmya-err">{errs.nombres}</div>
                  ) : null}
                </div>

                <div className="pmya-grid2">
                  <div className="pmya-field">
                    <label
                      className="pmya-label"
                      htmlFor="modal-registro-paterno"
                    >
                      Apellido paterno *
                    </label>
                    <div className="pmya-inputWrap">
                      <User className="pmya-icon" size={18} />
                      <input
                        id="modal-registro-paterno"
                        className="pmya-input"
                        placeholder="Pérez"
                        value={form.paterno}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, paterno: e.target.value }))
                        }
                        onBlur={() =>
                          setTouched((p) => ({ ...p, paterno: true }))
                        }
                        autoComplete="family-name"
                      />
                    </div>
                    {touched.paterno && errs.paterno ? (
                      <div className="pmya-err">{errs.paterno}</div>
                    ) : null}
                  </div>

                  <div className="pmya-field">
                    <label
                      className="pmya-label"
                      htmlFor="modal-registro-materno"
                    >
                      Apellido materno *
                    </label>
                    <div className="pmya-inputWrap">
                      <User className="pmya-icon" size={18} />
                      <input
                        id="modal-registro-materno"
                        className="pmya-input"
                        placeholder="García"
                        value={form.materno}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, materno: e.target.value }))
                        }
                        onBlur={() =>
                          setTouched((p) => ({ ...p, materno: true }))
                        }
                      />
                    </div>
                    {touched.materno && errs.materno ? (
                      <div className="pmya-err">{errs.materno}</div>
                    ) : null}
                  </div>
                </div>

                <div className="pmya-field">
                  <label
                    className="pmya-label"
                    htmlFor="modal-registro-nacimiento"
                  >
                    Fecha de nacimiento *
                  </label>
                  <div className="pmya-inputWrap">
                    <Calendar className="pmya-icon" size={18} />
                    <input
                      id="modal-registro-nacimiento"
                      className="pmya-input"
                      type="date"
                      value={form.nacimiento}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, nacimiento: e.target.value }))
                      }
                      onBlur={() =>
                        setTouched((p) => ({ ...p, nacimiento: true }))
                      }
                      autoComplete="bday"
                    />
                  </div>
                  {touched.nacimiento && errs.nacimiento ? (
                    <div className="pmya-err">{errs.nacimiento}</div>
                  ) : null}
                </div>

                <div className="pmya-grid2">
                  <div className="pmya-field">
                    <label
                      className="pmya-label"
                      htmlFor="modal-registro-email"
                    >
                      Correo electrónico *
                    </label>
                    <div className="pmya-inputWrap">
                      <Mail className="pmya-icon" size={18} />
                      <input
                        id="modal-registro-email"
                        className="pmya-input"
                        type="email"
                        placeholder="tu@email.com"
                        value={form.email}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, email: e.target.value }))
                        }
                        onBlur={() =>
                          setTouched((p) => ({ ...p, email: true }))
                        }
                        autoComplete="email"
                      />
                    </div>
                    {touched.email && errs.email ? (
                      <div className="pmya-err">{errs.email}</div>
                    ) : null}
                  </div>

                  <div className="pmya-field">
                    <label
                      className="pmya-label"
                      htmlFor="modal-registro-telefono"
                    >
                      Teléfono *
                    </label>
                    <div className="pmya-inputWrap">
                      <Phone className="pmya-icon" size={18} />
                      <input
                        id="modal-registro-telefono"
                        className="pmya-input"
                        placeholder="7713539315"
                        value={form.telefono}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, telefono: e.target.value }))
                        }
                        onBlur={() =>
                          setTouched((p) => ({ ...p, telefono: true }))
                        }
                        autoComplete="tel"
                        inputMode="tel"
                      />
                    </div>
                    {touched.telefono && errs.telefono ? (
                      <div className="pmya-err">{errs.telefono}</div>
                    ) : null}
                  </div>
                </div>

                <div className="pmya-grid2">
                  <div className="pmya-field">
                    <label
                      className="pmya-label"
                      htmlFor="modal-registro-password"
                    >
                      Contraseña *
                    </label>
                    <PasswordField
                      id="modal-registro-password"
                      leftIcon={<Lock className="pmya-icon" size={18} />}
                      wrapperClassName="pmya-inputWrap pmya-passwordField"
                      inputClassName="pmya-input"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, password: e.target.value }))
                      }
                      onBlur={() =>
                        setTouched((p) => ({ ...p, password: true }))
                      }
                      autoComplete="new-password"
                    />
                    {touched.password && errs.password ? (
                      <div className="pmya-err">{errs.password}</div>
                    ) : null}
                  </div>

                  <div className="pmya-field">
                    <label
                      className="pmya-label"
                      htmlFor="modal-registro-password2"
                    >
                      Confirmar contraseña *
                    </label>
                    <PasswordField
                      id="modal-registro-password2"
                      leftIcon={<Lock className="pmya-icon" size={18} />}
                      wrapperClassName="pmya-inputWrap pmya-passwordField"
                      inputClassName="pmya-input"
                      placeholder="••••••••"
                      value={form.password2}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, password2: e.target.value }))
                      }
                      onBlur={() =>
                        setTouched((p) => ({ ...p, password2: true }))
                      }
                      autoComplete="new-password"
                    />
                    {touched.password2 && errs.password2 ? (
                      <div className="pmya-err">{errs.password2}</div>
                    ) : null}
                  </div>
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
                  {loading ? "Creando cuenta..." : "Continuar"}
                </button>

                <div className="pmya-back">
                  ¿Ya tienes cuenta?{" "}
                  <button
                    type="button"
                    className="pmya-link"
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: 0,
                    }}
                    onClick={onBack}
                  >
                    Inicia sesión
                  </button>
                </div>

                <div className="pmya-footTiny">
                  Al registrarte, aceptas los{" "}
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
