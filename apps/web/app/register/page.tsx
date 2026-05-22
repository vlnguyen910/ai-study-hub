"use client";

import { useState } from "react";
import styles from "../login/page.module.css";
import Link from "next/link";
import type { ReactElement } from "react";
import { Button } from "@repo/ui/button";

export default function RegisterPage(): ReactElement {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const validate = () => {
    let isValid = true;
    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (!formData.name.trim()) {
      newErrors.name = "Full Name is required";
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      console.log("Register with:", formData);
      // TODO: Perform register API request here
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.logoWrapper}>
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

          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>
            Join us to manage your learning materials
          </p>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.inputGroup}>
              <div className={styles.labelRow}>
                <label htmlFor="name" className={styles.label}>
                  Full Name
                </label>
              </div>
              <input
                id="name"
                type="text"
                className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && (
                <span className={styles.errorText}>{errors.name}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.labelRow}>
                <label htmlFor="email" className={styles.label}>
                  Email Address
                </label>
              </div>
              <input
                id="email"
                type="email"
                className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                placeholder="example@academic.edu"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <span className={styles.errorText}>{errors.email}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.labelRow}>
                <label htmlFor="password" className={styles.label}>
                  Password
                </label>
              </div>
              <div className={styles.inputWrapper}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`${styles.input} ${styles.passwordInput} ${errors.password ? styles.inputError : ""}`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
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
              {errors.password && (
                <span className={styles.errorText}>{errors.password}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.labelRow}>
                <label htmlFor="confirmPassword" className={styles.label}>
                  Confirm Password
                </label>
              </div>
              <div className={styles.inputWrapper}>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className={`${styles.input} ${styles.passwordInput} ${errors.confirmPassword ? styles.inputError : ""}`}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? (
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
              {errors.confirmPassword && (
                <span className={styles.errorText}>
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            <Button appName="web" className={styles.submitBtn} type="submit">
              Create account
            </Button>

            <div className={styles.divider}>Or continue with</div>

            <div className={styles.socialGroup}>
              <button type="button" className={styles.socialBtn}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.68 15.65 16.88 16.83 15.71 17.62V20.4H19.28C21.36 18.48 22.56 15.62 22.56 12.25Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23C14.97 23 17.46 22.02 19.28 20.4L15.71 17.62C14.73 18.28 13.47 18.66 12 18.66C9.15 18.66 6.72 16.73 5.8 14.15H2.12V17C3.93 20.61 7.64 23 12 23Z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.8 14.15C5.56 13.45 5.43 12.74 5.43 12C5.43 11.26 5.56 10.55 5.8 9.85V7H2.12C1.38 8.48 0.96 10.18 0.96 12C0.96 13.82 1.38 15.52 2.12 17L5.8 14.15Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.34C13.62 5.34 15.06 5.9 16.2 6.98L19.36 3.82C17.45 2.02 14.96 1 12 1C7.64 1 3.93 3.39 2.12 7L5.8 9.85C6.72 7.27 9.15 5.34 12 5.34Z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>
              <button type="button" className={styles.socialBtn}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M24 12.073C24 5.405 18.627 0 12 0C5.373 0 0 5.405 0 12.073C0 18.1 4.542 23.09 10.125 24V15.562H7.078V12.073H10.125V9.406C10.125 6.368 11.916 4.688 14.656 4.688C15.968 4.688 17.344 4.927 17.344 4.927V7.917H15.828C14.331 7.917 13.875 8.854 13.875 9.813V12.073H17.203L16.797 15.562H13.875V24C19.458 23.09 24 18.1 24 12.073Z"
                    fill="#1877F2"
                  />
                </svg>
                Facebook
              </button>
            </div>
          </form>

          <div className={styles.footer}>
            <p>
              Already have an account?{" "}
              <Link href="/login" className={styles.primaryLink}>
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>

      <footer className={styles.pageFooter}>
        <div className={styles.footerLinks}>
          <Link href="#" className={styles.footerLink}>
            About Us
          </Link>
          <Link href="#" className={styles.footerLink}>
            Terms
          </Link>
          <Link href="#" className={styles.footerLink}>
            Privacy
          </Link>
          <Link href="#" className={styles.footerLink}>
            Contact
          </Link>
        </div>
        <p className={styles.footerCopy}>
          © 2024 AI Study Hub. Academic knowledge sharing platform.
        </p>
      </footer>
    </div>
  );
}
