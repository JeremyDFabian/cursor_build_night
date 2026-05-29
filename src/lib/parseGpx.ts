import GpxParser from 'gpxparser';
import type { Run, Split } from '../types';

const EARTH_RADIUS_M = 6_371_000;

function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

function timeOfDay(date: Date | null): Run['timeOfDay'] {
  if (!date) return null;
  const h = date.getHours();
  if (h < 5) return 'night';
  if (h < 11) return 'morning';
  if (h < 15) return 'midday';
  if (h < 21) return 'evening';
  return 'night';
}

export async function parseGpx(file: File): Promise<Run | null> {
  const text = await file.text();
  const gpx = new GpxParser();
  gpx.parse(text);

  const track = gpx.tracks[0];
  if (!track || !track.points || track.points.length < 2) return null;

  const points = track.points;
  const startTime = points[0].time ? new Date(points[0].time) : null;

  const splits: Split[] = [];
  let cumDistance = 0;
  let nextKmBoundary = 1000;
  let prevBoundaryTimeSec = 0;

  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const segMeters = haversineMeters(p0.lat, p0.lon, p1.lat, p1.lon);
    const prevDist = cumDistance;
    cumDistance += segMeters;

    while (cumDistance >= nextKmBoundary) {
      const ratio = (nextKmBoundary - prevDist) / segMeters;
      const t0 = p0.time ? new Date(p0.time).getTime() / 1000 : 0;
      const t1 = p1.time ? new Date(p1.time).getTime() / 1000 : 0;
      const boundaryTime = t0 + (t1 - t0) * ratio;

      const startSec = startTime ? startTime.getTime() / 1000 : 0;
      const cumElapsed = boundaryTime - startSec;
      const splitSec = cumElapsed - prevBoundaryTimeSec;

      splits.push({ km: nextKmBoundary / 1000, seconds: Math.round(splitSec) });
      prevBoundaryTimeSec = cumElapsed;
      nextKmBoundary += 1000;
    }
  }

  const last = points[points.length - 1];
  const endSec = last.time ? new Date(last.time).getTime() / 1000 : 0;
  const startSec = startTime ? startTime.getTime() / 1000 : 0;
  const durationSec = Math.round(endSec - startSec);

  return {
    id: crypto.randomUUID(),
    date: startTime ? startTime.toISOString() : null,
    distanceKm: +(cumDistance / 1000).toFixed(2),
    durationSec,
    splits,
    timeOfDay: timeOfDay(startTime),
  };
}
