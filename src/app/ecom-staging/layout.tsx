import React from "react";
import { cookies } from "next/headers";
import { STAGING_COOKIE_NAME } from "@/lib/auth";
import { PinGateModal } from "@/components/store/PinGateModal";
import { CartProvider } from "@/components/store/CartContext";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFooter } from "@/components/store/StoreFooter";
import { CartDrawer } from "@/components/store/CartDrawer";
import { getStoreSetting } from "@/lib/turso";

export const metadata = {
  title: "NUBB Staging Store | Handmade Lighter Covers & Paracord Bracelets",
  description: "Exclusive staging preview for NUBB handcrafted lifestyle carry items.",
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

  let announcement = "HANDCRAFTED IN SMALL BATCHES — STAGING PREVIEW ACTIVE";
  let announcementEnabled = "true";

  try {
    announcement = await getStoreSetting(
      "store_announcement",
      "HANDCRAFTED IN SMALL BATCHES — STAGING PREVIEW ACTIVE"
    );
    announcementEnabled = await getStoreSetting(
      "store_announcement_enabled",
      "true"
    );
  } catch (err) {
    console.warn("Could not fetch store announcement settings:", err);
  }

  const isBannerVisible = announcementEnabled !== "false" && Boolean(announcement?.trim());

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-[#E8E6D8] text-[#4D3F15] selection:bg-[#892F1A] selection:text-[#E8E6D8]">
        <StoreHeader
          announcement={announcement}
          showAnnouncement={isBannerVisible}
        />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {children}
        </main>
        <StoreFooter />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}
