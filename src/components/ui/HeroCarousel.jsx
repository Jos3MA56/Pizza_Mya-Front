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
      className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-gray-900"
      aria-label="Carrusel de promociones"
      role="region"
    >
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            aria-hidden={index !== currentIndex}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative h-full flex items-center">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl text-white">
                  <h1 
                    className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-4 transform transition-all duration-500 ${
                      index === currentIndex ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    }`}
                  >
                    {slide.title}
                  </h1>
                  <p 
                    className={`text-lg sm:text-xl md:text-2xl mb-8 transform transition-all duration-500 delay-100 ${
                      index === currentIndex ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    }`}
                  >
                    {slide.subtitle}
                  </p>
                  <a
                    href={slide.link}
                    className={`inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-full transform transition-all duration-500 delay-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                      index === currentIndex ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    }`}
                  >
                    {slide.cta}
                  </a>
                </div>
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
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Diapositiva anterior"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Siguiente diapositiva"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
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
