const STEPS = [
  { n: '01', text: 'Paste your runs or drop GPX files.' },
  { n: '02', text: 'Watch them race in real-time-normalized lanes.' },
  { n: '03', text: 'Read the verdict — where you lost the most time.' },
];

export default function HowItWorks() {
  return (
    <section className="space-y-4">
      <h2 className="font-sans text-xl font-bold tracking-tight text-zinc-100">
        How it works
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {STEPS.map((s) => (
          <div
            key={s.n}
            className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
          >
            <p className="font-mono text-sm font-bold text-lime-400">{s.n}</p>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
