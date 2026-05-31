import { useState, useRef, useEffect } from 'react';
import { Card as CardType } from '../types';

interface Phase {
  reveal: string;            // team code revealed when this flip lands
  isReal: boolean;           // true for the final, real-color reveal
  face: 'front' | 'back';    // which face is showing once the flip lands
  rotation: number;          // absolute rotateY degrees — accumulates forward
  duration: number;
}

const FAKE_SPEEDS = [1.1, 0.65, 0.38];

// One flip per reveal: reverso → fake1 → fake2 → … → real.
// Each flip adds 180°, so reveals alternate between the back face (odd
// multiples of 180°) and the front face (even multiples) — no returning
// to the reverso in between.
function buildSequence(realTeam: string): Phase[] {
  const real = realTeam.toLowerCase();
  const pool = ['r', 'a', 'n', 'x'].filter(c => c !== real);
  const numFakes = 1 + Math.floor(Math.random() * 3);
  const phases: Phase[] = [];
  let rotation = 0;
  let last = '';

  for (let i = 0; i < numFakes; i++) {
    const speed = FAKE_SPEEDS[Math.min(i, FAKE_SPEEDS.length - 1)];
    const choices = pool.filter(c => c !== last);
    const fake = choices[Math.floor(Math.random() * choices.length)];
    last = fake;
    rotation += 180;
    phases.push({ reveal: fake, isReal: false, face: rotation % 360 === 180 ? 'back' : 'front', rotation, duration: speed });
  }
  rotation += 180;
  phases.push({ reveal: real, isReal: true, face: rotation % 360 === 180 ? 'back' : 'front', rotation, duration: 1.9 });
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
      // First flip always lands on the back face — pre-paint it with fake #1.
      setBackColorClass(`dramatic-${seq[0].reveal}`);
      setPhaseIdx(0);
    } else {
      onReveal(id);
    }
  };

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || e.propertyName !== 'transform') return;
    const phase = sequence[phaseIdx];
    if (!phase) return;

    if (phase.isReal) {
      onReveal(id);
      timerRef.current = setTimeout(() => {
        const el = cardOuterRef.current;
        if (el) el.style.transform = getComputedStyle(el).transform;

        // Batch: resetRotation=true snaps inner to rotateY(180deg) with transition:none,
        // and clearing the dramatic colors reverts the back face to the real team color —
        // so this snap is invisible (both faces already show the real color).
        setResetRotation(true);
        setPhaseIdx(-1);
        setBackColorClass('');
        setFrontColorClass('');

        requestAnimationFrame(() => requestAnimationFrame(() => {
          if (el) el.style.transform = '';
          setResetRotation(false);
        }));
      }, 900);
    } else {
      // Paint the face the NEXT flip will land on while it's still hidden,
      // so each flip reveals a fresh color (no reverso shown in between).
      const next = sequence[phaseIdx + 1];
      if (next) {
        if (next.face === 'back') setBackColorClass(next.isReal ? '' : `dramatic-${next.reveal}`);
        else setFrontColorClass(`front-${next.reveal}`);
      }
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
