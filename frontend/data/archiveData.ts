import { 
  ArchivalDocument, TimelineEvent, MediaItem, ResearchAnswer, HistoricalPhoto,
  KnowledgeGraphNode, KnowledgeGraphLink, GuidedStoryPath, DocComparisonPreset, OCRJobRecord
} from '../types';

export const HERO_IMAGE = '/images/ambedkar_archive_hero_1790176060286.jpg';
export const MAHAD_IMAGE = '/images/mahad_satyagraha_archive_1790176078736.jpg';
export const ASSEMBLY_IMAGE = '/images/constituent_assembly_hall_1790176093139.jpg';
export const RAJGRUHA_LIBRARY_IMAGE = '/images/ambedkar_rajgruha_library_1790182019374.jpg';
export const DRAFTING_CONSTITUTION_IMAGE = '/images/ambedkar_drafting_constitution_1790182039282.jpg';
export const ROUND_TABLE_IMAGE = '/images/ambedkar_round_table_1790182055124.jpg';
export const LAW_MINISTER_IMAGE = '/images/ambedkar_law_minister_1790182070157.jpg';
export const NAGPUR_DEEKSHA_IMAGE = '/images/ambedkar_nagpur_deeksha_1790182086774.jpg';


export const ARCHIVE_DOCUMENTS: ArchivalDocument[] = [
  {
    id: 'annihilation-of-caste',
    title: 'Annihilation of Caste',
    titleLocal: {
      hi: 'जाति का विनाश',
      mr: 'जातीचा विनाश'
    },
    type: 'book',
    categoryLabel: 'Book & Treatise',
    date: 'May 1936',
    year: 1936,
    collection: 'Dr. Babasaheb Ambedkar: Writings and Speeches (BAWS Vol. 1)',
    language: 'English (Orig.) / Hindi / Marathi',
    source: 'Jat-Pat-Todak Mandal Conference, Lahore (Undelivered Address)',
    accessionNo: 'ARC-1936-BAWS-001',
    shortDescription: "One of Dr. Ambedkar's most influential and foundational works on the anatomy of caste hierarchy, social reform, and human dignity.",
    shortDescriptionLocal: {
      hi: "जाति व्यवस्था, सामाजिक सुधार और मानवीय गरिमा के विच्छेदन पर डॉ. आंबेडकर की सबसे प्रभावशाली व युगांतरकारी कृति।",
      mr: "जातीव्यवस्था, सामाजिक सुधारणा आणि मानवी प्रतिष्ठेच्या संरचनेवरील डॉ. आंबेडकरांची अत्यंत प्रभावशाली व मूलभूत कृती."
    },
    fullText: `You cannot build anything on the foundations of caste. You cannot build up a nation, you cannot build up an ethical morality. Anything that you will build on the foundations of caste will crack and will never be a whole.

The path of social reform like the path to heaven at any rate in India is trodden by only a few. There is a reason for this. In the first place, the social system embodies the will of the dominant class, and the dominant class has a vested interest in the maintenance of that system.

Caste is not just a division of labour, it is a division of labourers. It is a hierarchy in which the divisions of labourers are graded one above the other. In no other country is the division of labour accompanied by this unnatural division of labourers into water-tight compartments.

The real remedy for breaking Caste is inter-marriage. Nothing else will serve as the solvent of Caste. It is not possible to break Caste without breaking the religious notions upon which the Caste system is founded. You must have courage to tell the Hindus that what is wrong with them is their religion—the religion which has produced this social system.`,
    fullTextLocal: {
      hi: `आप जाति की नींव पर कुछ भी नहीं बना सकते। आप न राष्ट्र का निर्माण कर सकते हैं, न ही नैतिक आचार-विचार का। जो कुछ भी आप जाति की नींव पर बनाएंगे, वह दरक जाएगा और कभी भी पूर्ण नहीं होगा।

जाति केवल श्रम का विभाजन नहीं है, बल्कि यह श्रमिकों का विभाजन है। यह एक ऐसा पदानुक्रम है जिसमें श्रमिकों के समूहों को एक दूसरे के ऊपर क्रमित किया गया है। विश्व के किसी अन्य देश में श्रम विभाजन के साथ श्रमिकों का ऐसा अस्वाभाविक विभाजन नहीं है।

जाति-उन्मूलन का सच्चा उपचार अंतर्जातीय विवाह और उन धार्मिक मान्यताओं को चुनौती देना है जिन पर यह व्यवस्था टिकी है।`,
      mr: `जातीच्या पायावर तुम्ही काहीही उभे करू शकत नाही. तुम्ही राष्ट्र उभारू शकत नाही, तुम्ही नैतिक मूल्यांची उभारणी करू शकत नाही. जातीच्या पायावर तुम्ही जे काही निर्माण कराल, त्याला तडे जातील.

जात ही केवळ श्रमांची विभागणी नाही, तर ती श्रमिकांची विभागणी आहे. हा असा उतरंड आहे ज्यात श्रमिकांना एकमेकांच्या वर विषमतेच्या पायरीवर ठेवले गेले आहे. 

जात नष्ट करण्याचा खरा मार्ग म्हणजे आंतरजातीय विवाह आणि ज्या धार्मिक संकल्पनांवर जात आधारलेली आहे त्यांचे विसर्जन करणे हाच आहे.`
    },
    ocrConfidence: 99.4,
    keyTopics: ['Caste Abolition', 'Social Equality', 'Human Rights', 'Moral Philosophy', 'Fraternity'],
    aiSummary: {
      en: "Annihilation of Caste (1936) argues that caste is not merely an occupational division of labour but an unnatural division of labourers stratified into a rigid hierarchy. Dr. Ambedkar demonstrates that national unity, democracy, and ethical fraternity cannot coexist with caste, asserting that religious sanction must be eradicated to liberate society.",
      hi: "'जाति का विनाश' (1936) में तर्क दिया गया है कि जाति केवल श्रम विभाजन नहीं बल्कि श्रमिकों का अमानवीय श्रेणीबद्ध विभाजन है। डॉ. आंबेडकर ने सिद्ध किया कि बिना सामाजिक लोकतंत्र व समता के राष्ट्रीय एकता असंभव है।",
      mr: "'जातीचा विनाश' (1936) या ग्रंथात डॉ. आंबेडकर स्पष्ट करतात की जात केवळ कामाची विभागणी नसून माणसांची उतरंड आहे. जातीचा समूळ नायनाट केल्याशिवाय लोकशाही व सामाजिक समता शक्य नाही."
    },
    relatedDocumentIds: ['castes-in-india-1916', 'constituent-assembly-speech-1949', 'states-and-minorities-1947'],
    audioDuration: '14 min audio excerpt',
    location: 'Lahore / Mumbai Archive'
  },
  {
    id: 'constituent-assembly-speech-1949',
    title: 'Constituent Assembly Debates: Speech on the Adoption of the Constitution',
    titleLocal: {
      hi: 'संविधान सभा वाद-विवाद: संविधान अंगीकरण पर ऐतिहासिक भाषण',
      mr: 'घटना समिती वादविवाद: राज्यघटना स्वीकृतीवरील ऐतिहासिक भाषण'
    },
    type: 'debate',
    categoryLabel: 'Constitutional Debate',
    date: 'November 25, 1949',
    year: 1949,
    collection: 'Constituent Assembly of India Debates (Vol. XI)',
    language: 'English',
    source: 'Parliament House, New Delhi (Official Debates Record)',
    accessionNo: 'CAD-1949-VOL-11-25',
    shortDescription: "The landmark address warning the nation against political democracy without social and economic democracy, coining the metaphor of 'entering into a life of contradictions'.",
    shortDescriptionLocal: {
      hi: "सामाजिक और आर्थिक लोकतंत्र के बिना राजनीतिक लोकतंत्र की सीमाओं पर राष्ट्र को आगाह करने वाला ऐतिहासिक 'विरोधाभासों का जीवन' भाषण।",
      mr: "सामाजिक आणि आर्थिक लोकशाहीशिवाय केवळ राजकीय लोकशाहीच्या मर्यादांवर देशाला सावध करणारे ऐतिहासिक भाषण."
    },
    fullText: `On the 26th of January 1950, we are going to enter into a life of contradictions. In politics we will have equality and in social and economic life we will have inequality. In politics we will be recognising the principle of one man one vote and one vote one value. In our social and economic life, we shall, by reason of our social and economic structure, continue to deny the principle of one man one value.

How long shall we continue to live this life of contradictions? How long shall we continue to deny equality in our social and economic life? If we continue to deny it for long, we will do so only by putting our political democracy in peril. We must remove this contradiction at the earliest possible moment or else those who suffer from inequality will blow up the structure of political democracy which this Assembly has so laboriously built up.

Political democracy cannot last unless there lies at the base of it social democracy. What does social democracy mean? It means a way of life which recognises liberty, equality and fraternity as the principles of life. These principles of liberty, equality and fraternity are not to be treated as separate items in a trinity. They form a union of trinity in the sense that to divorce one from the other is to defeat the very purpose of democracy.`,
    fullTextLocal: {
      hi: `26 जनवरी 1950 को हम एक विरोधाभासी जीवन में प्रवेश करने जा रहे हैं। राजनीति में हमारे पास समानता होगी, लेकिन सामाजिक और आर्थिक जीवन में हमारे पास असमानता होगी। राजनीति में हम 'एक व्यक्ति, एक मत' और 'एक मत, एक मूल्य' के सिद्धांत को मान्यता देंगे। अपने सामाजिक और आर्थिक जीवन में, हम 'एक व्यक्ति, एक मूल्य' के सिद्धांत को नकारते रहेंगे।

हम कब तक विरोधाभासों का यह जीवन जीते रहेंगे? यदि हमने इसे लंबे समय तक नकारा, तो यह हमारे राजनीतिक लोकतंत्र को संकट में डाल देगा। हमें इस विरोधाभास को शीघ्र समाप्त करना होगा।`,
      mr: `२६ जानेवारी १९५० रोजी आपण एका विरोधाभासांच्या आयुष्यात प्रवेश करणार आहोत. राजकारणात आपल्याकडे समानता असेल, पण सामाजिक आणि आर्थिक जीवनात विषमता असेल.

राजकीय लोकशाहीच्या मुळाशी जोपर्यंत सामाजिक लोकशाही नसेल, तोपर्यंत ती टिकू शकत नाही. सामाजिक लोकशाही म्हणजे स्वातंत्र्य, समता आणि बंधुता यांना जीवनाची अविभाज्य त्रयी म्हणून स्वीकारणे.`
    },
    ocrConfidence: 99.8,
    keyTopics: ['Constitutional Democracy', 'Social Democracy', 'Fraternity', 'One Man One Value', 'Fundamental Rights'],
    aiSummary: {
      en: "In his final Constituent Assembly address, Dr. Ambedkar warned that political democracy with universal suffrage is fragile unless supported by social and economic democracy. He emphasized that liberty, equality, and fraternity form an inseparable trinity required to sustain the Republic.",
      hi: "संविधान सभा के अपने अंतिम भाषण में डॉ. आंबेडकर ने चेतावनी दी कि यदि सामाजिक और आर्थिक विषमता नहीं मिटी, तो पीड़ित वर्ग लोकतंत्र के इस ढांचे को ध्वस्त कर देगा।",
      mr: "आपल्या अंतिम भाषणात डॉ. आंबेडकरांनी स्पष्ट इशारा दिला की सामाजिक व आर्थिक विषमतेचे उच्चाटन झाल्याशिवाय राजकीय लोकशाही चिरंतन टिकू शकत नाही."
    },
    relatedDocumentIds: ['article-32-debate-1948', 'states-and-minorities-1947', 'annihilation-of-caste'],
    thumbnailUrl: ASSEMBLY_IMAGE,
    audioDuration: '22 min speech audio',
    location: 'Constituent Assembly Chamber, New Delhi'
  },
  {
    id: 'article-32-debate-1948',
    title: 'Constituent Assembly Debates: Article 32 as the Heart and Soul of the Constitution',
    titleLocal: {
      hi: 'संविधान सभा वाद-विवाद: अनुच्छेद 32 संविधान का हृदय और आत्मा',
      mr: 'घटना समिती वादविवाद: कलम ३२ राज्यघटनेचा आत्मा व हृदय'
    },
    type: 'debate',
    categoryLabel: 'Constitutional Debate',
    date: 'December 9, 1948',
    year: 1948,
    collection: 'Constituent Assembly of India Debates (Vol. VII)',
    language: 'English',
    source: 'Constituent Assembly Official Proceedings, New Delhi',
    accessionNo: 'CAD-1948-VOL-07-32',
    shortDescription: "Dr. Ambedkar's definitive exposition declaring the right to constitutional remedies as the most fundamental provision protecting citizen liberties against state encroachment.",
    shortDescriptionLocal: {
      hi: "संवैधानिक उपचारों के अधिकार (अनुच्छेद 32) को संविधान का हृदय एवं आत्मा घोषित करने वाला युगांतरकारी विमर्श।",
      mr: "घटनात्मक उपाययोजनांच्या अधिकाराला (कलम ३२) संविधानाचा आत्मा घोषित करणारे ऐतिहासिक विवेचन."
    },
    fullText: `If I was asked to name any particular article in this Constitution as the most important—an article without which this Constitution would be a nullity—I could not refer to any other article except this one. It is the very soul of the Constitution and the very heart of it and I am glad that the House has realised its importance.

Hereafter it would not be possible for any legislature to take away the rights which are conferred by the provisions contained in this Part. The provisions of this article stand on a very different footing. The Supreme Court is constituted as the protector and guarantor of fundamental rights.`,
    fullTextLocal: {
      hi: `यदि मुझसे पूछा जाए कि इस संविधान का सबसे महत्वपूर्ण अनुच्छेद कौन सा है, जिसके बिना यह संविधान शून्य हो जाएगा, तो मैं इस अनुच्छेद (32) के अलावा किसी अन्य का नाम नहीं ले सकता। यह संविधान की आत्मा और उसका हृदय है।`,
      mr: `जर मला विचारले की या संविधानातील सर्वात महत्त्वाचे कलम कोणते, ज्याशिवाय हे संविधान व्यर्थ ठरेल, तर मी कलम ३२ शिवाय इतर कशाचेही नाव घेणार नाही. हा संविधानाचा खराखुरा आत्मा आणि हृदय आहे.`
    },
    ocrConfidence: 99.6,
    keyTopics: ['Article 32', 'Fundamental Rights', 'Judicial Review', 'Writs', 'Rule of Law'],
    aiSummary: {
      en: "Dr. Ambedkar designated Article 32 (Right to Constitutional Remedies) as the supreme guarantee of citizen freedom, creating direct access to the Supreme Court for writ petitions and shielding fundamental rights from executive or legislative nullification.",
      hi: "डॉ. आंबेडकर ने अनुच्छेद 32 को नागरिकों के मौलिक अधिकारों की रक्षा हेतु सर्वोच्च न्यायालय द्वारा रिट जारी करने का अपरिवर्तनीय कवच और संविधान की आत्मा कहा।",
      mr: "डॉ. आंबेडकरांनी कलम ३२ ला मूलभूत हक्कांचे संरक्षण देणारे सर्वोच्च कवच मानले आणि त्याला संविधानाचा आत्मा म्हणून प्रस्थापित केले."
    },
    relatedDocumentIds: ['constituent-assembly-speech-1949', 'states-and-minorities-1947'],
    location: 'New Delhi'
  },
  {
    id: 'mahad-satyagraha-1927',
    title: 'Declaration at the Mahad Satyagraha (Chavdar Tale)',
    titleLocal: {
      hi: 'महाड सत्याग्रह घोषणापत्र (चवदार तालाब)',
      mr: 'महाड सत्याग्रह जाहीरनामा (चवदार तळे)'
    },
    type: 'speech',
    categoryLabel: 'Historical Speech',
    date: 'March 20, 1927',
    year: 1927,
    collection: 'Dr. Babasaheb Ambedkar: Writings and Speeches (BAWS Vol. 17, Part 1)',
    language: 'Marathi (Orig.) / English / Hindi',
    source: 'Mahad Conference Proceedings, Kolaba District',
    accessionNo: 'SPE-1927-MAHAD-001',
    shortDescription: "The clarion call establishing that the struggle for drinking water from Chavdar Tale was not merely for water, but for asserting universal human dignity and civic equality.",
    shortDescriptionLocal: {
      hi: "चवदार तालाब से पानी पीने का संघर्ष केवल प्यास बुझाने का नहीं, बल्कि मानव गरिमा और नागरिक समानता को सिद्ध करने का ऐतिहासिक आंदोलन था।",
      mr: "चवदार तळ्याचे पाणी पिण्याचा लढा केवळ तहान भागवण्यासाठी नसून माणसाचे माणूसपण व समतेचा हक्क प्रस्थापित करण्यासाठी होता."
    },
    fullText: `It is not that by drinking water from the Chavdar Tale we will become immortal. We have gone to the tank only to prove that we too are human beings like other human beings. This conference has been called to usher in a new era of equality.

Our struggle is not for the sake of water. It is for establishing our human rights, our self-respect, and our equality in the civic life of this nation. Until untouchability is annihilated, this country cannot claim to be civilised.`,
    fullTextLocal: {
      hi: `चवदार तालाब का पानी पीने से हम अमर नहीं हो जाएंगे। हम उस तालाब पर केवल यह सिद्ध करने गए हैं कि हम भी अन्य मनुष्यों की तरह इंसान हैं। यह आंदोलन केवल पानी के लिए नहीं, आत्मसम्मान और मानव अधिकारों की स्थापना के लिए है।`,
      mr: `चवदार तळ्याचे पाणी पिऊन आपण अमर होणार नाही. आम्ही त्या तळ्यावर केवळ हे सिद्ध करण्यासाठी गेलो आहोत की आम्हीसुद्धा इतर माणसांसारखीच माणसे आहोत. हा लढा पाण्यासाठी नसून मानवी हक्कांच्या आणि आत्मसन्मानाच्या पुनर्स्थापनेसाठी आहे.`
    },
    ocrConfidence: 98.9,
    keyTopics: ['Civil Rights', 'Human Dignity', 'Public Spaces', 'Water Rights', 'Satyagraha'],
    aiSummary: {
      en: "At Mahad in 1927, Dr. Ambedkar transformed civil resistance by demanding equal access to public drinking water, emphasizing that civic equality and human dignity take precedence over ritual purity codes.",
      hi: "महाड सत्याग्रह (1927) ने अस्पृश्यता के विरुद्ध आत्मसम्मान और सार्वजनिक संसाधनों पर समान अधिकार की ऐतिहासिक क्रांति की शुरुआत की।",
      mr: "महाड चवदार तळे सत्याग्रहाने मानवी हक्क आणि सामाजिक समतेच्या लढ्याला निर्णायक नैतिक आणि वैचारिक अधिष्ठान दिले."
    },
    relatedDocumentIds: ['annihilation-of-caste', 'castes-in-india-1916'],
    thumbnailUrl: MAHAD_IMAGE,
    audioDuration: '8 min historical reconstruction',
    location: 'Mahad, Maharashtra'
  },
  {
    id: 'problem-of-the-rupee-1923',
    title: 'The Problem of the Rupee: Its Origin and Its Solution',
    titleLocal: {
      hi: 'द प्रॉब्लम ऑफ द रूपी: इसका उद्भव और समाधान',
      mr: 'द प्रॉब्लेम ऑफ द रुपी: त्याचे उगम आणि निवारण'
    },
    type: 'book',
    categoryLabel: 'Economic Treatise',
    date: '1923',
    year: 1923,
    collection: 'London School of Economics Doctoral Thesis / P.S. King & Son',
    language: 'English',
    source: 'LSE Archives & British Library, London',
    accessionNo: 'ECO-1923-LSE-D01',
    shortDescription: "Dr. Ambedkar's pioneering monetary economics dissertation submitted to the University of London, which formed the foundational concepts for the establishment of the Reserve Bank of India.",
    shortDescriptionLocal: {
      hi: "लंदन स्कूल ऑफ इकोनॉमिक्स में प्रस्तुत उनका मौद्रिक शोधग्रंथ, जिसने भारतीय रिज़र्व बैंक (RBI) की स्थापना की वैचारिक आधारशिला रखी।",
      mr: "लंडन स्कूल ऑफ इकॉनॉमिक्समध्ये सादर केलेला प्रबंध, ज्याने भारतीय रिझर्व्ह बँकेच्या (RBI) स्थापनेचा पाया रचला."
    },
    fullText: `Trade is an exchange of goods for goods, and money is only a medium of exchange. A stable currency system is one that maintains stability of internal purchasing power rather than stability of foreign exchange rates alone.

The Indian currency system has suffered from frequent arbitrary tinkering by the colonial administration without regard to the real purchasing capacity of the agricultural producers and the working classes. A gold-bullion standard with automatic self-regulating mechanisms is essential to prevent currency manipulation.`,
    fullTextLocal: {
      hi: `एक स्थिर मुद्रा प्रणाली वह है जो केवल विदेशी विनिमय दरों की स्थिरता के बजाय आंतरिक क्रय शक्ति की स्थिरता को बनाए रखती है। भारतीय मुद्रा व्यवस्था को किसानों और मजदूरों की वास्तविक क्रय क्षमता के आधार पर विनियमित किया जाना चाहिए।`,
      mr: `स्थिर चलन प्रणाली ती असते जी केवळ परकीय विनिमय दरांच्या स्थिरतेऐवजी देशांतर्गत क्रयशक्तीची स्थिरता टिकवून ठेवते.`
    },
    ocrConfidence: 99.2,
    keyTopics: ['Monetary Economics', 'Currency Reform', 'Central Banking', 'RBI Foundations', 'Purchasing Power'],
    aiSummary: {
      en: "Published in 1923 from his D.Sc. thesis at LSE, this seminal economic treatise analyzed the instability of Indian currency under British rule. Dr. Ambedkar's evidence before the Hilton Young Commission directly influenced the conceptual design and creation of the Reserve Bank of India (RBI).",
      hi: "1923 में लंदन स्कूल ऑफ इकोनॉमिक्स से प्रकाशित यह ग्रंथ मुद्रा सुधार और मूल्य स्थिरता पर केंद्रित था, जिसने हिल्टन यंग कमीशन और भारतीय रिज़र्व बैंक के गठन को प्रेरित किया।",
      mr: "या प्रबंधात आंबेडकरांनी भारतीय चलनाचे अर्थशास्त्र मांडले. त्यांच्या शिफारशींवरून पुढे हिल्टन यंग कमिशन आणि रिझर्व्ह बँकेची संकल्पना अस्तित्वात आली."
    },
    relatedDocumentIds: ['castes-in-india-1916', 'annihilation-of-caste'],
    location: 'London / Mumbai'
  },
  {
    id: 'castes-in-india-1916',
    title: 'Castes in India: Their Mechanism, Genesis and Development',
    titleLocal: {
      hi: 'भारत में जातियां: उनकी कार्यप्रणाली, उद्भव और विकास',
      mr: 'भारतातील जाती: त्यांची यंत्रणा, उत्पत्ती आणि विकास'
    },
    type: 'manuscript',
    categoryLabel: 'Anthropological Paper',
    date: 'May 9, 1916',
    year: 1916,
    collection: 'Columbia University Anthropology Seminar of Dr. Alexander Goldenweiser',
    language: 'English',
    source: 'Columbia University Rare Book & Manuscript Library, New York',
    accessionNo: 'ANT-1916-COL-009',
    shortDescription: "Presented at Columbia University at age 25, this landmark academic paper identified endogamy as the core mechanism that turns open classes into closed castes.",
    shortDescriptionLocal: {
      hi: "कोलंबिया विश्वविद्यालय में 25 वर्ष की आयु में प्रस्तुत शोधपत्र, जिसमें अंतर-विवाह निषेध (Endogamy) को जाति निर्माण का मूल कारण सिद्ध किया गया।",
      mr: "कोलंबिया विद्यापीठात २५ व्या वर्षी सादर केलेला शोधनिबंध, ज्यात आंतरजातीय विवाहबंदी हीच जातीच्या निर्मितीची मुख्य यंत्रणा असल्याचे स्पष्ट केले."
    },
    fullText: `Caste in India is a very much more complicated phenomenon than is generally supposed. The superposition of endogamy on exogamy means the creation of caste. 

Endogamy is the only one characteristic that is peculiar to caste, and if we succeed in showing how endogamy is maintained, we shall have arrived at the solution of the problem of caste.

The closed door of the caste creates a contagion whereby other classes, to preserve their status, also close their doors. Thus an open-class society becomes stratified into a multitude of closed castes.`,
    fullTextLocal: {
      hi: `जाति की एकमात्र विशिष्ट पहचान अंतर-विवाह (Endogamy) का थोपा जाना है। एक वर्ग द्वारा अपने दरवाजे बंद कर लेने पर, अन्य वर्ग भी अपने दर्जे की रक्षा के लिए अपने द्वार बंद कर लेते हैं। इस प्रकार एक खुला समाज बंद जातियों में बंट जाता है।`,
      mr: `जातीचे मूळ लक्षण म्हणजे सजातीय विवाह पद्धती (Endogamy). एका वर्गाने दरवाजे बंद केले की इतर वर्गही स्वतःच्या संरक्षणासाठी दरवाजे बंद करतात, आणि यातून बंदिस्त जाती निर्माण होतात.`
    },
    ocrConfidence: 98.7,
    keyTopics: ['Endogamy', 'Social Anthropology', 'Caste Genesis', 'Columbia University', 'Social Stratification'],
    aiSummary: {
      en: "Written at Columbia University under anthropologist Alexander Goldenweiser, this paper analytically demonstrated that caste is 'an enclosed class' preserved through enforced endogamy (marriage strictly within the group), creating systemic social stratification.",
      hi: "कोलंबिया विश्वविद्यालय में डॉ. आंबेडकर ने समाजशास्त्रीय विश्लेषण से दिखाया कि सजातीय विवाह के कठोर नियमों ने भारतीय समाज को बंद जातियों में जकड़ा।",
      mr: "या शोधनिबंधात आंबेडकरांनी सिद्ध केले की सजातीय विवाहाची चौकट हीच जातीची जननी आहे."
    },
    relatedDocumentIds: ['annihilation-of-caste', 'problem-of-the-rupee-1923'],
    location: 'Columbia University, New York'
  },
  {
    id: 'states-and-minorities-1947',
    title: 'States and Minorities: What are Their Rights and How to Secure Them',
    titleLocal: {
      hi: 'राज्य और अल्पसंख्यक: उनके अधिकार और उनका संरक्षण',
      mr: 'राज्ये आणि अल्पसंख्याक: त्यांचे हक्क आणि संरक्षण'
    },
    type: 'book',
    categoryLabel: 'Constitutional Blueprint',
    date: 'March 1947',
    year: 1947,
    collection: 'All-India Scheduled Castes Federation / Thacker & Co.',
    language: 'English',
    source: 'Constituent Assembly of India Advisory Committee',
    accessionNo: 'CON-1947-SM-001',
    shortDescription: "A comprehensive constitutional memorandum submitted to the Constituent Assembly proposing state socialism, state ownership of key industries, and fundamental safeguards for minorities.",
    shortDescriptionLocal: {
      hi: "संविधान सभा को सौंपा गया ऐतिहासिक मसौदा, जिसमें 'राज्य समाजवाद', प्रमुख उद्योगों के राष्ट्रीयकरण और अल्पसंख्यकों के मौलिक अधिकारों की रूपरेखा थी।",
      mr: "संविधान सभेला सादर केलेला मसुदा, ज्यात राज्य समाजवाद आणि अल्पसंख्याकांच्या हक्कांची भक्कम मांडणी केली होती."
    },
    fullText: `The state shall acquire all agricultural land and divide it into farms of standard size, to be cultivated by the residents of the village as a collective farm.

Key industries shall be owned and run by the State. Basic industries, which are not key industries but which are vital to the national economy, shall be owned by the State and run by the State or by corporations established by the State.

Insurance shall be a monopoly of the State. The purpose is to protect the freedom of the individual from being exploited by private capital while simultaneously protecting democracy against state totalitarianism.`,
    fullTextLocal: {
      hi: `राज्य प्रमुख उद्योगों का स्वामित्व और संचालन स्वयं करेगा। बीमा पर राज्य का एकाधिकार होगा। इसका उद्देश्य व्यक्ति की स्वतंत्रता को निजी पूंजी के शोषण से बचाना और साथ ही लोकतंत्र की रक्षा करना है।`,
      mr: `महत्त्वाचे उद्योग राज्याच्या मालकीचे असतील. विमा क्षेत्रात राज्याची मक्तेदारी असेल. खाजगी भांडवलाच्या शोषणापासून नागरिकांचे रक्षण करणे हा याचा उद्देश आहे.`
    },
    ocrConfidence: 99.1,
    keyTopics: ['State Socialism', 'Fundamental Rights', 'Economic Democracy', 'Minority Safeguards', 'Land Reform'],
    aiSummary: {
      en: "States and Minorities was Dr. Ambedkar's personal draft constitution presented before the Constituent Assembly Advisory Committee. It advocated a democratic socialist economic framework with state ownership of key industries and land combined with constitutional parliamentary democracy.",
      hi: "इस दस्तावेज में डॉ. आंबेडकर ने भारत के लिए 'लोकतांत्रिक राज्य समाजवाद' की वकालत की, ताकि आर्थिक स्वतंत्रता और राजनीतिक समानता दोनों सुनिश्चित हो सकें।",
      mr: "या मसुद्याद्वारे आंबेडकरांनी लोकशाही समाजवादाचा पुरस्कार केला, ज्यात प्रमुख उद्योग आणि शेतीचे राष्ट्रीयीकरण करण्याचे सुचवले होते."
    },
    relatedDocumentIds: ['constituent-assembly-speech-1949', 'article-32-debate-1948'],
    location: 'New Delhi'
  },
  {
    id: 'buddha-and-his-dhamma-1957',
    title: 'The Buddha and His Dhamma',
    titleLocal: {
      hi: 'भगवान बुद्ध और उनका धम्म',
      mr: 'भगवान बुद्ध आणि त्यांचा धम्म'
    },
    type: 'book',
    categoryLabel: 'Philosophical Treatise',
    date: '1957 (Posthumous)',
    year: 1957,
    collection: 'People’s Education Society / Siddharth College Archive',
    language: 'English (Orig.) / Marathi / Hindi',
    source: 'Dr. Ambedkar Memorial Trust, Mumbai',
    accessionNo: 'PHI-1957-BHD-001',
    shortDescription: "Dr. Ambedkar's monumental magnum opus on Buddhist philosophy, rationalism, compassion (Karuna), and social morality (Pragya and Sheel).",
    shortDescriptionLocal: {
      hi: "बौद्ध दर्शन, तर्कशीलता, करुणा और प्रज्ञा पर डॉ. आंबेडकर का दार्शनिक महाग्रंथ।",
      mr: "बौद्ध तत्त्वज्ञान, विवेकवाद, करुणा आणि प्रज्ञा यांवर डॉ. आंबेडकरांचा अद्वितीय महाग्रंथ."
    },
    fullText: `Religion must relate to morality. If religion is separated from morality, it becomes a mockery. Dhamma is righteousness, which means right relations between man and man in all spheres of life.

The purpose of Dhamma is to reconstruct the world, to make it a kingdom of righteousness. Man's miseries are not due to any supernatural will; they are the creation of man himself through ignorance and greed, and can be removed through rational action and compassion.`,
    fullTextLocal: {
      hi: `धर्म का संबंध नैतिकता से होना चाहिए। धम्म का उद्देश्य संसार का पुनर्निर्माण करना है, ताकि प्रत्येक मनुष्य के बीच न्यायसंगत और मानवीय संबंध स्थापित हो सकें।`,
      mr: `धर्माचा थेट संबंध नैतिकतेशी असला पाहिजे. धम्माचा मूळ उद्देश मानवी दुःखाचे निवारण करून जगात समता, करुणा आणि प्रज्ञा प्रस्थापित करणे हाच आहे.`
    },
    ocrConfidence: 99.5,
    keyTopics: ['Buddhism', 'Rational Morality', 'Karuna & Pragya', 'Deekshabhoomi', 'Social Ethics'],
    aiSummary: {
      en: "Completed in the final year of his life, this masterwork reconstructs the life and teachings of Gautama Buddha as a rational, ethical guide for modern democratic societies focused on compassion, human fellowship, and emancipation.",
      hi: "डॉ. आंबेडकर के जीवन का अंतिम महान ग्रंथ, जिसने धम्म को अंधविश्वासों से मुक्त कर नैतिक और सामाजिक समता के आधुनिक प्रकाशस्तंभ के रूप में प्रस्तुत किया।",
      mr: "आंबेडकरांचे हे अंतिम वैचारिक संचित असून, यात त्यांनी बुद्धाच्या तत्त्वज्ञानाची मांडणी विवेकवादी, नैतिक आणि सामाजिक मुक्तीचा मार्ग म्हणून केली आहे."
    },
    relatedDocumentIds: ['annihilation-of-caste', 'constituent-assembly-speech-1949'],
    location: 'Mumbai / Nagpur'
  }
];

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'birth-1891',
    year: 1891,
    dateString: 'April 14, 1891',
    title: 'Birth at Mhow Cantonment',
    titleLocal: {
      hi: 'महू छावनी में जन्म',
      mr: 'महू छावणीत जन्म'
    },
    era: 'Early Life & Education',
    location: 'Mhow (Dr. Ambedkar Nagar), Madhya Pradesh',
    description: 'Bhimrao Ramji Ambedkar was born into a Mahar family serving in the British Indian Army. His father Ramji Maloji Sakpal was a Subedar-major.',
    descriptionLocal: {
      hi: 'भीमराव रामजी आंबेडकर का जन्म सूबेदार रामजी मालोजी सकपाल और भीमाबाई के 14वें बच्चे के रूप में महू में हुआ।',
      mr: 'भीमराव रामजी आंबेडकर यांचा जन्म महू लष्करी छावणीत सुभेदार रामजी मालोजी सकपाल आणि भीमाबाई यांच्या पोटी झाला.'
    },
    quote: 'Cultivation of mind should be the ultimate aim of human existence.',
    imageUrl: HERO_IMAGE,
    relatedDocIds: ['castes-in-india-1916'],
    mediaType: 'photo',
    highlights: [
      'Born to Subedar Ramji Maloji Sakpal & Bhimabai',
      'Early schooling in Dapoli & Satara Camp School',
      'Devotion to reading sparked in early childhood'
    ]
  },
  {
    id: 'columbia-lse-1913-1923',
    year: 1916,
    dateString: '1913 – 1923',
    title: 'Higher Education at Columbia University & London School of Economics',
    titleLocal: {
      hi: 'कोलंबिया विश्वविद्यालय और लंदन स्कूल ऑफ इकोनॉमिक्स में उच्च शिक्षा',
      mr: 'कोलंबिया विद्यापीठ आणि लंडन स्कूल ऑफ इकॉनॉमिक्समध्ये उच्च शिक्षण'
    },
    era: 'Early Life & Education',
    location: 'New York & London',
    description: 'Sponsored by Maharaja Sayajirao Gaekwad of Baroda, Dr. Ambedkar earned M.A. and Ph.D. from Columbia University under John Dewey, followed by M.Sc. and D.Sc. from LSE and admission to Gray’s Inn as Barrister-at-Law.',
    descriptionLocal: {
      hi: 'बड़ौदा रियासत की छात्रवृत्ति पर कोलंबिया से एम.ए., पी.एचडी. तथा लंदन से डी.एससी. व बैरिस्टर-एट-लॉ की ऐतिहासिक डिग्रियां प्राप्त कीं।',
      mr: 'सयाजीराव गायकवाड यांच्या शिष्यवृत्तीवर कोलंबियातून पी.एचडी. आणि लंडन स्कूल ऑफ इकॉनॉमिक्समधून डी.एस्सी. सह बार-ॲट-लॉ संपादन केले.'
    },
    quote: 'Men are mortal. So are ideas. An idea needs propagation as much as a plant needs watering.',
    imageUrl: RAJGRUHA_LIBRARY_IMAGE,
    relatedDocIds: ['castes-in-india-1916', 'problem-of-the-rupee-1923'],
    mediaType: 'photo',
    highlights: [
      'Studied 18 hours daily at Columbia Library',
      'Doctor of Science (D.Sc.) at London School of Economics',
      'Admitted to Gray’s Inn as Barrister-at-Law'
    ]
  },
  {
    id: 'bahishkrit-hitakarini-1924',
    year: 1924,
    dateString: 'July 20, 1924',
    title: 'Founding of Bahishkrit Hitakarini Sabha',
    titleLocal: {
      hi: 'बहिष्कृत हितकारिणी सभा की स्थापना',
      mr: 'बहिष्कृत हितकारिणी सभेची स्थापना'
    },
    era: 'Social Awakening',
    location: 'Damodar Hall, Parel, Bombay',
    description: 'Dr. Ambedkar established the institution with the historic motto: "Educate, Agitate, Organise" (शिकवा, चेतवा, संघटित व्हा) to uplift the depressed classes through hostels, libraries, and industrial schools.',
    descriptionLocal: {
      hi: "'शिक्षित बनो, आंदोलन करो, संगठित रहो' के ऐतिहासिक मंत्र के साथ दमित वर्गों के कल्याण हेतु संस्था की नींव रखी गई।",
      mr: "'शिका, संघटित व्हा आणि संघर्ष करा' या ब्रीदवाक्यासह उपेक्षित जनतेच्या सर्वांगीण विकासासाठी बहिष्कृत हितकारिणी सभेची स्थापना केली."
    },
    quote: 'Educate, Agitate, Organise. Have faith in yourselves.',
    quoteAttribution: 'Motto of Bahishkrit Hitakarini Sabha',
    imageUrl: HERO_IMAGE,
    relatedDocIds: ['annihilation-of-caste'],
    mediaType: 'document',
    highlights: [
      'Coined the legendary motto: "Educate, Agitate, Organise"',
      'Established free student hostels & community libraries',
      'Unified marginalized youths into civic democratic action'
    ]
  },
  {
    id: 'mahad-satyagraha-1927-event',
    year: 1927,
    dateString: 'March 20, 1927',
    title: 'The Historic Mahad Satyagraha (Chavdar Tale)',
    titleLocal: {
      hi: 'ऐतिहासिक महाड सत्याग्रह (चवदार तालाब)',
      mr: 'ऐतिहासिक महाड सत्याग्रह (चवदार तळे)'
    },
    era: 'Social Movements',
    location: 'Mahad, Kolaba District, Maharashtra',
    description: 'Dr. Ambedkar led thousands of Dalits to drink water from the public municipal lake at Mahad, asserting civil equality and human rights in one of modern India’s most pivotal civil rights events.',
    descriptionLocal: {
      hi: 'चवदार तालाब पर सार्वजनिक जल संसाधनों पर मानवीय अधिकार की स्थापना हेतु अहिंसक आंदोलन, जिसे भारत का सामाजिक स्वतंत्रता दिवस भी कहा जाता है।',
      mr: 'पाण्याच्या सार्वजनिक स्त्रोतावर मानवी समतेचा हक्क बजावण्यासाठी हजारो लोकांसह केलेले ऐतिहासिक पाऊल.'
    },
    quote: 'We are not going to the Chavdar Tale merely to drink water; we are going there to establish our human rights.',
    imageUrl: MAHAD_IMAGE,
    relatedDocIds: ['mahad-satyagraha-1927'],
    mediaType: 'video',
    videoTitle: 'Mahad Satyagraha March Reel & Water Declaration',
    videoDuration: '04:15',
    highlights: [
      'Asserted drinking water equality at Chavdar Tank',
      'Over 10,000 peaceful marchers walked in discipline',
      'Commemorated annually as Social Empowerment Day'
    ]
  },
  {
    id: 'round-table-conference-1930',
    year: 1930,
    dateString: 'November 1930 – 1932',
    title: 'Round Table Conferences in London',
    titleLocal: {
      hi: 'लंदन में गोलमेज सम्मेलन',
      mr: 'लंडन येथील गोलमेज परिषद'
    },
    era: 'Political Life',
    location: 'House of Lords, St. James Palace, London',
    description: 'Dr. Ambedkar forcefully represented the Depressed Classes of India, demanding separate electorates, political representation, and statutory civic safeguards before the British imperial government.',
    descriptionLocal: {
      hi: 'डॉ. आंबेडकर ने भारत के दमित वर्गों के स्वतंत्र राजनीतिक अधिकारों और संवैधानिक सुरक्षा की मांग ब्रिटिश साम्राज्य के समक्ष दृढ़ता से रखी।',
      mr: 'भारतातील अस्पृश्य आणि शोषित घटकांच्या राजकीय हक्कांचे प्रतिनिधित्व करत आंबेडकरांनी आंतरराष्ट्रीय पातळीवर आवाज उठवला.'
    },
    imageUrl: ROUND_TABLE_IMAGE,
    relatedDocIds: ['annihilation-of-caste', 'the-problem-of-the-rupee-1923'],
    mediaType: 'photo',
    highlights: [
      'Demanded independent political franchise in London',
      'Challenged colonial & conservative hegemony directly',
      'Secured international recognition of Depressed Classes'
    ]
  },
  {
    id: 'poona-pact-1932',
    year: 1932,
    dateString: 'September 24, 1932',
    title: 'Signing of the Poona Pact',
    titleLocal: {
      hi: 'पूना पैक्ट (पूना समझौता)',
      mr: 'पुणे करार'
    },
    era: 'Social Movements',
    location: 'Yerwada Central Jail, Pune',
    description: 'In response to Mahatma Gandhi’s fast unto death against separate electorates, Dr. Ambedkar agreed to reserved seats in joint electorates, dramatically expanding legislative seats for Scheduled Castes.',
    descriptionLocal: {
      hi: 'यरवडा जेल में गांधीजी के अनशन के पश्चात संयुक्त निर्वाचन में आरक्षित सीटों पर सहमति बनी, जिससे सीटों की संख्या 71 से बढ़कर 148 हो गई।',
      mr: 'गांधीजींच्या आमरण उपोषणानंतर डॉ. आंबेडकर आणि गांधी यांच्या प्रतिनिधींमध्ये पुणे करार झाला, ज्याने राखीव जागांची व्यवस्था दिली.'
    },
    imageUrl: ROUND_TABLE_IMAGE,
    relatedDocIds: ['annihilation-of-caste'],
    mediaType: 'document',
    highlights: [
      'Reserved legislative seats doubled from 71 to 148',
      'Guaranteed educational grants for Depressed Classes',
      'Historic pact signed at Yerwada Central Prison'
    ]
  },
  {
    id: 'annihilation-1936-event',
    year: 1936,
    dateString: 'May 1936',
    title: 'Publication of Annihilation of Caste',
    titleLocal: {
      hi: "'जाति का विनाश' का प्रकाशन",
      mr: "'जातीचा विनाश' चे प्रकाशन"
    },
    era: 'Social Movements',
    location: 'Bombay',
    description: 'After the Jat-Pat-Todak Mandal cancelled their Lahore conference over his unapologetic critique of religious orthodoxy, Dr. Ambedkar printed the address at his own expense to widespread global acclaim.',
    descriptionLocal: {
      hi: 'लाहौर के जात-पात तोड़क मंडल द्वारा सम्मेलन रद्द किए जाने पर डॉ. आंबेडकर ने अपने खर्चे पर यह ऐतिहासिक संबोधन प्रकाशित किया।',
      mr: 'लाहोर येथील परिषद रद्द झाल्यावर आंबेडकरांनी स्वतःच्या खर्चाने हा ग्रंथ प्रसिद्ध केला, ज्याने जगभरात वैचारिक वादळ उठवले.'
    },
    quote: 'You cannot build anything on the foundations of caste. You cannot build up a nation.',
    imageUrl: RAJGRUHA_LIBRARY_IMAGE,
    relatedDocIds: ['annihilation-of-caste'],
    mediaType: 'document',
    highlights: [
      'Exposed caste as an unnatural division of labourers',
      'Translated into 20+ global languages',
      'Established democracy as a mode of associated living'
    ]
  },
  {
    id: 'labour-member-viceroy-1942',
    year: 1942,
    dateString: 'July 1942 – 1946',
    title: 'Labour Member in Viceroy’s Council & 8-Hour Workday',
    titleLocal: {
      hi: 'वायसराय परिषद में श्रम मंत्री: 8 घंटे का कार्यदिवस एवं जल नीति',
      mr: 'व्हाइसरॉय कौन्सिलमध्ये कामगार मंत्री: ८ तासांचा कामाचा दिवस व जलनीती'
    },
    era: 'Political Life',
    location: 'New Delhi & Nagpur',
    description: 'Appointed Labour Member of the Viceroy’s Executive Council, Dr. Ambedkar reduced the statutory working day from 12 hours to 8 hours, instituted equal pay for women, established the Central Waterways Commission, and organized the All-India Depressed Classes Conference in Nagpur.',
    descriptionLocal: {
      hi: 'श्रम मंत्री के रूप में कार्यदिवस को 12 से घटाकर 8 घंटे किया, महिलाओं हेतु मातृत्व अवकाश व समान वेतन कानून बनाए तथा केंद्रीय जल आयोग की नींव रखी।',
      mr: 'कामाचे तास १२ वरून ८ वर आणले, महिलांसाठी बाळंतपणाची रजा व समान वेतन लागू केले आणि बहुउद्देशीय जलप्रकल्पांची मुहूर्तमेढ रोवली.'
    },
    quote: 'I measure the progress of a community by the degree of progress which women have achieved.',
    imageUrl: LAW_MINISTER_IMAGE,
    relatedDocIds: ['states-and-minorities-1947', 'the-problem-of-the-rupee-1923'],
    mediaType: 'document',
    highlights: [
      'Reduced statutory workday from 12 to 8 hours nationwide',
      'Pioneered maternity benefit laws & equal pay for women',
      'Designed Damodar Valley & Hirakud multi-purpose river basins'
    ]
  },
  {
    id: 'drafting-committee-1947',
    year: 1947,
    dateString: 'August 29, 1947',
    title: 'Appointed Chairman of the Constitution Drafting Committee',
    titleLocal: {
      hi: 'संविधान प्रारूप समिति के अध्यक्ष नियुक्त',
      mr: 'घटना मसुदा समितीच्या अध्यक्षपदी निवड'
    },
    era: 'Constitution & Governance',
    location: 'Constituent Assembly, New Delhi',
    description: 'Dr. Ambedkar was unanimously elected Chairman of the Drafting Committee to frame the Constitution of independent India. He also served as the nation’s first Law and Justice Minister.',
    descriptionLocal: {
      hi: 'स्वतंत्र भारत के प्रथम कानून मंत्री तथा संविधान निर्माण हेतु प्रारूप समिति के सर्वसम्मत अध्यक्ष चुने गए।',
      mr: 'स्वतंत्र भारताचे पहिले कायदेमंत्री आणि भारतीय संविधानाच्या मसुदा समितीचे अध्यक्ष म्हणून त्यांनी धुरा सांभाळली.'
    },
    quote: 'Constitution is not a mere lawyers’ document, it is the vehicle of Life, and its spirit is always the spirit of Age.',
    imageUrl: DRAFTING_CONSTITUTION_IMAGE,
    relatedDocIds: ['constituent-assembly-speech-1949', 'article-32-debate-1948', 'states-and-minorities-1947'],
    mediaType: 'video',
    videoTitle: 'Drafting Committee Chamber Reel & Assembly Debates',
    videoDuration: '06:30',
    highlights: [
      'Unanimously elected Chairman of the Drafting Committee',
      'Crafted 395 Articles and 8 Schedules over 2 yrs, 11 mos',
      'Instituted independent Election Commission & Judiciary'
    ]
  },
  {
    id: 'constitution-adopted-1949',
    year: 1949,
    dateString: 'November 26, 1949',
    title: 'Adoption of the Constitution of India',
    titleLocal: {
      hi: 'भारतीय संविधान अंगीकृत एवं अधिनियमित',
      mr: 'भारतीय राज्यघटना स्वीकृत व संमत'
    },
    era: 'Constitution & Governance',
    location: 'Constitution Hall, New Delhi',
    description: 'The Constituent Assembly adopted the Constitution of India drafted under Dr. Ambedkar’s guidance. Assembly President Dr. Rajendra Prasad remarked that no one could have piloted the constitution with greater ability.',
    descriptionLocal: {
      hi: 'संविधान सभा ने भारत के संविधान को अंगीकार किया। राष्ट्रपति डॉ. राजेन्द्र प्रसाद ने उनके योगदान की मुक्तकंठ से प्रशंसा की।',
      mr: 'संविधान सभेने भारताची राज्यघटना स्वीकारली. डॉ. राजेंद्र प्रसाद यांनी डॉ. आंबेडकरांच्या अथांग परिश्रमाचा विशेष गौरव केला.'
    },
    quote: 'I feel that the constitution is workable, it is flexible and it is strong enough to hold the country together both in peacetime and in wartime.',
    imageUrl: ASSEMBLY_IMAGE,
    relatedDocIds: ['constituent-assembly-speech-1949', 'article-32-debate-1948'],
    mediaType: 'video',
    videoTitle: 'Constituent Assembly Final Adoption Ceremony (1949)',
    videoDuration: '08:45',
    highlights: [
      'Universal adult suffrage granted to every citizen',
      'Delivered the monumental "Contradictions" warning address',
      'Handed completed Constitution to President Rajendra Prasad'
    ]
  },
  {
    id: 'hindu-code-bill-1951',
    year: 1951,
    dateString: 'September – October 1951',
    title: 'The Hindu Code Bill & Resignation as Law Minister',
    titleLocal: {
      hi: 'हिंदू कोड बिल और कानून मंत्री पद से त्यागपत्र',
      mr: 'हिंदू कोड बिल आणि कायदेमंत्री पदाचा राजीनामा'
    },
    era: 'Constitution & Governance',
    location: 'Parliament, New Delhi',
    description: 'Dr. Ambedkar introduced revolutionary bills granting women equal rights in marriage, inheritance, and guardianship. When conservative opposition stalled the reform, he resigned on moral grounds.',
    descriptionLocal: {
      hi: 'महिलाओं को संपत्ति में बराबरी, तलाक और विवाह में समान अधिकार दिलाने वाले हिंदू कोड बिल के पारित न होने पर उन्होंने पद से इस्तीफा दे दिया।',
      mr: 'महिलांच्या मालमत्ता व विवाह अधिकारांसाठी हिंदू कोड बिल मांडले; ते रखडल्यामुळे तत्त्वासाठी मंत्रिपदाचा राजीनामा दिला.'
    },
    quote: 'I measure the progress of a community by the degree of progress which women have achieved.',
    imageUrl: LAW_MINISTER_IMAGE,
    relatedDocIds: ['constituent-assembly-speech-1949'],
    mediaType: 'speech',
    highlights: [
      'Proposed statutory inheritance rights for daughters',
      'Abolished polygamy and established monogamy in law',
      'Resigned on moral principle when reform was delayed'
    ]
  },
  {
    id: 'deekshabhoomi-1956',
    year: 1956,
    dateString: 'October 14, 1956',
    title: 'Historic Conversion to Buddhism at Deekshabhoomi',
    titleLocal: {
      hi: 'दीक्षाभूमि नागपुर में ऐतिहासिक धम्म दीक्षा',
      mr: 'दीक्षाभूमी नागपूर येथे ऐतिहासिक धम्मदीक्षा'
    },
    era: 'Later Life & Philosophy',
    location: 'Deekshabhoomi, Nagpur',
    description: 'Fulfilling his 1935 pledge, Dr. Ambedkar converted to Buddhism along with approximately 500,000 followers, administering the 22 Vows (बावीस प्रतिज्ञा) grounded in rationality, fraternity, and equality.',
    descriptionLocal: {
      hi: 'नागपुर में लगभग 5 लाख अनुयायियों के साथ बौद्ध धम्म स्वीकार किया और 22 प्रतिज्ञाओं के माध्यम से एक समतामूलक नवजागरण का सूत्रपात किया।',
      mr: 'नागपुरात ५ लाख अनुयायांसह बौद्ध धम्माची दीक्षा घेतली आणि २२ प्रतिज्ञांद्वारे सामाजिक पुनरुत्थानाचा नवा अध्याय सुरू केला.'
    },
    quote: 'I like the religion that teaches liberty, equality and fraternity.',
    imageUrl: NAGPUR_DEEKSHA_IMAGE,
    relatedDocIds: ['buddha-and-his-dhamma-1957'],
    mediaType: 'video',
    videoTitle: 'Deekshabhoomi Mass Initiation & The 22 Vows (1956)',
    videoDuration: '05:10',
    highlights: [
      '500,000 people embraced Buddhist humanism together',
      'Administered the 22 rationalist vows for human dignity',
      'Revived the ancient Dhamma of compassion and equality'
    ]
  },
  {
    id: 'mahaparinirvan-1956',
    year: 1956,
    dateString: 'December 6, 1956',
    title: 'Mahaparinirvan at 26 Alipur Road',
    titleLocal: {
      hi: 'महापरिनिर्वाण (26 अलीपुर रोड, दिल्ली)',
      mr: 'महापरिनिर्वाण (२६ अलीपूर रोड, दिल्ली)'
    },
    era: 'Later Life & Philosophy',
    location: 'New Delhi / Chaitya Bhoomi, Dadar, Mumbai',
    description: 'Dr. Ambedkar passed away peacefully in his sleep just days after finishing the typescript of "The Buddha and His Dhamma". Millions gathered at Chaitya Bhoomi in Mumbai to pay tearful homage to the Bodhisattva.',
    descriptionLocal: {
      hi: 'दिल्ली स्थित निवास पर उनका देहावसान हुआ। मुंबई के चैत्यभूमि पर लाखों शोकाकुल नागरिकों ने उन्हें अश्रुपूर्ण श्रद्धांजलि दी।',
      mr: 'दिल्लीत महापरिनिर्वाण झाले. मुंबईच्या चैत्यभूमीवर जनसागराने आपल्या युगपुरुषाला भावपूर्ण निरोप दिला.'
    },
    imageUrl: HERO_IMAGE,
    relatedDocIds: ['buddha-and-his-dhamma-1957'],
    mediaType: 'photo',
    highlights: [
      'Completed final typescript of "The Buddha and His Dhamma"',
      'Millions gathered at Chaitya Bhoomi in Mumbai',
      'Bestowed the Bharat Ratna in tribute to his monumental legacy'
    ]
  }
];

