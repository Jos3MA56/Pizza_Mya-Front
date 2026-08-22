import { apiFetch } from "./cliente.js";
import { buildApiUrl, httpJson } from "./http.js";

function moneyNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeVariant(item = {}) {
  return {
    id: item.id || item.producto_tamanio_id || "",
    producto_tamanio_id: item.producto_tamanio_id || item.id || "",
    tamanio_id: item.tamanio_id || "",
    tamanio: item.tamanio || item.nombre || "",
    precio_base: moneyNumber(item.precio_base ?? item.precio),
    imagen_url: item.imagen_url || "",
    activo: item.activo !== false,
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
}

function mapToFrontend(product = {}) {
  const tamanios = Array.isArray(product.tamanios)
    ? product.tamanios.map(normalizeVariant)
    : [];

  const firstActive =
    tamanios.find((item) => item.activo !== false) || tamanios[0] || null;

  return {
    id: product.id,
    nombre: product.nombre || "",
    descripcion: product.descripcion || "",
    categoria_id: product.categoria_id || product.categoria?.id || "",
    categoria: product.categoria?.nombre || product.categoria_nombre || "",
    imagen_url: product.imagen_url || "",
    disponible: product.disponible !== false,
    activo: product.activo !== false,
    created_at: product.created_at,
    updated_at: product.updated_at,
    tamanios,
    precio: moneyNumber(product.precio_base ?? firstActive?.precio_base),
    precio_base: moneyNumber(product.precio_base ?? firstActive?.precio_base),
    tamanio_id: product.tamanio_id || firstActive?.tamanio_id || "",
    tamanio: product.tamanio || firstActive?.tamanio || "",
    producto_tamanio_id: product.producto_tamanio_id || firstActive?.id || "",
  };
}

function mapToBackend(productData = {}) {
  const tamanios = Array.isArray(productData.tamanios)
    ? productData.tamanios
    : Array.isArray(productData.presentaciones)
      ? productData.presentaciones
      : [];

  const mappedTamanios = tamanios.length
    ? tamanios.map((item) => ({
        id: item.id || item.producto_tamanio_id || null,
        producto_tamanio_id: item.producto_tamanio_id || item.id || null,
        tamanio_id: item.tamanio_id || null,
        tamanio: item.tamanio || null,
        precio_base: moneyNumber(item.precio_base ?? item.precio),
        imagen_url: item.imagen_url || null,
        activo: item.activo !== false,
      }))
    : productData.tamanio_id ||
        productData.tamanio ||
        productData.precio ||
        productData.precio_base
      ? [
          {
            id: productData.producto_tamanio_id || null,
            producto_tamanio_id: productData.producto_tamanio_id || null,
            tamanio_id: productData.tamanio_id || null,
            tamanio: productData.tamanio || null,
            precio_base: moneyNumber(
              productData.precio_base ?? productData.precio,
            ),
            imagen_url: productData.imagen_url || null,
            activo: productData.activo_variante !== false,
          },
        ]
      : [];

  return {
    nombre: productData.nombre?.trim() || "",
    descripcion: productData.descripcion?.trim() || null,
    categoria_id: productData.categoria_id || null,
    imagen_url: productData.imagen_url || null,
    disponible: productData.disponible !== false,
    activo: productData.activo !== false,
    solo_variante: productData.solo_variante === true,
    activo_variante: productData.activo_variante,
    tamanio_id: productData.tamanio_id || null,
    tamanios: mappedTamanios,
  };
}

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function uploadWithToken(path, token, formData, method = "PATCH") {
  return httpJson(buildApiUrl(path), {
    method,
    headers: authHeaders(token),
    body: formData,
  });
}

export const adminProductosApi = {
  async list(token, params = {}) {
    const search = new URLSearchParams();
    if (params.q) search.set("q", params.q);
    if (params.categoria_id && params.categoria_id !== "all")
      search.set("categoria_id", params.categoria_id);
    if (params.estado && params.estado !== "all")
      search.set("estado", params.estado);

    const query = search.toString() ? `?${search.toString()}` : "";
    const data = await apiFetch(`/api/admin/products${query}`, {
      auth: false,
      headers: authHeaders(token),
    });

    return Array.isArray(data) ? data.map(mapToFrontend) : [];
  },

  async get(token, id) {
    const data = await apiFetch(`/api/admin/products/${id}`, {
      auth: false,
      headers: authHeaders(token),
    });
    return mapToFrontend(data);
  },

  async create(token, productData) {
    const data = await apiFetch("/api/admin/products", {
      method: "POST",
      auth: false,
      headers: authHeaders(token),
      body: mapToBackend(productData),
    });
    return mapToFrontend(data);
  },

  async update(token, id, productData) {
    const data = await apiFetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      auth: false,
      headers: authHeaders(token),
      body: mapToBackend(productData),
    });
    return mapToFrontend(data);
  },

  async remove(token, id) {
    return apiFetch(`/api/admin/products/${id}`, {
      method: "DELETE",
      auth: false,
      headers: authHeaders(token),
    });
  },

  async setAvailability(token, id, disponible) {
    return apiFetch(`/api/admin/products/${id}/availability`, {
      method: "PATCH",
      auth: false,
      headers: authHeaders(token),
      body: { disponible },
    });
  },

  async setVariantActive(token, productId, variantId, activo) {
    return apiFetch(
      `/api/admin/products/${productId}/tamanios/${variantId}/active`,
      {
        method: "PATCH",
        auth: false,
        headers: authHeaders(token),
        body: { activo },
      },
    );
  },

  async uploadImage(token, id, file) {
    const formData = new FormData();
    formData.append("imagen", file);
    return uploadWithToken(
      `/api/admin/products/${id}/image`,
      token,
      formData,
      "PATCH",
    );
  },
};

export const adminCategoriasApi = {
  async list(token) {
    const data = await apiFetch("/api/admin/categories", {
      auth: false,
      headers: authHeaders(token),
    });
    return Array.isArray(data) ? data : [];
  },
};

export const adminTamaniosApi = {
  async list(token) {
    const data = await apiFetch("/api/admin/tamanios", {
      auth: false,
      headers: authHeaders(token),
    });
    return Array.isArray(data) ? data : [];
  },
};
