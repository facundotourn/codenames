import { useState } from 'react';

interface Props {
  dark: boolean;
  onLoad: (seed: string) => void;
  onToggleDark: (val: boolean) => void;
}

export function Welcome({ dark, onLoad, onToggleDark }: Props) {
  const [seed, setSeed] = useState('');
  const handle = () => onLoad(seed.trim());

  return (
    <div className={`app welcome-page${dark ? ' dark' : ''}`}>
      <div className="welcome-wrap">

        <div className="welcome-top">
          <h1>
            <span className="title">Codenames</span>
            {' '}
            <span className="subtitle">por Facundo Tourn</span>
          </h1>
          <label className="switch" title="Modo nocturno">
            <input type="checkbox" checked={dark} onChange={e => onToggleDark(e.target.checked)} />
            <span className="slider" />
          </label>
        </div>

        <hr />

        <section className="welcome-how">
          <p className="welcome-how-title">¿Cómo funciona?</p>
          <ol className="welcome-steps">
            <li><span>Alguien del grupo elige un <strong>código de sala</strong> y lo comparte a todos</span></li>
            <li><span>Los <strong>espías</strong> de cada equipo abren la misma sala y activan <em>Modo Espía</em> para ver los colores del tablero</span></li>
            <li><span>El resto juega en <em>Modo Jugador</em>, sin ver los colores</span></li>
            <li><span>Gana el primer equipo en revelar todas sus palabras sin abrir la carta negra</span></li>
          </ol>
        </section>

        <hr />

        <section className="welcome-start">
          <div className="seed-group">
            <span className="seed-label">Sala</span>
            <input
              className="seed-input"
              type="text"
              placeholder="Código de sala…"
              value={seed}
              onChange={e => setSeed(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handle()}
              autoFocus
            />
            <button className="btn-load" onClick={handle}>
              Comenzar
            </button>
          </div>
          <p className="welcome-hint">Sin código se carga un tablero de emojis aleatorio</p>
        </section>

      </div>
    </div>
  );
}