export const MEDIA_RECORDS: MediaItem[] = [
  {
    id: 'media-speech-1949',
    title: 'Speech on the Adoption of the Indian Constitution (Historic Audio Record)',
    titleLocal: {
      hi: 'भारतीय संविधान अंगीकरण भाषण (ऐतिहासिक मूल ऑडियो)',
      mr: 'भारतीय राज्यघटना स्वीकृती भाषण (ऐतिहासिक मूळ ध्वनीफित)'
    },
    type: 'speech',
    typeLabel: 'Archival Speech',
    duration: '22:15',
    date: 'November 25, 1949',
    year: 1949,
    description: 'Original recording of Dr. Ambedkar delivering his concluding speech before the Constituent Assembly, discussing political democracy, social equality, and the fraternity trinity.',
    transcript: {
      en: "On the 26th of January 1950, we are going to enter into a life of contradictions. In politics we will have equality and in social and economic life we will have inequality. In politics we will be recognising the principle of one man one vote and one vote one value. In our social and economic life, we shall continue to deny the principle of one man one value...",
      hi: "26 जनवरी 1950 को हम एक विरोधाभासी जीवन में प्रवेश करने जा रहे हैं। राजनीति में हमारे पास समानता होगी, लेकिन सामाजिक और आर्थिक जीवन में हमारे पास असमानता होगी...",
      mr: "२६ जानेवारी १९५० रोजी आपण एका विरोधाभासांच्या आयुष्यात प्रवेश करणार आहोत. राजकारणात आपल्याकडे समानता असेल, पण सामाजिक आणि आर्थिक जीवनात विषमता असेल..."
    },
    relatedDocIds: ['constituent-assembly-speech-1949', 'article-32-debate-1948']
  },
  {
    id: 'media-bbc-interview-1953',
    title: 'BBC London Radio Interview on Parliamentary Democracy & Caste',
    titleLocal: {
      hi: 'बीबीसी लंदन रेडियो साक्षात्कार: संसदीय लोकतंत्र और जाति',
      mr: 'बीबीसी लंडन रेडिओ मुलाखत: संसदीय लोकशाही आणि जात'
    },
    type: 'interview',
    typeLabel: 'Radio Interview',
    duration: '14:40',
    date: 'May 1953',
    year: 1953,
    description: 'Rare overseas broadcast interview with BBC correspondents Francis Watson discussing whether Western-style parliamentary democracy can endure in Indian society without profound social reform.',
    transcript: {
      en: "Democracy is not merely a form of Government. It is primarily a mode of associated living, of conjoint communicated experience. It is essentially an attitude of respect and reverence towards one's fellowmen...",
      hi: "लोकतंत्र केवल सरकार का एक रूप नहीं है। यह मूलतः साथ मिलकर रहने की एक पद्धति और सह-अनुभूति है...",
      mr: "लोकशाही हे केवळ शासनपद्धतीचे रूप नाही; ते मुख्यत्वे सहजीवनाचे, सहभागाचे आणि माणसाने माणसाला आदर देण्याचे एक तत्त्व आहे..."
    },
    relatedDocIds: ['annihilation-of-caste', 'constituent-assembly-speech-1949']
  },
  {
    id: 'media-hindu-code-1951',
    title: 'All India Radio Address on Hindu Code Bill & Women’s Emancipation',
    titleLocal: {
      hi: 'आकाशवाणी संबोधन: हिंदू कोड बिल और महिला अधिकार',
      mr: 'आकाशवाणी भाषण: हिंदू कोड बिल आणि महिलांचे कायदेशीर अधिकार'
    },
    type: 'historical_recording',
    typeLabel: 'Radio Broadcast',
    duration: '18:10',
    date: 'October 1951',
    year: 1951,
    description: 'Dr. Ambedkar explaining the progressive provisions of the Hindu Code Bill for codifying marriage, inheritance rights for daughters, and the abolition of polygamy.',
    transcript: {
      en: "To leave inequality between class and class, between sex and sex which is the soul of Hindu society untouched, and to go on passing legislation relating to economic problems is to make a farce of our Constitution...",
      hi: "स्त्री और पुरुष तथा वर्गों के बीच की असमानता को अछूता छोड़ देना और केवल आर्थिक कानूनों की बात करना संविधान का उपहास उड़ाना है...",
      mr: "स्त्री आणि पुरुष यांच्यातील विषमता तशीच ठेवून केवळ आर्थिक सुधारणांचे कायदे करणे म्हणजे संविधानाची थट्टा करणे ठरेल..."
    },
    relatedDocIds: ['constituent-assembly-speech-1949', 'states-and-minorities-1947']
  },
  {
    id: 'media-documentary-films-div',
    title: 'Films Division Archival Reel: "Babasaheb — The Architect of Modern Republic"',
    titleLocal: {
      hi: 'फिल्म प्रभाग ऐतिहासिक वृत्तचित्र: "बाबासाहेब — आधुनिक गणराज्य के शिल्पकार"',
      mr: 'फिल्म्स डिव्हिजन ऐतिहासिक वृत्तपट: "बाबासाहेब — आधुनिक गणराज्याचे शिल्पकार"'
    },
    type: 'documentary',
    typeLabel: 'Historical Documentary',
    duration: '28:45',
    date: '1962 / Digitized 2024',
    year: 1962,
    description: 'Restored archival newsreel documentary containing footage of the Constituent Assembly sessions, signature ceremonies, and international delegations.',
    transcript: {
      en: "[Archival Narration] Here in the central hall of Parliament, Dr. Bhimrao Ramji Ambedkar presented the Draft Constitution comprising 395 Articles and 8 Schedules, crafted across nearly three years of meticulous debate...",
      hi: "[ऐतिहासिक वृत्तकथन] संसद के इसी केंद्रीय कक्ष में डॉ. भीमराव रामजी आंबेडकर ने तीन वर्षों के अथक परिश्रम से निर्मित संविधान का प्रारूप प्रस्तुत किया...",
      mr: "[ऐतिहासिक भाष्य] संसदेच्या मध्यवर्ती सभागृहात डॉ. बाबासाहेब आंबेडकरांनी ३९५ कलमे व ८ परिशिष्टे असलेली भारताची महाघटना सादर केली..."
    },
    relatedDocIds: ['constituent-assembly-speech-1949']
  }
];

