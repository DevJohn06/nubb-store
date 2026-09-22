"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

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
          colors: ["#892F1A", "#640017", "#4D3F15", "#624A41"],
        });
      } catch {}
    } catch (err: unknown) {
      setStatus("error");
      const errorMsg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setMessage(errorMsg);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#E8E6D8] text-[#4D3F15] flex items-center justify-center p-6 sm:p-12 md:p-16 lg:p-20 selection:bg-[#892F1A] selection:text-[#E8E6D8]">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-end">
        
        {/* Left Column: Brand Mark SVG, NUBB SVG Logo, Subtitle & Manifesto */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-start justify-end space-y-3"
        >
          {/* Perpetually Spinning SVG Brand Mark Emblem */}
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="cursor-pointer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/brand-mark.svg?v=3"
              alt="NUBB Brand Mark"
              className="w-32 sm:w-40 md:w-44 h-auto block"
            />
          </motion.div>

          {/* SVG NUBB Logo */}
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-dark-brown.svg?v=3"
              alt="NUBB"
              className="w-64 sm:w-80 md:w-[370px] h-auto block"
            />
          </div>

          {/* Tagline */}
          <p
            className="font-lekton font-bold tracking-wider text-[#4D3F15] lowercase"
            style={{ fontSize: "30px", lineHeight: "1.1" }}
          >
            the things we carry.
          </p>

          {/* Brand Manifesto Paragraph */}
          <div className="font-arial text-sm sm:text-base md:text-lg text-[#4D3F15] leading-relaxed max-w-lg space-y-3 font-bold pt-1">
            <p>
              NUBB is about making small objects that become part of how you move through life. Handmade objects that blur the line between art and utility.
            </p>
            <p>
              Every piece is made by hand, shaped by instinct, and designed to be used, carried, tied, clipped, worn, or displayed.
            </p>
          </div>
        </motion.div>

        {/* Right Column: Title, Subtitle, Description & Signup Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex flex-col items-start justify-end space-y-5 md:pl-4"
        >
          <div>
            <h1
              className="font-spray text-4xl sm:text-6xl md:text-7xl text-[#4D3F15] tracking-wide block"
              style={{ lineHeight: "0.95" }}
            >
              Be the first to know.
            </h1>

            <h2
              className="font-lekton font-bold text-[#4D3F15] tracking-wide block"
              style={{ paddingTop: "8px", fontSize: "30px", lineHeight: "1.1" }}
            >
              We are getting the shop ready
            </h2>

            <p
              className="font-arial font-bold text-[#4D3F15] text-base sm:text-lg block"
              style={{ fontWeight: "bold", lineHeight: "1.25", paddingTop: "8px" }}
            >
              Drop your email and get notified as soon as we launch.
            </p>
          </div>

          {/* Email Subscription Form */}
          <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-lg pt-3">
            <div>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={status === "loading"}
                required
                className="w-full px-5 py-4 bg-[#FFFFFF] border-2 border-[#4D3F15] text-[#4D3F15] focus:outline-none font-arial text-base sm:text-lg transition-colors placeholder-[#4D3F15]/40"
              />
            </div>

            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "loading"}
                required
                className="w-full px-5 py-4 bg-[#FFFFFF] border-2 border-[#4D3F15] text-[#4D3F15] focus:outline-none font-arial text-base sm:text-lg transition-colors placeholder-[#4D3F15]/40"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-10 py-3.5 bg-[#4D3F15] text-[#E8E6D8] font-lekton text-base sm:text-lg font-bold hover:bg-[#892F1A] active:bg-[#640017] transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </form>

          {/* Feedback Message */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="pt-2 w-full max-w-lg font-arial text-sm sm:text-base"
              >
                <div
                  className={`flex items-start gap-2 p-3.5 border-2 ${
                    status === "success"
                      ? "bg-emerald-50 text-emerald-900 border-emerald-700"
                      : "bg-rose-50 text-rose-900 border-[#640017]"
                  }`}
                >
                  {status === "success" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-[#640017] shrink-0 mt-0.5" />
                  )}
                  <span>{message}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>

      </div>
    </div>
  );
}
