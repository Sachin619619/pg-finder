"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  lat: number;
  lng: number;
  name: string;
  area: string;
};

export default function MapEmbed({ lat, lng, name, area }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Load Leaflet CSS first, then JS
    const loadCSS = () =>
      new Promise<void>((resolve) => {
        if (document.querySelector('link[href*="leaflet"]')) {
          resolve();
          return;
        }
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.onload = () => resolve();
        document.head.appendChild(link);
      });

    const loadJS = () =>
      new Promise<void>((resolve) => {
        // @ts-expect-error - Leaflet loaded dynamically
        if (window.L) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => resolve();
        document.head.appendChild(script);
      });

    const initMap = async () => {
      await loadCSS();
      await loadJS();

      if (!mapRef.current || mapInstanceRef.current) return;

      // @ts-expect-error - Leaflet loaded dynamically
      const L = window.L;
      const map = L.map(mapRef.current, {
        scrollWheelZoom: false,
        zoomControl: true,
      }).setView([lat, lng], 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const icon = L.divIcon({
        html: `<div style="background: linear-gradient(135deg, #7c3aed, #c026d3); width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3);"></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        className: "",
      });

      L.marker([lat, lng], { icon })
        .addTo(map)
        .bindPopup(`<strong>${name}</strong><br>${area}`)
        .openPopup();

      // Force a resize after render to fix tile alignment
      setTimeout(() => {
        map.invalidateSize();
      }, 100);

      mapInstanceRef.current = map;
      setLoaded(true);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        // @ts-expect-error - Leaflet map instance
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, name, area]);

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
      <div
        ref={mapRef}
        className="w-full"
        style={{ height: "256px", zIndex: 0 }}
      />
      {!loaded && (
        <div className="w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800" style={{ height: "256px", marginTop: "-256px", position: "relative" }}>
          <span className="text-sm text-gray-400">Loading map...</span>
        </div>
      )}
      <div className="p-3 bg-white dark:bg-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-violet-500">📍</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{area}</span>
        </div>
        <a
          href={`https://www.google.com/maps?q=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-violet-600 hover:underline font-medium"
        >
          Open in Google Maps →
        </a>
      </div>
    </div>
  );
}
