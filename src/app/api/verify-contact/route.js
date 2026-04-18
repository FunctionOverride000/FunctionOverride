// src/app/api/verify-contact/route.js
// Server-side security: rate limiting + disposable email check

import { NextResponse } from 'next/server';

// ── In-memory cache (reset saat server restart)
// Di production pakai Upstash Redis untuk persistent cache
const rateLimitCache = new Map(); // key: IP, value: { count, firstRequest, blocked }
const otpCache = new Map();       // key: email, value: { otp, expiry, attempts }

const RATE_LIMIT = {
  MAX_REQUESTS: 3,
  WINDOW_MS: 15 * 60 * 1000,
  BLOCK_DURATION_MS: 60 * 60 * 1000,
};

// Daftar domain email disposable / temporary yang diblock
const BLOCKED_DOMAINS = new Set([
  'tempmail.com', 'throwaway.email', 'guerrillamail.com', 'guerrillamail.net',
  'guerrillamail.org', 'guerrillamail.biz', 'guerrillamail.de', 'guerrillamail.info',
  'grr.la', 'sharklasers.com', 'spam4.me', 'yopmail.com', 'yopmail.fr',
  'cool.fr.nf', 'jetable.fr.nf', 'nospam.ze.tc', 'nomail.xl.cx', 'mega.zik.dj',
  'speed.1s.fr', 'courriel.fr.nf', 'moncourrier.fr.nf', 'monemail.fr.nf',
  'monmail.fr.nf', 'mailnull.com', 'spamgourmet.com', 'trashmail.at',
  'trashmail.com', 'trashmail.io', 'trashmail.me', 'trashmail.net',
  'dispostable.com', 'mailnesia.com', 'mailnull.com', 'maildrop.cc',
  'mailinator.com', 'mailinator.net', 'mailinator.org', 'guerrillmail.com',
  'getairmail.com', 'fakeinbox.com', 'tempr.email', 'discard.email',
  'spamfree24.org', 'spamhereplease.com', 'spam.la', 'SendSpamHere.com',
  'spamgob.com', 'spaml.de', 'spamspot.com', 'spamthisplease.com',
  'mailmetrash.com', 'trashdevil.com', 'trashdevil.de', 'wegwerfmail.de',
  'wegwerfmail.net', 'wegwerfmail.org', '0-mail.com', '0815.ru', '0clickemail.com',
  '10minutemail.com', '10minutemail.net', '10minutemail.org', '10minutemail.co.za',
  '20minutemail.com', '33mail.com', 'anonbox.net', 'anonymmail.net',
  'binkmail.com', 'bobmail.info', 'chammy.info', 'deadaddress.com',
  'despam.it', 'discardmail.com', 'discardmail.de', 'disposableaddress.com',
  'disposableemailaddresses.com', 'dodgeit.com', 'dodgit.com', 'dumpmail.de',
  'dumpyemail.com', 'e4ward.com', 'emailias.com', 'emailsensei.com',
  'emailtemporanea.com', 'emailtemporanea.net', 'emailto.de', 'emailwarden.com',
  'filzmail.com', 'filzmail.de', 'frapmail.com', 'gishpuppy.com',
  'haltospam.com', 'humaility.com', 'ieatspam.eu', 'ieatspam.info',
  'ihateyoualot.info', 'iheartspam.org', 'inoutmail.de', 'inoutmail.eu',
  'inoutmail.info', 'inoutmail.net', 'internet-noise.com', 'jetable.com',
  'jetable.net', 'jetable.org', 'jnxjn.com', 'jourrapide.com',
  'kasmail.com', 'killmail.com', 'killmail.net', 'klassmaster.com',
  'kurzepost.de', 'lhsdv.com', 'lifebyfood.com', 'link2mail.net',
  'litedrop.com', 'lol.ovpn.to', 'lookugly.com', 'lortemail.dk',
  'lr78.com', 'lukecarrier.me', 'maileater.com', 'mailexpire.com',
  'mailfall.com', 'mailin8r.com', 'mailme.lv', 'mailme24.com',
  'mailmoat.com', 'mailnew.com', 'mailseal.de', 'mailscrap.com',
  'mailshell.com', 'mailslite.com', 'mailzilla.com', 'mbx.cc',
  'meltmail.com', 'messagebeamer.de', 'mezimages.net', 'ministry-of-silly-walks.de',
  'moncourrier.fr.nf', 'monemail.fr.nf', 'monmail.fr.nf', 'mt2009.com',
  'mt2014.com', 'mx0.wwwnew.eu', 'mycleaninbox.net', 'mypartyclip.de',
  'myphantomemail.com', 'mysamp.de', 'neomailbox.com', 'nepwk.com',
  'nervmich.net', 'nervtmich.net', 'neverbox.com', 'nice-4u.com',
  'nincsmail.hu', 'nnh.com', 'no-spam.ws', 'nobulk.com',
  'nodezine.com', 'nogmailspam.info', 'nomail.pw', 'nomail.xl.cx',
  'nomail2me.com', 'nospam.ze.tc', 'nospam4.us', 'nospamfor.us',
  'nospammail.net', 'nospamthanks.info', 'notmailinator.com',
  'nowhere.org', 'nowmymail.com', 'nwldx.com', 'objectmail.com',
  'obobbo.com', 'odnorazovoe.ru', 'one-time.email', 'oneoffemail.com',
  'onewaymail.com', 'online.ms', 'oopi.org', 'opayq.com',
  'ordinaryamerican.net', 'otherinbox.com', 'ovpn.to', 'owlpic.com',
  'parlimentpetitioner.tk', 'pecinan.com', 'pepbot.com', 'pfui.ru',
  'pimpedupmyspace.com', 'pjjkp.com', 'plexolan.de', 'poofy.org',
  'pookmail.com', 'privacy.net', 'privatdemail.net', 'proxymail.eu',
  'prtnx.com', 'prtz.eu', 'pubmail.io', 'put2.net',
  'putthisinyourspamdatabase.com', 'pwrby.com', 'quickinbox.com', 'rcpt.at',
  'receiveee.chickenkiller.com', 'recode.me', 'recursor.net', 'recyclemail.dk',
  'regbypass.com', 'regbypass.comsafe-mail.net', 'rejectmail.com', 'rklips.com',
  'rmqkr.net', 'royal.net', 'rppkn.com', 'rtrtr.com',
  's0ny.net', 'safe-mail.net', 'safetymail.info', 'safetypost.de',
  'sandelf.de', 'saynotospams.com', 'selfdestructingmail.com', 'sendfree.org',
  'sendingspecialflyers.com', 'senseless-entertainment.com', 'services391.com', 'sharklasers.com',
  'shiftmail.com', 'shitmail.me', 'shitmail.org', 'shitware.nl',
  'shortmail.net', 'sikux.com', 'simpleitsecurity.info', 'sinfiltro.cl',
  'singlespeak.com', 'skeefmail.com', 'slapsfromlastnight.com', 'slaskpost.se',
  'slave-auctions.net', 'slopsbox.com', 'slowslow.de', 'smellfear.com',
  'smwg.info', 'sn.im', 'sneakemail.com', 'sneakmail.de',
  'snkmail.com', 'sofort-mail.de', 'sogetthis.com', 'sohai.ml',
  'soodo.com', 'soulfoodcookbook.com', 'spam.la', 'spam.org.tr',
  'spam.su', 'spamavert.com', 'spambob.net', 'spambob.org',
  'spambog.com', 'spambog.de', 'spambog.ru', 'spambox.info',
  'spambox.irishspringrealty.com', 'spambox.us', 'spamcannon.com', 'spamcannon.net',
  'spamcero.com', 'spamcon.org', 'spamcorptastic.com', 'spamcowboy.com',
  'spamcowboy.net', 'spamcowboy.org', 'spamday.com', 'spamex.com',
  'spamfree.eu', 'spamfree24.de', 'spamfree24.eu', 'spamfree24.info',
  'spamfree24.net', 'spamfree24.org', 'spamgoes.in', 'spamgob.com',
  'spamhereplease.com', 'spamhole.com', 'spamify.com', 'spaminator.de',
  'spamkill.info', 'spaml.com', 'spaml.de', 'spammotel.com',
  'spammy.host', 'spamoff.de', 'spamslicer.com', 'spamspot.com',
  'spamstack.net', 'spamthisplease.com', 'spamtrail.com', 'spamtrap.ro',
  'speed.1s.fr', 'spikio.com', 'spoofmail.de', 'squizzy.de',
  'squizzy.eu', 'squizzy.net', 'ssl-certificate-transfer.com', 'stinkefinger.net',
  'stuffmail.de', 'super-auswahl.de', 'supergreatmail.com', 'supermailer.jp',
  'superrito.com', 'superstachel.de', 'suremail.info', 'svkmail.com',
  'sweetxxx.de', 'tafmail.com', 'tagyourself.com', 'tank.ailleur.fr',
  'tapchicuocsong.org', 'techemail.com', 'techgroup.me', 'teleworm.com',
  'teleworm.us', 'temp-mail.org', 'temp-mail.ru', 'tempalias.com',
  'tempe-mail.com', 'tempemail.biz', 'tempemail.com', 'tempemail.net',
  'tempinbox.co.uk', 'tempinbox.com', 'tempmail.de', 'tempmail.eu',
  'tempmail.it', 'tempmail2.com', 'tempomail.fr', 'temporaryemail.net',
  'temporaryemail.us', 'temporaryforwarding.com', 'temporaryinbox.com', 'temporarymailaddress.com',
  'tempthe.net', 'tempy.email', 'thankyou2010.com', 'thecloudindex.com',
  'thisisnotmyrealemail.com', 'throam.com', 'throwam.com', 'throwaway.email',
  'throwam.com', 'tilien.com', 'tittbit.in', 'tmmbt.com',
  'tofeat.com', 'top9top.com', 'toprumours.com', 'tradermail.info',
  'trash-amil.com', 'trash-mail.at', 'trash-mail.com', 'trash-mail.de',
  'trash-mail.ga', 'trash-mail.io', 'trash-mail.me', 'trash-mail.ml',
  'trash2009.com', 'trash2010.com', 'trash2011.com', 'trashemail.de',
  'trashimail.de', 'trashmail.at', 'trashmail.com', 'trashmail.de',
  'trashmail.io', 'trashmail.me', 'trashmail.net', 'trashmail.org',
  'trashmail.xyz', 'trashmailer.com', 'trashmailme.de', 'trashpos.com',
  'trillianpro.com', 'trixtrox.com', 'trxs.pw', 'ttirv.com',
  'turual.com', 'twinmail.de', 'tyldd.com', 'uggsrock.com',
  'umail.net', 'uroid.com', 'us.af', 'venompen.com',
  'veryrealemail.com', 'vfemail.net', 'vindex.cc', 'viroleni.cu.cc',
  'vomoto.com', 'vomoto.net', 'vubby.com', 'walala.org',
  'walkmail.net', 'walkmail.ru', 'webemail.me', 'webm4il.info',
  'weg-werf-email.de', 'wegwerf-emails.de', 'wegwerfadresse.de', 'wegwerfmail.de',
  'wegwerfmail.info', 'wegwerfmail.net', 'wegwerfmail.org', 'wetrainbayarea.org',
  'wh4f.org', 'whatpaas.com', 'whatsaas.com', 'wilemail.com',
  'willhackforfood.biz', 'willselfdestruct.com', 'winemaven.info', 'wronghead.com',
  'wuzupmail.net', 'www.e4ward.com', 'www.gishpuppy.com', 'www.mailbucket.org',
  'wwwnew.eu', 'xagloo.com', 'xemaps.com', 'xents.com',
  'xmail.net', 'xmaily.com', 'xoxy.net', 'xww.ro',
  'xyzfree.net', 'yapped.net', 'yeah.net', 'yep.it',
  'ypmail.webarnak.fr.eu.org', 'yuurok.com', 'z1p.biz', 'za.com',
  'zehnminuten.de', 'zehnminutenmail.de', 'zetmail.com', 'zippymail.info',
  'zoemail.net', 'zoemail.org', 'zomg.info', 'zxcv.com',
  'zxcvbnm.com', 'zzz.com',
]);

