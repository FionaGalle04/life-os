import { useEffect, useMemo, useState } from 'react'
import { AuthControls } from './components/AuthControls'
import { useWorkoutSync, type Exercise, type Session, type SetEntry, type Sport } from './lib/workoutSync'
import {
  Activity, ArrowUpRight, BookOpen, CalendarDays, Check, ChevronDown,
  CircleHelp, Clock3, Dumbbell, Flower2, Footprints, Heart, LayoutDashboard, Leaf,
  Menu, MoreHorizontal, Music2, Plus, RotateCcw, Save, Sparkles, Timer, Waves, X,
  Bike, Trash2, Wallet, type LucideIcon
} from 'lucide-react'

const sportOptions: { name: Sport; icon: LucideIcon; tint: string }[] = [
  { name: 'Gym', icon: Dumbbell, tint: 'rose' },
  { name: 'Radfahren', icon: Bike, tint: 'sage' },
  { name: 'Laufen', icon: Footprints, tint: 'mauve' },
  { name: 'Schwimmen', icon: Waves, tint: 'blue' },
]
const uid = () => Math.random().toString(36).slice(2, 10)
const newSet = (): SetEntry => ({ id: uid(), weight: '', reps: '', rir: '' })
const newExercise = (name = ''): Exercise => ({ id: uid(), name, sets: [newSet(), newSet(), newSet()] })
const today = () => new Date().toISOString().slice(0, 10)
const dateLabel = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })
const initialSessions: Session[] = [
  { id: 'demo-1', sport: 'Gym', title: 'Ganzkörper A', date: today(), duration: 55, distance: '', exercises: [
    { id: 'ex-1', name: 'Rumänisches Kreuzheben', sets: [{ id: 's1', weight: '40', reps: '10', rir: '2' }, { id: 's2', weight: '40', reps: '10', rir: '2' }, { id: 's3', weight: '42.5', reps: '8', rir: '1' }] },
    { id: 'ex-2', name: 'Hip Thrust', sets: [{ id: 's4', weight: '60', reps: '12', rir: '2' }, { id: 's5', weight: '60', reps: '12', rir: '2' }, { id: 's6', weight: '60', reps: '10', rir: '1' }] },
  ] },
  { id: 'demo-2', sport: 'Radfahren', title: 'Lockere Ausfahrt', date: today(), duration: 85, distance: '32.4', exercises: [] },
]
const navItems = [
  { label: 'Übersicht', icon: LayoutDashboard },
  { label: 'Kalender', icon: CalendarDays },
  { label: 'Fitness', icon: Activity },
  { label: 'Studium', icon: BookOpen },
  { label: 'Projekte', icon: Sparkles },
  { label: 'Finanzen', icon: Wallet },
  { label: 'Fokus', icon: Timer },
]
function App() {
  const { sessions, setSessions, user, syncStatus, syncMessage, resetSessions, sendMagicLink, signOut, isSyncConfigured } = useWorkoutSync(initialSessions)
  const [activeNav, setActiveNav] = useState('Übersicht')
  const [sport, setSport] = useState<Sport>('Gym')
  const [title, setTitle] = useState('Ganzkörper')
  const [duration, setDuration] = useState('60')
  const [distance, setDistance] = useState('')
  const [exercises, setExercises] = useState<Exercise[]>([newExercise('Rumänisches Kreuzheben'), newExercise('Hip Thrust')])
  const [editing, setEditing] = useState(false)
  const [notice, setNotice] = useState('')
  const [seconds, setSeconds] = useState(90)
  const [timerOn, setTimerOn] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)

  useEffect(() => {
    if (!timerOn) return
    const interval = window.setInterval(() => setSeconds(s => s > 0 ? s - 1 : 0), 1000)
    return () => window.clearInterval(interval)
  }, [timerOn])
  const gymSessions = useMemo(() => sessions.filter(s => s.sport === 'Gym'), [sessions])
  const totalMinutes = sessions.reduce((sum, s) => sum + (Number(s.duration) || 0), 0)
  const totalKm = sessions.reduce((sum, s) => sum + (Number(s.distance) || 0), 0)
  const formattedDate = dateLabel.format(new Date())
  const updateExercise = (exerciseId: string, patch: Partial<Exercise>) => setExercises(current => current.map(ex => ex.id === exerciseId ? { ...ex, ...patch } : ex))
  const updateSet = (exerciseId: string, setId: string, patch: Partial<SetEntry>) => setExercises(current => current.map(ex => ex.id === exerciseId ? { ...ex, sets: ex.sets.map(set => set.id === setId ? { ...set, ...patch } : set) } : ex))
  const saveSession = () => {
    if (!title.trim()) { setNotice('Gib deinem Training bitte einen Namen.'); return }
    const session: Session = { id: uid(), sport, title: title.trim(), date: today(), duration: Number(duration) || 0, distance, exercises: sport === 'Gym' ? exercises : [] }
    setSessions(current => [session, ...current])
    setEditing(false)
    setNotice(user ? 'Training synchronisiert ✦' : 'Training wurde lokal gespeichert ✦')
    window.setTimeout(() => setNotice(''), 3200)
    setTitle(sport === 'Gym' ? 'Ganzkörper' : sport)
    setDistance('')
    setExercises([newExercise(), newExercise()])
  }
  const startNew = (selected: Sport = 'Gym') => {
    setSport(selected); setTitle(selected === 'Gym' ? 'Ganzkörper' : selected); setDuration(selected === 'Gym' ? '60' : '45')
    setExercises(selected === 'Gym' ? [newExercise(''), newExercise('')] : [])
    setEditing(true); setActiveNav('Fitness')
  }
  const repeatSession = (session: Session) => {
    setSport(session.sport); setTitle(session.title + ' · Wiederholung'); setDuration(String(session.duration)); setDistance(session.distance)
    setExercises(session.exercises.map(ex => ({ ...ex, id: uid(), sets: ex.sets.map(s => ({ ...s, id: uid() })) })))
    setEditing(true); setActiveNav('Fitness')
  }
  const navTo = (label: string) => { setActiveNav(label); setMobileMenu(false); if (label === 'Fitness') setEditing(false) }
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0')
  const secs = (seconds % 60).toString().padStart(2, '0')

  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Flower2 size={22} strokeWidth={1.6} /></div><div><span className="brand-name">life<span>•</span>os</span><small>YOUR PERSONAL SPACE</small></div></div>
      <div className="profile-chip"><div className="avatar">F</div><div><strong>Dein Life OS</strong><span>Ein bisschen mehr Balance</span></div><ChevronDown size={15}/></div>
      <div className="nav-caption">DEIN ALLTAG</div>
      <nav>{navItems.map(item => <button key={item.label} className={`nav-item ${activeNav === item.label ? 'active' : ''}`} onClick={() => navTo(item.label)}><item.icon size={18} strokeWidth={1.8}/><span>{item.label}</span>{item.label === 'Fitness' && <span className="nav-dot"/>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="tiny-flower">✳</div><p>Small steps.<br/><em>Lovely progress.</em></p><span>Du musst nicht alles heute schaffen.</span><div className="sidebar-illustration">✿　❋　✿</div></div>
      <div className="sidebar-foot"><CircleHelp size={15}/> <span>Dein Raum, deine Regeln</span></div>
    </aside>
    {mobileMenu && <button className="scrim" aria-label="Menü schließen" onClick={() => setMobileMenu(false)}/>}
    <main className="main-content">
      <header className="topbar"><button className="icon-button mobile-only" aria-label="Menü öffnen" onClick={() => setMobileMenu(!mobileMenu)}><Menu size={20}/></button><div className="breadcrumb">DEIN SPACE <span>/</span> {activeNav.toUpperCase()}</div><div className="top-actions"><AuthControls user={user} syncStatus={syncStatus} syncMessage={syncMessage} isSyncConfigured={isSyncConfigured} sendMagicLink={sendMagicLink} signOut={signOut}/><span className="today-pill"><span className="live-dot"/> {formattedDate}</span><button className="icon-button" aria-label="Optionen"><MoreHorizontal size={21}/></button><div className="mini-avatar">F</div></div></header>
      {activeNav === 'Fitness' ? <section className="page-wrap">
        <div className="page-heading"><div><div className="eyebrow"><Flower2 size={14}/> MOVE WITH INTENTION</div><h1>Dein Training<span className="title-period">.</span></h1><p className="subtitle">Jede Bewegung zählt. Tracke deinen Weg, nicht nur die Zahlen.</p></div><button className="primary-button" onClick={() => startNew()}><Plus size={17}/> Training starten</button></div>
        <div className="sport-tabs">{sportOptions.map(({name, icon: Icon, tint}) => <button key={name} className={`sport-tab ${sport === name && editing ? 'selected' : ''}`} onClick={() => startNew(name)}><span className={`sport-icon ${tint}`}><Icon size={19}/></span><span>{name}</span></button>)}</div>
        {editing && <section className="workout-editor">
          <div className="editor-head"><div><div className="eyebrow">NEUE SESSION · {sport.toUpperCase()}</div><h2>Deine Zeit für dich</h2></div><button className="icon-button" aria-label="Training schließen" onClick={() => setEditing(false)}><X size={19}/></button></div>
          <div className="editor-meta"><label>Trainingstitel<input value={title} onChange={e => setTitle(e.target.value)} placeholder="z. B. Ganzkörper A"/></label><label>Dauer (Min.)<input type="number" min="0" inputMode="numeric" value={duration} onChange={e => setDuration(e.target.value)}/></label>{sport !== 'Gym' && <label>Distanz (km)<input type="number" min="0" step="0.1" inputMode="decimal" value={distance} onChange={e => setDistance(e.target.value)} placeholder="0.0"/></label>}</div>
          {sport === 'Gym' ? <div className="exercise-list"><div className="section-line"><h3>Übungen <span>{exercises.length}</span></h3><span className="muted-small">Gewicht in kg · RIR optional</span></div>
            {exercises.map((ex, index) => <div className="exercise-card" key={ex.id}><div className="exercise-title"><span className="exercise-index">{String(index + 1).padStart(2, '0')}</span><input aria-label={`Übung ${index + 1}`} className="exercise-name" value={ex.name} onChange={e => updateExercise(ex.id, { name: e.target.value })} placeholder="Übungsname eingeben"/><button className="tiny-icon-button" aria-label={`${ex.name || 'Übung'} entfernen`} onClick={() => setExercises(current => current.filter(item => item.id !== ex.id))}><Trash2 size={15}/></button></div>
              <div className="set-table"><div className="set-row set-header"><span>SATZ</span><span>GEWICHT (KG)</span><span>WIEDERHOLUNGEN</span><span>RIR</span><span/></div>
                {ex.sets.map((set, i) => <div className="set-row" key={set.id}><span className="set-number">{i + 1}</span><input aria-label={`Satz ${i + 1}, Gewicht`} type="number" min="0" step="0.5" inputMode="decimal" value={set.weight} onChange={e => updateSet(ex.id, set.id, { weight: e.target.value })} placeholder="—"/><input aria-label={`Satz ${i + 1}, Wiederholungen`} type="number" min="0" inputMode="numeric" value={set.reps} onChange={e => updateSet(ex.id, set.id, { reps: e.target.value })} placeholder="—"/><input aria-label={`Satz ${i + 1}, RIR`} type="number" min="0" max="10" inputMode="numeric" value={set.rir} onChange={e => updateSet(ex.id, set.id, { rir: e.target.value })} placeholder="—"/><button className="set-delete" aria-label="Satz entfernen" onClick={() => updateExercise(ex.id, { sets: ex.sets.filter(s => s.id !== set.id) })}><X size={14}/></button></div>)}
              </div><div className="exercise-actions"><button className="text-button" onClick={() => updateExercise(ex.id, { sets: [...ex.sets, newSet()] })}><Plus size={14}/> Satz hinzufügen</button><button className="text-button rest-link" onClick={() => { setSeconds(90); setTimerOn(true) }}><Timer size={14}/> 90 Sek. Pause</button></div>
            </div>)}
            <button className="add-exercise" onClick={() => setExercises(current => [...current, newExercise()])}><Plus size={17}/> Weitere Übung hinzufügen</button>
          </div> : <div className="endurance-note"><div className="sport-icon sage"><Activity size={21}/></div><div><strong>Ausdauer-Session</strong><p>Trage Dauer und Distanz ein. Höhenmeter und detaillierte Daten ergänzen wir im nächsten Schritt.</p></div></div>}
          <div className="editor-footer"><span><Save size={15}/> {user ? 'Wird mit deinen Geräten synchronisiert' : 'Wird auf diesem Gerät gespeichert'}</span><button className="primary-button" onClick={saveSession}><Check size={17}/> Training speichern</button></div>
        </section>}
        <div className="fitness-stats"><div className="stat-card"><span className="stat-icon rose"><Dumbbell size={18}/></span><span className="stat-label">TRAININGS GESAMT</span><strong>{sessions.length}</strong><small>Sessions gespeichert</small></div><div className="stat-card"><span className="stat-icon sage"><Clock3 size={18}/></span><span className="stat-label">BEWEGUNGSZEIT</span><strong>{Math.floor(totalMinutes / 60)}<small> h </small>{totalMinutes % 60}<small> min</small></strong><small>über alle Sportarten</small></div><div className="stat-card"><span className="stat-icon mauve"><Footprints size={18}/></span><span className="stat-label">DISTANZ GESAMT</span><strong>{totalKm.toLocaleString('de-DE', { maximumFractionDigits: 1 })}<small> km</small></strong><small>Radfahren & Laufen</small></div></div>
        <div className="history-panel"><div className="panel-heading"><div><div className="eyebrow">DEIN WEG BISHER</div><h2>Trainingsjournal</h2></div><button className="subtle-button" onClick={resetSessions}>Demo-Daten zurücksetzen <RotateCcw size={14}/></button></div>
          {sessions.length === 0 ? <div className="empty-state"><Flower2 size={30}/><h3>Hier beginnt deine Geschichte</h3><p>Dein erstes Training wartet auf dich.</p><button className="primary-button" onClick={() => startNew()}>Erstes Training eintragen</button></div> : <div className="history-list">{sessions.map(session => { const opt = sportOptions.find(o => o.name === session.sport)!; const Icon = opt.icon; return <article className="history-item" key={session.id}><span className={`history-icon ${opt.tint}`}><Icon size={20}/></span><div className="history-main"><strong>{session.title}</strong><span>{session.date === today() ? 'Heute' : session.date} · {session.duration} min{session.distance ? ` · ${session.distance} km` : ''}</span><small>{session.sport === 'Gym' ? `${session.exercises.length} Übungen · ${session.exercises.reduce((n, e) => n + e.sets.length, 0)} Sätze` : session.sport}</small></div><button className="tiny-icon-button" aria-label={`Training ${session.title} als Vorlage verwenden`} onClick={() => repeatSession(session)} title="Als Vorlage verwenden"><RotateCcw size={16}/></button><button className="tiny-icon-button" aria-label={`Training ${session.title} löschen`} onClick={() => setSessions(current => current.filter(s => s.id !== session.id))}><Trash2 size={16}/></button></article>})}</div>}
        </div>
        {notice && <div role="status" className="toast"><Check size={17}/>{notice}</div>}
        {timerOn && <div className="rest-timer"><div className="timer-bloom"><Timer size={19}/></div><div><small>PAUSENTIMER</small><strong>{minutes}:{secs}</strong></div><button className="timer-control" onClick={() => setTimerOn(!timerOn)}>{seconds === 0 ? 'Fertig' : 'Pause'}</button><button className="timer-control" onClick={() => { setSeconds(90); setTimerOn(false) }}>Reset</button><button className="tiny-icon-button" aria-label="Timer schließen" onClick={() => setTimerOn(false)}><X size={15}/></button></div>}
      </section> : activeNav === 'Übersicht' ? <section className="page-wrap">
        <div className="welcome-banner"><div className="banner-copy"><div className="eyebrow"><Sparkles size={14}/> YOUR LITTLE CORNER OF THE WORLD</div><h1>Schön, dass du da bist<span className="title-period">.</span></h1><p>Du musst nicht alles schaffen. Nur den nächsten kleinen Schritt.</p><button className="banner-button" onClick={() => startNew()}>Zeit für Bewegung <ArrowUpRight size={16}/></button></div><div className="banner-art"><div className="sun-disc"/><div className="arch arch-back"/><div className="arch arch-front"/><div className="plant-stem">✳<br/>╱╲<br/>╱│╲<br/>╱ │ ╲</div><span className="art-star star-one">✦</span><span className="art-star star-two">✧</span><span className="art-flower">✿</span></div><span className="banner-number">NO. 001 · YOUR SPACE</span></div>
        <div className="greeting-row"><div><div className="eyebrow">SONNTAG, 11. OKTOBER</div><h2>Ein guter Tag, um anzufangen <span>♡</span></h2></div><span className="season-tag"><Leaf size={14}/> one day at a time</span></div>
        <div className="dashboard-grid"><div className="dashboard-card movement-card"><div className="card-top"><span className="card-icon rose"><Activity size={19}/></span><span className="card-kicker">IN BEWEGUNG</span><button className="tiny-icon-button" onClick={() => navTo('Fitness')} aria-label="Fitness öffnen"><ArrowUpRight size={17}/></button></div><h3>Dein Training</h3><p className="card-description">Jede Einheit bringt dich ein Stück weiter.</p><div className="movement-metrics"><div><strong>{sessions.length}</strong><span>Sessions</span></div><div><strong>{Math.floor(totalMinutes / 60)}<small>h</small> {totalMinutes % 60}<small>m</small></strong><span>Bewegungszeit</span></div></div><button className="card-link" onClick={() => startNew()}>Training eintragen <ArrowUpRight size={15}/></button><div className="card-decoration">✳</div></div>
        <div className="dashboard-card quote-card"><span className="quote-mark">“</span><div className="eyebrow">A LITTLE REMINDER</div><blockquote>It always seems impossible until it's done.</blockquote><div className="quote-rule"/><span className="quote-author">— Nelson Mandela</span><div className="quote-sparkle">✧</div></div>
        <div className="dashboard-card plan-card"><div className="card-top"><span className="card-icon sage"><CalendarDays size={19}/></span><span className="card-kicker">DEIN PLAN</span></div><h3>Heute im Blick</h3><div className="plan-row"><span className="plan-dot dot-rose"/><div><strong>Bewegung für dich</strong><small>Dein nächster kleiner Schritt</small></div><button onClick={() => startNew()} aria-label="Training planen"><Plus size={17}/></button></div><div className="plan-row"><span className="plan-dot dot-sage"/><div><strong>Uni & Fokus</strong><small>Deine Woche in Ruhe planen</small></div><button onClick={() => navTo('Studium')} aria-label="Studium öffnen"><ArrowUpRight size={16}/></button></div><button className="card-link" onClick={() => navTo('Kalender')}>Zum Kalender <ArrowUpRight size={15}/></button></div>
        <div className="dashboard-card quick-card"><div className="card-top"><span className="card-icon mauve"><Sparkles size={18}/></span><span className="card-kicker">DEIN SPACE</span></div><h3>Wohin soll's gehen?</h3><div className="quick-links"><button onClick={() => navTo('Studium')}><BookOpen size={17}/><span>Studium</span><ArrowUpRight size={14}/></button><button onClick={() => navTo('Finanzen')}><Wallet size={17}/><span>Finanzen</span><ArrowUpRight size={14}/></button><button onClick={() => navTo('Fokus')}><Music2 size={17}/><span>Fokus & Musik</span><ArrowUpRight size={14}/></button></div></div></div>
        <div className="bottom-note"><span>✿</span> Made for the life you're building <span>✿</span></div>
      </section> : <section className="page-wrap placeholder-page"><div className="eyebrow"><Flower2 size={14}/> IN ARBEIT</div><h1>{activeNav}<span className="title-period">.</span></h1><p className="subtitle">Dieser Bereich ist Teil deines LIFE-OS und wird Schritt für Schritt ergänzt.</p><div className="placeholder-card"><div className="placeholder-flower">✿</div><h2>Everything in its own time.</h2><p>Wir bauen diesen Bereich als Nächstes aus. Deine Fitness-Seite ist bereits nutzbar.</p><button className="primary-button" onClick={() => navTo('Fitness')}><Heart size={16}/> Zum Training</button></div></section>}
      <footer className="page-footer"><span>LIFE-OS <b>✳</b> MADE WITH INTENTION</span><span>Ein Leben, das sich nach dir anfühlt.</span></footer>
    </main>
  </div>
}
export default App
