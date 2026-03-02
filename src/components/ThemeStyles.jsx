'use client';

import React from 'react';

const ThemeStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=JetBrains+Mono:wght@400;700&display=swap');

    body {
      background-color: #050505;
      color: #e0e0e0;
      font-family: 'Inter', sans-serif;
      overflow-x: hidden;
      cursor: none;
    }

    .font-mono { font-family: 'JetBrains Mono', monospace; }

    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #0a0f1e; }
    ::-webkit-scrollbar-thumb { background: #00f3ff; border-radius: 4px; }

    .neon-glow { box-shadow: 0 0 10px rgba(0, 243, 255, 0.5), 0 0 20px rgba(0, 243, 255, 0.3); }
    .neon-text-glow { text-shadow: 0 0 5px rgba(0, 243, 255, 0.7); }
    
    .custom-cursor {
      position: fixed;
      top: 0; left: 0;
      width: 32px; height: 32px;
      pointer-events: none;
      z-index: 9999;
      mix-blend-mode: difference;
      transform: translate(-50%, -50%);
      transition: width 0.2s, height 0.2s, background-color 0.2s; 
    }

    @keyframes matrix-fade {
      0% { opacity: 0; transform: translateY(-20px); }
      20% { opacity: 1; }
      100% { opacity: 0; transform: translateY(100vh); }
    }
    .matrix-char { animation: matrix-fade 2s linear infinite; }

    .reveal {
      opacity: 0; transform: translateY(30px);
      transition: opacity 0.8s ease-out, transform 0.8s ease-out;
    }
    .reveal.active { opacity: 1; transform: translateY(0); }
    
    @keyframes modal-in {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-modal { animation: modal-in 0.2s ease-out forwards; }

    .page-enter {
      opacity: 0; transform: scale(0.98);
      animation: modal-in 0.3s ease-out forwards;
    }

    input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, 
    textarea:-webkit-autofill, textarea:-webkit-autofill:hover, textarea:-webkit-autofill:focus {
      -webkit-text-fill-color: #e0e0e0;
      -webkit-box-shadow: 0 0 0px 1000px #050a15 inset;
      transition: background-color 5000s ease-in-out 0s;
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
  `}</style>
);

export default ThemeStyles;