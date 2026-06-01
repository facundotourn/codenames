# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server with hot reload
- `npm run build` — type-check (`tsc`) then build to `dist/`
- `npm run preview` — serve the production build locally

There is no test runner, linter, or formatter. Type checking (strict `tsconfig.json`, including `noUnusedLocals`/`noUnusedParameters`) is the only automated gate and runs as part of `npm run build`.

Deployment is automatic: `.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push to `master`. Because the site is served from a subpath, `vite.config.ts` sets `base: '/codenames/'` — keep asset references base-relative.

## Architecture

A single-page React 18 + TypeScript implementation of Codenames (Spanish UI), bundled with Vite. No backend and no persistence — all state is in-memory for a page session. Entry chain: `index.html` → `src/main.tsx` → `src/App.tsx`.

**`src/App.tsx` is the whole game** — a `useReducer` store plus the welcome/game page layout. The `components/` are presentational, driven entirely by props:
- `Welcome.tsx` — start screen with the "Sala" (room/seed) input and how-to-play text.
- `Board.tsx` — renders the 5×5 grid; computes `isTense` (a team has exactly one card left) and passes it down.
- `Card.tsx` — one card; owns the dramatic flip animation (see below).

### State model (`src/App.tsx`)

A single `GameState` (`cards`, `red`, `blue`, `gameOver`, `gameOverId`, `spy`, `emoji`) lives in `useReducer`. Actions: `REVEAL`, `SET_SPY`, `NEW_GAME`. There is **no turn/team-to-move concept** — players just reveal cards until a team clears its color or the assassin is hit. `red`/`blue` are remaining-card counters that decrement on reveal; reaching 0 (or revealing the assassin, team `X`) sets `gameOver` and records `gameOverId` for the win/lose flourish on that card.

Teams use single-letter codes throughout (`src/types.ts`): `R` red, `A` azul/blue, `N` neutral, `X` assassin.

### Board generation — seed compatibility is load-bearing

`generateBoard(seed, wordList)` builds the 25 cards with `seedrandom`, so the same seed (the "Sala" code) always reproduces the same board across devices — that's the multiplayer mechanism (each player loads the same room code; spies enable Spy mode to see colors). **The exact sequence of `rng()` calls is intentionally kept identical to the original jQuery version (root `codenames.js`) so old and new builds generate matching boards for the same seed.** Do not reorder, add, or remove `rng()` calls in `generateBoard` without understanding this; it will silently break seed compatibility.

Note the `TEAMS` array has 24 entries for 25 cells, so the final cell falls through to a random `A`/`R` assignment — `red`/`blue` totals therefore vary slightly per board and are counted dynamically.

Content depends on whether a seed was entered: a seed loads a word board (`src/data/words.ts`); no seed loads a random emoji board (`src/data/emojis.ts`) instead.

### Dramatic flip animation (`src/components/Card.tsx`)

When `isTense`, clicking a card runs a 3D flip sequence (`buildSequence` → `Phase[]`) that teases through fake colors before landing on the real team color, then calls `onReveal`. It drives `rotateY` via inline styles and advances on `onTransitionEnd`, pre-painting the next face while hidden. This is delicate, timing-sensitive code that has gone through many iterations (see `git log`); change it carefully.

### Legacy files — not part of the build

The repo still tracks the original jQuery prototype and its vendored libs: root `codenames.js`/`codenames.css`, `styles/bootstrap.css`, and `scripts/` (jQuery, Modernizr, Bootstrap, `emojis.js`, etc.). These are **not** referenced by the Vite app — the live `index.html` loads `/src/main.tsx`. Their only ongoing relevance is the seed-compatibility contract described above.
