import { Link, NavLink } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../../context/CartContext";

export default function Header() {
  const { count } = useCart();

  const navCls = ({ isActive }: { isActive: boolean }) =>
    `transition ${
      isActive ? "text-orange-500 font-semibold" : "hover:text-gray-900"
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
      {/* Top bar */}
      <div className="bg-gray-950 text-gray-300 text-xs">
        <div className="max-w-6xl mx-auto px-4 py-1.5 flex items-center justify-between">
          <span>🚚 Livraison express 24h à Dakar</span>
          <span className="hidden sm:inline">
            💵 Paiement à la livraison — Cash & Mobile Money
          </span>
        </div>
      </div>

      {/* Main nav */}
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="font-extrabold tracking-wide text-lg">
          ELECTRO<span className="text-orange-500">SHOP</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-700">
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
            className="relative px-3 py-2 rounded-xl border bg-white hover:bg-gray-50 text-sm inline-flex items-center gap-2 transition"
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
            className="px-3 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 text-sm transition"
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
