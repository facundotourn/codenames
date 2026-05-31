import { useState } from 'react';
import { Card as CardType } from '../types';

interface Props {
  card: CardType;
  isSpyMode: boolean;
  isGameOverCard: boolean;
  isGameWinner: boolean;
  onReveal: (id: string) => void;
}

export function Card({ card, isSpyMode, isGameOverCard, isGameWinner, onReveal }: Props) {
  const { id, word, team, revealed } = card;
  // 0=idle 1=flip→neutral 2=unflip 3=flip→assassin 4=unflip→then reveal
  const [phase, setPhase] = useState(0);
  const isDramatic = phase > 0;

  const canReveal = !revealed && !isSpyMode && !isDramatic;

  const handleClick = () => {
    if (!canReveal) return;
    if (isGameWinner) setPhase(1);
    else onReveal(id);
  };

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    // only respond to the flip (transform on the inner element itself, not bubbled)
    if (e.target !== e.currentTarget || e.propertyName !== 'transform') return;
    if (phase === 1) setPhase(2);
    else if (phase === 2) setPhase(3);
    else if (phase === 3) setPhase(4);
    else if (phase === 4) { setPhase(0); onReveal(id); }
  };

  const isFlipped = revealed || phase === 1 || phase === 3;
  const dramaticBack = phase === 1 ? 'dramatic-neutral'
                     : phase === 3 ? 'dramatic-assassin'
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
