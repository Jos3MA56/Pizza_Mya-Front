import { useCallback, useEffect, useMemo, useState } from "react";
import validator from "validator";
import { apiFetch } from "../../api/cliente.js";
import { mapUserToForm } from "../../utils/profile.utils.js";

const BASE_PREFERENCES = {
  emailNotifications: true,
  smsNotifications: false,
  promoOffers: true,
  dietaryNotes: "",
};

const EMPTY_ADDRESS = {
  alias: "",
  calle: "",
  numero: "",
  colonia: "",
  ciudad: "",
  estado: "",
  cp: "",
  referencias: "",
  predeterminada: false,
};

function sanitizePhone(value) {
  return String(value || "")
    .replace(/\D+/g, "")
    .slice(0, 10);
}

function isValidEmail(value) {
  return validator.isEmail(String(value ?? "").trim(), {
    allow_display_name: false,
    require_display_name: false,
    allow_utf8_local_part: true,
    require_tld: true,
  });
}

function calcProfileCompletion(form = {}) {
  const fields = [
    form.nombre,
    form.apellido_paterno,
    form.email,
    form.telefono,
    form.fecha_nacimiento,
  ];
  const complete = fields.filter((value) => String(value || "").trim()).length;
  return Math.round((complete / fields.length) * 100);
}

function getPasswordStrength(value) {
  const password = String(value || "");
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-ZÁÉÍÓÚÑ]/.test(password)) score += 1;
  if (/[a-záéíóúñ]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) return { label: "Baja", color: "#dc2626", percent: 33 };
  if (score <= 4) return { label: "Media", color: "#d97706", percent: 66 };
  return { label: "Alta", color: "#16a34a", percent: 100 };
}

function normalizeOrders(rawOrders = []) {
  return rawOrders.map((order) => ({
    id: order.id,
    folio: order.folio || `ORD-${String(order.id || "").slice(0, 8)}`,
    date: order.created_at || order.fecha || order.createdAt || null,
    total: parseFloat(order.total || 0),
    status: order.estatus || order.status || order.estado || "PENDIENTE",
    items: Array.isArray(order.items)
      ? order.items.length
      : Number(order.items_count || 0),
  }));
}

