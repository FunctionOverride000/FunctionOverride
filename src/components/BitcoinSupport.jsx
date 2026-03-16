'use client';

import { useEffect, useRef, useState } from 'react';
import { Heart, Copy, Check, Bitcoin, ChevronDown, X, Download, ZoomIn } from 'lucide-react';

const btcAddress = 'bc1qmugq6gzx3pg8akc2c3vlz2d2chv4wrscap4t3k';

// ── Detect mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 640 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent));
  }, []);
  return isMobile;
}

// ── Load QR lib sekali saja
let qrLibLoaded = false;
let qrLibQueue  = [];
function loadQRLib(cb) {
  if (qrLibLoaded && window.QRCode) { cb(); return; }
  qrLibQueue.push(cb);
  if (document.querySelector('script[data-qrlib]')) return;
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
  s.setAttribute('data-qrlib', '1');
  s.onload = () => { qrLibLoaded = true; qrLibQueue.forEach(f => f()); qrLibQueue = []; };
  document.head.appendChild(s);
}

// ── Draw QR on canvas
function drawQR({ canvas, value, size, logoSrc, onDone }) {
  if (!canvas || !window.QRCode) return;
  const ctx = canvas.getContext('2d');
  canvas.width = size; canvas.height = size;

  const tmp = document.createElement('div');
  tmp.style.cssText = 'position:absolute;left:-9999px';
  document.body.appendChild(tmp);

  try {
    new window.QRCode(tmp, {
      text: `bitcoin:${value}`,
      width: size, height: size,
      colorDark: '#00f3ff', colorLight: '#050505',
      correctLevel: window.QRCode.CorrectLevel.H,
    });
  } catch { document.body.removeChild(tmp); return; }

  setTimeout(() => {
    const el  = tmp.querySelector('img') || tmp.querySelector('canvas');
    if (!el) { document.body.removeChild(tmp); return; }
    const src = el.tagName === 'IMG' ? el.src : el.toDataURL();
    if (document.body.contains(tmp)) document.body.removeChild(tmp);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      const ls = size * 0.22, pad = size * 0.035, cx = size / 2, cy = size / 2;
      ctx.beginPath(); ctx.arc(cx, cy, ls/2 + pad, 0, Math.PI*2);
      ctx.fillStyle = '#050505'; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, ls/2 + pad, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(0,243,255,0.5)'; ctx.lineWidth = size * 0.008; ctx.stroke();
      if (logoSrc) {
        const logo = new Image();
        logo.onload = () => {
          ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, ls/2, 0, Math.PI*2); ctx.clip();
          ctx.drawImage(logo, cx - ls/2, cy - ls/2, ls, ls); ctx.restore();
          onDone && onDone();
        };
        logo.onerror = () => onDone && onDone();
        logo.src = logoSrc;
      } else { onDone && onDone(); }
    };
    img.onerror = () => onDone && onDone();
    img.src = src;
  }, 300);
}

// ── QR Display: mobile=img statis, desktop=canvas
function QRDisplay({ size = 180, onClick }) {
  const isMobile  = useIsMobile();
  const canvasRef = useRef(null);
  const drawnRef  = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isMobile || drawnRef.current) return;
    drawnRef.current = true;
    loadQRLib(() => drawQR({
      canvas: canvasRef.current, value: btcAddress,
      size, logoSrc: '/fosht.png', onDone: () => setReady(true),
    }));
  }, [isMobile, size]);

  if (isMobile) {
    return (
      <div style={{ width: size, height: size }} className="relative cursor-pointer group flex-shrink-0" onClick={onClick}>
        <img
          src="/fosht-btc-qr.png"
          alt="Bitcoin QR Code"
          width={size} height={size}
          style={{ borderRadius: 8, display: 'block', width: size, height: size, objectFit: 'contain' }}
        />
        <div className="absolute inset-0 rounded-lg bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <ZoomIn className="w-6 h-6 text-cyan-400" />
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: size, height: size }} className="relative cursor-pointer group flex-shrink-0" onClick={onClick}>
      <canvas ref={canvasRef} style={{ borderRadius: 8, opacity: ready ? 1 : 0, transition: 'opacity 0.3s', display: 'block' }} />
      {!ready && (
        <div className="absolute inset-0 rounded-lg bg-[#080d1a] border border-cyan-500/10 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      )}
      {ready && (
        <div className="absolute inset-0 rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <ZoomIn className="w-6 h-6 text-cyan-400" />
        </div>
      )}
    </div>
  );
}

