import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Images,
  MapPin,
  MessageCircle,
  Phone,
  Pizza,
  ShoppingCart,
  Star,
  Store,
  Truck,
  Utensils,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CarritoContext.jsx";
import { buildApiUrl, httpJson } from "../../api/http.js";
import { catalogApi } from "../../api/catalogo.api.js";
import { combosApi } from "../../api/combos.api.js";
import Carousel from "../../components/ui/Carousel.jsx";
import ProductSlider from "../../components/ui/ProductSlider.jsx";
import HeroCarousel from "../../components/ui/HeroCarousel.jsx";
import ProductCard from "../../components/ui/ProductCard.jsx";
import CategoryCard from "../../components/ui/CategoryCard.jsx";
import { carouselSlides, featuredProducts, categories } from "../../data/homeData.js";

const FALLBACK_PROMOS = [
  {
    titulo: "Pizzas recién preparadas",
    descripcion:
      "Elige una especialidad, personaliza tu pizza y termina tu pedido en pocos pasos.",
    etiqueta: "Menú",
    cta: "Ver menú",
    imagen_url: "",
  },
  {
    titulo: "Combos para compartir",
    descripcion:
      "Opciones completas para familia, amigos o reuniones sin complicarte.",
    etiqueta: "Combos",
    cta: "Ver combos",
    imagen_url: "",
  },
  {
    titulo: "Pide fácil desde la web",
    descripcion:
      "Selecciona entrega a domicilio o recoger y revisa tu pedido antes de confirmar.",
    etiqueta: "Pedido en línea",
    cta: "Ordenar ahora",
    imagen_url: "",
  },
];

const CATEGORY_CARDS = [
  {
    title: "Pizzas",
    text: "Especialidades y sabores clásicos.",
    icon: "🍕",
    to: "/catalogo",
  },
  {
    title: "Combos",
    text: "Paquetes para compartir.",
    icon: "🔥",
    to: "/combos",
  },
  {
    title: "Bebidas",
    text: "Opciones para acompañar.",
    icon: "🥤",
    to: "/catalogo",
  },
  {
    title: "Complementos",
    text: "Papas, alitas y antojos.",
    icon: "🍟",
    to: "/catalogo",
  },
];

const ORDER_STEPS = [
  {
    title: "Elige",
    text: "Revisa pizzas, combos y complementos.",
    icon: <Pizza size={20} />,
  },
  {
    title: "Personaliza",
    text: "Selecciona tamaño, masa, salsa, orilla y extras.",
    icon: <Utensils size={20} />,
  },
  {
    title: "Confirma",
    text: "Elige entrega o recoger y finaliza el pedido.",
    icon: <ShoppingCart size={20} />,
  },
];

function normalizeText(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.rows)) return value.rows;
  return [];
}

function money(value) {
  return Number(value || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });
}

function sanitizePhone(value) {
  return String(value ?? "").replace(/\D+/g, "");
}

