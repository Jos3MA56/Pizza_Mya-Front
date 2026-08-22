import { useEffect } from "react";
import { AuthProvider } from "./../context/AuthContext.jsx";
import { CartProvider } from "./../context/CarritoContext.jsx";
import { AppRouter } from "./router.jsx";

export default function App() {
  useEffect(() => {
    document.documentElement.lang = "es-MX";
    document.documentElement.setAttribute("data-app", "pizza-mya");
    
    // Configurar atributos de accesibilidad globales
    document.documentElement.setAttribute("role", "application");
    document.documentElement.setAttribute("aria-label", "Pizza Mya - Aplicación Web");
    
    // Configurar esquema de color preferido
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
    const updateColorScheme = () => {
      document.documentElement.style.colorScheme = prefersDark.matches ? "dark" : "light";
    };
    updateColorScheme();
    prefersDark.addEventListener("change", updateColorScheme);
    
    return () => prefersDark.removeEventListener("change", updateColorScheme);
  }, []);
  
  return (
    <AuthProvider>
      <CartProvider>
        <AppRouter />
      </CartProvider>
    </AuthProvider>
  );
}
