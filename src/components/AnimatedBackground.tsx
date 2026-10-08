/**
 * AnimatedBackground.tsx
 * ============================================================
 * Tema: DIGITAL × INDUSTRIAL — Blue Glow / Cyan Neon
 * Portofolio Fikri Yandi — Industrial Engineer & Web Automation
 *
 * Layer yang dirender (dari bawah ke atas):
 *  0. Ambient base backdrop gradient
 *  1. Aurora Orbs / Glow Blobs  (CSS animation, GPU-accelerated)
 *  2. Blueprint Grid             (CSS + SVG pattern)
 *  3. Grid Pulse Lines           (Canvas)
 *  4. Particle Network           (Canvas — interaktif dengan mouse)
 *  5. Matrix Rain                (Canvas — binary/kode jatuh)
 *  6. HUD Scan Lines             (CSS animation)
 *  7. Floating Industrial & Digital Icons (motion/framer-motion)
 *  8. Large Rotating Gear        (CSS animation, semi-transparan)
 *  9. Cursor Spotlight           (ref-driven, 0 re-renders)
 * 10. Film Grain overlay         (CSS noise)
 *
 * Semua layer: pointer-events: none
 * Support: dark mode, light mode, prefers-reduced-motion, mobile
 * ============================================================
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cpu, Database, Wifi, Server, Settings, Zap,
  BarChart2, GitMerge, Activity, Code2, Box,
  Layers, RefreshCw, Truck, HardHat, Wrench,
  Factory, ShieldCheck, Network, Terminal, CloudCog,
  FlaskConical, ScanLine, Cog
} from 'lucide-react';

// ============================================================
// CONSTANTS — tweak di sini untuk ubah tampilan
// ============================================================

/** Warna tema utama */
const CYAN   = '#00C2FF';
const BLUE   = '#3B5BFF';
const PURPLE = '#A855F7';
const TEAL   = '#14B8A6';

/** Particle Network */
const PARTICLE_COUNT_DESKTOP = 72;   // jumlah partikel desktop
const PARTICLE_COUNT_MOBILE  = 28;   // dikurangi di mobile (< 768px)
const PARTICLE_MAX_SPEED     = 0.55; // kecepatan maksimum partikel
const PARTICLE_CONNECT_DIST  = 160;  // jarak koneksi antar partikel (px)
const MOUSE_REPEL_RADIUS     = 120;  // radius efek repel mouse
const MOUSE_REPEL_STRENGTH   = 3.5;  // kekuatan dorong

/** Matrix Rain */
const MATRIX_CHARS    = '01アイウエオカキクケコ</>{}[]#@&%$!?';
const MATRIX_FONT_SIZE = 13;          // ukuran font kolom
const MATRIX_SPEED    = 0.6;          // kecepatan jatuh (px per frame faktor)
const MATRIX_OPACITY_DARK  = 0.13;   // opacity kolom matrix (dark mode)
const MATRIX_OPACITY_LIGHT = 0.055;  // opacity kolom matrix (light mode)

/** Grid Blueprint Pulse */
const GRID_PULSE_INTERVAL = 3000;    // ms antar pulse baru
const GRID_SIZE           = 38;      // ukuran sel grid (px)

/** Aurora Orbs */
const ORB_COUNT = 4;

/** Animasi icon floating */
const ICON_COUNT_DESKTOP = 20;
const ICON_COUNT_MOBILE  = 8;

// ============================================================
// TYPE DEFINITIONS
// ============================================================

interface AnimatedBackgroundProps {
  isDarkMode?: boolean;
}

