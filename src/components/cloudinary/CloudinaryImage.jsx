// src/components/cloudinary/CloudinaryImage.jsx
/**
 * Componente para mostrar imágenes alojadas en Cloudinary.
 * Soporta transformaciones básicas (ancho, alto, calidad, crop)
 * y un fallback automático si la imagen no carga.
 *
 * Props:
 *   src          {string}  URL completa de Cloudinary o publicId
 *   alt          {string}  Texto alternativo
 *   width        {number}  Ancho deseado (px) — se aplica como transformación Cloudinary
 *   height       {number}  Alto deseado (px)
 *   quality      {number}  Calidad 1–100 (default: 80)
 *   crop         {string}  Modo de recorte (default: "fill")
 *   fallback     {string}  URL o ruta local si la imagen falla
 *   className    {string}
 *   style        {object}
 */
export default function CloudinaryImage({
  src,
  alt = "",
  width,
  height,
  quality = 80,
  crop = "fill",
  fallback = null,
  className,
  style,
  ...rest
}) {
  if (!src) {
    return fallback ? (
      <img
        src={fallback}
        alt={alt}
        className={className}
        style={style}
        {...rest}
      />
    ) : null;
  }

  // Si la URL ya viene completa de Cloudinary, intentar inyectar transformaciones
  let resolvedSrc = src;

  if (src.includes("res.cloudinary.com") && (width || height)) {
    // Insertar transformación antes de "/upload/"
    const transforms = [
      `q_${quality}`,
      `c_${crop}`,
      width ? `w_${width}` : null,
      height ? `h_${height}` : null,
    ]
      .filter(Boolean)
      .join(",");

    resolvedSrc = src.replace("/upload/", `/upload/${transforms}/`);
  }

  const handleError = (e) => {
    if (fallback && e.currentTarget.src !== fallback) {
      e.currentTarget.src = fallback;
    } else {
      e.currentTarget.style.display = "none";
    }
  };

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      onError={handleError}
      loading="lazy"
      {...rest}
    />
  );
}
