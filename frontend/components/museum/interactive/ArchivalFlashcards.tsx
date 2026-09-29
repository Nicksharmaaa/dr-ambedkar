'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  RotateCw, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, 
  Sparkles, BookOpen, Trophy, RotateCcw, Volume2, Award,
  Flame, HelpCircle, Layers, Shuffle, Check, Compass, Zap, Lightbulb,
  ExternalLink, MessageSquareQuote, Keyboard, Bookmark, Star
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects } from '@/utils/soundEffects';
import { speechController } from '@/utils/speechUtils';
import { Language } from '@/types/museum';
import '../games/ArcadeGames.css';

interface ArchivalFlashcardsProps {
  language: Language;
  onOpenDocument?: (docId: string) => void;
  onAskAI?: (query: string) => void;
}

interface FlashcardItem {
  id: string;
  frontTitle: string;
  frontTitleLocal?: Partial<Record<Language, string>>;
  year: number;
  category: string;
  promptQuestion: string;
  promptQuestionLocal?: Partial<Record<Language, string>>;
  archivalAnswer: string;
  archivalAnswerLocal?: Partial<Record<Language, string>>;
  keyQuote: string;
  bawsCitation: string;
  relatedDocId: string;
  keywords: string[];
  archivalClue: string;
}

const FLASHCARDS: FlashcardItem[] = [
  {
    id: 'fc-1',
    frontTitle: 'Annihilation of Caste (1936)',
    frontTitleLocal: {
      hi: 'जाति का विनाश (1936)',
      mr: 'जातीचा उच्छेद (1936)',
      ta: 'சாதி ஒழிப்பு (1936)',
      bn: 'জাতপাত উচ্ছেদ (১৯৩৬)'
    },
    year: 1936,
    category: 'Foundational Treatise',
    promptQuestion: 'Why did Dr. Ambedkar cancel his presidential speech to the Jat-Pat-Todak Mandal in Lahore and decide to self-publish it as an independent treatise?',
    promptQuestionLocal: {
      hi: 'डॉ. आंबेडकर ने लाहौर में जात-पात तोड़क मंडल के लिए अपना अध्यक्षीय भाषण क्यों रद्द कर दिया और इसे स्वतंत्र ग्रंथ के रूप में क्यों प्रकाशित किया?',
      mr: 'लाहोरच्या जात-पात तोडक मंडळाचे अध्यक्षीय भाषण रद्द करून डॉ. आंबेडकरांनी ते स्वतंत्र पुस्तक म्हणून का प्रसिद्ध केले?',
      ta: 'லாகூரில் ஏற்பாடு செய்யப்பட்ட உரையை ரத்து செய்துவிட்டு தனி நூலாக வெளியிட அம்பேத்கர் ஏன் முடிவு செய்தார்?',
      bn: 'ড. আম্বেদকর কেন লাহোরের ভাষণ বাতিল করে এটি স্বতন্ত্র গ্রন্থ হিসেবে প্রকাশ করেছিলেন?'
    },
    archivalAnswer: 'The organizers demanded he tone down his uncompromising critique of sacred Hindu scriptures. Ambedkar refused to alter a single syllable, withdrew from the conference, and financed the publication himself—demonstrating that caste is not a mere division of labour, but an unnatural division of labourers.',
    archivalAnswerLocal: {
      hi: 'आयोजकों ने उनसे वैदिक शास्त्रों की आलोचना को हटाने की मांग की थी। डॉ. आंबेडकर ने एक भी शब्द बदलने से मना कर दिया और स्वयं के खर्च पर ग्रंथ प्रकाशित कर सिद्ध किया कि जाति केवल काम का नहीं बल्कि श्रमिकों का अमानवीय श्रेणीबद्ध विभाजन है।',
      mr: 'आयोजकांनी भाषणातील धर्मग्रंथांवरील टीका वगळण्याची मागणी केली होती. आंबेडकरांनी एकही शब्द बदलण्यास नकार दिला आणि स्वतःच्या खर्चाने ग्रंथ छापून काढला.',
      ta: 'வேத நூல்கள் மீதான விமர்சனத்தை நீக்க ஏற்பாட்டாளர்கள் கோரியபோது, ஒரு சொல்லையும் மாற்ற மறுத்து சொந்த செலவில் நூலை வெளியிட்டார்.',
      bn: 'আয়োজকরা শাস্ত্রের সমালোচনা বাদ দিতে বললে আম্বেদকর কোনো আপস না করে নিজস্ব ব্যয়ে গ্রন্থটি প্রকাশ করেন।'
    },
    keyQuote: "You cannot build anything on the foundations of caste. You cannot build a nation, you cannot build an morality.",
    bawsCitation: "BAWS Vol. 1, Preface to Annihilation of Caste, pp. 23–96",
    relatedDocId: "annihilation-of-caste",
    keywords: ["Lahore Conference", "Scriptural Critique", "Division of Labourers"],
    archivalClue: "The speech was scheduled for May 1936 in Lahore; Har Bhagwan asked Babasaheb to delete references to the Vedas and Shastras."
  },
  {
    id: 'fc-2',
    frontTitle: 'Mahad Satyagraha (1927)',
    frontTitleLocal: {
      hi: 'महाड चवदार तालाब सत्याग्रह (1927)',
      mr: 'महाड चवदार तळे सत्याग्रह (1927)',
      ta: 'மகாத் சத்தியாகிரகம் (1927)',
      bn: 'মহাদ সত্যাগ্রহ (১৯২৭)'
    },
    year: 1927,
    category: 'Civil Rights Movement',
    promptQuestion: 'Why is March 20, 1927 celebrated across India as National Social Empowerment Day (Samajik Sadbhavna)?',
    promptQuestionLocal: {
      hi: '20 मार्च 1927 को भारत में सामाजिक सशक्तिकरण दिवस के रूप में क्यों मनाया जाता है?',
      mr: '२० मार्च हा दिवस भारतात सामाजिक सक्षमीकरण दिन म्हणून का साजरा केला जातो?',
      ta: 'மார்ச் 20 ஏன் இந்தியாவின் சமூக அதிகாரமளித்தல் நாளாகக் கொண்டாடப்படுகிறது?',
      bn: '২০ মার্চ দিনটি কেন ভারতে সামাজিক ক্ষমতায়ন দিবস হিসেবে উদযাপিত হয়?'
    },
    archivalAnswer: 'Dr. Ambedkar led thousands of untouchables to drink water from the public Chavadar Lake in Mahad. He declared: "Our fight is not for water; it is to establish our natural human rights and prove that we too are human beings."',
    archivalAnswerLocal: {
      hi: 'डॉ. आंबेडकर ने हजारों वंचितों के साथ महाड के चवदार तालाब से पानी पीकर नागरिक अधिकार बहाल किए। उन्होंने कहा: "हमारा संघर्ष पानी के लिए नहीं, बल्कि यह सिद्ध करने के लिए है कि हम भी इंसान हैं।"',
      mr: 'महाडच्या चवदार तळ्यावर पिण्याच्या पाण्याचा मानवी हक्क प्रस्थापित करण्यासाठी हा लढा होता. "आम्ही केवळ हे सिद्ध करायला आलो आहोत की आम्हीही माणसे आहोत."',
      ta: "'நமது போராட்டம் தண்ணீருக்காக அல்ல, நாமும் மனிதர்கள் என்பதை நிரூபிக்கும் உரிமைப் போராட்டம்' என்று முழங்கி நீர் அருந்தினார்.",
      bn: "'আমাদের সংগ্রাম কেবল জলের জন্য নয়, মানুষের অধিকার প্রমাণের লড়াই'—এই আহ্বানে মহাদ সত্যাগ্রহ অনুষ্ঠিত হয়।"
    },
    keyQuote: "Goats are used for sacrificial offerings and not lions. Do not be like goats.",
    bawsCitation: "BAWS Vol. 17 (Part 1), Mahad Satyagraha Documents, pp. 1–45",
    relatedDocId: "annihilation-of-caste",
    keywords: ["Chavadar Lake", "Human Rights", "Kolaba District"],
    archivalClue: "The Kolaba municipality had passed the Bole Resolution in 1923, yet local reactionaries denied Dalits access until this historic march."
  },
  {
    id: 'fc-3',
    frontTitle: 'Article 32: Heart and Soul (1948)',
    frontTitleLocal: {
      hi: 'अनुच्छेद 32: संविधान की आत्मा (1948)',
      mr: 'कलम ३२: संविधानाचा आत्मा (1948)',
      ta: 'பிரிவு 32: அரசியலமைப்பின் ஆன்மா (1948)',
      bn: 'অনুচ্ছেদ ৩২: সংবিধানের আত্মা (১৯৪৮)'
    },
    year: 1948,
    category: 'Constitutional Law',
    promptQuestion: 'Why did Dr. Ambedkar insist in the Constituent Assembly that Article 32 is the most crucial article in the entire Constitution?',
    promptQuestionLocal: {
      hi: 'डॉ. आंबेडकर ने अनुच्छेद 32 को पूरे संविधान का सबसे महत्वपूर्ण अनुच्छेद क्यों बताया?',
      mr: 'कलम ३२ ला डॉ. बाबासाहेब आंबेडकरांनी राज्यघटनेचा आत्मा आणि हृदय का म्हटले?',
      ta: 'பிரிவு 32-ஐ முழு அரசியலமைப்பின் மிக முக்கியமான பிரிவாக அம்பேத்கர் ஏன் கருதினார்?',
      bn: 'ড. আম্বেদকর কেন অনুচ্ছেদ ৩২-কে সমগ্র সংবিধানের সর্বাপেক্ষা গুরুত্বপূর্ণ ধারা বলেছিলেন?'
    },
    archivalAnswer: 'Article 32 provides the Right to Constitutional Remedies. Without it, fundamental rights would be mere toothless declarations on paper. It guarantees any citizen the legal power to petition the Supreme Court directly with prerogative writs (Habeas Corpus, Mandamus, Quo Warranto, etc.) if their fundamental liberties are infringed.',
    archivalAnswerLocal: {
      hi: 'अनुच्छेद 32 संवैधानिक उपचारों का अधिकार देता है। इसके बिना मौलिक अधिकार केवल कागज का टुकड़ा रह जाते। यह हर नागरिक को सीधे सर्वोच्च न्यायालय जाकर अपने अधिकारों की रक्षा कराने की शक्ति देता है।',
      mr: 'कलम ३२ मूलभूत हक्कांच्या संरक्षणाची घटनात्मक उपाययोजना देते. हक्कांचे उल्लंघन झाल्यास थेट सर्वोच्च न्यायालयात जाण्याचा हा अधिकार आहे.',
      ta: 'அடிப்படை உரிமைகள் மீறப்பட்டால் உச்ச நீதிமன்றத்தை நேரடியாக அணுகி நீதி பெறும் அரசியலமைப்பு பரிகார உரிமையை இது வழங்குகிறது.',
      bn: 'মৌলিক অধিকার লঙ্ঘিত হলে সরাসরি সুপ্রিম কোর্টে রিট করার অধিকার দেয় এই অনুচ্ছেদ ৩২।'
    },
    keyQuote: "If I was asked to name any particular article in this Constitution as the most important... I could not refer to any other article except this one. It is the very soul of the Constitution and the very heart of it.",
    bawsCitation: "Constituent Assembly Debates, Vol. VII, 9 December 1948",
    relatedDocId: "article-32-debate-1948",
    keywords: ["Prerogative Writs", "Supreme Court", "Constitutional Remedies"],
    archivalClue: "Debated vigorously on 9 December 1948; without judicial enforceability, fundamental rights would remain dead letters."
  },
  {
    id: 'fc-4',
    frontTitle: 'Educate, Agitate, Organize (1942)',
    frontTitleLocal: {
      hi: 'शिक्षित बनो, संघर्ष करो, संगठित रहो (1942)',
      mr: 'शिका, संघटित व्हा, संघर्ष करा (1942)',
      ta: 'கற்பி, கிளர்ந்தெழு, ஒன்றுசேர் (1942)',
      bn: 'শিক্ষিত হও, সংগ্রাম করো, সংগঠিত হও (১৯৪২)'
    },
    year: 1942,
    category: 'Philosophy & Motto',
    promptQuestion: 'What is the developmental logic connecting the three imperatives: Educate, Agitate, and Organize delivered at the All-India Depressed Classes Conference in Nagpur?',
    promptQuestionLocal: {
      hi: 'शिक्षित बनो, संघर्ष करो, संगठित रहो के पीछे क्या तार्किक दर्शन है?',
      mr: 'शिका, संघटित व्हा, संघर्ष करा या त्रिसूत्रीमागील वैचारिक भूमिका काय आहे?',
      ta: 'கற்பி, கிளர்ந்தெழு, ஒன்றுசேர் என்ற மும்மை சூத்திரத்தின் தத்துவார்த்த இணைப்பு என்ன?',
      bn: 'শিক্ষিত হও, সংগ্রাম করো, সংগঠিত হও—এই তিন সূত্রের অন্তর্দৃষ্টি কী?'
    },
    archivalAnswer: 'Education awakens critical self-respect, moral agency, and illuminates fundamental rights. Agitation produces active moral vigilance and righteous indignation against tyranny. Organization consolidates isolated individuals into unified institutional power capable of defending democracy.',
    archivalAnswerLocal: {
      hi: 'शिक्षा से आत्मसम्मान और अधिकारों का बोध होता है; संघर्ष से अन्याय के विरुद्ध चेतना जागती है; और संगठन से बिखरी हुई शक्ति एक मजबूत संस्थागत शक्ति बनती है।',
      mr: 'शिक्षणाने आत्मभान येते, संघर्षाने अन्यायाविरुद्ध चीड निर्माण होते आणि संघटनेने मानवी मुक्तीचा मार्ग प्रशस्त होतो.',
      ta: 'கல்வி சுயமரியாதையை உருவாக்குகிறது; போராட்டம் அநீதியை எதிர்க்கிறது; அமைப்பு ஒற்றுமையால் வெற்றியை சாத்தியமாக்குகிறது.',
      bn: 'শিক্ষা আত্মমর্যাদাবোধ জাগায়, সংগ্রাম অন্যায়ের প্রতিরোধ গড়ে তোলে এবং সংগঠন ঐক্যবদ্ধ শক্তির ভিত্তি স্থাপন করে।'
    },
    keyQuote: "Cultivation of mind should be the ultimate aim of human existence.",
    bawsCitation: "Speech at All-India Depressed Classes Conference, Nagpur, July 1942",
    relatedDocId: "annihilation-of-caste",
    keywords: ["Nagpur 1942", "Critical Consciousness", "Solidarity"],
    archivalClue: "Delivered to over 75,000 delegates at the Mohan Park grounds in Nagpur alongside 20,000 women delegates."
  },
  {
    id: 'fc-5',
    frontTitle: 'The Problem of the Rupee (1923)',
    frontTitleLocal: {
      hi: 'द प्रॉब्लम ऑफ द रुपी (1923)',
      mr: 'द प्रॉब्लेम ऑफ द रुपी (1923)',
      ta: 'தி பிராப்ளம் ஆஃப் தி ருபீ (1923)',
      bn: 'দ্য প্রবলেম অফ দ্য রুপি (১৯২৩)'
    },
    year: 1923,
    category: 'Economics & Banking',
    promptQuestion: 'How did Dr. Ambedkar’s London School of Economics D.Sc. dissertation directly shape the foundation of the Reserve Bank of India (RBI)?',
    promptQuestionLocal: {
      hi: 'डॉ. आंबेडकर के डॉक्टरेट शोध प्रबंध ने भारतीय रिजर्व बैंक (RBI) की स्थापना में क्या भूमिका निभाई?',
      mr: 'डॉ. आंबेडकरांच्या डी.एस्सी. प्रबंधाने रिझर्व्ह बँकेच्या (RBI) पायाभरणीत कशी मदत केली?',
      ta: 'அம்பேத்கரின் பொருளாதார ஆய்வேடு இந்திய ரிசர்வ் வங்கி தோன்றுவதற்கு எவ்வாறு வழிகோலியது?',
      bn: 'ড. আম্বেদকরের গবেষণাপত্র কীভাবে ভারতীয় রিজার্ভ ব্যাংক (RBI) গঠনে প্রভাব ফেলেছিল?'
    },
    archivalAnswer: 'Ambedkar submitted comprehensive testimony before the Royal Commission on Indian Currency and Finance (Hilton Young Commission) in 1926 based on his book. The Commission adopted his recommendations for central bank independence and price stability, culminating directly in the RBI Act of 1934.',
    archivalAnswerLocal: {
      hi: '1926 में हिल्टन यंग कमीशन के समक्ष डॉ. आंबेडकर ने अपने शोध के आधार पर साक्ष्य दिए। केंद्रीय बैंक के उनके सुझावों को स्वीकार करते हुए 1935 में भारतीय रिजर्व बैंक की स्थापना की गई।',
      mr: 'हिल्टन यंग कमिशनसमोर डॉ. आंबेडकरांनी मांडलेल्या सिद्धांतांच्या आधारे १९३५ मध्ये रिझर्व्ह बँक ऑफ इंडियाची स्थापना झाली.',
      ta: 'ஹில்டன் யங் ஆணையத்திடம் அம்பேத்கர் சமர்ப்பித்த பொருளாதாரக் கொள்கைகளே 1935-ல் ரிசர்வ் வங்கி துவங்கப்படுவதற்கு வித்தாக அமைந்தது.',
      bn: 'হিলটন ইয়ং কমিশনের সামনে আম্বেদকরের সাক্ষ্যের ভিত্তিতেই ১৯৩৪ সালে আরবিআই আইন পাস হয়।'
    },
    keyQuote: "Price stability is the bedrock of social justice for the working poor; currency inflation robs the labourer of bread.",
    bawsCitation: "BAWS Vol. 6, The Problem of the Rupee: Its Origin and Its Solution",
    relatedDocId: "annihilation-of-caste",
    keywords: ["Hilton Young Commission", "LSE Doctorate", "Central Banking"],
    archivalClue: "Ambedkar debated John Maynard Keynes’s gold-exchange standard, arguing for a modified gold standard with fixed internal purchasing power."
  },
  {
    id: 'fc-6',
    frontTitle: 'The Hindu Code Bill (1951)',
    frontTitleLocal: {
      hi: 'हिंदू कोड बिल एवं महिला अधिकार (1951)',
      mr: 'हिंदू कोड बिल व महिला सक्षमीकरण (1951)',
      ta: 'இந்து குறியீட்டு சட்டம் (1951)',
      bn: 'হিন্দু কোড বিল ও নারী অধিকার (১৯৫১)'
    },
    year: 1951,
    category: 'Gender Justice',
    promptQuestion: 'Why did Dr. Ambedkar resign as India’s first Union Law Minister on September 27, 1951?',
    promptQuestionLocal: {
      hi: 'डॉ. आंबेडकर ने 27 सितंबर 1951 को देश के प्रथम कानून मंत्री पद से इस्तीफा क्यों दिया?',
      mr: 'डॉ. आंबेडकरांनी २७ सप्टेंबर १९५१ रोजी कायदेमंत्री पदाचा राजीनामा का दिला?',
      ta: 'செப்டம்பர் 27, 1951 அன்று சட்ட அமைச்சர் பதவியை அம்பேத்கர் ஏன் துறந்தார்?',
      bn: 'ড. আম্বেদকর কেন ১৯৫১ সালের ২৭ সেপ্টেম্বর আইনমন্ত্রীর পদ ত্যাগ করেছিলেন?'
    },
    archivalAnswer: 'He drafted the Hindu Code Bill to grant women equal property inheritance, abolish polygamy, and establish legal divorce. When conservative political factions stalled the bill in Parliament, Ambedkar resigned on principle, declaring that he refused to compromise on the constitutional equality and emancipation of Indian women.',
    archivalAnswerLocal: {
      hi: 'उन्होंने महिलाओं को संपत्ति में बराबरी का अधिकार, बहुविवाह पर रोक और तलाक का कानूनी हक देने वाला हिंदू कोड बिल तैयार किया। जब संसद में इसे टाल दिया गया, तो उन्होंने स्वाभिमान से इस्तीफा दे दिया।',
      mr: 'महिलांना संपत्तीत समान वाटा आणि कायदेशीर अधिकार देणारे हिंदू कोड बिल संसदेत रोखले गेल्याने त्यांनी तत्त्वासाठी राजीनामा दिला.',
      ta: 'பெண்களுக்கு சொத்துரிமை மற்றும் சம உரிமைகளை வழங்கும் சட்ட மசோதா தாமதப்படுத்தப்பட்டதால் தனது பதவியை ராஜினாமா செய்தார்.',
      bn: 'নারীর সম্পত্তিতে সমানাধিকার ও মর্যাদার হিন্দু কোড বিল বিলম্বিত হওয়ায় তিনি নীতিগত কারণে পদত্যাগ করেন।'
    },
    keyQuote: "I measure the progress of a community by the degree of progress which women have achieved.",
    bawsCitation: "BAWS Vol. 14 (Part 1 & 2), Dr. Ambedkar and the Hindu Code Bill",
    relatedDocId: "states-and-minorities-1947",
    keywords: ["Equal Inheritance", "Abolish Polygamy", "Principle Resignation"],
    archivalClue: "The reforms were later passed piecemeal through the Hindu Marriage Act (1955) and Hindu Succession Act (1956)."
  },
  {
    id: 'fc-7',
    frontTitle: 'States and Minorities (1947)',
    frontTitleLocal: {
      hi: 'स्टेट्स एंड माइनॉरिटीज (1947)',
      mr: 'स्टेट्स अँड मायनॉरिटीज (1947)',
      ta: 'ஸ்டேட்ஸ் அண்ட் மைனாரிட்டிஸ் (1947)',
      bn: 'স্টেটস অ্যান্ড মাইনরিটিস (১৯৪৭)'
    },
    year: 1947,
    category: 'Economic Democracy',
    promptQuestion: 'What revolutionary constitutional model of "Democratic State Socialism" did Dr. Ambedkar advocate in this memorandum to the Constituent Assembly?',
    promptQuestionLocal: {
      hi: 'इस ज्ञापन में डॉ. आंबेडकर ने "राज्य समाजवाद" का कौन सा क्रांतिकारी मॉडल प्रस्तावित किया था?',
      mr: 'या संविधानात्मक मसुद्यात डॉ. आंबेडकरांनी "राज्य समाजवाद" चे कोणते प्रारूप मांडले होते?',
      ta: 'இந்த அறிக்கையில் அம்பேத்கர் முன்மொழிந்த "அரசு சோசலிசம்" முறை யாது?',
      bn: 'এই স্মারকলিপিতে আম্বেদকর "রাষ্ট্রীয় সমাজতন্ত্রের" কোন মডেল প্রস্তাব করেছিলেন?'
    },
    archivalAnswer: 'He proposed that key industries, insurance, and agricultural land be nationalized and owned by the democratic State as an unalterable constitutional requirement, ensuring that private economic monopolies could never hollow out political parliamentary democracy.',
    archivalAnswerLocal: {
      hi: 'उन्होंने प्रमुख उद्योगों, बीमा और कृषि भूमि के राष्ट्रीयकरण को संविधान के मौलिक अधिकारों का हिस्सा बनाने का प्रस्ताव रखा ताकि पूंजीवादी एकाधिकार लोकतंत्र को नष्ट न कर सके।',
      mr: 'प्रमुख उद्योग आणि शेतजमीन यांचे राष्ट्रीयीकरण करून ते संविधानात्मक तरतुदीत समाविष्ट करण्याचा त्यांचा आग्रह होता.',
      ta: 'முக்கிய தொழில்களும் நிலமும் அரசின் பொறுப்பில் இருக்க வேண்டும் என்று அரசியலமைப்பு ரீதியாக முன்மொழிந்தார்.',
      bn: 'তিনি প্রস্তাব করেন যে প্রধান শিল্প ও কৃষিজমি রাষ্ট্রীয় মালিকানায় থাকবে যাতে ব্যক্তিগত একচেটিয়া আধিপত্য গড়ে না ওঠে।'
    },
    keyQuote: "The purpose is to establish State Socialism in important fields of economic life by the law of the Constitution, without abrogating parliamentary democracy.",
    bawsCitation: "BAWS Vol. 1, States and Minorities: What are their Rights and How to Secure Them",
    relatedDocId: "states-and-minorities-1947",
    keywords: ["State Socialism", "Nationalized Land", "Economic Rights"],
    archivalClue: "Submitted on behalf of the All India Scheduled Castes Federation to the Fundamental Rights Sub-Committee in April 1947."
  },
  {
    id: 'fc-8',
    frontTitle: 'The Poona Pact (1932)',
    frontTitleLocal: {
      hi: 'पूना पैक्ट समझौता (1932)',
      mr: 'पुणे करार (1932)',
      ta: 'பூனா ஒப்பந்தம் (1932)',
      bn: 'পুনা চুক্তি (১৯৩২)'
    },
    year: 1932,
    category: 'Electoral History',
    promptQuestion: 'What historic compromises were struck between Dr. Ambedkar and Mahatma Gandhi during the fast-unto-death at Yerwada Central Prison?',
    promptQuestionLocal: {
      hi: 'यरवदा जेल में डॉ. आंबेडकर और महात्मा गांधी के बीच किन शर्तों पर सहमति बनी थी?',
      mr: 'येरवडा कारागृहात डॉ. आंबेडकर आणि महात्मा गांधी यांच्यात कोणत्या अटींवर समझोता झाला?',
      ta: 'எரவாடா சிறையில் அம்பேத்கருக்கும் காந்திக்கும் இடையே என்ன உடன்பாடு எட்டப்பட்டது?',
      bn: 'ইয়ারওয়াদা জেলে আম্বেদকর ও মহাত্মা গান্ধীর মধ্যে কী শর্তে চুক্তি স্বাক্ষরিত হয়?'
    },
    archivalAnswer: 'To save Gandhi’s life during his fast-unto-death, Ambedkar agreed to relinquish the separate electorates granted under the British Communal Award. In exchange, he secured reserved seats in joint electorates, more than doubling reserved seats from 71 to 148 in provincial legislatures and 18% in the Central Assembly.',
    archivalAnswerLocal: {
      hi: 'गांधीजी के अनशन के दौरान उनके जीवन की रक्षा हेतु आंबेडकर ने पृथक निर्वाचक मंडल त्यागकर संयुक्त निर्वाचन में आरक्षित सीटों की संख्या 71 से बढ़ाकर 148 करवाई।',
      mr: 'स्वतंत्र मतदारसंघांऐवजी संयुक्त मतदारसंघात राखीव जागांची संख्या ७१ वरून १४८ करण्यात आली.',
      ta: 'தனித் தொகுதிகளை விடுத்து கூட்டுத் தொகுதியில் இடஒதுக்கீட்டு இடங்களை 71-லிருந்து 148 ஆக இரட்டிப்பாக்கினார்.',
      bn: 'পৃথক নির্বাচন ব্যবস্থার বদলে যৌথ নির্বাচনে সংরক্ষিত আসনের সংখ্যা ৭১ থেকে বাড়িয়ে ১৪৮ করা হয়।'
    },
    keyQuote: "There was no other choice before me than to sign the pact to save a life, even though I had to sacrifice the political safeguard of separate electorates.",
    bawsCitation: "BAWS Vol. 9, What Congress and Gandhi Have Done to the Untouchables",
    relatedDocId: "annihilation-of-caste",
    keywords: ["Yerwada Prison", "148 Reserved Seats", "Communal Award"],
    archivalClue: "Signed on 24 September 1932 by Dr. Ambedkar, Madan Mohan Malaviya, and other prominent leaders under a mango tree."
  },
  {
    id: 'fc-9',
    frontTitle: 'Kalaram Temple Satyagraha (1930)',
    frontTitleLocal: {
      hi: 'कालाराम मंदिर सत्याग्रह (1930)',
      mr: 'काळाराम मंदिर सत्याग्रह (1930)',
      ta: 'காளாராம் கோவில் போராட்டம் (1930)',
      bn: 'কালারাম মন্দির সত্যাগ্রহ (১৯৩০)'
    },
    year: 1930,
    category: 'Social Protest',
    promptQuestion: 'What crucial tactical lesson did Dr. Ambedkar articulate after five arduous years of the Nashik temple entry satyagraha?',
    promptQuestionLocal: {
      hi: 'नासिक के पांच वर्षीय सत्याग्रह से डॉ. आंबेडकर ने क्या महत्वपूर्ण रणनीतिक निष्कर्ष निकाला?',
      mr: 'नाशिकच्या काळाराम मंदिर लढ्यानंतर आंबेडकरांनी कोणता मोलाचा धोरणात्मक निर्णय घेतला?',
      ta: 'ஐந்தாண்டு கால நாசிக் கோவில் போராட்டத்திற்குப் பின் அம்பேத்கர் உணர்ந்த உண்மை என்ன?',
      bn: 'নাসিকের কালারাম মন্দির আন্দোলনের পর আম্বেদকর কোন সিদ্ধান্তে উপনীত হন?'
    },
    archivalAnswer: 'When orthodox temple authorities shuttered the gates for five continuous years rather than allow Dalits entry, Ambedkar concluded that spending precious collective energy fighting for temple admission was futile. He declared that marginalized people needed modern scientific education, economic self-reliance, and sovereign political power rather than idol worship.',
    archivalAnswerLocal: {
      hi: 'पांच वर्ष के संघर्ष के बाद उन्होंने निष्कर्ष निकाला कि मंदिर प्रवेश में ऊर्जा नष्ट करने के बजाय आधुनिक शिक्षा, राजनीतिक सत्ता और आर्थिक आत्मनिर्भरता हासिल करना कहीं अधिक आवश्यक है।',
      mr: 'मंदिरात प्रवेश मिळवण्यासाठी शक्ती वाया घालवण्यापेक्षा आधुनिक शिक्षण, राजकारण आणि संपत्ती निर्मितीवर लक्ष केंद्रित केले पाहिजे.',
      ta: 'கோவில் நுழைவுப் போராட்டங்களை விட நவீன கல்வி, அரசியல் அதிகாரம் மற்றும் பொருளாதார விடுதலையே முதன்மையானது என்று உணர்ந்தார்.',
      bn: 'তিনি বুঝতে পারেন যে মন্দিরে প্রবেশের চেয়ে আধুনিক শিক্ষা ও সাংবিধানিক ক্ষমতাই মুক্তির প্রকৃত পথ।'
    },
    keyQuote: "Self-elevation and intellectual freedom is our primary duty, not seeking entry into places that despise our very shadow.",
    bawsCitation: "BAWS Vol. 17 (Part 1), Movement for Temple Entry",
    relatedDocId: "annihilation-of-caste",
    keywords: ["Nashik 1930", "Tactical Shift", "Secular Empowerment"],
    archivalClue: "Launched on 2 March 1930 with 15,000 volunteers; Bhaurao Gaikwad served as key lieutenant on the ground."
  },
  {
    id: 'fc-10',
    frontTitle: 'Deekshabhoomi Mass Conversion (1956)',
    frontTitleLocal: {
      hi: 'दीक्षाभूमि धम्म प्रवर्तन (1956)',
      mr: 'दीक्षाभूमी धम्मक्रांती (1956)',
      ta: 'தீக்ஷாபூமி மதமாற்றம் (1956)',
      bn: 'দীক্ষাভূমি ধম্মক্রান্তি (১৯৫৬)'
    },
    year: 1956,
    category: 'Spiritual Emancipation',
    promptQuestion: 'Why did Dr. Ambedkar choose Buddhism at Nagpur on October 14, 1956 alongside half a million followers, administering the historic 22 Vows?',
    promptQuestionLocal: {
      hi: 'डॉ. आंबेडकर ने 14 अक्टूबर 1956 को नागपुर में 5 लाख अनुयायियों के साथ बौद्ध धम्म क्यों अपनाया?',
      mr: 'डॉ. आंबेडकरांनी १४ ऑक्टोबर १९५६ रोजी नागपूर येथे ५ लाख अनुयायांसह बौद्ध धम्माची दीक्षा का घेतली?',
      ta: 'அம்பேத்கர் 1956-ல் 5 லட்சம் மக்களுடன் பௌத்த மதத்தைத் தழுவியது ஏன்?',
      bn: 'ড. আম্বেদকর কেন ১৯৫৬ সালে নাগপুরে পাঁচ লক্ষ অনুসারী নিয়ে বৌদ্ধ ধর্ম গ্রহণ করেছিলেন?'
    },
    archivalAnswer: 'Fulfilling his 1935 Yeola vow ("I was born a Hindu, but I will not die a Hindu"), he embraced Buddhism because it is founded entirely on Pragya (reason), Karuna (compassion), and Samata (equality)—rejecting divine infallibility and social hierarchy to establish a casteless moral universe for human dignity.',
    archivalAnswerLocal: {
      hi: 'अपनी 1935 की प्रतिज्ञा पूरी करते हुए उन्होंने बौद्ध धर्म अपनाया क्योंकि यह प्रज्ञा (विवेक), करुणा और समता पर आधारित है, जो बिना किसी जातिभेद के मानवीय गरिमा प्रदान करता है।',
      mr: '१९३५ ची प्रतिज्ञा पूर्ण करत प्रज्ञा, करुणा आणि समता या त्रिसूत्रीवर आधारलेला धम्म स्वीकारून कोट्यवधी जनतेला स्वाभिमानाचा नवा जन्म दिला.',
      ta: 'பகுத்தறிவு, கருணை மற்றும் சமத்துவத்தை போதிக்கும் பௌத்தத்தைத் தழுவி சாதியற்ற புதிய வாழ்க்கையை மக்களுக்கு வழங்கினார்.',
      bn: 'প্রজ্ঞা, করুণা ও সমতার ভিত্তিতে প্রতিষ্ঠিত বৌদ্ধ ধর্ম গ্রহণ করে মানুষকে জাতপাতহীন মর্যাদাপূর্ণ পথ দেখান।'
    },
    keyQuote: "Religion must mainly be a matter of principles only. It cannot be a matter of rules. When it degenerates into rules, it ceases to be religion.",
    bawsCitation: "The Buddha and His Dhamma (1957), BAWS Vol. 11",
    relatedDocId: "annihilation-of-caste",
    keywords: ["22 Vows", "Pragya Karuna Samata", "Nagpur 1956"],
    archivalClue: "The ceremony took place on Ashoka Vijaya Dashami, honoring Emperor Ashoka’s conversion to Buddhism after the Kalinga war."
  }
];

