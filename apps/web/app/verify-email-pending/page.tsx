"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import type { ReactElement } from "react";
import { resendVerificationEmail } from "@/modules/auth-api";

export default function VerifyEmailPendingPage(): ReactElement {
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    if (isResending) return;

    setIsResending(true);
    setStatus("idle");
    setMessage("");

    try {
      const response = await resendVerificationEmail();
      setStatus("sent");
      setMessage(response.message ?? "Verification email sent.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not resend verification email.",
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <section className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-700">
            <MailCheck size={28} aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-slate-950">
            Verify your email
          </h1>
          <p className="text-sm leading-6 text-slate-600">
            We sent a verification link to your inbox. Only the newest link will
            work after you resend.
          </p>
        </div>

        {message && (
          <p
            className={`rounded-md border px-4 py-3 text-sm ${
              status === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-blue-200 bg-blue-50 text-blue-800"
            }`}
          >
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="h-11 rounded-md bg-[#004ac6] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#2c5b9e] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isResending ? "Sending..." : "Resend verification email"}
        </button>

        <Link
          href="/"
          className="text-center text-sm font-medium text-blue-700 hover:underline"
        >
          Back to home
        </Link>
      </section>
    </main>
  );
}
