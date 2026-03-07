'use client';

import React, { useState } from 'react';
import { Lock, X, User, Mail, MessageSquare, AlertTriangle, Send, Activity, CheckCircle } from 'lucide-react';
import { SystemAlert } from './UIUtils'; // Import Alert dari UIUtils

const ContactModal = ({ t, onClose }) => {
  const [status, setStatus] = useState('IDLE');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [alert, setAlert] = useState(null);

  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateEmail(formData.email)) {
      setAlert({
        type: 'error',
        title: t.error_title,
        message: t.error_msg
      });
      setTimeout(() => setAlert(null), 4000);
      return;
    }

    setStatus('SENDING');
    
    setTimeout(() => {
      setStatus('SENT');
      window.location.href = `mailto:functionoverride000@gmail.com?subject=SECURE MSG from ${formData.name}&body=${encodeURIComponent(formData.message)}%0D%0A%0D%0A---%0D%0ASent from FOSHT.SYS Secure Terminal%0D%0AUser ID: ${formData.email}`;

      setAlert({
        type: 'success',
        title: "TRANSMISSION SUCCESS",
        message: t.success_msg
      });

      setTimeout(onClose, 3000);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      {alert && (
        <SystemAlert 
          type={alert.type} 
          title={alert.title} 
          message={alert.message} 
          onClose={() => setAlert(null)} 
        />
      )}
      
      <div className="animate-modal relative bg-[#0a0f1e] border border-cyan-500/30 w-full max-w-lg rounded-xl shadow-[0_0_50px_rgba(0,243,255,0.1)] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-black/40">
           <div className="flex items-center space-x-3">
             <div className="p-2 bg-cyan-900/20 rounded border border-cyan-500/30">
                 <Lock className="w-5 h-5 text-cyan-400" />
             </div>
             <div>
               <h3 className="text-xl font-bold text-white font-mono">{t.title}</h3>
               <p className="text-xs text-green-500 font-mono flex items-center">
                 <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                 {t.subtitle}
               </p>
             </div>
           </div>
           <button 
             onClick={onClose}
             className="interactive p-2 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
           >
             <X className="w-6 h-6" />
           </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
           <div className="space-y-4">
             <div className="space-y-2">
               <label className="text-xs text-cyan-500 font-mono block">{t.name_label}</label>
               <div className="relative">
                 <User className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                 <input 
                   type="text" 
                   required
                   value={formData.name}
                   onChange={(e) => setFormData({...formData, name: e.target.value})}
                   className="w-full bg-[#050a15] border border-gray-800 rounded p-2 pl-10 text-gray-300 font-mono text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
                   placeholder="Guest_User_01"
                 />
               </div>
             </div>
             
             <div className="space-y-2">
               <label className="text-xs text-cyan-500 font-mono block">{t.email_label}</label>
               <div className="relative">
                 <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                 <input 
                   type="email" 
                   required
                   value={formData.email}
                   onChange={(e) => setFormData({...formData, email: e.target.value})}
                   className="w-full bg-[#050a15] border border-gray-800 rounded p-2 pl-10 text-gray-300 font-mono text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
                   placeholder="user@real-domain.com"
                 />
               </div>
             </div>
             
             <div className="space-y-2">
               <label className="text-xs text-cyan-500 font-mono block">{t.msg_label}</label>
               <div className="relative">
                 <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                 <textarea 
                   required
                   rows="4"
                   value={formData.message}
                   onChange={(e) => setFormData({...formData, message: e.target.value})}
                   className="w-full bg-[#050a15] border border-gray-800 rounded p-2 pl-10 text-gray-300 font-mono text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none"
                   placeholder="Enter payload data..."
                 ></textarea>
               </div>
             </div>
           </div>

           <div className="bg-cyan-900/10 border border-cyan-900/30 p-3 rounded flex items-start space-x-2">
             <AlertTriangle className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
             <p className="text-[10px] text-cyan-300/70 font-mono leading-tight">
               {t.secure_note}
             </p>
           </div>

           <button 
             type="submit"
             disabled={status !== 'IDLE'}
             className={`interactive w-full py-3 font-bold font-mono rounded transition-all flex items-center justify-center ${
               status === 'SENT' 
                 ? 'bg-green-500 text-black' 
                 : 'bg-cyan-500 hover:bg-cyan-400 text-black'
             }`}
           >
             {status === 'IDLE' && (
               <>
                 {t.btn_send} <Send className="ml-2 w-4 h-4" />
               </>
             )}
             {status === 'SENDING' && (
               <>
                 <Activity className="mr-2 w-4 h-4 animate-spin" /> {t.btn_sending}
               </>
             )}
             {status === 'SENT' && (
               <>
                 <CheckCircle className="mr-2 w-4 h-4" /> {t.btn_sent}
               </>
             )}
           </button>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;