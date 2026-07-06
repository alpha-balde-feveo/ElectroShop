import { Link, NavLink } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../../context/CartContext";

export default function Header() {
  const { count } = useCart();

  const navCls = ({ isActive }: { isActive: boolean }) =>
    `transition ${
      isActive ? "text-orange-500 font-semibold" : "hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-40 bg-[#05060a]/80 backdrop-blur border-b border-white/10 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2.5 font-extrabold tracking-wide text-lg text-white"
        >
          <img src="/favicon.svg" alt="" className="h-8 w-8 rounded-lg" />
          GAYE<span className="text-orange-500">STORE</span>
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

        <Link
          to="/cart"
          aria-label="Panier"
          className="relative px-3 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-sm inline-flex items-center gap-2 transition"
        >
          <ShoppingCart size={16} />
          {count > 0 && (
            <span className="absolute -top-2 -right-2 inline-flex items-center justify-center text-xs w-5 h-5 rounded-full bg-orange-500 text-white font-bold">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
