"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bus, Loader2 } from "lucide-react";
import { signIn, signUp } from "@/lib/auth";

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");

  async function handleSubmit() {
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    setError("");
    setConfirmMessage("");

    if (mode === "sign-up") {
      const { error: signUpError } = await signUp(email.trim(), password);
      setSubmitting(false);
      if (signUpError) {
        setError(signUpError);
        return;
      }
      setConfirmMessage(
        "Account created. Check your email to confirm, then sign in."
      );
      setMode("sign-in");
      return;
    }

    const { error: signInError } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (signInError) {
      setError(signInError);
      return;
    }
    router.push("/");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FEFDF9]">
      <div className="flex-1 flex flex-col justify-center px-6 py-10 max-w-sm mx-auto w-full">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#1A1A1A] flex items-center justify-center mb-3">
            <Bus size={24} className="text-[#F7C548]" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-2xl font-bold text-[#1A1A1A]">
            {mode === "sign-in" ? "Welcome back" : "Create an account"}
          </h1>
          <p className="text-sm text-[#1A1A1A]/50 mt-1 text-center">
            {mode === "sign-in"
              ? "Sign in to log fares under your name"
              : "Join Waka to track your logged fares"}
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-[#1A1A1A]/60 block mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border-2 border-[#1A1A1A]/10 px-3 py-2.5 text-sm focus:border-[#F7C548] outline-none bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#1A1A1A]/60 block mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full rounded-lg border-2 border-[#1A1A1A]/10 px-3 py-2.5 text-sm focus:border-[#F7C548] outline-none bg-white"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
          {confirmMessage && (
            <p className="text-xs text-[#2E7D5B]">{confirmMessage}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#1A1A1A] text-[#F7C548] font-display font-semibold py-3 hover:bg-[#1A1A1A]/90 transition-colors disabled:opacity-60"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {mode === "sign-in" ? "Sign in" : "Create account"}
          </button>

          <button
            onClick={() =>
              setMode(mode === "sign-in" ? "sign-up" : "sign-in")
            }
            className="w-full text-center text-sm text-[#1A1A1A]/60 py-1"
          >
            {mode === "sign-in"
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[#1A1A1A]/10" />
          <span className="text-xs text-[#1A1A1A]/40">or</span>
          <div className="flex-1 h-px bg-[#1A1A1A]/10" />
        </div>

        <Link
          href="/"
          className="w-full text-center rounded-lg border-2 border-[#1A1A1A]/15 py-3 text-sm font-medium text-[#1A1A1A]/70"
        >
          Continue as guest
        </Link>
        <p className="text-[11px] text-[#1A1A1A]/40 text-center mt-2">
          You can still log fares as a guest — sign in later to manage them.
        </p>
      </div>
    </div>
  );
}
