import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="relative w-72 h-72 mx-auto mb-8 rounded-3xl overflow-hidden border border-gray-200 shadow-xl shadow-black/5">
          <Image
            src="/images/ghibli/404-lost.png"
            alt="Lost in Bangalore - illustrated character at crossroads"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl text-gray-900 mb-4 tracking-tight">
          Oops, you&apos;re lost!
        </h1>
        <p className="text-gray-400 max-w-md mx-auto mb-8">
          Looks like this page has moved out! Let&apos;s get you back to finding your perfect PG.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#1B1C15] text-white px-8 py-3 rounded-2xl font-semibold hover:bg-[#2a2b22] transition shadow-lg shadow-black/20"
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
