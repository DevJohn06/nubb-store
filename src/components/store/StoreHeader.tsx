"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, X, Search } from "lucide-react";
import { useCart } from "./CartContext";

const NAV = [
  { href: "/ecom-staging#catalog", label: "Shop" },
  { href: "/ecom-staging/about", label: "About" },
  { href: "/ecom-staging/craft", label: "Craft" },
];

const SEARCH_HREF = "/ecom-staging/search";

export interface StoreHeaderProps {
  announcement?: string;
  showAnnouncement?: boolean;
}

export function StoreHeader({
  announcement = "HANDCRAFTED IN SMALL BATCHES — STAGING PREVIEW ACTIVE",
  showAnnouncement = true,
}: StoreHeaderProps) {
  const { totalCount, setIsCartOpen } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const barsRef = useRef<HTMLDivElement>(null);

  // Publish the header height (announcement + nav row, not the mobile menu) as --store-header-h
  // so full-screen sections like the storefront hero can size to the space below it.
  useEffect(() => {
    const el = barsRef.current;
    if (!el) return;
    const root = document.documentElement;
    const update = () => root.style.setProperty("--store-header-h", `${el.offsetHeight + 1}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--store-header-h");
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-nubb-cream/95 backdrop-blur-sm border-b border-nubb-brown/15">
      <div ref={barsRef}>
        {/* Announcement bar (admin-controlled via store settings) */}
        {showAnnouncement && Boolean(announcement?.trim()) && (
          <div className="bg-nubb-brown text-nubb-cream py-1.5 px-4 text-center font-lekton text-xs font-bold tracking-[0.14em] uppercase">
            {announcement}
          </div>
        )}

        <div className="nubb-container h-20 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* Desktop navigation (left) */}
          <nav
            aria-label="Main"
            className="hidden md:flex items-center gap-7 font-body text-[13px] font-bold tracking-[0.08em] uppercase"
          >
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-nubb-orange transition-colors py-1">
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu toggle (left on phones) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden justify-self-start w-11 h-11 inline-flex items-center justify-center text-nubb-brown"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo (center) */}
          <Link
            href="/ecom-staging"
            aria-label="NUBB home"
            className="flex flex-col items-center gap-1 group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-dark-brown.svg?v=3"
              alt=""
              className="h-8 sm:h-9 w-auto object-contain rounded-none group-hover:opacity-85 transition-opacity"
            />
            <span className="hidden sm:block font-lekton text-[11px] font-bold tracking-[0.18em] uppercase">
              — the things we carry —
            </span>
          </Link>

          {/* Search + Bag (right) */}
          <div className="justify-self-end flex items-center gap-5">
            <Link
              href={SEARCH_HREF}
              aria-label="Search"
              className="inline-flex items-center gap-2 min-h-11 px-2 font-body text-[13px] font-bold tracking-[0.08em] uppercase hover:text-nubb-orange transition-colors"
            >
              <Search className="w-4 h-4 sm:hidden" />
              <span className="hidden sm:inline">Search</span>
            </Link>
            <button
              onClick={() => setIsCartOpen(true)}
              className="inline-flex items-center gap-2 min-h-11 px-2 font-body text-[13px] font-bold tracking-[0.08em] uppercase hover:text-nubb-orange transition-colors cursor-pointer"
              aria-label={`Open bag, ${totalCount} item${totalCount === 1 ? "" : "s"}`}
            >
              <ShoppingBag className="w-4 h-4 sm:hidden" />
              <span className="hidden sm:inline">Bag ({totalCount})</span>
              {totalCount > 0 && <span className="w-2.5 h-2.5 rounded-full bg-nubb-orange" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <nav
          aria-label="Main"
          className="md:hidden border-t border-nubb-brown/15 bg-nubb-cream px-4 py-4 font-body font-bold tracking-[0.08em] uppercase text-sm"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-3 hover:text-nubb-orange border-b border-nubb-brown/10 last:border-b-0"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
