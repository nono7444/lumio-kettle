import { useState } from 'react';
import { VideoModal } from './Media.jsx';
import ExerciseAnim from './ExerciseAnim.jsx';

export default function ExerciseSheet({ ex, weight, customId, onClose }) {
  const [yt, setYt] = useState(false);
  const id = customId || ex.yt;

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grab" />
        <h2>{ex.name}</h2>
        <p className="muted">{ex.muscles}</p>
        <div className="tags">
          {weight && <span className="tag">🏋️ {weight} kg</span>}
          {ex.side && <span className="tag">↔️ Chaque côté</span>}
          {ex.impact && <span className="tag warn">⚠️ Impact</span>}
        </div>
        <ExerciseAnim id={ex.id} />
        <h3>Points clés</h3>
        <ol className="cues">
          {ex.cues.map((c) => <li key={c}>{c}</li>)}
        </ol>
        {id && <button className="yt-link" onClick={() => setYt(true)}>▶ Vidéo complète (YouTube)</button>}
        <button className="btn full" onClick={onClose}>Fermer</button>
      </div>
      {yt && <VideoModal id={id} name={ex.name} onClose={() => setYt(false)} />}
    </div>
  );
}
