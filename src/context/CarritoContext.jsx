import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { createClientId } from "../utils/id.js";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);

function getStorageKeys(isLogged, userId) {
  if (isLogged && userId) {
    return {
      cart: `pmya_cart_user_${userId}`,
      delivery: `pmya_delivery_user_${userId}`,
      orders: `pmya_orders_user_${userId}`,
      storage: localStorage,
    };
  }

  return {
    cart: "pmya_cart_guest",
    delivery: "pmya_delivery_guest",
    orders: "pmya_orders_guest",
    storage: sessionStorage,
  };
}

function safeParse(json, fallback) {
  try {
    return JSON.parse(json) ?? fallback;
  } catch {
    return fallback;
  }
}

function normalizeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function createLineId() {
  return createClientId("line");
}

function normalizeExtras(extras) {
  return normalizeArray(extras)
    .map((x) => ({
      extra_id: x?.extra_id ?? x?.id ?? null,
      nombre_snapshot: x?.nombre_snapshot ?? x?.nombre ?? "",
      costo_snapshot: normalizeNumber(x?.costo_snapshot ?? x?.costo, 0),
      cantidad: Math.max(1, normalizeNumber(x?.cantidad, 1)),
    }))
    .filter((x) => x.extra_id != null)
    .sort((a, b) => String(a.extra_id).localeCompare(String(b.extra_id)));
}

function normalizeSin(sin) {
  return normalizeArray(sin)
    .map((x) => {
      if (typeof x === "string") return { ingrediente_id: x, nombre: "" };
      return {
        ingrediente_id: x?.ingrediente_id ?? x?.id ?? null,
        nombre: x?.nombre ?? x?.nombre_snapshot ?? "",
      };
    })
    .filter((x) => x.ingrediente_id || x.nombre)
    .sort((a, b) =>
      String(a.ingrediente_id || a.nombre).localeCompare(
        String(b.ingrediente_id || b.nombre),
      ),
    );
}

function normalizeComboItems(comboItems) {
  return normalizeArray(comboItems)
    .map((x) => ({
      id:
        x?.id ?? `${x?.producto_id ?? "prod"}-${x?.producto_nombre ?? "item"}`,
      producto_id: x?.producto_id ?? null,
      cantidad: Math.max(1, normalizeNumber(x?.cantidad, 1)),
      producto_nombre: String(x?.producto_nombre ?? x?.nombre ?? "Producto"),
      producto_tamanio: x?.producto_tamanio ?? null,
      producto_precio_base: normalizeNumber(x?.producto_precio_base, 0),
      producto_imagen_url: x?.producto_imagen_url ?? x?.imagen_url ?? null,
      producto_tamanio_id: x?.producto_tamanio_id ?? null,
    }))
    .filter((x) => x.producto_id != null);
}

function buildCartSignature(item) {
  if (item?.tipo === "combo" || item?.combo_id) {
    return JSON.stringify({
      tipo: "combo",
      combo_id: item.combo_id ?? null,
    });
  }

  return JSON.stringify({
    tipo: "producto",
    productoId: item.productoId ?? null,
    producto_tamanio_id: item.producto_tamanio_id ?? null,
    precioUnitario: normalizeNumber(item.precioUnitario, 0),
    masa_id: item.masa_id ?? null,
    salsa_id: item.salsa_id ?? null,
    orilla_id: item.orilla_id ?? null,
    sin: normalizeSin(item.sin),
    extras: normalizeExtras(item.extras).map((e) => ({
      extra_id: e.extra_id,
      cantidad: e.cantidad,
    })),
  });
}

