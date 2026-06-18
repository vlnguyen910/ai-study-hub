"use client";

import { useState } from "react";
import Link from "next/link";
import type { ReactElement } from "react";
import { BackButton } from "@/components/ui/BackButton";
import { forgotPassword } from "../auth-api";

export default function ForgotPasswordPage(): ReactElement {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email) {
      setError("Vui lòng nhập email.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Vui lòng nhập địa chỉ email hợp lệ.");
      return;
    }

    setError("");
    setApiError("");
    setIsSubmitting(true);

    try {
      await forgotPassword({ email });
      setSubmitted(true);
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Không thể gửi liên kết đặt lại mật khẩu.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface text-on-surface">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <BackButton fallbackHref="/" />
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-headline-sm text-headline-sm font-bold text-primary"
          >
            <span className="material-symbols-outlined text-[24px]">
              school
            </span>
            AI Study Hub
          </Link>
        </div>

        <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm shadow-black/5 sm:p-8">
          <div className="mb-8">
            <p className="font-label-sm text-label-sm uppercase tracking-[0.18em] text-on-surface-variant">
              Khôi phục tài khoản
            </p>
            <h1 className="mt-2 font-headline-lg text-headline-lg font-bold text-primary">
              Quên mật khẩu
            </h1>
            <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
              Nhập địa chỉ email của bạn để nhận liên kết đặt lại mật khẩu.
            </p>
          </div>

          {submitted ? (
            <div className="flex flex-col gap-6">
              <div className="rounded-xl border border-green-200/30 bg-green-50/10 p-4 font-label-sm text-label-sm text-green-600 dark:text-green-400">
                Chúng tôi đã gửi một liên kết đặt lại mật khẩu tới{" "}
                <span className="font-semibold">{email}</span>. Vui lòng kiểm
                tra hộp thư đến (và thư rác nếu cần).
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  className="inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-primary px-5 font-label-lg text-label-lg font-semibold text-on-primary transition-colors hover:bg-primary/90"
                  onClick={() => {
                    setApiError("");
                    setSubmitted(false);
                  }}
                >
                  Gửi lại
                </button>
                <Link
                  href="/login"
                  className="inline-flex h-12 flex-1 items-center justify-center rounded-xl border border-outline-variant bg-surface px-5 font-label-lg text-label-lg font-semibold text-on-surface transition-colors hover:bg-surface-container"
                >
                  Quay lại đăng nhập
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
                  className="font-label-md text-label-md text-on-surface"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className={`w-full h-12 px-4 rounded-xl border bg-surface text-on-surface font-body-md text-body-md outline-none transition-all focus:border-primary ${
                    error ? "border-error" : "border-outline-variant"
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
                  <span className="text-error font-label-sm text-label-sm mt-1">
                    {error}
                  </span>
                ) : null}
              </div>

              {apiError ? (
                <div className="rounded-xl border border-error/30 bg-error-container p-4 font-label-sm text-label-sm text-error">
                  {apiError}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-5 font-label-lg text-label-lg font-semibold text-on-primary transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 mt-2"
              >
                {isSubmitting ? "Đang gửi..." : "Gửi liên kết đặt lại"}
              </button>

              <div className="text-center font-label-sm text-label-sm text-on-surface-variant">
                Đã nhớ mật khẩu?{" "}
                <Link
                  href="/login"
                  className="font-medium text-primary hover:underline"
                >
                  Đăng nhập
                </Link>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
