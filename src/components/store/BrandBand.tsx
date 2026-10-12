import React from "react";
import Link from "next/link";
import { safeHref, isExternalHref, type StorefrontContent } from "@/lib/storefront-content";

// Underlined link that opens off-site URLs in a new tab.
function BandLink({ href, children }: { href: string; children: React.ReactNode }) {
  const safe = safeHref(href);
  if (isExternalHref(safe)) {
    return (
      <a href={safe} target="_blank" rel="noopener noreferrer" className="nubb-link inline-block">
        {children}
      </a>
    );
  }
  return (
    <Link href={safe} className="nubb-link inline-block">
      {children}
    </Link>
  );
}

// Full-bleed 3-panel band at the bottom of the storefront home. All copy is editable in
// Admin → Store Settings → Storefront Content.
export function BrandBand({ content }: { content: StorefrontContent }) {
  const photo = safeHref(content.band_photo_url) === "#" ? "" : content.band_photo_url;

  return (
    <section aria-label="About NUBB" className="grid grid-cols-1 md:grid-cols-3">
      {/* Art × utility */}
      <div className="relative isolate overflow-hidden bg-nubb-mustard text-nubb-brown rounded-tr-[120px] md:rounded-tr-[160px] min-h-[340px] md:min-h-[440px] flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/brand-mark.svg?v=3"
          alt=""
          aria-hidden="true"
          className="absolute -z-10 -right-12 -bottom-16 w-72 h-72 md:w-80 md:h-80 opacity-[0.12] pointer-events-none rounded-none"
        />
        <div className="px-8 sm:px-12 py-14 space-y-5 max-w-md">
          <p className="nubb-eyebrow">{content.band_eyebrow}</p>
          <h2 className="font-display text-[clamp(2rem,3.2vw,2.75rem)] leading-[1.05] text-balance">
            {content.band_headline}
          </h2>
          <span className="nubb-wave" aria-hidden="true" style={{ width: 96 }} />
          <BandLink href={content.band_link_url}>{content.band_link_label}</BandLink>
        </div>
      </div>

      {/* Lifestyle photo */}
      <div className="relative bg-nubb-brown min-h-[300px] md:min-h-[440px] flex items-center justify-center overflow-hidden">
        {photo ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={photo} alt="Inside the NUBB workshop" className="absolute inset-0 w-full h-full object-cover rounded-none" />
        ) : (
          <div className="w-3/5 aspect-[4/3] rounded-[20px] border-2 border-dashed border-nubb-cream/70 flex items-center justify-center text-center px-4 font-lekton text-xs font-bold uppercase tracking-[0.1em] text-nubb-cream/80">
            Lifestyle photo
            <br />
            pieces on a workbench
          </div>
        )}
      </div>

      {/* Social */}
      <div className="bg-nubb-cream-light text-nubb-brown min-h-[300px] md:min-h-[440px] flex flex-col items-center justify-center gap-3 px-8 py-14 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-dark-brown.svg?v=3" alt="NUBB" className="h-14 sm:h-16 w-auto object-contain rounded-none mb-2" />
        <p className="font-lekton text-sm font-bold tracking-[0.08em] uppercase">{content.social_handle}</p>
        <p className="font-lekton text-sm font-bold tracking-[0.08em] uppercase">{content.social_hashtag}</p>
        <div className="pt-3">
          <BandLink href={content.social_url}>{content.social_link_label}</BandLink>
        </div>
      </div>
    </section>
  );
}
