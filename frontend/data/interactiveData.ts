import { QuizQuestion, QuoteItem, PhilosophyConcept } from '../types';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    category: 'Constitution',
    question: "Which article of the Indian Constitution did Dr. B. R. Ambedkar refer to as its 'very soul and the very heart'?",
    options: [
      "Article 14 (Equality before Law)",
      "Article 19 (Freedom of Speech)",
      "Article 21 (Right to Life)",
      "Article 32 (Right to Constitutional Remedies)"
    ],
    correctIndex: 3,
    explanation: "Dr. Ambedkar stated: 'If I was asked to name any particular article in this Constitution as the most important... I could not refer to any other article except this one. It is the very soul of the Constitution and the very heart of it.'",
    sourceCitation: "Constituent Assembly Debates, Vol. VII, December 9, 1948"
  },
  {
    id: 'q2',
    category: 'Writings',
    question: "Which of Dr. Ambedkar's seminal texts was originally prepared as an undelivered presidential address for the Jat-Pat-Todak Mandal in Lahore?",
    options: [
      "The Problem of the Rupee",
      "Annihilation of Caste",
      "Castes in India: Their Mechanism, Genesis and Development",
      "The Buddha and His Dhamma"
    ],
    correctIndex: 1,
    explanation: "In 1936, the Jat-Pat-Todak Mandal invited him to preside over their annual conference in Lahore. When the committee objected to his uncompromising critique of Vedic scripture, Ambedkar cancelled the speech and published it independently as 'Annihilation of Caste'.",
    sourceCitation: "BAWS Vol. 1, Preface to Annihilation of Caste (1936)"
  },
  {
    id: 'q3',
    category: 'Movements',
    question: "What was the primary objective of the historic Mahad Satyagraha led by Dr. Ambedkar on March 20, 1927?",
    options: [
      "To boycott foreign textile goods",
      "To demand separate legislative electorates",
      "To assert the civic right of untouchables to draw water from the public Chavadar Tank",
      "To establish the Independent Labour Party"
    ],
    correctIndex: 2,
    explanation: "Dr. Ambedkar famously proclaimed: 'We have gone to the tank only to prove that we too are human beings like other human beings. Our struggle is not for water; it is for establishing our human rights.' This day is commemorated as Social Empowerment Day.",
    sourceCitation: "BAWS Vol. 17 (Part I), Mahad Satyagraha Records"
  },
  {
    id: 'q4',
    category: 'Philosophy',
    question: "In his final Constituent Assembly speech on Nov 25, 1949, which 'union of trinity' did Ambedkar argue must never be separated?",
    options: [
      "Faith, Hope, and Charity",
      "Liberty, Equality, and Fraternity",
      "Justice, Sovereign, and Republic",
      "Education, Agitation, and Organization"
    ],
    correctIndex: 1,
    explanation: "Ambedkar warned: 'These principles of liberty, equality and fraternity are not to be treated as separate items in a trinity. They form a union of trinity in the sense that to divorce one from the other is to defeat the very purpose of democracy.'",
    sourceCitation: "Constituent Assembly Debates, Vol. XI, Nov 25, 1949"
  },
  {
    id: 'q5',
    category: 'Constitution',
    question: "As independent India's first Law Minister, which major progressive legislative reform did Dr. Ambedkar draft to secure equal inheritance, marriage, and divorce rights for women?",
    options: [
      "The Hindu Code Bill",
      "The Maternity Benefit Act",
      "The Dowry Prohibition Bill",
      "The Representation of the People Act"
    ],
    correctIndex: 0,
    explanation: "Dr. Ambedkar drafted and passionately championed the Hindu Code Bill to reform ancient customary laws and grant women equal rights of property inheritance, monogamy, and civil divorce. When cabinet compromises stalled the bill, he resigned as Law Minister in protest in 1951.",
    sourceCitation: "Cabinet Resignation Statement, October 10, 1951 (BAWS Vol. 14)"
  },
  {
    id: 'q6',
    category: 'Writings',
    question: "Dr. Ambedkar's doctoral thesis at the London School of Economics, 'The Problem of the Rupee', served as a foundational blueprint for which institution?",
    options: [
      "Planning Commission of India",
      "State Bank of India",
      "Reserve Bank of India (RBI)",
      "Finance Commission of India"
    ],
    correctIndex: 2,
    explanation: "When the Hilton Young Commission (Royal Commission on Indian Currency and Finance) met in 1926, each member carried Dr. Ambedkar's book 'The Problem of the Rupee: Its Origin and Its Solution' to frame the legislative charter that created the Reserve Bank of India.",
    sourceCitation: "Royal Commission on Indian Currency and Finance (1926), Minutes of Evidence"
  },
  {
    id: 'q7',
    category: 'Philosophy',
    question: "What did Dr. Ambedkar identify as the three-word foundational motto for the Bahishkrit Hitakarini Sabha founded in 1924?",
    options: [
      "Truth, Non-violence, Swaraj",
      "Educate, Agitate, Organize",
      "Work, Sacrifice, Liberty",
      "Dignity, Harmony, Progress"
    ],
    correctIndex: 1,
    explanation: "Dr. Ambedkar gave the clarion call: 'Educate, Agitate, Organize; Have faith in yourselves.' He believed that critical knowledge, active agitation against injustice, and cohesive organization were necessary for social revolution.",
    sourceCitation: "Speech at All-India Depressed Classes Conference, Nagpur (1942)"
  }
];

