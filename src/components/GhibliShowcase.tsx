"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

function useParallax(speed = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const windowH = window.innerHeight;
      if (rect.bottom > 0 && rect.top < windowH) {
        setOffset((rect.top - windowH / 2) * speed);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return { ref, offset };
}

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function getTimeOfDay(): "morning" | "afternoon" | "evening" | "night" {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 20) return "evening";
  return "night";
}

const heroConfig = {
  morning: {
    image: "/images/ghibli/hero-morning.png",
    alt: "Illustrated Bangalore city at sunrise",
    greeting: "Good morning",
    tagline: "Start your day in a new home",
  },
  afternoon: {
    image: "/images/ghibli/hero-afternoon.png",
    alt: "Illustrated Bangalore city on a sunny afternoon",
    greeting: "Good afternoon",
    tagline: "Find your perfect stay today",
  },
  evening: {
    image: "/images/ghibli/hero-bangalore.png",
    alt: "Illustrated Bangalore cityscape at golden hour",
    greeting: "Good evening",
    tagline: "Come home to comfort",
  },
  night: {
    image: "/images/ghibli/hero-night.png",
    alt: "Illustrated Bangalore city under starry night sky",
    greeting: "Good night",
    tagline: "Dream of your perfect home",
  },
};

export default function GhibliShowcase() {
  const hero = useParallax(0.15);
  const [timeOfDay, setTimeOfDay] = useState<"morning" | "afternoon" | "evening" | "night">("evening");

  useEffect(() => {
    setTimeOfDay(getTimeOfDay());
  }, []);

  const config = heroConfig[timeOfDay];

  return (
    <>
      {/* ===== GHIBLI HERO BANNER — Changes based on time of day! ===== */}
      <section className="relative overflow-hidden bg-[#1a1a1a]">
        <div ref={hero.ref} className="relative h-[420px] sm:h-[520px]">
          <div
            className="absolute inset-0 will-change-transform"
            style={{ transform: `translateY(${hero.offset}px) scale(1.1)` }}
          >
            <Image
              src={config.image}
              alt={config.alt}
              fill
              className="object-cover"
              priority
            />
          </div>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a]/60 to-transparent" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12 max-w-7xl mx-auto">
            <FadeIn>
              <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white/80 mb-4 border border-white/10">
                {config.greeting} — {config.tagline}
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-white leading-tight mb-3">
                Live like a <em>local</em>,<br />feel like <em>home</em>
              </h2>
              <p className="text-white/60 max-w-md text-sm sm:text-base leading-relaxed">
                Discover warm, welcoming PG spaces across Bangalore&apos;s best neighborhoods. Zero brokerage, verified listings.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ===== FEATURE CARDS WITH GHIBLI IMAGES ===== */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="text-xs font-semibold text-black/40 uppercase tracking-widest mb-4 inline-block">The Castle Experience</span>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal text-black mb-4 tracking-tight">
                More than just a room
              </h2>
              <p className="text-black/50 max-w-md mx-auto">A place where memories are made and friendships bloom</p>
            </div>
          </FadeIn>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1 — Large */}
            <FadeIn delay={100} className="lg:col-span-2">
              <div className="group relative rounded-3xl overflow-hidden bg-[white] border border-gray-200 h-[380px] cursor-pointer hover:border-black/20 transition-all">
                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                  <Image
                    src="/images/ghibli/cozy-room.png"
                    alt="Cozy PG room with warm lighting"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-7">
                  <span className="inline-block px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium text-white/90 mb-3 border border-white/10">
                    Cozy Spaces
                  </span>
                  <h3 className="font-serif text-2xl text-white mb-2">Rooms that feel like home</h3>
                  <p className="text-white/60 text-sm max-w-sm">Beautifully furnished rooms with natural light, study areas, and all the comforts you need</p>
                </div>
              </div>
            </FadeIn>

            {/* Card 2 — Tall */}
            <FadeIn delay={200}>
              <div className="group relative rounded-3xl overflow-hidden bg-[white] border border-gray-200 h-[380px] cursor-pointer hover:border-black/20 transition-all">
                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                  <Image
                    src="/images/ghibli/balcony-chai.png"
                    alt="Evening chai on PG balcony"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-7">
                  <span className="inline-block px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium text-white/90 mb-3 border border-white/10">
                    Peaceful Evenings
                  </span>
                  <h3 className="font-serif text-xl text-white mb-2">Your evening sanctuary</h3>
                  <p className="text-white/60 text-sm">Unwind with a cup of chai and Bangalore&apos;s stunning sunsets</p>
                </div>
              </div>
            </FadeIn>

            {/* Card 3 — Full width */}
            <FadeIn delay={300} className="lg:col-span-3">
              <div className="group relative rounded-3xl overflow-hidden bg-[white] border border-gray-200 h-[340px] cursor-pointer hover:border-black/20 transition-all">
                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                  <Image
                    src="/images/ghibli/community-evening.png"
                    alt="Friends gathering in PG common area"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-7 flex items-end justify-between">
                  <div>
                    <span className="inline-block px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium text-white/90 mb-3 border border-white/10">
                      Community Living
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl text-white mb-2">Where friendships begin</h3>
                    <p className="text-white/60 text-sm max-w-lg">Common areas designed for connection — movie nights, jam sessions, and lifelong friendships</p>
                  </div>
                  <Link
                    href="#listings"
                    className="hidden sm:flex shrink-0 items-center gap-2 px-6 py-3 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl text-white text-sm font-medium hover:bg-white/25 transition-all"
                  >
                    Explore PGs
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  );
}
