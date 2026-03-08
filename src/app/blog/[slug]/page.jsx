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
    <>
      {/* JSON-LD — Google pakai ini untuk rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPostClient post={post} />
    </>
  );
}