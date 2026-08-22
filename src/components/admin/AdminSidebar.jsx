import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

function Item({ to, children, onNavigate }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
          "transition hover:bg-zinc-800/70",
          isActive ? "bg-zinc-800 text-white" : "text-zinc-300",
        ].join(" ")
      }
    >
      <span className="h-2 w-2 rounded-full bg-orange-500" />
      {children}
    </NavLink>
  );
}

export default function AdminSidebar({ onNavigate }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const displayName =
    user?.nombre ||
    user?.name ||
    user?.correo ||
    user?.email ||
    "Administrador";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="flex h-full w-full flex-col bg-zinc-900/60 border-r border-zinc-800 backdrop-blur">
      <div className="p-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-sm text-zinc-400">Panel</p>
          <p className="text-lg font-semibold">
            Pizza <span className="text-orange-500">Mya</span> Admin
          </p>
          <p className="mt-2 text-xs text-zinc-400">
            Sesión: <span className="text-zinc-200">{displayName}</span>
          </p>
        </div>

        <nav className="mt-4 space-y-1">
          <Item to="/admin/dashboard" onNavigate={onNavigate}>
            Dashboard
          </Item>
          <Item to="/admin/productos" onNavigate={onNavigate}>
            Productos
          </Item>
          <Item to="/admin/combos" onNavigate={onNavigate}>
            Combos
          </Item>
          <Item to="/admin/galeria" onNavigate={onNavigate}>
            Galería
          </Item>
          <Item to="/admin/nosotros" onNavigate={onNavigate}>
            Nosotros
          </Item>
          <Item to="/admin/orders" onNavigate={onNavigate}>
            Pedidos
          </Item>
          <Item to="/admin/clientes" onNavigate={onNavigate}>
            Clientes
          </Item>
          <Item to="/admin/prediccion-insumos" onNavigate={onNavigate}>
            Predicción de insumos
          </Item>
          <Item to="/admin/config" onNavigate={onNavigate}>
            Configuración
          </Item>
        </nav>
      </div>

      <div className="mt-auto p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-xl bg-orange-500/90 px-4 py-2 text-sm font-semibold text-black transition hover:bg-orange-500"
        >
          Cerrar sesión
        </button>

        <p className="mt-3 text-xs text-zinc-500">
          © {new Date().getFullYear()} Pizza Mya
        </p>
      </div>
    </aside>
  );
}
