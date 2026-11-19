# Math Buddy

Route: `/math-buddy`. Classroom practice for three classes of thirty students.
The interface and questions are English. Ember, Daylight and Twilight use the
site's existing theme tokens. It runs on the teacher's browser, with no accounts
or cloud synchronization. XP is participation feedback, not a mastery score.

## A short lesson guide

1. Choose a class. Open **Teacher**, mark absent students and update names.
2. Select a topic and difficulty. Choose a leader and use **Full screen**.
3. Everyone solves in a notebook. Ask students to finish writing before revealing
   the answer. Rotate the leader fairly; the dropdown shows previous turns.
4. Select **Show answer**, then **Show explanation** if available. All present
   students start as Correct. Click a hero to change Correct ↔ Attempt. Select
   all / Deselect all preserve absent and No XP students.
5. The teacher verifies the marks, assigns No XP where appropriate, then selects
   **Award XP**: Correct = 10, Attempt = 3, No XP/absent = 0; leader = ×2.
6. Correct an erroneous award with **Undo**. Continue with **Next question**.
7. Leave customization for a break or the end: **Teacher → Customize**. Every
   100 XP adds a level; nine cosmetic items unlock at levels 2–10. Changing a hero
   preserves XP. Undo removes equipment no longer unlocked at the restored level.
8. After the lesson, **Export progress** and keep the JSON file somewhere safe.

The same guide is available in the page's **How to play** button.

## Moving from the standalone prototype

On the old local page, open Teacher → Export progress. On the website, open
Teacher → Import backup, inspect the preview and confirm Replace progress.
Local-file storage and website storage do not transfer automatically. Each browser
and device has its own data. Student names and progress are not bundled with the
site or uploaded by this page.

Version 1 and 2 JSON exports are supported. Invalid files are rejected before
replacement. Existing data is backed up in browser storage before restore or
schema migration. Export previous backup retrieves the previous saved copy.
Clearing website data also clears these local backups, so download JSON copies.

## Implementation and limits

The React page uses the site's ThemeContext, PageMeta, router and scoped CSS.
Math, XP, avatars and validation remain separate modules reused from the tested
prototype. The storage key remains `math-buddy-v1`, schema version 2.
Changing names or attendance clears Undo; changing appearance does not.
Fullscreen is optional. Desktop layout targets 1366×768 and 1440×900; smaller
screens allow scrolling to keep controls accessible. Teacher controls have no
password protection. The site requires an initial network load; offline caching
is not implemented. This is foundational practice, not complete official
O-NET/TEDET preparation or a full curriculum alignment claim.
