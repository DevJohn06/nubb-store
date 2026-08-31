"use client";

import React, { useState, useEffect } from "react";
import { Layers, Plus, Minus, Check, Loader2, AlertTriangle, Search } from "lucide-react";
import { BrandLoader } from "@/components/common/BrandLoader";

interface InventoryItem {
  id: number;
  name: string;
  sku: string | null;
  category: string;
  inventory: number;
  price: number;
  status: string;
  image: string | null;
}

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inventory");
      const data = await res.json();
      if (data.inventory) {
        setItems(data.inventory);
      }
    } catch (err) {
      console.error("Failed to load inventory", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const adjustStock = async (id: number, delta: number) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, delta }),
      });

      if (res.ok) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, inventory: Math.max(0, item.inventory + delta) }
              : item
          )
        );
      }
    } catch (err) {
      console.error("Failed to update stock", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const setAbsoluteStock = async (id: number, val: number) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, absoluteStock: val }),
      });

      if (res.ok) {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, inventory: val } : item))
        );
      }
    } catch (err) {
      console.error("Failed to update stock", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredItems = items.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.sku && i.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#4D3F15] pb-4">
        <div>
          <h1 className="font-spray text-3xl sm:text-4xl text-[#4D3F15]">
            Inventory Controller
          </h1>
          <p className="font-lekton text-xs font-bold uppercase tracking-wider text-[#892F1A] mt-1">
            Real-time Studio Stock & Batch Tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-white border-2 border-[#4D3F15] font-lekton text-xs font-bold text-[#4D3F15]">
            Total Stock: {items.reduce((sum, i) => sum + i.inventory, 0)} Units
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white border-2 border-[#4D3F15] p-4 nubb-shadow flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search piece by name or SKU..."
            className="w-full pl-9 pr-4 py-2 bg-[#E8E6D8]/30 border border-[#4D3F15] font-lekton text-xs font-bold focus:outline-none focus:bg-white"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#4D3F15]/50" />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border-2 border-[#4D3F15] nubb-shadow overflow-hidden">
        {loading ? (
          <BrandLoader size="lg" label="Loading Inventory..." className="py-20" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-lekton text-xs">
              <thead>
                <tr className="bg-[#E8E6D8]/50 border-b-2 border-[#4D3F15] text-[#4D3F15] font-bold uppercase">
                  <th className="p-4">Piece</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Unit Price</th>
                  <th className="p-4">Current Stock</th>
                  <th className="p-4 text-center">Quick Adjust</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#4D3F15]/10">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#E8E6D8]/20 font-bold">
                    <td className="p-4 flex items-center gap-3">
                      {item.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 object-cover border border-[#4D3F15]"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-[#E8E6D8] border border-[#4D3F15] flex items-center justify-center">
                          <Layers className="w-4 h-4 text-[#4D3F15]/50" />
                        </div>
                      )}
                      <span className="font-bold text-sm text-[#4D3F15] line-clamp-1">
                        {item.name}
                      </span>
                    </td>
                    <td className="p-4 uppercase text-[11px] text-[#4D3F15]/80">
                      {item.category.replace("-", " ")}
                    </td>
                    <td className="p-4 font-mono text-[11px]">{item.sku || "—"}</td>
                    <td className="p-4 text-sm font-bold text-[#892F1A]">
                      ₱{item.price.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={item.inventory}
                          onChange={(e) =>
                            setAbsoluteStock(item.id, Math.max(0, parseInt(e.target.value, 10) || 0))
                          }
                          className="w-16 px-2 py-1 bg-[#E8E6D8]/40 border border-[#4D3F15] text-center font-bold text-sm"
                        />
                        {item.inventory <= 5 && (
                          <span className="text-[10px] text-rose-800 bg-rose-50 px-1.5 py-0.5 border border-rose-800 uppercase font-bold">
                            Low
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => adjustStock(item.id, -5)}
                          disabled={updatingId === item.id || item.inventory < 5}
                          className="px-2 py-1 bg-[#E8E6D8] border border-[#4D3F15] hover:bg-[#4D3F15] hover:text-[#E8E6D8] transition-colors disabled:opacity-30 cursor-pointer"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => adjustStock(item.id, -1)}
                          disabled={updatingId === item.id || item.inventory <= 0}
                          className="p-1 bg-[#E8E6D8] border border-[#4D3F15] hover:bg-[#4D3F15] hover:text-[#E8E6D8] transition-colors disabled:opacity-30 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => adjustStock(item.id, 1)}
                          disabled={updatingId === item.id}
                          className="p-1 bg-[#E8E6D8] border border-[#4D3F15] hover:bg-[#4D3F15] hover:text-[#E8E6D8] transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => adjustStock(item.id, 5)}
                          disabled={updatingId === item.id}
                          className="px-2 py-1 bg-[#E8E6D8] border border-[#4D3F15] hover:bg-[#4D3F15] hover:text-[#E8E6D8] transition-colors cursor-pointer"
                        >
                          +5
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span
                        className={`px-2 py-0.5 border text-[10px] uppercase ${
                          item.inventory > 5
                            ? "bg-emerald-50 text-emerald-800 border-emerald-800"
                            : item.inventory > 0
                            ? "bg-amber-50 text-amber-800 border-amber-800"
                            : "bg-rose-50 text-rose-800 border-rose-800"
                        }`}
                      >
                        {item.inventory > 5 ? "In Stock" : item.inventory > 0 ? "Low Stock" : "Depleted"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
