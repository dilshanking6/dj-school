// Class 12 (JAC / NCERT aligned) - chapter list + revision notes.

module.exports = {
  12: {
    label: 'कक्षा 12',
    labelEn: 'Class 12',
    board: 'JAC / NCERT',
    subjects: {
      maths: {
        name: 'गणित',
        nameEn: 'Mathematics',
        emoji: '🔢',
        color: '#f8b500',
        desc: 'Relations से Probability तक, 13 अध्याय',
        chapters: [
          { t: 'संबंध एवं फलन (Relations and Functions)', pts: ['संबंध के प्रकार और फलन का परिमाण क्षेत्र', 'एक-एक अलग, अन्तःछेदी और onto', 'यौगिक फलन और प्रतिच्छेदक प्रतिच्छेद'], kw: ['relation', 'function', 'injective', 'surjective', 'composite', 'inverse'] },
          { t: 'त्रिकोणमित फलन (Inverse Trigonometric Functions)', pts: ['sin⁻¹, cos⁻¹, tan⁻¹ का परिमाण क्षेत्र', 'त्रिकोणमित समीकरण', 'y = sin⁻x का परिमाण क्षेत्र'], kw: ['inverse trig', 'sin inverse', 'principal value'] },
          { t: 'आव्यूह (Matrices)', pts: ['आव्यूह के प्रकार, संक्रियाएँ', 'एकविमीय और तरव्यूहीय रूपांतरण', 'आव्यूह के अनुप्रयोग'], kw: ['matrix', 'transpose', 'trace', 'operation'] },
          { t: 'सारणिक (Determinants)', pts: ['सारणिक के गुण', 'सारणिकों का गुणन', 'Cramer नियम और आव्यूह का व्युत्क्रम'], kw: ['determinant', 'cramer', 'inverse', 'minor', 'cofactor'] },
          { t: 'सातत्य एवं विभिन्नता (Continuity and Differentiability)', pts: ['सातत्य की परिभाषा और प्रकार', 'अवकलन की परिभाषा, श्रृंखला नियम', 'अवकलज के अनुप्रयोग: संबंध, आश्रय और माध्य मान प्रमेय'], kw: ['continuity', 'differentiability', 'derivative', 'lhopital', 'rolle', 'mvt'] },
          { t: 'अवकलन के अनुप्रयोग (Application of Derivatives)', pts: ['वर्धमान और ह्रासमान फलन', 'स्थानीय और वैश्विक उच्चतम/न्यूनतम', 'वृद्धि एवं ह्रास दर, अभिलंब'], kw: ['application', 'maximum', 'minimum', 'marginal', 'tangent', 'rate'] },
          { t: 'समाकलन (Integrals)', pts: ['समाकलन की परिभाषा और प्रकार', 'प्रतिस्थापन विधि, आंशिक भिन्न', 'आधारभूत प्रमेय द्वारा निश्चित समाकलन'], kw: ['integral', 'indefinite', 'definite', 'substitution', 'by parts'] },
          { t: 'समाकलन के अनुप्रयोग (Application of Integrals)', pts: ['वक्र और x-अक्ष के बीच का क्षेत्रफल', 'a और b के बीच रैखिक सभी y=f(x) का क्षेत्रफल', 'सापेक्ष त्वरण और वेग'], kw: ['area', 'application of integral', 'between curves'] },
          { t: 'अवकल समीकरण (Differential Equations)', pts: ['अवकल समीकरण का क्रम और विचलन', 'चर पृथक करने योग्य समीकरण', 'सामान्य और विशिष्ट हल'], kw: ['differential equation', 'order', 'degree', 'separable'] },
          { t: 'सदिश बीजगणित (Vector Algebra)', pts: ['सदिश, प्रकार, योग और गुणन', 'अदिश और सदिश गुणनफल', 'सदिश त्रिज्य समीकरण'], kw: ['vector', 'dot product', 'cross product', 'scalar triple', 'angle'] },
          { t: 'त्रिविमीय ज्यामिति (Three Dimensional Geometry)', pts: ['रैखा और समतल का समीकरण', 'रैखा के मध्य बिंदु और दोनों तरफ दूरी', 'समतल के मध्य बिंदु'], kw: ['3d geometry', 'plane', 'line', 'distance formula'] },
          { t: 'रैखिक प्रोग्रामिंग (Linear Programming)', pts: ['अनुकूल और प्रतिकूल क्षेत्र', 'बिंदु रेखा विधि, शीर्ष कोण विधि', 'न्यूनतम अथवा अधिकतम के लिए अनुप्रयोग'], kw: ['linear programming', 'lpp', 'feasible', 'constraints', 'objective'] },
          { t: 'प्रायिकता (Probability)', pts: ['यादृच्छिक चर और प्रायिकता फलन', 'बेरनौली और सामान्य वितरण', 'सशर्त प्रायिकता और प्रतयग्रहा प्रमेय'], kw: ['probability', 'random variable', 'bernoulli', 'normal', 'bayes', 'conditional'] }
        ]
      },
      physics: {
        name: 'भौतिक विज्ञान',
        nameEn: 'Physics',
        emoji: '⚙️',
        color: '#845ef7',
        desc: 'विद्युत से नाभिकीय भौतिकी तक, 13 अध्याय',
        chapters: [
          { t: 'विद्युत आवेश एवं क्षेत्र (Electric Charges and Fields)', pts: ['कूलॉम का नियम, विद्युत क्षेत्र', 'गाउस का नियम', 'विद्युत विभव, समविभव तल'], kw: ['electric charge', 'coulomb', 'gauss', 'field', 'dipole', 'potential'] },
          { t: 'स्थिरवैद्युत विभव एवं संधारित्र (Electrostatic Potential and Capacitance)', pts: ['विभव और विभवांतर', 'संधारित्र, संधारित्रता Q = CV', 'संधारित्रों का संयोजन और ऊर्जा'], kw: ['potential', 'capacitor', 'capacitance', 'dielectric', 'combination'] },
          { t: 'धारा विद्युत (Current Electricity)', pts: ['विद्युत धारा, प्रतिरोध, ओम का नियम', 'विद्युत सेल, आंतरिक प्रतिरोध', 'व्हीलस्टन ब्रिज, विद्युत चालकत्व'], kw: ['current', 'ohm law', 'resistance', 'resistivity', 'wheatstone', 'potentiometer'] },
          { t: 'गतिमान आवेश एवं चुम्बकत्व (Moving Charges and Magnetism)', pts: ['बायो-सवार्ट नियम, ऐम्पियर का चक्रीय नियम', 'लॉरेंज बल, आवेशित कण की गति', 'चुंबकीय प्रेरण और द्विध्रुव आघूर्ण'], kw: ['magnetism', 'ampere', 'lorentz', 'cyclotron', 'magnetic moment'] },
          { t: 'चुम्बकत्व एवं पदार्थ (Magnetism and Matter)', pts: ['चुम्बकीय क्षेत्र, मैग्नेटेशन, परमाणु का चुंबकत्व', 'अनुचुम्बकीय और अतिचुम्बकीय पदार्थ', 'पृथ्वी का चुंबकत्व'], kw: ['magnetic', 'paramagnetic', 'diamagnetic', 'ferromagnetic', 'earth'] },
          { t: 'विद्युत चुंबकीय प्रेरण (Electromagnetic Induction)', pts: ['फैराडे के नियम, लेंज का नियम', 'चालक और प्रेरक कुंडली', 'सेल्फ इंडक्शन और अन्योदय धारा'], kw: ['induction', 'faraday', 'lenz', 'motional emf', 'self induction'] },
          { t: 'प्रत्यावर्ती धाराएँ (Alternating Currents)', pts: ['AC जनित्र और फोरियर प्रमेय', 'rms मान, RL, RC, RLC परिपथ', 'अनुनाद और गुणवत्ता कारक'], kw: ['alternating', 'ac', 'rms', 'resonance', 'transformer', 'impedance'] },
          { t: 'विद्युत चुंबकीय तरंगें (Electromagnetic Waves)', pts: ['विद्युत चुंबकीय तरंगें, विशेषता और तीव्रता', 'परावर्तन, अपवर्तन, व्यापीकरण', 'विद्युत चुंबकीय स्पेक्ट्रम'], kw: ['em wave', 'electromagnetic', 'spectrum', 'modulation', 'polarisation'] },
          { t: 'किरण प्रकाशिकी (Ray Optics)', pts: ['प्रतिवर्तन, गोलाकार दर्पण', 'लेंस सूत्र और आवर्धन क्षमता', 'दृष्टिक्षेप यंत्र, दूरबीन, प्रिज़्म'], kw: ['ray optics', 'mirror', 'lens', 'refraction', 'telescope', 'microscope'] },
          { t: 'तरंग प्रकाशिकी (Wave Optics)', pts: ['हडन और तरंग क्रिया', 'व्यापीकरण, ध्रुवण', 'व्यापक परास और द्विपथ व्यापीकरण'], kw: ['wave optics', 'huygens', 'diffraction', 'polarisation', 'interference'] },
          { t: 'पदार्थ की द्वैत प्रकृति (Dual Nature of Radiation and Matter)', pts: ['फोटोविद्युत प्रभाव, प्लांक सिद्धांत', 'डी-ब्रॉग्ली तरंगदैर्ध्य', 'एलेक्ट्रॉन सूक्ष्मदर्शी'], kw: ['photoelectric', 'de broglie', 'planck', 'wave particle', 'electron microscope'] },
          { t: 'परमाणु एवं नाभिक (Atoms and Nuclei)', pts: ['रदरफोर्ड मॉडल, बोर मॉडल', 'विद्युत चुंबकीय स्पेक्ट्रम', 'रेडियोधर्मी परिवर्तन, द्रव्यमान-ऊर्जा समतुल्य, द्रव्यमान-क्षीणता'], kw: ['atom', 'bohr', 'nucleus', 'radioactive', 'nuclei', 'mass energy'] },
          { t: 'अर्धचालक इलेक्ट्रॉनिकी (Semiconductor Electronics)', pts: ['अर्धचालक, P-N संधि, डायोड', 'संधि ट्रांजिस्टर और FET', 'धारा लाभ, लॉजिक द्वार'], kw: ['semiconductor', 'diode', 'transistor', 'p-n', 'integrated circuit'] }
        ]
      },
      chemistry: {
        name: 'रसायन विज्ञान',
        nameEn: 'Chemistry',
        emoji: '🧪',
        color: '#20c997',
        desc: 'Solutions से Chemistry in Everyday Life तक, 16 अध्याय',
        chapters: [
          { t: 'विलयन (Solutions)', pts: ['विलयन की सांद्रता: मोलरता, मोललता, भाग मात्रा', 'आसन्न विलयन, वाष्प दाब का न्यूनीकरण', 'आलेखी विधि'], kw: ['solution', 'molarity', 'molality', 'colligative', 'henry', 'raoult'] },
          { t: 'विद्युत रसायन (Electrochemistry)', pts: ['ऑक्सीकरण-अपचयन, सेल EMF', 'नर्न्स्ट समीकरण, चालनिता', 'डैनिएल सेल, लेड संचायक, ईंधन सेल'], kw: ['electrochemistry', 'nernst', 'galvanic', 'electrolytic', 'conductance', 'kohlrausch'] },
          { t: 'रासायनिक गतिकी (Chemical Kinetics)', pts: ['अभिक्रिया दर, दर नियम, वर्ग', 'आरेनियस समीकरण', 'सक्रियण ऊर्जा और उत्प्रेरक'], kw: ['kinetics', 'rate', 'order', 'arrhenius', 'activation energy', 'catalyst'] },
          { t: 'पृष्ठ रसायन (Surface Chemistry)', pts: ['सतह के कार्य और पृष्ठ तनाव', 'अधिविकलन, अवशोषण, सोरption', 'कोलाइड, वायव (Aerosol)'], kw: ['surface', 'adsorption', 'colloid', 'aerosol', 'catalysis', 'emulsion'] },
          { t: 'ठोस अवस्था (The Solid State)', pts: ['क्रिस्टल जाल, इकाई कोशिका', 'packing, density, void', 'defect: Schottky, Frenkel'], kw: ['solid', 'crystal', 'lattice', 'unit cell', 'defect', 'radius ratio'] },
          { t: 'd- और f-ब्लॉक तत्व (General Principles and Processes of Isolation of Elements)', pts: ['संक्रमण तत्वों का उदर, शोधन', 'd-ब्लॉक उपभोक्ता गुण (Catalytic, Colour)', 'f-ब्लॉक: लैन्थेनॉइड और एक्टिनॉइड'], kw: ['d block', 'f block', 'lanthanoid', 'actinoid', 'extraction', 'refining'] },
          { t: 'समन्वय यौगिक (Coordination Compounds)', pts: ['उपसहसंयोजन संख्या, द्विबंध, ट्रांस-प्रभाव', 'Werner सिद्धांत, VBT, CFT, MOF', 'IUPAC नामकरण, समावेशन यौगिक'], kw: ['coordination', 'ligand', 'werner', 'crystal field', 'isomer', 'chelate'] },
          { t: 'हैलोएल्केन और हैलोएरीन (Haloalkanes and Haloarenes)', pts: ['SN1, SN2 क्रियाविधि', 'C-X आबंध की ध्रुवता', 'polyhalogen, freon, DDT'], kw: ['haloalkane', 'sn1', 'sn2', 'nucleophile', 'freon', 'chloroform'] },
          { t: 'अल्कोहल, फीनॉल और ईथर (Alcohols, Phenols and Ethers)', pts: ['अल्कोहल के प्रकार, अम्लता', 'Lucas परीक्षण, विलयमली, एस्टरीकरण', 'फीनॉल की अम्लता और ब्रूम जल'], kw: ['alcohol', 'phenol', 'ether', 'lucas test', 'oxidation', 'colligative'] },
          { t: 'लेडहाइड, कीटोन और कार्बोक्सिलिक अम्ल (Aldehydes, Ketones and Carboxylic Acids)', pts: ['नाभिकरागी योगात्मक अभिक्रियाएँ, कार्बोनिल', 'Aldol, Cannizzaro, Haloform', 'कैनिज़ारो, एस्टर, कार्बोक्सिलिक अम्ल की अम्लता'], kw: ['aldehyde', 'ketone', 'carboxylic', 'aldol', 'nucleophilic', 'ester'] },
          { t: 'ऐमीन (Amines)', pts: ['ऐमीन का संरचना, प्रकार और आधारिकता', 'एल्किल अमीन बनाने की विधियाँ', 'कार्बोआमाइड, अजाइड, डाइजोनियम'], kw: ['amine', 'amino', 'basic', 'diazonium', 'carbamide'] },
          { t: 'जैव अणु (Biomolecules)', pts: ['कार्बोहाइड्रेट, प्रोटीन, लिपिड, न्यूक्लिक अम्ल', 'एंजाइम और विटामिन', 'शुद्धि और वर्णन विधियाँ'], kw: ['biomolecule', 'carbohydrate', 'protein', 'lipid', 'nucleic', 'enzyme', 'vitamin'] },
          { t: 'बहुलक (Polymers)', pts: ['बहुलक की परिभाषा और वर्गीकरण', 'योगात्मक और योगात्मक बहुलन', 'प्राकृतिक और संश्लेषित बहुलक'], kw: ['polymer', 'addition', 'condensation', 'natural', 'nylon', 'biodegradable'] },
          { t: 'दैनिक जीवन में रसायन (Chemistry in Everyday Life)', pts: ['दवा, प्रतिजैविक, प्रतिरक्षा', 'खाद्य संरक्षक, कृत्रिम मधुरकर', 'साबुन, अपमार्जक, विकिरण-सुरक्षा'], kw: ['everyday', 'drug', 'antibiotic', 'food preservative', 'soap', 'detergent', 'allergy'] }
        ]
      },
      biology: {
        name: 'जीव विज्ञान',
        nameEn: 'Biology',
        emoji: '🧬',
        color: '#51cf66',
        desc: 'जनन से पर्यावरण तक, 16 अध्याय',
        chapters: [
          { t: 'लैंगिक जनन (Sexual Reproduction in Flowering Plants)', pts: ['पुष्प के भाग, परागण, निषेचन', 'बीज और फल का विकास, परागकण', 'द्विबीजपत्री और एकबीजपत्री भ्रूणकोष'], kw: ['sexual reproduction', 'flower', 'pollination', 'fertilisation', 'double fertilisation'] },
          { t: 'मानव जनन (Human Reproduction)', pts: ['पुरुष और स्त्री जनन तंत्र', 'आर्तव, अंतःस्रावी ग्रंथि, gametogenesis', 'गर्भावस्था, प्रसव और स्तनपान'], kw: ['human reproduction', 'gamete', 'ovulation', 'uterus', 'placenta', 'spermatogenesis'] },
          { t: 'जनन स्वास्थ्य (Reproductive Health)', pts: ['जनन स्वास्थ्य समस्याएँ', 'परिवार नियोजन, गर्भपात, STI', 'सहायी प्रजनन तकनीक (IVF, ZIFT)'], kw: ['reproductive health', 'contraception', 'abortion', 'ivf', 'sti', 'amniocentesis'] },
          { t: 'आनुवंशिकता के सिद्धांत (Principles of Inheritance and Variation)', pts: ['मेंडल और मान्डेलियन नियम', 'लिंग-सहलग्न और सहप्रभावी जीन', 'लक्षण प्रकार: प्रभावी, अप्रभावी, यौगिक'], kw: ['inheritance', 'mendel', 'monohybrid', 'dihybrid', 'sex linked', 'pedigree'] },
          { t: 'आनुवंशिकता का आणविक आधार (Molecular Basis of Inheritance)', pts: ['DNA, RNA और प्रोटीन संश्लेषण', 'लैक-ऑपरेटर, हनी-ग्लोबोरिन', 'DNA फिंगरप्रिंटिंग, मानव जीनोम परियोजना'], kw: ['dna', 'rna', 'lac operon', 'hamming', 'fingerprinting', 'genome', 'genetic code'] },
          { t: 'जैव विकास (Evolution)', pts: ['डार्विन का सिद्धांत और प्राकृतिक वरण', 'आनुवंशिक विभिन्नता', 'मानव उत्पत्ति'], kw: ['evolution', 'darwin', 'natural selection', 'variation', 'human origin', 'analogous'] },
          { t: 'मानव स्वास्थ्य एवं रोग (Human Health and Disease)', pts: ['सामान्य रोग: मलेरिया, कुष्ठ, आंतोंकृमि, अमरता', 'प्रतिरक्षा एवं AIDs', 'कैंसर, औषधि और प्रतिरक्षक'], kw: ['health', 'disease', 'malaria', 'immunity', 'aids', 'cancer', 'vaccine'] },
          { t: 'सूक्ष्मजीव (Microbes in Human Welfare)', pts: ['सूक्ष्मजीवों के प्रकार, वृद्धि और जनन', 'खाद्य उत्पादन, जैव-उर्वरक, जैव-नियंत्रण', 'जैव प्रौद्योगिकी और टीकाकरण'], kw: ['microbes', 'bacteria', 'fungus', 'biogas', 'fermentation', 'antibiotic', 'biogas'] },
          { t: 'जैव प्रौद्योगिकी: सिद्धांत और प्रक्रम (Biotechnology: Principles and Processes)', pts: ['जैव प्रौद्योगिकी के सिद्धांत', 'restriction enzyme, vector, PCR', 'GMOs और जैव सुरक्षा'], kw: ['biotechnology', 'restriction enzyme', 'plasmid', 'pcr', 'gmo', 'gel electrophoresis'] },
          { t: 'जैव प्रौद्योगिकी और उसके अनुप्रयोग (Biotechnology and its Applications)', pts: ['कृषि, औषधि, उत्पादन में उपयोग', 'मानव इंसुलिन, जीन उपचार', 'बायोएथेनॉल, अवायवीय जीव-ईंधन'], kw: ['application', 'bt cotton', 'gene therapy', 'insulin', 'biofuel', 'transgenic'] },
          { t: 'जीव और पर्यावरण: संरचना और कार्य (Organisms and Populations)', pts: ['जैविक संगठन', 'जनसंख्या वृद्धि मॉडल, जनसंख्या वातावरण संबंध', 'जनसंख्या का वितरण, प्रवास'], kw: ['organism', 'population', 'ecosystem', 'growth', 'niche', 'migration'] },
          { t: 'पारितंत्र (Ecosystem)', pts: ['पारितंत्र के कार्य: उत्पादक, उपभोक्ता, अपघटक', 'ऊर्जा प्रवाह और पारितंत्र उत्पादकता', 'पारितंत्र पुनर्चक्रण और पारिस्थितिक अनुक्रमण'], kw: ['ecosystem', 'energy flow', 'pyramid', 'decomposer', 'productivity', 'succession'] },
          { t: 'जैव विविधता और संरक्षण (Biodiversity and Conservation)', pts: ['विविधता के स्तर', 'जैव विविधता हानि के कारण', 'संरक्षण: राष्ट्रीय उद्यान, जैवविविधता गर्मीघर'], kw: ['biodiversity', 'conservation', 'hotspot', 'endemic', 'ecosystem service'] },
          { t: 'पर्यावरणीय मुद्दे (Environmental Issues)', pts: ['वायु, जल और ध्वनि प्रदूषण', 'अम्ल वर्षा, ओज़ोन क्षरण', 'जलवालूकरण और जैव विविधता हानि'], kw: ['environment', 'pollution', 'acid rain', 'ozone', 'water scarcity', 'e-waste'] }
        ]
      },
      history: {
        name: 'इतिहास',
        nameEn: 'History',
        emoji: '🏛️',
        color: '#e8590c',
        desc: 'यूरोप से भारत के स्वतंत्रता संग्राम तक',
        chapters: [
          { t: 'यूरोप में राष्ट्रवाद का उदय (The Rise of Nationalism in Europe)', pts: ['फ्रांसीसी क्रांति और नागरिक समाज', 'यूरोप में राष्ट्रवाद: रोमानी, इटली, जर्मनी', 'आंग्ल-फ्रांसीसी युद्ध'], kw: ['nationalism', 'france', 'romanticism', 'italy', 'germany'] },
          { t: 'भारत में राष्ट्रवाद (Nationalism in India)', pts: ['भारतीय राष्ट्रवाद का उद्भव, बंगाल विभाजन', 'स्वदेशी आंदोलन, 1905', 'गांधी, नेहरू और जवाहरलाल की भूमिका'], kw: ['nationalism india', 'swadeshi', 'partition bengal', 'gandhi', 'nehru', 'muslim league'] },
          { t: 'भूमंडलीकृत विश्व का बनना (The Making of a Global World)', pts: ['18वीं शताब्दी की विश्व व्यापी अर्थव्यवस्था', 'शोधन, गुलाम और मज़दूरों की आवाज', 'भारतीय कपास और मलमला'], kw: ['global world', 'slavery', 'indentured', 'silk route', 'food', 'cod'] },
          { t: 'औद्योगीकरण का युग (The Age of Industrialisation)', pts: ['19वीं शताब्दी में उद्योगीकरण', 'ब्रिटेन में कारखाना, भाप इंजन', 'सामाजिक परिणाम: मज़दूर वर्ग'], kw: ['industrialisation', 'factory', 'steam', 'labour', 'wages', 'lancashire'] },
          { t: 'मुद्रण संस्कृति और आधुनिक दुनिया (Print Culture and the Modern World)', pts: ['जर्मनी में मुद्रण का विकास, 1450', 'भारत में छपाई का आगमन', 'पुस्तकों, पत्रिकाओं और चित्रों का प्रभाव'], kw: ['print', 'gutenberg', 'literacy', 'newspaper', 'book', 'mangal kumar'] },
          { t: 'द्वितीय विश्व युद्ध (The Second World War 1939-45)', pts: ['हिंटरलर, नाज़ी जर्मनी और जापान का उदय', 'रूस और अमेरिका का प्रवेश', 'हिरोशिमा और परमाणु ऊर्जा'], kw: ['world war', 'nazi', 'japan', 'hitler', '1945', 'holocaust'] },
          { t: 'द्वितीय विश्व युद्ध के बाद का अंतरराष्ट्रीय संगठन (The International World Order after the Second World War)', pts: ['संयुक्त राष्ट्र का निर्माण, 1945', 'शीत युद्ध और दो ध्रुव', 'UNCTAD, IMF, विश्व बैंक, WTO'], kw: ['un', 'united nations', 'cold war', 'bretton woods', 'imf', 'wto'] },
          { t: 'राष्ट्रवादी आंदोलन (The Rise of Nationalism in India after 1937)', pts: ['द्वितीय विश्व युद्ध और भारत', 'क्वीन अभिलेख, 1946 और 1947 के निर्णय', '1946 में जवाहरलाल नेहरू की घोषणा'], kw: ['nationalism', '1947', 'nehru', 'partition', 'independence'] },
          { t: 'भारतीय स्वतंत्रता संग्राम का इतिहास (An Era of One-Party Dominance)', pts: ['जनता दल के वर्ष, 1952-1977', 'निरंकुशता और 1975 का आपातकाल', 'समाजवाद और गांधीवादी का अंत'], kw: ['one party', 'emergency 1975', 'indira gandhi', 'socialism', 'bhoodan', 'naxalite'] },
          { t: 'पुनर्गठन के प्रवाह (Recent Changes in Indian Politics)', pts: ['1991 के बाद उदारीकरण', 'गठबंधन का युग, 1996 में इंदिरा-अटल बिहारी', 'साम्प्रदायिक राजनीति और नई पीढ़ी'], kw: ['liberalisation', 'coalition', '1991', 'reforms', 'regional parties'] }
        ]
      },
      geography: {
        name: 'भूगोल',
        nameEn: 'Geography',
        emoji: '🌏',
        color: '#1098ad',
        desc: 'मानव भूगोल और भारत के संसाधन',
        chapters: [
          { t: 'मानव भूगोल: प्रकृति औरscope (Human Geography: Nature and Scope)', pts: ['मानव भूगोल की प्रकृति और क्षेत्र', 'मानव, पर्यावरण और समाज', 'मानव भूगोल के उपकरण और पद्धतियाँ'], kw: ['human geography', 'nature', 'scope'] },
          { t: 'जनसंख्या: वितरण, घनत्व, वृद्धि (Population: Distribution, Density, Growth and Composition)', pts: ['जनसंख्या वितरण और घनत्व', 'जन्म, मृत्यु, प्रवास, वृद्धि दर', 'भारत में स्त्री-पुरुष अनुपात और आयु संरचना'], kw: ['population', 'density', 'fertility', 'sex ratio', 'migration', 'mortality'] },
          { t: 'मानव विकास (Human Development)', pts: ['मानव विकास, मानव विकासता और आर्थिक विकास', 'मानव विकास सूचकांक (HDI)', 'मानव विकास से जुड़ी अवधारणाएँ'], kw: ['human development', 'hdi', 'empowerment', 'life expectancy'] },
          { t: 'प्राथमिक क्रियाएँ (Primary Activities)', pts: ['कृषि: प्रकार, फसलें, पशुपालन', 'स्थानीय और व्यापारिक कृषि', 'खनन, मछली पकड़ना, वन संसाधन'], kw: ['agriculture', 'primary', 'livestock', 'mining', 'farming'] },
          { t: 'द्वितीयक क्रियाएँ (Secondary Activities)', pts: ['उद्योग: कच्चा पदार्थ से निर्मित उत्पाद', 'मानव और यांत्रिक शक्ति, उद्योगों का स्थानीकरण', 'औद्योगिक प्रदूषण'], kw: ['secondary', 'industry', 'manufacturing', 'pollution', 'agro'] },
          { t: 'तृतीयक एवं चतुर्थक क्रियाएँ (Tertiary and Quaternary Activities)', pts: ['व्यापार, आयात-निर्यात, वित्त, परिवहन', 'सूचना प्रौद्योगिकी और आँकड़े', 'सेवाएँ और गतिशीलता'], kw: ['tertiary', 'service', 'transport', 'tourism', 'it', 'banking'] },
          { t: 'जनसंख्या संघटन, प्रवास और बसेरी (Population Composition, Migration and Settlement)', pts: ['व्यवसाय, जाति, धर्म, भाषा के आधार पर संरचना', 'प्रवास के प्रकार और कारण, स्थानांतरण', 'नगरीकरण, ग्रामीण और शहरी बस्तियाँ'], kw: ['migration', 'settlement', 'urbanisation', 'rural', 'caste', 'religion'] },
          { t: 'मानव संसाधन (Human Resources)', pts: ['मानव संसाधन, शिक्षा, स्वास्थ्य, मनोरंजन', 'जनसंख्या को संसाधन में बदलना', 'कौशल विकास और मानव पूँजी निर्माण'], kw: ['human resources', 'education', 'health', 'skill', 'manpower'] },
          { t: 'भारतीय प्राकृतिक संसाधन (Natural Resources)', pts: ['भूमि, जल, खनिज, वन संसाधन', 'संसाधनों का संतुलित उपयोग', 'भारत में खाद्य और ऊर्जा संसाधन'], kw: ['natural resources', 'land', 'water', 'mineral', 'energy', 'conservation'] },
          { t: 'भारतीय कृषि (Agriculture)', pts: ['भारत में कृषि की स्थिति', 'फसल, सिंचाई, खादी, कृषि तकनीक', 'हरित क्रांति, WHIP, खाद्य प्रसंस्करण'], kw: ['agriculture india', 'crop', 'irrigation', 'green revolution', 'kisaan', 'msp'] },
          { t: 'भारत में राज्यों के आर्थिक विकास (Development Experience of Indian Economy)', pts: ['विकास की राजनीतिक अर्थव्यवस्था, योजना काल', 'उदारीकरण, उदारीकृत अर्थव्यवस्था', 'भारत में निर्धन्यता और अवसरा और चुनौतियाँ'], kw: ['development', 'planning', 'liberalisation', 'niti aayog', 'poverty', 'identity'] }
        ]
      },
      civics: {
        name: 'राजनीति विज्ञान',
        nameEn: 'Civics',
        emoji: '⚖️',
        color: '#7048e8',
        desc: 'विकास, समाजवाद और अंतरराष्ट्रीय संबंध',
        chapters: [
          { t: 'राजनीतिक विकास के चरण (Emerging Democratic Nations)', pts: ['उपनिवेशवाद और राष्ट्र-निर्माण', 'राष्ट्रवाद, उदारीकरण और ग्लोबलाइजेशन', 'विकासशील देशों में लोकतंत्र'], kw: ['democratic nation', 'colonialism', 'nationalism', 'nation building'] },
          { t: 'अंतरराष्ट्रीय संगठन (International Organisations)', pts: ['संयुक्त राष्ट्र और शांति, WTO और IMF', 'पीसा, विश्व बैंक, WHO, UNICEF, WTO', 'क्षेत्रीय संगठन'], kw: ['international', 'un', 'wto', 'imf', 'world bank', 'ngo'] },
          { t: 'राजनीतिक दल (Political Parties)', pts: ['पार्टियों का वर्गीकरण और कार्य', 'राष्ट्रीय और राज्य स्तरीय दल, गठबंधन', 'पार्टी सुधार और आंतरिक प्रजातंत्र'], kw: ['party', 'national party', 'coalition', 'party system', 'mp'] },
          { t: 'भारत में जनता का धारा (The End of Colonialism)', pts: ['भारत में राष्ट्रवादी स्वतंत्रता संग्राम', 'द्वितीय विश्व युद्ध के बाद', 'सांप्रदायिक राजनीति और स्वतंत्रता'], kw: ['colonialism', 'independence', '1947', 'nationalism', 'trinity'] },
          { t: 'शक्ति का विकेंद्रीकरण (The Changing World of Visual Media)', pts: ['मीडिया, विज्ञापन और मनोरंजन', 'रेडियो, टेलीविज़न और समाचार पत्र', 'सिनेमा और खेल'], kw: ['media', 'television', 'advertising', 'cinema', 'radio'] },
          { t: 'अंतरराष्ट्रीय संबंध (International Relations)', pts: ['राष्ट्र, राष्ट्रवाद और अंतरराष्ट्रीय संबंध', 'आत्मनिर्भरता और विदेश नीति', 'भारत के विदेश संबंध, 1991 के बाद'], kw: ['international relations', 'foreign policy', 'independence', 'self reliance'] },
          { t: 'अंतरराष्ट्रीय व्यापार (International Trade)', pts: ['व्यापार और उदारीकरण, WTO', 'भारत में विदेश व्यापार और वैश्विककरण', 'समता, गुणवत्ता और नियमितकरण'], kw: ['trade', 'wto', 'liberalisation', 'imports', 'exports'] },
          { t: 'समाजवाद और समाज का पुनर्गठन (An Alternative Centres of Power)', pts: ['भारत में सामाजिक विचारधाराएँ', 'समाजवाद, सम्पत्ति और कृषि', 'उत्तर भारत का समाजवादी आंदोलन'], kw: ['socialism', 'ideology', 'uttrakhand', 'sarvodaya', 'bhakti', 'tamil'] }
        ]
      },
      economics: {
        name: 'अर्थशास्त्र',
        nameEn: 'Economics',
        emoji: '📈',
        color: '#ae3ec9',
        desc: 'राष्ट्रीय आय से वित्त तक, 15 अध्याय',
        chapters: [
          { t: 'राष्ट्रीय आय और संबंधित अवधारणाएँ (National Income and Related Concepts)', pts: ['व्यष्टि और समष्टि विश्लेषण', 'मूल्य संकलन, उत्पादन और आय दृष्टिकोण', 'वास्तविक और नाममात्र, मुद्रास्फीति समायोजन'], kw: ['national income', 'gdp', 'gdp deflator', 'real', 'nominal'] },
          { t: 'विकास की अर्थव्यवस्था (The Economy: Development Experience)', pts: ['विकास के अर्थ और उद्देश्य', 'विकास के प्रमुख उद्देश्य, आर्थिक विकास, सतत', 'विकास का अवसर और बाधा'], kw: ['development', 'development experience', 'objective', 'sustainable'] },
          { t: 'मुद्रास्फीति (Inflation)', pts: ['मुद्रास्फीति का अर्थ, कारण, प्रभाव', 'औसत मूल्य सूचकांक और WPI', 'प्रत्यक्ष और अप्रत्यक्ष मुद्रास्फीति नियंत्रण'], kw: ['inflation', 'cpi', 'wpi', 'deflation', 'cost push', 'demand pull'] },
          { t: 'मुद्रा और बैंकिंग (Money and Banking)', pts: ['व्यापारिक बैंक, केंद्रीय बैंक और अन्य वित्तीय संस्थान', 'जनता की जमाएँ, ऋण और मुद्रा आपूर्ति', 'विकास और वित्तीय समावेशन'], kw: ['money', 'bank', 'rbi', 'deposit', 'loan', 'monetary policy'] },
          { t: 'सकल घरेलू उत्पाद (Gross Domestic Product and Related Aggregates)', pts: ['उत्पादन दृष्टिकोण, घटक दृष्टिकोण', 'सकल मूल्य संवर्धन GVA', 'GDP, NDP, NNP'], kw: ['gdp', 'gva', 'nrp', 'real', 'per capita'] },
          { t: 'आय का वितरण (Distribution of National Income)', pts: ['व्यक्तिगत आय और उपभोग, बचत और निवेश', 'आय असमानता, गरीबी, गुणक', 'पेरिन और लॉरेंज वक्र'], kw: ['income distribution', 'inequality', 'lorenz', 'gini', 'poverty'] },
          { t: 'भारतीय अर्थव्यवस्था का विकास और अन्य देश (Government Budget and the Economy)', pts: ['बजट के प्रकार, राजस्व और व्यय', 'भारत का बजट, 2023-24', 'बजट और अर्थव्यवस्था नीति'], kw: ['budget', 'fiscal', 'revenue', 'expenditure', 'deficit'] },
          { t: 'भारत में आर्थिक सुधार (Indian Economic Reforms)', pts: ['जनरी 1991 के सुधार', 'वित्तीय समेकन और उदारीकरण', 'नई आर्थिक नीति, GST'], kw: ['liberalisation', '1991', 'reform', 'gst', 'naya artha'] },
          { t: 'विकास की अवस्था (Indian Economy: Development Experience)', pts: ['भारत में विकास का अनुभव', 'ग्रामीण और कृषि विकास', 'भारत में मानव पूँजी निर्माण'], kw: ['development experience', 'human capital', 'rural', 'agricultural'] },
          { t: 'पर्यावरण और प्रदूषण (Environment and Development)', pts: ['सतत विकास और पर्यावरण संरक्षण', 'आर्थिक गतिविधियों से प्रदूषण', 'भारत में पर्यावरण प्रबंधन'], kw: ['environment', 'sustainable', 'pollution', 'development'] },
          { t: 'भारत और विश्व अर्थव्यवस्था में भारत का स्थान (Indian Economy and the World)', pts: ['भारतीय अर्थव्यवस्था का वैश्वीकरण', 'व्यापार और FDI, WTO', 'वैश्वीकरण के सकारात्मक और नकारात्मक प्रभाव'], kw: ['globalisation', 'wto', 'fdi', 'world economy', 'imf'] },
          { t: 'आपूर्ति, माँग और बाज़ार मूल्य (Determination of Income and Employment)', pts: ['कुल माँग और पूर्ति समीकरण, गुणक', 'AD-AS, कीनसियन आय-व्यय प्रवाह', 'कुल व्यय और पूर्ण रोज़गार, कीनसियन की उपादेयता'], kw: ['aggregate demand', 'multiplier', 'kahnish', 'ad as', 'employment'] },
          { t: 'राष्ट्रीय आय की माप (National Income Accounting)', pts: ['वास्तविक और नाममात्र GDP, GDP deflator', 'शारीरिक माप और राष्ट्रीय लेखांकन', 'चुंगी, VAT, GST'], kw: ['accounting', 'gdp', 'deflator', 'national accounts', 'tax'] },
          { t: 'पर्यावरणीय अर्थशास्त्र (Indian Economic Development: Balance of Payments)', pts: ['भुगतान संतुलन और संरचना', 'पूंजी प्रवाह और भुगतान संतुलन संकट', 'रुपये का अवमूल्यन'], kw: ['balance of payment', 'deficit', 'exchange rate', 'forex', 'crisis'] }
        ]
      },
      hindi: {
        name: 'हिन्दी',
        nameEn: 'Hindi',
        emoji: '📕',
        color: '#ff6b6b',
        desc: 'आदर्श हिन्दी, अनन्यासिका, व्याकरण और रचना',
        chapters: [
          { t: 'आदर्श हिन्दी (A Ideal Hindi)', pts: ['हिन्दी भाषा का स्वरूप, व्याकरणिक आधार', 'हिन्दी के प्रकार: विधेय और शैलीगत', 'हिन्दी साहित्य का इतिहास'], kw: ['ideal hindi', 'language', 'grammar'] },
          { t: 'पुनरावृत्ति (Binaranubandh)', pts: ['हिन्दी साहित्य के कालखंड', 'भाषा की अवस्था और विकास', 'भारतीय भाषाएँ'], kw: ['repetition', 'literature', 'kalkhand', 'bhasha'] },
          { t: 'भाषा और लिपि', pts: ['भाषा का स्वरूप, लिपि, वर्तनी', 'हिंदी व्याकरण का इतिहास', 'भाषा की विविधता'], kw: ['script', 'spelling', 'language', 'lipi'] },
          { t: 'व्याकरण', pts: ['शब्द भेद, संधि, समास, उपसर्ग, प्रत्यय', 'वाक्य भेद और वाक्य शुद्धि', 'अनुच्छेद, पत्र, निबंध लेखन'], kw: ['grammar', 'sandhi', 'samash', 'upasarg', 'pratyay'] },
          { t: 'अपठित पाठ', pts: ['अपठित गद्य और पद्य पर प्रश्न', 'साहित्यिक पदों का अर्थ', 'प्रतियोगिता-सामान्य ज्ञान'], kw: ['apathit', 'unread', 'passage'] },
          { t: 'निबंध लेखन एवं पत्र लेखन', pts: ['निबंध के प्रकार: वर्णन, कथात्मक, विवेचनात्मक', 'पत्र के प्रकार: आधारभूत, आवेदन, शिकायत', 'सारांश और सूची लेखन'], kw: ['essay', 'letter', 'nibandh', 'summary'] }
        ]
      },
      english: {
        name: 'English',
        nameEn: 'English',
        emoji: '📘',
        color: '#4ecdc4',
        desc: 'Flamingo, Vistas, Snapshots and writing skills',
        chapters: [
          { t: 'Flamingo: Prose', pts: ['The Last Lesson, Lost Spring, Deep Water, The Rattrap', 'Indigo, Poets and Pancakes, The Interview', 'Going Places, The Third Level, Journey to the End of the Earth', 'The Enemy, On the Face of It, Memories of Childhood'], kw: ['flamingo', 'prose', 'last lesson', 'rattrap', 'indigo'] },
          { t: 'Flamingo: Poetry', pts: ['My Mother at Sixty-six, Keeping Quiet, Thing of Beauty, A Roadside Stand', 'A Thing of Beauty, Aunt Jennifer’s Tigers, Our Casanova, The Lesson', 'The Laburnum Top, The Voice of the Rain, Going Places'], kw: ['flamingo', 'poetry', 'casanova', 'laburnum'] },
          { t: 'Vistas: Supplementary Reader', pts: ['The Third Level, The Tiger King, Journey to the End of the Earth', 'The Enemy, On the Face of It, Memories of Childhood', 'The Tale of Melon City, The Last Lesson'], kw: ['vistas', 'supplementary', 'tiger king', 'melon city'] },
          { t: 'Snapshots Supplementary Reader', pts: ['Summaries of Vistas chapters', 'Reading comprehension passages', 'Theme and character analysis'], kw: ['snapshots', 'supplementary', 'summary'] },
          { t: 'Writing and Grammar Skills', pts: ['Notice, poster, formal and informal letters, email', 'Article, speech, report, review, story writing', 'Editing, omission, reordering, sentence transformation'], kw: ['writing', 'notice', 'letter', 'email', 'article', 'editing', 'grammar'] }
        ]
      }
    }
  }
};