export const RESEARCH_ANSWERS_DB: Record<string, ResearchAnswer> = {
  'constitution-drafting': {
    id: 'ans-drafting',
    query: 'What role did Ambedkar play in drafting the Constitution?',
    answer: {
      en: "Dr. B. R. Ambedkar served as the Chairman of the Drafting Committee appointed on August 29, 1947. Over two years, eleven months, and seventeen days, he scrutinized and defended 395 Articles and 8 Schedules. He championed Fundamental Rights (Part III), instituted Article 32 as the constitutional remedy, incorporated affirmative action safeguards for scheduled castes and tribes, and established a single integrated judiciary, an independent Election Commission, and the Comptroller and Auditor General. Fellow committee member T. T. Krishnamachari acknowledged on the Assembly floor that the entire burden of piloting the Constitution fell upon Dr. Ambedkar due to illness and absence of other members.",
      hi: "डॉ. बी. आर. आंबेडकर 29 अगस्त 1947 को गठित प्रारूप समिति के अध्यक्ष थे। 2 वर्ष 11 महीने और 17 दिनों के दौरान उन्होंने 395 अनुच्छेदों का नेतृत्व व बचाव किया। उन्होंने मौलिक अधिकारों, अनुच्छेद 32 (संवैधानिक उपचार), एकीकृत न्यायपालिका और स्वतंत्र चुनाव आयोग की स्थापना की। प्रारूप समिति के सदस्य टी. टी. कृष्णामाचारी ने संसद में स्पष्ट कहा था कि अन्य सदस्यों के अस्वस्थ होने के कारण संविधान निर्माण का सारा भार अकेले डॉ. आंबेडकर ने वहन किया।",
      mr: "२९ ऑगस्ट १९४७ रोजी स्थापन झालेल्या मसुदा समितीचे अध्यक्ष म्हणून डॉ. आंबेडकरांनी भारतीय राज्यघटनेची निर्मिती केली. २ वर्षे, ११ महिने आणि १७ दिवस अहोरात्र काम करून त्यांनी ३९५ कलमे व ८ परिशिष्टे तयार केली. मूलभूत हक्क, कलम ३२, स्वतंत्र न्यायव्यवस्था आणि निवडणूक आयोग यांसारख्या लोकशाहीच्या आधारस्तंभांची भक्कम रचना त्यांनी केली."
    },
    groundingStatus: 'Source-grounded response',
    confidenceScore: 99.4,
    sources: [
      {
        docId: 'constituent-assembly-speech-1949',
        docTitle: 'Constituent Assembly Debates: Speech on the Adoption of the Constitution',
        year: 1949,
        volumeOrSection: 'Vol. XI, Official Debates',
        pageNo: 'pp. 972–981',
        excerpt: 'I entered the Constituent Assembly with no other object than to safeguard the interests of the Scheduled Castes. I had not the remotest idea that I would be called upon to undertake more responsible functions. I was therefore greatly surprised when the Assembly elected me to the Drafting Committee and succeeded in producing the Draft Constitution.',
        relevanceScore: 0.98
      },
      {
        docId: 'article-32-debate-1948',
        docTitle: 'Constituent Assembly Debates: Article 32 Debate',
        year: 1948,
        volumeOrSection: 'Vol. VII, Debates Record',
        pageNo: 'pp. 953',
        excerpt: 'If I was asked to name any particular article in this Constitution as the most important—an article without which this Constitution would be a nullity—I could not refer to any other article except this one. It is the very soul of the Constitution and the very heart of it.',
        relevanceScore: 0.94
      }
    ],
    suggestedFollowUps: [
      'What were Ambedkar’s views on Article 32?',
      'Why did Ambedkar emphasize social democracy over political democracy?',
      'What was Ambedkar’s perspective on the Uniform Civil Code in 1948?'
    ]
  },
  'social-equality': {
    id: 'ans-equality',
    query: "What were Ambedkar's views on social equality and caste?",
    answer: {
      en: "Dr. Ambedkar held that genuine equality cannot exist merely as a formal legal proclamation; it requires the systematic dismantling of graded inequality. In 'Annihilation of Caste' (1936), he established that caste is not merely a division of labour, but an unnatural division of labourers graded hierarchically. He argued that political democracy is a hollow facade without social democracy, defining the latter as a way of life that recognizes liberty, equality, and fraternity as an inseparable trinity. To break caste, he advocated inter-caste marriages and the demolition of orthodox religious dogma that sanctioned untouchability.",
      hi: "डॉ. आंबेडकर का मानना था कि सामाजिक समानता केवल कागजी घोषणाओं से नहीं आ सकती। 'जाति का विनाश' (1936) में उन्होंने रेखांकित किया कि जाति केवल श्रम विभाजन नहीं बल्कि श्रमिकों का अस्वाभाविक श्रेणीबद्ध विभाजन है। उन्होंने स्पष्ट किया कि स्वतंत्रता, समता और बंधुता एक अटूट त्रयी हैं, और एक के बिना दूसरे का अस्तित्व असंभव है।",
      mr: "डॉ. आंबेडकरांच्या मते सामाजिक समतेशिवाय राजकीय लोकशाही निरर्थक आहे. 'जातीचा विनाश' (१९३६) या ग्रंथात त्यांनी मांडले की जात ही श्रमाची नव्हे तर श्रमिकांची विषम विभागणी आहे. स्वातंत्र्य, समता आणि बंधुता हे एकमेकांपासून विलग न करता येणारे जीवनमूल्य मानले पाहिजे."
    },
    groundingStatus: 'Source-grounded response',
    confidenceScore: 99.1,
    sources: [
      {
        docId: 'annihilation-of-caste',
        docTitle: 'Annihilation of Caste',
        year: 1936,
        volumeOrSection: 'BAWS Vol. 1, Section IV',
        pageNo: 'pp. 47–52',
        excerpt: 'Caste is not just a division of labour, it is a division of labourers. It is a hierarchy in which the divisions of labourers are graded one above the other. You cannot build anything on the foundations of caste.',
        relevanceScore: 0.99
      },
      {
        docId: 'mahad-satyagraha-1927',
        docTitle: 'Declaration at Mahad Satyagraha',
        year: 1927,
        volumeOrSection: 'BAWS Vol. 17 (Part I)',
        pageNo: 'pp. 12',
        excerpt: 'We have gone to the tank only to prove that we too are human beings like other human beings. Our struggle is not for water; it is for establishing our human rights and civic equality.',
        relevanceScore: 0.95
      }
    ],
    suggestedFollowUps: [
      'How did Ambedkar define fraternity in the Constituent Assembly?',
      'What happened during the Mahad Satyagraha of 1927?',
      'What was the historical context of the Poona Pact in 1932?'
    ]
  },
  'fundamental-rights': {
    id: 'ans-rights',
    query: 'Show documents discussing fundamental rights and Article 32',
    answer: {
      en: "Fundamental rights form the cornerstone of Dr. Ambedkar's constitutional vision. In 'States and Minorities' (1947), he had proposed an extensive charter of civil, economic, and political rights directly enforceable against both the state and private discrimination. In the Constituent Assembly, he drafted Part III, prohibiting discrimination on grounds of religion, race, caste, sex, or place of birth (Articles 15 & 16), abolishing untouchability (Article 17), and enshrining the freedom of speech and association (Article 19). He placed Article 32 at the pinnacle, calling it the 'heart and soul of the Constitution' because it empowers citizens to petition the Supreme Court directly for the enforcement of rights through writs of habeas corpus, mandamus, prohibition, quo warranto, and certiorari.",
      hi: "मौलिक अधिकार डॉ. आंबेडकर के संवैधानिक दर्शन का केंद्र थे। उन्होंने अनुच्छेद 15 और 16 द्वारा भेदभाव पर रोक लगाई, अनुच्छेद 17 द्वारा अस्पृश्यता का कानूनी अंत किया, और अनुच्छेद 32 को 'संविधान का हृदय और आत्मा' बनाया, ताकि कोई भी नागरिक सीधे सर्वोच्च न्यायालय जाकर अपने अधिकारों की रक्षा करा सके।",
      mr: "मूलभूत हक्क हा डॉ. आंबेडकरांच्या घटनात्मक मांडणीचा कणा होता. कलम १५, १६ अन्वये भेदभाव बंदी, कलम १७ द्वारे अस्पृश्यता निवारण आणि कलम ३२ अन्वये सर्वोच्च न्यायालयात दाद मागण्याचा थेट अधिकार त्यांनी नागरिकांना दिला."
    },
    groundingStatus: 'Source-grounded response',
    confidenceScore: 99.6,
    sources: [
      {
        docId: 'article-32-debate-1948',
        docTitle: 'Debate on Article 32 (Constituent Assembly)',
        year: 1948,
        volumeOrSection: 'CAD Vol. VII, Dec 9, 1948',
        pageNo: 'p. 953',
        excerpt: 'It is the very soul of the Constitution and the very heart of it and I am glad that the House has realised its importance. The Supreme Court is constituted as the protector and guarantor of fundamental rights.',
        relevanceScore: 0.99
      },
      {
        docId: 'states-and-minorities-1947',
        docTitle: 'States and Minorities: What are Their Rights',
        year: 1947,
        volumeOrSection: 'Memorandum to Advisory Committee',
        pageNo: 'pp. 15–20',
        excerpt: 'Fundamental rights must be protected not merely against the arbitrary actions of the executive, but also against the tyranny of majorities in legislative chambers.',
        relevanceScore: 0.93
      }
    ],
    suggestedFollowUps: [
      'What did Ambedkar write in States and Minorities regarding state socialism?',
      'Why was Article 17 abolishing untouchability made non-negotiable?'
    ]
  },
  'education-empowerment': {
    id: 'ans-education',
    query: 'What did Ambedkar say about education and empowerment?',
    answer: {
      en: "Dr. Ambedkar viewed education not as a passive vocational skill, but as a revolutionary weapon for intellectual self-assertion and moral liberation. His motto for the Bahishkrit Hitakarini Sabha in 1924 was 'Educate, Agitate, Organise'. He founded the People’s Education Society in 1945, establishing Siddharth College in Bombay and Milind College in Aurangabad to bring higher education to marginalized youths. He famously remarked: 'Cultivation of mind should be the ultimate aim of human existence' and repeatedly urged that girls and women must be educated on equal terms, saying 'I measure the progress of a community by the degree of progress which women have achieved.'",
      hi: "डॉ. आंबेडकर के लिए शिक्षा सामाजिक मुक्ति और आत्मसम्मान का सबसे धारदार हथियार थी। 1924 में उन्होंने 'शिक्षित बनो, आंदोलन करो, संगठित रहो' का नारा दिया। 1945 में पीपल्स एजुकेशन सोसायटी की स्थापना कर सिद्धार्थ कॉलेज (मुंबई) और मिलिंद कॉलेज (औरंगाबाद) खोले। उन्होंने हमेशा महिला शिक्षा पर सर्वाधिक बल दिया।",
      mr: "शिक्षणाकडे डॉ. आंबेडकरांनी मुक्तीचे साधन म्हणून पाहिले. 'शिका, संघटित व्हा आणि संघर्ष करा' हा त्यांचा मूलमंत्र होता. १९४५ मध्ये पीपल्स एज्युकेशन सोसायटी स्थापन करून त्यांनी उपेक्षित तरुणांसाठी उच्च शिक्षणाची द्वारे खुली केली."
    },
    groundingStatus: 'Source-grounded response',
    confidenceScore: 98.8,
    sources: [
      {
        docId: 'annihilation-of-caste',
        docTitle: 'Annihilation of Caste (BAWS Vol. 1)',
        year: 1936,
        volumeOrSection: 'Section XII',
        pageNo: 'p. 78',
        excerpt: 'The cultivation of mind should be the ultimate aim of human existence. Knowledge is the foundation of a man’s life.',
        relevanceScore: 0.96
      },
      {
        docId: 'constituent-assembly-speech-1949',
        docTitle: 'Address at All-India Depressed Classes Conference',
        year: 1942,
        volumeOrSection: 'Speeches and Writings Vol. 17',
        pageNo: 'p. 210',
        excerpt: 'I measure the progress of a community by the degree of progress which women have achieved. Educate your children, especially your daughters.',
        relevanceScore: 0.94
      }
    ],
    suggestedFollowUps: [
      'What institutions did Ambedkar establish for higher education?',
      'What were Ambedkar’s contributions to women’s legal rights in the Hindu Code Bill?'
    ]
  }
};

