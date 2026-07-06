import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { AxiosError } from "axios";
import { api } from "../api/http";
import type { Order } from "../types";
import { formatPrice } from "../utils/format";
import { STATUS_LABELS, StatusBadge } from "./status";

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Order[]>("/api/orders")
      .then((res) => setOrders(res.data))
      .catch((e: AxiosError<{ message?: string }>) =>
        setError(e.response?.data?.message ?? "Erreur de chargement")
      )
      .finally(() => setLoading(false));
  }, []);

  const visible = filter ? orders.filter((o) => o.status === filter) : orders;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Commandes ({visible.length})</h1>

        <select
          className="rounded-xl border px-3 py-2 text-sm bg-white"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>

      {loading && <div className="text-gray-600">Chargement...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="bg-white border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3 hidden md:table-cell">Ville</th>
                <th className="px-4 py-3 hidden sm:table-cell">Date</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((o) => (
                <tr key={o._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/orders/${o._id}`}
                      className="font-medium hover:text-orange-500"
                    >
                      {o.customerName}
                    </Link>
                    <div className="text-xs text-gray-500">{o.phone}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-600">
                    {o.city}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-gray-600">
                    {o.createdAt
                      ? new Date(o.createdAt).toLocaleDateString("fr-FR")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 font-medium whitespace-nowrap">
                    {formatPrice(o.total)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Aucune commande.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
