export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatNumber(value) {
  return new Intl.NumberFormat("es-MX").format(Number(value || 0));
}

export function formatMs(value) {
  return `${Number(value || 0).toFixed(2)} ms`;
}

export function formatSeconds(value) {
  const total = Number(value || 0);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return `${h}h ${m}m`;
}

function statusMeta(status) {
  if (status === "critical") {
    return {
      label: "Crítico",
      color: "#dc2626",
      bg: "rgba(220,38,38,.12)",
      border: "rgba(220,38,38,.22)",
    };
  }

  if (status === "warning") {
    return {
      label: "Atención",
      color: "#d97706",
      bg: "rgba(217,119,6,.12)",
      border: "rgba(217,119,6,.22)",
    };
  }

  return {
    label: "Estable",
    color: "#16a34a",
    bg: "rgba(22,163,74,.12)",
    border: "rgba(22,163,74,.22)",
  };
}

export function Card({ title, subtitle, children, dark = false, style = {} }) {
  return (
    <section
      style={{
        background: dark
          ? "linear-gradient(135deg, #0f172a 0%, #111827 100%)"
          : "#ffffff",
        color: dark ? "#fff" : "#111827",
        borderRadius: 24,
        padding: 22,
        border: dark ? "1px solid rgba(255,255,255,.06)" : "1px solid #e5e7eb",
        boxShadow: dark
          ? "0 18px 36px rgba(2, 6, 23, 0.22)"
          : "0 12px 28px rgba(15,23,42,.06)",
        ...style,
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 900 }}>{title}</div>
        {subtitle ? (
          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              color: dark ? "rgba(255,255,255,.65)" : "#6b7280",
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function StatusBadge({ status }) {
  const meta = statusMeta(status);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderRadius: 999,
        background: meta.bg,
        border: `1px solid ${meta.border}`,
        color: meta.color,
        fontSize: 13,
        fontWeight: 800,
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: meta.color,
        }}
      />
      {meta.label}
    </div>
  );
}

export function HeroMetric({ label, value, helper }) {
  return (
    <div
      style={{
        padding: 18,
        borderRadius: 20,
        background: "rgba(255,255,255,.05)",
        border: "1px solid rgba(255,255,255,.06)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: "rgba(255,255,255,.68)",
          textTransform: "uppercase",
          letterSpacing: ".04em",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 34, fontWeight: 950, marginTop: 8 }}>{value}</div>
      <div
        style={{ fontSize: 13, color: "rgba(255,255,255,.62)", marginTop: 8 }}
      >
        {helper}
      </div>
    </div>
  );
}

export function SmallStat({ label, value }) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 18,
        background: "#f8fafc",
        border: "1px solid #e5e7eb",
      }}
    >
      <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 700 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 900,
          color: "#111827",
          marginTop: 6,
        }}
      >
        {value}
      </div>
    </div>
  );
}

