import React from "react";
import Link from "next/link";
import { safeHref, isExternalHref, type FooterLink } from "@/lib/storefront-content";
import { NewsletterForm } from "./NewsletterForm";

export function StoreFooter({
  newsletterTitle,
  newsletterSubtitle,
  links,
}: {
  newsletterTitle: string;
  newsletterSubtitle: string;
  links: FooterLink[];
}) {
  return (
    <footer className="bg-nubb-cream text-nubb-brown border-t border-nubb-brown/15">
      <div className="nubb-container py-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        <div>
          <p className="font-body text-[13px] font-bold tracking-[0.08em] uppercase">{newsletterTitle}</p>
          <p className="font-body text-sm text-nubb-dark mt-0.5">{newsletterSubtitle}</p>
        </div>

        <div className="lg:justify-self-center w-full max-w-md">
          <NewsletterForm />
        </div>

        <nav aria-label="Footer" className="lg:justify-self-end">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 font-body text-[13px] font-bold tracking-[0.08em] uppercase">
            {links.map((link, i) => {
              const href = safeHref(link.url);
              return (
                <li key={`${link.label}-${i}`}>
                  {isExternalHref(href) ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="hover:text-nubb-orange transition-colors">
                      {link.label}
                    </a>
                  ) : (
                    <Link href={href} className="hover:text-nubb-orange transition-colors">
                      {link.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="nubb-container pb-6">
        <p className="pt-5 border-t border-nubb-brown/10 font-lekton text-xs font-bold text-nubb-dark">
          &copy; {new Date().getFullYear()} NUBB. Handcrafted in small batches · Davao.
        </p>
      </div>
    </footer>
  );
}
