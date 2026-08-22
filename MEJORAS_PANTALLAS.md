# Mejoras de Pantallas - Pizza Mya

## 📦 Componentes Nuevos Creados

### 1. Carrusel Profesional (`src/components/ui/Carousel.jsx`)

**Características:**
- ✅ Soporte para touch (swipe en móviles)
- ✅ Autoplay configurable con barra de progreso
- ✅ Navegación con teclado (flechas izquierda/derecha)
- ✅ Indicadores de navegación con puntos
- ✅ Botones de navegación laterales
- ✅ Accesibilidad completa (ARIA labels, roles)
- ✅ Responsive para todas las pantallas
- ✅ Transiciones suaves con cubic-bezier

**Props:**
```javascript
{
  slides: [],           // Array de objetos {id, titulo, descripcion, imagen_url, etiqueta, cta, secondaryCta, onPrimaryClick, onSecondaryClick}
  autoplayDelay: 6000,  // Tiempo en ms entre slides (0 para desactivar)
  onSlideChange: fn     // Callback cuando cambia el slide
}
```

**Ejemplo de uso:**
```jsx
import Carousel from './components/ui/Carousel';

const slides = [
  {
    id: 1,
    titulo: "Pizzas recién preparadas",
    descripcion: "Elige una especialidad y personaliza tu pizza.",
    etiqueta: "Menú",
    cta: "Ver menú",
    secondaryCta: "Ordenar ahora",
    imagen_url: "/images/pizza1.jpg",
    onPrimaryClick: () => navigate('/catalogo'),
    onSecondaryClick: () => navigate('/combos')
  }
];

<Carousel slides={slides} autoplayDelay={7000} />
```

---

### 2. Tarjeta de Producto Profesional (`src/components/ui/ProductCard.jsx`)

**Características:**
- ✅ Badges de "Nuevo" y descuento
- ✅ Efectos hover con elevación
- ✅ Acciones rápidas (favoritos, ver detalles)
- ✅ Sistema de calificación con estrellas
- ✅ Precio original tachado con descuento
- ✅ Imagen con zoom al hacer hover
- ✅ Responsive con acciones siempre visibles en móvil

**Props:**
```javascript
{
  product: {},          // Objeto producto con nombre, descripcion, precio_desde, imagen_url, etc.
  onOpen: fn,           // Callback al abrir detalles
  onAddToCart: fn,      // Callback al agregar al carrito
  onFavorite: fn,       // Callback al marcar como favorito
  isFavorite: false     // Estado de favorito
}
```

**Datos del producto soportados:**
- nombre, descripcion, precio_desde
- imagen_url, categoria_nombre
- rating_avg, reviews_count
- descuento (porcentaje), es_nuevo (boolean)
- disponible (boolean)

---

### 3. Perfil Profesional (`src/components/ui/ProfessionalProfile.jsx`)

**Características:**
- ✅ Hero section con avatar e información
- ✅ Badge de estado de cuenta animado
- ✅ Navegación lateral con 8 pestañas:
  - Información personal
  - Pedidos (historial)
  - Direcciones guardadas
  - Seguridad (contraseña)
  - Notificaciones
  - Métodos de pago
  - Favoritos
  - Configuración
- ✅ Iconos coloreados por sección
- ✅ Tarjeta de resumen de estadísticas
- ✅ Totalmente responsive

**Props:**
```javascript
{
  user: {},              // Objeto usuario actual
  profileForm: {},       // Formulario de perfil
  activeTab: "info",     // Tab activa actual
  setActiveTab: fn,      // Función para cambiar tab
  isEditing: false,      // Estado de edición
  setIsEditing: fn,      // Función para activar edición
  onSave: fn,            // Callback al guardar
  onCancel: fn,          // Callback al cancelar
  saving: false,         // Estado de guardado
  stats: {}              // Estadísticas {totalOrders, totalAddresses, completionPercentage}
}
```

---

### 4. Tarjeta de Estadística Admin (`src/components/admin/ui/AdminStatCard.jsx`)

