import { Star } from 'lucide-react';

const ProductCard = ({ product, onAddToCart }) => {
  const badgeColors = {
    bestseller: 'bg-yellow-500 text-white',
    new: 'bg-green-500 text-white',
    offer: 'bg-red-500 text-white'
  };

  return (
    <div className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Badge */}
        {product.badge && (
          <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${badgeColors[product.badgeType] || 'bg-gray-500 text-white'}`}>
            {product.badge}
          </span>
        )}
        
        {/* Quick Add Button */}
        <button
          onClick={() => onAddToCart?.(product)}
          className="absolute bottom-3 right-3 bg-white/90 hover:bg-red-600 hover:text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label={`Agregar ${product.name} al carrito`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
          ))}
          <span className="text-sm text-gray-500 ml-1">(4.8)</span>
        </div>
        
        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-red-600 transition-colors">
          {product.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-red-600">
            ${product.price}
          </span>
          <button
            onClick={() => onAddToCart?.(product)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
