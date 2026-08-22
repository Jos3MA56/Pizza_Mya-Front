// hooks/admin/useAdminPrediccionInsumos.js
import { useCallback, useEffect, useMemo, useState } from "react";
import { adminPrediccionInsumosApi } from "../../api/adminPrediccionInsumos.api.js";

const formatNumber = (value, digits = 2) =>
  Number(Number(value || 0)).toLocaleString("es-MX", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

const formatPeriod = (value, escala = "semana") => {
  const text = String(value ?? "").trim();
  if (!text) return "—";

  const date = new Date(text + "T00:00:00");
  if (!Number.isNaN(date.getTime())) {
    const options =
      escala === "mes"
        ? { month: "short", year: "numeric" }
        : escala === "dia"
          ? { day: "2-digit", month: "short" }
          : { day: "2-digit", month: "short", year: "numeric" };

    return new Intl.DateTimeFormat("es-MX", options).format(date);
  }
  return text;
};

const getTrendTone = (trend = "") => {
  const value = String(trend || "").toLowerCase();
  if (value.includes("crec")) return "accent";
  if (value.includes("decre")) return "info";
  if (value.includes("estab")) return "success";
  return "primary";
};

const formatDateLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 🔹 Función para calcular fechas iniciales según escala
const calcularFechasIniciales = (escala, periodos) => {
  const hoy = new Date();
  const fin = new Date(hoy.getTime() - hoy.getTimezoneOffset() * 60000);
  const inicio = new Date(fin);

  if (escala === "dia") {
    inicio.setDate(inicio.getDate() - 30);
  } else if (escala === "semana") {
    const semanas = Math.max(1, Math.min(periodos, 4));
    inicio.setDate(inicio.getDate() - semanas * 7);
  } else if (escala === "mes") {
    const meses = Math.max(1, Math.min(periodos, 4));
    inicio.setMonth(inicio.getMonth() - meses);
  }

  return {
    fechaInicio: formatDateLocal(inicio),
    fechaFin: formatDateLocal(fin),
  };
};

export function useAdminPrediccionInsumos(token) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [escala, setEscala] = useState("semana");
  const [periodos, setPeriodos] = useState(4);

  // 🔹 Inicializar con fechas calculadas
  const fechasIniciales = useMemo(
    () => calcularFechasIniciales("semana", 4),
    [],
  );

  const [fechaInicio, setFechaInicio] = useState(fechasIniciales.fechaInicio);
  const [fechaFin, setFechaFin] = useState(fechasIniciales.fechaFin);
  const [data, setData] = useState(null);

  // 🔹 Calcular fechas según escala (para mostrar en el rango)
  const fechasCalculadas = useMemo(() => {
    // Si hay fechas manuales (escala día), usarlas directamente
    if (escala === "dia" && fechaInicio && fechaFin) {
      return {
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
      };
    }

    // Para semana/mes, calcular automáticamente
    return calcularFechasIniciales(escala, periodos);
  }, [escala, periodos, fechaInicio, fechaFin]);

  const load = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        setError("");

        const response = await adminPrediccionInsumosApi.overview({
          token,
          escala,
          fechaInicio: fechasCalculadas.fechaInicio,
          fechaFin: fechasCalculadas.fechaFin,
          vista: escala,
        });

        setData(response);
      } catch (err) {
        console.error("❌ Error cargando predicción:", err);
        setError(err?.message || "No se pudo cargar la predicción de insumos.");
        setData(null);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [token, escala, fechasCalculadas],
  );

  useEffect(() => {
    if (token) {
      load();
    }
  }, [token]);

  // 🔹 Actualizar fechas cuando cambia la escala
  useEffect(() => {
    if (escala !== "dia") {
      const nuevasFechas = calcularFechasIniciales(escala, periodos);
      setFechaInicio(nuevasFechas.fechaInicio);
      setFechaFin(nuevasFechas.fechaFin);
    }
  }, [escala, periodos]);

  const lineChartData = useMemo(() => {
    if (!data?.historico?.length) return { historico: [], proyeccion: [] };

    return {
      historico: data.historico.map((item) => ({
        label: formatPeriod(item.periodo, escala),
        total: item.total_pizzas,
        tooltip: `${formatNumber(item.total_pizzas, 0)} pizzas · ${formatNumber(item.bolsas_queso)} bolsas`,
      })),
      proyeccion: (data.proyeccion || []).map((item) => ({
        label: formatPeriod(item.periodo, escala),
        total: item.total_pizzas,
        tooltip: `${formatNumber(item.total_pizzas, 0)} pizzas · ${formatNumber(item.bolsas_queso)} bolsas · Confianza: ${item.confianza}`,
        confianza: item.confianza,
      })),
    };
  }, [data, escala]);

  // 🔹 CORREGIDO: Mostrar TODOS los tamaños, incluso si son 0 (incluyendo Jumbo)
  const sizeProjectionData = useMemo(() => {
    if (!data?.tamanios) return [];
    return Object.values(data.tamanios).map((item) => ({
      label: item.nombre,
      total: item.proyectado_siguiente,
    }));
    // ← SIN .filter() para mostrar Individual, Mediana, Grande y Jumbo siempre
  }, [data]);

  // 🔹 CORREGIDO: Mostrar TODOS los tamaños en queso, incluso si son 0
  const cheeseBySizeData = useMemo(() => {
    if (!data?.queso_por_tamanio) return [];
    return data.queso_por_tamanio.map((item) => ({
      label: item.label,
      total: item.total,
      unit: "bolsas",
    }));
    // ← SIN .filter() para mostrar todos los tamaños
  }, [data]);

  // 🔹 CORREGIDO: Mostrar TODOS los tamaños en la dona, incluso si son 0
  const compositionDonutData = useMemo(() => {
    if (!data?.composicion_siguiente_semana) return [];
    return data.composicion_siguiente_semana.map((item) => ({
      label: item.label,
      total: item.total,
    }));
    // ← SIN .filter() para mostrar todos los tamaños
  }, [data]);

  return {
    loading,
    error,
    data,
    escala,
    setEscala,
    periodos,
    setPeriodos,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    fechasCalculadas,
    load,
    refresh: load,
    lineChartData,
    sizeProjectionData,
    cheeseBySizeData,
    compositionDonutData,
    formatNumber,
    formatPeriod,
    getTrendTone,
  };
}
