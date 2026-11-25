// Programme de 12 semaines, 2 séances par semaine (A et B), ~40 min chacune.
// Trois blocs de 4 semaines :
//   S1-4  Réadaptation   : aucun saut, on apprend les gestes, tibias renforcés à chaque séance
//   S5-8  Construction   : plus de volume, swings, burpees sans saut ; corde très dosée dès S6
//   S9-12 Intensification: unilatéral, épaulé-développé, get-up ; burpees sautés dès S9
// Tests de palier à la fin des semaines 4, 8 et 12 pour monter de charge.

export const PHASES = [
  { id: 1, name: 'Réadaptation', weeks: [1, 4], color: '#3ddc97',
    goal: 'Apprendre les gestes, zéro saut, renforcer les tibias.' },
  { id: 2, name: 'Construction', weeks: [5, 8], color: '#f5b83d',
    goal: 'Plus de volume, cardio sans impact, corde réintroduite tout doucement.' },
  { id: 3, name: 'Intensification', weeks: [9, 12], color: '#ff6b4a',
    goal: 'Mouvements complexes, circuits plus denses, sauts dosés.' },
];

export const phaseOf = (week) => PHASES.find((p) => week >= p.weeks[0] && week <= p.weeks[1]);

export const TEST_WEEKS = [4, 8, 12];

// Remplacements automatiques quand le mode « tibia sensible » est actif
export const NO_IMPACT_SWAP = { burpee: 'burpeeStep', corde: 'cordeFake' };

const it = (ex, work, rest, hint) => ({ ex, work, rest, hint });

// ---------- Blocs communs ----------
const warmup = (week) => ({
  title: 'Échauffement',
  rounds: 1,
  roundRest: 0,
  items: [
    it('chevilles', 50, 10),
    it('halo', 40, 10, 'Lent, 5 tours dans chaque sens'),
    it('hinge', 40, 10, 'Prends ton temps, sens les ischios'),
    it('goblet', 40, 10, 'Squat léger pour ouvrir les hanches'),
    it('tibias', 40, 10, '15 à 20 relevés'),
    it(week >= 5 ? 'pompes' : 'pompesInc', 30, 15, 'Tranquille, pour réveiller le haut'),
  ],
});

const cooldown = () => ({
  title: 'Retour au calme',
  rounds: 1,
  roundRest: 0,
  items: [
    it('etMollets', 30, 5),
    it('etHanches', 30, 5),
    it('etDos', 60, 0),
  ],
});

const tibiaBlock = (week) => ({
  title: 'Tibias & mollets (anti-périostite)',
  rounds: 1,
  roundRest: 0,
  items: [
    it('tibias', 40, 15, 'Lent et contrôlé'),
    it('mollets', 40, 15, week >= 7 ? 'Sur une jambe si zéro douleur' : 'Deux jambes, descente en 3 s'),
  ],
});

// Corde à sauter très progressive (à partir de la semaine 6)
const ropeBlock = (week) => {
  const table = {
    6: [4, 20, 40], 7: [5, 20, 40], 8: [5, 30, 30],
    9: [6, 30, 30], 10: [6, 40, 30], 11: [6, 45, 25], 12: [6, 45, 20],
  };
  const [rounds, work, rest] = table[week];
  return {
    title: 'Corde à sauter (dosée)',
    rounds,
    roundRest: 0,
    items: [it('corde', work, rest, 'Sauts très bas, sur sol souple')],
  };
};

