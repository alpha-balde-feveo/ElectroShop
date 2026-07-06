import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { AxiosError } from "axios";
import { api } from "../api/http";
import type { Order } from "../types";
import { formatPrice } from "../utils/format";
import { STATUS_LABELS, StatusBadge } from "./status";

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .get<Order>(`/api/orders/${id}`)
      .then((res) => setOrder(res.data))
      .catch((e: AxiosError<{ message?: string }>) =>
        setError(e.response?.data?.message ?? "Commande introuvable")
      );
  }, [id]);

  const updateStatus = async (status: Order["status"]) => {
    if (!order) return;
    try {
      setUpdating(true);
      const res = await api.put<Order>(`/api/orders/${order._id}/status`, {
        status,
      });
      setOrder(res.data);
    } catch {
      alert("Mise à jour impossible");
    } finally {
      setUpdating(false);
    }
  };

  if (error) return <div className="text-red-600">{error}</div>;
  if (!order) return <div className="text-gray-600">Chargement...</div>;

  return (
    <div>
      <Link
        to="/admin/orders"
        className="text-sm text-gray-500 hover:text-gray-900"
      >
        ← Retour aux commandes
      </Link>

      <div className="flex items-center gap-3 mt-2 mb-6">
        <h1 className="text-2xl font-bold">Commande</h1>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Articles */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border rounded-2xl p-6">
            <h2 className="font-bold mb-4">Articles</h2>
            <div className="space-y-2 text-sm">
              {order.items.map((it, i) => (
                <div
                  key={i}
                  className="flex justify-between py-2 border-b last:border-0"
                >
                  <span>
                    {it.nameSnapshot}{" "}
                    <span className="text-gray-500">× {it.qty}</span>
                  </span>
                  <span className="font-medium">
                    {formatPrice(it.priceSnapshot * it.qty)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Sous-total</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Réduction {order.promoCode && `(${order.promoCode})`}</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Livraison</span>
                <span>{formatPrice(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Statut */}
          <div className="bg-white border rounded-2xl p-6">
            <h2 className="font-bold mb-4">Changer le statut</h2>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(STATUS_LABELS) as Order["status"][]).map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  disabled={updating || s === order.status}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${
                    s === order.status
                      ? "bg-gray-900 text-white border-gray-900"
                      : "hover:bg-gray-50 disabled:opacity-50"
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Client */}
        <div className="bg-white border rounded-2xl p-6 h-fit text-sm">
          <h2 className="font-bold mb-4">Client</h2>
          <div className="space-y-3">
            <div>
              <div className="text-gray-500">Nom</div>
              <div className="font-medium">{order.customerName}</div>
            </div>
            <div>
              <div className="text-gray-500">Téléphone</div>
              <a
                href={`tel:${order.phone}`}
                className="font-medium text-orange-500"
              >
                {order.phone}
              </a>
            </div>
            <div>
              <div className="text-gray-500">Adresse</div>
              <div className="font-medium">
                {order.address}, {order.city}
              </div>
            </div>
            {order.notes && (
              <div>
                <div className="text-gray-500">Notes</div>
                <div className="font-medium">{order.notes}</div>
              </div>
            )}
            {order.createdAt && (
              <div>
                <div className="text-gray-500">Date</div>
                <div className="font-medium">
                  {new Date(order.createdAt).toLocaleString("fr-FR")}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
