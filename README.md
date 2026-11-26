# Urdu Practice

A React + Vite app for intermediate Urdu learners: read short passages in Nastaliq, tap any word to see its Roman Urdu and English meaning, and review saved words with spaced repetition.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # SRS + glossary checks
npm run build
```

## Features

- **Library**: a filter sidebar (type, level, read status, poet/writer, topic, and ghazal/nazm for poems), with live counts beside each option. Multi-part works (Shikwa, Jawab-e-Shikwa, Toba Tek Singh…) share one card with a progress bar, "Continue · Part N" and a list of their parts.
- **Content**: 102 passages (7 easy, 57 medium, 38 hard):
  - 4 starter reads.
  - 19 Urdu Wikipedia articles: food & culture (biryani, chai, Eid, the Urdu language), history (Mohenjo-daro, the Mughals, Mughal Lahore, the Taj Mahal, 1857) and people (Jinnah, Fatima Jinnah, Iqbal, Sir Syed, Ghalib, Manto, Edhi, Abdus Salam, Einstein, Nusrat Fateh Ali Khan).
  - 8 BBC Urdu news stories.
  - 7 Manto passages, including Toba Tek Singh in 3 parts.
  - 64 poems with couplet-by-couplet explanations. The classical poets are Ghalib, Mir and Iqbal, with Iqbal's Shikwa (10 parts) and Jawab-e-Shikwa (12 parts) in full, his children's poems and both Taranas. The modern poets are Faiz, Ahmad Faraz, Parveen Shakir and Jaun Elia, three famous poems each.

  Every word can be tapped for Roman Urdu + English; each passage has translations, a quiz, and a source link.
- **Reader**: a sticky toolbar (translations, Roman Urdu, A− / A+ text size, read aloud), plus a light/dark theme toggle in the top bar. The theme follows your system setting until you pick one.
- **Reading aids**: the "Roman Urdu" toggle adds a Roman line under every sentence, built from the glosses. Spellings with two readings, such as میں (main/mein), show both forms with a dotted underline. Below each passage, "Words you looked up" lists the words you tapped (leaving out common function words and words already in your deck), and one click adds the ticked ones to your deck.
- **Review**: SM-2 style spaced repetition (Again / Hard / Good / Easy). Keyboard: Space to reveal, 1–4 to rate.
- **Word bank**: 120 words in 4 topics; add one word or a whole topic. "My deck" shows what's scheduled.
- **Audio**: uses the browser's Urdu text-to-speech voice when available (e.g. Microsoft Edge).

Progress is saved in the browser's localStorage.

Classical texts keep their vowel marks (zer, zabar, pesh); word lookup ignores them, so سُود and سود share one gloss and one deck card.

**Personal use only:** the BBC Urdu passages and the modern poems (Faiz, Faraz, Parveen Shakir, Jaun Elia, from Rekhta) are copyrighted. Keep this app local and don't publish it with them.

## Adding content

- Passages: one JSON file each in `content/passages/`. See [content/README.md](content/README.md) for the format and rules. `npm test` fails and lists any word without a gloss.
- Easiest way: drop an Urdu text into `content/inbox/` (first line = source URL) and ask Claude to "process the inbox".
- Words: `src/data/vocab.ts`
