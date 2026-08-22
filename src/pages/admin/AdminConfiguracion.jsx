import { useEffect, useState, useCallback, useId } from "react";
import { createShortClientId } from "../../utils/id.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { adminConfigApi } from "../../api/adminConfiguracion.api.js";
import PasswordField from "../../components/ui/PasswordField.jsx";
import CloudinaryImageField from "../../components/admin/CloudinaryImageField.jsx";
import {
  CONFIG_STYLES,
  ConfigActionCard,
  ConfigMessage,
  ConfigModalShell,
  ConfigSummary,
} from "../../components/admin/configuracion/AdminConfigUI.jsx";
import {
  getStoreScheduleStatus,
  formatStoreTime,
} from "../../utils/storeHours.js";

function createPromo() {
  return {
    id: createShortClientId("promo"),
    titulo: "",
    descripcion: "",
    imagen_url: "",
    activo: true,
    orden: 0,
  };
}

export default function AdminConfiguracion() {
  const { token, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);
  const [message, setMessage] = useState(null);
  const [modalOpen, setModalOpen] = useState(null);

  const [passwordForm, setPasswordForm] = useState({ new: "", confirm: "" });
  const [passwordTouched, setPasswordTouched] = useState({
    new: false,
    confirm: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const dialogIdPrefix = useId();

  // Fix F5: obtener el ID del usuario de forma segura desde múltiples campos posibles
  const userId = user?.id ?? user?.usuario_id ?? user?.userId ?? null;
  const storeStatus = getStoreScheduleStatus(config);

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      setMessage(null);
      const data = await adminConfigApi.get({ token });
      if (data) {
        setConfig({
          ...data,
          promociones_json: Array.isArray(data.promociones_json)
            ? data.promociones_json
            : [],
        });
      } else {
        setMessage({
          type: "error",
          text: "No se pudo cargar la configuración",
        });
      }
    } catch (e) {
      setMessage({
        type: "error",
        text: e?.message || "Error al cargar configuración",
      });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) loadConfig();
  }, [token, loadConfig]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    if (!modalOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [modalOpen]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      const updated = await adminConfigApi.update({
        token,
        data: { ...config, tienda_abierta: true },
      });
      localStorage.setItem("pmya_config", JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent("configUpdated", { detail: updated }),
      );
      setConfig({
        ...updated,
        promociones_json: Array.isArray(updated?.promociones_json)
          ? updated.promociones_json
          : [],
      });
      setMessage({
        type: "success",
        text: "✅ Configuración guardada correctamente",
      });
    } catch (e) {
      setMessage({
        type: "error",
        text: e?.message || "No se pudo guardar la configuración",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) =>
    setConfig((prev) => ({ ...prev, [field]: value }));

  const handlePromoChange = (index, field, value) => {
    setConfig((prev) => {
      const list = Array.isArray(prev?.promociones_json)
        ? [...prev.promociones_json]
        : [];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, promociones_json: list };
    });
  };

  const handleAddPromo = () => {
    setConfig((prev) => {
      const list = Array.isArray(prev?.promociones_json)
        ? [...prev.promociones_json]
        : [];
      list.push({ ...createPromo(), orden: list.length });
      return { ...prev, promociones_json: list };
    });
  };

  const handleRemovePromo = (index) => {
    setConfig((prev) => {
      const list = [...(prev?.promociones_json || [])];
      list.splice(index, 1);
      return {
        ...prev,
        promociones_json: list.map((item, idx) => ({ ...item, orden: idx })),
      };
    });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Fix F5: validar que tenemos el userId antes de llamar al API
    if (!userId) {
      setMessage({
        type: "error",
        text: "No se pudo identificar tu usuario. Recarga la página.",
      });
      return;
    }

    if (passwordForm.new !== passwordForm.confirm) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden" });
      return;
    }

    if (passwordForm.new.length < 6) {
      setMessage({
        type: "error",
        text: "La contraseña debe tener al menos 6 caracteres",
      });
      return;
    }

    try {
      setChangingPassword(true);
      setMessage(null);
      await adminConfigApi.changePassword({
        token,
        userId,
        newPassword: passwordForm.new,
      });
      setMessage({
        type: "success",
        text: "✅ Contraseña actualizada correctamente",
      });
      setPasswordForm({ new: "", confirm: "" });
      setPasswordTouched({ new: false, confirm: false });
      setModalOpen(null);
    } catch (e) {
      setMessage({
        type: "error",
        text: e?.message || "No se pudo cambiar la contraseña",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const closeModal = () => {
    setModalOpen(null);
    setPasswordForm({ new: "", confirm: "" });
    setPasswordTouched({ new: false, confirm: false });
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ fontSize: "18px", color: "#666" }}>
          Cargando configuración...
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{CONFIG_STYLES}</style>

      <div className="config-wrap">
        <h1 className="config-title">Configuración</h1>
        <p className="config-sub">Gestiona la configuración de tu negocio</p>

        <ConfigMessage message={message} />

        <div className="config-actions">
          <ConfigActionCard
            iconBg="#fee2e2"
            icon="🏪"
            title="Datos del Negocio"
            onClick={() => setModalOpen("business")}
          >
            {config?.nombre_negocio || "No configurado"}
            <br />
            {config?.telefono || ""}
          </ConfigActionCard>

          <ConfigActionCard
            iconBg="#dbeafe"
            icon="🕐"
            title="Horario de atención"
            onClick={() => setModalOpen("hours")}
          >
            {storeStatus.isOpen ? "🟢 Abierta ahora" : "🔴 Fuera de horario"}
            <br />
            {storeStatus.schedule}
          </ConfigActionCard>

          <ConfigActionCard
            iconBg="#fef3c7"
            icon="📱"
            title="Redes Sociales"
            onClick={() => setModalOpen("social")}
          >
            WhatsApp: {config?.whatsapp_pedidos || "No configurado"}
          </ConfigActionCard>

          <ConfigActionCard
            iconBg="#ede9fe"
            icon="🖼️"
            title="Logo y Promociones"
            onClick={() => setModalOpen("branding")}
          >
            Logo dinámico y promociones del inicio
            <br />
            {(config?.promociones_json || []).length} promoción(es)
          </ConfigActionCard>

          <ConfigActionCard
            iconBg="#ddffe8"
            icon="🔐"
            title="Cambiar Contraseña"
            onClick={() => setModalOpen("password")}
          >
            Actualiza tu contraseña de acceso
            <br />
            {user?.email || ""}
            {!userId ? (
              <span
                style={{
                  color: "#b00020",
                  display: "block",
                  marginTop: 4,
                  fontSize: 12,
                }}
              >
                ⚠️ ID de usuario no disponible
              </span>
            ) : null}
          </ConfigActionCard>
        </div>

        <ConfigSummary config={config} />

        <div className="save-actions">
          <button
            className="btn btn-secondary"
            onClick={loadConfig}
            type="button"
          >
            Recargar
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
            type="button"
          >
            {saving ? "Guardando..." : "Guardar Todos los Cambios"}
          </button>
        </div>
      </div>

      {/* Modal: Cambiar Contraseña */}
      <ConfigModalShell
        open={modalOpen === "password"}
        onClose={closeModal}
        title="Cambiar Contraseña"
        dialogId={`${dialogIdPrefix}-password-title`}
      >
        {!userId ? (
          <div className="message error">
            No se puede cambiar la contraseña: ID de usuario no disponible.
            Recarga la página e intenta de nuevo.
          </div>
        ) : (
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label htmlFor="config-password-new">Nueva Contraseña</label>
              <PasswordField
                id="config-password-new"
                wrapperClassName="password-field-shell"
                inputClassName=""
                value={passwordForm.new}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    new: e.target.value,
                  }))
                }
                onBlur={() =>
                  setPasswordTouched((prev) => ({ ...prev, new: true }))
                }
                placeholder="Mínimo 8 caracteres"
                required
                autoFocus
                autoComplete="new-password"
                aria-invalid={Boolean(
                  passwordTouched.new &&
                  passwordForm.new &&
                  passwordForm.new.length < 6,
                )}
              />
            </div>
            {passwordTouched.new &&
            passwordForm.new &&
            passwordForm.new.length < 6 ? (
              <div
                className="message error"
                style={{ marginTop: "-6px", marginBottom: "12px" }}
              >
                La contraseña debe tener al menos 6 caracteres.
              </div>
            ) : null}
            <div className="form-group">
              <label htmlFor="config-password-confirm">
                Confirmar Contraseña
              </label>
              <PasswordField
                id="config-password-confirm"
                wrapperClassName="password-field-shell"
                inputClassName=""
                value={passwordForm.confirm}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirm: e.target.value,
                  }))
                }
                onBlur={() =>
                  setPasswordTouched((prev) => ({ ...prev, confirm: true }))
                }
                placeholder="Repite la contraseña"
                required
                autoComplete="new-password"
                aria-invalid={Boolean(
                  passwordTouched.confirm &&
                  passwordForm.confirm &&
                  passwordForm.confirm !== passwordForm.new,
                )}
              />
            </div>
            {passwordTouched.confirm &&
            passwordForm.confirm &&
            passwordForm.confirm !== passwordForm.new ? (
              <div
                className="message error"
                style={{ marginTop: "-6px", marginBottom: "12px" }}
              >
                Las contraseñas no coinciden.
              </div>
            ) : null}
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeModal}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={changingPassword}
                className="btn btn-primary"
              >
                {changingPassword ? "Actualizando..." : "Actualizar Contraseña"}
              </button>
            </div>
          </form>
        )}
      </ConfigModalShell>

      {/* Modal: Datos del Negocio */}
      <ConfigModalShell
        open={modalOpen === "business"}
        onClose={closeModal}
        title="Datos del Negocio"
        dialogId={`${dialogIdPrefix}-business-title`}
      >
        <div className="form-group">
          <label htmlFor="config-business-nombre_negocio">
            Nombre del Negocio
          </label>
          <input
            id="config-business-nombre_negocio"
            type="text"
            value={config?.nombre_negocio || ""}
            onChange={(e) => handleChange("nombre_negocio", e.target.value)}
            placeholder="PizzaMya"
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="config-business-telefono">Teléfono</label>
            <input
              id="config-business-telefono"
              type="text"
              value={config?.telefono || ""}
              onChange={(e) => handleChange("telefono", e.target.value)}
              placeholder="7713539315"
            />
          </div>
          <div className="form-group">
            <label htmlFor="config-business-whatsapp_pedidos">
              WhatsApp para Pedidos
            </label>
            <input
              id="config-business-whatsapp_pedidos"
              type="text"
              value={config?.whatsapp_pedidos || ""}
              onChange={(e) => handleChange("whatsapp_pedidos", e.target.value)}
              placeholder="7713539315"
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="config-business-email">Correo Electrónico</label>
          <input
            id="config-business-email"
            type="email"
            value={config?.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="contacto@pizzamya.com"
          />
        </div>
        <div className="form-group">
          <label htmlFor="config-business-direccion">Dirección Completa</label>
          <textarea
            id="config-business-direccion"
            rows="3"
            value={config?.direccion || ""}
            onChange={(e) => handleChange("direccion", e.target.value)}
            placeholder="Plaza de la Revolución #18, Centro, Huejutla, Hidalgo"
          />
        </div>
        <div className="form-group">
          <label htmlFor="config-business-mensaje_footer">
            Mensaje del Footer
          </label>
          <textarea
            id="config-business-mensaje_footer"
            rows="2"
            value={config?.mensaje_footer || ""}
            onChange={(e) => handleChange("mensaje_footer", e.target.value)}
            placeholder="2025 PizzaMya. Todos los derechos reservados."
          />
        </div>
        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={closeModal}
          >
            Cerrar
          </button>
        </div>
      </ConfigModalShell>

      {/* Modal: Horario */}
      <ConfigModalShell
        open={modalOpen === "hours"}
        onClose={closeModal}
        title="Horario y Estado de Tienda"
        dialogId={`${dialogIdPrefix}-hours-title`}
      >
        <div
          style={{
            padding: "16px",
            background: storeStatus.isOpen ? "#ecfdf5" : "#fff1f2",
            border: `1px solid ${storeStatus.isOpen ? "#bbf7d0" : "#fecdd3"}`,
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          <strong>
            {storeStatus.isOpen
              ? "🟢 Tienda abierta ahora"
              : "🔴 Tienda fuera de horario"}
          </strong>
          <div style={{ fontSize: "13px", color: "#64748b", marginTop: 4 }}>
            El estado se calcula automáticamente con la hora de apertura y
            cierre.
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="config-hours-hora_apertura">Hora de Apertura</label>
            <input
              id="config-hours-hora_apertura"
              type="time"
              value={formatStoreTime(config?.hora_apertura, "12:00")}
              onChange={(e) => handleChange("hora_apertura", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="config-hours-hora_cierre">Hora de Cierre</label>
            <input
              id="config-hours-hora_cierre"
              type="time"
              value={formatStoreTime(config?.hora_cierre, "23:00")}
              onChange={(e) => handleChange("hora_cierre", e.target.value)}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="config-hours-tiempo_preparacion_min">
              Tiempo de Preparación (min)
            </label>
            <input
              id="config-hours-tiempo_preparacion_min"
              type="number"
              value={config?.tiempo_preparacion_min || 30}
              onChange={(e) =>
                handleChange(
                  "tiempo_preparacion_min",
                  parseInt(e.target.value, 10) || 0,
                )
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="config-hours-costo_envio">Costo de Envío ($)</label>
            <input
              id="config-hours-costo_envio"
              type="number"
              step="0.01"
              value={config?.costo_envio || 30}
              onChange={(e) =>
                handleChange("costo_envio", parseFloat(e.target.value) || 0)
              }
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="config-hours-pedido_minimo">Pedido Mínimo ($)</label>
          <input
            id="config-hours-pedido_minimo"
            type="number"
            step="0.01"
            value={config?.pedido_minimo || 150}
            onChange={(e) =>
              handleChange("pedido_minimo", parseFloat(e.target.value) || 0)
            }
          />
        </div>
        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={closeModal}
          >
            Cerrar
          </button>
        </div>
      </ConfigModalShell>

      {/* Modal: Redes Sociales */}
      <ConfigModalShell
        open={modalOpen === "social"}
        onClose={closeModal}
        title="Redes Sociales"
        dialogId={`${dialogIdPrefix}-social-title`}
      >
        <div className="form-group">
          <label htmlFor="config-social-facebook_url">Facebook URL</label>
          <input
            id="config-social-facebook_url"
            type="url"
            value={config?.facebook_url || ""}
            onChange={(e) => handleChange("facebook_url", e.target.value)}
            placeholder="https://facebook.com/pizzamya"
          />
        </div>
        <div className="form-group">
          <label htmlFor="config-social-instagram_url">Instagram URL</label>
          <input
            id="config-social-instagram_url"
            type="url"
            value={config?.instagram_url || ""}
            onChange={(e) => handleChange("instagram_url", e.target.value)}
            placeholder="https://instagram.com/pizzamya"
          />
        </div>
        <div className="form-group">
          <label htmlFor="config-social-whatsapp_pedidos">
            WhatsApp Business
          </label>
          <input
            id="config-social-whatsapp_pedidos"
            type="text"
            value={config?.whatsapp_pedidos || ""}
            onChange={(e) => handleChange("whatsapp_pedidos", e.target.value)}
            placeholder="5217713539315"
          />
          <small
            style={{
              color: "#64748b",
              fontSize: "12px",
              display: "block",
              marginTop: "4px",
            }}
          >
            Formato: Código país + número
          </small>
        </div>
        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={closeModal}
          >
            Cerrar
          </button>
        </div>
      </ConfigModalShell>

      {/* Modal: Logo y Promociones */}
      <ConfigModalShell
        open={modalOpen === "branding"}
        onClose={closeModal}
        title="Logo y Promociones"
        dialogId={`${dialogIdPrefix}-branding-title`}
      >
        <CloudinaryImageField
          token={token}
          folder="pizza-mya/logo"
          value={config?.logo_url || ""}
          onChange={(url) => handleChange("logo_url", url)}
          label="Logo del negocio"
          placeholder="https://.../logo.png"
          pickerTitle="Seleccionar logo desde Cloudinary"
          previewAlt="Vista previa del logo"
          previewHeight={180}
        />
        <div className="section-divider" />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>
            Promociones del inicio
          </h3>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAddPromo}
          >
            Agregar promoción
          </button>
        </div>
        {(config?.promociones_json || []).length === 0 ? (
          <div
            style={{
              padding: 16,
              background: "#f8fafc",
              borderRadius: 10,
              color: "#64748b",
              fontWeight: 700,
            }}
          >
            No hay promociones configuradas.
          </div>
        ) : (
          (config?.promociones_json || []).map((promo, index) => (
            <div className="promo-card" key={promo.id || index}>
              <div className="promo-preview">
                {promo.imagen_url ? (
                  <img
                    src={promo.imagen_url || "/img/combo-hoy.jpg"}
                    alt={promo.titulo || `Promo ${index + 1}`}
                  />
                ) : (
                  <span style={{ color: "#64748b", fontWeight: 700 }}>
                    Vista previa
                  </span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor={`promo-titulo-${index}`}>Título</label>
                <input
                  id={`promo-titulo-${index}`}
                  type="text"
                  value={promo.titulo || ""}
                  onChange={(e) =>
                    handlePromoChange(index, "titulo", e.target.value)
                  }
                  placeholder="Promo 2x1 en pizzas"
                />
              </div>
              <div className="form-group">
                <label htmlFor={`promo-descripcion-${index}`}>
                  Descripción
                </label>
                <textarea
                  id={`promo-descripcion-${index}`}
                  rows="2"
                  value={promo.descripcion || ""}
                  onChange={(e) =>
                    handlePromoChange(index, "descripcion", e.target.value)
                  }
                  placeholder="Válida de lunes a jueves"
                />
              </div>
              <CloudinaryImageField
                token={token}
                folder="pizza-mya/promociones"
                value={promo.imagen_url || ""}
                onChange={(url) => handlePromoChange(index, "imagen_url", url)}
                label="Imagen de la promoción"
                placeholder="https://.../promo.jpg"
                pickerTitle="Seleccionar imagen de la promoción"
                previewAlt={promo.titulo || `Promo ${index + 1}`}
                previewHeight={180}
              />
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`promo-orden-${index}`}>Orden</label>
                  <input
                    id={`promo-orden-${index}`}
                    type="number"
                    value={promo.orden ?? index}
                    onChange={(e) =>
                      handlePromoChange(
                        index,
                        "orden",
                        parseInt(e.target.value, 10) || 0,
                      )
                    }
                  />
                </div>
                <div className="form-group">
                  <label htmlFor={`promo-activo-${index}`}>Activa</label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      minHeight: 42,
                      padding: "0 10px",
                      border: "1px solid #ddd",
                      borderRadius: 8,
                      background: "#fff",
                    }}
                  >
                    <input
                      id={`promo-activo-${index}`}
                      type="checkbox"
                      checked={promo.activo !== false}
                      onChange={(e) =>
                        handlePromoChange(index, "activo", e.target.checked)
                      }
                    />
                    <span
                      style={{
                        fontSize: 13,
                        color: "#334155",
                        fontWeight: 700,
                      }}
                    >
                      {promo.activo !== false ? "Visible" : "Oculta"}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleRemovePromo(index)}
                >
                  Eliminar promoción
                </button>
              </div>
            </div>
          ))
        )}
        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={closeModal}
          >
            Cerrar
          </button>
        </div>
      </ConfigModalShell>
    </>
  );
}
