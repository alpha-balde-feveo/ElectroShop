import type { AxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api/http";

export type Product = {
  _id: string;
  name: string;
  price: number;
  stock: number;

  // images possibles selon ton backend
  imageUrl?: string;      // ex: "/uploads/xxx.jpg" ou "http://..."
  images?: string[];      // ex: ["/uploads/a.jpg", "/uploads/b.jpg"]

  createdAt?: string;
};

type Sort = "newest" | "price_asc" | "price_desc";

function isSort(v: string): v is Sort {
  return v === "newest" || v === "price_asc" || v === "price_desc";
}

function buildImageUrl(raw?: string): string {
  if (!raw) {
    return "https://dummyimage.com/800x800/e5e7eb/111827.png&text=Electroshop";
  }
  if (raw.startsWith("http")) return raw;

  const base = import.meta.env.VITE_API_URL as string | undefined;
  if (!base) return raw; // fallback si pas de VITE_API_URL

  // raw peut être "/uploads/..." ou "uploads/..."
  const normalized = raw.startsWith("/") ? raw : `/${raw}`;
  return `${base}${normalized}`;
}

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [perPage, setPerPage] = useState<number>(12);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get<Product[]>("/api/products");

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
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = products.filter((p) => p.name.toLowerCase().includes(q));

    // Tri
    if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);

    // "newest" => si createdAt existe, sinon on laisse tel quel
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
        <div className="text-sm text-gray-500">Home / Shop</div>
        <h1 className="text-3xl font-semibold mt-2">Browse All Products</h1>
      </div>

      {/* Barre filtres */}
      <div className="bg-white rounded-2xl border shadow-sm p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold">{filtered.length}</span> of{" "}
          <span className="font-semibold">{products.length}</span> results
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <select
            className="rounded-xl border px-3 py-2 text-sm"
            value={sort}
            onChange={(e) => {
              const v = e.target.value;
              if (isSort(v)) setSort(v);
            }}
          >
            <option value="newest">Sort by: Newest</option>
            <option value="price_asc">Sort by: Price (Low)</option>
            <option value="price_desc">Sort by: Price (High)</option>
          </select>

          <select
            className="rounded-xl border px-3 py-2 text-sm"
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
          >
            <option value={12}>Show: 12</option>
            <option value={24}>Show: 24</option>
            <option value={48}>Show: 48</option>
          </select>

          <input
            className="w-full md:w-72 rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10 text-sm"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {loading && <div className="mt-6 text-gray-600">Chargement...</div>}
      {error && <div className="mt-6 text-red-600">{error}</div>}

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
  const raw = p.imageUrl || p.images?.[0];
  const img = buildImageUrl(raw);

  return (
    <div className="group bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div className="relative aspect-square bg-gray-100">
        <img src={img} alt={p.name} className="h-full w-full object-cover" />

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />

        <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition">
          <button
            type="button"
            className="h-10 w-10 rounded-full bg-white shadow grid place-items-center"
            aria-label="Add to wishlist"
          >
            ❤
          </button>
          <button
            type="button"
            className="h-10 w-10 rounded-full bg-white shadow grid place-items-center"
            aria-label="Quick view"
          >
            👁
          </button>
        </div>

        <button
          type="button"
          className="absolute left-3 right-3 bottom-3 opacity-0 group-hover:opacity-100 transition rounded-xl bg-gray-900 text-white py-2 text-sm hover:bg-gray-800"
        >
          Add to cart
        </button>
      </div>

      <div className="p-4">
        <div className="text-xs text-gray-500">In stock: {p.stock}</div>
        <div className="font-semibold mt-1 line-clamp-1">{p.name}</div>
        <div className="mt-2 font-bold">${p.price}</div>
      </div>
    </div>
  );
}
