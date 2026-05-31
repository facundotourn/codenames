import { useReducer, useState, useEffect } from 'react';
import seedrandom from 'seedrandom';
import { Card as CardType, Team } from './types';
import { Board } from './components/Board';
import { WORDS } from './data/words';
import { EMOJIS } from './data/emojis';
import './App.css';

const TEAMS: Team[] = [
  'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A',
  'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R',
  'N', 'N', 'N', 'N', 'N', 'N', 'N', 'X',
];

function generateBoard(seed: string | null, wordList: string[]) {
  // RNG sequence mirrors the original jQuery implementation exactly for seed compatibility
  const rng = seedrandom(seed ?? String(Math.random()));
  const teams = [...TEAMS];
  const words = [...wordList];
  const cards: CardType[] = [];
  let red = 0, blue = 0;

  for (let i = 1; i <= 5; i++) {
    for (let j = 1; j <= 5; j++) {
      const aux = rng();
      let team: Team;
      if (teams.length > 0) {
        team = teams.splice(Math.floor(rng() * teams.length), 1)[0];
      } else {
        team = aux > 0.5 ? 'A' : 'R';
      }
      if (team === 'R') red++;
      else if (team === 'A') blue++;
      const word = words.splice(Math.floor(rng() * words.length), 1)[0];
      cards.push({ id: `${i}${j}`, word, team, revealed: false });
    }
  }

  return { cards, red, blue };
}

interface GameState {
  cards: CardType[];
  red: number;
  blue: number;
  gameOver: boolean;
  gameOverId: string | null;
  spy: boolean;
  emoji: boolean;
}

type Action =
  | { type: 'REVEAL'; id: string }
  | { type: 'SET_SPY'; value: boolean }
  | { type: 'NEW_GAME'; cards: CardType[]; red: number; blue: number; emoji: boolean };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'REVEAL': {
      if (state.gameOver) return state;
      const card = state.cards.find(c => c.id === action.id);
      if (!card || card.revealed) return state;

      const cards = state.cards.map(c => c.id === action.id ? { ...c, revealed: true } : c);
      const next: GameState = { ...state, cards };

      if (card.team === 'R') {
        next.red = state.red - 1;
        if (next.red === 0) { next.gameOver = true; next.gameOverId = action.id; }
      } else if (card.team === 'A') {
        next.blue = state.blue - 1;
        if (next.blue === 0) { next.gameOver = true; next.gameOverId = action.id; }
      } else if (card.team === 'X') {
        next.gameOver = true;
        next.gameOverId = action.id;
      }

      return next;
    }
    case 'SET_SPY':
      if (state.gameOver) return state;
      return { ...state, spy: action.value };
    case 'NEW_GAME':
      return {
        cards: action.cards,
        red: action.red,
        blue: action.blue,
        gameOver: false,
        gameOverId: null,
        spy: false,
        emoji: action.emoji,
      };
  }
}

const INITIAL: GameState = { cards: [], red: 0, blue: 0, gameOver: false, gameOverId: null, spy: false, emoji: true };

export default function App() {
  const [game, dispatch] = useReducer(reducer, INITIAL);
  const [dark, setDark] = useState(false);
  const [seedInput, setSeedInput] = useState('');

  useEffect(() => {
    const { cards, red, blue } = generateBoard(null, EMOJIS);
    dispatch({ type: 'NEW_GAME', cards, red, blue, emoji: true });
  }, []);

  const loadGame = () => {
    const trimmed = seedInput.trim();
    const useEmoji = !trimmed;
    const { cards, red, blue } = generateBoard(trimmed || null, useEmoji ? EMOJIS : WORDS);
    dispatch({ type: 'NEW_GAME', cards, red, blue, emoji: useEmoji });
  };

  return (
    <div className={`app${dark ? ' dark' : ''}`}>

      {/* Title + controls — scroll off the top */}
      <div className="top-section">
        <header>
          <h1>
            <span className="title">Codenames</span>
            {' '}
            <span className="subtitle">por Facundo Tourn</span>
          </h1>
          <hr />
        </header>
        <div className="controls-row">
          <div className="seed-group">
            <span className="seed-label">Seed</span>
            <input
              className="seed-input"
              type="text"
              value={seedInput}
              onChange={e => setSeedInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && loadGame()}
            />
            <button className="btn-load" onClick={loadGame}>
              Cargar tablero
            </button>
          </div>
          <div className={`mode-toggle${game.gameOver ? ' mode-toggle-disabled' : ''}`}>
            <button
              className={`mode-btn${!game.spy ? ' active' : ''}`}
              onClick={() => dispatch({ type: 'SET_SPY', value: false })}
            >
              Jugador
            </button>
            <button
              className={`mode-btn${game.spy ? ' active' : ''}`}
              onClick={() => dispatch({ type: 'SET_SPY', value: true })}
            >
              Espía
            </button>
          </div>
        </div>
      </div>

      {/* Score + board — full width, zona principal */}
      <div className="main-section">
        <div className="scores">
          <span className="score-red">{game.red}</span>
          <span className="score-sep"> - </span>
          <span className="score-blue">{game.blue}</span>
        </div>
        <Board
          cards={game.cards}
          isSpyMode={game.spy}
          gameOver={game.gameOver}
          gameOverId={game.gameOverId}
          isEmojiMode={game.emoji}
          onReveal={id => dispatch({ type: 'REVEAL', id })}
        />
      </div>

      {/* Dark mode toggle — scroll off the bottom */}
      <div className="bottom-section">
        <label className="switch" title="Modo nocturno">
          <input
            type="checkbox"
            checked={dark}
            onChange={e => setDark(e.target.checked)}
          />
          <span className="slider" />
        </label>
      </div>

    </div>
  );
}