export const HISTORICAL_PHOTOS: HistoricalPhoto[] = [
  {
    id: 'photo-portrait-1947',
    title: 'Portrait of Dr. B. R. Ambedkar in Formal Attire',
    titleLocal: {
      hi: 'डॉ. बी. आर. आंबेडकर का औपचारिक चित्रांकन (1947)',
      mr: 'डॉ. बाबासाहेब आंबेडकर यांचे औपचारिक छायाचित्र (१९४७)'
    },
    year: 1947,
    dateString: 'Circa August 1947',
    location: 'New Delhi',
    era: 'Public Life',
    imageUrl: HERO_IMAGE,
    aspectRatio: 'landscape',
    caption: 'Official portrait of Dr. Bhimrao Ramji Ambedkar, appointed as independent India’s first Law and Justice Minister and Chairman of the Drafting Committee.',
    captionLocal: {
      hi: 'स्वतंत्र भारत के प्रथम विधि मंत्री एवं संविधान प्रारूप समिति के अध्यक्ष के रूप में डॉ. आंबेडकर का प्रतिष्ठित छायाचित्र।',
      mr: 'स्वतंत्र भारताचे पहिले कायदेमंत्री आणि मसुदा समितीचे अध्यक्ष म्हणून डॉ. बाबासाहेब आंबेडकर यांचे ऐतिहासिक छायाचित्र.'
    },
    historicalContext: 'Taken shortly after the transfer of power in August 1947, Dr. Ambedkar was invited by Prime Minister Jawaharlal Nehru to lead the Ministry of Law and steer the creation of the Constitution of the new republic.',
    accessionNumber: 'ARC-PH-1947-001',
    archiveProvenance: 'Press Information Bureau / National Archives of India',
    photographerOrAgency: 'Photo Division, Government of India',
    relatedDocIds: ['constituent-assembly-speech-1949', 'states-and-minorities-1947'],
    dimensions: '25.4 × 20.3 cm',
    medium: 'Silver gelatin print, black & white'
  },
  {
    id: 'photo-rajgruha-library',
    title: 'In the Sanctuary of Knowledge: The Rajgruha Library',
    titleLocal: {
      hi: 'ज्ञान का साधना-कक्ष: राजगृह निजी पुस्तकालय (1934)',
      mr: 'ज्ञानाचे अभयारण्य: राजगृह वैयक्तिक ग्रंथालय (१९३४)'
    },
    year: 1934,
    dateString: 'Circa 1934',
    location: 'Rajgruha, Hindu Colony, Dadar, Mumbai',
    era: 'Early Life & Education',
    imageUrl: RAJGRUHA_LIBRARY_IMAGE,
    aspectRatio: 'portrait',
    caption: 'Dr. Ambedkar in his personal study at Rajgruha, surrounded by over 50,000 volumes on jurisprudence, economics, constitutionalism, history, and anthropology.',
    captionLocal: {
      hi: 'दादर स्थित अपने निवास राजगृह में डॉ. आंबेडकर, जहां उनके पास 50,000 से अधिक दुर्लभ पुस्तकों का निजी संग्रह था।',
      mr: 'दादर येथील राजगृह निवासस्थानी डॉ. बाबासाहेब आंबेडकर. त्यांच्याकडे ५०,००० हून अधिक दुर्मिळ ग्रंथांचे वैयक्तिक संकलन होते.'
    },
    historicalContext: 'Dr. Ambedkar designed the architectural plan of Rajgruha specifically to accommodate his mammoth library, which was widely regarded as the largest private book collection in Asia during the interwar era.',
    accessionNumber: 'ARC-PH-1934-012',
    archiveProvenance: 'Babasaheb Ambedkar Memorial Trust Archives, Mumbai',
    photographerOrAgency: 'D. D. Rege Studios, Bombay',
    relatedDocIds: ['annihilation-of-caste'],
    dimensions: '30.5 × 22.8 cm',
    medium: 'Gelatin silver bromide vintage print'
  },
  {
    id: 'photo-drafting-handover',
    title: 'Handing Over the Draft Constitution to Dr. Rajendra Prasad',
    titleLocal: {
      hi: 'संविधान प्रारूप का ऐतिहासिक हस्तांतरण (25 नवंबर 1949)',
      mr: 'घटना समिती अध्यक्षांना राज्यघटनेचा अंतिम मसुदा सुपूर्द करताना (१९४९)'
    },
    year: 1949,
    dateString: 'November 25, 1949',
    location: 'Constituent Assembly Chamber, Parliament House, New Delhi',
    era: 'Constitution & Governance',
    imageUrl: DRAFTING_CONSTITUTION_IMAGE,
    aspectRatio: 'landscape',
    caption: 'Dr. B. R. Ambedkar, Chairman of the Drafting Committee, officially presenting the completed draft Constitution to Dr. Rajendra Prasad, President of the Constituent Assembly.',
    captionLocal: {
      hi: 'प्रारूप समिति के अध्यक्ष डॉ. आंबेडकर द्वारा संविधान सभा के अध्यक्ष डॉ. राजेंद्र प्रसाद को अंतिम संविधान प्रारूप समर्पित करने का ऐतिहासिक क्षण।',
      mr: 'मसुदा समितीचे अध्यक्ष डॉ. बाबासाहेब आंबेडकर यांनी घटना समितीचे अध्यक्ष डॉ. राजेंद्र प्रसाद यांना अंतिम मसुदा सुपूर्द करण्याचा ऐतिहासिक प्रसंग.'
    },
    historicalContext: 'Marking the completion of 2 years, 11 months, and 17 days of deliberation, this image captures the culmination of the drafting process. In his address that day, Dr. Ambedkar delivered his famous warning about entering a life of contradictions.',
    accessionNumber: 'ARC-PH-1949-088',
    archiveProvenance: 'Parliamentary Museum & Archives, New Delhi',
    photographerOrAgency: 'Press Information Bureau Official Photographer',
    relatedDocIds: ['constituent-assembly-speech-1949'],
    dimensions: '30.5 × 25.4 cm',
    medium: 'Monochrome press photograph on glossy fiber paper'
  },
  {
    id: 'photo-mahad-satyagraha',
    title: 'The Mahad Satyagraha: Reclaiming the Chavadar Water Tank',
    titleLocal: {
      hi: 'महाड का ऐतिहासिक सत्याग्रह: चवदार तालाब पर जल-अधिकार (1927)',
      mr: 'महाडचा ऐतिहासिक सत्याग्रह: चवदार तळ्यावर पाण्याचा हक्क (१९२७)'
    },
    year: 1927,
    dateString: 'March 20, 1927',
    location: 'Chavadar Tank, Mahad, Colaba District, Maharashtra',
    era: 'Social Movements',
    imageUrl: MAHAD_IMAGE,
    aspectRatio: 'wide',
    caption: 'Dr. Ambedkar leading thousands of satyagrahis to drink water from the public Chavadar Tank, breaking centuries of caste-based untouchability and asserting universal human dignity.',
    captionLocal: {
      hi: 'महाड के चवदार तालाब से जल ग्रहण कर अस्पृश्यता की अमानवीय परंपरा को चुनौती देते हुए डॉ. आंबेडकर और सत्याग्रही।',
      mr: 'चवदार तळ्याचे पाणी पिऊन शतकानुशतके चालत आलेल्या विषमतेला सुरुंग लावणारा डॉ. आंबेडकरांचा ऐतिहासिक लढा.'
    },
    historicalContext: 'Dr. Ambedkar declared: "We are not going to the Chavadar Tank merely to drink water. We are going to assert that we too are human beings." March 20 is celebrated across India as Social Empowerment Day (Samajik Samata Divas).',
    accessionNumber: 'ARC-PH-1927-004',
    archiveProvenance: 'Bahishkrit Bharat Photographic Archives / Maharashtra State Archives',
    photographerOrAgency: 'Satyagraha Committee Field Photographer',
    relatedDocIds: ['mahad-satyagraha-1927'],
    dimensions: '35.6 × 20.3 cm',
    medium: 'Nitrate negative contact print, sepia toned'
  },
  {
    id: 'photo-round-table-conference',
    title: 'At the Second Round Table Conference, London',
    titleLocal: {
      hi: 'द्वितीय गोलमेज सम्मेलन, लंदन: शोषित वर्गों का प्रतिनिधित्व (1931)',
      mr: 'दुसरी गोलमेज परिषद, लंडन: शोषितांचे कणखर नेतृत्व (१९३१)'
    },
    year: 1931,
    dateString: 'Autumn 1931',
    location: 'St. James’s Palace, London, United Kingdom',
    era: 'Social Movements',
    imageUrl: ROUND_TABLE_IMAGE,
    aspectRatio: 'wide',
    caption: 'Dr. Ambedkar participating in the deliberations at St. James’s Palace, presenting legal briefs demanding separate representation and adult franchise for the Depressed Classes.',
    captionLocal: {
      hi: 'लंदन के सेंट जेम्स पैलेस में आयोजित गोलमेज सम्मेलन में वंचित वर्गों के राजनीतिक और संवैधानिक अधिकारों की जोरदार वकालत करते हुए डॉ. आंबेडकर।',
      mr: 'लंडनच्या सेंट जेम्स पॅलेसमध्ये शोषित व वंचित घटकांच्या राजकीय अधिकारांसाठी ठामपणे युक्तिवाद करताना डॉ. आंबेडकर.'
    },
    historicalContext: 'At the conference, Dr. Ambedkar made an indelible impression on British and Indian leaders through his unshakeable command of constitutional law and uncompromising defense of subaltern political rights.',
    accessionNumber: 'ARC-PH-1931-019',
    archiveProvenance: 'The National Archives (Kew, United Kingdom) / Central News Ltd',
    photographerOrAgency: 'Central News Photographic Agency, Fleet Street, London',
    relatedDocIds: ['annihilation-of-caste'],
    dimensions: '38.1 × 21.6 cm',
    medium: 'Gelatin silver press print with typed agency caption verso'
  },
  {
    id: 'photo-constituent-assembly-session',
    title: 'Debating the Republic: Constituent Assembly in Full Session',
    titleLocal: {
      hi: 'संविधान सभा का केंद्रीय कक्ष: गणराज्य की वैचारिक नींव (1948)',
      mr: 'घटना समितीचे मध्यवर्ती सभागृह: लोकशाहीची पायाभरणी (१९४८)'
    },
    year: 1948,
    dateString: 'December 1948',
    location: 'Central Hall, Council House, New Delhi',
    era: 'Constitution & Governance',
    imageUrl: ASSEMBLY_IMAGE,
    aspectRatio: 'landscape',
    caption: 'The Constituent Assembly of India in session, examining clause-by-clause the Fundamental Rights, Directive Principles, and judicial structures under Dr. Ambedkar’s steering.',
    captionLocal: {
      hi: 'संविधान सभा के ऐतिहासिक सत्र के दौरान विभिन्न अनुच्छेदों और मौलिक अधिकारों पर विचार-विमर्श करते जनप्रतिनिधि।',
      mr: 'घटना समितीच्या अधिवेशनात मूलभूत हक्क आणि लोकशाही चौकटीवर चर्चा करताना प्रतिनिधीमंडळ.'
    },
    historicalContext: 'Dr. Ambedkar defended almost every single article of the draft against hundreds of proposed amendments, earning the veneration of colleagues who called him the modern Manu—a label he steered toward constitutional democracy.',
    accessionNumber: 'ARC-PH-1948-045',
    archiveProvenance: 'National Archives of India, New Delhi',
    photographerOrAgency: 'Ministry of Information & Broadcasting Photo Division',
    relatedDocIds: ['constituent-assembly-speech-1949', 'states-and-minorities-1947'],
    dimensions: '28.0 × 20.3 cm',
    medium: 'Silver gelatin print'
  },
  {
    id: 'photo-law-minister-desk',
    title: 'Framing Progressive Law: At the Desk in the Ministry of Law',
    titleLocal: {
      hi: 'क्रांतिकारी विधि-निर्माण: विधि मंत्रालय में कार्यमग्न डॉ. आंबेडकर (1948)',
      mr: 'प्रगतीशील कायद्यांची निर्मिती: विधी मंत्रालयात मग्न असताना (१९४८)'
    },
    year: 1948,
    dateString: '1948',
    location: 'Ministry of Law, New Delhi',
    era: 'Public Life',
    imageUrl: LAW_MINISTER_IMAGE,
    aspectRatio: 'landscape',
    caption: 'Dr. Ambedkar reviewing legislative acts and drafting the groundbreaking Hindu Code Bill to endow Indian women with equal rights to inheritance, marriage, and divorce.',
    captionLocal: {
      hi: 'हिंदू कोड बिल का प्रारूप तैयार करते हुए डॉ. आंबेडकर, जिसका उद्देश्य भारतीय महिलाओं को संपत्ति, विवाह और तलाक में समान अधिकार दिलाना था।',
      mr: 'हिंदू कोड बिलाचा मसुदा तयार करताना डॉ. आंबेडकर. स्त्रियांना संपत्ती, विवाह आणि घटस्फोटात समान हक्क मिळवून देणारा हा ऐतिहासिक कायदा होता.'
    },
    historicalContext: 'Dr. Ambedkar considered his work on the Hindu Code Bill to be as consequential as drafting the Constitution itself, remarking that no society could be judged civilized while keeping half its population in legal subservience.',
    accessionNumber: 'ARC-PH-1948-062',
    archiveProvenance: 'Government of India Archives / Photo Division',
    photographerOrAgency: 'Official Government Photographer',
    relatedDocIds: ['hindu-code-bill-1951'],
    dimensions: '25.4 × 20.3 cm',
    medium: 'Gelatin silver print on textured paper'
  },
  {
    id: 'photo-nagpur-deeksha-1956',
    title: 'The Great Conversion at Deekshabhoomi, Nagpur',
    titleLocal: {
      hi: 'दीक्षाभूमि, नागपुर: धम्म दीक्षा और ऐतिहासिक सामाजिक नवजागरण (1956)',
      mr: 'दीक्षाभूमी, नागपूर: ऐतिहासिक धम्मक्रांती आणि सामाजिक मुक्ती (१९५६)'
    },
    year: 1956,
    dateString: 'October 14, 1956',
    location: 'Deekshabhoomi, Nagpur, Maharashtra',
    era: 'Later Life & Philosophy',
    imageUrl: NAGPUR_DEEKSHA_IMAGE,
    aspectRatio: 'wide',
    caption: 'Clad in white, Dr. Ambedkar and Dr. Savita Ambedkar leading more than 500,000 people in embracing Buddhism, administering the historic 22 Vows of moral equality.',
    captionLocal: {
      hi: 'नागपुर की पावन भूमि पर पांच लाख से अधिक अनुयायियों के साथ बौद्ध धर्म की दीक्षा ग्रहण करते हुए डॉ. आंबेडकर द्वारा 22 प्रतिज्ञाओं का वाचन।',
      mr: 'नागपूरच्या दीक्षाभूमीवर ५ लाखांहून अधिक बांधवांसह बौद्ध धम्माची दीक्षा घेताना आणि ऐतिहासिक २२ प्रतिज्ञा देताना डॉ. बाबासाहेब आंबेडकर.'
    },
    historicalContext: 'Fulfilling his 1935 pledge that "even though I was born a Hindu, I will not die a Hindu", this peaceful spiritual and ethical revolution restored the humanist teachings of the Buddha based on Pradnya (wisdom), Karuna (compassion), and Samata (equality).',
    accessionNumber: 'ARC-PH-1956-022',
    archiveProvenance: 'Dr. Babasaheb Ambedkar Smarak Samiti, Deekshabhoomi, Nagpur',
    photographerOrAgency: 'Special Documentary Press Unit, Nagpur',
    relatedDocIds: ['annihilation-of-caste'],
    dimensions: '35.6 × 22.8 cm',
    medium: 'Silver gelatin documentary news photograph'
  }
];

