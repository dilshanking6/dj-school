// ============================================================
//  AI TUTOR ENGINE
//  Server par chalta hai, browser nahi — isliye:
//   * koi API key browser tak nahi jaati
//   * har user ke liye class/subject context lock ho sakta hai
//   * rate limit aur logging ek jagah
//
//  Do mode:
//   1) PROVIDER (recommended) — koi bhi OpenAI-compatible chat endpoint.
//      Env: AI_API_KEY, AI_API_URL (default OpenAI), AI_MODEL.
//   2) LOCAL (default) — school ke apne syllabus + calculator par chalta hai.
//      Ye ChatGPT ka replacement nahi hai, par exam-oriented tutor hai aur
//      key chahiye nahi. Ismein bataya bhi jaata hai.
// ============================================================

const { CLASSES, isValidClass, getClassOutline, getSubjectNotes, getSubjectQuestions, searchIndex } = require('./studyContent');

const MAX_HISTORY = 12;

// ------------------------------------------------------------
//  Provider (LLM) — optional
// ------------------------------------------------------------

const providerKey = () => process.env.AI_API_KEY || '';
const providerUrl = () => process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions';
const providerModel = () => process.env.AI_MODEL || 'gpt-4o-mini';

const providerEnabled = () => Boolean(providerKey());

/** Ek hi user ko ek hi minute me kitni calls. */
const RATE = { windowMs: 60 * 1000, max: Number(process.env.AI_RATE_MAX || 20) };
const rateHits = new Map();

const rateAllow = (key) => {
  const now = Date.now();
  const entry = rateHits.get(key);
  if (!entry || now - entry.start > RATE.windowMs) {
    rateHits.set(key, { start: now, count: 1 });
    return true;
  }
  if (entry.count >= RATE.max) return false;
  entry.count += 1;
  return true;
};

// Prune stale keys so the map cannot grow forever.
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateHits) {
    if (now - entry.start > RATE.windowMs * 2) rateHits.delete(key);
  }
}, RATE.windowMs).unref?.();

// ------------------------------------------------------------
//  System prompt
// ------------------------------------------------------------

const CLASS_CONTEXT = {
  9: 'Class 9 (JAC/NCERT). Reach for Matter in Our Surroundings, Cells, Tissues, Motion, Force, etc.',
  10: 'Class 10 (JAC board). The school has 3000 real board questions for this class — prefer them.',
  11: 'Class 11 (JAC/NCERT). Commerce-leaning science stream, plus maths.',
  12: 'Class 12 (JAC/NCERT). Accountancy, Economics, Business Studies plus PCB.'
};

const buildSystemPrompt = ({ user, classNo }) => {
  const role = user ? user.role : 'visitor';
  const cls = isValidClass(classNo) ? Number(classNo) : null;

  return [
    `You are the AI tutor for Janta +2 High School, Khalari, Jharkhand. You are built into the school portal.`,
    role === 'visitor'
      ? 'The visitor is not signed in. Keep answers short and school-focused, and point them to Create account / Sign in for portal data.'
      : `The signed-in user is a ${role}${cls ? ` in class ${cls}` : ''}. Use their class level for examples.`,
    cls ? CLASS_CONTEXT[cls] : '',
    'Rules you never break:',
    '- Explain in simple Hinglish (Devanagari ok), short paragraphs and bullets. Student-friendly.',
    '- Never invent marks, attendance numbers, board dates or official notifications.',
    '- If you do not know, say so plainly and suggest asking the subject teacher.',
    '- For maths: show the steps, then the final answer in bold.',
    '- Be brief. 3-6 short bullets unless the student asks for full detail.'
  ]
    .filter(Boolean)
    .join('\n');
};

// ------------------------------------------------------------
//  Syllabus context — real chapter data inject karo
// ------------------------------------------------------------

const SUBJECT_WORDS = [
  ['maths', ['math', 'maths', 'mathematics', 'गणित', 'गणिका', 'algebra', 'गणित कक्षा']],
  ['physics', ['physics', 'भौतिक', 'भौतिकी', 'mechanics', 'motion', 'force', 'physics class']],
  ['chemistry', ['chemistry', 'रसायन', 'रसायनशास्त्र', 'chemical', 'reaction', 'acid']],
  ['biology', ['biology', 'जीव', 'जीव विज्ञान', 'जीवविज्ञान', 'cell', 'तंत्र', 'plant', 'human']],
  ['hindi', ['hindi', 'हिंदी', 'हिन्दी', 'गद्य', 'कविता', 'साहित्य']],
  ['english', ['english', 'इंग्लिश', 'अंग्रेज़ी', 'grammar', 'prose', 'poem']],
  ['history', ['history', 'इतिहास', 'इतिहास में', 'युद्ध', 'क्रांति', 'national movement']],
  ['geography', ['geography', 'भूगोल', 'मानचित्र', 'map', 'नदी', 'जलवायु']],
  ['civics', ['civics', 'civics', 'राजनीति', 'संविधान', 'polity', 'democracy', 'संसद']],
  ['economics', ['economics', 'अर्थशास्त्र', 'अर्थव्यवस्था', 'मुद्रा', 'gdp', 'demand', 'मार्केट']]
];

