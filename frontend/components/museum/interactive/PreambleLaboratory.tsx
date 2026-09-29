'use client';

import React, { useState } from 'react';
import { 
  Scale, Shield, Heart, Users, Landmark, Volume2, VolumeX,
  Sparkles, CheckCircle2, BookOpen, MessageSquare, ArrowRight,
  Sliders, Award, HelpCircle, Check, XCircle, Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects } from '@/utils/soundEffects';
import { speechController } from '@/utils/speechUtils';
import { Language } from '@/types/museum';
import '../games/ArcadeGames.css';

interface PreambleLaboratoryProps {
  language: Language;
  onOpenDocument?: (docId: string) => void;
  onAskAI?: (query: string) => void;
}

interface PillarDetail {
  id: string;
  name: string;
  nameLocal?: Partial<Record<Language, string>>;
  tagline: string;
  taglineLocal?: Partial<Record<Language, string>>;
  icon: any;
  color: string;
  bgGradient: string;
  borderClass: string;
  ambedkarQuote: string;
  ambedkarQuoteLocal?: Partial<Record<Language, string>>;
  cadCitation: string;
  plainLanguageSummary: string;
  plainLanguageSummaryLocal?: Partial<Record<Language, string>>;
  classroomPrompt: string;
  classroomPromptLocal?: Partial<Record<Language, string>>;
  interactiveQuiz: {
    question: string;
    options: Array<{
      id: string;
      text: string;
      isCorrect: boolean;
      feedback: string;
    }>;
  };
  keyArticles: Array<{
    article: string;
    label: string;
    description: string;
  }>;
  relatedDocId: string;
}

