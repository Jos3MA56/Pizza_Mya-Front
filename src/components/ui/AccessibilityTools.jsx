import { useState, useEffect } from "react";

/**
 * Componente AccessibilityTools - Herramientas de accesibilidad
 * Proporciona:
 * - Control de tamaño de fuente
 * - Alto contraste
 * - Modo lectura
 * - Subrayar enlaces
 */
export default function AccessibilityTools() {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const [readingMode, setReadingMode] = useState(false);

  useEffect(() => {
    // Aplicar tamaño de fuente
    document.documentElement.style.fontSize = `${fontSize}%`;
    
    // Aplicar alto contraste
    if (highContrast) {
      document.documentElement.setAttribute("data-contrast", "high");
    } else {
      document.documentElement.removeAttribute("data-contrast");
    }
    
    // Aplicar modo lectura
    if (readingMode) {
      document.documentElement.setAttribute("data-reading-mode", "true");
    } else {
      document.documentElement.removeAttribute("data-reading-mode");
    }
    
    // Guardar preferencias
    localStorage.setItem("accessibility-preferences", JSON.stringify({
      fontSize,
      highContrast,
      readingMode,
    }));
  }, [fontSize, highContrast, readingMode]);

  useEffect(() => {
    // Cargar preferencias guardadas
    const saved = localStorage.getItem("accessibility-preferences");
    if (saved) {
      try {
        const prefs = JSON.parse(saved);
        if (prefs.fontSize) setFontSize(prefs.fontSize);
        if (prefs.highContrast !== undefined) setHighContrast(prefs.highContrast);
        if (prefs.readingMode !== undefined) setReadingMode(prefs.readingMode);
      } catch (e) {
        console.error("Error loading accessibility preferences:", e);
      }
    }
  }, []);

  const resetPreferences = () => {
    setFontSize(100);
    setHighContrast(false);
    setReadingMode(false);
    localStorage.removeItem("accessibility-preferences");
  };

  return (
    <>
      <button
        type="button"
        className="accessibility-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="accessibility-panel"
        aria-label="Herramientas de accesibilidad"
        title="Accesibilidad"
      >
        <span aria-hidden="true">♿</span>
      </button>

      {isOpen && (
        <div 
          id="accessibility-panel"
          className="accessibility-panel"
          role="dialog"
          aria-labelledby="accessibility-title"
          aria-modal="true"
        >
          <h3 id="accessibility-title">Accesibilidad</h3>
          
          <div className="accessibility-control">
            <label htmlFor="font-size-slider">Tamaño de fuente: {fontSize}%</label>
            <input
              id="font-size-slider"
              type="range"
              min="80"
              max="200"
              step="10"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              aria-valuemin="80"
              aria-valuemax="200"
              aria-valuenow={fontSize}
            />
            <div className="accessibility-buttons">
              <button type="button" onClick={() => setFontSize(Math.max(80, fontSize - 10))}>A-</button>
              <button type="button" onClick={() => setFontSize(Math.min(200, fontSize + 10))}>A+</button>
            </div>
          </div>

          <div className="accessibility-control">
            <label>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
              />
              Alto contraste
            </label>
          </div>

          <div className="accessibility-control">
            <label>
              <input
                type="checkbox"
                checked={readingMode}
                onChange={(e) => setReadingMode(e.target.checked)}
              />
              Modo lectura
            </label>
          </div>

          <button 
            type="button" 
            className="accessibility-reset"
            onClick={resetPreferences}
          >
            Restablecer
          </button>

          <button
            type="button"
            className="accessibility-close"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar panel de accesibilidad"
          >
            ✕
          </button>
        </div>
      )}

      <style>{`
        .accessibility-toggle {
          position: fixed;
          bottom: 100px;
          right: 24px;
          z-index: 9998;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #8f2d1f;
          color: #fff;
          border: 2px solid #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s, background 0.2s;
        }

        .accessibility-toggle:hover {
          transform: scale(1.1);
          background: #772317;
        }

        .accessibility-toggle:focus-visible {
          outline: 3px solid #FF6A00;
          outline-offset: 2px;
        }

        .accessibility-panel {
          position: fixed;
          bottom: 160px;
          right: 24px;
          z-index: 9999;
          width: 280px;
          background: #fff;
          border: 1px solid #e5d8cb;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        }

        .accessibility-panel h3 {
          margin: 0 0 16px;
          font-size: 18px;
          color: #241b17;
        }

        .accessibility-control {
          margin-bottom: 16px;
        }

        .accessibility-control label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #241b17;
        }

        .accessibility-control input[type="range"] {
          width: 100%;
          margin-bottom: 8px;
        }

        .accessibility-control input[type="checkbox"] {
          margin-right: 8px;
        }

        .accessibility-buttons {
          display: flex;
          gap: 8px;
        }

        .accessibility-buttons button {
          flex: 1;
          padding: 8px;
          border: 1px solid #e5d8cb;
          background: #f6f1eb;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
        }

        .accessibility-buttons button:hover {
          background: #e5d8cb;
        }

        .accessibility-reset {
          width: 100%;
          padding: 10px;
          background: #8f2d1f;
          color: #fff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
          margin-top: 12px;
        }

        .accessibility-reset:hover {
          background: #772317;
        }

        .accessibility-close {
          position: absolute;
          top: 12px;
          right: 12px;
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 18px;
          color: #6f6258;
          padding: 4px;
        }

        .accessibility-close:hover {
          color: #241b17;
        }

        /* Alto contraste */
        [data-contrast="high"] {
          --text: #000 !important;
          --bg: #fff !important;
          --surface: #fff !important;
        }

        [data-contrast="high"] a,
        [data-contrast="high"] button {
          text-decoration: underline !important;
        }

        /* Modo lectura */
        [data-reading-mode="true"] p,
        [data-reading-mode="true"] li {
          line-height: 1.8 !important;
          letter-spacing: 0.02em !important;
        }

        @media (max-width: 768px) {
          .accessibility-toggle {
            bottom: 90px;
            right: 16px;
            width: 48px;
            height: 48px;
          }

          .accessibility-panel {
            bottom: 145px;
            right: 16px;
            left: 16px;
            width: auto;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .accessibility-toggle,
          .accessibility-buttons button,
          .accessibility-reset {
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
}
