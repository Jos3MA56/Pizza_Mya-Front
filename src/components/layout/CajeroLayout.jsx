import { useMemo, useState, useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const NAV = [
  { to: "/cajero/dashboard", icon: "dashboard", label: "Dashboard" },
  { to: "/cajero/pos", icon: "point_of_sale", label: "Punto de Venta" },
  { to: "/cajero/pedidos", icon: "receipt_long", label: "Pedidos" },
  { to: "/cajero/corte", icon: "payments", label: "Corte de Caja" },
  { to: "/cajero/respaldos", icon: "backup_table", label: "Respaldos" },
  { to: "/cajero/exportacion", icon: "table", label: "Exportacion" },
];

export default function CajeroLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [logoUrl, setLogoUrl] = useState("/img/logo.png");

  const pageTitle = useMemo(() => {
    const current = NAV.find((item) => location.pathname.startsWith(item.to));
    return current?.label || "Panel de Cajero";
  }, [location.pathname]);

  useEffect(() => {
    document.title = `${pageTitle} | Pizza Mya`;
  }, [pageTitle]);

  const currentDate = useMemo(() => {
    return new Date().toLocaleDateString("es-MX", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem("pmya_config");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.logo_url) {
          setLogoUrl(parsed.logo_url);
        }
      } catch {}
    }

    const onConfigUpdated = (event) => {
      const cfg = event?.detail;
      if (cfg?.logo_url) {
        setLogoUrl(cfg.logo_url);
      }
    };

    window.addEventListener("configUpdated", onConfigUpdated);
    return () => window.removeEventListener("configUpdated", onConfigUpdated);
  }, []);

  const displayName =
    user?.nombres ||
    user?.nombre ||
    user?.name ||
    user?.correo ||
    user?.email ||
    "Cajero";

  const itemClass = ({ isActive }) =>
    ["caj-item", isActive ? "caj-item-active" : ""].join(" ");

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,500,0,0');

  .caj-shell {
    height: 100dvh;
    max-height: 100dvh;
    background: #f2f2f2;
    display: flex;
    overflow: hidden;
  }

  .caj-side {
    width: 280px;
    height: 100dvh;
    background: #000;
    color: #fff;
    display: flex;
    flex-direction: column;
    padding: 18px 12px;
    flex-shrink: 0;
    transition: width 0.25s ease;
    overflow: hidden;
    position: sticky;
    top: 0;
  }

  .caj-side.collapsed {
    width: 76px;
  }

  .caj-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
    min-height: 54px;
    gap: 8px;
  }

  .caj-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    overflow: hidden;
  }

  .caj-logo img {
    height: 60px;
    width: auto;
    display: block;
    object-fit: contain;
  }

  .caj-toggle {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,.18);
    background: rgba(255,255,255,.06);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .caj-toggle:hover {
    background: rgba(255,255,255,.12);
  }

  .caj-toggle .ms,
  .caj-item .ms,
  .caj-exit .ms {
    font-family: "Material Symbols Outlined";
    font-size: 22px;
    line-height: 1;
    flex-shrink: 0;
  }

  .caj-user {
    margin-bottom: 16px;
    padding: 14px;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,.12);
    background: rgba(255,255,255,.04);
    overflow: hidden;
  }

  .caj-user-role {
    font-size: 12px;
    color: rgba(255,255,255,.65);
    margin-bottom: 6px;
    font-weight: 700;
  }

  .caj-user-name {
    font-size: 16px;
    font-weight: 900;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .caj-menu {
    display: grid;
    gap: 6px;
    overflow-y: auto;
    min-height: 0;
  }

  .caj-menu::-webkit-scrollbar {
    width: 8px;
  }

  .caj-menu::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,.18);
    border-radius: 999px;
  }

  .caj-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
    border-radius: 14px;
    color: rgba(255,255,255,.85);
    border: 1px solid rgba(255,255,255,.10);
    background: rgba(255,255,255,.03);
    font-weight: 800;
    text-decoration: none;
    white-space: nowrap;
    overflow: hidden;
    transition: background 0.15s, border-color 0.15s;
  }

  .caj-item:hover {
    background: rgba(255,255,255,.08);
  }

  .caj-item-active {
    background: #E50914;
    border-color: #E50914;
    color: #fff;
  }

  .caj-item-label {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .caj-bottom {
    margin-top: auto;
    padding-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex-shrink: 0;
  }

  .caj-exit {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 14px;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,.14);
    background: transparent;
    color: rgba(255,255,255,.85);
    cursor: pointer;
    font-weight: 800;
    white-space: nowrap;
    overflow: hidden;
    transition: background 0.15s;
  }

  .caj-exit:hover {
    background: rgba(255,255,255,.08);
  }

  .caj-copy {
    font-size: 11px;
    color: rgba(255,255,255,.35);
    text-align: center;
  }

  .caj-content {
    flex: 1;
    min-width: 0;
    min-height: 0;
    height: 100dvh;
    background: #f2f2f2;
    padding: 24px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .caj-header-right {
    text-align: right;
    color: #6b7280;
    font-size: 14px;
    font-weight: 700;
    text-transform: capitalize;
    padding: 12px;
    flex-shrink: 0;
  }

  .caj-outlet {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    -webkit-overflow-scrolling: touch;
  }

  .collapsed .caj-user-role,
  .collapsed .caj-user-name,
  .collapsed .caj-item-label,
  .collapsed .caj-copy,
  .collapsed .caj-exit-label {
    opacity: 0;
    width: 0;
    overflow: hidden;
  }

  @media (max-width: 900px) {
    .caj-shell {
      height: auto;
      max-height: none;
      overflow: visible;
      flex-direction: column;
    }

    .caj-side {
      width: 100%;
      height: auto;
      position: relative;
      top: auto;
    }

    .caj-side.collapsed {
      width: 100%;
    }

    .caj-content {
      height: auto;
      overflow: visible;
      padding: 16px;
    }

    .caj-outlet {
      overflow: visible;
    }

    .caj-header-right {
      text-align: left;
      padding: 12px 0;
    }
  }
`}</style>

      <div className="caj-shell">
        <aside
          className={`caj-side${collapsed ? " collapsed" : ""}`}
          aria-label="Barra lateral de cajero"
        >
          <div className="caj-top">
            {!collapsed ? (
              <div className="caj-logo">
                <img src={logoUrl || "/img/logo.png"} alt="Pizza Mya" />
              </div>
            ) : null}

            <button
              className="caj-toggle"
              type="button"
              aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
              onClick={() => setCollapsed((prev) => !prev)}
            >
              <span className="ms">{collapsed ? "menu" : "menu_open"}</span>
            </button>
          </div>

          <div className="caj-user">
            <div className="caj-user-role">Sesión activa</div>
            <div className="caj-user-name">{displayName}</div>
          </div>

          <nav className="caj-menu" aria-label="Navegación del panel de cajero">
            {NAV.map(({ to, icon, label }) => (
              <NavLink key={to} to={to} className={itemClass}>
                <span className="ms">{icon}</span>
                <span className="caj-item-label">{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="caj-bottom">
            <button className="caj-exit" type="button" onClick={handleLogout}>
              <span className="ms">logout</span>
              <span className="caj-exit-label">Cerrar sesión</span>
            </button>

            <div className="caj-copy">
              © {new Date().getFullYear()} Pizza Mya
            </div>
          </div>
        </aside>

        <main className="caj-content" id="contenido-principal-cajero">
          <div className="caj-header-right">{currentDate}</div>

          <div className="caj-outlet">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}
