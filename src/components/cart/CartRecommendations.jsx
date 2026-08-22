import { useEffect, useMemo, useState } from "react";
import {
  buildMlCartProductNames,
  getCartRecommendations,
} from "../../api/ml.api.js";

export default function CartRecommendations({ items = [] }) {
  const [recommendations, setRecommendations] = useState([]);

  const productNames = useMemo(() => buildMlCartProductNames(items), [items]);

  const productKey = useMemo(
    () => JSON.stringify(productNames),
    [productNames],
  );

  useEffect(() => {
    if (!productNames.length) {
      setRecommendations([]);
      return undefined;
    }

    const controller = new AbortController();

    getCartRecommendations(items, {
      maximo: 3,
      signal: controller.signal,
    })
      .then((response) => {
        if (controller.signal.aborted) return;

        setRecommendations(
          Array.isArray(response?.recomendaciones)
            ? response.recomendaciones
            : [],
        );
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setRecommendations([]);
      });

    return () => controller.abort();
  }, [productKey]);

  if (!productNames.length || recommendations.length === 0) {
    return null;
  }

  return (
    <section
      className="pmya-simpleRecommendations"
      aria-label="Complementos sugeridos"
    >
      <style>{`
        .pmya-simpleRecommendations,
        .pmya-simpleRecommendations * {
          box-sizing: border-box;
        }

        .pmya-simpleRecommendations {
          margin-top: 18px;
          padding: 16px;
          border: 1px solid #fed7aa;
          border-radius: 22px;
          background: linear-gradient(145deg, #fff8f1, #ffffff);
          box-shadow: 0 10px 26px rgba(154, 52, 18, 0.07);
        }

        .pmya-simpleTitle {
          margin: 0 0 13px;
          color: #9a3412;
          font-size: 17px;
          font-weight: 1000;
          line-height: 1.3;
        }

        .pmya-simpleList {
          display: grid;
          gap: 10px;
        }

        .pmya-simpleProduct {
          margin: 0;
          padding: 14px 16px;
          border: 1px solid #fed7aa;
          border-radius: 16px;
          background: #ffffff;
          color: #1f2937;
          font-size: 14px;
          font-weight: 1000;
          line-height: 1.4;
          overflow-wrap: anywhere;
          box-shadow: 0 5px 14px rgba(154, 52, 18, 0.05);
        }

        @media (max-width: 380px) {
          .pmya-simpleRecommendations {
            padding: 13px;
            border-radius: 19px;
          }

          .pmya-simpleTitle {
            font-size: 16px;
          }

          .pmya-simpleProduct {
            padding: 12px 14px;
            font-size: 13px;
          }
        }
      `}</style>

      <h3 className="pmya-simpleTitle">Recomendaciones de producto(s)</h3>

      <div className="pmya-simpleList">
        {recommendations.map((recommendation, index) => (
          <p
            className="pmya-simpleProduct"
            key={`${recommendation.producto}-${index}`}
          >
            {recommendation.producto}
          </p>
        ))}
      </div>
    </section>
  );
}
