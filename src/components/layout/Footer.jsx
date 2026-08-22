import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  MapPin,
  Phone,
  Clock3,
  BadgePercent,
} from "lucide-react";
import { useEffect, useState } from "react";
import { buildApiUrl, httpJson } from "../../api/http.js";

const fullBleed = {
  width: "100vw",
  marginLeft: "calc(50% - 50vw)",
};

const WhatsAppIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.121 1.535 5.856L.057 23.857a.75.75 0 0 0 .92.92l6.079-1.474A11.955 11.955 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.73 9.73 0 0 1-4.953-1.354l-.354-.21-3.657.887.904-3.583-.23-.37A9.718 9.718 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
  </svg>
);

const quickLinks = [
  ["Inicio", "/"],
  ["Catálogo", "/catalogo"],
  ["Promociones", "/combos"],
  ["Mi pedido", "/mi-pedido"],
  ["Galería", "/galeria"],
  ["Nosotros", "/nosotros"],
];

const legalLinks = [
  ["Términos y condiciones", "/terminos"],
  ["Aviso de privacidad", "/aviso-privacidad"],
  ["Política de pedidos", "/politica-pedidos"],
  ["Cambios y cancelaciones", "/cancelaciones"],
  ["Uso de cookies", "/cookies"],
];

export default function Footer() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const raw = localStorage.getItem("pmya_config");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object") {
            setConfig(parsed);
            return;
          }
        }

        const json = await httpJson(buildApiUrl("/api/configuracion"));

        const configData =
          json?.data ||
          json?.result?.rows?.[0] ||
          json?.rows?.[0] ||
          json?.rows ||
          json ||
          null;

        if (configData && typeof configData === "object") {
          setConfig(configData);
          localStorage.setItem("pmya_config", JSON.stringify(configData));
        }
      } catch (error) {
        console.error("Error loading config:", error);
      }
    };

    loadConfig();
    window.addEventListener("configUpdated", loadConfig);
    return () => window.removeEventListener("configUpdated", loadConfig);
  }, []);

  const safeConfig = config || {};

  return (
    <>
      <style>{`
        .pmya-footer {
          background: linear-gradient(180deg, #241b17 0%, #171210 100%);
          color: #fffaf6;
        }
        .pmya-footer a { color: rgba(255,250,246,.78); text-decoration: none; }
        .pmya-footer a:hover { color: #ffffff; }
        .pmya-footerCard {
          border: 1px solid rgba(255,255,255,.08);
          background: rgba(255,255,255,.04);
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 18px 40px rgba(0,0,0,.14);
        }
        .pmya-social {
          width: 42px; height: 42px; border-radius: 14px;
          background: rgba(255,255,255,.10); display: inline-flex;
          align-items: center; justify-content: center;
          transition: transform .2s ease, background .2s ease;
        }
        .pmya-social:hover { transform: translateY(-2px); }
        .pmya-social.instagram:hover { background: rgba(195,146,91,.38); }
        .pmya-social.facebook:hover { background: rgba(143,45,31,.34); }
        .pmya-footList { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
        .pmya-footInfo {
          display:flex; align-items:flex-start; gap:10px;
          color: rgba(255,250,246,.86); margin-bottom: 12px;
          line-height:1.6;
        }
        .pmya-footBadge {
          display:inline-flex; align-items:center; gap:8px;
          border-radius:999px; padding:10px 14px;
          background: rgba(195,146,91,.18); color:#fffaf6;
          font-weight:800; font-size:13px; border:1px solid rgba(255,255,255,.1);
          margin-bottom: 14px;
        }
        .wa-float {
          position: fixed; bottom: 24px; right: 24px; z-index: 9999;
          width: 58px; height: 58px; border-radius: 50%;
          background: #25D366; color: #fff;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 16px rgba(37,211,102,0.5);
          transition: transform .2s, box-shadow .2s;
        }
        .wa-float:hover { transform: scale(1.06); box-shadow: 0 6px 24px rgba(37,211,102,0.65); color: #fff; }
        
        @media (max-width: 980px) {
          .pmya-footer-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .pmya-footer-grid {
            grid-template-columns: 1fr !important;
          }
          .pmya-footer-card-mobile {
            padding: 18px !important;
          }
          .pmya-footer h3 {
            font-size: 1.2rem !important;
          }
          .pmya-footer h4 {
            font-size: 1rem !important;
          }
          .wa-float {
            bottom: 90px !important;
            right: 16px !important;
            width: 52px !important;
            height: 52px !important;
          }
        }
      `}</style>

      <footer
        className="pmya-footer"
        style={{ padding: "52px 20px 34px", ...fullBleed }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            className="pmya-footer-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1.15fr .9fr .9fr 1fr",
              gap: "20px",
            }}
          >
            <div className="pmya-footerCard pmya-footer-card-mobile">
              <h3 style={{ margin: "0 0 10px", fontSize: "1.4rem" }}>
                {safeConfig.nombre_negocio || "Pizza Mya"}
              </h3>
              <p
                style={{
                  margin: 0,
                  color: "rgba(255,250,246,.80)",
                  lineHeight: 1.75,
                  fontSize: "0.95rem",
                }}
              >
                Pizzas, combos y complementos preparados para compartir en
                familia o con amigos.
              </p>
              <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
                <a
                  className="pmya-social instagram"
                  href={
                    safeConfig.instagram_url ||
                    "https://www.instagram.com/pizzamya"
                  }
                  aria-label="Instagram de Pizza Mya"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram size={18} color="rgba(255,250,246,.82)" />
                </a>
                <a
                  className="pmya-social facebook"
                  href={
                    safeConfig.facebook_url ||
                    "https://www.facebook.com/pizzamya"
                  }
                  aria-label="Facebook de Pizza Mya"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook size={18} color="rgba(255,250,246,.82)" />
                </a>
              </div>
            </div>

            <div className="pmya-footerCard pmya-footer-card-mobile">
              <h4
                style={{ marginTop: 0, marginBottom: 14, fontSize: "1.05rem" }}
              >
                Navegación
              </h4>
              <ul className="pmya-footList">
                {quickLinks.map(([label, href]) => (
                  <li key={href}>
                    <Link to={href}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pmya-footerCard pmya-footer-card-mobile">
              <h4
                style={{ marginTop: 0, marginBottom: 14, fontSize: "1.05rem" }}
              >
                Información
              </h4>
              <ul className="pmya-footList">
                {legalLinks.map(([label, href], index) => (
                  <li key={`${href}-${index}`}>
                    <Link to={href}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pmya-footerCard pmya-footer-card-mobile">
              <h4
                style={{ marginTop: 0, marginBottom: 14, fontSize: "1.05rem" }}
              >
                Contacto
              </h4>
              <div className="pmya-footInfo">
                <Phone size={18} style={{ flexShrink: 0 }} />
                <span style={{ wordBreak: "break-word" }}>
                  {safeConfig.telefono || "7713539315"}
                </span>
              </div>
              <div className="pmya-footInfo">
                <MapPin size={18} style={{ flexShrink: 0 }} />
                <span style={{ wordBreak: "break-word" }}>
                  {safeConfig.direccion || "Centro, Huejutla Hidalgo, México"}
                </span>
              </div>
              <div className="pmya-footInfo" style={{ marginBottom: 0 }}>
                <Clock3 size={18} style={{ flexShrink: 0 }} />
                <span>
                  {(safeConfig.hora_apertura || "--:--") +
                    " - " +
                    (safeConfig.hora_cierre || "--:--")}
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              textAlign: "center",
              marginTop: "24px",
              paddingTop: "20px",
              borderTop: "1px solid rgba(255,255,255,.12)",
              color: "rgba(255,250,246,.68)",
              fontSize: "0.9rem",
            }}
          >
            <p style={{ margin: 0 }}>
              ©{" "}
              {safeConfig.mensaje_footer ||
                `${new Date().getFullYear()} Pizza Mya. Todos los derechos reservados.`}
            </p>
          </div>
        </div>
      </footer>

      <a
        className="wa-float"
        href={`https://wa.me/${safeConfig.whatsapp_pedidos || "527713539315"}?text=Hola%2C%20quiero%20hacer%20un%20pedido`}
        aria-label="Enviar mensaje por WhatsApp a Pizza Mya"
        target="_blank"
        rel="noopener noreferrer"
      >
        <WhatsAppIcon />
      </a>
    </>
  );
}
