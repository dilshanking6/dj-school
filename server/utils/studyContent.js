// ============================================================
//  STUDY CONTENT SERVICE
//  Class-wise books, chapters, notes aur practice questions.
//
//  Class 10 ka content repo me maujooda static JSON (3000 JAC board
//  questions) se aata hai. Class 9/11/12 server/content/*.js se.
//
//  Principal / admin ke edits Google Sheet 'StudyContent' me jaate
//  hain aur yahan base content ke upar merge ho jaate hain.
// ============================================================

const fs = require('fs');
const path = require('path');

const class9 = require('../content/class9');
const class11 = require('../content/class11');
const class12 = require('../content/class12');

const CLASSES = [9, 10, 11, 12];

const STUDY_DIR = path.join(__dirname, '..', '..', 'client', 'public', 'study', 'js', 'data');
const NOTES_FILE = path.join(STUDY_DIR, '..', 'notes.js');

// ---- Class 10 static content (read once, cached) -----------------
const c10Cache = { data: null, notes: null };

// Class 10 subject order / metadata (same order the original site used)
const CLASS10_SUBJECTS = {
  hindi: { name: 'हिन्दी', emoji: '📕', color: '#ff6b6b', desc: 'व्याकरण, साहित्य, कविता + महत्वपूर्ण प्रश्न', file: 'hindi.json' },
  english: { name: 'English', emoji: '📘', color: '#4ecdc4', desc: 'First Flight + Footprints without Feet', file: 'english.json' },
  maths: { name: 'गणित', emoji: '🔢', color: '#f8b500', desc: '14 अध्याय + वस्तुनिष्ठ', file: 'maths.json' },
  physics: { name: 'भौतिक विज्ञान', emoji: '⚙️', color: '#845ef7', desc: 'गति, बल, ऊर्जा, ध्वनि', file: 'physics.json' },
  chemistry: { name: 'रसायन विज्ञान', emoji: '🧪', color: '#20c997', desc: 'तत्व, अभिक्रियाएँ, अम्ल-क्षारक', file: 'chemistry.json' },
  biology: { name: 'जीव विज्ञान', emoji: '🧬', color: '#51cf66', desc: 'जैव प्रक्रम, नियंत्रण, आनुवंशिकता', file: 'biology.json' },
  history: { name: 'इतिहास', emoji: '🏛️', color: '#e8590c', desc: 'राष्ट्रवाद, उद्योग, मुद्रण संस्कृति', file: 'history.json' },
  geography: { name: 'भूगोल', emoji: '🌏', color: '#1098ad', desc: 'संसाधन, कृषि, उद्योग', file: 'geography.json' },
  civics: { name: 'राजनीति विज्ञान', emoji: '⚖️', color: '#7048e8', desc: 'संघवाद, दल, लोकतंत्र', file: 'civics.json' },
  economics: { name: 'अर्थशास्त्र', emoji: '📈', color: '#ae3ec9', desc: 'विकास, मुद्रा, वैश्वीकरण', file: 'economics.json' }
};

// notes.js ka `SUBJECT_NOTES` object plain text se parse kar lete hain
// (JSON.parse ki zaroorat nahi - file JS hai, isliye halka sa regex).
const readClass10Notes = () => {
  if (c10Cache.notes) return c10Cache.notes;
  const out = {};
  try {
    const raw = fs.readFileSync(NOTES_FILE, 'utf8');
    const start = raw.indexOf('const SUBJECT_NOTES = {');
    if (start === -1) return out;
    const body = raw.slice(start + 'const SUBJECT_NOTES ='.length);
    const end = body.indexOf('\n};');
    const obj = body.slice(0, end + 1);
    // eslint-disable-next-line no-new-func
    const notes = new Function(`${obj}; return SUBJECT_NOTES;`)();
    Object.assign(out, notes);
  } catch (error) {
    // Notes optional hain - content chalta rahe
  }
  c10Cache.notes = out;
  return out;
};

