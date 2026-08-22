import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const NAV_GROUPS = [
  {
    title: "Principal",
    defaultOpen: true,
    items: [{ to: "/admin", icon: "dashboard", label: "Inicio", exact: true }],
  },
  {
    title: "Operación",
    defaultOpen: true,
    items: [
      { to: "/admin/orders", icon: "receipt_long", label: "Pedidos" },
      { to: "/admin/transacciones", icon: "payments", label: "Transacciones" },
    ],
  },
  {
    title: "Administración",
    defaultOpen: true,
    items: [
      { to: "/admin/productos", icon: "inventory_2", label: "Productos" },
      { to: "/admin/catalogos", icon: "category", label: "Catálogos" },
      { to: "/admin/combos", icon: "calendar_month", label: "Combos" },
      { to: "/admin/clientes", icon: "groups", label: "Clientes" },
    ],
  },
  {
    title: "Análisis",
    defaultOpen: false,
    items: [
      { to: "/admin/reportes", icon: "bar_chart", label: "Reportes" },
      {
        to: "/admin/prediccion-insumos",
        icon: "trending_up",
        label: "Predicción de Insumos",
      },
    ],
  },
  {
    title: "Contenido",
    defaultOpen: false,
    items: [
      { to: "/admin/galeria", icon: "photo_library", label: "Galería" },
      { to: "/admin/legal", icon: "policy", label: "Legal" },
      { to: "/admin/config", icon: "settings", label: "Configuración" },
    ],
  },
];

function getAllNavItems() {
  return NAV_GROUPS.flatMap((group) => group.items);
}

