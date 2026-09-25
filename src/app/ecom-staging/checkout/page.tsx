"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/store/CartContext";
import {
  ShoppingBag,
  ArrowLeft,
  Lock,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Truck,
  QrCode,
  CreditCard,
} from "lucide-react";

interface PaymentMethod {
  id: string;
  name: string;
  account_name: string | null;
  account_number: string | null;
  instructions: string | null;
  qr_code_url: string | null;
  is_active: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>("gcash");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofUrl, setProofUrl] = useState<string>("");

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("Davao del Sur");
  const [postalCode, setPostalCode] = useState("");
  const [notes, setNotes] = useState("");

  const shippingFee = subtotal >= 2000 ? 0 : 120;
  const total = subtotal + shippingFee;

  useEffect(() => {
    async function loadPaymentMethods() {
      try {
        const res = await fetch("/api/admin/payment-methods");
        const data = await res.json();
        if (data.paymentMethods && data.paymentMethods.length > 0) {
          setPaymentMethods(data.paymentMethods.filter((m: PaymentMethod) => m.is_active));
          setSelectedMethod(data.paymentMethods[0].id);
        }
      } catch (err) {
        console.error("Failed to load payment methods", err);
      }
    }
    loadPaymentMethods();
  }, []);

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProof(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("purpose", "payment_proof");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload proof of payment.");
      }

      setProofUrl(data.url);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to upload payment proof receipt.";
      setError(message);
    } finally {
      setUploadingProof(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }

    if (!name || !email || !address || !city) {
      setError("Please complete all required shipping fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        shipping_address: {
          address,
          city,
          province,
          postalCode,
          country: "Philippines",
        },
        items: items.map((i) => ({
          productId: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
        payment_method: selectedMethod,
        payment_proof_url: proofUrl || undefined,
        notes,
      };

      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process order. Please try again.");
      }

      clearCart();
      router.push(`/ecom-staging/order-success/${data.orderId}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please check your details.";
      setError(message);
      setLoading(false);
    }
  };

  const activeMethod = paymentMethods.find((m) => m.id === selectedMethod);

  if (items.length === 0) {
    return (
      <div className="py-20 max-w-xl mx-auto text-center bg-white border-3 border-[#4D3F15] p-8 nubb-shadow-lg space-y-4">
        <ShoppingBag className="w-12 h-12 mx-auto text-[#4D3F15]/40" />
        <h2 className="font-spray text-3xl">Your Bag is Empty</h2>
        <p className="font-arial text-sm text-[#4D3F15]/80">
          Add some handcrafted items to your carry before checking out.
        </p>
        <Link
          href="/ecom-staging"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#4D3F15] text-[#E8E6D8] font-lekton font-bold text-sm hover:bg-[#892F1A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Explore Storefront
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-[#4D3F15] pb-4">
        <div>
          <h1 className="font-spray text-3xl sm:text-4xl text-[#4D3F15]">Secure Checkout</h1>
          <p className="font-lekton text-xs font-bold text-[#892F1A] uppercase tracking-wider mt-1">
            Studio Order Dispatch
          </p>
        </div>
        <Link
          href="/ecom-staging"
          className="font-lekton text-xs font-bold text-[#4D3F15]/80 hover:text-[#892F1A] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Browsing
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border-2 border-[#892F1A] text-[#892F1A] flex items-center gap-3 font-arial text-sm font-bold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Shipping & Payment (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. Customer & Shipping Details */}
          <div className="bg-white border-3 border-[#4D3F15] p-6 sm:p-8 nubb-shadow space-y-6">
            <div className="flex items-center gap-2 font-lekton text-lg font-bold border-b border-[#4D3F15]/20 pb-3 uppercase">
              <Truck className="w-5 h-5 text-[#892F1A]" />
              <span>1. Shipping Destination</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-arial text-sm font-bold">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="font-lekton text-xs uppercase tracking-wider text-[#4D3F15]">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Torralba"
                  className="w-full px-4 py-3 bg-[#E8E6D8]/30 border-2 border-[#4D3F15] focus:outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-lekton text-xs uppercase tracking-wider text-[#4D3F15]">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full px-4 py-3 bg-[#E8E6D8]/30 border-2 border-[#4D3F15] focus:outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-lekton text-xs uppercase tracking-wider text-[#4D3F15]">
                  Mobile Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0917-XXX-XXXX"
                  className="w-full px-4 py-3 bg-[#E8E6D8]/30 border-2 border-[#4D3F15] focus:outline-none focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="font-lekton text-xs uppercase tracking-wider text-[#4D3F15]">
                  Street Address / Unit / Building *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House #, Street, Barangay"
                  className="w-full px-4 py-3 bg-[#E8E6D8]/30 border-2 border-[#4D3F15] focus:outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-lekton text-xs uppercase tracking-wider text-[#4D3F15]">
                  City / Municipality *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Davao City / Makati"
                  className="w-full px-4 py-3 bg-[#E8E6D8]/30 border-2 border-[#4D3F15] focus:outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-lekton text-xs uppercase tracking-wider text-[#4D3F15]">
                  Province / Region *
                </label>
                <input
                  type="text"
                  required
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="e.g. Davao del Sur / Metro Manila"
                  className="w-full px-4 py-3 bg-[#E8E6D8]/30 border-2 border-[#4D3F15] focus:outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-lekton text-xs uppercase tracking-wider text-[#4D3F15]">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="e.g. 1100"
                  className="w-full px-4 py-3 bg-[#E8E6D8]/30 border-2 border-[#4D3F15] focus:outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-lekton text-xs uppercase tracking-wider text-[#4D3F15]">
                  Delivery Instructions / Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special instructions for rider"
                  className="w-full px-4 py-3 bg-[#E8E6D8]/30 border-2 border-[#4D3F15] focus:outline-none focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* 2. Payment Method Selector */}
          <div className="bg-white border-3 border-[#4D3F15] p-6 sm:p-8 nubb-shadow space-y-6">
            <div className="flex items-center gap-2 font-lekton text-lg font-bold border-b border-[#4D3F15]/20 pb-3 uppercase">
              <CreditCard className="w-5 h-5 text-[#892F1A]" />
              <span>2. Payment Option</span>
            </div>

            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const isSelected = selectedMethod === method.id;
                return (
                  <label
                    key={method.id}
                    className={`flex items-start gap-4 p-4 border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#892F1A] bg-[#E8E6D8]/40 nubb-shadow"
                        : "border-[#4D3F15]/40 hover:border-[#4D3F15] bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={method.id}
                      checked={isSelected}
                      onChange={() => setSelectedMethod(method.id)}
                      className="mt-1 accent-[#892F1A]"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="font-lekton font-bold text-base text-[#4D3F15]">
                        {method.name}
                      </div>
                      {method.account_number && (
                        <div className="font-mono text-xs text-[#4D3F15]/80">
                          {method.account_name} &bull; {method.account_number}
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Payment Details & Instructions */}
            {activeMethod && (
              <div className="p-5 bg-[#E8E6D8]/60 border-2 border-[#4D3F15] space-y-4">
                <h4 className="font-lekton text-xs font-bold uppercase tracking-wider text-[#892F1A]">
                  Payment Instructions
                </h4>
                <p className="font-arial text-xs font-bold leading-relaxed text-[#4D3F15]">
                  {activeMethod.instructions || "Please transfer the exact total."}
                </p>

                {activeMethod.qr_code_url && (
                  <div className="space-y-2 pt-2">
                    <span className="font-lekton text-xs font-bold flex items-center gap-1.5 text-[#4D3F15]">
                      <QrCode className="w-4 h-4 text-[#892F1A]" />
                      Scan Official Payment QR:
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeMethod.qr_code_url}
                      alt={`${activeMethod.name} QR`}
                      className="w-48 h-48 object-contain border-2 border-[#4D3F15] bg-white p-2"
                    />
                  </div>
                )}

                {/* Upload Receipt / Proof */}
                {selectedMethod !== "cod" && (
                  <div className="space-y-2 pt-3 border-t border-[#4D3F15]/20">
                    <label className="font-lekton text-xs font-bold uppercase tracking-wider block text-[#4D3F15]">
                      Attach Proof of Payment (Screenshot / Receipt)
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="px-4 py-2.5 bg-white border-2 border-[#4D3F15] text-[#4D3F15] font-lekton text-xs font-bold hover:bg-[#892F1A] hover:text-[#E8E6D8] transition-colors cursor-pointer flex items-center gap-2">
                        {uploadingProof ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <span>{uploadingProof ? "Uploading..." : "Upload Receipt"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProofUpload}
                          className="hidden"
                          disabled={uploadingProof}
                        />
                      </label>
                      {proofUrl && (
                        <span className="font-lekton text-xs text-emerald-800 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Receipt Attached!
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border-3 border-[#4D3F15] p-6 sm:p-8 nubb-shadow-lg space-y-6">
            <h3 className="font-lekton text-lg font-bold uppercase tracking-wider border-b border-[#4D3F15]/20 pb-3">
              Order Summary ({items.length} pieces)
            </h3>

            {/* Line Items */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 items-center py-2 border-b border-[#4D3F15]/10">
                  {item.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 object-cover border border-[#4D3F15] shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-[#E8E6D8] border border-[#4D3F15] flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-5 h-5 text-[#4D3F15]/40" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 font-lekton font-bold">
                    <p className="text-sm line-clamp-1 text-[#4D3F15]">{item.name}</p>
                    <p className="text-xs text-[#4D3F15]/60">Qty: {item.quantity}</p>
                  </div>
                  <div className="font-lekton font-bold text-sm text-[#892F1A]">
                    ₱{(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-2.5 pt-2 font-lekton text-sm font-bold border-t border-[#4D3F15]/20">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₱{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Standard Shipping</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-800 uppercase font-bold">FREE</span>
                  ) : (
                    `₱${shippingFee.toLocaleString()}`
                  )}
                </span>
              </div>
              {subtotal >= 2000 && (
                <p className="font-arial text-xs text-emerald-800 font-bold">
                  ✓ Qualified for Free Studio Delivery (orders over ₱2,000)
                </p>
              )}
              <div className="flex justify-between text-xl font-bold pt-3 border-t-2 border-[#4D3F15]">
                <span>Total Due</span>
                <span className="text-[#892F1A]">₱{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#4D3F15] text-[#E8E6D8] font-lekton text-lg font-bold uppercase tracking-wider hover:bg-[#892F1A] active:bg-[#892F1A] transition-all flex items-center justify-center gap-3 nubb-shadow-hover cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Securing Order...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Confirm & Place Order
                </>
              )}
            </button>

            <p className="font-arial text-xs text-center text-[#4D3F15]/70 font-bold">
              Your order is recorded instantly in the NUBB studio registry.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