const readClass10Data = () => {
  if (c10Cache.data) return c10Cache.data;
  const data = {};
  Object.entries(CLASS10_SUBJECTS).forEach(([id, meta]) => {
    try {
      const file = path.join(STUDY_DIR, meta.file);
      data[id] = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (error) {
      data[id] = { subject: meta.name, chapters: [], questions: [] };
    }
  });
  c10Cache.data = data;
  return data;
};

// ---- Authored syllabus for 9 / 11 / 12 ---------------------------
const SYLLABUS = { 9: class9[9], 11: class11[11], 12: class12[12] };

// ============================================================
//  PRACTICE QUESTION GENERATOR
//  Ye chapter ke apne points se questions banata hai, isliye har
//  prashn apne adhyay se juda hota hai. Ye "practice" hain,
//  board paper nahi - isliye `source` field 'practice' rahta hai.
// ============================================================

// Deterministic shuffle - har build me same order (tests stable rahenge)
const seededShuffle = (list, seed) => {
  const arr = [...list];
  let s = seed || 1;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const hash = (text) => {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) & 0x7fffffff;
  return h;
};

const cleanPoint = (point) => String(point || '').replace(/\s+/g, ' ').trim();

/** Options lambe na lagein — 110 chars se zyada kat dete hain. */
const shortOption = (text) => {
  const t = String(text).replace(/\s+/g, ' ').trim();
  return t.length > 110 ? `${t.slice(0, 107).replace(/\s+\S*$/, '')}...` : t;
};

const makeMcqFromPoints = (chapterTitle, points, allPoints, seed) => {
  const correct = shortOption(points[seed % points.length]);
  const pool = allPoints.filter((p) => p !== points[seed % points.length]);
  const distractors = seededShuffle(pool, seed)
    .map(shortOption)
    .filter((p, i, arr) => arr.indexOf(p) === i)
    .slice(0, 3);
  if (distractors.length < 3) return null;
  const options = seededShuffle([correct, ...distractors], seed + 7);
  return {
    type: 'mcq',
    q: `निम्न में से कौन-सा कथन अध्याय "${chapterTitle}" से सीधे जुड़ा है?`,
    options,
    answer: options.indexOf(correct),
    ans: `सही उत्तर: ${points[seed % points.length]}`
  };
};

const makeKeywordMcq = (chapterTitle, kw, allKw, seed) => {
  if (!kw || !allKw.length) return null;
  const pool = allKw.filter((k) => k !== kw);
  const distractors = seededShuffle(pool, seed)
    .map(shortOption)
    .filter((p, i, arr) => arr.indexOf(p) === i)
    .slice(0, 3);
  if (distractors.length < 3) return null;
  const options = seededShuffle([shortOption(kw), ...distractors], seed + 11);
  return {
    type: 'mcq',
    q: `"${chapterTitle}" अध्याय का मुख्य शब्द कौन-सा है?`,
    options,
    answer: options.indexOf(shortOption(kw)),
    ans: `इस अध्याय में "${kw}" शामिल है।`
  };
};

const buildPracticeQuestions = (classNo, subjectId, subject) => {
  const chapters = subject.chapters || [];
  const allPoints = chapters.flatMap((c) => (c.pts || []).map(cleanPoint)).filter(Boolean);
  const allKw = chapters.map((c) => (c.kw && c.kw[0] ? c.kw[0] : null)).filter(Boolean);

  const questions = [];

  chapters.forEach((chapter, index) => {
    const points = (chapter.pts || []).map(cleanPoint).filter(Boolean);
    if (!points.length) return;
    const seed = hash(`${classNo}-${subjectId}-${chapter.t}-${index}`);

    const mcq1 = makeMcqFromPoints(chapter.t, points, allPoints, seed);
    if (mcq1) {
      questions.push({
        id: `${classNo}-${subjectId}-${index}-m1`,
        chapter: chapter.t,
        source: 'practice',
        ...mcq1
      });
    }

    const kwMcq = makeKeywordMcq(chapter.t, chapter.kw && chapter.kw[0], allKw, seed + 3);
    if (kwMcq) {
      questions.push({
        id: `${classNo}-${subjectId}-${index}-m2`,
        chapter: chapter.t,
        source: 'practice',
        ...kwMcq
      });
    }

    points.forEach((point, pIndex) => {
      questions.push({
        id: `${classNo}-${subjectId}-${index}-w${pIndex}`,
        chapter: chapter.t,
        type: 'write',
        source: 'practice',
        q: `अध्याय "${chapter.t}" के संदर्भ में समझाइए: ${point}`,
        ans: `${point}। यह बिंदु अध्याय "${chapter.t}" का मुख्य निष्कर्ष है।`,
        writeHint: 'परिभाषा देकर उदाहरण जोड़ें।'
      });
    });

    questions.push({
      id: `${classNo}-${subjectId}-${index}-summary`,
      chapter: chapter.t,
      type: 'write',
      source: 'practice',
      q: `अध्याय "${chapter.t}" के मुख्य बिंदु लिखिए।`,
      ans: `${chapter.t}: ${points.join('; ')}`,
      writeHint: 'प्रत्येक बिंदु को एक वाक्य में लिखें।'
    });
  });

  return questions;
};

// ---- Notes for 9 / 11 / 12 (same shape as class 10 notes.js) -----
const buildNotes = (chapters) =>
  chapters.map((chapter, index) => {
    const points = (chapter.pts || []).map(cleanPoint);
    const details = [
      ...points.map((p) => `${p}। इस बिंदु को उदाहरण सहित समझाने पर अंक पूरे मिलते हैं।`),
      `📌 ${chapter.t} — पुनरावृत्ति सुझाव: इस अध्याय का सार लिखकर 2-3 सप्ताह बाद दोबारा देखें।`
    ];
    return {
      title: chapter.t,
      colors: {
        title: ['#e11d48', '#0ea5e9', '#16a34a', '#9333ea'][index % 4],
        points: '#94a3b8'
      },
      points: points.map((p) => `• ${p}`),
      details
    };
  });

// ============================================================
//  Public API of this module
// ============================================================

const isValidClass = (value) => {
  const n = Number(value);
  return CLASSES.includes(n);
};

const normaliseClass = (value) => (isValidClass(value) ? Number(value) : null);

const classLabel = (classNo) => {
  if (classNo === 10) return { label: 'कक्षा 10', labelEn: 'Class 10', board: 'JAC / NCERT' };
  const entry = SYLLABUS[classNo];
  return entry ? { label: entry.label, labelEn: entry.labelEn, board: entry.board } : null;
};

const getSubjectMeta = (classNo) => {
  if (classNo === 10) {
    return Object.entries(CLASS10_SUBJECTS).map(([id, meta]) => ({ id, ...meta, nameEn: meta.name, source: 'board' }));
  }
  const entry = SYLLABUS[classNo];
  if (!entry) return [];
  return Object.entries(entry.subjects).map(([id, subject]) => ({
    id,
    name: subject.name,
    nameEn: subject.nameEn,
    emoji: subject.emoji,
    color: subject.color,
    desc: subject.desc,
    source: 'practice'
  }));
};

// Outline hamesha regenerate na karein — baar baar buildPracticeQuestions() chalaana
// heavy hota hai. Sirf ek baar banake cache karo (content build time par static hai).
const outlineCache = {};

const buildClassOutline = (classNo) => {
  const n = normaliseClass(classNo);
  if (!n) return null;

  const meta = getSubjectMeta(n);
  const data = n === 10 ? readClass10Data() : null;

  return {
    class: n,
    ...classLabel(n),
    subjects: meta.map((subject) => {
      const chapters =
        n === 10
          ? (data[subject.id]?.chapters || []).map((title) => ({ title, notes: null }))
          : (SYLLABUS[n].subjects[subject.id]?.chapters || []).map((chapter) => ({
              title: chapter.t,
              keywords: chapter.kw || [],
              points: chapter.pts || []
            }));
      // Homepage stats ke liye bhi question count chahiye, bina pura
      // question payload download kiye — warna class 10 par 1.65 MB load hota hai.
      const questionCount =
        n === 10
          ? (data[subject.id]?.questions?.length || 0)
          : buildPracticeQuestions(n, subject.id, SYLLABUS[n].subjects[subject.id]).length;
      return {
        ...subject,
        chapters,
        chapterCount: chapters.length,
        questionCount
      };
    })
  };
};

/** Light-weight list: subjects + chapter titles + counts (cached). */
const getClassOutline = (classNo) => {
  const n = normaliseClass(classNo);
  if (!n) return null;
  if (!outlineCache[n]) outlineCache[n] = buildClassOutline(n);
  return outlineCache[n];
};

/** Notes for one subject - class 10 ke liye rich notes.js, baaki ke liye generated. */
const getSubjectNotes = (classNo, subjectId) => {
  const n = normaliseClass(classNo);
  if (!n || !subjectId) return null;

  if (n === 10) {
    const notes = readClass10Notes()[subjectId];
    return notes ? { subject: subjectId, source: 'board', notes } : { subject: subjectId, source: 'board', notes: [] };
  }

  const subject = SYLLABUS[n]?.subjects?.[subjectId];
  if (!subject) return null;
  return { subject: subjectId, source: 'practice', notes: buildNotes(subject.chapters || []) };
};

/** Full question bank for one subject. */
const getSubjectQuestions = (classNo, subjectId) => {
  const n = normaliseClass(classNo);
  if (!n || !subjectId) return null;

  if (n === 10) {
    const data = readClass10Data()[subjectId];
    if (!data) return null;
    return {
      class: n,
      subject: subjectId,
      source: 'board',
      chapters: data.chapters || [],
      questions: (data.questions || []).map((q) => ({ ...q, source: 'board' }))
    };
  }

  const subject = SYLLABUS[n]?.subjects?.[subjectId];
  if (!subject) return null;
  return {
    class: n,
    subject: subjectId,
    source: 'practice',
    chapters: (subject.chapters || []).map((c) => c.t),
    questions: buildPracticeQuestions(n, subjectId, subject)
  };
};

/** Small payload the study site loader needs in one go. */
const getClassBundle = (classNo) => {
  const n = normaliseClass(classNo);
  if (!n) return null;
  const data = n === 10 ? readClass10Data() : null;
  const subjects = {};

  getSubjectMeta(n).forEach((meta) => {
    if (n === 10) {
      const entry = data[meta.id] || { chapters: [], questions: [] };
      subjects[meta.id] = {
        name: meta.name,
        nameEn: meta.nameEn,
        emoji: meta.emoji,
        color: meta.color,
        desc: meta.desc,
        source: meta.source,
        chapters: entry.chapters || [],
        questions: entry.questions || []
      };
    } else {
      const subject = SYLLABUS[n].subjects[meta.id];
      subjects[meta.id] = {
        name: meta.name,
        nameEn: meta.nameEn,
        emoji: meta.emoji,
        color: meta.color,
        desc: meta.desc,
        source: meta.source,
        chapters: (subject.chapters || []).map((c) => c.t),
        questions: buildPracticeQuestions(n, meta.id, subject)
      };
    }
  });

  return { class: n, ...classLabel(n), subjects };
};

const listClasses = () =>
  CLASSES.map((n) => {
    const label = classLabel(n);
    const meta = getSubjectMeta(n);
    const totalChapters = meta.reduce((sum, subject) => {
      if (n === 10) return sum + (readClass10Data()[subject.id]?.chapters?.length || 0);
      return sum + (SYLLABUS[n].subjects[subject.id]?.chapters?.length || 0);
    }, 0);
    return { class: n, ...label, subjectCount: meta.length, chapterCount: totalChapters };
  });

/**
 * Class 10 ke original chapter titles Hindi me hain aur unme keywords nahi hain.
 * Students English ya romanised Hindi me puchte hain ("light reflection"),
 * isliye common board terms ka chhota cross-language bridge.
 * Value = title me dhoondhne wale Hindi substrings.
 */
const TERM_ALIASES = {
  light: ['प्रकाश'],
  ray: ['किरण', 'किरणें'],
  reflection: ['परावर्तन', 'परावर्तन'],
  refraction: ['अपवर्तन'],
  lens: ['लेंस'],
  mirror: ['दर्पण', 'दर्पण'],
  electricity: ['विद्युत'],
  electric: ['विद्युत', 'विधुत'],
  current: ['धारा'],
  magnetic: ['चुंबक', 'चुम्बक'],
  heat: ['ऊष्मा', 'उष्मा'],
  energy: ['ऊर्जा'],
  source: ['स्रोत', 'स्रोत'],
  acid: ['अम्ल', 'तेज़ब', 'तेजाब'],
  base: ['क्षार', 'क्षारक'],
  salt: ['लवण', 'नमक'],
  chemical: ['रासायनिक', 'रसायनिक'],
  reaction: ['अभिक्रिया', 'अभिक्रियाएं'],
  periodic: ['आवर्त'],
  table: ['सारणी', 'तालिका'],
  carbon: ['कार्बन'],
  hydrogen: ['हाइड्रोजन', 'हाइड्रोजन'],
  oxygen: ['ऑक्सीजन', 'ऑक्सीजन'],
  water: ['जल', 'पानी'],
  tissue: ['उत्तक', 'ऊतक'],
  cell: ['कोशिका', 'कोशिकाएं'],
  plant: ['पौध', 'पौधे', 'वनस्पति'],
  organ: ['अंग', 'अंगों'],
  blood: ['रक्त'],
  heart: ['हृदय'],
  nutrition: ['पोषण'],
  food: ['भोजन', 'खाद्य'],
  disease: ['रोग', 'बीमारी'],
  algebra: ['बीजगणित', 'बीज गणित'],
  trigonometry: ['त्रिकोणमिति'],
  coordinate: ['निर्देशांक'],
  geometry: ['ज्यामिति'],
  surface: ['पृष्ठ', 'उप-surface'],
  area: ['क्षेत्रफल', 'क्षेत्र'],
  volume: ['आयतन'],
  circle: ['वृत्त', 'वृत्त'],
  triangle: ['त्रिभुज'],
  rightangle: ['समकोण'],
  polynomial: ['बहुपद'],
  quadratic: ['द्विघात'],
  sequence: ['अनुक्रम'],
  probability: ['प्रायिकता'],
  statistics: ['सांख्यिकी', 'आंकिकी'],
  matrix: ['मैट्रिक्स', 'आव्यूह'],
  vector: ['सदिश'],
  gravitation: ['गुरुत्वाकर्षण', 'गुरुत्व'],
  rotation: ['घूर्णन', 'परिभ्रमण'],
  motion: ['गति', 'चाल'],
  force: ['बल'],
  friction: ['घर्षण'],
  pressure: ['दाब'],
  density: ['घनत्व'],
  work: ['कार्य', 'ऊर्जा'],
  power: ['शक्ति'],
  ohm: ['ओम'],
  resistance: ['प्रतिरोध'],
  series: ['श्रेणी', 'श्रेणीक्रम'],
  parallel: ['पार्श्व'],
  independence: ['स्वतंत्रता'],
  revolution: ['क्रांति', 'गणतंत्र'],
  constitution: ['संविधान', 'सविधान'],
  democracy: ['लोकतंत्र', 'लोकतान्त्र'],
  parliament: ['संसद', 'लोकसभा'],
  economy: ['अर्थव्यवस्था'],
  inflation: ['मुद्रास्फीति', 'मुद्रा'],
  budget: ['बजट'],
  development: ['विकास'],
  population: ['जनसंख्या'],
  map: ['मानचित्र'],
  river: ['नदी'],
  climate: ['जलवायु'],
  soil: ['मिट्टी', 'मृदा'],
  resources: ['संसाधन'],
  // Literature
  kavita: ['कविता', 'कविताएं'],
  kahani: ['कहानी', 'कहानियां', 'गद्य'],
  novel: ['उपन्यास'],
  drama: ['नाटक'],
  letter: ['पत्र', 'पत्राचार']
};

/** Title+subject se searchable keywords (class 10 ke liye alias se). */
const deriveKeywords = (title, subjectName) => {
  const hay = `${title} ${subjectName}`.toLowerCase();
  const found = new Set();
  for (const [key, needles] of Object.entries(TERM_ALIASES)) {
    if (needles.some((needle) => hay.includes(needle.toLowerCase()))) found.add(key);
  }
  return Array.from(found);
};

/** AI / search ke liye flat searchable index. */
const searchIndex = (classNo) => {
  const outline = getClassOutline(classNo);
  if (!outline) return [];
  const rows = [];
  outline.subjects.forEach((subject) => {
    subject.chapters.forEach((chapter) => {
      const keywords = chapter.keywords && chapter.keywords.length
        ? chapter.keywords
        : deriveKeywords(chapter.title, subject.name);
      rows.push({
        class: outline.class,
        subject: subject.id,
        subjectName: subject.name,
        title: chapter.title,
        points: chapter.points || [],
        keywords
      });
    });
  });
  return rows;
};

module.exports = {
  CLASSES,
  isValidClass,
  normaliseClass,
  classLabel,
  listClasses,
  getSubjectMeta,
  getClassOutline,
  getSubjectNotes,
  getSubjectQuestions,
  getClassBundle,
  searchIndex
};
