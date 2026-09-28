// ============================================================
//  PERIODIC TABLE (Class 10 essential elements)
//  + गलनांक/क्वथनांक slider (بطور volume control)
// ============================================================

const PERIODIC_ELEMENTS = {
  1:{s:"H",n:"Hydrogen",c:"pt-cat-nonmetal",cat:"अधातु",m:"1.008",g:"समूह 1"},
  2:{s:"He",n:"Helium",c:"pt-cat-noble",cat:"नोबल गैस",m:"4.003",g:"समूह 18"},
  3:{s:"Li",n:"Lithium",c:"pt-cat-alkali",cat:"क्षारीय धातु",m:"6.94",g:"समूह 1"},
  4:{s:"Be",n:"Beryllium",c:"pt-cat-alkaline",cat:"क्षारीय मृदा धातु",m:"9.01",g:"समूह 2"},
  5:{s:"B",n:"Boron",c:"pt-cat-metalloid",cat:"उपधातु",m:"10.81",g:"समूह 13"},
  6:{s:"C",n:"Carbon",c:"pt-cat-nonmetal",cat:"अधातु",m:"12.01",g:"समूह 14"},
  7:{s:"N",n:"Nitrogen",c:"pt-cat-nonmetal",cat:"अधातु",m:"14.01",g:"समूह 15"},
  8:{s:"O",n:"Oxygen",c:"pt-cat-nonmetal",cat:"अधातु",m:"16.00",g:"समूह 16"},
  9:{s:"F",n:"Fluorine",c:"pt-cat-halogen",cat:"हैलोजन",m:"18.99",g:"समूह 17"},
  10:{s:"Ne",n:"Neon",c:"pt-cat-noble",cat:"नोबल गैस",m:"20.18",g:"समूह 18"},
  11:{s:"Na",n:"Sodium",c:"pt-cat-alkali",cat:"क्षारीय धातु",m:"22.99",g:"समूह 1"},
  12:{s:"Mg",n:"Magnesium",c:"pt-cat-alkaline",cat:"क्षारीय मृदा धातु",m:"24.31",g:"समूह 2"},
  13:{s:"Al",n:"Aluminium",c:"pt-cat-post",cat:"उत्तर-संक्रमण धातु",m:"26.98",g:"समूह 13"},
  14:{s:"Si",n:"Silicon",c:"pt-cat-metalloid",cat:"उपधातु",m:"28.09",g:"समूह 14"},
  15:{s:"P",n:"Phosphorus",c:"pt-cat-nonmetal",cat:"अधातु",m:"30.97",g:"समूह 15"},
  16:{s:"S",n:"Sulphur",c:"pt-cat-nonmetal",cat:"अधातु",m:"32.06",g:"समूह 16"},
  17:{s:"Cl",n:"Chlorine",c:"pt-cat-halogen",cat:"हैलोजन",m:"35.45",g:"समूह 17"},
  18:{s:"Ar",n:"Argon",c:"pt-cat-noble",cat:"नोबल गैस",m:"39.95",g:"समूह 18"},
  19:{s:"K",n:"Potassium",c:"pt-cat-alkali",cat:"क्षारीय धातु",m:"39.10",g:"समूह 1"},
  20:{s:"Ca",n:"Calcium",c:"pt-cat-alkaline",cat:"क्षारीय मृदा धातु",m:"40.08",g:"समूह 2"},
  21:{s:"Sc",n:"Scandium",c:"pt-cat-transition",cat:"संक्रमण धातु",m:"44.96",g:"समूह 3"},
  22:{s:"Ti",n:"Titanium",c:"pt-cat-transition",cat:"संक्रमण धातु",m:"47.87",g:"समूह 4"},
  23:{s:"V",n:"Vanadium",c:"pt-cat-transition",cat:"संक्रमण धातु",m:"50.94",g:"समूह 5"},
  24:{s:"Cr",n:"Chromium",c:"pt-cat-transition",cat:"संक्रमण धातु",m:"52.00",g:"समूह 6"},
  25:{s:"Mn",n:"Manganese",c:"pt-cat-transition",cat:"संक्रमण धातु",m:"54.94",g:"समूह 7"},
  26:{s:"Fe",n:"Iron",c:"pt-cat-transition",cat:"संक्रमण धातु",m:"55.85",g:"समूह 8"},
  27:{s:"Co",n:"Cobalt",c:"pt-cat-transition",cat:"संक्रमण धातु",m:"58.93",g:"समूह 9"},
  28:{s:"Ni",n:"Nickel",c:"pt-cat-transition",cat:"संक्रमण धातु",m:"58.69",g:"समूह 10"},
  29:{s:"Cu",n:"Copper",c:"pt-cat-transition",cat:"संक्रमण धातु",m:"63.55",g:"समूह 11"},
  30:{s:"Zn",n:"Zinc",c:"pt-cat-transition",cat:"संक्रमण धातु",m:"65.38",g:"समूह 12"},
  31:{s:"Ga",n:"Gallium",c:"pt-cat-post",cat:"उत्तर-संक्रमण धातु",m:"69.72",g:"समूह 13"},
  32:{s:"Ge",n:"Germanium",c:"pt-cat-metalloid",cat:"उपधातु",m:"72.63",g:"समूह 14"},
  33:{s:"As",n:"Arsenic",c:"pt-cat-metalloid",cat:"उपधातु",m:"74.92",g:"समूह 15"},
  34:{s:"Se",n:"Selenium",c:"pt-cat-nonmetal",cat:"अधातु",m:"78.97",g:"समूह 16"},
  35:{s:"Br",n:"Bromine",c:"pt-cat-halogen",cat:"हैलोजन",m:"79.90",g:"समूह 17"},
  36:{s:"Kr",n:"Krypton",c:"pt-cat-noble",cat:"नोबल गैस",m:"83.80",g:"समूह 18"},
  37:{s:"Rb",n:"Rubidium",c:"pt-cat-alkali",cat:"क्षारीय धातु",m:"85.47",g:"समूह 1"},
  38:{s:"Sr",n:"Strontium",c:"pt-cat-alkaline",cat:"क्षारीय मृदा धातु",m:"87.62",g:"समूह 2"},
  39:{s:"Y",n:"Yttrium",c:"pt-cat-transition",cat:"संक्रमण धातु",m:"88.91",g:"समूह 3"},
  40:{s:"Zr",n:"Zirconium",c:"pt-cat-transition",cat:"संक्रमण धातु",m:"91.22",g:"समूह 4"},
  41:{s:"Nb",n:"Niobium",c:"pt-cat-transition",cat:"संक्रमण धातु",m:"92.91",g:"समूह 5"},
  42:{s:"Mo",n:"Molybdenum",c:"pt-cat-transition",cat:"संक्रमण धातु",m:"95.95",g:"समूह 6"},
  43:{s:"Tc",n:"Technetium",c:"pt-cat-transition",cat:"संक्रमण धातु",m:"98",g:"समूह 7"},
  44:{s:"Ru",n:"Ruthenium",c:"pt-cat-transition",cat:"संक्रमण धातु",m:"101.1",g:"समूह 8"},
  45:{s:"Rh",n:"Rhodium",c:"pt-cat-transition",cat:"संक्रमण धातु",m:"102.9",g:"समूह 9"},
  46:{s:"Pd",n:"Palladium",c:"pt-cat-transition",cat:"संक्रमण धातु",m:"106.4",g:"समूह 10"},
  47:{s:"Ag",n:"Silver",c:"pt-cat-transition",cat:"संक्रमण धातु",m:"107.9",g:"समूह 11"},
  48:{s:"Cd",n:"Cadmium",c:"pt-cat-transition",cat:"संक्रमण धातु",m:"112.4",g:"समूह 12"},
  49:{s:"In",n:"Indium",c:"pt-cat-post",cat:"उत्तर-संक्रमण धातु",m:"114.8",g:"समूह 13"},
  50:{s:"Sn",n:"Tin",c:"pt-cat-post",cat:"उत्तर-संक्रमण धातु",m:"118.7",g:"समूह 14"},
  51:{s:"Sb",n:"Antimony",c:"pt-cat-metalloid",cat:"उपधातु",m:"121.8",g:"समूह 15"},
  52:{s:"Te",n:"Tellurium",c:"pt-cat-metalloid",cat:"उपधातु",m:"127.6",g:"समूह 16"},
  53:{s:"I",n:"Iodine",c:"pt-cat-halogen",cat:"हैलोजन",m:"126.9",g:"समूह 17"},
  54:{s:"Xe",n:"Xenon",c:"pt-cat-noble",cat:"नोबल गैस",m:"131.3",g:"समूह 18"},
  55:{s:"Cs",n:"Caesium",c:"pt-cat-alkali",cat:"क्षारीय धातु",m:"132.9",g:"समूह 1"},
  56:{s:"Ba",n:"Barium",c:"pt-cat-alkaline",cat:"क्षारीय मृदा धातु",m:"137.3",g:"समूह 2"},
  57:{s:"La",n:"Lanthanum",c:"pt-cat-lanth",cat:"लैंथेनाइड",m:"138.9",g:"फलक 6+3"},
  72:{s:"Hf",n:"Hafnium",c:"pt-cat-transition",cat:"संक्रमण धातु",m:"178.5",g:"समूह 4"},
  73:{s:"Ta",n:"Tantalum",c:"pt-cat-transition",cat:"संक्रमण धातु",m:"180.9",g:"समूह 5"},
  74:{s:"W",n:"Tungsten",c:"pt-cat-transition",cat:"संक्रमण धातु",m:"183.8",g:"समूह 6"},
  75:{s:"Re",n:"Rhenium",c:"pt-cat-transition",cat:"संक्रमण धातु",m:"186.2",g:"समूह 7"},
  76:{s:"Os",n:"Osmium",c:"pt-cat-transition",cat:"संक्रमण धातु",m:"190.2",g:"समूह 8"},
  77:{s:"Ir",n:"Iridium",c:"pt-cat-transition",cat:"संक्रमण धातु",m:"192.2",g:"समूह 9"},
  78:{s:"Pt",n:"Platinum",c:"pt-cat-transition",cat:"संक्रमण धातु",m:"195.1",g:"समूह 10"},
  79:{s:"Au",n:"Gold",c:"pt-cat-transition",cat:"संक्रमण धातु",m:"197.0",g:"समूह 11"},
  80:{s:"Hg",n:"Mercury",c:"pt-cat-transition",cat:"संक्रमण धातु",m:"200.6",g:"समूह 12"},
  81:{s:"Tl",n:"Thallium",c:"pt-cat-post",cat:"उत्तर-संक्रमण धातु",m:"204.4",g:"समूह 13"},
  82:{s:"Pb",n:"Lead",c:"pt-cat-post",cat:"उत्तर-संक्रमण धातु",m:"207.2",g:"समूह 14"},
  83:{s:"Bi",n:"Bismuth",c:"pt-cat-post",cat:"उत्तर-संक्रमण धातु",m:"209.0",g:"समूह 15"},
  84:{s:"Po",n:"Polonium",c:"pt-cat-post",cat:"उत्तर-संक्रमण धातु",m:"209",g:"समूह 16"},
  85:{s:"At",n:"Astatine",c:"pt-cat-halogen",cat:"हैलोजन",m:"210",g:"समूह 17"},
  86:{s:"Rn",n:"Radon",c:"pt-cat-noble",cat:"नोबल गैस",m:"222",g:"समूह 18"},
  87:{s:"Fr",n:"Francium",c:"pt-cat-alkali",cat:"क्षारीय धातु",m:"223",g:"समूह 1"},
  88:{s:"Ra",n:"Radium",c:"pt-cat-alkaline",cat:"क्षारीय मृदा धातु",m:"226",g:"समूह 2"},
  89:{s:"Ac",n:"Actinium",c:"pt-cat-actinid",cat:"एक्टिनाइड",m:"227",g:"फलक 7+3"},
  104:{s:"Rf",n:"Rutherfordium",c:"pt-cat-transition",cat:"संक्रमण धातु",m:"—",g:"समूह 4"},
  105:{s:"Db",n:"Dubnium",c:"pt-cat-transition",cat:"संक्रमण धातु",m:"—",g:"समूह 5"},
  106:{s:"Sg",n:"Seaborgium",c:"pt-cat-transition",cat:"संक्रमण धातु",m:"—",g:"समूह 6"},
  107:{s:"Bh",n:"Bohrium",c:"pt-cat-transition",cat:"संक्रमण धातु",m:"—",g:"समूह 7"},
  108:{s:"Hs",n:"Hassium",c:"pt-cat-transition",cat:"संक्रमण धातु",m:"—",g:"समूह 8"},
  109:{s:"Mt",n:"Meitnerium",c:"pt-cat-transition",cat:"संक्रमण धातु",m:"—",g:"समूह 9"}
};

