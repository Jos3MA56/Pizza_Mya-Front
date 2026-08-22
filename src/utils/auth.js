export const isLoggedIn = () => {
    // ✅ Cambia la key si tu login guarda otro nombre
    // Ejemplos comunes: "token", "pmya_token", "access_token", "auth_token"
    return !!localStorage.getItem("pmya_token");
};
