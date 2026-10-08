import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code, 
  Folder, 
  Image as ImageIcon, 
  PenTool, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Laptop
} from 'lucide-react';

interface IntroSplashScreenProps {
  onComplete: () => void;
  ownerName?: string;
  avatarUrl?: string;
}

export default function IntroSplashScreen({
  onComplete,
  ownerName = 'Fikri Yandi',
  avatarUrl = '/intro-avatar.jpg'
}: IntroSplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Memuat Ruang Portofolio...');
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Smooth progress counter from 0 to 100%
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Accelerate smoothly
        const increment = prev < 40 ? 3 : prev < 80 ? 4 : 5;
        const next = Math.min(prev + increment, 100);
        return next;
      });
    }, 45);

    return () => clearInterval(interval);
  }, []);

  // Update status text based on progress
  useEffect(() => {
    if (progress < 30) {
      setStatusText('Menyiapkan Sistem & Lingkungan Portofolio...');
    } else if (progress < 65) {
      setStatusText('Memuat Pengalaman, Proyek & Data Keahlian...');
    } else if (progress < 90) {
      setStatusText('Menyinkronkan Antarmuka Digital...');
    } else if (progress < 100) {
      setStatusText('Semua Siap! Membuka Halaman...');
    } else {
      setStatusText('Selamat Datang di Portofolio Fikri Yandi ✨');
      // Trigger exit animation after reaching 100%
      const timer = setTimeout(() => {
        handleTriggerExit();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  const handleTriggerExit = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 600); // Allow exit transition to complete
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          id="intro-splash-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.08,
            filter: 'blur(10px)',
            transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] } 
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden select-none bg-[#040814]"
        >
          {/* Ambient Cyber Light Gradients */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Top Light Bulb */}
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[650px] h-[650px] rounded-full bg-[#00c2ff]/15 blur-[120px]" />
            {/* Bottom Glow */}
            <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[550px] h-[550px] rounded-full bg-[#0051ff]/15 blur-[100px]" />
            {/* Grid Pattern overlay */}
            <div 
              className="absolute inset-0 opacity-[0.04]" 
              style={{ 
                backgroundImage: 'radial-gradient(#00c2ff 1px, transparent 1px)', 
                backgroundSize: '24px 24px' 
              }} 
            />
          </div>

          {/* Top Skip Button */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute top-5 right-5 sm:top-8 sm:right-8 z-50"
          >
            <button
              onClick={handleTriggerExit}
              className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-[#00c2ff]/15 border border-white/10 hover:border-[#00c2ff]/40 text-slate-300 hover:text-white text-xs font-semibold backdrop-blur-md transition-all duration-300 shadow-lg cursor-pointer"
            >
              <span>Lewati Intro</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#00c2ff] group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Central Animated Content */}
          <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6 text-center">
            
            {/* Avatar Emblem Container with Orbiting Rings and 3D Floating Icons */}
            <div className="relative mb-8 flex items-center justify-center">
              
              {/* Outer Pulsing Aura */}
              <motion.div 
                animate={{ 
                  scale: [1, 1.15, 1],
                  opacity: [0.35, 0.65, 0.35]
                }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-gradient-to-tr from-[#00c2ff]/30 via-[#0051ff]/20 to-[#38bdf8]/30 blur-xl"
              />

              {/* Rotating Outer Dashed Cyan Tech Ring */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 16, ease: "linear" }}
                className="absolute w-48 h-48 sm:w-56 sm:h-56 rounded-full border-2 border-dashed border-[#00c2ff]/40"
              />

              {/* Counter-Rotating Inner Glow Ring with Orbit Points */}
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                className="absolute w-44 h-44 sm:w-52 sm:h-52 rounded-full border border-[#38bdf8]/50"
              >
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#00c2ff] shadow-[0_0_10px_#00c2ff]" />
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
              </motion.div>

              {/* Central Mascot / Logo Badge with Zoom & Elastic Entrance */}
              <motion.div
                initial={{ scale: 0.2, opacity: 0, rotate: -15 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 260, 
                  damping: 18,
                  delay: 0.1 
                }}
                className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full p-1 bg-gradient-to-tr from-[#00c2ff] via-[#3b82f6] to-[#00f0ff] shadow-[0_0_35px_rgba(0,194,255,0.45)]"
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 border-2 border-white/20 relative shadow-inner">
                  <img 
                    src={avatarUrl} 
                    alt={ownerName}
                    className="w-full h-full object-cover scale-105"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback to favicon svg if image path isn't reached
                      (e.target as HTMLImageElement).src = '/favicon.svg';
                    }}
                  />
                  {/* Diagonal Light Shimmer Reflection */}
                  <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut", repeatDelay: 1.5 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none"
                  />
                </div>
              </motion.div>

              {/* Floating Orbiting Tech Badges (Matching the Image) */}
              {/* Badge 1: Code Bracket </> */}
              <motion.div 
                animate={{ 
                  y: [-4, 6, -4],
                  rotate: [-4, 4, -4]
                }}
                transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
                className="absolute -right-3 top-2 sm:-right-4 sm:top-4 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-[#00c2ff]/60 flex items-center justify-center text-[#00c2ff] shadow-lg shadow-[#00c2ff]/20 z-20 backdrop-blur-md"
              >
                <Code className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.div>

              {/* Badge 2: Yellow Folder */}
              <motion.div 
                animate={{ 
                  y: [5, -5, 5],
                  rotate: [3, -3, 3]
                }}
                transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut", delay: 0.2 }}
                className="absolute -right-1 bottom-4 sm:right-0 sm:bottom-6 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-300/60 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 z-20"
              >
                <Folder className="w-4 h-4" />
              </motion.div>

              {/* Badge 3: Image / Gallery */}
              <motion.div 
                animate={{ 
                  y: [-6, 4, -6],
                  rotate: [-3, 3, -3]
                }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.4 }}
                className="absolute -left-2 top-4 sm:-left-3 sm:top-6 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 border border-sky-300/60 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 z-20"
              >
                <ImageIcon className="w-4 h-4" />
              </motion.div>

              {/* Badge 4: Pen Tool / Design */}
              <motion.div 
                animate={{ 
                  y: [4, -6, 4],
                  rotate: [4, -4, 4]
                }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.6 }}
                className="absolute -left-3 bottom-3 sm:-left-4 sm:bottom-4 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 border border-orange-300/60 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 z-20"
              >
                <PenTool className="w-3.5 h-3.5" />
              </motion.div>
            </div>

            {/* Typography Intro Title */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="space-y-2 mb-6"
            >
              {/* Category Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00c2ff]/10 border border-[#00c2ff]/30 text-[#00c2ff] text-[11px] font-bold uppercase tracking-widest">
                <Sparkles className="w-3 h-3 text-[#00c2ff] animate-pulse" />
                <span>Portofolio Interaktif</span>
              </div>

              {/* Name Display */}
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                <span className="bg-gradient-to-r from-white via-sky-100 to-[#00c2ff] bg-clip-text text-transparent">
                  {ownerName}
                </span>
              </h1>

              {/* Subtitle / Field */}
              <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-xs mx-auto">
                Industrial Engineering • Web Developer • Digital Automation
              </p>
            </motion.div>

            {/* Progress Bar & Status Text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="w-full max-w-xs space-y-2.5"
            >
              {/* Progress track */}
              <div className="w-full h-2 rounded-full bg-slate-800/80 border border-white/10 overflow-hidden relative p-0.5">
                <motion.div 
                  className="h-full rounded-full bg-gradient-to-r from-[#00c2ff] via-[#38bdf8] to-[#0051ff] shadow-[0_0_12px_#00c2ff]"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut" }}
                />
              </div>

              {/* Percentage & Status detail */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="truncate pr-2 text-slate-300">{statusText}</span>
                <span className="font-bold text-[#00c2ff] shrink-0">{progress}%</span>
              </div>
            </motion.div>
          </div>

          {/* Bottom Modern Watermark / Footer */}
          <div className="absolute bottom-5 text-center text-[10px] text-slate-500 font-medium tracking-wider uppercase">
            Designed for Performance & Innovation
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
