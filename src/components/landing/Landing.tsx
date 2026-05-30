import Hero from './Hero';
import HowItWorks from './HowItWorks';
import InputFormats from './InputFormats';
import FooterCta from './FooterCta';

type Props = {
  onStart: () => void;
};

export default function Landing({ onStart }: Props) {
  return (
    <div className="space-y-16">
      <Hero onStart={onStart} />
      <HowItWorks />
      <InputFormats />
      <FooterCta onStart={onStart} />
    </div>
  );
}
