import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Check,
  HandCoins,
  Store,
  Truck,
  Zap,
} from "lucide-react";
import type React from "react";
import { api } from "../api/http";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";
import type { Order, PaymentMethod, PromoInfo, ShippingMode } from "../types";
import { waveQrUrl } from "../utils/wave";

const SHIPPING_FEES: Record<ShippingMode, number> = {
  STANDARD: 1500,
  EXPRESS: 3000,
  PICKUP: 0,
};

const STEPS = ["Réception", "Coordonnées", "Paiement"] as const;

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [shipping, setShipping] = useState<ShippingMode>("STANDARD");
  const [payment, setPayment] = useState<PaymentMethod>("ON_DELIVERY");

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });

  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<PromoInfo | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <h1 className="text-3xl md:text-4xl font-extrabold">
          Votre panier est <span className="text-orange-400">vide</span>
        </h1>
        <Link
          to="/shop"
          className="inline-block mt-8 px-7 py-3.5 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-400 transition shadow-lg shadow-orange-500/20"
        >
          Voir la boutique
        </Link>
      </div>
    );
  }

  const isPickup = shipping === "PICKUP";
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

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const chooseShipping = (mode: ShippingMode) => {
    setShipping(mode);
    setPayment(mode === "PICKUP" ? "WAVE" : "ON_DELIVERY");
  };

  const stepValid = () => {
    if (step === 0) return true;
    if (step === 1) {
      const base = form.customerName.trim().length >= 2 && form.phone.trim().length >= 6;
      if (isPickup) return base;
      return base && form.address.trim().length >= 3 && form.city.trim().length >= 2;
    }
    return true;
  };

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

  const submit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const res = await api.post<Order>("/api/orders", {
        ...form,
        shipping,
        paymentMethod: payment,
        promoCode: promo?.code ?? "",
        items: items.map((i) => ({ productId: i.product._id, qty: i.qty })),
      });

      clear();
      navigate("/order-success", { state: { order: res.data } });
    } catch (e: unknown) {
      const err = e as AxiosError<{ message?: string }>;
      setError(
        err.response?.data?.message ?? "Impossible de créer la commande. Réessayez."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-app bg-card-2 px-3 py-2.5 text-sm text-app placeholder-gray-500 outline-none focus:ring-2 focus:ring-orange-500/40";

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-extrabold mb-10">
        Votre <span className="text-outline">commande</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_360px] gap-8 lg:gap-12">
        {/* ===== RAIL DE PROGRESSION ===== */}
        <ol className="flex lg:flex-col gap-0 lg:w-52">
          {STEPS.map((label, i) => {
            const done = i < step;
            const current = i === step;
            return (
              <li key={label} className="flex-1 lg:flex-none flex lg:block">
                <button
                  onClick={() => i < step && setStep(i)}
                  disabled={i > step}
                  className={`group flex items-center gap-3 w-full text-left ${
                    i < step ? "cursor-pointer" : i > step ? "cursor-default" : ""
                  }`}
                >
                  <span
                    className={`h-10 w-10 shrink-0 rounded-full grid place-items-center text-sm font-bold border transition ${
                      done
                        ? "bg-orange-500 border-orange-500 text-white"
                        : current
                        ? "border-orange-500 text-orange-500"
                        : "border-app-strong text-faint"
                    }`}
                  >
                    {done ? <Check size={16} /> : `0${i + 1}`}
                  </span>
                  <span
                    className={`hidden sm:block text-sm font-semibold transition ${
                      current ? "text-app" : done ? "text-muted" : "text-faint"
                    }`}
                  >
                    {label}
                  </span>
                </button>

                {/* Ligne de connexion */}
                {i < STEPS.length - 1 && (
                  <span
                    className={`block flex-1 lg:flex-none h-px lg:h-8 lg:w-px my-auto lg:my-2 lg:ml-5 transition ${
                      i < step ? "bg-orange-500" : "bg-[var(--app-border-strong)]"
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>

        {/* ===== ÉTAPE COURANTE ===== */}
        <div key={step} className="animate-fade-up min-w-0">
          {step === 0 && (
            <div>
              <h2 className="text-xl font-bold">Comment récupérer votre commande ?</h2>
              <p className="text-sm text-muted mt-1">
                Livraison chez vous ou retrait direct en boutique à Dakar.
              </p>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <ModeCard
                  active={shipping === "STANDARD"}
                  onClick={() => chooseShipping("STANDARD")}
                  icon={<Truck size={22} />}
                  title="Standard"
                  desc="2 à 4 jours, partout au Sénégal"
                  price={formatPrice(1500)}
                />
                <ModeCard
                  active={shipping === "EXPRESS"}
                  onClick={() => chooseShipping("EXPRESS")}
                  icon={<Zap size={22} />}
                  title="Express"
                  desc="24h chrono à Dakar"
                  price={formatPrice(3000)}
                />
                <ModeCard
                  active={isPickup}
                  onClick={() => chooseShipping("PICKUP")}
                  icon={<Store size={22} />}
                  title="Retrait boutique"
                  desc="Sur place — payez par Wave ou espèces"
                  price="Gratuit"
                  highlight
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold">Vos coordonnées</h2>
              <p className="text-sm text-muted mt-1">
                {isPickup
                  ? "Pour vous identifier au retrait de la commande."
                  : "Pour organiser la livraison."}
              </p>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-soft">
                    Nom complet *
                  </label>
                  <input
                    className={inputCls}
                    value={form.customerName}
                    onChange={set("customerName")}
                    placeholder="Prénom et nom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-soft">
                    Téléphone *
                  </label>
                  <input
                    className={inputCls}
                    type="tel"
                    value={form.phone}
                    onChange={set("phone")}
                    placeholder="77 123 45 67"
                  />
                </div>

                {!isPickup && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-soft">
                        Adresse *
                      </label>
                      <input
                        className={inputCls}
                        value={form.address}
                        onChange={set("address")}
                        placeholder="Quartier, rue, villa..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-soft">
                        Ville *
                      </label>
                      <input
                        className={inputCls}
                        value={form.city}
                        onChange={set("city")}
                        placeholder="Dakar"
                      />
                    </div>
                  </>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-soft">
                    Notes (optionnel)
                  </label>
                  <textarea
                    className={inputCls}
                    rows={3}
                    value={form.notes}
                    onChange={set("notes")}
                    placeholder={
                      isPickup
                        ? "Heure de passage prévue, précisions..."
                        : "Instructions de livraison..."
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold">Paiement</h2>
              <p className="text-sm text-muted mt-1">
                {isPickup
                  ? "Choisissez comment payer en boutique."
                  : "Vous payez à la réception de la commande."}
              </p>

              <div className="mt-6 space-y-4">
                {isPickup ? (
                  <>
                    <PayCard
                      active={payment === "WAVE"}
                      onClick={() => setPayment("WAVE")}
                      icon={<WaveLogo />}
                      title="Wave — QR code"
                      desc="Scannez le QR avec l'app Wave et payez en 10 secondes."
                    />
                    {payment === "WAVE" && (
                      <div className="rounded-2xl border border-app bg-card p-5 flex flex-col sm:flex-row items-center gap-5">
                        <img
                          src={waveQrUrl(total)}
                          alt="QR code Wave"
                          className="h-40 w-40 rounded-xl bg-white p-2"
                        />
                        <div className="text-sm text-muted">
                          <div className="font-semibold text-app">
                            Payez {formatPrice(total)} avec Wave
                          </div>
                          <ol className="mt-2 space-y-1 list-decimal list-inside">
                            <li>Ouvrez l'application Wave</li>
                            <li>Touchez « Scanner »</li>
                            <li>Scannez ce QR code et validez</li>
                          </ol>
                          <div className="mt-2 text-xs text-faint">
                            Le QR sera aussi affiché sur votre confirmation de
                            commande.
                          </div>
                        </div>
                      </div>
                    )}
                    <PayCard
                      active={payment === "CASH_ON_SITE"}
                      onClick={() => setPayment("CASH_ON_SITE")}
                      icon={<Banknote size={22} />}
                      title="Espèces sur place"
                      desc="Payez en liquide au comptoir lors du retrait."
                    />
                  </>
                ) : (
                  <PayCard
                    active
                    onClick={() => {}}
                    icon={<HandCoins size={22} />}
                    title="Paiement à la livraison"
                    desc="Cash ou mobile money, remis au livreur à la réception."
                  />
                )}
              </div>

              {/* Code promo */}
              <div className="mt-8 max-w-sm">
                <label className="block text-sm font-medium mb-1 text-soft">
                  Code promo
                </label>
                <div className="flex gap-2">
                  <input
                    className={inputCls}
                    placeholder="Ex : BIENVENUE"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={applyPromo}
                    disabled={promoLoading}
                    className="px-4 py-2 rounded-xl border border-app-strong bg-card-2 text-sm font-medium hover-card-2 disabled:opacity-50 transition"
                  >
                    {promoLoading ? "..." : "Appliquer"}
                  </button>
                </div>
                {promoError && (
                  <div className="text-xs text-red-400 mt-1">{promoError}</div>
                )}
                {promo && (
                  <div className="text-xs text-green-400 mt-1">
                    Code {promo.code} appliqué (
                    {promo.type === "PERCENT"
                      ? `-${promo.value}%`
                      : `-${formatPrice(promo.value)}`}
                    )
                  </div>
                )}
              </div>

              {error && <div className="mt-4 text-sm text-red-400">{error}</div>}
            </div>
          )}

          {/* Navigation entre étapes */}
          <div className="mt-10 flex items-center gap-4">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-app-strong bg-card-2 text-sm font-medium hover-card-2 transition"
              >
                <ArrowLeft size={16} />
                Retour
              </button>
            )}

            {step < 2 ? (
              <button
                onClick={() => stepValid() && setStep((s) => s + 1)}
                disabled={!stepValid()}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-400 transition shadow-lg shadow-orange-500/20 disabled:opacity-40"
              >
                Continuer
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-400 transition shadow-lg shadow-orange-500/20 disabled:opacity-50"
              >
                {submitting ? "Envoi..." : "Confirmer la commande"}
                <Check size={16} />
              </button>
            )}
          </div>
        </div>

        {/* ===== TICKET DE CAISSE ===== */}
        <aside className="lg:sticky lg:top-24 h-fit">
          <div className="relative bg-card border border-app rounded-sm font-mono text-sm shadow-xl">
            {/* Encoches latérales */}
            <span className="absolute -left-2.5 top-1/2 h-5 w-5 rounded-full bg-app border border-app" />
            <span className="absolute -right-2.5 top-1/2 h-5 w-5 rounded-full bg-app border border-app" />

            <div className="p-6">
              <div className="text-center">
                <div className="font-extrabold tracking-[0.3em] text-app">
                  GAYETECH STORE
                </div>
                <div className="text-[11px] text-faint mt-1">
                  Dakar, Sénégal · 77 123 45 67
                </div>
                <div className="text-[11px] text-faint">
                  {new Date().toLocaleDateString("fr-FR")}{" "}
                  {new Date().toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              <div className="my-4 border-t border-dashed border-app-strong" />

              <div className="space-y-2">
                {items.map(({ product, qty }) => (
                  <div key={product._id} className="flex justify-between gap-3">
                    <span className="text-muted truncate">
                      {qty}× {product.name}
                    </span>
                    <span className="text-app whitespace-nowrap">
                      {formatPrice(product.price * qty)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="my-4 border-t border-dashed border-app-strong" />

              <div className="space-y-1.5">
                <div className="flex justify-between text-muted">
                  <span>SOUS-TOTAL</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>REMISE {promo?.code}</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted">
                  <span>
                    {isPickup
                      ? "RETRAIT BOUTIQUE"
                      : shipping === "EXPRESS"
                      ? "LIVRAISON EXPRESS"
                      : "LIVRAISON"}
                  </span>
                  <span>{shippingFee === 0 ? "0 FCFA" : formatPrice(shippingFee)}</span>
                </div>
              </div>

              <div className="my-4 border-t border-dashed border-app-strong" />

              <div className="flex justify-between items-baseline font-extrabold text-app">
                <span>TOTAL</span>
                <span className="text-lg text-orange-400">{formatPrice(total)}</span>
              </div>

              <div className="mt-2 text-[11px] text-faint text-right">
                {isPickup
                  ? payment === "WAVE"
                    ? "Paiement : Wave (QR)"
                    : "Paiement : espèces sur place"
                  : "Paiement à la livraison"}
              </div>

              {/* Faux code-barres */}
              <div
                className="mt-5 h-10 w-full opacity-70"
                style={{
                  background:
                    "repeating-linear-gradient(90deg, var(--app-text) 0 2px, transparent 2px 5px, var(--app-text) 5px 6px, transparent 6px 10px)",
                }}
              />
              <div className="mt-3 text-center text-[11px] tracking-[0.4em] text-faint">
                ★ MERCI ★
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ModeCard({
  active,
  onClick,
  icon,
  title,
  desc,
  price,
  highlight,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
  price: string;
  highlight?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative text-left rounded-2xl border p-5 transition-all hover:-translate-y-0.5 ${
        active
          ? "border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/10"
          : "border-app bg-card hover:border-app-strong"
      }`}
    >
      {highlight && (
        <span className="absolute -top-2.5 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500 text-white">
          NOUVEAU
        </span>
      )}
      <div
        className={`h-11 w-11 rounded-xl grid place-items-center ${
          active ? "bg-orange-500 text-white" : "bg-card-2 text-muted"
        }`}
      >
        {icon}
      </div>
      <div className="mt-3 font-bold">{title}</div>
      <div className="mt-0.5 text-xs text-muted">{desc}</div>
      <div className="mt-3 font-extrabold text-orange-400 text-sm">{price}</div>
    </button>
  );
}

function PayCard({
  active,
  onClick,
  icon,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-4 text-left rounded-2xl border p-4 transition ${
        active
          ? "border-orange-500 bg-orange-500/10"
          : "border-app bg-card hover:border-app-strong"
      }`}
    >
      <span
        className={`h-11 w-11 shrink-0 rounded-xl grid place-items-center ${
          active ? "bg-orange-500 text-white" : "bg-card-2 text-muted"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block font-bold">{title}</span>
        <span className="block text-xs text-muted">{desc}</span>
      </span>
      <span
        className={`ml-auto h-5 w-5 shrink-0 rounded-full border grid place-items-center ${
          active ? "border-orange-500 bg-orange-500 text-white" : "border-app-strong"
        }`}
      >
        {active && <Check size={12} />}
      </span>
    </button>
  );
}

/** Logo Wave stylisé (vague) */
function WaveLogo() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M2 12c2.5-4 5-4 7.5 0s5 4 7.5 0 3.5-3 5-1" />
      <path d="M2 17c2.5-4 5-4 7.5 0s5 4 7.5 0" opacity="0.5" />
    </svg>
  );
}
