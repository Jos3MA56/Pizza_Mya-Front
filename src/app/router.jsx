import { Suspense, lazy } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import RouteFallback from "../components/ui/RouteFallback.jsx";
import ErrorScreen from "../components/ErrorScreen.jsx";
import ProtectedRoute from "../components/admin/ProtectedRoute.jsx";

const SiteLayout = lazy(() => import("../components/layout/SiteLayout.jsx"));
const AdminLayout = lazy(() => import("../components/layout/AdminLayout.jsx"));
const CajeroLayout = lazy(
  () => import("../components/layout/CajeroLayout.jsx"),
);

const HomePage = lazy(() => import("../pages/public/HomePage.jsx"));
const CatalogoPage = lazy(() => import("../pages/public/CatalogoPage.jsx"));
const CombosPage = lazy(() => import("../pages/public/CombosPage.jsx"));
const CombosDetallePage = lazy(
  () => import("../pages/public/ComboDetallePage.jsx"),
);
const ProductoDetallePage = lazy(
  () => import("../pages/public/ProductoDetallePage.jsx"),
);
const CarritoPage = lazy(() => import("../pages/client/CarritoPage.jsx"));
const TerminosPage = lazy(() => import("../pages/public/TerminosPage.jsx"));
const AvisoPrivacidadPage = lazy(
  () => import("../pages/public/AvisoPrivacidadPage.jsx"),
);
const PoliticaPedidosPage = lazy(
  () => import("../pages/public/PoliticaPedidosPage.jsx"),
);
const CancelacionesPage = lazy(
  () => import("../pages/public/CancelacionesPage.jsx"),
);
const CookiesPage = lazy(() => import("../pages/public/CookiesPage.jsx"));
const PersonalizarPage = lazy(
  () => import("../pages/public/PersonalizarPage.jsx"),
);
const MiPedido = lazy(() => import("../pages/public/MiPedido.jsx"));
const EntregaPage = lazy(() => import("../pages/entrega/EntregaPage.jsx"));
const TipoEntregaPage = lazy(
  () => import("../pages/tipoEntrega/TipoEntregaPage.jsx"),
);
const GaleriaPage = lazy(() => import("../pages/public/GaleriaPage.jsx"));
const NosotrosPage = lazy(() => import("../pages/public/NosotrosPage.jsx"));

const LoginPage = lazy(() => import("../pages/auth/LoginPage.jsx"));
const RegistroPage = lazy(() => import("../pages/auth/RegistroPage.jsx"));
const LoginTelefonoPage = lazy(
  () => import("../pages/auth/LoginTelefonoPage.jsx"),
);
const ForgotPasswordPage = lazy(
  () => import("../pages/auth/CorreoContrasenaPage.jsx"),
);
const ResetPasswordPage = lazy(
  () => import("../pages/auth/RestablecerContrasenaPage.jsx"),
);
const VerificarTelefonoPage = lazy(
  () => import("../pages/auth/VerificacionTelefonoPage.jsx"),
);

const PerfilPage = lazy(() => import("../pages/client/PerfilPage.jsx"));
const ConfirmacionPage = lazy(
  () => import("../pages/client/ConfirmacionPage.jsx"),
);
const OrderDetailPage = lazy(
  () => import("../pages/client/OrdenDetallePage.jsx"),
);

const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard.jsx"));
const AdminProductos = lazy(() => import("../pages/admin/AdminProductos.jsx"));
const AdminCombos = lazy(() => import("../pages/admin/AdminCombos.jsx"));
const AdminPedidos = lazy(() => import("../pages/admin/AdminPedidos.jsx"));
const AdminClientes = lazy(() => import("../pages/admin/AdminClientes.jsx"));
const AdminReportes = lazy(() => import("../pages/admin/AdminReportes.jsx"));
const AdminCatalogos = lazy(() => import("../pages/admin/AdminCatalogos.jsx"));
const AdminConfiguracion = lazy(
  () => import("../pages/admin/AdminConfiguracion.jsx"),
);
const AdminLegal = lazy(() => import("../pages/admin/AdminLegal.jsx"));
const AdminGaleria = lazy(() => import("../pages/admin/AdminGaleria.jsx"));
const AdminNosotros = lazy(() => import("../pages/admin/AdminNosotros.jsx"));
const AdminMonitoreo = lazy(() => import("../pages/admin/AdminMonitoreo.jsx"));
const AdminPrediccionInsumos = lazy(
  () => import("../pages/admin/AdminPrediccionInsumos.jsx"),
);
const AdminTransacciones = lazy(
  () => import("../pages/admin/AdminTransacciones.jsx"),
);

