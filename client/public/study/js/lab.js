// ============================================================
//  VIRTUAL LAB — Class 10 Experiments (Physics, Chemistry, Biology)
// ============================================================

const EXPERIMENTS = {
  physics: [
    {
      id: "p1", title: "गोलीय दर्पण की फोकस दूरी ज्ञात करना", emoji: "🪞",
      aim: "उत्तल / अवतल दर्पण की फोकस दूरी और वक्रता त्रिज्या ज्ञात करना।",
      apparatus: ["दर्पण स्टैंड", "मीटर स्केल", "पिंस", "सफेद स्क्रीन", "मोमबत्ती"],
      principle: "दर्पण सूत्र 1/f = 1/v + 1/u; f = R/2 जहाँ R वक्रता त्रिज्या है।",
      procedure: [
        "दर्पण को स्टैंड पर रखें।",
        "दर्पण से दूर एक मोमबत्ती जलाकर पिन द्वारा प्रतिबिंब बनाएं।",
        "दर्पण व प्रतिबिंब की स्थिति मीटर स्केल से नापें।",
        "u (वस्तु दूरी) व v (प्रतिबिंब दूरी) मापें।",
        "सूत्र 1/f = 1/v + 1/u से फोकस दूरी निकालें; कम-से-कम तीन बार दोहराएं।"
      ],
      observation: "हर प्रयोग में u, v मापें और f ≈ R/2 नियम से जाँचें।",
      result: "दर्पण की औसत फोकस दूरी f = ... cm; R = 2f।",
      precautions: ["दर्पण की चमकदार सतह को साफ रखें।", "पिन सीधी रखें, स्केल सही रखें।"]
    },
    {
      id: "p2", title: "प्रतिरोध की श्रेणी-क्रम व समानांतर संयोजन", emoji: "🔌",
      aim: "प्रतिरोधों को श्रेणी एवं समांतर क्रम में जोड़कर तुल्य प्रतिरोध ज्ञात करना।",
      apparatus: ["प्रतिरोधक (R1, R2, R3)", "ऐमीटर", "वोल्टमीटर", "बैटरी", "तार व स्विच"],
      principle: "श्रेणी: R = R1+R2+R3; समांतर: 1/R = 1/R1+1/R2+1/R3",
      procedure: [
        "पहले श्रेणी क्रम में जोड़कर ऐमीटर-वोल्टमीटर से R मापें।",
        "फिर समांतर क्रम में जोड़कर फिर से R मापें।",
        "दोनों परिणामों की तुलना सूत्रों से करें।"
      ],
      observation: "श्रेणी में कुल प्रतिरोध बड़ा, समांतर में छोटा होता है।",
      result: "प्रयोग सूत्र को प्रमाणित करता है — R_श्रेणी > प्रत्येक, R_समांतर < प्रत्येक।",
      precautions: ["संयोजन में तार कसकर लगाएँ।", "मापन के समय सेल ताजा रखें।"]
    },
    {
      id: "p3", title: "ओम का नियम — प्रतिरोध ज्ञात करना", emoji: "⚡",
      aim: "चालक के सिरों पर विभवांतर व धारा का अनुपात जानना (V/I)।",
      apparatus: ["चालक तार", "बैटरी", "ऐमीटर", "वोल्टमीटर", "स्विच", "रियोस्टेट"],
      principle: "V/I = R (स्थिर ताप पर) — ओम का नियम।",
      procedure: [
        "परिपथ में तार जोड़ें; ऐमीटर धारा व वोल्टमीटर विभवांतर पढ़ें।",
        "रियोस्टेट से विभवांतर बदलकर धारा मापें।",
        "V–I ग्राफ़ खींचें; ढाल से R निकालें।"
      ],
      observation: "ग्राफ सीधी रेखा — R स्थिर रहता है।",
      result: "R = V/I; ग्राफ की ढाल के बराबर।",
      precautions: ["तार में श्रेणी में ऐमीटर जोड़ें।", "परिपथ बंद ही मापें।"]
    },
    {
      id: "p4", title: "पानी के साथ काँच की सिल्ली का अपवर्तनांक", emoji: "🔍",
      aim: "काँच की सिल्ली का अपवर्तनांक ज्ञात करना।",
      apparatus: ["काँच की सिल्ली", "पिन", "ड्रॉइंग शीट", "चांदा/चाँद", "पेंसिल"],
      principle: "n = सिन i / सिन r",
      procedure: [
        "सिल्ली शीट पर रखकर रूपरेखा बनाएँ।",
        "एक पिन सिल्ली से बाहर; दूसरी रेखा से देखकर मिलाएँ।",
        "आपतन व अपवर्तन कोण चांद से मापें, अनुपात निकालें।"
      ],
      observation: "n का मान लगभग 1.5 मिलता है।",
      result: "काँच की सिल्ली का अपवर्तनांक = ... (≈1.5)",
      precautions: ["पिन सीधी, ड्रॉइंग शीट सपाट रखें।", "आँख की स्थिति स्थिर रखें।"]
    },
    {
      id: "p5", title: "अवतल लेंस से प्रतिबिंब की स्थिति", emoji: "🔦",
      aim: "उत्तल लेंस द्वारा बने प्रतिबिंब के लक्षण जानना।",
      apparatus: ["उत्तल लेंस", "स्क्रीन", "जलती मोमबत्ती", "मीटर स्केल"],
      principle: "लेंस सूत्र 1/f = 1/v − 1/u",
      procedure: [
        "मोमबत्ती लेंस से दूर रखें, स्क्रीन पर स्पष्ट प्रतिबिंब पकड़ें।",
        "u व v मापें; सूत्र से f निकालें।",
        "अलग-अलग दूरियों पर दोहराते रहें।"
      ],
      observation: "वस्तु 2F से दूर → छोटा वास्तविक प्रतिबिंब।",
      result: "लेंस की फोकस दूरी f = ... cm प्राप्त हुई।",
      precautions: ["प्रतिबिंब तीक्ष्ण होने पर ही मापें।", "लेंस को साफ रखें।"]
    }
  ],
  chemistry: [
    {
      id: "c1", title: "धातुओं की क्रियाशीलता", emoji: "🧪",
      aim: "विभिन्न धातुओं की क्रियाशीलता की तुलना।",
      apparatus: ["धातुएँ — Zn, Cu, Fe, Mg", "तनु HCl", "परीक्षण नली", "चिमटा"],
      principle: "क्रियाशील धातु अम्ल से H₂ गैस छोड़ती है; क्रिया की तीव्रता से श्रेणी।",
      procedure: [
        "हर धातु की छोटी-सी पट्टी अलग परीक्षण नली में रखें।",
        "हर नली में तनु HCl डालें और गैस-ध्वनि (पॉप) देखें।",
        "क्रिया की तीव्रता के अनुसार क्रम लगाएँ।"
      ],
      observation: "Mg सबसे तीव्र; Cu बिल्कुल भी अभिक्रिया नहीं।",
      result: "क्रियाशीलता: Mg > Zn > Fe > Cu",
      precautions: ["अम्ल छींटों से बचें।", "हाथ दूर रखें; आँखों में न जाने दें।"]
    },
    {
      id: "c2", title: "अम्ल-क्षारक का उदासीनीकरण", emoji: "⚗️",
      aim: "अम्ल व क्षारक की अभिक्रिया से लवण-जल का बनना दर्शाना।",
      apparatus: ["तनु HCl", "NaOH विलयन", "फिनॉल्फ्थेलिन", "परीक्षण नली", "ब्यूरेट/पिपेट"],
      principle: "HCl + NaOH → NaCl + H₂O (उदासीनीकरण)",
      procedure: [
        "नली में NaOH डालकर फिनॉल्फ्थेलिन की 2 बूँदें डालें (गुलाबी)।",
        "ब्यूरेट से HCl डालते जाएँ जब तक रंग उड़ न जाए।",
        "रंग बदलना दर्शाता है कि अम्ल-क्षार बराबर हुए।"
      ],
      observation: "क्षारीय विलयन गुलाबी, उदासीनीकरण पर रंगहीन।",
      result: "अम्ल + क्षारक → लवण + जल; pH 7।",
      precautions: ["आँख व त्वचा पर न छिड़कें।", "टाइट्रेशन की बूँदें धीमी रखें।"]
    },
    {
      id: "c3", title: "जल का विद्युत अपघटन", emoji: "💧",
      aim: "विद्युत धारा से जल का H₂ व O₂ में विभाजन।",
      apparatus: ["हॉफमैन उपकरण", "बैटरी (6V)", "तनु H₂SO₄", "तार"],
      principle: "2H₂O → 2H₂ + O₂; H₂ : O₂ = 2 : 1 आयतन।",
      procedure: [
        "उपकरण में तनु H₂SO₄ भरें।",
        "बैटरी के दोनों ध्रुव प्रवाहित करें।",
        "गैसों का संग्रह देखें — अनुपात नोट करें।"
      ],
      observation: "कैथोड पर 2 भाग H₂, एनोड पर 1 भाग O₂।",
      result: "जल के अपघटन से हाइड्रोजन (2) : ऑक्सीजन (1) — सूत्र जल का।",
      precautions: ["आँखों में अम्ल न जाए।", "नीचे गैस एकत्रित हो।"]
    },
    {
      id: "c4", title: "ताँबे के सल्फेट से लोहे का विस्थापन", emoji: "🟠",
      aim: "लोहे की ताँबे से अधिक क्रियाशीलता दर्शाना।",
      apparatus: ["लोहे की कील", "CuSO₄ विलयन", "परीक्षण नली"],
      principle: "Fe + CuSO₄ → FeSO₄ + Cu; Fe अधिक क्रियाशील।",
      procedure: [
        "CuSO₄ के नीले विलयन में लोहे की कील डालें।",
        "कुछ देर बाद कील पर ताँबे का लेप देखें।",
        "नीले विलयन का रंग हरा (FeSO₄) हो जाता है।"
      ],
      observation: "कील पर लाल-कत्थई ताँबा; विलयन हरा।",
      result: "अधिक क्रियाशील धातु ने कम क्रियाशील को विस्थापित किया।",
      precautions: ["कील को चमकदार रखें (सैंडपेपर से)।", "कुछ समय बाद ही नोट करें।"]
    },
    {
      id: "c5", title: "कार्बन डाइऑक्साइड की पहचान", emoji: "💨",
      aim: "चूना-जल में CO₂ का प्रभाव दर्शाना।",
      apparatus: ["चूना-जल (Lime water)", "नली", "मोमबत्ती", "गिलास"],
      principle: "CO₂ + Ca(OH)₂ → CaCO₃ + H₂O (दूधिया); अधिक CO₂ विलीन → पुनः स्पष्ट।",
      procedure: [
        "गिलास में चूना-जल लें।",
        "उसमें CO₂ प्रवाहित करें।",
        "दूधियापन आना CO₂ का संकेत।"
      ],
      observation: "चूना-जल दूधिया हो जाता है।",
      result: "प्रयोग से CO₂ की पहचान होती है।",
      precautions: ["गैस धीरे-धीरे प्रवाहित करें।"]
    },
    {
      id: "c6", title: "बेकिंग सोडा ताप अपघटन", emoji: "🍞",
      aim: "NaHCO₃ के तापन से CO₂ निकलने को दर्शाना।",
      apparatus: ["NaHCO₃", "तापन चिमटा", "स्पिरिट लैंप", "चूना-जल"],
      principle: "2NaHCO₃ →(ताप) Na₂CO₃ + CO₂ + H₂O",
      procedure: [
        "चम्मच में NaHCO₃ लेकर गरम करें।",
        "निकली गैस को चूना-जल से गुज़ारें — दूधियापन।",
        "पानी की बूँदें दिखेंगी — CO₂ + जल अपघटन।"
      ],
      observation: "चूना-जल दूधिया; बूँदें; शेष Na₂CO₃।",
      result: "बेकिंग सोडा ताप पर CO₂ छोड़ता है — उदाहरण अपघटन।",
      precautions: ["चिमटे से पकड़ें; स्टैंड पर ही गरम करें।"]
    },
    {
      id: "c7", title: "धातुओं की इलेक्ट्रॉन-दान व अम्ल-क्षार परीक्षण", emoji: "🧫",
      aim: "लाल-नीला लिटमस द्वारा अम्ल/क्षार की पहचान।",
      apparatus: ["लिटमस पेपर (न/लाल)", "तनु अम्ल", "तनु क्षार", "ड्रॉपर"],
      principle: "अम्ल में नीला लिटमस लाल, क्षार में लाल लिटमस नीला।",
      procedure: [
        "नीले लिटमस पर अम्ल की बूँद डालें — लाल रंग।",
        "लाल लिटमस पर क्षार की बूँद डालें — नीला रंग।",
        "मेथिल ऑरेंज से भी जाँचे।"
      ],
      observation: "अम्ल लाल करता है, क्षार नीला।",
      result: "लिटमस अम्ल-क्षार की पहचान का साधन है।",
      precautions: ["बूँदें सीमित रखें; आँख से दूर।"]
    },
    {
      id: "c8", title: "खाना पकाने में सोडा (NaHCO₃) का उपयोग", emoji: "🥘",
      aim: "खाने की मिठास/फुलकापन में सोडा की भूमिका।",
      apparatus: ["NaHCO₃", "सिरका (acetic acid)", "गिलास", "चम्मच"],
      principle: "सिरका + सोडा → CO₂ फिज़ — इसी प्रकार आटा फूलता है।",
      procedure: [
        "गिलास में सिरका डालें।",
        "उसमें सोडा डालें — फिज़ एवं बुलबुले।",
        "CO₂ के कारण आटा फूलता है।"
      ],
      observation: "बुलबुले (CO₂) का तेज़ विकास।",
      result: "बेकिंग सोडा CO₂ छोड़कर खाना फूलाता है।",
      precautions: ["जल्दी से देखें, ओवरफ्लो से बचें।"]
    }
  ],
  biology: [
    {
      id: "b1", title: "ऑक्सीजन की उपस्थिति के लिए CO₂ परीक्षण", emoji: "🌿",
      aim: "प्रकाश संश्लेषण में CO₂ व प्रकाश की आवश्यकता दर्शाना।",
      apparatus: ["पत्ती (हाइड्रिला/स्पिरोगाइरा)", "बीकर", "पानी", "बंद बोतल"],
      principle: "प्रकाश संश्लेषण में CO₂ + H₂O + प्रकाश → ग्लूकोज़ + O₂",
      procedure: [
        "हाइड्रिला पौधे को प्रकाश में रखा बीकर में पानी",
        "कुछ देर बाद बुलबुले उठते दिखेंगे — O₂।",
        "छाया में वही बुलबुले कम होंगे।"
      ],
      observation: "प्रकाश में O₂ बुलबुले अधिक।",
      result: "प्रकाश की उपस्थिति ही O₂ उत्पादन की शर्त।",
      precautions: ["पौधा स्वस्थ व बीकर साफ रखें।"]
    },
    {
      id: "b2", title: "मानव हृदय की धड़कन (नाड़ी) परीक्षण", emoji: "❤️",
      aim: "नाड़ी का मापन व व्यायाम का प्रभाव जानना।",
      apparatus: ["स्टॉपवॉच", "उँगली (अंदरूनी धमनी)"],
      principle: "हृदयगति रक्त में ऑक्सीजन की माँग बढ़ने से बढ़ती है।",
      procedure: [
        "विश्रांत स्थिति में 15 सेकंड में नाड़ी गिनें।",
        "30 स्क्वाट के बाद फिर गिनें।",
        "सामान्य लय (प्रति मिनट) बनाएँ।"
      ],
      observation: "व्यायाम के बाद नाड़ी बढ़ जाती है।",
      result: "शारीरिक परिश्रम से हृदयगति बढ़ती है — परिवहन की आवश्यकता।",
      precautions: ["थकान से बचें; सतत 15 सेकंड गिनें।"]
    },
    {
      id: "b3", title: "स्टोमेटा की सूक्ष्मदर्शी अवलोकन", emoji: "🔬",
      aim: "पौधों की पत्ती में रंध्र (stomata) देखना।",
      apparatus: ["पत्ती (ट्रेडीस्केंटिया)", "सूक्ष्मदर्शी", "स्लाइड", "पानी", "कवर स्लिप"],
      principle: "रंध्र पत्ती की सतह पर होते हैं — गैस विनिमय का छिद्र।",
      procedure: [
        "पत्ती की निचली सतह की पतली परत निकालें।",
        "स्लाइड पर पानी व कवर स्लिप रखें।",
        "सूक्ष्मदर्शी से देखें।"
      ],
      observation: "असंख्य छोटे-छोटे रंध्र।",
      result: "रंध्र व उनके संरक्षक कोशिकाएँ स्पष्ट दिखती हैं।",
      precautions: ["हल्का कवर स्लिप, न कोई नुकीला टुकड़ा।"]
    },
    {
      id: "b4", title: "मनुष्य के रुधिर (blood) का अध्ययन", emoji: "🩸",
      aim: "रक्त की संरचना (RBC, WBC, प्लेटलेट्स) समझाना।",
      apparatus: ["रक्त स्मीयर (स्लाइड)", "सूक्ष्मदर्शी", "डाई (Leishman)"],
      principle: "रक्त संयोजी ऊतक है — प्लाज़्मा, RBC, WBC, प्लेटलेट्स।",
      procedure: [
        "रक्त की पतली परत स्लाइड पर फैलाएँ।",
        "रंग (डाय) करने के बाद लेंस से देखें।",
        "RBC (लाल), WBC (परमाणु वाले), प्लेटलेट्स गिनें।"
      ],
      observation: "RBC अधिक, WBC कम, प्लेटलेट्स सूक्ष्म।",
      result: "रक्त सभी घटकों से भरा परिवहन माध्यम है।",
      precautions: ["ग्लव्स पहनें; सुई-खून से बचें।"]
    },
    {
      id: "b5", title: "मटर के बीज की मध्यवर्ती जड़ अवलोकन", emoji: "🌱",
      aim: "अंकुरण व जड़-वृद्धि देखना।",
      apparatus: ["मटर के बीज", "नम कपड़ा", "टेस्ट ट्यूब", "पानी"],
      principle: "उचित आर्द्रता-ताप में बीज अंकुरित होकर जड़ निकलती है।",
      procedure: [
        "बीजों को नम कपड़े में रखें — 3-4 दिन।",
        "जड़ के उगने की नियमित निगरानी करें।",
        "लंबाई मापें; ग्राफ़ बनाएँ।"
      ],
      observation: "समय के साथ जड़ बढ़ती है (अंकुरण)।",
      result: "अंकुरण की दिशा — जड़ गुरुत्वानुवर्तन (नीचे)।",
      precautions: ["कपड़ा नम रखें, धूप में न रखें।"]
    },
    {
      id: "b6", title: "पादप में जल का परिवहन (जाइलम)", emoji: "💦",
      aim: "जाइलम द्वारा जल के ऊपर जाने को देखना।",
      apparatus: ["बसंत/चमेली की शाखा", "काँच", "लाल स्याही", "पानी"],
      principle: "जाइलम ही जल-परिवहन नलिकाएँ हैं।",
      procedure: [
        "शाखा को लाल स्याही वाले पानी में रखें।",
        "कुछ घंटों बाद शाखा की नई परत काटें।",
        "आंतरिक लाल निशान जाइलम का संकेत।"
      ],
      observation: "कटे तने में लाल धारियाँ (जाइलम वाहिनियाँ)।",
      result: "जल जाइलम से होकर पत्तियों तक पहुँचता है।",
      precautions: ["ताज़ी शाखा लें; 2-3 घंटे प्रतीक्षा करें।"]
    }
  ]
};

