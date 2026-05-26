"use client";

import { useState } from "react";
import Link from "next/link";
import type { ReactElement } from "react";
import { Button } from "@repo/ui/button";

export default function ForgotPasswordPage(): ReactElement {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setSubmitted(true);
  };

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
                d="M4 19.5V4.5C4 4.10218 4.15804 3.72064 4.43934 3.43934C4.72064 3.15804 5.10218 3 5.5 3H18.5C18.8978 3 19.2794 3.15804 19.5607 3.43934C19.842 3.72064 20 4.10218 20 4.5V19.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 19.5C4 19.9023 4.15964 20.2882 4.44411 20.5727C4.72859 20.8571 5.11453 21.0167 5.51675 21H18.4832C18.8855 21.0167 19.2714 20.8571 19.5559 20.5727C19.8404 20.2882 20 19.9023 20 19.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 7H16M8 11H16M8 15H12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            AI Study Hub
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Forgot password
          </h1>
          <p className="text-center text-gray-600 text-sm mb-8">
            Enter your email and we will send a link to reset your password.
          </p>

          {submitted ? (
            <div className="flex flex-col gap-6">
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
                We sent a reset link to{" "}
                <span className="font-semibold">{email}</span>. Check your inbox
                and spam folder if needed.
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  appName="web"
                  className="w-full h-12 bg-blue-600 text-white font-semibold hover:bg-blue-700 rounded"
                  onClick={() => setSubmitted(false)}
                >
                  Send again
                </Button>
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center rounded border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Back to login
                </Link>
              </div>
            </div>
          ) : (
            <form
              className="flex flex-col gap-5"
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="text-sm font-bold text-gray-900"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className={`w-full h-12 px-4 bg-gray-100 border rounded text-gray-900 text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition-all ${
                    error ? "border-red-600" : "border-gray-300"
                  }`}
                  placeholder="example@academic.edu"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (error) {
                      setError("");
                    }
                  }}
                />
                {error ? (
                  <span className="text-red-600 text-xs mt-1">{error}</span>
                ) : null}
              </div>

              <Button
                appName="web"
                className="w-full h-12 bg-blue-600 text-white font-semibold hover:bg-blue-700 rounded mt-2"
                type="submit"
              >
                Send reset link
              </Button>

              <div className="text-center text-sm text-gray-600">
                Remembered your password?{" "}
                <Link
                  href="/login"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