// 5. KNOWLEDGE GRAPH NODES & LINKS (Events, Articles, Speeches, Figures, Concepts, Orgs, Places)
export const KNOWLEDGE_GRAPH_NODES: KnowledgeGraphNode[] = [
  // ── 1. CENTRAL ARCHIVAL ANCHOR ─────────────────────────────────────────────
  {
    id: 'node-ambedkar',
    label: 'Dr. B.R. Ambedkar',
    category: 'person',
    shortDesc: 'Chief Architect of the Constitution of India, jurist, economist, statesman, scholar, and foremost champion of human rights.',
    year: 1891,
    date: '1891-04-14',
    significance: 'Primary architect of Indian constitutional democracy, champion of social emancipation, and Chairman of the Drafting Committee.',
    keyFacts: [
      'Earned doctorates from both Columbia University (Ph.D.) and London School of Economics (D.Sc.).',
      'Chaired the Drafting Committee that created the Constitution of India (1947–1950).',
      'Served as Independent India’s first Law and Justice Minister, piloting the historic Hindu Code Bill.'
    ],
    historicalContext: 'Late Colonial and Early Post-Independence India (1891–1956)',
    whyItMatters: 'Synthesized global legal philosophy, Buddhist ethics, and democratic institutionalism into modern India’s egalitarian framework.',
    cluster: 'Anchor',
    color: '#C89D56',
    imageUrl: HERO_IMAGE,
    aliases: ['B. R. Ambedkar', 'Dr. B. R. Ambedkar', 'Dr Bhimrao Ramji Ambedkar', 'Babasaheb', 'Babasaheb Ambedkar'],
    bawsVolume: 'BAWS Vol. 1–22',
    provenanceCitation: 'Government of Maharashtra / Parliamentary Archives of India'
  },

  // ── 2. EDUCATION & INTELLECTUAL INFLUENCES CLUSTER ────────────────────────
  {
    id: 'node-columbia',
    label: 'Columbia University',
    category: 'place',
    shortDesc: 'Morningside Heights campus, New York City, where Dr. Ambedkar completed his M.A. and Ph.D. under John Dewey and Edwin Seligman (1913–1916).',
    year: 1913,
    significance: 'Awarded Ambedkar the Honorary LL.D. in 1952, hailing him as "The Great Drafter of the Indian Constitution".',
    keyFacts: [
      'Attended on a state scholarship granted by Maharaja Sayajirao Gaekwad III of Baroda.',
      'Studied economics, sociology, history, and philosophy across 64 academic credits.',
      'Presented his seminal anthropological treatise "Castes in India" in Alexander Goldenweiser’s seminar in May 1916.'
    ],
    historicalContext: 'Morningside Heights, New York (1913–1916)',
    whyItMatters: 'Imbued Ambedkar with pragmatic democratic theory, scientific sociological methodology, and public finance principles.',
    cluster: 'Education',
    color: '#8B5E3C',
    imageUrl: RAJGRUHA_LIBRARY_IMAGE,
    aliases: ['Columbia NYC', 'Low Memorial Library', 'Morningside Heights Campus'],
    bawsVolume: 'BAWS Vol. 1 & Columbia Oral History',
    provenanceCitation: 'Columbia University Registrar Records (1913–1916) / Rare Book & Manuscript Library'
  },
  {
    id: 'node-john-dewey',
    label: 'Prof. John Dewey',
    category: 'person',
    shortDesc: 'Renowned American pragmatist philosopher, psychologist, and educator at Columbia University; mentor and professor to Dr. Ambedkar.',
    year: 1913,
    significance: 'Deeply shaped Ambedkar’s conception of democracy as "associated living and conjoint communicated experience".',
    keyFacts: [
      'Taught Ambedkar courses in moral philosophy, education, and social theory at Columbia.',
      'Ambedkar took extensive notes on Dewey’s "Democracy and Education" (1916).',
      'Ambedkar repeatedly cited Dewey’s formulations across "Annihilation of Caste" and his final Constituent Assembly address.'
    ],
    historicalContext: 'American Pragmatism and Progressive Era Philosophy (1859–1952)',
    whyItMatters: 'Grounded Ambedkar’s lifelong conviction that political democracy is empty without reciprocal social communication.',
    cluster: 'Education',
    color: '#C88A58',
    aliases: ['John Dewey', 'Prof. Dewey', 'Professor John Dewey Columbia'],
    bawsVolume: 'BAWS Vol. 1',
    provenanceCitation: 'Columbia University Archives / BAWS Vol. 1 (Annihilation of Caste Section XIV)'
  },
  {
    id: 'node-edwin-seligman',
    label: 'Prof. Edwin R. A. Seligman',
    category: 'person',
    shortDesc: 'Distinguished American institutional economist and McVickar Professor of Political Economy at Columbia University; doctoral adviser to Dr. Ambedkar.',
    year: 1914,
    significance: 'Supervised Ambedkar’s dissertation "The Evolution of Provincial Finance in British India", pioneering fiscal federalism analysis.',
    keyFacts: [
      'Wrote the influential introduction to Ambedkar’s published dissertation in 1925.',
      'Praised Ambedkar’s original research into fiscal decentralization and provincial taxation.',
      'Maintained enduring scholarly correspondence with Ambedkar throughout his legal and political career.'
    ],
    historicalContext: 'Columbia Department of Economics (1861–1939)',
    whyItMatters: 'Provided the analytical foundation for India’s Finance Commission architecture and revenue-sharing mechanisms.',
    cluster: 'Education',
    color: '#C88A58',
    aliases: ['Edwin Seligman', 'Prof. E. R. A. Seligman', 'Edwin Robert Anderson Seligman'],
    bawsVolume: 'BAWS Vol. 6',
    provenanceCitation: 'Columbia University Economics Faculty Papers / P. S. King & Son Edition (1925)'
  },
  {
    id: 'node-lse',
    label: 'London School of Economics',
    category: 'organization',
    shortDesc: 'Premier British social science institution where Dr. Ambedkar earned both M.Sc. (1921) and D.Sc. (1923) in Economics under Edwin Cannan.',
    year: 1916,
    significance: 'Ambedkar became the first Indian scholar to be awarded the prestigious Doctor of Science (Economics) degree by LSE.',
    keyFacts: [
      'Enrolled in October 1916 while concurrently reading law at Gray’s Inn.',
      'Completed his doctoral thesis on currency standards, later published as "The Problem of the Rupee".',
      'A bronze bust of Dr. Ambedkar is prominently enshrined in the LSE Old Building atrium.'
    ],
    historicalContext: 'Houghton Street, Aldwych, London (1916–1923)',
    whyItMatters: 'Equipped Ambedkar with world-class monetary expertise that shaped the statutory founding of the Reserve Bank of India.',
    cluster: 'Education',
    color: '#5C7873',
    aliases: ['LSE', 'London School of Economics and Political Science', 'Houghton Street London'],
    bawsVolume: 'BAWS Vol. 6',
    provenanceCitation: 'London School of Economics Archives / LSE Calendar Records (1916–1923)'
  },
  {
    id: 'node-grays-inn',
    label: 'Gray’s Inn, London',
    category: 'organization',
    shortDesc: 'One of the four historic Inns of Court in London where Dr. Ambedkar read law and was called to the Bar on 28 June 1923.',
    year: 1916,
    significance: 'Accredited Dr. Ambedkar as a qualified Barrister-at-Law, empowering his high-court litigation for civil liberties in Bombay.',
    keyFacts: [
      'Admitted as a student of law in November 1916.',
      'Passed Bar examinations while researching currency reform in the British Museum Reading Room.',
      'Formally called to the Bar on 28 June 1923, returning to Bombay to establish his independent legal chambers.'
    ],
    historicalContext: 'Inns of Court, London (1916–1923)',
    whyItMatters: 'Gave Ambedkar the formal constitutional and forensic legal mastery required to draft national legislation.',
    cluster: 'Education',
    color: '#5C7873',
    aliases: ['Honourable Society of Gray’s Inn', 'Gray’s Inn Barrister Chambers'],
    bawsVolume: 'BAWS Vol. 17 (Part 1)',
    provenanceCitation: 'Gray’s Inn Admission Registers & Council Minutes (1916–1923)'
  },
  {
    id: 'node-elphinstone',
    label: 'Elphinstone College, Bombay',
    category: 'organization',
    shortDesc: 'Historic premier collegiate institution in Bombay affiliated with the University of Bombay, where Dr. Ambedkar earned his B.A. in 1912.',
    year: 1908,
    significance: 'Ambedkar became the first student from his community in western India to matriculate and earn a university degree.',
    keyFacts: [
      'Passed B.A. with dual majors in English Literature and Persian in 1912.',
      'Mentored by reformist scholar Krishnaji Arjun Keluskar, who gifted him a biography of Gautama Buddha.',
      'Gained intellectual distinction that brought his merit to the attention of the Maharaja of Baroda.'
    ],
    historicalContext: 'Fort, Bombay (1908–1912)',
    whyItMatters: 'Proved that institutional barriers could be overcome by intellectual perseverance, opening collegiate access for millions.',
    cluster: 'Education',
    color: '#5C7873',
    aliases: ['Elphinstone College Bombay', 'University of Bombay Elphinstone'],
    bawsVolume: 'BAWS Vol. 17 (Part 1)',
    provenanceCitation: 'University of Bombay Convocation Register (1912)'
  },
  {
    id: 'node-sayajirao-gaekwad',
    label: 'Maharaja Sayajirao Gaekwad III',
    category: 'person',
    shortDesc: 'Visionary ruler of the progressive princely state of Baroda who financed Dr. Ambedkar’s higher education at Columbia University.',
    year: 1913,
    significance: 'Pioneered universal primary education in Baroda and funded scholarships for subaltern scholars without caste prejudice.',
    keyFacts: [
      'Granted a scholarship of £11.50 per month in June 1913 enabling Ambedkar’s study at Columbia.',
      'Appointed Ambedkar Military Secretary to Baroda State upon his return in 1917.',
      'A steadfast patron of progressive social welfare and anti-untouchability programs across western India.'
    ],
    historicalContext: 'Baroda State and Western India (1863–1939)',
    whyItMatters: 'Demonstrated the power of affirmative state support to unlock generational subaltern leadership.',
    cluster: 'Education',
    color: '#C88A58',
    aliases: ['Sayajirao Gaekwad III', 'Maharaja of Baroda', 'Sayajirao III'],
    bawsVolume: 'BAWS Vol. 17 (Part 1)',
    provenanceCitation: 'Baroda State Gazetteer / Baroda State Council Order (June 1913)'
  },

  // ── 3. FOUNDATIONAL WORKS & TREATISES CLUSTER ─────────────────────────────
  {
    id: 'node-annihilation',
    label: 'Annihilation of Caste',
    category: 'work',
    shortDesc: '1936 magnum opus diagnosing caste hierarchy as an unnatural division of labourers, calling for shastric destruction.',
    year: 1936,
    date: '1936-05-15',
    linkedDocId: 'annihilation-of-caste',
    significance: 'Global masterwork on social democracy, graded inequality, and the moral prerequisites of human fraternity.',
    keyFacts: [
      'Written as an undelivered presidential address for the Jat-Pat-Todak Mandal annual conference in Lahore.',
      'Declined to alter a single word when the conservative conference committee requested revisions.',
      'Independently self-published in Bombay at his own expense in May 1936, quickly translated into multiple Indian languages.'
    ],
    historicalContext: 'Lahore / Bombay (1936)',
    whyItMatters: 'Established that national political sovereignty cannot stand upon the crumbling foundation of graded inequality.',
    cluster: 'Writings',
    color: '#C5A880',
    aliases: ['Jat-Pat-Todak Mandal Address', 'Undelivered Lahore Address', 'AoC (1936)'],
    bawsVolume: 'BAWS Vol. 1',
    provenanceCitation: 'First Edition Printed at Bombay, May 1936 / Jat-Pat-Todak Mandal Correspondence'
  },
  {
    id: 'node-rupee-problem',
    label: 'The Problem of the Rupee',
    category: 'work',
    shortDesc: 'Monumental 1923 monetary treatise and D.Sc. dissertation at LSE analyzing exchange rate volatility and colonial monetary policy.',
    year: 1923,
    date: '1923-11-01',
    linkedDocId: 'the-problem-of-the-rupee-1923',
    significance: 'Directly cited during the Hilton-Young Commission hearings and statutory design of the Reserve Bank of India.',
    keyFacts: [
      'Critiqued John Maynard Keynes’s advocacy for the gold exchange standard in colonial economies.',
      'Argued for currency stability to protect the purchasing power of the working poor against inflationary devaluation.',
      'Published commercially in London by P. S. King & Son in November 1923 with an introduction by Edwin Cannan.'
    ],
    historicalContext: 'London School of Economics / London (1923)',
    whyItMatters: 'Laid the empirical foundation for independent central banking and stable monetary policy in India.',
    cluster: 'Writings',
    color: '#C5A880',
    imageUrl: ROUND_TABLE_IMAGE,
    aliases: ['Problem of the Rupee', 'D.Sc. Economics Dissertation LSE', 'P. S. King Edition 1923'],
    bawsVolume: 'BAWS Vol. 6',
    provenanceCitation: 'London School of Economics Library / British Museum Archives'
  },
  {
    id: 'node-castes-in-india',
    label: 'Castes in India: Genesis & Mechanism',
    category: 'work',
    shortDesc: 'Pioneering 1916 anthropological paper delivered at Columbia University identifying endogamy as the core mechanism creating caste.',
    year: 1916,
    date: '1916-05-09',
    linkedDocId: 'castes-in-india-1916',
    significance: 'First modern scientific explanation of how endogamy superimposed upon exogamy generates self-enclosing castes.',
    keyFacts: [
      'Presented in the Goldenweiser Anthropology Seminar at Columbia University on 9 May 1916.',
      'Published in the prestigious journal "Indian Antiquary" in May 1917.',
      'Anticipated structural anthropology by demonstrating that caste is not a biological entity but a sociological enclosure.'
    ],
    historicalContext: 'Columbia University, New York City (May 1916)',
    whyItMatters: 'Demolished racial and occupational theories of caste, replacing them with institutional sociological analysis.',
    cluster: 'Writings',
    color: '#C5A880',
    aliases: ['Columbia Anthropology Paper', 'Genesis and Development of Caste', 'Indian Antiquary 1917'],
    bawsVolume: 'BAWS Vol. 1',
    provenanceCitation: 'Indian Antiquary Vol. XLI (May 1917) / Columbia Seminar Records'
  },
  {
    id: 'node-states-minorities',
    label: 'States and Minorities',
    category: 'work',
    shortDesc: '1947 constitutional charter submitted to the Constituent Assembly establishing fundamental rights and constitutional state socialism.',
    year: 1947,
    date: '1947-03-15',
    linkedDocId: 'states-and-minorities-1947',
    significance: 'The intellectual blueprint for Part III (Fundamental Rights) and Directive Principles of the Indian Constitution.',
    keyFacts: [
      'Subtitled "What are their Rights and How to Secure Them in the Constitution of Free India".',
      'Proposed that key industries, insurance, and agricultural land be retained in national constitutional stewardship.',
      'Advocated that fundamental rights must protect citizens against both state tyranny and private economic exploitation.'
    ],
    historicalContext: 'New Delhi / Bombay (March 1947)',
    whyItMatters: 'Demonstrated how democratic socialism could be written directly into constitutional supreme law.',
    cluster: 'Writings',
    color: '#C5A880',
    aliases: ['States and Minorities Charter', 'Constitution of the United States of India Memo', 'States & Minorities (1947)'],
    bawsVolume: 'BAWS Vol. 1',
    provenanceCitation: 'All-India Scheduled Castes Federation Publication, Bombay, March 1947'
  },
  {
    id: 'node-who-were-shudras',
    label: 'Who Were the Shudras?',
    category: 'work',
    shortDesc: '1946 historical-textual inquiry into Indo-Aryan history, dedicated to Mahatma Jyotirao Phule.',
    year: 1946,
    significance: 'Rigorous scholarly thesis demonstrating that Shudras originally belonged to the solar Aryan Kshatriya varna.',
    keyFacts: [
      'Dedicated to Mahatma Jyotirao Phule, whom Ambedkar revered as his third intellectual guru.',
      'Critically re-examined the Rigveda, Mahabharata, and Brahmanas with philological rigor.',
      'Showed that caste disenfranchisement was an institutional historical imposition rather than divine creation.'
    ],
    historicalContext: 'Bombay (1946)',
    whyItMatters: 'Liberated subaltern history from mythological fatalism by restoring historical agency through textual evidence.',
    cluster: 'Writings',
    color: '#C5A880',
    aliases: ['Who Were the Shudras', 'Shudra Origins Monograph', 'Thacker & Co. Edition 1946'],
    bawsVolume: 'BAWS Vol. 7',
    provenanceCitation: 'Thacker & Co. Bombay (1946) / BAWS Vol. 7'
  },
  {
    id: 'node-the-untouchables',
    label: 'The Untouchables',
    category: 'work',
    shortDesc: '1948 sociological treatise investigating the historical origins and institutional development of untouchability.',
    year: 1948,
    significance: 'Proposed the "Broken Men" thesis: that untouchables were ancient settled Buddhists who resisted Brahmanical revival.',
    keyFacts: [
      'Demonstrated that beef-eating taboos and religious conflict created untouchability circa 400 CE.',
      'Contrasted Indian untouchability with classical European serfdom and Greco-Roman slavery.',
      'Demonstrated that caste untouchability was graded inequality backed by sanctified legal sanctions.'
    ],
    historicalContext: 'New Delhi (1948)',
    whyItMatters: 'Provided the historical timeline linking ancient Buddhist civilization to subaltern resistance.',
    cluster: 'Writings',
    color: '#C5A880',
    aliases: ['The Untouchables: Who Were They?', 'Broken Men Thesis', 'Amrit Book Co. 1948'],
    bawsVolume: 'BAWS Vol. 7',
    provenanceCitation: 'Amrit Book Co. New Delhi (1948) / BAWS Vol. 7'
  },
  {
    id: 'node-buddha-and-dhamma',
    label: 'The Buddha and His Dhamma',
    category: 'work',
    shortDesc: 'Dr. Ambedkar’s magnum opus theological and philosophical treatise reinterpreting Buddhism as a rationalist gospel of social equality.',
    year: 1957,
    significance: 'The scriptural anchor for millions of Navayana Buddhist converts worldwide.',
    keyFacts: [
      'Completed in his final years in Delhi; published posthumously by the People’s Education Society in 1957.',
      'Interpreted the Buddha’s enlightenment as an ethical resolution of human suffering through morality (Sila) and wisdom (Panna).',
      'Distinguished sharply between supernatural "Religion" and human-centric "Dhamma".'
    ],
    historicalContext: 'New Delhi / Nagpur (1956–1957)',
    whyItMatters: 'Transformed global Buddhism by placing human equality and moral fraternity at its philosophical core.',
    cluster: 'Writings',
    color: '#C5A880',
    aliases: ['The Buddha and His Dhamma', 'Buddha and His Dhamma', 'Navayana Masterwork'],
    bawsVolume: 'BAWS Vol. 11',
    provenanceCitation: 'People’s Education Society, Bombay, 1957 / BAWS Vol. 11'
  },
  {
    id: 'node-riddles-in-hinduism',
    label: 'Riddles in Hinduism',
    category: 'work',
    shortDesc: 'Courageous critique of orthodox texts analyzing moral, social, and political contradictions across the Vedas, Epics, and Puranas.',
    year: 1954,
    significance: 'Formidable rationalist critique advocating intellectual emancipation from mythological dogma.',
    keyFacts: [
      'Drafted between 1951 and 1954 as part of a larger planned multi-volume survey of ancient Indian civilization.',
      'Features 24 distinct "riddles" interrogating the Vedas, Smritis, and Upanishads on ethical consistency.',
      'Published officially by the Government of Maharashtra in 1987 as BAWS Volume 4.'
    ],
    historicalContext: 'New Delhi (1954) / Published 1987',
    whyItMatters: 'Set the benchmark for forensic rationalist criticism of sacrosanct religious texts.',
    cluster: 'Writings',
    color: '#C5A880',
    aliases: ['Riddles in Hinduism Monograph', 'BAWS Volume 4 Riddles'],
    bawsVolume: 'BAWS Vol. 4',
    provenanceCitation: 'Government of Maharashtra / BAWS Vol. 4 (1987)'
  },
  {
    id: 'node-baws-vol-13',
    label: 'BAWS Volume 13',
    category: 'work',
    shortDesc: 'Official archival compendium of Dr. Ambedkar’s speeches, draft articles, and interventions in the Constituent Assembly of India.',
    year: 1949,
    date: '1947–1950',
    linkedDocId: 'constituent-assembly-speech-1949',
    significance: 'The definitive documentary authority on the framers’ original constitutional intent.',
    keyFacts: [
      'Contains 1,200+ pages of Dr. Ambedkar’s floor speeches piloting each Article of the Draft Constitution.',
      'Covers debates on fundamental rights, federalism, judicial review, emergency powers, and social democracy.',
      'Published by the Government of Maharashtra under the chief editorship of Vasant Moon.'
    ],
    historicalContext: 'Constituent Assembly Hall, New Delhi (1947–1950)',
    whyItMatters: 'The primary source of truth cited by the Supreme Court of India in constitutional bench decisions.',
    cluster: 'Writings',
    color: '#C5A880',
    imageUrl: ASSEMBLY_IMAGE,
    aliases: ['BAWS Volume 13', 'Constituent Assembly Interventions', 'CAD Compendium BAWS'],
    bawsVolume: 'BAWS Vol. 13',
    provenanceCitation: 'Dr. Babasaheb Ambedkar Source Material Publication Committee, Bombay'
  },

  // ── 4. SOCIAL MOVEMENTS & HISTORIC CONVERGENCES CLUSTER ────────────────────
  {
    id: 'node-mahad',
    label: 'Mahad Satyagraha',
    category: 'event',
    shortDesc: '20 March 1927: Historic non-violent civil rights assertion for human access to public water at Chavdar Tank, Mahad.',
    year: 1927,
    date: '1927-03-20',
    linkedDocId: 'mahad-satyagraha-1927',
    significance: 'The foundational civil rights milestone of modern India, celebrated annually as Social Empowerment Day.',
    keyFacts: [
      'Dr. Ambedkar led thousands of peaceful delegates to Chavdar Tank to drink water from the public reservoir.',
      'Asserted that the struggle was not merely for water, but to establish that untouchables are human beings with dignity.',
      'Faced violent orthodox backlash, yet maintained strict non-violent discipline.'
    ],
    historicalContext: 'Mahad, Kolaba District, Bombay Presidency (March 1927)',
    whyItMatters: 'Transformed subaltern consciousness from pleading for charity to asserting universal civic equality.',
    cluster: 'Movements',
    color: '#B45339',
    imageUrl: MAHAD_IMAGE,
    aliases: ['Chavdar Tank March', 'Social Empowerment Day', 'Mahad Jal Satyagraha'],
    bawsVolume: 'BAWS Vol. 17 (Part 1)',
    provenanceCitation: 'Bahishkrit Bharat Reports (March–April 1927) / Bombay Legislative Council Proceedings'
  },
  {
    id: 'node-manusmriti-dahan',
    label: 'Manusmriti Dahan Din',
    category: 'event',
    shortDesc: '25 December 1927: Public ceremonial burning of the Manusmriti code in Mahad as a declaration of universal human equality.',
    year: 1927,
    date: '1927-12-25',
    significance: 'The Indian equivalent of the storming of the Bastille, declaring ancient social hierarchy legally and morally dead.',
    keyFacts: [
      'Conducted during the second Mahad conference before thousands of men and women.',
      'Sahasrabuddhe, a progressive Chitpavan Brahmin associate of Dr. Ambedkar, proposed the resolution and lit the pyre.',
      'Framed not as an act of vandalism, but as a moral rejection of institutional inequality.'
    ],
    historicalContext: 'Mahad, Kolaba District (December 1927)',
    whyItMatters: 'Symbolized the permanent rupture with the theological sanctification of human inequality.',
    cluster: 'Movements',
    color: '#B45339',
    aliases: ['Manusmriti Burning', 'Manusmriti Dahan Din', 'December 25 Equality Declaration'],
    bawsVolume: 'BAWS Vol. 17 (Part 1)',
    provenanceCitation: 'Bahishkrit Bharat Field Chronicle (Jan 1928) / Government of Bombay Archives'
  },
  {
    id: 'node-kalaram',
    label: 'Kalaram Temple Satyagraha',
    category: 'event',
    shortDesc: '1930–1935: Five-year non-violent civil rights campaign for temple entry at the historic Kalaram Temple in Nashik.',
    year: 1930,
    date: '1930-03-02',
    significance: 'Proved to the subaltern masses that civic and legal equality cannot be achieved through religious patronage.',
    keyFacts: [
      'Mobilized 15,000 satyagrahis outside Kalaram temple gates under Dr. Ambedkar and Bhaurao Gaikwad.',
      'Met with stone-throwing and barricades from conservative orthodoxy for over five years.',
      'Led directly to Dr. Ambedkar’s 1935 Yeola declaration: "Though I was born a Hindu, I will not die a Hindu."'
    ],
    historicalContext: 'Nashik, Maharashtra (1930–1935)',
    whyItMatters: 'Catalyzed the shift from temple-entry reformism to complete political and spiritual self-determination.',
    cluster: 'Movements',
    color: '#B45339',
    aliases: ['Kalaram Satyagraha', 'Nashik Temple Entry Movement', 'Kalaram Mandir Satyagraha'],
    bawsVolume: 'BAWS Vol. 17 (Part 1)',
    provenanceCitation: 'Nashik District Police & Magistrate Records (1930–1935) / Janata Newspaper'
  },
  {
    id: 'node-poona-pact',
    label: 'Poona Pact',
    category: 'event',
    shortDesc: '24 September 1932: Historic agreement negotiated at Yerwada Central Jail between Dr. Ambedkar and caste Hindu leaders.',
    year: 1932,
    date: '1932-09-24',
    significance: 'Secured 148 reserved seats for the Depressed Classes in provincial legislatures—more than double the British award.',
    keyFacts: [
      'Negotiated while Mahatma Gandhi was on a fast unto death against separate electorates granted by the Communal Award.',
      'Dr. Ambedkar negotiated fiercely under immense moral pressure to safeguard subaltern political representation.',
      'Replaced separate electorates with joint electorates accompanied by guaranteed reserved constituencies.'
    ],
    historicalContext: 'Yerwada Central Jail, Poona (September 1932)',
    whyItMatters: 'Established statutory legislative reservation for Scheduled Castes that continues in the Indian Constitution today.',
    cluster: 'Movements',
    color: '#B45339',
    aliases: ['Poona Pact (1932)', 'Yerwada Agreement', 'Ambedkar-Gandhi Pact'],
    bawsVolume: 'BAWS Vol. 9',
    provenanceCitation: 'Collected Works of Mahatma Gandhi / BAWS Vol. 9 (What Congress and Gandhi Have Done)'
  },
  {
    id: 'node-round-table',
    label: 'Round Table Conferences',
    category: 'event',
    shortDesc: '1930–1932: Landmark constitutional conferences at St. James’s Palace, London, where Dr. Ambedkar represented the Depressed Classes.',
    year: 1930,
    date: '1930–1932',
    significance: 'Elevated the Indian untouchables from a domestic social question into an international constitutional reality.',
    keyFacts: [
      'Dr. Ambedkar attended all three plenary sessions (1930, 1931, 1932) in London.',
      'Submitted the historic "Declaration of Fundamental Rights" and demanded universal adult franchise.',
      'Debated Mahatma Gandhi forcefully in the Federal Structure and Minorities Committees.'
    ],
    historicalContext: 'St. James’s Palace, London (1930–1932)',
    whyItMatters: 'Secured independent political recognition for the Depressed Classes in all future Indian constitutional reforms.',
    cluster: 'Movements',
    color: '#B45339',
    imageUrl: ROUND_TABLE_IMAGE,
    aliases: ['Round Table Conferences London', 'RTC London Sessions', 'First & Second Round Table Conference'],
    bawsVolume: 'BAWS Vol. 2',
    provenanceCitation: 'British Parliamentary Command Papers (Cmd. 3778, 3997, 4238) / BAWS Vol. 2'
  },
  {
    id: 'node-nagpur-conversion',
    label: 'Nagpur Buddhist Conversion',
    category: 'event',
    shortDesc: '14 October 1956: Peaceful mass renaissance at Deekshabhoomi, Nagpur, where Dr. Ambedkar and 500,000 citizens embraced Buddhism.',
    year: 1956,
    date: '1956-10-14',
    significance: 'The largest peaceful religious mass conversion in recorded human history, establishing the Navayana Buddhist tradition.',
    keyFacts: [
      'Took the Three Refuges (Trisaran) and Five Precepts (Pancasila) from venerable monk Mahasthavir Chandramani.',
      'Administered the famous 22 Vows (Bais Pratigya) establishing complete rationalism and ethical equality.',
      'Fulfilled his 1935 pledge at Yeola that he would not die a Hindu.'
    ],
    historicalContext: 'Deekshabhoomi, Nagpur, Maharashtra (October 1956)',
    whyItMatters: 'Restored the Buddhist ethos of equality, compassion, and enlightenment to modern Indian soil.',
    cluster: 'Movements',
    color: '#B45339',
    imageUrl: NAGPUR_DEEKSHA_IMAGE,
    aliases: ['Deekshabhoomi Dhamma Deeksha', 'Historic 22 Vows Ceremony', 'Ashoka Vijaya Dashami 1956'],
    bawsVolume: 'BAWS Vol. 17 (Part 3)',
    provenanceCitation: 'All-India Radio Special Coverage Archive / Prabuddha Bharat Records (Oct 1956)'
  },

  // ── 5. CONSTITUTIONAL & GOVERNANCE CLUSTER ─────────────────────────────────
  {
    id: 'node-constituent-assembly',
    label: 'Constituent Assembly of India',
    category: 'organization',
    shortDesc: 'Sovereign legislative body convened on 9 December 1946 in Constitution Hall, New Delhi, to draft the Constitution of India.',
    year: 1946,
    date: '1946–1950',
    significance: 'Framed the supreme democratic charter transforming a colonial empire into a sovereign socialist secular democratic republic.',
    keyFacts: [
      'Dr. Ambedkar was initially elected from the Bengal Assembly, delivering his famous conciliatory first speech on 17 Dec 1946.',
      'Following partition, re-elected from the Bombay Presidency at the initiative of national leadership.',
      'Met across 11 plenary sessions spanning 2 years, 11 months, and 17 days.'
    ],
    historicalContext: 'Constitution Hall, New Delhi (1946–1950)',
    whyItMatters: 'Provided the democratic crucible that forged universal adult franchise, fundamental rights, and independent institutions.',
    cluster: 'Constitution',
    color: '#5C7873',
    imageUrl: ASSEMBLY_IMAGE,
    aliases: ['Constituent Assembly', 'Constitution Hall Assembly', 'CAD Secretariat'],
    bawsVolume: 'BAWS Vol. 13',
    provenanceCitation: 'Constituent Assembly Debates Official Report / Parliament Library, New Delhi'
  },
  {
    id: 'node-drafting-committee',
    label: 'Drafting Committee',
    category: 'organization',
    shortDesc: 'Seven-member committee appointed by the Constituent Assembly on 29 August 1947, chaired by Dr. B.R. Ambedkar.',
    year: 1947,
    date: '1947-08-29',
    significance: 'Piloted, drafted, and defended all 395 Articles and 8 Schedules that founded the constitutional Republic of India.',
    keyFacts: [
      'Dr. Ambedkar was unanimously elected Chairman at the committee’s first meeting on 30 August 1947.',
      'Colleague T. T. Krishnamachari reported to the Assembly that the entire burden of drafting fell solely on Dr. Ambedkar.',
      'Submitted the complete Draft Constitution to Assembly President Dr. Rajendra Prasad on 21 February 1948.'
    ],
    historicalContext: 'New Delhi (1947–1950)',
    whyItMatters: 'Engineered the institutional balance between strong union governance, judicial review, and individual liberties.',
    cluster: 'Constitution',
    color: '#5C7873',
    imageUrl: DRAFTING_CONSTITUTION_IMAGE,
    aliases: ['Constitution Drafting Committee', 'Drafting Committee of the Constituent Assembly', 'Assembly Drafting Body'],
    bawsVolume: 'BAWS Vol. 13',
    provenanceCitation: 'Constituent Assembly Secretariat Records / National Archives of India'
  },
  {
    id: 'node-bn-rau',
    label: 'Sir B. N. Rau',
    category: 'person',
    shortDesc: 'Distinguished jurist and civil servant appointed Constitutional Adviser to the Constituent Assembly of India.',
    year: 1946,
    significance: 'Prepared the initial working draft of the Constitution and conducted comparative constitutional study tours across USA, UK, Canada, and Ireland.',
    keyFacts: [
      'Prepared an initial draft consisting of 243 Articles and 13 Schedules in October 1947.',
      'Consulted Felix Frankfurter, Justice of the US Supreme Court, who advised on the "due process of law" clause.',
      'Worked in close collegial harmony with Dr. Ambedkar and the Drafting Committee throughout the framing process.'
    ],
    historicalContext: 'New Delhi (1887–1953)',
    whyItMatters: 'Brought extensive comparative constitutional research into direct dialogue with Ambedkar’s drafting vision.',
    cluster: 'Constitution',
    color: '#C88A58',
    aliases: ['B. N. Rau', 'Sir Benegal Narsing Rau', 'Constitutional Adviser B. N. Rau'],
    bawsVolume: 'BAWS Vol. 13',
    provenanceCitation: 'B. Shiva Rao, "The Framing of India’s Constitution: Select Documents"'
  },
  {
    id: 'node-law-minister',
    label: 'First Law Minister Period',
    category: 'organization',
    shortDesc: '1947–1951: Dr. Ambedkar’s cabinet tenure as Independent India’s first Minister of Law and Justice in Jawaharlal Nehru’s government.',
    year: 1947,
    date: '1947–1951',
    significance: 'Pioneered landmark labour welfare reforms, water basin planning, and the progressive Hindu Code Bill for women’s equality.',
    keyFacts: [
      'Drafted and introduced the comprehensive Hindu Code Bill conferring property inheritance and divorce rights on women.',
      'Resigned on principle from the Union Cabinet in September 1951 when the Hindu Code Bill was stalled by conservative opposition.',
      'Established the legal statutory foundation for independent judicial review and election administration.'
    ],
    historicalContext: 'Cabinet Secretariat, New Delhi (1947–1951)',
    whyItMatters: 'Demonstrated an uncompromising ethical standard by resigning high office to defend gender equality and social justice.',
    cluster: 'Constitution',
    color: '#5C7873',
    imageUrl: LAW_MINISTER_IMAGE,
    aliases: ['Ministry of Law and Justice', 'First Law Minister Cabinet', 'Law Minister Resignation 1951'],
    bawsVolume: 'BAWS Vol. 14',
    provenanceCitation: 'Parliamentary Debates (Sept 1951) / Cabinet Secretariat Archives, New Delhi'
  },

  // ── 6. ORGANIZATIONS, INSTITUTIONS & MEDIA CLUSTER ─────────────────────────
  {
    id: 'node-bahishkrit-sabha',
    label: 'Bahishkrit Hitakarini Sabha',
    category: 'organization',
    shortDesc: 'Founded on 20 July 1924 at Damodar Hall, Bombay, to promote education and socio-economic upliftment of marginalized classes.',
    year: 1924,
    date: '1924-07-20',
    significance: 'Coined the immortal foundational mantra: "Educate, Agitate, Organise" (शिकवा, चेतवा, संघटित व्हा).',
    keyFacts: [
      'Established hostels, free libraries, and night schools for working-class youth in Bombay.',
      'Ambedkar served as Chairman of the Managing Committee; Sir Chimanlal Setalvad was its first President.',
      'Served as the organizing platform that later launched the Mahad Satyagraha and civil rights campaigns.'
    ],
    historicalContext: 'Damodar Hall, Parel, Bombay (July 1924)',
    whyItMatters: 'Institutionalized modern organized civic agitation and educational self-help for subaltern India.',
    cluster: 'Organizations',
    color: '#5C7873',
    aliases: ['Hitakarini Sabha Parel', 'Depressed Classes Welfare Association', 'Bahishkrit Hitakarini Sabha Bombay'],
    bawsVolume: 'BAWS Vol. 17 (Part 1)',
    provenanceCitation: 'Damodar Hall Bombay Founding Records / Charity Commissioner Bombay'
  },
  {
    id: 'node-mooknayak',
    label: 'Mooknayak Newspaper',
    category: 'media',
    shortDesc: 'Founded on 31 January 1920 in Bombay: Dr. Ambedkar’s first historic fortnightly newspaper, "Leader of the Silent".',
    year: 1920,
    date: '1920-01-31',
    significance: 'The historic starting point of Dr. Ambedkar’s independent journalistic crusade for human emancipation.',
    keyFacts: [
      'Financed with a contribution of ₹2,500 from Chhatrapati Shahu Maharaj of Kolhapur.',
      'Featured the Sant Tukaram epigraph on its masthead: "What cause has a mute person to feel ashamed?"',
      'Exposed the contradictions of mainstream nationalist journalism that ignored subaltern oppression.'
    ],
    historicalContext: 'Parel, Bombay (January 1920)',
    whyItMatters: 'Gave a fearless, independent media voice to millions who had been silenced for centuries.',
    cluster: 'Organizations',
    color: '#C89D56',
    aliases: ['Mooknayak', 'Leader of the Silent', 'Mooknayak Fortnightly (1920)'],
    bawsVolume: 'BAWS Vol. 17 (Part 1)',
    provenanceCitation: 'Mooknayak Archives / Bombay Native Newspaper Reports (1920)'
  },
  {
    id: 'node-bahishkrit-bharat',
    label: 'Bahishkrit Bharat Journal',
    category: 'media',
    shortDesc: 'Founded on 3 April 1927 in Bombay: Dr. Ambedkar’s second fortnightly Marathi journal, "Excluded India".',
    year: 1927,
    date: '1927-04-03',
    significance: 'Served as the ideological mouthpiece documenting the Mahad Satyagraha and civil rights philosophy.',
    keyFacts: [
      'Ambedkar wrote 31 historic, scholarly editorials analyzing social inequality and colonial politics.',
      'Featured Sant Dnyaneshwar’s verses advocating universal moral justice on its front page.',
      'Refused commercial advertisements that compromised journalistic independence.'
    ],
    historicalContext: 'Bombay (1927–1929)',
    whyItMatters: 'Masterpiece of regional political journalism that shaped the ideological contours of modern Dalit literature.',
    cluster: 'Organizations',
    color: '#C89D56',
    aliases: ['Bahishkrit Bharat', 'Excluded India Fortnightly', 'Bahishkrit Bharat 1927'],
    bawsVolume: 'BAWS Vol. 17 (Part 1)',
    provenanceCitation: 'Bahishkrit Bharat Collection, Mumbai / Maharashtra State Archives'
  },
  {
    id: 'node-independent-labour-party',
    label: 'Independent Labour Party',
    category: 'organization',
    shortDesc: 'Political party founded by Dr. Ambedkar in August 1936 advocating workers’ rights, peasant land reform, and anti-caste unity.',
    year: 1936,
    date: '1936-08-15',
    significance: 'Swept 14 of 17 contested seats in the 1937 Bombay Legislative Assembly elections, becoming the official opposition.',
    keyFacts: [
      'Crafted a progressive manifesto uniting industrial mill workers, agricultural tenants, and subaltern masses.',
      'Organized the historic 1938 peasant march of 20,000 farmers to the Bombay Council against the Khoti landlord system.',
      'Vehemently opposed the anti-worker Industrial Disputes Bill in the Bombay legislature.'
    ],
    historicalContext: 'Bombay Legislative Assembly (1936–1942)',
    whyItMatters: 'Pioneered an intersectional political coalition bridging the socialist labour movement and anti-caste liberation.',
    cluster: 'Organizations',
    color: '#5C7873',
    aliases: ['ILP', 'Independent Labour Party Bombay', 'ILP 1936'],
    bawsVolume: 'BAWS Vol. 17 (Part 2)',
    provenanceCitation: 'Election Results Report, Bombay Legislative Assembly (1937) / BAWS Vol. 17 (Part 2)'
  },
  {
    id: 'node-peoples-education-society',
    label: 'People’s Education Society',
    category: 'organization',
    shortDesc: 'Educational trust established by Dr. Ambedkar in Bombay on 8 July 1945 to provide collegiate higher education to underprivileged youth.',
    year: 1945,
    date: '1945-07-08',
    significance: 'Founded Siddharth College of Arts & Science (1946) in Bombay and Milind College (1950) in Aurangabad.',
    keyFacts: [
      'Built upon the democratic conviction that higher education is the most potent instrument for socio-economic mobility.',
      'Dr. Ambedkar donated his personal earnings and library resources to establish Siddharth College.',
      'Created non-sectarian academic environments where merit and character superseded caste origins.'
    ],
    historicalContext: 'Fort, Bombay / Aurangabad (1945–1956)',
    whyItMatters: 'Nurtured first-generation graduates who went on to become jurists, civil servants, writers, and national leaders.',
    cluster: 'Organizations',
    color: '#5C7873',
    aliases: ['PES Bombay', 'People’s Education Trust', 'Siddharth College Society'],
    bawsVolume: 'BAWS Vol. 17 (Part 1)',
    provenanceCitation: 'Trust Deed of People’s Education Society, Bombay, 1945 / Charity Commissioner Mumbai'
  },
  {
    id: 'node-rbi',
    label: 'Reserve Bank of India',
    category: 'organization',
    shortDesc: 'Central banking institution formed in 1935 following the Hilton-Young Royal Commission on Indian Currency and Finance.',
    year: 1935,
    date: '1935-04-01',
    significance: 'Statutorily designed using Dr. Ambedkar’s guidelines on currency stability presented in "The Problem of the Rupee".',
    keyFacts: [
      'The Hilton-Young Commission (1926) closely interrogated Dr. Ambedkar’s testimony and books on currency mechanics.',
      'Ambedkar advocated an independent central bank shielded from political interference by the executive.',
      'Established under the Reserve Bank of India Act, 1934, beginning operations on 1 April 1935.'
    ],
    historicalContext: 'Calcutta / Bombay (1934–1935)',
    whyItMatters: 'Demonstrated Dr. Ambedkar’s foundational impact on the macroeconomic architecture of independent India.',
    cluster: 'Organizations',
    color: '#5C7873',
    aliases: ['RBI', 'Reserve Bank of India', 'Hilton-Young Central Bank'],
    bawsVolume: 'BAWS Vol. 6',
    provenanceCitation: 'Report of the Royal Commission on Indian Currency and Finance (1926) / RBI History Vol. 1'
  },
  {
    id: 'node-govt-maharashtra',
    label: 'Government of Maharashtra',
    category: 'organization',
    shortDesc: 'State archival authority and publisher of the monumental 22-volume series "Dr. Babasaheb Ambedkar: Writings and Speeches" (BAWS).',
    year: 1979,
    significance: 'The official custodian responsible for preserving, authenticating, and publishing Dr. Ambedkar’s complete archival corpus.',
    keyFacts: [
      'Formed the Dr. Babasaheb Ambedkar Source Material Publication Committee in 1979.',
      'Vasant Moon served as officer on special duty, compiling thousands of unpublished archival pages.',
      'Serves as the primary source of truth for all verified documents in this digital heritage archive.'
    ],
    historicalContext: 'Higher Education Department, Mumbai (1979–Present)',
    whyItMatters: 'Rescued Ambedkar’s primary manuscripts from obscurity, establishing an immutable public scholarly record.',
    cluster: 'Organizations',
    color: '#5C7873',
    aliases: ['Govt of Maharashtra Higher Education', 'BAWS Publication Committee', 'Dr. Ambedkar Charitra Sadhan Samiti'],
    bawsVolume: 'BAWS Editorial Board',
    provenanceCitation: 'Maharashtra State Archives, Elphinstone College Building, Mumbai'
  },

  // ── 7. PHILOSOPHICAL & CONSTITUTIONAL CONCEPTS CLUSTER ────────────────────
  {
    id: 'node-liberty-equality-fraternity',
    label: 'Liberty, Equality, Fraternity',
    category: 'concept',
    shortDesc: 'The inseparable "Union of Trinity" defining social democracy: to divorce one from the other is to defeat democracy itself.',
    significance: 'The core philosophical bedrock enshrined in the Preamble of the Constitution of India.',
    keyFacts: [
      'Articulated in Dr. Ambedkar’s farewell address to the Constituent Assembly on 25 November 1949.',
      'Clarified that he derived these principles not from the French Revolution, but from the teachings of Gautama Buddha.',
      'Warned that liberty without equality permits the supremacy of the few, while equality without liberty smothers individual initiative.'
    ],
    historicalContext: 'Constituent Assembly of India (25 November 1949)',
    whyItMatters: 'Guarantees that Indian constitutional jurisprudence treats liberty and social justice as mutually reinforcing values.',
    cluster: 'Concepts',
    color: '#657D5A',
    aliases: ['Union of Trinity', 'Preamble Constitutional Trinity', 'Trikona Principle'],
    bawsVolume: 'BAWS Vol. 13 & Vol. 1',
    provenanceCitation: 'Constituent Assembly Closing Speech (Nov 25, 1949) / CAD Vol. XI'
  },
  {
    id: 'node-constitutional-morality',
    label: 'Constitutional Morality',
    category: 'concept',
    shortDesc: 'Supreme adherence to democratic norms, checks and balances, and institutional restraint over populist majoritarian impulses.',
    significance: 'Essential prerequisite preventing democratic constitutions from decaying into elected authoritarianism.',
    keyFacts: [
      'Introduced on 4 November 1948 in the Constituent Assembly, quoting historian George Grote.',
      'Declared: "Constitutional morality is not a natural sentiment. It has to be cultivated. We must realize that our people have yet to learn it."',
      'Argued that democratic governance requires deep respect for institutional norms, fair play, and minority rights.'
    ],
    historicalContext: 'CAD Vol. VII (4 November 1948)',
    whyItMatters: 'Invoked by modern constitutional courts to strike down arbitrary executive overreach and protect citizen dignity.',
    cluster: 'Concepts',
    color: '#657D5A',
    aliases: ['Doctrine of Constitutional Morality', 'Grote’s Constitutional Morality', 'Democratic Restraint'],
    bawsVolume: 'BAWS Vol. 13',
    provenanceCitation: 'Constituent Assembly Debates (Nov 4, 1948) / CAD Vol. VII'
  },
  {
    id: 'node-state-socialism',
    label: 'State Socialism',
    category: 'concept',
    shortDesc: 'Constitutional retention of key industries, insurance, and agricultural land in national stewardship to prevent monopoly exploitation.',
    significance: 'Economic framework articulated in "States and Minorities" to guarantee that political freedom is grounded in economic security.',
    keyFacts: [
      'Proposed in Part II, Section II of States and Minorities (1947).',
      'Demanded that state socialism be written into the fundamental law so that subsequent parliamentary majorities could not dismantle it.',
      'Sought to eliminate private landlordism while providing equitable agrarian credit and collective farming.'
    ],
    historicalContext: 'New Delhi (1947)',
    whyItMatters: 'Articulated a non-totalitarian, democratic model of state-led economic justice for developing republics.',
    cluster: 'Concepts',
    color: '#657D5A',
    aliases: ['Democratic State Socialism', 'Constitutional Economics', 'States & Minorities Socialism'],
    bawsVolume: 'BAWS Vol. 1',
    provenanceCitation: 'States and Minorities Section II, Clause 4 (1947)'
  },
  {
    id: 'node-social-endosmosis',
    label: 'Social Endosmosis',
    category: 'concept',
    shortDesc: 'Continuous, unobstructed communication and reciprocal exchange between all social groups without artificial barriers.',
    significance: 'Dr. Ambedkar’s sociological formula for dismantling caste endogamy and fostering organic nationwide fraternity.',
    keyFacts: [
      'Derived from John Dewey’s sociological concept and refined in Annihilation of Caste (Section XIV).',
      'Argued that an ideal society must be mobile, full of channels for conveying change from one group to another.',
      'Showed that caste prevents endosmosis by enclosing groups in watertight compartments of mutual suspicion.'
    ],
    historicalContext: 'Columbia University / Bombay (1916–1936)',
    whyItMatters: 'Provides the definitive theoretical benchmark for inclusive social cohesion and anti-segregation policy.',
    cluster: 'Concepts',
    color: '#657D5A',
    aliases: ['Deweyan Social Flow', 'Associated Living Flow', 'Social Permeability'],
    bawsVolume: 'BAWS Vol. 1',
    provenanceCitation: 'Annihilation of Caste Section XIV / Columbia Graduate Seminar Papers'
  },
  {
    id: 'node-article-32',
    label: 'Article 32: Constitutional Remedies',
    category: 'concept',
    shortDesc: 'Direct right to petition the Supreme Court of India for the enforcement of Fundamental Rights via constitutional writs.',
    significance: 'Hailed by Dr. Ambedkar as "the very soul of the Constitution and the very heart of it".',
    keyFacts: [
      'Defended forcefully in the Constituent Assembly on 9 December 1948.',
      'Empowers the Supreme Court to issue writs of Habeas Corpus, Mandamus, Prohibition, Quo Warranto, and Certiorari.',
      'Ensures that fundamental rights are not toothless paper declarations but immediately enforceable claims.'
    ],
    historicalContext: 'CAD Vol. VII (9 December 1948)',
    whyItMatters: 'The cornerstone of Indian judicial independence and public interest litigation for citizen liberties.',
    cluster: 'Concepts',
    color: '#657D5A',
    aliases: ['Article 32', 'Heart and Soul of the Constitution', 'Right to Constitutional Remedies'],
    bawsVolume: 'BAWS Vol. 13',
    provenanceCitation: 'Constituent Assembly Debates (Dec 9, 1948) / Constitution of India Article 32'
  },

  // ── 8. HISTORIC PLACES & RESIDENCES CLUSTER ────────────────────────────────
  {
    id: 'node-place-mhow',
    label: 'Mhow (Dr. Ambedkar Nagar)',
    category: 'place',
    shortDesc: 'Military cantonment town in the Central Provinces (now Madhya Pradesh) where Dr. B.R. Ambedkar was born on 14 April 1891.',
    year: 1891,
    significance: 'Birthplace of Dr. Ambedkar; his father Ramji Sakpal served as Subedar-Major in the British Indian Army.',
    keyFacts: [
      'Fourteenth and youngest child of Ramji Maloji Sakpal and Bhimabai.',
      'Military cantonment environment provided early schooling and English discipline.',
      'Officially renamed Dr. Ambedkar Nagar by the Government of Madhya Pradesh in 2003.'
    ],
    historicalContext: 'Central Provinces, British India (1891)',
    whyItMatters: 'National memorial sanctuary commemorating the humble origins of India’s greatest social emancipator.',
    cluster: 'Places',
    color: '#8B5E3C',
    aliases: ['Mhow', 'Dr. Ambedkar Nagar', 'Mhow Cantonment'],
    bawsVolume: 'BAWS Vol. 17 (Part 1)',
    provenanceCitation: 'Military Cantonment Records Mhow (1891) / Maharashtra Gazetteers'
  },
  {
    id: 'node-place-bombay',
    label: 'Bombay (Rajgruha)',
    category: 'place',
    shortDesc: 'Historic residence in Hindu Colony, Dadar, Bombay, built by Dr. Ambedkar in the 1930s to house his personal library of 50,000+ books.',
    year: 1930,
    significance: 'The intellectual sanctuary and strategic nerve center where Dr. Ambedkar wrote his major treatises and drafted legislation.',
    keyFacts: [
      'Named "Rajgruha" after the ancient capital of King Bimbisara in Buddhist Magadha.',
      'Specially designed with three floors: two floors for books and research, one floor for family residence.',
      'Housed one of the largest private personal libraries in Asia, containing rare manuscripts across history, law, and economics.'
    ],
    historicalContext: 'Dadar, Bombay (1930–1956)',
    whyItMatters: 'Enduring monument to Dr. Ambedkar’s lifelong passion for scholarship and bibliophilic discipline.',
    cluster: 'Places',
    color: '#8B5E3C',
    imageUrl: RAJGRUHA_LIBRARY_IMAGE,
    aliases: ['Rajgruha', 'Rajgriha Dadar', 'Hindu Colony Residence Bombay'],
    bawsVolume: 'BAWS Vol. 17 (Part 1)',
    provenanceCitation: 'Bombay Municipal Corporation Records / BAWS Biographical Chronicles'
  },
  {
    id: 'node-place-nagpur',
    label: 'Nagpur (Deekshabhoomi)',
    category: 'place',
    shortDesc: 'Historic ground in Nagpur, Maharashtra, where Dr. Ambedkar and 500,000 followers embraced Buddhism on 14 October 1956.',
    year: 1956,
    significance: 'The sacred world heritage sanctuary of modern Buddhist revival, surmounted by the largest hollow stupa in Asia.',
    keyFacts: [
      'Chosen by Dr. Ambedkar because ancient Nagpur was inhabited by the historical Nagas who championed Buddhism.',
      'Site where Dr. Ambedkar administered the revolutionary 22 Vows (Bais Pratigya).',
      'Visited by millions of pilgrims annually on Dhammachakra Pravartan Din.'
    ],
    historicalContext: 'Nagpur, Maharashtra (October 1956)',
    whyItMatters: 'Symbol of spiritual liberation, peaceful self-respect, and moral awakening for marginalized humanity.',
    cluster: 'Places',
    color: '#8B5E3C',
    imageUrl: NAGPUR_DEEKSHA_IMAGE,
    aliases: ['Deekshabhoomi', 'Nagpur Deekshabhoomi Stupa', 'Nagpur Buddhist Center'],
    bawsVolume: 'BAWS Vol. 11 & Vol. 17 (Part 3)',
    provenanceCitation: 'Deekshabhoomi Smarak Samiti Records / Nagpur District Gazetteers'
  },
  {
    id: 'node-place-london',
    label: 'London',
    category: 'place',
    shortDesc: 'Capital of the United Kingdom; the center of Dr. Ambedkar’s European studies (LSE, Gray’s Inn) and Round Table Conference diplomacy.',
    year: 1916,
    significance: 'Scene of Dr. Ambedkar’s intense academic research in the British Museum and international constitutional advocacy.',
    keyFacts: [
      'Resided at 10 King Henry’s Road, Primrose Hill, London (now preserved as an official memorial).',
      'Spent 14–16 hours daily researching at the British Museum Reading Room.',
      'Challenged colonial authorities and nationalist leadership at St. James’s Palace (1930–1932).'
    ],
    historicalContext: 'London, United Kingdom (1916–1923, 1930–1932)',
    whyItMatters: 'The global stage where Dr. Ambedkar established Indian subaltern rights as an international human rights imperative.',
    cluster: 'Places',
    color: '#8B5E3C',
    imageUrl: ROUND_TABLE_IMAGE,
    aliases: ['London City', 'King Henry’s Road London', 'St. James’s Palace London'],
    bawsVolume: 'BAWS Vol. 2 & Vol. 6',
    provenanceCitation: 'London County Council Heritage Records / British Museum Archives'
  }
];

