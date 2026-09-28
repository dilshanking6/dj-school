// ============================================================
//  DATA LOADER & SUBJECT METADATA - Digital Janta Study Hub
//  Class 9/10/11/12 - class hub.js se decide hoti hai.
// ============================================================

// Subject metadata (subject id, name, chapters, notes)
const SUBJECTS = {
  hindi: {
    name: "हिन्दी",
    emoji: "📖",
    color: "#ff6b6b",
    desc: "क्षितिज, कृतिका, स्पर्श, संचयन + व्याकरण",
    dataFile: "hindi.json"
  },
  english: {
    name: "English",
    emoji: "🇬🇧",
    color: "#4ecdc4",
    desc: "First Flight + Footprints without Feet",
    dataFile: "english.json"
  },
  maths: {
    name: "गणित",
    emoji: "➕",
    color: "#f8b500",
    desc: "14 अध्याय + फॉर्मूले",
    dataFile: "maths.json"
  },
  physics: {
    name: "भौतिक विज्ञान",
    emoji: "⚡",
    color: "#845ef7",
    desc: "विद्युत, प्रकाश, चुंबकीय प्रभाव",
    dataFile: "physics.json"
  },
  chemistry: {
    name: "रसायन विज्ञान",
    emoji: "🧪",
    color: "#20c997",
    desc: "अभिक्रियाएँ, अम्ल-क्षारक, धातु",
    dataFile: "chemistry.json"
  },
  biology: {
    name: "जीव विज्ञान",
    emoji: "🧬",
    color: "#51cf66",
    desc: "जैव प्रक्रम, नियंत्रण, जनन",
    dataFile: "biology.json"
  },
  history: {
    name: "इतिहास",
    emoji: "🏛️",
    color: "#e8590c",
    desc: "राष्ट्रवाद, औद्योगीकरण, मुद्रण",
    dataFile: "history.json"
  },
  geography: {
    name: "भूगोल",
    emoji: "🌍",
    color: "#1098ad",
    desc: "संसाधन, कृषि, खनिज, उद्योग",
    dataFile: "geography.json"
  },
  civics: {
    name: "राजनीति विज्ञान",
    emoji: "🏛️",
    color: "#7048e8",
    desc: "सत्ता, संघवाद, दल",
    dataFile: "civics.json"
  },
  economics: {
    name: "अर्थशास्त्र",
    emoji: "💰",
    color: "#ae3ec9",
    desc: "विकास, मुद्रा, वैश्वीकरण",
    dataFile: "economics.json"
  }
};

// Question data stored globally after loading
let QUESTION_DATA = {};
// Original class-10 metadata. Baaki classes hub bundle se aati hain,
// isliye ise reference me rakh lo taaki class switch par reset ho sake.
let BASE_SUBJECTS = SUBJECTS;

/** Hub ke bundle se SUBJECTS + QUESTION_DATA rebuild karo. */
function applyBundle(bundle) {
  const subjects = (bundle && bundle.subjects) || {};
  const keys = Object.keys(subjects);
  if (!keys.length) return false;

  const nextSubjects = {};
  QUESTION_DATA = {};
  keys.forEach((id) => {
    const entry = subjects[id] || {};
    nextSubjects[id] = {
      name: entry.name || id,
      nameEn: entry.nameEn || entry.name || id,
      emoji: entry.emoji || '📘',
      color: entry.color || '#6366f1',
      desc: entry.desc || '',
      dataFile: entry.dataFile || '',
      source: entry.source || 'practice'
    };
    QUESTION_DATA[id] = {
      subject: entry.name || id,
      chapters: entry.chapters || [],
      questions: entry.questions || []
    };
  });

  for (const k in SUBJECTS) delete SUBJECTS[k];
  Object.assign(SUBJECTS, nextSubjects);
  return true;
}

