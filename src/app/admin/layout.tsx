import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import AdminLoginPage from "./login/page";

export const metadata = {
  title: "NUBB Admin Portal | Inventory, Products & Sales",
  description: "Secure management portal for NUBB handcrafted lifestyle store.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const session = token ? verifySessionToken(token) : null;

  // If user is not authenticated, render login page
  if (!session) {
    return <AdminLoginPage />;
  }

  return (
    <div className="min-h-screen flex bg-[#F6F5EE] text-[#4D3F15] selection:bg-[#892F1A] selection:text-[#E8E6D8]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          user={{
            name: session.name,
            username: session.username,
            email: session.email,
            role: session.role,
          }}
        />
        <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto max-w-7xl w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
