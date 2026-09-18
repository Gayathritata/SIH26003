/**
 * Voice Service Abstraction Layer for MINDMATE NER
 * Supports Speech-to-Text (STT) and Text-to-Speech (TTS) via Web Speech API
 * Includes mock speech output fallback for robust hackathon testing
 */

class VoiceService {
  private synth: SpeechSynthesis | null = null;
  private isListening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public speak(text: string, lang: string = 'en-IN'): void {
    if (!this.synth) {
      console.log(`[TTS MOCK SPEAK] (${lang}): "${text}"`);
      return;
    }

    try {
      this.synth.cancel(); // Stop active speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.88; // Slightly slower for elderly comprehension
      utterance.pitch = 1.0;
      utterance.lang = lang === 'te' ? 'te-IN' : (lang === 'hi' ? 'hi-IN' : 'en-IN');
      this.synth.speak(utterance);
    } catch (err) {
      console.warn('[TTS ERROR]', err);
    }
  }

  public listen(onResult: (text: string) => void, onError?: (err: any) => void): () => void {
    if (typeof window === 'undefined') return () => {};

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.log('[STT MOCK] Browser SpeechRecognition unavailable. Simulating voice recognition after 2s.');
      const timer = setTimeout(() => {
        onResult('Jhapi');
      }, 2200);
      return () => clearTimeout(timer);
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('[STT RESULT]', transcript);
        onResult(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('[STT RECOGNITION ERROR]', event.error);
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
