// Aperçu : 4 images par animation -> /tmp/anim/<id>-<i>.svg
import { writeFileSync } from 'node:fs';
import { ANIMS } from '../src/anim/library.js';
import { renderSVG } from '../src/anim/engine.js';
const only = process.argv[2];
for (const [id, a] of Object.entries(ANIMS)) {
  if (only && !only.split(',').includes(id)) continue;
  const n = 5;
  for (let i = 0; i < n; i++) {
    const svg = renderSVG(a, (a.cycle * i) / n, { w: 260, h: 195 })
      .replace('<svg ', '<svg style="background:#0b0c0f" ');
    writeFileSync(`/tmp/anim/${id}-${i}.svg`, svg.replace(/<svg([^>]*)>/, `<svg$1><rect width="100%" height="100%" fill="#0b0c0f"/>`));
  }
}
