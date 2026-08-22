import { useCallback, useEffect, useMemo, useState } from "react";
import {
  adminCategoriasApi,
  adminProductosApi,
  adminTamaniosApi,
} from "../../api/adminProductos.api.js";
import {
  buildProductStats,
  filterProducts,
  safeDateValue,
} from "../../utils/adminProductos.utils.js";

const INITIAL_MODAL = { open: false, mode: "create", product: null };

function normalizeArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.rows)) return value.rows;
  if (Array.isArray(value?.categorias)) return value.categorias;
  if (Array.isArray(value?.productos)) return value.productos;
  if (Array.isArray(value?.tamanios)) return value.tamanios;
  return [];
}

export function useAdminProductos(token, notify) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [tamaniosCatalogo, setTamaniosCatalogo] = useState([]);
  const [productos, setProductos] = useState([]);
  const [search, setSearch] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("all");
  const [estadoFiltro, setEstadoFiltro] = useState("all");
  const [modal, setModal] = useState(INITIAL_MODAL);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      const [catsData, itemsData, sizesData] = await Promise.all([
        adminCategoriasApi.list(token),
        adminProductosApi.list(token),
        adminTamaniosApi.list(token),
      ]);

      const cats = normalizeArray(catsData);
      const items = normalizeArray(itemsData);
      const sizes = normalizeArray(sizesData);

      setCategorias(cats);

      // Solo tamaños activos del catálogo.
      // Si Individual o Jumbo están desactivados en Catálogos,
      // ya no deben aparecer al crear/editar productos.
      setTamaniosCatalogo(
        sizes.filter((item) => item && item.activo !== false),
      );

      setProductos(
        [...items].sort(
          (a, b) =>
            safeDateValue(b.updated_at || b.created_at) -
            safeDateValue(a.updated_at || a.created_at),
        ),
      );
    } catch (err) {
      setError(err?.message || "No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () => filterProducts(productos, search, categoriaFiltro, estadoFiltro),
    [productos, search, categoriaFiltro, estadoFiltro],
  );

  const stats = useMemo(() => buildProductStats(productos), [productos]);

  const openCreate = useCallback(() => {
    setModal({ open: true, mode: "create", product: null });
  }, []);

  const openEdit = useCallback((product) => {
    setModal({ open: true, mode: "edit", product });
  }, []);

  const closeModal = useCallback(() => {
    setModal(INITIAL_MODAL);
  }, []);

  const submitProduct = useCallback(
    async (payload) => {
      try {
        setSaving(true);

        if (modal.mode === "edit" && modal.product?.id) {
          const updated = await adminProductosApi.update(
            token,
            modal.product.id,
            payload,
          );

          setProductos((prev) =>
            prev.map((item) => (item.id === updated.id ? updated : item)),
          );

          notify?.("Producto actualizado correctamente", "success");
        } else {
          const created = await adminProductosApi.create(token, payload);

          setProductos((prev) => [created, ...prev]);

          notify?.("Producto creado correctamente", "success");
        }

        closeModal();
        await load();
      } catch (err) {
        notify?.(err?.message || "No se pudo guardar el producto", "error");
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [closeModal, load, modal.mode, modal.product?.id, notify, token],
  );

  const removeProduct = useCallback(async () => {
    if (!deleteTarget?.id) return;

    try {
      setSaving(true);

      await adminProductosApi.remove(token, deleteTarget.id);

      setProductos((prev) =>
        prev.map((item) =>
          item.id === deleteTarget.id
            ? { ...item, activo: false, disponible: false }
            : item,
        ),
      );

      setDeleteTarget(null);
      notify?.("Producto desactivado correctamente", "success");

      await load();
    } catch (err) {
      notify?.(err?.message || "No se pudo desactivar el producto", "error");
    } finally {
      setSaving(false);
    }
  }, [deleteTarget, load, notify, token]);

  const toggleDisponibilidad = useCallback(
    async (product) => {
      if (!product?.id) return;

      const next = !(product.disponible !== false);

      try {
        setSaving(true);

        await adminProductosApi.setAvailability(token, product.id, next);

        setProductos((prev) =>
          prev.map((item) =>
            item.id === product.id ? { ...item, disponible: next } : item,
          ),
        );

        notify?.(
          next ? "Producto disponible" : "Producto no disponible",
          "success",
        );

        await load();
      } catch (err) {
        notify?.(
          err?.message || "No se pudo cambiar la disponibilidad",
          "error",
        );
      } finally {
        setSaving(false);
      }
    },
    [load, notify, token],
  );

  const toggleVariant = useCallback(
    async (productId, variant) => {
      if (!productId || !variant?.id) return;

      const next = variant.activo === false;

      try {
        setSaving(true);

        await adminProductosApi.setVariantActive(
          token,
          productId,
          variant.id,
          next,
        );

        await load();

        notify?.(
          next ? "Presentación activada" : "Presentación desactivada",
          "success",
        );
      } catch (err) {
        notify?.(err?.message || "No se pudo cambiar la presentación", "error");
      } finally {
        setSaving(false);
      }
    },
    [load, notify, token],
  );

  return {
    loading,
    saving,
    categorias,
    tamaniosCatalogo,
    productos: filtered,
    allProductos: productos,
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
    removeProduct,
    toggleDisponibilidad,
    toggleVariant,
    error,
    reload: load,
  };
}
