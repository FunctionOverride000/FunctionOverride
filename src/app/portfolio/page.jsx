'use client';

import React, { useState, useCallback } from 'react';
import { Shield, ArrowLeft, Layout } from 'lucide-react';

// --- IMPORTS KOMPONEN ---
import ThemeStyles from '@/components/ThemeStyles';
import TerminalHeader from '@/components/TerminalHeader';
import { CustomCursor } from '@/components/UIUtils';
import { ProjectModule, ProjectModal } from '@/components/ProjectComponents';

// --- IMPORT DATA ---
import { portfolioProjects } from '@/data/appData';

// --- MAIN PAGE COMPONENT ---
export default function PortfolioProjectsPage() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [contentVisible, setContentVisible] = useState(false);

  // Fallback data
  const projectsData = portfolioProjects || [];

  const handleAnimationComplete = useCallback(() => {
    setContentVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] selection:bg-purple-500/30 selection:text-purple-200">
      <ThemeStyles />
      <style>{`
        .cursor-blink {
          display: inline-block;
          width: 8px;
          height: 15px;
          background-color: #a855f7;
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
        <ProjectModal 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
          color="purple" 
        />
      )}

      {/* BACKGROUND GRID */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(168, 85, 247, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-40 bg-[#050505]/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="interactive flex items-center text-gray-400 hover:text-purple-400 transition-colors font-mono text-sm group">
             <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
             <span>/ ROOT</span>
          </a>
          <div className="flex items-center space-x-2">
             <Shield className="w-5 h-5 text-purple-400" />
             <span className="font-mono font-bold tracking-tight text-white hidden sm:block">FOSHT <span className="text-gray-600">|</span> PORTFOLIO</span>
          </div>
        </div>
      </nav>

      {/* CONTENT WRAPPER */}
      <div className="relative z-10 pt-32 pb-10 px-6 max-w-7xl mx-auto">
        
        {/* ANIMATED TERMINAL HEADER */}
        <TerminalHeader 
          onComplete={handleAnimationComplete} 
          path="/portfolio" 
          command="ls -all"
          successMsg={`${projectsData.length} entries retrieved`}
        />

        {/* MAIN CONTENT */}
        <div className={`transition-opacity duration-1000 ${contentVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="mb-12 border-b border-gray-800 pb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              PORTFOLIO <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 neon-text-glow">ARCHIVES</span>
            </h1>
            <p className="text-gray-400 max-w-2xl leading-relaxed">
              A curated collection of professional digital assets and production-ready applications. This sector showcases collaborations, client-driven solutions, and enterprise-grade ecosystems engineered for impact.
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
                  icon={Layout} 
                  image={project.logoImg}
                  color="purple"
                  desc={project.desc}
                  onClick={() => setSelectedProject(project)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-gray-800 rounded-lg text-gray-500 font-mono">
              <p>NO ARCHIVES FOUND.</p>
              <p className="text-xs mt-2 text-gray-600">Check database connection.</p>
            </div>
          )}

          {/* BOTTOM TERMINAL STATUS */}
          <div className="mt-20 border-t border-gray-800 pt-8 font-mono text-xs text-gray-600 flex justify-between items-center">
             <div>
               Archives scanning finalized.
             </div>
             <div className="flex items-center space-x-2">
               <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
               <span className="text-purple-500">DATABASE CONNECTION SECURE</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}