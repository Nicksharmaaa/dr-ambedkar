export interface BookChapter {
  id: string;
  number: number;
  title: string;
  titleLocal?: {
    hi?: string;
    mr?: string;
    ta?: string;
    bn?: string;
  };
  subtitle?: string;
  pageNumber: number;
  paragraphs: string[];
  translation?: {
    hi?: string[];
    mr?: string[];
    ta?: string[];
    bn?: string[];
  };
  keyQuote?: string;
  citation: string;
  audioClip?: string;
  audioDuration?: string;
}

export interface BookReaderDocument {
  id: string;
  title: string;
  titleLocal?: {
    hi?: string;
    mr?: string;
    ta?: string;
    bn?: string;
  };
  year: number;
  dateString: string;
  volumeCitation: string;
  category: 'book' | 'speech' | 'debate' | 'manuscript';
  categoryLabel: string;
  sourceArchive: string;
  preface: string;
  ocrConfidence: number;
  totalChapters: number;
  totalPages: number;
  chapters: BookChapter[];
}

export const BOOK_READER_REGISTRY: Record<string, BookReaderDocument> = {
  'annihilation-of-caste': {
    id: 'annihilation-of-caste',
    title: 'Annihilation of Caste',
    titleLocal: {
      hi: 'जाति का विनाश (Annihilation of Caste)',
      mr: 'जातीचा विनाश (Annihilation of Caste)',
      ta: 'சாதி ஒழிப்பு (Annihilation of Caste)',
      bn: 'জাতপাত উচ্ছেদ (Annihilation of Caste)',
    },
    year: 1936,
    dateString: 'May 1936 (Third Edition 1944)',
    volumeCitation: 'Dr. Babasaheb Ambedkar: Writings and Speeches (BAWS Vol. 1, pp. 23–96)',
    category: 'book',
    categoryLabel: 'Philosophical & Sociological Treatise',
    sourceArchive: 'Government of Maharashtra / Jat-Pat-Todak Mandal Archive',
    preface:
      'The speech prepared by Dr. B. R. Ambedkar for the 1936 annual conference of the Jat-Pat-Todak Mandal in Lahore. When the reception committee objected to his uncompromising denunciation of Vedic authority and religious orthodoxy, Dr. Ambedkar cancelled the address and published it at his own expense. It remains modern India’s most devastating critique of graded inequality.',
    ocrConfidence: 99.4,
    totalChapters: 10,
    totalPages: 96,
    chapters: [
      {
        id: 'aoc-ch-1',
        number: 1,
        title: 'Prologue: The Lahore Invitation and the Unspoken Word',
        titleLocal: {
          hi: 'प्रस्तावना: लाहौर का निमंत्रण और अनकहा भाषण',
          mr: 'प्रस्तावना: लाहोरचे निमंत्रण आणि अभाषण',
          ta: 'முன்னுரை: லாகூர் அழைப்பும் பேசப்படாத உரையும்',
          bn: 'ভূমিকা: লাহোরের আমন্ত্রণ ও অপ্রদত্ত ভাষণ',
        },
        subtitle: 'Why the Jat-Pat-Todak Mandal trembled before an honest critique of Vedic orthodoxy',
        pageNumber: 37,
        paragraphs: [
          'Friends, I am really sorry for the members of the Jat-Pat-Todak Mandal who have so very kindly invited me to preside over this Conference. I am sure they will be asked many questions for having selected me as the President. The Mandal will be asked to explain as to why it has imported a man from Bombay to preside over a function which is held in Lahore.',
          'I believe the Mandal could easily have found some one better qualified than myself to preside on the occasion. I have criticised the Hindus. I have questioned the authority of the Mahatma whom they revere. They hate me. To them I am a snake in their garden. The Mandal will no doubt be asked by the politically-minded Hindus to explain why it has called me to fill this place of honour.',
          'It is an act of great daring. I shall not be surprised if some political Hindus regard it as an insult. This selection of mine cannot certainly please the ordinary religiously-minded Hindus. According to the Shastras the Brahmin is appointed to be the Guru for the three Varnas. The Mandal has disobeyed this sacred injunction by selecting an untouchable.',
        ],
        translation: {
          hi: [
            'मित्रो, मुझे जात-पात तोड़क मंडल के उन सदस्यों के प्रति गहरी सहानुभूति है जिन्होंने मुझे इस सम्मेलन की अध्यक्षता हेतु आमंत्रित किया। मुझे पूर्ण विश्वास है कि मेरे चयन को लेकर उनसे अनगिनत तीखे प्रश्न पूछे जाएंगे।',
            'मुझसे अधिक योग्य व्यक्ति इस पद के लिए सरलता से मिल सकता था। मैंने हिंदुओं की रूढ़ियों की तीखी आलोचना की है। मैंने उनके पूज्य महात्मा की सत्ता को चुनौती दी है। वे मुझसे घृणा करते हैं। उनके लिए मैं उनके उपवन का विषैला सर्प हूँ।',
            'यह सम्मेलन की साहसिक घटना है। राजनीतिक हिंदू इसे अपमान समझेंगे और धार्मिक हिंदू क्रुद्ध होंगे, क्योंकि शास्त्रों के अनुसार केवल ब्राह्मण ही तीनों वर्णों का गुरु हो सकता है।',
          ],
          mr: [
            'मित्रांनो, मला जात-पात तोडक मंडळाच्या त्या सदस्यांची खरोखरच दया येते ज्यांनी मला या परिषदेचे अध्यक्षस्थान स्वीकारण्यासाठी निमंत्रित केले. माझ्या निवडीबद्दल त्यांना अनेक जाब विचारले जातील याची मला खात्री आहे.',
            'माझ्यापेक्षा कितीतरी अधिक योग्य व्यक्ती त्यांना मिळू शकली असती. मी सनातनी हिंदू व्यवस्थेवर कठोर टीका केली आहे. ते ज्यांना महात्मा मानतात त्यांच्या भूमिकेला मी आव्हान दिले आहे. त्यांच्या दृष्टीने मी त्यांच्या बागेतील विषारी साप आहे.',
            'अस्पृश्याला अध्यक्षस्थानी बसवून मंडळाने शास्त्रांच्या त्या नियमांचे उल्लंघन केले आहे, ज्यानुसार केवळ ब्राह्मणच सर्वांचा गुरु असू शकतो.',
          ],
        },
        keyQuote: 'To them I am a snake in their garden. They hate me because I have questioned the sanctity of their Shastras.',
        citation: 'BAWS Vol. 1, Section I, p. 37',
      },
      {
        id: 'aoc-ch-2',
        number: 2,
        title: 'The Perils of Social Reform vs Political Reform',
        titleLocal: {
          hi: 'सामाजिक सुधारणा बनाम राजनीतिक सुधार के खतरे',
          mr: 'सामाजिक सुधारणा विरुद्ध राजकीय सुधारणा',
        },
        subtitle: 'Can you build a democratic nation on the rotting foundations of caste?',
        pageNumber: 41,
        paragraphs: [
          'The path of social reform like the path to heaven at any rate in India is trodden by only a few. There is a reason for this. In the first place, the social system embodies the will of the dominant class, and the dominant class has a vested interest in the maintenance of that system.',
          'The Social Conference which was an adjunct to the Indian National Congress was strangled and buried by political leaders who claimed that political freedom takes absolute precedence over social emancipation. I dispute this claim with every fiber of my being.',
          'You cannot build anything on the foundations of caste. You cannot build up a nation, you cannot build up an ethical morality. Anything that you will build on the foundations of caste will crack and will never be a whole.',
        ],
        translation: {
          hi: [
            'भारत में सामाजिक सुधार का मार्ग स्वर्ग के मार्ग की तरह अत्यंत बीहड़ और विरले लोगों द्वारा चुना गया है। इसका कारण स्पष्ट है: सामाजिक व्यवस्था प्रभुत्वशाली वर्ग के स्वार्थों की रक्षा करती है।',
            'कांग्रेस से जुड़े समाज सुधार आंदोलन का राजनीतिक नेताओं ने गला घोंट दिया। उनका दावा था कि सामाजिक समानता से पहले राजनीतिक स्वतंत्रता आनी चाहिए। मैं इस तर्क का पूर्ण खंडन करता हूँ।',
            'आप जाति की नींव पर कुछ भी नहीं बना सकते। आप न राष्ट्र का निर्माण कर सकते हैं, न ही नैतिक आचार का। जो कुछ भी आप जाति की नींव पर बनाएंगे, वह दरक जाएगा और कभी भी पूर्ण नहीं होगा।',
          ],
          mr: [
            'भारतात समाजसुधारणेचा मार्ग स्वर्गाच्या मार्गासारखाच केवळ मूठभर लोकांकडून तुडवला जातो. याचे कारण सामाजिक रचना ही वर्चस्ववादी वर्गाच्या हिताचे रक्षण करते.',
            'राजकीय स्वातंत्र्याला सामाजिक मुक्तीपेक्षा श्रेष्ठ मानणाऱ्या नेत्यांनी समाजसुधारणा परिषदेचा बळी दिला. हा दावा मी पूर्णपणे फेटाळून लावतो.',
            'जातीच्या पायावर तुम्ही काहीही उभे करू शकत नाही. तुम्ही राष्ट्र उभारू शकत नाही, तुम्ही नैतिक मूल्यांची निर्मिती करू शकत नाही. जातीच्या पायावर उभारलेली कोणतीही इमारत कोसळल्याशिवाय राहणार नाही.',
          ],
        },
        keyQuote: 'You cannot build anything on the foundations of caste. Anything that you will build on the foundations of caste will crack.',
        citation: 'BAWS Vol. 1, Section II & III, pp. 41–45',
      },
      {
        id: 'aoc-ch-3',
        number: 3,
        title: 'Caste is Not Division of Labour, It is Division of Labourers',
        titleLocal: {
          hi: 'जाति केवल श्रम का विभाजन नहीं, श्रमिकों का श्रेणीबद्ध विभाजन है',
          mr: 'जात ही केवळ कामाची विभागणी नसून श्रमिकांची उतरंड आहे',
        },
        subtitle: 'The fatal economic and moral distortion of an involuntary, hereditary hierarchy',
        pageNumber: 47,
        paragraphs: [
          'Civilised society undoubtedly needs division of labour. But in no civilised society is division of labour accompanied by this unnatural division of labourers into water-tight compartments. Caste System is not merely division of labour. It is also a division of labourers.',
          'Civilised society requires division of labour. But in no country is division of labour accompanied by this unnatural stratification of labourers graded one above the other. In the caste system, this division of labourers is not based on natural aptitudes or spontaneous choice; it is based on the dogma of predestination.',
          'By restricting mobility and punishing occupational change, caste creates systemic economic paralysis and unemployment. It degrades manual labour, calling it impure, and reduces millions to perpetual generational bondage.',
        ],
        translation: {
          hi: [
            'सभ्य समाज को श्रम विभाजन की आवश्यकता अवश्य होती है, परंतु किसी भी सभ्य समाज में श्रम विभाजन के साथ-साथ श्रमिकों का ऐसा अस्वाभाविक और श्रेणीबद्ध विभाजन नहीं देखा जाता।',
            'जाति व्यवस्था में श्रमिकों का यह विभाजन व्यक्तिगत योग्यता या रुचि पर आधारित नहीं है, बल्कि यह जन्म-पूर्व निर्धारित भाग्य के अंधविश्वास पर टिका है।',
            'श्रम की गतिशीलता को रोककर और व्यवसाय परिवर्तन को दंडित करके, जाति व्यवस्था आर्थिक पंगुता और बेरोजगारी को जन्म देती है। यह श्रम को अपवित्र बताकर लाखों को बंधुआ बना देती है।',
          ],
          mr: [
            'सुसंस्कृत समाजाला कामाची विभागणी आवश्यक असते. परंतु जगातील कोणत्याही देशात कामाच्या विभागणीसोबत माणसांची अशी विषम उतरंड रचलेली नाही. जात ही केवळ श्रमांची विभागणी नसून श्रमिकांची विभागणी आहे.',
            'या व्यवस्थेत माणसाची निवड किंवा बुद्धिमत्ता महत्त्वाची नसते, तर जन्मापूर्वी ठरवलेला साचा माणसावर लादला जातो.',
            'कामाचे स्वातंत्र्य नाकारून ही व्यवस्था समाजाला आर्थिक दारिद्र्यात ढकलते आणि श्रमाला अपवित्र मानून कोट्यवधी लोकांना गुलाम बनवते.',
          ],
        },
        keyQuote: 'Caste System is not merely division of labour. It is also a division of labourers graded hierarchically one above the other.',
        citation: 'BAWS Vol. 1, Section IV, pp. 47–49',
      },
      {
        id: 'aoc-ch-4',
        number: 4,
        title: 'The Biological and Racial Fallacies of Caste',
        titleLocal: {
          hi: 'जाति के जैविक और नस्लीय मिथक',
          mr: 'जातीचे जैविक व वांशिक खोटेपणा',
        },
        subtitle: 'Refuting the pseudo-scientific justification of eugenics and racial purity',
        pageNumber: 52,
        paragraphs: [
          'Some orthodox defenders argue that the caste system is based on eugenics and that its object is to preserve the purity of race and blood. Nothing could be more absurd or scientifically untenable.',
          'Ethnologists have established that the people of India are a thorough mixture of Aryans, Dravidians, Mongolians, and Scythians. All have mingled their blood. What racial affinity is there between a Brahmin of Punjab and a Brahmin of Madras? A Brahmin of Madras is racially closer to a Pariah of Madras than to a Brahmin of Kashmir.',
          'Caste does not demarcate racial division. Caste system is a social division of people of the same race. To talk of caste as eugenics is to abuse science for defending barbarism.',
        ],
        translation: {
          hi: [
            'कुछ रूढ़िवादी तर्क देते हैं कि जाति व्यवस्था सुजनन-विज्ञान (Eugenics) पर आधारित है और इसका उद्देश्य रक्त की शुद्धता बनाए रखना है। इससे अधिक हास्यास्पद और अवैज्ञानिक बात कोई नहीं हो सकती।',
            'मानवशास्त्रियों ने सिद्ध कर दिया है कि भारत के लोग विभिन्न नस्लों का गहरा मिश्रण हैं। पंजाब के ब्राह्मण और मद्रास के ब्राह्मण में क्या नस्लीय समानता है? मद्रास का ब्राह्मण मद्रास के परियाह के नस्लीय रूप से अधिक निकट है।',
            'जाति नस्ल को विभाजित नहीं करती; यह एक ही नस्ल के लोगों का सामाजिक बहिष्कार है।',
          ],
        },
        keyQuote: 'Caste does not demarcate racial division. To talk of caste as eugenics is to abuse science for defending barbarism.',
        citation: 'BAWS Vol. 1, Section V, pp. 52–54',
      },
      {
        id: 'aoc-ch-5',
        number: 5,
        title: 'Caste Destroys Public Spirit and National Fraternity',
        titleLocal: {
          hi: 'जाति राष्ट्रीय भावना और सामाजिक बंधुता को नष्ट करती है',
          mr: 'जात राष्ट्रीय अस्मिता आणि सामाजिक बंधुभाव नष्ट करते',
        },
        subtitle: 'How sub-castes paralyze civic consciousness and substitute tribal loyalty for human solidarity',
        pageNumber: 56,
        paragraphs: [
          'Caste has killed public spirit. Caste has destroyed the sense of public charity. Caste has made public opinion impossible. Virtue has become caste-ridden and morality has become caste-bound.',
          'There is no sympathy for the deserving. There is no appreciation of the meritorious. A Hindu’s loyalty is restricted only to his caste. His fellow feeling is only for the members of his caste.',
          'He will support a bad man from his own caste against an honest man of another caste. How can a nation exist under such chronic moral estrangement?',
        ],
        translation: {
          hi: [
            'जाति ने जनचेतना की हत्या कर दी है। जाति ने सार्वजनिक सहानुभूति को नष्ट कर दिया है। सदाचार और नैतिकता जाति की संकीर्ण सीमाओं में बंध गए हैं।',
            'एक हिंदू की निष्ठा केवल उसकी जाति तक सीमित है। वह अपनी जाति के भ्रष्ट व्यक्ति का समर्थन करेगा लेकिन दूसरी जाति के योग्य व्यक्ति का तिरस्कार करेगा। ऐसी दशा में राष्ट्र की कल्पना कैसे संभव है?',
          ],
        },
        keyQuote: 'Caste has killed public spirit. Virtue has become caste-ridden and morality has become caste-bound.',
        citation: 'BAWS Vol. 1, Section VI, pp. 56–58',
      },
      {
        id: 'aoc-ch-6',
        number: 6,
        title: 'The Real Remedy: Breaking the Sanction of the Shastras',
        titleLocal: {
          hi: 'सच्चा उपचार: शास्त्रों की धार्मिक सत्ता को ध्वस्त करना',
          mr: 'खरा उपाय: शास्त्रांचे धार्मिक वर्चस्व संपवणे',
        },
        subtitle: 'Inter-dining and inter-marriage are insufficient unless religious dogma is annihilated',
        pageNumber: 62,
        paragraphs: [
          'The real remedy for breaking Caste is inter-marriage. Nothing else will serve as the solvent of Caste. Fusion of blood alone can create the feeling of being kith and kin, and unless this feeling of being kindred becomes paramount, the separatist feeling created by Caste will not vanish.',
          'Yet why do Hindus not intermarry? Not because they are inherently inhuman, but because they believe that caste is divinely ordained by their Shastras. Their behavior is governed by their religion.',
          'To agitate for inter-caste marriages without destroying the belief in the sanctity of the Shastras is like asking a man to leap into the fire. The real enemy is the religious belief that sustains the caste system.',
        ],
        translation: {
          hi: [
            'जाति-उन्मूलन का सच्चा उपचार अंतर-जातीय विवाह है। रक्त का मिलन ही अपनत्व की भावना पैदा कर सकता है।',
            'परंतु हिंदू अंतर-जातीय विवाह क्यों नहीं करते? इसलिए कि वे शास्त्रों को ईश्वरीय विधान मानते हैं। उनका आचरण उनके धार्मिक विश्वासों से संचालित होता है।',
            'जब तक शास्त्रों की पवित्रता के भ्रम को नष्ट नहीं किया जाता, तब तक जाति का उन्मूलन असंभव है। वास्तविक शत्रु वह धार्मिक मान्यता है जो जाति का पोषण करती है।',
          ],
        },
        keyQuote: 'The real remedy is not inter-dining. The real remedy is to destroy the belief in the sanctity of the Shastras.',
        citation: 'BAWS Vol. 1, Section VII & VIII, pp. 62–66',
      },
      {
        id: 'aoc-ch-7',
        number: 7,
        title: 'Principles vs Rules: Reconstructing True Religion',
        titleLocal: {
          hi: 'सिद्धांत बनाम नियम: सच्चे धर्म का पुनर्निर्माण',
          mr: 'तत्त्वे विरुद्ध नियम: खऱ्या धर्माची पुनर्रचना',
        },
        subtitle: 'Why a religion of mechanical commandments must yield to universal spiritual morality',
        pageNumber: 71,
        paragraphs: [
          'Religion must be in the realm of principles only. It cannot be in the realm of rules. The moment it degenerates into rules, it ceases to be religion, as it kills the responsibility which is the essence of a truly religious act.',
          'The Vedas, Smritis, and Puranas are a mass of sacrificial, social, and political rules disguised as religion. They deprive an individual of liberty, choice, and conscience.',
          'To reconstruct religion, there must be one standard book of religion acceptable to all, priesthood must not be hereditary, and the state must regulate priesthood just as it regulates civil service.',
        ],
        keyQuote: 'Religion must relate to principles only. The moment it degenerates into rules, it ceases to be religion.',
        citation: 'BAWS Vol. 1, Section XI & XII, pp. 71–75',
      },
      {
        id: 'aoc-ch-8',
        number: 8,
        title: 'The Ideal Society and Social Endosmosis',
        titleLocal: {
          hi: 'आदर्श समाज और सामाजिक अंतःप्रवाह (Social Endosmosis)',
          mr: 'आदर्श समाज आणि सामाजिक परासरण',
        },
        subtitle: 'Fraternity defined as associated living and conjoint communicated experience',
        pageNumber: 79,
        paragraphs: [
          'What is my ideal of a society? If you ask me, my ideal would be a society based on Liberty, Equality, and Fraternity.',
          'An ideal society should be mobile, should be full of channels for conveying a change taking place in one part to other parts. In an ideal society there should be many interests consciously communicated and shared. There should be varied and free points of contact with other modes of association.',
          'This is fraternity, which is only another name for democracy. Democracy is not merely a form of Government. It is primarily a mode of associated living, of conjoint communicated experience. It is essentially an attitude of respect and reverence towards fellowmen.',
        ],
        translation: {
          hi: [
            'मेरा आदर्श समाज क्या है? मेरा आदर्श समाज स्वतंत्रता, समता और बंधुता पर आधारित समाज होगा।',
            'आदर्श समाज गतिशील होना चाहिए, जिसमें एक भाग में होने वाला परिवर्तन अन्य सभी भागों तक सहजता से प्रवाहित हो सके।',
            'यही बंधुता है, जिसका दूसरा नाम लोकतंत्र है। लोकतंत्र केवल शासन की एक प्रणाली नहीं है; यह मूलतः साथ मिलकर रहने और सह-अनुभूति का एक सजीव तरीका है।',
          ],
        },
        keyQuote: 'Democracy is not merely a form of Government. It is primarily a mode of associated living, of conjoint communicated experience.',
        citation: 'BAWS Vol. 1, Section XIV, pp. 79–81',
      },
      {
        id: 'aoc-ch-9',
        number: 9,
        title: 'Reply to Mahatma Gandhi: Vindication of Caste Examined',
        titleLocal: {
          hi: 'महात्मा गांधी को प्रत्युत्तर: जाति के समर्थन की परीक्षा',
          mr: 'महात्मा गांधींना उत्तर: जातीच्या समर्थनाची चिकित्सा',
        },
        subtitle: 'A devastating point-by-point philosophical reply published in the Harijan debates',
        pageNumber: 85,
        paragraphs: [
          'In his journal Harijan, the Mahatma published a defence of caste under the guise of Varna. He argued that Varna is inherent in human nature and preserves social stability.',
          'I ask the Mahatma: If Varna is natural, why must it be enforced by terror, excommunication, and penal sanctions? Why does the Mahatma desire that a sweeper’s son must forever remain a sweeper, irrespective of his intellectual capacities?',
          'The Mahatma’s doctrine is both backward-looking and economically disastrous. You cannot romanticize ancestral occupations while simultaneously claiming to fight untouchability. Untouchability is the inevitable fruit of the tree of caste.',
        ],
        translation: {
          hi: [
            'महात्मा गांधी ने अपने पत्र हरिजन में वर्ण के नाम पर जाति व्यवस्था का बचाव किया। उन्होंने तर्क दिया कि वर्ण व्यवस्था समाज में स्थिरता बनाए रखती है।',
            'मैं महात्मा से पूछता हूँ: यदि वर्ण स्वाभाविक है, तो इसे सामाजिक बहिष्कार और दंड के भय से क्यों लागू किया जाता है? महात्मा यह क्यों चाहते हैं कि सफाईकर्मी का पुत्र सदैव सफाईकर्मी ही बना रहे?',
            'अस्पृश्यता जाति रूपी वृक्ष का अनिवार्य फल है। आप पेड़ को सींचते हुए उसके फल को नष्ट नहीं कर सकते।',
          ],
        },
        keyQuote: 'Untouchability is the inevitable fruit of the tree of caste. You cannot destroy the fruit while nurturing the tree.',
        citation: 'BAWS Vol. 1, Appendix I: A Reply to the Mahatma, pp. 85–91',
      },
      {
        id: 'aoc-ch-10',
        number: 10,
        title: 'Concluding Charge: The Responsibility of the Intellectuals',
        titleLocal: {
          hi: 'समापन आह्वान: बुद्धिजीवियों का दायित्व',
          mr: 'अंतिम संदेश: विचारवंतांची ऐतिहासिक जबाबदारी',
        },
        subtitle: 'No reform is possible unless intellectual honesty triumphs over conservative complacency',
        pageNumber: 93,
        paragraphs: [
          'In every country the intellectual class is the most influential class. The intellectual class may be a class that is narrow, arrogant, and selfish. But if it is honest, it can lead the masses out of darkness.',
          'Unfortunately, in India, the entire intellectual class belongs almost exclusively to the Brahmin caste. A Brahmin scholar is first a Brahmin, and only second a scholar. He uses his intellect not to discover truth, but to invent ingenious apologies for caste privilege.',
          'You must make your choice. You cannot have both caste and democracy. If you want democracy, you must have the courage to dynamite the foundations of caste.',
        ],
        translation: {
          hi: [
            'प्रत्येक देश में बुद्धिजीवी वर्ग सबसे प्रभावशाली होता है। यदि वह वर्ग ईमानदार है, तो वह जनता को अंधकार से बाहर निकाल सकता है।',
            'परंतु भारत में बुद्धिजीवी वर्ग अपनी जातिगत श्रेष्ठता के बंधनों में जकड़ा हुआ है। वह सत्य की खोज के लिए नहीं, बल्कि जातिगत विशेषाधिकारों को न्यायसंगत ठहराने के लिए अपनी बुद्धि का उपयोग करता है।',
            'आपको चुनाव करना होगा: आप जाति और लोकतंत्र दोनों को एक साथ नहीं रख सकते। यदि आप लोकतंत्र चाहते हैं, तो आपको जाति की नींव को डायनामाइट से उड़ाने का साहस जुटाना होगा।',
          ],
        },
        keyQuote: 'You cannot have both caste and democracy. If you want democracy, you must have the courage to dynamite the foundations of caste.',
        citation: 'BAWS Vol. 1, Section XXV & XXVI, pp. 93–96',
      },
    ],
  },

  'constituent-assembly-speech-1949': {
    id: 'constituent-assembly-speech-1949',
    title: 'Speech on the Adoption of the Constitution',
    titleLocal: {
      hi: 'संविधान अंगीकरण पर ऐतिहासिक भाषण (25 नवंबर 1949)',
      mr: 'संविधान स्वीकृतीवरील ऐतिहासिक भाषण (२५ नोव्हेंबर १९४९)',
    },
    year: 1949,
    dateString: 'November 25, 1949',
    volumeCitation: 'Constituent Assembly of India Debates (Vol. XI, pp. 972–981)',
    category: 'debate',
    categoryLabel: 'Constitutional Assembly Address',
    sourceArchive: 'Parliament House, New Delhi / Official Debates',
    preface:
      'Dr. Ambedkar’s final and most celebrated address to the Constituent Assembly. Moving the resolution for adoption, he warned of the perils of entering into a "life of contradictions" where political equality coexists with systemic social and economic inequality.',
    ocrConfidence: 99.8,
    totalChapters: 4,
    totalPages: 24,
    chapters: [
      {
        id: 'cad-ch-1',
        number: 1,
        title: 'Entering into a Life of Contradictions',
        subtitle: 'One Man, One Vote versus One Man, One Value',
        pageNumber: 972,
        paragraphs: [
          'On the 26th of January 1950, we are going to enter into a life of contradictions. In politics we will have equality and in social and economic life we will have inequality. In politics we will be recognising the principle of one man one vote and one vote one value.',
          'In our social and economic life, we shall, by reason of our social and economic structure, continue to deny the principle of one man one value.',
          'How long shall we continue to live this life of contradictions? How long shall we continue to deny equality in our social and economic life? If we continue to deny it for long, we will do so only by putting our political democracy in peril.',
          'We must remove this contradiction at the earliest possible moment or else those who suffer from inequality will blow up the structure of political democracy which this Assembly has so laboriously built up.',
        ],
        translation: {
          hi: [
            '26 जनवरी 1950 को हम एक विरोधाभासी जीवन में प्रवेश करने जा रहे हैं। राजनीति में हमारे पास समानता होगी, लेकिन सामाजिक और आर्थिक जीवन में विषमता होगी।',
            'राजनीति में हम "एक व्यक्ति, एक मत और एक मत, एक मूल्य" के सिद्धांत को स्वीकार करेंगे, लेकिन अपने सामाजिक-आर्थिक ढांचे के कारण हम "एक व्यक्ति, एक मूल्य" के सिद्धांत को नकारते रहेंगे।',
            'हम कब तक विरोधाभासों का यह जीवन जीते रहेंगे? यदि हमने इसे शीघ्र समाप्त नहीं किया, तो विषमता के शिकार लोग लोकतंत्र के इस ढांचे को ध्वस्त कर देंगे जिसे इस सभा ने इतने परिश्रम से खड़ा किया है।',
          ],
        },
        keyQuote: 'We are going to enter into a life of contradictions. How long shall we continue to deny the principle of one man one value?',
        citation: 'CAD Vol. XI, 25 Nov 1949, p. 979',
      },
      {
        id: 'cad-ch-2',
        number: 2,
        title: 'The Inseparable Trinity: Liberty, Equality, and Fraternity',
        subtitle: 'Why political democracy cannot stand without social democracy',
        pageNumber: 976,
        paragraphs: [
          'Political democracy cannot last unless there lies at the base of it social democracy. What does social democracy mean? It means a way of life which recognises liberty, equality and fraternity as the principles of life.',
          'These principles of liberty, equality and fraternity are not to be treated as separate items in a trinity. They form a union of trinity in the sense that to divorce one from the other is to defeat the very purpose of democracy.',
          'Liberty cannot be divorced from equality, equality cannot be divorced from liberty. Nor can liberty and equality be divorced from fraternity. Without equality, liberty would produce the supremacy of the few over the many.',
        ],
        keyQuote: 'Liberty, equality and fraternity form a union of trinity. To divorce one from the other is to defeat the very purpose of democracy.',
        citation: 'CAD Vol. XI, 25 Nov 1949, p. 980',
      },
    ],
  },

  'article-32-debate-1948': {
    id: 'article-32-debate-1948',
    title: 'Article 32: The Heart and Soul of the Constitution',
    titleLocal: {
      hi: 'अनुच्छेद 32: संविधान का हृदय और आत्मा (9 दिसंबर 1948)',
      mr: 'कलम ३२: राज्यघटनेचा आत्मा आणि हृदय',
    },
    year: 1948,
    dateString: 'December 9, 1948',
    volumeCitation: 'Constituent Assembly of India Debates (Vol. VII, pp. 950–958)',
    category: 'debate',
    categoryLabel: 'Constitutional Assembly Debate',
    sourceArchive: 'Parliament House, New Delhi',
    preface:
      'Dr. Ambedkar’s seminal defense of Article 32 (Right to Constitutional Remedies). Replying to amendments seeking to dilute writ jurisdiction, he proclaimed that without this remedy, the entire Constitution would be reduced to a nullity.',
    ocrConfidence: 99.6,
    totalChapters: 2,
    totalPages: 14,
    chapters: [
      {
        id: 'art32-ch-1',
        number: 1,
        title: 'The Supreme Remedy and the Soul of the Constitution',
        subtitle: 'Direct writ access to the Supreme Court as the citizen’s inviolable fortress',
        pageNumber: 953,
        paragraphs: [
          'If I was asked to name any particular article in this Constitution as the most important—an article without which this Constitution would be a nullity—I could not refer to any other article except this one. It is the very soul of the Constitution and the very heart of it.',
          'Hereafter it would not be possible for any legislature to take away the rights which are conferred by the provisions contained in this Part. The provisions of this article stand on a very different footing.',
          'The Supreme Court is constituted as the protector and guarantor of fundamental rights. It cannot refuse to entertain a petition for the enforcement of fundamental rights.',
        ],
        translation: {
          hi: [
            'यदि मुझसे पूछा जाए कि इस संविधान का सबसे महत्वपूर्ण अनुच्छेद कौन सा है, जिसके बिना यह संविधान शून्य हो जाएगा, तो मैं इस अनुच्छेद 32 के अलावा किसी अन्य का नाम नहीं ले सकता। यह संविधान की आत्मा और उसका हृदय है।',
            'संसद या विधानमंडल अब नागरिकों के मौलिक अधिकारों को छीन नहीं सकते। सर्वोच्च न्यायालय इन अधिकारों का स्थायी संरक्षक और गारंटीदाता है।',
          ],
        },
        keyQuote: 'An article without which this Constitution would be a nullity. It is the very soul of the Constitution and the very heart of it.',
        citation: 'CAD Vol. VII, 9 Dec 1948, p. 953',
      },
    ],
  },

  'mahad-satyagraha-1927': {
    id: 'mahad-satyagraha-1927',
    title: 'Declaration at the Mahad Satyagraha (Chavdar Tale)',
    titleLocal: {
      hi: 'महाड सत्याग्रह घोषणापत्र (चवदार तालाब, 1927)',
      mr: 'महाड चवदार तळे सत्याग्रह जाहीरनामा (१९२७)',
    },
    year: 1927,
    dateString: 'March 20, 1927',
    volumeCitation: 'BAWS Vol. 17, Part 1, pp. 3–14',
    category: 'speech',
    categoryLabel: 'Civil Rights Declaration',
    sourceArchive: 'Mahad Conference Proceedings, Kolaba District',
    preface:
      'On March 20, 1927, Dr. Ambedkar led thousands of untouchables to drink water from the public Chavdar Lake in Mahad, transforming India’s civil rights movement from philanthropic begging to the assertion of natural human equality.',
    ocrConfidence: 98.9,
    totalChapters: 2,
    totalPages: 12,
    chapters: [
      {
        id: 'mahad-ch-1',
        number: 1,
        title: 'Not for Water, but for Human Dignity',
        subtitle: 'Asserting civic equality at the public municipal reservoir',
        pageNumber: 3,
        paragraphs: [
          'It is not that by drinking water from the Chavdar Tale we will become immortal. We have gone to the tank only to prove that we too are human beings like other human beings. This conference has been called to usher in a new era of equality.',
          'Our struggle is not for the sake of water. It is for establishing our human rights, our self-respect, and our equality in the civic life of this nation. Until untouchability is annihilated, this country cannot claim to be civilised.',
        ],
        translation: {
          hi: [
            'चवदार तालाब का पानी पीने से हम अमर नहीं हो जाएंगे। हम उस तालाब पर केवल यह सिद्ध करने गए हैं कि हम भी अन्य मनुष्यों की तरह इंसान हैं। यह आंदोलन पानी के लिए नहीं, हमारे आत्मसम्मान और मानव अधिकारों की स्थापना के लिए है।',
          ],
        },
        keyQuote: 'We have gone to the tank only to prove that we too are human beings like other human beings.',
        citation: 'BAWS Vol. 17, Part 1, p. 3',
      },
    ],
  },
};
