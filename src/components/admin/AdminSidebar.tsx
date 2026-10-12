"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Mail,
  Settings,
  ExternalLink,
  Users,
  Image as ImageIcon,
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/media", label: "Media Library", icon: ImageIcon },
    { href: "/admin/inventory", label: "Inventory", icon: Layers },
    { href: "/admin/orders", label: "Orders & Sales", icon: ShoppingBag },
    { href: "/admin/subscribers", label: "Subscribers", icon: Mail },
    { href: "/admin/settings", label: "Store Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-nubb-brown text-nubb-cream flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-nubb-cream/15">
          <Link href="/admin" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/brand-mark-cream.svg"
              alt=""
              className="w-9 h-9 object-contain rounded-none"
            />
            <div>
              <span className="font-display text-2xl text-nubb-cream block leading-none">
                NUBB Admin
              </span>
              <span className="font-lekton text-[11px] font-bold text-nubb-mustard uppercase tracking-[0.14em] block mt-1">
                Studio Operations
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1 font-body font-bold text-sm" aria-label="Admin">
          {links.map((link) => {
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 px-4 min-h-11 rounded-[8px] transition-colors ${
                  isActive
                    ? "bg-nubb-mustard text-nubb-brown"
                    : "text-nubb-cream/85 hover:bg-nubb-cream/10 hover:text-nubb-cream"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Quick Link to Staging Store */}
      <div className="p-4 border-t border-nubb-cream/15 space-y-2">
        <Link
          href="/ecom-staging"
          target="_blank"
          className="flex items-center justify-between px-3.5 min-h-11 rounded-[8px] border-2 border-nubb-cream/40 text-nubb-cream font-body text-xs font-bold uppercase tracking-[0.06em] hover:bg-nubb-orange hover:border-nubb-orange transition-colors"
        >
          <span>View Staging Store</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <div className="text-[11px] font-lekton text-nubb-cream/60 text-center font-bold">
          Cloudflare R2 & Turso Active
        </div>
      </div>
    </aside>
  );
}
