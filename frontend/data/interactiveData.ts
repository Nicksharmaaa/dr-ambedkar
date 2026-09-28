import { QuizQuestion, QuoteItem, PhilosophyConcept, SoundboardClip } from '../types';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    category: 'Constitution',
    question: "Which article of the Indian Constitution did Dr. B. R. Ambedkar refer to as its 'very soul and the very heart'?",
    questionLocal: {
      hi: "भारतीय संविधान के किस अनुच्छेद को डॉ. बी. आर. आंबेडकर ने संविधान की 'आत्मा और हृदय' कहा था?",
      mr: "भारतीय राज्यघटनेच्या कोणत्या कलमाला डॉ. बाबासाहेब आंबेडकरांनी घटनेचा 'आत्मा आणि हृदय' म्हटले होते?",
      ta: "இந்திய அரசியலமைப்பின் எந்தப் பிரிவை டாக்டர் பி. ஆர். அம்பேத்கர் அதன் 'ஆன்மாவும் இதயமும்' என்று குறிப்பிட்டார்?",
      bn: "ভারতীয় সংবিধানের কোন অনুচ্ছেদকে ড. বি. আর. আম্বেদকর সংবিধানের 'আত্মা ও হৃদয়' বলে অভিহিত করেছিলেন?"
    },
    options: [
      "Article 14 (Equality before Law)",
      "Article 19 (Freedom of Speech)",
      "Article 21 (Right to Life)",
      "Article 32 (Right to Constitutional Remedies)"
    ],
    optionsLocal: {
      hi: [
        "अनुच्छेद 14 (विधि के समक्ष समता)",
        "अनुच्छेद 19 (भाषण एवं अभिव्यक्ति की स्वतंत्रता)",
        "अनुच्छेद 21 (जीवन का अधिकार)",
        "अनुच्छेद 32 (संवैधानिक उपचारों का अधिकार)"
      ],
      mr: [
        "कलम १४ (कायद्यापुढे समानता)",
        "कलम १९ (भाषण स्वातंत्र्य)",
        "कलम २१ (जीवनाचा अधिकार)",
        "कलम ३२ (घटनात्मक उपाययोजनांचा अधिकार)"
      ],
      ta: [
        "பிரிவு 14 (சட்டத்தின் முன் சமத்துவம்)",
        "பிரிவு 19 (பேச்சுரிமை)",
        "பிரிவு 21 (வாழ்வுரிமை)",
        "பிரிவு 32 (அரசியலமைப்பு பரிகார உரிமை)"
      ],
      bn: [
        "অনুচ্ছেদ ১৪ (আইনের চোখে সমতা)",
        "অনুচ্ছেদ ১৯ (বাকস্বাধীনতা)",
        "অনুচ্ছেদ ২১ (জীবনের অধিকার)",
        "অনুচ্ছেদ ৩২ (সাংবিধানিক প্রতিবিধানের অধিকার)"
      ]
    },
    correctIndex: 3,
    explanation: "Dr. Ambedkar stated: 'If I was asked to name any particular article in this Constitution as the most important... I could not refer to any other article except this one. It is the very soul of the Constitution and the very heart of it.'",
    explanationLocal: {
      hi: "डॉ. आंबेडकर ने कहा था: 'यदि मुझसे कोई पूछे कि इस संविधान में सबसे महत्वपूर्ण अनुच्छेद कौन सा है, तो मैं अनुच्छेद 32 के सिवा किसी और का नाम नहीं ले सकता। यह संविधान की आत्मा और उसका हृदय है।'",
      mr: "डॉ. आंबेडकर म्हणाले होते: 'या संविधानातील सर्वात महत्त्वाचे कलम कोणते असे विचारल्यास मी कलम ३२ शिवाय इतर कोणत्याही कलमाचा उल्लेख करू शकत नाही. तो या संविधानाचा आत्मा आणि हृदय आहे.'",
      ta: "டாக்டர் அம்பேத்கர் கூறினார்: 'இந்த அரசியலமைப்பில் மிக முக்கியமான ஒரு பிரிவை குறிப்பிடச் சொன்னால், பிரிவு 32-ஐத் தவிர வேறு எதையும் என்னால் குறிப்பிட முடியாது. இதுவே அரசியலமைப்பின் ஆன்மாவும் இதயமும் ஆகும்.'",
      bn: "ড. আম্বেদকর বলেছিলেন: 'আমাকে যদি সংবিধানের সবচেয়ে গুরুত্বপূর্ণ ধারাটির নাম বলতে বলা হয়, তবে আমি ধারা ৩২ ছাড়া আর কোনো ধারার নাম নিতে পারব না। এটি সংবিধানের আত্মা ও হৃদয়।'"
    },
    sourceCitation: "Constituent Assembly Debates, Vol. VII, December 9, 1948"
  },
  {
    id: 'q2',
    category: 'Writings',
    question: "Which of Dr. Ambedkar's seminal texts was originally prepared as an undelivered presidential address for the Jat-Pat-Todak Mandal in Lahore?",
    questionLocal: {
      hi: "डॉ. आंबेडकर का कौन सा प्रसिद्ध ग्रंथ लाहौर के जात-पात तोड़क मंडल के लिए अध्यक्षीय भाषण के रूप में तैयार किया गया था जिसे बाद में स्वतंत्र रूप से प्रकाशित किया गया?",
      mr: "लाहोरच्या 'जात-पात तोडक मंडळा'साठी अध्यक्षीय भाषण म्हणून डॉ. आंबेडकरांनी कोणता क्रांतिकारक ग्रंथ लिहिला होता?",
      ta: "லாகூரில் உள்ள ஜாத்-பாத்-தோடக் மண்டலுக்காக ஆற்றப்படாமல் பின்னர் புகழ்பெற்ற நூலாக வெளியிடப்பட்ட அம்பேத்கரின் உரை எது?",
      bn: "লাহোরের জাত-পাত তোড়ক মণ্ডলের জন্য সভাপতি হিসেবে ড. আম্বেদকরের অপ্রদত্ত ভাষণটি পরবর্তীতে কোন কালজয়ী গ্রন্থ হিসেবে প্রকাশিত হয়?"
    },
    options: [
      "The Problem of the Rupee",
      "Annihilation of Caste",
      "Castes in India: Their Mechanism, Genesis and Development",
      "The Buddha and His Dhamma"
    ],
    optionsLocal: {
      hi: [
        "द प्रॉब्लम ऑफ द रुपी (रुपये की समस्या)",
        "एनिहिलेशन ऑफ कास्ट (जाति का विनाश)",
        "कास्ट्स इन इंडिया: देयर मेकैनिज्म, जेनेसिस एंड डेवलपमेंट",
        "द बुद्ध एंड हिज धम्म (बुद्ध और उनका धम्म)"
      ],
      mr: [
        "द प्रॉब्लेम ऑफ द रुपी",
        "अ‍ॅनहिलेशन ऑफ कास्ट (जातीचा उच्छेद)",
        "कास्ट्स इन इंडिया",
        "द बुद्ध अँड हिज धम्म"
      ],
      ta: [
        "தி பிராப்ளம் ஆஃப் தி ருபீ",
        "சாதி ஒழிப்பு (Annihilation of Caste)",
        "இந்தியாவில் சாதிகள்",
        "புத்தரும் அவரது தம்மமும்"
      ],
      bn: [
        "দ্য প্রবলেম অফ দ্য রুপি",
        "অ্যানাইহিলেশন অফ কাস্ট (জাতিভেদ উচ্ছেদ)",
        "কাস্টস ইন ইন্ডিয়া",
        "দ্য বুদ্ধ অ্যান্ড হিজ ধম্ম"
      ]
    },
    correctIndex: 1,
    explanation: "In 1936, the Jat-Pat-Todak Mandal invited him to preside over their annual conference in Lahore. When the committee objected to his uncompromising critique of Vedic scripture, Ambedkar cancelled the speech and published it independently as 'Annihilation of Caste'.",
    explanationLocal: {
      hi: "1936 में जात-पात तोड़क मंडल ने उन्हें लाहौर सम्मेलन के लिए आमंत्रित किया। जब समिति ने वैदिक शास्त्रों की उनकी तीखी आलोचना पर आपत्ति जताई, तो आंबेडकर ने सम्मेलन रद्द कर स्वयं 'जाति का विनाश' (Annihilation of Caste) ग्रंथ प्रकाशित किया।",
      mr: "१९३६ मध्ये 'जात-पात तोडक मंडळा'ने त्यांना लाहोर परिषदेचे अध्यक्ष म्हणून निमंत्रित केले. परंतु वैदिक ग्रंथांवरील त्यांच्या परखड टीकेला विरोध झाल्यामुळे त्यांनी परिषद रद्द करून 'जातीचा उच्छेद' (Annihilation of Caste) हे पुस्तक स्वतः प्रसिद्ध केले.",
      ta: "1936-ல் வேத நூல்கள் மீதான அவரது சமரசமற்ற விமர்சனத்தை ஏற்பாட்டாளர்கள் மாற்றக் கோரியதால், உரையை ரத்து செய்து 'சாதி ஒழிப்பு' என்ற தனி நூலாக அம்பேத்கர் வெளியிட்டார்.",
      bn: "১৯৩৬ সালে আয়োজকরা বৈদিক শাস্ত্রের আপসহীন সমালোচনা সংশোধনের অনুরোধ জানালে আম্বেদকর ভাষণটি বাতিল করেন এবং স্বতন্ত্রভাবে 'অ্যানাইহিলেশন অফ কাস্ট' প্রকাশ করেন।"
    },
    sourceCitation: "BAWS Vol. 1, Preface to Annihilation of Caste (1936)"
  },
  {
    id: 'q3',
    category: 'Movements',
    question: "What was the primary objective of the historic Mahad Satyagraha led by Dr. Ambedkar on March 20, 1927?",
    questionLocal: {
      hi: "20 मार्च 1927 को डॉ. आंबेडकर के नेतृत्व में हुए ऐतिहासिक महाड सत्याग्रह का प्राथमिक उद्देश्य क्या था?",
      mr: "२० मार्च १९२७ रोजी डॉ. बाबासाहेब आंबेडकरांच्या नेतृत्वाखाली झालेल्या ऐतिहासिक महाड सत्याग्रहाचा मुख्य उद्देश काय होता?",
      ta: "மார்ச் 20, 1927 அன்று டாக்டர் அம்பேத்கர் தலைமையேற்ற வரலாற்றுச் சிறப்புமிக்க மகாத் சத்தியாகிரகத்தின் முக்கிய நோக்கம் என்ன?",
      bn: "২০ মার্চ ১৯২৭ সালে ড. আম্বেদকরের নেতৃত্বে অনুষ্ঠিত ঐতিহাসিক মহাদ সত্যাগ্রহের মূল উদ্দেশ্য কী ছিল?"
    },
    options: [
      "To boycott foreign textile goods",
      "To demand separate legislative electorates",
      "To assert the civic right of untouchables to draw water from the public Chavadar Tank",
      "To establish the Independent Labour Party"
    ],
    optionsLocal: {
      hi: [
        "विदेशी कपड़ों का बहिष्कार करना",
        "पृथक निर्वाचक मंडल की मांग करना",
        "सार्वजनिक चवदार तालाब से पानी पीने के मानवीय अधिकार को बहाल करना",
        "इंडिपेंडेंट लेबर पार्टी की स्थापना करना"
      ],
      mr: [
        "परदेशी कापडावर बहिष्कार टाकणे",
        "स्वतंत्र मतदारसंघांची मागणी करणे",
        "सार्वजनिक चवदार तळ्याचे पाणी पिण्याचा मानवी हक्क प्रस्थापित करणे",
        "स्वतंत्र मजूर पक्षाची स्थापना करणे"
      ],
      ta: [
        "வெளிநாட்டு ஆடைகளைப் புறக்கணிப்பது",
        "தனித் தொகுதி கோருவது",
        "பொது சவதார் குளத்தில் நீர் அருந்தும் அடிப்படை மனித உரிமையை நிலைநாட்டுவது",
        "சுதந்திர தொழிலாளர் கட்சியைத் தொடங்குவது"
      ],
      bn: [
        "বিদেশি বস্ত্র বর্জন করা",
        "পৃথক আইনসভা নির্বাচনের দাবি তোলা",
        "পাবলিক চবদার পুকুর থেকে দলিতদের জল গ্রহণের নাগরিক অধিকার প্রতিষ্ঠা করা",
        "ইন্ডিপেন্ডেন্ট লেবার পার্টি গঠন করা"
      ]
    },
    correctIndex: 2,
    explanation: "Dr. Ambedkar famously proclaimed: 'We have gone to the tank only to prove that we too are human beings like other human beings. Our struggle is not for water; it is for establishing our human rights.' This day is commemorated as Social Empowerment Day.",
    explanationLocal: {
      hi: "डॉ. आंबेडकर ने उद्घोष किया था: 'हम तालाब पर केवल यह सिद्ध करने गए हैं कि हम भी अन्य मनुष्यों की तरह मनुष्य हैं। हमारा संघर्ष पानी के लिए नहीं, मानवाधिकारों की स्थापना के लिए है।' यह दिन सामाजिक अधिकारिता दिवस के रूप में मनाया जाता है।",
      mr: "डॉ. आंबेडकर म्हणाले: 'आपण तळ्यावर केवळ हे सिद्ध करण्यासाठी गेलो आहोत की आपणही इतर माणसांप्रमाणेच माणसे आहोत. आमचा लढा पाण्यासाठी नाही तर मानवी हक्क प्रस्थापित करण्यासाठी आहे.'",
      ta: "அம்பேத்கர் கூறினார்: 'நாம் மனிதர்கள் என்பதை நிரூபிக்கவே குளத்திற்குச் சென்றோம். நமது போராட்டம் தண்ணீருக்காக அல்ல, மனித உரிமையை நிலைநாட்டுவதற்காக.'",
      bn: "ড. আম্বেদকর ঘোষণা করেছিলেন: 'আমরা কেবল প্রমাণ করতে পুকুরে গিয়েছিলাম যে আমরাও অন্য মানুষের মতোই মানুষ। আমাদের লড়াই জলের জন্য নয়, মানবাধিকার প্রতিষ্ঠার জন্য।'"
    },
    sourceCitation: "BAWS Vol. 17 (Part I), Mahad Satyagraha Records"
  },
  {
    id: 'q4',
    category: 'Philosophy',
    question: "In his final Constituent Assembly speech on Nov 25, 1949, which 'union of trinity' did Ambedkar argue must never be separated?",
    questionLocal: {
      hi: "25 नवंबर 1949 को संविधान सभा के अपने अंतिम भाषण में डॉ. आंबेडकर ने किस 'त्रयी' को कभी अलग न करने की चेतावनी दी थी?",
      mr: "२५ नोव्हेंबर १९४९ च्या घटना परिषदेतील शेवटच्या भाषणात आंबेडकरांनी कोणत्या 'त्रिसूत्री'ला कधीही विभक्त न करण्याचा इशारा दिला होता?",
      ta: "நவம்பர் 25, 1949 அன்று அரசியலமைப்பு நிர்ணய சபையின் இறுதி உரையில் அம்பேத்கர் பிரிக்கக் கூடாது என்று வாதிட்ட 'மூவர் கூட்டணி' எது?",
      bn: "২৫ নভেম্বর ১৯৪৯ তারিখে গণপরিষদে তাঁর শেষ ভাষণে আম্বেদকর কোন 'ত্রয়ী নীতি'কে কখনোই পৃথক না করার সতর্কবার্তা দিয়েছিলেন?"
    },
    options: [
      "Faith, Hope, and Charity",
      "Liberty, Equality, and Fraternity",
      "Justice, Sovereign, and Republic",
      "Education, Agitation, and Organization"
    ],
    optionsLocal: {
      hi: [
        "विश्वास, आशा और दान",
        "स्वतंत्रता, समता और बंधुत्व (Liberty, Equality, Fraternity)",
        "न्याय, संप्रभुता और गणराज्य",
        "शिक्षित बनो, संघर्ष करो और संगठित रहो"
      ],
      mr: [
        "श्रद्धा, आशा आणि करुणा",
        "स्वातंत्र्य, समता आणि बंधुता (Liberty, Equality, Fraternity)",
        "न्याय, सार्वभौमत्व आणि प्रजासत्ताक",
        "शिका, संघर्ष करा आणि संघटित व्हा"
      ],
      ta: [
        "நம்பிக்கை, எதிர்பார்ப்பு மற்றும் கருணை",
        "சுதந்திரம், சமத்துவம் மற்றும் சகோதரத்துவம்",
        "நீதி, இறையாண்மை மற்றும் குடியரசு",
        "கற்பி, போராடு, ஒன்றுசேர்"
      ],
      bn: [
        "বিশ্বাস, আশা ও পরোপকার",
        "স্বাধীনতা, সমতা ও সৌভ্রাতৃত্ব (Liberty, Equality, Fraternity)",
        "ন্যায়বিচার, সার্বভৌমত্ব ও প্রজাতন্ত্র",
        "শিক্ষিত হও, সংগ্রাম করো ও সংগঠিত হও"
      ]
    },
    correctIndex: 1,
    explanation: "Ambedkar warned: 'These principles of liberty, equality and fraternity are not to be treated as separate items in a trinity. They form a union of trinity in the sense that to divorce one from the other is to defeat the very purpose of democracy.'",
    explanationLocal: {
      hi: "आंबेडकर ने चेतावनी दी थी: 'स्वतंत्रता, समता और बंधुत्व के इन सिद्धांतों को अलग-अलग मदों के रूप में नहीं देखा जाना चाहिए। ये एक अविभाज्य त्रयी हैं, जिनमें से एक को दूसरे से अलग करना लोकतंत्र के मूल उद्देश्य को पराजित करना है।'",
      mr: "आंबेडकरांनी इशारा दिला: 'स्वातंत्र्य, समता आणि बंधुता ही तत्त्वे स्वतंत्र मानली जाऊ शकत नाहीत. ही एक त्रयी आहे; एकाला दुसऱ्यापासून वेगळे करणे म्हणजे लोकशाहीचा मूळ हेतूच पराभूत करणे होय.'",
      ta: "அம்பேத்கர் எச்சரித்தார்: 'சுதந்திரம், சமத்துவம், சகோதரத்துவம் ஆகியவற்றை தனித்தனியாகப் பார்க்க முடியாது. ஒன்றிலிருந்து மற்றொன்றைப் பிரிப்பது ஜனநாயகத்தின் நோக்கத்தையே பாழாக்கிவிடும்.'",
      bn: "আম্বেদকর সতর্ক করেছিলেন: 'স্বাধীনতা, সমতা এবং সৌভ্রাতৃত্বকে আলাদা বিষয় হিসেবে বিবেচনা করা যায় না। এরা একটি অখণ্ড ত্রয়ী, এদের একটিকে অন্যটি থেকে বিচ্ছিন্ন করার অর্থ গণতন্ত্রের মূল উদ্দেশ্যকেই বিনষ্ট করা।'"
    },
    sourceCitation: "Constituent Assembly Debates, Vol. XI, Nov 25, 1949"
  },
  {
    id: 'q5',
    category: 'Constitution',
    question: "As independent India's first Law Minister, which major progressive legislative reform did Dr. Ambedkar draft to secure equal inheritance, marriage, and divorce rights for women?",
    questionLocal: {
      hi: "स्वतंत्र भारत के प्रथम कानून मंत्री के रूप में महिलाओं के संपत्ति उत्तराधिकार, विवाह और तलाक के समान अधिकार सुनिश्चित करने हेतु डॉ. आंबेडकर ने कौन सा ऐतिहासिक विधेयक तैयार किया था?",
      mr: "स्वतंत्र भारताचे पहिले कायदेमंत्री म्हणून महिलांना वारसाहक्क, विवाह आणि घटस्फोटाचे समान अधिकार मिळवून देण्यासाठी डॉ. आंबेडकरांनी कोणता क्रांतिकारक मसुदा तयार केला होता?",
      ta: "சுதந்திர இந்தியாவின் முதல் சட்ட அமைச்சராக, பெண்களுக்கு சமமான வாரிசுரிமை மற்றும் விவாகரத்து உரிமைகளைப் பெற அம்பேத்கர் வரைந்த வரலாற்றுச் சட்டம் எது?",
      bn: "স্বাধীন ভারতের প্রথম আইনমন্ত্রী হিসেবে নারীদের সমান উত্তরাধিকার ও বিবাহবিচ্ছেদের অধিকার নিশ্চিত করতে ড. আম্বেদকর কোন ঐতিহাসিক সংস্কার বিল রচনা করেছিলেন?"
    },
    options: [
      "The Hindu Code Bill",
      "The Maternity Benefit Act",
      "The Dowry Prohibition Bill",
      "The Representation of the People Act"
    ],
    optionsLocal: {
      hi: [
        "द हिंदू कोड बिल (The Hindu Code Bill)",
        "मातृत्व लाभ अधिनियम",
        "दहेज प्रतिषेध विधेयक",
        "जनप्रतिनिधित्व अधिनियम"
      ],
      mr: [
        "हिंदू कोड बिल (The Hindu Code Bill)",
        "प्रसूती लाभ कायदा",
        "हुंडा प्रतिबंधक विधेयक",
        "लोकप्रतिनिधी कायदा"
      ],
      ta: [
        "இந்து சட்டத் தொகுப்பு மசோதா (The Hindu Code Bill)",
        "மகப்பேறு நலச் சட்டம்",
        "வரதட்சணை தடுப்பு மசோதா",
        "மக்கள் பிரதிநிதித்துவச் சட்டம்"
      ],
      bn: [
        "হিন্দু কোড বিল (The Hindu Code Bill)",
        "মাতৃত্বকালীন সুবিধা আইন",
        "যৌতুক নিরোধক বিল",
        "জনপ্রতিনিধিত্ব আইন"
      ]
    },
    correctIndex: 0,
    explanation: "Dr. Ambedkar drafted and passionately championed the Hindu Code Bill to reform ancient customary laws and grant women equal rights of property inheritance, monogamy, and civil divorce. When cabinet compromises stalled the bill, he resigned as Law Minister in protest in 1951.",
    explanationLocal: {
      hi: "डॉ. आंबेडकर ने महिलाओं को संपत्ति में समान अधिकार, एकपत्नी प्रथा और नागरिक तलाक का अधिकार दिलाने के लिए हिंदू कोड बिल तैयार किया। जब संसद और मंत्रिमंडल ने इसे पारित करने में बाधा डाली, तो उन्होंने 1951 में विरोध स्वरूप कानून मंत्री पद से इस्तीफा दे दिया।",
      mr: "डॉ. आंबेडकरांनी महिलांना मालमत्तेत समान वारसाहक्क आणि समान प्रतिष्ठा मिळवून देण्यासाठी हिंदू कोड बिल मांडले. जेव्हा ते अडवले गेले, तेव्हा त्यांनी तत्त्वनिष्ठपणे १९५१ मध्ये कायदेमंत्री पदाचा राजीनामा दिला.",
      ta: "பெண்களின் சம உரிமைகளுக்காக அம்பேத்கர் இந்து சட்டத் தொகுப்பு மசோதாவைத் தயாரித்தார். அமைச்சரவை சமரசங்களால் மசோதா முடக்கப்பட்டபோது, 1951-ல் தனது அமைச்சர் பதவியைத் துறந்தார்.",
      bn: "ড. আম্বেদকর নারীদের সম্পত্তিতে সমানাধিকার ও নাগরিক অধিকার নিশ্চিত করতে হিন্দু কোড বিলের খসড়া তৈরি করেন। এতে বাধা এলে তিনি ১৯৫১ সালে আইনমন্ত্রীর পদ থেকে পদত্যাগ করেন।"
    },
    sourceCitation: "Cabinet Resignation Statement, October 10, 1951 (BAWS Vol. 14)"
  },
  {
    id: 'q6',
    category: 'Writings',
    question: "Dr. Ambedkar's doctoral thesis at the London School of Economics, 'The Problem of the Rupee', served as a foundational blueprint for which institution?",
    questionLocal: {
      hi: "लंदन स्कूल ऑफ इकोनॉमिक्स में डॉ. आंबेडकर का डॉक्टरेट शोध प्रबंध 'द प्रॉब्लम ऑफ द रुपी' किस प्रमुख भारतीय संस्था के गठन का आधार बना?",
      mr: "लंडन स्कूल ऑफ इकॉनॉमिक्समधील डॉ. आंबेडकरांचा 'द प्रॉब्लेम ऑफ द रुपी' हा प्रबंध कोणत्या राष्ट्रीय संस्थेच्या स्थापनेचा पाया ठरला?",
      ta: "லண்டன் ஸ்கூல் ஆஃப் எகனாமிக்ஸில் அம்பேத்கரின் 'தி பிராப்ளம் ஆஃப் தி ருபீ' ஆய்வறிக்கை எந்த நிறுவனம் தோன்றுவதற்கு அடித்தளமாக அமைந்தது?",
      bn: "লন্ডন স্কুল অব ইকোনমিক্সে ড. আম্বেদকরের ডক্টরাল থিসিস 'দ্য প্রবলেম অফ দ্য রুপি' কোন গুরুত্বপূর্ণ প্রতিষ্ঠান গঠনের ভিত্তি স্থাপন করেছিল?"
    },
    options: [
      "Planning Commission of India",
      "State Bank of India",
      "Reserve Bank of India (RBI)",
      "Finance Commission of India"
    ],
    optionsLocal: {
      hi: [
        "भारत का योजना आयोग",
        "भारतीय स्टेट बैंक",
        "भारतीय रिजर्व बैंक (Reserve Bank of India - RBI)",
        "भारत का वित्त आयोग"
      ],
      mr: [
        "नियोजन आयोग",
        "स्टेट बँक ऑफ इंडिया",
        "भारतीय रिझर्व्ह बँक (RBI)",
        "वित्त आयोग"
      ],
      ta: [
        "திட்டக் குழு",
        "பாரத ஸ்டேட் வங்கி",
        "இந்திய ரிசர்வ் வங்கி (RBI)",
        "நிதி ஆணையம்"
      ],
      bn: [
        "ভারতের পরিকল্পনা কমিশন",
        "স্টেট ব্যাঙ্ক অফ ইন্ডিয়া",
        "ভারতীয় রিজার্ভ ব্যাঙ্ক (RBI)",
        "অর্থ কমিশন"
      ]
    },
    correctIndex: 2,
    explanation: "When the Hilton Young Commission (Royal Commission on Indian Currency and Finance) met in 1926, each member carried Dr. Ambedkar's book 'The Problem of the Rupee: Its Origin and Its Solution' to frame the legislative charter that created the Reserve Bank of India.",
    explanationLocal: {
      hi: "1926 में जब हिल्टन यंग कमीशन (भारतीय मुद्रा और वित्त पर रॉयल कमीशन) बैठा, तो प्रत्येक सदस्य के पास डॉ. आंबेडकर की पुस्तक 'द प्रॉब्लम ऑफ द रुपी' थी, जिसने 1935 में भारतीय रिजर्व बैंक (RBI) की स्थापना की वैधानिक रूपरेखा तय की।",
      mr: "१९२६ च्या हिल्टन यंग कमिशनसमोर बाबासाहेबांच्या 'द प्रॉब्लेम ऑफ द रुपी' या ग्रंथाचा अभ्यास करूनच भारतीय रिझर्व्ह बँकेची (RBI) मार्गदर्शक तत्त्वे निश्चित करण्यात आली.",
      ta: "1926-ல் ஹில்டன் யங் கமிஷன் கூடியபோது, அம்பேத்கரின் 'தி பிராப்ளம் ஆஃப் தி ருபீ' நூலின் அடிப்படையில் இந்திய ரிசர்வ் வங்கியை (RBI) உருவாக்கும் சட்டம் வகுக்கப்பட்டது.",
      bn: "১৯২৬ সালে হিলটন ইয়ং কমিশন আম্বেদকরের 'দ্য প্রবলেম অফ দ্য রুপি' গ্রন্থটির উপর ভিত্তি করে ১৯৩৫ সালে ভারতীয় রিজার্ভ ব্যাঙ্ক (RBI) প্রতিষ্ঠা করে।"
    },
    sourceCitation: "Royal Commission on Indian Currency and Finance (1926), Minutes of Evidence"
  },
  {
    id: 'q7',
    category: 'Philosophy',
    question: "What did Dr. Ambedkar identify as the three-word foundational motto for the Bahishkrit Hitakarini Sabha founded in 1924?",
    questionLocal: {
      hi: "1924 में स्थापित बहिष्कृत हितकारिणी सभा के लिए डॉ. आंबेडकर ने कौन सा प्रसिद्ध त्रिसूत्रीय मूलमंत्र दिया था?",
      mr: "१९२४ साली स्थापन झालेल्या बहिष्कृत हितकारिणी सभेसाठी डॉ. बाबासाहेब आंबेडकरांनी कोणता अमर त्रिसूत्री संदेश दिला होता?",
      ta: "1924-ல் தொடங்கப்பட்ட பஹிஷ்கிருத் ஹிதகாரிணி சபாவிற்கு அம்பேத்கர் வழங்கிய மூன்று வார்த்தை தாரக மந்திரம் எது?",
      bn: "১৯২৪ সালে প্রতিষ্ঠিত বহিষ্কৃত হিতকারিণী সভার জন্য ড. আম্বেদকর কোন ত্রয়ী মূলমন্ত্র দিয়েছিলেন?"
    },
    options: [
      "Truth, Non-violence, Swaraj",
      "Educate, Agitate, Organize",
      "Work, Sacrifice, Liberty",
      "Dignity, Harmony, Progress"
    ],
    optionsLocal: {
      hi: [
        "सत्य, अहिंसा, स्वराज",
        "शिक्षित बनो, संघर्ष करो, संगठित रहो (Educate, Agitate, Organize)",
        "कर्म, त्याग, स्वतंत्रता",
        "गरिमा, समरसता, प्रगति"
      ],
      mr: [
        "सत्य, अहिंसा, स्वराज्य",
        "शिका, संघटित व्हा, संघर्ष करा (Educate, Agitate, Organize)",
        "कार्य, त्याग, स्वातंत्र्य",
        "स्वाभिमान, समता, प्रगती"
      ],
      ta: [
        "உண்மை, அகிம்சை, சுயராஜ்யம்",
        "கற்பி, கிளர்ந்தெழு, ஒன்றுசேர் (Educate, Agitate, Organize)",
        "உழைப்பு, தியாகம், சுதந்திரம்",
        "சுயமரியாதை, நல்லிணக்கம், வளர்ச்சி"
      ],
      bn: [
        "সত্য, অহিংসা, স্বরাজ",
        "শিক্ষিত হও, সংগ্রাম করো, সংগঠিত হও (Educate, Agitate, Organize)",
        "পরিশ্রম, ত্যাগ, স্বাধীনতা",
        "মর্যাদা, সংহতি, প্রগতি"
      ]
    },
    correctIndex: 1,
    explanation: "Dr. Ambedkar gave the clarion call: 'Educate, Agitate, Organize; Have faith in yourselves.' He believed that critical knowledge, active agitation against injustice, and cohesive organization were necessary for social revolution.",
    explanationLocal: {
      hi: "डॉ. आंबेडकर ने अमर आह्वान दिया था: 'शिक्षित बनो, संघर्ष करो, संगठित रहो; अपने आप में विश्वास रखो।' उनका दृढ़ विश्वास था कि अन्याय के विरुद्ध बौद्धिक चेतना और संगठित शक्ति ही मुक्ति का मार्ग है।",
      mr: "डॉ. आंबेडकरांनी हा ऐतिहासिक संदेश दिला: 'शिका, संघटित व्हा आणि संघर्ष करा; स्वतःवर विश्वास ठेवा.' ज्ञान, संघटन आणि न्याय्य लढा हीच सामाजिक क्रांतीची सूत्रे आहेत.",
      ta: "அம்பேத்கர் முழங்கினார்: 'கற்பி, கிளர்ந்தெழு, ஒன்றுசேர்; உங்கள் மீது நம்பிக்கை வையுங்கள்.' அறிவும் ஒன்றுபட்ட போராட்டமுமே சமூக மாற்றத்திற்கு வழிவகுக்கும் என்று நம்பினார்.",
      bn: "আম্বেদকর ঐতিহাসিক ডাক দিয়েছিলেন: 'শিক্ষিত হও, সংগ্রাম করো, সংগঠিত হও; নিজের ওপর বিশ্বাস রাখো।' তাঁর বিশ্বাস ছিল সামাজিক মুক্তির জন্য জ্ঞান ও ঐক্যবদ্ধ লড়াই অপরিহার্য।"
    },
    sourceCitation: "Speech at All-India Depressed Classes Conference, Nagpur (1942)"
  }
];

