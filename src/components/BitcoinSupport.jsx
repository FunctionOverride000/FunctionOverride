'use client';

import { useEffect, useRef, useState } from 'react';
import { Heart, Copy, Check, Bitcoin, ChevronDown } from 'lucide-react';

const btcAddress = 'bc1qmugq6gzx3pg8akc2c3vlz2d2chv4wrscap4t3k';

function QRWithLogo({ value, size = 180, logoSrc }) {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    script.onload = () => drawQR();
    document.head.appendChild(script);
    return () => { if (document.head.contains(script)) document.head.removeChild(script); };
  }, []);

  const drawQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = size;
    canvas.height = size;

    const tempDiv = document.createElement('div');
    document.body.appendChild(tempDiv);

    try {
      new window.QRCode(tempDiv, {
        text: `bitcoin:${value}`,
        width: size, height: size,
        colorDark: '#00f3ff',
        colorLight: '#050505',
        correctLevel: window.QRCode.CorrectLevel.H,
      });

      setTimeout(() => {
        const qrImg = tempDiv.querySelector('img') || tempDiv.querySelector('canvas');
        if (!qrImg) { document.body.removeChild(tempDiv); return; }

        const drawOnCanvas = (src) => {
          const qrImage = new Image();
          qrImage.onload = () => {
            ctx.drawImage(qrImage, 0, 0, size, size);
            const logoSize = size * 0.22;
            const logoX = (size - logoSize) / 2;
            const logoY = (size - logoSize) / 2;
            const padding = 6;

            ctx.beginPath();
            ctx.arc(size / 2, size / 2, logoSize / 2 + padding, 0, Math.PI * 2);
            ctx.fillStyle = '#050505';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(size / 2, size / 2, logoSize / 2 + padding, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0,243,255,0.4)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            if (logoSrc) {
              const logo = new Image();
              logo.onload = () => {
                ctx.save();
                ctx.beginPath();
                ctx.arc(size / 2, size / 2, logoSize / 2, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
                ctx.restore();
                setReady(true);
              };
              logo.src = logoSrc;
            } else {
              setReady(true);
            }
          };
          qrImage.src = src;
        };

        if (qrImg.tagName === 'IMG') drawOnCanvas(qrImg.src);
        else drawOnCanvas(qrImg.toDataURL());
        document.body.removeChild(tempDiv);
      }, 200);
    } catch {
      document.body.removeChild(tempDiv);
    }
  };

  return (
    <div style={{ width: size, height: size }} className="relative">
      <canvas ref={canvasRef}
        style={{ borderRadius: '8px', opacity: ready ? 1 : 0, transition: 'opacity 0.3s' }} />
      {!ready && (
        <div className="absolute inset-0 rounded-lg bg-[#080d1a] border border-cyan-500/10 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

export default function BitcoinSupport() {
  const [open, setOpen]     = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(BTC_ADDRESS).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="mt-16 pt-10 border-t border-gray-800">

      {/* Toggle Button */}
      <button
        onClick={() => setOpen(p => !p)}
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
        <div className="mt-2 bg-[#080d1a] border border-gray-800 rounded-sm p-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">

            {/* QR Code */}
            <div className="shrink-0 flex flex-col items-center gap-3">
              <QRWithLogo value={BTC_ADDRESS} size={180} logoSrc="/fosht.png" />
              <span className="text-[9px] text-gray-700 tracking-[2px]">SCAN TO SEND BTC</span>
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

              {/* Bitcoin address */}
              <div>
                <p className="text-[9px] text-gray-700 tracking-[2px] mb-2">BITCOIN ADDRESS</p>
                <div className="flex items-center gap-2 bg-black/40 border border-gray-900 rounded-sm px-3 py-2">
                  <Bitcoin className="w-3 h-3 text-orange-400 shrink-0" />
                  <span className="text-gray-500 text-[10px] font-mono truncate flex-1 select-all">
                    {BTC_ADDRESS}
                  </span>
                  <button onClick={handleCopy}
                    className="shrink-0 text-gray-700 hover:text-cyan-400 transition-colors"
                    title="Copy address">
                    {copied
                      ? <Check className="w-3.5 h-3.5 text-cyan-400" />
                      : <Copy className="w-3.5 h-3.5" />
                    }
                  </button>
                </div>
                {copied && <p className="text-[10px] text-cyan-500 mt-1.5">Address copied!</p>}
              </div>

              {/* Network tags */}
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
  );
}


const BTC_ADDRESS = 'bc1qmugq6gzx3pg8akc2c3vlz2d2chv4wrscap4t3k';

function QRWithLogo({ value, size = 200, logoSrc }) {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Load qrcode library dynamically
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    script.onload = () => drawQR();
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  const drawQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = size;
    canvas.height = size;

    // Generate QR via qrcode lib into temp div
    const tempDiv = document.createElement('div');
    document.body.appendChild(tempDiv);

    try {
      const qr = new window.QRCode(tempDiv, {
        text: `bitcoin:${value}`,
        width: size,
        height: size,
        colorDark: '#00f3ff',
        colorLight: '#050505',
        correctLevel: window.QRCode.CorrectLevel.H, // High error correction — needed for logo overlay
      });

      setTimeout(() => {
        const qrImg = tempDiv.querySelector('img') || tempDiv.querySelector('canvas');
        if (!qrImg) { document.body.removeChild(tempDiv); return; }

        const drawOnCanvas = (src) => {
          const qrImage = new Image();
          qrImage.onload = () => {
            // Draw QR
            ctx.drawImage(qrImage, 0, 0, size, size);

            // Draw logo in center
            const logoSize  = size * 0.22;
            const logoX     = (size - logoSize) / 2;
            const logoY     = (size - logoSize) / 2;
            const padding   = 6;

            // White background circle for logo
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, logoSize / 2 + padding, 0, Math.PI * 2);
            ctx.fillStyle = '#050505';
            ctx.fill();

            // Cyan border
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, logoSize / 2 + padding, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0,243,255,0.4)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            if (logoSrc) {
              const logo = new Image();
              logo.onload = () => {
                ctx.save();
                ctx.beginPath();
                ctx.arc(size / 2, size / 2, logoSize / 2, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
                ctx.restore();
                setReady(true);
              };
              logo.src = logoSrc;
            } else {
              setReady(true);
            }
          };
          qrImage.src = src;
        };

        if (qrImg.tagName === 'IMG') {
          drawOnCanvas(qrImg.src);
        } else {
          drawOnCanvas(qrImg.toDataURL());
        }

        document.body.removeChild(tempDiv);
      }, 200);
    } catch {
      document.body.removeChild(tempDiv);
    }
  };

  return (
    <div style={{ width: size, height: size }} className="relative">
      <canvas
        ref={canvasRef}
        style={{ borderRadius: '8px', opacity: ready ? 1 : 0, transition: 'opacity 0.3s' }}
      />
      {!ready && (
        <div
          className="absolute inset-0 rounded-lg bg-[#080d1a] border border-cyan-500/10 flex items-center justify-center"
        >
          <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

export default function BitcoinSupport() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(BTC_ADDRESS).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="mt-16 pt-10 border-t border-gray-800">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[10px] tracking-[3px] text-gray-600">SUPPORT</span>
        <div className="flex-1 h-px bg-gray-900" />
      </div>

      <div className="bg-[#080d1a] border border-gray-800 rounded-sm p-6">
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">

          {/* QR Code */}
          <div className="shrink-0 flex flex-col items-center gap-3">
            <QRWithLogo value={BTC_ADDRESS} size={180} logoSrc="/fosht.png" />
            <span className="text-[9px] text-gray-700 tracking-[2px]">SCAN TO SEND BTC</span>
          </div>

          {/* Info */}
          <div className="flex flex-col justify-between gap-4 flex-1 min-w-0">

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-cyan-400" />
                <span className="text-white text-sm font-bold">Support FOSHT</span>
              </div>
              <p className="text-gray-600 text-xs leading-relaxed">
                If you find this content useful, consider supporting with Bitcoin.
                Every satoshi helps keep this site running and motivates more writing.
              </p>
            </div>

            {/* Bitcoin address */}
            <div>
              <p className="text-[9px] text-gray-700 tracking-[2px] mb-2">BITCOIN ADDRESS</p>
              <div className="flex items-center gap-2 bg-black/40 border border-gray-900 rounded-sm px-3 py-2">
                <Bitcoin className="w-3 h-3 text-orange-400 shrink-0" />
                <span className="text-gray-500 text-[10px] font-mono truncate flex-1 select-all">
                  {BTC_ADDRESS}
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
              {copied && (
                <p className="text-[10px] text-cyan-500 mt-1.5">Address copied!</p>
              )}
            </div>

            {/* Network info */}
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
    </div>
  );
}