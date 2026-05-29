import { useMemo, useState } from 'react';
import Input from './components/Input';
import Track from './components/Track';
import Verdict from './components/Verdict';
import { buildRace, computeVerdict } from './lib/race';
import type { Run } from './types';

type Status =
  | { kind: 'idle' }
  | { kind: 'ready'; runs: Run[]; verdictVisible: boolean };

export default function App() {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const runs = status.kind === 'ready' ? status.runs : null;
  const race = useMemo(() => (runs ? buildRace(runs) : null), [runs]);
  const verdict = useMemo(() => (runs ? computeVerdict(runs) : null), [runs]);

  function handleSubmit(runs: Run[]) {
    setStatus({ kind: 'ready', runs, verdictVisible: false });
  }

  function handleRaceDone() {
    setStatus((s) => (s.kind === 'ready' ? { ...s, verdictVisible: true } : s));
  }

  function reset() {
    setStatus({ kind: 'idle' });
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Phantom Runner</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Paste your last few runs. Watch them race.
        </p>
      </header>

      {status.kind === 'idle' && <Input onSubmit={handleSubmit} />}

      {status.kind === 'ready' && race && verdict && (
        <>
          <Track race={race} onDone={handleRaceDone} />
          <Verdict verdict={verdict} visible={status.verdictVisible} />
          <button
            type="button"
            onClick={reset}
            className="text-xs text-zinc-500 underline-offset-4 hover:text-zinc-300 hover:underline"
          >
            Start over
          </button>
        </>
      )}
    </main>
  );
}
