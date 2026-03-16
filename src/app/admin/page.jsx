'use client';

import { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged
} from 'firebase/auth';
import {
  collection, addDoc, getDocs, updateDoc, deleteDoc,
  doc, orderBy, query, serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import {
  Lock, LogOut, Plus, Edit2, Trash2, Eye, EyeOff,
  Save, X, Terminal, Globe, EyeIcon, SplitSquareHorizontal,
  PanelLeft
} from 'lucide-react';
import dynamic from 'next/dynamic';

const RichEditor = dynamic(() => import('@/components/RichEditor'), { ssr: false });

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

const toSlug = (str) => str.toLowerCase()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .trim();

const readTime = (html) => {
  const text = html.replace(/<[^>]+>/g, '');
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
};

const formatDate = (ts) => {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

// Prose styles identik dengan /blog/[slug]
const PROSE_CSS = `
  .prose-fosht{color:#ccc;line-height:1.9;font-size:15px;font-family:'Courier New',monospace;}
  .prose-fosht h1{color:#fff;font-size:2em;font-weight:900;margin:1.5em 0 0.5em;}
  .prose-fosht h2{color:#fff;font-size:1.5em;font-weight:800;margin:1.5em 0 0.5em;border-bottom:1px solid #1a1a2e;padding-bottom:0.5em;}
  .prose-fosht h3{color:#00f3ff;font-size:1.2em;font-weight:700;margin:1.2em 0 0.4em;}
  .prose-fosht p{margin:0 0 1.4em;}
  .prose-fosht a{color:#00f3ff;text-decoration:underline;text-underline-offset:3px;}
  .prose-fosht code{background:#0d1117;border:1px solid #ffffff15;color:#00f3ff;padding:2px 8px;border-radius:3px;font-size:13px;}
  .prose-fosht pre{background:#0a0f1e;border:1px solid #ffffff10;border-left:3px solid #00f3ff;padding:20px;border-radius:4px;overflow-x:auto;margin:1.5em 0;}
  .prose-fosht pre code{background:none;border:none;padding:0;color:#e6e6e6;font-size:13px;}
  .prose-fosht blockquote{border-left:3px solid #00f3ff44;padding-left:1.2em;color:#888;margin:1.5em 0;font-style:italic;}
  .prose-fosht ul{list-style:disc;padding-left:1.5em;margin:0 0 1.4em;}
  .prose-fosht ol{list-style:decimal;padding-left:1.5em;margin:0 0 1.4em;}
  .prose-fosht li{margin-bottom:0.4em;}
  .prose-fosht ul li::marker{color:#00f3ff;}
  .prose-fosht strong{color:#fff;font-weight:700;}
  .prose-fosht em{font-style:italic;}
  .prose-fosht u{text-decoration:underline;text-underline-offset:3px;}
  .prose-fosht mark{background:#00f3ff33;color:#00f3ff;padding:1px 4px;border-radius:2px;}
  .prose-fosht img{max-width:100%;border-radius:4px;border:1px solid #ffffff10;margin:1.5em 0;display:block;}
  .prose-fosht hr{border:none;border-top:1px solid #1a1a2e;margin:2em 0;}
  .prose-fosht iframe{width:100%;border-radius:6px;border:1px solid rgba(0,243,255,0.1);margin:1.5em 0;display:block;}
  .prose-fosht table{width:100%;border-collapse:collapse;font-size:13px;margin:1.5em 0;background:#0a0f1e;border-radius:6px;overflow:hidden;border:1px solid rgba(0,243,255,0.12);font-family:'Courier New',monospace;}
  .prose-fosht thead tr{background:rgba(0,243,255,0.07);}
  .prose-fosht th{padding:10px 14px;text-align:left;color:#00f3ff;font-size:11px;letter-spacing:2px;border-bottom:1px solid rgba(0,243,255,0.15);font-weight:700;white-space:nowrap;}
  .prose-fosht td{padding:10px 14px;border-bottom:1px solid #0d1117;color:#ccc;vertical-align:top;}
  .prose-fosht td strong{color:#fff;}
  .prose-fosht tr:last-child td{border-bottom:none;color:#555;font-style:italic;}
  .prose-fosht tr:hover td{background:rgba(255,255,255,0.02);}
`;

export default function AdminPage() {
  const [user, setUser]               = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [loginError, setLoginError]   = useState('');
  const [loggingIn, setLoggingIn]     = useState(false);
  const [showPw, setShowPw]           = useState(false);

  const [posts, setPosts]             = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [view, setView]               = useState('list');       // list | editor
  const [editorMode, setEditorMode]   = useState('write');      // write | split | preview
  const [metaOpen, setMetaOpen]       = useState(true);         // collapsible meta panel
  const [saving, setSaving]           = useState(false);
  const [saveMsg, setSaveMsg]         = useState('');

  const [editPost, setEditPost]       = useState(null);
  const [form, setForm]               = useState({
    title: '', slug: '', excerpt: '', content: '', tags: '', published: false
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
      if (u) loadPosts();
    });
    return () => unsub();
  }, []);

  const loadPosts = async () => {
    setPostsLoading(true);
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setPostsLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (email !== ADMIN_EMAIL) { setLoginError('ACCESS DENIED: Unauthorized email.'); return; }
    setLoggingIn(true);
    try { await signInWithEmailAndPassword(auth, email, password); }
    catch { setLoginError('AUTHENTICATION FAILED: Wrong credentials.'); }
    setLoggingIn(false);
  };

  const handleLogout = async () => { await signOut(auth); setPosts([]); };

  const openNew = () => {
    setEditPost(null);
    setForm({ title: '', slug: '', excerpt: '', content: '', tags: '', published: false });
    setEditorMode('write');
    setMetaOpen(true);
    setView('editor');
  };

  const openEdit = (post) => {
    setEditPost(post);
    setForm({
      title:     post.title || '',
      slug:      post.slug || '',
      excerpt:   post.excerpt || '',
      content:   post.content || '',
      tags:      (post.tags || []).join(', '),
      published: post.published || false,
    });
    setEditorMode('write');
    setMetaOpen(false);
    setView('editor');
  };

  const handleTitleChange = (val) => {
    setForm(prev => ({
      ...prev, title: val,
      slug: editPost ? prev.slug : toSlug(val),
    }));
  };

  const handleSave = async (publish = null) => {
    if (!form.title.trim() || !form.content.trim()) {
      setSaveMsg('ERROR: Title and content are required.');
      setTimeout(() => setSaveMsg(''), 3000);
      return;
    }
    setSaving(true);
    const isPublished = publish !== null ? publish : form.published;
    const data = {
      title:     form.title.trim(),
      slug:      form.slug.trim() || toSlug(form.title),
      excerpt:   form.excerpt.trim(),
      content:   form.content,
      tags:      form.tags.split(',').map(t => t.trim()).filter(Boolean),
      published: isPublished,
      readTime:  readTime(form.content),
      updatedAt: serverTimestamp(),
    };
    try {
      if (editPost) {
        await updateDoc(doc(db, 'posts', editPost.id), data);
      } else {
        await addDoc(collection(db, 'posts'), { ...data, createdAt: serverTimestamp() });
      }
      await loadPosts();
      setSaveMsg(isPublished ? 'PUBLISHED ✓' : 'SAVED AS DRAFT ✓');
      setTimeout(() => { setSaveMsg(''); setView('list'); }, 1500);
    } catch {
      setSaveMsg('ERROR: Failed to save.');
      setTimeout(() => setSaveMsg(''), 3000);
    }
    setSaving(false);
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"?`)) return;
    await deleteDoc(doc(db, 'posts', id));
    await loadPosts();
  };

  const togglePublish = async (post) => {
    await updateDoc(doc(db, 'posts', post.id), { published: !post.published });
    await loadPosts();
  };

  // ── AUTH LOADING
  if (authLoading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center font-mono">
      <div className="text-cyan-400 text-xs animate-pulse tracking-widest">AUTHENTICATING...</div>
    </div>
  );

  // ── LOGIN
  if (!user) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 font-mono">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-sm mb-4">
            <Terminal className="w-3 h-3 text-cyan-400" />
            <span className="text-cyan-400 text-xs tracking-[3px]">ADMIN TERMINAL</span>
          </div>
          <h1 className="text-white text-xl font-bold">FOSHT Admin</h1>
          <p className="text-gray-600 text-xs mt-1">Restricted — authorized only</p>
        </div>
        <form onSubmit={handleLogin} className="bg-[#0a0f1e] border border-cyan-500/20 rounded-sm p-6 space-y-4">
          <div>
            <label className="text-xs text-cyan-500 tracking-[2px] block mb-2">EMAIL</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-[#050a15] border border-gray-800 text-white text-sm px-4 py-2.5 rounded-sm focus:border-cyan-500 focus:outline-none font-mono"
              placeholder="admin@email.com" />
          </div>
          <div>
            <label className="text-xs text-cyan-500 tracking-[2px] block mb-2">PASSWORD</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#050a15] border border-gray-800 text-white text-sm px-4 py-2.5 pr-10 rounded-sm focus:border-cyan-500 focus:outline-none font-mono"
                placeholder="••••••••" />
              <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-2.5 text-gray-600 hover:text-gray-400">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {loginError && <p className="text-red-400 text-xs border border-red-500/20 bg-red-500/5 px-3 py-2 rounded-sm">{loginError}</p>}
          <button type="submit" disabled={loggingIn}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm py-2.5 rounded-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            <Lock className="w-4 h-4" />
            {loggingIn ? 'AUTHENTICATING...' : 'ACCESS TERMINAL'}
          </button>
        </form>
      </div>
    </div>
  );

  // ── EDITOR — full height, tidak ada scroll yang hilang
  if (view === 'editor') return (
    <div className="h-screen bg-[#050505] font-mono text-white flex flex-col overflow-hidden">

      {/* ── TOP NAV BAR ── */}
      <div className="shrink-0 border-b border-gray-800 bg-black/80 backdrop-blur-sm z-20">
        <div className="px-4 h-11 flex items-center justify-between gap-3">

          {/* Kiri: cancel + title preview */}
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setView('list')}
              className="text-gray-500 hover:text-white text-xs flex items-center gap-1.5 transition-colors shrink-0">
              <X className="w-3 h-3" /> BACK
            </button>
            <span className="text-gray-700 text-xs">·</span>
            <span className="text-gray-500 text-xs truncate max-w-[180px] hidden sm:block">
              {form.title || 'Untitled Post'}
            </span>
            {form.published && (
              <span className="text-[10px] text-green-500 border border-green-500/20 bg-green-500/5 px-2 py-0.5 rounded-sm shrink-0">LIVE</span>
            )}
          </div>

          {/* Tengah: write / split / preview toggle */}
          <div className="flex items-center gap-0.5 bg-gray-900/80 border border-gray-800 rounded-sm p-0.5 shrink-0">
            {[
              { id: 'write',   label: 'WRITE',   icon: <PanelLeft className="w-3 h-3" /> },
              { id: 'split',   label: 'SPLIT',   icon: <SplitSquareHorizontal className="w-3 h-3" /> },
              { id: 'preview', label: 'PREVIEW', icon: <Eye className="w-3 h-3" /> },
            ].map(m => (
              <button key={m.id} onClick={() => setEditorMode(m.id)}
                className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-sm transition-all font-bold tracking-wider ${
                  editorMode === m.id ? 'bg-cyan-500 text-black' : 'text-gray-500 hover:text-white'
                }`}>
                {m.icon} {m.label}
              </button>
            ))}
          </div>

          {/* Kanan: status + save + publish */}
          <div className="flex items-center gap-2 shrink-0">
            {saveMsg && (
              <span className={`text-[10px] font-bold ${saveMsg.startsWith('ERROR') ? 'text-red-400' : 'text-green-400'}`}>
                {saveMsg}
              </span>
            )}
            <button onClick={() => handleSave(false)} disabled={saving}
              className="text-[10px] px-3 py-1.5 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 rounded-sm transition-colors flex items-center gap-1.5 font-bold tracking-wider">
              <Save className="w-3 h-3" /> DRAFT
            </button>
            <button onClick={() => handleSave(true)} disabled={saving}
              className="text-[10px] px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-sm transition-colors flex items-center gap-1.5 tracking-wider">
              <Globe className="w-3 h-3" /> PUBLISH
            </button>
          </div>
        </div>
      </div>

      {/* ── META PANEL — collapsible ── */}
      <div className="shrink-0 border-b border-gray-800 bg-[#03060f]">
        {/* Toggle header */}
        <button
          onClick={() => setMetaOpen(p => !p)}
          className="w-full px-4 py-2 flex items-center gap-2 text-left hover:bg-white/[0.02] transition-colors group">
          <span className={`text-[10px] font-bold tracking-[2px] transition-colors ${metaOpen ? 'text-cyan-400' : 'text-gray-600 group-hover:text-gray-400'}`}>
            POST META
          </span>
          <span className="text-[10px] text-gray-700 group-hover:text-gray-600 transition-colors">
            {metaOpen ? '▲ sembunyikan' : `▼ ${form.title ? form.title.slice(0,40)+'...' : 'klik untuk isi judul, slug, tags'}`}
          </span>
        </button>

        {metaOpen && (
          <div className="px-4 pb-4 space-y-3">
            {/* Title — besar */}
            <input
              type="text" value={form.title} onChange={e => handleTitleChange(e.target.value)}
              className="w-full bg-transparent border-none text-xl md:text-2xl font-black text-white focus:outline-none placeholder:text-gray-800"
              placeholder="Judul post..." autoFocus />

            {/* Row: slug + tags + excerpt */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Slug */}
              <div className="flex items-center gap-1.5 bg-[#080d1a] border border-gray-800 rounded-sm px-3 py-2 focus-within:border-cyan-500/50 transition-colors">
                <span className="text-[10px] text-gray-600 shrink-0 font-bold tracking-wider">/blog/</span>
                <input type="text" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                  className="bg-transparent text-gray-300 text-xs focus:outline-none w-full font-mono"
                  placeholder="auto-generate-dari-judul" />
              </div>

              {/* Tags */}
              <div className="flex items-center gap-1.5 bg-[#080d1a] border border-gray-800 rounded-sm px-3 py-2 focus-within:border-cyan-500/50 transition-colors">
                <span className="text-[10px] text-gray-600 shrink-0 font-bold tracking-wider">#</span>
                <input type="text" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                  className="bg-transparent text-gray-300 text-xs focus:outline-none w-full"
                  placeholder="Bitcoin, Crypto, Web3" />
              </div>

              {/* Excerpt */}
              <div className="flex items-center gap-1.5 bg-[#080d1a] border border-gray-800 rounded-sm px-3 py-2 focus-within:border-cyan-500/50 transition-colors">
                <span className="text-[10px] text-gray-600 shrink-0 font-bold tracking-wider">¶</span>
                <input type="text" value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))}
                  className="bg-transparent text-gray-300 text-xs focus:outline-none w-full"
                  placeholder="Deskripsi singkat untuk list blog..." />
              </div>
            </div>

            {/* Info bar */}
            <div className="flex items-center gap-4 text-[10px] text-gray-700">
              <span>{readTime(form.content)} min read</span>
              <span>{form.content.replace(/<[^>]+>/g,'').split(/\s+/).filter(Boolean).length} kata</span>
              <span className={form.published ? 'text-green-600' : 'text-gray-700'}>
                {form.published ? '● PUBLISHED' : '○ DRAFT'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── EDITOR / PREVIEW AREA — flex-1, overflow internal ── */}
      <div className={`flex-1 min-h-0 flex ${editorMode === 'split' ? 'flex-row' : 'flex-col'}`}>

        {/* Write panel */}
        {(editorMode === 'write' || editorMode === 'split') && (
          <div className={`flex-1 min-h-0 overflow-y-auto ${editorMode === 'split' ? 'border-r border-gray-800 w-1/2 flex-none' : 'w-full'}`}>
            <RichEditor
              content={form.content}
              onChange={(html) => setForm(p => ({ ...p, content: html }))}
            />
          </div>
        )}

        {/* Preview panel */}
        {(editorMode === 'preview' || editorMode === 'split') && (
          <div className={`overflow-y-auto bg-[#050505] ${editorMode === 'split' ? 'w-1/2 flex-none' : 'flex-1 min-h-0'}`}>
            <div className="max-w-3xl mx-auto px-6 py-8">

              <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-sm mb-6">
                <Eye className="w-3 h-3 text-yellow-400" />
                <span className="text-yellow-400 text-[10px] tracking-widest font-bold">PREVIEW</span>
              </div>

              {form.tags && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {form.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-sm tracking-widest">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="text-2xl md:text-3xl font-black text-white leading-tight mb-3">
                {form.title || <span className="text-gray-800">Judul post...</span>}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-600 mb-6 pb-4 border-b border-gray-800">
                <span>{new Date().toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}</span>
                <span>·</span>
                <span>{readTime(form.content)} min read</span>
                <span>·</span>
                <span>by Febri Osht</span>
              </div>

              <div
                className="prose-fosht"
                dangerouslySetInnerHTML={{ __html: form.content || '<p style="color:#1a1a1a">Mulai menulis untuk lihat preview...</p>' }}
              />
            </div>
            <style dangerouslySetInnerHTML={{ __html: PROSE_CSS }} />
          </div>
        )}
      </div>
    </div>
  );

  // ── POST LIST
  return (
    <div className="min-h-screen bg-[#050505] font-mono text-white">
      <div className="border-b border-gray-800 bg-black/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-xs tracking-[3px]">FOSHT ADMIN</span>
            <span className="text-gray-700 text-xs hidden sm:block">· {user.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/blog" target="_blank"
              className="text-xs text-gray-500 hover:text-cyan-400 transition-colors flex items-center gap-1.5">
              <EyeIcon className="w-3 h-3" /> VIEW BLOG
            </a>
            <button onClick={handleLogout}
              className="text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1.5">
              <LogOut className="w-3 h-3" /> LOGOUT
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-black text-white">Posts</h1>
            <p className="text-gray-600 text-xs mt-1">
              {posts.length} total · {posts.filter(p => p.published).length} published
            </p>
          </div>
          <button onClick={openNew}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs px-4 py-2 rounded-sm transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> NEW POST
          </button>
        </div>

        {postsLoading ? (
          <div className="text-cyan-400 text-xs animate-pulse tracking-widest text-center py-20">LOADING...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-gray-700">
            <Terminal className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No posts yet. Create your first one!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {posts.map(post => (
              <div key={post.id}
                className="border border-gray-800 bg-black/20 px-5 py-4 rounded-sm flex items-center gap-4 hover:border-gray-700 transition-colors group">
                <div className={`w-2 h-2 rounded-full shrink-0 ${post.published ? 'bg-green-500' : 'bg-gray-600'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate group-hover:text-cyan-400 transition-colors">{post.title}</p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-xs text-gray-600">/blog/{post.slug}</span>
                    {post.tags?.slice(0, 3).map(t => (
                      <span key={t} className="text-[10px] text-cyan-700">#{t}</span>
                    ))}
                    <span className={`text-[10px] font-bold ${post.published ? 'text-green-600' : 'text-gray-700'}`}>
                      {post.published ? '● LIVE' : '○ DRAFT'}
                    </span>
                    <span className="text-[10px] text-gray-700">{formatDate(post.createdAt)}</span>
                    {post.readTime && <span className="text-[10px] text-gray-700">{post.readTime} min</span>}
                  </div>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button onClick={() => togglePublish(post)} title={post.published ? 'Unpublish' : 'Publish'}
                    className={`p-2 rounded-sm transition-colors ${post.published ? 'text-green-500 hover:bg-green-500/10' : 'text-gray-600 hover:bg-gray-800 hover:text-gray-400'}`}>
                    {post.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <a href={`/blog/${post.slug}`} target="_blank" title="Lihat post"
                    className="p-2 rounded-sm text-gray-600 hover:bg-gray-800 hover:text-white transition-colors">
                    <EyeIcon className="w-4 h-4" />
                  </a>
                  <button onClick={() => openEdit(post)} title="Edit"
                    className="p-2 rounded-sm text-gray-600 hover:bg-gray-800 hover:text-cyan-400 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(post.id, post.title)} title="Delete"
                    className="p-2 rounded-sm text-gray-600 hover:bg-red-500/10 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}