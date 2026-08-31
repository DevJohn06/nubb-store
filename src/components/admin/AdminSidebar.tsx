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
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/inventory", label: "Inventory", icon: Layers },
    { href: "/admin/orders", label: "Orders & Sales", icon: ShoppingBag },
    { href: "/admin/subscribers", label: "Subscribers", icon: Mail },
    { href: "/admin/settings", label: "Store Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#E8E6D8] border-r-3 border-[#4D3F15] flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b-2 border-[#4D3F15]">
          <Link href="/admin" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/brand-mark.svg?v=3"
              alt="NUBB"
              className="w-8 h-8 object-contain"
            />
            <div>
              <span className="font-spray text-xl text-[#4D3F15] block leading-none">
                NUBB ADMIN
              </span>
              <span className="font-lekton text-[10px] font-bold text-[#892F1A] uppercase tracking-widest block mt-0.5">
                Studio Operations
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1 font-lekton font-bold text-sm">
          {links.map((link) => {
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 border-2 transition-all ${
                  isActive
                    ? "bg-[#4D3F15] text-[#E8E6D8] border-[#4D3F15] nubb-shadow"
                    : "border-transparent text-[#4D3F15] hover:bg-white hover:border-[#4D3F15]"
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
      <div className="p-4 border-t-2 border-[#4D3F15] bg-[#E8E6D8] space-y-2">
        <Link
          href="/ecom-staging"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2.5 bg-white border-2 border-[#4D3F15] text-[#4D3F15] font-lekton text-xs font-bold hover:bg-[#892F1A] hover:text-[#E8E6D8] transition-colors"
        >
          <span>View Staging Store</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <div className="text-[11px] font-lekton text-[#4D3F15]/60 text-center font-bold">
          Cloudflare R2 & Turso Active
        </div>
      </div>
    </aside>
  );
}
