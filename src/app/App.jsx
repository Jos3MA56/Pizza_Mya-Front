import { useEffect } from "react";
import { AuthProvider } from "./../context/AuthContext.jsx";
import { CartProvider } from "./../context/CarritoContext.jsx";
import { AppRouter } from "./router.jsx";

export default function App() {
  useEffect(() => {
    document.documentElement.lang = "es-MX";
    document.documentElement.setAttribute("data-app", "pizza-mya");
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <AppRouter />
      </CartProvider>
    </AuthProvider>
  );
}
