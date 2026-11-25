import { ALL_SESSIONS } from '../src/data/program.js';
import { buildTimeline, totalSeconds } from '../src/lib/timeline.js';
import { EXERCISES } from '../src/data/exercises.js';
let bad = 0;
for (const s of ALL_SESSIONS) {
  for (const b of s.blocks) for (const i of b.items) if (!EXERCISES[i.ex]) { console.log('MISSING', i.ex); bad++; }
  const t = totalSeconds(buildTimeline(s));
  const flag = t < 36*60 || t > 44*60 ? '  <-- hors cible' : '';
  console.log(s.id.padEnd(4), (t/60).toFixed(1), 'min', s.test ? '(+test)' : '', flag);
}
process.exit(bad);
