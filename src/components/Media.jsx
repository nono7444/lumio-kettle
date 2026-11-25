import { useState } from 'react';
import { ytThumb } from '../data/exercises.js';

// Lecteur hébergé sur GitHub Pages (branche gh-pages, source : player/index.html).
// YouTube refuse de se lancer directement dans une appli maison (erreur 153),
// alors on passe par cette petite page https qui contient le lecteur YouTube.
const PLAYER_URL = 'https://nono7444.github.io/lumio-kettle/';

export const parseYouTubeId = (input) => {
  if (!input) return null;
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([\w-]{11})/);
  return m ? m[1] : null;
};

// Lecteur plein écran, dans l'appli, qui démarre tout de suite
export function VideoModal({ id, name, onClose }) {
  return (
    <div className="video-modal" onClick={onClose}>
      <div className="video-modal-top">
        <span>{name}</span>
        <button className="icon-btn" onClick={onClose} aria-label="Fermer">✕</button>
      </div>
      <div className="video-modal-frame" onClick={(e) => e.stopPropagation()}>
        <iframe
          src={`${PLAYER_URL}?v=${id}`}
          title={name}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
      <div className="muted small center">Touche en dehors de la vidéo pour fermer</div>
    </div>
  );
}

// Vignette : un appui = la vidéo se lance directement dans l'appli
export function VideoCard({ id, name, compact = false }) {
  const [open, setOpen] = useState(false);
  const thumb = ytThumb(id);

  return (
    <>
      <button
        type="button"
        className={`video ${compact ? 'compact' : ''}`}
        onClick={(e) => { e.stopPropagation(); if (id) setOpen(true); }}
        aria-label={`Voir la vidéo : ${name}`}
      >
        <div className="video-ph">🎬</div>
        {thumb && <img src={thumb} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
        {id ? <span className="play">▶</span> : <span className="video-tag">Pas de vidéo</span>}
      </button>
      {open && <VideoModal id={id} name={name} onClose={() => setOpen(false)} />}
    </>
  );
}
