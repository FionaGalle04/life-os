import { parseSessions, sortedSessions, type Session } from './workouts'

export const LEGACY_KEY = 'life-os-workouts-v1'
const cacheKey = (owner: string | null) => `life-os-sync-v2:${owner ?? 'local'}`
type Cache = { version: 2; sessions: Session[]; pending: string[]; removed: string[] }
export type SyncStatus = 'loading' | 'local' | 'syncing' | 'synced' | 'error'
export type Snapshot = { sessions: Session[]; ownerId: string | null; ready: boolean; status: SyncStatus; message: string; storageError: string; localCount: number }
export interface WorkoutRemote {
  load(ownerId: string): Promise<Session[]>
  save(ownerId: string, sessions: Session[]): Promise<void>
  remove(ownerId: string, ids: string[]): Promise<void>
}
const emptyCache = (): Cache => ({ version: 2, sessions: [], pending: [], removed: [] })
function readCache(storage: Storage, owner: string | null): Cache {
  const raw = storage.getItem(cacheKey(owner))
  if (!raw) {
    const legacy = storage.getItem(owner ? `${LEGACY_KEY}:${owner}` : LEGACY_KEY)
    const sessions = legacy ? parseSessions(JSON.parse(legacy)) : []
    return { ...emptyCache(), sessions, pending: owner ? sessions.map(s => s.id) : [] }
  }
  const parsed: unknown = JSON.parse(raw)
  if (!parsed || typeof parsed !== 'object' || !('version' in parsed) || parsed.version !== 2
    || !('sessions' in parsed) || !('pending' in parsed) || !('removed' in parsed)
    || !Array.isArray(parsed.pending) || !parsed.pending.every(id => typeof id === 'string')
    || !Array.isArray(parsed.removed) || !parsed.removed.every(id => typeof id === 'string')) throw new Error('Ungültiger Trainingsspeicher')
  return { version: 2, sessions: parseSessions(parsed.sessions), pending: parsed.pending, removed: parsed.removed }
}

