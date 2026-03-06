import { Terminal, Eye, MousePointer, Activity, Server } from 'lucide-react';

// --- SOCIAL MEDIA LINKS ---
export const socialMediaLinks = [
  { id: 'x', name: 'X / Twitter', url: 'https://x.com/babyybossssss', img: 'https://img.icons8.com/?size=100&id=phOKFKYpe00C&format=png&color=000000' },
  { id: 'instagram', name: 'Instagram', url: 'https://instagram.com/03.febriansyah', img: 'https://img.icons8.com/?size=100&id=Xy10Jcu1L2Su&format=png&color=000000' },
  { id: 'tiktok', name: 'TikTok', url: 'https://www.tiktok.com/@febriosht', img: 'https://img.icons8.com/?size=100&id=11xHwSW974uy&format=png&color=000000' },
  { id: 'whatsapp', name: 'WhatsApp', url: 'https://whatsapp.com/channel/0029VawpOWVEAKW5aqMdLQ42', img: 'https://img.icons8.com/color/100/whatsapp--v1.png' }, 
  { id: 'threads', name: 'Threads', url: 'https://www.threads.net/@03.febriansyah', img: 'https://img.icons8.com/?size=100&id=AS2a6aA9BwK3&format=png&color=000000' },
  { id: 'linkedin', name: 'LinkedIn', url: 'https://www.linkedin.com/in/febriansyah-347b112a4', img: 'https://img.icons8.com/?size=100&id=xuvGCOXi8Wyg&format=png&color=000000' },
  { id: 'github', name: 'GitHub', url: 'https://github.com/FebriOsht', img: 'https://img.icons8.com/?size=100&id=3tC9EQumUAuq&format=png&color=000000' },
  { id: 'discord', name: 'Discord', url: 'https://discord.gg/zKjFNZdM', img: 'https://img.icons8.com/?size=100&id=25627&format=png&color=000000' }, 
];

// --- PERSONAL PROJECTS DATA ---
export const personalProjects = [
  {
    id: "Crypto Directory Indonesia",
    title: "Crypto Directory Indonesia",
    desc: "Crypto Directory Indonesia is the ultimate gateway to the archipelago's booming blockchain ecosystem.",
    details: "Serving as a premier digital hub, it empowers enthusiasts with cutting-edge global market news, curated educational resources, and direct access to Indonesia's elite, OJK-regulated exchanges. Whether you're a seasoned trader or a curious newcomer, this platform is your essential compass for navigating the thrilling world of crypto with confidence and style.",
    logoImg: "cryptodirectoryindonesia.png",
    domain: "cryptodirectoryindonesia.io",
    type: "personal"
  },
  {
    id: "chatglobal",
    title: "Chat Global",
    desc: "Chat Global is the clandestine command center for the crypto elite.",
    details: "Ditching traditional interfaces for a raw, retro-futuristic CLI (Command Line Interface) aesthetic, this portal serves as a secure gateway for high-level communication. It offers an immersive, distraction-free environment where operatives can initiate encrypted connections, register distinct identities, and exchange critical market intelligence in a setting that feels straight out of a hacker's terminal.",
    logoImg: "chatglobal.png",
    domain: "https://chatglobal.cryptodirectoryindonesia.io",
    type: "personal"
  },
  {
    id: "jurnaltrading",
    title: "Jurnal Trading",
    desc: "Jurnal Trading is the disciplined trader’s ultimate ledger—a precision-engineered analytic tool designed to transform raw data into actionable strategy.",
    details: "This platform serves as a secure, personal command post where traders can meticulously document positions, analyze performance metrics, and refine their edge. Featuring a seamless 'Magic Link' authentication system, it prioritizes speed and security, allowing you to focus entirely on optimizing your portfolio without the friction of traditional passwords.",
    logoImg: "jurnaltrading.png",
    domain: "https://jurnaltrading.cryptodirectoryindonesia.io",
    type: "personal"
  },
  {
    id: "cyberwebscanner",
    title: "Cyber Web Scanner",
    desc: "Cyber Web Scanner is a high-performance digital reconnaissance platform designed for the modern web security landscape.",
    details: "Wrapt in a sleek, cyberpunk-inspired interface, this tool acts as an automated security auditor that dissects target websites with surgical precision. It proactively hunts for critical vulnerabilities—from exposed .git repositories to missing security headers—and delivers a comprehensive, grade-based risk assessment (A-F). It’s not just a scanner; it’s a hardened command center for developers and security analysts to visualize their digital perimeter's integrity.",
    logoImg: "cyberwebscanner.png",
    domain: "https://cyberwebscanner.onrender.com",
    type: "personal"
  },
    {
    id: "blastflow",
    title: "BlastFlow",
    desc: "BlastFlow executes high-velocity communication sequences with precision.",
    details: "An automated orchestration engine designed for mass-scale data transmission. This system manages complex broadcast workflows, ensuring targeted delivery with real-time latency monitoring and adaptive queue optimization.",
    logoImg: "blastflow.png",
    domain: "blastflow.onrender.com",
    type: "personal"
  },
];