// ---------- Séances ----------
function sessionA(week) {
  const p = phaseOf(week).id;
  const w = { 1: 30, 2: 35, 3: 40, 4: 40, 5: 35, 6: 40, 7: 40, 8: 45, 9: 40, 10: 40, 11: 45, 12: 45 }[week];

  if (p === 1) {
    return {
      title: 'Séance A · Force',
      focus: 'Squat, soulevé de terre, poussée et tirage',
      blocks: [
        warmup(week),
        { title: 'Bas du corps', rounds: 3, roundRest: 60, items: [
          it('goblet', w, 20, '8 à 12 répétitions, descente 3 s'),
          it('deadlift', w, 20, '10 à 12 répétitions'),
          it('pont', w, 30, '12 à 15, pause 2 s en haut'),
        ] },
        { title: 'Haut du corps', rounds: 3, roundRest: 45, items: [
          it('floor', 30, 15, '8 à 10 par bras'),
          it('rowing', 30, 15, '10 à 12 par bras'),
          it('pompesInc', 30, 30, 'Le maximum en restant propre'),
        ] },
        { title: 'Gainage', rounds: week <= 2 ? 3 : 2, roundRest: 30, items: [
          it('deadbug', 40, 15),
          it('suitcase', 30, 15, 'Marche lente, aller-retour'),
        ] },
        tibiaBlock(week),
        cooldown(),
      ],
    };
  }

  if (p === 2) {
    return {
      title: 'Séance A · Force',
      focus: 'Squat, unilatéral, poussée lourde',
      blocks: [
        warmup(week),
        { title: 'Bas du corps', rounds: 3, roundRest: 60, items: [
          it('goblet', w, 20, '10 à 15, descente 3 s'),
          it('rdl1', 30, 15, '8 à 10 par jambe'),
          it('swing', 30, 30, '15 à 20 swings explosifs'),
        ] },
        { title: 'Haut du corps', rounds: 3, roundRest: 45, items: [
          it('press', 30, 15, '6 à 10 par bras'),
          it('rowing', 30, 15, '10 à 12 par bras'),
          it('pompes', 30, 30, 'Max propre, finis sur les genoux si besoin'),
        ] },
        { title: 'Abdos', rounds: 2, roundRest: 20, items: [
          it('twist', 35, 15),
          it('suitcase', 30, 15),
        ] },
        { title: 'Finisher cardio', rounds: 3, roundRest: 0, items: [
          it('burpeeStep', 30, 30, 'Rythme régulier'),
        ] },
        tibiaBlock(week),
        cooldown(),
      ],
    };
  }

  // Phase 3
  return {
    title: 'Séance A · Force',
    focus: 'Circuits denses, unilatéral, gainage avancé',
    blocks: [
      warmup(week),
      { title: 'Bas du corps', rounds: 4, roundRest: 45, items: [
        it('goblet', w, 15, '12 à 15, descente 3 s, pause 1 s en bas'),
        it('fente', 30, 10, '8 à 10 par jambe'),
        it('swing1', 25, 20, '10 à 12 par bras'),
      ] },
      { title: 'Haut du corps', rounds: 3, roundRest: 45, items: [
        it('press', 30, 10, '6 à 10 par bras'),
        it('pompesKB', 40, 15, 'Change de côté à mi-temps'),
        it('highpull', 25, 20, '10 par bras'),
      ] },
      { title: 'Abdos', rounds: 2, roundRest: 20, items: [
        it('pullthrough', 40, 15),
        it('twist', 35, 20),
      ] },
      { title: 'Finisher cardio', rounds: 3, roundRest: 0, items: [
        it('burpee', 30, 30, 'Petit saut, réception souple'),
      ] },
      cooldown(),
    ],
  };
}

