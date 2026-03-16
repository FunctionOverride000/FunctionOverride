'use client';

import React, { useState } from 'react';
import { ExternalLink, ChevronRight, Globe, ArrowRight, Activity, Terminal, X } from 'lucide-react';
import Image from 'next/image';

const colorStyles = {
  cyan: {
    borderHover: 'hover:border-cyan-400/50',
    textHover: 'group-hover:text-cyan-400',
    textSoft: 'text-cyan-500/80',
    textStrong: 'text-cyan-400',
    bgSoft: 'bg-cyan-900/20',
    borderSoft: 'border-cyan-500/30',
    button: 'bg-cyan-500 hover:bg-cyan-400 text-black',
    gradient: 'from-cyan-500/10',
    lineHover: 'group-hover:bg-cyan-900'
  },
  blue: {
    borderHover: 'hover:border-blue-400/50',
    textHover: 'group-hover:text-blue-400',
    textSoft: 'text-blue-500/80',
    textStrong: 'text-blue-400',
    bgSoft: 'bg-blue-900/20',
    borderSoft: 'border-blue-500/30',
    button: 'bg-blue-500 hover:bg-blue-400 text-black',
    gradient: 'from-blue-500/10',
    lineHover: 'group-hover:bg-blue-900'
  },
  emerald: {
    borderHover: 'hover:border-emerald-400/50',
    textHover: 'group-hover:text-emerald-400',
    textSoft: 'text-emerald-500/80',
    textStrong: 'text-emerald-400',
    bgSoft: 'bg-emerald-900/20',
    borderSoft: 'border-emerald-500/30',
    button: 'bg-emerald-500 hover:bg-emerald-400 text-black',
    gradient: 'from-emerald-500/10',
    lineHover: 'group-hover:bg-emerald-900'
  }
};

// Helper function untuk memastikan format path gambar valid untuk next/image
const getValidImageSrc = (src) => {
  if (!src) return null;
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
    return src;
  }
  return src.startsWith('/') ? src : `/${src}`;
};

export const ProjectModule = ({ title, domain, icon: Icon, color = "cyan", desc, image, onClick }) => {
  const [imgError, setImgError] = useState(false);
  const c = colorStyles[color] || colorStyles.cyan;
  
  const validImageSrc = getValidImageSrc(image);

  return (
    <div 
      onClick={onClick}
      className={`interactive group relative bg-[#0a0f1e]/80 backdrop-blur-sm border border-gray-800 rounded-xl cursor-pointer overflow-hidden transition-transform duration-300 hover:-translate-y-2 ${c.borderHover} h-full flex flex-col`}
    >
      <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl ${c.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      
      <div className="p-6 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className={`relative w-12 h-12 flex items-center justify-center rounded-lg bg-black/50 border border-gray-700 group-hover:border-cyan-500 transition-colors duration-300 overflow-hidden`}>
             {validImageSrc && !imgError ? (
               <Image 
                 src={validImageSrc} 
                 alt={title || "Project thumbnail"} 
                 width={48} 
                 height={48}
                 className="w-full h-full object-contain p-1"
                 onError={() => setImgError(true)}
               />
             ) : (
               Icon ? <Icon className={`w-7 h-7 ${c.textStrong}`} /> : null
             )}
          </div>
          <ExternalLink className={`w-5 h-5 text-gray-600 ${c.textHover} transition-colors duration-300`} />
        </div>
        
        <h3 className={`text-xl font-bold text-gray-100 mb-1 font-mono ${c.textHover} transition-colors duration-300`}>
          {title}
        </h3>
        <p className={`${c.textSoft} text-xs font-mono mb-3`}>{domain}</p>
        <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">{desc}</p>
      </div>

      <div className="px-6 pb-4 mt-auto">
        <div className={`pt-4 border-t border-gray-800 flex items-center text-xs text-gray-500 font-mono ${c.textHover} transition-colors duration-300`}>
          <span className="mr-2">CLICK FOR DETAILS</span>
          <div className={`flex-1 h-[1px] bg-gray-800 ${c.lineHover} transition-colors duration-300`}></div>
          <ChevronRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
    </div>
  );
};

export const OshtoreCard = ({ project, onClick }) => {
  const [imgError, setImgError] = useState(false);
  const validImageSrc = getValidImageSrc(project?.logoImg);

  return (
    <div 
      onClick={onClick}
      className="interactive group relative w-full bg-[#0a0f1e]/90 backdrop-blur-md border border-[#ff9100]/30 rounded-xl overflow-hidden cursor-pointer hover:border-[#ff9100] transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,145,0,0.15)]"
    >
       <div className="absolute inset-0 bg-gradient-to-r from-[#ff9100]/10 to-transparent opacity-50"></div>
       
       <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center md:items-start gap-8">
         <div className="relative w-24 h-24 md:w-32 md:h-32 shrink-0 bg-black/40 rounded-2xl border border-gray-700 flex items-center justify-center group-hover:border-[#ff9100] transition-colors overflow-hidden p-2">
            {validImageSrc && !imgError ? (
              <Image 
                src={validImageSrc} 
                alt={project.title || "Oshtore thumbnail"} 
                width={128} 
                height={128}
                className="w-full h-full object-contain"
                onError={() => setImgError(true)}
              />
            ) : (
              <Globe className="w-12 h-12 text-[#ff9100]" />
            )}
         </div>
         
         <div className="flex-1 text-center md:text-left">
            <div className="inline-block px-3 py-1 bg-[#ff9100]/10 border border-[#ff9100]/30 rounded-full text-xs font-mono text-[#ff9100] mb-4">
              PREMIUM SERVICE
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-[#ff9100] transition-colors">
              {project.title}
            </h3>
            <p className="text-gray-400 text-lg leading-relaxed mb-6 max-w-2xl">
              {project.desc}
            </p>
            <div className="flex items-center justify-center md:justify-start text-[#ff9100] font-mono text-sm group-hover:translate-x-2 transition-transform">
              VIEW SERVICE DETAILS <ArrowRight className="ml-2 w-4 h-4" />
            </div>
         </div>
       </div>
    </div>
  );
};

export const ProjectModal = ({ project, onClose, color = "cyan" }) => {
  if (!project) return null;
  const [imgError, setImgError] = useState(false);
  const c = colorStyles[color] || colorStyles.cyan;
  const validImageSrc = getValidImageSrc(project?.logoImg);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      <div className={`animate-modal relative bg-[#0a0f1e] border ${c.borderSoft} w-full max-w-2xl rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-black/40">
           <div className="flex items-center space-x-3">
             <div className={`relative p-2 ${c.bgSoft} rounded border ${c.borderSoft} h-10 w-10 flex items-center justify-center overflow-hidden`}>
                 {validImageSrc && !imgError ? (
                   <Image 
                     src={validImageSrc} 
                     alt="logo" 
                     width={40} 
                     height={40}
                     className="w-full h-full object-contain"
                     onError={() => setImgError(true)}
                   />
                 ) : (
                   <Terminal className={`w-5 h-5 ${c.textStrong}`} />
                 )}
             </div>
             <div>
               <h3 className="text-xl font-bold text-white font-mono">{project.title}</h3>
               <p className={`${c.textSoft} text-xs font-mono`}>{project.domain}</p>
             </div>
           </div>
           <button 
             onClick={onClose}
             className="interactive p-2 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
           >
             <X className="w-6 h-6" />
           </button>
        </div>

        <div className="p-8 space-y-6">
           <div>
              <h4 className="text-sm font-mono text-gray-500 mb-2 uppercase tracking-wider">Description</h4>
              <p className="text-gray-300 leading-relaxed">{project.desc}</p>
           </div>
           
           <div className="bg-black/30 p-4 rounded border border-gray-800">
              <h4 className={`text-sm font-mono ${c.textStrong} mb-2 flex items-center`}>
                 <Activity className="w-4 h-4 mr-2" /> TECHNICAL SPECIFICATIONS
              </h4>
              <p className="text-sm text-gray-400 font-mono leading-relaxed">
                 {project.details}
              </p>
           </div>
        </div>

        <div className="p-6 border-t border-gray-800 bg-black/40 flex justify-end">
           <a 
             href={project.domain.startsWith('http') ? project.domain : `https://${project.domain}`} 
             target="_blank" 
             rel="noopener noreferrer"
             className={`interactive px-6 py-2 ${c.button} font-bold font-mono rounded transition-colors flex items-center`}
           >
             LAUNCH SYSTEM <ExternalLink className="ml-2 w-4 h-4" />
           </a>
        </div>
      </div>
    </div>
  );
};