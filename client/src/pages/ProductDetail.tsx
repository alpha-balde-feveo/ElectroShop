import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { AxiosError } from "axios";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { api } from "../api/http";
import type { Product } from "../types";
import { buildImageUrl } from "../utils/image";
import { formatPrice } from "../utils/format";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [imgIndex, setImgIndex] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get<Product>(`/api/products/${id}`);
        if (mounted) setProduct(res.data);
      } catch (e: unknown) {
        const err = e as AxiosError<{ message?: string }>;
        if (mounted)
          setError(err.response?.data?.message ?? "Produit introuvable");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <div className="text-muted">Chargement...</div>;
  if (error || !product)
    return (
      <div>
        <div className="text-red-600">{error ?? "Produit introuvable"}</div>
        <Link to="/shop" className="text-orange-500 underline mt-2 inline-block">
          Retour à la boutique
        </Link>
      </div>
    );

  const images = product.images?.length
    ? product.images
    : [{ url: "" }];
  const mainImg = buildImageUrl(images[imgIndex]?.url);
  const outOfStock = product.stock <= 0;
  const category =
    typeof product.categoryId === "object" && product.categoryId
      ? product.categoryId.name
      : null;

  const specs =
    product.specs && typeof product.specs === "object"
      ? Object.entries(product.specs)
      : [];

  const handleAdd = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div>
      <div className="text-sm text-faint mb-6">
        <Link to="/shop" className="hover-text-app">
          Boutique
        </Link>{" "}
        / {product.name}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="aspect-square bg-card-2 rounded-3xl overflow-hidden border border-app">
            <img
              src={mainImg}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>

          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((im, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  className={`h-20 w-20 rounded-xl overflow-hidden border-2 ${
                    i === imgIndex ? "border-orange-500" : "border-transparent"
                  }`}
                >
                  <img
                    src={buildImageUrl(im.url)}
                    alt={`${product.name} ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Infos */}
        <div>
          {category && (
            <div className="text-sm text-orange-400 font-semibold uppercase tracking-widest">{category}</div>
          )}
          <h1 className="text-3xl font-bold mt-1">{product.name}</h1>
          {product.brand && (
            <div className="text-faint mt-1">Marque : {product.brand}</div>
          )}

          <div className="mt-4 flex items-center gap-3">
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-lg text-faint line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
            <span className="text-3xl font-extrabold text-orange-400">
              {formatPrice(product.price)}
            </span>
          </div>

          <div className="mt-3 text-sm">
            {outOfStock ? (
              <span className="text-red-400 font-medium">Rupture de stock</span>
            ) : (
              <span className="text-green-400 font-medium">
                En stock ({product.stock} disponibles)
              </span>
            )}
          </div>

          {product.description && (
            <p className="mt-4 text-muted leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Quantité + Ajouter */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border border-app-strong rounded-xl bg-card-2">
              <button
                className="p-3 hover:text-orange-500 disabled:opacity-40"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                aria-label="Diminuer"
              >
                <Minus size={16} />
              </button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <button
                className="p-3 hover:text-orange-500 disabled:opacity-40"
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                disabled={qty >= product.stock}
                aria-label="Augmenter"
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              onClick={handleAdd}
              disabled={outOfStock}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-500 text-white hover:bg-orange-400 transition font-semibold shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:hover:bg-orange-500"
            >
              <ShoppingCart size={18} />
              {added ? "Ajouté ✓" : "Ajouter au panier"}
            </button>
          </div>

          {added && (
            <div className="mt-3 text-sm text-green-400">
              Produit ajouté au panier.{" "}
              <Link to="/cart" className="underline font-medium">
                Voir le panier
              </Link>
            </div>
          )}

          {/* Specs */}
          {specs.length > 0 && (
            <div className="mt-8">
              <h2 className="font-bold text-lg mb-3">Caractéristiques</h2>
              <table className="w-full text-sm border border-app rounded-xl overflow-hidden">
                <tbody>
                  {specs.map(([k, v]) => (
                    <tr key={k} className="odd:bg-card">
                      <td className="px-4 py-2.5 font-medium text-soft capitalize">
                        {k}
                      </td>
                      <td className="px-4 py-2.5 text-faint">{String(v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
