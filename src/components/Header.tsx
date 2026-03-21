"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-4 mt-3">
        <div className="glass-card rounded-2xl px-6 py-3 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-shadow">
                <span className="text-white font-bold text-lg tracking-tight">P</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900 tracking-tight leading-none">PG Finder</span>
                <span className="text-[10px] font-semibold text-violet-600 uppercase tracking-[0.15em] leading-none mt-0.5">Bangalore</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {[
                { label: "Home", href: "/" },
                { label: "Browse", href: "/#listings" },
                { label: "Areas", href: "/#areas" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100/80 transition-all"
                >
                  {item.label}
                </Link>
              ))}
              <div className="w-px h-6 bg-gray-200 mx-2" />
              <Link
                href="/list-your-pg"
                className="btn-premium text-sm !py-2.5 !px-5"
              >
                List Your PG
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 transition"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileOpen && (
            <div className="md:hidden pt-4 pb-2 border-t border-gray-200/50 mt-3 space-y-1 animate-slide-up">
              {[
                { label: "Home", href: "/" },
                { label: "Browse PGs", href: "/#listings" },
                { label: "Areas", href: "/#areas" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-100 transition"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/list-your-pg"
                onClick={() => setMobileOpen(false)}
                className="block text-center btn-premium text-sm !py-2.5 mt-2"
              >
                List Your PG
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
