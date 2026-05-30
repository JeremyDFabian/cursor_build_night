import { useMemo } from 'react';
import Track from '../Track';
import { buildRace } from '../../lib/race';
import { sampleRuns } from '../../lib/sampleRace';

export default function SampleRace() {
  const race = useMemo(() => buildRace(sampleRuns), []);
  return <Track race={race} autoPlay />;
}
