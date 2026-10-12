"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  Clock,
  AlertTriangle,
  ArrowRight,
  Package,
  Plus,
  Layers,
  CheckCircle2,
  Mail,
  Users,
} from "lucide-react";

import { BrandLoader } from "@/components/common/BrandLoader";

interface Metrics {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalSubscribers?: number;
  activeSubscribers?: number;
  lowStockProducts: any[];
  recentOrders: any[];
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await fetch("/api/admin/orders?metrics=true");
        const data = await res.json();
        setMetrics(data);
      } catch (err) {
        console.error("Failed to load metrics", err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  if (loading || !metrics) {
    return (
      <BrandLoader
        size="lg"
        label="Loading Studio Metrics..."
        className="py-24"
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-nubb-brown pb-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl text-nubb-brown">Studio Dashboard</h1>
          <p className="font-lekton text-xs font-bold uppercase tracking-wider text-nubb-orange mt-1">
            Real-time Storefront & Inventory Overview
          </p>
        </div>

        <div className="flex items-center gap-3 font-lekton text-xs font-bold">
          <Link
            href="/admin/subscribers"
            className="nubb-btn-secondary nubb-btn-sm"
          >
            <Mail className="w-4 h-4" />
            <span>Subscribers List</span>
          </Link>
          <Link
            href="/admin/products"
            className="nubb-btn-primary nubb-btn-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
          <Link
            href="/admin/inventory"
            className="nubb-btn-secondary nubb-btn-sm"
          >
            <Layers className="w-4 h-4" />
            <span>Manage Inventory</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Total Revenue */}
        <div className="nubb-surface p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-lekton text-xs font-bold uppercase tracking-wider text-nubb-brown/70">
              Verified Revenue
            </span>
            <div className="p-2 bg-nubb-cream border border-nubb-brown">
              <DollarSign className="w-4 h-4 text-nubb-orange" />
            </div>
          </div>
          <div className="font-lekton font-bold text-3xl text-nubb-brown">
            ₱{metrics.totalRevenue.toLocaleString()}
          </div>
          <p className="font-body text-xs text-nubb-brown/70 font-bold">
            From verified orders
          </p>
        </div>

        {/* Total Orders */}
        <div className="nubb-surface p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-lekton text-xs font-bold uppercase tracking-wider text-nubb-brown/70">
              Total Orders
            </span>
            <div className="p-2 bg-nubb-cream border border-nubb-brown">
              <ShoppingBag className="w-4 h-4 text-nubb-brown" />
            </div>
          </div>
          <div className="font-lekton font-bold text-3xl text-nubb-brown">
            {metrics.totalOrders}
          </div>
          <p className="font-body text-xs text-nubb-brown/70 font-bold">
            All-time placed orders
          </p>
        </div>

        {/* Pending Orders */}
        <div className="nubb-surface p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-lekton text-xs font-bold uppercase tracking-wider text-nubb-brown/70">
              Pending Orders
            </span>
            <div className="p-2 bg-nubb-mustard/25 border border-nubb-orange">
              <Clock className="w-4 h-4 text-nubb-orange" />
            </div>
          </div>
          <div className="font-lekton font-bold text-3xl text-nubb-orange">
            {metrics.pendingOrders}
          </div>
          <p className="font-body text-xs text-nubb-orange font-bold">
            Awaiting verification
          </p>
        </div>

        {/* Subscribers */}
        <Link
          href="/admin/subscribers"
          className="nubb-surface p-6 space-y-2 hover:border-nubb-orange transition-colors block group"
        >
          <div className="flex items-center justify-between">
            <span className="font-lekton text-xs font-bold uppercase tracking-wider text-nubb-brown/70 group-hover:text-nubb-orange">
              Subscribers
            </span>
            <div className="p-2 bg-nubb-brown/10 border border-nubb-brown">
              <Users className="w-4 h-4 text-nubb-brown" />
            </div>
          </div>
          <div className="font-lekton font-bold text-3xl text-nubb-brown">
            {metrics.totalSubscribers ?? 0}
          </div>
          <p className="font-body text-xs text-nubb-brown/70 font-bold flex items-center justify-between">
            <span>Launch email audience</span>
            <span className="text-nubb-orange font-lekton">&rarr;</span>
          </p>
        </Link>

        {/* Low Stock Alerts */}
        <div className="nubb-surface p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-lekton text-xs font-bold uppercase tracking-wider text-nubb-brown/70">
              Low Stock Warnings
            </span>
            <div className="p-2 bg-nubb-crimson/15 border border-nubb-crimson">
              <AlertTriangle className="w-4 h-4 text-nubb-crimson" />
            </div>
          </div>
          <div className="font-lekton font-bold text-3xl text-nubb-crimson">
            {metrics.lowStockProducts.length}
          </div>
          <p className="font-body text-xs text-nubb-crimson font-bold">
            Items &le; 5 units in studio
          </p>
        </div>
      </div>

      {/* Two Column Section: Recent Orders + Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Orders (8 cols) */}
        <div className="lg:col-span-8 nubb-surface p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-nubb-brown/20 pb-3">
            <h2 className="font-lekton text-base font-bold uppercase tracking-wider text-nubb-brown">
              Recent Orders Log
            </h2>
            <Link
              href="/admin/orders"
              className="font-lekton text-xs font-bold text-nubb-orange hover:underline flex items-center gap-1"
            >
              View All Orders &rarr;
            </Link>
          </div>

          {metrics.recentOrders.length === 0 ? (
            <div className="py-12 text-center text-sm font-body text-nubb-brown/70 font-bold">
              No orders placed yet. Test orders through the Staging Store!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-lekton text-xs">
                <thead>
                  <tr className="border-b border-nubb-brown/20 text-nubb-brown/60 font-bold uppercase">
                    <th className="pb-2">Order ID</th>
                    <th className="pb-2">Customer</th>
                    <th className="pb-2">Total</th>
                    <th className="pb-2">Payment</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-nubb-brown/10">
                  {metrics.recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-nubb-cream/20 font-bold">
                      <td className="py-3 font-mono text-nubb-orange">#{ord.id}</td>
                      <td className="py-3 font-body text-xs">{ord.customer_name}</td>
                      <td className="py-3">₱{ord.total_amount.toLocaleString()}</td>
                      <td className="py-3 uppercase text-[10px]">
                        <span className="px-2 py-0.5 border border-nubb-brown/40 bg-nubb-cream/50">
                          {ord.payment_method}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 border text-[10px] uppercase ${
                            ord.order_status === "delivered" || ord.order_status === "shipped"
                              ? "bg-nubb-brown/10 text-nubb-brown border-nubb-brown"
                              : ord.order_status === "cancelled"
                              ? "bg-nubb-crimson/10 text-nubb-crimson border-nubb-crimson"
                              : "bg-nubb-mustard/25 text-nubb-orange border-nubb-orange"
                          }`}
                        >
                          {ord.order_status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/admin/orders?id=${ord.id}`}
                          className="px-2.5 py-1 bg-nubb-orange text-nubb-cream hover:bg-nubb-crimson transition-colors"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts (4 cols) */}
        <div className="lg:col-span-4 nubb-surface p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-nubb-brown/20 pb-3">
            <h2 className="font-lekton text-base font-bold uppercase tracking-wider text-nubb-crimson flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-nubb-crimson" />
              Low Stock Feed
            </h2>
            <Link
              href="/admin/inventory"
              className="font-lekton text-xs font-bold text-nubb-orange hover:underline"
            >
              Restock &rarr;
            </Link>
          </div>

          {metrics.lowStockProducts.length === 0 ? (
            <div className="py-8 text-center text-xs font-body text-nubb-brown font-bold flex flex-col items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-nubb-brown" />
              <span>All inventory levels healthy (&gt; 5 units).</span>
            </div>
          ) : (
            <div className="space-y-3">
              {metrics.lowStockProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="p-3 border border-nubb-brown/30 bg-nubb-cream/30 flex items-center justify-between gap-3 font-lekton font-bold"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-nubb-brown line-clamp-1">{prod.name}</p>
                    <p className="text-[10px] text-nubb-brown/60 uppercase">{prod.category}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="px-2 py-0.5 bg-nubb-crimson text-white text-xs font-bold">
                      {prod.inventory} left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
