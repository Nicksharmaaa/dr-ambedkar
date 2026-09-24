"""
Phase 9: Seed Multilingual Localizations for Knowledge Graph & Timeline
Populates localized canonical names and titles for English, Hindi, and Marathi.
"""
from __future__ import annotations

import logging
import uuid
from app.db.database import DatabaseClient

logger = logging.getLogger("ambedkar.multilingual.seed")

ENTITY_LOCALIZATIONS = [
    # Dr. B.R. Ambedkar
    {"entity_id": "person-ambedkar", "language": "hi", "localized_name": "डॉ. भीमराव रामजी आंबेडकर", "localized_description": "भारतीय संविधान के मुख्य शिल्पकार, विधिवेत्ता, अर्थशास्त्री एवं समाज सुधारक।"},
    {"entity_id": "person-ambedkar", "language": "mr", "localized_name": "डॉ. बाबासाहेब आंबेडकर", "localized_description": "भारतीय राज्यघटनेचे शिल्पकार, थोर कायदेतज्ज्ञ, अर्थशास्त्रज्ञ व समाजक्रांतिकारक."},

    # Works
    {"entity_id": "work-annihilation", "language": "hi", "localized_name": "जाति का विनाश (Annihilation of Caste)", "localized_description": "1936 का युगांतरकारी ग्रंथ जो जाति व्यवस्था और शास्त्रों पर प्रहार करता है।"},
    {"entity_id": "work-annihilation", "language": "mr", "localized_name": "जातीचा उच्छेद (Annihilation of Caste)", "localized_description": "1936 मधील ऐतिहासिक भाषण व प्रबंध, ज्यामध्ये विषमतेच्या शास्त्रीय मुळांवर आघात केला आहे."},

    {"entity_id": "work-problem-of-rupee", "language": "hi", "localized_name": "रुपये की समस्या (The Problem of the Rupee)", "localized_description": "1923 का लंदन स्कूल ऑफ इकोनॉमिक्स डॉक्टरेट शोध प्रबंध जिसने भारतीय रिजर्व बैंक की नींव रखी।"},
    {"entity_id": "work-problem-of-rupee", "language": "mr", "localized_name": "रुपयाचा प्रश्न (The Problem of the Rupee)", "localized_description": "लंडन स्कूल ऑफ इकॉनॉमिक्समधील डी.एस्सी. प्रबंध, ज्याने रिझर्व्ह बँकेच्या स्थापनेला पाया दिला."},

    # Concepts
    {"entity_id": "concept-constitutional-morality", "language": "hi", "localized_name": "संवैधानिक नैतिकता", "localized_description": "बहुमत के आवेगों पर लोकतांत्रिक संस्थाओं और नियमों का सर्वोच्च नियंत्रण।"},
    {"entity_id": "concept-constitutional-morality", "language": "mr", "localized_name": "घटनात्मक नैतिकता", "localized_description": "लोकशाही संस्था, संकेत आणि कायद्याचे सर्वोच्च पालन."},

    {"entity_id": "concept-social-endosmosis", "language": "hi", "localized_name": "सामाजिक अंतःप्रसरण (Social Endosmosis)", "localized_description": "समाज के विभिन्न वर्गों के बीच अनुभवों और हितों का अबाध आदान-प्रदान।"},
    {"entity_id": "concept-social-endosmosis", "language": "mr", "localized_name": "सामाजिक परासरण (Social Endosmosis)", "localized_description": "विविध सामाजिक घटकांमधील अखंड संवाद आणि सहजीवन."},

    # Events
    {"entity_id": "event-mahad", "language": "hi", "localized_name": "महाड़ सत्याग्रह (1927)", "localized_description": "चवदार तालाब के सार्वजनिक जल स्रोत पर मानवाधिकारों की ऐतिहासिक उद्घोषणा।"},
    {"entity_id": "event-mahad", "language": "mr", "localized_name": "महाड चवदार तळे सत्याग्रह (1927)", "localized_description": "पाण्याच्या हक्कासाठी व मानवी समानतेसाठी झालेला जगातील पहिला मानवाधिकार लढा."},

    {"entity_id": "event-conversion-1956", "language": "hi", "localized_name": "नागपुर बौद्ध धम्म दीक्षा (1956)", "localized_description": "दीक्षाभूमि नागपुर में 5 लाख अनुयायियों के साथ बौद्ध धर्म ग्रहण।"},
    {"entity_id": "event-conversion-1956", "language": "mr", "localized_name": "नागपूर धम्मदीक्षा सोहळा (1956)", "localized_description": "दीक्षाभूमी नागपूर येथे लाखो अनुयायांसह बुद्ध धम्माचा ऐतिहासिक स्वीकार."},
]