interface FloatingIconDef {
  Icon: React.ElementType;
  x: number;      // % dari kiri
  y: number;      // % dari atas
  size: number;   // px
  duration: number;
  delay: number;
  rotateSpeed: number; // durasi putaran (0 = tidak berputar)
  opacity: number;
  blur: number;   // px blur untuk efek kedalaman
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

// ============================================================
// ICON POOL — industrial + digital
// ============================================================

const INDUSTRIAL_ICONS = [
  Settings, Wrench, HardHat, Factory, Truck,
  ShieldCheck, FlaskConical, Cog, RefreshCw, Layers
];

const DIGITAL_ICONS = [
  Cpu, Database, Wifi, Server, Zap,
  BarChart2, GitMerge, Activity, Code2, Box,
  Network, Terminal, CloudCog, ScanLine
];

const ALL_ICONS = [...INDUSTRIAL_ICONS, ...DIGITAL_ICONS];

// ============================================================
// SEEDED PSEUDO-RANDOM (untuk SSR-safety / konsistensi)
// ============================================================
function seededRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// ============================================================
// HOOK: Canvas Particle Network
// ============================================================
function useParticleCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  isDarkMode: boolean,
  reducedMotion: boolean
) {
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const stateRef = useRef<{
    particles: Particle[];
    animId: number;
    paused: boolean;
  }>({ particles: [], animId: 0, paused: false });

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const count = isMobile ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    // Init particles
    const particles: Particle[] = Array.from({ length: count }, () => ({
      x:       Math.random() * canvas.width,
      y:       Math.random() * canvas.height,
      vx:      (Math.random() - 0.5) * PARTICLE_MAX_SPEED * 2,
      vy:      (Math.random() - 0.5) * PARTICLE_MAX_SPEED * 2,
      radius:  Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2,
    }));
    stateRef.current.particles = particles;

    const nodeColor  = isDarkMode ? CYAN  : '#0EA5E9';
    const lineColor  = isDarkMode ? CYAN  : '#0EA5E9';

    const draw = () => {
      if (stateRef.current.paused) {
        stateRef.current.animId = requestAnimationFrame(draw);
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Update + draw particles
      for (const p of particles) {
        // Mouse repel
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_REPEL_RADIUS && dist > 0) {
          const force = (MOUSE_REPEL_RADIUS - dist) / MOUSE_REPEL_RADIUS;
          p.vx += (dx / dist) * force * MOUSE_REPEL_STRENGTH * 0.08;
          p.vy += (dy / dist) * force * MOUSE_REPEL_STRENGTH * 0.08;
        }

        // Clamp speed
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > PARTICLE_MAX_SPEED) {
          p.vx = (p.vx / speed) * PARTICLE_MAX_SPEED;
          p.vy = (p.vy / speed) * PARTICLE_MAX_SPEED;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.globalAlpha = p.opacity * (isDarkMode ? 0.9 : 0.6);
        ctx.fill();

        // Glow
        ctx.shadowBlur  = 8;
        ctx.shadowColor = nodeColor;
        ctx.fill();
        ctx.shadowBlur  = 0;
        ctx.globalAlpha = 1;
      }

      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < PARTICLE_CONNECT_DIST) {
            const alpha = (1 - d / PARTICLE_CONNECT_DIST) * (isDarkMode ? 0.35 : 0.18);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = lineColor;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 0.8;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }

      stateRef.current.animId = requestAnimationFrame(draw);
    };

    draw();

    // Mouse tracking
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    // Pause on hidden tab
    const onVisibilityChange = () => {
      stateRef.current.paused = document.hidden;
    };

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelAnimationFrame(stateRef.current.animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDarkMode, reducedMotion]);
}

