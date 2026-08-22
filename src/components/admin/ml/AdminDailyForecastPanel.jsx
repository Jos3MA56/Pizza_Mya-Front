import { useState } from "react";
import { useAuth } from "../../../context/AuthContext.jsx";
import { adminMlApi } from "../../../api/adminMl.api.js";
import AdminButton from "../ui/AdminButton.jsx";
import AdminPanel from "../ui/AdminPanel.jsx";
import { adminTheme } from "../ui/adminTheme.js";

const MAE_DOCUMENTADO = 5.2369;

function getLocalDateValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatNumber(value, digits = 0) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "â€”";
  }

  return number.toLocaleString("es-MX", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatDate(value) {
  if (!value) return "â€”";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function AdminDailyForecastPanel() {
  const { token } = useAuth();

  const [fecha, setFecha] = useState(() => getLocalDateValue());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function calculate() {
    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await adminMlApi.predictDailyPizzas({
        token,
        fecha,
      });

      setResult(response);
    } catch (err) {
      setError(
        err?.message || "No fue posible calcular la predicciÃ³n diaria.",
      );
    } finally {
      setLoading(false);
    }
  }

  const features = result?.features || {};
  const prediction = result?.prediction || {};

  const decimalPrediction = Number(prediction.pizzas_estimadas_decimal);

  const lowerLimit = Number.isFinite(decimalPrediction)
    ? Math.max(0, decimalPrediction - MAE_DOCUMENTADO)
    : null;

  const upperLimit = Number.isFinite(decimalPrediction)
    ? decimalPrediction + MAE_DOCUMENTADO
    : null;

  return (
    <AdminPanel
      title="Predicción diaria de pizzas"
      subtitle="Resultado generado por el modelo de regresión entrenado en la libreta."
    >
      <div className="regression-demo">
        <style>{`
          .regression-demo {
            display: grid;
            gap: 18px;
          }

          .regression-controls {
            display: grid;
            grid-template-columns:
              minmax(210px, 300px)
              minmax(220px, 1fr);
            gap: 12px;
            align-items: end;
          }

          .regression-date-input {
            width: 100%;
            min-height: 48px;
            padding: 0 14px;
            border: 1px solid
              ${adminTheme.colors.borderStrong};
            border-radius: 13px;
            background: #fff;
            color: ${adminTheme.colors.text};
            font-size: 15px;
            font-weight: 800;
          }

          .regression-main-result {
            display: grid;
            grid-template-columns:
              minmax(260px, .8fr)
              minmax(0, 1.2fr);
            gap: 14px;
          }

          .regression-prediction-card {
            display: grid;
            align-content: center;
            min-height: 190px;
            padding: 24px;
            border: 1px solid #fdba74;
            border-radius: 20px;
            background:
              linear-gradient(135deg, #fff7ed, #ffffff);
            box-shadow:
              0 12px 28px rgba(154, 52, 18, 0.08);
          }

          .regression-prediction-label {
            color: #9a3412;
            font-size: 12px;
            font-weight: 950;
            letter-spacing: .05em;
            text-transform: uppercase;
          }

          .regression-prediction-value {
            margin-top: 8px;
            color: ${adminTheme.colors.text};
            font-size: clamp(38px, 7vw, 64px);
            font-weight: 1000;
            line-height: 1;
          }

          .regression-prediction-date {
            margin-top: 12px;
            color: ${adminTheme.colors.textSoft};
            font-size: 13px;
            font-weight: 700;
            text-transform: capitalize;
          }

          .regression-summary-grid {
            display: grid;
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 12px;
          }

          .regression-card {
            min-width: 0;
            padding: 15px;
            border: 1px solid
              ${adminTheme.colors.border};
            border-radius: 16px;
            background: #fff;
          }

          .regression-card-label {
            color: ${adminTheme.colors.textSoft};
            font-size: 11px;
            font-weight: 900;
            letter-spacing: .035em;
            line-height: 1.35;
            text-transform: uppercase;
          }

          .regression-card-value {
            margin-top: 7px;
            color: ${adminTheme.colors.text};
            font-size: 18px;
            font-weight: 950;
            line-height: 1.35;
            overflow-wrap: anywhere;
          }

          .regression-history {
            display: grid;
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
            gap: 12px;
          }

          .regression-section-title {
            margin: 0 0 10px;
            color: ${adminTheme.colors.text};
            font-size: 15px;
            font-weight: 950;
          }

          .regression-interpretation {
            padding: 17px;
            border: 1px solid #bfdbfe;
            border-radius: 16px;
            background: #eff6ff;
            color: #1e3a8a;
            font-size: 14px;
            font-weight: 700;
            line-height: 1.65;
          }

          .regression-error {
            padding: 14px;
            border: 1px solid #fecdd3;
            border-radius: 14px;
            background: #fff1f2;
            color: #be123c;
            font-weight: 800;
          }

          @media (max-width: 900px) {
            .regression-main-result {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 680px) {
            .regression-controls,
            .regression-summary-grid,
            .regression-history {
              grid-template-columns: 1fr;
            }

            .regression-controls button {
              width: 100%;
            }

            .regression-prediction-card {
              min-height: 160px;
            }
          }
        `}</style>

        <div className="regression-controls">
          <label style={{ display: "grid", gap: 7 }}>
            <span
              style={{
                color: adminTheme.colors.textSoft,
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              Fecha a predecir
            </span>

            <input
              className="regression-date-input"
              type="date"
              value={fecha}
              onChange={(event) => {
                setFecha(event.target.value);
                setResult(null);
                setError("");
              }}
            />
          </label>

          <AdminButton
            type="button"
            onClick={calculate}
            loading={loading}
            loadingText="Calculando predicción..."
          >
            Calcular predicción
          </AdminButton>
        </div>

        {error ? <div className="regression-error">{error}</div> : null}

        {result ? (
          <>
            <div className="regression-main-result">
              <section className="regression-prediction-card">
                <div className="regression-prediction-label">
                  Predicción principal
                </div>

                <div className="regression-prediction-value">
                  {formatNumber(prediction.pizzas_estimadas, 0)}
                </div>

                <div
                  style={{
                    marginTop: 5,
                    color: adminTheme.colors.text,
                    fontSize: 18,
                    fontWeight: 900,
                  }}
                >
                  pizzas para el día
                </div>

                <div className="regression-prediction-date">
                  {formatDate(fecha)}
                </div>
              </section>

              <section>
                <h3 className="regression-section-title">
                  Resumen del resultado
                </h3>

                <div className="regression-summary-grid">
                  <ResultCard
                    label="Margen de error medio"
                    value={`± ${formatNumber(MAE_DOCUMENTADO, 2)} pizzas`}
                  />

                  <ResultCard
                    label="Rango estimado"
                    value={
                      lowerLimit === null || upperLimit === null
                        ? "—"
                        : `${formatNumber(lowerLimit, 1)} a ${formatNumber(
                            upperLimit,
                            1,
                          )} pizzas`
                    }
                  />
                </div>
              </section>
            </div>

            <section>
              <h3 className="regression-section-title">
                Datos históricos utilizados por el modelo
              </h3>

              <div className="regression-history">
                <ResultCard
                  label="Pizzas del día anterior"
                  value={formatNumber(features.pizzas_dia_anterior, 0)}
                />

                <ResultCard
                  label="Pizzas hace 7 días"
                  value={formatNumber(features.pizzas_hace_7_dias, 0)}
                />

                <ResultCard
                  label="Promedio de los 7 días anteriores"
                  value={formatNumber(features.promedio_7_dias, 2)}
                />
              </div>
            </section>

            <div className="regression-interpretation">
              <strong>Interpretación:</strong> para el {formatDate(fecha)}, el
              modelo estima{" "}
              <strong>
                {formatNumber(prediction.pizzas_estimadas, 0)} pizzas
              </strong>
              . Debido al error medio observado durante la evaluación, el
              resultado debe utilizarse como apoyo para la planeación y no como
              una cantidad exacta.
              <br />
              <strong>Acción sugerida:</strong>{" "}
              {prediction.accion_sugerida ||
                "Preparar insumos considerando el pronóstico y conservar un margen operativo."}
            </div>
          </>
        ) : null}
      </div>
    </AdminPanel>
  );
}

function ResultCard({ label, value }) {
  return (
    <div className="regression-card">
      <div className="regression-card-label">{label}</div>

      <div className="regression-card-value">{value}</div>
    </div>
  );
}
