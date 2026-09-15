"use client";

import { Bell } from "lucide-react";
import { Fare } from "@/lib/types";

interface Props {
  fare: Fare;
  onDismiss: () => void;
  onView: () => void;
}

export default function NewFareToast({ fare, onDismiss, onView }: Props) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm z-50">
      <button
        onClick={onView}
        className="w-full bg-[#1A1A1A] text-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 text-left"
      >
        <div className="w-8 h-8 rounded-full bg-[#F7C548] flex items-center justify-center shrink-0">
          <Bell size={14} className="text-[#1A1A1A]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">
            New fare: {fare.from} → {fare.to}
          </p>
          <p className="text-xs text-white/60">
            ₦{fare.amount.toLocaleString()} in {fare.city} · tap to view
          </p>
        </div>
        <span
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="text-white/40 text-xs px-1.5 shrink-0"
        >
          ✕
        </span>
      </button>
    </div>
  );
}
