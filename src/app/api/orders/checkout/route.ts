import { NextRequest, NextResponse } from "next/server";
import { createOrder, getProductById, getStoreSetting } from "@/lib/turso";
import { sendEmail } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      items,
      payment_method,
      payment_proof_url,
      notes,
    } = body;

    if (!customer_name || !customer_email || !shipping_address || !items || !items.length) {
      return NextResponse.json(
        { error: "Missing required checkout information" },
        { status: 400 }
      );
    }

    // Validate inventory and compute verified subtotal from DB
    let verifiedSubtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const product = await getProductById(item.productId);
      if (!product || product.status !== "active") {
        return NextResponse.json(
          { error: `Product "${item.name}" is unavailable.` },
          { status: 400 }
        );
      }

      if (product.inventory < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for "${product.name}". Only ${product.inventory} left in stock.`,
          },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      verifiedSubtotal += itemTotal;

      const productImages = JSON.parse(product.images || "[]");
      verifiedItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: productImages[0] || "",
      });
    }

    // Compute shipping fee based on settings
    const shippingFeeSetting = await getStoreSetting("shipping_fee", "120");
    const freeShippingThresholdSetting = await getStoreSetting("free_shipping_threshold", "2000");

    const baseShippingFee = Number(shippingFeeSetting);
    const freeShippingThreshold = Number(freeShippingThresholdSetting);

    const shippingFee = verifiedSubtotal >= freeShippingThreshold ? 0 : baseShippingFee;
    const totalAmount = verifiedSubtotal + shippingFee;

    const orderId = await createOrder({
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      items: verifiedItems,
      subtotal: verifiedSubtotal,
      shipping_fee: shippingFee,
      total_amount: totalAmount,
      payment_method,
      payment_proof_url,
      notes,
    });

    // Send confirmation email asynchronously
    try {
      await sendEmail({
        to: customer_email,
        subject: `Order Confirmation — #${orderId} | NUBB`,
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #E8E6D8; color: #4D3F15; padding: 32px; border-radius: 4px;">
            <h1 style="color: #4D3F15; margin-bottom: 8px;">NUBB</h1>
            <p style="font-size: 18px; font-weight: bold; margin-bottom: 24px;">Thank you for your order, ${customer_name}!</p>
            <p>Your order <strong>#${orderId}</strong> has been received and is being prepared.</p>
            
            <div style="background: #FFFFFF; padding: 20px; border: 2px solid #4D3F15; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #4D3F15;">Order Summary</h3>
              <ul style="padding-left: 20px;">
                ${verifiedItems
                  .map(
                    (i) =>
                      `<li>${i.name} &times; ${i.quantity} — <strong>₱${(i.price * i.quantity).toLocaleString()}</strong></li>`
                  )
                  .join("")}
              </ul>
              <hr style="border: 1px solid #E8E6D8; margin: 16px 0;" />
              <p>Subtotal: ₱${verifiedSubtotal.toLocaleString()}</p>
              <p>Shipping: ₱${shippingFee.toLocaleString()}</p>
              <p style="font-size: 18px; font-weight: bold; color: #892F1A;">Total: ₱${totalAmount.toLocaleString()}</p>
              <p>Payment Method: <strong>${payment_method.toUpperCase()}</strong></p>
            </div>

            <p style="font-size: 12px; color: #624A41;">NUBB — Handmade objects that blur the line between art and utility.</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.warn("Failed to send order confirmation email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      orderId,
      subtotal: verifiedSubtotal,
      shippingFee,
      totalAmount,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to process order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
