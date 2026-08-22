/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                brand: {
                    orange: "#FF6A00", // header naranja prototipo
                    red: "#D90B0B",    // botón rojo login
                    dark: "#2F2F2F",   // footer
                    grayBtn: "#6B6B6B" // botones grises home
                }
            },
            boxShadow: {
                soft: "0 10px 25px rgba(0,0,0,.08)"
            }
        }
    },
    plugins: []
};
