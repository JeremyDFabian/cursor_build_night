# Phantom Runner

Drop two or three of your recent runs as text or GPX. Watch them race each other along stacked SVG lanes. The fastest run leads in lime; a single verdict line names the kilometer where you lost the most time.

Browser-only. No backend. No API. No tracking.

## Run locally

```
git clone https://github.com/JeremyDFabian/cursor_build_night.git
cd cursor_build_night
npm install
npm run dev
```

The dev server runs on `http://localhost:5173/`.

## Input formats

**Text** — one run per line, anywhere from minimal to detailed:

```
5.2km in 28:14 morning
6.0km in 33:10 evening
8.5km in 47:32 morning
```

The parser pulls distance, total time, and (optionally) time-of-day. If no explicit per-kilometer splits appear, it assumes a uniform pace across the run.

**GPX** — upload one or more files exported from a watch or training app. To race your own Strava runs, open an activity and choose `··· → Export GPX`, then drop the files here. Per-kilometer splits are computed from trackpoints with haversine distance and linear interpolation.

## How the race works

1. Each run becomes a horizontal lane.
2. All lanes share a normalized real-time axis: at any moment, the fastest run has covered the most ground.
3. The race plays in 8 seconds. The leader (lowest average pace) is highlighted in lime; the others are gray.
4. When all lanes finish, the verdict appears: the kilometer with the largest pace gap between the fastest and slowest run, in seconds per kilometer.

If you drop a single run, the verdict prompts you to add another.

## Stack

- React 18 + Vite + TypeScript
- Tailwind CSS
- `gpxparser` for GPX XML; the per-kilometer split math is hand-rolled
- `requestAnimationFrame` drives the race; no animation libraries

## Project layout

```
src/
  App.tsx              state machine (idle -> ready)
  components/
    Input.tsx          textarea + GPX upload + live parse
    Track.tsx          SVG race surface + Play / Replay
    Verdict.tsx        one analytical sentence
  lib/
    parseText.ts       regex parser for pasted runs
    parseGpx.ts        GPX -> Run with computed splits
    race.ts            buildRace, laneKmAt, computeVerdict
  types.ts             Run, Split, Lane, Race, Verdict
```

## Scripts

```
npm run dev       # Vite dev server
npm run build     # tsc -b && vite build
npm run preview   # serve the built bundle
```

Type-check on its own: `npx tsc -b`.

## Scope

This is a single-screen tool. No accounts, no saved sessions, no routing, no history view, no charts. The track is the visualization; the verdict is the insight. Both fit on one card.
