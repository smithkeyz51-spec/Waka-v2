"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import {
  City,
  COMMON_STOPS,
  TIME_LABELS,
  TimeOfDay,
  VEHICLE_LABELS,
  VehicleType,
} from "@/lib/types";

interface Props {
  city: City | string;
  onSubmit: (fare: {
    city: string;
    from: string;
    to: string;
    amount: number;
    vehicleType: VehicleType;
    timeOfDay: TimeOfDay;
    note?: string;
  }) => Promise<{ error: string | null }>;
}

function currentTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 20) return "evening";
  return "night";
}

export default function LogFareForm({ city, onSubmit }: Props) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleType>("danfo");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(currentTimeOfDay());
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const stops = COMMON_STOPS[city] ?? [];

  function reset() {
    setFrom("");
    setTo("");
    setAmount("");
    setVehicleType("danfo");
    setTimeOfDay(currentTimeOfDay());
    setNote("");
    setError("");
  }

  async function handleSubmit() {
    if (!from.trim() || !to.trim()) {
      setError("Add where you boarded and where you got down.");
      return;
    }
    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) {
      setError("Enter how much you paid.");
      return;
    }

    setSubmitting(true);
    setError("");

    const { error: submitError } = await onSubmit({
      city,
      from: from.trim(),
      to: to.trim(),
      amount: amountNum,
      vehicleType,
      timeOfDay,
      note: note.trim() || undefined,
    });

    setSubmitting(false);

    if (submitError) {
      setError(submitError);
      return;
    }

    reset();
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1A1A1A] text-[#F7C548] font-display font-semibold py-3.5 hover:bg-[#1A1A1A]/90 transition-colors"
      >
        <Plus size={18} strokeWidth={2.5} />
        Log a fare
      </button>
    );
  }

  return (
    <div className="rounded-xl border-2 border-[#1A1A1A]/10 bg-white p-4 space-y-3.5">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-[#1A1A1A]">
          Log a fare in {city}
        </h3>
        <button
          onClick={() => {
            setOpen(false);
            reset();
          }}
          className="text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="text-xs font-medium text-[#1A1A1A]/60 block mb-1">
            From
          </label>
          <input
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            list="from-stops"
            placeholder="e.g. Ojota"
            className="w-full rounded-lg border-2 border-[#1A1A1A]/10 px-3 py-2 text-sm focus:border-[#F7C548] outline-none"
          />
          <datalist id="from-stops">
            {stops.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="text-xs font-medium text-[#1A1A1A]/60 block mb-1">
            To
          </label>
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            list="to-stops"
            placeholder="e.g. CMS"
            className="w-full rounded-lg border-2 border-[#1A1A1A]/10 px-3 py-2 text-sm focus:border-[#F7C548] outline-none"
          />
          <datalist id="to-stops">
            {stops.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="text-xs font-medium text-[#1A1A1A]/60 block mb-1">
            Amount (₦)
          </label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
            inputMode="numeric"
            placeholder="e.g. 400"
            className="w-full rounded-lg border-2 border-[#1A1A1A]/10 px-3 py-2 text-sm focus:border-[#F7C548] outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-[#1A1A1A]/60 block mb-1">
            Vehicle
          </label>
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value as VehicleType)}
            className="w-full rounded-lg border-2 border-[#1A1A1A]/10 px-3 py-2 text-sm focus:border-[#F7C548] outline-none bg-white"
          >
            {Object.entries(VEHICLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-[#1A1A1A]/60 block mb-1">
          Time of day
        </label>
        <div className="flex gap-1.5">
          {Object.entries(TIME_LABELS).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTimeOfDay(value as TimeOfDay)}
              className={`flex-1 rounded-lg py-1.5 text-xs font-medium border-2 transition-colors ${
                timeOfDay === value
                  ? "bg-[#F7C548] border-[#F7C548] text-[#1A1A1A]"
                  : "border-[#1A1A1A]/10 text-[#1A1A1A]/50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-[#1A1A1A]/60 block mb-1">
          Note (optional)
        </label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. rush hour, price don increase"
          className="w-full rounded-lg border-2 border-[#1A1A1A]/10 px-3 py-2 text-sm focus:border-[#F7C548] outline-none"
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#1A1A1A] text-[#F7C548] font-display font-semibold py-2.5 hover:bg-[#1A1A1A]/90 transition-colors disabled:opacity-60"
      >
        {submitting && <Loader2 size={16} className="animate-spin" />}
        {submitting ? "Saving..." : "Save fare"}
      </button>
    </div>
  );
}
