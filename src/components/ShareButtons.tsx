"use client";

import { useState, useEffect, useRef } from "react";

type ShareButtonsProps = {
  pgName: string;
  pgArea: string;
  pgPrice: number;
  /** Compact mode: icon-only button for cards */
  compact?: boolean;
  /** Custom URL override (for cards that aren't on the listing page) */
  shareUrl?: string;
};

export default function ShareButtons({ pgName, pgArea, pgPrice, compact = false, shareUrl }: ShareButtonsProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasNativeShare, setHasNativeShare] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const url = shareUrl || (typeof window !== "undefined" ? window.location.href : "");
  const shareText = `Check out ${pgName} on Castle Living - ₹${pgPrice.toLocaleString()}/mo in ${pgArea}!`;

  useEffect(() => {
    setHasNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  // Close modal on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const handleShareClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // On mobile with native share, use it directly
    if (hasNativeShare) {
      try {
        await navigator.share({
          title: pgName,
          text: shareText,
          url,
        });
        return;
      } catch {
        // User cancelled or error — fall through to modal
      }
    }
    setOpen(true);
  };

  const copyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setOpen(false);
    }, 1200);
  };

  const shareOptions = [
    {
      label: "Copy Link",
      onClick: copyLink,
      icon: copied ? (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      activeLabel: copied ? "Copied!" : undefined,
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(shareText + " " + url)}`,
      icon: (
        <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
    {
      label: "Twitter / X",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
      icon: (
        <svg className="w-5 h-5 text-gray-800" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      label: "Email",
      href: `mailto:?subject=${encodeURIComponent(`Check out ${pgName} on Castle Living`)}&body=${encodeURIComponent(`${shareText}\n\n${url}`)}`,
      icon: (
        <svg className="w-5 h-5 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  // Share icon SVG (arrow-up-from-square style)
  const ShareIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );

  // Compact mode: icon-only button for PGCard
  if (compact) {
    return (
      <>
        <button
          onClick={handleShareClick}
          className="w-8 h-8 rounded-full bg-[#1a1a1a]/70 backdrop-blur-sm flex items-center justify-center hover:bg-[#1a1a1a]/90 hover:scale-110 transition-all duration-300 shadow-sm"
          aria-label={`Share ${pgName}`}
          title="Share"
        >
          <ShareIcon className="w-4 h-4 text-white" />
        </button>

        {/* Share Modal Overlay */}
        {open && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            style={{ animation: "fadeIn 0.2s ease-out" }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); }}
          >
            <div
              ref={modalRef}
              className="bg-[#F5F0E8] rounded-2xl shadow-2xl p-6 w-[320px] max-w-[90vw]"
              style={{ animation: "scaleIn 0.2s ease-out" }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-[#1a1a1a]">Share Listing</h3>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); }}
                  className="w-8 h-8 rounded-full bg-[#EDE8DE] flex items-center justify-center hover:bg-[#d4c9a8] transition"
                >
                  <svg className="w-4 h-4 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-2">
                {shareOptions.map((opt) => {
                  const content = (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#EDE8DE] transition-colors cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-[#FFFDF9] flex items-center justify-center shadow-sm shrink-0">
                        {opt.icon}
                      </div>
                      <span className="text-sm font-medium text-[#1a1a1a]">{opt.activeLabel || opt.label}</span>
                    </div>
                  );
                  if (opt.onClick) {
                    return (
                      <button key={opt.label} onClick={opt.onClick} className="w-full text-left">
                        {content}
                      </button>
                    );
                  }
                  return (
                    <a
                      key={opt.label}
                      href={opt.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="block"
                    >
                      {content}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Inline keyframes for compact modal */}
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </>
    );
  }

  // Full mode: pill button for listing detail page
  return (
    <div className="relative">
      <button
        onClick={handleShareClick}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EDE8DE] text-[#666] hover:bg-[#d4c9a8] transition-all text-sm font-medium"
        aria-label={`Share ${pgName}`}
        title="Share this listing"
      >
        <ShareIcon />
        Share
      </button>

      {/* Share Modal Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          style={{ animation: "fadeIn 0.2s ease-out" }}
          onClick={() => setOpen(false)}
        >
          <div
            ref={modalRef}
            className="bg-[#F5F0E8] rounded-2xl shadow-2xl p-6 w-[360px] max-w-[90vw]"
            style={{ animation: "scaleIn 0.2s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[#1a1a1a]">Share Listing</h3>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-[#EDE8DE] flex items-center justify-center hover:bg-[#d4c9a8] transition"
              >
                <svg className="w-4 h-4 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* PG name preview */}
            <div className="mb-5 px-4 py-3 bg-[#EDE8DE] rounded-xl">
              <p className="text-sm font-semibold text-[#1a1a1a] truncate">{pgName}</p>
              <p className="text-xs text-[#888]">{pgArea} &middot; ₹{pgPrice.toLocaleString()}/mo</p>
            </div>

            <div className="space-y-2">
              {shareOptions.map((opt) => {
                const content = (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#EDE8DE] transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-[#FFFDF9] flex items-center justify-center shadow-sm shrink-0">
                      {opt.icon}
                    </div>
                    <span className="text-sm font-medium text-[#1a1a1a]">{opt.activeLabel || opt.label}</span>
                  </div>
                );
                if (opt.onClick) {
                  return (
                    <button key={opt.label} onClick={opt.onClick} className="w-full text-left">
                      {content}
                    </button>
                  );
                }
                return (
                  <a key={opt.label} href={opt.href} target="_blank" rel="noopener noreferrer" className="block">
                    {content}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Inline keyframes */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
