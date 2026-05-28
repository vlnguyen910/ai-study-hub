"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
  type FormEvent,
  type MouseEvent,
  type ReactElement,
} from "react";

export default function Home(): ReactElement {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginErrors, setLoginErrors] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [registerErrors, setRegisterErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] =
    useState(false);

  useEffect(() => {
    if (!authOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAuthOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [authOpen]);

  const openLogin = () => {
    setAuthMode("login");
    setAuthOpen(true);
  };

  const openRegister = () => {
    setAuthMode("register");
    setAuthOpen(true);
  };

  const closeAuth = () => setAuthOpen(false);

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      closeAuth();
    }
  };

  const stopModalPropagation = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  const validateLogin = () => {
    let valid = true;
    const nextErrors = { email: "", password: "" };

    if (!loginData.email) {
      nextErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      nextErrors.email = "Please enter a valid email address";
      valid = false;
    }

    if (!loginData.password) {
      nextErrors.password = "Password is required";
      valid = false;
    }

    setLoginErrors(nextErrors);
    return valid;
  };

  const validateRegister = () => {
    let valid = true;
    const nextErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (!registerData.name.trim()) {
      nextErrors.name = "Full Name is required";
      valid = false;
    }

    if (!registerData.email) {
      nextErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      nextErrors.email = "Please enter a valid email address";
      valid = false;
    }

    if (!registerData.password) {
      nextErrors.password = "Password is required";
      valid = false;
    } else if (registerData.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters";
      valid = false;
    }

    if (!registerData.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password";
      valid = false;
    } else if (registerData.password !== registerData.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    setRegisterErrors(nextErrors);
    return valid;
  };

  const handleLoginSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateLogin()) {
      return;
    }

    console.log("Login with:", loginData);
  };

  const handleRegisterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateRegister()) {
      return;
    }

    console.log("Register with:", registerData);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-10 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
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
        </div>

        <nav className="flex gap-8">
          <Link
            href="/"
            className="text-gray-600 font-semibold hover:text-blue-600 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-blue-600"
          >
            Home
          </Link>
          <Link
            href="/library"
            className="text-gray-600 font-semibold hover:text-blue-600"
          >
            Library
          </Link>
          <Link
            href="/community"
            className="text-gray-600 font-semibold hover:text-blue-600"
          >
            Community
          </Link>
          <Link
            href="/upload"
            className="text-gray-600 font-semibold hover:text-blue-600"
          >
            Upload
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <button className="text-gray-600 hover:text-black">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </button>
          <button className="text-gray-600 hover:text-black">
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
          <button
            type="button"
            onClick={openLogin}
            className="rounded border border-gray-300 px-5 py-2 font-semibold text-gray-700 hover:border-blue-600 hover:text-blue-600"
          >
            Log in
          </button>
          <button
            type="button"
            onClick={openRegister}
            className="rounded bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Sign up
          </button>
        </div>
      </header>

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
                className="text-gray-500 mx-3"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm tài liệu, khóa học..."
                className="flex-1 border-none outline-none px-2 py-2 bg-transparent"
              />
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">
                Khám phá
              </button>
            </div>
          </div>
          <div className="w-full h-96 rounded-3xl overflow-hidden shadow-lg bg-gray-300">
            {/* Placeholder for hero image */}
          </div>
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
              <div className="mt-auto h-24 bg-cover bg-center rounded-lg opacity-90"></div>
            </div>

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

      {authOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-white/70 bg-white p-8 shadow-2xl shadow-slate-950/20"
            onClick={stopModalPropagation}
            onMouseDown={stopModalPropagation}
          >
            <button
              type="button"
              onClick={closeAuth}
              aria-label="Close auth modal"
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div className="mb-6 flex items-center justify-center gap-2 text-2xl font-bold text-blue-600">
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

            {authMode === "login" ? (
              <>
                <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
                  Welcome back
                </h1>
                <p className="text-center text-gray-600 text-sm mb-8">
                  Please login to continue learning and sharing.
                </p>

                <form
                  className="flex flex-col gap-5"
                  onSubmit={handleLoginSubmit}
                  noValidate
                >
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="login-email"
                      className="text-sm font-bold text-gray-900"
                    >
                      Email
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      className={`w-full h-12 rounded border px-4 text-sm text-gray-900 transition-all focus:bg-white focus:outline-none focus:border-blue-600 ${loginErrors.email ? "border-red-600" : "border-gray-300 bg-gray-100"}`}
                      placeholder="example@academic.edu"
                      value={loginData.email}
                      onChange={(event) => {
                        const value = event.target.value;
                        setLoginData((prev) => ({ ...prev, email: value }));
                        if (loginErrors.email) {
                          setLoginErrors((prev) => ({ ...prev, email: "" }));
                        }
                      }}
                    />
                    {loginErrors.email && (
                      <span className="text-red-600 text-xs mt-1">
                        {loginErrors.email}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-end gap-4">
                      <label
                        htmlFor="login-password"
                        className="text-sm font-bold text-gray-900"
                      >
                        Password
                      </label>
                      <Link
                        href="/forgot-password"
                        className="text-xs text-blue-600 hover:underline font-medium"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        id="login-password"
                        type={showLoginPassword ? "text" : "password"}
                        className={`w-full h-12 rounded border px-4 pr-12 text-sm text-gray-900 transition-all focus:bg-white focus:outline-none focus:border-blue-600 ${loginErrors.password ? "border-red-600" : "border-gray-300 bg-gray-100"}`}
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(event) => {
                          const value = event.target.value;
                          setLoginData((prev) => ({
                            ...prev,
                            password: value,
                          }));
                          if (loginErrors.password) {
                            setLoginErrors((prev) => ({
                              ...prev,
                              password: "",
                            }));
                          }
                        }}
                      />
                      <button
                        type="button"
                        aria-label={
                          showLoginPassword ? "Hide password" : "Show password"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                        onClick={() => setShowLoginPassword((prev) => !prev)}
                      >
                        {showLoginPassword ? (
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M17.94 17.94A10.07 10.07 0 0 1 12 20C7 20 2.73 16.11 1 12A15.42 15.42 0 0 1 4.54 6.54M9.9 4.24A9.12 9.12 0 0 1 12 4C17 4 21.27 7.89 23 12C22.25 13.88 21.1 15.54 19.64 16.89"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M14.12 14.12A3 3 0 0 1 9.88 9.88M1 1L23 23"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1 12C2.73 7.89 7 4 12 4C17 4 21.27 7.89 23 12C21.27 16.11 17 20 12 20C7 20 2.73 16.11 1 12Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <circle
                              cx="12"
                              cy="12"
                              r="3"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    {loginErrors.password && (
                      <span className="text-red-600 text-xs mt-1">
                        {loginErrors.password}
                      </span>
                    )}
                  </div>

                  <button
                    className="w-full h-12 rounded bg-blue-600 font-semibold text-white hover:bg-blue-700"
                    type="submit"
                  >
                    Log in
                  </button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-600">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      className="flex-1 h-11 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="flex-1 h-11 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.385.6.111.82-.261.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.627-5.373-12-12-12z" />
                      </svg>
                    </button>
                  </div>

                  <p className="text-center text-sm text-gray-600 mt-4">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setAuthMode("register")}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      Sign up
                    </button>
                  </p>
                </form>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
                  Create Account
                </h1>
                <p className="text-center text-gray-600 text-sm mb-8">
                  Join our community to start learning and sharing.
                </p>

                <form
                  className="flex flex-col gap-4"
                  onSubmit={handleRegisterSubmit}
                  noValidate
                >
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="register-name"
                      className="text-sm font-bold text-gray-900"
                    >
                      Full Name
                    </label>
                    <input
                      id="register-name"
                      type="text"
                      className={`w-full h-12 rounded border px-4 text-sm text-gray-900 transition-all focus:bg-white focus:outline-none focus:border-blue-600 ${registerErrors.name ? "border-red-600" : "border-gray-300 bg-gray-100"}`}
                      placeholder="John Doe"
                      value={registerData.name}
                      onChange={(event) => {
                        const value = event.target.value;
                        setRegisterData((prev) => ({ ...prev, name: value }));
                        if (registerErrors.name) {
                          setRegisterErrors((prev) => ({ ...prev, name: "" }));
                        }
                      }}
                    />
                    {registerErrors.name && (
                      <span className="text-red-600 text-xs mt-1">
                        {registerErrors.name}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="register-email"
                      className="text-sm font-bold text-gray-900"
                    >
                      Email
                    </label>
                    <input
                      id="register-email"
                      type="email"
                      className={`w-full h-12 rounded border px-4 text-sm text-gray-900 transition-all focus:bg-white focus:outline-none focus:border-blue-600 ${registerErrors.email ? "border-red-600" : "border-gray-300 bg-gray-100"}`}
                      placeholder="example@academic.edu"
                      value={registerData.email}
                      onChange={(event) => {
                        const value = event.target.value;
                        setRegisterData((prev) => ({ ...prev, email: value }));
                        if (registerErrors.email) {
                          setRegisterErrors((prev) => ({ ...prev, email: "" }));
                        }
                      }}
                    />
                    {registerErrors.email && (
                      <span className="text-red-600 text-xs mt-1">
                        {registerErrors.email}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="register-password"
                      className="text-sm font-bold text-gray-900"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="register-password"
                        type={showRegisterPassword ? "text" : "password"}
                        className={`w-full h-12 rounded border px-4 pr-12 text-sm text-gray-900 transition-all focus:bg-white focus:outline-none focus:border-blue-600 ${registerErrors.password ? "border-red-600" : "border-gray-300 bg-gray-100"}`}
                        placeholder="••••••••"
                        value={registerData.password}
                        onChange={(event) => {
                          const value = event.target.value;
                          setRegisterData((prev) => ({
                            ...prev,
                            password: value,
                          }));
                          if (registerErrors.password) {
                            setRegisterErrors((prev) => ({
                              ...prev,
                              password: "",
                            }));
                          }
                        }}
                      />
                      <button
                        type="button"
                        aria-label={
                          showRegisterPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                        onClick={() => setShowRegisterPassword((prev) => !prev)}
                      >
                        {showRegisterPassword ? (
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M17.94 17.94A10.07 10.07 0 0 1 12 20C7 20 2.73 16.11 1 12A15.42 15.42 0 0 1 4.54 6.54M9.9 4.24A9.12 9.12 0 0 1 12 4C17 4 21.27 7.89 23 12C22.25 13.88 21.1 15.54 19.64 16.89"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M14.12 14.12A3 3 0 0 1 9.88 9.88M1 1L23 23"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1 12C2.73 7.89 7 4 12 4C17 4 21.27 7.89 23 12C21.27 16.11 17 20 12 20C7 20 2.73 16.11 1 12Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <circle
                              cx="12"
                              cy="12"
                              r="3"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    {registerErrors.password && (
                      <span className="text-red-600 text-xs mt-1">
                        {registerErrors.password}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="register-confirm"
                      className="text-sm font-bold text-gray-900"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="register-confirm"
                        type={showRegisterConfirmPassword ? "text" : "password"}
                        className={`w-full h-12 rounded border px-4 pr-12 text-sm text-gray-900 transition-all focus:bg-white focus:outline-none focus:border-blue-600 ${registerErrors.confirmPassword ? "border-red-600" : "border-gray-300 bg-gray-100"}`}
                        placeholder="••••••••"
                        value={registerData.confirmPassword}
                        onChange={(event) => {
                          const value = event.target.value;
                          setRegisterData((prev) => ({
                            ...prev,
                            confirmPassword: value,
                          }));
                          if (registerErrors.confirmPassword) {
                            setRegisterErrors((prev) => ({
                              ...prev,
                              confirmPassword: "",
                            }));
                          }
                        }}
                      />
                      <button
                        type="button"
                        aria-label={
                          showRegisterConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                        onClick={() =>
                          setShowRegisterConfirmPassword((prev) => !prev)
                        }
                      >
                        {showRegisterConfirmPassword ? (
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M17.94 17.94A10.07 10.07 0 0 1 12 20C7 20 2.73 16.11 1 12A15.42 15.42 0 0 1 4.54 6.54M9.9 4.24A9.12 9.12 0 0 1 12 4C17 4 21.27 7.89 23 12C22.25 13.88 21.1 15.54 19.64 16.89"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M14.12 14.12A3 3 0 0 1 9.88 9.88M1 1L23 23"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1 12C2.73 7.89 7 4 12 4C17.27 4 21.27 7.89 23 12C21.27 16.11 17 20 12 20C7 20 2.73 16.11 1 12Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <circle
                              cx="12"
                              cy="12"
                              r="3"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    {registerErrors.confirmPassword && (
                      <span className="text-red-600 text-xs mt-1">
                        {registerErrors.confirmPassword}
                      </span>
                    )}
                  </div>

                  <button
                    className="w-full h-12 rounded bg-blue-600 font-semibold text-white hover:bg-blue-700 mt-2"
                    type="submit"
                  >
                    Create Account
                  </button>

                  <p className="text-center text-sm text-gray-600 mt-4">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setAuthMode("login")}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
