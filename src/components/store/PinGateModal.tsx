"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Loader2, KeyRound, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export function PinGateModal() {
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
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
      if (res.ok && (data.success || data.valid)) {
        // Successfully set cookie via api, refresh and reload to immediately unlock
        router.refresh();
        window.location.reload();
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
<<<<<<< HEAD
    <div className="min-h-screen w-full bg-nubb-cream text-nubb-brown flex flex-col items-center justify-center p-6 selection:bg-nubb-orange selection:text-nubb-cream">
=======
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-arial">
>>>>>>> refs/remotes/origin/main
      <motion.div
        animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md nubb-surface p-8"
      >
        <div className="flex items-center justify-center w-14 h-14 bg-[#E8E6D8] border-2 border-[#4D3F15] mx-auto mb-5 rounded-full">
          <Lock className="w-7 h-7 text-[#892F1A]" />
        </div>

<<<<<<< HEAD
          <div className="space-y-1">
            <h1 className="font-display text-3xl sm:text-4xl text-nubb-brown tracking-wide">
              Staging Access
            </h1>
            <p className="font-lekton text-sm font-bold text-nubb-orange uppercase tracking-wider">
              Developer & Client Preview Only
            </p>
          </div>
          <p className="font-body text-sm text-nubb-brown/80">
            Please enter the designated developer PIN to preview the NUBB e-commerce staging environment.
          </p>
        </div>

        {/* PIN Form */}
        <form onSubmit={handleVerify} className="space-y-5">
          <div>
            <label className="font-lekton text-xs font-bold uppercase tracking-wider block mb-2 text-nubb-brown">
              Developer PIN
            </label>
=======
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
>>>>>>> refs/remotes/origin/main
            <div className="relative">
              <KeyRound className="w-5 h-5 absolute left-3.5 top-3.5 text-[#4D3F15]/40" />
              <input
                type={showPin ? "text" : "password"}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter staging PIN (e.g. nubb2026)"
                autoFocus
                disabled={loading}
<<<<<<< HEAD
                className="nubb-input min-h-12 font-lekton text-lg font-bold"
              />
              <KeyRound className="absolute right-3.5 top-3.5 w-5 h-5 text-nubb-brown/50" />
            </div>
            {error && (
              <p className="font-body text-xs font-bold text-nubb-crimson mt-2 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 shrink-0" />
=======
                className="w-full pl-11 pr-12 py-3.5 bg-[#E8E6D8]/40 border-2 border-[#4D3F15] font-lekton text-base sm:text-lg font-bold text-[#4D3F15] focus:outline-none focus:bg-white placeholder-[#4D3F15]/40 rounded-[10px]"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3.5 top-3.5 text-[#4D3F15]/50 hover:text-[#4D3F15] cursor-pointer"
                title={showPin ? "Hide PIN" : "Show PIN"}
              >
                {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {error && (
              <p className="font-lekton text-xs font-bold text-[#892F1A] mt-1 text-center">
>>>>>>> refs/remotes/origin/main
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !pin}
<<<<<<< HEAD
            className="nubb-btn-primary w-full"
=======
            className="w-full py-4 bg-[#4D3F15] text-[#E8E6D8] font-lekton text-base sm:text-lg font-bold hover:bg-[#892F1A] active:bg-[#892F1A] transition-all flex items-center justify-center gap-3 nubb-shadow-hover cursor-pointer disabled:opacity-50 rounded-[10px]"
>>>>>>> refs/remotes/origin/main
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

<<<<<<< HEAD
        <div className="mt-8 pt-4 border-t border-nubb-brown/20 text-center">
          <a
=======
        <div className="mt-8 pt-4 border-t border-[#4D3F15]/20 text-center">
          <Link
>>>>>>> refs/remotes/origin/main
            href="/"
            className="font-lekton text-xs font-bold text-nubb-brown/70 hover:text-nubb-orange transition-colors underline"
          >
            &larr; Return to Coming Soon Page
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
