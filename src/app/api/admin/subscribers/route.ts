import { NextRequest, NextResponse } from "next/server";
import {
  getSubscribers,
  getSubscriberById,
  addSubscriber,
  updateSubscriber,
  deleteSubscriber,
} from "@/lib/turso";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { sendWelcomeEmail, sendLaunchAnnouncementEmail } from "@/lib/resend";

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
  const search = searchParams.get("search") || undefined;
  const status = searchParams.get("status") || undefined;

  try {
    const subscribers = await getSubscribers(search, status);
    
    // Compute quick stats
    const total = subscribers.length;
    const activeCount = subscribers.filter((s) => s.status === "active").length;
    const unsubscribedCount = total - activeCount;

    return NextResponse.json({
      subscribers,
      stats: {
        total,
        active: activeCount,
        unsubscribed: unsubscribedCount,
      },
    });
  } catch (error: any) {
    console.error("[Admin Subscribers GET Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch subscribers" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = checkAdminAuth(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, email, name, id, customSubject, customMessage } = body;

    // Action: Broadcast "We Have Launched!" Email to All Active Subscribers
    if (action === "broadcast_launch") {
      const activeSubscribers = await getSubscribers(undefined, "active");
      if (activeSubscribers.length === 0) {
        return NextResponse.json(
          { error: "No active subscribers found to broadcast to." },
          { status: 400 }
        );
      }

      let successCount = 0;
      let failureCount = 0;

      for (const sub of activeSubscribers) {
        try {
          const res = await sendLaunchAnnouncementEmail({
            toEmail: sub.email,
            name: sub.name,
            customSubject,
            customMessage,
          });
          if (res.success) {
            successCount++;
          } else {
            failureCount++;
          }
        } catch {
          failureCount++;
        }
      }

      return NextResponse.json({
        success: true,
        message: `Launch announcement broadcast sent to ${successCount} subscriber${successCount === 1 ? "" : "s"}${failureCount > 0 ? ` (${failureCount} failed)` : ""}.`,
        sentCount: successCount,
        failedCount: failureCount,
      });
    }

    // Action: Send "We Have Launched!" Email to Single Subscriber
    if (action === "send_launch_single") {
      let targetEmail = email;
      let targetName = name;

      if (id) {
        const sub = await getSubscriberById(Number(id));
        if (!sub) {
          return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
        }
        targetEmail = sub.email;
        targetName = sub.name || undefined;
      }

      if (!targetEmail) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
      }

      const res = await sendLaunchAnnouncementEmail({
        toEmail: targetEmail,
        name: targetName,
        customSubject,
        customMessage,
      });

      if (!res.success) {
        return NextResponse.json(
          { error: "Failed to dispatch launch email via Resend" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Launch announcement sent successfully to ${targetEmail}`,
      });
    }

    // Action: Resend Welcome Email
    if (action === "resend_welcome") {
      let targetEmail = email;
      let targetName = name;

      if (id) {
        const sub = await getSubscriberById(Number(id));
        if (!sub) {
          return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
        }
        targetEmail = sub.email;
        targetName = sub.name || undefined;
      }

      if (!targetEmail) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
      }

      const emailResult = await sendWelcomeEmail(targetEmail, targetName);
      if (!emailResult.success) {
        return NextResponse.json(
          { error: "Failed to dispatch email via Resend" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Welcome email sent successfully to ${targetEmail}`,
      });
    }

    // Action: Add new subscriber manually
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required" },
        { status: 400 }
      );
    }

    const trimmedName = typeof name === "string" ? name.trim() : undefined;
    const dbResult = await addSubscriber(email.trim(), trimmedName);

    if (body.sendWelcome && dbResult.isNew) {
      await sendWelcomeEmail(email.trim(), trimmedName);
    }

    return NextResponse.json({
      success: true,
      isNew: dbResult.isNew,
      message: dbResult.isNew
        ? "Subscriber successfully added to the list."
        : "Subscriber is already registered.",
    });
  } catch (error: any) {
    console.error("[Admin Subscribers POST Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process subscriber request" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const session = checkAdminAuth(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, status, name, email } = body;

    if (!id) {
      return NextResponse.json({ error: "Subscriber ID is required" }, { status: 400 });
    }

    const updated = await updateSubscriber(Number(id), { status, name, email });
    if (!updated) {
      return NextResponse.json({ error: "Subscriber not found or no changes made" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Subscriber updated successfully." });
  } catch (error: any) {
    console.error("[Admin Subscribers PATCH Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update subscriber" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = checkAdminAuth(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Subscriber ID is required" }, { status: 400 });
    }

    const deleted = await deleteSubscriber(Number(id));
    if (!deleted) {
      return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Subscriber deleted successfully." });
  } catch (error: any) {
    console.error("[Admin Subscribers DELETE Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete subscriber" },
      { status: 500 }
    );
  }
}
