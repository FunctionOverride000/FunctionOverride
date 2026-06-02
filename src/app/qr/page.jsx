'use client';

import React, { useState } from 'react';

export default function QRPage() {
  const [isDownloading, setIsDownloading] = useState(false);

  const qrImageUrl = "https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=https://fosht.vercel.app&color=000000&bgcolor=ffffff&margin=20";
  const logoUrl = "/fosht.png";

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      const size = 600;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      // Gambar QR
      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        qrImg.onload = resolve;
        qrImg.onerror = reject;
        qrImg.src = qrImageUrl;
      });
      ctx.drawImage(qrImg, 0, 0, size, size);

      // Gambar Logo di tengah
      const logoImg = new Image();
      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
        logoImg.src = logoUrl;
      });

      const logoSize = size * 0.2; // 20% dari ukuran QR
      const logoX = (size - logoSize) / 2;
      const logoY = (size - logoSize) / 2;
      const radius = logoSize / 2;

      // Lingkaran putih background logo
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, radius + 8, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();

      // Clip lingkaran untuk logo
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      ctx.restore();

      // Download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'qr-fosht.png';
        link.click();
        URL.revokeObjectURL(url);
        setIsDownloading(false);
      }, 'image/png');

    } catch (error) {
      console.error('Error:', error);
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-300 font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-teal-500/30">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.1); }
        }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
      `}} />

      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-teal-600/20 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] bg-purple-600/20 rounded-full blur-[80px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-[0_0_40px_rgba(20,184,166,0.15)] p-8 md:p-12 w-full max-w-md mx-auto border border-gray-800">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-purple-500 mb-2">
            Scan QR Code
          </h1>
          <p className="text-sm text-gray-400">Pindai untuk mengunjungi portofolio saya</p>
        </div>

        <div className="relative flex justify-center items-center mb-8 bg-white p-4 rounded-2xl shadow-inner mx-auto w-fit border-4 border-gray-800 group">
          <div className="w-[220px] h-[220px] flex items-center justify-center relative transition-transform duration-500 group-hover:scale-105">
            <img
              src={qrImageUrl}
              alt="QR Code to fosht.vercel.app"
              className="w-full h-full object-contain"
              crossOrigin="anonymous"
            />
          </div>
          <div className="absolute w-16 h-16 rounded-full bg-white flex items-center justify-center z-20 pointer-events-none shadow-[0_0_15px_rgba(0,0,0,0.2)] p-1">
            <img
              src="/fosht.png"
              alt="Logo"
              className="w-full h-full rounded-full object-cover border-2 border-teal-500"
            />
          </div>
        </div>

        <div className="text-center mb-8 bg-gray-950 p-3 rounded-xl border border-gray-800">
          <a
            href="https://fosht.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-400 font-medium hover:text-teal-300 hover:underline transition-colors flex items-center justify-center gap-2"
          >
            https://fosht.vercel.app
          </a>
        </div>

        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-teal-600 to-purple-600 hover:from-teal-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)] transform transition-all duration-200 hover:-translate-y-1 active:scale-95 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-2"
        >
          {isDownloading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memproses...
            </>
          ) : (
            'Unduh QR Code'
          )}
        </button>
      </div>
    </div>
  );
}