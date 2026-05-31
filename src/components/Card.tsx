import { Card as CardType } from '../types';

interface Props {
  card: CardType;
  isSpyMode: boolean;
  isGameOverCard: boolean;
  onReveal: (id: string) => void;
}

export function Card({ card, isSpyMode, isGameOverCard, onReveal }: Props) {
  const { id, word, team, revealed } = card;
  const canReveal = !revealed && !isSpyMode;

  const classes = [
    'card-outer',
    `team-${team.toLowerCase()}`,
    revealed ? 'flipped' : '',
    isSpyMode && !revealed ? 'spy' : '',
    canReveal ? 'can-reveal' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={canReveal ? () => onReveal(id) : undefined}>
      <div className="card-inner-3d">
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
