import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AgentFloatingWidget } from '@/components/AgentWidget';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL('https://fosht.vercel.app'),
  title: {
    default: 'FOSHT — Febriansyah | Web Developer & AI Specialist',
    template: '%s | FOSHT',
  },
  description: 'Portfolio of Febriansyah S.Kom — Web Developer & AI Prompt Specialist based in Lampung, Indonesia. Building digital ecosystems with React, Next.js, and AI.',
  keywords: [
    'Febriansyah', 'FOSHT', 'Web Developer', 'AI Specialist', 'Lampung',
    'React', 'Next.js', 'Portfolio', 'Oshtore', 'Crypto Directory Indonesia',
    'Frontend Developer', 'Indonesia', 'Swakarsa Digital',
  ],
  authors: [{ name: 'Febriansyah', url: 'https://fosht.vercel.app' }],
  creator: 'Febriansyah',
  publisher: 'FOSHT',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    alternateLocale: 'en_US',
    url: 'https://fosht.vercel.app',
    siteName: 'FOSHT',
    title: 'FOSHT — Febriansyah | Web Developer & AI Specialist',
    description: 'Portfolio of Febriansyah S.Kom — Web Developer & AI Prompt Specialist based in Lampung, Indonesia.',
    images: [
      {
        url: '/og-image.png', // buat file ini — lihat instruksi di bawah
        width: 1200,
        height: 630,
        alt: 'FOSHT — Febriansyah Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FOSHT — Febriansyah | Web Developer & AI Specialist',
    description: 'Portfolio of Febriansyah S.Kom — Web Developer & AI Prompt Specialist based in Lampung, Indonesia.',
    images: ['/og-image.png'],
    creator: '@babyybossssss',
  },
  icons: {
    icon: '/fosht.png',
    shortcut: '/fosht.png',
    apple: '/fosht.png',
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: 'https://fosht.vercel.app',
  },
  // 👇 TAMBAHKAN KODE INI DI SINI 👇
  verification: {
    google: 'R9N85Ul-VgmfuQl2O_iZlzqZzxNibGUji-Oq_AKvlY8', 
  },
  // 👆 ---------------------------- 👆
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <AgentFloatingWidget />
        <script dangerouslySetInnerHTML={{__html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js')
                .then(function(reg) { console.log('SW registered:', reg.scope); })
                .catch(function(err) { console.log('SW registration failed:', err); });
            });
          }
        `}} />
      </body>
    </html>
  );
}