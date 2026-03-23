"use client";

import { useEffect, useRef } from "react";

/* ──────────────────────────────────────────────────────
   Flying birds, twinkling stars, shooting stars,
   floating particles — all rendered on a single canvas
   for buttery-smooth 60fps performance.
   ────────────────────────────────────────────────────── */

type Bird = { x: number; y: number; speed: number; size: number; flapPhase: number; opacity: number };
type Star = { x: number; y: number; size: number; phase: number; speed: number };
type ShootingStar = { x: number; y: number; angle: number; speed: number; length: number; life: number; maxLife: number; active: boolean };
type Particle = { x: number; y: number; vx: number; vy: number; size: number; opacity: number; hue: number; life: number };

export default function HeroAnimations() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = 0, h = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      w = parent.offsetWidth;
      h = parent.offsetHeight;
      canvas.width = w * devicePixelRatio;
      canvas.height = h * devicePixelRatio;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    // ── Birds ──
    const birds: Bird[] = [];
    const spawnBird = () => {
      if (birds.length > 6) return;
      const y = h * (0.1 + Math.random() * 0.35);
      birds.push({
        x: -30,
        y,
        speed: 0.6 + Math.random() * 0.8,
        size: 8 + Math.random() * 10,
        flapPhase: Math.random() * Math.PI * 2,
        opacity: 0.15 + Math.random() * 0.25,
      });
    };

    // ── Stars ──
    const stars: Star[] = Array.from({ length: 35 }, () => ({
      x: Math.random() * 2000,
      y: Math.random() * 1000,
      size: 0.5 + Math.random() * 1.8,
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.5,
    }));

    // ── Shooting stars ──
    const shootingStars: ShootingStar[] = [];
    const spawnShootingStar = () => {
      if (shootingStars.filter(s => s.active).length > 1) return;
      shootingStars.push({
        x: Math.random() * w * 0.6 + w * 0.1,
        y: Math.random() * h * 0.3,
        angle: Math.PI * 0.15 + Math.random() * 0.15,
        speed: 4 + Math.random() * 4,
        length: 40 + Math.random() * 60,
        life: 0,
        maxLife: 60 + Math.random() * 40,
        active: true,
      });
    };

    // ── Particles ──
    const particles: Particle[] = [];
    const spawnParticle = () => {
      if (particles.length > 20) return;
      particles.push({
        x: Math.random() * w,
        y: h + 10,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -(0.3 + Math.random() * 0.6),
        size: 1.5 + Math.random() * 3,
        opacity: 0.2 + Math.random() * 0.3,
        hue: [270, 280, 300, 320, 240][Math.floor(Math.random() * 5)],
        life: 300 + Math.random() * 300,
      });
    };

    let frame = 0;

    const drawBird = (b: Bird, t: number) => {
      const flap = Math.sin(t * 0.15 + b.flapPhase) * 0.5;
      ctx.save();
      ctx.translate(b.x, b.y + Math.sin(t * 0.02 + b.flapPhase) * 4);
      ctx.strokeStyle = `rgba(255,255,255,${b.opacity})`;
      ctx.lineWidth = 1.2;
      ctx.lineCap = "round";
      const s = b.size;
      // Left wing
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-s * 0.5, -s * (0.4 + flap * 0.4), -s, -s * flap * 0.2);
      ctx.stroke();
      // Right wing
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(s * 0.5, -s * (0.4 + flap * 0.4), s, -s * flap * 0.2);
      ctx.stroke();
      ctx.restore();
    };

    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, w, h);

      // Stars
      for (const s of stars) {
        const twinkle = (Math.sin(frame * 0.03 * s.speed + s.phase) + 1) * 0.5;
        const alpha = 0.1 + twinkle * 0.6;
        ctx.beginPath();
        ctx.arc(s.x % w, s.y % h, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      }

      // Shooting stars
      if (frame % 200 === 0) spawnShootingStar();
      for (const ss of shootingStars) {
        if (!ss.active) continue;
        ss.life++;
        const progress = ss.life / ss.maxLife;
        if (progress > 1) { ss.active = false; continue; }
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        const alpha = progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7;
        const grad = ctx.createLinearGradient(
          ss.x, ss.y,
          ss.x - Math.cos(ss.angle) * ss.length,
          ss.y - Math.sin(ss.angle) * ss.length
        );
        grad.addColorStop(0, `rgba(255,255,255,${alpha * 0.9})`);
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(
          ss.x - Math.cos(ss.angle) * ss.length,
          ss.y - Math.sin(ss.angle) * ss.length
        );
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Birds
      if (frame % 180 === 0) spawnBird();
      for (let i = birds.length - 1; i >= 0; i--) {
        const b = birds[i];
        b.x += b.speed;
        if (b.x > w + 40) { birds.splice(i, 1); continue; }
        drawBird(b, frame);
      }

      // Particles
      if (frame % 15 === 0) spawnParticle();
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0 || p.y < -10) { particles.splice(i, 1); continue; }
        const fadeIn = Math.min(1, (300 - Math.abs(p.life - 300)) / 100);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 65%, ${p.opacity * fadeIn})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[1] pointer-events-none"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
