export const DIAS_SEMANA = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mié" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sáb" },
  { value: 7, label: "Dom" },
];

export function defaultComboForm() {
  return {
    nombre: "",
    descripcion: "",
    precio_combo: "",
    imagen_url: "",
    orden: 0,
    activo: true,
    dias: [1, 2, 3, 4, 5, 6, 7],
    items: [],
  };
}

export function getCategoriaIcon(nombre = "") {
  const n = String(nombre).toLowerCase();
  if (n.includes("pizza")) return "🍕";
  if (n.includes("bebida")) return "🥤";
  if (n.includes("complemento") || n.includes("extra")) return "🍟";
  return "📦";
}

export function getProductUuid(product) {
  return String(
    product?.uuid ||
      product?.producto_uuid ||
      product?.producto_id ||
      product?.id ||
      "",
  );
}

export function getProductCategory(product) {
  const categoria =
    product?.categoria || product?.categoria_nombre || "Sin categoría";
  if (typeof categoria === "object" && categoria !== null) {
    return categoria.nombre || "Sin categoría";
  }
  return categoria || "Sin categoría";
}

export function getProductLabel(product) {
  const categoria = getProductCategory(product);
  const tamanio = product?.tamanio ? ` · ${product.tamanio}` : "";
  return `${getCategoriaIcon(categoria)} ${product?.nombre || "Producto"} · ${categoria}${tamanio}`;
}

export function getComboOptionValue(option = {}) {
  return `${option.producto_id || ""}::${option.producto_tamanio_id || ""}`;
}

export function buildProductVariantOptions(products = []) {
  const options = [];
  const seen = new Set();

  for (const product of products) {
    if (!product || product.activo === false || product.disponible === false)
      continue;

    const categoria = getProductCategory(product);
    const base = {
      producto_id: getProductUuid(product),
      producto_nombre: product.nombre || "Producto",
      categoria,
      imagen_url: product.imagen_url || "",
    };

    const variantes = Array.isArray(product.tamanios)
      ? product.tamanios.filter((v) => v && v.activo !== false)
      : [];

    if (variantes.length > 0) {
      for (const v of variantes) {
        const option = {
          ...base,
          producto_tamanio_id: v.producto_tamanio_id || v.id || "",
          tamanio_id: v.tamanio_id || "",
          tamanio:
            v.tamanio || v.tamanio_nombre || v.nombre || product.tamanio || "",
          precio_base: Number(v.precio_base || v.precio || 0),
        };
        const key = getComboOptionValue(option);
        if (
          option.producto_id &&
          option.producto_tamanio_id &&
          !seen.has(key)
        ) {
          seen.add(key);
          options.push(option);
        }
      }
      continue;
    }

    const option = {
      ...base,
      producto_tamanio_id: product.producto_tamanio_id || "",
      tamanio_id: product.tamanio_id || "",
      tamanio: product.tamanio || "",
      precio_base: Number(product.precio_base || product.precio || 0),
    };
    const key = getComboOptionValue(option);
    if (option.producto_id && !seen.has(key)) {
      seen.add(key);
      options.push(option);
    }
  }

  return options.sort((a, b) => {
    const ca = String(a.categoria || "").localeCompare(
      String(b.categoria || ""),
      "es",
    );
    if (ca !== 0) return ca;
    const na = String(a.producto_nombre || "").localeCompare(
      String(b.producto_nombre || ""),
      "es",
    );
    if (na !== 0) return na;
    return String(a.tamanio || "").localeCompare(
      String(b.tamanio || ""),
      "es",
      { numeric: true },
    );
  });
}

export function getComboOptionLabel(option = {}) {
  const categoria = option.categoria || "Sin categoría";
  const tamanio = option.tamanio ? ` · ${option.tamanio}` : "";
  const precio = option.precio_base
    ? ` · $${Number(option.precio_base).toFixed(2)}`
    : "";
  return `${getCategoriaIcon(categoria)} ${option.producto_nombre || "Producto"}${tamanio} · ${categoria}${precio}`;
}

export function diasLabel(dias = []) {
  if (!Array.isArray(dias) || dias.length === 0) return "Sin días";
  if (dias.length === 7) return "Todos los días";
  return DIAS_SEMANA.filter((d) => dias.includes(d.value))
    .map((d) => d.label)
    .join(", ");
}

export function formatCurrency(value) {
  return `$${Number(value || 0).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function normalizeComboDetail(combo = {}) {
  const dias = Array.isArray(combo?.dias)
    ? combo.dias
        .map((d) =>
          typeof d === "number" ? d : Number(d.dia_semana ?? d.id ?? d),
        )
        .filter(Boolean)
    : [];

  const items = Array.isArray(combo?.items)
    ? combo.items.map((item, index) => ({
        id: item.id,
        localId: item.localId || item.id || `item-${index}`,
        producto_id: String(
          item.producto_id || item.producto_uuid || item.uuid || "",
        ),
        producto_tamanio_id: item.producto_tamanio_id
          ? String(item.producto_tamanio_id)
          : "",
        cantidad: Number(item.cantidad || 1),
        nombre: item.nombre || item.producto_nombre || "Producto",
        categoria: item.categoria || item.categoria_nombre || "",
        tamanio: item.tamanio || item.producto_tamanio || "",
        producto_precio_base: Number(item.producto_precio_base || 0),
      }))
    : [];

  return {
    ...defaultComboForm(),
    ...combo,
    precio_combo: combo?.precio_combo ?? "",
    orden: combo?.orden ?? 0,
    activo: Boolean(combo?.activo ?? true),
    dias: dias.length > 0 ? dias : [1, 2, 3, 4, 5, 6, 7],
    items,
  };
}

export function mapProductosToOptions(products = []) {
  return buildProductVariantOptions(products).map((option) => ({
    value: getComboOptionValue(option),
    label: getComboOptionLabel(option),
    option,
  }));
}

export function buildComboStats(combos = []) {
  const active = combos.filter((combo) => combo.activo).length;
  const inactive = combos.length - active;
  const avgPrice = combos.length
    ? combos.reduce((acc, item) => acc + Number(item.precio_combo || 0), 0) /
      combos.length
    : 0;

  return {
    total: combos.length,
    active,
    inactive,
    avgPrice,
  };
}
