import { useEffect, useMemo, useState, useId } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { productosApi } from "../../api/productos.api.js";
import { useCart } from "../../context/CarritoContext.jsx";
import { useToast } from "../../components/ui/ToastProvider.jsx";
import {
  getDisplayPizzaName,
  normalizeProductVariants,
  parseTamano,
} from "../../utils/productVariants.js";

export default function PersonalizarPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const productoTamanioIdParam =
    searchParams.get("producto_tamanio_id") ||
    searchParams.get("productoTamanioId") ||
    searchParams.get("variant") ||
    null;
  const nav = useNavigate();
  const { addItem } = useCart();
  const toast = useToast();
  const sectionBaseId = useId();

  const [p, setP] = useState(null);
  const [allProductos, setAllProductos] = useState([]);
  const [productoTamanioId, setProductoTamanioId] = useState(null);

  const [masas, setMasas] = useState([]);
  const [salsas, setSalsas] = useState([]);
  const [ingredientesProd, setIngredientesProd] = useState([]);

  const [orillas, setOrillas] = useState([]);
  const [extras, setExtras] = useState([]);

  const [masaId, setMasaId] = useState(null);
  const [salsaId, setSalsaId] = useState(null);

  const [orillaId, setOrillaId] = useState(null);
  const [sinIds, setSinIds] = useState([]);
  const [selExtras, setSelExtras] = useState([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        const [prodResult, productosResult] = await Promise.allSettled([
          productosApi.getProducto(id),
          productosApi.getProductos(),
        ]);

        if (prodResult.status !== "fulfilled") {
          throw prodResult.reason || new Error("No se pudo cargar el producto");
        }

        const prod = prodResult.value;
        const productosOk =
          productosResult.status === "fulfilled" &&
          Array.isArray(productosResult.value)
            ? productosResult.value
            : [];

        const [o, e, m, s, ingP] = await Promise.allSettled([
          productosApi.getOrillas(),
          productosApi.getExtrasProducto(id),
          productosApi.getMasas(),
          productosApi.getSalsasProducto(id),
          productosApi.getIngredientesProducto(id),
        ]);

        if (!alive) return;

        setP(prod);
        setAllProductos(productosOk);

        const variantes = normalizeProductVariants(prod, productosOk);
        const varianteSeleccionada =
          variantes.find(
            (item) =>
              productoTamanioIdParam &&
              String(item.producto_tamanio_id) ===
                String(productoTamanioIdParam),
          ) ||
          variantes[0] ||
          null;

        setProductoTamanioId(varianteSeleccionada?.producto_tamanio_id || null);
        setOrillas(o.status === "fulfilled" ? o.value : []);
        setExtras(e.status === "fulfilled" ? e.value : []);
        setMasas(m.status === "fulfilled" ? m.value : []);
        setSalsas(s.status === "fulfilled" ? s.value : []);
        setIngredientesProd(ingP.status === "fulfilled" ? ingP.value : []);

        const masasOk = m.status === "fulfilled" ? m.value : [];
        const salsasOk = s.status === "fulfilled" ? s.value : [];

        setMasaId(masasOk[0]?.id ?? null);
        setSalsaId(
          salsasOk.find((item) => item.default_sel)?.id ||
            salsasOk[0]?.id ||
            null,
        );

        setSinIds([]);
        setSelExtras([]);
        setOrillaId(null);
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "Error");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => (alive = false);
  }, [id, productoTamanioIdParam]);

  const tamanios = useMemo(
    () => normalizeProductVariants(p, allProductos),
    [p, allProductos],
  );

  const selectedTamanio = useMemo(() => {
    return (
      tamanios.find(
        (item) =>
          productoTamanioId &&
          String(item.producto_tamanio_id) === String(productoTamanioId),
      ) ||
      tamanios[0] ||
      null
    );
  }, [tamanios, productoTamanioId]);

  const precioBase = Number(
    selectedTamanio?.precio_base ?? p?.precio_base ?? 0,
  );

  const extrasTotal = useMemo(() => {
    return selExtras.reduce(
      (acc, x) => acc + Number(x.costo_snapshot || 0) * Number(x.cantidad || 1),
      0,
    );
  }, [selExtras]);

  const orillaCosto = useMemo(() => {
    const o = orillas.find((x) => x.id === orillaId);
    return o ? Number(o.costo_extra || 0) : 0;
  }, [orillas, orillaId]);

  const masaCosto = useMemo(() => {
    const m = masas.find((x) => x.id === masaId);
    return m ? Number(m.costo_extra || 0) : 0;
  }, [masas, masaId]);

  const salsaCosto = useMemo(() => {
    const s = salsas.find((x) => x.id === salsaId);
    return s ? Number(s.costo_extra || 0) : 0;
  }, [salsas, salsaId]);

  const total = useMemo(() => {
    return precioBase + extrasTotal + orillaCosto + masaCosto + salsaCosto;
  }, [precioBase, extrasTotal, orillaCosto, masaCosto, salsaCosto]);

  const toggleSinId = (ingId) => {
    setSinIds((prev) =>
      prev.includes(ingId) ? prev.filter((x) => x !== ingId) : [...prev, ingId],
    );
  };

  const toggleExtra = (extra) => {
    setSelExtras((prev) => {
      const idx = prev.findIndex((x) => x.extra_id === extra.id);
      if (idx !== -1) return prev.filter((x) => x.extra_id !== extra.id);
      return [
        ...prev,
        {
          extra_id: extra.id,
          nombre_snapshot: extra.nombre,
          costo_snapshot: extra.costo,
          cantidad: 1,
        },
      ];
    });
  };

  const changeExtraQty = (extra_id, qty) => {
    setSelExtras((prev) =>
      prev.map((x) =>
        x.extra_id === extra_id ? { ...x, cantidad: Math.max(1, qty) } : x,
      ),
    );
  };

  const selectedMasa = masas.find((x) => x.id === masaId);
  const selectedSalsa = salsas.find((x) => x.id === salsaId);
  const tamano = useMemo(
    () =>
      selectedTamanio?.tamanio ||
      parseTamano(p?.nombre || "") ||
      p?.tamanio ||
      "Estándar",
    [selectedTamanio, p],
  );

  const displayName = useMemo(() => getDisplayPizzaName(p), [p]);
  const selectedProductoId = selectedTamanio?.producto_id || p?.id;
  const selectedImage = selectedTamanio?.imagen_url || p?.imagen_url || null;

  const addPizzaToCart = () => {
    addItem({
      productoId: selectedProductoId,
      producto_tamanio_id: selectedTamanio?.producto_tamanio_id || null,
      tamanio_id: selectedTamanio?.tamanio_id || null,
      nombre: displayName || p.nombre,
      precioUnitario: Number(total || 0),
      imagen_url: selectedImage,
      cantidad: 1,
      tamano,
      orilla_id: orillaId,
      orilla: orillaId,
      masa_id: masaId,
      salsa_id: salsaId,
      sin: sinIds,
      extras: selExtras,
    });

    toast.success("Pizza agregada al carrito.", "Carrito actualizado");
  };

  return (
    <>
      <style>{`
        .pmya-wrap{ max-width:1100px; margin:0 auto; padding: 26px 22px 60px; }
        .pmya-top{ display:flex; justify-content: space-between; align-items:center; margin-bottom: 14px; }
        .pmya-back{ background:transparent; border:none; cursor:pointer; font-weight:800; color:#111; }

        .pmya-shell{
          background:#fff; border-radius: 16px;
          box-shadow:0 10px 22px rgba(0,0,0,.08);
          border:1px solid #eee; overflow:hidden;
        }

        .pmya-grid{
          display:grid;
          grid-template-columns: 340px 1fr;
          gap: 18px;
          padding: 18px;
          align-items: start;
        }
        @media (max-width: 980px){
          .pmya-grid{ grid-template-columns:1fr; }
        }

        .leftCard{
          border:1px solid #eee;
          border-radius: 14px;
          overflow:hidden;
          background:#fff;
        }
        .leftHead{
          background:#FF6A00;
          color:#fff;
          font-weight: 1000;
          font-size: 12px;
          text-align:center;
          padding: 10px 12px;
          letter-spacing:.3px;
        }
        .leftBody{ padding: 12px; }
        .pTitle{ font-weight: 1000; font-size: 14px; margin: 0; color:#111; }
        .pDesc{ margin: 6px 0 0; font-size: 12px; color:#666; line-height:1.4; }
        .pMeta{ margin-top: 8px; font-size: 12px; color:#444; display:grid; gap:6px; }
        .pMeta b{ font-weight: 900; }

        .leftImg{
          margin-top: 10px;
          height: 300px;
          border-radius: 12px;
          overflow:hidden;
          background:#f1f1f1;
        }
        .leftImg img{ width:100%; height:100%; object-fit:cover; display:block; }

        .btnAddRed{
          width:100%;
          margin-top: 12px;
          background:#B80E0E;
          color:#fff;
          border:none;
          border-radius: 12px;
          padding: 12px 14px;
          font-weight: 1000;
          cursor:pointer;
          text-transform: uppercase;
          letter-spacing:.4px;
        }

        .rightCard{
          border:1px solid #eee;
          border-radius: 14px;
          overflow:hidden;
          background:#fff;
        }
        .rightHeader{
          padding: 12px 14px;
          display:flex;
          align-items:center;
          justify-content: space-between;
          border-bottom: 1px solid #eee;
        }
        .rightHeader h2{
          margin:0;
          font-size: 14px;
          font-weight: 1000;
          color:#111;
          letter-spacing:.2px;
        }
        .closeBtn{
          width: 34px; height: 34px;
          border-radius: 10px;
          border:1px solid #eee;
          background:#fff;
          cursor:pointer;
          font-weight: 1000;
        }

        .scrollArea{
          max-height: 560px;
          overflow: auto;
          padding: 12px 14px 14px;
        }
        @media (max-width:980px){
          .scrollArea{ max-height: none; overflow: visible; }
        }

        .bar{
          background:#FF6A00;
          color:#fff;
          font-weight: 1000;
          font-size: 12px;
          padding: 8px 10px;
          border-radius: 10px;
          margin: 10px 0 10px;
          text-transform: uppercase;
        }

        .optRow{
          padding: 10px 8px;
          border-bottom: 1px solid #f0f0f0;
        }
        .optRow:last-child{ border-bottom: none; }

        .optTitle{
          display:flex; justify-content: space-between; align-items:flex-start; gap: 10px;
          font-size: 13px; font-weight: 1000; color:#111;
        }
        .optDesc{ margin-top: 4px; font-size: 12px; color:#666; line-height:1.4; }

        .gridChecks{
          display:grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px 18px;
          padding: 6px 2px 2px;
        }
        @media (max-width: 520px){ .gridChecks{ grid-template-columns: 1fr; } }

        .check{
          display:flex; gap: 8px; align-items:center;
          font-size: 12px; color:#333; font-weight: 800;
        }
        .check input{ transform: translateY(1px); }

        .extrasList{ display:grid; gap:10px; margin-top: 8px; }
        .extraItem{
          display:flex; align-items:center; justify-content: space-between; gap: 10px;
          padding: 10px 10px;
          border:1px solid #eee;
          border-radius: 12px;
          background:#fff;
        }
        .extraLeft{ display:flex; gap:10px; align-items:center; }
        .thumb{
          width: 40px; height: 40px;
          border-radius: 10px;
          background:#f2f2f2;
          overflow:hidden;
        }
        .thumb img{ width:100%; height:100%; object-fit:cover; display:block; }
        .extraName{ font-weight: 1000; font-size: 12px; color:#111; }
        .extraSub{ font-size: 11px; color:#666; margin-top: 2px; }

        .plusBtn{
          width: 28px; height: 28px;
          border-radius: 999px;
          border:none;
          background:#FF6A00;
          color:#fff;
          font-weight: 1000;
          cursor:pointer;
        }

        .miniQty{
          display:flex; align-items:center; gap: 6px;
          margin-left: 10px;
        }
        .miniQty button{
          width: 26px; height: 26px;
          border-radius: 999px;
          border:1px solid #eee;
          background:#fff;
          cursor:pointer;
          font-weight: 1000;
        }
        .miniQty span{
          min-width: 18px;
          text-align:center;
          font-weight: 1000;
        }

        .totalBox{
          margin-top: 12px;
          border-top: 1px solid #eee;
          padding-top: 12px;
          display:flex;
          justify-content: space-between;
          align-items:center;
          gap: 12px;
        }
        .totalPrice{ font-size: 20px; font-weight: 1000; color:#B80E0E; }
        .btnGoCart{
          background:#B80E0E;
          color:#fff;
          border:none;
          border-radius: 12px;
          padding: 10px 12px;
          font-weight: 1000;
          cursor:pointer;
        }
      `}</style>

      <div className="pmya-wrap">
        {loading && <div>Cargando...</div>}
        {err && <div style={{ color: "#b00" }}>{err}</div>}

        {!loading && !err && p && (
          <div className="pmya-shell">
            <div className="pmya-grid">
              <div className="leftCard">
                <div className="leftHead">MI PIZZA</div>
                <div className="leftBody">
                  <p className="pTitle">{displayName}</p>
                  <p className="pDesc">
                    {p.descripcion ||
                      "Deliciosa pizza con ingredientes frescos."}
                  </p>

                  <div className="pMeta">
                    <div>
                      Masa: <b>{selectedMasa?.nombre || "—"}</b>
                    </div>
                    <div>
                      Salsa: <b>{selectedSalsa?.nombre || "—"}</b>
                    </div>
                    {tamano ? (
                      <div>
                        Tamaño: <b>{tamano}</b>
                      </div>
                    ) : null}
                  </div>

                  <div className="leftImg">
                    {selectedImage ? (
                      <img src={selectedImage} alt={displayName} />
                    ) : null}
                  </div>

                  <button
                    className="btnAddRed"
                    type="button"
                    onClick={addPizzaToCart}
                  >
                    AGREGAR
                  </button>
                </div>
              </div>

              <div className="rightCard">
                <div className="rightHeader">
                  <h2>ARMA TU PIZZA</h2>
                  <button
                    className="closeBtn"
                    type="button"
                    onClick={() => nav(-1)}
                    aria-label="Cerrar personalización y volver"
                  >
                    ×
                  </button>
                </div>

                <div className="scrollArea">
                  <div className="bar" id={`${sectionBaseId}-masa`}>
                    1. TAMAÑO Y MASA
                  </div>

                  {tamanios.length > 1 ? (
                    <div style={{ marginBottom: 12 }}>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#666",
                          fontWeight: 800,
                          marginBottom: 8,
                        }}
                      >
                        Tamaño seleccionado
                      </div>
                      <div
                        role="radiogroup"
                        aria-label="Selecciona el tamaño de la pizza"
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit,minmax(130px,1fr))",
                          gap: 8,
                        }}
                      >
                        {tamanios.map((t) => (
                          <label
                            key={t.producto_tamanio_id}
                            style={{
                              border:
                                String(productoTamanioId) ===
                                String(t.producto_tamanio_id)
                                  ? "2px solid #FF6A00"
                                  : "1px solid #eee",
                              borderRadius: 12,
                              padding: "10px 12px",
                              cursor: "pointer",
                              fontWeight: 900,
                              background: "#fff",
                            }}
                          >
                            <input
                              type="radio"
                              name="producto_tamanio"
                              checked={
                                String(productoTamanioId) ===
                                String(t.producto_tamanio_id)
                              }
                              onChange={() =>
                                setProductoTamanioId(t.producto_tamanio_id)
                              }
                              style={{ marginRight: 6 }}
                            />
                            {t.tamanio}
                            <div
                              style={{
                                color: "#FF6A00",
                                fontSize: 12,
                                marginTop: 4,
                              }}
                            >
                              ${Number(t.precio_base || 0).toFixed(2)}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div
                    role="radiogroup"
                    aria-labelledby={`${sectionBaseId}-masa`}
                  >
                    {masas.length === 0 ? (
                      <div style={{ color: "#666", fontSize: 13 }}>
                        Por el momento no hay masas disponibles para
                        personalizar esta pizza.
                      </div>
                    ) : (
                      masas.map((m) => (
                        <div className="optRow" key={m.id}>
                          <div className="optTitle">
                            <label
                              style={{
                                display: "flex",
                                gap: 8,
                                alignItems: "center",
                              }}
                            >
                              <input
                                type="radio"
                                name="masa"
                                checked={masaId === m.id}
                                onChange={() => setMasaId(m.id)}
                              />
                              {m.nombre}{" "}
                              {Number(m.costo_extra || 0) > 0
                                ? `(+${Number(m.costo_extra).toFixed(0)})`
                                : ""}
                            </label>
                          </div>
                          <div className="optDesc">{m.descripcion || "—"}</div>
                        </div>
                      ))
                    )}
                  </div>

                  <div
                    className="bar"
                    style={{ marginTop: 14 }}
                    id={`${sectionBaseId}-salsa`}
                  >
                    3. SALSA
                  </div>

                  <div
                    role="radiogroup"
                    aria-labelledby={`${sectionBaseId}-salsa`}
                  >
                    {salsas.length === 0 ? (
                      <div style={{ color: "#666", fontSize: 13 }}>
                        Por el momento no hay salsas disponibles para
                        personalizar esta pizza.
                      </div>
                    ) : (
                      salsas.map((s) => (
                        <div className="optRow" key={s.id}>
                          <label className="check">
                            <input
                              type="radio"
                              name="salsa"
                              checked={salsaId === s.id}
                              onChange={() => setSalsaId(s.id)}
                            />
                            {s.nombre}{" "}
                            {Number(s.costo_extra || 0) > 0
                              ? `(+${Number(s.costo_extra).toFixed(0)})`
                              : ""}
                          </label>
                          {s.descripcion ? (
                            <div className="optDesc">{s.descripcion}</div>
                          ) : null}
                        </div>
                      ))
                    )}
                  </div>

                  <div
                    className="bar"
                    style={{ marginTop: 14 }}
                    id={`${sectionBaseId}-ingredientes`}
                  >
                    4. INGREDIENTES
                  </div>

                  <div
                    role="group"
                    aria-labelledby={`${sectionBaseId}-ingredientes`}
                  >
                    {ingredientesProd.length === 0 ? (
                      <div style={{ color: "#666", fontSize: 13 }}>
                        Esta pizza no tiene ingredientes configurados para
                        personalización en este momento.
                      </div>
                    ) : (
                      <>
                        <div className="optTitle" style={{ marginTop: 6 }}>
                          <span>
                            Ingredientes incluidos (desmarca los que quieras
                            quitar)
                          </span>
                        </div>

                        <div className="gridChecks" style={{ marginTop: 6 }}>
                          {ingredientesProd.map((ing) => (
                            <label className="check" key={ing.id}>
                              <input
                                type="checkbox"
                                checked={!sinIds.includes(ing.id)}
                                onChange={() => toggleSinId(ing.id)}
                              />
                              {ing.nombre}
                            </label>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div
                    className="bar"
                    style={{ marginTop: 14 }}
                    id={`${sectionBaseId}-extras`}
                  >
                    5. AGREGAR SALSAS/DIPS
                  </div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    Puedes aplicar cargos adicionales
                  </div>

                  <div role="group" aria-labelledby={`${sectionBaseId}-extras`}>
                    {extras.length === 0 ? (
                      <div
                        style={{ color: "#666", fontSize: 13, marginTop: 8 }}
                      >
                        Por el momento no hay extras disponibles para agregar.
                      </div>
                    ) : (
                      <div className="extrasList">
                        {extras.map((ex) => {
                          const row = selExtras.find(
                            (x) => x.extra_id === ex.id,
                          );
                          const selected = !!row;

                          return (
                            <div className="extraItem" key={ex.id}>
                              <div className="extraLeft">
                                <div className="thumb">
                                  {ex.imagen_url ? (
                                    <img src={ex.imagen_url} alt={ex.nombre} />
                                  ) : null}
                                </div>
                                <div>
                                  <div className="extraName">{ex.nombre}</div>
                                  <div className="extraSub">
                                    +${Number(ex.costo || 0).toFixed(0)}
                                  </div>
                                </div>
                              </div>

                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                {!selected ? (
                                  <button
                                    className="plusBtn"
                                    type="button"
                                    onClick={() => toggleExtra(ex)}
                                    aria-label={`Agregar extra ${ex.nombre}`}
                                  >
                                    +
                                  </button>
                                ) : (
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <button
                                      className="plusBtn"
                                      type="button"
                                      onClick={() => toggleExtra(ex)}
                                      title="Quitar"
                                      aria-label={`Quitar extra ${ex.nombre}`}
                                      style={{
                                        background: "#ddd",
                                        color: "#111",
                                      }}
                                    >
                                      ×
                                    </button>

                                    <div className="miniQty">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          changeExtraQty(
                                            ex.id,
                                            row.cantidad - 1,
                                          )
                                        }
                                        aria-label={`Disminuir cantidad de ${ex.nombre}`}
                                      >
                                        −
                                      </button>
                                      <span aria-live="polite">
                                        {row.cantidad}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          changeExtraQty(
                                            ex.id,
                                            row.cantidad + 1,
                                          )
                                        }
                                        aria-label={`Aumentar cantidad de ${ex.nombre}`}
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="totalBox">
                    <div style={{ fontWeight: 1000, color: "#111" }}>Total</div>
                    <div className="totalPrice">
                      ${Number(total || 0).toFixed(0)}
                    </div>
                    <button
                      className="btnGoCart"
                      type="button"
                      onClick={addPizzaToCart}
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
