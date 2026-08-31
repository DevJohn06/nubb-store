"use client";

import React from "react";

interface BrandLoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
  className?: string;
  speed?: "normal" | "slow" | "fast";
}

export function BrandLoader({
  size = "md",
  label,
  className = "",
  speed = "normal",
}: BrandLoaderProps) {
  const sizeMap = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
  };

  const speedMap = {
    fast: "duration-700",
    normal: "duration-1000",
    slow: "duration-3000",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center space-y-4 ${className}`}
    >
      <div className={`${sizeMap[size]} shrink-0 animate-spin ${speedMap[speed]}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/brand-mark.svg?v=3"
          alt="Loading..."
          className="w-full h-full object-contain select-none pointer-events-none"
        />
      </div>
      {label && (
        <p className="font-lekton font-bold uppercase tracking-widest text-xs text-[#4D3F15]/80 animate-pulse">
          {label}
        </p>
      )}
    </div>
  );
}
