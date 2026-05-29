import type { Verdict } from '../types';

type Props = {
  verdict: Verdict;
  visible: boolean;
};

const NUMBER_RE = /(\d+(?:\.\d+)?(?:s\/km|km|s|m)?)/g;

function highlightNumbers(text: string) {
  const parts = text.split(NUMBER_RE);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return (
        <span key={i} className="font-mono text-lime-400">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function verdictText(v: Verdict): string {
  switch (v.kind) {
    case 'fade':
      return `On km ${v.km} you ran ${v.deltaSecPerKm}s/km slower than your fastest run.`;
    case 'solo':
      return 'Drop another run to see them race.';
    case 'noOverlap':
      return 'Runs are too different to compare per km.';
  }
}

export default function Verdict({ verdict, visible }: Props) {
  return (
    <p
      className={`text-sm leading-relaxed text-zinc-100 transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-live="polite"
    >
      {highlightNumbers(verdictText(verdict))}
    </p>
  );
}
