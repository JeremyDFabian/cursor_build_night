type Props = {
  onStart: () => void;
};

export default function FooterCta({ onStart }: Props) {
  return (
    <section className="space-y-4 border-t border-zinc-800 pt-10 text-center">
      <h2 className="font-sans text-2xl font-extrabold tracking-tight text-zinc-50">
        Ready?
      </h2>
      <button
        type="button"
        onClick={onStart}
        className="rounded-md bg-lime-400 px-5 py-2 text-sm font-medium text-zinc-950 hover:bg-lime-300"
      >
        Try it →
      </button>
      <p className="font-mono text-[11px] text-zinc-700">
        Browser-only. No backend. No API. No tracking.
      </p>
    </section>
  );
}
