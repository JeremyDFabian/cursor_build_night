export type Split = { km: number; seconds: number };

export type Run = {
  id: string;
  date: string | null;
  distanceKm: number;
  durationSec: number;
  splits: Split[];
  timeOfDay: 'morning' | 'midday' | 'evening' | 'night' | null;
};

export type Lane = {
  runId: string;
  label: string;
  distanceKm: number;
  durationSec: number;
  cumulative: { km: number; seconds: number }[];
  isLeader: boolean;
};

export type Race = {
  lanes: Lane[];
  tMaxSec: number;
  maxDistanceKm: number;
};

export type Verdict =
  | { kind: 'fade'; km: number; deltaSecPerKm: number; leaderLabel: string; laggardLabel: string }
  | { kind: 'solo' }
  | { kind: 'noOverlap' };