// Common class-10 asked elements with Hindi name
const ELEMENT_NAMES_HI = {
  H:"हाइड्रोजन", He:"हीलियम", C:"कार्बन", N:"नाइट्रोजन", O:"ऑक्सीजन",
  Na:"सोडियम", Mg:"मैग्नीशियम", Al:"एल्युमिनियम", Si:"सिलिकॉन", P:"फॉस्फोरस",
  S:"सल्फर", Cl:"क्लोरीन", K:"पोटैशियम", Ca:"कैल्शियम", Fe:"लोहा",
  Cu:"कॉपर", Zn:"जिंक", Ag:"सिल्वर", I:"आयोडीन", Au:"सोना",
  Pb:"सीसा", Hg:"पारा", Pt:"प्लैटिनम",
  F:"फ्लोरीन", Br:"ब्रोमीन", Ar:"आर्गन", Ne:"निऑन",
  Mn:"मैंगनीज़", Cr:"क्रोमियम", Co:"कोबाल्ट", Ni:"निकल"
};

// Thermodynamic + config data: mp/bp (°C), electron config, valence
const ELEMENT_THERMO = {
  H:{mp:-259,bp:-253,ec:"1",val:1}, He:{mp:-272,bp:-269,ec:"2",val:0},
  Li:{mp:180,bp:1342,ec:"2,1",val:1}, Be:{mp:1287,bp:2470,ec:"2,2",val:2},
  B:{mp:2076,bp:3927,ec:"2,3",val:3}, C:{mp:3642,bp:4827,ec:"2,4",val:4},
  N:{mp:-210,bp:-196,ec:"2,5",val:3}, O:{mp:-218,bp:-183,ec:"2,6",val:2},
  F:{mp:-220,bp:-188,ec:"2,7",val:1}, Ne:{mp:-249,bp:-246,ec:"2,8",val:0},
  Na:{mp:98,bp:883,ec:"2,8,1",val:1}, Mg:{mp:650,bp:1090,ec:"2,8,2",val:2},
  Al:{mp:660,bp:2519,ec:"2,8,3",val:3}, Si:{mp:1414,bp:3265,ec:"2,8,4",val:4},
  P:{mp:44,bp:280,ec:"2,8,5",val:3}, S:{mp:115,bp:445,ec:"2,8,6",val:2},
  Cl:{mp:-101,bp:-34,ec:"2,8,7",val:1}, Ar:{mp:-189,bp:-186,ec:"2,8,8",val:0},
  K:{mp:64,bp:759,ec:"2,8,8,1",val:1}, Ca:{mp:842,bp:1484,ec:"2,8,8,2",val:2},
  Sc:{mp:1541,bp:2836,ec:"2,8,9,2",val:3}, Ti:{mp:1668,bp:3287,ec:"2,8,10,2",val:4},
  V:{mp:1910,bp:3407,ec:"2,8,11,2",val:5}, Cr:{mp:1907,bp:2671,ec:"2,8,13,1",val:2},
  Mn:{mp:1246,bp:2061,ec:"2,8,13,2",val:2}, Fe:{mp:1538,bp:2861,ec:"2,8,14,2",val:2},
  Co:{mp:1495,bp:2927,ec:"2,8,15,2",val:2}, Ni:{mp:1455,bp:2913,ec:"2,8,16,2",val:2},
  Cu:{mp:1085,bp:2562,ec:"2,8,18,1",val:1}, Zn:{mp:420,bp:907,ec:"2,8,18,2",val:2},
  Ga:{mp:30,bp:2204,ec:"2,8,18,3",val:3}, Ge:{mp:938,bp:2833,ec:"2,8,18,4",val:4},
  As:{mp:817,bp:614,ec:"2,8,18,5",val:3}, Se:{mp:221,bp:685,ec:"2,8,18,6",val:2},
  Br:{mp:-7,bp:59,ec:"2,8,18,7",val:1}, Kr:{mp:-157,bp:-153,ec:"2,8,18,8",val:0},
  Rb:{mp:39,bp:688,ec:"2,8,18,8,1",val:1}, Sr:{mp:777,bp:1382,ec:"2,8,18,8,2",val:2},
  Y:{mp:1526,bp:3345,ec:"2,8,18,9,2",val:3}, Zr:{mp:1855,bp:4409,ec:"2,8,18,10,2",val:4},
  Nb:{mp:2477,bp:4744,ec:"2,8,18,12,1",val:5}, Mo:{mp:2623,bp:4639,ec:"2,8,18,13,1",val:5},
  Tc:{mp:2157,bp:4265,ec:"2,8,18,13,2",val:4}, Ru:{mp:2334,bp:4150,ec:"2,8,18,15,1",val:4},
  Rh:{mp:1964,bp:3695,ec:"2,8,18,16,1",val:3}, Pd:{mp:1555,bp:2963,ec:"2,8,18,18",val:0},
  Ag:{mp:962,bp:2162,ec:"2,8,18,18,1",val:1}, Cd:{mp:321,bp:767,ec:"2,8,18,18,2",val:2},
  In:{mp:157,bp:2072,ec:"2,8,18,18,3",val:3}, Sn:{mp:232,bp:2602,ec:"2,8,18,18,4",val:4},
  Sb:{mp:631,bp:1587,ec:"2,8,18,18,5",val:3}, Te:{mp:450,bp:988,ec:"2,8,18,18,6",val:2},
  I:{mp:114,bp:184,ec:"2,8,18,18,7",val:1}, Xe:{mp:-112,bp:-108,ec:"2,8,18,18,8",val:0},
  Cs:{mp:29,bp:671,ec:"2,8,18,18,8,1",val:1}, Ba:{mp:727,bp:1897,ec:"2,8,18,18,8,2",val:2},
  La:{mp:920,bp:3464,ec:"2,8,18,18,9,2",val:3}, Hf:{mp:2233,bp:4603,ec:"2,8,18,32,10,2",val:4},
  Ta:{mp:3017,bp:5458,ec:"2,8,18,32,11,2",val:5}, W:{mp:3422,bp:5555,ec:"2,8,18,32,12,2",val:6},
  Re:{mp:3186,bp:5596,ec:"2,8,18,32,13,2",val:6}, Os:{mp:3033,bp:5012,ec:"2,8,18,32,14,2",val:6},
  Ir:{mp:2446,bp:4428,ec:"2,8,18,32,15,2",val:6}, Pt:{mp:1768,bp:3825,ec:"2,8,18,32,17,1",val:4},
  Au:{mp:1064,bp:2856,ec:"2,8,18,32,18,1",val:1}, Hg:{mp:-39,bp:357,ec:"2,8,18,32,18,2",val:2},
  Tl:{mp:304,bp:1473,ec:"2,8,18,32,18,3",val:3}, Pb:{mp:327,bp:1749,ec:"2,8,18,32,18,4",val:4},
  Bi:{mp:271,bp:1564,ec:"2,8,18,32,18,5",val:3}, Po:{mp:254,bp:962,ec:"2,8,18,32,18,6",val:2},
  At:{mp:302,bp:337,ec:"2,8,18,32,18,7",val:1}, Rn:{mp:-71,bp:-62,ec:"2,8,18,32,18,8",val:0},
  Fr:{mp:27,bp:677,ec:"2,8,18,32,18,8,1",val:1}, Ra:{mp:700,bp:1737,ec:"2,8,18,32,18,8,2",val:2},
  Ac:{mp:1050,bp:3200,ec:"2,8,18,32,18,9,2",val:3}
};

