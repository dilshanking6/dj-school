// Class 11 (JAC / NCERT aligned) - chapter list + revision notes.

module.exports = {
  11: {
    label: 'कक्षा 11',
    labelEn: 'Class 11',
    board: 'JAC / NCERT',
    subjects: {
      maths: {
        name: 'गणित',
        nameEn: 'Mathematics',
        emoji: '🔢',
        color: '#f8b500',
        desc: 'Sets से 3D Geometry तक, 14 अध्याय',
        chapters: [
          { t: 'समुच्चय (Sets)', pts: ['समुच्चय, उपसमुच्चय, रिक्त समुच्चय', 'समुच्चयों का संघ, अंतर और प्रतिच्छेद', 'वेन आरेख द्वारा प्रदर्शन'], kw: ['set', 'venn', 'subset', 'union'] },
          { t: 'संबंध एवं फलन (Relations and Functions)', pts: ['संबंध के प्रकार: रिक्त, सार्व, एकतर और बहुतर', 'फलन, परिमाण क्षेत्र और परास', 'मानचित्रण और आरोही/अवरोही फलन'], kw: ['relation', 'function', 'domain', 'range', 'mapping'] },
          { t: 'द्विघात समीकरण (Quadratic Equations)', pts: ['मूलों का योग और गुणनफल', 'मूलों की प्रकृति (वास्तविक, समान, काल्पनिक)', 'द्विघात असमानताएँ'], kw: ['quadratic', 'discriminant', 'roots', 'd is zero'] },
          { t: 'द्विघात असमानताएँ (Quadratic Inequalities)', pts: ['द्विघात व्यंजक के चिन्ह', 'समीकरण और असमानता का हल', 'कालिक रूप (sign scheme)'], kw: ['quadratic inequality', 'sign', 'interval'] },
          { t: 'समांतर श्रेढ़ी (Sequences and Series)', pts: ['AP, GP और HP', 'अंतिम पद और समापुति योग', 'मध्यम पद और विकर्ण संबंध'], kw: ['ap', 'gp', 'series', 'sum', 'arithmetic progression'] },
          { t: 'द्विविमीय ज्यामिति (Binomial Theorem)', pts: ['(x + y)^n का प्रसार', 'व्यापक पद, मध्य पद, अंतिम पद', 'द्विपद गुणनखंड'], kw: ['binomial', 'expansion', 'coefficient'] },
          { t: 'त्रिकोणमित फलन (Trigonometric Functions)', pts: ['त्रिकोणमित अनुपात और सर्वसमिकाएँ', 'त्रिकोणमित फलनों के मान और आवर्तकता', 'त्रिकोणमित समीकरणों का हल'], kw: ['trigonometry', 'sin', 'cos', 'tan', 'identity', 'trigonometric'] },
          { t: 'त्रिविमीय ज्यामिति (Three Dimensional Geometry)', pts: ['दिकSPACE निर्देशांक: बिंदु, दूरी, सेक्शन सूत्र', 'दो बिंदुओं और बिंदु-रेखा की दूरी', 'विमीय त्रिभुज का क्षेत्रफल'], kw: ['3d', 'distance formula', 'direction', 'section'] },
          { t: 'सरल रेखाएँ (Straight Lines)', pts: ['रेखा का ढाल रूप और सामान्य रूप', 'दो रेखाओं के बीच कोण', 'रेखा से बिंदु की दूरी'], kw: ['line', 'slope', 'parallel', 'perpendicular'] },
          { t: 'शंकु परिच्छेदिका (Conic Sections)', pts: ['वृत्त, परवलय, द्विपरक, अवलम्ब, परितल', 'शंकु का मानक समीकरण', 'ज्यामिति की उपयोगिता'], kw: ['conic', 'circle', 'parabola', 'ellipse', 'hyperbola'] },
          { t: 'परिवर्तन (Limits)', pts: ['बायें और दायें सीमा', 'मानक सीमाएँ', 'सन्निकटन और निरंतरता'], kw: ['limit', 'lhopital', 'continuity'] },
          { t: 'अवकलन (Derivatives)', pts: ['प्राचल से अवकलज', 'उच्चतर अवकलज', 'अवकलज के अनुप्रयोग: मानक, श्रृंखला नियम'], kw: ['derivative', 'differentiate', 'chain rule', 'tangent'] },
          { t: 'समांतर श्रेढ़ी एवं प्रायिकता (Statistics and Probability)', pts: ['समांतर श्रेढ़ी का माध्य, माध्यक, बहुलक', 'प्रतिदर्श समुच्चय', 'प्रायिकता के गुण और योगफल नियम'], kw: ['statistics', 'mean', 'median', 'mode', 'variance', 'probability', 'dice'] }
        ]
      },
      physics: {
        name: 'भौतिक विज्ञान',
        nameEn: 'Physics',
        emoji: '⚙️',
        color: '#845ef7',
        desc: 'मापन से दोलन तक, 14 अध्याय',
        chapters: [
          { t: 'मात्रक एवं मापन (Units and Measurements)', pts: ['SI आधार मात्रक और व्युत्पन्न मात्रक', 'विभिन्नता और मापन में त्रुटि', 'सार्थक अंक'], kw: ['unit', 'measurement', 'error', 'dimensional'] },
          { t: 'सरल रेखीय गति (Motion in a Straight Line)', pts: ['स्थिति-समय ग्राफ', 'समान त्वरण और गति के समीकरण', 'आलेखीय विधि से गति'], kw: ['motion', 'straight line', 'velocity', 'acceleration', 'kinematics'] },
          { t: 'समतल में गति (Motion in a Plane)', pts: ['सापेक्ष गति', 'परियोजन त्वरण', 'वृत्तीय गति और कोणीय चाल'], kw: ['projectile', 'relative motion', 'circular', 'angular'] },
          { t: 'गति के नियम (Laws of Motion)', pts: ['संवेग सुरक्षण', 'आवेग', 'न्यूटन का गति नियम और न्यूटन का अभिकेन्द्रीय बल'], kw: ['newton', 'momentum', 'impulse', 'friction', 'circular motion'] },
          { t: 'कार्य, ऊर्जा एवं शक्ति (Work, Energy and Power)', pts: ['कार्य-ऊर्जा प्रमेय', 'ऊर्जा संरक्षण', 'आवेग-ऊर्जा प्रमेय', 'शक्ति P = W/t'], kw: ['work', 'energy', 'power', 'conservation', 'friction'] },
          { t: 'कणिका तंत्र एवं घूर्णन गति (Rotational Motion)', pts: ['जड़त्व आघूर्ण और आवेग आघूर्ण', 'कोणीय संवेग संरक्षण', 'घूर्णन गतिज ऊर्जा'], kw: ['rotation', 'torque', 'moment of inertia', 'angular momentum', 'rolling'] },
          { t: 'गुरुत्वाकर्षण (Gravitation)', pts: ['केप्लर के नियम', 'न्यूटन का गुरुत्वीय नियम', 'ग्रहों और उपग्रहों की गति'], kw: ['gravitation', 'kepler', 'escape velocity', 'satellite', 'orbit'] },
          { t: 'ठोस के यांत्रिक गुण (Mechanical Properties of Solids)', pts: ['हुक का नियम', 'यंग प्रत्यास्थता गुणांक', 'आयातन लोच और तरलता'], kw: ['elastic', 'hooke', 'young', 'modulus', 'stress'] },
          { t: 'द्रव के यांत्रिक गुण (Mechanical Properties of Fluids)', pts: ['दाब, घनत्व और ऊर्ष्मा', 'आर्किमीडीज का सिद्धांत', 'पृष्ठ तनाव और केशिका क्रिया'], kw: ['fluid', 'pressure', 'buoyancy', 'archimedes', 'surface tension', 'bernoulli'] },
          { t: 'ऊष्मा के धर्मिक गुण (Thermal Properties of Matter)', pts: ['ऊष्मा संतुलन और ऊष्मा धारणा क्षमता', 'ऊष्मा संचार: चालन, संवहन, विकिरण', 'आदर्श गैस का समीकरण'], kw: ['heat', 'temperature', 'conduction', 'convection', 'radiation', 'specific heat'] },
          { t: 'ऊष्मागतिकी (Thermodynamics)', pts: ['आंतरिक ऊर्जा और एन्थैल्पी', 'प्रथम और द्वितीय नियम', 'ऊष्मा इंजन की कार्यक्षमता'], kw: ['thermodynamics', 'entropy', 'heat engine', 'isentropic'] },
          { t: 'आणविक सिद्धांत (Kinetic Theory of Gases)', pts: ['गैस के अणुओं का गति सिद्धांत', 'आयतन, दाब और ऊष्मा का संबंध', 'डिग्री स्वतंत्रता'], kw: ['kinetic theory', 'gas', 'rms', 'degrees of freedom'] },
          { t: 'दोलन (Oscillations)', pts: ['सरल घूर्णी और सरल आवर्त गति', 'आवर्तकाल और आवृत्ति', 'सरल घूर्णी का आवर्तकाल T = 2π√(l/g)'], kw: ['oscillation', 'shm', 'pendulum', 'spring', 'period'] },
          { t: 'तरंगें (Waves)', pts: ['यंग और युवा द्विपथ प्रयोग', 'तरंग की चाल और आवृत्ति', 'ध्वनि तरंगें और डॉप्लर प्रभाव'], kw: ['wave', 'double slit', 'young', 'wavelength', 'doppler', 'sound'] }
        ]
      },
      chemistry: {
        name: 'रसायन विज्ञान',
        nameEn: 'Chemistry',
        emoji: '🧪',
        color: '#20c997',
        desc: 'आधारभूत सिद्धांत से कार्बन यौगिक तक',
        chapters: [
          { t: 'रसायन की मूल अवधारणाएँ (Some Basic Concepts of Chemistry)', pts: ['मोल की अवधारणा, मोलर द्रव्यमान, गैस के नियम', 'आयतन, दाब, तापमान और सांद्रता', 'आपूर्णिक तथा परावर्तन अभिक्रिया'], kw: ['mole', 'stoichiometry', 'molarity', 'avogadro', 'gas law', 'limiting'] },
          { t: 'परमाणु की संरचना (Structure of Atom)', pts: ['बोहर मॉडल, क्वांटीकरण', 'हाइड्रोजन स्पेक्ट्रम', 'आधुनिक सिद्धांत और आकृति'], kw: ['atom', 'bohr', 'orbital', 'quantum number', 'hund', 'aufbau', 'spectrum'] },
          { t: 'तत्वों का वर्गीकरण (Classification of Elements and Periodicity)', pts: ['आधुनिक आवर्त सिद्धांत', 's, p, d, f ब्लॉक', 'आवर्तता और समूह के गुण'], kw: ['periodic', 'period', 'group', 's block', 'p block', 'valence'] },
          { t: 'रासायनिक बंधन (Chemical Bonding and Molecular Structure)', pts: ['सहसंयोजी, आयनिक और धात्विक बंधन', 'संकरण, VSEPR, आकृति', 'संयोजी तथा आयनिक क्रिया'], kw: ['bond', 'ionic', 'covalent', 'vsepr', 'hybridisation', 'sigma', 'pi', 'shape'] },
          { t: 'ऊष्मागतिकी (Thermodynamics)', pts: ['आंतरिक ऊर्जा, एन्थैल्पी, एन्ट्रॉपी', 'Hess नियम और गिब्स मुक्त ऊर्जा', 'साम्य और साम्य स्थिरांक'], kw: ['thermodynamics', 'enthalpy', 'entropy', 'gibbs', 'hess'] },
          { t: 'साम्य (Equilibrium)', pts: ['उत्पाद और अभिकारक का गुणक', 'अम्ल क्षारक आयनीकरण K', 'Le Chatelier सिद्धांत'], kw: ['equilibrium', 'le chatelier', 'ionisation', 'buffer', 'ph'] },
          { t: 'ऑक्सीजनीकरण अपचयन अभिक्रियाएँ (Redox Reactions)', pts: ['ऑक्सीकरण और अपचयन', 'ऑक्सीकरण संख्या', 'ईंधन और धातुओं का संक्षारण'], kw: ['redox', 'oxidation', 'oxidation number', 'corrosion'] },
          { t: 'हाइड्रोजन (Hydrogen)', pts: ['स्थिति, प्राप्ति और जलने से गुण', 'औद्योगिक उपयोग', 'भारी और हल्का हाइड्रोजन', 'जल: दोहरा बंध, विलयन'], kw: ['hydrogen', 'water', 'isotope', 'fuel', 'd2o'] },
          { t: 's-ब्लॉक तत्व (s-Block Elements)', pts: ['उपयोग, निर्माण और अभिक्रियाशीलता', 'आयनिक यौगिकों में अभिकारकता', 'आवर्त ऊर्जा और जलन अभिक्रियाएँ'], kw: ['s block', 'alkali', 'alkaline earth', 'sodium', 'alkalinity'] },
          { t: 'p-ब्लॉक तत्व - 11 वें वर्ग के तत्व (p-Block Elements Group 13 & 14)', pts: ['उपभोक्ता महत्व, दाँत और हड्डियाँ', 'SiO2, रेत, सिलिकेट', 'csCl4, freon, CFC, अतिचालक'], kw: ['p block', 'boron', 'silicon', 'silicate', 'cfc', 'semiconductor'] },
          { t: 'कार्बनिक यौगिकों की आधारभूत संरचना (Organic Chemistry - Basic Principles)', pts: ['संयोजकता, समन्वय और उपसंयोजन', 'सहसंयोजी बंध: एकल, द्विल, त्रिल, चतुः', 'Isomerism', 'आबंध सम्बन्धी घटनाएँ'], kw: ['organic', 'covalent bond', 'isomerism', 'hybridisation', 'sigma', 'functional group'] },
          { t: 'हाइड्रोकार्बन (Hydrocarbons)', pts: ['एल्केन, एल्कीन, एल्काडाइन संरचना और अभिक्रियाएँ', 'ऐरोमैटिक यौगिक और बेंजीन', 'हाइड्रोकार्बन के उपयोग'], kw: ['hydrocarbon', 'alkane', 'alkene', 'alkyne', 'aromatic', 'benzene'] },
          { t: 'पर्यावरणीय रसायन (Environmental Chemistry)', pts: ['जल प्रदूषण, ओजोन अवक्षय', 'वर्षा जल अम्लीकरण', 'ग्रीनहाउस गैसें'], kw: ['environment', 'ozone', 'acid rain', 'greenhouse', 'biodegradable'] }
        ]
      },
      biology: {
        name: 'जीव विज्ञान',
        nameEn: 'Biology',
        emoji: '🧬',
        color: '#51cf66',
        desc: 'कोशिका से मानव शरीर तक, 19 अध्याय',
        chapters: [
          { t: 'जीवन की इकाई: कोशिका (The Cell)', pts: ['कोशिका सिद्धांत और कोशिकांग', 'प्रोकैरियोटिक और यूकैरियोटिक कोशिका', 'कोशिका झिल्ली, प्लाज्मा झिल्ली, एंडोप्लाज्मिक रेटिकुलम'], kw: ['cell', 'organelle', 'mitochondria', 'prokaryote', 'eukaryote', 'membrane'] },
          { t: 'जीवों का वर्गीकरण (Biological Classification)', pts: ['पाँचkingdom वर्गीकरण', 'मोनेरा, प्रोटिस्टा, फंजाई, प्लांटी, एनिमेलिया', 'वायरस और वायरॉइड'], kw: ['classification', 'kingdom', 'monera', 'fungi', 'virus'] },
          { t: 'पादप जगत (Plant Kingdom)', pts: ['उपजगत: शैवाल, ब्रायोफाइट्स, प्टेरिडोफाइट्स', 'जिम्नोस्पर्म और एंजियोस्पर्म', 'जीवाश्म, पुष्प और बीज'], kw: ['plant kingdom', 'algae', 'bryophyta', 'pteridophyta', 'gymnosperm', 'angiosperm'] },
          { t: 'प्राणी जगत (Animal Kingdom)', pts: ['पोरीफेरा से कॉर्डेटा तक वर्गीकरण', 'अकशेरुकी, पृष्ठक, मत्स्य, उभयचर, सरीसृप, पक्षी, स्तनधारी'], kw: ['animal kingdom', 'chordata', 'vertebrate', 'porifera', 'arthropoda'] },
          { t: 'पुष्पी पादपों की आकृति विज्ञान (Morphology of Flowering Plants)', pts: ['जड़, तना, पत्ती, पुष्प, फल, बीज', 'आभासी जड़ (प्रकंद, गांठदार), आभासी तना, पर्णाभ', 'पुष्प की संरचना: वर्तिकाग्र, स्तंभ, पंखुड़ी, तुंग'], kw: ['morphology', 'root', 'stem', 'leaf', 'flower', 'fruit', 'seed', 'inflorescence'] },
          { t: 'पुष्पी पादपों की शरीक्रिया विज्ञान (Anatomy of Flowering Plants)', pts: ['कोशिका संरचना: परिधीय, प्रमुभ, कलिका ऊतक', 'मूल और तना की संरचना', 'पत्ती, पुष्प, बीज और फल की संरचना', 'द्विबीजपत्री और एकबीजपत्री'], kw: ['anatomy', 'tissue', 'epidermis', 'xylem', 'phloem', 'dicot', 'monocot'] },
          { t: 'प्राणियों में संरचनात्मक संगठन (Structural Organisation in Animals)', pts: ['स्तर और अंग: उपकला, योजक, पेशी, तंत्रिका', 'श्वसन वाहिनी और परिसंचरण तंत्र', 'अंतःस्रावी ग्रंथि, कंकाल'], kw: ['tissue', 'epithelial', 'connective', 'muscle', 'circulatory', 'endocrine'] },
          { t: 'कोशिका चक्र और कोशिका विभाजन (Cell Cycle and Cell Division)', pts: ['कोशिका चक्र: G1, S, G2, M', 'माइटोसिस: समसूत्री विभाजन', 'मियोसिस: अर्धसूत्री विभाजन और क्रॉसिंग ओवर'], kw: ['cell cycle', 'mitosis', 'meiosis', 'chromosome', 'dna', 'crossing over'] },
          { t: 'पादपों में वहन (Transport in Plants)', pts: ['वाहक ऊतक: जाइलम, फ्लोएम', 'जल का सक्रिय वहन', 'स्राव दबाव सिद्धांत और परासरण'], kw: ['transport', 'xylem', 'phloem', 'osmosis', 'transpiration', 'translocation'] },
          { t: 'खनिज पोषण (Mineral Nutrition)', pts: ['पादपों की आवश्यकता में खनिज', 'नाइट्रोजन, फॉस्फोरस, पोटैशियम, कैल्शियम', 'खनिज अवशोषण और उपयोगिता'], kw: ['mineral', 'nutrient', 'nitrogen', 'deficiency', 'hydroponics'] },
          { t: 'प्रकाश संश्लेषण (Photosynthesis)', pts: ['प्रकाशीय और रसायनिक अभिक्रियाएँ', 'कैल्विन चक्र और C4 पौधे', 'दर और उत्पादकता सीमित करने वाले कारक'], kw: ['photosynthesis', 'chloroplast', 'calvin', 'c4', 'limiting factor'] },
          { t: 'कोशिकीय श्वसन (Respiration in Plants)', pts: ['ग्लाइकोलिसिस, क्रेब्स चक्र, इलेक्ट्रॉन वाहक तंत्र', 'ऑक्सीजनयुक्त और अवायवीय श्वसन', 'उपास्थयों में RQ'], kw: ['respiration', 'glycolysis', 'krebs', 'fermentation', 'atp'] },
          { t: 'पादप वृद्धि एवं विकास (Plant Growth and Development)', pts: ['वृद्धि में कारक: ऑक्सिन, जिबरेलिन, साइटोकाइनिन', 'प्रकाशसंवेदन, प्रतिक्षिप्तन, परागकोशीकरण', 'गिरने (senescence) और परिपक्वन'], kw: ['growth', 'hormone', 'auxin', 'gibberellin', 'photoperiodism', 'vernalisation'] },
          { t: 'पाचन और आवशोषण (Digestion and Absorption)', pts: ['मुख गुहा, अग्न्याशय और यकृत', 'पाचन एंजाइम और उनके कार्य', 'पोषक तत्वों का अवशोषण'], kw: ['digestion', 'enzyme', 'pancreas', 'absorption', 'small intestine'] },
          { t: 'श्वसन (Breathing and Exchange of Gases)', pts: ['श्वसन केंद्र और इसकी तंत्रिका नियंत्रण', 'फुफ्फुसीय और ऊतकीय श्वसन', 'O2 और CO2 का परिवहन'], kw: ['breathing', 'respiratory', 'lung', 'diaphragm', 'haemoglobin'] },
          { t: 'शरीर द्रव और परिसंचरण (Body Fluids and Circulation)', pts: ['रक्त, प्लाज्मा, लिम्फ, अंतरद्रव', 'मानव हृदय संरचना और हृदय चक्र', 'रक्त समूह, जमावट, रोग और प्रतिरक्षा'], kw: ['blood', 'plasma', 'heart', 'blood group', 'coagulation', 'immunity'] },
          { t: 'उत्सर्जन (Excretory Products and their Elimination)', pts: ['मूत्र का निर्माण और छानना', 'नेफ्रॉन और वृक्क की संरचना', 'मूत्र अवरोधक तंत्र'], kw: ['excretion', 'kidney', 'nephron', 'urine', 'osmoregulation'] },
          { t: 'गति एवं नियंत्रण (Locomotion and Movement)', pts: ['पेशियों की संरचना और प्रकार', 'कंकाल तंत्र, व्यवस्था और संयुक्तिका', 'दौड़ना और सरपट खड़े होना'], kw: ['muscle', 'skeletal', 'joint', 'ligament', 'locomotion'] },
          { t: 'तंत्रिका नियंत्रण (Neural Control and Coordination)', pts: ['तंत्रिका कोशिका और न्यूरॉन संचारण', 'प्रतिवर्ती चाप और तंत्रिका मार्ग', 'मस्तिष्क, मेरुरज्जु और संवेदन'], kw: ['neuron', 'synapse', 'reflex', 'brain', 'spinal cord', 'nervous'] },
          { t: 'रासायनिक समन्वय (Chemical Coordination and Integration)', pts: ['हार्मोन और अंतःस्रावी ग्रंथि', 'मानव अंतःस्रावी तंत्र', 'अंतःस्रावी विकार'], kw: ['hormone', 'endocrine', 'pituitary', 'thyroid', 'adrenal', 'diabetes'] }
        ]
      },
      history: {
        name: 'इतिहास',
        nameEn: 'History',
        emoji: '🏛️',
        color: '#e8590c',
        desc: 'यूरोप से भारत तक आधुनिक भारत का इतिहास',
        chapters: [
          { t: 'रोज़मरानी क्रांति (The French Revolution)', pts: ['तात्रात्मिक इतिहास और निरंकुशता का अंत', 'क्रांति के सामाजिक-आर्थिक कारण', 'गणतंत्र और निरंकुशता की पुनस्थापना'], kw: ['french revolution', '1789', 'republic', 'napoleon'] },
          { t: 'औद्योगिक क्रांति (Industrial Revolution in England)', pts: ['18वीं शताब्दी का ब्रिटेन', 'आधुनिक विज्ञान, भाप इंजन, कपास मिल', 'औद्योगिकीकरण के सामाजिक प्रभाव'], kw: ['industrial revolution', 'steam engine', 'factory', 'britain'] },
          { t: 'विद्रोह और युद्ध के युग (Changing Cultural Traditions)', pts: ['यूरोप में धार्मिक सुधार और विज्ञान', 'आधुनिक यूरोपी साहित्य और कला', 'उपनिवेशवादी दुनिया में सांस्कृतिक परिवर्तन'], kw: ['renaissance', 'reformation', 'enlightenment', 'culture'] },
          { t: 'ओज़ाइमक पराजय (The Coming of the Mongols)', pts: ['मंगोल साम्राज्य का उदय', 'चंगीज खान और मंगोल युद्धकौशल', 'फिलिस्तीन, रूस पर प्रभाव'], kw: ['mongol', 'chingiz khan', 'ilkhanat'] },
          { t: 'साम्राज्यवाद और विज्ञान (The Mughal Empire)', pts: ['मुगल साम्राज्य की स्थापना और प्रशासन', 'अकबर की धार्मिक नीति', 'शासन, व्यापार और कला'], kw: ['mughal', 'akbar', 'aurangzeb', 'empire'] },
          { t: 'बोर्डों के विरुद्ध विद्रोह और तीस्र वर्ग (Peasants and Tribes)', pts: ['प्लांटेशन, ज़मींदारी और नील क्रांति', 'बोर्ड विद्रोह और आदिवासी जनजाति आंदोलन', 'साम्राज्यवादी दौर'], kw: ['revolt', 'peasant', 'tribe', 'plantation', '1857'] },
          { t: 'ब्रिटेन में औद्योगिक क्रांति और भारत में आर्थिक परिवर्तन (From the Barter to the Money Economy)', pts: ['भारत में मुद्रा अर्थव्यवस्था का विकास', 'पूँजीपति वर्ग का उदय', 'आंतरिक और बाह्य व्यापार'], kw: ['money economy', 'mercantilism', 'capitalism', 'trade'] },
          { t: 'औपनिवेशिक शासन और साँस्कृतिक सर्वनिर्माण (Colonialism and the City)', pts: ['बंबई और कलकत्ता में बस्तियाँ', 'औपनिवेशिक शहरीकरण', 'साहित्य, शिक्षा और मुद्रणालय'], kw: ['colonialism', 'city', 'mumbai', 'calcutta', 'print'] },
          { t: 'ब्रिटिश भारत में राष्ट्रवाद का उदय (Peasants, Zamindars and the State)', pts: ['1857 के बाद नीतियाँ', 'किसान आंदोलन और ज़मींदारी अभियान', 'राष्ट्रीय आंदोलनों का विकास'], kw: ['nationalism', 'farmer', 'zamindar', 'anti colonial'] },
          { t: 'गाँधी और राष्ट्रवाद (Gandhi and the Nationalist Movement)', pts: ['राष्ट्रीय आंदोलन के उद्भव और विकास', 'महात्मा गांधी की भूमिका', 'चल आंदोलन, असहयोग आंदोलन और नमक सत्याग्रह'], kw: ['gandhi', 'national movement', 'non violence', 'salt march', 'civil disobedience'] },
          { t: 'भारतीय राष्ट्रीय कांग्रेस और आज़ाद संघर्ष (The First Phase of the National Movement)', pts: ['कांग्रेस का गठन और मॉडी मंत्रिपाल', 'सुहराव युद्ध और गांधी का गांधी-इरविन समझौता', 'सविनय अवज्ञा आंदोलन'], kw: ['inc', 'satyagraha', 'non cooperation', 'khilafat'] },
          { t: 'भारत छोड़ो आंदोलन (The Sense of Collective Belonging)', pts: ['द्वितीय विश्व युद्ध और भारत में इसके प्रभाव', 'भारत छोड़ो आंदोलन, क्रिप्स प्रस्ताव', 'सांप्रदायिक राजनीति और विभाजन'], kw: ['quit india', '1942', 'crripps', 'partition', '1947'] }
        ]
      },
      geography: {
        name: 'भूगोल',
        nameEn: 'Geography',
        emoji: '🌏',
        color: '#1098ad',
        desc: 'भारत की प्राकृतिक और मानवीय स्थिति',
        chapters: [
          { t: 'भूगोल एक विज्ञान है (Geography as a Discipline)', pts: ['भूगोल की शाखाएँ: प्राकृतिक, सांस्कृतिक, आर्थिक', 'भौतिक पर्यावरण और मानव-पर्यावरण संबंध', 'स्थानिकता और क्षेत्रीय संबंध'], kw: ['geography', 'discipline', 'location', 'environment'] },
          { t: 'मानव भूगोल की प्रकृति (The Origin and Evolution of the Earth)', pts: ['पृथ्वी की उत्पत्ति और विकास', 'भूतल के विकास का इतिहास', 'भू-संदर्भ स्थानिकता'], kw: ['earth', 'origin', 'geological', 'plate', 'era'] },
          { t: 'भू-आकृति (Interior of the Earth)', pts: ['भूपर्पटी, मैंटल, क्रोड और अंतःकेंद्रक', 'भूकंप और ज्वालामुखी', 'भूतल पर भू-आकृति'], kw: ['earth interior', 'crust', 'mantle', 'earthquake', 'volcano'] },
          { t: 'पृथ्वी के वायुमंडलीय संचरण (Composition of Atmosphere)', pts: ['वायुमंडल की संरचना: N2, O2, Ar, CO2', 'मौसम, जलवायु और ओज़ोन परत', 'वायुमंडलीय दाब और तापमान'], kw: ['atmosphere', 'weather', 'climate', 'ozone', 'temperature'] },
          { t: 'वायुमंडल में जल (Water in the Atmosphere)', pts: ['आर्द्रता, वाष्पीकरण, सांद्रता', 'वर्षा, बादल और वर्षा के प्रकार', 'कृत्रिम वर्षा और जल संरक्षण'], kw: ['water', 'humidity', 'evaporation', 'rainfall', 'precipitation'] },
          { t: 'वायुमंडलीय परिसंचरण तथा वर्षा (Weathering)', pts: ['सूर्य ऊर्जा, दाब तंत्र और धाराएँ', 'चक्रवात फंसन और एल-नीनो', 'अपक्षय और अवक्षय'], kw: ['atmospheric circulation', 'jet stream', 'cyclone', 'el nino', 'weathering'] },
          { t: 'जलवायु (Climate)', pts: ['जलवायु का क्षेत्रीकरण, मॉनसून, कटिबंध', 'शीतोष्ण और उष्णकटिबंधीय जलवायु', 'जलवायु परिवर्तन और प्रभाव'], kw: ['climate', 'monsoon', 'tropical', 'temperate', 'greenhouse'] },
          { t: 'जीवाश्म और जैव विविधता (Life in the Tropical Forests)', pts: ['विषम जलवायु के क्षेत्रों में जैव विविधता', 'उष्णकटिबंधीय वर्षावन और मानव प्रभाव', 'जीवाश्म और भूतपूर्व जीवन'], kw: ['biosphere', 'tropical forest', 'biodiversity', 'species'] },
          { t: 'मानव भूगोल - जनांकिका (Population: Distribution, Density, Growth)', pts: ['भारत में जनसंख्या वितरण', 'जनसंख्या वृद्धि, जन्म-मृत्यु, प्रवास', 'जनांकिकीय संक्रमण सिद्धांत'], kw: ['population', 'density', 'demographic', 'migration', 'fertility'] },
          { t: 'मानव भूगोल - मानव क्रियाएँ (Human Development)', pts: ['साक्षरता, साक्षरता दर और साक्ष्यता', 'व्यवसायिक संरचना और तीव्रता', 'ग्रामीण और शहरी मानव संसाधन'], kw: ['literacy', 'human development', 'employment', 'rural', 'urban'] },
          { t: 'भारत का मानव-जनसंख्या वितरण (Population Distribution and Migration)', pts: ['आवास, जनसंख्या घनत्व और वितरण', 'नगरीकरण और शहरीकरण', 'अप्रवास और प्रवास के प्रकार'], kw: ['migration', 'urbanisation', 'density', 'distribution'] }
        ]
      },
      civics: {
        name: 'राजनीति विज्ञान',
        nameEn: 'Civics',
        emoji: '⚖️',
        color: '#7048e8',
        desc: 'संविधान निर्माता, नागरिकता और लोकतंत्र',
        chapters: [
          { t: 'संविधान: भारत का नौका-निर्माता (The Indian Constitution)', pts: ['संविधान सभा निर्माण', 'विधान भाषा, संरचना और प्रस्तावना', 'भारतीय संविधान की विशेषताएँ'], kw: ['constitution', 'assembly', 'drafting', 'preamble', 'making'] },
          { t: 'भारत का नागरिक (Rights and Duties of the Citizen)', pts: ['नागरिकता, मूल कर्तव्य और नीति-निदेशक तत्व', 'नागरिकता अधिकार और मौलिक अधिकार', 'कानून और न्यायिक समीक्षा'], kw: ['citizenship', 'fundamental duties', 'directive', 'rights'] },
          { t: 'राजव्यवस्था (The Executive)', pts: ['राष्ट्रपति, प्रधानमंत्री और मंत्रिपरिषद', 'राज्यपाल, मुख्यमंत्री और सरकार', 'नौकरशाही और विकेंद्रीकरण'], kw: ['president', 'prime minister', 'council', 'governor', 'executive'] },
          { t: 'विधायिका (The Legislature)', pts: ['संसद: लोकसभा और राज्यसभा', 'विधायिका के कार्य और विशेषाधिकार', 'विधि बनाने की प्रक्रिया'], kw: ['parliament', 'lok sabha', 'rajya sabha', 'legislature', 'bill'] },
          { t: 'न्यायपालिका (The Judiciary)', pts: ['सर्वोच्च न्यायालय, उच्च न्यायालय और जिला न्यायालय', 'न्यायिका की स्वतंत्रता और सहायकता', 'न्यायिका की सक्रिय भूमिका'], kw: ['supreme court', 'judiciary', 'high court', 'judicial'] },
          { t: 'विधि, न्याय और नागरिक (Law, Justice and Citizens)', pts: ['विवाह, तलाक, संपत्ति और विरासत', 'महिला और बाल अधिकार', 'आपातकाल और मौलिक अधिकारों पर रोक'], kw: ['law', 'marriage', 'divorce', 'women rights', 'emergency'] },
          { t: 'संविधान और समाज (Constitutional Design and Politics)', pts: ['संघीय ढाँचा, सत्ता और नागरिकता', 'नीति और गठबंधन, अधिकार और उद्देश्य', 'सरकार की वैधता और चुनाव'], kw: ['federalism', 'coalition', 'politics', 'validity'] }
        ]
      },
      economics: {
        name: 'अर्थशास्त्र',
        nameEn: 'Economics',
        emoji: '📈',
        color: '#ae3ec9',
        desc: 'विकास, उत्पादन, बाज़ार और भारतीय अर्थव्यवस्था',
        chapters: [
          { t: 'अर्थव्यवस्था का परिचय (Introduction to Economics)', pts: ['उत्पादन, उपभोग और वितरण', 'विकल्प का अर्थमितीय सिद्धांत', 'व्यवहारिक और सकारात्मक अर्थशास्त्र'], kw: ['economics', 'scarcity', 'choice', 'opportunity cost'] },
          { t: 'उत्पादन में वृद्धि (Production for Growth)', pts: ['तकनीक, पूँजी और उत्पादन फलन', 'उत्पादन की गुणांक', 'वृद्धि और विकास'], kw: ['production', 'growth', 'technology', 'factor'] },
          { t: 'मांग और पूर्ति (Demand and Supply)', pts: ['मांग की नियम और मांग वक्र', 'पूर्ति और स्थिरता', 'मूल्य निर्धारण और लोच'], kw: ['demand', 'supply', 'equilibrium', 'elasticity'] },
          { t: 'बाजार की व्यवस्था और कीमत निर्धारण (Market Equilibrium)', pts: ['आपूर्ति-मांग संतुलन', 'अतिरिक्त और कमी', 'कीमत का संतुलन में भूमिका'], kw: ['market', 'equilibrium price', 'surplus', 'shortage'] },
          { t: 'राज्य और बाजार (The Government and the Market)', pts: ['सार्वजनिक वस्तु और बाह्यताएँ', 'सरकारी कर और उपयोग', 'भारत में उदारीकरण और निजीकरण'], kw: ['government', 'public goods', 'tax', 'liberalisation', 'subsidy'] },
          { t: 'राष्ट्रीय आय और संवृद्धि (National Income and Economic Growth)', pts: ['जीडीपी, एनडीपी और प्रति व्यक्ति आय', 'आर्थिक वृद्धि दर', 'आर्थिक विकास के उपाय'], kw: ['gdp', 'national income', 'growth', 'per capita', 'development'] },
          { t: 'मुद्रास्फीति और बेरोज़गारी (Inflation and Money)', pts: ['मुद्रास्फीति: कारण और प्रभाव', 'मुद्रा आपूर्ति और बैंकिंग', 'रिज़र्व बैंक और मौद्रिक नीति'], kw: ['inflation', 'money', 'bank', 'rbi', 'monetary'] },
          { t: 'भारत और आर्थिक सुधार (India and the Development Experience)', pts: ['1947 के बाद के विकास प्रयास', 'हरित क्रांति, श्वेत क्रांति और उदारीकरण', 'सतत विकास और गरीबी उन्मूलन'], kw: ['india', 'development', 'green revolution', 'liberalisation', 'poverty'] }
        ]
      },
      hindi: {
        name: 'हिन्दी',
        nameEn: 'Hindi',
        emoji: '📕',
        color: '#ff6b6b',
        desc: 'क्षितिज भाग-2, स्पर्श भाग-2, व्याकरण',
        chapters: [
          { t: 'क्षितिज भाग-2: काव्य खंड', pts: ['आत्मकथा, हमारे पुराने दिन, सुमित्रा, नदी, शफीक, कल्पकली, धूप के अतिरिक्त पाठ', 'ग्राम सीताएँ, ये पत्ते, कहानी, कला और युद्ध', 'निराला, सुमित्रानंदन पंत, महादेवी वर्मा का काव्य'], kw: ['kshitij bhag 2', 'kavya khand', 'nari', 'poem'] },
          { t: 'क्षितिज भाग-2: गद्य खंड', pts: ['कल्लू कुम्हार की उनाकोटी, मेरा छोटा सा निजी पुस्तकालय', 'श्रम विभाजन और जाति प्रथा, गाँव के दिन, चार पैरों वाला जानवर', 'मेरा बचपन, कर्म और कर्मफल, चेतना और जड़ता'], kw: ['kshitij gadya', 'unakoti', 'library', 'shram'] },
          { t: 'स्पर्श भाग-2', pts: ['गिलहरी, स्मृति, जित-जित मैं ने देखा-पुस्तक मुझे दीदा-आवरण, माँ का हाथ, शिव-पार्वती', 'दूधवाला, नाना-दादा की कहानी, बहादुर, ईमानदार', 'भरंगी मासिम, नीलकुंज, बसंत आया, कलम से, पिता की डायरी'], kw: ['sparsh bhag 2', 'gilahari', 'badal', 'paani'] },
          { t: 'व्याकरण खंड', pts: ['रचना, अर्थ और कार्य की दृष्टि से शब्द भेद', 'संधि, समास और तत्पुरुष आदि', 'उपसर्ग, प्रत्यय, वाक्य रचना'], kw: ['grammar', 'sandhi', 'samash', 'upasarg', 'vachya'] },
          { t: 'अपठित अनुच्छेद एवं रचना कौशल', pts: ['अपठित अनुच्छेद पर प्रश्न-उत्तर', 'सारांश लेखन', 'पत्र लेखन और अनुच्छेद लेखन'], kw: ['apathit', 'passage', 'summary', 'letter', 'article'] }
        ]
      },
      english: {
        name: 'English',
        nameEn: 'English',
        emoji: '📘',
        color: '#4ecdc4',
        desc: 'Hornbill, Snapshots and Moments supplementary readers',
        chapters: [
          { t: 'Hornbill: Prose', pts: ['The Portrait of a Lady, "My Childhood", Snapshots, Summaries', 'The Address, Rattrap’s Man, A Photograph, Discovering Tut: the Saga Continues', 'The Ailing Planet: the Green Movement’s Role, The Browning Version, The Adventure'], kw: ['hornbill', 'prose', 'tut', 'address', 'browning'] },
          { t: 'Hornbill: Poetry', pts: ['A Photograph, The Laburnum Top, The Voice of the Rain, Children', 'Father to Son, Mother’s Day, The Laburnum Top, The Ghat of the Only World'], kw: ['hornbill', 'poetry', 'voice of the rain', 'children'] },
          { t: 'Snapshots: Prose', pts: ['The Summer of the Beautiful White Horse, The Address, Rattrap’s Man, Albert Einstein at School', 'Mother’s Day, The Ghat of the Only World, Birth, The Tale of Melon City', 'Albert Einstein at School, Mother’s Day, The Ghat of the Only World'], kw: ['snapshots', 'prose', 'einstein'] },
          { t: 'Snapshots: Poetry', pts: ['The Town That Could Not Save Itself, I am Every Woman', 'Quality, The Squirrel, Dark, A Tiger in the Park', 'Our Runaway Kite, The Beggar, Forest, The Gardener'], kw: ['snapshots', 'poetry', 'quality', 'tiger'] },
          { t: 'Moments Supplementary Reader', pts: ['The Legend of the Northland, Silk Road, The Teacher Who Taught to Be Disobedient', 'The Power of Music, The Solution, Waltz, Trees, The King’s Speech', 'The March of the Martyrs, LeCoq Sportif, The Discovery, Bluebells'], kw: ['moments', 'supplementary', 'silk road', 'waltz'] },
          { t: 'Moments: Prose', pts: ['The First Lesson, The Funeral, The Sound of the Sea, The Last Leaf', 'The Happy Prince, The Selfish Giant, The King’s Speech, The Adventure', 'The Beggar, The Talking Book, The Open Secret'], kw: ['moments', 'prose', 'funeral', 'last leaf'] },
          { t: 'Hornbill and Snapshots: Grammar', pts: ['Tenses, Subject-Verb Concord, Active-Passive Voice, Reported Speech', 'Determiners, Modals, Articles, Prepositions, Conjunctions', 'Sentence transformation and note-making'], kw: ['grammar', 'tense', 'concord', 'voice', 'modals'] }
        ]
      }
    }
  }
};
