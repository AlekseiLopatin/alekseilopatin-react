# Math Flashcards

Route: `/math-flashcards`. A teacher-operated tool for classroom projection and tutoring. It has no student accounts, grading or cloud sync.

## Preparation

- Select a starter deck or create one. Each card has a question, an answer and an optional explanation.
- Save the card before starting a lesson. Changes to saved cards and decks are stored in this browser.
- To paste from a spreadsheet, copy two or three columns: question, answer, explanation. Omit the header. Use one card per row; use the editor for multiline cells. Preview and resolve invalid rows before adding. Limit: 500 cards per deck.
- Export all decks to JSON for backup or moving to another computer. Import shows a preview and creates new copies with new IDs; it does not merge or overwrite existing decks. Limits: 5 MB per file, 100 decks total.
- The interface supports Russian, English and Thai and the site's three themes, selected with icon buttons. The language choice is saved for this tool; Thai does not change the language of other pages. Card content is not translated automatically.

## Lesson

1. Optionally enable shuffle, then start the lesson.
2. Use **Show answer**, then **Show explanation**. Navigation always hides both again.
3. Mark difficult questions with **Review later**. At the end, review only the marked cards.
4. Fullscreen is optional; the lesson works in an ordinary browser window too.

Keyboard: Space reveals the answer, then the explanation if present, then advances. Left/right arrows navigate. R toggles the review mark. Escape leaves browser fullscreen first; outside fullscreen it returns to preparation. The fullscreen button changes its label to Exit fullscreen while active. Focused buttons retain their normal Space behaviour.

## Data and limitations

Saved library key: `al-math-flashcards-v1`; export format: `{ "version": 1, "decks": [...] }`. The separate FCC lab uses a different key and is not modified or migrated.

Export regularly: clearing browser data loses local decks. Storage failures display a warning; export before closing. Corrupt saved data is not overwritten at page load. Plain text mathematics is supported (fractions such as 1/2, ×, ÷, x²); there is no equation editor. Long content wraps and may require scrolling. Lesson progress is temporary and is not restored after reload.

Validation covers data round-tripping, invalid imports, corrupt/blocked storage, TSV row validation, editor persistence, deletion confirmation, answer visibility and review progression. Browser checks cover JSON downloads/imports, reloads, fullscreen, keyboard control, languages and themes.
