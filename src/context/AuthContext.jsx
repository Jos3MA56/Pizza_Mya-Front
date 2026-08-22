import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useReducer,
  useEffect,
  useRef,
  useState,
} from "react";
import { authApi } from "../api/auth.api.js";

const AuthContext = createContext(null);

const STORAGE_KEYS = {
  token: "pmya_token",
  user: "pmya_user",
};

function decodeJwtPayload(token) {
  try {
    const payload = String(token || "").split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = decodeJwtPayload(token);
  const exp = Number(payload?.exp || 0);
  if (!exp) return false;
  return exp * 1000 <= Date.now();
}

function safeParse(value, fallback = null) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function getStoredToken() {
  const token = localStorage.getItem(STORAGE_KEYS.token) || null;
  if (!token) return null;

  if (isTokenExpired(token)) {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
    return null;
  }

  return token;
}

function getStoredUser() {
  return safeParse(localStorage.getItem(STORAGE_KEYS.user), null);
}

function getInitialState() {
  return {
    token: getStoredToken(),
    user: getStoredUser(),
  };
}

function getInitialBooting() {
  return !!getStoredToken();
}

function reducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return {
        token: action.payload.token,
        user: action.payload.user,
      };

    case "LOGOUT":
      return {
        token: null,
        user: null,
      };

    case "SET_USER":
      return {
        ...state,
        user: action.payload,
      };

    default:
      return state;
  }
}

function cleanupAllData() {
  const prefixes = ["pmya_cart_", "pmya_delivery_", "pmya_orders_"];

  Object.keys(localStorage).forEach((key) => {
    if (prefixes.some((prefix) => key.startsWith(prefix))) {
      localStorage.removeItem(key);
    }
  });

  Object.keys(sessionStorage).forEach((key) => {
    if (prefixes.some((prefix) => key.startsWith(prefix))) {
      sessionStorage.removeItem(key);
    }
  });
}

function syncAuthStateFromStorage(dispatch) {
  const token = getStoredToken();
  const user = getStoredUser();

  if (token && user) {
    dispatch({
      type: "LOGIN",
      payload: { token, user },
    });
  } else {
    dispatch({ type: "LOGOUT" });
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);
  const [booting, setBooting] = useState(getInitialBooting);
  const hasBooted = useRef(false);

  const persistSession = useCallback((token, user) => {
    localStorage.setItem(STORAGE_KEYS.token, token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
  }, []);

  const emitSessionExpired = useCallback(() => {
    window.dispatchEvent(new CustomEvent("pmya_session_expired"));
  }, []);

  const emitAuthSyncEvents = useCallback(() => {
    window.dispatchEvent(new Event("pmya_auth_changed"));
    window.dispatchEvent(new CustomEvent("pmya_clear_cart"));
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();

    if (!token) {
      dispatch({ type: "LOGOUT" });
      return null;
    }

    try {
      const me = await authApi.me(token);
      const payload = me?.data || me;
      const userData = payload?.user || payload?.usuario || payload || null;

      if (!userData) {
        throw new Error("No se pudo obtener el usuario autenticado");
      }

      persistSession(token, userData);
      dispatch({ type: "SET_USER", payload: userData });

      return userData;
    } catch (error) {
      clearSession();
      cleanupAllData();
      dispatch({ type: "LOGOUT" });
      emitSessionExpired();
      emitAuthSyncEvents();
      return null;
    }
  }, [clearSession, emitAuthSyncEvents, emitSessionExpired, persistSession]);

  useEffect(() => {
    if (hasBooted.current) return;
    hasBooted.current = true;

    const token = getStoredToken();

    if (!token) {
      setBooting(false);
      return;
    }

    refreshUser().finally(() => {
      setBooting(false);
    });
  }, [refreshUser]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (
        event.key === STORAGE_KEYS.token ||
        event.key === STORAGE_KEYS.user ||
        event.key === null
      ) {
        syncAuthStateFromStorage(dispatch);
      }
    };

    const handleAuthChanged = () => {
      syncAuthStateFromStorage(dispatch);
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("pmya_auth_changed", handleAuthChanged);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("pmya_auth_changed", handleAuthChanged);
    };
  }, []);

  const login = useCallback(
    ({ token, user }) => {
      cleanupAllData();
      persistSession(token, user);

      dispatch({
        type: "LOGIN",
        payload: { token, user },
      });

      emitAuthSyncEvents();
    },
    [emitAuthSyncEvents, persistSession],
  );

  const verifyPhoneLogin = useCallback(
    async ({ phone, code }) => {
      const response = await authApi.verifyPhoneCode({ phone, code });

      const payload = response?.data || response;
      const token = payload?.token || null;
      const user = payload?.user || payload?.usuario || null;

      if (!token || !user) {
        throw new Error("Respuesta inválida del servidor");
      }

      cleanupAllData();
      persistSession(token, user);

      dispatch({
        type: "LOGIN",
        payload: { token, user },
      });

      emitAuthSyncEvents();

      const rawRole = user?.rol || user?.role || user?.tipo;
      const normalizedRole = String(rawRole || "")
        .trim()
        .toLowerCase();

      let redirectPath = "/";
      if (normalizedRole === "cajero") redirectPath = "/cajero/dashboard";
      if (normalizedRole === "admin") redirectPath = "/admin/dashboard";

      return { token, user, redirectPath };
    },
    [emitAuthSyncEvents, persistSession],
  );

  const logout = useCallback(() => {
    clearSession();
    cleanupAllData();
    dispatch({ type: "LOGOUT" });
    emitAuthSyncEvents();
  }, [clearSession, emitAuthSyncEvents]);

  const userRole = useMemo(() => {
    const rawRole = state.user?.rol || state.user?.role || state.user?.tipo;
    return String(rawRole || "")
      .trim()
      .toLowerCase();
  }, [state.user]);

  const isAdmin = userRole === "admin";
  const isCajero = userRole === "cajero";
  const isCliente = !userRole || userRole === "cliente";

  const getRedirectPath = useCallback(() => {
    if (isCajero) return "/cajero/dashboard";
    if (isAdmin) return "/admin/dashboard";
    return "/";
  }, [isAdmin, isCajero]);

  const value = useMemo(
    () => ({
      token: state.token,
      user: state.user,
      isLogged: !!state.token,
      booting,
      userRole,
      isAdmin,
      isCajero,
      isCliente,
      login,
      logout,
      refreshUser,
      verifyPhoneLogin,
      getRedirectPath,
    }),
    [
      state.token,
      state.user,
      booting,
      userRole,
      isAdmin,
      isCajero,
      isCliente,
      login,
      logout,
      refreshUser,
      verifyPhoneLogin,
      getRedirectPath,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }

  return context;
}
