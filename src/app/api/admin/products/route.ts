import { NextRequest, NextResponse } from "next/server";
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/lib/turso";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { ensureR2ProductImages } from "@/lib/r2";

function checkAdminAuth(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function GET(req: NextRequest) {
  const session = checkAdminAuth(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || undefined;
  const status = searchParams.get("status") || undefined;

  try {
    const products = await getProducts({ category, status });
    return NextResponse.json({ products });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch products";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = checkAdminAuth(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      name,
      slug,
      category,
      tagline,
      description,
      price,
      compare_at_price,
      inventory,
      sku,
      images,
      features,
      is_featured,
      status,
    } = body;

    if (!name || !category || price === undefined) {
      return NextResponse.json(
        { error: "Product name, category, and price are required" },
        { status: 400 }
      );
    }

    const rawImages = Array.isArray(images) ? images : [];
    const r2Images = await ensureR2ProductImages(rawImages);

    const result = await createProduct({
      name,
      slug,
      category,
      tagline,
      description,
      price: Number(price),
      compare_at_price: compare_at_price ? Number(compare_at_price) : undefined,
      inventory: Number(inventory ?? 0),
      sku,
      images: r2Images,
      features: Array.isArray(features) ? features : [],
      is_featured: is_featured ? 1 : 0,
      status: status || "active",
    });

    return NextResponse.json({ success: true, product: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = checkAdminAuth(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    if (data.price !== undefined) data.price = Number(data.price);
    if (data.compare_at_price !== undefined) {
      data.compare_at_price = data.compare_at_price ? Number(data.compare_at_price) : null;
    }
    if (data.inventory !== undefined) data.inventory = Number(data.inventory);

    if (data.images && Array.isArray(data.images)) {
      data.images = await ensureR2ProductImages(data.images);
    }

    await updateProduct(id, data);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = checkAdminAuth(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    await deleteProduct(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