function isItemActive(pathname, item) {
  if (item.exact) return pathname === item.to;
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

function getActivePageTitle(pathname) {
  const current = getAllNavItems()
    .slice()
    .sort((a, b) => b.to.length - a.to.length)
    .find((item) => isItemActive(pathname, item));

  return current?.label || "Panel de Administración";
}

function buildInitialOpenGroups(pathname) {
  const initial = {};

  NAV_GROUPS.forEach((group) => {
    const hasActiveItem = group.items.some((item) =>
      isItemActive(pathname, item),
    );

    initial[group.title] = group.defaultOpen || hasActiveItem;
  });

  return initial;
}

function AdminSidebarMenu({ collapsed, onNavigate }) {
  const location = useLocation();

  const [openGroups, setOpenGroups] = useState(() =>
    buildInitialOpenGroups(location.pathname),
  );

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };

      NAV_GROUPS.forEach((group) => {
        const hasActiveItem = group.items.some((item) =>
          isItemActive(location.pathname, item),
        );

        if (hasActiveItem) {
          next[group.title] = true;
        }
      });

      return next;
    });
  }, [location.pathname]);

  const toggleGroup = (title) => {
    if (collapsed) return;

    setOpenGroups((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  if (collapsed) {
    return (
      <nav className="adm-menu collapsed-menu" aria-label="Menú administrador">
        {getAllNavItems().map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              `adm-mini-item ${isActive ? "adm-item-active" : ""}`
            }
            title={item.label}
            onClick={onNavigate}
          >
            <span className="ms">{item.icon}</span>
          </NavLink>
        ))}
      </nav>
    );
  }

  return (
    <nav className="adm-menu" aria-label="Menú administrador">
      {NAV_GROUPS.map((group) => {
        const isOpen = openGroups[group.title];

        return (
          <section className="adm-group" key={group.title}>
            <button
              type="button"
              className="adm-group-head"
              onClick={() => toggleGroup(group.title)}
            >
              <span>{group.title}</span>
              <span className="ms">
                {isOpen ? "expand_less" : "expand_more"}
              </span>
            </button>

            {isOpen ? (
              <div className="adm-group-items">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.exact}
                    className={({ isActive }) =>
                      `adm-item ${isActive ? "adm-item-active" : ""}`
                    }
                    onClick={onNavigate}
                  >
                    <span className="ms">{item.icon}</span>
                    <span className="adm-item-label">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            ) : null}
          </section>
        );
      })}
    </nav>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const [collapsed, setCollapsed] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 900 : false,
  );
  const [isMobileAdmin, setIsMobileAdmin] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 900 : false,
  );
  const [logoUrl, setLogoUrl] = useState("/img/logo.png");

  const pageTitle = useMemo(
    () => getActivePageTitle(location.pathname),
    [location.pathname],
  );

  useEffect(() => {
    document.title = `${pageTitle} | Pizza Mya`;
  }, [pageTitle]);

  useEffect(() => {
    const updateMobileState = () => {
      const mobile = window.innerWidth <= 900;
      setIsMobileAdmin(mobile);
      if (mobile) setCollapsed(true);
    };

    updateMobileState();
    window.addEventListener("resize", updateMobileState);

    return () => window.removeEventListener("resize", updateMobileState);
  }, []);

  useEffect(() => {
    if (isMobileAdmin) setCollapsed(true);
  }, [location.pathname, isMobileAdmin]);

  useEffect(() => {
    const raw = localStorage.getItem("pmya_config");

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.logo_url) setLogoUrl(parsed.logo_url);
      } catch {
        // No bloquear layout si localStorage trae JSON inválido
      }
    }

    const onConfigUpdated = (event) => {
      if (event?.detail?.logo_url) {
        setLogoUrl(event.detail.logo_url);
      }
    };

    window.addEventListener("configUpdated", onConfigUpdated);

    return () => {
      window.removeEventListener("configUpdated", onConfigUpdated);
    };
  }, []);

  const displayName =
    user?.nombres ||
    user?.nombre ||
    user?.name ||
    user?.correo ||
    user?.email ||
    "Administrador";

  const handleLogout = () => {
    logout?.();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,500,0,0');

        .adm-shell {
          height: 100dvh;
          max-height: 100dvh;
          background: #f2f2f2;
          display: flex;
          overflow: hidden;
        }

        .adm-side {
          width: 280px;
          height: 100dvh;
          background: #000;
          color: #fff;
          display: flex;
          flex-direction: column;
          padding: 16px 12px;
          flex-shrink: 0;
          transition: width 0.25s ease;
          overflow: hidden;
          position: sticky;
          top: 0;
        }

        .adm-side.collapsed {
          width: 82px;
          padding-left: 10px;
          padding-right: 10px;
        }

        .adm-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
          min-height: 56px;
          gap: 8px;
        }

        .adm-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          overflow: hidden;
          min-width: 0;
        }

        .adm-logo img {
          height: 56px;
          width: auto;
          max-width: 160px;
          display: block;
          object-fit: contain;
        }

        .adm-side.collapsed .adm-logo img {
          max-width: 0;
          opacity: 0;
        }

        .adm-toggle {
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

        .adm-toggle:hover {
          background: rgba(255,255,255,.12);
        }

        .ms {
          font-family: "Material Symbols Outlined";
          font-weight: normal;
          font-style: normal;
          font-size: 22px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          -webkit-font-feature-settings: "liga";
          -webkit-font-smoothing: antialiased;
          flex-shrink: 0;
        }

        .adm-user {
          margin-bottom: 12px;
          padding: 13px 14px;
          border-radius: 17px;
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(255,255,255,.04);
          overflow: hidden;
        }

        .adm-user-role {
          font-size: 11px;
          color: rgba(255,255,255,.62);
          margin-bottom: 6px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .04em;
        }

        .adm-user-name {
          font-size: 15px;
          font-weight: 900;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .adm-menu {
          display: grid;
          gap: 9px;
          overflow-y: auto;
          min-height: 0;
          padding-right: 2px;
        }

        .adm-menu::-webkit-scrollbar {
          width: 6px;
        }

        .adm-menu::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,.16);
          border-radius: 999px;
        }

        .adm-group {
          border: 1px solid rgba(255,255,255,.09);
          border-radius: 16px;
          background: rgba(255,255,255,.03);
          overflow: hidden;
        }

        .adm-group-head {
          width: 100%;
          border: 0;
          background: transparent;
          color: rgba(255,255,255,.62);
          padding: 10px 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          font-weight: 950;
          letter-spacing: .07em;
          text-transform: uppercase;
          cursor: pointer;
        }

        .adm-group-head:hover {
          color: #fff;
        }

        .adm-group-head .ms {
          font-size: 18px;
        }

        .adm-group-items {
          display: grid;
          gap: 6px;
          padding: 0 8px 8px;
        }

        .adm-item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 11px 12px;
          border-radius: 13px;
          color: rgba(255,255,255,.82);
          text-decoration: none;
          font-weight: 850;
          white-space: nowrap;
          overflow: hidden;
          transition: background .16s ease, color .16s ease, transform .16s ease;
        }

        .adm-item:hover {
          background: rgba(255,255,255,.08);
          color: #fff;
        }

        .adm-item-active {
          background: #E50914 !important;
          color: #fff !important;
          box-shadow: 0 10px 22px rgba(229,9,20,.28);
        }

        .adm-item-label {
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .collapsed-menu {
          gap: 8px;
          padding-right: 0;
        }

        .adm-mini-item {
          width: 48px;
          height: 48px;
          border-radius: 15px;
          color: rgba(255,255,255,.82);
          border: 1px solid rgba(255,255,255,.10);
          background: rgba(255,255,255,.03);
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition: background .16s ease, color .16s ease;
        }

        .adm-mini-item:hover {
          background: rgba(255,255,255,.08);
          color: #fff;
        }

        .adm-bottom {
          margin-top: auto;
          padding-top: 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex-shrink: 0;
        }

        .adm-exit {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 12px;
          width: 100%;
          padding: 13px 14px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,.14);
          background: transparent;
          color: rgba(255,255,255,.85);
          cursor: pointer;
          font-weight: 850;
          white-space: nowrap;
          overflow: hidden;
          transition: background .16s ease, color .16s ease;
        }

        .adm-side.collapsed .adm-exit {
          width: 48px;
          height: 48px;
          padding: 0;
          justify-content: center;
        }

        .adm-exit:hover {
          background: rgba(255,255,255,.08);
          color: #fff;
        }

        .adm-copy {
          font-size: 11px;
          color: rgba(255,255,255,.35);
          text-align: center;
        }

        .adm-content {
          flex: 1;
          min-width: 0;
          min-height: 0;
          height: 100dvh;
          background: #f2f2f2;
          overflow-y: auto;
          overflow-x: hidden;
          padding: clamp(12px, 2vw, 24px);
          --adm-page-title-size: clamp(1.45rem, 2.5vw, 2.125rem);
          --adm-card-padding: clamp(16px, 2vw, 22px);
          --adm-grid-catalogos: minmax(280px, 360px) 1fr;
          --adm-grid-two: minmax(0, 1.25fr) minmax(320px, .75fr);
          --adm-grid-two-even: repeat(2, minmax(0, 1fr));
          --adm-grid-three: repeat(3, minmax(0, 1fr));
          --adm-grid-filters: minmax(220px, 2fr) minmax(150px, 1fr) minmax(150px, 1fr) auto;
          --adm-grid-pedidos-toolbar: minmax(0,1fr) 220px 160px;
          --adm-report-filter-grid: repeat(4, minmax(0, 1fr)) auto;
          --adm-product-card-grid: repeat(auto-fill, minmax(min(100%, 360px), 1fr));
          --adm-combo-card-grid: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
          --adm-modal-two: repeat(2, minmax(0, 1fr));
        }

        .adm-side.collapsed .adm-user-role,
        .adm-side.collapsed .adm-user-name,
        .adm-side.collapsed .adm-copy,
        .adm-side.collapsed .adm-exit-label {
          opacity: 0;
          width: 0;
          height: 0;
          overflow: hidden;
          pointer-events: none;
        }

        @media (max-width: 900px) {
          .adm-shell {
            display: block;
            height: auto;
            min-height: 100dvh;
            overflow: visible;
          }

          .adm-side {
            position: sticky;
            top: 0;
            z-index: 50;
            width: 100%;
            height: auto;
            max-height: 100dvh;
            border-radius: 0 0 22px 22px;
          }

          .adm-side.collapsed {
            width: 100%;
          }

          .adm-side.collapsed .adm-logo img {
            max-width: 160px;
            opacity: 1;
          }

          .adm-content {
            height: auto;
            min-height: 100dvh;
            padding: clamp(12px, 4vw, 16px);
          }
          .adm-content {
            --adm-grid-catalogos: 1fr;
            --adm-grid-two: 1fr;
            --adm-grid-two-even: 1fr;
            --adm-grid-three: 1fr;
            --adm-grid-filters: 1fr;
            --adm-grid-pedidos-toolbar: 1fr;
            --adm-report-filter-grid: 1fr;
            --adm-product-card-grid: 1fr;
            --adm-combo-card-grid: 1fr;
            --adm-modal-two: 1fr;
          }

          .adm-side.collapsed .adm-user,
          .adm-side.collapsed .adm-menu,
          .adm-side.collapsed .adm-bottom {
            display: none;
          }

          .adm-side:not(.collapsed) {
            box-shadow: 0 24px 60px rgba(0,0,0,.28);
          }


          .collapsed-menu {
            grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
          }

          .adm-side.collapsed .adm-user-role,
          .adm-side.collapsed .adm-user-name,
          .adm-side.collapsed .adm-copy,
          .adm-side.collapsed .adm-exit-label {
            opacity: 1;
            width: auto;
            height: auto;
            pointer-events: auto;
          }

          .adm-side.collapsed .adm-exit {
            width: 100%;
            height: auto;
            padding: 13px 14px;
            justify-content: flex-start;
          }
        }

        @media (max-width: 560px) {
          .adm-side {
            padding: 12px 10px;
            border-radius: 0 0 18px 18px;
          }

          .adm-logo img {
            height: 48px;
            max-width: 132px;
          }

          .adm-toggle {
            width: 40px;
            height: 40px;
            border-radius: 12px;
          }

          .adm-group-items {
            padding: 0 6px 8px;
          }

          .adm-item {
            padding: 10px 10px;
            font-size: 14px;
          }
        }
      `}</style>

      <div className="adm-shell">
        <aside className={`adm-side ${collapsed ? "collapsed" : ""}`}>
          <div className="adm-top">
            <div className="adm-logo">
              <img src={logoUrl} alt="Pizza Mya" />
            </div>

            <button
              type="button"
              className="adm-toggle"
              onClick={() => setCollapsed((prev) => !prev)}
              title={collapsed ? "Expandir menú" : "Contraer menú"}
              aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
            >
              <span className="ms">{collapsed ? "menu_open" : "menu"}</span>
            </button>
          </div>

          <div className="adm-user">
            <div className="adm-user-role">Sesión activa</div>
            <div className="adm-user-name">{displayName}</div>
          </div>

          <AdminSidebarMenu
            collapsed={collapsed}
            onNavigate={() => {
              if (isMobileAdmin) setCollapsed(true);
            }}
          />

          <div className="adm-bottom">
            <button type="button" className="adm-exit" onClick={handleLogout}>
              <span className="ms">logout</span>
              <span className="adm-exit-label">Cerrar sesión</span>
            </button>

            <div className="adm-copy">© 2026 Pizza Mya</div>
          </div>
        </aside>

        <main className="adm-content">
          <Outlet />
        </main>
      </div>
    </>
  );
}
