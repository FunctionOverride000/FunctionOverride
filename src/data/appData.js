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
    logoImg: "/cryptodirectoryindonesia.png",
    domain: "cryptodirectoryindonesia.io",
    type: "personal"
  },
  {
    id: "chatglobal",
    title: "Chat Global",
    desc: "Chat Global is the clandestine command center for the crypto elite.",
    details: "Ditching traditional interfaces for a raw, retro-futuristic CLI (Command Line Interface) aesthetic, this portal serves as a secure gateway for high-level communication. It offers an immersive, distraction-free environment where operatives can initiate encrypted connections, register distinct identities, and exchange critical market intelligence in a setting that feels straight out of a hacker's terminal.",
    logoImg: "/chatglobal.png",
    domain: "https://chatglobal.cryptodirectoryindonesia.io",
    type: "personal"
  },
  {
    id: "jurnaltrading",
    title: "Jurnal Trading",
    desc: "Jurnal Trading is the disciplined trader's ultimate ledger—a precision-engineered analytic tool designed to transform raw data into actionable strategy.",
    details: "This platform serves as a secure, personal command post where traders can meticulously document positions, analyze performance metrics, and refine their edge. Featuring a seamless 'Magic Link' authentication system, it prioritizes speed and security, allowing you to focus entirely on optimizing your portfolio without the friction of traditional passwords.",
    logoImg: "/jurnaltrading.png",
    domain: "https://jurnaltrading.cryptodirectoryindonesia.io",
    type: "personal"
  },
  {
    id: "cyberwebscanner",
    title: "Cyber Web Scanner",
    desc: "Cyber Web Scanner is a high-performance digital reconnaissance platform designed for the modern web security landscape.",
    details: "Wrapt in a sleek, cyberpunk-inspired interface, this tool acts as an automated security auditor that dissects target websites with surgical precision. It proactively hunts for critical vulnerabilities—from exposed .git repositories to missing security headers—and delivers a comprehensive, grade-based risk assessment (A-F). It's not just a scanner; it's a hardened command center for developers and security analysts to visualize their digital perimeter's integrity.",
    logoImg: "/cyberwebscanner.png",
    domain: "https://cyberwebscanner.onrender.com",
    type: "personal"
  },
  {
    id: "blastflow",
    title: "BlastFlow",
    desc: "BlastFlow executes high-velocity communication sequences with precision.",
    details: "An automated orchestration engine designed for mass-scale data transmission. This system manages complex broadcast workflows, ensuring targeted delivery with real-time latency monitoring and adaptive queue optimization.",
    logoImg: "/blastflow.png",
    domain: "https://blastflow.vercel.app",
    type: "personal"
  },
];

