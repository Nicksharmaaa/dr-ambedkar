export type Language = 'en' | 'hi' | 'mr' | 'ta' | 'bn';

export type UserMode = 'visitor' | 'student' | 'researcher' | 'archivist';

export type ContentType = 
  | 'all'
  | 'book'
  | 'speech'
  | 'debate'
  | 'manuscript'
  | 'photograph'
  | 'audio'
  | 'video';

export interface ArchivalDocument {
  id: string;
  title: string;
  author?: string;
  titleLocal?: Partial<Record<Language, string>>;
  type: 'book' | 'speech' | 'debate' | 'manuscript' | 'photograph';
  categoryLabel: string;
  date: string;
  year: number;
  collection: string;
  language: string;
  source: string;
  accessionNo: string;
  accessRights?: 'Public Domain' | 'Fair Use Educational' | 'Archival Restricted';
  mediaFormat?: 'pdf' | 'audio' | 'video' | 'image' | 'text';
  shortDescription: string;
  shortDescriptionLocal?: Partial<Record<Language, string>>;
  fullText: string;
  fullTextLocal?: Partial<Record<Language, string>>;
  ocrConfidence: number;
  scannedPageUrl?: string;
  keyTopics: string[];
  aiSummary: {
    en: string;
    hi: string;
    mr: string;
    ta?: string;
    bn?: string;
  };
  kidSummary?: {
    en: string;
    hi?: string;
    mr?: string;
    ta?: string;
    bn?: string;
  };
  relatedDocumentIds: string[];
  thumbnailUrl?: string;
  audioDuration?: string;
  location?: string;
}

export interface TimelineEvent {
  id: string;
  year: number;
  dateString: string;
  title: string;
  titleLocal?: Partial<Record<Language, string>>;
  era: 'Early Life & Education' | 'Social Awakening' | 'Social Movements' | 'Political Life' | 'Constitution & Governance' | 'Later Life & Philosophy' | string;
  location: string;
  description: string;
  descriptionLocal?: Partial<Record<Language, string>>;
  quote?: string;
  quoteAttribution?: string;
  imageUrl?: string;
  relatedDocIds: string[];
  mediaType?: 'photo' | 'document' | 'speech' | 'video';
  videoTitle?: string;
  videoDuration?: string;
  highlights?: string[];
}

export interface MediaItem {
  id: string;
  title: string;
  titleLocal?: Partial<Record<Language, string>>;
  type: 'speech' | 'interview' | 'documentary' | 'historical_recording';
  typeLabel: string;
  duration: string;
  date: string;
  year: number;
  audioUrl?: string;
  thumbnailUrl?: string;
  description: string;
  transcript: {
    en: string;
    hi: string;
    mr: string;
    ta?: string;
    bn?: string;
  };
  relatedDocIds: string[];
}

export interface SourceCitation {
  docId: string;
  docTitle: string;
  year: number;
  volumeOrSection: string;
  pageNo?: string;
  excerpt: string;
  relevanceScore: number;
}

export interface ResearchAnswer {
  id: string;
  query: string;
  answer: {
    en: string;
    hi: string;
    mr: string;
    ta?: string;
    bn?: string;
  };
  groundingStatus: 'Source-grounded response' | 'Verified archival record';
  confidenceScore: number;
  sources: SourceCitation[];
  suggestedFollowUps?: string[];
}

export interface SavedCollectionItem {
  id: string;
  itemId: string;
  itemType: 'document' | 'media' | 'timeline' | 'qa';
  title: string;
  dateSaved: string;
  note?: string;
  category: 'Writings' | 'Debates' | 'Speeches' | 'Media' | 'Research Notes';
}

export interface AccessibilitySettings {
  textSize: 'normal' | 'large' | 'xlarge';
  highContrast: boolean;
  audioNarrationActive: boolean;
  soundEffectsEnabled: boolean;
  kioskMode: boolean;
  kidMode: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  questionLocal?: Partial<Record<Language, string>>;
  options: string[];
  optionsLocal?: Partial<Record<Language, string[]>>;
  correctIndex: number;
  explanation: string;
  explanationLocal?: Partial<Record<Language, string>>;
  sourceCitation: string;
  category: 'Constitution' | 'Philosophy' | 'Movements' | 'Writings';
}

export interface QuoteItem {
  id: string;
  quote: string;
  quoteLocal?: Partial<Record<Language, string>>;
  work: string;
  year: number;
  theme: 'Democracy' | 'Social Justice' | 'Education' | 'Women Rights' | 'Constitutional Morality';
  context: string;
}

