import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../ui/ToastProvider.jsx";
import { adminPersonalizacionApi } from "../../api/adminPersonalizacion.api.js";

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  return [];
}

function toggleId(ids, id) {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
}

function setOnlyOneDefault(salsasIds, defaultId) {
  if (!defaultId) return null;
  return salsasIds.includes(defaultId) ? defaultId : salsasIds[0] || null;
}

export default function AdminPersonalizacionProducto() {
  const { token } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pizzas, setPizzas] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [error, setError] = useState("");

  const [catalogos, setCatalogos] = useState({
    ingredientes: [],
    extras: [],
    salsas: [],
  });

  const [selectedIngredientes, setSelectedIngredientes] = useState([]);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [selectedSalsas, setSelectedSalsas] = useState([]);
  const [salsaDefaultId, setSalsaDefaultId] = useState(null);

  const pizzaSeleccionada = useMemo(
    () =>
      pizzas.find((pizza) => String(pizza.id) === String(selectedId)) || null,
    [pizzas, selectedId],
  );

  async function cargarPizzas() {
    try {
      setLoading(true);
      setError("");
      const data = await adminPersonalizacionApi.listPizzas(token);
      const rows = toArray(data);
      setPizzas(rows);
      setSelectedId((prev) => prev || rows[0]?.id || "");
    } catch (err) {
      setError(err?.message || "No se pudieron cargar las pizzas.");
    } finally {
      setLoading(false);
    }
  }

  async function cargarPersonalizacion(productoId = selectedId) {
    if (!productoId) return;

    try {
      setLoadingConfig(true);
      setError("");

      const data = await adminPersonalizacionApi.getProducto(token, productoId);

      setCatalogos({
        ingredientes: toArray(data?.ingredientes),
        extras: toArray(data?.extras),
        salsas: toArray(data?.salsas),
      });

      const ingredientesIds = toArray(data?.ingredientes_ids);
      const extrasIds = toArray(data?.extras_ids);
      const salsasIds = toArray(data?.salsas_ids);

      setSelectedIngredientes(ingredientesIds);
      setSelectedExtras(extrasIds);
      setSelectedSalsas(salsasIds);
      setSalsaDefaultId(data?.salsa_default_id || salsasIds[0] || null);
    } catch (err) {
      setError(err?.message || "No se pudo cargar la personalización.");
    } finally {
      setLoadingConfig(false);
    }
  }

  async function guardarPersonalizacion() {
    if (!selectedId || !pizzaSeleccionada) {
      toast.warning("Selecciona una pizza para guardar.");
      return;
    }

    try {
      setSaving(true);

      await adminPersonalizacionApi.saveProducto(token, selectedId, {
        ingredientes_ids: selectedIngredientes,
        extras_ids: selectedExtras,
        salsas_ids: selectedSalsas,
        salsa_default_id: setOnlyOneDefault(selectedSalsas, salsaDefaultId),
        productos_ids: pizzaSeleccionada.productos_ids || [selectedId],
        aplicar_a_especialidad: true,
      });

      toast.success("Personalización guardada para la especialidad completa.");
      await cargarPersonalizacion(selectedId);
    } catch (err) {
      toast.error(err?.message || "No se pudo guardar la personalización.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (token) cargarPizzas();
  }, [token]);

  useEffect(() => {
    if (selectedId) cargarPersonalizacion(selectedId);
  }, [selectedId]);

  const inputStyle = {
    width: "100%",
    minHeight: 44,
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: "0 14px",
    background: "#fff",
    fontWeight: 700,
    color: "#1f2937",
  };

  const cardStyle = {
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 14,
    background: "#fff",
    minHeight: 300,
    maxHeight: 380,
    overflowY: "auto",
  };

  if (loading) {
    return (
      <section style={{ padding: 18, borderRadius: 18, background: "#fff7ed" }}>
        Cargando personalización por producto...
      </section>
    );
  }

  return (
    <section
      style={{
        padding: 22,
        borderRadius: 20,
        border: "1px solid #e5e7eb",
        background: "#fff7ed",
        display: "grid",
        gap: 16,
      }}
    >
      <div>
        <h2
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 1000,
            color: "#111827",
          }}
        >
          Personalización por producto
        </h2>
        <p style={{ margin: "6px 0 0", color: "#4b5563", fontSize: 14 }}>
          Solo se muestran especialidades de la categoría Pizzas. La
          configuración se aplica a todos sus tamaños.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "var(--adm-grid-pedidos-toolbar)",
          gap: 10,
          alignItems: "center",
        }}
      >
        <select
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
          style={inputStyle}
        >
          <option value="">Selecciona una pizza</option>
          {pizzas.map((pizza) => (
            <option key={pizza.id} value={pizza.id}>
              {pizza.nombre}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => cargarPersonalizacion(selectedId)}
          disabled={!selectedId || loadingConfig}
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: "12px 18px",
            background: "#fff",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          {loadingConfig ? "Cargando..." : "Cargar"}
        </button>

        <button
          type="button"
          onClick={guardarPersonalizacion}
          disabled={!selectedId || saving}
          style={{
            border: "none",
            borderRadius: 12,
            padding: "12px 18px",
            background: "#9f392f",
            color: "#fff",
            fontWeight: 1000,
            cursor: "pointer",
          }}
        >
          {saving ? "Guardando..." : "Guardar personalización"}
        </button>
      </div>

      {pizzaSeleccionada ? (
        <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 700 }}>
          Especialidad seleccionada: <b>{pizzaSeleccionada.nombre}</b>.
          Productos relacionados: {pizzaSeleccionada.productos_ids?.length || 1}
          .
        </div>
      ) : null}

      {error ? (
        <div
          style={{
            padding: 12,
            borderRadius: 12,
            background: "#fee2e2",
            color: "#991b1b",
            fontWeight: 800,
          }}
        >
          {error}
        </div>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
          gap: 14,
        }}
      >
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 12px", fontSize: 20 }}>Ingredientes</h3>
          {catalogos.ingredientes.length === 0 ? (
            <p style={{ color: "#6b7280" }}>No hay ingredientes activos.</p>
          ) : (
            catalogos.ingredientes.map((ing) => (
              <label
                key={ing.id}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  marginBottom: 10,
                  fontWeight: 800,
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedIngredientes.includes(ing.id)}
                  onChange={() =>
                    setSelectedIngredientes((prev) => toggleId(prev, ing.id))
                  }
                />
                {ing.nombre}
              </label>
            ))
          )}
        </div>

        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 12px", fontSize: 20 }}>Extras</h3>
          {catalogos.extras.length === 0 ? (
            <p style={{ color: "#6b7280" }}>No hay extras activos.</p>
          ) : (
            catalogos.extras.map((extra) => (
              <label
                key={extra.id}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  marginBottom: 14,
                  fontWeight: 800,
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedExtras.includes(extra.id)}
                  onChange={() =>
                    setSelectedExtras((prev) => toggleId(prev, extra.id))
                  }
                  style={{ marginTop: 4 }}
                />
                <span>
                  {extra.nombre}
                  <br />
                  <small style={{ color: "#6b7280" }}>
                    ${Number(extra.costo || 0).toFixed(2)}
                  </small>
                </span>
              </label>
            ))
          )}
        </div>

        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 12px", fontSize: 20 }}>Salsas</h3>
          {catalogos.salsas.length === 0 ? (
            <p style={{ color: "#6b7280" }}>No hay salsas activas.</p>
          ) : (
            catalogos.salsas.map((salsa) => {
              const selected = selectedSalsas.includes(salsa.id);
              return (
                <div key={salsa.id} style={{ marginBottom: 14 }}>
                  <label
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                      fontWeight: 900,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => {
                        setSelectedSalsas((prev) => {
                          const next = toggleId(prev, salsa.id);
                          if (!next.includes(salsaDefaultId)) {
                            setSalsaDefaultId(next[0] || null);
                          }
                          return next;
                        });
                      }}
                      style={{ marginTop: 4 }}
                    />
                    <span>
                      {salsa.nombre}
                      <br />
                      <small style={{ color: "#6b7280" }}>
                        ${Number(salsa.costo_extra || 0).toFixed(2)}
                      </small>
                    </span>
                  </label>

                  <button
                    type="button"
                    disabled={!selected}
                    onClick={() => setSalsaDefaultId(salsa.id)}
                    style={{
                      marginLeft: 28,
                      marginTop: 6,
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      padding: "7px 12px",
                      background:
                        salsaDefaultId === salsa.id ? "#dcfce7" : "#fff",
                      color:
                        salsaDefaultId === salsa.id ? "#15803d" : "#111827",
                      fontWeight: 900,
                      cursor: selected ? "pointer" : "not-allowed",
                    }}
                  >
                    {salsaDefaultId === salsa.id
                      ? "Predeterminada"
                      : "Marcar predeterminada"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