function renderExperiments(el, subject) {
  const container = document.getElementById(el);
  if (!container) return;
  const list = EXPERIMENTS[subject];
  if (!list) { container.innerHTML = '<p class="muted">विषय नहीं मिला।</p>'; return; }
  const colors = { physics:"#7c3aed", chemistry:"#0d9488", biology:"#16a34a" };
  const col = colors[subject] || "#6366f1";
  let html = '';
  list.forEach(exp => {
    html += `<div class="experiment-card">
      <div class="exp-head" style="background:linear-gradient(120deg,${col},#4f46e5)">
        ${exp.emoji} ${exp.title}
      </div>
      <div class="exp-body">
        <div class="exp-tabs" id="tabs-${exp.id}">
          <div class="exp-tab-row">
            <button class="tab active" data-tab="aim" onclick="switchExpTab('${exp.id}','aim',this)">🎯 उद्देश्य</button>
            <button class="tab" data-tab="principle" onclick="switchExpTab('${exp.id}','principle',this)">📌 सिद्धांत</button>
            <button class="tab" data-tab="apparatus" onclick="switchExpTab('${exp.id}','apparatus',this)">🔧 सामान</button>
            <button class="tab" data-tab="procedure" onclick="switchExpTab('${exp.id}','procedure',this)">📋 विधि</button>
            <button class="tab" data-tab="observation" onclick="switchExpTab('${exp.id}','observation',this)">🔎 अवलोकन</button>
            <button class="tab" data-tab="result" onclick="switchExpTab('${exp.id}','result',this)">✅ परिणाम</button>
          </div>
          <div class="exp-content" id="content-${exp.id}">
            <div class="exp-step"><b>🎯 उद्देश्य:</b> ${exp.aim}</div>
          </div>
        </div>
      </div>
    </div>`;
  });
  container.innerHTML = html;
}

function switchExpTab(expId, tab, btn) {
  const tabs = document.querySelectorAll(`#tabs-${expId} .tab`);
  tabs.forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const exp = findExperiment(expId);
  if (!exp) return;
  const content = document.getElementById(`content-${expId}`);
  if (!content) return;
  let html = '';
  const labels = { aim:"🎯 उद्देश्य", principle:"📌 सिद्धांत", apparatus:"🔧 आवश्यक सामान", procedure:"📋 विधि", observation:"🔎 अवलोकन", result:"✅ परिणाम", precautions:"⚠️ सावधानियाँ" };
  if (tab === 'aim') {
    html = `<div class="exp-step"><b>🎯 उद्देश्य:</b> ${exp.aim}</div>`;
  } else if (tab === 'principle') {
    html = `<div class="exp-step"><b>📌 सिद्धांत:</b> ${exp.principle}</div>`;
  } else if (tab === 'apparatus') {
    html = exp.apparatus.map(a=>`<div class="exp-step">🔧 ${a}</div>`).join('');
  } else if (tab === 'procedure') {
    html = exp.procedure.map((p,i)=>`<div class="exp-step"><b>चरण ${i+1}:</b> ${p}</div>`).join('');
  } else if (tab === 'observation') {
    html = `<div class="exp-step"><b>🔎 अवलोकन:</b> ${exp.observation}</div>`;
  } else if (tab === 'result') {
    html = `<div class="exp-step"><b>✅ परिणाम:</b> ${exp.result}</div>` + (exp.precautions? `<div class="callout callout-warn mt-20"><b>⚠️ सावधानियाँ:</b></div>`+exp.precautions.map(p=>`<div class="exp-step">⚠️ ${p}</div>`).join('') : '');
  }
  content.innerHTML = html;
}

function findExperiment(id) {
  for (const subj in EXPERIMENTS) {
    for (const e of EXPERIMENTS[subj]) {
      if (e.id === id) return e;
    }
  }
  return null;
}

// ============================================================
//  INTERACTIVE CHEMISTRY MIXER — drag & drop reactions
// ============================================================

const CHEMICALS = {
  hcl:    { id:'hcl',    name:'तनु हाइड्रोक्लोरिक अम्ल',    f:'HCl',      color:'#d9f99d',   liquid:true,  emoji:'🧴', kind:'अम्ल (Acid)' },
  nahco3: { id:'nahco3', name:'बेकिंग सोडा घोल',             f:'NaHCO₃',   color:'#f1f5f9',   liquid:true,  emoji:'🥛', kind:'क्षार लवण' },
  naoh:   { id:'naoh',   name:'सोडियम हाइड्रॉक्साइड घोल',    f:'NaOH',     color:'#fef9c3',   liquid:true,  emoji:'🧪', kind:'क्षार (Base)' },
  cuso4:  { id:'cuso4',  name:'ताँबा सल्फेट घोल (नीला)',      f:'CuSO₄',    color:'#bfdbfe',   liquid:true,  emoji:'🟦', kind:'धातु लवण' },
  feso4:  { id:'feso4',  name:'फेरस सल्फेट घोल (हरा)',        f:'FeSO₄',    color:'#a7f3d0',   liquid:true,  emoji:'🟩', kind:'धातु लवण' },
  agno3:  { id:'agno3',  name:'सिल्वर नाइट्रेट घोल',          f:'AgNO₃',    color:'#e2e8f0',   liquid:true,  emoji:'🧊', kind:'धातु लवण' },
  kmno4:  { id:'kmno4',  name:'पोटैशियम परमैंगनेट (बैंगनी)',   f:'KMnO₄',    color:'#ddd6fe',   liquid:true,  emoji:'🟣', kind:'ऑक्सीकारक' },
  h2o:    { id:'h2o',    name:'जल (पानी)',                   f:'H₂O',      color:'#e0f2fe',   liquid:true,  emoji:'💧', kind:'विलायक' },
  zn:     { id:'zn',     name:'जिंक धातु (दाने)',             f:'Zn',       color:'#bae6fd',   liquid:false, emoji:'⚙️', kind:'धातु' },
  fe:     { id:'fe',     name:'लोहे की कील',                  f:'Fe',       color:'#e2e8f0',   liquid:false, emoji:'🔩', kind:'धातु' },
  mg:     { id:'mg',     name:'मैग्नीशियम रिबन',              f:'Mg',       color:'#fef08a',   liquid:false, emoji:'✨', kind:'धातु' },
  caco3:  { id:'caco3',  name:'चूना-पत्थर (चाक)',             f:'CaCO₃',    color:'#f8fafc',   liquid:false, emoji:'🪨', kind:'कार्बोनेट अयस्क' },
  h2o2:   { id:'h2o2',   name:'हाइड्रोजन पेरॉक्साइड',         f:'H₂O₂',     color:'#cffafe',   liquid:true,  emoji:'🧋', kind:'ऑक्सीकारक' },
  h2so4:  { id:'h2so4',  name:'तनु सल्फ्यूरिक अम्ल',           f:'H₂SO₄',    color:'#fee2e2',   liquid:true,  emoji:'🧴', kind:'अम्ल (Acid)' },
  hno3:   { id:'hno3',   name:'तनु नाइट्रिक अम्ल',             f:'HNO₃',     color:'#ffedd5',   liquid:true,  emoji:'🧴', kind:'अम्ल (Acid)' },
  koh:    { id:'koh',    name:'पोटैशियम हाइड्रॉक्साइड घोल',    f:'KOH',      color:'#fef9c3',   liquid:true,  emoji:'🧪', kind:'क्षार (Base)' },
  nacl:   { id:'nacl',   name:'नमक (सोडियम क्लोराइड) घोल',     f:'NaCl',     color:'#f1f5f9',   liquid:true,  emoji:'🧂', kind:'लवण' },
  ki:     { id:'ki',     name:'पोटैशियम आयोडाइड घोल',          f:'KI',       color:'#e0f2fe',   liquid:true,  emoji:'🧊', kind:'लवण' },
  pbno3:  { id:'pbno3',  name:'लेड नाइट्रेट घोल',              f:'Pb(NO₃)₂', color:'#fce7f3',   liquid:true,  emoji:'🫙', kind:'धातु लवण' },
  cacl2:  { id:'cacl2',  name:'कैल्शियम क्लोराइड घोल',         f:'CaCl₂',    color:'#f8fafc',   liquid:true,  emoji:'🧊', kind:'धातु लवण' },
  al:     { id:'al',     name:'एल्युमिनियम फॉइल',              f:'Al',       color:'#e2e8f0',   liquid:false, emoji:'🪙', kind:'धातु' },
  cu:     { id:'cu',     name:'ताँबे की डोरी',                 f:'Cu',       color:'#fed7aa',   liquid:false, emoji:'🟠', kind:'धातु' },
  na2co3: { id:'na2co3', name:'सोडियम कार्बोनेट (वाशिंग सोडा)', f:'Na₂CO₃',   color:'#e0f2fe',   liquid:true,  emoji:'🧂', kind:'कार्बोनेट लवण' },
  bacl2:  { id:'bacl2',  name:'बेरियम क्लोराइड घोल',            f:'BaCl₂',    color:'#f8fafc',   liquid:true,  emoji:'🧫', kind:'धातु लवण' },
  na2so4: { id:'na2so4', name:'सोडियम सल्फेट घोल',             f:'Na₂SO₄',   color:'#f1f5f9',   liquid:true,  emoji:'🧂', kind:'धातु लवण' },
  ca:     { id:'ca',     name:'चूना (कैल्शियम ऑक्साइड)',        f:'CaO',      color:'#fef3c7',   liquid:false, emoji:'🪨', kind:'धातु ऑक्साइड' },
  ch3cooh:{ id:'ch3cooh',name:'सिरका (एसिटिक अम्ल)',            f:'CH₃COOH',  color:'#fde68a',   liquid:true,  emoji:'🍶', kind:'कार्बनिक अम्ल' },
  soap:   { id:'soap',   name:'साबुन का घोल',                  f:'C₁₇H₃₅COONa', color:'#fbcfe8', liquid:true, emoji:'🫧', kind:'साबुन (सोडियम लवण)' },
  fecl3:  { id:'fecl3',  name:'फेरिक क्लोराइड घोल (पीला)',       f:'FeCl₃',    color:'#fed7aa',   liquid:true,  emoji:'🧡', kind:'धातु लवण' }
};

