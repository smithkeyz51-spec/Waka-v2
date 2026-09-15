"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Trash2, ShieldOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import { CITIES, Fare, FareRow, rowToFare } from "@/lib/types";

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

  async function handleDelete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("fares").delete().eq("id", id);
    if (!error) {
      setFares((prev) => prev.filter((f) => f.id !== id));
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
        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded-xl border-2 border-[#1A1A1A]/10 bg-white p-3 text-center">
            <p className="font-display text-2xl font-bold text-[#1A1A1A]">
              {stats.total}
            </p>
            <p className="text-[11px] text-[#1A1A1A]/50">Total fares</p>
          </div>
          <div className="rounded-xl border-2 border-[#1A1A1A]/10 bg-white p-3 text-center">
            <p className="font-display text-2xl font-bold text-[#1A1A1A]">
              {stats.last24h}
            </p>
            <p className="text-[11px] text-[#1A1A1A]/50">Last 24h</p>
          </div>
          <div className="rounded-xl border-2 border-[#1A1A1A]/10 bg-white p-3 text-center">
            <p className="font-display text-2xl font-bold text-[#1A1A1A]">
              {Object.keys(stats.byCity).length}
            </p>
            <p className="text-[11px] text-[#1A1A1A]/50">Active cities</p>
          </div>
        </div>

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
                className="rounded-lg border-2 border-[#1A1A1A]/10 bg-white p-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#1A1A1A] truncate">
                    {fare.from} → {fare.to}{" "}
                    <span className="text-[#1A1A1A]/40 font-normal">
                      ({fare.city})
                    </span>
                  </p>
                  <p className="text-[11px] text-[#1A1A1A]/45">
                    ₦{fare.amount.toLocaleString()} ·{" "}
                    {fare.userId ? "registered user" : "guest"} ·{" "}
                    {new Date(fare.createdAt).toLocaleString()}
                  </p>
                  {fare.note && (
                    <p className="text-[11px] text-[#1A1A1A]/40 italic truncate">
                      &ldquo;{fare.note}&rdquo;
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(fare.id)}
                  className="text-[#1A1A1A]/30 hover:text-red-600 shrink-0"
                  aria-label="Delete fare"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
