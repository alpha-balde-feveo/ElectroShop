import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  Package,
  Pencil,
  Plus,
  Search,
  ShoppingBag,
  Store,
  Tags,
} from "lucide-react";
import type React from "react";
import { api } from "../api/http";
import type { Product } from "../types";
import { clearToken } from "./auth";

type Item = {
  id: string;
  label: string;
  hint?: string;
  icon: React.ReactNode;
  run: () => void;
};

export default function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setIndex(0);
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    api
      .get<Product[]>("/api/products")
      .then((r) => setProducts(r.data))
      .catch(() => {});
    return () => clearTimeout(t);
  }, [open]);

  const go = (to: string) => {
    onClose();
    navigate(to);
  };

  const items: Item[] = useMemo(() => {
    const q = query.trim().toLowerCase();

    const actions: Item[] = [
      {
        id: "dash",
        label: "Tableau de bord",
        hint: "Aller à",
        icon: <LayoutDashboard size={16} />,
        run: () => go("/admin"),
      },
      {
        id: "products",
        label: "Produits",
        hint: "Aller à",
        icon: <Package size={16} />,
        run: () => go("/admin/products"),
      },
      {
        id: "orders",
        label: "Commandes",
        hint: "Aller à",
        icon: <ShoppingBag size={16} />,
        run: () => go("/admin/orders"),
      },
      {
        id: "new-product",
        label: "Nouveau produit",
        hint: "Créer",
        icon: <Plus size={16} />,
        run: () => go("/admin/products?new=1"),
      },
      {
        id: "categories",
        label: "Gérer les catégories",
        hint: "Créer / renommer",
        icon: <Tags size={16} />,
        run: () => go("/admin/products?categories=1"),
      },
      {
        id: "store",
        label: "Voir la boutique",
        hint: "Ouvrir",
        icon: <Store size={16} />,
        run: () => go("/"),
      },
      {
        id: "logout",
        label: "Déconnexion",
        hint: "Session",
        icon: <LogOut size={16} />,
        run: () => {
          clearToken();
          go("/admin/login");
        },
      },
    ].filter((a) => !q || a.label.toLowerCase().includes(q));

    const productItems: Item[] = q
      ? products
          .filter((p) => p.name.toLowerCase().includes(q))
          .slice(0, 5)
          .map((p) => ({
            id: `p-${p._id}`,
            label: p.name,
            hint: "Modifier le produit",
            icon: <Pencil size={16} />,
            run: () => go(`/admin/products?edit=${p._id}`),
          }))
      : [];

    return [...actions, ...productItems];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, products]);

  useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(0, items.length - 1)));
  }, [items.length]);

  if (!open) return null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => (i + 1) % Math.max(1, items.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => (i - 1 + items.length) % Math.max(1, items.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      items[index]?.run();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[18vh] px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-[#0b0d14]/95 border border-white/10 shadow-2xl overflow-hidden animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 border-b border-white/10">
          <Search size={16} className="text-gray-500 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Rechercher une action ou un produit..."
            className="w-full bg-transparent py-4 text-sm text-white placeholder-gray-500 outline-none"
          />
          <kbd className="shrink-0 text-[10px] text-gray-500 border border-white/15 rounded px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        {/* Résultats */}
        <div className="max-h-72 overflow-y-auto p-2">
          {items.length === 0 && (
            <div className="px-3 py-8 text-center text-sm text-gray-500">
              Aucun résultat pour « {query} »
            </div>
          )}

          {items.map((it, i) => (
            <button
              key={it.id}
              onClick={it.run}
              onMouseEnter={() => setIndex(i)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition ${
                i === index
                  ? "bg-orange-500/15 text-white"
                  : "text-gray-400 hover:bg-white/5"
              }`}
            >
              <span
                className={`h-8 w-8 rounded-lg grid place-items-center border ${
                  i === index
                    ? "bg-orange-500 border-orange-500 text-white"
                    : "bg-white/5 border-white/10"
                }`}
              >
                {it.icon}
              </span>
              <span className="flex-1 truncate">{it.label}</span>
              {it.hint && (
                <span className="text-[11px] text-gray-600">{it.hint}</span>
              )}
            </button>
          ))}
        </div>

        <div className="px-4 py-2.5 border-t border-white/10 text-[11px] text-gray-600 flex gap-4">
          <span>↑↓ naviguer</span>
          <span>↵ sélectionner</span>
          <span>esc fermer</span>
        </div>
      </div>
    </div>
  );
}