const REACTIONS = {
  'hcl+naoh':   { eq:'HCl + NaOH → NaCl + H₂O',              type:'उदासीनीकरण अभिक्रिया',   obs:'साफ (रंगहीन) घोल — लवण NaCl और जल बने। थोड़ी गर्मी निकलती है। pH 7।', sol:'#e2e8f0', gas:false, heat:true },
  'hcl+zn':     { eq:'Zn + 2HCl → ZnCl₂ + H₂↑',              type:'विस्थापन — हाइड्रोजन गैस', obs:'हाइड्रोजन गैस के बुलबुले तेज़ी से उठे। जलती तीली पास ले जाओ — "पॉप" की आवाज़! (हाइड्रोजन की पहचान)', sol:'#fef9c3', gas:true, heat:false },
  'hcl+mg':     { eq:'Mg + 2HCl → MgCl₂ + H₂↑',              type:'विस्थापन — हाइड्रोजन गैस', obs:'जोरदार घुलना + हाइड्रोजन के बुलबुले। क्रिया जिंक से भी तेज़ — Mg बहुत क्रियाशील।', sol:'#fef9c3', gas:true, heat:true },
  'hcl+fe':     { eq:'Fe + 2HCl → FeCl₂ + H₂↑',              type:'विस्थापन — हाइड्रोजन गैस', obs:'धीमे-धीमे बुलबुले — हाइड्रोजन गैस। लोहा जिंक/मैग्नीशियम से कम क्रियाशील।', sol:'#fef9c3', gas:true, heat:false },
  'hcl+nahco3': { eq:'NaHCO₃ + HCl → NaCl + CO₂↑ + H₂O',     type:'अम्ल + कार्बोनेट',        obs:'जोरदार झाग (फिज़) — कार्बन डाइऑक्साइड गैस निकली। इस गैस को चूना-जल में डालो — दूधिया होगा।', sol:'#f1f5f9', gas:true, heat:false },
  'hcl+caco3':  { eq:'CaCO₃ + 2HCl → CaCl₂ + CO₂↑ + H₂O',    type:'अम्ल + कार्बोनेट',        obs:'चूना-पत्थर घुला — CO₂ के बुलबुले। (चूना-जल दूधिया परीक्षण इसे पहचानता है।)', sol:'#e0f2fe', gas:true, heat:false },
  'hcl+agno3':  { eq:'AgNO₃ + HCl → AgCl↓ + HNO₃',           type:'परिक्षेपण (Precipitate)', obs:'सफेद अवक्षेप (AgCl) नीचे बैठा। अम्ल की पहचान — सिल्वर क्लोराइड का सफेद भारी घोल।', sol:'#f8fafc', gas:false, precip:'सफेद अवक्षेप', heat:false },
  'cuso4+fe':   { eq:'Fe + CuSO₄ → FeSO₄ + Cu',              type:'विस्थापन अभिक्रिया',      obs:'नीला घोल हरा (FeSO₄) हुआ और कील पर लाल-कत्थई ताँबा जम गया। लोहा ताँबे से अधिक क्रियाशील।', sol:'#a7f3d0', gas:false, precip:'लाल-कत्थई ताँबा', heat:false },
  'cuso4+zn':   { eq:'Zn + CuSO₄ → ZnSO₄ + Cu',              type:'विस्थापन अभिक्रिया',      obs:'नीला घोल साफ हुआ; जिंक पर ताँबे की लाल परत जमी। जिंक ताँबे से अधिक क्रियाशील।', sol:'#f1f5f9', gas:false, precip:'लाल ताँबा', heat:false },
  'naoh+cuso4': { eq:'2NaOH + CuSO₄ → Cu(OH)₂↓ + Na₂SO₄',    type:'द्विविस्थापन — अवक्षेप', obs:'नीला गाढ़ा अवक्षेप (Cu(OH)₂) बना। Cu²⁺ आयन की उपस्थिति का परीक्षण।', sol:'#93c5fd', gas:false, precip:'हल्का-नीला Cu(OH)₂', heat:false },
  'naoh+feso4': { eq:'2NaOH + FeSO₄ → Fe(OH)₂↓ + Na₂SO₄',    type:'द्विविस्थापन — अवक्षेप', obs:'गंदा-हरा अवक्षेप Fe(OH)₂ बना जो धीरे-धीरे भूरा हो जाता है (Fe(OH)₃ मंद)।', sol:'#86efac', gas:false, precip:'हरा → भूरा अवक्षेप', heat:false },
  'kmno4+h2o2': { eq:'2KMnO₄ + 3H₂O₂ → 2KOH + 2MnO₂ + 3O₂↑ + 2H₂O', type:'ऑक्सीकरण-अपचयन', obs:'बैंगनी रंग उड़ता गया और ऑक्सीजन गैस के बुलबुले उठे। जलती तीली और तेज़ जलती है (O₂ की पहचान)।', sol:'#e2e8f0', gas:true, heat:true },
  'naoh+zn':    { eq:'Zn + 2NaOH + 2H₂O → Na₂[Zn(OH)₄] + H₂↑', type:'एम्फोटेरिक धातु',      obs:'जिंक क्षार में घुलकर हाइड्रोजन गैस देता है — जिंक ऐम्फोटेरिक धातु (अम्ल व क्षार दोनों से अभिक्रिया)।', sol:'#d9f99d', gas:true, heat:false },
  'h2o+naoh':   { eq:'NaOH(s/conc) + H₂O → NaOH(aq) + ताप',  type:'विलयन — ऊष्माक्षेपी',    obs:'घुलते ही तेज़ गर्मी निकली — विलयन गर्म हो गया। (सावधान: ठोस NaOH को पानी में घोलना खतरनाक हो सकता है।)', sol:'#fef9c3', gas:false, heat:true, skipBal:true },
  'h2o+kmno4':  { eq:'KMnO₄ + H₂O → KMnO₄(aq)',              type:'विलयन',                  obs:'गहरा बैंगनी विलयन बना। (परीक्षण: KMnO₄ ऑक्सीकारक है।)', sol:'#ddd6fe', gas:false, heat:false, skipBal:true },
  'h2o+cuso4':  { eq:'CuSO₄ + H₂O → CuSO₄(aq)',              type:'विलयन',                  obs:'नीला विलयन — ताँबा सल्फेट पानी में घुल गया।', sol:'#bfdbfe', gas:false, heat:false, skipBal:true },
  'h2o+feso4':  { eq:'FeSO₄ + H₂O → FeSO₄(aq)',              type:'विलयन',                  obs:'हरा विलयन बना।', sol:'#a7f3d0', gas:false, heat:false, skipBal:true },
  'h2o+agno3':  { eq:'AgNO₃ + H₂O → AgNO₃(aq)',              type:'विलयन',                  obs:'साफ विलयन — कोई गैस या अवक्षेप नहीं।', sol:'#e2e8f0', gas:false, heat:false, skipBal:true },
  'h2o+hcl':    { eq:'HCl + H₂O → H₃O⁺ + Cl⁻',               type:'तनुकरण',                 obs:'अम्ल घुला — घोल अम्लीय (नीला लिटमस लाल)। हल्की गर्मी।', sol:'#d9f99d', gas:false, heat:true },
  'h2o+nahco3': { eq:'NaHCO₃ + H₂O → NaHCO₃(aq)',            type:'विलयन',                  obs:'बेकिंग सोडा घुला — कोई गैस नहीं (CO₂ बिना अम्ल के नहीं निकलती)।', sol:'#f1f5f9', gas:false, heat:false, skipBal:true },
  'h2o+zn':     { eq:'Zn + H₂O → कोई अभिक्रिया नहीं',        type:'अभिक्रिया नहीं',         obs:'जिंक पानी में नहीं घुला — धातु जमी रही। (केवल भाप/गर्म जल के साथ धीमी अभिक्रिया)', sol:'#e0f2fe', gas:false, heat:false, skipBal:true },
  'h2o+fe':     { eq:'Fe + H₂O → बहुत धीमी (जंग लगना)',      type:'धीमी अभिक्रिया',         obs:'कोई तुरंत परिवर्तन नहीं — गीले लोहे पर धीरे-धीरे जंग (rust) लगती है (Fe + O₂ + H₂O)।', sol:'#f1f5f9', gas:false, heat:false, skipBal:true },
  'h2o+mg':     { eq:'Mg + 2H₂O → Mg(OH)₂ + H₂↑ (धीमी)',     type:'धीमी अभिक्रिया',         obs:'साधारण पानी से बहुत धीमे बुलबुले — गर्म जल से तेज़। (मैग्नीशियम हल्का गर्म पानी में जलता है।)', sol:'#fef9c3', gas:true, heat:false },
  'h2o+h2o2':   { eq:'H₂O₂ →(धीमा) H₂O + ½O₂↑',              type:'स्व-अपघटन',              obs:'धीरे-धीरे ही ऑक्सीजन के बुलबुले। कुछ भी जोड़ने पर fast? — हे, बस पानी में मिलाया।', sol:'#cffafe', gas:true, heat:false, skipBal:true },
  'h2so4+zn':   { eq:'Zn + H₂SO₄ → ZnSO₄ + H₂↑',             type:'विस्थापन — हाइड्रोजन गैस', obs:'जिंक में अम्ल डालते ही हाइड्रोजन के बुलबुले उठे। तीली पास करो — "पॉप"!', sol:'#e0f2fe', gas:true, heat:true },
  'h2so4+mg':   { eq:'Mg + H₂SO₄ → MgSO₄ + H₂↑',             type:'विस्थापन — हाइड्रोजन गैस', obs:'मैग्नीशियम तेज़ी से घुला — हाइड्रोजन गैस। क्रिया बहुत तीव्र, हल्की गर्मी।', sol:'#e0f2fe', gas:true, heat:true },
  'h2so4+fe':   { eq:'Fe + H₂SO₄ → FeSO₄ + H₂↑',             type:'विस्थापन — हाइड्रोजन गैस', obs:'धीमे बुलबुले — हाइड्रोजन गैस निकली।', sol:'#a7f3d0', gas:true, heat:false },
  'h2so4+al':   { eq:'2Al + 3H₂SO₄ → Al₂(SO₄)₃ + 3H₂↑',      type:'विस्थापन — हाइड्रोजन गैस', obs:'एल्युमिनियम घुला — हाइड्रोजन गैस के बुलबुले।', sol:'#e0f2fe', gas:true, heat:true },
  'h2so4+nahco3':{ eq:'2NaHCO₃ + H₂SO₄ → Na₂SO₄ + 2CO₂↑ + 2H₂O',  type:'अम्ल + कार्बोनेट',   obs:'जोरदार फिज़ — कार्बन डाइऑक्साइड गैस।', sol:'#f1f5f9', gas:true, heat:false },
  'h2so4+caco3': { eq:'CaCO₃ + H₂SO₄ → CaSO₄ + CO₂↑ + H₂O',  type:'अम्ल + कार्बोनेट',        obs:'चूना-पत्थर घुला — CO₂ बुलबुले।', sol:'#e0f2fe', gas:true, heat:false },
  'h2so4+naoh': { eq:'H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O',        type:'उदासीनीकरण अभिक्रिया',   obs:'अम्ल-क्षार उदासीनीकरण — लवण + जल, थोड़ी गर्मी। pH 7।', sol:'#e2e8f0', gas:false, heat:true },
  'h2so4+koh':  { eq:'H₂SO₄ + 2KOH → K₂SO₄ + 2H₂O',          type:'उदासीनीकरण अभिक्रिया',   obs:'लवण K₂SO₄ + जल बना।', sol:'#e2e8f0', gas:false, heat:true },
  'hno3+naoh':  { eq:'HNO₃ + NaOH → NaNO₃ + H₂O',            type:'उदासीनीकरण अभिक्रिया',   obs:'उदासीनीकरण — सोडियम नाइट्रेट + जल, हल्की गर्मी।', sol:'#e2e8f0', gas:false, heat:true },
  'hno3+koh':   { eq:'HNO₃ + KOH → KNO₃ + H₂O',              type:'उदासीनीकरण अभिक्रिया',   obs:'लवण KNO₃ + जल — उदासीन विलयन।', sol:'#e2e8f0', gas:false, heat:true },
  'hno3+nahco3':{ eq:'NaHCO₃ + HNO₃ → NaNO₃ + CO₂↑ + H₂O',   type:'अम्ल + कार्बोनेट',        obs:'फिज़ — कार्बन डाइऑक्साइड गैस निकली।', sol:'#f1f5f9', gas:true, heat:false },
  'hno3+caco3': { eq:'CaCO₃ + 2HNO₃ → Ca(NO₃)₂ + CO₂↑ + H₂O', type:'अम्ल + कार्बोनेट',       obs:'चूना-पत्थर घुला — CO₂ बुलबुले (चूना-जल दूधिया परीक्षण करो)।', sol:'#e0f2fe', gas:true, heat:false },
  'hno3+zn':    { eq:'Zn + 2HNO₃ → Zn(NO₃)₂ + H₂↑',          type:'विस्थापन — हाइड्रोजन गैस', obs:'बुलबुले — हाइड्रोजन गैस। (सांद्र HNO₃ से NO₂ गैस भी बन सकती है।)', sol:'#e0f2fe', gas:true, heat:false },
  'hno3+mg':    { eq:'Mg + 2HNO₃ → Mg(NO₃)₂ + H₂↑',          type:'विस्थापन — हाइड्रोजन गैस', obs:'मैग्नीशियम तेज़ घुला — हाइड्रोजन गैस।', sol:'#e0f2fe', gas:true, heat:true },
  'hno3+al':    { eq:'2Al + 6HNO₃ → 2Al(NO₃)₃ + 3H₂↑',       type:'विस्थापन — हाइड्रोजन गैस', obs:'एल्युमिनियम घुला — हाइड्रोजन बुलबुले।', sol:'#e0f2fe', gas:true, heat:false },
  'hcl+kmno4':  { eq:'2KMnO₄ + 16HCl → 2KCl + 2MnCl₂ + 5Cl₂↑ + 8H₂O', type:'रेडॉक्स — क्लोरीन गैस', obs:'पीली-हरी क्लोरीन गैस की गंध व बुलबुले! (खतरनाक — वर्चुअल ही रहो)', sol:'#fef9c3', gas:true, heat:false },
  'koh+hcl':    { eq:'KOH + HCl → KCl + H₂O',                type:'उदासीनीकरण अभिक्रिया',   obs:'KCl लवण + जल — उदासीन घोल, हल्की गर्मी।', sol:'#e2e8f0', gas:false, heat:true },
  'koh+cuso4':  { eq:'2KOH + CuSO₄ → Cu(OH)₂↓ + K₂SO₄',      type:'द्विविस्थापन — अवक्षेप',  obs:'नीला अवक्षेप Cu(OH)₂ बना।', sol:'#93c5fd', gas:false, precip:'नीला Cu(OH)₂', heat:false },
  'koh+feso4':  { eq:'2KOH + FeSO₄ → Fe(OH)₂↓ + K₂SO₄',      type:'द्विविस्थापन — अवक्षेप',  obs:'हरा अवक्षेप Fe(OH)₂ जो धीरे-धीरे भूरा।', sol:'#86efac', gas:false, precip:'हरा → भूरा', heat:false },
  'nacl+agno3': { eq:'AgNO₃ + NaCl → AgCl↓ + NaNO₃',         type:'द्विविस्थापन — अवक्षेप',  obs:'सफेद अवक्षेप AgCl — क्लोराइड आयन की पहचान।', sol:'#f8fafc', gas:false, precip:'सफेद AgCl', heat:false },
  'nacl+pbno3': { eq:'Pb(NO₃)₂ + 2NaCl → PbCl₂↓ + 2NaNO₃',   type:'द्विविस्थापन — अवक्षेप',  obs:'सफेद अवक्षेप PbCl₂ बना।', sol:'#f8fafc', gas:false, precip:'सफेद PbCl₂', heat:false },
  'ki+pbno3':   { eq:'Pb(NO₃)₂ + 2KI → PbI₂↓ + 2KNO₃',       type:'द्विविस्थापन — अवक्षेप',  obs:'चमकीला पीला अवक्षेप PbI₂ ("golden rain" परीक्षण)।', sol:'#fef08a', gas:false, precip:'पीला PbI₂', heat:false },
  'ki+agno3':   { eq:'AgNO₃ + KI → AgI↓ + KNO₃',             type:'द्विविस्थापन — अवक्षेप',  obs:'पीला-क्रीम अवक्षेप AgI बना।', sol:'#fef9c3', gas:false, precip:'पीला AgI', heat:false },
  'pbno3+naoh': { eq:'Pb(NO₃)₂ + 2NaOH → Pb(OH)₂↓ + 2NaNO₃', type:'द्विविस्थापन — अवक्षेप',  obs:'सफेद अवक्षेप Pb(OH)₂ बना।', sol:'#f8fafc', gas:false, precip:'सफेद Pb(OH)₂', heat:false },
  'cacl2+naoh': { eq:'CaCl₂ + 2NaOH → Ca(OH)₂↓ + 2NaCl',     type:'द्विविस्थापन — अवक्षेप',  obs:'सफेद चूना अवक्षेप Ca(OH)₂।', sol:'#f8fafc', gas:false, precip:'सफेद Ca(OH)₂', heat:false },
  'cacl2+agno3':{ eq:'2AgNO₃ + CaCl₂ → 2AgCl↓ + Ca(NO₃)₂',   type:'द्विविस्थापन — अवक्षेप',  obs:'सफेद AgCl अवक्षेप — क्लोराइड की पहचान।', sol:'#f8fafc', gas:false, precip:'सफेद AgCl', heat:false },
  'cacl2+cuso4':{ eq:'CaCl₂ + CuSO₄ → CaSO₄↓ + CuCl₂',       type:'द्विविस्थापन — अवक्षेप',  obs:'हल्का-सफेद अवक्षेप CaSO₄ (आंशिक घुलनशील)।', sol:'#e0f2fe', gas:false, precip:'हल्का सफेद CaSO₄', heat:false },
  'al+cuso4':   { eq:'2Al + 3CuSO₄ → Al₂(SO₄)₃ + 3Cu',       type:'विस्थापन अभिक्रिया',      obs:'एल्युमिनियम पर लाल-कत्थई ताँबा जमा — नीला घोल साफ हुआ।', sol:'#e0f2fe', gas:false, precip:'लाल ताँबा', heat:false },
  'al+feso4':   { eq:'2Al + 3FeSO₄ → Al₂(SO₄)₃ + 3Fe',       type:'विस्थापन अभिक्रिया',      obs:'एल्युमिनियम ने लोहे को विस्थापित किया — घोल साफ हुआ।', sol:'#f1f5f9', gas:false, precip:'लोहा', heat:false },
  'zn+feso4':   { eq:'Zn + FeSO₄ → ZnSO₄ + Fe',              type:'विस्थापन अभिक्रिया',      obs:'जिंक ने लोहे को विस्थापित किया — हरा घोल साफ।', sol:'#f1f5f9', gas:false, precip:'लोहा', heat:false },
  'mg+cuso4':   { eq:'Mg + CuSO₄ → MgSO₄ + Cu',              type:'विस्थापन अभिक्रिया',      obs:'मैग्नीशियम पर लाल ताँबा जमा — घोल साफ। Mg सबसे क्रियाशील!', sol:'#e0f2fe', gas:false, precip:'लाल ताँबा', heat:false },
  'mg+feso4':   { eq:'Mg + FeSO₄ → MgSO₄ + Fe',              type:'विस्थापन अभिक्रिया',      obs:'मैग्नीशियम ने लोहा विस्थापित किया।', sol:'#e0f2fe', gas:false, precip:'लोहा', heat:false },
  'fe+agno3':   { eq:'Fe + 2AgNO₃ → Fe(NO₃)₂ + 2Ag',         type:'विस्थापन अभिक्रिया',      obs:'लोहे पर चमकीली चाँदी जमी — घोल साफ।', sol:'#f1f5f9', gas:false, precip:'चाँदी', heat:false },
  'zn+agno3':   { eq:'Zn + 2AgNO₃ → Zn(NO₃)₂ + 2Ag',         type:'विस्थापन अभिक्रिया',      obs:'जिंक पर चाँदी की परत — चमकीली।', sol:'#f1f5f9', gas:false, precip:'चाँदी', heat:false },
  'cu+agno3':   { eq:'Cu + 2AgNO₃ → Cu(NO₃)₂ + 2Ag',         type:'विस्थापन अभिक्रिया',      obs:'ताँबे की डोरी पर चाँदी जमी — घोल हल्का नीला (Cu²⁺)।', sol:'#bfdbfe', gas:false, precip:'चाँदी', heat:false },

  'hcl+na2co3': { eq:'Na₂CO₃ + 2HCl → 2NaCl + CO₂↑ + H₂O',   type:'अम्ल + कार्बोनेट',         obs:'तेज़ फ़िज़-फ़िज़ — भारी CO₂ गैस के बुलबुले उठे।', sol:'#e0f2fe', gas:true, precip:false, heat:false },
  'h2so4+na2co3':{ eq:'Na₂CO₃ + H₂SO₄ → Na₂SO₄ + CO₂↑ + H₂O',type:'अम्ल + कार्बोनेट',         obs:'ठीक वैसे ही CO₂ गैस निकली — फ़िज़-फ़िज़।', sol:'#e0f2fe', gas:true, precip:false, heat:false },
  'hno3+na2co3':{ eq:'Na₂CO₃ + 2HNO₃ → 2NaNO₃ + CO₂↑ + H₂O', type:'अम्ल + कार्बोनेट',         obs:'CO₂ की फुहार — बुलबुले।', sol:'#e0f2fe', gas:true, precip:false, heat:false },
  'na2co3+cacl2':{ eq:'Na₂CO₃ + CaCl₂ → CaCO₃↓ + 2NaCl',     type:'द्विविस्थापन अभिक्रिया',   obs:'दूधिया-सफेद कैल्शियम कार्बोनेट का अवक्षेप (exact exam वाला प्रयोग)।', sol:'#f1f5f9', gas:false, precip:'कैल्शियम कार्बोनेट (सफेद)', heat:false },
  'na2co3+bacl2':{ eq:'Na₂CO₃ + BaCl₂ → BaCO₃↓ + 2NaCl',     type:'द्विविस्थापन अभिक्रिया',   obs:'सफेद बेरियम कार्बोनेट का अवक्षेप।', sol:'#f1f5f9', gas:false, precip:'बेरियम कार्बोनेट (सफेद)', heat:false },
  'bacl2+na2so4':{ eq:'BaCl₂ + Na₂SO₄ → BaSO₄↓ + 2NaCl',     type:'द्विविस्थापन अभिक्रिया',   obs:'सफेद अवक्षेप — घोलबंद (सल्फेट की पहचान; BaSO₄ अम्ल में भी नहीं घुलता)।', sol:'#f1f5f9', gas:false, precip:'बेरियम सल्फेट (सफेद)', heat:false },
  'bacl2+agno3':{ eq:'BaCl₂ + 2AgNO₃ → 2AgCl↓ + Ba(NO₃)₂',   type:'द्विविस्थापन अभिक्रिया',   obs:'दही-जैसा सफेद सिल्वर क्लोराइड (AgCl) अवक्षेप।', sol:'#f1f5f9', gas:false, precip:'सिल्वर क्लोराइड (सफेद)', heat:false },
  'pbno3+na2so4':{eq:'Pb(NO₃)₂ + Na₂SO₄ → PbSO₄↓ + 2NaNO₃',  type:'द्विविस्थापन अभिक्रिया',   obs:'सफेद लेड सल्फेट का अवक्षेप।', sol:'#f1f5f9', gas:false, precip:'लेड सल्फेट (सफेद)', heat:false },
  'cuso4+na2co3':{ eq:'CuSO₄ + Na₂CO₃ → CuCO₃↓ + Na₂SO₄',    type:'द्विविस्थापन अभिक्रिया',   obs:'हरे-नीले कॉपर कार्बोनेट का अवक्षेप — घोल साफ़।', sol:'#dbeafe', gas:false, precip:'कॉपर कार्बोनेट (हरा-नीला)', heat:false },
  'feso4+na2co3':{ eq:'FeSO₄ + Na₂CO₃ → FeCO₃↓ + Na₂SO₄',    type:'द्विविस्थापन अभिक्रिया',   obs:'हरे फेरस कार्बोनेट का अवक्षेप।', sol:'#d1fae5', gas:false, precip:'फेरस कार्बोनेट (हरा)', heat:false },
  'ch3cooh+nahco3':{ eq:'CH₃COOH + NaHCO₃ → CH₃COONa + CO₂↑ + H₂O', type:'अम्ल + बेकिंग सोडा', obs:'सिरका + बेकिंग सोडा = ज्वालामुखी-जैसी तेज़ झाग-फुहार (CO₂ गैस)।', sol:'#fde68a', gas:true, precip:false, heat:false },
  'ch3cooh+naoh':{ eq:'CH₃COOH + NaOH → CH₃COONa + H₂O',     type:'उदासीनीकरण',              obs:'सिरका + क्षार = नमक + जल — घोल उदास (pH 7)।', sol:'#f0fdf4', gas:false, precip:false, heat:true },
  'ch3cooh+caco3':{ eq:'2CH₃COOH + CaCO₃ → (CH₃COO)₂Ca + CO₂↑ + H₂O', type:'अम्ल + चाक', obs:'चाक/चूना-पत्थर सिरके में घुलकर CO₂ छोड़ता है — फ़िज़-फ़िज़।', sol:'#fde68a', gas:true, precip:false, heat:false },
  'ch3cooh+zn':{ eq:'2CH₃COOH + Zn → (CH₃COO)₂Zn + H₂↑',     type:'अम्ल + धातु',              obs:'H₂ गैस के बुलबुले — पॉप-पॉप ध्वनि (H₂ की पहचान)।', sol:'#e0f2fe', gas:true, precip:false, heat:false },
  'soap+cacl2':{ eq:'2C₁₇H₃₅COONa + CaCl₂ → (C₁₇H₃₅COO)₂Ca↓ + 2NaCl', type:'साबुन + कठोर जल', obs:'सफेद गंदा स्कम (मैल) बना — कठोर जल में साबुन यही करता है।', sol:'#fce7f3', gas:false, precip:'स्कम (कैल्शियम स्टीयरेट)', heat:false },
  'fecl3+naoh':{ eq:'FeCl₃ + 3NaOH → Fe(OH)₃↓ + 3NaCl',      type:'द्विविस्थापन अभिक्रिया',   obs:'भूरा-लाल फेरिक हाइड्रॉक्साइड का अवक्षेप (बोर्ड प्रयोग)।', sol:'#fecaca', gas:false, precip:'फेरिक हाइड्रॉक्साइड (भूरा)', heat:false },
  'fecl3+agno3':{ eq:'FeCl₃ + 3AgNO₃ → 3AgCl↓ + Fe(NO₃)₃',   type:'द्विविस्थापन अभिक्रिया',   obs:'सफेद सिल्वर क्लोराइड का अवक्षेप।', sol:'#f1f5f9', gas:false, precip:'सिल्वर क्लोराइड (सफेद)', heat:false },
  'ca+h2o':    { eq:'CaO + H₂O → Ca(OH)₂ + ऊष्मा',           type:'संयोजन (ऊष्माक्षेपी)',     obs:'चूना जल डालते ही गर्म होकर बुझ गया — फुफकारती आवाज़; बुझा चूना Ca(OH)₂ बना।', sol:'#fef3c7', gas:false, precip:'बुझा चूना Ca(OH)₂', heat:true },
  'ca+hcl':    { eq:'CaO + 2HCl → CaCl₂ + H₂O',              type:'धातु ऑक्साइड + अम्ल',      obs:'चूना अम्ल में घुलकर लवण (CaCl₂) + जल बनाता है।', sol:'#d9f99d', gas:false, precip:false, heat:true }
};