const detectSubject = (text) => {
  const lower = text.toLowerCase();
  for (const [id, words] of SUBJECT_WORDS) {
    if (words.some((w) => lower.includes(w))) return id;
  }
  return null;
};

const detectClass = (text) => {
  const lower = text.toLowerCase();
  for (const c of CLASSES) {
    if (
      new RegExp(`(class|कक्षा|cls|std)\\s*(-|_)?\\s*${c}\\b`).test(lower) ||
      new RegExp(`\\b${c}\\s*(th|st|nd|rd)\\b`).test(lower)
    ) {
      return c;
    }
  }
  const m = lower.match(/\b(9|10|11|12)\b/);
  if (m) return Number(m[1]);
  return null;
};

// Sine se nahi aate — inhe chapter matching me count nahi karna.
const STOPWORDS = new Set([
  'class', 'std', 'subject', 'syllabus', 'chapter', 'chapters', 'adhyay',
  'explain', 'samjhao', 'samjha', 'karo', 'karna', 'batao', 'bataye', 'bata',
  'ka', 'ki', 'ke', 'kya', 'hai', 'hain', 'ho', 'tha', 'please', 'help',
  'mere', 'mera', 'mujhe', 'kisi', 'chahiye', 'chahye', 'kuchh', 'kuch',
  'samjh', 'kar', 'kro', 'kr', 'do', 'dena', 'detail', 'details', 'mein',
  'me', 'se', 'par', 'for', 'the', 'and', 'this', 'that', 'what', 'how',
  'why', 'tell', 'give', 'about', 'from', 'with', 'your', 'you', 'are', 'was',
  'mat', 'nahi', 'nahin', 'kya', 'kahan', 'kidhar', 'jaldi', 'abhi'
]);

/** Hindi/English text ko shabd me todo, punctuation hatao. */
const tokenise = (text) =>
  String(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);

/** Stopwords nikal ke "sirf searchable shabd". */
const contentWords = (text) => tokenise(text).filter((w) => w.length > 2 && !STOPWORDS.has(w));

/**
 * Word-level match — substring nahi.
 * Warna "light" → "enlightenment" se galat chapter mil jaata tha.
 */
const wordMatch = (word, haystackWords) => {
  if (haystackWords.includes(word)) return true;
  // Chhoti stem ke liye prefix match (>=4 chars), jaise "photo" → "photosynthesis"
  if (word.length >= 4) {
    return haystackWords.some((hw) => hw.length >= 4 && (hw.startsWith(word) || word.startsWith(hw)));
  }
  return false;
};

/** Syllabus se sabse kareeb chapter + uske points. */
const lookupChapter = (query, classNo) => {
  const wanted = isValidClass(classNo) ? Number(classNo) : null;
  const classes = wanted ? [wanted] : CLASSES;
  const words = contentWords(query);
  if (!words.length) return null;

  const subject = detectSubject(query);
  let best = null;
  let bestScore = 0;

  for (const cls of classes) {
    for (const row of searchIndex(cls)) {
      const haystackWords = tokenise(`${row.title} ${row.keywords.join(' ')} ${row.subjectName}`);
      const haystack = haystackWords.join(' ');
      let score = 0;
      let matched = 0;
      for (const word of words) {
        if (wordMatch(word, haystackWords)) {
          matched += 1;
          score += word.length > 4 ? 2 : 1;
        }
      }
      // Poora topic-match (saare words mile) ko extra weight
      if (words.every((w) => haystack.includes(w))) score += 3;
      if (subject && row.subject === subject) score += 3;
      // Sirf subject match kaafi nahi — kam se kam ek asli shabd chahiye,
      // warna "class 10 maths ke practice questions" par ek random chapter mil jata tha
      if (score > bestScore && matched >= 1) {
        bestScore = score;
        best = { ...row, score, matched };
      }
    }
  }

  return bestScore >= 3 ? best : null;
};

// ------------------------------------------------------------
//  Local calculator — real maths solving
// ------------------------------------------------------------

const FACTORS = [
  ['√', (n) => Math.sqrt(n)],
  ['cube root', (n) => Math.cbrt(n)],
  ['^', (n) => n ** (1 / 3)]
];

