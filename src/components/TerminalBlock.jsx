'use client';

import React, { useState, useEffect } from 'react';

const TerminalBlock = () => {
  const [historyLines, setHistoryLines] = useState([
    "> system_check: initiated", 
    "> kernel: FOSHT_v1.0.4 loaded"
  ]);
  const [currentLine, setCurrentLine] = useState("");
  
  const commands = [
    "user: Function Override",
    "ident: Febri Osht (FOSHT)",
    "class: Function Override Specialist",
    "origin: Indonesia",
    "stack: [Next.js, React, Node]",
    "status: All Systems Operational",
    "action: Awaiting User Input..."
  ];

  useEffect(() => {
    let lineIndex = 0;
    let charIndex = 0;
    let isMounted = true;
    let typingTimeout;

    const typeLine = () => {
      if (!isMounted) return;

      const targetText = "> " + commands[lineIndex];
      
      if (charIndex < targetText.length) {
        setCurrentLine(targetText.slice(0, charIndex + 1));
        charIndex++;
        typingTimeout = setTimeout(typeLine, 30 + Math.random() * 30);
      } else {
        typingTimeout = setTimeout(() => {
          if (!isMounted) return;
          setHistoryLines(prev => {
            const newLines = [...prev, targetText];
            return newLines.slice(-5);
          });
          setCurrentLine("");
          charIndex = 0;
          lineIndex = (lineIndex + 1) % commands.length;
          typeLine();
        }, 1500);
      }
    };
    typingTimeout = setTimeout(typeLine, 1000);
    return () => {
      isMounted = false;
      clearTimeout(typingTimeout);
    };
  }, []);

  return (
    <div className="bg-[#0a0f1e] border border-gray-800 rounded-lg p-6 font-mono text-sm md:text-base shadow-2xl relative overflow-hidden group hover:border-cyan-500/50 transition-colors duration-300 min-h-[220px] flex flex-col justify-end">
      <div className="absolute top-0 left-0 w-full h-8 bg-[#111] flex items-center px-4 space-x-2 border-b border-gray-800">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className="ml-4 text-xs text-gray-500">function_override.exe - root</span>
      </div>
      <div className="mt-8 flex flex-col justify-end space-y-1">
        {historyLines.map((line, idx) => (
          <div key={idx} className="text-gray-400 break-words">{line}</div>
        ))}
        <div className="text-cyan-400 break-words">
          {currentLine}
          <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse align-middle"></span>
        </div>
      </div>
    </div>
  );
};

export default TerminalBlock;