// ============================================================
//  आवर्त सारणी के तत्व (109) — mix lab में drag करने के लिए
// ============================================================
const MIX_ELT_EXTRA = { // rare-earth & actinides missing from periodic.js
  58:{s:'Ce',n:'Cerium',cat:'लैंथेनाइड'},59:{s:'Pr',n:'Praseodymium',cat:'लैंथेनाइड'},
  60:{s:'Nd',n:'Neodymium',cat:'लैंथेनाइड'},61:{s:'Pm',n:'Promethium',cat:'लैंथेनाइड'},
  62:{s:'Sm',n:'Samarium',cat:'लैंथेनाइड'},63:{s:'Eu',n:'Europium',cat:'लैंथेनाइड'},
  64:{s:'Gd',n:'Gadolinium',cat:'लैंथेनाइड'},65:{s:'Tb',n:'Terbium',cat:'लैंथेनाइड'},
  66:{s:'Dy',n:'Dysprosium',cat:'लैंथेनाइड'},67:{s:'Ho',n:'Holmium',cat:'लैंथेनाइड'},
  68:{s:'Er',n:'Erbium',cat:'लैंथेनाइड'},69:{s:'Tm',n:'Thulium',cat:'लैंथेनाइड'},
  70:{s:'Yb',n:'Ytterbium',cat:'लैंथेनाइड'},71:{s:'Lu',n:'Lutetium',cat:'लैंथेनाइड'},
  90:{s:'Th',n:'Thorium',cat:'एक्टिनाइड'},91:{s:'Pa',n:'Protactinium',cat:'एक्टिनाइड'},
  92:{s:'U',n:'Uranium',cat:'एक्टिनाइड'},93:{s:'Np',n:'Neptunium',cat:'एक्टिनाइड'},
  94:{s:'Pu',n:'Plutonium',cat:'एक्टिनाइड'},95:{s:'Am',n:'Americium',cat:'एक्टिनाइड'},
  96:{s:'Cm',n:'Curium',cat:'एक्टिनाइड'},97:{s:'Bk',n:'Berkelium',cat:'एक्टिनाइड'},
  98:{s:'Cf',n:'Californium',cat:'एक्टिनाइड'},99:{s:'Es',n:'Einsteinium',cat:'एक्टिनाइड'},
  100:{s:'Fm',n:'Fermium',cat:'एक्टिनाइड'},101:{s:'Md',n:'Mendelevium',cat:'एक्टिनाइड'},
  102:{s:'No',n:'Nobelium',cat:'एक्टिनाइड'},103:{s:'Lr',n:'Lawrencium',cat:'एक्टिनाइड'}
};

