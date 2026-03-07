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
  Save, X, Terminal, Globe, EyeIcon, SplitSquareHorizontal
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamic import RichEditor agar tidak SSR
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

export default function AdminPage() {
  const [user, setUser]             = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn]   = useState(false);
  const [showPw, setShowPw]         = useState(false);

  const [posts, setPosts]           = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [view, setView]             = useState('list'); // list | editor
  const [editorMode, setEditorMode] = useState('write'); // write | preview | split
  const [saving, setSaving]         = useState(false);
  const [saveMsg, setSaveMsg]       = useState('');

  const [editPost, setEditPost]     = useState(null);
  const [form, setForm]             = useState({
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
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setLoginError('AUTHENTICATION FAILED: Wrong credentials.');
    }
    setLoggingIn(false);
  };

  const handleLogout = async () => { await signOut(auth); setPosts([]); };

  const openNew = () => {
    setEditPost(null);
    setForm({ title: '', slug: '', excerpt: '', content: '', tags: '', published: false });
    setEditorMode('write');
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
    setView('editor');
  };

  const handleTitleChange = (val) => {
    setForm(prev => ({
      ...prev,
      title: val,
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

  // ── EDITOR
  if (view === 'editor') return (
    <div className="min-h-screen bg-[#050505] font-mono text-white flex flex-col">

      {/* Editor nav */}
      <div className="border-b border-gray-800 bg-black/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-6 py-3 flex items-center justify-between gap-4">
          <button onClick={() => setView('list')}
            className="text-gray-500 hover:text-white text-xs flex items-center gap-1.5 transition-colors">
            <X className="w-3 h-3" /> CANCEL
          </button>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-sm p-0.5">
            {[
              { id: 'write', label: 'WRITE', icon: <Edit2 className="w-3 h-3" /> },
              { id: 'split', label: 'SPLIT', icon: <SplitSquareHorizontal className="w-3 h-3" /> },
              { id: 'preview', label: 'PREVIEW', icon: <Eye className="w-3 h-3" /> },
            ].map(m => (
              <button key={m.id} onClick={() => setEditorMode(m.id)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-sm transition-all ${
                  editorMode === m.id ? 'bg-cyan-500 text-black font-bold' : 'text-gray-500 hover:text-white'
                }`}>
                {m.icon} {m.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {saveMsg && (
              <span className={`text-xs ${saveMsg.startsWith('ERROR') ? 'text-red-400' : 'text-green-400'}`}>
                {saveMsg}
              </span>
            )}
            <button onClick={() => handleSave(false)} disabled={saving}
              className="text-xs px-3 py-1.5 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 rounded-sm transition-colors flex items-center gap-1.5">
              <Save className="w-3 h-3" /> DRAFT
            </button>
            <button onClick={() => handleSave(true)} disabled={saving}
              className="text-xs px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-sm transition-colors flex items-center gap-1.5">
              <Globe className="w-3 h-3" /> PUBLISH
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">

        {/* Meta fields */}
        <div className="border-b border-gray-800 bg-[#050505] px-6 py-4 space-y-3">
          {/* Title */}
          <input type="text" value={form.title} onChange={e => handleTitleChange(e.target.value)}
            className="w-full bg-transparent border-none text-2xl md:text-3xl font-black text-white focus:outline-none placeholder:text-gray-700"
            placeholder="Post title..." />

          <div className="flex flex-wrap items-center gap-4">
            {/* Slug */}
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <span>/blog/</span>
              <input type="text" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                className="bg-transparent border-b border-gray-800 text-gray-400 focus:outline-none focus:border-cyan-500 w-48 pb-0.5"
                placeholder="auto-slug" />
            </div>

            {/* Tags */}
            <input type="text" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
              className="bg-transparent border-b border-gray-800 text-gray-400 text-xs focus:outline-none focus:border-cyan-500 w-48 pb-0.5"
              placeholder="Tags: React, AI, Crypto" />

            {/* Excerpt */}
            <input type="text" value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))}
              className="flex-1 bg-transparent border-b border-gray-800 text-gray-400 text-xs focus:outline-none focus:border-cyan-500 pb-0.5 min-w-[200px]"
              placeholder="Short excerpt for blog list..." />
          </div>
        </div>

        {/* Editor / Preview area */}
        <div className={`flex-1 ${editorMode === 'split' ? 'grid grid-cols-2' : ''}`}>

          {/* Write panel */}
          {(editorMode === 'write' || editorMode === 'split') && (
            <div className={`${editorMode === 'split' ? 'border-r border-gray-800 overflow-auto' : ''}`}>
              <RichEditor
                content={form.content}
                onChange={(html) => setForm(p => ({ ...p, content: html }))}
              />
            </div>
          )}

          {/* Preview panel — tampilan persis seperti /blog/[slug] */}
          {(editorMode === 'preview' || editorMode === 'split') && (
            <div className={`bg-[#050505] overflow-auto ${editorMode === 'split' ? 'h-full' : 'min-h-screen'}`}>
              <div className="max-w-3xl mx-auto px-6 py-10">

                {/* Preview badge */}
                <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-sm mb-6">
                  <Eye className="w-3 h-3 text-yellow-400" />
                  <span className="text-yellow-400 text-xs tracking-widest">PREVIEW MODE</span>
                </div>

                {/* Tags */}
                {form.tags && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {form.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-sm tracking-widest">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">
                  {form.title || 'Post title...'}
                </h1>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 mb-8 pb-6 border-b border-gray-800">
                  <span>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <span>{readTime(form.content)} min read</span>
                  <span className="text-gray-700">by Febriansyah</span>
                </div>

                {/* Content — sama persis dengan [slug]/page.jsx */}
                <div
                  className="prose-fosht"
                  dangerouslySetInnerHTML={{ __html: form.content || '<p style="color:#333">Start writing to see preview...</p>' }}
                />
              </div>

              {/* Prose styles — identik dengan [slug]/page.jsx */}
              <style dangerouslySetInnerHTML={{__html: `
                .prose-fosht { color: #ccc; line-height: 1.9; font-size: 15px; font-family: 'Courier New', monospace; }
                .prose-fosht h1 { color: #fff; font-size: 2em; font-weight: 900; margin: 1.5em 0 0.5em; }
                .prose-fosht h2 { color: #fff; font-size: 1.5em; font-weight: 800; margin: 1.5em 0 0.5em; border-bottom: 1px solid #1a1a2e; padding-bottom: 0.5em; }
                .prose-fosht h3 { color: #00f3ff; font-size: 1.2em; font-weight: 700; margin: 1.2em 0 0.4em; }
                .prose-fosht p { margin: 0 0 1.4em; }
                .prose-fosht a { color: #00f3ff; text-decoration: underline; text-underline-offset: 3px; }
                .prose-fosht code { background: #0d1117; border: 1px solid #ffffff15; color: #00f3ff; padding: 2px 8px; border-radius: 3px; font-size: 13px; }
                .prose-fosht pre { background: #0a0f1e; border: 1px solid #ffffff10; border-left: 3px solid #00f3ff; padding: 20px; border-radius: 4px; overflow-x: auto; margin: 1.5em 0; }
                .prose-fosht pre code { background: none; border: none; padding: 0; color: #e6e6e6; font-size: 13px; }
                .prose-fosht blockquote { border-left: 3px solid #00f3ff44; padding-left: 1.2em; color: #888; margin: 1.5em 0; font-style: italic; }
                .prose-fosht ul { list-style: disc; padding-left: 1.5em; margin: 0 0 1.4em; }
                .prose-fosht ol { list-style: decimal; padding-left: 1.5em; margin: 0 0 1.4em; }
                .prose-fosht li { margin-bottom: 0.4em; }
                .prose-fosht ul li::marker { color: #00f3ff; }
                .prose-fosht strong { color: #fff; font-weight: 700; }
                .prose-fosht em { font-style: italic; }
                .prose-fosht u { text-decoration: underline; text-underline-offset: 3px; }
                .prose-fosht mark { background: #00f3ff33; color: #00f3ff; padding: 1px 4px; border-radius: 2px; }
                .prose-fosht img { max-width: 100%; border-radius: 4px; border: 1px solid #ffffff10; margin: 1.5em 0; display: block; }
                .prose-fosht img[style*="margin: 0 auto"] { margin-left: auto !important; margin-right: auto !important; }
                .prose-fosht hr { border: none; border-top: 1px solid #1a1a2e; margin: 2em 0; }
              `}} />
            </div>
          )}
        </div>
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
                className="border border-gray-800 bg-black/20 px-5 py-4 rounded-sm flex items-center gap-4 hover:border-gray-700 transition-colors">
                <div className={`w-2 h-2 rounded-full shrink-0 ${post.published ? 'bg-green-500' : 'bg-gray-600'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{post.title}</p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-xs text-gray-600">/blog/{post.slug}</span>
                    {post.tags?.slice(0, 2).map(t => (
                      <span key={t} className="text-[10px] text-cyan-600">{t}</span>
                    ))}
                    <span className={`text-[10px] ${post.published ? 'text-green-500' : 'text-gray-600'}`}>
                      {post.published ? 'PUBLISHED' : 'DRAFT'}
                    </span>
                    <span className="text-[10px] text-gray-700">{formatDate(post.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => togglePublish(post)}
                    title={post.published ? 'Unpublish' : 'Publish'}
                    className={`p-2 rounded-sm transition-colors ${post.published ? 'text-green-400 hover:bg-green-500/10' : 'text-gray-600 hover:bg-gray-800 hover:text-gray-400'}`}>
                    {post.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
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