// --- PORTFOLIO PROJECTS DATA (NEW) ---
export const portfolioProjects = [
  {
    id: "mochichewy",
    title: "Mochi Chewy",
    desc: "Mochi Chewy isn't just a dessert; it's a sensory revolution wrapped in a soft, pillowy embrace.",
    details: "Dubbed as the 'Ultimate Chew,' this vibrant landing page introduces a mouth-watering lineup of artisanal mochi that promises to explode with flavor in every bite. Built with attention to visual temptation and user engagement.",
    logoImg: null, 
    domain: "https://febriosht.github.io/Mochi-Chewy",
    type: "portfolio"
  },
  {
    id: "florarosecatering",
    title: "Flora Rose Catering",
    desc: "Flora Rose Catering serves as a sophisticated digital showcase for culinary excellence.",
    details: "With over nine years of service, this platform elegantly presents a rotating daily menu. It elegantly bridges the gap between a busy lifestyle and the warmth of a well-prepared home-cooked lunch.",
    logoImg: null,
    domain: "https://febriosht.github.io/Flora-Rose-Catering",
    type: "portfolio"
  },
  {
    id: "cassajuara",
    title: "Cassa Juara",
    desc: "Cassa Juara is a digital showcase for wholesome, halal-certified snacking.",
    details: "This vibrant single-page platform introduces a curated selection of premium, preservative-free treats. Emphasizes purity and taste through a seamless browsing experience.",
    logoImg: null, 
    domain: "https://cassa-juara.vercel.app",
    type: "portfolio"        
  },
  {
    id: "swakarsadigitalpos",
    title: "Swakarsa Digital PoS",
    desc: "Swakarsa Digital PoS serves as the command center for modern commerce.",
    details: "Next-generation Point of Sale ecosystem designed to streamline retail operations. Intuitive, data-driven interface that empowers business owners with real-time analytics.",
    logoImg: null,
    domain: "https://profile-pos.vercel.app",
    type: "portfolio"
  },
  {
    id: "anugerahrekenanbersama",
    title: "PT.Anugerah Rekenan Bersama",
    desc: "The definitive growth engine for modern enterprises, fusing marketing with talent acquisition.",
    details: "Sophisticated Recruitment & Outsourcing ecosystem designed to bridge the gap between ambitious businesses and top-tier professionals.",
    logoImg: null,
    domain: "https://anugerahrekananbersama.site",
    type: "portfolio"
  },
  {
    id: "swakarsadigital",
    title: "Swakarsa Digital",
    desc: "Swakarsa Digital is the architect of the modern digital enterprise.",
    details: "High-powered freelancer collective dedicated to engineering scalable digital ecosystems, from web applications to AI-driven automation.",
    logoImg: null,
    domain: "https://swakarsadigital.vercel.app",
    type: "portfolio"
  },
  {
    id: "jenggalacoffee",
    title: "Jenggala Coffee & Brew",
    desc: "Jenggala Coffee & Brew serves as a serene sanctuary where tradition meets the art of manual brewing.",
    details: "Nestled within a lush, green landscape in Bandar Lampung, this digital gateway invites you to a rustic retreat surrounded by nature's calm. More than just a coffee shop, it is an immersive escape designed for connection and quiet contemplation, offering a curated menu of premium espresso blends and signature manual brews. It’s the perfect hideaway for digital nomads, creative souls, and friends seeking quality time in an authentic, traditional setting.",
    logoImg: null, // Placeholder if no image provided
    domain: "https://kerabatjenggala.xo.je",
    type: "jenggalacoffee"
  },
  {
    id: "satuoptimajaya",
    title: "CV.Satu Optima Jaya",
    desc: "Satu Optima Jaya configures the physical layer of enterprise operations.",
    details: "A digital manifest for a General Contractor & Supplier entity. This platform streamlines the procurement interface, showcasing heavy-industry capabilities, logistical frameworks, and structural integrity with corporate precision.",
    logoImg: null, 
    domain: "cvsatuoptimajaya.vercel.app",
    type: "portfolio"
  },
  {
    id: "gmapscout",
    title: "GMaps Scout",
    desc: "GMaps Scout operates as a tactical intelligence engine for automated geospatial data mining.",
    details: "A specialized Open Source Intelligence (OSINT) tool engineered for high-precision lead generation. Built on Streamlit, this ecosystem systematically parses Google Maps to harvest critical business metadata—transforming raw location signals into structured, actionable commercial assets.",
    logoImg: null,
    domain: "gmapscout.streamlit.app",
    type: "portfolio"
  },
    {
    id: "gggindonesia",
    title: "PT.Gatha Gemilang Global",
    desc: "Based in Medan, North Sumatra, Indonesia, Gatha Gemilang Global is a premier export trading company founded in 2025.",
    details: "Backed by stakeholders with years of deep expertise in the Business and Banking Industries, we focus on connecting global markets with the finest products from across the Indonesian archipelago.",
    logoImg: null,
    domain: "gggindonesia.com",
    type: "portfolio"
  },
];

