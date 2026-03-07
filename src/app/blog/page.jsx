'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { Terminal, Clock, Tag, ArrowRight, Rss } from 'lucide-react';

export default function BlogPage() {
  const [posts, setPosts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('ALL');
  const [tags, setTags]         = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const q = query(
        collection(db, 'posts'),
        where('published', '==', true),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPosts(data);

      // Kumpulkan semua tags unik
      const allTags = [...new Set(data.flatMap(p => p.tags || []))];
      setTags(allTags);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = filter === 'ALL' ? posts : posts.filter(p => p.tags?.includes(filter));

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white font-mono">

      {/* Header */}
      <div className="border-b border-gray-800 bg-black/40 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-cyan-400 text-xs tracking-[3px] hover:text-cyan-300 transition-colors">
            ← FOSHT.SYS
          </Link>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Rss className="w-3 h-3 text-cyan-500" />
            <span className="text-cyan-500">{posts.length}</span> POSTS
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">

        {/* Title */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-4 py-1.5 rounded-sm mb-4">
            <Terminal className="w-3 h-3 text-cyan-400" />
            <span className="text-cyan-400 text-xs tracking-[3px]">SYSTEM LOGS / BLOG</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-3">
            Notes & Articles
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-lg">
            Thoughts on web development, AI, crypto, and digital systems. Written by Febriansyah.
          </p>
        </div>

        {/* Tag filters */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            <button
              onClick={() => setFilter('ALL')}
              className={`text-xs px-3 py-1.5 rounded-sm border transition-all ${
                filter === 'ALL'
                  ? 'bg-cyan-500 text-black border-cyan-500 font-bold'
                  : 'border-gray-700 text-gray-400 hover:border-cyan-500/50 hover:text-cyan-400'
              }`}
            >
              ALL
            </button>
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => setFilter(tag)}
                className={`text-xs px-3 py-1.5 rounded-sm border transition-all ${
                  filter === tag
                    ? 'bg-cyan-500 text-black border-cyan-500 font-bold'
                    : 'border-gray-700 text-gray-400 hover:border-cyan-500/50 hover:text-cyan-400'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Posts */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-800 p-6 rounded-sm animate-pulse">
                <div className="h-4 bg-gray-800 rounded w-1/4 mb-3" />
                <div className="h-6 bg-gray-800 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-800 rounded w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <Terminal className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No posts yet. Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((post, i) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <article className="group border border-gray-800 hover:border-cyan-500/40 bg-black/20 hover:bg-black/40 p-6 rounded-sm transition-all duration-300 cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Tags */}
                      {post.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.tags.map(tag => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-sm tracking-widest">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Title */}
                      <h2 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors leading-snug mb-2">
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      {post.excerpt && (
                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}

                      {/* Meta */}
                      <div className="flex items-center gap-4 mt-4 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(post.createdAt)}
                        </span>
                        {post.readTime && (
                          <span>{post.readTime} min read</span>
                        )}
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}