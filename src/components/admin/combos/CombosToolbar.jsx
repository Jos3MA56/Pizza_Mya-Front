import { Plus, RefreshCcw } from "lucide-react";
import AdminButton from "../ui/AdminButton.jsx";
import AdminSearchBar from "../ui/AdminSearchBar.jsx";
import { adminTheme, selectStyle } from "../ui/adminTheme.js";

export default function CombosToolbar({ filters, onChangeFilters, onCreate }) {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "var(--adm-grid-filters)",
          gap: 12,
        }}
      >
        <AdminSearchBar
          value={filters.search}
          onChange={(e) =>
            onChangeFilters((prev) => ({ ...prev, search: e.target.value }))
          }
          onClear={() => onChangeFilters((prev) => ({ ...prev, search: "" }))}
          placeholder="Buscar por nombre o descripción..."
        />

        <select
          value={filters.status}
          onChange={(e) =>
            onChangeFilters((prev) => ({ ...prev, status: e.target.value }))
          }
          style={selectStyle()}
        >
          <option value="all">Todos los estados</option>
          <option value="active">Solo activos</option>
          <option value="inactive">Solo inactivos</option>
        </select>

        <AdminButton leftIcon={<Plus size={16} />} onClick={onCreate}>
          Nuevo combo
        </AdminButton>
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          color: adminTheme.muted,
          fontWeight: 700,
          fontSize: 13,
        }}
      ></div>
    </div>
  );
}
