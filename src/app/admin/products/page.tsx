"use client";

import React, { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Upload,
  X,
  Check,
  Loader2,
  Search,
  ExternalLink,
  ShoppingBag,
  Layers,
} from "lucide-react";
import { BrandLoader } from "@/components/common/BrandLoader";
import { ProductMediaManager } from "@/components/admin/ProductMediaManager";

interface Product {
  id: number;
  name: string;
  slug: string;
  category: string;
  tagline: string | null;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  inventory: number;
  sku: string | null;
  images: string; // JSON
  features: string | null; // JSON
  is_featured: number;
  status: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Drawer / Modal Form State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Form inputs
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("lighter-covers");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [inventory, setInventory] = useState("10");
  const [sku, setSku] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState("active");

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openNewProduct = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setCategory("lighter-covers");
    setTagline("");
    setDescription("");
    setPrice("");
    setComparePrice("");
    setInventory("10");
    setSku("");
    setImages([]);
    setFeatures([]);
    setIsFeatured(false);
    setStatus("active");
    setFormError("");
    setIsDrawerOpen(true);
  };

  const openEditProduct = (p: Product) => {
    setEditingId(p.id);
    setName(p.name);
    setSlug(p.slug);
    setCategory(p.category);
    setTagline(p.tagline || "");
    setDescription(p.description || "");
    setPrice(String(p.price));
    setComparePrice(p.compare_at_price ? String(p.compare_at_price) : "");
    setInventory(String(p.inventory));
    setSku(p.sku || "");
    setImages(JSON.parse(p.images || "[]"));
    setFeatures(JSON.parse(p.features || "[]"));
    setIsFeatured(Boolean(p.is_featured));
    setStatus(p.status || "active");
    setFormError("");
    setIsDrawerOpen(true);
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    setFeatures((prev) => [...prev, featureInput.trim()]);
    setFeatureInput("");
  };

  const removeFeature = (index: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      setFormError("Name and price are required");
      return;
    }

    setSubmitting(true);
    setFormError("");

    const payload = {
      name,
      slug: slug || undefined,
      category,
      tagline,
      description,
      price: parseFloat(price),
      compare_at_price: comparePrice ? parseFloat(comparePrice) : null,
      inventory: parseInt(inventory, 10) || 0,
      sku,
      images,
      features,
      is_featured: isFeatured ? 1 : 0,
      status,
    };

    try {
      const url = "/api/admin/products";
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { id: editingId, ...payload } : payload;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save product");
      }

      setIsDrawerOpen(false);
      loadProducts();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save product";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to archive this product?")) return;
    try {
      await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      loadProducts();
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#4D3F15] pb-4">
        <div>
          <h1 className="font-spray text-3xl sm:text-4xl text-[#4D3F15]">Product Studio</h1>
          <p className="font-lekton text-xs font-bold uppercase tracking-wider text-[#892F1A] mt-1">
            Handcrafted Products & Cloudflare R2 Media Management
          </p>
        </div>

        <button
          onClick={openNewProduct}
          className="px-5 py-3 bg-[#4D3F15] text-[#E8E6D8] font-lekton font-bold text-sm uppercase tracking-wider hover:bg-[#892F1A] transition-colors flex items-center gap-2 nubb-shadow cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border-2 border-[#4D3F15] p-4 nubb-shadow">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products or SKU..."
            className="w-full pl-9 pr-4 py-2 bg-[#E8E6D8]/30 border border-[#4D3F15] font-lekton text-xs font-bold focus:outline-none focus:bg-white"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#4D3F15]/50" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {["all", "lighter-covers", "paracord-bracelets", "accessories"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 font-lekton text-xs font-bold uppercase border transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === cat
                  ? "bg-[#4D3F15] text-[#E8E6D8] border-[#4D3F15]"
                  : "bg-white text-[#4D3F15] border-[#4D3F15]/40 hover:border-[#4D3F15]"
              }`}
            >
              {cat.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border-2 border-[#4D3F15] nubb-shadow overflow-hidden">
        {loading ? (
          <BrandLoader size="lg" label="Loading Products..." className="py-20" />
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center font-arial text-sm font-bold text-[#4D3F15]/70">
            No products found matching your filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-lekton text-xs">
              <thead>
                <tr className="bg-[#E8E6D8]/50 border-b-2 border-[#4D3F15] text-[#4D3F15] font-bold uppercase">
                  <th className="p-4">Piece</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#4D3F15]/10">
                {filteredProducts.map((p) => {
                  const imgs = JSON.parse(p.images || "[]");
                  const mainImg = imgs[0] || "";

                  return (
                    <tr key={p.id} className="hover:bg-[#E8E6D8]/20 font-bold">
                      <td className="p-4 flex items-center gap-3">
                        {mainImg ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={mainImg}
                            alt={p.name}
                            className="w-12 h-12 object-cover border border-[#4D3F15]"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-[#E8E6D8] border border-[#4D3F15] flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-[#4D3F15]/40" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-sm text-[#4D3F15] line-clamp-1">{p.name}</p>
                          {p.is_featured ? (
                            <span className="text-[10px] bg-[#892F1A] text-white px-1.5 py-0.2 rounded-xs uppercase">
                              Featured
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="p-4 uppercase text-[11px] text-[#4D3F15]/80">
                        {p.category.replace("-", " ")}
                      </td>
                      <td className="p-4 font-mono text-[11px]">{p.sku || "—"}</td>
                      <td className="p-4 text-sm font-bold text-[#892F1A]">
                        ₱{p.price.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 border text-xs ${
                            p.inventory <= 5
                              ? "bg-rose-100 text-rose-900 border-rose-800"
                              : "bg-emerald-50 text-emerald-900 border-emerald-800"
                          }`}
                        >
                          {p.inventory} units
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 border text-[10px] uppercase ${
                            p.status === "active"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-800"
                              : "bg-amber-50 text-amber-800 border-amber-800"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openEditProduct(p)}
                          className="p-1.5 bg-[#E8E6D8] border border-[#4D3F15] hover:bg-[#4D3F15] hover:text-[#E8E6D8] transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 bg-[#E8E6D8] border border-[#4D3F15] hover:bg-[#892F1A] hover:text-[#E8E6D8] hover:border-[#892F1A] transition-colors cursor-pointer"
                          title="Archive Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-Over Drawer / Modal for Add & Edit Product */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-[#4D3F15]/60 backdrop-blur-xs"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-2xl bg-[#E8E6D8] border-l-4 border-[#4D3F15] p-6 sm:p-8 flex flex-col justify-between overflow-y-auto shadow-2xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b-2 border-[#4D3F15] pb-4">
                  <h2 className="font-spray text-2xl text-[#4D3F15]">
                    {editingId ? "Edit Product" : "Add New Product"}
                  </h2>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 border-2 border-[#4D3F15] bg-white hover:bg-[#892F1A] hover:text-[#E8E6D8] transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {formError && (
                  <div className="p-3 bg-rose-100 border border-rose-800 text-rose-900 font-arial text-xs font-bold">
                    {formError}
                  </div>
                )}

                <form id="productForm" onSubmit={handleSaveProduct} className="space-y-6 font-arial text-sm font-bold">
                  {/* Name & Slug */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-lekton text-xs uppercase tracking-wider text-[#4D3F15]">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Obsidian Tactile Lighter Cover"
                        className="w-full px-4 py-2.5 bg-white border-2 border-[#4D3F15] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-lekton text-xs uppercase tracking-wider text-[#4D3F15]">
                        Category *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border-2 border-[#4D3F15] font-lekton focus:outline-none"
                      >
                        <option value="lighter-covers">Lighter Covers</option>
                        <option value="paracord-bracelets">Paracord Bracelets</option>
                        <option value="accessories">EDC Accessories</option>
                      </select>
                    </div>
                  </div>

                  {/* Pricing & Stock */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-lekton text-xs uppercase tracking-wider text-[#4D3F15]">
                        Price (₱) *
                      </label>
                      <input
                        type="number"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="850"
                        className="w-full px-4 py-2.5 bg-white border-2 border-[#4D3F15] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-lekton text-xs uppercase tracking-wider text-[#4D3F15]">
                        Compare Price (₱)
                      </label>
                      <input
                        type="number"
                        value={comparePrice}
                        onChange={(e) => setComparePrice(e.target.value)}
                        placeholder="1100"
                        className="w-full px-4 py-2.5 bg-white border-2 border-[#4D3F15] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-lekton text-xs uppercase tracking-wider text-[#4D3F15]">
                        Studio Stock *
                      </label>
                      <input
                        type="number"
                        required
                        value={inventory}
                        onChange={(e) => setInventory(e.target.value)}
                        placeholder="15"
                        className="w-full px-4 py-2.5 bg-white border-2 border-[#4D3F15] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* SKU & Tagline */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-lekton text-xs uppercase tracking-wider text-[#4D3F15]">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        placeholder="NUBB-LC-01"
                        className="w-full px-4 py-2.5 bg-white border-2 border-[#4D3F15] font-mono focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-lekton text-xs uppercase tracking-wider text-[#4D3F15]">
                        Short Tagline
                      </label>
                      <input
                        type="text"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        placeholder="Heavyweight sculpted grip case..."
                        className="w-full px-4 py-2.5 bg-white border-2 border-[#4D3F15] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Cloudflare R2 Product Media Manager */}
                  <ProductMediaManager images={images} onChange={setImages} />

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="font-lekton text-xs uppercase tracking-wider text-[#4D3F15]">
                      Full Description
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Handmade objects that blur the line between art and utility..."
                      className="w-full px-4 py-2.5 bg-white border-2 border-[#4D3F15] focus:outline-none"
                    />
                  </div>

                  {/* Craft Specifications list */}
                  <div className="space-y-2">
                    <label className="font-lekton text-xs uppercase tracking-wider text-[#4D3F15] block">
                      Craft Specifications / Bullet Features
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addFeature();
                          }
                        }}
                        placeholder="e.g. Type III 550 Mil-Spec Nylon"
                        className="flex-1 px-4 py-2 bg-white border-2 border-[#4D3F15] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={addFeature}
                        className="px-4 py-2 bg-[#4D3F15] text-[#E8E6D8] font-lekton font-bold text-xs uppercase hover:bg-[#892F1A] transition-colors cursor-pointer"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {features.map((feat, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-white border border-[#4D3F15] font-lekton text-xs flex items-center gap-1.5"
                        >
                          <span>{feat}</span>
                          <button
                            type="button"
                            onClick={() => removeFeature(idx)}
                            className="text-red-700 hover:text-red-900"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="flex items-center gap-6 pt-2 font-lekton text-xs uppercase">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="accent-[#892F1A] w-4 h-4"
                      />
                      <span>Featured Carry</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={status === "active"}
                        onChange={(e) => setStatus(e.target.checked ? "active" : "draft")}
                        className="accent-[#892F1A] w-4 h-4"
                      />
                      <span>Active on Storefront</span>
                    </label>
                  </div>
                </form>
              </div>

              {/* Drawer Action Buttons */}
              <div className="pt-6 border-t-2 border-[#4D3F15] flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex-1 py-3 bg-white border-2 border-[#4D3F15] font-lekton font-bold text-sm uppercase hover:bg-[#E8E6D8] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="productForm"
                  disabled={submitting}
                  className="flex-1 py-3 bg-[#4D3F15] text-[#E8E6D8] font-lekton font-bold text-sm uppercase tracking-wider hover:bg-[#892F1A] transition-all flex items-center justify-center gap-2 nubb-shadow cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{editingId ? "Update Product" : "Save Product"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
