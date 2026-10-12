/*
 * Admin-editable storefront copy (bottom brand band + footer).
 * Stored as plain keys in `store_settings`; anything empty falls back to these defaults.
 * No DB imports here so the admin client page can share the defaults.
 */

export interface FooterLink {
  label: string;
  url: string;
}

export interface StorefrontContent {
  band_eyebrow: string;
  band_headline: string;
  band_link_label: string;
  band_link_url: string;
  band_photo_url: string;
  social_handle: string;
  social_hashtag: string;
  social_link_label: string;
  social_url: string;
  newsletter_title: string;
  newsletter_subtitle: string;
  footer_links: FooterLink[];
}

export const DEFAULT_FOOTER_LINKS: FooterLink[] = [
  { label: "FAQ", url: "#" },
  { label: "Shipping", url: "#" },
  { label: "Returns", url: "#" },
  { label: "Contact", url: "#" },
];

export const STOREFRONT_DEFAULTS: StorefrontContent = {
  band_eyebrow: "Art × utility",
  band_headline: "Carried every day. Made to last.",
  band_link_label: "Inside the workshop",
  band_link_url: "/ecom-staging/craft",
  band_photo_url: "",
  social_handle: "@nubb.store",
  social_hashtag: "#thethingswecarry",
  social_link_label: "Follow along",
  social_url: "https://www.instagram.com/",
  newsletter_title: "Join the workshop list",
  newsletter_subtitle: "New batches, first. Nothing else.",
  footer_links: DEFAULT_FOOTER_LINKS,
};

// Text keys an admin can edit (everything except the structured footer links).
export type StorefrontTextKey = Exclude<keyof StorefrontContent, "footer_links">;

export function parseFooterLinks(raw: string | undefined): FooterLink[] {
  if (!raw) return DEFAULT_FOOTER_LINKS;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_FOOTER_LINKS;
    return parsed.filter(
      (l): l is FooterLink =>
        typeof l === "object" && l !== null && typeof l.label === "string" && typeof l.url === "string"
    );
  } catch {
    return DEFAULT_FOOTER_LINKS;
  }
}

export function resolveStorefrontContent(settings: Record<string, string>): StorefrontContent {
  const pick = (key: StorefrontTextKey) => settings[key]?.trim() || STOREFRONT_DEFAULTS[key];
  return {
    band_eyebrow: pick("band_eyebrow"),
    band_headline: pick("band_headline"),
    band_link_label: pick("band_link_label"),
    band_link_url: pick("band_link_url"),
    // An empty photo is meaningful (shows the placeholder), so don't fall back.
    band_photo_url: settings.band_photo_url?.trim() || "",
    social_handle: pick("social_handle"),
    social_hashtag: pick("social_hashtag"),
    social_link_label: pick("social_link_label"),
    social_url: pick("social_url"),
    newsletter_title: pick("newsletter_title"),
    newsletter_subtitle: pick("newsletter_subtitle"),
    // Blank rows can exist while an admin is still editing; never render them.
    footer_links: parseFooterLinks(settings.footer_links).filter((l) => l.label.trim()),
  };
}

// Only allow web, mail and in-site links so admin-entered URLs can't become `javascript:`.
export function safeHref(url: string | undefined): string {
  const u = (url || "").trim();
  if (/^(https?:|mailto:)/i.test(u) || u.startsWith("#") || (u.startsWith("/") && !u.startsWith("//"))) {
    return u;
  }
  return "#";
}

export function isExternalHref(href: string): boolean {
  return /^https?:/i.test(href);
}
