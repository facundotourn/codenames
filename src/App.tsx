import { useReducer, useState, useEffect, useRef } from 'react';

declare function gtag(command: string, action: string, params?: Record<string, unknown>): void;
import seedrandom from 'seedrandom';
import { Card as CardType, Team } from './types';
import { Board } from './components/Board';
import { Welcome } from './components/Welcome';
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
  const [page, setPage] = useState<'welcome' | 'game'>('welcome');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const loadGame = (seed: string) => {
    const useEmoji = !seed;
    const { cards, red, blue } = generateBoard(seed || null, useEmoji ? EMOJIS : WORDS);
    dispatch({ type: 'NEW_GAME', cards, red, blue, emoji: useEmoji });
    gtag('event', 'load_board', { seed: seed || '(random)', mode: useEmoji ? 'emoji' : 'words' });
    setSeedInput(seed);
    setPage('game');
  };

  if (page === 'welcome') {
    return <Welcome dark={dark} onLoad={loadGame} onToggleDark={setDark} />;
  }

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
            <span className="seed-label">Sala</span>
            <input
              className="seed-input"
              type="text"
              value={seedInput}
              onChange={e => setSeedInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && loadGame(seedInput.trim())}
            />
            <button className="btn-load" onClick={() => loadGame(seedInput.trim())}>
              Cargar tablero
            </button>
          </div>
          <div className="settings-wrapper" ref={menuRef}>
            <button
              className={`settings-btn${menuOpen ? ' active' : ''}`}
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Opciones"
            >
              ⚙
            </button>
            {menuOpen && (
              <div className="settings-dropdown">
                <div className="settings-row">
                  <span>Modo</span>
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
                <div className="settings-row">
                  <span>Tema oscuro</span>
                  <label className="switch">
                    <input type="checkbox" checked={dark} onChange={e => setDark(e.target.checked)} />
                    <span className="slider" />
                  </label>
                </div>
              </div>
            )}
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
          red={game.red}
          blue={game.blue}
          onReveal={id => dispatch({ type: 'REVEAL', id })}
        />
      </div>

    </div>
  );
}
