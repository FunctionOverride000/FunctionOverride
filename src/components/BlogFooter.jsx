'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Facebook, Linkedin, Link2, Mail,
  Github, Instagram, Check, ArrowUpRight,
  Terminal, Send
} from 'lucide-react';

export default function BlogFooter({ title, slug }) {
  const [copied, setCopied] = useState(false);

  const url       = `https://fosht.vercel.app/blog/${slug}`;
  const encoded   = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title || 'FOSHT Blog');

  const shareLinks = [
    {
      name: 'X (Twitter)',
      icon: <span style={{ fontWeight: 900, fontSize: 14, lineHeight: 1 }}>𝕏</span>,
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`,
      color: '#e7e9ea',
    },
    {
      name: 'Facebook',
      icon: <Facebook className="w-4 h-4" />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      color: '#1877f2',
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin className="w-4 h-4" />,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
      color: '#0a66c2',
    },
    {
      name: 'Telegram',
      icon: <Send className="w-4 h-4" />,
      href: `https://t.me/share/url?url=${encoded}&text=${encodedTitle}`,
      color: '#26a5e4',
    },
    {
      name: 'Email',
      icon: <Mail className="w-4 h-4" />,
      href: `mailto:?subject=${encodedTitle}&body=Baca artikel ini: ${url}`,
      color: '#00f3ff',
    },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <footer className="mt-20 font-mono">

      {/* ── SHARE SECTION ── */}
      <div className="border border-gray-800 bg-[#0a0f1e]/60 rounded-sm p-6 mb-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-800" />
          <span className="text-[10px] text-gray-600 tracking-[3px] uppercase">Bagikan Artikel</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-800" />
        </div>

        {/* Share buttons */}
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {shareLinks.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              title={`Share ke ${s.name}`}
              className="group flex items-center gap-2 px-4 py-2 border border-gray-800 rounded-sm text-xs text-gray-500 hover:text-white transition-all duration-200 hover:border-opacity-60"
              style={{ '--share-color': s.color }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = s.color + '66';
                e.currentTarget.style.background = s.color + '11';
                e.currentTarget.style.color = s.color;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '';
                e.currentTarget.style.background = '';
                e.currentTarget.style.color = '';
              }}
            >
              {s.icon}
              <span className="hidden sm:inline">{s.name}</span>
            </a>
          ))}

          {/* Copy link */}
          <button
            onClick={copyLink}
            className="flex items-center gap-2 px-4 py-2 border border-gray-800 rounded-sm text-xs transition-all duration-200"
            style={{
              color: copied ? '#22c55e' : '#6b7280',
              borderColor: copied ? '#22c55e66' : '',
              background: copied ? '#22c55e11' : '',
            }}
            onMouseEnter={e => {
              if (!copied) {
                e.currentTarget.style.borderColor = '#00f3ff44';
                e.currentTarget.style.background = '#00f3ff11';
                e.currentTarget.style.color = '#00f3ff';
              }
            }}
            onMouseLeave={e => {
              if (!copied) {
                e.currentTarget.style.borderColor = '';
                e.currentTarget.style.background = '';
                e.currentTarget.style.color = '';
              }
            }}
          >
            {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
            <span>{copied ? 'Tersalin!' : 'Copy Link'}</span>
          </button>
        </div>

        {/* URL display */}
        <div className="flex items-center gap-2 bg-black/40 border border-gray-900 rounded-sm px-3 py-2">
          <span className="text-gray-700 text-xs truncate flex-1 select-all">{url}</span>
          <button onClick={copyLink} className="text-gray-700 hover:text-cyan-400 transition-colors shrink-0">
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Link2 className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* ── AUTHOR CARD ── */}
      <div className="border border-gray-800 rounded-sm p-6 mb-6 flex flex-col sm:flex-row gap-5 items-start">

        {/* Avatar glow */}
        <div className="relative shrink-0">
          <div className="w-14 h-14 rounded-sm bg-[#0a0f1e] border border-cyan-500/30 flex items-center justify-center overflow-hidden">
            <img src="/fosht.png" alt="Febriansyah" className="w-10 h-10 object-contain opacity-90" />
          </div>
          <div className="absolute inset-0 rounded-sm bg-cyan-500/10 blur-sm -z-10" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-bold text-sm">Febriansyah S.Kom</span>
            <span className="text-[10px] text-cyan-500 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-sm tracking-widest">AUTHOR</span>
          </div>
          <p className="text-gray-500 text-xs leading-relaxed mb-3">
            Web Developer & AI Prompt Specialist berbasis di Lampung, Indonesia. Membangun ekosistem digital melalui FOSHT, Oshtore, dan Crypto Directory Indonesia.
          </p>

          {/* Social links */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { href: 'https://fosht.vercel.app', label: 'Portfolio', icon: <Terminal className="w-3 h-3" /> },
              { href: 'https://github.com/FebriOsht', label: 'GitHub', icon: <Github className="w-3 h-3" /> },
              { href: 'https://instagram.com/03.febriansyah', label: 'Instagram', icon: <Instagram className="w-3 h-3" /> },
              { href: 'https://linkedin.com/in/febriansyah-347b112a4', label: 'LinkedIn', icon: <Linkedin className="w-3 h-3" /> },
              { href: 'https://x.com/babyybossssss', label: 'X', icon: <span style={{ fontWeight: 900, fontSize: 11, lineHeight: 1 }}>𝕏</span> },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[11px] text-gray-600 hover:text-cyan-400 transition-colors border border-gray-800 hover:border-cyan-500/30 px-2.5 py-1 rounded-sm">
                {s.icon}
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── BACK TO BLOG + BRANDING ── */}
      <div className="flex items-center justify-between py-4 border-t border-gray-900">
        <Link href="/blog"
          className="text-xs text-gray-600 hover:text-cyan-400 transition-colors flex items-center gap-1.5 group">
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
          Semua Artikel
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <img src="/fosht.png" alt="FOSHT" className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
            <span className="text-[10px] text-gray-700 group-hover:text-cyan-500 transition-colors tracking-[3px]">FOSHT.SYS</span>
          </Link>
          <a href="https://fosht.vercel.app" target="_blank" rel="noopener noreferrer"
            className="text-gray-800 hover:text-cyan-500 transition-colors">
            <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
      </div>

    </footer>
  );
}