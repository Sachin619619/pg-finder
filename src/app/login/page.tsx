"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  // OTP verification state
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: err } = await signIn(email, password);
    if (err) {
      setError(err);
      setLoading(false);
      // If email not confirmed, show OTP screen
      if (err.toLowerCase().includes("confirm") || err.toLowerCase().includes("verif")) {
        setShowOtp(true);
      }
    } else {
      router.push("/");
    }
  };

  const handleResend = async () => {
    if (!email) { setError("Enter your email first"); return; }
    setResending(true);
    setOtpError("");
    const { error: err } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    setResending(false);
    if (err) {
      setOtpError(err.message);
    } else {
      setResent(true);
      setError("");
      setCountdown(60);
      setOtp(["", "", "", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  // OTP handlers
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter" && otp.join("").length === 8) {
      handleVerifyOtp();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 8);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 7)]?.focus();
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 8) {
      setOtpError("Please enter the 8-digit code");
      return;
    }
    setOtpError("");
    setVerifying(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "signup",
    });

    if (error) {
      setOtpError(error.message);
      setVerifying(false);
    } else {
      // Verified! Now sign in
      setVerifying(false);
      setShowOtp(false);
      setError("");
      router.push("/");
    }
  };

  // ─── OTP VERIFICATION SCREEN ───
  if (showOtp) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center px-4 pt-20">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-violet-50 dark:bg-violet-900/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl">📧</span>
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Verify Your Email</h1>
              <p className="text-gray-400 mt-2">
                Enter the 8-digit code sent to<br />
                <strong className="text-gray-900 dark:text-white">{email}</strong>
              </p>
            </div>

            <div className="premium-card !rounded-3xl p-8">
              {otpError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-sm text-red-600 dark:text-red-400">
                  ⚠️ {otpError}
                </div>
              )}

              {/* OTP Input Boxes */}
              <div className="flex gap-2 justify-center mb-8" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className={`w-11 h-12 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all ${
                      digit
                        ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    } focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20`}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              {/* Verify Button */}
              <button
                onClick={handleVerifyOtp}
                disabled={verifying || otp.join("").length !== 8}
                className="btn-premium w-full !py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifying ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  "Verify & Sign In ✅"
                )}
              </button>

              {/* Resend */}
              <div className="mt-6 text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-gray-400">
                    Resend code in <span className="font-semibold text-violet-600">{countdown}s</span>
                  </p>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="text-sm text-violet-600 font-semibold hover:underline disabled:opacity-50"
                  >
                    {resending ? "Sending..." : "📧 Resend OTP Code"}
                  </button>
                )}
              </div>

              {/* Back to login */}
              <div className="mt-4 text-center">
                <button
                  onClick={() => { setShowOtp(false); setOtp(["", "", "", "", "", "", "", ""]); setOtpError(""); }}
                  className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ← Back to login
                </button>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  // ─── LOGIN FORM ───
  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-fuchsia-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/20">
              <span className="text-white text-2xl font-bold">P</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Welcome back 👋</h1>
            <p className="text-gray-400 mt-2">Sign in to your PG Finder account</p>
          </div>

          <div className="premium-card !rounded-3xl p-8">
            {resent && (
              <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-sm text-emerald-600 dark:text-emerald-400">
                ✅ Verification code resent! Check your inbox.
              </div>
            )}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-sm text-red-600 dark:text-red-400">
                <p>⚠️ {error}</p>
                {(error.toLowerCase().includes("confirm") || error.toLowerCase().includes("verif")) && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => { setShowOtp(true); }}
                      className="text-violet-600 dark:text-violet-400 font-semibold hover:underline text-xs"
                    >
                      🔢 Enter verification code
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={handleResend}
                      disabled={resending}
                      className="text-violet-600 dark:text-violet-400 font-semibold hover:underline text-xs"
                    >
                      {resending ? "Sending..." : "📧 Resend code"}
                    </button>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="premium-input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="premium-input w-full"
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-premium w-full !py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-violet-600 font-semibold hover:underline">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>

          {/* Demo accounts */}
          <div className="mt-6 premium-card !rounded-2xl p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Demo Accounts</p>
            <div className="space-y-2">
              {[
                { label: "🏠 Tenant", email: "tenant@pgfinder.com", pass: "demo123" },
                { label: "👤 Owner", email: "owner@pgfinder.com", pass: "demo123" },
                { label: "🛡️ Admin", email: "admin@pgfinder.com", pass: "demo123" },
              ].map((demo) => (
                <button
                  key={demo.label}
                  onClick={() => { setEmail(demo.email); setPassword(demo.pass); }}
                  className="w-full text-left p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition text-sm flex items-center justify-between"
                >
                  <span className="font-medium text-gray-700 dark:text-gray-300">{demo.label}</span>
                  <span className="text-xs text-gray-400">{demo.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
