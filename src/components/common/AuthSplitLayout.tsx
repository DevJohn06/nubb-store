import React from "react";
import { Stamp } from "@/components/store/Stamp";

// Full-page gate layout (admin login, staging PIN): orange brand panel beside the form card.
export function AuthSplitLayout({
  eyebrow,
  headline,
  children,
}: {
  eyebrow: string;
  headline: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-nubb-cream text-nubb-brown selection:bg-nubb-orange selection:text-nubb-cream flex items-center">
      <div className="nubb-container py-10 sm:py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Brand panel */}
        <div className="relative mb-8 lg:mb-0">
          <div className="bg-nubb-orange text-nubb-cream rounded-[120px_24px_24px_60px] sm:rounded-[240px_28px_28px_120px] min-h-[260px] sm:min-h-[460px] p-8 sm:p-14 flex flex-col justify-end gap-4 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/brand-mark-cream.svg"
              alt=""
              aria-hidden="true"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-none"
            />
            <p className="font-lekton text-xs sm:text-sm font-bold tracking-[0.14em] uppercase text-nubb-mustard">
              {eyebrow}
            </p>
            <p className="font-display text-[clamp(2.25rem,5vw,4rem)] leading-[0.95] text-balance">{headline}</p>
          </div>
          <Stamp className="absolute -right-2 -bottom-10 hidden sm:block" />
        </div>

        {/* Form card */}
        <div className="w-full max-w-md justify-self-center lg:justify-self-start">{children}</div>
      </div>
    </div>
  );
}
