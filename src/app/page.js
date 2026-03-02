'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, ChevronRight, Lock, Activity, User, Briefcase, ShoppingBag,
  Code, Layout // <--- (1) Pastikan komponen icon di-import di sini
} from 'lucide-react';

// --- IMPORTS KOMPONEN ---
import BackgroundAnimation from '@/components/BackgroundAnimation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ThemeStyles from '@/components/ThemeStyles';
import LoadingScreen from '@/components/LoadingScreen';
import TerminalBlock from '@/components/TerminalBlock';
import ContactModal from '@/components/ContactModal';
import SystemLogsDocs from '@/components/SystemLogsDocs';
import { 
  CustomCursor, ScrollReveal, FennecLogo, LogItem 
} from '@/components/UIUtils';
import { 
  ProjectModule, OshtoreCard, ProjectModal 
} from '@/components/ProjectComponents';

// --- IMPORTS DATA ---
import { content, socialMediaLinks } from '@/data/appData';

// --- MAIN APP ---
export default function App() {
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('en');
  const [selectedProject, setSelectedProject] = useState(null);
  const [isInitiating, setIsInitiating] = useState(false);
  const [showContact, setShowContact] = useState(false); 
  const [activeFilter, setActiveFilter] = useState('personal');
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'logs-doc'
  
  const [systemLogs, setSystemLogs] = useState([
    { time: "INIT", action: "INITIALIZING FOSHT KERNEL...", status: "SUCCESS" },
  ]);
  const logContainerRef = useRef(null);

  const addLog = (action, status = "INFO") => {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}.${now.getMilliseconds().toString().padStart(3,'0')}`;
    
    setSystemLogs(prev => {
      const newLogs = [...prev, { time: timeString, action, status }];
      return newLogs.slice(-15); 
    });
  };

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [systemLogs]);

  useEffect(() => {
    if (loading) return;

    setTimeout(() => addLog(`DETECTED AGENT: ${navigator.userAgent.split(' ')[0]}`, "WARNING"), 800);
    setTimeout(() => addLog(`SCREEN RES: ${window.screen.width}x${window.screen.height}`, "INFO"), 1200);
    setTimeout(() => addLog("ESTABLISHING SECURE HANDSHAKE...", "PENDING"), 1600);
    setTimeout(() => addLog("CONNECTION SECURED", "SUCCESS"), 2500);

    let lastScrollTime = 0;
    const handleScroll = () => {
      const now = Date.now();
      if (now - lastScrollTime > 2000) { 
        addLog(`VIEWPORT UPDATE: Y-OFFSET ${Math.round(window.scrollY)}px`, "UPDATED");
        lastScrollTime = now;
      }
    };

    const handleClick = (e) => {
      const target = e.target.tagName;
      if (currentView === 'dashboard') {
         addLog(`INPUT DETECTED: CLICK ON <${target}> [${e.clientX},${e.clientY}]`, "ACTION");
      }
    };

    const handleCopy = () => {
      addLog("SECURITY ALERT: CLIPBOARD ACCESS DETECTED", "WARNING");
    };

    const handleVisibility = () => {
      if (document.hidden) {
        addLog("USER SESSION: IDLE / BACKGROUND", "STANDBY");
      } else {
        addLog("USER SESSION: ACTIVE / FOREGROUND", "RESUMED");
      }
    };

    const intervalId = setInterval(() => {
      const randomEvents = [
        { msg: "GARBAGE_COLLECTION: MEMORY OPTIMIZED", type: "SUCCESS" },
        { msg: "PING: 14ms TO MAIN SERVER", type: "INFO" },
        { msg: "CHECKING INTEGRITY OF DOM NODES...", type: "PENDING" },
        { msg: "BLOCKING INTRUSION ATTEMPT (PORT 443)", type: "WARNING" },
        { msg: "SYNCING DATA WITH REMOTE REPO...", type: "INFO" },
      ];
      const randomEvent = randomEvents[Math.floor(Math.random() * randomEvents.length)];
      if (Math.random() > 0.7) { 
        addLog(randomEvent.msg, randomEvent.type);
      }
    }, 5000);

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('click', handleClick);
    window.addEventListener('copy', handleCopy);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('copy', handleCopy);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(intervalId);
    };
  }, [loading, currentView]);

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'id' : 'en');
    addLog(`LANGUAGE CHANGED TO: ${lang === 'en' ? 'INDONESIAN' : 'ENGLISH'}`, "CONFIG");
  };

  const t = content[lang];

  const filteredProjects = t.modules.cards.filter(project => project.type === activeFilter);
  const visibleProjects = activeFilter === 'oshtore' ? filteredProjects : filteredProjects.slice(0, 6);

  const handleInitiateProtocol = () => {
    if (isInitiating) return;
    setIsInitiating(true);
    addLog("USER_OVERRIDE: INITIATING MAIN PROTOCOL", "EXECUTING");

    setTimeout(() => {
      const modulesSection = document.getElementById('modules');
      if (modulesSection) {
        modulesSection.scrollIntoView({ behavior: 'smooth' });
        addLog("NAVIGATION: JUMP TO MODULES SECTOR", "SUCCESS");
      }
      setIsInitiating(false);
    }, 800); 
  };

  if (loading) {
    return (
      <>
        <ThemeStyles />
        <LoadingScreen onComplete={() => setLoading(false)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] selection:bg-cyan-500/30 selection:text-cyan-200 font-sans">
      <ThemeStyles />
      <CustomCursor />
      
      <BackgroundAnimation />
      
      <Navbar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        lang={lang}
        toggleLang={toggleLang}
        t={t}
      />

      {currentView === 'logs-doc' ? (
        <SystemLogsDocs 
          onBack={() => {
            setCurrentView('dashboard');
            addLog("NAVIGATION: RETURN TO MAIN TERMINAL", "REDIRECT");
          }} 
          t={t.docs} 
        />
      ) : (
        <>
          {selectedProject && (
            <ProjectModal 
              project={selectedProject} 
              onClose={() => {
                setSelectedProject(null);
                addLog("MODAL: CLOSED PROJECT VIEWER", "INFO");
              }} 
            />
          )}

          {showContact && (
            <ContactModal 
              t={t.contact}
              onClose={() => {
                setShowContact(false);
                addLog("SECURE CHANNEL: CONNECTION TERMINATED", "INFO");
              }} 
            />
          )}

          <div className="fixed inset-0 z-0 pointer-events-none" 
               style={{ 
                 backgroundImage: 'linear-gradient(rgba(0, 243, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.03) 1px, transparent 1px)', 
                 backgroundSize: '40px 40px' 
               }}>
          </div>

          <main className="relative z-10 pt-32 pb-20 px-6" id="dashboard">
            <ScrollReveal>
              <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-mono">
                    <Zap className="w-3 h-3" />
                    <span>{t.hero.badge}</span>
                  </div>
                  
                  <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
                    {t.hero.title_start} <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 neon-text-glow">{t.hero.title_highlight}</span> <br/>
                    {t.hero.title_end}
                  </h1>
                  
                  <p className="text-gray-400 text-lg max-w-lg leading-relaxed">
                    {t.hero.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 pt-4">
                    <button 
                      onClick={handleInitiateProtocol}
                      className={`interactive px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold rounded-sm transition-all shadow-[0_0_15px_rgba(0,243,255,0.4)] flex items-center group ${isInitiating ? 'opacity-80 cursor-wait' : ''}`}
                      disabled={isInitiating}
                    >
                      {isInitiating ? (
                        <>
                          <Activity className="mr-2 w-4 h-4 animate-spin" /> {t.hero.btn_processing}
                        </>
                      ) : (
                        <>
                          {t.hero.btn_primary} <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                    <button 
                      onClick={() => setShowContact(true)}
                      className="interactive px-8 py-3 border border-gray-700 hover:border-[#ff9100] text-gray-300 hover:text-[#ff9100] font-mono rounded-sm transition-all flex items-center"
                    >
                      <Lock className="mr-2 w-4 h-4" /> {t.hero.btn_secondary}
                    </button>
                  </div>
                </div>

                <div className="relative flex flex-col items-center justify-center">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/20 rounded-full blur-[100px]"></div>
                  <FennecLogo />
                  <div className="w-full max-w-md">
                    <TerminalBlock />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </main>

          <section id="modules" className="relative z-10 py-20 bg-[#0a0f1e]/30 border-t border-gray-900">
            <div className="max-w-7xl mx-auto px-6">
              <ScrollReveal>
                <div className="flex items-end justify-between mb-8 border-b border-gray-800 pb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{t.modules.title}</h2>
                    <p className="text-gray-500 font-mono text-sm">{t.modules.path}/{activeFilter}</p>
                  </div>
                  <div className="hidden md:block text-right text-xs font-mono text-gray-600">
                    {t.modules.stats}
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-8">
                  <button 
                    onClick={() => { setActiveFilter('personal'); addLog("FILTER: SWITCHED TO PERSONAL MODULES", "CONFIG"); }}
                    className={`interactive px-4 py-2 font-mono text-sm border rounded transition-all flex items-center ${
                      activeFilter === 'personal' 
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-[0_0_10px_rgba(0,243,255,0.2)]' 
                        : 'border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'
                    }`}
                  >
                    <User className="w-4 h-4 mr-2" />
                    {t.modules.filters.personal}
                  </button>
                  <button 
                    onClick={() => { setActiveFilter('portfolio'); addLog("FILTER: SWITCHED TO PORTFOLIO MODULES", "CONFIG"); }}
                    className={`interactive px-4 py-2 font-mono text-sm border rounded transition-all flex items-center ${
                      activeFilter === 'portfolio' 
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-[0_0_10px_rgba(0,243,255,0.2)]' 
                        : 'border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    {t.modules.filters.portfolio}
                  </button>
                  <button 
                    onClick={() => { setActiveFilter('oshtore'); addLog("FILTER: ACCESSING OSHTORE SERVICES", "CONFIG"); }}
                    className={`interactive px-4 py-2 font-mono text-sm border rounded transition-all flex items-center ${
                      activeFilter === 'oshtore' 
                        ? 'border-[#ff9100] bg-[#ff9100]/10 text-[#ff9100] shadow-[0_0_10px_rgba(255,145,0,0.2)]' 
                        : 'border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    {t.modules.filters.oshtore}
                  </button>
                </div>

                {activeFilter === 'oshtore' ? (
                  <div className="w-full">
                      {visibleProjects.map((project, index) => (
                        <OshtoreCard 
                          key={index}
                          project={project}
                          onClick={() => setSelectedProject(project)}
                        />
                      ))}
                      
                      {visibleProjects.length === 0 && (
                          <div className="w-full py-12 text-center border border-dashed border-gray-800 rounded-xl">
                            <p className="text-gray-500 font-mono">SERVICE MODULE OFFLINE.</p>
                          </div>
                      )}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visibleProjects.map((project, index) => (
                       <ProjectModule 
                         key={index}
                         title={project.title}
                         domain={project.domain} 
                         // (2) PERBAIKAN: Gunakan variabel komponen (Code/Layout), BUKAN string ('Code'/'Layout')
                         icon={project.type === 'personal' ? Code : Layout} 
                         image={project.logoImg}
                         color={project.type === 'personal' ? "cyan" : "purple"}
                         desc={project.desc}
                         onClick={() => setSelectedProject(project)}
                       />
                    ))}
                    
                    {visibleProjects.length === 0 && (
                      <div className="col-span-full py-12 text-center border border-dashed border-gray-800 rounded-xl">
                        <p className="text-gray-500 font-mono">NO MODULES FOUND IN THIS SECTOR.</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-12 flex justify-center">
                  {activeFilter === 'personal' && (
                    <a 
                      href="/personal" 
                      className="interactive group relative inline-flex items-center gap-2 font-mono text-sm text-gray-500 hover:text-cyan-400 transition-colors duration-300"
                    >
                      <span className="text-cyan-500/50 group-hover:text-cyan-400 transition-colors">/</span>
                      <span className="border-b border-transparent group-hover:border-cyan-500/50 pb-0.5 transition-all">
                          {lang === 'en' ? 'view_all/personal' : 'lihat_semua_personal'}
                      </span>
                      <span className="w-2 h-4 bg-cyan-400 opacity-0 group-hover:opacity-100 animate-pulse ml-1"></span>
                    </a>
                  )}

                   {activeFilter === 'portfolio' && (
                    <a 
                      href="/portfolio" 
                       className="interactive group relative inline-flex items-center gap-2 font-mono text-sm text-gray-500 hover:text-purple-400 transition-colors duration-300"
                    >
                      <span className="text-purple-500/50 group-hover:text-purple-400 transition-colors">/</span>
                      <span className="border-b border-transparent group-hover:border-purple-500/50 pb-0.5 transition-all">
                          {lang === 'en' ? 'view_all/portfolio' : 'lihat_semua_portfolio'}
                      </span>
                      <span className="w-2 h-4 bg-purple-400 opacity-0 group-hover:opacity-100 animate-pulse ml-1"></span>
                    </a>
                  )}
                </div>

              </ScrollReveal>
            </div>
          </section>

          <section id="logs" className="relative z-10 py-20 border-t border-gray-900 bg-[#050505]">
            <div className="max-w-7xl mx-auto px-6">
              <ScrollReveal>
                <div className="flex items-center space-x-3 mb-8">
                  <Activity className="text-cyan-400 w-6 h-6" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">{t.logs.title}</h2>
                    <p className="text-gray-500 font-mono text-xs">{t.logs.path}</p>
                  </div>
                </div>

                <div 
                  ref={logContainerRef}
                  className="bg-[#0a0f1e] border border-gray-800 rounded-lg p-4 font-mono h-60 overflow-y-auto scroll-smooth"
                >
                  {systemLogs.map((log, index) => (
                    <LogItem key={index} time={log.time} action={log.action} status={log.status} />
                  ))}
                  <div className="text-cyan-500 animate-pulse mt-2">{`>_`}</div>
                </div>

                <div className="mt-6 flex justify-center">
                   <button 
                      onClick={() => {
                        addLog("NAVIGATION: OPENING LOG DICTIONARY", "REDIRECT");
                        setTimeout(() => {
                          setCurrentView('logs-doc');
                          window.scrollTo(0, 0);
                        }, 500);
                      }}
                      className="interactive group relative inline-flex items-center gap-2 font-mono text-sm text-gray-500 hover:text-cyan-400 transition-colors duration-300"
                    >
                      <span className="text-cyan-500/50 group-hover:text-cyan-400 transition-colors">/</span>
                      <span className="border-b border-transparent group-hover:border-cyan-500/50 pb-0.5 transition-all">
                          {t.logs.btn_docs}
                      </span>
                      <span className="w-2 h-4 bg-cyan-400 opacity-0 group-hover:opacity-100 animate-pulse ml-1"></span>
                    </button>
                </div>

              </ScrollReveal>
            </div>
          </section>

          <section id="whoami" className="relative z-10 py-20 border-t border-gray-900 bg-[#050505] bg-opacity-80">
            <div className="max-w-7xl mx-auto px-6">
              <ScrollReveal>
                 <div className="flex items-center space-x-3 mb-8">
                    <div className="p-2 bg-cyan-900/10 rounded-lg border border-cyan-500/20">
                      <User className="text-cyan-400 w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white tracking-wide">{t.whoami.title}</h2>
                      <p className="text-gray-500 font-mono text-xs">{t.whoami.path}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                    {socialMediaLinks.map((social) => (
                       <a 
                         key={social.id}
                         href={social.url} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="interactive group border border-gray-800 bg-[#0a0f1e]/80 backdrop-blur-sm p-4 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-cyan-500 transition-all hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(0,243,255,0.15)]"
                       >
                          <div className="w-10 h-10 relative flex items-center justify-center">
                             <img 
                               src={social.img} 
                               alt={social.name} 
                               className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 opacity-70 group-hover:opacity-100"
                               onError={(e) => {
                                 e.target.style.display = 'none';
                                 e.target.parentNode.innerHTML = '<span class="text-xs text-red-500">IMG ERR</span>';
                               }}
                             />
                          </div>
                          <span className="text-[10px] md:text-xs font-mono text-gray-500 group-hover:text-cyan-400 tracking-wider text-center transition-colors">
                            {social.name}
                          </span>
                       </a>
                    ))}
                 </div>
              </ScrollReveal>
            </div>
          </section>

          <Footer t={t} />
        </>
      )}
    </div>
  );
}