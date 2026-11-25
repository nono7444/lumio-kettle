import { EXERCISES, } from '../data/exercises.js';
import { NO_IMPACT_SWAP } from '../data/program.js';

const SIDE_SWITCH = 5; // secondes pour changer de côté
const BLOCK_TRANSITION = 20; // installation entre deux blocs
const PREP = 10;

export function resolveEx(id, noImpact) {
  const real = noImpact && NO_IMPACT_SWAP[id] ? NO_IMPACT_SWAP[id] : id;
  return { id: real, ...EXERCISES[real] };
}

// Transforme une séance en liste d'étapes chronométrées
export function buildTimeline(session, { noImpact = false } = {}) {
  const steps = [];
  const push = (s) => steps.push(s);

  session.blocks.forEach((block, bi) => {
    for (let r = 1; r <= block.rounds; r++) {
      block.items.forEach((item, ii) => {
        const ex = resolveEx(item.ex, noImpact);
        const base = { ex, hint: item.hint, block: block.title, round: r, rounds: block.rounds };
        if (ex.side) {
          push({ ...base, kind: 'work', duration: item.work, side: 'gauche' });
          push({ ...base, kind: 'rest', duration: SIDE_SWITCH, label: 'Change de côté' });
          push({ ...base, kind: 'work', duration: item.work, side: 'droite' });
        } else {
          push({ ...base, kind: 'work', duration: item.work });
        }
        const lastItem = ii === block.items.length - 1;
        const lastRound = r === block.rounds;
        let rest = item.rest;
        if (lastItem && !lastRound) rest = Math.max(rest, block.roundRest);
        if (lastItem && lastRound) rest = 0;
        if (rest > 0) push({ ...base, kind: 'rest', duration: rest, label: lastItem ? 'Récup entre les tours' : 'Récup' });
      });
    }
    if (bi < session.blocks.length - 1) {
      push({ kind: 'rest', duration: BLOCK_TRANSITION, label: 'Bloc suivant', block: session.blocks[bi + 1].title, transition: true });
    }
  });

  // Prépa au début
  steps.unshift({ kind: 'prep', duration: PREP, label: 'Prépare-toi', block: session.blocks[0].title });

  // Chaque étape connaît le prochain exercice
  for (let i = 0; i < steps.length; i++) {
    const nextWork = steps.slice(i + 1).find((s) => s.kind === 'work');
    steps[i].next = nextWork ? { ex: nextWork.ex, side: nextWork.side } : null;
  }
  return steps;
}

export const totalSeconds = (steps) => steps.reduce((a, s) => a + s.duration, 0);

export const fmt = (sec) => {
  const s = Math.max(0, Math.ceil(sec));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
};

// Exercices uniques d'une séance (pour l'aperçu)
export function sessionExercises(session, noImpact) {
  const seen = new Map();
  session.blocks.forEach((b) =>
    b.items.forEach((i) => {
      const ex = resolveEx(i.ex, noImpact);
      if (!seen.has(ex.id)) seen.set(ex.id, { ex, block: b.title });
    })
  );
  return [...seen.values()];
}

export const hasImpact = (session) =>
  session.blocks.some((b) => b.items.some((i) => EXERCISES[i.ex]?.impact));
