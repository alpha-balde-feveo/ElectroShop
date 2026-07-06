import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../../context/CartContext";

export default function Header() {
  const { count } = useCart();

  return (
    <header className="bg-white border-b">
      {/* Top bar */}
      <div className="text-sm text-gray-600">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-900">Electroshop</span>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span className="hidden sm:inline">
              Boutique électronique moderne
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/cart"
              className="relative inline-flex items-center gap-1 hover:text-gray-900"
            >
              <ShoppingCart size={16} />
              Panier
              <span className="ml-1 inline-flex items-center justify-center text-xs w-5 h-5 rounded-full bg-gray-900 text-white">
                {count}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="font-extrabold tracking-wide text-lg">
          ELECTROSHOP
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-700">
          <Link className="hover:text-gray-900" to="/shop">
            Boutique
          </Link>
          <Link className="hover:text-gray-900" to="/cart">
            Panier
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/cart"
            className="relative px-3 py-2 rounded-xl border bg-white hover:bg-gray-50 text-sm inline-flex items-center gap-2"
          >
            <ShoppingCart size={16} />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 inline-flex items-center justify-center text-xs w-5 h-5 rounded-full bg-orange-500 text-white">
                {count}
              </span>
            )}
          </Link>
          <Link
            to="/admin"
            className="px-3 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 text-sm"
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
