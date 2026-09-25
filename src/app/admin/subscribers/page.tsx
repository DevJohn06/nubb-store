"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Mail,
  Search,
  Download,
  Plus,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Send,
  UserCheck,
  UserX,
  X,
  Loader2,
  Users,
  Sparkles,
  Rocket,
  ExternalLink,
} from "lucide-react";
import { BrandLoader } from "@/components/common/BrandLoader";

interface Subscriber {
  id: number;
  email: string;
  name: string | null;
  status: string;
  created_at: string;
}

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "unsubscribed">("all");

  // Add Subscriber Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [sendWelcomeOnAdd, setSendWelcomeOnAdd] = useState(true);
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // Broadcast Launch Modal State
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
  const [broadcastingLaunch, setBroadcastingLaunch] = useState(false);

  // Action states
  const [actionInProgressId, setActionInProgressId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Delete Confirm State
  const [deleteConfirmSubscriber, setDeleteConfirmSubscriber] = useState<Subscriber | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  const loadSubscribers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/subscribers");
      const data = await res.json();
      if (data.subscribers) {
        setSubscribers(data.subscribers);
      } else if (data.error) {
        showToast(data.error, "error");
      }
    } catch (err) {
      console.error("Failed to load subscribers", err);
      showToast("Failed to fetch subscriber list", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscribers();
  }, []);

  // Filtered Subscribers
  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((sub) => {
      // Status Filter
      if (statusFilter !== "all" && sub.status !== statusFilter) {
        return false;
      }

      // Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesEmail = sub.email.toLowerCase().includes(query);
        const matchesName = sub.name ? sub.name.toLowerCase().includes(query) : false;
        return matchesEmail || matchesName;
      }

      return true;
    });
  }, [subscribers, statusFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = subscribers.length;
    const active = subscribers.filter((s) => s.status === "active").length;
    const unsubscribed = total - active;
    return { total, active, unsubscribed };
  }, [subscribers]);

  // Copy Email Helper
  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    showToast(`Copied ${email} to clipboard!`);
    setTimeout(() => {
      setCopiedEmail((prev) => (prev === email ? null : prev));
    }, 2000);
  };

  // Broadcast Launch Announcement to All Active Subscribers
  const handleBroadcastLaunch = async () => {
    if (stats.active === 0) {
      showToast("No active subscribers to send to.", "error");
      return;
    }

    setBroadcastingLaunch(true);
    try {
      const res = await fetch("/api/admin/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "broadcast_launch",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Launch announcement dispatched to subscribers!", "success");
        setIsLaunchModalOpen(false);
      } else {
        throw new Error(data.error || "Failed to broadcast launch announcement");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send launch emails";
      showToast(message, "error");
    } finally {
      setBroadcastingLaunch(false);
    }
  };

  // Send Launch Announcement to Single Subscriber
  const handleSendLaunchSingle = async (sub: Subscriber) => {
    setActionInProgressId(sub.id);
    setActionType("launch_single");

    try {
      const res = await fetch("/api/admin/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_launch_single",
          id: sub.id,
          email: sub.email,
          name: sub.name,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`Launch announcement sent to ${sub.email}!`, "success");
      } else {
        throw new Error(data.error || "Failed to send launch email");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send launch email";
      showToast(message, "error");
    } finally {
      setActionInProgressId(null);
      setActionType(null);
    }
  };

  // Resend Welcome Email
  const handleResendWelcome = async (sub: Subscriber) => {
    setActionInProgressId(sub.id);
    setActionType("resend");

    try {
      const res = await fetch("/api/admin/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resend_welcome",
          id: sub.id,
          email: sub.email,
          name: sub.name,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`Welcome email dispatched to ${sub.email}!`, "success");
      } else {
        throw new Error(data.error || "Failed to send email");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to resend welcome email";
      showToast(message, "error");
    } finally {
      setActionInProgressId(null);
      setActionType(null);
    }
  };

  // Toggle Status (Active / Unsubscribed)
  const handleToggleStatus = async (sub: Subscriber) => {
    const nextStatus = sub.status === "active" ? "unsubscribed" : "active";
    setActionInProgressId(sub.id);
    setActionType("toggle");

    try {
      const res = await fetch("/api/admin/subscribers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: sub.id,
          status: nextStatus,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSubscribers((prev) =>
          prev.map((s) => (s.id === sub.id ? { ...s, status: nextStatus } : s))
        );
        showToast(`Subscriber marked as ${nextStatus}!`, "success");
      } else {
        throw new Error(data.error || "Failed to update status");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update subscriber status";
      showToast(message, "error");
    } finally {
      setActionInProgressId(null);
      setActionType(null);
    }
  };

  // Delete Subscriber
  const handleDeleteSubscriber = async () => {
    if (!deleteConfirmSubscriber) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/subscribers?id=${deleteConfirmSubscriber.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        setSubscribers((prev) =>
          prev.filter((s) => s.id !== deleteConfirmSubscriber.id)
        );
        showToast("Subscriber deleted successfully.", "success");
        setDeleteConfirmSubscriber(null);
      } else {
        throw new Error(data.error || "Failed to delete subscriber");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete subscriber";
      showToast(message, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Add Subscriber Form Submit
  const handleAddSubscriberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes("@")) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    setSubmittingAdd(true);
    try {
      const res = await fetch("/api/admin/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail.trim(),
          name: newName.trim() || undefined,
          sendWelcome: sendWelcomeOnAdd,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Subscriber added successfully!", "success");
        setIsAddModalOpen(false);
        setNewName("");
        setNewEmail("");
        setSendWelcomeOnAdd(true);
        loadSubscribers();
      } else {
        throw new Error(data.error || "Failed to add subscriber");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to add subscriber";
      showToast(message, "error");
    } finally {
      setSubmittingAdd(false);
    }
  };

  // Export to CSV Helper
  const handleExportCSV = () => {
    if (filteredSubscribers.length === 0) {
      showToast("No subscribers to export.", "error");
      return;
    }

    const headers = ["ID", "Name", "Email", "Status", "Date Subscribed"];
    const rows = filteredSubscribers.map((s) => [
      s.id,
      `"${(s.name || "").replace(/"/g, '""')}"`,
      `"${s.email.replace(/"/g, '""')}"`,
      s.status,
      `"${new Date(s.created_at).toLocaleString()}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `nubb_subscribers_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${filteredSubscribers.length} subscribers to CSV!`);
  };

  const getInitials = (name: string | null, email: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 border-2 nubb-shadow font-arial text-sm font-bold animate-in fade-in slide-in-from-bottom-5 ${
            toastMessage.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-700"
              : "bg-rose-50 text-rose-900 border-[#892F1A]"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-[#892F1A] shrink-0" />
          )}
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 hover:opacity-75 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#4D3F15] pb-4">
        <div>
          <h1 className="font-spray text-3xl sm:text-4xl text-[#4D3F15]">
            Subscribers
          </h1>
          <p className="font-lekton text-xs font-bold uppercase tracking-wider text-[#892F1A] mt-1">
            Early Access & Store Launch Audience
          </p>
        </div>

        <div className="flex items-center gap-2.5 font-lekton text-xs font-bold flex-wrap">
          {/* Send "We Have Launched!" Broadcast Button */}
          <button
            onClick={() => setIsLaunchModalOpen(true)}
            className="px-4 py-2.5 bg-[#892F1A] text-[#E8E6D8] hover:bg-[#4D3F15] transition-colors flex items-center gap-2 nubb-shadow cursor-pointer"
          >
            <Rocket className="w-4 h-4" />
            <span>Send Launch Announcement</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white border-2 border-[#4D3F15] text-[#4D3F15] hover:bg-[#E8E6D8] transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-[#4D3F15] text-[#E8E6D8] hover:bg-[#892F1A] transition-colors flex items-center gap-2 nubb-shadow cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subscriber</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total Subscribers */}
        <div className="bg-white border-2 border-[#4D3F15] p-6 nubb-shadow space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-lekton text-xs font-bold uppercase tracking-wider text-[#4D3F15]/70">
              Total Subscribers
            </span>
            <div className="p-2 bg-[#E8E6D8] border border-[#4D3F15]">
              <Users className="w-4 h-4 text-[#4D3F15]" />
            </div>
          </div>
          <div className="font-lekton font-bold text-3xl text-[#4D3F15]">
            {stats.total}
          </div>
          <p className="font-arial text-xs text-[#4D3F15]/70 font-bold">
            All registered contacts
          </p>
        </div>

        {/* Active Subscribers */}
        <div className="bg-white border-2 border-[#4D3F15] p-6 nubb-shadow space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-lekton text-xs font-bold uppercase tracking-wider text-[#4D3F15]/70">
              Active Subscribers
            </span>
            <div className="p-2 bg-emerald-50 border border-emerald-700">
              <UserCheck className="w-4 h-4 text-emerald-700" />
            </div>
          </div>
          <div className="font-lekton font-bold text-3xl text-emerald-800">
            {stats.active}
          </div>
          <p className="font-arial text-xs text-[#4D3F15]/70 font-bold">
            Receiving store updates & launch email
          </p>
        </div>

        {/* Resend Verified Custom Domain Status */}
        <div className="bg-white border-2 border-[#4D3F15] p-6 nubb-shadow space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-lekton text-xs font-bold uppercase tracking-wider text-[#4D3F15]/70">
              Email Dispatch
            </span>
            <div className="p-2 bg-[#E8E6D8] border border-[#4D3F15]">
              <Sparkles className="w-4 h-4 text-[#892F1A]" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-lekton font-bold text-base text-[#4D3F15]">
              hello@nubb.store
            </span>
          </div>
          <p className="font-arial text-xs text-[#4D3F15]/70 font-bold">
            Resend custom domain active
          </p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white border-2 border-[#4D3F15] p-4 nubb-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4D3F15]/50" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border-2 border-[#4D3F15] font-arial text-sm text-[#4D3F15] focus:outline-none placeholder-[#4D3F15]/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4D3F15]/60 hover:text-[#4D3F15]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs & Refresh */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-lekton text-xs font-bold text-[#4D3F15]/70 uppercase mr-1">
            Status:
          </span>
          {(["all", "active", "unsubscribed"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 font-lekton text-xs font-bold uppercase transition-colors cursor-pointer border ${
                statusFilter === tab
                  ? "bg-[#4D3F15] text-[#E8E6D8] border-[#4D3F15]"
                  : "bg-white text-[#4D3F15] border-[#4D3F15] hover:bg-[#E8E6D8]"
              }`}
            >
              {tab}
            </button>
          ))}

          <button
            onClick={loadSubscribers}
            disabled={loading}
            title="Refresh list"
            className="p-2 border border-[#4D3F15] hover:bg-[#E8E6D8] transition-colors cursor-pointer ml-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white border-2 border-[#4D3F15] nubb-shadow overflow-hidden">
        {loading ? (
          <BrandLoader
            size="lg"
            label="Loading subscribers..."
            className="py-24"
          />
        ) : filteredSubscribers.length === 0 ? (
          <div className="py-20 px-6 text-center space-y-4">
            <div className="w-12 h-12 bg-[#E8E6D8] border-2 border-[#4D3F15] flex items-center justify-center mx-auto text-[#4D3F15]">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-lekton font-bold text-lg text-[#4D3F15]">
                No subscribers found
              </h3>
              <p className="font-arial text-sm text-[#4D3F15]/70 max-w-sm mx-auto mt-1">
                {searchQuery || statusFilter !== "all"
                  ? "No subscriber records matched your active filter or search query."
                  : "No one has joined the subscribers list yet."}
              </p>
            </div>
            {(searchQuery || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className="px-4 py-2 border-2 border-[#4D3F15] font-lekton text-xs font-bold hover:bg-[#E8E6D8] transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#E8E6D8] border-b-2 border-[#4D3F15] font-lekton text-xs font-bold text-[#4D3F15] uppercase tracking-wider">
                  <th className="p-4 pl-6">Subscriber</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Date Joined</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#4D3F15]/10 font-arial text-sm text-[#4D3F15]">
                {filteredSubscribers.map((sub) => {
                  const isActionActive = actionInProgressId === sub.id;

                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-[#F6F5EE] transition-colors group"
                    >
                      {/* Subscriber Name & Avatar */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#4D3F15] text-[#E8E6D8] border border-[#4D3F15] flex items-center justify-center font-lekton font-bold text-xs shrink-0">
                            {getInitials(sub.name, sub.email)}
                          </div>
                          <div>
                            <div className="font-bold text-[#4D3F15] text-sm">
                              {sub.name || (
                                <span className="text-[#4D3F15]/40 italic font-normal">
                                  Not specified
                                </span>
                              )}
                            </div>
                            <div className="font-lekton text-[11px] text-[#4D3F15]/60">
                              ID #{sub.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email Address & Quick Copy */}
                      <td className="p-4 font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <a
                            href={`mailto:${sub.email}`}
                            className="hover:text-[#892F1A] hover:underline font-bold text-sm"
                          >
                            {sub.email}
                          </a>
                          <button
                            onClick={() => handleCopyEmail(sub.email)}
                            title="Copy email"
                            className="p-1 text-[#4D3F15]/40 hover:text-[#4D3F15] transition-colors cursor-pointer"
                          >
                            {copiedEmail === sub.email ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Date Joined */}
                      <td className="p-4 font-lekton text-xs font-bold text-[#4D3F15]/80">
                        {new Date(sub.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      {/* Status Badge */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-lekton font-bold uppercase border ${
                            sub.status === "active"
                              ? "bg-emerald-50 text-emerald-900 border-emerald-700"
                              : "bg-amber-50 text-amber-900 border-amber-700"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              sub.status === "active"
                                ? "bg-emerald-600"
                                : "bg-amber-600"
                            }`}
                          />
                          {sub.status}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2 font-lekton text-xs font-bold">
                          {/* Send Launch Email to this subscriber */}
                          <button
                            onClick={() => handleSendLaunchSingle(sub)}
                            disabled={isActionActive}
                            title="Send Store Launch announcement to this subscriber"
                            className="px-2.5 py-1.5 bg-[#892F1A] text-[#E8E6D8] hover:bg-[#4D3F15] transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            {isActionActive && actionType === "launch_single" ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Rocket className="w-3.5 h-3.5" />
                            )}
                            <span className="hidden lg:inline">Send Launch</span>
                          </button>

                          {/* Send Welcome Email Button */}
                          <button
                            onClick={() => handleResendWelcome(sub)}
                            disabled={isActionActive}
                            title="Resend welcome email via Resend"
                            className="px-2.5 py-1.5 bg-white border border-[#4D3F15] text-[#4D3F15] hover:bg-[#E8E6D8] transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            {isActionActive && actionType === "resend" ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Send className="w-3.5 h-3.5" />
                            )}
                            <span className="hidden lg:inline">Welcome</span>
                          </button>

                          {/* Toggle Status Button */}
                          <button
                            onClick={() => handleToggleStatus(sub)}
                            disabled={isActionActive}
                            title={
                              sub.status === "active"
                                ? "Mark as unsubscribed"
                                : "Reactivate subscriber"
                            }
                            className="p-1.5 bg-white border border-[#4D3F15] text-[#4D3F15] hover:bg-[#E8E6D8] transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {isActionActive && actionType === "toggle" ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : sub.status === "active" ? (
                              <UserX className="w-3.5 h-3.5 text-[#892F1A]" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                            )}
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => setDeleteConfirmSubscriber(sub)}
                            title="Delete subscriber"
                            className="p-1.5 bg-white border border-[#4D3F15] text-[#892F1A] hover:bg-[#892F1A] hover:text-[#E8E6D8] transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* BROADCAST LAUNCH ANNOUNCEMENT MODAL */}
      {isLaunchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F6F5EE] border-3 border-[#4D3F15] max-w-lg w-full p-6 nubb-shadow space-y-6">
            <div className="flex items-center justify-between border-b-2 border-[#4D3F15] pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#892F1A] text-[#E8E6D8]">
                  <Rocket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-spray text-2xl text-[#4D3F15]">
                    Broadcast Launch Announcement
                  </h3>
                  <p className="font-lekton text-xs font-bold text-[#892F1A] uppercase tracking-wider">
                    Notify All Subscribers
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLaunchModalOpen(false)}
                className="text-[#4D3F15] hover:text-[#892F1A] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-white border-2 border-[#4D3F15] space-y-3">
                <div className="flex items-center justify-between border-b border-[#4D3F15]/20 pb-2 font-lekton text-xs font-bold text-[#4D3F15]">
                  <span>Recipients:</span>
                  <span className="text-[#892F1A]">
                    {stats.active} Active Subscriber{stats.active === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-[#4D3F15]/20 pb-2 font-lekton text-xs font-bold text-[#4D3F15]">
                  <span>Sender Address:</span>
                  <span>hello@nubb.store</span>
                </div>
                <div className="space-y-1 font-arial text-xs text-[#4D3F15]">
                  <span className="font-lekton font-bold uppercase text-[11px] text-[#4D3F15]/70 block">
                    Email Subject:
                  </span>
                  <p className="font-bold bg-[#F6F5EE] p-2 border border-[#4D3F15]/30">
                    We are Live! NUBB Store is Officially Open
                  </p>
                </div>
                <div className="space-y-1 font-arial text-xs text-[#4D3F15]">
                  <span className="font-lekton font-bold uppercase text-[11px] text-[#4D3F15]/70 block">
                    Included CTA:
                  </span>
                  <p className="text-[#4D3F15]/80 bg-[#F6F5EE] p-2 border border-[#4D3F15]/30">
                    Links directly to <strong>https://nubb.store</strong> to browse and purchase available pieces.
                  </p>
                </div>
              </div>

              <p className="font-arial text-xs text-[#4D3F15]/80 leading-relaxed font-bold">
                ⚠️ This will trigger automated email dispatch through the Resend API to all {stats.active} verified subscribers on your list.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-[#4D3F15]/20 font-lekton text-xs font-bold">
              <button
                type="button"
                onClick={() => setIsLaunchModalOpen(false)}
                disabled={broadcastingLaunch}
                className="px-4 py-2.5 bg-white border-2 border-[#4D3F15] text-[#4D3F15] hover:bg-[#E8E6D8] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBroadcastLaunch}
                disabled={broadcastingLaunch || stats.active === 0}
                className="px-6 py-2.5 bg-[#892F1A] text-[#E8E6D8] hover:bg-[#4D3F15] transition-colors cursor-pointer flex items-center gap-2 nubb-shadow disabled:opacity-50"
              >
                {broadcastingLaunch ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Broadcasting...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    <span>Send Announcement Now ({stats.active})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD SUBSCRIBER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F6F5EE] border-3 border-[#4D3F15] max-w-md w-full p-6 nubb-shadow space-y-6">
            <div className="flex items-center justify-between border-b-2 border-[#4D3F15] pb-3">
              <div>
                <h3 className="font-spray text-2xl text-[#4D3F15]">
                  Add Subscriber
                </h3>
                <p className="font-lekton text-xs font-bold text-[#892F1A] uppercase tracking-wider">
                  Manual Registration
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#4D3F15] hover:text-[#892F1A] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubscriberSubmit} className="space-y-4">
              <div>
                <label className="block font-lekton font-bold text-xs uppercase tracking-wider text-[#4D3F15] mb-1.5">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maya Chen"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border-2 border-[#4D3F15] font-arial text-sm text-[#4D3F15] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-lekton font-bold text-xs uppercase tracking-wider text-[#4D3F15] mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. maya@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border-2 border-[#4D3F15] font-arial text-sm text-[#4D3F15] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="sendWelcome"
                  checked={sendWelcomeOnAdd}
                  onChange={(e) => setSendWelcomeOnAdd(e.target.checked)}
                  className="w-4 h-4 accent-[#4D3F15] cursor-pointer"
                />
                <label
                  htmlFor="sendWelcome"
                  className="font-arial text-xs font-bold text-[#4D3F15] cursor-pointer"
                >
                  Send welcome email immediately via Resend
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-[#4D3F15]/20">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-white border-2 border-[#4D3F15] font-lekton text-xs font-bold text-[#4D3F15] hover:bg-[#E8E6D8] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdd}
                  className="px-5 py-2 bg-[#4D3F15] text-[#E8E6D8] font-lekton text-xs font-bold hover:bg-[#892F1A] transition-colors cursor-pointer flex items-center gap-2 nubb-shadow disabled:opacity-50"
                >
                  {submittingAdd ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Add to List</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmSubscriber && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-3 border-[#4D3F15] max-w-md w-full p-6 nubb-shadow space-y-4">
            <div className="flex items-center gap-3 text-[#892F1A]">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-spray text-2xl text-[#4D3F15]">
                Confirm Deletion
              </h3>
            </div>

            <p className="font-arial text-sm text-[#4D3F15] leading-relaxed">
              Are you sure you want to remove{" "}
              <strong>{deleteConfirmSubscriber.email}</strong> from the subscriber
              list? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-[#4D3F15]/20 font-lekton text-xs font-bold">
              <button
                type="button"
                onClick={() => setDeleteConfirmSubscriber(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-white border-2 border-[#4D3F15] text-[#4D3F15] hover:bg-[#E8E6D8] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubscriber}
                disabled={isDeleting}
                className="px-5 py-2 bg-[#892F1A] text-[#E8E6D8] hover:bg-[#4D3F15] transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
