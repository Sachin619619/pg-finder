"use client";

import { useState, useEffect, useRef, useMemo } from "react";

/* ============================
   BANNER VARIANTS — each one looks different
   ============================ */

const bannerVariants = [
  {
    id: "gradient-violet",
    bg: "from-violet-600 via-purple-600 to-fuchsia-500",
    emojis: ["🏠", "🔑", "🛋️", "✨", "🏡"],
    tagline: "Your dream PG is one search away",
    cta: "Explore Now",
    href: "/#listings",
  },
  {
    id: "gradient-ocean",
    bg: "from-cyan-500 via-blue-600 to-indigo-600",
    emojis: ["🌊", "🏢", "🛏️", "⭐", "🪴"],
    tagline: "Zero brokerage • Verified listings • Instant move-in",
    cta: "Browse PGs",
    href: "/#listings",
  },
  {
    id: "gradient-sunset",
    bg: "from-orange-500 via-pink-500 to-rose-600",
    emojis: ["🌅", "🚪", "🎯", "💫", "🏰"],
    tagline: "1000+ happy tenants in Bangalore trust Castle",
    cta: "Join Them",
    href: "/signup",
  },
  {
    id: "gradient-forest",
    bg: "from-emerald-500 via-teal-600 to-cyan-600",
    emojis: ["🌿", "🏡", "🔒", "💚", "🪟"],
    tagline: "Safe • Affordable • Furnished PGs across 15+ areas",
    cta: "Find Yours",
    href: "/#areas",
  },
  {
    id: "gradient-neon",
    bg: "from-fuchsia-500 via-purple-600 to-blue-600",
    emojis: ["⚡", "🏠", "🎉", "🔥", "💎"],
    tagline: "New PGs added daily — don't miss out!",
    cta: "See Latest",
    href: "/#listings",
  },
  {
    id: "marquee-gold",
    bg: "from-amber-500 via-yellow-500 to-orange-500",
    emojis: ["🏆", "⭐", "👑", "🎖️", "🥇"],
    tagline: "Top rated PGs • 4.3 avg stars • Real reviews",
    cta: "Top Picks",
    href: "/#listings",
  },
];

/* Marquee-style scrolling text banner */
function MarqueeBanner({ variant, direction }: { variant: typeof bannerVariants[0]; direction: "left" | "right" }) {
  const text = `${variant.emojis[0]} ${variant.tagline}  •  ${variant.emojis[1]} Castle — Find Your Home  •  ${variant.emojis[2]} Bangalore's #1 PG Finder  •  ${variant.emojis[3]} ${variant.tagline}  •  `;
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${variant.bg}`}>
      <div className="absolute inset-0 opacity-20" style={{
        background: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.3) 0%, transparent 60%)",
      }} />
      <div className="py-3 relative">
        <div
          className="flex whitespace-nowrap"
          style={{
            animation: `bannerMarquee${direction === "right" ? "Reverse" : ""} 20s linear infinite`,
          }}
        >
          {[0, 1, 2].map((i) => (
            <span key={i} className="text-white/90 text-sm font-semibold mx-4 flex-shrink-0">
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Floating-elements banner with parallax scroll */
function FloatingBanner({
  variant,
  slideFrom,
}: {
  variant: typeof bannerVariants[0];
  slideFrom: "left" | "right" | "bottom";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const slideClass = !visible
    ? slideFrom === "left"
      ? "opacity-0 -translate-x-16"
      : slideFrom === "right"
      ? "opacity-0 translate-x-16"
      : "opacity-0 translate-y-12"
    : "opacity-100 translate-x-0 translate-y-0";

  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${slideClass}`}>
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${variant.bg} shadow-lg`}>
        {/* Shimmer */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            background: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.35) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)",
          }} />
          <div className="absolute inset-0" style={{
            background: "linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
            animation: "bannerShimmer 3s ease-in-out infinite",
          }} />
        </div>

        {/* Floating emojis */}
        {variant.emojis.map((emoji, i) => (
          <span
            key={i}
            className="absolute select-none pointer-events-none"
            style={{
              fontSize: 18 + Math.random() * 8,
              left: `${10 + i * 18}%`,
              top: `${15 + (i % 3) * 25}%`,
              animation: `bannerFloat ${5 + i * 0.7}s ease-in-out ${i * 0.4}s infinite`,
              opacity: 0.35,
            }}
          >
            {emoji}
          </span>
        ))}

        {/* Content */}
        <div className="relative z-10 flex items-center justify-between px-5 sm:px-6 py-3.5">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center justify-center w-9 h-9 bg-white/20 rounded-xl backdrop-blur-sm flex-shrink-0">
              <span className="text-lg">{variant.emojis[0]}</span>
            </div>
            <p className="text-white text-sm sm:text-base font-semibold truncate">
              {variant.tagline}
            </p>
          </div>
          <a
            href={variant.href}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-bold rounded-full transition-all hover:scale-105 flex-shrink-0 ml-3"
          >
            {variant.cta}
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

/* Split two-tone banner */
function SplitBanner({ variant }: { variant: typeof bannerVariants[0] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${variant.bg} shadow-lg`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-black/20 skew-x-[-12deg] translate-x-10" />
        </div>

        {/* Floating emojis scattered */}
        {variant.emojis.map((emoji, i) => (
          <span
            key={i}
            className="absolute select-none pointer-events-none"
            style={{
              fontSize: 22,
              left: `${5 + i * 20}%`,
              top: `${20 + ((i * 37) % 60)}%`,
              animation: `bannerFloat ${6 + i}s ease-in-out ${i * 0.5}s infinite`,
              opacity: 0.3,
            }}
          >
            {emoji}
          </span>
        ))}

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between px-5 sm:px-8 py-4 gap-3">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {variant.emojis.slice(0, 3).map((e, i) => (
                <span
                  key={i}
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-base border-2 border-white/30"
                  style={{ animation: `bannerFloat ${4 + i}s ease-in-out ${i * 0.3}s infinite` }}
                >
                  {e}
                </span>
              ))}
            </div>
            <div>
              <p className="text-white text-sm sm:text-base font-bold">{variant.tagline}</p>
              <p className="text-white/60 text-xs">Castle — Bangalore&apos;s #1 PG Finder</p>
            </div>
          </div>
          <a
            href={variant.href}
            className="inline-flex items-center gap-2 px-5 py-2 bg-white text-gray-900 text-xs font-bold rounded-full hover:scale-105 transition-all shadow-lg flex-shrink-0"
          >
            {variant.cta}
            <span className="text-sm">{variant.emojis[0]}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

