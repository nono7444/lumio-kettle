# Lumio Kettle

Appli iPhone (React + Capacitor) : programme kettlebell progressif de 12 semaines,
2 séances de ~40 min par semaine, pensé pour reprendre après une périostite.

## Ce qu'il y a dedans
- **24 séances** (A = Force, B = Athlétique), en 3 blocs : Réadaptation (S1-4, zéro saut),
  Construction (S5-8, corde réintroduite très doucement à partir de S6), Intensification (S9-12).
- **Chrono guidé** : grand compte à rebours, bips 3-2-1, voix française qui annonce
  chaque exercice, écran qui reste allumé, pause / précédent / suivant, +15 s de récup.
- **Fiche de chaque exercice** : vidéo YouTube, image, points clés. Tu peux changer
  la vidéo d'un exercice en collant un autre lien YouTube.
- **Tibias** : relevés de pointes et montées sur pointes à chaque séance ; avant une
  séance avec des sauts, l'appli te demande si ton tibia est OK (sinon : version sans saut).
- **Tests de palier** (fin des semaines 4, 8, 12) : si tu coches tous les critères,
  la charge passe au cran suivant (12 → 16 → 20 kg…), séparément pour le haut et le bas du corps.

## Mettre sur GitHub et compiler
1. Crée un dépôt vide `nono7444/lumio-kettle` sur GitHub.
2. Dans ce dossier :
   ```bash
   git remote add origin https://github.com/nono7444/lumio-kettle.git
   git push -u origin main
   ```
3. Onglet **Actions** : la compilation démarre toute seule (~10 min).
4. Dans FlareStore, ajoute la source :
   `https://github.com/nono7444/lumio-kettle/releases/latest/download/altstore.json`
   (ou installe `lumio-kettle-unsigned.ipa` depuis la Release).

## Tester sur ordinateur
```bash
npm install
npm run dev      # ouvre http://localhost:5173
npm run check    # vérifie la durée de chaque séance
```

## Où modifier
- `src/data/program.js` : les séances, les durées, les tests de palier
- `src/data/exercises.js` : les exercices, explications et vidéos
