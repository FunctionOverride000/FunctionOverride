'use client';

import React from 'react';

const Footer = ({ t }) => {
  return (
    <footer className="relative z-10 py-8 border-t border-gray-900 bg-[#020202]">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-xs font-mono text-gray-600">
        <div>
          &copy; 2026 FUNCTION OVERRIDE SHIFT (FOSHT). {t.footer.copyright}
        </div>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a 
            href="https://github.com/FebriOsht" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="interactive hover:text-cyan-400 cursor-pointer transition-colors"
          >
            GITHUB
          </a>
          <a 
            href="https://discord.gg/zKjFNZdM" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="interactive hover:text-cyan-400 cursor-pointer transition-colors"
          >
            DISCORD
          </a>
          <a 
            href="https://chatglobal.fosht.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="interactive hover:text-cyan-400 cursor-pointer transition-colors"
          >
            CHAT GLOBAL
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;