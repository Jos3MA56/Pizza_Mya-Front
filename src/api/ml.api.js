import { buildApiUrl, httpJson } from "./http.js";

function formatMlProductName(name, size = null) {
  const productName = String(name || "").trim();
  const productSize = String(size || "").trim();

  if (!productName) return null;

  if (!productSize) {
    return productName;
  }

  if (productName.toLowerCase().includes(productSize.toLowerCase())) {
    return productName;
  }

  return `${productName} (${productSize})`;
}

export function buildMlCartProductNames(items = []) {
  const productNames = [];

  for (const item of Array.isArray(items) ? items : []) {
    if (item?.tipo === "combo") {
      for (const comboItem of Array.isArray(item?.combo_items)
        ? item.combo_items
        : []) {
        const name = formatMlProductName(
          comboItem?.producto_nombre,
          comboItem?.producto_tamanio,
        );

        if (name) {
          productNames.push(name);
        }
      }

      continue;
    }

    const name = formatMlProductName(item?.nombre, item?.tamano);

    if (name) {
      productNames.push(name);
    }
  }

  return [...new Set(productNames)];
}

export async function getCartRecommendations(
  items,
  { maximo = 5, signal } = {},
) {
  const productosCarrito = buildMlCartProductNames(items);

  if (!productosCarrito.length) {
    return {
      ok: true,
      carrito: [],
      recomendaciones: [],
      mensaje: "Agrega productos para obtener recomendaciones.",
      modelo_version: null,
    };
  }

  return httpJson(buildApiUrl("/api/ml/recomendacion"), {
    method: "POST",
    body: JSON.stringify({
      productos_carrito: productosCarrito,
      maximo,
    }),
    signal,
    skipUnauthorizedRedirect: true,
  });
}
