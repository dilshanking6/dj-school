// ============================================================
//  COMMON HELPERS + NAVIGATION - JAC Class 10 Study Hub
// ============================================================

// Loaded after data.js so SUBJECTS etc. are globals.

const NAV_LINKS = [
  { href:'index.html',    icon:'🏠', i18n:'nav_home' },
  { href:'subjects.html', icon:'📚', i18n:'nav_subjects' },
  { href:'quiz.html',     icon:'📝', i18n:'nav_quiz' },
  { href:'notes.html',    icon:'📖', i18n:'nav_notes' },
  { href:'formulas.html', icon:'🧮', i18n:'nav_formulas' },
  { href:'periodic.html', icon:'🧪', i18n:'nav_periodic' },
  { href:'lab.html',      icon:'🔬', i18n:'nav_lab' },
  { href:'mathlab.html',  icon:'📉', i18n:'nav_mathlab' },
  { href:'practical.html',icon:'🧫', i18n:'nav_practical' },
  { href:'diagrams.html', icon:'🖼️', i18n:'nav_diagrams' },
  { href:'stories.html',  icon:'📗', i18n:'nav_stories' },
  { href:'history.html',  icon:'🕰️', i18n:'nav_history' },
  { href:'pdf.html',      icon:'📄', i18n:'nav_pdf' },
  { href:'analysis.html', icon:'📊', i18n:'nav_analysis' }
];

/** Class 10 ke board papers / stories / lab / practicals / diagrams / history sirf class 10 ke liye. */
const CLASS_10_ONLY = { 'pdf.html': 1, 'stories.html': 1, 'lab.html': 1, 'practical.html': 1, 'diagrams.html': 1, 'history.html': 1 };

function currentClass() {
  if (typeof window !== 'undefined' && window.HUB) return window.HUB.class;
  return 10;
}

function classLabel(cls) {
  if (typeof window !== 'undefined' && window.hubMeta) {
    const meta = window.hubMeta();
    if (meta && meta.class === cls) return meta.label;
  }
  return 'कक्षा ' + cls;
}

function buildNav() {
  const host = document.getElementById('siteHeader') || document.querySelector('header.navbar');
  if (!host) return;
  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const cls = currentClass();

  const links = NAV_LINKS.filter(l => cls === 10 || !CLASS_10_ONLY[l.href.split('?')[0]]).map(l => {
    const active = (l.href.split('?')[0] === page) ? ' class="active"' : '';
    const href = (typeof window !== 'undefined' && window.hubLink) ? window.hubLink(l.href) : l.href;
    return `<a href="${href}"${active}>${l.icon} <span data-i18n="${l.i18n}">·</span></a>`;
  }).join('');

  // Class switcher: locked ho to sirf current class dikhao (portal se aaya hua user)
  const locked = !!(window.HUB && window.HUB.locked);
  let switcher;
  if (locked) {
    switcher = `<span class="class-badge locked" title="आपका कक्षा">${classLabel(cls)}</span>`;
  } else {
    const opts = (window.HUB ? window.HUB.classes : []).map(c =>
      `<option value="${c.class}" ${c.class === cls ? 'selected' : ''}>${c.label}</option>`).join('');
    switcher = `<select class="class-select" id="classSelect" title="कक्षा बदलें / Change class" onchange="switchClass(this.value)">${opts}</select>`;
  }

  host.innerHTML = `
    <div class="logo"><span class="logo-icon">🎓</span> Digital Janta <b>Study Hub</b></div>
    <nav class="nav-links" id="navLinks">${links}</nav>
    <div class="nav-tools">
      ${switcher}
      <a class="portal-link" href="/">🏫 School Portal</a>
      <select class="lang-select" id="langSelect" title="Language / भाषा" onchange="setLang(this.value)">
        <option value="hi">हिंदी</option>
        <option value="en">English</option>
        <option value="hg">Hinglish</option>
      </select>
      <button class="hamburger" id="hamburger">☰</button>
    </div>`;

  const ham = document.getElementById('hamburger');
  const nav = document.getElementById('navLinks');
  ham.addEventListener('click', () => nav.classList.toggle('show'));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('show')));
}

function switchClass(value) {
  if (window.hubSetClass && window.hubSetClass(value)) return;
  toast('कक्षा बदलने के लिए Study Hub खोलें', 'info');
}


