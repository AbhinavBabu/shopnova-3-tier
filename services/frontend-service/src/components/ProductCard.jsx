import { useState } from "react";
import { useCart } from "../context/CartContext";

/* ── Star rating ─────────────────────────────────────────── */
const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg
        key={star}
        className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? "text-amber-400" : "text-gray-200"}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

/* ── Category pill colours ───────────────────────────────── */
const CAT_STYLES = {
  Electronics: "bg-sky-50    text-sky-700    border-sky-200",
  Furniture:   "bg-amber-50  text-amber-700  border-amber-200",
  Lifestyle:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  Accessories: "bg-violet-50 text-violet-700 border-violet-200",
};

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [imgError, setImgError] = useState(false);

  const catStyle = CAT_STYLES[product.category] || "bg-primary-50 text-primary-700 border-primary-200";

  return (
    <article className="card flex flex-col group">

      {/* ── Image ──────────────────────────────────── */}
      <div className="relative w-full h-52 bg-surface-100 overflow-hidden">
        <img
          src={
            imgError
              ? `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&size=400&background=f0fdfa&color=0d9488`
              : product.image
          }
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgError(true)}
        />

        {/* Low-stock ribbon */}
        {product.stock > 0 && product.stock <= 10 && (
          <div className="absolute top-3 left-3">
            <span className="badge bg-red-500 text-white">Only {product.stock} left</span>
          </div>
        )}

        {/* Category pill */}
        <div className="absolute top-3 right-3">
          <span className={`badge border ${catStyle}`}>{product.category}</span>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-primary-700 transition-colors">
          {product.name}
        </h3>

        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center gap-2">
          <StarRating rating={product.rating} />
          <span className="text-xs text-gray-400 font-medium">{product.rating.toFixed(1)}</span>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-surface-100">
          <div>
            <span className="text-xl font-bold text-secondary-600">
              ${product.price.toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className="btn-primary py-2 px-4 text-xs"
            aria-label={`Add ${product.name} to cart`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}
