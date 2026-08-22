import { User, Mail, Phone, MapPin, Bell, Shield, CreditCard, Heart, Package, Settings } from "lucide-react";

/**
 * Componente de perfil profesional con navegación lateral mejorada
 * y secciones organizadas para una experiencia premium
 */
export default function ProfessionalProfile({ 
  user = {}, 
  profileForm = {}, 
  activeTab = "info",
  setActiveTab,
  isEditing = false,
  setIsEditing,
  onSave,
  onCancel,
  saving = false,
  stats = {}
}) {
  const tabs = [
    { 
      id: "info", 
      label: "Información", 
      hint: "Datos personales",
      icon: <User size={18} />,
      color: "#c78b47"
    },
    { 
      id: "orders", 
      label: "Pedidos", 
      hint: "Historial completo",
      icon: <Package size={18} />,
      color: "#8f2d1f"
    },
    { 
      id: "addresses", 
      label: "Direcciones", 
      hint: "Lugares guardados",
      icon: <MapPin size={18} />,
      color: "#059669"
    },
    { 
      id: "security", 
      label: "Seguridad", 
      hint: "Contraseña y acceso",
      icon: <Shield size={18} />,
      color: "#7c3aed"
    },
    { 
      id: "notifications", 
      label: "Notificaciones", 
      hint: "Preferencias",
      icon: <Bell size={18} />,
      color: "#ea580c"
    },
    { 
      id: "payment", 
      label: "Pagos", 
      hint: "Métodos guardados",
      icon: <CreditCard size={18} />,
      color: "#0891b2"
    },
    { 
      id: "favorites", 
      label: "Favoritos", 
      hint: "Productos guardados",
      icon: <Heart size={18} />,
      color: "#dc2626"
    },
    { 
      id: "settings", 
      label: "Configuración", 
      hint: "Opciones de cuenta",
      icon: <Settings size={18} />,
      color: "#475569"
    },
  ];

  const getInitials = () => {
    const nombre = profileForm.nombre || user?.nombre || "";
    const apellido = profileForm.apellido_paterno || user?.apellido_paterno || "";
    if (nombre && apellido) {
      return `${nombre[0]}${apellido[0]}`.toUpperCase();
    }
    if (nombre) {
      return nombre.slice(0, 2).toUpperCase();
    }
    return "PM";
  };

  const fullName = [
    profileForm.nombre || user?.nombre,
    profileForm.apellido_paterno || user?.apellido_paterno,
    profileForm.apellido_materno || user?.apellido_materno,
  ]
    .filter(Boolean)
    .join(" ") || "Usuario Pizza Mya";

  const email = profileForm.email || user?.email || "Sin correo";
  const telefono = profileForm.telefono || user?.telefono || "Sin teléfono";

  return (
    <div className="professional-profile-container">
      <style>{`
        .professional-profile-container {
          display: grid;
          gap: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Hero Section */
        .profile-hero {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 24px;
          align-items: center;
          padding: 32px;
          background: linear-gradient(135deg, #fffaf5 0%, #fff 100%);
          border-radius: 24px;
          border: 1px solid #eadfd4;
          box-shadow: 0 4px 20px rgba(143, 45, 31, 0.08);
        }

        .profile-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8f2d1f 0%, #c78b47 100%);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          font-weight: 950;
          box-shadow: 0 8px 24px rgba(143, 45, 31, 0.2);
          flex-shrink: 0;
        }

        .profile-info h1 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 950;
          color: #201a17;
          line-height: 1.2;
        }

        .profile-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #ecfdf5;
          color: #166534;
          border: 1px solid #bbf7d0;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 12px;
        }

        .profile-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #166534;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .profile-meta {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          color: #6b625c;
          font-weight: 600;
          font-size: 14px;
        }

        .profile-meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .profile-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .profile-btn {
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .profile-btn-primary {
          background: linear-gradient(135deg, #c78b47 0%, #8f2d1f 100%);
          color: #fff;
          box-shadow: 0 6px 16px rgba(143, 45, 31, 0.2);
        }

        .profile-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(143, 45, 31, 0.3);
        }

        .profile-btn-secondary {
          background: #fff;
          color: #8f2d1f;
          border: 2px solid #eadfd4;
        }

        .profile-btn-secondary:hover {
          background: #fffaf5;
          border-color: #c78b47;
        }

        .profile-btn-danger {
          background: #fef2f2;
          color: #dc2626;
          border: 2px solid #fecaca;
        }

        .profile-btn-danger:hover {
          background: #fee2e2;
          border-color: #ef4444;
        }

        /* Main Content */
        .profile-main {
          display: grid;
          grid-template-columns: 280px minmax(0, 1fr);
          gap: 24px;
          align-items: start;
        }

        /* Sidebar Navigation */
        .profile-sidebar {
          position: sticky;
          top: 100px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .profile-nav-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
        }

        .profile-nav-title {
          font-size: 14px;
          font-weight: 900;
          color: #201a17;
          margin: 0 0 16px 0;
          padding-bottom: 12px;
          border-bottom: 2px solid #f3f4f6;
        }

        .profile-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 8px;
          border: 1px solid transparent;
        }

        .profile-nav-item:last-child {
          margin-bottom: 0;
        }

        .profile-nav-item:hover {
          background: #f9fafb;
        }

        .profile-nav-item.active {
          background: linear-gradient(135deg, rgba(199, 139, 71, 0.1) 0%, rgba(143, 45, 31, 0.08) 100%);
          border-color: currentColor;
        }

        .profile-nav-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .profile-nav-content {
          flex: 1;
          min-width: 0;
        }

        .profile-nav-label {
          font-size: 14px;
          font-weight: 800;
          color: #111827;
          line-height: 1.2;
        }

        .profile-nav-hint {
          font-size: 12px;
          color: #6b7280;
          font-weight: 600;
          margin-top: 2px;
        }

        /* Stats Card */
        .profile-stats-card {
          background: linear-gradient(135deg, #fffbf7 0%, #fff 100%);
          border: 1px solid #efe4d8;
          border-radius: 20px;
          padding: 20px;
          margin-top: 16px;
        }

        .profile-stats-title {
          font-size: 14px;
          font-weight: 900;
          color: #201a17;
          margin: 0 0 16px 0;
        }

        .profile-stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .profile-stat-item:last-child {
          border-bottom: none;
        }

        .profile-stat-label {
          font-size: 13px;
          color: #6b625c;
          font-weight: 600;
        }

        .profile-stat-value {
          font-size: 14px;
          font-weight: 900;
          color: #8f2d1f;
          background: #fffaf5;
          padding: 6px 12px;
          border-radius: 999px;
        }

        /* Content Area */
        .profile-content {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
        }

        .profile-content-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 2px solid #f3f4f6;
        }

        .profile-content-title {
          font-size: 24px;
          font-weight: 950;
          color: #201a17;
          margin: 0 0 8px 0;
        }

        .profile-content-subtitle {
          font-size: 14px;
          color: #6b625c;
          font-weight: 600;
          margin: 0;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .profile-hero {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .profile-avatar {
            margin: 0 auto;
          }

          .profile-info {
            order: 2;
          }

          .profile-status-badge {
            margin: 0 auto 12px auto;
          }

          .profile-meta {
            justify-content: center;
          }

          .profile-actions {
            justify-content: center;
            order: 3;
          }

          .profile-main {
            grid-template-columns: 1fr;
          }

          .profile-sidebar {
            position: static;
          }
        }

        @media (max-width: 640px) {
          .profile-hero {
            padding: 20px;
          }

          .profile-avatar {
            width: 80px;
            height: 80px;
            font-size: 28px;
          }

          .profile-info h1 {
            font-size: 22px;
          }

          .profile-content {
            padding: 20px;
          }

          .profile-content-header {
            flex-direction: column;
          }

          .profile-nav-item {
            padding: 12px;
          }
        }
      `}</style>

      {/* Hero Section */}
      <section className="profile-hero">
        <div className="profile-avatar">
          {getInitials()}
        </div>

        <div className="profile-info">
          <span className="profile-status-badge">
            <span className="profile-status-dot"></span>
            Cuenta activa
          </span>
          <h1>{fullName}</h1>
          <div className="profile-meta">
            <span className="profile-meta-item">
              <Mail size={14} />
              {email}
            </span>
            <span className="profile-meta-item">
              <Phone size={14} />
              {telefono}
            </span>
          </div>
        </div>

        <div className="profile-actions">
          {!isEditing ? (
            <button 
              className="profile-btn profile-btn-primary"
              onClick={() => setIsEditing(true)}
              type="button"
            >
              <User size={16} />
              Editar perfil
            </button>
          ) : (
            <>
              <button 
                className="profile-btn profile-btn-secondary"
                onClick={onCancel}
                type="button"
              >
                Cancelar
              </button>
              <button 
                className="profile-btn profile-btn-primary"
                onClick={onSave}
                disabled={saving}
                type="button"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </>
          )}
          <button 
            className="profile-btn profile-btn-danger"
            type="button"
          >
            Cerrar sesión
          </button>
        </div>
      </section>

      {/* Main Content */}
      <div className="profile-main">
        {/* Sidebar Navigation */}
        <aside className="profile-sidebar">
          <nav className="profile-nav-card">
            <h2 className="profile-nav-title">Navegación</h2>
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`profile-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                role="button"
                tabIndex={0}
                style={activeTab === tab.id ? { borderColor: tab.color } : {}}
              >
                <div 
                  className="profile-nav-icon"
                  style={activeTab === tab.id ? { 
                    background: tab.color, 
                    color: '#fff' 
                  } : { 
                    background: '#f3f4f6', 
                    color: '#6b7280' 
                  }}
                >
                  {tab.icon}
                </div>
                <div className="profile-nav-content">
                  <div className="profile-nav-label">{tab.label}</div>
                  <div className="profile-nav-hint">{tab.hint}</div>
                </div>
              </div>
            ))}
          </nav>

          {/* Stats Card */}
          <div className="profile-stats-card">
            <h3 className="profile-stats-title">Resumen de cuenta</h3>
            <div className="profile-stat-item">
              <span className="profile-stat-label">Pedidos totales</span>
              <span className="profile-stat-value">
                {stats.totalOrders || 0}
              </span>
            </div>
            <div className="profile-stat-item">
              <span className="profile-stat-label">Direcciones</span>
              <span className="profile-stat-value">
                {stats.totalAddresses || 0}
              </span>
            </div>
            <div className="profile-stat-item">
              <span className="profile-stat-label">Perfil completo</span>
              <span className="profile-stat-value">
                {stats.completionPercentage || 0}%
              </span>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="profile-content">
          <div className="profile-content-header">
            <div>
              <h2 className="profile-content-title">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              <p className="profile-content-subtitle">
                {tabs.find(t => t.id === activeTab)?.hint}
              </p>
            </div>
          </div>

          {/* Aquí se renderizaría el contenido de cada tab */}
          <div className="profile-content-body">
            {/* El contenido específico de cada tab se inyectará desde el componente padre */}
          </div>
        </main>
      </div>
    </div>
  );
}
