"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import type { ReactElement } from "react";
import { BackButton } from "@/components/ui/BackButton";
import { verifyEmail } from "@/modules/auth-api";

type VerifyEmailPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default function VerifyEmailPage({
  params,
}: VerifyEmailPageProps): ReactElement {
  const [token, setToken] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    let isMounted = true;

    params
      .then(({ token: nextToken }) => {
        if (isMounted) setToken(nextToken);
      })
      .catch(() => {
        if (!isMounted) return;
        setState("error");
        setMessage("Invalid verification link.");
      });

    return () => {
      isMounted = false;
    };
  }, [params]);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    verifyEmail({ token })
      .then((response) => {
        if (!isMounted) return;
        setState("success");
        setMessage(response.message ?? "Email verified successfully.");
      })
      .catch((error) => {
        if (!isMounted) return;
        setState("error");
        setMessage(
          error instanceof Error ? error.message : "Email verification failed.",
        );
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const isSuccess = state === "success";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <section className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center gap-5 text-center">
        <BackButton fallbackHref="/" className="self-start" />

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full ${
            isSuccess
              ? "bg-emerald-50 text-emerald-700"
              : state === "error"
                ? "bg-red-50 text-red-700"
                : "bg-blue-50 text-blue-700"
          }`}
        >
          {state === "error" ? (
            <XCircle size={28} aria-hidden="true" />
          ) : (
            <CheckCircle2 size={28} aria-hidden="true" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-slate-950">
          {isSuccess ? "Email verified" : "Email verification"}
        </h1>
        <p className="text-sm leading-6 text-slate-600">{message}</p>

        <Link
          href="/login"
          className="inline-flex h-11 items-center justify-center rounded-md bg-[#004ac6] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#2c5b9e]"
        >
          Continue to sign in
        </Link>
      </section>
    </main>
  );
}
