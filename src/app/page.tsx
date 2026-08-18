"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Package,
  Layers,
  Compass,
  Hammer,
  AlertCircle,
  Loader2,
  Mail,
  Lock,
} from "lucide-react";

export default function ComingSoonPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);

  // Fetch subscriber count on initial mount
  useEffect(() => {
    fetch("/api/subscribe")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.count === "number") {
          setSubscriberCount(data.count);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit.");
      }

      setStatus("success");
      setMessage(data.message);
      if (typeof data.subscriberCount === "number") {
        setSubscriberCount(data.subscriberCount);
      }

      // Trigger celebratory confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#892F1A", "#640017", "#4D3F15", "#624A41"],
        });
      } catch {}
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Something went wrong. Please try again.");
    }
  };

  const actionVerbs = [
    { name: "USED", desc: "Built for daily utility and tactical functionality." },
    { name: "CARRIED", desc: "Designed to slip smoothly into pockets or EDC gear." },
    { name: "TIED", desc: "Formed with heavy-duty paracord and custom knots." },
    { name: "CLIPPED", desc: "Engineered with solid carabiners and brass hardware." },
    { name: "WORN", desc: "Tactile accessories that become part of your attire." },
    { name: "DISPLAYED", desc: "Handcrafted aesthetic objects for your desk or studio." },
  ];

  return (
    <div className="min-h-screen bg-[#E8E6D8] text-[#4D3F15] bg-grain flex flex-col justify-between selection:bg-[#892F1A] selection:text-[#E8E6D8]">
      {/* Top Banner Navigation */}
      <header className="border-b-2 border-[#4D3F15] bg-[#E8E6D8]/90 backdrop-blur-sm sticky top-0 z-50 px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image
              src="/brand/brand-mark.png"
              alt="NUBB Brand Mark"
              width={38}
              height={38}
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain hover:rotate-180 transition-transform duration-700 cursor-pointer"
            />
            <div className="flex flex-col">
              <span className="font-bold tracking-tighter text-xl sm:text-2xl text-[#4D3F15] font-sans">
                NUBB
              </span>
              <span className="font-mono text-[10px] sm:text-xs tracking-widest text-[#892F1A] uppercase font-bold">
                THE THINGS WE CARRY.
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#640017] text-[#E8E6D8] border border-[#4D3F15] shadow-[2px_2px_0px_#4D3F15]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              E-COMMERCE IN DEV
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-16 flex flex-col justify-center items-center">
        
        {/* Brand Mark Hero Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mb-8 text-center"
        >
          <div className="relative inline-block group">
            <div className="absolute inset-0 bg-[#892F1A] rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <Image
              src="/brand/brand-mark.png"
              alt="NUBB Spiral Emblem"
              width={140}
              height={140}
              priority
              className="w-28 h-28 sm:w-36 sm:h-36 object-contain relative z-10 transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          <div className="mt-4">
            <Image
              src="/brand/logo-dark-brown.png"
              alt="NUBB"
              width={260}
              height={90}
              priority
              className="w-48 sm:w-64 mx-auto object-contain h-auto"
            />
          </div>
        </motion.div>

        {/* Hero Narrative & Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-center max-w-2xl mx-auto space-y-4"
        >
          <div className="inline-block px-3 py-1 rounded-sm bg-[#4D3F15] text-[#E8E6D8] font-mono text-xs tracking-widest uppercase font-bold">
            HANDMADE OBJECTS • ART & UTILITY
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#4D3F15] tracking-tight leading-tight uppercase">
            Small objects that become part of how you move through life.
          </h1>

          <p className="text-base sm:text-lg text-[#624A41] leading-relaxed font-sans font-medium">
            Every piece is made by hand, shaped by instinct, and designed to be used, carried, tied, clipped, worn, or displayed.
          </p>
        </motion.div>

        {/* Email Signup Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-lg mt-10"
        >
          <div className="bg-[#ffffff] border-2 border-[#4D3F15] rounded-2xl p-6 sm:p-8 shadow-[8px_8px_0px_#4D3F15] relative overflow-hidden">
            {/* Subtle Crimson Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#892F1A] via-[#640017] to-[#4D3F15]"></div>

            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-extrabold text-[#4D3F15] flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#892F1A]" />
                  Get Notified On Launch
                </h2>
                <span className="text-xs font-mono bg-[#E8E6D8] text-[#4D3F15] px-2.5 py-1 rounded-full border border-[#4D3F15] font-bold">
                  VIP ACCESS
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#624A41] mt-1 font-sans">
                Enter your email below. We&apos;ll notify you the exact moment our initial drop and e-commerce store goes live.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  disabled={status === "loading" || status === "success"}
                  className="w-full px-4 py-3.5 pl-11 rounded-xl bg-[#E8E6D8]/50 border-2 border-[#4D3F15] text-[#4D3F15] placeholder-[#624A41]/60 focus:outline-none focus:bg-[#ffffff] focus:border-[#892F1A] font-mono text-sm sm:text-base transition-all disabled:opacity-60"
                />
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4D3F15]/60" />
              </div>

              <button
                type="submit"
                disabled={status === "loading" || status === "success"}
                className="w-full bg-[#892F1A] hover:bg-[#640017] text-[#E8E6D8] font-bold py-3.5 px-6 rounded-xl border-2 border-[#4D3F15] shadow-[4px_4px_0px_#4D3F15] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#4D3F15] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#4D3F15] transition-all flex items-center justify-center gap-2 font-mono tracking-wider text-sm sm:text-base disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    REGISTERING YOUR EMAIL...
                  </>
                ) : status === "success" ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                    YOU ARE ON THE LIST!
                  </>
                ) : (
                  <>
                    NOTIFY ME FIRST
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Status Feedback Message */}
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <div
                    className={`p-3.5 rounded-xl border-2 font-mono text-xs sm:text-sm flex items-start gap-2.5 ${
                      status === "success"
                        ? "bg-emerald-50 text-emerald-950 border-emerald-700"
                        : "bg-rose-50 text-rose-950 border-[#640017]"
                    }`}
                  >
                    {status === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-[#640017] shrink-0 mt-0.5" />
                    )}
                    <span>{message}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Trust & Privacy Notice */}
            <div className="mt-5 pt-4 border-t border-[#4D3F15]/15 flex items-center justify-between text-[11px] font-mono text-[#624A41]">
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-[#892F1A]" />
                Zero spam. Instant launch notify only.
              </span>
              {subscriberCount !== null && (
                <span className="font-bold text-[#892F1A] bg-[#E8E6D8] px-2 py-0.5 rounded border border-[#4D3F15]/30">
                  {subscriberCount} registered
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* NUBB Core Action Verbs Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="w-full mt-16 sm:mt-24"
        >
          <div className="text-center mb-8">
            <span className="font-mono text-xs font-bold text-[#892F1A] uppercase tracking-widest">
              DESIGNED TO BE
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#4D3F15] mt-1">
              THE 6 ELEMENTS OF NUBB
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {actionVerbs.map((verb, idx) => (
              <div
                key={verb.name}
                onClick={() => setActiveTab(idx)}
                className={`p-4 rounded-xl border-2 border-[#4D3F15] transition-all cursor-pointer ${
                  activeTab === idx
                    ? "bg-[#640017] text-[#E8E6D8] shadow-[4px_4px_0px_#4D3F15] translate-x-[-2px] translate-y-[-2px]"
                    : "bg-[#ffffff] text-[#4D3F15] hover:bg-[#E8E6D8] shadow-[3px_3px_0px_#4D3F15]"
                }`}
              >
                <div className="font-mono text-xs font-bold opacity-80">0{idx + 1}</div>
                <div className="font-extrabold text-base sm:text-lg tracking-wide font-sans mt-0.5">
                  {verb.name}
                </div>
                <div
                  className={`text-xs mt-1.5 leading-snug font-sans ${
                    activeTab === idx ? "text-[#E8E6D8]/90" : "text-[#624A41]"
                  }`}
                >
                  {verb.desc}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Brand Manifesto Box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="w-full mt-12 sm:mt-16 bg-[#4D3F15] text-[#E8E6D8] rounded-2xl p-6 sm:p-10 border-2 border-[#4D3F15] shadow-[8px_8px_0px_#892F1A] relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 text-left">
              <span className="font-mono text-xs tracking-widest text-[#E8E6D8]/70 uppercase font-bold">
                BRAND MANIFESTO
              </span>
              <h4 className="text-xl sm:text-2xl font-bold tracking-tight text-[#E8E6D8]">
                &quot;Handmade objects that blur the line between art and utility.&quot;
              </h4>
              <p className="text-xs sm:text-sm text-[#E8E6D8]/80 leading-relaxed font-sans max-w-xl">
                We believe everyday carry items should hold soul and story. Every piece is crafted in small batches using durable tactical materials, precision hardware, and organic forms.
              </p>
            </div>

            <div className="shrink-0 bg-[#892F1A] p-4 rounded-xl border border-[#E8E6D8]/30 shadow-inner flex flex-col items-center justify-center text-center w-full md:w-44">
              <Hammer className="w-8 h-8 text-[#E8E6D8] mb-2" />
              <span className="font-mono text-xs font-bold tracking-widest">SMALL BATCH</span>
              <span className="text-[10px] text-[#E8E6D8]/90 mt-0.5">LIMITED RUNS ONLY</span>
            </div>
          </div>
        </motion.div>

      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[#4D3F15] bg-[#E8E6D8] px-4 sm:px-8 py-6 mt-16 text-center sm:text-left font-mono text-xs text-[#4D3F15]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Image
              src="/brand/brand-mark.png"
              alt="NUBB"
              width={20}
              height={20}
              className="w-5 h-5 object-contain"
            />
            <span className="font-bold text-[#4D3F15]">NUBB</span>
            <span>•</span>
            <span className="text-[#892F1A] font-bold">THE THINGS WE CARRY.</span>
          </div>

          <div className="flex items-center gap-4 text-[#624A41]">
            <span>© {new Date().getFullYear()} NUBB Store</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              Turso DB Connected
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
