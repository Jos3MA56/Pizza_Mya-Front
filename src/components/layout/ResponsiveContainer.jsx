/**
 * Componente ResponsiveContainer - Contenedor responsive con breakpoints consistentes
 * Proporciona:
 * - Ancho máximo consistente en todas las páginas
 * - Padding responsivo automático
 * - Soporte para full-bleed (ancho completo) cuando es necesario
 * - Accesibilidad y semántica mejoradas
 */
export default function ResponsiveContainer({ 
  children, 
  variant = "default", 
  className = "",
  as: Component = "div",
  ...props 
}) {
  const variants = {
    default: "container-default",
    narrow: "container-narrow",
    wide: "container-wide",
    full: "container-full",
  };

  return (
    <Component 
      className={`responsive-container ${variants[variant] || variants.default} ${className}`}
      {...props}
    >
      {children}
      
      <style>{`
        .responsive-container {
          width: 100%;
          margin: 0 auto;
          padding: 0 clamp(16px, 4vw, 24px);
        }
        
        .container-default {
          max-width: 1200px;
        }
        
        .container-narrow {
          max-width: 800px;
        }
        
        .container-wide {
          max-width: 1400px;
        }
        
        .container-full {
          max-width: 100%;
          padding: 0;
        }
        
        /* Soporte para pantallas muy grandes */
        @media (min-width: 1920px) {
          .container-default {
            max-width: 1440px;
          }
          
          .container-wide {
            max-width: 1680px;
          }
        }
        
        /* Ajustes para tablets */
        @media (max-width: 1024px) {
          .container-default {
            max-width: 100%;
          }
        }
        
        /* Ajustes para móviles */
        @media (max-width: 768px) {
          .responsive-container {
            padding: 0 16px;
          }
        }
        
        @media (max-width: 480px) {
          .responsive-container {
            padding: 0 12px;
          }
        }
      `}</style>
    </Component>
  );
}
