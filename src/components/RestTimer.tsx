import { useEffect, useState } from 'react'
import { Timer, X } from 'lucide-react'

export function RestTimer({ onClose }: { onClose: () => void }) {
  const [remaining, setRemaining] = useState(90)
  const [deadline, setDeadline] = useState<number | null>(() => Date.now() + 90000)
  useEffect(() => {
    if (deadline === null) return
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setRemaining(seconds)
      if (!seconds) setDeadline(null)
    }
    tick()
    const interval = window.setInterval(tick, 250)
    document.addEventListener('visibilitychange', tick)
    return () => { window.clearInterval(interval); document.removeEventListener('visibilitychange', tick) }
  }, [deadline])
  const pause = () => {
    if (deadline !== null) { setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000))); setDeadline(null) }
    else setDeadline(Date.now() + (remaining || 90) * 1000)
  }
  return <div className="rest-timer" aria-label="Pausentimer">
    <div className="timer-bloom"><Timer size={19}/></div>
    <div><small>PAUSENTIMER</small><strong>{String(Math.floor(remaining / 60)).padStart(2, '0')}:{String(remaining % 60).padStart(2, '0')}</strong>{remaining === 0 && <span role="status">Pause beendet</span>}</div>
    <button className="timer-control" onClick={pause}>{deadline !== null ? 'Pause' : remaining ? 'Fortsetzen' : 'Neu starten'}</button>
    <button className="timer-control" onClick={() => { setRemaining(90); setDeadline(Date.now() + 90000) }}>Reset</button>
    <button className="tiny-icon-button" aria-label="Timer schließen" onClick={onClose}><X size={15}/></button>
  </div>
}