// ============================================================
// HOOK: Matrix Rain Canvas
// ============================================================
function useMatrixCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  isDarkMode: boolean,
  reducedMotion: boolean
) {
  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const cols   = Math.floor(canvas.width / MATRIX_FONT_SIZE);
    const drops  = Array.from({ length: cols }, () => Math.random() * -100);
    const chars  = MATRIX_CHARS.split('');
    let animId   = 0;
    let paused   = false;

    const onVisibilityChange = () => { paused = document.hidden; };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const draw = () => {
      if (paused) { animId = requestAnimationFrame(draw); return; }

      // Fade trail
      ctx.fillStyle = isDarkMode
        ? 'rgba(5, 11, 26, 0.18)'
        : 'rgba(219, 230, 246, 0.22)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const opacity = isDarkMode ? MATRIX_OPACITY_DARK : MATRIX_OPACITY_LIGHT;
      ctx.font = `${MATRIX_FONT_SIZE}px "JetBrains Mono", monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Only render left 8% and right 8% columns for side-effect look
        const xFrac = i / cols;
        if (xFrac > 0.10 && xFrac < 0.90) {
          // Skip middle columns — keeps content readable
          drops[i] += MATRIX_SPEED * 0.5;
          if (drops[i] * MATRIX_FONT_SIZE > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          continue;
        }

        const char = chars[Math.floor(Math.random() * chars.length)];
        const y    = drops[i] * MATRIX_FONT_SIZE;

        // Bright head char
        ctx.fillStyle = isDarkMode
          ? `rgba(0, 255, 210, ${opacity * 3})`
          : `rgba(0, 140, 200, ${opacity * 2.5})`;
        ctx.fillText(char, i * MATRIX_FONT_SIZE, y);

        // Trail chars (lighter)
        const trailChar = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = isDarkMode
          ? `rgba(0, 194, 255, ${opacity})`
          : `rgba(14, 165, 233, ${opacity})`;
        ctx.fillText(trailChar, i * MATRIX_FONT_SIZE, y - MATRIX_FONT_SIZE);

        drops[i] += MATRIX_SPEED;
        if (drops[i] * MATRIX_FONT_SIZE > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener('resize', resize, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDarkMode, reducedMotion]);
}

// ============================================================
// HOOK: Grid Pulse Lines Canvas
// ============================================================
function useGridPulseCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  isDarkMode: boolean,
  reducedMotion: boolean
) {
  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    // Pulse state: each pulse travels along a grid line
    interface Pulse { axis: 'h' | 'v'; pos: number; progress: number; speed: number; alpha: number; }
    let pulses: Pulse[] = [];
    let animId = 0;
    let paused = false;

    const onVisibilityChange = () => { paused = document.hidden; };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Spawn pulses periodically
    const spawnPulse = () => {
      const axis   = Math.random() > 0.5 ? 'h' : 'v';
      const maxPos = axis === 'h'
        ? Math.floor(canvas.height / GRID_SIZE)
        : Math.floor(canvas.width  / GRID_SIZE);
      pulses.push({
        axis,
        pos:      Math.floor(Math.random() * maxPos) * GRID_SIZE,
        progress: 0,
        speed:    Math.random() * 2 + 1.5,
        alpha:    Math.random() * 0.5 + 0.3,
      });
      // Keep max 8 pulses at once
      if (pulses.length > 8) pulses.shift();
    };

    const intervalId = setInterval(spawnPulse, GRID_PULSE_INTERVAL);
    spawnPulse();

    const pulseColor = isDarkMode ? CYAN : '#0EA5E9';

    const draw = () => {
      if (paused) { animId = requestAnimationFrame(draw); return; }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const pulse of pulses) {
        const length  = 120; // trail length px
        const maxDist = pulse.axis === 'h' ? canvas.width : canvas.height;

        if (pulse.progress > maxDist + length) {
          pulse.progress = 0; // loop
        }

        const head = pulse.progress;
        const tail = Math.max(0, head - length);

        const grad = pulse.axis === 'h'
          ? ctx.createLinearGradient(tail, pulse.pos, head, pulse.pos)
          : ctx.createLinearGradient(pulse.pos, tail, pulse.pos, head);

        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.6, pulseColor + '55');
        grad.addColorStop(1.0, pulseColor + 'CC');

        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth   = 1.5;
        ctx.globalAlpha = pulse.alpha * (isDarkMode ? 0.8 : 0.45);

        if (pulse.axis === 'h') {
          ctx.moveTo(tail, pulse.pos);
          ctx.lineTo(head, pulse.pos);
        } else {
          ctx.moveTo(pulse.pos, tail);
          ctx.lineTo(pulse.pos, head);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;

        pulse.progress += pulse.speed;
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener('resize', resize, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(intervalId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDarkMode, reducedMotion]);
}

// ============================================================
// GENERATE FLOATING ICON DEFINITIONS (seeded, stable)
// ============================================================
function generateIconDefs(count: number): FloatingIconDef[] {
  const rand = seededRand(42);
  const colors = [CYAN, BLUE, PURPLE, TEAL, '#60A5FA', '#38BDF8'];
  return Array.from({ length: count }, (_, i) => {
    const Icon = ALL_ICONS[i % ALL_ICONS.length];
    const isGear = Icon === Cog || Icon === Settings || Icon === RefreshCw;
    return {
      Icon,
      x:           rand() * 92 + 2,           // 2–94%
      y:           rand() * 88 + 2,            // 2–90%
      size:        Math.floor(rand() * 48) + 24, // 24–72px
      duration:    rand() * 14 + 10,           // 10–24s float
      delay:       rand() * -20,               // stagger
      rotateSpeed: isGear ? rand() * 20 + 12 : (rand() > 0.7 ? rand() * 30 + 20 : 0),
      opacity:     rand() * 0.28 + 0.12,       // 0.12–0.40
      blur:        Math.floor(rand() * 3),     // 0–2px blur depth
      color:       colors[Math.floor(rand() * colors.length)],
    };
  });
}

// Pre-generate icon definitions outside component to keep them stable
const ICON_DEFS_DESKTOP = generateIconDefs(ICON_COUNT_DESKTOP);
const ICON_DEFS_MOBILE  = generateIconDefs(ICON_COUNT_MOBILE);

// ============================================================
// SUB-COMPONENTS
// ============================================================

/** Layer 1: Aurora Glow Orbs */
function AuroraOrbs({ isDarkMode }: { isDarkMode: boolean }) {
  const orbs = useMemo(() => [
    {
      cls: 'aurora-blob-1',
      style: { top: '-15%', left: '-10%', width: '55vw', height: '55vw', maxWidth: 850, maxHeight: 850 },
      color: isDarkMode ? 'rgba(0,194,255,0.30)' : 'rgba(14,165,233,0.22)',
    },
    {
      cls: 'aurora-blob-2',
      style: { top: '8%', right: '-15%', width: '50vw', height: '50vw', maxWidth: 780, maxHeight: 780 },
      color: isDarkMode ? 'rgba(59,130,246,0.26)' : 'rgba(99,102,241,0.20)',
    },
    {
      cls: 'aurora-blob-3',
      style: { bottom: '2%', left: '-12%', width: '50vw', height: '50vw', maxWidth: 750, maxHeight: 750 },
      color: isDarkMode ? 'rgba(168,85,247,0.24)' : 'rgba(168,85,247,0.18)',
    },
    {
      cls: 'aurora-blob-4',
      style: { bottom: '-12%', right: '8%', width: '45vw', height: '45vw', maxWidth: 700, maxHeight: 700 },
      color: isDarkMode ? 'rgba(14,165,233,0.22)' : 'rgba(20,184,166,0.15)',
    },
  ], [isDarkMode]);

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ opacity: isDarkMode ? 0.95 : 0.88 }}
    >
      {orbs.map((orb, i) => (
        <div
          key={i}
          className={`${orb.cls} absolute rounded-full pointer-events-none`}
          style={{
            ...orb.style,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: `blur(${isDarkMode ? 80 : 70}px)`,
            transform: 'translate3d(0,0,0)',
          }}
        />
      ))}
    </div>
  );
}

/** Layer 2: Blueprint Grid (CSS + SVG inline pattern) */
function BlueprintGrid({ isDarkMode }: { isDarkMode: boolean }) {
  const lineAlpha   = isDarkMode ? 0.07 : 0.055;
  const dotAlpha    = isDarkMode ? 0.22 : 0.12;
  const crosshairCl = isDarkMode ? 'rgba(0,194,255,0.45)' : 'rgba(14,165,233,0.35)';

  return (
    <>
      {/* Main blueprint grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,194,255,${lineAlpha}) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,194,255,${lineAlpha}) 1px, transparent 1px)
          `,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
        }}
      />
      {/* Dot intersections */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(0,194,255,${dotAlpha}) 1.2px, transparent 1.2px)`,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 100%)',
        }}
      />
      {/* Corner crosshair markers */}
      {[
        { top: '14%', left: '6%' },
        { top: '14%', right: '6%' },
        { bottom: '14%', left: '6%' },
        { bottom: '14%', right: '6%' },
      ].map((pos, i) => (
        <div
          key={i}
          className="absolute text-sm font-mono font-bold pointer-events-none select-none animate-drift-particle-1"
          style={{ ...pos, color: crosshairCl, animationDelay: `${i * 2}s` }}
        >
          ⊕
        </div>
      ))}
    </>
  );
}

/** Layer 6: HUD Scan Lines */
function HudScanLines({ isDarkMode }: { isDarkMode: boolean }) {
  const color = isDarkMode ? 'rgba(0,194,255,0.06)' : 'rgba(14,165,233,0.04)';
  return (
    <>
      {/* Repeating subtle horizontal scan lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            ${color} 3px,
            ${color} 4px
          )`,
          opacity: isDarkMode ? 0.6 : 0.4,
        }}
      />
      {/* Sweeping HUD line */}
      <div
        className="absolute left-0 right-0 pointer-events-none animate-laser-sweep"
        style={{
          height: 1,
          background: isDarkMode
            ? `linear-gradient(90deg, transparent 0%, ${CYAN}44 30%, ${CYAN}88 50%, ${CYAN}44 70%, transparent 100%)`
            : `linear-gradient(90deg, transparent 0%, #0EA5E944 30%, #0EA5E966 50%, #0EA5E944 70%, transparent 100%)`,
          top: '30%',
        }}
      />
    </>
  );
}

