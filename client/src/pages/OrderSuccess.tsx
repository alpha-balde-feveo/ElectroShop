import { Link, useLocation } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import type { Order } from "../types";
import { formatPrice } from "../utils/format";

export default function OrderSuccess() {
  const location = useLocation();
  const order = (location.state as { order?: Order } | null)?.order;

  return (
    <div className="max-w-xl mx-auto text-center py-12">
      <div className="mx-auto h-20 w-20 rounded-full bg-green-500/15 grid place-items-center">
        <CheckCircle size={40} className="text-green-400" />
      </div>
      <h1 className="text-3xl md:text-4xl font-extrabold mt-6">
        Commande <span className="text-orange-400">confirmée !</span>
      </h1>
      <p className="text-muted mt-3">
        Merci pour votre confiance. Nous vous contacterons rapidement pour la
        livraison.
      </p>

      {order && (
        <div className="mt-8 bg-card border border-app rounded-2xl p-6 text-left text-sm">
          <div className="flex justify-between">
            <span className="text-muted">N° de commande</span>
            <span className="font-mono font-medium">{order._id}</span>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-muted">Client</span>
            <span className="font-medium">{order.customerName}</span>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-muted">Téléphone</span>
            <span className="font-medium">{order.phone}</span>
          </div>

          <div className="mt-4 pt-4 border-t border-app space-y-1">
            {order.items.map((it, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-muted">
                  {it.nameSnapshot} × {it.qty}
                </span>
                <span>{formatPrice(it.priceSnapshot * it.qty)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-app space-y-1">
            <div className="flex justify-between">
              <span className="text-muted">Sous-total</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Réduction</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted">Livraison</span>
              <span>{formatPrice(order.shippingFee)}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t border-app">
              <span>Total</span>
              <span className="text-orange-400">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      )}

      <Link
        to="/shop"
        className="inline-block mt-10 px-7 py-3.5 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-400 transition shadow-lg shadow-orange-500/20"
      >
        Retour à la boutique
      </Link>
    </div>
  );
}