**Características:**
- ✅ Indicador de tendencia (↑ ↓ →)
- ✅ 5 esquemas de color predefinidos
- ✅ Efectos hover con elevación
- ✅ Icono personalizado con emoji
- ✅ Subtítulo opcional

**Props:**
```javascript
{
  title: "Ventas",       // Título de la estadística
  value: "$12,500",      // Valor principal
  trend: 15,             // Porcentaje de tendencia (positivo o negativo)
  trendLabel: "vs mes anterior",  // Label opcional de tendencia
  icon: "💰",            // Emoji o ícono
  color: "primary",      // primary | success | danger | info | warning
  subtitle: "Total del periodo"    // Subtítulo opcional
}
```

**Esquemas de color disponibles:**
- `primary`: Naranja/ámbar (ventas principales)
- `success`: Verde (crecimiento, completados)
- `danger`: Rojo (alertas, cancelaciones)
- `info`: Azul (información general)
- `warning`: Amarillo (pendientes, advertencias)

---

## 🎨 Guía de Estilos

### Paleta de Colores Principal
```css
--color-primary: #c78b47;      /* Dorado */
--color-primary-dark: #8f2d1f; /* Rojo vino */
--color-text: #201a17;         /* Texto principal */
--color-text-soft: #6b625c;    /* Texto secundario */
--color-bg-light: #fffaf5;     /* Fondo claro */
--color-border: #eadfd4;       /* Bordes */
```

### Breakpoints Responsive
- Desktop: > 1024px
- Tablet: 640px - 1024px
- Mobile: < 640px

### Sombras
```css
/* Sombra suave */
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);

/* Sombra media (hover) */
box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);

/* Sombra fuerte (accent) */
box-shadow: 0 20px 60px rgba(143, 45, 31, 0.12);
```

### Bordes Redondeados
- Cards: 20px - 24px
- Botones: 12px - 14px
- Badges: 999px (pill shape)
- Avatares: 50% (círculo perfecto)

---

## 📱 Implementación por Pantalla

### Pantalla Pública (Home)

**Archivo:** `src/pages/public/HomePage.jsx`

**Mejoras recomendadas:**
1. Reemplazar carrusel actual con nuevo componente `Carousel`
2. Usar `ProductCard` para productos destacados
3. Mantener estructura semántica con landmarks ARIA

```jsx
import Carousel from '../../components/ui/Carousel';
import ProductCard from '../../components/ui/ProductCard';

// En el render
<Carousel 
  slides={promoSlides} 
  autoplayDelay={7000}
  onSlideChange={(index) => console.log('Slide:', index)}
/>

<div className="featured-products-grid">
  {productos.map(product => (
    <ProductCard
      key={product.id}
      product={product}
      onOpen={() => navigate(`/producto/${product.id}`)}
      onAddToCart={(p) => addToCart(p)}
      onFavorite={(p) => toggleFavorite(p)}
      isFavorite={favorites.includes(product.id)}
    />
  ))}
</div>
```

---

### Pantalla Cliente (Perfil)

**Archivo:** `src/pages/client/PerfilPage.jsx`

**Mejoras recomendadas:**
1. Reemplazar dashboard actual con `ProfessionalProfile`
2. Mantener lógica de negocio existente del hook `usePerfilPage`
3. Inyectar contenido específico de cada tab

```jsx
import ProfessionalProfile from '../../components/ui/ProfessionalProfile';

// En el render
<ProfessionalProfile
  user={user}
  profileForm={perfil.profileForm}
  activeTab={perfil.activeTab}
  setActiveTab={perfil.setActiveTab}
  isEditing={perfil.isEditing}
  setIsEditing={perfil.setIsEditing}
  onSave={perfil.saveProfile}
  onCancel={() => perfil.setIsEditing(false)}
  saving={perfil.savingProfile}
  stats={{
    totalOrders: perfil.orders.length,
    totalAddresses: perfil.addresses.length,
    completionPercentage: perfil.profileCompletion
  }}
>
  {/* Contenido específico de cada tab */}
  {perfil.activeTab === 'info' && <InfoTab form={perfil.profileForm} />}
  {perfil.activeTab === 'orders' && <OrdersTab orders={perfil.orders} />}
  {/* ... más tabs */}
</ProfessionalProfile>
```

