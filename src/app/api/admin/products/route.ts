import { NextRequest, NextResponse } from "next/server";
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/lib/turso";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

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
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch products" }, { status: 500 });
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
      images: Array.isArray(images) ? images : [],
      features: Array.isArray(features) ? features : [],
      is_featured: is_featured ? 1 : 0,
      status: status || "active",
    });

    return NextResponse.json({ success: true, product: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 });
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

    await updateProduct(id, data);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update product" }, { status: 500 });
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete product" }, { status: 500 });
  }
}
