// Text-to-Speech & Speech-to-Text utility supporting Web Speech API with fallback

export interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  rate: number;
  pitch: number;
  currentText: string;
}

class SpeechController {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: ((isPlaying: boolean) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public subscribe(callback: (isPlaying: boolean) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notify(isPlaying: boolean) {
    this.listeners.forEach(cb => cb(isPlaying));
  }

  public speak(text: string, lang: 'en' | 'hi' | 'mr' = 'en', onEnd?: () => void) {
    if (!this.synth) {
      console.warn('Speech synthesis not supported on this device/browser');
      return;
    }

    this.stop();

    const cleanText = text.replace(/[*#_`]/g, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Choose appropriate locale
    if (lang === 'hi') {
      utterance.lang = 'hi-IN';
    } else if (lang === 'mr') {
      utterance.lang = 'mr-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.rate = 0.95; // Slightly steady pace for clarity
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      this.notify(true);
    };

    utterance.onend = () => {
      this.notify(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis notice:', e);
      this.notify(false);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.notify(false);
  }

  public isAvailable(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }
}

export const speechController = new SpeechController();

// =========================================================================
// SPEECH-TO-TEXT (VOICE INPUT / RECOGNITION CONTROLLER)
// =========================================================================

export interface VoiceRecognitionOptions {
  lang?: 'en' | 'hi' | 'mr';
  onResult: (transcript: string, isFinal: boolean) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

class VoiceRecognitionController {
  private recognition: any = null;
  private isListening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
      }
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && (('SpeechRecognition' in window) || ('webkitSpeechRecognition' in window));
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public startListening(options: VoiceRecognitionOptions): boolean {
    if (!this.isSupported()) {
      if (options.onError) {
        options.onError('Voice recognition is not supported in this browser. Please type your query.');
      }
      return false;
    }

    try {
      if (this.isListening && this.recognition) {
        this.recognition.stop();
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;

      const langCode = options.lang === 'hi' ? 'hi-IN' : options.lang === 'mr' ? 'mr-IN' : 'en-IN';
      this.recognition.lang = langCode;

      this.recognition.onstart = () => {
        this.isListening = true;
        if (options.onStart) options.onStart();
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const effectiveText = finalTranscript || interimTranscript;
        if (effectiveText) {
          options.onResult(effectiveText, Boolean(finalTranscript));
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition event:', event.error);
        this.isListening = false;
        if (options.onError) {
          options.onError(event.error === 'not-allowed' ? 'Microphone permission denied.' : 'Voice recognition paused.');
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (options.onEnd) options.onEnd();
      };

      this.recognition.start();
      return true;
    } catch (err: any) {
      console.warn('Error starting speech recognition:', err);
      this.isListening = false;
      if (options.onError) {
        options.onError(err.message || 'Could not start microphone.');
      }
      return false;
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore stop error
      }
    }
    this.isListening = false;
  }
}

export const voiceRecognitionController = new VoiceRecognitionController();

