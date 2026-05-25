import Link from "next/link";
import type { ReactElement } from "react";

export interface VerifyEmailPageProps {
  token?: string;
}

export default function VerifyEmailPage({
  token,
}: VerifyEmailPageProps): ReactElement {
  const tokenValue = token ?? "";

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-lg shadow p-12 flex flex-col">
          <div className="flex items-center justify-center gap-2 text-2xl font-bold text-blue-600 mb-6">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 4H20V20H4V4Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 7.5L12 13L20 7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            AI Study Hub
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Email verified
          </h1>
          <p className="text-center text-gray-600 text-sm mb-8">
            Your account is ready.
          </p>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 mb-6">
            You can now continue to login and sign in with your account.
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex h-12 flex-1 items-center justify-center rounded bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Continue to login
            </Link>
            <Link
              href="/forgot-password"
              className="inline-flex h-12 flex-1 items-center justify-center rounded border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Reset password
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
