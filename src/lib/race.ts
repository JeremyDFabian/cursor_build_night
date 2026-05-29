import type { Lane, Race, Run, Verdict } from '../types';

function laneLabel(run: Run, index: number): string {
  const d = run.distanceKm.toFixed(1);
  return `Run ${index + 1} · ${d}km`;
}

function cumulative(run: Run): { km: number; seconds: number }[] {
  const out: { km: number; seconds: number }[] = [{ km: 0, seconds: 0 }];
  let acc = 0;
  for (const s of run.splits) {
    acc += s.seconds;
    out.push({ km: s.km, seconds: acc });
  }
  return out;
}

function avgPaceSecPerKm(run: Run): number {
  if (run.distanceKm <= 0) return Infinity;
  return run.durationSec / run.distanceKm;
}

export function buildRace(runs: Run[]): Race {
  if (runs.length === 0) {
    return { lanes: [], tMaxSec: 0, maxDistanceKm: 0 };
  }

  const paces = runs.map(avgPaceSecPerKm);
  const leaderPace = Math.min(...paces);

  const lanes: Lane[] = runs.map((run, i) => ({
    runId: run.id,
    label: laneLabel(run, i),
    distanceKm: run.distanceKm,
    durationSec: run.durationSec,
    cumulative: cumulative(run),
    isLeader: paces[i] === leaderPace,
  }));

  const tMaxSec = Math.max(...runs.map((r) => r.durationSec));
  const maxDistanceKm = Math.max(...runs.map((r) => r.distanceKm));

  return { lanes, tMaxSec, maxDistanceKm };
}

export function laneKmAt(lane: Lane, realTimeSec: number): number {
  const c = lane.cumulative;
  if (realTimeSec <= 0) return 0;
  const finalSec = c[c.length - 1].seconds;
  if (realTimeSec >= finalSec) return lane.distanceKm;

  for (let i = 1; i < c.length; i++) {
    if (realTimeSec <= c[i].seconds) {
      const prev = c[i - 1];
      const next = c[i];
      const span = next.seconds - prev.seconds;
      if (span <= 0) return next.km;
      const frac = (realTimeSec - prev.seconds) / span;
      return prev.km + frac * (next.km - prev.km);
    }
  }
  return lane.distanceKm;
}

export function computeVerdict(runs: Run[]): Verdict {
  if (runs.length < 2) return { kind: 'solo' };

  const maxSharedKm = Math.min(...runs.map((r) => r.splits.length));
  if (maxSharedKm < 1) return { kind: 'noOverlap' };

  const paces = runs.map(avgPaceSecPerKm);
  const leaderIdx = paces.indexOf(Math.min(...paces));
  const laggardIdx = paces.indexOf(Math.max(...paces));
  if (leaderIdx === laggardIdx) return { kind: 'noOverlap' };

  let worstKm = 1;
  let worstDelta = -Infinity;
  for (let km = 1; km <= maxSharedKm; km++) {
    const leaderSec = runs[leaderIdx].splits[km - 1].seconds;
    const laggardSec = runs[laggardIdx].splits[km - 1].seconds;
    const delta = laggardSec - leaderSec;
    if (delta > worstDelta) {
      worstDelta = delta;
      worstKm = km;
    }
  }

  if (worstDelta <= 0) return { kind: 'noOverlap' };

  return {
    kind: 'fade',
    km: worstKm,
    deltaSecPerKm: Math.round(worstDelta),
    leaderLabel: laneLabel(runs[leaderIdx], leaderIdx),
    laggardLabel: laneLabel(runs[laggardIdx], laggardIdx),
  };
}
