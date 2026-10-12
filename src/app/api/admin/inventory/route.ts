import { NextRequest, NextResponse } from "next/server";
import { getProducts, updateProductStock, updateProduct } from "@/lib/turso";
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

  try {
    const products = await getProducts();
    const inventoryList = products.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      inventory: p.inventory,
      price: p.price,
      status: p.status,
      image: JSON.parse(p.images || "[]")[0] || null,
    }));

    return NextResponse.json({ inventory: inventoryList });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load inventory";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = checkAdminAuth(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, delta, absoluteStock } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    if (absoluteStock !== undefined) {
      await updateProduct(id, { inventory: Math.max(0, Number(absoluteStock)) });
    } else if (delta !== undefined) {
      await updateProductStock(id, Number(delta));
    } else {
      return NextResponse.json({ error: "Either delta or absoluteStock is required" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update inventory";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
