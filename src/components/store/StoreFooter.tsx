import React from "react";
import Link from "next/link";

export function StoreFooter() {
  return (
    <footer className="border-t-3 border-[#4D3F15] bg-[#E8E6D8] text-[#4D3F15] py-16 px-4 sm:px-6 lg:px-8 mt-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 items-start">
        {/* Brand & Manifesto */}
        <div className="md:col-span-2 space-y-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo-dark-brown.svg?v=3"
            alt="NUBB"
            className="h-8 w-auto object-contain"
          />
          <p className="font-lekton font-bold text-lg lowercase tracking-wider text-[#4D3F15]">
            the things we carry.
          </p>
          <p className="font-arial text-sm text-[#4D3F15]/80 max-w-md leading-relaxed font-bold">
            NUBB makes small objects that become part of how you move through life. Handmade objects
            that blur the line between art and utility.
          </p>
        </div>

        {/* Quick Links */}
        <div className="space-y-3 font-lekton">
          <h4 className="font-bold text-sm uppercase tracking-widest text-[#892F1A]">Catalog</h4>
          <ul className="space-y-2 text-sm font-bold">
            <li>
              <Link href="/ecom-staging" className="hover:text-[#892F1A] transition-colors">
                All Products
              </Link>
            </li>
            <li>
              <Link
                href="/ecom-staging?category=lighter-covers"
                className="hover:text-[#892F1A] transition-colors"
              >
                Handcrafted Lighter Covers
              </Link>
            </li>
            <li>
              <Link
                href="/ecom-staging?category=paracord-bracelets"
                className="hover:text-[#892F1A] transition-colors"
              >
                Paracord Bracelets
              </Link>
            </li>
            <li>
              <Link
                href="/ecom-staging?category=accessories"
                className="hover:text-[#892F1A] transition-colors"
              >
                EDC Accessories
              </Link>
            </li>
          </ul>
        </div>

        {/* Brand & Studio Info */}
        <div className="space-y-3 font-lekton">
          <h4 className="font-bold text-sm uppercase tracking-widest text-[#892F1A]">Studio</h4>
          <ul className="space-y-2 text-sm font-bold">
            <li>
              <Link href="/" className="hover:text-[#892F1A] transition-colors">
                Coming Soon Page
              </Link>
            </li>
            <li className="pt-2 text-xs font-arial text-[#4D3F15]/60">
              Handcrafted in Small Batches &bull; Davao
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-[#4D3F15]/20 flex flex-col sm:flex-row items-center justify-between text-xs font-lekton font-bold text-[#4D3F15]/60 gap-4">
        <p>&copy; {new Date().getFullYear()} NUBB STORE. All Rights Reserved.</p>
        <p>Built with Craft & Utility.</p>
      </div>
    </footer>
  );
}