const PREAMBLE_PILLARS: PillarDetail[] = [
  {
    id: 'justice',
    name: 'JUSTICE',
    nameLocal: {
      hi: 'न्याय (सामाजिक, आर्थिक एवं राजनीतिक)',
      mr: 'न्याय (सामाजिक, आर्थिक व राजकीय)',
      ta: 'நீதி (சமூக, பொருளாதார மற்றும் அரசியல்)',
      bn: 'ন্যায়বিচার (সামাজিক, অর্থনৈতিক ও রাজনৈতিক)'
    },
    tagline: 'Social, Economic and Political Justice',
    taglineLocal: {
      hi: 'सामाजिक, आर्थिक और राजनीतिक न्याय की स्थापना',
      mr: 'सामाजिक, आर्थिक आणि राजकीय न्यायाची हमी',
      ta: 'சமூக, பொருளாதார மற்றும் அரசியல் நீதி உத்தரவாதம்',
      bn: 'সামাজিক, অর্থনৈতিক ও রাজনৈতিক ন্যায়বিচার প্রতিষ্ঠা'
    },
    icon: Scale,
    color: '#0A2947',
    bgGradient: 'from-[#0A2947]/5 via-[#C89D56]/10 to-transparent',
    borderClass: 'border-[#0A2947]/30 hover:border-[#0A2947]',
    ambedkarQuote: "We must make our political democracy a social democracy as well. Political democracy cannot last unless there lies at the base of it social democracy. What does social democracy mean? It means a way of life which recognizes liberty, equality and fraternity as the principles of life.",
    ambedkarQuoteLocal: {
      hi: "हमें अपने राजनीतिक लोकतंत्र को सामाजिक लोकतंत्र भी बनाना होगा। राजनीतिक लोकतंत्र तब तक टिक नहीं सकता जब तक कि उसके आधार में सामाजिक लोकतंत्र न हो। सामाजिक लोकतंत्र का अर्थ एक ऐसी जीवन शैली से है जो स्वतंत्रता, समता और बंधुत्व को जीवन के सिद्धांतों के रूप में स्वीकार करती है।",
      mr: "आपल्याला आपल्या राजकीय लोकशाहीचे सामाजिक लोकशाहीत रूपांतर केले पाहिजे. सामाजिक लोकशाहीचा पाया असल्याशिवाय राजकीय लोकशाही टिकू शकत नाही.",
      ta: "நாம் நமது அரசியல் ஜனநாயகத்தை சமூக ஜனநாயகமாகவும் மாற்ற வேண்டும். சமூக ஜனநாயகம் அடிப்படையாக அமையாவிட்டால் அரசியல் ஜனநாயகம் நிலைக்க முடியாது.",
      bn: "আমাদের রাজনৈতিক গণতন্ত্রকে সামাজিক গণতন্ত্রেও রূপান্তরিত করতে হবে। সামাজিক গণতন্ত্রের ভিত্তি ছাড়া রাজনৈতিক গণতন্ত্র দীর্ঘস্থায়ী হতে পারে না।"
    },
    cadCitation: "Constituent Assembly of India, Final Address, 25 November 1949",
    plainLanguageSummary: "Justice means that no human being is judged or mistreated because of their birth, caste, gender, religion, or wealth. In a classroom or nation, justice ensures the weakest person has the exact same protection under the law as the strongest person.",
    plainLanguageSummaryLocal: {
      hi: "न्याय का अर्थ है कि किसी भी व्यक्ति के साथ उसके जन्म, जाति, लिंग या धन के आधार पर भेदभाव न हो। कानून की नजर में सबसे कमजोर व्यक्ति को भी सबसे शक्तिशाली व्यक्ति के समान ही अधिकार व सुरक्षा प्राप्त है।",
      mr: "न्याय म्हणजे कोणत्याही व्यक्तीसोबत तिच्या जाती, धर्मा किंवा संपत्तीवरून भेदभाव न होणे. दुर्बल घटकालाही कायद्याचे समान संरक्षण मिळणे म्हणजे न्याय.",
      ta: "நீதி என்பது ஒருவரது பிறப்பு, சாதி, பாலினம் அல்லது சொத்தின் அடிப்படையில் பாகুபாடு காட்டப்படாமல் அனைவருக்கும் சமமான சட்டப் பாதுகாப்பு கிடைப்பதாகும்.",
      bn: "ন্যায়বিচার মানে কারও জন্ম, জাত বা ধর্মের ভিত্তিতে বৈষম্য না করা এবং সমাজের দুর্বলতম মানুষকেও আইনের সমান সুরক্ষা প্রদান করা।"
    },
    classroomPrompt: "If a school club only allowed members who could afford expensive uniforms, which dimension of constitutional justice is broken: Social, Economic, or Political?",
    classroomPromptLocal: {
      hi: "यदि किसी विद्यालय क्लब में केवल वे ही छात्र प्रवेश पा सकते हैं जो महंगी वर्दी खरीद सकें, तो संवैधानिक न्याय के किस रूप का उल्लंघन होगा: सामाजिक, आर्थिक या राजनीतिक?",
      mr: "शाळेतील एखाद्या गटात केवळ महागडा गणवेश खरेदी करू शकणाऱ्यांनाच प्रवेश दिला, तर न्यायाच्या कोणत्या पैलूचा भंग होतो?",
      ta: "பள்ளியின் ஒரு குழுவில் விலையுயர்ந்த சீருடை வாங்க முடிந்தவர்களுக்கு மட்டுமே அனுமதி என்றால் எந்த நீதி மீறப்படுகிறது?",
      bn: "স্কুলের কোনো ক্লাবে যদি কেবল ধনী ছাত্রদেরই সুযোগ দেওয়া হয়, তবে সাংবিধানিক ন্যায়বিচারের কোন দিকটি ক্ষুণ্ণ হয়?"
    },
    interactiveQuiz: {
      question: "If a school club only permits students who can purchase expensive private uniforms, which constitutional justice principle is compromised?",
      options: [
        {
          id: 'q1-a',
          text: 'Economic & Social Justice: Access to education must not be gated by wealth or social privilege.',
          isCorrect: true,
          feedback: 'Correct! Dr. Ambedkar insisted economic inequality must not block access to common social and educational forums.'
        },
        {
          id: 'q1-b',
          text: 'None: Private school clubs are completely exempt from equality considerations.',
          isCorrect: false,
          feedback: 'Incorrect: Educational institutions must uphold foundational equality and non-discrimination.'
        },
        {
          id: 'q1-c',
          text: 'Only Political Justice, because students do not vote yet.',
          isCorrect: false,
          feedback: 'Incorrect: This directly impacts economic and social inclusion under Articles 14 and 15.'
        }
      ]
    },
    keyArticles: [
      { article: "Article 14", label: "Equality Before Law", description: "State shall not deny to any person equality before the law." },
      { article: "Article 15", label: "Prohibition of Discrimination", description: "No discrimination on grounds of religion, race, caste, sex or place of birth." },
      { article: "Article 38", label: "State to Promote Welfare", description: "State shall secure a social order for the promotion of welfare of the people." }
    ],
    relatedDocId: "constituent-assembly-speech-1949"
  },
  {
    id: 'liberty',
    name: 'LIBERTY',
    nameLocal: {
      hi: 'स्वतंत्रता (विचार, अभिव्यक्ति, विश्वास, धर्म एवं उपासना)',
      mr: 'स्वातंत्र्य (विचार, अभिव्यक्ती, विश्वास, श्रद्धा व उपासना)',
      ta: 'சுதந்திரம் (சிந்தனை, கருத்து வெளிப்பாடு, நம்பிக்கை மற்றும் வழிபாடு)',
      bn: 'স্বাধীনতা (চিন্তা, অভিব্যক্তি, বিশ্বাস ও উপাসনা)'
    },
    tagline: 'Liberty of Thought, Expression, Belief, Faith and Worship',
    taglineLocal: {
      hi: 'विचार, अभिव्यक्ति, विश्वास, धर्म एवं उपासना की स्वतंत्रता',
      mr: 'विचार, उच्चार, विश्वास, श्रद्धा व उपासना यांचे स्वातंत्र्य',
      ta: 'சிந்தனை, கருத்து, நம்பிக்கை மற்றும் வழிபாட்டு சுதந்திரம்',
      bn: 'চিন্তা, প্রকাশ, বিশ্বাস ও উপাসনার স্বাধীনতা'
    },
    icon: Shield,
    color: '#C89D56',
    bgGradient: 'from-[#C89D56]/15 via-[#C89D56]/5 to-transparent',
    borderClass: 'border-[#C89D56]/40 hover:border-[#C89D56]',
    ambedkarQuote: "Cultivation of mind should be the ultimate aim of human existence. Liberty of conscience is the foundation of intellectual progress and democratic citizenship.",
    ambedkarQuoteLocal: {
      hi: "मानव अस्तित्व का अंतिम लक्ष्य बुद्धि और विवेक का विकास होना चाहिए। अंतरात्मा की स्वतंत्रता ही बौद्धिक प्रगति और लोकतांत्रिक नागरिकता की नींव है।",
      mr: "मानवी अस्तित्वाचे अंतिम ध्येय बुद्धीचा विकास हेच असले पाहिजे. विवेकाचे स्वातंत्र्य हीच बौद्धिक प्रगतीची पायाभरणी आहे.",
      ta: "மனித வாழ்வின் இறுதி இலக்கு மனதை பண்படுத்துவதாகவும் அறிவை வளர்ப்பதாகவும் இருக்க வேண்டும்.",
      bn: "মনুষ্য জীবনের চূড়ান্ত লক্ষ্য হওয়া উচিত বুদ্ধির বিকাশ ও বিবেকবান চেতনার চর্চা।"
    },
    cadCitation: "Speech at All-India Depressed Classes Conference, 1942",
    plainLanguageSummary: "Liberty is the freedom to think for yourself, explore knowledge, express your honest thoughts without fear, and practice what you believe peacefully without harming others.",
    plainLanguageSummaryLocal: {
      hi: "स्वतंत्रता का अर्थ है बिना किसी भय के स्वतंत्र रूप से सोचने, ज्ञान अर्जित करने, अपने विचार व्यक्त करने और अपने विश्वास का पालन करने का अधिकार।",
      mr: "स्वातंत्र्य म्हणजे निर्भयपणे विचार करणे, ज्ञान मिळवणे आणि दुसऱ्याला इजा न पोहोचवता आपले मत मांडण्याचा मूलभूत हक्क.",
      ta: "சுதந்திரம் என்பது பயமின்றி சுயமாக சிந்திக்கும், அறிவைத் தேடும் மற்றும் கருத்துக்களை வெளிப்படுத்தும் உரிமையாகும்.",
      bn: "স্বাধীনতা হলো ভয়হীনভাবে চিন্তা করার, জ্ঞান অনুসন্ধান করার এবং অন্যের ক্ষতি না করে নিজের মত প্রকাশের অধিকার।"
    },
    classroomPrompt: "Does freedom of expression include the right to bully or spread falsehoods about classmates? Where does one person's liberty meet another person's dignity?",
    classroomPromptLocal: {
      hi: "क्या अभिव्यक्ति की स्वतंत्रता में सहपाठियों को परेशान करना या झूठी अफवाहें फैलाना शामिल है? एक व्यक्ति की स्वतंत्रता दूसरे की गरिमा से कहाँ टकराती है?",
      mr: "अभिव्यक्ती स्वातंत्र्यात इतरांना त्रास देण्याचा हक्क समाविष्ट आहे का? स्वातंत्र्याची सीमा कोठे ठरते?",
      ta: "கருத்து சுதந்திரம் என்பது பிறரை புண்படுத்தும் உரிமையையும் உள்ளடக்கியதா?",
      bn: "বাকস্বাধীনতার অর্থ কি সহপাঠীদের কটূক্তি করা? একজনের স্বাধীনতা কোথায় অন্যের মর্যাদার সাথে সামঞ্জস্যপূর্ণ হয়?"
    },
    interactiveQuiz: {
      question: "Where does personal constitutional liberty end when interacting with others in school or public?",
      options: [
        {
          id: 'q2-a',
          text: 'Where it infringes on another person’s fundamental dignity and safety.',
          isCorrect: true,
          feedback: 'Exactly! Dr. Ambedkar emphasized that liberty without moral self-restraint and fraternity degenerates into bullying.'
        },
        {
          id: 'q2-b',
          text: 'Liberty has zero limits; any student can say or do anything without consequence.',
          isCorrect: false,
          feedback: 'Incorrect: Article 19(2) explicitly provides for reasonable restrictions regarding public order and defamation.'
        },
        {
          id: 'q2-c',
          text: 'Liberty only applies when adult teachers give explicit written approval.',
          isCorrect: false,
          feedback: 'Incorrect: Freedom of conscience and thought is an inherent natural human right protected by Article 21.'
        }
      ]
    },
    keyArticles: [
      { article: "Article 19", label: "Six Fundamental Freedoms", description: "Freedom of speech, assembly, association, movement, residence, and profession." },
      { article: "Article 21", label: "Protection of Life & Liberty", description: "No person shall be deprived of his life or personal liberty except by procedure of law." },
      { article: "Article 25", label: "Freedom of Conscience", description: "Freedom of conscience and free profession, practice and propagation of religion." }
    ],
    relatedDocId: "annihilation-of-caste"
  },
  {
    id: 'equality',
    name: 'EQUALITY',
    nameLocal: {
      hi: 'समता (प्रतिष्ठा एवं अवसर की समता)',
      mr: 'समता (दर्जा व संधीची समानता)',
      ta: 'சமத்துவம் (தகுதி மற்றும் வாய்ப்பில் சமத்துவம்)',
      bn: 'সমতা (মর্যাদা ও সুযোগের সমতা)'
    },
    tagline: 'Equality of Status and of Opportunity',
    taglineLocal: {
      hi: 'प्रतिष्ठा और अवसर की समानता',
      mr: 'दर्जा आणि संधीची समानता प्रस्थापित करणे',
      ta: 'அனைவருக்கும் சம அந்தஸ்தும் சம வாய்ப்பும்',
      bn: 'সকল নাগরিকের জন্য মর্যাদা ও সুযোগের সমতা'
    },
    icon: Users,
    color: '#8B5E3C',
    bgGradient: 'from-[#8B5E3C]/15 via-[#8B5E3C]/5 to-transparent',
    borderClass: 'border-[#8B5E3C]/40 hover:border-[#8B5E3C]',
    ambedkarQuote: "On the 26th of January 1950, we are going to enter into a life of contradictions. In politics we will have equality and in social and economic life we will have inequality. We must remove this contradiction at the earliest possible moment or else those who suffer from inequality will blow up the structure of political democracy.",
    ambedkarQuoteLocal: {
      hi: "26 जनवरी 1950 को हम विरोधाभासों के जीवन में प्रवेश करने जा रहे हैं। राजनीति में हमारे पास समानता होगी, परंतु सामाजिक और आर्थिक जीवन में असमानता होगी। हमें इस अंतर्विरोध को जल्द से जल्द दूर करना होगा, अन्यथा जो लोग असमानता के शिकार हैं वे इस राजनीतिक लोकतंत्र के ढांचे को उड़ा देंगे।",
      mr: "२६ जानेवारी १९५० रोजी आपण एका विरोधाभासांच्या आयुष्यात प्रवेश करणार आहोत. राजकारणात आपल्याकडे समानता असेल, पण सामाजिक आणि आर्थिक जीवनात विषमता असेल. ही विषमता आपण वेळीच नष्ट केली पाहिजे.",
      ta: "26 ஜனவரி 1950 அன்று நாம் முரண்பாடுகள் நிறைந்த வாழ்க்கையில் நுழையப் போகிறோம். அரசியலில் சமத்துவம் இருக்கும், ஆனால் சமூக வாழ்வில் சமத்துவமின்மை இருக்கும்.",
      bn: "২৬ জানুয়ারি ১৯৫০ তারিখে আমরা এক বৈপরীত্যপূর্ণ জীবনে প্রবেশ করছি। রাজনীতিতে আমাদের সমতা থাকবে কিন্তু সামাজিক ও অর্থনৈতিক জীবনে থাকবে গভীর অসমতা।"
    },
    cadCitation: "Constituent Assembly Debates, 25 November 1949",
    plainLanguageSummary: "Equality does not mean everyone is born identical; it means everyone deserves an equal shot at flourishing. Dr. Ambedkar ensured the Constitution outlawed untouchability (Article 17) and created affirmative action so historically excluded communities could catch up.",
    plainLanguageSummaryLocal: {
      hi: "समानता का अर्थ यह नहीं कि सब लोग एक जैसे हैं, बल्कि यह है कि सभी को विकास का समान अवसर मिलना चाहिए। डॉ. आंबेडकर ने अस्पृश्यता को कानूनन अपराध बनाया (अनुच्छेद 17) ताकि सदियों से वंचित वर्ग बराबरी पर आ सकें।",
      mr: "समता म्हणजे प्रत्येकाला प्रगतीची समान संधी मिळणे. डॉ. आंबेडकरांनी घटनेतून अस्पृश्यता नष्ट केली (कलम १७) आणि दुर्बल घटकांना विकासाच्या प्रवाहात आणले.",
      ta: "சமத்துவம் என்பது அனைவருக்கும் சம வாய்ப்பு வழங்குவதாகும். அம்பேத்கர் தீண்டாமையை ஒழித்து (பிரிவு 17) ஒடுக்கப்பட்டோருக்கு சமத்துவத்தை உறுதி செய்தார்.",
      bn: "সমতার অর্থ হলো প্রত্যেকের উন্নতির সমান সুযোগ পাওয়া। ড. আম্বেদকর সংবিধানে অস্পৃশ্যতা বিলোপ (অনুচ্ছেদ ১৭) করে বঞ্চিত মানুষের অধিকার সুনিশ্চিত করেন।"
    },
    classroomPrompt: "What is the difference between treating every student identically versus giving extra tutoring to a student who missed school due to illness? How does this reflect Constitutional affirmative action?",
    classroomPromptLocal: {
      hi: "हर छात्र के साथ बिल्कुल एक जैसा व्यवहार करने और बीमारी के कारण पीछे छूटे छात्र को अतिरिक्त कक्षाएं देने में क्या अंतर है? यह संवैधानिक आरक्षण और सकारात्मक कदम को कैसे दर्शाता है?",
      mr: "सर्वांना सारखेच वागवणे आणि मागे पडलेल्या विद्यार्थ्याला अतिरिक्त मार्गदर्शन करणे यात काय फरक आहे?",
      ta: "அனைவரையும் ஒரே மாதிரியாக நடத்துவதற்கும், பின்தங்கிய ஒருவருக்கு கூடுதல் உதவி செய்வதற்கும் என்ன வேறுபாடு?",
      bn: "সকলকে একইভাবে দেখা এবং পিছিয়ে পড়া কাউকে অতিরিক্ত সহায়তা দেওয়ার মধ্যে পার্থক্য কী? এটি কীভাবে ইতিবাচক পদক্ষেপের প্রতীক?"
    },
    interactiveQuiz: {
      question: "Why did Dr. Ambedkar design affirmative action (Articles 15 & 16) into the Constitution?",
      options: [
        {
          id: 'q3-a',
          text: 'To provide substantive equality so that historically oppressed groups can attain an equal starting line.',
          isCorrect: true,
          feedback: 'Precisely! Formal equality is inadequate when centuries of caste exclusion kept communities at the bottom.'
        },
        {
          id: 'q3-b',
          text: 'To replace meritocracy with hereditary government favors.',
          isCorrect: false,
          feedback: 'Incorrect: Dr. Ambedkar sought to create genuine meritocracy by giving everyone equal opportunity to learn.'
        },
        {
          id: 'q3-c',
          text: 'Solely as a temporary political concession to feudal landlords.',
          isCorrect: false,
          feedback: 'Incorrect: Affirmative action was an ethical mandate to democratize public administration.'
        }
      ]
    },
    keyArticles: [
      { article: "Article 16", label: "Equality in Public Employment", description: "Equality of opportunity for all citizens in matters relating to employment." },
      { article: "Article 17", label: "Abolition of Untouchability", description: "Untouchability is abolished and its practice in any form is forbidden." },
      { article: "Article 18", label: "Abolition of Hereditary Titles", description: "No title, not being a military or academic distinction, shall be conferred by the State." }
    ],
    relatedDocId: "article-32-debate-1948"
  },
  {
    id: 'fraternity',
    name: 'FRATERNITY',
    nameLocal: {
      hi: 'बंधुता (व्यक्ति की गरिमा एवं राष्ट्र की एकता)',
      mr: 'बंधुभाव (व्यक्तीची प्रतिष्ठा व राष्ट्राची एकता)',
      ta: 'சகோதரத்துவம் (தனிமனித கண்ணியம் மற்றும் தேச ஒற்றுமை)',
      bn: 'সৌভ্রাতৃত্ব (ব্যক্তির মর্যাদা ও জাতীয় সংহতি)'
    },
    tagline: 'Assuring the Dignity of the Individual & Unity of the Nation',
    taglineLocal: {
      hi: 'व्यक्ति की गरिमा और राष्ट्र की एकता सुनिश्चित करने वाली बंधुता',
      mr: 'व्यक्तीची प्रतिष्ठा व राष्ट्राची एकता आणि एकात्मता राखणारा बंधुभाव',
      ta: 'தனிமனித மாண்பையும் தேசத்தின் ஒற்றுமையையும் உறுதிப்படுத்தும் சகோதரத்துவம்',
      bn: 'ব্যক্তির মর্যাদা ও জাতীয় ঐক্য রক্ষাকারী সৌভ্রাতৃত্ব'
    },
    icon: Heart,
    color: '#041424',
    bgGradient: 'from-[#041424]/10 via-[#C89D56]/10 to-transparent',
    borderClass: 'border-[#041424]/30 hover:border-[#041424]',
    ambedkarQuote: "Fraternity means a sense of common brotherhood of all Indians—of Indians being one people. It is the principle which gives unity and solidarity to social life. Without fraternity, liberty and equality could not become a natural course of things.",
    ambedkarQuoteLocal: {
      hi: "बंधुता का अर्थ है सभी भारतीयों के बीच एक साझा भ्रातृभाव—इस भावना का होना कि हम सब एक ही लोग हैं। यही वह सिद्धांत है जो सामाजिक जीवन को एकता और एकजुटता प्रदान करता है। बंधुत्व के बिना स्वतंत्रता और समानता का कोई वास्तविक आधार नहीं हो सकता।",
      mr: "बंधुभाव म्हणजे सर्व भारतीयांमध्ये असलेली एकात्मतेची भावना. हाच तो सिद्धांत आहे जो सामाजिक जीवनाला ऐक्य प्रदान करतो.",
      ta: "சகோதரத்துவம் என்பது அனைத்து இந்தியர்களிடையேயான ஒருமித்த உணர்வு. இதுவே சமூக வாழ்விற்கு ஒற்றுமையையும் வலிமையையும் தருகிறது.",
      bn: "সৌভ্রাতৃত্ব মানে সকল ভারতবাসীর মধ্যে পারস্পরিক ভ্রাতৃত্ববোধ। এই নীতিই সামাজিক জীবনে ঐক্য ও সংহতি এনে দেয়।"
    },
    cadCitation: "Speech on Third Reading of the Draft Constitution, 25 Nov 1949",
    plainLanguageSummary: "Fraternity is empathy and solidarity. A nation is not just land and borders; it is human beings caring for each other. Dr. Ambedkar taught that without brotherhood and kindness, liberty turns into selfishness and equality turns into jealousy.",
    plainLanguageSummaryLocal: {
      hi: "बंधुता का अर्थ है सहानुभूति और परस्पर आदर। एक देश केवल सीमाओं से नहीं बनता, बल्कि नागरिकों के एक-दूसरे के प्रति प्रेम और सम्मान से बनता है।",
      mr: "बंधुभाव म्हणजे एकमेकांप्रति आदर आणि आपलेपणा. बंधुभावाशिवाय स्वातंत्र्य आणि समता या मूल्यांना खरा अर्थ प्राप्त होत नाही.",
      ta: "சகோதரத்துவம் என்பது மற்றவர் மீது கொள்ளும் அக்கறை. சகோதரத்துவம் இல்லாமல் சுதந்திரமும் சமத்துவமும் நிலைக்காது.",
      bn: "সৌভ্রাতৃত্ব হলো পারস্পরিক শ্রদ্ধা ও সহমর্মিতা। দেশের মানুষ একে অপরের পাশে না দাঁড়ালে কোনো রাষ্ট্র সমৃদ্ধ হতে পারে না।"
    },
    classroomPrompt: "When a new student arrives from another state speaking a different language, how can students demonstrate constitutional fraternity?",
    classroomPromptLocal: {
      hi: "जब कोई नया छात्र किसी दूसरे राज्य से आता है और अलग भाषा बोलता है, तो छात्र संवैधानिक बंधुता का उदाहरण कैसे प्रस्तुत कर सकते हैं?",
      mr: "दुसऱ्या प्रांतातून आलेल्या आणि वेगळी भाषा बोलणाऱ्या नवीन विद्यार्थ्याचे स्वागत करताना विद्यार्थी बंधुभाव कसा दाखवू शकतात?",
      ta: "வேற்று மாநிலத்தில் இருந்து வரும் புதிய மாணவரிடம் சக மாணவர்கள் எவ்வாறு சகோதரத்துவத்தை வெளிப்படுத்தலாம்?",
      bn: "অন্য রাজ্য থেকে আসা ভিন্ন ভাষার নতুন সহপাঠীর সাথে শিক্ষার্থীরা কীভাবে সৌভ্রাতृत्वের পরিচয় দিতে পারে?"
    },
    interactiveQuiz: {
      question: "According to Dr. Ambedkar, what happens to a democracy that possesses liberty and equality but lacks fraternity?",
      options: [
        {
          id: 'q4-a',
          text: 'Liberty turns into the supremacy of the few, and equality turns into bitter resentment without social solidarity.',
          isCorrect: true,
          feedback: 'Masterful! Babasaheb taught that fraternity is the emotional cement that holds democracy together.'
        },
        {
          id: 'q4-b',
          text: 'The country automatically prospers without any need for social brotherhood.',
          isCorrect: false,
          feedback: 'Incorrect: Dr. Ambedkar explicitly warned that democracy cannot survive on law alone without shared social fellowship.'
        },
        {
          id: 'q4-c',
          text: 'Caste barriers disappear automatically through economic growth.',
          isCorrect: false,
          feedback: 'Incorrect: Dr. Ambedkar proved that caste requires deliberate moral and constitutional annihilation.'
        }
      ]
    },
    keyArticles: [
      { article: "Article 51A(e)", label: "Duty to Promote Harmony", description: "To promote harmony and the spirit of common brotherhood among all people of India." },
      { article: "Article 1", label: "Union of States", description: "India, that is Bharat, shall be a Union of States." },
      { article: "Article 21A", label: "Right to Free Education", description: "Universal education guarantees foundational social solidarity." }
    ],
    relatedDocId: "states-and-minorities-1947"
  }
];

