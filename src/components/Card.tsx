import { useState, useRef, useEffect } from 'react';
import { Card as CardType } from '../types';

interface Phase {
  color: 'fake' | 'front' | 'real';
  fakeColor?: string;
  duration: number;
}

const FAKE_SPEEDS = [1.1, 0.65, 0.38]; // slow → medium → fast flip durations

function buildSequence(realTeam: string): Phase[] {
  const pool = ['r', 'a', 'n', 'x'].filter(c => c !== realTeam.toLowerCase());
  const numFakes = 1 + Math.floor(Math.random() * 3);
  const phases: Phase[] = [];
  let last = '';

  for (let i = 0; i < numFakes; i++) {
    const speed = FAKE_SPEEDS[Math.min(i, FAKE_SPEEDS.length - 1)];
    const choices = pool.filter(c => c !== last);
    const fake = choices[Math.floor(Math.random() * choices.length)];
    last = fake;
    phases.push({ color: 'fake', fakeColor: fake, duration: speed });
    phases.push({ color: 'front', duration: speed });
  }
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

  useEffect(() => () => { clearTimeout(timerRef.current); }, []);

  const isDramatic = phaseIdx >= 0;
  const currentPhase = isDramatic ? sequence[phaseIdx] : null;
  const canReveal = !revealed && !isSpyMode && !isDramatic;

  const handleClick = () => {
    if (!canReveal) return;
    if (isTense) {
      const seq = buildSequence(team);
      setSequence(seq);
      // Card is at 0° — safe to set back color now
      setBackColorClass(`dramatic-${seq[0].fakeColor}`);
      setPhaseIdx(0);
    } else {
      onReveal(id);
    }
  };

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || e.propertyName !== 'transform') return;
    const phase = sequence[phaseIdx];
    if (!phase) return;

    if (phase.color === 'real') {
      onReveal(id);
      timerRef.current = setTimeout(() => {
        const el = cardOuterRef.current;
        if (el) el.style.transform = getComputedStyle(el).transform;
        setPhaseIdx(-1);
        setBackColorClass('');
        requestAnimationFrame(() => requestAnimationFrame(() => {
          if (el) el.style.transform = '';
        }));
      }, 900);
    } else if (phase.color === 'front') {
      // Unflip done → card at 0° → back invisible → safe to swap color
      const next = sequence[phaseIdx + 1];
      if (next?.color === 'fake') setBackColorClass(`dramatic-${next.fakeColor}`);
      else setBackColorClass('');
      setPhaseIdx(i => i + 1);
    } else {
      // Fake flip done → start unflip
      setPhaseIdx(i => i + 1);
    }
  };

  const isFlipped = revealed || (isDramatic && currentPhase?.color !== 'front');

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
        style={currentPhase ? { transitionDuration: `${currentPhase.duration}s` } : undefined}
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
