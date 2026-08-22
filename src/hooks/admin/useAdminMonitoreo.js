import { useCallback, useEffect, useState } from "react";
import { adminMonitoringApi } from "../../api/adminMonitoring.api.js";

export function useAdminMonitoring(token) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const load = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        setError("");
        const res = await adminMonitoringApi.overview({ token });
        setData(res?.data || res || null);
      } catch (err) {
        setError(err?.message || "No se pudo cargar el monitoreo.");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    if (token) load();
  }, [token, load]);

  return { loading, error, data, load };
}