// Cek apakah domain email valid (punya MX record via DNS-over-HTTPS)
async function checkEmailDomain(email) {
  try {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return false;

    // Cek blocklist dulu
    if (BLOCKED_DOMAINS.has(domain)) return false;

    // Cek MX record via Cloudflare DNS-over-HTTPS
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${domain}&type=MX`, {
      headers: { 'Accept': 'application/dns-json' },
    });
    if (!res.ok) return true; // kalau DNS gagal, jangan block (benefit of the doubt)
    const data = await res.json();
    // Status 0 = NOERROR, dan ada Answer = domain punya MX record
    return data.Status === 0 && Array.isArray(data.Answer) && data.Answer.length > 0;
  } catch {
    return true; // kalau error, jangan block
  }
}

// Clean expired entries dari cache
function cleanCache() {
  const now = Date.now();
  for (const [key, val] of rateLimitCache.entries()) {
    if (now - val.firstRequest > RATE_LIMIT.BLOCK_DURATION_MS) {
      rateLimitCache.delete(key);
    }
  }
  for (const [key, val] of otpCache.entries()) {
    if (now > val.expiry) {
      otpCache.delete(key);
    }
  }
}

export async function POST(request) {
  cleanCache();

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { action, email, name, honeypot, fingerprint } = body;

  // ── HONEYPOT CHECK: kalau field honeypot diisi → pasti bot
  if (honeypot && honeypot.trim() !== '') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // ── RATE LIMIT CHECK per IP
  const now = Date.now();
  const rateEntry = rateLimitCache.get(ip) || { count: 0, firstRequest: now, blocked: false };

  if (rateEntry.blocked && now - rateEntry.firstRequest < RATE_LIMIT.BLOCK_DURATION_MS) {
    const remaining = Math.ceil((RATE_LIMIT.BLOCK_DURATION_MS - (now - rateEntry.firstRequest)) / 60000);
    return NextResponse.json({
      error: `Too many requests. Try again in ${remaining} minute(s).`,
      blocked: true,
    }, { status: 429 });
  }

  // Reset window kalau sudah lewat 15 menit
  if (now - rateEntry.firstRequest > RATE_LIMIT.WINDOW_MS) {
    rateEntry.count = 0;
    rateEntry.firstRequest = now;
    rateEntry.blocked = false;
  }

  rateEntry.count += 1;
  if (rateEntry.count > RATE_LIMIT.MAX_REQUESTS) {
    rateEntry.blocked = true;
    rateEntry.firstRequest = now;
    rateLimitCache.set(ip, rateEntry);
    return NextResponse.json({
      error: 'Too many requests. You have been temporarily blocked for 1 hour.',
      blocked: true,
    }, { status: 429 });
  }
  rateLimitCache.set(ip, rateEntry);

  // ── ACTION: validate-email
  if (action === 'validate-email') {
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const domain = email.split('@')[1]?.toLowerCase();

    // Cek blocklist disposable
    if (BLOCKED_DOMAINS.has(domain)) {
      return NextResponse.json({
        valid: false,
        reason: 'disposable',
        message: 'Disposable/temporary email addresses are not allowed.',
      }, { status: 200 });
    }

    // Cek MX record
    const hasMX = await checkEmailDomain(email);
    if (!hasMX) {
      return NextResponse.json({
        valid: false,
        reason: 'no-mx',
        message: `Email domain "${domain}" does not appear to exist or accept emails.`,
      }, { status: 200 });
    }

    // Generate OTP dan simpan di cache
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpCache.set(email.toLowerCase(), {
      otp,
      expiry: now + 5 * 60 * 1000, // 5 menit
      attempts: 0,
      ip,
      name,
    });

    return NextResponse.json({ valid: true, otp }, { status: 200 });
  }

  // ── ACTION: verify-otp
  if (action === 'verify-otp') {
    const { otp: enteredOtp } = body;
    const cached = otpCache.get(email?.toLowerCase());

    if (!cached) {
      return NextResponse.json({ error: 'OTP not found or expired. Please request a new code.' }, { status: 400 });
    }

    if (Date.now() > cached.expiry) {
      otpCache.delete(email.toLowerCase());
      return NextResponse.json({ error: 'OTP has expired. Please request a new code.' }, { status: 400 });
    }

    if (cached.attempts >= 3) {
      otpCache.delete(email.toLowerCase());
      return NextResponse.json({ error: 'Too many wrong attempts. Please request a new code.' }, { status: 429 });
    }

    if (enteredOtp !== cached.otp) {
      cached.attempts += 1;
      otpCache.set(email.toLowerCase(), cached);
      return NextResponse.json({
        error: 'Wrong OTP code.',
        attemptsLeft: 3 - cached.attempts,
      }, { status: 400 });
    }

    // OTP benar → hapus dari cache
    otpCache.delete(email.toLowerCase());
    return NextResponse.json({ verified: true }, { status: 200 });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}