import { useEffect, useRef, useState } from 'react';
import type { Race } from '../types';
import { laneKmAt } from '../lib/race';

type Props = {
  race: Race;
  onDone?: () => void;
  autoPlay?: boolean;
};

const ANIM_DURATION_MS = 8000;
const LANE_HEIGHT = 56;
const LANE_PAD_X = 16;
const LANE_PAD_LEFT_LABEL = 120;
const SVG_WIDTH = 640;

type Phase = 'idle' | 'playing' | 'done';

export default function Track({ race, onDone, autoPlay = false }: Props) {
  const [phase, setPhase] = useState<Phase>(autoPlay ? 'playing' : 'idle');
  const [tNorm, setTNorm] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    setPhase(autoPlay ? 'playing' : 'idle');
    setTNorm(0);
    startRef.current = null;
  }, [race, autoPlay]);

  useEffect(() => {
    if (phase !== 'playing') return;

    function frame(ts: number) {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const t = Math.min(1, elapsed / ANIM_DURATION_MS);
      setTNorm(t);
      if (t >= 1) {
        setPhase('done');
        doneRef.current?.();
        return;
      }
      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startRef.current = null;
    };
  }, [phase]);

  function play() {
    setTNorm(0);
    startRef.current = null;
    setPhase('playing');
  }

  if (race.lanes.length === 0) return null;

  const realTimeSec = tNorm * race.tMaxSec;
  const trackWidth = SVG_WIDTH - LANE_PAD_LEFT_LABEL - LANE_PAD_X;
  const svgHeight = race.lanes.length * LANE_HEIGHT + 16;

  const tickCount = Math.max(1, Math.floor(race.maxDistanceKm));
  const tickXs = Array.from({ length: tickCount + 1 }, (_, i) => i);

  return (
    <article className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
      <div className="flex items-baseline justify-between">
        <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Race</p>
        <p className="font-mono text-xs text-zinc-500">
          {race.maxDistanceKm.toFixed(1)}km · {Math.round(race.tMaxSec / 60)}min compressed
        </p>
      </div>

      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${svgHeight}`}
        className="w-full overflow-visible"
        role="img"
        aria-label="Runner race visualization"
      >
        <defs>
          <filter id="dotGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {race.lanes.map((lane, i) => {
          const y = i * LANE_HEIGHT + LANE_HEIGHT / 2 + 8;
          const kmNow = laneKmAt(lane, realTimeSec);
          const xStart = LANE_PAD_LEFT_LABEL;
          const xEnd = LANE_PAD_LEFT_LABEL + trackWidth;
          const laneEndX = xStart + (lane.distanceKm / race.maxDistanceKm) * trackWidth;
          const dotX = xStart + (kmNow / race.maxDistanceKm) * trackWidth;
          const accentLine = lane.isLeader ? 'rgb(163 230 53)' : 'rgb(113 113 122)';
          const accentDot = lane.isLeader ? 'rgb(163 230 53)' : 'rgb(212 212 216)';
          const accentTrail = lane.isLeader ? 'rgb(163 230 53 / 0.35)' : 'rgb(161 161 170 / 0.35)';

          return (
            <g key={lane.runId}>
              <text
                x={LANE_PAD_LEFT_LABEL - 12}
                y={y + 4}
                textAnchor="end"
                className="fill-zinc-400"
                style={{ font: '500 11px ui-monospace, monospace' }}
              >
                {lane.label}
              </text>

              <line
                x1={xStart}
                y1={y}
                x2={xEnd}
                y2={y}
                stroke="rgb(39 39 42)"
                strokeWidth="1"
              />

              <line
                x1={xStart}
                y1={y}
                x2={laneEndX}
                y2={y}
                stroke={accentLine}
                strokeOpacity="0.35"
                strokeWidth="1"
                strokeDasharray="2 4"
              />

              <line
                x1={xStart}
                y1={y}
                x2={dotX}
                y2={y}
                stroke={accentTrail}
                strokeWidth="3"
                strokeLinecap="round"
              />

              <circle
                cx={dotX}
                cy={y}
                r="5"
                fill={accentDot}
                filter="url(#dotGlow)"
              />

              <line
                x1={laneEndX}
                y1={y - 8}
                x2={laneEndX}
                y2={y + 8}
                stroke="rgb(82 82 91)"
                strokeWidth="1"
              />
            </g>
          );
        })}

        {tickXs.map((km) => {
          const x = LANE_PAD_LEFT_LABEL + (km / race.maxDistanceKm) * trackWidth;
          return (
            <text
              key={km}
              x={x}
              y={svgHeight - 2}
              textAnchor="middle"
              className="fill-zinc-600"
              style={{ font: '500 9px ui-monospace, monospace' }}
            >
              {km}km
            </text>
          );
        })}
      </svg>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={play}
          disabled={phase === 'playing'}
          className="rounded-md bg-lime-400 px-3 py-1.5 text-xs font-medium text-zinc-950 disabled:opacity-30"
        >
          {phase === 'idle' ? 'Play race' : phase === 'playing' ? 'Racing…' : 'Replay'}
        </button>
        <span className="font-mono text-[11px] text-zinc-500">
          {Math.round(realTimeSec / 60)}:{String(Math.round(realTimeSec) % 60).padStart(2, '0')}
        </span>
      </div>
    </article>
  );
}
