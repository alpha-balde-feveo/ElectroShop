import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Command, LogOut, Store } from "lucide-react";
import { clearToken, isLoggedIn } from "./auth";
import CommandPalette from "./CommandPalette";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Re-vérifie le token à chaque navigation interne (retour navigateur inclus)
  const authed = isLoggedIn();

  useEffect(() => {
    // Couvre aussi le retour via bfcache (page restaurée depuis le cache)
    const onPageShow = () => {
      if (!isLoggedIn()) navigate("/admin/login", { replace: true });
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [navigate]);

  // Raccourci ⌘K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const logout = () => {
    clearToken();
    navigate("/admin/login", { replace: true });
  };

  // Garde au rendu : rien ne s'affiche si non connecté
  if (!authed) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  const navCls = ({ isActive }: { isActive: boolean }) =>
    `transition ${
      isActive ? "text-orange-500 font-semibold" : "hover:text-white"
    }`;

  return (
    <div className="dark-scope min-h-screen bg-[#05060a] text-white relative">
      {/* Fond ambiant */}
      <div className="pointer-events-none fixed inset-0 bg-grid" />
      <div className="pointer-events-none fixed -top-40 left-1/4 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

      {/* ===== NAVBAR (même style que la boutique) ===== */}
      <header className="sticky top-0 z-40 bg-[#05060a]/80 backdrop-blur border-b border-white/10 text-gray-300">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/admin"
            className="flex items-center gap-2.5 font-extrabold tracking-wide text-lg text-white"
          >
            <img src="/favicon.svg" alt="" className="h-8 w-8 rounded-lg" />
            GAYE<span className="text-orange-500">STORE</span>
            <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 font-semibold border border-orange-500/30 tracking-normal">
              ADMIN
            </span>
          </Link>

          {/* Liens centrés */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <NavLink to="/admin" end className={navCls}>
              Tableau de bord
            </NavLink>
            <NavLink to="/admin/products" className={navCls}>
              Produits
            </NavLink>
            <NavLink to="/admin/orders" className={navCls}>
              Commandes
            </NavLink>
          </nav>

          {/* Actions à droite */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPaletteOpen(true)}
              aria-label="Recherche (⌘K)"
              className="relative px-3 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-sm inline-flex items-center gap-2 transition"
            >
              <Command size={16} />
              <kbd className="hidden sm:inline text-[10px] border border-white/15 rounded px-1.5 py-0.5 text-gray-500">
                ⌘K
              </kbd>
            </button>

            <Link
              to="/"
              aria-label="Voir la boutique"
              className="px-3 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-sm inline-flex items-center transition"
            >
              <Store size={16} />
            </Link>

            <button
              onClick={logout}
              aria-label="Déconnexion"
              className="px-3 py-2 rounded-xl border border-white/15 bg-white/5 text-white text-sm inline-flex items-center transition hover:bg-red-500/15 hover:border-red-500/40 hover:text-red-400"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
