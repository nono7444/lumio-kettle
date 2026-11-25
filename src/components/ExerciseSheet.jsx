import { useState } from 'react';
import { VideoCard, parseYouTubeId } from './Media.jsx';

export default function ExerciseSheet({ ex, weight, customId, onSetVideo, onClose }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState('');
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
        <VideoCard id={id} name={ex.name} />
        <h3>Points clés</h3>
        <ol className="cues">
          {ex.cues.map((c) => <li key={c}>{c}</li>)}
        </ol>

        {editing ? (
          <div className="edit-video">
            <input
              placeholder="Colle un lien YouTube"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              autoFocus
            />
            <button
              className="btn small"
              onClick={() => {
                const parsed = parseYouTubeId(val);
                if (parsed) { onSetVideo(parsed); setEditing(false); }
              }}
            >OK</button>
            {customId && (
              <button className="btn small ghost" onClick={() => { onSetVideo(null); setEditing(false); }}>
                Vidéo d’origine
              </button>
            )}
          </div>
        ) : (
          <button className="link" onClick={() => setEditing(true)}>Changer la vidéo</button>
        )}
        <button className="btn full" onClick={onClose}>Fermer</button>
      </div>
    </div>
  );
}