// Uses & facts for important elements (Hindi)
const ELEMENT_EXTRA = {
  H:{use:"हाइड्रोजन पानी (H₂O) का हिस्सा है। अमोनिया बनाने, पेट्रोल को शुद्ध करने और हाइड्रोजन बम में प्रयोग होता है।", fact:"ब्रह्मांड में सबसे हल्का और सबसे ज्यादा पाया जाने वाला तत्व।"},
  He:{use:"गुब्बारे भरने (हवा से हल्का), MRI मशीन की कूलिंग में।", fact:"दो इलेक्ट्रॉन भरने पर बिल्कुल stable — इसलिए बहुत inner (निष्क्रिय)।"},
  C:{use:"हीरा, ग्रेफाइट, कोयला सब कार्बन के रूप हैं। जीवन का आधार।", fact:"कार्बन सिर्फ कार्बन-कार्बन से लंबी चेन बना सकता है — इसीलिए लाखों organic यौगिक।"},
  N:{use:"वायु का 78% हिस्सा। अमोनिया, उर्वरक (फर्टिलाइजर) बनाने में।", fact:"नाइट्रोजन बहुत dull (निष्क्रिय) है — इसीलिए चिप्स के पैकेट में भरते हैं ताकि खाना ताज़ा रहे।"},
  O:{use:"साँस लेने, जलाने (combustion) और जंग लगाने (oxidation) में।", fact:"हवा में 21% ऑक्सीजन — जलने के लिए सबसे जरूरी तत्व।"},
  F:{use:"टूथपेस्ट में फ्लोराइड, पानी शुद्ध करने में।", fact:"सबसे ज्यादा reactive (प्रतिक्रियाशील) तत्व।"},
  Ne:{use:"विज्ञापनों की नियोन लाइट में लाल चमक।", fact:"कीमती (inert) गैस — इसलिए टूटने और जलने दोनों से बचती है।"},
  Na:{use:"नमक (NaCl), बेकिंग सोडा, कास्टिक सोडा (NaOH)।", fact:"पानी में डालो तो जोर से आग पकड़ सकता है — बहुत reactive धातु, मिट्टी के तेल में रखी जाती है।"},
  Mg:{use:"फोटो फ्लैश, आतिशबाजी, हल्के मिश्र धातु।", fact:"हवा में जलकर चकाचौंध रोशनी देता है।"},
  Al:{use:"बर्तन, पन्नी, aircraft, बिजली के तार।", fact:"धरती की पपड़ी में सबसे ज्यादा धातु (8.1%) सबसे अलग हथियार में।"},
  Si:{use:"कंप्यूटर चिप, सोलर पैनल, glass, रेत।", fact:"कंप्यूटर का दिमाग silicon से बनता है।"},
  P:{use:"माचिस (matchstick), उर्वरक, दाँत की हड्डी।", fact:"सफेद फॉस्फोरस अंधेरे में चमकता है।"},
  S:{use:"माचिस, रबर (vulcanization), सल्फ्यूरिक अम्ल।", fact:"पीला, भंगुर अधातु जो हवा में जलकर चोकिंग गैस (SO₂) देता है।"},
  Cl:{use:"पानी साफ करना, कपड़े ब्लीच (सफेद) करना।", fact:"गैस, बहुत इरिटैटिंग गंध वाली।"},
  K:{use:"उर्वरक (fertilizer), नाइट्रेट मटेरियल में।", fact:"सोडियम जैसी reactive धातु।"},
  Ca:{use:"चूना (lime), सीमेंट, हड्डियाँ और दाँत बनने में।", fact:"दूध में सबसे ज्यादा कैल्शियम।"},
  Fe:{use:"इमारत, रेल पटरी, कार, ट्रक — सबसे ज्यादा इस्तेमाल धातु।", fact:"जंग लगाना (rusting) = Fe + ऑक्सीजन + पानी।"},
  Cu:{use:"बिजली के तार, सिक्के, बर्तन।", fact:"बहुत अच्छा कंडक्टर, दूसरे नंबर पर सिर्फ चांदी के बाद।"},
  Zn:{use:"लोहे को जंग से बचाना (galvanizing), बैटरी।", fact:"जिंक की परत लगाने से लोहे में जंग नहीं लगती।"},
  Br:{use:"फोटो फिल्म, दवाइयाँ, कीटनाशक।", fact:"कमरे के ताप पर तरल (liquid) रहने वाला सिर्फ एक आधातु — mercury और bromine के सिवा सब solid।"},
  Ag:{use:"जेवर, बिजली का सबसे अच्छा कंडक्टर, दर्पण।", fact:"सबसे अच्छा conductor।"},
  I:{use:"नमक में आयोडीन (thyroid के लिए जरूरी), tincture iodine।", fact:"गर्म करने पर बिना पिघले सीधे भाप (सब्लिमेशन)।"},
  Hg:{use:"थर्मामीटर (पारा), barometer।", fact:"कमरे के ताप पर तरल धातु — चमकदार silver रंग।"},
  Pb:{use:"बैटरी, विकिरण सुरक्षा (radiation shield)।", fact:"भारी और मुलायम so धातु से लिखते हैं।"},
  Pt:{use:"जेवर, कार के catalytic converter, प्रयोगशाला।", fact:"सबसे कीमती धातु, जंग नहीं लगती।"},
  Au:{use:"जेवर, सिक्के, इलेक्ट्रॉनिक्स।", fact:"बहुत मुलायम — 1g सोने को 1km लंबी पन्नी बनाया जा सकता है।"},
  Mn:{use:"स्टील को मजबूत करना (manganese steel), बैटरी।", fact:"स्टील में 1% Mn डालने से स्टील बहुत मजबूत हो जाता है।"},
  Cr:{use:"स्टेनलेस स्टील में चमक, कार की गाड़ी की पॉलिश।", fact:"स्टेनलेस स्टील = लोहा + क्रोमियम + निकल।"}
};

