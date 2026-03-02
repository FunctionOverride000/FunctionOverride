import { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Inbox, RefreshCw, Trash2, Menu, X, ChevronLeft, AlertTriangle, Terminal, Cpu, Shield, Activity, Power, Lock, Globe, Search, AlertOctagon } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
// import CryptoJS from 'crypto-js'; // [LANGKAH 1] HAPUS tanda '//' di depan baris ini di VS Code Anda!

// --- KUNCI RAHASIA (HARUS SAMA DENGAN BACKEND) ---
const SECRET_KEY = "FENNEC_SUPER_SECRET_KEY_2025";

// --- STYLING MODERN CYBER-TECH (CSS IN JS) ---
const cyberStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
  
  body {
    background-color: #030712;
    color: #e2e8f0;
    font-family: 'Rajdhani', sans-serif;
    overflow: hidden;
  }

  .font-mono {
    font-family: 'JetBrains Mono', monospace;
  }

  /* Scrollbar Kustom */
  ::-webkit-scrollbar { width: 6px; background: #0f172a; }
  ::-webkit-scrollbar-thumb { background: #0891b2; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #22d3ee; }

  /* Efek Grid & Scanline */
  .cyber-grid {
    background-size: 40px 40px;
    background-image: linear-gradient(to right, rgba(6, 182, 212, 0.05) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(6, 182, 212, 0.05) 1px, transparent 1px);
    position: absolute; inset: 0; z-index: 0;
  }
  .scanline {
    width: 100%; height: 100px; z-index: 10;
    background: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(34, 211, 238, 0.05) 50%, rgba(0,0,0,0) 100%);
    opacity: 0.4; position: absolute; bottom: 100%;
    animation: scanline 8s linear infinite; pointer-events: none;
  }
  @keyframes scanline { 0% { bottom: 100%; } 100% { bottom: -100px; } }

  /* Glassmorphism Panel */
  .glass-panel {
    background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px);
    border: 1px solid rgba(34, 211, 238, 0.2);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
  }
  .glass-panel:hover {
    border-color: rgba(34, 211, 238, 0.5);
    box-shadow: 0 0 15px rgba(6, 182, 212, 0.2);
  }

  .neon-text { text-shadow: 0 0 5px rgba(34, 211, 238, 0.6); }
  .neon-text-red { text-shadow: 0 0 5px rgba(239, 68, 68, 0.6); }
  .active-item {
    background: linear-gradient(90deg, rgba(6, 182, 212, 0.1) 0%, transparent 100%);
    border-left: 3px solid #22d3ee;
  }

  /* Modal Animation */
  @keyframes modalPop { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
  .modal-content { animation: modalPop 0.2s ease-out forwards; }
`;

interface Email {
  id: number;
  sender_name: string;
  sender_email: string;
  subject: string;
  body_text: string;
  body_html: string;
  received_at: string;
  is_read: boolean;
}

function App() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [systemLog, setSystemLog] = useState<string>("SYSTEM READY");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // --- FUNGSI DEKRIPSI (SAFE MODE) ---
  const decryptData = (ciphertext: string) => {
    // [LANGKAH 2] Di VS Code, HAPUS tanda komentar '/*' dan '*/' di bawah ini
    // agar fitur dekripsi berjalan!
    
    /*
    try {
      if (!ciphertext) return "";
      const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
      const originalText = bytes.toString(CryptoJS.enc.Utf8);
      // Jika hasil dekripsi valid, kembalikan teks asli. Jika tidak, kembalikan ciphertext.
      return originalText || ciphertext; 
    } catch (e) {
      return ciphertext; 
    }
    */
    
    // Fallback sementara agar tidak error di preview ini
    return ciphertext; 
  };

  // --- LOGIKA HAPUS OTOMATIS 90 HARI ---
  const cleanupOldEmails = async (emailList: Email[]) => {
    const ninetyDaysAgo = 90;
    let deletedCount = 0;
    for (const email of emailList) {
      if (!email.received_at) continue;
      const emailDate = new Date(email.received_at);
      if (isNaN(emailDate.getTime())) continue;
      const daysDiff = differenceInDays(new Date(), emailDate);
      if (daysDiff > ninetyDaysAgo) {
        try {
          await axios.delete(`http://localhost:3001/api/emails/${email.id}`);
          deletedCount++;
        } catch (err) { console.error(`Failed auto-delete ID ${email.id}`); }
      }
    }
    if (deletedCount > 0) {
      setSystemLog(`PURGE PROTOCOL: ${deletedCount} files removed.`);
      fetchEmails(false); 
    }
  };

  // --- AMBIL DATA DARI BACKEND ---
  const fetchEmails = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setErrorMsg(""); 
    try {
      const response = await axios.get('http://localhost:3001/api/emails');
      const rawData = response.data;
      
      const decryptedData = rawData.map((email: Email) => ({
        ...email,
        subject: decryptData(email.subject),
        body_text: decryptData(email.body_text),
        body_html: decryptData(email.body_html)
      }));

      setEmails(decryptedData);
      if (showLoading) setSystemLog(`SYNC COMPLETE: ${decryptedData.length} PACKETS DECRYPTED`);
      
      if (decryptedData.length > 0) {
         cleanupOldEmails(decryptedData); 
      }
      
    } catch (error: any) {
      if (error.code === "ERR_NETWORK") {
        if (showLoading) setErrorMsg("CONNECTION LOST: PORT 3001");
      } else {
        if (showLoading) setErrorMsg("DATA CORRUPTION DETECTED");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- MODAL DELETE ---
  const promptDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); setDeleteId(id);
  };

  const executeDelete = async () => {
    if (deleteId === null) return;
    try {
      setSystemLog(`INITIATING DELETE ID_${deleteId}...`);
      await axios.delete(`http://localhost:3001/api/emails/${deleteId}`);
      setEmails(emails.filter(email => email.id !== deleteId));
      if (selectedEmail?.id === deleteId) setSelectedEmail(null);
      setSystemLog(`FILE ID_${deleteId} ERASED.`);
    } catch (err) { setSystemLog("ERROR: DELETE DENIED"); } 
    finally { setDeleteId(null); }
  };

  const handleOpenEmail = async (email: Email) => {
    setSelectedEmail(email); setSidebarOpen(false); 
    setSystemLog(`DECRYPTING: ${email.subject.substring(0, 15)}...`);
    if (!email.is_read) {
      try {
        await axios.put(`http://localhost:3001/api/emails/${email.id}/read`);
        const updatedEmails = emails.map(e => e.id === email.id ? { ...e, is_read: true } : e);
        setEmails(updatedEmails); setSelectedEmail({ ...email, is_read: true });
      } catch (err) { console.error("Status update failed"); }
    }
  };

  useEffect(() => {
    fetchEmails(true); 
    const intervalId = setInterval(() => { fetchEmails(false); }, 15000); 
    return () => clearInterval(intervalId);
  }, []);

  const filteredEmails = emails.filter(email => {
    const term = searchTerm.toLowerCase();
    return (
      (email.sender_name?.toLowerCase().includes(term)) ||
      (email.sender_email?.toLowerCase().includes(term)) ||
      (email.subject?.toLowerCase().includes(term))
    );
  });

  return (
    <>
      <style>{cyberStyles}</style>
      <div className="flex h-screen bg-[#030712] text-slate-200 relative overflow-hidden">
        
        {/* Background */}
        <div className="cyber-grid pointer-events-none"></div>
        <div className="scanline"></div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <img src="/fennec.png" alt="Fennec.com" className="w-[700px] h-[700px] object-contain opacity-5 grayscale mix-blend-overlay" />
        </div>

        {/* Sidebar */}
        <aside className={`glass-panel fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col border-r-0 md:border-r border-cyan-900/30`}>
          <div className="p-6 relative bg-gradient-to-r from-cyan-950/30 to-transparent">
            <div className="absolute top-2 right-2 text-[10px] text-cyan-500 font-mono">SYS.V.4.5</div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg border border-cyan-500/50 p-0.5 overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                 <img src="/fennec_logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="font-bold text-2xl tracking-wider text-white neon-text">FENNEC</h1>
                <div className="text-[10px] text-cyan-400 flex items-center font-mono tracking-widest">
                   <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse mr-2 shadow-[0_0_5px_#22d3ee]"></span>
                   SECURE_LINK
                </div>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden absolute right-4 top-8 text-cyan-400"><X size={24} /></button>
          </div>

          <div className="p-4 flex-1 flex flex-col gap-4">
            <div className="p-3 rounded bg-black/40 border border-cyan-900/30 font-mono text-xs text-cyan-300">
               <div className="flex justify-between mb-1"><span className="text-slate-500">STATUS</span><span className="text-emerald-400">OPERATIONAL</span></div>
               <div className="flex justify-between mb-1"><span className="text-slate-500">ENCRYPTION</span><span className="text-purple-400">AES-256</span></div>
               <div className="mt-2 pt-2 border-t border-cyan-900/30 text-slate-400 truncate">{'>'} {systemLog}</div>
            </div>
            <button onClick={() => fetchEmails(true)} className="group relative w-full flex items-center justify-center space-x-2 bg-cyan-950/30 hover:bg-cyan-900/50 border border-cyan-800/50 hover:border-cyan-500 text-cyan-300 py-3 font-semibold transition-all overflow-hidden rounded-sm">
              <div className="absolute inset-0 w-0 bg-cyan-500/10 transition-all duration-[250ms] ease-out group-hover:w-full"></div>
              <RefreshCw size={18} className={`relative ${loading ? "animate-spin" : ""}`} />
              <span className="relative tracking-widest text-sm">{loading ? "SYNCING..." : "SYNC DATA"}</span>
            </button>
            <nav className="space-y-1">
              <div className="active-item flex items-center justify-between px-4 py-3 text-cyan-100 cursor-pointer transition-all">
                <div className="flex items-center space-x-3"><Inbox size={18} className="text-cyan-400" /><span className="tracking-wide text-sm font-semibold">MAIN_FEED</span></div>
                <span className="text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded">{emails.length}</span>
              </div>
            </nav>
          </div>
          <div className="p-4 border-t border-cyan-900/30 text-[10px] text-slate-600 text-center font-mono">ID: FENNEC-ADMIN // TERMINAL_01</div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <div className="flex-1 flex flex-col min-w-0 relative z-10 bg-black/20">
          <header className="h-16 border-b border-cyan-900/30 flex items-center justify-between px-6 glass-panel border-l-0 border-r-0 border-t-0">
              <div className="flex items-center flex-1 mr-4">
                <button onClick={() => setSidebarOpen(true)} className="md:hidden mr-4 text-cyan-400"><Menu size={24} /></button>
                <div className="relative w-full max-w-md hidden md:block group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search size={16} className="text-cyan-600 group-focus-within:text-cyan-400 transition-colors"/></div>
                  <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="FILTER_STREAM..." className="block w-full pl-10 pr-3 py-1.5 border border-cyan-900/50 rounded-sm leading-5 bg-black/50 text-cyan-100 placeholder-cyan-900 focus:outline-none focus:bg-cyan-950/20 focus:border-cyan-500 font-mono transition-all"/>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                 <div className="hidden md:flex items-center space-x-2 text-[10px] font-mono text-slate-400 border border-slate-700 rounded px-2 py-1"><Activity size={12} className="text-emerald-500" /><span>AUTO_PURGE: 90 DAYS</span></div>
                 <Power size={20} className="text-red-500/70 hover:text-red-500 cursor-pointer transition-colors"/>
              </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
            {/* List Email */}
            <div className={`${selectedEmail ? 'hidden md:block md:w-2/5 lg:w-1/3' : 'w-full'} border-r border-cyan-900/30 overflow-y-auto relative`}>
              {errorMsg && <div className="m-4 p-4 border border-red-500/50 bg-red-900/10 text-red-400 flex items-start space-x-3 rounded"><AlertTriangle size={20} /><div className="font-mono text-xs"><h3 className="font-bold">SYSTEM ERROR</h3><p>{errorMsg}</p></div></div>}
              {emails.length === 0 && !errorMsg ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 p-8 text-center"><Terminal size={64} className="mb-4 opacity-30" /><p className="tracking-widest font-mono text-sm">NO SIGNAL DETECTED</p></div>
              ) : (
                <ul className="divide-y divide-cyan-900/20">
                  {filteredEmails.length === 0 && searchTerm ? (
                     <li className="flex flex-col items-center justify-center h-48 text-slate-600 text-center"><Search size={32} className="mb-2 opacity-50" /><p className="font-mono text-xs tracking-wider text-cyan-900">SEARCH_QUERY: NOT_FOUND</p></li>
                  ) : (
                    filteredEmails.map((email) => (
                      <li key={email.id} onClick={() => handleOpenEmail(email)} className={`group cursor-pointer p-4 transition-all relative ${selectedEmail?.id === email.id ? 'bg-cyan-900/20 border-l-2 border-cyan-400' : 'hover:bg-white/5 border-l-2 border-transparent'}`}>
                        <div className="flex justify-between items-baseline mb-1">
                          <span className={`truncate text-sm ${!email.is_read ? 'text-white font-bold neon-text' : 'text-slate-400'}`}>{email.sender_name || email.sender_email}</span>
                          <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap ml-2">{email.received_at ? format(new Date(email.received_at), 'MMM dd HH:mm') : ''}</span>
                        </div>
                        <div className="flex items-center mt-0.5">
                          {!email.is_read && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-2 shadow-[0_0_5px_#22d3ee]"></div>}
                          <h3 className={`text-xs truncate pr-6 ${!email.is_read ? 'text-cyan-100 font-semibold' : 'text-slate-500'}`}>{email.subject}</h3>
                        </div>
                        <button onClick={(e) => promptDelete(email.id, e)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all opacity-0 group-hover:opacity-100" title="DELETE"><Trash2 size={16} /></button>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>

            {/* Detail Email */}
            <div className={`${selectedEmail ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-[#050a15]/80 backdrop-blur-sm relative`}>
              {!selectedEmail ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-700"><Lock size={80} className="mb-6 opacity-20" /><p className="text-lg tracking-widest font-mono text-slate-500">SECURE TERMINAL</p></div>
              ) : (
                <div className="flex flex-col h-full">
                  <div className="md:hidden p-3 border-b border-cyan-900/30 flex items-center text-cyan-400 bg-black/40"><button onClick={() => setSelectedEmail(null)} className="p-2 mr-2 hover:bg-white/5 rounded"><ChevronLeft size={20} /></button><span className="font-bold text-sm">BACK</span></div>
                  <div className="p-8 border-b border-cyan-900/30 bg-gradient-to-b from-cyan-950/10 to-transparent relative">
                    <div className="absolute top-4 right-6 text-right"><div className="text-[10px] text-slate-500 font-mono">PKT_ID: #{selectedEmail.id}</div></div>
                    <h1 className="text-2xl font-bold text-white mb-4 neon-text leading-tight w-5/6">{selectedEmail.subject}</h1>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded bg-gradient-to-br from-cyan-900 to-purple-900 border border-cyan-700/50 flex items-center justify-center text-white font-bold text-xl shadow-lg">{(selectedEmail.sender_name || "U").charAt(0).toUpperCase()}</div>
                      <div><div className="text-cyan-300 font-semibold text-sm">{selectedEmail.sender_name}</div><div className="text-slate-500 text-xs font-mono">&lt;{selectedEmail.sender_email}&gt;</div></div>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 font-sans text-slate-300 text-sm leading-relaxed">
                     <div className="border-l-2 border-purple-500/30 pl-4 py-2 mb-6 bg-purple-500/5 rounded-r text-xs text-purple-300 font-mono">--- BEGIN DECRYPTED MESSAGE ---</div>
                     <div dangerouslySetInnerHTML={{ __html: selectedEmail.body_html || selectedEmail.body_text }} className="break-words email-content"/>
                     <div className="mt-12 pt-4 border-t border-cyan-900/30 flex justify-between items-center">
                        <span className="text-[10px] text-slate-600 font-mono">END OF STREAM</span>
                        <button onClick={(e) => promptDelete(selectedEmail.id, e)} className="flex items-center space-x-2 px-4 py-2 border border-red-900/50 text-red-400 hover:bg-red-950/30 hover:text-red-300 rounded text-xs transition-colors"><Trash2 size={14} /><span>DELETE PACKET</span></button>
                     </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Konfirmasi */}
        {deleteId !== null && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="modal-content glass-panel border border-red-500/40 p-6 max-w-sm w-full shadow-[0_0_50px_rgba(220,38,38,0.2)]">
              <div className="flex flex-col items-center text-center">
                <AlertOctagon size={48} className="text-red-500 mb-4 animate-pulse" />
                <h3 className="text-xl font-bold text-white neon-text-red mb-2 tracking-widest">WARNING</h3>
                <p className="text-slate-400 text-sm mb-6 font-mono">Permanently erase ID_{deleteId}?<br/><span className="text-red-400">Irreversible action.</span></p>
                <div className="flex space-x-3 w-full">
                  <button onClick={() => setDeleteId(null)} className="flex-1 py-2 border border-slate-600 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors text-xs tracking-wider">CANCEL</button>
                  <button onClick={executeDelete} className="flex-1 py-2 bg-red-600/20 border border-red-500 text-red-400 hover:bg-red-600/40 hover:text-white transition-all text-xs font-bold tracking-wider">CONFIRM</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;