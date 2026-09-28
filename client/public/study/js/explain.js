// ============================================================
//  HINGLISH EXPLAINER — "समझाइए" for every question
//  Translates hard Hindi words to English + transliterates,
//  so students who struggle with Hindi can read any question.
// ============================================================

// Academic glossary: Hindi term (or phrase) -> simple English meaning
const GLOSSARY = {
  // --- generic question words ---
  "ज्ञात कीजिए": "find out / calculate", "सिद्ध कीजिए": "prove", "दर्शाइए": "show",
  "किसे कहते हैं": "what is called", "किसे": "whom", "कहते हैं": "is called",
  "लिखिए": "write", "समझाइए": "explain", "बताइए": "tell / state",
  "परिभाषा": "definition", "महत्व": "importance", "उदाहरण": "example",
  "टिप्पणी": "note / comment", "प्रश्न": "question", "उत्तर": "answer",
  "सही उत्तर": "correct answer", "सही": "correct", "गलत": "wrong",
  "अध्याय": "chapter", "प्रमुख": "main", "मुख्य": "chief / main",
  "बिंदु": "points", "गुण": "qualities / properties", "अंतर्गत": "under / within",
  "संक्षेप में": "in brief", "संक्षिप्त": "brief", "सार": "summary / essence",
  "कीजिए": "(please) do", "उदाहरण सहित": "with example", "बराबर": "equal",
  "संख्या": "number", "का": "of", "के": "of", "की": "of", "और": "and",
  "या": "or", "तथा": "and", "से": "from / by", "के लिए": "for", "जो": "which",
  "है": "is", "हैं": "are", "होता है": "becomes / happens", "बनता है": "is formed",
  "बताएं": "tell", "क्या है": "what is", "क्या-क्या": "what all", "क्या": "what",

  // --- physics ---
  "विद्युत धारा": "electric current", "विद्युत": "electricity / electric",
  "प्रतिरोध": "resistance", "विभवांतर": "potential difference",
  "ओम का नियम": "Ohm's law", "शक्ति": "power", "ऊर्जा": "energy",
  "वेग": "velocity", "गति": "motion / speed", "बल": "force", "प्रकाश": "light",
  "परावर्तन": "reflection", "अपवर्तन": "refraction", "दर्पण": "mirror",
  "लेंस": "lens", "प्रतिबिंब": "image", "आवर्धन": "magnification",
  "निकट दृष्टि": "near-sightedness (myopia)", "दीर्घ दृष्टि": "far-sightedness",
  "रेटिना": "retina", "निकट बिंदु": "near point", "दूर बिंदु": "far point",
  "किरण": "ray of light", "फोकस": "focus", "आवेश": "electric charge",
  "विद्युत मोटर": "electric motor", "जनरेटर": "generator",
  "विद्युत चुंबक": "electromagnet", "प्रेरण": "induction", "चुंबक": "magnet",
  "सौर ऊर्जा": "solar energy", "नाभिकीय ऊर्जा": "nuclear energy",
  "पवन ऊर्जा": "wind energy", "जल विद्युत": "hydroelectric power",
  "जैव ईंधन": "bio-fuel", "ईंधन": "fuel", "मात्रक": "unit", "मापन": "measurement",
  "परिमाण": "magnitude", "पदार्थ": "matter / substance", "चाल": "speed",

  // --- chemistry ---
  "परमाणु": "atom", "अणु": "molecule", "तत्व": "element", "यौगिक": "compound",
  "आयन": "ion", "अम्ल": "acid", "क्षारक": "base", "लवण": "salt",
  "ऑक्सीकरण": "oxidation", "अपचयन": "reduction", "उदासीनीकरण": "neutralisation",
  "अभिक्रिया": "reaction", "संयोजन अभिक्रिया": "combination reaction",
  "अपघटन अभिक्रिया": "decomposition reaction",
  "विस्थापन अभिक्रिया": "displacement reaction", "विस्थापन": "displacement",
  "धातु": "metal", "अधातु": "non-metal", "निष्कर्षण": "extraction",
  "संक्षारण": "corrosion", "कार्बन": "carbon", "कार्यात्मक समूह": "functional group",
  "साबुन": "soap", "लिटमस": "litmus", "एंटासिड": "antacid", "विलयन": "solution",
  "आवर्त सारणी": "periodic table", "परमाणु क्रमांक": "atomic number",
  "आवर्त": "period", "समूह": "group", "प्रवृत्ति": "trend / tendency",
  "रासायनिक": "chemical", "गैस": "gas", "धात्विक": "metallic", "चमक": "shine / lustre",

  // --- biology ---
  "कोशिका": "cell", "ऊतक": "tissue", "अंग": "organ", "प्रकाश संश्लेषण": "photosynthesis",
  "श्वसन": "respiration / breathing", "पोषण": "nutrition", "परिवहन": "transport",
  "उत्सर्जन": "excretion / removal of waste", "न्यूरॉन": "neuron (nerve cell)",
  "हार्मोन": "hormone", "अनुक्रिया": "response", "जनन": "reproduction",
  "अलैंगिक जनन": "asexual reproduction", "लैंगिक जनन": "sexual reproduction",
  "परागण": "pollination", "जीन": "gene", "गुणसूत्र": "chromosome",
  "विकास": "development / evolution", "मेंडल नियम": "Mendel's law",
  "पर्यावरण": "environment", "पारिस्थितिकी तंत्र": "ecosystem",
  "खाद्य श्रृंखला": "food chain", "ओजोन परत": "ozone layer",
  "जैव विविधता": "biodiversity", "रक्त": "blood", "हृदय": "heart",
  "नेफ्रॉन": "nephron", "वर्गीकरण": "classification", "संरक्षण": "conservation",
  "अपशिष्ट": "waste", "स्थानांतरण": "transfer", "परिवर्तन": "change",

  // --- maths ---
  "बहुपद": "polynomial", "द्विघात समीकरण": "quadratic equation",
  "समांतर श्रेढ़ी": "arithmetic progression", "रैखिक समीकरण": "linear equation",
  "शून्यक": "zero / root", "अभाज्य संख्या": "prime number",
  "परिमेय संख्या": "rational number", "अपरिमेय संख्या": "irrational number",
  "वास्तविक संख्या": "real number", "अनुपात": "ratio", "औसत": "average",
  "क्षेत्रफल": "area", "आयतन": "volume", "परिमाप": "perimeter",
  "गुणनखंड": "factor", "सर्वसमिका": "identity", "माध्य": "mean",
  "माध्यक": "median", "बहुलक": "mode", "प्रायिकता": "probability",
  "घटना": "event", "निर्देशांक": "co-ordinates", "ऊँचाई-दूरी": "height-distance",
  "स्पर्श रेखा": "tangent", "त्रिभुज": "triangle", "वृत्त": "circle",
  "आलेख": "graph", "समीकरण": "equation", "बेलन": "cylinder", "गोला": "sphere",
  "शंकु": "cone", "चाप": "arc", "त्रिज्यखंड": "sector",
  "श्रेढ़ी": "series / progression", "कोण": "angle", "भुजा": "side",
  "कर्ण": "hypotenuse", "शीर्ष": "vertex", "संख्याएँ": "numbers",

  // --- history ---
  "राष्ट्रवाद": "nationalism", "क्रांति": "revolution", "उपनिवेशवाद": "colonialism",
  "साम्राज्यवाद": "imperialism", "सत्याग्रह": "Satyagraha (truth-force)",
  "आंदोलन": "movement / agitation", "साक्षरता": "literacy",
  "छापाखाना": "printing press", "पुस्तकें": "books", "अभिलेख": "records",
  "ग्रंथ": "texts / books", "औद्योगिक क्रांति": "industrial revolution",
  "किसान": "farmer", "मजदूर": "labourer", "कर": "tax", "महामंदी": "great depression",
  "युद्ध": "war", "संधि": "treaty", "साम्राज्य": "empire", "शासन": "rule / government",
  "विरोध": "protest", "चुनाव": "election", "संविधान": "constitution",
  "अधिकार": "rights", "कारखाने": "factories", "सूती वस्त्र": "cotton textile",
  "व्यापार": "trade", "मार्ग": "route", "वैश्विक": "global", "अर्थव्यवस्था": "economy",
  "जनसंख्या": "population", "विस्थापन": "displacement", "उद्योग": "industry",
  "स्वतंत्रता": "freedom / independence", "स्वतंत्रता संग्राम": "independence struggle",
  "गांधीजी": "Mahatma Gandhi", "महात्मा गांधी": "Mahatma Gandhi",
  "जलियांवाला बाग": "Jallianwala Bagh", "नमक कानून": "salt law",
  "दांडी मार्च": "Dandi March", "भारत छोड़ो आंदोलन": "Quit India Movement",
  "असहयोग आंदोलन": "Non-cooperation Movement",
  "सविनय अवज्ञा आंदोलन": "Civil Disobedience Movement",

  // --- geography ---
  "संसाधन": "resource", "मिट्टी": "soil", "कृषि": "agriculture / farming",
  "फसल": "crop", "खनिज": "minerals", "अयस्क": "ore", "कोयला": "coal",
  "परिवहन": "transport", "वन": "forest", "जलवायु": "climate", "वर्षा": "rainfall",
  "सिंचाई": "irrigation", "नदी": "river", "जलोढ़ मिट्टी": "alluvial soil",
  "काली मिट्टी": "black soil", "मृदा संरक्षण": "soil conservation",
  "खरीफ": "kharif (monsoon crop)", "रबी": "rabi (winter crop)",
  "जायद": "zaid (summer crop)", "धान": "paddy / rice", "गेहूँ": "wheat",
  "बहुउद्देशीय परियोजना": "multi-purpose project", "प्रदूषण": "pollution",
  "वन्य जीव": "wildlife", "जैव विविधता": "biodiversity", "जल संसाधन": "water resource",
  "विनिर्माण": "manufacturing", "जीवन रेखाएँ": "lifelines", "सड़क": "road", "रेल": "rail",

  // --- civics ---
  "सत्ता": "power", "लोकतंत्र": "democracy", "सरकार": "government",
  "कानून": "law", "कर्तव्य": "duties", "दल": "party", "नागरिक": "citizen",
  "संघवाद": "federalism", "विकेंद्रीकरण": "decentralisation",
  "पंचायती राज": "Panchayati Raj", "सूची": "list", "भ्रष्टाचार": "corruption",
  "भाषाई विविधता": "linguistic diversity", "धर्म": "religion",
  "लैंगिक समानता": "gender equality", "जाति": "caste", "संघर्ष": "struggle",
  "साझेदारी": "sharing", "बेल्जियम मॉडल": "Belgian model", "श्रीलंका": "Sri Lanka",
  "राजनीतिक": "political", "राष्ट्रीय दल": "national party", "क्षेत्रीय दल": "regional party",
  "जवाबदेही": "accountability", "मसले": "issues", "चुनौतियाँ": "challenges",
  "परिणाम": "outcomes / results",

  // --- economics ---
  "आय": "income", "विकास": "development", "बचत": "savings", "निवेश": "investment",
  "मुद्रा": "money / currency", "बैंक": "bank", "ऋण": "loan / credit",
  "ब्याज": "interest", "रोजगार": "employment", "बेरोजगारी": "unemployment",
  "निर्यात": "export", "आयात": "import", "वैश्वीकरण": "globalisation",
  "बाजार": "market", "कीमत": "price", "प्रति व्यक्ति आय": "per capita income",
  "क्षेत्रक": "sector", "प्राथमिक": "primary", "द्वितीयक": "secondary",
  "तृतीयक": "tertiary", "उपभोक्ता": "consumer", "शिकायत": "complaint",
  "विदेशी निवेश": "foreign investment", "व्यक्ति": "person", "साख": "credit",

  // --- hindi literature / grammar ---
  "पात्र": "character", "कथानक": "plot", "शीर्षक": "title", "मुख्य भाव": "main idea",
  "संदेश": "message", "भाषा शैली": "language style", "संस्कृति": "culture",
  "निबंध": "essay", "कहानी": "short story", "कविता": "poem", "संज्ञा": "noun",
  "सर्वनाम": "pronoun", "विशेषण": "adjective", "क्रिया": "verb", "काल": "tense",
  "वाच्य": "voice", "कारक": "case", "अलंकार": "figure of speech", "रस": "emotion (rasa)",
  "समास": "compound word", "उपसर्ग": "prefix", "प्रत्यय": "suffix",
  "संधि": "junction of letters", "विराम चिह्न": "punctuation",
  "मुहावरे": "idioms", "लोकोक्तियाँ": "proverbs", "पर्यायवाची": "synonyms",
  "विलोम": "opposites", "रचनाकार": "author / writer", "गद्य": "prose", "पद्य": "poetry",
  "संस्मरण": "memoir / reminiscence", "जीवन-परिचय": "biographical sketch",
  "प्रेरक": "inspiring", "सार्थकता": "meaningfulness", "उद्देश्य": "purpose",
  "मातृ प्रेम": "mother's love", "प्रेरणा": "inspiration", "भावना": "emotion",
  "देशभक्ति": "patriotism", "यात्रा": "journey", "वर्णन": "description",
  "पाठ": "lesson", "अनुच्छेद": "paragraph", "वाक्य": "sentence",
};

