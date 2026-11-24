import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

type SpeechApi = { available: boolean; voiceName?: string; speak: (text: string) => void };

const SpeechContext = createContext<SpeechApi>({ available: false, speak: () => {} });

export function SpeechProvider({ children }: { children: ReactNode }) {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const pick = () => {
      const voices = window.speechSynthesis.getVoices();
      const ur = voices.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith('ur'));
      setVoice(ur.find((v) => /pk/i.test(v.lang)) ?? ur[0] ?? null);
    };
    pick();
    window.speechSynthesis.addEventListener('voiceschanged', pick);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', pick);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!voice) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.voice = voice;
      u.lang = voice.lang;
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    },
    [voice],
  );

  return (
    <SpeechContext.Provider value={{ available: !!voice, voiceName: voice?.name, speak }}>
      {children}
    </SpeechContext.Provider>
  );
}

export const useSpeech = () => useContext(SpeechContext);
