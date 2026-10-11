import { useEffect, useRef, useState } from 'react'
import { Activity, Bike, Check, Clock3, Download, Dumbbell, Flower2, Footprints, Pencil, Plus, RotateCcw, Save, Timer, Trash2, Upload, Waves, X, type LucideIcon } from 'lucide-react'
import { newDraft, newExercise, newSet, parseSessions, readDraft, sessionFromDraft, today, uid, type Exercise, type Session, type SetEntry, type Sport, type WorkoutDraft } from '../lib/workouts'
import { RestTimer } from './RestTimer'

const options: { name: Sport; icon: LucideIcon; tint: string }[] = [
  { name: 'Gym', icon: Dumbbell, tint: 'rose' }, { name: 'Radfahren', icon: Bike, tint: 'sage' },
  { name: 'Laufen', icon: Footprints, tint: 'mauve' }, { name: 'Schwimmen', icon: Waves, tint: 'blue' },
]
type Props = { sessions: Session[]; setSessions: (action: Session[] | ((current: Session[]) => Session[])) => boolean; ownerId: string | null; ready: boolean; storageError: string; initialSport: Sport | null }

export function WorkoutWorkspace({ sessions, setSessions, ownerId, ready, storageError, initialSport }: Props) {
  const draftKey = `life-os-draft-v1:${ownerId ?? 'local'}`
  const [initial] = useState(() => {
    try { return { draft: readDraft(draftKey), blocked: false, error: '' } }
    catch { return { draft: null, blocked: true, error: 'Dein Entwurf ist nicht lesbar. Er bleibt gespeichert, bis du ihn ausdrücklich verwirfst.' } }
  })
  const [draft, setDraft] = useState<WorkoutDraft | null>(() => initial.draft ?? (initialSport && !initial.blocked ? newDraft(initialSport) : null))
  const [blocked, setBlocked] = useState(initial.blocked)
  const [draftError, setDraftError] = useState(initial.error)
  const [editorOpen, setEditorOpen] = useState(Boolean(initialSport && !initial.blocked))
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<Sport | 'Alle'>('Alle')
  const [timerKey, setTimerKey] = useState(0)
  const fileInput = useRef<HTMLInputElement>(null)
  const mounted = useRef(true)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  useEffect(() => {
    if (blocked) return
    try {
      if (draft) localStorage.setItem(draftKey, JSON.stringify(draft))
      else localStorage.removeItem(draftKey)
      setDraftError('')
    } catch { setDraftError('Der Entwurf konnte nicht gesichert werden. Bitte lasse diese Seite geöffnet und exportiere deine Trainings.') }
  }, [draft, draftKey, blocked])
  const replaceDraft = (next: WorkoutDraft) => {
    if (blocked) return
    if (draft && !window.confirm('Den angefangenen Trainingsentwurf verwerfen und dieses Training öffnen?')) return
    setDraft(next); setEditorOpen(true); setError(''); setMessage('')
  }
  const discard = () => {
    if (!window.confirm('Diesen Trainingsentwurf wirklich verwerfen?')) return
    try { localStorage.removeItem(draftKey); setBlocked(false); setDraft(null); setEditorOpen(false); setDraftError('') }
    catch { setDraftError('Der Entwurf konnte nicht gelöscht werden.') }
  }
  const save = () => {
    if (!draft) return
    try {
      const session = sessionFromDraft(draft)
      if (!setSessions(current => [session, ...current.filter(row => row.id !== session.id)])) throw new Error('Speichern auf diesem Gerät fehlgeschlagen. Dein Entwurf bleibt geöffnet.')
      setDraft(null); setEditorOpen(false); setError(''); setMessage('Training auf diesem Gerät gespeichert.')
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Training konnte nicht gespeichert werden.') }
  }
  const edit = (session: Session, repeat = false) => replaceDraft({ ...session, id: repeat ? uid() : session.id, date: repeat ? today() : session.date, duration: String(session.duration), title: repeat ? `${session.title} · Wiederholung` : session.title,
    exercises: session.exercises.map(ex => ({ ...ex, id: repeat ? uid() : ex.id, sets: ex.sets.map(set => ({ ...set, id: repeat ? uid() : set.id })) })) })
  const exportData = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), sessions }, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a'); link.href = url; link.download = `life-os-trainings-${today()}.json`; link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setMessage('Deine Trainings wurden als JSON exportiert. Bewahre die Datei als Sicherung auf.')
  }
  const importData = async (file: File) => {
    try {
      if (file.size > 2 * 1024 * 1024) throw new Error('Die Sicherungsdatei darf höchstens 2 MB groß sein.')
      const parsed: unknown = JSON.parse(await file.text())
      if (!mounted.current) return
      const incoming = parseSessions(parsed && typeof parsed === 'object' && 'sessions' in parsed ? parsed.sessions : parsed)
      const additions = incoming.filter(row => !sessions.some(existing => existing.id === row.id))
      if (!setSessions(current => [...current, ...additions.filter(row => !current.some(existing => existing.id === row.id))])) throw new Error('Import konnte nicht gespeichert werden.')
      setError(''); setMessage(`${additions.length} Trainings importiert. Bereits vorhandene Trainings wurden beibehalten.`)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Die Datei konnte nicht gelesen werden.') }
    finally { if (fileInput.current) fileInput.current.value = '' }
  }
  const visibleSessions = sessions.filter(row => filter === 'Alle' || row.sport === filter)
  const totalMinutes = visibleSessions.reduce((sum, row) => sum + row.duration, 0)
  const totalKm = visibleSessions.reduce((sum, row) => sum + Number(row.distance || 0), 0)
  const locked = !ready || Boolean(storageError) || blocked
  return <section className="page-wrap">
    <div className="page-heading"><div><div className="eyebrow"><Flower2 size={14}/> MOVE WITH INTENTION</div><h1>Dein Training<span className="title-period">.</span></h1><p className="subtitle">Jede Bewegung zählt. Dein Journal für alle vier Sportarten.</p></div><button className="primary-button" disabled={locked} onClick={() => replaceDraft(newDraft('Gym'))}><Plus size={17}/> Training starten</button></div>
    {storageError && <p role="alert" className="inline-error">{storageError}</p>}
    {draftError && <p role="alert" className="inline-error">{draftError}</p>}
    {(draft && !editorOpen || blocked) && <div className="draft-banner"><div><strong>Angefangenes Training</strong><p>{draft?.title ?? 'Gespeicherter Entwurf'}</p></div>{!blocked && <button className="primary-button" onClick={() => setEditorOpen(true)}>Entwurf fortsetzen</button>}<button className="subtle-button" onClick={discard}>Entwurf verwerfen</button></div>}
    <div className="sport-tabs">{options.map(({ name, icon: Icon, tint }) => <button key={name} disabled={locked} className={`sport-tab ${editorOpen && draft?.sport === name ? 'selected' : ''}`} onClick={() => replaceDraft(newDraft(name))}><span className={`sport-icon ${tint}`}><Icon size={19}/></span>{name}</button>)}</div>
    {editorOpen && draft && <WorkoutEditor draft={draft} onChange={setDraft} onSave={save} onClose={() => setEditorOpen(false)} onRest={() => setTimerKey(key => key + 1)} disabled={locked} error={error}/>}
    {error && !editorOpen && <p role="alert" className="inline-error">{error}</p>}
    {message && <p role="status" className="inline-success">{message}</p>}
    <div className="history-toolbar"><label>Sportart filtern<select aria-label="Sportart filtern" value={filter} onChange={event => setFilter(event.target.value as Sport | 'Alle')}><option>Alle</option>{options.map(option => <option key={option.name}>{option.name}</option>)}</select></label><div className="backup-actions"><button className="subtle-button" onClick={exportData} disabled={!ready || Boolean(storageError)}><Download size={16}/> Daten exportieren</button><button className="subtle-button" disabled={locked} onClick={() => fileInput.current?.click()}><Upload size={16}/> Sicherung importieren</button><input ref={fileInput} aria-label="Trainingssicherung" type="file" accept=".json,application/json" hidden onChange={event => { const file = event.target.files?.[0]; if (file) void importData(file) }}/></div></div>
    <div className="fitness-stats"><div className="stat-card"><span className="stat-icon rose"><Dumbbell size={18}/></span><span className="stat-label">TRAININGS</span><strong>{visibleSessions.length}</strong><small>{filter === 'Alle' ? 'Alle Sportarten' : filter}</small></div><div className="stat-card"><span className="stat-icon sage"><Clock3 size={18}/></span><span className="stat-label">BEWEGUNGSZEIT</span><strong>{Math.floor(totalMinutes / 60)}<small> h </small>{totalMinutes % 60}<small> min</small></strong><small>Gespeicherte Trainings</small></div><div className="stat-card"><span className="stat-icon mauve"><Footprints size={18}/></span><span className="stat-label">DISTANZ</span><strong>{totalKm.toLocaleString('de-DE', { maximumFractionDigits: 2 })}<small> km</small></strong><small>Radfahren, Laufen & Schwimmen</small></div></div>
    <div className="history-panel"><div className="panel-heading"><div><div className="eyebrow">DEIN WEG BISHER</div><h2>Trainingsjournal</h2></div></div>
      {!visibleSessions.length ? <div className="empty-state"><Flower2 size={30}/><h3>{sessions.length ? 'Noch keine Trainings für diese Sportart' : 'Hier beginnt deine Geschichte'}</h3><p>Trage deine erste Einheit ein.</p></div> : <div className="history-list">{visibleSessions.map(session => { const option = options.find(row => row.name === session.sport)!; const Icon = option.icon; return <article className="history-item" key={session.id}><span className={`history-icon ${option.tint}`}><Icon size={20}/></span><div className="history-main"><strong>{session.title}</strong><span>{session.date === today() ? 'Heute' : new Intl.DateTimeFormat('de-DE').format(new Date(`${session.date}T12:00:00`))} · {session.duration} min{session.distance ? ` · ${session.distance} km` : ''}</span><small>{session.sport === 'Gym' ? `${session.exercises.length} Übungen · ${session.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)} Sätze` : session.sport}</small>{session.notes && <p>{session.notes}</p>}</div><div className="history-actions"><button className="tiny-icon-button" disabled={locked} aria-label={`Training ${session.title} bearbeiten`} onClick={() => edit(session)}><Pencil size={17}/></button><button className="tiny-icon-button" disabled={locked} aria-label={`Training ${session.title} als Vorlage verwenden`} onClick={() => edit(session, true)}><RotateCcw size={17}/></button><button className="tiny-icon-button" disabled={locked} aria-label={`Training ${session.title} löschen`} onClick={() => { if (window.confirm(`Training „${session.title}“ wirklich löschen?`) && setSessions(current => current.filter(row => row.id !== session.id))) setMessage('Training gelöscht.') }}><Trash2 size={17}/></button></div></article> })}</div>}
    </div>
    {timerKey > 0 && <RestTimer key={timerKey} onClose={() => setTimerKey(0)}/>}
  </section>
}