const CajeroDashboard = lazy(
  () => import("../pages/cajero/CajeroDashboardPage.jsx"),
);
const CajeroPOS = lazy(() => import("../pages/cajero/CajeroPOS.jsx"));
const CajeroPedidos = lazy(() => import("../pages/cajero/CajeroPedidos.jsx"));
const CajeroCorte = lazy(() => import("../pages/cajero/CajeroCorte.jsx"));
const CajeroRespaldos = lazy(
  () => import("../pages/cajero/CajeroRespaldos.jsx"),
);
const CajeroExportacion = lazy(
  () => import("../pages/cajero/CajeroExportacion.jsx"),
);

function AuthLoadingScreen() {
  return <RouteFallback text="Cargando tu sesión..." fullScreen />;
}

function NotFoundRoute() {
  return (
    <ErrorScreen
      code={404}
      icon="🔥"
      title="Página no encontrada"
      message="Lo sentimos, la página que buscas no existe o fue movida. Verifica la URL o regresa al inicio."
    />
  );
}

function ClientProtectedRoute() {
  const { token, booting } = useAuth();

  if (booting) return <AuthLoadingScreen />;
  if (!token) return <Navigate to="/login" replace />;

  return <Outlet />;
}

function PublicOnlyRoute() {
  const { isLogged, booting, getRedirectPath } = useAuth();

  if (booting) return <AuthLoadingScreen />;
  if (isLogged) return <Navigate to={getRedirectPath()} replace />;

  return <Outlet />;
}

export function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback text="Cargando vista..." fullScreen />}>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalogo" element={<CatalogoPage />} />
          <Route path="/combos" element={<CombosPage />} />
          <Route path="/combos/:id" element={<CombosDetallePage />} />
          <Route path="/producto/:id" element={<ProductoDetallePage />} />
          <Route path="/personalizar/:id" element={<PersonalizarPage />} />
          <Route path="/terminos" element={<TerminosPage />} />
          <Route path="/terminos-y-condiciones" element={<TerminosPage />} />
          <Route path="/aviso-privacidad" element={<AvisoPrivacidadPage />} />
          <Route
            path="/politica-privacidad"
            element={<AvisoPrivacidadPage />}
          />
          <Route path="/politica-pedidos" element={<PoliticaPedidosPage />} />
          <Route path="/cancelaciones" element={<CancelacionesPage />} />
          <Route
            path="/politica-cancelaciones"
            element={<CancelacionesPage />}
          />
          <Route path="/cookies" element={<CookiesPage />} />
          <Route path="/mi-pedido" element={<MiPedido />} />
          <Route path="/carrito" element={<CarritoPage />} />
          <Route path="/tipo-entrega" element={<TipoEntregaPage />} />
          <Route path="/entrega" element={<EntregaPage />} />
          <Route path="/galeria" element={<GaleriaPage />} />
          <Route path="/nosotros" element={<NosotrosPage />} />

          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegistroPage />} />
            <Route path="/recuperar-cuenta" element={<ForgotPasswordPage />} />
            <Route
              path="/restablecer-contrasena"
              element={<ResetPasswordPage />}
            />
            <Route path="/login-telefono" element={<LoginTelefonoPage />} />
            <Route
              path="/verificar-telefono"
              element={<VerificarTelefonoPage />}
            />
          </Route>

          <Route element={<ClientProtectedRoute />}>
            <Route path="/perfil" element={<PerfilPage />} />
            <Route path="/confirmacion" element={<ConfirmacionPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
          </Route>

          <Route path="*" element={<NotFoundRoute />} />
        </Route>

        <Route
          path="/admin"
          element={<ProtectedRoute allowedRoles={["admin"]} />}
        >
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="productos" element={<AdminProductos />} />
            <Route path="combos" element={<AdminCombos />} />
            <Route path="orders" element={<AdminPedidos />} />
            <Route path="transacciones" element={<AdminTransacciones />} />
            <Route path="clientes" element={<AdminClientes />} />
            <Route path="reportes" element={<AdminReportes />} />
            <Route path="monitoreo" element={<AdminMonitoreo />} />
            <Route
              path="prediccion-insumos"
              element={<AdminPrediccionInsumos />}
            />
            <Route path="catalogos" element={<AdminCatalogos />} />
            <Route path="galeria" element={<AdminGaleria />} />
            <Route path="nosotros" element={<AdminNosotros />} />
            <Route path="legal" element={<AdminLegal />} />
            <Route path="config" element={<AdminConfiguracion />} />
            <Route path="*" element={<NotFoundRoute />} />
          </Route>
        </Route>

        <Route
          path="/cajero"
          element={<ProtectedRoute allowedRoles={["admin", "cajero"]} />}
        >
          <Route element={<CajeroLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<CajeroDashboard />} />
            <Route path="pos" element={<CajeroPOS />} />
            <Route path="pedidos" element={<CajeroPedidos />} />
            <Route path="corte" element={<CajeroCorte />} />
            <Route path="respaldos" element={<CajeroRespaldos />} />
            <Route path="exportacion" element={<CajeroExportacion />} />
            <Route path="*" element={<NotFoundRoute />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
