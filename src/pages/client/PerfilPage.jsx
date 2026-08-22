import { useEffect, useMemo } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Loader from "../../components/ui/Loader.jsx";
import { useToast } from "../../components/ui/ToastProvider.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { usePerfilPage } from "../../hooks/client/usePerfilPage.js";
import PerfilDashboard from "../../components/client/perfil/PerfilDashboard.jsx";

export default function PerfilPage() {
  const navigate = useNavigate();
  const { user, logout, refreshUser, booting } = useAuth();
  const { showToast } = useToast();

  const notify = useMemo(
    () =>
      (msg, type = "info") =>
        showToast?.(msg, type),
    [showToast],
  );

  const perfil = usePerfilPage(user, refreshUser, notify);

  useEffect(() => {
    document.title = "Mi perfil | Pizza Mya";
  }, []);

  if (booting) {
    return <Loader text="Cargando sesión..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (perfil.loading) {
    return <Loader text="Cargando perfil..." />;
  }

  return (
    <PerfilDashboard
      perfil={perfil}
      navigate={navigate}
      logout={logout}
      user={user}
    />
  );
}