export const FAMOUS_QUOTES: QuoteItem[] = [
  {
    id: 'quote-1',
    quote: "Cultivation of mind should be the ultimate aim of human existence.",
    quoteLocal: {
      hi: "मनुष्य के अस्तित्व का अंतिम लक्ष्य अपने मन और विवेक का विकास होना चाहिए।",
      mr: "मानवी अस्तित्वाचे अंतिम ध्येय मनाची मशागत आणि बुद्धीचा विकास हेच असले पाहिजे."
    },
    work: "Annihilation of Caste",
    year: 1936,
    theme: "Education",
    context: "On the transformative power of independent intellect and breaking free from unquestioned dogma."
  },
  {
    id: 'quote-2',
    quote: "On the 26th of January 1950, we are going to enter into a life of contradictions. In politics we will have equality and in social and economic life we will have inequality.",
    quoteLocal: {
      hi: "26 जनवरी 1950 को हम विरोधाभासों के जीवन में प्रवेश करने जा रहे हैं। राजनीति में समानता होगी, परंतु सामाजिक और आर्थिक जीवन में असमानता होगी।",
      mr: "२६ जानेवारी १९५० रोजी आपण एका विरोधाभासांच्या आयुष्यात प्रवेश करणार आहोत. राजकारणात समानता असेल, पण सामाजिक आणि आर्थिक जीवनात विषमता असेल."
    },
    work: "Speech to the Constituent Assembly",
    year: 1949,
    theme: "Democracy",
    context: "Warning India that political democracy is doomed unless matched with socio-economic democracy."
  },
  {
    id: 'quote-3',
    quote: "I measure the progress of a community by the degree of progress which women have achieved.",
    quoteLocal: {
      hi: "मैं किसी समुदाय की प्रगति को उस प्रगति से मापता हूँ जो महिलाओं ने हासिल की है।",
      mr: "मी कोणत्याही समाजाची प्रगती ही त्या समाजातील स्त्रियांनी केलेल्या प्रगतीवरून मोजतो."
    },
    work: "All-India Depressed Classes Women's Conference",
    year: 1942,
    theme: "Women Rights",
    context: "Addressing over 25,000 women delegates in Nagpur, advocating financial autonomy, education, and equality."
  },
  {
    id: 'quote-4',
    quote: "Lost rights are never regained by appeals to the conscience of the usurpers, but by relentless struggle. Goats are used for sacrificial offerings and not lions.",
    quoteLocal: {
      hi: "छीने हुए अधिकार कभी शोषकों की अंतरात्मा से दया की भीख मांगकर नहीं मिलते, बल्कि निरंतर संघर्ष से मिलते हैं। बलि बकरे की दी जाती है, शेर की नहीं।",
      mr: "हिरावून घेतलेले हक्क शोषकांच्या दयेवर कधीच परत मिळत नाहीत, तर अखंड संघर्षाने मिळतात. बळी बोकडाचा दिला जातो, सिंहाचा नाही."
    },
    work: "Mahad Satyagraha Address",
    year: 1927,
    theme: "Social Justice",
    context: "Inspiring satyagrahis at Chavadar Lake to assert their natural human dignity."
  },
  {
    id: 'quote-5',
    quote: "Constitutional morality is not a natural sentiment. It has to be cultivated. We must realize that our people have yet to learn it.",
    quoteLocal: {
      hi: "संवैधानिक नैतिकता कोई प्राकृतिक भावना नहीं है। इसे विकसित करना पड़ता है। हमें यह समझना होगा कि हमारे लोगों को इसे अभी सीखना बाकी है।",
      mr: "घटनात्मक नैतिकता ही उपजत भावना नसते, तिची जाणीवपूर्वक मशागत करावी लागते. आपल्या जनतेने ती शिकणे अद्याप बाकी आहे."
    },
    work: "Constituent Assembly Debates (Draft Constitution)",
    year: 1948,
    theme: "Constitutional Morality",
    context: "Distinguishing between legal form and constitutional ethics, urging adherence to democratic conventions over hero-worship."
  },
  {
    id: 'quote-6',
    quote: "Educate, Agitate, Organize; Have faith in yourselves and never lose courage.",
    quoteLocal: {
      hi: "शिक्षित बनो, आंदोलन करो, संगठित रहो; अपने आप में विश्वास रखो और कभी हिम्मत मत हारो।",
      mr: "शिका, संघटित व्हा, संघर्ष करा; स्वतःवर विश्वास ठेवा आणि कधीही धीर सोडू नका."
    },
    work: "Bahishkrit Hitakarini Sabha Motto",
    year: 1924,
    theme: "Education",
    context: "The guiding revolutionary tripartite formula for human emancipation and collective awakening."
  },
  {
    id: 'quote-7',
    quote: "Caste is not just a division of labour, it is a division of labourers.",
    quoteLocal: {
      hi: "जाति केवल श्रम का विभाजन नहीं है, बल्कि यह श्रमिकों का श्रेणीबद्ध विभाजन है।",
      mr: "जात ही केवळ कामाची विभागणी नाही, तर ती माणसांची आणि श्रमिकांची उतरंड आहे."
    },
    work: "Annihilation of Caste",
    year: 1936,
    theme: "Social Justice",
    context: "Refuting orthodox defenses that caste is an innocent vocational division."
  },
  {
    id: 'quote-8',
    quote: "Bhakti in religion may be a road to the salvation of the soul. But in politics, Bhakti or hero-worship is a sure road to degradation and to eventual dictatorship.",
    quoteLocal: {
      hi: "धर्म में भक्ति आत्मा की मुक्ति का मार्ग हो सकती है, लेकिन राजनीति में भक्ति या अंधभक्ति अधोगति और तानाशाही का सीधा मार्ग है।",
      mr: "धर्मातील भक्ती ही आत्म्याच्या मुक्तीचा मार्ग असू शकेल; परंतु राजकारणातील भक्ती किंवा व्यक्तिपूजा ही विनाशाचा आणि हुकूमशाहीचा हमखास मार्ग आहे."
    },
    work: "Constituent Assembly Debates",
    year: 1949,
    theme: "Democracy",
    context: "Warning against personality cults and excessive adulation in a democratic republic."
  }
];

