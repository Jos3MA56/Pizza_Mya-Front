import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import RouteFallback from "../ui/RouteFallback.jsx";

function normalizeRole(raw) {
  return String(raw || "")
    .trim()
    .toLowerCase();
}

function BootingScreen() {
  return <RouteFallback text="Verificando sesión..." fullScreen />;
}

export default function ProtectedRoute({ allowedRoles = ["admin"] }) {
  const { token, booting, userRole, getRedirectPath } = useAuth();
  const location = useLocation();

  if (booting) return <BootingScreen />;

  if (!token) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  const normalizedAllowedRoles = Array.isArray(allowedRoles)
    ? allowedRoles.map(normalizeRole)
    : [normalizeRole(allowedRoles)];

  const currentRole = normalizeRole(userRole);

  if (
    normalizedAllowedRoles.length > 0 &&
    !normalizedAllowedRoles.includes(currentRole)
  ) {
    return (
      <Navigate
        to={getRedirectPath()}
        replace
        state={{ deniedFrom: location.pathname }}
      />
    );
  }

  return <Outlet />;
}
