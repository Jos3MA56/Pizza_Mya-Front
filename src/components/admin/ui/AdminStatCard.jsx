import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/**
 * Tarjeta de estadística para dashboard admin con indicador de tendencia
 */
export default function AdminStatCard({ 
  title = "Estadística",
  value = "0",
  trend = 0,
  trendLabel = "",
  icon = "📊",
  color = "primary",
  subtitle = ""
}) {
  const colorSchemes = {
    primary: {
      bg: "linear-gradient(135deg, #fff7ed 0%, #fff 100%)",
      border: "#fdba74",
      iconBg: "#c78b47",
      text: "#9a3412"
    },
    success: {
      bg: "linear-gradient(135deg, #ecfdf5 0%, #fff 100%)",
      border: "#86efac",
      iconBg: "#16a34a",
      text: "#166534"
    },
    danger: {
      bg: "linear-gradient(135deg, #fef2f2 0%, #fff 100%)",
      border: "#fca5a5",
      iconBg: "#dc2626",
      text: "#991b1b"
    },
    info: {
      bg: "linear-gradient(135deg, #eff6ff 0%, #fff 100%)",
      border: "#93c5fd",
      iconBg: #0284c7",
      text: "#1e40af"
    },
    warning: {
      bg: "linear-gradient(135deg, #fffbeb 0%, #fff 100%)",
      border: "#fcd34d",
      iconBg: "#ca8a04",
      text: "#854d0e"
    }
  };

  const scheme = colorSchemes[color] || colorSchemes.primary;
  
  const trendIcon = trend > 0 ? (
    <TrendingUp size={16} />
  ) : trend < 0 ? (
    <TrendingDown size={16} />
  ) : (
    <Minus size={16} />
  );

  const trendColor = trend > 0 ? "#16a34a" : trend < 0 ? "#dc2626" : "#6b7280";

  return (
    <article className="admin-stat-card">
      <style>{`
        .admin-stat-card {
          background: ${scheme.bg};
          border: 1px solid ${scheme.border};
          border-radius: 20px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .admin-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
        }

        .admin-stat-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .admin-stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: ${scheme.iconBg};
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }

        .admin-stat-trend {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          background: rgba(255, 255, 255, 0.9);
          color: ${trendColor};
          border: 1px solid ${scheme.border};
        }

        .admin-stat-value {
          font-size: 36px;
          font-weight: 950;
          color: ${scheme.text};
          line-height: 1;
          letter-spacing: -1px;
        }

        .admin-stat-title {
          font-size: 14px;
          font-weight: 700;
          color: #6b7280;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .admin-stat-subtitle {
          font-size: 13px;
          color: #9ca3af;
          font-weight: 600;
          margin: 0;
        }
      `}</style>

      <div className="admin-stat-header">
        <div className="admin-stat-icon">{icon}</div>
        {(trend !== undefined && trend !== null) && (
          <span className="admin-stat-trend">
            {trendIcon}
            {Math.abs(trend)}%
          </span>
        )}
      </div>

      <div>
        <div className="admin-stat-value">{value}</div>
        <p className="admin-stat-title">{title}</p>
        {subtitle && <p className="admin-stat-subtitle">{subtitle}</p>}
      </div>
    </article>
  );
}
