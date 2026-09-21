"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import {
  isPushSupported,
  isSubscribedToPush,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push";

export default function NotificationToggle() {
  const [supported, setSupported] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function check() {
      const ok = isPushSupported();
      setSupported(ok);
      if (ok) {
        setSubscribed(await isSubscribedToPush());
      }
      setLoading(false);
    }
    check();
  }, []);

  async function handleToggle() {
    setBusy(true);
    setError("");

    if (subscribed) {
      const { success, error: err } = await unsubscribeFromPush();
      if (success) setSubscribed(false);
      else if (err) setError(err);
    } else {
      const { success, error: err } = await subscribeToPush();
      if (success) setSubscribed(true);
      else if (err) setError(err);
    }

    setBusy(false);
  }

  if (loading) return null;

  if (!supported) {
    return (
      <div className="rounded-xl border-2 border-[#1A1A1A]/10 bg-white p-4">
        <div className="flex items-center gap-2 text-[#1A1A1A]/50">
          <BellOff size={16} />
          <p className="text-sm">
            Notifications aren&apos;t supported in this browser. On iPhone,
            add Waka to your Home Screen first, then try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-[#1A1A1A]/10 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#F7C548]/30 flex items-center justify-center shrink-0">
            <Bell size={15} className="text-[#1A1A1A]/70" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#1A1A1A]">
              Fare notifications
            </p>
            <p className="text-xs text-[#1A1A1A]/45">
              Get notified when a new fare is logged
            </p>
          </div>
        </div>
        <button
          onClick={handleToggle}
          disabled={busy}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors disabled:opacity-60 ${
            subscribed
              ? "bg-[#1A1A1A] text-[#F7C548]"
              : "border-2 border-[#1A1A1A]/15 text-[#1A1A1A]/60"
          }`}
        >
          {busy ? (
            <Loader2 size={13} className="animate-spin" />
          ) : subscribed ? (
            "On"
          ) : (
            "Turn on"
          )}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}
