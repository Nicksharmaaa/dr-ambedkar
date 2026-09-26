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

  public async speak(text: string, lang: 'en' | 'hi' | 'mr' = 'en', onEnd?: () => void) {
    this.stop();

    const cleanText = text.replace(/[*#_`]/g, '').trim();
    if (!cleanText) return;

    // 1. Try Backend Sarvam AI & ElevenLabs Voice Models
    if (typeof window !== 'undefined') {
      try {
        const { api } = await import('@/lib/api');
        const res = await api.synthesizeSpeech(cleanText.slice(0, 1000), lang);
        if (res && res.audio_url) {
          const audio = new Audio(res.audio_url);
          this.currentAudio = audio;
          this.notify(true);
          audio.onended = () => {
            this.notify(false);
            if (onEnd) onEnd();
          };
          audio.onerror = () => {
            this.notify(false);
            this.speakWithBrowserSynth(cleanText, lang, onEnd);
          };
          await audio.play();
          return;
        }
      } catch (e) {
        console.debug('Neural TTS fallback to browser synth:', e);
      }
    }

    // 2. Fallback to Browser Speech Synthesis
    this.speakWithBrowserSynth(cleanText, lang, onEnd);
  }

  private speakWithBrowserSynth(cleanText: string, lang: 'en' | 'hi' | 'mr', onEnd?: () => void) {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (lang === 'hi') utterance.lang = 'hi-IN';
    else if (lang === 'mr') utterance.lang = 'mr-IN';
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
  lang?: 'en' | 'hi' | 'mr';
  onResult: (transcript: string, isFinal: boolean) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  onStatusChange?: (status: string) => void;
}

class VoiceRecognitionController {
  private recognition: any = null;
  private isListening: boolean = false;
  private mediaRecorder: any = null;
  private audioChunks: Blob[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
      }
    }
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

  private async startMediaRecorderFallback(options: VoiceRecognitionOptions): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      if (options.onError) {
        options.onError('Microphone input is unavailable on this device.');
      }
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferredMime = (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('audio/webm;codecs=opus'))
        ? 'audio/webm;codecs=opus'
        : (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('audio/webm'))
        ? 'audio/webm'
        : '';

      this.mediaRecorder = preferredMime ? new MediaRecorder(stream, { mimeType: preferredMime }) : new MediaRecorder(stream);
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
        stream.getTracks().forEach((track) => track.stop());
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
              options.onError('Voice transcription is currently unavailable. Please try again or type your question.');
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
            ? 'Microphone permission denied in browser settings.'
            : 'Microphone recording failed.'
        );
      }
      return false;
    }
  }

  public startListening(options: VoiceRecognitionOptions): boolean {
    if (!this.isSupported()) {
      if (options.onError) {
        options.onError('Voice recognition is not supported in this browser. Please type your query.');
      }
      return false;
    }

    const SpeechRecognition =
      typeof window !== 'undefined' &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

    if (!SpeechRecognition) {
      this.startMediaRecorderFallback(options);
      return true;
    }

    try {
      if (this.isListening && this.recognition) {
        this.recognition.stop();
      }

      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;

      const langCode = options.lang === 'hi' ? 'hi-IN' : options.lang === 'mr' ? 'mr-IN' : 'en-IN';
      this.recognition.lang = langCode;

      this.recognition.onstart = () => {
        this.isListening = true;
        if (options.onStatusChange) options.onStatusChange('Listening...');
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
        if (event.error === 'network') {
          console.info('SpeechRecognition network error — falling back to backend Whisper ASR...');
          if (options.onStatusChange) options.onStatusChange('Using server transcription...');
          try {
            this.recognition.stop();
          } catch {}
          this.startMediaRecorderFallback(options);
          return;
        }

        this.isListening = false;
        if (options.onError) {
          options.onError(
            event.error === 'not-allowed'
              ? 'Microphone permission denied.'
              : 'Voice recognition paused.'
          );
        }
      };

      this.recognition.onend = () => {
        if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
          this.isListening = false;
          if (options.onEnd) options.onEnd();
        }
      };

      this.recognition.start();
      return true;
    } catch (err: any) {
      console.warn('Error starting speech recognition, trying fallback:', err);
      this.startMediaRecorderFallback(options);
      return true;
    }
  }

  public stopListening() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {
        // Ignore
      }
    }
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