export function UsageBar({ label, percent = 0, helper = "" }) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 18,
        background: "#f8fafc",
        border: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <strong style={{ color: "#111827" }}>{label}</strong>
        <span style={{ color: "#6b7280", fontWeight: 800 }}>{percent}%</span>
      </div>

      <div
        style={{
          height: 10,
          borderRadius: 999,
          background: "#e5e7eb",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${Math.min(percent, 100)}%`,
            height: "100%",
            borderRadius: 999,
            background:
              percent >= 80
                ? "linear-gradient(90deg, #dc2626, #f59e0b)"
                : "linear-gradient(90deg, #22c55e, #84cc16)",
          }}
        />
      </div>

      {helper ? (
        <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
          {helper}
        </div>
      ) : null}
    </div>
  );
}

export function HealthItem({ title, detail, status }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        padding: 14,
        borderRadius: 18,
        background: "#f8fafc",
        border: "1px solid #e5e7eb",
      }}
    >
      <div>
        <div style={{ fontWeight: 900, color: "#111827" }}>{title}</div>
        <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
          {detail}
        </div>
      </div>
      <StatusBadge status={status} />
    </div>
  );
}

export function ModuleCard({ item }) {
  return (
    <div
      style={{
        borderRadius: 20,
        padding: 16,
        background: "#fff",
        border: "1px solid #e5e7eb",
        boxShadow: "0 8px 18px rgba(15,23,42,.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 18 }}>{item.module_name}</div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ color: "#374151" }}>
          Latencia: <strong>{formatMs(item.avg_latency_ms)}</strong>
        </div>
        <div style={{ color: "#374151" }}>
          Requests: <strong>{formatNumber(item.total_requests)}</strong>
        </div>
      </div>
    </div>
  );
}

export function RouteList({ items = [] }) {
  if (!items.length) {
    return <div style={{ color: "#6b7280" }}>Sin rutas registradas.</div>;
  }

  const max = Math.max(...items.map((x) => Number(x.avg_latency_ms || 0)), 1);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {items.map((item, index) => {
        const width = `${Math.max(10, (Number(item.avg_latency_ms || 0) / max) * 100)}%`;

        return (
          <div key={`${item.route}-${index}`}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 6,
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              <span style={{ color: "#111827" }}>
                {item.method} {item.route}
              </span>
              <span style={{ color: "#6b7280" }}>
                {formatMs(item.avg_latency_ms)}
              </span>
            </div>

            <div
              style={{
                height: 10,
                borderRadius: 999,
                background: "#e5e7eb",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width,
                  height: "100%",
                  borderRadius: 999,
                  background: "linear-gradient(90deg, #ef4444, #f59e0b)",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AlertsPanel({ items = [] }) {
  if (!items.length) {
    return (
      <div
        style={{
          padding: 16,
          borderRadius: 18,
          background: "rgba(22,163,74,.08)",
          border: "1px solid rgba(22,163,74,.16)",
          color: "#166534",
          fontWeight: 700,
        }}
      >
        No hay alertas activas en este momento.
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {items.map((item, index) => {
        const danger = item.level === "critical";
        return (
          <div
            key={`${item.title}-${index}`}
            style={{
              padding: 16,
              borderRadius: 18,
              background: danger ? "#fef2f2" : "#fff7ed",
              border: `1px solid ${danger ? "#fecaca" : "#fed7aa"}`,
            }}
          >
            <div
              style={{
                fontWeight: 900,
                color: danger ? "#991b1b" : "#9a3412",
                marginBottom: 6,
              }}
            >
              {item.title}
            </div>
            <div style={{ color: danger ? "#7f1d1d" : "#9a3412" }}>
              {item.message}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ConnectedUsersPanel({ items = [] }) {
  if (!items.length) {
    return (
      <div
        style={{
          padding: 16,
          borderRadius: 18,
          background: "#f8fafc",
          border: "1px solid #e5e7eb",
          color: "#6b7280",
        }}
      >
        No hay usuarios activos recientemente.
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {items.map((item, index) => (
        <div
          key={`${item.user_id}-${index}`}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            padding: 14,
            borderRadius: 18,
            background: "#f8fafc",
            border: "1px solid #e5e7eb",
          }}
        >
          <div>
            <div style={{ fontWeight: 900, color: "#111827" }}>
              {item.nombre || "Usuario"}
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
              Rol: {item.rol} · Requests: {item.total_requests}
            </div>
          </div>

          <div style={{ fontSize: 12, color: "#6b7280" }}>
            {formatDate(item.last_seen)}
          </div>
        </div>
      ))}
    </div>
  );
}

export function RecentHistoryPanel({ items = [] }) {
  if (!items.length) {
    return (
      <div
        style={{
          padding: 16,
          borderRadius: 18,
          background: "#f8fafc",
          border: "1px solid #e5e7eb",
          color: "#6b7280",
        }}
      >
        Aún no hay historial registrado.
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gap: 12,
        maxHeight: 520,
        overflowY: "auto",
        paddingRight: 6,
        scrollbarWidth: "thin",
      }}
    >
      {items.map((item, index) => (
        <div
          key={`${item.id}-${index}`}
          style={{
            padding: 14,
            borderRadius: 18,
            background: "#fff",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 6,
            }}
          >
            <strong style={{ color: "#111827" }}>
              {item.modulo} · {item.accion}
            </strong>
            <span style={{ fontSize: 12, color: "#6b7280" }}>
              {formatDate(item.created_at)}
            </span>
          </div>

          <div style={{ color: "#374151", marginBottom: 8 }}>
            {item.descripcion}
          </div>

          <div style={{ fontSize: 12, color: "#6b7280" }}>
            {item.usuario_nombre || "Sistema"} · {item.rol_usuario || "—"} ·{" "}
            {item.duracion_ms ? `${item.duracion_ms} ms` : "sin tiempo"}
          </div>
        </div>
      ))}
    </div>
  );
}

export function HeaviestActionsPanel({ items = [] }) {
  if (!items.length) {
    return (
      <div style={{ color: "#6b7280" }}>No hay acciones medidas todavía.</div>
    );
  }

  const max = Math.max(...items.map((x) => Number(x.avg_duracion_ms || 0)), 1);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {items.map((item, index) => {
        const width = `${Math.max(10, (Number(item.avg_duracion_ms || 0) / max) * 100)}%`;

        return (
          <div key={`${item.modulo}-${item.accion}-${index}`}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 6,
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              <span style={{ color: "#111827" }}>
                {item.modulo} · {item.accion}
              </span>
              <span style={{ color: "#6b7280" }}>
                {item.avg_duracion_ms} ms
              </span>
            </div>

            <div
              style={{
                height: 10,
                borderRadius: 999,
                background: "#e5e7eb",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width,
                  height: "100%",
                  borderRadius: 999,
                  background: "linear-gradient(90deg, #dc2626, #f59e0b)",
                }}
              />
            </div>

            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
              {item.total} registros · máximo {item.max_duracion_ms} ms
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TableWeightList({ items = [] }) {
  if (!items.length) {
    return <div style={{ color: "#6b7280" }}>Sin datos disponibles.</div>;
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {items.map((item) => (
        <div
          key={item.table_name}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            padding: 14,
            borderRadius: 18,
            background: "#f8fafc",
            border: "1px solid #e5e7eb",
          }}
        >
          <div>
            <div style={{ fontWeight: 900, color: "#111827" }}>
              {item.table_name}
            </div>
          </div>
          <div style={{ fontWeight: 900, color: "#374151" }}>
            {item.size_pretty}
          </div>
        </div>
      ))}
    </div>
  );
}
