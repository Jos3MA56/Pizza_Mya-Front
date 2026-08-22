import { useMemo } from "react";
import Input from "../../ui/Input.jsx";
import Modal from "../../ui/Modal.jsx";
import Textarea from "../../ui/Textarea.jsx";
import { createClientId } from "../../../utils/id.js";
import AdminButton from "../ui/AdminButton.jsx";
import { adminTheme } from "../ui/adminTheme.js";
import {
  DIAS_SEMANA,
  buildProductVariantOptions,
  getComboOptionLabel,
  getComboOptionValue,
} from "../../../utils/adminCombos.utils.js";
import CloudinaryImageField from "../CloudinaryImageField.jsx";

export default function ComboFormModal({
  open,
  mode,
  value,
  setValue,
  products,
  saving,
  token,
  onClose,
  onSubmit,
}) {
  const productOptions = useMemo(
    () => buildProductVariantOptions(products || []),
    [products],
  );

  const toggleDia = (dia) => {
    setValue((prev) => {
      const exists = prev.dias.includes(dia);
      const dias = exists
        ? prev.dias.filter((d) => d !== dia)
        : [...prev.dias, dia].sort((a, b) => a - b);
      return { ...prev, dias };
    });
  };

  const addItem = () => {
    setValue((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          localId: createClientId("combo-item"),
          producto_id: "",
          producto_tamanio_id: "",
          cantidad: 1,
        },
      ],
    }));
  };

  const updateItem = (localId, patch) => {
    setValue((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.localId === localId ? { ...item, ...patch } : item,
      ),
    }));
  };

  const selectItem = (localId, selectedValue) => {
    const selected = productOptions.find(
      (option) => getComboOptionValue(option) === selectedValue,
    );

    updateItem(localId, {
      producto_id: selected?.producto_id || "",
      producto_tamanio_id: selected?.producto_tamanio_id || "",
      nombre: selected?.producto_nombre || "",
      tamanio: selected?.tamanio || "",
      producto_precio_base: selected?.precio_base || 0,
    });
  };

  const removeItem = (localId) => {
    setValue((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.localId !== localId),
    }));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={mode === "create" ? "Nuevo combo" : "Editar combo"}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await onSubmit();
        }}
        style={{ display: "grid", gap: 18 }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "var(--adm-grid-two)",
            gap: 16,
            padding: 18,
            borderRadius: 20,
            background: adminTheme.cardMuted,
            border: `1px solid ${adminTheme.border}`,
          }}
        >
          <Input
            label="Nombre del combo"
            value={value.nombre}
            onChange={(e) =>
              setValue((prev) => ({ ...prev, nombre: e.target.value }))
            }
            placeholder="Ej. Combo fin de semana"
          />
          <Input
            label="Precio"
            type="number"
            value={value.precio_combo}
            onChange={(e) =>
              setValue((prev) => ({ ...prev, precio_combo: e.target.value }))
            }
            placeholder="0.00"
          />
        </div>

        <Textarea
          label="Descripción"
          rows={3}
          value={value.descripcion}
          onChange={(e) =>
            setValue((prev) => ({ ...prev, descripcion: e.target.value }))
          }
          placeholder="Describe qué incluye el combo"
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "var(--adm-grid-two)",
            gap: 16,
            alignItems: "start",
          }}
        >
          <CloudinaryImageField
            token={token}
            folder="pizza-mya/combos"
            value={value.imagen_url}
            onChange={(url) =>
              setValue((prev) => ({ ...prev, imagen_url: url }))
            }
            label="Imagen del combo"
            placeholder="https://..."
            pickerTitle="Seleccionar imagen del combo"
            previewAlt={value.nombre || "Combo"}
            previewHeight={220}
          />
          <Input
            label="Orden"
            type="number"
            value={value.orden}
            onChange={(e) =>
              setValue((prev) => ({ ...prev, orden: e.target.value }))
            }
          />
        </div>

        <div
          style={{
            padding: 18,
            borderRadius: 20,
            background: adminTheme.surface,
            border: `1px solid ${adminTheme.border}`,
            display: "grid",
            gap: 12,
          }}
        >
          <div
            style={{ fontSize: 13, fontWeight: 800, color: adminTheme.text }}
          >
            Días disponibles
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {DIAS_SEMANA.map((dia) => {
              const active = value.dias.includes(dia.value);
              return (
                <button
                  key={dia.value}
                  type="button"
                  onClick={() => toggleDia(dia.value)}
                  style={{
                    borderRadius: 999,
                    border: active
                      ? `1px solid ${adminTheme.accent}`
                      : `1px solid ${adminTheme.border}`,
                    background: active
                      ? adminTheme.accentSoft
                      : adminTheme.card,
                    color: active ? adminTheme.accent : adminTheme.text,
                    padding: "8px 14px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {dia.label}
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            padding: 18,
            borderRadius: 20,
            background: adminTheme.card,
            border: `1px solid ${adminTheme.border}`,
            display: "grid",
            gap: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: adminTheme.text,
                }}
              >
                Productos del combo
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  color: adminTheme.muted,
                  fontWeight: 700,
                }}
              >
                Elige el producto y, cuando aplique, su tamaño/presentación
                exacta.
              </div>
            </div>
            <AdminButton type="button" variant="secondary" onClick={addItem}>
              + Agregar producto
            </AdminButton>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {value.items.length === 0 ? (
              <div
                style={{
                  padding: 16,
                  borderRadius: 14,
                  background: adminTheme.cardMuted,
                  color: adminTheme.muted,
                }}
              >
                Agrega al menos un producto al combo.
              </div>
            ) : null}

            {value.items.map((item) => {
              const selectedValue = `${item.producto_id || ""}::${item.producto_tamanio_id || ""}`;

              return (
                <div
                  key={item.localId}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "var(--adm-grid-pedidos-toolbar)",
                    gap: 12,
                    alignItems: "end",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        marginBottom: 8,
                        color: adminTheme.text,
                      }}
                    >
                      Producto / presentación
                    </div>
                    <select
                      value={selectedValue}
                      onChange={(e) => selectItem(item.localId, e.target.value)}
                      style={{
                        width: "100%",
                        height: 46,
                        borderRadius: 14,
                        border: `1px solid ${adminTheme.border}`,
                        background: adminTheme.card,
                        padding: "0 12px",
                        color: adminTheme.text,
                      }}
                    >
                      <option value="::">Selecciona un producto</option>
                      {productOptions.map((option) => {
                        const valueOption = getComboOptionValue(option);
                        return (
                          <option key={valueOption} value={valueOption}>
                            {getComboOptionLabel(option)}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <Input
                    label="Cantidad"
                    type="number"
                    value={item.cantidad}
                    onChange={(e) =>
                      updateItem(item.localId, { cantidad: e.target.value })
                    }
                  />

                  <AdminButton
                    type="button"
                    variant="danger"
                    onClick={() => removeItem(item.localId)}
                  >
                    Quitar
                  </AdminButton>
                </div>
              );
            })}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <AdminButton type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </AdminButton>
          <AdminButton
            type="submit"
            loading={saving}
            loadingText="Guardando..."
          >
            Guardar combo
          </AdminButton>
        </div>
      </form>
    </Modal>
  );
}
