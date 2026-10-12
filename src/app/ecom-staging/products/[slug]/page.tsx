"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { ShoppingBag, ArrowLeft, Check, Truck, Hand, Plus, Minus } from "lucide-react";
import { useCart } from "@/components/store/CartContext";
import { BrandLoader } from "@/components/common/BrandLoader";
import { Stamp } from "@/components/store/Stamp";
import { RelatedProducts, pickRelated } from "@/components/store/RelatedProducts";

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
  const [catalog, setCatalog] = useState<Product[]>([]);

  const { addItem } = useCart();

  useEffect(() => {
    async function loadProduct() {
      // Related items come from the full catalog; fetched alongside so the page waits once.
      fetch("/api/products")
        .then((res) => res.json())
        .then((data) => setCatalog(data.products || []))
        .catch((err) => console.error("Failed to load related products", err));

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
      <div className="nubb-surface max-w-xl mx-auto my-12 text-center py-16 px-8 space-y-4">
        <p className="nubb-eyebrow">Not found</p>
        <h1 className="font-display text-4xl leading-none">This piece has moved on.</h1>
        <p className="font-body text-[15px] text-nubb-dark">
          The piece you are looking for might have moved or been archived.
        </p>
        <Link href="/ecom-staging" className="nubb-btn-primary">
          <ArrowLeft className="w-4 h-4" />
          Back to the collection
        </Link>
      </div>
    );
  }

  const images: string[] = JSON.parse(product.images || "[]");
  const features: string[] = JSON.parse(product.features || "[]");
  const isOutOfStock = product.inventory <= 0;
  const related = pickRelated(catalog, product);
  const addRelated = (item: Product) => addItem(item, 1);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  return (
    <div className="nubb-container py-8 sm:py-12 space-y-10 sm:space-y-12">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="font-lekton text-xs font-bold uppercase tracking-[0.12em] flex items-center gap-2 text-nubb-dark"
      >
        <Link href="/ecom-staging" className="hover:text-nubb-orange transition-colors">
          Collection
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          href={`/ecom-staging?category=${product.category}`}
          className="hover:text-nubb-orange transition-colors"
        >
          {product.category.replace("-", " ")}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-nubb-brown line-clamp-1" aria-current="page">
          {product.name}
        </span>
      </nav>

      {/* Desktop: gallery + specs stack on the left, details span the right.
          Phones: gallery, details (buy), then specs, so the buy button stays near the top. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-[auto_1fr] gap-x-16 gap-y-12 items-start">
        {/* Gallery */}
        <div className="space-y-5 lg:col-start-1 lg:row-start-1">
          <div className="relative">
            <div className="relative aspect-square bg-nubb-orange rounded-[240px_28px_28px_120px] overflow-hidden flex items-center justify-center">
              {selectedImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={selectedImage} alt={product.name} className="w-full h-full object-cover rounded-none" />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src="/brand/brand-mark-cream.svg"
                  alt=""
                  className="w-1/2 h-1/2 object-contain opacity-30 rounded-none"
                />
              )}

              <div className="absolute top-5 right-5 flex flex-col items-end gap-1.5">
                {isOutOfStock ? (
                  <span className="nubb-badge bg-nubb-crimson text-nubb-cream">Sold out</span>
                ) : product.inventory <= 5 ? (
                  <span className="nubb-badge bg-nubb-cream text-nubb-orange">Only {product.inventory} left</span>
                ) : null}
                {product.is_featured ? (
                  <span className="nubb-badge bg-nubb-mustard text-nubb-brown">Featured</span>
                ) : null}
              </div>
            </div>
            <Stamp className="absolute -right-2 -bottom-7 scale-75 sm:scale-100 origin-bottom-right" />
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1" role="group" aria-label="Product images">
              {images.map((img, idx) => {
                const isActive = selectedImage === img;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    aria-pressed={isActive}
                    aria-label={`Show image ${idx + 1}`}
                    className={`w-[72px] h-[72px] shrink-0 cursor-pointer overflow-hidden rounded-[12px] border-2 bg-nubb-cream-light transition-colors ${
                      isActive ? "border-nubb-orange" : "border-nubb-brown/15 hover:border-nubb-brown"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="w-full h-full object-cover rounded-none" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-8 lg:pt-4 lg:col-start-2 lg:row-start-1 lg:row-span-2">
          <div className="space-y-4">
            <p className="nubb-eyebrow">{product.category.replace("-", " ")}</p>
            <h1 className="font-display text-[clamp(2.75rem,5vw,4rem)] leading-[0.95] text-balance">
              {product.name}
            </h1>
            <span className="nubb-wave" aria-hidden="true" style={{ width: 96 }} />
            {product.tagline && (
              <p className="font-body text-lg leading-relaxed text-nubb-dark max-w-[40ch]">{product.tagline}</p>
            )}
          </div>

          {/* Price */}
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2 font-lekton font-bold">
            <span className="text-3xl">₱{product.price.toLocaleString()}</span>
            {product.compare_at_price && (
              <>
                <span className="text-base text-nubb-dark line-through">
                  ₱{product.compare_at_price.toLocaleString()}
                </span>
                <span className="nubb-badge bg-nubb-mustard text-nubb-brown">
                  Save ₱{(product.compare_at_price - product.price).toLocaleString()}
                </span>
              </>
            )}
          </div>

          {product.description && (
            <p className="font-body text-base leading-relaxed max-w-[56ch]">{product.description}</p>
          )}

          {/* Quantity + add to bag */}
          <div className="space-y-3 pt-6 border-t border-nubb-brown/15">
            <div className="flex items-center justify-between gap-4">
              <span className="nubb-label">Quantity</span>
              {isOutOfStock ? (
                <span className="nubb-badge bg-nubb-crimson/10 text-nubb-crimson">Sold out</span>
              ) : product.inventory <= 5 ? (
                <span className="nubb-badge bg-nubb-mustard/25 text-nubb-orange">
                  {product.inventory} left in studio
                </span>
              ) : (
                <span className="nubb-badge bg-nubb-brown/10 text-nubb-brown">In stock</span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center justify-between sm:justify-start border-[1.5px] border-nubb-brown rounded-[8px] overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  aria-label="Decrease quantity"
                  className="w-12 h-12 inline-flex items-center justify-center rounded-none hover:bg-nubb-brown hover:text-nubb-cream transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-nubb-brown cursor-pointer disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="min-w-12 text-center font-lekton font-bold text-lg" aria-live="polite">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(quantity + 1, product.inventory))}
                  disabled={quantity >= product.inventory || isOutOfStock}
                  aria-label="Increase quantity"
                  className="w-12 h-12 inline-flex items-center justify-center rounded-none hover:bg-nubb-brown hover:text-nubb-cream transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-nubb-brown cursor-pointer disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button onClick={handleAddToCart} disabled={isOutOfStock} className="nubb-btn-primary flex-1">
                {addedAnimation ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                <span>
                  {isOutOfStock
                    ? "Sold out"
                    : addedAnimation
                    ? "Added to bag"
                    : `Add to bag · ₱${(product.price * quantity).toLocaleString()}`}
                </span>
              </button>
            </div>
          </div>

          <RelatedProducts
            products={related}
            onAdd={addRelated}
            className="hidden lg:block pt-10 border-t border-nubb-brown/15"
          />
        </div>

        {/* Craft specifications + trust strip */}
        <div className="space-y-6 lg:col-start-1 lg:row-start-2">
          {/* Craft specifications */}
          {features.length > 0 && (
            <div className="nubb-surface p-6 space-y-4">
              <p className="nubb-eyebrow">Craft specifications</p>
              <ul className="space-y-2.5 font-body text-[15px]">
                {features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-nubb-orange shrink-0 mt-1" strokeWidth={2.2} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Trust strip */}
          <div className="bg-nubb-brown text-nubb-cream rounded-[20px] px-6 py-5 grid grid-cols-2 gap-5">
            {[
              { icon: Hand, label: "Handmade", sub: "small batch" },
              { icon: Truck, label: "Ships from", sub: "Davao" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3.5">
                <span className="w-11 h-11 shrink-0 rounded-full border-[1.6px] border-nubb-mustard text-nubb-mustard flex items-center justify-center">
                  <Icon className="w-5 h-5" strokeWidth={1.6} />
                </span>
                <span className="font-body text-[13px] font-bold leading-snug tracking-[0.06em] uppercase">
                  {label}
                  <br />
                  {sub}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Related items on phones/tablets: after the specs */}
        <RelatedProducts products={related} onAdd={addRelated} className="lg:hidden" />
      </div>
    </div>
  );
}
