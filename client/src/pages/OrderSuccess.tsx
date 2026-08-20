import { Link, useLocation } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import type { Order } from "../types";
import OrderResult from "../components/OrderResult";

export default function OrderSuccess() {
  const location = useLocation();
  const order = (location.state as { order?: Order } | null)?.order;

  const isPickup = order?.shippingMode === "PICKUP";

  return (
    <div className="max-w-xl mx-auto text-center py-12">
      <div className="mx-auto h-20 w-20 rounded-full bg-green-500/15 grid place-items-center">
        <CheckCircle size={40} className="text-green-400" />
      </div>
      <h1 className="text-3xl md:text-4xl font-extrabold mt-6">
        Commande <span className="text-orange-400">confirmée !</span>
      </h1>
      <p className="text-muted mt-3">
        {isPickup
          ? "Votre commande vous attend en boutique. Présentez votre nom au comptoir."
          : "Merci pour votre confiance. Nous vous contacterons rapidement pour la livraison."}
      </p>

      {order ? (
        <OrderResult order={order} />
      ) : (
        <p className="mt-8 text-sm text-muted">
          Détails de commande indisponibles ici (page rafraîchie ou lien direct).{" "}
          <Link
            to="/suivre-commande"
            className="text-orange-400 underline underline-offset-4"
          >
            Retrouvez votre commande
          </Link>{" "}
          avec son numéro et votre téléphone.
        </p>
      )}

      <Link
        to="/shop"
        className="inline-block mt-8 px-7 py-3.5 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-400 transition shadow-lg shadow-orange-500/20"
      >
        Retour à la boutique
      </Link>
    </div>
  );
}
