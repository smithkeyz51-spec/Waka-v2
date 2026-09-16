"use client";

import { Bus, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function Header() {
  const { user, isAdmin, displayName, loading } = useAuth();

  return (
    <header className="border-b-4 border-[#111111] bg-[#F7C548]">
      <div className="mx-auto max-w-3xl px-5 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md bg-[#111111] flex items-center justify-center shrink-0">
            <Bus size={20} className="text-[#F7C548]" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold leading-none tracking-tight text-[#1A1A1A]">
              Waka
            </h1>
            <p className="text-[11px] text-[#1A1A1A]/70 leading-none mt-1">
              Know the fare before you board
            </p>
          </div>
        </div>

        {!loading && (
          <Link
            href={user ? "/account" : "/sign-in"}
            className="flex items-center gap-1.5 bg-[#1A1A1A] text-[#F7C548] rounded-full px-3 py-1.5 text-xs font-medium"
          >
            <UserIcon size={13} />
            {user ? (isAdmin ? "Admin" : "Account") : "Sign in"}
          </Link>
        )}
      </div>
      <div className="h-2 bg-[#111111]" />

      {!loading && user && (
        <div className="bg-[#1A1A1A] px-5 py-2">
          <p className="mx-auto max-w-3xl text-sm text-[#F7C548] font-medium">
            Welcome, {displayName || user.email?.split("@")[0]} 👋
          </p>
        </div>
      )}
    </header>
  );
}
