import { useState, useRef, useEffect } from 'react';
import { Card as CardType } from '../types';

interface Phase {
  color: 'fake' | 'front' | 'real';
  fakeColor?: string;
  duration: number;
}

const FAKE_HOLD = [1.1, 0.65, 0.38]; // seconds to display each fake color
const INITIAL_FLIP_SPEED = 0.5;      // seconds for the opening flip into fake1

function buildSequence(realTeam: string): Phase[] {
  const pool = ['r', 'a', 'n', 'x'].filter(c => c !== realTeam.toLowerCase());
  const numFakes = 1 + Math.floor(Math.random() * 3);
  const phases: Phase[] = [];
  let last = '';
  for (let i = 0; i < numFakes; i++) {
    const hold = FAKE_HOLD[Math.min(i, FAKE_HOLD.length - 1)];
    const choices = pool.filter(c => c !== last);
    const fake = choices[Math.floor(Math.random() * choices.length)];
    last = fake;
    phases.push({ color: 'fake', fakeColor: fake, duration: hold });
  }
  phases.push({ color: 'front', duration: 0.38 });
  phases.push({ color: 'real', duration: 1.9 });
  return phases;
}

interface Props {
  card: CardType;
  isSpyMode: boolean;
  isGameOverCard: boolean;
  isTense: boolean;
  onReveal: (id: string) => void;
}

export function Card({ card, isSpyMode, isGameOverCard, isTense, onReveal }: Props) {
  const { id, word, team, revealed } = card;
  const [sequence, setSequence] = useState<Phase[]>([]);
  const [phaseIdx, setPhaseIdx] = useState(-1);
  const [backColorClass, setBackColorClass] = useState('');

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const cardOuterRef = useRef<HTMLDivElement>(null);
  // Ref copy of sequence so setTimeout callbacks always see the latest value
  const seqRef = useRef<Phase[]>([]);

  useEffect(() => () => { clearTimeout(timerRef.current); }, []);

  const isDramatic = phaseIdx >= 0;
  const currentPhase = isDramatic ? sequence[phaseIdx] : null;
  const canReveal = !revealed && !isSpyMode && !isDramatic;

  // After the first flip completes, cycle through remaining fake phases using
  // timeouts — card stays at 180°, we just swap the back color each time.
  const advanceFakeChain = (idx: number) => {
    const phase = seqRef.current[idx];
    if (!phase) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const nextIdx = idx + 1;
      const next = seqRef.current[nextIdx];
      if (!next) return;
      if (next.color === 'fake') {
        setBackColorClass(`dramatic-${next.fakeColor}`);
        setPhaseIdx(nextIdx);
        advanceFakeChain(nextIdx);
      } else {
        // next is 'front': trigger unflip
        setBackColorClass('');
        setPhaseIdx(nextIdx);
      }
    }, phase.duration * 1000);
  };

  const handleClick = () => {
    if (!canReveal) return;
    if (isTense) {
      const seq = buildSequence(team);
      seqRef.current = seq;
      setSequence(seq);
      setBackColorClass(`dramatic-${seq[0].fakeColor}`);
      setPhaseIdx(0);
    } else {
      onReveal(id);
    }
  };

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || e.propertyName !== 'transform') return;
    const phase = seqRef.current[phaseIdx];
    if (!phase) return;

    if (phase.color === 'fake') {
      // Initial flip into fake1 done — start the hold/color-swap chain
      advanceFakeChain(phaseIdx);
    } else if (phase.color === 'front') {
      // Unflip done → advance to real
      setPhaseIdx(i => i + 1);
    } else if (phase.color === 'real') {
      onReveal(id);
      // Hold the zoomed state for 900ms then spring-land
      timerRef.current = setTimeout(() => {
        const el = cardOuterRef.current;
        if (el) el.style.transform = getComputedStyle(el).transform;
        setPhaseIdx(-1);
        setBackColorClass('');
        requestAnimationFrame(() => requestAnimationFrame(() => {
          if (el) el.style.transform = '';
        }));
      }, 900);
    }
  };

  // Card is flipped for all phases except 'front' (unflip)
  const isFlipped = revealed || (isDramatic && currentPhase?.color !== 'front');

  // Only the first fake and the front/real phases actually animate the flip;
  // subsequent fake phases just hold at 180° (no transition needed but keep duration consistent)
  const flipDuration = currentPhase?.color === 'fake'
    ? INITIAL_FLIP_SPEED
    : currentPhase?.duration;

  const classes = [
    'card-outer',
    `team-${team.toLowerCase()}`,
    isFlipped ? 'flipped' : '',
    isSpyMode && !revealed ? 'spy' : '',
    canReveal ? 'can-reveal' : '',
    isDramatic ? 'dramatic' : '',
    backColorClass,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={handleClick} ref={cardOuterRef}>
      <div
        className="card-inner-3d"
        style={flipDuration != null ? { transitionDuration: `${flipDuration}s` } : undefined}
        onTransitionEnd={isDramatic ? handleTransitionEnd : undefined}
      >
        <div className="card-face card-front">
          <span className="card-word">{word}</span>
        </div>
        <div className="card-face card-back">
          <span className="card-word">
            {isGameOverCard ? (team === 'X' ? `💀 ${word} 💀` : `👏 ${word} 👏`) : word}
          </span>
        </div>
      </div>
    </div>
  );
}
