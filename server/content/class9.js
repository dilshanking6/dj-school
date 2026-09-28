// Class 9 (JAC / NCERT aligned) - chapter list + revision notes.
// Format per chapter: { t: title, pts: [key points], kw: [AI/lookup keywords] }

module.exports = {
  9: {
    label: 'कक्षा 9',
    labelEn: 'Class 9',
    board: 'JAC / NCERT',
    subjects: {
      maths: {
        name: 'गणित',
        nameEn: 'Mathematics',
        emoji: '🔢',
        color: '#f8b500',
        desc: 'संख्या प्रणाली से प्रायिकता तक, 13 अध्याय',
        chapters: [
          { t: 'संख्या प्रणाली (Number Systems)', pts: ['प्राकृतिक संख्याएँ, पूर्णांक, भाज्य और अभाज्य', 'परिमेय संख्याओं का दशमलव तथा आवर्त रूप', 'अंकगणित की आधारभूत परिभाषाएँ: समानुपाती, अनुपाती, प्रतिशत'], kw: ['number system', 'real number', 'irrational', 'rational', 'san'] },
          { t: 'बहुपद (Polynomials)', pts: ['बहुपद की परिभाषा और घात', 'बहुपद का योग, अंतर और गुणनफल', 'शून्यक तथा बहुपद समीकरण'], kw: ['polynomial', 'zero', 'factor'] },
          { t: 'निर्देशांक ज्यामिति (Coordinate Geometry)', pts: ['तल के निर्देशांक: x, y', 'चतुर्थांश और अक्षों पर बिंदु', 'y = mx + c का अर्थ'], kw: ['coordinate', 'quadrant', 'graph'] },
          { t: 'दो चर वाले रैखिक समीकरण युग्म (Linear Equations in Two Variables)', pts: ['रैखिक समीकरण युग्म का हल', 'ग्राफ द्वारा हल - दो रेखाएँ प्रतिच्छेद पर', 'शब्द समस्याओं का रैखिक समीकरण में रूपांतरण'], kw: ['linear equation', 'graph method', 'word problem'] },
          { t: 'यूक्लिड की ज्यामिति का परिचय (Introduction to Euclid’s Geometry)', pts: ['यूक्लिड की परिभाषाएँ, axioms और postulates', 'समतंय, संगत और संपूरक कोण', 'प्रमेय 1 से 5: रेखाओं की समतंयता'], kw: ['euclid', 'axiom', 'theorem', 'parallel'] },
          { t: 'रेखाएँ और कोण (Lines and Angles)', pts: ['संगत, अल_INTERNAL, पूरक और समकोण कोण', 'त्रिभुज का आंतरिक कोण योग 180°', 'समतंय रेखाओं पर कोणों के गुण'], kw: ['angle', 'parallel line', 'triangle angle sum'] },
          { t: 'त्रिभुज (Triangles)', pts: ['त्रिभुज के अंगों के बीच संबंध', 'समकोण त्रिभुज पर पाइथागोरस प्रमेय', 'समरूपता (ASA, AAS, SSS) मानदंड'], kw: ['triangle', 'pythagoras', 'similarity'] },
          { t: 'चतुर्भुज (Quadrilaterals)', pts: ['चतुर्भुज के प्रकार', 'समांतर चतुर्भुज के गुण', 'आयत, वर्ग, समचतुर्भुज, समलंब'], kw: ['quadrilateral', 'parallelogram', 'rhombus'] },
          { t: 'वृत्त (Circles)', pts: ['वृत्त की त्रिज्या, व्यास, परिधि', 'चाप और चापकेंद्र कोण', 'चक्र कोण सिद्धांत'], kw: ['circle', 'radius', 'arc', 'cyclic'] },
          { t: 'हेरॉन का सूत्र (Heron’s Formula)', pts: ['सर्वांगसम त्रिभुज का क्षेत्रफल', 'हेरॉन सूत्र का प्रयोग', 'त्रिभुज की शर्त (a + b > c)'], kw: ['heron', 'area of triangle', 's'] },
          { t: 'पृष्ठीय क्षेत्रफल और आयतन (Surface Areas and Volumes)', pts: ['घन, घनाभ, बेलन, शंकु, गोले का पृष्ठीय क्षेत्रफल', 'आयतन का सूत्र', 'उपयुक्तता (जीवित वस्तु से अधिक आवृत्ति)'], kw: ['surface area', 'volume', 'cylinder', 'cone', 'sphere'] },
          { t: 'सांख्यिकी (Statistics)', pts: ['आंकड़ों का संग्रहण, वर्गीकरण और आँकड़ा चित्र', 'माध्य, माध्यक और बहुलक', 'आँकड़ों का प्रदर्शन'], kw: ['statistics', 'mean', 'median', 'mode'] },
          { t: 'प्रायिकता (Probability)', pts: ['यादृच्छिक प्रयोग और परिणाम', '0 से 1 के बीच प्रायिकता', 'ताश और अंक के प्रयोग'], kw: ['probability', 'random', 'dice'] }
        ]
      },
      physics: {
        name: 'भौतिक विज्ञान',
        nameEn: 'Physics',
        emoji: '⚙️',
        color: '#845ef7',
        desc: 'गति, बल, ऊर्जा, ध्वनि और भौतिकी मापन',
        chapters: [
          { t: 'मापन (Units and Measurements)', pts: ['SI मात्रक: मीटर, किलोग्राम, सेकंड, एम्पियर', 'भौतिक राशि और मात्रक के बीच संबंध', 'विभिन्नता (अतिशयोक्ति) और त्रुटि'], kw: ['unit', 'measurement', 'si', 'error'] },
          { t: 'गति (Motion)', pts: ['विराम और चाल, वेग और त्वरण', 'समान और असमान गति', 's = ut + ½at², v = u + at, v² = u² + 2as'], kw: ['motion', 'speed', 'velocity', 'acceleration', 'kinematics'] },
          { t: 'बल तथा गति के नियम (Force and Laws of Motion)', pts: ['संयुक्त और परिणामी बल', 'न्यूटन का गति नियम तीनों रूपों में', 'संवेग, द्रव्यमान और आवेग'], kw: ['force', 'newton law', 'momentum', 'impulse', 'inertia'] },
          { t: 'गुरुत्वाकर्षण (Gravitation)', pts: ['गुरुत्वीय बल और g', 'मुक्त अवस्था की स्थिति (विराम और मुक्त गति)', 'g = GM/r² संबंध'], kw: ['gravity', 'weight', 'free fall', 'g'] },
          { t: 'कार्य और ऊर्जा (Work and Energy)', pts: ['कार्य की परिभाषा W = F s cos θ', 'गतिज और स्थितिज ऊर्जा', 'ऊर्जा संरक्षण नियम'], kw: ['work', 'energy', 'kinetic', 'potential', 'conservation'] },
          { t: 'ध्वनि (Sound)', pts: ['ध्वनि का संचरण और ऊर्जा के रूप में यात्रा', 'ध्वनि की तीव्रता, कंपन और लहरीय प्रदर्शन', 'परावर्तन, प्रतिध्वनि और डॉप्लर प्रभाव'], kw: ['sound', 'echo', 'doppler', 'wave', 'intensity'] },
          { t: 'खाद्य संसाधनों में सुधार (Improvement in Food Resources)', pts: ['फसल उत्पादन में सुधार की विधियाँ', 'पशुधन और पक्षी उत्पादन', 'उपभोक्ता स्वास्थ्य से जुड़े प्रश्न'], kw: ['food', 'crop', 'animal husbandry'] }
        ]
      },
      chemistry: {
        name: 'रसायन विज्ञान',
        nameEn: 'Chemistry',
        emoji: '🧪',
        color: '#20c997',
        desc: 'पदार्थ, परमाणु, अणु, तत्व और यौगिक',
        chapters: [
          { t: 'हमारे आस-पास का पदार्थ (Matter in Our Surroundings)', pts: ['पदार्थ के दो रूप: पदार्थ और अभाज्य पदार्थ', 'आवश्यक अवस्थाएँ: ठोस, द्रव, गैस, प्लाज़्मा', 'वाष्पीकरण, एसीकरण और क्वथन'], kw: ['matter', 'state', 'evaporation', 'plasma', 'boiling'] },
          { t: 'हमारे आस-पास के पदार्थ शुद्ध हैं या नहीं (Is Matter Around Us Pure)', pts: ['मिश्रण और अमिश्रण', 'विलयन: अविलेय, संतृप्त, असंतृप्त', 'निस्यंद, क्रिस्टलन, पुनः क्रिस्टलीकरण, वर्गीकरण'], kw: ['mixture', 'solution', 'solvent', 'saturated', 'filtration'] },
          { t: 'परमाणु और अणु (Atoms and Molecules)', pts: ['रासायनिक संयोजन के नियम', 'परमाणु द्रव्यमान और अणु द्रव्यमान', 'मोल की अवधारणा (n = given mass / molar mass)'], kw: ['atom', 'molecule', 'mole', 'law of combination', 'valency'] },
          { t: 'परमाणु की संरचना (Structure of the Atom)', pts: ['थॉमसन, रदरफोर्ड, बोर के मॉडल', 'कक्षक, अवस्था, चक्रण', 'इलेक्ट्रॉन विन्यास और समइलेक्ट्रॉनी'], kw: ['atom structure', 'bohr', 'orbital', 'isotope', 'nucleus'] },
          { t: 'कोशिका: संरचना और कार्य (The Cell)', pts: ['कोशिका की खोज (रॉबर्ट ब्राउन) और कोशिका सिद्धांत', 'कोशिका संघर्ष: परिवर्तनीय और अपरिवर्तनीय', 'कोशिकांग और उनके कार्य'], kw: ['cell', 'organelle', 'mitochondria', 'nucleus', 'membrane'] },
          { t: 'ऊतक (Tissues)', pts: ['कोशिका ऊतक और पादप ऊतक', 'विभाजन: त्वचा, पार्श्व, मांसपेशी, तंत्रिका', 'कोशिका द्रव्यमान का प्रभाव'], kw: ['tissue', 'division', 'meristem', 'muscle', 'nerve'] }
        ]
      },
      biology: {
        name: 'जीव विज्ञान',
        nameEn: 'Biology',
        emoji: '🧬',
        color: '#51cf66',
        desc: 'जैव प्रक्रम, स्वास्थ्य, खाद्य और पर्यावरण',
        chapters: [
          { t: 'जैव प्रक्रम: क्या जीव है (Life Processes)', pts: ['पोषण: स्वपोषी, परजीवी, मिश्राहारी', 'श्वसन: वायवीय और अवायवीय', 'वहन और उत्सर्जन'], kw: ['nutrition', 'respiration', 'excretion', 'transport'] },
          { t: 'नियंत्रण एवं समन्वय (Control and Coordination)', pts: ['तंत्रिका तंत्र और मस्तिष्क', 'स्पर्श, दृष्टि, श्रवण, स्वाद और घ्राण', 'मानव में सूचक ग्रंथि और हार्मोन'], kw: ['nervous system', 'brain', 'reflex', 'hormone'] },
          { t: 'जीव जनन कैसे करते हैं (How do Organisms Reproduce)', pts: ['अलैंगिक जनन: विखंडन, मुकुलन, खंडन', 'लैंगिक जनन और लक्षण', 'निषेचन और भ्रूण विकास'], kw: ['reproduction', 'fission', 'budding', 'fertilisation', 'clone'] },
          { t: 'आनुवंशिकता एवं जैव विकास (Heredity and Evolution)', pts: ['मेंडल का आनुवंशिकता नियम', 'लक्षणों की वंशागति', 'जैव विकास और विविधता'], kw: ['heredity', 'mendel', 'variation', 'evolution', 'gene'] },
          { t: 'मानव स्वास्थ्य एवं रोग (Health and Disease)', pts: ['सक्रिय और निष्क्रिय रोग', 'मानव प्रतिरक्षा (प्रतिरक्षा क्षमता)', 'प्रतिरक्षी, खाद्य और वाहकीय रोग'], kw: ['health', 'disease', 'immunity', 'antibody', 'pathogen'] },
          { t: 'पारिस्थितिक तंत्र का संरचनात्मक संगठन और कार्य (Ecosystem)', pts: ['जैविक और अजैविक घटक', 'उत्पादक, उपभोक्ता, अपघटक', 'ऊर्जा प्रवाह और पोषक चक्र'], kw: ['ecosystem', 'producer', 'consumer', 'decomposer', 'food chain'] }
        ]
      },
      history: {
        name: 'इतिहास',
        nameEn: 'History',
        emoji: '🏛️',
        color: '#e8590c',
        desc: 'फ्रांसीसी क्रांति से लेकर पशुपालक समाज तक',
        chapters: [
          { t: 'फ्रांसीसी क्रांति (The French Revolution)', pts: ['बुर्रा का शासन और अस्पताल, बैरन', 'राजा लुई XVI और राष्ट्रीय सभा', 'गणतंत्र की घोषणा और गिरोहियों का शासन'], kw: ['french revolution', '1789', 'bastille', 'republic'] },
          { t: 'यूरोप में समाजवाद और रूसी क्रांति (Socialism in Europe and the Russian Revolution)', pts: ['मार्क्स और एंगेल्स का विचार', '1917 की रूसी क्रांति और बोल्शेविक क्रांति', 'साम्यवाद का प्रभाव'], kw: ['socialism', 'russian revolution', 'marx', '1917', 'bolshevik'] },
          { t: 'नाज़ीवाद और हिटलर का उदय (Nazism and the Rise of Hitler)', pts: ['हिटलर का उदय और नाज़ी पार्टी', 'यहूदों पर अत्याचार और हॉलोकॉस्ट', 'द्वितीय विश्व युद्ध की पृष्ठभूमि'], kw: ['hitler', 'nazi', 'holocaust', 'wwii'] },
          { t: 'वन समाज और औपनिवेशिकवाद (Forest Society and Colonialism)', pts: ['जंगलों का वास्तविक राजस्व सर्वेक्षण', 'साम्राज्यवाद और जंगलों का व्यवस्थापन', 'औपनिवेशिक भूमि राजस्व'], kw: ['forest', 'colonialism', 'land revenue', 'sunderbans'] },
          { t: 'आधुनिक संसार में पशुपालक (Pastoralists in the Modern World)', pts: ['पशुपालकों की जीवनशैली और चरागाह', '19वीं शताब्दी में बदलाव', 'नीला क्षेत्र और सीमांत भूमि'], kw: ['pastoralist', 'pasture', 'nomad', 'borderland'] }
        ]
      },
      geography: {
        name: 'भूगोल',
        nameEn: 'Geography',
        emoji: '🌏',
        color: '#1098ad',
        desc: 'भारत की भौगोमिक स्थिति, जलवायु, जनसंख्या',
        chapters: [
          { t: 'भारत - आकार और स्थिति (India – Size and Location)', pts: ['भारत का अवस्थितीय विस्तार', 'मानक देशांतर और समय क्षेत्र', 'भारत की सीमाएँ'], kw: ['india location', 'latitude', 'longitude', 'area', 'neighbours'] },
          { t: 'भारत की भौतिक विशेषताएँ (Physical Features of India)', pts: ['हिमालय, पहाड़, मैदान और पठार', 'नदी तंत्र और झीलें', 'समुद्र तटीय मैदान'], kw: ['himachal', 'plain', 'plateau', 'river', 'desert'] },
          { t: 'अपवाह (Drainage)', pts: ['नदी तंत्र का वर्गीकरण', 'हिमालय और प्रायद्वीपीय नदियाँ', 'झीलों और झरनों का निर्माण'], kw: ['drainage', 'river system', 'lake', 'ganga', 'narmada'] },
          { t: 'जलवायु (Climate)', pts: ['मानसून की व्यवस्था', 'सितंबर की हवा और वर्षा', 'भारत की जलवायु के प्रकार'], kw: ['climate', 'monsoon', 'rainfall', 'weather'] },
          { t: 'प्राकृतिक वनस्पति और वन्य जीवन (Natural Vegetation and Wildlife)', pts: ['पाँच प्रमुख वन क्षेत्र', 'मानव तथा जैव प्रकार', 'वन्य जीवन संरक्षण'], kw: ['vegetation', 'wildlife', 'forest', 'sanctuary', 'species'] },
          { t: 'जनसंख्या (Population)', pts: ['जनसंख्या वितरण और घनत्व', 'वृद्धि दर, जन्म और मृत्यु दर', 'राष्ट्रीय जनसंख्या नीति'], kw: ['population', 'density', 'birth rate', 'migration'] }
        ]
      },
      civics: {
        name: 'राजनीति विज्ञान',
        nameEn: 'Civics',
        emoji: '⚖️',
        color: '#7048e8',
        desc: 'लोकतंत्र, संविधान और मौलिक अधिकार',
        chapters: [
          { t: 'लोकतंत्र क्या है? लोकतंत्र क्यों? (What is Democracy? Why Democracy?)', pts: ['लोकतंत्र की परिभाषा और विशेषताएँ', 'निरंकुश शासन के विरुद्ध लोकतांत्रिक मूल्य', 'सरकार बनाने के तरीके'], kw: ['democracy', 'monarchy', 'dictatorship', 'government'] },
          { t: 'संवैधानिक डिजाइन (Constitutional Design)', pts: ['संविधान का महत्व और निर्माण', 'भारतीय संविधान की मुख्य विशेषताएँ', 'संघीय, पंथ निरपेक्ष, लोकतांत्रिक'], kw: ['constitution', 'cabinet', 'federal', 'secular'] },
          { t: 'चुनावी राजनीति (Electoral Politics)', pts: ['सार्वभौमिक निर्वाचन', 'मतदान के सिद्धांत और प्रक्रिया', 'चुनाव सुधार'], kw: ['election', 'vote', 'electoral', 'campaign'] },
          { t: 'संस्थाओं की कार्यप्रणाली (Working of Institutions)', pts: ['संसद, राष्ट्रपति और प्रधानमंत्री', 'विधायिका, कार्यपालिका और न्यायपालिका', 'केंद्र और राज्य सरकार'], kw: ['parliament', 'lok sabha', 'rajya sabha', 'president', 'judiciary'] },
          { t: 'लोकतांत्रिक अधिकार (Democratic Rights)', pts: ['मौलिक अधिकार और मौलिक कर्तव्य', 'विधि द्वारा स्थापित अधिकार', 'राष्ट्रीय अल्पसंख्यकों के अधिकार'], kw: ['rights', 'fundamental', 'minority', 'constitution'] }
        ]
      },
      economics: {
        name: 'अर्थशास्त्र',
        nameEn: 'Economics',
        emoji: '📈',
        color: '#ae3ec9',
        desc: 'विकास, गरीबी और खाद्य सुरक्षा',
        chapters: [
          { t: 'गाँव: पालमपुर (The Village Palampur)', pts: ['पालमपुर गाँव का परिचय', 'मानव पूँजी और श्रम का अर्थव्यवस्था में उपयोग', 'गाँव की आय और व्यय'], kw: ['palampur', 'village', 'harvest', 'labour'] },
          { t: 'लोग संसाधन के रूप में (People as Resource)', pts: ['मानव संसाधन और मानव पूँजी निर्माण', 'शिक्षा और स्वास्थ्य पर व्यय', 'श्रम बाज़ार और बेरोजगारी'], kw: ['human resource', 'education', 'health', 'unemployment'] },
          { t: 'गरीबी एक चुनौती (Poverty as a Challenge)', pts: ['गरीबी की परिभाषा और मापक', 'गरीबी के कारण', 'गरीबी उन्मूलन कार्यक्रम'], kw: ['poverty', 'slum', 'malnutrition', 'deprivation'] },
          { t: 'भारत में खाद्य सुरक्षा (Food Security in India)', pts: ['खाद्य सुरक्षा और कुपोषण', 'सार्वजनिक वितरण प्रणाली', 'और अन्नपूर्णि योजना'], kw: ['food security', 'ration', 'pds', 'midday meal', 'hunger'] }
        ]
      },
      hindi: {
        name: 'हिन्दी',
        nameEn: 'Hindi',
        emoji: '📕',
        color: '#ff6b6b',
        desc: 'क्षितिज भाग-1, स्पर्श भाग-1, संचयन और व्याकरण',
        chapters: [
          { t: 'क्षितिज भाग-1: काव्य खंड', pts: ['आपका दिन, डंपरा, बीती हुई बातें, मित्रता, गुरु', 'गिरधार गाड़ी, रस्सी, साखी, पद, सहजोवन', 'काव्य में आत्मकथा और चित्रण शैली'], kw: ['sparsh', 'gadya', 'kavya', 'kavita'] },
          { t: 'क्षितिज भाग-1: गद्य खंड', pts: ['धूल से धरती, गेहूँ के दाने, मछली, दो दोस्तों का मेहसीद', 'धन्व और दूधवाला, नाना-दादा, चार पैरों वाला जानवर', 'अंधा पिंड नहीं अनमोल और बात-व्यवहार'], kw: ['gadya khand', 'dhool', 'gehu', 'dost', 'vaakya'] },
          { t: 'स्पर्श भाग-1', pts: ['गिलहरी, स्मृति, कल्लू कुम्हार की उनाकोटी', 'मेरा छोटा सा निजी पुस्तकालय, साँवले साँवले दिन, गाँव के दिन', 'श्रम विभाजन और जाति प्रथा पर प्रश्न'], kw: ['sparsh bhag 1', 'gilahari', 'library', 'shram vibhajan'] },
          { t: 'संचयन भाग-1', pts: ['गिलहरी, स्मृति, कल्लू कुम्हार की उनाकोटी', 'निजी पुस्तकालय और साँवले दिन', 'अतिरिक्त पठन सामग्री'], kw: ['sanchayan', 'extra', 'reading'] },
          { t: 'व्याकरण खंड', pts: ['शब्द-भेद: रचना, अर्थ, कार्य में भेद', 'संधि और समास', 'वाक्य-शुद्धि और अनुच्छेद लेखन'], kw: ['grammar', 'sandhi', 'samash', 'vachya'] },
          { t: 'अपठित अनुच्छेद एवं व्यावहारिक व्याकरण', pts: ['अनुच्छेद पर आधारित प्रश्न', 'साहित्यिक पदों का अर्थ', 'संवाद लेखन'], kw: ['unread passage', 'apathit', 'dialogue'] }
        ]
      },
      english: {
        name: 'English',
        nameEn: 'English',
        emoji: '📘',
        color: '#4ecdc4',
        desc: 'Snapshots, Hornbill supplementary reader and grammar',
        chapters: [
          { t: 'Snapshots Supplementary Reader - Part A', pts: ['The Fun They Had, The Sound of Music, The Little Girl, A Truly Beautiful Mind', 'The Snake and the Mirror, My Childhood, Reach for the Top, Katherine', 'If I Were You'], kw: ['snapshots', 'supplementary', 'fun they had', 'katherine'] },
          { t: 'Snapshots Supplementary Reader - Part B', pts: ['The Lake Isle of Innisfree, The Gardener, The Road Not Taken, Wind', 'Rain on the Roof, The Lake Isle of Innisfree, A Tiger in the Park', 'The Duck and the Kangaroo'], kw: ['lake isle', 'gardener', 'road not taken'] },
          { t: 'Hornbill: Prose', pts: ['The Fun They Had, The Sound of Music, The Little Girl, A Truly Beautiful Mind', 'The Snake Trying, My Childhood, Reach for the Top, Katherine', 'If I Were You'], kw: ['hornbill', 'prose', 'supplement'] },
          { t: 'Hornbill: Poetry', pts: ['The Fun They Had, The Sound of Music, The Little Girl', 'A Truly Beautiful Mind, The Snake Trying, My Childhood', 'Reach for the Top, Katherine, If I Were You'], kw: ['hornbill', 'poem', 'kavita'] },
          { t: 'Snapshots: Prose', pts: ['The Fun They Had, The Sound of Music, The Little Girl', 'A Truly Beautiful Mind, The Snake Trying, My Childhood', 'Reach for the Top, Katherine, If I Were You'], kw: ['snapshots', 'prose'] },
          { t: 'Moments Supplementary Reader', pts: ['The Lost Child, The Adventures of Toto, Iswaran the Storyteller', 'In the Kingdom of Fools, The Happy Prince, Weathering the Storm in Ersama', 'The Selfish Giant, The Tuft of Flowers'], kw: ['moments', 'toto', 'selfish giant'] },
          { t: 'Moments: Prose', pts: ['The Lost Child, The Adventures of Toto, Iswaran the Storyteller', 'In the Kingdom of Fools, The Happy Prince, Weathering the Storm in Ersama', 'The Selfish Giant, The Tuft of Flowers'], kw: ['moments', 'prose'] },
          { t: 'Beehive: Prose and Poetry', pts: ['The Fun They Had, Iswaran the Storyteller and Little Tiger', 'My Childhood, Reach for the Top, Katherine, If I Were You', 'The Bee Eaters, The Tale of Custard the Dragon'], kw: ['beehive', 'honeycomb', 'prose'] },
          { t: 'Grammar and Writing', pts: ['Tenses, Active-Passive, Reported Speech, Determiners', 'Modals, Articles, Prepositions, Conjunctions', 'Sentence transformation, paragraph and letter writing'], kw: ['grammar', 'tense', 'voice', 'narration', 'writing'] }
        ]
      }
    }
  }
};