function buildWhatsAppUrl(phone, text) {
  const cleanPhone = sanitizePhone(phone);
  if (!cleanPhone) return "";
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

function buildMapsUrl(address) {
  const text = normalizeText(address);
  if (!text) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(text)}`;
}

function parseTimeToMinutes(value) {
  const raw = String(value ?? "").trim();

  // Acepta 12:00 y también 12:00:00
  const match = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);

  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return hours * 60 + minutes;
}

function formatScheduleTime(value, fallback = "--:--") {
  const raw = String(value ?? "").trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);

  if (!match) return fallback;

  return `${String(match[1]).padStart(2, "0")}:${match[2]}`;
}

function getStoreStatus(config) {
  const openMin = parseTimeToMinutes(config?.hora_apertura);
  const closeMin = parseTimeToMinutes(config?.hora_cierre);

  const schedule = `${formatScheduleTime(
    config?.hora_apertura,
    "12:00",
  )} - ${formatScheduleTime(config?.hora_cierre, "23:00")}`;

  // Si no hay horario bien configurado, no bloqueamos visualmente
  if (openMin === null || closeMin === null) {
    return {
      isOpen: true,
      label: "Abierto",
      schedule,
    };
  }

  // Si apertura y cierre son iguales, se toma como 24 horas
  if (openMin === closeMin) {
    return {
      isOpen: true,
      label: "Abierto todo el día",
      schedule,
    };
  }

  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();

  const isOpen =
    closeMin > openMin
      ? currentMin >= openMin && currentMin < closeMin
      : currentMin >= openMin || currentMin < closeMin;

  return {
    isOpen,
    label: isOpen ? "Abierto" : "Cerrado",
    schedule,
  };
}

function parsePromos(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function getProductImage(product) {
  return (
    product?.imagen_url ||
    product?.image_url ||
    product?.imagen ||
    product?.foto_url ||
    ""
  );
}

function getProductName(product) {
  return normalizeText(product?.nombre || product?.producto_nombre, "Producto");
}

function getProductCategoryName(product) {
  return normalizeText(
    product?.categoria?.nombre ||
      product?.categoria_nombre ||
      product?.categoriaNombre ||
      product?.categoria,
  );
}

function getProductPrice(product) {
  if (Array.isArray(product?.tamanios) && product.tamanios.length > 0) {
    const prices = product.tamanios
      .map((item) => Number(item?.precio_base || item?.precio || 0))
      .filter((item) => item > 0);
    if (prices.length) return Math.min(...prices);
  }

  return Number(
    product?.precio_desde || product?.precio_base || product?.precio || 0,
  );
}

function isPizza(product) {
  const cat = getProductCategoryName(product).toLowerCase();
  const name = getProductName(product).toLowerCase();
  return cat.includes("pizza") || name.includes("pizza");
}

function normalizeProductBaseName(name = "") {
  return String(name || "")
    .replace(/\(\s*(individual|mediana|grande|jumbo).*?\)/gi, "")
    .replace(/\b(individual|mediana|grande|jumbo)\b\s*\d{0,2}\s*"?/gi, "")
    .replace(/^pizza\s+/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function uniqueFeaturedProducts(products = []) {
  const grouped = new Map();

  for (const product of toArray(products)) {
    if (product?.activo === false || product?.disponible === false) continue;

    const name = getProductName(product);
    const groupKey = isPizza(product)
      ? `pizza:${normalizeProductBaseName(name).toLowerCase()}`
      : `product:${name.toLowerCase()}`;

    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, {
        ...product,
        nombre: isPizza(product)
          ? `Pizza ${normalizeProductBaseName(name)}`.replace(/\s{2,}/g, " ")
          : name,
        precio_desde: getProductPrice(product),
        imagen_url: getProductImage(product),
      });
      continue;
    }

    const current = grouped.get(groupKey);
    const currentPrice = Number(current?.precio_desde || 0);
    const nextPrice = getProductPrice(product);

    grouped.set(groupKey, {
      ...current,
      precio_desde:
        currentPrice && nextPrice
          ? Math.min(currentPrice, nextPrice)
          : currentPrice || nextPrice,
      imagen_url: current?.imagen_url || getProductImage(product),
    });
  }

  return Array.from(grouped.values()).slice(0, 6);
}

function getProductRating(product) {
  const avg = Number(
    product?.rating_avg ||
      product?.calificacion_promedio ||
      product?.promedio_rating ||
      product?.promedio_calificacion ||
      0,
  );
  const count = Number(
    product?.reviews_count ||
      product?.total_resenas ||
      product?.total_comentarios ||
      product?.calificaciones_count ||
      0,
  );
  if (!avg || avg <= 0 || !count || count <= 0) return null;
  return { avg: Math.min(5, Math.max(0, avg)), count };
}

async function getPublicConfig() {
  try {
    const data = await httpJson(buildApiUrl("/api/configuracion"));
    return data || null;
  } catch {
    return null;
  }
}

async function getPublicGallery() {
  try {
    const data = await httpJson(buildApiUrl("/api/galeria"));
    return toArray(data);
  } catch {
    return [];
  }
}

function ImageFallback({ icon = "🍕", label = "Pizza Mya" }) {
  return (
    <div className="homec-imageFallback" aria-label={label}>
      <span>{icon}</span>
    </div>
  );
}

function SectionHeader({ eyebrow, title, text, actionLabel, onAction }) {
  return (
    <div className="homec-sectionHeader" data-homec-reveal>
      <div>
        {eyebrow ? <span className="homec-eyebrow">{eyebrow}</span> : null}
        <h2>{title}</h2>
        {text ? <p>{text}</p> : null}
      </div>
      {actionLabel ? (
        <button className="homec-textButton" type="button" onClick={onAction}>
          {actionLabel}
          <ArrowRight size={16} />
        </button>
      ) : null}
    </div>
  );
}

function PromoCarousel({
  promos,
  activeIndex,
  setActiveIndex,
  onPrimary,
  onSecondary,
}) {
  const total = promos.length;
  const active = promos[activeIndex] || promos[0] || FALLBACK_PROMOS[0];
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [activeIndex]);

  useEffect(() => {
    if (total <= 1) return undefined;
    const timer = window.setInterval(
      () => setActiveIndex((prev) => (prev + 1) % total),
      7000,
    );
    return () => window.clearInterval(timer);
  }, [setActiveIndex, total]);

  const next = () => setActiveIndex((p) => (p + 1) % total);
  const prev = () => setActiveIndex((p) => (p - 1 + total) % total);

  return (
    <article className="homec-promoCard" data-homec-reveal>
      <div className="homec-promoText">
        <span>{normalizeText(active?.etiqueta, "Promoción")}</span>
        <h2>{normalizeText(active?.titulo, "Promoción especial")}</h2>
        <p>
          {normalizeText(
            active?.descripcion,
            "Revisa promociones, combos y productos disponibles.",
          )}
        </p>
        <div className="homec-promoActions">
          <button
            className="homec-btn homec-btnPrimary"
            type="button"
            onClick={onPrimary}
          >
            {normalizeText(active?.cta, "Ordenar")}
            <ArrowRight size={16} />
          </button>
          <button
            className="homec-btn homec-btnSecondary"
            type="button"
            onClick={onSecondary}
          >
            Ver menú
          </button>
        </div>
      </div>

      <div className="homec-promoMedia">
        {active?.imagen_url && !imageError ? (
          <img
            src={active.imagen_url}
            alt={normalizeText(active?.titulo, "Promoción")}
            onError={() => setImageError(true)}
          />
        ) : (
          <ImageFallback icon="🍕" label="Promoción Pizza Mya" />
        )}
        {total > 1 ? (
          <div className="homec-promoControls">
            <button
              type="button"
              onClick={prev}
              aria-label="Promoción anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <span>
              {activeIndex + 1} / {total}
            </span>
            <button
              type="button"
              onClick={next}
              aria-label="Promoción siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function ProductCard({ product, onOpen, onOrder }) {
  const [imageError, setImageError] = useState(false);
  const name = getProductName(product);
  const price = Number(product?.precio_desde || getProductPrice(product));
  const image = product?.imagen_url || getProductImage(product);
  const rating = getProductRating(product);

  return (
    <article className="homec-productCard" data-homec-reveal>
      <button className="homec-productImage" type="button" onClick={onOpen}>
        {image && !imageError ? (
          <img
            src={image}
            alt={name}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <ImageFallback icon="🍕" label={name} />
        )}
      </button>
      <div className="homec-productBody">
        <div className="homec-productMeta">
          <span>{getProductCategoryName(product) || "Pizza Mya"}</span>
          {rating ? (
            <span className="homec-ratingMini">
              <Star size={13} fill="currentColor" />
              {rating.avg.toFixed(1)} · {rating.count}
            </span>
          ) : null}
        </div>
        <h3>{name}</h3>
        <p>
          {normalizeText(
            product?.descripcion,
            "Una opción preparada para compartir.",
          )}
        </p>
        <div className="homec-productFooter">
          <div>
            <small>Desde</small>
            <strong>{money(price)}</strong>
          </div>
          <button type="button" onClick={onOrder}>
            Ver
          </button>
        </div>
      </div>
    </article>
  );
}

function ComboCard({ combo, onOpen }) {
  const [imageError, setImageError] = useState(false);
  const name = normalizeText(combo?.nombre, "Combo especial");
  const image = combo?.imagen_url || combo?.image_url || "";
  const price = Number(combo?.precio_combo || combo?.precio || 0);

  return (
    <article className="homec-comboCard" data-homec-reveal>
      <div className="homec-comboImage">
        {image && !imageError ? (
          <img
            src={image}
            alt={name}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <ImageFallback icon="🔥" label={name} />
        )}
      </div>
      <div>
        <span>Combo</span>
        <h3>{name}</h3>
        <p>
          {normalizeText(
            combo?.descripcion,
            "Una opción práctica para compartir.",
          )}
        </p>
        <button type="button" onClick={onOpen}>
          {price > 0 ? money(price) : "Ver combo"}
          <ArrowRight size={15} />
        </button>
      </div>
    </article>
  );
}

function InfoItem({ icon, title, text }) {
  return (
    <article className="homec-infoItem" data-homec-reveal>
      <div>{icon}</div>
      <strong>{title}</strong>
      <span>{text}</span>
    </article>
  );
}

function useHomeReveal(refreshKey) {
  useEffect(() => {
    const root = document.querySelector(".homec");
    if (!root) return undefined;

    const nodes = Array.from(root.querySelectorAll("[data-homec-reveal]"));
    if (!nodes.length) return undefined;

    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;

    if (reduceMotion) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return undefined;
    }

    // Stagger within each parent group for a polished cascade
    const groups = new Map();
    nodes.forEach((node) => {
      const parent = node.parentElement || root;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push(node);
    });

    groups.forEach((groupNodes) => {
      groupNodes.forEach((node, index) => {
        const customDelay = node.getAttribute("data-reveal-delay");
        const delay =
          customDelay != null ? Number(customDelay) : Math.min(index, 6) * 70;
        node.style.setProperty("--homec-reveal-delay", `${delay}ms`);
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" },
    );

    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, [refreshKey]);
}

export default function HomePage() {
  const nav = useNavigate();
  const { items } = useCart();
  const { user, isLogged, booting } = useAuth();

  const [config, setConfig] = useState(null);
  const [promos, setPromos] = useState(FALLBACK_PROMOS);
  const [activePromo, setActivePromo] = useState(0);
  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [gallery, setGallery] = useState([]);

  useHomeReveal(
    `${products.length}-${combos.length}-${gallery.length}-${promos.length}`,
  );

  useEffect(() => {
    if (booting) return;
    if (isLogged && user) {
      const role = String(
        user?.role || user?.rol || user?.tipo || "",
      ).toLowerCase();
      if (role === "admin" || role === "administrador")
        nav("/admin/dashboard", { replace: true });
    }
  }, [booting, isLogged, user, nav]);

  useEffect(() => {
    let alive = true;
    async function loadHomeData() {
      const [nextConfig, nextProducts, nextCombos, nextGallery] =
        await Promise.all([
          getPublicConfig(),
          catalogApi.productos().catch(() => []),
          combosApi.today().catch(() => []),
          getPublicGallery(),
        ]);
      if (!alive) return;
      if (nextConfig) {
        setConfig(nextConfig);
        localStorage.setItem("pmya_config", JSON.stringify(nextConfig));
      }
      setProducts(toArray(nextProducts));
      setCombos(toArray(nextCombos));
      setGallery(toArray(nextGallery));
    }

    const cached = localStorage.getItem("pmya_config");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object") setConfig(parsed);
      } catch {}
    }
    loadHomeData();

    const onConfigUpdated = (event) => {
      if (event?.detail) {
        setConfig(event.detail);
        localStorage.setItem("pmya_config", JSON.stringify(event.detail));
      }
    };
    window.addEventListener("configUpdated", onConfigUpdated);
    return () => {
      alive = false;
      window.removeEventListener("configUpdated", onConfigUpdated);
    };
  }, []);

  const businessName = normalizeText(config?.nombre_negocio, "Pizza Mya");
  const status = useMemo(() => getStoreStatus(config), [config]);
  const featuredProducts = useMemo(
    () => uniqueFeaturedProducts(products),
    [products],
  );
  const galleryPreview = useMemo(() => gallery.slice(0, 4), [gallery]);

  useEffect(() => {
    const configuredPromos = parsePromos(config?.promociones_json)
      .filter((item) => item?.activo !== false)
      .sort((a, b) => Number(a?.orden || 0) - Number(b?.orden || 0))
      .map((item, index) => ({
        ...item,
        etiqueta: normalizeText(
          item?.etiqueta,
          index === 0 ? "Promoción" : "Pizza Mya",
        ),
        cta: normalizeText(item?.cta, "Ver"),
      }));

    if (configuredPromos.length > 0) {
      setPromos(configuredPromos);
      return;
    }
    if (featuredProducts.length > 0) {
      setPromos(
        FALLBACK_PROMOS.map((promo, index) => ({
          ...promo,
          imagen_url:
            featuredProducts[index % featuredProducts.length]?.imagen_url || "",
        })),
      );
      return;
    }
    if (galleryPreview.length > 0) {
      setPromos(
        FALLBACK_PROMOS.map((promo, index) => ({
          ...promo,
          imagen_url:
            galleryPreview[index % galleryPreview.length]?.imagen_url || "",
        })),
      );
      return;
    }
    setPromos(FALLBACK_PROMOS);
  }, [config?.promociones_json, featuredProducts, galleryPreview]);

  useEffect(() => {
    if (activePromo > promos.length - 1) setActivePromo(0);
  }, [activePromo, promos.length]);

  const prepTime = Number(config?.tiempo_preparacion_min || 35);
  const shipping = Number(config?.costo_envio || 0);
  const minimum = Number(config?.pedido_minimo || 0);
  const cartCount = items.reduce(
    (sum, item) => sum + Number(item?.cantidad || 1),
    0,
  );
  const firstProduct = featuredProducts[0];

  const whatsappUrl = useMemo(
    () =>
      buildWhatsAppUrl(
        config?.whatsapp_pedidos || config?.telefono,
        `Hola, quiero hacer un pedido en ${businessName}.`,
      ),
    [config?.whatsapp_pedidos, config?.telefono, businessName],
  );
  const mapsUrl = useMemo(
    () => buildMapsUrl(config?.direccion),
    [config?.direccion],
  );

  const goOrder = () => nav(cartCount > 0 ? "/mi-pedido" : "/catalogo");
  const goWhatsApp = () => {
    if (whatsappUrl) window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    else nav("/catalogo");
  };

  if (booting)
    return (
      <div className="homec-loading">
        <span>Cargando {businessName}...</span>
      </div>
    );

  return (
    <>
      <style>{HOME_CLEAN_STYLES}</style>
      <main className="homec">
        {/* Hero Carousel Principal */}
        <HeroCarousel slides={carouselSlides} />
        
        <section className="homec-hero">
          <div className="homec-shell homec-heroGrid">
            <div
              className="homec-heroCopy"
              data-homec-reveal="fade-up"
              data-reveal-delay="0"
            >
              <span className="homec-kicker">
                <Store size={16} />
                {status.label} · {status.schedule}
              </span>
              <h1>{businessName}</h1>
              <p>
                Pizzas, combos y complementos para pedir fácil. Elige,
                personaliza y confirma tu pedido desde la tienda.
              </p>
              <div className="homec-actions">
                <button
                  className="homec-btn homec-btnPrimary"
                  type="button"
                  onClick={goOrder}
                >
                  {cartCount > 0
                    ? `Ver pedido (${cartCount})`
                    : "Ordenar ahora"}
                  <ShoppingCart size={17} />
                </button>
                <button
                  className="homec-btn homec-btnSecondary"
                  type="button"
                  onClick={() => nav("/catalogo")}
                >
                  Ver menú
                </button>
                <button
                  className="homec-btn homec-btnLine"
                  type="button"
                  onClick={goWhatsApp}
                >
                  <MessageCircle size={17} />
                  WhatsApp
                </button>
              </div>
            </div>

            <aside
              className="homec-heroCard"
              data-homec-reveal="fade-right"
              data-reveal-delay="120"
            >
              <div className="homec-heroImage">
                {firstProduct?.imagen_url ? (
                  <img
                    src={firstProduct.imagen_url}
                    alt={firstProduct?.nombre || "Pizza destacada"}
                    loading="lazy"
                  />
                ) : (
                  <ImageFallback icon="🍕" label="Pizza Mya" />
                )}
              </div>
              <div className="homec-heroCardText">
                <span>Recomendación</span>
                <h2>
                  {normalizeText(
                    firstProduct?.nombre,
                    "Especialidad Pizza Mya",
                  )}
                </h2>
                <p>
                  {normalizeText(
                    firstProduct?.descripcion,
                    "Selecciona tu pizza favorita y personalízala a tu gusto.",
                  )}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    nav(
                      firstProduct?.id
                        ? `/producto/${firstProduct.id}`
                        : "/catalogo",
                    )
                  }
                >
                  Ver producto
                  <ArrowRight size={15} />
                </button>
              </div>
            </aside>
          </div>
        </section>

        {/* Trust signals — early in the page for professionalism & conversion */}
        <section
          className="homec-shell homec-infoGrid"
          style={{ marginTop: 28 }}
          aria-label="Información de la tienda"
        >
          <InfoItem
            icon={<Clock3 size={20} />}
            title={`${prepTime} min`}
            text="Tiempo estimado"
          />
          <InfoItem
            icon={<Truck size={20} />}
            title={money(shipping)}
            text="Costo de envío"
          />
          <InfoItem
            icon={<ShoppingCart size={20} />}
            title={money(minimum)}
            text="Pedido mínimo"
          />
          <InfoItem
            icon={<Store size={20} />}
            title={status.label}
            text={status.schedule}
          />
        </section>

        {/* Quick navigation by category */}
        <section className="homec-shell homec-section">
          <SectionHeader
            eyebrow="Menú"
            title="Elige por categoría"
            text="Busca rápido pizzas, combos, bebidas y complementos."
          />
          <div className="homec-categoryGrid">
            {CATEGORY_CARDS.map((item) => (
              <button
                className="homec-categoryCard"
                type="button"
                key={item.title}
                data-homec-reveal="scale"
                onClick={() => nav(item.to)}
              >
                <span>{item.icon}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
                <ArrowRight size={16} />
              </button>
            ))}
          </div>
        </section>

        {/* Featured products - Slider "Los más pedidos" */}
        <section className="homec-shell homec-section">
          <SectionHeader
            eyebrow="Productos"
            title="Los más pedidos"
            text="Sabores favoritos para pedir fácil y compartir."
            actionLabel="Ver catálogo"
            onAction={() => nav("/catalogo")}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  name: getProductName(product),
                  description: normalizeText(product?.descripcion, "Deliciosa pizza preparada para compartir"),
                  price: getProductPrice(product),
                  image: getProductImage(product),
                  badge: isPizza(product) ? 'Especialidad' : null,
                  badgeType: isPizza(product) ? 'bestseller' : null
                }}
                onAddToCart={(prod) => 
                  nav(
                    isPizza(prod)
                      ? `/personalizar/${prod?.id}`
                      : `/producto/${prod?.id}`,
                  )
                }
              />
            ))}
          </div>
        </section>

        {/* Categories Section */}
        <section className="homec-shell homec-section">
          <SectionHeader
            eyebrow="Categorías"
            title="Explora nuestro menú"
            text="Encuentra lo que se te antoja hoy"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>

        {/* How it works — early to reduce friction */}
        <section className="homec-shell homec-section">
          <div className="homec-cardBox" data-homec-reveal>
            <SectionHeader
              eyebrow="Proceso"
              title="Cómo pedir"
              text="Ordena en pocos pasos y elige entrega o recoger."
            />
            <div className="homec-stepList">
              {ORDER_STEPS.map((item) => (
                <article key={item.title} data-homec-reveal="fade-up">
                  <div>{item.icon}</div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Promotions - Carrusel Principal */}
        <section
          className="homec-shell homec-section"
          style={{ padding: 0, background: "transparent" }}
        >
          <Carousel
            slides={promos.map((p) => ({
              id: p.id || p.titulo,
              titulo: p.titulo || "Promoción especial",
              descripcion: p.descripcion || "",
              etiqueta: p.etiqueta || "Oferta",
              cta: p.cta || "Ordenar ahora",
              imagen_url: p.imagen_url || "",
              onPrimaryClick: goOrder,
            }))}
            autoplayDelay={6000}
          />
        </section>

        {/* Combos */}
        <section className="homec-shell homec-section">
          <SectionHeader
            eyebrow="Combos"
            title="Combos del día"
            text="Paquetes disponibles para compartir hoy."
            actionLabel="Ver combos"
            onAction={() => nav("/combos")}
          />
          <div className="homec-comboList" style={{ maxWidth: 720 }}>
            {combos.slice(0, 3).length > 0 ? (
              combos
                .slice(0, 3)
                .map((combo, index) => (
                  <ComboCard
                    key={combo?.id || combo?.nombre || index}
                    combo={combo}
                    onOpen={() => nav(`/combos/${combo?.id}`)}
                  />
                ))
            ) : (
              <div className="homec-empty homec-emptySmall">
                Por ahora no hay combos disponibles para hoy.
              </div>
            )}
          </div>
        </section>

        <section className="homec-shell homec-section homec-brandGrid">
          <div className="homec-about" data-homec-reveal>
            <span className="homec-eyebrow">Nosotros</span>
            <h2>Una pizzería para compartir.</h2>
            <p>
              {normalizeText(
                config?.historia_negocio,
                "Pizza Mya ofrece pizzas, bebidas, complementos y combos pensados para disfrutar en familia o con amigos.",
              )}
            </p>
            <button
              className="homec-btn homec-btnSecondary"
              type="button"
              onClick={() => nav("/nosotros")}
            >
              Conoce más
            </button>
          </div>
          <div className="homec-contact" data-homec-reveal>
            <span className="homec-eyebrow">Contacto</span>
            <h2>Ubicación y horario</h2>
            <p>
              {normalizeText(
                config?.direccion,
                "Contáctanos por WhatsApp para compartirte nuestra ubicación.",
              )}
            </p>
            <div className="homec-contactRows">
              <span>
                <Phone size={16} />
                {normalizeText(
                  config?.telefono || config?.whatsapp_pedidos,
                  "Atención por WhatsApp",
                )}
              </span>
              <span>
                <Clock3 size={16} />
                {status.schedule}
              </span>
              <span>
                <MapPin size={16} />
                {normalizeText(
                  config?.direccion,
                  "Ubicación disponible por WhatsApp",
                )}
              </span>
            </div>
            <div className="homec-contactActions">
              <button
                className="homec-btn homec-btnPrimary"
                type="button"
                onClick={goWhatsApp}
              >
                WhatsApp
              </button>
              <button
                className="homec-btn homec-btnSecondary"
                type="button"
                onClick={() =>
                  mapsUrl &&
                  window.open(mapsUrl, "_blank", "noopener,noreferrer")
                }
              >
                Ver mapa
              </button>
            </div>
          </div>
        </section>

        <section className="homec-shell homec-section">
          <SectionHeader
            eyebrow="Galería"
            title="Fotos recientes"
            text="Conoce nuestros productos y momentos de Pizza Mya."
            actionLabel="Ver galería"
            onAction={() => nav("/galeria")}
          />
          <div className="homec-galleryGrid">
            {galleryPreview.length > 0 ? (
              galleryPreview.map((item, index) => (
                <button
                  key={item?.id || item?.imagen_url || index}
                  className="homec-galleryItem"
                  type="button"
                  data-homec-reveal="scale"
                  onClick={() => nav("/galeria")}
                >
                  {item?.imagen_url ? (
                    <img
                      src={item.imagen_url}
                      alt={item?.titulo || "Galería Pizza Mya"}
                      loading="lazy"
                    />
                  ) : (
                    <ImageFallback icon="📸" label="Galería" />
                  )}
                  <span>
                    <Images size={14} />
                    {normalizeText(item?.titulo, "Pizza Mya")}
                  </span>
                </button>
              ))
            ) : (
              <div className="homec-empty">
                Muy pronto compartiremos más fotos de Pizza Mya.
              </div>
            )}
          </div>
        </section>

        <section
          className="homec-shell homec-section homec-final"
          data-homec-reveal
        >
          <div>
            <span>Pedido en línea</span>
            <h2>Arma tu pedido cuando se te antoje.</h2>
            <p>
              Revisa el menú, agrega productos al carrito y confirma tu pedido.
            </p>
          </div>
          <button
            className="homec-btn homec-btnPrimary"
            type="button"
            onClick={goOrder}
          >
            Ordenar ahora
            <ShoppingCart size={17} />
          </button>
        </section>

        {/* Floating WhatsApp */}
        {whatsappUrl ? (
          <button
            type="button"
            className="homec-whatsappFloat"
            onClick={goWhatsApp}
            aria-label="Contactar por WhatsApp"
          >
            <MessageCircle size={26} />
          </button>
        ) : null}

        {/* Sticky mobile CTA */}
        <div className="homec-stickyMobile">
          <button
            className="homec-btn homec-btnPrimary"
            type="button"
            onClick={goOrder}
          >
            {cartCount > 0 ? `Ver pedido (${cartCount})` : "Ordenar ahora"}
            <ShoppingCart size={17} />
          </button>
        </div>
      </main>
    </>
  );
}

const HOME_CLEAN_STYLES = `
  .homec{--red:#9b2118;--red-dark:#78170f;--cream:#fff8f1;--cream-2:#f8efe6;--text:#2d1b16;--muted:#71645d;--line:#ead8c7;min-height:100vh;color:var(--text);background:#fffaf5}.homec-shell{width:min(1120px,calc(100% - 32px));margin:0 auto}.homec-loading{min-height:60vh;display:grid;place-items:center;color:var(--red);font-weight:800}.homec-section{margin-top:42px}.homec [data-homec-reveal]{opacity:0;transform:translateY(28px);transition:opacity .7s cubic-bezier(.22,1,.36,1),transform .7s cubic-bezier(.22,1,.36,1);transition-delay:var(--homec-reveal-delay,0ms);will-change:opacity,transform}.homec [data-homec-reveal].is-visible{opacity:1;transform:translateY(0)}.homec [data-homec-reveal="fade-up"]{transform:translateY(28px)}.homec [data-homec-reveal="fade-left"]{transform:translateX(-32px)}.homec [data-homec-reveal="fade-right"]{transform:translateX(32px)}.homec [data-homec-reveal="scale"]{transform:scale(.94)}.homec [data-homec-reveal="fade-left"].is-visible,.homec [data-homec-reveal="fade-right"].is-visible{transform:translateX(0)}.homec [data-homec-reveal="scale"].is-visible{transform:scale(1)}.homec-heroCopy[data-homec-reveal],.homec-heroCard[data-homec-reveal]{transition-duration:.85s}.homec-categoryCard,.homec-productCard,.homec-comboCard,.homec-galleryItem,.homec-infoItem{transition:opacity .7s cubic-bezier(.22,1,.36,1),transform .7s cubic-bezier(.22,1,.36,1),box-shadow .2s ease}.homec-categoryCard:hover,.homec-productCard:hover,.homec-comboCard:hover{transform:translateY(-4px)}.homec [data-homec-reveal].is-visible.homec-categoryCard:hover,.homec [data-homec-reveal].is-visible.homec-productCard:hover,.homec [data-homec-reveal].is-visible.homec-comboCard:hover{transform:translateY(-4px)}.homec-hero{padding:46px 0 34px;background:linear-gradient(180deg,rgba(255,248,241,.92),rgba(255,250,245,.98)),radial-gradient(circle at 90% 0%,rgba(155,33,24,.08),transparent 34%);border-bottom:1px solid rgba(234,216,199,.9)}.homec-heroGrid{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(320px,.78fr);gap:34px;align-items:center}.homec-kicker,.homec-eyebrow{display:inline-flex;align-items:center;gap:8px;width:fit-content;color:var(--red);background:#fff;border:1px solid var(--line);border-radius:999px;padding:7px 11px;font-size:.75rem;font-weight:800;letter-spacing:.03em;text-transform:uppercase}.homec-heroCopy h1{margin:16px 0 12px;max-width:720px;font-size:clamp(2.2rem,5.4vw,4.2rem);line-height:1;letter-spacing:-.05em}.homec-heroCopy p{max-width:650px;margin:0;color:var(--muted);font-size:clamp(1rem,1.4vw,1.12rem);line-height:1.7}.homec-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}.homec-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;border-radius:999px;padding:0 17px;border:1px solid transparent;font-weight:850;cursor:pointer;transition:background .16s ease,border-color .16s ease,transform .16s ease}.homec-btn:hover{transform:translateY(-1px)}.homec-btnPrimary{color:#fff;background:var(--red);border-color:var(--red)}.homec-btnPrimary:hover{background:var(--red-dark);border-color:var(--red-dark)}.homec-btnSecondary{color:var(--red);background:#fff;border-color:var(--line)}.homec-btnSecondary:hover{border-color:rgba(155,33,24,.32);background:#fff8f2}.homec-btnLine{color:#27623a;background:#f3fbf5;border-color:#cfe9d5}.homec-heroCard{overflow:hidden;background:#fff;border:1px solid var(--line);border-radius:26px;box-shadow:0 16px 38px rgba(55,30,18,.08)}.homec-heroImage{height:260px;background:var(--cream-2)}.homec-heroImage img,.homec-promoMedia img,.homec-productImage img,.homec-comboImage img,.homec-galleryItem img{width:100%;height:100%;object-fit:cover}.homec-heroCardText{padding:18px}.homec-heroCardText span,.homec-comboCard>div:last-child>span,.homec-final span{color:var(--red);font-size:.75rem;text-transform:uppercase;letter-spacing:.04em;font-weight:850}.homec-heroCardText h2{margin:8px 0 6px;font-size:1.4rem;line-height:1.12}.homec-heroCardText p,.homec-about p,.homec-contact p,.homec-final p{margin:0;color:var(--muted);line-height:1.6}.homec-heroCardText button,.homec-textButton{display:inline-flex;align-items:center;gap:7px;margin-top:14px;padding:0;border:0;background:transparent;color:var(--red);font-weight:850;cursor:pointer}.homec-infoGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:-18px;position:relative;z-index:2}.homec-infoItem{display:grid;grid-template-columns:auto 1fr;gap:2px 10px;align-items:center;padding:14px;background:#fff;border:1px solid var(--line);border-radius:18px;box-shadow:0 12px 26px rgba(55,30,18,.06)}.homec-infoItem div{grid-row:span 2;width:40px;height:40px;display:grid;place-items:center;border-radius:13px;color:var(--red);background:#fff3e9}.homec-infoItem strong{font-size:.94rem}.homec-infoItem span{color:var(--muted);font-size:.8rem}.homec-sectionHeader{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin-bottom:18px}.homec-sectionHeader h2{margin:10px 0 5px;font-size:clamp(1.55rem,2.5vw,2.15rem);line-height:1.12;letter-spacing:-.035em}.homec-sectionHeader p{max-width:620px;margin:0;color:var(--muted);line-height:1.6}.homec-promoCard{display:grid;grid-template-columns:minmax(0,.95fr) minmax(320px,.75fr);gap:18px;align-items:stretch;overflow:hidden;padding:18px;background:#fff;border:1px solid var(--line);border-radius:26px;box-shadow:0 16px 36px rgba(55,30,18,.07)}.homec-promoText{display:flex;flex-direction:column;justify-content:center;padding:clamp(4px,2vw,20px)}.homec-promoText>span{width:fit-content;padding:6px 10px;border-radius:999px;color:var(--red);background:#fff3e9;font-size:.75rem;font-weight:850;text-transform:uppercase;letter-spacing:.04em}.homec-promoText h2{margin:14px 0 8px;font-size:clamp(1.6rem,3.5vw,2.6rem);line-height:1.04;letter-spacing:-.045em}.homec-promoText p{max-width:560px;margin:0;color:var(--muted);line-height:1.65}.homec-promoActions{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px}.homec-promoMedia{position:relative;min-height:290px;overflow:hidden;border-radius:20px;background:var(--cream-2)}.homec-promoControls{position:absolute;left:12px;right:12px;bottom:12px;display:flex;align-items:center;justify-content:space-between;gap:10px}.homec-promoControls button,.homec-promoControls span{height:36px;border-radius:999px;border:1px solid rgba(255,255,255,.6);background:rgba(255,255,255,.9);color:var(--text);display:inline-flex;align-items:center;justify-content:center;font-weight:850}.homec-promoControls button{width:36px;cursor:pointer}.homec-promoControls span{padding:0 12px;font-size:.82rem}.homec-categoryGrid,.homec-galleryGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.homec-categoryCard{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:12px;width:100%;min-height:104px;padding:16px;text-align:left;background:#fff;border:1px solid var(--line);border-radius:20px;cursor:pointer;transition:border-color .16s ease,transform .16s ease}.homec-categoryCard:hover,.homec-productCard:hover{transform:translateY(-2px);border-color:rgba(155,33,24,.28)}.homec-categoryCard>span{width:42px;height:42px;display:grid;place-items:center;border-radius:14px;background:#fff4ec;font-size:1.3rem}.homec-categoryCard h3,.homec-productBody h3,.homec-comboCard h3,.homec-stepList h3{margin:0;font-size:1rem}.homec-categoryCard p,.homec-productBody p,.homec-comboCard p,.homec-stepList p{margin:5px 0 0;color:var(--muted);line-height:1.48;font-size:.9rem}.homec-productGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.homec-productCard{overflow:hidden;background:#fff;border:1px solid var(--line);border-radius:22px;transition:border-color .16s ease,transform .16s ease}.homec-productImage{display:block;width:100%;height:176px;border:0;padding:0;background:var(--cream-2);cursor:pointer}.homec-productBody{padding:15px}.homec-productMeta{display:flex;align-items:center;justify-content:space-between;gap:8px;color:var(--muted);font-size:.78rem;font-weight:780;margin-bottom:8px}.homec-ratingMini{display:inline-flex;align-items:center;gap:4px;color:#986500}.homec-productFooter{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:14px}.homec-productFooter small{display:block;color:var(--muted);font-size:.78rem}.homec-productFooter strong{color:var(--red)}.homec-productFooter button,.homec-comboCard button{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);border-radius:999px;background:#fff8f2;color:var(--red);padding:8px 12px;font-weight:850;cursor:pointer}.homec-twoColumns,.homec-brandGrid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px}.homec-cardBox,.homec-about,.homec-contact{background:#fff;border:1px solid var(--line);border-radius:24px;padding:22px}.homec-cardBox .homec-sectionHeader{align-items:flex-start;flex-direction:column;margin-bottom:16px}.homec-stepList{display:grid;gap:10px}.homec-stepList article{display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:start;padding:13px;background:#fffaf6;border:1px solid var(--line);border-radius:16px}.homec-stepList article>div:first-child{width:38px;height:38px;display:grid;place-items:center;border-radius:13px;color:var(--red);background:#fff1e7}.homec-comboList{display:grid;gap:12px}.homec-comboCard{display:grid;grid-template-columns:105px 1fr;gap:12px;align-items:stretch;padding:10px;border:1px solid var(--line);border-radius:18px;background:#fffaf6}.homec-comboImage{min-height:108px;overflow:hidden;border-radius:14px;background:var(--cream-2)}.homec-comboCard button{margin-top:10px}.homec-about h2,.homec-contact h2,.homec-final h2{margin:12px 0 8px;font-size:clamp(1.45rem,2.4vw,2rem);line-height:1.1;letter-spacing:-.035em}.homec-about .homec-btnSecondary{margin-top:18px}.homec-contactRows{display:grid;gap:9px;margin-top:15px}.homec-contactRows span{display:inline-flex;align-items:center;gap:8px;color:var(--muted)}.homec-contactRows svg{color:var(--red)}.homec-contactActions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}.homec-galleryItem{position:relative;height:188px;overflow:hidden;border:0;border-radius:20px;background:var(--cream-2);padding:0;cursor:pointer}.homec-galleryItem span{position:absolute;left:10px;right:10px;bottom:10px;display:inline-flex;align-items:center;gap:6px;width:fit-content;max-width:calc(100% - 20px);padding:7px 9px;border-radius:999px;background:rgba(255,255,255,.9);color:var(--text);font-size:.78rem;font-weight:820}.homec-final{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:56px;padding:24px;border-radius:24px;background:#fff;border:1px solid var(--line)}.homec-imageFallback{width:100%;height:100%;min-height:150px;display:grid;place-items:center;background:linear-gradient(135deg,#fff3e9,#f5e5d6);color:var(--red)}.homec-imageFallback span{font-size:clamp(2.5rem,7vw,4.5rem)}.homec-empty{grid-column:1/-1;padding:22px;border:1px dashed var(--line);border-radius:18px;color:var(--muted);background:#fff;text-align:center;font-weight:780}.homec-emptySmall{padding:14px;text-align:left}.homec-stickyMobile{display:none;position:fixed;left:0;right:0;bottom:0;padding:12px 16px calc(12px + env(safe-area-inset-bottom));background:rgba(255,255,255,.96);border-top:1px solid var(--line);z-index:99}.homec-stickyMobile .homec-btn{width:100%;max-width:400px;margin:0 auto;display:flex;justify-content:center;box-shadow:0 8px 24px rgba(155,33,24,.25)}.homec-whatsappFloat{position:fixed;right:22px;bottom:22px;width:54px;height:54px;border:0;border-radius:999px;color:#fff;background:#25d366;display:grid;place-items:center;cursor:pointer;box-shadow:0 10px 24px rgba(37,211,102,.3);z-index:100}
  @media(max-width:980px){.homec-heroGrid,.homec-promoCard,.homec-twoColumns,.homec-brandGrid{grid-template-columns:1fr}.homec-infoGrid,.homec-categoryGrid,.homec-productGrid,.homec-galleryGrid{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:680px){.homec-shell{width:min(100% - 22px,1120px)}.homec-section{margin-top:34px}.homec-hero{padding:32px 0 26px}.homec-heroCopy h1{font-size:clamp(2.05rem,12vw,3rem)}.homec-actions,.homec-promoActions,.homec-contactActions{flex-direction:column}.homec-btn{width:100%}.homec-infoGrid,.homec-categoryGrid,.homec-productGrid,.homec-galleryGrid{grid-template-columns:1fr}.homec-sectionHeader{align-items:flex-start;flex-direction:column}.homec-promoCard,.homec-cardBox,.homec-about,.homec-contact,.homec-final{border-radius:20px;padding:16px}.homec-promoMedia{min-height:230px}.homec-heroImage{height:230px}.homec-final{align-items:stretch;flex-direction:column;margin-bottom:86px}.homec-stickyMobile{display:block}.homec-whatsappFloat{bottom:86px;right:16px;width:50px;height:50px}}
  @media(prefers-reduced-motion:reduce){.homec-btn,.homec-productCard,.homec-categoryCard,.homec [data-homec-reveal]{transition:none!important;opacity:1!important;transform:none!important}}
`;
