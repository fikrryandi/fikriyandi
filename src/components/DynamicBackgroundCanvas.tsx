import React, { useState, useEffect } from 'react';

interface DynamicBackgroundCanvasProps {
  isDarkMode: boolean;
}

export default function DynamicBackgroundCanvas({ isDarkMode }: DynamicBackgroundCanvasProps) {
  // Cursor spotlight coordinates & visibility
  const [spotlightPos, setSpotlightPos] = useState<{ x: number; y: number } | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Detect touch / coarse pointer devices (smartphones, tablets)
    const checkPointer = () => {
      const isTouch = 
        window.matchMedia('(pointer: coarse)').matches || 
        !window.matchMedia('(hover: hover)').matches ||
        'ontouchstart' in window;
      setIsTouchDevice(isTouch);
    };

    checkPointer();
    window.addEventListener('resize', checkPointer);

    // If strictly touch device, skip mouse tracking listeners
    if (window.matchMedia('(pointer: coarse)').matches) {
      return () => window.removeEventListener('resize', checkPointer);
    }

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isVisible) setIsVisible(true);
    };

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    // Smooth lerp (0.12) for silky organic cursor trailing glow
    const updatePosition = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      setSpotlightPos({ x: Math.round(currentX), y: Math.round(currentY) });
      rafId = requestAnimationFrame(updatePosition);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onMouseLeave);
    rafId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('resize', checkPointer);
      window.removeEventListener('mousemove', onMouseMove);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, [isVisible]);

  return (
    <div 
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 0. Base Ambient Mood Backdrop */}
      <div 
        className="absolute inset-0 transition-colors duration-700 pointer-events-none"
        style={{
          background: isDarkMode 
            ? 'radial-gradient(ellipse at 50% 0%, #0d1522 0%, #070a10 100%)' 
            : 'radial-gradient(ellipse at 50% 0%, #f0f5fc 0%, #e2ecf9 100%)'
        }}
      />

      {/* 1. ANIMATED MESH GRADIENT / AURORA BLOBS (18-30s Loop, GPU Accelerated) */}
      <div 
        className="absolute inset-0 pointer-events-none overflow-hidden" 
        style={{ opacity: 'var(--blob-opacity)' }}
      >
        {/* Blob 1: Cyan / Neon Teal (Top-Left) */}
        <div
          className="aurora-blob-1 absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] max-w-[850px] max-h-[850px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, var(--blob-1) 0%, transparent 70%)',
            filter: 'blur(var(--blob-blur))',
            transform: 'translate3d(0, 0, 0)'
          }}
        />

        {/* Blob 2: Vibrant Blue / Cobalt (Top-Right) */}
        <div
          className="aurora-blob-2 absolute top-[8%] -right-[15%] w-[50vw] h-[50vw] max-w-[780px] max-h-[780px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, var(--blob-2) 0%, transparent 70%)',
            filter: 'blur(var(--blob-blur))',
            transform: 'translate3d(0, 0, 0)'
          }}
        />

        {/* Blob 3: Soft Purple / Lavender (Bottom-Left) */}
        <div
          className="aurora-blob-3 absolute bottom-[2%] -left-[12%] w-[50vw] h-[50vw] max-w-[750px] max-h-[750px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, var(--blob-3) 0%, transparent 70%)',
            filter: 'blur(var(--blob-blur))',
            transform: 'translate3d(0, 0, 0)'
          }}
        />

        {/* Blob 4: Soft Teal / Aquamarine (Bottom-Right) - Hidden on extra small mobile screens for performance */}
        <div
          className="aurora-blob-4 absolute -bottom-[12%] right-[8%] w-[45vw] h-[45vw] max-w-[700px] max-h-[700px] rounded-full pointer-events-none hidden sm:block"
          style={{
            background: 'radial-gradient(circle, var(--blob-4) 0%, transparent 70%)',
            filter: 'blur(var(--blob-blur))',
            transform: 'translate3d(0, 0, 0)'
          }}
        />
      </div>

      {/* 2. TECHNICAL BLUEPRINT / DOT GRID (Radial mask fades smoothly to edges) */}
      <div 
        className="absolute inset-0 engineering-grid pointer-events-none" 
        aria-hidden="true" 
      />

      {/* 3. CURSOR SPOTLIGHT (Soft radial light tracking mouse, disabled on touch/mobile) */}
      {!isTouchDevice && spotlightPos && (
        <div
          className="absolute pointer-events-none transition-opacity duration-500 ease-out"
          style={{
            opacity: isVisible ? 'var(--spotlight-opacity)' : 0,
            width: 'var(--spotlight-size)',
            height: 'var(--spotlight-size)',
            left: 0,
            top: 0,
            transform: `translate3d(${spotlightPos.x}px, ${spotlightPos.y}px, 0) translate(-50%, -50%)`,
            background: 'radial-gradient(circle, var(--spotlight-color) 0%, transparent 70%)',
            willChange: 'transform, opacity'
          }}
        />
      )}

      {/* 4. FILM GRAIN / MICRO-NOISE OVERLAY (3-5% Opacity, removes banding on gradients) */}
      <div 
        className="absolute inset-0 grain-overlay pointer-events-none" 
        aria-hidden="true" 
      />
    </div>
  );
}
