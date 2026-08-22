import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../components/ui/ToastProvider.jsx";
import Loader from "../../components/ui/Loader.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import AdminButton from "../../components/admin/ui/AdminButton.jsx";
import AdminPanel from "../../components/admin/ui/AdminPanel.jsx";
import AdminPageHeader from "../../components/admin/ui/AdminPageHeader.jsx";
import { inputStyle } from "../../components/admin/ui/adminTheme.js";
import { adminCatalogosApi } from "../../api/adminCatalogos.api.js";
import { adminProductosApi } from "../../api/adminProductos.api.js";
import AdminPersonalizacionProducto from "../../components/admin/AdminPersonalizacionProducto.jsx";

const CATALOGOS = [
  { key: "categorias", label: "Categorías", type: "categoria" },
  { key: "tamanios", label: "Tamaños", type: "tamanio" },
  { key: "masas", label: "Masas", type: "personalizacion" },
  { key: "salsas", label: "Salsas", type: "personalizacion" },
  { key: "orillas", label: "Orillas", type: "personalizacion" },
  { key: "extras", label: "Extras", type: "personalizacion" },
  { key: "ingredientes", label: "Ingredientes", type: "personalizacion" },
];

function unwrap(value) {
  return value?.data ?? value;
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.rows)) return value.rows;
  if (Array.isArray(value?.productos)) return value.productos;
  if (Array.isArray(value?.categorias)) return value.categorias;
  if (Array.isArray(value?.tamanios)) return value.tamanios;
  return [];
}

function money(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(value || 0));
}

function getCategoriaNombre(producto) {
  const categoria =
    producto?.categoria_nombre ||
    producto?.categoria?.nombre ||
    producto?.categoria ||
    "";

  if (typeof categoria === "object" && categoria !== null) {
    return String(categoria.nombre || "");
  }

  return String(categoria || "");
}

function esProductoPizza(producto) {
  const categoria = getCategoriaNombre(producto).toLowerCase();
  return categoria.includes("pizza");
}