const MIX_ELT_COLORS = { 'क्षारीय धातु':'#fecaca','क्षारीय मृदा धातु':'#fed7aa','संक्रमण धातु':'#c7d2fe','उत्तर-संक्रमण धातु':'#bfdbfe','लैंथेनाइड':'#ddd6fe','एक्टिनाइड':'#e9d5ff','उपधातु':'#a7f3d0','अधातु':'#fde68a','हैलोजन':'#bae6fd','नोबल गैस':'#e0e7ff' };

function mixEltData(id) {
  if (!/^E\d+$/.test(String(id))) return null;
  const z = parseInt(String(id).slice(1), 10);
  if (!z) return null;
  const fromPt = (typeof PERIODIC_ELEMENTS !== 'undefined' && PERIODIC_ELEMENTS[z]);
  return fromPt || MIX_ELT_EXTRA[z] || null;
}
function mixEltIds() {
  let keys = [];
  if (typeof PERIODIC_ELEMENTS !== 'undefined') keys = keys.concat(Object.keys(PERIODIC_ELEMENTS).map(Number));
  keys = keys.concat(Object.keys(MIX_ELT_EXTRA).map(Number));
  return Array.from(new Set(keys)).sort(function (a, b) { return a - b; });
}
function mixInfo(id) {
  const c = CHEMICALS[id];
  if (c) return { emoji:c.emoji, f:c.f, name:c.name, color:c.color, liquid:c.liquid };
  const e = mixEltData(id);
  if (e) return { emoji:'🧬', f:e.s, name:e.n + ' (' + e.cat + ')', color:MIX_ELT_COLORS[e.cat] || '#e2e8f0', liquid:false };
  return null;
}

function mixEltIsMetal(cat) {
  return ['क्षारीय धातु','क्षारीय मृदा धातु','संक्रमण धातु','उत्तर-संक्रमण धातु','लैंथेनाइड','एक्टिनाइड'].indexOf(cat) !== -1;
}
const MIX_NOBLE = { Cu:1, Hg:1, Ag:1, Au:1, Pt:1 };
const MIX_DISP_RANK = { K:10,Na:9,Ca:8,Mg:7,Al:6,Zn:6,Fe:5,Ni:5,Co:5,Sn:4,Pb:4,Cd:4,Cu:3,Hg:2,Ag:2,Au:1,Pt:1 };
function mixEltVal(sym, cat) {
  if (typeof ELEMENT_THERMO !== 'undefined' && ELEMENT_THERMO[sym] && ELEMENT_THERMO[sym].val) return ELEMENT_THERMO[sym].val;
  if (cat === 'क्षारीय धातु') return 1;
  if (cat === 'क्षारीय मृदा धातु') return 2;
  if (cat === 'लैंथेनाइड' || cat === 'एक्टिनाइड') return 3;
  if (cat === 'उपधातु' || cat === 'अधातु' || cat === 'हैलोजन' || cat === 'नोबल गैस') return 0;
  return 2;
}

const MIX_SALT_REACT = {
  cuso4:{ ion:'CuSO₄', prod:'SO₄', met:'Cu', metName:'ताँबा', obs:'नीला घोल साफ़ होकर धातु पर लाल-भूरे ताँबे की परत जम गई।', prec:'ताँबा (Cu)' },
  feso4:{ ion:'FeSO₄', prod:'SO₄', met:'Fe', metName:'लोहा', obs:'हरा घोल साफ़; लोहे की परत चढ़ी।', prec:'लोहा (Fe)' },
  agno3:{ ion:'AgNO₃', prod:'NO₃', met:'Ag', metName:'चाँदी', obs:'घोल पर चमकदार चाँदी की परत चढ़ी।', prec:'चाँदी (Ag)' },
  pbno3:{ ion:'Pb(NO₃)₂', prod:'NO₃', met:'Pb', metName:'सीसा', obs:'सीसे की धूसर परत जमी।', prec:'सीसा (Pb)' }
};
const MIX_SALT_NO = { nacl:true, ki:true, cacl2:true, na2so4:true, na2co3:true, nahco3:true, caco3:true };

function mixEltAcidEq(sym, v, acidId) {
  if (acidId === 'hcl') {
    if (v === 1) return '2' + sym + ' + 2HCl → 2' + sym + 'Cl + H₂↑';
    if (v === 3) return '2' + sym + ' + 6HCl → 2' + sym + 'Cl₃ + 3H₂↑';
    return sym + ' + 2HCl → ' + sym + 'Cl₂ + H₂↑';
  }
  if (acidId === 'h2so4') {
    if (v === 1) return '2' + sym + ' + H₂SO₄ → ' + sym + '₂SO₄ + H₂↑';
    if (v === 3) return '2' + sym + ' + 3H₂SO₄ → ' + sym + '₂(SO₄)₃ + 3H₂↑';
    return sym + ' + H₂SO₄ → ' + sym + 'SO₄ + H₂↑';
  }
  if (acidId === 'hno3') {
    if (v === 1) return '2' + sym + ' + 2HNO₃ → 2' + sym + 'NO₃ + H₂↑';
    if (v === 3) return sym + ' + 4HNO₃ → ' + sym + '(NO₃)₃ + NO↑ + 2H₂O';
    return sym + ' + 2HNO₃ → ' + sym + '(NO₃)₂ + H₂↑';
  }
  if (acidId === 'ch3cooh') {
    if (v === 1) return '2' + sym + ' + 2CH₃COOH → 2CH₃COO' + sym + ' + H₂↑';
    return sym + ' + 2CH₃COOH → (CH₃COO)₂' + sym + ' + H₂↑';
  }
  return sym + ' + अम्ल → लवण + H₂↑';
}
function mixEltSaltEq(sym, spec, v) {
  if (spec.met === 'Ag') {
    if (v === 1) return sym + ' + AgNO₃ → ' + sym + 'NO₃ + Ag↓';
    if (v === 2) return sym + ' + 2AgNO₃ → ' + sym + '(NO₃)₂ + 2Ag↓';
    return sym + ' + 3AgNO₃ → ' + sym + '(NO₃)₃ + 3Ag↓';
  }
  if (v === 1) return '2' + sym + ' + ' + spec.ion + ' → ' + sym + '₂' + spec.prod + ' + ' + spec.met + '↓';
  if (v === 3) return '2' + sym + ' + 3' + spec.ion + ' → ' + sym + '₂(' + spec.prod + ')₃ + 3' + spec.met + '↓';
  return sym + ' + ' + spec.ion + ' → ' + sym + spec.prod + ' + ' + spec.met + '↓';
}

function mixEltWater(e) {
  if (e.cat === 'क्षारीय धातु') return { eq:'2' + e.s + ' + 2H₂O → 2' + e.s + 'OH + H₂↑', type:'धातु + जल', obs:e.n + ' जल पर तैरकर चक्कर काटती है और H₂ गैस छोड़ती है — अति-तेज़, हिंसक अभिक्रिया (खतरनाक!)', sol:'#e0f2fe', gas:true, precip:false, heat:true };
  if (e.cat === 'क्षारीय मृदा धातु') {
    if (e.s === 'Be') return { eq:'—', type:'कोई अभिक्रिया नहीं', obs:'बेरिलियम जल से अभिक्रिया नहीं करता (बहुत कठोर सुरक्षा-परत)।', sol:'#cffafe', gas:false, precip:false, heat:false };
    if (e.s === 'Mg') return { eq:'Mg + 2H₂O(गर्म/भाप) → Mg(OH)₂ + H₂↑', type:'धातु + जल (धीमी)', obs:'मैग्नीशियम ठंडे जल से बहुत धीमा, गर्म जल/भाप से H₂ निकलती है।', sol:'#e0f2fe', gas:true, precip:false, heat:false };
    return { eq:e.s + ' + 2H₂O → ' + e.s + '(OH)₂ + H₂↑', type:'धातु + जल', obs:e.n + ' जल से धीरे-धीरे H₂ गैस देता है।', sol:'#e0f2fe', gas:true, precip:false, heat:true };
  }
  if (e.cat === 'लैंथेनाइड' || e.cat === 'एक्टिनाइड') {
    const v = mixEltVal(e.s, e.cat);
    const eq = (v === 3) ? '2' + e.s + ' + 6H₂O → 2' + e.s + '(OH)₃ + 3H₂↑' : e.s + ' + 2H₂O → ' + e.s + '(OH)₂ + H₂↑';
    return { eq:eq, type:'धातु + जल (धीमी)', obs:e.n + ' गर्म जल से धीरे-धीरे H₂ गैस छोड़ता है — क्षारीय हाइड्रॉक्साइड बनता है।', sol:'#e0f2fe', gas:true, precip:false, heat:false };
  }
  if (mixEltIsMetal(e.cat)) return { eq:'—', type:'कोई अभिक्रिया नहीं', obs:'क्रियाशीलता श्रेणी की सामान्य धातु जल से अभिक्रिया नहीं करती — जल निष्क्रिय है।', sol:'#cffafe', gas:false, precip:false, heat:false };
  return { eq:'—', type:'कोई अभिक्रिया नहीं', obs:e.n + ' (अधातु/उपधातु) जल से नहीं जुड़ती।', sol:'#cffafe', gas:false, precip:false, heat:false };
}

function mixEltAcid(e, acidId) {
  const acidName = acidId === 'hcl' ? 'तनु हाइड्रोक्लोरिक अम्ल' : acidId === 'h2so4' ? 'तनु सल्फ्यूरिक अम्ल' : acidId === 'hno3' ? 'तनु नाइट्रिक अम्ल' : 'सिरका (एसिटिक अम्ल)';
  if (MIX_NOBLE[e.s]) {
    if (acidId === 'hno3') {
      if (e.s === 'Cu') return { eq:'Cu + 4HNO₃(सांद्र) → Cu(NO₃)₂ + 2NO₂↑ + 2H₂O', type:'धातु + नाइट्रिक अम्ल', obs:'ताँबा सांद्र HNO₃ में घुलकर भूरी नाइट्रोजन-डाइऑक्साइड गैस (NO₂) छोड़ता है। सांद्र HNO₃ ऑक्सीकारक है — यहाँ H₂ की जगह NO₂ बनती है।', sol:'#bfdbfe', gas:true, precip:false, heat:true };
      if (e.s === 'Ag' || e.s === 'Hg') return { eq:e.s + ' + 2HNO₃(सांद्र) → ' + e.s + 'NO₃ + NO₂↑ + H₂O', type:'धातु + नाइट्रिक अम्ल', obs:e.n + ' सांद्र HNO₃ में घुलता है — भूरी NO₂ गैस निकली।', sol:'#e2e8f0', gas:true, precip:false, heat:true };
    }
    return { eq:'—', type:'कोई अभिक्रिया नहीं', obs:e.n + ' (' + e.s + ') क्रियाशीलता श्रेणी में हाइड्रोजन से नीचे है — तनु अम्ल से H₂ गैस नहीं बनती। (सिर्फ सांद्र ऑक्सीकारक अम्ल ही प्रभाव करते हैं।)', sol:'#f1f5f9', gas:false, precip:false, heat:false };
  }
  if (!mixEltIsMetal(e.cat)) return { eq:'—', type:'कोई अभिक्रिया नहीं', obs:e.n + ' अधातु है — अम्ल से यह कोई अभिक्रिया नहीं करता।', sol:'#f1f5f9', gas:false, precip:false, heat:false };
  const v = mixEltVal(e.s, e.cat);
  const eq = mixEltAcidEq(e.s, v, acidId);
  const hot = (e.cat === 'क्षारीय धातु');
  let obs;
  if (hot) obs = 'बहुत तेज़ — बुलबुलों की बौछार और ' + e.s + ' तैरती है; पॉप ध्वनि के साथ H₂।';
  else if (acidId === 'hno3' && v === 3) obs = 'H₂ की जगह रंगहीन NO बनती है (तनु HNO₃ ऑक्सीकारक) — हवा में भूरी हो जाती है।';
  else obs = 'H₂ गैस के बुलबुले उठे — जलती माचिस पास जाने पर दरारदार पॉप-पॉप ध्वनि (H₂ की पहचान)।';
  return { eq:eq, type:'अम्ल + धातु अभिक्रिया', obs:e.n + ' (' + e.s + ') + ' + acidName + ': ' + obs, sol:'#e0f2fe', gas:true, precip:false, heat:hot };
}

function mixEltBase(e) {
  if (e.s === 'Al') return { eq:'2Al + 2NaOH + 2H₂O → 2NaAlO₂ + 3H₂↑', type:'उभयधर्मी धातु + क्षार', obs:'एल्युमिनियम क्षार में घुलकर सोडियम एल्युमिनेट + H₂ गैस देता है (उभयधर्मी धातु)।', sol:'#e0f2fe', gas:true, precip:false, heat:false };
  if (e.s === 'Zn') return { eq:'Zn + 2NaOH → Na₂ZnO₂ + H₂↑', type:'उभयधर्मी धातु + क्षार', obs:'जिंक क्षार में घुलकर सोडियम ज़िंकेट + H₂ बनाता है।', sol:'#e0f2fe', gas:true, precip:false, heat:false };
  if (!mixEltIsMetal(e.cat)) return { eq:'—', type:'कोई अभिक्रिया नहीं', obs:e.n + ' अधातु है — क्षार (base) से नहीं जुड़ती।', sol:'#94a3b8', gas:false, precip:false, heat:false };
  return { eq:'—', type:'कोई अभिक्रिया नहीं', obs:'सामान्य धातुएँ क्षार से अभिक्रिया नहीं करतीं — सिर्फ एल्युमिनियम व जिंक (उभयधर्मी) क्षार में घुलते हैं।', sol:'#94a3b8', gas:false, precip:false, heat:false };
}