// ---- Render subject cards into a grid ----
function renderSubjectCards(containerId, page) {
  const grid = document.getElementById(containerId);
  if (!grid) return;
  const href = (typeof window !== 'undefined' && window.hubLink) ? window.hubLink(page) : page;
  let html = '';
  let empty = true;
  for (const s in SUBJECTS) {
    const sub = SUBJECTS[s];
    const data = QUESTION_DATA[s] || {};
    const qty = data.questions && data.questions.length ? data.questions.length : (data.questionCount || 0);
    const chapters = (data.chapters || []).length;
    empty = false;
    // Sirf asli sankhya dikhao - koi "+300" jaisa jhooth nahi
    const tag = qty
      ? `<div class="tag" style="background:${sub.color}22;color:${sub.color}">${qty} प्रश्न • ${chapters} अध्याय</div>`
      : `<div class="tag" style="background:${sub.color}22;color:${sub.color}">${chapters} अध्याय</div>`;
    html += `
    <div class="subject-card" onclick="location.href='${href}&subject=${s}'">
      <div class="card-icon" style="background:${sub.color}">${sub.emoji}</div>
      <h3>${sub.name}</h3>
      <p>${sub.desc}</p>
      ${tag}
    </div>`;
  }
  grid.innerHTML = html || '<p class="muted">इस कक्षा का अभी कोई विषय उपलब्ध नहीं है।</p>';
  return !empty;
}

// ---- Read ?subject= from URL ----
function getURLParam(name) {
  const p = new URLSearchParams(location.search);
  return p.get(name);
}

// ---- Escape HTML ----
function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

// ---- Animate counters ----
function animateValue(el, target, suffix) {
  if (!el) return;
  let cur = 0;
  const step = Math.max(1, Math.ceil(target / 80));
  const t = setInterval(() => {
    cur += step;
    if (cur >= target) { cur = target; clearInterval(t); }
    el.textContent = cur + (suffix || '');
  }, 18);
}

// ---- Subjects dropdown options for a select ----
function fillSubjectSelect(sel) {
  if (!sel) return;
  for (const s in SUBJECTS) {
    const o = document.createElement('option');
    o.value = s; o.textContent = SUBJECTS[s].emoji + ' ' + SUBJECTS[s].name;
    sel.appendChild(o);
  }
}

// ---- Spelling corrector (surface-level) ----
function fixSpelling(text) {
  if (!text) return text;
  let t = String(text);
  if (typeof CORRECT_SPELLINGS !== 'undefined') {
    for (const wrong in CORRECT_SPELLINGS) {
      const re = new RegExp(wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      t = t.replace(re, CORRECT_SPELLINGS[wrong][0]);
    }
  }
  return t;
}

// ---- Show a colored toast ----
function toast(msg, type) {
  let box = document.getElementById('toastBox');
  if (!box) {
    box = document.createElement('div');
    box.id = 'toastBox';
    box.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:9999;';
    document.body.appendChild(box);
  }
  const colors = { success:'#22c55e', error:'#ef4444', info:'#6366f1' };
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = `background:${colors[type]||'#6366f1'};color:#fff;padding:12px 22px;border-radius:12px;font-weight:700;box-shadow:0 6px 20px rgba(0,0,0,.25);margin-bottom:8px;`;
  box.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .4s'; }, 2200);
  setTimeout(() => el.remove(), 2700);
}

// ---- Auto setup on DOM ready ----
document.addEventListener('DOMContentLoaded', () => {
  buildNav();
  // Class 10 ke exclusive pages par seedha URL se khula ho (jaise pdf.html?class=9)
  // to home par bhej do — 10th ka content galat class me na dikhe.
  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (CLASS_10_ONLY[page] && currentClass() !== 10) {
    location.replace('index.html?class=' + currentClass() + (window.HUB && window.HUB.locked ? '&locked=1' : ''));
    return;
  }
  setupPWA();
  // Page ka apna render content load hone ke baad dobara chalao,
  // kyunki class switch ke baad SUBJECTS tab change hota hai.
  window.addEventListener('hub:content-ready', () => {
    buildNav();
    if (typeof window.onHubReady === 'function') window.onHubReady();
  }, { once: true });
});

// ---- PWA Setup (works on every page) ----
let deferredPrompt;
function setupPWA() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const banner = document.getElementById('pwaBanner');
    if (banner) banner.classList.add('show');
  });
  window.addEventListener('appinstalled', () => { deferredPrompt = null; });
}

function installPWA() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then((r) => {
    if (r.outcome === 'accepted') {
      const b = document.getElementById('pwaBanner');
      if (b) b.classList.remove('show');
    }
    deferredPrompt = null;
  });
}

function dismissPWA() {
  const b = document.getElementById('pwaBanner');
  if (b) b.classList.remove('show');
}

// export for tests (harmless in the browser)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { buildNav, renderSubjectCards, getURLParam, escapeHtml, animateValue, fillSubjectSelect, fixSpelling, toast, setupPWA, installPWA, dismissPWA, switchClass, currentClass, classLabel, CLASS_10_ONLY };
}