// Persist only changed records in an outbox. A clean, stale cache must never
// recreate a workout deleted on another device.
export class WorkoutStore {
  private cache: Cache = emptyCache()
  private snapshot: Snapshot = { sessions: [], ownerId: null, ready: false, status: 'loading', message: 'Anmeldung wird geprüft …', storageError: '', localCount: 0 }
  private listeners = new Set<() => void>()
  private generation = 0
  private inFlight: Promise<void> | null = null
  private requested = false
  constructor(private storage: Storage, private remote: WorkoutRemote | null) {}
  getSnapshot = () => this.snapshot
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener) } }
  private update(patch: Partial<Snapshot>) {
    this.snapshot = { ...this.snapshot, ...patch }
    this.listeners.forEach(listener => listener())
  }
  switchOwner(ownerId: string | null) {
    ++this.generation
    this.requested = true
    try {
      this.cache = readCache(this.storage, ownerId)
      let localCount = 0
      try { localCount = ownerId ? readCache(this.storage, null).sessions.length : 0 } catch { /* The owner's cache remains usable. */ }
      this.update({ sessions: sortedSessions(this.cache.sessions), ownerId, ready: true, status: ownerId && this.remote ? 'syncing' : 'local', message: ownerId ? 'Trainings werden geladen …' : 'Auf diesem Gerät gespeichert', storageError: '', localCount })
      if (ownerId) void this.sync()
    } catch {
      this.cache = emptyCache()
      this.update({ ownerId, sessions: [], ready: true, status: 'error', message: 'Gespeicherte Trainings konnten nicht gelesen werden.', storageError: 'Der Trainingsspeicher ist nicht lesbar. Die vorhandenen Daten bleiben erhalten; Speichern ist gesperrt.', localCount: 0 })
    }
  }
  private persist(cache: Cache) {
    this.storage.setItem(cacheKey(this.snapshot.ownerId), JSON.stringify(cache))
    this.cache = cache
  }
  setSessions = (action: Session[] | ((current: Session[]) => Session[])): boolean => {
    if (!this.snapshot.ready || this.snapshot.storageError) return false
    try {
      const next = sortedSessions(parseSessions(typeof action === 'function' ? action(this.cache.sessions) : action))
      const changed = next.filter(row => JSON.stringify(row) !== JSON.stringify(this.cache.sessions.find(previous => previous.id === row.id))).map(row => row.id)
      const deleted = this.cache.sessions.filter(row => !next.some(newRow => newRow.id === row.id)).map(row => row.id)
      const nextIds = new Set(next.map(row => row.id))
      this.persist({ version: 2, sessions: next,
        pending: [...new Set([...this.cache.pending, ...changed])].filter(id => nextIds.has(id)),
        removed: [...new Set([...this.cache.removed, ...deleted])].filter(id => !nextIds.has(id)),
      })
      this.update({ sessions: next, message: this.snapshot.ownerId ? 'Lokal gespeichert; Synchronisierung folgt …' : 'Auf diesem Gerät gespeichert' })
      if (this.snapshot.ownerId) void this.sync()
      return true
    } catch {
      this.update({ message: 'Speichern fehlgeschlagen. Bitte exportiere deine Daten und prüfe den Gerätespeicher.' })
      return false
    }
  }
  importLocal = () => {
    try {
      const local = readCache(this.storage, null).sessions
      if (this.setSessions(current => [...current, ...local.filter(row => !current.some(existing => existing.id === row.id))])) this.update({ localCount: 0 })
    } catch { this.update({ message: 'Lokale Trainings konnten nicht übernommen werden.' }) }
  }
  sync = (): Promise<void> => {
    if (!this.remote || !this.snapshot.ownerId || this.snapshot.storageError) return Promise.resolve()
    if (this.inFlight) { this.requested = true; return this.inFlight }
    const owner = this.snapshot.ownerId
    const generation = this.generation
    const currentOwner = () => generation === this.generation
    const remote = this.remote
    this.requested = false
    this.update({ status: 'syncing', message: 'Trainings werden synchronisiert …' })
    this.inFlight = (async () => {
      do {
        this.requested = false
        const cloud = parseSessions(await remote.load(owner))
        if (!currentOwner()) return
        const merged = new Map(cloud.map(row => [row.id, row]))
        this.cache.removed.forEach(id => merged.delete(id))
        this.cache.sessions.filter(row => this.cache.pending.includes(row.id)).forEach(row => merged.set(row.id, row))
        this.persist({ ...this.cache, sessions: sortedSessions([...merged.values()]) })
        this.update({ sessions: this.cache.sessions })
        const writes = this.cache.sessions.filter(row => this.cache.pending.includes(row.id))
        const removed = [...this.cache.removed]
        if (removed.length) await remote.remove(owner, removed)
        if (!currentOwner()) return
        if (writes.length) await remote.save(owner, writes)
        if (!currentOwner()) return
        // Preserve a second edit made while a write was in flight.
        const acknowledged = writes.filter(row => JSON.stringify(row) === JSON.stringify(this.cache.sessions.find(next => next.id === row.id))).map(row => row.id)
        this.persist({ ...this.cache, pending: this.cache.pending.filter(id => !acknowledged.includes(id)), removed: this.cache.removed.filter(id => !removed.includes(id)) })
      } while (currentOwner() && (this.requested || this.cache.pending.length || this.cache.removed.length))
      if (currentOwner()) this.update({ status: 'synced', message: 'Mit deinem Konto synchronisiert' })
    })().catch(() => {
      if (currentOwner()) this.update({ status: 'error', message: 'Cloud-Sync fehlgeschlagen. Lokale Trainings bleiben erhalten. Bitte erneut versuchen.' })
    }).finally(() => {
      this.inFlight = null
      if (!currentOwner() && this.snapshot.ownerId) void this.sync()
    })
    return this.inFlight
  }
}