export const ArchivalFlashcards: React.FC<ArchivalFlashcardsProps> = ({
  language,
  onOpenDocument,
  onAskAI
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [reviewIds, setReviewIds] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [streak, setStreak] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [studyMode, setStudyMode] = useState<'explore' | 'challenge'>('explore');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev' | null>(null);
  const [mouseTilt, setMouseTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [glarePos, setGlarePos] = useState<{ x: number; y: number; opacity: number }>({ x: 50, y: 50, opacity: 0 });
  const [challengeResult, setChallengeResult] = useState<null | { selected: number; isCorrect: boolean }>(null);
  const [xpToast, setXpToast] = useState<{ text: string; id: number } | null>(null);

  const cardContainerRef = useRef<HTMLDivElement>(null);

  // Filtered Cards
  const filteredCards = selectedCategory === 'all'
    ? FLASHCARDS
    : FLASHCARDS.filter(c => c.category === selectedCategory);

  const safeIndex = currentIndex % (filteredCards.length || 1);
  const currentCard: FlashcardItem = filteredCards[safeIndex] || FLASHCARDS[0];

  // Dynamic 3D Mouse Parallax and Holographic Glare Sheen
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardContainerRef.current) return;
    const rect = cardContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    setMouseTilt({
      x: -(((y - centerY) / rect.height) * 12),
      y: (((x - centerX) / rect.width) * 12)
    });

    setGlarePos({
      x: Math.round((x / rect.width) * 100),
      y: Math.round((y / rect.height) * 100),
      opacity: 1
    });
  };

  const handleMouseLeave = () => {
    setMouseTilt({ x: 0, y: 0 });
    setGlarePos(prev => ({ ...prev, opacity: 0 }));
  };

  // Flip Toggle
  const handleFlip = useCallback(() => {
    soundEffects.playBookOpen();
    speechController.stop();
    setIsPlayingAudio(false);
    setIsFlipped(prev => !prev);
  }, []);

  // Card Navigation with physical slide transitions
  const handleNext = useCallback(() => {
    soundEffects.playClick();
    speechController.stop();
    setIsPlayingAudio(false);
    setSlideDirection('next');
    setIsFlipped(false);
    setShowHint(false);
    setChallengeResult(null);

    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % filteredCards.length);
      setSlideDirection(null);
    }, 220);
  }, [filteredCards.length]);

  const handlePrev = useCallback(() => {
    soundEffects.playClick();
    speechController.stop();
    setIsPlayingAudio(false);
    setSlideDirection('prev');
    setIsFlipped(false);
    setShowHint(false);
    setChallengeResult(null);

    setTimeout(() => {
      setCurrentIndex(prev => (prev - 1 + filteredCards.length) % filteredCards.length);
      setSlideDirection(null);
    }, 220);
  }, [filteredCards.length]);

  // Jump to specific card index
  const handleJumpToCard = (targetIdx: number) => {
    if (targetIdx === safeIndex) return;
    soundEffects.playShuffle();
    speechController.stop();
    setIsPlayingAudio(false);
    setIsFlipped(false);
    setShowHint(false);
    setChallengeResult(null);
    setSlideDirection(targetIdx > safeIndex ? 'next' : 'prev');
    setTimeout(() => {
      setCurrentIndex(targetIdx);
      setSlideDirection(null);
    }, 200);
  };

  // Shuffle Deck
  const handleShuffle = () => {
    soundEffects.playShuffle();
    setIsFlipped(false);
    setShowHint(false);
    setChallengeResult(null);
    const randomIndex = Math.floor(Math.random() * filteredCards.length);
    setCurrentIndex(randomIndex);
  };

  // Trigger floating XP toast animation
  const showXpAward = (pts: number, label: string) => {
    setTotalXp(prev => prev + pts);
    setXpToast({ text: `+${pts} XP ${label}`, id: Date.now() });
    setTimeout(() => setXpToast(null), 1400);
  };

  // 3-Tier Spaced Repetition Mastery Controls
  const handleRateCard = (level: 'hard' | 'good' | 'mastered', e?: React.MouseEvent) => {
    e?.stopPropagation();
    const id = currentCard.id;

    if (level === 'hard') {
      soundEffects.playWrong();
      setStreak(0);
      if (!reviewIds.includes(id)) {
        setReviewIds(prev => [...prev, id]);
        setMasteredIds(prev => prev.filter(i => i !== id));
      }
      showXpAward(5, "Practice Needed");
      handleNext();
    } else if (level === 'good') {
      soundEffects.playClick();
      setStreak(prev => prev + 1);
      showXpAward(20, "Recalled!");
      handleNext();
    } else {
      // Mastered
      soundEffects.playSuccess();
      soundEffects.playCoinDrop();
      const newStreak = streak + 1;
      setStreak(newStreak);

      if (newStreak >= 3) {
        setTimeout(() => soundEffects.playCombo(), 250);
      }

      if (!masteredIds.includes(id)) {
        const updated = [...masteredIds, id];
        setMasteredIds(updated);
        setReviewIds(prev => prev.filter(i => i !== id));

        if (updated.length === FLASHCARDS.length) {
          confetti({
            particleCount: 160,
            spread: 90,
            origin: { y: 0.6 }
          });
        }
      }
      showXpAward(50, "Mastered!");
      handleNext();
    }
  };

  const handleReset = () => {
    soundEffects.playClick();
    speechController.stop();
    setIsPlayingAudio(false);
    setMasteredIds([]);
    setReviewIds([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setStreak(0);
    setChallengeResult(null);
  };

  // Keyboard navigation & hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === '1') {
        handleRateCard('hard');
      } else if (e.key === '2') {
        handleRateCard('good');
      } else if (e.key === '3') {
        handleRateCard('mastered');
      } else if (e.key === 'h' || e.key === 'H') {
        setShowHint(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, handleRateCard]);

  // Audio Speech Synthesis
  const cardTitle = (language !== 'en' && currentCard.frontTitleLocal?.[language]) || currentCard.frontTitle;
  const cardPrompt = (language !== 'en' && currentCard.promptQuestionLocal?.[language]) || currentCard.promptQuestion;
  const cardAnswer = (language !== 'en' && currentCard.archivalAnswerLocal?.[language]) || currentCard.archivalAnswer;

  const handleAudioNarration = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playClick();
    if (isPlayingAudio) {
      speechController.stop();
      setIsPlayingAudio(false);
    } else {
      const textToRead = isFlipped ? cardAnswer : cardPrompt;
      setIsPlayingAudio(true);
      speechController.speak(textToRead, language, () => {
        setIsPlayingAudio(false);
      });
    }
  };

  // Rapid Recall Challenge Options
  const getChallengeYears = () => {
    const correctYear = currentCard.year;
    const allYears = Array.from(new Set(FLASHCARDS.map(c => c.year))).filter(y => y !== correctYear);
    const shuffledWrong = allYears.sort(() => 0.5 - Math.random()).slice(0, 2);
    return [correctYear, ...shuffledWrong].sort(() => 0.5 - Math.random());
  };

  const [challengeOptions, setChallengeOptions] = useState<number[]>(getChallengeYears);

  useEffect(() => {
    setChallengeOptions(getChallengeYears());
    setChallengeResult(null);
  }, [currentCard.id]);

  const handleAnswerChallenge = (yearSelected: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const isCorrect = yearSelected === currentCard.year;
    setChallengeResult({ selected: yearSelected, isCorrect });

    if (isCorrect) {
      soundEffects.playSuccess();
      soundEffects.playCoinDrop();
      setStreak(prev => prev + 1);
      showXpAward(30, "Rapid Recall!");
      setTimeout(() => {
        setIsFlipped(true);
        soundEffects.playBookOpen();
      }, 700);
    } else {
      soundEffects.playWrong();
      setStreak(0);
    }
  };

  const categories = [
    { id: 'all', label: `All Specimen Folios (${FLASHCARDS.length})` },
    { id: 'Foundational Treatise', label: 'Treatises' },
    { id: 'Civil Rights Movement', label: 'Civil Rights' },
    { id: 'Constitutional Law', label: 'Constitution' },
    { id: 'Economics & Banking', label: 'Economics' },
    { id: 'Gender Justice', label: 'Gender Rights' },
    { id: 'Spiritual Emancipation', label: 'Spiritual' },
  ];

  const progressPercent = Math.round((masteredIds.length / FLASHCARDS.length) * 100);

  return (
    <div className="bg-[#FAF7F0] border-2 border-[#D3D4C0] rounded-3xl p-4 sm:p-8 lg:p-10 shadow-2xl space-y-6 relative overflow-hidden font-dmsans">
      
      {/* Background Archival Paper Watermark Texture */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] select-none"
        style={{
          backgroundImage: `radial-gradient(#0A2947 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Floating XP Award Toast */}
      {xpToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-xp-float">
          <div className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-500 text-[#0A2947] font-mono font-black text-sm shadow-2xl border-2 border-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0A2947]" />
            <span>{xpToast.text}</span>
          </div>
        </div>
      )}

      {/* TOP BANNER / STATS HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-[#E2D9C8] pb-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#0A2947] text-[#C89D56] font-mono text-xs rounded-full uppercase tracking-wider mb-2 font-bold shadow-sm">
            <Layers className="w-3.5 h-3.5 text-[#C89D56]" />
            <span>Spaced Repetition Archival Forge · Interactive 3D Card Deck</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif-editorial font-bold text-[#0A2947] tracking-tight flex flex-wrap items-center gap-3">
            <span>Archival Specimen Flashcards</span>
            <span className="text-xs px-3 py-1 bg-[#C89D56] text-[#0A2947] font-mono font-bold rounded-lg uppercase tracking-wide shadow-xs">
              Folio #{safeIndex + 1} of {filteredCards.length}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8B5E3C] mt-1 font-dmsans max-w-2xl leading-relaxed">
            Examine authentic historical specimen folios with interactive 3D spatial flip, dynamic holographic foil glare, tactile sound effects, and rapid recall challenges.
          </p>
        </div>

        {/* Arcade Control Bar: Streak, Mastery Progress, Mode Toggle, XP */}
        <div className="flex flex-wrap items-center gap-3">
          {/* XP Badge */}
          {totalXp > 0 && (
            <div className="flex items-center gap-1.5 bg-[#FAF3E0] border-2 border-[#C89D56] text-[#0A2947] px-3.5 py-2 rounded-2xl font-mono text-xs font-black shadow-xs">
              <Star className="w-3.5 h-3.5 fill-[#C89D56] text-[#C89D56]" />
              <span>{totalXp} XP</span>
            </div>
          )}

          {/* Streak Counter */}
          {streak > 1 && (
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-rose-600 text-white px-3.5 py-2 rounded-2xl font-mono text-xs font-black shadow-md animate-pulse">
              <Flame className="w-4 h-4 fill-current text-white" />
              <span>{streak}x Streak! (+50 XP)</span>
            </div>
          )}

          {/* Mastery Bar */}
          <div className="bg-white p-3 rounded-2xl border-2 border-[#C89D56] shadow-sm flex items-center gap-3">
            <div>
              <div className="text-xs font-mono font-bold text-[#0A2947]">
                {masteredIds.length}/{FLASHCARDS.length} Mastered ({progressPercent}%)
              </div>
              <div className="w-28 bg-[#E2D9C8] h-2 rounded-full overflow-hidden mt-1 border border-[#0A2947]/10">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            {masteredIds.includes(currentCard.id) && (
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold uppercase">
                Mastered
              </span>
            )}
          </div>

          {/* Shuffle Button */}
          <button
            onClick={handleShuffle}
            title="Shuffle Flashcard Deck"
            className="p-3 rounded-2xl bg-white border border-[#D3D4C0] hover:bg-[#F3E4C9] text-[#0A2947] transition-all cursor-pointer shadow-sm hover:border-[#0A2947] active:scale-95"
          >
            <Shuffle className="w-4 h-4 text-[#C89D56]" />
          </button>

          {/* Reset Deck */}
          <button
            onClick={handleReset}
            title="Reset Flashcard Deck"
            className="p-3 rounded-2xl bg-white border border-[#D3D4C0] hover:bg-[#F3E4C9] text-[#8B5E3C] transition-all cursor-pointer shadow-sm hover:border-[#0A2947] active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MODE SWITCHER & CATEGORY FILTER PILLS */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/70 p-2.5 rounded-2xl border border-[#D3D4C0]">
        
        {/* Mode Selector */}
        <div className="inline-flex p-1 bg-[#EAE0D0] rounded-xl shrink-0">
          <button
            onClick={() => {
              soundEffects.playClick();
              setStudyMode('explore');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-montserrat font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              studyMode === 'explore'
                ? 'bg-[#0A2947] text-[#F3E4C9] shadow-sm'
                : 'text-[#8B5E3C] hover:text-[#0A2947]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>3D Curatorial Study</span>
          </button>
          
          <button
            onClick={() => {
              soundEffects.playClick();
              setStudyMode('challenge');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-montserrat font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              studyMode === 'challenge'
                ? 'bg-[#C89D56] text-[#0A2947] shadow-sm font-black'
                : 'text-[#8B5E3C] hover:text-[#0A2947]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-900" />
            <span>Rapid Recall Arcade</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                soundEffects.playClick();
                setSelectedCategory(cat.id);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer border ${
                selectedCategory === cat.id
                  ? 'bg-[#0A2947] text-[#FAF7F0] border-[#0A2947] shadow-sm'
                  : 'bg-white hover:bg-[#FAF7F0] text-[#8B5E3C] border-[#D3D4C0]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 10-CARD VISUAL FOLIO QUICK-JUMP SCRUBBER DOCK */}
      <div className="relative z-10 flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin scrollbar-thumb-[#C89D56]/40">
        <span className="text-[11px] font-mono font-bold text-[#8B5E3C] uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <Bookmark className="w-3 h-3 text-[#C89D56]" />
          <span>Folios:</span>
        </span>
        {filteredCards.map((card, idx) => {
          const isCurrent = idx === safeIndex;
          const isMastered = masteredIds.includes(card.id);
          const isReview = reviewIds.includes(card.id);

          return (
            <button
              key={card.id}
              onClick={() => handleJumpToCard(idx)}
              title={`${card.frontTitle} (${card.year})`}
              className={`group relative shrink-0 px-3 py-1.5 rounded-xl border-2 font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isCurrent
                  ? 'bg-[#0A2947] text-[#F3E4C9] border-[#C89D56] shadow-md scale-105 ring-2 ring-[#C89D56]/30'
                  : isMastered
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                    : isReview
                      ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                      : 'bg-white text-[#8B5E3C] border-[#D3D4C0] hover:bg-[#FAF7F0] hover:border-[#0A2947]'
              }`}
            >
              <span>{idx + 1}</span>
              <span className="text-[10px] opacity-75">{card.year}</span>
              {isMastered && (
                <Check className="w-3 h-3 text-emerald-600 font-black stroke-[3]" />
              )}
              {isReview && !isMastered && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          MAIN 3D CARD INTERACTION ARENA (ENLARGED CARD GEOMETRY)
          ========================================================================= */}
      <div 
        ref={cardContainerRef}
        className="perspective-1200 w-full max-w-3xl xl:max-w-4xl mx-auto my-3 py-2"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Physical Card Deck Stack (Realistic layered depth) */}
        <div className="card-deck-stack relative">
          
          {/* Deck Layer 2 (Bottom shadow card) */}
          <div className="absolute inset-0 bg-[#E8DFC9] border-2 border-[#C89D56]/40 rounded-3xl card-stack-layer-2 pointer-events-none transition-transform" />
          
          {/* Deck Layer 1 (Middle shadow card) */}
          <div className="absolute inset-0 bg-[#F4EBD9] border-2 border-[#C89D56]/70 rounded-3xl card-stack-layer-1 pointer-events-none transition-transform" />

          {/* TOP ACTIVE 3D FLIPPING SPECIMEN CARD */}
          <div 
            className={`relative w-full min-h-[520px] sm:min-h-[560px] md:min-h-[580px] transform-style-3d cursor-pointer select-none transition-transform duration-700 ease-out ${
              slideDirection === 'next' ? 'animate-card-slide-next' : ''
            } ${slideDirection === 'prev' ? 'animate-card-slide-prev' : ''}`}
            style={{
              transform: `${isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'} rotateX(${mouseTilt.x}deg) rotateY(${mouseTilt.y}deg)`,
            }}
            onClick={handleFlip}
          >
            
            {/* =================================================================
                FRONT FACE (Visible at 0deg)
                ================================================================= */}
            <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-[#FCFBF8] via-[#FAF7F0] to-[#F2E8D5] border-4 border-[#C89D56] rounded-3xl p-6 sm:p-10 md:p-12 flex flex-col justify-between shadow-[0_20px_50px_rgba(10,41,71,0.22)] overflow-hidden hover:border-[#0A2947] transition-colors">
              
              {/* Dynamic Interactive Holographic Foil Sheen Glare */}
              <div 
                className="pointer-events-none absolute inset-0 z-20 rounded-3xl transition-opacity duration-200"
                style={{
                  opacity: glarePos.opacity,
                  background: `radial-gradient(circle 380px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.45) 0%, rgba(200, 157, 86, 0.22) 35%, transparent 70%)`,
                  mixBlendMode: 'overlay'
                }}
              />

              {/* Ornate Gold Filigree Corner Accents */}
              <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-[#C89D56] pointer-events-none" />
              <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-[#C89D56] pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-[#C89D56] pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-[#C89D56] pointer-events-none" />

              {/* Embossed Watermark Stamp */}
              <div className="absolute bottom-8 right-8 text-8xl md:text-9xl font-serif-editorial font-bold text-[#0A2947]/5 pointer-events-none select-none">
                {currentCard.year}
              </div>

              {/* TOP SPECIMEN IDENTIFIER BAR */}
              <div className="relative z-10">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-[#E2D9C8] pb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3.5 py-1 bg-[#0A2947] text-[#C89D56] text-xs font-mono uppercase tracking-wider rounded-lg font-bold shadow-xs">
                      {currentCard.category}
                    </span>
                    <span className="px-3 py-1 bg-white border border-[#D3D4C0] text-[#8B5E3C] text-xs font-mono font-bold rounded-lg shadow-2xs">
                      Year: A.D. {currentCard.year}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* TTS Voice Narration Button */}
                    <button
                      onClick={handleAudioNarration}
                      className="p-2.5 rounded-xl bg-white border border-[#D3D4C0] hover:bg-[#F3E4C9] text-[#0A2947] transition-all cursor-pointer shadow-xs active:scale-95"
                      title="Audio Narration (Read Card Aloud)"
                    >
                      <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'text-rose-600 animate-pulse' : 'text-[#C89D56]'}`} />
                    </button>
                    
                    <span className="text-xs font-mono text-[#8B5E3C] font-semibold bg-white/80 px-2.5 py-1 rounded-lg border border-[#D3D4C0]">
                      Folio #{safeIndex + 1}/{filteredCards.length}
                    </span>
                  </div>
                </div>

                {/* Primary Card Title */}
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif-editorial font-bold text-[#0A2947] tracking-tight mb-4">
                  {cardTitle}
                </h3>

                {/* Thematic Keyword Pills */}
                <div className="flex flex-wrap items-center gap-1.5 mb-4">
                  {currentCard.keywords.map(kw => (
                    <span 
                      key={kw}
                      className="px-2.5 py-1 rounded-md bg-[#FAF3E0] border border-[#E2D9C8] text-[#8B5E3C] font-mono text-[11px] font-semibold"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>

                {/* ARCHIVAL INQUIRY DILEMMA CONTAINER */}
                <div className="bg-white/95 p-5 sm:p-7 rounded-2xl border-2 border-[#E2D9C8] shadow-inner my-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#C89D56]" />
                    <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#8B5E3C]">
                      Archival Inquiry & Historical Dilemma:
                    </span>
                  </div>
                  <p className="text-lg sm:text-xl md:text-2xl text-[#0A2947] font-serif-editorial leading-relaxed font-semibold">
                    &quot;{cardPrompt}&quot;
                  </p>
                </div>

                {/* RAPID RECALL ARCADE MODE BUTTONS */}
                {studyMode === 'challenge' && (
                  <div className="my-4 p-4 bg-[#FAF7F0] border-2 border-[#C89D56] rounded-2xl shadow-sm space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-[#8B5E3C]">
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                        <span>RAPID RECALL: Guess the milestone year:</span>
                      </span>
                      {challengeResult && (
                        <span className={challengeResult.isCorrect ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                          {challengeResult.isCorrect ? '✓ CORRECT! Auto-flipping...' : '✗ Incorrect year!'}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2.5">
                      {challengeOptions.map(yr => {
                        let btnStyle = "bg-white border-[#D3D4C0] text-[#0A2947] hover:bg-[#F3E4C9] hover:border-[#C89D56]";
                        if (challengeResult) {
                          if (yr === currentCard.year) {
                            btnStyle = "bg-emerald-600 text-white border-emerald-700 font-black animate-pulse";
                          } else if (yr === challengeResult.selected && !challengeResult.isCorrect) {
                            btnStyle = "bg-rose-500 text-white border-rose-600 line-through";
                          }
                        }

                        return (
                          <button
                            key={yr}
                            onClick={(e) => handleAnswerChallenge(yr, e)}
                            disabled={challengeResult !== null}
                            className={`py-2.5 px-3 rounded-xl border-2 font-mono text-sm sm:text-base font-bold transition-all cursor-pointer shadow-xs ${btnStyle}`}
                          >
                            {yr}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Peek Archival Hint Drawer */}
                {showHint && (
                  <div className="my-3 p-4 bg-amber-50/90 border-2 border-amber-300 rounded-2xl text-xs sm:text-sm font-dmsans text-amber-950 animate-in fade-in shadow-sm leading-relaxed">
                    <div className="font-bold flex items-center gap-1.5 text-amber-900 mb-1">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      <span>Curatorial Archival Clue:</span>
                    </div>
                    <p>{currentCard.archivalClue}</p>
                    <div className="text-[11px] font-mono text-amber-800 mt-2">
                      Citation: {currentCard.bawsCitation}
                    </div>
                  </div>
                )}
              </div>

              {/* BOTTOM CARD FOOTER ACTIONS */}
              <div className="pt-4 border-t border-[#E2D9C8] flex items-center justify-between text-xs relative z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    soundEffects.playClick();
                    setShowHint(!showHint);
                  }}
                  className="font-mono text-[#8B5E3C] hover:text-[#0A2947] font-bold cursor-pointer flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-[#D3D4C0] hover:bg-[#F3E4C9] shadow-2xs transition-all active:scale-95"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-[#C89D56]" />
                  <span>{showHint ? 'Hide Clue' : 'Peek Archival Clue [H]'}</span>
                </button>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C89D56] text-[#0A2947] font-montserrat font-bold text-xs uppercase tracking-wider shadow-sm group-hover:brightness-110 transition-all">
                  <span>Click to Flip Card [Space]</span>
                  <RotateCw className="w-3.5 h-3.5" />
                </div>
              </div>

            </div>

            {/* =================================================================
                BACK FACE (Visible at 180deg, facing user)
                ================================================================= */}
            <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-[#06182a] via-[#0A2947] to-[#031120] text-[#FAF7F0] border-4 border-[#C89D56] rounded-3xl p-6 sm:p-10 md:p-12 flex flex-col justify-between shadow-[0_20px_50px_rgba(10,41,71,0.3)] overflow-hidden">
              
              {/* Dynamic Glare Sheen for Back (Screen Mode) */}
              <div 
                className="pointer-events-none absolute inset-0 z-20 rounded-3xl transition-opacity duration-200"
                style={{
                  opacity: glarePos.opacity,
                  background: `radial-gradient(circle 380px at ${glarePos.x}% ${glarePos.y}%, rgba(200, 157, 86, 0.35) 0%, rgba(255, 255, 255, 0.12) 30%, transparent 70%)`,
                  mixBlendMode: 'screen'
                }}
              />

              {/* Gold Filigree Corner Accents */}
              <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-[#C89D56] pointer-events-none" />
              <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-[#C89D56] pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-[#C89D56] pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-[#C89D56] pointer-events-none" />

              {/* TOP RESOLUTION HEADER */}
              <div className="relative z-10">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-white/15 pb-3.5">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#C89D56] font-bold flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/10">
                    <CheckCircle2 className="w-4 h-4 text-[#C89D56]" />
                    <span>Verified Archival Resolution</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAudioNarration}
                      className="p-2 rounded-xl bg-white/10 border border-white/20 text-[#FAF7F0] hover:bg-white/20 transition-all cursor-pointer active:scale-95"
                      title="Audio Narration (Read Resolution)"
                    >
                      <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'text-rose-400 animate-pulse' : 'text-[#C89D56]'}`} />
                    </button>
                    
                    <span className="text-xs font-mono text-[#F3E4C9] font-bold bg-white/10 px-2.5 py-1 rounded-lg">
                      {currentCard.category}
                    </span>
                  </div>
                </div>

                {/* Primary Archival Answer Text */}
                <p className="text-sm sm:text-base md:text-lg font-dmsans text-[#FAF7F0]/95 leading-relaxed mb-4">
                  {cardAnswer}
                </p>

                {/* Golden Verbatim Quotation Box */}
                <blockquote className="bg-white/5 border-l-4 border-[#C89D56] p-4 sm:p-5 rounded-r-2xl shadow-inner text-sm sm:text-base md:text-lg italic font-serif-editorial text-[#F3E4C9] leading-relaxed my-2">
                  <div className="flex items-start gap-2">
                    <MessageSquareQuote className="w-5 h-5 text-[#C89D56] shrink-0 mt-0.5" />
                    <span>&quot;{currentCard.keyQuote}&quot;</span>
                  </div>
                </blockquote>
              </div>

              {/* TACTILE 3-TIER RECALL RATING ACTION DOCK */}
              <div className="relative z-10 my-2 pt-3 border-t border-white/10">
                <div className="text-[11px] font-mono text-[#C89D56] font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Rate Your Recall (Spaced Repetition):</span>
                  <span className="text-white/40">Hotkeys: [1] [2] [3]</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={(e) => handleRateCard('hard', e)}
                    className="py-2.5 px-3 rounded-xl bg-rose-950/70 border border-rose-500/50 hover:bg-rose-900 text-rose-200 font-montserrat font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <span>🔴 Hard</span>
                  </button>
                  <button
                    onClick={(e) => handleRateCard('good', e)}
                    className="py-2.5 px-3 rounded-xl bg-amber-950/70 border border-amber-500/50 hover:bg-amber-900 text-amber-200 font-montserrat font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <span>🟡 Good</span>
                  </button>
                  <button
                    onClick={(e) => handleRateCard('mastered', e)}
                    className="py-2.5 px-3 rounded-xl bg-emerald-950/70 border border-emerald-500/60 hover:bg-emerald-900 text-emerald-200 font-montserrat font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-center gap-1.5 font-black"
                  >
                    <span>🟢 Mastered (+50)</span>
                  </button>
                </div>
              </div>

              {/* BOTTOM ARCHIVAL CITATION & ACTIONS */}
              <div className="relative z-10 pt-3 border-t border-white/15">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#FAF7F0]/80">
                  <span className="font-mono text-[11px] line-clamp-1 text-[#C89D56]">
                    📚 {currentCard.bawsCitation}
                  </span>

                  <div className="flex items-center gap-3">
                    {onAskAI && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAskAI(`Explain the archival background and constitutional significance of ${currentCard.frontTitle}`);
                        }}
                        className="font-montserrat font-bold text-[#C89D56] hover:underline cursor-pointer shrink-0 uppercase tracking-wider text-[11px] flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Ask AI</span>
                      </button>
                    )}

                    {onOpenDocument && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDocument(currentCard.relatedDocId);
                        }}
                        className="font-montserrat font-bold text-[#F3E4C9] hover:underline cursor-pointer shrink-0 uppercase tracking-wider text-[11px] flex items-center gap-1"
                      >
                        <span>Examine Folio</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-xs text-white/50 font-mono">
                  <span>Click card or press [Space] to flip back</span>
                  <RotateCw className="w-3.5 h-3.5 text-[#C89D56]" />
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* TACTILE DECK NAVIGATION & MASTERY CONTROLS (EXPANDED TO MAX-W-4XL) */}
      <div className="w-full max-w-3xl xl:max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        {/* Previous Card */}
        <button
          onClick={handlePrev}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border-2 border-[#D3D4C0] bg-white text-[#0A2947] font-montserrat font-bold text-xs uppercase tracking-wider hover:bg-[#F3E4C9] transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-[#C89D56]" />
          <span>Previous Folio [←]</span>
        </button>

        {/* Mastered / Review Action Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={(e) => handleRateCard('hard', e)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-3.5 rounded-2xl border-2 border-amber-400 bg-amber-50 text-amber-950 font-montserrat font-bold text-xs uppercase tracking-wider hover:bg-amber-100 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Needs Review</span>
          </button>

          <button
            onClick={(e) => handleRateCard('mastered', e)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-montserrat font-black text-xs uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer shadow-lg active:scale-95 border border-emerald-400/40"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>Mastered (+50 XP)</span>
          </button>
        </div>

        {/* Next Card */}
        <button
          onClick={handleNext}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border-2 border-[#D3D4C0] bg-white text-[#0A2947] font-montserrat font-bold text-xs uppercase tracking-wider hover:bg-[#F3E4C9] transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <span>Next Folio [→]</span>
          <ArrowRight className="w-4 h-4 text-[#C89D56]" />
        </button>
      </div>

      {/* KEYBOARD SHORTCUTS REFERENCE BAR */}
      <div className="flex items-center justify-center gap-2 pt-2 text-[11px] font-mono text-[#8B5E3C]/80">
        <Keyboard className="w-3.5 h-3.5 text-[#C89D56]" />
        <span>Hotkeys: <strong>[Space]</strong> Flip · <strong>[← / →]</strong> Deal Cards · <strong>[1-3]</strong> Rate Recall · <strong>[H]</strong> Clue</span>
      </div>

    </div>
  );
};

export default ArchivalFlashcards;
