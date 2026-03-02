'use client';

import React, { useEffect, useRef } from 'react';
import { AlertOctagon, CheckCircle, X } from 'lucide-react';

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

export const FennecLogo = () => (
  <div className="w-64 h-64 md:w-80 md:h-80 mx-auto mb-8 relative flex items-center justify-center transition-transform duration-500 hover:scale-105">
    <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full animate-pulse"></div>
    <img 
      src="/fosht.png" 
      alt="FOSHT Logo" 
      className="relative z-10 w-full h-full object-contain drop-shadow-[0_0_20px_rgba(0,243,255,0.6)]"
      onError={(e) => {e.target.style.display='none'}}
    />
  </div>
);

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