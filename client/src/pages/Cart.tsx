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
        <h1 className="text-3xl font-semibold">Votre panier est vide</h1>
        <p className="text-gray-500 mt-2">
          Parcourez la boutique pour trouver votre bonheur.
        </p>
        <Link
          to="/shop"
          className="inline-block mt-6 px-6 py-3 rounded-xl bg-gray-900 text-white hover:bg-orange-500 transition"
        >
          Voir la boutique
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Mon panier</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, qty }) => (
            <div
              key={product._id}
              className="bg-white border rounded-2xl p-4 flex gap-4 items-center"
            >
              <Link
                to={`/product/${product._id}`}
                className="h-24 w-24 rounded-xl overflow-hidden bg-gray-100 shrink-0"
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
                  className="font-semibold line-clamp-1 hover:text-orange-500"
                >
                  {product.name}
                </Link>
                <div className="text-sm text-gray-500 mt-1">
                  {formatPrice(product.price)} / unité
                </div>

                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center border rounded-lg">
                    <button
                      className="p-2 hover:text-orange-500 disabled:opacity-40"
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
                      className="p-2 hover:text-orange-500 disabled:opacity-40"
                      onClick={() => setQty(product._id, qty + 1)}
                      disabled={qty >= product.stock}
                      aria-label="Augmenter"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(product._id)}
                    className="text-gray-400 hover:text-red-500 transition"
                    aria-label="Retirer du panier"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="font-bold whitespace-nowrap">
                {formatPrice(product.price * qty)}
              </div>
            </div>
          ))}

          <button
            onClick={clear}
            className="text-sm text-gray-500 hover:text-red-500 underline"
          >
            Vider le panier
          </button>
        </div>

        {/* Résumé */}
        <div className="bg-white border rounded-2xl p-6 h-fit">
          <h2 className="font-bold text-lg">Résumé</h2>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Sous-total</span>
              <span className="font-semibold">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Livraison</span>
              <span className="text-gray-500">Calculée au paiement</span>
            </div>
          </div>

          <Link
            to="/checkout"
            className="mt-6 block text-center px-6 py-3 rounded-xl bg-gray-900 text-white hover:bg-orange-500 transition font-medium"
          >
            Passer la commande
          </Link>

          <Link
            to="/shop"
            className="mt-3 block text-center text-sm text-gray-500 hover:text-gray-900"
          >
            Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  );
}
