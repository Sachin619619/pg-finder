"use client";

import Link from "next/link";

interface BreadcrumbNavProps {
  items: { label: string; href?: string }[];
}

export default function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  return (
    <nav className="flex items-center gap-2 text-xs text-gray-500 mb-4 overflow-x-auto scrollbar-hide">
      <Link href="/" className="hover:text-[#1a1a1a] transition-colors shrink-0">Home</Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2 shrink-0">
          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path d="M9 18l6-6-6-6" />
          </svg>
          {item.href ? (
            <Link href={item.href} className="hover:text-[#1a1a1a] transition-colors">{item.label}</Link>
          ) : (
            <span className="text-gray-900 font-semibold truncate max-w-[200px]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