const round = (n, dp = 4) => {
  if (!Number.isFinite(n)) return null;
  const r = Number(n.toFixed(dp));
  return Object.is(r, -0) ? 0 : r;
};

const cleanNumber = (n) => {
  if (n === null) return '?';
  if (Number.isInteger(n)) return String(n);
  return String(round(n, 4));
};

/** Surd simplification: sqrt(50) -> 5*sqrt(2) */
const simplifySqrt = (n) => {
  if (n < 0) return null;
  let outside = 1;
  let inside = Math.floor(n);
  for (let i = 2; i * i <= inside; i += 1) {
    while (inside % (i * i) === 0) {
      inside /= i * i;
      outside *= i;
    }
  }
  return { outside, inside };
};

/** Percentage: "15% of 240", "240 ka 15%", "240 का 15 प्रतिशत", "increase 200 by 10%" */
const tryPercent = (text) => {
  const plain = text.toLowerCase();
  const patterns = [
    // 15% of 240  /  240 ka 15%  /  240 का 15 प्रतिशत
    /(\d+(?:\.\d+)?)\s*%\s*(?:of|ka|का)\s*(\d+(?:\.\d+)?)/,
    /(\d+(?:\.\d+)?)\s*(?:of|ka|का)\s*(\d+(?:\.\d+)?)\s*%/,
    /(\d+(?:\.\d+)?)\s*का\s*(\d+(?:\.\d+)?)\s*प्रतिशत/,
    // 15 percent of 80  /  15 prosent of 80
    /(\d+(?:\.\d+)?)\s*(?:percent|prosent|prashat)\s*(?:of|ka|का)\s*(\d+(?:\.\d+)?)/,
    // of 240 ka 15%  (percentage second)
    /(?:of|ka|का)\s*(\d+(?:\.\d+)?)\s*(?:ka|का|of)\s*(\d+(?:\.\d+)?)\s*(?:%|percent|prosent)/,
    // 80 ka 12 percent  (base first, percentage second, word form)
    /(\d+(?:\.\d+)?)\s*(?:ka|का)\s*(\d+(?:\.\d+)?)\s*(?:percent|prosent)/
  ];
  let pct = null;
  let base = null;
  for (const re of patterns) {
    const m = plain.match(re);
    if (m) {
      // Group order: pehla group hi hamesha percentage hota hai
      // (patterns is tarah likhi hain).
      pct = Number(m[1]);
      base = Number(m[2]);
      break;
    }
  }
  if (pct === null || base === null) return null;
  if (!Number.isFinite(pct) || !Number.isFinite(base)) return null;

  const value = (pct / 100) * base;
  return {
    label: `${pct}% of ${base}`,
    steps: [`${pct}/100 × ${base} = ${cleanNumber(value)}`],
    answer: `${cleanNumber(value)}`
  };
};

/** LCM / HCF from a list of numbers. */
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const lcm = (a, b) => (a * b) / gcd(a, b);

const tryHcf = (text) => {
  const lower = text.toLowerCase();
  if (!/\b(hcf|gcd|highest common factor|सर्वाधिक समान|महत्तम समापवर्तक)\b/.test(lower)) return null;
  const nums = (lower.match(/\d+/g) || []).map(Number).filter((n) => n > 0);
  if (nums.length < 2) return null;
  const result = nums.reduce(gcd);
  return {
    label: `HCF of ${nums.join(', ')}`,
    steps: [`HCF(${nums.join(', ')}) = ${result}`],
    answer: String(result)
  };
};

const tryLcm = (text) => {
  const lower = text.toLowerCase();
  if (!/\b(lcm|least common multiple|न्यूनतम समापवर्त्य|लघुत्तम समापवर्त्य)\b/.test(lower)) return null;
  const nums = (lower.match(/\d+/g) || []).map(Number).filter((n) => n > 0);
  if (nums.length < 2) return null;
  const result = nums.reduce(lcm);
  return {
    label: `LCM of ${nums.join(', ')}`,
    steps: [`LCM(${nums.join(', ')}) = ${result}`],
    answer: String(result)
  };
};

