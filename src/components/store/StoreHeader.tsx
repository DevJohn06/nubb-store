"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "./CartContext";

const NAV = [
  { href: "/ecom-staging", label: "All Pieces" },
  { href: "/ecom-staging?category=lighter-covers", label: "Lighter Covers" },
  { href: "/ecom-staging?category=paracord-bracelets", label: "Paracord" },
  { href: "/ecom-staging?category=accessories", label: "Accessories" },
];

export function StoreHeader() {
  const { totalCount, setIsCartOpen } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-nubb-cream/95 backdrop-blur-sm border-b border-nubb-brown/15">
      {/* Staging notice */}
      <div className="bg-nubb-brown text-nubb-cream py-1.5 px-4 text-center font-lekton text-xs font-bold tracking-[0.14em] uppercase">
        Staging preview · Handmade in small batches
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
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

        {/* Bag (right) */}
        <div className="justify-self-end flex items-center">
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

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <nav
          aria-label="Main"
          className="md:hidden border-t border-nubb-brown/15 bg-nubb-cream px-6 py-4 font-body font-bold tracking-[0.08em] uppercase text-sm"
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
