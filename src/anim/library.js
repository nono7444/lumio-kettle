// Animations des exercices (boucles). Coordonnées : y vers le haut, sol en y = 0,
// le bonhomme regarde vers la droite. Membre « N » = côté visible, « F » = côté caché.
// Une main notée [dx, dy, 's'] est placée par rapport à l'épaule.
import { mergePose } from './engine.js';

const ST = { hip: [0, 91], torso: 0, fN: [4, 5], fF: [-4, 5], hN: [4, -55, 's'], hF: [0, -55, 's'] };
const LYING = { hip: [0, 10], torso: -90, fN: [32, 5], fF: [30, 5], faN: -10, hN: [-4, 5], hF: [-8, 5] };

const make = (base, cycle, keys, extra = {}) => ({
  cycle,
  keys: keys.map(([t, over]) => ({ t, pose: mergePose(base, over) })),
  ...extra,
});

// Positions de pompes (mains au sol, pieds sur les pointes)
const PLANK_UP = { hip: [2, 43], torso: 69, fN: [-80, 12], fF: [-80, 12], faN: -60, hN: [50, 3], hF: [48, 3], kN: 1 };
const PLANK_DOWN = { hip: [8, 18], torso: 86, hN: [50, 3], hF: [48, 3], eN: 1, eF: 1 };

