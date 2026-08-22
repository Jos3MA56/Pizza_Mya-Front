import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { adminConfigApi } from "../../api/adminConfiguracion.api.js";

export default function AdminNosotros() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState({
    historia_negocio: "",
    mision: "",
    vision: "",
    valores: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const data = await adminConfigApi.get({ token });
        if (!cancelled) {
          setForm({
            historia_negocio: data?.historia_negocio || "",
            mision: data?.mision || "",
            vision: data?.vision || "",
            valores: data?.valores || "",
          });
        }
      } catch (error) {
        if (!cancelled) {
          setMessage({
            type: "error",
            text: error?.message || "No se pudo cargar la información",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (token) load();

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [message]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage(null);

      const updated = await adminConfigApi.update({
        token,
        data: form,
      });

      localStorage.setItem("pmya_config", JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent("configUpdated", { detail: updated }),
      );

      setMessage({
        type: "success",
        text: "Información guardada correctamente",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error?.message || "No se pudo guardar la información",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 10, fontWeight: 700, color: "#64748b" }}>
        Cargando sección de nosotros...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 980, width: "100%" }}>
      <h1
        style={{
          marginTop: 0,
          fontSize: "var(--adm-page-title-size, 28px)",
          fontWeight: 900,
        }}
      >
        Acerca de nosotros
      </h1>
      <p style={{ color: "#64748b", fontWeight: 600 }}>
        Esta información se mostrará en la página pública.
      </p>

      {message ? (
        <div
          style={{
            marginBottom: 18,
            padding: "12px 14px",
            borderRadius: 12,
            fontWeight: 700,
            background: message.type === "error" ? "#fee2e2" : "#dcfce7",
            color: message.type === "error" ? "#991b1b" : "#166534",
          }}
        >
          {message.text}
        </div>
      ) : null}

      <form
        onSubmit={handleSave}
        style={{
          display: "grid",
          gap: 18,
          background: "#fff",
          borderRadius: 18,
          padding: "var(--adm-card-padding, 24px)",
          boxShadow: "0 10px 24px rgba(0,0,0,.08)",
        }}
      >
        <Field
          label="Historia del negocio"
          value={form.historia_negocio}
          onChange={(value) => handleChange("historia_negocio", value)}
          rows={6}
          placeholder="Cuenta la historia de Pizza Mya..."
        />

        <Field
          label="Misión"
          value={form.mision}
          onChange={(value) => handleChange("mision", value)}
          rows={4}
          placeholder="Describe la misión del negocio..."
        />

        <Field
          label="Visión"
          value={form.vision}
          onChange={(value) => handleChange("vision", value)}
          rows={4}
          placeholder="Describe la visión del negocio..."
        />

        <Field
          label="Valores"
          value={form.valores}
          onChange={(value) => handleChange("valores", value)}
          rows={5}
          placeholder="Ej. Calidad, rapidez, atención, higiene..."
        />

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              border: "none",
              borderRadius: 12,
              padding: "12px 18px",
              width: "min(100%, 220px)",
              fontWeight: 900,
              background: "#f97316",
              color: "#111",
              cursor: "pointer",
            }}
          >
            {saving ? "Guardando..." : "Guardar información"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, rows = 4, placeholder }) {
  return (
    <label style={{ display: "grid", gap: 8 }}>
      <span style={{ fontWeight: 900, color: "#111827" }}>{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        style={{
          width: "100%",
          border: "1px solid #d1d5db",
          borderRadius: 12,
          padding: "12px 14px",
          fontSize: 14,
          outline: "none",
          resize: "vertical",
          minHeight: 120,
        }}
      />
    </label>
  );
}
