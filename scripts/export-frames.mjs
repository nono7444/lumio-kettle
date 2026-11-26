// Exporte, pour chaque exercice, la position 3D de chaque articulation image par image.
// Ce fichier est ensuite lu par scripts/blender/render.py (Blender) pour fabriquer les vidéos.
// Repère : x = devant, y = haut, z = côté droit (en cm). Sol en y = 0.
import { writeFileSync, mkdirSync } from 'node:fs';
import { ANIMS } from '../src/anim/library.js';
import { poseAt, solve } from '../src/anim/engine.js';

const FPS = 15;
const HIP_W = 9;
const SH_W = 17;
const only = process.argv[2]?.split(',');
const out = {};

for (const [id, anim] of Object.entries(ANIMS)) {
  if (only && !only.includes(id)) continue;
  const fps = anim.cycle > 4.5 ? 10 : FPS;
  const n = Math.max(1, Math.round(anim.cycle * fps));
  const frames = [];
  for (let f = 0; f < n; f++) {
    const t = (f / n) * anim.cycle;
    const { pose, u } = poseAt(anim, t);
    const s = solve(pose);
    const kbAt = pose.kb?.at;
    const twoHands = kbAt === 'hands';
    const hzN = pose.hzN ?? (twoHands ? 6 : SH_W + 2);
    const hzF = pose.hzF ?? (twoHands ? -6 : -(SH_W + 2));
    const ezN = pose.ezN ?? (SH_W + hzN) / 2 + (twoHands ? 7 : 2);
    const ezF = pose.ezF ?? (-SH_W + hzF) / 2 - (twoHands ? 7 : 2);
    const p3 = (p, z) => [+p[0].toFixed(2), +p[1].toFixed(2), +z.toFixed(2)];
    // Écart des pieds propre à chaque exercice (demi-écart en cm) et pointes ouvertes
    const stance = anim.stance ?? 13;
    const flare = anim.flare ?? 2;
    const fzN = pose.fzN ?? stance;
    const fzF = pose.fzF ?? -stance;
    const kz = (fz, sgn) => sgn * HIP_W + (fz - sgn * HIP_W) * 0.85; // genoux dans l'axe des pieds
    const fr = {
      pelvis: p3(s.hip, 0),
      hipR: p3(s.hip, HIP_W), hipL: p3(s.hip, -HIP_W),
      chest: p3(s.sh, 0),
      shR: p3(s.sh, SH_W), shL: p3(s.sh, -SH_W),
      neck: p3(s.neck, 0), head: p3(s.head, 0),
      kneeR: p3(s.legN.knee, kz(fzN, 1)), ankleR: p3(s.legN.ankle, fzN), toeR: p3(s.legN.toe, fzN + flare),
      kneeL: p3(s.legF.knee, kz(fzF, -1)), ankleL: p3(s.legF.ankle, fzF), toeL: p3(s.legF.toe, fzF - flare),
      elbowR: p3(s.armN.elbow, ezN), handR: p3(s.armN.hand, hzN),
      elbowL: p3(s.armF.elbow, ezF), handL: p3(s.armF.hand, hzF),
      faceDir: +(pose.torso + (pose.headTilt || 0)).toFixed(2),
    };
    if (s.kb) {
      const z = kbAt === 'hN' ? hzN : kbAt === 'hF' ? hzF : kbAt === 'floor' ? (pose.kb.z ?? 0) : (hzN + hzF) / 2;
      fr.kb = p3(s.kb.c, z);
      fr.kbHand = s.kbHand ? p3(s.kbHand, z) : null;
    }
    if (anim.rope) {
      // Corde : courbe passant par les deux mains et un point qui tourne autour du corps
      const th = u * Math.PI * 2;
      const tip = [s.hip[0] - Math.sin(th) * 62, 100 - Math.cos(th) * 100];
      const hr = s.armN.hand;
      const hl = s.armF.hand;
      const mid = [(hr[0] + hl[0]) / 2, (hr[1] + hl[1]) / 2];
      const ctrl = [2 * tip[0] - mid[0], 2 * tip[1] - mid[1]];
      const pts = [];
      for (let i = 0; i <= 24; i++) {
        const k = i / 24;
        const a = (1 - k) * (1 - k);
        const b = 2 * k * (1 - k);
        const c = k * k;
        // On part de la main gauche vers la main droite
        const x = a * hl[0] + b * ctrl[0] + c * hr[0];
        const y = a * hl[1] + b * ctrl[1] + c * hr[1];
        const z = -hzN + (2 * hzN) * k;
        pts.push([+x.toFixed(2), +Math.max(0.6, y).toFixed(2), +z.toFixed(2)]);
      }
      fr.rope = pts;
    }
    frames.push(fr);
  }
  out[id] = {
    fps,
    view: anim.view || [10, 92],
    zoom: anim.zoom || 1,
    cam: anim.cam || {},
    props: anim.props || [],
    frames,
  };
}

mkdirSync('/tmp/kettle-frames', { recursive: true });
writeFileSync('/tmp/kettle-frames/frames.json', JSON.stringify(out));
console.log('Exporté :', Object.keys(out).length, 'exercices');
