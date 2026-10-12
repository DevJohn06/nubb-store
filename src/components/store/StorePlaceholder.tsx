import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Brand-styled stand-in for storefront pages that aren't built yet (About, Craft, Search).
export function StorePlaceholder({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <section className="nubb-container py-20 sm:py-28">
      <div className="max-w-2xl space-y-6">
        <p className="nubb-eyebrow">{eyebrow}</p>
        <h1 className="font-display text-[clamp(2.75rem,6vw,5rem)] leading-[0.95] text-balance">{title}</h1>
        <span className="nubb-wave" aria-hidden="true" style={{ width: 120 }} />
        <p className="font-body text-lg leading-relaxed text-nubb-dark max-w-[46ch]">{body}</p>
        <Link href="/ecom-staging#catalog" className="nubb-btn-primary">
          Back to the shop
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
