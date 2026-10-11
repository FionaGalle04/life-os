import { beforeEach, describe, expect, it, vi } from 'vitest'
import { newDraft, sessionFromDraft, type Session } from './workouts'
import { LEGACY_KEY, WorkoutStore, type WorkoutRemote } from './workoutStore'

const workout = (title = 'Lauf'): Session => {
  const draft = newDraft('Laufen'); draft.distance = '5'; draft.title = title
  return sessionFromDraft(draft)
}
function remoteFixture() {
  const cloud = new Map<string, Session[]>()
  const remote: WorkoutRemote = {
    load: vi.fn(async owner => cloud.get(owner) ?? []),
    save: vi.fn(async (owner: string, rows: Session[]) => {
      const next = new Map((cloud.get(owner) ?? []).map(row => [row.id, row]))
      rows.forEach(row => next.set(row.id, row)); cloud.set(owner, [...next.values()])
    }),
    remove: vi.fn(async (owner, ids) => { cloud.set(owner, (cloud.get(owner) ?? []).filter(row => !ids.includes(row.id))) }),
  }
  return { cloud, remote }
}
const settled = async (store: WorkoutStore) => {
  await store.sync()
  // A requested successor sync after a change of owner may run in finally.
  await store.sync()
}
describe('durable workout storage and sync', () => {
  beforeEach(() => localStorage.clear())
  it('reloads locally and never writes over malformed storage', () => {
    const store = new WorkoutStore(localStorage, null); store.switchOwner(null)
    const session = workout(); expect(store.setSessions([session])).toBe(true)
    const reloaded = new WorkoutStore(localStorage, null); reloaded.switchOwner(null)
    expect(reloaded.getSnapshot().sessions).toEqual([session])
    localStorage.setItem('life-os-sync-v2:local', '{broken')
    reloaded.switchOwner(null)
    expect(reloaded.setSessions([])).toBe(false)
    expect(localStorage.getItem('life-os-sync-v2:local')).toBe('{broken')
  })
  it('reports local write failures without claiming success or losing the previous data', () => {
    const storage = { getItem: vi.fn(() => null), setItem: vi.fn(() => { throw new Error('quota') }) } as unknown as Storage
    const store = new WorkoutStore(storage, null); store.switchOwner(null)
    expect(store.setSessions([workout()])).toBe(false)
    expect(store.getSnapshot().sessions).toEqual([])
  })
  it('finishes sync, uploads edits and propagates deletes without reuploading clean records', async () => {
    const { cloud, remote } = remoteFixture()
    const store = new WorkoutStore(localStorage, remote); store.switchOwner('alice'); await settled(store)
    const session = workout(); store.setSessions([session]); await settled(store)
    expect(store.getSnapshot().status).toBe('synced')
    expect(cloud.get('alice')).toEqual([session])
    store.setSessions(current => current.map(row => ({ ...row, title: 'Bearbeitet' }))); await settled(store)
    expect(cloud.get('alice')?.[0].title).toBe('Bearbeitet')
    const saves = vi.mocked(remote.save).mock.calls.length
    await settled(store)
    expect(vi.mocked(remote.save).mock.calls).toHaveLength(saves)
    store.setSessions([]); await settled(store)
    expect(cloud.get('alice')).toEqual([])
  })
  it('does not resurrect remotely deleted records from a stale clean cache', async () => {
    const { cloud, remote } = remoteFixture(); const session = workout(); cloud.set('alice', [session])
    const store = new WorkoutStore(localStorage, remote); store.switchOwner('alice'); await settled(store)
    cloud.set('alice', [])
    const reloaded = new WorkoutStore(localStorage, remote); reloaded.switchOwner('alice'); await settled(reloaded)
    expect(reloaded.getSnapshot().sessions).toEqual([])
    expect(remote.save).not.toHaveBeenCalled()
  })
  it('retries pending edits and deletions after an offline reload', async () => {
    const { cloud, remote } = remoteFixture(); const session = workout(); cloud.set('alice', [session])
    const store = new WorkoutStore(localStorage, remote); store.switchOwner('alice'); await settled(store)
    vi.mocked(remote.load).mockRejectedValue(new Error('offline'))
    store.setSessions([]); await store.sync()
    expect(store.getSnapshot().status).toBe('error')
    const next = workout('Offline-Lauf'); store.setSessions([next]); await store.sync()
    vi.mocked(remote.load).mockImplementation(async owner => cloud.get(owner) ?? [])
    const reloaded = new WorkoutStore(localStorage, remote); reloaded.switchOwner('alice'); await settled(reloaded)
    expect(cloud.get('alice')).toEqual([next])
  })
  it('keeps a second edit made while the first upload is running', async () => {
    const { cloud, remote } = remoteFixture(); const store = new WorkoutStore(localStorage, remote)
    store.switchOwner('alice'); await settled(store)
    let finish!: () => void
    const normalSave = remote.save
    remote.save = vi.fn(async (owner, sessions) => { await new Promise<void>(resolve => { finish = resolve }); await normalSave(owner, sessions) })
    const session = workout(); store.setSessions([session])
    await vi.waitFor(() => expect(finish).toBeTypeOf('function'))
    remote.save = normalSave
    store.setSessions(current => current.map(row => ({ ...row, title: 'Neuester Stand' })))
    finish(); await settled(store)
    expect(cloud.get('alice')?.[0].title).toBe('Neuester Stand')
  })
  it('isolates owners even when an old request completes after switching accounts', async () => {
    const { cloud, remote } = remoteFixture(); const alice = workout('Alice'); const bob = workout('Bob')
    cloud.set('alice', [alice]); cloud.set('bob', [bob])
    let finish!: (sessions: Session[]) => void
    const load = remote.load
    remote.load = vi.fn((owner: string) => owner === 'alice' ? new Promise<Session[]>(resolve => { finish = resolve }) : load(owner))
    const store = new WorkoutStore(localStorage, remote); store.switchOwner('alice')
    store.switchOwner('bob'); finish([alice]); await settled(store)
    expect(store.getSnapshot().sessions).toEqual([bob])
    expect(localStorage.getItem('life-os-sync-v2:bob')).not.toContain('Alice')
    store.switchOwner(null)
    expect(store.getSnapshot().sessions).toEqual([])
  })
  it('migrates legacy local records without copying them into an account implicitly', async () => {
    const session = workout(); localStorage.setItem(LEGACY_KEY, JSON.stringify([session]))
    const { cloud, remote } = remoteFixture(); const store = new WorkoutStore(localStorage, remote)
    store.switchOwner(null); expect(store.getSnapshot().sessions).toEqual([session])
    store.switchOwner('alice'); await settled(store)
    expect(store.getSnapshot().sessions).toEqual([])
    expect(store.getSnapshot().localCount).toBe(1)
    store.importLocal(); await settled(store)
    expect(cloud.get('alice')).toEqual([session])
  })
})
