export function safeDateValue(value, fallback = 0) {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date.getTime();
}

export function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function getPrimaryVariant(product) {
  if (!Array.isArray(product?.tamanios)) return null;
  return (
    product.tamanios.find((item) => item.activo !== false) ||
    product.tamanios[0] ||
    null
  );
}

export function getLowestPrice(product) {
  const active = Array.isArray(product?.tamanios)
    ? product.tamanios.filter(
        (item) => item.activo !== false && Number(item.precio_base) > 0,
      )
    : [];

  if (!active.length)
    return Number(product?.precio_base || product?.precio || 0);
  return Math.min(...active.map((item) => Number(item.precio_base || 0)));
}

export function formatMoney(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function buildProductStats(productos = []) {
  return {
    total: productos.length,
    activos: productos.filter((p) => p.activo !== false).length,
    disponibles: productos.filter(
      (p) => p.disponible !== false && p.activo !== false,
    ).length,
    sinPrecio: productos.filter(
      (p) =>
        !Array.isArray(p.tamanios) ||
        !p.tamanios.some(
          (t) => t.activo !== false && Number(t.precio_base) > 0,
        ),
    ).length,
  };
}

export function filterProducts(
  productos = [],
  search = "",
  categoria = "all",
  estado = "all",
) {
  const q = normalizeText(search);

  return productos.filter((item) => {
    const categoriaOk =
      categoria === "all" ||
      String(item.categoria_id || "") === String(categoria);
    const estadoOk =
      estado === "all" ||
      (estado === "activo" && item.activo !== false) ||
      (estado === "inactivo" && item.activo === false) ||
      (estado === "disponible" && item.disponible !== false) ||
      (estado === "nodisponible" && item.disponible === false);

    const variantsText = Array.isArray(item.tamanios)
      ? item.tamanios.map((t) => `${t.tamanio} ${t.precio_base}`).join(" ")
      : "";

    const searchOk =
      !q ||
      normalizeText(
        `${item.nombre} ${item.descripcion} ${item.categoria} ${variantsText}`,
      ).includes(q);

    return categoriaOk && estadoOk && searchOk;
  });
}
