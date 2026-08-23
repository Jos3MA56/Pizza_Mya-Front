// Datos para el carrusel principal
export const carouselSlides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&h=600&fit=crop',
    title: '¡Pizza Artesanal!',
    subtitle: 'Ingredientes frescos y receta tradicional',
    cta: 'Ordenar Ahora',
    link: '/menu'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1200&h=600&fit=crop',
    title: 'Promoción Especial',
    subtitle: '2x1 en pizzas grandes los martes',
    cta: 'Ver Promociones',
    link: '/promociones'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1593560708920-6316e4e6d52e?w=1200&h=600&fit=crop',
    title: 'Envío Gratis',
    subtitle: 'En pedidos mayores a $299',
    cta: 'Hacer Pedido',
    link: '/menu'
  }
];

// Productos más pedidos
export const featuredProducts = [
  {
    id: 1,
    name: 'Pizza Pepperoni',
    description: 'Clásica pepperoni con queso mozzarella',
    price: 189,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=400&fit=crop',
    badge: 'Más Vendida',
    badgeType: 'bestseller'
  },
  {
    id: 2,
    name: 'Pizza Margarita',
    description: 'Tomate, mozzarella fresca y albahaca',
    price: 169,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=400&fit=crop',
    badge: 'Vegetariana',
    badgeType: 'new'
  },
  {
    id: 3,
    name: 'Pizza Hawaiana',
    description: 'Jamón, piña y queso mozzarella',
    price: 179,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop',
    badge: null,
    badgeType: null
  },
  {
    id: 4,
    name: 'Pizza Cuatro Quesos',
    description: 'Mozzarella, gorgonzola, parmesano y provolone',
    price: 199,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop',
    badge: 'Premium',
    badgeType: 'bestseller'
  },
  {
    id: 5,
    name: 'Pizza Vegetariana',
    description: 'Pimientos, cebolla, champiñones y aceitunas',
    price: 175,
    image: 'https://images.unsplash.com/photo-1571407970349-bc1671764b3d?w=400&h=400&fit=crop',
    badge: 'Saludable',
    badgeType: 'new'
  }
];

// Categorías de productos
export const categories = [
  {
    id: 1,
    name: 'Pizzas',
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=300&h=300&fit=crop',
    link: '/menu/pizzas'
  },
  {
    id: 2,
    name: 'Pastas',
    image: 'https://images.unsplash.com/photo-1626844131082-256783844137?w=300&h=300&fit=crop',
    link: '/menu/pastas'
  },
  {
    id: 3,
    name: 'Ensaladas',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=300&fit=crop',
    link: '/menu/ensaladas'
  },
  {
    id: 4,
    name: 'Bebidas',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&h=300&fit=crop',
    link: '/menu/bebidas'
  }
];
