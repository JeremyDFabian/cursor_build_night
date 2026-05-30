import type { Run } from '../types';

// Three canonical demo runs for the landing-page sample race.
// Whole-kilometer splits keep cumulative time and distance consistent,
// and produce a clear "fade" verdict on km 3 (the slowest run loses the
// most time there relative to the fastest run).
export const sampleRuns: Run[] = [
  {
    id: 'sample-tue',
    date: '2026-05-26T07:10:00.000Z',
    distanceKm: 5,
    durationSec: 1616,
    splits: [
      { km: 1, seconds: 318 },
      { km: 2, seconds: 322 },
      { km: 3, seconds: 330 },
      { km: 4, seconds: 326 },
      { km: 5, seconds: 320 },
    ],
    timeOfDay: 'morning',
  },
  {
    id: 'sample-thu',
    date: '2026-05-28T18:05:00.000Z',
    distanceKm: 6,
    durationSec: 2000,
    splits: [
      { km: 1, seconds: 330 },
      { km: 2, seconds: 332 },
      { km: 3, seconds: 335 },
      { km: 4, seconds: 338 },
      { km: 5, seconds: 334 },
      { km: 6, seconds: 331 },
    ],
    timeOfDay: 'evening',
  },
  {
    id: 'sample-sun',
    date: '2026-05-31T08:30:00.000Z',
    distanceKm: 8,
    durationSec: 2745,
    splits: [
      { km: 1, seconds: 336 },
      { km: 2, seconds: 340 },
      { km: 3, seconds: 360 },
      { km: 4, seconds: 345 },
      { km: 5, seconds: 342 },
      { km: 6, seconds: 338 },
      { km: 7, seconds: 340 },
      { km: 8, seconds: 344 },
    ],
    timeOfDay: 'morning',
  },
];
