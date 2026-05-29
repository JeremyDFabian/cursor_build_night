import { useState } from 'react';
import { parseText } from '../lib/parseText';
import { parseGpx } from '../lib/parseGpx';
import type { Run } from '../types';

type Props = {
  onSubmit: (runs: Run[]) => void;
  disabled?: boolean;
};

const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function fmtDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function chipLabel(r: Run): string {
  const day = r.date ? DAY[new Date(r.date).getDay()] : null;
  const parts = [`${r.distanceKm.toFixed(2)}km`, fmtDuration(r.durationSec)];
  if (day) parts.push(day);
  return parts.join(' · ');
}

export default function Input({ onSubmit, disabled }: Props) {
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState<Run[]>([]);
  const [parseErr, setParseErr] = useState<string | null>(null);

  async function ingest(nextText: string, files: FileList | null) {
    setParseErr(null);
    const fromText = parseText(nextText);
    const fromFiles: Run[] = [];
    if (files) {
      for (const f of Array.from(files)) {
        try {
          const run = await parseGpx(f);
          if (run) fromFiles.push(run);
        } catch {
          // ignore single-file parse failures, keep going
        }
      }
    }
    const all = [...fromText, ...fromFiles];
    setParsed(all);
    if (all.length === 0 && (nextText.trim() || (files && files.length))) {
      setParseErr("Couldn't parse any runs. Try lines like: 5.2km in 28:14");
    }
  }

  function handleSubmit() {
    if (parsed.length === 0) return;
    onSubmit(parsed);
  }

  return (
    <section className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          void ingest(e.target.value, null);
        }}
        placeholder={'5.2km in 28:14 morning\n6.0km in 33:10 evening\n8.5km in 47:32 morning'}
        className="w-full h-40 rounded-md border border-zinc-800 bg-zinc-900 p-3 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
        disabled={disabled}
      />

      <div className="flex items-center gap-3">
        <label className="cursor-pointer rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 hover:border-zinc-600">
          Upload GPX
          <input
            type="file"
            multiple
            accept=".gpx,application/gpx+xml,text/xml"
            className="hidden"
            disabled={disabled}
            onChange={(e) => void ingest(text, e.target.files)}
          />
        </label>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || parsed.length === 0}
          className="rounded-md bg-lime-400 px-3 py-1.5 text-xs font-medium text-zinc-950 disabled:opacity-30"
        >
          Race them
        </button>

        <span className="ml-auto text-xs text-zinc-500">
          {parsed.length > 0 ? `${parsed.length} run${parsed.length === 1 ? '' : 's'}` : ''}
        </span>
      </div>

      {parseErr && <p className="text-xs text-amber-400">{parseErr}</p>}

      {parsed.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {parsed.map((r) => (
            <li
              key={r.id}
              className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 font-mono text-xs text-zinc-300"
            >
              {chipLabel(r)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
