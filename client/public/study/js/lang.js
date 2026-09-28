// ============================================================
//  WHOLE-SITE LANGUAGE SWITCHER — हिंदी / English / Hinglish
//  - Translates every [data-i18n] element from a dictionary
//  - In English / Hinglish mode, Devanagari content inside
//    <body> is transliterated to Roman script on the fly
//    (so long notes, stories, questions also "change language").
//  - Choice is saved in localStorage["jac_lang"].
// ============================================================

const I18N = {
  // ---------- nav ----------
  nav_home:      { hi:"होम",                 en:"Home",              hg:"Home" },
  nav_subjects:  { hi:"विषय",                en:"Subjects",          hg:"Subjects" },
  nav_quiz:      { hi:"क्विज़",              en:"Quiz",              hg:"Quiz" },
  nav_notes:     { hi:"नोट्स",               en:"Notes",             hg:"Notes" },
  nav_formulas:  { hi:"फॉर्मूले",            en:"Formulas",          hg:"Formulas" },
  nav_periodic:  { hi:"आवर्त सारणी",        en:"Periodic Table",    hg:"Periodic Table" },
  nav_lab:       { hi:"प्रयोगशाला",          en:"Lab",               hg:"Lab" },
  nav_mathlab:   { hi:"मैथ लैब",             en:"Math Lab",          hg:"Math Lab" },
  nav_practical: { hi:"प्रैक्टिकल",          en:"Practical",         hg:"Practical" },
  nav_diagrams:  { hi:"आरेख",                en:"Diagrams",          hg:"Diagrams" },
  nav_stories:   { hi:"कहानियाँ",            en:"Stories",           hg:"Stories" },
  nav_history:   { hi:"तारीखें",             en:"Timeline",          hg:"Timeline" },
  nav_pdf:       { hi:"PDF",                 en:"PDF",               hg:"PDF" },
  nav_analysis:  { hi:"रिज़ल्ट",             en:"Results",           hg:"Results" },

  // ---------- index hero ----------
  hero_i1:       { hi:"झारखंड बोर्ड कक्षा 10", en:"Jharkhand Board Class 10", hg:"Jharkhand Board Class 10" },
  hero_i2:       { hi:"परीक्षा की सुपर तैयारी", en:"Super Exam Preparation", hg:"Super Exam Preparation" },
  hero_idesc:    { hi:"3000+ प्रश्न • इंटरैक्टिव क्विज़ • सभी फॉर्मूले • प्रयोगशाला • कहानियाँ • तारीखें — सब एक ही जगह! 🚀", en:"3000+ questions • interactive quiz • all formulas • lab • stories • timeline — all in one place! 🚀", hg:"3000+ sawal • interactive quiz • saare formulas • lab • kahaniyan • tarikhen — sab ek hi jagah! 🚀" },
  cta_subjects:  { hi:"📚 विषय चुनें",        en:"📚 Choose Subjects",  hg:"📚 Choose Subjects" },
  cta_quiz:      { hi:"📝 क्विज़ शुरू करें",  en:"📝 Start Quiz",       hg:"📝 Start Quiz" },
  cta_formulas:  { hi:"🧮 फॉर्मूले",          en:"🧮 Formulas",         hg:"🧮 Formulas" },
  stat_students: { hi:"स्टूडेंट्स",           en:"Students",            hg:"Students" },
  stat_questions:{ hi:"प्रश्न",               en:"Questions",           hg:"Questions" },
  stat_subjects: { hi:"विषय",                 en:"Subjects",            hg:"Subjects" },
  stat_online:   { hi:"ऑनलाइन",               en:"Online",              hg:"Online" },
  home_sec_h:    { hi:"🌟 सब कुछ एक क्लिक पर", en:"🌟 Everything at one click", hg:"🌟 Everything at one click" },
  home_sec_d:    { hi:"हर फीचर अपने अलग पेज पर — जैसे ही click करेंगे, open होगा", en:"Every feature has its own page — click and it opens", hg:"Every feature has its own page — click karo aur open" },
  subs_sec_h:    { hi:"📚 अपना विषय चुनें",    en:"📚 Choose your subject", hg:"📚 Choose your subject" },
  subs_sec_d:    { hi:"हर विषय में 300+ प्रश्न, नोट्स, फॉर्मूले और प्रैक्टिस", en:"Each subject has 300+ questions, notes, formulas and practice", hg:"Har subject me 300+ questions, notes, formulas aur practice" },
  footer_credit: { hi:"🎓 JAC Board Class 10 Study Hub | NCERT Based | पिछले 5 वर्षों (2020-2024) के प्रश्न", en:"🎓 JAC Board Class 10 Study Hub | NCERT Based | Previous 5 years (2020-2024) questions", hg:"🎓 JAC Board Class 10 Study Hub | NCERT Based | Pichle 5 saal (2020-2024) ke sawal" },
  footer_motto:  { hi:"💜 आपकी मेहनत ही आपकी सफलता है!", en:"💜 Your hard work is your success!", hg:"💜 Aapki mehnat hi aapki safalta hai!" },

  // ---------- quiz page ----------
  pq_title:   { hi:"📝 क्विज़ मोड", en:"📝 Quiz Mode", hg:"📝 Quiz Mode" },
  pq_desc:    { hi:"Option पर click करते ही पता चलेगा — सही या गलत! चुना हुआ विकल्प lock हो जाएगा", en:"Click an option and know instantly — right or wrong! Your choice gets locked", hg:"Option par click karte hi pata chalega — sahi ya galat! Choice lock ho jayega" },

  // ---------- notes page ----------
  pn_title:   { hi:"📖 महत्वपूर्ण नोट्स", en:"📖 Important Notes", hg:"📖 Important Notes" },
  pn_desc:    { hi:"रंग-बिरंगे, मानवीय भाषा में — हर विषय का पूरा सार", en:"Colourful, human language — full essence of every subject", hg:"Colourful, human language — har subject ka poora saar" },

  // ---------- formulas page ----------
  pf_title:   { hi:"🧮 सभी फॉर्मूले एक ही पेज पर", en:"🧮 All Formulas on One Page", hg:"🧮 All Formulas on One Page" },
  pf_desc:    { hi:"गणित (पूरा) + त्रिकोणमिति सारणी + भौतिक विज्ञान + रसायन विज्ञान", en:"Maths (complete) + trigonometry table + physics + chemistry", hg:"Maths (complete) + trigonometry table + physics + chemistry" },

  // ---------- periodic page ----------
  pp_title:   { hi:"🧪 आवर्त सारणी (Periodic Table)", en:"🧪 Periodic Table", hg:"🧪 Periodic Table" },
  pp_desc:    { hi:"हर तत्व पर click करें — नाम, हिंदी नाम, इलेक्ट्रॉन विन्यास, गलनांक/क्वथनांक, प्रयोग 🌡️ slider घुमाकर देखो कौन पिघलता है", en:"Click any element — name, Hindi name, electron config, melting/boiling point, uses. Drag the 🌡️ slider to see what melts!", hg:"Har element par click karo — naam, Hindi naam, electron config, ghalanaank/quarternaank, upayog. 🌡️ slider ghuma kar dekho kaun pighalta hai" },

  // ---------- diagrams page ----------
  dd_title:   { hi:"🖼️ आरेख लैब (Diagram Lab)", en:"🖼️ Diagram Lab", hg:"🖼️ Diagram Lab" },
  dd_desc:    { hi:"बोर्ड के सबसे महत्वपूर्ण 25 आरेख — किसी भी part पर click करो, बड़े अक्षरों में उसका काम खुल जाएगा!", en:"25 most important board diagrams — click any part and its function opens in big text!", hg:"25 sabse important board diagrams — kisi bhi part par click karo, bade aksharon me uska kaam khul jayega!" },

  // ---------- lab page ----------
  pl_title:   { hi:"🔬 प्रयोगशाला (Virtual Lab)", en:"🔬 Virtual Lab", hg:"🔬 Virtual Lab" },
  pl_desc:    { hi:"भौतिक, रसायन, जीव विज्ञान के प्रयोग — उद्देश्य से सावधानियों तक सब कुछ", en:"Physics, chemistry and biology experiments — from aim to precautions", hg:"Physics, chemistry, biology ke prayog — uddeshya se savdhanio tak sab kuch" },

  // ---------- math lab page ----------
  pm_title:   { hi:"📉 मैथ लैब (Math Lab)", en:"📉 Math Lab", hg:"📉 Math Lab" },
  pm_desc:    { hi:"ग्राफ़ बनाओ, x निकालो, d निकालो (डेरिवेटिव), AP और दूरी के सूत्र हल करो", en:"Draw graphs, solve for x, find derivatives, solve AP and distance formulas", hg:"Graph banao, x nikalo, d nikalo (derivative), AP aur doori ke sutra hal karo" },
  mm_graph:   { hi:"📈 ग्राफ़ बनाओ (Equation → Graph)", en:"📈 Draw Graph (Equation → Graph)", hg:"📈 Graph banao (Equation → Graph)" },
  mm_solve:   { hi:"🔢 x निकालो (Equation Solver)", en:"🔢 Solve for x (Equation Solver)", hg:"🔢 x nikalo (Equation Solver)" },
  mm_deriv:   { hi:"🧮 d/dx निकालो (Derivative Calculator)", en:"🧮 Find d/dx (Derivative Calculator)", hg:"🧮 d/dx nikalo (Derivative Calculator)" },
  mm_ap:      { hi:"➕ समांतर श्रेणी (Arithmetic Progression)", en:"➕ Arithmetic Progression", hg:"➕ Samantar Shreni (AP)" },
  mm_coord:   { hi:"📍 निर्देशांक ज्यामिति (Coordinate Geometry)", en:"📍 Coordinate Geometry", hg:"📍 Nirdeshank Geometry" },

  // ---------- practical page ----------
  ppr_title:  { hi:"🧫 जीव विज्ञान प्रैक्टिकल", en:"🧫 Biology Practical", hg:"🧫 Biology Practical" },
  ppr_desc:   { hi:"हर body part की drawing + नाम + काम — हृदय, मस्तिष्क, नेत्र, कान, गुर्दा, फूल, पौधा, न्यूरॉन", en:"Drawing + name + function of every body part — heart, brain, eye, ear, kidney, flower, plant, neuron", hg:"Har body part ki drawing + naam + kaam — heart, brain, eye, ear, kidney, flower, plant, neuron" },

  // ---------- stories page ----------
  pst_title:  { hi:"📗 सभी कहानियाँ", en:"📗 All Stories", hg:"📗 All Stories" },
  pst_desc:   { hi:"हिंदी + English — लेखक, सारांश, पात्र, सीख", en:"Hindi + English — author, summary, characters, moral", hg:"Hindi + English — writer, summary, characters, seekh" },

  // ---------- history page ----------
  ph_title:   { hi:"🕰️ इतिहास की तारीखें", en:"🕰️ History Timeline", hg:"🕰️ History Timeline" },
  ph_desc:    { hi:"कब क्या हुआ — क्रांति, आंदोलन, युद्ध, घटनाएँ — तारीख के साथ", en:"What happened when — revolutions, movements, wars, events with dates", hg:"Kab kya hua — kranti, andolan, yudh, ghatnayen — tarikh ke saath" },

  // ---------- pdf page ----------
  ppdf_title: { hi:"📄 PDF रिवीज़न लाइब्रेरी", en:"📄 PDF Revision Library", hg:"📄 PDF Revision Library" },
  ppdf_desc:  { hi:"18 PDF — प्रश्न बैंक + उत्तर कुंजियाँ। click करो → नए टैब में खुलेगा", en:"18 PDFs — question banks + answer keys. Click to open in a new tab", hg:"18 PDF — question bank + answer keys. click karo → naye tab me khulega" },

  // ---------- subjects pages ----------
  psub_title: { hi:"📚 अपना विषय चुनें", en:"📚 Choose Your Subject", hg:"📚 Choose Your Subject" },
  psub_desc:  { hi:"हर विषय का अलग पेज — क्विज़, नोट्स, फॉर्मूले, सब कुछ", en:"Every subject has its own page — quiz, notes, formulas, everything", hg:"Har subject ka alag page — quiz, notes, formulas, sab kuch" },
  sub_title:  { hi:"📚 विषय", en:"📚 Subject", hg:"📚 Subject" },
  sub_desc:   { hi:"ई-लाइब्रेरी", en:"E-Library", hg:"E-Library" },

  // ---------- analysis page ----------
  pa_title:   { hi:"📊 मेरा रिज़ल्ट / विश्लेषण", en:"📊 My Results / Analysis", hg:"📊 My Results / Analysis" },
  pa_desc:    { hi:"किस विषय में कितना स्कोर? कौन सा अध्याय weak? कैसे सुधारें?", en:"What's your score per subject? Which chapter is weak? How to improve?", hg:"Kis subject me kitna score? Kaun sa chapter weak? Kaise sudharein?" },

  // ---------- generic ----------
  lang_choose: { hi:"भाषा चुनें", en:"Language", hg:"Language" },
  search_ph:   { hi:"यहाँ खोजें...", en:"Search here...", hg:"Search here..." },
  open:        { hi:"खोलें →", en:"Open →", hg:"Open →" },
  qty_questions:{ hi:"प्रश्न", en:"questions", hg:"questions" },
  back_home:   { hi:"🏠 होम वापस", en:"🏠 Back to Home", hg:"🏠 Back to Home" },
};

