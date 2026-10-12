"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Flame, Sparkles, ArrowRight, Tag, Plus, Hand, MapPin, Waves, LayoutGrid } from "lucide-react";
import { useCart } from "@/components/store/CartContext";
import { Stamp } from "@/components/store/Stamp";

interface Product {
  id: number;
  name: string;
  slug: string;
  category: string;
  tagline: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  inventory: number;
  images: string;
  is_featured: number;
}

const TRUST = [
  { icon: Hand, label: "Handmade,", sub: "start to finish" },
  { icon: MapPin, label: "Made in", sub: "Davao" },
  { icon: Waves, label: "Mil-spec", sub: "paracord" },
  { icon: LayoutGrid, label: "Small", sub: "batches" },
];

// Card backdrops cycle through the brand palette (Brown, Mustard, Orange).
const CARD_BACKDROPS = ["bg-nubb-brown", "bg-nubb-mustard", "bg-nubb-orange"];

const CATEGORIES = [
  { id: "all", label: "All Products" },
  { id: "lighter-covers", label: "Lighter Covers", icon: Flame },
  { id: "paracord-bracelets", label: "Paracord Bracelets", icon: Sparkles },
  { id: "accessories", label: "EDC Accessories", icon: Tag },
];

export default function StagingStorefront() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const initialCat = searchParams.get("category") || "all";
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const { addItem } = useCart();

  // Load all products once on mount
  useEffect(() => {
    async function loadAllProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.products) {
          setAllProducts(data.products);
        }
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setInitialLoading(false);
      }
    }
    loadAllProducts();
  }, []);

  // Sync selectedCategory if URL search param changes from outside (e.g. header link)
  useEffect(() => {
    const cat = searchParams.get("category") || "all";
    setSelectedCategory(cat);
  }, [searchParams]);

  // Instant smooth category switch without page jump or skeleton flash
  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    startTransition(() => {
      const newUrl = catId === "all" ? "/ecom-staging" : `/ecom-staging?category=${catId}`;
      window.history.replaceState(null, "", newUrl);
    });
  };

  // Instant filtered list
  const filteredProducts =
    selectedCategory === "all"
      ? allProducts
      : allProducts.filter((p) => p.category === selectedCategory);

  const featured = allProducts.find((p) => p.is_featured) || allProducts[0];
  const heroImage: string = featured ? (JSON.parse(featured.images || "[]")[0] || "") : "";

  return (
    <div className="space-y-16 sm:space-y-20">
      {/* Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
        <div className="space-y-6 py-4">
          <p className="nubb-eyebrow">Handmade studio · Batch No. 01</p>
          <h1 className="font-display text-[clamp(3.25rem,7vw,6.5rem)] leading-[0.92] text-balance">
            the things we carry.
          </h1>
          <span className="nubb-wave" aria-hidden="true" style={{ width: 150 }} />
          <p className="font-body text-lg leading-relaxed max-w-[32ch]">
            Small objects that become part of how you move through life. Sculpted lighter covers,
            mil-spec paracord, rugged everyday gear.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })}
              className="nubb-btn-primary"
            >
              Explore the collection
              <ArrowRight className="w-4 h-4" />
            </button>
            <span className="font-lekton text-sm font-bold tracking-wide">100% handcrafted in Davao</span>
          </div>
        </div>

        <div className="relative min-h-[380px] sm:min-h-[480px]">
          <div className="absolute inset-0 bg-nubb-orange rounded-[240px_28px_28px_120px] overflow-hidden flex items-center justify-center">
            {heroImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={heroImage}
                alt={featured?.name || "NUBB"}
                className="w-full h-full object-cover rounded-none"
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src="/brand/brand-mark-cream.svg"
                alt=""
                className="w-1/2 h-1/2 object-contain opacity-30 rounded-none"
              />
            )}
          </div>
          <Stamp className="absolute -right-2 -bottom-7" />
        </div>
      </section>

      {/* Trust strip */}
      <section
        aria-label="Why NUBB"
        className="bg-nubb-brown text-nubb-cream rounded-[20px] px-6 py-6 grid grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {TRUST.map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex items-center gap-3.5">
            <span className="w-11 h-11 shrink-0 rounded-full border-[1.6px] border-nubb-mustard text-nubb-mustard flex items-center justify-center">
              <Icon className="w-5 h-5" strokeWidth={1.6} />
            </span>
            <span className="font-body text-[13px] font-bold leading-snug tracking-[0.06em] uppercase">
              {label}
              <br />
              {sub}
            </span>
          </div>
        ))}
      </section>

      {/* Catalog */}
      <section id="catalog" className="space-y-8 scroll-mt-28">
        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-6 pb-7 border-b border-nubb-brown/15">
          <div className="space-y-3.5">
            <p className="nubb-eyebrow">The collection</p>
            <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-none">Small things, made well.</h2>
            <span className="nubb-wave" aria-hidden="true" style={{ width: 96 }} />
          </div>
          <p className="font-body text-base leading-relaxed text-nubb-dark max-w-sm">
            Where art meets utility. Each piece is shaped, tied and finished by hand.
          </p>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2.5" role="group" aria-label="Filter by category">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                aria-pressed={isActive}
                className="nubb-chip"
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Products grid */}
        {initialLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="nubb-surface overflow-hidden animate-pulse">
                <div className="w-full aspect-square bg-nubb-cream" />
                <div className="space-y-2 p-5">
                  <div className="h-4 bg-nubb-cream rounded w-3/4" />
                  <div className="h-4 bg-nubb-cream rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="nubb-surface text-center py-20 px-8 space-y-4"
          >
            <p className="font-display text-3xl">No pieces in this category yet.</p>
            <p className="font-body text-sm text-nubb-dark">
              New handcrafted batches are being prepared in the workshop.
            </p>
            <button onClick={() => handleCategorySelect("all")} className="nubb-btn-secondary">
              View all pieces
            </button>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => {
                const images: string[] = JSON.parse(product.images || "[]");
                const mainImage = images[0] || "";
                const isOutOfStock = product.inventory <= 0;
                const backdrop = CARD_BACKDROPS[index % CARD_BACKDROPS.length];

                return (
                  <motion.article
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="nubb-surface transition-[translate] duration-200 hover:-translate-y-0.5 flex flex-col overflow-hidden group"
                  >
                    <Link
                      href={`/ecom-staging/products/${product.slug}`}
                      className={`block relative aspect-square overflow-hidden ${backdrop}`}
                    >
                      {mainImage ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={mainImage}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-none group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-12 h-12 text-nubb-cream/50" />
                        </div>
                      )}

                      <div className="absolute top-3.5 left-3.5 flex flex-col items-start gap-1.5">
                        {isOutOfStock ? (
                          <span className="nubb-badge bg-nubb-crimson text-nubb-cream">Sold out</span>
                        ) : product.inventory <= 5 ? (
                          <span className="nubb-badge bg-nubb-orange text-nubb-cream">
                            Only {product.inventory} left
                          </span>
                        ) : null}
                        {product.is_featured ? (
                          <span className="nubb-badge bg-nubb-mustard text-nubb-brown">Featured</span>
                        ) : null}
                      </div>
                    </Link>

                    <div className="p-5 flex flex-col gap-1 flex-1">
                      <p className="font-lekton text-xs font-bold uppercase tracking-[0.12em] text-nubb-orange">
                        {product.category.replace("-", " ")}
                      </p>
                      <Link href={`/ecom-staging/products/${product.slug}`} className="block">
                        <h3 className="font-body font-bold text-[15px] tracking-[0.06em] uppercase group-hover:text-nubb-orange transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>
                      {product.tagline && (
                        <p className="font-body text-sm text-nubb-dark line-clamp-2">{product.tagline}</p>
                      )}

                      <div className="mt-auto pt-3 flex items-center justify-between gap-3">
                        <div className="font-lekton font-bold">
                          <span className="text-xl">₱{product.price.toLocaleString()}</span>
                          {product.compare_at_price && (
                            <span className="ml-2 text-sm text-nubb-dark line-through">
                              ₱{product.compare_at_price.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => addItem(product, 1)}
                          disabled={isOutOfStock}
                          aria-label={isOutOfStock ? `${product.name} is sold out` : `Add ${product.name} to bag`}
                          className="w-11 h-11 shrink-0 rounded-full bg-nubb-orange text-nubb-cream inline-flex items-center justify-center hover:bg-nubb-crimson active:bg-nubb-crimson transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4" strokeWidth={2.2} />
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* Brand band */}
      <section className="relative isolate overflow-hidden bg-nubb-mustard text-nubb-brown rounded-[0_160px_20px_20px] px-8 sm:px-12 py-14 sm:py-16">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/brand-mark.svg?v=3"
          alt=""
          aria-hidden="true"
          className="absolute -z-10 -right-16 -bottom-20 w-80 h-80 opacity-15 pointer-events-none rounded-none"
        />
        <div className="max-w-xl space-y-4">
          <p className="nubb-eyebrow">Art × utility</p>
          <h2 className="font-display text-[clamp(2.25rem,4.5vw,3.25rem)] leading-none">
            Carried every day. Made to last.
          </h2>
          <span className="nubb-wave" aria-hidden="true" style={{ width: 96 }} />
        </div>
      </section>
    </div>
  );
}
