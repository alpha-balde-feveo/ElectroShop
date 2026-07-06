import { Link } from "react-router-dom";
import { Eye, ShoppingCart } from "lucide-react";
import type React from "react";
import type { Product } from "../types";
import { buildImageUrl } from "../utils/image";
import { formatPrice } from "../utils/format";
import { useCart } from "../context/CartContext";

export default function ProductCard({ p }: { p: Product }) {
  const { addItem } = useCart();
  const img = buildImageUrl(p.images?.[0]?.url);
  const outOfStock = p.stock <= 0;
  const discount =
    p.oldPrice && p.oldPrice > p.price
      ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)
      : 0;

  return (
    <div className="group/card bg-card border border-app rounded-2xl overflow-hidden hover:border-orange-500/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300">
      {/* Image */}
      <div className="group relative aspect-square bg-card-2 overflow-hidden">
        <Link to={`/product/${p._id}`}>
          <img
            src={img}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </Link>

        {outOfStock && (
          <span className="absolute top-3 left-3 rounded-full bg-red-600/90 text-white text-xs px-3 py-1 font-medium">
            Rupture de stock
          </span>
        )}

        {discount > 0 && !outOfStock && (
          <span className="absolute top-3 right-3 rounded-full bg-orange-500 text-white text-xs px-3 py-1 font-bold shadow">
            -{discount}%
          </span>
        )}

        {/* Dark overlay */}
        <div className="pointer-events-none absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/50" />

        {/* Center icons */}
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="pointer-events-auto flex items-center gap-3 opacity-0 translate-y-2 transition duration-300 group-hover:opacity-100 group-hover:translate-y-0">
            <IconBtn
              label="Ajouter au panier"
              disabled={outOfStock}
              onClick={() => addItem(p)}
            >
              <ShoppingCart size={20} />
            </IconBtn>

            <Link
              to={`/product/${p._id}`}
              aria-label="Voir le produit"
              className="h-12 w-12 rounded-md bg-white shadow grid place-items-center text-gray-800 transition transform hover:text-orange-500 hover:scale-110"
            >
              <Eye size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 text-center">
        <Link to={`/product/${p._id}`}>
          <h3 className="font-extrabold uppercase tracking-wide line-clamp-1 text-app group-hover/card:text-orange-400 transition">
            {p.name}
          </h3>
        </Link>

        {p.brand && <p className="text-sm text-faint mt-2">{p.brand}</p>}

        <div className="mt-3 flex items-center justify-center gap-2">
          {discount > 0 && (
            <span className="text-sm text-faint line-through">
              {formatPrice(p.oldPrice!)}
            </span>
          )}
          <span className="font-extrabold text-lg text-orange-400">
            {formatPrice(p.price)}
          </span>
        </div>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  label,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="h-12 w-12 rounded-md bg-white shadow grid place-items-center text-gray-800 transition transform hover:text-orange-500 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
    >
      {children}
    </button>
  );
}