export const PHILOSOPHY_CONCEPTS: PhilosophyConcept[] = [
  {
    id: 'liberty-equality-fraternity',
    title: 'The Union of Trinity',
    tagline: 'Liberty, Equality & Fraternity as One Indivisible Ethos',
    description: 'Dr. Ambedkar asserted that democracy cannot survive if liberty, equality, and fraternity are treated as isolated ideas. Without equality, liberty produces the supremacy of the few. Without liberty, equality kills individual initiative. Without fraternity, neither liberty nor equality can become a natural course of things.',
    famousQuote: "These principles are not separate items in a trinity. To divorce one from the other is to defeat democracy.",
    relatedDocId: 'constituent-assembly-speech-1949',
    color: 'from-blue-600 to-indigo-600',
    iconName: 'Scale'
  },
  {
    id: 'constitutional-morality',
    title: 'Constitutional Morality',
    tagline: 'Subordinating Private Passion to Institutional Integrity',
    description: 'Dr. Ambedkar cautioned that a constitutional structure is only as good as the moral commitment of its citizens and leaders. Constitutional morality demands absolute respect for democratic processes, tolerance of opposition, and rejection of extra-constitutional hero-worship.',
    famousQuote: "Constitutional morality is not a natural sentiment. It has to be cultivated.",
    relatedDocId: 'article-32-debate-1948',
    color: 'from-amber-500 to-rose-600',
    iconName: 'Shield'
  },
  {
    id: 'annihilation-of-caste',
    title: 'Annihilation of Caste',
    tagline: 'A Casteless Society as the Moral Foundation of Nationhood',
    description: 'Arguing that political independence without social democracy is hollow, Ambedkar exposed caste as an anti-social hierarchy that destroys fraternity and national consciousness. He prescribed scientific rationality and inter-marriage as the solvent of endogamy.',
    famousQuote: "You cannot build anything on the foundations of caste. Anything built on it will crack.",
    relatedDocId: 'annihilation-of-caste',
    color: 'from-emerald-600 to-teal-600',
    iconName: 'Flame'
  },
  {
    id: 'educate-agitate-organize',
    title: 'Educate, Agitate, Organize',
    tagline: 'The Tripartite Formula for Social Awakening',
    description: 'Education illuminates self-worth; agitation creates vigilance against oppression; organization channels collective energy into sustained institutional transformation. This became the driving philosophy for millions seeking human dignity.',
    famousQuote: "Cultivation of mind should be the ultimate aim of human existence.",
    relatedDocId: 'castes-in-india-1916',
    color: 'from-violet-600 to-purple-600',
    iconName: 'BookOpen'
  },
  {
    id: 'gender-justice',
    title: 'Gender Justice & Legal Autonomy',
    tagline: 'Measuring Civilization by Women’s Freedom',
    description: 'As independent India’s first Law Minister, Dr. Ambedkar drafted the revolutionary Hindu Code Bill, fighting for equal inheritance, monogamy, and the right to divorce. He resigned his cabinet post in 1951 when reactionary elements stalled the reform.',
    famousQuote: "I measure the progress of a community by the degree of progress which women have achieved.",
    relatedDocId: 'states-and-minorities-1947',
    color: 'from-pink-600 to-rose-500',
    iconName: 'Heart'
  },
  {
    id: 'economic-democracy',
    title: 'State Socialism & Economic Democracy',
    tagline: 'One Man, One Value in Social & Economic Life',
    description: 'In his 1947 constitutional memorandum "States and Minorities", Ambedkar proposed constitutional state socialism—mandating that key industries and agricultural land be managed by the democratic state so that private capital could not monopolize power.',
    famousQuote: "In politics we will have equality; in economic life we will have inequality. We must remove this contradiction.",
    relatedDocId: 'states-and-minorities-1947',
    color: 'from-cyan-600 to-blue-600',
    iconName: 'Coins'
  }
];

