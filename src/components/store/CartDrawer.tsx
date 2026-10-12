"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart } from "./CartContext";

export function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, subtotal, totalCount } =
    useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-nubb-brown/60 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-screen max-w-md bg-nubb-cream border-l-4 border-nubb-brown text-nubb-brown flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b-2 border-nubb-brown flex items-center justify-between bg-nubb-cream">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-6 h-6 text-nubb-brown" />
                  <h2 className="font-lekton font-bold text-2xl uppercase tracking-wider">
                    Your Bag ({totalCount})
                  </h2>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="nubb-btn-icon shrink-0"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                    <div className="w-16 h-16 border border-nubb-brown/15 border-dashed flex items-center justify-center bg-nubb-cream-light/40">
                      <ShoppingBag className="w-8 h-8 text-nubb-brown/50" />
                    </div>
                    <p className="font-lekton text-xl font-bold">Your bag is empty.</p>
                    <p className="font-body text-sm text-nubb-brown/80 max-w-xs">
                      Explore our handcrafted lighter covers and paracord bracelets to begin.
                    </p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 nubb-surface flex gap-4 items-center relative"
                    >
                      {item.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover border border-nubb-brown shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-nubb-cream border border-nubb-brown flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-6 h-6 text-nubb-brown/40" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/ecom-staging/products/${item.slug}`}
                          onClick={() => setIsCartOpen(false)}
                          className="font-lekton font-bold text-base hover:text-nubb-orange line-clamp-1 transition-colors block"
                        >
                          {item.name}
                        </Link>
                        <p className="font-lekton text-sm font-bold text-nubb-orange mt-0.5">
                          ₱{item.price.toLocaleString()}
                        </p>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center border border-nubb-brown bg-nubb-cream">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-nubb-brown hover:text-nubb-cream transition-colors cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 font-lekton text-sm font-bold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.maxInventory}
                              className="p-1 hover:bg-nubb-brown hover:text-nubb-cream transition-colors cursor-pointer disabled:opacity-30"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
<<<<<<< HEAD
                            className="text-nubb-brown/60 hover:text-nubb-crimson p-1 transition-colors cursor-pointer"
=======
                            className="text-[#4D3F15]/60 hover:text-[#892F1A] p-1 transition-colors cursor-pointer"
>>>>>>> refs/remotes/origin/main
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer / Subtotal & Checkout */}
              {items.length > 0 && (
                <div className="p-6 border-t-2 border-nubb-brown bg-nubb-cream space-y-4">
                  <div className="flex items-center justify-between font-lekton text-xl font-bold">
                    <span>Subtotal</span>
                    <span className="text-nubb-orange">₱{subtotal.toLocaleString()}</span>
                  </div>
                  <p className="font-body text-xs text-nubb-brown/80">
                    Shipping and taxes calculated at checkout.
                  </p>

                  <Link
                    href="/ecom-staging/checkout"
                    onClick={() => setIsCartOpen(false)}
<<<<<<< HEAD
                    className="nubb-btn-primary w-full"
=======
                    className="w-full py-4 bg-[#4D3F15] text-[#E8E6D8] font-lekton text-lg font-bold hover:bg-[#892F1A] active:bg-[#892F1A] transition-all flex items-center justify-center gap-3 nubb-shadow-hover cursor-pointer block text-center"
>>>>>>> refs/remotes/origin/main
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
