'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin, Compass, Globe, Sparkles, BookOpen, ExternalLink,
  Landmark, Award, Search, X
} from 'lucide-react';
import { api } from '@/lib/api';
import { soundEffects } from '@/utils/soundEffects';
import { MemorialGlobe } from './MemorialGlobe';
import MuseumGrandPavilion from './MuseumGrandPavilion';
import { Language } from '@/types';
import { UI_STRINGS } from '@/utils/i18n';

export interface HeritageLocation {
  id: string;
  name: string;
  nameLocal?: Record<string, string>;
  city: string;
  cityLocal?: Record<string, string>;
  country: string;
  coordinates: { latitude: number; longitude: number };
  type: string;
  typeLocal?: Record<string, string>;
  description: string;
  descriptionLocal?: Record<string, string>;
  historical_significance: string;
  historicalSignificanceLocal?: Record<string, string>;
  related_documents: string[];
  related_events: string[];
  imageUrl?: string;
}

interface MemorialsViewProps {
  language?: Language;
  onOpenDocument?: (docId: string) => void;
  onAskAIAboutLocation?: (locationName: string) => void;
}

export const MemorialsView: React.FC<MemorialsViewProps> = ({
  language = 'en',
  onOpenDocument,
  onAskAIAboutLocation,
}) => {
  const [locations, setLocations] = useState<HeritageLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<HeritageLocation | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [mobileTab, setMobileTab] = useState<'list' | 'details' | 'globe'>('list');

  const t = UI_STRINGS[language] || UI_STRINGS.en;

  // Canonical registry fallback in case backend is offline with multilingual records
  const fallbackLocations: HeritageLocation[] = [
    {
      id: "loc-mhow",
      name: "Bhim Janmabhoomi (Mhow / Dr. Ambedkar Nagar)",
      nameLocal: {
        hi: "भीम जन्मभूमि (महू / डॉ. आंबेडकर नगर)",
        mr: "भीम जन्मभूमी (महू / डॉ. आंबेडकर नगर)",
        ta: "பீம் ஜென்மபூமி (மஹூ / டாக்டர் அம்பேத்கர் நகர்)",
        bn: "ভীম জন্মভূমি (মহু / ড. আম্বেদকর নগর)"
      },
      city: "Mhow, Madhya Pradesh",
      cityLocal: {
        hi: "महू, मध्य प्रदेश",
        mr: "महू, मध्य प्रदेश",
        ta: "மஹூ, மத்தியப் பிரதேசம்",
        bn: "মহু, মধ্যপ্রদেশ"
      },
      country: "India",
      coordinates: { latitude: 22.5539, longitude: 75.7644 },
      type: "Birthplace & Panchtirth National Memorial",
      typeLocal: {
        hi: "जन्मभूमि एवं पंचतीर्थ राष्ट्रीय स्मारक",
        mr: "जन्मभूमी व पंचतीर्थ राष्ट्रीय स्मारक",
        ta: "பிறப்பிடம் & பஞ்சதீர்த்த தேசிய நினைவகம்",
        bn: "জন্মভূমি ও পঞ্চতীর্থ জাতীয় স্মারক"
      },
      description: "Birthplace of Dr. B. R. Ambedkar on 14 April 1891 in the military cantonment of Mhow. Now enshrined as the grand Bhim Janmabhoomi memorial complex.",
      descriptionLocal: {
        hi: "14 अप्रैल 1891 को महू छावनी में डॉ. बी. आर. आंबेडकर का जन्मस्थान। अब इसे भव्य भीम जन्मभूमि राष्ट्रीय स्मारक के रूप में प्रतिष्ठित किया गया है।",
        mr: "14 एप्रिल 1891 रोजी महू छावणीत डॉ. बाबासाहेब आंबेडकरांचे जन्मस्थान. आता हे भव्य भीम जन्मभूमी राष्ट्रीय स्मारक म्हणून आदरणीय आहे.",
        ta: "14 ஏப்ரல் 1891 அன்று மஹூ இராணுவப் பகுதியில் டாக்டர் பி. ஆர். அம்பேத்கர் பிறந்த இடம். இப்போது பிரம்மாண்டமான பீம் ஜென்மபூமி நினைவகமாக விளங்குகிறது.",
        bn: "১৪ এপ্রিল ১৮৯১ সালে মহু সেনা ছাউনিতে ড. বি. আর. আম্বেদকরের জন্মস্থান। বর্তমানে এটি ঐতিহাসিক ভীম জন্মভূমি জাতীয় স্মারক হিসেবে প্রতিষ্ঠিত।"
      },
      historical_significance: "Cradle of the architect of modern India and leader of the subaltern emancipation movement.",
      historicalSignificanceLocal: {
        hi: "आधुनिक भारत के संविधान निर्माता और सामाजिक समानता आंदोलन के महानायक की जन्मस्थली।",
        mr: "आधुनिक भारताचे शिल्पकार आणि समता चळवळीचे प्रणेते यांची पावन जन्मभूमी.",
        ta: "நவீன இந்தியாவின் சிற்பி மற்றும் ஒடுக்கப்பட்டோரின் உரிமைப் போராளியின் தொட்டில்.",
        bn: "আধুনিক ভারতের স্থপতি এবং সামাজিক সমতা আন্দোলনের প্রধান পথপ্রদর্শকের জন্মস্থান।"
      },
      related_documents: ["AMBEDKAR-VOL-01", "AMBEDKAR-VOL-17-01"],
      related_events: ["1891-birth"],
      imageUrl: "/images/ambedkar_young.gif"
    },
    {
      id: "loc-london",
      name: "Dr. Ambedkar Memorial London (10 King Henry's Road)",
      nameLocal: {
        hi: "डॉ. आंबेडकर मेमोरियल लंदन (10 किंग हेनरीज रोड)",
        mr: "डॉ. आंबेडकर स्मारक लंडन (10 किंग हेनरीज रोड)",
        ta: "டாக்டர் அம்பேத்கர் நினைவகம் லண்டன் (10 கிங் ஹென்றி சாலை)",
        bn: "ড. আম্বেদকর মেমোরিয়াল লন্ডন (১০ কিং হেনরিজ রোড)"
      },
      city: "Camden, London",
      cityLocal: {
        hi: "कैम्डेन, लंदन",
        mr: "कॅम्डेन, लंडन",
        ta: "கேம்டன், லண்டன்",
        bn: "ক্যামডেন, লন্ডন"
      },
      country: "United Kingdom",
      coordinates: { latitude: 51.5434, longitude: -0.1614 },
      type: "Panchtirth International Memorial",
      typeLocal: {
        hi: "पंचतीर्थ अंतर्राष्ट्रीय स्मारक",
        mr: "पंचतीर्थ आंतरराष्ट्रीय स्मारक",
        ta: "பஞ்சதீர்த்த சர்வதேச நினைவகம்",
        bn: "পঞ্চতীর্থ আন্তর্জাতিক স্মারক"
      },
      description: "Residence where Dr. Ambedkar lived while studying for his D.Sc. at London School of Economics and Bar-at-Law at Gray's Inn (1921-1922). Acquired by Government of Maharashtra as an international museum.",
      descriptionLocal: {
        hi: "वह ऐतिहासिक आवास जहाँ डॉ. आंबेडकर ने लंदन स्कूल ऑफ इकोनॉमिक्स (डी.एससी.) और ग्रेज इन (बार-एट-लॉ) में अध्ययन के दौरान 1921-1922 में निवास किया था।",
        mr: "लंडन स्कूल ऑफ इकॉनॉमिक्समध्ये डी.एस्सी. आणि ग्रेज इनमध्ये बॅरिस्टर पदवीसाठी शिकत असताना डॉ. आंबेडकरांचे निवासस्थान (1921-1922).",
        ta: "லண்டன் ஸ்கூல் ஆஃப் எகனாமிக்ஸ் மற்றும் கிரேஸ் இன் ஆகியவற்றில் பயின்றபோது டாக்டர் அம்பேத்கர் வாழ்ந்த வரலாற்று இல்லம் (1921-1922).",
        bn: "লন্ডন স্কুল অব ইকোনমিক্স ও গ্রেজ ইন-এ পড়াশোনার সময় ড. আম্বেদকরের ঐতিহাসিক বাসস্থান (১৯২১-১৯২২)।"
      },
      historical_significance: "Site of intense scholarship where 'The Problem of the Rupee' was researched and written.",
      historicalSignificanceLocal: {
        hi: "गहन ज्ञान साधना का केंद्र जहाँ 'द प्रॉब्लम ऑफ द रुपी' (रुपये की समस्या) शोध प्रबंध लिखा गया, जिसने भारतीय रिजर्व बैंक की नींव रखी।",
        mr: "प्रचंड ज्ञानतपस्येचे केंद्र जिथे 'द प्रॉब्लेम ऑफ द रुपी' हा जागतिक दर्जाचा ग्रंथ लिहिला गेला.",
        ta: "'தி பிராப்ளம் ஆஃப் தி ருபீ' ஆய்வறிக்கை உருவாக்கப்பட்டு ரிசர்வ் வங்கி தோற்றத்திற்கு வித்திட்ட தளம்.",
        bn: "গবেষণার পবিত্র পীঠস্থান যেখানে 'দ্য প্রবলেম অফ দ্য রুপি' রচিত হয়েছিল।"
      },
      related_documents: ["AMBEDKAR-VOL-06"],
      related_events: ["1923-problem-of-rupee"],
      imageUrl: "/images/ambedkar_barrister_1922.jpg"
    },
    {
      id: "loc-mahad",
      name: "Chavdar Tale Water Reservoir (Mahad Satyagraha)",
      nameLocal: {
        hi: "चवदार तालाब (महाड सत्याग्रह)",
        mr: "चवदार तळे (महाड सत्याग्रह)",
        ta: "சவதார் குளம் (மகாத் சத்தியாகிரகம்)",
        bn: "চবদার জলাশয় (মহাদ সত্যাগ্রহ)"
      },
      city: "Mahad, Raigad, Maharashtra",
      cityLocal: {
        hi: "महाड, रायगढ़, महाराष्ट्र",
        mr: "महाड, रायगड, महाराष्ट्र",
        ta: "மகாத், ராய்கட், மகாராஷ்டிரா",
        bn: "মহাদ, রায়গড়, মহারাষ্ট্র"
      },
      country: "India",
      coordinates: { latitude: 18.2323, longitude: 73.4219 },
      type: "Civil Rights & Satyagraha Memorial",
      typeLocal: {
        hi: "नागरिक अधिकार एवं सत्याग्रह स्मारक",
        mr: "नागरी हक्क व सत्याग्रह स्मारक",
        ta: "குடிமை உரிமை & சத்தியாகிரக நினைவகம்",
        bn: "নাগরিক অধিকার ও সত্যাগ্রহ স্মারক"
      },
      description: "Site of the historic Mahad Satyagraha of 20 March 1927, where Dr. Ambedkar led thousands to assert their fundamental right to public drinking water.",
      descriptionLocal: {
        hi: "20 मार्च 1927 के ऐतिहासिक महाड सत्याग्रह का स्थल, जहाँ डॉ. आंबेडकर ने सार्वजनिक पेयजल के मौलिक मानवाधिकार की बहाली के लिए संघर्ष का नेतृत्व किया।",
        mr: "20 मार्च 1927 च्या ऐतिहासिक महाड सत्याग्रहाचे पावन स्थळ, जिथे बाबासाहेबांनी पाण्याचा मूलभूत मानवी हक्क प्रस्थापित केला.",
        ta: "மார்ச் 20, 1927 அன்று டாக்டர் அம்பேத்கர் தலைமையில் பல்லாயிரக்கணக்கான மக்கள் பொதுக் குடிநீர் உரிமைக்காகப் போராடிய மகாத் சத்தியாகிரக களம்.",
        bn: "২০ মার্চ ১৯২৭ সালের ঐতিহাসিক মহাদ সত্যাগ্রহের স্থান, যেখানে জনসাধারণের পানীয় জলের মৌলিক অধিকার প্রতিষ্ঠা করা হয়েছিল।"
      },
      historical_significance: "Often described as the Magna Carta of Dalit human rights in modern Indian history.",
      historicalSignificanceLocal: {
        hi: "आधुनिक भारतीय इतिहास में मानवाधिकारों का मैग्ना कार्टा माना जाने वाला पहला जन-क्रांतिकारी जल सत्याग्रह।",
        mr: "आधुनिक भारतीय इतिहासातील मानवी हक्कांची सनद (मॅग्ना कार्टा) मानला जाणारा ऐतिहासिक लढा.",
        ta: "நவீன இந்திய வரலாற்றில் மனித உரிமைகளுக்கான மகா சாசனமாக போற்றப்படும் களம்.",
        bn: "আধুনিক ভারতীয় ইতিহাসে দলিত মানবাধিকারের মহাসনদ (ম্যাগনা কার্টা) হিসেবে বিবেচিত।"
      },
      related_documents: ["AMBEDKAR-VOL-17-01"],
      related_events: ["1927-mahad"],
      imageUrl: "/images/ambedkar_public_assembly.png"
    },
    {
      id: "loc-delhi-ca",
      name: "Old Parliament House / Constituent Assembly Hall",
      nameLocal: {
        hi: "संविधान सभा कक्ष / पुराना संसद भवन (नई दिल्ली)",
        mr: "संविधान सभा दालन / जुनी संसद (नवी दिल्ली)",
        ta: "பழைய நாடாளுமன்றம் / அரசியலமைப்பு நிர்ணய சபை அரங்கு",
        bn: "পুরাতন সংসদ ভবন / গণপরিষদ কক্ষ (নয়াদিল্লি)"
      },
      city: "New Delhi",
      cityLocal: {
        hi: "नई दिल्ली",
        mr: "नवी दिल्ली",
        ta: "புது தில்லி",
        bn: "নয়াদিল্লি"
      },
      country: "India",
      coordinates: { latitude: 28.6172, longitude: 77.2081 },
      type: "Constitutional Landmark",
      typeLocal: {
        hi: "संवैधानिक ऐतिहासिक धरोहर",
        mr: "घटनात्मक ऐतिहासिक वारसा",
        ta: "அரசியலமைப்பு வரலாற்று தளம்",
        bn: "সাংবিধানিক ঐতিহাসিক স্মারক"
      },
      description: "Historic Central Hall of Parliament where the Drafting Committee, chaired by Dr. Ambedkar, debated and finalized the Constitution of India between 1946 and 1949.",
      descriptionLocal: {
        hi: "संसद का ऐतिहासिक केंद्रीय कक्ष जहाँ डॉ. आंबेडकर की अध्यक्षता वाली प्रारूप समिति ने 1946 से 1949 के बीच भारत के संविधान का निर्माण किया।",
        mr: "संसदेचे ऐतिहासिक सेंट्रल हॉल जेथे डॉ. बाबासाहेब आंबेडकरांच्या अध्यक्षतेखाली मसुदा समितीने भारताचे संविधान घडवले.",
        ta: "டாக்டர் அம்பேத்கர் தலைமையிலான வரைவுக்குழு 1946-1949 வரை இந்திய அரசியலமைப்பை வடிவமைத்து விவாதித்த வரலாற்று நாடாளுமன்ற அரங்கு.",
        bn: "সংসদের ঐতিহাসিক সেন্ট্রাল হল যেখানে ড. আম্বেদকরের নেতৃত্বে খসড়া কমিটি ভারতীয় সংবিধানের চূড়ান্ত রূপ দান করেছিল।"
      },
      historical_significance: "Sanctum of modern constitutional democracy and universal adult franchise in India.",
      historicalSignificanceLocal: {
        hi: "भारतीय लोकतंत्र, सार्वभौमिक वयस्क मताधिकार और सामाजिक न्याय का सर्वोच्च संवैधानिक गर्भगृह।",
        mr: "भारतातील लोकशाही, सार्वत्रिक प्रौढ मताधिकार आणि समतेचा सर्वोच्च घटनात्मक पाया.",
        ta: "இந்தியாவின் நவீன ஜனநாயக மற்றும் உலகளாவிய வாக்குரிமையின் புனிதக் கூடம்.",
        bn: "ভারতীয় গণতান্ত্রিক ব্যবস্থা ও সর্বজনীন প্রাপ্তবয়স্ক ভোটাধিকারের পবিত্র পীঠস্থান।"
      },
      related_documents: ["AMBEDKAR-VOL-13", "AMBEDKAR-VOL-01"],
      related_events: ["1949-constitution-passed"],
      imageUrl: "/images/ambedkar_signing_constitution.jpg"
    },
    {
      id: "loc-delhi-alipur",
      name: "Dr. Ambedkar National Memorial (26 Alipur Road)",
      nameLocal: {
        hi: "डॉ. आंबेडकर राष्ट्रीय स्मारक (26 अलीपुर रोड)",
        mr: "डॉ. आंबेडकर राष्ट्रीय स्मारक (26 अलीपूर रोड)",
        ta: "டாக்டர் அம்பேத்கர் தேசிய நினைவகம் (26 அலிபூர் சாலை)",
        bn: "ড. আম্বেদকর জাতীয় স্মারক (২৬ আলিপুর রোড)"
      },
      city: "Civil Lines, New Delhi",
      cityLocal: {
        hi: "सिविल लाइंस, नई दिल्ली",
        mr: "सिव्हिल लाईन्स, नवी दिल्ली",
        ta: "சிவில் லைன்ஸ், புது தில்லி",
        bn: "সিভিল লাইনস, নয়াদিল্লি"
      },
      country: "India",
      coordinates: { latitude: 28.6756, longitude: 77.2217 },
      type: "Panchtirth National Memorial (Mahaparinirvan)",
      typeLocal: {
        hi: "पंचतीर्थ राष्ट्रीय स्मारक (महापरिनिर्वाण भूमि)",
        mr: "पंचतीर्थ राष्ट्रीय स्मारक (महापरिनिर्वाण भूमी)",
        ta: "பஞ்சதீர்த்த தேசிய நினைவகம் (மகாபரிநிர்வாண பூமி)",
        bn: "পঞ্চতীর্থ জাতীয় স্মারক (মহাপরিনির্বাণ ভূমি)"
      },
      description: "Residence where Dr. Ambedkar spent his final years, completed Buddha and His Dhamma, and attained Mahaparinirvan on 6 December 1956. Designed in the architectural form of an open book.",
      descriptionLocal: {
        hi: "वह निवास जहाँ डॉ. आंबेडकर ने अपने अंतिम वर्ष बिताए, 'द बुद्ध एंड हिज धम्म' की रचना पूरी की और 6 दिसंबर 1956 को महापरिनिर्वाण प्राप्त किया।",
        mr: "बाबासाहेबांचे अंतिम निवासस्थान, जिथे 'बुद्ध आणि त्यांचा धम्म' हा ग्रंथ पूर्ण झाला आणि 6 डिसेंबर 1956 रोजी महापरिनिर्वाण झाले.",
        ta: "டாக்டர் அம்பேத்கர் இறுதி நாட்களைக் கழித்து, 'புத்தரும் அவரது தம்மமும்' நூலை நிறைவு செய்து, 6 டிசம்பர் 1956 அன்று மகாபரிநிர்வாணம் அடைந்த தளம்.",
        bn: "যে বাসস্থানে ড. আম্বেদকর জীবনের শেষ বছরগুলি কাটিয়েছিলেন এবং ৬ ডিসেম্বর ১৯৫৬-তে মহাপরিনির্বাণ লাভ করেছিলেন।"
      },
      historical_significance: "National shrine dedicated to Babasaheb's intellectual legacy and constitutional philosophy.",
      historicalSignificanceLocal: {
        hi: "बाबासाहेब की बौद्धिक विरासत, दार्शनिक चिंतन और अंतिम साधना को समर्पित राष्ट्रीय तीर्थ।",
        mr: "बाबासाहेबांच्या वैचारिक व तत्त्वज्ञानात्मक वारशाला समर्पित राष्ट्रीय पवित्र तीर्थ.",
        ta: "அம்பேத்கரின் அறிவார்ந்த பாரம்பரியம் மற்றும் அரசியலமைப்பு தத்துவத்திற்கு அர்ப்பணிக்கப்பட்ட தேசிய ஆலயம்.",
        bn: "বাবাসাহেবের বৌদ্ধিক ঐতিহ্য ও দর্শনচর্চার জাতীয় স্মারক তীর্থ।"
      },
      related_documents: ["AMBEDKAR-VOL-11", "AMBEDKAR-VOL-17-01"],
      related_events: ["1956-mahaparinirvan"],
      imageUrl: "/images/ambedkar_memorial_alipur.jpg"
    },
    {
      id: "loc-nagpur",
      name: "Deekshabhoomi",
      nameLocal: {
        hi: "दीक्षाभूमि (नागपुर)",
        mr: "दीक्षाभूमी (नागपूर)",
        ta: "தீக்ஷாபூமி (நாக்பூர்)",
        bn: "দীক্ষাভূমি (নাগপুর)"
      },
      city: "Nagpur, Maharashtra",
      cityLocal: {
        hi: "नागपुर, महाराष्ट्र",
        mr: "नागपूर, महाराष्ट्र",
        ta: "நாக்பூர், மகாராஷ்டிரா",
        bn: "নাগপুর, মহারাষ্ট্র"
      },
      country: "India",
      coordinates: { latitude: 21.1278, longitude: 79.0664 },
      type: "Panchtirth Religious Emancipation Memorial",
      typeLocal: {
        hi: "पंचतीर्थ धम्मक्रांति एवं मुक्ति स्मारक",
        mr: "पंचतीर्थ धम्मक्रांती व मुक्ती स्मारक",
        ta: "பஞ்சதீர்த்த மத விடுதலை நினைவகம்",
        bn: "পঞ্চতীর্থ ধর্মমুক্তি স্মারক"
      },
      description: "Sacred ground where Dr. Ambedkar embraced Buddhism alongside over 500,000 followers on Ashoka Vijaya Dashami, 14 October 1956, taking the 22 historic vows.",
      descriptionLocal: {
        hi: "वह पावन भूमि जहाँ 14 अक्टूबर 1956 (अशोक विजयादशमी) को डॉ. आंबेडकर ने 5 लाख से अधिक अनुयायियों के साथ बौद्ध धर्म ग्रहण किया और 22 ऐतिहासिक प्रतिज्ञाएं दीं।",
        mr: "14 ऑक्टोबर 1956 रोजी विजयादशमीला बाबासाहेबांनी 5 लाखांहून अधिक अनुयायांसह बौद्ध धम्माची दीक्षा घेऊन धम्मक्रांती घडवली.",
        ta: "14 அக்டோபர் 1956 அன்று டாக்டர் அம்பேத்கர் 5 லட்சத்திற்கும் மேற்பட்ட மக்களுடன் பௌத்த மதத்தை தழுவி 22 உறுதிமொழிகளை ஏற்ற புனித பூமி.",
        bn: "১৪ অক্টোবর ১৯৫৬ সালে ড. আম্বেদকর ৫ লক্ষাধিক অনুসারীসহ বৌদ্ধ ধর্ম গ্রহণ এবং ২২টি ঐতিহাসিক প্রতিজ্ঞা গ্রহণ করেছিলেন।"
      },
      historical_significance: "Greatest mass peaceful religious and philosophical emancipation movement in modern world history.",
      historicalSignificanceLocal: {
        hi: "मानव इतिहास में सबसे बड़ी शांतिपूर्ण आध्यात्मिक, दार्शनिक और सामाजिक मुक्ति क्रांति।",
        mr: "मानवी इतिहासातील सर्वात मोठी शांततामय सामाजिक व बौद्धिक मुक्तीची धम्मक्रांती.",
        ta: "மனித வரலாற்றிலேயே அமைதி வழியில் நிகழ்ந்த மிகப்பெரிய ஆன்மீக மற்றும் சமூக விடுதலை இயக்கம்.",
        bn: "মানব ইতিহাসের বৃহত্তম অহিংস দার্শনিক ও আধ্যাত্মিক মুক্তি আন্দোলন।"
      },
      related_documents: ["AMBEDKAR-VOL-11"],
      related_events: ["1956-buddhism-conversion"],
      imageUrl: "/images/ambedkar_historic_seated.jpg"
    },
    {
      id: "loc-chaitya",
      name: "Chaitya Bhoomi (Dadar)",
      nameLocal: {
        hi: "चैत्य भूमि (दादर, मुंबई)",
        mr: "चैत्यभूमी (दादर, मुंबई)",
        ta: "சைத்ய பூமி (தாதர், மும்பை)",
        bn: "চৈতন্যভূমি (দাদার, মুম্বই)"
      },
      city: "Mumbai, Maharashtra",
      cityLocal: {
        hi: "मुंबई, महाराष्ट्र",
        mr: "मुंबई, महाराष्ट्र",
        ta: "மும்பை, மகாராஷ்டிரா",
        bn: "মুম্বই, মহারাষ্ট্র"
      },
      country: "India",
      coordinates: { latitude: 19.0275, longitude: 72.8344 },
      type: "Panchtirth National Memorial & Resting Place",
      typeLocal: {
        hi: "पंचतीर्थ राष्ट्रीय समाधि स्मारक",
        mr: "पंचतीर्थ राष्ट्रीय समाधी स्मारक",
        ta: "பஞ்சதீர்த்த தேசிய சமாதி நினைவகம்",
        bn: "পঞ্চতীর্থ জাতীয় সমাধিসৌধ স্মারক"
      },
      description: "Cremation and resting memorial of Dr. Ambedkar on the shores of Dadar Chowpatty, visited by millions annually on Mahaparinirvan Divas (6 December).",
      descriptionLocal: {
        hi: "दादर चौपाटी के तट पर स्थित डॉ. आंबेडकर का अंतिम संस्कार व समाधि स्मारक, जहाँ प्रतिवर्ष 6 दिसंबर को लाखों श्रद्धालु नमन करने पहुँचते हैं।",
        mr: "दादर चौपाटीच्या किनाऱ्यावर बाबासाहेबांचे समाधी स्मारक, जिथे दरवर्षी 6 डिसेंबरला लाखो अनुयायी कृतज्ञता व्यक्त करण्यासाठी येतात.",
        ta: "தாதர் கடற்கரையில் அமைந்துள்ள டாக்டர் அம்பேத்கரின் இறுதி சமாதி நினைவகம், ஆண்டுதோறும் டிசம்பர் 6 அன்று லட்சக்கணக்கானோரால் வணங்கப்படுகிறது.",
        bn: "দাদার চৌপাট্টি উপকূলে ড. আম্বেদকরের পবিত্র সমাধিস্থল, যেখানে প্রতি বছর ৬ ডিসেম্বর লক্ষ লক্ষ মানুষ শ্রদ্ধা নিবেদন করেন।"
      },
      historical_significance: "Pilgrimage center of the democratic equality movement.",
      historicalSignificanceLocal: {
        hi: "सामाजिक समता, गरिमा और लोकतांत्रिक अधिकारों के संघर्ष का सर्वोच्च प्रेरणा केंद्र।",
        mr: "सामाजिक समता, स्वाभिमान आणि लोकशाही मूल्यांचे असीम ऊर्जा केंद्र.",
        ta: "சமத்துவ உரிமை மற்றும் மனித சுயமரியாதைப் போராட்டத்தின் தேசிய புனித தளம்.",
        bn: "সামাজিক সাম্য ও গণতান্ত্রিক সমঅধিকার আন্দোলনের অবিচল প্রেরণা কেন্দ্র।"
      },
      related_documents: ["AMBEDKAR-VOL-17-01"],
      related_events: ["1956-mahaparinirvan"],
      imageUrl: "/images/ambedkar_memorial_monument.jpg"
    },
    {
      id: "loc-columbia",
      name: "Columbia University (Low Memorial Library & Philosophy Hall)",
      nameLocal: {
        hi: "कोलंबिया विश्वविद्यालय (न्यूयॉर्क)",
        mr: "कोलंबिया विद्यापीठ (न्यूयॉर्क)",
        ta: "கொலம்பியா பல்கலைக்கழகம் (நியூயார்க்)",
        bn: "কলাম্বিয়া বিশ্ববিদ্যালয় (নিউ ইয়র্ক)"
      },
      city: "New York City, New York",
      cityLocal: {
        hi: "न्यूयॉर्क शहर, अमेरिका",
        mr: "न्यूयॉर्क शहर, अमेरिका",
        ta: "நியூயார்க் நகரம், அமெரிக்கா",
        bn: "নিউ ইয়র্ক সিটি, যুক্তরাষ্ট্র"
      },
      country: "United States",
      coordinates: { latitude: 40.8075, longitude: -73.9626 },
      type: "Intellectual Alma Mater",
      typeLocal: {
        hi: "बौद्धिक विद्यापीठ (मातृसंस्था)",
        mr: "बौद्धिक विद्यापीठ (मातृसंस्था)",
        ta: "அறிவார்ந்த தாய் பல்கலைக்கழகம்",
        bn: "উচ্চশিক্ষা বিদ্যাপীঠ (আলমা মেটার)"
      },
      description: "Where young Bhimrao Ambedkar studied under John Dewey, Edwin Seligman, and Alexander Goldenweiser (1913-1916), writing 'Castes in India'. Awarded LL.D. in 1952 as 'Great American Alumnus'.",
      descriptionLocal: {
        hi: "जहाँ युवा भीमराव आंबेडकर ने जॉन डेवी और एडविन सेलिगमैन के मार्गदर्शन में 1913-1916 में अध्ययन किया और 'कास्ट्स इन इंडिया' शोध पत्र प्रस्तुत किया।",
        mr: "जेथे तरुण भीमरावांनी जॉन ड्युई यांच्या मार्गदर्शनाखाली 1913-1916 मध्ये शिक्षण घेतले आणि 'कास्ट्स इन इंडिया' हा शोधनिबंध मांडला.",
        ta: "இளம் அம்பேத்கர் ஜான் டூயி அவர்களின் கீழ் 1913-1916 வரை பயின்று, 'இந்தியாவில் சாதிகள்' ஆய்வுக் கட்டுரையை எழுதிய புகழ்பெற்ற பல்கலைக்கழகம்.",
        bn: "যেখানে তরুণ ভীমরাও আম্বেদকর জন ডিউই-এর অধীনে ১৯১৩-১৯১৬ পর্যন্ত অধ্যয়ন করেছিলেন এবং 'কাস্টস ইন ইন্ডিয়া' প্রবন্ধ রচনা করেছিলেন।"
      },
      historical_significance: "Formative epicenter of pragmatist philosophy, social democracy, and constitutional thought.",
      historicalSignificanceLocal: {
        hi: "व्यावहारिक दर्शन, सामाजिक लोकतंत्र और संवैधानिक विचारों के निर्माण की ऐतिहासिक आधारभूमि।",
        mr: "व्यावहारिक तत्त्वज्ञान, सामाजिक लोकशाही आणि घटनात्मक चिंतनाची वैचारिक पायाभरणी.",
        ta: "சமூக ஜனநாயகம் மற்றும் அரசியலமைப்புச் சிந்தனைகள் உருவான அறிவுசார் தளம்.",
        bn: "প্রয়োগবাদী দর্শন, সামাজিক গণতন্ত্র ও সাংবিধানিক ভাবনার নির্মাণভূমি।"
      },
      related_documents: ["AMBEDKAR-VOL-01"],
      related_events: ["1916-castes-in-india"],
      imageUrl: "/images/ambedkar_columbia_study_tour.jpg"
    }
  ];

  useEffect(() => {
    async function loadLocations() {
      try {
        const res = await api.getHeritageLocations();
        if (res && res.locations && res.locations.length > 0) {
          const enriched = res.locations.map((loc: HeritageLocation) => {
            const fallback = fallbackLocations.find(f => f.id === loc.id);
            return {
              ...loc,
              nameLocal: fallback?.nameLocal || loc.nameLocal,
              cityLocal: fallback?.cityLocal || loc.cityLocal,
              typeLocal: fallback?.typeLocal || loc.typeLocal,
              descriptionLocal: fallback?.descriptionLocal || loc.descriptionLocal,
              historicalSignificanceLocal: fallback?.historicalSignificanceLocal || loc.historicalSignificanceLocal
            };
          });
          setLocations(enriched);
        } else {
          setLocations(fallbackLocations);
        }
      } catch (err) {
        console.warn('Could not load dynamic locations, using canonical registry:', err);
        setLocations(fallbackLocations);
      } finally {
        setLoading(false);
      }
    }
    loadLocations();
  }, []);

  const filteredLocations = locations.filter(loc => {
    const locName = loc.nameLocal?.[language] || loc.name;
    const locCity = loc.cityLocal?.[language] || loc.city;
    const locDesc = loc.descriptionLocal?.[language] || loc.description;
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      locName.toLowerCase().includes(q) ||
      loc.name.toLowerCase().includes(q) ||
      locCity.toLowerCase().includes(q) ||
      loc.city.toLowerCase().includes(q) ||
      locDesc.toLowerCase().includes(q) ||
      loc.description.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (activeFilter === 'panchtirth') return loc.type.toLowerCase().includes('panchtirth');
    if (activeFilter === 'india') return loc.country === 'India';
    if (activeFilter === 'international') return loc.country !== 'India';
    return true;
  });

  return (
    <div className="min-h-screen bg-transparent text-[#0A2947] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 font-dmsans pb-24">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* Curatorial Header */}
        <MuseumGrandPavilion
          title={t.memorialsTitle}
          subtitle={t.memorialsSubtitle}
          watermarkIcon={Compass}
        />

        {/* ── 3D SPATIAL THEATER: Globe in Center, Left Locations, Right Descriptive Dossier ── */}
        <MemorialGlobe
          locations={filteredLocations}
          selectedLocation={selectedLocation}
          onSelectLocation={(loc) => {
            soundEffects.playClick();
            setSelectedLocation(loc);
          }}
          className="w-full h-[680px] sm:h-[720px] lg:h-[780px]"
        >
          {/* Spatial UI Overlays (Pointer events none on outer wrapper, auto on interactive panels) */}
          <div className="absolute inset-0 pointer-events-none p-2 sm:p-4 lg:p-5 flex flex-col justify-between z-10">

            {/* Mobile Top Segmented Tab Switcher (Visible on < lg only) */}
            <div className="lg:hidden flex items-center justify-center pointer-events-auto mb-2">
              <div className="inline-flex items-center gap-1 bg-[#061524]/95 border border-[#C89D56]/40 backdrop-blur-xl p-1 rounded-2xl shadow-xl text-xs font-mono text-white">
                <button
                  type="button"
                  onClick={() => setMobileTab('list')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${mobileTab === 'list'
                    ? 'bg-[#C89D56] text-[#0A2947] shadow-xs'
                    : 'text-[#F3E4C9] hover:bg-white/10'
                    }`}
                >
                  📍 {t.sitesTab} ({filteredLocations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMobileTab('details')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${mobileTab === 'details'
                    ? 'bg-[#C89D56] text-[#0A2947] shadow-xs'
                    : 'text-[#F3E4C9] hover:bg-white/10'
                    }`}
                >
                  📜 {t.dossierTab}
                </button>
                <button
                  type="button"
                  onClick={() => setMobileTab('globe')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${mobileTab === 'globe'
                    ? 'bg-[#C89D56] text-[#0A2947] shadow-xs'
                    : 'text-[#F3E4C9] hover:bg-white/10'
                    }`}
                >
                  🌐 {t.earthTab}
                </button>
              </div>
            </div>

            {/* Main Spatial Stage Layout: Left Panel, Center Globe, Right Panel */}
            <div className="w-full h-full flex justify-between items-start gap-4 overflow-hidden">

              {/* ── LEFT PANEL: Archival Memorials List (Curatorial Obsidian & Gold Glass) ────── */}
              <div className={`w-full sm:w-[350px] lg:w-[370px] xl:w-[400px] h-full flex flex-col pointer-events-auto bg-[#061524]/90 backdrop-blur-xl border border-[#C89D56]/40 shadow-2xl rounded-3xl p-4 sm:p-5 text-white overflow-hidden ${mobileTab === 'list' ? 'flex' : 'hidden lg:flex'}`}>

                {/* Header */}
                <div className="pb-3 border-b border-[#C89D56]/30 space-y-2.5 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-[#C89D56]" />
                      <h2 className="text-xs font-cinzel font-bold uppercase tracking-wider text-[#F3E4C9]">
                        {t.sitesTab} ({filteredLocations.length})
                      </h2>
                    </div>
                  </div>

                  {/* Compact Search Box */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#C89D56]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t.searchMemorialPlaceholder || "Search memorials, cities..."}
                      className="w-full pl-8 pr-3 py-1.5 bg-[#0A2947]/80 border border-[#C89D56]/30 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#C89D56] transition-colors"
                    />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono">
                    {[
                      { id: 'all', label: t.filterAll || 'All' },
                      { id: 'panchtirth', label: t.filterPanchtirth || 'Panchtirth' },
                      { id: 'india', label: t.filterIndia || 'India' },
                      { id: 'international', label: t.filterInternational || 'Global' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          soundEffects.playClick();
                          setActiveFilter(f.id as any);
                        }}
                        className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer ${activeFilter === f.id
                          ? 'bg-[#C89D56] text-[#0A2947] font-bold shadow-xs'
                          : 'bg-[#0A2947]/60 hover:bg-[#0E355C] text-[#F3E4C9]/80 border border-[#C89D56]/20'
                          }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scrollable Memorials Cards */}
                <div className="space-y-2.5 overflow-y-auto pr-1 pt-3 flex-1 custom-scrollbar">
                  {filteredLocations.map((loc) => {
                    const isSelected = selectedLocation?.id === loc.id;
                    const locName = loc.nameLocal?.[language] || loc.name;
                    const locCity = loc.cityLocal?.[language] || loc.city;
                    const locDesc = loc.descriptionLocal?.[language] || loc.description;
                    return (
                      <div
                        key={loc.id}
                        onClick={() => {
                          soundEffects.playClick();
                          if (selectedLocation?.id === loc.id) {
                            setSelectedLocation(null);
                          } else {
                            setSelectedLocation(loc);
                            setMobileTab('details');
                          }
                        }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${isSelected
                          ? 'bg-gradient-to-r from-[#124273] to-[#0A2947] border-2 border-[#C89D56] text-white shadow-lg shadow-[#C89D56]/25 ring-1 ring-[#C89D56]/50 scale-[1.01]'
                          : 'bg-[#0A2947]/45 hover:bg-[#0E355C]/80 border border-[#C89D56]/20 hover:border-[#C89D56]/60 text-white'
                          }`}
                      >
                        <div className="flex gap-3 items-start">
                          {loc.imageUrl && (
                            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#C89D56]/40 bg-[#061524] mt-0.5">
                              <img src={loc.imageUrl} alt={locName} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-serif-editorial font-bold text-sm leading-snug line-clamp-1 text-white">
                                {locName}
                              </h3>
                              <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${isSelected
                                ? 'bg-[#C89D56] text-[#0A2947]'
                                : 'bg-[#0A2947]/80 text-[#C89D56] border border-[#C89D56]/30'
                                }`}>
                                {loc.country}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs font-mono mb-1.5 text-[#C89D56]">
                              <MapPin className="w-3.5 h-3.5 shrink-0 text-[#C89D56]" />
                              <span className="truncate text-[#F3E4C9]/85">{locCity}</span>
                              {isSelected && (
                                <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-amber-300 font-bold font-mono">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                                  Active Pin
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-white/75 line-clamp-2 leading-relaxed font-dmsans">
                              {locDesc}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── RIGHT PANEL: Selected Memorial Descriptive Card (Curatorial Obsidian & Gold Glass) ── */}
              {selectedLocation && (
                <div className={`w-full sm:w-[380px] lg:w-[410px] xl:w-[440px] h-full pointer-events-auto bg-[#061524]/90 backdrop-blur-xl border border-[#C89D56]/40 shadow-2xl rounded-3xl p-5 sm:p-6 text-white flex flex-col justify-between overflow-y-auto animate-in fade-in slide-in-from-right-4 duration-300 ${mobileTab === 'details' ? 'flex' : 'hidden lg:flex'}`}>
                  <div className="space-y-4">

                    {/* Header with Type & Coordinates */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#C89D56] text-[#0A2947] shadow-xs truncate">
                          {selectedLocation.typeLocal?.[language] || selectedLocation.type}
                        </span>

                        <div className="flex items-center gap-2">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${selectedLocation.coordinates.latitude},${selectedLocation.coordinates.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-montserrat font-bold text-[#F3E4C9] hover:text-[#C89D56] transition-colors"
                            title="Open in Google Maps"
                          >
                            <span>{selectedLocation.coordinates.latitude.toFixed(2)}°, {selectedLocation.coordinates.longitude.toFixed(2)}°</span>
                            <ExternalLink className="w-3.5 h-3.5 text-[#C89D56]" />
                          </a>

                          <button
                            type="button"
                            onClick={() => {
                              soundEffects.playClick();
                              setSelectedLocation(null);
                              setMobileTab('list');
                            }}
                            className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            title="Close Dossier"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h2 className="font-serif-editorial text-xl sm:text-2xl font-bold text-white leading-tight">
                        {selectedLocation.nameLocal?.[language] || selectedLocation.name}
                      </h2>
                      <div className="text-xs font-mono text-[#C89D56] mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#C89D56]" />
                        <span className="text-[#F3E4C9]/90">
                          {selectedLocation.cityLocal?.[language] || selectedLocation.city}, {selectedLocation.country}
                        </span>
                      </div>
                    </div>

                    {/* Archival Photographic Plate Banner */}
                    {selectedLocation.imageUrl && (
                      <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-[#C89D56]/40 shadow-inner group bg-[#061524]">
                        <img 
                          src={selectedLocation.imageUrl} 
                          alt={selectedLocation.nameLocal?.[language] || selectedLocation.name}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#061524]/90 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-2 left-3 right-3 text-[11px] font-mono text-[#F3E4C9] flex items-center justify-between">
                          <span className="truncate">Archival Photographic Plate</span>
                          <span className="text-[#C89D56] font-bold">Verified Heritage Lineage</span>
                        </div>
                      </div>
                    )}

                    {/* Verified Memorial Status Line */}
                    <div className="p-3.5 rounded-2xl bg-[#0A2947]/70 border border-[#C89D56]/30 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#C89D56]/20 border border-[#C89D56]/40 text-[#F3E4C9] flex items-center justify-center font-bold">
                          <Landmark className="w-4 h-4 text-[#C89D56]" />
                        </div>
                        <div>
                          <div className="text-white font-bold text-xs">{t.geographicCoordinates || "Geographic Lineage Point"}</div>
                          <div className="text-[#C89D56] text-[10px]">National Digital Heritage Registry</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Active Site</span>
                        </div>
                      </div>
                    </div>

                    {/* Curatorial Summary & History */}
                    <div className="space-y-1">
                      <h4 className="text-xs font-mono font-bold uppercase text-[#C89D56] tracking-wider">
                        {t.documentInfo || "Curatorial Summary & History"}
                      </h4>
                      <p className="text-xs sm:text-sm text-white/85 leading-relaxed font-dmsans">
                        {selectedLocation.descriptionLocal?.[language] || selectedLocation.description}
                      </p>
                    </div>

                    {/* Historical Significance Callout */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-[#C89D56]/15 via-[#8B5E3C]/10 to-transparent border border-[#C89D56]/40 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-montserrat font-bold text-[#F3E4C9] uppercase">
                        <Award className="w-3.5 h-3.5 text-[#C89D56]" />
                        <span>{t.historicalSignificance}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#FAF7F0] italic leading-relaxed font-dmsans">
                        &quot;{selectedLocation.historicalSignificanceLocal?.[language] || selectedLocation.historical_significance}&quot;
                      </p>
                    </div>

                    {/* Linked Primary Archival Volumes */}
                    {selectedLocation.related_documents && selectedLocation.related_documents.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-[#C89D56]/30">
                        <h4 className="text-xs font-mono font-bold uppercase text-[#C89D56] flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-[#C89D56]" />
                          <span>{t.archivalPrimarySources} ({selectedLocation.related_documents.length})</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedLocation.related_documents.map((docId) => (
                            <a
                              key={docId}
                              href={`/documents/${docId}`}
                              onClick={(e) => {
                                if (onOpenDocument) {
                                  e.preventDefault();
                                  onOpenDocument(docId);
                                }
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#0A2947]/80 hover:bg-[#124273] border border-[#C89D56]/30 hover:border-[#C89D56] text-xs font-mono font-bold text-[#F3E4C9] flex items-center gap-1.5 transition-colors cursor-pointer group"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-[#C89D56] group-hover:text-white" />
                              <span>{docId}</span>
                              <span className="text-[10px] text-[#C89D56]">›</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Bottom AI Consultation Button */}
                  <div className="pt-3 mt-3 border-t border-[#C89D56]/30">
                    <a
                      href={`/assistant?q=${encodeURIComponent(`Explain the historical and political significance of ${selectedLocation.name} in Dr. B. R. Ambedkar's life and work.`)}`}
                      onClick={(e) => {
                        if (onAskAIAboutLocation) {
                          e.preventDefault();
                          onAskAIAboutLocation(selectedLocation.name);
                        }
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C89D56] via-[#D4A373] to-[#8B5E3C] hover:brightness-110 text-[#0A2947] font-montserrat font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#0A2947]" />
                      <span>{t.consultAIScholar}</span>
                    </a>
                  </div>

                </div>
              )}

            </div>

          </div>
        </MemorialGlobe>

      </div>
    </div>
  );
};

export default MemorialsView;
