import Button from "../../ui/Button.jsx";
import Input from "../../ui/Input.jsx";
import Textarea from "../../ui/Textarea.jsx";
import EmptyState from "../../ui/EmptyState.jsx";
import { formatMoney, orderStatusLabel } from "../../../utils/profile.utils.js";

function formatTelefono(value) {
  const digits = String(value || "")
    .replace(/\D+/g, "")
    .slice(0, 10);

  if (!digits) return "Sin teléfono";
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

function getFullName(form = {}) {
  return [form.nombre, form.apellido_paterno, form.apellido_materno]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function getInitials(form = {}) {
  const fullName = getFullName(form);
  if (!fullName) return "PM";

  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function cardStyle({
  padding = 24,
  background = "#fff",
  border = "#e5e7eb",
} = {}) {
  return {
    background,
    border: `1px solid ${border}`,
    borderRadius: 24,
    padding,
    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.05)",
  };
}

function softStatStyle() {
  return {
    background: "#fffaf5",
    border: "1px solid #eadfd4",
    borderRadius: 18,
    padding: 16,
  };
}

function statusBadgeStyle(status) {
  const normalized = String(status || "").toUpperCase();

  if (normalized.includes("CANCEL")) {
    return {
      background: "#fef2f2",
      color: "#b91c1c",
      border: "1px solid #fecaca",
    };
  }

  if (normalized.includes("ENTREG") || normalized.includes("COMPLET")) {
    return {
      background: "#ecfdf5",
      color: "#047857",
      border: "1px solid #bbf7d0",
    };
  }

  if (normalized.includes("PEND")) {
    return {
      background: "#fffbeb",
      color: "#b45309",
      border: "1px solid #fde68a",
    };
  }

  return {
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
  };
}

const tabs = [
  { id: "info", label: "Mi cuenta", hint: "Datos personales" },
  { id: "orders", label: "Mis pedidos", hint: "Historial y estado" },
  { id: "addresses", label: "Direcciones", hint: "Entregas guardadas" },
  { id: "security", label: "Seguridad", hint: "Contraseña y acceso" },
  { id: "preferences", label: "Preferencias", hint: "Notificaciones y notas" },
];

function NavButton({ active, label, hint, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        border: active ? "1px solid #d97706" : "1px solid #e5e7eb",
        background: active ? "#fff7ed" : "#fff",
        color: "#111827",
        borderRadius: 18,
        padding: "14px 16px",
        textAlign: "left",
        cursor: "pointer",
        transition: "all .2s ease",
        boxShadow: active ? "0 10px 24px rgba(217,119,6,.08)" : "none",
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 15 }}>{label}</div>
      <div
        style={{
          marginTop: 4,
          color: active ? "#9a3412" : "#64748b",
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        {hint}
      </div>
    </button>
  );
}

export default function PerfilDashboard({ perfil, navigate, logout, user }) {
  const fullName =
    getFullName(perfil.profileForm) || getFullName(user) || "Cliente Pizza Mya";

  const email =
    perfil.profileForm.email || user?.email || "Sin correo registrado";

  const telefono = formatTelefono(
    perfil.profileForm.telefono || user?.telefono || "",
  );

  const hasDefaultAddress = perfil.addresses.some(
    (item) => item.predeterminada,
  );

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <style>{`
        .pmya-profile-shell{
          display:grid;
          gap:22px;
        }

        .pmya-profile-hero{
          display:grid;
          gap:18px;
          align-items:stretch;
        }

        .pmya-profile-main{
          display:grid;
          grid-template-columns:300px minmax(0, 1fr);
          gap:20px;
          align-items:start;
        }

        .pmya-profile-sidebar{
          position:sticky;
          top:92px;
          display:grid;
          gap:16px;
        }

        .pmya-profile-two-col{
          display:grid;
          grid-template-columns:repeat(2, minmax(0,1fr));
          gap:14px;
        }

        .pmya-profile-three-col{
          display:grid;
          grid-template-columns:repeat(3, minmax(0,1fr));
          gap:14px;
        }

        .pmya-profile-address-grid{
          display:grid;
          gap:14px;
        }

        .pmya-profile-orders{
          display:grid;
          gap:14px;
        }

        .pmya-profile-order-top{
          display:flex;
          justify-content:space-between;
          align-items:flex-start;
          gap:12px;
          flex-wrap:wrap;
        }

        .pmya-profile-toggle-row{
          display:flex;
          justify-content:space-between;
          gap:14px;
          align-items:center;
          padding:16px;
          border:1px solid #e5e7eb;
          border-radius:18px;
          background:#fff;
        }

        .pmya-profile-chip{
          display:inline-flex;
          align-items:center;
          justify-content:center;
          padding:8px 12px;
          border-radius:999px;
          font-size:12px;
          font-weight:800;
          border:1px solid #e5e7eb;
          background:#fff;
          color:#334155;
        }

        @media (max-width: 1100px){
          .pmya-profile-hero,
          .pmya-profile-main{
            grid-template-columns:1fr;
          }

          .pmya-profile-sidebar{
            position:static;
          }
        }

        @media (max-width: 720px){
          .pmya-profile-two-col,
          .pmya-profile-three-col{
            grid-template-columns:1fr;
          }
        }
      `}</style>

      <div className="pmya-profile-shell">
        <section className="pmya-profile-hero">
          <article
            style={cardStyle({
              padding: 26,
              background: "linear-gradient(135deg, #fffaf5 0%, #fff 70%)",
              border: "#eadfd4",
            })}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 18,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 18,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    width: 82,
                    height: 82,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #8f2d1f, #c78b47)",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 28,
                    fontWeight: 950,
                    boxShadow: "0 14px 30px rgba(143,45,31,.18)",
                  }}
                >
                  {getInitials(perfil.profileForm)}
                </div>

                <div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <h1
                      style={{
                        margin: 0,
                        fontSize: 30,
                        lineHeight: 1.1,
                        color: "#201a17",
                        fontWeight: 950,
                      }}
                    >
                      {fullName}
                    </h1>

                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "7px 12px",
                        borderRadius: 999,
                        background: "#ecfdf5",
                        color: "#166534",
                        border: "1px solid #bbf7d0",
                        fontSize: 12,
                        fontWeight: 900,
                      }}
                    >
                      Cuenta activa
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      display: "grid",
                      gap: 6,
                      color: "#6b625c",
                      fontWeight: 700,
                    }}
                  >
                    <div>{email}</div>
                    <div>{telefono}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {perfil.activeTab === "info" && !perfil.isEditing ? (
                  <Button onClick={() => perfil.setIsEditing(true)}>
                    Editar perfil
                  </Button>
                ) : null}

                <Button
                  variant="secondary"
                  onClick={() => navigate("/catalogo")}
                >
                  Ir al catálogo
                </Button>

                <Button variant="danger" onClick={logout}>
                  Cerrar sesión
                </Button>
              </div>
            </div>
          </article>
        </section>

        <section className="pmya-profile-main">
          <aside className="pmya-profile-sidebar">
            <article style={cardStyle({ padding: 18 })}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 900,
                  color: "#201a17",
                  marginBottom: 12,
                }}
              >
                Navegación de cuenta
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                {tabs.map((tab) => (
                  <NavButton
                    key={tab.id}
                    active={perfil.activeTab === tab.id}
                    label={tab.label}
                    hint={tab.hint}
                    onClick={() => perfil.setActiveTab(tab.id)}
                  />
                ))}
              </div>
            </article>

            <article
              style={cardStyle({
                padding: 18,
                background: "#fffbf7",
                border: "#efe4d8",
              })}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 900,
                  color: "#201a17",
                  marginBottom: 10,
                }}
              >
                Accesos rápidos
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                <span className="pmya-profile-chip">
                  {perfil.orders.length} pedido(s)
                </span>
                <span className="pmya-profile-chip">
                  {perfil.addresses.length} dirección(es)
                </span>
                <span className="pmya-profile-chip">
                  Perfil {perfil.profileCompletion}% completo
                </span>
              </div>
            </article>
          </aside>

          <div style={{ display: "grid", gap: 18, minWidth: 0 }}>
            {perfil.activeTab === "info" ? (
              <section style={cardStyle()}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                    marginBottom: 20,
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: 24,
                        fontWeight: 950,
                        color: "#201a17",
                      }}
                    >
                      Información personal
                    </h2>
                    <p
                      style={{
                        margin: "8px 0 0",
                        color: "#736b64",
                        fontWeight: 600,
                      }}
                    >
                      Revisa y actualiza tus datos principales desde esta
                      sección.
                    </p>
                  </div>

                  {perfil.isEditing ? (
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <Button
                        variant="secondary"
                        onClick={() => perfil.setIsEditing(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={perfil.saveProfile}
                        loading={perfil.savingProfile}
                      >
                        Guardar cambios
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => perfil.setIsEditing(true)}>
                      Editar datos
                    </Button>
                  )}
                </div>

                <div className="pmya-profile-two-col">
                  <Input
                    label="Nombre"
                    value={perfil.profileForm.nombre}
                    onChange={(e) =>
                      perfil.setProfileForm((prev) => ({
                        ...prev,
                        nombre: e.target.value,
                      }))
                    }
                    disabled={!perfil.isEditing}
                  />

                  <Input
                    label="Apellido paterno"
                    value={perfil.profileForm.apellido_paterno}
                    onChange={(e) =>
                      perfil.setProfileForm((prev) => ({
                        ...prev,
                        apellido_paterno: e.target.value,
                      }))
                    }
                    disabled={!perfil.isEditing}
                  />

                  <Input
                    label="Apellido materno"
                    value={perfil.profileForm.apellido_materno}
                    onChange={(e) =>
                      perfil.setProfileForm((prev) => ({
                        ...prev,
                        apellido_materno: e.target.value,
                      }))
                    }
                    disabled={!perfil.isEditing}
                  />

                  <Input
                    label="Correo"
                    type="email"
                    value={perfil.profileForm.email}
                    onChange={(e) =>
                      perfil.setProfileForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    disabled={!perfil.isEditing}
                  />

                  <Input
                    label="Teléfono"
                    value={formatTelefono(perfil.profileForm.telefono)}
                    onChange={(e) =>
                      perfil.setProfileForm((prev) => ({
                        ...prev,
                        telefono: e.target.value
                          .replace(/\D+/g, "")
                          .slice(0, 10),
                      }))
                    }
                    disabled={!perfil.isEditing}
                  />

                  <Input
                    label="Fecha de nacimiento"
                    type="date"
                    value={perfil.profileForm.fecha_nacimiento}
                    onChange={(e) =>
                      perfil.setProfileForm((prev) => ({
                        ...prev,
                        fecha_nacimiento: e.target.value,
                      }))
                    }
                    disabled={!perfil.isEditing}
                  />
                </div>
              </section>
            ) : null}

            {perfil.activeTab === "orders" ? (
              <section style={cardStyle()}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: 24,
                        fontWeight: 950,
                        color: "#201a17",
                      }}
                    >
                      Mis pedidos
                    </h2>
                    <p
                      style={{
                        margin: "8px 0 0",
                        color: "#736b64",
                        fontWeight: 600,
                      }}
                    >
                      Consulta tus pedidos recientes, su estado y el total de
                      cada compra.
                    </p>
                  </div>

                  <Button
                    variant="secondary"
                    onClick={() => navigate("/catalogo")}
                  >
                    Hacer otro pedido
                  </Button>
                </div>

                <div
                  className="pmya-profile-two-col"
                  style={{ marginBottom: 18 }}
                >
                  <Input
                    label="Buscar pedido"
                    placeholder="Folio o estatus"
                    value={perfil.orderSearch}
                    onChange={(e) => perfil.setOrderSearch(e.target.value)}
                  />

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: 6,
                        fontWeight: 800,
                        color: "#334155",
                      }}
                    >
                      Filtrar por estado
                    </label>
                    <select
                      value={perfil.orderStatusFilter}
                      onChange={(e) =>
                        perfil.setOrderStatusFilter(e.target.value)
                      }
                      style={{
                        width: "100%",
                        minHeight: 48,
                        padding: "12px 14px",
                        borderRadius: 14,
                        border: "1px solid #d1d5db",
                        background: "#fff",
                      }}
                    >
                      <option value="TODOS">Todos</option>
                      <option value="PENDIENTE">Pendiente</option>
                      <option value="EN_PREPARACION">En preparación</option>
                      <option value="LISTO">Listo</option>
                      <option value="ENTREGADO">Entregado</option>
                      <option value="CANCELADO">Cancelado</option>
                    </select>
                  </div>
                </div>

                {!perfil.orders.length ? (
                  <EmptyState
                    title="Todavía no tienes pedidos"
                    description="Cuando hagas tu primera compra, aparecerá aquí."
                  />
                ) : perfil.filteredOrders.length ? (
                  <div className="pmya-profile-orders">
                    {perfil.filteredOrders.map((order) => (
                      <article
                        key={order.id}
                        style={{
                          border: "1px solid #e5e7eb",
                          borderRadius: 20,
                          padding: 18,
                          background: "#fcfcfd",
                        }}
                      >
                        <div className="pmya-profile-order-top">
                          <div>
                            <div
                              style={{
                                fontSize: 18,
                                fontWeight: 950,
                                color: "#201a17",
                              }}
                            >
                              Pedido #{order.folio}
                            </div>
                            <div
                              style={{
                                marginTop: 6,
                                color: "#736b64",
                                fontSize: 14,
                                fontWeight: 600,
                              }}
                            >
                              {order.date
                                ? new Date(order.date).toLocaleDateString(
                                    "es-MX",
                                    {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    },
                                  )
                                : "Fecha no disponible"}
                            </div>
                          </div>

                          <div
                            style={{
                              ...statusBadgeStyle(order.status),
                              padding: "8px 12px",
                              borderRadius: 999,
                              fontWeight: 900,
                              fontSize: 12,
                              textTransform: "uppercase",
                            }}
                          >
                            {orderStatusLabel(order.status)}
                          </div>
                        </div>

                        <div
                          className="pmya-profile-three-col"
                          style={{ marginTop: 18 }}
                        >
                          <div style={softStatStyle()}>
                            <div
                              style={{
                                fontSize: 12,
                                color: "#7b726b",
                                textTransform: "uppercase",
                                letterSpacing: ".04em",
                                fontWeight: 900,
                                marginBottom: 6,
                              }}
                            >
                              Artículos
                            </div>
                            <div
                              style={{
                                fontWeight: 900,
                                color: "#201a17",
                                fontSize: 20,
                              }}
                            >
                              {order.items}
                            </div>
                          </div>

                          <div style={softStatStyle()}>
                            <div
                              style={{
                                fontSize: 12,
                                color: "#7b726b",
                                textTransform: "uppercase",
                                letterSpacing: ".04em",
                                fontWeight: 900,
                                marginBottom: 6,
                              }}
                            >
                              Total
                            </div>
                            <div
                              style={{
                                fontWeight: 950,
                                color: "#8f2d1f",
                                fontSize: 20,
                              }}
                            >
                              {formatMoney(order.total)}
                            </div>
                          </div>

                          <div style={softStatStyle()}>
                            <div
                              style={{
                                fontSize: 12,
                                color: "#7b726b",
                                textTransform: "uppercase",
                                letterSpacing: ".04em",
                                fontWeight: 900,
                                marginBottom: 6,
                              }}
                            >
                              Estado
                            </div>
                            <div
                              style={{
                                fontWeight: 900,
                                color: "#201a17",
                                fontSize: 18,
                              }}
                            >
                              {orderStatusLabel(order.status)}
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            marginTop: 16,
                          }}
                        >
                          <Button
                            onClick={() => navigate(`/orders/${order.id}`)}
                          >
                            Ver detalle
                          </Button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No hay pedidos con ese filtro"
                    description="Prueba con otro folio o cambia el estado seleccionado."
                  />
                )}
              </section>
            ) : null}

            {perfil.activeTab === "addresses" ? (
              <section style={cardStyle()}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "center",
                    flexWrap: "wrap",
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: 24,
                        fontWeight: 950,
                        color: "#201a17",
                      }}
                    >
                      Direcciones
                    </h2>
                    <p
                      style={{
                        margin: "8px 0 0",
                        color: "#736b64",
                        fontWeight: 600,
                      }}
                    >
                      Guarda tus direcciones frecuentes para pedir más rápido.
                    </p>
                  </div>

                  <Button
                    onClick={() => perfil.setShowAddressForm((prev) => !prev)}
                  >
                    {perfil.showAddressForm
                      ? "Ocultar formulario"
                      : "Agregar dirección"}
                  </Button>
                </div>

                {perfil.showAddressForm ? (
                  <div
                    style={{
                      ...cardStyle({
                        padding: 18,
                        background: "#fcfcfd",
                        border: "#ece7e1",
                      }),
                      marginBottom: 18,
                      boxShadow: "none",
                    }}
                  >
                    <div className="pmya-profile-two-col">
                      <Input
                        label="Alias"
                        value={perfil.newAddress.alias}
                        onChange={(e) =>
                          perfil.setNewAddress((prev) => ({
                            ...prev,
                            alias: e.target.value,
                          }))
                        }
                      />
                      <Input
                        label="Calle"
                        value={perfil.newAddress.calle}
                        onChange={(e) =>
                          perfil.setNewAddress((prev) => ({
                            ...prev,
                            calle: e.target.value,
                          }))
                        }
                      />
                      <Input
                        label="Número"
                        value={perfil.newAddress.numero}
                        onChange={(e) =>
                          perfil.setNewAddress((prev) => ({
                            ...prev,
                            numero: e.target.value,
                          }))
                        }
                      />
                      <Input
                        label="Colonia"
                        value={perfil.newAddress.colonia}
                        onChange={(e) =>
                          perfil.setNewAddress((prev) => ({
                            ...prev,
                            colonia: e.target.value,
                          }))
                        }
                      />
                      <Input
                        label="Ciudad"
                        value={perfil.newAddress.ciudad}
                        onChange={(e) =>
                          perfil.setNewAddress((prev) => ({
                            ...prev,
                            ciudad: e.target.value,
                          }))
                        }
                      />
                      <Input
                        label="Estado"
                        value={perfil.newAddress.estado}
                        onChange={(e) =>
                          perfil.setNewAddress((prev) => ({
                            ...prev,
                            estado: e.target.value,
                          }))
                        }
                      />
                      <Input
                        label="CP"
                        value={perfil.newAddress.cp}
                        onChange={(e) =>
                          perfil.setNewAddress((prev) => ({
                            ...prev,
                            cp: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div style={{ marginTop: 14 }}>
                      <Textarea
                        label="Referencias"
                        rows={3}
                        value={perfil.newAddress.referencias}
                        onChange={(e) =>
                          perfil.setNewAddress((prev) => ({
                            ...prev,
                            referencias: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginTop: 14,
                        marginBottom: 14,
                        fontWeight: 700,
                        color: "#201a17",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={perfil.newAddress.predeterminada}
                        onChange={(e) =>
                          perfil.setNewAddress((prev) => ({
                            ...prev,
                            predeterminada: e.target.checked,
                          }))
                        }
                      />
                      Marcar como dirección predeterminada
                    </label>

                    <div
                      style={{ display: "flex", justifyContent: "flex-end" }}
                    >
                      <Button
                        onClick={perfil.saveAddress}
                        loading={perfil.savingAddress}
                      >
                        Guardar dirección
                      </Button>
                    </div>
                  </div>
                ) : null}

                {!perfil.addresses.length ? (
                  <EmptyState
                    title="No tienes direcciones guardadas"
                    description="Agrega tu primera dirección para pedir más rápido."
                  />
                ) : (
                  <div className="pmya-profile-address-grid">
                    {perfil.addresses.map((address) => (
                      <article
                        key={address.id}
                        style={{
                          border: "1px solid #e5e7eb",
                          borderRadius: 20,
                          padding: 18,
                          background: "#fcfcfd",
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 16,
                          alignItems: "flex-start",
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              flexWrap: "wrap",
                            }}
                          >
                            <strong
                              style={{
                                color: "#201a17",
                                fontSize: 17,
                              }}
                            >
                              {address.alias || "Dirección"}
                            </strong>

                            {address.predeterminada ? (
                              <span
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: 999,
                                  background: "#111827",
                                  color: "#fff",
                                  fontSize: 12,
                                  fontWeight: 900,
                                }}
                              >
                                Predeterminada
                              </span>
                            ) : null}
                          </div>

                          <p
                            style={{
                              margin: "10px 0 0",
                              color: "#475569",
                              lineHeight: 1.6,
                            }}
                          >
                            {[
                              address.calle,
                              address.numero,
                              address.colonia,
                              address.ciudad,
                              address.estado,
                              address.cp,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </p>

                          {address.referencias ? (
                            <p
                              style={{
                                margin: "8px 0 0",
                                color: "#736b64",
                                lineHeight: 1.55,
                              }}
                            >
                              {address.referencias}
                            </p>
                          ) : null}
                        </div>

                        <Button
                          variant="danger"
                          onClick={() => perfil.deleteAddress(address.id)}
                        >
                          Eliminar
                        </Button>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            ) : null}

            {perfil.activeTab === "security" ? (
              <section style={cardStyle()}>
                <div style={{ marginBottom: 18 }}>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 24,
                      fontWeight: 950,
                      color: "#201a17",
                    }}
                  >
                    Seguridad
                  </h2>
                  <p
                    style={{
                      margin: "8px 0 0",
                      color: "#736b64",
                      fontWeight: 600,
                    }}
                  >
                    Cambia tu contraseña para mantener protegida tu cuenta.
                  </p>
                </div>

                <div className="pmya-profile-two-col">
                  <Input
                    label="Contraseña actual"
                    type="password"
                    value={perfil.passwordData.current}
                    onChange={(e) =>
                      perfil.setPasswordData((prev) => ({
                        ...prev,
                        current: e.target.value,
                      }))
                    }
                  />
                  <div />
                  <Input
                    label="Nueva contraseña"
                    type="password"
                    value={perfil.passwordData.newPassword}
                    onChange={(e) =>
                      perfil.setPasswordData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                  />
                  <Input
                    label="Confirmar nueva contraseña"
                    type="password"
                    value={perfil.passwordData.confirm}
                    onChange={(e) =>
                      perfil.setPasswordData((prev) => ({
                        ...prev,
                        confirm: e.target.value,
                      }))
                    }
                  />
                </div>

                <div
                  style={{
                    marginTop: 16,
                    border: "1px solid #ece7e1",
                    borderRadius: 18,
                    padding: 16,
                    background: "#fcfcfd",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <strong>Fuerza de la nueva contraseña</strong>
                    <span
                      style={{
                        color: perfil.passwordStrength.color,
                        fontWeight: 950,
                      }}
                    >
                      {perfil.passwordStrength.label}
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      height: 8,
                      borderRadius: 999,
                      background: "#e5e7eb",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${perfil.passwordStrength.percent}%`,
                        height: "100%",
                        background: perfil.passwordStrength.color,
                      }}
                    />
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 13,
                      color: "#736b64",
                      fontWeight: 700,
                    }}
                  >
                    Usa al menos 8 caracteres, mayúsculas, números y símbolos.
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: 16,
                  }}
                >
                  <Button
                    onClick={perfil.changePassword}
                    loading={perfil.savingPassword}
                  >
                    Actualizar contraseña
                  </Button>
                </div>
              </section>
            ) : null}

            {perfil.activeTab === "preferences" ? (
              <section style={cardStyle()}>
                <div style={{ marginBottom: 18 }}>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 24,
                      fontWeight: 950,
                      color: "#201a17",
                    }}
                  >
                    Preferencias
                  </h2>
                  <p
                    style={{
                      margin: "8px 0 0",
                      color: "#736b64",
                      fontWeight: 600,
                    }}
                  >
                    Ajusta tus notificaciones y anota indicaciones personales
                    para tus pedidos.
                  </p>
                </div>

                <div style={{ display: "grid", gap: 12 }}>
                  {[
                    [
                      "emailNotifications",
                      "Notificaciones por correo",
                      "Recibe avisos y novedades en tu email.",
                    ],
                    [
                      "smsNotifications",
                      "Notificaciones por SMS",
                      "Recibe avisos rápidos directamente en tu teléfono.",
                    ],
                    [
                      "promoOffers",
                      "Ofertas y promociones",
                      "Mantente al tanto de combos y descuentos disponibles.",
                    ],
                  ].map(([key, label, helper]) => (
                    <label key={key} className="pmya-profile-toggle-row">
                      <div>
                        <div
                          style={{
                            fontWeight: 900,
                            color: "#201a17",
                          }}
                        >
                          {label}
                        </div>
                        <div
                          style={{
                            marginTop: 4,
                            color: "#736b64",
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          {helper}
                        </div>
                      </div>

                      <input
                        type="checkbox"
                        checked={Boolean(perfil.preferences[key])}
                        onChange={() =>
                          perfil.setPreferences((prev) => ({
                            ...prev,
                            [key]: !prev[key],
                          }))
                        }
                      />
                    </label>
                  ))}
                </div>

                <div style={{ marginTop: 16 }}>
                  <Textarea
                    label="Notas dietéticas"
                    rows={4}
                    value={perfil.preferences.dietaryNotes || ""}
                    onChange={(e) =>
                      perfil.setPreferences((prev) => ({
                        ...prev,
                        dietaryNotes: e.target.value,
                      }))
                    }
                    placeholder="Ej: sin cebolla, poca sal, sin picante..."
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: 16,
                  }}
                >
                  <Button onClick={perfil.savePreferences}>
                    Guardar preferencias
                  </Button>
                </div>
              </section>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
