import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './supabase'

export type Sport = 'Gym' | 'Radfahren' | 'Laufen' | 'Schwimmen'
export type SetEntry = { id: string; weight: string; reps: string; rir: string }
export type Exercise = { id: string; name: string; sets: SetEntry[] }
export type Session = {
  id: string
  sport: Sport
  title: string
  date: string
  duration: number
  distance: string
  exercises: Exercise[]
}

const STORAGE_KEY = 'life-os-workouts-v1'
const userStorageKey = (userId: string) => `${STORAGE_KEY}:${userId}`
const isRealSession = (session: Session) => !session.id.startsWith('demo-')

function readSessions(key: string, fallback: Session[]): Session[] {
  try {
    const stored = localStorage.getItem(key)
    const parsed: unknown = stored ? JSON.parse(stored) : fallback
    return Array.isArray(parsed) ? parsed as Session[] : fallback
  } catch {
    return fallback
  }
}

function mergeSessions(...lists: Session[][]): Session[] {
  const merged = new Map<string, Session>()
  for (const list of lists) {
    for (const session of list) {
      if (session && typeof session.id === 'string' && isRealSession(session)) {
        merged.set(session.id, session)
      }
    }
  }
  return [...merged.values()].sort((a, b) => b.date.localeCompare(a.date))
}

export function useWorkoutSync(fallback: Session[]) {
  const [sessions, setSessions] = useState<Session[]>(() => readSessions(STORAGE_KEY, fallback))
  const [user, setUser] = useState<User | null>(null)
  const [sessionsOwnerId, setSessionsOwnerId] = useState<string | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'loading' | 'local' | 'syncing' | 'synced' | 'error'>('loading')
  const [syncMessage, setSyncMessage] = useState('')
  const lastSyncedIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true)
      setSyncStatus('local')
      setSyncMessage('Nur auf diesem Gerät gespeichert')
      return
    }

    let active = true
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      setUser(data.session?.user ?? null)
      setAuthReady(true)
      if (error) {
        setSyncStatus('error')
        setSyncMessage('Anmeldung konnte nicht geprüft werden.')
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return
      setUser(session?.user ?? null)
      if (event === 'SIGNED_OUT') {
        setSessionsOwnerId(null)
        setSessions(fallback)
        lastSyncedIds.current = new Set()
      }
      setAuthReady(true)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!authReady) return
    const client = supabase
    if (!user || !client) {
      setSyncStatus('local')
      setSyncMessage('Nur auf diesem Gerät gespeichert')
      return
    }

    let active = true
    setSyncStatus('syncing')
    setSyncMessage('Trainings werden synchronisiert …')

    const load = async () => {
      const legacy = readSessions(STORAGE_KEY, []).filter(isRealSession)
      const cached = readSessions(userStorageKey(user.id), []).filter(isRealSession)
      const { data, error } = await client
        .from('workout_sessions')
        .select('id, session')
        .order('created_at', { ascending: false })

      if (!active) return
      if (error) {
        setSyncStatus('error')
        setSyncMessage('Synchronisierung fehlgeschlagen. Lokale Daten bleiben erhalten.')
        return
      }

      const cloud = (data ?? []).map(row => row.session as Session)
      const merged = mergeSessions(cloud, legacy, cached)
      if (merged.length) {
        const { error: saveError } = await client
          .from('workout_sessions')
          .upsert(merged.map(session => ({ id: session.id, session })), { onConflict: 'id' })
        if (!active) return
        if (saveError) {
          setSyncStatus('error')
          setSyncMessage('Synchronisierung fehlgeschlagen. Lokale Daten bleiben erhalten.')
          return
        }
      }

      localStorage.setItem(userStorageKey(user.id), JSON.stringify(merged))
      if (legacy.length) localStorage.removeItem(STORAGE_KEY)
      lastSyncedIds.current = new Set(merged.map(session => session.id))
      setSessionsOwnerId(user.id)
      setSessions(merged.length ? merged : readSessions(userStorageKey(user.id), fallback).filter(isRealSession))
      setSyncStatus('synced')
      setSyncMessage('Auf diesem Gerät synchronisiert')
    }

    void load()
    return () => { active = false }
  }, [authReady, user?.id, fallback])

  useEffect(() => {
    if (!authReady) return

    if (!user || !supabase) {
      if (sessionsOwnerId !== null) return
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
      return
    }
    if (sessionsOwnerId !== user.id) return

    const realSessions = sessions.filter(isRealSession)
    localStorage.setItem(userStorageKey(user.id), JSON.stringify(realSessions))
    if (syncStatus !== 'synced') return

    const nextIds = new Set(realSessions.map(session => session.id))
    const removedIds = [...lastSyncedIds.current].filter(id => !nextIds.has(id))
    lastSyncedIds.current = nextIds

    let active = true
    setSyncStatus('syncing')
    setSyncMessage('Trainings werden synchronisiert …')
    const save = async () => {
      if (removedIds.length) {
        const { error } = await client
          .from('workout_sessions')
          .delete()
          .in('id', removedIds)
        if (error) throw error
      }
      if (realSessions.length) {
        const { error } = await client
          .from('workout_sessions')
          .upsert(realSessions.map(session => ({ id: session.id, session })), { onConflict: 'id' })
        if (error) throw error
      }
      if (active) {
        setSyncStatus('synced')
        setSyncMessage('Auf diesem Gerät synchronisiert')
      }
    }

    void save().catch(() => {
      if (active) {
        setSyncStatus('error')
        setSyncMessage('Synchronisierung fehlgeschlagen. Lokale Daten bleiben erhalten.')
      }
    })
    return () => { active = false }
  }, [authReady, user?.id, sessions, sessionsOwnerId, syncStatus])

  const resetSessions = () => {
    if (!window.confirm('Trainingsjournal und synchronisierte Trainings wirklich zurücksetzen?')) return
    setSessions(fallback)
  }

  const sendMagicLink = async (email: string) => {
    if (!supabase) return { error: new Error('Supabase ist noch nicht konfiguriert.') }
    return supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.href },
    })
  }

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut()
  }

  return {
    sessions,
    setSessions: setSessions as Dispatch<SetStateAction<Session[]>>,
    user,
    syncStatus,
    syncMessage,
    resetSessions,
    sendMagicLink,
    signOut,
    isSyncConfigured: Boolean(supabase),
  }
}
