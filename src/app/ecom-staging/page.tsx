"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Flame, Sparkles, ArrowRight, ShieldCheck, Tag } from "lucide-react";
import { useCart } from "@/components/store/CartContext";

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

  const selectedCategory = searchParams.get("category") || "all";
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

  // Instant smooth category switch without page jump or skeleton flash
  const handleCategorySelect = (catId: string) => {
    startTransition(() => {
      const newUrl = catId === "all" ? "/ecom-staging" : `/ecom-staging?category=${catId}`;
      router.replace(newUrl, { scroll: false });
    });
  };

  // Instant filtered list
  const filteredProducts =
    selectedCategory === "all"
      ? allProducts
      : allProducts.filter((p) => p.category === selectedCategory);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="border-3 border-[#4D3F15] bg-[#FFFFFF] p-8 sm:p-12 md:p-16 nubb-shadow-lg relative overflow-hidden">
        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#4D3F15] text-[#E8E6D8] font-lekton text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#892F1A]" />
            <span>Handmade Studio Batch No. 01</span>
          </div>

          <h1 className="font-spray text-4xl sm:text-6xl md:text-7xl text-[#4D3F15] tracking-wide leading-none">
            the things we carry.
          </h1>

          <p className="font-arial text-base sm:text-lg text-[#4D3F15] font-bold leading-relaxed max-w-xl">
            NUBB crafts small objects that become part of how you move through life. Snug sculpted
            lighter covers, tactical mil-spec paracord bracelets, and rugged utility gear.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 font-lekton text-sm font-bold">
            <button
              onClick={() => {
                const el = document.getElementById("catalog");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-6 py-3.5 bg-[#4D3F15] text-[#E8E6D8] hover:bg-[#892F1A] transition-colors flex items-center gap-2 nubb-shadow cursor-pointer"
            >
              Explore Collection
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="px-6 py-3.5 border-2 border-[#4D3F15] bg-[#E8E6D8] flex items-center gap-2">
              <span>100% Handcrafted in Davao</span>
            </div>
          </div>
        </div>

        {/* Decorative Background Mark */}
        <div className="absolute -right-16 -bottom-16 opacity-10 pointer-events-none hidden lg:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/brand-mark.svg?v=3" alt="NUBB" className="w-96 h-96" />
        </div>
      </div>

      {/* Catalog & Category Tabs */}
      <div id="catalog" className="space-y-8 scroll-mt-28">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#4D3F15] pb-4">
          <div>
            <h2 className="font-spray text-3xl text-[#4D3F15]">The Collection</h2>
            <p className="font-lekton text-xs font-bold uppercase text-[#892F1A] tracking-wider mt-1">
              Select Category
            </p>
          </div>

          {/* Category Filter Pills (Instant 0ms Switch) */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`px-4 py-2 font-lekton text-xs sm:text-sm font-bold border-2 border-[#4D3F15] transition-all flex items-center gap-1.5 cursor-pointer relative ${
                    isActive
                      ? "bg-[#4D3F15] text-[#E8E6D8] nubb-shadow scale-[1.02]"
                      : "bg-[#FFFFFF] text-[#4D3F15] hover:bg-[#892F1A] hover:text-[#E8E6D8]"
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Grid with Layout Animations */}
        {initialLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white border-2 border-[#4D3F15] p-4 h-96 animate-pulse flex flex-col justify-between"
              >
                <div className="w-full h-56 bg-[#E8E6D8]" />
                <div className="space-y-2 pt-4">
                  <div className="h-4 bg-[#E8E6D8] w-3/4" />
                  <div className="h-4 bg-[#E8E6D8] w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white border-2 border-[#4D3F15] p-8 space-y-4"
          >
            <p className="font-lekton text-xl font-bold">No pieces found in this category.</p>
            <p className="font-arial text-sm text-[#4D3F15]/70 font-bold">
              New handcrafted batches are being prepared in the workshop.
            </p>
            <button
              onClick={() => handleCategorySelect("all")}
              className="inline-block px-6 py-2.5 bg-[#4D3F15] text-[#E8E6D8] font-lekton font-bold text-sm hover:bg-[#892F1A] transition-colors cursor-pointer"
            >
              View All Pieces
            </button>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => {
                const images: string[] = JSON.parse(product.images || "[]");
                const mainImage = images[0] || "";
                const isOutOfStock = product.inventory <= 0;

                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="bg-[#FFFFFF] border-2 border-[#4D3F15] nubb-shadow-hover flex flex-col justify-between group overflow-hidden"
                  >
                    <div>
                      {/* Image Container with Badge */}
                      <Link
                        href={`/ecom-staging/products/${product.slug}`}
                        className="block relative aspect-square bg-[#E8E6D8] overflow-hidden border-b-2 border-[#4D3F15]"
                      >
                        {mainImage ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={mainImage}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-12 h-12 text-[#4D3F15]/30" />
                          </div>
                        )}

                        {/* Stock Badge */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1">
                          {isOutOfStock ? (
                            <span className="px-2.5 py-1 bg-[#640017] text-[#E8E6D8] font-lekton text-xs font-bold uppercase tracking-wider">
                              Sold Out
                            </span>
                          ) : product.inventory <= 5 ? (
                            <span className="px-2.5 py-1 bg-[#892F1A] text-[#E8E6D8] font-lekton text-xs font-bold uppercase tracking-wider">
                              Only {product.inventory} Left
                            </span>
                          ) : null}

                          {product.is_featured ? (
                            <span className="px-2.5 py-1 bg-[#4D3F15] text-[#E8E6D8] font-lekton text-xs font-bold uppercase tracking-wider">
                              Featured Carry
                            </span>
                          ) : null}
                        </div>
                      </Link>

                      {/* Product Details */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between font-lekton text-xs text-[#892F1A] font-bold uppercase tracking-wider">
                          <span>{product.category.replace("-", " ")}</span>
                          {product.inventory > 0 && <span>Stock: {product.inventory}</span>}
                        </div>

                        <Link href={`/ecom-staging/products/${product.slug}`} className="block">
                          <h3 className="font-lekton font-bold text-lg text-[#4D3F15] group-hover:text-[#892F1A] transition-colors line-clamp-1">
                            {product.name}
                          </h3>
                        </Link>

                        {product.tagline && (
                          <p className="font-arial text-xs text-[#4D3F15]/80 line-clamp-2 font-bold">
                            {product.tagline}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Pricing and Action Footer */}
                    <div className="p-5 pt-0 border-t border-[#4D3F15]/10 mt-2 flex items-center justify-between gap-3">
                      <div className="font-lekton font-bold">
                        <div className="text-xl text-[#4D3F15]">
                          ₱{product.price.toLocaleString()}
                        </div>
                        {product.compare_at_price && (
                          <div className="text-xs text-[#4D3F15]/50 line-through">
                            ₱{product.compare_at_price.toLocaleString()}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => addItem(product, 1)}
                        disabled={isOutOfStock}
                        className="px-4 py-2.5 bg-[#4D3F15] text-[#E8E6D8] font-lekton font-bold text-xs uppercase tracking-wider hover:bg-[#892F1A] active:bg-[#640017] transition-all flex items-center gap-1.5 nubb-shadow cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{isOutOfStock ? "Sold Out" : "Add to Bag"}</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