function mixEltSalt(e, saltId) {
  if (!mixEltIsMetal(e.cat)) return { eq:'—', type:'कोई अभिक्रिया नहीं', obs:'अधातु लवण-विलयन से धातु विस्थापित नहीं कर सकती।', sol:'#f1f5f9', gas:false, precip:false, heat:false };
  const spec = MIX_SALT_REACT[saltId];
  if (e.cat === 'क्षारीय धातु') return { eq:'—', type:'पहले जल से अभिक्रिया', obs:e.n + ' जल से तुरंत अभिक्रिया करती है (2' + e.s + ' + 2H₂O → 2' + e.s + 'OH + H₂↑) — इसलिए लवण-विलयन में सीधे विस्थापन नहीं दिखता।', sol:'#e0f2fe', gas:true, precip:false, heat:true };
  if (e.s === spec.met) return { eq:'—', type:'कोई अभिक्रिया नहीं', obs:e.n + ' को ' + spec.metName + ' से विस्थापित नहीं किया जा सकता — दोनों एक ही धातु हैं।', sol:'#f1f5f9', gas:false, precip:false, heat:false };
  const myRank = (MIX_DISP_RANK[e.s] !== undefined) ? MIX_DISP_RANK[e.s] : 5;
  const itsRank = MIX_DISP_RANK[spec.met];
  if (myRank <= itsRank) return { eq:'—', type:'कोई विस्थापन नहीं', obs:e.n + ' (' + e.s + ') क्रियाशीलता श्रेणी में ' + spec.metName + ' से नीचे/बराबर है — ' + spec.metName + ' विस्थापित नहीं हुआ।', sol:'#f1f5f9', gas:false, precip:false, heat:false };
  const v = (e.s === 'Cu') ? 2 : mixEltVal(e.s, e.cat);
  return { eq:mixEltSaltEq(e.s, spec, v), type:'विस्थापन अभिक्रिया', obs:e.n + ' ' + spec.metName + ' से अधिक क्रियाशील है — लवण से ' + spec.metName + ' विस्थापित। ' + spec.obs, sol:'#e0f2fe', gas:false, precip:spec.prec, heat:false };
}

// ============================================================
//  CHEM × CHEM inference engine — कोई भी दो पदार्थ, समीकरण + प्रकार
// ============================================================
const CH_ION_INFO = {
  hcl:     { id:'hcl',     f:'HCl',       cat:'H',   cChg:1, an:'Cl',        aChg:1, kind:'acid' },
  h2so4:   { id:'h2so4',   f:'H₂SO₄',     cat:'H',   cChg:1, an:'SO₄',       aChg:2, kind:'acid' },
  hno3:    { id:'hno3',    f:'HNO₃',      cat:'H',   cChg:1, an:'NO₃',       aChg:1, kind:'acid' },
  ch3cooh: { id:'ch3cooh', f:'CH₃COOH',   cat:'H',   cChg:1, an:'CH₃COO',    aChg:1, kind:'acid' },
  naoh:    { id:'naoh',    f:'NaOH',      cat:'Na',  cChg:1, an:'OH',        aChg:1, kind:'base' },
  koh:     { id:'koh',     f:'KOH',       cat:'K',   cChg:1, an:'OH',        aChg:1, kind:'base' },
  cuso4:   { id:'cuso4',   f:'CuSO₄',     cat:'Cu',  cChg:2, an:'SO₄',       aChg:2, kind:'salt' },
  feso4:   { id:'feso4',   f:'FeSO₄',     cat:'Fe',  cChg:2, an:'SO₄',       aChg:2, kind:'salt' },
  fecl3:   { id:'fecl3',   f:'FeCl₃',     cat:'Fe',  cChg:3, an:'Cl',        aChg:1, kind:'salt' },
  agno3:   { id:'agno3',   f:'AgNO₃',     cat:'Ag',  cChg:1, an:'NO₃',       aChg:1, kind:'salt' },
  pbno3:   { id:'pbno3',   f:'Pb(NO₃)₂',  cat:'Pb',  cChg:2, an:'NO₃',       aChg:1, kind:'salt' },
  cacl2:   { id:'cacl2',   f:'CaCl₂',     cat:'Ca',  cChg:2, an:'Cl',        aChg:1, kind:'salt' },
  bacl2:   { id:'bacl2',   f:'BaCl₂',     cat:'Ba',  cChg:2, an:'Cl',        aChg:1, kind:'salt' },
  nacl:    { id:'nacl',    f:'NaCl',      cat:'Na',  cChg:1, an:'Cl',        aChg:1, kind:'salt' },
  ki:      { id:'ki',      f:'KI',        cat:'K',   cChg:1, an:'I',         aChg:1, kind:'salt' },
  na2so4:  { id:'na2so4',  f:'Na₂SO₄',    cat:'Na',  cChg:1, an:'SO₄',       aChg:2, kind:'salt' },
  na2co3:  { id:'na2co3',  f:'Na₂CO₃',    cat:'Na',  cChg:1, an:'CO₃',       aChg:2, kind:'carbonate' },
  nahco3:  { id:'nahco3',  f:'NaHCO₃',    cat:'Na',  cChg:1, an:'HCO₃',      aChg:1, kind:'carbonate' },
  caco3:   { id:'caco3',   f:'CaCO₃',     cat:'Ca',  cChg:2, an:'CO₃',       aChg:2, kind:'carbonate' },
  kmno4:   { id:'kmno4',   f:'KMnO₄',     cat:'K',   cChg:1, an:'MnO₄',      aChg:1, kind:'oxidizer' },
  h2o:     { id:'h2o',     f:'H₂O',       kind:'water' },
  h2o2:    { id:'h2o2',    f:'H₂O₂',      kind:'peroxide' },
  zn:      { id:'zn',      f:'Zn',        cat:'Zn',  cChg:2, kind:'metal' },
  fe:      { id:'fe',      f:'Fe',        cat:'Fe',  cChg:2, kind:'metal' },
  mg:      { id:'mg',      f:'Mg',        cat:'Mg',  cChg:2, kind:'metal' },
  al:      { id:'al',      f:'Al',        cat:'Al',  cChg:3, kind:'metal' },
  cu:      { id:'cu',      f:'Cu',        cat:'Cu',  cChg:2, kind:'metal' },
  ca:      { id:'ca',      f:'CaO',       cat:'Ca',  cChg:2, an:'O',         aChg:2, kind:'metaloxide' },
  soap:    { id:'soap',    f:'C₁₇H₃₅COONa', cat:'Na', cChg:1, an:'C₁₇H₃₅COO', aChg:1, kind:'salt' }
};

const CH_POLY = { 'SO₄':1,'NO₃':1,'CO₃':1,'HCO₃':1,'OH':1,'CH₃COO':1,'MnO₄':1,'C₁₇H₃₅COO':1 };
const CH_REACT_RANK = { K:10,Na:9,Ca:8,Mg:7,Al:6,Zn:6,Fe:5,Ni:5,Co:5,Sn:4,Pb:4,Cd:4,Cu:3,Hg:2,Ag:2,Au:1,Pt:1 };
const CH_BELOW_H = { Cu:true,Hg:true,Ag:true,Au:true,Pt:true };

function chGcd(x, y) { x = Math.abs(x); y = Math.abs(y); while (y) { const t = y; y = x % y; x = t; } return x; }
function chSub(n) { return String(n).split('').map(d => '₀₁₂₃₄₅₆₇₈₉'[+d]).join(''); }

// cation cChg/charge + anion aChg → न्यूनतम सूत्र, जैसे Fe³⁺+SO₄²⁻ → Fe₂(SO₄)₃
function chFormula(cat, cChg, an, aChg) {
  const g = chGcd(cChg, aChg);
  const ca = aChg / g, aa = cChg / g;
  let s = cat;
  if (ca > 1) s += chSub(ca);
  if (aa > 1 && CH_POLY[an]) s += '(' + an + ')' + chSub(aa);
  else if (aa > 1) s += an + chSub(aa);
  else s += an;
  return s;
}

function chName(id) { const c = CHEMICALS[id]; return c ? c.name : id; }
function mixIonInfo(id) { return CH_ION_INFO[id] || null; }

function chBalanceEq(lhsForms, rhsForms) {
  if (typeof computeBalancing === 'function') {
    try {
      const sol = computeBalancing(lhsForms, rhsForms);
      if (sol && sol.coeffs) {
        const c = sol.coeffs;
        const build = (arr, off) => arr.map((f, i) => ({ f, k: c[off + i] }))
          .filter(x => x.k > 0)
          .map(x => (x.k === 1 ? '' : x.k) + x.f).join(' + ');
        return build(lhsForms, 0) + ' → ' + build(rhsForms, lhsForms.length);
      }
    } catch (e) {}
  }
  return lhsForms.join(' + ') + ' → ' + rhsForms.join(' + ');
}

// घुलनशीलता नियम (class-10): सभी नाइट्रेट/एसीटेट/NH₄⁺/क्षारीय लवण घुलनशील
function chInsoluble(cat, an) {
  if (cat === 'Na' || cat === 'K') return false;
  if (an === 'NO₃' || an === 'CH₃COO') return false;
  if (an === 'C₁₇H₃₅COO') return true; // साबुन की गंदी मैल (स्टीयरेट अवक्षेप)
  if (an === 'Cl' || an === 'I') return (cat === 'Ag' || cat === 'Pb' || cat === 'Hg');
  if (an === 'SO₄') return (cat === 'Ba' || cat === 'Pb' || cat === 'Sr' || cat === 'Ca');
  if (an === 'CO₃' || an === 'HCO₃' || an === 'O' || an === 'OH') return true;
  return false;
}

function chPrecipInfo(cat, an) {
  if (!chInsoluble(cat, an)) return '';
  const alw = { Na:1, K:1 };
  if (an === 'OH') {
    if (cat === 'Cu') return 'नीला अवक्षेप Cu(OH)₂';
    if (cat === 'Fe') return 'गंदा-हरा → भूरा अवक्षेप Fe(OH)₃';
    if (cat === 'Al') return 'सफ़ेद जिलेटिनी अवक्षेप Al(OH)₃';
    if (cat === 'Zn') return 'सफ़ेद अवक्षेप Zn(OH)₂';
    if (cat === 'Pb') return 'सफ़ेद अवक्षेप Pb(OH)₂';
    if (cat === 'Ca') return 'सफ़ेद चूने जैसा अवक्षेप Ca(OH)₂';
    if (cat === 'Mg') return 'सफ़ेद अवक्षेप Mg(OH)₂';
    return 'सफ़ेद अवक्षेप ' + cat + '(OH)₂';
  }
  if (an === 'CO₃') {
    if (cat === 'Cu') return 'हरा-नीला अवक्षेप CuCO₃';
    if (cat === 'Fe') return 'हरा अवक्षेप FeCO₃';
    if (cat === 'Ca') return 'दूधिया-सफ़ेद अवक्षेप CaCO₃';
    if (cat === 'Ba') return 'सफ़ेद अवक्षेप BaCO₃';
    if (cat === 'Pb') return 'सफ़ेद अवक्षेप PbCO₃';
    if (cat === 'Zn') return 'सफ़ेद अवक्षेप ZnCO₃';
    return 'सफ़ेद अवक्षेप ' + cat + 'CO₃';
  }
  if (an === 'C₁₇H₃₅COO') {
    if (cat === 'Ca' || cat === 'Mg') return 'सफ़ेद गंदा स्कम/मैल (कैल्शियम स्टीयरेट)';
    return 'सफ़ेद मैल (धातु स्टीयरेट)';
  }
  const pair = cat + an;
  if (pair === 'AgCl') return 'सफ़ेद दही-जैसा अवक्षेप AgCl';
  if (pair === 'PbCl₂') return 'सफ़ेद अवक्षेप PbCl₂';
  if (pair === 'AgI') return 'पीला-क्रीम अवक्षेप AgI';
  if (pair === 'PbI₂') return 'चमकीला पीला अवक्षेप PbI₂ (golden rain)';
  if (pair === 'BaSO₄') return 'सफ़ेद अवक्षेप BaSO₄ (अम्ल में भी नहीं घुलता)';
  if (pair === 'PbSO₄') return 'सफ़ेद अवक्षेप PbSO₄';
  if (pair === 'CaSO₄') return 'हल्का-सफ़ेद अवक्षेप CaSO₄';
  if (pair === 'CaO') return 'सफ़ेद अवक्षेप CaO';
  return 'अवक्षेप (' + cat + an + ')';
}

