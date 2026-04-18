'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { X, Bot, Zap, Clock, FileText, TrendingUp, ChevronRight, Radio } from 'lucide-react';

// ── Format relative time
function timeAgo(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

// ── Fetch agent data dari Firestore
async function fetchAgentData() {
  // 1. Artikel dari AI agent
  const postsSnap = await getDocs(query(
    collection(db, 'posts'),
    where('published', '==', true),
    where('source', '==', 'ai-agent'),
    orderBy('createdAt', 'desc'),
    limit(5)
  ));
  const articles = postsSnap.docs.map(d => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate?.()?.toISOString() || null,
  }));

  // 2. Total artikel agent
  const totalSnap = await getDocs(query(
    collection(db, 'posts'),
    where('source', '==', 'ai-agent'),
    where('published', '==', true)
  ));
  const totalArticles = totalSnap.size;

  // 3. Topik hari ini dari agent_state
  const today = new Date().toISOString().slice(0, 10);
  let usedTopics = [];
  try {
    const stateSnap = await getDoc(doc(db, 'agent_state', `used_topics_${today}`));
    if (stateSnap.exists()) usedTopics = stateSnap.data().topics || [];
  } catch {}

  return { articles, totalArticles, usedTopics };
}

// ── Floating Button + Slide Panel
export function AgentFloatingWidget() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (open && !data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);
      fetchAgentData().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(p => !p)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
        style={{
          background: open ? '#00f3ff' : 'linear-gradient(135deg, #0a0f1e, #0d1a2e)',
          border: '1px solid rgba(0,243,255,0.4)',
          boxShadow: open
            ? '0 0 24px rgba(0,243,255,0.6)'
            : '0 0 16px rgba(0,243,255,0.2)',
        }}
        title="FOSHT AI Agent"
      >
        {open ? (
          <X className="w-5 h-5 text-black" />
        ) : (
          <img src="/fosht.png" alt="AI Agent" className="w-8 h-8 object-contain" />
        )}
        {/* Live pulse indicator */}
        {!open && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-cyan-400"
            style={{ boxShadow: '0 0 6px #00f3ff', animation: 'ping 1.5s infinite' }} />
        )}
      </button>

      {/* Slide Panel */}
      {open && (
        <div ref={panelRef}
          className="fixed bottom-24 right-6 z-50 w-80 rounded-sm overflow-hidden"
          style={{
            background: '#080d1a',
            border: '1px solid rgba(0,243,255,0.2)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.8), 0 0 20px rgba(0,243,255,0.05)',
            animation: 'slideUp 0.2s ease-out',
          }}>

          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-3"
            style={{ background: 'rgba(0,243,255,0.03)' }}>
            <div className="w-7 h-7 rounded-sm overflow-hidden border border-cyan-500/30 flex items-center justify-center bg-cyan-500/10">
              <img src="/fosht.png" alt="Agent" className="w-5 h-5 object-contain" />
            </div>
            <div className="flex-1">
              <p className="text-white text-xs font-bold tracking-wider">FOSHT AI AGENT</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" style={{ boxShadow: '0 0 4px #00f3ff' }} />
                <span className="text-[9px] text-cyan-500 tracking-widest">ACTIVE · AUTO-PUBLISHING</span>
              </div>
            </div>
            <Radio className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
            </div>
          ) : data ? (
            <div className="p-4 space-y-4">

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-black/40 border border-gray-800 rounded-sm p-3 text-center">
                  <div className="text-xl font-black text-cyan-400">{data.totalArticles}</div>
                  <div className="text-[9px] text-gray-600 tracking-widest mt-0.5">ARTIKEL DITULIS</div>
                </div>
                <div className="bg-black/40 border border-gray-800 rounded-sm p-3 text-center">
                  <div className="text-xl font-black text-cyan-400">{data.usedTopics.length}</div>
                  <div className="text-[9px] text-gray-600 tracking-widest mt-0.5">TOPIK HARI INI</div>
                </div>
              </div>

              {/* Used topics today */}
              {data.usedTopics.length > 0 && (
                <div>
                  <p className="text-[9px] text-gray-700 tracking-widest mb-2">TOPIK HARI INI</p>
                  <div className="flex flex-wrap gap-1">
                    {data.usedTopics.slice(0, 4).map((t, i) => (
                      <span key={i} className="text-[9px] px-2 py-0.5 bg-cyan-500/8 text-cyan-700 border border-cyan-500/15 rounded-sm">
                        {t.slice(0, 25)}{t.length > 25 ? '...' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Latest articles */}
              <div>
                <p className="text-[9px] text-gray-700 tracking-widest mb-2">ARTIKEL TERBARU</p>
                <div className="space-y-2">
                  {data.articles.slice(0, 3).map(a => (
                    <Link key={a.id} href={`/blog/${a.slug}`}
                      className="flex items-start gap-2 group hover:bg-white/3 rounded-sm p-1.5 -mx-1.5 transition-colors">
                      <div className="w-10 h-10 rounded-sm overflow-hidden shrink-0 bg-gray-900 border border-gray-800">
                        {a.coverImage ? (
                          <img src={a.coverImage} alt={a.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText className="w-3 h-3 text-gray-700" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-[10px] font-bold leading-tight line-clamp-2 group-hover:text-cyan-400 transition-colors">
                          {a.title}
                        </p>
                        <p className="text-gray-700 text-[9px] mt-0.5">{timeAgo(a.createdAt)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <Link href="/blog/fosht-blog"
                className="flex items-center justify-between w-full px-3 py-2 bg-cyan-500/8 border border-cyan-500/20 rounded-sm text-cyan-400 text-[10px] font-bold tracking-wider hover:bg-cyan-500/15 transition-colors">
                <span>LIHAT SEMUA ARTIKEL</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-700 text-xs">Gagal memuat data</div>
          )}

          <style>{`
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(12px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes ping {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.4); opacity: 0.6; }
            }
          `}</style>
        </div>
      )}
    </>
  );
}

// ── Section untuk halaman personal/utama
export function AgentSection() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgentData()
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="relative z-10 py-20 border-t border-gray-900 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm border border-cyan-500/30 bg-cyan-500/8 flex items-center justify-center">
              <img src="/fosht.png" alt="AI Agent" className="w-6 h-6 object-contain" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
                FOSHT AI AGENT
                <span className="text-[9px] px-2 py-0.5 bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 rounded-sm tracking-widest font-mono">LIVE</span>
              </h2>
              <p className="text-gray-500 font-mono text-xs">/sys/agent/activity</p>
            </div>
          </div>
          <Link href="/blog/fosht-blog"
            className="text-[10px] text-cyan-500 border border-cyan-500/20 px-3 py-1.5 rounded-sm hover:bg-cyan-500/10 transition-colors tracking-widest font-mono">
            ALL ARTICLES →
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
          </div>
        ) : data ? (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {[
                { label: 'TOTAL ARTIKEL', value: data.totalArticles, icon: FileText },
                { label: 'TOPIK HARI INI', value: data.usedTopics.length, icon: TrendingUp },
                { label: 'INTERVAL', value: '2 JAM', icon: Clock },
                { label: 'STATUS', value: 'AKTIF', icon: Zap },
              ].map((s, i) => (
                <div key={i} className="bg-[#080d1a] border border-gray-800 rounded-sm p-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-cyan-500/8 border border-cyan-500/15 rounded-sm flex items-center justify-center shrink-0">
                    <s.icon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-white font-black text-lg leading-none">{s.value}</div>
                    <div className="text-[9px] text-gray-600 tracking-widest mt-0.5">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Topics used today */}
            {data.usedTopics.length > 0 && (
              <div className="mb-8 bg-[#080d1a] border border-gray-800 rounded-sm p-4">
                <p className="text-[9px] text-gray-600 tracking-widest mb-3">TOPIK YANG SUDAH DIRISET HARI INI</p>
                <div className="flex flex-wrap gap-2">
                  {data.usedTopics.map((t, i) => (
                    <span key={i} className="text-[10px] px-2.5 py-1 bg-cyan-500/6 text-cyan-700 border border-cyan-500/15 rounded-sm font-mono">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Latest articles grid */}
            <div>
              <p className="text-[9px] text-gray-600 tracking-widest mb-4">ARTIKEL TERBARU DARI AI AGENT</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.articles.map(a => (
                  <Link key={a.id} href={`/blog/${a.slug}`}
                    className="group bg-[#080d1a] border border-gray-800 rounded-sm overflow-hidden hover:border-cyan-500/30 transition-all duration-200">
                    <div className="relative h-32 overflow-hidden bg-gray-900">
                      {a.coverImage ? (
                        <img src={a.coverImage} alt={a.title}
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Bot className="w-8 h-8 text-gray-800" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#080d1a] via-transparent to-transparent" />
                      <div className="absolute top-2 right-2">
                        <span className="text-[8px] px-1.5 py-0.5 bg-black/60 text-cyan-500 border border-cyan-500/20 rounded-sm tracking-widest">
                          AI
                        </span>
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {(a.tags || []).slice(0, 2).map(tag => (
                          <span key={tag} className="text-[8px] px-1.5 py-0.5 bg-cyan-500/6 text-cyan-700 border border-cyan-500/12 rounded-sm">{tag}</span>
                        ))}
                      </div>
                      <h3 className="text-white text-xs font-bold leading-snug line-clamp-2 group-hover:text-cyan-400 transition-colors mb-2">
                        {a.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-gray-700">{timeAgo(a.createdAt)}</span>
                        <ChevronRight className="w-3 h-3 text-gray-700 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="py-16 text-center text-gray-700 text-sm">Gagal memuat data agent</div>
        )}
      </div>
    </section>
  );
}