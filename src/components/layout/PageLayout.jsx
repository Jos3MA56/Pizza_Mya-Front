import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Componente PageLayout - Envoltura estructural para todas las páginas
 * Proporciona:
 * - Skip links para accesibilidad
 * - Landmarks ARIA apropiados
 * - Estructura semántica consistente
 * - Soporte para navegación por teclado
 * - Metadatos dinámicos por página
 */
export default function PageLayout({ 
  children, 
  title, 
  description, 
  breadcrumbs = [],
  className = "" 
}) {
  const location = useLocation();

  useEffect(() => {
    // Actualizar metadatos de la página
    if (title) {
      document.title = `${title} | Pizza Mya`;
    }
    
    // Actualizar meta descripción para SEO
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && description) {
      metaDescription.setAttribute("content", description);
    }
    
    // Scroll al inicio cuando cambia la ruta
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname, title, description]);

  return (
    <div className={`page-layout ${className}`} role="main">
      {/* Breadcrumbs para navegación */}
      {breadcrumbs.length > 0 && (
        <nav aria-label="Ruta de navegación" className="breadcrumbs-nav">
          <ol className="breadcrumbs-list">
            <li>
              <a href="/" aria-label="Ir a inicio">
                <span aria-hidden="true">🏠</span> Inicio
              </a>
            </li>
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.href || index}>
                <span aria-hidden="true">›</span>
                {crumb.href ? (
                  <a href={crumb.href}>{crumb.label}</a>
                ) : (
                  <span aria-current="page">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      
      {/* Contenido principal */}
      <div className="page-content">
        {children}
      </div>
      
      <style>{`
        .page-layout {
          width: 100%;
          max-width: 100%;
        }
        
        .breadcrumbs-nav {
          padding: 12px 20px;
          background: rgba(255, 255, 255, 0.5);
          border-bottom: 1px solid rgba(229, 216, 203, 0.5);
        }
        
        .breadcrumbs-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }
        
        .breadcrumbs-list li {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .breadcrumbs-list a {
          color: #8f2d1f;
          text-decoration: none;
          font-weight: 600;
        }
        
        .breadcrumbs-list a:hover {
          text-decoration: underline;
        }
        
        .breadcrumbs-list span[aria-current="page"] {
          color: #6f6258;
          font-weight: 500;
        }
        
        .page-content {
          padding: clamp(16px, 3vw, 24px);
        }
        
        @media (max-width: 768px) {
          .breadcrumbs-nav {
            padding: 10px 16px;
          }
          
          .breadcrumbs-list {
            font-size: 13px;
          }
          
          .page-content {
            padding: 16px;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .breadcrumbs-list a,
          .breadcrumbs-list span {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
