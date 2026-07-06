import type { AxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/http";
import type { Category, Product } from "../types";
import ProductCard from "../components/ProductCard";

type Sort = "newest" | "price_asc" | "price_desc";

function isSort(v: string): v is Sort {
  return v === "newest" || v === "price_asc" || v === "price_desc";
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [perPage, setPerPage] = useState<number>(12);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const category = searchParams.get("category") ?? "";

  const setCategory = (id: string) => {
    setSearchParams(id ? { category: id } : {}, { replace: true });
  };

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
        <h1 className="text-3xl md:text-4xl font-extrabold mt-2">
          Tous nos <span className="text-orange-400">produits</span>
        </h1>
      </div>

      {/* Barre filtres */}
      <div className="bg-white/[0.04] rounded-2xl border border-white/10 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-gray-400">
          <span className="font-semibold">{filtered.length}</span> sur{" "}
          <span className="font-semibold">{products.length}</span> résultats
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <select
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white [&>option]:bg-[#0b0d14]"
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
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white [&>option]:bg-[#0b0d14]"
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
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white [&>option]:bg-[#0b0d14]"
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
          >
            <option value={12}>Afficher : 12</option>
            <option value={24}>Afficher : 24</option>
            <option value={48}>Afficher : 48</option>
          </select>

          <input
            className="w-full md:w-72 rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500/40 text-sm text-white placeholder-gray-500"
            placeholder="Rechercher un produit..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {loading && <div className="mt-6 text-gray-400">Chargement...</div>}
      {error && <div className="mt-6 text-red-600">{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="mt-6 text-gray-400">Aucun produit trouvé.</div>
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
