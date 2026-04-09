'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ArrowLeft, Bot, Zap, Clock, FileText, TrendingUp, Calendar, Eye, Radio, Activity, RefreshCw, Cpu, Database, Globe, CheckCircle } from 'lucide-react';

// ── Helpers
function timeAgo(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'baru saja';
  if (m < 60) return `${m} menit lalu`;
  if (h < 24) return `${h} jam lalu`;
  return `${d} hari lalu`;
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// ── Animated counter
function AnimatedNumber({ value, duration = 800 }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const start = prev.current;
    const end = Number(value) || 0;
    if (start === end) return;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
      else { setDisplay(end); prev.current = end; }
    };
    requestAnimationFrame(tick);
  }, [value, duration]);
  return <span>{display.toLocaleString()}</span>;
}

// ── Live pulse dot
function PulseDot({ color = '#00f3ff', size = 8 }) {
  return (
    <span className="relative inline-flex" style={{ width: size, height: size }}>
      <span className="absolute inline-flex w-full h-full rounded-full opacity-75"
        style={{ background: color, animation: 'agentPing 1.5s ease-in-out infinite' }} />
      <span className="relative inline-flex rounded-full"
        style={{ width: size, height: size, background: color }} />
    </span>
  );
}

// ── Activity bar chart
function ActivityBars({ data }: { data: Record<string, number> }) {
  const max = Math.max(...Object.values(data), 1);
  const sorted = Object.entries(data).sort((a, b) => a[0].localeCompare(b[0])).slice(-14);
  return (
    <div className="flex items-end gap-1 h-16">
      {sorted.map(([day, count], i) => (
        <div key={day} className="flex-1 flex flex-col items-center gap-1 group cursor-default">
          <div className="relative w-full flex items-end justify-center"
            style={{ height: 52 }}>
            <div
              className="w-full rounded-t-sm transition-all duration-700"
              style={{
                height: `${(count / max) * 52}px`,
                background: `linear-gradient(to top, rgba(0,243,255,0.6), rgba(0,243,255,0.2))`,
                boxShadow: count > 0 ? '0 0 6px rgba(0,243,255,0.3)' : 'none',
                animation: `barGrow 0.6s ease-out ${i * 60}ms both`,
              }}
            />
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#080d1a] border border-cyan-500/30 text-[8px] text-cyan-400 px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {count}
            </div>
          </div>
          <span className="text-[7px] text-gray-700 rotate-45 origin-left"
            style={{ fontSize: 7 }}>
            {day.slice(5)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Log stream item
function LogStreamItem({ log, index }) {
  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-gray-900 font-mono"
      style={{ animation: `fadeInLeft 0.3s ease-out both` }}>
      <span className="text-[8px] text-gray-700 shrink-0 mt-0.5 w-20">{log.time}</span>
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <span className={`text-[8px] px-1.5 py-0.5 rounded-sm shrink-0 ${
          log.type === 'publish' ? 'bg-cyan-500/15 text-cyan-400' :
          log.type === 'search' ? 'bg-blue-500/15 text-blue-400' :
          log.type === 'generate' ? 'bg-purple-500/15 text-purple-400' :
          log.type === 'error' ? 'bg-red-500/15 text-red-400' :
          'bg-gray-800 text-gray-500'
        }`}>
          {log.type?.toUpperCase() || 'INFO'}
        </span>
        <span className="text-[10px] text-gray-400 truncate">{log.message}</span>
      </div>
    </div>
  );
}

export default function FennecAIPage() {
  const [allArticles, setAllArticles] = useState([]);
  const [usedTopics, setUsedTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('monitor');
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [uptime, setUptime] = useState(0);
  const [logs, setLogs] = useState([]);
  const logRef = useRef(null);
  const unsubRef = useRef(null);

  // ── Uptime counter
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => setUptime(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  // ── Scroll logs to bottom
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  // ── Add log entry
  const addLog = useCallback((message, type = 'info') => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;
    setLogs(prev => [...prev.slice(-49), { time, message, type, id: Date.now() + Math.random() }]);
  }, []);

  // ── Fetch all data
  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    addLog('Fetching agent data from Firestore...', 'search');
    try {
      const snap = await getDocs(query(
        collection(db, 'posts'),
        where('published', '==', true),
        where('source', '==', 'ai-agent'),
        orderBy('createdAt', 'desc'),
        limit(50)
      ));
      const arts = snap.docs.map(d => ({
        id: d.id, ...d.data(),
        createdAt: d.data().createdAt?.toDate?.()?.toISOString() || null,
      }));
      setAllArticles(arts);
      addLog(`Loaded ${arts.length} articles from AI agent`, 'publish');

      const today = new Date().toISOString().slice(0, 10);
      try {
        const stateSnap = await getDoc(doc(db, 'agent_state', `used_topics_${today}`));
        if (stateSnap.exists()) {
          const topics = stateSnap.data().topics || [];
          setUsedTopics(topics);
          addLog(`Today's topics: ${topics.length} researched`, 'search');
        }
      } catch {}

      setLastRefresh(Date.now());
      addLog('Data sync complete ✓', 'publish');
    } catch (e) {
      addLog(`Error: ${e.message}`, 'error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [addLog]);

  // ── Initial load + realtime listener
  useEffect(() => {
    addLog('FOSHT AI Agent Monitor initializing...', 'info');
    addLog('Connecting to Firestore...', 'search');
    fetchData();

    // Realtime listener — auto update saat ada artikel baru
    const q = query(
      collection(db, 'posts'),
      where('source', '==', 'ai-agent'),
      where('published', '==', true),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    unsubRef.current = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const latest = snap.docs[0].data();
        const title = latest.title || 'Untitled';
        addLog(`🆕 New article published: "${title}"`, 'publish');
        fetchData();
      }
    }, (err) => {
      addLog(`Listener error: ${err.message}`, 'error');
    });

    // Auto refresh setiap 5 menit
    const refreshId = setInterval(() => {
      addLog('Auto-refreshing data...', 'info');
      fetchData();
    }, 5 * 60 * 1000);

    return () => {
      unsubRef.current?.();
      clearInterval(refreshId);
    };
  }, []);

  // ── Derived stats
  const articlesByDay = allArticles.reduce((acc, a) => {
    if (!a.createdAt) return acc;
    const day = a.createdAt.slice(0, 10);
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});

  const totalViews = allArticles.reduce((sum, a) => sum + (a.views || 0), 0);
  const allTags = allArticles.flatMap(a => a.tags || []);
  const tagCount = allTags.reduce((acc, t) => { acc[t] = (acc[t] || 0) + 1; return acc; }, {} as Record<string, number>);
  const topTags = Object.entries(tagCount).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 12);

  const uptimeStr = `${Math.floor(uptime / 3600).toString().padStart(2,'0')}:${Math.floor((uptime % 3600) / 60).toString().padStart(2,'0')}:${(uptime % 60).toString().padStart(2,'0')}`;

  return (
    <main className="min-h-screen bg-[#030810] text-white font-mono overflow-x-hidden">

      <style>{`
        @keyframes agentPing {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(2); opacity: 0; }
        }
        @keyframes barGrow {
          from { transform: scaleY(0); transform-origin: bottom; }
          to { transform: scaleY(1); transform-origin: bottom; }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 8px rgba(0,243,255,0.3); }
          50% { box-shadow: 0 0 20px rgba(0,243,255,0.6); }
        }
        .scanline {
          position: fixed; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(0,243,255,0.15), transparent);
          animation: scanline 4s linear infinite;
          pointer-events: none; z-index: 100;
        }
        .grid-bg {
          background-image: linear-gradient(rgba(0,243,255,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,243,255,0.03) 1px, transparent 1px);
          background-size: 32px 32px;
        }
      `}</style>

      {/* Scanline effect */}
      <div className="scanline" />

      {/* Grid background */}
      <div className="fixed inset-0 grid-bg pointer-events-none" />

      {/* Top nav */}
      <div className="border-b border-cyan-500/10 bg-black/60 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-cyan-400 text-xs tracking-[3px] hover:text-cyan-300 transition-colors">
            <ArrowLeft className="w-3 h-3" /> HOME
          </Link>

          <div className="flex items-center gap-3">
            <PulseDot size={8} />
            <span className="text-[10px] text-cyan-400 tracking-widest font-bold">FENNEC AI · LIVE MONITOR</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[9px] text-gray-600 font-mono">{uptimeStr}</span>
            <button onClick={fetchData} disabled={isRefreshing}
              className="text-gray-600 hover:text-cyan-400 transition-colors disabled:opacity-30">
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-sm border border-cyan-500/30 bg-cyan-500/5 flex items-center justify-center"
                style={{ animation: 'glow 3s ease-in-out infinite' }}>
                <img src="/fosht.png" alt="Fennec AI" className="w-10 h-10 object-contain" />
              </div>
              <div className="absolute -bottom-1 -right-1">
                <PulseDot size={10} />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">FENNEC AI</h1>
              <p className="text-[10px] text-cyan-500 tracking-widest mt-0.5">AUTONOMOUS RESEARCH & PUBLISHING AGENT</p>
              <p className="text-[9px] text-gray-600 mt-1">/sys/agent/monitor · realtime · no simulation</p>
            </div>
          </div>

          <div className="hidden md:flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 text-[9px] text-gray-600">
              <Cpu className="w-3 h-3 text-cyan-500" />
              <span>Groq llama-3.3-70b</span>
            </div>
            <div className="flex items-center gap-2 text-[9px] text-gray-600">
              <Globe className="w-3 h-3 text-cyan-500" />
              <span>Tavily Advanced Search</span>
            </div>
            <div className="flex items-center gap-2 text-[9px] text-gray-600">
              <Database className="w-3 h-3 text-cyan-500" />
              <span>Firebase Firestore · Realtime</span>
            </div>
            <div className="flex items-center gap-2 text-[9px] text-gray-600">
              <Clock className="w-3 h-3 text-cyan-500" />
              <span>Auto-publish every 2h</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'TOTAL ARTIKEL', value: allArticles.length, icon: FileText, suffix: '' },
            { label: 'TOTAL VIEWS', value: totalViews, icon: Eye, suffix: '' },
            { label: 'HARI AKTIF', value: Object.keys(articlesByDay).length, icon: Calendar, suffix: '' },
            { label: 'TOPIK HARI INI', value: usedTopics.length, icon: TrendingUp, suffix: '' },
          ].map((s, i) => (
            <div key={i} className="bg-[#080d1a]/80 border border-cyan-500/10 rounded-sm p-4 relative overflow-hidden"
              style={{ animation: `fadeInLeft 0.4s ease-out ${i * 80}ms both` }}>
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
              <div className="flex items-center gap-2 mb-2">
                <s.icon className="w-3 h-3 text-cyan-500" />
                <span className="text-[8px] text-gray-600 tracking-widest">{s.label}</span>
              </div>
              <div className="text-2xl font-black text-cyan-400">
                {loading ? '—' : <AnimatedNumber value={s.value} />}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mb-6 border-b border-gray-800">
          {[
            { id: 'monitor', label: '⚡ MONITOR' },
            { id: 'articles', label: '📄 ARTIKEL' },
            { id: 'analytics', label: '📊 ANALITIK' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-[10px] tracking-widest font-bold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                  : 'border-transparent text-gray-600 hover:text-gray-400'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
            <span className="text-xs text-gray-700 tracking-widest animate-pulse">CONNECTING TO FIRESTORE...</span>
          </div>
        ) : (
          <>
            {/* ── MONITOR TAB */}
            {activeTab === 'monitor' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Live log stream */}
                <div className="bg-[#080d1a]/80 border border-cyan-500/10 rounded-sm overflow-hidden lg:col-span-2">
                  <div className="px-4 py-2.5 border-b border-gray-800 flex items-center justify-between"
                    style={{ background: 'rgba(0,243,255,0.02)' }}>
                    <div className="flex items-center gap-2">
                      <PulseDot size={6} />
                      <span className="text-[9px] text-cyan-500 tracking-widest">LIVE LOG STREAM</span>
                    </div>
                    <span className="text-[8px] text-gray-700">{logs.length} entries</span>
                  </div>
                  <div ref={logRef} className="h-48 overflow-y-auto p-3 space-y-0 scroll-smooth">
                    {logs.length === 0 ? (
                      <div className="text-center py-8 text-gray-800 text-xs">Waiting for events...</div>
                    ) : (
                      logs.map((log, i) => <LogStreamItem key={log.id} log={log} index={i} />)
                    )}
                    <div className="text-cyan-500 animate-pulse text-xs mt-1">{`>_`}</div>
                  </div>
                </div>

                {/* Activity chart */}
                <div className="bg-[#080d1a]/80 border border-cyan-500/10 rounded-sm p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] text-gray-600 tracking-widest">ARTIKEL PER HARI (14 HARI)</span>
                    <span className="text-[9px] text-cyan-500">{Object.values(articlesByDay).reduce((a: number, b) => a + (b as number), 0)} total</span>
                  </div>
                  {Object.keys(articlesByDay).length > 0 ? (
                    <ActivityBars data={articlesByDay} />
                  ) : (
                    <div className="h-16 flex items-center justify-center text-gray-800 text-xs">No data yet</div>
                  )}
                </div>

                {/* Topik hari ini */}
                <div className="bg-[#080d1a]/80 border border-cyan-500/10 rounded-sm p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-3 h-3 text-cyan-500" />
                    <span className="text-[9px] text-gray-600 tracking-widest">TOPIK DIRISET HARI INI</span>
                    <span className="ml-auto text-[9px] text-cyan-500">{usedTopics.length}/{usedTopics.length || '—'}</span>
                  </div>
                  {usedTopics.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                      {usedTopics.map((t, i) => (
                        <span key={i}
                          className="text-[9px] px-2 py-1 bg-cyan-500/6 text-cyan-600 border border-cyan-500/15 rounded-sm flex items-center gap-1"
                          style={{ animation: `fadeInLeft 0.3s ease-out ${i * 50}ms both` }}>
                          <CheckCircle className="w-2.5 h-2.5 text-cyan-500 shrink-0" />
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-800 text-xs">
                      Menunggu run pertama hari ini...
                    </div>
                  )}
                </div>

                {/* Artikel terbaru */}
                <div className="bg-[#080d1a]/80 border border-cyan-500/10 rounded-sm p-4 lg:col-span-2">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] text-gray-600 tracking-widest">ARTIKEL TERBARU</span>
                    <Link href="/blog/fosht-blog" className="text-[9px] text-cyan-500 hover:text-cyan-300 transition-colors">
                      LIHAT SEMUA →
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {allArticles.slice(0, 6).map((a, i) => (
                      <Link key={a.id} href={`/blog/${a.slug}`}
                        className="group flex items-start gap-3 p-2 rounded-sm border border-gray-800 hover:border-cyan-500/30 transition-all"
                        style={{ animation: `fadeInLeft 0.3s ease-out ${i * 60}ms both` }}>
                        <div className="w-14 h-12 rounded-sm overflow-hidden shrink-0 bg-gray-900">
                          {a.coverImage ? (
                            <img src={a.coverImage} alt={a.title}
                              className="w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-opacity" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Bot className="w-4 h-4 text-gray-700" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-[10px] font-bold line-clamp-2 group-hover:text-cyan-400 transition-colors leading-snug">
                            {a.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[8px] text-gray-700">{timeAgo(a.createdAt)}</span>
                            <span className="text-[8px] text-gray-700 flex items-center gap-0.5">
                              <Eye className="w-2 h-2" />{a.views || 0}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── ARTIKEL TAB */}
            {activeTab === 'articles' && (
              <div>
                <p className="text-[9px] text-gray-600 tracking-widest mb-4">
                  {allArticles.length} ARTIKEL — DIPUBLISH OLEH FENNEC AI AGENT
                </p>
                <div className="space-y-1.5">
                  {allArticles.map((a, i) => (
                    <Link key={a.id} href={`/blog/${a.slug}`}
                      className="flex items-center gap-3 p-3 bg-[#080d1a]/80 border border-gray-800 rounded-sm hover:border-cyan-500/30 transition-all group"
                      style={{ animation: `fadeInLeft 0.3s ease-out ${Math.min(i, 20) * 30}ms both` }}>
                      <span className="text-[8px] text-gray-700 w-6 shrink-0 text-right">{i + 1}</span>
                      <div className="w-12 h-9 rounded-sm overflow-hidden shrink-0 bg-gray-900">
                        {a.coverImage ? (
                          <img src={a.coverImage} alt={a.title}
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-opacity" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText className="w-3 h-3 text-gray-700" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white text-[11px] font-bold truncate group-hover:text-cyan-400 transition-colors">
                          {a.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[8px] text-gray-700">{formatDate(a.createdAt)}</span>
                          <span className="text-[8px] text-gray-700 flex items-center gap-0.5">
                            <Eye className="w-2 h-2" />{a.views || 0}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {(a.tags || []).slice(0, 2).map(t => (
                          <span key={t} className="text-[7px] px-1.5 py-0.5 bg-cyan-500/6 text-cyan-700 border border-cyan-500/12 rounded-sm hidden md:inline">
                            {t}
                          </span>
                        ))}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* ── ANALITIK TAB */}
            {activeTab === 'analytics' && (
              <div className="space-y-4">

                {/* Chart besar */}
                <div className="bg-[#080d1a]/80 border border-cyan-500/10 rounded-sm p-5">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[9px] text-gray-600 tracking-widest">ARTIKEL PER HARI</span>
                    <span className="text-[9px] text-cyan-500">{Object.keys(articlesByDay).length} hari aktif</span>
                  </div>
                  <ActivityBars data={articlesByDay} />
                  <div className="mt-3 flex items-center justify-between text-[8px] text-gray-700">
                    <span>Rata-rata: {Object.keys(articlesByDay).length > 0 ? (allArticles.length / Object.keys(articlesByDay).length).toFixed(1) : 0} artikel/hari</span>
                    <span>Total: {allArticles.length} artikel</span>
                  </div>
                </div>

                {/* Top tags */}
                <div className="bg-[#080d1a]/80 border border-cyan-500/10 rounded-sm p-5">
                  <span className="text-[9px] text-gray-600 tracking-widest block mb-4">TOP TAGS</span>
                  <div className="space-y-2">
                    {topTags.map(([tag, count], i) => (
                      <div key={tag} className="flex items-center gap-3"
                        style={{ animation: `fadeInLeft 0.3s ease-out ${i * 50}ms both` }}>
                        <span className="text-[9px] text-gray-500 w-28 truncate shrink-0">{tag}</span>
                        <div className="flex-1 bg-gray-900 rounded-sm h-4 overflow-hidden">
                          <div className="h-full flex items-center px-2 transition-all duration-1000"
                            style={{
                              width: `${(count / (topTags[0][1] as unknown as number)) * 100}%`,
                              background: 'linear-gradient(90deg, rgba(0,243,255,0.3), rgba(0,243,255,0.08))',
                              minWidth: '28px',
                              animation: `barGrow 0.8s ease-out ${i * 60}ms both`,
                            }}>
                            <span className="text-[8px] text-cyan-500">{count}x</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Konfigurasi agent */}
                <div className="bg-[#080d1a]/80 border border-cyan-500/10 rounded-sm p-5">
                  <span className="text-[9px] text-gray-600 tracking-widest block mb-4">KONFIGURASI AGENT</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { icon: Cpu, label: 'AI MODEL', value: 'Groq llama-3.3-70b-versatile' },
                      { icon: Globe, label: 'SEARCH', value: 'Tavily Advanced Search (5 results)' },
                      { icon: Clock, label: 'INTERVAL', value: 'Setiap 2 jam via cron-job.org' },
                      { icon: Database, label: 'STORAGE', value: 'Firebase Firestore (fosht-blog)' },
                      { icon: Zap, label: 'IMAGE', value: 'Pollinations.ai flux model' },
                      { icon: Activity, label: 'DEPLOY', value: 'Vercel Serverless Functions' },
                    ].map((c, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 bg-black/30 border border-gray-800 rounded-sm">
                        <c.icon className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[8px] text-gray-700 tracking-widest block">{c.label}</span>
                          <span className="text-[10px] text-cyan-400 font-bold">{c.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer status */}
        <div className="mt-8 pt-4 border-t border-gray-900 flex items-center justify-between text-[8px] text-gray-700">
          <div className="flex items-center gap-2">
            <PulseDot size={6} />
            <span>Realtime · Firestore listener aktif · No simulation</span>
          </div>
          <span>Last sync: {timeAgo(new Date(lastRefresh).toISOString())} · Auto-refresh: 5m</span>
        </div>
      </div>
    </main>
  );
}