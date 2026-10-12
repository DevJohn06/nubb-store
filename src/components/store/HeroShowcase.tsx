"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Plus } from "lucide-react";
import { Stamp } from "./Stamp";

export interface ShowcaseProduct {
  id: number;
  name: string;
  slug: string;
  category: string;
  tagline: string;
  price: number;
  compare_at_price: number | null;
  inventory: number;
  images: string;
}

const ROTATE_MS = 4500;

// Hero image block: cycles through featured products, shows quick product info on hover/focus,
// and spins the stamp as the page scrolls.
export function HeroShowcase<T extends ShowcaseProduct>({
  products,
  onAdd,
}: {
  products: T[];
  onAdd: (product: T) => void;
}) {
  const slides = products
    .map((product) => ({ product, image: (JSON.parse(product.images || "[]") as string[])[0] || "" }))
    .filter((s) => s.image);

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  const current = slides.length ? slides[active % slides.length] : null;

  // Auto-advance; paused while the visitor is reading the hover card or prefers reduced motion.
  useEffect(() => {
    if (paused || reduceMotion || slides.length < 2) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % slides.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, [paused, reduceMotion, slides.length]);

  // Stamp: one full turn per ~900px of scroll, smoothed with a spring.
  const { scrollY } = useScroll();
  const rawRotate = useTransform(scrollY, [0, 900], [0, 360], { clamp: false });
  const stampRotate = useSpring(rawRotate, { stiffness: 120, damping: 20, mass: 0.4 });

  const product = current?.product;
  const isOutOfStock = product ? product.inventory <= 0 : false;

  return (
    // On desktop the image scales with the screen height so the hero and trust strip fit in one view.
    <div className="relative min-h-[380px] sm:min-h-[520px] lg:min-h-0 lg:h-[clamp(360px,calc(100svh-var(--store-header-h,108px)-240px),680px)] short-desktop:h-[clamp(340px,calc(100svh-var(--store-header-h,108px)-200px),680px)] mb-8 lg:mb-0">
      {/* clip-path keeps the crossfading (transformed) images inside the rounded shape */}
      <div
        className="group absolute inset-0 isolate bg-nubb-orange rounded-[240px_28px_28px_120px] [clip-path:inset(0_round_240px_28px_28px_120px)] overflow-hidden flex items-center justify-center"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
        }}
        role={slides.length > 1 ? "region" : undefined}
        aria-roledescription={slides.length > 1 ? "carousel" : undefined}
        aria-label="Featured pieces"
      >
        {current ? (
          <>
            {/* Stacked slides, crossfaded so every image is already loaded */}
            {slides.map((slide, i) => {
              const isActive = i === active % slides.length;
              return (
                <motion.img
                  key={slide.product.id}
                  src={slide.image}
                  alt={isActive ? slide.product.name : ""}
                  aria-hidden={!isActive}
                  initial={false}
                  animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 1.04 }}
                  transition={{ duration: reduceMotion ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 w-full h-full object-cover rounded-none"
                />
              );
            })}

            {/* Quick info: on hover/focus with a mouse, always visible on touch screens */}
            <div className="absolute inset-0 bg-gradient-to-t from-nubb-brown/90 via-nubb-brown/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100" />
            <div className="absolute left-6 right-28 bottom-6 sm:left-10 sm:right-44 sm:bottom-10 text-nubb-cream translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100">
              <p className="font-lekton text-xs font-bold uppercase tracking-[0.14em] text-nubb-mustard">
                Featured · {product!.category.replace("-", " ")}
              </p>
              <h3 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] leading-none mt-2">{product!.name}</h3>
              {product!.tagline && (
                <p className="font-body text-sm text-nubb-cream/85 mt-2 line-clamp-2 max-w-[42ch]">{product!.tagline}</p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
                <p className="font-lekton font-bold">
                  <span className="text-xl">₱{product!.price.toLocaleString()}</span>
                  {product!.compare_at_price && (
                    <span className="ml-2 text-sm text-nubb-cream/60 line-through">
                      ₱{product!.compare_at_price.toLocaleString()}
                    </span>
                  )}
                </p>
                <Link
                  href={`/ecom-staging/products/${product!.slug}`}
                  className="nubb-link text-nubb-cream hover:text-nubb-mustard inline-flex items-center gap-1.5"
                >
                  View piece <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => onAdd(product!)}
                  disabled={isOutOfStock}
                  aria-label={isOutOfStock ? `${product!.name} is sold out` : `Add ${product!.name} to bag`}
                  className="w-10 h-10 rounded-full bg-nubb-mustard text-nubb-brown inline-flex items-center justify-center hover:bg-nubb-cream transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" strokeWidth={2.2} />
                </button>
              </div>
            </div>

            {/* Slide indicators */}
            {slides.length > 1 && (
              <div className="absolute top-5 right-5 flex items-center gap-1.5 px-2.5 rounded-full bg-nubb-brown/45 backdrop-blur-sm" role="group" aria-label="Choose featured piece">
                {slides.map((slide, i) => {
                  const isActive = i === active % slides.length;
                  return (
                    <button
                      key={slide.product.id}
                      type="button"
                      onClick={() => setActive(i)}
                      aria-label={`Show ${slide.product.name}`}
                      aria-current={isActive}
                      className="h-6 inline-flex items-center cursor-pointer"
                    >
                      <span
                        className={`block h-1.5 rounded-full transition-all duration-300 ${
                          isActive ? "w-6 bg-nubb-mustard" : "w-1.5 bg-nubb-cream/60 hover:bg-nubb-cream"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src="/brand/brand-mark-cream.svg" alt="" className="w-1/2 h-1/2 object-contain opacity-30 rounded-none" />
        )}
      </div>

      <motion.div
        style={reduceMotion ? undefined : { rotate: stampRotate }}
        className="absolute -right-2 -bottom-7 pointer-events-none"
      >
        <Stamp />
      </motion.div>
    </div>
  );
}