// कोई भी दो रसायन → { eq, type, obs, sol, gas, precip, heat } या null
function mixInferChemChem(idA, idB) {
  const A = mixIonInfo(idA), B = mixIonInfo(idB);
  if (!A || !B) return null;
  const nA = chName(idA), nB = chName(idB);

  // --- H₂O₂ अपघटन (धातु/संक्रमण-लवण उत्प्रेरक) ---
  if (A.kind === 'peroxide' || B.kind === 'peroxide') {
    const other = A.kind === 'peroxide' ? B : A;
    if (other.kind === 'metal' || (other.kind === 'salt' && (other.cat === 'Cu' || other.cat === 'Fe'))) {
      const eq = '2H₂O₂ → 2H₂O + O₂↑';
      return { eq, type:'अपघटन अभिक्रिया (उत्प्रेरक)', obs:nB + ' / ' + nA + ' की उपस्थिति में H₂O₂ तेज़ी से टूटता है — ऑक्सीजन गैस के बुलबुलों की फुहार। जलती तीली और तेज़ जलती है (O₂ की पहचान)।', sol:'#cffafe', gas:true, precip:false, heat:false };
    }
    return null; // kmno4+ hcl/h2o2 table में हैं
  }
  if (A.kind === 'oxidizer' || B.kind === 'oxidizer') return null;

  // --- जल में घुलना (विलयन) — अम्ल/क्षारक/लवण + पानी ---
  if (A.kind === 'water' || B.kind === 'water') {
    const sol = A.kind === 'water' ? B : A;
    if (sol.kind === 'acid' || sol.kind === 'base' || sol.kind === 'salt') {
      const hot = (sol.kind === 'acid' || (sol.kind === 'base'));
      return { eq: sol.f + ' + H₂O → ' + sol.f + '(aq)', type:'विलयन (भौतिक परिवर्तन)', obs:sol.name ? sol.name + ' जल में घुलकर विलयन बना।' : nA + ' / ' + nB + ' जल में घुल गया — रंग/अवस्था बदली, पर कोई नया पदार्थ नहीं बना।', sol:'#e0f2fe', gas:false, precip:false, heat:hot, skipBal:true };
    }
    return null;
  }

  // --- अम्ल + क्षारक → लवण + जल (उदासीनीकरण) ---
  if ((A.kind === 'acid' && B.kind === 'base') || (A.kind === 'base' && B.kind === 'acid')) {
    const ac = A.kind === 'acid' ? A : B, ba = B.kind === 'base' ? B : A;
    const salt = chFormula(ba.cat, ba.cChg, ac.an, ac.aChg);
    const eq = chBalanceEq([ba.f, ac.f], [salt, 'H₂O']);
    return { eq, type:'उदासीनीकरण अभिक्रिया', obs:nA + ' + ' + nB + ' → लवण + जल। घोल उदासीन (pH 7) — हल्की गर्मी भी निकलती है।', sol:'#e2e8f0', gas:false, precip:false, heat:true };
  }

  // --- अम्ल + कार्बोनेट/हाइड्रोजन कार्बोनेट → लवण + CO₂ + जल ---
  if ((A.kind === 'acid' && B.kind === 'carbonate') || (A.kind === 'carbonate' && B.kind === 'acid')) {
    const ac = A.kind === 'acid' ? A : B, cb = B.kind === 'carbonate' ? B : A;
    const salt = chFormula(cb.cat, cb.cChg, ac.an, ac.aChg);
    const eq = chBalanceEq([cb.f, ac.f], [salt, 'CO₂↑', 'H₂O']);
    return { eq, type:'अम्ल + कार्बोनेट → लवण + CO₂ + जल', obs:'कार्बोनेट/बेकिंग सोडा पर अम्ल डालते ही तेज़ फ़िज़-फ़िज़ — कार्बन डाइऑक्साइड गैस के बुलबुले उठे। गैस को चूना-जल में डालो — दूधिया सफ़ेद होगा (CO₂ की पहचान)।', sol:'#e0f2fe', gas:true, precip:false, heat:false };
  }

  // --- अम्ल + धातु ऑक्साइड → लवण + जल ---
  if ((A.kind === 'acid' && B.kind === 'metaloxide') || (A.kind === 'metaloxide' && B.kind === 'acid')) {
    const ac = A.kind === 'acid' ? A : B, mo = B.kind === 'metaloxide' ? B : A;
    const salt = chFormula(mo.cat, mo.cChg, ac.an, ac.aChg);
    const eq = chBalanceEq([mo.f, ac.f], [salt, 'H₂O']);
    return { eq, type:'धातु ऑक्साइड + अम्ल → लवण + जल', obs:mo.f + ' अम्ल में घुलकर लवण + जल बनाता है — उदासीनीकरण जैसी ही अभिक्रिया। घोल गर्म होता है।', sol:'#e0f2fe', gas:false, precip:false, heat:true };
  }

  // --- अम्ल + धातु → लवण + H₂ (विस्थापन) ---
  if ((A.kind === 'acid' && B.kind === 'metal') || (A.kind === 'metal' && B.kind === 'acid')) {
    const ac = A.kind === 'acid' ? A : B, mt = B.kind === 'metal' ? B : A;
    if (CH_BELOW_H[mt.cat]) return { eq:'—', type:'कोई अभिक्रिया नहीं', obs:mt.cat + ' क्रियाशीलता श्रेणी में हाइड्रोजन से नीचे है — तनु अम्ल से H₂ गैस नहीं बनती। (सिर्फ़ सांद्र ऑक्सीकारक अम्ल प्रभाव करते हैं।)', sol:'#f1f5f9', gas:false, precip:false, heat:false, skipBal:true };
    const salt = chFormula(mt.cat, mt.cChg, ac.an, ac.aChg);
    const eq = chBalanceEq([mt.f, ac.f], [salt, 'H₂↑']);
    const hot = (mt.cat === 'Mg' || mt.cat === 'Na' || mt.cat === 'K');
    return { eq, type:'विस्थापन अभिक्रिया — धातु ने हाइड्रोजन को विस्थापित किया', obs:mt.cat + ' अम्ल में घुल गया — ' + (hot ? 'बहुत तेज़ी से, हल्की गर्मी के साथ' : 'हाइड्रोजन गैस के बुलबुलों के साथ') + '। जलती तीली पास करने पर "पॉप-पॉप" ध्वनि (H₂ की पहचान)।', sol:'#e0f2fe', gas:true, precip:false, heat:hot };
  }

  // --- क्षार + धातु (Al / Zn — उभयधर्मी) → लवण + H₂ ---
  if ((A.kind === 'base' && B.kind === 'metal') || (A.kind === 'metal' && B.kind === 'base')) {
    const ba = A.kind === 'base' ? A : B, mt = B.kind === 'metal' ? B : A;
    if (mt.cat === 'Al') return { eq:'2Al + 2NaOH + 2H₂O → 2NaAlO₂ + 3H₂↑', type:'उभयधर्मी धातु + क्षार', obs:'एल्युमिनियम क्षार में घुलकर सोडियम एल्युमिनेट + H₂ गैस देता है — एल्युमिनियम उभयधर्मी धातु है।', sol:'#e0f2fe', gas:true, precip:false, heat:false };
    if (mt.cat === 'Zn') return { eq:'Zn + 2NaOH → Na₂ZnO₂ + H₂↑', type:'उभयधर्मी धातु + क्षार', obs:'जिंक क्षार में घुलकर सोडियम ज़िंकेट + H₂ बनाता है — जिंक उभयधर्मी धातु है।', sol:'#e0f2fe', gas:true, precip:false, heat:false };
    return null;
  }

  // --- क्षार + धातु लवण → धातु हाइड्रॉक्साइड + लवण (द्विविस्थापन) ---
  if ((A.kind === 'base' && B.kind === 'salt') || (A.kind === 'salt' && B.kind === 'base')) {
    const ba = A.kind === 'base' ? A : B, sl = B.kind === 'salt' ? B : A;
    if (sl.cat === 'Na' || sl.cat === 'K') return null; // दोनों क्षारीय — कुछ नहीं
    const hx = chFormula(sl.cat, sl.cChg, 'OH', 1);
    const other = chFormula(ba.cat, ba.cChg, sl.an, sl.aChg);
    const eq = chBalanceEq([ba.f, sl.f], [hx + '↓', other]);
    const precip = chPrecipInfo(sl.cat, 'OH');
    return { eq, type:'द्विविस्थापन अभिक्रिया — अवक्षेप', obs:ba.f + ' क्षार डालते ही ' + (precip || 'धातु हाइड्रॉक्साइड') + ' बना — ' + other + ' घोल में बचा।', sol:'#e0f2fe', gas:false, precip:precip, heat:false };
  }

  // --- धातु + लवण-विलयन → विस्थापन ---
  if ((A.kind === 'metal' && B.kind === 'salt') || (A.kind === 'salt' && B.kind === 'metal')) {
    const mt = A.kind === 'metal' ? A : B, sl = B.kind === 'salt' ? B : A;
    if (!['Cu','Fe','Ag','Pb'].includes(sl.cat)) return null;
    if ((CH_REACT_RANK[mt.cat] || 0) <= (CH_REACT_RANK[sl.cat] || 0)) return null; // कम क्रियाशील → नहीं
    const salt = chFormula(mt.cat, mt.cChg, sl.an, sl.aChg);
    const eq = chBalanceEq([mt.f, sl.f], [salt, sl.cat + '↓']);
    return { eq, type:'विस्थापन अभिक्रिया', obs:mt.cat + ' क्रियाशीलता श्रेणी में ' + sl.cat + ' से ऊपर है — लवण से ' + sl.cat + ' विस्थापित होकर ' + (sl.cat === 'Cu' ? 'लाल-कत्थई ताँबे' : sl.cat === 'Ag' ? 'चमकीली चाँदी की परत' : sl.cat + ' की परत') + ' जम गई; घोल का रंग बदला।', sol:'#e0f2fe', gas:false, precip:sl.cat === 'Cu' ? 'लाल ताँबा' : sl.cat === 'Ag' ? 'चाँदी की परत' : (sl.cat + ' की परत'), heat:false };
  }

  // --- लवण + लवण (कार्बोनेट सहित) → द्विविस्थापन (हर जोड़ी के लिए समीकरण) ---
  const chSaltish = (k) => k === 'salt' || k === 'carbonate';
  if (chSaltish(A.kind) && chSaltish(B.kind) && !(A.kind === 'carbonate' && B.kind === 'carbonate')) {
    if (A.cat === B.cat) return null; // एक ही धातु — कोई बदलाव नहीं
    const p1 = chFormula(A.cat, A.cChg, B.an, B.aChg);
    const p2 = chFormula(B.cat, B.cChg, A.an, A.aChg);
    if (p1 === A.f && p2 === B.f) return null; // स्वयं-उत्पाद — कोई अभिक्रिया नहीं
    const i1 = chInsoluble(A.cat, B.an), i2 = chInsoluble(B.cat, A.an);
    const eq = chBalanceEq([A.f, B.f], [p1 + (i1 ? '↓' : ''), p2 + (i2 ? '↓' : '')]);
    let precip = i1 ? chPrecipInfo(A.cat, B.an) : i2 ? chPrecipInfo(B.cat, A.an) : '';
    let obs;
    if (precip) obs = 'दोनों लवण मिलाते ही आयन अदला-बदली — द्विविस्थापन से ' + precip + ' बना, बाकी घोल में घुला रहा।';
    else obs = 'आयन अदला-बदली (द्विविस्थापन) हो सकती है — पर दोनों उत्पाद जल में घुलनशील हैं, इसलिए कोई अवक्षेप/गैस दिखाई नहीं देता (कोई दृश्य परिवर्तन नहीं)।';
    return { eq, type:'द्विविस्थापन अभिक्रिया' + (precip ? ' — अवक्षेप' : ' (आयनिक)'), obs:obs, sol:precip ? '#f8fafc' : '#e2e8f0', gas:false, precip:precip || false, heat:false };
  }

  return null;
}

function mixInferPair(idA, idB) {
  const aE = mixEltData(idA), bE = mixEltData(idB);
  const aC = CHEMICALS[idA], bC = CHEMICALS[idB];
  if (aE && bE) {
    const aAlk = (aE.cat === 'क्षारीय धातु'), bAlk = (bE.cat === 'क्षारीय धातु');
    const aHal = (aE.cat === 'हैलोजन'), bHal = (bE.cat === 'हैलोजन');
    if ((aAlk && bHal) || (aHal && bAlk)) {
      const m = aAlk ? aE : bE, h = aAlk ? bE : aE;
      return { eq:m.s + ' + ' + h.s + ' → ' + m.s + h.s, type:'संयोजन अभिक्रिया', obs:'क्षारीय धातु हैलोजन के साथ जलकर लवण बनाती है — तेज़, प्रकाश-सहित संयोजन।', sol:'#e0f2fe', gas:false, precip:'लवण', heat:true };
    }
    const mA = mixEltIsMetal(aE.cat), mB = mixEltIsMetal(bE.cat);
    if (aE.cat === 'नोबल गैस' || bE.cat === 'नोबल गैस') return { eq:'—', type:'कोई अभिक्रिया नहीं', obs:'नोबल (अक्रिय) गैस बहुत स्थिर होती है — किसी से नहीं जुड़ती।', sol:'#94a3b8', gas:false, precip:false, heat:false };
    if (mA && mB) return { eq:'—', type:'कोई तुरंत अभिक्रिया नहीं', obs:'धातु + धातु = मिश्र धातु (जैसे पीतल, काँसा) बन सकती है — सिर्फ उच्च ताप पर। साधारण ताप पर कोई अभिक्रिया नहीं।', sol:'#94a3b8', gas:false, precip:false, heat:false };
    return { eq:'—', type:'कोई अभिक्रिया नहीं', obs:'इन दोनों में साधारण परिस्थिति में कोई सरल अभिक्रिया नहीं।', sol:'#94a3b8', gas:false, precip:false, heat:false };
  }
  if (!aE && !bE) return null;
  const elt = aE || bE;
  const chem = aC || bC;
  if (!chem) return null;
  switch (chem.id) {
    case 'h2o':     return mixEltWater(elt);
    case 'hcl':     return mixEltAcid(elt, 'hcl');
    case 'h2so4':   return mixEltAcid(elt, 'h2so4');
    case 'hno3':    return mixEltAcid(elt, 'hno3');
    case 'ch3cooh': return mixEltAcid(elt, 'ch3cooh');
    case 'naoh':
    case 'koh':     return mixEltBase(elt);
    case 'h2o2':
      if (mixEltIsMetal(elt.cat)) return { eq:'2H₂O₂ → 2H₂O + O₂↑', type:'अपघटन (धातु उत्प्रेरक)', obs:elt.n + ' उत्प्रेरक की तरह काम करता है — O₂ के छोटे-छोटे बुलबुले।', sol:'#cffafe', gas:true, precip:false, heat:false };
      return null;
    case 'kmno4':   return null;
    default:
      if (MIX_SALT_REACT[chem.id]) return mixEltSalt(elt, chem.id);
      if (MIX_SALT_NO[chem.id]) {
        if (!mixEltIsMetal(elt.cat)) return null;
        const metName = chem.id === 'cacl2' ? 'कैल्शियम' : chem.id === 'nacl' ? 'सोडियम' : chem.id === 'ki' ? 'पोटैशियम' : chem.id === 'na2so4' ? 'सोडियम' : 'सोडियम';
        return { eq:'—', type:'कोई विस्थापन नहीं', obs:elt.n + ' (' + elt.s + ') ठोस है — ' + metName + ' इतना क्रियाशील है कि लवण-विलयन से विस्थापित नहीं हो सकता। लवण उसी रूप में मिला रहा।', sol:'#bfdbfe', gas:false, precip:false, heat:false };
      }
      return null;
  }
}

// ============================================================
//  "क्या-क्या मिलाएँ" — hint चिप्स (एक क्लिक में प्रयोग)
// ============================================================
const MIX_IDEAS = [
  { a:'hcl',     b:'zn',      t:'HCl + Zn → H₂ (पॉप-पॉप)' },
  { a:'hcl',     b:'na2co3',  t:'HCl + Na₂CO₃ → CO₂ फ़िज़' },
  { a:'hcl',     b:'naoh',    t:'HCl + NaOH → उदासीनीकरण' },
  { a:'agno3',   b:'nacl',    t:'AgNO₃ + NaCl → AgCl (सफेद ↓)' },
  { a:'ch3cooh', b:'nahco3',  t:'सिरका + बेकिंग सोडा → CO₂ ज्वालामुखी' },
  { a:'bacl2',   b:'na2so4',  t:'BaCl₂ + Na₂SO₄ → BaSO₄ (सफेद ↓)' },
  { a:'cuso4',   b:'fe',      t:'CuSO₄ + Fe → ताँबे की परत' },
  { a:'fecl3',   b:'naoh',    t:'FeCl₃ + NaOH → भूरा अवक्षेप' },
  { a:'ca',      b:'h2o',     t:'चूना + जल → बुझा चूना (गर्म!)' },
  { a:'soap',    b:'cacl2',   t:'साबुन + कठोर जल → स्कम' },
  { a:'cuso4',   b:'h2o2',    t:'CuSO₄ + H₂O₂ → झाग-फुहार' },
  { a:'E11',     b:'h2o',     t:'सोडियम + जल → H₂ (खतरा!)' },
  { a:'E12',     b:'hcl',     t:'Mg + HCl → H₂ पॉप' },
  { a:'E29',     b:'agno3',   t:'ताँबा + AgNO₃ → चाँदी' },
  { a:'E26',     b:'cuso4',   t:'लोहा + CuSO₄ → ताँबा' },
  { a:'E13',     b:'naoh',    t:'Al + NaOH → H₂' },
  { a:'E11',     b:'E17',     t:'सोडियम + क्लोरीन → NaCl' }
];

