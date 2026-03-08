'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import {
  Terminal, Clock, ArrowRight, Rss,
  TrendingUp, ChevronLeft, ChevronRight,
  Flame, Zap, Globe
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Ambil trending keywords dari Google Trends RSS (gratis, no key)
// Lalu cocokkan dengan tags/judul/excerpt artikel
// ─────────────────────────────────────────────────────────────
async function fetchTrendingTopics() {
  try {
    // Google Trends Daily RSS — Indonesia (geo=ID)
    const rssUrl = 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=ID';
    const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&count=20`;
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error('RSS failed');
    const data = await res.json();
    if (data.status !== 'ok') throw new Error('RSS error');
    return data.items.map(item => item.title.toLowerCase().trim());
  } catch {
    // Fallback: global trends via rss2json
    try {
      const globalUrl = 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=US';
      const proxy = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(globalUrl)}&count=20`;
      const res = await fetch(proxy);
      const data = await res.json();
      if (data.status === 'ok') return data.items.map(i => i.title.toLowerCase().trim());
    } catch {}
    return [];
  }
}

// Hitung skor trending: seberapa banyak kata trending cocok dgn artikel
function trendScore(post, trendingKeywords) {
  if (!trendingKeywords.length) return 0;
  const haystack = [
    post.title || '',
    post.excerpt || '',
    ...(post.tags || []),
  ].join(' ').toLowerCase();

  let score = 0;
  const matched = [];
  trendingKeywords.forEach(kw => {
    const words = kw.split(/\s+/);
    const match = words.some(w => w.length > 3 && haystack.includes(w));
    if (match) { score++; matched.push(kw); }
  });
  return { score, matched: [...new Set(matched)].slice(0, 3) };
}

