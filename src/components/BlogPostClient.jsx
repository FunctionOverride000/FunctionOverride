'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, Eye } from 'lucide-react';
import BlogFooter from '@/components/BlogFooter';

function executeContentScripts(container) {
  if (!container) return;
  Array.from(container.querySelectorAll('script')).forEach((oldScript) => {
    const newScript = document.createElement('script');
    Array.from(oldScript.attributes).forEach((attr) =>
      newScript.setAttribute(attr.name, attr.value)
    );
    newScript.textContent = oldScript.textContent;
    oldScript.parentNode.replaceChild(newScript, oldScript);
  });
}

// 1234 → "1.2k" · 1000000 → "1m"
function formatViews(n) {
  if (!n || n < 1) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.0', '')}m`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1).replace('.0', '')}k`;
  return n.toString();
}

const PROSE_CSS = `
  .prose-fosht{color:#ccc;line-height:1.85;font-size:15px;font-family:'Courier New',monospace;word-break:break-word;overflow-wrap:break-word;}
  @media(max-width:640px){.prose-fosht{font-size:14px;line-height:1.8;}}
  .prose-fosht h1{color:#fff;font-size:1.8em;font-weight:900;margin:1.4em 0 0.5em;line-height:1.2;}
  .prose-fosht h2{color:#fff;font-size:1.35em;font-weight:800;margin:1.4em 0 0.5em;border-bottom:1px solid #1a1a2e;padding-bottom:0.5em;line-height:1.3;}
  .prose-fosht h3{color:#00f3ff;font-size:1.1em;font-weight:700;margin:1.2em 0 0.4em;line-height:1.3;}
  @media(max-width:640px){.prose-fosht h1{font-size:1.5em;}.prose-fosht h2{font-size:1.2em;}.prose-fosht h3{font-size:1.05em;}}
  .prose-fosht p{margin:0 0 1.3em;}
  .prose-fosht a{color:#00f3ff;text-decoration:underline;text-underline-offset:3px;}
  .prose-fosht a:hover{color:#00d4e0;}
  .prose-fosht strong{color:#fff;font-weight:700;}
  .prose-fosht em{font-style:italic;}
  .prose-fosht u{text-decoration:underline;text-underline-offset:3px;}
  .prose-fosht mark{background:#00f3ff33;color:#00f3ff;padding:1px 4px;border-radius:2px;}
  .prose-fosht code{background:#0d1117;border:1px solid #ffffff15;color:#00f3ff;padding:2px 6px;border-radius:3px;font-size:12px;word-break:break-all;}
  .prose-fosht pre{background:#0a0f1e;border:1px solid #ffffff10;border-left:3px solid #00f3ff;padding:16px;border-radius:4px;overflow-x:auto;margin:1.5em 0;-webkit-overflow-scrolling:touch;}
  .prose-fosht pre code{background:none;border:none;padding:0;color:#e6e6e6;font-size:12px;word-break:normal;}
  .prose-fosht blockquote{border-left:3px solid #00f3ff44;padding-left:1em;color:#888;margin:1.5em 0;font-style:italic;}
  .prose-fosht ul{list-style:disc;padding-left:1.4em;margin:0 0 1.3em;}
  .prose-fosht ol{list-style:decimal;padding-left:1.4em;margin:0 0 1.3em;}
  .prose-fosht li{margin-bottom:0.4em;}
  .prose-fosht ul li::marker{color:#00f3ff;}
  .prose-fosht img{max-width:100%;width:100%;height:auto;border-radius:4px;border:1px solid #ffffff10;margin:1.5em 0;display:block;}
  .prose-fosht hr{border:none;border-top:1px solid #1a1a2e;margin:2em 0;}
  .prose-fosht iframe{width:100% !important;max-width:100%;border-radius:6px;border:1px solid rgba(0,243,255,0.1);margin:1.5em 0;display:block;}
  .prose-fosht div[style*="height"]{width:100% !important;max-width:100%;border-radius:8px;overflow:hidden;margin:1.5em 0;}
  @media(max-width:640px){
    .prose-fosht div[style*="height:450px"],.prose-fosht div[style*="height: 450px"]{height:280px !important;}
    .prose-fosht div[style*="height:450px"] iframe,.prose-fosht div[style*="height: 450px"] iframe{height:280px !important;}
    .prose-fosht div[style*="height:350px"],.prose-fosht div[style*="height: 350px"]{height:240px !important;}
    .prose-fosht div[style*="height:350px"] iframe,.prose-fosht div[style*="height: 350px"] iframe{height:240px !important;}
    .prose-fosht div[style*="height:180px"],.prose-fosht div[style*="height: 180px"]{height:140px !important;}
    .prose-fosht div[style*="height:180px"] iframe,.prose-fosht div[style*="height: 180px"] iframe{height:140px !important;}
    .prose-fosht iframe[src*="investing"]{height:380px !important;}
  }
  .prose-fosht table{width:100%;border-collapse:collapse;font-size:13px;margin:1.5em 0;background:#0a0f1e;border-radius:6px;overflow:hidden;border:1px solid rgba(0,243,255,0.12);font-family:'Courier New',monospace;}
  .prose-fosht .table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:1.5em 0;border-radius:6px;}
  .prose-fosht .table-wrap table{margin:0;}
  .prose-fosht thead tr{background:rgba(0,243,255,0.07);}
  .prose-fosht th{padding:9px 12px;text-align:left;color:#00f3ff;font-size:10px;letter-spacing:1.5px;border-bottom:1px solid rgba(0,243,255,0.15);font-weight:700;white-space:nowrap;}
  .prose-fosht td{padding:9px 12px;border-bottom:1px solid #0d1117;color:#ccc;vertical-align:top;white-space:nowrap;}
  .prose-fosht td strong{color:#fff;}
  .prose-fosht tr:last-child td{border-bottom:none;color:#555;font-style:italic;}
  .prose-fosht tr:hover td{background:rgba(255,255,255,0.02);}
  @media(max-width:640px){.prose-fosht th{font-size:9px;padding:8px 10px;}.prose-fosht td{font-size:12px;padding:8px 10px;}}
  .prose-fosht .tradingview-widget-container{width:100%;margin:1.5em 0;border-radius:6px;overflow:hidden;border:1px solid rgba(0,243,255,0.1);}
`;

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
};

