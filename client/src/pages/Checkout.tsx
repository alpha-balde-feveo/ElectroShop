import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import { api } from "../api/http";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";
import type { Order, PromoInfo } from "../types";

const SHIPPING_FEES = { STANDARD: 1500, EXPRESS: 3000 } as const;
type Shipping = keyof typeof SHIPPING_FEES;

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });
  const [shipping, setShipping] = useState<Shipping>("STANDARD");

  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<PromoInfo | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <h1 className="text-3xl font-semibold">Votre panier est vide</h1>
        <Link
          to="/shop"
          className="inline-block mt-6 px-6 py-3 rounded-xl bg-gray-900 text-white hover:bg-orange-500 transition"
        >
          Voir la boutique
        </Link>
      </div>
    );
  }

  const shippingFee = SHIPPING_FEES[shipping];
  let discount = 0;
  if (promo) {
    discount =
      promo.type === "PERCENT"
        ? Math.round((subtotal * promo.value) / 100)
        : promo.value;
    if (discount > subtotal) discount = subtotal;
  }
  const total = subtotal - discount + shippingFee;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const applyPromo = async () => {
    const code = promoInput.trim();
    if (!code) return;

    try {
      setPromoLoading(true);
      setPromoError(null);
      const res = await api.post<PromoInfo>("/api/promo/validate", { code });
      setPromo(res.data);
    } catch (e: unknown) {
      const err = e as AxiosError<{ message?: string }>;
      setPromo(null);
      setPromoError(err.response?.data?.message ?? "Code promo invalide");
    } finally {
      setPromoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);

      const res = await api.post<Order>("/api/orders", {
        ...form,
        shipping,
        promoCode: promo?.code ?? "",
        items: items.map((i) => ({ productId: i.product._id, qty: i.qty })),
      });

      clear();
      navigate("/order-success", { state: { order: res.data } });
    } catch (e: unknown) {
      const err = e as AxiosError<{ message?: string }>;
      setError(
        err.response?.data?.message ??
          "Impossible de créer la commande. Réessayez."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 bg-white";

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Finaliser la commande</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Formulaire */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border rounded-2xl p-6">
            <h2 className="font-bold text-lg mb-4">Informations de livraison</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nom complet *
                </label>
                <input
                  className={inputCls}
                  required
                  minLength={2}
                  value={form.customerName}
                  onChange={set("customerName")}
                  placeholder="Prénom et nom"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Téléphone *
                </label>
                <input
                  className={inputCls}
                  required
                  minLength={6}
                  type="tel"
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="77 123 45 67"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Adresse *
                </label>
                <input
                  className={inputCls}
                  required
                  minLength={3}
                  value={form.address}
                  onChange={set("address")}
                  placeholder="Quartier, rue, villa..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Ville *</label>
                <input
                  className={inputCls}
                  required
                  minLength={2}
                  value={form.city}
                  onChange={set("city")}
                  placeholder="Dakar"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Notes (optionnel)
                </label>
                <textarea
                  className={inputCls}
                  rows={3}
                  value={form.notes}
                  onChange={set("notes")}
                  placeholder="Instructions de livraison..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-6">
            <h2 className="font-bold text-lg mb-4">Mode de livraison</h2>

            <div className="space-y-3">
              {(
                [
                  ["STANDARD", "Livraison standard (2-4 jours)"],
                  ["EXPRESS", "Livraison express (24h)"],
                ] as [Shipping, string][]
              ).map(([value, label]) => (
                <label
                  key={value}
                  className={`flex items-center justify-between border rounded-xl px-4 py-3 cursor-pointer transition ${
                    shipping === value
                      ? "border-orange-500 bg-orange-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shipping === value}
                      onChange={() => setShipping(value)}
                      className="accent-orange-500"
                    />
                    <span className="text-sm font-medium">{label}</span>
                  </span>
                  <span className="text-sm font-semibold">
                    {formatPrice(SHIPPING_FEES[value])}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Résumé */}
        <div className="bg-white border rounded-2xl p-6 h-fit">
          <h2 className="font-bold text-lg">Votre commande</h2>

          <div className="mt-4 space-y-2 text-sm">
            {items.map(({ product, qty }) => (
              <div key={product._id} className="flex justify-between gap-2">
                <span className="text-gray-600 line-clamp-1">
                  {product.name} × {qty}
                </span>
                <span className="font-medium whitespace-nowrap">
                  {formatPrice(product.price * qty)}
                </span>
              </div>
            ))}
          </div>

          {/* Code promo */}
          <div className="mt-4">
            <div className="flex gap-2">
              <input
                className={inputCls}
                placeholder="Code promo"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
              />
              <button
                type="button"
                onClick={applyPromo}
                disabled={promoLoading}
                className="px-4 py-2 rounded-xl border text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                {promoLoading ? "..." : "Appliquer"}
              </button>
            </div>
            {promoError && (
              <div className="text-xs text-red-600 mt-1">{promoError}</div>
            )}
            {promo && (
              <div className="text-xs text-green-600 mt-1">
                Code {promo.code} appliqué (
                {promo.type === "PERCENT"
                  ? `-${promo.value}%`
                  : `-${formatPrice(promo.value)}`}
                )
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Sous-total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Réduction</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Livraison</span>
              <span>{formatPrice(shippingFee)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            Paiement à la livraison (cash ou mobile money).
          </div>

          {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 w-full px-6 py-3 rounded-xl bg-gray-900 text-white hover:bg-orange-500 transition font-medium disabled:opacity-50"
          >
            {submitting ? "Envoi en cours..." : "Confirmer la commande"}
          </button>
        </div>
      </form>
    </div>
  );
}
