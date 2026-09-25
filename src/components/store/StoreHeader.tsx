"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "./CartContext";

export function StoreHeader() {
  const { totalCount, setIsCartOpen } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#E8E6D8] border-b-2 border-[#4D3F15]">


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-4">
          <Link href="/ecom-staging" className="flex items-center gap-3 group">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 shrink-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/brand-mark.svg?v=3"
                alt="NUBB"
                className="w-full h-full object-contain"
              />
            </motion.div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-dark-brown.svg?v=3"
              alt="NUBB"
              className="h-7 w-auto object-contain hidden sm:block group-hover:opacity-85 transition-opacity"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 font-lekton text-sm font-bold tracking-wider uppercase">
          <Link
            href="/ecom-staging"
            className="hover:text-[#892F1A] transition-colors py-1 border-b-2 border-transparent hover:border-[#892F1A]"
          >
            All Pieces
          </Link>
          <Link
            href="/ecom-staging?category=lighter-covers"
            className="hover:text-[#892F1A] transition-colors py-1 border-b-2 border-transparent hover:border-[#892F1A]"
          >
            Lighter Covers
          </Link>
          <Link
            href="/ecom-staging?category=paracord-bracelets"
            className="hover:text-[#892F1A] transition-colors py-1 border-b-2 border-transparent hover:border-[#892F1A]"
          >
            Paracord Bracelets
          </Link>
          <Link
            href="/ecom-staging?category=accessories"
            className="hover:text-[#892F1A] transition-colors py-1 border-b-2 border-transparent hover:border-[#892F1A]"
          >
            Accessories
          </Link>
        </nav>

        {/* Actions (Cart Drawer Trigger) */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#FFFFFF] border-2 border-[#4D3F15] text-[#4D3F15] font-lekton font-bold text-sm nubb-shadow-hover cursor-pointer"
            aria-label="Open cart drawer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline uppercase">Carry</span>
            <span className="bg-[#892F1A] text-[#E8E6D8] px-2 py-0.5 text-xs font-bold rounded-xs">
              {totalCount}
            </span>
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 border-2 border-[#4D3F15] bg-[#FFFFFF] text-[#4D3F15]"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t-2 border-[#4D3F15] bg-[#E8E6D8] p-6 space-y-4 font-lekton font-bold tracking-wider uppercase text-base">
          <Link
            href="/ecom-staging"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 hover:text-[#892F1A] border-b border-[#4D3F15]/20"
          >
            All Pieces
          </Link>
          <Link
            href="/ecom-staging?category=lighter-covers"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 hover:text-[#892F1A] border-b border-[#4D3F15]/20"
          >
            Lighter Covers
          </Link>
          <Link
            href="/ecom-staging?category=paracord-bracelets"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 hover:text-[#892F1A] border-b border-[#4D3F15]/20"
          >
            Paracord Bracelets
          </Link>
          <Link
            href="/ecom-staging?category=accessories"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 hover:text-[#892F1A] border-b border-[#4D3F15]/20"
          >
            Accessories
          </Link>
        </div>
      )}
    </header>
  );
}
