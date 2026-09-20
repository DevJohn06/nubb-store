"use client";

import React, { useState } from "react";
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
      if (!res.ok) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        setError(data.error || "Incorrect PIN");
        setLoading(false);
        return;
      }

      // Success! Refresh page to render staging storefront
      router.refresh();
      window.location.reload();
    } catch {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setError("Verification failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#E8E6D8] text-[#4D3F15] flex flex-col items-center justify-center p-6 selection:bg-[#892F1A] selection:text-[#E8E6D8]">
      <motion.div
        animate={isShaking ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-[#FFFFFF] border-3 border-[#4D3F15] p-8 nubb-shadow-lg rounded-[10px]"
      >
        {/* Emblem & Title */}
        <div className="flex flex-col items-center text-center space-y-4 mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/brand-mark.svg?v=3"
              alt="NUBB"
              className="w-full h-full object-contain"
            />
          </motion.div>

          <div className="space-y-1">
            <h1 className="font-spray text-3xl sm:text-4xl text-[#4D3F15] tracking-wide">
              Staging Access
            </h1>
            <p className="font-lekton text-sm font-bold text-[#892F1A] uppercase tracking-wider">
              Developer & Client Preview Only
            </p>
          </div>
          <p className="font-arial text-sm text-[#4D3F15]/80">
            Please enter the designated developer PIN to preview the NUBB e-commerce staging environment.
          </p>
        </div>

        {/* PIN Form */}
        <form onSubmit={handleVerify} className="space-y-5">
          <div>
            <label className="font-lekton text-xs font-bold uppercase tracking-wider block mb-2 text-[#4D3F15]">
              Developer PIN
            </label>
            <div className="relative">
              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError("");
                }}
                placeholder="Enter PIN (e.g. nubb2026)"
                autoFocus
                disabled={loading}
                className="w-full px-4 py-3.5 bg-[#E8E6D8]/40 border-2 border-[#4D3F15] font-lekton text-lg font-bold text-[#4D3F15] focus:outline-none focus:bg-white placeholder-[#4D3F15]/40 rounded-[10px]"
              />
              <KeyRound className="absolute right-3.5 top-3.5 w-5 h-5 text-[#4D3F15]/50" />
            </div>
            {error && (
              <p className="font-arial text-xs font-bold text-[#640017] mt-2 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !pin}
            className="w-full py-4 bg-[#4D3F15] text-[#E8E6D8] font-lekton text-base sm:text-lg font-bold hover:bg-[#892F1A] active:bg-[#640017] transition-all flex items-center justify-center gap-3 nubb-shadow-hover cursor-pointer disabled:opacity-50 rounded-[10px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                Unlock Storefront
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-[#4D3F15]/20 text-center">
          <a
            href="/"
            className="font-lekton text-xs font-bold text-[#4D3F15]/70 hover:text-[#892F1A] transition-colors underline"
          >
            &larr; Return to Coming Soon Page
          </a>
        </div>
      </motion.div>
    </div>
  );
}
