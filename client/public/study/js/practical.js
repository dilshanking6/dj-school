// ============================================================
//  PRACTICAL LAB — JAC Class 10
//  Body organs, plant parts, cells — every diagram is a real
//  scientific image (sourced from Wikimedia Commons, bundled
//  locally for offline use) with every part named + its job.
//  Click any diagram to open the big zoom viewer.
//  Pure vanilla JS — works offline on file://.
// ============================================================

function prEscape(s) {
  return String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

const PRAC_PARTS = [

  // ================= BODY ORGANS =================
  {
    cat: 'body', title: '🫀 हृदय (Heart)',
    img: 'assets/prac/heart.png',
    alt: 'Human heart diagram',
    flow: '❥ अस्थायी → दायाँ अलिंद → दायाँ निलय → फेफड़े (शुद्ध होकर) → बायाँ अलिंद → बायाँ निलय → महाधमनी → पूरा शरीर',
    parts: [
      { name: 'दायाँ अलिंद (Right Atrium)', fn: 'शरीर से अशुद्ध (ऑक्सीजन-रहित) रक्त प्राप्त करता है।' },
      { name: 'बायाँ अलिंद (Left Atrium)', fn: 'फेफड़ों से शुद्ध रक्त लेता है।' },
      { name: 'दायाँ निलय (Right Ventricle)', fn: 'अशुद्ध रक्त को फेफड़ों में पंप करता है।' },
      { name: 'बायाँ निलय (Left Ventricle)', fn: 'सबसे ताकतवर — शुद्ध रक्त पूरे शरीर में पंप करता है।' },
      { name: 'महाधमनी (Aorta)', fn: 'शरीर की सबसे बड़ी धमनी — रक्त का मुख्य मार्ग।' },
      { name: 'सेप्टम (Septum)', fn: 'हृदय को दाएँ-बाएँ हिस्सों में बाँटती दीवार।' }
    ],
    note: 'हृदय लगभग आपकी मुट्ठी के बराबर होता है और एक मिनट में 60–100 बार धड़कता है।'
  },

  {
    cat: 'body', title: '🧠 मस्तिष्क (Brain)',
    img: 'assets/prac/brain.png',
    alt: 'Human brain lobes diagram',
    flow: '⟡ खोपड़ी के अंदर मस्तिष्क 3 मुख्य हिस्सों में: सेरेब्रम (सोच), सेरेबेलम (संतुलन), मेडुला (साँस-धड़कन)',
    parts: [
      { name: 'सेरेब्रम (Cerebrum)', fn: 'सोच, स्मृति, भाषा और सीखने का केंद्र — मस्तिष्क का सबसे बड़ा भाग।' },
      { name: 'सेरेबेलम (Cerebellum)', fn: 'शरीर का संतुलन और हरकतों की समन्वय।' },
      { name: 'मेडुला (Medulla)', fn: 'साँस, हृदयगति और रक्तचाप जैसे अनैच्छिक कार्य नियंत्रित।' },
      { name: 'फ्रंटल लोब', fn: 'निर्णय, भावना और योजना बनाना।' },
      { name: 'ओक्सीपिटल लोब', fn: 'देखने की जानकारी प्रोसेस होती है।' }
    ],
    note: 'मस्तिष्क में लगभग 86 अरब न्यूरॉन (तंत्रिका कोशिकाएँ) होती हैं।'
  },

  {
    cat: 'body', title: '👁️ नेत्र (Eye)',
    img: 'assets/prac/eye.png',
    alt: 'Human eye cross section diagram',
    flow: '✦ प्रकाश → कॉर्निया → आइरिस/पुतली → लेंस → रेटिना पर उल्टा बिम्ब → दृक् तंत्रिका → मस्तिष्क (सीधा कर देता है)',
    parts: [
      { name: 'कॉर्निया (Cornea)', fn: 'वह पारदर्शी उभार जो प्रकाश को नेत्र में मोड़ता है।' },
      { name: 'आइरिस + पुतली', fn: 'आइरिस पुतली का आकार बदलकर प्रकाश की मात्रा नियंत्रित करती है।' },
      { name: 'लेंस (Lens)', fn: 'उत्तल लेंस प्रकाश को रेटिना पर केंद्रित करता है।' },
      { name: 'रेटिना (Retina)', fn: 'प्रकाश-संवेदी कोशिकाएँ (रॉड व कोन) — बिम्ब बनता है।' },
      { name: 'दृक् तंत्रिका', fn: 'रेटिना का संकेत मस्तिष्क को भेजती है।' },
      { name: 'रॉड व कोन', fn: 'रॉड = कम रोशनी/काला-सफेद; कोन = रंग देखना।' }
    ],
    note: 'मंद रोशनी में पुतली (pupil) बड़ी, तेज़ रोशनी में छोटी होती है।'
  },

  {
    cat: 'body', title: '👂 कान (Ear)',
    img: 'assets/prac/ear.png',
    alt: 'Human ear anatomy diagram',
    flow: '♪ ध्वनि → पिन्ना → कर्ण नाल → कान का पर्दा → कर्ण अस्थियाँ → कॉक्लिया → श्रवण तंत्रिका → मस्तिष्क',
    parts: [
      { name: 'पिन्ना (Pinna)', fn: 'ध्वनि तरंगें इकट्ठा कर कान में भेजता है।' },
      { name: 'कर्ण नाल व पर्दा', fn: 'ध्वनि नाल होकर पर्दे (tympanic membrane) को कंपाती है।' },
      { name: 'कर्ण अस्थियाँ (Ossicles)', fn: 'पर्दे का कंपन बढ़ाकर (amplify) आगे भेजती हैं।' },
      { name: 'कॉक्लिया (Cochlea)', fn: 'घोंघा-आकार — ध्वनि स्पंदन को संकेत में बदलता है।' },
      { name: 'अर्धवृत्ताकार नालें', fn: 'संतुलन बनाए रखने में मदद करती हैं।' },
      { name: 'श्रवण तंत्रिका', fn: 'संकेत मस्तिष्क तक ले जाती है।' }
    ],
    note: 'कुछ कीड़ों के कान उनकी टाँगों पर होते हैं!'
  },

  {
    cat: 'body', title: '🫘 वृक्क/गुर्दा (Kidney)',
    img: 'assets/prac/kidney.png',
    alt: 'Kidney nephron diagram',
    flow: '❄ ग्लोमेर्युलस में रक्त छनता है → बाउमैन कैप्सूल → मज्जा (पुनःअवशोषण) → रेनल पेल्विस → मूत्रवाहिनी → मूत्राशय',
    parts: [
      { name: 'नेफ्रॉन (Nephron)', fn: 'गुर्दे की कार्यात्मक इकाई — रक्त छानकर मूत्र बनाती है।' },
      { name: 'ग्लोमेर्युलस', fn: 'रक्त केशिकाओं का गुच्छा जहाँ निस्यंदन (filtration) होता है।' },
      { name: 'बाउमैन कैप्सूल', fn: 'ग्लोमेर्युलस का खोल जो छना हुआ द्रव ग्रहण करता है।' },
      { name: 'वृक्क प्रांतस्था (Cortex)', fn: 'बाहरी परत — नेफ्रॉन के अधिकांश भाग।' },
      { name: 'मज्जा (Medulla)', fn: 'अंदरूनी परत — पुन:अवशोषण।' },
      { name: 'रेनल पेल्विस व मूत्रवाहिनी', fn: 'मूत्र इकट्ठा कर मूत्राशय तक पहुँचाती है।' }
    ],
    note: 'रोज़ गुर्दे करीब 180 लीटर रक्त छानते हैं (जिसमें से ~1.5 लीटर मूत्र)।'
  },

  {
    cat: 'body', title: '🧬 तंत्रिका कोशिका (Neuron)',
    img: 'assets/prac/neuron.png',
    alt: 'Neuron structure diagram',
    flow: '➜ संदेश: डेंड्राइट → कोशिका काय → अक्षतंतु → सिनैप्स → अगली कोशिका',
    parts: [
      { name: 'डेंड्राइट्स (Dendrites)', fn: 'दूसरी कोशिकाओं से संदेश ग्रहण करते हैं।' },
      { name: 'कोशिका काय (Cell body)', fn: 'न्यूक्लियस व अंगक — कोशिका का केंद्र।' },
      { name: 'अक्षतंतु (Axon)', fn: 'लंबा तंतु जो संदेश आगे भेजता है।' },
      { name: 'माइलिन शीथ', fn: 'अक्षतंतु की सुरक्षा करती व संदेश को तेज़ बनाती है।' },
      { name: 'अक्षीय अंत (Synapse)', fn: 'रसायन (neurotransmitter) छोड़कर संदेश अगली कोशिका तक पहुँचाता है।' }
    ],
    note: 'स्पर्श से लेकर सोचने तक — सब कुछ न्यूरॉन के संदेशों पर चलता है।'
  },

  {
    cat: 'body', title: '🫁 फेफड़े (Lungs)',
    img: 'assets/prac/lungs.png',
    alt: 'Respiratory system and lungs diagram',
    flow: '⇅ साँस: नाक → श्वासनली → श्वसनी → श्वसनिकाएँ → कूपिकाएँ (O₂ ⇄ CO₂ का विनिमय)',
    parts: [
      { name: 'श्वासनली (Trachea)', fn: 'हवा को फेफड़ों तक ले जाने वाली नली।' },
      { name: 'श्वसनी (Bronchi)', fn: 'श्वासनली के दो हिस्से — प्रत्येक फेफड़े में।' },
      { name: 'कूपिकाएँ (Alveoli)', fn: 'अंगूर-गुच्छे जैसी थैलियाँ — यहीं O₂ ↔ CO₂ विनिमय होता है।' },
      { name: 'डायफ्राम', fn: 'दीवार जो सिकुड़कर/फैलकर साँस लेने में मदद करती है।' },
      { name: 'नाक का श्लेष्मा व बाल', fn: 'हवा को गरम, नम और साफ़ करते हैं।' }
    ],
    note: 'फेफड़ों में कूपिकाएँ 100 m² तक का क्षेत्रफल बनाती हैं — टेनिस कोर्ट जितना!'
  },

  {
    cat: 'body', title: '🍽️ मानव पाचन तंत्र (Digestive System)',
    img: 'assets/prac/digestive.png',
    alt: 'Human digestive system diagram',
    flow: '➹ मुँह → ग्रासनली → आमाशय → छोटी आंत (पोषण का अवशोषण) → बड़ी आंत (पानी) → मलद्वार',
    parts: [
      { name: 'मुँह व लार', fn: 'दाँत चबाते हैं, लार का एमाइलेज़ स्टार्च को शर्करा बनाता है।' },
      { name: 'ग्रासनली (Oesophagus)', fn: 'भोजन को आमाशय तक पहुँचाती है।' },
      { name: 'आमाशय (Stomach)', fn: 'HCl + पाचक एंजाइम — भोजन का पाचन शुरू।' },
      { name: 'छोटी आंत', fn: 'पोषक तत्वों का अवशोषण (विल्ली से)।' },
      { name: 'बड़ी आंत', fn: 'पानी व लवण का अवशोषण — मल का निर्माण।' },
      { name: 'यकृत व अग्नाशय', fn: 'पित्त व पाचक रस — वसा/प्रोटीन पचाने में मदद।' }
    ],
    note: 'छोटी आंत की लंबाई ~6–7 मीटर होती है (इतनी तह उसमें होती है)।'
  },

  // ================= PLANTS =================
  {
    cat: 'plant', title: '🌸 फूल (Flower)',
    img: 'assets/prac/flower.png',
    alt: 'Labeled daffodil flower diagram',
    flow: '✿ परागण → निषेचन → बीजांड → बीज → नया पौधा',
    parts: [
      { name: 'पंखुड़ी (Petal)', fn: 'रंगीन — परागण के लिए कीटों को आकर्षित करती है।' },
      { name: 'बाह्यदल (Sepal)', fn: 'कली अवस्था में फूल की रक्षा करता है।' },
      { name: 'पुंकेसर (Stamen)', fn: 'परागकेश (anther) + डंठल (filament) — पराग बनाता है।' },
      { name: 'परागकण (Pollen)', fn: 'नर युग्मक — कीट/हवा से स्त्रीकेसर तक जाता है।' },
      { name: 'स्त्रीकेसर (Pistil)', fn: 'वर्तिका+प्रवर्तिका+अंडाशय — स्त्री जनन अंग।' },
      { name: 'अंडाशय व बीजांड', fn: 'बीजांड में अंडाणु — निषेचन के बाद बीज व फल बनते हैं।' }
    ],
    note: 'फूल का काम है परागण करना ताकि पौधा बीज बना सके।'
  },

  {
    cat: 'plant', title: '🌱 पौधा (Plant)',
    img: 'assets/prac/plant.png',
    alt: 'Plant anatomy diagram',
    flow: '⇅ जड़ (पानी/लवण) → तना → पत्ती: ज़ाइलम नीचे-से-ऊपर (जल), फ्लोएम ऊपर-से-नीचे (भोजन)',
    parts: [
      { name: 'जड़ (Root)', fn: 'मिट्टी से पानी व लवण खींचता है — पौधे को जमीन में टिकाए रखती है।' },
      { name: 'तना (Stem)', fn: 'पानी को पत्तियों तक, भोजन को पूरे पौधे में भेजता है।' },
      { name: 'पत्ती (Leaf)', fn: 'प्रकाश-संश्लेषण द्वारा भोजन बनाती है।' },
      { name: 'ज़ाइलम (Xylem)', fn: 'जड़ से पत्ती तक पानी व लवण (नीचे से ऊपर)।' },
      { name: 'फ्लोएम (Phloem)', fn: 'पत्ती से भोजन पूरे पौधे में (ऊपर से नीचे)।' },
      { name: 'रंध्र (Stomata)', fn: 'गैसों का आदान-प्रदान व जल का वाष्पोत्सर्जन।' }
    ],
    note: 'पौधे वाष्पोत्सर्जन से हवा को ठंडा रखते हैं — प्रकृति का एयर-कंडीशनर!'
  },

  {
    cat: 'plant', title: '🍃 पत्ती व रंध्र (Leaf & Stomata)',
    img: 'assets/prac/leaf.png',
    alt: 'Leaf cross section and stomata diagram',
    flow: '⇄ रंध्र खुलते/बंद होते हैं — CO₂ अंदर, O₂ व जलवाष्प बाहर (वाष्पोत्सर्जन)',
    parts: [
      { name: 'पर्णफलक (Lamina)', fn: 'पत्ती का चौड़ा भाग — प्रकाश-संश्लेषण की फैक्टरी।' },
      { name: 'मध्यशिरा व शिराएँ', fn: 'पानी पहुँचाना व पत्ती की आकृति बनाए रखना।' },
      { name: 'वृंत (Petiole)', fn: 'पत्ती को तने से जोड़ता है।' },
      { name: 'रंध्र (Stomata)', fn: 'त्वचा पर छिद्र — CO₂ अंदर, O₂ व जलवाष्प बाहर।' },
      { name: 'रक्षक कोशिकाएँ', fn: 'रंध्र का खुलना-बंद होना नियंत्रित करती हैं।' },
      { name: 'क्लोरोफिल', fn: 'हरा रंगद्रव्य — सूर्य की ऊर्जा पकड़कर भोजन बनाता है।' }
    ],
    note: 'क्लोरोफिल के बिना पृथ्वी पर लगभग कोई जीवन नहीं होता।'
  },

  // ================= CELLS =================
  {
    cat: 'cell', title: '🦠 प्राणी कोशिका (Animal Cell)',
    img: 'assets/prac/animalcell.png',
    alt: 'Animal cell organelles diagram',
    flow: '◉ प्लाज्मा झिल्ली के अंदर अंगक: केंद्रक (नियंत्रण), माइटोकॉन्ड्रिया (ऊर्जा), राइबोसोम (प्रोटीन), गॉल्जी (पैकिंग)',
    parts: [
      { name: 'कोशिका झिल्ली', fn: 'पारगम्य दरवाज़ा — बाहर/अंदर क्या जाए सब नियंत्रित।' },
      { name: 'केंद्रक (Nucleus)', fn: 'कोशिका का दिमाग — DNA यहीं, सब गतिविधि नियंत्रित।' },
      { name: 'माइटोकॉन्ड्रिया', fn: 'ऊर्जा केंद्र — ATP (कोशिका की बैटरी) बनाता है।' },
      { name: 'अंतर्द्रव्यी जालिका (ER)', fn: 'प्रोटीन/वसा बनाने वाली कारखाना-मार्ग।' },
      { name: 'राइबोसोम', fn: 'प्रोटीन संश्लेषण की मशीन।' },
      { name: 'गॉल्जी बॉडी', fn: 'पदार्थों को पैक कर कोशिका से बाहर भेजता है।' }
    ],
    note: 'हर सेकंड आपकी कोशिकाएँ लाखों प्रोटीन बनाती हैं।'
  },

  {
    cat: 'cell', title: '🌿 पादप कोशिका (Plant Cell)',
    img: 'assets/prac/plantcell.png',
    alt: 'Plant cell organelles diagram',
    flow: '◉ पादप कोशिका में अतिरिक्त: कोशिका भित्ति (सेल्यूलोज़), हरितलवक (प्रकाश-संश्लेषण), बड़ा वैक्यूल',
    parts: [
      { name: 'कोशिका भित्ति', fn: 'सेल्यूलोज़ की दीवार — मज़बूती व आकृति देती है।' },
      { name: 'कोशिका झिल्ली', fn: 'पदार्थों का आवागमन नियंत्रण।' },
      { name: 'केंद्रक', fn: 'आनुवंशिक सामग्री व नियंत्रण।' },
      { name: 'हरितलवक (Chloroplast)', fn: 'क्लोरोफिल वाला अंगक — प्रकाश-संश्लेषण करता है।' },
      { name: 'वैक्यूल (Vacuole)', fn: 'बड़ा जलाशय — पानी, रंग व अपशिष्ट यहीं; कोशिका को सीधा रखता है।' },
      { name: 'राइबोसोम/माइटोकॉन्ड्रिया', fn: 'प्रोटीन बनाना व ऊर्जा देना।' }
    ],
    note: 'हरितलवक पृथ्वी को जीवित रखने वाला इकलौता "खाना बनाने वाला" अंगक है।'
  }
];

function renderPractical(containerId, cat) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const items = PRAC_PARTS.filter(p => !cat || p.cat === cat);
  el.innerHTML = items.map((p, idx) => {
    const img = prEscape(p.img);
    const alt = prEscape(p.alt || p.title);
    return `
    <div class="pr-card">
      <h3 class="pr-title">${p.title}</h3>
      <div class="pr-img-wrap">
        <img src="${img}" alt="${alt}" class="pr-img" loading="lazy"
             onclick="openPracZoom('${p.title.replace(/'/g, '\\\'')}', '${img}')">
        <button class="pr-zoombtn" onclick="openPracZoom('${p.title.replace(/'/g, '\\\'')}', '${img}')"
                title="बड़ा देखें / Zoom">🔍 बड़ा देखें</button>
      </div>
      ${p.flow ? `<div class="pr-flow">${prEscape(p.flow)}</div>` : ''}
      <ul class="pr-parts">
        ${p.parts.map(pp => `<li><b>${prEscape(pp.name)}:</b> ${prEscape(pp.fn)}</li>`).join('')}
      </ul>
      ${p.note ? `<p class="pr-note">💡 ${prEscape(p.note)}</p>` : ''}
    </div>`;
  }).join('');
}

