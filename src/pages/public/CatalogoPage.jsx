import { useEffect, useMemo, useState } from "react";
import { catalogApi } from "../../api/catalogo.api";
import { ShoppingCart, Info, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CarritoContext.jsx";
import { useToast } from "../../components/ui/ToastProvider.jsx";
import ErrorScreen from "../../components/ErrorScreen.jsx";
import Loader from "../../components/ui/Loader.jsx";
import { HttpError } from "../../api/http";

const TABS = [
  { key: "Pizzas", label: "Pizzas", icon: "🍕" },
  { key: "Bebidas", label: "Bebidas", icon: "🥤" },
  { key: "Complementos", label: "Complementos", icon: "📦" },
];

const PIZZA_SIZE_ORDER = ["Individual", "Mediana", "Grande", "Jumbo"];
const PAGE_SIZE = 12;

export default function CatalogoPage() {
  const nav = useNavigate();
  const { addItem } = useCart();
  const toast = useToast();

  const [tab, setTab] = useState("Pizzas");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [search, setSearch] = useState("");
  const [onlyAvailable] = useState(false);

  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sizeByGroup, setSizeByGroup] = useState({});
  const [errCode, setErrCode] = useState(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErrCode(null);

        const cats = await catalogApi.categorias();
        if (!alive) return;
        setCategorias(Array.isArray(cats) ? cats : []);

        const prods = await catalogApi.productos();
        if (!alive) return;
        setProductos(Array.isArray(prods) ? prods : []);
      } catch (e) {
        if (!alive) return;
        if (e instanceof HttpError && (e.status === 0 || e.status >= 500)) {
          setErrCode(500);
        } else {
          setErrCode(e?.status || 500);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const normalize = (v) =>
    String(v ?? "")
      .trim()
      .toLowerCase();

  const getCatId = (c) => c?.id ?? c?._id ?? null;

  const categoriaIdByName = (name) => {
    const target = normalize(name);
    const c = categorias.find((x) => normalize(x?.nombre) === target);
    return c ? getCatId(c) : null;
  };

  const getCatNameOfProduct = (p) =>
    p?.categoria?.nombre ||
    p?.categoria_id?.nombre ||
    p?.categoriaNombre ||
    p?.categoria_nombre ||
    "";

  const getCategoryType = (p) => {
    const cat = normalize(getCatNameOfProduct(p));
    if (cat.includes("pizza")) return "pizza";
    if (cat.includes("bebida")) return "bebida";
    if (cat.includes("complemento")) return "complemento";
    return "";
  };

  const detectPizzaSizeLabel = (value = "") => {
    const n = normalize(value);
    if (n.includes("individual")) return "Individual";
    if (n.includes("mediana")) return "Mediana";
    if (n.includes("grande")) return "Grande";
    if (n.includes("jumbo")) return "Jumbo";
    return "";
  };

  const basePizzaName = (nombre = "") =>
    String(nombre || "")
      .replace(/\(\s*(individual|mediana|grande|jumbo).*?\)/gi, "")
      .replace(/\b(individual|mediana|grande|jumbo)\b\s*\d{0,2}\s*"?/gi, "")
      .replace(/\s{2,}/g, " ")
      .trim();

  const baseDrinkName = (nombre = "") =>
    String(nombre || "")
      .replace(/\b\d+(\.\d+)?\s*(ml|l)\b/gi, "")
      .replace(/\s{2,}/g, " ")
      .trim();

  const parseDrinkSizeValue = (label = "") => {
    const text = String(label || "")
      .trim()
      .toLowerCase();

    const mlMatch = text.match(/(\d+(?:\.\d+)?)\s*ml/);
    if (mlMatch) return Number(mlMatch[1]);

    const lMatch = text.match(/(\d+(?:\.\d+)?)\s*l/);
    if (lMatch) return Number(lMatch[1]) * 1000;

    return Number.MAX_SAFE_INTEGER;
  };

  const sortVariantLabels = (categoryType, a, b) => {
    const aLabel = String(a?.label || "").trim();
    const bLabel = String(b?.label || "").trim();

    if (categoryType === "pizza") {
      const aIndex = PIZZA_SIZE_ORDER.indexOf(aLabel);
      const bIndex = PIZZA_SIZE_ORDER.indexOf(bLabel);

      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
    }

    if (categoryType === "bebida") {
      return parseDrinkSizeValue(aLabel) - parseDrinkSizeValue(bLabel);
    }

    return aLabel.localeCompare(bLabel, "es");
  };

  const isItemAvailable = (item) =>
    item?.disponible !== false && item?.activo !== false;

  const filteredRaw = useMemo(() => {
    const catIdTab = categoriaIdByName(tab);
    let source = [];

    if (catIdTab) {
      source = productos.filter((p) => {
        const pid = p?.categoria_id ?? p?.categoriaId ?? p?.categoriaID ?? null;
        return pid != null && String(pid) === String(catIdTab);
      });
    } else {
      source = productos.filter((p) =>
        normalize(getCatNameOfProduct(p)).includes(normalize(tab)),
      );
    }

    return source.filter((p) => {
      const matchesSearch =
        !search ||
        normalize(p?.nombre).includes(normalize(search)) ||
        normalize(p?.descripcion).includes(normalize(search));
      const matchesAvailability = !onlyAvailable || isItemAvailable(p);
      return matchesSearch && matchesAvailability;
    });
  }, [productos, tab, categorias, search, onlyAvailable]);

  const buildVariantEntries = (product, categoryType) => {
    const variants = [];
    const seen = new Set();

    const pushVariant = (label, price, imageUrl, sourceProduct, variantSource = {}) => {
      const cleanLabel = String(label || "").trim();
      if (!cleanLabel) return;

      const key = cleanLabel.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);

      variants.push({
        key: cleanLabel,
        label: cleanLabel,
        price: Number(price || 0),
        imagen_url: imageUrl || sourceProduct?.imagen_url || null,
        product: {
          ...sourceProduct,
          tamanio: cleanLabel,
          imagen_url: imageUrl || sourceProduct?.imagen_url || null,
          precio_base: Number(price || 0),
          producto_tamanio_id:
            variantSource?.id ||
            variantSource?.producto_tamanio_id ||
            sourceProduct?.producto_tamanio_id ||
            null,
          tamanio_id: variantSource?.tamanio_id || sourceProduct?.tamanio_id || null,
        },
      });
    };

    if (Array.isArray(product?.tamanios) && product.tamanios.length > 0) {
      for (const variant of product.tamanios) {
        const label =
          categoryType === "pizza"
            ? detectPizzaSizeLabel(
                variant?.tamanio || product?.tamanio || product?.nombre,
              )
            : String(variant?.tamanio || "").trim();

        pushVariant(
          label,
          variant?.precio_base ?? product?.precio_base ?? 0,
          variant?.imagen_url ?? product?.imagen_url ?? null,
          product,
          variant,
        );
      }
    } else {
      const directLabel =
        categoryType === "pizza"
          ? detectPizzaSizeLabel(product?.tamanio || product?.nombre)
          : String(product?.tamanio || "").trim();

      pushVariant(
        directLabel,
        product?.precio_base ?? 0,
        product?.imagen_url ?? null,
        product,
        product,
      );
    }

    return variants;
  };

  const itemsForGrid = useMemo(() => {
    if (tab === "Complementos") {
      return filteredRaw.map((p) => ({ type: "product", product: p }));
    }

    const grouped = new Map();

    for (const p of filteredRaw) {
      const categoryType = getCategoryType(p);

      if (!["pizza", "bebida"].includes(categoryType)) {
        const key = `product-${p?.id ?? p?._id ?? Math.random()}`;
        grouped.set(key, { type: "product", product: p });
        continue;
      }

      const rawName = String(p?.nombre || "").trim();
      const baseName =
        categoryType === "pizza"
          ? basePizzaName(rawName)
          : baseDrinkName(rawName);

      const safeBaseName = baseName || rawName;
      const groupKey = `${categoryType}::${safeBaseName.toLowerCase()}`;

      if (!grouped.has(groupKey)) {
        grouped.set(groupKey, {
          type: "variantGroup",
          groupId: groupKey,
          baseName: safeBaseName,
          categoryType,
          image_url: p?.imagen_url || null,
          descripcion: p?.descripcion || "",
          variantsMap: new Map(),
        });
      }

      const g = grouped.get(groupKey);

      if (!g.image_url && p?.imagen_url) g.image_url = p.imagen_url;
      if (!g.descripcion && p?.descripcion) g.descripcion = p.descripcion;

      const entries = buildVariantEntries(p, categoryType);
      for (const entry of entries) {
        const mapKey = String(entry.key || "").toLowerCase();
        if (!mapKey) continue;

        if (!g.variantsMap.has(mapKey)) {
          g.variantsMap.set(mapKey, entry);
        }
      }
    }

    const result = Array.from(grouped.values())
      .map((item) => {
        if (item.type !== "variantGroup") return item;

        const variants = Array.from(item.variantsMap.values()).sort((a, b) =>
          sortVariantLabels(item.categoryType, a, b),
        );

        return {
          ...item,
          variants,
        };
      })
      .filter((item) => {
        if (item.type !== "variantGroup") return true;
        return item.variants.length > 0;
      });

    return result.filter((item) => {
      if (item.type === "product") {
        const p = item.product;
        return (
          !search ||
          normalize(p?.nombre).includes(normalize(search)) ||
          normalize(p?.descripcion).includes(normalize(search))
        );
      }

      const title =
        item.categoryType === "pizza"
          ? item.baseName.startsWith("Pizza")
            ? item.baseName
            : `Pizza ${item.baseName}`
          : item.baseName;

      return (
        !search ||
        normalize(title).includes(normalize(search)) ||
        normalize(item.descripcion).includes(normalize(search))
      );
    });
  }, [filteredRaw, tab, search]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [tab, search, onlyAvailable]);

  const visibleItems = useMemo(
    () => itemsForGrid.slice(0, visibleCount),
    [itemsForGrid, visibleCount],
  );

  const canShowMore = visibleCount < itemsForGrid.length;

  if (!loading && errCode) return <ErrorScreen />;

  const handleImageError = (e) => {
    e.currentTarget.style.display = "none";
  };

  const notifyAddedToCart = (name, quantity = 1) => {
    const cleanName = String(name || "Producto").trim();
    const qty = Math.max(1, Number(quantity || 1));

    toast.success(
      `${cleanName} ${qty > 1 ? `(x${qty}) ` : ""}se agregó al carrito.`,
      "Carrito actualizado",
    );
  };

  return (
    <>
      <style>{`
        .pmya-wrap{ max-width:1180px; margin:0 auto; padding:26px 22px 40px; }
        .pmya-tabs{ display:flex; gap:14px; flex-wrap:wrap; margin-bottom:18px; }
        .pmya-tab{ border:2px solid #FF6A00; border-radius:999px; padding:10px 18px; font-size:14px; background:rgb(244,244,244); cursor:pointer; justify-content:center; display:flex; gap:10px; align-items:center; width:32.5%; }
        .pmya-tab.active{ background:#FF6A00; color:#fff; border-color:#FF6A00; }
        .pmya-count{ margin:12px 0 16px; font-size:14px; color:#444; display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
        .pmya-count b{ color:#d11; }
        .pmya-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
        @media (max-width:1100px){ .pmya-grid{ grid-template-columns:repeat(2,1fr); } }
        @media (max-width:620px){ .pmya-grid{ grid-template-columns:1fr; } .pmya-tab{ width:100%; } }
        .pmya-card{ background:#fff; border-radius:16px; box-shadow:0 8px 18px rgba(16,15,15,0.08); overflow:hidden; border:1px solid #eee; position:relative; min-height:430px; }
        .pmya-img{ height:175px; background:#eee; overflow:hidden; }
        .pmya-img img{ width:100%; height:100%; object-fit:cover; display:block; }
        .pmya-body{ padding:14px; }
        .pmya-name{ font-weight:900; font-size:14px; margin-top:8px; color:#111; }
        .pmya-desc{ font-size:12px; color:#666; margin-top:6px; min-height:40px; }
        .pmya-sizeTitle{ font-size:12px; font-weight:800; color:#444; margin-top:10px; }
        .pmya-sizeRow{ display:flex; gap:8px; margin-top:8px; flex-wrap:wrap; }
        .pmya-sizeBtn{ border:1px solid #e7e7e7; background:#f3f3f3; color:#111; padding:7px 10px; border-radius:10px; font-size:12px; font-weight:800; cursor:pointer; min-width:86px; text-align:center; }
        .pmya-sizeBtn.active{ background:#FF6A00; border-color:#FF6A00; color:#fff; }
        .pmya-priceRow{ display:flex; align-items:flex-end; justify-content:space-between; margin-top:10px; }
        .pmya-price{ font-size:26px; font-weight:1000; color:#111; }
        .pmya-priceNote{ font-size:12px; color:#777; }
        .btn-orange-wide{ width:100%; background:#FF6A00; color:#fff; border:none; border-radius:10px; padding:10px 12px; font-size:12px; font-weight:900; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; margin-top:12px; }
        .pmya-actions2{ display:flex; gap:10px; margin-top:10px; }
        .btn-gray{ flex:1; background:#f1f1f1; color:#111; border:none; border-radius:10px; padding:10px 12px; font-size:12px; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; }
        .btn-orange{ flex:1; background:#FF6A00; color:#fff; border:none; border-radius:10px; padding:10px 12px; font-size:12px; font-weight:900; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; }
        .pmya-badge{ position:absolute; top:12px; right:12px; background:#fff7ed; color:#c2410c; border:1px solid #fed7aa; border-radius:999px; padding:6px 10px; font-size:11px; font-weight:900; }
        .pmya-empty{ grid-column:1 / -1; background:#fff; border:1px dashed #d1d5db; border-radius:16px; padding:28px; text-align:center; color:#64748b; font-weight:700; }
      `}</style>

      <div className="pmya-wrap" style={{ paddingTop: 0, paddingBottom: 0 }}>
        <h1 style={{ fontSize: 28, fontWeight: "900", color: "#111" }}>
          Catálogo
        </h1>
        <p style={{ fontSize: 14, color: "#555", marginTop: 2 }}>
          Elige tu pizza, bebida o complemento favorito y personalízalo a tu
          gusto.
        </p>
      </div>

      <div className="pmya-wrap">
        <div className="pmya-tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`pmya-tab ${tab === t.key ? "active" : ""}`}
              onClick={() => setTab(t.key)}
              type="button"
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {loading && <Loader text="Cargando productos del catálogo..." />}

        {!loading && (
          <>
            <div className="pmya-count">
              <span>
                Mostrando <b>{visibleItems.length}</b> de{" "}
                <b>{itemsForGrid.length}</b> productos
              </span>
              <span>
                {onlyAvailable ? "Filtro: disponibles" : "Mostrando todos"}
              </span>
            </div>

            <div className="pmya-grid">
              {visibleItems.map((it) => {
                if (it.type === "product") {
                  const p = it.product;
                  const id = p?.id ?? p?._id;
                  const nombre = String(p?.nombre ?? "");
                  const disponible = isItemAvailable(p);
                  const sizeLabel = String(p?.tamanio ?? "").trim();

                  return (
                    <div className="pmya-card" key={id}>
                      {!disponible ? (
                        <div className="pmya-badge">No disponible</div>
                      ) : null}

                      <div className="pmya-img">
                        {p?.imagen_url ? (
                          <img
                            src={p.imagen_url}
                            alt={nombre}
                            onError={handleImageError}
                          />
                        ) : null}
                      </div>

                      <div className="pmya-body">
                        <div className="pmya-name">{nombre}</div>

                        <div className="pmya-desc">
                          {p?.descripcion || "Sin descripción"}
                        </div>

                        <div className="pmya-priceRow">
                          <div className="pmya-price">
                            ${Number(p?.precio_base || 0).toFixed(0)}
                          </div>

                          {sizeLabel ? (
                            <div className="pmya-priceNote">{sizeLabel}</div>
                          ) : null}
                        </div>

                        <div className="pmya-actions2">
                          <button
                            className="btn-gray"
                            type="button"
                            onClick={() => nav(`/producto/${id}`)}
                          >
                            <Info size={16} /> Ver detalle
                          </button>

                          <button
                            className="btn-orange"
                            type="button"
                            disabled={!disponible}
                            onClick={() => {
                              if (!disponible) return;

                              addItem({
                                productoId: id,
                                nombre,
                                precioUnitario: Number(p?.precio_base || 0),
                                imagen_url: p?.imagen_url || null,
                                cantidad: 1,
                                tamano: sizeLabel || null,
                                orilla: null,
                                masa_id: null,
                                salsa_id: null,
                                sin: [],
                                extras: [],
                              });

                              notifyAddedToCart(nombre, 1);
                            }}
                          >
                            <ShoppingCart size={16} /> Agregar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                const g = it;
                const groupId = g.groupId;
                const selectedKey = sizeByGroup[groupId] || g.variants[0]?.key;
                const selectedVariant =
                  g.variants.find((v) => v.key === selectedKey) ||
                  g.variants[0];
                const selectedProduct = selectedVariant?.product;
                const previewImage =
                  selectedVariant?.imagen_url ||
                  selectedProduct?.imagen_url ||
                  g.image_url ||
                  null;
                const pid = selectedProduct?.id ?? selectedProduct?._id;
                const precio = Number(selectedVariant?.price || 0);
                const sizeLabel = selectedVariant?.label || "";
                const disponible = isItemAvailable(selectedProduct);

                const title =
                  g.categoryType === "pizza"
                    ? g.baseName.startsWith("Pizza")
                      ? g.baseName
                      : `Pizza ${g.baseName}`
                    : g.baseName;

                const selectorTitle =
                  g.categoryType === "pizza"
                    ? "Selecciona el tamaño:"
                    : "Selecciona la presentación:";

                return (
                  <div className="pmya-card" key={groupId}>
                    {!disponible ? (
                      <div className="pmya-badge">No disponible</div>
                    ) : null}

                    <div className="pmya-img">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt={title}
                          onError={handleImageError}
                        />
                      ) : null}
                    </div>

                    <div className="pmya-body">
                      <div className="pmya-name">{title}</div>

                      <div className="pmya-desc">
                        {g.descripcion || "Sin descripción"}
                      </div>

                      <div className="pmya-sizeTitle">{selectorTitle}</div>

                      <div className="pmya-sizeRow">
                        {g.variants.map((variant) => (
                          <button
                            key={variant.key}
                            className={`pmya-sizeBtn ${
                              selectedKey === variant.key ? "active" : ""
                            }`}
                            type="button"
                            onClick={() =>
                              setSizeByGroup((prev) => ({
                                ...prev,
                                [groupId]: variant.key,
                              }))
                            }
                          >
                            {variant.label}
                          </button>
                        ))}
                      </div>

                      <div className="pmya-priceRow">
                        <div className="pmya-price">${precio.toFixed(0)}</div>
                        <div className="pmya-priceNote">{sizeLabel}</div>
                      </div>

                      {g.categoryType === "pizza" ? (
                        <button
                          className="btn-orange-wide"
                          type="button"
                          onClick={() => {
                            const qs = new URLSearchParams();
                            if (selectedProduct?.producto_tamanio_id) {
                              qs.set("producto_tamanio_id", selectedProduct.producto_tamanio_id);
                            }
                            nav(`/personalizar/${pid}${qs.toString() ? `?${qs.toString()}` : ""}`);
                          }}
                        >
                          <Settings size={16} />
                          Personalizar
                        </button>
                      ) : null}

                      <div className="pmya-actions2">
                        <button
                          className="btn-gray"
                          type="button"
                          onClick={() => nav(`/producto/${pid}`)}
                        >
                          <Info size={16} /> Ver detalle
                        </button>

                        <button
                          className="btn-orange"
                          type="button"
                          disabled={!disponible}
                          onClick={() => {
                            if (!disponible) return;

                            const cartName = String(
                              selectedProduct?.nombre ?? title,
                            );

                            addItem({
                              productoId: pid,
                              producto_tamanio_id: selectedProduct?.producto_tamanio_id || null,
                              tamanio_id: selectedProduct?.tamanio_id || null,
                              nombre: cartName,
                              precioUnitario: precio,
                              imagen_url: previewImage,
                              cantidad: 1,
                              tamano: sizeLabel || null,
                              orilla: null,
                              masa_id: null,
                              salsa_id: null,
                              sin: [],
                              extras: [],
                            });

                            notifyAddedToCart(cartName, 1);
                          }}
                        >
                          <ShoppingCart size={16} /> Agregar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {itemsForGrid.length === 0 && (
                <div className="pmya-empty">
                  No encontramos productos con esos filtros en esta categoría.
                </div>
              )}
            </div>

            {canShowMore && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 18,
                }}
              >
                <button
                  type="button"
                  className="btn-orange"
                  style={{ maxWidth: 240 }}
                  onClick={() =>
                    setVisibleCount((v) =>
                      Math.min(v + PAGE_SIZE, itemsForGrid.length),
                    )
                  }
                >
                  Mostrar más
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
