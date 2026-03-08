// SERVER COMPONENT — no 'use client'
// Google reads full HTML directly without waiting for JS

import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { notFound } from 'next/navigation';
import BlogPostClient from '@/components/BlogPostClient';

// ── generateMetadata: SEO title/desc/og per article
export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const q = query(
      collection(db, 'posts'),
      where('slug', '==', slug),
      where('published', '==', true),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return { title: 'Post Not Found — FOSHT' };

    const post = snap.docs[0].data();
    const firstImg = post.coverImage || extractFirstImageServer(post.content);

    return {
      title: `${post.title} — FOSHT Blog`,
      description: post.excerpt || post.title,
      keywords: post.tags?.join(', '),
      authors: [{ name: 'Febriansyah', url: 'https://fosht.vercel.app' }],
      openGraph: {
        title: post.title,
        description: post.excerpt || post.title,
        url: `https://fosht.vercel.app/blog/${slug}`,
        siteName: 'FOSHT Blog',
        type: 'article',
        publishedTime: post.createdAt?.toDate?.()?.toISOString(),
        authors: ['Febriansyah'],
        tags: post.tags,
        images: firstImg ? [{ url: firstImg, width: 1200, height: 630, alt: post.title }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.excerpt || post.title,
        images: firstImg ? [firstImg] : [],
        creator: '@babyybossssss',
      },
      alternates: {
        canonical: `https://fosht.vercel.app/blog/${slug}`,
      },
    };
  } catch {
    return { title: 'FOSHT Blog' };
  }
}

function extractFirstImageServer(html) {
  if (!html) return null;
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

// ── Server fetch
async function getPost(slug) {
  try {
    const q = query(
      collection(db, 'posts'),
      where('slug', '==', slug),
      where('published', '==', true),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const data = snap.docs[0].data();
    // Firestore Timestamp tidak bisa di-serialize ke client — convert dulu
    return {
      id: snap.docs[0].id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
    };
  } catch {
    return null;
  }
}

// ── Page component (Server)
export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  // JSON-LD structured data for Google rich results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.title,
    author: {
      '@type': 'Person',
      name: 'Febriansyah',
      url: 'https://fosht.vercel.app',
    },
    publisher: {
      '@type': 'Organization',
      name: 'FOSHT',
      url: 'https://fosht.vercel.app',
    },
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    url: `https://fosht.vercel.app/blog/${slug}`,
    keywords: post.tags?.join(', '),
    image: extractFirstImageServer(post.content),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://fosht.vercel.app/blog/${slug}`,
    },
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white font-mono">

      {/* Nav */}
      <div className="border-b border-gray-800 bg-black/40 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/blog" className="text-cyan-400 text-xs tracking-[3px] hover:text-cyan-300 transition-colors flex items-center gap-2">
            <ArrowLeft className="w-3 h-3" /> BLOG
          </Link>
          <Link href="/" className="text-gray-600 text-xs hover:text-gray-400 transition-colors">
            FOSHT.SYS
          </Link>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-6 py-16">

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-sm tracking-widest">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-6">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 mb-10 pb-8 border-b border-gray-800">
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
          <span className="text-gray-700">by Febri Osht</span>
        </div>

        {/* Content */}
        <div
          className="prose-fosht"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Footer */}
        <BlogFooter title={post.title} slug={post.slug} />

      </article>

      {/* Prose styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .prose-fosht {
          color: #ccc;
          line-height: 1.9;
          font-size: 15px;
        }
        .prose-fosht h1, .prose-fosht h2, .prose-fosht h3 {
          color: #fff;
          font-weight: 800;
          margin: 2em 0 0.75em;
          letter-spacing: -0.02em;
        }
        .prose-fosht h2 { font-size: 1.5em; border-bottom: 1px solid #1a1a2e; padding-bottom: 0.5em; }
        .prose-fosht h3 { font-size: 1.2em; color: #00f3ff; }
        .prose-fosht p { margin: 0 0 1.4em; }
        .prose-fosht a { color: #00f3ff; text-decoration: underline; text-underline-offset: 3px; }
        .prose-fosht a:hover { color: #00d4e0; }
        .prose-fosht code {
          background: #0d1117;
          border: 1px solid #ffffff15;
          color: #00f3ff;
          padding: 2px 8px;
          border-radius: 3px;
          font-size: 13px;
        }
        .prose-fosht pre {
          background: #0a0f1e;
          border: 1px solid #ffffff10;
          border-left: 3px solid #00f3ff;
          padding: 20px;
          border-radius: 4px;
          overflow-x: auto;
          margin: 1.5em 0;
        }
        .prose-fosht pre code {
          background: none;
          border: none;
          padding: 0;
          color: #e6e6e6;
          font-size: 13px;
        }
        .prose-fosht blockquote {
          border-left: 3px solid #00f3ff44;
          padding-left: 1.2em;
          color: #888;
          margin: 1.5em 0;
          font-style: italic;
        }
        .prose-fosht ul, .prose-fosht ol {
          padding-left: 1.5em;
          margin: 0 0 1.4em;
        }
        .prose-fosht li { margin-bottom: 0.4em; }
        .prose-fosht ul li::marker { color: #00f3ff; }
        .prose-fosht strong { color: #fff; font-weight: 700; }
        .prose-fosht img {
          width: 100%;
          border-radius: 4px;
          border: 1px solid #ffffff10;
          margin: 1.5em 0;
        }
        .prose-fosht hr {
          border: none;
          border-top: 1px solid #1a1a2e;
          margin: 2em 0;
        }
      `}} />
    </main>
  );
}