/** Quadratic: solve x^2 -5x +6 = 0 */
const tryQuadratic = (text) => {
  const m = text
    .toLowerCase()
    .replace(/\s+/g, '')
    .match(/(-?\d*\.?\d*)x\^?2([+-]\d*\.?\d*)x?([+-]\d*\.?\d+)=0/);
  if (!m) return null;

  const parse = (raw) => (raw === '' || raw === '+' || raw === undefined ? null : Number(raw));
  let a = parse(m[1]);
  const b = parse(m[2]);
  const cRaw = m[3];
  if (a === null) a = 1;
  if (cRaw === undefined) return null;
  const c = Number(cRaw);
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c) || a === 0) return null;

  const disc = b * b - 4 * a * c;
  const steps = [
    `a = ${a}, b = ${b === null ? 0 : b}, c = ${c}`,
    `D = b² − 4ac = ${disc}`
  ];

  if (disc === 0) {
    const x = -b / (2 * a);
    steps.push(`D = 0, so one repeated root: x = −b/2a = ${cleanNumber(x)}`);
    return { label: 'Quadratic roots', steps, answer: `x = ${cleanNumber(x)} (repeated)` };
  }
  if (disc < 0) {
    const r = round(Math.sqrt(-disc));
    steps.push('D < 0, so no real roots (complex roots only)');
    return { label: 'Quadratic roots', steps, answer: 'No real roots' };
  }

  const root = Math.sqrt(disc);
  const x1 = (-b + root) / (2 * a);
  const x2 = (-b - root) / (2 * a);
  steps.push(`x = (−b ± √D)/2a`);
  steps.push(`x₁ = ${cleanNumber(x1)}`);
  steps.push(`x₂ = ${cleanNumber(x2)}`);
  return { label: 'Quadratic roots', steps, answer: `x = ${cleanNumber(x1)} or ${cleanNumber(x2)}` };
};

/** Simple equation solve: "solve 3x + 5 = 20" */
const tryEquation = (text) => {
  const m = text
    .toLowerCase()
    .replace(/\s+/g, '')
    .match(/^(?:solve\s*)?(-?\d*\.?\d*)x([+-]\d*\.?\d*)=(-?\d*\.?\d*)$/);
  if (!m) return null;
  const a = m[1] === '' || m[1] === '+' ? 1 : Number(m[1]);
  const b = m[2] === '' || m[2] === '+' ? 0 : Number(m[2]);
  const c = m[3] === '' || m[3] === '-' ? 0 : Number(m[3]);
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c) || a === 0) return null;
  const x = (c - b) / a;
  return {
    label: 'Equation',
    steps: [`${a}x + (${b}) = ${c}`, `${a}x = ${c} − (${b}) = ${cleanNumber(c - b)}`, `x = ${cleanNumber(x)}`],
    answer: `x = ${cleanNumber(x)}`
  };
};

/** Square root / cube root of a plain number. */
const tryRoot = (text) => {
  const lower = text.toLowerCase();

  // "sqrt 50", "√50", "square root of 50", "वर्गमूल 50"
  let m =
    lower.match(/(?:square\s*root|sqrt|वर्गमूल)\s*(?:of\s*)?(\d+(?:\.\d+)?)/) ||
    lower.match(/√\s*(\d+(?:\.\d+)?)/);
  if (m) {
    const n = Number(m[1]);
    if (Number.isInteger(n) && n >= 0) {
      const s = simplifySqrt(n);
      if (s.outside === 1 && s.inside === 1) {
        return {
          label: `√${n}`,
          steps: [`${n} = ${Math.sqrt(n)}², so it is a perfect square`],
          answer: String(Math.sqrt(n))
        };
      }
      if (s.inside > 1) {
        return {
          label: `√${n}`,
          steps: [`${n} = ${s.outside}² × ${s.inside}`, `√${n} = ${s.outside}√${s.inside}`, `≈ ${cleanNumber(Math.sqrt(n))}`],
          answer: `${s.outside}√${s.inside}`
        };
      }
      return { label: `√${n}`, steps: [`√${n} ≈ ${cleanNumber(Math.sqrt(n))}`], answer: cleanNumber(Math.sqrt(n)) };
    }
    return { label: `√${n}`, steps: [`√${n} ≈ ${cleanNumber(Math.sqrt(n))}`], answer: cleanNumber(Math.sqrt(n)) };
  }

  // "cube root 27", "∛27", "घनमूल 27"
  m =
    lower.match(/(?:cube\s*root|cuberoot|cbrt|घनमूल)\s*(?:of\s*)?(\d+(?:\.\d+)?)/) ||
    lower.match(/∛\s*(\d+(?:\.\d+)?)/);
  if (m) {
    const n = Number(m[1]);
    return {
      label: `∛${n}`,
      steps: [`∛${n} ≈ ${cleanNumber(Math.cbrt(n))}`],
      answer: cleanNumber(Math.cbrt(n))
    };
  }

  m = lower.match(/(\d+)\s*\^\s*(-?\d+)/);
  if (m) {
    const value = Number(m[1]) ** Number(m[2]);
    return {
      label: `${m[1]}^${m[2]}`,
      steps: [`${m[1]}^${m[2]} = ${cleanNumber(value)}`],
      answer: cleanNumber(value)
    };
  }
  return null;
};

