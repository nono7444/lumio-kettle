import { useEffect, useRef, useState } from 'react';
import { ANIMS } from '../anim/library.js';
import { renderSVG } from '../anim/engine.js';

// Vidéo en boucle de l'exercice (mannequin 3D rendu avec Blender, fichiers dans public/anims).
// Si la vidéo manque, on retombe sur l'animation dessinée en direct.
export default function ExerciseAnim({ id, still = false, className = '' }) {
  const [failed, setFailed] = useState(false);
  const video = useRef(null);

  useEffect(() => { setFailed(false); }, [id]);

  // iOS : relance la lecture si elle a été mise en pause (retour dans l'appli, etc.)
  useEffect(() => {
    const v = video.current;
    if (!v) return undefined;
    v.play().catch(() => {});
    const onVis = () => document.visibilityState === 'visible' && v.play().catch(() => {});
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [id, still, failed]);

  if (failed || !id) return <SvgAnim id={id} still={still} className={className} />;

  if (still) {
    return (
      <div className={`anim ${className}`}>
        <img src={`./anims/${id}.jpg`} alt="" loading="lazy" onError={() => setFailed(true)} />
      </div>
    );
  }
  return (
    <div className={`anim ${className}`}>
      <video
        ref={video}
        key={id}
        src={`./anims/${id}.mp4`}
        poster={`./anims/${id}.jpg`}
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
        onError={() => setFailed(true)}
      />
    </div>
  );
}

// Secours : animation 2D dessinée en direct
function SvgAnim({ id, still, className }) {
  const anim = ANIMS[id];
  const [t, setT] = useState(anim ? anim.cycle * 0.45 : 0);
  useEffect(() => {
    if (!anim || still) return undefined;
    const start = performance.now();
    let raf;
    let last = 0;
    const loop = (now) => {
      if (now - last > 33) { last = now; setT((now - start) / 1000); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [anim, still]);
  if (!anim) return <div className={`anim ${className}`}><span>🏋️</span></div>;
  return (
    <div
      className={`anim ${className}`}
      // SVG généré par notre propre moteur (aucune donnée externe)
      dangerouslySetInnerHTML={{ __html: renderSVG(anim, t, { w: '100%', h: '100%' }) }}
    />
  );
}