export const FAMOUS_QUOTES: QuoteItem[] = [
  {
    id: 'quote-1',
    quote: "Cultivation of mind should be the ultimate aim of human existence.",
    quoteLocal: {
      hi: "मनुष्य के अस्तित्व का अंतिम लक्ष्य अपने मन और विवेक का विकास होना चाहिए।",
      mr: "मानवी अस्तित्वाचे अंतिम ध्येय मनाची मशागत आणि बुद्धीचा विकास हेच असले पाहिजे.",
      ta: "மனித வாழ்வின் இறுதி இலக்கு மனதை பண்படுத்துவதாகவும் அறிவை வளர்ப்பதாகவும் இருக்க வேண்டும்.",
      bn: "মনুষ্য জীবনের চূড়ান্ত লক্ষ্য হওয়া উচিত মনের চর্চা ও বুদ্ধির বিকাশসাধন।"
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
      mr: "२६ जानेवारी १९५० रोजी आपण एका विरोधाभासांच्या आयुष्यात प्रवेश करणार आहोत. राजकारणात समानता असेल, पण सामाजिक आणि आर्थिक जीवनात विषमता असेल.",
      ta: "26 ஜனவரி 1950 அன்று நாம் முரண்பாடுகள் நிறைந்த வாழ்க்கையில் நுழையப் போகிறோம். அரசியலில் சமத்துவம் இருக்கும், ஆனால் சமூக-பொருளாதார வாழ்வில் சமத்துவமின்மை இருக்கும்.",
      bn: "২৬ জানুয়ারি ১৯৫০ তারিখে আমরা এক বৈপরীত্যপূর্ণ জীবনে প্রবেশ করতে যাচ্ছি। রাজনীতিতে আমরা সমতা পাব, কিন্তু সামাজিক ও অর্থনৈতিক জীবনে থাকবে তীব্র অসমতা।"
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
      mr: "मी कोणत्याही समाजाची प्रगती ही त्या समाजातील स्त्रियांनी केलेल्या प्रगतीवरून मोजतो.",
      ta: "ஒரு சமூகத்தின் முன்னேற்றத்தை அச்சமூகத்தின் பெண்கள் அடைந்துள்ள முன்னேற்றத்தின் அளவைக் கொண்டு நான் அளவிடுகிறேன்.",
      bn: "আমি কোনো সমাজের অগ্রগতি পরিমাপ করি সেই সমাজের নারীরা যে পরিমাণ অগ্রগতি অর্জন করেছে তার ভিত্তিতে।"
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
      mr: "हिरावून घेतलेले हक्क शोषकांच्या दयेवर कधीच परत मिळत नाहीत, तर अखंड संघर्षाने मिळतात. बळी बोकडाचा दिला जातो, सिंहाचा नाही.",
      ta: "இழந்த உரிமைகள் அபகரிப்பாளர்களின் மனசாட்சியிடம் கெஞ்சுவதால் ஒருபோதும் திரும்பாது, மாறாக தொடர் போராட்டத்தாலேயே பெற முடியும். ஆடுகள் தான் பலியிடப்படுகின்றன, சிங்கங்கள் அல்ல.",
      bn: "শোষণকারীদের কাছে দয়ার আবেদন জানিয়ে কখনো হারানো অধিকার ফিরে পাওয়া যায় না, তা অবিরাম সংগ্রামের মাধ্যমেই অর্জন করতে হয়। বলির জন্য ছাগলকেই ব্যবহার করা হয়, সিংহকে নয়।"
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
      mr: "घटनात्मक नैतिकता ही उपजत भावना नसते, तिची जाणीवपूर्वक मशागत करावी लागते. आपल्या जनतेने ती शिकणे अद्याप बाकी आहे.",
      ta: "அரசியலமைப்பு ஒழுக்கம் என்பது இயல்பாக பிறக்கும் உணர்வு அல்ல, அது வளர்த்தெடுக்கப்பட வேண்டியது. நம் மக்கள் அதை இன்னும் கற்க வேண்டும்.",
      bn: "সাংবিধানিক নৈতিকতা কোনো সহজাত অনুভূতি নয়, এটিকে সচেতনভাবে লালন করতে হয়। আমাদের অনুধাবন করতে হবে যে আমাদের দেশের মানুষের এটি শেখা এখনও বাকি আছে।"
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
      mr: "शिका, संघटित व्हा, संघर्ष करा; स्वतःवर विश्वास ठेवा आणि कधीही धीर सोडू नका.",
      ta: "கற்பி, கிளர்ந்தெழு, ஒன்றுசேர்; உங்கள் மீது நம்பிக்கை வையுங்கள், ஒருபோதும் தைரியத்தை இழக்காதீர்கள்.",
      bn: "শিক্ষিত হও, আন্দোলন করো, সংগঠিত হও; নিজের ওপর বিশ্বাস রাখো এবং কখনো সাহস হারিও না।"
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
      mr: "जात ही केवळ कामाची विभागणी नाही, तर ती माणसांची आणि श्रमिकांची उतरंड आहे.",
      ta: "சாதி என்பது வெறும் உழைப்பின் பிரிவினை மட்டுமல்ல, அது உழைப்பாளர்களின் படிநிலை பிரிவினையாகும்.",
      bn: "জাতিভেদ কেবল শ্রমের বিভাজন নয়, এটি শ্রমিকদের স্তরায়িত বিভাজন।"
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
      mr: "धर्मातील भक्ती ही आत्म्याच्या मुक्तीचा मार्ग असू शकेल; परंतु राजकारणातील भक्ती किंवा व्यक्तिपूजा ही विनाशाचा आणि हुकूमशाहीचा हमखास मार्ग आहे.",
      ta: "மதத்தில் பக்தி என்பது ஆன்மாவின் முக்திக்கான வழியாக இருக்கலாம். ஆனால் அரசியலில் பக்தி அல்லது தனிநபர் வழிபாடு என்பது சீரழிவுக்கும் சர்வாதிகாரத்திற்கும் செல்லும் உறுதியான பாதையாகும்.",
      bn: "ধর্মে ভক্তি হয়তো আত্মার মুক্তির পথ হতে পারে, কিন্তু রাজনীতিতে ভক্তি বা অন্ধ নায়কপূজা নিশ্চিতভাবেই চরম অধঃপতন ও একনায়কতন্ত্রের পথ।"
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
    titleLocal: {
      hi: 'त्रयी का संगम (स्वतंत्रता, समता, बंधुत्व)',
      mr: 'त्रिसूत्री संगम (स्वातंत्र्य, समता, बंधुता)',
      ta: 'மும்மை ஒன்றியம் (சுதந்திரம், சமத்துவம், சகோதரத்துவம்)',
      bn: 'ত্রিমুখী মিলন (স্বাধীনতা, সমতা ও সৌভ্রাতৃত্ব)'
    },
    tagline: 'Liberty, Equality & Fraternity as One Indivisible Ethos',
    taglineLocal: {
      hi: 'स्वतंत्रता, समता और बंधुत्व एक अविभाज्य जीवन दर्शन के रूप में',
      mr: 'स्वातंत्र्य, समता आणि बंधुता हे एक अविभाज्य जीवनमूल्य',
      ta: 'சுதந்திரம், சமத்துவம் மற்றும் சகோதரத்துவம் ஒரு பிரிக்க முடியாத நெறிமுறை',
      bn: 'স্বাধীনতা, সমতা ও সৌভ্রাতৃত্ব একটি অবিভাজ্য নীতি হিসেবে'
    },
    description: 'Dr. Ambedkar asserted that democracy cannot survive if liberty, equality, and fraternity are treated as isolated ideas. Without equality, liberty produces the supremacy of the few. Without liberty, equality kills individual initiative. Without fraternity, neither liberty nor equality can become a natural course of things.',
    famousQuote: "These principles are not separate items in a trinity. To divorce one from the other is to defeat democracy.",
    relatedDocId: 'constituent-assembly-speech-1949',
    color: 'from-blue-600 to-indigo-600',
    iconName: 'Scale'
  },
  {
    id: 'constitutional-morality',
    title: 'Constitutional Morality',
    titleLocal: {
      hi: 'संवैधानिक नैतिकता',
      mr: 'घटनात्मक नैतिकता',
      ta: 'அரசியலமைப்பு ஒழுக்கம்',
      bn: 'সাংবিধানিক নৈতিকতা'
    },
    tagline: 'Subordinating Private Passion to Institutional Integrity',
    taglineLocal: {
      hi: 'व्यक्तिगत स्वार्थ से ऊपर संस्थागत गरिमा को स्थापित करना',
      mr: 'वैयक्तिक महत्त्वाकांक्षेपेक्षा घटनात्मक मूल्यांना सर्वोच्च स्थान',
      ta: 'தனிப்பட்ட விருப்புவெறுப்புகளை விட நிறுவன நேர்மையை முன்னிறுத்துதல்',
      bn: 'ব্যক্তিগত আবেগের ঊর্ধ্বে প্রাতিষ্ঠানিক অখণ্ডতাকে স্থান দেওয়া'
    },
    description: 'Dr. Ambedkar cautioned that a constitutional structure is only as good as the moral commitment of its citizens and leaders. Constitutional morality demands absolute respect for democratic processes, tolerance of opposition, and rejection of extra-constitutional hero-worship.',
    famousQuote: "Constitutional morality is not a natural sentiment. It has to be cultivated.",
    relatedDocId: 'article-32-debate-1948',
    color: 'from-amber-500 to-rose-600',
    iconName: 'Shield'
  },
  {
    id: 'annihilation-of-caste',
    title: 'Annihilation of Caste',
    titleLocal: {
      hi: 'जाति का विनाश',
      mr: 'जातीचा उच्छेद',
      ta: 'சாதி ஒழிப்பு',
      bn: 'জাতিভেদ উচ্ছেদ'
    },
    tagline: 'A Casteless Society as the Moral Foundation of Nationhood',
    taglineLocal: {
      hi: 'जातिविहीन समाज राष्ट्र निर्माण की नैतिक आधारशिला है',
      mr: 'जातीविरहित समाज ही राष्ट्र उभारणीची नैतिक पायाभरणी',
      ta: 'சாதியற்ற சமுதாயமே தேசத்தின் தார்மீக அடித்தளம்',
      bn: 'জাতিভেদহীন সমাজই জাতি গঠনের নৈতিক ভিত্তি'
    },
    description: 'Arguing that political independence without social democracy is hollow, Ambedkar exposed caste as an anti-social hierarchy that destroys fraternity and national consciousness. He prescribed scientific rationality and inter-marriage as the solvent of endogamy.',
    famousQuote: "You cannot build anything on the foundations of caste. Anything built on it will crack.",
    relatedDocId: 'annihilation-of-caste',
    color: 'from-emerald-600 to-teal-600',
    iconName: 'Flame'
  },
  {
    id: 'educate-agitate-organize',
    title: 'Educate, Agitate, Organize',
    titleLocal: {
      hi: 'शिक्षित बनो, संघर्ष करो, संगठित रहो',
      mr: 'शिका, संघटित व्हा, संघर्ष करा',
      ta: 'கற்பி, கிளர்ந்தெழு, ஒன்றுசேர்',
      bn: 'শিক্ষিত হও, সংগ্রাম করো, সংগঠিত হও'
    },
    tagline: 'The Tripartite Formula for Social Awakening',
    taglineLocal: {
      hi: 'सामाजिक जागृति और मानव मुक्ति का त्रिसूत्रीय सूत्र',
      mr: 'सामाजिक प्रबोधन आणि मानवी मुक्तीची त्रिसूत्री',
      ta: 'சமூக விழிப்புணர்வின் மும்மை சூத்திரம்',
      bn: 'সামাজিক জাগরণের ত্রিমুখী সূত্র'
    },
    description: 'Education illuminates self-worth; agitation creates vigilance against oppression; organization channels collective energy into sustained institutional transformation. This became the driving philosophy for millions seeking human dignity.',
    famousQuote: "Cultivation of mind should be the ultimate aim of human existence.",
    relatedDocId: 'castes-in-india-1916',
    color: 'from-violet-600 to-purple-600',
    iconName: 'BookOpen'
  },
  {
    id: 'gender-justice',
    title: 'Gender Justice & Legal Autonomy',
    titleLocal: {
      hi: 'लैंगिक न्याय एवं कानूनी अधिकार',
      mr: 'स्त्री-पुरुष समता व कायदेशीर हक्क',
      ta: 'பாலின நீதி மற்றும் சட்ட சுயாட்சி',
      bn: 'লিঙ্গ সমতা ও আইনি স্বায়ত্তশাসন'
    },
    tagline: 'Measuring Civilization by Women’s Freedom',
    taglineLocal: {
      hi: 'सभ्यता का मूल्यांकन महिलाओं की स्वतंत्रता और अधिकारों से',
      mr: 'महिलांच्या प्रगतीवरून मानवी संस्कृतीचे मूल्यमापन',
      ta: 'பெண்களின் விடுதலையைக் கொண்டு நாகரிகத்தை அளவிடுதல்',
      bn: 'নারীর স্বাধীনতার মাপকাঠিতে সভ্যতার পরিমাপ'
    },
    description: 'As independent India’s first Law Minister, Dr. Ambedkar drafted the revolutionary Hindu Code Bill, fighting for equal inheritance, monogamy, and the right to divorce. He resigned his cabinet post in 1951 when reactionary elements stalled the reform.',
    famousQuote: "I measure the progress of a community by the degree of progress which women have achieved.",
    relatedDocId: 'states-and-minorities-1947',
    color: 'from-pink-600 to-rose-500',
    iconName: 'Heart'
  },
  {
    id: 'economic-democracy',
    title: 'State Socialism & Economic Democracy',
    titleLocal: {
      hi: 'राज्य समाजवाद एवं आर्थिक लोकतंत्र',
      mr: 'राज्य समाजवाद आणि आर्थिक लोकशाही',
      ta: 'அரசு சோசலிசம் மற்றும் பொருளாதார ஜனநாயகம்',
      bn: 'রাষ্ট্রীয় সমাজতন্ত্র ও অর্থনৈতিক গণতন্ত্র'
    },
    tagline: 'One Man, One Value in Social & Economic Life',
    taglineLocal: {
      hi: 'सामाजिक और आर्थिक जीवन में प्रत्येक व्यक्ति का एक समान मूल्य',
      mr: 'सामाजिक व आर्थिक जीवनात प्रत्येक व्यक्तीचे समान मूल्य',
      ta: 'சமூக மற்றும் பொருளாதார வாழ்வில் ஒவ்வொரு மனிதருக்கும் சம மதிப்பு',
      bn: 'সামাজিক ও অর্থনৈতিক জীবনে প্রত্যেক ব্যক্তির সমান মূল্য'
    },
    description: 'In his 1947 constitutional memorandum "States and Minorities", Ambedkar proposed constitutional state socialism—mandating that key industries and agricultural land be managed by the democratic state so that private capital could not monopolize power.',
    famousQuote: "In politics we will have equality; in economic life we will have inequality. We must remove this contradiction.",
    relatedDocId: 'states-and-minorities-1947',
    color: 'from-cyan-600 to-blue-600',
    iconName: 'Coins'
  }
];

export const SOUNDBOARD_CLIPS: SoundboardClip[] = [
  {
    id: 'clip-1',
    title: "Life of Contradictions",
    titleLocal: {
      hi: "विरोधाभासों का जीवन",
      mr: "विरोधाभासांचे आयुष्य",
      ta: "முரண்பாடுகளின் வாழ்க்கை",
      bn: "বৈপরীত্যপূর্ণ জীবন"
    },
    speaker: "Dr. B. R. Ambedkar",
    event: "Constituent Assembly of India",
    eventLocal: {
      hi: "भारतीय संविधान सभा",
      mr: "भारतीय संविधान सभा",
      ta: "இந்திய அரசியலமைப்பு நிர்ணய சபை",
      bn: "ভারতীয় গণপরিষদ"
    },
    year: 1949,
    duration: "0:45",
    tags: ["Democracy", "Equality", "Constitution"],
    quote: "On the 26th of January 1950, we are going to enter into a life of contradictions. In politics we will have equality and in social and economic life we will have inequality.",
    quoteLocal: {
      hi: "26 जनवरी 1950 को हम विरोधाभासों के जीवन में प्रवेश करने जा रहे हैं। राजनीति में हमारे पास समानता होगी, परंतु सामाजिक और आर्थिक जीवन में असमानता होगी।",
      mr: "२६ जानेवारी १९५० रोजी आपण एका विरोधाभासांच्या आयुष्यात प्रवेश करणार आहोत. राजकारणात आपल्याकडे समानता असेल, पण सामाजिक आणि आर्थिक जीवनात विषमता असेल.",
      ta: "26 ஜனவரி 1950 அன்று நாம் முரண்பாடுகள் நிறைந்த வாழ்க்கையில் நுழையப் போகிறோம். அரசியலில் நமக்கு சமத்துவம் இருக்கும், ஆனால் சமூக-பொருளாதார வாழ்வில் சமத்துவமின்மை இருக்கும்.",
      bn: "২৬ জানুয়ারি ১৯৫০ তারিখে আমরা এক বৈপরীত্যপূর্ণ জীবনে প্রবেশ করতে যাচ্ছি। রাজনীতিতে আমরা সমতা পাব, কিন্তু সামাজিক ও অর্থনৈতিক জীবনে থাকবে তীব্র অসমতা।"
    },
    fullDocId: "constituent-assembly-speech-1949"
  },
  {
    id: 'clip-2',
    title: "On Indian Democracy & Social Structure",
    titleLocal: {
      hi: "भारतीय लोकतंत्र एवं सामाजिक ढांचा",
      mr: "भारतीय लोकशाही आणि सामाजिक रचना",
      ta: "இந்திய ஜனநாயகம் மற்றும் சமூக கட்டமைப்பு",
      bn: "ভারতীয় গণতন্ত্র ও সামাজিক কাঠামো"
    },
    speaker: "Dr. B. R. Ambedkar",
    event: "BBC World Service Interview, London",
    eventLocal: {
      hi: "बीबीसी वर्ल्ड सर्विस साक्षात्कार, लंदन",
      mr: "बीबीसी वर्ल्ड सर्व्हिस मुलाखत, लंडन",
      ta: "பிபிசி வேர்ல்ட் சர்வீஸ் நேர்காணல், லண்டன்",
      bn: "বিবিসি ওয়ার্ল্ড সার্ভিস সাক্ষাৎকার, লন্ডন"
    },
    year: 1953,
    duration: "1:15",
    tags: ["Democracy", "BBC Interview", "Fraternity"],
    quote: "Democracy in India is only a top-dressing on an Indian soil, which is essentially undemocratic. You cannot have democracy where there is no social equality.",
    quoteLocal: {
      hi: "भारत में लोकतंत्र केवल भारतीय मिट्टी पर एक ऊपरी परत के समान है, जो मूल रूप से अलोकतांत्रिक है। जहाँ सामाजिक समानता न हो, वहाँ वास्तविक लोकतंत्र नहीं हो सकता।",
      mr: "भारतात लोकशाही ही केवळ वरवरचा मुलामा आहे, जिथली माती मुळात अलोकशाही आहे. जिथे सामाजिक समता नाही तिथे लोकशाही टिकू शकत नाही.",
      ta: "இந்தியாவில் ஜனநாயகம் என்பது அடிப்படையில் ஜனநாயகமற்ற இந்திய மண்ணின் மீது பூசப்பட்ட வெறும் மேல்பூச்சு மட்டுமே. சமூக சமத்துவம் இல்லாத இடத்தில் ஜனநாயகம் இருக்க முடியாது.",
      bn: "ভারতে গণতন্ত্র হলো মূলত অগণতান্ত্রিক এক মাটির ওপর কেবল একটি আলগা উপরিস্তর মাত্র। যেখানে সামাজিক সমতা নেই সেখানে গণতন্ত্র টিকে থাকতে পারে না।"
    },
    fullDocId: "bbc-interview-1953"
  },
  {
    id: 'clip-3',
    title: "Water is Human Dignity",
    titleLocal: {
      hi: "पानी मानवाधिकार और मानवीय गरिमा है",
      mr: "पाणी हा मानवी हक्क आणि स्वाभिमान आहे",
      ta: "தண்ணீர் மனித சுயமரியாதை",
      bn: "জল হলো মানবমর্যাদার অধিকার"
    },
    speaker: "Dr. B. R. Ambedkar",
    event: "Mahad Chavadar Tank Declaration",
    eventLocal: {
      hi: "महाड चवदार तालाब सत्याग्रह",
      mr: "महाड चवदार तळे सत्याग्रह",
      ta: "மகாத் சவதார் குளம் பிரகடனம்",
      bn: "মহাদ চবদার জলাশয় ঘোষণা"
    },
    year: 1927,
    duration: "0:38",
    tags: ["Human Rights", "Mahad Satyagraha", "Equality"],
    quote: "Our struggle is not for water; it is for establishing our human rights. We have gone to the tank only to prove that we too are human beings.",
    quoteLocal: {
      hi: "हमारा संघर्ष पानी के लिए नहीं है; यह हमारे मानवाधिकारों की स्थापना के लिए है। हम तालाब पर केवल यह सिद्ध करने गए हैं कि हम भी अन्य मनुष्यों की तरह मनुष्य हैं।",
      mr: "आमचा लढा पाण्यासाठी नाही, तर मानवी हक्क प्रस्थापित करण्यासाठी आहे. आपण तळ्यावर केवळ हे सिद्ध करण्यासाठी गेलो आहोत की आपणही माणसेच आहोत.",
      ta: "நமது போராட்டம் தண்ணீருக்காக அல்ல; நமது மனித உரிமைகளை நிலைநாட்டுவதற்காகவே. நாமும் மனிதர்கள் என்பதை நிரூபிக்கவே நாம் குளத்திற்குச் சென்றோம்.",
      bn: "আমাদের সংগ্রাম জলের জন্য নয়; এটি আমাদের মানবাধিকার প্রতিষ্ঠার লড়াই। আমরা কেবল প্রমাণ করতে জলাশয়ে গিয়েছি যে আমরাও মানুষ।"
    },
    fullDocId: "annihilation-of-caste"
  },
  {
    id: 'clip-4',
    title: "Article 32: Heart and Soul",
    titleLocal: {
      hi: "अनुच्छेद 32: संविधान का हृदय और आत्मा",
      mr: "कलम ३२: संविधानाचे हृदय आणि आत्मा",
      ta: "பிரிவு 32: அரசியலமைப்பின் இதயமும் ஆன்மாவும்",
      bn: "অনুচ্ছেদ ৩২: সংবিধানের হৃদয় ও আত্মা"
    },
    speaker: "Dr. B. R. Ambedkar",
    event: "Constituent Assembly Debates",
    eventLocal: {
      hi: "संविधान सभा वाद-विवाद",
      mr: "संविधान सभा वादविवाद",
      ta: "அரசியலமைப்பு நிர்ணய சபை விவாதங்கள்",
      bn: "গণপরিষদ বিতর্ক"
    },
    year: 1948,
    duration: "0:52",
    tags: ["Fundamental Rights", "Supreme Court", "Remedies"],
    quote: "If I was asked to name any particular article as the most important, I could not refer to any other article except this one. It is the very soul of the Constitution and the very heart of it.",
    quoteLocal: {
      hi: "यदि मुझसे इस संविधान में किसी एक सबसे महत्वपूर्ण अनुच्छेद का नाम लेने को कहा जाए, तो मैं इस अनुच्छेद 32 के अलावा किसी और का नाम नहीं ले सकता। यह संविधान की आत्मा और उसका हृदय है।",
      mr: "या संविधानातील सर्वात महत्त्वाच्या कलमाचा उल्लेख करण्यास मला सांगितले तर मी कलम ३२ शिवाय इतर कोणत्याही कलमाचा उल्लेख करू शकत नाही. तो संविधानाचा आत्मा आणि हृदय आहे.",
      ta: "மிக முக்கியமான ஒரு பிரிவை குறிப்பிடச் சொன்னால், பிரிவு 32-ஐத் தவிர வேறு எதையும் என்னால் குறிப்பிட முடியாது. இது அரசியலமைப்பின் ஆன்மாவும் இதயமும் ஆகும்.",
      bn: "আমাকে যদি সবচেয়ে গুরুত্বপূর্ণ একটি ধারার নাম বলতে বলা হয়, তবে আমি ধারা ৩২ ছাড়া আর কোনো ধারার নাম বলতে পারব না। এটি সংবিধানের আত্মা ও হৃদয়।"
    },
    fullDocId: "article-32-debate-1948"
  },
  {
    id: 'clip-5',
    title: "Educate, Agitate, Organize",
    titleLocal: {
      hi: "शिक्षित बनो, आंदोलन करो, संगठित रहो",
      mr: "शिका, संघटित व्हा, संघर्ष करा",
      ta: "கற்பி, கிளர்ந்தெழு, ஒன்றுசேர்",
      bn: "শিক্ষিত হও, সংগ্রাম করো, সংগঠিত হও"
    },
    speaker: "Dr. B. R. Ambedkar",
    event: "All-India Depressed Classes Conference",
    eventLocal: {
      hi: "अखिल भारतीय दलित वर्ग सम्मेलन",
      mr: "अखिल भारतीय अस्पृश्य वर्ग परिषद",
      ta: "அகில இந்திய ஒடுக்கப்பட்ட வகுப்பினர் மாநாடு",
      bn: "সর্বভারতীয় নিপীড়িত শ্রেণি সম্মেলন"
    },
    year: 1942,
    duration: "0:30",
    tags: ["Awakening", "Education", "Youth"],
    quote: "My final words of advice to you are: Educate, Agitate and Organize; have faith in yourselves. With justice on our side, I do not see how we can lose our battle.",
    quoteLocal: {
      hi: "आपको मेरी अंतिम सलाह है: शिक्षित बनो, आंदोलन करो और संगठित रहो; अपने आप में विश्वास रखो। जब न्याय हमारे पक्ष में है, तो हम अपनी लड़ाई कभी हार नहीं सकते।",
      mr: "माझा तुम्हाला अंतिम संदेश आहे: शिका, संघर्ष करा आणि संघटित व्हा; स्वतःवर विश्वास ठेवा. न्याय आपल्या बाजूने असताना आपण हा लढा हरूच शकत नाही.",
      ta: "உங்களுக்கு எனது இறுதி அறிவுரை: கற்பி, கிளர்ந்தெழு, ஒன்றுசேர்; உங்கள் மீது நம்பிக்கை வையுங்கள். நீதி நம் பக்கம் இருக்கும்போது நாம் போரில் தோற்க முடியாது.",
      bn: "তোমাদের প্রতি আমার শেষ উপদেশ: শিক্ষিত হও, আন্দোলন করো এবং সংগঠित হও; নিজের ওপর বিশ্বাস রাখো। ন্যায়বিচার যখন আমাদের পক্ষে, তখন আমরা লড়াইয়ে হারব না।"
    },
    fullDocId: "annihilation-of-caste"
  }
];
