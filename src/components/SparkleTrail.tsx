"use client";

import { useEffect, useRef } from "react";

/* Sparkle particles that follow the mouse in the hero area */
export default function SparkleTrail() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const sparkles: HTMLDivElement[] = [];
    let lastX = 0, lastY = 0;

    const createSparkle = (x: number, y: number) => {
      const sparkle = document.createElement("div");
      const size = 3 + Math.random() * 6;
      const hue = [270, 280, 310, 340, 50][Math.floor(Math.random() * 5)];
      sparkle.style.cssText = `
        position: absolute; pointer-events: none;
        width: ${size}px; height: ${size}px;
        left: ${x - size / 2}px; top: ${y - size / 2}px;
        background: hsl(${hue}, 80%, 70%);
        border-radius: 50%;
        box-shadow: 0 0 ${size * 2}px hsl(${hue}, 80%, 60%);
        animation: sparkle-fade 0.8s ease-out forwards;
        z-index: 50;
      `;
      container.appendChild(sparkle);
      sparkles.push(sparkle);
      setTimeout(() => {
        sparkle.remove();
        sparkles.splice(sparkles.indexOf(sparkle), 1);
      }, 800);
    };

    const handleMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const dist = Math.sqrt((x - lastX) ** 2 + (y - lastY) ** 2);
      if (dist > 20) {
        createSparkle(x, y);
        if (Math.random() > 0.5) createSparkle(x + (Math.random() - 0.5) * 15, y + (Math.random() - 0.5) * 15);
        lastX = x;
        lastY = y;
      }
    };

    container.addEventListener("mousemove", handleMove);
    return () => {
      container.removeEventListener("mousemove", handleMove);
      sparkles.forEach(s => s.remove());
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 z-[5] overflow-hidden" />;
}
