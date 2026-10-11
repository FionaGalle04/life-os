export const sports = ['Gym', 'Radfahren', 'Laufen', 'Schwimmen'] as const
export type Sport = typeof sports[number]
export type SetEntry = { id: string; weight: string; reps: string; rir: string; notes?: string }
export type Exercise = { id: string; name: string; sets: SetEntry[] }
export type Session = {
  id: string; sport: Sport; title: string; date: string; duration: number
  distance: string; exercises: Exercise[]; notes?: string; elevation?: string; effort?: string
}
export type WorkoutDraft = Omit<Session, 'id' | 'duration'> & { id?: string; duration: string }
export const uid = () => crypto.randomUUID()
export function today() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
export const newSet = (): SetEntry => ({ id: uid(), weight: '', reps: '', rir: '' })
export const newExercise = (name = ''): Exercise => ({ id: uid(), name, sets: [newSet(), newSet(), newSet()] })
export function newDraft(sport: Sport): WorkoutDraft {
  return { id: uid(), sport, title: sport === 'Gym' ? 'Ganzkörper' : sport, date: today(), duration: sport === 'Gym' ? '60' : '45', distance: '', exercises: sport === 'Gym' ? [newExercise()] : [], notes: '', elevation: '', effort: '' }
}
const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null
const text = (value: unknown): value is string => typeof value === 'string'
const optionalText = (value: unknown) => value === undefined || text(value)
const numericText = (value: unknown) => text(value) && (value === '' || Number.isFinite(Number(value)))
export function validDate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date
}
export function isSession(value: unknown): value is Session {
  return record(value) && text(value.id) && value.id.length > 0 && text(value.sport) && sports.some(s => s === value.sport)
    && text(value.title) && text(value.date) && validDate(value.date) && typeof value.duration === 'number' && Number.isFinite(value.duration) && value.duration >= 0
    && numericText(value.distance) && optionalText(value.notes) && optionalText(value.elevation) && optionalText(value.effort)
    && Array.isArray(value.exercises) && value.exercises.every(ex => record(ex) && text(ex.id) && text(ex.name) && Array.isArray(ex.sets)
      && ex.sets.every(set => record(set) && text(set.id) && numericText(set.weight) && numericText(set.reps) && numericText(set.rir) && optionalText(set.notes)))
}
export function parseSessions(value: unknown): Session[] {
  if (!Array.isArray(value) || !value.every(isSession)) throw new Error('Die Datei enthält keine gültigen Trainingsdaten.')
  if (new Set(value.map(session => session.id)).size !== value.length) throw new Error('Trainings-IDs sind doppelt vorhanden.')
  return value.filter(session => !session.id.startsWith('demo-'))
}
export const sortedSessions = (sessions: Session[]) => [...sessions].sort((a, b) => b.date.localeCompare(a.date))
export function sessionFromDraft(draft: WorkoutDraft): Session {
  if (!draft.title.trim()) throw new Error('Gib deinem Training einen Namen.')
  if (!validDate(draft.date)) throw new Error('Wähle ein gültiges Datum.')
  const duration = Number(draft.duration)
  if (!draft.duration || !Number.isInteger(duration) || duration <= 0 || duration > 1440) throw new Error('Die Dauer muss zwischen 1 und 1440 Minuten liegen.')
  let exercises: Exercise[] = []
  if (draft.sport === 'Gym') {
    exercises = draft.exercises.filter(ex => ex.name.trim() || ex.sets.some(set => set.weight || set.reps || set.rir || set.notes))
    if (!exercises.length) throw new Error('Ergänze mindestens eine Übung mit einem Satz.')
    exercises = exercises.map(ex => {
      if (!ex.name.trim()) throw new Error('Gib jeder Übung einen Namen.')
      const sets = ex.sets.filter(set => set.weight || set.reps || set.rir || set.notes)
      if (!sets.length) throw new Error(`Ergänze mindestens einen Satz für ${ex.name}.`)
      return { ...ex, name: ex.name.trim(), sets: sets.map(set => {
        if (!set.reps || !Number.isInteger(Number(set.reps)) || Number(set.reps) < 1 || Number(set.reps) > 1000) throw new Error(`${ex.name}: Wiederholungen müssen eine ganze Zahl von 1 bis 1000 sein.`)
        if (!Number.isFinite(Number(set.weight)) || Number(set.weight) < 0 || Number(set.weight) > 2000) throw new Error(`${ex.name}: Gib ein gültiges Gewicht ein (0 für Körpergewicht).`)
        if (set.rir !== '' && (!Number.isInteger(Number(set.rir)) || Number(set.rir) < 0 || Number(set.rir) > 10)) throw new Error(`${ex.name}: RIR muss zwischen 0 und 10 liegen.`)
        return { ...set, weight: set.weight || '0' }
      }) }
    })
  } else {
    if (!draft.distance || !Number.isFinite(Number(draft.distance)) || Number(draft.distance) <= 0) throw new Error('Gib eine Distanz größer als 0 km ein.')
    if (draft.elevation && (!Number.isFinite(Number(draft.elevation)) || Number(draft.elevation) < 0)) throw new Error('Höhenmeter dürfen nicht negativ sein.')
    if (draft.effort && (!Number.isInteger(Number(draft.effort)) || Number(draft.effort) < 1 || Number(draft.effort) > 10)) throw new Error('Die Belastung muss zwischen 1 und 10 liegen.')
  }
  return { ...draft, id: draft.id ?? uid(), title: draft.title.trim(), duration, distance: draft.sport === 'Gym' ? '' : draft.distance, exercises }
}
export function readDraft(key: string): WorkoutDraft | null {
  const raw = localStorage.getItem(key)
  if (!raw) return null
  const value: unknown = JSON.parse(raw)
  if (!record(value) || !text(value.duration) || (value.id !== undefined && !text(value.id))) throw new Error('Der Entwurf konnte nicht gelesen werden. Die gespeicherten Daten bleiben erhalten.')
  if (!isSession({ ...value, id: value.id ?? 'draft', duration: Number(value.duration) || 0 })) throw new Error('Der Entwurf konnte nicht gelesen werden. Die gespeicherten Daten bleiben erhalten.')
  return value as WorkoutDraft
}