// --- PORTFOLIO PROJECTS DATA ---
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
    details: "Nestled within a lush, green landscape in Bandar Lampung, this digital gateway invites you to a rustic retreat surrounded by nature's calm. More than just a coffee shop, it is an immersive escape designed for connection and quiet contemplation, offering a curated menu of premium espresso blends and signature manual brews.",
    logoImg: null,
    domain: "https://kerabatjenggala.xo.je",
    type: "portfolio"
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
  {
    id: "leadscout",
    title: "LeadScout",
    desc: "LeadScout is a premium B2B Executive Profiler and automated web scraping engine.",
    details: "Engineered for high-precision data mining, this tool leverages API backends to bypass conventional bot protections. It systematically extracts C-level executive profiles and commercial metadata across specific industries, acting as a stealthy, high-yield lead generation command center.",
    logoImg: null, // Anda bisa menggantinya jika nanti memiliki logo khusus, misal: "/leadscout.png"
    domain: "https://xleadscout.streamlit.app",
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
        {
          id: "oshtore-web-service",
          title: "OSHTORE: Premium Web Development",
          desc: "Elevate your brand with high-performance, custom-coded websites designed for scalability and impact.",
          details: "OSHTORE provides end-to-end web development services tailored for businesses that demand excellence. From sleek landing pages to complex web applications, we utilize the latest tech stack (React, Next.js, Tailwind) to build digital experiences that are not only visually stunning but also lightning-fast and secure.",
          logoImg: "/oshtore.png",
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
            { code: "INITIALIZING FOSHT KERNEL", desc: "Core system kernel is booting up and loading all modules." },
            { code: "UPLINK_ESTABLISHED", desc: "Visitor's real public IP address has been successfully identified." },
            { code: "GEOLOCATION", desc: "Visitor's city, region, and country detected based on their IP address." },
            { code: "ISP_PROVIDER", desc: "Internet Service Provider name (e.g. Telkom, Indihome, XL, Biznet)." },
            { code: "TIMEZONE", desc: "Visitor's timezone and UTC offset detected from IP geolocation." },
            { code: "THREAT_INTEL", desc: "VPN/Proxy/Datacenter detection. WARNING = suspicious/masked connection detected, SUCCESS = clean residential ISP." },
          ]
        },
        {
          title: "HARDWARE & DEVICE RECON",
          icon: Eye,
          items: [
            { code: "AGENT_DETECTED", desc: "Browser name and operating system in use (e.g. Chrome on Windows 10/11, Firefox on Linux, Safari on iOS)." },
            { code: "VIEWPORT", desc: "Physical screen resolution vs actual browser window size at time of visit." },
            { code: "CPU_CORES", desc: "Number of logical CPU processors on visitor's device. Only available on Chromium-based browsers (Chrome/Edge)." },
            { code: "DEVICE_RAM", desc: "Approximate total RAM of visitor's device in GB. Only available on Chromium-based browsers." },
            { code: "JS_HEAP", desc: "Current JavaScript memory usage vs total allocated heap size. Chromium only." },
            { code: "INPUT_DEVICE", desc: "Detects if visitor is using a touch screen (mobile/tablet) or mouse+keyboard (desktop)." },
            { code: "LOCALE", desc: "Visitor's browser language setting (e.g. id-ID, en-US) and whether cookies are enabled." },
            { code: "MEMORY_SNAPSHOT", desc: "Periodic JS heap memory reading, automatically updated every 30 seconds." },
          ]
        },
        {
          title: "NETWORK & CONNECTION",
          icon: Server,
          items: [
            { code: "NETWORK_TYPE", desc: "Connection quality type: 4G, 3G, WIFI, etc. Includes estimated download speed (Mbps) and round-trip time (ms)." },
            { code: "DATA_SAVER_MODE", desc: "Indicates whether the visitor has enabled data saver mode in their browser settings." },
            { code: "NETWORK_LATENCY", desc: "Real ping time (ms) measured from visitor's browser to this server. Rated: EXCELLENT (<80ms) | GOOD (<200ms) | FAIR (<400ms) | POOR (400ms+). Auto-updated every 15 seconds." },
            { code: "PING_SERVICE: PACKET_LOSS", desc: "Ping request failed — visitor may have an unstable or intermittent connection." },
          ]
        },
        {
          title: "USER INTERACTION TRACKING",
          icon: MousePointer,
          items: [
            { code: "SIGNAL_INPUT: CLICK", desc: "Records every mouse click event with exact X/Y screen coordinates and the HTML tag of the element clicked." },
            { code: "SECURITY: CLIPBOARD_WRITE", desc: "Triggered whenever the visitor copies any text from this page to their clipboard." },
            { code: "SCROLL_DEPTH", desc: "Tracks how far down the page the visitor has scrolled, displayed as a percentage of total page height and pixel offset. Throttled to log max once every 3 seconds." },
            { code: "SESSION_STATUS: USER_LEFT_TAB", desc: "Visitor switched to another browser tab or minimized the window (session is idle/standby)." },
            { code: "SESSION_STATUS: USER_RETURNED", desc: "Visitor came back to this tab and the session is active again." },
            { code: "SESSION_STATUS: USER_INACTIVE", desc: "No mouse movement has been detected for 30 consecutive seconds." },
          ]
        },
        {
          title: "NAVIGATION & UI EVENTS",
          icon: Activity,
          items: [
            { code: "PROTOCOL_INIT", desc: "Main 'Initiate Protocol' button was pressed — triggering smooth scroll to modules section." },
            { code: "NAVIGATION", desc: "Internal routing events such as scroll jumps, view switches (dashboard ↔ logs-doc)." },
            { code: "FILTER_SET", desc: "Category filter was changed in the Active Modules section (PERSONAL / PORTFOLIO / OSHTORE)." },
            { code: "PROCESS_KILL", desc: "Project detail modal was closed by the visitor." },
            { code: "UI_TRIGGER", desc: "Secure contact form modal was opened." },
            { code: "COMM_BRIDGE", desc: "Contact form connection was dropped — modal closed without sending." },
            { code: "LOCALIZATION", desc: "Language preference was switched between English (EN) and Indonesian (ID)." },
            { code: "UI_EVENT", desc: "Visitor navigated to the System Log Dictionary reference page." },
          ]
        },
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
      btn_processing: "MEMPROSES...",
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
        {
          id: "oshtore-web-service",
          title: "OSHTORE: Jasa Pembuatan Website",
          desc: "Solusi digital komprehensif untuk membangun identitas online Anda. Cepat, aman, dan didesain khusus.",
          details: "Layanan ini adalah gateway utama untuk transformasi digital bisnis Anda. Kami menawarkan pembuatan website custom mulai dari Landing Page, Company Profile, hingga Web Application yang kompleks. Menggunakan teknologi terkini (React, Next.js, Node.js), kami memastikan website Anda tidak hanya estetis, tetapi juga memiliki performa tinggi, SEO friendly, dan keamanan terjamin.",
          logoImg: "/oshtore.png",
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
      btn_docs: "lihat_log/kamus"
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
            { code: "INITIALIZING FOSHT KERNEL", desc: "Kernel sistem inti sedang booting dan memuat semua modul." },
            { code: "UPLINK_ESTABLISHED", desc: "Alamat IP publik nyata pengunjung telah berhasil diidentifikasi." },
            { code: "GEOLOCATION", desc: "Kota, wilayah, dan negara pengunjung terdeteksi berdasarkan alamat IP mereka." },
            { code: "ISP_PROVIDER", desc: "Nama penyedia layanan internet pengunjung (contoh: Telkom, Indihome, XL, Biznet)." },
            { code: "TIMEZONE", desc: "Zona waktu dan offset UTC pengunjung yang terdeteksi dari geolokasi IP." },
            { code: "THREAT_INTEL", desc: "Deteksi VPN/Proxy/Datacenter. WARNING = koneksi mencurigakan/tersamarkan terdeteksi, SUCCESS = ISP rumahan biasa." },
          ]
        },
        {
          title: "RECONNAISSANCE HARDWARE & PERANGKAT",
          icon: Eye,
          items: [
            { code: "AGENT_DETECTED", desc: "Nama browser dan sistem operasi yang digunakan (contoh: Chrome di Windows 10/11, Firefox di Linux, Safari di iOS)." },
            { code: "VIEWPORT", desc: "Resolusi layar fisik vs ukuran jendela browser aktual saat mengunjungi halaman ini." },
            { code: "CPU_CORES", desc: "Jumlah inti CPU logis pada perangkat pengunjung. Hanya tersedia di browser berbasis Chromium (Chrome/Edge)." },
            { code: "DEVICE_RAM", desc: "Perkiraan total RAM perangkat pengunjung dalam GB. Hanya tersedia di browser Chromium." },
            { code: "JS_HEAP", desc: "Penggunaan memori JavaScript saat ini vs total heap yang dialokasikan. Hanya Chromium." },
            { code: "INPUT_DEVICE", desc: "Mendeteksi apakah pengunjung menggunakan layar sentuh (mobile/tablet) atau mouse+keyboard (desktop)." },
            { code: "LOCALE", desc: "Pengaturan bahasa browser pengunjung (contoh: id-ID, en-US) dan apakah cookie diaktifkan." },
            { code: "MEMORY_SNAPSHOT", desc: "Pembacaan memori JS heap secara berkala, diperbarui otomatis setiap 30 detik." },
          ]
        },
        {
          title: "JARINGAN & KONEKSI",
          icon: Server,
          items: [
            { code: "NETWORK_TYPE", desc: "Jenis kualitas koneksi: 4G, 3G, WiFi, dll. Termasuk estimasi kecepatan unduh (Mbps) dan round-trip time (ms)." },
            { code: "DATA_SAVER_MODE", desc: "Menunjukkan apakah pengunjung mengaktifkan mode hemat data di pengaturan browsernya." },
            { code: "NETWORK_LATENCY", desc: "Waktu ping nyata (ms) dari browser pengunjung ke server ini. Rating: EXCELLENT (<80ms) | GOOD (<200ms) | FAIR (<400ms) | POOR (400ms+). Diperbarui otomatis setiap 15 detik." },
            { code: "PING_SERVICE: PACKET_LOSS", desc: "Permintaan ping gagal — pengunjung mungkin memiliki koneksi yang tidak stabil atau terputus-putus." },
          ]
        },
        {
          title: "PELACAKAN INTERAKSI PENGGUNA",
          icon: MousePointer,
          items: [
            { code: "SIGNAL_INPUT: CLICK", desc: "Mencatat setiap event klik mouse dengan koordinat X/Y layar yang tepat dan tag HTML dari elemen yang diklik." },
            { code: "SECURITY: CLIPBOARD_WRITE", desc: "Dipicu setiap kali pengunjung menyalin teks apapun dari halaman ini ke clipboard mereka." },
            { code: "SCROLL_DEPTH", desc: "Melacak seberapa jauh pengunjung menggulir halaman, ditampilkan sebagai persentase dari total tinggi halaman dan offset piksel. Dibatasi maksimal sekali setiap 3 detik." },
            { code: "SESSION_STATUS: USER_LEFT_TAB", desc: "Pengunjung berpindah ke tab browser lain atau meminimalkan jendela (sesi idle/standby)." },
            { code: "SESSION_STATUS: USER_RETURNED", desc: "Pengunjung kembali ke tab ini dan sesi aktif kembali." },
            { code: "SESSION_STATUS: USER_INACTIVE", desc: "Tidak ada gerakan mouse yang terdeteksi selama 30 detik berturut-turut." },
          ]
        },
        {
          title: "NAVIGASI & EVENT UI",
          icon: Activity,
          items: [
            { code: "PROTOCOL_INIT", desc: "Tombol 'Mulai Protokol' ditekan — memicu smooth scroll ke bagian modul." },
            { code: "NAVIGATION", desc: "Event routing internal seperti lompatan scroll, pergantian tampilan (dashboard ↔ logs-doc)." },
            { code: "FILTER_SET", desc: "Filter kategori diubah di bagian Modul Aktif (PERSONAL / PORTFOLIO / OSHTORE)." },
            { code: "PROCESS_KILL", desc: "Modal detail proyek ditutup oleh pengunjung." },
            { code: "UI_TRIGGER", desc: "Modal form kontak aman dibuka." },
            { code: "COMM_BRIDGE", desc: "Koneksi form kontak diputus — modal ditutup tanpa mengirim pesan." },
            { code: "LOCALIZATION", desc: "Preferensi bahasa diubah antara Inggris (EN) dan Indonesia (ID)." },
            { code: "UI_EVENT", desc: "Pengunjung menavigasi ke halaman referensi Kamus Log Sistem." },
          ]
        },
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