// Load all subject data
async function loadAllData() {
  // Homepage full bundle ki jagah sirf outline load karta hai —
  // stats aur subject cards ke liye chapters + counts hi kaafi hain.
  if (window.STUDY_LIGHT && typeof window.hubLoadOutline === 'function') {
    const outline = await window.hubLoadOutline();
    if (outline && Array.isArray(outline.subjects) && outline.subjects.length) {
      applyOutline(outline);
      return;
    }
  }

  if (typeof window.hubLoadBundle === 'function') {
    const bundle = await window.hubLoadBundle();
    if (applyBundle(bundle)) return;
  }

  // Sab kuch fail ho gaya - kam se kam class 10 ka purana data dikhao
  for (const k in QUESTION_DATA) delete QUESTION_DATA[k];
  if (window.ALL_QUESTIONS) {
    Object.assign(QUESTION_DATA, window.ALL_QUESTIONS);
    for (const s in SUBJECTS) {
      if (!QUESTION_DATA[s] || !QUESTION_DATA[s].questions) {
        QUESTION_DATA[s] = { chapters: [], questions: [] };
      }
    }
    return;
  }
  for (const s in SUBJECTS) {
    try {
      const res = await fetch('js/data/' + SUBJECTS[s].dataFile);
      QUESTION_DATA[s] = res.ok ? await res.json() : { chapters: [], questions: [] };
    } catch (e) {
      QUESTION_DATA[s] = { chapters: [], questions: [] };
    }
  }
}

/** Outline (= chapter titles + counts, no questions) se SUBJECTS banao. */
function applyOutline(outline) {
  const subjects = {};
  QUESTION_DATA = {};
  outline.subjects.forEach((entry) => {
    const chapters = (entry.chapters || []).map((c) => (typeof c === 'object' && c ? c.title : c));
    const questions = entry.questionCount || 0;
    subjects[entry.id] = {
      name: entry.name || entry.id,
      nameEn: entry.nameEn || entry.name || entry.id,
      emoji: entry.emoji || '📘',
      color: entry.color || '#6366f1',
      desc: entry.desc || '',
      source: entry.source || 'practice'
    };
    QUESTION_DATA[entry.id] = {
      subject: entry.name || entry.id,
      chapters,
      questions: [],
      // Purane pages / logic bhi questionCount padh saken
      questionCount: questions
    };
  });

  for (const k in SUBJECTS) delete SUBJECTS[k];
  Object.assign(SUBJECTS, subjects);
  return true;
}

// Auto-load once the DOM is ready. Pages bhi loadAllData() call karte hain,
// isliye ek hi promise share karo taaki content do baar na chale.
let loadPromise = null;
function loadAllDataOnce() {
  if (!loadPromise) {
    loadPromise = (async () => {
      try {
        await loadAllData();
      } finally {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('hub:content-ready', { detail: { class: window.HUB ? window.HUB.class : null } }));
        }
      }
    })();
  }
  return loadPromise;
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => { loadAllDataOnce(); });
}

// Get questions for a subject (optionally by chapter)
function getQuestions(subject, chapter) {
  const data = QUESTION_DATA[subject];
  if (!data || !data.questions) return [];
  if (chapter === 'all' || !chapter) return data.questions;
  return data.questions.filter(q => q.chapter === chapter);
}

// Get statistics
function getTotalQuestions() {
  let total = 0;
  for (const s in QUESTION_DATA) {
    if (QUESTION_DATA[s] && QUESTION_DATA[s].questions) {
      total += QUESTION_DATA[s].questions.length;
    }
  }
  return total;
}

