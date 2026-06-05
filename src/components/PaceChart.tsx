import type { Race, Verdict } from '../types';
import { lanePaces } from '../lib/race';

type Props = {
  race: Race;
  verdict: Verdict;
  visible: boolean;
};

const SVG_WIDTH = 640;
const SVG_HEIGHT = 180;
const PAD_LEFT = 48;
const PAD_RIGHT = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 22;

const LIME = 'rgb(163 230 53)';
const GRAY_LINE = 'rgb(113 113 122)';
const GRAY_DOT = 'rgb(212 212 216)';

function formatPace(secPerKm: number): string {
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function PaceChart({ race, verdict, visible }: Props) {
  if (race.lanes.length === 0) return null;

  const lanes = race.lanes.map((lane) => ({ lane, paces: lanePaces(lane) }));
  const allPaces = lanes.flatMap((l) => l.paces);
  if (allPaces.length === 0) return null;

  const plotWidth = SVG_WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotHeight = SVG_HEIGHT - PAD_TOP - PAD_BOTTOM;

  const minPace = Math.min(...allPaces);
  const maxPace = Math.max(...allPaces);
  const rawRange = maxPace - minPace;
  // Pad the domain so lines aren't glued to the edges; collapse to mid-height
  // when every pace is identical (flat-line / single-km cases).
  const pad = rawRange === 0 ? 1 : rawRange * 0.12;
  const domainMin = minPace - pad;
  const domainMax = maxPace + pad;
  const domainRange = domainMax - domainMin;

  const xScale = (km: number) =>
    PAD_LEFT + (km / race.maxDistanceKm) * plotWidth;
  // Inverted: faster pace (fewer seconds) sits higher on the chart.
  const yScale = (pace: number) =>
    rawRange === 0
      ? PAD_TOP + plotHeight / 2
      : PAD_TOP + ((pace - domainMin) / domainRange) * plotHeight;

  const tickCount = Math.max(1, Math.floor(race.maxDistanceKm));
  const kmTicks = Array.from({ length: tickCount }, (_, i) => i + 1);

  const verdictKm = verdict.kind === 'fade' ? verdict.km : null;

  return (
    <article
      className={`rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 space-y-4 transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden={!visible}
    >
      <div className="flex items-baseline justify-between">
        <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Pace per km</p>
        <p className="font-mono text-xs text-zinc-500">faster is higher</p>
      </div>

      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="w-full overflow-visible"
        role="img"
        aria-label="Per-kilometer pace for each run"
      >
        {verdictKm !== null && (
          <g>
            <rect
              x={xScale(verdictKm) - 10}
              y={PAD_TOP}
              width={20}
              height={plotHeight}
              fill={LIME}
              fillOpacity="0.1"
            />
            <text
              x={xScale(verdictKm)}
              y={PAD_TOP - 4}
              textAnchor="middle"
              fill={LIME}
              style={{ font: '600 9px ui-monospace, monospace' }}
            >
              km {verdictKm}
            </text>
          </g>
        )}

        {/* y-axis pace ticks: fastest (top) and slowest (bottom) */}
        <text
          x={PAD_LEFT - 8}
          y={yScale(minPace) + 3}
          textAnchor="end"
          className="fill-zinc-500"
          style={{ font: '500 9px ui-monospace, monospace' }}
        >
          {formatPace(minPace)}
        </text>
        {rawRange > 0 && (
          <text
            x={PAD_LEFT - 8}
            y={yScale(maxPace) + 3}
            textAnchor="end"
            className="fill-zinc-600"
            style={{ font: '500 9px ui-monospace, monospace' }}
          >
            {formatPace(maxPace)}
          </text>
        )}

        {kmTicks.map((km) => (
          <text
            key={km}
            x={xScale(km)}
            y={SVG_HEIGHT - 4}
            textAnchor="middle"
            className="fill-zinc-600"
            style={{ font: '500 9px ui-monospace, monospace' }}
          >
            {km}
          </text>
        ))}

        {lanes.map(({ lane, paces }) => {
          if (paces.length === 0) return null;
          const stroke = lane.isLeader ? LIME : GRAY_LINE;
          const dot = lane.isLeader ? LIME : GRAY_DOT;
          const points = paces.map((pace, i) => ({
            x: xScale(i + 1),
            y: yScale(pace),
          }));
          const polyPoints = points.map((p) => `${p.x},${p.y}`).join(' ');

          return (
            <g key={lane.runId}>
              <polyline
                points={polyPoints}
                fill="none"
                stroke={stroke}
                strokeWidth={lane.isLeader ? 2.5 : 1.5}
                strokeOpacity={lane.isLeader ? 1 : 0.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={lane.isLeader ? 3 : 2.5} fill={dot} />
              ))}
            </g>
          );
        })}
      </svg>
    </article>
  );
}
