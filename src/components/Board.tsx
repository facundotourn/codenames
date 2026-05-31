import { Card as CardType } from '../types';
import { Card } from './Card';

interface Props {
  cards: CardType[];
  isSpyMode: boolean;
  gameOver: boolean;
  gameOverId: string | null;
  isEmojiMode: boolean;
  onReveal: (id: string) => void;
}

export function Board({ cards, isSpyMode, gameOver, gameOverId, isEmojiMode, onReveal }: Props) {
  return (
    <div className={`board${isEmojiMode ? ' board-emoji' : ''}`}>
      {cards.map(card => (
        <Card
          key={card.id}
          card={card}
          isSpyMode={isSpyMode || gameOver}
          isGameOverCard={card.id === gameOverId}
          onReveal={onReveal}
        />
      ))}
    </div>
  );
}
