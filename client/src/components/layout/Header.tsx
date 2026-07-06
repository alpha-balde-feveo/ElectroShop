import { Link, NavLink, useLocation } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../../context/CartContext";

export default function Header() {
  const { count } = useCart();
  const { pathname } = useLocation();
  const dark = pathname === "/"; // page d'accueil sombre

  const navCls = ({ isActive }: { isActive: boolean }) =>
    `transition ${
      isActive
        ? "text-orange-500 font-semibold"
        : dark
        ? "hover:text-white"
        : "hover:text-gray-900"
    }`;

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur border-b transition-colors ${
        dark
          ? "bg-[#05060a]/80 border-white/10 text-gray-300"
          : "bg-white/90 border-gray-200 text-gray-700"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          to="/"
          className={`font-extrabold tracking-wide text-lg ${
            dark ? "text-white" : "text-gray-900"
          }`}
        >
          ELECTRO<span className="text-orange-500">SHOP</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <NavLink to="/" end className={navCls}>
            Accueil
          </NavLink>
          <NavLink to="/shop" className={navCls}>
            Boutique
          </NavLink>
          <NavLink to="/cart" className={navCls}>
            Panier
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/cart"
            aria-label="Panier"
            className={`relative px-3 py-2 rounded-xl border text-sm inline-flex items-center gap-2 transition ${
              dark
                ? "border-white/15 bg-white/5 hover:bg-white/10 text-white"
                : "border-gray-200 bg-white hover:bg-gray-50"
            }`}
          >
            <ShoppingCart size={16} />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 inline-flex items-center justify-center text-xs w-5 h-5 rounded-full bg-orange-500 text-white font-bold">
                {count}
              </span>
            )}
          </Link>
          <Link
            to="/admin"
            className={`px-3 py-2 rounded-xl text-sm transition ${
              dark
                ? "bg-white text-gray-950 hover:bg-orange-400 hover:text-white font-semibold"
                : "bg-gray-900 text-white hover:bg-gray-800"
            }`}
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
