'use client';

import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';

const SystemLogsDocs = ({ onBack, t }) => {
  return (
    <div className="min-h-screen bg-[#050505] relative pt-24 px-6 pb-20 page-enter">
      {/* Background Grid (Reused) */}
      <div className="fixed inset-0 z-0 pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(0, 243, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.03) 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }}>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <button 
          onClick={onBack}
          className="group flex items-center space-x-2 text-cyan-500 font-mono text-sm mb-8 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{t.back_btn}</span>
        </button>

        <div className="mb-12 border-b border-gray-800 pb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            {t.title}
          </h1>
          <p className="text-gray-400 font-mono flex items-center">
            <FileText className="w-4 h-4 mr-2 text-cyan-500" />
            {t.subtitle}
          </p>
        </div>

        <div className="space-y-12">
          {t.sections.map((section, idx) => (
            <div key={idx} className="bg-[#0a0f1e]/50 border border-gray-800 rounded-xl overflow-hidden hover:border-cyan-500/30 transition-colors duration-300">
              <div className="bg-gray-900/50 p-4 border-b border-gray-800 flex items-center space-x-3">
                <section.icon className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-gray-200 font-mono">{section.title}</h3>
              </div>
              <div className="p-6 grid gap-6">
                {section.items.map((item, i) => (
                  <div key={i} className="flex flex-col md:flex-row md:items-start gap-3">
                    <div className="md:w-1/3 shrink-0">
                      <code className="text-xs font-mono bg-black/50 text-green-400 px-2 py-1 rounded border border-green-900/30 block w-fit">
                        {item.code}
                      </code>
                    </div>
                    <div className="md:w-2/3">
                      <p className="text-sm text-gray-400 leading-relaxed">
                        <span className="text-cyan-500 mr-2">{`//`}</span>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemLogsDocs;