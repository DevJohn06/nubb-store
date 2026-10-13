"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Loader2, KeyRound, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/common/AuthLayout";

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
    <AuthLayout>
      <motion.div
        animate={isShaking ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="nubb-surface p-8 sm:p-10"
      >
        <div className="space-y-2 mb-6">
          <h1 className="font-display text-3xl sm:text-4xl">Staging access</h1>
          <p className="font-lekton text-xs font-bold text-nubb-orange uppercase tracking-wider">
            Developer &amp; client preview only
          </p>
          <p className="font-body text-sm text-nubb-dark pt-1">
            Enter the developer PIN to preview the NUBB storefront.
          </p>
        </div>

        {/* PIN Form */}
        <form onSubmit={handleVerify} className="space-y-5">
          <div>
            <label className="font-lekton text-xs font-bold uppercase tracking-wider block mb-2 text-nubb-brown">
              Developer PIN
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3.5 w-5 h-5 text-nubb-brown/40" />
              <input
                type={showPin ? "text" : "password"}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError("");
                }}
                placeholder="Enter PIN (e.g. nubb2026)"
                autoFocus
                disabled={loading}
                className="nubb-input min-h-12 pl-11 pr-12 font-lekton text-lg font-bold"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3.5 top-3.5 text-nubb-brown/50 hover:text-nubb-brown cursor-pointer"
                title={showPin ? "Hide PIN" : "Show PIN"}
              >
                {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {error && (
              <p className="font-body text-xs font-bold text-nubb-crimson mt-2 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !pin}
            className="nubb-btn-primary w-full"
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

        <div className="mt-8 pt-4 border-t border-nubb-brown/20 text-center">
          <Link
            href="/"
            className="font-lekton text-xs font-bold text-nubb-brown/70 hover:text-nubb-orange transition-colors underline"
          >
            &larr; Return to Coming Soon Page
          </Link>
        </div>
      </motion.div>
    </AuthLayout>
  );
}