function normalizeCartItem(raw) {
  const isCombo = raw?.tipo === "combo" || !!raw?.combo_id;

  const normalized = {
    id: raw?.id || createLineId(),
    tipo: isCombo ? "combo" : "producto",
    combo_id: isCombo ? (raw?.combo_id ?? null) : null,
    combo_items: isCombo ? normalizeComboItems(raw?.combo_items) : [],
    productoId: isCombo
      ? null
      : (raw?.productoId ?? raw?.producto_id ?? raw?.id ?? null),
    producto_tamanio_id: isCombo
      ? null
      : (raw?.producto_tamanio_id ?? raw?.productoTamanioId ?? null),
    tamanio_id: isCombo ? null : (raw?.tamanio_id ?? raw?.tamanioId ?? null),
    nombre: String(raw?.nombre ?? "Producto"),
    precioUnitario: normalizeNumber(
      raw?.precioUnitario ?? raw?.precio_unitario ?? raw?.precio_base,
      0,
    ),
    imagen_url: raw?.imagen_url ?? null,
    cantidad: Math.max(1, normalizeNumber(raw?.cantidad, 1)),
    tamano: raw?.tamano ?? raw?.tamanio ?? raw?.tamanio_nombre ?? null,
    orilla_id: raw?.orilla_id ?? raw?.orillaId ?? raw?.orilla ?? null,
    orilla_nombre: raw?.orilla_nombre ?? null,
    masa_id: raw?.masa_id ?? raw?.masaId ?? null,
    masa_nombre: raw?.masa_nombre ?? null,
    salsa_id: raw?.salsa_id ?? raw?.salsaId ?? null,
    salsa_nombre: raw?.salsa_nombre ?? null,
    sin: normalizeSin(raw?.sin),
    extras: normalizeExtras(raw?.extras),
    ingredientes_txt: raw?.ingredientes_txt ?? null,
  };

  normalized.signature = buildCartSignature(normalized);
  return normalized;
}

function normalizeStoredCart(items) {
  return normalizeArray(items).map((item) => normalizeCartItem(item));
}

function getInitialCart(isLogged, userId) {
  const keys = getStorageKeys(isLogged, userId);
  return normalizeStoredCart(safeParse(keys.storage.getItem(keys.cart), []));
}

function getInitialDelivery(isLogged, userId) {
  const keys = getStorageKeys(isLogged, userId);
  return safeParse(keys.storage.getItem(keys.delivery), null);
}

