import confetti from 'canvas-confetti';

// Team palettes mirror the card back-face gradients (see App.css .team-r / .team-a).
const PALETTES: Record<'R' | 'A', string[]> = {
  R: ['#f87171', '#ef4444', '#c81e1e'],
  A: ['#60a5fa', '#3b82f6', '#1a40b8'],
};

// Desktop-only: skip touch/coarse pointers and narrow viewports.
export function confettiSupported(): boolean {
  return window.matchMedia('(min-width: 768px) and (pointer: fine)').matches;
}

// Two cannons fire from the bottom-left and bottom-right corners and arc
// toward the centre, in the winning team's colour.
export function fireVictoryConfetti(team: 'R' | 'A'): void {
  const colors = PALETTES[team];
  const end = Date.now() + 900;

  (function frame() {
    confetti({ particleCount: 5, angle: 60, spread: 60, startVelocity: 60, origin: { x: 0, y: 1 }, colors });
    confetti({ particleCount: 5, angle: 120, spread: 60, startVelocity: 60, origin: { x: 1, y: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
