import type { Run, Split } from '../types';

const SPLIT_LIST_RE = /\b\d{1,2}:\d{2}(?:\s*,?\s*\d{1,2}:\d{2})+\b/g;
const TIME_OF_DAY_RE = /\b(morning|midday|noon|afternoon|evening|night)\b/i;
const DATE_RE = /\b(\d{4}-\d{2}-\d{2})\b/;

function parseTime(m: string): number {
  const match = m.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return 0;
  const h = match[3] ? parseInt(match[1], 10) : 0;
  const mn = parseInt(match[3] ? match[2] : match[1], 10);
  const s = parseInt(match[3] ?? match[2], 10);
  return h * 3600 + mn * 60 + s;
}

function bucketTimeOfDay(word: string | null): Run['timeOfDay'] {
  if (!word) return null;
  const w = word.toLowerCase();
  if (w === 'morning') return 'morning';
  if (w === 'midday' || w === 'noon' || w === 'afternoon') return 'midday';
  if (w === 'evening') return 'evening';
  if (w === 'night') return 'night';
  return null;
}

function uniformSplits(distanceKm: number, durationSec: number): Split[] {
  const fullKm = Math.floor(distanceKm);
  if (fullKm < 1) return [];
  const perKm = Math.round(durationSec / distanceKm);
  return Array.from({ length: fullKm }, (_, i) => ({
    km: i + 1,
    seconds: perKm,
  }));
}

function parseBlock(block: string): Run | null {
  // Distance + duration: "5.2km in 28:14" or "5.2 km 28:14"
  const distMatch = block.match(
    /(\d+(?:\.\d+)?)\s*(?:km|kilometers?)\b[\s\S]*?(\d{1,2}:\d{2}(?::\d{2})?)/i,
  );
  if (!distMatch) return null;

  const distanceKm = parseFloat(distMatch[1]);
  const durationSec = parseTime(distMatch[2]);
  if (!distanceKm || !durationSec) return null;

  // Look for an explicit per-km split list
  let splits: Split[] = [];
  const splitListMatches = block.match(SPLIT_LIST_RE);
  if (splitListMatches) {
    // Pick the longest list that isn't the duration itself
    const candidates = splitListMatches
      .map((s) => s.split(/[,\s]+/).filter(Boolean))
      .filter((arr) => arr.length >= 2);
    const best = candidates.sort((a, b) => b.length - a.length)[0];
    if (best) {
      splits = best.map((t, i) => ({ km: i + 1, seconds: parseTime(t) }));
    }
  }
  if (splits.length === 0) splits = uniformSplits(distanceKm, durationSec);

  const todMatch = block.match(TIME_OF_DAY_RE);
  const dateMatch = block.match(DATE_RE);

  return {
    id: crypto.randomUUID(),
    date: dateMatch ? new Date(dateMatch[1]).toISOString() : null,
    distanceKm: +distanceKm.toFixed(2),
    durationSec,
    splits,
    timeOfDay: bucketTimeOfDay(todMatch ? todMatch[1] : null),
  };
}

export function parseText(text: string): Run[] {
  if (!text.trim()) return [];

  // Split on blank lines first; if only one block, also try single-line splitting
  const blocks = text
    .split(/\n\s*\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  let runs = blocks
    .map(parseBlock)
    .filter((r): r is Run => r !== null);

  if (runs.length <= 1) {
    const lineRuns = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map(parseBlock)
      .filter((r): r is Run => r !== null);
    if (lineRuns.length > runs.length) runs = lineRuns;
  }

  return runs;
}
