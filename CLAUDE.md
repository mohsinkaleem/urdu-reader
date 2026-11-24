# Urdu Practice app

React + Vite + TypeScript app for an intermediate Urdu learner: Nastaliq reading passages with tap-a-word glosses, plus a spaced-repetition vocabulary deck. There is no backend and no runtime API: all content is static JSON, and progress lives in the browser's localStorage.

- Run: `npm run dev` (port 5173). Check: `npm test` and `npm run build`.
- Reading content: `content/passages/*.json`. Follow `content/README.md` for the format, Roman Urdu conventions, levels and sourcing rules. `src/data/content.test.ts` validates every passage, including checking that every word has a gloss.
- Vocabulary bank: `src/data/vocab.ts`. Shared function-word glosses: `content/glossary.json`.

## "Process the inbox"

When asked to process the inbox, handle each file in `content/inbox/` (not `done/`):
1. The first line is the source URL, or `own`. If it's a URL, re-fetch the text from the source where possible, keep wording exact, and set `source`/`license` (Wikipedia: CC BY-SA 4.0; Wikisource authors who died before 1976: Public domain; anything else: name the site in `source.name` and use `"license": "Personal use only"`).
2. Split long texts into a `series` of 1–3 paragraph parts. Gloss every word, translate every sentence, add an `intro` and 2–4 questions, and set the level and topic `tags` (plus `ghazal`/`nazm` for poems). Follow `content/README.md`.
3. Run `npx vitest run src/data/content.test.ts -t "<id>"` until it passes, then move the inbox file to `content/inbox/done/`.
4. Report what was added (ids, titles, levels) and any glosses you weren't sure about.
