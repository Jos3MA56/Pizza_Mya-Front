const KEY = "pizza_cart";

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function setCart(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function clearCart() {
  localStorage.removeItem(KEY);
}

export function cartTotal(items) {
  return items.reduce((acc, it) => acc + it.precio * it.cantidad, 0);
}
