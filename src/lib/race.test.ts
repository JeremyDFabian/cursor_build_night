import { describe, expect, test } from 'vitest';
import { lanePaces } from './race';
import type { Lane } from '../types';

function lane(cumulativeSeconds: number[]): Lane {
  // cumulativeSeconds includes the leading 0 at km 0, matching Lane.cumulative
  const cumulative = cumulativeSeconds.map((seconds, km) => ({ km, seconds }));
  const last = cumulative[cumulative.length - 1];
  return {
    runId: 'r',
    label: 'Run',
    distanceKm: last.km,
    durationSec: last.seconds,
    cumulative,
    isLeader: false,
  };
}

describe('lanePaces', () => {
  test('returns the per-kilometer pace as the first difference of cumulative seconds', () => {
    expect(lanePaces(lane([0, 300, 610, 900]))).toEqual([300, 310, 290]);
  });

  test('returns flat paces when every kilometer is equal', () => {
    expect(lanePaces(lane([0, 300, 600, 900]))).toEqual([300, 300, 300]);
  });

  test('returns a single pace for a one-kilometer run', () => {
    expect(lanePaces(lane([0, 320]))).toEqual([320]);
  });
});