/** Basic arithmetic from a safe evaluation. */
const tryArithmetic = (text) => {
  const expr = text
    .toLowerCase()
    .replace(/[^0-9+\-*/().^%\s√×÷]/g, ' ')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/√/g, 'Math.sqrt')
    .trim();

  if (!/[0-9]/.test(expr) || !/[+\-*/^]/.test(expr)) return null;
  if (expr.length > 120) return null;
  // Sirf digits aur operators — koi variable/identifier nahi.
  if (!/^[\d\s+\-*/().^Math.sqrt]*$/.test(expr)) return null;
  if (!/\d\s*[+\-*/^]|[+\-*/^]\s*\d/.test(expr)) return null;

  let value;
  try {
    // eslint-disable-next-line no-new-func
    value = Function(`"use strict"; return (${expr});`)();
  } catch {
    return null;
  }
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;

  const surd = simplifySqrt(value);
  return {
    label: expr,
    steps: [`${expr} = ${cleanNumber(value)}`],
    answer: cleanNumber(value),
    note: surd && surd.outside > 1 && surd.inside > 1 && Number.isInteger(value) && value > 0
      ? `= ${surd.outside}√${surd.inside}`
      : undefined
  };
};

const MATH_TRIGGERS = [
  'calculate', 'solve', 'what is', 'find', 'compute', 'evaluate', 'result of',
  'गणना', 'हल', 'निकाल', 'बताओ', 'फल', '=', '√', '∛', 'sqrt', 'वर्गमूल', 'घनमूल',
  'lcm', 'hcf', 'gcd', 'percentage', 'प्रतिशत', '%'
];

/** Jo bhi maths expression ko invoke karta hai. */
const looksLikeMath = (text) => {
  const lower = text.toLowerCase();
  const hasOperator = /[+\-*/^=]|\d\s*[+\-*/^]/.test(lower);
  const hasMathWord = MATH_TRIGGERS.some((w) => lower.includes(w));
  if (!hasMathWord) return false;
  // Symbol ke bina: sirf tab jab maths word + number dono hon
  if (!hasOperator) return /\d/.test(lower);
  return true;
};

const solveMath = (text) => {
  const attempts = [tryQuadratic, tryEquation, tryPercent, tryLcm, tryHcf, tryRoot, tryArithmetic];
  for (const attempt of attempts) {
    let result = null;
    try {
      result = attempt(text);
    } catch {
      result = null;
    }
    if (result) return result;
  }
  return null;
};

// ------------------------------------------------------------
//  Portal navigation (local, no data invented)
// ------------------------------------------------------------

const PORTAL = {
  attendance: {
    student: 'Apne portal me **Attendance** section kholo — wahan har din ka present/absent aur running percentage dikhta hai.',
    teacher: 'Apne portal me **Attendance** section se apni class ki register date-wise mark karo.',
    principal: '**Attendance** section se kisi bhi class ki puri register dekh sakte ho.',
    admin: '**Attendance** section se kisi bhi class ka record dekho.',
    guest: 'Attendance apne portal me hai — **Sign in** karo, phir sidebar me Attendance khul jayega.'
  },
  result: {
    student: 'Apne portal me **Results** section kholo — subject-wise marks aur overall average wahi dikhta hai.',
    teacher: 'Apne portal me **Results** section se class ke marks publish karo.',
    principal: '**Results** section se kisi bhi class ka result aur average dekho.',
    admin: '**Results** section se published results dekho.',
    guest: 'Results apne portal me hain — **Sign in** karo.'
  },
  homework: {
    student: 'Apne portal me **Study Material** section kholo — teacher ka homework aur notes wahi milte hain.',
    teacher: 'Apne portal me **Study Material** section se notes aur homework upload karo.',
    principal: '**Study Material** section se dekho ki kaunsi class ko kya diya gaya hai.',
    admin: '**Study Material** section se uploaded material dekho.',
    guest: 'Homework apne portal me hota hai — **Sign in** karo.'
  },
  event: {
    default: '**Events** section me functions, sports aur exam ka schedule hai. Sidebar se wahan ja sakte ho.',
    guest: 'School ka event schedule **Events** section me hai — apne portal me dekhne ke liye Sign in karo.'
  },
  complaint: {
    student: 'Apne portal me **Complaints** section se apni shikayat bhejo — school office ko turant mil jayegi.',
    principal: '**Complaints** section aapke desk par hai — sab complaints yahi resolve hoti hain.',
    admin: '**Complaints** section se sab complaints dekh sakte ho.',
    guest: 'Shikayat bhejne ke liye apne portal me **Complaints** section use karo.'
  },
  rate: {
    student: 'Apne portal me **Rate Teachers** section se har teacher ko ek baar rating de sakte ho.',
    default: 'Teacher rating sirf students kar sakte hain — apne portal me **Rate Teachers** section dekho.'
  },
  settings: {
    default: '**Settings** section se apni details, photo aur password badal sakte ho.',
    guest: 'Apni details badalne ke liye **Sign in** karke Settings kholo.'
  },
  study: {
    default: 'Sidebar me **Study Hub** ka button hai — wahin se apni class ke chapters, notes aur quiz milte hain.',
    guest: 'School ki public study website par kisi bhi class ke chapters padh sakte ho. Sign in karke apni class ka Study Hub bhi milta hai.'
  }
};

