import { useSpeech } from '../lib/speech';

export function SpeakButton({ text, size = 'md' }: { text: string; size?: 'sm' | 'md' | 'lg' }) {
  const { available, speak } = useSpeech();
  return (
    <button
      type="button"
      className={`icon-btn speak ${size}`}
      disabled={!available}
      title={available ? 'Listen' : 'No Urdu voice in this browser'}
      aria-label="Listen"
      onClick={(e) => {
        e.stopPropagation();
        speak(text);
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
        <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </button>
  );
}
