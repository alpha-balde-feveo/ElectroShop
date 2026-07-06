import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import { api } from "../api/http";
import { setToken } from "./auth";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-gray-50 grid place-items-center px-4">
      <div className="w-full max-w-sm">
        <Link
          to="/"
          className="block text-center font-extrabold tracking-wide text-xl mb-6"
        >
          ELECTROSHOP
        </Link>

        <form
          onSubmit={handleSubmit}
          className="bg-white border rounded-2xl p-6 shadow-sm"
        >
          <h1 className="text-xl font-bold">Espace admin</h1>
          <p className="text-sm text-gray-500 mt-1">
            Connectez-vous pour gérer la boutique.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                required
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full px-4 py-2.5 rounded-xl bg-gray-900 text-white hover:bg-gray-800 text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <Link
          to="/shop"
          className="block text-center text-sm text-gray-500 hover:text-gray-900 mt-4"
        >
          ← Retour à la boutique
        </Link>
      </div>
    </div>
  );
}
