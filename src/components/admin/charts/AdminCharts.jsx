// components/admin/charts/AdminCharts.jsx
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { adminTheme } from "../ui/adminTheme.js";

// 📈 Line/Area Chart
export function LineAreaChart({
  data = [],
  valueFormatter,
  color = "#3b82f6",
  fill = "rgba(59, 130, 246, 0.1)",
  height = 280,
}) {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: adminTheme.colors.textSoft,
          fontSize: 13,
        }}
      >
        📊 Sin datos disponibles
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={adminTheme.colors.border}
        />
        <XAxis
          dataKey="label"
          stroke={adminTheme.colors.textSoft}
          fontSize={11}
          tick={{ fill: adminTheme.colors.textSoft }}
        />
        <YAxis
          stroke={adminTheme.colors.textSoft}
          fontSize={11}
          tick={{ fill: adminTheme.colors.textSoft }}
          tickFormatter={(value) => Math.round(value)}
        />
        <Tooltip
          contentStyle={{
            background: "#fff",
            border: `1px solid ${adminTheme.colors.border}`,
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value) => [
            valueFormatter ? valueFormatter(value) : value,
            "Pizzas",
          ]}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke={color}
          fillOpacity={1}
          fill="url(#colorTotal)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// 📊 Vertical Bar Chart
export function VerticalBarChart({
  data = [],
  valueFormatter,
  color = "#f59e0b",
  height = 260,
}) {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: adminTheme.colors.textSoft,
          fontSize: 13,
        }}
      >
        📊 Sin datos disponibles
      </div>
    );
  }

  const COLORS = {
    primary: "#3b82f6",
    accent: "#f59e0b",
    success: "#22c55e",
    info: "#3b82f6",
  };

  const barColor = COLORS[color] || color || COLORS.accent;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={adminTheme.colors.border}
          vertical={false}
        />
        <XAxis
          dataKey="label"
          stroke={adminTheme.colors.textSoft}
          fontSize={11}
          tick={{ fill: adminTheme.colors.textSoft }}
        />
        <YAxis
          stroke={adminTheme.colors.textSoft}
          fontSize={11}
          tick={{ fill: adminTheme.colors.textSoft }}
          tickFormatter={(value) => Math.round(value)}
        />
        <Tooltip
          contentStyle={{
            background: "#fff",
            border: `1px solid ${adminTheme.colors.border}`,
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value) => [
            valueFormatter ? valueFormatter(value) : value,
            "Cantidad",
          ]}
        />
        <Bar dataKey="total" fill={barColor} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// 🥧 Donut Chart
export function DonutChart({
  data = [],
  centerLabel,
  centerValue,
  valueFormatter,
  height = 280,
}) {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: adminTheme.colors.textSoft,
          fontSize: 13,
        }}
      >
        📊 Sin datos disponibles
      </div>
    );
  }

  const COLORS = ["#3b82f6", "#f59e0b", "#22c55e", "#ef4444"];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="42%"
          outerRadius="70%"
          paddingAngle={5}
          dataKey="total"
          label={({ label, percent }) =>
            `${label} ${(percent * 100).toFixed(0)}%`
          }
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "#fff",
            border: `1px solid ${adminTheme.colors.border}`,
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value) => [
            valueFormatter ? valueFormatter(value) : value,
            "Pizzas",
          ]}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy={centerLabel ? -5 : 0}
          style={{
            fontSize: "clamp(16px, 4vw, 24px)",
            fontWeight: 800,
            fill: adminTheme.colors.text,
          }}
        >
          {centerValue}
        </text>
        {centerLabel && (
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dy={20}
            style={{
              fontSize: 11,
              fill: adminTheme.colors.textSoft,
            }}
          >
            {centerLabel}
          </text>
        )}
      </PieChart>
    </ResponsiveContainer>
  );
}

// 📋 Ranked List (sin cambios, ya funcionaba)
export function RankedList({ items = [], valueKey, formatter, valueStyle }) {
  if (!items || items.length === 0) {
    return (
      <div
        style={{
          padding: 20,
          textAlign: "center",
          color: adminTheme.colors.textSoft,
          fontSize: 13,
        }}
      >
        📊 Sin datos disponibles
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {items.map((item, idx) => (
        <div
          key={item.label || idx}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 14px",
            background: "#fff",
            gap: 10,
            flexWrap: "wrap",
            borderRadius: 10,
            border: `1px solid ${adminTheme.colors.border}`,
          }}
        >
          <span style={{ fontWeight: 600, color: adminTheme.colors.text }}>
            {item.label}
          </span>
          <span
            style={{
              fontFamily: "monospace",
              fontWeight: 700,
              color: adminTheme.colors.text,
              ...valueStyle?.(item),
            }}
          >
            {formatter ? formatter(item[valueKey], item) : item[valueKey]}
          </span>
        </div>
      ))}
    </div>
  );
}
