import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Slider horizontal de productos con navegación por flechas y scroll suave
 */
export default function ProductSlider({ products = [], onProductClick, onOrderProduct }) {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkArrows = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setTimeout(checkArrows, 300);
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="product-slider-container">
      <style>{`
        .product-slider-container {
          position: relative;
          width: 100%;
        }

        .product-slider-wrapper {
          position: relative;
          overflow: hidden;
        }

        .product-slider-track {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          scroll-behavior: smooth;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding: 8px 4px 24px 4px;
          scroll-snap-type: x mandatory;
        }

        .product-slider-track::-webkit-scrollbar {
          display: none;
        }

        .product-slider-item {
          flex: 0 0 calc(25% - 18px);
          min-width: 280px;
          max-width: 340px;
          scroll-snap-align: start;
        }

        .product-slider-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          display: flex;
          justify-content: space-between;
          width: 100%;
          pointer-events: none;
        }

        .product-slider-button {
          width: 48px;
          height: 48px;
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
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          opacity: 0;
          transform: scale(0.9);
        }

        .product-slider-button.visible {
          opacity: 1;
          transform: scale(1);
        }

        .product-slider-button:hover {
          background: linear-gradient(135deg, #c78b47 0%, #8f2d1f 100%);
          border-color: transparent;
          color: #fff;
          box-shadow: 0 8px 20px rgba(143, 45, 31, 0.3);
        }

        .product-card {
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          cursor: pointer;
          border: 1px solid #f3f4f6;
        }

        .product-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 40px rgba(143, 45, 31, 0.15);
        }

        .product-card-image {
          position: relative;
          width: 100%;
          height: 220px;
          overflow: hidden;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        }

        .product-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .product-card:hover .product-card-image img {
          transform: scale(1.08);
        }

        .product-card-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 6px 12px;
          background: linear-gradient(135deg, #c78b47 0%, #8f2d1f 100%);
          color: #fff;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 12px rgba(143, 45, 31, 0.3);
        }

        .product-card-body {
          padding: 20px;
        }

        .product-card-category {
          font-size: 12px;
          color: #c78b47;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 8px;
        }

        .product-card-title {
          font-size: 18px;
          font-weight: 800;
          color: #201a17;
          margin: 0 0 10px 0;
          line-height: 1.3;
        }

        .product-card-description {
          font-size: 14px;
          color: #6b625c;
          line-height: 1.5;
          margin: 0 0 16px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid #f3f4f6;
        }

        .product-card-price {
          display: flex;
          flex-direction: column;
        }

        .product-card-price small {
          font-size: 11px;
          color: #9ca3af;
          font-weight: 600;
        }

        .product-card-price strong {
          font-size: 20px;
          color: #8f2d1f;
          font-weight: 900;
        }

        .product-card-button {
          padding: 10px 20px;
          background: linear-gradient(135deg, #c78b47 0%, #8f2d1f 100%);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(143, 45, 31, 0.2);
        }

        .product-card-button:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(143, 45, 31, 0.3);
        }

        @media (max-width: 1024px) {
          .product-slider-item {
            flex: 0 0 calc(33.333% - 16px);
            min-width: 260px;
          }
        }

        @media (max-width: 768px) {
          .product-slider-item {
            flex: 0 0 calc(50% - 12px);
            min-width: 240px;
          }

          .product-card-image {
            height: 180px;
          }
        }

        @media (max-width: 480px) {
          .product-slider-item {
            flex: 0 0 calc(100% - 8px);
            min-width: 100%;
          }

          .product-slider-button {
            width: 40px;
            height: 40px;
          }
        }
      `}</style>

      {/* Botones de navegación */}
      <div className="product-slider-nav">
        <button
          className={`product-slider-button ${showLeftArrow ? 'visible' : ''}`}
          onClick={() => scroll("left")}
          aria-label="Productos anteriores"
          type="button"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          className={`product-slider-button ${showRightArrow ? 'visible' : ''}`}
          onClick={() => scroll("right")}
          aria-label="Siguientes productos"
          type="button"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Track de productos */}
      <div className="product-slider-wrapper">
        <div
          ref={scrollRef}
          className="product-slider-track"
          onScroll={checkArrows}
          role="list"
          aria-label="Lista de productos más pedidos"
        >
          {products.map((product, index) => (
            <div
              key={product?.id || product?.nombre || index}
              className="product-slider-item"
              role="listitem"
            >
              <ProductCard
                product={product}
                onClick={() => onProductClick && onProductClick(product)}
                onOrder={(e) => {
                  e.stopPropagation();
                  onOrderProduct && onOrderProduct(product);
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Tarjeta individual de producto para el slider
 */
function ProductCard({ product, onClick, onOrder }) {
  const [imageError, setImageError] = useState(false);

  const getImageUrl = () => {
    return product?.imagen_url || product?.image_url || product?.imagen || "";
  };

  const getName = () => {
    return product?.nombre || product?.producto_nombre || "Producto";
  };

  const getCategory = () => {
    return (
      product?.categoria?.nombre ||
      product?.categoria_nombre ||
      product?.categoria ||
      "Pizza Mya"
    );
  };

  const getPrice = () => {
    if (Array.isArray(product?.tamanios) && product.tamanios.length > 0) {
      const prices = product.tamanios
        .map((item) => Number(item?.precio_base || item?.precio || 0))
        .filter((p) => p > 0);
      if (prices.length) return Math.min(...prices);
    }
    return Number(product?.precio_desde || product?.precio_base || product?.precio || 0);
  };

  const formatPrice = (value) => {
    return Number(value || 0).toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    });
  };

  const isPizza = () => {
    const cat = getCategory().toLowerCase();
    const name = getName().toLowerCase();
    return cat.includes("pizza") || name.includes("pizza");
  };

  const image = getImageUrl();
  const name = getName();
  const category = getCategory();
  const price = getPrice();

  return (
    <div className="product-card" onClick={onClick} role="article" aria-label={name}>
      <div className="product-card-image">
        {image && !imageError ? (
          <img
            src={image}
            alt={name}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "64px",
            background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
          }}>
            🍕
          </div>
        )}
        <span className="product-card-badge">Más pedido</span>
      </div>
      <div className="product-card-body">
        <div className="product-card-category">{category}</div>
        <h3 className="product-card-title">{isPizza() ? `Pizza ${name}` : name}</h3>
        <p className="product-card-description">
          {product?.descripcion || "Una opción deliciosa para compartir."}
        </p>
        <div className="product-card-footer">
          <div className="product-card-price">
            <small>Desde</small>
            <strong>{formatPrice(price)}</strong>
          </div>
          <button 
            className="product-card-button" 
            onClick={onOrder}
            type="button"
          >
            Ordenar
          </button>
        </div>
      </div>
    </div>
  );
}
