import { useEffect, useMemo, useRef, useState } from 'react';
import { buildTimeline, fmt, totalSeconds } from '../lib/timeline.js';
import { beep, speak, stopSpeech, keepScreenOn, unlockAudio } from '../lib/audio.js';
import { VideoCard } from './Media.jsx';
import ExerciseSheet from './ExerciseSheet.jsx';

const sideLabel = (s) => (s === 'gauche' ? 'Côté gauche' : s === 'droite' ? 'Côté droit' : '');

export default function Player({ session, state, onFinish, onQuit, onSetVideo }) {
  const { settings, weights, videos } = state;
  const steps = useMemo(() => buildTimeline(session, { noImpact: settings.noImpact }), [session, settings.noImpact]);
  const total = useMemo(() => totalSeconds(steps), [steps]);

  const [idx, setIdx] = useState(0);
  const [running, setRunning] = useState(true);
  const [endsAt, setEndsAt] = useState(() => Date.now() + steps[0].duration * 1000);
  const [pausedLeft, setPausedLeft] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [sheet, setSheet] = useState(null);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const fired = useRef(new Set());

  const step = steps[idx];
  const leftMs = running ? endsAt - now : pausedLeft ?? step.duration * 1000;
  const left = Math.max(0, leftMs / 1000);
  const elapsedBefore = useMemo(() => steps.slice(0, idx).reduce((a, s) => a + s.duration, 0), [steps, idx]);
  const elapsed = elapsedBefore + (step.duration - left);

  const say = (t) => settings.voice && speak(t);
  const bip = (t) => settings.beeps && beep(t);
  const weightOf = (ex) => (ex?.load ? weights[ex.load] : null);

  // Écran allumé pendant toute la séance
  useEffect(() => {
    keepScreenOn(true);
    return () => { keepScreenOn(false); stopSpeech(); };
  }, []);

  // Horloge
  useEffect(() => {
    if (!running) return undefined;
    const t = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, [running]);

  // Annonces à l'entrée de chaque étape
  useEffect(() => {
    const s = steps[idx];
    if (s.kind === 'prep') {
      say(`Prépare-toi. Premier exercice : ${s.next?.ex.name}.`);
    } else if (s.kind === 'work') {
      bip('long');
      say(`${s.ex.name}${s.side ? `, ${sideLabel(s.side).toLowerCase()}` : ''}. ${s.duration} secondes.`);
    } else if (s.label === 'Change de côté') {
      bip('end');
      say('Change de côté.');
    } else {
      bip('end');
      if (s.next) {
        const intro = s.transition ? `Bloc suivant : ${s.block}.` : 'Récupération.';
        say(`${intro} Ensuite : ${s.next.ex.name}${s.next.side ? `, ${sideLabel(s.next.side).toLowerCase()}` : ''}.`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  // Compte à rebours sonore + passage à l'étape suivante
  useEffect(() => {
    if (!running) return;
    const sec = Math.ceil(left);
    const key = `${idx}-${sec}`;
    if (sec <= 3 && sec >= 1 && !fired.current.has(key)) {
      fired.current.add(key);
      bip('short');
    }
    if (step.kind === 'work' && step.duration >= 30 && sec === 10 && !fired.current.has(key + 'v')) {
      fired.current.add(key + 'v');
      say('10 secondes');
    }
    if (leftMs <= 0) {
      if (idx >= steps.length - 1) {
        finish();
      } else {
        const next = idx + 1;
        setIdx(next);
        setEndsAt(Date.now() + steps[next].duration * 1000);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  const finish = () => {
    bip('end');
    say('Séance terminée. Bravo !');
    setRunning(false);
    onFinish();
  };

  const goTo = (i) => {
    if (i > steps.length - 1) { finish(); return; }
    const j = Math.min(Math.max(i, 0), steps.length - 1);
    fired.current = new Set([...fired.current].filter((k) => !k.startsWith(`${j}-`)));
    setIdx(j);
    if (running) setEndsAt(Date.now() + steps[j].duration * 1000);
    else setPausedLeft(steps[j].duration * 1000);
  };

  const togglePause = () => {
    unlockAudio();
    if (running) {
      setPausedLeft(endsAt - Date.now());
      setRunning(false);
      stopSpeech();
    } else {
      setEndsAt(Date.now() + (pausedLeft ?? step.duration * 1000));
      setPausedLeft(null);
      setNow(Date.now());
      setRunning(true);
    }
  };

  const addTime = (s) => {
    if (running) setEndsAt((e) => e + s * 1000);
    else setPausedLeft((p) => (p ?? step.duration * 1000) + s * 1000);
  };

  const back = () => {
    const done = step.duration - left;
    if (done > 3) goTo(idx); else goTo(idx - 1);
  };

  const isWork = step.kind === 'work';
  const showEx = isWork ? step.ex : step.next?.ex;
  const showSide = isWork ? step.side : step.next?.side;
  const pct = step.duration ? 1 - left / step.duration : 0;
  const R = 120;
  const C = 2 * Math.PI * R;
  const w = weightOf(showEx);

  return (
    <div className={`player ${isWork ? 'is-work' : 'is-rest'}`}>
      <div className="player-top">
        <button className="icon-btn" onClick={() => setConfirmQuit(true)} aria-label="Quitter">✕</button>
        <div className="player-meta">
          <div className="muted small">{step.block}{step.rounds > 1 && step.round ? ` · tour ${step.round}/${step.rounds}` : ''}</div>
          <div className="bar"><div style={{ width: `${(elapsed / total) * 100}%` }} /></div>
          <div className="muted small">{fmt(elapsed)} / {fmt(total)}</div>
        </div>
        <span className="icon-btn ghost" />
      </div>

      <div className="phase-label">
        {isWork ? 'EFFORT' : step.kind === 'prep' ? 'PRÊT ?' : step.label?.toUpperCase()}
      </div>

      <div className="ring-wrap" onClick={togglePause}>
        <svg viewBox="0 0 280 280" className="ring">
          <circle cx="140" cy="140" r={R} className="ring-bg" />
          <circle
            cx="140" cy="140" r={R}
            className="ring-fg"
            strokeDasharray={C}
            strokeDashoffset={C * pct}
          />
        </svg>
        <div className="ring-center">
          <div className="time">{Math.ceil(left)}</div>
          {!running && <div className="paused">EN PAUSE</div>}
        </div>
      </div>

      {showEx && (
        <div className="now">
          {!isWork && <div className="muted small">Ensuite</div>}
          <button className="now-name" onClick={() => setSheet(showEx)}>
            {showEx.name} <span className="info">ⓘ</span>
          </button>
          <div className="now-tags">
            {showSide && <span className="tag big">{sideLabel(showSide)}</span>}
            {w && <span className="tag big">{w} kg</span>}
          </div>
          {(isWork ? step.hint : null) && <div className="hint">{step.hint}</div>}
          {(
            <div className="rest-preview">
              <VideoCard id={videos[showEx.id] || showEx.yt} name={showEx.name} compact />
              <ul className="cues compact">
                {showEx.cues.slice(0, isWork ? 2 : 3).map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="controls">
        <button className="ctrl" onClick={back} aria-label="Précédent">⏮</button>
        <button className="ctrl main" onClick={togglePause} aria-label={running ? 'Pause' : 'Reprendre'}>
          {running ? '❚❚' : '▶'}
        </button>
        <button className="ctrl" onClick={() => goTo(idx + 1)} aria-label="Suivant">⏭</button>
      </div>
      {!isWork && <button className="link center" onClick={() => addTime(15)}>+15 s de récup</button>}

      {sheet && (
        <ExerciseSheet
          ex={sheet}
          weight={weightOf(sheet)}
          customId={videos[sheet.id]}
          onSetVideo={(v) => onSetVideo(sheet.id, v)}
          onClose={() => setSheet(null)}
        />
      )}

      {confirmQuit && (
        <div className="sheet-backdrop" onClick={() => setConfirmQuit(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <h2>Arrêter la séance ?</h2>
            <p className="muted">Elle ne sera pas comptée comme faite.</p>
            <button className="btn full danger" onClick={onQuit}>Arrêter</button>
            <button className="btn full ghost" onClick={() => setConfirmQuit(false)}>Continuer</button>
          </div>
        </div>
      )}
    </div>
  );
}
