import { useEffect, useMemo, useState } from 'react';
import { ALL_SESSIONS, PHASES, phaseOf, PALIER_TESTS, NEXT_WEIGHT, TEST_WEEKS } from './data/program.js';
import { EXERCISES } from './data/exercises.js';
import { buildTimeline, totalSeconds, hasImpact, resolveEx } from './lib/timeline.js';
import { loadSync, loadNative, save, DEFAULT_STATE } from './lib/storage.js';
import { configureAudio, unlockAudio, speak } from './lib/audio.js';
import Player from './components/Player.jsx';
import ExerciseSheet from './components/ExerciseSheet.jsx';

const minutes = (s, noImpact) => Math.round(totalSeconds(buildTimeline(s, { noImpact })) / 60);

export default function App() {
  const [state, setState] = useState(loadSync);
  const [tab, setTab] = useState('programme');
  const [view, setView] = useState(null); // { type: 'preview'|'player'|'done'|'test', session, noImpact }
  const [sheet, setSheet] = useState(null);

  useEffect(() => { loadNative().then((s) => s && setState(s)); }, []);
  useEffect(() => { save(state); configureAudio(state.settings); }, [state]);

  const update = (fn) => setState((s) => fn(structuredClone(s)));
  const nextSession = ALL_SESSIONS.find((s) => !state.done[s.id]);
  const doneCount = Object.keys(state.done).length;
  const setVideo = (exId, id) => update((s) => { if (id) s.videos[exId] = id; else delete s.videos[exId]; return s; });
  const weightOf = (ex) => (ex?.load ? state.weights[ex.load] : null);

  // ---------- Vues plein écran ----------
  if (view?.type === 'player') {
    const session = view.session;
    return (
      <Player
        session={session}
        state={{ ...state, settings: { ...state.settings, noImpact: view.noImpact } }}
        onSetVideo={setVideo}
        onQuit={() => setView({ type: 'preview', session })}
        onFinish={() => {
          update((s) => { s.done[session.id] = new Date().toISOString(); return s; });
          setView({ type: session.test ? 'test' : 'done', session });
        }}
      />
    );
  }

  if (view?.type === 'done') {
    return (
      <div className="screen center-screen">
        <div className="big-emoji">🔥</div>
        <h1>Séance terminée</h1>
        <p className="muted">{view.session.title} · semaine {view.session.week}</p>
        <p>{doneCount} / {ALL_SESSIONS.length} séances faites. Bois de l’eau, mange des protéines, et à la prochaine.</p>
        <button className="btn full" onClick={() => { setView(null); setTab('programme'); }}>Retour au programme</button>
      </div>
    );
  }

  if (view?.type === 'test') {
    return <TestPalier week={view.session.week} state={state} update={update} onDone={() => setView(null)} />;
  }

  if (view?.type === 'preview') {
    const s = view.session;
    const impact = hasImpact(s);
    const noImpact = view.noImpact ?? state.settings.noImpact;
    const phase = phaseOf(s.week);
    return (
      <div className="screen">
        <button className="back" onClick={() => setView(null)}>‹ Programme</button>
        <div className="eyebrow" style={{ color: phase.color }}>Semaine {s.week} · {phase.name}</div>
        <h1>{s.title}</h1>
        <p className="muted">{s.focus}</p>
        <div className="tags">
          <span className="tag">⏱ {minutes(s, noImpact)} min</span>
          <span className="tag">🏋️ Bas {state.weights.bas} kg · Haut {state.weights.haut} kg</span>
          {s.test && <span className="tag accent">🎯 Test de palier à la fin</span>}
        </div>

        {impact && (
          <div className="card warn-card">
            <strong>Cette séance contient des sauts</strong> (corde ou burpees sautés).
            <p className="muted small">Ton tibia est-il OK aujourd’hui ? Au moindre doute, prends la version sans saut.</p>
            <div className="seg">
              <button className={!noImpact ? 'on' : ''} onClick={() => setView({ ...view, noImpact: false })}>Tibia OK</button>
              <button className={noImpact ? 'on' : ''} onClick={() => setView({ ...view, noImpact: true })}>Sans saut</button>
            </div>
          </div>
        )}

        {s.blocks.map((b) => (
          <div key={b.title} className="block">
            <div className="block-head">
              <span>{b.title}</span>
              {b.rounds > 1 && <span className="muted small">{b.rounds} tours</span>}
            </div>
            {b.items.map((i, k) => {
              const ex = resolveEx(i.ex, noImpact);
              return (
                <button key={k} className="ex-row" onClick={() => setSheet(ex)}>
                  <Thumb id={state.videos[ex.id] || ex.yt} />
                  <div className="ex-row-txt">
                    <div>{ex.name}</div>
                    <div className="muted small">
                      {i.work} s{ex.side ? ' par côté' : ''}{weightOf(ex) ? ` · ${weightOf(ex)} kg` : ''}{i.hint ? ` · ${i.hint}` : ''}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ))}

        <div className="sticky-cta">
          <button
            className="btn full big"
            onClick={() => {
              unlockAudio();
              if (state.settings.voice) speak(' ');
              setView({ type: 'player', session: s, noImpact });
            }}
          >▶ Démarrer</button>
        </div>
        {sheet && <ExerciseSheet ex={sheet} weight={weightOf(sheet)} customId={state.videos[sheet.id]} onSetVideo={(v) => setVideo(sheet.id, v)} onClose={() => setSheet(null)} />}
      </div>
    );
  }

  // ---------- Onglets ----------
  return (
    <div className="app">
      <div className="screen with-tabs">
        {tab === 'programme' && (
          <Programme state={state} nextSession={nextSession} doneCount={doneCount}
            open={(s) => setView({ type: 'preview', session: s })}
            openTest={(w) => setView({ type: 'test', session: { week: w } })} />
        )}
        {tab === 'exercices' && <Library state={state} onOpen={setSheet} />}
        {tab === 'reglages' && <Settings state={state} update={update} />}
      </div>
      <nav className="tabs">
        {[['programme', '📅', 'Programme'], ['exercices', '🏋️', 'Exercices'], ['reglages', '⚙️', 'Réglages']].map(([k, i, l]) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
            <span>{i}</span>{l}
          </button>
        ))}
      </nav>
      {sheet && <ExerciseSheet ex={sheet} weight={weightOf(sheet)} customId={state.videos[sheet.id]} onSetVideo={(v) => setVideo(sheet.id, v)} onClose={() => setSheet(null)} />}
    </div>
  );
}

function Thumb({ id }) {
  return (
    <div className="thumb">
      <span>🎬</span>
      {id && <img src={`https://i.ytimg.com/vi/${id}/mqdefault.jpg`} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
    </div>
  );
}

function Programme({ state, nextSession, doneCount, open, openTest }) {
  const pct = (doneCount / ALL_SESSIONS.length) * 100;
  const phase = nextSession ? phaseOf(nextSession.week) : PHASES[2];
  const pendingTest = TEST_WEEKS.find((w) => state.done[`${w}B`] && !state.tests[w]);

  return (
    <>
      <header className="hero">
        <div className="logo">LUMIO <b>KETTLE</b></div>
        <div className="bar thick"><div style={{ width: `${pct}%`, background: phase.color }} /></div>
        <div className="muted small">{doneCount} / {ALL_SESSIONS.length} séances · 2 par semaine</div>
      </header>

      {pendingTest && (
        <button className="card accent-card" onClick={() => openTest(pendingTest)}>
          🎯 <strong>Test de palier semaine {pendingTest}</strong>
          <div className="muted small">Valide-le pour savoir si tu passes à une kettlebell plus lourde.</div>
        </button>
      )}

      {nextSession ? (
        <button className="card next" onClick={() => open(nextSession)} style={{ '--c': phase.color }}>
          <div className="eyebrow" style={{ color: phase.color }}>Prochaine séance · semaine {nextSession.week}</div>
          <h2>{nextSession.title}</h2>
          <p className="muted">{nextSession.focus}</p>
          <div className="row">
            <span className="tag">⏱ {minutes(nextSession, state.settings.noImpact)} min</span>
            <span className="go">Voir ›</span>
          </div>
        </button>
      ) : (
        <div className="card next">
          <h2>Programme terminé 🏆</h2>
          <p className="muted">Recommence le cycle depuis les réglages avec tes nouvelles charges.</p>
        </div>
      )}

      {PHASES.map((p) => (
        <section key={p.id} className="phase">
          <div className="phase-head">
            <span className="dot" style={{ background: p.color }} />
            <div>
              <strong>{p.name}</strong> <span className="muted small">S{p.weeks[0]}–{p.weeks[1]}</span>
              <div className="muted small">{p.goal}</div>
            </div>
          </div>
          {ALL_SESSIONS.filter((s) => s.week >= p.weeks[0] && s.week <= p.weeks[1])
            .reduce((acc, s) => { (acc[s.week] ||= []).push(s); return acc; }, [])
            .filter(Boolean)
            .map((pair) => (
              <div className="week" key={pair[0].week}>
                <span className="week-n">S{pair[0].week}</span>
                {pair.map((s) => (
                  <button key={s.id} className={`chip ${state.done[s.id] ? 'done' : ''} ${nextSession?.id === s.id ? 'current' : ''}`} onClick={() => open(s)}>
                    {state.done[s.id] ? '✓ ' : ''}{s.day} · {s.day === 'A' ? 'Force' : 'Athlétique'}
                    {s.test && <span className="mini">🎯</span>}
                  </button>
                ))}
              </div>
            ))}
        </section>
      ))}
    </>
  );
}

function TestPalier({ week, state, update, onDone }) {
  const [checks, setChecks] = useState({ bas: [], haut: [] });
  const [result, setResult] = useState(null);
  const toggle = (g, i) => setChecks((c) => ({ ...c, [g]: c[g].includes(i) ? c[g].filter((x) => x !== i) : [...c[g], i] }));

  if (result) {
    return (
      <div className="screen center-screen">
        <div className="big-emoji">{result.ups.length ? '⬆️' : '💪'}</div>
        <h1>{result.ups.length ? 'Palier validé !' : 'On consolide'}</h1>
        {result.ups.map((u) => (
          <p key={u.g}><strong>{PALIER_TESTS[u.g].label}</strong> : passe de {u.from} kg à <strong>{u.to} kg</strong>.</p>
        ))}
        {result.ups.length > 0 && (
          <div className="card">
            <strong>Pas encore de {result.ups[0].to} kg ?</strong>
            <p className="muted small">Garde le {result.ups[0].from} kg en attendant : descente en 4 s, pause 1 s en bas, et vise le haut de chaque fourchette. Tu peux corriger la charge dans les Réglages.</p>
          </div>
        )}
        {result.ups.length === 0 && (
          <p className="muted">Tu gardes tes charges. Vise les critères manquants ; tu pourras repasser le test au prochain palier.</p>
        )}
        <button className="btn full" onClick={onDone}>Continuer</button>
      </div>
    );
  }

  return (
    <div className="screen">
      <button className="back" onClick={onDone}>‹ Plus tard</button>
      <div className="eyebrow">Fin de semaine {week}</div>
      <h1>Test de palier</h1>
      <p className="muted">Fais chaque test avec ta charge actuelle, avec 2 min de repos entre chaque. Coche seulement si c’était propre. Tous les critères cochés = +4 kg.</p>
      {Object.entries(PALIER_TESTS).map(([g, t]) => (
        <div className="block" key={g}>
          <div className="block-head"><span>{t.label} · {state.weights[g]} kg</span></div>
          <p className="muted small">Concerne : {t.uses}</p>
          {t.criteria.map((c, i) => (
            <label key={c} className="check">
              <input type="checkbox" checked={checks[g].includes(i)} onChange={() => toggle(g, i)} />
              <span>{c}</span>
            </label>
          ))}
        </div>
      ))}
      <div className="sticky-cta">
        <button
          className="btn full big"
          onClick={() => {
            const ups = [];
            const res = { date: new Date().toISOString() };
            for (const g of ['bas', 'haut']) {
              const pass = checks[g].length === PALIER_TESTS[g].criteria.length;
              res[g] = pass;
              if (pass) ups.push({ g, from: state.weights[g], to: NEXT_WEIGHT[state.weights[g]] || state.weights[g] + 4 });
            }
            update((s) => {
              s.tests[week] = res;
              ups.forEach((u) => { s.weights[u.g] = u.to; });
              return s;
            });
            setResult({ ups });
          }}
        >Valider le test</button>
      </div>
    </div>
  );
}

function Library({ state, onOpen }) {
  const groups = useMemo(() => ([
    ['Échauffement & tibias', ['chevilles', 'halo', 'hinge', 'tibias', 'mollets']],
    ['Bas du corps', ['goblet', 'deadlift', 'pont', 'fente', 'rdl1', 'swing', 'swing1']],
    ['Haut du corps', ['floor', 'rowing', 'press', 'clean', 'highpull', 'pompesInc', 'pompes', 'pompesKB']],
    ['Abdos & gainage', ['deadbug', 'suitcase', 'pullthrough', 'twist', 'getup']],
    ['Cardio', ['burpeeStep', 'burpee', 'cordeFake', 'corde']],
    ['Étirements', ['etMollets', 'etHanches', 'etDos']],
  ]), []);
  return (
    <>
      <h1>Exercices</h1>
      {groups.map(([g, ids]) => (
        <div className="block" key={g}>
          <div className="block-head"><span>{g}</span></div>
          {ids.map((id) => {
            const ex = { id, ...EXERCISES[id] };
            return (
              <button key={id} className="ex-row" onClick={() => onOpen(ex)}>
                <Thumb id={state.videos[id] || ex.yt} />
                <div className="ex-row-txt">
                  <div>{ex.name}{ex.impact ? ' ⚠️' : ''}</div>
                  <div className="muted small">{ex.muscles}</div>
                </div>
              </button>
            );
          })}
        </div>
      ))}
    </>
  );
}

function Settings({ state, update }) {
  const [confirm, setConfirm] = useState(false);
  const set = (k, v) => update((s) => { s.settings[k] = v; return s; });
  const W = [8, 12, 16, 20, 24, 28, 32];
  return (
    <>
      <h1>Réglages</h1>
      <div className="block">
        <div className="block-head"><span>Charges</span></div>
        {[['bas', 'Bas du corps (squat, swing…)'], ['haut', 'Haut du corps (développé, rowing…)']].map(([g, l]) => (
          <div key={g} className="setting col">
            <span>{l}</span>
            <div className="seg wrap">
              {W.map((w) => (
                <button key={w} className={state.weights[g] === w ? 'on' : ''} onClick={() => update((s) => { s.weights[g] = w; return s; })}>{w}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="block">
        <div className="block-head"><span>Guidage</span></div>
        <Toggle label="Voix qui annonce les exercices" on={state.settings.voice} set={(v) => set('voice', v)} />
        <Toggle label="Bips (3-2-1 et changements)" on={state.settings.beeps} set={(v) => set('beeps', v)} />
        <Toggle label="Sonner même en mode silencieux" sub="Coupe ta musique pendant les annonces" on={state.settings.overrideSilent} set={(v) => set('overrideSilent', v)} />
        <button className="btn small ghost" onClick={() => { unlockAudio(); speak('Test de la voix. Goblet squat, quarante secondes.'); }}>Tester la voix</button>
      </div>
      <div className="block">
        <div className="block-head"><span>Périostite</span></div>
        <Toggle label="Mode tibia sensible" sub="Remplace la corde et les burpees sautés par des versions sans saut" on={state.settings.noImpact} set={(v) => set('noImpact', v)} />
        <p className="muted small">Règle simple : une gêne qui reste à 2/10 ou moins et disparaît le lendemain, c’est OK. Si elle monte ou persiste, repasse sans saut et parle-en à ton kiné ou ton médecin.</p>
      </div>
      <div className="block">
        <div className="block-head"><span>Données</span></div>
        {confirm ? (
          <div className="row gap">
            <button className="btn small danger" onClick={() => { update(() => structuredClone({ ...DEFAULT_STATE, weights: state.weights, settings: state.settings, videos: state.videos })); setConfirm(false); }}>Oui, recommencer</button>
            <button className="btn small ghost" onClick={() => setConfirm(false)}>Annuler</button>
          </div>
        ) : (
          <button className="btn small ghost" onClick={() => setConfirm(true)}>Recommencer le programme (garde les charges)</button>
        )}
      </div>
      <p className="muted small center">Lumio Kettle 1.0 · 12 semaines · 24 séances</p>
    </>
  );
}

function Toggle({ label, sub, on, set }) {
  return (
    <button className="setting" onClick={() => set(!on)}>
      <div>
        <div>{label}</div>
        {sub && <div className="muted small">{sub}</div>}
      </div>
      <span className={`switch ${on ? 'on' : ''}`}><i /></span>
    </button>
  );
}
