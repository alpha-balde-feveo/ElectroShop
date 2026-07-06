import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { api } from "../api/http";
import type { Order } from "../types";
import { formatPrice } from "../utils/format";
import { STATUS_LABELS } from "./status";

const PIPELINE: Order["status"][] = [
  "PENDING",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELED",
];

const DOT: Record<Order["status"], string> = {
  PENDING: "bg-yellow-400",
  PAID: "bg-blue-400",
  SHIPPED: "bg-purple-400",
  DELIVERED: "bg-green-400",
  CANCELED: "bg-red-400",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<Order["status"] | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Order[]>("/api/orders")
      .then((res) => setOrders(res.data))
      .catch(() => setError("Erreur de chargement"))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const c = new Map<Order["status"], number>();
    for (const o of orders) c.set(o.status, (c.get(o.status) ?? 0) + 1);
    return c;
  }, [orders]);

  const visible = filter ? orders.filter((o) => o.status === filter) : orders;

  const updateStatus = async (id: string, status: Order["status"]) => {
    const prev = orders;
    setOrders((os) => os.map((o) => (o._id === id ? { ...o, status } : o)));
    try {
      await api.put(`/api/orders/${id}/status`, { status });
    } catch {
      setOrders(prev); // rollback
      alert("Mise à jour impossible");
    }
  };

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-extrabold">
        Commandes <span className="text-outline">{orders.length}</span>
      </h1>

      {/* Pipeline de statuts */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("")}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
            filter === ""
              ? "bg-white text-gray-950 border-white"
              : "border-white/15 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          Toutes · {orders.length}
        </button>

        {PIPELINE.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(filter === s ? "" : s)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition ${
              filter === s
                ? "bg-white text-gray-950 border-white"
                : "border-white/15 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${DOT[s]}`} />
            {STATUS_LABELS[s]} · {counts.get(s) ?? 0}
          </button>
        ))}
      </div>

      {loading && <div className="mt-8 text-gray-400">Chargement...</div>}
      {error && <div className="mt-8 text-red-400">{error}</div>}

      {/* Liste */}
      {!loading && !error && (
        <div className="mt-6 space-y-3">
          {visible.length === 0 && (
            <div className="text-gray-500 text-sm py-10 text-center border border-dashed border-white/10 rounded-3xl">
              Aucune commande{filter ? ` « ${STATUS_LABELS[filter]} »` : ""}.
            </div>
          )}

          {visible.map((o) => (
            <div
              key={o._id}
              className="group grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.03] px-5 py-4 hover:border-white/25 transition"
            >
              {/* Client */}
              <div className="flex items-center gap-4 min-w-0">
                <span className="h-11 w-11 shrink-0 rounded-2xl bg-white/5 border border-white/10 grid place-items-center text-xs font-bold text-gray-400">
                  {o.customerName.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{o.customerName}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {o.phone} · {o.city}
                    {o.createdAt &&
                      ` · ${new Date(o.createdAt).toLocaleDateString("fr-FR")}`}
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="text-right md:text-left">
                <div className="text-xs text-gray-500">
                  {o.items.length} article{o.items.length > 1 ? "s" : ""}
                </div>
                <div className="font-extrabold text-orange-400">
                  {formatPrice(o.total)}
                </div>
              </div>

              {/* Statut inline */}
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${DOT[o.status]}`} />
                <select
                  value={o.status}
                  onChange={(e) =>
                    updateStatus(o._id, e.target.value as Order["status"])
                  }
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white [&>option]:bg-[#0b0d14]"
                >
                  {PIPELINE.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Détail */}
              <Link
                to={`/admin/orders/${o._id}`}
                aria-label="Voir la commande"
                className="h-10 w-10 rounded-full border border-white/15 grid place-items-center text-gray-400 hover:bg-orange-500 hover:border-orange-500 hover:text-white transition group-hover:rotate-45 justify-self-end"
              >
                <ArrowUpRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
