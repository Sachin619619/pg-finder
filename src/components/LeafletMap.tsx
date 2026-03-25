"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { PGListing } from "@/data/listings";
import Link from "next/link";

type Props = {
  listings: PGListing[];
};

// Custom marker icon using the app's color theme
function createMarkerIcon(price: number, isSelected: boolean) {
  const label =
    price >= 10000
      ? `${Math.round(price / 1000)}K`
      : `${(price / 1000).toFixed(1)}K`;

  const bg = isSelected ? "#1B1C15" : "#FFFAEB";
  const text = isSelected ? "#ffffff" : "#1B1C15";
  const border = isSelected ? "#1B1C15" : "#e8e0cc";
  const shadow = isSelected
    ? "0 4px 12px rgba(27,28,21,0.35)"
    : "0 2px 8px rgba(0,0,0,0.15)";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="56" viewBox="0 0 48 56">
      <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.2"/>
      </filter>
      <g filter="url(#s)">
        <rect x="4" y="4" width="40" height="32" rx="16" fill="${bg}" stroke="${border}" stroke-width="2"/>
        <polygon points="24,44 18,34 30,34" fill="${bg}" stroke="${border}" stroke-width="2" stroke-linejoin="round"/>
        <rect x="18" y="32" width="12" height="4" fill="${bg}"/>
        <text x="24" y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="700" font-size="12" fill="${text}">₹${label}</text>
      </g>
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: "leaflet-marker-custom",
    iconSize: [48, 56],
    iconAnchor: [24, 56],
    popupAnchor: [0, -48],
  });
}

export default function LeafletMap({ listings }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [selectedPG, setSelectedPG] = useState<PGListing | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [12.9716, 77.5946],
      zoom: 12,
      zoomControl: false,
      scrollWheelZoom: true,
    });

    // Add zoom control to bottom-right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Use OpenStreetMap tiles with a clean style
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when listings change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (listings.length === 0) return;

    const bounds = L.latLngBounds([]);

    listings.forEach((pg) => {
      if (!pg.lat || !pg.lng) return;

      const marker = L.marker([pg.lat, pg.lng], {
        icon: createMarkerIcon(pg.price, selectedPG?.id === pg.id),
      });

      marker.on("click", () => {
        setSelectedPG((prev) => (prev?.id === pg.id ? null : pg));
      });

      marker.addTo(map);
      markersRef.current.push(marker);
      bounds.extend([pg.lat, pg.lng]);
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [listings]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update marker icons when selection changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((marker, idx) => {
      const pg = listings[idx];
      if (!pg) return;
      marker.setIcon(createMarkerIcon(pg.price, selectedPG?.id === pg.id));
    });
  }, [selectedPG, listings]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden relative">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-[#FFFAEB]">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-[#1B1C15]"
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
          Map View — {listings.length} PGs
        </h3>
        <span className="text-xs text-black/40">
          Click a marker for details
        </span>
      </div>

      {/* Map container */}
      <div
        ref={mapRef}
        className="w-full"
        style={{ height: "calc(max(500px, 60vh))" }}
      />

      {/* Selected PG info card */}
      {selectedPG && (
        <div className="absolute bottom-6 left-4 right-4 z-[1000] animate-in slide-in-from-bottom duration-300">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 max-w-md mx-auto">
            <button
              onClick={() => setSelectedPG(null)}
              className="absolute top-3 right-3 w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-[#F4EDD9] rounded-xl flex items-center justify-center shrink-0">
                <svg
                  className="w-8 h-8 text-[#1B1C15]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">
                  {selectedPG.name}
                </h4>
                <p className="text-sm text-gray-500">
                  {selectedPG.locality}, {selectedPG.area}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-lg font-bold text-[#1B1C15]">
                    ₹{selectedPG.price.toLocaleString()}/mo
                  </span>
                  <span className="flex items-center gap-1 text-sm">
                    <svg
                      className="w-4 h-4 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {selectedPG.rating}
                  </span>
                  <span className="text-xs text-gray-400 capitalize px-2 py-0.5 bg-gray-100 rounded-full">
                    {selectedPG.gender}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {selectedPG.amenities.slice(0, 3).map((a) => (
                    <span
                      key={a}
                      className="text-[10px] px-2 py-0.5 bg-[#F4EDD9] text-[#1B1C15] rounded-full"
                    >
                      {a}
                    </span>
                  ))}
                  {selectedPG.amenities.length > 3 && (
                    <span className="text-[10px] text-gray-400">
                      +{selectedPG.amenities.length - 3} more
                    </span>
                  )}
                </div>
                <Link
                  href={`/listing/${selectedPG.id}`}
                  className="inline-flex items-center gap-1 mt-3 text-sm text-[#1B1C15] font-medium hover:underline"
                >
                  View Details
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for Leaflet marker cleanup */}
      <style jsx global>{`
        .leaflet-marker-custom {
          background: none !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
        }
        .leaflet-control-zoom a {
          border-radius: 10px !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 16px !important;
          border: 1px solid #e8e0cc !important;
          background: #fffaeb !important;
          color: #1b1c15 !important;
        }
        .leaflet-control-zoom a:hover {
          background: #f4edd9 !important;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1) !important;
          border-radius: 12px !important;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