const PORTAL_KEYWORDS = [
  // 'study' sirf tab — 'chapter'/'book' jaise shabd se NAHI, warna
  // "class 10 ke chapters batao" par galat portal reply chala jaata tha
  ['study', ['study hub', 'study material', 'study website', 'padhai kahan', 'पढ़ाई कहाँ']],
  ['attendance', ['attendance', 'present', 'absent', 'उपस्थिति']],
  ['result', ['result', 'marks', 'score', 'percentage', 'अंक', 'परिणाम']],
  ['homework', ['homework', 'assignment', 'home work', 'सवाल दिया']],
  ['event', ['event', 'function', 'sports', 'exam date', 'कार्यक्रम']],
  ['complaint', ['complaint', 'shikayat', 'शिकायत']],
  ['rate', ['rate', 'rating', 'feedback', 'teacher ko rate']],
  ['settings', ['password', 'settings', 'profile', 'photo change']]
];

const detectPortal = (text) => {
  const lower = text.toLowerCase();
  for (const [key, words] of PORTAL_KEYWORDS) {
    if (words.some((w) => lower.includes(w))) return key;
  }
  return null;
};

// ------------------------------------------------------------
//  Small talk + study suggestions
// ------------------------------------------------------------

const SMALL_TALK = [
  { match: /^(hi|hello|hey|namaste|नमस्ते|हैलो)\b/i, reply: 'Namaste! 🙏 Batao — kya padhna hai, ya portal mein kya dekhna hai?' },
  { match: /\b(thanks|thank you|shukriya|धन्यवाद|थैंक्स)\b/i, reply: 'Khushi hua! 🙏 Aur kuch ho to batao.' },
  { match: /\b(bye|goodbye|alvida)\b/i, reply: 'Alvida! Padhai acchi ho. Phir milte hain. 👋' },
  { match: /\b(who are you|what are you|tum kaun ho)\b/i, reply: 'Main is school portal ka AI tutor hoon — syllabus notes, chapter summary, quiz practice aur maths solving mein madad karta hoon.' },
  { match: /\b(are you human|robot|bot ho|insaan ho)\b/i, reply: 'Nahi, main ek AI tutor hoon. Sabse bada content school ke apne syllabus notes aur 3000 board questions se aata hai. Board ki date ya official notice ke liye school office se baat karo.' },
  { match: /\b(kya kar sakte ho|help|kya help)\b/i, reply: 'Ye sab kar sakta hoon:\n• Chapter summary aur key points (कक्षा 9–12)\n• Maths: गणना, %, LCM/HCF, quadratic, √\n• Quiz practice (class 10 ke board questions)\n• Attendance, results, homework, events kahan milein — ye batana' },
  { match: /\b(feeling|feel|bad|udaas|alone|akela|depress|tired|thak|bore|boring|yaar|dost|pressure|stress|exam.*chinta|ghabra|dar)\b/i, reply: 'Sun sakta hoon. Exam ka pressure sach me heavy lagta hai — par akele face karna zaroori nahi.\n\nChhoti shuruaat karo: aaj bas ek chapter ke notes padho aur 3 practice questions karo. Poora din nahi, bas 20 minute.\n\nAgar bahut bhaari lage ya mood bahut kharab ho, apne subject teacher ya school office se baat karna sahi step hai. Main yahan notes, chapter summary aur practice ke liye hoon.' },
  { match: /\b(how are you|kaise ho|kaisa hain tum)\b/i, reply: 'Main theek hoon, thanks for asking! 🙂 Tum batao — aaj kya padhna hai?' },
  { match: /\b(joke|funny|mazaa|hasayao| Maza)\b/i, reply: 'Ek chhota joke: teacher poochhe "chapter yaad hai?" — student: "Sir, chapter to hai, yaad nahi." 😄\n\nSerious baat: kaunsa chapter yaad karna hai? Bata do, main points aur practice questions de deta hoon.' },
  { match: /\b(motivation|inspir|protsahan|padhai kaise|concentrat)\b/i, reply: 'Simple tarika: 25 minute padhai, 5 minute break — isse 4 baar repeat karo.\n\nHar din 3 chapter ke notes + 5 practice questions. Poora din ki chinta mat karo, bas roz ka target rakho.\n\nKaunsa subject hai? Uska structure bana ke de sakta hoon.' }
];

