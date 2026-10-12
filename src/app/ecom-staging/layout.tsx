import React from "react";
import { cookies } from "next/headers";
import { STAGING_COOKIE_NAME } from "@/lib/auth";
import { PinGateModal } from "@/components/store/PinGateModal";
import { CartProvider } from "@/components/store/CartContext";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFooter } from "@/components/store/StoreFooter";
import { CartDrawer } from "@/components/store/CartDrawer";
import { getStoreSettings } from "@/lib/turso";
import { resolveStorefrontContent } from "@/lib/storefront-content";

export const metadata = {
  title: "NUBB Staging Store | Handmade Lighter Covers & Paracord Bracelets",
  description: "Exclusive staging preview for NUBB handcrafted lifestyle products.",
};

export default async function EcomStagingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const stagingAccess = cookieStore.get(STAGING_COOKIE_NAME)?.value;

  // If not authenticated with dev PIN, render the PIN Gate Screen
  if (stagingAccess !== "granted") {
    return <PinGateModal />;
  }

  let settings: Record<string, string> = {};
  try {
    settings = await getStoreSettings();
  } catch (err) {
    console.warn("Could not fetch store settings:", err);
  }

  const announcement = settings.store_announcement ?? "HANDCRAFTED IN SMALL BATCHES — STAGING PREVIEW ACTIVE";
  const announcementEnabled = settings.store_announcement_enabled ?? "true";
  const content = resolveStorefrontContent(settings);

  const isBannerVisible = announcementEnabled !== "false" && Boolean(announcement?.trim());

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-nubb-cream text-nubb-brown selection:bg-nubb-orange selection:text-nubb-cream">
        <StoreHeader
          announcement={announcement}
          showAnnouncement={isBannerVisible}
        />
        <main className="flex-1 w-full">
          {children}
        </main>
        <StoreFooter
          newsletterTitle={content.newsletter_title}
          newsletterSubtitle={content.newsletter_subtitle}
          links={content.footer_links}
        />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}
