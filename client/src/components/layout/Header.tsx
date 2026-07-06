import { Link, NavLink } from "react-router-dom";
import { Moon, ShoppingCart, Sun } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useTheme } from "../../context/ThemeContext";

export default function Header() {
  const { count } = useCart();
  const { theme, toggle } = useTheme();

  const navCls = ({ isActive }: { isActive: boolean }) =>
    `transition ${
      isActive ? "text-orange-500 font-semibold" : "hover-text-app"
    }`;

  return (
    <header className="sticky top-0 z-40 backdrop-blur border-b border-app text-muted bg-[color-mix(in_srgb,var(--app-bg)_85%,transparent)]">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2.5 font-extrabold tracking-wide text-lg text-app"
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

        <div className="flex items-center gap-3">
          {/* Bascule clair / sombre */}
          <button
            onClick={toggle}
            aria-label={
              theme === "dark" ? "Passer en thème clair" : "Passer en thème sombre"
            }
            title={theme === "dark" ? "Thème clair" : "Thème sombre"}
            className="px-3 py-2 rounded-xl border border-app-strong bg-card-2 hover:text-orange-500 text-app text-sm inline-flex items-center transition"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <Link
            to="/cart"
            aria-label="Panier"
            className="relative px-3 py-2 rounded-xl border border-app-strong bg-card-2 hover:text-orange-500 text-app text-sm inline-flex items-center gap-2 transition"
          >
            <ShoppingCart size={16} />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 inline-flex items-center justify-center text-xs w-5 h-5 rounded-full bg-orange-500 text-white font-bold">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