// Basic Devanagari -> Roman transliteration map
const HL_MAP = {
  'क':'k','ख':'kh','ग':'g','घ':'gh','ङ':'ng','च':'ch','छ':'chh','ज':'j','झ':'jh','ञ':'ny',
  'ट':'t','ठ':'th','ड':'d','ढ':'dh','ण':'n','त':'t','थ':'th','द':'d','ध':'dh','न':'n',
  'प':'p','फ':'f','फ़':'f','ब':'b','भ':'bh','म':'m','य':'y','र':'r','ल':'l','व':'v',
  'श':'sh','ष':'sh','स':'s','ह':'h','क़':'q','ख़':'kh','ग़':'g','ज़':'z','ड़':'r','ढ़':'rh',
  'अ':'a','आ':'aa','इ':'i','ई':'ee','उ':'u','ऊ':'oo','ऋ':'ri','ए':'e','ऐ':'ai','ओ':'o','औ':'au',
  'ा':'a','ि':'i','ी':'ee','ु':'u','ू':'oo','ृ':'ri','े':'e','ै':'ai','ो':'o','ौ':'au',
  'ं':'n','ँ':'n','ः':'h','ॉ':'o','़':'','्':'','ज्ञ':'gy','क्ष':'ksh','त्र':'tr','श्र':'shr',
};

