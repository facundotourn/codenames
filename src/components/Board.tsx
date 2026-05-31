import { Card as CardType } from '../types';
import { Card } from './Card';

interface Props {
  cards: CardType[];
  isSpyMode: boolean;
  gameOver: boolean;
  gameOverId: string | null;
  isEmojiMode: boolean;
  red: number;
  blue: number;
  onReveal: (id: string) => void;
}

export function Board({ cards, isSpyMode, gameOver, gameOverId, isEmojiMode, red, blue, onReveal }: Props) {
  return (
    <div className={`board${isEmojiMode ? ' board-emoji' : ''}`}>
      {cards.map(card => (
        <Card
          key={card.id}
          card={card}
          isSpyMode={isSpyMode || gameOver}
          isGameOverCard={card.id === gameOverId}
          isGameWinner={
            !card.revealed && !gameOver && (
              (card.team === 'R' && red === 1) ||
              (card.team === 'A' && blue === 1)
            )
          }
          onReveal={onReveal}
        />
      ))}
    </div>
  );
}
