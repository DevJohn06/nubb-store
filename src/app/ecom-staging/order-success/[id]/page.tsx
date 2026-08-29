"use client";

import React, { useEffect, use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { CheckCircle2, ArrowRight, Package, ShieldCheck, Mail } from "lucide-react";

export default function OrderSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#892F1A", "#640017", "#4D3F15", "#E8E6D8"],
      });
    } catch {}
  }, []);

  return (
    <div className="py-12 max-w-2xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white border-3 border-[#4D3F15] p-8 sm:p-12 nubb-shadow-lg text-center space-y-6"
      >
        <div className="w-16 h-16 bg-[#E8E6D8] border-2 border-[#4D3F15] rounded-full flex items-center justify-center mx-auto text-[#4D3F15]">
          <CheckCircle2 className="w-9 h-9 text-[#892F1A]" />
        </div>

        <div className="space-y-2">
          <h1 className="font-spray text-3xl sm:text-4xl text-[#4D3F15]">
            Order Secured!
          </h1>
          <p className="font-lekton text-sm font-bold text-[#892F1A] uppercase tracking-wider">
            Thank you for carrying NUBB
          </p>
        </div>

        <div className="p-4 bg-[#E8E6D8]/50 border-2 border-[#4D3F15] font-mono text-base font-bold text-[#4D3F15] inline-block">
          Order Reference: <span className="text-[#892F1A]">#{id}</span>
        </div>

        <p className="font-arial text-sm sm:text-base text-[#4D3F15] font-bold leading-relaxed max-w-lg mx-auto">
          We have received your order details and sent a confirmation summary to your email. Our
          studio is now preparing your handcrafted pieces.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left font-lekton text-xs font-bold text-[#4D3F15]/90 pt-4 border-t border-[#4D3F15]/20">
          <div className="p-3 bg-[#E8E6D8]/30 border border-[#4D3F15] flex items-center gap-2.5">
            <Package className="w-4 h-4 text-[#892F1A] shrink-0" />
            <span>Packed with care in custom studio pouch</span>
          </div>
          <div className="p-3 bg-[#E8E6D8]/30 border border-[#4D3F15] flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-[#4D3F15] shrink-0" />
            <span>Tracking updates sent via email</span>
          </div>
        </div>

        <div className="pt-4 flex justify-center">
          <Link
            href="/ecom-staging"
            className="px-8 py-3.5 bg-[#4D3F15] text-[#E8E6D8] font-lekton font-bold text-sm uppercase tracking-wider hover:bg-[#892F1A] transition-colors flex items-center justify-center gap-2 nubb-shadow cursor-pointer"
          >
            <span>Return to Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
