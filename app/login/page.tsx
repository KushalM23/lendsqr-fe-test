"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { login } from "../../services/api";
import styles from "./login.module.scss";

export default function LoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [generalError, setGeneralError] = useState("");

  // Auto-redirect if token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/users");
    }
  }, [router]);

  const validate = () => {
    const tempErrors: { email?: string; password?: string } = {};
    
    if (!email.trim()) {
      tempErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      tempErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      tempErrors.password = "Password is required";
    } else if (password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters long";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.push("/users");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Invalid email or password. Please try again.";
      setGeneralError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      {/* Left Section - Side panel and illustration (Hidden on mobile) */}
      <div className={styles.leftSection}>
        <div className={styles.logoWrapper}>
          <Image
            src="/logo.svg"
            alt="Lendsqr Logo"
            width={174}
            height={36}
            className={styles.logoImage}
            priority
          />
        </div>
        <div className={styles.illustrationWrapper}>
          <Image
            src="/illustration.svg"
            alt="Sign-in Illustration"
            width={600}
            height={400}
            className={styles.illustration}
            priority
          />
        </div>
      </div>

      {/* Right Section - Form wrapper */}
      <div className={styles.rightSection}>
        {/* Mobile-only logo header */}
        <div className={styles.mobileLogoHeader}>
          <Image
            src="/logo.svg"
            alt="Lendsqr Logo"
            width={170}
            height={33}
            className={styles.logoImage}
            priority
          />
        </div>

        <div className={styles.formWrapper}>
          <h1 className={styles.title}>Welcome!</h1>
          <p className={styles.subtitle}>Enter details to login.</p>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {generalError && (
              <div className={styles.alertError} role="alert">
                {generalError}
              </div>
            )}

            {/* Email Field */}
            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                  aria-label="Email"
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <span className={styles.fieldError} role="alert">
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                  className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
                  aria-label="Password"
                  disabled={loading}
                />
                <span
                  className={styles.showToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setShowPassword(!showPassword);
                    }
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </span>
              </div>
              {errors.password && (
                <span className={styles.fieldError} role="alert">
                  {errors.password}
                </span>
              )}
            </div>

            <a href="#" className={styles.forgotPassword}>
              Forgot Password?
            </a>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading && <div className={styles.spinner} />}
              {loading ? "Logging In..." : "Log In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