function renderPeriodicTable(el, infoEl) {
  if (!el) return;
  const data = PERIODIC_ELEMENTS;
  const layout = [
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
    [3,4,0,0,0,0,0,0,0,0,0,0,5,6,7,8,9,10],
    [11,12,0,0,0,0,0,0,0,0,0,0,13,14,15,16,17,18],
    [19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36],
    [37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54],
    [55,56,57,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86],
    [87,88,89,104,105,106,107,108,109,0,0,0,0,0,0,0,0,0]
  ];
  let html = '';
  html += '<div class="pt-control">' +
    '<div class="pt-control-head">' +
      '<div><b>🔥 तापमान स्लाइडर</b> — सराउंड-साउंड की तरह घुमाओ और देखो कौन-कौन से तत्व पिघलते या उबलते हैं</div>' +
      '<div class="pt-modes" id="ptModes">' +
        '<button class="pt-mode active" data-prop="mp" onclick="setTempProp(\'mp\')">🌡️ गलनांक</button>' +
        '<button class="pt-mode" data-prop="bp" onclick="setTempProp(\'bp\')">♨️ क्वथनांक</button>' +
        '<button class="pt-mode" data-prop="off" onclick="setTempProp(\'off\')">⬜ बंद</button>' +
      '</div>' +
    '</div>' +
    '<div class="pt-slider-row">' +
      '<span class="pt-temp-label">❄️ -300°C</span>' +
      '<input type="range" id="tempSlider" class="pt-slider" min="-300" max="3600" step="10" value="25" oninput="updateTempFilter()">' +
      '<span class="pt-temp-label">🔥 3600°C</span>' +
      '<span class="pt-temp-value" id="tempVal">25°C</span>' +
    '</div>' +
    '<div class="pt-temp-note" id="tempNote">25°C = कमरे का सामान्य ताप। इस ताप पर ठोस/तरल/गैस की स्थिति देखो।</div>' +
  '</div>';
  html += '<table class="periodic-table">';
  layout.forEach(row => {
    html += '<tr>';
    row.forEach(z => {
      if (!z || !data[z]) { html += '<td class="pt-empty"></td>'; return; }
      const e = data[z];
      const th = ELEMENT_THERMO[e.s];
      const mp = th ? th.mp : '';
      const bp = th ? th.bp : '';
      // room-temp state badge
      let state = '';
      if (th) state = 'state-' + (mp > 25 ? (bp > 25 ? 'solid' : bp > -200 ? 'gassy' : 'solid') : (bp > 25 ? 'liquid' : 'gassy'));
      html += `<td class="${e.c} pt-cell ${state}" data-z="${z}" data-mp="${mp}" data-bp="${bp}" onclick="showElementInfo(${z})">
        <span class="pt-num">${z}</span>
        <span class="pt-sym">${e.s}</span>
        <span class="pt-name">${e.n}</span>
      </td>`;
    });
    html += '</tr>';
  });
  html += '</table>';
  html += '<div class="legend">' +
    '<span><i class="pt-cat-alkali"></i>क्षारीय धातु</span>' +
    '<span><i class="pt-cat-alkaline"></i>क्षारीय मृदा</span>' +
    '<span><i class="pt-cat-transition"></i>संक्रमण धातु</span>' +
    '<span><i class="pt-cat-post"></i>उत्तर-संक्रमण</span>' +
    '<span><i class="pt-cat-metalloid"></i>उपधातु</span>' +
    '<span><i class="pt-cat-nonmetal"></i>अधातु</span>' +
    '<span><i class="pt-cat-halogen"></i>हैलोजन</span>' +
    '<span><i class="pt-cat-noble"></i>नोबल गैस</span>' +
    '</div>';
  el.innerHTML = html;
  if (infoEl) infoEl.innerHTML = '<div class="callout callout-info">👆 किसी भी तत्व पर click करें — उसकी पूरी जानकारी यहाँ दिखेगी।<br>🌡️ ऊपर slider घुमाकर देखो — कौन सा तत्व किस ताप पर पिघलता या उबलता है।</div>';
}

