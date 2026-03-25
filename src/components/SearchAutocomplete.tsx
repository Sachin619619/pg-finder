"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/lib/hooks";

type AreaSuggestion = {
  name: string;
  count: number;
  slug: string;
};

type SearchAutocompleteProps = {
  areas: AreaSuggestion[];
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
};

export default function SearchAutocomplete({
  areas,
  value,
  onChange,
  onSearch,
}: SearchAutocompleteProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debouncedQuery = useDebounce(value, 150);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const q = debouncedQuery.toLowerCase();
    return areas.filter((a) => a.name.toLowerCase().includes(q));
  }, [debouncedQuery, areas]);

  // Open dropdown when there are results
  useEffect(() => {
    if (debouncedQuery.trim() && filtered.length >= 0) {
      setIsOpen(true);
      setActiveIndex(-1);
    } else {
      setIsOpen(false);
    }
  }, [debouncedQuery, filtered.length]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: "nearest" });
      }
    }
  }, [activeIndex]);

  const navigateToArea = useCallback(
    (area: AreaSuggestion) => {
      setIsOpen(false);
      onChange(area.name);
      router.push(`/area/${area.slug}`);
    },
    [router, onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filtered.length === 0) {
      if (e.key === "Enter" && onSearch) {
        onSearch();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < filtered.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : filtered.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < filtered.length) {
          navigateToArea(filtered[activeIndex]);
        } else if (onSearch) {
          setIsOpen(false);
          onSearch();
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const showDropdown = isOpen && debouncedQuery.trim().length > 0;

  return (
    <div ref={containerRef} className="flex-1 relative">
      {/* Search icon */}
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/30 pointer-events-none z-10"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search area, PG name, landmark..."
        className="w-full pl-12 pr-4 py-4 bg-white border border-black/10 rounded-2xl text-black placeholder-black/30 focus:border-black/20 outline-none transition-all text-[15px]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (debouncedQuery.trim()) setIsOpen(true);
        }}
        role="combobox"
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
        aria-autocomplete="list"
        aria-activedescendant={
          activeIndex >= 0 ? `area-option-${activeIndex}` : undefined
        }
      />

      {/* Dropdown */}
      {showDropdown && (
        <div
          className="absolute top-full left-0 right-0 mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="bg-white rounded-2xl shadow-lg border border-black/5 overflow-hidden max-h-[320px]">
            {filtered.length > 0 ? (
              <ul
                ref={listRef}
                role="listbox"
                className="overflow-y-auto max-h-[320px] py-2"
              >
                {filtered.map((area, index) => (
                  <li
                    key={area.slug}
                    id={`area-option-${index}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    className={`flex items-center justify-between px-5 py-3.5 cursor-pointer transition-colors ${
                      index === activeIndex
                        ? "bg-gray-100"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => navigateToArea(area)}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-4 h-4 text-black/30 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="text-[15px] font-medium text-black/80">
                        {area.name}
                      </span>
                    </div>
                    <span className="text-xs text-black/40 bg-[#F4EDD9] px-2.5 py-1 rounded-full font-medium">
                      {area.count} {area.count === 1 ? "PG" : "PGs"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-5 py-8 text-center">
                <svg
                  className="w-8 h-8 text-black/15 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-black/40">
                  No areas found for &ldquo;{debouncedQuery}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
