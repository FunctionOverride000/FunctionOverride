'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Mail, Phone, MapPin, Linkedin, Globe, 
  Briefcase, GraduationCap, Code, Sparkles, 
  FolderKanban, User, CheckCircle2, Download, ArrowRight, 
  ShieldCheck, ShoppingCart, ChevronDown, X, FileText
} from 'lucide-react';

export default function App() {
  const [showCVModal, setShowCVModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-300 font-sans selection:bg-teal-500/30 overflow-x-hidden pb-20">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.92) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in-left { animation: fadeInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in-right { animation: fadeInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-spin-slow { animation: spinSlow 8s linear infinite; }
        .animate-glow { animation: glowPulse 3s ease-in-out infinite; }
        .animate-modal-in { animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        .delay-500 { animation-delay: 500ms; }

        /* Mobile timeline fix */
        @media (max-width: 768px) {
          .timeline-line { display: none; }
        }
      `}} />

      {/* CV Download Modal */}
      {showCVModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setShowCVModal(false)}
        >
          <div className="animate-modal-in bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-[0_0_40px_rgba(20,184,166,0.2)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-100">Pilih Versi CV</h3>
              <button onClick={() => setShowCVModal(false)} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-200 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-3">
              <a
                href="/CV_Febriansyah2026_v3.pdf"
                download="CV_Febriansyah2026_v3.pdf"
                onClick={() => setShowCVModal(false)}
                className="flex items-center gap-4 w-full p-4 bg-gray-800 hover:bg-teal-500/10 border border-gray-700 hover:border-teal-500/50 rounded-xl transition-all duration-300 group"
              >
                <div className="p-2.5 bg-teal-500/20 rounded-lg group-hover:bg-teal-500/30 transition-colors">
                  <FileText size={20} className="text-teal-400" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-100 group-hover:text-teal-400 transition-colors">🇮🇩 Bahasa Indonesia</p>
                  <p className="text-xs text-gray-500">CV_Febriansyah_2026_v2.pdf</p>
                </div>
                <Download size={16} className="text-gray-500 group-hover:text-teal-400 ml-auto transition-colors" />
              </a>

              <a
                href="/CV_Febriansyah_2026_v3_EN.pdf"
                download="CV_Febriansyah_2026_v3_EN.pdf"
                onClick={() => setShowCVModal(false)}
                className="flex items-center gap-4 w-full p-4 bg-gray-800 hover:bg-blue-500/10 border border-gray-700 hover:border-blue-500/50 rounded-xl transition-all duration-300 group"
              >
                <div className="p-2.5 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                  <FileText size={20} className="text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-100 group-hover:text-blue-400 transition-colors">🇬🇧 English</p>
                  <p className="text-xs text-gray-500">CV_Febriansyah_2026_v2_EN.pdf</p>
                </div>
                <Download size={16} className="text-gray-500 group-hover:text-blue-400 ml-auto transition-colors" />
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-10 lg:p-16">
        
        {/* Header Section */}
        <header className="mb-12 border-b border-gray-800/80 pb-10 opacity-0 animate-fade-in-up">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              
              {/* Foto Profil */}
              <div className="shrink-0 relative group p-1.5 animate-float">
                <div className="absolute inset-0 bg-gradient-to-tr from-teal-400 via-blue-500 to-purple-600 rounded-full animate-spin-slow blur-[3px] opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-1 bg-gray-950 rounded-full z-0"></div>
                <div className="relative z-10 w-28 h-28 sm:w-36 sm:h-36 rounded-full border-[3px] border-gray-900 shadow-[0_0_30px_rgba(56,189,248,0.2)] overflow-hidden bg-gray-800 transition-transform duration-500 group-hover:scale-105">
                  <img 
                    src="/Febriansyah.jpeg" 
                    alt="Febriansyah" 
                    className="w-full h-full object-cover object-top scale-110 transition-transform duration-700 group-hover:scale-125"
                  />
                </div>
              </div>
              
              <div className="flex flex-col justify-center">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-blue-400 to-indigo-400 mb-2">
                  Febriansyah S.Kom
                </h1>
                <p className="text-lg sm:text-xl font-medium text-gray-400 flex items-center justify-center sm:justify-start gap-2">
                  <Sparkles size={18} className="text-amber-400 animate-pulse shrink-0" />
                  Web Developer & AI Prompt Specialist
                </p>
                {/* Contact info inline for mobile */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 mt-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><MapPin size={11} className="text-teal-500" /> Tulang Bawang, Lampung, ID</span>
                  <a href="https://wa.me/6282371542230" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-teal-400 transition-colors"><Phone size={11} className="text-teal-500" /> 0823-7154-2230</a>
                </div>
              </div>
            </div>
            
            {/* Quick Contact & Download */}
            <div className="flex flex-col items-center lg:items-end gap-3 text-sm text-gray-400">
              <a href="mailto:febbriansyah01@gmail.com" className="flex items-center gap-2 hover:text-teal-400 transition-all hover:scale-105">
                <div className="p-1.5 bg-gray-900 rounded-md"><Mail size={13} className="text-teal-500" /></div> febbriansyah01@gmail.com
              </a>
              <a href="https://fosht.vercel.app" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-teal-400 transition-all hover:scale-105">
                <div className="p-1.5 bg-gray-900 rounded-md"><Globe size={13} className="text-teal-500" /></div> fosht.vercel.app
              </a>
              <a href="https://linkedin.com/in/febriansyah-347b112a4" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-teal-400 transition-all hover:scale-105">
                <div className="p-1.5 bg-gray-900 rounded-md"><Linkedin size={13} className="text-teal-500" /></div> linkedin.com/in/febriansyah-347b112a4
              </a>
              
              {/* Tombol Download CV dengan pilihan */}
              <button 
                onClick={() => setShowCVModal(true)}
                className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)] hover:-translate-y-1 active:scale-95 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                <Download size={16} className="group-hover:animate-bounce relative z-10" />
                <span className="relative z-10">Download CV Terbaru</span>
                <ChevronDown size={14} className="relative z-10 opacity-70" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mb-16">
          
          {/* Kolom Kiri */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Profil Profesional */}
            <section className="opacity-0 animate-fade-in-left delay-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-teal-500/10 rounded-xl border border-teal-500/20">
                  <User className="text-teal-400" size={20} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-100 tracking-wide">Profil Profesional</h2>
              </div>
              <p className="text-gray-400 leading-relaxed text-justify hover:text-gray-300 transition-colors duration-300 text-base bg-gray-900/30 p-5 rounded-2xl border border-gray-800/50">
                Web Developer dan AI Prompt Specialist dengan latar belakang Teknik Informatika (IPK 3.71). Portofolio mencakup pengembangan sistem Full Stack untuk startup hingga Landing Page untuk digitalisasi UMKM. Kompeten menggabungkan keahlian teknis (Coding & AI Automation) dengan wawasan marketing digital. Terbiasa bekerja independen maupun kolaboratif, fokus pada solusi digital efisien dan berdampak nyata bagi pertumbuhan bisnis klien.
              </p>
            </section>

            {/* Pengalaman Kerja */}
            <section className="opacity-0 animate-fade-in-left delay-200">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <Briefcase className="text-blue-400" size={20} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-100 tracking-wide">Pengalaman Kerja</h2>
              </div>
              
              <div className="space-y-5">

                {/* Experience 1 */}
                <div className="group p-5 rounded-2xl bg-gray-900 border border-gray-800 border-l-4 border-l-blue-500 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(59,130,246,0.1)]">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-gray-100 group-hover:text-blue-400 transition-colors text-base sm:text-lg">Full Stack Web Developer & Marketing Staff</h3>
                    <span className="text-xs font-semibold text-blue-300 bg-blue-500/20 border border-blue-500/30 px-2.5 py-1 rounded-full shrink-0">2025 – 2026</span>
                  </div>
                  <h4 className="text-sm font-medium text-gray-400 mb-4">Swakarsa Digital (Startup), Bandar Lampung</h4>
                  <ul className="space-y-2.5 text-sm text-gray-400">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 size={15} className="text-blue-500 shrink-0 mt-0.5" />
                      <span><strong className="text-gray-300">Web Development:</strong> Memimpin pengembangan website resmi dari konsep hingga deployment menggunakan React.js dan Node.js.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 size={15} className="text-blue-500 shrink-0 mt-0.5" />
                      <span><strong className="text-gray-300">Optimasi Sistem:</strong> Mengelola Frontend (UI/UX) responsif dan Backend yang aman di berbagai perangkat.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 size={15} className="text-blue-500 shrink-0 mt-0.5" />
                      <span><strong className="text-gray-300">AI Integration:</strong> Mengimplementasikan AI-Driven Workflow (DeepSeek, ChatGPT, Claude, Gemini, Grok) untuk mempercepat debugging hingga 40% dan otomasi konten marketing.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 size={15} className="text-blue-500 shrink-0 mt-0.5" />
                      <span><strong className="text-gray-300">Growth Marketing:</strong> Merancang strategi kampanye digital terintegrasi untuk meningkatkan traffic dan brand awareness.</span>
                    </li>
                  </ul>
                </div>

                {/* Experience 2 */}
                <div className="group p-5 rounded-2xl bg-gray-900 border border-gray-800 border-l-4 border-l-teal-500 hover:border-teal-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(20,184,166,0.1)]">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-gray-100 group-hover:text-teal-400 transition-colors text-base sm:text-lg">Freelance Web Developer (UMKM & Bisnis)</h3>
                    <span className="text-xs font-semibold text-teal-300 bg-teal-500/20 border border-teal-500/30 px-2.5 py-1 rounded-full shrink-0">2022 – Sekarang</span>
                  </div>
                  <h4 className="text-sm font-medium text-gray-400 mb-4">Self-Employed, Remote/Hybrid</h4>
                  <ul className="space-y-2.5 text-sm text-gray-400">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 size={15} className="text-teal-500 shrink-0 mt-0.5" />
                      <span><strong className="text-gray-300">Landing Page Specialist:</strong> Merancang Landing Page berorientasi konversi (Sales Funnel) untuk berbagai klien UMKM.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 size={15} className="text-teal-500 shrink-0 mt-0.5" />
                      <span><strong className="text-gray-300">Client Relations:</strong> Berkonsultasi langsung dengan klien, menerjemahkan kebutuhan bisnis menjadi solusi teknis tepat guna.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 size={15} className="text-teal-500 shrink-0 mt-0.5" />
                      <span><strong className="text-gray-300">SEO & Performance:</strong> Mengoptimalkan kecepatan website dan struktur SEO agar mudah ditemukan di mesin pencari.</span>
                    </li>
                  </ul>
                </div>

                {/* Experience 3 */}
                <div className="group p-5 rounded-2xl bg-gray-900 border border-gray-800 border-l-4 border-l-indigo-500 hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(99,102,241,0.1)]">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-gray-100 group-hover:text-indigo-400 transition-colors text-base sm:text-lg">Graphic Designer & Administrator</h3>
                    <span className="text-xs font-semibold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-1 rounded-full shrink-0">2025</span>
                  </div>
                  <h4 className="text-sm font-medium text-gray-400 mb-4">Toko Material Bintang Terang Makmur, Bandar Lampung</h4>
                  <ul className="space-y-2.5 text-sm text-gray-400">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 size={15} className="text-indigo-500 shrink-0 mt-0.5" />
                      <span><strong className="text-gray-300">Desain Visual:</strong> Merancang materi visual promosi yang meningkatkan engagement pelanggan.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 size={15} className="text-indigo-500 shrink-0 mt-0.5" />
                      <span><strong className="text-gray-300">CNC Designer:</strong> Merancang pola dan desain cutting CNC untuk kebutuhan material dan produksi.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 size={15} className="text-indigo-500 shrink-0 mt-0.5" />
                      <span><strong className="text-gray-300">Administrasi:</strong> Mengelola inventaris dan laporan keuangan harian dengan akurasi tinggi.</span>
                    </li>
                  </ul>
                </div>

              </div>
            </section>
          </div>

          {/* Kolom Kanan */}
          <div className="space-y-10">
            
            {/* Pendidikan */}
            <section className="opacity-0 animate-fade-in-right delay-200">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <GraduationCap className="text-amber-400" size={20} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-100 tracking-wide">Pendidikan</h2>
              </div>
              <div className="space-y-4">
                <div className="group p-5 rounded-2xl bg-gray-900 border border-gray-800 border-l-4 border-l-amber-500 hover:border-amber-500/50 hover:bg-gray-800/80 transition-all duration-300 hover:-translate-y-1">
                  <h3 className="font-bold text-gray-100 group-hover:text-amber-400 transition-colors text-sm sm:text-base mb-2">Institut Informatika dan Bisnis Darmajaya</h3>
                  <p className="text-xs font-semibold text-amber-400 bg-amber-500/10 inline-block px-2.5 py-1 rounded-md mb-2">S1 Teknik Informatika • IPK: 3.71</p>
                  <p className="text-xs text-gray-400 font-medium mb-1">Bandar Lampung • 2021 – 2025</p>
                  <p className="text-xs text-gray-500 leading-relaxed">Peminatan: Mobile Programming (Android/Flutter). OOP & arsitektur perangkat lunak.</p>
                </div>
                <div className="group p-5 rounded-2xl bg-gray-900 border border-gray-800 border-l-4 border-l-gray-600 hover:border-gray-500/50 transition-all duration-300 hover:-translate-y-1">
                  <h3 className="font-bold text-gray-100 group-hover:text-gray-300 transition-colors text-sm sm:text-base mb-2">SMAN 01 Banjar Agung</h3>
                  <p className="text-xs font-semibold text-gray-300 bg-gray-800 inline-block px-2.5 py-1 rounded-md mb-2">Ilmu Pengetahuan Sosial (IPS)</p>
                  <p className="text-xs text-gray-500 font-medium mb-1">Tulang Bawang • 2018 – 2021</p>
                  <p className="text-xs text-gray-500 leading-relaxed">Pondasi ilmu sosial & ekonomi — analisis pasar & perilaku konsumen.</p>
                </div>
              </div>
            </section>

            {/* Keahlian */}
            <section className="opacity-0 animate-fade-in-right delay-300">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/20">
                  <Code className="text-rose-400" size={20} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-100 tracking-wide">Keahlian & Tools</h2>
              </div>
              
              <div className="space-y-6 bg-gray-900 p-5 rounded-2xl border border-gray-800">
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <Code size={13} className="text-rose-500" /> Web Development
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {['HTML5', 'CSS3', 'JavaScript', 'React.js', 'Tailwind CSS', 'Node.js', 'API Integration', 'SEO', 'Web Performance'].map((skill) => (
                      <span key={skill} className="px-2.5 py-1 text-xs font-medium bg-gray-950 text-gray-300 rounded-lg border border-gray-700 hover:border-rose-500 hover:text-rose-400 hover:-translate-y-0.5 transition-all duration-200 cursor-default">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-5">
                  <h3 className="text-xs font-semibold text-gray-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <Sparkles size={13} className="text-rose-500" /> AI Specialist
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {['ChatGPT', 'Gemini', 'Claude', 'DeepSeek', 'Grok', 'Prompt Engineering', 'AI Debugging', 'Content Automation'].map((skill) => (
                      <span key={skill} className="px-2.5 py-1 text-xs font-medium bg-rose-500/10 text-rose-300 rounded-lg border border-rose-500/30 hover:bg-rose-500/20 hover:-translate-y-0.5 transition-all duration-200 cursor-default">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-5">
                  <h3 className="text-xs font-semibold text-gray-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <FolderKanban size={13} className="text-rose-500" /> Design & Tools
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {['Git/GitHub', 'Vercel', 'VS Code', 'Canva', 'CorelDraw', 'Photoshop', 'CapCut', 'Microsoft Office'].map((skill) => (
                      <span key={skill} className="px-2.5 py-1 text-xs font-medium bg-gray-950 text-gray-300 rounded-lg border border-gray-700 hover:border-rose-500 hover:text-rose-400 hover:-translate-y-0.5 transition-all duration-200 cursor-default">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-5">
                  <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Bahasa</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-300">🇮🇩 Indonesia</span>
                      <span className="text-teal-400 font-medium">Native</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-300">🇬🇧 English</span>
                      <span className="text-gray-400">Pasif (Dokumentasi Teknis)</span>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="pt-4 border-t border-gray-800 flex gap-3">
                  <a href="https://linkedin.com/in/febriansyah-347b112a4" target="_blank" rel="noreferrer" className="p-3 bg-gray-950 border border-gray-800 rounded-xl hover:bg-[#0A66C2] hover:border-[#0A66C2] hover:-translate-y-1 hover:text-white transition-all duration-300 text-gray-400 hover:shadow-[0_8px_20px_rgba(10,102,194,0.4)]">
                    <Linkedin size={18} />
                  </a>
                  <a href="https://fosht.vercel.app" target="_blank" rel="noreferrer" className="p-3 bg-gray-950 border border-gray-800 rounded-xl hover:bg-teal-600 hover:border-teal-600 hover:-translate-y-1 hover:text-white transition-all duration-300 text-gray-400 hover:shadow-[0_8px_20px_rgba(20,184,166,0.4)]">
                    <Globe size={18} />
                  </a>
                  <a href="mailto:febbriansyah01@gmail.com" className="p-3 bg-gray-950 border border-gray-800 rounded-xl hover:bg-rose-600 hover:border-rose-600 hover:-translate-y-1 hover:text-white transition-all duration-300 text-gray-400 hover:shadow-[0_8px_20px_rgba(225,29,72,0.4)]">
                    <Mail size={18} />
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Proyek Utama - TIDAK DIUBAH sesuai permintaan */}
        <section className="opacity-0 animate-fade-in-up delay-400 pt-8 border-t border-gray-800/80">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20 group hover:rotate-[360deg] transition-transform duration-1000">
              <FolderKanban className="text-purple-400" size={22} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 tracking-wide">Proyek Utama</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div className="group relative p-5 rounded-2xl bg-gray-900 border border-gray-800 hover:border-purple-500/60 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_30px_-5px_rgba(168,85,247,0.2)] flex flex-col overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <h3 className="font-bold text-base text-gray-100 mb-3 group-hover:text-purple-400 transition-colors relative z-10">Swakarsa Digital</h3>
              <p className="text-sm text-gray-400 mb-5 flex-grow leading-relaxed relative z-10">Website profil perusahaan startup yang dinamis, cepat, dan responsif dikembangkan menggunakan ekosistem Full Stack.</p>
              <div className="flex items-center justify-between mt-auto relative z-10 pt-4 border-t border-gray-800/60">
                <span className="text-xs font-semibold text-gray-500 bg-gray-800 px-2 py-1 rounded">2025</span>
                <a href="https://swakarsadigital.vercel.app" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-medium text-purple-400 hover:text-purple-300 group-hover:translate-x-1 transition-transform">
                  <Globe size={13}/> Kunjungi
                </a>
              </div>
            </div>

            <div className="group relative p-5 rounded-2xl bg-gray-900 border border-gray-800 hover:border-emerald-500/60 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_30px_-5px_rgba(16,185,129,0.2)] flex flex-col overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <h3 className="font-bold text-base text-gray-100 mb-3 group-hover:text-emerald-400 transition-colors relative z-10">Cyber Web Scanner</h3>
              <p className="text-sm text-gray-400 mb-5 flex-grow leading-relaxed relative z-10">Aplikasi web scanner interaktif untuk menganalisis keamanan dan kerentanan website dengan UI bertema Cyberpunk.</p>
              <div className="flex items-center justify-between mt-auto relative z-10 pt-4 border-t border-gray-800/60">
                <span className="text-xs font-semibold text-gray-500 bg-gray-800 px-2 py-1 rounded">2024</span>
                <a href="https://cyberwebscanner.onrender.com" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 group-hover:translate-x-1 transition-transform">
                  <ShieldCheck size={13}/> Kunjungi
                </a>
              </div>
            </div>

            <div className="group relative p-5 rounded-2xl bg-gray-900 border border-gray-800 hover:border-pink-500/60 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_30px_-5px_rgba(236,72,153,0.2)] flex flex-col overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <h3 className="font-bold text-base text-gray-100 mb-3 group-hover:text-pink-400 transition-colors relative z-10">Oshtore (E-Commerce)</h3>
              <p className="text-sm text-gray-400 mb-5 flex-grow leading-relaxed relative z-10">Platform e-commerce modern dengan fitur katalog produk lengkap dan integrasi keranjang belanja yang responsif.</p>
              <div className="flex items-center justify-between mt-auto relative z-10 pt-4 border-t border-gray-800/60">
                <span className="text-xs font-semibold text-gray-500 bg-gray-800 px-2 py-1 rounded">2024</span>
                <a href="https://oshtore.vercel.app" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-medium text-pink-400 hover:text-pink-300 group-hover:translate-x-1 transition-transform">
                  <ShoppingCart size={13}/> Kunjungi
                </a>
              </div>
            </div>

            <div className="group relative p-5 rounded-2xl bg-gray-900 border border-gray-800 hover:border-amber-500/60 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_30px_-5px_rgba(245,158,11,0.2)] flex flex-col overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <h3 className="font-bold text-base text-gray-100 mb-3 group-hover:text-amber-400 transition-colors relative z-10">Crypto Directory ID</h3>
              <p className="text-sm text-gray-400 mb-5 flex-grow leading-relaxed relative z-10">Platform direktori interaktif yang mengelola informasi, modul, serta ekosistem cryptocurrency terkini.</p>
              <div className="flex items-center justify-between mt-auto relative z-10 pt-4 border-t border-gray-800/60">
                <span className="text-xs font-semibold text-gray-500 bg-gray-800 px-2 py-1 rounded">2021 – Present</span>
                <a href="https://cryptodirectoryindonesia.io" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-medium text-amber-400 hover:text-amber-300 group-hover:translate-x-1 transition-transform">
                  <Globe size={13}/> Kunjungi
                </a>
              </div>
            </div>
            
          </div>

          <div className="flex justify-center mt-8">
            <Link href="/#modules" className="group inline-flex items-center gap-3 px-6 py-3.5 bg-gray-900 border border-purple-500/30 hover:border-purple-500 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]">
              <span className="font-bold tracking-wide text-sm sm:text-base">Lihat Semua Proyek di Active Modules</span>
              <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}