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
      className="mt-8 w-full rounded-full bg-terracotta py-3.5 text-sm font-semibold text-cream disabled:bg-terracotta-soft"
    >
      {isLoading ? "Loading…" : isSubscribed ? "Manage subscription" : "Upgrade"}
    </button>
  );
}
