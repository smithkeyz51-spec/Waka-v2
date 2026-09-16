"use client";

import { useEffect, useState } from "react";
import { Bus } from "lucide-react";

export default function SplashScreen({
  onFinish,
}: {
  onFinish: () => void;
}) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 900);
    const removeTimer = setTimeout(() => {
      setVisible(false);
      onFinish();
    }, 1300);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onFinish]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#1A1A1A] flex flex-col items-center justify-center transition-opacity duration-400 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="w-20 h-20 rounded-2xl bg-[#F7C548] flex items-center justify-center animate-[splashPulse_1.1s_ease-in-out]">
        <Bus size={40} className="text-[#1A1A1A]" strokeWidth={2.2} />
      </div>
      <p className="mt-5 font-display text-2xl font-bold text-[#F7C548] tracking-tight">
        Waka
      </p>
      <p className="mt-1 text-xs text-[#F7C548]/60">
        Know the fare before you board
      </p>

      <style>{`
        @keyframes splashPulse {
          0% { transform: scale(0.85); opacity: 0; }
          40% { transform: scale(1.05); opacity: 1; }
          70% { transform: scale(0.98); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
