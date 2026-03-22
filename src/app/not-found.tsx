import Link from "next/link";
import Header from "@/components/Header";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-32 text-center">
        <div className="w-24 h-24 bg-violet-50 dark:bg-violet-900/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <span className="text-5xl">🏠</span>
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-gray-400 max-w-md mx-auto mb-8">
          Looks like this page has moved out! Let&apos;s get you back to finding your perfect PG.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-violet-600 text-white px-8 py-3 rounded-2xl font-semibold hover:bg-violet-700 transition shadow-lg shadow-violet-500/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Back to Home
        </Link>
      </main>
    </>
  );
}
