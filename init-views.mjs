// init-views.mjs
// Jalankan sekali: node init-views.mjs
// Fungsi: tambah field views:0 ke semua dokumen di collection 'posts'
//         yang belum punya field views

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

// ── Ganti dengan config Firebase kamu ──
const firebaseConfig = {
  apiKey:            "NEXT_PUBLIC_FIREBASE_API_KEY",
  authDomain:        "fosht-blog.firebaseapp.com",
  projectId:         "fosht-blog",
  storageBucket:     "fosht-blog.appspot.com",
  messagingSenderId: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  appId:             "NEXT_PUBLIC_FIREBASE_APP_ID",
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

async function initViews() {
  console.log('🔍 Fetching all posts...');
  const snap = await getDocs(collection(db, 'posts'));

  console.log(`📄 Found ${snap.docs.length} documents\n`);

  let updated = 0;
  let skipped = 0;

  for (const d of snap.docs) {
    const data = d.data();

    if (data.views !== undefined) {
      console.log(`⏭  skip  — "${data.title?.slice(0, 40)}" (views: ${data.views})`);
      skipped++;
      continue;
    }

    await updateDoc(doc(db, 'posts', d.id), { views: 0 });
    console.log(`✅ added  — "${data.title?.slice(0, 40)}"`);
    updated++;
  }

  console.log(`\n✔ Done! ${updated} updated, ${skipped} skipped.`);
  process.exit(0);
}

initViews().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
