import { useEffect, useMemo, useState } from "react";
import {
  Package,
  Pizza,
  RefreshCcw,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Shapes,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../components/ui/ToastProvider.jsx";
import ConfirmModal from "../../components/ui/ConfirmModal.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Loader from "../../components/ui/Loader.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Input from "../../components/ui/Input.jsx";
import Textarea from "../../components/ui/Textarea.jsx";
import Select from "../../components/ui/Select.jsx";
import CloudinaryImageField from "../../components/admin/CloudinaryImageField.jsx";
import Badge from "../../components/ui/Badge.jsx";
import { useAdminProductos } from "../../hooks/admin/useAdminProductos.js";
import { getPrimaryVariant } from "../../utils/adminProductos.utils.js";
import { adminProductosApi } from "../../api/adminProductos.api.js";
import AdminButton from "../../components/admin/ui/AdminButton.jsx";
import AdminPageHeader from "../../components/admin/ui/AdminPageHeader.jsx";
import AdminSectionCard from "../../components/admin/ui/AdminSectionCard.jsx";
import AdminSearchBar from "../../components/admin/ui/AdminSearchBar.jsx";
import AdminStatCard from "../../components/admin/ui/AdminStatCard.jsx";
import {
  adminTheme,
  selectStyle,
} from "../../components/admin/ui/adminTheme.js";

const PAGE_SIZE = 100;
const PIZZA_SIZE_ORDER = ["Individual", "Mediana", "Grande", "Jumbo"];

function resolveProductFolderByCategoryId(categoryId, categorias = []) {
  const categoriaActual = categorias.find(
    (c) => String(c.id) === String(categoryId),
  );

  const nombre = String(categoriaActual?.nombre || "")
    .trim()
    .toLowerCase();

  if (nombre.includes("pizza")) return "pizza-mya/productos/pizzas";
  if (nombre.includes("bebida")) return "pizza-mya/productos/bebidas";
  if (nombre.includes("complemento")) return "pizza-mya/productos/complementos";
  return "pizza-mya/productos";
}

function formatMoney(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));
}

function normalizeCategoryName(value = "") {
  if (typeof value === "object" && value !== null) {
    return String(value.nombre || "Sin categoría").trim() || "Sin categoría";
  }

  return String(value || "Sin categoría").trim() || "Sin categoría";
}

function getCategoryKey(nombre = "") {
  const text = String(nombre || "")
    .trim()
    .toLowerCase();

  if (text.includes("pizza")) return "pizza";
  if (text.includes("bebida")) return "bebida";
  return "";
}

function getProductCategoryName(item = {}) {
  return normalizeCategoryName(
    item?.categoria?.nombre ||
      item?.categoria_nombre ||
      item?.categoriaNombre ||
      item?.categoria ||
      "",
  );
}

function getVariantLabelByCategory(categoriaNombre = "") {
  return getCategoryKey(categoriaNombre) === "pizza"
    ? "Tamaño"
    : "Presentación";
}

function isPizzaSize(nombre = "") {
  const text = String(nombre || "").trim();
  return PIZZA_SIZE_ORDER.includes(text) || text.toLowerCase() === "estándar";
}

function isDrinkSize(nombre = "") {
  const text = String(nombre || "")
    .trim()
    .toLowerCase();

  return text.includes("ml") || /\b\d+(\.\d+)?\s*l\b/i.test(text);
}

function sizeMatchesCategory(nombre = "", categoriaNombre = "") {
  const categoryKey = getCategoryKey(categoriaNombre);

  if (categoryKey === "pizza") return isPizzaSize(nombre);
  if (categoryKey === "bebida") return isDrinkSize(nombre);

  return false;
}

function getAvailableVariantsByCategory(
  tamaniosCatalogo = [],
  categoriaNombre = "",
) {
  const categoryKey = getCategoryKey(categoriaNombre);
  if (!categoryKey) return [];

  const map = new Map();

  const addOption = (nombre, id = "") => {
    const value = String(nombre || "").trim();
    if (!value) return;
    if (!id) return;
    if (!sizeMatchesCategory(value, categoriaNombre)) return;

    const normalized = value.toLowerCase();

    if (!map.has(normalized)) {
      map.set(normalized, {
        value,
        label: value,
        tamanio_id: String(id),
      });
    }
  };

  for (const item of tamaniosCatalogo) {
    if (item?.activo === false) continue;
    addOption(item?.nombre, item?.id);
  }

  return Array.from(map.values()).sort((a, b) =>
    a.label.localeCompare(b.label, "es", { numeric: true }),
  );
}

function getVariantIdFromCatalog(tamaniosCatalogo = [], tamanioTexto = "") {
  const target = String(tamanioTexto || "")
    .trim()
    .toLowerCase();

  if (!target) return "";

  const found = tamaniosCatalogo.find(
    (item) =>
      item?.activo !== false &&
      String(item?.nombre || "")
        .trim()
        .toLowerCase() === target,
  );

  return String(found?.id || "");
}

