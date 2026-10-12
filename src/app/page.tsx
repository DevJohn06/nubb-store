"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Stamp } from "@/components/store/Stamp";

export default function ComingSoonPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setStatus("error");
      setMessage("Please enter your name.");
      return;
    }

    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim(), name: name.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit.");
      }

      setStatus("success");
      setMessage(data.message);
      setName("");
      setEmail("");

      // Trigger celebratory confetti burst
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#892F1A", "#640017", "#4D3F15", "#E8E6D8", "#F2BF4A"],
        });
      } catch {}
    } catch (err: unknown) {
      setStatus("error");
      const errorMsg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setMessage(errorMsg);
    }
  };

  return (
    <div className="min-h-screen w-full bg-nubb-cream text-nubb-brown flex flex-col selection:bg-nubb-orange selection:text-nubb-cream">
      {/* Top bar */}
      <header className="nubb-container h-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-dark-brown.svg?v=3" alt="NUBB" className="h-8 sm:h-9 w-auto object-contain rounded-none" />
          <span className="font-lekton text-[11px] font-bold tracking-[0.18em] uppercase">— the things we carry —</span>
        </div>
      </header>

      <main className="flex-1 nubb-container py-10 sm:py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left: manifesto */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <p className="nubb-eyebrow">Handmade studio · Coming soon</p>
          <h1 className="font-display text-[clamp(3.25rem,7vw,6.5rem)] leading-[0.92] text-balance">
            the things we carry.
          </h1>
          <span className="nubb-wave" aria-hidden="true" style={{ width: 150 }} />
          <div className="font-body text-lg leading-relaxed max-w-[44ch] space-y-3">
            <p>
              NUBB is about making small objects that become part of how you move through life. Handmade objects
              that blur the line between art and utility.
            </p>
            <p className="text-nubb-dark">
              Every piece is made by hand, shaped by instinct, and designed to be used, carried, tied, clipped,
              worn, or displayed.
            </p>
          </div>
        </motion.div>

        {/* Right: signup on the orange panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative mb-10 lg:mb-0"
        >
          <div className="bg-nubb-orange rounded-[160px_28px_28px_80px] sm:rounded-[240px_28px_28px_120px] p-6 sm:p-12 lg:p-14 flex items-center justify-center">
            <div className="nubb-surface w-full max-w-md p-7 sm:p-9 space-y-5">
              <div className="space-y-2">
                <h2 className="font-display text-[clamp(2rem,4vw,2.75rem)] leading-none">Be the first to know.</h2>
                <p className="font-lekton text-sm font-bold uppercase tracking-[0.1em] text-nubb-orange">
                  We are getting the shop ready
                </p>
                <p className="font-body text-sm text-nubb-dark">
                  Drop your email and get notified as soon as we launch.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <label htmlFor="cs-name" className="nubb-label">Name</label>
                  <input
                    id="cs-name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={status === "loading"}
                    required
                    className="nubb-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="cs-email" className="nubb-label">Email</label>
                  <input
                    id="cs-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === "loading"}
                    required
                    className="nubb-input"
                  />
                </div>
                <button type="submit" disabled={status === "loading"} className="nubb-btn-primary w-full mt-2">
                  {status === "loading" ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Notify me"
                  )}
                </button>
              </form>

              {/* Feedback Message */}
              <AnimatePresence>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    role="status"
                    className={`flex items-start gap-2 p-3.5 rounded-[12px] border-[1.5px] font-body text-sm font-bold ${
                      status === "success"
                        ? "bg-nubb-brown/10 text-nubb-brown border-nubb-brown"
                        : "bg-nubb-crimson/10 text-nubb-crimson border-nubb-crimson"
                    }`}
                  >
                    {status === "success" ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 shrink-0" />
                    )}
                    <span>{message}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <Stamp className="absolute -right-2 -bottom-10 hidden sm:block" />
        </motion.div>
      </main>
    </div>
  );
}