// Compact Devanagari -> Roman map (used to romanise content in en/hg mode)
const LANG_MAP = {
  'क':'k','ख':'kh','ग':'g','घ':'gh','ङ':'ng','च':'ch','छ':'chh','ज':'j','झ':'jh','ञ':'ny',
  'ट':'t','ठ':'th','ड':'d','ढ':'dh','ण':'n','त':'t','थ':'th','द':'d','ध':'dh','न':'n',
  'प':'p','फ':'f','फ़':'f','ब':'b','भ':'bh','म':'m','य':'y','र':'r','ल':'l','व':'v',
  'श':'sh','ष':'sh','स':'s','ह':'h','क़':'q','ख़':'kh','ग़':'g','ज़':'z','ड़':'r','ढ़':'rh',
  'अ':'a','आ':'aa','इ':'i','ई':'ee','उ':'u','ऊ':'oo','ऋ':'ri','ए':'e','ऐ':'ai','ओ':'o','औ':'au',
  'ा':'a','ि':'i','ी':'ee','ु':'u','ू':'oo','ृ':'ri','े':'e','ै':'ai','ो':'o','ौ':'au',
  'ं':'n','ँ':'n','ः':'h','ॉ':'o','़':'','्':'','ज्ञ':'gy','क्ष':'ksh','त्र':'tr','श्र':'shr',
};

