import React, { useState, useEffect, useRef } from 'react';
import { Certificate } from '../types';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Award
} from 'lucide-react';

interface CertificateCoverFlowProps {
  certificates: Certificate[];
  isDarkMode: boolean;
  onSelectCertImage: (image: string, title: string) => void;
  selectedLang?: 'ID' | 'EN';
  dynamicShineDelay?: string;
}

export default function CertificateCoverFlow({
  certificates = [],
  isDarkMode,
  onSelectCertImage,
  selectedLang = 'ID',
  dynamicShineDelay = '0s'
}: CertificateCoverFlowProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Responsive breakpoint tracking
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard navigation when hovered/focused
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [certificates.length]);

  if (certificates.length === 0) {
    return (
      <div className={`p-10 text-center rounded-2xl border ${
        isDarkMode ? 'bg-[#0f141e]/50 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <Award className="w-10 h-10 text-slate-400 mx-auto opacity-50 mb-2" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {selectedLang === 'ID' ? 'Belum ada Sertifikat' : 'No Certificates Available'}
        </p>
      </div>
    );
  }

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : certificates.length - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev < certificates.length - 1 ? prev + 1 : 0));
  };

  // Touch Swipe for mobile gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (diff > 45) {
      handlePrev();
    } else if (diff < -45) {
      handleNext();
    }
    setTouchStartX(null);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-6xl mx-auto flex flex-col items-center select-none py-2 overflow-hidden sm:overflow-visible"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 3D Cover Flow Carousel Stage */}
      <div 
        className="relative w-full h-[280px] sm:h-[380px] md:h-[450px] lg:h-[480px] flex items-center justify-center overflow-visible"
        style={{ perspective: 1200 }}
      >
        {/* Subtle Ambient Radial Glow behind the Active Certificate */}
        <div 
          className="absolute w-[340px] sm:w-[500px] md:w-[650px] h-[240px] sm:h-[340px] md:h-[400px] rounded-full blur-3xl pointer-events-none -z-10"
          style={{
            background: isDarkMode 
              ? 'radial-gradient(circle, rgba(0, 194, 255, 0.22) 0%, rgba(139, 92, 246, 0.1) 50%, transparent 70%)' 
              : 'radial-gradient(circle, rgba(0, 194, 255, 0.16) 0%, rgba(59, 130, 246, 0.08) 50%, transparent 70%)'
          }}
        />

        {/* Carousel Stack of Certificates */}
        <div 
          className="relative w-full h-full flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {certificates.map((cert, index) => {
            // Circular offset calculation so side cards seamlessly exist on both sides
            let offset = index - activeIndex;
            if (certificates.length > 2) {
              const half = Math.floor(certificates.length / 2);
              while (offset > half) offset -= certificates.length;
              while (offset < -half) offset += certificates.length;
            }

            const absOffset = Math.abs(offset);
            const isActive = offset === 0;

            // Spacing & positioning for a clean, visible 3D coverflow
            let xOffset = 0;
            if (offset !== 0) {
              const direction = offset > 0 ? 1 : -1;
              if (isMobile) {
                // Mobile spacing: card width is ~260px, so 150px offset lets the side card peek out prominently
                xOffset = direction * (150 + (absOffset - 1) * 40);
              } else {
                // Desktop spacing: card width is ~500px, 300px offset lets a huge part of the side certificate peek out
                xOffset = direction * (290 + (absOffset - 1) * 80);
              }
            }

            const scale = isActive ? 1 : Math.max(0.72, 0.85 - (absOffset - 1) * 0.08);
            // Gentle perspective rotation so side cards look 3D without severe distortion
            const rotateY = isActive ? 0 : offset > 0 ? -18 : 18;
            const zPos = isActive ? 60 : -50 - absOffset * 40;
            const zIndex = 50 - absOffset * 8;
            // Visible cards within 2 steps on either side
            const isVisible = absOffset <= 2;
            const opacity = !isVisible ? 0 : isActive ? 1 : Math.max(0.45, 0.8 - (absOffset - 1) * 0.25);
            const isClickableSide = !isActive && isVisible;

            return (
              <motion.div
                key={cert.id || index}
                animate={{
                  x: xOffset,
                  scale,
                  rotateY,
                  z: zPos,
                  opacity
                }}
                transition={{
                  duration: 0.38,
                  ease: [0.22, 1, 0.36, 1] // Silky smooth deceleration curve: zero vibration, zero lag
                }}
                onClick={() => {
                  if (isActive) {
                    onSelectCertImage(cert.image, cert.title);
                  } else {
                    setActiveIndex(index);
                  }
                }}
                style={{
                  position: 'absolute',
                  zIndex,
                  transformStyle: 'preserve-3d',
                  transformOrigin: 'center center',
                  willChange: 'transform, opacity',
                  backfaceVisibility: 'hidden'
                }}
                className={`w-[260px] sm:w-[400px] md:w-[480px] lg:w-[520px] flex items-center justify-center bg-transparent border-0 outline-none select-none ${
                  isActive ? 'cursor-zoom-in' : isClickableSide ? 'cursor-pointer' : 'pointer-events-none'
                }`}
                role="button"
                tabIndex={isActive || isClickableSide ? 0 : -1}
                aria-label={`Sertifikat: ${cert.title}`}
              >
                {/* Pure Certificate Image Floating in 3D Space (No box frame, no background container) */}
                <div className="relative group/cert select-none flex items-center justify-center max-w-full">
                  <img
                    src={cert.image}
                    alt={cert.title}
                    draggable={false}
                    className={`max-w-full max-h-[250px] sm:max-h-[340px] md:max-h-[380px] w-auto h-auto object-contain rounded-xl sm:rounded-2xl transition-all duration-300 ${
                      isActive 
                        ? isDarkMode
                          ? 'shadow-[0_20px_50px_rgba(0,194,255,0.25)] ring-1 ring-[#00c2ff]/40 hover:scale-[1.02]' 
                          : 'shadow-[0_20px_45px_rgba(0,0,0,0.2)] ring-1 ring-slate-300/80 hover:scale-[1.02]'
                        : isDarkMode
                          ? 'shadow-[0_12px_32px_rgba(0,0,0,0.5)] hover:brightness-110'
                          : 'shadow-[0_10px_28px_rgba(0,0,0,0.15)] hover:brightness-105'
                    }`}
                    referrerPolicy="no-referrer"
                    loading="eager"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Floating Glassmorphic Navigation Arrows on Left and Right Sides */}
        <button
          type="button"
          onClick={handlePrev}
          className={`absolute left-2 sm:left-4 z-45 w-10 h-10 sm:w-12 sm:h-12 rounded-full border flex items-center justify-center shadow-xl backdrop-blur-md transition-all active:scale-90 cursor-pointer ${
            isDarkMode 
              ? 'bg-[#0f141e]/85 border-[#00c2ff]/30 text-white hover:bg-[#00c2ff] hover:text-slate-950 hover:border-[#00c2ff]' 
              : 'bg-white/90 border-slate-200 text-slate-800 hover:bg-[#00c2ff] hover:text-white hover:border-[#00c2ff]'
          }`}
          title={selectedLang === 'ID' ? 'Sertifikat Sebelumnya' : 'Previous Certificate'}
          aria-label="Previous Certificate"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          className={`absolute right-2 sm:right-4 z-45 w-10 h-10 sm:w-12 sm:h-12 rounded-full border flex items-center justify-center shadow-xl backdrop-blur-md transition-all active:scale-90 cursor-pointer ${
            isDarkMode 
              ? 'bg-[#0f141e]/85 border-[#00c2ff]/30 text-white hover:bg-[#00c2ff] hover:text-slate-950 hover:border-[#00c2ff]' 
              : 'bg-white/90 border-slate-200 text-slate-800 hover:bg-[#00c2ff] hover:text-white hover:border-[#00c2ff]'
          }`}
          title={selectedLang === 'ID' ? 'Sertifikat Berikutnya' : 'Next Certificate'}
          aria-label="Next Certificate"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Navigation Indicators Below the Coverflow */}
      <div className="w-full max-w-xl mx-auto mt-6 text-center">
        {/* Counter and Dot Navigation Indicators */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
          {/* Certificate Index Pill */}
          <div className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
            isDarkMode 
              ? 'bg-[#0d141e] border-slate-800 text-slate-400' 
              : 'bg-slate-100 border-slate-200 text-slate-600'
          }`}>
            <span className="text-[#00c2ff] font-extrabold">{String(activeIndex + 1).padStart(2, '0')}</span>
            <span className="mx-1">/</span>
            <span>{String(certificates.length).padStart(2, '0')}</span>
            <span className="ml-1.5 text-[10px] uppercase font-sans font-bold">
              {selectedLang === 'ID' ? 'Sertifikat' : 'Certificates'}
            </span>
          </div>

          {/* Interactive Navigation Dots */}
          <div className="flex items-center gap-2">
            {certificates.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setActiveIndex(dotIdx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  dotIdx === activeIndex
                    ? 'w-7 h-2.5 bg-[#00c2ff] shadow-sm shadow-sky-500/50'
                    : isDarkMode
                      ? 'w-2.5 h-2.5 bg-slate-700 hover:bg-slate-500'
                      : 'w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400'
                }`}
                title={`Pilih Sertifikat ${dotIdx + 1}`}
                aria-label={`Slide ${dotIdx + 1}`}
              />
            ))}
          </div>

          {/* Instruction Tooltip */}
          <span className={`text-[10px] font-semibold hidden sm:inline ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>
            {selectedLang === 'ID' ? '💡 Klik foto untuk Zoom HD' : '💡 Click photo to Zoom HD'}
          </span>
        </div>
      </div>
    </div>
  );
}