function toRoman(text) {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (HL_MAP[c] !== undefined) { out += HL_MAP[c]; continue; }
    if (i + 1 < text.length) {
      const two = c + text[i + 1];
      if (HL_MAP[two] !== undefined) { out += HL_MAP[two]; i++; continue; }
    }
    out += c;
  }
  return out;
}

// Glossary replacement: protects English/latin runs, replaces glossary
// Deva words with "term (meaning)", transliterates the rest.
function hinglish(text) {
  if (!text) return '';
  let t = String(text);
  // longest-first replacement using glossary (phrase-aware)
  const phrases = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);
  const frags = [];
  let rest = t;
  while (rest.length) {
    let matched = null, matchedKey = null;
    for (const k of phrases) {
      if (rest.startsWith(k)) { matched = GLOSSARY[k]; matchedKey = k; break; }
    }
    if (matched) {
      frags.push(`<b>${matchedKey}</b> <span class="hg-meaning">(${matched})</span>`);
      rest = rest.slice(matchedKey.length);
    } else {
      // gather latin/digit runs as-is, devanagari run transliterated
      let i = 0;
      while (i < rest.length) {
        if (phrases.some(k => rest.slice(i).startsWith(k))) break;
        i++;
      }
      if (i === 0) i = 1;
      let chunk = rest.slice(0, i);
      rest = rest.slice(i);
      if (/[\u0900-\u097F]/.test(chunk)) {
        frags.push(`<span class="hg-roman">${toRoman(chunk)}</span>`);
      } else {
        frags.push(chunk);
      }
    }
  }
  return frags.join('');
}

// List of hard -> meaning pairs found in a text (mini dictionary)
function glossaryHints(text) {
  const found = [];
  for (const k in GLOSSARY) {
    if (text.includes(k)) found.push(`<b>${k}</b> = ${GLOSSARY[k]}`);
  }
  if (!found.length) return '';
  return `<div class="hg-hints"><h5>🪜 कठिन शब्द और अर्थ</h5>${found.map(f => `<span>${f}</span>`).join('')}</div>`;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GLOSSARY, toRoman, hinglish, glossaryHints };
}