export const KNOWLEDGE_GRAPH_LINKS: KnowledgeGraphLink[] = [
  // ── Ambedkar -> Writings ──────────────────────────────────────────────────
  { id: 'l-amb-annihilate', sourceId: 'node-ambedkar', targetId: 'node-annihilation', relation: 'authored', notes: 'Authored in 1936 exposing the shastric foundations of graded inequality.' },
  { id: 'l-amb-rupee', sourceId: 'node-ambedkar', targetId: 'node-rupee-problem', relation: 'authored', notes: 'Doctoral dissertation at LSE published in London by P. S. King & Son (1923).' },
  { id: 'l-amb-castes', sourceId: 'node-ambedkar', targetId: 'node-castes-in-india', relation: 'authored', notes: 'First paper delivered at Columbia University seminar establishing endogamy as caste mechanism (1916).' },
  { id: 'l-amb-states', sourceId: 'node-ambedkar', targetId: 'node-states-minorities', relation: 'authored', notes: 'Constitutional charter submitted to the Assembly advocating fundamental rights and state socialism (1947).' },
  { id: 'l-amb-who-shudras', sourceId: 'node-ambedkar', targetId: 'node-who-were-shudras', relation: 'authored', notes: 'Historical inquiry into Aryan history dedicated to Mahatma Jyotirao Phule (1946).' },
  { id: 'l-amb-the-untouchables', sourceId: 'node-ambedkar', targetId: 'node-the-untouchables', relation: 'authored', notes: 'Formulated the Broken Men thesis on the historical origins of untouchability (1948).' },
  { id: 'l-amb-buddha-dhamma', sourceId: 'node-ambedkar', targetId: 'node-buddha-and-dhamma', relation: 'authored', notes: 'Posthumously published magnum opus reinterpreting Buddhism as social morality (1957).' },
  { id: 'l-amb-riddles', sourceId: 'node-ambedkar', targetId: 'node-riddles-in-hinduism', relation: 'authored', notes: 'Rationalist critique investigating contradictions in ancient scriptures (1954).' },
  { id: 'l-amb-vol13', sourceId: 'node-ambedkar', targetId: 'node-baws-vol-13', relation: 'authored', notes: 'Complete floor debates and interventions in the Constituent Assembly compiled in Volume 13.' },

  // ── Ambedkar -> Education & Intellectual ──────────────────────────────────
  { id: 'l-amb-columbia', sourceId: 'node-ambedkar', targetId: 'node-columbia', relation: 'studied at', notes: 'Earned M.A. (1915) and Ph.D. (1927); conferred Honorary LL.D. in 1952.' },
  { id: 'l-amb-dewey', sourceId: 'node-ambedkar', targetId: 'node-john-dewey', relation: 'studied under', notes: 'Mentored in pragmatist philosophy, scientific method, and democratic ethics at Columbia.' },
  { id: 'l-amb-seligman', sourceId: 'node-ambedkar', targetId: 'node-edwin-seligman', relation: 'studied under', notes: 'Advised on public finance and provincial fiscal decentralization at Columbia.' },
  { id: 'l-amb-lse', sourceId: 'node-ambedkar', targetId: 'node-lse', relation: 'studied at', notes: 'Awarded M.Sc. (1921) and D.Sc. (Economics, 1923) on monetary policy.' },
  { id: 'l-amb-grays-inn', sourceId: 'node-ambedkar', targetId: 'node-grays-inn', relation: 'called to bar at', notes: 'Admitted in 1916; called to the Bar on 28 June 1923 as Barrister-at-Law.' },
  { id: 'l-amb-elphinstone', sourceId: 'node-ambedkar', targetId: 'node-elphinstone', relation: 'studied at', notes: 'Graduated B.A. in English and Persian in 1912 from the University of Bombay.' },
  { id: 'l-amb-gaekwad', sourceId: 'node-ambedkar', targetId: 'node-sayajirao-gaekwad', relation: 'patronized by', notes: 'Granted state scholarship of £11.50/month in June 1913 for Columbia doctoral studies.' },

  // ── Ambedkar -> Movements & Events ────────────────────────────────────────
  { id: 'l-amb-mahad', sourceId: 'node-ambedkar', targetId: 'node-mahad', relation: 'led', notes: 'Led 10,000+ delegates to Chavdar Tank on 20 March 1927 asserting civic equality.' },
  { id: 'l-amb-manusmriti', sourceId: 'node-ambedkar', targetId: 'node-manusmriti-dahan', relation: 'directed', notes: 'Ceremonially burned the ancient code on 25 December 1927 as a declaration of equality.' },
  { id: 'l-amb-kalaram', sourceId: 'node-ambedkar', targetId: 'node-kalaram', relation: 'led', notes: 'Piloted the five-year non-violent temple entry civil rights campaign in Nashik (1930–1935).' },
  { id: 'l-amb-poona-pact', sourceId: 'node-ambedkar', targetId: 'node-poona-pact', relation: 'signed', notes: 'Negotiated with caste Hindu leaders at Yerwada Jail securing 148 reserved seats (1932).' },
  { id: 'l-amb-rtc', sourceId: 'node-ambedkar', targetId: 'node-round-table', relation: 'participated in', notes: 'Represented Depressed Classes across all three London Round Table Conferences (1930–1932).' },
  { id: 'l-amb-nagpur', sourceId: 'node-ambedkar', targetId: 'node-nagpur-conversion', relation: 'led', notes: 'Embraced Buddhism and administered the 22 Vows to 500,000 followers on 14 October 1956.' },

  // ── Ambedkar -> Constitutional Institutions ───────────────────────────────
  { id: 'l-amb-assembly', sourceId: 'node-ambedkar', targetId: 'node-constituent-assembly', relation: 'member of', notes: 'Elected from Bengal, re-elected from Bombay; piloted national drafting debates.' },
  { id: 'l-amb-drafting', sourceId: 'node-ambedkar', targetId: 'node-drafting-committee', relation: 'chaired', notes: 'Unanimously elected Chairman on 29 August 1947, crafting 395 Articles and 8 Schedules.' },
  { id: 'l-amb-law-min', sourceId: 'node-ambedkar', targetId: 'node-law-minister', relation: 'served as', notes: 'First Law and Justice Minister of India (1947–1951), championing the Hindu Code Bill.' },
  { id: 'l-drafting-bnrau', sourceId: 'node-drafting-committee', targetId: 'node-bn-rau', relation: 'collaborated with', notes: 'Sir B. N. Rau prepared the initial working draft examined by the Drafting Committee.' },
  { id: 'l-drafting-vol13', sourceId: 'node-drafting-committee', targetId: 'node-baws-vol-13', relation: 'documented in', notes: 'Drafting committee debates and floor revisions compiled in official Volume 13.' },

  // ── Ambedkar -> Organizations & Publications ──────────────────────────────
  { id: 'l-amb-sabha', sourceId: 'node-ambedkar', targetId: 'node-bahishkrit-sabha', relation: 'founded', notes: 'Established on 20 July 1924 with the motto: "Educate, Agitate, Organise".' },
  { id: 'l-amb-mooknayak', sourceId: 'node-ambedkar', targetId: 'node-mooknayak', relation: 'founded', notes: 'Launched historic Marathi fortnightly newspaper on 31 January 1920 in Bombay.' },
  { id: 'l-amb-bharat', sourceId: 'node-ambedkar', targetId: 'node-bahishkrit-bharat', relation: 'founded', notes: 'Founded journal on 3 April 1927 in Bombay, writing 31 foundational editorials.' },
  { id: 'l-amb-ilp', sourceId: 'node-ambedkar', targetId: 'node-independent-labour-party', relation: 'founded', notes: 'Formed in August 1936, winning 14 assembly seats in 1937 elections.' },
  { id: 'l-amb-pes', sourceId: 'node-ambedkar', targetId: 'node-peoples-education-society', relation: 'founded', notes: 'Established educational trust in 1945, founding Siddharth and Milind Colleges.' },
  { id: 'l-amb-rbi', sourceId: 'node-ambedkar', targetId: 'node-rbi', relation: 'influenced', notes: 'Hilton-Young Commission utilized Ambedkar’s currency treatise to charter the central bank.' },
  { id: 'l-amb-mah-govt', sourceId: 'node-ambedkar', targetId: 'node-govt-maharashtra', relation: 'published by', notes: 'Official custodian and publisher of the 22-volume BAWS archival series.' },

  // ── Ambedkar -> Philosophical & Constitutional Concepts ───────────────────
  { id: 'l-amb-trinity', sourceId: 'node-ambedkar', targetId: 'node-liberty-equality-fraternity', relation: 'articulated', notes: 'Stressed in final Assembly address as an indivisible "Union of Trinity".' },
  { id: 'l-amb-morality', sourceId: 'node-ambedkar', targetId: 'node-constitutional-morality', relation: 'formulated', notes: 'Introduced in CAD on 4 Nov 1948 as the essential prerequisite for republican survival.' },
  { id: 'l-amb-socialism', sourceId: 'node-ambedkar', targetId: 'node-state-socialism', relation: 'advocated', notes: 'Articulated in States and Minorities as constitutional guarantee of economic democracy.' },
  { id: 'l-amb-endosmosis', sourceId: 'node-ambedkar', targetId: 'node-social-endosmosis', relation: 'formulated', notes: 'Coined in Annihilation of Caste to describe democratic social interchange.' },
  { id: 'l-amb-art32', sourceId: 'node-ambedkar', targetId: 'node-article-32', relation: 'piloted', notes: 'Hailed Article 32 on 9 Dec 1948 as the heart and soul of the Constitution.' },

  // ── Ambedkar -> Historic Places ───────────────────────────────────────────
  { id: 'l-amb-mhow', sourceId: 'node-ambedkar', targetId: 'node-place-mhow', relation: 'born in', notes: 'Born in the military cantonment of Mhow on 14 April 1891.' },
  { id: 'l-amb-bombay', sourceId: 'node-ambedkar', targetId: 'node-place-bombay', relation: 'resided in', notes: 'Built Rajgruha residence in Dadar, Bombay, to house his 50,000-volume library.' },
  { id: 'l-amb-nagpur-place', sourceId: 'node-ambedkar', targetId: 'node-place-nagpur', relation: 'converted at', notes: 'Chose Nagpur as the sanctuary for mass Buddhist conversion on 14 October 1956.' },
  { id: 'l-amb-london-place', sourceId: 'node-ambedkar', targetId: 'node-place-london', relation: 'studied in', notes: 'Resided at King Henry’s Road while studying at LSE and reading at Gray’s Inn.' },

  // ── Cross-Cluster Interconnections ────────────────────────────────────────
  { id: 'l-dewey-annihilate', sourceId: 'node-john-dewey', targetId: 'node-annihilation', relation: 'influenced', notes: 'Deweyan pragmatism informs the democratic communication thesis of Annihilation of Caste.' },
  { id: 'l-dewey-endosmosis', sourceId: 'node-john-dewey', targetId: 'node-social-endosmosis', relation: 'inspired', notes: 'Dewey’s associated living inspired Ambedkar’s theory of social endosmosis.' },
  { id: 'l-columbia-castes', sourceId: 'node-columbia', targetId: 'node-castes-in-india', relation: 'presented at', notes: 'Presented in Alexander Goldenweiser’s anthropology seminar at Columbia in May 1916.' },
  { id: 'l-lse-rupee', sourceId: 'node-lse', targetId: 'node-rupee-problem', relation: 'submitted at', notes: 'Researched under Edwin Cannan and accepted as D.Sc. dissertation by LSE in 1923.' },
  { id: 'l-rupee-rbi', sourceId: 'node-rupee-problem', targetId: 'node-rbi', relation: 'provided basis for', notes: 'Provided the monetary principles on currency stabilization that guided the RBI charter.' },
  { id: 'l-states-socialism', sourceId: 'node-states-minorities', targetId: 'node-state-socialism', relation: 'codified', notes: 'States and Minorities codified State Socialism as Part II of its proposed constitution.' },
  { id: 'l-states-art32', sourceId: 'node-states-minorities', targetId: 'node-article-32', relation: 'precursor to', notes: 'Fundamental rights remedies in States and Minorities became Article 32 of the Constitution.' },
  { id: 'l-mahad-bharat', sourceId: 'node-mahad', targetId: 'node-bahishkrit-bharat', relation: 'documented in', notes: 'Bahishkrit Bharat journal reported the Mahad civil rights proceedings in detail.' },
  { id: 'l-sabha-mahad', sourceId: 'node-bahishkrit-sabha', targetId: 'node-mahad', relation: 'organized', notes: 'Bahishkrit Hitakarini Sabha organized the historic 1927 Mahad civil rights conference.' },
  { id: 'l-poona-rtc', sourceId: 'node-poona-pact', targetId: 'node-round-table', relation: 'consequence of', notes: 'Poona Pact resolved the impasse created by the British Communal Award after the RTC.' },
  { id: 'l-assembly-drafting', sourceId: 'node-constituent-assembly', targetId: 'node-drafting-committee', relation: 'appointed', notes: 'The Constituent Assembly appointed the Drafting Committee on 29 August 1947.' },
  { id: 'l-assembly-morality', sourceId: 'node-constituent-assembly', targetId: 'node-constitutional-morality', relation: 'debated at', notes: 'Constitutional morality was articulated in Constitution Hall on 4 November 1948.' },
  { id: 'l-assembly-trinity', sourceId: 'node-constituent-assembly', targetId: 'node-liberty-equality-fraternity', relation: 'proclaimed at', notes: 'Proclaimed in the farewell address to the Constituent Assembly on 25 November 1949.' },
  { id: 'l-nagpur-buddha', sourceId: 'node-nagpur-conversion', targetId: 'node-buddha-and-dhamma', relation: 'celebrated with', notes: 'The Nagpur conversion ceremony embodied the moral philosophy of The Buddha and His Dhamma.' }
];

