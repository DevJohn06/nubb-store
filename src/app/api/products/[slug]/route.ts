import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/turso";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product || product.status === "archived") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
