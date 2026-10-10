"use client";

import { useState } from "react";

export function BillingActions({ isSubscribed }: { isSubscribed: boolean }) {
  const [isLoading, setIsLoading] = useState(false);

  async function go(path: string) {
    setIsLoading(true);
    try {
      const res = await fetch(path, { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={() => go(isSubscribed ? "/api/stripe/portal" : "/api/stripe/checkout")}
      className="bg-ink rounded-pill text-d16 shadow-bar mt-8 w-full py-2 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {isLoading ? "Loading…" : isSubscribed ? "Manage subscription" : "Upgrade"}
    </button>
  );
}
