"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowLeft, Check, Shield, Truck, Flame, Plus, Minus } from "lucide-react";
import { useCart } from "@/components/store/CartContext";
import { BrandLoader } from "@/components/common/BrandLoader";

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
  images: string;
  features: string | null;
  is_featured: number;
  status: string;
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const { addItem } = useCart();

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`/api/products/${slug}`);
        const data = await res.json();
        if (data.product) {
          setProduct(data.product);
          const images = JSON.parse(data.product.images || "[]");
          if (images.length > 0) {
            setSelectedImage(images[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load product", err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (loading) {
    return <BrandLoader size="lg" label="Loading Product..." className="py-24" />;
  }

  if (!product) {
    return (
      <div className="py-20 text-center space-y-4 bg-white border-2 border-[#4D3F15] p-8">
        <h2 className="font-spray text-3xl">Product Not Found</h2>
        <p className="font-arial text-sm text-[#4D3F15]/80">
          The piece you are looking for might have moved or been archived.
        </p>
        <Link
          href="/ecom-staging"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#4D3F15] text-[#E8E6D8] font-lekton font-bold text-sm hover:bg-[#892F1A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalog
        </Link>
      </div>
    );
  }

  const images: string[] = JSON.parse(product.images || "[]");
  const features: string[] = JSON.parse(product.features || "[]");
  const isOutOfStock = product.inventory <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="font-lekton text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-[#4D3F15]/70">
        <Link href="/ecom-staging" className="hover:text-[#892F1A] transition-colors">
          Catalog
        </Link>
        <span>/</span>
        <Link
          href={`/ecom-staging?category=${product.category}`}
          className="hover:text-[#892F1A] transition-colors"
        >
          {product.category.replace("-", " ")}
        </Link>
        <span>/</span>
        <span className="text-[#4D3F15] line-clamp-1">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Column: Image Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="border-3 border-[#4D3F15] bg-[#FFFFFF] aspect-square overflow-hidden nubb-shadow-lg relative">
            {selectedImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#E8E6D8]">
                <ShoppingBag className="w-16 h-16 text-[#4D3F15]/40" />
              </div>
            )}

            {product.inventory > 0 && product.inventory <= 5 && (
              <div className="absolute top-4 left-4 bg-[#892F1A] text-[#E8E6D8] font-lekton text-xs font-bold px-3 py-1.5 uppercase tracking-wider">
                Limited Batch: Only {product.inventory} Available
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 border-2 shrink-0 cursor-pointer overflow-hidden transition-all ${
                    selectedImage === img
                      ? "border-[#892F1A] scale-105 nubb-shadow"
                      : "border-[#4D3F15] opacity-70 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Order Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FFFFFF] border-3 border-[#4D3F15] p-6 sm:p-8 nubb-shadow-lg space-y-6">
            <div>
              <div className="font-lekton text-xs font-bold text-[#892F1A] uppercase tracking-widest mb-1">
                {product.category.replace("-", " ")}
              </div>
              <h1 className="font-spray text-3xl sm:text-4xl text-[#4D3F15] leading-tight">
                {product.name}
              </h1>
              {product.tagline && (
                <p className="font-arial font-bold text-sm text-[#4D3F15]/80 mt-2">
                  {product.tagline}
                </p>
              )}
            </div>

            {/* Price Box */}
            <div className="flex items-baseline gap-3 p-4 bg-[#E8E6D8]/50 border-2 border-[#4D3F15]">
              <span className="font-lekton font-bold text-3xl text-[#4D3F15]">
                ₱{product.price.toLocaleString()}
              </span>
              {product.compare_at_price && (
                <span className="font-lekton text-base text-[#4D3F15]/50 line-through">
                  ₱{product.compare_at_price.toLocaleString()}
                </span>
              )}
              {product.compare_at_price && (
                <span className="ml-auto font-lekton text-xs font-bold text-[#892F1A] uppercase">
                  Save ₱{(product.compare_at_price - product.price).toLocaleString()}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="font-arial text-sm text-[#4D3F15] leading-relaxed font-bold space-y-2">
                <p>{product.description}</p>
              </div>
            )}

            {/* Features Bullet List */}
            {features.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#4D3F15]/20">
                <h3 className="font-lekton text-xs font-bold uppercase tracking-wider text-[#892F1A]">
                  Craft Specifications
                </h3>
                <ul className="space-y-1.5 font-arial text-xs text-[#4D3F15] font-bold">
                  {features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#892F1A] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity Selector & Add to Bag */}
            <div className="space-y-4 pt-4 border-t-2 border-[#4D3F15]">
              <div className="flex items-center justify-between">
                <span className="font-lekton text-xs font-bold uppercase tracking-wider">
                  Quantity
                </span>
                <span className="font-lekton text-xs font-bold text-[#4D3F15]/70">
                  {product.inventory > 0 ? `${product.inventory} pieces in studio` : "Out of Stock"}
                </span>
              </div>

              <div className="flex gap-4">
                {/* Quantity adjuster */}
                <div className="flex items-center border-2 border-[#4D3F15] bg-[#E8E6D8]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="p-3 hover:bg-[#4D3F15] hover:text-[#E8E6D8] transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-5 font-lekton font-bold text-base">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(quantity + 1, product.inventory))}
                    disabled={quantity >= product.inventory || isOutOfStock}
                    className="p-3 hover:bg-[#4D3F15] hover:text-[#E8E6D8] transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Bag Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-1 py-3.5 px-6 bg-[#4D3F15] text-[#E8E6D8] font-lekton font-bold text-base uppercase tracking-wider hover:bg-[#892F1A] active:bg-[#640017] transition-all flex items-center justify-center gap-2.5 nubb-shadow-hover cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>
                    {isOutOfStock
                      ? "Sold Out"
                      : addedAnimation
                      ? "Added to Carry!"
                      : `Add to Bag • ₱${(product.price * quantity).toLocaleString()}`}
                  </span>
                </button>
              </div>
            </div>

            {/* Studio Guarantee Badges */}
            <div className="pt-4 grid grid-cols-2 gap-3 border-t border-[#4D3F15]/20 font-lekton text-xs font-bold text-[#4D3F15]/80">
              <div className="flex items-center gap-2 p-2.5 bg-[#E8E6D8]/40 border border-[#4D3F15]">
                <Flame className="w-4 h-4 text-[#892F1A] shrink-0" />
                <span>Handmade Batch</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-[#E8E6D8]/40 border border-[#4D3F15]">
                <Truck className="w-4 h-4 text-[#4D3F15] shrink-0" />
                <span>Fast Dispatch</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
