import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Command,
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingBag,
  Store,
} from "lucide-react";
import type React from "react";
import { clearToken, isLoggedIn } from "./auth";
import CommandPalette from "./CommandPalette";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) navigate("/admin/login");
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
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#05060a] text-white relative">
      {/* Fond ambiant */}
      <div className="pointer-events-none fixed inset-0 bg-grid" />
      <div className="pointer-events-none fixed -top-40 left-1/4 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

      {/* Barre du haut minimaliste */}
      <header className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 pt-6 flex items-center justify-between">
          <Link
            to="/admin"
            className="flex items-center gap-2.5 font-extrabold tracking-wide"
          >
            <img src="/favicon.svg" alt="" className="h-8 w-8 rounded-lg" />
            GAYE<span className="text-orange-500">STORE</span>
            <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 font-semibold border border-orange-500/30 tracking-normal">
              COMMAND CENTER
            </span>
          </Link>

          <button
            onClick={() => setPaletteOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm text-gray-400 hover:text-white transition"
          >
            <Command size={14} />
            <span className="hidden sm:inline">Rechercher...</span>
            <kbd className="text-[10px] border border-white/15 rounded px-1.5 py-0.5 text-gray-500">
              ⌘K
            </kbd>
          </button>
        </div>
      </header>

      {/* Contenu (marge basse pour le dock) */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8 pb-36">
        <Outlet />
      </main>

      {/* ===== DOCK FLOTTANT ===== */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-end gap-1 rounded-2xl border border-white/10 bg-[#0b0d14]/80 backdrop-blur-xl px-3 py-2.5 shadow-2xl shadow-black/60">
          <DockLink to="/admin" end label="Tableau de bord">
            <LayoutDashboard size={20} />
          </DockLink>
          <DockLink to="/admin/products" label="Produits">
            <Package size={20} />
          </DockLink>
          <DockLink to="/admin/orders" label="Commandes">
            <ShoppingBag size={20} />
          </DockLink>

          <span className="mx-1 h-8 w-px bg-white/10 self-center" />

          <DockButton label="Palette (⌘K)" onClick={() => setPaletteOpen(true)}>
            <Command size={20} />
          </DockButton>
          <DockLink to="/" label="Voir la boutique">
            <Store size={20} />
          </DockLink>
          <DockButton label="Déconnexion" onClick={logout} danger>
            <LogOut size={20} />
          </DockButton>
        </div>
      </nav>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}

function DockLink({
  to,
  end,
  label,
  children,
}: {
  to: string;
  end?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <NavLink to={to} end={end} className="group relative" aria-label={label}>
      {({ isActive }) => (
        <>
          <Tooltip label={label} />
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200 group-hover:-translate-y-2 group-hover:scale-110 ${
              isActive
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                : "bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white"
            }`}
          >
            {children}
          </span>
          {/* Point actif */}
          <span
            className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full transition ${
              isActive ? "bg-orange-500" : "bg-transparent"
            }`}
          />
        </>
      )}
    </NavLink>
  );
}

function DockButton({
  label,
  onClick,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} className="group relative" aria-label={label}>
      <Tooltip label={label} />
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-gray-400 transition-all duration-200 group-hover:-translate-y-2 group-hover:scale-110 ${
          danger
            ? "group-hover:bg-red-500/20 group-hover:text-red-400"
            : "group-hover:bg-white/10 group-hover:text-white"
        }`}
      >
        {children}
      </span>
    </button>
  );
}

function Tooltip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-white text-gray-950 text-xs font-semibold px-2.5 py-1.5 opacity-0 translate-y-1 transition group-hover:opacity-100 group-hover:translate-y-0 shadow-xl">
      {label}
    </span>
  );
}
