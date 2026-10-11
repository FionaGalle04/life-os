import { useState, type FormEvent } from 'react'
import type { User } from '@supabase/supabase-js'

type Props = {
  user: User | null
  syncStatus: 'loading' | 'local' | 'syncing' | 'synced' | 'error'
  syncMessage: string
  isSyncConfigured: boolean
  sendMagicLink: (email: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  retrySync: () => Promise<void>
  localCount: number
  importLocal: () => void
}

export function AuthControls({ user, syncStatus, syncMessage, isSyncConfigured, sendMagicLink, signOut, retrySync, localCount, importLocal }: Props) {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const { error } = await sendMagicLink(email.trim())
      setMessage(error ? error.message : 'Anmeldelink ist unterwegs. Schau in dein Postfach.')
    } catch { setMessage('Der Anmeldelink konnte nicht gesendet werden. Bitte erneut versuchen.') }
    finally { setBusy(false) }
  }

  const logout = async () => {
    setBusy(true)
    try { await signOut(); setMessage('') }
    catch { setMessage('Abmelden fehlgeschlagen. Bitte erneut versuchen.') }
    finally { setBusy(false) }
  }

  return <details className="auth-controls">
    <summary className="auth-summary">{user ? user.email : 'Geräte-Sync'}</summary>
    <div className="auth-popover">
      <strong>{user ? 'Dein LIFE-OS Konto' : 'Auf mehreren Geräten nutzen'}</strong>
      <p>{syncMessage}</p>
      {!isSyncConfigured ? <small>Cloud-Sync ist hier noch nicht eingerichtet. Du kannst Trainings auf diesem Gerät speichern und als Datei sichern.</small> :
        user ? <div className="account-actions"><button className="subtle-button" disabled={busy} onClick={() => void logout()}>Abmelden</button><button className="subtle-button" disabled={syncStatus === 'syncing'} onClick={() => void retrySync()}>Jetzt synchronisieren</button>{localCount > 0 && <button className="subtle-button" onClick={importLocal}>{localCount} lokale Trainings in dieses Konto übernehmen</button>}</div> :
          <form onSubmit={submit}>
            <label htmlFor="sync-email">E-Mail-Adresse</label>
            <input id="sync-email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} />
            <button className="primary-button" disabled={busy || syncStatus === 'loading'}>{busy ? 'Sende …' : 'Anmeldelink senden'}</button>
          </form>}
      {message && <small role="status">{message}</small>}
    </div>
  </details>
}
