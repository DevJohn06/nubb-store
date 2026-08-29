"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  id: number;
  name: string;
  slug: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
  maxInventory: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    images: string;
    category: string;
    inventory: number;
  }, quantity?: number) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nubb_cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {}
    setIsHydrated(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("nubb_cart", JSON.stringify(items));
    }
  }, [items, isHydrated]);

  const addItem = (product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    images: string;
    category: string;
    inventory: number;
  }, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      const parsedImages = typeof product.images === "string" ? JSON.parse(product.images || "[]") : product.images;
      const firstImage = Array.isArray(parsedImages) && parsedImages.length > 0 ? parsedImages[0] : "";

      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.inventory || 99);
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: newQty } : item
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          image: firstImage,
          category: product.category,
          quantity: Math.min(quantity, product.inventory || 99),
          maxInventory: product.inventory,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.min(quantity, item.maxInventory) } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
