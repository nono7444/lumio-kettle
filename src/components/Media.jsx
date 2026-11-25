import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { ytThumb, ytWatch } from '../data/exercises.js';

export const parseYouTubeId = (input) => {
  if (!input) return null;
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([\w-]{11})/);
  return m ? m[1] : null;
};

export async function openVideo(id, name) {
  const url = ytWatch(id, name);
  if (Capacitor.isNativePlatform()) {
    await Browser.open({ url, presentationStyle: 'popover' });
  } else {
    window.open(url, '_blank', 'noopener');
  }
}

// Vignette de la vidéo + lecture.
// Sur iPhone la vidéo s'ouvre dans un lecteur intégré à l'appli (YouTube refuse
// les lecteurs embarqués dans les applis maison) ; sur navigateur elle se lit sur place.
export function VideoCard({ id, name, compact = false }) {
  const [inline, setInline] = useState(false);
  const native = Capacitor.isNativePlatform();
  const thumb = ytThumb(id);

  if (inline && id && !native) {
    return (
      <div className={`video ${compact ? 'compact' : ''}`}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0`}
          title={name}
          allow="autoplay; encrypted-media; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`video ${compact ? 'compact' : ''}`}
      onClick={() => (id && !native ? setInline(true) : openVideo(id, name))}
      aria-label={`Voir la vidéo : ${name}`}
    >
      <div className="video-ph">🎬</div>
      {thumb && <img src={thumb} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
      <span className="play">▶</span>
      {!id && <span className="video-tag">Chercher sur YouTube</span>}
    </button>
  );
}