// --- Slider logic ---
let tempProp = 'mp';

function setTempProp(p) {
  tempProp = p;
  document.querySelectorAll('.pt-mode').forEach(b => b.classList.toggle('active', b.dataset.prop === p));
  const slider = document.getElementById('tempSlider');
  const row = document.querySelector('.pt-slider-row');
  if (p === 'off') {
    if (slider) slider.disabled = true;
    if (row) row.classList.add('dimmed');
    document.querySelectorAll('.pt-cell').forEach(c => c.classList.remove('pt-hot', 'pt-cold'));
    const note = document.getElementById('tempNote');
    if (note) note.textContent = 'स्लाइडर बंद — सारे तत्व सामान्य रंग में।';
    return;
  }
  if (slider) { slider.disabled = false; if (row) row.classList.remove('dimmed'); }
  updateTempFilter();
}

function updateTempFilter() {
  const slider = document.getElementById('tempSlider');
  if (!slider) return;
  const temp = parseInt(slider.value, 10);
  const val = document.getElementById('tempVal');
  if (val) val.textContent = temp + '°C';
  if (tempProp === 'off') { setTempProp('off'); return; }

  const cells = document.querySelectorAll('.pt-cell');
  let hot = 0, cold = 0, unknown = 0;
  cells.forEach(c => {
    const t = (tempProp === 'mp' ? c.dataset.mp : c.dataset.bp);
    c.classList.remove('pt-hot', 'pt-cold');
    if (t === '') { c.classList.add('pt-unknown'); unknown++; return; }
    c.classList.remove('pt-unknown');
    if (temp >= parseInt(t, 10)) { c.classList.add('pt-hot'); hot++; }
    else { c.classList.add('pt-cold'); cold++; }
  });

  const note = document.getElementById('tempNote');
  if (note) {
    const names = (tempProp === 'mp')
      ? 'पिघल (melt) चुके तत्व'
      : 'उबल (boil) चुके तत्व';
    if (hot === 0) note.textContent = `${temp}°C पर बहुत कोई तत्व ${names} नहीं — slider आगे बढ़ाओ।`;
    else note.textContent = `🔥 ${hot} तत्व इस ताप पर ${names} (जल रहे/deep orange हैं); ${cold} अभी भी ${tempProp === 'mp' ? 'ठोस' : 'बिना उबले'}; ${unknown} के लिए आँकड़े नहीं।`;
  }
}