export const PreambleLaboratory: React.FC<PreambleLaboratoryProps> = ({
  language,
  onOpenDocument,
  onAskAI
}) => {
  const [selectedPillarId, setSelectedPillarId] = useState<string>('justice');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Republic Trinity Balance Simulator State
  const [libertyScore, setLibertyScore] = useState<number>(4);
  const [equalityScore, setEqualityScore] = useState<number>(4);
  const [fraternityScore, setFraternityScore] = useState<number>(4);

  // Interactive Quiz State
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);

  const activePillar = PREAMBLE_PILLARS.find(p => p.id === selectedPillarId) || PREAMBLE_PILLARS[0];

  const handleSelectPillar = (id: string) => {
    soundEffects.playClick();
    speechController.stop();
    setIsPlayingAudio(false);
    setSelectedPillarId(id);
    setSelectedQuizOption(null);
    setQuizAnswered(false);
  };

  const handleAudioNarration = () => {
    soundEffects.playClick();
    if (isPlayingAudio) {
      speechController.stop();
      setIsPlayingAudio(false);
    } else {
      const quoteToRead = (language !== 'en' && activePillar.ambedkarQuoteLocal?.[language]) 
        ? activePillar.ambedkarQuoteLocal[language]! 
        : activePillar.ambedkarQuote;
      setIsPlayingAudio(true);
      speechController.speak(quoteToRead, language, () => {
        setIsPlayingAudio(false);
      });
    }
  };

  const handleQuizChoice = (optionId: string) => {
    if (quizAnswered) return;
    setSelectedQuizOption(optionId);
    setQuizAnswered(true);

    const chosen = activePillar.interactiveQuiz.options.find(o => o.id === optionId);
    if (chosen?.isCorrect) {
      soundEffects.playSuccess();
      soundEffects.playCoinDrop();
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      });
    } else {
      soundEffects.playWrong();
    }
  };

  // Trinity Equilibrium Calculations
  const diffLibertyEquality = libertyScore - equalityScore;
  const balanceAngle = Math.max(-25, Math.min(25, diffLibertyEquality * 7));

  const getEquilibriumDiagnosis = () => {
    if (libertyScore >= 4 && equalityScore >= 4 && fraternityScore >= 4) {
      return {
        title: "✨ Grand Constitutional Equilibrium Achieved!",
        desc: "Liberty, Equality, and Fraternity form an unbreakable trinity. Individual creative energy flourishes while every citizen is shielded from social hierarchy and poverty.",
        bg: "bg-emerald-50 border-emerald-400 text-emerald-950",
        quote: "They form a union of trinity in this sense that to divorce one from the other is to defeat the very purpose of democracy."
      };
    } else if (libertyScore > equalityScore + 1) {
      return {
        title: "⚠️ Warning: Tyranny of the Privileged Few",
        desc: "High liberty without equality allows private capital and social power to monopolize democracy, crushing the working class.",
        bg: "bg-amber-50 border-amber-400 text-amber-950",
        quote: "Without equality, liberty would produce the supremacy of the few over the many."
      };
    } else if (equalityScore > libertyScore + 1) {
      return {
        title: "⚠️ Warning: Stagnation & Loss of Initiative",
        desc: "Forced equality without individual liberty of conscience and expression smothers human creativity and scientific inquiry.",
        bg: "bg-rose-50 border-rose-400 text-rose-950",
        quote: "Equality without liberty would kill individual initiative."
      };
    } else if (fraternityScore <= 2) {
      return {
        title: "⚠️ Warning: Fragile Social Cohesion",
        desc: "Liberty and equality without brotherhood become purely legal battlegrounds filled with mutual suspicion and division.",
        bg: "bg-purple-50 border-purple-400 text-purple-950",
        quote: "Without fraternity, liberty and equality could not become a natural course of things."
      };
    } else {
      return {
        title: "⚖️ Republic Dynamic Balance",
        desc: "Adjust the trinity sliders to explore how Babasaheb harmonized personal liberty, social equality, and human fellowship.",
        bg: "bg-blue-50 border-blue-400 text-blue-950",
        quote: "Democracy is not merely a form of government; it is primarily a mode of associated living."
      };
    }
  };

  const diagnosis = getEquilibriumDiagnosis();

  const pillarName = (language !== 'en' && activePillar.nameLocal?.[language]) || activePillar.name;
  const pillarTagline = (language !== 'en' && activePillar.taglineLocal?.[language]) || activePillar.tagline;
  const pillarQuote = (language !== 'en' && activePillar.ambedkarQuoteLocal?.[language]) || activePillar.ambedkarQuote;
  const pillarSummary = (language !== 'en' && activePillar.plainLanguageSummaryLocal?.[language]) || activePillar.plainLanguageSummary;
  const ActiveIcon = activePillar.icon;

  return (
    <div className="bg-[#FAF7F0] border-2 border-[#D3D4C0] rounded-3xl p-6 sm:p-8 shadow-xl space-y-8 relative overflow-hidden">
      {/* Title & Exploration Pill */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2D9C8] pb-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0A2947] text-[#C89D56] font-serif-editorial text-xs rounded-full uppercase tracking-wider mb-2 font-bold shadow-sm">
            <Landmark className="w-3.5 h-3.5 text-[#C89D56]" />
            <span>Interactive Preamble Laboratory & Simulator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#0A2947] tracking-tight">
            The Living Architecture of the Republic
          </h2>
          <p className="text-xs sm:text-sm text-[#8B5E3C] mt-1 max-w-2xl font-dmsans">
            Engage with Dr. Ambedkar's foundational trinity. Experiment with the Republic Balance Scale, test real-life classroom dilemmas, and hear authentic CAD speeches!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-[#8B5E3C] bg-white px-3 py-1.5 rounded-xl border border-[#D3D4C0] font-bold shadow-sm">
            🏛️ 4 Sacred Tenets
          </span>
        </div>
      </div>

      {/* FEATURE 1: The Interactive Republic Trinity Balance Scale Simulator */}
      <div className="bg-white border-2 border-[#C89D56] rounded-2xl p-6 sm:p-7 shadow-lg space-y-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F4EBD9] pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#C89D56]" />
            <h3 className="font-serif-editorial font-bold text-lg text-[#0A2947]">
              Dr. Ambedkar’s Trinity Equilibrium Simulator
            </h3>
          </div>
          <span className="text-xs font-mono text-[#8B5E3C] bg-[#FAF7F0] px-3 py-1 rounded-lg border border-[#E2D9C8]">
            Interactive Constitutional Physics
          </span>
        </div>

        {/* 3 Interactive Dials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Liberty Slider */}
          <div className="bg-[#FAF7F0] p-4 rounded-xl border border-[#E2D9C8] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-[#0A2947]">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#C89D56]" /> Liberty
              </span>
              <span className="bg-[#0A2947] text-white px-2 py-0.5 rounded text-[11px]">
                {libertyScore} / 5
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={libertyScore}
              onChange={(e) => {
                soundEffects.playClick();
                setLibertyScore(Number(e.target.value));
              }}
              className="w-full accent-[#C89D56] cursor-pointer"
            />
            <div className="text-[10px] font-mono text-[#8B5E3C] text-right">
              Conscience & Speech
            </div>
          </div>

          {/* Equality Slider */}
          <div className="bg-[#FAF7F0] p-4 rounded-xl border border-[#E2D9C8] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-[#0A2947]">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" /> Equality
              </span>
              <span className="bg-emerald-800 text-white px-2 py-0.5 rounded text-[11px]">
                {equalityScore} / 5
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={equalityScore}
              onChange={(e) => {
                soundEffects.playClick();
                setEqualityScore(Number(e.target.value));
              }}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="text-[10px] font-mono text-[#8B5E3C] text-right">
              Social Upliftment & Rights
            </div>
          </div>

          {/* Fraternity Slider */}
          <div className="bg-[#FAF7F0] p-4 rounded-xl border border-[#E2D9C8] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-[#0A2947]">
              <span className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-600" /> Fraternity
              </span>
              <span className="bg-rose-800 text-white px-2 py-0.5 rounded text-[11px]">
                {fraternityScore} / 5
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={fraternityScore}
              onChange={(e) => {
                soundEffects.playClick();
                setFraternityScore(Number(e.target.value));
              }}
              className="w-full accent-rose-600 cursor-pointer"
            />
            <div className="text-[10px] font-mono text-[#8B5E3C] text-right">
              Brotherhood & Compassion
            </div>
          </div>
        </div>

        {/* Live Balance Beam & Diagnostic Output */}
        <div className={`p-5 rounded-2xl border-2 transition-all duration-300 space-y-2 ${diagnosis.bg}`}>
          <div className="flex items-center justify-between">
            <h4 className="font-serif-editorial font-bold text-base">
              {diagnosis.title}
            </h4>
            <div className="flex items-center gap-1 text-xs font-mono">
              <span>Beam Tilt: {balanceAngle}°</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm font-dmsans leading-relaxed">
            {diagnosis.desc}
          </p>
          <div className="pt-2 border-t border-current/15 text-xs font-serif-editorial italic">
            "{diagnosis.quote}"
            <span className="block not-italic font-mono text-[10px] font-bold mt-0.5 opacity-80">
              — Dr. B. R. Ambedkar, Constituent Assembly of India (25 Nov 1949)
            </span>
          </div>
        </div>
      </div>

      {/* Pillar Selection Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PREAMBLE_PILLARS.map((pillar) => {
          const isSelected = pillar.id === selectedPillarId;
          const Icon = pillar.icon;
          const title = (language !== 'en' && pillar.nameLocal?.[language]) || pillar.name;

          return (
            <button
              key={pillar.id}
              onClick={() => handleSelectPillar(pillar.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 text-center transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-br from-[#0A2947] to-[#041424] text-[#FAF7F0] border-[#C89D56] shadow-xl ring-2 ring-[#C89D56]/60 scale-[1.03]'
                  : 'bg-white text-[#0A2947] border-[#D3D4C0] hover:bg-[#F3E4C9]/40 hover:border-[#C89D56]'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 shadow-sm ${
                isSelected ? 'bg-[#C89D56] text-[#0A2947]' : 'bg-[#FAF7F0] text-[#0A2947] border border-[#E2D9C8]'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="font-serif-editorial font-bold text-sm tracking-wide">
                {title.split(' ')[0]}
              </span>
              <span className={`text-[11px] mt-0.5 line-clamp-1 font-mono uppercase ${isSelected ? 'text-[#C89D56]' : 'text-[#8B5E3C]'}`}>
                {pillar.id}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Focus Detail Card */}
      <div className="bg-white rounded-2xl border-2 border-[#D3D4C0] p-6 sm:p-8 shadow-lg space-y-6 relative overflow-hidden">
        {/* Top Header Row of the Pillar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F4EBD9] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#0A2947] text-[#C89D56] flex items-center justify-center shadow-inner">
              <ActiveIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-serif-editorial font-bold text-[#0A2947]">
                {pillarName}
              </h3>
              <p className="text-xs text-[#8B5E3C] font-mono tracking-wide">
                {pillarTagline}
              </p>
            </div>
          </div>

          {/* Audio Reading Button + Waveform Animation */}
          <div className="flex items-center gap-3">
            {isPlayingAudio && (
              <div className="flex items-center gap-1 h-5">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-[#C89D56] rounded-full animate-pulse"
                    style={{
                      height: `${12 + (i % 3) * 8}px`,
                      animationDelay: `${i * 0.12}s`
                    }}
                  />
                ))}
              </div>
            )}

            <button
              onClick={handleAudioNarration}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border shadow-sm ${
                isPlayingAudio
                  ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                  : 'bg-[#FAF7F0] text-[#0A2947] border-[#D3D4C0] hover:bg-[#F3E4C9] hover:border-[#C89D56]'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="w-4 h-4 text-rose-600" />
                  <span>Stop Speech</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-[#C89D56]" />
                  <span>Hear Babasaheb’s Words</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2-Column Grid: CAD Defense vs Student Explainer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column 1: Archival Quote & CAD Source */}
          <div className="bg-gradient-to-br from-[#FAF7F0] to-[#F3E4C9]/40 rounded-xl p-5 border border-[#E2D9C8] flex flex-col justify-between space-y-4 shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#8B5E3C] font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C89D56]" />
                  Dr. Ambedkar's Archival Defense
                </span>
                <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-[#E2D9C8] text-[#0A2947] font-mono">
                  CAD Record
                </span>
              </div>
              <blockquote className="text-sm sm:text-base font-serif-editorial italic text-[#0A2947] leading-relaxed border-l-2 border-[#C89D56] pl-4 py-1">
                "{pillarQuote}"
              </blockquote>
            </div>

            <div className="pt-3 border-t border-[#E2D9C8]/60 flex items-center justify-between text-xs text-[#8B5E3C]">
              <span className="font-mono text-[11px] line-clamp-1">
                🏛️ {activePillar.cadCitation}
              </span>
              {onOpenDocument && (
                <button
                  onClick={() => onOpenDocument(activePillar.relatedDocId)}
                  className="inline-flex items-center gap-1 font-bold text-[#0A2947] hover:text-[#C89D56] transition-colors ml-2 shrink-0 cursor-pointer"
                >
                  <span>Examine Record</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Column 2: Plain Language for Students */}
          <div className="bg-[#FAF7F0]/60 rounded-xl p-5 border border-[#D3D4C0] flex flex-col justify-between space-y-4 shadow-sm">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#0A2947] font-semibold mb-3">
                <BookOpen className="w-3.5 h-3.5 text-[#C89D56]" />
                <span>In Plain Words (Student Explainer)</span>
              </div>
              <p className="text-sm text-[#0A2947]/90 leading-relaxed font-dmsans">
                {pillarSummary}
              </p>
            </div>

            {/* AI Inquiry Shortcut */}
            {onAskAI && (
              <button
                onClick={() => onAskAI(`How did Dr. Ambedkar formulate the principle of ${activePillar.name} in the Constitution of India, and how can students apply it today?`)}
                className="text-xs text-[#0A2947] font-bold hover:underline inline-flex items-center gap-1.5 pt-2 border-t border-[#E2D9C8] cursor-pointer"
              >
                <span>Ask AI Scholar for classroom debate points on {activePillar.name}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C89D56]" />
              </button>
            )}
          </div>
        </div>

        {/* FEATURE 2: Interactive Real-Life Classroom Dilemma Challenge */}
        <div className="bg-gradient-to-r from-amber-50 to-blue-50 border-2 border-[#C89D56] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase font-bold text-[#0A2947] flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#C89D56]" />
              Interactive Dilemma Challenge: Test Your Democratic Judgment
            </span>
            <span className="text-[10px] font-mono text-[#8B5E3C] bg-white px-2 py-0.5 rounded border border-[#E2D9C8]">
              Instant Constitutional Review
            </span>
          </div>

          <p className="text-sm font-serif-editorial font-bold text-[#0A2947]">
            "{activePillar.interactiveQuiz.question}"
          </p>

          <div className="space-y-2.5">
            {activePillar.interactiveQuiz.options.map((opt) => {
              const isSelected = selectedQuizOption === opt.id;
              let optStyle = 'bg-white border-[#D3D4C0] hover:border-[#C89D56] text-[#0A2947]';

              if (quizAnswered) {
                if (opt.isCorrect) {
                  optStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400';
                } else if (isSelected && !opt.isCorrect) {
                  optStyle = 'bg-rose-50 border-rose-400 text-rose-950';
                } else {
                  optStyle = 'bg-white/50 border-slate-200 opacity-50';
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleQuizChoice(opt.id)}
                  disabled={quizAnswered}
                  className={`w-full p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col gap-1 ${optStyle}`}
                >
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-dmsans">
                    {quizAnswered && opt.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : quizAnswered && isSelected && !opt.isCorrect ? (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-current shrink-0" />
                    )}
                    <span>{opt.text}</span>
                  </div>

                  {quizAnswered && (opt.isCorrect || isSelected) && (
                    <div className="text-[11px] font-dmsans pl-5 opacity-90 mt-1">
                      {opt.feedback}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Safeguarding Articles Banner */}
        <div className="pt-2 border-t border-[#F4EBD9]">
          <h4 className="text-xs font-mono uppercase tracking-wider text-[#8B5E3C] font-semibold mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Enforced Constitutional Articles Safeguarding This Pillar
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {activePillar.keyArticles.map((art) => (
              <div
                key={art.article}
                className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-xl p-3 hover:border-[#0A2947] hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold font-mono text-[#0A2947] bg-[#EAE0D0] px-2 py-0.5 rounded">
                    {art.article}
                  </span>
                  <span className="text-[10px] text-[#8B5E3C] font-mono">Enacted 1950</span>
                </div>
                <div className="text-xs font-serif-editorial font-bold text-[#0A2947]">
                  {art.label}
                </div>
                <div className="text-[11px] text-[#8B5E3C] font-dmsans mt-1 line-clamp-2">
                  {art.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreambleLaboratory;
