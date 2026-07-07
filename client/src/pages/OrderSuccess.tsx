import { Link, useLocation } from "react-router-dom";
import { CheckCircle, MapPin } from "lucide-react";
import type { Order } from "../types";
import { formatPrice } from "../utils/format";
import { waveLink, waveQrUrl } from "../utils/wave";

const SHIPPING_LABELS: Record<string, string> = {
  STANDARD: "Livraison standard (2-4 jours)",
  EXPRESS: "Livraison express (24h)",
  PICKUP: "Retrait en boutique",
};

const PAYMENT_LABELS: Record<string, string> = {
  ON_DELIVERY: "Paiement à la livraison",
  WAVE: "Wave (QR code)",
  CASH_ON_SITE: "Espèces sur place",
};

export default function OrderSuccess() {
  const location = useLocation();
  const order = (location.state as { order?: Order } | null)?.order;

  const isWave = order?.paymentMethod === "WAVE";
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

      {/* Paiement Wave : QR à scanner */}
      {order && isWave && (
        <div className="mt-8 bg-card border border-app rounded-2xl p-6">
          <div className="font-bold text-lg">
            Payez {formatPrice(order.total)} avec Wave
          </div>
          <img
            src={waveQrUrl(order.total)}
            alt="QR code de paiement Wave"
            className="mx-auto mt-4 h-52 w-52 rounded-2xl bg-white p-2.5"
          />
          <p className="mt-3 text-sm text-muted">
            Ouvrez l'app Wave → « Scanner » → validez le paiement.
          </p>
          <a
            href={waveLink(order.total)}
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-3 text-sm text-orange-400 underline underline-offset-4"
          >
            Ou payez via le lien Wave sur ce téléphone
          </a>
        </div>
      )}

      {/* Retrait boutique : adresse */}
      {isPickup && (
        <div className="mt-4 bg-card border border-app rounded-2xl p-4 flex items-center gap-3 text-left">
          <span className="h-10 w-10 shrink-0 rounded-xl bg-orange-500/15 text-orange-400 grid place-items-center">
            <MapPin size={18} />
          </span>
          <div className="text-sm">
            <div className="font-semibold">GayeStore — Dakar</div>
            <div className="text-muted">
              Ouvert 7j/7, 9h-20h · 77 123 45 67
            </div>
          </div>
        </div>
      )}

      {order && (
        <div className="mt-6 bg-card border border-app rounded-2xl p-6 text-left text-sm">
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
          {order.shippingMode && (
            <div className="flex justify-between mt-2">
              <span className="text-muted">Réception</span>
              <span className="font-medium">
                {SHIPPING_LABELS[order.shippingMode]}
              </span>
            </div>
          )}
          {order.paymentMethod && (
            <div className="flex justify-between mt-2">
              <span className="text-muted">Paiement</span>
              <span className="font-medium">
                {PAYMENT_LABELS[order.paymentMethod]}
              </span>
            </div>
          )}

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
              <span className="text-muted">
                {isPickup ? "Retrait boutique" : "Livraison"}
              </span>
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
