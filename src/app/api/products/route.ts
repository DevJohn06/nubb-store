import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/turso";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || undefined;
  const featured = searchParams.get("featured") === "true";

  try {
    const products = await getProducts({
      category,
      status: "active",
      featuredOnly: featured,
    });
    return NextResponse.json({ products });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load products" }, { status: 500 });
  }
}
