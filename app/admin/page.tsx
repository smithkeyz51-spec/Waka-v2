"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, EyeOff, Eye, ShieldOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import { CITIES, Fare, FareRow, rowToFare } from "@/lib/types";
import { hideFare, unhideFare } from "@/lib/fares";

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [fares, setFares] = useState<Fare[]>([]);
  const [loadingFares, setLoadingFares] = useState(true);
  const [cityFilter, setCityFilter] = useState<string>("All");

  useEffect(() => {
    if (loading) return;
    if (!user || !isAdmin) {
      router.push("/");
    }
  }, [loading, user, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin) return;

    async function loadAll() {
      const supabase = createClient();
      const { data } = await supabase
        .from("fares")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      setFares(((data as FareRow[]) ?? []).map(rowToFare));
      setLoadingFares(false);
    }

    loadAll();
  }, [isAdmin]);

  async function handleHideToggle(fare: Fare) {
    const action = fare.hidden ? unhideFare : hideFare;
    const { success } = await action(fare.id);
    if (success) {
      setFares((prev) =>
        prev.map((f) =>
          f.id === fare.id ? { ...f, hidden: !fare.hidden } : f
        )
      );
    }
  }

  const filtered = useMemo(() => {
    if (cityFilter === "All") return fares;
    return fares.filter((f) => f.city === cityFilter);
  }, [fares, cityFilter]);

  const stats = useMemo(() => {
    const byCity: Record<string, number> = {};
    fares.forEach((f) => {
      byCity[f.city] = (byCity[f.city] ?? 0) + 1;
    });
    return {
      total: fares.length,
      byCity,
      last24h: fares.filter(
        (f) => Date.now() - f.createdAt < 1000 * 60 * 60 * 24
      ).length,
      hidden: fares.filter((f) => f.hidden).length,
    };
  }, [fares]);

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FEFDF9]">
        <Loader2 size={22} className="animate-spin text-[#1A1A1A]/30" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FEFDF9]">
      <header className="border-b-4 border-[#111111] bg-[#1A1A1A]">
        <div className="mx-auto max-w-3xl px-5 py-5 flex items-center gap-3">
          <Link href="/account" className="text-[#F7C548]">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-display text-xl font-bold text-[#F7C548]">
            Admin dashboard
          </h1>
        </div>
        <div className="h-2 bg-[#F7C548]" />
      </header>

      <main className="flex-1 mx-auto max-w-3xl w-full px-5 py-6 space-y-5">
        <div className="grid grid-cols-4 gap-2">
          <div className="rounded-xl border-2 border-[#1A1A1A]/10 bg-white p-3 text-center">
            <p className="font-display text-xl font-bold text-[#1A1A1A]">
              {stats.total}
            </p>
            <p className="text-[10px] text-[#1A1A1A]/50">Total</p>
          </div>
          <div className="rounded-xl border-2 border-[#1A1A1A]/10 bg-white p-3 text-center">
            <p className="font-display text-xl font-bold text-[#1A1A1A]">
              {stats.last24h}
            </p>
            <p className="text-[10px] text-[#1A1A1A]/50">Last 24h</p>
          </div>
          <div className="rounded-xl border-2 border-[#1A1A1A]/10 bg-white p-3 text-center">
            <p className="font-display text-xl font-bold text-[#1A1A1A]">
              {Object.keys(stats.byCity).length}
            </p>
            <p className="text-[10px] text-[#1A1A1A]/50">Cities</p>
          </div>
          <div className="rounded-xl border-2 border-[#1A1A1A]/10 bg-white p-3 text-center">
            <p className="font-display text-xl font-bold text-[#1A1A1A]">
              {stats.hidden}
            </p>
            <p className="text-[10px] text-[#1A1A1A]/50">Hidden</p>
          </div>
        </div>

        <p className="text-xs text-[#1A1A1A]/45 -mt-2">
          Hiding a fare removes it from the public feed only — it still
          shows on the user&apos;s own account and still counts toward
          their contributor total.
        </p>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setCityFilter("All")}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border-2 ${
              cityFilter === "All"
                ? "bg-[#1A1A1A] border-[#1A1A1A] text-[#F7C548]"
                : "border-[#1A1A1A]/15 text-[#1A1A1A]/60"
            }`}
          >
            All ({stats.total})
          </button>
          {CITIES.map((c) => (
            <button
              key={c}
              onClick={() => setCityFilter(c)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border-2 ${
                cityFilter === c
                  ? "bg-[#1A1A1A] border-[#1A1A1A] text-[#F7C548]"
                  : "border-[#1A1A1A]/15 text-[#1A1A1A]/60"
              }`}
            >
              {c} ({stats.byCity[c] ?? 0})
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {loadingFares ? (
            <div className="flex justify-center py-14">
              <Loader2 size={22} className="animate-spin text-[#1A1A1A]/30" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-14">
              <ShieldOff size={22} className="mx-auto text-[#1A1A1A]/20 mb-2" />
              <p className="text-sm text-[#1A1A1A]/45">
                No fares for this filter.
              </p>
            </div>
          ) : (
            filtered.map((fare) => (
              <div
                key={fare.id}
                className={`rounded-lg border-2 p-3 flex items-center justify-between gap-3 ${
                  fare.hidden
                    ? "border-red-200 bg-red-50/50"
                    : "border-[#1A1A1A]/10 bg-white"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#1A1A1A] truncate">
                    {fare.from} → {fare.to}{" "}
                    <span className="text-[#1A1A1A]/40 font-normal">
                      ({fare.city})
                    </span>
                    {fare.hidden && (
                      <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium">
                        Hidden
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-[#1A1A1A]/45">
                    ₦{fare.amount.toLocaleString()} ·{" "}
                    {fare.userName ||
                      (fare.userId ? "registered user" : "guest")}{" "}
                    · {new Date(fare.createdAt).toLocaleString()}
                  </p>
                  {fare.note && (
                    <p className="text-[11px] text-[#1A1A1A]/40 italic truncate">
                      &ldquo;{fare.note}&rdquo;
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleHideToggle(fare)}
                  className={`shrink-0 ${
                    fare.hidden
                      ? "text-[#2E7D5B]"
                      : "text-[#1A1A1A]/30 hover:text-red-600"
                  }`}
                  aria-label={fare.hidden ? "Unhide fare" : "Hide fare"}
                >
                  {fare.hidden ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
