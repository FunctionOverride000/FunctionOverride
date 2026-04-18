'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AlertOctagon, CheckCircle, X } from 'lucide-react';
import Image from 'next/image';

export const CustomCursor = () => {
  const cursorRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let rafId;
    const moveCursor = (e) => {
      cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
    };

    const handleHover = (e) => {
      const isInteractive = e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('.interactive');
      if (isInteractive) {
        cursor.classList.add('bg-cyan-400');
        cursor.style.width = '48px';
        cursor.style.height = '48px';
      } else {
        cursor.classList.remove('bg-cyan-400');
        cursor.style.width = '32px';
        cursor.style.height = '32px';
      }
    };

    window.addEventListener('mousemove', moveCursor, { passive: true });
    window.addEventListener('mouseover', handleHover, { passive: true });

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleHover);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div ref={cursorRef} className="custom-cursor flex items-center justify-center pointer-events-none will-change-transform">
      <div className="absolute w-full h-[1px] bg-cyan-400 opacity-50"></div>
      <div className="absolute h-full w-[1px] bg-cyan-400 opacity-50"></div>
      <div className="w-2 h-2 border border-cyan-400 rounded-full"></div>
    </div>
  );
};

export const ScrollReveal = ({ children, className = "" }) => {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
};

// --- Generate glitch slice blocks ---
const generateBlocks = () => {
  const blocks = [];
  const count = 6 + Math.floor(Math.random() * 8);
  for (let i = 0; i < count; i++) {
    const h = 3 + Math.random() * 16;
    const top = Math.random() * (100 - h);
    const tx = (Math.random() - 0.5) * 36;
    blocks.push({ top: `${top}%`, height: `${h}%`, tx });
  }
  return blocks;
};