// --- MAIN CONTENT TRANSLATIONS ---
export const content = {
  en: {
    nav: {
      dashboard: "DASHBOARD",
      modules: "MODULES",
      logs: "LOGS",
      whoami: "WHO AM I",
      status: "SYSTEM ONLINE"
    },
    hero: {
      badge: "ARCHITECT OF DIGITAL SYSTEMS",
      title_start: "BUILDING THE",
      title_highlight: "FUTURE",
      title_end: "WITH CODE & LOGIC",
      description: "Welcome to the FUNCTION OVERRIDE SHIFT control panel. The command center for all digital initiatives, crypto developments, and technical experiments.",
      btn_primary: "INITIATE PROTOCOL",
      btn_processing: "PROCESSING...",
      btn_secondary: "SECURE ACCESS"
    },
    modules: {
      title: "ACTIVE MODULES",
      path: "/root/directories/projects",
      stats: "MEMORY USAGE: 14% | THREADS: OPTIMAL",
      filters: {
        personal: "PERSONAL",
        portfolio: "PORTFOLIO",
        oshtore: "OSHTORE"
      },
      view_more: "VIEW ALL PROJECTS",
      cards: [
        ...personalProjects, 
        ...portfolioProjects,
        // --- OSHTORE ITEM ---
        {
          id: "oshtore-web-service",
          title: "OSHTORE: Premium Web Development",
          desc: "Elevate your brand with high-performance, custom-coded websites designed for scalability and impact.",
          details: "OSHTORE provides end-to-end web development services tailored for businesses that demand excellence. From sleek landing pages to complex web applications, we utilize the latest tech stack (React, Next.js, Tailwind) to build digital experiences that are not only visually stunning but also lightning-fast and secure. This module represents the gateway to transforming your digital presence.",
          logoImg: "oshtore.png", 
          domain: "oshtore.vercel.app",
          type: "oshtore"
        }
      ]
    },
    contact: {
      title: "ESTABLISH SECURE CONNECTION",
      subtitle: "ENCRYPTED CHANNEL: ACTIVE",
      name_label: "CODENAME / ID",
      email_label: "RETURN FREQUENCY (EMAIL)",
      msg_label: "DATA PACKET (MESSAGE)",
      btn_send: "TRANSMIT DATA",
      btn_sending: "ENCRYPTING & SENDING...",
      btn_sent: "TRANSMISSION COMPLETE",
      secure_note: "Traffic is end-to-end encrypted. No third-party interception possible.",
      error_title: "TRANSMISSION FAILED",
      error_msg: "CRITICAL ERROR: INVALID EMAIL SYNTAX DETECTED. CONNECTION REFUSED.",
      success_msg: "DATA PACKET UPLOADED SUCCESSFULLY. REDIRECTING TO SECURE MAIL CLIENT..."
    },
    logs: {
      title: "SYSTEM LOGS",
      path: "/var/log/syslog",
      btn_docs: "view_log/dictionary"
    },
    docs: {
      title: "SYSTEM LOG REFERENCE MANUAL",
      back_btn: "RETURN TO TERMINAL",
      subtitle: "DECODING FOSHT KERNEL OUTPUTS",
      sections: [
        {
          title: "INITIALIZATION PROTOCOLS",
          icon: Terminal,
          items: [
            { code: "INITIALIZING FOSHT KERNEL", desc: "The core system kernel is booting up." },
            { code: "ESTABLISHING SECURE HANDSHAKE", desc: "Initiating encrypted connection (TLS/SSL)." },
            { code: "CONNECTION SECURED", desc: "Secure channel established successfully." }
          ]
        },
        {
          title: "RECONNAISSANCE & DATA PERANGKAT",
          icon: Eye,
          items: [
            { code: "DETECTED AGENT", desc: "Identifying the client's browser signature." },
            { code: "SCREEN RES", desc: "Logging viewport dimensions for responsive layout adaptation." }
          ]
        },
        {
          title: "USER INTERACTION TRACKING",
          icon: MousePointer,
          items: [
            { code: "VIEWPORT UPDATE", desc: "Real-time scroll position tracking (Throttled)." },
            { code: "INPUT DETECTED", desc: "Mouse click coordinates [X,Y] and target element identification." },
            { code: "SECURITY ALERT", desc: "Triggered when clipboard access (Copy/Cut) is detected." },
            { code: "USER SESSION: IDLE/ACTIVE", desc: "Monitors tab visibility state (Focus/Blur)." }
          ]
        },
        {
          title: "NAVIGATION & UI EVENTS",
          icon: Activity,
          items: [
            { code: "USER_OVERRIDE", desc: "Manual activation of the main protocol (Hero Button)." },
            { code: "NAVIGATION", desc: "Internal routing events (Scrolls, Page Changes)." },
            { code: "FILTER", desc: "Category switching in the Modules section." },
            { code: "MODAL", desc: "Project detail viewer interaction (Open/Close)." },
            { code: "SECURE CHANNEL", desc: "Status of the contact form connection." },
            { code: "LANGUAGE CHANGED", desc: "Localization preference update (EN/ID)." }
          ]
        },
        {
          title: "SIMULASI SISTEM",
          icon: Server,
          items: [
            { code: "GARBAGE_COLLECTION", desc: "Simulated memory optimization process." },
            { code: "PING", desc: "Latency check to the main server." },
            { code: "CHECKING INTEGRITY", desc: "Verifying DOM structure and component health." },
            { code: "BLOCKING INTRUSION", desc: "Mock firewall activity blocking unauthorized ports." },
            { code: "SYNCING DATA", desc: "Background synchronization with remote repositories." }
          ]
        }
      ]
    },
    whoami: {
      title: "WHO AM I",
      path: "/root/ident/sosial",
    },
    footer: {
      copyright: "SYSTEM ARCHITECTURE V1.0"
    }
  },
  id: {
    nav: {
      dashboard: "DASBOR",
      modules: "MODUL",
      logs: "LOGS",
      whoami: "SIAPA SAYA",
      status: "SISTEM ONLINE"
    },
    hero: {
      badge: "ARSITEK SISTEM DIGITAL",
      title_start: "MEMBANGUN",
      title_highlight: "MASA DEPAN",
      title_end: "DENGAN KODE & LOGIKA",
      description: "Selamat datang di control panel FOSHT. Pusat kendali untuk semua inisiatif digital, pengembangan kripto, dan eksperimen teknis.",
      btn_primary: "MULAI PROTOKOL",
      btn_secondary: "AKSES AMAN"
    },
    modules: {
      title: "MODUL AKTIF",
      path: "/root/direktori/proyek",
      stats: "PENGGUNAAN MEMORI: 14% | THREAD: OPTIMAL",
      filters: {
        personal: "PERSONAL",
        portfolio: "PORTFOLIO",
        oshtore: "OSHTORE"
      },
      view_more: "LIHAT SEMUA PROYEK",
      cards: [
        ...personalProjects, 
        ...portfolioProjects,
        // --- OSHTORE ITEM ---
        {
          id: "oshtore-web-service",
          title: "OSHTORE: Jasa Pembuatan Website",
          desc: "Solusi digital komprehensif untuk membangun identitas online Anda. Cepat, aman, dan didesain khusus.",
          details: "Layanan ini adalah gateway utama untuk transformasi digital bisnis Anda. Kami menawarkan pembuatan website custom mulai dari Landing Page, Company Profile, hingga Web Application yang kompleks. Menggunakan teknologi terkini (React, Next.js, Node.js), kami memastikan website Anda tidak hanya estetis, tetapi juga memiliki performa tinggi, SEO friendly, dan keamanan terjamin. Klik untuk konsultasi lebih lanjut di platform OSHTORE yang akan datang.",
          logoImg: "oshtore.png", 
          domain: "oshtore.vercel.app",
          type: "oshtore"
        }
      ]
    },
    contact: {
      title: "BUKA KONEKSI AMAN",
      subtitle: "SALURAN TERENKRIPSI: AKTIF",
      name_label: "CODENAME / ID",
      email_label: "FREKUENSI BALASAN (EMAIL)",
      msg_label: "PAKET DATA (PESAN)",
      btn_send: "TRANSMISIKAN DATA",
      btn_sending: "MENGENKRIPSI & MENGIRIM...",
      btn_sent: "TRANSMISI SELESAI",
      secure_note: "Lalu lintas terenkripsi end-to-end. Intersepsi pihak ketiga tidak dimungkinkan.",
      error_title: "TRANSMISI GAGAL",
      error_msg: "KESALAHAN KRITIS: SINTAKS EMAIL TIDAK VALID TERDETEKSI. KONEKSI DITOLAK.",
      success_msg: "PAKET DATA BERHASIL DIUNGGAH. MENGALIHKAN KE KLIEN EMAIL AMAN..."
    },
    logs: {
      title: "LOG SISTEM",
      path: "/var/log/syslog",
      btn_docs: "LIHAT KAMUS LOG"
    },
    docs: {
      title: "MANUAL REFERENSI LOG SISTEM",
      back_btn: "KEMBALI KE TERMINAL",
      subtitle: "DECODING OUTPUT KERNEL FOSHT",
      sections: [
        {
          title: "PROTOKOL INISIALISASI",
          icon: Terminal,
          items: [
            { code: "INITIALIZING FOSHT KERNEL", desc: "Kernel sistem inti sedang memulai proses boot." },
            { code: "ESTABLISHING SECURE HANDSHAKE", desc: "Memulai koneksi terenkripsi (TLS/SSL)." },
            { code: "CONNECTION SECURED", desc: "Saluran aman berhasil dibuat." }
          ]
        },
        {
          title: "RECONNAISSANCE & DATA PERANGKAT",
          icon: Eye,
          items: [
            { code: "DETECTED AGENT", desc: "Mengidentifikasi tanda tangan browser/klien." },
            { code: "SCREEN RES", desc: "Mencatat dimensi viewport untuk adaptasi tata letak responsif." }
          ]
        },
        {
          title: "PELACAKAN INTERAKSI PENGGUNA",
          icon: MousePointer,
          items: [
            { code: "VIEWPORT UPDATE", desc: "Pelacakan posisi scroll waktu nyata (Dibatasi)." },
            { code: "INPUT DETECTED", desc: "Koordinat klik mouse [X,Y] dan identifikasi elemen target." },
            { code: "SECURITY ALERT", desc: "Dicuplik ketika akses papan klip (Salin/Potong) terdeteksi." },
            { code: "USER SESSION: IDLE/ACTIVE", desc: "Memantau status visibilitas tab (Fokus/Blur)." }
          ]
        },
        {
          title: "NAVIGASI & EVENT UI",
          icon: Activity,
          items: [
            { code: "USER_OVERRIDE", desc: "Aktivasi manual protokol utama (Tombol Hero)." },
            { code: "NAVIGATION", desc: "Peristiwa perutean internal (Scroll, Perubahan Halaman)." },
            { code: "FILTER", desc: "Peralihan kategori di bagian Modul." },
            { code: "MODAL", desc: "Interaksi penampil detail proyek (Buka/Tutup)." },
            { code: "SECURE CHANNEL", desc: "Status koneksi formulir kontak." },
            { code: "LANGUAGE CHANGED", desc: "Pembaruan preferensi lokalisasi (EN/ID)." }
          ]
        },
        {
          title: "SIMULASI SISTEM",
          icon: Server,
          items: [
            { code: "GARBAGE_COLLECTION", desc: "Proses optimalisasi memori yang disimulasikan." },
            { code: "PING", desc: "Pemeriksaan latensi ke server utama." },
            { code: "CHECKING INTEGRITY", desc: "Memverifikasi struktur DOM dan kesehatan komponen." },
            { code: "BLOCKING INTRUSION", desc: "Aktivitas firewall tiruan memblokir port yang tidak sah." },
            { code: "SYNCING DATA", desc: "Sinkronisasi latar belakang dengan repositori jarak jauh." }
          ]
        }
      ]
    },
    whoami: {
      title: "SIAPA SAYA",
      path: "/root/ident/sosial",
    },
    footer: {
      copyright: "ARSITEKTUR SISTEM V1.0"
    }
  }
};