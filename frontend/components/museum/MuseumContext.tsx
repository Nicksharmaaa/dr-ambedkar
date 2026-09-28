'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Language, AccessibilitySettings, ArchivalDocument, SavedCollectionItem, UserMode 
} from '@/types/museum';
import { ARCHIVE_DOCUMENTS } from '@/data/archiveData';
import { soundEffects } from '@/utils/soundEffects';
import { api } from '@/lib/api';

interface MuseumContextType {
  currentTab: string;
  navigateToTab: (tab: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  userMode: UserMode;
  setUserMode: (mode: UserMode) => void;
  accessibility: AccessibilitySettings;
  setAccessibility: React.Dispatch<React.SetStateAction<AccessibilitySettings>>;
  isAccessibilityModalOpen: boolean;
  setIsAccessibilityModalOpen: (open: boolean) => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  isVoiceModalOpen: boolean;
  setIsVoiceModalOpen: (open: boolean) => void;
  selectedDocument: ArchivalDocument | null;
  isDocViewerOpen: boolean;
  openDocument: (doc: ArchivalDocument) => void;
  openDocById: (docId: string) => void;
  closeDocViewer: () => void;
  savedCollection: SavedCollectionItem[];
  toggleSaveItem: (item: { itemId: string; itemType: 'document' | 'qa'; title: string }) => void;
  isItemSaved: (id: string) => boolean;
  updateNote: (id: string, noteText: string) => void;
  removeSavedItem: (id: string) => void;
  assistantQuery: string;
  setAssistantQuery: (q: string) => void;
  activeDocumentContext: ArchivalDocument | null;
  setActiveDocumentContext: (doc: ArchivalDocument | null) => void;
  askAssistant: (query: string, doc?: ArchivalDocument) => void;
  showIntro: boolean;
  handleIntroComplete: () => void;
  replayIntro: () => void;
}

const MuseumContext = createContext<MuseumContextType | null>(null);

const routeToTabMap: Record<string, string> = {
  '/': 'home',
  '/archive': 'archive',
  '/documents': 'archive',
  '/search': 'search',
  '/timeline': 'timeline',
  '/memorials': 'memorials',
  '/stories': 'stories',
  '/compare': 'compare',
  '/knowledge-map': 'graph',
  '/graph': 'graph',
  '/gallery': 'gallery',
  '/media': 'media',
  '/quest': 'quest',
  '/assistant': 'assistant',
  '/collection': 'collection',
  '/preservation': 'preservation',
  '/admin': 'admin',
  '/kiosk': 'kiosk',
};

const tabToRouteMap: Record<string, string> = {
  home: '/',
  archive: '/archive',
  search: '/search',
  timeline: '/timeline',
  memorials: '/memorials',
  stories: '/stories',
  compare: '/compare',
  graph: '/knowledge-map',
  gallery: '/gallery',
  media: '/media',
  quest: '/quest',
  assistant: '/assistant',
  collection: '/collection',
  preservation: '/preservation',
  admin: '/admin',
  kiosk: '/kiosk',
};

export const MuseumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();

  const [currentTab, setCurrentTab] = useState<string>(() => {
    return routeToTabMap[pathname] || 'home';
  });

  useEffect(() => {
    const matchedTab = routeToTabMap[pathname];
    if (matchedTab && matchedTab !== currentTab) {
      setCurrentTab(matchedTab);
    }
  }, [pathname]);

  const [showIntro, setShowIntro] = useState<boolean>(false);

  useEffect(() => {
    try {
      const seen = sessionStorage.getItem('ambedkar_museum_intro_seen');
      if (!seen) {
        setShowIntro(true);
      }
    } catch {
      // sessionStorage restricted fallback
    }
  }, []);

  const [language, setLanguageState] = useState<Language>('en');

