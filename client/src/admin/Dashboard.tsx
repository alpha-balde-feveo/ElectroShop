import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowUpRight,
  Clock,
  ShoppingBag,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type React from "react";
import { api } from "../api/http";
import type { Order, Product } from "../types";
import { formatPrice } from "../utils/format";
import { buildImageUrl } from "../utils/image";
import { StatusBadge } from "./status";

type Stats = { ordersCount: number; revenue: number; lowStock: number };

/** Compteur animé (ease-out cubic) */
function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<Stats>("/api/admin/stats"),
      api.get<Order[]>("/api/orders"),
      api.get<Product[]>("/api/products"),
    ])
      .then(([s, o, p]) => {
        setStats(s.data);
        setOrders(o.data);
        setProducts(p.data);
      })
      .catch(() => setError("Erreur de chargement"));
  }, []);

  // CA des 7 derniers jours (hors annulées)
  const weekSeries = useMemo(() => {
    const days: { label: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toDateString();
      const total = orders
        .filter(
          (o) =>
            o.status !== "CANCELED" &&
            o.createdAt &&
            new Date(o.createdAt).toDateString() === key
        )
        .reduce((sum, o) => sum + o.total, 0);
      days.push({
        label: d.toLocaleDateString("fr-FR", { weekday: "short" }),
        total,
      });
    }
    return days;
  }, [orders]);

  const weekTotal = weekSeries.reduce((s, d) => s + d.total, 0);
  const pending = orders.filter((o) => o.status === "PENDING").length;
  const lowStockProducts = products
    .filter((p) => p.stock <= 3)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);
  const recentOrders = orders.slice(0, 5);

  const revenue = useCountUp(stats?.revenue ?? 0);
  const ordersCount = useCountUp(stats?.ordersCount ?? 0, 700);
  const pendingCount = useCountUp(pending, 700);

  if (error) return <div className="text-red-400">{error}</div>;
  if (!stats) return <div className="text-gray-400">Chargement...</div>;

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div>
      {/* En-tête */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm text-gray-500 capitalize">{today}</div>
          <h1 className="mt-1 text-3xl md:text-4xl font-extrabold">
            Bonjour 👋<span className="text-outline ml-2">Pilotage</span>
          </h1>
        </div>
        <Link
          to="/admin/products?new=1"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-500 hover:bg-orange-400 text-sm font-semibold transition shadow-lg shadow-orange-500/20"
        >
          + Nouveau produit
        </Link>
      </div>

      {/* KPIs */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Carte CA avec sparkline */}
        <div className="sm:col-span-2 relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-orange-500/15 via-white/[0.04] to-white/[0.02] p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400 flex items-center gap-2">
              <Wallet size={15} className="text-orange-400" />
              Chiffre d'affaires total
            </span>
            <span className="text-[11px] text-gray-500 flex items-center gap-1">
              <TrendingUp size={12} className="text-green-400" />
              {formatPrice(weekTotal)} / 7 jours
            </span>
          </div>
          <div className="mt-2 text-3xl md:text-4xl font-extrabold tabular-nums">
            {formatPrice(revenue)}
          </div>
          <Sparkline data={weekSeries.map((d) => d.total)} />
          <div className="mt-1 flex justify-between text-[10px] text-gray-600 uppercase">
            {weekSeries.map((d, i) => (
              <span key={i}>{d.label}</span>
            ))}
          </div>
        </div>

        <KpiCard
          label="Commandes"
          value={String(ordersCount)}
          icon={<ShoppingBag size={15} className="text-blue-400" />}
          to="/admin/orders"
        />
        <div className="grid grid-rows-2 gap-4">
          <MiniKpi
            label="En attente"
            value={String(pendingCount)}
            icon={<Clock size={14} className="text-yellow-400" />}
            to="/admin/orders"
          />
          <MiniKpi
            label="Stock faible"
            value={String(stats.lowStock)}
            icon={<AlertTriangle size={14} className="text-red-400" />}
            to="/admin/products"
            alert={stats.lowStock > 0}
          />
        </div>
      </div>

      {/* Listes */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Commandes récentes */}
        <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Commandes récentes</h2>
            <Link
              to="/admin/orders"
              className="text-xs text-gray-500 hover:text-orange-400 inline-flex items-center gap-1 transition"
            >
              Tout voir <ArrowUpRight size={12} />
            </Link>
          </div>

          <div className="mt-4 space-y-2">
            {recentOrders.length === 0 && (
              <div className="text-sm text-gray-500 py-6 text-center">
                Aucune commande pour le moment.
              </div>
            )}
            {recentOrders.map((o) => (
              <Link
                key={o._id}
                to={`/admin/orders/${o._id}`}
                className="flex items-center gap-4 rounded-2xl border border-transparent hover:border-white/10 hover:bg-white/[0.04] px-3 py-2.5 transition"
              >
                <span className="h-9 w-9 rounded-full bg-white/5 border border-white/10 grid place-items-center text-xs font-bold text-gray-400">
                  {o.customerName.slice(0, 2).toUpperCase()}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold truncate">
                    {o.customerName}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {o.items.length} article{o.items.length > 1 ? "s" : ""} ·{" "}
                    {o.createdAt
                      ? new Date(o.createdAt).toLocaleDateString("fr-FR")
                      : ""}
                  </span>
                </span>
                <span className="text-sm font-bold text-orange-400 whitespace-nowrap">
                  {formatPrice(o.total)}
                </span>
                <StatusBadge status={o.status} />
              </Link>
            ))}
          </div>
        </div>

        {/* Alertes stock */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Alertes stock</h2>
            <Link
              to="/admin/products"
              className="text-xs text-gray-500 hover:text-orange-400 inline-flex items-center gap-1 transition"
            >
              Gérer <ArrowUpRight size={12} />
            </Link>
          </div>

          <div className="mt-4 space-y-2">
            {lowStockProducts.length === 0 && (
              <div className="text-sm text-gray-500 py-6 text-center">
                Tout va bien, aucun stock critique. ✅
              </div>
            )}
            {lowStockProducts.map((p) => (
              <div
                key={p._id}
                className="flex items-center gap-3 rounded-2xl px-2 py-2"
              >
                <img
                  src={buildImageUrl(p.images?.[0]?.url)}
                  alt=""
                  className="h-10 w-10 rounded-lg object-cover bg-white/10"
                />
                <span className="flex-1 min-w-0 text-sm font-medium truncate">
                  {p.name}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    p.stock === 0
                      ? "bg-red-500/15 text-red-400 border-red-500/30"
                      : "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
                  }`}
                >
                  {p.stock} restant{p.stock > 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Sparkline SVG (aire + ligne) */
function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const W = 100;
  const H = 32;
  const step = W / Math.max(1, data.length - 1);

  const points = data
    .map((v, i) => `${(i * step).toFixed(1)},${(H - (v / max) * (H - 4) - 2).toFixed(1)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="mt-3 h-14 w-full"
    >
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f97316" stopOpacity="0.4" />
          <stop offset="1" stopColor="#f97316" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${H} ${points} ${W},${H}`} fill="url(#spark)" />
      <polyline
        points={points}
        fill="none"
        stroke="#fb923c"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function KpiCard({
  label,
  value,
  icon,
  to,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 hover:border-orange-500/40 hover:-translate-y-0.5 transition-all flex flex-col justify-between"
    >
      <span className="text-sm text-gray-400 flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span className="text-3xl md:text-4xl font-extrabold tabular-nums mt-4">
        {value}
      </span>
    </Link>
  );
}

function MiniKpi({
  label,
  value,
  icon,
  to,
  alert,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  to: string;
  alert?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`rounded-3xl border p-4 flex items-center justify-between transition-all hover:-translate-y-0.5 ${
        alert
          ? "border-red-500/30 bg-red-500/[0.06] hover:border-red-500/50"
          : "border-white/10 bg-white/[0.03] hover:border-orange-500/40"
      }`}
    >
      <span className="text-xs text-gray-400 flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span className="text-2xl font-extrabold tabular-nums">{value}</span>
    </Link>
  );
}
