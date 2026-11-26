import { useEffect, useRef, useState } from 'react';
import { ANIMS } from '../anim/library.js';
import { renderSVG } from '../anim/engine.js';

// Animation en boucle d'un exercice (dessinée dans l'appli, marche sans réseau)
export default function ExerciseAnim({ id, still = false, className = '' }) {
  const anim = ANIMS[id];
  const [t, setT] = useState(anim ? anim.cycle * 0.45 : 0);
  const start = useRef(performance.now());

  useEffect(() => {
    if (!anim || still) return undefined;
    start.current = performance.now();
    let raf;
    let last = 0;
    const loop = (now) => {
      if (now - last > 33) { // ~30 images/s
        last = now;
        setT((now - start.current) / 1000);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [id, still, anim]);

  if (!anim) return <div className={`anim ${className}`}><span>🏋️</span></div>;
  return (
    <div
      className={`anim ${className}`}
      // SVG généré par notre propre moteur (aucune donnée externe)
      dangerouslySetInnerHTML={{ __html: renderSVG(anim, t, { w: '100%', h: '100%' }) }}
    />
  );
}
