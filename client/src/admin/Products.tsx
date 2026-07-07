import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { AxiosError } from "axios";
import { Pencil, Plus, Search, Tags, Trash2, X } from "lucide-react";
import { api } from "../api/http";
import type { Category, Product } from "../types";
import { buildImageUrl } from "../utils/image";
import { formatPrice } from "../utils/format";
import CategoryManager from "./CategoryManager";

type SpecRow = { key: string; value: string };

type FormState = {
  name: string;
  brand: string;
  categoryId: string;
  price: string;
  oldPrice: string;
  description: string;
  stock: string;
  images: { url: string; label?: string }[];
  specs: SpecRow[];
};

const emptyForm: FormState = {
  name: "",
  brand: "",
  categoryId: "",
  price: "",
  oldPrice: "",
  description: "",
  stock: "0",
  images: [],
  specs: [],
};

export default function AdminProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [p, c] = await Promise.all([
        api.get<Product[]>("/api/products"),
        api.get<Category[]>("/api/categories"),
      ]);
      setProducts(p.data);
      setCategories(c.data);
    } catch {
      setError("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Ouverture via palette / dashboard : ?new=1 ou ?edit=<id>
  useEffect(() => {
    if (loading) return;

    if (searchParams.get("new") === "1") {
      setEditing(null);
      setShowForm(true);
      setSearchParams({}, { replace: true });
    }

    if (searchParams.get("categories") === "1") {
      setShowCategories(true);
      setSearchParams({}, { replace: true });
    }

    const editId = searchParams.get("edit");
    if (editId) {
      const p = products.find((x) => x._id === editId);
      if (p) {
        setEditing(p);
        setShowForm(true);
      }
      setSearchParams({}, { replace: true });
    }
  }, [loading, searchParams, products, setSearchParams]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? products.filter((p) => p.name.toLowerCase().includes(q))
      : products;
  }, [products, query]);

  const handleDelete = async (p: Product) => {
    if (!confirm(`Supprimer "${p.name}" ?`)) return;
    try {
      await api.delete(`/api/products/${p._id}`);
      setProducts((prev) => prev.filter((x) => x._id !== p._id));
    } catch {
      alert("Suppression impossible");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl md:text-4xl font-extrabold">
          Produits <span className="text-outline">{products.length}</span>
        </h1>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-48 md:w-64 rounded-full border border-white/10 bg-white/5 pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-orange-500/40"
            />
          </div>
          <button
            onClick={() => setShowCategories(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/15 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white text-sm font-medium transition"
          >
            <Tags size={16} />
            <span className="hidden sm:inline">Catégories</span>
          </button>
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-500 text-white hover:bg-orange-400 text-sm font-semibold transition shadow-lg shadow-orange-500/20"
          >
            <Plus size={16} />
            Nouveau
          </button>
        </div>
      </div>

      {loading && <div className="mt-8 text-gray-400">Chargement...</div>}
      {error && <div className="mt-8 text-red-400">{error}</div>}

      {!loading && !error && (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {visible.map((p) => (
            <AdminProductCard
              key={p._id}
              p={p}
              onEdit={() => {
                setEditing(p);
                setShowForm(true);
              }}
              onDelete={() => handleDelete(p)}
            />
          ))}

          {/* Carte création */}
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="min-h-[260px] rounded-3xl border-2 border-dashed border-white/15 grid place-items-center text-gray-500 hover:border-orange-500/60 hover:text-orange-400 transition"
          >
            <span className="flex flex-col items-center gap-3 text-sm font-medium">
              <span className="h-12 w-12 rounded-full border border-white/15 grid place-items-center">
                <Plus size={20} />
              </span>
              Ajouter un produit
            </span>
          </button>
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editing}
          categories={categories}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      )}

      {showCategories && (
        <CategoryManager
          onClose={() => setShowCategories(false)}
          onChanged={load}
        />
      )}
    </div>
  );
}

function AdminProductCard({
  p,
  onEdit,
  onDelete,
}: {
  p: Product;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const category =
    typeof p.categoryId === "object" && p.categoryId ? p.categoryId.name : null;

  // Jauge de stock (référence : 20 unités = plein)
  const pct = Math.min(100, (p.stock / 20) * 100);
  const gauge =
    p.stock <= 3
      ? "bg-red-400"
      : p.stock <= 8
      ? "bg-yellow-400"
      : "bg-green-400";

  return (
    <div className="group relative rounded-3xl border border-white/10 bg-white/[0.03] overflow-hidden hover:border-white/25 hover:-translate-y-1 transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-white/5">
        <img
          src={buildImageUrl(p.images?.[0]?.url)}
          alt={p.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {category && (
          <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-black/60 backdrop-blur text-gray-300 border border-white/10">
            {category}
          </span>
        )}

        {/* Actions au survol */}
        <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={onEdit}
            aria-label="Modifier"
            className="h-8 w-8 rounded-full bg-black/60 backdrop-blur border border-white/15 grid place-items-center text-gray-300 hover:bg-orange-500 hover:border-orange-500 hover:text-white transition"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={onDelete}
            aria-label="Supprimer"
            className="h-8 w-8 rounded-full bg-black/60 backdrop-blur border border-white/15 grid place-items-center text-gray-300 hover:bg-red-500 hover:border-red-500 hover:text-white transition"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Infos */}
      <div className="p-4">
        <div className="text-sm font-bold truncate">{p.name}</div>
        <div className="mt-1 flex items-baseline justify-between gap-2">
          <span className="font-extrabold text-orange-400 text-sm">
            {formatPrice(p.price)}
          </span>
          <span className="text-[11px] text-gray-500">{p.stock} en stock</span>
        </div>

        {/* Jauge stock */}
        <div className="mt-2.5 h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className={`h-full rounded-full ${gauge} transition-all duration-700`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/* ================= FORMULAIRE ================= */

function ProductForm({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(() => {
    if (!product) return emptyForm;
    return {
      name: product.name,
      brand: product.brand ?? "",
      categoryId:
        typeof product.categoryId === "object" && product.categoryId
          ? product.categoryId._id
          : (product.categoryId as string) ?? "",
      price: String(product.price),
      oldPrice: product.oldPrice ? String(product.oldPrice) : "",
      description: product.description ?? "",
      stock: String(product.stock),
      images: product.images ?? [],
      specs:
        product.specs && typeof product.specs === "object"
          ? Object.entries(product.specs).map(([key, value]) => ({
              key,
              value: String(value),
            }))
          : [],
    };
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      const fd = new FormData();
      fd.append("image", file);
      const res = await api.post<{ url: string }>("/api/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((f) => ({
        ...f,
        images: [...f.images, { url: res.data.url, label: "" }],
      }));
    } catch {
      setError("Échec de l'upload de l'image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (i: number) =>
    setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  // --- Caractéristiques (clé / valeur) ---
  const addSpec = () =>
    setForm((f) => ({ ...f, specs: [...f.specs, { key: "", value: "" }] }));

  const setSpec = (i: number, field: "key" | "value", v: string) =>
    setForm((f) => ({
      ...f,
      specs: f.specs.map((s, idx) => (idx === i ? { ...s, [field]: v } : s)),
    }));

  const removeSpec = (i: number) =>
    setForm((f) => ({ ...f, specs: f.specs.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Transforme les lignes clé/valeur en objet, en ignorant les lignes vides
    const specs: Record<string, string> = {};
    for (const s of form.specs) {
      const k = s.key.trim();
      const v = s.value.trim();
      if (k && v) specs[k] = v;
    }

    const payload = {
      name: form.name,
      brand: form.brand,
      categoryId: form.categoryId,
      price: Number(form.price),
      ...(form.oldPrice ? { oldPrice: Number(form.oldPrice) } : {}),
      description: form.description,
      stock: Number(form.stock),
      images: form.images,
      specs,
    };

    try {
      setSaving(true);
      setError(null);

      if (product) {
        await api.put(`/api/products/${product._id}`, payload);
      } else {
        await api.post("/api/products", payload);
      }

      onSaved();
    } catch (e: unknown) {
      const err = e as AxiosError<{ message?: string }>;
      setError(err.response?.data?.message ?? "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-orange-500/40 [&>option]:bg-[#0b0d14]";

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4 overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-[#0b0d14] border border-white/10 text-white rounded-3xl w-full max-w-2xl p-6 my-8 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">
            {product ? "Modifier le produit" : "Nouveau produit"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 text-gray-300">Nom *</label>
            <input className={inputCls} required minLength={2} value={form.name} onChange={set("name")} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Marque</label>
            <input className={inputCls} value={form.brand} onChange={set("brand")} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Catégorie *</label>
            <select className={inputCls} required value={form.categoryId} onChange={set("categoryId")}>
              <option value="">Choisir...</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Prix (FCFA) *</label>
            <input className={inputCls} required type="number" min={0} value={form.price} onChange={set("price")} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Ancien prix (optionnel)</label>
            <input className={inputCls} type="number" min={0} value={form.oldPrice} onChange={set("oldPrice")} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Stock *</label>
            <input className={inputCls} required type="number" min={0} value={form.stock} onChange={set("stock")} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 text-gray-300">Description</label>
            <textarea className={inputCls} rows={3} value={form.description} onChange={set("description")} />
          </div>

          {/* Caractéristiques */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 text-gray-300">
              Caractéristiques
              <span className="ml-2 text-xs text-gray-500 font-normal">
                (affichées sur la page produit — ex : RAM → 8 Go)
              </span>
            </label>

            <div className="space-y-2">
              {form.specs.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className={inputCls}
                    placeholder="Nom (ex : processeur)"
                    value={s.key}
                    onChange={(e) => setSpec(i, "key", e.target.value)}
                  />
                  <input
                    className={inputCls}
                    placeholder="Valeur (ex : Intel Core i5)"
                    value={s.value}
                    onChange={(e) => setSpec(i, "value", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeSpec(i)}
                    aria-label="Supprimer la caractéristique"
                    className="shrink-0 h-10 w-10 rounded-xl border border-white/10 bg-white/5 grid place-items-center text-gray-500 hover:bg-red-500/15 hover:text-red-400 transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addSpec}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-white/20 text-sm text-gray-500 hover:border-orange-500/60 hover:text-orange-400 transition"
              >
                <Plus size={14} />
                Ajouter une caractéristique
              </button>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 text-gray-300">Images</label>

            <p className="text-xs text-gray-500 mb-2">
              Ajoutez une image par variante (ex : chaque couleur) et donnez-lui
              un nom — le client pourra choisir sa version sur la page produit.
            </p>

            <div className="flex flex-wrap gap-3">
              {form.images.map((im, i) => (
                <div key={i} className="relative w-20">
                  <img
                    src={buildImageUrl(im.url)}
                    alt=""
                    className="h-20 w-20 rounded-xl object-cover border border-white/10"
                  />
                  <input
                    value={im.label ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        images: f.images.map((x, idx) =>
                          idx === i ? { ...x, label: e.target.value } : x
                        ),
                      }))
                    }
                    placeholder="Couleur..."
                    className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-1.5 py-1 text-[11px] text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-orange-500/40 text-center"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white grid place-items-center"
                    aria-label="Retirer l'image"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              <label className="h-20 w-20 rounded-xl border-2 border-dashed border-white/20 grid place-items-center text-gray-500 cursor-pointer hover:border-orange-500/60 hover:text-orange-400 text-xs text-center transition">
                {uploading ? "..." : "+ Ajouter"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
        </div>

        {error && <div className="mt-4 text-sm text-red-400">{error}</div>}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-white/15 bg-white/5 text-sm font-medium hover:bg-white/10 transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-400 text-sm font-semibold transition disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : product ? "Enregistrer" : "Créer"}
          </button>
        </div>
      </form>
    </div>
  );
}
