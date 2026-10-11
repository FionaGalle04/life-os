import { useEffect, useState, useSyncExternalStore } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { parseSessions } from './workouts'
import { WorkoutStore, type WorkoutRemote } from './workoutStore'

export type { Sport, SetEntry, Exercise, Session } from './workouts'
const client = supabase
const remote: WorkoutRemote | null = client ? {
  async load(ownerId) {
    const { data, error } = await client.from('workout_sessions').select('session').eq('user_id', ownerId)
    if (error) throw error
    return parseSessions((data ?? []).map(row => row.session))
  },
  async save(ownerId, sessions) {
    const { error } = await client.from('workout_sessions').upsert(sessions.map(session => ({ id: session.id, user_id: ownerId, session, updated_at: new Date().toISOString() })), { onConflict: 'id' })
    if (error) throw error
  },
  async remove(ownerId, ids) {
    const { error } = await client.from('workout_sessions').delete().eq('user_id', ownerId).in('id', ids)
    if (error) throw error
  },
} : null

export function useWorkoutSync() {
  const [store] = useState(() => {
    try { return new WorkoutStore(window.localStorage, remote) }
    catch {
      const unavailable = { getItem: () => { throw new Error('storage unavailable') } } as unknown as Storage
      return new WorkoutStore(unavailable, remote)
    }
  })
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const [user, setUser] = useState<User | null>(null)
  const [authError, setAuthError] = useState('')
  useEffect(() => {
    let active = true
    let authObserved = false
    const selectUser = (next: User | null) => {
      if (!active) return
      setUser(next)
      store.switchOwner(next?.id ?? null)
    }
    if (!client) { selectUser(null); return () => { active = false } }
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      authObserved = true
      // Do not await Supabase calls inside its auth callback.
      queueMicrotask(() => selectUser(session?.user ?? null))
    })
    void client.auth.getSession().then(({ data, error }) => {
      if (!active || authObserved) return
      if (error) setAuthError('Anmeldung konnte nicht geprüft werden. Du kannst lokal weiterarbeiten.')
      selectUser(data.session?.user ?? null)
    }).catch(() => {
      if (!active || authObserved) return
      setAuthError('Anmeldung konnte nicht geprüft werden. Du kannst lokal weiterarbeiten.')
      selectUser(null)
    })
    return () => { active = false; subscription.unsubscribe() }
  }, [store])
  useEffect(() => {
    const refresh = () => { if (document.visibilityState === 'visible') void store.sync() }
    window.addEventListener('online', refresh)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => { window.removeEventListener('online', refresh); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh) }
  }, [store])
  return {
    sessions: snapshot.sessions, setSessions: store.setSessions, user, ready: snapshot.ready,
    ownerId: snapshot.ownerId, syncStatus: snapshot.status, syncMessage: authError || snapshot.message,
    storageError: snapshot.storageError, localCount: snapshot.localCount,
    retrySync: store.sync, importLocal: store.importLocal, isSyncConfigured: Boolean(client),
    sendMagicLink: async (email: string) => {
      if (!client) return { error: new Error('Cloud-Sync ist noch nicht eingerichtet.') }
      try { return await client.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}${window.location.pathname}` } }) }
      catch { return { error: new Error('Der Anmeldelink konnte nicht gesendet werden. Bitte erneut versuchen.') } }
    },
    signOut: async () => {
      if (!client) return
      const { error } = await client.auth.signOut()
      if (error) throw error
    },
  }
}
