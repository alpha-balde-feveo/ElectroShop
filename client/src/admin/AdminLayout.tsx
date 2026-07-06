import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Command, LogOut } from "lucide-react";
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

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-[#05060a] text-white relative">
      {/* Fond ambiant */}
      <div className="pointer-events-none fixed inset-0 bg-grid" />
      <div className="pointer-events-none fixed -top-40 left-1/4 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

      {/* ===== BARRE FAÇON FENÊTRE macOS ===== */}
      <header className="sticky top-0 z-50 px-4 pt-4">
        <div className="max-w-6xl mx-auto rounded-2xl border border-white/10 bg-[#0b0d14]/85 backdrop-blur-xl shadow-2xl shadow-black/40">
          <div className="flex items-center gap-4 px-4 py-3">
            {/* Feux tricolores */}
            <div className="flex items-center gap-2 group/lights shrink-0">
              <TrafficLight
                color="bg-red-500"
                label="Quitter (boutique)"
                onClick={() => navigate("/")}
              />
              <TrafficLight
                color="bg-yellow-500"
                label="Tableau de bord"
                onClick={() => navigate("/admin")}
              />
              <TrafficLight
                color="bg-green-500"
                label="Plein écran"
                onClick={toggleFullscreen}
              />
            </div>

            {/* Marque */}
            <div className="hidden md:flex items-center gap-2 font-extrabold tracking-wide text-sm shrink-0">
              <img src="/favicon.svg" alt="" className="h-6 w-6 rounded-md" />
              GAYE<span className="text-orange-500">STORE</span>
            </div>

            {/* Navigation segmentée (style macOS) */}
            <nav className="flex-1 flex justify-center">
              <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
                <SegLink to="/admin" end>
                  Tableau de bord
                </SegLink>
                <SegLink to="/admin/products">Produits</SegLink>
                <SegLink to="/admin/orders">Commandes</SegLink>
              </div>
            </nav>

            {/* Actions à droite */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setPaletteOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm text-gray-400 hover:text-white transition"
              >
                <Command size={14} />
                <kbd className="hidden sm:inline text-[10px] border border-white/15 rounded px-1.5 py-0.5 text-gray-500">
                  ⌘K
                </kbd>
              </button>
              <button
                onClick={logout}
                aria-label="Déconnexion"
                className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 grid place-items-center text-gray-400 hover:bg-red-500/15 hover:border-red-500/40 hover:text-red-400 transition"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        <Outlet />
      </main>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}

function TrafficLight({
  color,
  label,
  onClick,
}: {
  color: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`h-3.5 w-3.5 rounded-full ${color} opacity-80 hover:opacity-100 hover:scale-110 transition ring-1 ring-black/30`}
    />
  );
}

function SegLink({
  to,
  end,
  children,
}: {
  to: string;
  end?: boolean;
  children: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap ${
          isActive
            ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
            : "text-gray-400 hover:text-white hover:bg-white/5"
        }`
      }
    >
      {children}
    </NavLink>
  );
}
