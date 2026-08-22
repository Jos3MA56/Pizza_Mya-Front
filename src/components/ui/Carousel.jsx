import { useEffect, useState, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Circle } from "lucide-react";

/**
 * Carrusel profesional con soporte para touch, autoplay y accesibilidad
 * @param {Array} slides - Array de objetos con imagen, titulo, descripcion, cta
 * @param {number} autoplayDelay - Tiempo en ms entre slides (0 para desactivar)
 * @param {function} onSlideChange - Callback cuando cambia el slide
 */
export default function Carousel({ 
  slides = [], 
  autoplayDelay = 6000,
  onSlideChange 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const timerRef = useRef(null);
  const carouselRef = useRef(null);

  const totalSlides = slides.length;

  // Ir al siguiente slide
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  // Ir al slide anterior
  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Ir a un slide específico
  const goToSlide = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  // Notificar cambio de slide
  useEffect(() => {
    if (onSlideChange) {
      onSlideChange(currentIndex);
    }
  }, [currentIndex, onSlideChange]);

  // Autoplay
  useEffect(() => {
    if (autoplayDelay > 0 && !isPaused && totalSlides > 1) {
      timerRef.current = setInterval(nextSlide, autoplayDelay);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [autoplayDelay, isPaused, totalSlides, nextSlide]);

  // Manejo de touch para móviles
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsPaused(true);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    setIsPaused(false);
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  // Navegación con teclado
  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      prevSlide();
    } else if (e.key === "ArrowRight") {
      nextSlide();
    }
  };

  if (!slides || slides.length === 0) {
    return null;
  }

  const currentSlide = slides[currentIndex];

  return (
    <div 
      className="carousel-container"
      ref={carouselRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Carrusel de promociones"
      role="region"
      aria-roledescription="carrusel"
    >
      <style>{`
        .carousel-container {
          position: relative;
          width: 100%;
          overflow: hidden;
          border-radius: 24px;
          background: linear-gradient(135deg, #fffaf5 0%, #fff 100%);
          box-shadow: 0 20px 60px rgba(143, 45, 31, 0.12);
        }

        .carousel-track {
          display: flex;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
        }

        .carousel-slide {
          min-width: 100%;
          position: relative;
        }

        .carousel-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          min-height: 500px;
        }

        .carousel-text {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 50px;
          background: linear-gradient(135deg, rgba(255, 250, 245, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%);
          z-index: 2;
        }

        .carousel-badge {
          display: inline-flex;
          align-items: center;
          padding: 8px 16px;
          background: linear-gradient(135deg, #c78b47 0%, #8f2d1f 100%);
          color: #fff;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          width: fit-content;
          margin-bottom: 20px;
          box-shadow: 0 8px 20px rgba(199, 139, 71, 0.3);
        }

        .carousel-title {
          font-size: clamp(32px, 5vw, 52px);
          font-weight: 950;
          line-height: 1.1;
          color: #201a17;
          margin: 0 0 20px 0;
        }

        .carousel-description {
          font-size: clamp(16px, 2vw, 19px);
          color: #6b625c;
          font-weight: 600;
          line-height: 1.6;
          margin: 0 0 32px 0;
        }

        .carousel-actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }

        .carousel-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 32px;
          background: linear-gradient(135deg, #c78b47 0%, #8f2d1f 100%);
          color: #fff;
          border: none;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 25px rgba(143, 45, 31, 0.25);
        }

        .carousel-btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(143, 45, 31, 0.35);
        }

        .carousel-btn-secondary {
          display: inline-flex;
          align-items: center;
          padding: 16px 32px;
          background: transparent;
          color: #8f2d1f;
          border: 2px solid #eadfd4;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .carousel-btn-secondary:hover {
          background: #fffaf5;
          border-color: #c78b47;
        }

        .carousel-image-wrapper {
          position: relative;
          overflow: hidden;
          background: #f8fafc;
        }

        .carousel-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .carousel-image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          font-size: 120px;
        }

        .carousel-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          display: flex;
          justify-content: space-between;
          width: 100%;
          padding: 0 20px;
          pointer-events: none;
        }

        .carousel-nav-button {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid #e5e7eb;
          color: #111827;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          pointer-events: auto;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .carousel-nav-button:hover {
          background: #8f2d1f;
          border-color: #8f2d1f;
          color: #fff;
          transform: scale(1.1);
        }

        .carousel-indicators {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          display: flex;
          gap: 10px;
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 999px;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .carousel-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid #c78b47;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
        }

        .carousel-indicator.active {
          background: #c78b47;
          transform: scale(1.2);
        }

        .carousel-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 4px;
          background: linear-gradient(90deg, #c78b47 0%, #8f2d1f 100%);
          transition: width 0.3s ease;
        }

        @media (max-width: 1024px) {
          .carousel-content {
            grid-template-columns: 1fr;
          }

          .carousel-text {
            padding: 40px 30px;
            text-align: center;
            order: 2;
          }

          .carousel-badge {
            margin: 0 auto 20px auto;
          }

          .carousel-actions {
            justify-content: center;
          }

          .carousel-image-wrapper {
            height: 300px;
            order: 1;
          }

          .carousel-container {
            min-height: auto;
          }
        }

        @media (max-width: 640px) {
          .carousel-text {
            padding: 30px 20px;
          }

          .carousel-nav {
            padding: 0 10px;
          }

          .carousel-nav-button {
            width: 40px;
            height: 40px;
          }

          .carousel-indicators {
            bottom: 15px;
          }

          .carousel-image-wrapper {
            height: 250px;
          }
        }
      `}</style>

      {/* Track de slides */}
      <div 
        className="carousel-track"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {slides.map((slide, index) => (
          <div 
            key={slide.id || index} 
            className="carousel-slide"
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} de ${totalSlides}`}
            aria-hidden={index !== currentIndex}
          >
            <div className="carousel-content">
              {/* Contenido de texto */}
              <div className="carousel-text">
                {slide.etiqueta && (
                  <span className="carousel-badge">{slide.etiqueta}</span>
                )}
                <h2 className="carousel-title">{slide.titulo}</h2>
                <p className="carousel-description">{slide.descripcion}</p>
                <div className="carousel-actions">
                  {slide.cta && (
                    <button 
                      className="carousel-btn-primary"
                      onClick={slide.onPrimaryClick}
                      type="button"
                    >
                      {slide.cta}
                      <ChevronRight size={18} />
                    </button>
                  )}
                  {slide.secondaryCta && (
                    <button 
                      className="carousel-btn-secondary"
                      onClick={slide.onSecondaryClick}
                      type="button"
                    >
                      {slide.secondaryCta}
                    </button>
                  )}
                </div>
              </div>

              {/* Imagen */}
              <div className="carousel-image-wrapper">
                {slide.imagen_url ? (
                  <img 
                    src={slide.imagen_url} 
                    alt={slide.titulo}
                    className="carousel-image"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                ) : (
                  <div className="carousel-image-placeholder">
                    🍕
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botones de navegación */}
      {totalSlides > 1 && (
        <div className="carousel-nav">
          <button 
            className="carousel-nav-button"
            onClick={prevSlide}
            aria-label="Slide anterior"
            type="button"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            className="carousel-nav-button"
            onClick={nextSlide}
            aria-label="Siguiente slide"
            type="button"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}

      {/* Indicadores */}
      {totalSlides > 1 && (
        <div className="carousel-indicators" role="tablist" aria-label="Navegación del carrusel">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`carousel-indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Ir al slide ${index + 1}`}
              aria-selected={index === currentIndex}
              role="tab"
              type="button"
            />
          ))}
        </div>
      )}

      {/* Barra de progreso */}
      {autoplayDelay > 0 && totalSlides > 1 && (
        <div 
          className="carousel-progress" 
          style={{ width: `${((currentIndex + 1) / totalSlides) * 100}%` }}
        />
      )}
    </div>
  );
}
