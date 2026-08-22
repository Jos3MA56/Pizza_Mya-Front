import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import CarritoDrawer from "../../pages/client/CarritoPage.jsx";
import { useCart } from "../../context/CarritoContext.jsx";
import { useToast } from "../ui/ToastProvider.jsx";

const TITLE_MAP = {
  "/": "Inicio",
  "/catalogo": "Catálogo",
  "/combos": "Promociones",
  "/mi-pedido": "Mi pedido",
  "/carrito": "Carrito",
  "/entrega": "Entrega",
  "/login": "Iniciar sesión",
  "/registro": "Registro",
  "/perfil": "Mi perfil",
};

export default function SiteLayout() {
  const loc = useLocation();
  const nav = useNavigate();
  const toast = useToast();
  const [cartOpen, setCartOpen] = useState(false);
  const { items } = useCart();

  const pageTitle = useMemo(() => {
    const directTitle = TITLE_MAP[loc.pathname];
    if (directTitle) return `${directTitle} | Pizza Mya`;
    if (loc.pathname.startsWith("/producto/"))
      return "Detalle de producto | Pizza Mya";
    if (loc.pathname.startsWith("/combos/"))
      return "Detalle de promoción | Pizza Mya";
    if (loc.pathname.startsWith("/personalizar/"))
      return "Personaliza tu pizza | Pizza Mya";
    return "Pizza Mya";
  }, [loc.pathname]);

  const handleCartClick = () => {
    if (!items?.length) {
      toast.info("Tu carrito está vacío. ¡Agrega productos para continuar!");
      nav("/catalogo");
      return;
    }
    nav("/carrito");
  };

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    setCartOpen(loc.pathname === "/carrito");
  }, [loc.pathname]);

  return (
    <>
      <a href="#contenido-principal" className="skip-link">
        Saltar al contenido
      </a>

      <Header onCartClick={handleCartClick} />

      <main
        id="contenido-principal"
        style={{
          minHeight: "calc(100vh - 86px - 26px)",
          background: "#f7f5f2",
          paddingBottom: 34,
        }}
      >
        <Outlet />
      </main>

      <Footer />

      <CarritoDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
