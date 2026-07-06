import type { AxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Eye } from "lucide-react";
import type React from "react";
import { api } from "../api/http";
import type { Category, Product } from "../types";
import { buildImageUrl } from "../utils/image";
import { formatPrice } from "../utils/format";
import { useCart } from "../context/CartContext";

type Sort = "newest" | "price_asc" | "price_desc";

function isSort(v: string): v is Sort {
  return v === "newest" || v === "price_asc" || v === "price_desc";
}

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<string>("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [perPage, setPerPage] = useState<number>(12);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Category[]>("/api/categories")
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get<Product[]>("/api/products", {
          params: category ? { category } : {},
        });

        if (mounted) setProducts(res.data);
      } catch (e: unknown) {
        const err = e as AxiosError<{ message?: string }>;
        const msg =
          err.response?.data?.message ??
          err.message ??
          "Impossible de charger les produits";
        if (mounted) setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [category]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = products.filter((p) => p.name.toLowerCase().includes(q));

    if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);

    if (sort === "newest") {
      list = [...list].sort((a, b) => {
        const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bd - ad;
      });
    }

    return list.slice(0, perPage);
  }, [products, query, sort, perPage]);

  return (
    <div>
      <div className="mb-6">
        <div className="text-sm text-gray-500">Accueil / Boutique</div>
        <h1 className="text-3xl font-semibold mt-2">Tous nos produits</h1>
      </div>

      {/* Barre filtres */}
      <div className="bg-white rounded-2xl border shadow-sm p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-gray-600">
          <span className="font-semibold">{filtered.length}</span> sur{" "}
          <span className="font-semibold">{products.length}</span> résultats
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <select
            className="rounded-xl border px-3 py-2 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="rounded-xl border px-3 py-2 text-sm"
            value={sort}
            onChange={(e) => {
              const v = e.target.value;
              if (isSort(v)) setSort(v);
            }}
          >
            <option value="newest">Tri : Nouveautés</option>
            <option value="price_asc">Tri : Prix croissant</option>
            <option value="price_desc">Tri : Prix décroissant</option>
          </select>

          <select
            className="rounded-xl border px-3 py-2 text-sm"
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
          >
            <option value={12}>Afficher : 12</option>
            <option value={24}>Afficher : 24</option>
            <option value={48}>Afficher : 48</option>
          </select>

          <input
            className="w-full md:w-72 rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10 text-sm"
            placeholder="Rechercher un produit..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {loading && <div className="mt-6 text-gray-600">Chargement...</div>}
      {error && <div className="mt-6 text-red-600">{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="mt-6 text-gray-600">Aucun produit trouvé.</div>
      )}

      {!loading && !error && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((p) => (
            <ProductCard key={p._id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ p }: { p: Product }) {
  const { addItem } = useCart();
  const img = buildImageUrl(p.images?.[0]?.url);
  const outOfStock = p.stock <= 0;

  return (
    <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
      {/* Image */}
      <div className="group relative aspect-square bg-gray-100 overflow-hidden">
        <Link to={`/product/${p._id}`}>
          <img
            src={img}
            alt={p.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {outOfStock && (
          <span className="absolute top-3 left-3 rounded-full bg-red-600 text-white text-xs px-3 py-1">
            Rupture de stock
          </span>
        )}

        {p.oldPrice && p.oldPrice > p.price && (
          <span className="absolute top-3 right-3 rounded-full bg-orange-500 text-white text-xs px-3 py-1">
            Promo
          </span>
        )}

        {/* Dark overlay */}
        <div className="pointer-events-none absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/50" />

        {/* Center icons */}
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="pointer-events-auto flex items-center gap-3 opacity-0 translate-y-2 transition duration-300 group-hover:opacity-100 group-hover:translate-y-0">
            <IconBtn
              label="Ajouter au panier"
              disabled={outOfStock}
              onClick={() => addItem(p)}
            >
              <ShoppingCart size={20} />
            </IconBtn>

            <Link
              to={`/product/${p._id}`}
              aria-label="Voir le produit"
              className="h-12 w-12 rounded-md bg-white shadow grid place-items-center text-gray-700 transition transform hover:text-orange-500 hover:scale-110"
            >
              <Eye size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 text-center">
        <Link to={`/product/${p._id}`}>
          <h3 className="font-extrabold uppercase tracking-wide line-clamp-1 hover:text-orange-500 transition">
            {p.name}
          </h3>
        </Link>

        {p.brand && <p className="text-sm text-gray-500 mt-2">{p.brand}</p>}

        <div className="mt-3 flex items-center justify-center gap-2">
          {p.oldPrice && p.oldPrice > p.price && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(p.oldPrice)}
            </span>
          )}
          <span className="font-extrabold text-lg">{formatPrice(p.price)}</span>
        </div>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  label,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="h-12 w-12 rounded-md bg-white shadow grid place-items-center text-gray-700 transition transform hover:text-orange-500 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:text-gray-700"
    >
      {children}
    </button>
  );
}
