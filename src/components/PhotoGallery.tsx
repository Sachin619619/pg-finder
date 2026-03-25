"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

const fallbackPhotos = [
  { label: "Living Room", gradient: "from-[#d4c9a8] to-[#EDE8DE]" },
  { label: "Bedroom", gradient: "from-rose-200 to-pink-200" },
  { label: "Kitchen", gradient: "from-amber-200 to-orange-200" },
  { label: "Bathroom", gradient: "from-teal-200 to-emerald-200" },
  { label: "Balcony", gradient: "from-sky-200 to-blue-200" },
  { label: "Common Area", gradient: "from-[#d4c9a8] to-[#EDE8DE]" },
];

export default function PhotoGallery({ pgName, images }: { pgName: string; images?: string[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [imgError, setImgError] = useState<Record<number, boolean>>({});
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  // Touch/swipe refs
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);

  const hasImages = images && images.length > 0;
  const photoCount = hasImages ? images.length : fallbackPhotos.length;

  // Open lightbox with animation
  const openLightbox = useCallback((idx?: number) => {
    if (idx !== undefined) setActiveIdx(idx);
    setLightbox(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setLightboxVisible(true);
      });
    });
  }, []);

  // Close lightbox with animation
  const closeLightbox = useCallback(() => {
    setLightboxVisible(false);
    setTimeout(() => setLightbox(false), 300);
  }, []);

  // Navigate with transition
  const goTo = useCallback((newIdx: number) => {
    setTransitioning(true);
    setTimeout(() => {
      setActiveIdx(newIdx);
      setTimeout(() => setTransitioning(false), 50);
    }, 150);
  }, []);

  const goPrev = useCallback(() => {
    goTo((activeIdx - 1 + photoCount) % photoCount);
  }, [activeIdx, photoCount, goTo]);

  const goNext = useCallback(() => {
    goTo((activeIdx + 1) % photoCount);
  }, [activeIdx, photoCount, goTo]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightbox) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [lightbox]);

  // Keyboard support
  useEffect(() => {
    if (!lightbox) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightbox, closeLightbox, goPrev, goNext]);

  // Touch/swipe handlers
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(() => {
    const deltaX = touchStartX.current - touchEndX.current;
    const minSwipe = 50;
    if (Math.abs(deltaX) > minSwipe) {
      if (deltaX > 0) goNext();
      else goPrev();
    }
  }, [goNext, goPrev]);

  const renderImage = (idx: number, className: string, sizes: string) => {
    if (hasImages && !imgError[idx]) {
      return (
        <Image
          src={images[idx]}
          alt={`${pgName} - Photo ${idx + 1}`}
          fill
          className={`object-cover ${className}`}
          sizes={sizes}
          priority={idx === 0}
          onError={() => setImgError((prev) => ({ ...prev, [idx]: true }))}
        />
      );
    }
    const fallback = fallbackPhotos[idx % fallbackPhotos.length];
    return (
      <div className={`absolute inset-0 bg-gradient-to-br ${fallback.gradient} flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-white/50 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="font-medium text-[#666]">{fallback.label}</p>
          <p className="text-sm text-[#888]">{pgName}</p>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Main Gallery */}
      <div className="space-y-3">
        {/* Main Image */}
        <div
          className="h-72 sm:h-96 rounded-2xl cursor-pointer relative overflow-hidden group bg-[#d4c9a8]"
          onClick={() => openLightbox()}
        >
          {renderImage(activeIdx, "group-hover:scale-105 transition-transform duration-500", "(max-width: 768px) 100vw, 800px")}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          {/* Photo count badge */}
          <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {activeIdx + 1} / {photoCount}
          </div>
          {/* Click to expand hint */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-black/40 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm font-medium">
              Click to expand
            </div>
          </div>
        </div>

        {/* Thumbnails */}
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: Math.min(photoCount, 6) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`h-16 sm:h-20 rounded-xl relative overflow-hidden transition-all duration-300 ${
                i === activeIdx ? "ring-2 ring-[#1B5E3B]/30 ring-offset-2 scale-105" : "opacity-70 hover:opacity-100"
              }`}
            >
              {hasImages && !imgError[i] ? (
                <Image
                  src={images[i]}
                  alt={`${pgName} thumbnail ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="120px"
                  onError={() => setImgError((prev) => ({ ...prev, [i]: true }))}
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${fallbackPhotos[i % fallbackPhotos.length].gradient} flex items-center justify-center text-[10px] font-medium text-[#666]`}>
                  {fallbackPhotos[i % fallbackPhotos.length].label}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Fullscreen Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{
            zIndex: 9999,
            backgroundColor: lightboxVisible ? "rgba(0,0,0,0.9)" : "rgba(0,0,0,0)",
            backdropFilter: lightboxVisible ? "blur(8px)" : "blur(0px)",
            WebkitBackdropFilter: lightboxVisible ? "blur(8px)" : "blur(0px)",
            transition: "background-color 0.3s ease, backdrop-filter 0.3s ease, -webkit-backdrop-filter 0.3s ease",
          }}
          onClick={closeLightbox}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Close button */}
          <button
            aria-label="Close gallery"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
            style={{
              zIndex: 10001,
              opacity: lightboxVisible ? 1 : 0,
              transform: lightboxVisible ? "scale(1)" : "scale(0.8)",
              transition: "opacity 0.3s ease 0.1s, transform 0.3s ease 0.1s, background-color 0.2s ease",
            }}
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous button */}
          <button
            aria-label="Previous photo"
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl flex items-center justify-center text-black/70 transition-all duration-200 hover:scale-110"
            style={{
              zIndex: 10001,
              opacity: lightboxVisible ? 1 : 0,
              transform: lightboxVisible ? "translateY(-50%) translateX(0)" : "translateY(-50%) translateX(-20px)",
              transition: "opacity 0.3s ease 0.15s, transform 0.3s ease 0.15s, background-color 0.2s ease",
            }}
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next button */}
          <button
            aria-label="Next photo"
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl flex items-center justify-center text-black/70 transition-all duration-200 hover:scale-110"
            style={{
              zIndex: 10001,
              opacity: lightboxVisible ? 1 : 0,
              transform: lightboxVisible ? "translateY(-50%) translateX(0)" : "translateY(-50%) translateX(20px)",
              transition: "opacity 0.3s ease 0.15s, transform 0.3s ease 0.15s, background-color 0.2s ease",
            }}
            onClick={(e) => { e.stopPropagation(); goNext(); }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Main lightbox image */}
          <div
            className="w-full max-w-5xl mx-4 sm:mx-8"
            style={{
              height: "75vh",
              maxHeight: "75vh",
              opacity: lightboxVisible && !transitioning ? 1 : 0,
              transform: lightboxVisible && !transitioning ? "scale(1)" : "scale(0.95)",
              transition: "opacity 0.25s ease, transform 0.25s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full h-full rounded-2xl sm:rounded-3xl relative overflow-hidden bg-gray-900/50">
              {renderImage(activeIdx, "object-contain", "(max-width: 768px) 100vw, 1400px")}
            </div>
          </div>

          {/* Image counter - bottom center */}
          <div
            className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-5 py-2 rounded-full text-sm font-medium tracking-wide"
            style={{
              zIndex: 10001,
              opacity: lightboxVisible ? 1 : 0,
              transform: lightboxVisible ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(10px)",
              transition: "opacity 0.3s ease 0.2s, transform 0.3s ease 0.2s",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {activeIdx + 1} / {photoCount}
          </div>

          {/* Thumbnail strip at bottom (desktop only) */}
          <div
            className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 hidden sm:flex gap-2"
            style={{
              zIndex: 10001,
              opacity: lightboxVisible ? 1 : 0,
              transition: "opacity 0.3s ease 0.25s",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {Array.from({ length: Math.min(photoCount, 8) }).map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-14 h-10 rounded-xl relative overflow-hidden transition-all duration-200 border-2 ${
                  i === activeIdx
                    ? "border-white scale-110 opacity-100"
                    : "border-transparent opacity-50 hover:opacity-80"
                }`}
              >
                {hasImages && !imgError[i] ? (
                  <Image
                    src={images[i]}
                    alt={`Thumbnail ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="56px"
                    onError={() => setImgError((prev) => ({ ...prev, [i]: true }))}
                  />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${fallbackPhotos[i % fallbackPhotos.length].gradient}`} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
