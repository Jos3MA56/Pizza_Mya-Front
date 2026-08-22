import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Pizza,
  Star,
  UserRoundPlus,
  X,
} from "lucide-react";

function normalizeText(value, fallback = "No disponible") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function useReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return ref;
}

export function Reveal({ children, className = "", delay = 0 }) {
  const ref = useReveal();

  return (
    <div
      ref={ref}
      className={`pmya-reveal ${className}`.trim()}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function WelcomeModal({ open, onClose, businessName, onRegister }) {
  if (!open) return null;

  return (
    <div className="pmya-modalOverlay" onClick={onClose}>
      <div
        className="pmya-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button className="pmya-modalClose" type="button" onClick={onClose}>
          <X size={18} />
        </button>
        <div className="pmya-modalIcon">
          <Pizza size={30} />
        </div>
        <h2>Bienvenido a {normalizeText(businessName, "Pizza Mya")}</h2>
        <p>
          Disfruta promociones, pedido rápido y una experiencia más fácil para
          ordenar en línea.
        </p>
        <div className="pmya-modalPromo">
          <UserRoundPlus size={18} />
          <span>Regístrate y recibe 20% de descuento en tu primer pedido.</span>
        </div>
        <div className="pmya-modalActions">
          <button
            className="pmya-btn pmya-btn-primary"
            type="button"
            onClick={onRegister}
          >
            Crear cuenta
          </button>
          <button
            className="pmya-btn pmya-btn-dark"
            type="button"
            onClick={onClose}
          >
            Seguir viendo
          </button>
        </div>
      </div>
    </div>
  );
}

export function GalleryPreviewCard({ item, onOpen }) {
  return (
    <button
      type="button"
      className="pmya-galleryCard"
      onClick={() => onOpen?.(item)}
    >
      <img
        className="pmya-galleryImg"
        src={item?.imagen_url}
        alt={item?.titulo || "Imagen de la galería"}
        loading="lazy"
      />
      <div className="pmya-galleryBody">
        <strong>{normalizeText(item?.titulo, "Pizza Mya")}</strong>
        <span>
          {normalizeText(
            item?.descripcion,
            "Conoce más del ambiente y el negocio.",
          )}
        </span>
      </div>
    </button>
  );
}

export function ReviewCard({ item }) {
  const rating = Math.max(1, Math.min(5, Number(item?.calificacion || 5)));
  const nombre = normalizeText(item?.nombre, "Cliente");
  const comentario = normalizeText(item?.comentario, "Sin comentario");

  return (
    <article className="pmya-reviewCard">
      <div className="pmya-reviewStars" aria-label={`${rating} de 5 estrellas`}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            size={16}
            fill={index < rating ? "currentColor" : "none"}
            style={{ opacity: index < rating ? 1 : 0.28 }}
          />
        ))}
      </div>
      <p>{comentario}</p>
      <strong>{nombre}</strong>
    </article>
  );
}

