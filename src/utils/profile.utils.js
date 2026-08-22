export function mapUserToForm(user) {
  let fechaNacimiento = "";
  if (user?.nacimiento) {
    if (
      typeof user.nacimiento === "string" &&
      user.nacimiento.match(/^\d{4}-\d{2}-\d{2}/)
    )
      fechaNacimiento = user.nacimiento.split("T")[0];
    else {
      const d = new Date(user.nacimiento);
      if (!Number.isNaN(d.getTime()))
        fechaNacimiento = d.toISOString().split("T")[0];
    }
  }
  return {
    nombre: user?.nombres || "",
    apellido_paterno: user?.paterno || "",
    apellido_materno: user?.materno || "",
    email: user?.email || "",
    telefono: user?.telefono || "",
    fecha_nacimiento: fechaNacimiento,
  };
}
export function formatMoney(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(value || 0));
}
export function orderStatusLabel(status) {
  const key = String(status || "").toLowerCase();
  if (key.includes("pend")) return "Pendiente";
  if (key.includes("prep")) return "Preparando";
  if (key.includes("entrega")) return "En entrega";
  if (key.includes("complet")) return "Completado";
  if (key.includes("cancel")) return "Cancelado";
  return status || "Sin estado";
}
