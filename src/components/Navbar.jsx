'use client';

import React from 'react';
import { Shield, Languages } from 'lucide-react';

const Navbar = ({ currentView, setCurrentView, lang, toggleLang, t }) => {
  return (
    <nav className="fixed top-0 w-full z-40 bg-[#050505]/80 backdrop-blur-md border-b border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
            <Shield className="w-6 h-6 text-cyan-400" />
            <span className="font-mono font-bold text-xl tracking-tighter text-white"><span className="text-cyan-400">FUNCTION OVERRIDE</span> SHIFT</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <div className="flex space-x-8 text-sm font-mono text-gray-400">
            <button onClick={() => setCurrentView('dashboard')} className={`interactive hover:text-cyan-400 transition-colors ${currentView === 'dashboard' ? 'text-white' : ''}`}>{t.nav.dashboard}</button>
            <a href="#modules" className="interactive hover:text-cyan-400 transition-colors" onClick={() => setCurrentView('dashboard')}>{t.nav.modules}</a>
            <a href="#logs" className="interactive hover:text-cyan-400 transition-colors" onClick={() => setCurrentView('dashboard')}>{t.nav.logs}</a>
            <a href="#whoami" className="interactive hover:text-cyan-400 transition-colors" onClick={() => setCurrentView('dashboard')}>{t.nav.whoami}</a>
          </div>
          
          <div className="flex items-center border-l border-gray-700 pl-6 space-x-3">
            <button 
              onClick={toggleLang}
              className="interactive flex items-center space-x-2 text-xs font-mono border border-gray-700 rounded px-2 py-1 hover:border-cyan-400 hover:text-cyan-400 transition-all"
            >
              <Languages className="w-3 h-3" />
              <span>{lang === 'en' ? 'EN' : 'ID'}</span>
            </button>
          </div>
        </div>
        
        <div className="text-xs font-mono text-[#ff9100] animate-pulse flex items-center">
          <span className="mr-2">●</span> {t.nav.status}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;