// Extract gambar pertama dari HTML konten
function extractFirstImage(html) {
  if (!html) return null;
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

const formatDate = (ts) => {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ─────────────────────────────────────────────────────────────
// FEATURED SLIDER COMPONENT
// ─────────────────────────────────────────────────────────────
function FeaturedSlider({ posts }) {
  const [idx, setIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef(null);

  const go = useCallback((dir) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setIdx(i => (i + dir + posts.length) % posts.length);
      setAnimating(false);
    }, 300);
  }, [animating, posts.length]);

  // Auto-advance
  useEffect(() => {
    timerRef.current = setInterval(() => go(1), 5000);
    return () => clearInterval(timerRef.current);
  }, [go]);

  if (!posts.length) return null;
  const post = posts[idx];
  const img = post._image;

  return (
    <div className="relative mb-14 group">
      {/* Glow border */}
      <div className="absolute -inset-px rounded-sm bg-gradient-to-r from-cyan-500/20 via-transparent to-cyan-500/10 pointer-events-none z-10" />

      <Link href={`/blog/${post.slug}`}>
        <div className={`relative overflow-hidden rounded-sm border border-gray-800 bg-[#080d1a] transition-opacity duration-300 ${animating ? 'opacity-0' : 'opacity-100'}`}
          style={{ minHeight: 280 }}>

          {/* Background image */}
          {img && (
            <div className="absolute inset-0 z-0">
              <img src={img} alt="" className="w-full h-full object-cover opacity-20 scale-105 group-hover:scale-100 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#080d1a] via-[#080d1a]/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080d1a] via-transparent to-transparent" />
            </div>
          )}

          {/* Content */}
          <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col justify-end" style={{ minHeight: 280 }}>
            {/* Featured badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-sm tracking-[3px] font-bold">FEATURED</span>
              {post._trending?.score > 0 && (
                <span className="text-[10px] text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-sm tracking-[2px] font-bold flex items-center gap-1">
                  <Flame className="w-2.5 h-2.5" /> TRENDING
                </span>
              )}
            </div>

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {post.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 bg-white/5 text-gray-400 border border-white/10 rounded-sm">{tag}</span>
                ))}
              </div>
            )}

            {/* Title */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight mb-3 group-hover:text-cyan-400 transition-colors max-w-2xl">
              {post.title}
            </h2>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-gray-400 text-sm leading-relaxed max-w-xl line-clamp-2 mb-4">
                {post.excerpt}
              </p>
            )}

            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(post.createdAt)}</span>
              {post.readTime && <span>{post.readTime} min read</span>}
              <span className="text-cyan-500 flex items-center gap-1 ml-auto group-hover:gap-2 transition-all">
                Read <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Slider controls */}
      {posts.length > 1 && (
        <>
          <button onClick={(e) => { e.preventDefault(); go(-1); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-sm bg-black/60 border border-gray-700 text-gray-400 hover:text-white hover:border-cyan-500/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.preventDefault(); go(1); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-sm bg-black/60 border border-gray-700 text-gray-400 hover:text-white hover:border-cyan-500/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 right-6 z-20 flex items-center gap-1.5">
            {posts.map((_, i) => (
              <button key={i} onClick={(e) => { e.preventDefault(); setIdx(i); }}
                className={`rounded-sm transition-all duration-300 ${i === idx ? 'w-4 h-1.5 bg-cyan-400' : 'w-1.5 h-1.5 bg-gray-700 hover:bg-gray-500'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TRENDING MATCH BADGE
// ─────────────────────────────────────────────────────────────
function TrendBadge({ trending }) {
  if (!trending?.score) return null;
  return (
    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
      <Flame className="w-3 h-3 text-orange-400 shrink-0" />
      {trending.matched.map(kw => (
        <span key={kw} className="text-[9px] px-1.5 py-0.5 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-sm tracking-wider capitalize">
          {kw}
        </span>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function BlogPage() {
  const [posts, setPosts]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState('ALL');
  const [allTags, setAllTags]         = useState([]);
  const [showAllTags, setShowAllTags] = useState(false);
  const [trendingKw, setTrendingKw]   = useState([]);
  const [trendLoaded, setTrendLoaded] = useState(false);

  const MAX_VISIBLE_TAGS = 6;

  useEffect(() => {
    const loadPosts = async () => {
      const q = query(
        collection(db, 'posts'),
        where('published', '==', true),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Extract first image dari konten
      const withImages = data.map(p => ({
        ...p,
        _image: p.coverImage || extractFirstImage(p.content),
        _trending: { score: 0, matched: [] },
      }));

      setPosts(withImages);
      const uniqueTags = [...new Set(data.flatMap(p => p.tags || []))];
      setAllTags(uniqueTags);
      setLoading(false);

      // Load trending async setelah posts tampil
      const kw = await fetchTrendingTopics();
      setTrendingKw(kw);
      if (kw.length) {
        setPosts(prev => prev.map(p => ({
          ...p,
          _trending: trendScore(p, kw),
        })).sort((a, b) => {
          // Sort: trending dulu, lalu by date
          if (b._trending.score !== a._trending.score) return b._trending.score - a._trending.score;
          return 0; // pertahankan urutan createdAt
        }));
      }
      setTrendLoaded(true);
    };
    loadPosts();
  }, []);

  const filtered = filter === 'ALL' ? posts : posts.filter(p => p.tags?.includes(filter));

  // Featured = 3 post pertama (trending diutamakan)
  const featuredPosts = posts.slice(0, Math.min(3, posts.length));
  // Regular list = semua yang lain
  const HOME_LIMIT = 5;
  const listPosts = filtered.slice(0, HOME_LIMIT);
  const hasMore = filtered.length > HOME_LIMIT;

  const visibleTags = showAllTags ? allTags : allTags.slice(0, MAX_VISIBLE_TAGS);
  const hasMoreTags = allTags.length > MAX_VISIBLE_TAGS;

  return (
    <main className="min-h-screen bg-[#050505] text-white font-mono">

      {/* ── STICKY NAV ── */}
      <div className="border-b border-gray-800 bg-black/60 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="text-cyan-400 text-xs tracking-[3px] hover:text-cyan-300 transition-colors flex items-center gap-1.5 shrink-0">
            ← FOSHT.SYS
          </Link>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            {trendLoaded && trendingKw.length > 0 && (
              <span className="hidden sm:flex items-center gap-1 text-orange-500/70">
                <TrendingUp className="w-3 h-3" /> trending active
              </span>
            )}
            <div className="flex items-center gap-1.5">
              <Rss className="w-3 h-3 text-cyan-500" />
              <span className="text-cyan-500 font-bold">{posts.length}</span>
              <span>POSTS</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

        {/* ── HEADER ── */}
        <div className="mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-sm mb-4">
            <Terminal className="w-3 h-3 text-cyan-400" />
            <span className="text-cyan-400 text-[10px] tracking-[3px]">SYSTEM LOGS / BLOG</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
            Notes & Articles
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-lg">
            Thoughts on web development, AI, crypto, and digital systems — by Febri Osht.
          </p>

          {/* Trending indicator */}
          {trendLoaded && posts.some(p => p._trending?.score > 0) && (
            <div className="flex items-center gap-2 mt-4 text-xs text-orange-400/80">
              <Flame className="w-3.5 h-3.5" />
              <span>Articles sorted by current internet trends</span>
              <Globe className="w-3 h-3 opacity-60" />
            </div>
          )}
        </div>

        {/* ── FEATURED SLIDER ── */}
        {!loading && featuredPosts.length > 0 && (
          <FeaturedSlider posts={featuredPosts} />
        )}

        {/* ── TAG FILTER — compact, collapsible ── */}
        {allTags.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] text-gray-700 tracking-[2px]">FILTER</span>
              <div className="h-px flex-1 bg-gray-800" />
              {hasMoreTags && (
                <button onClick={() => setShowAllTags(p => !p)}
                  className="text-[10px] text-gray-600 hover:text-cyan-400 transition-colors">
                  {showAllTags ? '▲ less' : `+${allTags.length - MAX_VISIBLE_TAGS} more`}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setFilter('ALL')}
                className={`text-[10px] px-3 py-1.5 rounded-sm border transition-all font-bold tracking-wider ${
                  filter === 'ALL'
                    ? 'bg-cyan-500 text-black border-cyan-500'
                    : 'border-gray-800 text-gray-500 hover:border-cyan-500/40 hover:text-cyan-400'
                }`}>
                ALL
              </button>
              {visibleTags.map(tag => {
                const hasTrending = posts.some(p => p.tags?.includes(tag) && p._trending?.score > 0);
                return (
                  <button key={tag} onClick={() => setFilter(tag)}
                    className={`text-[10px] px-3 py-1.5 rounded-sm border transition-all relative ${
                      filter === tag
                        ? 'bg-cyan-500 text-black border-cyan-500 font-bold'
                        : 'border-gray-800 text-gray-500 hover:border-cyan-500/40 hover:text-cyan-400'
                    }`}>
                    {tag}
                    {hasTrending && filter !== tag && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── POST LIST ── */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-800 p-5 rounded-sm animate-pulse">
                <div className="h-3 bg-gray-800 rounded w-1/4 mb-3" />
                <div className="h-5 bg-gray-800 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-800 rounded w-full" />
              </div>
            ))}
          </div>
        ) : listPosts.length === 0 ? (
          <div className="text-center py-20 text-gray-700">
            <Terminal className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No posts yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {listPosts.map((post) => {
              const img = post._image;
              const isTrending = post._trending?.score > 0;
              return (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <article className={`group border rounded-sm transition-all duration-200 overflow-hidden ${
                    isTrending
                      ? 'border-orange-500/20 bg-orange-500/[0.02] hover:border-orange-500/40 hover:bg-orange-500/[0.04]'
                      : 'border-gray-800 bg-black/20 hover:border-cyan-500/30 hover:bg-black/40'
                  }`}>
                    <div className="flex items-stretch gap-0">

                      {/* Thumbnail — hanya jika ada gambar */}
                      {img && (
                        <div className="w-24 sm:w-36 shrink-0 overflow-hidden relative">
                          <img src={img} alt={post.title}
                            className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#050505]/60" />
                        </div>
                      )}

                      {/* Content */}
                      <div className={`flex-1 min-w-0 p-4 sm:p-5 flex flex-col justify-between ${!img ? 'pl-5' : ''}`}>
                        <div>
                          {/* Tags row — max 3, compact */}
                          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                            {isTrending && (
                              <span className="text-[9px] px-1.5 py-0.5 bg-orange-500/15 text-orange-400 border border-orange-500/25 rounded-sm flex items-center gap-1 font-bold tracking-wider">
                                <Flame className="w-2 h-2" /> TRENDING
                              </span>
                            )}
                            {post.tags?.slice(0, 3).map(tag => (
                              <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-cyan-500/8 text-cyan-600 border border-cyan-500/15 rounded-sm tracking-wider">
                                {tag}
                              </span>
                            ))}
                            {(post.tags?.length || 0) > 3 && (
                              <span className="text-[9px] text-gray-700">+{post.tags.length - 3}</span>
                            )}
                          </div>

                          {/* Title */}
                          <h2 className={`font-bold leading-snug mb-1.5 transition-colors line-clamp-2 ${
                            isTrending
                              ? 'text-white group-hover:text-orange-300 text-sm sm:text-base'
                              : 'text-white group-hover:text-cyan-400 text-sm sm:text-base'
                          }`}>
                            {post.title}
                          </h2>

                          {/* Excerpt */}
                          {post.excerpt && (
                            <p className="text-gray-600 text-xs leading-relaxed line-clamp-2 hidden sm:block">
                              {post.excerpt}
                            </p>
                          )}

                          {/* Trending match keywords */}
                          <TrendBadge trending={post._trending} />
                        </div>

                        {/* Meta bottom */}
                        <div className="flex items-center gap-3 mt-3 text-[10px] text-gray-700">
                          <span className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {formatDate(post.createdAt)}
                          </span>
                          {post.readTime && <span>{post.readTime} min</span>}
                          <ArrowRight className={`w-3 h-3 ml-auto transition-all ${
                            isTrending
                              ? 'text-orange-600 group-hover:text-orange-400 group-hover:translate-x-1'
                              : 'text-gray-700 group-hover:text-cyan-400 group-hover:translate-x-1'
                          }`} />
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}

        {/* ── LIHAT SEMUA ── */}
        {!loading && hasMore && (
          <div className="mt-8 flex flex-col items-center gap-3">
            {/* Divider with count */}
            <div className="flex items-center gap-3 w-full">
              <div className="h-px flex-1 bg-gray-900" />
              <span className="text-[10px] text-gray-700 tracking-[2px]">
                +{filtered.length - HOME_LIMIT} ARTIKEL LAINNYA
              </span>
              <div className="h-px flex-1 bg-gray-900" />
            </div>
            <Link href="/blog/semua"
              className="inline-flex items-center gap-2 px-8 py-3 bg-cyan-500/5 border border-cyan-500/25 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/50 rounded-sm transition-all text-xs font-bold tracking-wider group">
              <span>Lihat Semua {posts.length} Artikel</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}

        {/* ── FOOTER INFO ── */}
        {!loading && posts.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-900 flex items-center justify-between text-[10px] text-gray-800">
            <span>{posts.length} artikel · diperbarui otomatis</span>
            {trendLoaded && (
              <span className="flex items-center gap-1">
                <Zap className="w-2.5 h-2.5 text-orange-800" />
                trend data: Google Trends ID + Global
              </span>
            )}
          </div>
        )}
      </div>
    </main>
  );
}