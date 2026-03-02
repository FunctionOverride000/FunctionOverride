/**
 * FOSHTMAIL SERVER (SECURE ENCRYPTED VERSION)
 * File: backend/server.js
 */

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');
const CryptoJS = require('crypto-js'); // Library Enkripsi (Wajib install: npm install crypto-js)

const app = express();
const port = 3001;

// --- KUNCI RAHASIA ---
// PENTING: Harus SAMA PERSIS dengan SECRET_KEY di Frontend (App.tsx)
const SECRET_KEY = "FENNEC_SUPER_SECRET_KEY_2025"; 

// --- CONFIG SUPABASE ---
const supabaseUrl = 'https://kigqvlhyyogthrwiyxat.supabase.co';
const supabaseKey = 'sb_publishable_xASSSczxWwHJX8z3PjNHAA_JSbmYoIo';
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
const upload = multer();

// Fungsi Enkripsi: Mengubah teks biasa menjadi kode acak
const encryptData = (text) => {
  if (!text) return "";
  // Enkripsi data menggunakan AES
  return CryptoJS.AES.encrypt(text.toString(), SECRET_KEY).toString();
};

app.get('/', (req, res) => {
  res.send('Server Fennec (Encrypted Mode) Siap!');
});

// --- 1. TERIMA EMAIL (ENKRIPSI SEBELUM SIMPAN) ---
app.post('/api/webhook', upload.any(), async (req, res) => {
  try {
    console.log("📨 PING! Email masuk...");
    const body = req.body;
    
    let sender = 'Unknown';
    let subject = '(No Subject)';
    let text = '';
    let html = '';

    // Deteksi Format (CloudMailin atau Lainnya)
    if (body.headers && body.headers.from) {
        sender = body.headers.from;
        subject = body.headers.subject || '(No Subject)';
        text = body.plain || '';
        html = body.html || '';
    } else if (body.sender) {
        sender = body.sender;
        subject = body.subject;
        text = body['body-plain'];
        html = body['body-html'];
    }

    console.log(`🔒 Mengenkripsi pesan dari: ${sender}`);

    // SIMPAN KE DATABASE (DATA DIENKRIPSI DULU)
    const { error } = await supabase
      .from('emails')
      .insert([{ 
          sender_name: sender, // Metadata pengirim biarkan terbuka agar mudah dicari
          sender_email: sender, 
          // BAGIAN INI YANG DIENKRIPSI
          subject: encryptData(subject), 
          body_text: encryptData(text), 
          body_html: encryptData(html),
          is_read: false
      }]);

    if (error) throw error;

    console.log(`✅ Pesan Terenkripsi & Disimpan.`);
    res.status(200).send('OK');

  } catch (err) {
    console.error("❌ Error Webhook:", err.message);
    res.status(500).send('Error');
  }
});

// --- 2. AMBIL LIST EMAIL ---
app.get('/api/emails', async (req, res) => {
  const { data, error } = await supabase
    .from('emails')
    .select('*')
    .order('received_at', { ascending: false });
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// --- 3. HAPUS EMAIL ---
app.delete('/api/emails/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('emails').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 4. TANDAI SUDAH DIBACA ---
app.put('/api/emails/:id/read', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('emails').update({ is_read: true }).eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Error Handler 404
app.use((req, res) => {
  res.status(404).send('Alamat salah. Gunakan /api/webhook.');
});

app.listen(port, () => {
  console.log(`🚀 Server Secure Backend berjalan di http://localhost:${port}`);
});