function getPizzaBaseName(nombre = "") {
  return String(nombre || "")
    .replace(/\(\s*(individual|mediana|grande|jumbo).*?\)/gi, "")
    .replace(/\b(individual|mediana|grande|jumbo)\b\s*\d{0,2}\s*"?/gi, "")
    .replace(/\s*-\s*(individual|mediana|grande|jumbo)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function getDrinkBaseName(nombre = "") {
  return String(nombre || "")
    .replace(/\b\d+(\.\d+)?\s*(ml|l)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function parseDrinkSizeValue(label = "") {
  const text = String(label || "")
    .trim()
    .toLowerCase();

  const mlMatch = text.match(/(\d+(?:\.\d+)?)\s*ml/);
  if (mlMatch) return Number(mlMatch[1]);

  const lMatch = text.match(/(\d+(?:\.\d+)?)\s*l/);
  if (lMatch) return Number(lMatch[1]) * 1000;

  return Number.MAX_SAFE_INTEGER;
}

function sortVariantLabels(categoryKey, a, b) {
  const aLabel = String(a.label || "").trim();
  const bLabel = String(b.label || "").trim();

  if (categoryKey === "pizza") {
    const aIndex = PIZZA_SIZE_ORDER.indexOf(aLabel);
    const bIndex = PIZZA_SIZE_ORDER.indexOf(bLabel);

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
  }

  if (categoryKey === "bebida") {
    return parseDrinkSizeValue(aLabel) - parseDrinkSizeValue(bLabel);
  }

  return aLabel.localeCompare(bLabel, "es", { numeric: true });
}

function buildGroupedDisplayItems(productos = []) {
  const grouped = new Map();
  const others = [];

  for (const product of productos) {
    const categoriaNombre = getProductCategoryName(product);
    const categoryKey = getCategoryKey(categoriaNombre);

    if (!["pizza", "bebida"].includes(categoryKey)) {
      others.push({
        type: "product",
        key: `product-${product.id}`,
        product,
      });
      continue;
    }

    const baseName =
      categoryKey === "pizza"
        ? getPizzaBaseName(product.nombre) || product.nombre
        : getDrinkBaseName(product.nombre) || product.nombre;

    const groupKey = `${product.categoria_id || categoryKey}::${baseName.toLowerCase()}`;

    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, {
        type: "variantGroup",
        key: `${categoryKey}-${groupKey}`,
        groupId: groupKey,
        categoryKey,
        nombre: baseName,
        categoria: categoriaNombre,
        descripcion: product.descripcion || "",
        imagen_url: product.imagen_url || "",
        products: [],
        variantsMap: new Map(),
      });
    }

    const group = grouped.get(groupKey);
    group.products.push(product);

    if (!group.descripcion && product.descripcion) {
      group.descripcion = product.descripcion;
    }

    if (!group.imagen_url && product.imagen_url) {
      group.imagen_url = product.imagen_url;
    }

    const addVariant = ({
      label,
      tamanioId,
      productoTamanioId,
      price,
      imageUrl,
      sourceProduct,
      activo = true,
    }) => {
      const cleanLabel = String(label || "").trim();
      const cleanTamanioId = String(tamanioId || "").trim();
      const cleanProductoTamanioId = String(productoTamanioId || "").trim();
      const cleanPrice = Number(price || 0);

      if (
        !cleanLabel ||
        !cleanTamanioId ||
        !cleanProductoTamanioId ||
        !(cleanPrice > 0)
      ) {
        return;
      }

      const key = cleanProductoTamanioId;

      if (!group.variantsMap.has(key)) {
        group.variantsMap.set(key, {
          id: cleanProductoTamanioId,
          producto_tamanio_id: cleanProductoTamanioId,
          value: cleanLabel,
          label: cleanLabel,
          tamanio_id: cleanTamanioId,
          price: cleanPrice,
          imagen_url: imageUrl || sourceProduct?.imagen_url || "",
          activo: activo !== false,
          product: {
            ...sourceProduct,
            nombre_original: sourceProduct?.nombre || "",
            nombre_grupo: baseName,
            tamanio: cleanLabel,
            tamanio_id: cleanTamanioId,
            producto_tamanio_id: cleanProductoTamanioId,
            imagen_url: imageUrl || sourceProduct?.imagen_url || "",
            precio: cleanPrice,
            precio_base: cleanPrice,
          },
        });
      }
    };

    if (Array.isArray(product.tamanios) && product.tamanios.length > 0) {
      for (const variant of product.tamanios) {
        addVariant({
          label:
            variant?.tamanio ||
            variant?.tamanio_nombre ||
            variant?.nombre ||
            "",
          tamanioId: variant?.tamanio_id || "",
          productoTamanioId:
            variant?.producto_tamanio_id ||
            variant?.id ||
            variant?.producto_tamanioId ||
            "",
          price: variant?.precio_base || variant?.precio || 0,
          imageUrl: variant?.imagen_url || "",
          sourceProduct: product,
          activo: variant?.activo !== false,
        });
      }
    }
  }

  const groupedItems = Array.from(grouped.values())
    .map((group) => ({
      ...group,
      variants: Array.from(group.variantsMap.values()).sort((a, b) =>
        sortVariantLabels(group.categoryKey, a, b),
      ),
    }))
    .filter((group) => group.variants.length > 0);

  return [...groupedItems, ...others];
}

function ProductFormModal({
  open,
  mode,
  product,
  categorias,
  tamaniosCatalogo,
  loading,
  token,
  onClose,
  onSubmit,
}) {
  const primary = useMemo(() => getPrimaryVariant(product), [product]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    producto_tamanio_id: null,
    nombre: "",
    descripcion: "",
    precio: "",
    categoria_id: "",
    tamanio: "",
    tamanio_id: "",
    imagen_url: "",
    cloudinary_folder: "pizza-mya/productos",
    disponible: true,
    activo: true,
  });

  useEffect(() => {
    const categoriaId = product?.categoria_id || product?.categoria?.id || "";
    const categoriaActual = categorias.find(
      (c) => String(c.id) === String(categoriaId),
    );
    const categoriaNombre = categoriaActual?.nombre || "";

    const currentTamanio = String(
      product?.tamanio || primary?.tamanio || "",
    ).trim();

    const variantOptions = getAvailableVariantsByCategory(
      tamaniosCatalogo,
      categoriaNombre,
    );

    const matchedOption =
      variantOptions.find(
        (item) => item.value.toLowerCase() === currentTamanio.toLowerCase(),
      ) || null;

    const selectedOption = matchedOption || variantOptions[0] || null;

    const fallbackTamanioId = selectedOption?.tamanio_id || "";

    setFormData({
      producto_tamanio_id:
        product?.producto_tamanio_id ||
        product?.producto_tamanio?.id ||
        primary?.id ||
        primary?.producto_tamanio_id ||
        null,
      nombre: product?.nombre_original || product?.nombre || "",
      descripcion: product?.descripcion || "",
      precio:
        product?.precio ?? product?.precio_base ?? primary?.precio_base ?? "",
      categoria_id: categoriaId,
      tamanio: selectedOption?.value || "",
      tamanio_id: String(fallbackTamanioId || ""),
      imagen_url: product?.imagen_url || "",
      cloudinary_folder: resolveProductFolderByCategoryId(
        categoriaId,
        categorias,
      ),
      disponible: Boolean(product?.disponible ?? true),
      activo: Boolean(product?.activo ?? true),
    });

    setFieldErrors({});
  }, [product, primary, open, categorias, tamaniosCatalogo]);

  const categoriaActual = categorias.find(
    (c) => String(c.id) === String(formData.categoria_id),
  );

  const categoriaNombreActual = categoriaActual?.nombre || "";
  const categoryKeyActual = getCategoryKey(categoriaNombreActual);
  const variantLabel = getVariantLabelByCategory(categoriaNombreActual);

  const variantOptions = getAvailableVariantsByCategory(
    tamaniosCatalogo,
    categoriaNombreActual,
    formData.tamanio,
  );

  const hasVariantOptions = variantOptions.length > 0;
  const showVariantField = Boolean(categoryKeyActual);

  const selectVariantOptions = hasVariantOptions
    ? variantOptions.map((item) => ({
        value: item.value,
        label: item.label,
      }))
    : [
        {
          value: "",
          label: `Sin ${variantLabel.toLowerCase()}s registradas`,
        },
      ];

  const updateField = (key, value) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "categoria_id") {
        next.cloudinary_folder = resolveProductFolderByCategoryId(
          value,
          categorias,
        );

        const nuevaCategoria = categorias.find(
          (c) => String(c.id) === String(value),
        );

        const categoriaNombre = nuevaCategoria?.nombre || "";

        const opciones = getAvailableVariantsByCategory(
          tamaniosCatalogo,
          categoriaNombre,
        );

        if (!opciones.length) {
          next.tamanio = "";
          next.tamanio_id = "";
        } else {
          const currentExists = opciones.some(
            (item) =>
              item.value.toLowerCase() ===
              String(next.tamanio || "")
                .trim()
                .toLowerCase(),
          );

          const selected = currentExists
            ? opciones.find(
                (item) =>
                  item.value.toLowerCase() ===
                  String(next.tamanio || "")
                    .trim()
                    .toLowerCase(),
              )
            : opciones[0];

          next.tamanio = selected?.value || "";
          next.tamanio_id =
            selected?.tamanio_id ||
            getVariantIdFromCatalog(tamaniosCatalogo, selected?.value || "");
        }
      }

      if (key === "tamanio") {
        next.tamanio = value;
        next.tamanio_id = getVariantIdFromCatalog(tamaniosCatalogo, value);
      }

      return next;
    });

    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const errors = {};

    if (!String(formData.nombre || "").trim()) {
      errors.nombre = "El nombre es obligatorio.";
    }

    if (!String(formData.descripcion || "").trim()) {
      errors.descripcion = "La descripción es obligatoria.";
    }

    if (!formData.categoria_id) {
      errors.categoria_id = "Selecciona una categoría.";
    }

    if (
      !(parseFloat(formData.precio) > 0 && parseFloat(formData.precio) < 9999)
    ) {
      errors.precio = "El precio debe ser mayor a 0 y menor a 9999.";
    }

    if (showVariantField && !String(formData.tamanio || "").trim()) {
      errors.tamanio = `Selecciona una ${variantLabel.toLowerCase()}.`;
    }

    if (formData.imagen_url && !/^https?:\/\/.+/i.test(formData.imagen_url)) {
      errors.imagen_url = "La imagen debe iniciar con http o https.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return (
    <Modal
      open={open}
      title={mode === "edit" ? "Editar producto" : "Nuevo producto"}
      onClose={onClose}
      size="lg"
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!validate()) return;
          const precio = parseFloat(formData.precio);
          const presentaciones = [
            {
              id: formData.producto_tamanio_id || null,
              producto_tamanio_id: formData.producto_tamanio_id || null,
              tamanio_id: formData.tamanio_id || "",
              precio_base: Number(precio || 0),
              activo: true,
              imagen_url: formData.imagen_url || null,
            },
          ].filter((item) => item.tamanio_id && item.precio_base > 0);

          await onSubmit({
            ...formData,
            precio,
            presentaciones,
            tamanios: presentaciones,
          });
        }}
        style={{ display: "grid", gap: 18 }}
      >
        <div
          style={{
            padding: 18,
            borderRadius: 20,
            background: adminTheme.cardMuted,
            border: `1px solid ${adminTheme.border}`,
            display: "grid",
            gap: 14,
          }}
        >
          <Input
            label="Nombre *"
            value={formData.nombre}
            error={fieldErrors.nombre}
            onChange={(e) => updateField("nombre", e.target.value)}
          />

          <Textarea
            label="Descripción *"
            rows={3}
            value={formData.descripcion}
            error={fieldErrors.descripcion}
            onChange={(e) => updateField("descripcion", e.target.value)}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "var(--adm-modal-two)",
              gap: 14,
            }}
          >
            <Input
              label="Precio *"
              type="number"
              value={formData.precio}
              error={fieldErrors.precio}
              onChange={(e) => updateField("precio", e.target.value)}
            />
            <Select
              label="Categoría *"
              value={formData.categoria_id}
              error={fieldErrors.categoria_id}
              onChange={(e) => updateField("categoria_id", e.target.value)}
              options={categorias.map((cat) => ({
                value: cat.id,
                label: cat.nombre,
              }))}
            />
          </div>

          {showVariantField ? (
            <div style={{ display: "grid", gap: 8 }}>
              <Select
                label={variantLabel}
                value={formData.tamanio}
                error={fieldErrors.tamanio}
                onChange={(e) => updateField("tamanio", e.target.value)}
                options={selectVariantOptions}
              />

              {!hasVariantOptions ? (
                <div
                  style={{
                    fontSize: 12,
                    color: adminTheme.muted,
                    fontWeight: 700,
                  }}
                >
                  No hay {variantLabel.toLowerCase()}s registradas aún en esta
                  categoría.
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div
          style={{
            padding: 18,
            borderRadius: 20,
            background: adminTheme.surface,
            border: `1px solid ${adminTheme.border}`,
          }}
        >
          <CloudinaryImageField
            token={token}
            folder={formData.cloudinary_folder || "pizza-mya/productos"}
            value={formData.imagen_url}
            onChange={(url) => updateField("imagen_url", url)}
            label="Imagen del producto"
            placeholder="https://..."
            pickerTitle="Seleccionar imagen del producto"
            previewAlt={formData.nombre || "Producto"}
            previewHeight={220}
          />
          <div
            style={{
              marginTop: 10,
              fontSize: 12,
              color: adminTheme.muted,
              fontWeight: 700,
            }}
          >
            Carpeta actual de Cloudinary:{" "}
            <span style={{ color: adminTheme.text }}>
              {formData.cloudinary_folder || "pizza-mya/productos"}
            </span>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "var(--adm-modal-two)",
            gap: 14,
          }}
        >
          <Select
            label="Estado"
            value={formData.activo ? "1" : "0"}
            onChange={(e) => updateField("activo", e.target.value === "1")}
            options={[
              { value: "1", label: "Activo" },
              { value: "0", label: "Inactivo" },
            ]}
          />
          <Select
            label="Disponibilidad"
            value={formData.disponible ? "1" : "0"}
            onChange={(e) => updateField("disponible", e.target.value === "1")}
            options={[
              { value: "1", label: "Disponible" },
              { value: "0", label: "No disponible" },
            ]}
          />
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
            loading={loading}
            loadingText="Guardando..."
          >
            {mode === "edit" ? "Guardar cambios" : "Crear producto"}
          </AdminButton>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminProductos() {
  const { token } = useAuth();
  const toast = useToast();

  const notify = (message, type = "info") => {
    if (type === "success") toast.success(message);
    else if (type === "error") toast.error(message);
    else if (type === "warning") toast.warning(message);
    else toast.info(message);
  };

  const {
    loading,
    saving,
    categorias,
    productos,
    tamaniosCatalogo,
    stats,
    search,
    setSearch,
    categoriaFiltro,
    setCategoriaFiltro,
    estadoFiltro,
    setEstadoFiltro,
    modal,
    openCreate,
    openEdit,
    closeModal,
    submitProduct,
    deleteTarget,
    setDeleteTarget,
    error,
    reload,
  } = useAdminProductos(token, notify);

  const buildPresentacionesPayload = (product) => {
    const variantes = Array.isArray(product?.tamanios) ? product.tamanios : [];

    if (variantes.length > 0) {
      return variantes
        .map((variant) => ({
          id: variant.id || variant.producto_tamanio_id || null,
          producto_tamanio_id:
            variant.id || variant.producto_tamanio_id || null,
          tamanio_id: variant.tamanio_id || "",
          precio_base: Number(variant.precio_base || variant.precio || 0),
          activo: variant.activo !== false,
          imagen_url: variant.imagen_url || null,
        }))
        .filter((variant) => variant.tamanio_id && variant.precio_base > 0);
    }

    return [
      {
        id:
          product?.producto_tamanio_id ||
          product?.producto_tamanio?.id ||
          product?.presentacion_id ||
          null,
        producto_tamanio_id:
          product?.producto_tamanio_id ||
          product?.producto_tamanio?.id ||
          product?.presentacion_id ||
          null,
        tamanio_id: product?.tamanio_id || "",
        precio_base: Number(product?.precio || product?.precio_base || 0),
        activo: true,
        imagen_url: product?.imagen_url || null,
      },
    ].filter((variant) => variant.tamanio_id && variant.precio_base > 0);
  };

  const buildProductUpdatePayload = (product, overrides = {}) => {
    const presentaciones = buildPresentacionesPayload(product);

    return {
      nombre: product?.nombre_original || product?.nombre || "",
      descripcion: product?.descripcion || "",
      categoria_id: product?.categoria_id || product?.categoria?.id || "",
      imagen_url: product?.imagen_url || "",
      activo: product?.activo !== false,
      disponible: product?.disponible !== false,
      presentaciones,
      tamanios: presentaciones,
      ...overrides,
    };
  };

  const updateDisponibilidadExacta = async (product, disponible) => {
    if (!product?.id) return null;

    return adminProductosApi.update(
      token,
      product.id,
      buildProductUpdatePayload(product, { disponible }),
    );
  };

  const toggleActivacionProducto = async () => {
    if (!deleteTarget?.id) return;

    const estabaActivo = deleteTarget.activo !== false;
    const siguienteActivo = !estabaActivo;

    try {
      await adminProductosApi.update(
        token,
        deleteTarget.id,
        buildProductUpdatePayload(deleteTarget, {
          activo: siguienteActivo,
          disponible: siguienteActivo,
        }),
      );

      notify(
        siguienteActivo
          ? "Producto activado correctamente"
          : "Producto desactivado correctamente",
        "success",
      );
      setDeleteTarget(null);
      await reload();
    } catch (error) {
      notify(
        error?.message ||
          (siguienteActivo
            ? "No se pudo activar el producto"
            : "No se pudo desactivar el producto"),
        "error",
      );
    }
  };

  const togglePizzaGroupDisponibilidad = async (item) => {
    if (!item?.products?.length) return;

    const uniqueProducts = Array.from(
      new Map(
        item.products
          .filter((product) => product?.id)
          .map((product) => [String(product.id), product]),
      ).values(),
    );

    if (!uniqueProducts.length) return;

    const hasAnyVisible = uniqueProducts.some(
      (product) => product?.disponible !== false,
    );

    const nextDisponible = !hasAnyVisible;

    try {
      await Promise.all(
        uniqueProducts.map((product) =>
          updateDisponibilidadExacta(product, nextDisponible),
        ),
      );

      notify(
        nextDisponible
          ? "Especialidad mostrada correctamente"
          : "Especialidad oculta correctamente",
        "success",
      );

      await reload();
    } catch (error) {
      notify(
        error?.message ||
          "No se pudo cambiar la disponibilidad de la especialidad",
        "error",
      );
    }
  };

  const toggleDrinkVariantDisponibilidad = async (variant) => {
    if (!variant?.product?.id || !variant?.tamanio_id) return;

    const nextActivo = variant.activo === false;

    try {
      await adminProductosApi.update(token, variant.product.id, {
        solo_variante: true,
        tamanio_id: variant.tamanio_id,
        activo_variante: nextActivo,
      });

      notify(
        nextActivo
          ? "Presentación mostrada correctamente"
          : "Presentación oculta correctamente",
        "success",
      );

      await reload();
    } catch (error) {
      notify(
        error?.message ||
          "No se pudo cambiar la disponibilidad de la presentación",
        "error",
      );
    }
  };

  const hiddenCount = Math.max(
    0,
    Number(stats.total || 0) - Number(stats.disponibles || 0),
  );

  const [variantByGroup, setVariantByGroup] = useState({});
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const productosAgrupados = useMemo(
    () => buildGroupedDisplayItems(productos),
    [productos],
  );

  const productosVisibles = useMemo(
    () => productosAgrupados.slice(0, visibleCount),
    [productosAgrupados, visibleCount],
  );

  const canShowMore = visibleCount < productosAgrupados.length;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, categoriaFiltro, estadoFiltro]);

  useEffect(() => {
    setVariantByGroup((prev) => {
      const next = {};

      for (const item of productosAgrupados) {
        if (item.type !== "variantGroup") continue;

        const previous = prev[item.groupId];
        const exists = item.variants.some(
          (variant) => variant.label === previous,
        );

        next[item.groupId] = exists ? previous : item.variants[0]?.label || "";
      }

      return next;
    });
  }, [productosAgrupados]);

  if (loading) return <Loader text="Cargando productos..." />;

  if (error) {
    return (
      <EmptyState
        title="No se pudieron cargar los productos"
        description={error}
        actionLabel="Reintentar"
        onAction={reload}
      />
    );
  }

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <AdminPageHeader
        title="Productos"
        subtitle="Administra el catálogo completo en una sola vista: productos, imágenes, precios, tamaños y disponibilidad."
        actions={
          <AdminButton
            variant="secondary"
            leftIcon={<RefreshCcw size={16} />}
            onClick={reload}
          >
            Recargar
          </AdminButton>
        }
      />

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
          gap: 16,
        }}
      >
        <AdminStatCard
          title="Catálogo total"
          value={stats.total}
          icon={<Package size={26} />}
          variant="accent"
          helperText="Productos cargados"
        />
        <AdminStatCard
          title="Activos"
          value={stats.activos}
          icon={<Shapes size={26} />}
          variant="olive"
          helperText="Disponibles para operar"
        />
        <AdminStatCard
          title="Ocultos o pausados"
          value={hiddenCount}
          icon={<EyeOff size={26} />}
          variant="rose"
          helperText="Revisar disponibilidad"
        />
        <AdminStatCard
          title="Pizzas"
          value={stats.pizzas || 0}
          icon={<Pizza size={26} />}
          variant="amber"
          helperText="Parte fuerte del menú"
        />
      </section>

      <AdminSectionCard
        title="Búsqueda y filtros"
        subtitle="Filtra sin separar los productos por categoría; todos se mantienen en una sola vista."
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "var(--adm-grid-filters)",
            gap: 12,
          }}
        >
          <AdminSearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
            placeholder="Buscar por nombre, categoría o descripción..."
          />
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            style={selectStyle()}
          >
            <option value="all">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            style={selectStyle()}
          >
            <option value="all">Todos los estados</option>
            <option value="disponible">Disponibles</option>
            <option value="nodisponible">No disponibles</option>
          </select>

          <AdminButton leftIcon={<Plus size={16} />} onClick={openCreate}>
            Nuevo producto
          </AdminButton>
        </div>
      </AdminSectionCard>

      {!productosAgrupados.length ? (
        <EmptyState
          title="No se encontraron productos"
          description="Prueba con otra búsqueda o cambia los filtros."
        />
      ) : (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "var(--adm-product-card-grid)",
            gap: 18,
            alignItems: "stretch",
          }}
        >
          {productosVisibles.map((item) => {
            if (item.type === "variantGroup") {
              const selectedLabel =
                variantByGroup[item.groupId] || item.variants[0]?.label || "";

              const selectedVariant =
                item.variants.find(
                  (variant) => variant.label === selectedLabel,
                ) || item.variants[0];

              const selectedProduct =
                selectedVariant?.product || item.products?.[0] || null;

              const selectedProductActive = selectedProduct?.activo !== false;

              const activeVariants = item.variants.filter(
                (variant) => variant.activo !== false,
              );

              const price = activeVariants.length
                ? Math.min(
                    ...activeVariants.map((variant) =>
                      Number(variant.price || 0),
                    ),
                  )
                : Number(
                    selectedVariant?.price ||
                      selectedProduct?.precio ||
                      selectedProduct?.precio_base ||
                      0,
                  );

              const activeVariantsCount = activeVariants.length;
              const totalVariantsCount = item.variants.length;

              const variantTitle =
                item.categoryKey === "pizza" ? "Tamaños" : "Presentaciones";

              const selectedVariantVisible = selectedVariant?.activo !== false;

              const groupHasVisible =
                item.categoryKey === "pizza"
                  ? item.products.some(
                      (product) => product?.disponible !== false,
                    )
                  : selectedVariantVisible;

              const previewImage =
                item.categoryKey === "bebida"
                  ? selectedVariant?.imagen_url ||
                    selectedProduct?.imagen_url ||
                    item.imagen_url
                  : item.imagen_url || selectedProduct?.imagen_url;

              return (
                <article
                  key={item.key}
                  style={{
                    background: adminTheme.card,
                    border: `1px solid ${adminTheme.border}`,
                    borderRadius: 24,
                    overflow: "hidden",
                    display: "grid",
                    boxShadow: adminTheme.shadowSoft,
                  }}
                >
                  <div
                    style={{
                      height: 192,
                      background:
                        "linear-gradient(180deg, #f8f3ee 0%, #efe6db 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt={item.nombre}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : item.categoryKey === "pizza" ? (
                      <Pizza size={56} color={adminTheme.subtle} />
                    ) : (
                      <Package size={56} color={adminTheme.subtle} />
                    )}
                  </div>

                  <div style={{ padding: 18, display: "grid", gap: 14 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 12,
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: 20,
                            fontWeight: 950,
                            color: adminTheme.text,
                            lineHeight: 1.2,
                          }}
                        >
                          {item.nombre}
                        </h3>
                        <div
                          style={{
                            marginTop: 6,
                            color: adminTheme.muted,
                            fontWeight: 800,
                            fontSize: 13,
                          }}
                        >
                          {item.categoria} · {totalVariantsCount}{" "}
                          {item.categoryKey === "pizza"
                            ? "tamaños"
                            : "presentaciones"}
                        </div>
                      </div>

                      <div
                        style={{
                          padding: 12,
                          borderRadius: 14,
                          background: adminTheme.cardSoft,
                          border: `1px solid ${adminTheme.border}`,
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            color: adminTheme.muted,
                            fontWeight: 900,
                          }}
                        >
                          Desde
                        </div>

                        <div
                          style={{
                            fontSize: 24,
                            fontWeight: 1000,
                            color: adminTheme.text,
                            lineHeight: 1.1,
                          }}
                        >
                          {formatMoney(price)}
                        </div>

                        <div
                          style={{
                            marginTop: 6,
                            fontSize: 12,
                            color: adminTheme.muted,
                            fontWeight: 800,
                          }}
                        >
                          {activeVariantsCount}/{totalVariantsCount} activas
                        </div>
                      </div>
                    </div>

                    <p
                      style={{
                        margin: 0,
                        color: adminTheme.muted,
                        minHeight: 44,
                        lineHeight: 1.6,
                      }}
                    >
                      {item.descripcion || "Sin descripción"}
                    </p>

                    <div style={{ display: "grid", gap: 8 }}>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 900,
                          color: adminTheme.muted,
                          textTransform: "uppercase",
                          letterSpacing: ".04em",
                        }}
                      >
                        {variantTitle}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        {item.variants.map((variant) => {
                          const selected = variant.label === selectedLabel;
                          const visible = variant.activo !== false;

                          return (
                            <button
                              key={`${item.groupId}-${variant.label}`}
                              type="button"
                              onClick={() =>
                                setVariantByGroup((prev) => ({
                                  ...prev,
                                  [item.groupId]: variant.label,
                                }))
                              }
                              style={{
                                border: `1px solid ${
                                  selected
                                    ? adminTheme.accent
                                    : visible
                                      ? "#bbf7d0"
                                      : adminTheme.border
                                }`,
                                background: selected
                                  ? adminTheme.accentSoft
                                  : visible
                                    ? "#dcfce7"
                                    : adminTheme.surface,
                                color: selected
                                  ? adminTheme.accent
                                  : visible
                                    ? "#15803d"
                                    : adminTheme.muted,
                                borderRadius: 999,
                                padding: "8px 12px",
                                fontWeight: 900,
                                fontSize: 12,
                                cursor: "pointer",
                                opacity: visible ? 1 : 0.65,
                              }}
                            >
                              {variant.label} · {formatMoney(variant.price)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      <Badge
                        variant={
                          selectedProduct?.activo !== false
                            ? "success"
                            : "danger"
                        }
                      >
                        {selectedProduct?.activo !== false
                          ? "Activo"
                          : "Inactivo"}
                      </Badge>

                      <Badge
                        variant={
                          item.categoryKey === "pizza"
                            ? groupHasVisible
                              ? "info"
                              : "warning"
                            : selectedVariantVisible
                              ? "info"
                              : "warning"
                        }
                      >
                        {item.categoryKey === "pizza"
                          ? groupHasVisible
                            ? "Disponible"
                            : "Oculto"
                          : selectedVariantVisible
                            ? "Disponible"
                            : "Oculto"}
                      </Badge>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 10,
                        marginTop: 4,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          flexWrap: "wrap",
                        }}
                      >
                        <AdminButton
                          variant="secondary"
                          leftIcon={<Pencil size={12} />}
                          onClick={() => openEdit(selectedProduct)}
                        >
                          Editar
                        </AdminButton>

                        <AdminButton
                          variant="ghost"
                          leftIcon={
                            item.categoryKey === "pizza" ? (
                              groupHasVisible ? (
                                <EyeOff size={12} />
                              ) : (
                                <Eye size={12} />
                              )
                            ) : selectedVariantVisible ? (
                              <EyeOff size={12} />
                            ) : (
                              <Eye size={12} />
                            )
                          }
                          onClick={() =>
                            item.categoryKey === "pizza"
                              ? togglePizzaGroupDisponibilidad(item)
                              : toggleDrinkVariantDisponibilidad(
                                  selectedVariant,
                                )
                          }
                        >
                          {item.categoryKey === "pizza"
                            ? groupHasVisible
                              ? "Ocultar"
                              : "Mostrar"
                            : selectedVariantVisible
                              ? "Ocultar"
                              : "Mostrar"}
                        </AdminButton>
                      </div>

                      <AdminButton
                        variant={selectedProductActive ? "danger" : "success"}
                        leftIcon={
                          selectedProductActive ? (
                            <Trash2 size={13} />
                          ) : (
                            <Eye size={13} />
                          )
                        }
                        onClick={() => setDeleteTarget(selectedProduct)}
                      >
                        {selectedProductActive ? "Desactivar" : "Activar"}
                      </AdminButton>
                    </div>
                  </div>
                </article>
              );
            }

            const product = item.product;
            const productActive = product?.activo !== false;
            const variants = Array.isArray(product.tamanios)
              ? product.tamanios
              : [];
            const activeVariants = variants.filter(
              (variant) => variant.activo !== false,
            );

            const price = activeVariants.length
              ? Math.min(
                  ...activeVariants.map((variant) =>
                    Number(variant.precio_base || variant.precio || 0),
                  ),
                )
              : Number(product.precio || product.precio_base || 0);

            return (
              <article
                key={item.key}
                style={{
                  background: adminTheme.card,
                  border: `1px solid ${adminTheme.border}`,
                  borderRadius: 24,
                  overflow: "hidden",
                  display: "grid",
                  boxShadow: adminTheme.shadowSoft,
                }}
              >
                <div
                  style={{
                    height: 192,
                    background:
                      "linear-gradient(180deg, #f8f3ee 0%, #efe6db 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {product.imagen_url ? (
                    <img
                      src={product.imagen_url}
                      alt={product.nombre}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Package size={56} color={adminTheme.subtle} />
                  )}
                </div>

                <div style={{ padding: 18, display: "grid", gap: 14 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: 20,
                          fontWeight: 950,
                          color: adminTheme.text,
                        }}
                      >
                        {product.nombre}
                      </h3>
                      <div
                        style={{
                          marginTop: 6,
                          color: adminTheme.muted,
                          fontWeight: 800,
                          fontSize: 13,
                        }}
                      >
                        {getProductCategoryName(product)}
                        {product.tamanio ? ` · ${product.tamanio}` : ""}
                      </div>
                    </div>

                    <div
                      style={{ display: "grid", gap: 6, justifyItems: "end" }}
                    >
                      <Badge variant={product.activo ? "success" : "danger"}>
                        {product.activo ? "Activo" : "Inactivo"}
                      </Badge>
                      <Badge variant={product.disponible ? "info" : "warning"}>
                        {product.disponible ? "Disponible" : "No disponible"}
                      </Badge>
                    </div>
                  </div>

                  <p
                    style={{
                      margin: 0,
                      minHeight: 44,
                      color: adminTheme.muted,
                      fontSize: 13,
                      lineHeight: 1.6,
                    }}
                  >
                    {product.descripcion || "Sin descripción."}
                  </p>

                  <div
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      background: adminTheme.cardSoft,
                      border: `1px solid ${adminTheme.border}`,
                      display: "flex",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 10,
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color: adminTheme.muted,
                          fontSize: 12,
                          fontWeight: 900,
                        }}
                      >
                        Desde
                      </div>
                      <div
                        style={{
                          color: adminTheme.text,
                          fontSize: 24,
                          fontWeight: 1000,
                        }}
                      >
                        {formatMoney(price)}
                      </div>
                    </div>

                    <div
                      style={{
                        color: adminTheme.muted,
                        fontSize: 12,
                        fontWeight: 800,
                        textAlign: "right",
                      }}
                    >
                      {activeVariants.length}/{variants.length} presentaciones
                      activas
                    </div>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {variants.length ? (
                      variants.map((variant) => (
                        <Badge
                          key={
                            variant.id ||
                            `${variant.tamanio}-${variant.precio_base}`
                          }
                          variant={
                            variant.activo === false ? "neutral" : "success"
                          }
                        >
                          {variant.tamanio ||
                            variant.tamanio_nombre ||
                            "Tamaño"}{" "}
                          · {formatMoney(variant.precio_base)}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="danger">Sin precios</Badge>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 10,
                      marginTop: 4,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <AdminButton
                        size="sm"
                        variant="secondary"
                        leftIcon={<Pencil size={12} />}
                        onClick={() => openEdit(product)}
                      >
                        Editar
                      </AdminButton>

                      <AdminButton
                        size="sm"
                        variant={product.disponible ? "ghost" : "success"}
                        leftIcon={
                          product.disponible ? (
                            <EyeOff size={12} />
                          ) : (
                            <Eye size={12} />
                          )
                        }
                        onClick={() =>
                          updateDisponibilidadExacta(
                            product,
                            !product.disponible,
                          )
                            .then(reload)
                            .catch((error) =>
                              notify(
                                error?.message ||
                                  "No se pudo cambiar la disponibilidad",
                                "error",
                              ),
                            )
                        }
                      >
                        {product.disponible ? "Ocultar" : "Mostrar"}
                      </AdminButton>
                    </div>

                    <AdminButton
                      size="sm"
                      variant={productActive ? "danger" : "success"}
                      leftIcon={
                        productActive ? <Trash2 size={13} /> : <Eye size={13} />
                      }
                      onClick={() => setDeleteTarget(product)}
                    >
                      {productActive ? "Desactivar" : "Activar"}
                    </AdminButton>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {canShowMore ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <AdminButton
            variant="secondary"
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
          >
            Mostrar más productos
          </AdminButton>
        </div>
      ) : null}

      <ProductFormModal
        open={modal.open}
        mode={modal.mode}
        product={modal.product}
        categorias={categorias}
        tamaniosCatalogo={tamaniosCatalogo}
        token={token}
        loading={saving}
        onClose={closeModal}
        onSubmit={submitProduct}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title={
          deleteTarget?.activo === false
            ? "Activar producto"
            : "Desactivar producto"
        }
        message={
          deleteTarget?.activo === false
            ? `¿Seguro que deseas activar "${
                deleteTarget?.nombre_original ||
                deleteTarget?.nombre ||
                "este producto"
              }"? El producto volverá a mostrarse como disponible en la tienda.`
            : `¿Seguro que deseas desactivar "${
                deleteTarget?.nombre_original ||
                deleteTarget?.nombre ||
                "este producto"
              }"? El producto no se borrará, solo dejará de mostrarse en la tienda.`
        }
        confirmText={deleteTarget?.activo === false ? "Activar" : "Desactivar"}
        confirmVariant={deleteTarget?.activo === false ? "success" : "danger"}
        loading={saving}
        onClose={() => setDeleteTarget(null)}
        onConfirm={toggleActivacionProducto}
      />
    </div>
  );
}
