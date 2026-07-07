import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import { api } from "../api/http";
import { isLoggedIn, setToken } from "./auth";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Déjà connecté ? Direction le dashboard (empêche de revenir au login via "retour")
  if (isLoggedIn()) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      const res = await api.post<{ token: string }>("/api/auth/login", {
        email,
        password,
      });
      setToken(res.data.token);
      navigate("/admin");
    } catch (e: unknown) {
      const err = e as AxiosError<{ message?: string }>;
      setError(err.response?.data?.message ?? "Identifiants invalides");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-orange-500/40";

  return (
    <div className="dark-scope min-h-screen bg-mesh text-white grid place-items-center px-4">
      <div className="w-full max-w-sm">
        <Link
          to="/"
          className="flex items-center justify-center gap-2.5 font-extrabold tracking-wide text-xl mb-8"
        >
          <img src="/favicon.svg" alt="" className="h-9 w-9 rounded-lg" />
          GAYE<span className="text-orange-500">TECH</span>&nbsp;STORE
        </Link>

        <form
          onSubmit={handleSubmit}
          className="bg-white/[0.05] backdrop-blur border border-white/10 rounded-3xl p-7 shadow-2xl"
        >
          <h1 className="text-xl font-bold">Espace admin</h1>
          <p className="text-sm text-gray-400 mt-1">
            Connectez-vous pour gérer la boutique.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">
                Email
              </label>
              <input
                type="email"
                required
                className={inputCls}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">
                Mot de passe
              </label>
              <input
                type="password"
                required
                className={inputCls}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <div className="mt-4 text-sm text-red-400">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full px-4 py-3 rounded-full bg-orange-500 text-white hover:bg-orange-400 text-sm font-semibold transition shadow-lg shadow-orange-500/20 disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <Link
          to="/shop"
          className="block text-center text-sm text-gray-500 hover:text-white mt-5 transition"
        >
          ← Retour à la boutique
        </Link>
      </div>
    </div>
  );
}
