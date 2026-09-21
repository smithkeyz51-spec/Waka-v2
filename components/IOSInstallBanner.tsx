"use client";

import { useEffect, useState } from "react";
import { Share, X, Smartphone } from "lucide-react";

const DISMISS_KEY = "waka:ios-install-banner-dismissed";

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export default function IOSInstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) return;
    if (isIOS() && !isStandalone()) {
      setShow(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="rounded-xl border-2 border-[#2E7D5B]/25 bg-[#2E7D5B]/8 p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#2E7D5B] flex items-center justify-center shrink-0">
          <Smartphone size={18} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-[#1A1A1A]">
              Get fare alerts on your iPhone
            </p>
            <button
              onClick={dismiss}
              className="text-[#1A1A1A]/30 shrink-0"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-xs text-[#1A1A1A]/55 mt-1">
            Add Waka to your Home Screen first — notifications can only
            reach an iPhone that way.
          </p>
          <ol className="mt-2.5 space-y-1.5 text-xs text-[#1A1A1A]/70">
            <li className="flex items-start gap-1.5">
              <span className="font-semibold shrink-0">1.</span>
              <span className="flex items-center gap-1">
                Tap the Share button
                <Share size={12} className="inline shrink-0" />
                in Safari.
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="font-semibold shrink-0">2.</span>
              Choose <span className="font-medium">Add to Home Screen</span>.
            </li>
            <li className="flex items-start gap-1.5">
              <span className="font-semibold shrink-0">3.</span>
              Open Waka from your Home Screen and turn on notifications
              from your Account page.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
