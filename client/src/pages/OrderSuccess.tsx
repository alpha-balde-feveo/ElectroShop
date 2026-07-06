import { Link, useLocation } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import type { Order } from "../types";
import { formatPrice } from "../utils/format";

export default function OrderSuccess() {
  const location = useLocation();
  const order = (location.state as { order?: Order } | null)?.order;

  return (
    <div className="max-w-xl mx-auto text-center py-12">
      <CheckCircle size={64} className="mx-auto text-green-500" />
      <h1 className="text-3xl font-bold mt-4">Commande confirmée !</h1>
      <p className="text-gray-600 mt-2">
        Merci pour votre confiance. Nous vous contacterons rapidement pour la
        livraison.
      </p>

      {order && (
        <div className="mt-8 bg-white border rounded-2xl p-6 text-left text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">N° de commande</span>
            <span className="font-mono font-medium">{order._id}</span>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-gray-600">Client</span>
            <span className="font-medium">{order.customerName}</span>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-gray-600">Téléphone</span>
            <span className="font-medium">{order.phone}</span>
          </div>

          <div className="mt-4 pt-4 border-t space-y-1">
            {order.items.map((it, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-gray-600">
                  {it.nameSnapshot} × {it.qty}
                </span>
                <span>{formatPrice(it.priceSnapshot * it.qty)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Sous-total</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Réduction</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Livraison</span>
              <span>{formatPrice(order.shippingFee)}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      )}

      <Link
        to="/shop"
        className="inline-block mt-8 px-6 py-3 rounded-xl bg-gray-900 text-white hover:bg-orange-500 transition"
      >
        Retour à la boutique
      </Link>
    </div>
  );
}
