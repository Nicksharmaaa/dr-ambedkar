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
  private currentAudio: HTMLAudioElement | null = null;
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

  public async speak(text: string, lang: 'en' | 'hi' | 'mr' | 'ta' | 'bn' | string = 'en', onEnd?: () => void) {
    this.stop();

    // Clean text of markdown formatting, bracket citations, and URLs
    const cleanText = text
      .replace(/\[(?:Doc|Citation|Source|BAWS|Ref):[^\]]*\]/gi, '')
      .replace(/\(Vol\.\s*\d+[^)]*\)/gi, '')
      .replace(/https?:\/\/\S+/gi, '')
      .replace(/[*#_`~>]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    // 1. Primary: Server-side Neural TTS (ElevenLabs for English & Hindi, Sarvam Bulbul v3 for Indic)
    if (typeof window !== 'undefined') {
      try {
        const { api } = await import('@/lib/api');
        const res = await api.synthesizeSpeech(cleanText.slice(0, 2500), lang);
        if (res && res.audio_url) {
          // Resolve audio URL
          let audioSrc = res.audio_url;
          if (audioSrc.startsWith('/')) {
            const origin = window.location.origin;
            audioSrc = `${origin}${audioSrc}`;
          }

          const audio = new Audio(audioSrc);
          this.currentAudio = audio;
          this.notify(true);

          audio.onended = () => {
            this.currentAudio = null;
            this.notify(false);
            if (onEnd) onEnd();
          };

          audio.onerror = () => {
            console.warn('[TTS] Audio playback error on primary URL:', audioSrc, 'Trying direct fallback...');
            const directUrl = `http://127.0.0.1:8000${res.audio_url}`;
            const directAudio = new Audio(directUrl);
            this.currentAudio = directAudio;
            directAudio.onended = () => {
              this.currentAudio = null;
              this.notify(false);
              if (onEnd) onEnd();
            };
            directAudio.onerror = () => {
              this.currentAudio = null;
              this.notify(false);
              this.speakWithBrowserSynth(cleanText, lang as any, onEnd);
            };
            directAudio.play().catch(() => {
              this.currentAudio = null;
              this.notify(false);
              this.speakWithBrowserSynth(cleanText, lang as any, onEnd);
            });
          };

          await audio.play();
          return;
        }
      } catch (e) {
        console.warn('Neural TTS request failed, falling back to browser synthesis:', e);
      }
    }

    // 2. Fallback to Browser Speech Synthesis
    this.speakWithBrowserSynth(cleanText, lang as any, onEnd);
  }

  private speakWithBrowserSynth(cleanText: string, lang: 'en' | 'hi' | 'mr' | 'ta' | 'bn' | string, onEnd?: () => void) {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (lang === 'hi') utterance.lang = 'hi-IN';
    else if (lang === 'mr') utterance.lang = 'mr-IN';
    else if (lang === 'ta') utterance.lang = 'ta-IN';
    else if (lang === 'bn') utterance.lang = 'bn-IN';
    else utterance.lang = 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onstart = () => this.notify(true);
    utterance.onend = () => {
      this.notify(false);
      if (onEnd) onEnd();
    };
    utterance.onerror = () => this.notify(false);
    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (this.synth) {
      this.synth.cancel();
    }
    this.notify(false);
  }

  public isAvailable(): boolean {
    return typeof window !== 'undefined';
  }
}


export const speechController = new SpeechController();

// =========================================================================
// SPEECH-TO-TEXT (VOICE INPUT / RECOGNITION CONTROLLER)
// =========================================================================

export interface VoiceRecognitionOptions {
  lang?: 'en' | 'hi' | 'mr' | 'ta' | 'bn';
  /** Called with each transcript update. isFinal=true means the utterance is complete. */
  onResult: (transcript: string, isFinal: boolean) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  onStatusChange?: (status: string) => void;
  /** If true, auto-stop after the first final result (single-utterance mode). Default: true */
  autoStopOnFinal?: boolean;
}

class VoiceRecognitionController {
  private recognition: any = null;
  private isListening: boolean = false;
  private mediaRecorder: any = null;
  private audioChunks: Blob[] = [];
  private mediaStream: MediaStream | null = null;

  constructor() {
    // Defer SpeechRecognition construction to startListening() to avoid
    // stale instances across calls.
  }

