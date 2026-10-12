"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, Shield } from "lucide-react";

export function AdminHeader({
  user,
}: {
  user: { name: string; username: string; email: string; role: string };
}) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {}
  };

  return (
    <header className="h-16 bg-nubb-cream border-b border-nubb-brown/15 px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <div className="nubb-badge bg-nubb-cream-light border border-nubb-brown/15 text-nubb-brown gap-1.5">
          <Shield className="w-3.5 h-3.5 text-nubb-orange" />
          <span>Role: {user.role || "Admin"}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 font-lekton text-xs font-bold text-nubb-brown">
          <div className="w-8 h-8 rounded-full bg-nubb-brown text-nubb-cream flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <span className="hidden sm:inline">{user.name || user.username}</span>
        </div>

        <button
          onClick={handleLogout}
<<<<<<< HEAD
          className="nubb-btn-secondary nubb-btn-sm hover:bg-nubb-crimson hover:border-nubb-crimson"
=======
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E8E6D8] border border-[#4D3F15] text-[#4D3F15] font-lekton text-xs font-bold hover:bg-[#892F1A] hover:text-[#E8E6D8] hover:border-[#892F1A] transition-colors cursor-pointer"
>>>>>>> refs/remotes/origin/main
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