// Fisher-Yates shuffle
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Keyword extraction for simple write-answer grading
function extractKeywords(text) {
  if (!text) return [];
  return String(text)
    .toLowerCase()
    .replace(/[.,;:!?()\[\]{}"']/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2)
    .filter(w => !['किसे','कौन','क्या','और','का','के','की','से','को','में','ने','पर','करने','लिए','जानिए','जाइए','आदि'].includes(w));
}

// Notes data (subject -> array of {title, points[], color})
const NOTES = {
  hindi: {
    headerColor: "#ff6b6b",
    title: "हिन्दी - महत्वपूर्ण नोट्स",
    emoji: "📖",
    topics: [
      { title: "व्याकरण (Grammar)", points: [
        "• संज्ञा के 5 भेद: व्यक्तिवाचक, जातिवाचक, भाववाचक, समूहवाचक, द्रव्यवाचक",
        "• काल के 3 भेद: वर्तमान, भूतकाल, भविष्यत्",
        "• अलंकार: अनुप्रास, उपमा, रूपक, उत्प्रेक्षा",
        "• मुहावरे: 'आँखों का तारा' = बहुत प्यारा",
        "• रस के 9 प्रकार: श्रृंगार, हास्य, करुण, रौद्र, वीर, भयानक, वीभत्स, अद्भुत, शांत"
      ]},
      { title: "क्षितिज (Kshitij)", points: [
        "• पद (सूरदास): बाल-लीला, कृष्ण के बालपन का वर्णन",
        "• बालगोबिन भगत: सच्चा साधु, संगीत से भक्ति",
        "• नेताजी का चश्मा: कैप्टन का देशभक्ति सम्मान",
        "• संस्कृति: भारतीय संस्कृति की महानता",
        "• टोपी शुक्ला: बाल-मित्रता और समाज"
      ]},
      { title: "कृतिका (Kritika)", points: [
        "• माता का अंचल: माँ का असीम प्रेम (बाल मनोविज्ञान)",
        "• जॉर्ज पंचम का नीम: स्वतंत्रता संग्राम की यादें",
        "• साना-साना हाथ जोड़ि: सिक्किम की यात्रा वर्णन",
        "• कन्यादान: माता-पिता का बेटी से प्रेम"
      ]},
      { title: "स्पर्श (Sparsh)", points: [
        "• स्पर्श कविता (हरिऔध): प्रकृति और मनुष्य का संबंध",
        "• आदमी नामा: मनुष्य की व्यथा",
        "• दोस्त (कविता): सच्ची दोस्ती का महत्व"
      ]},
      { title: "संचयन (Sanchayan)", points: [
        "• हरिहर काका: गरीब किसान की करुणा",
        "• टोपी शुक्ला: बच्चों की दुनिया",
        "• कपालकुंडला: लोककथा - सत्य की जीत",
        "• बालगोबिन भगत: भक्ति और संगीत"
      ]}
    ]
  },
  english: {
    headerColor: "#4ecdc4",
    title: "English - Important Notes",
    emoji: "🇬🇧",
    topics: [
      { title: "Grammar (व्याकरण)", points: [
        "• Tenses: Present, Past, Future - 3 times each",
        "• Modals: can, could, may, might, must, should",
        "• Articles: a, an, the - usage rules",
        "• Reported Speech: Direct to Indirect conversion",
        "• Voice: Active ↔ Passive"
      ]},
      { title: "First Flight - Prose", points: [
        "• A Letter to God: Lencho's faith in God",
        "• Nelson Mandela: Struggle for Freedom",
        "• Two Stories: His First Flight + The Black Aeroplane",
        "• Madam Rides the Bus: Valli's adventure",
        "• The Necklace: Moral - Honesty is best policy"
      ]},
      { title: "First Flight - Poetry", points: [
        "• Dust of Snow: Nature's healing power",
        "• Fire and Ice: Desire vs Hatred",
        "• A Tiger in the Zoo: Freedom vs Captivity",
        "• The Ball Poem: Loss and moving on"
      ]},
      { title: "Footprints without Feet", points: [
        "• A Triumph of Surgery: Pet care (Tricki's story)",
        "• The Midnight Visitor: Confidence wins",
        "• The Making of a Scientist: Curiosity + hard work",
        "• Bholi: Education transforms life",
        "• The Book that Saved the Earth: Power of reading"
      ]}
    ]
  },
  maths: {
    headerColor: "#f8b500",
    title: "गणित - महत्वपूर्ण फॉर्मूले",
    emoji: "➕",
    topics: [
      { title: "बीजगणित (Algebra)", points: [
        "• द्विघात समीकरण: x = [-b ± √(b²-4ac)] / 2a",
        "• बहुपद: α+β = -b/a, αβ = c/a",
        "• AP: aₙ = a + (n-1)d, Sₙ = n/2[2a+(n-1)d]",
        "• HCF × LCM = a × b (दो संख्याएँ)"
      ]},
      { title: "त्रिकोणमिति (Trigonometry)", points: [
        "• sin²θ + cos²θ = 1",
        "• 1 + tan²θ = sec²θ",
        "• sin30°=1/2, cos60°=1/2, tan45°=1",
        "• ऊँचाई-दूरी: tanθ = ऊँचाई/दूरी"
      ]},
      { title: "क्षेत्रमिति (Mensuration)", points: [
        "• वृत्त: क्षेत्रफल=πr², परिधि=2πr",
        "• बेलन: V=πr²h, CSA=2πrh",
        "• गोला: V=4/3πr³, SA=4πr²",
        "• शंकु: V=1/3πr²h, l=√(r²+h²)"
      ]},
      { title: "सांख्यिकी (Statistics)", points: [
        "• माध्य (Mean) = Σx/n",
        "• माध्यक (Median): मध्य मान",
        "• बहुलक (Mode): सबसे अधिक बार आने वाला"
      ]}
    ]
  },
  physics: {
    headerColor: "#845ef7",
    title: "भौतिक विज्ञान - महत्वपूर्ण नोट्स",
    emoji: "⚡",
    topics: [
      { title: "विद्युत (Electricity)", points: [
        "• ओम का नियम: V = IR",
        "• शक्ति: P = VI = I²R",
        "• श्रेणी: R = R₁+R₂+..., समांतर: 1/R = Σ1/Rᵢ",
        "• ऊर्जा इकाई: किलोवाट-घंटा (kWh)"
      ]},
      { title: "प्रकाश (Light)", points: [
        "• दर्पण सूत्र: 1/f = 1/v + 1/u",
        "• आवर्धन: m = h'/h = -v/u",
        "• अपवर्तनांक: n = sin i / sin r",
        "• लेंस की क्षमता: P = 1/f (डायोप्टर)"
      ]},
      { title: "चुंबकीय प्रभाव (Magnetic Effects)", points: [
        "• फ्लेमिंग का बाएं हाथ का नियम",
        "• विद्युत मोटर: चुंबकीय प्रभाव पर काम करता है",
        "• जनरेटर: विद्युत चुंबकीय प्रेरण"
      ]},
      { title: "मानव नेत्र", points: [
        "• निकट दृष्टि दोष: अवतल लेंस से सुधार",
        "• दीर्घ दृष्टि दोष: उत्तल लेंस से सुधार",
        "• दृष्टि दोष निदान सीमा: 25cm (निकट बिंदु)"
      ]}
    ]
  },
  chemistry: {
    headerColor: "#20c997",
    title: "रसायन विज्ञान - महत्वपूर्ण नोट्स",
    emoji: "🧪",
    topics: [
      { title: "रासायनिक अभिक्रियाएँ", points: [
        "• संयोजन: A + B → AB",
        "• अपघटन: AB → A + B",
        "• विस्थापन: A + BC → AC + B",
        "• ऑक्सीकरण-अपचयन (Redox)"
      ]},
      { title: "अम्ल, क्षारक, लवण", points: [
        "• अम्ल: pH < 7 (नीला लिटमस → लाल)",
        "• क्षारक: pH > 7 (लाल लिटमस → नीला)",
        "• फिनॉल्फ्थैलीन: अम्ल में रंगहीन, क्षारक में गुलाबी",
        "• उदासीनीकरण: अम्ल + क्षारक → लवण + जल"
      ]},
      { title: "धातु और अधातु", points: [
        "• धातु: चमकीले, आघातवर्ध्य, विद्युत-सुचालक",
        "• अधातु: भंगुर, कुचालक",
        "• निष्कर्षण: अयस्क → शुद्ध धातु",
        "• संक्षारण: Fe₂O₃ (जंग)"
      ]},
      { title: "कार्बन यौगिक", points: [
        "• कार्बन: चतुःसंयोजी, श्रृंखला निर्माण (कैटिनेशन)",
        "• कार्यात्मक समूह: -OH (अल्कोहल), -COOH (अम्ल)",
        "• साबुन: सोडियम/पोटैशियम लवण"
      ]}
    ]
  },
  biology: {
    headerColor: "#51cf66",
    title: "जीव विज्ञान - महत्वपूर्ण नोट्स",
    emoji: "🧬",
    topics: [
      { title: "जैव प्रक्रम (Life Processes)", points: [
        "• पोषण: स्वपोषी, परपोषी",
        "• श्वसन: वायवीय (O₂), अवायवीय",
        "• परिवहन: रक्त, हृदय, रक्तवाहिनियाँ",
        "• उत्सर्जन: गुर्दा - नेफ्रॉन"
      ]},
      { title: "नियंत्रण एवं समन्वय", points: [
        "• न्यूरॉन: तंत्रिका तंत्र की इकाई",
        "• हार्मोन: अंतःस्रावी ग्रंथियाँ (थायरॉइड, इंसुलिन)",
        "• पादप हार्मोन: ऑक्सिन, जिबरेलिन",
        "• अनुक्रिया: प्रकाशानुवर्तन, गुरुत्वानुवर्तन"
      ]},
      { title: "जनन (Reproduction)", points: [
        "• अलैंगिक: विखंडन, बडिंग, कलम",
        "• लैंगिक: पुष्प, परागण, निषेचन",
        "• मानव जनन: पुरुष/महिला तंत्र"
      ]},
      { title: "आनुवंशिकता (Heredity)", points: [
        "• DNA, जीन, गुणसूत्र (Chromosome)",
        "• मेंडल का नियम: प्रभाविता, पृथक्करण",
        "• विकासवाद: डार्विन का प्राकृतिक चयन"
      ]}
    ]
  },
  history: {
    headerColor: "#e8590c",
    title: "इतिहास - महत्वपूर्ण नोट्स",
    emoji: "🏛️",
    topics: [
      { title: "यूरोप में राष्ट्रवाद", points: [
        "• फ्रांस की क्रांति (1789)",
        "• नेपोलियन का योगदान",
        "• 1848 की क्रांति - उदारवाद",
        "• इटली (मेजिनी, काबुर) और जर्मनी (बिस्मार्क) का एकीकरण"
      ]},
      { title: "भारत में राष्ट्रवाद", points: [
        "• सत्याग्रह, असहयोग आंदोलन (1920)",
        "• सविनय अवज्ञा आंदोलन (1930)",
        "• नमक सत्याग्रह (दांडी मार्च)",
        "• गांधी, नेहरू, तिलक का योगदान"
      ]},
      { title: "भूमंडलीकृत विश्व", points: [
        "• व्यापार मार्ग, औपनिवेशिक विस्तार",
        "• महामंदी (1929)",
        "• विश्व युद्धों का प्रभाव"
      ]},
      { title: "मुद्रण संस्कृति", points: [
        "• छापाखाना (प्रिंटिंग प्रेस)",
        "• पुस्तकों का प्रसार, साक्षरता",
        "• भारत में मुद्रण विकास"
      ]}
    ]
  },
  geography: {
    headerColor: "#1098ad",
    title: "भूगोल - महत्वपूर्ण नोट्स",
    emoji: "🌍",
    topics: [
      { title: "संसाधन एवं विकास", points: [
        "• संसाधन: नवीकरणीय, अनवीकरणीय",
        "• मृदा: काली, लाल, जलोढ़ (Alluvial)",
        "• मृदा संरक्षण: वनरोपण, बाँध"
      ]},
      { title: "कृषि (Agriculture)", points: [
        "• खरीफ: धान, मक्का, कपास (जून-सितंबर)",
        "• रबी: गेहूँ, चना, सरसों (अक्टूबर-मार्च)",
        "• जायद: तरबूज, खीरा (अप्रैल-जून)"
      ]},
      { title: "खनिज और ऊर्जा", points: [
        "• लौह अयस्क, कोयला, बॉक्साइट",
        "• खनिज तेल, प्राकृतिक गैस",
        "• अक्षय ऊर्जा: सौर, पवन, जल"
      ]},
      { title: "उद्योग एवं परिवहन", points: [
        "• सूती वस्त्र, लौह-इस्पात उद्योग",
        "• परिवहन: सड़क, रेल, जल, वायु",
        "• राष्ट्रीय राजमार्ग, व्यापार"
      ]}
    ]
  },
  civics: {
    headerColor: "#7048e8",
    title: "राजनीति विज्ञान - महत्वपूर्ण नोट्स",
    emoji: "🏛️",
    topics: [
      { title: "सत्ता की साझेदारी", points: [
        "• बेल्जियम: भाषाई मॉडल",
        "• श्रीलंका: बहुमतवाद की समस्या",
        "• भारत: केंद्र-राज्य सत्ता विभाजन"
      ]},
      { title: "संघवाद (Federalism)", points: [
        "• दो या अधिक स्तरों की सरकार",
        "• संघ सूची, राज्य सूची, समवर्ती सूची",
        "• पंचायती राज (1992, 73वां/74वां संशोधन)"
      ]},
      { title: "राजनीतिक दल", points: [
        "• राष्ट्रीय दल: भाजपा, कांग्रेस",
        "• क्षेत्रीय दल",
        "• दल बदल नियम"
      ]},
      { title: "लोकतंत्र के परिणाम", points: [
        "• जवाबदेह सरकार",
        "• नागरिक अधिकार",
        "• चुनौतियाँ: भ्रष्टाचार, जातिवाद"
      ]}
    ]
  },
  economics: {
    headerColor: "#ae3ec9",
    title: "अर्थशास्त्र - महत्वपूर्ण नोट्स",
    emoji: "💰",
    topics: [
      { title: "विकास (Development)", points: [
        "• प्रति व्यक्ति आय (Per Capita Income)",
        "• HDI (मानव विकास सूचकांक)",
        "• साक्षरता, स्वास्थ्य, जीवन प्रत्याशा"
      ]},
      { title: "अर्थव्यवस्था के क्षेत्रक", points: [
        "• प्राथमिक: कृषि, पशुपालन",
        "• द्वितीयक: उद्योग, विनिर्माण",
        "• तृतीयक: सेवा क्षेत्र (परिवहन, शिक्षा)",
        "• GDP: कुल घरेलू उत्पाद"
      ]},
      { title: "मुद्रा और साख", points: [
        "• मुद्रा: वस्तु विनिमय का समाधान",
        "• बैंक: जमा आकर्षण, ऋण प्रदान",
        "• RBI: केंद्रीय बैंक, मुद्रा नियंत्रण"
      ]},
      { title: "वैश्वीकरण", points: [
        "• विदेशी निवेश (FDI)",
        "• बहुराष्ट्रीय कंपनियाँ (MNC)",
        "• WTO, मुक्त व्यापार"
      ]}
    ]
  }
};

// Correct spellings reference (for spell-check during write test)
const CORRECT_SPELLINGS = {
  "नेताजी": ["नेताजी"],
  "कृपया": ["कृपया", "कृप्या"],
  "अभ्यास": ["अभ्यास"],
  "शिक्षा": ["शिक्षा"],
  "विद्यार्थी": ["विद्यार्थी"],
  "प्रश्न": ["प्रश्न"],
  "उत्तर": ["उत्तर"],
  "ज्ञान": ["ज्ञान", "ग्यांन"],
  "स्वास्थ्य": ["स्वास्थ्य"],
  "राष्ट्र": ["राष्ट्र"]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SUBJECTS, QUESTION_DATA, NOTES, CORRECT_SPELLINGS, loadAllData, loadAllDataOnce, applyBundle, getQuestions, getTotalQuestions, shuffleArray, extractKeywords };
}