export const ANIMS = {
  // ---------- Échauffement / tibias ----------
  chevilles: make(
    { hip: [-4, 86], torso: 6, fN: [20, 5], fF: [-30, 5], hN: [66, 118], hF: [64, 118] },
    3,
    [[0, {}], [0.45, { hip: [8, 77] }], [0.6, { hip: [8, 77] }]],
    { props: [{ type: 'wall', x: 72 }], cam: { az: 12 } }
  ),
  halo: make(
    { ...ST, kb: { at: 'hands', dx: 0, dy: 9 }, hN: [20, 6, 's'], hF: [20, 6, 's'], hzN: 5, hzF: -5 },
    3.2,
    [
      [0, {}],
      [0.25, { hN: [2, 22, 's'], hF: [2, 22, 's'], hzN: 27, hzF: 17 }],
      [0.5, { hN: [-16, 22, 's'], hF: [-16, 22, 's'], hzN: 5, hzF: -5 }],
      [0.75, { hN: [2, 22, 's'], hF: [2, 22, 's'], hzN: -17, hzF: -27 }],
    ],
    { view: [5, 100], zoom: 1, cam: { az: 45, el: 18 } }
  ),
  hinge: make(
    { ...ST, hN: [8, 92], hF: [6, 92] },
    3,
    [[0, {}], [0.15, {}], [0.6, { hip: [-20, 84], torso: 52, hN: [-12, 88], hF: [-14, 88] }], [0.7, { hip: [-20, 84], torso: 52, hN: [-12, 88], hF: [-14, 88] }]]
  ),
  tibias: make(
    { hip: [-12, 86], torso: -9, fN: [20, 5], fF: [16, 5], faN: -12, hN: [4, -54, 's'], hF: [0, -54, 's'] },
    2,
    [[0, {}], [0.35, { faN: 28 }], [0.5, { faN: 28 }]],
    { props: [{ type: 'wall', x: -32 }], view: [8, 75], zoom: 1.2, cam: { az: 40 } }
  ),
  mollets: make(
    { ...ST, torso: 8, hN: [54, 122], hF: [52, 122] },
    5,
    [[0, {}], [0.2, { hip: [3, 101], fN: [4, 15], fF: [-4, 15], faN: -46 }], [0.4, { hip: [3, 101], fN: [4, 15], fF: [-4, 15], faN: -46 }], [0.95, {}]],
    { props: [{ type: 'wall', x: 62 }], view: [10, 82], zoom: 1.15, cam: { az: 14 } }
  ),

  // ---------- Bas du corps ----------
  goblet: make(
    { ...ST, kb: { at: 'hands', dx: 6, dy: -4 }, hN: [14, -20, 's'], hF: [12, -20, 's'], fN: [6, 5], fF: [-2, 5] },
    4,
    [[0, {}], [0.1, {}], [0.6, { hip: [-16, 48], torso: 28 }], [0.68, { hip: [-16, 48], torso: 28 }]],
    { stance: 22, flare: 6 }
  ),
  deadlift: make(
    { ...ST, kb: { at: 'hands', dx: 0, dy: -12 }, hN: [6, 88], hF: [4, 88] },
    3.4,
    [[0, {}], [0.1, {}], [0.5, { hip: [-26, 62], torso: 70, hN: [8, 22], hF: [6, 22] }], [0.6, { hip: [-26, 62], torso: 70, hN: [8, 22], hF: [6, 22] }]],
    { stance: 21, flare: 5 }
  ),
  pont: make(
    { ...LYING, kb: { at: 'hands', dx: 0, dy: 0 }, hN: [2, 21], hF: [0, 21] },
    3,
    [[0, {}], [0.35, { hip: [-2, 36], torso: -117, headTilt: 27, hN: [0, 46], hF: [-2, 46] }], [0.6, { hip: [-2, 36], torso: -117, headTilt: 27, hN: [0, 46], hF: [-2, 46] }]],
    { view: [-15, 70] }
  ),
  fente: make(
    { ...ST, kb: { at: 'hands', dx: 6, dy: -4 }, hN: [14, -20, 's'], hF: [12, -20, 's'], fN: [6, 5], fF: [0, 5] },
    3.5,
    [[0, {}], [0.15, {}], [0.5, { hip: [-22, 52], torso: 6, fF: [-62, 12], faF: -55 }], [0.65, { hip: [-22, 52], torso: 6, fF: [-62, 12], faF: -55 }]],
    { view: [-15, 92] }
  ),
  rdl1: make(
    { ...ST, kb: { at: 'hN', dy: -12 }, hN: [6, -55, 's'], fF: [-6, 12], faF: -30 },
    4,
    [[0, {}], [0.12, {}], [0.33, { hip: [-6, 89], torso: 40, fF: [-63, 22], faF: -60, hN: [2, -55, 's'] }], [0.55, { hip: [-12, 86], torso: 80, fF: [-98, 98], faF: -80, hN: [0, -55, 's'], hF: [-2, -55, 's'] }], [0.65, { hip: [-12, 86], torso: 80, fF: [-98, 98], faF: -80, hN: [0, -55, 's'], hF: [-2, -55, 's'] }]],
    { view: [-15, 92], stance: 11, flare: 2 }
  ),
  swing: make(
    { hip: [-24, 70], torso: 66, fN: [8, 5], fF: [0, 5], hN: [-10, 62], hF: [-12, 62], kb: { at: 'hands', dx: -6, dy: -9 } },
    1.8,
    [[0, {}], [0.25, { hip: [-12, 84], torso: 30, hN: [43, 79], hF: [41, 79], kb: { dx: 7, dy: -8 } }], [0.45, { hip: [0, 91], torso: -4, hN: [56, 140], hF: [54, 140], kb: { dx: 12, dy: 0 } }], [0.55, { hip: [0, 91], torso: -4, hN: [56, 140], hF: [54, 140], kb: { dx: 12, dy: 0 } }], [0.75, { hip: [-12, 84], torso: 30, hN: [43, 79], hF: [41, 79], kb: { dx: 7, dy: -8 } }]],
    { stance: 22, flare: 5 }
  ),
  swing1: make(
    { hip: [-24, 70], torso: 66, fN: [8, 5], fF: [0, 5], hN: [-10, 62], hF: [4, -50, 's'], kb: { at: 'hN', dx: -6, dy: -9 } },
    1.8,
    [[0, {}], [0.25, { hip: [-12, 84], torso: 30, hN: [43, 79], kb: { dx: 7, dy: -8 } }], [0.45, { hip: [0, 91], torso: -4, hN: [56, 140], hF: [-6, -52, 's'], kb: { dx: 12, dy: 0 } }], [0.55, { hip: [0, 91], torso: -4, hN: [56, 140], hF: [-6, -52, 's'], kb: { dx: 12, dy: 0 } }], [0.75, { hip: [-12, 84], torso: 30, hN: [43, 79], kb: { dx: 7, dy: -8 } }]],
    { stance: 22, flare: 5 }
  ),

  // ---------- Haut du corps ----------
  floor: make(
    { ...LYING, kb: { at: 'hN', dx: -6, dy: 5 }, hN: [-40, 34], eN: -1, hF: [-14, 5], eF: 1 },
    3,
    [[0, {}], [0.4, { hN: [-52, 68] }], [0.55, { hN: [-52, 68] }]],
    { view: [-15, 70] }
  ),
  rowing: make(
    { hip: [-6, 78], torso: 62, fN: [-26, 5], fF: [28, 5], hF: [32, 52], hN: [42, 46], eN: -1, kb: { at: 'hN', dy: -12 } },
    3,
    [[0, {}], [0.4, { hN: [12, 84] }], [0.55, { hN: [12, 84] }]]
  ),
  press: make(
    { ...ST, kb: { at: 'hN', dx: -7, dy: -1 }, hN: [10, -6, 's'] },
    3,
    [[0, {}], [0.15, {}], [0.45, { hN: [2, 58, 's'], kb: { dx: -7, dy: 3 } }], [0.58, { hN: [2, 58, 's'], kb: { dx: -7, dy: 3 } }]],
    { view: [5, 104], zoom: 0.9 }
  ),
  clean: make(
    { hip: [-22, 72], torso: 60, fN: [8, 5], fF: [0, 5], hN: [-8, 62], hF: [4, -50, 's'], kb: { at: 'hN', dx: -6, dy: -9 } },
    4,
    [
      [0, {}],
      [0.1, { hip: [-8, 88], torso: 15, hN: [26, 70], kb: { dx: 0, dy: -10 } }],
      [0.2, { hip: [0, 91], torso: 0, hN: [10, -6, 's'], kb: { dx: -7, dy: -1 } }],
      [0.3, { hip: [0, 91], torso: 0, hN: [10, -6, 's'], kb: { dx: -7, dy: -1 } }],
      [0.5, { hip: [0, 91], torso: 0, hN: [2, 58, 's'], kb: { dx: -7, dy: 3 } }],
      [0.6, { hip: [0, 91], torso: 0, hN: [2, 58, 's'], kb: { dx: -7, dy: 3 } }],
      [0.78, { hip: [0, 91], torso: 0, hN: [10, -6, 's'], kb: { dx: -7, dy: -1 } }],
      [0.88, { hip: [-8, 88], torso: 15, hN: [26, 70], kb: { dx: 0, dy: -10 } }],
    ],
    { view: [5, 104], zoom: 0.9, stance: 20, flare: 4 }
  ),
  highpull: make(
    { hip: [-24, 70], torso: 66, fN: [8, 5], fF: [0, 5], hN: [-10, 62], hF: [4, -50, 's'], kb: { at: 'hN', dx: -6, dy: -9 } },
    2.2,
    [[0, {}], [0.25, { hip: [-12, 84], torso: 30, hN: [43, 79], kb: { dx: 7, dy: -8 } }], [0.5, { hip: [0, 91], torso: -3, hN: [20, -2, 's'], eN: -1, kb: { dx: 9, dy: -5 } }], [0.6, { hip: [0, 91], torso: -3, hN: [20, -2, 's'], eN: -1, kb: { dx: 9, dy: -5 } }], [0.8, { hip: [-12, 84], torso: 30, hN: [43, 79], kb: { dx: 7, dy: -8 } }]],
    { stance: 20, flare: 4 }
  ),
  pompesInc: make(
    { hip: [-1, 60], torso: 52, fN: [-70, 12], fF: [-70, 12], faN: -60, hN: [46, 48], hF: [44, 48], eN: 1, eF: 1 },
    2.6,
    [[0, {}], [0.45, { hip: [7, 48], torso: 61 }], [0.55, { hip: [7, 48], torso: 61 }]],
    { props: [{ type: 'box', x: 30, w: 44, h: 46 }], stance: 12, flare: 1 }
  ),
  pompes: make(
    { ...PLANK_UP, eN: 1, eF: 1 },
    2.6,
    [[0, {}], [0.45, PLANK_DOWN], [0.55, PLANK_DOWN]],
    { view: [-15, 70], stance: 12, flare: 1 }
  ),
  pompesKB: make(
    { ...PLANK_UP, fF: [-82, 12], hN: [50, 21], eN: 1, eF: 1, kb: { at: 'hN', dy: -11 } },
    4,
    [
      [0, {}],
      [0.2, { hip: [8, 24], torso: 84 }],
      [0.4, {}],
      [0.65, { hN: [24, 48], eN: -1 }],
      [0.8, {}],
    ],
    { view: [-15, 70], stance: 22, flare: 1 }
  ),

  // ---------- Gainage ----------
  deadbug: make(
    { hip: [0, 10], torso: -90, fN: [44, 54], fF: [44, 54], faN: 0, hN: [-50, 66], hF: [-52, 66], kb: { at: 'hands', dx: 0, dy: 8 } },
    4,
    [[0, {}], [0.3, { fN: [86, 16], faN: 0 }], [0.45, { fN: [86, 16], faN: 0 }], [0.75, {}]],
    { view: [-5, 70], stance: 11, flare: 1 }
  ),
  suitcase: make(
    { ...ST, kb: { at: 'hN', dy: -12 }, hN: [4, -56, 's'] },
    1.6,
    [
      [0, { fN: [18, 5], fF: [-18, 8], faF: -35, hip: [0, 88], hF: [-14, -52, 's'] }],
      [0.25, { fN: [0, 5], fF: [2, 18], faF: -10, hip: [0, 91], hF: [0, -55, 's'] }],
      [0.5, { fN: [-18, 8], faN: -35, fF: [18, 5], hip: [0, 88], hF: [14, -52, 's'] }],
      [0.75, { fN: [2, 18], faN: -10, fF: [0, 5], hip: [0, 91], hF: [0, -55, 's'] }],
    ],
    { stance: 11, flare: 2 }
  ),
  pullthrough: make(
    { ...PLANK_UP, fF: [-86, 12], hF: [72, 18], kb: { at: 'hF', dy: -9 } },
    3,
    [[0, { hF: [30, 18], hzF: -34 }], [0.45, { hF: [30, 18], hzF: 26, hip: [2, 46] }], [0.6, { hF: [30, 18], hzF: 26, hip: [2, 46] }]],
    { view: [-15, 55], zoom: 1.3, cam: { az: 55, el: 22 }, stance: 22, flare: 1 }
  ),
  twist: make(
    { hip: [0, 12], torso: -32, fN: [50, 5], fF: [48, 5], faN: -5, hN: [24, -14, 's'], hF: [22, -12, 's'], kb: { at: 'hands', dx: 5, dy: -3 } },
    2.4,
    [[0, { hN: [18, -26, 's'], hF: [18, -26, 's'], hzN: 30, hzF: 14 }], [0.5, { hN: [18, -26, 's'], hF: [18, -26, 's'], hzN: -14, hzF: -30 }]],
    { view: [10, 70], zoom: 1.15, cam: { az: 82, el: 28 }, stance: 14, flare: 1 }
  ),
  getup: make(
    { hip: [0, 10], torso: -90, fN: [30, 5], fF: [88, 8], faF: 70, hN: [0, 58, 's'], hF: [-22, 4], eF: 1, kb: { at: 'hN', dx: -5, dy: 5 } },
    10,
    [
      [0, {}],
      [0.1, { torso: -58, hF: [-26, 4] }],
      [0.2, { torso: -28, hF: [-44, 3] }],
      [0.28, { hip: [2, 30], torso: -48, hF: [-46, 4], fF: [86, 8] }],
      [0.36, { hip: [-8, 48], torso: -6, fF: [-48, 10], faF: -30, hF: [-26, 6] }],
      [0.44, { hip: [-10, 52], torso: 0, fF: [-50, 10], faF: -30, hF: [-2, -50, 's'] }],
      [0.52, { hip: [0, 91], torso: 0, fN: [6, 5], fF: [-4, 5], faF: -12, hF: [-2, -54, 's'] }],
      [0.6, { hip: [0, 91], torso: 0, fN: [6, 5], fF: [-4, 5], faF: -12, hF: [-2, -54, 's'] }],
      [0.68, { hip: [-10, 52], torso: 0, fF: [-50, 10], faF: -30, hF: [-2, -50, 's'] }],
      [0.76, { hip: [-8, 48], torso: -6, fF: [-48, 10], faF: -30, hF: [-26, 6] }],
      [0.84, { hip: [2, 30], torso: -48, hF: [-46, 4], fF: [86, 8] }],
      [0.92, { torso: -40, hF: [-40, 4] }],
    ],
    { view: [5, 100], zoom: 0.8 }
  ),

  // ---------- Cardio ----------
  burpeeStep: make(
    { ...ST },
    6,
    [
      [0, {}],
      [0.14, { hip: [-10, 46], torso: 75, hN: [40, 3], hF: [38, 3], fN: [4, 5] }],
      [0.28, { hip: [-6, 44], torso: 71, hN: [40, 3], hF: [38, 3], fN: [-90, 12], faN: -60, fF: [4, 5] }],
      [0.4, { hip: [-8, 43], torso: 69, hN: [40, 3], hF: [38, 3], fN: [-90, 12], faN: -60, fF: [-90, 12], faF: -60 }],
      [0.52, { hip: [-6, 44], torso: 71, hN: [40, 3], hF: [38, 3], fN: [4, 5], fF: [-90, 12], faF: -60 }],
      [0.66, { hip: [-10, 46], torso: 75, hN: [40, 3], hF: [38, 3], fN: [4, 5] }],
      [0.82, {}],
    ],
    { view: [-15, 88], stance: 14, flare: 2 }
  ),
  burpee: make(
    { ...ST },
    3.6,
    [
      [0, {}],
      [0.15, { hip: [-10, 46], torso: 75, hN: [40, 3], hF: [38, 3] }],
      [0.3, { hip: [-8, 43], torso: 69, hN: [40, 3], hF: [38, 3], fN: [-90, 12], faN: -60, fF: [-90, 12], faF: -60 }],
      [0.45, { hip: [-10, 46], torso: 75, hN: [40, 3], hF: [38, 3] }],
      [0.6, { hip: [0, 86] }],
      [0.72, { hip: [0, 104], fN: [4, 18], fF: [-4, 18], faN: -50, hN: [6, 56, 's'], hF: [4, 56, 's'] }],
      [0.85, { hip: [0, 88] }],
    ],
    { view: [-15, 92], stance: 14, flare: 2 }
  ),
  corde: make(
    { ...ST, hN: [12, -50, 's'], hF: [10, -50, 's'], fN: [3, 5], fF: [-3, 5], faN: -35 },
    0.62,
    [[0, { hip: [0, 97], fN: [3, 12], fF: [-3, 12], faN: -40 }], [0.5, { hip: [0, 90], fN: [3, 6], fF: [-3, 6], faN: -25 }]],
    { rope: true, stance: 8, flare: 1 }
  ),
  cordeFake: make(
    { ...ST, fN: [3, 5], fF: [-3, 5], faN: -20 },
    0.62,
    [[0, { hip: [0, 95], fN: [3, 11], fF: [-3, 11], faN: -40, hN: [18, -44, 's'], hF: [16, -44, 's'] }], [0.25, { hip: [0, 93], hN: [10, -40, 's'], hF: [8, -40, 's'] }], [0.5, { hip: [0, 90], hN: [6, -50, 's'], hF: [4, -50, 's'] }], [0.75, { hip: [0, 93], hN: [14, -54, 's'], hF: [12, -54, 's'] }]],
    { stance: 8, flare: 1 }
  ),

  // ---------- Étirements ----------
  etMollets: make(
    { hip: [-2, 80], torso: 28, fN: [24, 5], fF: [-52, 5], faF: -4, hN: [60, 122], hF: [58, 122] },
    10,
    [[0, {}], [0.25, { hip: [6, 77] }], [0.45, { hip: [6, 77] }], [0.6, { hip: [-6, 70], torso: 24, fF: [-46, 5] }], [0.85, { hip: [-6, 70], torso: 24, fF: [-46, 5] }]],
    { props: [{ type: 'wall', x: 68 }], cam: { az: 12 } }
  ),
  etHanches: make(
    { hip: [-10, 49], torso: 0, fN: [36, 5], fF: [-50, 9], faF: -20, hN: [30, 50], hF: [4, 56, 's'] },
    10,
    [[0, {}], [0.35, { hip: [2, 46], torso: -8 }], [0.7, { hip: [2, 46], torso: -8 }]],
    { view: [0, 80] }
  ),
  etDos: make(
    { hip: [-44, 24], torso: 92, headTilt: 8, fN: [-48, 6], fF: [-50, 6], faN: 180, faF: 180, hN: [64, 5], hF: [62, 5] },
    5,
    [[0, {}], [0.5, { hip: [-42, 28], torso: 88 }]],
    { view: [0, 60] }
  ),
};
