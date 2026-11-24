# Content guide

Every reading passage is one JSON file in `content/passages/<id>.json`, loaded by the app automatically. `npm test` checks every file (see `src/data/content.test.ts`), and a passage isn't done until its tests pass:

```bash
npx vitest run src/data/content.test.ts -t "<id or id-prefix>"
```

## File format

```jsonc
{
  "id": "wiki-lahore",                       // must equal the file name; prefix by category
  "title": { "urdu": "لاہور", "english": "Lahore" },
  "category": "wikipedia",                   // starter | wikipedia | news | stories | poetry
  "level": "medium",                         // easy | medium | hard
  "tags": ["places", "history"],             // 1–3 topic tags; poems also get one form tag (see "Tags")
  "source": {
    "name": "Urdu Wikipedia: لاہور",
    "url": "https://ur.wikipedia.org/wiki/...",  // required except for category "starter"
    "author": "Saadat Hasan Manto",          // optional
    "license": "CC BY-SA 4.0"                // required except for "starter"; "Public domain" for Wikisource classics
  },
  "intro": "One or two English sentences of context.",          // optional
  "series": { "id": "story-toba-tek-singh", "title": "Toba Tek Singh", "part": 1, "of": 3 }, // optional
  "sentences": [
    { "urdu": "…۔", "english": "…" },
    // poetry: each line is its own sentence with "verse": true;
    // put the couplet's explanation on its SECOND line:
    { "urdu": "…", "english": "…", "verse": true },
    { "urdu": "…", "english": "…", "verse": true,
      "explanation": { "urdu": "simple-Urdu tashreeh", "english": "English explanation" } }
  ],
  "glossary": { "لاہور": ["laahaur", "Lahore"] },  // [roman, english], keyed by the exact word
  "questions": [
    { "urdu": "…؟", "english": "…?",
      "options": [{ "urdu": "…", "english": "…" }, …],  // 3 options
      "answer": 0 }                                       // index of the correct option
  ]
}
```

## Rules

**Text**
- Copy source text exactly as it appears on the source page, fetched through its API. Never write a sourced text from memory. Remove only wiki markup, reference markers like `[1]` and image captions.
- Pick contiguous excerpts of 1–3 paragraphs (about 4–12 sentences). Split long works into a `series` of consecutive parts, starting from the beginning.
- Split prose into sentences at `۔`, `؟` and `!`. Each poetry line (misra) is its own sentence.
- Sources: Urdu Wikipedia (licence `CC BY-SA 4.0`) and Urdu Wikisource (only authors who died before 1976, licence `Public domain`). Use the article's page URL.
- News (category `news`): BBC Urdu and other news sites are copyrighted, so they are for this local, personal app only. Set `source.name` to `BBC Urdu: <headline>`, `source.author` to the reporter, and `"license": "Personal use only"`. Take the opening body paragraphs and skip bylines, captions and promo lines. Don't publish the app with these passages in it.

**Glossary**
- Every word in the passage must have a gloss, matched by the exact word after punctuation is stripped. Lookup order: passage `glossary`, then the vocab bank (`src/data/vocab.ts`), then the shared function words (`content/glossary.json`). Numbers don't need glosses.
- Give the meaning in context. Mark grammar where it helps: `(f.)`, `(pl.)`, `(oblique)`, `(poetic)`. For parts of idioms or compound verbs, give the whole phrase: `"rakha" → "kept (“kar rakha tha” = had been doing)"`.
- Don't edit `content/glossary.json` for a single passage. It is for very common function words only.

**Roman Urdu conventions** (match the existing content)
- Long vowels doubled: `aa`, `ee`, `oo`. Short vowels: `a`, `i`, `u`. `ai` as in *hai*, `au` as in *aur*.
- Retroflex: `ṭ`, `ḍ`, `ṛ`. Aspirated: `kh` (خ is also `kh`), `gh`, `bh`, `ph`, `th`, `chh`. `q` for ق, `z` for ز ذ ض ظ, `s` for س ص ث.
- Nasal `n` at the end (`mein`, `hain`). Izafat as `-e-` (`wazeer-e-aazam`). No marks for ع or hamza.

**Levels**
- `easy`: short everyday sentences, common vocabulary.
- `medium`: news and encyclopedia register, longer sentences, some Persian and Arabic vocabulary.
- `hard`: literary or classical prose, dense Persian and Arabic vocabulary, older spellings, most classical poetry.

**Tags**: every passage gets 1–3 topic tags, chosen from the fixed list in `TAGS` (`src/data/library.ts`). The Library sidebar filters by these.
- Topics: `history`, `people`, `places`, `culture` (food & culture), `faith`, `politics`, `society`, `sports`, `science` (science & tech), `language` (language & literature), `arts` (arts & media), `love`, `nature` (nature & animals), `philosophy` (life & philosophy), `homeland`, `children`, `everyday`.
- Poems (category `poetry`) also get exactly one form tag, `ghazal` or `nazm`. Other categories get no form tag.
- Put the main subject first. To add a new tag, add it to `TAGS`; the tests reject unknown tags.

**Questions**: 2–4 per passage, testing understanding rather than word matching. Write them in Urdu with English, give 3 options each, and vary where the correct answer sits.

**IDs**: `starter-…`, `wiki-…`, `news-…`, `story-…`, `poem-…`, written in lowercase with hyphens.

## Inbox workflow

1. Put a `.txt` or `.md` file in `content/inbox/`. The first line is the source URL (or `own` for text you wrote). The rest is the Urdu text.
2. Ask Claude to "process the inbox". Claude turns each file into a passage JSON following the rules above, runs the content tests, and moves the original file to `content/inbox/done/`.