function WorkoutEditor({ draft, onChange, onSave, onClose, onRest, disabled, error }: { draft: WorkoutDraft; onChange: (draft: WorkoutDraft) => void; onSave: () => void; onClose: () => void; onRest: () => void; disabled: boolean; error: string }) {
  const patch = (update: Partial<WorkoutDraft>) => onChange({ ...draft, ...update })
  const updateExercise = (id: string, update: Partial<Exercise>) => patch({ exercises: draft.exercises.map(ex => ex.id === id ? { ...ex, ...update } : ex) })
  const updateSet = (exerciseId: string, setId: string, update: Partial<SetEntry>) => patch({ exercises: draft.exercises.map(ex => ex.id === exerciseId ? { ...ex, sets: ex.sets.map(set => set.id === setId ? { ...set, ...update } : set) } : ex) })
  return <section className="workout-editor">
    <div className="editor-head"><div><div className="eyebrow">{draft.sport.toUpperCase()} · ENTWURF</div><h2>Deine Zeit für dich</h2></div><button className="icon-button" aria-label="Training schließen und Entwurf behalten" onClick={onClose}><X size={19}/></button></div>
    <fieldset disabled={disabled}><div className="editor-meta"><label>Trainingstitel<input value={draft.title} maxLength={200} onChange={event => patch({ title: event.target.value })}/></label><label>Datum<input type="date" value={draft.date} onChange={event => patch({ date: event.target.value })}/></label><label>Dauer (Min.)<input type="number" min="1" max="1440" inputMode="numeric" value={draft.duration} onChange={event => patch({ duration: event.target.value })}/></label>
      {draft.sport !== 'Gym' && <><label>Distanz (km)<input type="number" min="0.001" step="any" inputMode="decimal" value={draft.distance} onChange={event => patch({ distance: event.target.value })}/></label><label>Höhenmeter (optional)<input type="number" min="0" inputMode="numeric" value={draft.elevation ?? ''} onChange={event => patch({ elevation: event.target.value })}/></label><label>Belastung 1–10 (optional)<input type="number" min="1" max="10" inputMode="numeric" value={draft.effort ?? ''} onChange={event => patch({ effort: event.target.value })}/></label></>}
    </div>
    {draft.sport === 'Gym' ? <div className="exercise-list"><div className="section-line"><h3>Übungen <span>{draft.exercises.length}</span></h3><span className="muted-small">0 kg = Körpergewicht · RIR optional</span></div>
      {draft.exercises.map((ex, index) => <div className="exercise-card" key={ex.id}><div className="exercise-title"><span className="exercise-index">{index + 1}</span><input aria-label={`Übung ${index + 1}`} className="exercise-name" value={ex.name} onChange={event => updateExercise(ex.id, { name: event.target.value })} placeholder="Übungsname"/><button className="tiny-icon-button" aria-label={`Übung ${index + 1} entfernen`} onClick={() => patch({ exercises: draft.exercises.filter(row => row.id !== ex.id) })}><Trash2 size={16}/></button></div>
        <div className="set-table"><div className="set-row set-header"><span>SATZ</span><span>KG</span><span>WIEDERHOLUNGEN</span><span>RIR</span><span/></div>{ex.sets.map((set, i) => <div key={set.id}><div className="set-row"><span className="set-number">{i + 1}</span><input aria-label={`Übung ${index + 1}, Satz ${i + 1}, Gewicht`} type="number" min="0" step="any" inputMode="decimal" value={set.weight} onChange={event => updateSet(ex.id, set.id, { weight: event.target.value })} placeholder="0"/><input aria-label={`Übung ${index + 1}, Satz ${i + 1}, Wiederholungen`} type="number" min="1" inputMode="numeric" value={set.reps} onChange={event => updateSet(ex.id, set.id, { reps: event.target.value })} placeholder="—"/><input aria-label={`Übung ${index + 1}, Satz ${i + 1}, RIR`} type="number" min="0" max="10" inputMode="numeric" value={set.rir} onChange={event => updateSet(ex.id, set.id, { rir: event.target.value })} placeholder="—"/><button className="set-delete" aria-label={`Übung ${index + 1}, Satz ${i + 1} entfernen`} onClick={() => updateExercise(ex.id, { sets: ex.sets.filter(row => row.id !== set.id) })}><X size={16}/></button></div><details className="set-notes"><summary>Notiz zu Satz {i + 1}</summary><input aria-label={`Übung ${index + 1}, Satz ${i + 1}, Notiz`} value={set.notes ?? ''} maxLength={1000} onChange={event => updateSet(ex.id, set.id, { notes: event.target.value })}/></details></div>)}</div>
        <div className="exercise-actions"><button className="text-button" onClick={() => updateExercise(ex.id, { sets: [...ex.sets, newSet()] })}><Plus size={14}/> Satz hinzufügen</button><button className="text-button rest-link" onClick={onRest}><Timer size={14}/> 90 Sek. Pause</button></div>
      </div>)}<button className="add-exercise" onClick={() => patch({ exercises: [...draft.exercises, newExercise()] })}><Plus size={17}/> Weitere Übung hinzufügen</button></div> : <div className="endurance-note"><Activity size={20}/><p>Distanz in Kilometern: 500 m Schwimmen entsprechen 0,5 km.</p></div>}
    <label className="session-notes">Trainingsnotizen (optional)<textarea rows={3} maxLength={4000} value={draft.notes ?? ''} onChange={event => patch({ notes: event.target.value })}/></label>
    {error && <p role="alert" className="inline-error">{error}</p>}
    <div className="editor-footer"><span><Save size={15}/> Entwurf wird auf diesem Gerät gesichert</span><button className="primary-button" onClick={onSave}><Check size={17}/> Training speichern</button></div></fieldset>
  </section>
}
