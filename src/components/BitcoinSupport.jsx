'use client';

import { useEffect, useRef, useState } from 'react';
import { Heart, Copy, Check, Bitcoin, ChevronDown, X, Download, ZoomIn } from 'lucide-react';

const btcAddress = 'bc1qmugq6gzx3pg8akc2c3vlz2d2chv4wrscap4t3k';

// ── Load QR library sekali saja secara global
let qrLibLoaded = false;
let qrLibCallbacks = [];

function loadQRLib(cb) {
  if (qrLibLoaded && window.QRCode) { cb(); return; }
  qrLibCallbacks.push(cb);
  if (document.querySelector('script[data-qrlib]')) return; // sudah ada script tag, tunggu saja
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
  script.setAttribute('data-qrlib', '1');
  script.onload = () => {
    qrLibLoaded = true;
    qrLibCallbacks.forEach(fn => fn());
    qrLibCallbacks = [];
  };
  document.head.appendChild(script);
}

// ── Core draw function
function drawQR({ canvas, value, size, logoSrc, onDone }) {
  if (!canvas || !window.QRCode) return;
  const ctx = canvas.getContext('2d');
  canvas.width  = size;
  canvas.height = size;

  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  document.body.appendChild(tempDiv);

  try {
    new window.QRCode(tempDiv, {
      text: `bitcoin:${value}`,
      width: size, height: size,
      colorDark: '#00f3ff',
      colorLight: '#050505',
      correctLevel: window.QRCode.CorrectLevel.H,
    });
  } catch {
    document.body.removeChild(tempDiv);
    return;
  }

  setTimeout(() => {
    const qrEl = tempDiv.querySelector('img') || tempDiv.querySelector('canvas');
    if (!qrEl) { document.body.removeChild(tempDiv); return; }

    const src = qrEl.tagName === 'IMG' ? qrEl.src : qrEl.toDataURL();
    if (document.body.contains(tempDiv)) document.body.removeChild(tempDiv);

    const qrImg = new Image();
    qrImg.onload = () => {
      ctx.drawImage(qrImg, 0, 0, size, size);

      const logoSize = size * 0.22;
      const pad      = size * 0.035;
      const cx       = size / 2;
      const cy       = size / 2;

      // Background circle
      ctx.beginPath();
      ctx.arc(cx, cy, logoSize / 2 + pad, 0, Math.PI * 2);
      ctx.fillStyle = '#050505';
      ctx.fill();

      // Cyan ring
      ctx.beginPath();
      ctx.arc(cx, cy, logoSize / 2 + pad, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,243,255,0.5)';
      ctx.lineWidth = size * 0.008;
      ctx.stroke();

      if (logoSrc) {
        const logo = new Image();
        logo.onload = () => {
          const x = cx - logoSize / 2;
          const y = cy - logoSize / 2;
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, logoSize / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(logo, x, y, logoSize, logoSize);
          ctx.restore();
          onDone && onDone();
        };
        logo.onerror = () => onDone && onDone();
        logo.src = logoSrc;
      } else {
        onDone && onDone();
      }
    };
    qrImg.onerror = () => onDone && onDone();
    qrImg.src = src;
  }, 300);
}