// ── QR besar di modal
function QRModalContent({ isMobile }) {
  const canvasRef = useRef(null);
  const drawnRef  = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isMobile || drawnRef.current) return;
    drawnRef.current = true;
    const tryDraw = () => {
      if (window.QRCode && canvasRef.current) {
        drawQR({ canvas: canvasRef.current, value: btcAddress, size: 300, logoSrc: '/fosht.png', onDone: () => setReady(true) });
      } else { setTimeout(tryDraw, 100); }
    };
    tryDraw();
  }, [isMobile]);

  const handleDownload = () => {
    if (isMobile) {
      const a = document.createElement('a');
      a.href = '/fosht-btc-qr.png'; a.download = 'fosht-btc-qr.png'; a.click();
    } else {
      if (!canvasRef.current || !ready) return;
      const a = document.createElement('a');
      a.download = 'fosht-btc-qr.png'; a.href = canvasRef.current.toDataURL('image/png'); a.click();
    }
  };

  return (
    <div className="flex flex-col items-center gap-5">
      {isMobile ? (
        <img src="/fosht-btc-qr.png" alt="Bitcoin QR" width={300} height={300}
          style={{ borderRadius: 12, display: 'block', width: 300, height: 300, objectFit: 'contain' }} />
      ) : (
        <div style={{ width: 300, height: 300 }} className="relative">
          <canvas ref={canvasRef} style={{ borderRadius: 12, opacity: ready ? 1 : 0, transition: 'opacity 0.4s', display: 'block' }} />
          {!ready && (
            <div className="absolute inset-0 rounded-xl bg-[#080d1a] border border-cyan-500/10 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}
      <button onClick={handleDownload} disabled={!isMobile && !ready}
        className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-wider rounded-sm hover:bg-cyan-500/20 transition-all disabled:opacity-30">
        <Download className="w-3.5 h-3.5" />
        Download QR
      </button>
    </div>
  );
}

// ── Modal
function QRModal({ onClose }) {
  const isMobile = useIsMobile();

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.80)', WebkitBackdropFilter: 'blur(8px)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div className="relative bg-[#080d1a] border border-gray-800 rounded-sm p-8 flex flex-col items-center gap-4 w-full max-w-sm"
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-700 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
        <div className="text-center">
          <p className="text-white text-sm font-bold">Bitcoin QR Code</p>
          <p className="text-gray-700 text-[10px] tracking-wider mt-0.5">SCAN WITH YOUR WALLET APP</p>
        </div>
        <QRModalContent isMobile={isMobile} />
        <p className="text-gray-700 text-[10px] font-mono text-center break-all px-2">{btcAddress}</p>
        <p className="text-gray-800 text-[9px] tracking-wider">TAP OUTSIDE OR ESC TO CLOSE</p>
      </div>
    </div>
  );
}

// ── Main
export default function BitcoinSupport() {
  const [open, setOpen]     = useState(false);
  const [modal, setModal]   = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(btcAddress).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      <div className="mt-16 pt-10 border-t border-gray-800">
        <button onClick={() => setOpen(p => !p)}
          className={`w-full flex items-center justify-between px-5 py-3.5 rounded-sm border transition-all duration-200 ${
            open ? 'bg-orange-500/8 border-orange-500/30 text-orange-400'
                 : 'bg-[#080d1a] border-gray-800 text-gray-500 hover:border-orange-500/25 hover:text-orange-400/80'
          }`}>
          <div className="flex items-center gap-3">
            <Heart className={`w-4 h-4 ${open ? 'text-orange-400' : 'text-gray-600'}`} />
            <span className="text-xs font-bold tracking-wider">SUPPORT THIS SITE</span>
            <span className="text-[9px] px-2 py-0.5 bg-orange-500/10 text-orange-500/60 border border-orange-500/15 rounded-sm tracking-wider hidden sm:inline">BITCOIN</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180 text-orange-400' : 'text-gray-700'}`} />
        </button>

        {open && (
          <div className="mt-2 bg-[#080d1a] border border-gray-800 rounded-sm p-6">
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              <div className="shrink-0 flex flex-col items-center gap-2">
                <QRDisplay size={180} onClick={() => setModal(true)} />
                <span className="text-[9px] text-gray-700 tracking-[2px]">TAP TO ENLARGE</span>
              </div>
              <div className="flex flex-col gap-4 flex-1 min-w-0">
                <div>
                  <p className="text-white text-sm font-bold mb-1.5">Support FOSHT</p>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    If you find this content useful, consider supporting with Bitcoin.
                    Every satoshi helps keep this site running and motivates more writing.
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-700 tracking-[2px] mb-2">BITCOIN ADDRESS</p>
                  <div className="flex items-center gap-2 bg-black/40 border border-gray-900 rounded-sm px-3 py-2">
                    <Bitcoin className="w-3 h-3 text-orange-400 shrink-0" />
                    <span className="text-gray-500 text-[10px] font-mono truncate flex-1 select-all">{btcAddress}</span>
                    <button onClick={handleCopy} className="shrink-0 text-gray-700 hover:text-cyan-400 transition-colors">
                      {copied ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {copied && <p className="text-[10px] text-cyan-500 mt-1.5">Address copied!</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[9px] px-2 py-1 bg-orange-500/8 text-orange-500/60 border border-orange-500/15 rounded-sm tracking-wider">BTC · MAINNET</span>
                  <span className="text-[9px] px-2 py-1 bg-cyan-500/8 text-cyan-700 border border-cyan-500/15 rounded-sm tracking-wider">NATIVE SEGWIT (bc1)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {modal && <QRModal onClose={() => setModal(false)} />}
    </>
  );
}