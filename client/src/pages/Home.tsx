import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Flame,
  Gamepad2,
  HandCoins,
  Headphones,
  Laptop,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Truck,
  Wifi,
  Zap,
} from "lucide-react";
import type React from "react";
import { api } from "../api/http";
import type { Category, Product } from "../types";
import ProductCard from "../components/ProductCard";
import { formatPrice } from "../utils/format";
import { buildImageUrl } from "../utils/image";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  informatique: <Laptop size={28} />,
  smartphones: <Smartphone size={28} />,
  accessoires: <Headphones size={28} />,
  reseau: <Wifi size={28} />,
  gaming: <Gamepad2 size={28} />,
};

const CATEGORY_COLORS: Record<string, string> = {
  informatique: "from-blue-500 to-indigo-600",
  smartphones: "from-emerald-500 to-teal-600",
  accessoires: "from-purple-500 to-fuchsia-600",
  reseau: "from-cyan-500 to-sky-600",
  gaming: "from-orange-500 to-red-600",
};

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
        .slice(0, 4),
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
        .slice(0, 8),
    [products]
  );

  const heroProduct = deals[0] ?? products[0];

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-gray-950 text-white">
        {/* Décor */}
        <div className="absolute inset-0">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-orange-500/20 blur-3xl" />
          <div className="absolute top-1/2 -right-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/10 px-4 py-1.5 text-sm text-orange-300 font-medium">
              <Zap size={14} />
              Livraison express 24h à Dakar
            </div>

            <h1 className="mt-6 text-4xl md:text-6xl font-extrabold leading-tight">
              La tech qu'il vous faut,
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                au meilleur prix.
              </span>
            </h1>

            <p className="mt-5 text-lg text-gray-300 max-w-md">
              Ordinateurs, smartphones, gaming et accessoires — payez à la
              livraison, partout au Sénégal.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-400 text-white font-semibold shadow-lg shadow-orange-500/30 transition hover:scale-105"
              >
                Découvrir la boutique
                <ArrowRight size={18} />
              </Link>
              <a
                href="#offres"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl border border-white/20 hover:bg-white/10 font-semibold transition"
              >
                <Flame size={18} className="text-orange-400" />
                Voir les promos
              </a>
            </div>

            {/* Stats */}
            <div className="mt-10 flex gap-8 text-sm">
              <div>
                <div className="text-2xl font-extrabold">{products.length}+</div>
                <div className="text-gray-400">Produits</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold">24h</div>
                <div className="text-gray-400">Livraison express</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold">100%</div>
                <div className="text-gray-400">Garantie</div>
              </div>
            </div>
          </div>

          {/* Produit vedette flottant */}
          {heroProduct && (
            <div className="hidden md:block animate-fade-up delay-200">
              <Link
                to={`/product/${heroProduct._id}`}
                className="block animate-float"
              >
                <div className="relative mx-auto max-w-sm rounded-3xl bg-white/10 backdrop-blur border border-white/15 p-6 shadow-2xl hover:border-orange-400/50 transition">
                  {heroProduct.oldPrice && (
                    <span className="absolute -top-3 -right-3 rounded-full bg-orange-500 text-white text-sm font-bold px-4 py-1.5 shadow-lg rotate-3">
                      -
                      {Math.round(
                        ((heroProduct.oldPrice - heroProduct.price) /
                          heroProduct.oldPrice) *
                          100
                      )}
                      %
                    </span>
                  )}
                  <div className="aspect-square rounded-2xl overflow-hidden bg-gray-800">
                    <img
                      src={buildImageUrl(heroProduct.images?.[0]?.url)}
                      alt={heroProduct.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="mt-4">
                    <div className="font-bold text-lg line-clamp-1">
                      {heroProduct.name}
                    </div>
                    <div className="mt-1 flex items-center gap-3">
                      {heroProduct.oldPrice && (
                        <span className="text-gray-400 line-through text-sm">
                          {formatPrice(heroProduct.oldPrice)}
                        </span>
                      )}
                      <span className="text-orange-400 font-extrabold text-xl">
                        {formatPrice(heroProduct.price)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* Bandeau défilant */}
        <div className="relative border-t border-white/10 bg-white/5 py-3 overflow-hidden">
          <div className="animate-marquee flex whitespace-nowrap text-sm text-gray-300">
            {[...Array(2)].map((_, i) => (
              <span key={i} className="flex shrink-0">
                {[
                  "🚚 Livraison partout au Sénégal",
                  "💵 Paiement à la livraison",
                  "✅ Produits 100% authentiques",
                  "⚡ Express 24h à Dakar",
                  "🎧 Support client 7j/7",
                ].map((t) => (
                  <span key={t} className="mx-8">
                    {t}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <SectionTitle
          icon={<Sparkles className="text-orange-500" size={22} />}
          title="Explorez nos univers"
          subtitle="Trouvez exactement ce qu'il vous faut"
        />

        <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((c) => (
            <Link
              key={c._id}
              to={`/shop?category=${c._id}`}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${
                CATEGORY_COLORS[c.slug] ?? "from-gray-600 to-gray-800"
              } p-5 text-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
            >
              <div className="absolute -bottom-4 -right-4 opacity-20 scale-[2.5] group-hover:scale-[2.8] group-hover:rotate-6 transition-transform duration-500">
                {CATEGORY_ICONS[c.slug] ?? <Sparkles size={28} />}
              </div>
              <div className="relative">
                {CATEGORY_ICONS[c.slug] ?? <Sparkles size={28} />}
                <div className="mt-3 font-bold">{c.name}</div>
                <div className="mt-1 text-xs text-white/70 inline-flex items-center gap-1">
                  Découvrir <ArrowRight size={12} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== OFFRES ===== */}
      {deals.length > 0 && (
        <section id="offres" className="bg-gray-100/70 border-y">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="flex items-end justify-between gap-4">
              <SectionTitle
                icon={<Flame className="text-orange-500" size={22} />}
                title="Offres du moment"
                subtitle="Des réductions à ne pas rater — stocks limités"
              />
              <Link
                to="/shop"
                className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600 whitespace-nowrap"
              >
                Tout voir <ArrowRight size={14} />
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {deals.map((p) => (
                <ProductCard key={p._id} p={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== CONFIANCE ===== */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <TrustCard
            icon={<Truck size={26} />}
            title="Livraison rapide"
            text="Express 24h à Dakar, 2-4 jours partout au Sénégal."
          />
          <TrustCard
            icon={<HandCoins size={26} />}
            title="Paiement à la livraison"
            text="Payez en cash ou mobile money à la réception."
          />
          <TrustCard
            icon={<ShieldCheck size={26} />}
            title="Produits garantis"
            text="100% authentiques, vérifiés avant expédition."
          />
          <TrustCard
            icon={<Headphones size={26} />}
            title="Support 7j/7"
            text="Une question ? Notre équipe vous répond rapidement."
          />
        </div>
      </section>

      {/* ===== NOUVEAUTES ===== */}
      {newest.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="flex items-end justify-between gap-4">
            <SectionTitle
              icon={<Sparkles className="text-orange-500" size={22} />}
              title="Nouveautés"
              subtitle="Les derniers produits arrivés en boutique"
            />
            <Link
              to="/shop"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600 whitespace-nowrap"
            >
              Tout voir <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {newest.map((p) => (
              <ProductCard key={p._id} p={p} />
            ))}
          </div>
        </section>
      )}

      {/* ===== CTA FINAL ===== */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gray-950 text-white px-8 py-12 md:px-14 md:py-16">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-orange-500/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative md:flex items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl md:text-4xl font-extrabold">
                Prêt à vous équiper ?
              </h2>
              <p className="mt-3 text-gray-300 max-w-lg">
                Commandez maintenant et recevez votre matériel en 24h à Dakar.
                Payez uniquement à la réception.
              </p>
            </div>
            <Link
              to="/shop"
              className="mt-6 md:mt-0 inline-flex shrink-0 items-center gap-2 px-8 py-4 rounded-2xl bg-orange-500 hover:bg-orange-400 font-bold shadow-lg shadow-orange-500/30 transition hover:scale-105"
            >
              Commander maintenant
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-2xl md:text-3xl font-extrabold">{title}</h2>
      </div>
      <p className="mt-1 text-gray-500">{subtitle}</p>
    </div>
  );
}

function TrustCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="h-12 w-12 rounded-xl bg-orange-100 text-orange-500 grid place-items-center">
        {icon}
      </div>
      <div className="mt-4 font-bold">{title}</div>
      <p className="mt-1 text-sm text-gray-500">{text}</p>
    </div>
  );
}