function openPracZoom(title, img) {
  let lb = document.getElementById('pracLightbox');
  if (!lb) {
    lb = document.createElement('div');
    lb.id = 'pracLightbox';
    lb.className = 'pr-lightbox';
    lb.innerHTML = `<div class="pr-lb-box">
        <button class="pr-lb-close" title="बंद करें (Esc)">✕</button>
        <h3 class="pr-lb-title"></h3>
        <div class="pr-lb-imgwrap"><img class="pr-lb-img" alt="zoom"></div>
        <p class="pr-lb-hint">बड़ा देखने के लिए स्क्रॉल करें · बंद करने के लिए छवि पर या ✕ पर क्लिक करें</p>
      </div>`;
    document.body.appendChild(lb);
    lb.addEventListener('click', () => lb.classList.remove('open'));
    lb.querySelector('.pr-lb-close').addEventListener('click', e => { e.stopPropagation(); lb.classList.remove('open'); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('open'); });
  }
  lb.querySelector('.pr-lb-title').textContent = title.replace(/\\'/g, "'");
  lb.querySelector('.pr-lb-img').src = img;
  lb.querySelector('.pr-lb-img').alt = title.replace(/\\'/g, "'");
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePracZoom() {
  const lb = document.getElementById('pracLightbox');
  if (lb) { lb.classList.remove('open'); document.body.style.overflow = ''; }
}

function showPrac(cat, btn) {
  document.querySelectorAll('.prac-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderPractical('pracContainer', cat);
}

// 3D-style parallax tilt on the diagram cards (pure CSS transform — offline, always works)
function prTilt(e) {
  const wrap = e.target.closest('.pr-img-wrap');
  if (!wrap) return;
  const r = wrap.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width - 0.5;
  const py = (e.clientY - r.top) / r.height - 0.5;
  wrap.style.transform = 'perspective(900px) rotateX(' + (-py * 7).toFixed(2) + 'deg) rotateY(' + (px * 9).toFixed(2) + 'deg) scale(1.01)';
  wrap.style.overflow = 'visible';
}
function prTiltReset(e) {
  const wrap = e.target.closest('.pr-img-wrap');
  if (wrap) { wrap.style.transform = ''; }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => renderPractical('pracContainer', 'body'));
  document.addEventListener('mousemove', prTilt);
  document.addEventListener('mouseleave', prTiltReset);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PRAC_PARTS };
}