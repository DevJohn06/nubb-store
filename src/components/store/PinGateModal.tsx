"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Loader2, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";

export function PinGateModal() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/staging/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();
      if (data.valid) {
        // Successfully set cookie via api, refresh/redirect
        router.refresh();
      } else {
        setError(data.error || "Incorrect access PIN");
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      }
    } catch {
      setError("Failed to verify PIN. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-arial">
      <motion.div
        animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-[#F6F5EE] border-3 border-[#4D3F15] p-6 sm:p-8 nubb-shadow-lg text-[#4D3F15]"
      >
        <div className="flex items-center justify-center w-14 h-14 bg-[#E8E6D8] border-2 border-[#4D3F15] mx-auto mb-5 rounded-full">
          <Lock className="w-7 h-7 text-[#892F1A]" />
        </div>

        <div className="text-center mb-6">
          <h2 className="font-spray text-3xl sm:text-4xl text-[#4D3F15] tracking-wide mb-2">
            Staging Access
          </h2>
          <p className="font-lekton text-xs uppercase tracking-wider text-[#4D3F15]/70 font-bold max-w-xs mx-auto">
            This storefront is currently password protected. Enter the admin PIN to explore the catalog.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <KeyRound className="w-5 h-5 absolute left-3.5 top-3 text-[#4D3F15]/40" />
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter 4 or 6-digit PIN"
                autoFocus
                className="w-full pl-11 pr-4 py-2.5 bg-white border-2 border-[#4D3F15] font-lekton font-bold text-sm tracking-widest text-[#4D3F15] placeholder-[#4D3F15]/30 focus:outline-none focus:ring-2 focus:ring-[#892F1A]"
              />
            </div>
            {error && (
              <p className="font-lekton text-xs font-bold text-[#892F1A] mt-1 text-center">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !pin}
            className="w-full py-3 bg-[#4D3F15] text-[#E8E6D8] font-lekton text-xs font-bold uppercase tracking-wider hover:bg-[#892F1A] transition-colors flex items-center justify-center gap-2 cursor-pointer nubb-shadow disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                Unlock Storefront
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-[#4D3F15]/20 text-center">
          <Link
            href="/"
            className="font-lekton text-xs font-bold text-[#4D3F15]/70 hover:text-[#892F1A] transition-colors underline"
          >
            &larr; Return to Coming Soon Page
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
