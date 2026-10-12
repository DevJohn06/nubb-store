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
    <div className="min-h-screen w-full bg-nubb-cream text-nubb-brown flex flex-col items-center justify-center p-6 selection:bg-nubb-orange selection:text-nubb-cream">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md nubb-surface p-8 sm:p-10 space-y-6"
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
            <h1 className="font-display text-3xl sm:text-4xl text-nubb-brown">Admin Portal</h1>
            <p className="font-lekton text-xs font-bold text-nubb-orange uppercase tracking-wider mt-1">
              Secure Operations & Management
            </p>
          </div>
        </div>

        {error && (
<<<<<<< HEAD
          <div className="p-3 rounded-[12px] bg-nubb-crimson/10 border-[1.5px] border-nubb-crimson text-nubb-crimson flex items-center gap-2 font-body text-xs font-bold">
=======
          <div className="p-3 bg-rose-50 border-2 border-[#892F1A] text-[#892F1A] flex items-center gap-2 font-arial text-xs font-bold rounded-[10px]">
>>>>>>> refs/remotes/origin/main
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-lekton text-xs font-bold uppercase tracking-wider text-nubb-brown">
              Username or Email
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin or admin@nubb.store"
                className="nubb-input pl-10 font-lekton font-bold"
              />
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-nubb-brown/50" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-lekton text-xs font-bold uppercase tracking-wider text-nubb-brown">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="nubb-input pl-10 font-lekton font-bold"
              />
              <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-nubb-brown/50" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
<<<<<<< HEAD
            className="nubb-btn-primary w-full mt-2"
=======
            className="w-full py-3.5 bg-[#4D3F15] text-[#E8E6D8] font-lekton text-sm font-bold hover:bg-[#892F1A] active:bg-[#892F1A] transition-all flex items-center justify-center gap-2 nubb-shadow cursor-pointer disabled:opacity-50 mt-2 rounded-[10px]"
>>>>>>> refs/remotes/origin/main
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

        <div className="pt-3 border-t border-nubb-brown/20 text-center font-lekton text-xs text-nubb-brown/60 font-bold space-y-1">
          <p>Default credentials: <code>admin</code> / <code>nubb@admin2026</code></p>
          <p>
            <a href="/ecom-staging" className="text-nubb-orange hover:underline">
              &larr; Return to Staging Store
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
