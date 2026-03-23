"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  useEffect(() => { document.title = "Reset Password | Castle"; }, []);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://castleliving.in/reset-password",
    });

    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setSent(true);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-violet-50 dark:bg-violet-900/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <span className="text-5xl">🔑</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {sent ? "Check Your Email" : "Forgot Password?"}
            </h1>
            <p className="text-gray-400 mt-2">
              {sent
                ? "We sent a reset link to your email"
                : "No worries, we'll send you a reset link"}
            </p>
          </div>

          <div className="premium-card !rounded-3xl p-8">
            {sent ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📧</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Reset link sent to
                </p>
                <p className="font-semibold text-gray-900 dark:text-white mb-6">{email}</p>
                <p className="text-xs text-gray-400 mb-6">
                  Click the link in the email to set a new password. Check your spam folder if you don&apos;t see it.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => { setSent(false); setEmail(""); }}
                    className="w-full py-3 text-sm font-semibold text-violet-600 bg-violet-50 dark:bg-violet-900/20 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-900/30 transition"
                  >
                    Try a different email
                  </button>
                  <Link
                    href="/login"
                    className="block w-full py-3 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition text-center"
                  >
                    ← Back to Sign In
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-sm text-red-600 dark:text-red-400">
                    ⚠️ {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="forgot-email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      id="forgot-email"
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
                        Sending...
                      </span>
                    ) : (
                      "Send Reset Link 📧"
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    ← Back to Sign In
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
