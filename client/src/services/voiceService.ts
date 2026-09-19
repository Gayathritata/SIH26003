/**
 * Voice Service Abstraction Layer for MINDMATE NER
 * Handles Text-to-Speech (TTS) and Speech-to-Text (STT) via Web Speech API
 * Includes language mappings (en-IN, hi-IN, as-IN) with fallback handling
 */

import { Language } from '../i18n';

class VoiceService {
  private synth: SpeechSynthesis | null = null;
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private speakingListeners: Set<(speaking: boolean) => void> = new Set();
  private currentlySpeaking: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public subscribeSpeaking(listener: (speaking: boolean) => void): () => void {
    this.speakingListeners.add(listener);
    listener(this.currentlySpeaking);
    return () => {
      this.speakingListeners.delete(listener);
    };
  }

  private setSpeaking(status: boolean) {
    this.currentlySpeaking = status;
    this.speakingListeners.forEach((fn) => fn(status));
  }

  public isSpeaking(): boolean {
    return this.currentlySpeaking;
  }

  public stop(): void {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
        console.warn('[TTS STOP ERROR]', e);
      }
    }
    this.setSpeaking(false);
  }

  public speak(text: string, lang: Language = 'en'): void {
    if (!text || typeof window === 'undefined') return;

    if (!this.synth) {
      console.log(`[TTS MOCK FALLBACK] (${lang}): "${text}"`);
      return;
    }

    try {
      this.stop(); // Stop existing playback

      const utterance = new SpeechSynthesisUtterance(text);
      this.activeUtterance = utterance;

      // Rate tuned for elderly comprehension
      utterance.rate = 0.85;
      utterance.pitch = 1.0;

      // Map application language to BCP-47 voice language codes
      const targetLangCode = lang === 'hi' ? 'hi-IN' : (lang === 'as' ? 'as-IN' : 'en-IN');
      utterance.lang = targetLangCode;

      // Voice selection optimization with fallback for Assamese / regional voices
      const voices = this.synth.getVoices();
      if (voices && voices.length > 0) {
        let matchingVoice = voices.find((v) => v.lang.toLowerCase().startsWith(targetLangCode.toLowerCase()));
        
        // Assamese fallback: search for 'as' or fallback to Hindi/English voice if native Assamese TTS voice is missing
        if (!matchingVoice && lang === 'as') {
          matchingVoice = voices.find((v) => v.lang.toLowerCase().startsWith('hi') || v.lang.toLowerCase().startsWith('bn'));
        }
        
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
      }

      utterance.onstart = () => {
        this.setSpeaking(true);
      };

      utterance.onend = () => {
        this.setSpeaking(false);
        this.activeUtterance = null;
      };

      utterance.onerror = (err) => {
        console.warn('[TTS PLAYBACK WARNING]', err);
        this.setSpeaking(false);
        this.activeUtterance = null;
      };

      this.synth.speak(utterance);
    } catch (err) {
      console.warn('[TTS EXCEPTION]', err);
      this.setSpeaking(false);
    }
  }

  public isSTTSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public listen(
    onResult: (text: string) => void,
    onError?: (err: any) => void,
    lang: Language = 'en'
  ): () => void {
    if (typeof window === 'undefined') return () => {};

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.log('[STT UNSUPPORTED] Speech recognition API not found on device/browser.');
      if (onError) onError('unsupported');
      return () => {};
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === 'hi' ? 'hi-IN' : (lang === 'as' ? 'as-IN' : 'en-IN');

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('[STT RESULT]', transcript);
        onResult(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('[STT ERROR]', event.error);
        if (onError) onError(event.error);
      };

      recognition.start();

      return () => {
        try {
          recognition.stop();
        } catch (e) {}
      };
    } catch (e) {
      if (onError) onError(e);
      return () => {};
    }
  }
}

export const voiceService = new VoiceService();
