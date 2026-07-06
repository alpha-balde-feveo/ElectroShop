import { useEffect, useState } from "react";
import type { AxiosError } from "axios";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { api } from "../api/http";
import type { Category, Product } from "../types";
import { buildImageUrl } from "../utils/image";
import { formatPrice } from "../utils/format";

type FormState = {
  name: string;
  brand: string;
  categoryId: string;
  price: string;
  oldPrice: string;
  description: string;
  stock: string;
  images: { url: string }[];
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
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [p, c] = await Promise.all([
        api.get<Product[]>("/api/products"),
        api.get<Category[]>("/api/categories"),
      ]);
      setProducts(p.data);
      setCategories(c.data);
    } catch (e: unknown) {
      const err = e as AxiosError<{ message?: string }>;
      setError(err.response?.data?.message ?? "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (p: Product) => {
    if (!confirm(`Supprimer "${p.name}" ?`)) return;
    try {
      await api.delete(`/api/products/${p._id}`);
      setProducts((prev) => prev.filter((x) => x._id !== p._id));
    } catch {
      alert("Suppression impossible");
    }
  };

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Produits ({products.length})</h1>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-400 text-sm font-semibold transition shadow-lg shadow-orange-500/20"
        >
          <Plus size={16} />
          Nouveau produit
        </button>
      </div>

      {loading && <div className="text-gray-400">Chargement...</div>}
      {error && <div className="text-red-400">{error}</div>}

      {!loading && (
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left text-gray-400">
              <tr>
                <th className="px-4 py-3">Produit</th>
                <th className="px-4 py-3 hidden md:table-cell">Catégorie</th>
                <th className="px-4 py-3">Prix</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-t border-white/10 hover:bg-white/[0.03] transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={buildImageUrl(p.images?.[0]?.url)}
                        alt=""
                        className="h-10 w-10 rounded-lg object-cover bg-white/10"
                      />
                      <span className="font-medium line-clamp-1">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-400">
                    {typeof p.categoryId === "object" && p.categoryId
                      ? p.categoryId.name
                      : "—"}
                  </td>
                  <td className="px-4 py-3 font-medium whitespace-nowrap">
                    {formatPrice(p.price)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.stock <= 3
                          ? "bg-red-500/15 text-red-400 border border-red-500/30"
                          : "bg-green-500/15 text-green-400 border border-green-500/30"
                      }`}
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition"
                        aria-label="Modifier"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition"
                        aria-label="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Aucun produit. Créez-en un !
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
    </div>
  );
}

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
      setForm((f) => ({ ...f, images: [...f.images, { url: res.data.url }] }));
    } catch {
      setError("Échec de l'upload de l'image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (i: number) =>
    setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: form.name,
      brand: form.brand,
      categoryId: form.categoryId,
      price: Number(form.price),
      ...(form.oldPrice ? { oldPrice: Number(form.oldPrice) } : {}),
      description: form.description,
      stock: Number(form.stock),
      images: form.images,
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
            <label className="block text-sm font-medium mb-1">Nom *</label>
            <input className={inputCls} required minLength={2} value={form.name} onChange={set("name")} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Marque</label>
            <input className={inputCls} value={form.brand} onChange={set("brand")} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Catégorie *</label>
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
            <label className="block text-sm font-medium mb-1">Prix (FCFA) *</label>
            <input className={inputCls} required type="number" min={0} value={form.price} onChange={set("price")} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ancien prix (optionnel)</label>
            <input className={inputCls} type="number" min={0} value={form.oldPrice} onChange={set("oldPrice")} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Stock *</label>
            <input className={inputCls} required type="number" min={0} value={form.stock} onChange={set("stock")} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea className={inputCls} rows={3} value={form.description} onChange={set("description")} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Images</label>

            <div className="flex flex-wrap gap-3">
              {form.images.map((im, i) => (
                <div key={i} className="relative">
                  <img
                    src={buildImageUrl(im.url)}
                    alt=""
                    className="h-20 w-20 rounded-xl object-cover border border-white/10"
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
