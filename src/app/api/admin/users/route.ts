import { NextRequest, NextResponse } from "next/server";
import { getAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser } from "@/lib/turso";
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
    const users = await getAdminUsers();
    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = checkAdminAuth(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "superadmin") {
    return NextResponse.json({ error: "Only Super Admins can add new users" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, username, email, password, role } = body;

    if (!name || !username || !email || !password) {
      return NextResponse.json(
        { error: "Name, username, email, and password are required" },
        { status: 400 }
      );
    }

    const result = await createAdminUser({
      name,
      username,
      email,
      password,
      role: role || "admin",
    });

    return NextResponse.json({ success: true, user: result });
  } catch (error: any) {
    const msg = error.message || String(error);
    if (msg.includes("UNIQUE constraint failed") || msg.includes("already exists")) {
      return NextResponse.json({ error: "Username or email already in use" }, { status: 400 });
    }
    return NextResponse.json({ error: msg || "Failed to create user" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = checkAdminAuth(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, name, email, password, role, status } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Only superadmin can change someone else's role or status
    if (session.role !== "superadmin" && session.userId !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await updateAdminUser(id, { name, email, password, role, status });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = checkAdminAuth(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "superadmin") {
    return NextResponse.json({ error: "Only Super Admins can delete users" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (session.userId === id) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    await deleteAdminUser(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete user" }, { status: 500 });
  }
}
