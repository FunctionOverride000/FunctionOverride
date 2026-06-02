'use client';

import React, { useState, useEffect } from 'react';

const LoadingScreen = ({ onComplete }) => {
  const [lines, setLines] = useState([]);
  const [progress, setProgress] = useState(0);
  const [accessGranted, setAccessGranted] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [deniedReason, setDeniedReason] = useState('');

  useEffect(() => {
    const run = async () => {
      const add = (text, status) => {
        setLines(prev => [...prev, { text, status }]);
      };
      const sleep = (ms) => new Promise(res => setTimeout(res, ms));

      // --- STEP 1: Online check ---
      await sleep(400);
      const isOnline = navigator.onLine;
      add("Checking network connection...", isOnline ? "OK" : "FAIL");
      setProgress(14);

      if (!isOnline) {
        await sleep(300);
        add("ERROR: No internet connection detected.", "FAIL");
        add("Check your Wi-Fi or mobile data and reload.", "WARN");
        setProgress(100);
        setDeniedReason("NO INTERNET CONNECTION");
        setGlitch(true);
        setTimeout(() => setGlitch(false), 400);
        setTimeout(() => setAccessDenied(true), 600);
        return;
      }

      // --- STEP 2: Cookies check ---
      await sleep(500);
      const cookiesEnabled = navigator.cookieEnabled;
      add("Verifying browser permissions (cookies)...", cookiesEnabled ? "OK" : "WARN");
      setProgress(28);

      // --- STEP 3: localStorage check ---
      await sleep(400);
      let storageOk = false;
      try {
        localStorage.setItem('__fosht_test__', '1');
        localStorage.removeItem('__fosht_test__');
        storageOk = true;
      } catch (e) {
        storageOk = false;
      }
      add("Checking local storage access...", storageOk ? "OK" : "WARN");
      setProgress(42);

      // --- STEP 4: Ping ke server ---
      await sleep(500);
      add("Pinging remote server...", "...");
      setProgress(57);

      let pingOk = false;
      let pingMs = null;
      try {
        // Gunakan URL relatif agar works di localhost maupun production
        const isLocal = typeof window !== 'undefined' &&
          (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        const pingUrl = isLocal
          ? `${window.location.origin}/favicon.ico`
          : 'https://fosht.vercel.app/favicon.ico';
        const t0 = performance.now();
        const res = await fetch(pingUrl, {
          method: 'HEAD',
          cache: 'no-cache',
          signal: AbortSignal.timeout(6000),
        });
        const t1 = performance.now();
        pingMs = Math.round(t1 - t0);
        // Semua status dianggap OK kecuali network error — server merespons = reachable
        pingOk = res.status < 500;
      } catch (e) {
        pingOk = false;
      }

      // Replace baris "..." dengan hasil nyata
      setLines(prev => {
        const updated = [...prev];
        const idx = [...updated].reverse().findIndex(l => l.status === '...');
        const realIdx = idx !== -1 ? updated.length - 1 - idx : -1;
        if (realIdx !== -1) {
          updated[realIdx] = {
            text: pingOk
              ? `Server reachable — latency ${pingMs}ms`
              : "Server unreachable or connection timed out.",
            status: pingOk ? "OK" : "FAIL",
          };
        }
        return updated;
      });
      setProgress(71);

      if (!pingOk) {
        await sleep(300);
        add("ERROR: Cannot reach fosht server.", "FAIL");
        add("Possible cause: firewall, VPN block, or server down.", "WARN");
        setProgress(100);
        setDeniedReason("SERVER UNREACHABLE");
        setGlitch(true);
        setTimeout(() => setGlitch(false), 400);
        setTimeout(() => setAccessDenied(true), 600);
        return;
      }

      // --- STEP 5: Environment warning (non-fatal) ---
      await sleep(400);
      if (!cookiesEnabled || !storageOk) {
        add("Warning: Some features may be limited (cookies/storage blocked).", "WARN");
      } else {
        add("Browser environment verified.", "OK");
      }
      setProgress(85);

      // --- STEP 6: Final ---
      await sleep(500);
      add("Loading Neural Network v4.2...", "OK");
      setProgress(93);

      await sleep(400);
      add("System Ready.", "SUCCESS");
      setProgress(100);

      // ACCESS GRANTED
      await sleep(400);
      setGlitch(true);
      setTimeout(() => setGlitch(false), 400);
      setTimeout(() => setAccessGranted(true), 500);
      setTimeout(() => setFadeOut(true), 1800);
      setTimeout(onComplete, 2600);
    };

    run();
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden transition-all duration-700 ${fadeOut ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
      style={{ background: '#050505' }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          92% { opacity: 1; }
          93% { opacity: 0.4; }
          94% { opacity: 1; }
          96% { opacity: 0.6; }
          97% { opacity: 1; }
        }
        @keyframes glitchShift {
          0% { clip-path: inset(0 0 100% 0); transform: translate(0); }
          10% { clip-path: inset(10% 0 60% 0); transform: translate(-4px, 2px); }
          20% { clip-path: inset(30% 0 40% 0); transform: translate(4px, -2px); }
          30% { clip-path: inset(60% 0 20% 0); transform: translate(-2px, 4px); }
          40% { clip-path: inset(80% 0 5% 0); transform: translate(2px, -4px); }
          50% { clip-path: inset(0 0 0 0); transform: translate(0); }
          100% { clip-path: inset(0 0 0 0); transform: translate(0); }
        }
        @keyframes typeIn {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes progressGlow {
          0%, 100% { box-shadow: 0 0 8px rgba(0,243,255,0.6); }
          50% { box-shadow: 0 0 20px rgba(0,243,255,1), 0 0 40px rgba(0,243,255,0.4); }
        }
        @keyframes accessPulse {
          0% { opacity: 0; letter-spacing: 0.5em; transform: scale(0.8); }
          50% { opacity: 1; letter-spacing: 0.3em; transform: scale(1.05); }
          100% { opacity: 1; letter-spacing: 0.25em; transform: scale(1); }
        }
        @keyframes deniedPulse {
          0% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes borderTrace {
          0% { clip-path: inset(0 100% 100% 0); }
          25% { clip-path: inset(0 0 100% 0); }
          50% { clip-path: inset(0 0 0 100%); }
          75% { clip-path: inset(100% 0 0 0); }
          100% { clip-path: inset(0 0 0 0); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .scanline {
          position: absolute; width: 100%; height: 2px;
          background: linear-gradient(transparent, rgba(0,243,255,0.08), transparent);
          animation: scanline 3s linear infinite;
          pointer-events: none;
        }
        .screen-flicker { animation: flicker 8s infinite; }
        .line-type-in { animation: typeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .progress-glow { animation: progressGlow 1.5s ease-in-out infinite; }
        .access-granted-text { animation: accessPulse 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .access-denied-text { animation: deniedPulse 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .border-trace { animation: borderTrace 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .border-trace-red { animation: borderTrace 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .glitch-active { animation: glitchShift 0.4s steps(1) forwards; }
        .fade-slide-up { animation: fadeSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .crt-overlay {
          background: repeating-linear-gradient(
            0deg, transparent, transparent 2px,
            rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px
          );
          pointer-events: none;
        }
      `}} />

      {/* CRT scanlines overlay */}
      <div className="absolute inset-0 crt-overlay z-10 pointer-events-none" />
      <div className="scanline z-10" />

      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(0,243,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,243,255,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main container */}
      <div className={`screen-flicker relative z-20 w-full max-w-lg mx-4 ${glitch ? 'glitch-active' : ''}`}>

        {/* Header */}
        <div className="fade-slide-up mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-cyan-400 font-mono text-xs tracking-[0.3em] uppercase">FOSHT SYSTEM v2.0</span>
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        </div>

        {/* Terminal box */}
        <div className="relative border border-gray-800 bg-black/60 backdrop-blur-sm rounded-sm overflow-hidden">

          {/* Terminal title bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-800 bg-gray-950/80">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            <span className="ml-2 text-gray-500 font-mono text-xs">boot.sh — fosht-kernel</span>
          </div>

          {/* Terminal content */}
          <div className="p-5 min-h-[200px]">
            {lines.map((item, i) => (
              <div key={i} className="line-type-in flex items-center gap-3 mb-2 font-mono text-sm">
                <span className="text-gray-600 w-6 text-right shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <span className={`shrink-0 ${item.status === 'FAIL' ? 'text-red-500' : item.status === 'WARN' ? 'text-yellow-500' : 'text-cyan-600'}`}>$</span>
                <span className={`flex-1 text-xs md:text-sm ${item.status === 'FAIL' ? 'text-red-400' : item.status === 'WARN' ? 'text-yellow-300' : 'text-gray-300'}`}>
                  {item.text}
                </span>
                <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded font-bold ${
                  item.status === 'SUCCESS'   ? 'text-green-400 bg-green-500/10 border border-green-500/30'
                  : item.status === 'FAIL'    ? 'text-red-400 bg-red-500/10 border border-red-500/30'
                  : item.status === 'WARN'    ? 'text-yellow-400 bg-yellow-500/10 border border-yellow-500/30'
                  : item.status === '...'     ? 'text-gray-400 bg-gray-500/10 border border-gray-500/30 animate-pulse'
                  : 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}

            {/* Blinking cursor */}
            {!accessGranted && !accessDenied && (
              <div className="flex items-center gap-3 mt-1 font-mono text-sm">
                <span className="text-gray-600 w-6 text-right shrink-0">&nbsp;</span>
                <span className="text-cyan-600 shrink-0">$</span>
                <div className="w-2 h-4 bg-cyan-400 animate-pulse" />
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="px-5 pb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 font-mono text-xs">LOADING</span>
              <span className={`font-mono text-xs ${accessDenied ? 'text-red-400' : 'text-cyan-400'}`}>{progress}%</span>
            </div>
            <div className="h-1 bg-gray-900 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  accessDenied
                    ? 'bg-gradient-to-r from-red-700 to-red-500'
                    : 'bg-gradient-to-r from-cyan-600 to-cyan-400 progress-glow'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bottom info */}
        <div className="fade-slide-up mt-4 flex items-center justify-between font-mono text-xs text-gray-600 px-1">
          <span>KERNEL 4.2.1-FOSHT</span>
          <span className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${accessDenied ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`} />
            {accessDenied ? 'CONNECTION FAILED' : 'SECURE CONNECTION'}
          </span>
        </div>
      </div>

      {/* ACCESS GRANTED overlay */}
      {accessGranted && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="access-granted-text">
              <div className="relative inline-block">
                <div className="absolute inset-0 border-2 border-cyan-400 border-trace" />
                <div className="px-10 py-5">
                  <div
                    className="text-3xl md:text-4xl font-black font-mono text-cyan-400 tracking-[0.25em]"
                    style={{ textShadow: '0 0 20px rgba(0,243,255,0.8), 0 0 40px rgba(0,243,255,0.4)' }}
                  >
                    ACCESS GRANTED
                  </div>
                  <div className="mt-2 text-xs text-cyan-600 font-mono tracking-[0.4em]">IDENTITY VERIFIED</div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-center gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-1 bg-cyan-400 rounded-full animate-pulse"
                  style={{ width: `${[40,20,60,20,40][i]}px`, animationDelay: `${i*0.1}s`, opacity: 0.6 }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ACCESS DENIED overlay */}
      {accessDenied && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/85 backdrop-blur-sm">
          <div className="text-center px-6">
            <div className="access-denied-text">
              <div className="relative inline-block">
                <div className="absolute inset-0 border-2 border-red-500 border-trace-red" />
                <div className="px-10 py-5">
                  <div
                    className="text-3xl md:text-4xl font-black font-mono text-red-500 tracking-[0.2em]"
                    style={{ textShadow: '0 0 20px rgba(255,0,60,0.8), 0 0 40px rgba(255,0,60,0.4)' }}
                  >
                    ACCESS DENIED
                  </div>
                  <div className="mt-2 text-xs text-red-600 font-mono tracking-[0.3em]">{deniedReason}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-xs font-mono text-gray-500 max-w-sm mx-auto leading-relaxed">
              {deniedReason === 'NO INTERNET CONNECTION' && (
                <span>
                  Pastikan perangkat kamu terhubung ke internet,<br />
                  lalu{' '}
                  <button
                    onClick={() => window.location.reload()}
                    className="text-red-400 underline underline-offset-2 hover:text-red-300 cursor-pointer"
                  >
                    klik di sini untuk coba lagi
                  </button>.
                </span>
              )}
              {deniedReason === 'SERVER UNREACHABLE' && (
                <span>
                  Server tidak dapat dijangkau.<br />
                  Coba matikan VPN, periksa firewall, atau{' '}
                  <button
                    onClick={() => window.location.reload()}
                    className="text-red-400 underline underline-offset-2 hover:text-red-300 cursor-pointer"
                  >
                    muat ulang halaman
                  </button>.
                </span>
              )}
            </div>

            <div className="mt-6 flex items-center justify-center gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-1 bg-red-500 rounded-full animate-pulse"
                  style={{ width: `${[40,20,60,20,40][i]}px`, animationDelay: `${i*0.1}s`, opacity: 0.6 }} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingScreen;