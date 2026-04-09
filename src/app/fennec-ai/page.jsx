'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  collection, getDocs, query, where, orderBy,
  limit, doc, getDoc, onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  ArrowLeft, Bot, Zap, Clock, FileText,
  TrendingUp, Calendar, Eye, Radio, Activity,
  RefreshCw, Cpu, Database, Globe, CheckCircle, ChevronRight
} from 'lucide-react';

// ── helpers
function timeAgo(iso) {
  if (!iso) return '—';
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 60000), h = Math.floor(d / 3600000), dy = Math.floor(d / 86400000);
  if (m < 1) return 'baru saja';
  if (m < 60) return `${m}m lalu`;
  if (h < 24) return `${h}j lalu`;
  return `${dy}h lalu`;
}
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function fmtUptime(s) {
  return `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
}

// ── Animated counter
function Count({ to, duration = 900 }) {
  const [v, setV] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const s = prev.current, e = Number(to) || 0;
    if (s === e) return;
    const t0 = Date.now();
    const frame = () => {
      const p = Math.min((Date.now() - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setV(Math.round(s + (e - s) * ease));
      if (p < 1) requestAnimationFrame(frame);
      else { setV(e); prev.current = e; }
    };
    requestAnimationFrame(frame);
  }, [to]);
  return <>{v.toLocaleString()}</>;
}

// ── Mini bar chart
function Bars({ data }) {
  const entries = Object.entries(data).sort((a, b) => a[0].localeCompare(b[0])).slice(-14);
  const max = Math.max(...entries.map(e => e[1]), 1);
  return (
    <div className="flex items-end gap-1.5 h-20 w-full">
      {entries.map(([day, n], i) => (
        <div key={day} className="flex-1 flex flex-col items-center gap-1 group relative">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#0a1628] border border-cyan-500/30
                          text-[8px] text-cyan-400 px-1.5 py-0.5 rounded whitespace-nowrap
                          opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
            {n} artikel
          </div>
          <div className="w-full rounded-t-sm"
            style={{
              height: `${Math.max((n / max) * 64, n > 0 ? 4 : 0)}px`,
              background: n > 0
                ? 'linear-gradient(to top, rgba(0,243,255,0.7), rgba(0,243,255,0.2))'
                : 'transparent',
              boxShadow: n > 0 ? '0 0 6px rgba(0,243,255,0.25)' : 'none',
              transition: `height 0.7s cubic-bezier(0.34,1.56,0.64,1) ${i * 40}ms`,
            }} />
          <span className="text-[7px] text-gray-700">{day.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

// ── Log entry
const LOG_COLORS = {
  publish: { bg: 'rgba(0,243,255,0.08)', text: '#00f3ff', label: 'PUBLISH' },
  search:  { bg: 'rgba(59,130,246,0.08)', text: '#60a5fa', label: 'SEARCH' },
  generate:{ bg: 'rgba(168,85,247,0.08)', text: '#c084fc', label: 'GENERATE' },
  error:   { bg: 'rgba(239,68,68,0.08)',  text: '#f87171', label: 'ERROR' },
  info:    { bg: 'rgba(255,255,255,0.04)', text: '#6b7280', label: 'INFO' },
};
function LogLine({ log }) {
  const c = LOG_COLORS[log.type] || LOG_COLORS.info;
  // Detect URL in message and make it clickable
  const urlMatch = log.message.match(/(https?:\/\/[^\s]+)/);
  const hasUrl = !!urlMatch;
  return (
    <div className="flex items-start gap-3 py-1.5 border-b border-white/5 text-[11px] font-mono">
      <span className="text-gray-600 shrink-0 w-16">{log.time}</span>
      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0"
        style={{ background: c.bg, color: c.text }}>{c.label}</span>
      <span className="text-gray-400 leading-relaxed break-all flex-1">
        {hasUrl ? (
          <>
            <span>{log.message.split(urlMatch[1])[0]}</span>
            <a href={urlMatch[1]} target="_blank" rel="noopener noreferrer"
              className="text-cyan-500 underline underline-offset-2 hover:text-cyan-300 transition-colors break-all"
              onClick={e => e.stopPropagation()}>
              [CLICK TO FIX INDEX →]
            </a>
          </>
        ) : log.message}
      </span>
    </div>
  );
}

export default function FennecAI() {
  const [articles, setArticles] = useState([]);
  const [usedTopics, setUsedTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('monitor');
  const [logs, setLogs] = useState([]);
  const [uptime, setUptime] = useState(0);
  const [lastSync, setLastSync] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const logRef = useRef(null);
  const unsubRef = useRef(null);

  const addLog = useCallback((msg, type = 'info') => {
    const t = new Date();
    const time = `${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}:${String(t.getSeconds()).padStart(2,'0')}`;
    setLogs(p => [...p.slice(-79), { id: Date.now() + Math.random(), time, message: msg, type }]);
  }, []);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    addLog('Memuat data dari Firestore...', 'search');
    try {
      // Fallback query tanpa composite index
      const snap = await getDocs(query(
        collection(db, 'posts'),
        where('source', '==', 'ai-agent'),
        orderBy('createdAt', 'desc'),
        limit(50)
      ));
      const arts = snap.docs
        .map(d => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate?.()?.toISOString() || null }))
        .filter(a => a.published !== false);
      setArticles(arts);
      addLog(`${arts.length} artikel dimuat`, 'publish');

      const today = new Date().toISOString().slice(0, 10);
      try {
        const st = await getDoc(doc(db, 'agent_state', `used_topics_${today}`));
        if (st.exists()) { setUsedTopics(st.data().topics || []); addLog(`Topik hari ini: ${(st.data().topics||[]).length}`, 'info'); }
      } catch {}

      setLastSync(new Date().toISOString());
      addLog('Sinkronisasi selesai ✓', 'publish');
    } catch (e) {
      addLog(`Error: ${e.message}`, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [addLog]);

  useEffect(() => {
    addLog('FENNEC AI Monitor aktif', 'info');
    addLog('Menghubungkan ke Firestore...', 'search');
    fetchData();

    // Realtime listener
    try {
      const q = query(
        collection(db, 'posts'),
        where('source', '==', 'ai-agent'),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      unsubRef.current = onSnapshot(q, snap => {
        if (!snap.empty) {
          const t = snap.docs[0].data().title;
          if (t) { addLog(`📰 Artikel baru: "${t}"`, 'publish'); fetchData(true); }
        }
      }, err => addLog(`Listener: ${err.message}`, 'error'));
    } catch {}

    const ri = setInterval(() => { addLog('Auto-refresh...', 'info'); fetchData(true); }, 5 * 60 * 1000);
    const ui = setInterval(() => setUptime(p => p + 1), 1000);

    return () => { unsubRef.current?.(); clearInterval(ri); clearInterval(ui); };
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  // ── derived
  const byDay = articles.reduce((acc, a) => {
    if (!a.createdAt) return acc;
    const d = a.createdAt.slice(0,10);
    acc[d] = (acc[d]||0) + 1; return acc;
  }, {});
  const totalViews = articles.reduce((s,a) => s + (a.views||0), 0);
  const allTags = articles.flatMap(a => a.tags||[]);
  const tagCnt = allTags.reduce((a,t)=>{ a[t]=(a[t]||0)+1; return a; },{});
  const topTags = Object.entries(tagCnt).sort((a,b)=>b[1]-a[1]).slice(0,12);

  const stats = [
    { label: 'ARTIKEL', value: articles.length, icon: FileText },
    { label: 'TOTAL VIEWS', value: totalViews, icon: Eye },
    { label: 'HARI AKTIF', value: Object.keys(byDay).length, icon: Calendar },
    { label: 'TOPIK HARI INI', value: usedTopics.length, icon: TrendingUp },
  ];

  return (
    <main className="min-h-screen bg-[#04080f] text-white" style={{ fontFamily: "'Courier New', monospace" }}>

      <style>{`
        .scanline {
          position: fixed; top: 0; left: 0; right: 0; height: 2px; z-index: 999;
          background: linear-gradient(90deg, transparent 0%, rgba(0,243,255,0.15) 50%, transparent 100%);
          animation: scan 5s linear infinite;
        }
        @keyframes scan { from { transform: translateY(0); } to { transform: translateY(100vh); } }
        .grid-bg {
          background-image:
            linear-gradient(rgba(0,243,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,243,255,0.025) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%,100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(2); opacity: 0; }
        }
        .fade-up { animation: fadeUp 0.4s ease-out both; }
        .card {
          background: rgba(8,13,26,0.8);
          border: 1px solid rgba(0,243,255,0.08);
          border-radius: 4px;
          backdrop-filter: blur(4px);
        }
        .card:hover { border-color: rgba(0,243,255,0.18); }
        .tab-active { border-bottom: 2px solid #00f3ff; color: #00f3ff; }
        .tab-inactive { border-bottom: 2px solid transparent; color: #4b5563; }
        .tab-inactive:hover { color: #9ca3af; }
      `}</style>

      {/* Scanline */}
      <div className="scanline" />
      {/* Grid bg */}
      <div className="fixed inset-0 grid-bg pointer-events-none" />

      {/* ── NAV */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#04080f]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[11px] tracking-[3px] text-gray-500 hover:text-cyan-400 transition-colors">
            <ArrowLeft className="w-3 h-3" /> HOME
          </Link>
          <div className="flex items-center gap-2">
            <span className="relative inline-flex w-2 h-2">
              <span className="absolute inline-flex w-full h-full rounded-full bg-cyan-400 opacity-60"
                style={{ animation: 'pulse-ring 1.5s ease-in-out infinite' }} />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-cyan-400" />
            </span>
            <span className="text-[10px] tracking-[2px] text-cyan-500 font-bold">FENNEC AI · LIVE</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-700 tabular-nums">{fmtUptime(uptime)}</span>
            <button onClick={() => fetchData()} disabled={refreshing}
              className="text-gray-600 hover:text-cyan-400 transition-colors disabled:opacity-30">
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10 space-y-6">

        {/* ── HERO */}
        <div className="fade-up flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-sm card flex items-center justify-center shrink-0"
              style={{ boxShadow: '0 0 20px rgba(0,243,255,0.08)' }}>
              <img src="/fosht.png" alt="Fennec AI" className="w-9 h-9 object-contain" />
              <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-cyan-400"
                style={{ boxShadow: '0 0 8px #00f3ff' }} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">FENNEC AI</h1>
              <p className="text-[10px] text-cyan-500 tracking-[3px] mt-0.5">AUTONOMOUS RESEARCH & PUBLISHING AGENT</p>
              <p className="text-[9px] text-gray-600 mt-1">/sys/agent/monitor · realtime · no simulation</p>
            </div>
          </div>
          <div className="hidden sm:grid grid-cols-2 gap-x-6 gap-y-1 text-[9px] text-gray-600">
            {[
              [Cpu,      'Groq llama-3.3-70b-versatile'],
              [Globe,    'Tavily Advanced Search'],
              [Clock,    'Auto-publish setiap 2 jam'],
              [Database, 'Firebase Firestore · Realtime'],
            ].map(([Icon, txt], i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Icon className="w-3 h-3 text-cyan-600" />
                <span>{txt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s, i) => (
            <div key={i} className="card p-4 fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-center gap-2 mb-2">
                <s.icon className="w-3.5 h-3.5 text-cyan-500" />
                <span className="text-[8px] text-gray-600 tracking-widest">{s.label}</span>
              </div>
              <div className="text-2xl font-black text-cyan-400">
                {loading ? <span className="animate-pulse text-gray-700">—</span> : <Count to={s.value} />}
              </div>
            </div>
          ))}
        </div>

        {/* ── TABS */}
        <div className="flex gap-0 border-b border-white/5">
          {[['monitor','⚡ MONITOR'],['articles','📄 ARTIKEL'],['analytics','📊 ANALITIK']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`px-5 py-2.5 text-[10px] tracking-widest font-bold transition-all ${tab===id ? 'tab-active' : 'tab-inactive'}`}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-7 h-7 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
            <p className="text-[10px] text-gray-700 tracking-widest animate-pulse">MENGHUBUNGKAN KE FIRESTORE...</p>
          </div>
        ) : (
          <>
            {/* ── MONITOR */}
            {tab === 'monitor' && (
              <div className="space-y-4">

                {/* Log stream */}
                <div className="card overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between"
                    style={{ background: 'rgba(0,243,255,0.02)' }}>
                    <div className="flex items-center gap-2">
                      <span className="relative inline-flex w-1.5 h-1.5">
                        <span className="absolute w-full h-full rounded-full bg-cyan-400 opacity-60 animate-ping" />
                        <span className="relative w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      </span>
                      <span className="text-[9px] text-cyan-500 tracking-widest font-bold">LIVE LOG STREAM</span>
                    </div>
                    <span className="text-[8px] text-gray-700">{logs.length} entries</span>
                  </div>
                  <div ref={logRef} className="h-52 overflow-y-auto px-4 py-2 scroll-smooth"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,243,255,0.1) transparent' }}>
                    {logs.map(l => <LogLine key={l.id} log={l} />)}
                    <div className="text-cyan-500/60 text-xs mt-1 animate-pulse">&gt;_</div>
                  </div>
                </div>

                {/* Chart + Topics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[9px] text-gray-600 tracking-widest">ARTIKEL PER HARI</span>
                      <span className="text-[9px] text-cyan-600">{articles.length} total</span>
                    </div>
                    {Object.keys(byDay).length > 0
                      ? <Bars data={byDay} />
                      : <div className="h-20 flex items-center justify-center text-gray-800 text-xs">Belum ada data</div>
                    }
                  </div>

                  <div className="card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-cyan-500" />
                        <span className="text-[9px] text-gray-600 tracking-widest">TOPIK HARI INI</span>
                      </div>
                      <span className="text-[9px] text-cyan-600">{usedTopics.length} diriset</span>
                    </div>
                    {usedTopics.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                        {usedTopics.map((t, i) => (
                          <span key={i} className="flex items-center gap-1 text-[9px] px-2 py-1
                                                   bg-cyan-500/5 text-cyan-700 border border-cyan-500/15 rounded-sm"
                            style={{ animationDelay: `${i*30}ms` }}>
                            <CheckCircle className="w-2.5 h-2.5 shrink-0" />
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-20 text-gray-700 text-xs text-center">
                        Menunggu run pertama hari ini...
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent articles */}
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] text-gray-600 tracking-widest">ARTIKEL TERBARU</span>
                    <Link href="/blog/fosht-blog"
                      className="text-[9px] text-cyan-600 hover:text-cyan-400 transition-colors flex items-center gap-1">
                      LIHAT SEMUA <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {articles.slice(0, 6).map((a, i) => (
                      <Link key={a.id} href={`/blog/${a.slug}`}
                        className="group flex gap-3 p-2.5 rounded-sm border border-white/5 hover:border-cyan-500/20
                                   transition-all bg-black/20 hover:bg-black/40">
                        <div className="w-14 h-12 rounded-sm overflow-hidden shrink-0 bg-gray-900">
                          {a.coverImage
                            ? <img src={a.coverImage} alt={a.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-opacity" />
                            : <div className="w-full h-full flex items-center justify-center"><Bot className="w-4 h-4 text-gray-700" /></div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-[10px] font-bold line-clamp-2 group-hover:text-cyan-400 transition-colors leading-snug">
                            {a.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[8px] text-gray-600">
                            <span>{timeAgo(a.createdAt)}</span>
                            <span className="flex items-center gap-0.5"><Eye className="w-2 h-2" />{a.views||0}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── ARTIKEL */}
            {tab === 'articles' && (
              <div className="space-y-1.5">
                <p className="text-[9px] text-gray-600 tracking-widest mb-3">
                  {articles.length} ARTIKEL DIPUBLISH OLEH FENNEC AI AGENT
                </p>
                {articles.map((a, i) => (
                  <Link key={a.id} href={`/blog/${a.slug}`}
                    className="card flex items-center gap-3 p-3 hover:border-cyan-500/20 transition-all group">
                    <span className="text-[9px] text-gray-700 w-5 text-right shrink-0">{i+1}</span>
                    <div className="w-11 h-9 rounded-sm overflow-hidden shrink-0 bg-gray-900">
                      {a.coverImage
                        ? <img src={a.coverImage} alt={a.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-opacity" />
                        : <div className="w-full h-full flex items-center justify-center"><FileText className="w-3 h-3 text-gray-700" /></div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white text-[11px] font-bold truncate group-hover:text-cyan-400 transition-colors">
                        {a.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-0.5 text-[8px] text-gray-600">
                        <span>{fmtDate(a.createdAt)}</span>
                        <span className="flex items-center gap-0.5"><Eye className="w-2 h-2" />{a.views||0}</span>
                      </div>
                    </div>
                    <div className="hidden md:flex gap-1 shrink-0">
                      {(a.tags||[]).slice(0,2).map(t => (
                        <span key={t} className="text-[8px] px-1.5 py-0.5 bg-cyan-500/5 text-cyan-800 border border-cyan-500/10 rounded-sm">
                          {t}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* ── ANALITIK */}
            {tab === 'analytics' && (
              <div className="space-y-4">

                <div className="card p-5">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[9px] text-gray-600 tracking-widest">DISTRIBUSI ARTIKEL PER HARI</span>
                    <span className="text-[9px] text-cyan-600">
                      avg {Object.keys(byDay).length > 0 ? (articles.length / Object.keys(byDay).length).toFixed(1) : 0}/hari
                    </span>
                  </div>
                  {Object.keys(byDay).length > 0
                    ? <Bars data={byDay} />
                    : <div className="h-20 flex items-center justify-center text-gray-700 text-xs">Belum ada data</div>
                  }
                </div>

                <div className="card p-5">
                  <span className="text-[9px] text-gray-600 tracking-widest block mb-4">TOP TAGS</span>
                  <div className="space-y-2">
                    {topTags.map(([tag, n], i) => (
                      <div key={tag} className="flex items-center gap-3">
                        <span className="text-[9px] text-gray-500 w-28 truncate shrink-0">{tag}</span>
                        <div className="flex-1 h-4 bg-black/40 rounded-sm overflow-hidden border border-white/5">
                          <div className="h-full flex items-center px-2 transition-all duration-1000"
                            style={{
                              width: `${(n/topTags[0][1])*100}%`,
                              background: 'linear-gradient(90deg, rgba(0,243,255,0.3), rgba(0,243,255,0.06))',
                              minWidth: '28px',
                              transitionDelay: `${i*40}ms`,
                            }}>
                            <span className="text-[8px] text-cyan-600">{n}x</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card p-5">
                  <span className="text-[9px] text-gray-600 tracking-widest block mb-4">SEMUA TAGS ({Object.keys(tagCnt).length})</span>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(tagCnt).sort((a,b)=>b[1]-a[1]).map(([tag, n]) => (
                      <span key={tag} className="text-[9px] px-2 py-1 bg-cyan-500/5 text-cyan-700 border border-cyan-500/10 rounded-sm">
                        {tag} <span className="text-gray-700">({n})</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="card p-5">
                  <span className="text-[9px] text-gray-600 tracking-widest block mb-4">KONFIGURASI AGENT</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      [Cpu,      'AI MODEL',    'Groq llama-3.3-70b-versatile'],
                      [Globe,    'SEARCH',      'Tavily Advanced (5 results)'],
                      [Clock,    'INTERVAL',    'Setiap 2 jam via cron-job.org'],
                      [Database, 'STORAGE',     'Firebase Firestore'],
                      [Zap,      'IMAGE',       'Pollinations.ai (flux)'],
                      [Activity, 'DEPLOY',      'Vercel Serverless'],
                    ].map(([Icon, label, val], i) => (
                      <div key={i} className="flex items-start gap-2 p-3 bg-black/30 border border-white/5 rounded-sm">
                        <Icon className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[8px] text-gray-700 tracking-widest block">{label}</span>
                          <span className="text-[10px] text-cyan-400 font-bold">{val}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── FOOTER STATUS */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2
                        pt-4 border-t border-white/5 text-[8px] text-gray-700">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Realtime · Firestore listener aktif · No simulation · Data nyata</span>
          </div>
          <span>Last sync: {lastSync ? timeAgo(lastSync) : '—'} · Auto-refresh: 5 menit</span>
        </div>
      </div>
    </main>
  );
}