function stateHindi(mp, bp) {
  if (mp > 25 && bp > 25) return 'ठोस (Solid)';
  if (mp <= 25 && bp > 25) return 'तरल (Liquid)';
  return 'गैस (Gas)';
}

function showElementInfo(z) {
  const info = document.getElementById('elemInfo');
  if (!info) return;
  const e = PERIODIC_ELEMENTS[z];
  if (!e) { info.innerHTML = ''; return; }
  const hi = ELEMENT_NAMES_HI[e.s];
  const th = ELEMENT_THERMO[e.s];
  const ex = ELEMENT_EXTRA[e.s];

  let rows = `<div class="formula-item"><div class="flabel">हिंदी नाम</div><div class="fval">${hi || e.n}</div></div>
    <div class="formula-item"><div class="flabel">श्रेणी</div><div class="fval">${e.cat}</div></div>
    <div class="formula-item"><div class="flabel">स्थान</div><div class="fval">${e.g}</div></div>
    <div class="formula-item"><div class="flabel">परमाणु द्रव्यमान</div><div class="fval">${e.m} u</div></div>`;

  if (th) {
    rows += `
      <div class="formula-item"><div class="flabel">इलेक्ट्रॉन विन्यास (K,L,M,N..)</div><div class="fval">${th.ec}</div></div>
      <div class="formula-item"><div class="flabel">संयोजकता (Valency)</div><div class="fval">${th.val}</div></div>
      <div class="formula-item"><div class="flabel">🌡️ गलनांक (Melting point)</div><div class="fval">${th.mp} °C</div></div>
      <div class="formula-item"><div class="flabel">♨️ क्वथनांक (Boiling point)</div><div class="fval">${th.bp} °C</div></div>
      <div class="formula-item"><div class="flabel">कमरे के ताप पर अवस्था</div><div class="fval">${stateHindi(th.mp, th.bp)}</div></div>`;
  }
  if (ex) {
    rows += `<div class="callout callout-info mt-10">💰 <b>प्रयोग (Uses):</b> ${ex.use}</div>
      <div class="callout callout-tip mt-10">💡 <b>रोचक तथ्य (Fact):</b> ${ex.fact}</div>`;
  }

  info.innerHTML = `<div class="grid-2">
    <div>
      <h2 style="font-size:30px">${e.s} (${z}) <span class="muted" style="font-size:20px">${e.n}</span></h2>
      <div class="mt-20">${rows}</div>
    </div>
  </div>`;
}

function renderAllElementsList(el) {
  if (!el) return;
  let html = '<div class="grid-2 mt-20">';
  for (const z in PERIODIC_ELEMENTS) {
    const e = PERIODIC_ELEMENTS[z];
    const hi = ELEMENT_NAMES_HI[e.s];
    const th = ELEMENT_THERMO[e.s];
    html += `<div class="f-card" style="margin-bottom:0">
      <b style="font-size:22px">${e.s}</b> <span class="muted">(${z})</span><br>
      <span>${e.n}</span> — <b>${hi || ''}</b><br>
      <span class="muted">${e.cat} • ${e.g}${th ? ' • गलनांक ' + th.mp + '°C' : ''}</span>
    </div>`;
  }
  html += '</div>';
  el.innerHTML = html;
}

// export for tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PERIODIC_ELEMENTS, ELEMENT_THERMO, ELEMENT_EXTRA, renderPeriodicTable, showElementInfo, renderAllElementsList, setTempProp, updateTempFilter };
}