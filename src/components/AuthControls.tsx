import { useState, type FormEvent } from 'react'
import type { User } from '@supabase/supabase-js'

type Props = {
  user: User | null
  syncStatus: 'loading' | 'local' | 'syncing' | 'synced' | 'error'
  syncMessage: string
  isSyncConfigured: boolean
  sendMagicLink: (email: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

export function AuthControls({ user, syncStatus, syncMessage, isSyncConfigured, sendMagicLink, signOut }: Props) {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    const { error } = await sendMagicLink(email.trim())
    setMessage(error ? error.message : 'Anmeldelink ist unterwegs. Schau in dein Postfach.')
    setBusy(false)
  }

  return <details className="auth-controls">
    <summary className="auth-summary">{user ? user.email : 'Geräte-Sync'}</summary>
    <div className="auth-popover">
      <strong>{user ? 'Dein LIFE-OS Konto' : 'Auf mehreren Geräten nutzen'}</strong>
      <p>{syncMessage}</p>
      {!isSyncConfigured ? <small>Die Synchronisierung wird nach der Einrichtung der GitHub-Pages-Variablen verfügbar.</small> :
        user ? <button className="subtle-button" onClick={() => void signOut()}>Abmelden</button> :
          <form onSubmit={submit}>
            <label htmlFor="sync-email">E-Mail-Adresse</label>
            <input id="sync-email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} />
            <button className="primary-button" disabled={busy || syncStatus === 'loading'}>{busy ? 'Sende …' : 'Anmeldelink senden'}</button>
            {message && <small role="status">{message}</small>}
          </form>}
    </div>
  </details>
}
