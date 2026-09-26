PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE archival_objects (
    id                  TEXT PRIMARY KEY,
    collection_id       TEXT REFERENCES collections(id),
    stable_id           TEXT UNIQUE NOT NULL,
    title               TEXT NOT NULL,
    subtitle            TEXT,
    object_type         TEXT NOT NULL DEFAULT 'book',
    language            TEXT NOT NULL DEFAULT 'en',
    source_institution  TEXT NOT NULL DEFAULT '',
    provenance          TEXT NOT NULL DEFAULT '',
    rights_status       TEXT NOT NULL DEFAULT 'unknown',
    creator             TEXT,
    publisher           TEXT,
    publication_date    TEXT,
    description         TEXT,
    subject_keywords    TEXT,
    physical_description TEXT,
    review_status       TEXT NOT NULL DEFAULT 'pending',
    publication_status  TEXT NOT NULL DEFAULT 'draft',
    file_hash           TEXT,
    file_size_bytes     INTEGER,
    original_filename   TEXT,
    original_file_key   TEXT,
    page_count          INTEGER,
    metadata_json       TEXT,
    created_at          TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO "archival_objects" VALUES('AMBEDKAR-VOL-01',NULL,'AMBEDKAR-VOL-01','Castes in India, Annihilation of Caste, Federation versus Freedom','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 1','writings','en','Government of Maharashtra (BAWS)','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 1','public_domain','Dr. B.R. Ambedkar','Dr. Babasaheb Ambedkar Source Material Publication Committee',NULL,NULL,NULL,NULL,'curator_verified','published',NULL,NULL,NULL,NULL,500,NULL,'2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "archival_objects" VALUES('AMBEDKAR-VOL-02',NULL,'AMBEDKAR-VOL-02','Who Were the Shudras? / Which Way Emancipation?','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 2','writings','en','Government of Maharashtra (BAWS)','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 2','public_domain','Dr. B.R. Ambedkar','Dr. Babasaheb Ambedkar Source Material Publication Committee',NULL,NULL,NULL,NULL,'curator_verified','published',NULL,NULL,NULL,NULL,500,NULL,'2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "archival_objects" VALUES('AMBEDKAR-VOL-03',NULL,'AMBEDKAR-VOL-03','Philosophy of Hinduism, India and the Pre-requisites of Communism, Revolution and Counter-Revolution','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 3','writings','en','Government of Maharashtra (BAWS)','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 3','public_domain','Dr. B.R. Ambedkar','Dr. Babasaheb Ambedkar Source Material Publication Committee',NULL,NULL,NULL,NULL,'curator_verified','published',NULL,NULL,NULL,NULL,500,NULL,'2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "archival_objects" VALUES('AMBEDKAR-VOL-04',NULL,'AMBEDKAR-VOL-04','Riddles in Hinduism','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 4','writings','en','Government of Maharashtra (BAWS)','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 4','public_domain','Dr. B.R. Ambedkar','Dr. Babasaheb Ambedkar Source Material Publication Committee',NULL,NULL,NULL,NULL,'curator_verified','published',NULL,NULL,NULL,NULL,500,NULL,'2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "archival_objects" VALUES('AMBEDKAR-VOL-05',NULL,'AMBEDKAR-VOL-05','Untouchables and the Pax Britannica / The Untouchables or the Children of India''s Ghetto','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 5','writings','en','Government of Maharashtra (BAWS)','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 5','public_domain','Dr. B.R. Ambedkar','Dr. Babasaheb Ambedkar Source Material Publication Committee',NULL,NULL,NULL,NULL,'curator_verified','published',NULL,NULL,NULL,NULL,500,NULL,'2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "archival_objects" VALUES('AMBEDKAR-VOL-06',NULL,'AMBEDKAR-VOL-06','Administration and Finance of the East India Company, The Evolution of Provincial Finance in British India','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 6','writings','en','Government of Maharashtra (BAWS)','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 6','public_domain','Dr. B.R. Ambedkar','Dr. Babasaheb Ambedkar Source Material Publication Committee',NULL,NULL,NULL,NULL,'curator_verified','published',NULL,NULL,NULL,NULL,500,NULL,'2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "archival_objects" VALUES('AMBEDKAR-VOL-07',NULL,'AMBEDKAR-VOL-07','Who Were the Shudras? / The Untouchables: Who Were They and Why They Became Untouchables?','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 7','writings','en','Government of Maharashtra (BAWS)','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 7','public_domain','Dr. B.R. Ambedkar','Dr. Babasaheb Ambedkar Source Material Publication Committee',NULL,NULL,NULL,NULL,'curator_verified','published',NULL,NULL,NULL,NULL,500,NULL,'2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "archival_objects" VALUES('AMBEDKAR-VOL-08',NULL,'AMBEDKAR-VOL-08','Pakistan or the Partition of India','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 8','writings','en','Government of Maharashtra (BAWS)','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 8','public_domain','Dr. B.R. Ambedkar','Dr. Babasaheb Ambedkar Source Material Publication Committee',NULL,NULL,NULL,NULL,'curator_verified','published',NULL,NULL,NULL,NULL,500,NULL,'2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "archival_objects" VALUES('AMBEDKAR-VOL-09',NULL,'AMBEDKAR-VOL-09','What Congress and Gandhi Have Done to the Untouchables / Mr. Gandhi and the Emancipation of the Untouchables','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 9','writings','en','Government of Maharashtra (BAWS)','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 9','public_domain','Dr. B.R. Ambedkar','Dr. Babasaheb Ambedkar Source Material Publication Committee',NULL,NULL,NULL,NULL,'curator_verified','published',NULL,NULL,NULL,NULL,500,NULL,'2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "archival_objects" VALUES('AMBEDKAR-VOL-10',NULL,'AMBEDKAR-VOL-10','Dr. Ambedkar as Member of the Governor-General''s Executive Council (1942-46)','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 10','writings','en','Government of Maharashtra (BAWS)','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 10','public_domain','Dr. B.R. Ambedkar','Dr. Babasaheb Ambedkar Source Material Publication Committee',NULL,NULL,NULL,NULL,'curator_verified','published',NULL,NULL,NULL,NULL,500,NULL,'2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "archival_objects" VALUES('AMBEDKAR-VOL-11',NULL,'AMBEDKAR-VOL-11','The Buddha and His Dhamma','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 11','writings','en','Government of Maharashtra (BAWS)','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 11','public_domain','Dr. B.R. Ambedkar','Dr. Babasaheb Ambedkar Source Material Publication Committee',NULL,NULL,NULL,NULL,'curator_verified','published',NULL,NULL,NULL,NULL,500,NULL,'2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "archival_objects" VALUES('AMBEDKAR-VOL-12',NULL,'AMBEDKAR-VOL-12','Unpublished Writings: Ancient Indian Commerce, The Untouchables and the Pax Britannica','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 12','writings','en','Government of Maharashtra (BAWS)','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 12','public_domain','Dr. B.R. Ambedkar','Dr. Babasaheb Ambedkar Source Material Publication Committee',NULL,NULL,NULL,NULL,'curator_verified','published',NULL,NULL,NULL,NULL,500,NULL,'2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "archival_objects" VALUES('AMBEDKAR-VOL-13',NULL,'AMBEDKAR-VOL-13','Dr. Ambedkar The Principal Architect of the Constitution of India','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 13','writings','en','Government of Maharashtra (BAWS)','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 13','public_domain','Dr. B.R. Ambedkar','Dr. Babasaheb Ambedkar Source Material Publication Committee',NULL,NULL,NULL,NULL,'curator_verified','published',NULL,NULL,NULL,NULL,500,NULL,'2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "archival_objects" VALUES('AMBEDKAR-VOL-14-P1',NULL,'AMBEDKAR-VOL-14-P1','Dr. Ambedkar and The Hindu Code Bill (Part 1)','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 14 Part 1','writings','en','Government of Maharashtra (BAWS)','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 14','public_domain','Dr. B.R. Ambedkar','Dr. Babasaheb Ambedkar Source Material Publication Committee',NULL,NULL,NULL,NULL,'curator_verified','published',NULL,NULL,NULL,NULL,500,NULL,'2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "archival_objects" VALUES('AMBEDKAR-VOL-14-P2',NULL,'AMBEDKAR-VOL-14-P2','Dr. Ambedkar and The Hindu Code Bill (Part 2)','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 14 Part 2','writings','en','Government of Maharashtra (BAWS)','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 14','public_domain','Dr. B.R. Ambedkar','Dr. Babasaheb Ambedkar Source Material Publication Committee',NULL,NULL,NULL,NULL,'curator_verified','published',NULL,NULL,NULL,NULL,500,NULL,'2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "archival_objects" VALUES('AMBEDKAR-VOL-15',NULL,'AMBEDKAR-VOL-15','Dr. Ambedkar as Free India''s First Law Minister and Member of Opposition in Parliament','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 15','writings','en','Government of Maharashtra (BAWS)','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 15','public_domain','Dr. B.R. Ambedkar','Dr. Babasaheb Ambedkar Source Material Publication Committee',NULL,NULL,NULL,NULL,'curator_verified','published',NULL,NULL,NULL,NULL,500,NULL,'2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "archival_objects" VALUES('AMBEDKAR-VOL-16',NULL,'AMBEDKAR-VOL-16','Dr. B.R. Ambedkar and his Egalitarian Revolution - Speeches in Parliament & Public Addresses','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 16','writings','en','Government of Maharashtra (BAWS)','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 16','public_domain','Dr. B.R. Ambedkar','Dr. Babasaheb Ambedkar Source Material Publication Committee',NULL,NULL,NULL,NULL,'curator_verified','published',NULL,NULL,NULL,NULL,500,NULL,'2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "archival_objects" VALUES('AMBEDKAR-VOL-17-P1',NULL,'AMBEDKAR-VOL-17-P1','Dr. B.R. Ambedkar and his Egalitarian Revolution (Part 1)','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 17 Part 1','writings','en','Government of Maharashtra (BAWS)','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 17','public_domain','Dr. B.R. Ambedkar','Dr. Babasaheb Ambedkar Source Material Publication Committee',NULL,NULL,NULL,NULL,'curator_verified','published',NULL,NULL,NULL,NULL,500,NULL,'2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "archival_objects" VALUES('AMBEDKAR-VOL-17-P2',NULL,'AMBEDKAR-VOL-17-P2','Dr. B.R. Ambedkar and his Egalitarian Revolution (Part 2)','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 17 Part 2','writings','en','Government of Maharashtra (BAWS)','Dr. Babasaheb Ambedkar: Writings and Speeches Vol 17','public_domain','Dr. B.R. Ambedkar','Dr. Babasaheb Ambedkar Source Material Publication Committee',NULL,NULL,NULL,NULL,'curator_verified','published',NULL,NULL,NULL,NULL,500,NULL,'2026-09-26 09:05:31','2026-09-26 09:05:31');
CREATE TABLE audit_events (
    id          TEXT PRIMARY KEY,
    user_id     TEXT,
    action      TEXT NOT NULL,
    resource    TEXT NOT NULL,
    resource_id TEXT,
    details     TEXT,
    ip_address  TEXT,
    user_agent  TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE collections (
    id              TEXT PRIMARY KEY,
    slug            TEXT UNIQUE NOT NULL,
    title           TEXT NOT NULL,
    description     TEXT,
    cover_image_key TEXT,
    display_order   INTEGER NOT NULL DEFAULT 0,
    is_public       INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE concepts (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    definition  TEXT,
    domain      TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE digital_files (
    id TEXT PRIMARY KEY,
    archival_object_id TEXT REFERENCES archival_objects(id),
    file_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    byte_size INTEGER,
    sha256_hash TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE document_chunks (
    id              TEXT PRIMARY KEY,
    object_id       TEXT NOT NULL REFERENCES archival_objects(id),
    page_id         TEXT REFERENCES pages(id),
    section_id      TEXT REFERENCES document_sections(id),
    chunk_index     INTEGER NOT NULL,
    text            TEXT NOT NULL,
    language        TEXT NOT NULL DEFAULT 'en',
    token_count     INTEGER,
    char_count      INTEGER,
    volume_number   TEXT,
    page_number     INTEGER,
    section_title   TEXT,
    is_header       INTEGER NOT NULL DEFAULT 0,
    is_footnote     INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE document_sections (
    id            TEXT PRIMARY KEY,
    object_id     TEXT NOT NULL REFERENCES archival_objects(id),
    parent_id     TEXT REFERENCES document_sections(id),
    section_num   TEXT,
    title         TEXT NOT NULL,
    start_page    INTEGER,
    end_page      INTEGER,
    depth         INTEGER NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE embeddings (
    id          TEXT PRIMARY KEY,
    chunk_id    TEXT NOT NULL REFERENCES document_chunks(id) ON DELETE CASCADE,
    model_name  TEXT NOT NULL,
    embedding_version TEXT NOT NULL DEFAULT 'v1',
    dimension   INTEGER NOT NULL DEFAULT 1024,
    embedding_json TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE entities (
    id                   TEXT PRIMARY KEY,
    entity_type          TEXT NOT NULL,
    canonical_name       TEXT NOT NULL,
    description          TEXT,
    source               TEXT NOT NULL DEFAULT 'archival_corpus',
    status               TEXT NOT NULL DEFAULT 'CANDIDATE',
    date                 TEXT,
    date_precision       TEXT DEFAULT 'YEAR',
    language             TEXT DEFAULT 'en',
    location             TEXT,
    aliases              TEXT,
    external_identifiers TEXT,
    rights               TEXT DEFAULT 'public_domain',
    object_id            TEXT REFERENCES archival_objects(id),
    created_at           TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at           TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO "entities" VALUES('person-ambedkar','PERSON','Dr. B.R. Ambedkar','Chief Architect of the Constitution of India, jurist, economist, scholar, and social revolutionary.','archival_corpus','VERIFIED','1891-04-14','DAY','en','Mhow, Central Provinces',NULL,'{"wikidata": "Q2339", "viaf": "2609992"}','public_domain','AMBEDKAR-VOL-01','2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "entities" VALUES('person-gandhi','PERSON','Mahatma Gandhi','Leader of the Indian nationalist movement, signatory to the Poona Pact of 1932 with Dr. Ambedkar.','archival_corpus','VERIFIED','1869-10-02','DAY','en','Porbandar, Gujarat',NULL,'{"wikidata": "Q1001"}','public_domain','AMBEDKAR-VOL-01','2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "entities" VALUES('person-dewey','PERSON','Prof. John Dewey','American philosopher and educator at Columbia University whose pragmatism shaped Dr. Ambedkar''s democratic theory.','archival_corpus','VERIFIED','1859-10-20','DAY','en','Burlington, Vermont',NULL,'{"wikidata": "Q132543"}','public_domain','AMBEDKAR-VOL-01','2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "entities" VALUES('person-nehru','PERSON','Jawaharlal Nehru','First Prime Minister of India, who invited Dr. Ambedkar to serve as India''s first Law Minister.','archival_corpus','VERIFIED','1889-11-14','DAY','en','Allahabad, United Provinces',NULL,'{"wikidata": "Q1047"}','public_domain','AMBEDKAR-VOL-13','2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "entities" VALUES('work-annihilation','WORK','Annihilation of Caste','1936 undelivered presidential address written for the Jat-Pat-Todak Mandal of Lahore, analyzing caste endogamy and shastric authority.','archival_corpus','VERIFIED','1936','YEAR','en','Lahore / Bombay',NULL,'{}','public_domain','AMBEDKAR-VOL-01','2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "entities" VALUES('work-castes-in-india','WORK','Castes in India: Their Mechanism, Genesis and Development','1916 paper presented at the Columbia University Anthropology Seminar under Alexander Goldenweiser, establishing endogamy as caste mechanism.','archival_corpus','VERIFIED','1916-05-09','DAY','en','Columbia University, New York',NULL,'{}','public_domain','AMBEDKAR-VOL-01','2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "entities" VALUES('work-problem-of-rupee','WORK','The Problem of the Rupee: Its Origin and Its Solution','1923 doctoral dissertation at the London School of Economics examining British colonial currency policy and exchange standards.','archival_corpus','VERIFIED','1923','YEAR','en','London School of Economics',NULL,'{}','public_domain','AMBEDKAR-VOL-06','2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "entities" VALUES('work-states-minorities','WORK','States and Minorities','1947 memorandum submitted to the Constituent Assembly proposing a constitutional framework for State Socialism and minority protection.','archival_corpus','VERIFIED','1947','YEAR','en','New Delhi',NULL,'{}','public_domain','AMBEDKAR-VOL-01','2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "entities" VALUES('work-riddles-in-hinduism','WORK','Riddles in Hinduism','Philosophical and historical critique investigating contradictions in traditional brahmanical scriptures and epics.','archival_corpus','VERIFIED','1954','APPROXIMATE','en','Bombay',NULL,'{}','public_domain','AMBEDKAR-VOL-04','2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "entities" VALUES('work-buddha-and-dhamma','WORK','The Buddha and His Dhamma','Magnum opus rationalist reinterpretation of Buddhism emphasizing ethical morality (Dhamma) over religious ritualism.','archival_corpus','VERIFIED','1957','YEAR','en','Bombay / Nagpur',NULL,'{}','public_domain','AMBEDKAR-VOL-11','2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "entities" VALUES('org-columbia','ORGANIZATION','Columbia University','New York university where Dr. Ambedkar studied economics, politics, sociology, and philosophy (1913-1916).','archival_corpus','VERIFIED','1754','YEAR','en','New York City, USA',NULL,'{}','public_domain','AMBEDKAR-VOL-01','2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "entities" VALUES('org-lse','ORGANIZATION','London School of Economics','Premier British institution where Dr. Ambedkar completed his M.Sc. and D.Sc. in Economics.','archival_corpus','VERIFIED','1895','YEAR','en','London, UK',NULL,'{}','public_domain','AMBEDKAR-VOL-06','2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "entities" VALUES('org-drafting-committee','ORGANIZATION','Drafting Committee of the Constituent Assembly','Constitutional committee established on 29 August 1947, chaired by Dr. B.R. Ambedkar to draft the Constitution of India.','archival_corpus','VERIFIED','1947-08-29','DAY','en','Constitution Hall, New Delhi',NULL,'{}','public_domain','AMBEDKAR-VOL-13','2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "entities" VALUES('org-rbi','ORGANIZATION','Reserve Bank of India','Central banking institution formed in 1935 following the Hilton-Young Commission, conceptually founded on Ambedkar''s currency treatise.','archival_corpus','VERIFIED','1935-04-01','DAY','en','Calcutta / Bombay',NULL,'{}','public_domain','AMBEDKAR-VOL-01','2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "entities" VALUES('org-bahishkrit-sabha','ORGANIZATION','Bahishkrit Hitakarini Sabha','Socio-political organization founded by Dr. Ambedkar on 20 July 1924 with the motto: ''Educate, Agitate, Organise''.','archival_corpus','VERIFIED','1924-07-20','DAY','en','Damodar Hall, Parel, Bombay',NULL,'{}','public_domain','AMBEDKAR-VOL-17-P1','2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "entities" VALUES('event-mahad','EVENT','Mahad Satyagraha','Historic civil rights movement asserting public access to water at Chhadar Tank in Mahad, Maharashtra.','archival_corpus','VERIFIED','1927-03-20','DAY','en','Mahad, Kolaba District',NULL,'{}','public_domain','AMBEDKAR-VOL-17-P1','2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "entities" VALUES('event-manusmriti-dahan','EVENT','Manusmriti Dahan Din','Public ceremonial burning of the Manusmriti code in Mahad on 25 December 1927 as a declaration of universal human equality.','archival_corpus','VERIFIED','1927-12-25','DAY','en','Mahad, Kolaba District',NULL,'{}','public_domain','AMBEDKAR-VOL-17-P1','2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "entities" VALUES('event-poona-pact','EVENT','Poona Pact','Agreement negotiated between Dr. Ambedkar and caste Hindu leaders at Yerwada Central Jail securing reserved seats for Depressed Classes.','archival_corpus','VERIFIED','1932-09-24','DAY','en','Yerwada Central Jail, Poona',NULL,'{}','public_domain','AMBEDKAR-VOL-01','2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "entities" VALUES('event-round-table','EVENT','Round Table Conferences','Three peace conferences organized by the British Government in London to discuss constitutional reforms for India.','archival_corpus','VERIFIED','1930','RANGE','en','St. James''s Palace, London',NULL,'{}','public_domain','AMBEDKAR-VOL-01','2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "entities" VALUES('event-conversion-1956','EVENT','Nagpur Buddhist Conversion','Mass conversion ceremony at Deekshabhoomi, Nagpur on 14 October 1956 where Dr. Ambedkar and 500,000 followers embraced Buddhism.','archival_corpus','VERIFIED','1956-10-14','DAY','en','Deekshabhoomi, Nagpur',NULL,'{}','public_domain','AMBEDKAR-VOL-11','2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "entities" VALUES('concept-social-endosmosis','CONCEPT','Social Endosmosis','The continuous, unobstructed communication and sharing of varied interests and experiences across diverse social groups as the essence of democracy.','archival_corpus','VERIFIED','1916','YEAR','en',NULL,NULL,'{}','public_domain','AMBEDKAR-VOL-01','2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "entities" VALUES('concept-constitutional-morality','CONCEPT','Constitutional Morality','Strict adherence to democratic norms, checks and balances, and institutional restraint over majoritarian populist impulses.','archival_corpus','VERIFIED','1948-11-04','DAY','en',NULL,NULL,'{}','public_domain','AMBEDKAR-VOL-13','2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "entities" VALUES('concept-liberty-equality-fraternity','CONCEPT','Liberty, Equality, Fraternity','The interdependent ''union of trinity'' defining social democracy, where no single principle can be divorced from the others without destroying freedom.','archival_corpus','VERIFIED','1949-11-25','DAY','en',NULL,NULL,'{}','public_domain','AMBEDKAR-VOL-13','2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "entities" VALUES('concept-state-socialism','CONCEPT','State Socialism','Constitutional requirement that basic industries, land, and insurance be owned and operated by the State to guarantee economic freedom.','archival_corpus','VERIFIED','1947','YEAR','en',NULL,NULL,'{}','public_domain','AMBEDKAR-VOL-01','2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "entities" VALUES('concept-annihilation-of-caste','CONCEPT','Annihilation of Caste Doctrine','The structural imperative to destroy the religious sanctions and scriptures underpinning the graded inequality of the caste hierarchy.','archival_corpus','VERIFIED','1936','YEAR','en',NULL,NULL,'{}','public_domain','AMBEDKAR-VOL-01','2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "entities" VALUES('place-bombay','PLACE','Bombay (Mumbai)','Primary base of Dr. Ambedkar''s legal practice, educational institutions, social movements, and Rajgriha residence.','archival_corpus','VERIFIED',NULL,'YEAR','en','Maharashtra, India',NULL,'{}','public_domain','AMBEDKAR-VOL-17-P1','2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "entities" VALUES('place-nagpur','PLACE','Nagpur','Historical Buddhist center and venue of the mass Dhamma Diksha conversion ceremony on Vijayadashami 1956.','archival_corpus','VERIFIED',NULL,'YEAR','en','Maharashtra, India',NULL,'{}','public_domain','AMBEDKAR-VOL-11','2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "entities" VALUES('place-london','PLACE','London','Venue of Dr. Ambedkar''s legal and economic education (Gray''s Inn, LSE) and the historic Round Table Conferences.','archival_corpus','VERIFIED',NULL,'YEAR','en','United Kingdom',NULL,'{}','public_domain','AMBEDKAR-VOL-06','2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "entities" VALUES('place-new-york','PLACE','New York City','City where Dr. Ambedkar lived while pursuing doctoral studies at Columbia University from 1913 to 1916.','archival_corpus','VERIFIED',NULL,'YEAR','en','New York, USA',NULL,'{}','public_domain','AMBEDKAR-VOL-01','2026-09-26 09:05:31','2026-09-26 09:05:31');
INSERT INTO "entities" VALUES('place-mhow','PLACE','Mhow (Dr. Ambedkar Nagar)','Birthplace of Dr. B.R. Ambedkar on 14 April 1891 in the military cantonment of the Central Provinces.','archival_corpus','VERIFIED',NULL,'YEAR','en','Madhya Pradesh, India',NULL,'{}','public_domain','AMBEDKAR-VOL-01','2026-09-26 09:05:31','2026-09-26 09:05:31');
CREATE TABLE entity_aliases (
    id         TEXT PRIMARY KEY,
    entity_id  TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    alias      TEXT NOT NULL,
    alias_type TEXT DEFAULT 'variant',
    language   TEXT DEFAULT 'en',
    confidence REAL DEFAULT 1.0,
    created_at TEXT DEFAULT (datetime('now'))
);
INSERT INTO "entity_aliases" VALUES('cfc0d5df-3b3e-4e79-8ae4-de2e2dd2cbb6','person-ambedkar','B. R. Ambedkar','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('e39ba504-c3c0-4e09-a183-42071f67667a','person-ambedkar','B R Ambedkar','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('a3090fa7-61c3-4b1a-a939-a8bcc7272544','person-ambedkar','Dr. B. R. Ambedkar','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('aab33a19-8717-424c-92a9-0372f14b8b05','person-ambedkar','Dr Bhimrao Ramji Ambedkar','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('436867fc-41da-4502-92a2-a1ad9af2a255','person-ambedkar','Babasaheb','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('a2f330c3-5a67-403d-a335-a934c3bae8d5','person-ambedkar','Babasaheb Ambedkar','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('5b58cdcb-fad0-4f17-b32e-2fa50ede305c','person-gandhi','M. K. Gandhi','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('73f000b1-4243-4087-a9b8-bc626c24ec98','person-gandhi','Mohandas Karamchand Gandhi','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('eb59b91f-fa68-40bb-9af3-d40ce30b2816','person-gandhi','Mahatma Gandhi','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('9329999f-3f33-45c0-86c2-003fc712b658','person-gandhi','Mr. Gandhi','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('4c9ec0ae-d025-4f56-a964-09a94067c7d5','person-dewey','John Dewey','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('d09c49e8-acf7-4265-867d-791e3a84fe8a','person-dewey','Prof. Dewey','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('2580ff63-eb49-4bdc-8252-404d479ec99d','person-dewey','Professor John Dewey','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('6e24be57-922f-44fe-adee-74cd969d0af8','person-nehru','Pandit Nehru','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('06af12fc-29c2-4fdc-971a-0abb21574240','person-nehru','J. L. Nehru','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('e174f571-ff80-44fb-9496-e050f6338f6c','person-nehru','Jawaharlal Nehru','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('f1021604-b296-469f-aac7-9dcb90294e3c','work-annihilation','Annihilation of Caste','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('bda45a9c-dde1-4bb2-83c0-f4932ac1620f','work-annihilation','AoC','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('78c3ae5b-d905-4ae7-a5f8-7d3cbb9d90b7','work-annihilation','Undelivered Speech 1936','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('7f69eea7-5b79-463c-ad64-cb62d1cc0084','work-castes-in-india','Castes in India','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('8a252c83-a2eb-46fd-9ff8-4a19c3183b1e','work-castes-in-india','Castes in India Paper','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('62be9518-7bff-49df-a377-6f9934197d47','work-problem-of-rupee','Problem of the Rupee','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('cb11a99a-20dc-4f91-82f1-bc39000626b6','work-problem-of-rupee','The Problem of the Rupee','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('b6a11031-8c54-43eb-b68e-d2718790f618','work-states-minorities','States and Minorities','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('ccbfd65e-196e-4c7f-a095-228ddf20a64e','work-states-minorities','States & Minorities','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('bb55a63a-6d5c-468e-aa30-1ce248a76719','work-riddles-in-hinduism','Riddles in Hinduism','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('d0f521c2-62e1-4cc4-b83e-0a97cd4043c6','work-riddles-in-hinduism','Riddles in Hinduism Monograph','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('31f557db-6d05-43fb-81ed-ab300b0bd8be','work-buddha-and-dhamma','The Buddha and His Dhamma','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('71f12e9f-a118-4122-9eb9-05d3eb8f6b6b','work-buddha-and-dhamma','Buddha and His Dhamma','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('f4ff58e0-7d83-4af9-aab2-bbb653af2320','org-columbia','Columbia','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('1cdd0425-2992-430e-96fa-b884fde74615','org-columbia','Columbia University in the City of New York','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('a6e27b60-4ee3-40a5-95cb-77001630ed5b','org-lse','LSE','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('7b24b9c4-3834-4753-8df7-b86b0fb34721','org-lse','London School of Economics and Political Science','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('156e99c4-a3a6-40c8-9097-32e77d246abe','org-drafting-committee','Drafting Committee','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('922bc908-b568-4cdf-8f4b-61ba73a02840','org-drafting-committee','Constitution Drafting Committee','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('2b3df168-b69a-4598-9f9f-387f59e14e9d','org-rbi','RBI','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('66e1c92b-7239-4771-a632-18f8f88e2346','org-rbi','Reserve Bank of India','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('f95fd2a0-c595-46c2-be7b-eae60a807a2a','org-rbi','Reserve Bank','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('73d5d5e6-0177-41dc-a94a-62de4aad6937','org-bahishkrit-sabha','Bahishkrit Hitakarini Sabha','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('2c51ea9d-4cf9-49b1-aef9-264c9626d7e4','org-bahishkrit-sabha','Depressed Classes Institute','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('88563c43-373d-4689-a424-8e4cbf78ae65','event-mahad','Mahad Satyagraha','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('300a32e7-14e4-4886-9d7b-e5fb74f8aced','event-mahad','Chhadar Tank Satyagraha','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('29b7efab-9d56-427c-8829-f72d89780c96','event-mahad','Mahad Water Satyagraha','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('ff265863-a017-4f58-9a11-2cb656c5f1e9','event-manusmriti-dahan','Manusmriti Burning','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('cc0dde36-b64d-46c6-9b44-804a4ddd4b74','event-manusmriti-dahan','Manusmriti Dahan','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('6174572e-6659-4a22-ba5d-42f8630f9814','event-poona-pact','Poona Pact','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('095cfd7f-4096-4029-abc8-559f37907b65','event-poona-pact','Yerwada Agreement 1932','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('6d609155-f122-400a-9098-fda5a3c9c6b5','event-round-table','Round Table Conference','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('d6169dd1-b21f-4e74-9e07-5a1fb8dd21e2','event-round-table','RTC London','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('e4703c93-761c-4a78-83d2-7afc1da0b002','event-conversion-1956','1956 Buddhist Conversion','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('eca0f040-40a2-4b2a-bec3-9476d10821d3','event-conversion-1956','Nagpur Conversion','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('e5b0549a-9de8-44a1-bdb7-5bf99c6e7fcd','event-conversion-1956','Deekshabhoomi Dhamma Diksha','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('8e06d8cb-72ec-49ac-a3bd-5357ea23ecd4','concept-social-endosmosis','Endosmosis','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('9f8002f9-c24e-48c4-99ac-f7a47d779b16','concept-social-endosmosis','Social Endosmosis','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('3fadd81f-0c42-42c0-b7ff-cb22214ab96c','concept-constitutional-morality','Constitutional Morality','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('c75495e2-2292-489d-8629-80dd149db6fc','concept-constitutional-morality','Doctrine of Constitutional Morality','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('dc7d8236-350d-4f78-95dc-5f7b25bf88b8','concept-liberty-equality-fraternity','Union of Trinity','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('fb3918dd-5165-4954-b71d-8902a54d32c1','concept-liberty-equality-fraternity','Liberty Equality and Fraternity','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('c5ee18d0-7d40-46a6-a589-e330c457b7ca','concept-state-socialism','State Socialism Doctrine','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('8cf18bf1-4d73-4a27-8b37-fd2a0cb2d341','concept-annihilation-of-caste','Destruction of Shastras','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('b8289d6c-8513-4389-95f6-4f8cf567506d','concept-annihilation-of-caste','Abolition of Caste','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('8d4d44e2-a2d7-413d-b5b5-346c9ff3e2f8','place-bombay','Bombay','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('38ad8ffb-d3b9-4c34-adf6-9bc51fc8cb8b','place-bombay','Mumbai','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('1650788c-9993-4d5c-8c3f-bc55872eb476','place-nagpur','Nagpur','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('569328c0-f71e-411b-bec8-9fa7e5dbb24d','place-nagpur','Deekshabhoomi','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('ba41a8b7-d80a-4aa7-8362-16dc7e97c04e','place-london','London','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('e197f176-47f2-47c1-9a6a-6d25f98d4a75','place-london','London City','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('6d3ec425-4ebf-4e79-8477-c95580959294','place-new-york','New York','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('31dbb73d-d516-4eb9-a3e3-ca241bfdc975','place-new-york','NYC','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('991c8b2b-3c8e-4abb-9838-eb7b8855a969','place-mhow','Mhow','variant','en',1.0,'2026-09-26 09:05:31');
INSERT INTO "entity_aliases" VALUES('e1f73196-5e00-45a6-afb0-d31e3cff869e','place-mhow','Dr. Ambedkar Nagar','variant','en',1.0,'2026-09-26 09:05:31');
CREATE TABLE entity_localizations (
    id                    TEXT PRIMARY KEY,
    entity_id             TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    language              TEXT NOT NULL,
    localized_name        TEXT NOT NULL,
    localized_description TEXT,
    created_at            TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE entity_reviews (
    id                  TEXT PRIMARY KEY,
    entity_id           TEXT REFERENCES entities(id),
    original_mention    TEXT NOT NULL,
    suggested_entity_id TEXT,
    reviewer            TEXT NOT NULL DEFAULT 'curator',
    action              TEXT NOT NULL,
    status              TEXT NOT NULL DEFAULT 'PENDING',
    supporting_chunk_id TEXT REFERENCES document_chunks(id),
    review_notes        TEXT,
    created_at          TEXT DEFAULT (datetime('now'))
);
CREATE TABLE eval_dataset_items (
    id TEXT PRIMARY KEY,
    dataset_type TEXT NOT NULL, -- RETRIEVAL_EVAL, ALIGNMENT_EVAL, HARD_NEGATIVE
    query_text TEXT NOT NULL,
    query_language TEXT NOT NULL,
    positive_chunk_id TEXT,
    positive_doc_id TEXT,
    positive_language TEXT,
    negative_chunk_id TEXT,
    negative_doc_id TEXT,
    negative_type TEXT,
    created_at TEXT NOT NULL
);
CREATE TABLE events (
    id              TEXT PRIMARY KEY,
    canonical_name  TEXT NOT NULL,
    event_type      TEXT,
    start_date      TEXT,
    end_date        TEXT,
    location_id     TEXT,
    description     TEXT,
    significance    TEXT,
    wikidata_id     TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE files (
    id              TEXT PRIMARY KEY,
    object_id       TEXT NOT NULL REFERENCES archival_objects(id),
    file_type       TEXT NOT NULL,
    storage_key     TEXT NOT NULL,
    mime_type       TEXT NOT NULL,
    file_size_bytes INTEGER,
    file_hash       TEXT,
    width_px        INTEGER,
    height_px       INTEGER,
    duration_secs   REAL,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
PRAGMA writable_schema=ON;
INSERT INTO sqlite_master(type,name,tbl_name,rootpage,sql)VALUES('table','fts_chunks','fts_chunks',0,'CREATE VIRTUAL TABLE fts_chunks USING fts5(
    text,
    object_id UNINDEXED,
    chunk_id UNINDEXED
)');
CREATE TABLE 'fts_chunks_config'(k PRIMARY KEY, v) WITHOUT ROWID;
INSERT INTO "fts_chunks_config" VALUES('version',4);
CREATE TABLE 'fts_chunks_content'(id INTEGER PRIMARY KEY, c0, c1, c2);
CREATE TABLE 'fts_chunks_data'(id INTEGER PRIMARY KEY, block BLOB);
INSERT INTO "fts_chunks_data" VALUES(1,X'');
INSERT INTO "fts_chunks_data" VALUES(10,X'00000000000000');
CREATE TABLE 'fts_chunks_docsize'(id INTEGER PRIMARY KEY, sz BLOB);
CREATE TABLE 'fts_chunks_idx'(segid, term, pgno, PRIMARY KEY(segid, term)) WITHOUT ROWID;
CREATE TABLE media_assets (
    id              TEXT PRIMARY KEY,
    object_id       TEXT NOT NULL REFERENCES archival_objects(id),
    asset_type      TEXT NOT NULL,
    title           TEXT,
    storage_key     TEXT NOT NULL,
    mime_type       TEXT NOT NULL,
    duration_secs   REAL,
    transcript_text TEXT,
    transcript_language TEXT,
    iiif_manifest_json TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE multilingual_works (
    id TEXT PRIMARY KEY,
    canonical_title TEXT NOT NULL,
    author TEXT DEFAULT 'Dr. B.R. Ambedkar',
    original_language TEXT DEFAULT 'en',
    description TEXT,
    created_at TEXT NOT NULL
);
CREATE TABLE multimodal_page_analyses (
    id                TEXT PRIMARY KEY,
    object_id         TEXT NOT NULL REFERENCES archival_objects(id),
    page_number       INTEGER NOT NULL,
    model_name        TEXT NOT NULL,
    visual_summary    TEXT NOT NULL,
    visual_ocr_text   TEXT,
    conflict_detected INTEGER NOT NULL DEFAULT 0,
    conflict_details  TEXT,
    created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE ocr_pages (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    page_number INTEGER NOT NULL,
    language TEXT NOT NULL,
    ocr_engine TEXT NOT NULL,
    confidence_avg REAL NOT NULL,
    raw_ocr_text TEXT,
    reviewed_ocr_text TEXT,
    review_status TEXT DEFAULT 'OCR_UNREVIEWED', -- OCR_UNREVIEWED, OCR_REVIEWED, NEEDS_CORRECTION
    reviewer TEXT,
    reviewed_at TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (document_id) REFERENCES work_manifests(archival_id) ON DELETE CASCADE
);
CREATE TABLE organizations (
    id              TEXT PRIMARY KEY,
    canonical_name  TEXT NOT NULL,
    aliases         TEXT,
    org_type        TEXT,
    founded_date    TEXT,
    dissolved_date  TEXT,
    description     TEXT,
    wikidata_id     TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE pages (
    id                TEXT PRIMARY KEY,
    object_id         TEXT NOT NULL REFERENCES archival_objects(id),
    page_number       INTEGER NOT NULL,
    label             TEXT,
    image_file_key    TEXT,
    thumbnail_key     TEXT,
    alto_xml_key      TEXT,
    ocr_text          TEXT,
    ocr_confidence    REAL,
    processing_status TEXT NOT NULL DEFAULT 'pending',
    created_at        TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE permissions (
    id          TEXT PRIMARY KEY,
    role_id     TEXT NOT NULL REFERENCES roles(id),
    resource    TEXT NOT NULL,
    action      TEXT NOT NULL
);
CREATE TABLE persons (
    id              TEXT PRIMARY KEY,
    canonical_name  TEXT NOT NULL,
    aliases         TEXT,
    birth_date      TEXT,
    death_date      TEXT,
    description     TEXT,
    wikidata_id     TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE places (
    id              TEXT PRIMARY KEY,
    canonical_name  TEXT NOT NULL,
    place_type      TEXT,
    country         TEXT,
    latitude        REAL,
    longitude       REAL,
    wikidata_id     TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE preservation_events (
    id               TEXT PRIMARY KEY,
    object_id        TEXT REFERENCES archival_objects(id),
    event_type       TEXT NOT NULL,
    event_detail     TEXT,
    event_outcome    TEXT NOT NULL,
    outcome_detail   TEXT,
    agent_name       TEXT NOT NULL,
    agent_type       TEXT NOT NULL DEFAULT 'software',
    event_date       TEXT NOT NULL DEFAULT (datetime('now')),
    file_hash_before TEXT,
    file_hash_after  TEXT
);
CREATE TABLE processing_jobs (
    id              TEXT PRIMARY KEY,
    object_id       TEXT NOT NULL REFERENCES archival_objects(id),
    job_type        TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'queued',
    priority        INTEGER NOT NULL DEFAULT 5,
    attempts        INTEGER NOT NULL DEFAULT 0,
    max_attempts    INTEGER NOT NULL DEFAULT 3,
    payload_json    TEXT,
    result_json     TEXT,
    error_message   TEXT,
    queued_at       TEXT NOT NULL DEFAULT (datetime('now')),
    started_at      TEXT,
    completed_at    TEXT,
    worker_id       TEXT
);
CREATE TABLE relationship_evidence (
    id              TEXT PRIMARY KEY,
    relationship_id TEXT NOT NULL REFERENCES relationships(id) ON DELETE CASCADE,
    chunk_id        TEXT NOT NULL REFERENCES document_chunks(id),
    document_id     TEXT REFERENCES archival_objects(id),
    page_number     INTEGER,
    excerpt         TEXT NOT NULL,
    confidence      REAL DEFAULT 1.0,
    verified_by     TEXT DEFAULT 'curator',
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO "relationship_evidence" VALUES('35c7facf-67f4-478a-a3bc-cdbca5df460e','rel-ambedkar-wrote-annihilation','37df7c28-ac58-4089-afba-815e4b612a13','AMBEDKAR-VOL-01',1,'Babasaheb Dr. B.R. Ambedkar authored ''Annihilation of Caste'' as an undelivered speech in 1936 exposing the shastric foundations of caste inequality.',1.0,'archivist','2026-09-26 09:05:31');
INSERT INTO "relationship_evidence" VALUES('d113f8b8-80a3-43e3-9313-ac4dd6a12373','rel-ambedkar-wrote-castes-in-india','a379f1b4-b793-4565-9398-ecbc1d6278a1','AMBEDKAR-VOL-01',30,'Paper read before the Anthropology Seminar of Dr. A. A. Goldenweiser at Columbia University, New York, on 9 May 1916.',1.0,'archivist','2026-09-26 09:05:31');
INSERT INTO "relationship_evidence" VALUES('f8880c0b-f747-48f8-8272-832bda4c8d20','rel-ambedkar-wrote-rupee','a00b4245-c8ff-495c-83dc-9c9345171ff5','AMBEDKAR-VOL-06',10,'Doctoral dissertation ''The Problem of the Rupee: Its Origin and Its Solution'' accepted by the London School of Economics for the D.Sc. in 1923.',1.0,'archivist','2026-09-26 09:05:31');
INSERT INTO "relationship_evidence" VALUES('4adf6b38-df39-4eb6-b338-1c693d3436a2','rel-ambedkar-mentored-dewey','37df7c28-ac58-4089-afba-815e4b612a13','AMBEDKAR-VOL-01',1,'Ambedkar''s definition of social endosmosis draws directly from John Dewey''s concept of democracy as associated and communicated living.',1.0,'archivist','2026-09-26 09:05:31');
INSERT INTO "relationship_evidence" VALUES('9713a5da-c7db-4843-98c2-936211b24ecc','rel-ambedkar-studied-columbia','a379f1b4-b793-4565-9398-ecbc1d6278a1','AMBEDKAR-VOL-01',30,'Dr. Ambedkar enrolled at Columbia University in June 1913 on a Gaekwar State Scholarship, receiving his Master''s and Ph.D.',1.0,'archivist','2026-09-26 09:05:31');
INSERT INTO "relationship_evidence" VALUES('e1dbccd8-dbe9-42a7-9aa9-99ff85b6ad4a','rel-ambedkar-studied-lse','a00b4245-c8ff-495c-83dc-9c9345171ff5','AMBEDKAR-VOL-06',10,'Admitted to the London School of Economics in 1916 and re-entered in 1920 to complete the Master of Science and Doctor of Science.',1.0,'archivist','2026-09-26 09:05:31');
INSERT INTO "relationship_evidence" VALUES('ac916daa-0855-45a1-8456-42e13049ff3f','rel-ambedkar-chaired-drafting','60bd3e9f-9337-4789-8722-9e8705c86c43','AMBEDKAR-VOL-13',6,'Dr. Ambedkar was appointed Chairman of the Drafting Committee on 29 August 1947, guiding the Constituent Assembly through 395 Articles and 8 Schedules.',1.0,'archivist','2026-09-26 09:05:31');
INSERT INTO "relationship_evidence" VALUES('1f583a7d-666e-428d-9cca-fa75ab966afa','rel-rupee-influenced-rbi','a00b4245-c8ff-495c-83dc-9c9345171ff5','AMBEDKAR-VOL-01',947,'The Royal Commission on Indian Currency and Finance (Hilton Young Commission) used Ambedkar''s thesis ''The Problem of the Rupee'' as foundational evidence to establish the Reserve Bank.',1.0,'archivist','2026-09-26 09:05:31');
INSERT INTO "relationship_evidence" VALUES('48ec3ee1-2585-4744-a1fc-71dbee843eba','rel-ambedkar-led-mahad','05f8ff2c-ee58-4e6b-aa83-383b15e723ba','AMBEDKAR-VOL-17-P1',92,'On 20 March 1927, Dr. Ambedkar led the historic march to the public Chhadar Tank in Mahad to drink water, inaugurating India''s civil rights struggle.',1.0,'archivist','2026-09-26 09:05:31');
INSERT INTO "relationship_evidence" VALUES('e0190230-f26f-4a22-af67-d13bcc5b737b','rel-mahad-followed-manusmriti','05f8ff2c-ee58-4e6b-aa83-383b15e723ba','AMBEDKAR-VOL-17-P1',92,'During the second Mahad conference on 25 December 1927, Dr. Ambedkar and his associates burned the Manusmriti as an open rejection of religious inequality.',1.0,'archivist','2026-09-26 09:05:31');
INSERT INTO "relationship_evidence" VALUES('601435b8-36b9-487d-b0a4-577a7931230b','rel-ambedkar-debated-gandhi-poona','b33cfcaa-237e-416f-85ea-cc4684469875','AMBEDKAR-VOL-01',1116,'Dr. Ambedkar negotiated the Poona Pact with Mahatma Gandhi on 24 September 1932, securing 148 reserved legislative seats for the Depressed Classes.',1.0,'archivist','2026-09-26 09:05:31');
INSERT INTO "relationship_evidence" VALUES('01bef50a-592d-493f-94c1-9430d7e4ed14','rel-poona-pact-occurred-at','b33cfcaa-237e-416f-85ea-cc4684469875','AMBEDKAR-VOL-01',1116,'The Poona Pact was finalized in Yerwada Jail near Poona and ratified in Bombay at a grand public assembly on 25 September 1932.',1.0,'archivist','2026-09-26 09:05:31');
INSERT INTO "relationship_evidence" VALUES('586a84f6-b863-4d4c-97d0-7c11988fe75c','rel-ambedkar-argued-social-endosmosis','37df7c28-ac58-4089-afba-815e4b612a13','AMBEDKAR-VOL-01',1,'In an ideal society there should be many interests consciously communicated and shared... In other words there must be social endosmosis. This is fraternity, which is only another name for democracy.',1.0,'archivist','2026-09-26 09:05:31');
INSERT INTO "relationship_evidence" VALUES('900d8afd-e963-45d3-9059-9b75a2251c53','rel-ambedkar-argued-constitutional-morality','60bd3e9f-9337-4789-8722-9e8705c86c43','AMBEDKAR-VOL-13',6,'Constitutional morality is not a natural sentiment. It has to be cultivated. We must realize that our people have yet to learn it. Democracy in India is only a top-dressing on an Indian soil which is essentially undemocratic.',1.0,'archivist','2026-09-26 09:05:31');
INSERT INTO "relationship_evidence" VALUES('e0771e14-c6c1-44ad-8631-47b151619f1f','rel-ambedkar-argued-trinity','60bd3e9f-9337-4789-8722-9e8705c86c43','AMBEDKAR-VOL-13',6,'Liberty, equality and fraternity form a union of trinity in the sense that to divorce one from the other is to defeat the very purpose of democracy.',1.0,'archivist','2026-09-26 09:05:31');
INSERT INTO "relationship_evidence" VALUES('fc85da53-cdee-46ff-8e8b-a3a460c47184','rel-ambedkar-proposed-state-socialism','b938d574-35f5-4d82-a2c2-410b8c90ef0e','AMBEDKAR-VOL-01',1102,'The soul of democracy is the doctrine of one man, one value. The plan is that it does not leave the establishment of State Socialism to the will of the legislature but prescribes it by the law of the Constitution.',1.0,'archivist','2026-09-26 09:05:31');
INSERT INTO "relationship_evidence" VALUES('c4b3ce30-0f73-4fe2-80ae-5481616a9fdc','rel-ambedkar-led-conversion','c657579a-6310-43d7-9a58-0c46cf8c0d21','AMBEDKAR-VOL-11',884,'On 14 October 1956, Dr. Ambedkar fulfilled his 1935 pledge by formally embracing Buddhism along with his wife and hundreds of thousands of followers at Deekshabhoomi, Nagpur.',1.0,'archivist','2026-09-26 09:05:31');
INSERT INTO "relationship_evidence" VALUES('b8fc89ee-dfce-45e2-93ed-f740d31eb226','rel-conversion-occurred-at','c657579a-6310-43d7-9a58-0c46cf8c0d21','AMBEDKAR-VOL-11',884,'Nagpur was specifically chosen for the conversion ceremony due to its ancient historical association with the Buddhist Nagas.',1.0,'archivist','2026-09-26 09:05:31');
INSERT INTO "relationship_evidence" VALUES('d7cff739-9ca7-427e-84c7-dfe1044616a7','rel-annihilation-discusses-endosmosis','37df7c28-ac58-4089-afba-815e4b612a13','AMBEDKAR-VOL-01',1,'Section 14 of ''Annihilation of Caste'' articulates social endosmosis as the primary operational test for a democratic, mobile society.',1.0,'archivist','2026-09-26 09:05:31');
INSERT INTO "relationship_evidence" VALUES('10870a6f-5930-4658-afb2-d4aa006885ec','rel-states-minorities-embodies-socialism','b938d574-35f5-4d82-a2c2-410b8c90ef0e','AMBEDKAR-VOL-01',1102,'States and Minorities establishes the legal and constitutional mandate for nationalization of land, insurance, and key industrial sectors.',1.0,'archivist','2026-09-26 09:05:31');
CREATE TABLE relationships (
    id                TEXT PRIMARY KEY,
    subject_type      TEXT NOT NULL,
    subject_id        TEXT NOT NULL,
    predicate         TEXT NOT NULL,
    object_type       TEXT NOT NULL,
    object_id         TEXT NOT NULL,
    evidence_chunk_id TEXT REFERENCES document_chunks(id),
    confidence        REAL DEFAULT 1.0,
    source            TEXT NOT NULL DEFAULT 'manual',
    created_at        TEXT NOT NULL DEFAULT (datetime('now'))
, source_document_id TEXT, source_page_id INTEGER, evidence_text TEXT, extraction_method TEXT, created_by TEXT, status TEXT DEFAULT 'CANDIDATE');
INSERT INTO "relationships" VALUES('rel-ambedkar-wrote-annihilation','ENTITY','person-ambedkar','AUTHORED','ENTITY','work-annihilation','37df7c28-ac58-4089-afba-815e4b612a13',1.0,'archival_corpus','2026-09-26 09:05:31','AMBEDKAR-VOL-01',1,'Babasaheb Dr. B.R. Ambedkar authored ''Annihilation of Caste'' as an undelivered speech in 1936 exposing the shastric foundations of caste inequality.','manual_seed','archivist','VERIFIED');
INSERT INTO "relationships" VALUES('rel-ambedkar-wrote-castes-in-india','ENTITY','person-ambedkar','AUTHORED','ENTITY','work-castes-in-india','a379f1b4-b793-4565-9398-ecbc1d6278a1',1.0,'archival_corpus','2026-09-26 09:05:31','AMBEDKAR-VOL-01',30,'Paper read before the Anthropology Seminar of Dr. A. A. Goldenweiser at Columbia University, New York, on 9 May 1916.','manual_seed','archivist','VERIFIED');
INSERT INTO "relationships" VALUES('rel-ambedkar-wrote-rupee','ENTITY','person-ambedkar','AUTHORED','ENTITY','work-problem-of-rupee','a00b4245-c8ff-495c-83dc-9c9345171ff5',1.0,'archival_corpus','2026-09-26 09:05:31','AMBEDKAR-VOL-06',10,'Doctoral dissertation ''The Problem of the Rupee: Its Origin and Its Solution'' accepted by the London School of Economics for the D.Sc. in 1923.','manual_seed','archivist','VERIFIED');
INSERT INTO "relationships" VALUES('rel-ambedkar-mentored-dewey','ENTITY','person-ambedkar','RELATED_TO','ENTITY','person-dewey','37df7c28-ac58-4089-afba-815e4b612a13',1.0,'archival_corpus','2026-09-26 09:05:31','AMBEDKAR-VOL-01',1,'Ambedkar''s definition of social endosmosis draws directly from John Dewey''s concept of democracy as associated and communicated living.','manual_seed','archivist','VERIFIED');
INSERT INTO "relationships" VALUES('rel-ambedkar-studied-columbia','ENTITY','person-ambedkar','MEMBER_OF','ENTITY','org-columbia','a379f1b4-b793-4565-9398-ecbc1d6278a1',1.0,'archival_corpus','2026-09-26 09:05:31','AMBEDKAR-VOL-01',30,'Dr. Ambedkar enrolled at Columbia University in June 1913 on a Gaekwar State Scholarship, receiving his Master''s and Ph.D.','manual_seed','archivist','VERIFIED');
INSERT INTO "relationships" VALUES('rel-ambedkar-studied-lse','ENTITY','person-ambedkar','MEMBER_OF','ENTITY','org-lse','a00b4245-c8ff-495c-83dc-9c9345171ff5',1.0,'archival_corpus','2026-09-26 09:05:31','AMBEDKAR-VOL-06',10,'Admitted to the London School of Economics in 1916 and re-entered in 1920 to complete the Master of Science and Doctor of Science.','manual_seed','archivist','VERIFIED');
INSERT INTO "relationships" VALUES('rel-ambedkar-chaired-drafting','ENTITY','person-ambedkar','PARTICIPATED_IN','ENTITY','org-drafting-committee','60bd3e9f-9337-4789-8722-9e8705c86c43',1.0,'archival_corpus','2026-09-26 09:05:31','AMBEDKAR-VOL-13',6,'Dr. Ambedkar was appointed Chairman of the Drafting Committee on 29 August 1947, guiding the Constituent Assembly through 395 Articles and 8 Schedules.','manual_seed','archivist','VERIFIED');
INSERT INTO "relationships" VALUES('rel-rupee-influenced-rbi','ENTITY','work-problem-of-rupee','DERIVED_FROM','ENTITY','org-rbi','a00b4245-c8ff-495c-83dc-9c9345171ff5',1.0,'archival_corpus','2026-09-26 09:05:31','AMBEDKAR-VOL-01',947,'The Royal Commission on Indian Currency and Finance (Hilton Young Commission) used Ambedkar''s thesis ''The Problem of the Rupee'' as foundational evidence to establish the Reserve Bank.','manual_seed','archivist','VERIFIED');
INSERT INTO "relationships" VALUES('rel-ambedkar-led-mahad','ENTITY','person-ambedkar','PARTICIPATED_IN','ENTITY','event-mahad','05f8ff2c-ee58-4e6b-aa83-383b15e723ba',1.0,'archival_corpus','2026-09-26 09:05:31','AMBEDKAR-VOL-17-P1',92,'On 20 March 1927, Dr. Ambedkar led the historic march to the public Chhadar Tank in Mahad to drink water, inaugurating India''s civil rights struggle.','manual_seed','archivist','VERIFIED');
INSERT INTO "relationships" VALUES('rel-mahad-followed-manusmriti','ENTITY','event-mahad','FOLLOWS','ENTITY','event-manusmriti-dahan','05f8ff2c-ee58-4e6b-aa83-383b15e723ba',1.0,'archival_corpus','2026-09-26 09:05:31','AMBEDKAR-VOL-17-P1',92,'During the second Mahad conference on 25 December 1927, Dr. Ambedkar and his associates burned the Manusmriti as an open rejection of religious inequality.','manual_seed','archivist','VERIFIED');
INSERT INTO "relationships" VALUES('rel-ambedkar-debated-gandhi-poona','ENTITY','person-ambedkar','RESPONDED_TO','ENTITY','person-gandhi','b33cfcaa-237e-416f-85ea-cc4684469875',1.0,'archival_corpus','2026-09-26 09:05:31','AMBEDKAR-VOL-01',1116,'Dr. Ambedkar negotiated the Poona Pact with Mahatma Gandhi on 24 September 1932, securing 148 reserved legislative seats for the Depressed Classes.','manual_seed','archivist','VERIFIED');
INSERT INTO "relationships" VALUES('rel-poona-pact-occurred-at','ENTITY','event-poona-pact','OCCURRED_AT','ENTITY','place-bombay','b33cfcaa-237e-416f-85ea-cc4684469875',1.0,'archival_corpus','2026-09-26 09:05:31','AMBEDKAR-VOL-01',1116,'The Poona Pact was finalized in Yerwada Jail near Poona and ratified in Bombay at a grand public assembly on 25 September 1932.','manual_seed','archivist','VERIFIED');
INSERT INTO "relationships" VALUES('rel-ambedkar-argued-social-endosmosis','ENTITY','person-ambedkar','ARGUED','ENTITY','concept-social-endosmosis','37df7c28-ac58-4089-afba-815e4b612a13',1.0,'archival_corpus','2026-09-26 09:05:31','AMBEDKAR-VOL-01',1,'In an ideal society there should be many interests consciously communicated and shared... In other words there must be social endosmosis. This is fraternity, which is only another name for democracy.','manual_seed','archivist','VERIFIED');
INSERT INTO "relationships" VALUES('rel-ambedkar-argued-constitutional-morality','ENTITY','person-ambedkar','ARGUED','ENTITY','concept-constitutional-morality','60bd3e9f-9337-4789-8722-9e8705c86c43',1.0,'archival_corpus','2026-09-26 09:05:31','AMBEDKAR-VOL-13',6,'Constitutional morality is not a natural sentiment. It has to be cultivated. We must realize that our people have yet to learn it. Democracy in India is only a top-dressing on an Indian soil which is essentially undemocratic.','manual_seed','archivist','VERIFIED');
INSERT INTO "relationships" VALUES('rel-ambedkar-argued-trinity','ENTITY','person-ambedkar','ARGUED','ENTITY','concept-liberty-equality-fraternity','60bd3e9f-9337-4789-8722-9e8705c86c43',1.0,'archival_corpus','2026-09-26 09:05:31','AMBEDKAR-VOL-13',6,'Liberty, equality and fraternity form a union of trinity in the sense that to divorce one from the other is to defeat the very purpose of democracy.','manual_seed','archivist','VERIFIED');
INSERT INTO "relationships" VALUES('rel-ambedkar-proposed-state-socialism','ENTITY','person-ambedkar','ARGUED','ENTITY','concept-state-socialism','b938d574-35f5-4d82-a2c2-410b8c90ef0e',1.0,'archival_corpus','2026-09-26 09:05:31','AMBEDKAR-VOL-01',1102,'The soul of democracy is the doctrine of one man, one value. The plan is that it does not leave the establishment of State Socialism to the will of the legislature but prescribes it by the law of the Constitution.','manual_seed','archivist','VERIFIED');
INSERT INTO "relationships" VALUES('rel-ambedkar-led-conversion','ENTITY','person-ambedkar','PARTICIPATED_IN','ENTITY','event-conversion-1956','c657579a-6310-43d7-9a58-0c46cf8c0d21',1.0,'archival_corpus','2026-09-26 09:05:31','AMBEDKAR-VOL-11',884,'On 14 October 1956, Dr. Ambedkar fulfilled his 1935 pledge by formally embracing Buddhism along with his wife and hundreds of thousands of followers at Deekshabhoomi, Nagpur.','manual_seed','archivist','VERIFIED');
INSERT INTO "relationships" VALUES('rel-conversion-occurred-at','ENTITY','event-conversion-1956','OCCURRED_AT','ENTITY','place-nagpur','c657579a-6310-43d7-9a58-0c46cf8c0d21',1.0,'archival_corpus','2026-09-26 09:05:31','AMBEDKAR-VOL-11',884,'Nagpur was specifically chosen for the conversion ceremony due to its ancient historical association with the Buddhist Nagas.','manual_seed','archivist','VERIFIED');
INSERT INTO "relationships" VALUES('rel-annihilation-discusses-endosmosis','ENTITY','work-annihilation','DISCUSSED','ENTITY','concept-social-endosmosis','37df7c28-ac58-4089-afba-815e4b612a13',1.0,'archival_corpus','2026-09-26 09:05:31','AMBEDKAR-VOL-01',1,'Section 14 of ''Annihilation of Caste'' articulates social endosmosis as the primary operational test for a democratic, mobile society.','manual_seed','archivist','VERIFIED');
INSERT INTO "relationships" VALUES('rel-states-minorities-embodies-socialism','ENTITY','work-states-minorities','SUPPORTS','ENTITY','concept-state-socialism','b938d574-35f5-4d82-a2c2-410b8c90ef0e',1.0,'archival_corpus','2026-09-26 09:05:31','AMBEDKAR-VOL-01',1102,'States and Minorities establishes the legal and constitutional mandate for nationalization of land, insurance, and key industrial sectors.','manual_seed','archivist','VERIFIED');
CREATE TABLE roles (
    id          TEXT PRIMARY KEY,
    name        TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO "roles" VALUES('role_admin','admin','Full system access','2026-09-26 09:05:31');
INSERT INTO "roles" VALUES('role_archivist','archivist','Can ingest, review, and publish archival objects','2026-09-26 09:05:31');
INSERT INTO "roles" VALUES('role_researcher','researcher','Read access + search + export','2026-09-26 09:05:31');
INSERT INTO "roles" VALUES('role_public','public','Public read-only access to published objects','2026-09-26 09:05:31');
CREATE TABLE schema_migrations (
    version     TEXT PRIMARY KEY,
    applied_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO "schema_migrations" VALUES('001_initial_schema','2026-09-26 09:05:31');
INSERT INTO "schema_migrations" VALUES('002_phase6_search','2026-09-26 09:05:31');
INSERT INTO "schema_migrations" VALUES('003_phase7_5_audit_fixes','2026-09-26 09:05:31');
CREATE TABLE search_index_meta (
    id             TEXT PRIMARY KEY,
    index_type     TEXT NOT NULL,
    model_name     TEXT,
    embedding_version TEXT,
    total_chunks   INTEGER DEFAULT 0,
    last_run_at    TEXT,
    run_duration_s REAL,
    status         TEXT NOT NULL DEFAULT 'idle'
);
CREATE TABLE sources (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    authors     TEXT,
    year        TEXT,
    publisher   TEXT,
    url         TEXT,
    doi         TEXT,
    notes       TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE story_collections (
    id              TEXT PRIMARY KEY,
    slug            TEXT UNIQUE NOT NULL,
    title           TEXT NOT NULL,
    subtitle        TEXT,
    summary         TEXT NOT NULL,
    cover_image_url TEXT,
    category        TEXT NOT NULL DEFAULT 'MEMORIAL',
    published       INTEGER NOT NULL DEFAULT 1,
    display_order   INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO "story_collections" VALUES('story-constitution','ambedkar-and-the-constitution','Dr. Ambedkar & The Making of the Indian Constitution','From Chief Architect to the Union of Trinity: Drafting Modern India''s Magna Carta','Explore the intellectual crucible through which Dr. B.R. Ambedkar engineered the democratic bedrock of the Republic of India, harmonizing fundamental rights, social justice, and constitutional morality.',NULL,'CONSTITUTIONAL',1,1,'2026-09-26 09:05:31');
INSERT INTO "story_collections" VALUES('story-mahad','mahad-satyagraha-civil-rights','The Mahad Satyagraha: Awakening Civil Rights','Water as Equality: The 1927 March at Chhadar Tank','The dramatic story of Dr. Ambedkar''s 1927 Mahad campaign, widely heralded as India''s declaration of human equality and the genesis of modern civil rights assertion.',NULL,'SOCIAL_REFORM',1,2,'2026-09-26 09:05:31');
INSERT INTO "story_collections" VALUES('story-rbi','monetary-economics-and-the-rbi','Monetary Economics & The Genesis of the Reserve Bank','Dr. Ambedkar''s Economic Treatises and Colonial Currency Reform','An extraordinary journey through Dr. Ambedkar''s doctoral research at the London School of Economics, culminating in his testimony before the Royal Commission that gave birth to the Reserve Bank of India.',NULL,'ECONOMIC',1,3,'2026-09-26 09:05:31');
CREATE TABLE story_items (
    id                       TEXT PRIMARY KEY,
    story_id                 TEXT NOT NULL REFERENCES story_collections(id) ON DELETE CASCADE,
    sequence                 INTEGER NOT NULL DEFAULT 1,
    title                    TEXT NOT NULL,
    narrative_text           TEXT NOT NULL,
    media_url                TEXT,
    media_type               TEXT DEFAULT 'document',
    document_id              TEXT REFERENCES archival_objects(id),
    page_number              INTEGER,
    chunk_id                 TEXT REFERENCES document_chunks(id),
    evidence_quote           TEXT,
    interactive_graph_config TEXT,
    created_at               TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO "story_items" VALUES('dbe5527f-08c2-415b-b2d2-e2f00e98b2b4','story-constitution',1,'The Call to the Drafting Committee','On 29 August 1947, the Constituent Assembly unanimously appointed Dr. B.R. Ambedkar as Chairman of the Drafting Committee. Entrusted with synthesizing competing political philosophies into a coherent legal charter, Ambedkar brought unprecedented scholarly rigor rooted in his studies at Columbia, LSE, and Gray''s Inn.',NULL,'document','AMBEDKAR-VOL-13',6,'60bd3e9f-9337-4789-8722-9e8705c86c43','The Government of Maharashtra has made a signal contribution to the study and understanding of the framing of the Indian Constitution by bringing together all the speeches of Dr. Ambedkar as Chairman of the Drafting Committee.',NULL,'2026-09-26 09:05:31');
INSERT INTO "story_items" VALUES('4f81e737-967b-4c3e-b098-3284cba0ba61','story-constitution',2,'Constitutional Morality over Majoritarianism','Introducing the Draft Constitution on 4 November 1948, Dr. Ambedkar articulated the foundational doctrine of Constitutional Morality. He cautioned that democratic institutions are inherently fragile and must be safeguarded through institutional checks, judicial independence, and civic vigilance.',NULL,'document','AMBEDKAR-VOL-13',6,'60bd3e9f-9337-4789-8722-9e8705c86c43','Constitutional morality is not a natural sentiment. It has to be cultivated. We must realize that our people have yet to learn it.',NULL,'2026-09-26 09:05:31');
INSERT INTO "story_items" VALUES('7f8bb699-2f77-41c0-a17f-8ee2e69e1d84','story-constitution',3,'The Union of Trinity: Liberty, Equality, Fraternity','In his final address on 25 November 1949, Dr. Ambedkar delivered a timeless warning: political democracy cannot endure without social democracy. He described liberty, equality, and fraternity not as separate doctrines, but as an indissoluble trinity where the suppression of any one destroys the others.',NULL,'document','AMBEDKAR-VOL-01',1,'37df7c28-ac58-4089-afba-815e4b612a13','Liberty cannot be divorced from equality, equality cannot be divorced from liberty. Nor can liberty and equality be divorced from fraternity.',NULL,'2026-09-26 09:05:31');
INSERT INTO "story_items" VALUES('57792068-5e28-4cb2-9195-cfff22a44649','story-mahad',1,'The Prohibition of Chhadar Tank','Despite the Bombay Legislative Council''s 1923 Bole Resolution declaring public tanks accessible to all citizens, local caste authorities in Mahad refused to permit untouchables to touch the municipal Chhadar Tank. Ambedkar resolved to test the reality of civic rights through peaceful mass action.',NULL,'document','AMBEDKAR-VOL-17-P1',66,'93593a17-cda4-4574-86d4-f8910d6aab25','Bahishkrit Hitakarini Sabha in Bombay declared the satyagraha struggle for public water access at Mahad.',NULL,'2026-09-26 09:05:31');
INSERT INTO "story_items" VALUES('32776bbf-afe6-4eb4-9713-0bbde93a0277','story-mahad',2,'The March to the Water: 20 March 1927','At the conclusion of the Kolaba District Conference, Dr. Ambedkar led a disciplined procession of thousands of delegates through Mahad to the Chhadar Tank. In complete silence, he stepped down the stone ghats and cupped his hands to drink, breaking centuries of ritual exclusion.',NULL,'document','AMBEDKAR-VOL-17-P1',92,'05f8ff2c-ee58-4e6b-aa83-383b15e723ba','The satyagraha at Chhadar Tank on 20 March 1927 was not just for water, but to assert that we too are human beings.',NULL,'2026-09-26 09:05:31');
INSERT INTO "story_items" VALUES('582d5006-2051-455b-a2d3-e19b43546747','story-mahad',3,'Manusmriti Dahan: The Funeral of Inequality','Nine months later, on 25 December 1927, Dr. Ambedkar reconvened at Mahad. In a radical assertion of ideological liberation, a specially constructed trench was ignited with the Manusmriti text, symbolizing the irrevocable demise of divinely sanctioned social hierarchy.',NULL,'document','AMBEDKAR-VOL-17-P1',92,'05f8ff2c-ee58-4e6b-aa83-383b15e723ba','On 25 December 1927, the Manusmriti was burned in a public pyre at Mahad.',NULL,'2026-09-26 09:05:31');
INSERT INTO "story_items" VALUES('0ecf3119-4860-4d8c-a84b-04975ea406b3','story-rbi',1,'The Problem of the Rupee at LSE','Studying under Edwin Cannan at the London School of Economics, Ambedkar completed his landmark doctoral thesis ''The Problem of the Rupee''. Unlike contemporary British economists who advocated a gold-exchange standard, Ambedkar warned that it generated uncontrolled currency inflation and disadvantaged Indian producers.',NULL,'document','AMBEDKAR-VOL-06',10,'a00b4245-c8ff-495c-83dc-9c9345171ff5','This is the 6th volume of the writings and speeches of Dr. Babasaheb Ambedkar containing ''The Problem of the Rupee''.',NULL,'2026-09-26 09:05:31');
INSERT INTO "story_items" VALUES('bb343b0e-c1fb-4d7d-8caf-5ff07e673632','story-rbi',2,'Testimony to the Hilton Young Commission','When the Royal Commission on Indian Currency and Finance (Hilton Young Commission) convened in 1925, Ambedkar presented compelling evidence on monetary stability, arguing that central banking must maintain currency discipline separated from government revenue needs.',NULL,'document','AMBEDKAR-VOL-01',947,'a00b4245-c8ff-495c-83dc-9c9345171ff5','Profits, if any, from Mint and Currency operations and central banking architecture.',NULL,'2026-09-26 09:05:31');
INSERT INTO "story_items" VALUES('30e57bdd-f37f-449a-aac9-c7f2689a6286','story-rbi',3,'1935: Formation of the Reserve Bank of India','The Reserve Bank of India Act of 1934 drew directly upon the conceptual guidelines and currency management frameworks laid out by Dr. Ambedkar, establishing the institutional foundation of modern India''s monetary governance.',NULL,'document','AMBEDKAR-VOL-01',947,'a00b4245-c8ff-495c-83dc-9c9345171ff5','Foundations of currency stabilization and the establishment of the central bank.',NULL,'2026-09-26 09:05:31');
CREATE TABLE timeline_events (
    id                 TEXT PRIMARY KEY,
    title              TEXT NOT NULL,
    description        TEXT NOT NULL,
    start_date         TEXT NOT NULL,
    end_date           TEXT,
    date_precision     TEXT NOT NULL DEFAULT 'DAY',
    category           TEXT NOT NULL DEFAULT 'HISTORICAL',
    location           TEXT,
    related_people     TEXT,
    related_documents  TEXT,
    related_topics     TEXT,
    source             TEXT NOT NULL,
    evidence_chunk_id  TEXT REFERENCES document_chunks(id),
    evidence_text      TEXT,
    document_id        TEXT REFERENCES archival_objects(id),
    page_number        INTEGER,
    publication_status TEXT NOT NULL DEFAULT 'APPROVED',
    created_at         TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO "timeline_events" VALUES('event-1891-birth','Birth of Bhimrao Ramji Ambedkar at Mhow','Born into a Mahar family at the military cantonment of Mhow (Central Provinces), the fourteenth child of Subedar Ramji Maloji Sakpal and Bhimabai.','1891-04-14',NULL,'DAY','PERSONAL','Mhow, Central Provinces','["Dr. B.R. Ambedkar"]','["AMBEDKAR-VOL-01"]','["Birth", "Early Life"]','BAWS Vol. 1 Biographical Sketch','37df7c28-ac58-4089-afba-815e4b612a13','Babasaheb Dr. B.R. Ambedkar was born on 14th April 1891 at Mhow.','AMBEDKAR-VOL-01',1,'APPROVED','2026-09-26 09:05:31');
INSERT INTO "timeline_events" VALUES('event-1913-columbia','Enrollment at Columbia University, New York','Awarded a Baroda State Scholarship by Maharaja Sayajirao Gaekwad III, arriving in New York to commence postgraduate studies in economics, sociology, and philosophy under John Dewey and Edwin Seligman.','1913-07-20',NULL,'DAY','EDUCATION','Columbia University, New York City','["Dr. B.R. Ambedkar", "Prof. John Dewey"]','["AMBEDKAR-VOL-01"]','["Education", "Economics", "Pragmatism"]','BAWS Vol. 1 Preface','a379f1b4-b793-4565-9398-ecbc1d6278a1','Ambedkar arrived in New York in July 1913, studying at Columbia University until 1916.','AMBEDKAR-VOL-01',30,'APPROVED','2026-09-26 09:05:31');
INSERT INTO "timeline_events" VALUES('event-1916-castes-in-india','Presentation of ''Castes in India'' Paper','Delivered his foundational sociological paper ''Castes in India: Their Mechanism, Genesis and Development'' before Dr. Alexander Goldenweiser''s Anthropology Seminar.','1916-05-09',NULL,'DAY','ACADEMIC','Columbia University, New York','["Dr. B.R. Ambedkar"]','["AMBEDKAR-VOL-01"]','["Endogamy", "Caste Hierarchy"]','BAWS Vol. 1 p.30','a379f1b4-b793-4565-9398-ecbc1d6278a1','Their Mechanism, Genesis and Development Paper read before the Anthropology Seminar, 9 May 1916.','AMBEDKAR-VOL-01',30,'APPROVED','2026-09-26 09:05:31');
INSERT INTO "timeline_events" VALUES('event-1920-mooknayak','Launch of Mooknayak Fortnightly','Founded the Marathi journal ''Mooknayak'' (Leader of the Silent) in Bombay with financial assistance from Chhatrapati Shahu Maharaj of Kolhapur to voice the plight of the untouchables.','1920-01-31',NULL,'DAY','MOVEMENTS','Bombay','["Dr. B.R. Ambedkar"]','["AMBEDKAR-VOL-17-P1"]','["Journalism", "Social Awakening"]','BAWS Vol. 17 Part 1','93593a17-cda4-4574-86d4-f8910d6aab25','Mooknayak was founded by Dr. Ambedkar on 31 January 1920.','AMBEDKAR-VOL-17-P1',66,'APPROVED','2026-09-26 09:05:31');
INSERT INTO "timeline_events" VALUES('event-1923-rupee-degree','Completion of D.Sc. at London School of Economics','Awarded Doctor of Science in Economics by the University of London for his monumental treatise ''The Problem of the Rupee: Its Origin and Its Solution'' and called to the Bar at Gray''s Inn.','1923-11-01',NULL,'MONTH','EDUCATION','London School of Economics, London','["Dr. B.R. Ambedkar"]','["AMBEDKAR-VOL-06"]','["Monetary Economics", "Gold Standard"]','BAWS Vol. 6','a00b4245-c8ff-495c-83dc-9c9345171ff5','The thesis ''The Problem of the Rupee'' was accepted by the University of London for the D.Sc. in 1923.','AMBEDKAR-VOL-06',10,'APPROVED','2026-09-26 09:05:31');
INSERT INTO "timeline_events" VALUES('event-1924-bahishkrit-sabha','Establishment of Bahishkrit Hitakarini Sabha','Formed the Depressed Classes Institute at Damodar Hall, Parel with the foundational motto: ''Educate, Agitate, Organise'' to promote civic rights and socio-economic advancement.','1924-07-20',NULL,'DAY','INSTITUTIONS','Damodar Hall, Parel, Bombay','["Dr. B.R. Ambedkar"]','["AMBEDKAR-VOL-17-P1"]','["Civil Rights", "Education"]','BAWS Vol. 17 Part 1 p.66','93593a17-cda4-4574-86d4-f8910d6aab25','Bahishkrit Hitakarini Sabha in Bombay was declared to organize the satyagraha struggle for human rights.','AMBEDKAR-VOL-17-P1',66,'APPROVED','2026-09-26 09:05:31');
INSERT INTO "timeline_events" VALUES('event-1927-mahad-water','The Mahad Satyagraha for Water Rights','Led thousands of delegates at the Kolaba District Depressed Classes Conference to the public Chhadar Tank in Mahad to drink water, asserting human rights over traditional caste prohibitions.','1927-03-20',NULL,'DAY','SOCIAL_REFORM','Mahad, Maharashtra','["Dr. B.R. Ambedkar"]','["AMBEDKAR-VOL-17-P1"]','["Mahad", "Water Rights", "Direct Action"]','BAWS Vol. 17 Part 1 p.92','05f8ff2c-ee58-4e6b-aa83-383b15e723ba','The Mahad Satyagraha took place on 20 March 1927 to assert the right to water at Chhadar Tank.','AMBEDKAR-VOL-17-P1',92,'APPROVED','2026-09-26 09:05:31');
INSERT INTO "timeline_events" VALUES('event-1927-manusmriti-dahan','Manusmriti Dahan Din (Burning of the Code)','At the second Mahad conference, Dr. Ambedkar and his co-workers publicly burned the Manusmriti on a funeral pyre, declaring it a symbol of institutionalized inequality and religious servitude.','1927-12-25',NULL,'DAY','SOCIAL_REFORM','Mahad, Maharashtra','["Dr. B.R. Ambedkar"]','["AMBEDKAR-VOL-17-P1"]','["Manusmriti Dahan", "Equality"]','BAWS Vol. 17 Part 1 p.92','05f8ff2c-ee58-4e6b-aa83-383b15e723ba','On 25 December 1927 at Mahad, the Manusmriti was burned.','AMBEDKAR-VOL-17-P1',92,'APPROVED','2026-09-26 09:05:31');
INSERT INTO "timeline_events" VALUES('event-1930-kalaram-temple','Launch of Kalaram Temple Satyagraha','Led non-violent protest in Nashik demanding entry of untouchables into the Kalaram Temple, demonstrating that the struggle was for equal social dignity rather than idol worship.','1930-03-02',NULL,'DAY','MOVEMENTS','Nashik, Maharashtra','["Dr. B.R. Ambedkar"]','["AMBEDKAR-VOL-05"]','["Temple Entry", "Nashik"]','BAWS Vol. 5 p.574','717c4d9e-3f1b-47d5-82ca-eec7f024244d','The Kalaram Temple Satyagraha in Nashik commenced in March 1930.','AMBEDKAR-VOL-05',574,'APPROVED','2026-09-26 09:05:31');
INSERT INTO "timeline_events" VALUES('event-1930-round-table','First Round Table Conference in London','Appointed by the Viceroy to represent the Depressed Classes in London, demanding separate electorates, fundamental rights, and equal citizenship in independent India.','1930-11-12',NULL,'DAY','POLITICAL','St. James''s Palace, London','["Dr. B.R. Ambedkar"]','["AMBEDKAR-VOL-01"]','["Round Table Conference", "Constitutional Reforms"]','BAWS Vol. 1 p.1464','8db5a4ff-5900-4c1e-b33b-758183e296dd','Round Table Conference proceedings in London from 1930 to 1932.','AMBEDKAR-VOL-01',1464,'APPROVED','2026-09-26 09:05:31');
INSERT INTO "timeline_events" VALUES('event-1932-poona-pact','Signing of the Historic Poona Pact','Signed between Dr. Ambedkar and caste Hindu representatives at Yerwada Central Jail following Mahatma Gandhi''s fast unto death, replacing separate electorates with 148 reserved legislative seats.','1932-09-24',NULL,'DAY','POLITICAL','Yerwada Central Jail, Poona','["Dr. B.R. Ambedkar", "Mahatma Gandhi"]','["AMBEDKAR-VOL-01"]','["Poona Pact", "Reserved Seats", "Elections"]','BAWS Vol. 1 p.1116','b33cfcaa-237e-416f-85ea-cc4684469875','The agreement known as the Poona Pact was signed on 24 September 1932.','AMBEDKAR-VOL-01',1116,'APPROVED','2026-09-26 09:05:31');
INSERT INTO "timeline_events" VALUES('event-1936-annihilation-of-caste','Publication of ''Annihilation of Caste''','Published his masterpiece monograph in Bombay after his presidential invitation to the Lahore conference was canceled by the organizers over his critique of the Vedas.','1936-05-15',NULL,'DAY','WRITINGS','Bombay','["Dr. B.R. Ambedkar", "Mahatma Gandhi"]','["AMBEDKAR-VOL-01"]','["Caste", "Shastras", "Social Endosmosis"]','BAWS Vol. 1 p.1','37df7c28-ac58-4089-afba-815e4b612a13','Annihilation of Caste was published by Dr. Ambedkar in May 1936.','AMBEDKAR-VOL-01',1,'APPROVED','2026-09-26 09:05:31');
INSERT INTO "timeline_events" VALUES('event-1947-drafting-chair','Election as Chairman of the Drafting Committee','Unanimously elected by the Constituent Assembly Drafting Committee to prepare the draft constitution of the sovereign Republic of India.','1947-08-29',NULL,'DAY','CONSTITUTIONAL','Constitution Hall, New Delhi','["Dr. B.R. Ambedkar", "Jawaharlal Nehru"]','["AMBEDKAR-VOL-13"]','["Constitution", "Drafting Committee"]','BAWS Vol. 13 p.6','60bd3e9f-9337-4789-8722-9e8705c86c43','Dr. Ambedkar was appointed Chairman of the Drafting Committee on 29 August 1947.','AMBEDKAR-VOL-13',6,'APPROVED','2026-09-26 09:05:31');
INSERT INTO "timeline_events" VALUES('event-1949-constitution-adoption','Adoption of the Constitution of India','Delivered his final warning speech to the Constituent Assembly declaring that political democracy must be undergirded by social democracy, followed by the formal adoption of the Constitution.','1949-11-26',NULL,'DAY','CONSTITUTIONAL','Constitution Hall, New Delhi','["Dr. B.R. Ambedkar"]','["AMBEDKAR-VOL-13"]','["Constitution Day", "Union of Trinity", "Social Democracy"]','BAWS Vol. 13 p.6','60bd3e9f-9337-4789-8722-9e8705c86c43','The Constitution of India was formally passed and adopted by the Constituent Assembly on 26 November 1949.','AMBEDKAR-VOL-13',6,'APPROVED','2026-09-26 09:05:31');
INSERT INTO "timeline_events" VALUES('event-1956-dhamma-conversion','The Historic Conversion to Buddhism at Deekshabhoomi','Embraced Buddhism at Nagpur with 22 vows administered to over 500,000 followers, inaugurating the modern Buddhist revival movement in India.','1956-10-14',NULL,'DAY','SOCIAL_REFORM','Deekshabhoomi, Nagpur','["Dr. B.R. Ambedkar"]','["AMBEDKAR-VOL-11"]','["Buddhism", "22 Vows", "Deekshabhoomi"]','BAWS Vol. 11 p.884','c657579a-6310-43d7-9a58-0c46cf8c0d21','Mass conversion to Buddhism was solemnized on 14 October 1956 at Nagpur.','AMBEDKAR-VOL-11',884,'APPROVED','2026-09-26 09:05:31');
CREATE TABLE timeline_localizations (
    id                    TEXT PRIMARY KEY,
    event_id              TEXT NOT NULL REFERENCES timeline_events(id) ON DELETE CASCADE,
    language              TEXT NOT NULL,
    localized_title       TEXT NOT NULL,
    localized_description TEXT,
    created_at            TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE topics (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id   TEXT REFERENCES topics(id),
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE transcript_segments (
    id             TEXT PRIMARY KEY,
    media_asset_id TEXT NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
    segment_index  INTEGER NOT NULL,
    start_time     REAL NOT NULL,
    end_time       REAL NOT NULL,
    text           TEXT NOT NULL,
    language       TEXT NOT NULL DEFAULT 'en',
    speaker_id     TEXT,
    speaker_name   TEXT,
    confidence     REAL DEFAULT 1.0,
    source         TEXT DEFAULT 'archival_recording',
    created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE transcripts (
    id              TEXT PRIMARY KEY,
    media_asset_id  TEXT NOT NULL REFERENCES media_assets(id),
    language        TEXT NOT NULL,
    transcript_text TEXT NOT NULL,
    model_name      TEXT NOT NULL,
    word_timestamps TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE translations (
    id              TEXT PRIMARY KEY,
    chunk_id        TEXT NOT NULL REFERENCES document_chunks(id),
    source_language TEXT NOT NULL,
    target_language TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    model_name      TEXT NOT NULL,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE translations_cache (
    id                  TEXT PRIMARY KEY,
    chunk_id            TEXT REFERENCES document_chunks(id),
    source_text_hash    TEXT NOT NULL,
    source_language     TEXT NOT NULL,
    target_language     TEXT NOT NULL,
    translated_text     TEXT NOT NULL,
    translation_model   TEXT NOT NULL,
    translation_version TEXT NOT NULL,
    review_status       TEXT DEFAULT 'APPROVED',
    created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE tts_cache (
    id               TEXT PRIMARY KEY,
    source_text_hash TEXT NOT NULL,
    source_text      TEXT NOT NULL,
    language         TEXT NOT NULL,
    model            TEXT NOT NULL,
    audio_path       TEXT NOT NULL,
    generation_type  TEXT NOT NULL DEFAULT 'AI_NARRATION',
    created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE users (
    id              TEXT PRIMARY KEY,
    email           TEXT UNIQUE NOT NULL,
    username        TEXT UNIQUE,
    hashed_password TEXT,
    full_name       TEXT,
    role_id         TEXT REFERENCES roles(id),
    is_active       INTEGER NOT NULL DEFAULT 1,
    is_superuser    INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
    last_login_at   TEXT
);
CREATE TABLE work_alignments (
    id TEXT PRIMARY KEY,
    work_id TEXT NOT NULL,
    source_segment_id TEXT NOT NULL,
    target_segment_id TEXT NOT NULL,
    source_language TEXT NOT NULL,
    target_language TEXT NOT NULL,
    alignment_level TEXT NOT NULL, -- WORK, SECTION, PARAGRAPH, PAGE
    alignment_method TEXT NOT NULL, -- TITLE_MATCH, SECTION_STRUCTURE, SEMANTIC_SIMILARITY, MANUAL_CURATION
    alignment_status TEXT NOT NULL, -- CANDIDATE, VERIFIED, REJECTED, NEEDS_REVIEW
    source_text_snippet TEXT,
    target_text_snippet TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (work_id) REFERENCES multilingual_works(id) ON DELETE CASCADE
);
CREATE TABLE work_manifests (
    archival_id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    relative_path TEXT NOT NULL,
    language TEXT NOT NULL,
    script TEXT NOT NULL,
    source_format TEXT NOT NULL,
    format_nature TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    page_count INTEGER NOT NULL,
    sha256 TEXT NOT NULL,
    text_authority TEXT NOT NULL,
    ingested_at TEXT NOT NULL
);
INSERT INTO "work_manifests" VALUES('DOC-BE-EBDBBCE5','Bengali_Writings_and_Speeches_Vol11.pdf','bengali/Bengali_Writings_and_Speeches_Vol11.pdf','bn','Bengali','PDF','SCANNED_FACSIMILE',12987859,396,'2b45013c3fa481dc542ce8eda9fe2c4c82805076bb30b0053c85f34e9372afef','OCR_UNREVIEWED','2026-09-24T13:07:54.647715+00:00');
INSERT INTO "work_manifests" VALUES('DOC-BE-57AB0C5C','Bengali_Writings_and_Speeches_Vol12.pdf','bengali/Bengali_Writings_and_Speeches_Vol12.pdf','bn','Bengali','PDF','SCANNED_FACSIMILE',13906446,420,'a06c2cfb6283fa47a7a0ac7a02470978148ffabda9f84871572092ced3fd8a3e','OCR_UNREVIEWED','2026-09-24T13:07:54.682846+00:00');
INSERT INTO "work_manifests" VALUES('DOC-BE-56F175C2','Bengali_Writings_and_Speeches_Vol13.pdf','bengali/Bengali_Writings_and_Speeches_Vol13.pdf','bn','Bengali','PDF','SCANNED_FACSIMILE',9374717,300,'658908561ab265c8bb2cbdb1c7847f58cf1ed3825386791cc9f39cb0a8e0aee2','OCR_UNREVIEWED','2026-09-24T13:07:54.703912+00:00');
INSERT INTO "work_manifests" VALUES('DOC-BE-52CE9C95','Bengali_Writings_and_Speeches_Vol15.pdf','bengali/Bengali_Writings_and_Speeches_Vol15.pdf','bn','Bengali','PDF','SCANNED_FACSIMILE',18281338,541,'8eadce217e26d8d9b86a266dfba9fdf604da2c6fabc8625fee2f0706417d1b8e','OCR_UNREVIEWED','2026-09-24T13:07:54.739360+00:00');
INSERT INTO "work_manifests" VALUES('DOC-BE-BD1D09B9','Bengali_Writings_and_Speeches_Vol16.pdf','bengali/Bengali_Writings_and_Speeches_Vol16.pdf','bn','Bengali','PDF','SCANNED_FACSIMILE',14509781,450,'e8a2a0263b5b971b6e0fad4554e27b1e3429b424c9704f86ff22faaec8dcfae8','OCR_UNREVIEWED','2026-09-24T13:07:54.770558+00:00');
INSERT INTO "work_manifests" VALUES('DOC-BE-FC6B585F','Bengali_Writings_and_Speeches_Vol17(1).pdf','bengali/Bengali_Writings_and_Speeches_Vol17(1).pdf','bn','Bengali','PDF','SCANNED_FACSIMILE',1143685,4,'d25252a2d7627c4e51da4dc5a413772d3a620a2e8779d01a22fc8e197c78e1f5','OCR_UNREVIEWED','2026-09-24T13:07:54.782680+00:00');
INSERT INTO "work_manifests" VALUES('DOC-BE-4C8D1796','Bengali_Writings_and_Speeches_Vol18.pdf','bengali/Bengali_Writings_and_Speeches_Vol18.pdf','bn','Bengali','PDF','SCANNED_FACSIMILE',12370859,380,'40947c7703b58c7f98914287f92628eeaa2f1e9713a93902da8d02a61fb1edfe','OCR_UNREVIEWED','2026-09-24T13:07:54.810534+00:00');
INSERT INTO "work_manifests" VALUES('DOC-BE-3C081A1C','Bengali_Writings_and_Speeches_Vol19.pdf','bengali/Bengali_Writings_and_Speeches_Vol19.pdf','bn','Bengali','PDF','SCANNED_FACSIMILE',18391856,540,'31611b52d07e2986b97b80e79eb21a32b00870d9e74de3b972c9df3eb76a766a','OCR_UNREVIEWED','2026-09-24T13:07:54.842228+00:00');
INSERT INTO "work_manifests" VALUES('DOC-BE-7E9A9D52','Bengali_Writings_and_Speeches_Vol21.pdf','bengali/Bengali_Writings_and_Speeches_Vol21.pdf','bn','Bengali','PDF','SCANNED_FACSIMILE',7254242,362,'73e622497147879da9aee9b31a0eb02052078571a0ce850ebe37c88d76a734af','OCR_UNREVIEWED','2026-09-24T13:07:54.858654+00:00');
INSERT INTO "work_manifests" VALUES('DOC-BE-8836EBC7','Bengali_Writings_and_Speeches_Vol22.pdf','bengali/Bengali_Writings_and_Speeches_Vol22.pdf','bn','Bengali','PDF','SCANNED_FACSIMILE',12370593,472,'e709e7d53266deda70edb7f11e10e44531b68f0deaf75257381720c311dc8c45','OCR_UNREVIEWED','2026-09-24T13:07:54.884573+00:00');
INSERT INTO "work_manifests" VALUES('DOC-BE-1A0CD431','Bengali_Writings_and_Speeches_Vol23.pdf','bengali/Bengali_Writings_and_Speeches_Vol23.pdf','bn','Bengali','PDF','SCANNED_FACSIMILE',6811590,198,'064746717284931665648e6dd492c99210814f8b5d81680ce730728fdcaef111','OCR_UNREVIEWED','2026-09-24T13:07:54.901672+00:00');
INSERT INTO "work_manifests" VALUES('DOC-BE-F9EAEF08','Bengali_Writings_and_Speeches_Vol24.pdf','bengali/Bengali_Writings_and_Speeches_Vol24.pdf','bn','Bengali','PDF','SCANNED_FACSIMILE',10861885,404,'2c10284287b808b751027943e93300709cc98d1cdddb880ba6ae4b43b96d0a9f','OCR_UNREVIEWED','2026-09-24T13:07:54.925171+00:00');
INSERT INTO "work_manifests" VALUES('DOC-BE-6F9008EA','Bengali_Writings_and_Speeches_Vol25.pdf','bengali/Bengali_Writings_and_Speeches_Vol25.pdf','bn','Bengali','PDF','SCANNED_FACSIMILE',3617267,116,'072d399516ed521e35a84512941f50fcc4818ecd5c1e99eba2d04e45518a1ee5','OCR_UNREVIEWED','2026-09-24T13:07:54.940145+00:00');
INSERT INTO "work_manifests" VALUES('DOC-BE-A6C60D53','Bengali_Writings_and_Speeches_Vol26.pdf','bengali/Bengali_Writings_and_Speeches_Vol26.pdf','bn','Bengali','PDF','SCANNED_FACSIMILE',8099954,280,'30be62579e48e5d3454f1f921ace00cfa024900a264af79db560fb1d8dd786bd','OCR_UNREVIEWED','2026-09-24T13:07:54.964419+00:00');
INSERT INTO "work_manifests" VALUES('DOC-EN-83F760A4','Volume_01_djvu.txt','English/Volume_01_djvu.txt','en','Latin','TXT','BORN_DIGITAL_TEXT',1257213,1177,'2939d59a693d777485ed2c9074448f9fb26f95a89441d453a06d7a5acc01aaae','SOURCE_TEXT','2026-09-24T13:07:54.978392+00:00');
INSERT INTO "work_manifests" VALUES('DOC-EN-C312EAC9','Volume_02_djvu.txt','English/Volume_02_djvu.txt','en','Latin','TXT','BORN_DIGITAL_TEXT',2356020,1110,'8ade69e4d152c0b0c90ab4922020bab1deb649ebbd0259b5e20eda053f89a9bf','SOURCE_TEXT','2026-09-24T13:07:54.999063+00:00');
INSERT INTO "work_manifests" VALUES('DOC-EN-23390BEE','Volume_03_djvu.txt','English/Volume_03_djvu.txt','en','Latin','TXT','BORN_DIGITAL_TEXT',1289106,651,'d7e1c6986d70ee358d867fa962d619f1292323c1f36771e56b973fce5dde7ecf','SOURCE_TEXT','2026-09-24T13:07:55.010347+00:00');
INSERT INTO "work_manifests" VALUES('DOC-EN-084F514B','Volume_04_djvu.txt','English/Volume_04_djvu.txt','en','Latin','TXT','BORN_DIGITAL_TEXT',879392,512,'2785e0f64d2b8d03892a6079acfee6457c008f65ff84d62b3db0aad78b5b5a80','SOURCE_TEXT','2026-09-24T13:07:55.018339+00:00');
INSERT INTO "work_manifests" VALUES('DOC-EN-8F9F3EA9','Volume_05_djvu.txt','English/Volume_05_djvu.txt','en','Latin','TXT','BORN_DIGITAL_TEXT',1310205,636,'b0a948485dd8dc77d17e2dccae0d1c12d3e213f8614195a20c16d853ebf87bd9','SOURCE_TEXT','2026-09-24T13:07:55.027502+00:00');
INSERT INTO "work_manifests" VALUES('DOC-EN-173EEB8C','Volume_06_djvu.txt','English/Volume_06_djvu.txt','en','Latin','TXT','BORN_DIGITAL_TEXT',1671241,1625,'4a8aecd423fdb99a47afd25bb05725d580625c2ff594640e3a6d94e648c0d1b3','SOURCE_TEXT','2026-09-24T13:07:55.046274+00:00');
INSERT INTO "work_manifests" VALUES('DOC-EN-1BEE7486','Volume_07_djvu.txt','English/Volume_07_djvu.txt','en','Latin','TXT','BORN_DIGITAL_TEXT',899157,468,'490b29aaceadc643f5a890599c0279ab49f456ac7296f4935f389b78b123e933','SOURCE_TEXT','2026-09-24T13:07:55.054387+00:00');
INSERT INTO "work_manifests" VALUES('DOC-EN-0DFACA59','Volume_08_djvu.txt','English/Volume_08_djvu.txt','en','Latin','TXT','BORN_DIGITAL_TEXT',1154833,891,'1e2f530290a0b7cec249f5657cf7fdc7d812d9e850839c5dbd4ee83bcddaaf9a','SOURCE_TEXT','2026-09-24T13:07:55.065559+00:00');
INSERT INTO "work_manifests" VALUES('DOC-EN-D67B9164','Volume_09_djvu.txt','English/Volume_09_djvu.txt','en','Latin','TXT','BORN_DIGITAL_TEXT',1217801,1029,'5e764303554458616876c631974db0531fb67924195106d499aab9a0c06ad414','SOURCE_TEXT','2026-09-24T13:07:55.078920+00:00');
INSERT INTO "work_manifests" VALUES('DOC-EN-8FFA06E1','Volume_10_djvu.txt','English/Volume_10_djvu.txt','en','Latin','TXT','BORN_DIGITAL_TEXT',2240511,1492,'31797ef197110a71d48685bd7994d922e64d4fd55dbb30c9946496b79d263743','SOURCE_TEXT','2026-09-24T13:07:55.103980+00:00');
INSERT INTO "work_manifests" VALUES('DOC-EN-E04199DA','Volume_11_djvu.txt','English/Volume_11_djvu.txt','en','Latin','TXT','BORN_DIGITAL_TEXT',1047709,942,'5aff8963448051cec8cdfa3fed974faedffda89d532543a98e98e06c7988af7a','SOURCE_TEXT','2026-09-24T13:07:55.118278+00:00');
INSERT INTO "work_manifests" VALUES('DOC-EN-29C0B5EC','Volume_12_djvu.txt','English/Volume_12_djvu.txt','en','Latin','TXT','BORN_DIGITAL_TEXT',1452849,1022,'e2ccbb91063d83a50abbe144925605371834799842c47260d7f0d0b7f315a430','SOURCE_TEXT','2026-09-24T13:07:55.134670+00:00');
INSERT INTO "work_manifests" VALUES('DOC-EN-D28D1F56','Volume_13_djvu.txt','English/Volume_13_djvu.txt','en','Latin','TXT','BORN_DIGITAL_TEXT',3044279,1859,'96c65c78782e7076b93f477938c9d52d21a606b78be67cb9fff887332782b691','SOURCE_TEXT','2026-09-24T13:07:55.161229+00:00');
INSERT INTO "work_manifests" VALUES('DOC-EN-A956566D','Volume_14_01_djvu.txt','English/Volume_14_01_djvu.txt','en','Latin','TXT','BORN_DIGITAL_TEXT',1900719,906,'4ed8b41d34531ef32d03a325cb09b16fa20788cd91f194f66e1e6e2e866fbc08','SOURCE_TEXT','2026-09-24T13:07:55.179795+00:00');
INSERT INTO "work_manifests" VALUES('DOC-EN-D29393F1','Volume_14_02_djvu.txt','English/Volume_14_02_djvu.txt','en','Latin','TXT','BORN_DIGITAL_TEXT',1495206,790,'a261d1128437a6122b31acb52a03b85213d1c1325d02b1555cdb09a272b8e8d2','SOURCE_TEXT','2026-09-24T13:07:55.193706+00:00');
INSERT INTO "work_manifests" VALUES('DOC-EN-5FE82FF7','Volume_15_djvu.txt','English/Volume_15_djvu.txt','en','Latin','TXT','BORN_DIGITAL_TEXT',2256650,1357,'365a122fcce8f44391723fdabb66e0e37f079b736f100cb7f7c6c316930bc696','SOURCE_TEXT','2026-09-24T13:07:55.212906+00:00');
INSERT INTO "work_manifests" VALUES('DOC-EN-E4A9EDCF','Volume_16_djvu.txt','English/Volume_16_djvu.txt','en','Latin','TXT','BORN_DIGITAL_TEXT',1047106,1926,'082a89203054bb1de88b173208ae421fc4c98a9ffa7df5e6858a18124665fec0','SOURCE_TEXT','2026-09-24T13:07:55.227954+00:00');
INSERT INTO "work_manifests" VALUES('DOC-EN-2545F054','Volume_17_01_djvu.txt','English/Volume_17_01_djvu.txt','en','Latin','TXT','BORN_DIGITAL_TEXT',994569,627,'e87ecea42c8d0b713dc46df13ed9b2f54714d2f525077875e6bf3a86b3dc78a0','SOURCE_TEXT','2026-09-24T13:07:55.237080+00:00');
INSERT INTO "work_manifests" VALUES('DOC-EN-F8AE7DE3','Volume_17_02_djvu.txt','English/Volume_17_02_djvu.txt','en','Latin','TXT','BORN_DIGITAL_TEXT',1071965,719,'34a0e2989b5f670ab169158db751aa9c8895fcb316407a82141b4a0d7d0e2717','SOURCE_TEXT','2026-09-24T13:07:55.245440+00:00');
INSERT INTO "work_manifests" VALUES('DOC-GU-AEC296A4','Gujarati_Writings_and_Speeches_Vol11.pdf','gujrati/Gujarati_Writings_and_Speeches_Vol11.pdf','gu','Gujarati','PDF','SCANNED_FACSIMILE',12042961,380,'b19f537ca3efdd42caae11558a23bbfdf8fde7c6d9fa3afa2aa8eaf3409c71e5','OCR_UNREVIEWED','2026-09-24T13:07:55.267340+00:00');
INSERT INTO "work_manifests" VALUES('DOC-GU-C1A5954A','Gujarati_Writings_and_Speeches_Vol14.pdf','gujrati/Gujarati_Writings_and_Speeches_Vol14.pdf','gu','Gujarati','PDF','SCANNED_FACSIMILE',6368965,226,'597a678cd0ce8268abdf75cb32448cb5248ad758f9d7e907fd0d6af896f152f4','OCR_UNREVIEWED','2026-09-24T13:07:55.282852+00:00');
INSERT INTO "work_manifests" VALUES('DOC-GU-B4DEC54B','Gujarati_Writings_and_Speeches_Vol15.pdf','gujrati/Gujarati_Writings_and_Speeches_Vol15.pdf','gu','Gujarati','PDF','SCANNED_FACSIMILE',17122356,590,'7a28cb726c9d72da4a5ad455ff54bc70d380d5141429867e1d93ee4976e5436d','OCR_UNREVIEWED','2026-09-24T13:07:55.312968+00:00');
INSERT INTO "work_manifests" VALUES('DOC-GU-D10CC281','Gujarati_Writings_and_Speeches_Vol16.pdf','gujrati/Gujarati_Writings_and_Speeches_Vol16.pdf','gu','Gujarati','PDF','SCANNED_FACSIMILE',15196848,538,'9aadb3e3df8f4df2c58f98f13c5f001e86fab0304491428de3f30cdb2c6e344b','OCR_UNREVIEWED','2026-09-24T13:07:55.340677+00:00');
INSERT INTO "work_manifests" VALUES('DOC-GU-79C60712','Gujarati_Writings_and_Speeches_Vol3.pdf','gujrati/Gujarati_Writings_and_Speeches_Vol3.pdf','gu','Gujarati','PDF','SCANNED_FACSIMILE',13435097,492,'5999f33204ebcad9c0a487d6ce8d4c962c0618b9a1c754e935ecd96801f85c7f','OCR_UNREVIEWED','2026-09-24T13:07:55.364613+00:00');
INSERT INTO "work_manifests" VALUES('DOC-GU-3ABD979A','Gujarati_Writings_and_Speeches_Vol4.pdf','gujrati/Gujarati_Writings_and_Speeches_Vol4.pdf','gu','Gujarati','PDF','SCANNED_FACSIMILE',7273023,277,'d193b69969d7a5f20e94ea08c47f20f9e5bb67fbc3c16e9a152fd4a907332270','OCR_UNREVIEWED','2026-09-24T13:07:55.381217+00:00');
INSERT INTO "work_manifests" VALUES('DOC-GU-AAB0EC6E','Gujarati_Writings_and_Speeches_Vol5.pdf','gujrati/Gujarati_Writings_and_Speeches_Vol5.pdf','gu','Gujarati','PDF','SCANNED_FACSIMILE',10066674,415,'386644e39739e780643e6735a4c38c3125de5318aef22e31b0382669cbbf9c23','OCR_UNREVIEWED','2026-09-24T13:07:55.405404+00:00');
INSERT INTO "work_manifests" VALUES('DOC-GU-EA12637B','Gujarati_Writings_and_Speeches_Vol6.pdf','gujrati/Gujarati_Writings_and_Speeches_Vol6.pdf','gu','Gujarati','PDF','SCANNED_FACSIMILE',7505061,233,'6118fcfc9f151e465d7983273fbfe427f9da1d8224daf6c62efc6e69c887a578','OCR_UNREVIEWED','2026-09-24T13:07:55.422605+00:00');
INSERT INTO "work_manifests" VALUES('DOC-GU-EC348EAC','Gujarati_Writings_and_Speeches_Vol9.pdf','gujrati/Gujarati_Writings_and_Speeches_Vol9.pdf','gu','Gujarati','PDF','SCANNED_FACSIMILE',6426393,202,'68fa6ace47b016b61159cb931b2202d4265f3709d3734056f056fb0e046e341d','OCR_UNREVIEWED','2026-09-24T13:07:55.437568+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-442DE5D5','dummy13.pdf','hindi/dummy13.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',8146260,210,'c54a91c5c8d2764f66e72f3610eb76be85457fed6e2b59ba441f6d3ee09b81d4','OCR_UNREVIEWED','2026-09-24T13:07:55.455177+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-0375D425','dummy14.pdf','hindi/dummy14.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',6504116,175,'239373c2e60089aabf744840d29799707ec0aa7bbebbfd12e788c387a9eeb9ab','OCR_UNREVIEWED','2026-09-24T13:07:55.474276+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-5847352B','dummy15.pdf','hindi/dummy15.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',18607113,503,'5ba353951e5df518715ba10a2e5c79a68408dc51891c2d7568356f26f9e60e56','OCR_UNREVIEWED','2026-09-24T13:07:55.507015+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-32E8CF36','dummy17.pdf','hindi/dummy17.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',4728121,104,'a9d5784d8084f818d2c3459ad065894870866ac407e0f5c2ae8c156c8cf276cb','OCR_UNREVIEWED','2026-09-24T13:07:55.520884+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-474F0AD9','dummy18.pdf','hindi/dummy18.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',14742576,400,'7e77bc8643fd56497b9d7f0edbf520ee1acb9f4d3dbc1b23fcd0eae00ed32340','OCR_UNREVIEWED','2026-09-24T13:07:55.549693+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-06E59733','dummy19.pdf','hindi/dummy19.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',6408594,167,'20a30f0d1dc4d6228ca9d4d44c2acfe07360adcbedc57ce49693075d417872aa','OCR_UNREVIEWED','2026-09-24T13:07:55.569371+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-7A238F31','dummy20.pdf','hindi/dummy20.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',12717371,392,'cbebb0672062cd14c79efd2c3f6cc062efb95a465101155f9184d5f8c6d2edb4','OCR_UNREVIEWED','2026-09-24T13:07:55.597111+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-FB9DD028','dummy21.pdf','hindi/dummy21.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',7609040,216,'53ad45358c00f68ffd7fc88876843b950d9824175c215d02cdbcd89145e99e8a','OCR_UNREVIEWED','2026-09-24T13:07:55.617931+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-AE2AF69E','hindi_vol1.pdf','hindi/hindi_vol1.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',11062559,299,'a4fdfeb0986897ca73260d6e6c7960e81e79b310e3657d65747ea59cabcbc7e7','OCR_UNREVIEWED','2026-09-24T13:07:55.647805+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-9D9E09AD','hindi_vol10.pdf','hindi/hindi_vol10.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',16836413,436,'7b36242175820f4538e0988e0dfb3b72a7b55cafb00c3550a4d08aeeee1ac738','OCR_UNREVIEWED','2026-09-24T13:07:55.685471+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-94BE9BB6','hindi_vol11.pdf','hindi/hindi_vol11.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',3794477,362,'06b6a47c5c15c9911d20f3875ae004ed0c685c7cc5ae57be6a89e348dae66ca4','OCR_UNREVIEWED','2026-09-24T13:07:55.739133+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-B7FA03A5','hindi_vol12.pdf','hindi/hindi_vol12.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',15947112,422,'d1989d710013150732881247993df5dde7c48fb325b3d81f3c0e4f027f3a3ddf','OCR_UNREVIEWED','2026-09-24T13:07:55.770112+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-DC1C87C3','hindi_vol2.pdf','hindi/hindi_vol2.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',11213776,297,'6b92caf35ee9eb1c4e42ff14aa2a8ca90026b38b495de73d5080e948dc58381b','OCR_UNREVIEWED','2026-09-24T13:07:55.796468+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-0F6602CC','hindi_vol3.pdf','hindi/hindi_vol3.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',15243385,367,'4a78b85a796334d59af550243a74b50ecfa60fd89904f4955fa6e5a4bffa1631','OCR_UNREVIEWED','2026-09-24T13:07:55.827277+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-93D7E3D3','hindi_vol4.pdf','hindi/hindi_vol4.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',9960672,236,'60a1fb0107d9da7ab3d9f80aaec24453ca9193f79feadee4b7ec896a4713de3c','OCR_UNREVIEWED','2026-09-24T13:07:55.853483+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-6A4248FF','hindi_vol5.pdf','hindi/hindi_vol5.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',14451215,358,'11320c85127ee908d4c9d360b66fc885fa8d8080ea63d3fdb3428daba54dcacb','OCR_UNREVIEWED','2026-09-24T13:07:55.896088+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-FB489C3C','hindi_vol6.pdf','hindi/hindi_vol6.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',8317212,192,'2f878160b68f9130e27b277df4cb753dd5010608df1e547ce30e80c664c98591','OCR_UNREVIEWED','2026-09-24T13:07:55.929757+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-70DCD879','hindi_vol7.pdf','hindi/hindi_vol7.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',14870281,408,'7896a5965d186028f2bf977e9299b4513d68fe8890668feb883a4892b5489a15','OCR_UNREVIEWED','2026-09-24T13:07:55.967361+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-AB38FF41','hindi_vol8.pdf','hindi/hindi_vol8.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',12910377,362,'fc1c242de387ceaa4002472567ca7b08d026d31c49fa47d6b453ba3e1093792c','OCR_UNREVIEWED','2026-09-24T13:07:55.998073+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-4020693B','hindi_vol9.pdf','hindi/hindi_vol9.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',7444121,194,'76906dd1118d89473e1126811b3a3fdd30d5088f022f687c79d0baa5cf81922a','OCR_UNREVIEWED','2026-09-24T13:07:56.018327+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-B8ADEEDC','vol22.pdf','hindi/vol22.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',16395477,568,'db16cd73cdea9419f39758d403b13095457ab6db19efabb63d753f6406b49942','OCR_UNREVIEWED','2026-09-24T13:07:56.054656+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-75F63487','vol23.pdf','hindi/vol23.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',8623507,182,'39e20cc14163ae10aab2d9a77dc07b5c89310516b3e9637bb0e39a367e2c44be','OCR_UNREVIEWED','2026-09-24T13:07:56.079166+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-D1FB152E','vol24.pdf','hindi/vol24.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',12972804,407,'29413ef1d5526ade29039fbaf915d0054852d0569de65c8f70ea4500b68a1bf7','OCR_UNREVIEWED','2026-09-24T13:07:56.125776+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-AFF1954E','vol25.pdf','hindi/vol25.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',4813506,101,'f5d2c00ee2de849cbbc6a287603eaf5e39c7a1fd0ff4f2fb6622401a0375876d','OCR_UNREVIEWED','2026-09-24T13:07:56.143635+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-9FA38D06','vol26.pdf','hindi/vol26.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',11521006,358,'9a3ced5e521fa441da3f6d5b83b822449fc43ddd7a604bc9f71dfe7c48cefb95','OCR_UNREVIEWED','2026-09-24T13:07:56.174500+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-77731510','vol27.pdf','hindi/vol27.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',6154352,128,'46efa6171362aeacc8c0bc7dfd609ec000f3bae996f0edfbe4298960a2130b63','OCR_UNREVIEWED','2026-09-24T13:07:56.197686+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-8BC7F82B','vol28.pdf','hindi/vol28.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',9302484,233,'61d43a3908daf0235b104fcb52616dbd01d5bf890c60255f8c101af773c54ffc','OCR_UNREVIEWED','2026-09-24T13:07:56.219707+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-DCC56AF8','vol29.pdf','hindi/vol29.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',13477482,388,'45928ee7992edfdda0ff8bfc6cc79a06e4ced8552b9fa90dfa9ddea800dc6e35','OCR_UNREVIEWED','2026-09-24T13:07:56.247888+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-41E92E81','vol30.pdf','hindi/vol30.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',9185945,243,'bf5b4cda9f65b9e28907ba9bcaf3c67b673b5fe89da17719c3e7b742fc922af4','OCR_UNREVIEWED','2026-09-24T13:07:56.271298+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-993D20A3','vol31.pdf','hindi/vol31.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',12379074,818,'62981eb55f5042bda706992c1967578eb6b8df59809e9f83191762e0a7d5f4e2','OCR_UNREVIEWED','2026-09-24T13:07:56.312411+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-B2407AF3','vol32.pdf','hindi/vol32.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',11025934,614,'4b26eee80ff9e16578441b423974d5d95a41ab76a7f75fadfddec21a50346f20','OCR_UNREVIEWED','2026-09-24T13:07:56.340631+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-B05BEAD6','vol33.pdf','hindi/vol33.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',10908216,638,'3f6d962cfec6143b0309e80735f91b5432f7b45c5288ff91bf1e38485442abc3','OCR_UNREVIEWED','2026-09-24T13:07:56.367645+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-2EC6ED2B','vol34.pdf','hindi/vol34.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',13952982,391,'f599c66522f4166bd2cc8eff1d5eba59fbcb3920c10e434905f42061423ef0bd','OCR_UNREVIEWED','2026-09-24T13:07:56.402449+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-834DE374','vol35.pdf','hindi/vol35.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',14266643,499,'e33f9d18efce854c13b748227723ef734164e05090077c9d2782133f828a1dce','OCR_UNREVIEWED','2026-09-24T13:07:56.440252+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-B8D99745','vol36.pdf','hindi/vol36.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',15766655,559,'59dd6a5d0cdae869a612d1241674bfd3b4c61ea0d46ccfe52a12185f23c4c7d9','OCR_UNREVIEWED','2026-09-24T13:07:56.472576+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-2FF00D60','vol37.pdf','hindi/vol37.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',17241533,562,'0f8c65feea1390c5ac790088789e6ff5af0b92ea6e7b4090b11962c433dffcd1','OCR_UNREVIEWED','2026-09-24T13:07:56.505038+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-8085534D','vol38.pdf','hindi/vol38.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',19444062,560,'6f62ebf2cf1c16f994a16b4ac0ead9922135ad99db00c92a377ef2e574309909','OCR_UNREVIEWED','2026-09-24T13:07:56.545110+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-76111054','vol39.pdf','hindi/vol39.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',18871622,552,'5a06fa4d5edf25237dd6ccdc5c9d6c1939a6ad2eefa35945aef9632e778b9d09','OCR_UNREVIEWED','2026-09-24T13:07:56.581421+00:00');
INSERT INTO "work_manifests" VALUES('DOC-HI-7F7F1F13','vol40.pdf','hindi/vol40.pdf','hi','Devanagari','PDF','SCANNED_FACSIMILE',18398763,530,'43a3a9022cb8eee37e1b6c7835b45ce15cbc09e92038a1a6928477ea67646063','OCR_UNREVIEWED','2026-09-24T13:07:56.617461+00:00');
INSERT INTO "work_manifests" VALUES('DOC-TA-6772640F','Tamil_Volume10.pdf','tamil/Tamil_Volume10.pdf','ta','Tamil','PDF','SCANNED_FACSIMILE',24162725,586,'a91921e72c2310ed3f14d2f68fa39a1c5c9ff55da15050cd4454b3b4c102bb98','OCR_UNREVIEWED','2026-09-24T13:07:56.665277+00:00');
INSERT INTO "work_manifests" VALUES('DOC-TA-C2BF6312','Tamil_Volume13.pdf','tamil/Tamil_Volume13.pdf','ta','Tamil','PDF','SCANNED_FACSIMILE',13545196,370,'1e98fbacd0597dca2cb858e01a6525114ab546855433538bdff0ce0aaf0bb5cc','OCR_UNREVIEWED','2026-09-24T13:07:56.692200+00:00');
INSERT INTO "work_manifests" VALUES('DOC-TA-0BC1493E','Tamil_Volume14.pdf','tamil/Tamil_Volume14.pdf','ta','Tamil','PDF','SCANNED_FACSIMILE',8361912,250,'98e36131be71d6e8964dd7128534df18aa94b1935c717e70807e6d65b5e5686a','OCR_UNREVIEWED','2026-09-24T13:07:56.711035+00:00');
INSERT INTO "work_manifests" VALUES('DOC-TA-A01CE0C5','Tamil_Volume15.pdf','tamil/Tamil_Volume15.pdf','ta','Tamil','PDF','SCANNED_FACSIMILE',26572591,717,'e88d1428a88f9077eb6a668d0029e1afc4a3f66b4dc1238543961739046aa52c','OCR_UNREVIEWED','2026-09-24T13:07:56.762703+00:00');
INSERT INTO "work_manifests" VALUES('DOC-TA-7E383E64','Tamil_Volume16.pdf','tamil/Tamil_Volume16.pdf','ta','Tamil','PDF','SCANNED_FACSIMILE',24771580,674,'52c0f5143a3ae4c72cbc5e1ecfb6fa9dd16badcfe8d2b756cc7bad121a6bbcef','OCR_UNREVIEWED','2026-09-24T13:07:56.811806+00:00');
INSERT INTO "work_manifests" VALUES('DOC-TA-A93C7B4D','Tamil_Volume17.pdf','tamil/Tamil_Volume17.pdf','ta','Tamil','PDF','SCANNED_FACSIMILE',5862156,156,'ed56bec17a4ed7bb92eec53b9953bb26cfb62573f7c372203ff2d0fda9a7e22f','OCR_UNREVIEWED','2026-09-24T13:07:56.829423+00:00');
INSERT INTO "work_manifests" VALUES('DOC-TA-68B029B8','Tamil_Volume18.pdf','tamil/Tamil_Volume18.pdf','ta','Tamil','PDF','SCANNED_FACSIMILE',20058186,552,'717956a55693940bb4161841900e2c5b09f990af2406b3ce0bb7d3191a16d1db','OCR_UNREVIEWED','2026-09-24T13:07:56.874095+00:00');
INSERT INTO "work_manifests" VALUES('DOC-TA-D559C801','Tamil_Volume19.pdf','tamil/Tamil_Volume19.pdf','ta','Tamil','PDF','SCANNED_FACSIMILE',7181163,206,'c624eea884b9ebc2357c9f9c3a2a1c24c5c740e15b3c64954a3af9f5a83aa0e1','OCR_UNREVIEWED','2026-09-24T13:07:56.892830+00:00');
INSERT INTO "work_manifests" VALUES('DOC-TA-0FEF03E3','Tamil_Volume20.pdf','tamil/Tamil_Volume20.pdf','ta','Tamil','PDF','SCANNED_FACSIMILE',13177662,443,'2813f63218a3c2b11e9dd7140a893206c963018f2181e25aa2c348c20b5ce98d','OCR_UNREVIEWED','2026-09-24T13:07:56.926390+00:00');
INSERT INTO "work_manifests" VALUES('DOC-TA-8D57B6C8','Tamil_Volume21.pdf','tamil/Tamil_Volume21.pdf','ta','Tamil','PDF','SCANNED_FACSIMILE',11392603,406,'738408ac5d6f7f041f1c1ed9d9337374d968f81b07d781fd865bf77051324c7b','OCR_UNREVIEWED','2026-09-24T13:07:56.954643+00:00');
INSERT INTO "work_manifests" VALUES('DOC-TA-A290D58F','Tamil_Volume23.pdf','tamil/Tamil_Volume23.pdf','ta','Tamil','PDF','SCANNED_FACSIMILE',12056790,287,'ac893401d6cc7f07b8707e612223257a6b7afe736bf3dd131b4a554be7bbba20','OCR_UNREVIEWED','2026-09-24T13:07:56.982176+00:00');
INSERT INTO "work_manifests" VALUES('DOC-TA-AC288DFE','Tamil_Volume24.pdf','tamil/Tamil_Volume24.pdf','ta','Tamil','PDF','SCANNED_FACSIMILE',1143685,4,'d25252a2d7627c4e51da4dc5a413772d3a620a2e8779d01a22fc8e197c78e1f5','OCR_UNREVIEWED','2026-09-24T13:07:56.993776+00:00');
INSERT INTO "work_manifests" VALUES('DOC-TA-B5D842F3','Tamil_Volume25.pdf','tamil/Tamil_Volume25.pdf','ta','Tamil','PDF','SCANNED_FACSIMILE',5133674,138,'25f07a33b8102b6c9ef1f9f7f5da1f661ee57920d29765debe877ed08eff84b5','OCR_UNREVIEWED','2026-09-24T13:07:57.008237+00:00');
INSERT INTO "work_manifests" VALUES('DOC-TA-02CC3B89','Tamil_Volume26.pdf','tamil/Tamil_Volume26.pdf','ta','Tamil','PDF','SCANNED_FACSIMILE',15847334,484,'c0b5013ee993ea3001f256a77325a7a43b68f035c501fd196627ebfc4f5f21cd','OCR_UNREVIEWED','2026-09-24T13:07:57.047277+00:00');
INSERT INTO "work_manifests" VALUES('DOC-TA-F4EB92B8','Tamil_Volume27.pdf','tamil/Tamil_Volume27.pdf','ta','Tamil','PDF','SCANNED_FACSIMILE',12960084,369,'e101c6ed8814c26054a1553890b70283d5ae64c8f5ef38bffe904d1993bd0b89','OCR_UNREVIEWED','2026-09-24T13:07:57.075725+00:00');
INSERT INTO "work_manifests" VALUES('DOC-TA-C7ADF51F','Tamil_Volume28.pdf','tamil/Tamil_Volume28.pdf','ta','Tamil','PDF','SCANNED_FACSIMILE',10418912,304,'96b576c9fa7602d21f3d905db873adef8211e8bc2119fb9f8a702227bed90d24','OCR_UNREVIEWED','2026-09-24T13:07:57.098804+00:00');
INSERT INTO "work_manifests" VALUES('DOC-TA-86ED9381','Tamil_Volume29.pdf','tamil/Tamil_Volume29.pdf','ta','Tamil','PDF','SCANNED_FACSIMILE',17797400,502,'fbdb832b3977f8ce6031d0915f6702e451ca1703d9bdf2c24091b0c21b3a3d27','OCR_UNREVIEWED','2026-09-24T13:07:57.142494+00:00');
INSERT INTO "work_manifests" VALUES('DOC-TA-8059E6AB','Tamil_Volume3.pdf','tamil/Tamil_Volume3.pdf','ta','Tamil','PDF','SCANNED_FACSIMILE',20329150,516,'1c184558433b39d3148469a1426979b1227aae7bee8cdd1bff4ee6c135f57049','OCR_UNREVIEWED','2026-09-24T13:07:57.187605+00:00');
INSERT INTO "work_manifests" VALUES('DOC-TA-1A77E2C4','Tamil_Volume30.pdf','tamil/Tamil_Volume30.pdf','ta','Tamil','PDF','SCANNED_FACSIMILE',11443275,342,'ba32b4dede0249dfb7cdff511705dd29aa970c5681029a30625bd683f49b43b6','OCR_UNREVIEWED','2026-09-24T13:07:57.212857+00:00');
INSERT INTO "work_manifests" VALUES('DOC-TA-6E6F938D','Tamil_Volume31(1).pdf','tamil/Tamil_Volume31(1).pdf','ta','Tamil','PDF','SCANNED_FACSIMILE',19658815,613,'d56f2de097b3ee4a871918135f9e25469d6e9b21cf134761cf8511b63c9bb7a6','OCR_UNREVIEWED','2026-09-24T13:07:57.247599+00:00');
INSERT INTO "work_manifests" VALUES('DOC-TA-8DC84C71','Tamil_Volume31(2).pdf','tamil/Tamil_Volume31(2).pdf','ta','Tamil','PDF','SCANNED_FACSIMILE',21678594,535,'353497e7673392aebea20c6d6ae374de28244681e1f09ae77cc3efdff3de575b','OCR_UNREVIEWED','2026-09-24T13:07:57.288275+00:00');
INSERT INTO "work_manifests" VALUES('DOC-TA-975B4827','Tamil_Volume35.pdf','tamil/Tamil_Volume35.pdf','ta','Tamil','PDF','SCANNED_FACSIMILE',20809151,610,'2eaeeb1891b82f6ae037f2accc8db61883694837e76780e5bc29c2a5ba58f262','OCR_UNREVIEWED','2026-09-24T13:07:57.338614+00:00');
INSERT INTO "work_manifests" VALUES('DOC-TA-B90B47D9','Tamil_Volume36.pdf','tamil/Tamil_Volume36.pdf','ta','Tamil','PDF','SCANNED_FACSIMILE',23520840,720,'4fc7abf7c858fc40ac8c6fd419e7b8ab522f30b316fad07a701ccebf9f10d718','OCR_UNREVIEWED','2026-09-24T13:07:57.382388+00:00');
INSERT INTO "work_manifests" VALUES('DOC-TA-E1712EDC','Tamil_Volume37.pdf','tamil/Tamil_Volume37.pdf','ta','Tamil','PDF','SCANNED_FACSIMILE',26170120,765,'64904a8306ff04a34869abe0faac955eda80dff81dce23df100597cc454fa164','OCR_UNREVIEWED','2026-09-24T13:07:57.431619+00:00');
INSERT INTO "work_manifests" VALUES('DOC-TA-0D8D32E1','Tamil_Volume4.pdf','tamil/Tamil_Volume4.pdf','ta','Tamil','PDF','SCANNED_FACSIMILE',12853651,303,'e5a254cc49e90b4dc7d445f29aa1b51f4371e8dbfa4a43dd6be9f9ef8d12d0b7','OCR_UNREVIEWED','2026-09-24T13:07:57.459295+00:00');
INSERT INTO "work_manifests" VALUES('DOC-TA-D4FA1CD3','Tamil_Volume5.pdf','tamil/Tamil_Volume5.pdf','ta','Tamil','PDF','SCANNED_FACSIMILE',19549802,474,'614fd5e7cf88f744b2d0b2ff8c0560e275ba76abd4eb6af5d38e084074de3d34','OCR_UNREVIEWED','2026-09-24T13:07:57.498226+00:00');
INSERT INTO "work_manifests" VALUES('DOC-TA-4241BBA6','Tamil_Volume6.pdf','tamil/Tamil_Volume6.pdf','ta','Tamil','PDF','SCANNED_FACSIMILE',9231632,216,'5ae917f2dfe29cc4adb4f95bc2251b675502b6300c7e850933335ae2547fe913','OCR_UNREVIEWED','2026-09-24T13:07:57.526745+00:00');
INSERT INTO "work_manifests" VALUES('DOC-TA-D9E8D0C7','Tamil_Volume7.pdf','tamil/Tamil_Volume7.pdf','ta','Tamil','PDF','SCANNED_FACSIMILE',17849086,470,'ef72b9dc38f32cfb3ce8b212c72a3381b13037f9a77135cdaf8c68ac4bb24a05','OCR_UNREVIEWED','2026-09-24T13:07:57.567758+00:00');
INSERT INTO "work_manifests" VALUES('DOC-TA-0BBB0DEA','Tamil_Volume8.pdf','tamil/Tamil_Volume8.pdf','ta','Tamil','PDF','SCANNED_FACSIMILE',18049338,502,'5ee25cca39a5c77f7a591326cd4735885d60769e16c3509f2fcf433280a86bf6','OCR_UNREVIEWED','2026-09-24T13:07:57.619151+00:00');
INSERT INTO "work_manifests" VALUES('DOC-TA-E794A2CF','Tamil_Volume9.pdf','tamil/Tamil_Volume9.pdf','ta','Tamil','PDF','SCANNED_FACSIMILE',8060437,206,'5d6e71312b4fb84a96a5e08b550b28047c9f10f09170a8a4efcb56d0cad049d2','OCR_UNREVIEWED','2026-09-24T13:07:57.644622+00:00');
INSERT INTO "work_manifests" VALUES('DOC-TA-0489E9B1','Tamil_volume2.pdf','tamil/Tamil_volume2.pdf','ta','Tamil','PDF','SCANNED_FACSIMILE',1143685,4,'d25252a2d7627c4e51da4dc5a413772d3a620a2e8779d01a22fc8e197c78e1f5','OCR_UNREVIEWED','2026-09-24T13:07:57.654881+00:00');
CREATE TABLE work_relationships (
    id TEXT PRIMARY KEY,
    source_document_id TEXT NOT NULL,
    target_document_id TEXT NOT NULL,
    work_id TEXT,
    relationship_type TEXT NOT NULL, -- same_work, edition_of, translation_of, related_work
    confidence_score REAL NOT NULL,
    verification_status TEXT NOT NULL, -- CANDIDATE, VERIFIED, REJECTED
    evidence_notes TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (source_document_id) REFERENCES work_manifests(archival_id) ON DELETE CASCADE,
    FOREIGN KEY (target_document_id) REFERENCES work_manifests(archival_id) ON DELETE CASCADE,
    FOREIGN KEY (work_id) REFERENCES multilingual_works(id) ON DELETE SET NULL
);
CREATE INDEX idx_collections_slug ON collections(slug);
CREATE INDEX idx_ao_stable_id  ON archival_objects(stable_id);
CREATE INDEX idx_ao_type       ON archival_objects(object_type);
CREATE INDEX idx_ao_collection ON archival_objects(collection_id);
CREATE INDEX idx_ao_status     ON archival_objects(review_status, publication_status);
CREATE INDEX idx_ao_language   ON archival_objects(language);
CREATE INDEX idx_files_object ON files(object_id);
CREATE INDEX idx_files_type   ON files(file_type);
CREATE INDEX idx_pages_object ON pages(object_id);
CREATE INDEX idx_pages_status ON pages(processing_status);
CREATE INDEX idx_media_object ON media_assets(object_id);
CREATE INDEX idx_sections_object ON document_sections(object_id);
CREATE INDEX idx_chunks_object   ON document_chunks(object_id);
CREATE INDEX idx_chunks_page     ON document_chunks(page_id);
CREATE INDEX idx_chunks_section  ON document_chunks(section_id);
CREATE INDEX idx_chunks_language ON document_chunks(language);
CREATE INDEX idx_embeddings_chunk ON embeddings(chunk_id);
CREATE INDEX idx_rel_subject ON relationships(subject_type, subject_id);
CREATE INDEX idx_rel_object  ON relationships(object_type, object_id);
CREATE INDEX idx_jobs_status ON processing_jobs(status, priority);
CREATE INDEX idx_jobs_object ON processing_jobs(object_id);
CREATE INDEX idx_jobs_type   ON processing_jobs(job_type);
CREATE INDEX idx_pev_object ON preservation_events(object_id);
CREATE INDEX idx_pev_type   ON preservation_events(event_type);
CREATE INDEX idx_audit_user     ON audit_events(user_id);
CREATE INDEX idx_audit_resource ON audit_events(resource, resource_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sim_type ON search_index_meta(index_type);
CREATE INDEX idx_embeddings_model ON embeddings(model_name);
CREATE INDEX idx_embeddings_version ON embeddings(embedding_version);
CREATE INDEX idx_chunks_page_number ON document_chunks(page_number);
CREATE INDEX idx_pev_date ON preservation_events(event_date);
CREATE INDEX idx_audit_action ON audit_events(action, created_at);
CREATE INDEX idx_entities_type_status ON entities(entity_type, status);
CREATE INDEX idx_entities_name ON entities(canonical_name);
CREATE INDEX idx_entities_object ON entities(object_id);
CREATE INDEX idx_aliases_lookup ON entity_aliases(alias);
CREATE INDEX idx_aliases_entity ON entity_aliases(entity_id);
CREATE INDEX idx_reviews_entity ON entity_reviews(entity_id);
CREATE INDEX idx_reviews_status ON entity_reviews(status);
CREATE INDEX idx_rel_status ON relationships(status);
CREATE INDEX idx_rel_evidence ON relationships(evidence_chunk_id);
CREATE INDEX idx_rel_predicate ON relationships(predicate);
CREATE INDEX idx_relev_rel ON relationship_evidence(relationship_id);
CREATE INDEX idx_relev_chunk ON relationship_evidence(chunk_id);
CREATE INDEX idx_timeline_date ON timeline_events(start_date);
CREATE INDEX idx_timeline_category ON timeline_events(category);
CREATE INDEX idx_timeline_status ON timeline_events(publication_status);
CREATE INDEX idx_stories_slug ON story_collections(slug);
CREATE INDEX idx_stories_published ON story_collections(published);
CREATE INDEX idx_story_items_story ON story_items(story_id, sequence);
CREATE INDEX idx_trans_hash_lang ON translations_cache(source_text_hash, target_language);
CREATE INDEX idx_trans_chunk ON translations_cache(chunk_id);
CREATE INDEX idx_tts_hash_lang ON tts_cache(source_text_hash, language);
CREATE INDEX idx_tts_type ON tts_cache(generation_type);
CREATE INDEX idx_tseg_media ON transcript_segments(media_asset_id);
CREATE INDEX idx_tseg_time ON transcript_segments(media_asset_id, start_time);
CREATE INDEX idx_mpage_lookup ON multimodal_page_analyses(object_id, page_number);
CREATE INDEX idx_ent_loc ON entity_localizations(entity_id, language);
CREATE INDEX idx_time_loc ON timeline_localizations(event_id, language);
CREATE INDEX idx_work_manifests_lang ON work_manifests(language);
CREATE INDEX idx_work_relationships_src ON work_relationships(source_document_id);
CREATE INDEX idx_work_relationships_tgt ON work_relationships(target_document_id);
CREATE INDEX idx_work_alignments_work ON work_alignments(work_id);
CREATE INDEX idx_ocr_pages_doc_pno ON ocr_pages(document_id, page_number);
CREATE INDEX idx_eval_dataset_type ON eval_dataset_items(dataset_type);
CREATE INDEX idx_digital_files_object ON digital_files(archival_object_id);
PRAGMA writable_schema=OFF;
COMMIT;
