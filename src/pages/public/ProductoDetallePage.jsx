import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { productosApi } from "../../api/productos.api.js";
import { useCart } from "../../context/CarritoContext.jsx";
import { useToast } from "../../components/ui/ToastProvider.jsx";
import { ShoppingCart, Settings } from "lucide-react";
import {
  getDisplayPizzaName,
  normalizeProductVariants,
} from "../../utils/productVariants.js";

function parseIngredientes(desc = "") {
  const t = String(desc || "");
  const m = t.match(/ingredientes?\s*:\s*([^\n\r]+)/i);
  if (!m) return [];
  return m[1]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10);
}

export default function ProductoDetallePage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { addItem } = useCart();
  const toast = useToast();

  const [producto, setProducto] = useState(null);
  const [allProductos, setAllProductos] = useState([]);
  const [qty, setQty] = useState(1);
  const [selectedSizeId, setSelectedSizeId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");
        const [prod, productosResult] = await Promise.all([
          productosApi.getProducto(id),
          productosApi.getProductos().catch(() => []),
        ]);
        if (!alive) return;

        const productosOk = Array.isArray(productosResult)
          ? productosResult
          : [];
        setProducto(prod);
        setAllProductos(productosOk);
        const sizes = normalizeProductVariants(prod, productosOk);
        setSelectedSizeId(sizes[0]?.producto_tamanio_id || null);
        setQty(1);
      } catch (error) {
        if (alive) setErr(error?.message || "Error cargando producto");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  const tamanios = useMemo(
    () => normalizeProductVariants(producto, allProductos),
    [producto, allProductos],
  );
  const selectedSize = useMemo(() => {
    return (
      tamanios.find(
        (t) => String(t.producto_tamanio_id) === String(selectedSizeId),
      ) ||
      tamanios[0] ||
      null
    );
  }, [tamanios, selectedSizeId]);

  const ingredientes = useMemo(
    () => parseIngredientes(producto?.descripcion || ""),
    [producto],
  );
  const catLabel =
    producto?.categoria?.nombre || producto?.categoria_nombre || "producto";
  const displayName = getDisplayPizzaName(producto);
  const precio = Number(selectedSize?.precio_base || 0);
  const total = Math.max(1, qty) * precio;
  const isPizza = String(catLabel || "")
    .toLowerCase()
    .includes("pizza");

  const handleAgregar = () => {
    if (!producto || !selectedSize) return;

    addItem({
      productoId: selectedSize.producto_id || producto.id,
      producto_tamanio_id: selectedSize.producto_tamanio_id,
      tamanio_id: selectedSize.tamanio_id,
      nombre: displayName || producto.nombre,
      precioUnitario: precio,
      imagen_url: selectedSize.imagen_url || producto.imagen_url,
      cantidad: qty,
      tamano: selectedSize.tamanio,
      orilla_id: null,
      masa_id: null,
      salsa_id: null,
      sin: [],
      extras: [],
      ingredientes_txt: ingredientes.join(", "),
    });

    toast.success("Producto agregado al carrito.", "Carrito actualizado");
  };

  return (
    <>
      <style>{`
        .pmya-wrap{ max-width:1180px; margin:0 auto; padding:26px 22px 50px; }
        .pmya-back{ border:none; background:transparent; font-weight:900; cursor:pointer; margin-bottom:14px; }
        .pmya-grid{ display:grid; grid-template-columns:1.1fr .9fr; gap:26px; align-items:start; }
        @media (max-width:900px){ .pmya-grid{ grid-template-columns:1fr; } }
        .pmya-imgCard,.pmya-panel{ background:#fff; border:1px solid #eee; border-radius:18px; box-shadow:0 10px 24px rgba(0,0,0,.08); overflow:hidden; }
        .pmya-img{ width:100%; height:520px; background:#f1f1f1; display:flex; align-items:center; justify-content:center; }
        @media (max-width:900px){ .pmya-img{ height:320px; } }
        .pmya-img img{ width:100%; height:100%; object-fit:cover; display:block; }
        .pmya-panel{ padding:18px; }
        .badge{ display:inline-flex; padding:5px 10px; border-radius:999px; font-size:12px; font-weight:900; background:#ffe6d6; color:#FF6A00; margin-bottom:10px; }
        .title{ font-size:24px; font-weight:1000; margin:0; color:#111; }
        .sub{ margin:8px 0 0; font-size:14px; color:#555; line-height:1.6; }
        .secTitle{ margin-top:18px; font-size:13px; font-weight:1000; color:#111; }
        .sizeGrid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(130px,1fr)); gap:10px; margin-top:8px; }
        .sizeBtn{ border:1px solid #e5e7eb; background:#fff; border-radius:12px; padding:11px 10px; cursor:pointer; text-align:left; font-weight:900; }
        .sizeBtn.active{ border-color:#FF6A00; box-shadow:0 0 0 3px rgba(255,106,0,.14); }
        .muted{ color:#6b7280; font-size:12px; font-weight:700; margin-top:4px; }
        .row{ display:flex; align-items:center; justify-content:space-between; margin-top:12px; font-size:14px; color:#555; gap:12px; }
        .price,.total{ font-weight:1000; color:#FF6A00; }
        .qtyRow{ display:flex; align-items:center; gap:10px; }
        .qtyBtn{ width:34px; height:34px; border-radius:8px; border:1px solid #eee; background:#f6f6f6; font-weight:900; cursor:pointer; }
        .qtyVal{ min-width:28px; text-align:center; font-weight:900; color:#111; }
        .btnRow{ display:flex; gap:10px; margin-top:16px; flex-wrap:wrap; }
        .btnAdd,.btnCustom{ flex:1; min-width:190px; border:none; border-radius:12px; padding:12px 14px; font-weight:1000; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; }
        .btnAdd{ background:#FF6A00; color:#fff; }
        .btnCustom{ background:#111827; color:#fff; }
        .infoList{ margin:8px 0 0; padding-left:16px; color:#555; font-size:13px; line-height:1.6; }
      `}</style>

      <div className="pmya-wrap">
        <button className="pmya-back" onClick={() => nav(-1)} type="button">
          ← Volver
        </button>

        {loading && <div>Cargando...</div>}
        {err && <div style={{ color: "#b00" }}>{err}</div>}

        {!loading && !err && producto && (
          <div className="pmya-grid">
            <div className="pmya-imgCard">
              <div className="pmya-img">
                {producto.imagen_url ? (
                  <img src={producto.imagen_url} alt={producto.nombre} />
                ) : (
                  <span>Sin imagen</span>
                )}
              </div>
            </div>

            <div>
              <div className="pmya-panel">
                <div className="badge">{catLabel}</div>
                <h1 className="title">{displayName}</h1>
                <p className="sub">
                  {producto.descripcion || "Sin descripción"}
                </p>

                <div className="secTitle">Elige tamaño</div>
                <div className="sizeGrid">
                  {tamanios.map((t) => (
                    <button
                      key={t.producto_tamanio_id || t.tamanio}
                      type="button"
                      className={`sizeBtn ${String(selectedSize?.producto_tamanio_id) === String(t.producto_tamanio_id) ? "active" : ""}`}
                      onClick={() => setSelectedSizeId(t.producto_tamanio_id)}
                    >
                      <div>{t.tamanio}</div>
                      <div className="muted">
                        ${Number(t.precio_base || 0).toFixed(2)}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="row">
                  <span>Precio unitario</span>
                  <span className="price">${precio.toFixed(2)}</span>
                </div>

                <div className="row">
                  <span>Cantidad</span>
                  <div className="qtyRow">
                    <button
                      className="qtyBtn"
                      type="button"
                      onClick={() => setQty((v) => Math.max(1, v - 1))}
                    >
                      −
                    </button>
                    <div className="qtyVal">{qty}</div>
                    <button
                      className="qtyBtn"
                      type="button"
                      onClick={() => setQty((v) => Math.min(99, v + 1))}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="row">
                  <span>Total</span>
                  <span className="total">${total.toFixed(2)}</span>
                </div>

                <div className="btnRow">
                  <button
                    className="btnAdd"
                    type="button"
                    onClick={handleAgregar}
                  >
                    <ShoppingCart size={18} /> Agregar al carrito
                  </button>

                  {isPizza ? (
                    <button
                      className="btnCustom"
                      type="button"
                      onClick={() =>
                        nav(
                          `/personalizar/${selectedSize?.producto_id || producto.id}?producto_tamanio_id=${selectedSize?.producto_tamanio_id || ""}`,
                        )
                      }
                    >
                      <Settings size={18} /> Personalizar pizza
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="pmya-panel" style={{ marginTop: 14 }}>
                <div className="secTitle" style={{ marginTop: 0 }}>
                  Información adicional
                </div>
                <ul className="infoList">
                  <li>Entrega aproximada de 40–50 minutos.</li>
                  <li>
                    El precio se calcula de acuerdo con el tamaño seleccionado.
                  </li>
                  <li>
                    Los datos se validan nuevamente al confirmar el pedido.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
