'use client';

import { useEffect, useState, useRef } from 'react';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import {
  Terminal, Clock, ArrowRight, Search, X,
  Flame, TrendingUp, Globe, Zap, SlidersHorizontal,
  ChevronDown, LayoutGrid, List, RefreshCw, ArrowLeft, Eye
} from 'lucide-react';

// ─────────────────────────────────────────────
// Google Trends — ID + US + GB + SG + AU combined
// ─────────────────────────────────────────────
async function fetchAllTrends() {
  const geos = ['ID', 'US', 'GB', 'SG', 'AU'];
  const proxy = 'https://api.rss2json.com/v1/api.json';
  const results = new Map();

  await Promise.allSettled(
    geos.map(async (geo) => {
      try {
        const rss = `https://trends.google.com/trends/trendingsearches/daily/rss?geo=${geo}`;
        const res = await fetch(`${proxy}?rss_url=${encodeURIComponent(rss)}&count=30`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status !== 'ok') return;
        data.items.forEach(item => {
          const kw = item.title.toLowerCase().trim();
          if (!results.has(kw)) results.set(kw, { count: 0, geos: [] });
          const entry = results.get(kw);
          entry.count++;
          entry.geos.push(geo);
        });
      } catch {}
    })
  );

  return Array.from(results.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .map(([kw, meta]) => ({ kw, ...meta }));
}

function trendScore(post, trends) {
  if (!trends.length) return { score: 0, matched: [], global: false };
  const haystack = [post.title || '', post.excerpt || '', ...(post.tags || [])].join(' ').toLowerCase();
  let score = 0;
  const matched = [];
  let globalHit = false;

  trends.forEach(({ kw, count, geos }) => {
    const words = kw.split(/\s+/);
    const hit = words.some(w => w.length > 3 && haystack.includes(w));
    if (hit) {
      score += count;
      matched.push(kw);
      if (geos.includes('US') || geos.includes('GB')) globalHit = true;
    }
  });
  return { score, matched: [...new Set(matched)].slice(0, 4), global: globalHit };
}

function extractFirstImage(html) {
  if (!html) return null;
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

// 1234 → "1.2k"
function formatViews(n) {
  if (!n || n < 1) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.0', '')}m`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1).replace('.0', '')}k`;
  return n.toString();
}

const formatDate = (ts) => {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ─────────────────────────────────────────────
// GRID CARD
// ─────────────────────────────────────────────
function CardGrid({ post }) {
  const img = post._image;
  const isTrending = post._trending?.score > 0;
  const isGlobal   = post._trending?.global;
  const views      = formatViews(post.views);

  return (
    <Link href={`/blog/${post.slug}`}>
      <article className={`group h-full flex flex-col rounded-sm border overflow-hidden transition-all duration-200 ${
        isGlobal   ? 'border-orange-500/30 bg-[#0d0900] hover:border-orange-400/50 hover:shadow-[0_0_20px_rgba(249,115,22,0.05)]'
        : isTrending ? 'border-orange-500/15 bg-[#0a0800] hover:border-orange-500/35'
        : 'border-gray-800 bg-[#080d1a]/70 hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(0,243,255,0.03)]'
      }`}>

        {/* Thumbnail */}
        <div className="relative overflow-hidden shrink-0" style={{ height: 156 }}>
          {img ? (
            <>
              <img src={img} alt={post.title}
                className="w-full h-full object-cover opacity-70 group-hover:opacity-95 group-hover:scale-105 transition-all duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080d1a] via-transparent to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-[#070c18] flex items-center justify-center border-b border-gray-900">
              <Terminal className="w-7 h-7 text-gray-800" />
            </div>
          )}

          {/* Badge */}
          <div className="absolute top-2.5 left-2.5 flex gap-1">
            {isGlobal && (
              <span className="text-[8px] px-1.5 py-0.5 bg-orange-500 text-black font-black rounded-sm flex items-center gap-0.5 tracking-wider">
                <Globe className="w-2 h-2" /> GLOBAL
              </span>
            )}
            {isTrending && !isGlobal && (
              <span className="text-[8px] px-1.5 py-0.5 bg-orange-500/80 text-black font-black rounded-sm flex items-center gap-0.5">
                <Flame className="w-2 h-2" /> TREND
              </span>
            )}
          </div>

          {/* View count overlay */}
          {views && (
            <div className="absolute bottom-2 right-2">
              <span className="text-[9px] px-1.5 py-0.5 bg-black/60 text-gray-400 rounded-sm flex items-center gap-1 backdrop-blur-sm">
                <Eye className="w-2.5 h-2.5" />{views}
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-4 gap-2">
          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {post.tags?.slice(0, 2).map(t => (
              <span key={t} className="text-[9px] px-1.5 py-0.5 bg-cyan-500/8 text-cyan-700 border border-cyan-500/12 rounded-sm">{t}</span>
            ))}
            {(post.tags?.length || 0) > 2 && (
              <span className="text-[9px] text-gray-800">+{post.tags.length - 2}</span>
            )}
          </div>

          {/* Title */}
          <h3 className={`font-bold text-sm leading-snug line-clamp-2 transition-colors ${
            isTrending ? 'text-white group-hover:text-orange-300' : 'text-white group-hover:text-cyan-400'
          }`}>
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-gray-700 text-[11px] leading-relaxed line-clamp-2 flex-1">{post.excerpt}</p>
          )}

          {/* Trend keywords */}
          {post._trending?.matched?.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {post._trending.matched.slice(0, 2).map(kw => (
                <span key={kw} className="text-[8px] px-1.5 py-0.5 bg-orange-500/8 text-orange-500/60 border border-orange-500/12 rounded-sm capitalize">{kw}</span>
              ))}
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center justify-between text-[10px] text-gray-700 pt-2 border-t border-gray-900 mt-auto">
            <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{formatDate(post.createdAt)}</span>
            {post.readTime && <span>{post.readTime} min</span>}
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─────────────────────────────────────────────
// LIST CARD
// ─────────────────────────────────────────────
function CardList({ post }) {
  const img = post._image;
  const isTrending = post._trending?.score > 0;
  const isGlobal   = post._trending?.global;
  const views      = formatViews(post.views);

  return (
    <Link href={`/blog/${post.slug}`}>
      <article className={`group flex items-stretch rounded-sm border overflow-hidden transition-all duration-200 ${
        isGlobal   ? 'border-orange-500/25 bg-[#0d0900] hover:border-orange-400/40'
        : isTrending ? 'border-orange-500/15 bg-[#0a0800] hover:border-orange-500/30'
        : 'border-gray-800 bg-black/20 hover:border-cyan-500/25 hover:bg-black/40'
      }`}>

        {/* Thumbnail */}
        {img ? (
          <div className="w-24 sm:w-40 shrink-0 relative overflow-hidden">
            <img src={img} alt={post.title}
              className="w-full h-full object-cover opacity-65 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#050505]/60" />
            {isGlobal && (
              <div className="absolute top-2 left-2">
                <span className="text-[8px] px-1.5 py-0.5 bg-orange-500 text-black font-black rounded-sm flex items-center gap-0.5">
                  <Globe className="w-2 h-2" /> GLOBAL
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="w-14 shrink-0 bg-[#0a0f1e] flex items-center justify-center border-r border-gray-800">
            <Terminal className="w-4 h-4 text-gray-800" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 p-3 sm:p-4 flex flex-col justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-1 mb-1.5">
              {isTrending && !isGlobal && (
                <span className="text-[8px] px-1.5 py-0.5 bg-orange-500/12 text-orange-400 border border-orange-500/20 rounded-sm flex items-center gap-0.5 font-bold">
                  <Flame className="w-2 h-2" /> TRENDING
                </span>
              )}
              {post.tags?.slice(0, 3).map(t => (
                <span key={t} className="text-[9px] px-1.5 py-0.5 bg-cyan-500/6 text-cyan-700 border border-cyan-500/12 rounded-sm">{t}</span>
              ))}
              {(post.tags?.length || 0) > 3 && <span className="text-[9px] text-gray-800">+{post.tags.length - 3}</span>}
            </div>

            <h3 className={`font-bold text-sm sm:text-[15px] leading-snug line-clamp-2 transition-colors ${
              isTrending ? 'text-white group-hover:text-orange-300' : 'text-white group-hover:text-cyan-400'
            }`}>
              {post.title}
            </h3>

            {post.excerpt && (
              <p className="text-gray-600 text-xs leading-relaxed line-clamp-2 mt-1 hidden sm:block">{post.excerpt}</p>
            )}

            {post._trending?.matched?.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <Flame className="w-2.5 h-2.5 text-orange-500/50 shrink-0" />
                {post._trending.matched.slice(0, 3).map(kw => (
                  <span key={kw} className="text-[8px] text-orange-500/50 capitalize">{kw}</span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 text-[10px] text-gray-700">
            <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{formatDate(post.createdAt)}</span>
            {post.readTime && <span>{post.readTime} min read</span>}
            {views && (
              <span className="flex items-center gap-1">
                <Eye className="w-2.5 h-2.5" />{views}
              </span>
            )}
            <ArrowRight className={`w-3 h-3 ml-auto transition-all group-hover:translate-x-1 ${
              isTrending ? 'text-orange-800 group-hover:text-orange-400' : 'text-gray-800 group-hover:text-cyan-400'
            }`} />
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
const SORT_OPTS = [
  { id: 'trending',  label: 'Trending',   icon: <Flame className="w-3 h-3" /> },
  { id: 'views',     label: 'Most Viewed', icon: <Eye className="w-3 h-3" /> },
  { id: 'newest',    label: 'Newest',      icon: <Zap className="w-3 h-3" /> },
  { id: 'oldest',    label: 'Oldest',      icon: <Clock className="w-3 h-3" /> },
];
const PER_PAGE = 12;
const MAX_TAGS = 8;

export default function FoshtBlogPage() {
  const [allPosts, setAllPosts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [trendLoading, setTrendLoading] = useState(true);
  const [trendSource, setTrendSource]   = useState([]);

  const [search, setSearch]           = useState('');
  const [filter, setFilter]           = useState('ALL');
  const [sort, setSort]               = useState('trending');
  const [layout, setLayout]           = useState('grid');
  const [page, setPage]               = useState(1);
  const [allTags, setAllTags]         = useState([]);
  const [showAllTags, setShowAllTags] = useState(false);
  const [showFilter, setShowFilter]   = useState(false);

  const searchRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      const q = query(
        collection(db, 'posts'),
        where('published', '==', true),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({
        id: d.id, ...d.data(),
        _image: null,
        _trending: { score: 0, matched: [], global: false },
      })).map(p => ({ ...p, _image: p.coverImage || extractFirstImage(p.content) }));

      setAllPosts(data);
      setAllTags([...new Set(data.flatMap(p => p.tags || []))]);
      setLoading(false);

      const trends = await fetchAllTrends();
      setTrendSource(trends);
      setTrendLoading(false);

      if (trends.length) {
        setAllPosts(prev => prev.map(p => ({ ...p, _trending: trendScore(p, trends) })));
      }
    };
    load();
  }, []);

  useEffect(() => { setPage(1); }, [search, filter, sort]);

  const processed = (() => {
    let res = [...allPosts];

    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    if (filter !== 'ALL') res = res.filter(p => p.tags?.includes(filter));

    if (sort === 'trending') {
      res.sort((a, b) => b._trending.score - a._trending.score);
    } else if (sort === 'views') {
      res.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sort === 'newest') {
      res.sort((a, b) => {
        const da = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const db_ = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return db_ - da;
      });
    } else {
      res.sort((a, b) => {
        const da = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const db_ = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return da - db_;
      });
    }
    return res;
  })();

  const paginated     = processed.slice(0, page * PER_PAGE);
  const hasMore       = paginated.length < processed.length;
  const visibleTags   = showAllTags ? allTags : allTags.slice(0, MAX_TAGS);
  const trendingCount = allPosts.filter(p => p._trending?.score > 0).length;
  const globalCount   = allPosts.filter(p => p._trending?.global).length;

  return (
    <main className="min-h-screen bg-[#050505] text-white font-mono">

      {/* ── NAV ── */}
      <div className="border-b border-gray-800 bg-black/60 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link href="/blog" className="text-cyan-400 text-xs tracking-[3px] hover:text-cyan-300 transition-colors flex items-center gap-1.5 shrink-0">
            <ArrowLeft className="w-3 h-3" /> BLOG
          </Link>
          <div className="h-4 w-px bg-gray-800" />
          <span className="text-gray-600 text-[10px] tracking-[2px]">ALL ARTICLES</span>
          <div className="ml-auto flex items-center gap-3 text-[10px]">
            {!trendLoading && trendingCount > 0 && (
              <span className="hidden sm:flex items-center gap-1 text-orange-500/60">
                <Flame className="w-2.5 h-2.5" />{trendingCount} trending
              </span>
            )}
            {!trendLoading && globalCount > 0 && (
              <span className="hidden sm:flex items-center gap-1 text-orange-400/60">
                <Globe className="w-2.5 h-2.5" />{globalCount} global
              </span>
            )}
            <span className="text-gray-700">{allPosts.length} posts</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* ── HEADER ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-1.5">All Articles</h1>
            <p className="text-gray-600 text-xs leading-relaxed">
              {allPosts.length} articles available
              {!trendLoading && trendSource.length > 0 && (
                <> · <span className="text-orange-500/60">trends from ID, US, GB, SG, AU</span></>
              )}
            </p>
            {!trendLoading && trendSource.length > 0 && trendingCount > 0 && (
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-orange-400/70">
                <TrendingUp className="w-3 h-3" />
                <span>{trendingCount} articles match current trends</span>
              </div>
            )}
          </div>

          {/* Layout toggle */}
          <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-sm p-0.5 shrink-0">
            <button onClick={() => setLayout('grid')}
              className={`p-2 rounded-sm transition-all ${layout === 'grid' ? 'bg-cyan-500 text-black' : 'text-gray-600 hover:text-white'}`}
              title="Grid view">
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setLayout('list')}
              className={`p-2 rounded-sm transition-all ${layout === 'list' ? 'bg-cyan-500 text-black' : 'text-gray-600 hover:text-white'}`}
              title="List view">
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── SEARCH BAR ── */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, description, or tag..."
            className="w-full bg-[#080d1a] border border-gray-800 focus:border-cyan-500/40 text-white text-sm pl-10 pr-10 py-2.5 rounded-sm outline-none placeholder:text-gray-700 font-mono transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── SORT + FILTER TOGGLE ── */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <div className="flex items-center gap-0.5 bg-[#080d1a] border border-gray-800 rounded-sm p-0.5">
            {SORT_OPTS.map(opt => (
              <button key={opt.id} onClick={() => setSort(opt.id)}
                className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-sm transition-all font-bold tracking-wider ${
                  sort === opt.id ? 'bg-cyan-500 text-black' : 'text-gray-600 hover:text-white'
                }`}>
                {opt.icon}{opt.label}
              </button>
            ))}
          </div>

          <button onClick={() => setShowFilter(p => !p)}
            className={`flex items-center gap-1.5 text-[10px] px-3 py-2 rounded-sm border transition-all font-bold tracking-wider ${
              showFilter || filter !== 'ALL'
                ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
                : 'border-gray-800 text-gray-600 hover:text-white hover:border-gray-600'
            }`}>
            <SlidersHorizontal className="w-3 h-3" />
            Tag
            {filter !== 'ALL' && (
              <span className="bg-cyan-500 text-black text-[9px] px-1 rounded-sm font-black">1</span>
            )}
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showFilter ? 'rotate-180' : ''}`} />
          </button>

          {(search || filter !== 'ALL') && (
            <div className="ml-auto flex items-center gap-2 text-[10px] text-gray-600">
              <span>{processed.length} results</span>
              <button onClick={() => { setSearch(''); setFilter('ALL'); }}
                className="text-red-500/60 hover:text-red-400 transition-colors flex items-center gap-0.5">
                <X className="w-3 h-3" /> reset
              </button>
            </div>
          )}
        </div>

        {/* ── TAG FILTER PANEL ── */}
        {showFilter && allTags.length > 0 && (
          <div className="mb-5 bg-[#080d1a] border border-gray-800 rounded-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-gray-700 tracking-[2px]">FILTER BY TAG</span>
              {allTags.length > MAX_TAGS && (
                <button onClick={() => setShowAllTags(p => !p)}
                  className="text-[10px] text-gray-600 hover:text-cyan-400 transition-colors">
                  {showAllTags ? '▲ less' : `▼ +${allTags.length - MAX_TAGS} more`}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setFilter('ALL')}
                className={`text-[10px] px-3 py-1.5 rounded-sm border transition-all font-bold tracking-wider ${
                  filter === 'ALL' ? 'bg-cyan-500 text-black border-cyan-500' : 'border-gray-700 text-gray-500 hover:border-cyan-500/40 hover:text-cyan-400'
                }`}>ALL</button>

              {visibleTags.map(tag => {
                const hasTrend  = allPosts.some(p => p.tags?.includes(tag) && p._trending?.score > 0);
                const hasGlobal = allPosts.some(p => p.tags?.includes(tag) && p._trending?.global);
                return (
                  <button key={tag} onClick={() => setFilter(tag)}
                    className={`relative text-[10px] px-3 py-1.5 rounded-sm border transition-all ${
                      filter === tag
                        ? 'bg-cyan-500 text-black border-cyan-500 font-bold'
                        : hasGlobal
                          ? 'border-orange-500/30 text-orange-400/80 hover:border-orange-400/50'
                          : hasTrend
                            ? 'border-orange-500/18 text-orange-500/60 hover:border-orange-500/40'
                            : 'border-gray-700 text-gray-500 hover:border-cyan-500/40 hover:text-cyan-400'
                    }`}>
                    {tag}
                    {(hasTrend || hasGlobal) && filter !== tag && (
                      <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${hasGlobal ? 'bg-orange-400' : 'bg-orange-600/80'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TRENDING TICKER ── */}
        {!trendLoading && trendSource.length > 0 && sort === 'trending' && !search && filter === 'ALL' && (
          <div className="mb-6 flex items-center gap-3 bg-orange-500/[0.04] border border-orange-500/12 rounded-sm px-4 py-2.5 overflow-hidden">
            <TrendingUp className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span className="text-[9px] text-orange-400/70 font-bold tracking-wider shrink-0">GLOBAL TREND ·</span>
            <div className="overflow-hidden flex-1">
              <span className="text-[9px] text-gray-700 whitespace-nowrap">
                {trendSource.slice(0, 8).map(t => t.kw).join('  ·  ')}
              </span>
            </div>
            <Globe className="w-3 h-3 text-orange-500/30 shrink-0" />
          </div>
        )}

        {/* ── POST LIST ── */}
        {loading ? (
          <div className={layout === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-3'}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border border-gray-800 rounded-sm animate-pulse overflow-hidden">
                {layout === 'grid' && <div className="h-40 bg-gray-800/30" />}
                <div className="p-4 space-y-2">
                  <div className="h-2.5 bg-gray-800 rounded w-1/3" />
                  <div className="h-4 bg-gray-800 rounded w-5/6" />
                  <div className="h-2.5 bg-gray-800 rounded w-full" />
                  <div className="h-2.5 bg-gray-800 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : processed.length === 0 ? (
          <div className="text-center py-24 text-gray-700">
            <Search className="w-8 h-8 mx-auto mb-3 opacity-15" />
            <p className="text-sm mb-3">No articles found.</p>
            {(search || filter !== 'ALL') && (
              <button onClick={() => { setSearch(''); setFilter('ALL'); }}
                className="text-xs text-cyan-500 hover:underline">
                Reset search & filter
              </button>
            )}
          </div>
        ) : layout === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map(post => <CardGrid key={post.id} post={post} />)}
          </div>
        ) : (
          <div className="space-y-3">
            {paginated.map(post => <CardList key={post.id} post={post} />)}
          </div>
        )}

        {/* ── LOAD MORE ── */}
        {!loading && hasMore && (
          <div className="mt-8 text-center">
            <button onClick={() => setPage(p => p + 1)}
              className="flex items-center gap-2 mx-auto text-xs px-6 py-2.5 border border-gray-700 text-gray-500 hover:border-cyan-500/40 hover:text-cyan-400 rounded-sm transition-all font-bold tracking-wider">
              <RefreshCw className="w-3 h-3" />
              Load More
              <span className="text-gray-700">({processed.length - paginated.length} more)</span>
            </button>
          </div>
        )}

        {!loading && processed.length > 0 && (
          <p className="text-center text-[10px] text-gray-800 mt-6">
            {paginated.length} / {processed.length} articles displayed
          </p>
        )}

        {/* ── FOOTER INFO ── */}
        {!trendLoading && trendSource.length > 0 && (
          <div className="mt-10 pt-6 border-t border-gray-900 flex flex-wrap items-center justify-between gap-2 text-[10px] text-gray-800">
            <span>Trend detection: Google Trends · ID · US · GB · SG · AU</span>
            <span className="flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-orange-900" />
              {trendingCount} trending · {globalCount} global
            </span>
          </div>
        )}
      </div>
    </main>
  );
}