import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { buildImageUrl } from "../utils/image";
import { formatPrice } from "../utils/format";

export default function Cart() {
  const { items, subtotal, setQty, removeItem, clear } = useCart();

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <h1 className="text-3xl md:text-4xl font-extrabold">
          Votre panier est <span className="text-orange-400">vide</span>
        </h1>
        <p className="text-faint mt-3">
          Parcourez la boutique pour trouver votre bonheur.
        </p>
        <Link
          to="/shop"
          className="inline-block mt-8 px-7 py-3.5 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-400 transition shadow-lg shadow-orange-500/20"
        >
          Voir la boutique
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-extrabold mb-8">
        Mon <span className="text-orange-400">panier</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, qty }) => (
            <div
              key={product._id}
              className="bg-card border border-app rounded-2xl p-4 flex gap-4 items-center hover:border-orange-500/30 transition"
            >
              <Link
                to={`/product/${product._id}`}
                className="h-24 w-24 rounded-xl overflow-hidden bg-card-2 shrink-0"
              >
                <img
                  src={buildImageUrl(product.images?.[0]?.url)}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <Link
                  to={`/product/${product._id}`}
                  className="font-semibold line-clamp-1 hover:text-orange-400 transition"
                >
                  {product.name}
                </Link>
                <div className="text-sm text-faint mt-1">
                  {formatPrice(product.price)} / unité
                </div>

                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center border border-app-strong rounded-lg bg-card-2">
                    <button
                      className="p-2 hover:text-orange-400 disabled:opacity-40 transition"
                      onClick={() => setQty(product._id, qty - 1)}
                      disabled={qty <= 1}
                      aria-label="Diminuer"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">
                      {qty}
                    </span>
                    <button
                      className="p-2 hover:text-orange-400 disabled:opacity-40 transition"
                      onClick={() => setQty(product._id, qty + 1)}
                      disabled={qty >= product.stock}
                      aria-label="Augmenter"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(product._id)}
                    className="text-faint hover:text-red-400 transition"
                    aria-label="Retirer du panier"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="font-bold whitespace-nowrap text-orange-400">
                {formatPrice(product.price * qty)}
              </div>
            </div>
          ))}

          <button
            onClick={clear}
            className="text-sm text-faint hover:text-red-400 underline underline-offset-4 transition"
          >
            Vider le panier
          </button>
        </div>

        {/* Résumé */}
        <div className="bg-card border border-app rounded-2xl p-6 h-fit">
          <h2 className="font-bold text-lg">Résumé</h2>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Sous-total</span>
              <span className="font-semibold">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Livraison</span>
              <span className="text-faint">Calculée au paiement</span>
            </div>
          </div>

          <Link
            to="/checkout"
            className="mt-6 block text-center px-6 py-3.5 rounded-full bg-orange-500 text-white hover:bg-orange-400 transition font-semibold shadow-lg shadow-orange-500/20"
          >
            Passer la commande
          </Link>

          <Link
            to="/shop"
            className="mt-3 block text-center text-sm text-faint hover-text-app transition"
          >
            Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  );
}