// 6. AI STORY MODE (GUIDED HISTORICAL PATHWAYS - CHILD & STUDENT FRIENDLY)
export const GUIDED_STORY_PATHS: GuidedStoryPath[] = [
  {
    id: 'story-early-life',
    title: 'The Boy Who Loved Books',
    subtitle: 'From a Gunny Sack in Classroom to Columbia & London',
    badge: 'Child Friendly · Ages 7+',
    era: '1891–1923',
    durationMinutes: 6,
    heroImage: HERO_IMAGE,
    description: 'Discover how young Bhim faced unfair rules in school, kept his courage high, studied day and night, and earned the highest college degrees in the world!',
    kidSummary: 'Even when bullies and strict teachers told him he could not sit with others, little Bhim carried his own sack to sit on, studied harder than everyone, and became the smartest boy in the room!',
    steps: [
      {
        stepNumber: 1,
        title: 'Young Bhimrao at School',
        location: 'Satara, Maharashtra',
        year: 1900,
        narrativeText: 'Young Bhimrao was eager to learn math, languages, and science. However, because of unjust caste rules at the time, he was not allowed to sit on the classroom benches with other students. He had to bring his own gunny sack from home and sit near the doorway.',
        kidFriendlyText: 'Imagine going to school and not being allowed to sit on a chair just because of where you were born! Little Bhim didn’t cry or give up. Instead, he brought his own burlap bag, sat right by the door, and listened extra carefully so he wouldn’t miss a single word.',
        audioVoiceoverExcerpt: 'Young Bhimrao brought his own gunny sack to school every morning, proving that true wisdom cannot be stopped by unfair walls.',
        imageUrl: HERO_IMAGE,
        imageCaption: 'Young Dr. Ambedkar as an eager student dedicated to learning.',
        videoTitle: 'Illustrated Story Reel: Young Bhim and the Classroom Doorway',
        videoDuration: '02:40',
        videoReelClip: 'Animated reconstruction of young Bhimrao in Satara school holding his reading slate with unwavering determination.',
        badgeReward: '🎒 Resilient Scholar Badge',
        kidFriendlyStickers: ['🎒', '📖', '⭐', '✨'],
        archivalDocId: 'castes-in-india-1916',
        interactiveQuestion: {
          prompt: 'What did young Bhim bring to school every day to sit on?',
          options: ['A wooden stool', 'A gunny sack from home', 'A soft cushion', 'A folding chair'],
          correctIndex: 1,
          funFact: 'He washed that sack himself every week so he would always arrive tidy and ready to study!'
        }
      },
      {
        stepNumber: 2,
        title: 'Across the Oceans to Columbia University',
        location: 'New York City, USA',
        year: 1913,
        narrativeText: 'With a scholarship from the progressive Maharaja of Baroda, Sayajirao Gaekwad III, Bhimrao sailed to New York City to attend Columbia University. For the first time, he lived freely without caste discrimination, studying in the university library for up to 18 hours every day.',
        kidFriendlyText: 'He traveled across the wide ocean in a big steamship to New York! In America, everyone was treated fairly. Bhim was so excited that he stayed in the library from morning till midnight, reading thousands of giant books.',
        audioVoiceoverExcerpt: 'At Columbia University, freedom of learning opened new horizons. He studied economics, history, and moral philosophy.',
        imageUrl: RAJGRUHA_LIBRARY_IMAGE,
        imageCaption: 'Dr. Ambedkar in a university library with stacks of scholarly treatises.',
        videoTitle: 'Archival Documentary: Crossing Oceans to Columbia (1913)',
        videoDuration: '03:15',
        videoReelClip: 'Historic footage of New York harbour, Columbia University Low Library, and the scholar engrossed in reading.',
        badgeReward: '🗽 Global Pioneer Badge',
        kidFriendlyStickers: ['🚢', '🗽', '📚', '🌟'],
        archivalDocId: 'castes-in-india-1916',
        interactiveQuestion: {
          prompt: 'In which famous American city is Columbia University located?',
          options: ['Los Angeles', 'New York City', 'Chicago', 'San Francisco'],
          correctIndex: 1,
          funFact: 'Dr. Ambedkar earned his Master’s degree and Ph.D. at Columbia, writing groundbreaking papers on society and economics!'
        }
      },
      {
        stepNumber: 3,
        title: 'The London Scholar and Doctor of Science',
        location: 'London School of Economics & Gray’s Inn, UK',
        year: 1923,
        narrativeText: 'Dr. Ambedkar moved to London to study law at Gray’s Inn and economics at the London School of Economics. Despite living on just tea and stale bread to save book money, he completed his Doctor of Science (D.Sc.) thesis on the Problem of the Rupee.',
        kidFriendlyText: 'In London, he skipped fancy meals and ate simple dry bread so he could save every penny to buy books. He became a Barrister-at-Law and earned a Doctor of Science degree!',
        audioVoiceoverExcerpt: 'Knowledge was his armor. He skipped dinners to purchase volumes that would later guide India’s democratic economic foundations.',
        imageUrl: HERO_IMAGE,
        imageCaption: 'Dr. Ambedkar with academic robes after receiving doctoral honors in London.',
        videoTitle: 'Historic London Reel: Gray’s Inn Barrister & LSE Doctor of Science',
        videoDuration: '03:30',
        videoReelClip: 'Visual footage of historic London libraries, book barrows, and British Museum reading hall where Ambedkar researched.',
        badgeReward: '⚖️ Barrister Supreme Badge',
        kidFriendlyStickers: ['⚖️', '🎓', '🏆', '💎'],
        archivalDocId: 'the-problem-of-the-rupee-1923',
        interactiveQuestion: {
          prompt: 'Why did Dr. Ambedkar save his lunch money in London?',
          options: ['To buy toys', 'To buy precious books to read', 'To buy a fancy carriage', 'To go to the cinema'],
          correctIndex: 1,
          funFact: 'He collected more than 50,000 books in his lifetime, creating one of Asia’s largest personal libraries called Rajgruha!'
        }
      }
    ]
  },
  {
    id: 'story-mahad-water',
    title: 'Water is for Everyone: The Mahad Satyagraha',
    subtitle: 'The 1927 Civil Rights March for Human Thirst & Dignity',
    badge: 'Civil Rights Hero',
    era: '1927',
    durationMinutes: 7,
    heroImage: MAHAD_IMAGE,
    description: 'Walk alongside thousands of brave men and women to Chavdar Lake in Mahad to drink water that had been cruelly denied to them.',
    kidSummary: 'Birds and animals could drink from the beautiful town lake, but humans were stopped! Babasaheb led a peaceful walk, touched the cool water, and proved that water belongs to all living beings.',
    steps: [
      {
        stepNumber: 1,
        title: 'The Forbidden Lake of Mahad',
        location: 'Chavdar Tank, Mahad, Maharashtra',
        year: 1927,
        narrativeText: 'Chavdar Tank was a large public municipal water reservoir. While horses, dogs, and cattle could freely drink from it, human beings born into the lower castes were strictly prohibited from even touching the water.',
        kidFriendlyText: 'Did you know even stray cats and birds could drink from the pond, but people were shouted at if they were thirsty? Babasaheb said: "That is completely unfair and against nature!"',
        audioVoiceoverExcerpt: 'We are not going to the tank merely to drink water. We are going to establish that we are human beings like everyone else.',
        imageUrl: MAHAD_IMAGE,
        imageCaption: 'The historic Chavdar Tank where thousands gathered in March 1927.',
        videoTitle: 'Historical Newsreel: The Road to Mahad (March 1927)',
        videoDuration: '03:45',
        videoReelClip: 'Documentary footage of thousands walking peacefully toward the lake under the banner of civic equality.',
        badgeReward: '💧 Water Defender Badge',
        kidFriendlyStickers: ['💧', '🌊', '🕊️', '✊'],
        archivalDocId: 'mahad-satyagraha-1927',
        interactiveQuestion: {
          prompt: 'What was the central goal of the Mahad March?',
          options: ['To win a gold medal', 'To assert human dignity and equal access to drinking water', 'To build a hotel', 'To go swimming'],
          correctIndex: 1,
          funFact: 'This peaceful event is commemorated every year in India on March 20 as Social Empowerment Day!'
        }
      },
      {
        stepNumber: 2,
        title: 'Dr. Ambedkar Cups His Hands',
        location: 'Banks of Chavdar Lake',
        year: 1927,
        narrativeText: 'On March 20, 1927, Dr. Ambedkar walked steadily to the water’s edge. In front of thousands of watchful eyes, he knelt down, cupped his hands, and drank the cool water. The thousands behind him followed peacefully.',
        kidFriendlyText: 'With a calm smile and great courage, Babasaheb bent down and scooped up a handful of water. He took a sip. Everyone cheered with tears in their eyes: "We are free citizens now!"',
        audioVoiceoverExcerpt: 'With a single sip of water, Dr. Ambedkar broke centuries of fear, declaring that dignity is the birthright of every living soul.',
        imageUrl: MAHAD_IMAGE,
        imageCaption: 'Dr. Ambedkar leading the peaceful march to the water’s edge.',
        videoTitle: 'Water Declaration Reel: Cupping the Waters of Equality',
        videoDuration: '04:10',
        videoReelClip: 'Visual recreation of the historic moment Dr. Ambedkar cupped the water with applause from thousands of attendees.',
        badgeReward: '🌈 Equality Champion Badge',
        kidFriendlyStickers: ['✨', '🏆', '💙', '🎉'],
        archivalDocId: 'mahad-satyagraha-1927',
        interactiveQuestion: {
          prompt: 'Which article in the Indian Constitution later guaranteed that no one can be stopped from using public wells and lakes?',
          options: ['Article 1', 'Article 15', 'Article 50', 'Article 100'],
          correctIndex: 1,
          funFact: 'Article 15(2) directly wrote the lesson of Mahad into the supreme law of India!'
        }
      }
    ]
  },
  {
    id: 'story-writing-constitution',
    title: 'Writing the Supreme Law: The Constitution',
    subtitle: 'How 395 Articles Were Crafted for 350 Million Citizens',
    badge: 'Father of the Constitution',
    era: '1947–1950',
    durationMinutes: 8,
    heroImage: DRAFTING_CONSTITUTION_IMAGE,
    description: 'Step inside the Constituent Assembly Hall in New Delhi where Dr. Ambedkar and his committee wrote the rulebook that protects every Indian child and adult.',
    kidSummary: 'Imagine making the ultimate rulebook for the biggest playground in the world! Dr. Ambedkar made sure the rules gave every boy and girl the right to go to school, speak freely, and be treated as equals.',
    steps: [
      {
        stepNumber: 1,
        title: 'Chairman of the Drafting Committee',
        location: 'Constitution Hall, New Delhi',
        year: 1947,
        narrativeText: 'On August 29, 1947, just days after India gained independence, Dr. B. R. Ambedkar was elected Chairman of the Drafting Committee. His mission was to write the foundation of a modern democratic republic.',
        kidFriendlyText: 'India had just become free! But a country needs fair rules so everyone is protected. Leaders chose Dr. Ambedkar to be the chief builder of this mighty rulebook because he knew law better than anyone else!',
        audioVoiceoverExcerpt: 'He worked day and night, reviewing every comma, clause, and principle to defend the rights of the smallest citizen.',
        imageUrl: DRAFTING_CONSTITUTION_IMAGE,
        imageCaption: 'Dr. Ambedkar sitting with the members of the Drafting Committee examining drafts.',
        videoTitle: 'Drafting Committee Archive Film: The Drafting Room (1947)',
        videoDuration: '05:00',
        videoReelClip: 'Films Division archival reel showing Dr. Ambedkar examining hand-written drafts with fellow committee members.',
        badgeReward: '📜 Constitution Architect Badge',
        kidFriendlyStickers: ['📜', '🏛️', '🖋️', '🇮🇳'],
        archivalDocId: 'constituent-assembly-speech-1949',
        interactiveQuestion: {
          prompt: 'What date did the Drafting Committee elect Dr. Ambedkar as Chairman?',
          options: ['January 26, 1950', 'August 29, 1947', 'October 2, 1869', 'December 25, 1948'],
          correctIndex: 1,
          funFact: 'The Indian Constitution is the longest written national constitution in the world, beautifully hand-calligraphed in English and Hindi!'
        }
      },
      {
        stepNumber: 2,
        title: 'Presenting the Constitution to the Nation',
        location: 'Central Hall of Parliament, New Delhi',
        year: 1949,
        narrativeText: 'On November 25, 1949, Dr. Ambedkar delivered his famous address, reminding all citizens that political democracy must also be a social and economic democracy with liberty, equality, and fraternity.',
        kidFriendlyText: 'When he handed over the finished Constitution book, everyone in the huge hall stood up and clapped! He told them: "Remember, a rulebook is only as good as the kind people who use it every day."',
        audioVoiceoverExcerpt: 'We must make our political democracy a social democracy as well. Political democracy cannot last unless there lies at the base of it social democracy.',
        imageUrl: ASSEMBLY_IMAGE,
        imageCaption: 'Dr. Ambedkar presenting the final draft of the Indian Constitution to President Dr. Rajendra Prasad.',
        videoTitle: 'Final Presentation Ceremony Reel: Central Hall of Parliament (Nov 1949)',
        videoDuration: '06:15',
        videoReelClip: 'Standing ovations, applause, and Dr. Rajendra Prasad commending Dr. Ambedkar’s monumental stewardship of the Constitution.',
        badgeReward: '⭐ Guardian of Democracy Badge',
        kidFriendlyStickers: ['⭐', '👑', '🎉', '📜'],
        archivalDocId: 'constituent-assembly-speech-1949',
        interactiveQuestion: {
          prompt: 'What three magical values did Dr. Ambedkar say must always stay together?',
          options: ['Gold, Silver, and Bronze', 'Liberty, Equality, and Fraternity', 'Sugar, Spice, and Salt', 'Speed, Strength, and Power'],
          correctIndex: 1,
          funFact: 'He explained that without equality, liberty would produce supremacy of the few; and without fraternity, liberty and equality could not live together peacefully!'
        }
      }
    ]
  },
  {
    id: 'story-dhamma-awakening',
    title: 'The Great Awakening: Deekshabhoomi & The 22 Vows',
    subtitle: 'October 14, 1956: Embracing Buddhist Humanism & Equality',
    badge: 'Spiritual Revolution',
    era: '1956',
    durationMinutes: 8,
    heroImage: NAGPUR_DEEKSHA_IMAGE,
    description: 'Witness the breathtaking mass renaissance in Nagpur where 500,000 citizens embraced the Buddha’s path of wisdom, compassion, and rationality.',
    kidSummary: 'Babasaheb brought half a million people together in Nagpur wearing pure white clothes. He gave them 22 special vows of love, honesty, and kindness, saying: "Today we begin a new life of freedom and compassion!"',
    steps: [
      {
        stepNumber: 1,
        title: 'A White Sea of 500,000 People',
        location: 'Deekshabhoomi, Nagpur',
        year: 1956,
        narrativeText: 'On October 14, 1956, on the auspicious day of Ashoka Vijaya Dashami, half a million people gathered on a vast open ground in Nagpur, all dressed in pure white. It remains one of the largest peaceful conversions to Buddhism in human history.',
        kidFriendlyText: 'As far as your eyes could see, hundreds of thousands of smiling families gathered in white clothes! There were no weapons, no anger — only peace, big smiles, and hope for a bright tomorrow.',
        audioVoiceoverExcerpt: 'I like the religion that teaches liberty, equality and fraternity. In Buddhism, morality is sacred and universal.',
        imageUrl: NAGPUR_DEEKSHA_IMAGE,
        imageCaption: 'The historic gathering at Deekshabhoomi, Nagpur, where 500,000 embraced the Dhamma.',
        videoTitle: 'Deekshabhoomi Archival Reel: Nagpur 1956 Congregation',
        videoDuration: '04:50',
        videoReelClip: 'Historic newsreel footage capturing the ocean of white-clad followers chanting and listening to Babasaheb.',
        badgeReward: '🪷 Wheel of Dhamma Badge',
        kidFriendlyStickers: ['🪷', '🕊️', '☸️', '✨'],
        archivalDocId: 'buddha-and-his-dhamma-1957',
        interactiveQuestion: {
          prompt: 'What color clothes did the 500,000 people wear at Deekshabhoomi?',
          options: ['Neon Green', 'Pure White', 'Bright Purple', 'Silver Metallic'],
          correctIndex: 1,
          funFact: 'White was chosen as a symbol of peace, purity of mind, and starting a brand new life of equality!'
        }
      },
      {
        stepNumber: 2,
        title: 'The 22 Vows of Rationality and Kindness',
        location: 'Deekshabhoomi Dais, Nagpur',
        year: 1956,
        narrativeText: 'Standing before the ocean of people, Dr. Ambedkar recited the Three Refuges (Trisaran), the Five Precepts (Pancasila), and personally authored 22 Vows rejecting superstitious rituals and affirming equality, truth, and compassion for all living beings.',
        kidFriendlyText: 'Babasaheb stood up and gave 22 wonderful promises to everyone! The promises say: "Always tell the truth, help anyone in need, treat all men and women as equals, and use your brain to ask good questions!"',
        audioVoiceoverExcerpt: 'By taking these vows, you throw away old chains and step into a new life of wisdom, compassion, and human dignity.',
        imageUrl: NAGPUR_DEEKSHA_IMAGE,
        imageCaption: 'Dr. Ambedkar administering the 22 vows from the central dais.',
        videoTitle: 'The 22 Vows Proclamation Reel (Nagpur 1956)',
        videoDuration: '05:30',
        videoReelClip: 'Audio recording and footage of Babasaheb reciting the historic 22 vows with the massive assembly repeating each oath.',
        badgeReward: '🌟 Enlightened Heart Badge',
        kidFriendlyStickers: ['🌟', '🪷', '💎', '🎉'],
        archivalDocId: 'buddha-and-his-dhamma-1957',
        interactiveQuestion: {
          prompt: 'How many special vows did Dr. Ambedkar write and administer?',
          options: ['5 vows', '10 vows', '22 vows', '100 vows'],
          correctIndex: 2,
          funFact: 'These 22 vows are studied worldwide as a masterpiece of rationalist ethics and social emancipation!'
        }
      }
    ]
  }
];

