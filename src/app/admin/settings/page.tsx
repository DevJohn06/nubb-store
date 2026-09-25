"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Users,
  CreditCard,
  Sliders,
  Plus,
  Trash2,
  Edit2,
  Check,
  Loader2,
  Upload,
  KeyRound,
  Shield,
  QrCode,
} from "lucide-react";
import { BrandLoader } from "@/components/common/BrandLoader";

interface AdminUser {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  account_name: string | null;
  account_number: string | null;
  instructions: string | null;
  qr_code_url: string | null;
  is_active: number;
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"users" | "payments" | "general">("users");

  // User Management state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userUsername, setUserUsername] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState("admin");
  const [userError, setUserError] = useState("");
  const [submittingUser, setSubmittingUser] = useState(false);

  // Payment Methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [editingPm, setEditingPm] = useState<PaymentMethod | null>(null);
  const [uploadingQr, setUploadingQr] = useState(false);

  // General Settings state
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadPayments = async () => {
    setLoadingPayments(true);
    try {
      const res = await fetch("/api/admin/payment-methods");
      const data = await res.json();
      if (data.paymentMethods) setPaymentMethods(data.paymentMethods);
    } catch (err) {
      console.error("Failed to load payment methods", err);
    } finally {
      setLoadingPayments(false);
    }
  };

  const loadSettings = async () => {
    setLoadingSettings(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.settings) setSettings(data.settings);
    } catch (err) {
      console.error("Failed to load settings", err);
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadPayments();
    loadSettings();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userUsername || !userEmail || !userPassword) return;