export function PromoCarousel({
  slides,
  currentIndex,
  onPrev,
  onNext,
  onGoTo,
  onPause,
  onResume,
  onPrimaryAction,
  onSecondaryAction,
  onTouchStart,
  onTouchEnd,
  onKeyDown,
  businessStatus,
}) {
  const active = slides[currentIndex] || slides[0] || null;
  const hasMultiple = slides.length > 1;
  const [imageFailed, setImageFailed] = useState(false);
  const [imageTone, setImageTone] = useState("220, 38, 38");

  useEffect(() => {
    setImageFailed(false);
  }, [active?.imagen_url, currentIndex]);

  useEffect(() => {
    let cancelled = false;
    if (!active?.imagen_url) {
      setImageTone("220, 38, 38");
      return undefined;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const size = 24;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          if (!cancelled) setImageTone("220, 38, 38");
          return;
        }

        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        let r = 0;
        let g = 0;
        let b = 0;
        let total = 0;

        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha < 120) continue;

          const red = data[i];
          const green = data[i + 1];
          const blue = data[i + 2];

          const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
          if (luminance < 18 || luminance > 245) continue;

          r += red;
          g += green;
          b += blue;
          total += 1;
        }

        if (!total) {
          for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            total += 1;
          }
        }

        const nextTone = total
          ? `${Math.round(r / total)}, ${Math.round(g / total)}, ${Math.round(b / total)}`
          : "220, 38, 38";

        if (!cancelled) setImageTone(nextTone);
      } catch {
        if (!cancelled) setImageTone("220, 38, 38");
      }
    };

    img.onerror = () => {
      if (!cancelled) setImageTone("220, 38, 38");
    };

    img.src = active.imagen_url;

    return () => {
      cancelled = true;
    };
  }, [active?.imagen_url]);

  const heroStyle = {
    background: `
      radial-gradient(circle at 12% 18%, rgba(${imageTone}, 0.34), rgba(${imageTone}, 0) 38%),
      linear-gradient(100deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.70) 36%, rgba(0,0,0,0.34) 68%, rgba(${imageTone}, 0.22) 100%),
      #111111
    `,
  };

  const glowStyle = {
    background: `radial-gradient(circle, rgba(${imageTone}, 0.38) 0%, rgba(${imageTone}, 0.12) 34%, rgba(${imageTone}, 0) 72%)`,
  };

  return (
    <section className="pmya-heroWrap">
      <div className="pmya-heroBackground">
        <div
          className="pmya-carouselHero"
          style={heroStyle}
          onMouseEnter={onPause}
          onMouseLeave={onResume}
          onFocus={onPause}
          onBlur={onResume}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onKeyDown={onKeyDown}
          tabIndex={0}
          aria-label="Promociones destacadas"
        >
          {active?.imagen_url && !imageFailed ? (
            <>
              <img
                src={active.imagen_url}
                alt=""
                aria-hidden="true"
                className="pmya-carouselHeroBackdropImage"
                onError={() => setImageFailed(true)}
              />
              <div className="pmya-carouselHeroBackdropShade" />
            </>
          ) : null}

          {hasMultiple ? (
            <>
              <button
                className="pmya-carouselArrow pmya-carouselArrow-left"
                type="button"
                onClick={onPrev}
                aria-label="Promoción anterior"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                className="pmya-carouselArrow pmya-carouselArrow-right"
                type="button"
                onClick={onNext}
                aria-label="Siguiente promoción"
              >
                <ChevronRight size={28} />
              </button>
            </>
          ) : null}

          {hasMultiple ? (
            <div className="pmya-carouselCounter" aria-hidden="true">
              {currentIndex + 1} / {slides.length}
            </div>
          ) : null}

          <div className="pmya-carouselHeroGrid">
            <div className="pmya-carouselHeroContent">
              <span className="pmya-promoTag">PROMOCIONES</span>
              <h1 className="pmya-carouselHeroTitle">
                {normalizeText(active?.titulo, "Promoción especial")}
              </h1>
              <p className="pmya-carouselHeroText">
                {normalizeText(
                  active?.descripcion,
                  "Descubre una promoción pensada para pedir rápido y disfrutar más.",
                )}
              </p>

              <div className="pmya-heroBottomActions">
                <button
                  className="pmya-btn pmya-btn-whiteSolid"
                  type="button"
                  onClick={onPrimaryAction}
                >
                  Ordenar ahora
                  <ArrowRight size={20} />
                </button>
                <button
                  className="pmya-btn pmya-btn-linkLight"
                  type="button"
                  onClick={onSecondaryAction}
                >
                  Ver menú <ArrowRight size={18} />
                </button>
              </div>
            </div>

            <div className="pmya-carouselHeroMedia">
              <div className="pmya-carouselHeroGlow" style={glowStyle} />
              {active?.imagen_url && !imageFailed ? (
                <img
                  src={active.imagen_url}
                  alt={active?.titulo || "Promoción"}
                  className="pmya-carouselHeroImage"
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <div className="pmya-carouselFallback">
                  <div>
                    <Pizza size={120} />
                    <div className="pmya-carouselFallbackText">
                      {normalizeText(active?.titulo, "Promoción especial")}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {hasMultiple ? (
            <div className="pmya-carouselDots pmya-carouselDots-overlay">
              {slides.map((item, index) => (
                <button
                  key={`${item?.titulo || "slide"}-${index}`}
                  type="button"
                  className={`pmya-carouselDot ${
                    index === currentIndex ? "is-active" : ""
                  }`}
                  onClick={() => onGoTo(index)}
                  aria-label={`Ir a promoción ${index + 1}`}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="pmya-heroBottom">
          <div className="pmya-heroBadges">
            <span className="pmya-orderBadge">✨ ¡ORDENA AHORA!</span>
            <span
              className={`pmya-orderBadge pmya-orderBadge-status ${
                businessStatus?.isOpen ? "is-open" : "is-closed"
              }`}
            >
              {businessStatus?.label || "Estado no disponible"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
