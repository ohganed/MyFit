import type { WorkoutRecord } from '../storage/workoutStorage'

export type LifeRecord = {
  id: string
  kind: 'sleep' | 'meal' | 'energy' | 'bp' | 'weight'
  at: string
  value: number
  text: string
  secondary?: number
}
export const LIFE_STORAGE_KEY = 'myfit-life-v1'

function validRecord(value: unknown): value is LifeRecord {
  if (!value || typeof value !== 'object') return false
  const r = value as LifeRecord
  if (typeof r.id !== 'string' || !r.id || typeof r.at !== 'string' || !Number.isFinite(Date.parse(r.at)) || typeof r.text !== 'string' || typeof r.value !== 'number' || !Number.isFinite(r.value)) return false
  if (r.secondary !== undefined && (typeof r.secondary !== 'number' || !Number.isFinite(r.secondary))) return false
  switch (r.kind) {
    case 'sleep': return r.value >= 0 && r.value <= 24
    case 'energy': return Number.isInteger(r.value) && r.value >= 1 && r.value <= 5
    case 'meal': return r.value >= 0 && r.value <= 10000
    case 'weight': return r.value > 0 && r.value <= 500
    case 'bp': return r.value > 0 && r.value <= 300 && r.secondary !== undefined && r.secondary > 0 && r.secondary <= 250 && r.secondary < r.value
    default: return false
  }
}

// Reject the whole document: filtering invalid entries and writing back would lose data.
export function loadLifeRecords(): LifeRecord[] {
  const raw = localStorage.getItem(LIFE_STORAGE_KEY)
  if (raw === null) return []
  let parsed: unknown
  try { parsed = JSON.parse(raw) } catch { throw new Error('生活記録を読み取れません。保存済みデータは変更していません。') }
  if (!Array.isArray(parsed) || !parsed.every(validRecord) || new Set(parsed.map(r => r.id)).size !== parsed.length) throw new Error('生活記録の形式が不正です。保存済みデータは変更していません。')
  return parsed
}

export function saveLifeRecord(input: Omit<LifeRecord, 'id'>): LifeRecord[] {
  const record = { ...input, id: crypto.randomUUID() }
  if (!validRecord(record)) throw new Error('入力値と記録日時を確認してください。')
  const next = [record, ...loadLifeRecords()]
  localStorage.setItem(LIFE_STORAGE_KEY, JSON.stringify(next))
  return next
}

export function deleteLifeRecord(id: string): LifeRecord[] {
  const next = loadLifeRecords().filter(r => r.id !== id)
  localStorage.setItem(LIFE_STORAGE_KEY, JSON.stringify(next))
  return next
}

export function localDateKey(date: string | Date): string {
  // Date-only inputs are calendar dates, not UTC instants.
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date
  const d = typeof date === 'string' ? new Date(date) : date
  if (!Number.isFinite(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b)
  const i = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[i] : (sorted[i - 1] + sorted[i]) / 2
}

export function detectWorkoutChanges(history: WorkoutRecord[], now = new Date()): { id: string; title: string; detail: string }[] {
  const groups = new Map<string, { id: string; name: string; time: number; reps: number }[]>()
  for (const record of history) {
    const time = Date.parse(record.savedAt)
    if (!Number.isFinite(time) || time > now.getTime() || !Array.isArray(record.sets)) continue
    const loads = new Map<string, number[]>()
    for (const set of record.sets) {
      const reps = Number(set.reps)
      if (!Number.isFinite(reps) || reps <= 0 || set.durationSeconds) continue
      const fields = [set.weight, set.addedWeight, set.assistanceWeight]
      if (fields.some(v => v !== undefined && v !== '' && (!Number.isFinite(Number(v)) || Number(v) < 0))) continue
      const signature = fields.map(v => v === undefined || v === '' ? '-' : String(Number(v))).join('|')
      loads.set(signature, [...(loads.get(signature) ?? []), reps])
    }
    for (const [load, reps] of loads) {
      const key = `${record.exerciseId || record.exerciseName}:${load}`
      groups.set(key, [...(groups.get(key) ?? []), { id: record.id, name: record.exerciseName, time, reps: median(reps) }])
    }
  }
  const result: {id: string; title: string; detail: string}[] = []
  for (const [key, sessions] of groups) {
    sessions.sort((a, b) => b.time - a.time)
    const latest = sessions[0]
    if (now.getTime() - latest.time > 7 * 86400000) continue
    const prior = sessions.filter(s => s.time < latest.time && s.time >= latest.time - 21 * 86400000)
    if (prior.length < 5) continue
    const baseline = median(prior.map(s => s.reps))
    const mad = median(prior.map(s => Math.abs(s.reps - baseline)))
    const delta = latest.reps - baseline
    if (Math.abs(delta) < Math.max(2, baseline * 0.3, 3 * 1.4826 * mad)) continue
    result.push({ id: `${latest.id}:${key}`, title: `${latest.name}の回数に変化`, detail: `同じ負荷の直近記録は中央値${latest.reps}回。過去21日間の${prior.length}記録の中央値${baseline}回と比べ${delta > 0 ? '増加' : '減少'}しています。原因や体調の判断ではありません。` })
  }
  return result
}

export type FlowDay = { date: string; workoutCount: number; sleepHours: number | null; energy: number | null; weightKg: number | null; mealCount: number }
export function buildFlow(history: WorkoutRecord[], life: LifeRecord[], weights: readonly {weightKg: number; measuredAt: string}[], now = new Date()): FlowDay[] {
  const validLife = life.filter(r => validRecord(r) && Date.parse(r.at) <= now.getTime()).sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
  return Array.from({ length: 21 }, (_, i) => {
    const day = new Date(now)
    day.setDate(day.getDate() - 20 + i)
    const date = localDateKey(day)
    const records = validLife.filter(r => localDateKey(r.at) === date)
    const dayWeights = [
      ...records.filter(r => r.kind === 'weight').map(r => ({weightKg: r.value, measuredAt: r.at})),
      ...weights.filter(r => localDateKey(r.measuredAt) === date && Date.parse(r.measuredAt) <= now.getTime() && Number.isFinite(r.weightKg) && r.weightKg > 0),
    ].sort((a,b) => Date.parse(b.measuredAt) - Date.parse(a.measuredAt))
    return {date, workoutCount: history.filter(r => localDateKey(r.savedAt) === date && Date.parse(r.savedAt) <= now.getTime()).length,
      sleepHours: records.find(r => r.kind === 'sleep')?.value ?? null,
      energy: records.find(r => r.kind === 'energy')?.value ?? null,
      weightKg: dayWeights[0]?.weightKg ?? null,
      mealCount: records.filter(r => r.kind === 'meal').length}
  })
}
