import React from "react";
import Link from "next/link";

export function StoreFooter() {
  return (
    <footer className="border-t border-nubb-brown/15 bg-nubb-cream text-nubb-brown py-16 px-4 sm:px-6 lg:px-8 mt-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 items-start">
        {/* Brand & manifesto */}
        <div className="md:col-span-2 space-y-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo-dark-brown.svg?v=3"
            alt="NUBB"
            className="h-8 w-auto object-contain rounded-none"
          />
          <p className="font-display text-2xl leading-tight">the things we carry.</p>
          <span className="nubb-wave" aria-hidden="true" style={{ width: 96 }} />
          <p className="font-body text-sm text-nubb-dark max-w-md leading-relaxed">
            NUBB makes small objects that become part of how you move through life. Handmade objects
            that blur the line between art and utility.
          </p>
        </div>

        {/* Catalog */}
        <div className="space-y-3">
          <h4 className="nubb-eyebrow">Catalog</h4>
          <ul className="space-y-2 font-body text-sm font-bold">
            <li>
              <Link href="/ecom-staging" className="hover:text-nubb-orange transition-colors">
                All Products
              </Link>
            </li>
            <li>
              <Link href="/ecom-staging?category=lighter-covers" className="hover:text-nubb-orange transition-colors">
                Handcrafted Lighter Covers
              </Link>
            </li>
            <li>
              <Link href="/ecom-staging?category=paracord-bracelets" className="hover:text-nubb-orange transition-colors">
                Paracord Bracelets
              </Link>
            </li>
            <li>
              <Link href="/ecom-staging?category=accessories" className="hover:text-nubb-orange transition-colors">
                EDC Accessories
              </Link>
            </li>
          </ul>
        </div>

        {/* Studio */}
        <div className="space-y-3">
          <h4 className="nubb-eyebrow">Studio</h4>
          <ul className="space-y-2 font-body text-sm font-bold">
            <li>
              <Link href="/" className="hover:text-nubb-orange transition-colors">
                Coming Soon Page
              </Link>
            </li>
            <li className="pt-2 text-xs font-normal text-nubb-dark">
              Handcrafted in small batches &bull; Davao
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-nubb-brown/15 flex flex-col sm:flex-row items-center justify-between text-xs font-lekton font-bold text-nubb-dark gap-4">
        <p>&copy; {new Date().getFullYear()} NUBB STORE. All Rights Reserved.</p>
        <p>Built with Craft &amp; Utility.</p>
      </div>
    </footer>
  );
}
