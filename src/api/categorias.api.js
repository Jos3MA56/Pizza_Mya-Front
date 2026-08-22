import { apiFetch } from "./cliente.js";

export const catalogApi = {
    categories() {
        return apiFetch("/api/categories");
    },
    products(categoryId) {
        const q = categoryId ? `?category=${encodeURIComponent(categoryId)}` : "";
        return apiFetch(`/api/products${q}`);
    },
    product(id) {
        return apiFetch(`/api/products/${id}`);
    },
};