/* Pulsing compact banner */
function PulseBanner({ variant }: { variant: typeof bannerVariants[0] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`transition-all duration-500 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      <div className={`relative overflow-hidden rounded-full bg-gradient-to-r ${variant.bg} shadow-md`}>
        {/* Glow pulse */}
        <div className="absolute inset-0 rounded-full" style={{
          boxShadow: "inset 0 0 30px rgba(255,255,255,0.15)",
          animation: "bannerPulse 2s ease-in-out infinite",
        }} />
        <div className="relative z-10 flex items-center justify-center gap-3 px-6 py-2.5">
          <span className="text-lg" style={{ animation: "bannerFloat 3s ease-in-out infinite" }}>{variant.emojis[0]}</span>
          <p className="text-white text-xs sm:text-sm font-bold">{variant.tagline}</p>
          <span className="text-lg" style={{ animation: "bannerFloat 3s ease-in-out 1s infinite" }}>{variant.emojis[4]}</span>
        </div>
      </div>
    </div>
  );
}

/* ============================
   DYNAMIC BANNER — picks random variant & style
   ============================ */

type BannerStyle = "floating" | "marquee" | "split" | "pulse";

interface DynamicBannerProps {
  /** Force a specific style, or let it randomize */
  style?: BannerStyle;
  /** Force a specific variant index */
  variantIndex?: number;
  /** Unique seed so each placement gets different content */
  seed?: number;
}

export default function AnimatedBanner({ style, variantIndex, seed = 0 }: DynamicBannerProps) {
  // Deterministic "random" based on seed so SSR matches client
  const config = useMemo(() => {
    const hash = Math.abs(seed * 2654435761) % 1000;
    const vIdx = variantIndex ?? hash % bannerVariants.length;
    const variant = bannerVariants[vIdx];

    const styles: BannerStyle[] = ["floating", "marquee", "split", "pulse"];
    const sIdx = style ? styles.indexOf(style) : hash % styles.length;
    const chosenStyle = styles[sIdx >= 0 ? sIdx : 0];

    const directions: ("left" | "right" | "bottom")[] = ["left", "right", "bottom"];
    const dir = directions[hash % directions.length];
    const marqueeDir: "left" | "right" = hash % 2 === 0 ? "left" : "right";

    return { variant, chosenStyle, dir, marqueeDir };
  }, [seed, style, variantIndex]);

  const { variant, chosenStyle, dir, marqueeDir } = config;

  return (
    <div className="my-6 mx-4 sm:mx-0">
      {chosenStyle === "marquee" ? (
        <MarqueeBanner variant={variant} direction={marqueeDir} />
      ) : chosenStyle === "split" ? (
        <SplitBanner variant={variant} />
      ) : chosenStyle === "pulse" ? (
        <PulseBanner variant={variant} />
      ) : (
        <FloatingBanner variant={variant} slideFrom={dir} />
      )}
    </div>
  );
}

/* Named exports for explicit use */
export { MarqueeBanner, FloatingBanner, SplitBanner, PulseBanner, bannerVariants };