function langRoman(text) {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (LANG_MAP[c] !== undefined) { out += LANG_MAP[c]; continue; }
    if (i + 1 < text.length) {
      const two = c + text[i + 1];
      if (LANG_MAP[two] !== undefined) { out += LANG_MAP[two]; i++; continue; }
    }
    out += c;
  }
  return out;
}

function getLang() {
  try { return localStorage.getItem('jac_lang') || 'hi'; } catch (e) { return 'hi'; }
}

function t(key) {
  const bag = I18N[key];
  if (!bag) return key;
  return bag[getLang()] || bag.hi;
}

function setLang(l) {
  if (!['hi','en','hg'].includes(l)) l = 'hi';
  try { localStorage.setItem('jac_lang', l); } catch (e) {}
  location.reload();
}

function applyI18n() {
  const lang = getLang();
  if (document.documentElement) document.documentElement.lang = (lang === 'en') ? 'en' : 'hi';
  const sel = document.getElementById('langSelect');
  if (sel) sel.value = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const bag = I18N[el.getAttribute('data-i18n')];
    if (bag) el.textContent = bag[lang] || bag.hi;
  });
}

// Convert a single element's text nodes (Devanagari -> Roman). Keeps HTML intact.
function romanizeNode(node) {
  if (typeof document.createTreeWalker !== 'function' || typeof NodeFilter === 'undefined') return;
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => {
      if (!n.data || !/[\u0900-\u097F]/.test(n.data)) return NodeFilter.FILTER_REJECT;
      const p = n.parentNode;
      if (!p || !p.closest || p.closest('script,style,svg,textarea,input,[data-i18n]')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker);
  nodes.forEach(n => { n.data = langRoman(n.data); });
}

function applyContentLang() {
  if (getLang() === 'hi') return;
  if (!document.body) return;
  romanizeNode(document.body);
}

// Keep converting future injected content (quiz navigation, etc.)
function watchContentLang() {
  if (getLang() === 'hi') return;
  if (typeof MutationObserver === 'undefined' || !document.body) return;
  const mo = new MutationObserver(muts => {
    muts.forEach(m => m.addedNodes.forEach(n => {
      if (n.nodeType === 1) romanizeNode(n);
      else if (n.nodeType === 3 && /[\u0900-\u097F]/.test(n.data || '')) {
        const p = n.parentNode;
        if (p && !p.closest('script,style,svg,textarea,input,[data-i18n]')) n.data = langRoman(n.data);
      }
    }));
  });
  mo.observe(document.body, { childList: true, subtree: true });
}

function initLang() {
  applyI18n();
  // run content conversion after page scripts have rendered everything
  setTimeout(applyContentLang, 0);
  watchContentLang();
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initLang);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { I18N, getLang, setLang, t, applyI18n, langRoman };
}