"use client";

import React, { useState, useEffect, use } from "react";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Eye,
  X,
  Loader2,
  ExternalLink,
  Search,
} from "lucide-react";
import { BrandLoader } from "@/components/common/BrandLoader";

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: string; // JSON
  items: string; // JSON
  subtotal: number;
  shipping_fee: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  payment_proof_url: string | null;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
}

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export default function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const unwrappedParams = use(searchParams);
  const initialOrderId = unwrappedParams.id;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const [trackingInput, setTrackingInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
        if (initialOrderId) {
          const match = data.orders.find((o: Order) => o.id === initialOrderId);
          if (match) {
            setSelectedOrder(match);
            setTrackingInput(match.tracking_number || "");
          }
        }
      }
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const openOrder = (ord: Order) => {
    setSelectedOrder(ord);
    setTrackingInput(ord.tracking_number || "");
  };

  const handleUpdateStatus = async (
    order_status?: string,
    payment_status?: string,
    tracking_number?: string
  ) => {
    if (!selectedOrder) return;
    setUpdating(true);

    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedOrder.id,
          order_status,
          payment_status,
          tracking_number,
        }),
      });

      if (res.ok) {
        setSelectedOrder((prev) =>
          prev
            ? {
                ...prev,
                order_status: order_status || prev.order_status,
                payment_status: payment_status || prev.payment_status,
                tracking_number:
                  tracking_number !== undefined ? tracking_number : prev.tracking_number,
              }
            : null
        );
        loadOrders();
      }
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === "all" || o.order_status === statusFilter;
    const matchesSearch =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#4D3F15] pb-4">
        <div>
          <h1 className="font-spray text-3xl sm:text-4xl text-[#4D3F15]">Orders & Sales</h1>
          <p className="font-lekton text-xs font-bold uppercase tracking-wider text-[#892F1A] mt-1">
            Studio Fulfillment & Proof of Payment Review
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-white border-2 border-[#4D3F15] font-lekton text-xs font-bold text-[#4D3F15]">
            Total Orders: {orders.length}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border-2 border-[#4D3F15] p-4 nubb-shadow">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Order ID, Customer, Email..."
            className="w-full pl-9 pr-4 py-2 bg-[#E8E6D8]/30 border border-[#4D3F15] font-lekton text-xs font-bold focus:outline-none focus:bg-white"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#4D3F15]/50" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 font-lekton text-xs font-bold uppercase border transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? "bg-[#4D3F15] text-[#E8E6D8] border-[#4D3F15]"
                  : "bg-white text-[#4D3F15] border-[#4D3F15]/40 hover:border-[#4D3F15]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border-2 border-[#4D3F15] nubb-shadow overflow-hidden">
        {loading ? (
          <BrandLoader size="lg" label="Loading Orders..." className="py-20" />
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center font-arial text-sm font-bold text-[#4D3F15]/70">
            No orders found matching this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-lekton text-xs">
              <thead>
                <tr className="bg-[#E8E6D8]/50 border-b-2 border-[#4D3F15] text-[#4D3F15] font-bold uppercase">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Payment Status</th>
                  <th className="p-4">Fulfillment</th>
                  <th className="p-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#4D3F15]/10">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#E8E6D8]/20 font-bold">
                    <td className="p-4 font-mono text-[#892F1A]">#{ord.id}</td>
                    <td className="p-4">
                      <p className="text-sm font-bold text-[#4D3F15] font-arial">
                        {ord.customer_name}
                      </p>
                      <p className="text-[11px] text-[#4D3F15]/70">{ord.customer_email}</p>
                    </td>
                    <td className="p-4 text-sm font-bold">₱{ord.total_amount.toLocaleString()}</td>
                    <td className="p-4 uppercase text-[10px]">
                      <span className="px-2 py-0.5 border border-[#4D3F15]/30 bg-[#E8E6D8]/40">
                        {ord.payment_method}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 border text-[10px] uppercase ${
                          ord.payment_status === "verified" || ord.payment_status === "paid"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-800"
                            : ord.payment_status === "failed"
                            ? "bg-rose-50 text-rose-800 border-rose-800"
                            : "bg-amber-50 text-amber-800 border-amber-800"
                        }`}
                      >
                        {ord.payment_status}
                      </span>
                    </td>
                    <td className="p-4">
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
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openOrder(ord)}
                        className="px-3 py-1.5 bg-[#4D3F15] text-[#E8E6D8] font-bold text-xs uppercase hover:bg-[#892F1A] transition-colors flex items-center gap-1.5 ml-auto cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setSelectedOrder(null)}
            className="fixed inset-0 bg-[#4D3F15]/60 backdrop-blur-xs"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-2xl bg-[#E8E6D8] border-l-4 border-[#4D3F15] p-6 sm:p-8 flex flex-col justify-between overflow-y-auto shadow-2xl space-y-6">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b-2 border-[#4D3F15] pb-4">
                  <div>
                    <h2 className="font-spray text-2xl text-[#4D3F15]">
                      Order #{selectedOrder.id}
                    </h2>
                    <p className="font-lekton text-xs font-bold text-[#892F1A] uppercase tracking-wider">
                      Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 border-2 border-[#4D3F15] bg-white hover:bg-[#892F1A] hover:text-[#E8E6D8] transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Customer & Shipping Summary */}
                <div className="bg-white border-2 border-[#4D3F15] p-5 nubb-shadow space-y-3 font-arial text-xs font-bold">
                  <h3 className="font-lekton text-xs font-bold uppercase tracking-wider text-[#892F1A]">
                    Customer & Destination
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-bold text-[#4D3F15]">
                        {selectedOrder.customer_name}
                      </p>
                      <p className="text-[#4D3F15]/80">{selectedOrder.customer_email}</p>
                      <p className="text-[#4D3F15]/80">{selectedOrder.customer_phone || "No phone"}</p>
                    </div>
                    <div>
                      {(() => {
                        const addr = JSON.parse(selectedOrder.shipping_address || "{}");
                        return (
                          <div className="text-[#4D3F15]/90">
                            <p>{addr.address}</p>
                            <p>
                              {addr.city}, {addr.province} {addr.postalCode}
                            </p>
                            <p>{addr.country}</p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  {selectedOrder.notes && (
                    <div className="pt-2 border-t border-[#4D3F15]/10 font-italic text-[#4D3F15]/70">
                      <strong>Delivery note:</strong> &quot;{selectedOrder.notes}&quot;
                    </div>
                  )}
                </div>

                {/* Items List */}
                <div className="bg-white border-2 border-[#4D3F15] p-5 nubb-shadow space-y-3">
                  <h3 className="font-lekton text-xs font-bold uppercase tracking-wider text-[#892F1A]">
                    Ordered Items
                  </h3>
                  <div className="divide-y divide-[#4D3F15]/10">
                    {(JSON.parse(selectedOrder.items || "[]") as OrderItem[]).map((i, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between font-lekton font-bold">
                        <div className="flex items-center gap-3">
                          {i.image && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={i.image}
                              alt={i.name}
                              className="w-10 h-10 object-cover border border-[#4D3F15]"
                            />
                          )}
                          <div>
                            <p className="text-xs text-[#4D3F15]">{i.name}</p>
                            <p className="text-[10px] text-[#4D3F15]/60">Qty: {i.quantity}</p>
                          </div>
                        </div>
                        <div className="text-xs text-[#892F1A]">
                          ₱{(i.price * i.quantity).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[#4D3F15]/20 font-lekton text-xs font-bold flex justify-between">
                    <span>Subtotal: ₱{selectedOrder.subtotal.toLocaleString()}</span>
                    <span>Shipping: ₱{selectedOrder.shipping_fee.toLocaleString()}</span>
                    <span className="text-sm text-[#892F1A]">
                      Total: ₱{selectedOrder.total_amount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Proof of Payment Viewer */}
                <div className="bg-white border-2 border-[#4D3F15] p-5 nubb-shadow space-y-3">
                  <h3 className="font-lekton text-xs font-bold uppercase tracking-wider text-[#892F1A]">
                    Payment Verification ({selectedOrder.payment_method.toUpperCase()})
                  </h3>

                  {selectedOrder.payment_proof_url ? (
                    <div className="space-y-2">
                      <p className="font-arial text-xs text-[#4D3F15] font-bold">
                        Customer uploaded receipt:
                      </p>
                      <a
                        href={selectedOrder.payment_proof_url}
                        target="_blank"
                        rel="noreferrer"
                        className="block border-2 border-[#4D3F15] bg-[#E8E6D8]/50 p-2 hover:opacity-90 transition-opacity"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selectedOrder.payment_proof_url}
                          alt="Proof of Payment"
                          className="max-h-60 mx-auto object-contain"
                        />
                      </a>
                    </div>
                  ) : (
                    <p className="font-arial text-xs text-[#4D3F15]/60 font-bold">
                      No receipt image uploaded. (COD or Direct Manual)
                    </p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleUpdateStatus(undefined, "verified")}
                      disabled={updating || selectedOrder.payment_status === "verified"}
                      className="flex-1 py-2 bg-emerald-800 text-white font-lekton text-xs font-bold uppercase hover:bg-emerald-900 transition-colors disabled:opacity-40"
                    >
                      Mark Payment Verified
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(undefined, "failed")}
                      disabled={updating || selectedOrder.payment_status === "failed"}
                      className="px-4 py-2 bg-rose-800 text-white font-lekton text-xs font-bold uppercase hover:bg-rose-900 transition-colors disabled:opacity-40"
                    >
                      Mark Failed
                    </button>
                  </div>
                </div>

                {/* Fulfillment Status & Tracking */}
                <div className="bg-white border-2 border-[#4D3F15] p-5 nubb-shadow space-y-4">
                  <h3 className="font-lekton text-xs font-bold uppercase tracking-wider text-[#892F1A]">
                    Fulfillment Status & Tracking Number
                  </h3>

                  <div className="grid grid-cols-2 gap-2 font-lekton text-xs font-bold uppercase">
                    {["pending", "processing", "shipped", "delivered", "cancelled"].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(st)}
                        disabled={updating || selectedOrder.order_status === st}
                        className={`py-2 px-3 border-2 transition-all cursor-pointer ${
                          selectedOrder.order_status === st
                            ? "bg-[#4D3F15] text-[#E8E6D8] border-[#4D3F15]"
                            : "bg-white text-[#4D3F15] border-[#4D3F15]/40 hover:border-[#4D3F15]"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label className="font-lekton text-xs font-bold uppercase tracking-wider text-[#4D3F15] block">
                      Courier Tracking Number (LBC / J&T / Flash)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={trackingInput}
                        onChange={(e) => setTrackingInput(e.target.value)}
                        placeholder="e.g. JNT-889129482"
                        className="flex-1 px-4 py-2 bg-[#E8E6D8]/30 border-2 border-[#4D3F15] font-mono text-xs font-bold focus:outline-none"
                      />
                      <button
                        onClick={() => handleUpdateStatus(undefined, undefined, trackingInput)}
                        disabled={updating}
                        className="px-4 py-2 bg-[#4D3F15] text-[#E8E6D8] font-lekton text-xs font-bold uppercase hover:bg-[#892F1A] transition-colors"
                      >
                        Save Tracking
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-4 border-t-2 border-[#4D3F15]">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-full py-3 bg-[#4D3F15] text-[#E8E6D8] font-lekton font-bold text-sm uppercase tracking-wider hover:bg-[#892F1A] transition-colors"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
