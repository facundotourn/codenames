# Codenames en español

Versión web del juego de mesa **Codenames**, en español. Sin servidor ni cuentas: el multijugador funciona compartiendo un **código de sala** (seed) — todos los que cargan la misma sala ven el mismo tablero.

🎮 **Jugar:** https://ftourn.github.io/codenames/

## Cómo se juega

1. Alguien elige un **código de sala** y lo comparte con el grupo.
2. Los **espías** de cada equipo abren la misma sala y activan el *Modo Espía* para ver los colores del tablero.
3. El resto juega en *Modo Jugador*, sin ver los colores, e intenta adivinar las palabras del equipo a partir de las pistas de su espía.
4. Gana el primer equipo en revelar todas sus palabras sin abrir la carta negra (el asesino).

Sin código de sala se carga un tablero de **emojis** aleatorio, para jugar suelto.

## Desarrollo

Stack: React 18 + TypeScript + Vite.

```bash
npm install      # instalar dependencias
npm run dev      # servidor de desarrollo con hot reload
npm run build    # type-check (tsc) + build de producción en dist/
npm run preview  # servir el build de producción localmente
```

El deploy a GitHub Pages es automático en cada push a `master` (ver `.github/workflows/deploy.yml`).

Para una guía de la arquitectura del código, ver [CLAUDE.md](./CLAUDE.md).

---

Hecho por Facundo Tourn.
