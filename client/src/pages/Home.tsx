import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Flame,
  Plus,
  Sparkles,
  Zap,
} from "lucide-react";
import type React from "react";
import { api } from "../api/http";
import type { Category, Product } from "../types";
import Tilt3D from "../components/Tilt3D";
import { formatPrice } from "../utils/format";
import { buildImageUrl } from "../utils/image";
import { useCart } from "../context/CartContext";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api
      .get<Product[]>("/api/products")
      .then((res) => setProducts(res.data))
      .catch(() => {});
    api
      .get<Category[]>("/api/categories")
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  const deals = useMemo(
    () =>
      products
        .filter((p) => p.oldPrice && p.oldPrice > p.price && p.stock > 0)
        .sort(
          (a, b) =>
            (b.oldPrice! - b.price) / b.oldPrice! -
            (a.oldPrice! - a.price) / a.oldPrice!
        )
        .slice(0, 5),
    [products]
  );

  const newest = useMemo(
    () =>
      [...products]
        .sort((a, b) => {
          const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bd - ad;
        })
        .slice(0, 10),
    [products]
  );

  const countByCategory = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of products) {
      const id =
        typeof p.categoryId === "object" && p.categoryId
          ? p.categoryId._id
          : (p.categoryId as string);
      if (id) m.set(id, (m.get(id) ?? 0) + 1);
    }
    return m;
  }, [products]);

  return (
    <div className="bg-[#05060a]">
      <Hero products={deals.length >= 3 ? deals : newest} />
      <BentoDeals deals={deals} />
      <CategoryIndex categories={categories} countByCategory={countByCategory} />
      <NewRail products={newest} />
      <Manifesto />
      <FinalCta />
    </div>
  );
}

/* ================= HERO 3D ================= */