let mixBeaker = [];       // current ids in beaker
let mixResult = null;     // {eq,type,obs} of the reaction shown

function renderMixLab(el) {
  const container = document.getElementById(el);
  if (!container) return;
  const eltIds = mixEltIds();
  const eltShelf = eltIds.length ? `
      <div class="mix-palette mix-palette-elt">
        <div class="mix-label">🔬 आवर्त सारणी के तत्व (${eltIds.length}) — drag / click</div>
        <div class="elt-shelf">
        ${eltIds.map(z => {
          const e = mixEltData('E' + z);
          if (!e) return '';
          return `<div class="elt-item" draggable="true" id="chem-E${z}"
            style="--c:${MIX_ELT_COLORS[e.cat] || '#e2e8f0'}"
            ondragstart="mixDragStart(event,'E${z}')"
            onclick="mixAdd('E${z}')">
            <b class="elt-sym">${e.s}</b>
            <span class="elt-name">${e.n}</span>
            <span class="elt-cat">${e.cat}</span>
          </div>`;
        }).join('')}
        </div>
      </div>` : '';
  let html = `
  <div class="mix-wrap">
    <div class="mix-head">
      <h3>⚗️ रसायन मिक्सिंग लैब</h3>
      <p>नीचे की पेटियों से किसी पदार्थ को beaker में <b>खींचो (drag)</b> या <b>click</b> करके डालो। फिर "🔥 मिलाओ" दबाओ — असली प्रयोगशाला जैसा परिणाम देखो।</p>
    </div>

    <div class="mix-hints">
      <b>💡 क्या-क्या मिलाएँ? (Hint)</b>
      <p>इन जोड़ियों पर क्लिक करो — beaker खुद भरकर अभिक्रिया दिख जाएगी।</p>
      <div class="mix-hint-row">
      ${MIX_IDEAS.map(h => `<button class="mix-hint-chip" onclick="mixHint('${h.a}','${h.b}')">${h.t}</button>`).join('')}
      </div>
    </div>

    <div class="mix-body">

      <div class="mix-palette">
        <div class="mix-label">🧫 प्रयोगशाला के पदार्थ (drag / click)</div>
        <div class="mix-shelf">
        ${Object.values(CHEMICALS).map(c => `
          <div class="chem-item" draggable="true" id="chem-${c.id}"
            style="--c:${c.color}"
            ondragstart="mixDragStart(event,'${c.id}')"
            onclick="mixAdd('${c.id}')">
            <span class="chem-emoji">${c.emoji}</span>
            <b>${c.f}</b>
            <span class="chem-name">${c.name}</span>
            <span class="chem-kind">${c.kind}</span>
          </div>`).join('')}
        </div>
        ${eltShelf}
      </div>

      <div class="mix-beaker-area">
        <div class="mix-label">🧪 बीकर</div>
        <div class="beaker" id="mixBeaker"
          ondragover="event.preventDefault()"
          ondragenter="event.preventDefault()"
          ondrop="mixDrop(event)">
          <div class="beaker-glass" id="beakerGlass"></div>
          <div class="beaker-water" id="beakerWater"></div>
          <div class="beaker-chips" id="beakerChips">
            <span class="beaker-hint">पदार्थ यहाँ डालो</span>
          </div>
        </div>
        <div class="mix-controls">
          <button class="btn btn-success" onclick="mixChemicals()">🔥 मिलाओ और अभिक्रिया देखो</button>
          <button class="btn btn-secondary" onclick="mixClear()">🗑️ साफ़ करो</button>
        </div>
        <div class="mix-result" id="mixResult" style="display:none"></div>
      </div>

    </div>
  </div>`;
  container.innerHTML = html;
}

function mixHint(a, b) {
  mixBeaker = [a, b];
  mixResult = null;
  renderBeaker();
  mixChemicals();
}

function mixDragStart(event, id) {
  event.dataTransfer.setData('text/plain', id);
}
function mixDrop(event) {
  event.preventDefault();
  const id = event.dataTransfer.getData('text/plain');
  if (id) mixAdd(id);
}
function mixAdd(id) {
  if (!CHEMICALS[id] && !mixEltData(id)) return;
  if (mixBeaker.includes(id)) { showToastForLab('🔄 यह पदार्थ पहले से beaker में है', 'warn'); return; }
  mixBeaker.push(id);
  renderBeaker();
  mixResult = null;
  const r = document.getElementById('mixResult');
  if (r) r.style.display = 'none';
}
function mixClear() {
  mixBeaker = [];
  mixResult = null;
  renderBeaker();
  const r = document.getElementById('mixResult');
  if (r) r.style.display = 'none';
}
function renderBeaker() {
  const glass = document.getElementById('beakerGlass');
  const water = document.getElementById('beakerWater');
  const chips = document.getElementById('beakerChips');
  if (!glass || !chips) return;

  // solution color: blend = use last liquid color
  let solColor = '#cffafe';
  const liquidCount = mixBeaker.filter(id => { const m = mixInfo(id); return m && m.liquid; }).length;
  let lastLiq = null;
  mixBeaker.forEach(id => { const m = mixInfo(id); if (m && m.liquid) lastLiq = m; });
  if (lastLiq) solColor = lastLiq.color;

  // solids show as floating chips
  chips.innerHTML = mixBeaker.map((id) => {
    const m = mixInfo(id);
    if (!m) return '';
    return `<span class="beaker-chip" style="--ch:${m.color}" onmousedown="event.stopPropagation()">
      ${m.emoji} ${m.f} <i class="beaker-x" onclick="event.stopPropagation();mixRemove('${id}')">✕</i></span>`;
  }).join('') || '<span class="beaker-hint">पदार्थ यहाँ डालो</span>';

  // show liquid level
  const fill = Math.min(60 + liquidCount * 12, 92);
  water.style.height = fill + '%';
  water.style.background = solColor;
  glass.style.display = mixBeaker.length ? 'block' : 'none';
}
function mixRemove(id) {
  mixBeaker = mixBeaker.filter(x => x !== id);
  mixResult = null;
  const r = document.getElementById('mixResult');
  if (r) r.style.display = 'none';
  renderBeaker();
}

function labEsc(s) {
  return String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

// अभिक्रिया की किस्म के चिप — हर परिणाम में दिखाओ
function mixCategoryChips(r) {
  if (!r) return '';
  const t = r.type || '';
  const chips = [];
  if (/द्विविस्थापन/.test(t)) chips.push('द्विविस्थापन');
  else if (/विस्थापन/.test(t)) chips.push('विस्थापन');
  if (/संयोजन/.test(t)) chips.push('संयोजन');
  if (/अपघटन/.test(t)) chips.push('अपघटन');
  if (/उदासीनीकरण/.test(t)) chips.push('उदासीनीकरण');
  if (/ऑक्सीकरण|रेडॉक्स|अपचयन/.test(t)) chips.push('ऑक्सीकरण-अपचयन');
  if (/अवक्षेप|परिक्षेपण/.test(t) || r.precip) chips.push('अवक्षेपण');
  if (/अम्ल \+ कार्बोनेट/.test(t)) chips.push('द्विविस्थापन');
  if (/विलयन|तनुकरण/.test(t)) chips.push('भौतिक परिवर्तन');
  return chips.length ? '<div class="mix-cats"><b>किस्म:</b> ' + chips.map(c => `<span class="mix-cat">${c}</span>`).join('') + '</div>' : '';
}

function labBalanceHtml(r) {
  if (!r) return '';
  let html = mixCategoryChips(r);
  const eqStr = r.eq;
  if (!eqStr || eqStr === '—' || r.skipBal || typeof checkBalance !== 'function' || typeof bDecompose !== 'function') return html;
  try {
    const cb = checkBalance(eqStr);
    if (!cb) return html + '<div class="mix-bal none">ℹ️ इस समीकरण के लिए परमाणु-गिनती स्वतः नहीं हो पाई — इसे सूत्र रूप में देखो।</div>';
    if (cb.balanced) return html + '<div class="mix-bal ok">✅ <b>संतुलित समीकरण:</b> परमाणु दोनों ओर बराबर हैं (परमाणु न तो बनते हैं न नष्ट होते)।</div>';
    const diff = cb.keys.filter(k => (cb.L[k] || 0) !== (cb.R[k] || 0)).map(k => `${k}: ${cb.L[k] || 0} vs ${cb.R[k] || 0}`).join('; ');
    return html + `<div class="mix-bal bad">⚠️ <b>असंतुलित:</b> परमाणु बराबर नहीं — ${labEsc(diff)}. &nbsp; <button class="btn btn-secondary btn-sm" onclick="openBalancer('${labEsc(eqStr)}', 'balOut');return false;">⚖️ संतुलित बनाना सीखो</button></div>`;
  } catch (e) { return html; }
}

function mixChemicals() {
  const out = document.getElementById('mixResult');
  if (!out) return;
  if (mixBeaker.length < 2) {
    showToastForLab('कम से कम 2 पदार्थ beaker में डालो — तभी अभिक्रिया होगी', 'warn');
    out.style.display = 'none';
    return;
  }

  // find first known pair among all pairs
  let found = null, idA = null, idB = null;
  for (let i = 0; i < mixBeaker.length && !found; i++) {
    for (let j = i + 1; j < mixBeaker.length; j++) {
      const a = mixBeaker[i], b = mixBeaker[j];
      const key = (REACTIONS[a + '+' + b]) ? a + '+' + b : (REACTIONS[b + '+' + a] ? b + '+' + a : null);
      if (key) { found = REACTIONS[key]; idA = a; idB = b; break; }
    }
  }

  if (!found) {
    for (let i = 0; i < mixBeaker.length && !found; i++) {
      for (let j = i + 1; j < mixBeaker.length; j++) {
        const a = mixBeaker[i], b = mixBeaker[j];
        const r = mixInferPair(a, b) || mixInferPair(b, a);
        if (r) { found = r; idA = a; idB = b; break; }
      }
    }
  }

  // 3) चतुर इंजन — कोई भी दो रसायन (अम्ल+धातु, लवण+लवण, क्षार+लवण ...)
  if (!found) {
    for (let i = 0; i < mixBeaker.length && !found; i++) {
      for (let j = i + 1; j < mixBeaker.length; j++) {
        const a = mixBeaker[i], b = mixBeaker[j];
        const r = mixInferChemChem(a, b) || mixInferChemChem(b, a);
        if (r) { found = r; idA = a; idB = b; break; }
      }
    }
  }

  if (!found) {
    found = { eq:'—', type:'कोई ज्ञात अभिक्रिया नहीं', obs:'इन पदार्थों की आपस में बोर्ड-स्तर की अभिक्रिया नहीं मिली — घोल/पदार्थ मिले रह गए। (जरूरी नहीं कि हर अभिक्रिया हो! उदा. तनु अम्ल + ताँबा या कम क्रियाशील धातु।) ऊपर "क्या-क्या मिलाएँ" के सुझाव आज़माओ।', sol:'#94a3b8', gas:false, heat:false, skipBal:true };
  }
  mixResult = found;

  renderBeaker();
  if (idA) {
    const wa = document.getElementById('beakerWater');
    if (wa && found.sol) wa.style.background = found.sol;
  }

  // result panel
  const typeLabel = found.type || 'अभिक्रिया';
  out.innerHTML = `
    <div class="mix-result-card" style="border-left:6px solid ${found.gas ? '#ef4444' : found.precip ? '#f59e0b' : '#10b981'}">
      <h4>🎬 अभिक्रिया का परिणाम</h4>
      <div class="mix-eq">⚗️ <b>समीकरण:</b> ${found.eq}</div>
      <div class="mix-type">🧩 <b>प्रकार:</b> ${typeLabel}</div>
      <div class="mix-obs">🔎 <b>अवलोकन:</b> ${found.obs}</div>
      ${labBalanceHtml(found)}
      ${found.gas ? '<div class="mix-gas">💨 <b>गैस!</b> बुलबुले उठ रहे हैं (हाइड्रोजन/CO₂/ऑक्सीजन)</div>' : ''}
      ${found.precip ? `<div class="mix-precip">🧂 <b>अवक्षेप:</b> ${found.precip}</div>` : ''}
      ${found.heat ? '<div class="mix-heat">♨️ <b>ऊष्माक्षेपी:</b> बर्तन गर्म हो रहा है — सावधान!</div>' : ''}
      ${found.gas ? '<div class="bub-area"></div>' : ''}
    </div>
    <div class="callout callout-warn mt-10">⚠️ यह वर्चुअल सिमुलेशन है। असली लैब में कभी भी बिना शिक्षक की अनुमति पदार्थ न मिलाएँ — आँखों/त्वचा से दूर रखें।</div>`;
  out.style.display = 'block';
  if (found.gas) animateBubbles();
  try { out.scrollIntoView({ behavior:'smooth', block:'nearest' }); } catch (e) {}
}

// little bubble animation (injected after result shown)
function animateBubbles() {
  const area = document.querySelector('.bub-area');
  if (!area) return;
  for (let i = 0; i < 14; i++) {
    const b = document.createElement('span');
    b.className = 'bubble';
    b.style.left = (8 + Math.random() * 84) + '%';
    b.style.animationDelay = (Math.random() * 1.2) + 's';
    b.style.animationDuration = (0.8 + Math.random() * 1.2) + 's';
    area.appendChild(b);
  }
}

function showToastForLab(msg, type) {
  if (typeof toast === 'function') { toast(msg, type || 'info'); return; }
  if (typeof window !== 'undefined' && window.alert) window.alert(msg);
}

// export for tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EXPERIMENTS, renderExperiments, switchExpTab, findExperiment, CHEMICALS, REACTIONS, renderMixLab, mixAdd, mixClear, mixRemove, mixChemicals, mixHint, mixInferPair, mixInferChemChem, mixEltData, mixEltIds, mixInfo };
}