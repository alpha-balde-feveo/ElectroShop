import { useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, Package, ShoppingBag } from "lucide-react";
import { clearToken, isLoggedIn } from "./auth";

export default function AdminLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn()) navigate("/admin/login");
  }, [navigate]);

  const logout = () => {
    clearToken();
    navigate("/admin/login");
  };

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ${
      isActive
        ? "bg-orange-500 text-white"
        : "text-gray-400 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-[#05060a] text-white">
      <header className="sticky top-0 z-40 bg-[#05060a]/80 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 font-extrabold tracking-wide"
            >
              <img src="/favicon.svg" alt="" className="h-7 w-7 rounded-lg" />
              GAYE<span className="text-orange-500">STORE</span>
            </Link>
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 font-semibold border border-orange-500/30">
              Admin
            </span>
          </div>

          <nav className="flex items-center gap-2">
            <NavLink to="/admin" end className={linkCls}>
              <LayoutDashboard size={16} />
              <span className="hidden sm:inline">Tableau de bord</span>
            </NavLink>
            <NavLink to="/admin/products" className={linkCls}>
              <Package size={16} />
              <span className="hidden sm:inline">Produits</span>
            </NavLink>
            <NavLink to="/admin/orders" className={linkCls}>
              <ShoppingBag size={16} />
              <span className="hidden sm:inline">Commandes</span>
            </NavLink>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