// ------------------------------------------------------------
//  Reply builder
// ------------------------------------------------------------

const chapterAnswer = (hit, classNo) => {
  const cls = hit.class || classNo;
  const points = (hit.points || []).slice(0, 5);
  const lines = points.map((p) => `• ${String(p).replace(/^•\s*/, '')}`);
  const link = `/study/index.html?class=${cls}&subject=${hit.subject}&locked=1`;
  const head = `${hit.subjectName} — ${hit.title} (कक्षा ${cls})`;
  if (!lines.length) {
    return [
      head,
      '',
      'Is chapter ke madhya-points bundle me nahi hain, lekin Study Hub me full notes aur practice questions hain. 💡',
      '',
      `पूरे अध्याय के notes aur quiz: ${link}`
    ].join('\n');
  }
  return [
    head,
    '',
    ...lines,
    hit.keywords.length ? `\nKey terms: ${hit.keywords.slice(0, 6).join(', ')}` : '',
    '',
    `पूरे अध्याय के notes: ${link}`
  ].join('\n');
};

const practiceAnswer = (classNo, subject) => {
  const result = getSubjectQuestions(classNo, subject);
  if (!result) return null;
  const meta = getClassOutline(classNo)?.subjects.find((s) => s.id === subject);
  const label = meta ? `${meta.emoji} ${meta.name}` : subject;
  const picks = result.questions.filter((q) => q.type === 'mcq' && (q.options || []).length >= 4).slice(0, 3);
  if (!picks.length) return null;
  const lines = picks.map((q, i) => [
    `${i + 1}. ${q.q}`,
    `   ${(q.options || []).slice(0, 4).map((o, j) => `${'ABCD'[j]}) ${o}`).join('   ')}`
  ].join('\n'));
  const link = `/study/index.html?class=${classNo}&subject=${subject}&locked=1`;
  return [
    `${label} — कक्षा ${classNo} practice:`,
    '',
    ...lines,
    '',
    'Answers ke liye Study Hub me quiz mode use karo:',
    `और प्रश्न: ${link}`
  ].join('\n');
};

const suggestNext = (classNo) => {
  const outline = getClassOutline(classNo);
  if (!outline) return '';
  const total = outline.subjects.reduce((n, s) => n + s.chapterCount, 0);
  return `\n\nकक्षा ${classNo}: ${outline.subjects.length} विषय, ${total} अध्याय। कोई भी chapter name लिखो, मैं उसके points दूँगा।`;
};

/** Provider ke bina local answer. */
const localAnswer = (message, { user, classNo }) => {
  const messageClass = detectClass(message) || (isValidClass(classNo) ? Number(classNo) : null);

  for (const item of SMALL_TALK) {
    if (item.match.test(message)) return item.reply;
  }

  if (looksLikeMath(message)) {
    const solved = solveMath(message);
    if (solved) {
      return [
        `**${solved.label}**`,
        ...solved.steps.map((s) => `• ${s}`),
        solved.note ? `• ${solved.note}` : '',
        '',
        `**उत्तर: ${solved.answer}**`
      ]
        .filter(Boolean)
        .join('\n');
    }
    return 'Ye expression samajh nahi aaya. Aise likh sakte ho: "15% of 240", "solve 3x + 5 = 20", "LCM 12 18 24", "sqrt 50" ya "x^2 - 5x + 6 = 0".';
  }

  const portal = detectPortal(message);
  if (portal) {
    const entry = PORTAL[portal];
    return entry[user?.role] || entry.default || entry.guest;
  }

  const subject = detectSubject(message);
  // Practice intent chapter lookup se PEHLE check hota hai, warna
  // "class 12 chemistry ke practice questions" par ek random chapter mil jata tha
  const wantsPractice = /\b(practice|practice\s*questions|questions|quiz|test|प्रश्न|अभ्यास|mcq|objective|sov)\b/i.test(message);
  if (subject && messageClass && wantsPractice) {
    const practice = practiceAnswer(messageClass, subject);
    if (practice) return practice;
  }

  const hit = lookupChapter(message, messageClass);
  if (hit) return chapterAnswer(hit, messageClass);

  if (subject && messageClass) {
    const meta = getClassOutline(messageClass)?.subjects.find((s) => s.id === subject);
    if (meta) {
      const link = `/study/index.html?class=${messageClass}&subject=${subject}&locked=1`;
      return [
        `${meta.emoji} **${meta.name}** — कक्षा ${messageClass} (${meta.chapterCount} chapters, ${meta.questionCount} questions)`,
        '',
        'Kya chahiye?',
        '• chapter ka naam likho — main points de dunga',
        `• ya practice questions — "${messageClass} ${subject} ke practice questions" likho`,
        '',
        `Study Hub: ${link}`
      ].join('\n');
    }
  }

  if (messageClass) {
    const outline = getClassOutline(messageClass);
    const lines = (outline?.subjects || []).map((s) => `${s.emoji} ${s.name} (${s.chapterCount} chapters)`);
    return [
      `कक्षा ${messageClass} के विषय:`,
      ...lines,
      '',
      'किसी भी chapter या formula का नाम लिखो, समझा दूँगा।',
      `पूरा Study Hub: /study/index.html?class=${messageClass}`
    ].join('\n');
  }

  return [
    'Main samajh nahi paya ki exactly kya chahiye. Ye likh sakte ho:',
    '',
    '• **Chapter** — "light reflection kya hai" ya "class 10 ke chapters batao"',
    '• **Maths** — "15% of 240", "solve 3x + 5 = 20", "LCM 12 18 24", "sqrt 50"',
    '• **Quiz** — "class 10 maths ke practice questions"',
    '• **Portal** — "attendance kahan dekhein", "homework kahan hai"',
    '',
    'कक्षा 9 से 12 तक पढ़ाई, गणित हल करना aur portal guide — sab mein madad kar sakta hoon.'
  ].join('\n');
};

