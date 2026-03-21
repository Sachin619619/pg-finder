"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">PG Finder</span>
              <span className="text-xs text-violet-600 block -mt-1">Bangalore</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-violet-600 font-medium transition">
              Home
            </Link>
            <Link href="/#listings" className="text-gray-600 hover:text-violet-600 font-medium transition">
              Browse PGs
            </Link>
            <Link href="/#areas" className="text-gray-600 hover:text-violet-600 font-medium transition">
              Areas
            </Link>
            <Link href="/list-your-pg" className="bg-violet-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-violet-700 transition">
              List Your PG
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