/** Layer 7: Floating Industrial & Digital Icons */
function FloatingIcons({ isDarkMode }: { isDarkMode: boolean }) {
  const isMobile   = typeof window !== 'undefined' && window.innerWidth < 768;
  const defs       = isMobile ? ICON_DEFS_MOBILE : ICON_DEFS_DESKTOP;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {defs.map((def, i) => {
        const { Icon, x, y, size, duration, delay, rotateSpeed, opacity, blur, color } = def;
        const glowColor = color + (isDarkMode ? '99' : '55');

        return (
          <motion.div
            key={i}
            className="absolute pointer-events-none select-none"
            style={{
              left:   `${x}%`,
              top:    `${y}%`,
              filter: blur > 0 ? `blur(${blur}px)` : undefined,
            }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{
              opacity:   [0, opacity, opacity * 0.7, opacity, 0],
              scale:     [0.8, 1, 1.05, 1, 0.8],
              y:         [0, -18, 4, -12, 0],
              x:         [0, 6, -4, 8, 0],
            }}
            transition={{
              duration,
              delay,
              repeat:     Infinity,
              ease:       'easeInOut',
              times:      [0, 0.25, 0.5, 0.75, 1],
            }}
          >
            {/* Rotation wrapper (only for gear-type icons) */}
            {rotateSpeed > 0 ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: rotateSpeed, repeat: Infinity, ease: 'linear' }}
              >
                <Icon
                  size={size}
                  strokeWidth={1.2}
                  style={{
                    color,
                    filter: `drop-shadow(0 0 ${isDarkMode ? 8 : 4}px ${glowColor})`,
                  }}
                />
              </motion.div>
            ) : (
              <Icon
                size={size}
                strokeWidth={1.2}
                style={{
                  color,
                  filter: `drop-shadow(0 0 ${isDarkMode ? 6 : 3}px ${glowColor})`,
                }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

/** Layer 8: Large Background Gear (pojok kanan bawah) */
function LargeGear({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{
        bottom: '-8%',
        right:  '-6%',
        opacity: isDarkMode ? 0.055 : 0.04,
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
    >
      <Cog
        size={320}
        strokeWidth={0.6}
        style={{ color: isDarkMode ? CYAN : '#0EA5E9' }}
      />
    </motion.div>
  );
}

/** Layer 8b: Second gear (pojok kiri atas, counter-rotate) */
function LargeGearTopLeft({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{
        top:    '-10%',
        left:   '-7%',
        opacity: isDarkMode ? 0.04 : 0.03,
      }}
      animate={{ rotate: -360 }}
      transition={{ duration: 160, repeat: Infinity, ease: 'linear' }}
    >
      <Settings
        size={260}
        strokeWidth={0.6}
        style={{ color: isDarkMode ? BLUE : '#6366F1' }}
      />
    </motion.div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function AnimatedBackground({ isDarkMode = false }: AnimatedBackgroundProps) {
  // Canvas refs
  const particleCanvasRef  = useRef<HTMLCanvasElement>(null);
  const matrixCanvasRef    = useRef<HTMLCanvasElement>(null);
  const gridPulseCanvasRef = useRef<HTMLCanvasElement>(null);
  const spotlightRef       = useRef<HTMLDivElement>(null);

  // Detect prefers-reduced-motion
  const reducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Activate canvas hooks
  useParticleCanvas(particleCanvasRef, isDarkMode, reducedMotion);
  useMatrixCanvas(matrixCanvasRef, isDarkMode, reducedMotion);
  useGridPulseCanvas(gridPulseCanvasRef, isDarkMode, reducedMotion);

  // Cursor spotlight (ref-driven, 0 React re-renders)
  useEffect(() => {
    const isTouch =
      window.matchMedia('(pointer: coarse)').matches ||
      !window.matchMedia('(hover: hover)').matches ||
      'ontouchstart' in window;
    if (isTouch || reducedMotion) return;

    let tx = window.innerWidth  / 2;
    let ty = window.innerHeight / 2;
    let cx = tx, cy = ty;
    let tracking = false;
    let rafId: number;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX; ty = e.clientY;
      if (!tracking) {
        tracking = true;
        if (spotlightRef.current) spotlightRef.current.style.opacity = '1';
      }
    };
    const onLeave = () => {
      tracking = false;
      if (spotlightRef.current) spotlightRef.current.style.opacity = '0';
    };
    const loop = () => {
      if (tracking && spotlightRef.current) {
        cx += (tx - cx) * 0.12;
        cy += (ty - cy) * 0.12;
        spotlightRef.current.style.transform =
          `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      }
      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(rafId);
    };
  }, [reducedMotion]);

  // ── Background color for ambient base
  const baseBg = isDarkMode
    ? 'radial-gradient(ellipse at 50% 0%, #0d1526 0%, #060910 100%)'
    : 'radial-gradient(ellipse at 50% 0%, #dbe6f6 0%, #e8effa 45%, #d5e2f3 100%)';

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden select-none"
      style={{
        zIndex: -1,
        contain: 'strict',
        transform: 'translate3d(0,0,0)',
        willChange: 'transform',
      }}
      aria-hidden="true"
    >
      {/* ── Layer 0: Ambient base backdrop ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: baseBg }}
      />

      {/* ── Layer 1: Aurora Orbs / Glow Blobs ── */}
      <AuroraOrbs isDarkMode={isDarkMode} />

      {/* ── Layer 2: Blueprint Grid ── */}
      <BlueprintGrid isDarkMode={isDarkMode} />

      {/* ── Layer 3: Grid Pulse Lines (Canvas) ── */}
      <canvas
        ref={gridPulseCanvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: isDarkMode ? 1 : 0.7 }}
      />

      {/* ── Layer 4: Particle Network (Canvas, interactive) ── */}
      <canvas
        ref={particleCanvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: isDarkMode ? 0.85 : 0.55 }}
      />

      {/* ── Layer 5: Matrix Rain (Canvas, side columns only) ── */}
      <canvas
        ref={matrixCanvasRef}
        className="absolute inset-0 pointer-events-none"
      />

      {/* ── Layer 6: HUD Scan Lines ── */}
      {!reducedMotion && <HudScanLines isDarkMode={isDarkMode} />}

      {/* ── Layer 7: Floating Industrial & Digital Icons ── */}
      {!reducedMotion && <FloatingIcons isDarkMode={isDarkMode} />}

      {/* ── Layer 8: Large Background Gears ── */}
      {!reducedMotion && <LargeGear isDarkMode={isDarkMode} />}
      {!reducedMotion && <LargeGearTopLeft isDarkMode={isDarkMode} />}

      {/* ── Layer 9: Cursor Spotlight ── */}
      <div
        ref={spotlightRef}
        className="absolute pointer-events-none transition-opacity duration-300 ease-out hidden md:block"
        style={{
          opacity:    0,
          width:      isDarkMode ? '600px' : '550px',
          height:     isDarkMode ? '600px' : '550px',
          left:       0,
          top:        0,
          transform:  'translate3d(-1000px,-1000px,0)',
          background: isDarkMode
            ? 'radial-gradient(circle, rgba(0,194,255,0.13) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(0,194,255,0.08) 0%, transparent 70%)',
          willChange: 'transform, opacity',
        }}
      />

      {/* ── Layer 10: Film Grain / Micro-Noise overlay ── */}
      <div
        className="absolute inset-0 grain-overlay pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}
