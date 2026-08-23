const CategoryCard = ({ category }) => {
  return (
    <a
      href={category.link}
      className="group relative block overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
    >
      <div className="aspect-square">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>
      
      <div className="absolute inset-0 flex items-end p-6">
        <div className="text-white">
          <h3 className="text-xl font-bold mb-2 group-hover:text-red-400 transition-colors">
            {category.name}
          </h3>
          <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold group-hover:bg-red-600 transition-colors">
            Ver productos →
          </span>
        </div>
      </div>
    </a>
  );
};

export default CategoryCard;