function sessionB(week) {
  const p = phaseOf(week).id;
  const test = TEST_WEEKS.includes(week);

  if (p === 1) {
    return {
      title: 'Séance B · Athlétique',
      focus: 'Charnière de hanche, épaules, cardio sans impact',
      blocks: [
        warmup(week),
        { title: 'Hanches', rounds: 3, roundRest: 60, items: [
          week === 1
            ? it('deadlift', 35, 20, 'Apprends la charnière avant le swing')
            : it('swing', 30, 30, week === 2 ? '10 à 12 swings, technique d’abord' : '15 swings propres'),
          it('fente', 30, 10, '6 à 8 par jambe, lent'),
          it('pont', 35, 30, 'Pause 2 s en haut'),
        ] },
        { title: 'Haut du corps', rounds: 3, roundRest: 45, items: [
          it('press', 25, 15, '5 à 8 par bras, strict'),
          it('rowing', 30, 15, '10 à 12 par bras'),
          it('pompesInc', 30, 30),
        ] },
        { title: 'Cardio sans impact', rounds: test ? 2 : 3, roundRest: 30, items: [
          it('burpeeStep', 30, 20, 'Aucun saut'),
          it('cordeFake', 30, 20, 'Pointes au sol, ça tourne'),
          it('pullthrough', 30, 20),
        ] },
        tibiaBlock(week),
        cooldown(),
      ],
      test,
    };
  }

  if (p === 2) {
    const blocks = [
      warmup(week),
      { title: 'Hanches', rounds: 3, roundRest: 60, items: [
        it('swing', 35, 25, '20 swings explosifs'),
        it('fente', 30, 10, '8 à 10 par jambe'),
        it('deadlift', 35, 25, '12 à 15'),
      ] },
      { title: 'Épaulé & dos', rounds: 3, roundRest: 45, items: [
        it('clean', 30, 15, '5 à 6 par bras, propre'),
        it('pompesKB', 40, 20),
      ] },
      { title: 'Gainage', rounds: 2, roundRest: 20, items: [
        it('getup', 40, 15, '1 lent par côté – sans poids d’abord'),
        it('deadbug', 40, 15),
      ] },
    ];
    if (week >= 6 && !test) blocks.push(ropeBlock(week));
    else if (!test) blocks.push({ title: 'Finisher cardio', rounds: 3, roundRest: 0, items: [it('burpeeStep', 30, 30)] });
    blocks.push(tibiaBlock(week), cooldown());
    return { title: 'Séance B · Athlétique', focus: 'Swings, épaulé, gainage, corde dosée', blocks, test };
  }

  // Phase 3
  const blocks = [
    warmup(week),
    { title: 'Complexe hanches', rounds: 3, roundRest: 45, items: [
      it('swing', 35, 15, '20 à 25 swings'),
      it('rdl1', 30, 10, '8 à 10 par jambe'),
      it('goblet', 35, 30, '12 à 15'),
    ] },
    { title: 'Épaulé & poussée', rounds: 3, roundRest: 45, items: [
      it('clean', 35, 10, '6 à 8 par bras'),
      it('rowing', 30, 10, '12 par bras, pause 1 s'),
      it('pompes', 30, 25),
    ] },
    { title: 'Get-up', rounds: 1, roundRest: 0, items: [
      it('getup', 60, 15, '1 à 2 lents par côté, avec la kettlebell'),
    ] },
  ];
  if (!test) blocks.push(ropeBlock(week));
  blocks.push({ title: 'Burpees', rounds: 2, roundRest: 0, items: [it('burpee', 25, 35)] });
  blocks.push(tibiaBlock(week), cooldown());
  return { title: 'Séance B · Athlétique', focus: 'Complexes, épaulé, corde et burpees', blocks, test };
}

export function getSession(week, day) {
  const s = day === 'A' ? sessionA(week) : sessionB(week);
  return { id: `${week}${day}`, week, day, ...s };
}

export const ALL_SESSIONS = Array.from({ length: 12 }, (_, i) => i + 1).flatMap((w) => [
  getSession(w, 'A'),
  getSession(w, 'B'),
]);

// ---------- Tests de palier ----------
// Principe de la « double progression » : quand tu atteins le haut de la fourchette
// de répétitions avec une technique propre, tu montes de charge (+4 kg en kettlebell).
export const PALIER_TESTS = {
  bas: {
    label: 'Bas du corps',
    uses: 'goblet squat, soulevé de terre, swings, fentes, pont, marche valise',
    criteria: [
      '20 goblet squats d’affilée, descente en 3 s',
      '25 swings deux mains d’affilée, dos neutre',
      'Aucune douleur au tibia pendant ni le lendemain',
    ],
  },
  haut: {
    label: 'Haut du corps',
    uses: 'développé militaire, développé au sol, rowing, épaulé, get-up, halo',
    criteria: [
      '8 développés militaires stricts par bras',
      '12 rowings par bras avec 1 s de pause en haut',
      '15 pompes complètes d’affilée',
    ],
  },
};

export const NEXT_WEIGHT = { 8: 12, 12: 16, 16: 20, 20: 24, 24: 28, 28: 32 };
