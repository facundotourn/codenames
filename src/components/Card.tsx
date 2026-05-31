import { useState, useRef, useEffect } from 'react';
import { Card as CardType } from '../types';

interface Phase {
  color: 'fake' | 'front' | 'real';
  fakeColor?: string;
  duration: number;
}

const FAKE_SPEEDS = [1.1, 0.65, 0.38];

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
  // backColorClass is only updated when the back face is invisible (card at 0°)
  const [backColorClass, setBackColorClass] = useState('');

  const landingRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const cardOuterRef = useRef<HTMLDivElement>(null);
  useEffect(() => () => { clearTimeout(landingRef.current); }, []);

  const isDramatic = phaseIdx >= 0;
  const currentPhase = isDramatic ? sequence[phaseIdx] : null;
  const canReveal = !revealed && !isSpyMode && !isDramatic;

  const handleClick = () => {
    if (!canReveal) return;
    if (isTense) {
      const seq = buildSequence(team);
      // Card is at 0° (front visible) — safe to set back color now
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
      // Update game state immediately so score / gameOver reflect the reveal
      onReveal(id);
      // Hold the zoom for 900ms, then spring-land: freeze animated scale as inline
      // style, remove .dramatic (stops animation), release inline style so the
      // CSS transition on .card-outer animates from frozen scale back to 1.
      landingRef.current = setTimeout(() => {
        const el = cardOuterRef.current;
        if (el) {
          el.style.transform = getComputedStyle(el).transform;
        }
        setPhaseIdx(-1);
        setBackColorClass('');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (el) el.style.transform = '';
          });
        });
      }, 900);
    } else if (phase.color === 'front') {
      // Unflip completed → card is at 0° → back is invisible → safe to swap color
      const next = sequence[phaseIdx + 1];
      if (next?.color === 'fake') {
        setBackColorClass(`dramatic-${next.fakeColor}`);
      } else {
        setBackColorClass(''); // next is 'real', let team color show through
      }
      setPhaseIdx(i => i + 1);
    } else {
      // Fake flip completed → start unflip
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
