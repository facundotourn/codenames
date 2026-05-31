import { useState } from 'react';
import { Card as CardType } from '../types';

interface Phase {
  color: string;   // 'r'|'a'|'n'|'x' = fake color, 'front' = unflip, 'real' = final reveal
  duration: number;
}

const FAKE_SPEEDS = [0.44, 0.28, 0.17]; // each finta faster than the last

function buildSequence(realTeam: string): Phase[] {
  const pool = ['r', 'a', 'n', 'x'].filter(c => c !== realTeam.toLowerCase());
  const numFakes = 1 + Math.floor(Math.random() * 3); // 1–3 fintas
  const phases: Phase[] = [];
  let last = '';

  for (let i = 0; i < numFakes; i++) {
    const speed = FAKE_SPEEDS[Math.min(i, FAKE_SPEEDS.length - 1)];
    const choices = pool.filter(c => c !== last);
    const fake = choices[Math.floor(Math.random() * choices.length)];
    last = fake;
    phases.push({ color: fake,    duration: speed }); // flip to fake
    phases.push({ color: 'front', duration: speed }); // unflip
  }

  phases.push({ color: 'real', duration: 0.44 }); // final reveal (same speed as first, feels deliberate)
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

  const isDramatic = phaseIdx >= 0;
  const currentPhase = isDramatic ? sequence[phaseIdx] : null;
  const canReveal = !revealed && !isSpyMode && !isDramatic;

  const handleClick = () => {
    if (!canReveal) return;
    if (isTense) {
      const seq = buildSequence(team);
      setSequence(seq);
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
      setPhaseIdx(-1);
      onReveal(id);
    } else {
      setPhaseIdx(i => i + 1);
    }
  };

  const isFlipped = revealed || (isDramatic && currentPhase?.color !== 'front');
  const dramaticBack =
    isDramatic && currentPhase && currentPhase.color !== 'front' && currentPhase.color !== 'real'
      ? `dramatic-${currentPhase.color}`
      : '';

  const classes = [
    'card-outer',
    `team-${team.toLowerCase()}`,
    isFlipped ? 'flipped' : '',
    isSpyMode && !revealed ? 'spy' : '',
    canReveal ? 'can-reveal' : '',
    isDramatic ? 'dramatic' : '',
    dramaticBack,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={handleClick}>
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
