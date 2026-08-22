import { NavLink, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "../../context/CarritoContext.jsx";
import CarritoDrawer from "../../pages/client/CarritoPage.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const fullBleed = {
  width: "100vw",
  marginLeft: "calc(50% - 50vw)",
};

const navItems = [
  { to: "/", label: "Inicio" },
  { to: "/catalogo", label: "Catálogo" },
  { to: "/combos", label: "Promociones" },
  { to: "/galeria", label: "Galería" },
  { to: "/mi-pedido", label: "Mi pedido" },
];

export default function Header({ onCartClick }) {
  const nav = useNavigate();
  const [openCart, setOpenCart] = useState(false);
  const [logoUrl, setLogoUrl] = useState("/img/logo.png");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { isLogged, user, logout } = useAuth();
  const { items } = useCart();

  const cartCount = (items || []).reduce(
    (sum, item) => sum + Math.max(1, Number(item?.cantidad || 1)),
    0,
  );

  useEffect(() => {
    const raw = localStorage.getItem("pmya_config");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.logo_url) setLogoUrl(parsed.logo_url);
      } catch {}
    }

    const onConfigUpdated = (event) => {
      const cfg = event?.detail;
      if (cfg?.logo_url) setLogoUrl(cfg.logo_url);
    };

    const onWindowClick = () => setUserMenuOpen(false);
    window.addEventListener("configUpdated", onConfigUpdated);
    window.addEventListener("click", onWindowClick);

    return () => {
      window.removeEventListener("configUpdated", onConfigUpdated);
      window.removeEventListener("click", onWindowClick);
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [items?.length]);

  const userName = user?.nombre || user?.nombres || "Cuenta";
  const userRole = user?.role || user?.rol || user?.tipo;
  const role = String(userRole || "")
    .trim()
    .toLowerCase();
  const isAdmin = role === "admin" || role === "administrador";

  const handleCartOpen = () => {
    if (typeof onCartClick === "function") {
      onCartClick();
      return;
    }
    setOpenCart(true);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap');
        .pmya-header a { text-decoration: none; }
        .pmya-header .nav a { color: rgba(255,255,255,.92); font-size: 18px; }
        .pmya-header .nav a:hover,
        .pmya-header .nav a.active { color: #fff; }
        .pmya-cartBtn, .pmya-menuBtn{
          border: none; border-radius: 12px;
          background: rgba(0,0,0,.0); cursor: pointer;
          display:flex; align-items:center; justify-content:center;
          color: rgba(255,255,255,.92); font-size: 16px;
        }
        .pmya-menuBtn{ width: 44px; height: 44px; }
        .pmya-cartBtn{
          position: relative;
          min-height: 44px;
          padding: 0 14px;
          gap: 10px;
          border-radius: 999px;
          font-weight: 900;
        }
        .pmya-cartLabel{ font-size: 13px; font-weight: 900; letter-spacing: .02em; }
        .pmya-cartBadge{
          position:absolute; top:-8px; right:-6px;
          min-width: 22px; height: 22px; padding: 0 6px;
          border-radius: 999px; background:#e50914; color:#fff;
          display:inline-flex; align-items:center; justify-content:center;
          font-size: 11px; font-weight: 900; border:2px solid #FF6A00;
          box-shadow: 0 8px 18px rgba(0,0,0,.18);
        }
        .pmya-cartBtn:hover, .pmya-menuBtn:hover{ color:#fff; background: rgba(255,255,255,.16); }
        .pmya-userWrap{ position: relative; }
        .pmya-userBtn{
          border: none; background: transparent; cursor: pointer;
          color: rgba(255,255,255,.92); display:flex; align-items:center;
          gap: 10px; font-size: 14px; font-weight: 500;
        }
        .pmya-userBtn:hover{ color:#fff; }
        .pmya-avatar{
          width: 28px; height: 28px; border-radius: 999px;
          background: rgba(255,255,255,.22); display:flex;
          align-items:center; justify-content:center;
          font-weight: 900; color:#fff;
        }
        .pmya-userMenu{
          position:absolute; right: 0; top: calc(100% + 10px);
          width: 210px; background:#fff; border: 1px solid #eee;
          border-radius: 14px; box-shadow: 0 18px 40px rgba(0,0,0,.16);
          overflow:hidden; z-index: 9999;
        }
        .pmya-userItem{
          width: 100%; text-align:left; border:none; background:#fff;
          padding: 12px 14px; cursor:pointer; font-weight: 900;
          font-size: 13px; color:#111;
        }
        .pmya-userItem:hover{ background:#f6f6f6; }
        .pmya-userLogout{ color:#B80E0E; }
        .pmya-userAdmin{
          color: #e50914 !important;
          background: #fff5f5 !important;
          border-bottom: 1px solid #eee !important;
          font-weight: 900 !important;
        }
        .pmya-navDesktop{
          margin-left: auto;
          margin-right: auto;
          display: flex;
          gap: 48px;
          align-items: center;
        }
        .pmya-headerActions {
  margin-left: auto;
}

.pmya-loginBtn {
  text-decoration: none;
}
        .pmya-mobileBar{ display:none; }
        .pmya-mobileMenu{ display:none; }
        @media (max-width: 900px){
          .pmya-navDesktop{ display:none; }
          .pmya-mobileBar{ display:flex; align-items:center; gap:10px; margin-left:auto; }
          .pmya-userDesktopName{ display:none; }
          .pmya-cartLabel{ display:none; }
          .pmya-mobileMenu{
            display:block;
            background:#FF6A00;
            padding: 0 20px 18px;
          }
          .pmya-mobileMenu nav{
            display:grid; gap:10px; background: rgba(255,255,255,.08);
            padding: 12px; border-radius: 14px;
          }
          .pmya-mobileMenu a, .pmya-mobileMenu button{
            color:#fff; text-decoration:none; background:transparent; border:none;
            text-align:left; font-weight:800; font-size:15px; cursor:pointer;
            padding: 10px 12px; border-radius: 10px;
          }
          .pmya-mobileMenu a.active, .pmya-mobileMenu a:hover, .pmya-mobileMenu button:hover{
            background: rgba(255,255,255,.14);
          }
          .pmya-navDesktop{ display:none; }
  .pmya-mobileBar{ display:flex; align-items:center; gap:10px; }
  .pmya-headerActions {
    margin-left: auto;
    gap: 8px;
  }
  .pmya-userDesktopName{ display:none; }
  .pmya-cartLabel{ display:none; }
  .pmya-loginBtn .pmya-userDesktopName {
    display: none;
  }
        }
      `}</style>

      <header className="pmya-header" style={{ width: "100%" }}>
        <div style={{ background: "#FF6A00", ...fullBleed }}>
          <div
            style={{
              maxWidth: 1152,
              margin: "0 auto",
              padding: "0 20px",
              minHeight: 86,
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <NavLink
              to="/"
              style={{ display: "flex", alignItems: "center" }}
              aria-label="Ir al inicio"
            >
              <img
                src={logoUrl || "/img/logo.png"}
                alt="Pizza Mya"
                style={{
                  height: 60,
                  width: "auto",
                  objectFit: "contain",
                  display: "block",
                }}
                draggable="false"
              />
            </NavLink>

            <nav
              className="nav pmya-navDesktop"
              aria-label="Navegación principal"
            >
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to}>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div
              className="pmya-headerActions"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginLeft: "auto",
              }}
            >
              <button
                type="button"
                className="pmya-cartBtn"
                onClick={handleCartOpen}
                aria-label={`Abrir carrito (${cartCount} artículos)`}
                title="Tu pedido"
              >
                <ShoppingCart size={18} />
                {cartCount > 0 ? (
                  <span className="pmya-cartBadge">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                ) : null}
              </button>

              <div className="pmya-mobileBar">
                <button
                  type="button"
                  className="pmya-menuBtn"
                  onClick={(event) => {
                    event.stopPropagation();
                    setMobileMenuOpen((value) => !value);
                  }}
                  aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
                  aria-expanded={mobileMenuOpen}
                >
                  {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
              </div>

              {!isLogged ? (
                <NavLink
                  to="/login"
                  className="pmya-loginBtn"
                  style={{
                    color: "rgba(255,255,255,.92)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  <User size={18} />{" "}
                  <span className="pmya-userDesktopName">Iniciar sesión</span>
                </NavLink>
              ) : (
                <div
                  className="pmya-userWrap"
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    className="pmya-userBtn"
                    onClick={() => setUserMenuOpen((v) => !v)}
                    title="Cuenta"
                    aria-haspopup="menu"
                    aria-expanded={userMenuOpen}
                  >
                    <span className="pmya-avatar">
                      {(userName?.[0] || "J").toUpperCase()}
                    </span>
                    <span className="pmya-userDesktopName">{userName}</span>{" "}
                    <span style={{ opacity: 0.9 }}>▾</span>
                  </button>
                  {userMenuOpen && (
                    <div className="pmya-userMenu" role="menu">
                      {isAdmin ? (
                        <button
                          type="button"
                          className="pmya-userItem pmya-userAdmin"
                          onClick={() => {
                            setUserMenuOpen(false);
                            nav("/admin/dashboard");
                          }}
                        >
                          🔧 Panel de administración
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="pmya-userItem"
                          onClick={() => {
                            setUserMenuOpen(false);
                            nav("/perfil");
                          }}
                        >
                          👤 Mi perfil
                        </button>
                      )}
                      <button
                        type="button"
                        className="pmya-userItem pmya-userLogout"
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                          nav("/", { replace: true });
                        }}
                      >
                        🚪 Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {mobileMenuOpen ? (
            <div className="pmya-mobileMenu">
              <nav aria-label="Navegación móvil">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                ))}
                {!isLogged ? (
                  <NavLink to="/login" onClick={() => setMobileMenuOpen(false)}>
                    Iniciar sesión
                  </NavLink>
                ) : isAdmin ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      nav("/admin/dashboard");
                    }}
                  >
                    Panel de administración
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      nav("/perfil");
                    }}
                  >
                    Mi perfil
                  </button>
                )}
              </nav>
            </div>
          ) : null}
        </div>
        <div style={{ height: 20, background: "#B80E0E", ...fullBleed }} />
        <div style={{ height: 20, background: "#000", ...fullBleed }} />
      </header>

      <CarritoDrawer open={openCart} onClose={() => setOpenCart(false)} />
    </>
  );
}
