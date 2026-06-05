"use client";

import Link from "next/link";
import { useState, type ReactElement } from "react";
import { resendVerificationCode, verifyEmail } from "../auth-api";

export interface VerifyEmailPageProps {
  initialEmail?: string;
}

export default function VerifyEmailPage({
  initialEmail = "",
}: VerifyEmailPageProps): ReactElement {
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const submitVerification = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      await verifyEmail({ email, code });
      setMessage("Email verified. You can now sign in.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Email verification failed",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendCode = async () => {
    setError("");
    setMessage("");
    setIsResending(true);

    try {
      await resendVerificationCode({ email });
      setMessage("A new verification code was sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend code");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-lg shadow p-10 flex flex-col">
          <div className="flex items-center justify-center gap-2 text-2xl font-bold text-blue-600 mb-6">
            AI Study Hub
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Verify email
          </h1>
          <p className="text-center text-gray-600 text-sm mb-8">
            Enter the verification code sent to your email.
          </p>

          <form className="flex flex-col gap-4" onSubmit={submitVerification}>
            <label className="flex flex-col gap-2 text-sm font-semibold text-gray-900">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 rounded border border-gray-300 bg-gray-100 px-4 text-sm text-gray-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                required
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold text-gray-900">
              Code
              <input
                type="text"
                inputMode="numeric"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="h-12 rounded border border-gray-300 bg-gray-100 px-4 text-sm text-gray-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                required
              />
            </label>

            <button
              type="submit"
              className="h-12 rounded bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Verifying..." : "Verify email"}
            </button>
          </form>

          <button
            type="button"
            onClick={resendCode}
            disabled={!email || isResending}
            className="mt-3 h-11 rounded border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            {isResending ? "Sending..." : "Resend code"}
          </button>

          {message && (
            <div className="mt-4 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {message}
            </div>
          )}
          {error && (
            <div className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <Link
            href="/login"
            className="mt-6 text-center text-sm font-semibold text-blue-600 hover:underline"
          >
            Continue to login
          </Link>
        </div>
      </div>
    </div>
  );
}
