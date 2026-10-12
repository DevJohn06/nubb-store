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
      <div className="nubb-surface max-w-xl mx-auto my-12 text-center py-16 px-8 space-y-4">
        <ShoppingBag className="w-10 h-10 mx-auto text-nubb-orange" strokeWidth={1.6} />
        <h1 className="font-display text-4xl leading-none">Your bag is empty.</h1>
        <p className="font-body text-[15px] text-nubb-dark">
          Add some handcrafted pieces to your bag before checking out.
        </p>
        <Link href="/ecom-staging" className="nubb-btn-primary">
          <ArrowLeft className="w-4 h-4" />
          Explore the collection
        </Link>
      </div>
    );
  }

  const fields: {
    label: string;
    type: string;
    value: string;
    set: (v: string) => void;
    placeholder: string;
    required?: boolean;
    autoComplete?: string;
    wide?: boolean;
  }[] = [
    { label: "Full name", type: "text", value: name, set: setName, placeholder: "e.g. Juan dela Cruz", required: true, autoComplete: "name", wide: true },
    { label: "Email address", type: "email", value: email, set: setEmail, placeholder: "name@domain.com", required: true, autoComplete: "email" },
    { label: "Mobile phone", type: "tel", value: phone, set: setPhone, placeholder: "0917-XXX-XXXX", required: true, autoComplete: "tel" },
    { label: "Street address / unit / building", type: "text", value: address, set: setAddress, placeholder: "House #, Street, Barangay", required: true, autoComplete: "street-address", wide: true },
    { label: "City / municipality", type: "text", value: city, set: setCity, placeholder: "e.g. Davao City", required: true, autoComplete: "address-level2" },
    { label: "Province / region", type: "text", value: province, set: setProvince, placeholder: "e.g. Davao del Sur", required: true, autoComplete: "address-level1" },
    { label: "Postal code", type: "text", value: postalCode, set: setPostalCode, placeholder: "e.g. 8000", autoComplete: "postal-code" },
    { label: "Delivery notes", type: "text", value: notes, set: setNotes, placeholder: "Instructions for the rider" },
  ];

  return (
    <div className="nubb-container py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-6 pb-7 border-b border-nubb-brown/15">
        <div className="space-y-3.5">
          <p className="nubb-eyebrow">Checkout</p>
          <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-none">Almost yours.</h1>
          <span className="nubb-wave" aria-hidden="true" style={{ width: 96 }} />
        </div>
        <Link href="/ecom-staging" className="nubb-link inline-flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" />
          Continue browsing
        </Link>
      </div>

      {error && (
        <div
          role="alert"
          className="p-4 rounded-[12px] bg-nubb-crimson/10 border-[1.5px] border-nubb-crimson text-nubb-crimson flex items-center gap-3 font-body text-sm font-bold"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        <div className="lg:col-span-7 space-y-8">
          {/* 1. Shipping */}
          <section className="nubb-surface p-6 sm:p-8 space-y-6" aria-labelledby="checkout-shipping">
            <div className="flex items-center gap-3.5">
              <span className="w-11 h-11 shrink-0 rounded-full bg-nubb-brown text-nubb-cream font-lekton font-bold flex items-center justify-center">
                01
              </span>
              <h2 id="checkout-shipping" className="font-display text-3xl leading-none">
                Shipping
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
              {fields.map((f) => {
                const id = `checkout-${f.label.split(" ")[0].toLowerCase()}`;
                return (
                  <div key={f.label} className={`space-y-2 ${f.wide ? "sm:col-span-2" : ""}`}>
                    <label htmlFor={id} className="nubb-label">
                      {f.label}
                      {f.required && <span className="text-nubb-orange"> *</span>}
                    </label>
                    <input
                      id={id}
                      type={f.type}
                      required={f.required}
                      autoComplete={f.autoComplete}
                      value={f.value}
                      onChange={(e) => f.set(e.target.value)}
                      placeholder={f.placeholder}
                      className="nubb-input"
                    />
                  </div>
                );
              })}
            </div>
          </section>

          {/* 2. Payment */}
          <section className="nubb-surface p-6 sm:p-8 space-y-6" aria-labelledby="checkout-payment">
            <div className="flex items-center gap-3.5">
              <span className="w-11 h-11 shrink-0 rounded-full bg-nubb-brown text-nubb-cream font-lekton font-bold flex items-center justify-center">
                02
              </span>
              <h2 id="checkout-payment" className="font-display text-3xl leading-none">
                Payment
              </h2>
            </div>

            <div className="space-y-3" role="radiogroup" aria-labelledby="checkout-payment">
              {paymentMethods.map((method) => {
                const isSelected = selectedMethod === method.id;
                return (
                  <label
                    key={method.id}
                    className={`flex items-start gap-4 p-4 rounded-[12px] border-[1.5px] cursor-pointer transition-colors ${
                      isSelected
                        ? "border-nubb-orange bg-nubb-cream"
                        : "border-nubb-brown/25 hover:border-nubb-brown"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={method.id}
                      checked={isSelected}
                      onChange={() => setSelectedMethod(method.id)}
                      className="mt-1 w-4 h-4 accent-nubb-orange"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="font-body font-bold text-[15px] uppercase tracking-[0.06em]">{method.name}</div>
                      {method.account_number && (
                        <div className="font-lekton text-sm text-nubb-dark">
                          {method.account_name} · {method.account_number}
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>

            {activeMethod && (
              <div className="p-5 rounded-[12px] bg-nubb-cream space-y-4">
                <p className="nubb-eyebrow">How to pay</p>
                <p className="font-body text-[15px] leading-relaxed">
                  {activeMethod.instructions || "Please transfer the exact total."}
                </p>

                {activeMethod.qr_code_url && (
                  <div className="space-y-2">
                    <span className="nubb-label flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-nubb-orange" />
                      Scan to pay
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeMethod.qr_code_url}
                      alt={`${activeMethod.name} QR code`}
                      className="w-48 h-48 object-contain bg-nubb-cream-light border border-nubb-brown/15 rounded-[12px] p-2"
                    />
                  </div>
                )}

                {selectedMethod !== "cod" && (
                  <div className="space-y-3 pt-4 border-t border-nubb-brown/15">
                    <span className="nubb-label">Proof of payment (screenshot or receipt)</span>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="nubb-btn-secondary nubb-btn-sm">
                        {uploadingProof ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        <span>{uploadingProof ? "Uploading..." : "Upload receipt"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProofUpload}
                          className="hidden"
                          disabled={uploadingProof}
                        />
                      </label>
                      {proofUrl && (
                        <span className="nubb-badge bg-nubb-brown/10 text-nubb-brown gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          Receipt attached
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Order summary */}
        <aside className="lg:col-span-5 lg:sticky lg:top-28 space-y-4" aria-labelledby="checkout-summary">
          <div className="nubb-surface p-6 sm:p-8 space-y-6">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="checkout-summary" className="font-display text-3xl leading-none">
                Your bag
              </h2>
              <span className="font-lekton text-sm font-bold text-nubb-dark">
                {items.length} {items.length === 1 ? "piece" : "pieces"}
              </span>
            </div>

            <ul className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map((item, index) => (
                <li key={item.id} className="flex gap-3.5 items-center">
                  <div
                    className={`w-14 h-14 shrink-0 rounded-[12px] overflow-hidden flex items-center justify-center ${
                      ["bg-nubb-brown", "bg-nubb-mustard", "bg-nubb-orange"][index % 3]
                    }`}
                  >
                    {item.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={item.image} alt="" className="w-full h-full object-cover rounded-none" />
                    ) : (
                      <ShoppingBag className="w-5 h-5 text-nubb-cream/60" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-bold text-sm uppercase tracking-[0.06em] line-clamp-1">{item.name}</p>
                    <p className="font-lekton text-xs font-bold text-nubb-dark">Qty {item.quantity}</p>
                  </div>
                  <div className="font-lekton font-bold">₱{(item.price * item.quantity).toLocaleString()}</div>
                </li>
              ))}
            </ul>

            <dl className="space-y-2.5 pt-5 font-lekton text-sm font-bold border-t border-nubb-brown/15">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd>₱{subtotal.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt>Shipping</dt>
                <dd>
                  {shippingFee === 0 ? (
                    <span className="nubb-badge bg-nubb-mustard text-nubb-brown">Free</span>
                  ) : (
                    `₱${shippingFee.toLocaleString()}`
                  )}
                </dd>
              </div>
              {shippingFee > 0 && (
                <p className="font-body text-[13px] font-normal text-nubb-dark">
                  Free shipping on orders over ₱2,000.
                </p>
              )}
              <div className="flex justify-between items-baseline pt-4 mt-1 border-t border-nubb-brown/15">
                <dt className="uppercase tracking-[0.1em]">Total</dt>
                <dd className="text-2xl">₱{total.toLocaleString()}</dd>
              </div>
            </dl>

            <button type="submit" disabled={loading} className="nubb-btn-primary w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Placing order...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Place order · ₱{total.toLocaleString()}
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-3 px-2 font-body text-[13px] text-nubb-dark">
            <Truck className="w-4 h-4 text-nubb-orange shrink-0" />
            <span>Packed by hand and shipped from our Davao studio.</span>
          </div>
        </aside>
      </form>
    </div>
  );
}