TIMELINE_LOCALIZATIONS = [
    {
        "event_id": "event-1891-birth",
        "language": "hi",
        "localized_title": "महू में भीमराव रामजी आंबेडकर का जन्म",
        "localized_description": "14 अप्रैल 1891 को मध्य प्रांत के महू छावनी में रामजी सकपाल और भीमाबाई के 14वें बच्चे के रूप में जन्म।",
    },
    {
        "event_id": "event-1891-birth",
        "language": "mr",
        "localized_title": "महू येथे भीमराव रामजी आंबेडकर यांचा जन्म",
        "localized_description": "14 एप्रिल 1891 रोजी महू लष्करी छावणीत रामजी सकपाळ आणि भीमाबाई यांच्या पोटी जन्म.",
    },
    {
        "event_id": "event-1927-mahad-water",
        "language": "hi",
        "localized_title": "महाड़ चवदार तालाब सत्याग्रह",
        "localized_description": "सार्वजनिक जल स्रोत पर अछूतों के मूलभूत मानवीय अधिकारों की घोषणा करते हुए चवदार तालाब का जल ग्रहण किया।",
    },
    {
        "event_id": "event-1927-mahad-water",
        "language": "mr",
        "localized_title": "ऐतिहासिक महाड चवदार तळे सत्याग्रह",
        "localized_description": "चवदार तळ्याचे पाणी पिऊन मानवी हक्क आणि सामाजिक समतेची सिंहगर्जना केली.",
    },
    {
        "event_id": "event-1947-drafting-chair",
        "language": "hi",
        "localized_title": "संविधान प्रारूप समिति के अध्यक्ष नियुक्त",
        "localized_description": "29 अगस्त 1947 को स्वतंत्र भारत के संविधान निर्माण हेतु प्रारूप समिति के अध्यक्ष चुने गए।",
    },
    {
        "event_id": "event-1947-drafting-chair",
        "language": "mr",
        "localized_title": "मसुदा समितीचे अध्यक्ष म्हणून नियुक्ती",
        "localized_description": "29 ऑगस्ट 1947 रोजी भारतीय राज्यघटनेच्या मसुदा समितीचे अध्यक्ष म्हणून निवड.",
    },
    {
        "event_id": "event-1956-dhamma-conversion",
        "language": "hi",
        "localized_title": "नागपुर में ऐतिहासिक बौद्ध धम्म दीक्षा",
        "localized_description": "14 अक्टूबर 1956 को दीक्षाभूमि, नागपुर में 5 लाख अनुयायियों के साथ 22 प्रतिज्ञाएं लेकर बौद्ध धर्म अंगीकार किया।",
    },
    {
        "event_id": "event-1956-dhamma-conversion",
        "language": "mr",
        "localized_title": "दीक्षाभूमी नागपूर येथे ऐतिहासिक धम्मक्रांती",
        "localized_description": "14 ऑक्टोबर 1956 रोजी नागपूर येथे 22 प्रतिज्ञांसह बौद्ध धम्माची दीक्षा घेतली.",
    },
]


async def seed_multilingual_localizations(db: DatabaseClient) -> dict[str, int]:
    """Seed entity and timeline localizations into Turso Cloud."""
    ent_count = 0
    for el in ENTITY_LOCALIZATIONS:
        lid = str(uuid.uuid4())
        await db.execute(
            """
            INSERT OR REPLACE INTO entity_localizations (id, entity_id, language, localized_name, localized_description, created_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
            """,
            [lid, el["entity_id"], el["language"], el["localized_name"], el.get("localized_description")],
        )
        ent_count += 1

    time_count = 0
    for tl in TIMELINE_LOCALIZATIONS:
        lid = str(uuid.uuid4())
        await db.execute(
            """
            INSERT OR REPLACE INTO timeline_localizations (id, event_id, language, localized_title, localized_description, created_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
            """,
            [lid, tl["event_id"], tl["language"], tl["localized_title"], tl.get("localized_description")],
        )
        time_count += 1

    return {"entity_localizations": ent_count, "timeline_localizations": time_count}