function getInitialOrders(isLogged, userId) {
  const keys = getStorageKeys(isLogged, userId);
  return safeParse(keys.storage.getItem(keys.orders), []);
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_ITEMS":
      return { ...state, items: normalizeStoredCart(action.items) };

    case "ADD_ITEM": {
      const newItem = normalizeCartItem(action.item);
      const existsIndex = state.items.findIndex(
        (i) => i.signature === newItem.signature,
      );

      if (existsIndex >= 0) {
        return {
          ...state,
          items: state.items.map((i, index) =>
            index === existsIndex
              ? { ...i, cantidad: i.cantidad + (newItem.cantidad || 1) }
              : i,
          ),
        };
      }

      return { ...state, items: [...state.items, newItem] };
    }

    case "UPDATE_QTY": {
      const cantidad = Math.max(0, normalizeNumber(action.cantidad, 1));
      if (cantidad <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.id !== action.id),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, cantidad } : i,
        ),
      };
    }

    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };

    case "CLEAR_CART":
      return { ...state, items: [] };

    case "SET_DELIVERY":
      return { ...state, deliveryMethod: action.method };

    case "CLEAR_DELIVERY":
      return { ...state, deliveryMethod: null };

    case "ADD_ORDER":
      return { ...state, orders: [...(state.orders || []), action.order] };

    case "CLEAR_ORDERS":
      return { ...state, orders: [] };

    case "RESET":
      return { items: [], deliveryMethod: null, orders: [] };

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const { isLogged, user } = useAuth();
  const userId = user?.id;

  const [state, dispatch] = useReducer(reducer, null, () => ({
    items: getInitialCart(isLogged, userId),
    deliveryMethod: getInitialDelivery(isLogged, userId),
    orders: getInitialOrders(isLogged, userId),
  }));

  useEffect(() => {
    const keys = getStorageKeys(isLogged, userId);
    keys.storage.setItem(keys.cart, JSON.stringify(state.items));
  }, [state.items, isLogged, userId]);

  useEffect(() => {
    const keys = getStorageKeys(isLogged, userId);
    if (state.deliveryMethod)
      keys.storage.setItem(keys.delivery, JSON.stringify(state.deliveryMethod));
    else keys.storage.removeItem(keys.delivery);
  }, [state.deliveryMethod, isLogged, userId]);

  useEffect(() => {
    const keys = getStorageKeys(isLogged, userId);
    keys.storage.setItem(keys.orders, JSON.stringify(state.orders || []));
  }, [state.orders, isLogged, userId]);

  useEffect(() => {
    const handleClearCart = () => {
      dispatch({ type: "CLEAR_CART" });
      dispatch({ type: "CLEAR_DELIVERY" });
      dispatch({ type: "CLEAR_ORDERS" });

      ["pmya_cart_guest", "pmya_delivery_guest", "pmya_orders_guest"].forEach(
        (key) => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        },
      );

      if (user?.id) {
        [
          `pmya_cart_user_${user.id}`,
          `pmya_delivery_user_${user.id}`,
          `pmya_orders_user_${user.id}`,
        ].forEach((key) => {
          localStorage.removeItem(key);
        });
      }
    };

    window.addEventListener("pmya_clear_cart", handleClearCart);
    return () => window.removeEventListener("pmya_clear_cart", handleClearCart);
  }, [user]);

  const addItem = useCallback(
    (item) => dispatch({ type: "ADD_ITEM", item }),
    [],
  );
  const updateQty = useCallback(
    (id, cantidad) => dispatch({ type: "UPDATE_QTY", id, cantidad }),
    [],
  );

  const incQty = useCallback(
    (id) => {
      const item = state.items.find((i) => i.id === id);
      if (item)
        dispatch({ type: "UPDATE_QTY", id, cantidad: item.cantidad + 1 });
    },
    [state.items],
  );

  const decQty = useCallback(
    (id) => {
      const item = state.items.find((i) => i.id === id);
      if (!item) return;
      dispatch({ type: "UPDATE_QTY", id, cantidad: item.cantidad - 1 });
    },
    [state.items],
  );

  const removeItem = useCallback(
    (id) => dispatch({ type: "REMOVE_ITEM", id }),
    [],
  );
  const clearCart = useCallback(() => dispatch({ type: "CLEAR_CART" }), []);
  const setDeliveryMethod = useCallback(
    (method) => dispatch({ type: "SET_DELIVERY", method }),
    [],
  );
  const clearDeliveryMethod = useCallback(
    () => dispatch({ type: "CLEAR_DELIVERY" }),
    [],
  );
  const addOrder = useCallback(
    (order) => dispatch({ type: "ADD_ORDER", order }),
    [],
  );
  const clearOrders = useCallback(() => dispatch({ type: "CLEAR_ORDERS" }), []);

  const totals = useMemo(() => {
    const subtotal = state.items.reduce(
      (sum, item) =>
        sum + Number(item.precioUnitario || 0) * Number(item.cantidad || 1),
      0,
    );
    return { subtotal, delivery: 0, total: subtotal };
  }, [state.items]);

  const value = useMemo(
    () => ({
      items: state.items,
      deliveryMethod: state.deliveryMethod,
      orders: state.orders,
      totals,
      addItem,
      updateQty,
      incQty,
      decQty,
      removeItem,
      clearCart,
      setDeliveryMethod,
      clearDeliveryMethod,
      addOrder,
      clearOrders,
    }),
    [
      state.items,
      state.deliveryMethod,
      state.orders,
      totals,
      addItem,
      updateQty,
      incQty,
      decQty,
      removeItem,
      clearCart,
      setDeliveryMethod,
      clearDeliveryMethod,
      addOrder,
      clearOrders,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