export default function BlogPostClient({ post }) {
  const contentRef = useRef(null);
  const views = formatViews(post.views);

  useEffect(() => {
    if (!contentRef.current) return;

    // Wrap tables for mobile horizontal scroll
    const tables = contentRef.current.querySelectorAll('table:not(.wrapped)');
    tables.forEach(table => {
      if (!table.parentElement.classList.contains('table-wrap')) {
        const wrap = document.createElement('div');
        wrap.className = 'table-wrap';
        table.parentNode.insertBefore(wrap, table);
        wrap.appendChild(table);
        table.classList.add('wrapped');
      }
    });

    const timer = setTimeout(() => executeContentScripts(contentRef.current), 100);
    return () => clearTimeout(timer);
  }, [post]);

  return (
    <main className="min-h-screen bg-[#050505] text-white font-mono">

      {/* Sticky nav */}
      <div className="border-b border-gray-800 bg-black/40 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/blog"
            className="text-cyan-400 text-xs tracking-[3px] hover:text-cyan-300 transition-colors flex items-center gap-2">
            <ArrowLeft className="w-3 h-3" /> BLOG
          </Link>
          <Link href="/" className="text-gray-600 text-xs hover:text-gray-400 transition-colors">
            FOSHT.SYS
          </Link>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-5 sm:mb-6">
            {post.tags.map((tag) => (
              <span key={tag}
                className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-sm tracking-widest">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight mb-5 sm:mb-6">
          {post.title}
        </h1>

        {/* Meta — date · read time · views · author */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-600 mb-8 sm:mb-10 pb-6 sm:pb-8 border-b border-gray-800">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            {formatDate(post.createdAt)}
          </span>
          {post.readTime && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {post.readTime} min read
            </span>
          )}
          {views && (
            <span className="flex items-center gap-1.5">
              <Eye className="w-3 h-3" />
              {views} views
            </span>
          )}
          <span className="text-gray-700">by Febri Osht</span>
        </div>

        {/* Content */}
        <div ref={contentRef} className="prose-fosht"
          dangerouslySetInnerHTML={{ __html: post.content }} />

        <BlogFooter title={post.title} slug={post.slug} />
      </article>

      <style dangerouslySetInnerHTML={{ __html: PROSE_CSS }} />
    </main>
  );
}