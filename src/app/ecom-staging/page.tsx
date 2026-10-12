import React, { Suspense } from "react";
import { getStoreSettings } from "@/lib/turso";
import { resolveStorefrontContent } from "@/lib/storefront-content";
import { StorefrontHome } from "@/components/store/StorefrontHome";
import { BrandBand } from "@/components/store/BrandBand";

export default async function StagingStorefrontPage() {
  let settings: Record<string, string> = {};
  try {
    settings = await getStoreSettings();
  } catch (err) {
    console.warn("Could not fetch storefront content:", err);
  }
  const content = resolveStorefrontContent(settings);

  return (
    <>
      {/* useSearchParams in StorefrontHome needs a Suspense boundary */}
      <Suspense>
        <StorefrontHome />
      </Suspense>
      <BrandBand content={content} />
    </>
  );
}
