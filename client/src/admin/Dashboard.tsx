import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { AxiosError } from "axios";
import { AlertTriangle, ShoppingBag, Wallet } from "lucide-react";
import { api } from "../api/http";
import { formatPrice } from "../utils/format";

type Stats = {
  ordersCount: number;
  revenue: number;
  lowStock: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Stats>("/api/admin/stats")
      .then((res) => setStats(res.data))
      .catch((e: AxiosError<{ message?: string }>) =>
        setError(e.response?.data?.message ?? "Erreur de chargement")
      );
  }, []);

  if (error) return <div className="text-red-600">{error}</div>;
  if (!stats) return <div className="text-gray-600">Chargement...</div>;

  const cards = [
    {
      label: "Commandes",
      value: String(stats.ordersCount),
      icon: <ShoppingBag className="text-blue-500" />,
      to: "/admin/orders",
    },
    {
      label: "Chiffre d'affaires",
      value: formatPrice(stats.revenue),
      icon: <Wallet className="text-green-500" />,
      to: "/admin/orders",
    },
    {
      label: "Stock faible (≤ 3)",
      value: String(stats.lowStock),
      icon: <AlertTriangle className="text-orange-500" />,
      to: "/admin/products",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{c.label}</span>
              {c.icon}
            </div>
            <div className="text-2xl font-extrabold mt-2">{c.value}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
