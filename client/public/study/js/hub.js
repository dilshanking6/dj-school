// ============================================================
//  HUB - class switcher + data loader
//  Kaam: pata lagana ki user kis class ka content dekh raha hai,
//  us class ka bundle load karna, aur baaki pages ko batana.
// ============================================================

const HUB_CLASSES = [
  { class: 9, label: 'कक्षा 9', labelEn: 'Class 9', emoji: '9️⃣' },
  { class: 10, label: 'कक्षा 10', labelEn: 'Class 10', emoji: '🔟' },
  { class: 11, label: 'कक्षा 11', labelEn: 'Class 11', emoji: '1️⃣1️⃣' },
  { class: 12, label: 'कक्षा 12', labelEn: 'Class 12', emoji: '1️⃣2️⃣' }
];

const HUB_STORE_KEY = 'dj_study_class';
const HUB_DEFAULT = 10;

const HUB = {
  class: HUB_DEFAULT,
  classes: HUB_CLASSES,
  locked: false,      // true = user ne class portal se kholi hai, switch band
  loaded: false,
  source: 'pending',  // 'api' | 'bundle' | 'empty'
  label: 'कक्षा 10',
  lastError: ''
};

function hubValidClass(value) {
  const n = parseInt(value, 10);
  return HUB_CLASSES.some((c) => c.class === n) ? n : null;
}

function hubReadQueryClass() {
  try {
    return hubValidClass(new URLSearchParams(location.search).get('class'));
  } catch (e) {
    return null;
  }
}

/** Dashboard se link me locked=1 aata hai — usse switcher band ho jata hai. */
function hubReadLockFlag() {
  try {
    return new URLSearchParams(location.search).get('locked') === '1';
  } catch (e) {
    return false;
  }
}

function hubReadStoredClass() {
  try {
    return hubValidClass(localStorage.getItem(HUB_STORE_KEY));
  } catch (e) {
    return null;
  }
}

/** Class decide karo: URL > localStorage > default. */
function hubResolveClass() {
  const fromUrl = hubReadQueryClass();
  if (fromUrl) {
    HUB.class = fromUrl;
    HUB.locked = hubReadLockFlag();
    try { localStorage.setItem(HUB_STORE_KEY, String(fromUrl)); } catch (e) {}
    return HUB.class;
  }
  const stored = hubReadStoredClass();
  if (stored) {
    HUB.class = stored;
    HUB.locked = hubReadLockFlag();
    return HUB.class;
  }
  HUB.class = HUB_DEFAULT;
  HUB.locked = hubReadLockFlag();
  return HUB.class;
}

/** Portal se aate waqt class lock kar dete hain (dashboard ka card). */
function hubLockClass(value) {
  const n = hubValidClass(value);
  if (!n) return false;
  HUB.locked = true;
  return hubResolveClassTo(n);
}

function hubResolveClassTo(n) {
  HUB.class = n;
  try { localStorage.setItem(HUB_STORE_KEY, String(n)); } catch (e) {}
  const meta = HUB_CLASSES.find((c) => c.class === n);
  HUB.label = meta ? meta.label : 'कक्षा ' + n;
  return n;
}

function hubSetClass(n) {
  if (HUB.locked) return false;
  const v = hubValidClass(n);
  if (!v) return false;
  hubResolveClassTo(v);
  // Address bar me class likh do taaki link share karne par bhi sahi class khule
  const url = new URL(location.href);
  url.searchParams.set('class', String(v));
  history.replaceState({}, '', url);
  location.reload();
  return true;
}

/** Har page link me current class propagate karo. */
function hubLink(href) {
  if (!href) return href;
  if (/^(https?:|mailto:|#|javascript:)/.test(href)) return href;
  const sep = href.indexOf('?') === -1 ? '?' : '&';
  const locked = HUB.locked ? '&locked=1' : '';
  return href + sep + 'class=' + HUB.class + locked;
}

function hubIsBoardClass() {
  return HUB.class === 10;
}

/** Class 9-10 ke science tools 11-12 me seedhe apply nahi hote. */
function hubToolNote() {
  if (HUB.class === 9 || HUB.class === 10) return '';
  return 'यह टूल कक्षा 9–10 की पाठ्यपुस्तक पर आधारित है। ' + HUB.label + ' के लिए अध्याय सूची, नोट्स और क्विज़ का उपयोग करें।';
}

// ---- Load this class's content --------------------------------
async function hubFetchJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

/** Class 10 ke liye purana 1.6MB embedded bundle (offline fallback). */
function hubInjectAllQuestions() {
  return new Promise((resolve) => {
    if (window.ALL_QUESTIONS) return resolve(window.ALL_QUESTIONS);
    const s = document.createElement('script');
    s.src = 'js/allquestions.js';
    s.onload = () => resolve(window.ALL_QUESTIONS || {});
    s.onerror = () => resolve({});
    document.head.appendChild(s);
  });
}

async function hubLoadBundle() {
  const cls = HUB.class;

  // 1) API (server se, principal ke edits ke saath)
  try {
    const data = await hubFetchJson('/api/study/content?class=' + cls);
    if (data && data.subjects) {
      HUB.source = 'api';
      HUB.loaded = true;
      HUB.lastError = '';
      return data;
    }
  } catch (e) {
    HUB.lastError = e.message || 'API unavailable';
  }

  // 2) Local static fallback
  try {
    const subjects = {};
    if (cls === 10) {
      const all = await hubInjectAllQuestions();
      Object.assign(subjects, all || {});
    } else {
      const list = await hubFetchJson('js/hub/subjects.json').catch(() => ({ [cls]: [] }));
      const files = list[cls] || [];
      await Promise.all(files.map(async (f) => {
        try {
          subjects[f.id] = await hubFetchJson('js/hub/class' + cls + '/' + f.file);
        } catch (e) { /* is subject ko skip kar do */ }
      }));
    }
    HUB.source = 'bundle';
    HUB.loaded = true;
    return { class: cls, subjects: subjects };
  } catch (e) {
    HUB.source = 'empty';
    HUB.loaded = true;
    HUB.lastError = HUB.lastError || e.message;
    return { class: cls, subjects: {} };
  }
}

/**
 * Halka outline payload (sirf chapters + counts) — homepage ke liye.
 * Poora /content class 10 me ~1.6 MB hota hai, isliye homepage pe sirf
 * outline load karke ho jata hai; subjects/quiz pages full bundle load karte hain.
 */
async function hubLoadOutline() {
  const cls = HUB.class;
  try {
    const data = await hubFetchJson('/api/study/outline?class=' + cls);
    if (data && Array.isArray(data.subjects)) {
      HUB.source = 'outline';
      HUB.loaded = true;
      return data;
    }
  } catch (e) {
    HUB.lastError = e.message || 'API unavailable';
  }
  return null;
}

function hubMeta() {
  return HUB_CLASSES.find((c) => c.class === HUB.class) || HUB_CLASSES[1];
}

if (typeof window !== 'undefined') {
  window.HUB = HUB;
  window.hubResolveClass = hubResolveClass;
  window.hubLockClass = hubLockClass;
  window.hubSetClass = hubSetClass;
  window.hubLink = hubLink;
  window.hubLoadBundle = hubLoadBundle;
  window.hubLoadOutline = hubLoadOutline;
  window.hubMeta = hubMeta;
  window.hubIsBoardClass = hubIsBoardClass;
  window.hubToolNote = hubToolNote;
  window.hubValidClass = hubValidClass;
  hubResolveClass();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HUB_CLASSES, hubValidClass, hubReadQueryClass, hubReadStoredClass };
}
