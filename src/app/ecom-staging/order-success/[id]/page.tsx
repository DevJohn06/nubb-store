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
<<<<<<< HEAD
        colors: ["#892F1A", "#640017", "#4D3F15", "#E8E6D8", "#F2BF4A"],
=======
        colors: ["#892F1A", "#4D3F15", "#624A41", "#E8E6D8"],
>>>>>>> refs/remotes/origin/main
      });
    } catch {}
  }, []);

  return (
    <div className="py-12 max-w-2xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="nubb-surface p-8 sm:p-12 text-center space-y-6"
      >
        <div className="w-16 h-16 bg-nubb-cream border border-nubb-brown/15 rounded-full flex items-center justify-center mx-auto text-nubb-brown">
          <CheckCircle2 className="w-9 h-9 text-nubb-orange" />
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-3xl sm:text-4xl text-nubb-brown">
            Order Secured!
          </h1>
          <p className="font-lekton text-sm font-bold text-nubb-orange uppercase tracking-wider">
            Thank you for choosing NUBB
          </p>
        </div>

        <div className="p-4 bg-nubb-cream/50 border border-nubb-brown/15 font-mono text-base font-bold text-nubb-brown inline-block">
          Order Reference: <span className="text-nubb-orange">#{id}</span>
        </div>

        <p className="font-body text-sm sm:text-base text-nubb-brown font-bold leading-relaxed max-w-lg mx-auto">
          We have received your order details and sent a confirmation summary to your email. Our
          studio is now preparing your handcrafted pieces.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left font-lekton text-xs font-bold text-nubb-brown/90 pt-4 border-t border-nubb-brown/20">
          <div className="p-3 bg-nubb-cream/30 border border-nubb-brown flex items-center gap-2.5">
            <Package className="w-4 h-4 text-nubb-orange shrink-0" />
            <span>Packed with care in custom studio pouch</span>
          </div>
          <div className="p-3 bg-nubb-cream/30 border border-nubb-brown flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-nubb-brown shrink-0" />
            <span>Tracking updates sent via email</span>
          </div>
        </div>

        <div className="pt-4 flex justify-center">
          <Link
            href="/ecom-staging"
            className="nubb-btn-primary"
          >
            <span>Return to Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