// 7. DOCUMENT COMPARISON PRESETS (AI COMPARISON TOOL)
export const DOC_COMPARISON_PRESETS: DocComparisonPreset[] = [
  {
    id: 'compare-annihilation-vs-cad',
    title: 'From Social Agitator to Constitutional Architect',
    docAId: 'annihilation-of-caste',
    docBId: 'constituent-assembly-speech-1949',
    commonThemes: [
      'Indivisibility of social democracy and political freedom',
      'Caste hierarchy as an existential danger to national unity',
      'Fraternity as the moral cornerstone of associated civic life',
      'Warning against hero-worship (Bhakti) in politics'
    ],
    keyDifferences: [
      'Perspective: 1936 address is a radical polemic diagnosing social disease; 1949 address is an institutional statecraft document designing legal remedies.',
      'Audience: 1936 addressed social reformers in Lahore; 1949 addressed the sovereign representatives of an independent nation.',
      'Mechanism: 1936 emphasizes moral destruction of caste religious notions; 1949 establishes constitutional fundamental rights and judicial enforceability (Art 14-32).'
    ],
    historicalEvolution: 'Shows Dr. Ambedkar’s evolution from exposing the systemic cruelties of caste in pre-independence colonial India to embedding irrevocable legal guarantees and warning independent India that paper constitutions fail without constitutional morality.',
    kidFriendlyLesson: 'In 1936, Babasaheb told everyone: "Here is why our house is broken and unfair." In 1949, he built the sturdy new house with steel pillars so every child is safe!'
  },
  {
    id: 'compare-mahad-vs-states-minorities',
    title: 'From Street Civil Rights to Constitutional Bill of Rights',
    docAId: 'mahad-satyagraha-1927',
    docBId: 'states-and-minorities-1947',
    commonThemes: [
      'Basic human rights are not favors to be begged for',
      'The State must actively penalize discrimination rather than staying neutral',
      'Economic security is foundational to genuine civic equality'
    ],
    keyDifferences: [
      'Scope: Mahad (1927) was a local direct action demanding drinking water at a municipal pond; States & Minorities (1947) was a comprehensive constitutional blueprint for an entire sovereign nation.',
      'Legal Form: Mahad produced a civil resolution and public pledge; States and Minorities drafted statutory articles for fundamental rights and state socialism.'
    ],
    historicalEvolution: 'Traces the trajectory from grassroots civil disobedience to drafting the exact penal sanctions that became Article 15(2) and Article 17 of the Constitution of India.',
    kidFriendlyLesson: 'First, brave people walked together to drink water from a pond. Twenty years later, that same brave leader wrote a law making sure no one can ever stop another person from drinking water again!'
  }
];

// 8. ADMIN DASHBOARD OCR JOBS RECORD
export const ADMIN_OCR_RECORDS: OCRJobRecord[] = [
  {
    id: 'ocr-job-001',
    fileName: 'BAWS_Vol_01_Annihilation_Caste_Folio_042.pdf',
    fileSize: '4.2 MB',
    uploadDate: '2026-09-21 14:32',
    status: 'Completed',
    engine: 'Tesseract OCR v5',
    confidenceScore: 99.4,
    titleExtracted: 'Annihilation of Caste (Section XIV)',
    languageDetected: 'English (Latin script)',
    accessRights: 'Public Domain',
    rawOcrSnippet: 'You cannot build anything on the foundations of caste. You cannot build up a nation...',
    cleanedTextSnippet: 'You cannot build anything on the foundations of caste. You cannot build up a nation, you cannot build up an ethical morality.'
  },
  {
    id: 'ocr-job-002',
    fileName: 'Constituent_Assembly_Nov25_1949_Record.pdf',
    fileSize: '6.8 MB',
    uploadDate: '2026-09-22 09:15',
    status: 'Completed',
    engine: 'Google Cloud Vision',
    confidenceScore: 99.7,
    titleExtracted: 'Speech on the Adoption of the Constitution',
    languageDetected: 'English (Parliamentary Debates Format)',
    accessRights: 'Public Domain',
    rawOcrSnippet: 'On 26th January 1950, we are going to enter into a life of contradictions...',
    cleanedTextSnippet: 'On the 26th of January 1950, we are going to enter into a life of contradictions. In politics we will have equality and in social and economic life we will have inequality.'
  },
  {
    id: 'ocr-job-003',
    fileName: 'Mahad_Chavdar_Resolution_1927_Marathi_Original.tiff',
    fileSize: '12.4 MB',
    uploadDate: '2026-09-23 08:45',
    status: 'Pending Review',
    engine: 'PaddleOCR v3',
    confidenceScore: 97.8,
    titleExtracted: 'महाड चवदार तळे सत्याग्रह ठराव (१९२७)',
    languageDetected: 'Marathi (Devanagari script)',
    accessRights: 'Public Domain',
    rawOcrSnippet: 'आम्ही चवदार तळ्यावर केवळ पाणी पिण्यासाठी जात नाही आहोत...',
    cleanedTextSnippet: 'आम्ही चवदार तळ्यावर केवळ पाणी पिण्यासाठी जात नाही आहोत, तर आम्हीही इतर माणसांप्रमाणेच माणसे आहोत हे सिद्ध करण्यासाठी जात आहोत.'
  },
  {
    id: 'ocr-job-004',
    fileName: 'Problem_of_the_Rupee_London_1923_Draft.pdf',
    fileSize: '8.1 MB',
    uploadDate: '2026-09-23 10:20',
    status: 'Processing',
    engine: 'Tesseract OCR v5',
    confidenceScore: 98.9,
    titleExtracted: 'The Problem of the Rupee: Its Origin and Its Solution',
    languageDetected: 'English (Economic Tables & Equations)',
    accessRights: 'Fair Use Educational',
    rawOcrSnippet: 'The automatic system is by far the most stable regulator of currency...',
    cleanedTextSnippet: 'An automatic monetary system is by far the most stable regulator of currency, insulated from administrative manipulation.'
  }
];