export interface PhilosophyConcept {
  id: string;
  title: string;
  titleLocal?: Partial<Record<Language, string>>;
  tagline: string;
  taglineLocal?: Partial<Record<Language, string>>;
  description: string;
  descriptionLocal?: Partial<Record<Language, string>>;
  famousQuote: string;
  famousQuoteLocal?: Partial<Record<Language, string>>;
  relatedDocId: string;
  color: string;
  iconName: string;
}

export interface SoundboardClip {
  id: string;
  title: string;
  titleLocal?: Partial<Record<Language, string>>;
  speaker: string;
  event: string;
  eventLocal?: Partial<Record<Language, string>>;
  year: number;
  duration: string;
  tags: string[];
  quote: string;
  quoteLocal?: Partial<Record<Language, string>>;
  fullDocId: string;
}

export interface HistoricalPhoto {
  id: string;
  title: string;
  titleLocal?: Partial<Record<Language, string>>;
  year: number;
  dateString: string;
  location: string;
  era: 'Early Life & Education' | 'Early Life & Studies' | 'Social Movements' | 'Civil Rights & Movements' | 'Constitution & Governance' | 'Public Life' | 'Later Life & Philosophy' | string;
  imageUrl: string;
  aspectRatio: 'portrait' | 'landscape' | 'wide' | 'square';
  caption: string;
  captionLocal?: Partial<Record<Language, string>>;
  historicalContext: string;
  accessionNumber: string;
  archiveProvenance: string;
  photographerOrAgency: string;
  relatedDocIds?: string[];
  dimensions?: string;
  medium?: string;
}

// Knowledge Graph Interfaces
export type GraphCategory = 'person' | 'work' | 'concept' | 'event' | 'place' | 'organization' | 'article' | 'speech' | 'book' | 'manuscript' | 'document' | 'figure' | 'media' | 'movement' | 'institution';

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  category: GraphCategory;
  shortDesc: string;
  year?: number;
  date?: string;
  linkedDocId?: string;
  imageUrl?: string;
  articleNo?: string;
  iconName?: string;
  significance: string;
  keyFacts?: string[];
  historicalContext?: string;
  whyItMatters?: string;
  cluster?: string;
  color: string;
  aliases?: string[];
  bawsVolume?: string;
  provenanceCitation?: string;
  x?: number;
  y?: number;
}

export interface KnowledgeGraphLink {
  id: string;
  sourceId: string;
  targetId: string;
  relation: string;
  notes?: string;
}

// AI Story Mode (Guided Historical Pathways)
export interface StoryStep {
  stepNumber: number;
  title: string;
  location: string;
  year: number;
  narrativeText: string;
  kidFriendlyText: string;
  audioVoiceoverExcerpt: string;
  imageUrl: string;
  imageCaption: string;
  videoTitle?: string;
  videoDuration?: string;
  videoReelClip?: string;
  badgeReward?: string;
  kidFriendlyStickers?: string[];
  archivalDocId?: string;
  interactiveQuestion?: {
    prompt: string;
    options: string[];
    correctIndex: number;
    funFact: string;
  };
}

export interface GuidedStoryPath {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  era: string;
  durationMinutes: number;
  heroImage: string;
  description: string;
  kidSummary: string;
  steps: StoryStep[];
}

// Document Comparison
export interface DocComparisonPreset {
  id: string;
  title: string;
  docAId: string;
  docBId: string;
  commonThemes: string[];
  keyDifferences: string[];
  historicalEvolution: string;
  kidFriendlyLesson: string;
}

// Admin Dashboard OCR Job
export interface OCRJobRecord {
  id: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  status: 'Completed' | 'Pending Review' | 'Processing';
  engine: 'PaddleOCR PP-OCRv5' | 'PaddleOCR PP-StructureV3' | 'Tesseract OCR v5' | string;
  confidenceScore: number;
  titleExtracted: string;
  languageDetected: string;
  accessRights: 'Public Domain' | 'Fair Use Educational' | 'Archival Restricted';
  rawOcrSnippet: string;
  cleanedTextSnippet: string;
  thumbnailUrl?: string;
  sha256Checksum?: string;
  pageCount?: number;
  wordCount?: number;
  charCount?: number;
  curatorNotes?: string;
  isMobileScan?: boolean;
}