// ── QR kecil (dalam card)
function QRSmall({ onClick }) {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const drawnRef = useRef(false);

  useEffect(() => {
    if (drawnRef.current) return;
    drawnRef.current = true;
    loadQRLib(() => {
      drawQR({
        canvas: canvasRef.current,
        value: btcAddress,
        size: 180,
        logoSrc: '/fosht.png',
        onDone: () => setReady(true),
      });
    });
  }, []);

  return (
    <div
      style={{ width: 180, height: 180 }}
      className="relative cursor-pointer group flex-shrink-0"
      onClick={onClick}
      title="Tap to enlarge"
    >
      <canvas
        ref={canvasRef}
        style={{ borderRadius: 8, opacity: ready ? 1 : 0, transition: 'opacity 0.3s', display: 'block' }}
      />
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

// ── QR besar (dalam modal)
function QRLarge() {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const drawnRef = useRef(false);

  useEffect(() => {
    if (drawnRef.current) return;
    drawnRef.current = true;
    // QR lib pasti sudah loaded karena QRSmall load duluan
    const tryDraw = () => {
      if (window.QRCode && canvasRef.current) {
        drawQR({
          canvas: canvasRef.current,
          value: btcAddress,
          size: 300,
          logoSrc: '/fosht.png',
          onDone: () => setReady(true),
        });
      } else {
        setTimeout(tryDraw, 100);
      }
    };
    tryDraw();
  }, []);

  const handleDownload = () => {
    if (!canvasRef.current || !ready) return;
    const link = document.createElement('a');
    link.download = 'fosht-btc-qr.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div style={{ width: 300, height: 300 }} className="relative">
        <canvas
          ref={canvasRef}
          style={{ borderRadius: 12, opacity: ready ? 1 : 0, transition: 'opacity 0.4s', display: 'block' }}
        />
        {!ready && (
          <div className="absolute inset-0 rounded-xl bg-[#080d1a] border border-cyan-500/10 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
          </div>
        )}
      </div>
      <button
        onClick={handleDownload}
        disabled={!ready}
        className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-wider rounded-sm hover:bg-cyan-500/20 transition-all disabled:opacity-30"
      >
        <Download className="w-3.5 h-3.5" />
        Download QR
      </button>
    </div>
  );
}

// ── Modal popup
function QRModal({ onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', WebkitBackdropFilter: 'blur(8px)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="relative bg-[#080d1a] border border-gray-800 rounded-sm p-8 flex flex-col items-center gap-4 w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-700 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="text-center">
          <p className="text-white text-sm font-bold">Bitcoin QR Code</p>
          <p className="text-gray-700 text-[10px] tracking-wider mt-0.5">SCAN WITH YOUR WALLET APP</p>
        </div>

        <QRLarge />

        <p className="text-gray-700 text-[10px] font-mono text-center break-all px-2">
          {btcAddress}
        </p>

        <p className="text-gray-800 text-[9px] tracking-wider">TAP OUTSIDE OR ESC TO CLOSE</p>
      </div>
    </div>
  );
}

// ── Main export
export default function BitcoinSupport() {
  const [open, setOpen]     = useState(false);
  const [modal, setModal]   = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(btcAddress).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      <div className="mt-16 pt-10 border-t border-gray-800">

        {/* Toggle Button */}
        <button
          onClick={() => setOpen(prev => !prev)}
          className={`w-full flex items-center justify-between px-5 py-3.5 rounded-sm border transition-all duration-200 ${
            open
              ? 'bg-orange-500/8 border-orange-500/30 text-orange-400'
              : 'bg-[#080d1a] border-gray-800 text-gray-500 hover:border-orange-500/25 hover:text-orange-400/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <Heart className={`w-4 h-4 ${open ? 'text-orange-400' : 'text-gray-600'}`} />
            <span className="text-xs font-bold tracking-wider">SUPPORT THIS SITE</span>
            <span className="text-[9px] px-2 py-0.5 bg-orange-500/10 text-orange-500/60 border border-orange-500/15 rounded-sm tracking-wider hidden sm:inline">
              BITCOIN
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180 text-orange-400' : 'text-gray-700'}`} />
        </button>

        {/* Expandable Content */}
        {open && (
          <div className="mt-2 bg-[#080d1a] border border-gray-800 rounded-sm p-6">
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">

              {/* QR kecil */}
              <div className="shrink-0 flex flex-col items-center gap-2">
                <QRSmall onClick={() => setModal(true)} />
                <span className="text-[9px] text-gray-700 tracking-[2px]">TAP TO ENLARGE</span>
              </div>

              {/* Info */}
              <div className="flex flex-col gap-4 flex-1 min-w-0">
                <div>
                  <p className="text-white text-sm font-bold mb-1.5">Support FOSHT</p>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    If you find this content useful, consider supporting with Bitcoin.
                    Every satoshi helps keep this site running and motivates more writing.
                  </p>
                </div>

                {/* Address */}
                <div>
                  <p className="text-[9px] text-gray-700 tracking-[2px] mb-2">BITCOIN ADDRESS</p>
                  <div className="flex items-center gap-2 bg-black/40 border border-gray-900 rounded-sm px-3 py-2">
                    <Bitcoin className="w-3 h-3 text-orange-400 shrink-0" />
                    <span className="text-gray-500 text-[10px] font-mono truncate flex-1 select-all">
                      {btcAddress}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="shrink-0 text-gray-700 hover:text-cyan-400 transition-colors"
                      title="Copy address"
                    >
                      {copied
                        ? <Check className="w-3.5 h-3.5 text-cyan-400" />
                        : <Copy className="w-3.5 h-3.5" />
                      }
                    </button>
                  </div>
                  {copied && <p className="text-[10px] text-cyan-500 mt-1.5">Address copied!</p>}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-[9px] px-2 py-1 bg-orange-500/8 text-orange-500/60 border border-orange-500/15 rounded-sm tracking-wider">
                    BTC · MAINNET
                  </span>
                  <span className="text-[9px] px-2 py-1 bg-cyan-500/8 text-cyan-700 border border-cyan-500/15 rounded-sm tracking-wider">
                    NATIVE SEGWIT (bc1)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && <QRModal onClose={() => setModal(false)} />}
    </>
  );
}