"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
  type ReactElement,
  type MouseEvent,
  type FormEvent,
} from "react";
import { apiClient } from "@/lib/axios";
import { API_ENDPOINTS } from "@/shared/constants";
import { useAuthStore } from "@/stores";
import LoginModal from "./components/auth/LoginModal";
import RegisterModal from "./components/auth/RegisterModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LoginData {
  email: string;
  password: string;
}

interface LoginErrors {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterErrors {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Home(): ReactElement {
  const [mounted, setMounted] = useState(false);

  // Auth modal state (unified, replaces the broken dual-state pattern)
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
  });
  const [loginErrors, setLoginErrors] = useState<LoginErrors>({
    email: "",
    password: "",
  });

  // Register form state
  const [registerData, setRegisterData] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [registerErrors, setRegisterErrors] = useState<RegisterErrors>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { isAuthenticated, user, logout } = useAuthStore();

  // Set mounted flag (prevents hydration mismatch for auth state)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when any modal is open
  useEffect(() => {
    const isOpen = isLoginOpen || isRegisterOpen;
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsLoginOpen(false);
        setIsRegisterOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isLoginOpen, isRegisterOpen]);

  // ─── Modal helpers ──────────────────────────────────────────────────────────

  const openLogin = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

  const openRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setIsLoginOpen(false);
      setIsRegisterOpen(false);
    }
  };

  const stopModalPropagation = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  // ─── Validation ─────────────────────────────────────────────────────────────

  const validateLogin = (): boolean => {
    let valid = true;
    const nextErrors: LoginErrors = { email: "", password: "" };

    if (!loginData.email) {
      nextErrors.email = "Email là bắt buộc";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      nextErrors.email = "Vui lòng nhập địa chỉ email hợp lệ";
      valid = false;
    }

    if (!loginData.password) {
      nextErrors.password = "Mật khẩu là bắt buộc";
      valid = false;
    }

    setLoginErrors(nextErrors);
    return valid;
  };

  const validateRegister = (): boolean => {
    let valid = true;
    const nextErrors: RegisterErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (!registerData.name.trim()) {
      nextErrors.name = "Họ và tên là bắt buộc";
      valid = false;
    }

    if (!registerData.email) {
      nextErrors.email = "Email là bắt buộc";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      nextErrors.email = "Vui lòng nhập địa chỉ email hợp lệ";
      valid = false;
    }

    if (!registerData.password) {
      nextErrors.password = "Mật khẩu là bắt buộc";
      valid = false;
    } else if (registerData.password.length < 8) {
      nextErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
      valid = false;
    }

    if (!registerData.confirmPassword) {
      nextErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
      valid = false;
    } else if (registerData.password !== registerData.confirmPassword) {
      nextErrors.confirmPassword = "Mật khẩu không khớp";
      valid = false;
    }

    setRegisterErrors(nextErrors);
    return valid;
  };

  // ─── Submit handlers ────────────────────────────────────────────────────────

  const handleLoginSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateLogin()) return;
    console.log("Login with:", loginData);
  };

  const handleRegisterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateRegister()) return;
    console.log("Register with:", registerData);
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col overflow-x-hidden">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-10 py-4 border-b border-gray-200 bg-white">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 3L1 9L12 15L21 10.09V17H23V9L12 3ZM12 12.8L4.08 8.46L12 4.07L19.92 8.46L12 12.8Z"
              fill="#004ecc"
            />
            <path d="M4 14V18H10V14" stroke="#004ecc" strokeWidth="2" />
          </svg>
          <span className="text-xl font-bold text-blue-600">AcademiShare</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-gray-900 font-semibold text-sm hover:text-blue-600 transition-all duration-200 py-1 border-b-2 border-blue-600"
          >
            Trang chủ
          </Link>
          <Link
            href="/library"
            className="text-gray-500 font-semibold text-sm hover:text-blue-600 transition-all duration-200 py-1 border-b-2 border-transparent hover:border-blue-600"
          >
            Thư viện
          </Link>
          <Link
            href="/community"
            className="text-gray-500 font-semibold text-sm hover:text-blue-600 transition-all duration-200 py-1 border-b-2 border-transparent hover:border-blue-600"
          >
            Cộng đồng
          </Link>
          <Link
            href="/upload"
            className="text-gray-500 font-semibold text-sm hover:text-blue-600 transition-all duration-200 py-1 border-b-2 border-transparent hover:border-blue-600"
          >
            Tải lên
          </Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          {/* Theme toggle placeholder */}
          <button
            className="text-gray-600 hover:text-black"
            aria-label="Toggle theme"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>

          {/* Auth area — only renders after hydration to avoid mismatch */}
          {mounted && isAuthenticated && user ? (
            <div className="flex items-center gap-6">
              <Link
                href={
                  user.role === "admin"
                    ? "/admin"
                    : user.role === "moderator"
                      ? "/moderator"
                      : "/profile"
                }
                className="text-sm font-bold text-gray-700 hover:text-[#004ac6] transition-colors"
              >
                Xin chào, <span className="text-[#004ac6]">{user.name}</span> (
                {user.role === "admin"
                  ? "Admin"
                  : user.role === "moderator"
                    ? "KTV"
                    : "Học viên"}
                )
              </Link>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
                  } finally {
                    logout();
                    window.location.reload();
                  }
                }}
                className="text-xs text-red-600 hover:text-red-800 underline transition-colors cursor-pointer font-medium"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={openLogin}
              className="bg-[#004ac6] hover:bg-[#2c5b9e] text-white font-bold px-7 py-2.5 rounded-full text-sm shadow-sm transition-colors duration-200 cursor-pointer"
            >
              Đăng nhập
            </button>
          )}
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="max-w-7xl mx-auto px-10 py-12 w-full flex flex-col gap-24">
        {/* Hero Section */}
        <section className="grid grid-cols-2 gap-10 items-center">
          <div className="flex flex-col gap-6 max-w-xl">
            <h1 className="text-5xl font-bold leading-tight tracking-tight text-gray-900">
              Kho lưu trữ tài liệu{" "}
              <span className="text-blue-600">học thuật hàng đầu</span> cho sinh
              viên
            </h1>
            <p className="text-lg leading-relaxed text-gray-600">
              Nền tảng chia sẻ kiến thức toàn diện, nơi bạn có thể tìm kiếm hàng
              triệu giáo trình, đề thi và bài giảng chất lượng từ cộng đồng sinh
              viên ưu tú.
            </p>
            <div className="flex items-center bg-white border border-gray-300 rounded-xl p-1 shadow-sm mt-4">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-gray-500 mx-3 shrink-0"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm tài liệu, khóa học..."
                className="flex-1 border-none outline-none px-2 py-2 bg-transparent"
              />
              <button
                type="button"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Khám phá
              </button>
            </div>
          </div>
          <div className="w-full h-96 rounded-3xl overflow-hidden shadow-lg bg-gray-300" />
        </section>

        {/* Features Section */}
        <section className="flex flex-col items-center gap-10 bg-blue-50 rounded-4xl px-12 py-16">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              Tính năng cốt lõi
            </h2>
            <p className="text-lg text-gray-600">
              Trải nghiệm học tập không giới hạn với hệ sinh thái công cụ hiện
              đại
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 w-full">
            {/* Card 1 */}
            <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm flex flex-col gap-4 relative overflow-hidden min-h-80">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Thư viện tài liệu đa dạng
              </h3>
              <p className="text-gray-600">
                Hơn 1,000,000+ tài liệu được phân loại theo từng chuyên ngành và
                trường đại học.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-blue-600 rounded-3xl p-8 shadow-lg flex flex-col gap-4 relative overflow-hidden min-h-80">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-blue-600">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">
                Đóng góp & Chia sẻ
              </h3>
              <p className="text-white/90">
                Tải lên tài liệu của bạn chỉ với một cú kéo thả và nhận điểm
                thưởng từ cộng đồng.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ── Modals ── */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onOpenRegister={openRegister}
      />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onOpenLogin={openLogin}
      />
    </div>
  );
}