export const FennecLogo = () => {
  const [phase, setPhase] = useState('glitch');
  const [blocks, setBlocks] = useState([]);
  const [mainStyle, setMainStyle] = useState({});
  const [redStyle, setRedStyle] = useState({});
  const [cyanStyle, setCyanStyle] = useState({});
  const [mainOpacity, setMainOpacity] = useState(1);

  useEffect(() => {
    let frame = 0;
    const totalFrames = 22;
    let timeout;

    const runFrame = () => {
      if (frame >= totalFrames) {
        setBlocks([]);
        setMainStyle({});
        setRedStyle({});
        setCyanStyle({});
        setMainOpacity(1);
        setPhase('normal');
        return;
      }

      const r = Math.random();

      // Slice blocks
      if (Math.random() > 0.3) setBlocks(generateBlocks());
      else setBlocks([]);

      // Main logo style
      if (r < 0.25) {
        const tx = (Math.random() - 0.5) * 16;
        const ty = (Math.random() - 0.5) * 10;
        const top = Math.random() * 75;
        const h = 8 + Math.random() * 30;
        setMainStyle({
          transform: `translate(${tx}px, ${ty}px)`,
          clipPath: `inset(${top}% 0 ${100 - top - h}% 0)`,
          filter: `brightness(${1.3 + Math.random()}) contrast(2)`,
        });
        setMainOpacity(0.9 + Math.random() * 0.1);
      } else if (r < 0.45) {
        setMainStyle({
          transform: `scaleX(${0.97 + Math.random() * 0.06})`,
          filter: `brightness(${2 + Math.random() * 2}) saturate(0)`,
        });
        setMainOpacity(Math.random() > 0.4 ? 1 : 0.1);
      } else if (r < 0.65) {
        setMainStyle({
          transform: `skewX(${(Math.random() - 0.5) * 10}deg) translateX(${(Math.random() - 0.5) * 18}px)`,
          filter: `hue-rotate(${Math.random() * 360}deg) saturate(3) contrast(1.5)`,
        });
        setMainOpacity(0.75 + Math.random() * 0.25);
      } else if (r < 0.8) {
        const split = 20 + Math.random() * 55;
        setMainStyle({
          clipPath: Math.random() > 0.5 ? `inset(0 0 ${split}% 0)` : `inset(${split}% 0 0 0)`,
          transform: `translateX(${(Math.random() - 0.5) * 22}px)`,
          filter: `brightness(1.5)`,
        });
        setMainOpacity(1);
      } else {
        setMainStyle({ filter: 'brightness(1.1)', transform: 'translate(0,0)' });
        setMainOpacity(1);
      }

      // RGB split ghost layers
      setRedStyle({
        transform: `translate(${(Math.random() - 0.5) * 18}px, ${(Math.random() - 0.5) * 6}px)`,
        opacity: 0.35 + Math.random() * 0.4,
      });
      setCyanStyle({
        transform: `translate(${(Math.random() - 0.5) * 18}px, ${(Math.random() - 0.5) * 6}px)`,
        opacity: 0.35 + Math.random() * 0.4,
      });

      frame++;
      timeout = setTimeout(runFrame, 50 + Math.random() * 100);
    };

    const start = setTimeout(runFrame, 200);
    return () => { clearTimeout(start); clearTimeout(timeout); };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes normalGlow {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(0,243,255,0.6)); }
          50% { filter: drop-shadow(0 0 40px rgba(0,243,255,1)) drop-shadow(0 0 80px rgba(0,243,255,0.3)); }
        }
        @keyframes scanlineMove {
          0% { background-position: 0 0; }
          100% { background-position: 0 80px; }
        }
        .logo-glow { animation: normalGlow 3s ease-in-out infinite; }
        .glitch-scanlines {
          background: repeating-linear-gradient(
            0deg, transparent, transparent 3px,
            rgba(0,0,0,0.3) 3px, rgba(0,0,0,0.3) 4px
          );
          animation: scanlineMove 0.2s linear infinite;
        }
      `}} />

      <a href="/profile" title="Lihat Profile" className="block">
        {/* === STRUKTUR ASLI TIDAK DIUBAH === */}
        <div className="w-64 h-64 md:w-80 md:h-80 mx-auto mb-8 relative flex items-center justify-center transition-transform duration-500 hover:scale-105 cursor-pointer">

          {/* Ambient glow — asli, opacity dikurangi */}
          <div className="absolute inset-0 bg-cyan-500/[0.03] blur-2xl rounded-full"></div>

          {/* === GLITCH LAYERS — hanya aktif saat phase === 'glitch' === */}

          {/* Scanlines */}
          {phase === 'glitch' && (
            <div className="absolute inset-0 z-30 pointer-events-none rounded-full glitch-scanlines" />
          )}

          {/* Slice blocks — pakai clipPath bukan overflow-hidden */}
          {phase === 'glitch' && blocks.map((b, i) => (
            <div
              key={i}
              className="absolute inset-0 z-20 pointer-events-none"
              style={{
                clipPath: `inset(${b.top} 0 calc(100% - ${b.top} - ${b.height}) 0)`,
                transform: `translateX(${b.tx}px)`,
              }}
            >
              <Image
                src="/fosht.png"
                alt=""
                fill
                sizes="(max-width: 768px) 256px, 320px"
                className="object-contain"
                style={{ filter: 'brightness(1.8) saturate(2)' }}
              />
            </div>
          ))}

          {/* RGB split merah */}
          {phase === 'glitch' && (
            <div className="absolute inset-0 z-10 pointer-events-none" style={redStyle}>
              <Image
                src="/fosht.png"
                alt=""
                fill
                sizes="(max-width: 768px) 256px, 320px"
                className="object-contain"
                style={{ filter: 'sepia(1) saturate(5) hue-rotate(300deg) brightness(1.5)', mixBlendMode: 'screen' }}
              />
            </div>
          )}

          {/* RGB split cyan */}
          {phase === 'glitch' && (
            <div className="absolute inset-0 z-10 pointer-events-none" style={cyanStyle}>
              <Image
                src="/fosht.png"
                alt=""
                fill
                sizes="(max-width: 768px) 256px, 320px"
                className="object-contain"
                style={{ filter: 'sepia(1) saturate(5) hue-rotate(160deg) brightness(1.5)', mixBlendMode: 'screen' }}
              />
            </div>
          )}

          {/* === MAIN IMAGE — struktur asli dipertahankan, hanya ditambah style glitch === */}
          <Image
            src="/fosht.png"
            alt="FOSHT Logo"
            fill
            priority
            sizes="(max-width: 768px) 256px, 320px"
            className={`relative z-10 object-contain ${phase === 'normal' ? 'logo-glow' : ''}`}
            style={{
              ...(phase === 'glitch' ? { ...mainStyle, opacity: mainOpacity } : {}),
              transition: phase === 'normal' ? 'all 0.4s ease' : 'none',
            }}
          />

        </div>
      </a>
    </>
  );
};

export const SystemAlert = ({ type, title, message, onClose }) => {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center px-4 pointer-events-none">
       <div className={`pointer-events-auto relative bg-[#050505] border-l-4 w-full max-w-md shadow-2xl overflow-hidden animate-shake ${type === 'error' ? 'border-red-600 shadow-red-900/50' : 'border-green-500 shadow-green-900/50'}`}>
         <div className={`h-1 w-full ${type === 'error' ? 'bg-red-600' : 'bg-green-500'}`}></div>
         
         <div className="p-6 flex items-start space-x-4 border border-gray-800 border-l-0">
           <div className={`p-2 rounded-sm shrink-0 ${type === 'error' ? 'bg-red-900/20 text-red-500' : 'bg-green-900/20 text-green-500'}`}>
             {type === 'error' ? <AlertOctagon className="w-8 h-8" /> : <CheckCircle className="w-8 h-8" />}
           </div>
           
           <div className="flex-1">
             <h4 className={`text-lg font-bold font-mono mb-1 ${type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
               {title}
             </h4>
             <p className="text-xs text-gray-400 font-mono leading-relaxed">
               {message}
             </p>
           </div>
           
           <button 
             onClick={onClose}
             className="text-gray-500 hover:text-white transition-colors"
           >
             <X className="w-5 h-5" />
           </button>
         </div>
         
         <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
       </div>
    </div>
  );
};

export const LogItem = ({ time, action, status }) => (
  <div className="flex items-start space-x-3 md:space-x-6 py-2 border-b border-gray-800/50 text-xs md:text-sm font-mono hover:bg-white/5 px-2 rounded transition-colors animate-fade-in-down">
    <span className="text-gray-500 w-24 md:w-28 shrink-0">{time}</span>
    <span className="text-gray-300 flex-1 break-words">{action}</span>
    <span className={`shrink-0 text-right ${status === 'SUCCESS' ? 'text-green-500' : status === 'WARNING' ? 'text-yellow-500' : 'text-cyan-400'}`}>{status}</span>
  </div>
);