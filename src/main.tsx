import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { DeckProvider } from './lib/deck';
import { SpeechProvider } from './lib/speech';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SpeechProvider>
      <DeckProvider>
        <App />
      </DeckProvider>
    </SpeechProvider>
  </StrictMode>,
);
