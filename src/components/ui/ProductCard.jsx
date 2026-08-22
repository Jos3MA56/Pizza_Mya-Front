import { Star, Heart, ShoppingCart } from "lucide-react";

/**
 * Tarjeta de producto profesional con badges, efectos hover y acciones rápidas
 */
export default function ProductCard({ 
  product, 
  onOpen, 
  onAddToCart,
  onFavorite,
  isFavorite = false
}) {
  const {
    nombre = "Producto",
    descripcion = "",
    precio_desde = 0,
    imagen_url = "",
    categoria_nombre = "",
    rating_avg = 0,
    reviews_count = 0,
    descuento = 0,
    es_nuevo = false,
    disponible = true
  } = product || {};

  const price = Number(precio_desde) || 0;
  const finalPrice = descuento > 0 ? price * (1 - descuento / 100) : price;
  const hasDiscount = descuento > 0;
  const formattedPrice = finalPrice.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });
  const originalPrice = hasDiscount ? price.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }) : null;

  const rating = Number(rating_avg) || 0;
  const reviews = Number(reviews_count) || 0;
  const hasRating = rating > 0 && reviews > 0;

  return (
    <article className="product-card-professional" data-disponible={disponible}>
      <style>{`
        .product-card-professional {
          position: relative;
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid #f3f4f6;
          display: flex;
          flex-direction: column;
        }

        .product-card-professional:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
          border-color: #e5e7eb;
        }

        .product-card-professional[data-disponible="false"] {
          opacity: 0.6;
          filter: grayscale(0.3);
        }

        .product-card-image-wrapper {
          position: relative;
          width: 100%;
          padding-top: 75%; /* Aspect ratio 4:3 */
          overflow: hidden;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        }

        .product-card-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .product-card-professional:hover .product-card-image {
          transform: scale(1.08);
        }

        .product-card-image-placeholder {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 64px;
        }

        .product-card-badges {
          position: absolute;
          top: 12px;
          left: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 2;
        }

        .product-card-badge {
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .product-card-badge-new {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #fff;
        }

        .product-card-badge-discount {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: #fff;
        }

        .product-card-actions {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 2;
          opacity: 0;
          transform: translateX(10px);
          transition: all 0.3s ease;
        }

        .product-card-professional:hover .product-card-actions {
          opacity: 1;
          transform: translateX(0);
        }

        .product-card-action-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: #fff;
          color: #111827;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .product-card-action-btn:hover {
          background: #8f2d1f;
          color: #fff;
          transform: scale(1.1);
        }

        .product-card-action-btn.favorite-active {
          background: #ef4444;
          color: #fff;
        }

        .product-card-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .product-card-category {
          font-size: 12px;
          color: #c78b47;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }

        .product-card-title {
          font-size: 18px;
          font-weight: 900;
          color: #201a17;
          margin: 0 0 8px 0;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-card-description {
          font-size: 14px;
          color: #6b625c;
          font-weight: 600;
          line-height: 1.5;
          margin: 0 0 16px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }

        .product-card-rating {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 16px;
        }

        .product-card-stars {
          display: flex;
          gap: 2px;
          color: #fbbf24;
        }

        .product-card-rating-text {
          font-size: 13px;
          color: #6b625c;
          font-weight: 700;
        }

        .product-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .product-card-price-wrapper {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .product-card-original-price {
          font-size: 13px;
          color: #9ca3af;
          text-decoration: line-through;
          font-weight: 600;
        }

        .product-card-final-price {
          font-size: 24px;
          font-weight: 950;
          color: #8f2d1f;
          line-height: 1;
        }

        .product-card-add-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #c78b47 0%, #8f2d1f 100%);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 6px 16px rgba(143, 45, 31, 0.2);
        }

        .product-card-add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(143, 45, 31, 0.3);
        }

        .product-card-add-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 640px) {
          .product-card-actions {
            opacity: 1;
            transform: translateX(0);
          }
          
          .product-card-professional:hover {
            transform: translateY(-4px);
          }
        }
      `}</style>

      {/* Imagen con badges y acciones */}
      <div className="product-card-image-wrapper">
        {imagen_url ? (
          <img 
            src={imagen_url} 
            alt={nombre}
            className="product-card-image"
            loading="lazy"
          />
        ) : (
          <div className="product-card-image-placeholder">🍕</div>
        )}

        {/* Badges */}
        {(es_nuevo || hasDiscount) && (
          <div className="product-card-badges">
            {es_nuevo && (
              <span className="product-card-badge product-card-badge-new">
                Nuevo
              </span>
            )}
            {hasDiscount && (
              <span className="product-card-badge product-card-badge-discount">
                -{descuento}%
              </span>
            )}
          </div>
        )}

        {/* Acciones rápidas */}
        <div className="product-card-actions">
          {onFavorite && (
            <button
              className={`product-card-action-btn ${isFavorite ? 'favorite-active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onFavorite(product);
              }}
              aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
              type="button"
            >
              <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          )}
          <button
            className="product-card-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              onOpen?.(product);
            }}
            aria-label="Ver detalles"
            type="button"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="product-card-body">
        {categoria_nombre && (
          <span className="product-card-category">{categoria_nombre}</span>
        )}
        
        <h3 className="product-card-title">{nombre}</h3>
        
        {descripcion && (
          <p className="product-card-description">{descripcion}</p>
        )}

        {hasRating && (
          <div className="product-card-rating">
            <div className="product-card-stars">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  fill={i < Math.floor(rating) ? "currentColor" : "none"}
                  color={i < Math.floor(rating) ? "#fbbf24" : "#d1d5db"}
                />
              ))}
            </div>
            <span className="product-card-rating-text">
              {rating.toFixed(1)} ({reviews})
            </span>
          </div>
        )}

        <div className="product-card-footer">
          <div className="product-card-price-wrapper">
            {hasDiscount && originalPrice && (
              <span className="product-card-original-price">
                {originalPrice}
              </span>
            )}
            <span className="product-card-final-price">
              {formattedPrice}
            </span>
          </div>

          <button
            className="product-card-add-btn"
            onClick={() => onAddToCart?.(product)}
            disabled={!disponible}
            type="button"
          >
            Agregar
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
