import React from "react";

// Mustard stamp badge: ring text around the brown brand mark. One per page, overlapping a photo edge.
// Positioning (e.g. `absolute -right-2`) goes on the outer wrapper so the inner `relative` can't override it.
export function Stamp({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <div className="relative w-[150px] h-[150px]">
        <svg width="150" height="150" viewBox="0 0 150 150" aria-hidden="true" className="block">
          <defs>
            <path id="nubbStampRing" d="M75 75 m-50 0 a50 50 0 1 1 100 0 a50 50 0 1 1 -100 0" />
          </defs>
          <circle cx="75" cy="75" r="72" fill="#F2BF4A" />
          <text
            fill="#4D3F15"
            style={{ fontFamily: "var(--font-lekton), monospace", fontWeight: 700, fontSize: 12, letterSpacing: 2 }}
          >
            <textPath href="#nubbStampRing" textLength="306" lengthAdjust="spacing">
              HANDMADE · IN DAVAO · SMALL BATCH ·
            </textPath>
          </text>
        </svg>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/brand-mark.svg?v=3"
          alt="NUBB brand mark: handmade in Davao, small batch"
          className="absolute left-[42px] top-[42px] w-[66px] h-[66px] object-contain rounded-none"
        />
      </div>
    </div>
  );
}
