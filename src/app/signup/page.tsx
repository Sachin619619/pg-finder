"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import type { UserRole } from "@/lib/auth";

export default function SignUpPage() {
  const { signUp, user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/");
    }
  }, [authLoading, user, router]);

  // Steps: "form" → "otp" → "success"
  const [step, setStep] = useState<"form" | "otp" | "success">("form");

  // Form state
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("tenant");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP state
  const [otp, setOtp] = useState(["", "", "", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Set page title
  useEffect(() => { document.title = "Create Account | Castle"; }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Step 1: Sign up → sends OTP email
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: err } = await signUp(email, password, name, role, username || undefined);
    if (err) {
      setError(err);
      setLoading(false);
    } else {
      setStep("otp");
      setCountdown(60);
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
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
      setStep("success");
      setVerifying(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    setResending(true);
    setOtpError("");

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    setResending(false);
    if (error) {
      setOtpError(error.message);
    } else {
      setCountdown(60);
      setOtp(["", "", "", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // digits only

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // only last digit
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter" && otp.join("").length === 6) {
      handleVerifyOtp();
    }
  };

  // Handle paste
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

  // ─── SUCCESS SCREEN ───
  if (step === "success") {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center px-4 pt-20">
          <div className="w-full max-w-md text-center">
            <div className="w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-bounce">
              <span className="text-6xl">🎉</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Welcome to Castle!</h1>
            <p className="text-gray-400 mb-2">Your account has been verified successfully ✅</p>
            <p className="text-sm text-gray-400 mb-8">You&apos;re now signed in as <strong className="text-[#1B1C15]">{email}</strong></p>
            <button onClick={() => router.push("/")} className="btn-premium !py-4 !px-10">
              🏠 Start Exploring PGs
            </button>
          </div>
        </main>
      </>
    );
  }

  // ─── OTP VERIFICATION SCREEN ───
  if (step === "otp") {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center px-4 pt-20">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-[#F4EDD9] rounded-3xl flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl">📧</span>
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900">Verify Your Email</h1>
              <p className="text-gray-400 mt-2">
                We sent an 8-digit code to<br />
                <strong className="text-gray-900">{email}</strong>
              </p>
            </div>

            <div className="premium-card !rounded-3xl p-8">
              {otpError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600">
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
                        ? "border-[#1B1C15] bg-[#F4EDD9] text-[#1B1C15]"
                        : "border-gray-200 bg-white text-gray-900"
                    } focus:border-[#1B1C15] focus:ring-2 focus:ring-[#1B1C15]/20`}
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
                  "Verify & Create Account ✅"
                )}
              </button>

              {/* Resend */}
              <div className="mt-6 text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-gray-400">
                    Resend code in <span className="font-semibold text-[#1B1C15]">{countdown}s</span>
                  </p>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="text-sm text-[#1B1C15] font-semibold hover:underline disabled:opacity-50"
                  >
                    {resending ? "Sending..." : "📧 Resend OTP Code"}
                  </button>
                )}
              </div>

              {/* Change email */}
              <div className="mt-4 text-center">
                <button
                  onClick={() => { setStep("form"); setOtp(["", "", "", "", "", "", "", ""]); setOtpError(""); }}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  ← Change email address
                </button>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  // ─── SIGNUP FORM ───
  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#1B1C15] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-black/20">
              <span className="text-white text-2xl font-bold">P</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">Create Account ✨</h1>
            <p className="text-gray-400 mt-2">Join Castle to find or list PGs</p>
          </div>

          <div className="premium-card !rounded-3xl p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600">
                <p>⚠️ {error}</p>
                {error.toLowerCase().includes("already exists") && (
                  <Link href="/login" className="inline-block mt-2 text-[#1B1C15] font-semibold hover:underline text-xs">
                    → Go to Sign In
                  </Link>
                )}
              </div>
            )}

            {/* Role selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">I am a...</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "tenant" as UserRole, label: "🏠 Tenant", desc: "Looking for a PG" },
                  { value: "owner" as UserRole, label: "👤 PG Owner", desc: "List my PG" },
                  { value: "agent" as UserRole, label: "🤝 Agent", desc: "Onboard PGs & earn" },
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      role === r.value
                        ? "border-[#1B1C15] bg-[#F4EDD9]"
                        : "border-gray-200 hover:border-[#e8e0cc]"
                    }`}
                  >
                    <span className="text-lg">{r.label.split(" ")[0]}</span>
                    <p className="font-semibold text-gray-900 text-sm mt-1">{r.label.split(" ").slice(1).join(" ")}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="signup-name" className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  id="signup-name"
                  type="text"
                  required
                  aria-required="true"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sachin Kumar"
                  className="premium-input w-full"
                />
              </div>

              <div>
                <label htmlFor="signup-username" className="block text-sm font-semibold text-gray-700 mb-2">
                  Username {(role === "owner" || role === "agent") && <span className="text-red-400">*</span>}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                  <input
                    id="signup-username"
                    type="text"
                    required={role === "owner" || role === "agent"}
                    aria-required={role === "owner" || role === "agent"}
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder="sachin_kumar"
                    className="premium-input w-full !pl-8"
                    maxLength={20}
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  {role === "owner" ? "Agents will use this to send you PG claims" : "Unique username for your profile"}
                </p>
              </div>

              <div>
                <label htmlFor="signup-email" className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  id="signup-email"
                  type="email"
                  required
                  aria-required="true"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="premium-input w-full"
                />
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <input
                  id="signup-password"
                  type="password"
                  required
                  aria-required="true"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
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
                    Sending OTP...
                  </span>
                ) : (
                  `Send OTP & Create Account 📧`
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Already have an account?{" "}
                <Link href="/login" className="text-[#1B1C15] font-semibold hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