export function usePerfilPage(user, refreshUser, notify) {
  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(true);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState(mapUserToForm(user));

  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [preferences, setPreferences] = useState(BASE_PREFERENCES);

  const [passwordData, setPasswordData] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState(EMPTY_ADDRESS);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("TODOS");

  const safeNotify = useCallback(
    (message, type = "info") => {
      if (typeof notify === "function") {
        notify(message, type);
      }
    },
    [notify],
  );

  const userId = user?.id || null;

  const initialProfileForm = useMemo(() => mapUserToForm(user), [user]);

  useEffect(() => {
    setProfileForm(initialProfileForm);
  }, [initialProfileForm]);

  const load = useCallback(async () => {
    if (!userId) {
      setOrders([]);
      setAddresses([]);
      setPreferences(BASE_PREFERENCES);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [ordersRes, addressesRes, preferencesRes] = await Promise.all([
        apiFetch("/api/usuarios/pedidos", { auth: true }),
        apiFetch("/api/usuarios/direcciones", { auth: true }),
        apiFetch("/api/usuarios/preferencias", { auth: true }),
      ]);

      setOrders(normalizeOrders(Array.isArray(ordersRes) ? ordersRes : []));
      setAddresses(Array.isArray(addressesRes) ? addressesRes : []);
      setPreferences({
        ...BASE_PREFERENCES,
        ...((preferencesRes && typeof preferencesRes === "object"
          ? preferencesRes
          : {}) || {}),
      });
    } catch (err) {
      safeNotify(err?.message || "No se pudo cargar tu perfil.", "error");
    } finally {
      setLoading(false);
    }
  }, [safeNotify, userId]);

  useEffect(() => {
    load();
  }, [load]);

  const saveProfile = useCallback(async () => {
    const telefono = sanitizePhone(profileForm.telefono);

    if (!String(profileForm.nombre || "").trim()) {
      safeNotify("Escribe tu nombre.", "error");
      return;
    }

    if (!isValidEmail(profileForm.email)) {
      safeNotify("Ingresa un correo válido.", "error");
      return;
    }

    if (telefono.length < 10) {
      safeNotify("Ingresa un teléfono de 10 dígitos.", "error");
      return;
    }

    try {
      setSavingProfile(true);

      await apiFetch("/api/usuarios/perfil", {
        method: "PUT",
        auth: true,
        body: {
          nombres: profileForm.nombre,
          paterno: profileForm.apellido_paterno,
          materno: profileForm.apellido_materno,
          email: profileForm.email,
          telefono,
          nacimiento: profileForm.fecha_nacimiento || null,
        },
      });

      await refreshUser?.();
      setIsEditing(false);
      safeNotify("Perfil actualizado correctamente.", "success");
    } catch (err) {
      safeNotify(err?.message || "No se pudo actualizar el perfil.", "error");
    } finally {
      setSavingProfile(false);
    }
  }, [profileForm, refreshUser, safeNotify]);

  const saveAddress = useCallback(async () => {
    const requiredFields = [
      ["alias", "Agrega un alias para la dirección."],
      ["calle", "Escribe la calle."],
      ["numero", "Escribe el número."],
      ["colonia", "Escribe la colonia."],
      ["ciudad", "Escribe la ciudad."],
      ["estado", "Escribe el estado."],
      ["cp", "Escribe el código postal."],
    ];

    const missing = requiredFields.find(
      ([key]) => !String(newAddress[key] || "").trim(),
    );
    if (missing) {
      safeNotify(missing[1], "error");
      return;
    }

    if (!/^\d{5}$/.test(String(newAddress.cp || "").trim())) {
      safeNotify("El código postal debe tener 5 dígitos.", "error");
      return;
    }

    try {
      setSavingAddress(true);

      const created = await apiFetch("/api/usuarios/direcciones", {
        method: "POST",
        auth: true,
        body: newAddress,
      });

      setAddresses((prev) => [created, ...prev]);
      setNewAddress(EMPTY_ADDRESS);
      setShowAddressForm(false);
      safeNotify("Dirección agregada correctamente.", "success");
    } catch (err) {
      safeNotify(err?.message || "No se pudo guardar la dirección.", "error");
    } finally {
      setSavingAddress(false);
    }
  }, [newAddress, safeNotify]);

  const deleteAddress = useCallback(
    async (id) => {
      try {
        await apiFetch(`/api/usuarios/direcciones/${id}`, {
          method: "DELETE",
          auth: true,
        });

        setAddresses((prev) => prev.filter((item) => item.id !== id));
        safeNotify("Dirección eliminada.", "success");
      } catch (err) {
        safeNotify(
          err?.message || "No se pudo eliminar la dirección.",
          "error",
        );
      }
    },
    [safeNotify],
  );

  const savePreferences = useCallback(async () => {
    try {
      await apiFetch("/api/usuarios/preferencias", {
        method: "PUT",
        auth: true,
        body: preferences,
      });

      safeNotify("Preferencias guardadas.", "success");
    } catch (err) {
      safeNotify(
        err?.message || "No se pudieron guardar las preferencias.",
        "error",
      );
    }
  }, [preferences, safeNotify]);

  const changePassword = useCallback(async () => {
    if (
      !passwordData.current ||
      !passwordData.newPassword ||
      !passwordData.confirm
    ) {
      safeNotify("Completa todos los campos de contraseña.", "error");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirm) {
      safeNotify(
        "La nueva contraseña y la confirmación no coinciden.",
        "error",
      );
      return;
    }

    if (String(passwordData.newPassword || "").length < 8) {
      safeNotify(
        "La nueva contraseña debe tener al menos 8 caracteres.",
        "error",
      );
      return;
    }

    try {
      setSavingPassword(true);

      await apiFetch("/api/usuarios/perfil/password", {
        method: "PUT",
        auth: true,
        body: {
          current: passwordData.current,
          newPassword: passwordData.newPassword,
        },
      });

      setPasswordData({ current: "", newPassword: "", confirm: "" });
      safeNotify("Contraseña actualizada correctamente.", "success");
    } catch (err) {
      safeNotify(err?.message || "No se pudo cambiar la contraseña.", "error");
    } finally {
      setSavingPassword(false);
    }
  }, [passwordData, safeNotify]);

  const filteredOrders = useMemo(() => {
    const query = String(orderSearch || "")
      .trim()
      .toLowerCase();
    return orders.filter((order) => {
      const matchesStatus =
        orderStatusFilter === "TODOS" ||
        String(order.status || "").toUpperCase() === orderStatusFilter;
      const matchesQuery =
        !query ||
        String(order.folio || "")
          .toLowerCase()
          .includes(query) ||
        String(order.status || "")
          .toLowerCase()
          .includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  const profileCompletion = useMemo(
    () => calcProfileCompletion(profileForm),
    [profileForm],
  );

  const passwordStrength = useMemo(
    () => getPasswordStrength(passwordData.newPassword),
    [passwordData.newPassword],
  );

  return {
    activeTab,
    setActiveTab,
    loading,

    isEditing,
    setIsEditing,
    profileForm,
    setProfileForm,

    orders,
    filteredOrders,
    orderSearch,
    setOrderSearch,
    orderStatusFilter,
    setOrderStatusFilter,
    addresses,

    preferences,
    setPreferences,

    passwordData,
    setPasswordData,

    saveProfile,
    savingProfile,
    profileCompletion,

    showAddressForm,
    setShowAddressForm,
    newAddress,
    setNewAddress,
    saveAddress,
    savingAddress,
    deleteAddress,

    changePassword,
    savingPassword,
    passwordStrength,

    savePreferences,
  };
}
