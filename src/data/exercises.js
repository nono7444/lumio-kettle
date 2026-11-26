// Bibliothèque d'exercices.
// yt     : identifiant de la vidéo YouTube de démonstration
// load   : quelle charge utiliser -> 'bas' (jambes / hanches), 'haut' (bras / épaules), null (poids du corps)
// side   : true = se fait d'un côté puis de l'autre
// impact : true = sauts / chocs (dosé à cause de la périostite)

export const EXERCISES = {
  // ---------- Échauffement / mobilité ----------
  chevilles: {
    name: 'Mobilité chevilles',
    muscles: 'Chevilles, mollets',
    yt: '9_JaeEm3pXc',
    load: null,
    cues: [
      'Debout, un pied devant, genou qui avance au-dessus des orteils',
      'Le talon reste collé au sol',
      'Va-et-vient lent, puis change de pied à mi-temps',
    ],
  },
  halo: {
    name: 'Halo',
    muscles: 'Épaules, gainage',
    yt: 'LEjVh4scVy4',
    load: 'haut',
    cues: [
      'Pieds largeur de hanches',
      'Kettlebell tenue par les cornes, à l’envers, devant la poitrine',
      'Fais le tour de la tête, au plus près, coudes serrés',
      'Abdos et fessiers serrés : le bassin ne bouge pas',
      'Alterne le sens à chaque tour',
    ],
  },
  hinge: {
    name: 'Charnière de hanche (sans charge)',
    muscles: 'Ischios, fessiers',
    yt: '9eVB3V3YFcg',
    load: null,
    cues: [
      'Pieds largeur de hanches',
      'Mains sur les hanches, genoux légèrement fléchis',
      'Pousse les fesses en arrière comme pour fermer une porte',
      'Dos plat, buste qui descend vers 45°',
      'Remonte en serrant fort les fessiers',
    ],
  },
  tibias: {
    name: 'Relevés de pointes (tibias)',
    muscles: 'Tibial antérieur – protège ta périostite',
    yt: 'nQKgHwi8W9E',
    load: null,
    cues: [
      'Pieds largeur de hanches',
      'Dos et fesses contre un mur, pieds 30 cm devant',
      'Relève les pointes de pieds le plus haut possible',
      'Redescends lentement sans claquer',
      'Brûlure normale, douleur aiguë = stop',
    ],
  },
  mollets: {
    name: 'Montées sur pointes lentes',
    muscles: 'Mollets, tibial postérieur',
    yt: 'BSwxaWsvBjo',
    load: null,
    cues: [
      'Pieds largeur de hanches',
      'Mains au mur, monte sur la pointe en 1 s',
      'Tiens 1 s en haut, redescends en 3 s',
      'Garde le poids sur le gros orteil',
      'Semaine 5+ : sur une jambe si aucune douleur',
    ],
  },

  // ---------- Bas du corps ----------
  goblet: {
    name: 'Goblet squat',
    muscles: 'Cuisses, fessiers, gainage',
    yt: '0eW8av1WC4g',
    load: 'bas',
    cues: [
      'Kettlebell contre la poitrine, tenue par les cornes',
      'Pieds largeur d’épaules, pointes un peu ouvertes',
      'Descends entre les talons, coudes à l’intérieur des genoux',
      'Descente en 3 s, remonte en poussant dans tout le pied',
    ],
  },
  deadlift: {
    name: 'Soulevé de terre kettlebell',
    muscles: 'Fessiers, ischios, bas du dos',
    yt: '-N4NjwW7bGA',
    load: 'bas',
    cues: [
      'Pieds un peu plus larges que les hanches, pointes légèrement ouvertes',
      'Kettlebell entre les pieds, au niveau du milieu du pied',
      'Fesses en arrière, dos plat, épaules au-dessus de la cloche',
      'Pousse le sol et serre les fessiers en haut',
      'Ne cambre pas en fin de mouvement',
    ],
  },
  pont: {
    name: 'Pont fessier lesté',
    muscles: 'Fessiers, ischios',
    yt: 'Yao9ShODVZA',
    load: 'bas',
    cues: [
      'Pieds à plat, largeur de hanches, talons près des fesses',
      'Sur le dos, pieds à plat, kettlebell posée sur le bassin',
      'Pousse dans les talons, monte le bassin',
      'Tiens 2 s en haut en serrant les fessiers',
      'Les côtes restent basses : pas de cambrure',
    ],
  },
  fente: {
    name: 'Fente arrière goblet',
    muscles: 'Cuisses, fessiers, équilibre',
    yt: 'eut_zemVF6s',
    load: 'bas',
    side: true,
    cues: [
      'Départ pieds largeur de hanches',
      'Kettlebell contre la poitrine',
      'Grand pas en arrière, genou arrière qui frôle le sol',
      'Le poids reste sur le talon de la jambe avant',
      'Plus doux pour les tibias que la fente avant',
    ],
  },
  rdl1: {
    name: 'Soulevé de terre sur une jambe',
    muscles: 'Ischios, fessiers, chevilles',
    yt: 'Zfr6wizR8rs',
    load: 'bas',
    side: true,
    cues: [
      'Debout sur une jambe, l’autre pied juste à côté au départ',
      'Kettlebell dans la main opposée à la jambe d’appui',
      'Penche-toi, la jambe libre part en arrière bien droite',
      'Hanches parallèles au sol, dos plat',
      'Remonte en serrant le fessier de la jambe d’appui',
    ],
  },
  swing: {
    name: 'Swing deux mains',
    muscles: 'Fessiers, ischios, cardio',
    yt: 'pAWaNCsncZA',
    load: 'bas',
    cues: [
      'Pieds un peu plus larges que les épaules, pointes légèrement ouvertes',
      'C’est une charnière, pas un squat : fesses en arrière',
      'Lance la kettlebell avec un coup de hanches sec',
      'Les bras ne tirent pas, ils guident – hauteur de poitrine',
      'En haut : gainé, fessiers serrés, souffle fort',
    ],
  },
  swing1: {
    name: 'Swing une main',
    muscles: 'Fessiers, ischios, gainage anti-rotation',
    yt: 'rH8JTfOflgI',
    load: 'bas',
    side: true,
    cues: [
      'Pieds un peu plus larges que les épaules',
      'Même mouvement que le swing deux mains',
      'Épaule basse et rangée, le buste ne tourne pas',
      'La main libre suit le mouvement ou reste sur le côté',
    ],
  },

  // ---------- Haut du corps ----------
  floor: {
    name: 'Développé au sol',
    muscles: 'Pectoraux, triceps, épaules',
    yt: 'P_ijh09h23s',
    load: 'haut',
    side: true,
    cues: [
      'Pieds à plat, largeur de hanches',
      'Sur le dos, genoux fléchis, coude posé au sol à 45°',
      'Poignet droit, la cloche repose sur l’avant-bras',
      'Pousse vers le plafond, verrouille le bras',
      'Redescends en 2 s jusqu’à toucher le sol avec le coude',
    ],
  },
  rowing: {
    name: 'Rowing un bras',
    muscles: 'Dos, biceps, arrière d’épaule',
    yt: 'hYzh_TgHXnM',
    load: 'haut',
    side: true,
    cues: [
      'Fente décalée, main libre sur la cuisse avant, dos plat',
      'Tire le coude vers la hanche (pas vers le plafond)',
      'Serre l’omoplate 1 s en haut',
      'Le buste ne tourne pas',
    ],
  },
  press: {
    name: 'Développé militaire un bras',
    muscles: 'Épaules, triceps, gainage',
    yt: 'bqDq1RXrTGg',
    load: 'haut',
    side: true,
    cues: [
      'Pieds largeur de hanches',
      'Kettlebell en position rack : contre l’épaule, poignet droit',
      'Fessiers et abdos serrés, pas de cambrure',
      'Pousse droit au-dessus, biceps près de l’oreille',
      'Redescends en contrôle vers le rack',
    ],
  },
  clean: {
    name: 'Épaulé + développé',
    muscles: 'Tout le corps',
    yt: 'tsJsgzcqBJU',
    load: 'haut',
    side: true,
    cues: [
      'Pieds largeur d’épaules',
      'Petit swing puis ramène la kettlebell en rack, coude collé',
      'La cloche s’enroule autour du poignet : elle ne doit pas taper',
      'Développé au-dessus de la tête, puis retour rack',
      'Laisse retomber entre les jambes et recommence',
    ],
  },
  highpull: {
    name: 'Tirage haut',
    muscles: 'Trapèzes, épaules, dos',
    yt: 'VIDCrY9RER8',
    load: 'haut',
    side: true,
    cues: [
      'Pieds largeur d’épaules',
      'Départ comme un swing une main',
      'En haut, tire le coude vers l’arrière, à hauteur d’épaule',
      'Poignet neutre, la kettlebell reste près du corps',
      'Relâche et enchaîne en swing',
    ],
  },
  pompesInc: {
    name: 'Pompes inclinées',
    muscles: 'Pectoraux, triceps, gainage',
    yt: 'WDIpL0pjun0',
    load: null,
    cues: [
      'Pieds largeur de hanches',
      'Mains sur une chaise, un canapé ou un plan de travail',
      'Corps gainé et aligné de la tête aux talons',
      'Coudes à 45° du corps, pas en croix',
      'Poitrine jusqu’au support, puis repousse fort',
    ],
  },
  pompes: {
    name: 'Pompes',
    muscles: 'Pectoraux, triceps, gainage',
    yt: 'WDIpL0pjun0',
    load: null,
    cues: [
      'Pieds largeur de hanches',
      'Mains un peu plus larges que les épaules',
      'Gainé de la tête aux talons, fessiers serrés',
      'Descends la poitrine à 2 cm du sol, coudes à 45°',
      'Si tu bloques : finis la série sur les genoux',
    ],
  },
  pompesKB: {
    name: 'Pompes mains sur la kettlebell + rowing',
    muscles: 'Pectoraux, dos, gainage',
    yt: '6rWeJh_e2jA',
    load: 'haut',
    cues: [
      'Une main sur la poignée de la kettlebell, l’autre au sol',
      '1 pompe, puis 1 rowing avec la kettlebell',
      'Pieds écartés pour rester stable, bassin immobile',
      'Change de côté à mi-temps',
    ],
  },

  // ---------- Gainage / abdos ----------
  deadbug: {
    name: 'Dead bug kettlebell',
    muscles: 'Abdos profonds',
    yt: 'Sa7msHujL3M',
    load: null,
    cues: [
      'Sur le dos, kettlebell tenue bras tendus au-dessus de la poitrine',
      'Jambes à 90°, bas du dos plaqué au sol',
      'Allonge une jambe lentement, sans décoller le dos',
      'Alterne les jambes, souffle en allongeant',
    ],
  },
  suitcase: {
    name: 'Marche valise',
    muscles: 'Obliques, gainage, grip',
    yt: 'SXf6ePnQMJ8',
    load: 'bas',
    side: true,
    cues: [
      'Pieds sous les hanches, marche normale',
      'Kettlebell dans une main, le long du corps',
      'Marche lentement, grand et droit, sans pencher',
      'Épaules à la même hauteur',
      'Petits pas souples, pas de talon qui claque',
    ],
  },
  pullthrough: {
    name: 'Planche + passage de kettlebell',
    muscles: 'Abdos, obliques, épaules',
    yt: 'rWS8IGcIEy8',
    load: null,
    cues: [
      'Planche bras tendus, kettlebell à côté d’une main',
      'Avec la main opposée, tire la kettlebell sous toi de l’autre côté',
      'Bassin immobile : pieds écartés pour plus de stabilité',
      'Alterne les mains',
    ],
  },
  twist: {
    name: 'Russian twist',
    muscles: 'Obliques',
    yt: 'PkGPokybYaU',
    load: null,
    cues: [
      'Pieds à plat, largeur de hanches',
      'Assis, pieds au sol, buste penché en arrière dos droit',
      'Kettlebell tenue contre la poitrine',
      'Tourne les épaules d’un côté puis de l’autre',
      'Lentement : c’est le buste qui tourne, pas juste les bras',
    ],
  },
  getup: {
    name: 'Turkish get-up',
    muscles: 'Tout le corps, épaules, gainage',
    yt: '06fs0BdJTug',
    load: 'haut',
    side: true,
    cues: [
      'Commence sans poids ou avec une chaussure posée sur le poing',
      'Bras tendu vers le plafond, regard sur la kettlebell en permanence',
      'Coude → main → pont → genou → debout, puis l’inverse',
      'Lent et propre : 1 répétition par côté peut prendre 40 s',
    ],
  },

  // ---------- Cardio ----------
  burpeeStep: {
    name: 'Burpee sans saut',
    muscles: 'Tout le corps, cardio',
    yt: 'ew84D9HO_3I',
    load: null,
    cues: [
      'Pieds largeur de hanches',
      'Mains au sol, recule un pied puis l’autre',
      'Option : une pompe',
      'Ramène les pieds un par un, relève-toi',
      'Aucun saut : idéal pendant la périostite',
    ],
  },
  burpee: {
    name: 'Burpee',
    muscles: 'Tout le corps, cardio',
    yt: 'dq0-J7QXGvM',
    load: null,
    impact: true,
    cues: [
      'Pieds largeur de hanches',
      'Mains au sol, saute les pieds en arrière en planche',
      'Ramène les pieds, relève-toi',
      'Petit saut en haut, réception souple sur l’avant du pied',
      'Tibia qui tire = repasse en version sans saut',
    ],
  },
  corde: {
    name: 'Corde à sauter',
    muscles: 'Mollets, cardio, coordination',
    yt: 'Y3wzaWE9QRY',
    load: null,
    impact: true,
    cues: [
      'Pieds serrés, presque collés',
      'Sauts très bas : 1 à 2 cm suffisent',
      'Réception sur l’avant du pied, genoux souples',
      'Coudes près du corps, ce sont les poignets qui tournent',
      'Sur un sol souple (tapis, parquet), jamais sur béton',
    ],
  },
  cordeFake: {
    name: 'Corde à sauter imaginaire (sans saut)',
    muscles: 'Cardio, épaules, mollets',
    yt: 'Y3wzaWE9QRY',
    load: null,
    cues: [
      'Pieds serrés, presque collés',
      'Tiens les poignées sans corde (ou corde pliée dans une main)',
      'Fais tourner les poignets en sautillant sur place SANS décoller',
      'Pointes de pieds au sol, talons qui montent à peine',
      'Remplace la corde tant que le tibia est sensible',
    ],
  },

  // ---------- Retour au calme ----------
  etMollets: {
    name: 'Étirement mollets au mur',
    muscles: 'Mollets, soléaire',
    yt: '9_JaeEm3pXc',
    load: null,
    side: true,
    cues: [
      'Mains au mur, jambe arrière tendue, talon au sol',
      'À mi-temps, plie le genou arrière pour étirer le soléaire',
      'Respire lentement, aucune douleur',
    ],
  },
  etHanches: {
    name: 'Étirement fléchisseurs de hanche',
    muscles: 'Psoas, quadriceps',
    yt: null,
    load: null,
    side: true,
    cues: [
      'Un genou au sol, l’autre pied devant',
      'Serre le fessier de la jambe au sol et avance le bassin',
      'Lève le bras du côté du genou au sol',
    ],
  },
  etDos: {
    name: 'Posture de l’enfant + pectoraux',
    muscles: 'Dos, épaules, pectoraux',
    yt: null,
    load: null,
    cues: [
      'À genoux, fesses sur les talons, bras allongés devant',
      'Respire dans le dos',
      'À mi-temps, bras tendu sur le côté contre un mur pour les pectoraux',
    ],
  },
};

export const ytThumb = (id) => (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null);
export const ytWatch = (id, name) =>
  id
    ? `https://www.youtube.com/watch?v=${id}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(name + ' exercice')}`;
