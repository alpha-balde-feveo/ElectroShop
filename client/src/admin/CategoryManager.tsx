import { useEffect, useState } from "react";
import type { AxiosError } from "axios";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { api } from "../api/http";
import type { Category } from "../types";

export default function CategoryManager({
  onClose,
  onChanged,
}: {
  onClose: () => void;
  onChanged: () => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () =>
    api
      .get<Category[]>("/api/categories")
      .then((r) => setCategories(r.data))
      .catch(() => setError("Erreur de chargement"));

  useEffect(() => {
    load();
  }, []);

  const handleError = (e: unknown, fallback: string) => {
    const err = e as AxiosError<{ message?: string }>;
    setError(err.response?.data?.message ?? fallback);
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (name.length < 2) return;

    try {
      setBusy(true);
      setError(null);
      await api.post("/api/categories", { name });
      setNewName("");
      await load();
      onChanged();
    } catch (e) {
      handleError(e, "Création impossible");
    } finally {
      setBusy(false);
    }
  };

  const rename = async (id: string) => {
    const name = editName.trim();
    if (name.length < 2) return;

    try {
      setBusy(true);
      setError(null);
      await api.put(`/api/categories/${id}`, { name });
      setEditingId(null);
      await load();
      onChanged();
    } catch (e) {
      handleError(e, "Renommage impossible");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (c: Category) => {
    if (
      !confirm(
        `Supprimer la catégorie "${c.name}" ?\n\nLes produits de cette catégorie ne seront plus filtrables par celle-ci.`
      )
    )
      return;

    try {
      setBusy(true);
      setError(null);
      await api.delete(`/api/categories/${c._id}`);
      await load();
      onChanged();
    } catch (e) {
      handleError(e, "Suppression impossible");
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-orange-500/40";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0b0d14] border border-white/10 text-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">Catégories</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Création */}
        <form onSubmit={create} className="flex gap-2">
          <input
            className={inputCls}
            placeholder="Nouvelle catégorie..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            minLength={2}
          />
          <button
            type="submit"
            disabled={busy || newName.trim().length < 2}
            className="shrink-0 h-10 w-10 rounded-xl bg-orange-500 hover:bg-orange-400 grid place-items-center transition disabled:opacity-40"
            aria-label="Créer la catégorie"
          >
            <Plus size={18} />
          </button>
        </form>

        {error && <div className="mt-3 text-sm text-red-400">{error}</div>}

        {/* Liste */}
        <div className="mt-4 space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {categories.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-6">
              Aucune catégorie.
            </div>
          )}

          {categories.map((c) => (
            <div
              key={c._id}
              className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5"
            >
              {editingId === c._id ? (
                <>
                  <input
                    className={inputCls}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        rename(c._id);
                      }
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    autoFocus
                  />
                  <button
                    onClick={() => rename(c._id)}
                    disabled={busy}
                    className="shrink-0 h-8 w-8 rounded-lg bg-green-500/15 border border-green-500/30 text-green-400 grid place-items-center hover:bg-green-500/25 transition"
                    aria-label="Valider"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="shrink-0 h-8 w-8 rounded-lg bg-white/5 border border-white/10 text-gray-400 grid place-items-center hover:bg-white/10 transition"
                    aria-label="Annuler"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium truncate">
                    {c.name}
                  </span>
                  <span className="text-[10px] text-gray-600 font-mono">
                    /{c.slug}
                  </span>
                  <button
                    onClick={() => {
                      setEditingId(c._id);
                      setEditName(c.name);
                    }}
                    className="shrink-0 h-8 w-8 rounded-lg grid place-items-center text-gray-500 hover:bg-white/10 hover:text-white transition opacity-0 group-hover:opacity-100"
                    aria-label="Renommer"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => remove(c)}
                    className="shrink-0 h-8 w-8 rounded-lg grid place-items-center text-gray-500 hover:bg-red-500/15 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                    aria-label="Supprimer"
                  >
                    <Trash2 size={13} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
