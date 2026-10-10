/**
 * Academic session (school year) helpers.
 *
 * School ka saal 1 April se shuru hota hai aur 31 March par khatam. Har
 * saal ka naam do calendar years se banta hai — 1 Apr 2026 se 31 Mar 2027
 * tak "2026-27". Ye label Users sheet ke `detail` JSON me store hota hai
 * (naya column ya naya sheet banane ki zaroorat nahi).
 *
 * Ye pure functions hain (koi network/IO nahi) taaki test se aasaani se
 * verify ho sakein — session label galat ho to promotion galat class me
 * chala jaata hai.
 */

const SESSION_RE = /^(\d{4})-(\d{2})$/;

/** India ka aaj ka din (Asia/Kolkata), kyunki school ka "saal badalna" IST me hai. */
const istParts = (date = new Date()) => {
  const iso = new Date(date).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const [y, m, d] = iso.split('-').map((n) => parseInt(n, 10));
  return { y, m, d };
};

/** Aaj kis session me hain — "2026-27". */
const currentSession = (date = new Date()) => {
  const { y, m } = istParts(date);
  const start = m >= 4 ? y : y - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, '0')}`;
};

/** Kya ye valid session label hai ("2026-27")? */
const isValidSession = (label) => SESSION_RE.test(String(label || '').trim());

/** Ek saal aage — "2026-27" -> "2027-28". Invalid par aaj ka session. */
const nextSession = (label) => {
  const m = SESSION_RE.exec(String(label || '').trim());
  if (!m) return currentSession();
  const start = parseInt(m[1], 10) + 1;
  return `${start}-${String((start + 1) % 100).padStart(2, '0')}`;
};

/** Session ka pehla din — "2026-27" -> "2026-04-01". */
const sessionStartDate = (label) => {
  const m = SESSION_RE.exec(String(label || '').trim());
  if (!m) return '';
  return `${m[1]}-04-01`;
};

/**
 * Agli class. 9->10, 10->11, 11->12, aur 12 ka koi aage nahi (pass out).
 * Unknown/N/A bhi null — in students ko promote nahi karna.
 */
const promoteClass = (cls) => {
  const c = String(cls == null ? '' : cls).trim();
  if (c === '9') return '10';
  if (c === '10') return '11';
  if (c === '11') return '12';
  return null;
};

/**
 * Active students ke stored sessions me sabse zyada milne wala session.
 * Promotion ka default target `nextSession(base)` hota hai — isi se March
 * (session abhi purana chal raha) aur April (naya already shuru) dono me
 * sahi target chunta hai.
 */
const baseSession = (sessions, fallback = currentSession()) => {
  const counts = new Map();
  sessions.forEach((s) => {
    if (!isValidSession(s)) return;
    const key = String(s).trim();
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  let best = '';
  let bestCount = 0;
  for (const [key, count] of counts) {
    if (count > bestCount) {
      best = key;
      bestCount = count;
    }
  }
  return best || fallback;
};

module.exports = {
  currentSession,
  nextSession,
  isValidSession,
  sessionStartDate,
  promoteClass,
  baseSession
};