// ------------------------------------------------------------
//  Provider call
// ------------------------------------------------------------

const callProvider = async ({ messages, systemPrompt }) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.AI_TIMEOUT_MS || 30000));

  try {
    const response = await fetch(providerUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${providerKey()}`
      },
      body: JSON.stringify({
        model: providerModel(),
        temperature: Number(process.env.AI_TEMPERATURE || 0.4),
        messages: [{ role: 'system', content: systemPrompt }, ...messages]
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`provider ${response.status}: ${detail.slice(0, 200)}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('provider returned no content');
    return String(content);
  } finally {
    clearTimeout(timeout);
  }
};

// ------------------------------------------------------------
//  Public API
// ------------------------------------------------------------

/**
 * Ek message ka jawab.
 * @returns {{reply:string, mode:'provider'|'local', subject:string|null, class:number|null, answer:object|null}}
 */
const ask = async ({ message, history = [], user = null, classNo = null, ip = null }) => {
  const clean = String(message || '').trim().slice(0, 2000);
  if (!clean) {
    const error = new Error('Message is empty');
    error.status = 400;
    throw error;
  }

  const subject = detectSubject(clean);
  const askedClass = detectClass(clean) || (isValidClass(classNo) ? Number(classNo) : null);
  // Anonymous users sab ek saath na gine jaayein — IP per bucket.
  const rateKey = user?.id || (ip ? `ip:${ip}` : 'anon');

  if (!rateAllow(rateKey)) {
    const error = new Error('Too many messages. Ek minute ruko phir try karo.');
    error.status = 429;
    throw error;
  }

  const systemPrompt = buildSystemPrompt({ user, classNo: askedClass });
  const trimmedHistory = (Array.isArray(history) ? history : [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

  const messages = [...trimmedHistory, { role: 'user', content: clean }];

  if (providerEnabled()) {
    try {
      const reply = await callProvider({ messages, systemPrompt });
      return { reply, mode: 'provider', subject, class: askedClass, answer: null };
    } catch (error) {
      // Provider down ho to bhi student ko jawab mile — local fallback
      const reply = `${localAnswer(clean, { user, classNo: askedClass })}\n\n_(AI service abhi available nahi hai, isliye school ke apne syllabus notes se jawab diya.)_`;
      return { reply, mode: 'local', subject, class: askedClass, answer: null, degraded: true, error: error.message };
    }
  }

  const answer = looksLikeMath(clean) ? solveMath(clean) : null;
  const reply = localAnswer(clean, { user, classNo: askedClass });
  return { reply, mode: 'local', subject, class: askedClass, answer };
};

const capabilities = () => ({
  mode: providerEnabled() ? 'provider' : 'local',
  model: providerEnabled() ? providerModel() : null,
  classes: CLASSES.map((c) => ({ class: c, subjects: (getClassOutline(c)?.subjects || []).map((s) => s.id) })),
  can: [
    'Chapter summary from the school syllabus (class 9-12)',
    'Maths: arithmetic, percentage, LCM, HCF, quadratic equations, square roots',
    'Quiz practice questions',
    'Portal navigation help',
    'Small talk'
  ],
  cannot: [
    'Live attendance or marks numbers without opening the portal',
    'Official board dates or notifications',
    'Free-form conversation (add AI_API_KEY for that)'
  ]
});

module.exports = { ask, capabilities, detectSubject, detectClass, detectPortal, solveMath, localAnswer, providerEnabled };
