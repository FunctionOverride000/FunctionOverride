'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, ChevronRight, Lock, Activity, User, Briefcase, ShoppingBag,
  Code, Layout 
} from 'lucide-react';

import dynamic from 'next/dynamic';
import Image from 'next/image';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ThemeStyles from '../components/ThemeStyles';
import LoadingScreen from '../components/LoadingScreen';
import TerminalBlock from '../components/TerminalBlock';
import { AgentSection } from '@/components/AgentWidget';
import { 
  CustomCursor, ScrollReveal, FennecLogo, LogItem 
} from '../components/UIUtils';
import { 
  ProjectModule, OshtoreCard 
} from '../components/ProjectComponents';

const BackgroundAnimation = dynamic(() => import('../components/BackgroundAnimation'), { ssr: false });
const ContactModal = dynamic(() => import('../components/ContactModal'), { ssr: false });
const SystemLogsDocs = dynamic(() => import('../components/SystemLogsDocs'), { ssr: false });
const ProjectModal = dynamic(() => import('../components/ProjectComponents').then(mod => mod.ProjectModal), { ssr: false });

import { content, socialMediaLinks } from '../data/appData';

const getValidImageSrc = (src) => {
  if (!src) return null;
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) return src;
  return src.startsWith('/') ? src : `/${src}`;
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('en');
  const [selectedProject, setSelectedProject] = useState(null);
  const [isInitiating, setIsInitiating] = useState(false);
  const [showContact, setShowContact] = useState(false); 
  const [activeFilter, setActiveFilter] = useState('personal');
  const [currentView, setCurrentView] = useState('dashboard');
  
  const [systemLogs, setSystemLogs] = useState([
    { time: "INIT", action: "INITIALIZING FOSHT KERNEL...", status: "SUCCESS" },
  ]);
  const logContainerRef = useRef(null);

  const addLog = (action, status = "INFO") => {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}.${now.getMilliseconds().toString().padStart(3,'0')}`;
    setSystemLogs(prev => [...prev, { time: timeString, action, status }].slice(-20));
  };

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [systemLogs]);

  // =====================================================
  // ENHANCED REAL-TIME VISITOR TRACKING
  // =====================================================
  useEffect(() => {
    if (loading) return;

    // 1. IP, Lokasi, ISP, Deteksi VPN/Proxy/Tor
    const fetchVisitorData = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();

        addLog(`UPLINK_ESTABLISHED: ${data.ip}`, "SUCCESS");
        addLog(`GEOLOCATION: ${data.city}, ${data.region}, ${data.country_name}`, "INFO");
        addLog(`ISP_PROVIDER: ${data.org}`, "INFO");
        addLog(`TIMEZONE: ${data.timezone} (UTC${data.utc_offset})`, "INFO");

        // Deteksi VPN/Proxy dari nama ISP
        const suspiciousKeywords = [
          'vpn', 'proxy', 'hosting', 'cloud', 'server', 'datacenter',
          'data center', 'nord', 'express', 'mullvad', 'cloudflare',
          'digitalocean', 'amazon', 'google', 'microsoft', 'linode',
          'vultr', 'tor', 'hetzner', 'ovh', 'contabo'
        ];
        const orgLower = (data.org || '').toLowerCase();
        const isSuspicious = suspiciousKeywords.some(kw => orgLower.includes(kw));

        if (isSuspicious) {
          addLog(`THREAT_INTEL: VPN/PROXY/DATACENTER_DETECTED [${data.org}]`, "WARNING");
        } else {
          addLog(`THREAT_INTEL: CONNECTION_VERIFIED [RESIDENTIAL_ISP]`, "SUCCESS");
        }

      } catch (err) {
        addLog("GEO_MODULE: FAILED_TO_RETRIEVE_LOCATION", "WARNING");
      }
    };

    // 2. Hardware, Browser & OS Detection
    const logHardwareSpecs = () => {
      const ua = navigator.userAgent;
      let browser = 'Unknown';
      let os = 'Unknown';

      if (ua.includes('Firefox')) browser = 'Firefox';
      else if (ua.includes('Edg/')) browser = 'Edge';
      else if (ua.includes('Chrome')) browser = 'Chrome';
      else if (ua.includes('Safari')) browser = 'Safari';
      else if (ua.includes('OPR') || ua.includes('Opera')) browser = 'Opera';

      if (ua.includes('Windows NT 10')) os = 'Windows 10/11';
      else if (ua.includes('Windows')) os = 'Windows';
      else if (ua.includes('Mac OS X')) os = 'macOS';
      else if (ua.includes('Linux')) os = 'Linux';
      else if (ua.includes('Android')) os = 'Android';
      else if (ua.includes('iPhone')) os = 'iOS (iPhone)';
      else if (ua.includes('iPad')) os = 'iOS (iPad)';

      addLog(`AGENT_DETECTED: ${browser} on ${os}`, "SUCCESS");
      addLog(`VIEWPORT: SCREEN ${window.screen.width}x${window.screen.height} | WINDOW ${window.innerWidth}x${window.innerHeight}`, "INFO");

      if (navigator.hardwareConcurrency) {
        addLog(`CPU_CORES: ${navigator.hardwareConcurrency} logical processors detected`, "INFO");
      }

      if (navigator.deviceMemory) {
        addLog(`DEVICE_RAM: ~${navigator.deviceMemory}GB (Chromium API)`, "INFO");
      }

      if (window.performance?.memory) {
        const used = (window.performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1);
        const total = (window.performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(1);
        addLog(`JS_HEAP: ${used}MB used / ${total}MB allocated`, "INFO");
      }

      const isTouch = navigator.maxTouchPoints > 0;
      addLog(`INPUT_DEVICE: ${isTouch ? 'TOUCH (Mobile/Tablet)' : 'MOUSE+KEYBOARD (Desktop)'}`, "INFO");
      addLog(`LOCALE: ${navigator.language || 'Unknown'} | COOKIES: ${navigator.cookieEnabled ? 'ENABLED' : 'DISABLED'}`, "INFO");
    };

    // 3. Koneksi & Bandwidth
    const logNetworkType = () => {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (conn) {
        addLog(`NETWORK_TYPE: ${(conn.effectiveType || 'UNKNOWN').toUpperCase()} | DOWNLINK: ~${conn.downlink || '?'}Mbps | RTT: ${conn.rtt || '?'}ms`, "SUCCESS");
        addLog(`DATA_SAVER_MODE: ${conn.saveData ? 'ON (User enabled data saver)' : 'OFF'}`, "INFO");
      } else {
        addLog(`NETWORK_TYPE: API_NOT_SUPPORTED (non-Chromium browser)`, "INFO");
      }
    };

    // 4. Latency ke server
    const checkRealLatency = async () => {
      const start = Date.now();
      try {
        await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-store' });
        const ms = Date.now() - start;
        const quality = ms < 80 ? 'EXCELLENT' : ms < 200 ? 'GOOD' : ms < 400 ? 'FAIR' : 'POOR';
        addLog(`NETWORK_LATENCY: ${ms}ms to EDGE_NODE [${quality}]`, ms > 300 ? "WARNING" : "SUCCESS");
      } catch {
        addLog("PING_SERVICE: PACKET_LOSS_DETECTED", "WARNING");
      }
    };

    // 5. Memory snapshot berkala
    const monitorMemory = () => {
      if (window.performance?.memory) {
        const used = (window.performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1);
        addLog(`MEMORY_SNAPSHOT: ${used}MB JS_HEAP currently in use`, "INFO");
      }
    };

    // Jalankan berurutan
    setTimeout(fetchVisitorData, 500);
    setTimeout(logHardwareSpecs, 1500);
    setTimeout(logNetworkType, 2500);
    setTimeout(checkRealLatency, 3500);

    // Interval otomatis
    const pingInterval = setInterval(checkRealLatency, 15000);
    const memInterval = setInterval(monitorMemory, 30000);

    // 6. Klik
    const handleUserClick = (e) => {
      if (currentView === 'dashboard') {
        addLog(`SIGNAL_INPUT: CLICK [X:${e.clientX}, Y:${e.clientY}] ON <${e.target.tagName}>`, "ACTION");
      }
    };

    // 7. Copy
    const handleCopy = () => addLog("SECURITY: CLIPBOARD_WRITE_DETECTED", "WARNING");

    // 8. Tab visibility
    const handleVisibility = () => {
      addLog(
        document.hidden
          ? "SESSION_STATUS: USER_LEFT_TAB (IDLE/STANDBY)"
          : "SESSION_STATUS: USER_RETURNED_TO_TAB (ACTIVE)",
        document.hidden ? "INFO" : "SUCCESS"
      );
    };

    // 9. Scroll depth
    let lastScrollLog = 0;
    const handleScroll = () => {
      const now = Date.now();
      if (now - lastScrollLog > 3000) {
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        const pct = maxScroll > 0 ? Math.round((window.scrollY / maxScroll) * 100) : 0;
        addLog(`SCROLL_DEPTH: ${pct}% of page | Y:${Math.round(window.scrollY)}px`, "INFO");
        lastScrollLog = now;
      }
    };

    // 10. Inactivity detection (30 detik tanpa gerakan mouse)
    let inactivityTimer;
    const resetInactivity = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        addLog("SESSION_STATUS: USER_INACTIVE (30s no mouse movement)", "INFO");
      }, 30000);
    };

    window.addEventListener('click', handleUserClick);
    window.addEventListener('copy', handleCopy);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', resetInactivity, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);
    resetInactivity();

    return () => {
      clearInterval(pingInterval);
      clearInterval(memInterval);
      clearTimeout(inactivityTimer);
      window.removeEventListener('click', handleUserClick);
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', resetInactivity);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [loading, currentView]);

  // =====================================================

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'id' : 'en');
    addLog(`LOCALIZATION: SWITCHED_TO_${lang === 'en' ? 'ID' : 'EN'}`, "CONFIG");
  };

  const t = content[lang];
  const filteredProjects = t.modules.cards.filter(project => project.type === activeFilter);
  const visibleProjects = activeFilter === 'oshtore' ? filteredProjects : filteredProjects.slice(0, 6);

  const handleInitiateProtocol = () => {
    if (isInitiating) return;
    setIsInitiating(true);
    addLog("PROTOCOL_INIT: EXECUTING_JUMP_TO_MODULES", "EXECUTING");
    setTimeout(() => {
      const modulesSection = document.getElementById('modules');
      if (modulesSection) {
        modulesSection.scrollIntoView({ behavior: 'smooth' });
        addLog("NAVIGATION: MODULE_SECTOR_SYNCED", "SUCCESS");
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
            addLog("COMMAND_EXIT: RETURN_TO_DASHBOARD", "INFO");
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
                addLog("PROCESS_KILL: CLOSED_MODAL_VIEWER", "INFO");
              }} 
            />
          )}

          {showContact && (
            <ContactModal 
              t={t.contact}
              onClose={() => {
                setShowContact(false);
                addLog("COMM_BRIDGE: CONNECTION_DROPPED", "INFO");
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
                      onClick={() => {
                        setShowContact(true);
                        addLog("UI_TRIGGER: SECURE_CONTACT_INITIATED", "INFO");
                      }}
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
                </div>

                <div className="flex flex-wrap gap-4 mb-8">
                  <button 
                    onClick={() => { setActiveFilter('personal'); addLog("FILTER_SET: CATEGORY_PERSONAL", "CONFIG"); }}
                    className={`interactive px-4 py-2 font-mono text-sm border rounded transition-all flex items-center ${activeFilter === 'personal' ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10' : 'border-gray-800 text-gray-500'}`}
                  >
                    <User className="w-4 h-4 mr-2" /> {t.modules.filters.personal}
                  </button>
                  <button 
                    onClick={() => { setActiveFilter('portfolio'); addLog("FILTER_SET: CATEGORY_PORTFOLIO", "CONFIG"); }}
                    className={`interactive px-4 py-2 font-mono text-sm border rounded transition-all flex items-center ${activeFilter === 'portfolio' ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10' : 'border-gray-800 text-gray-500'}`}
                  >
                    <Briefcase className="w-4 h-4 mr-2" /> {t.modules.filters.portfolio}
                  </button>
                  <button 
                    onClick={() => { setActiveFilter('oshtore'); addLog("FILTER_SET: CATEGORY_OSHTORE", "CONFIG"); }}
                    className={`interactive px-4 py-2 font-mono text-sm border rounded transition-all flex items-center ${activeFilter === 'oshtore' ? 'border-[#ff9100] text-[#ff9100] bg-[#ff9100]/10' : 'border-gray-800 text-gray-500'}`}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" /> {t.modules.filters.oshtore}
                  </button>
                </div>

                <div className={activeFilter === 'oshtore' ? "w-full" : "grid md:grid-cols-2 lg:grid-cols-3 gap-6"}>
                  {visibleProjects.map((project, index) => (
                    activeFilter === 'oshtore' ? (
                      <OshtoreCard key={index} project={project} onClick={() => setSelectedProject(project)} />
                    ) : (
                      <ProjectModule key={index} {...project} icon={activeFilter === 'personal' ? Code : Layout} image={project.logoImg} onClick={() => setSelectedProject(project)} />
                    )
                  ))}
                </div>

                {/* Tombol dinamis sesuai filter */}
                {activeFilter !== 'oshtore' && (
                  <div className="mt-12 flex justify-center">
                    <button 
                      onClick={() => {
                        addLog(`UI_EVENT: REDIRECT_TO_${activeFilter.toUpperCase()}`, "INFO");
                        window.location.href = `/${activeFilter}`;
                      }}
                      className="interactive group relative inline-flex items-center gap-2 font-mono text-sm text-gray-500 hover:text-cyan-400 transition-colors duration-300"
                    >
                      <span className="text-cyan-500/50 group-hover:text-cyan-400">/</span>
                      <span className="border-b border-transparent group-hover:border-cyan-500/50 pb-0.5 transition-all">
                        {activeFilter}
                      </span>
                      <span className="w-2 h-4 bg-cyan-400 opacity-0 group-hover:opacity-100 animate-pulse ml-1"></span>
                    </button>
                  </div>
                )}
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
                  className="bg-[#0a0f1e] border border-gray-800 rounded-lg p-4 font-mono h-64 overflow-y-auto scroll-smooth shadow-2xl relative"
                >
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent opacity-20"></div>
                  {systemLogs.map((log, index) => (
                    <LogItem key={index} time={log.time} action={log.action} status={log.status} />
                  ))}
                  <div className="text-cyan-500 animate-pulse mt-2">{`>_`}</div>
                </div>

                <div className="mt-6 flex justify-center">
                  <button 
                    onClick={() => {
                      addLog("UI_EVENT: REDIRECT_TO_LOG_DICTIONARY", "INFO");
                      setTimeout(() => {
                        setCurrentView('logs-doc');
                        window.scrollTo(0, 0);
                      }, 500);
                    }}
                    className="interactive group relative inline-flex items-center gap-2 font-mono text-sm text-gray-500 hover:text-cyan-400 transition-colors duration-300"
                  >
                    <span className="text-cyan-500/50 group-hover:text-cyan-400">/</span>
                    <span className="border-b border-transparent group-hover:border-cyan-500/50 pb-0.5 transition-all">
                      {t.logs.btn_docs}
                    </span>
                    <span className="w-2 h-4 bg-cyan-400 opacity-0 group-hover:opacity-100 animate-pulse ml-1"></span>
                  </button>
                </div>
              </ScrollReveal>
            </div>
          </section>

          <AgentSection />
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

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {socialMediaLinks.map((social) => {
                    const validSrc = getValidImageSrc(social.img);
                    return (
                      <a 
                        key={social.id}
                        href={social.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="interactive group border border-gray-800 bg-[#0a0f1e]/80 backdrop-blur-sm p-4 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-cyan-500 transition-all hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(0,243,255,0.15)]"
                      >
                        <div className="w-10 h-10 relative flex items-center justify-center">
                          {validSrc ? (
                            <Image 
                              src={validSrc} 
                              alt={social.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 opacity-70 group-hover:opacity-100"
                            />
                          ) : (
                            <span className="text-xs text-red-500">IMG ERR</span>
                          )}
                        </div>
                        <span className="text-[10px] md:text-xs font-mono text-gray-500 group-hover:text-cyan-400 tracking-wider text-center transition-colors">
                          {social.name}
                        </span>
                      </a>
                    );
                  })}
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