function limpiarNombrePizza(nombre = "") {
  return String(nombre)
    .replace(/\(\s*(individual|mediana|grande|jumbo).*?\)/gi, "")
    .replace(/\b(individual|mediana|grande|jumbo)\b\s*\d{0,2}\s*"?/gi, "")
    .replace(/\s*-\s*(individual|mediana|grande|jumbo)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function agruparEspecialidadesPizza(productos = []) {
  const mapa = new Map();

  productos
    .filter((producto) => producto?.activo !== false)
    .filter(esProductoPizza)
    .forEach((producto) => {
      const nombreBase = limpiarNombrePizza(producto.nombre);
      if (!nombreBase) return;

      const key = `${producto.categoria_id || "pizzas"}-${nombreBase.toLowerCase()}`;

      if (!mapa.has(key)) {
        mapa.set(key, {
          id: producto.id,
          nombre: nombreBase,
          categoria_id: producto.categoria_id,
          categoria: getCategoriaNombre(producto) || "Pizzas",
          productos_ids: [producto.id],
        });
      } else {
        const actual = mapa.get(key);
        if (!actual.productos_ids.includes(producto.id)) {
          actual.productos_ids.push(producto.id);
        }
      }
    });

  return Array.from(mapa.values()).sort((a, b) =>
    a.nombre.localeCompare(b.nombre, "es"),
  );
}

export default function AdminCatalogos() {
  const { token } = useAuth();
  const toast = useToast();
  const [active, setActive] = useState("categorias");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(defaultForm("categorias"));

  const current = useMemo(
    () => CATALOGOS.find((x) => x.key === active),
    [active],
  );

  const load = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      let data;

      if (active === "categorias") {
        data = await adminCatalogosApi.categorias.list(token);
      } else if (active === "tamanios") {
        data = await adminCatalogosApi.tamanios.list(token);
      } else {
        data = await adminCatalogosApi.personalizacion.list(token, active);
      }

      const list = unwrap(data);
      setItems(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.message || "No se pudo cargar el catálogo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setForm(defaultForm(active));
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, token]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.nombre?.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    try {
      setSaving(true);

      const payload = buildPayload(active, form);

      if (form.id) {
        if (active === "categorias") {
          await adminCatalogosApi.categorias.update(token, form.id, payload);
        } else if (active === "tamanios") {
          await adminCatalogosApi.tamanios.update(token, form.id, payload);
        } else {
          await adminCatalogosApi.personalizacion.update(
            token,
            active,
            form.id,
            payload,
          );
        }

        toast.success("Registro actualizado");
      } else {
        if (active === "categorias") {
          await adminCatalogosApi.categorias.create(token, payload);
        } else if (active === "tamanios") {
          await adminCatalogosApi.tamanios.create(token, payload);
        } else {
          await adminCatalogosApi.personalizacion.create(
            token,
            active,
            payload,
          );
        }

        toast.success("Registro creado");
      }

      setForm(defaultForm(active));
      await load();
    } catch (err) {
      toast.error(err?.message || "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  const toggleActivo = async (item) => {
    try {
      const nextActive = !Boolean(item.activo);

      if (active === "categorias") {
        if (nextActive) {
          await adminCatalogosApi.categorias.enable(token, item.id);
        } else {
          await adminCatalogosApi.categorias.disable(token, item.id);
        }
      } else if (active === "tamanios") {
        if (nextActive) {
          await adminCatalogosApi.tamanios.enable(token, item.id);
        } else {
          await adminCatalogosApi.tamanios.disable(token, item.id);
        }
      } else if (nextActive) {
        await adminCatalogosApi.personalizacion.enable(token, active, item.id);
      } else {
        await adminCatalogosApi.personalizacion.disable(token, active, item.id);
      }

      toast.success(nextActive ? "Registro activado" : "Registro desactivado");
      await load();
    } catch (err) {
      toast.error(err?.message || "No se pudo cambiar el estado");
    }
  };

  return (
    <div
      className="admin-catalogos-page"
      style={{
        display: "grid",
        gap: 18,
        width: "100%",
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      <style>{`
        .admin-catalogos-page,
        .admin-catalogos-page * {
          box-sizing: border-box;
        }

        .catalogos-header-actions,
        .catalogos-tabs,
        .catalogos-form-actions,
        .catalogos-table-wrap,
        .catalogos-main-grid,
        .catalogos-panel,
        .catalogos-form {
          min-width: 0;
          max-width: 100%;
        }

        .catalogos-panel {
          width: 100%;
          overflow: hidden;
        }

        .catalogos-form {
          width: 100%;
        }

        .catalogos-form-actions {
          align-items: stretch;
        }

        .catalogos-form-actions button {
          max-width: 100% !important;
          min-width: 0 !important;
          white-space: nowrap;
        }

        .catalogos-table-desktop {
          display: block;
        }

        .catalogos-mobile-list {
          display: none;
        }

        .catalogos-mobile-card {
          display: grid;
          gap: 10px;
          padding: 14px;
          border: 1px solid #eaded2;
          border-radius: 16px;
          background: #fffdf9;
        }

        .catalogos-mobile-card + .catalogos-mobile-card {
          margin-top: 10px;
        }

        .catalogos-mobile-row {
          display: grid;
          gap: 4px;
        }

        .catalogos-mobile-label {
          color: #8a7d72;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .04em;
          text-transform: uppercase;
        }

        .catalogos-mobile-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .catalogos-mobile-actions button {
          width: 100% !important;
          min-width: 0 !important;
        }

        .catalogos-header-actions {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          width: 100%;
        }

        .catalogos-tabs {
          -webkit-overflow-scrolling: touch;
        }

        .catalogos-main-grid {
          grid-template-columns: minmax(260px, 360px) minmax(0, 1fr) !important;
        }

        .catalogos-table-wrap {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        @media (max-width: 1100px) {
          .catalogos-main-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 680px) {
          .admin-catalogos-page {
            gap: 14px !important;
          }

          .catalogos-header-actions,
          .catalogos-header-actions button {
            width: 100% !important;
          }

          .catalogos-tabs {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px !important;
          }

          .catalogos-tab-btn {
            width: 100% !important;
            padding-left: 10px !important;
            padding-right: 10px !important;
          }

          .catalogos-form-actions {
            display: grid !important;
            grid-template-columns: 1fr;
            width: 100% !important;
          }

          .catalogos-form-actions button {
            width: 100% !important;
            min-width: 0 !important;
            justify-content: center !important;
          }

          .catalogos-table-desktop {
            display: none !important;
          }

          .catalogos-mobile-list {
            display: grid !important;
            gap: 10px;
          }
        }

        @media (max-width: 380px) {
          .catalogos-tabs {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <AdminPageHeader
        eyebrow="Administración"
        title="Catálogos del sistema"
        subtitle="Administra categorías, tamaños, masas, salsas, orillas, extras e ingredientes sin modificar la base de datos manualmente."
        actions={
          <div className="catalogos-header-actions">
            <AdminButton className="catalogos-primary-action" onClick={load}>
              Actualizar
            </AdminButton>
          </div>
        }
      />

      <div
        className="catalogos-tabs"
        style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
      >
        {CATALOGOS.map((cat) => (
          <AdminButton
            key={cat.key}
            variant={active === cat.key ? "primary" : "secondary"}
            className="catalogos-tab-btn"
            onClick={() => setActive(cat.key)}
          >
            {cat.label}
          </AdminButton>
        ))}
      </div>

      <div
        className="catalogos-main-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "var(--adm-grid-catalogos)",
          gap: 18,
          minWidth: 0,
        }}
      >
        <AdminPanel
          title={form.id ? `Editar ${current?.label}` : "Nuevo registro"}
          style={{ minWidth: 0, width: "100%", overflow: "hidden" }}
        >
          <form
            className="catalogos-form"
            onSubmit={handleSubmit}
            style={{ display: "grid", gap: 12, minWidth: 0, width: "100%" }}
          >
            <input
              value={form.nombre}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, nombre: e.target.value }))
              }
              placeholder="Nombre"
              style={inputStyle()}
            />

            {active === "ingredientes" ? (
              <input
                value={form.tipo}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, tipo: e.target.value }))
                }
                placeholder="Tipo: base, proteína, vegetal..."
                style={inputStyle()}
              />
            ) : null}

            {active === "categorias" ? (
              <input
                type="number"
                value={form.orden}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, orden: e.target.value }))
                }
                placeholder="Orden"
                style={inputStyle()}
              />
            ) : null}

            {active === "tamanios" ? (
              <input
                type="number"
                value={form.porciones}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, porciones: e.target.value }))
                }
                placeholder="Porciones"
                style={inputStyle()}
              />
            ) : null}

            {["masas", "salsas", "orillas"].includes(active) ? (
              <input
                type="number"
                value={form.costo_extra}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, costo_extra: e.target.value }))
                }
                placeholder="Costo extra"
                style={inputStyle()}
              />
            ) : null}

            {active === "extras" ? (
              <input
                type="number"
                value={form.costo}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, costo: e.target.value }))
                }
                placeholder="Costo"
                style={inputStyle()}
              />
            ) : null}

            <textarea
              value={form.descripcion}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, descripcion: e.target.value }))
              }
              placeholder="Descripción"
              rows={4}
              style={{ ...inputStyle(), minHeight: 100, resize: "vertical" }}
            />

            <label
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                fontWeight: 800,
              }}
            >
              <input
                type="checkbox"
                checked={Boolean(form.activo)}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, activo: e.target.checked }))
                }
              />
              Activo
            </label>

            <div
              className="catalogos-form-actions"
              style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
            >
              <AdminButton type="submit" disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </AdminButton>

              {form.id ? (
                <AdminButton
                  type="button"
                  variant="secondary"
                  onClick={() => setForm(defaultForm(active))}
                >
                  Cancelar
                </AdminButton>
              ) : null}
            </div>
          </form>
        </AdminPanel>

        <AdminPanel
          title={current?.label || "Catálogo"}
          subtitle={`${items.length} registro(s)`}
          style={{ minWidth: 0, width: "100%", overflow: "hidden" }}
        >
          {loading ? <Loader text="Cargando catálogo..." /> : null}

          {!loading && error ? (
            <EmptyState
              icon="⚠️"
              title="Error"
              description={error}
              actionLabel="Reintentar"
              onAction={load}
            />
          ) : null}

          {!loading && !error ? (
            <>
              <div
                className="catalogos-table-wrap catalogos-table-desktop"
                style={{ overflowX: "auto", maxWidth: "100%" }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: 680,
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        textAlign: "left",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <th style={th}>Nombre</th>
                      <th style={th}>Detalle</th>
                      <th style={th}>Estado</th>
                      <th style={th}>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.id}
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        <td style={td}>
                          <strong>{item.nombre}</strong>
                        </td>

                        <td style={td}>{renderDetail(active, item)}</td>

                        <td style={td}>
                          {item.activo ? "Activo" : "Inactivo"}
                        </td>

                        <td style={td}>
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              flexWrap: "wrap",
                            }}
                          >
                            <AdminButton
                              size="sm"
                              variant="secondary"
                              onClick={() => setForm(editForm(active, item))}
                            >
                              Editar
                            </AdminButton>

                            <AdminButton
                              size="sm"
                              variant={item.activo ? "danger" : "secondary"}
                              onClick={() => toggleActivo(item)}
                            >
                              {item.activo ? "Desactivar" : "Activar"}
                            </AdminButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="catalogos-mobile-list">
                {items.map((item) => (
                  <article className="catalogos-mobile-card" key={item.id}>
                    <div className="catalogos-mobile-row">
                      <span className="catalogos-mobile-label">Nombre</span>
                      <strong>{item.nombre}</strong>
                    </div>

                    <div className="catalogos-mobile-row">
                      <span className="catalogos-mobile-label">Detalle</span>
                      <span>{renderDetail(active, item) || "Sin detalle"}</span>
                    </div>

                    <div className="catalogos-mobile-row">
                      <span className="catalogos-mobile-label">Estado</span>
                      <span>{item.activo ? "Activo" : "Inactivo"}</span>
                    </div>

                    <div className="catalogos-mobile-actions">
                      <AdminButton
                        size="sm"
                        variant="secondary"
                        onClick={() => setForm(editForm(active, item))}
                      >
                        Editar
                      </AdminButton>

                      <AdminButton
                        size="sm"
                        variant={item.activo ? "danger" : "secondary"}
                        onClick={() => toggleActivo(item)}
                      >
                        {item.activo ? "Desactivar" : "Activar"}
                      </AdminButton>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : null}
        </AdminPanel>
      </div>

      <AdminPersonalizacionProducto />
    </div>
  );
}

function ProductoPersonalizacionManager({ token, toast }) {
  const [productos, setProductos] = useState([]);
  const [grupoId, setGrupoId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const especialidadesPizza = useMemo(
    () => agruparEspecialidadesPizza(productos),
    [productos],
  );

  const grupoSeleccionado = useMemo(
    () =>
      especialidadesPizza.find((item) => String(item.id) === String(grupoId)),
    [especialidadesPizza, grupoId],
  );

  useEffect(() => {
    if (!token) return;

    adminProductosApi
      .list(token)
      .then((out) => {
        setProductos(toArray(out));
      })
      .catch(() => setProductos([]));
  }, [token]);

  const load = async (id = grupoId) => {
    if (!id) return;

    setLoading(true);

    try {
      const out = await adminCatalogosApi.productoPersonalizacion.get(
        token,
        id,
      );

      setData(out?.data ?? out);
    } catch (err) {
      toast.error(err?.message || "No se pudo cargar la personalización");
    } finally {
      setLoading(false);
    }
  };

  const toggle = (group, id, extra = {}) => {
    setData((prev) => ({
      ...prev,
      [group]: (prev?.[group] || []).map((item) =>
        item.id === id
          ? { ...item, ...extra, seleccionado: !item.seleccionado }
          : item,
      ),
    }));
  };

  const setDefaultSalsa = (id) => {
    setData((prev) => ({
      ...prev,
      salsas: (prev?.salsas || []).map((item) => ({
        ...item,
        default_sel: item.id === id,
        seleccionado: item.id === id ? true : item.seleccionado,
      })),
    }));
  };

  const save = async () => {
    if (!grupoSeleccionado || !data) return;

    const payload = {
      ingredientes: (data.ingredientes || [])
        .filter((x) => x.seleccionado)
        .map((x) => ({ id: x.id, incluido: true })),

      salsas: (data.salsas || [])
        .filter((x) => x.seleccionado)
        .map((x) => ({
          id: x.id,
          default_sel: Boolean(x.default_sel),
        })),

      extras: (data.extras || [])
        .filter((x) => x.seleccionado)
        .map((x) => x.id),
    };

    try {
      const idsParaGuardar =
        grupoSeleccionado.productos_ids?.length > 0
          ? grupoSeleccionado.productos_ids
          : [grupoSeleccionado.id];

      await Promise.all(
        idsParaGuardar.map((productoId) =>
          adminCatalogosApi.productoPersonalizacion.save(
            token,
            productoId,
            payload,
          ),
        ),
      );

      const out = await adminCatalogosApi.productoPersonalizacion.get(
        token,
        grupoSeleccionado.id,
      );

      setData(out?.data ?? out);
      toast.success("Personalización de la especialidad guardada");
    } catch (err) {
      toast.error(err?.message || "No se pudo guardar la personalización");
    }
  };

  return (
    <AdminPanel
      title="Personalización por producto"
      subtitle="Solo se muestran especialidades de la categoría Pizzas. La configuración se aplica a todos los tamaños de la especialidad."
    >
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select
            value={grupoId}
            onChange={(e) => {
              const id = e.target.value;
              setGrupoId(id);
              setData(null);
              if (id) load(id);
            }}
            style={{ ...inputStyle(), maxWidth: 420 }}
          >
            <option value="">Selecciona una especialidad de pizza</option>

            {especialidadesPizza.map((pizza) => (
              <option key={pizza.id} value={pizza.id}>
                {pizza.nombre}
              </option>
            ))}
          </select>

          <AdminButton
            variant="secondary"
            onClick={() => load()}
            disabled={!grupoId}
          >
            Cargar
          </AdminButton>

          <AdminButton onClick={save} disabled={!data || !grupoId}>
            Guardar personalización
          </AdminButton>
        </div>

        {grupoSeleccionado ? (
          <div
            style={{
              padding: 12,
              borderRadius: 12,
              background: "#f8fafc",
              border: "1px solid #e5e7eb",
              color: "#475569",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            Especialidad seleccionada:{" "}
            <strong>{grupoSeleccionado.nombre}</strong>. Se aplicará a{" "}
            <strong>{grupoSeleccionado.productos_ids.length}</strong>{" "}
            producto(s)/tamaño(s) relacionados.
          </div>
        ) : null}

        {loading ? <Loader text="Cargando personalización..." /> : null}

        {data ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
              gap: 14,
            }}
          >
            <Checklist
              title="Ingredientes"
              items={data.ingredientes}
              onToggle={(id) => toggle("ingredientes", id)}
            />

            <Checklist
              title="Extras"
              items={data.extras}
              detail={(x) => money(x.costo)}
              onToggle={(id) => toggle("extras", id)}
            />

            <Checklist
              title="Salsas"
              items={data.salsas}
              detail={(x) =>
                `${money(x.costo_extra)}${
                  x.default_sel ? " · Predeterminada" : ""
                }`
              }
              onToggle={(id) => toggle("salsas", id)}
              extraAction={(item) => (
                <button
                  type="button"
                  onClick={() => setDefaultSalsa(item.id)}
                  style={miniBtn}
                >
                  Predeterminada
                </button>
              )}
            />
          </div>
        ) : null}

        {!loading && !especialidadesPizza.length ? (
          <EmptyState
            icon="🍕"
            title="No hay pizzas disponibles"
            description="Crea productos en la categoría Pizzas para configurar su personalización."
          />
        ) : null}
      </div>
    </AdminPanel>
  );
}

function Checklist({ title, items = [], detail, onToggle, extraAction }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 14,
        background: "#fff",
      }}
    >
      <h3 style={{ marginTop: 0 }}>{title}</h3>

      <div
        style={{ display: "grid", gap: 8, maxHeight: 320, overflow: "auto" }}
      >
        {items.length ? (
          items.map((item) => (
            <label
              key={item.id}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: 8,
                alignItems: "start",
              }}
            >
              <input
                type="checkbox"
                checked={Boolean(item.seleccionado)}
                onChange={() => onToggle(item.id)}
              />

              <span>
                <strong>{item.nombre}</strong>

                {detail ? (
                  <small style={{ display: "block", color: "#64748b" }}>
                    {detail(item)}
                  </small>
                ) : null}

                {extraAction ? (
                  <span style={{ display: "block", marginTop: 4 }}>
                    {extraAction(item)}
                  </span>
                ) : null}
              </span>
            </label>
          ))
        ) : (
          <small style={{ color: "#64748b" }}>Sin registros disponibles.</small>
        )}
      </div>
    </div>
  );
}

const th = { padding: "10px 8px", fontSize: 13, color: "#64748b" };
const td = { padding: "12px 8px", verticalAlign: "top" };

const miniBtn = {
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  background: "#fff",
  padding: "4px 8px",
  cursor: "pointer",
  fontWeight: 700,
};

function defaultForm(active) {
  return {
    id: "",
    nombre: "",
    descripcion: "",
    orden: "0",
    porciones: "",
    costo_extra: "0",
    costo: "0",
    tipo: active === "ingredientes" ? "otro" : "",
    activo: true,
  };
}

function editForm(active, item) {
  return {
    ...defaultForm(active),
    id: item.id,
    nombre: item.nombre || "",
    descripcion: item.descripcion || "",
    orden: item.orden ?? "0",
    porciones: item.porciones ?? "",
    costo_extra: item.costo_extra ?? "0",
    costo: item.costo ?? "0",
    tipo: item.tipo || "otro",
    activo: Boolean(item.activo),
  };
}

function buildPayload(active, form) {
  if (active === "categorias") {
    return {
      nombre: form.nombre,
      descripcion: form.descripcion || null,
      orden: Number(form.orden || 0),
      activo: Boolean(form.activo),
    };
  }

  if (active === "tamanios") {
    return {
      nombre: form.nombre,
      descripcion: form.descripcion || null,
      porciones: form.porciones === "" ? null : Number(form.porciones),
      activo: Boolean(form.activo),
    };
  }

  if (active === "ingredientes") {
    return {
      nombre: form.nombre,
      tipo: form.tipo || "otro",
      descripcion: form.descripcion || null,
      activo: Boolean(form.activo),
    };
  }

  if (active === "extras") {
    return {
      nombre: form.nombre,
      descripcion: form.descripcion || null,
      costo: Number(form.costo || 0),
      activo: Boolean(form.activo),
    };
  }

  return {
    nombre: form.nombre,
    descripcion: form.descripcion || null,
    costo_extra: Number(form.costo_extra || 0),
    activo: Boolean(form.activo),
  };
}

function renderDetail(active, item) {
  if (active === "categorias") {
    return item.descripcion || `Orden: ${item.orden ?? 0}`;
  }

  if (active === "tamanios") {
    return `${item.descripcion || ""}${
      item.porciones ? ` · ${item.porciones} porciones` : ""
    }`;
  }

  if (active === "ingredientes") {
    return `Tipo: ${item.tipo || "otro"}`;
  }

  if (active === "extras") {
    return `Costo: ${money(item.costo)}`;
  }

  return `Costo extra: ${money(item.costo_extra)}`;
}
