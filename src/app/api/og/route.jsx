// SERVER COMPONENT — no 'use client'
import { collection, getDocs, query, where, limit, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { notFound } from 'next/navigation';
import BlogPostClient from '@/components/BlogPostClient';

// ── Increment view count (fire and forget — tidak block render)
async function incrementView(postId) {
  try {
    await updateDoc(doc(db, 'posts', postId), {
      views: increment(1),
    });
  } catch {
    // Silent fail — not critical
  }
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

function extractFirstImageServer(html) {
  if (!html) return null;
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

// ── generateMetadata: SEO title/desc/og per article
export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const post = await getPost(slug);
    if (!post) return { title: 'Post Not Found — FOSHT' };

    const firstImg = post.coverImage || extractFirstImageServer(post.content);

    // OG image — auto-generated per article
    const ogDate  = post.createdAt
      ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '';
    // Untuk OG image: prioritaskan coverImage karena bisa difetch server
    // Hindari URL dari domain yang memblokir server fetch
    const blockedDomains = ['alternative.me', 'tradingview.com', 'investing.com'];
    const articleImg = post.coverImage
      ? post.coverImage
      : (firstImg && !blockedDomains.some(d => firstImg.includes(d)) ? firstImg : '');

    const ogImage = `https://fosht.vercel.app/api/og?title=${encodeURIComponent(post.title)}&tags=${encodeURIComponent((post.tags || []).join(','))}&date=${encodeURIComponent(ogDate)}&img=${encodeURIComponent(articleImg)}`;

    return {
      title: `${post.title} — FOSHT Blog`,
      description: post.excerpt || post.title,
      keywords: post.tags?.join(', '),
      authors: [{ name: 'Febri Osht', url: 'https://fosht.vercel.app' }],
      openGraph: {
        title: post.title,
        description: post.excerpt || post.title,
        url: `https://fosht.vercel.app/blog/${slug}`,
        siteName: 'FOSHT Blog',
        type: 'article',
        publishedTime: post.createdAt,
        authors: ['Febri Osht'],
        tags: post.tags,
        images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.excerpt || post.title,
        images: [ogImage],
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

// ── Page component (Server)
export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  // Increment view — non-blocking, runs parallel with render
  incrementView(post.id);

  // JSON-LD structured data for Google rich results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.title,
    author: {
      '@type': 'Person',
      name: 'Febri Osht',
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPostClient post={post} />
    </>
  );
}