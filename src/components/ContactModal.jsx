'use client';

import React, { useState, useRef, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import {
  Lock, X, User, Mail, MessageSquare, AlertTriangle,
  Send, Activity, CheckCircle, ShieldCheck, RefreshCw, ShieldX
} from 'lucide-react';
import { SystemAlert } from './UIUtils';

// ── EmailJS credentials — ganti dengan milik kamu
const EMAILJS_SERVICE_ID      = 'service_7qc1k5x';
const EMAILJS_TEMPLATE_ID     = 'template_e23n143';
const EMAILJS_OTP_TEMPLATE_ID = 'template_5m5fvgv'; // Ganti dengan template OTP yang sesuai
const EMAILJS_PUBLIC_KEY      = 'vfshSfEEAWuTCsyA2';

// ── Browser fingerprint sederhana (untuk logging, bukan block)
const getFingerprint = () => {
  if (typeof window === 'undefined') return 'ssr';
  return btoa([
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency || 0,
  ].join('|')).slice(0, 32);
};

const ContactModal = ({ t, onClose }) => {
  const [step, setStep] = useState('FORM'); // FORM | VERIFY | DONE | BLOCKED
  const [status, setStatus] = useState('IDLE');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [honeypot, setHoneypot] = useState(''); // hidden field — kalau diisi = bot
  const [alert, setAlert] = useState(null);
  const [blockedMsg, setBlockedMsg] = useState('');

  // OTP
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState(false);
  const [otpAttemptsLeft, setOtpAttemptsLeft] = useState(3);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);
  const cooldownRef = useRef(null);

  // Timing — deteksi form diisi terlalu cepat (bot)
  const formOpenTime = useRef(Date.now());

  useEffect(() => {
    formOpenTime.current = Date.now();
    return () => { if (cooldownRef.current) clearInterval(cooldownRef.current); };
  }, []);

  const showAlert = (type, title, message, duration = 4000) => {
    setAlert({ type, title, message });
    if (duration > 0) setTimeout(() => setAlert(null), duration);
  };

  const startCooldown = (seconds = 60) => {
    setResendCooldown(seconds);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(cooldownRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const validateEmailFormat = (email) => {
    return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      String(email).toLowerCase()
    );
  };

  // ── SUBMIT FORM → validasi server + kirim OTP
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Honeypot check (client side)
    if (honeypot.trim() !== '') return;

    // Timing check — kalau form diisi < 2 detik, curiga bot
    const elapsed = Date.now() - formOpenTime.current;
    if (elapsed < 2000) {
      showAlert('error', 'SUSPICIOUS ACTIVITY', 'Form submitted too quickly. Please wait and try again.');
      return;
    }

    // Format email check
    if (!validateEmailFormat(formData.email)) {
      showAlert('error', t.error_title, t.error_msg);
      return;
    }

    setStatus('SENDING');

    try {
      // ── Step 1: Validasi email ke server (rate limit + MX + disposable check)
      const validateRes = await fetch('/api/verify-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'validate-email',
          email: formData.email,
          name: formData.name,
          honeypot,
          fingerprint: getFingerprint(),
        }),
      });

      const validateData = await validateRes.json();

      if (validateRes.status === 429) {
        setStep('BLOCKED');
        setBlockedMsg(validateData.error || 'Too many requests. Please try again later.');
        setStatus('IDLE');
        return;
      }

      if (validateRes.status === 403) {
        // Honeypot triggered di server
        setStep('BLOCKED');
        setBlockedMsg('Suspicious activity detected. Access denied.');
        setStatus('IDLE');
        return;
      }

      if (!validateData.valid) {
        setStatus('IDLE');
        if (validateData.reason === 'disposable') {
          showAlert('error', 'EMAIL NOT ALLOWED',
            'Temporary/disposable email addresses are not allowed. Please use your real email.');
        } else if (validateData.reason === 'no-mx') {
          showAlert('error', 'INVALID EMAIL DOMAIN',
            `The domain "${formData.email.split('@')[1]}" does not appear to be a real email provider.`);
        } else {
          showAlert('error', 'INVALID EMAIL', validateData.message || 'Please use a valid email address.');
        }
        return;
      }

      // ── Step 2: Kirim OTP via EmailJS menggunakan OTP dari server
      await emailjs.send(
  EMAILJS_SERVICE_ID,
  EMAILJS_OTP_TEMPLATE_ID,  // ← template OTP
  {
    to_email: formData.email,  // ← email pengunjung
    to_name: formData.name,
    otp_code: validateData.otp,
    expiry_minutes: '5',
  },
  EMAILJS_PUBLIC_KEY
);

      setStep('VERIFY');
      setOtpAttemptsLeft(3);
      startCooldown(60);
      setStatus('IDLE');

    } catch (err) {
  console.error('Submit error message:', err?.message);
  console.error('Submit error stack:', err?.stack);
    console.error('Submit error RAW:', err);
  console.error('Submit error TYPE:', typeof err);
  console.error('Submit error JSON:', JSON.stringify(err));
  setStatus('IDLE');
  showAlert('error', 'CONNECTION ERROR',
    `Error: ${err?.message || 'Unknown'}`);
}
  };

  // ── OTP input handlers
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpCode];
    newOtp[index] = value.slice(-1);
    setOtpCode(newOtp);
    setOtpError(false);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtpCode(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  // ── Verifikasi OTP → server check → kirim pesan asli
  const handleVerify = async () => {
    const entered = otpCode.join('');
    if (entered.length < 6) {
      setOtpError(true);
      showAlert('error', 'INCOMPLETE CODE', 'Please enter all 6 digits.', 3000);
      return;
    }

    setStatus('VERIFYING');

    try {
      // Verifikasi OTP ke server
      const verifyRes = await fetch('/api/verify-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify-otp',
          email: formData.email,
          otp: entered,
          honeypot,
          fingerprint: getFingerprint(),
        }),
      });

      const verifyData = await verifyRes.json();

      if (verifyRes.status === 429) {
        setStep('BLOCKED');
        setBlockedMsg(verifyData.error || 'Too many attempts.');
        setStatus('IDLE');
        return;
      }

      if (!verifyData.verified) {
        setOtpError(true);
        setOtpCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        const left = verifyData.attemptsLeft ?? (otpAttemptsLeft - 1);
        setOtpAttemptsLeft(left);
        setStatus('IDLE');

        if (left <= 0) {
          showAlert('error', 'LOCKED', 'Too many wrong attempts. Request a new code.', 5000);
        } else {
          showAlert('error', 'WRONG CODE', `Invalid OTP. ${left} attempt(s) remaining.`, 4000);
        }
        return;
      }

      // OTP verified → kirim pesan asli
      const emailjs = (await import('@emailjs/browser')).default;
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: formData.name,
          from_email: formData.email,
          message: formData.message,
          to_email: 'functionoverride000@gmail.com',
        },
        EMAILJS_PUBLIC_KEY
      );

      setStep('DONE');
      setStatus('SENT');

    } catch (err) {
      console.error('Verify error:', err);
      setStatus('IDLE');
      showAlert('error', 'ERROR', 'Verification failed. Please try again.', 4000);
    }
  };

  // ── Resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setOtpCode(['', '', '', '', '', '']);
    setOtpError(false);

    try {
      const validateRes = await fetch('/api/verify-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'validate-email',
          email: formData.email,
          name: formData.name,
          honeypot: '',
          fingerprint: getFingerprint(),
        }),
      });

      if (validateRes.status === 429) {
        const data = await validateRes.json();
        setStep('BLOCKED');
        setBlockedMsg(data.error);
        return;
      }

      const data = await validateRes.json();
      if (!data.valid) {
        showAlert('error', 'RESEND FAILED', 'Could not generate new code.', 4000);
        return;
      }

      const emailjs = (await import('@emailjs/browser')).default;
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_OTP_TEMPLATE_ID,
        {
          to_email: formData.email,
          to_name: formData.name,
          otp_code: data.otp,
          expiry_minutes: '5',
        },
        EMAILJS_PUBLIC_KEY
      );

      setOtpAttemptsLeft(3);
      startCooldown(60);
      showAlert('success', 'NEW CODE SENT', `A new verification code was sent to ${formData.email}`, 4000);

    } catch {
      showAlert('error', 'RESEND FAILED', 'Could not resend code. Please try again.', 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {alert && (
        <SystemAlert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="animate-modal relative bg-[#0a0f1e] border border-cyan-500/30 w-full max-w-lg rounded-xl shadow-[0_0_50px_rgba(0,243,255,0.1)] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-black/40">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded border ${step === 'BLOCKED' ? 'bg-red-900/20 border-red-500/30' : 'bg-cyan-900/20 border-cyan-500/30'}`}>
              {step === 'BLOCKED'
                ? <ShieldX className="w-5 h-5 text-red-400" />
                : step === 'VERIFY'
                ? <ShieldCheck className="w-5 h-5 text-cyan-400" />
                : <Lock className="w-5 h-5 text-cyan-400" />
              }
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-mono">
                {step === 'VERIFY' ? 'EMAIL VERIFICATION'
                  : step === 'BLOCKED' ? 'ACCESS BLOCKED'
                  : step === 'DONE' ? 'TRANSMISSION COMPLETE'
                  : t.title}
              </h3>
              <p className={`text-xs font-mono flex items-center ${step === 'BLOCKED' ? 'text-red-500' : 'text-green-500'}`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${step === 'BLOCKED' ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`} />
                {step === 'VERIFY' ? 'OTP SENT TO YOUR EMAIL'
                  : step === 'BLOCKED' ? 'SECURITY VIOLATION'
                  : step === 'DONE' ? 'MESSAGE DELIVERED'
                  : t.subtitle}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="interactive p-2 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* ===== STEP: FORM ===== */}
        {step === 'FORM' && (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Honeypot — HIDDEN dari manusia, bot akan mengisinya */}
            <div style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-cyan-500 font-mono block">{t.name_label}</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <input type="text" required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#050a15] border border-gray-800 rounded p-2 pl-10 text-gray-300 font-mono text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
                    placeholder="Guest_User_01"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-cyan-500 font-mono block">{t.email_label}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <input type="email" required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#050a15] border border-gray-800 rounded p-2 pl-10 text-gray-300 font-mono text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
                    placeholder="user@real-domain.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-cyan-500 font-mono block">{t.msg_label}</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <textarea required rows="4"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#050a15] border border-gray-800 rounded p-2 pl-10 text-gray-300 font-mono text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none"
                    placeholder="Enter payload data..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-cyan-900/10 border border-cyan-900/30 p-3 rounded flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-cyan-300/70 font-mono leading-tight">
                {t.secure_note} A 6-digit verification code will be sent to your email to confirm identity.
              </p>
            </div>

            <button type="submit" disabled={status === 'SENDING'}
              className="interactive w-full py-3 font-bold font-mono rounded transition-all flex items-center justify-center bg-cyan-500 hover:bg-cyan-400 text-black disabled:bg-cyan-700 disabled:cursor-not-allowed"
            >
              {status === 'SENDING'
                ? <><Activity className="mr-2 w-4 h-4 animate-spin" /> VALIDATING & SENDING CODE...</>
                : <>{t.btn_send} <Send className="ml-2 w-4 h-4" /></>
              }
            </button>
          </form>
        )}

        {/* ===== STEP: OTP VERIFY ===== */}
        {step === 'VERIFY' && (
          <div className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-cyan-900/20 border border-cyan-500/30 mb-2">
                <ShieldCheck className="w-7 h-7 text-cyan-400" />
              </div>
              <p className="text-gray-400 font-mono text-sm">Verification code sent to:</p>
              <p className="text-cyan-400 font-mono text-sm font-bold">{formData.email}</p>
              <p className="text-gray-600 font-mono text-xs">Code expires in 5 minutes · {otpAttemptsLeft} attempt(s) remaining</p>
            </div>

            {/* OTP boxes */}
            <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
              {otpCode.map((digit, i) => (
                <input key={i}
                  ref={el => inputRefs.current[i] = el}
                  type="text" inputMode="numeric" maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className={`w-11 h-14 text-center text-xl font-bold font-mono rounded border bg-[#050a15] text-white transition-all focus:outline-none
                    ${otpError
                      ? 'border-red-500 text-red-400 focus:ring-1 focus:ring-red-500/50'
                      : digit
                      ? 'border-cyan-500 text-cyan-400 focus:ring-1 focus:ring-cyan-500/50'
                      : 'border-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50'
                    }`}
                />
              ))}
            </div>

            {otpError && (
              <p className="text-center text-red-400 font-mono text-xs animate-pulse">
                ⚠ Wrong code. {otpAttemptsLeft} attempt(s) left.
              </p>
            )}

            <button onClick={handleVerify}
              disabled={status === 'VERIFYING' || otpAttemptsLeft <= 0}
              className="interactive w-full py-3 font-bold font-mono rounded transition-all flex items-center justify-center bg-cyan-500 hover:bg-cyan-400 text-black disabled:bg-cyan-800 disabled:cursor-not-allowed"
            >
              {status === 'VERIFYING'
                ? <><Activity className="mr-2 w-4 h-4 animate-spin" /> VERIFYING & TRANSMITTING...</>
                : <><ShieldCheck className="mr-2 w-4 h-4" /> VERIFY & SEND MESSAGE</>
              }
            </button>

            <div className="text-center space-y-2">
              <button onClick={handleResend} disabled={resendCooldown > 0}
                className="text-xs font-mono text-gray-500 hover:text-cyan-400 transition-colors flex items-center gap-1.5 mx-auto disabled:cursor-not-allowed disabled:text-gray-700"
              >
                <RefreshCw className="w-3 h-3" />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
              </button>
              <button
                onClick={() => { setStep('FORM'); setOtpCode(['','','','','','']); setOtpError(false); }}
                className="block w-full text-xs font-mono text-gray-600 hover:text-gray-400 transition-colors"
              >
                ← Change email address
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP: DONE ===== */}
        {step === 'DONE' && (
          <div className="p-8 flex flex-col items-center justify-center space-y-4 min-h-[260px]">
            <div className="w-16 h-16 rounded-full bg-green-900/20 border border-green-500/30 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-green-400 font-mono font-bold text-lg">TRANSMISSION COMPLETE</p>
              <p className="text-gray-500 font-mono text-xs">Message delivered. Closing terminal...</p>
            </div>
            <div className="flex gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-1 bg-green-500 rounded-full animate-pulse"
                  style={{ width: `${[30,15,45,15,30][i]}px`, animationDelay: `${i * 0.1}s`, opacity: 0.6 }} />
              ))}
            </div>
          </div>
        )}

        {/* ===== STEP: BLOCKED ===== */}
        {step === 'BLOCKED' && (
          <div className="p-8 flex flex-col items-center justify-center space-y-4 min-h-[260px]">
            <div className="w-16 h-16 rounded-full bg-red-900/20 border border-red-500/30 flex items-center justify-center">
              <ShieldX className="w-8 h-8 text-red-400" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-red-400 font-mono font-bold text-lg">ACCESS BLOCKED</p>
              <p className="text-gray-500 font-mono text-xs max-w-xs mx-auto leading-relaxed">{blockedMsg}</p>
            </div>
            <button onClick={onClose}
              className="mt-2 px-6 py-2 border border-red-500/30 text-red-400 font-mono text-xs rounded hover:bg-red-900/20 transition-colors"
            >
              CLOSE TERMINAL
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ContactModal;