export const SOUNDBOARD_CLIPS = [
  {
    id: 'clip-1',
    title: "Life of Contradictions",
    speaker: "Dr. B. R. Ambedkar",
    event: "Constituent Assembly of India",
    year: 1949,
    duration: "0:45",
    tags: ["Democracy", "Equality", "Constitution"],
    quote: "On the 26th of January 1950, we are going to enter into a life of contradictions. In politics we will have equality and in social and economic life we will have inequality.",
    fullDocId: "constituent-assembly-speech-1949"
  },
  {
    id: 'clip-2',
    title: "On Indian Democracy & Social Structure",
    speaker: "Dr. B. R. Ambedkar",
    event: "BBC World Service Interview, London",
    year: 1953,
    duration: "1:15",
    tags: ["Democracy", "BBC Interview", "Fraternity"],
    quote: "Democracy in India is only a top-dressing on an Indian soil, which is essentially undemocratic. You cannot have democracy where there is no social equality.",
    fullDocId: "bbc-interview-1953"
  },
  {
    id: 'clip-3',
    title: "Water is Human Dignity",
    speaker: "Dr. B. R. Ambedkar",
    event: "Mahad Chavadar Tank Declaration",
    year: 1927,
    duration: "0:38",
    tags: ["Human Rights", "Mahad Satyagraha", "Equality"],
    quote: "Our struggle is not for water; it is for establishing our human rights. We have gone to the tank only to prove that we too are human beings.",
    fullDocId: "annihilation-of-caste"
  },
  {
    id: 'clip-4',
    title: "Article 32: Heart and Soul",
    speaker: "Dr. B. R. Ambedkar",
    event: "Constituent Assembly Debates",
    year: 1948,
    duration: "0:52",
    tags: ["Fundamental Rights", "Supreme Court", "Remedies"],
    quote: "If I was asked to name any particular article as the most important, I could not refer to any other article except this one. It is the very soul of the Constitution and the very heart of it.",
    fullDocId: "article-32-debate-1948"
  },
  {
    id: 'clip-5',
    title: "Educate, Agitate, Organize",
    speaker: "Dr. B. R. Ambedkar",
    event: "All-India Depressed Classes Conference",
    year: 1942,
    duration: "0:30",
    tags: ["Awakening", "Education", "Youth"],
    quote: "My final words of advice to you are: Educate, Agitate and Organize; have faith in yourselves. With justice on our side, I do not see how we can lose our battle.",
    fullDocId: "annihilation-of-caste"
  }
];
