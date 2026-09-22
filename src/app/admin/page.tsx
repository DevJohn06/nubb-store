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

interface DashboardRecentOrder {
  id: string;
  customer_name: string;
  total_amount: number;
  payment_method: string;
  order_status: string;
}

interface DashboardLowStockProduct {
  id: number;
  name: string;
  category: string;
  inventory: number;
}

interface Metrics {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalSubscribers?: number;
  activeSubscribers?: number;
  lowStockProducts: DashboardLowStockProduct[];
  recentOrders: DashboardRecentOrder[];
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#4D3F15] pb-4">
        <div>
          <h1 className="font-spray text-3xl sm:text-4xl text-[#4D3F15]">Studio Dashboard</h1>
          <p className="font-lekton text-xs font-bold uppercase tracking-wider text-[#892F1A] mt-1">
            Real-time Storefront & Inventory Overview
          </p>
        </div>

        <div className="flex items-center gap-3 font-lekton text-xs font-bold">
          <Link
            href="/admin/subscribers"
            className="px-4 py-2.5 bg-white border-2 border-[#4D3F15] text-[#4D3F15] hover:bg-[#E8E6D8] transition-colors flex items-center gap-2"
          >
            <Mail className="w-4 h-4 text-[#892F1A]" />
            <span>Subscribers List</span>
          </Link>
          <Link
            href="/admin/products"
            className="px-4 py-2.5 bg-[#4D3F15] text-[#E8E6D8] hover:bg-[#892F1A] transition-colors flex items-center gap-2 nubb-shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
          <Link
            href="/admin/inventory"
            className="px-4 py-2.5 bg-white border-2 border-[#4D3F15] text-[#4D3F15] hover:bg-[#E8E6D8] transition-colors flex items-center gap-2"
          >
            <Layers className="w-4 h-4" />
            <span>Manage Inventory</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Total Revenue */}
        <div className="bg-white border-2 border-[#4D3F15] p-6 nubb-shadow space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-lekton text-xs font-bold uppercase tracking-wider text-[#4D3F15]/70">
              Verified Revenue
            </span>
            <div className="p-2 bg-[#E8E6D8] border border-[#4D3F15]">
              <DollarSign className="w-4 h-4 text-[#892F1A]" />
            </div>
          </div>
          <div className="font-lekton font-bold text-3xl text-[#4D3F15]">
            ₱{metrics.totalRevenue.toLocaleString()}
          </div>
          <p className="font-arial text-xs text-[#4D3F15]/70 font-bold">
            From verified orders
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-white border-2 border-[#4D3F15] p-6 nubb-shadow space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-lekton text-xs font-bold uppercase tracking-wider text-[#4D3F15]/70">
              Total Orders
            </span>
            <div className="p-2 bg-[#E8E6D8] border border-[#4D3F15]">
              <ShoppingBag className="w-4 h-4 text-[#4D3F15]" />
            </div>
          </div>
          <div className="font-lekton font-bold text-3xl text-[#4D3F15]">
            {metrics.totalOrders}
          </div>
          <p className="font-arial text-xs text-[#4D3F15]/70 font-bold">
            All-time placed orders
          </p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white border-2 border-[#4D3F15] p-6 nubb-shadow space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-lekton text-xs font-bold uppercase tracking-wider text-[#4D3F15]/70">
              Pending Orders
            </span>
            <div className="p-2 bg-amber-100 border border-amber-800">
              <Clock className="w-4 h-4 text-amber-800" />
            </div>
          </div>
          <div className="font-lekton font-bold text-3xl text-amber-900">
            {metrics.pendingOrders}
          </div>
          <p className="font-arial text-xs text-amber-800 font-bold">
            Awaiting verification
          </p>
        </div>

        {/* Subscribers */}
        <Link
          href="/admin/subscribers"
          className="bg-white border-2 border-[#4D3F15] p-6 nubb-shadow space-y-2 hover:bg-[#F6F5EE] transition-colors block group"
        >
          <div className="flex items-center justify-between">
            <span className="font-lekton text-xs font-bold uppercase tracking-wider text-[#4D3F15]/70 group-hover:text-[#892F1A]">
              Subscribers
            </span>
            <div className="p-2 bg-emerald-50 border border-emerald-700">
              <Users className="w-4 h-4 text-emerald-800" />
            </div>
          </div>
          <div className="font-lekton font-bold text-3xl text-emerald-800">
            {metrics.totalSubscribers ?? 0}
          </div>
          <p className="font-arial text-xs text-[#4D3F15]/70 font-bold flex items-center justify-between">
            <span>Launch email audience</span>
            <span className="text-[#892F1A] font-lekton">&rarr;</span>
          </p>
        </Link>

        {/* Low Stock Alerts */}
        <div className="bg-white border-2 border-[#4D3F15] p-6 nubb-shadow space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-lekton text-xs font-bold uppercase tracking-wider text-[#4D3F15]/70">
              Low Stock Warnings
            </span>
            <div className="p-2 bg-rose-100 border border-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-800" />
            </div>
          </div>
          <div className="font-lekton font-bold text-3xl text-rose-900">
            {metrics.lowStockProducts.length}
          </div>
          <p className="font-arial text-xs text-rose-800 font-bold">
            Items &le; 5 units in studio
          </p>
        </div>
      </div>

      {/* Two Column Section: Recent Orders + Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Orders (8 cols) */}
        <div className="lg:col-span-8 bg-white border-2 border-[#4D3F15] p-6 nubb-shadow space-y-4">
          <div className="flex items-center justify-between border-b border-[#4D3F15]/20 pb-3">
            <h2 className="font-lekton text-base font-bold uppercase tracking-wider text-[#4D3F15]">
              Recent Orders Log
            </h2>
            <Link
              href="/admin/orders"
              className="font-lekton text-xs font-bold text-[#892F1A] hover:underline flex items-center gap-1"
            >
              View All Orders &rarr;
            </Link>
          </div>

          {metrics.recentOrders.length === 0 ? (
            <div className="py-12 text-center text-sm font-arial text-[#4D3F15]/70 font-bold">
              No orders placed yet. Test orders through the Staging Store!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-lekton text-xs">
                <thead>
                  <tr className="border-b border-[#4D3F15]/20 text-[#4D3F15]/60 font-bold uppercase">
                    <th className="pb-2">Order ID</th>
                    <th className="pb-2">Customer</th>
                    <th className="pb-2">Total</th>
                    <th className="pb-2">Payment</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#4D3F15]/10">
                  {metrics.recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#E8E6D8]/20 font-bold">
                      <td className="py-3 font-mono text-[#892F1A]">#{ord.id}</td>
                      <td className="py-3 font-arial text-xs">{ord.customer_name}</td>
                      <td className="py-3">₱{ord.total_amount.toLocaleString()}</td>
                      <td className="py-3 uppercase text-[10px]">
                        <span className="px-2 py-0.5 border border-[#4D3F15]/40 bg-[#E8E6D8]/50">
                          {ord.payment_method}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 border text-[10px] uppercase ${
                            ord.order_status === "delivered" || ord.order_status === "shipped"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-800"
                              : ord.order_status === "cancelled"
                              ? "bg-rose-50 text-rose-800 border-rose-800"
                              : "bg-amber-50 text-amber-800 border-amber-800"
                          }`}
                        >
                          {ord.order_status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/admin/orders?id=${ord.id}`}
                          className="px-2.5 py-1 bg-[#4D3F15] text-[#E8E6D8] hover:bg-[#892F1A] transition-colors"
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
        <div className="lg:col-span-4 bg-white border-2 border-[#4D3F15] p-6 nubb-shadow space-y-4">
          <div className="flex items-center justify-between border-b border-[#4D3F15]/20 pb-3">
            <h2 className="font-lekton text-base font-bold uppercase tracking-wider text-rose-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-800" />
              Low Stock Feed
            </h2>
            <Link
              href="/admin/inventory"
              className="font-lekton text-xs font-bold text-[#892F1A] hover:underline"
            >
              Restock &rarr;
            </Link>
          </div>

          {metrics.lowStockProducts.length === 0 ? (
            <div className="py-8 text-center text-xs font-arial text-emerald-800 font-bold flex flex-col items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-700" />
              <span>All inventory levels healthy (&gt; 5 units).</span>
            </div>
          ) : (
            <div className="space-y-3">
              {metrics.lowStockProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="p-3 border border-[#4D3F15]/30 bg-[#E8E6D8]/30 flex items-center justify-between gap-3 font-lekton font-bold"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-[#4D3F15] line-clamp-1">{prod.name}</p>
                    <p className="text-[10px] text-[#4D3F15]/60 uppercase">{prod.category}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="px-2 py-0.5 bg-rose-800 text-white text-xs font-bold">
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