  public isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      (('SpeechRecognition' in window) ||
        ('webkitSpeechRecognition' in window) ||
        Boolean(navigator.mediaDevices?.getUserMedia))
    );
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  // ---------------------------------------------------------------------------
  // MediaRecorder fallback (for browsers without native SpeechRecognition,
  // or when the Web Speech API returns a 'network' error).
  // ---------------------------------------------------------------------------
  private async startMediaRecorderFallback(options: VoiceRecognitionOptions): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      if (options.onError) options.onError('Microphone input is unavailable on this device.');
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaStream = stream;

      const preferredMime =
        (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('audio/webm;codecs=opus'))
          ? 'audio/webm;codecs=opus'
          : (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('audio/webm'))
          ? 'audio/webm'
          : '';

      this.mediaRecorder = preferredMime
        ? new MediaRecorder(stream, { mimeType: preferredMime })
        : new MediaRecorder(stream);
      this.audioChunks = [];
      this.isListening = true;

      if (options.onStatusChange) options.onStatusChange('Listening...');
      if (options.onStart) options.onStart();

      this.mediaRecorder.ondataavailable = (event: any) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        // Release the mic track immediately
        stream.getTracks().forEach(track => track.stop());
        this.mediaStream = null;
        this.isListening = false;

        if (options.onStatusChange) options.onStatusChange('Transcribing...');

        const actualMime = this.mediaRecorder?.mimeType || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: actualMime });

        if (audioBlob.size > 200) {
          try {
            const { api } = await import('@/lib/api');
            const res = await api.transcribeVoice(audioBlob, options.lang);
            if (res && res.text) {
              options.onResult(res.text, true);
            } else if (options.onError) {
              options.onError('No speech detected. Please try speaking closer to the microphone.');
            }
          } catch (transcribeErr: any) {
            console.warn('Backend voice transcription fallback error:', transcribeErr);
            if (options.onError) {
              options.onError('Voice transcription is currently unavailable. Please type your question.');
            }
          }
        } else {
          if (options.onError) {
            options.onError('Recording too short. Please try speaking again.');
          }
        }
        if (options.onEnd) options.onEnd();
      };

      this.mediaRecorder.start(250);
      return true;
    } catch (err: any) {
      this.isListening = false;
      if (options.onError) {
        options.onError(
          err.name === 'NotAllowedError'
            ? 'Microphone permission denied. Please allow microphone access in browser settings.'
            : 'Microphone recording failed. Please check your device settings.'
        );
      }
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // Primary: Web Speech API (continuous=false for single-shot utterances)
  // ---------------------------------------------------------------------------
  public startListening(options: VoiceRecognitionOptions): boolean {
    if (!this.isSupported()) {
      if (options.onError) {
        options.onError('Voice recognition is not supported in this browser. Please type your query.');
      }
      return false;
    }

    // If already listening, stop first
    if (this.isListening) {
      this.stopListening();
    }

    const autoStop = options.autoStopOnFinal !== false; // default true

    const SpeechRecognitionAPI =
      typeof window !== 'undefined' &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

    if (!SpeechRecognitionAPI) {
      // No native API — go straight to MediaRecorder
      this.startMediaRecorderFallback(options);
      return true;
    }

    try {
      this.recognition = new SpeechRecognitionAPI();

      // Use continuous=false so the browser auto-fires onend after silence.
      // This is the most reliable cross-browser setting.
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

      const langCode =
        options.lang === 'hi' ? 'hi-IN'
        : options.lang === 'mr' ? 'mr-IN'
        : options.lang === 'ta' ? 'ta-IN'
        : options.lang === 'bn' ? 'bn-IN'
        : 'en-IN';
      this.recognition.lang = langCode;

      // Track the best final transcript across the session
      let accumulatedFinal = '';

      this.recognition.onstart = () => {
        this.isListening = true;
        if (options.onStatusChange) options.onStatusChange('Listening...');
        if (options.onStart) options.onStart();
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += t;
          } else {
            interimTranscript += t;
          }
        }

        if (finalTranscript) {
          accumulatedFinal += (accumulatedFinal ? ' ' : '') + finalTranscript;
        }

        const effectiveText = accumulatedFinal || interimTranscript;
        if (effectiveText) {
          options.onResult(effectiveText, Boolean(finalTranscript));
        }

        // Auto-stop after a final result in single-utterance mode
        if (finalTranscript && autoStop) {
          try { this.recognition.stop(); } catch {}
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('[VoiceRecognition] Error:', event.error);

        if (event.error === 'network') {
          // Web Speech API requires internet for Google's STT service.
          // Fall back to MediaRecorder + backend Whisper.
          console.info('[VoiceRecognition] network error — falling back to MediaRecorder...');
          if (options.onStatusChange) options.onStatusChange('Using local transcription...');
          try { this.recognition.abort(); } catch {}
          this.recognition = null;
          this.isListening = false;
          this.startMediaRecorderFallback(options);
          return;
        }

        if (event.error === 'no-speech') {
          // User didn't say anything — treat as soft reset, not a hard error
          this.isListening = false;
          if (options.onError) options.onError('No speech detected. Please speak clearly and try again.');
          if (options.onEnd) options.onEnd();
          return;
        }

        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          this.isListening = false;
          if (options.onError) options.onError('Microphone permission denied. Please allow access in browser settings.');
          if (options.onEnd) options.onEnd();
          return;
        }

        if (event.error === 'aborted') {
          // Intentional stop — do not fire error callback
          return;
        }

        this.isListening = false;
        if (options.onError) options.onError('Voice recognition stopped. Please try again.');
        if (options.onEnd) options.onEnd();
      };

      this.recognition.onend = () => {
        this.isListening = false;
        // Only fire onEnd if we're not mid-MediaRecorder fallback
        if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
          if (options.onEnd) options.onEnd();
        }
      };

      this.recognition.start();
      return true;
    } catch (err: any) {
      console.warn('[VoiceRecognition] Failed to start, trying MediaRecorder fallback:', err);
      this.isListening = false;
      this.startMediaRecorderFallback(options);
      return true;
    }
  }

  public stopListening() {
    // Stop MediaRecorder
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try { this.mediaRecorder.stop(); } catch {}
    }
    // Release mic stream if held
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
    // Stop Web Speech API
    if (this.recognition) {
      try { this.recognition.abort(); } catch {}
      this.recognition = null;
    }
    this.isListening = false;
  }
}

export const voiceRecognitionController = new VoiceRecognitionController();
