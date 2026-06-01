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
  dramatic: boolean;
  onReveal: (id: string) => void;
}

export function Board({ cards, isSpyMode, gameOver, gameOverId, isEmojiMode, red, blue, dramatic, onReveal }: Props) {
  const isTense = dramatic && !gameOver && (red === 1 || blue === 1);
  return (
    <div className={`board${isEmojiMode ? ' board-emoji' : ''}`}>
      {cards.map(card => (
        <Card
          key={card.id}
          card={card}
          isSpyMode={isSpyMode || gameOver}
          isGameOverCard={card.id === gameOverId}
          isTense={isTense}
          onReveal={onReveal}
        />
      ))}
    </div>
  );
}
