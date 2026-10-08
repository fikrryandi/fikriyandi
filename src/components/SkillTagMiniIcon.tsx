import React from 'react';
import { Skill } from '../types';
import { 
  Code, 
  Database, 
  Cpu, 
  Globe, 
  Terminal, 
  Server, 
  Factory, 
  Cog, 
  Wrench, 
  Smartphone, 
  Palette, 
  Shield, 
  Atom, 
  Tag 
} from 'lucide-react';

interface SkillTagMiniIconProps {
  skill?: Skill | null;
  tagName: string;
  className?: string;
  isLarge?: boolean;
}

export default function SkillTagMiniIcon({
  skill,
  tagName,
  className = '',
  isLarge = false
}: SkillTagMiniIconProps) {
  const sizeClasses = isLarge ? 'w-4.5 h-4.5' : 'w-3.5 h-3.5';
  const iconStr = skill?.icon || '';
  const titleStr = (skill?.title || tagName || '').trim();
  const titleLower = titleStr.toLowerCase();
  const iconLower = iconStr.toLowerCase();

  // 1. Check if the icon is a custom uploaded image URL (base64 data:, /uploads/..., or http/https)
  // Transparent rendering without any background box
  if (iconStr && (iconStr.startsWith('/') || iconStr.startsWith('data:') || iconStr.startsWith('http://') || iconStr.startsWith('https://'))) {
    return (
      <img 
        src={iconStr} 
        alt={titleStr} 
        className={`${sizeClasses} object-contain shrink-0 bg-transparent ${className}`}
        referrerPolicy="no-referrer"
      />
    );
  }

  // 2. Microsoft Word (Transparent icon without opaque background tile)
  if (titleLower.includes('word') || iconLower === 'doc' || iconLower === 'word') {
    return (
      <svg viewBox="0 0 48 48" className={`${sizeClasses} shrink-0 bg-transparent ${className}`} fill="none">
        <path d="M4 10a4 4 0 0 1 4-4h32a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V10z" fill="#185abd" fillOpacity="0.15" stroke="#185abd" strokeWidth="2.5" />
        <path d="M12 15h6.5l4 13.5 4-13.5H33v18h-4.5v-11.5L24.5 31h-3L17.5 19.5V33H12V15z" fill="#185abd" />
      </svg>
    );
  }

  // 3. Microsoft Excel (Transparent icon without opaque background tile)
  if (titleLower.includes('excel') || iconLower === 'sheet' || iconLower === 'excel') {
    return (
      <svg viewBox="0 0 48 48" className={`${sizeClasses} shrink-0 bg-transparent ${className}`} fill="none">
        <path d="M4 10a4 4 0 0 1 4-4h32a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V10z" fill="#107c41" fillOpacity="0.15" stroke="#107c41" strokeWidth="2.5" />
        <path d="M14 15h6l4.5 7 4.5-7h6l-7.5 9.5 8 9.5h-6L24 26l-5.5 8H13l7.5-9.5L14 15z" fill="#107c41" />
      </svg>
    );
  }

  // 4. Microsoft PowerPoint (Transparent icon without opaque background tile)
  if (titleLower.includes('powerpoint') || titleLower.includes('ppt') || iconLower === 'slide' || iconLower === 'powerpoint') {
    return (
      <svg viewBox="0 0 48 48" className={`${sizeClasses} shrink-0 bg-transparent ${className}`} fill="none">
        <path d="M4 10a4 4 0 0 1 4-4h32a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V10z" fill="#c43e1c" fillOpacity="0.15" stroke="#c43e1c" strokeWidth="2.5" />
        <path d="M15 15h8c4.5 0 7.5 2.5 7.5 6.5s-3 6.5-7.5 6.5h-4v6h-4V15zm4 9h4c2.2 0 3.5-1 3.5-2.5s-1.3-2.5-3.5-2.5h-4v5z" fill="#c43e1c" />
      </svg>
    );
  }

  // 5. Canva (Authentic gradient C on transparent background)
  if (titleLower.includes('canva') || iconLower === 'design' || iconLower === 'canva') {
    return (
      <svg viewBox="0 0 48 48" className={`${sizeClasses} shrink-0 bg-transparent ${className}`} fill="none">
        <defs>
          <linearGradient id="canva-tag-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00c4cc" />
            <stop offset="100%" stopColor="#7d2ae8" />
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r="21" stroke="url(#canva-tag-grad)" strokeWidth="3" fill="none" />
        <path d="M29 17c-2-2-5.5-3-9-3-6.5 0-11 4.5-11 11s4.5 11 11 11c4 0 7-1.5 9-3.5l-2.5-3c-1.8 1.5-4 2.2-6.5 2.2-4 0-7-2.8-7-6.7s3-6.7 7-6.7c2.5 0 4.8.8 6.5 2.2L29 17z" fill="url(#canva-tag-grad)" />
      </svg>
    );
  }

  // 6. React / React Native
  if (titleLower.includes('react')) {
    return (
      <svg viewBox="-11.5 -10.23174 23 20.46348" className={`${sizeClasses} shrink-0 bg-transparent ${className}`}>
        <circle cx="0" cy="0" r="2.05" fill="#61dafb" />
        <g stroke="#61dafb" strokeWidth="1.2" fill="none">
          <ellipse rx="11" ry="4.2" />
          <ellipse rx="11" ry="4.2" transform="rotate(60)" />
          <ellipse rx="11" ry="4.2" transform="rotate(120)" />
        </g>
      </svg>
    );
  }

  // 7. Tailwind CSS
  if (titleLower.includes('tailwind')) {
    return (
      <svg viewBox="0 0 24 24" className={`${sizeClasses} shrink-0 bg-transparent ${className}`} fill="none">
        <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 14.881 12 18 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 15.121 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.393 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 9.121 12 6.001 12z" fill="#38bdf8"/>
      </svg>
    );
  }

  // 8. Next.js
  if (titleLower.includes('next.js') || titleLower.includes('nextjs')) {
    return (
      <svg viewBox="0 0 128 128" className={`${sizeClasses} shrink-0 bg-transparent ${className}`} fill="none">
        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="6" opacity="0.3" />
        <path d="M101.3 103.5 54.6 44.2H44.1v39.7h8.7V55h.3l41 51.7c2.6-2.5 4.9-5.2 6.9-8.2z" fill="currentColor" />
        <rect x="75" y="44.2" width="8.7" height="39.7" fill="currentColor" />
      </svg>
    );
  }

  // 9. TypeScript
  if (titleLower.includes('typescript') || titleLower === 'ts') {
    return (
      <svg viewBox="0 0 128 128" className={`${sizeClasses} shrink-0 bg-transparent ${className}`}>
        <path d="M12 24a12 12 0 0 1 12-12h80a12 12 0 0 1 12 12v80a12 12 0 0 1-12 12H24a12 12 0 0 1-12-12V24z" fill="#3178c6" fillOpacity="0.18" stroke="#3178c6" strokeWidth="6" />
        <text x="64" y="82" fill="#3178c6" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="52" textAnchor="middle">TS</text>
      </svg>
    );
  }

  // 10. ASP.NET / .NET
  if (titleLower.includes('.net') || titleLower.includes('asp.net')) {
    return (
      <svg viewBox="0 0 128 128" className={`${sizeClasses} shrink-0 bg-transparent ${className}`}>
        <circle cx="64" cy="64" r="54" fill="#512bd4" fillOpacity="0.18" stroke="#512bd4" strokeWidth="6" />
        <text x="64" y="78" fill="#512bd4" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="38" textAnchor="middle">.NET</text>
      </svg>
    );
  }

  // 11. SQL Server / SQL
  if (titleLower.includes('sql server') || titleLower === 'sql') {
    return (
      <svg viewBox="0 0 100 100" className={`${sizeClasses} shrink-0 bg-transparent ${className}`}>
        <ellipse cx="50" cy="25" rx="30" ry="12" fill="#e23528" fillOpacity="0.2" stroke="#e23528" strokeWidth="4" />
        <path d="M20 25v50c0 6.6 13.4 12 30 12s30-5.4 30-12V25" stroke="#e23528" strokeWidth="4" fill="none" />
        <path d="M20 50c0 6.6 13.4 12 30 12s30-5.4 30-12" stroke="#e23528" strokeWidth="3" fill="none" />
      </svg>
    );
  }

  // 12. PHP
  if (titleLower.includes('php') || iconLower === 'php') {
    return (
      <svg viewBox="0 0 128 128" className={`${sizeClasses} shrink-0 bg-transparent ${className}`}>
        <ellipse cx="64" cy="64" rx="55" ry="33" fill="#777bb4" fillOpacity="0.2" stroke="#777bb4" strokeWidth="5" />
        <text x="64" y="76" fill="#777bb4" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="34" letterSpacing="-1" textAnchor="middle">php</text>
      </svg>
    );
  }

  // 13. MySQL
  if (titleLower.includes('mysql') || iconLower === 'mysql') {
    return (
      <svg viewBox="0 0 128 128" className={`${sizeClasses} shrink-0 bg-transparent ${className}`} fill="none">
        <path d="M84.4 44.5c-.8-1.5-2.2-2.7-3.8-3.4-3.6-1.5-7.9-.5-11 2-1.5 1.2-2.7 2.8-3.4 4.6-.5 1.1-.7 2.3-.6 3.5.2 1.9.9 3.7 1.9 5.3 1.1 1.7 2.6 3.1 4.4 4 1.8.9 3.8 1.2 5.8 1 1.7-.2 3.4-.9 4.7-2 1.2-1 2.2-2.3 2.7-3.7 1-2.9.2-6.1-1.7-8.6c-.2-.2-.5-.3-.7-.1s-.2.5 0 .7c1.6 2.1 2.3 4.9 1.5 7.4-.5 1.2-1.3 2.3-2.3 3.1-1.1.9-2.5 1.5-3.9 1.6-1.7.2-3.4-.1-4.9-.9-1.5-.8-2.7-2-3.6-3.4-.9-1.4-1.5-2.9-1.6-4.5-.1-1 .1-2 .5-2.9.6-1.5 1.6-2.9 2.9-3.9 2.7-2.1 6.3-2.9 9.4-1.6 1.4.6 2.6 1.6 3.3 2.9.2.3.5.4.7.2.2-.2.2-.5 0-.7z" fill="#00758f" />
        <path d="M60.1 52.4c-1.5-1.5-3.6-2.4-5.8-2.5-3.9-.1-7.7 2.1-9.4 5.6-.9 1.7-1.1 3.7-.7 5.6.8 3.5 3.3 6.4 6.7 7.7 1.7.7 3.6.9 5.4.5 3.5-.8 6.4-3.3 7.7-6.7.7-1.7.9-3.6.5-5.4-.3-1.8-1.1-3.4-2.3-4.8-.2-.3-.5-.3-.7 0s-.2.5 0 .7c1.1 1.2 1.8 2.7 2 4.3.3 1.5.1 3.1-.5 4.5-1.1 2.9-3.5 5.1-6.5 5.7-1.5.3-3.1.2-4.5-.4-2.9-1.1-5.1-3.5-5.7-6.5-.3-1.5-.1-3.1.5-4.5 1.4-2.9 4.6-4.7 7.8-4.6 1.9 0 3.7.8 5 2.1.2.2.5.2.7 0s.2-.5 0-.7z" fill="#f29111" />
      </svg>
    );
  }

  // 14. JavaScript / JS
  if (titleLower.includes('javascript') || titleLower === 'js' || iconLower === 'javascript' || iconLower === 'js') {
    return (
      <svg viewBox="0 0 128 128" className={`${sizeClasses} shrink-0 bg-transparent ${className}`}>
        <path d="M12 24a12 12 0 0 1 12-12h80a12 12 0 0 1 12 12v80a12 12 0 0 1-12 12H24a12 12 0 0 1-12-12V24z" fill="#f7df1e" fillOpacity="0.2" stroke="#f7df1e" strokeWidth="6" />
        <text x="64" y="82" fill="#f7df1e" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="52" textAnchor="middle">JS</text>
      </svg>
    );
  }

  // 15. Vite / Vite.js
  if (titleLower.includes('vite') || iconLower === 'vite') {
    return (
      <svg viewBox="0 0 128 128" className={`${sizeClasses} shrink-0 bg-transparent ${className}`} fill="none">
        <defs>
          <linearGradient id="vite-grad-mini-1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#41d1ff" />
            <stop offset="100%" stopColor="#bd34fe" />
          </linearGradient>
          <linearGradient id="vite-grad-mini-2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffea83" />
            <stop offset="100%" stopColor="#ffdd35" />
          </linearGradient>
        </defs>
        <path d="M117 20L66 112a3 3 0 0 1-5.2 0L11 20a3 3 0 0 1 3.5-4.4l49 13.5 49-13.5a3 3 0 0 1 4.5 4.4z" fill="url(#vite-grad-mini-1)" />
        <path d="M72 16l-34 40h24l-8 36 34-44H64l8-32z" fill="url(#vite-grad-mini-2)" />
      </svg>
    );
  }

  // 16. HTML / HTML5
  if (titleLower.includes('html')) {
    return (
      <svg viewBox="0 0 128 128" className={`${sizeClasses} shrink-0 bg-transparent ${className}`} fill="none">
        <path d="M19 116L9 4h110l-10 112-45 12z" fill="#e44d26" />
        <path d="M64 117l36-10 8-91H64v101z" fill="#f16529" />
        <path d="M64 54h19l-1 15H64v15h16l-2 22-14 4v15l29-8 4-48H64V54zM64 26v15h36l1-15H64z" fill="#fff" />
      </svg>
    );
  }

  // 17. CSS / CSS3
  if (titleLower.includes('css') && !titleLower.includes('tailwind')) {
    return (
      <svg viewBox="0 0 128 128" className={`${sizeClasses} shrink-0 bg-transparent ${className}`} fill="none">
        <path d="M19 116L9 4h110l-10 112-45 12z" fill="#1572b6" />
        <path d="M64 117l36-10 8-91H64v101z" fill="#33a9dc" />
        <path d="M64 54h19l-1 15H64v15h16l-2 22-14 4v15l29-8 4-48H64V54zM64 26v15h36l1-15H64z" fill="#fff" />
      </svg>
    );
  }

  // 18. Python
  if (titleLower.includes('python')) {
    return (
      <svg viewBox="0 0 128 128" className={`${sizeClasses} shrink-0 bg-transparent ${className}`}>
        <path d="M63 9C41 9 42 18 42 18l.03 9.77H64v3.13H28.72S16 29.5 16 51.5c0 22 11 21.2 11 21.2h6.5v-9.5s-.35-11.27 11.13-11.27h19.24s10.63.17 10.63-10.36V20.15S79.5 9 63 9zm-11.5 6.75a3.75 3.75 0 1 1 0 7.5 3.75 3.75 0 0 1 0-7.5z" fill="#387eb8" />
        <path d="M65 119c22 0 21-9 21-9l-.03-9.77H64v-3.13h35.28s12.72 1.4 12.72-20.6c0-22-11-21.2-11-21.2h-6.5v9.5s.35 11.27-11.13 11.27H65.13s-10.63-.17-10.63 10.36v21.42S48.5 119 65 119zm11.5-6.75a3.75 3.75 0 1 1 0-7.5 3.75 3.75 0 0 1 0 7.5z" fill="#ffe052" />
      </svg>
    );
  }

  // 19. Node.js
  if (titleLower.includes('node')) {
    return (
      <svg viewBox="0 0 100 100" className={`${sizeClasses} shrink-0 bg-transparent ${className}`}>
        <polygon points="50,10 85,30 85,70 50,90 15,70 15,30" fill="#339933" />
        <text x="50" y="58" fill="#fff" fontFamily="system-ui, sans-serif" fontWeight="bold" fontSize="24" textAnchor="middle">JS</text>
      </svg>
    );
  }

  // 20. PostgreSQL
  if (titleLower.includes('postgres')) {
    return (
      <svg viewBox="0 0 100 100" className={`${sizeClasses} shrink-0 bg-transparent ${className}`}>
        <circle cx="50" cy="50" r="46" fill="#336791" fillOpacity="0.2" stroke="#336791" strokeWidth="5" />
        <path d="M50 20c-15 0-25 10-25 25 0 12 8 22 20 24l5-10c-5-2-10-7-10-14 0-8 6-15 15-15s15 7 15 15c0 7-5 12-10 14l5 10c12-2 20-12 20-24 0-15-10-25-25-25z" fill="#336791" />
      </svg>
    );
  }

  // 21. Laravel
  if (titleLower.includes('laravel')) {
    return (
      <svg viewBox="0 0 100 100" className={`${sizeClasses} shrink-0 bg-transparent ${className}`} fill="none">
        <path d="M83.2 25.1L51.6 6.8c-1-.6-2.3-.6-3.3 0L16.8 25.1c-1 .6-1.6 1.7-1.6 2.9v36.6c0 1.2.6 2.3 1.6 2.9l31.6 18.3c1 .6 2.3.6 3.3 0l31.6-18.3c1-.6 1.6-1.7 1.6-2.9V28c-.1-1.2-.7-2.3-1.7-2.9z" stroke="#f55240" strokeWidth="6" strokeLinejoin="round" />
      </svg>
    );
  }

  // 22. Figma
  if (titleLower.includes('figma')) {
    return (
      <svg viewBox="0 0 120 120" className={`${sizeClasses} shrink-0 bg-transparent ${className}`}>
        <path d="M38 22h22v22H38z" fill="#f24e1e" />
        <path d="M60 22h22c6.6 0 12 5.4 12 12s-5.4 12-12 12H60z" fill="#ff7262" />
        <path d="M60 44H38v22h22z" fill="#a259ff" />
        <path d="M60 44h22c6.6 0 12 5.4 12 12s-5.4 12-12 12H60z" fill="#1abc9c" />
        <path d="M60 88c-6.6 0-12-5.4-12-12s5.4-12 12-12s12 5.4 12 12s-5.4 12-12 12zm-22-22h22v22c0 6.6-5.4 12-12 12s-8-5.4-8-12z" fill="#0acf83" />
      </svg>
    );
  }

  // 23. Git / GitHub
  if (titleLower.includes('git')) {
    return (
      <svg viewBox="0 0 128 128" className={`${sizeClasses} shrink-0 bg-transparent ${className}`}>
        <path d="M124.9 59.9 68.1 3.1c-4-4-10.4-4-14.4 0L3.1 53.7c-4 4-4 10.4 0 14.4l56.8 56.8c4 4 10.4 4 14.4 0l50.6-50.6c4-3.9 4-10.4 0-14.4z" fill="#f05032" />
      </svg>
    );
  }

  // 24. Preset icon string keys (All transparent background)
  switch (iconLower) {
    case 'database':
      return <Database className={`${sizeClasses} text-blue-400 shrink-0 bg-transparent ${className}`} />;
    case 'cpu':
      return <Cpu className={`${sizeClasses} text-amber-400 shrink-0 bg-transparent ${className}`} />;
    case 'cloud':
      return <Globe className={`${sizeClasses} text-emerald-400 shrink-0 bg-transparent ${className}`} />;
    case 'terminal':
      return <Terminal className={`${sizeClasses} text-sky-400 shrink-0 bg-transparent ${className}`} />;
    case 'server':
      return <Server className={`${sizeClasses} text-indigo-400 shrink-0 bg-transparent ${className}`} />;
    case 'factory':
      return <Factory className={`${sizeClasses} text-amber-500 shrink-0 bg-transparent ${className}`} />;
    case 'cog':
      return <Cog className={`${sizeClasses} text-blue-400 shrink-0 bg-transparent ${className}`} />;
    case 'wrench':
      return <Wrench className={`${sizeClasses} text-slate-400 shrink-0 bg-transparent ${className}`} />;
    case 'smartphone':
      return <Smartphone className={`${sizeClasses} text-pink-400 shrink-0 bg-transparent ${className}`} />;
    case 'palette':
      return <Palette className={`${sizeClasses} text-rose-400 shrink-0 bg-transparent ${className}`} />;
    case 'shield':
      return <Shield className={`${sizeClasses} text-red-400 shrink-0 bg-transparent ${className}`} />;
    case 'atom':
      return <Atom className={`${sizeClasses} text-cyan-400 shrink-0 bg-transparent ${className}`} />;
    case 'code':
      return <Code className={`${sizeClasses} text-purple-400 shrink-0 bg-transparent ${className}`} />;
    default:
      return <Tag className={`${sizeClasses} text-[#00c2ff] shrink-0 bg-transparent ${className}`} />;
  }
}
