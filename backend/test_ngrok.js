/**
 * File: backend/test_ngrok.js
 * Fungsi: Pura-pura menjadi Mailgun untuk ngetes Ngrok
 */

const axios = require('axios');

// --- URL NGROK KAMU (DARI LOG ERROR TADI) ---
// Perhatikan: Saya mengubah ujungnya dari '/api/webhook/incoming' menjadi '/api/webhook'
// agar sesuai dengan kode di server.js (Bagian 4)
const TARGET_URL = 'https://gracia-unregretting-remotely.ngrok-free.dev/api/webhook'; 

async function kirimPaket() {
    console.log(`🚀 Mengirim paket ke: ${TARGET_URL}`);
    
    try {
        const response = await axios.post(TARGET_URL, {
            // Ini format data pura-pura dari Mailgun
            sender: "Steve Jobs <steve@apple.com>",
            subject: "Tes Koneksi Internet Fennec",
            "body-plain": "Halo! Kalau pesan ini masuk, berarti Ngrok kamu sukses besar.",
            "body-html": "<h1>Halo!</h1><p>Kalau pesan ini masuk, berarti <b>Ngrok</b> kamu sukses besar.</p>"
        });

        console.log(`✅ SUKSES! Server merespon: ${response.status} ${response.statusText}`);
        console.log("Cek Frontend React kamu sekarang, pesan dari Steve Jobs harusnya muncul.");
        
    } catch (error) {
        console.error("❌ GAGAL KIRIM:", error.message);
        if (error.response) {
            console.error("Server menjawab:", error.response.status, error.response.data);
        } else {
            console.error("Saran: Cek apakah URL Ngrok benar dan Terminal Ngrok masih nyala.");
        }
    }
}

kirimPaket();