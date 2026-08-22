export const PIZZA_SIZE_ORDER = ["Individual", "Mediana", "Grande", "Jumbo"];

export function normalizeText(value = "") {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function detectPizzaSizeLabel(value = "") {
  const n = normalizeText(value);
  if (n.includes("individual")) return "Individual";
  if (n.includes("mediana")) return "Mediana";
  if (n.includes("grande")) return "Grande";
  if (n.includes("jumbo")) return "Jumbo";
  return "";
}

export function parseTamano(nombre = "") {
  return detectPizzaSizeLabel(nombre) || null;
}

export function basePizzaName(nombre = "") {
  return String(nombre || "")
    .replace(/\(\s*(individual|mediana|grande|jumbo).*?\)/gi, "")
    .replace(/\b(individual|mediana|grande|jumbo)\b\s*\d{0,2}\s*"?/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function getProductCategoryName(producto) {
  return (
    producto?.categoria?.nombre ||
    producto?.categoria_nombre ||
    producto?.categoriaNombre ||
    producto?.categoria_id?.nombre ||
    ""
  );
}

export function isPizzaProduct(producto) {
  const cat = normalizeText(getProductCategoryName(producto));
  if (cat.includes("pizza")) return true;

  // Fallback para datos antiguos donde la categoría no viene en el endpoint.
  const name = normalizeText(producto?.nombre || "");
  return (
    name.includes("pizza") ||
    name.includes("individual") ||
    name.includes("mediana") ||
    name.includes("grande") ||
    name.includes("jumbo")
  );
}

function sortPizzaVariants(a, b) {
  const aIndex = PIZZA_SIZE_ORDER.indexOf(a?.tamanio || "");
  const bIndex = PIZZA_SIZE_ORDER.indexOf(b?.tamanio || "");

  if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
  if (aIndex !== -1) return -1;
  if (bIndex !== -1) return 1;
  return String(a?.tamanio || "").localeCompare(String(b?.tamanio || ""), "es");
}

function extractProductVariants(producto) {
  const arr = Array.isArray(producto?.tamanios) ? producto.tamanios : [];

  if (arr.length > 0) {
    return arr
      .filter((t) => t?.activo !== false)
      .map((t) => ({
        producto_id: producto?.id || producto?._id || null,
        producto_tamanio_id: t.id || t.producto_tamanio_id || null,
        tamanio_id: t.tamanio_id || null,
        tamanio:
          detectPizzaSizeLabel(t.tamanio || t.nombre || producto?.nombre) ||
          t.tamanio ||
          t.nombre ||
          "Tamaño",
        precio_base: Number(t.precio_base || producto?.precio_base || 0),
        imagen_url: t.imagen_url || producto?.imagen_url || null,
        producto_nombre: producto?.nombre || "Producto",
        producto,
      }))
      .filter((t) => t.producto_id && t.precio_base > 0);
  }

  const label =
    producto?.tamanio ||
    detectPizzaSizeLabel(producto?.nombre || "") ||
    "Estándar";

  return [
    {
      producto_id: producto?.id || producto?._id || null,
      producto_tamanio_id: producto?.producto_tamanio_id || null,
      tamanio_id: producto?.tamanio_id || null,
      tamanio: label,
      precio_base: Number(producto?.precio_base || producto?.precio || 0),
      imagen_url: producto?.imagen_url || null,
      producto_nombre: producto?.nombre || "Producto",
      producto,
    },
  ].filter((t) => t.producto_id && t.precio_base > 0);
}

export function normalizeProductVariants(producto, allProductos = []) {
  const own = extractProductVariants(producto);

  if (!producto || !isPizzaProduct(producto)) {
    return own;
  }

  const base = normalizeText(basePizzaName(producto.nombre || ""));

  if (base && Array.isArray(allProductos) && allProductos.length > 0) {
    const siblings = allProductos.filter((item) => {
      if (!item || item.activo === false || item.disponible === false) return false;
      if (!isPizzaProduct(item)) return false;
      return normalizeText(basePizzaName(item.nombre || "")) === base;
    });

    if (siblings.length > 1) {
      const seen = new Set();
      const variants = [];

      for (const sibling of siblings) {
        for (const variant of extractProductVariants(sibling)) {
          const key = normalizeText(variant.tamanio || variant.producto_tamanio_id || variant.producto_id);
          if (!key || seen.has(key)) continue;
          seen.add(key);
          variants.push(variant);
        }
      }

      if (variants.length > own.length) {
        return variants.sort(sortPizzaVariants);
      }
    }
  }

  return own.sort(sortPizzaVariants);
}

export function getDisplayPizzaName(producto) {
  if (!isPizzaProduct(producto)) return producto?.nombre || "Producto";

  const base = basePizzaName(producto?.nombre || "");
  if (!base) return producto?.nombre || "Pizza";

  return normalizeText(base).startsWith("pizza") ? base : `Pizza ${base}`;
}
