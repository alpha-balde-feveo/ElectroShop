import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowUpRight,
  Clock,
  ShoppingBag,
  TrendingDown,
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

type Period = "week" | "month" | "year";

type DayStat = {
  label: string; // "lun." / "2 juin" / "juil."
  dateLabel: string; // libellé complet de la période
  total: number;
  count: number;
  isToday: boolean; // période en cours
};

const PERIOD_LABELS: Record<Period, string> = {
  week: "Semaine",
  month: "Mois",
  year: "Année",
};

const TREND_LABELS: Record<Period, string> = {
  week: "vs sem. passée",
  month: "vs 6 sem. préc.",
  year: "vs année préc.",
};

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

/** Format compact : 78 000 → "78k", 1 250 000 → "1,3M" */
function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".", ",")}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(n);
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>("week");
  const [selectedDay, setSelectedDay] = useState(6); // période en cours

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

  // CA par période : semaine (7 jours), mois (6 semaines), année (12 mois)
  const { days, prevTotal } = useMemo(() => {
    const valid = orders.filter(
      (o) => o.status !== "CANCELED" && o.createdAt
    );

    // Somme et nombre de commandes sur un intervalle [from, to[
    const sumRange = (from: Date, to: Date) => {
      const f = from.getTime();
      const t = to.getTime();
      let total = 0;
      let count = 0;
      for (const o of valid) {
        const d = new Date(o.createdAt!).getTime();
        if (d >= f && d < t) {
          total += o.total;
          count++;
        }
      }
      return { total, count };
    };

    const startOfDay = (offset: number) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + offset);
      return d;
    };

    const days: DayStat[] = [];
    let prevTotal = 0;

    if (period === "week") {
      for (let i = 6; i >= 0; i--) {
        const from = startOfDay(-i);
        const to = startOfDay(-i + 1);
        const { total, count } = sumRange(from, to);
        days.push({
          label: from.toLocaleDateString("fr-FR", { weekday: "short" }),
          dateLabel: from.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
          }),
          total,
          count,
          isToday: i === 0,
        });
      }
      prevTotal = sumRange(startOfDay(-13), startOfDay(-6)).total;
    } else if (period === "month") {
      // 6 tranches de 7 jours
      for (let w = 5; w >= 0; w--) {
        const from = startOfDay(-(w * 7 + 6));
        const to = startOfDay(-(w * 7) + 1);
        const { total, count } = sumRange(from, to);
        days.push({
          label: from.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
          }),
          dateLabel: `${from.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
          })} → ${new Date(to.getTime() - 1).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
          })}`,
          total,
          count,
          isToday: w === 0,
        });
      }
      prevTotal = sumRange(startOfDay(-83), startOfDay(-41)).total;
    } else {
      // 12 derniers mois
      const now = new Date();
      for (let m = 11; m >= 0; m--) {
        const from = new Date(now.getFullYear(), now.getMonth() - m, 1);
        const to = new Date(now.getFullYear(), now.getMonth() - m + 1, 1);
        const { total, count } = sumRange(from, to);
        days.push({
          label: from.toLocaleDateString("fr-FR", { month: "short" }),
          dateLabel: from.toLocaleDateString("fr-FR", {
            month: "long",
            year: "numeric",
          }),
          total,
          count,
          isToday: m === 0,
        });
      }
      const prevFrom = new Date(now.getFullYear() - 1, now.getMonth() - 11, 1);
      const prevTo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      prevTotal = sumRange(prevFrom, prevTo).total;
    }

    return { days, prevTotal };
  }, [orders, period]);

  const weekTotal = days.reduce((s, d) => s + d.total, 0);
  const trend =
    prevTotal > 0 ? Math.round(((weekTotal - prevTotal) / prevTotal) * 100) : null;

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

  const sel = days[Math.min(selectedDay, days.length - 1)];

  const changePeriod = (p: Period) => {
    setPeriod(p);
    // Sélectionne la période en cours (dernier immeuble)
    setSelectedDay(p === "year" ? 11 : p === "month" ? 5 : 6);
  };

  return (
    <div>
      {/* En-tête */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm text-gray-500 capitalize">{today}</div>
          <h1 className="mt-1 text-3xl md:text-4xl font-extrabold">
            Bonjour <span className="text-outline ml-2">Pilotage</span>
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
        {/* ===== SKYLINE DU CHIFFRE D'AFFAIRES ===== */}
        <div className="sm:col-span-2 relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-orange-500/15 via-white/[0.04] to-white/[0.02] p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm text-gray-400 flex items-center gap-2">
              <Wallet size={15} className="text-orange-400" />
              Chiffre d'affaires
            </span>

            <div className="flex items-center gap-2">
              {/* Tendance vs période précédente */}
              {trend !== null && (
                <span
                  className={`text-[11px] font-semibold flex items-center gap-1 px-2 py-1 rounded-full border ${
                    trend >= 0
                      ? "text-green-400 bg-green-500/10 border-green-500/30"
                      : "text-red-400 bg-red-500/10 border-red-500/30"
                  }`}
                >
                  {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {trend >= 0 ? "+" : ""}
                  {trend}% {TREND_LABELS[period]}
                </span>
              )}

              {/* Sélecteur de période */}
              <div className="flex rounded-full border border-white/10 bg-white/5 p-0.5">
                {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => changePeriod(p)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition ${
                      period === p
                        ? "bg-orange-500 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {PERIOD_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-1 flex flex-col md:flex-row md:items-end gap-4 justify-between">
            {/* Lecture simple à gauche */}
            <div className="shrink-0">
              <div className="text-3xl font-extrabold tabular-nums">
                {formatPrice(revenue)}
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                {formatPrice(weekTotal)} sur la période affichée
              </div>

              {/* Détail de la période survolée */}
              <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 min-w-[180px]">
                <div className="text-[11px] uppercase tracking-widest text-gray-500 capitalize">
                  {sel.isToday
                    ? period === "week"
                      ? "Aujourd'hui"
                      : "En cours"
                    : period === "week"
                    ? `${sel.label} ${sel.dateLabel}`
                    : sel.dateLabel}
                </div>
                <div className="mt-0.5 text-lg font-extrabold text-orange-400 tabular-nums">
                  {formatPrice(sel.total)}
                </div>
                <div className="text-[11px] text-gray-500">
                  {sel.count} commande{sel.count > 1 ? "s" : ""}
                </div>
              </div>
            </div>

            {/* La ville isométrique */}
            <RevenueSkyline
              days={days}
              selected={selectedDay}
              onSelect={setSelectedDay}
            />
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

/* =====================================================================
   SKYLINE ISOMÉTRIQUE — chaque jour est un immeuble, hauteur = CA du jour.
   Survolez un immeuble pour lire son détail. Balise pulsante = record.
   ===================================================================== */
function RevenueSkyline({
  days,
  selected,
  onSelect,
}: {
  days: DayStat[];
  selected: number;
  onSelect: (i: number) => void;
}) {
  const K = 0.866; // cos(30°)
  const W = 44; // largeur d'un immeuble
  const D = 44; // profondeur
  const GAP = 62; // espacement le long de la rue
  const HMAX = 120; // hauteur du record

  const max = Math.max(...days.map((d) => d.total), 1);
  const bestIndex = days.reduce(
    (best, d, i) => (d.total > days[best].total ? i : best),
    0
  );
  const hasRevenue = days.some((d) => d.total > 0);

  const proj = (x: number, y: number, z: number): [number, number] => [
    (x - y) * K,
    (x + y) * 0.5 - z,
  ];

  type Building = {
    top: string;
    front: string;
    right: string;
    base: string;
    labelPos: [number, number];
    valuePos: [number, number];
    beaconPos: [number, number];
    h: number;
  };

  const pts: [number, number][] = [];
  const P = (x: number, y: number, z: number): string => {
    const p = proj(x, y, z);
    pts.push(p);
    return `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
  };

  const buildings: Building[] = days.map((d, i) => {
    const bx = i * GAP;
    const h = d.total === 0 ? 5 : 16 + (d.total / max) * HMAX;

    // Coins du toit et du sol
    const top = [P(bx, 0, h), P(bx + W, 0, h), P(bx + W, D, h), P(bx, D, h)].join(" ");
    const front = [P(bx, D, h), P(bx + W, D, h), P(bx + W, D, 0), P(bx, D, 0)].join(" ");
    const right = [P(bx + W, 0, h), P(bx + W, D, h), P(bx + W, D, 0), P(bx + W, 0, 0)].join(" ");
    const m = 7; // marge du socle
    const base = [
      P(bx - m, -m, 0),
      P(bx + W + m, -m, 0),
      P(bx + W + m, D + m, 0),
      P(bx - m, D + m, 0),
    ].join(" ");

    const labelPos = proj(bx + W / 2, D + 22, 0);
    const valuePos = proj(bx + W / 2, D / 2, h + 14);
    const beaconPos = proj(bx + W / 2, D / 2, h + 30);
    pts.push(labelPos, valuePos, beaconPos);

    return { top, front, right, base, labelPos, valuePos, beaconPos, h };
  });

  // ViewBox ajusté aux points calculés
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const minX = Math.min(...xs) - 10;
  const minY = Math.min(...ys) - 10;
  const vbW = Math.max(...xs) - minX + 10;
  const vbH = Math.max(...ys) - minY + 14;

  return (
    <svg
      viewBox={`${minX} ${minY} ${vbW} ${vbH}`}
      className="w-full md:max-w-[430px] select-none"
      role="img"
      aria-label="Chiffre d'affaires par jour, en immeubles"
    >
      {buildings.map((b, i) => {
        const d = days[i];
        const active = i === selected;
        const empty = d.total === 0;

        const topC = empty ? "#334155" : active ? "#fdba74" : "#fb923c";
        const frontC = empty ? "#1e293b" : active ? "#f97316" : "#ea580c";
        const rightC = empty ? "#0f172a" : active ? "#c2410c" : "#9a3412";

        return (
          <g
            key={i}
            onMouseEnter={() => onSelect(i)}
            onClick={() => onSelect(i)}
            className="cursor-pointer"
            style={{ opacity: 0, animation: `fade-up 0.5s ease-out ${i * 90}ms forwards` }}
          >
            {/* Socle */}
            <polygon
              points={b.base}
              fill={active ? "rgba(249,115,22,0.14)" : "rgba(255,255,255,0.04)"}
              stroke={active ? "rgba(249,115,22,0.5)" : "rgba(255,255,255,0.08)"}
              strokeWidth="1"
            />

            {/* Immeuble */}
            <polygon points={b.right} fill={rightC} />
            <polygon points={b.front} fill={frontC} />
            <polygon
              points={b.top}
              fill={topC}
              stroke={active ? "#fff" : "transparent"}
              strokeOpacity="0.4"
              strokeWidth="1"
            />

            {/* Montant au sommet */}
            {!empty && (
              <text
                x={b.valuePos[0]}
                y={b.valuePos[1]}
                textAnchor="middle"
                fontSize="11"
                fontWeight="800"
                fill={active ? "#ffffff" : "#d1d5db"}
                fontFamily="ui-monospace, monospace"
              >
                {compact(d.total)}
              </text>
            )}

            {/* Balise du record */}
            {hasRevenue && i === bestIndex && (
              <g>
                <circle
                  cx={b.beaconPos[0]}
                  cy={b.beaconPos[1]}
                  r="4"
                  fill="#fbbf24"
                  className="animate-ping"
                  style={{ transformOrigin: `${b.beaconPos[0]}px ${b.beaconPos[1]}px` }}
                />
                <circle cx={b.beaconPos[0]} cy={b.beaconPos[1]} r="2.5" fill="#fbbf24" />
              </g>
            )}

            {/* Jour */}
            <text
              x={b.labelPos[0]}
              y={b.labelPos[1]}
              textAnchor="middle"
              fontSize="10"
              fill={d.isToday ? "#fb923c" : active ? "#d1d5db" : "#6b7280"}
              fontWeight={d.isToday || active ? 700 : 400}
              className="uppercase"
            >
              {d.label}
            </text>
          </g>
        );
      })}
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