function Hero({ products }: { products: Product[] }) {
  const ref = useRef<HTMLElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const onMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setMouse({
      x: (e.clientX - r.left) / r.width - 0.5,
      y: (e.clientY - r.top) / r.height - 0.5,
    });
  };

  const layer = (depth: number): React.CSSProperties => ({
    transform: `translate3d(${(mouse.x * depth).toFixed(1)}px, ${(
      mouse.y * depth
    ).toFixed(1)}px, 0)`,
    transition: "transform 0.25s ease-out",
  });

  const [main, second, third] = products;

  return (
    <section
      ref={ref}
      onMouseMove={onMouseMove}
      className="relative overflow-hidden bg-mesh text-white min-h-[92vh] flex flex-col"
    >
      <div className="absolute inset-0 bg-grid" />

      {/* Halo animé */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-orange-500/15 blur-3xl animate-pulse-glow" />

      <div className="relative flex-1 max-w-6xl mx-auto px-4 w-full grid grid-cols-1 lg:grid-cols-2 items-center gap-12 py-20">
        {/* Texte */}
        <div className="animate-fade-up" style={layer(-12)}>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm text-gray-300">
            <Zap size={14} className="text-orange-400" />
            Nouvelle collection tech — 2026
          </div>

          <h1 className="mt-8 font-extrabold leading-[0.95] text-5xl md:text-7xl">
            <span className="block">FUTUR.</span>
            <span className="block text-outline">PUISSANT.</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
              ABORDABLE.
            </span>
          </h1>

          <p className="mt-6 text-gray-400 max-w-md text-lg">
            La tech de demain, livrée aujourd'hui chez vous. Payez à la
            livraison, partout au Sénégal.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <Link
              to="/shop"
              className="group inline-flex items-center gap-3 rounded-full bg-white text-gray-950 pl-7 pr-2 py-2 font-bold transition hover:bg-orange-400 hover:text-white"
            >
              Explorer
              <span className="h-10 w-10 rounded-full bg-gray-950 text-white grid place-items-center transition group-hover:rotate-45">
                <ArrowUpRight size={18} />
              </span>
            </Link>
            <a
              href="#offres"
              className="text-sm text-gray-400 hover:text-white underline underline-offset-8 decoration-orange-500/60 transition"
            >
              Voir les offres →
            </a>
          </div>
        </div>

        {/* Scène 3D */}
        <div className="relative hidden lg:block h-[520px]" style={{ perspective: "1200px" }}>
          {/* Anneau décoratif */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[440px] w-[440px] rounded-full border border-dashed border-white/10 animate-spin-slow"
            style={layer(-18)}
          />

          {/* Carte principale */}
          {main && (
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 z-20"
              style={layer(-30)}
            >
              <Tilt3D max={16} scale={1.04} className="rounded-3xl">
                <Link
                  to={`/product/${main._id}`}
                  className="block rounded-3xl bg-white/[0.07] backdrop-blur-xl border border-white/15 p-5 shadow-2xl shadow-black/50"
                >
                  <div className="aspect-square rounded-2xl overflow-hidden">
                    <img
                      src={buildImageUrl(main.images?.[0]?.url)}
                      alt={main.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold truncate">{main.name}</div>
                      <div className="text-orange-400 font-extrabold">
                        {formatPrice(main.price)}
                      </div>
                    </div>
                    <span className="h-10 w-10 shrink-0 rounded-full bg-orange-500 grid place-items-center">
                      <ArrowUpRight size={18} />
                    </span>
                  </div>
                </Link>
              </Tilt3D>
            </div>
          )}

          {/* Cartes satellites */}
          {second && (
            <div
              className="absolute top-8 right-0 w-44 z-10 animate-float"
              style={layer(24)}
            >
              <MiniFloatCard p={second} />
            </div>
          )}
          {third && (
            <div
              className="absolute bottom-6 left-0 w-44 z-10 animate-float-slow"
              style={layer(40)}
            >
              <MiniFloatCard p={third} />
            </div>
          )}
        </div>
      </div>

      {/* Marquee bas de hero */}
      <div className="relative border-t border-white/10 py-4 overflow-hidden">
        <div className="animate-marquee flex whitespace-nowrap text-sm font-medium text-gray-500 uppercase tracking-[0.2em]">
          {[...Array(2)].map((_, i) => (
            <span key={i} className="flex shrink-0">
              {[
                "Livraison 24h Dakar",
                "Paiement à la livraison",
                "100% authentique",
                "Support 7j/7",
                "Mobile Money",
              ].map((t) => (
                <span key={t} className="mx-6 flex items-center gap-6">
                  {t} <span className="text-orange-500">✦</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function MiniFloatCard({ p }: { p: Product }) {
  return (
    <Link
      to={`/product/${p._id}`}
      className="block rounded-2xl bg-white/[0.06] backdrop-blur-xl border border-white/10 p-3 shadow-xl hover:border-orange-400/40 transition"
    >
      <div className="aspect-square rounded-xl overflow-hidden">
        <img
          src={buildImageUrl(p.images?.[0]?.url)}
          alt={p.name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="mt-2 text-xs font-semibold text-white truncate">
        {p.name}
      </div>
      <div className="text-xs text-orange-400 font-bold">
        {formatPrice(p.price)}
      </div>
    </Link>
  );
}

/* ================= BENTO OFFRES ================= */

function BentoDeals({ deals }: { deals: Product[] }) {
  if (deals.length === 0) return null;
  const [big, ...rest] = deals;

  return (
    <section id="offres" className="relative bg-[#05060a] text-white">
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 text-orange-400 text-sm font-semibold uppercase tracking-widest">
              <Flame size={16} /> Offres du moment
            </div>
            <h2 className="mt-3 text-3xl md:text-5xl font-extrabold">
              Jusqu'à -
              {Math.max(
                ...deals.map((d) =>
                  Math.round(((d.oldPrice! - d.price) / d.oldPrice!) * 100)
                )
              )}
              % <span className="text-outline">cette semaine</span>
            </h2>
          </div>
          <Link
            to="/shop"
            className="hidden md:inline-flex items-center gap-1 text-sm text-gray-400 hover:text-orange-400 transition whitespace-nowrap"
          >
            Tout le catalogue <ArrowRight size={14} />
          </Link>
        </div>

        {/* Bento grid */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[200px] gap-4">
          {/* Grande carte */}
          <BentoCard p={big} className="col-span-2 row-span-2" big />

          {rest.slice(0, 4).map((p) => (
            <BentoCard key={p._id} p={p} className="col-span-1 row-span-1" />
          ))}
        </div>
      </div>
    </section>
  );
}

function BentoCard({
  p,
  className = "",
  big = false,
}: {
  p: Product;
  className?: string;
  big?: boolean;
}) {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const discount = Math.round(((p.oldPrice! - p.price) / p.oldPrice!) * 100);

  return (
    <Tilt3D max={8} className={`rounded-3xl ${className}`}>
      <div
        onClick={() => navigate(`/product/${p._id}`)}
        onKeyDown={(e) => {
          if (e.key === "Enter") navigate(`/product/${p._id}`);
        }}
        role="link"
        tabIndex={0}
        aria-label={`Voir ${p.name}`}
        className="group relative h-full w-full rounded-3xl overflow-hidden border border-white/10 bg-white/[0.04] cursor-pointer"
      >
        <img
          src={buildImageUrl(p.images?.[0]?.url)}
          alt={p.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-110 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {/* Badge réduction */}
        <span
          className={`pointer-events-none absolute top-4 left-4 z-20 rounded-full bg-orange-500 font-extrabold text-white shadow-lg ${
            big ? "text-lg px-5 py-2" : "text-xs px-3 py-1"
          }`}
        >
          -{discount}%
        </span>

        {/* Bouton ajout rapide (n'ouvre pas le produit) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            addItem(p);
          }}
          aria-label="Ajouter au panier"
          className="absolute top-4 right-4 z-20 h-9 w-9 rounded-full bg-white/10 backdrop-blur border border-white/20 grid place-items-center opacity-0 group-hover:opacity-100 hover:bg-orange-500 hover:border-orange-500 transition"
        >
          <Plus size={16} />
        </button>

        {/* Infos bas de carte */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-5">
          <div
            className={`font-extrabold leading-tight ${
              big ? "text-2xl md:text-3xl" : "text-sm"
            } line-clamp-2`}
          >
            {p.name}
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span
              className={`text-gray-400 line-through ${
                big ? "text-sm" : "text-[11px]"
              }`}
            >
              {formatPrice(p.oldPrice!)}
            </span>
            <span
              className={`font-extrabold text-orange-400 ${
                big ? "text-2xl" : "text-sm"
              }`}
            >
              {formatPrice(p.price)}
            </span>
          </div>
        </div>
      </div>
    </Tilt3D>
  );
}

/* ================= INDEX CATEGORIES ================= */

function CategoryIndex({
  categories,
  countByCategory,
}: {
  categories: Category[];
  countByCategory: Map<string, number>;
}) {
  return (
    <section className="bg-[#05060a] text-white">
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="flex items-center gap-2 text-orange-400 text-sm font-semibold uppercase tracking-widest">
          <Sparkles size={16} /> Univers
        </div>

        <div className="mt-8 border-t border-white/10">
          {categories.map((c, i) => (
            <Link
              key={c._id}
              to={`/shop?category=${c._id}`}
              className="group flex items-center justify-between gap-4 border-b border-white/10 py-7 md:py-9 transition-colors hover:border-orange-500/50"
            >
              <div className="flex items-baseline gap-6 min-w-0">
                <span className="text-sm text-gray-600 font-mono">
                  0{i + 1}
                </span>
                <span className="text-3xl md:text-6xl font-extrabold tracking-tight text-gray-500 transition-all duration-300 group-hover:text-white group-hover:translate-x-3">
                  {c.name}
                </span>
              </div>

              <div className="flex items-center gap-5 shrink-0">
                <span className="hidden sm:block text-sm text-gray-600">
                  {countByCategory.get(c._id) ?? 0} produits
                </span>
                <span className="h-12 w-12 rounded-full border border-white/15 grid place-items-center transition-all duration-300 group-hover:bg-orange-500 group-hover:border-orange-500 group-hover:rotate-45">
                  <ArrowUpRight size={18} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= RAIL NOUVEAUTES ================= */

function NewRail({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="bg-[#05060a] text-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-4 flex items-end justify-between">
        <h2 className="text-3xl md:text-5xl font-extrabold">
          Nouveautés <span className="text-outline">fraîches</span>
        </h2>
        <span className="hidden md:block text-sm text-gray-500 pb-2">
          ← Faites défiler →
        </span>
      </div>

      <div className="scrollbar-hide overflow-x-auto snap-x snap-mandatory pb-20 pt-6">
        <div className="flex gap-5 px-[max(1rem,calc((100vw-72rem)/2+1rem))]">
          {products.map((p) => (
            <div key={p._id} className="snap-start shrink-0 w-64">
              <Tilt3D max={10} className="rounded-3xl">
                <RailCard p={p} />
              </Tilt3D>
            </div>
          ))}

          {/* Carte "voir tout" */}
          <Link
            to="/shop"
            className="snap-start shrink-0 w-64 rounded-3xl border border-dashed border-white/20 grid place-items-center text-gray-400 hover:text-white hover:border-orange-500/60 transition min-h-[340px]"
          >
            <span className="flex flex-col items-center gap-3">
              <span className="h-14 w-14 rounded-full border border-white/20 grid place-items-center">
                <ArrowRight size={20} />
              </span>
              Tout le catalogue
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function RailCard({ p }: { p: Product }) {
  const { addItem } = useCart();
  const outOfStock = p.stock <= 0;

  return (
    <div className="group relative rounded-3xl overflow-hidden border border-white/10 bg-white/[0.04]">
      <Link to={`/product/${p._id}`} className="block">
        <div className="aspect-square overflow-hidden">
          <img
            src={buildImageUrl(p.images?.[0]?.url)}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          />
        </div>
      </Link>

      {outOfStock && (
        <span className="absolute top-3 left-3 rounded-full bg-red-600/90 text-white text-[11px] px-3 py-1 font-semibold">
          Rupture
        </span>
      )}

      <div className="p-4 flex items-center justify-between gap-3">
        <Link to={`/product/${p._id}`} className="min-w-0">
          <div className="text-sm font-bold truncate group-hover:text-orange-400 transition">
            {p.name}
          </div>
          <div className="text-orange-400 font-extrabold text-sm mt-0.5">
            {formatPrice(p.price)}
          </div>
        </Link>
        <button
          onClick={() => addItem(p)}
          disabled={outOfStock}
          aria-label="Ajouter au panier"
          className="h-9 w-9 shrink-0 rounded-full bg-white/10 border border-white/15 grid place-items-center hover:bg-orange-500 hover:border-orange-500 transition disabled:opacity-30"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

/* ================= MANIFESTO ================= */

function Manifesto() {
  const items = [
    { n: "01", t: "Livraison éclair", d: "24h à Dakar, 2-4 jours partout au Sénégal." },
    { n: "02", t: "Zéro risque", d: "Payez uniquement à la réception, cash ou mobile money." },
    { n: "03", t: "Authentique", d: "Chaque produit est vérifié avant expédition." },
    { n: "04", t: "À vos côtés", d: "Support réactif 7j/7, avant et après l'achat." },
  ];

  return (
    <section className="bg-[#05060a] text-white border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-20 grid grid-cols-1 md:grid-cols-4 gap-10">
        {items.map((it) => (
          <div key={it.n} className="group">
            <div className="text-sm font-mono text-orange-500">{it.n}</div>
            <div className="mt-3 h-px w-10 bg-white/20 transition-all duration-500 group-hover:w-full group-hover:bg-orange-500/60" />
            <h3 className="mt-4 font-extrabold text-lg">{it.t}</h3>
            <p className="mt-2 text-sm text-gray-500">{it.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ================= CTA FINAL ================= */

function FinalCta() {
  return (
    <section className="relative bg-[#05060a] text-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 pb-24 pt-4 text-center">
        <div className="relative rounded-[2.5rem] border border-white/10 bg-mesh px-6 py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-grid" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-40 w-[500px] bg-orange-500/20 blur-3xl" />

          <h2 className="relative text-4xl md:text-6xl font-extrabold leading-tight">
            Passez au niveau
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
              supérieur.
            </span>
          </h2>
          <p className="relative mt-5 text-gray-400 max-w-md mx-auto">
            Commandez maintenant, recevez en 24h à Dakar et payez à la
            réception.
          </p>

          <Link
            to="/shop"
            className="relative group mt-10 inline-flex items-center gap-3 rounded-full bg-orange-500 pl-8 pr-2 py-2 font-bold text-white transition hover:bg-orange-400 hover:scale-105 shadow-xl shadow-orange-500/25"
          >
            Commander maintenant
            <span className="h-11 w-11 rounded-full bg-gray-950 grid place-items-center transition group-hover:rotate-45">
              <ArrowUpRight size={18} />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
