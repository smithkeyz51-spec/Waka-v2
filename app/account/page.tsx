"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { signOut } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { Fare, FareRow, rowToFare } from "@/lib/types";
import FareCard from "@/components/FareCard";

export default function AccountPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [myFares, setMyFares] = useState<Fare[]>([]);
  const [loadingFares, setLoadingFares] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;

    async function loadMyFares() {
      const supabase = createClient();
      const { data } = await supabase
        .from("fares")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      setMyFares(((data as FareRow[]) ?? []).map(rowToFare));
      setLoadingFares(false);
    }

    loadMyFares();
  }, [user]);

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("fares").delete().eq("id", id);
    if (!error) {
      setMyFares((prev) => prev.filter((f) => f.id !== id));
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FEFDF9]">
        <Loader2 size={22} className="animate-spin text-[#1A1A1A]/30" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FEFDF9]">
      <header className="border-b-4 border-[#111111] bg-[#F7C548]">
        <div className="mx-auto max-w-3xl px-5 py-5 flex items-center gap-3">
          <Link href="/" className="text-[#1A1A1A]">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-display text-xl font-bold text-[#1A1A1A]">
            Account
          </h1>
        </div>
        <div className="h-2 bg-[#111111]" />
      </header>

      <main className="flex-1 mx-auto max-w-3xl w-full px-5 py-6 space-y-5">
        <div className="rounded-xl border-2 border-[#1A1A1A]/10 bg-white p-4">
          <p className="text-xs text-[#1A1A1A]/50">Signed in as</p>
          <p className="font-medium text-[#1A1A1A] truncate">{user.email}</p>

          {isAdmin && (
            <Link
              href="/admin"
              className="mt-3 flex items-center gap-1.5 text-sm font-medium text-[#2E7D5B]"
            >
              <ShieldCheck size={15} />
              Open admin dashboard
            </Link>
          )}

          <button
            onClick={handleSignOut}
            className="mt-3 flex items-center gap-1.5 text-sm font-medium text-red-600"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>

        <div>
          <h2 className="font-display font-semibold text-[#1A1A1A] mb-2.5">
            Your logged fares
          </h2>
          <div className="space-y-2.5">
            {loadingFares ? (
              <div className="flex justify-center py-10">
                <Loader2
                  size={20}
                  className="animate-spin text-[#1A1A1A]/30"
                />
              </div>
            ) : myFares.length === 0 ? (
              <p className="text-sm text-[#1A1A1A]/45 text-center py-10">
                You haven&apos;t logged any fares yet.
              </p>
            ) : (
              myFares.map((fare) => (
                <FareCard
                  key={fare.id}
                  fare={fare}
                  canDelete
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
