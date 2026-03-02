'use client';

import React, { useState, useEffect, useRef } from 'react';

const TerminalHeader = ({ 
  onComplete, 
  path = "/personal", 
  command = "ls -all", 
  successMsg = "modules found" 
}) => {
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [step, setStep] = useState(0); // 0: mengetik baris 1, 1: jeda, 2: mengetik baris 2, 3: selesai
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Mencegah animasi ulang jika sudah selesai (penting untuk React Strict Mode / navigasi balik)
    if (hasAnimated.current) {
        if (onComplete) onComplete(); // Pastikan konten tampil jika sudah pernah animasi
        return;
    }

    const cmd1 = `cd ${path}`;
    const cmd2 = command;
    let index = 0;
    let timeout;

    const getTypingDelay = () => Math.random() * 40 + 20;

    const typeLine1 = () => {
      if (index <= cmd1.length) {
        setLine1(cmd1.slice(0, index));
        index++;
        timeout = setTimeout(typeLine1, getTypingDelay());
      } else {
        setTimeout(() => {
          setStep(1);
          index = 0;
          setTimeout(typeLine2, 300);
        }, 200);
      }
    };

    const typeLine2 = () => {
      setStep(2);
      if (index <= cmd2.length) {
        setLine2(cmd2.slice(0, index));
        index++;
        timeout = setTimeout(typeLine2, getTypingDelay());
      } else {
        setTimeout(() => {
          setStep(3);
          hasAnimated.current = true;
          if (onComplete) onComplete();
        }, 300);
      }
    };

    timeout = setTimeout(typeLine1, 400);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="font-mono text-sm md:text-base space-y-2 mb-12 min-h-[100px]">
      {/* Prompt 1 */}
      <div className="flex items-center text-gray-400">
        <span className="text-green-500 font-bold mr-2">guest@fosht:~$</span>
        <span className="text-white">{line1}</span>
        {step === 0 && <span className="cursor-blink"></span>}
      </div>

      {/* Prompt 2 */}
      {step >= 1 && (
        <div className="flex items-center text-gray-400">
          <span className="text-green-500 font-bold">guest@fosht:</span>
          {/* Path diwarnai biru sesuai tema terminal Linux umum */}
          <span className="text-blue-500 font-bold mr-2">{path}$</span>
          <span className="text-white">{line2}</span>
          {step === 2 && <span className="cursor-blink"></span>}
        </div>
      )}

      {/* Status Output */}
      {step >= 3 && (
        <div className="pt-2 text-gray-400 animate-pulse">
          Scanning directory... <span className="text-green-500">{successMsg}.</span>
        </div>
      )}
    </div>
  );
};

export default TerminalHeader;