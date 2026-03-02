FOSHT OS / FENNEC EMAIL PLATFORM 🦊💻

Fosht OS adalah platform email pribadi (Personal Email Hub) dengan antarmuka bertema Cyberpunk/Hacker Terminal. Sistem ini memungkinkan Anda menerima email sungguhan dari internet (Gmail, Yahoo, dll) langsung ke dashboard pribadi Anda tanpa perantara layanan email konvensional seperti Gmail/Outlook untuk membacanya.

Dibangun dengan React, Node.js, dan Supabase, proyek ini mengubah pengalaman membaca email menjadi seperti sebuah adegan dalam film sci-fi.

🏗️ Arsitektur Sistem (Alur Kerja)

Berikut adalah perjalanan data saat seseorang mengirim email kepada Anda:

Pengirim: Seseorang mengirim email dari Gmail ke alamat CloudMailin Anda (misal: 4b9f...@cloudmailin.net).

CloudMailin (Tukang Pos): Menerima email tersebut, memparsing header/body, dan mengubahnya menjadi format JSON.

Ngrok (Terowongan): CloudMailin mengirim ("POST") data JSON tersebut ke URL publik Ngrok Anda (karena server backend kita berjalan di localhost).

Backend (Node.js): Menerima data dari Ngrok di endpoint /api/webhook, memprosesnya, dan menyimpannya ke Database.

Database (Supabase): Menyimpan email secara aman di cloud (PostgreSQL).

Frontend (React): Mengambil data dari Backend, menerapkan logika "Auto-Purge", dan menampilkannya dengan gaya Hacker Terminal di layar Anda.

✅ Status Proyek & Checklist Sistem

Bagian ini mencatat apa yang sudah dibangun, apa yang wajib dilakukan agar sistem berjalan, dan apa yang bisa ditambahkan nanti.

🟢 SUDAH SELESAI (Implemented Features)

Fitur-fitur ini sudah ada dalam kode dan berfungsi 100%:

[x] Setup Database: Tabel emails di Supabase dengan RLS dinonaktifkan.

[x] Backend Server: Express server berjalan di port 3001.

[x] Webhook Receiver: Endpoint /api/webhook untuk menerima JSON dari CloudMailin.

[x] Frontend UI: Tampilan tema Cyberpunk/Hacker (Hitam & Hijau Neon) dengan efek Scanline & Glitch.

[x] Fitur Baca: Indikator "Belum Dibaca" (Teks Tebal/Hijau Terang) dan "Sudah Dibaca" (Teks Redup).

[x] Fitur Hapus (Manual): Tombol tong sampah berfungsi menghapus data di database.

[x] Fitur Hapus Otomatis (Auto-Purge): Sistem otomatis menghapus email yang lebih tua dari 90 hari saat dashboard dibuka.

[x] System Logs: Tampilan log aktivitas sistem di sidebar layaknya terminal OS.

[x] Custom Logo: Integrasi logo fosht.jpeg sebagai watermark dan icon profil.

🟡 PROSEDUR RUTIN (Wajib Dilakukan Saat Menyalakan)

Karena kita menggunakan versi gratis (Ngrok & Localhost), langkah ini wajib dilakukan setiap kali Anda ingin menggunakan sistem:

[ ] Nyalakan 3 Terminal (Backend, Frontend, Ngrok).

[ ] Copy URL HTTPS baru dari terminal Ngrok.

[ ] Update Target URL di dashboard CloudMailin.

[ ] Pastikan URL di CloudMailin berakhiran /api/webhook.

⚪ OPSIONAL (Ide Pengembangan Masa Depan)

[ ] Beli Domain: Menggunakan domain sendiri (misal me@fosht.com) via Mailgun/Cloudflare agar alamatnya cantik.

[ ] Deploy ke VPS: Mengupload Backend ke server VPS (DigitalOcean/AWS) agar tidak perlu menyalakan laptop dan Ngrok terus-menerus.

[ ] Login System: Menambahkan halaman login password agar dashboard tidak bisa dibuka orang lain.

[ ] Reply Feature: Menambahkan kemampuan untuk membalas email langsung dari dashboard.

🛠️ Teknologi yang Digunakan

Frontend: React (Vite), TypeScript, Tailwind CSS, Lucide Icons, Date-fns.

Backend: Node.js, Express.js, Multer.

Database: Supabase (PostgreSQL).

Connectivity: Ngrok (Tunneling), CloudMailin (Inbound Email Parsing).

🚀 Panduan Instalasi & Menjalankan (Step-by-Step)

1. Persiapan Awal

Pastikan file fosht.jpeg sudah Anda letakkan di dalam folder frontend/public/ agar logo tampil dengan benar.

2. Menjalankan Sistem (3 Terminal)

Anda perlu membuka 3 Terminal berbeda secara bersamaan:

Terminal 1: Backend (Otak)

cd backend
node server.js


Indikator Sukses: Muncul pesan 🚀 Server Backend berjalan di http://localhost:3001

Terminal 2: Frontend (Wajah)

cd frontend
npm run dev


Indikator Sukses: Browser bisa dibuka di http://localhost:5173. Tampilan Hacker harusnya muncul.

Terminal 3: Ngrok (Pintu Internet)

ngrok http 3001


Indikator Sukses: Muncul status "Online" dan URL forwarding (misal: https://abcd-123.ngrok-free.app).

3. Menghubungkan Internet (CloudMailin)

Ini langkah krusial agar email bisa masuk.

Salin URL HTTPS dari Terminal 3 (Ngrok).

Login ke CloudMailin.

Edit alamat penerima Anda.

Pada kolom Target URL, paste URL Ngrok dan tambahkan /api/webhook di belakangnya.

❌ Salah: https://abcd-123.ngrok-free.app

✅ Benar: https://abcd-123.ngrok-free.app/api/webhook

Simpan (Save).

✨ Fitur Spesial: "Hacker Mode"

Scanline Effect: Garis animasi yang bergerak turun memberikan efek monitor tabung (CRT) lama.

System Logs: Perhatikan kotak di sidebar kiri. Ia akan menampilkan log nyata seperti > DELETING FILE ID_45... atau > AUTO-PURGE: 0 FILES REMOVED.

Watermark: Logo Fosht terlihat transparan di latar belakang.

Sound Effect (Imaginary): Tampilan ini didesain agar Anda merasa seperti sedang meretas sistem korporat dari bunker bawah tanah.

⚠️ Troubleshooting (Masalah Umum)

Pesan "Message Blocked" / "Bounce" di Gmail Pengirim:

Penyebab: CloudMailin mencoba mengirim ke URL Ngrok yang sudah mati/kadaluarsa.

Solusi: Cek Terminal Ngrok, ambil URL baru, update di CloudMailin.

Error "404 Rejected" di CloudMailin:

Penyebab: URL di CloudMailin kurang lengkap.

Solusi: Tambahkan /api/webhook di akhir URL.

Data tidak muncul di Layar (Array Kosong):

Penyebab: Database Supabase terkunci (RLS aktif).

Solusi: Masuk ke Supabase > SQL Editor, jalankan: ALTER TABLE emails DISABLE ROW LEVEL SECURITY;.

Project created by Febri Osht / Fennec Admin