  // Hydrate persisted language preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ambedkar_museum_language') as Language;
        if (stored && (stored === 'en' || stored === 'hi' || stored === 'mr' || stored === 'ta' || stored === 'bn')) {
          setLanguageState(stored);
          document.documentElement.lang = stored;
        }
      } catch (e) {
        console.debug('localStorage language read error:', e);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ambedkar_museum_language', lang);
        document.documentElement.lang = lang;
        window.dispatchEvent(new CustomEvent('museum-language-change', { detail: lang }));
      } catch (e) {
        console.debug('localStorage language write error:', e);
      }
    }
  };

  const [userMode, setUserModeState] = useState<UserMode>('visitor');

  const handleSetUserMode = (mode: UserMode) => {
    setUserModeState(mode);
    api.acquireRoleSession(mode).catch((err) => {
      console.warn('Could not acquire server session token for role:', mode, err);
    });
  };

  useEffect(() => {
    api.acquireRoleSession('visitor').catch(() => {});
  }, []);

  const [accessibility, setAccessibility] = useState<AccessibilitySettings>({
    textSize: 'normal',
    highContrast: false,
    audioNarrationActive: false,
    soundEffectsEnabled: true,
    kioskMode: false,
    kidMode: false,
  });

  const [isAccessibilityModalOpen, setIsAccessibilityModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const [selectedDocument, setSelectedDocument] = useState<ArchivalDocument | null>(null);
  const [isDocViewerOpen, setIsDocViewerOpen] = useState(false);

  const [assistantQuery, setAssistantQuery] = useState('');
  const [activeDocumentContext, setActiveDocumentContext] = useState<ArchivalDocument | null>(null);

  const [savedCollection, setSavedCollection] = useState<SavedCollectionItem[]>([
    {
      id: 'saved-1',
      itemId: 'annihilation-of-caste',
      itemType: 'document',
      title: 'Annihilation of Caste (1936)',
      dateSaved: 'September 2026',
      note: 'Crucial treatise on endogamy and moral foundations of caste hierarchy.',
      category: 'Writings'
    },
    {
      id: 'saved-2',
      itemId: 'constituent-assembly-speech-1949',
      itemType: 'document',
      title: 'Constituent Assembly Debates (Nov 25, 1949)',
      dateSaved: 'September 2026',
      note: 'Key warning on entering into a life of contradictions.',
      category: 'Debates'
    }
  ]);

  const navigateToTab = (tab: string) => {
    setCurrentTab(tab);
    const targetRoute = tabToRouteMap[tab] || '/';
    if (pathname !== targetRoute) {
      router.push(targetRoute);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openDocument = (doc: ArchivalDocument) => {
    soundEffects.playClick();
    setSelectedDocument(doc);
    setIsDocViewerOpen(true);
  };

  const openDocById = (docId: string) => {
    const doc = ARCHIVE_DOCUMENTS.find(d => d.id === docId);
    if (doc) {
      openDocument(doc);
    } else {
      navigateToTab('archive');
    }
  };

  const closeDocViewer = () => {
    setIsDocViewerOpen(false);
  };

  const askAssistant = (query: string, doc?: ArchivalDocument) => {
    soundEffects.playClick();
    setAssistantQuery(query);
    if (doc) {
      setActiveDocumentContext(doc);
    }
    navigateToTab('assistant');
  };

  const toggleSaveItem = (item: { itemId: string; itemType: 'document' | 'qa'; title: string }) => {
    soundEffects.playClick();
    const existingIndex = savedCollection.findIndex(s => s.itemId === item.itemId);
    if (existingIndex >= 0) {
      setSavedCollection(prev => prev.filter(s => s.itemId !== item.itemId));
    } else {
      const newItem: SavedCollectionItem = {
        id: `saved-${Date.now()}`,
        itemId: item.itemId,
        itemType: item.itemType,
        title: item.title,
        dateSaved: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        category: item.itemType === 'document' ? 'Writings' : 'Research Notes',
        note: ''
      };
      setSavedCollection(prev => [newItem, ...prev]);
    }
  };

  const isItemSaved = (id: string) => {
    return savedCollection.some(s => s.itemId === id);
  };

  const updateNote = (id: string, noteText: string) => {
    setSavedCollection(prev => prev.map(item => item.id === id ? { ...item, note: noteText } : item));
  };

  const removeSavedItem = (id: string) => {
    setSavedCollection(prev => prev.filter(s => s.id !== id));
  };

  const handleIntroComplete = () => {
    setShowIntro(false);
    try {
      sessionStorage.setItem('ambedkar_museum_intro_seen', 'true');
    } catch {
      // Storage access blocked or restricted
    }
  };

  const replayIntro = () => {
    setShowIntro(true);
  };

  // Keyboard shortcut listener for Global Search (Cmd+K or '/')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDocViewerOpen(false);
        setIsAccessibilityModalOpen(false);
        setIsSearchModalOpen(false);
        setIsVoiceModalOpen(false);
      }
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName))) {
        e.preventDefault();
        setIsSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <MuseumContext.Provider
      value={{
        currentTab,
        navigateToTab,
        language,
        setLanguage,
        userMode,
        setUserMode: handleSetUserMode,
        accessibility,
        setAccessibility,
        isAccessibilityModalOpen,
        setIsAccessibilityModalOpen,
        isSearchModalOpen,
        setIsSearchModalOpen,
        isVoiceModalOpen,
        setIsVoiceModalOpen,
        selectedDocument,
        isDocViewerOpen,
        openDocument,
        openDocById,
        closeDocViewer,
        savedCollection,
        toggleSaveItem,
        isItemSaved,
        updateNote,
        removeSavedItem,
        assistantQuery,
        setAssistantQuery,
        activeDocumentContext,
        setActiveDocumentContext,
        askAssistant,
        showIntro,
        handleIntroComplete,
        replayIntro,
      }}
    >
      {children}
    </MuseumContext.Provider>
  );
};

export const useMuseum = () => {
  const context = useContext(MuseumContext);
  if (!context) {
    throw new Error('useMuseum must be used within a MuseumProvider');
  }
  return context;
};
