"use client";

import React, { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

// Inline email signup for the store footer; posts to the same endpoint as the coming-soon page.
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setStatus("success");
      setMessage(data.message || "You're on the list.");
      setEmail("");
    } catch (err: unknown) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="relative">
        <label htmlFor="footer-newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="footer-newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          disabled={status === "loading"}
          className="nubb-input pr-14 border-nubb-orange"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          aria-label="Join the list"
          className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 inline-flex items-center justify-center text-nubb-orange hover:text-nubb-crimson transition-colors cursor-pointer disabled:opacity-50"
        >
          {status === "loading" ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
        </button>
      </div>
      {message && (
        <p
          role="status"
          className={`mt-2 font-body text-xs font-bold ${status === "error" ? "text-nubb-crimson" : "text-nubb-brown"}`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
