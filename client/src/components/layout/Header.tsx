export default function Header() {
  return (
    <header className="bg-white border-b">
      {/* Top bar */}
      <div className="text-sm text-gray-600">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-900">Electroshop</span>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span className="hidden sm:inline">Boutique électronique moderne</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="hover:text-gray-900">Compte</button>
            <button className="hover:text-gray-900">Favoris</button>
            <button className="relative hover:text-gray-900">
              Panier
              <span className="ml-2 inline-flex items-center justify-center text-xs w-5 h-5 rounded-full bg-gray-900 text-white">
                0
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="font-extrabold tracking-wide text-lg">ELECTROSHOP</div>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-700">
          <a className="hover:text-gray-900" href="/shop">Shop</a>
          <a className="hover:text-gray-900" href="#">About</a>
          <a className="hover:text-gray-900" href="#">Contact</a>
        </nav>

        <div className="flex items-center gap-3">
          <button className="px-3 py-2 rounded-xl border bg-white hover:bg-gray-50 text-sm">
            Search
          </button>
          <button className="px-3 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 text-sm">
            Admin
          </button>
        </div>
      </div>
    </header>
  );
}
