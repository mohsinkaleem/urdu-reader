# Content expansion plan

Goal: grow the reading library with real Urdu text: original excerpts, tagged by level, each with tap-a-word meanings, Roman Urdu, translations and a quiz. Claude processes the passages during sessions, so the app needs no paid API at runtime.

## Decisions

| Question | Decision |
|---|---|
| Sources | Urdu Wikipedia, Urdu Wikisource (public domain) |
| Glossing | Claude processes each passage during a session; no runtime API |
| Text | Original, unedited excerpts, tagged **easy / medium / hard** |
| Length | Short chunks (1–3 paragraphs); long works split into numbered parts |
| Storage | Saved library with read/unread status and quiz scores |
| First batch | ~20 passages |
| Adding more later | Drop texts in `content/inbox/`, then ask Claude to process them |

## First batch (~20 passages)

All source text is fetched from the source page, never written from memory, and every passage links back to where it came from.

**Wikipedia: Pakistan & culture (~7)**: e.g. Lahore, Karachi, Badshahi Mosque, biryani, Eid, cricket in Pakistan, the Urdu language. Modern, factual Urdu close to newspaper style. Licence: CC BY-SA, shown with a link on each passage.

**Manto & short stories (~7)**: _Done: 7 Manto passages. Urdu Wikisource has no Urdu originals by Premchand or Patras Bukhari._ excerpts from Saadat Hasan Manto (216 results on Wikisource), plus Premchand and Patras Bukhari's humorous essays. All three authors died more than 50 years ago, so their work is public domain in Pakistan. Long stories are split into parts.

**Poetry (~6)**: ghazals and nazms by Ghalib, Mir Taqi Mir and Iqbal. Each couplet gets an explanation (تشریح) in simple Urdu plus English.

## App changes

1. **Content format**: one JSON file per passage in `content/passages/`, loaded automatically. New fields: `source {name, url, licence}`, `category`, `level`, `part` / `parts`, and an optional per-couplet `explanation`.
2. **Shared glossary**: a `content/glossary.json` for words that recur (so each word is written once), plus per-passage glosses only where the meaning depends on context. The existing `COMMON_GLOSSARY` moves here.
3. **Library page**: filter by category, level and read/unread; show quiz scores; "Next part" links for split works.
4. **Poetry view**: couplets centred, with an expandable explanation under each.
5. **Validation tests**: every word in every passage has a gloss, quiz answers are valid, and the level and source are present. A passage that fails isn't accepted.
6. **Inbox workflow**: drop a `.txt` or `.md` file (source URL on the first line) into `content/inbox/`, then ask Claude to "process the inbox". Claude produces the passage JSON, runs the tests, and moves the original file to `content/inbox/done/`. These conventions go in `CLAUDE.md` so future sessions follow them.

## Build order

1. Content format, shared glossary, library UI, tests. The current 5 passages are migrated over.
2. Fetch and process the first batch, category by category, with each batch checked by the tests.
3. Inbox workflow and `CLAUDE.md` notes.

## Not doing (for now)

- Live BBC Urdu news tab: the articles are copyrighted, and the free dictionary can't gloss inflected words.
- Google Translate API: needs a Google Cloud account with billing turned on, and gives no Roman Urdu or meanings for single words.
- If the app is ever published publicly, check each source's licence again first. Public-domain status differs by country.
