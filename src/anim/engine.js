// Moteur d'animation des exercices : un bonhomme vu de profil, animé par
// cinématique inverse (on place les pieds, les mains et le bassin, le moteur
// calcule les genoux et les coudes). Repère : y vers le haut, sol en y = 0.

export const L = { thigh: 44, shin: 44, foot: 15, torso: 52, neck: 9, head: 10.5, upper: 30, fore: 29 };
const KB_R = 9;

const rad = (d) => (d * Math.PI) / 180;
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => 0.5 - 0.5 * Math.cos(Math.PI * t);
const add = (p, d, len) => [p[0] + Math.sin(rad(d)) * len, p[1] + Math.cos(rad(d)) * len];

// 2 segments : renvoie l'articulation intermédiaire
function ik(a, t, l1, l2, bend) {
  let dx = t[0] - a[0];
  let dy = t[1] - a[1];
  let d = Math.hypot(dx, dy);
  const max = l1 + l2 - 0.01;
  const min = Math.abs(l1 - l2) + 0.01;
  if (d > max) { dx *= max / d; dy *= max / d; d = max; }
  if (d < min) { const k = min / (d || 1); dx *= k; dy *= k; d = min; }
  const base = Math.atan2(dy, dx);
  const off = Math.acos(Math.min(1, Math.max(-1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
  const ang = base + bend * off;
  const j = [a[0] + Math.cos(ang) * l1, a[1] + Math.sin(ang) * l1];
  const end = [a[0] + dx, a[1] + dy];
  return [j, end];
}

// Fusionne une pose de base et ses modifications
export function mergePose(base, over) {
  return { ...base, ...over, kb: over.kb === undefined ? base.kb : over.kb && { ...(base.kb || {}), ...over.kb } };
}

function lerpVal(a, b, t) {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.map((v, i) => (typeof v === 'number' ? lerp(v, b[i], t) : v));
  }
  if (typeof a === 'number' && typeof b === 'number') return lerp(a, b, t);
  if (a && b && typeof a === 'object') {
    const o = {};
    for (const k of Object.keys(a)) o[k] = lerpVal(a[k], b[k] ?? a[k], t);
    return o;
  }
  return t < 0.5 ? a : b;
}

export function poseAt(anim, time) {
  const keys = anim.keys;
  const u = ((time % anim.cycle) + anim.cycle) % anim.cycle / anim.cycle;
  let i = keys.length - 1;
  for (let k = 0; k < keys.length; k++) if (keys[k].t <= u) i = k;
  const a = keys[i];
  const b = keys[(i + 1) % keys.length];
  const tb = b.t > a.t ? b.t : b.t + 1;
  const span = tb - a.t || 1;
  const f = ease((u - a.t) / span);
  const pose = lerpVal(a.pose, b.pose, f);
  // Le sens de pliage des coudes / genoux ne s'interpole pas
  for (const k of ['kN', 'kF', 'eN', 'eF']) pose[k] = f < 0.5 ? a.pose[k] : b.pose[k];
  return { pose, u };
}

// Résout une pose en points du squelette
export function solve(p) {
  const hip = p.hip;
  const sh = add(hip, p.torso, L.torso);
  const neck = add(sh, p.torso + (p.headTilt || 0), L.neck);
  const head = add(neck, p.torso + (p.headTilt || 0), L.head);
  const rel = (h) => (h[2] === 's' ? [sh[0] + h[0], sh[1] + h[1]] : h);
  const leg = (f, bend, fa) => {
    const [knee, ankle] = ik(hip, f, L.thigh, L.shin, bend);
    const a = rad(fa);
    return { knee, ankle, toe: [ankle[0] + Math.cos(a) * L.foot, ankle[1] + Math.sin(a) * L.foot] };
  };
  const arm = (h, bend) => {
    const [elbow, hand] = ik(sh, rel(h), L.upper, L.fore, bend);
    return { elbow, hand };
  };
  const out = {
    hip, sh, neck, head,
    legN: leg(p.fN, p.kN ?? 1, p.faN ?? -12),
    legF: leg(p.fF ?? p.fN, p.kF ?? p.kN ?? 1, p.faF ?? p.faN ?? -12),
    armN: arm(p.hN, p.eN ?? -1),
    armF: arm(p.hF ?? p.hN, p.eF ?? p.eN ?? -1),
  };
  if (p.kb) {
    const k = p.kb;
    let c;
    if (k.at === 'floor') c = [k.x ?? 0, KB_R + 1];
    else {
      const h = k.at === 'hF' ? out.armF.hand : k.at === 'hands'
        ? [(out.armN.hand[0] + out.armF.hand[0]) / 2, (out.armN.hand[1] + out.armF.hand[1]) / 2]
        : out.armN.hand;
      c = [h[0] + (k.dx ?? 0), h[1] + (k.dy ?? -12)];
      out.kbHand = h;
    }
    out.kb = { c, at: k.at };
  }
  return out;
}

// Construit le SVG (chaîne) d'une image — partagé entre l'appli et l'aperçu
export function renderSVG(anim, time, { w = 320, h = 240, colors = {} } = {}) {
  const C = { near: '#f2f3f5', far: '#6b7280', kb: '#ff7a1a', floor: '#2a2e37', prop: '#3a3f4b', rope: '#9aa3b2', ...colors };
  const { pose, u } = poseAt(anim, time);
  const s = solve(pose);
  const [cx, cy] = anim.view || [10, 92];
  const scale = anim.zoom || 1;
  const vw = 260 / scale;
  const vh = 195 / scale;
  const X = (p) => (p[0] - cx + vw / 2).toFixed(1);
  const Y = (p) => (cy + vh / 2 - p[1]).toFixed(1);
  const line = (a, b, col, wd) => `<line x1="${X(a)}" y1="${Y(a)}" x2="${X(b)}" y2="${Y(b)}" stroke="${col}" stroke-width="${wd}" stroke-linecap="round"/>`;
  const poly = (pts, col, wd) => `<polyline points="${pts.map((p) => `${X(p)},${Y(p)}`).join(' ')}" fill="none" stroke="${col}" stroke-width="${wd}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const leg = (g, col) => poly([s.hip, g.knee, g.ankle, g.toe], col, 7);
  const arm = (g, col) => poly([s.sh, g.elbow, g.hand], col, 6);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vw.toFixed(1)} ${vh.toFixed(1)}" width="${w}" height="${h}">`;
  // Décor
  for (const pr of anim.props || []) {
    if (pr.type === 'wall') svg += `<rect x="${X([pr.x, 0])}" y="0" width="8" height="${Y([0, 0])}" fill="${C.prop}"/>`;
    if (pr.type === 'box') svg += `<rect x="${X([pr.x, pr.h])}" y="${Y([0, pr.h])}" width="${pr.w}" height="${pr.h}" rx="3" fill="${C.prop}"/>`;
  }
  svg += `<line x1="0" y1="${Y([0, 0])}" x2="${vw}" y2="${Y([0, 0])}" stroke="${C.floor}" stroke-width="3"/>`;
  // Kettlebell au sol ou tenue par la main arrière : dessinée derrière
  const kbSVG = () => {
    if (!s.kb) return '';
    const c = s.kb.c;
    let g = '';
    if (s.kbHand) g += line(s.kbHand, c, C.kb, 3);
    else g += `<path d="M${X([c[0] - 6, c[1]])},${Y([0, c[1] + 6])} q6,-12 12,0" fill="none" stroke="${C.kb}" stroke-width="3"/>`;
    g += `<circle cx="${X(c)}" cy="${Y(c)}" r="${KB_R}" fill="${C.kb}"/>`;
    return g;
  };
  let ropeFront = '';
  if (anim.rope) {
    // u = 0 : corde sous les pieds ; elle passe derrière, au-dessus de la tête, puis devant
    const th = u * Math.PI * 2;
    const ctrl = [s.hip[0] - Math.sin(th) * 85, 98 - Math.cos(th) * 128];
    const mid = [(s.armN.hand[0] + s.armF.hand[0]) / 2, (s.armN.hand[1] + s.armF.hand[1]) / 2];
    const dx = ctrl[0] - mid[0];
    const dy = ctrl[1] - mid[1];
    const n = Math.hypot(dx, dy) || 1;
    const px = (-dy / n) * 22;
    const py = (dx / n) * 22;
    const c1 = [ctrl[0] + px, ctrl[1] + py];
    const c2 = [ctrl[0] - px, ctrl[1] - py];
    const path = `<path d="M${X(s.armF.hand)},${Y(s.armF.hand)} C${X(c1)},${Y(c1)} ${X(c2)},${Y(c2)} ${X(s.armN.hand)},${Y(s.armN.hand)}" fill="none" stroke="${C.rope}" stroke-width="2.2"/>`;
    if (-Math.sin(th) > 0) ropeFront = path; else svg += path;
  }
  svg += leg(s.legF, C.far) + arm(s.armF, C.far);
  if (s.kb && s.kb.at === 'hF') svg += kbSVG();
  svg += line(s.hip, s.sh, C.near, 10) + line(s.sh, s.neck, C.near, 6);
  svg += `<circle cx="${X(s.head)}" cy="${Y(s.head)}" r="${L.head}" fill="${C.near}"/>`;
  svg += leg(s.legN, C.near);
  if (s.kb && s.kb.at !== 'hF') svg += kbSVG();
  svg += arm(s.armN, C.near);
  svg += ropeFront;
  svg += '</svg>';
  return svg;
}
