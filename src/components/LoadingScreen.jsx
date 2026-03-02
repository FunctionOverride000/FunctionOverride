'use client';

import React, { useState, useEffect } from 'react';

const LoadingScreen = ({ onComplete }) => {
  const [lines, setLines] = useState([]);
  const [accessGranted, setAccessGranted] = useState(false);

  useEffect(() => {
    const bootSequence = [
      "Initializing FOSHT Kernel...",
      "Connecting to Neural Network...",
      "Optimizing Interface...",
      "System Ready."
    ];

    let delay = 0;
    bootSequence.forEach((line, index) => {
      delay += Math.random() * 300 + 200;
      setTimeout(() => {
        setLines(prev => [...prev, line]);
        if (index === bootSequence.length - 1) {
          setTimeout(() => setAccessGranted(true), 500);
          setTimeout(onComplete, 1500);
        }
      }, delay);
    });
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 bg-[#050505] z-50 flex flex-col items-center justify-center font-mono transition-opacity duration-1000 ${accessGranted ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="w-full max-w-md p-6">
        {lines.map((line, i) => (
          <div key={i} className="text-green-500 text-sm mb-1 opacity-80">
            <span className="mr-2 text-cyan-500">{`>`}</span>
            {line}
          </div>
        ))}
        <div className="h-4 w-2 bg-green-500 animate-pulse mt-2 inline-block"></div>
      </div>
      
      {accessGranted && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90">
          <div className="text-4xl font-bold text-cyan-400 border-2 border-cyan-400 p-4 neon-text-glow animate-bounce">
            ACCESS GRANTED
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingScreen;