'use client';

import React, { useState, useCallback } from 'react';
import { Shield, ArrowLeft, Code } from 'lucide-react';
import dynamic from 'next/dynamic';

// --- IMPORTS KOMPONEN (STATIS) ---
import ThemeStyles from '@/components/ThemeStyles';
import TerminalHeader from '@/components/TerminalHeader';
import { CustomCursor } from '@/components/UIUtils';
import { ProjectModule } from '@/components/ProjectComponents';

// --- DYNAMIC IMPORTS (CODE SPLITTING) ---
const ProjectModal = dynamic(() => import('@/components/ProjectComponents').then(mod => mod.ProjectModal), { ssr: false });

// --- IMPORT DATA ---
import { personalProjects } from '@/data/appData';

// --- MAIN PAGE COMPONENT ---
export default function PersonalProjectsPage() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [contentVisible, setContentVisible] = useState(false);

  // Gunakan fallback array kosong [] jika personalProjects undefined agar tidak crash
  const projectsData = personalProjects || [];

  // Stable handler to prevent re-triggering TerminalHeader's effect
  const handleAnimationComplete = useCallback(() => {
    setContentVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] selection:bg-cyan-500/30 selection:text-cyan-200">
      <ThemeStyles />
      <style>{`
        /* Blinking Cursor for Terminal */
        .cursor-blink {
          display: inline-block;
          width: 8px;
          height: 15px;
          background-color: #00f3ff;
          animation: blink 1s step-end infinite;
          vertical-align: middle;
          margin-left: 2px;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
      <CustomCursor />
      
      {/* Project Modal */}
      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}

      {/* BACKGROUND GRID */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(0, 243, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-40 bg-[#050505]/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="interactive flex items-center text-gray-400 hover:text-cyan-400 transition-colors font-mono text-sm group">
             <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
             <span>/ ROOT</span>
          </a>
          <div className="flex items-center space-x-2">
             <Shield className="w-5 h-5 text-cyan-400" />
             <span className="font-mono font-bold tracking-tight text-white hidden sm:block">FOSHT <span className="text-gray-600">|</span> PERSONAL</span>
          </div>
        </div>
      </nav>

      {/* CONTENT WRAPPER */}
      <div className="relative z-10 pt-32 pb-10 px-6 max-w-7xl mx-auto">
        
        {/* ANIMATED TERMINAL HEADER */}
        <TerminalHeader onComplete={handleAnimationComplete} />

        {/* MAIN CONTENT */}
        {/* Hapus class 'reveal' dari elemen di bawah ini agar terlihat */}
        <div className={`transition-opacity duration-1000 ${contentVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="mb-12 border-b border-gray-800 pb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              PERSONAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 neon-text-glow">PROTOCOLS</span>
            </h1>
            <p className="text-gray-400 max-w-2xl leading-relaxed">
              A dedicated directory for independent experiments, tools, and platforms developed under the FOSHT initiative. These projects prioritize functionality, security, and experimental interfaces.
            </p>
          </div>

          {/* PROJECTS GRID */}
          {projectsData.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projectsData.map((project, index) => (
                <ProjectModule 
                  key={index}
                  title={project.title}
                  domain={project.domain} 
                  icon={Code} 
                  image={project.logoImg}
                  color="cyan"
                  desc={project.desc}
                  onClick={() => setSelectedProject(project)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-gray-800 rounded-lg text-gray-500 font-mono">
              <p>NO MODULES FOUND IN DIRECTORY.</p>
              <p className="text-xs mt-2 text-gray-600">Check src/data/appData.js configuration.</p>
            </div>
          )}

          {/* BOTTOM TERMINAL STATUS */}
          <div className="mt-20 border-t border-gray-800 pt-8 font-mono text-xs text-gray-600 flex justify-between items-center">
             <div>
               Directory listing complete.
             </div>
             <div className="flex items-center space-x-2">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
               <span className="text-cyan-500">ALL SYSTEMS OPERATIONAL</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}