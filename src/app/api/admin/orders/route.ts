import { NextRequest, NextResponse } from "next/server";
import { getOrders, getOrderById, updateOrderStatus, getDashboardMetrics } from "@/lib/turso";
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
  const status = searchParams.get("status") || undefined;
  const metricsOnly = searchParams.get("metrics") === "true";
  const id = searchParams.get("id");

  try {
    if (id) {
      const order = await getOrderById(id);
      if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
      return NextResponse.json({ order });
    }

    if (metricsOnly) {
      const metrics = await getDashboardMetrics();
      return NextResponse.json(metrics);
    }

    const orders = await getOrders(status);
    return NextResponse.json({ orders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch orders";
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
    const { id, order_status, payment_status, tracking_number } = body;

    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    await updateOrderStatus(id, { order_status, payment_status, tracking_number });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update order status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
