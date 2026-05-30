import SampleRace from './SampleRace';

type Props = {
  onStart: () => void;
};

export default function Hero({ onStart }: Props) {
  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-600">
          Phantom Runner
        </p>
        <h1 className="font-sans text-5xl font-extrabold leading-[0.95] tracking-tight text-zinc-50 sm:text-6xl">
          Race your
          <br />
          past <span className="text-lime-400">selves</span>.
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-zinc-400">
          Drop two or three recent runs as text or GPX. Watch them race down
          stacked lanes — the fastest pulls ahead in lime.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={onStart}
            className="rounded-md bg-lime-400 px-5 py-2 text-sm font-medium text-zinc-950 hover:bg-lime-300"
          >
            Try it →
          </button>
          <span className="font-mono text-xs text-zinc-600">
            no account · no upload · runs in your browser
          </span>
        </div>
      </div>
      <SampleRace />
    </section>
  );
}
