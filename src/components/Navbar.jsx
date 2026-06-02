'use client';

import React, { memo, useState } from 'react';
import { Shield, Languages, BookOpen, X, Menu, ExternalLink } from 'lucide-react';

const Navbar = ({ currentView, setCurrentView, lang, toggleLang, t }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { key: 'dashboard', label: t.nav.dashboard, onClick: () => { setCurrentView('dashboard'); setMobileOpen(false); }, href: null },
    { key: 'modules',   label: t.nav.modules,   onClick: () => { setCurrentView('dashboard'); setMobileOpen(false); }, href: '#modules' },
    { key: 'logs',      label: t.nav.logs,       onClick: () => { setCurrentView('dashboard'); setMobileOpen(false); }, href: '#logs' },
    { key: 'whoami',    label: t.nav.whoami,     onClick: () => { setCurrentView('dashboard'); setMobileOpen(false); }, href: '#whoami' },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-40 bg-[#050505]/80 backdrop-blur-md border-b border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => { setCurrentView('dashboard'); setMobileOpen(false); }}
          >
            <Shield className="w-6 h-6 text-cyan-400" />
            <span className="font-mono font-bold text-xl tracking-tighter text-white">
              <span className="text-cyan-400">FUNCTION OVERRIDE</span> SHIFT
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-8 text-sm font-mono text-gray-400">
              {navLinks.map(link => (
                link.href
                  ? <a key={link.key} href={link.href} onClick={link.onClick}
                      className={`interactive hover:text-cyan-400 transition-colors ${currentView === link.key ? 'text-white' : ''}`}>
                      {link.label}
                    </a>
                  : <button key={link.key} onClick={link.onClick}
                      className={`interactive hover:text-cyan-400 transition-colors ${currentView === link.key ? 'text-white' : ''}`}>
                      {link.label}
                    </button>
              ))}

              {/* Blog link */}
              <a
                href="/blog"
                className="interactive hover:text-cyan-400 transition-colors flex items-center gap-1.5 text-gray-400"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Blog
              </a>
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

          {/* Status + hamburger (mobile) */}
          <div className="flex items-center gap-4">
            <div className="text-xs font-mono text-[#ff9100] animate-pulse flex items-center">
              <span className="mr-2">●</span>
              <span className="hidden sm:inline">{t.nav.status}</span>
            </div>

            {/* Hamburger — mobile only */}
            <button
              className="md:hidden text-gray-400 hover:text-cyan-400 transition-colors p-1"
              onClick={() => setMobileOpen(p => !p)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── MOBILE DRAWER — slide from right ── */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-[#050505] border-l border-gray-800 flex flex-col transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800">
          <span className="font-mono text-xs text-cyan-400 tracking-[3px]">NAVIGATION</span>
          <button onClick={() => setMobileOpen(false)} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav links */}
        <div className="flex-1 overflow-y-auto py-6 px-6 space-y-1">
          {navLinks.map(link => (
            link.href
              ? <a key={link.key} href={link.href} onClick={link.onClick}
                  className={`flex items-center w-full text-sm font-mono px-3 py-3 rounded-sm transition-all ${
                    currentView === link.key
                      ? 'text-white bg-cyan-500/10 border border-cyan-500/20'
                      : 'text-gray-500 hover:text-white hover:bg-gray-900'
                  }`}>
                  {link.label}
                </a>
              : <button key={link.key} onClick={link.onClick}
                  className={`flex items-center w-full text-sm font-mono px-3 py-3 rounded-sm transition-all ${
                    currentView === link.key
                      ? 'text-white bg-cyan-500/10 border border-cyan-500/20'
                      : 'text-gray-500 hover:text-white hover:bg-gray-900'
                  }`}>
                  {link.label}
                </button>
          ))}

          {/* Blog */}
          <a
            href="/blog"
            className="flex items-center gap-2 w-full text-sm font-mono px-3 py-3 rounded-sm text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/5 transition-all border border-transparent hover:border-cyan-500/20"
          >
            <BookOpen className="w-4 h-4" />
            Blog
            <ExternalLink className="w-3 h-3 ml-auto opacity-40" />
          </a>
        </div>

        {/* Drawer footer */}
        <div className="px-6 py-5 border-t border-gray-800 space-y-3">
          {/* Lang toggle */}
          <button
            onClick={() => { toggleLang(); }}
            className="flex items-center gap-2 w-full text-xs font-mono border border-gray-700 rounded-sm px-3 py-2 text-gray-500 hover:border-cyan-400 hover:text-cyan-400 transition-all"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>Language</span>
            <span className="ml-auto text-cyan-500 font-bold">{lang === 'en' ? 'EN' : 'ID'}</span>
          </button>

          {/* Status */}
          <div className="flex items-center gap-2 text-xs font-mono text-[#ff9100]">
            <span className="animate-pulse">●</span>
            <span className="opacity-70">{t.nav.status}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(Navbar);