import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HeroCarousel = ({ slides = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const nextSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsAnimating(false), 500);
  }, [slides.length, isAnimating]);

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToSlide = (index) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Auto-play
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  if (!slides || slides.length === 0) return null;

  return (
    <section 
      className="hero-carousel-section"
      aria-label="Carrusel de promociones"
      role="region"
    >
      <style>{`
        .hero-carousel-section {
          position: relative;
          width: 100%;
          height: 500px;
          overflow: hidden;
          background: #1a1a1a;
        }
        
        @media (min-width: 768px) {
          .hero-carousel-section {
            height: 600px;
          }
        }
        
        .hero-slides-container {
          position: relative;
          width: 100%;
          height: 100%;
        }
        
        .hero-slide {
          position: absolute;
          inset: 0;
          transition: opacity 0.5s ease-in-out;
        }
        
        .hero-slide.active {
          opacity: 1;
          z-index: 10;
        }
        
        .hero-slide.inactive {
          opacity: 0;
          z-index: 0;
        }
        
        .hero-slide-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
        }
        
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, transparent 100%);
        }
        
        .hero-content {
          position: relative;
          height: 100%;
          display: flex;
          align-items: center;
          padding: 0 16px;
        }
        
        @media (min-width: 640px) {
          .hero-content {
            padding: 0 24px;
          }
        }
        
        @media (min-width: 1024px) {
          .hero-content {
            padding: 0 32px;
          }
        }
        
        .hero-text-wrapper {
          max-width: 800px;
          color: white;
        }
        
        .hero-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          line-height: 1.1;
          transition: all 0.5s ease;
        }
        
        @media (min-width: 640px) {
          .hero-title {
            font-size: 3.5rem;
          }
        }
        
        @media (min-width: 768px) {
          .hero-title {
            font-size: 4rem;
          }
        }
        
        .hero-subtitle {
          font-size: 1.125rem;
          margin-bottom: 2rem;
          transition: all 0.5s ease 0.1s;
        }
        
        @media (min-width: 640px) {
          .hero-subtitle {
            font-size: 1.5rem;
          }
        }
        
        @media (min-width: 768px) {
          .hero-subtitle {
            font-size: 1.75rem;
          }
        }
        
        .hero-cta {
          display: inline-block;
          background: #9b2118;
          color: white;
          font-weight: 700;
          padding: 12px 32px;
          border-radius: 9999px;
          text-decoration: none;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }
        
        .hero-cta:hover {
          background: #78170f;
          transform: scale(1.05);
        }
        
        .hero-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(4px);
          padding: 12px;
          border-radius: 9999px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .hero-nav-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        .hero-nav-btn:focus {
          outline: none;
          ring: 2px solid white;
        }
        
        .hero-prev-btn {
          left: 16px;
        }
        
        .hero-next-btn {
          right: 16px;
        }
        
        .hero-dots {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          display: flex;
          gap: 12px;
        }
        
        .hero-dot {
          width: 12px;
          height: 12px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.5);
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .hero-dot:hover {
          background: rgba(255, 255, 255, 0.7);
        }
        
        .hero-dot.active {
          background: white;
          width: 32px;
        }
        
        .hero-dot:focus {
          outline: none;
          ring: 2px solid white;
        }
        
        /* Animation classes */
        .slide-enter {
          transform: translateY(32px);
          opacity: 0;
        }
        
        .slide-enter-active {
          transform: translateY(0);
          opacity: 1;
        }
        
        .slide-exit {
          transform: translateY(0);
          opacity: 1;
        }
        
        .slide-exit-active {
          transform: translateY(-32px);
          opacity: 0;
        }
      `}</style>

      <div className="hero-slides-container">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`hero-slide ${index === currentIndex ? 'active' : 'inactive'}`}
            aria-hidden={index !== currentIndex}
          >
            {/* Background Image */}
            <div
              className="hero-slide-bg"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              {/* Overlay gradient */}
              <div className="hero-overlay" />
            </div>

            {/* Content */}
            <div className="hero-content">
              <div className="hero-text-wrapper">
                <h1 
                  className={`hero-title ${index === currentIndex ? 'slide-enter-active' : 'slide-enter'}`}
                >
                  {slide.title}
                </h1>
                <p 
                  className={`hero-subtitle ${index === currentIndex ? 'slide-enter-active' : 'slide-enter'}`}
                >
                  {slide.subtitle}
                </p>
                <a
                  href={slide.link}
                  className={`hero-cta ${index === currentIndex ? 'slide-enter-active' : 'slide-enter'}`}
                >
                  {slide.cta}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="hero-nav-btn hero-prev-btn"
            aria-label="Diapositiva anterior"
          >
            <ChevronLeft size={24} color="white" />
          </button>
          <button
            onClick={nextSlide}
            className="hero-nav-btn hero-next-btn"
            aria-label="Siguiente diapositiva"
          >
            <ChevronRight size={24} color="white" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="hero-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`hero-dot ${index === currentIndex ? 'active' : ''}`}
              aria-label={`Ir a la diapositiva ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : 'false'}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroCarousel;
