import React from "react";
import Link from "next/link";
import { Plus, ShoppingBag } from "lucide-react";

export interface RelatedProduct {
  id: number;
  name: string;
  slug: string;
  category: string;
  price: number;
  compare_at_price: number | null;
  inventory: number;
  images: string;
}

// Same rotating backdrops as the storefront product cards.
const BACKDROPS = ["bg-nubb-brown", "bg-nubb-mustard", "bg-nubb-orange"];

// Picks up to `limit` other products, same category first, then the rest of the catalog.
export function pickRelated<T extends RelatedProduct>(all: T[], current: { id: number; category: string }, limit = 3): T[] {
  const others = all.filter((p) => p.id !== current.id);
  const sameCategory = others.filter((p) => p.category === current.category);
  const rest = others.filter((p) => p.category !== current.category);
  return [...sameCategory, ...rest].slice(0, limit);
}

export function RelatedProducts<T extends RelatedProduct>({
  products,
  onAdd,
  className = "",
}: {
  products: T[];
  onAdd: (product: T) => void;
  className?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className={`space-y-5 ${className}`}>
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="nubb-eyebrow">You may also like</p>
          <h2 id="related-heading" className="font-display text-3xl leading-none">
            Carried together.
          </h2>
        </div>
        <Link href="/ecom-staging#catalog" className="nubb-link shrink-0">
          View all
        </Link>
      </div>

      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {products.map((product, index) => {
          const image = (JSON.parse(product.images || "[]") as string[])[0] || "";
          const isOutOfStock = product.inventory <= 0;
          return (
            <li key={product.id} className="nubb-surface overflow-hidden flex flex-col group">
              <Link
                href={`/ecom-staging/products/${product.slug}`}
                className={`block aspect-square overflow-hidden ${BACKDROPS[index % BACKDROPS.length]}`}
              >
                {image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={image}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-none group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <span className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-nubb-cream/50" />
                  </span>
                )}
              </Link>
              <div className="p-3.5 flex flex-col gap-2 flex-1">
                <Link href={`/ecom-staging/products/${product.slug}`}>
                  <h3 className="font-body font-bold text-[13px] tracking-[0.06em] uppercase leading-snug line-clamp-2 group-hover:text-nubb-orange transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <div className="mt-auto flex items-center justify-between gap-2">
                  <span className="font-lekton font-bold">₱{product.price.toLocaleString()}</span>
                  <button
                    type="button"
                    onClick={() => onAdd(product)}
                    disabled={isOutOfStock}
                    aria-label={isOutOfStock ? `${product.name} is sold out` : `Add ${product.name} to bag`}
                    className="w-9 h-9 shrink-0 rounded-full bg-nubb-orange text-nubb-cream inline-flex items-center justify-center hover:bg-nubb-crimson transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" strokeWidth={2.2} />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
