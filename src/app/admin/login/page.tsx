"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, User, KeyRound, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid username or password");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to sign in.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#E8E6D8] text-[#4D3F15] flex flex-col items-center justify-center p-6 selection:bg-[#892F1A] selection:text-[#E8E6D8]">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white border-3 border-[#4D3F15] p-8 sm:p-10 nubb-shadow-lg space-y-6"
      >
        {/* Header & Emblem */}
        <div className="flex flex-col items-center text-center space-y-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/brand-mark.svg?v=3"
              alt="NUBB"
              className="w-full h-full object-contain"
            />
          </motion.div>

          <div>
            <h1 className="font-spray text-3xl sm:text-4xl text-[#4D3F15]">Admin Portal</h1>
            <p className="font-lekton text-xs font-bold text-[#892F1A] uppercase tracking-wider mt-1">
              Secure Operations & Management
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border-2 border-[#640017] text-[#640017] flex items-center gap-2 font-arial text-xs font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-lekton text-xs font-bold uppercase tracking-wider text-[#4D3F15]">
              Username or Email
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin or admin@nubb.store"
                className="w-full pl-10 pr-4 py-3 bg-[#E8E6D8]/30 border-2 border-[#4D3F15] font-lekton text-sm font-bold text-[#4D3F15] focus:outline-none focus:bg-white placeholder-[#4D3F15]/40"
              />
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-[#4D3F15]/50" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-lekton text-xs font-bold uppercase tracking-wider text-[#4D3F15]">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 bg-[#E8E6D8]/30 border-2 border-[#4D3F15] font-lekton text-sm font-bold text-[#4D3F15] focus:outline-none focus:bg-white placeholder-[#4D3F15]/40"
              />
              <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-[#4D3F15]/50" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#4D3F15] text-[#E8E6D8] font-lekton text-base font-bold uppercase tracking-wider hover:bg-[#892F1A] active:bg-[#640017] transition-all flex items-center justify-center gap-2 nubb-shadow-hover cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                <span>Sign In to Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-3 border-t border-[#4D3F15]/20 text-center font-lekton text-xs text-[#4D3F15]/60 font-bold space-y-1">
          <p>Default credentials: <code>admin</code> / <code>nubb@admin2026</code></p>
          <p>
            <a href="/ecom-staging" className="text-[#892F1A] hover:underline">
              &larr; Return to Staging Store
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
