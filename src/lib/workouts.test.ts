import { describe, expect, it } from 'vitest'
import { newDraft, parseSessions, sessionFromDraft, validDate } from './workouts'

describe('workout validation', () => {
  it('saves completed sets, accepts bodyweight and omits empty sets', () => {
    const draft = newDraft('Gym')
    draft.exercises[0].name = 'Liegestütze'
    draft.exercises[0].sets[0].reps = '12'
    const session = sessionFromDraft(draft)
    expect(session.exercises[0].sets).toHaveLength(1)
    expect(session.exercises[0].sets[0].weight).toBe('0')
    expect(session.id).toBe(draft.id)
  })
  it('rejects negative duration, impossible dates and incomplete sets', () => {
    const draft = newDraft('Laufen')
    draft.duration = '-1'
    expect(() => sessionFromDraft(draft)).toThrow(/Dauer/)
    expect(validDate('2026-02-30')).toBe(false)
    const gym = newDraft('Gym')
    gym.exercises[0].name = 'Kniebeugen'
    gym.exercises[0].sets[0].weight = '40'
    expect(() => sessionFromDraft(gym)).toThrow(/Wiederholungen/)
    gym.exercises[0].sets[0].reps = '8'
    gym.exercises[0].sets[0].rir = '12'
    expect(() => sessionFromDraft(gym)).toThrow(/RIR/)
  })
  it.each(['Radfahren', 'Laufen', 'Schwimmen'] as const)('persists endurance fields for %s', sport => {
    const draft = newDraft(sport)
    draft.distance = '0.5'; draft.elevation = '0'; draft.effort = '6'; draft.notes = 'Locker'
    expect(sessionFromDraft(draft)).toMatchObject({ sport, distance: '0.5', effort: '6', notes: 'Locker', exercises: [] })
  })
  it('rejects malformed imports rather than overwriting stored data', () => {
    expect(() => parseSessions([{ id: 'a', sport: 'unknown' }])).toThrow()
    const draft = newDraft('Laufen'); draft.distance = '4'
    const session = sessionFromDraft(draft)
    expect(() => parseSessions([session, session])).toThrow(/doppelt/)
  })
})