---

### Pantalla Admin (Dashboard)

**Archivo:** `src/pages/admin/AdminDashboard.jsx`

**Mejoras recomendadas:**
1. Usar `AdminStatCard` para KPIs principales
2. Mantener gráficos existentes (LineAreaChart, DonutChart)
3. Mejorar jerarquía visual con nueva tarjeta de estadísticas

```jsx
import AdminStatCard from '../../components/admin/ui/AdminStatCard';

// En el render
<section className="admin-dashboard-kpis">
  <AdminStatCard
    title="Ventas del periodo"
    value={formatMoney(totals.ventas)}
    trend={12.5}
    icon="💰"
    color="primary"
    subtitle={`${totals.pedidos} pedidos`}
  />
  
  <AdminStatCard
    title="Ticket promedio"
    value={formatMoney(totals.ticket)}
    trend={-3.2}
    icon="🎫"
    color="info"
    subtitle="Promedio por pedido"
  />
  
  <AdminStatCard
    title="Pedidos activos"
    value={totals.activas}
    trend={5}
    icon="📦"
    color="warning"
    subtitle="Pendientes + En entrega"
  />
  
  <AdminStatCard
    title="Alertas"
    value={alerts.length}
    trend={alerts.length > 0 ? 100 : 0}
    icon="⚠️"
    color={alerts.length > 0 ? 'danger' : 'success'}
    subtitle={`${stats?.noDisponibles || 0} productos sin stock`}
  />
</section>
```

---

## ♿ Accesibilidad

Todos los componentes incluyen:

### ARIA Labels y Roles
- `role="region"` para secciones principales
- `aria-label` descriptivo en botones e iconos
- `aria-roledescription="carrusel"` para sliders
- `role="tablist"` y `role="tab"` para navegación por pestañas

### Navegación por Teclado
- Todos los elementos interactivos son focusables
- Soporte para teclas de flecha en carrusel
- Orden de tab lógico y predecible

### Estados Visibles
- Focus visible en todos los elementos interactivos
- Estados hover y active claramente diferenciados
- Contraste de color suficiente (WCAG AA)

### Screen Readers
- Textos alternativos en imágenes
- Anuncios de cambios de estado dinámicos
- Estructura semántica correcta (h1, h2, article, section)

---

## 🚀 Rendimiento

### Optimizaciones Incluidas
- Lazy loading en imágenes de slides no iniciales
- Transiciones CSS hardware-accelerated (transform, opacity)
- Intersection Observer para animaciones reveal
- Callbacks memoizados con useCallback

### Mejores Prácticas
- Evitar re-renders innecesarios con React.memo
- Usar keys estables en listas
- Limpiar timers y observers en useEffect cleanup

---

## 📋 Checklist de Implementación

### Para cada pantalla:
- [ ] Integrar nuevos componentes
- [ ] Verificar responsive en 3 breakpoints
- [ ] Probar navegación por teclado
- [ ] Validar con screen reader
- [ ] Testear en Chrome DevTools Lighthouse
- [ ] Verificar animaciones en dispositivos lentos
- [ ] Comprobar contraste de colores

### Herramientas Recomendadas
- Chrome DevTools → Lighthouse
- axe DevTools para accesibilidad
- React Developer Tools para debugging
- WebPageTest para rendimiento

---

## 🔄 Migración Gradual

Se recomienda implementar en este orden:

1. **Semana 1:** Carrusel en Home (impacto visual inmediato)
2. **Semana 2:** ProductCard en catálogo (mejora conversión)
3. **Semana 3:** Perfil profesional (mejora UX cliente)
4. **Semana 4:** AdminStatCard en dashboard (mejora admin)

Cada componente es independiente y puede coexistir con el código actual.

---

## 📞 Soporte

Para dudas o problemas con la implementación:
1. Revisar este documento primero
2. Verificar props de cada componente
3. Inspeccionar consola del navegador para errores
4. Validar estructura HTML con herramientas de desarrollo

**Nota:** Todos los componentes mantienen los colores y diseño original de Pizza Mya, solo mejorando la estructura y experiencia de usuario.
