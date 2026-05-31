import { useState, useRef, useEffect } from 'react';
import { Card as CardType } from '../types';

interface Phase {
  color: 'fake' | 'front' | 'real';
  fakeColor?: string;
  duration: number;
  rotation: number; // absolute rotateY degrees — always accumulates forward
}

const FAKE_SPEEDS = [1.1, 0.65, 0.38];

function buildSequence(realTeam: string): Phase[] {
  const pool = ['r', 'a', 'n', 'x'].filter(c => c !== realTeam.toLowerCase());
  const numFakes = 1 + Math.floor(Math.random() * 3);
  const phases: Phase[] = [];
  let rotation = 0;
  let last = '';

  for (let i = 0; i < numFakes; i++) {
    const speed = FAKE_SPEEDS[Math.min(i, FAKE_SPEEDS.length - 1)];
    const choices = pool.filter(c => c !== last);
    const fake = choices[Math.floor(Math.random() * choices.length)];
    last = fake;
    rotation += 180; // odd multiple → back face visible (fake color)
    phases.push({ color: 'fake', fakeColor: fake, duration: speed, rotation });
    rotation += 180; // even multiple → front face visible (transparent, safe to swap color)
    phases.push({ color: 'front', duration: speed, rotation });
  }
  rotation += 180; // odd → back face (real team color)
  phases.push({ color: 'real', duration: 1.9, rotation });
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
  const [frontColorClass, setFrontColorClass] = useState('');
  const [resetRotation, setResetRotation] = useState(false);

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

        // Batch: resetRotation=true snaps inner to rotateY(180deg) with transition:none
        // so removing the inline style afterward doesn't cause an unwanted spin
        setResetRotation(true);
        setPhaseIdx(-1);
        setBackColorClass('');
        setFrontColorClass('');

        requestAnimationFrame(() => requestAnimationFrame(() => {
          if (el) el.style.transform = '';
          setResetRotation(false);
        }));
      }, 900);
    } else if (phase.color === 'front') {
      // Even-multiple of 180° — back face away — safe to swap back color.
      // Keep frontColorClass as-is: the prev fake color rotates away while the new back color appears.
      const next = sequence[phaseIdx + 1];
      if (next?.color === 'fake') setBackColorClass(`dramatic-${next.fakeColor}`);
      else setBackColorClass('');
      setPhaseIdx(i => i + 1);
    } else {
      // fake phase ended — front face about to become visible — paint it the current back color
      const fakeCode = backColorClass.replace('dramatic-', '');
      if (fakeCode) setFrontColorClass(`front-${fakeCode}`);
      setPhaseIdx(i => i + 1);
    }
  };

  // Inline transform for card-inner-3d drives all dramatic rotations.
  // resetRotation: snaps to 180° instantly (transition:none) before CSS takes over.
  let innerStyle: React.CSSProperties | undefined;
  if (resetRotation) {
    innerStyle = { transform: 'perspective(900px) rotateY(180deg)', transitionDuration: '0s' };
  } else if (currentPhase) {
    innerStyle = {
      transform: `perspective(900px) rotateY(${currentPhase.rotation}deg)`,
      transitionDuration: `${currentPhase.duration}s`,
    };
  }

  const classes = [
    'card-outer',
    `team-${team.toLowerCase()}`,
    revealed ? 'flipped' : '',
    isSpyMode && !revealed ? 'spy' : '',
    canReveal ? 'can-reveal' : '',
    isDramatic ? 'dramatic' : '',
    backColorClass,
    frontColorClass,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={handleClick} ref={cardOuterRef}>
      <div
        className="card-inner-3d"
        style={innerStyle}
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
