import { useState } from 'react'
import { AuthControls } from './components/AuthControls'
import { useWorkoutSync, type Sport } from './lib/workoutSync'
import { WorkoutWorkspace } from './components/WorkoutWorkspace'
import {
  Activity, ArrowUpRight, BookOpen, CalendarDays, ChevronDown, CircleHelp,
  Flower2, Heart, LayoutDashboard, Leaf, Menu, Music2, Plus, Sparkles, Timer, Wallet
} from 'lucide-react'

const dateLabel = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })
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
  const { sessions, setSessions, user, ready, ownerId, storageError, syncStatus, syncMessage, sendMagicLink, signOut, isSyncConfigured, retrySync, localCount, importLocal } = useWorkoutSync()
  const [activeNav, setActiveNav] = useState('Übersicht')
  const [initialSport, setInitialSport] = useState<Sport | null>(null)
  const [mobileMenu, setMobileMenu] = useState(false)
  const totalMinutes = sessions.reduce((sum, session) => sum + session.duration, 0)
  const formattedDate = dateLabel.format(new Date())
  const startNew = () => { setInitialSport('Gym'); setActiveNav('Fitness'); setMobileMenu(false) }
  const navTo = (label: string) => { setInitialSport(null); setActiveNav(label); setMobileMenu(false) }

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
      <header className="topbar"><button className="icon-button mobile-only" aria-label="Menü öffnen" onClick={() => setMobileMenu(!mobileMenu)}><Menu size={20}/></button><div className="breadcrumb">DEIN SPACE <span>/</span> {activeNav.toUpperCase()}</div><div className="top-actions"><AuthControls user={user} syncStatus={syncStatus} syncMessage={syncMessage} isSyncConfigured={isSyncConfigured} sendMagicLink={sendMagicLink} signOut={signOut} retrySync={retrySync} localCount={localCount} importLocal={importLocal}/><span className="today-pill"><span className="live-dot"/> {formattedDate}</span><div className="mini-avatar">F</div></div></header>
      <div className={`sync-strip ${syncStatus === 'error' ? 'sync-error' : ''}`} role="status"><span>{syncMessage}</span>{user && <button className="text-button" disabled={syncStatus === 'syncing'} onClick={() => void retrySync()}>{syncStatus === 'error' ? 'Erneut versuchen' : 'Jetzt abgleichen'}</button>}</div>
      {activeNav === 'Fitness' ? ready ? <WorkoutWorkspace key={ownerId ?? 'local'} sessions={sessions} setSessions={setSessions} ownerId={ownerId} ready={ready} storageError={storageError} initialSport={initialSport}/> : <section className="page-wrap"><p role="status">Deine Trainings werden geladen …</p></section> : activeNav === 'Übersicht' ? <section className="page-wrap">
        <div className="welcome-banner"><div className="banner-copy"><div className="eyebrow"><Sparkles size={14}/> YOUR LITTLE CORNER OF THE WORLD</div><h1>Schön, dass du da bist<span className="title-period">.</span></h1><p>Du musst nicht alles schaffen. Nur den nächsten kleinen Schritt.</p><button className="banner-button" onClick={() => startNew()}>Zeit für Bewegung <ArrowUpRight size={16}/></button></div><div className="banner-art"><div className="sun-disc"/><div className="arch arch-back"/><div className="arch arch-front"/><div className="plant-stem">✳<br/>╱╲<br/>╱│╲<br/>╱ │ ╲</div><span className="art-star star-one">✦</span><span className="art-star star-two">✧</span><span className="art-flower">✿</span></div><span className="banner-number">NO. 001 · YOUR SPACE</span></div>
        <div className="greeting-row"><div><div className="eyebrow">{formattedDate.toUpperCase()}</div><h2>Ein guter Tag, um anzufangen <span>♡</span></h2></div><span className="season-tag"><Leaf size={14}/> one day at a time</span></div>
        <div className="dashboard-grid"><div className="dashboard-card movement-card"><div className="card-top"><span className="card-icon rose"><Activity size={19}/></span><span className="card-kicker">IN BEWEGUNG</span><button className="tiny-icon-button" onClick={() => navTo('Fitness')} aria-label="Fitness öffnen"><ArrowUpRight size={17}/></button></div><h3>Dein Training</h3><p className="card-description">Jede Einheit bringt dich ein Stück weiter.</p><div className="movement-metrics"><div><strong>{sessions.length}</strong><span>Sessions</span></div><div><strong>{Math.floor(totalMinutes / 60)}<small>h</small> {totalMinutes % 60}<small>m</small></strong><span>Bewegungszeit</span></div></div><button className="card-link" onClick={() => startNew()}>Training eintragen <ArrowUpRight size={15}/></button><div className="card-decoration">✳</div></div>
        <div className="dashboard-card quote-card"><span className="quote-mark">“</span><div className="eyebrow">A LITTLE REMINDER</div><blockquote>Non quia difficilia sunt non audemus, sed quia non audemus difficilia sunt.</blockquote><div className="quote-rule"/><span className="quote-author">— Seneca · Briefe an Lucilius, 104,26</span><div className="quote-sparkle">✧</div></div>
        <div className="dashboard-card plan-card"><div className="card-top"><span className="card-icon sage"><CalendarDays size={19}/></span><span className="card-kicker">DEIN PLAN</span></div><h3>Heute im Blick</h3><div className="plan-row"><span className="plan-dot dot-rose"/><div><strong>Bewegung für dich</strong><small>Dein nächster kleiner Schritt</small></div><button onClick={() => startNew()} aria-label="Training planen"><Plus size={17}/></button></div><div className="plan-row"><span className="plan-dot dot-sage"/><div><strong>Uni & Fokus</strong><small>Deine Woche in Ruhe planen</small></div><button onClick={() => navTo('Studium')} aria-label="Studium öffnen"><ArrowUpRight size={16}/></button></div><button className="card-link" onClick={() => navTo('Kalender')}>Zum Kalender <ArrowUpRight size={15}/></button></div>
        <div className="dashboard-card quick-card"><div className="card-top"><span className="card-icon mauve"><Sparkles size={18}/></span><span className="card-kicker">DEIN SPACE</span></div><h3>Wohin soll's gehen?</h3><div className="quick-links"><button onClick={() => navTo('Studium')}><BookOpen size={17}/><span>Studium</span><ArrowUpRight size={14}/></button><button onClick={() => navTo('Finanzen')}><Wallet size={17}/><span>Finanzen</span><ArrowUpRight size={14}/></button><button onClick={() => navTo('Fokus')}><Music2 size={17}/><span>Fokus & Musik</span><ArrowUpRight size={14}/></button></div></div></div>
        <div className="bottom-note"><span>✿</span> Made for the life you're building <span>✿</span></div>
      </section> : <section className="page-wrap placeholder-page"><div className="eyebrow"><Flower2 size={14}/> IN ARBEIT</div><h1>{activeNav}<span className="title-period">.</span></h1><p className="subtitle">Dieser Bereich ist Teil deines LIFE-OS und wird Schritt für Schritt ergänzt.</p><div className="placeholder-card"><div className="placeholder-flower">✿</div><h2>Everything in its own time.</h2><p>Wir bauen diesen Bereich als Nächstes aus. Deine Fitness-Seite ist bereits nutzbar.</p><button className="primary-button" onClick={() => navTo('Fitness')}><Heart size={16}/> Zum Training</button></div></section>}
      <footer className="page-footer"><span>LIFE-OS <b>✳</b> MADE WITH INTENTION</span><span>Ein Leben, das sich nach dir anfühlt.</span></footer>
    </main>
  </div>
}
export default App
