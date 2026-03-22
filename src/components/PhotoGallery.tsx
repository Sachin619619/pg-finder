"use client";

import { useState } from "react";
import Image from "next/image";

const fallbackPhotos = [
  { label: "Living Room", gradient: "from-violet-200 to-indigo-200" },
  { label: "Bedroom", gradient: "from-rose-200 to-pink-200" },
  { label: "Kitchen", gradient: "from-amber-200 to-orange-200" },
  { label: "Bathroom", gradient: "from-teal-200 to-emerald-200" },
  { label: "Balcony", gradient: "from-sky-200 to-blue-200" },
  { label: "Common Area", gradient: "from-purple-200 to-fuchsia-200" },
];

export default function PhotoGallery({ pgName, images }: { pgName: string; images?: string[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [imgError, setImgError] = useState<Record<number, boolean>>({});

  const hasImages = images && images.length > 0;
  const photoCount = hasImages ? images.length : fallbackPhotos.length;

  const renderImage = (idx: number, className: string, sizes: string) => {
    if (hasImages && !imgError[idx]) {
      return (
        <Image
          src={images[idx]}
          alt={`${pgName} - Photo ${idx + 1}`}
          fill
          className={`object-cover ${className}`}
          sizes={sizes}
          onError={() => setImgError((prev) => ({ ...prev, [idx]: true }))}
        />
      );
    }
    const fallback = fallbackPhotos[idx % fallbackPhotos.length];
    return (
      <div className={`absolute inset-0 bg-gradient-to-br ${fallback.gradient} flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-white/50 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="font-medium text-gray-700">{fallback.label}</p>
          <p className="text-sm text-gray-500">{pgName}</p>
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
          className="h-72 sm:h-96 rounded-2xl cursor-pointer relative overflow-hidden group bg-gray-200"
          onClick={() => setLightbox(true)}
        >
          {renderImage(activeIdx, "group-hover:scale-105 transition-transform duration-500", "(max-width: 768px) 100vw, 800px")}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          {/* Photo count badge */}
          <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl text-xs font-medium">
            {activeIdx + 1} / {photoCount}
          </div>
        </div>

        {/* Thumbnails */}
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: Math.min(photoCount, 6) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`h-16 sm:h-20 rounded-xl relative overflow-hidden transition-all ${
                i === activeIdx ? "ring-2 ring-violet-500 ring-offset-2 scale-105" : "opacity-70 hover:opacity-100"
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
                <div className={`absolute inset-0 bg-gradient-to-br ${fallbackPhotos[i % fallbackPhotos.length].gradient} flex items-center justify-center text-[10px] font-medium text-gray-600`}>
                  {fallbackPhotos[i % fallbackPhotos.length].label}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
          <button className="absolute top-6 right-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 z-10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 z-10"
            onClick={(e) => { e.stopPropagation(); setActiveIdx((activeIdx - 1 + photoCount) % photoCount); }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 z-10"
            onClick={(e) => { e.stopPropagation(); setActiveIdx((activeIdx + 1) % photoCount); }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="w-full max-w-4xl h-[70vh] rounded-3xl relative overflow-hidden bg-gray-900" onClick={(e) => e.stopPropagation()}>
            {renderImage(activeIdx, "", "(max-width: 768px) 100vw, 1200px")}
          </div>
        </div>
      )}
    </>
  );
}
