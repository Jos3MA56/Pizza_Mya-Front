import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { adminCombosApi } from "../../api/adminCombos.api.js";
import { adminProductosApi } from "../../api/adminProductos.api.js";
import {
  buildComboStats,
  defaultComboForm,
  getComboOptionValue,
  normalizeComboDetail,
} from "../../utils/adminCombos.utils.js";

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

export function useAdminCombos({ token: tokenProp, toast } = {}) {
  const auth = useAuth();
  const token = tokenProp || auth?.token || "";

  const [allCombos, setAllCombos] = useState([]);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({ search: "", status: "all" });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [formValue, setFormValue] = useState(defaultComboForm());

  const [confirmDisable, setConfirmDisable] = useState(null);

  const loadCombos = useCallback(async () => {
    if (!token) {
      setAllCombos([]);
      setProducts([]);
      setError("No autenticado");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [combosBase, productsData] = await Promise.all([
        adminCombosApi.list(token),
        adminProductosApi.list(token),
      ]);

      const combosWithDetail = await Promise.all(
        (Array.isArray(combosBase) ? combosBase : []).map(async (combo) => {
          try {
            const detail = await adminCombosApi.detail(token, combo.id);
            return normalizeComboDetail(detail || combo);
          } catch {
            return normalizeComboDetail(combo);
          }
        }),
      );

      setAllCombos(combosWithDetail);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      setError(getErrorMessage(err, "No se pudieron cargar los combos"));
      setAllCombos([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadCombos();
  }, [loadCombos]);

  const reload = useCallback(() => {
    loadCombos();
  }, [loadCombos]);

  const combos = useMemo(() => {
    const q = String(filters.search || "")
      .trim()
      .toLowerCase();

    return allCombos.filter((combo) => {
      const bySearch =
        !q ||
        String(combo.nombre || "")
          .toLowerCase()
          .includes(q) ||
        String(combo.descripcion || "")
          .toLowerCase()
          .includes(q);

      const byStatus =
        filters.status === "all"
          ? true
          : filters.status === "active"
            ? Boolean(combo.activo)
            : !combo.activo;

      return bySearch && byStatus;
    });
  }, [allCombos, filters]);

  const stats = useMemo(() => buildComboStats(allCombos), [allCombos]);

  const openCreate = useCallback(() => {
    setFormMode("create");
    setSelected(null);
    setFormValue(defaultComboForm());
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((combo) => {
    setFormMode("edit");
    setSelected(combo);
    setFormValue(normalizeComboDetail(combo));
    setFormOpen(true);
  }, []);

  const openDetail = useCallback(
    async (combo) => {
      try {
        setError("");
        const detail = await adminCombosApi.detail(token, combo.id);
        const normalized = normalizeComboDetail(detail || combo);
        setSelected(normalized);
      } catch {
        setSelected(normalizeComboDetail(combo));
      } finally {
        setDetailOpen(true);
      }
    },
    [token],
  );

  const validateForm = useCallback(() => {
    const nombre = String(formValue.nombre || "").trim();
    const precio = Number(formValue.precio_combo || 0);
    const items = Array.isArray(formValue.items) ? formValue.items : [];
    const dias = Array.isArray(formValue.dias) ? formValue.dias : [];

    if (!nombre) throw new Error("Debes capturar el nombre del combo");
    if (precio <= 0 || precio >= 9999) {
      throw new Error("El precio del combo debe ser mayor a 0 y menor a 9999");
    }
    if (dias.length === 0)
      throw new Error("Selecciona al menos un día disponible");
    if (items.length === 0)
      throw new Error("Agrega al menos un producto al combo");

    const repeated = new Set();

    for (const item of items) {
      if (!String(item.producto_id || "").trim()) {
        throw new Error(
          "Todos los productos del combo deben estar seleccionados",
        );
      }
      if (Number(item.cantidad || 0) <= 0) {
        throw new Error("La cantidad de cada producto debe ser mayor a 0");
      }

      const key = getComboOptionValue(item);
      if (repeated.has(key)) {
        throw new Error(
          "No repitas el mismo producto/presentación dentro del combo",
        );
      }
      repeated.add(key);
    }
  }, [formValue]);

  const saveCombo = useCallback(async () => {
    try {
      validateForm();
      setSaving(true);
      setError("");

      let saved;

      if (formMode === "create") {
        saved = await adminCombosApi.createFull(token, formValue);
      } else {
        const comboId = selected?.id;
        if (!comboId) throw new Error("No se encontró el combo a editar");
        saved = await adminCombosApi.updateFull(token, comboId, formValue);
      }

      const normalized = normalizeComboDetail(saved);
      setFormOpen(false);
      setSelected(normalized);
      await loadCombos();

      toast?.success?.(
        formMode === "create"
          ? "Combo creado correctamente"
          : "Combo actualizado correctamente",
      );
    } catch (err) {
      const message = getErrorMessage(err, "No se pudo guardar el combo");
      setError(message);
      toast?.error?.(message);
    } finally {
      setSaving(false);
    }
  }, [formMode, formValue, loadCombos, selected, toast, token, validateForm]);

  const disableCombo = useCallback(async () => {
    if (!confirmDisable?.id) return;

    try {
      setSaving(true);
      setError("");
      await adminCombosApi.disable(token, confirmDisable.id);
      await loadCombos();
      toast?.success?.("Combo desactivado correctamente");
      setConfirmDisable(null);
    } catch (err) {
      const message = getErrorMessage(err, "No se pudo desactivar el combo");
      setError(message);
      toast?.error?.(message);
    } finally {
      setSaving(false);
    }
  }, [confirmDisable, loadCombos, toast, token]);

  const activateCombo = useCallback(
    async (combo) => {
      if (!combo?.id) return;

      try {
        setSaving(true);
        setError("");
        await adminCombosApi.enable(token, combo.id);
        await loadCombos();
        toast?.success?.("Combo activado correctamente");
      } catch (err) {
        const message = getErrorMessage(err, "No se pudo activar el combo");
        setError(message);
        toast?.error?.(message);
      } finally {
        setSaving(false);
      }
    },
    [loadCombos, toast, token],
  );

  return {
    combos,
    stats,
    filters,
    setFilters,
    products,
    loading,
    saving,
    error,
    reload,
    selected,
    detailOpen,
    setDetailOpen,
    openDetail,
    formOpen,
    setFormOpen,
    formMode,
    formValue,
    setFormValue,
    openCreate,
    openEdit,
    saveCombo,
    confirmDisable,
    setConfirmDisable,
    disableCombo,
    activateCombo,
  };
}