    setSubmittingUser(true);
    setUserError("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName,
          username: userUsername,
          email: userEmail,
          password: userPassword,
          role: userRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      setIsAddUserOpen(false);
      setUserName("");
      setUserUsername("");
      setUserEmail("");
      setUserPassword("");
      loadUsers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create user";
      setUserError(message);
    } finally {
      setSubmittingUser(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this admin account?")) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete user");
        return;
      }
      loadUsers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      alert("Failed to delete user: " + message);
    }
  };

  const handleSavePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPm) return;

    try {
      await fetch("/api/admin/payment-methods", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPm),
      });

      setEditingPm(null);
      loadPayments();
    } catch (err) {
      console.error("Failed to save payment method", err);
    }
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingPm) return;

    setUploadingQr(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setEditingPm({ ...editingPm, qr_code_url: data.url });
      }
    } catch (err) {
      console.error("QR upload failed", err);
    } finally {
      setUploadingQr(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);

    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save settings", err);
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#4D3F15] pb-4">
        <div>
          <h1 className="font-spray text-3xl sm:text-4xl text-[#4D3F15]">Settings & Controls</h1>
          <p className="font-lekton text-xs font-bold uppercase tracking-wider text-[#892F1A] mt-1">
            User Credentials, Payment Gateways & Staging Configurations
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b-2 border-[#4D3F15] bg-white p-2 nubb-shadow gap-2">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-5 py-2.5 font-lekton font-bold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "users"
              ? "bg-[#4D3F15] text-[#E8E6D8] border border-[#4D3F15]"
              : "bg-transparent text-[#4D3F15] hover:bg-[#E8E6D8]/50"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Management</span>
        </button>

        <button
          onClick={() => setActiveTab("payments")}
          className={`flex items-center gap-2 px-5 py-2.5 font-lekton font-bold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "payments"
              ? "bg-[#4D3F15] text-[#E8E6D8] border border-[#4D3F15]"
              : "bg-transparent text-[#4D3F15] hover:bg-[#E8E6D8]/50"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payment Methods</span>
        </button>

        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-5 py-2.5 font-lekton font-bold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "general"
              ? "bg-[#4D3F15] text-[#E8E6D8] border border-[#4D3F15]"
              : "bg-transparent text-[#4D3F15] hover:bg-[#E8E6D8]/50"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>General & Staging PIN</span>
        </button>
      </div>

      {/* Tab 1: User Management */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white border-2 border-[#4D3F15] p-4 nubb-shadow">
            <div>
              <h2 className="font-lekton text-base font-bold uppercase tracking-wider text-[#4D3F15]">
                Admin Team Accounts
              </h2>
              <p className="font-arial text-xs font-bold text-[#4D3F15]/70">
                Grant access to manage orders, products, and inventories.
              </p>
            </div>
            <button
              onClick={() => {
                setIsAddUserOpen(true);
                setUserError("");
              }}
              className="px-4 py-2 bg-[#4D3F15] text-[#E8E6D8] font-lekton font-bold text-xs uppercase tracking-wider hover:bg-[#892F1A] transition-colors flex items-center gap-1.5 nubb-shadow cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          </div>

          <div className="bg-white border-2 border-[#4D3F15] nubb-shadow overflow-hidden">
            {loadingUsers ? (
              <BrandLoader size="md" label="Loading users..." className="py-12" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-lekton text-xs">
                  <thead>
                    <tr className="bg-[#E8E6D8]/50 border-b-2 border-[#4D3F15] text-[#4D3F15] font-bold uppercase">
                      <th className="p-4">Name</th>
                      <th className="p-4">Username</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#4D3F15]/10 font-bold">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-[#E8E6D8]/20">
                        <td className="p-4 font-arial">{u.name}</td>
                        <td className="p-4 font-mono text-[#892F1A]">@{u.username}</td>
                        <td className="p-4">{u.email}</td>
                        <td className="p-4 uppercase">
                          <span
                            className={`px-2 py-0.5 border text-[10px] ${
                              u.role === "superadmin"
                                ? "bg-purple-50 text-purple-900 border-purple-800"
                                : "bg-blue-50 text-blue-900 border-blue-800"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 uppercase">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-800 text-[10px]">
                            {u.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 bg-[#E8E6D8] border border-[#4D3F15] hover:bg-[#892F1A] hover:text-[#E8E6D8] hover:border-[#892F1A] transition-colors cursor-pointer"
                            title="Delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Add User Modal */}
          {isAddUserOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4D3F15]/60 backdrop-blur-xs">
              <div className="bg-[#E8E6D8] border-3 border-[#4D3F15] max-w-md w-full p-6 sm:p-8 nubb-shadow-lg space-y-5">
                <div className="flex items-center justify-between border-b-2 border-[#4D3F15] pb-3">
                  <h3 className="font-spray text-xl text-[#4D3F15]">Add Admin Member</h3>
                  <button
                    onClick={() => setIsAddUserOpen(false)}
                    className="p-1.5 border border-[#4D3F15] bg-white hover:bg-[#892F1A] hover:text-white transition-colors"
                  >
                    &times;
                  </button>
                </div>

                {userError && (
                  <div className="p-3 bg-rose-100 border border-rose-800 text-rose-900 font-arial text-xs font-bold">
                    {userError}
                  </div>
                )}

                <form onSubmit={handleCreateUser} className="space-y-4 font-arial text-sm font-bold">
                  <div className="space-y-1">
                    <label className="font-lekton text-xs uppercase tracking-wider text-[#4D3F15]">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="e.g. Studio Assistant"
                      className="w-full px-3 py-2 bg-white border-2 border-[#4D3F15] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-lekton text-xs uppercase tracking-wider text-[#4D3F15]">
                      Username *
                    </label>
                    <input
                      type="text"
                      required
                      value={userUsername}
                      onChange={(e) => setUserUsername(e.target.value)}
                      placeholder="e.g. studio_ops"
                      className="w-full px-3 py-2 bg-white border-2 border-[#4D3F15] font-mono focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-lekton text-xs uppercase tracking-wider text-[#4D3F15]">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="ops@nubb.store"
                      className="w-full px-3 py-2 bg-white border-2 border-[#4D3F15] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-lekton text-xs uppercase tracking-wider text-[#4D3F15]">
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2 bg-white border-2 border-[#4D3F15] font-mono focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-lekton text-xs uppercase tracking-wider text-[#4D3F15]">
                      Role
                    </label>
                    <select
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value)}
                      className="w-full px-3 py-2 bg-white border-2 border-[#4D3F15] font-lekton focus:outline-none"
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager / Staff</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                  </div>

                  <div className="pt-3 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAddUserOpen(false)}
                      className="flex-1 py-2.5 bg-white border-2 border-[#4D3F15] font-lekton text-xs font-bold uppercase hover:bg-[#E8E6D8]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingUser}
                      className="flex-1 py-2.5 bg-[#4D3F15] text-[#E8E6D8] font-lekton text-xs font-bold uppercase hover:bg-[#892F1A] nubb-shadow"
                    >
                      {submittingUser ? "Creating..." : "Save Member"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Payment Methods */}
      {activeTab === "payments" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paymentMethods.map((pm) => (
              <div key={pm.id} className="bg-white border-2 border-[#4D3F15] p-6 nubb-shadow space-y-4">
                <div className="flex items-center justify-between border-b border-[#4D3F15]/20 pb-3">
                  <div className="flex items-center gap-2 font-lekton font-bold text-base text-[#4D3F15]">
                    <CreditCard className="w-4 h-4 text-[#892F1A]" />
                    <span>{pm.name}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 border font-lekton text-[10px] uppercase font-bold ${
                      pm.is_active
                        ? "bg-emerald-50 text-emerald-800 border-emerald-800"
                        : "bg-gray-100 text-gray-600 border-gray-400"
                    }`}
                  >
                    {pm.is_active ? "Enabled" : "Disabled"}
                  </span>
                </div>

                <div className="font-arial text-xs font-bold text-[#4D3F15]/80 space-y-1.5">
                  <p><strong>Account Name:</strong> {pm.account_name || "—"}</p>
                  <p><strong>Account Number:</strong> {pm.account_number || "—"}</p>
                  <p><strong>Instructions:</strong> {pm.instructions || "—"}</p>
                </div>

                {pm.qr_code_url && (
                  <div className="pt-2">
                    <span className="font-lekton text-xs font-bold text-[#4D3F15] block mb-1">
                      Active QR Code:
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pm.qr_code_url}
                      alt={`${pm.name} QR`}
                      className="w-28 h-28 object-contain border border-[#4D3F15] p-1 bg-white"
                    />
                  </div>
                )}

                <div className="pt-3 border-t border-[#4D3F15]/10">
                  <button
                    onClick={() => setEditingPm(pm)}
                    className="px-4 py-2 bg-[#4D3F15] text-[#E8E6D8] font-lekton text-xs font-bold uppercase hover:bg-[#892F1A] transition-colors flex items-center gap-1.5 nubb-shadow cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Configure Gateway</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Payment Method Modal */}
          {editingPm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4D3F15]/60 backdrop-blur-xs">
              <div className="bg-[#E8E6D8] border-3 border-[#4D3F15] max-w-lg w-full p-6 sm:p-8 nubb-shadow-lg space-y-5">
                <div className="flex items-center justify-between border-b-2 border-[#4D3F15] pb-3">
                  <h3 className="font-spray text-xl text-[#4D3F15]">Configure {editingPm.name}</h3>
                  <button
                    onClick={() => setEditingPm(null)}
                    className="p-1.5 border border-[#4D3F15] bg-white hover:bg-[#892F1A] hover:text-white"
                  >
                    &times;
                  </button>
                </div>

                <form onSubmit={handleSavePaymentMethod} className="space-y-4 font-arial text-sm font-bold">
                  <div className="space-y-1">
                    <label className="font-lekton text-xs uppercase tracking-wider text-[#4D3F15]">
                      Display Title
                    </label>
                    <input
                      type="text"
                      required
                      value={editingPm.name}
                      onChange={(e) => setEditingPm({ ...editingPm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-white border-2 border-[#4D3F15] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-lekton text-xs uppercase tracking-wider text-[#4D3F15]">
                      Account Name / Merchant
                    </label>
                    <input
                      type="text"
                      value={editingPm.account_name || ""}
                      onChange={(e) => setEditingPm({ ...editingPm, account_name: e.target.value })}
                      placeholder="e.g. NUBB STUDIO / John T."
                      className="w-full px-3 py-2 bg-white border-2 border-[#4D3F15] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-lekton text-xs uppercase tracking-wider text-[#4D3F15]">
                      Account / Mobile Number
                    </label>
                    <input
                      type="text"
                      value={editingPm.account_number || ""}
                      onChange={(e) => setEditingPm({ ...editingPm, account_number: e.target.value })}
                      placeholder="0917-XXX-XXXX"
                      className="w-full px-3 py-2 bg-white border-2 border-[#4D3F15] font-mono focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-lekton text-xs uppercase tracking-wider text-[#4D3F15]">
                      Transfer Instructions
                    </label>
                    <textarea
                      rows={3}
                      value={editingPm.instructions || ""}
                      onChange={(e) => setEditingPm({ ...editingPm, instructions: e.target.value })}
                      placeholder="Send exact total and attach screenshot..."
                      className="w-full px-3 py-2 bg-white border-2 border-[#4D3F15] focus:outline-none"
                    />
                  </div>

                  {/* QR Code Upload to Cloudflare R2 */}
                  <div className="space-y-2">
                    <label className="font-lekton text-xs uppercase tracking-wider text-[#4D3F15] block">
                      Payment QR Code (Cloudflare R2 Upload)
                    </label>
                    <div className="flex items-center gap-3">
                      {editingPm.qr_code_url && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={editingPm.qr_code_url}
                          alt="QR"
                          className="w-16 h-16 object-contain border border-[#4D3F15] bg-white p-1"
                        />
                      )}
                      <label className="px-3 py-2 bg-white border-2 border-[#4D3F15] font-lekton text-xs font-bold hover:bg-[#892F1A] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5">
                        {uploadingQr ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <span>{uploadingQr ? "Uploading..." : "Upload QR Image"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleQrUpload}
                          disabled={uploadingQr}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 pt-2 font-lekton text-xs uppercase cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingPm.is_active)}
                      onChange={(e) => setEditingPm({ ...editingPm, is_active: e.target.checked ? 1 : 0 })}
                      className="accent-[#892F1A] w-4 h-4"
                    />
                    <span>Active on Checkout</span>
                  </label>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingPm(null)}
                      className="flex-1 py-2.5 bg-white border-2 border-[#4D3F15] font-lekton text-xs font-bold uppercase hover:bg-[#E8E6D8]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-[#4D3F15] text-[#E8E6D8] font-lekton text-xs font-bold uppercase hover:bg-[#892F1A] nubb-shadow"
                    >
                      Save Configuration
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: General Settings */}
      {activeTab === "general" && (
        <div className="bg-white border-2 border-[#4D3F15] p-6 sm:p-8 nubb-shadow space-y-6 max-w-2xl">
          <h2 className="font-lekton text-base font-bold uppercase tracking-wider text-[#4D3F15] border-b border-[#4D3F15]/20 pb-3">
            Storefront Configurations
          </h2>

          <form onSubmit={handleSaveSettings} className="space-y-5 font-arial text-sm font-bold">
            <div className="space-y-1.5">
              <label className="font-lekton text-xs uppercase tracking-wider text-[#4D3F15] block">
                Developer Staging PIN (/ecom-staging Gate)
              </label>
              <input
                type="text"
                value={settings.staging_pin || ""}
                onChange={(e) => setSettings({ ...settings, staging_pin: e.target.value })}
                placeholder="e.g. nubb2026"
                className="w-full px-4 py-2.5 bg-[#E8E6D8]/30 border-2 border-[#4D3F15] font-mono focus:outline-none focus:bg-white"
              />
              <p className="font-arial text-xs text-[#4D3F15]/70 font-normal">
                Required by clients or team members to enter `/ecom-staging`.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-lekton text-xs uppercase tracking-wider text-[#4D3F15] block">
                  Standard Shipping Fee (₱)
                </label>
                <input
                  type="number"
                  value={settings.shipping_fee || "120"}
                  onChange={(e) => setSettings({ ...settings, shipping_fee: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#E8E6D8]/30 border-2 border-[#4D3F15] focus:outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-lekton text-xs uppercase tracking-wider text-[#4D3F15] block">
                  Free Shipping Minimum (₱)
                </label>
                <input
                  type="number"
                  value={settings.free_shipping_threshold || "2000"}
                  onChange={(e) =>
                    setSettings({ ...settings, free_shipping_threshold: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-[#E8E6D8]/30 border-2 border-[#4D3F15] focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-lekton text-xs uppercase tracking-wider text-[#4D3F15] block">
                Storefront Top Announcement Banner
              </label>
              <input
                type="text"
                value={settings.store_announcement || ""}
                onChange={(e) =>
                  setSettings({ ...settings, store_announcement: e.target.value })
                }
                placeholder="HANDCRAFTED IN SMALL BATCHES — STAGING PREVIEW ACTIVE"
                className="w-full px-4 py-2.5 bg-[#E8E6D8]/30 border-2 border-[#4D3F15] focus:outline-none focus:bg-white"
              />
            </div>

            <div className="pt-4 flex items-center gap-4">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-3 bg-[#4D3F15] text-[#E8E6D8] font-lekton font-bold text-sm uppercase tracking-wider hover:bg-[#892F1A] transition-all flex items-center gap-2 nubb-shadow cursor-pointer disabled:opacity-50"
              >
                {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Save Store Configurations</span>
              </button>
              {settingsSaved && (
                <span className="font-lekton text-xs text-emerald-800 font-bold">
                  Settings saved successfully!
                </span>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
