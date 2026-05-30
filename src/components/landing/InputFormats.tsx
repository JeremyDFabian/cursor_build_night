const FORMATS = [
  { title: 'Text', body: 'One run per line: 5.2km in 28:14 morning' },
  {
    title: 'GPX',
    body: 'Exported from a watch or training app. Per-kilometer splits computed for you.',
  },
  {
    title: 'Strava →',
    body: 'Open an activity, choose ··· → Export GPX, then drop it in.',
  },
];

export default function InputFormats() {
  return (
    <section className="space-y-4">
      <h2 className="font-sans text-xl font-bold tracking-tight text-zinc-100">
        Bring your runs
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {FORMATS.map((f) => (
          <div
            key={f.title}
            className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
          >
            <p className="font-mono text-sm font-bold text-zinc-100">{f.title}</p>
            <p className="mt-2 font-mono text-xs leading-relaxed text-zinc-500">
              {f.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
