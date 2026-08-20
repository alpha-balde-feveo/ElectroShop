import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { AxiosError } from "axios";
import { Clock, Search } from "lucide-react";
import { api } from "../api/http";
import type { Order } from "../types";
import { formatPrice } from "../utils/format";
import { loadRecentOrders } from "../utils/orderHistory";
import type { RecentOrder } from "../utils/orderHistory";
import { waContactUrl } from "../utils/whatsapp";
import OrderResult from "../components/OrderResult";

export default function TrackOrder() {
  const [reference, setReference] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<RecentOrder[]>([]);

  useEffect(() => {
    setRecent(loadRecentOrders());
  }, []);

  const lookup = async (ref: string, tel: string) => {
    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const res = await api.post<Order>("/api/orders/lookup", {
        reference: ref.trim(),
        phone: tel.trim(),
      });
      setOrder(res.data);
    } catch (e: unknown) {
      const err = e as AxiosError<{ message?: string }>;
      setError(
        err.response?.data?.message ??
          "Commande introuvable. Vérifiez le numéro et le téléphone."
      );
    } finally {
      setLoading(false);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    lookup(reference, phone);
  };

  const inputCls =
    "w-full rounded-xl border border-app bg-card-2 px-3 py-2.5 text-sm text-app placeholder-gray-500 outline-none focus:ring-2 focus:ring-orange-500/40";

  return (
    <div className="max-w-xl mx-auto py-12">
      <h1 className="text-3xl md:text-4xl font-extrabold text-center">
        Suivre <span className="text-orange-400">ma commande</span>
      </h1>
      <p className="text-muted text-center mt-3 text-sm">
        Entrez le numéro de commande (reçu sur la page de confirmation ou dans
        la facture WhatsApp) et le téléphone utilisé lors de la commande.
      </p>

      {/* Commandes récentes mémorisées sur cet appareil */}
      {recent.length > 0 && !order && (
        <div className="mt-8 bg-card border border-app rounded-2xl p-4 text-left">
          <div className="flex items-center gap-2 text-sm font-semibold text-soft">
            <Clock size={15} />
            Vos commandes récentes sur cet appareil
          </div>
          <div className="mt-3 space-y-2">
            {recent.map((r) => (
              <button
                key={r.reference}
                onClick={() => lookup(r.reference, r.phone)}
                disabled={loading}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-app bg-card-2 hover-card-2 text-sm transition disabled:opacity-50"
              >
                <span>
                  <span className="font-mono font-semibold">{r.reference}</span>
                  <span className="text-muted">
                    {" "}
                    ·{" "}
                    {new Date(r.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </span>
                <span className="font-medium">{formatPrice(r.total)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        onSubmit={submit}
        className="mt-8 bg-card border border-app rounded-2xl p-6 space-y-4 text-left"
      >
        <div>
          <label className="block text-sm font-medium mb-1 text-soft">
            N° de commande
          </label>
          <input
            className={`${inputCls} font-mono uppercase`}
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="ex : A1B2C3D4"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-soft">
            Téléphone
          </label>
          <input
            className={inputCls}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="77 123 45 67"
          />
        </div>

        {error && (
          <div className="text-sm text-red-400">
            {error}
            <div className="mt-2 text-muted">
              Vous ne retrouvez pas votre numéro de commande ?{" "}
              <a
                href={waContactUrl()}
                target="_blank"
                rel="noreferrer"
                className="text-orange-400 underline underline-offset-4"
              >
                Contactez-nous sur WhatsApp
              </a>{" "}
              avec votre nom, on la retrouvera pour vous.
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !reference.trim() || !phone.trim()}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-400 disabled:opacity-50 transition"
        >
          <Search size={16} />
          {loading ? "Recherche..." : "Rechercher"}
        </button>
      </form>

      {order && (
        <div className="mt-4 text-center">
          <OrderResult order={order} />
        </div>
      )}
    </div>
  );
}
