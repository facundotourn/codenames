import { Card as CardType } from '../types';

interface Props {
  card: CardType;
  isSpyMode: boolean;
  isGameOverCard: boolean;
  onReveal: (id: string) => void;
}

export function Card({ card, isSpyMode, isGameOverCard, onReveal }: Props) {
  const classes = ['card'];

  if (card.revealed) {
    classes.push('revealed', `revealed-${card.team.toLowerCase()}`);
  } else if (isSpyMode) {
    classes.push('spy', `spy-${card.team.toLowerCase()}`);
  }

  let label = card.word;
  if (card.revealed && isGameOverCard) {
    label = card.team === 'X' ? `💀 ${card.word} 💀` : `👏 ${card.word} 👏`;
  }

  return (
    <button
      className={classes.join(' ')}
      onClick={() => onReveal(card.id)}
      disabled={card.revealed || isSpyMode}
    >
      {label}
    </button>
  );
}
